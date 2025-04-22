const sequelize = require('../models/index').sequelize;
const Game = require('../models/game');

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
    try {
        const game = await Game.findOne({ where: { id: gameId } });
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        if (game.UserId !== req.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        res.status(200).json(game);
    } catch (error) {
        console.error("Error fetching game:", error);
        res.status(500).json({ error: 'Failed to fetch game' });
    }
};


const updateGame = async (req, res) => {
    const { gameId } = req.params;
    const { round, gold, lives } = req.body;
    console.log("Update game request:", round, gold, lives);

    try {
        const game = await Game.findOne({ where: { id: gameId } });
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        if (game.UserId !== req.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        if (round !== undefined) game.round = round;
        if (gold !== undefined) game.gold = gold;
        if (lives !== undefined) game.lives = lives;

        await game.save();
        res.status(200).json(game);
    } catch (error) {
        console.error("Error updating game:", error);
        res.status(500).json({ error: 'Failed to update game' });
    }
};


module.exports = { createGame, getGameById, updateGame };
