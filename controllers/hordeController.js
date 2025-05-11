const sequelize = require('../models/index').sequelize;
const Game = require('../models/game');
const Tower = require('../models/tower');
const Projectile = require('../models/projectile');
const Enemy = require('../models/enemy');
const Upgrade = require('../models/upgrade');


const generateHorde = async (req, res) => {
  const { gameId } = req.params;
  const spacingTime = 1.5; // segundos entre enemigos
  const MAX_HORDE_SIZE = 10;
  const POPULATION_SIZE = 30;
  const GENERATIONS = 40;
  const MUTATION_RATE = 0.1;

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
    { position: 7, x: 895, y: 95 },
  ];

  try {
    const towersData = await Tower.findAll({ where: { gameId } });
    const enemyTypes = await Enemy.findAll();
    const fullPath = interpolatePath(rawPath);

    const towerZones = towerPositions.map(t => {
      const d = towersData.find(x => x.position === t.position);
      if (!d) return null;
      return {
        position: t.position,
        name: d.name,
        x: t.x,
        y: t.y,
        range: d.range,
        damage: d.damage,
        fire_rate: d.fire_rate
      };
    }).filter(Boolean);

    function randomHorde() {
      const size = Math.ceil(Math.random() * MAX_HORDE_SIZE);
      return Array.from({ length: size }, () =>
        enemyTypes[Math.floor(Math.random() * enemyTypes.length)]
      );
    }


    // Mas adelante se puede optimiza el algoritmo en vez de hacerlo cada 0.1s, hacerlo con el fire_rate de cada torre una vez detecte a un enemigo
   
   function simulateHits(horde) {
  horde.forEach(enemy => {
    enemy.hits = {};
    enemy.healthRemaining = enemy.health;
    enemy.isDead = false;
  });

  towerZones.forEach(tower => {
    const maxT = Math.max(
      ...horde.map(e => fullPath.length / e.speed + e.spawnTime)
    );

    let nextFire = 0;

    for (let t = 0.0; t <= maxT; t += 0.1) {
      if (t < nextFire) continue;

    const enemiesInRange = horde
  .filter(e => {
    if (e.healthRemaining <= 0 || e.spawnTime > t) return false;

    const dist = (t - e.spawnTime) * e.speed;
    if (dist >= fullPath.length) return false;

    const index = Math.min(Math.ceil(dist), fullPath.length - 1);
    const point = fullPath[index];
    const dx = point.x - tower.x;
    const dy = point.y - tower.y;
    const d = Math.hypot(dx, dy);

    const isFlying = ['oculom', 'hellBat'].includes(e.name);
    if (tower.name === 'mortar' && isFlying) return false;

    return d <= tower.range;
  })
  .map(e => ({
    enemy: e,
    distanceTraveled: (t - e.spawnTime) * e.speed
  }))
  .sort((a, b) => b.distanceTraveled - a.distanceTraveled); // más avanzado primero

const target = enemiesInRange.length > 0 ? enemiesInRange[0].enemy : null;

      if (target) {
        target.hits[tower.position] = (target.hits[tower.position] || 0) + 1;

        const mult = getDamageMultiplier(target.name, tower.name);
        const realDamage = tower.damage * mult;
        target.healthRemaining -= realDamage;

        if (target.healthRemaining <= 0) {
          target.healthRemaining = 0;
          target.isDead = true;
        }

        nextFire = t + tower.fire_rate;
      }
    }
  });
}


    const UPRGRADE_RATIO = 1.1; // Mejora de la horda respecto a la tower damage del 10%

    function fitness(horde) {
      horde.forEach((e, i) => e.spawnTime = i * spacingTime);
      simulateHits(horde);

      const totalHealth = horde.reduce((sum, e) => sum + e.health, 0);
      const totalDamage = horde.reduce((acc, e) => {
        let damageToEnemy = 0;
        for (const pos in e.hits) {
          const tower = towerZones.find(t => t.position == pos);
          if (!tower) continue;
          const mult = getDamageMultiplier(e.name, tower.name);
          const damage = tower.damage * e.hits[pos] * mult;
          damageToEnemy += damage; // Parano hacer sobreestimaciones en el daño total 
        }
        return acc + Math.min(damageToEnemy, e.health);
      }, 0);


      const requiredDamage = totalHealth * UPRGRADE_RATIO;

      if (totalDamage < requiredDamage) return -Infinity;
      return -Math.abs(totalHealth - totalDamage * UPRGRADE_RATIO);
    }

    function select(pop) {
      const contestants = [
        pop[Math.floor(Math.random() * pop.length)],
        pop[Math.floor(Math.random() * pop.length)],
        pop[Math.floor(Math.random() * pop.length)]
      ];
      return contestants.reduce((best, cur) =>
        fitness(cur) > fitness(best) ? cur : best
      );
    }

    function crossover(a, b) {
      if (a.length < 2 || b.length < 2) return Math.random() < 0.5 ? [...a] : [...b];
      const cut = Math.floor(Math.random() * Math.min(a.length, b.length));
      const child = [...a.slice(0, cut), ...b.slice(cut)];
      return child.slice(0, MAX_HORDE_SIZE);
    }

    function mutate(h) {
      return h.map(e =>
        Math.random() < MUTATION_RATE
          ? enemyTypes[Math.floor(Math.random() * enemyTypes.length)]
          : e
      );
    }

    let population = Array.from({ length: POPULATION_SIZE }, randomHorde);

    for (let gen = 0; gen < GENERATIONS; gen++) {
      const newPop = [];
      for (let i = 0; i < POPULATION_SIZE; i++) {
        const p1 = select(population);
        const p2 = select(population);
        let child = crossover(p1, p2);
        child = mutate(child);
        newPop.push(child);
      }
      population = newPop;
    }

    const best = population.reduce((b, c) => (fitness(c) > fitness(b) ? c : b));

    const result = best.map((e, i) => ({
      id: i + 1,
      spawnTime: i * spacingTime,
      speed: e.speed,
      health: e.health,
      name: e.name
    }));

    let bestTotalHealth = 0;
    let bestTotalDamage = 0;

    best.forEach((e, i) => e.spawnTime = i * spacingTime);
    simulateHits(best);

    best.forEach(e => {
      bestTotalHealth += e.health;
      for (const pos in e.hits) {
        const tower = towerZones.find(t => t.position == pos);
        if (!tower) continue;
        const mult = getDamageMultiplier(e.name, tower.name);
        bestTotalDamage += Math.min(tower.damage * e.hits[pos] * mult, e.health);
      }
    });

   const score = fitness(population[0]);
  console.log("Fitness:", score);

  const totalHealth = population[0].reduce((sum, e) => sum + e.health, 0);
  const totalDamage = population[0].reduce((acc, e) => {
    let damageToEnemy = 0;
    for (const pos in e.hits) {
      const tower = towerZones.find(t => t.position == pos);
      if (!tower) continue;
      const mult = getDamageMultiplier(e.name, tower.name);
      const damage = tower.damage * e.hits[pos] * mult;
      damageToEnemy += damage;
    }
    return acc + Math.min(damageToEnemy, e.health);
  }, 0);

  const required = totalHealth * UPRGRADE_RATIO;
  console.log(`Total Health: ${totalHealth.toFixed(2)}`);
  console.log(`Total Damage Dealt: ${totalDamage.toFixed(2)}`);
  console.log(`Required Damage (ratio ${UPRGRADE_RATIO}): ${required.toFixed(2)}`);

  //Printear el numero de impactos que recibira cada enemigo
  best.forEach(e => {
    console.log(`Enemy ${e.name} will receive hits:`);
    let totalDamage = 0;
    for (const pos in e.hits) {
      const tower = towerZones.find(t => t.position == pos);
      if (!tower) continue;
      const mult = getDamageMultiplier(e.name, tower.name);
      const damage = tower.damage * e.hits[pos] * mult;
      totalDamage += damage;
      console.log(`  Tower ${tower.name} (${tower.position}): ${e.hits[pos]} hits, Damage: ${damage}`);
    }
    const finalDamage = Math.min(totalDamage, e.health);  
    console.log(`Total Damage: ${finalDamage}`);
  });


    return res.json({
      pathPixels: fullPath.length,
      towers: towerZones,
      enemies: result,
      totalHealth: bestTotalHealth,
      totalDamage: bestTotalDamage,
      diff: bestTotalHealth - bestTotalDamage * UPRGRADE_RATIO
    });

  } catch (err) {
    console.error(err);
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

// Función auxiliar para generar el producto cartesiano con repetición
function cartesianProduct(arr, length) {
  if (length === 1) return arr.map(e => [e]);
  const prev = cartesianProduct(arr, length - 1);
  const result = [];
  for (const p of prev) {
    for (const e of arr) {
      result.push([...p, e]);
    }
  }
  return result;
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
