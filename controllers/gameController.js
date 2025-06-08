const sequelize = require('../models/index').sequelize;
const Game = require('../models/game');
const User = require('../models/user');

const createGame = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const loggedUserId = req.userId;
      const { path } = req.body;
  
      const game = await Game.create({
        path,
        UserId: loggedUserId,
      }, { transaction });
  
      await transaction.commit();
      res.status(201).json(game);
    } catch (error) {
      await transaction.rollback();
      console.error("Error creating game:", error);
      res.status(500).json({ error: 'Failed to create game' });
    }
  };


const getGameById = async (req, res) => {
    const { gameId } = req.params;
    const transaction = await sequelize.transaction();
    try {
        const game = await Game.findOne({ 
            where: { id: gameId },
            transaction
        });
        
        if (!game) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Game not found' });
        }

        if (game.UserId !== req.userId) {
            await transaction.rollback();
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        await transaction.commit();
        res.status(200).json(game);
    } catch (error) {
        await transaction.rollback();
        console.error("Error fetching game:", error);
        res.status(500).json({ error: 'Failed to fetch game' });
    }
};


const updateGame = async (req, res) => {
    const { gameId } = req.params;
    const { round, gold, lives } = req.body;
    const transaction = await sequelize.transaction();

    try {
        const game = await Game.findOne({ 
            where: { id: gameId },
            transaction
        });
        
        if (!game) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Game not found' });
        }

        if (game.UserId !== req.userId) {
            await transaction.rollback();
            return res.status(403).json({ error: 'Forbidden' });
        }

        if (round !== undefined) game.round = round;
        if (gold !== undefined) game.gold = gold;
        if (lives !== undefined) game.lives = lives;

        await game.save({ transaction });
        await transaction.commit();
        res.status(200).json(game);
    } catch (error) {
        await transaction.rollback();
        console.error("Error updating game:", error);
        res.status(500).json({ error: 'Failed to update game' });
    }
};


const endGame = async (req, res) => {
    const { gameId } = req.params;
    const transaction = await sequelize.transaction();
    
    try {
        const game = await Game.findOne({ 
            where: { id: gameId },
            transaction
        });
        
        if (!game) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Game not found' });
        }

        if (game.UserId !== req.userId) {
            await transaction.rollback();
            return res.status(403).json({ error: 'Forbidden' });
        }

        const loggedInUserId = req.userId;
        const loggedUser = await User.findByPk(loggedInUserId, { transaction });
        
        if (!loggedUser) {
            await transaction.rollback();
            return res.status(404).json({ error: 'User not found' });
        }

        const gameRound = game.round;

        if (gameRound >= 50) {
            loggedUser.rangeId = 1; // Rango Master id 1
        }

        await loggedUser.save({ transaction });
        
        game.completed = true;
        await game.save({ transaction });
        
        await transaction.commit();
        res.status(200).json({ 
            message: 'Game ended successfully',
            round: gameRound,
            xpEarned: gameRound * 200,
            gemsEarned: gameRound * 1,
            newRank: gameRound >= 50 ? 'Master' : null
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Error ending game:", error);
        res.status(500).json({ error: 'Failed to end game' });
    }
};


module.exports = { createGame, getGameById, updateGame, endGame };
