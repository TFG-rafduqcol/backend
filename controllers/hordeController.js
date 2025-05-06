const sequelize = require('../models/index').sequelize;
const Game = require('../models/game');
const Tower = require('../models/tower');
const Projectile = require('../models/projectile');
const Enemy = require('../models/enemy');

const generateHorde = async (req, res) => {
  const { gameId } = req.params;
  const enemyCount = 3;
  const spacingTime = 1.5; // segundos entre enemigos
  const enemySpeed = 30; // píxeles por segundo

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
    { position: 1, x: 255, y: 670 },
    { position: 2, x: 350, y: 445 },
    { position: 3, x: 190, y: 415 },
    { position: 4, x: 287, y: 157 },
    { position: 5, x: 607, y: 157 },
    { position: 6, x: 672, y: 285 },
    { position: 7, x: 895, y: 95 }
  ];



  try {
    const towersData = await Tower.findAll({ where: { gameId } });

    const towerZones = towerPositions.map(tower => {
      const towerData = towersData.find(t => t.position === tower.position);
      if (!towerData) return null;

      return {
        position: tower.position,
        name: towerData.name,
        x: tower.x,
        y: tower.y,
        range: towerData.range,
        damage: towerData.damage,
        fire_rate: towerData.fire_rate
      };
    }).filter(Boolean);

    const fullPath = interpolatePath(rawPath); // Camino con interpolación

    const enemies = [];
    for (let e = 0; e < enemyCount; e++) {
      const spawnTime = e * spacingTime;
      enemies.push({
        id: e + 1,
        spawnTime,
        speed: enemySpeed,
        health: 0,
        hits: {}
      });
    }

    // Simulación de disparos
    for (const tower of towerZones) {
      const maxSimTime = (fullPath.length / enemySpeed) + (enemyCount * spacingTime);
      let nextFireTime = 0; // Tiempo en el que la torre puede volver a disparar
      const timeStep = 0.1; // Intervalo de tiempo para la simulación
    
      for (let t = 0; t <= maxSimTime; t += timeStep) {
        if (t < nextFireTime) continue; // Aún no puede disparar
    
        const target = enemies.find(enemy => {
          if (enemy.spawnTime > t) return false;
    
          const timeOnPath = t - enemy.spawnTime;
          if (timeOnPath < 0) return false;
    
          const distance = timeOnPath * enemy.speed;
          if (distance >= fullPath.length) return false;
    
          const index = Math.min(Math.ceil(distance), fullPath.length - 1);
          const point = fullPath[index];         
           const distToTower = Math.hypot(point.x - tower.x, point.y - tower.y);
    
          if (distToTower <= tower.range) {
            console.log(`Enemigo a ${distToTower.toFixed(2)} px de la torre ${tower.position} en el tiempo ${t}`);
            return true;
          }
          return false;
        });
    
        if (target) {
          if (!target.hits[tower.position]) {
            target.hits[tower.position] = 0;
          }
          target.hits[tower.position] += 1;
          tower.targetId = target.id;
    
          nextFireTime = t + tower.fire_rate; // Actualiza el tiempo del siguiente disparo
        }
      }
    }
    

    for (const enemy of enemies) {
      let totalDamage = 0;

      // Sumar el daño de todas las torres que dispararon al enemigo
      for (const [towerPosition, impactCount] of Object.entries(enemy.hits)) {
        const tower = towerZones.find(t => t.position == towerPosition);
        if (tower) {
          totalDamage += impactCount * tower.damage;
        }
      }

      // La vida final del enemigo es suficiente para que sobreviva al último golpe
      enemy.health = totalDamage + 1; // +1 para que sobreviva justo el último impacto
    }

    // Mostrar los impactos de cada enemigo
    console.log('Enemy hits:', enemies.map(enemy => ({ id: enemy.id, hits: enemy.hits })));

    return res.json({
      pathPixels: fullPath.length,
      towers: towerZones,
      enemies
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
