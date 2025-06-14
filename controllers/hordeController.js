const sequelize = require('../models/index').sequelize;
const Game = require('../models/game');
const Tower = require('../models/tower');
const Projectile = require('../models/projectile');
const Enemy = require('../models/enemy');
const Upgrade = require('../models/upgrade');
const HordeQualityLog = require('../models/hordeQualityLog');
const stats = require('../models/stats');
const { json } = require('sequelize');
const hordeQualityLog = require('../models/hordeQualityLog');



const generateHorde = async (req, res) => {
  const { gameId } = req.params;
  const { earnedGold, lostedLives, enemiesKilled } = req.body;  
  const spacingTime   = 1.5;  // segundos entre enemigos
  const MAX_HORDE_SIZE = 20;
  const POPULATION_SIZE = 30;
  const GENERATIONS    = 60;
  const MUTATION_RATE  = 0.1;

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
   
    const game = await Game.findOne({ where: { id: gameId } });
    let gameRound = game.round;  
    const gameGold = game.gold + earnedGold; 

    if (gameRound > 0) {

        const hordeQualityLog = await HordeQualityLog.findOne({
          where: {
            gameId,
            round: gameRound
          }
        });

        let hordeQuality = 100;
        const HIGH_ROUND = 40;
        const MID_ROUND = 25;
        const MANY_LIVES = 5; 

        if (lostedLives && lostedLives >= MANY_LIVES && gameRound < MID_ROUND) {
          hordeQuality -= lostedLives * 5; 
        }
        if (lostedLives && lostedLives >= MANY_LIVES && gameGold < 100) {
          hordeQuality -= lostedLives * 4; 
        }
        if (lostedLives && lostedLives > 0 && gameRound >= MID_ROUND && gameRound < HIGH_ROUND) {
          hordeQuality -= lostedLives * 2;
        }
        hordeQuality = Math.max(0, Math.round(hordeQuality));
      
        hordeQualityLog.quality = hordeQuality;
        await hordeQualityLog.save();
      }

      const playerStats = await stats.findOne({ where: { userId: req.userId } }); 
      
      playerStats.enemiesKilled += enemiesKilled;
      playerStats.gold += earnedGold;

      await playerStats.save();

    const towersData   = await Tower.findAll({ where: { gameId } });
    const enemyTypes   = await Enemy.findAll();
    const fullPath     = interpolatePath(rawPath);

    // Zonas de torre
    const towerZones = towerPositions
      .map(tp => {
        const d = towersData.find(t => t.position === tp.position);
        if (!d) return null;
        return {
          position:  tp.position,
          name:      d.name,
          x:         tp.x,
          y:         tp.y,
          range:     d.range,
          damage:    d.damage,
          fire_rate: d.fire_rate
        };
      })
      .filter(Boolean);
    
    const isHardMode = game.hardMode;
    
    function randomHorde() {
        const size = Math.ceil(Math.random() * MAX_HORDE_SIZE);
        return Array.from({ length: size }, () => {
          const et = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
          return { ...et.get(), spawnTime: 0 }; 
        });
      }

    let UPRG_RATIO = 1; // La vida de los enemigos se ajusta al daño que las torres pueden infligir,
    const roundMap = {  // Segun la ronda, se ajusta el ratio UPRG
      30: 0.1,
      40: 0.2,
      50: 0.3,
      60: 0.4,
      70: 0.5,
    };

    if (gameRound > 1 && gameGold > 120) {   // Si la ronda es mayor a 1 y el oro es mayor a 120, se aumenta el ratio UPRG en  1 por cada 1000 de oro, hasta un máximo de 1
      UPRG_RATIO += Math.min(gameGold / 1000, 1);  // Ademas se aumenta el ratio UPRG en 0.1 por cada 10 ronda (apartir de la 30), hasta un máximo de 1.5
      if (gameRound in roundMap) {
        UPRG_RATIO += roundMap[gameRound];
      } else if (gameRound > 70) {
        UPRG_RATIO += roundMap[70];
      }
    } else if (gameRound < 1) {  // La ronda 0 es una ronda especial, donde se genera una horda de enemigos con un ratio UPRG de 0.85, ya que es la primera ronda del juego
      UPRG_RATIO = 0.85;
    } else {                     // Se aumenta el ratio UPRG en 0.1 por cada 10 ronda (apartir de la 30), hasta un máximo de 1.5
      if (gameRound in roundMap) {
        UPRG_RATIO += roundMap[gameRound];
      } else if (gameRound > 70) {
        UPRG_RATIO += roundMap[70];
      }
    }
    gameRound++;


    // Función fitness, dada una horda, calcula su "aptitud" en base a la salud total, daño total y el ratio UPRG
   function fitness(horde) {
      for (let i = 0; i < horde.length; i++) {
        horde[i].spawnTime = i * spacingTime;
      }
      if (isHardMode) {                // Dependiendo del modo de juego, usamos una función diferente para simular los hits
        simulateHitsStepwise(horde, towerZones, fullPath);
      } else {
        simulateHits(horde, towerZones, fullPath);
      }

      let totalHealth = 0;
      for (let i = 0; i < horde.length; i++) {
        totalHealth += horde[i].health;
      }

      let totalDamage = 0;
      let maxEndTime  = 0;
      for (let i = 0; i < horde.length; i++) {  // Para cada enemigo en la horda, calculamos el daño total que recibiría
        const e = horde[i];

        const travelTime = fullPath.length / e.speed + e.spawnTime;
        if (travelTime > maxEndTime) maxEndTime = travelTime;

        let dmg = 0;
        for (const pos in e.hits) {
          const tw = towerZones.find(t => t.position === Number(pos));
          if (!tw) continue;
          const multE = getDamageMultiplier(e.name, tw.name);
          dmg += tw.damage * e.hits[pos] * multE;
        }
        totalDamage += Math.min(dmg, e.health);   // Así evitamos desfases en la salud total que infligen las torres
      }

      if (totalDamage < totalHealth * UPRG_RATIO) {  // Si el daño total es menor que la salud total multiplicada por el ratio UPRG, devolvemos un valor muy negativo
        return -Infinity;
      }

      const diff = Math.abs(totalHealth - totalDamage * UPRG_RATIO);    // Calculamos la diferencia entre la salud total y el daño total ajustado por el ratio UPRG

      const dps = totalDamage / maxEndTime;      

      const wDiff = 1000;   // Penalizamos mucho la diferencia entre salud y daño ajustado
      const wDps  = 1;      // Penalizamos menos el daño por segundo

      return -wDiff * diff + wDps * dps;  // Buscamos maximizar el DPS y minimizar la diferencia entre salud y daño ajustado
    }


      function select(pop) {
        const c = [
          pop[Math.floor(Math.random() * pop.length)],
          pop[Math.floor(Math.random() * pop.length)],
          pop[Math.floor(Math.random() * pop.length)]
        ];
        return c.reduce((b, c) => fitness(c) > fitness(b) ? c : b);
      }

      function crossover(a, b) {
        if (a.length < 2 || b.length < 2) return Math.random() < 0.5 ? [...a] : [...b];
        const cut = Math.floor(Math.random() * Math.min(a.length, b.length));
        return [...a.slice(0, cut), ...b.slice(cut)].slice(0, MAX_HORDE_SIZE);
      }
      
      function mutate(h) {
        return h.map(e =>
          Math.random() < MUTATION_RATE
            ? randomHorde()[0]
            : e
        );
      }

      const ELITE_COUNT = 1; 
      let population = Array.from({ length: POPULATION_SIZE }, randomHorde);

      for (let gen = 0; gen < GENERATIONS; gen++) {
        population.sort((a, b) => fitness(b) - fitness(a));
        const next = [];
      
        for (let i = 0; i < ELITE_COUNT; i++) {
          next.push(population[i]);
        }

        while (next.length < POPULATION_SIZE) {
          const p1 = select(population);
          const p2 = select(population);
          let child = crossover(p1, p2);
          child = mutate(child);
          next.push(child);
        }

        population = next;
      }


      const best = population.reduce((b, c) => fitness(c) > fitness(b) ? c : b);
      best.forEach((e, i) => e.spawnTime = i * spacingTime);
      if (isHardMode) {
        simulateHitsStepwise(best, towerZones, fullPath);
      } else {
        simulateHits(best, towerZones, fullPath);
      }

      const result = best.map((e, i) => ({
        id:         i + 1,
        spawnTime:  e.spawnTime,
        speed:      e.speed,
        health:     e.health,
        name:       e.name
      }));

      let bestH = 0, bestD = 0;
      best.forEach(e => {
        bestH += e.health;
        totalDamage = 0;
        for (const pos in e.hits) {
          const tw = towerZones.find(t => t.position == pos);
          if (!tw) continue;
          totalDamage += tw.damage * e.hits[pos] * getDamageMultiplier(e.name, tw.name);
        }
        bestD += Math.min(totalDamage, e.health);
      });

      // Printear cuantos hits le dan a cada enemigo y cuanto daño le hacen
      console.log('Best Horde values: \n Best Health:', bestH, '\n Best Damage:', bestD);
      //Printeamos el valor del ratio 
      console.log('UPRG_RATIO:', UPRG_RATIO);

      best.forEach(e => {
        console.log('Enemy:', e.name);
        for (const pos in e.hits) {
          const tw = towerZones.find(t => t.position == pos);
          if (!tw) continue;
          const multE = getDamageMultiplier(e.name, tw.name);
          console.log(`  Tower ${tw.position} (${tw.name}) hits: ${e.hits[pos]}`);
        }
      });

      game.round = gameRound;
      game.gold = gameGold;
      await game.save();
      
      const hordeLogStrings = best.map(e => {
        const hitsStr = Object.entries(e.hits)
          .map(([pos, val]) => `${pos}: ${val}`)
          .join(', ');
        return `Enemy: ${e.name}, Hits: {${hitsStr}}`;
      });
      const towerPositionsLog = towerZones.map(t => `${t.name}: ${t.position}`);

      await HordeQualityLog.create({
        hordeLog: hordeLogStrings,
        towerPositions: towerPositionsLog,
        round: game.round,
        gameId: game.id,
      });
      
      return res.json({
        pathPixels:  fullPath.length,
        towers:      towerZones,
        enemies:     result,
        totalHealth: bestH,
        totalDamage: bestD,
        diff:        bestH - bestD * UPRG_RATIO
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



function simulateHits(horde, towerZones, fullPath) {
    horde.forEach(e => {                   // Añadimos a los enemigos los hits, la salud restante y el estado de muerte
            e.hits = {};
            e.healthRemaining = e.health;
            e.isDead = false;
          });;

      const events = [];    /// Array para almacenar los eventos de disparo de las torres

      for (const tower of towerZones) {       // Registramos los eventos de disparo de las torres
        let t = 0;
        const maxT = Math.max(...horde.map(e => fullPath.length / e.speed + e.spawnTime));  // Tiempo máximo hasta que el último enemigo llegue al final del camino
        while (t <= maxT) {                   // Mientras el último enemigo no haya llegado al final del camino
          events.push({ time: t, type: 'fire', tower });
          t += tower.fire_rate;
        }
      }

      events.sort((a, b) => a.time - b.time);

      for (const event of events) {

        const { time, tower } = event;

        const target = horde.find(e => {
          if (e.healthRemaining <= 0 || e.spawnTime > time) return false;     // Si el enemigo ya está muerto o no ha aparecido aún, lo ignoramos
          const dist = (time - e.spawnTime) * e.speed;
          if (dist >= fullPath.length) return false;                          // Si el enemigo ha llegado al final del camino, lo ignoramos

          const idx = Math.min(Math.ceil(dist), fullPath.length - 1);    
          const pt = fullPath[idx];
          const d2 = Math.hypot(pt.x - tower.x, pt.y - tower.y);              // Calculamos la distancia entre la torre y el enemigo
          if (tower.name === 'mortar' && ['oculom', 'hellBat'].includes(e.name)) return false;  // Si la torre es un mortero y el enemigo es volador, lo ignoramos

          return d2 <= tower.range;                                           // Si la distancia es menor o igual al rango de la torre, el enemigo es un objetivo válido
        });

        if (!target) continue;

        const mult = getDamageMultiplier(target.name, tower.name);            // Usamos la función auxiliar getDamageMultiplier para obtener el multiplicador de daño
        const dmg = tower.damage * mult;

        target.hits[tower.position] = (target.hits[tower.position] || 0) + 1; // Registramos el hit de la torre al enemigo
        target.healthRemaining -= dmg;                             
        if (target.healthRemaining <= 0) {
          target.healthRemaining = 0;
          target.isDead = true;
        }
      }
    }

function simulateHitsStepwise(horde, towerZones, fullPath) {

    horde.forEach(enemy => {                  // Al igual que en simulateHits, añadimos a los enemigos los hits, la salud restante y el estado de muerte
      enemy.hits = {};
      enemy.healthRemaining = enemy.health;
      enemy.isDead = false;
    });

    towerZones.forEach(tower => {               
      const maxT = Math.max(
        ...horde.map(e => fullPath.length / e.speed + e.spawnTime)
      );

      let nextFire = 0;

      for (let t = 0.0; t <= maxT; t += 0.1) {   // Se define un step de 0.1 segundos para simular el tiempo
        if (t < nextFire) continue;              // Si aún no es el momento de disparar, continuamos al siguiente paso

        const enemiesInRange = horde.filter(e => {
          if (e.healthRemaining <= 0 || e.spawnTime > t) return false;   // Si el enemigo ya está muerto o no ha aparecido aún, lo ignoramos

          const dist = (t - e.spawnTime) * e.speed;
          if (dist >= fullPath.length) return false;                     // Si el enemigo ha llegado al final del camino, lo ignoramos

          const index = Math.min(Math.ceil(dist), fullPath.length - 1);
          const point = fullPath[index];
          const dx = point.x - tower.x;
          const dy = point.y - tower.y;
          const d = Math.hypot(dx, dy);                                  // Calculamos la distancia entre la torre y el enemigo        

          const isFlying = ['oculom', 'hellBat'].includes(e.name);
          if (tower.name === 'mortar' && isFlying) return false;

          return d <= tower.range;                                      // Si la distancia es menor o igual al rango de la torre, el enemigo es un target válido
        }).map(e => ({
          enemy: e,
          distanceTraveled: (t - e.spawnTime) * e.speed
        }))
        .sort((a, b) => b.distanceTraveled - a.distanceTraveled); 

        const target = enemiesInRange.length > 0 ? enemiesInRange[0].enemy : null;

        if (target) {                                                    // Si hay un target válido, procedemos a calcular el daño
          target.hits[tower.position] = (target.hits[tower.position] || 0) + 1; 

          const mult = getDamageMultiplier(target.name, tower.name);
          const realDamage = tower.damage * mult;
          target.healthRemaining -= realDamage;

          if (target.healthRemaining <= 0) {
            target.healthRemaining = 0;
            target.isDead = true;
          }

          nextFire = t + tower.fire_rate;                              // Actualizamos el tiempo del próximo disparo de la torre (segun la cadencia)
        }
      }
  });
}

function getDamageMultiplier(enemyName, towerName) {
  const damageMultipler = {
    devilOrc: { stoneCannon: 0.5, ironCannon: 0.5, inferno: 2.0 },
    graySkull: { mortar: 2.0 },
    carrionTropper: { stoneCannon: 0.5, ironCannon: 0.5, inferno: 2.0, mortar: 0.5 },
    darkSeer: { stoneCannon: 0.5, ironCannon: 0.5, inferno: 0.5, mortar: 0.75 },
    hellBat: { 1: 1, 2: 1, 3: 0.5 },   

  };

  if (enemyName in damageMultipler && towerName in damageMultipler[enemyName]) {
    return damageMultipler[enemyName][towerName];
  } else {
    return 1; 
  }
}



module.exports = { generateHorde };
