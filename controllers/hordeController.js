const sequelize = require('../models/index').sequelize;
const Game = require('../models/game');
const Tower = require('../models/tower');
const Projectile = require('../models/projectile');
const Enemy = require('../models/enemy');


const generateHorde = async (req, res) => {
  const { gameId } = req.params;

  if (!gameId) return res.status(400).json({ error: 'Missing gameId' });

  const rawPath = [
    { x: 160, y: 740 },
    { x: 160, y: 600 },
    { x: 260, y: 600 },
    { x: 260, y: 222 },
    { x: 815, y: 222 },
    { x: 815, y: 170 },
    { x: 850, y: 170 },
    { x: 850, y: 140 },
    { x: 1020, y: 140 },
    { x: 1020, y: 0 },
  ];

  const towerPositions = [
    { position: 1, x: 230, y: 645 },
    { position: 2, x: 325, y: 420 },
    { position: 3, x: 165, y: 390 },
    { position: 4, x: 262, y: 132 },
    { position: 5, x: 582, y: 132 },
    { position: 6, x: 647, y: 260 },
    { position: 7, x: 870, y: 70 },
  ];

  try {
    const towers = await Tower.findAll({ where: { gameId } });

    const towerZones = towerPositions.map(tower => {
      const towerData = towers.find(t => t.position === tower.position);
      if (!towerData) return null;

      return {
        position: tower.position,
        name: towerData.name,
        x: tower.x,
        y: tower.y,
        range: towerData.range,
        damage: towerData.damage,
        fire_rate: towerData.fire_rate,
        dps: towerData.damage / towerData.fire_rate
      };
    }).filter(Boolean);

    const fullPath = interpolatePath(rawPath);

    const coverageByTower = towerZones.map(tower => {
      let pixelsCovered = 0;

      for (const cell of fullPath) {
        const distance = Math.hypot(tower.x - cell.x, tower.y - cell.y);
        if (distance <= tower.range) {
          pixelsCovered++;
        }
      }

      return {
        position: tower.position,
        name: tower.name,
        pixelsCovered,
        dps: tower.dps,
        fire_rate: tower.fire_rate,
        damage: tower.damage,
      };
    });

    const totalPixelsCovered = coverageByTower.reduce((sum, t) => sum + t.pixelsCovered, 0);

    const enemySpeed = 30; 
    let totalDamage = 0;

    for (const tower of coverageByTower) {
      const timeInRange = tower.pixelsCovered / enemySpeed;
      const towerImpacts = Math.ceil(timeInRange / tower.fire_rate);
      const damage =  towerImpacts * tower.damage;
      totalDamage += damage;
    }

    const enemyHealth = Math.ceil(totalDamage + 1);

    return res.json({
      totalPathPixels: fullPath.length,
      coverageByTower,
      totalPixelsCovered,
      enemy: {
        speed: enemySpeed,
        health: enemyHealth
      }
    });

  } catch (error) {
    console.error('Error generating horde:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



function interpolatePath(path, step = 1) {
  const fullPath = [];

  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i + 1];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.hypot(dx, dy);
    const steps = Math.floor(distance / step);

    for (let j = 0; j <= steps; j++) {
      const x = start.x + (dx / steps) * j;
      const y = start.y + (dy / steps) * j;
      fullPath.push({ x, y });
    }
  }

  return fullPath;
}

module.exports = { generateHorde };
