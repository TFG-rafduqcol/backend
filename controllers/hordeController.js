const sequelize = require('../models/index').sequelize;
const Game = require('../models/game');
const Tower = require('../models/tower');
const Projectile = require('../models/projectile');
const Enemy = require('../models/enemy');



const generateHorde = async (req, res) => {
  const { gameId } = req.params;
  const spacingTime = 1.5; // segundos entre enemigos

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
    { position: 1, x: 255, y: 670},
    { position: 2, x: 350, y: 445},
    { position: 3, x: 190, y: 415 },
    { position: 4, x: 287, y: 157 },
    { position: 5, x: 607, y: 157 },
    { position: 6, x: 672, y: 285 },
    { position: 7, x: 895, y: 95 }
  ];

  try {
    const towersData = await Tower.findAll({ where: { gameId } });
    const enemyTypes = await Enemy.findAll();

    const fullPath = interpolatePath(rawPath);

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

    let bestEnemies = [];
    let bestTotalHealth = 0;
    let bestTotalDamage = 0;
    let bestDiff = Infinity;

    for (let enemyCount = 1; enemyCount <= 50; enemyCount++) {
      const enemies = [];

      for (let e = 0; e < enemyCount; e++) {
        const spawnTime = e * spacingTime;
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

        enemies.push({
          id: e + 1,
          spawnTime,
          speed: randomType.speed, // velocidad individual
          health: randomType.health,
          name: randomType.name,
          avatar: randomType.avatar,
          resistance: randomType.resistance,
          hits: {}
        });
      }

      // Simular disparos para cada torre
      for (const tower of towerZones) {
        const maxSimTime = Math.max(...enemies.map(e => (fullPath.length / e.speed + e.spawnTime)));
        let nextFireTime = 0;
        const timeStep = 0.1;

        for (let t = 0; t <= maxSimTime; t += timeStep) {
          if (t < nextFireTime) continue;

          const target = enemies.find(enemy => {
            if (enemy.spawnTime > t) return false;
            const timeOnPath = t - enemy.spawnTime;
            const distance = timeOnPath * enemy.speed;
            if (distance >= fullPath.length) return false;

            const index = Math.min(Math.ceil(distance), fullPath.length - 1);
            const point = fullPath[index];
            const distToTower = Math.hypot(point.x - tower.x, point.y - tower.y);

            return distToTower <= tower.range;
          });

          if (target) {
            if (!target.hits[tower.position]) {
              target.hits[tower.position] = 0;
            }
            target.hits[tower.position] += 1;
            nextFireTime = t + tower.fire_rate;
          }
        }
      }

      // Calcular daños e impactos con el multiplicador de daño
      let totalHealth = 0;
      let totalDamage = 0;

      for (const enemy of enemies) {
        let enemyDamage = 0;
        for (const towerId in enemy.hits) {
          const tower = towerZones.find(t => t.position == towerId);
          if (tower) {
            // Aplicar el multiplicador de daño según el tipo de enemigo y torre
            const damageMultiplier = getDamageMultiplier(enemy.name, tower.name);
            enemyDamage += tower.damage * enemy.hits[towerId] * damageMultiplier;
          }
        }

        totalDamage += enemyDamage;
        totalHealth += enemy.health;
      }

      // Si la salud total es menor o igual al daño total, descartamos esta horda
      if (totalHealth <= totalDamage) {
        continue;
      }

      const diff = Math.abs(totalDamage - totalHealth);
      if (diff < bestDiff) {
        bestEnemies = enemies.map(e => ({ ...e }));
        bestTotalHealth = totalHealth;
        bestTotalDamage = totalDamage;
        bestDiff = diff;

        if (diff === 0) break;
      }
    }

    //  Printear los impactos que recibieron los enemigos
    for (const enemy of bestEnemies) {
      console.log(`Enemy ${enemy.name} hits:`);
      for (const towerId in enemy.hits) {
        const tower = towerZones.find(t => t.position == towerId);
        if (tower) {
          console.log(`  Tower ${tower.name}: ${enemy.hits[towerId]} hits`);
        }
        //Printear el daño total que recibió el enemigo
        const towerDamage = tower.damage * enemy.hits[towerId] * getDamageMultiplier(enemy.name, tower.name);
        console.log(`  Total damage from Tower ${tower.name}: ${towerDamage}`);
      }
      
    }

      // Printear el dano de todas las torres vs el dano que puede recibir todos los enemigos
      console.log('-------------------Total Damage vs Total Health---------------------------');
      console.log(`  Total Damage: ${bestTotalDamage}`);
      console.log(`  Total Health: ${bestTotalHealth}`);
      console.log(`  Difference: ${bestDiff}`);
  
      
  
    return res.json({
      pathPixels: fullPath.length,
      towers: towerZones,
      enemies: bestEnemies,
      totalHealth: bestTotalHealth,
      totalDamage: bestTotalDamage,
      diff: bestDiff
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


function getDamageMultiplier(enemyName, towerName) {
  const damageMultipler = {
    devilOrc: { stoneCannon: 0.5, ironCannon: 0.5, inferno: 2.0 },
    oculom: { mortar: 0 },
    graySkull: { mortar: 2.0 },
    carrionTropper: { stoneCannon: 0.5, ironCannon: 0.5, inferno: 2.0, mortar: 0.5 },
    hellBat: { mortar: 0 },
    darkSeer: { stoneCannon: 0.5, ironCannon: 0.5, inferno: 0.5, mortar: 0.75 }
  };

  if (enemyName in damageMultipler && towerName in damageMultipler[enemyName]) {
    return damageMultipler[enemyName][towerName];
  } else {
    return 1; 
  }
}

module.exports = { generateHorde };
