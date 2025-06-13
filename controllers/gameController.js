const sequelize = require('../models/index').sequelize;
const Game = require('../models/game');
const User = require('../models/user');
const HordeQualityLog = require('../models/hordeQualityLog');
const stats = require('../models/stats');

const createGame = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const loggedUserId = req.userId;
      const { path, hardMode } = req.body;
  
      const game = await Game.create({
        path,
        hardMode,
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
    const { lostedLives } = req.body;
    const transaction = await sequelize.transaction();
    
    try {

        const game = await Game.findOne({ where: { id: gameId }, transaction });
        const gameRound = game.round;
        const gameGold = game.gold;

        const hordeQualityLog = await HordeQualityLog.findOne({
          where: {
            gameId,
            round: gameRound
          }
        });

        let hordeQuality = 100;
        const HIGH_ROUND = 40;
        const MID_ROUND = 25;
        const MANY_LIVES = 5; 

        if (lostedLives && lostedLives >= MANY_LIVES && gameRound < MID_ROUND) {
          hordeQuality -= lostedLives * 5; 
        }
        if (lostedLives && lostedLives >= MANY_LIVES && gameGold < 100) {
          hordeQuality -= lostedLives * 4; 
        }
        if (lostedLives && lostedLives > 0 && gameRound >= MID_ROUND && gameRound < HIGH_ROUND) {
          hordeQuality -= lostedLives * 2;
        }
        hordeQuality = Math.max(0, Math.round(hordeQuality));
      
        hordeQualityLog.quality = hordeQuality;
        await hordeQualityLog.save();
      
        const playerStats = await stats.findOne({ where: { userId: req.userId }, transaction }); 

        if (gameRound > playerStats.rounds_passed) playerStats.rounds_passed = gameRound;
        playerStats.games_played++;
        playerStats.gems_earned = gameRound;

        const isHardMode = game.isHardMode;
        const player = await User.findByPk(req.userId);

        if (player.rangeId === 3 && gameRound >= 50 && !isHardMode) {
            player.rangeId = 2;
        }
        else if (player.rangeId === 2 && gameRound >= 50 && isHardMode) {
            player.rangeId = 1; 
        }
        await player.save();
        await playerStats.save({ transaction });

    } catch (error) {
        await transaction.rollback();
        console.error("Error ending game:", error);
        res.status(500).json({ error: 'Failed to end game' });
    }
};


module.exports = { createGame, getGameById, updateGame, endGame };
