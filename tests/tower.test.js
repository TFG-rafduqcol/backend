jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

const request = require('supertest');
const app = require('../server');
const { sequelize, User, Game, Tower, Projectile, Upgrade, Stats } = require('../models/index');
const jwt = require('jsonwebtoken');
const  { authorizedRequestWithOutToken, authorizedRequestWithBadToken } = require('./utils');

describe('Tower Routes', () => {
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

  describe('POST /api/towers/deployTower', () => {
    const ENDPOINT = '/api/towers/deployTower';
    const payload = { gameId: 1, name: 'stoneCannon', position: 1 };

    test('200 OK - tower deployed successfully', async () => {
      jest.spyOn(Game, 'findOne').mockResolvedValue({
        id: 1,
        userId: 1,
        gold: 500,
        save: jest.fn()
      });
      jest.spyOn(Tower, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(Projectile, 'findOne').mockResolvedValue({ id: 1 });
      jest.spyOn(Upgrade, 'create').mockResolvedValue({ id: 1, level: 1 });
      jest.spyOn(Tower, 'create').mockResolvedValue({ id: 1 });
      jest.spyOn(Stats, 'findOne').mockResolvedValue({ towers_deployed: 0, save: jest.fn() });
      const transaction = { LOCK: { UPDATE: 'UPDATE' }, commit: jest.fn(), rollback: jest.fn() };
      jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
      const res = await request(app)
        .post(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(payload);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/tower deployed successfully/i);
      expect(res.body.tower).toBeDefined();
    });

    test('400 if tower already exists at this position', async () => {
      jest.spyOn(Game, 'findOne').mockResolvedValue({ id: 1, userId: 1, gold: 500, save: jest.fn() });
      jest.spyOn(Tower, 'findOne').mockResolvedValueOnce({ id: 1 });
      const transaction = { LOCK: { UPDATE: 'UPDATE' }, commit: jest.fn(), rollback: jest.fn() };
      jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
      const res = await request(app)
        .post(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(payload);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/tower already exists/i);
    });

    test('400 if invalid tower name', async () => {
      jest.spyOn(Game, 'findOne').mockResolvedValue({ id: 1, userId: 1, gold: 500, save: jest.fn() });
      jest.spyOn(Tower, 'findOne').mockResolvedValue(null);
      const transaction = { LOCK: { UPDATE: 'UPDATE' }, commit: jest.fn(), rollback: jest.fn() };
      jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
      const res = await request(app)
        .post(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ ...payload, name: 'invalidTower' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid tower name/i);
    });

    test('400 if not enough gold to deploy tower', async () => {
      jest.spyOn(Game, 'findOne').mockResolvedValue({ id: 1, userId: 1, gold: 0, save: jest.fn() });
      jest.spyOn(Tower, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(Projectile, 'findOne').mockResolvedValue({ id: 1 });
      const transaction = { LOCK: { UPDATE: 'UPDATE' }, commit: jest.fn(), rollback: jest.fn() };
      jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
      const res = await request(app)
        .post(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(payload);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/not enough gold/i);
    });

    test('401 if token is missing', async () => {
      const res = await authorizedRequestWithOutToken(ENDPOINT, 'post', payload);
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/token is missing/i);
    });

    test('403 if token is invalid', async () => {
      const res = await authorizedRequestWithBadToken(ENDPOINT, 'post');
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/invalid|expired token/i);
    });

    test('404 if game not found or user not authorized', async () => {
      jest.spyOn(Game, 'findOne').mockResolvedValue(null);
      const transaction = { LOCK: { UPDATE: 'UPDATE' }, commit: jest.fn(), rollback: jest.fn() };
      jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
      const res = await request(app)
        .post(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(payload);
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/game not found/i);
    });

    test('500 if DB error', async () => {
      jest.spyOn(Game, 'findOne').mockRejectedValue(new Error('DB Crash'));
      const res = await request(app)
        .post(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(payload);
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/failed to deploy tower/i);
    });


  

  });

  describe('PUT /api/towers/upgradeTower/:towerId', () => {
    const ENDPOINT = '/api/towers/upgradeTower/1';

    test('200 OK - tower upgraded successfully', async () => {
      const mockTower = { id: 1, gameId: 1, upgradeId: 1, cost: 100, damage: 10, fire_rate: 2, range: 90, save: jest.fn() };
      const mockGame = { id: 1, userId: 1, gold: 1000, save: jest.fn() };
      const mockUpgrade = { cost: 100, level: 1, damage_boost: 1, range_boost: 10, fire_rate_boost: 0.1, save: jest.fn() };
      jest.spyOn(Tower, 'findByPk').mockResolvedValue(mockTower);
      jest.spyOn(Game, 'findOne').mockResolvedValue(mockGame);
      jest.spyOn(Upgrade, 'findByPk').mockResolvedValue(mockUpgrade);
      jest.spyOn(Stats, 'findOne').mockResolvedValue({ towers_upgraded: 0, save: jest.fn() });
      const res = await request(app)
        .put(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/tower upgraded successfully/i);
      expect(res.body.tower).toBeDefined();
    });

    test('400 if not enough gold to upgrade', async () => {
      jest.spyOn(Tower, 'findByPk').mockResolvedValue({ id: 1, gameId: 1, upgradeId: 1 });
      jest.spyOn(Game, 'findOne').mockResolvedValue({ id: 1, userId: 1, gold: 0 });
      jest.spyOn(Upgrade, 'findByPk').mockResolvedValue({ cost: 100, level: 1 });
      const res = await request(app)
        .put(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/not enough gold/i);
    });

    test('400 if tower is already at maximum level', async () => {
      jest.spyOn(Tower, 'findByPk').mockResolvedValue({ id: 1, gameId: 1, upgradeId: 1 });
      jest.spyOn(Game, 'findOne').mockResolvedValue({ id: 1, userId: 1, gold: 1000 });
      jest.spyOn(Upgrade, 'findByPk').mockResolvedValue({ cost: 100, level: 10 });
      const res = await request(app)
        .put(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/maximum level/i);
    });

    test('401 if token is missing', async () => {
      const res = await authorizedRequestWithOutToken(ENDPOINT, 'put');
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/token is missing/i);
    });

    test('403 if token is invalid', async () => {
      const res = await authorizedRequestWithBadToken(ENDPOINT, 'put');
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/invalid|expired token/i);
    });

    test('404 if tower not found', async () => {
      jest.spyOn(Tower, 'findByPk').mockResolvedValue(null);
      const res = await request(app)
        .put(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/tower not found/i);
    });

    test('404 if game not found or user not authorized', async () => {
      jest.spyOn(Tower, 'findByPk').mockResolvedValue({ id: 1, gameId: 1, upgradeId: 1 });
      jest.spyOn(Game, 'findOne').mockResolvedValue(null);
      const res = await request(app)
        .put(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/game not found/i);
    });

    test('500 if DB error', async () => {
      jest.spyOn(Tower, 'findByPk').mockRejectedValue(new Error('DB Crash'));
      const res = await request(app)
        .put(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/failed to upgrade tower/i);
    });
  });

  describe('DELETE /api/towers/deleteTower/:towerId', () => {
    const ENDPOINT = '/api/towers/deleteTower/1';

    test('200 OK - tower deleted successfully', async () => {
      const mockTower = { id: 1, gameId: 1, cost: 100, destroy: jest.fn() };
      const mockGame = { id: 1, userId: 1, gold: 500, save: jest.fn() };
      jest.spyOn(Tower, 'findByPk').mockResolvedValue(mockTower);
      jest.spyOn(Game, 'findOne').mockResolvedValue(mockGame);
      jest.spyOn(Stats, 'findOne').mockResolvedValue({ towers_deleted: 0, save: jest.fn() });
      const res = await request(app)
        .delete(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/tower deleted successfully/i);
    });

    test('401 if token is missing', async () => {
      const res = await authorizedRequestWithOutToken(ENDPOINT, 'delete');
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/token is missing/i);
    });

    test('403 if token is invalid', async () => {
      const res = await authorizedRequestWithBadToken(ENDPOINT, 'delete');
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/invalid|expired token/i);
    });

    test('404 if tower not found', async () => {
      jest.spyOn(Tower, 'findByPk').mockResolvedValue(null);
      const res = await request(app)
        .delete(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/tower not found/i);
    });

    test('404 if game not found or user not authorized', async () => {
      jest.spyOn(Tower, 'findByPk').mockResolvedValue({ id: 1, gameId: 1, cost: 100 });
      jest.spyOn(Game, 'findOne').mockResolvedValue(null);
      const res = await request(app)
        .delete(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/game not found/i);
    });

    test('500 if DB error', async () => {
      jest.spyOn(Tower, 'findByPk').mockRejectedValue(new Error('DB Crash'));
      const res = await request(app)
        .delete(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/failed to delete tower/i);
    });
  });
});
