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
             });
        await transaction.commit();
        res.status(201).json(game);
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error: 'Failed to create game' });
    }

}


module.exports = { createGame };
