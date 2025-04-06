const sequelize = require('../models/index').sequelize;
const Game = require('../models/game');
const Tower = require('../models/tower');
const Projectile = require('../models/projectile');
const Upgrade = require('../models/upgrade');



const deployTower = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {

        const loggedInUserId = req.userId;
        const { gameId, name, position } = req.body;
        
        const game = await Game.findOne({ 
            where: { id: gameId, userId: loggedInUserId },
            lock: transaction.LOCK.UPDATE, 
            transaction 
        });

        if (!game) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Game not found or user not authorized' });
        }

        const existingTower = await Tower.findOne({
            where: { gameId, position },
            include: [{ 
                model: Game, 
                as: 'game',  
                attributes: ['id'] 
            }],
            transaction
        });

        if (existingTower) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Tower already exists at this position' });
        }

        const towerProperties = {
            canon: { cost: 100, damage: 10, fire_rate: 3, range: 40, projectile_type: 'bullet' },
            magic: { cost: 125,  damage: 12, fire_rate: 2.5, range: 50, projectile_type: 'magic_ball' },
            mortar: { cost: 150,  damage: 15, fire_rate: 4, range: 60, projectile_type: 'bomb' },
            archer: { cost: 120,  damage: 15, fire_rate: 4, range: 60, projectile_type: 'arrow' },
        };
        
        if (!towerProperties[name]) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Invalid tower name' });
        }

        if (game.gold < towerProperties[name].cost) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Not enough gold to deploy this tower' });
        }

        game.gold -= towerProperties[name].cost;
        await game.save({ transaction });
        const projectile = await Projectile.findOne({
            where: { name: towerProperties[name].projectile_type },
            attributes: ['id'],
            transaction
        });

        if (!projectile) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Projectile not found for this tower' });
        }

        const upgrades = {
            canon: { cost: 100, damage_boost: 0.01, range_boost: 0.015, fire_rate_boost: 0.015 },
            magic: { cost: 125, damage_boost: 0.02, range_boost: 0.01, fire_rate_boost: 0.01 },
            mortar: { cost: 150, damage_boost: 0.03, range_boost: 0.02, fire_rate_boost: 0.005 },
            archer: { cost: 120, damage_boost: 0.03, range_boost: 0.02, fire_rate_boost: 0.005 },

        };

        const newUpgrade = await Upgrade.create({
            level: 0,
            cost: upgrades[name].cost,
            damage_boost: upgrades[name].damage_boost,
            range_boost: upgrades[name].range_boost,
            fire_rate_boost: upgrades[name].fire_rate_boost,
        }, { transaction });

        const { damage, fire_rate, cost, range } = towerProperties[name];
        const newTower = await Tower.create({
            gameId,
            name,
            cost,
            damage,
            fire_rate,
            range,
            position,
            projectileId: projectile.id,
            upgradeId: newUpgrade.id,
        }, { transaction });

        await transaction.commit();
        res.status(200).json({ message: 'Tower deployed successfully', tower: newTower });
    } catch (error) {
        await transaction.rollback(); 
        res.status(500).json({ error: 'Failed to deploy tower', details: error.message });
    }
};


const upgradeTower = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { towerId } = req.params;
        const tower = await Tower.findByPk(towerId);

        if (!tower) {
            return res.status(404).json({ error: 'Tower not found' });
        }

        const loggedInUserId = req.userId;

        const game = await Game.findOne({ where: { id: tower.gameId, userId: loggedInUserId } });
        if (!game) {
            return res.status(404).json({ error: 'Game not found or user not authorized' });
        }

        const upgrade = await Upgrade.findByPk(tower.upgradeId);
        if (game.gold < upgrade.cost) {
            return res.status(400).json({ error: 'Not enough gold to upgrade this tower' });
        }

        const porcentaje = (tower.cost * 0.1) * (upgrade.level || 1) / 100;
        const newLevel = upgrade.level + 1;
        const upgradeCost = upgrade.cost;
        const newUpgradeCost =  upgradeCost + upgradeCost * porcentaje;

        game.gold -= upgradeCost;
        await game.save({ transaction });

        upgrade.level = newLevel;
        upgrade.cost = newUpgradeCost;
        upgrade.damage_boost += upgrade.damage_boost * newLevel;
        upgrade.range_boost += upgrade.range_boost * newLevel;
        upgrade.fire_rate_boost += upgrade.fire_rate_boost * newLevel;
        await upgrade.save({ transaction });

        tower.cost += upgradeCost;
        tower.damage += tower.damage * upgrade.damage_boost;
        tower.fire_rate += tower.fire_rate * upgrade.range_boost;
        tower.range += tower.range * upgrade.range_boost;
        await tower.save({ transaction });

        await transaction.commit();
        res.status(200).json({ message: 'Tower upgraded successfully', tower });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error: 'Failed to upgrade tower' });
    }
}

const deleteTower = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { towerId } = req.params;
        const tower = await Tower.findByPk(towerId);

        if (!tower) {
            return res.status(404).json({ error: 'Tower not found' });
        }
        const loggedInUserId = req.userId;

        const game = await Game.findOne({ where: { id: tower.gameId, userId: loggedInUserId } });
        if (!game) {
            return res.status(404).json({ error: 'Game not found or user not authorized' });
        }

        game.gold += tower.cost * 0.5;  
        await game.save({ transaction });


        await tower.destroy({ transaction });
        await transaction.commit();
        res.status(200).json({ message: 'Tower deleted successfully' });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ error: 'Failed to delete tower' });
    }
}

module.exports = { deployTower, upgradeTower, deleteTower };