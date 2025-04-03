const Game = require('../models/game');
const Tower = require('../models/tower');
const Projectile = require('../models/projectile');
const createGame = async (req, res) => {
    try {
        const loggedUserId = req.userId;
        const { path } = req.body;
        const game = await Game.create({ 
            path, 
            UserId: loggedUserId,
             });
        res.status(201).json(game);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create game' });
    }

}

const deployTower = async (req, res) => {
    try {
        const loggedInUserId = req.userId;
        const { gameId, name, position } = req.body;
        
        const game = await Game.findOne({ where: { id: gameId, userId: loggedInUserId } });

        if (!game) {
            return res.status(404).json({ error: 'Game not found or user not authorized' });
        }
          
       const existingTower = await Tower.findOne({
           where: { gameId, position },
           include: [{ 
               model: Game, 
               as: 'game',  
               attributes: ['id'] 
           }]
       });

        if (existingTower) {
            return res.status(400).json({ error: 'Tower already exists at this position' });
        }

        const towerProperties = {
            canon: {  cost: 100, fire_rate: 1, range: 0.4, projectile_type: 'bullet' },
            magic: {  cost: 125, fire_rate: 0.8, range: 0.5, projectile_type: 'magic_ball' },
            mortar: {  cost: 150, fire_rate: 0.3, range: 0.6, projectile_type: 'bomb' },
        };

        if (!towerProperties[name]) {
            return res.status(400).json({ error: 'Invalid tower name' });
        }
        
        const projectile = await Projectile.findOne({
            where: { name: towerProperties[name].projectile_type },
            attributes: ['id'],
        });
        
        if (!projectile) {
            return res.status(400).json({ error: 'Projectile not found for this tower' });
        }

        const { fire_rate, cost, range } = towerProperties[name];
        const newTower = await Tower.create({
            gameId,
            name,
            cost,
            fire_rate,
            range,
            position,
            projectileId: projectile.id,
            gameId: gameId, 
        });

        res.status(200).json({ message: 'Tower deployed successfully', tower: newTower });
    } catch (error) {
        res.status(500).json({ error: 'Failed to deploy tower' });
    }
}

module.exports = { createGame, deployTower };
