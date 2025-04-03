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

module.exports = { createGame };
