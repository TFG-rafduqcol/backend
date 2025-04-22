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

module.exports = { createGame, getGameById };
