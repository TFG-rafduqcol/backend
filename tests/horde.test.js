jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

const request = require('supertest');
const app = require('../server');
const { sequelize, User, Game, Tower, Enemy, hordeQualityLog, Stats } = require('../models/index');
const jwt = require('jsonwebtoken');
const { authorizedRequestWithOutToken, authorizedRequestWithBadToken } = require('./utils');

describe('Horde Routes', () => {
  let transaction;
  const user = { id: 1, isAdmin: false };
  const mockToken = jwt.sign(user, process.env.JWT_SECRET || 'secret');

  beforeAll(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/hordes/generateHorde/:gameId', () => {
    const ENDPOINT = '/api/hordes/generateHorde/1';
    const payload = { earnedGold: 100, lostedLives: 2, enemiesKilled: 5 };

    test('200 - Horde generated successfully', async () => {
      jest.spyOn(Game, 'findOne').mockResolvedValue({ id: 1, round: 1, gold: 100, hardMode: false, save: jest.fn() });
      jest.spyOn(Tower, 'findAll').mockResolvedValue([
        { position: 1, name: 'stoneCannon', range: 100, damage: 10, fire_rate: 1, x: 255, y: 670 }
      ]);
      jest.spyOn(Enemy, 'findAll').mockResolvedValue([
        { get: () => ({ name: 'orc', health: 50, speed: 1, lifes: 1, gold: 10 }) }
      ]);
      jest.spyOn(hordeQualityLog, 'create').mockResolvedValue({});
      jest.spyOn(hordeQualityLog, 'findOne').mockResolvedValue({ quality: 100, save: jest.fn() });
      jest.spyOn(User, 'findByPk').mockResolvedValue({ id: 1 });
      jest.spyOn(User, 'findOne').mockResolvedValue({ id: 1 });
      jest.spyOn(Stats, 'findOne').mockResolvedValue({ userId: 1, enemiesKilled: 0, gold: 0, save: jest.fn() });
      const res = await request(app)
        .post(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(payload);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('enemies');
      expect(res.body).toHaveProperty('totalHealth');
      expect(res.body).toHaveProperty('totalDamage');
    }, 20000);

    test('401 - Missing token', async () => {
      const res = await authorizedRequestWithOutToken(ENDPOINT, 'post', payload);
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/token is missing/i);
    });

    test('403 - Invalid token', async () => {
      const res = await authorizedRequestWithBadToken(ENDPOINT, 'post');
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/invalid|expired token/i);
    });

    test('400 - Missing gameId', async () => {
      const res = await request(app)
        .post('/api/hordes/generateHorde/')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(payload);
      expect([400, 404]).toContain(res.status); 
    });

    test('500 - DB error', async () => {
      jest.spyOn(Game, 'findOne').mockRejectedValue(new Error('DB crash'));
      const res = await request(app)
        .post(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(payload);
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/internal server error/i);
    });
  });
});
