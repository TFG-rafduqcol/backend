jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

const request = require('supertest');
const app = require('../server');
const { sequelize, User, Game, Stats, hordeQualityLog } = require('../models/index');
const jwt = require('jsonwebtoken');
const { authorizedRequestWithOutToken, authorizedRequestWithBadToken } = require('./utils');


describe('Game Routes', () => {
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

  describe('POST /api/games/createGame', () => {
    const ENDPOINT = '/api/games/createGame';
    const payload = { path: '/level-1', hardMode: false };

    test('201 - Game created successfully', async () => {
      jest.spyOn(Game, 'create').mockResolvedValue({ id: 1, ...payload, UserId: user.id });
      const res = await request(app)
        .post(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(payload);
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(transaction.commit).toHaveBeenCalled();
    });

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

    test('500 - DB error', async () => {
      jest.spyOn(Game, 'create').mockRejectedValue(new Error('DB crash'));
      const res = await request(app)
        .post(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(payload);
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/failed to create game/i);
      expect(transaction.rollback).toHaveBeenCalled();
    });
  });

  describe('GET /api/games/getGame/:gameId', () => {
    const ENDPOINT = '/api/games/getGame/1';
    const mockGame = { id: 1, UserId: user.id, path: '/level-1', hardMode: false };

    test('200 - Game fetched successfully', async () => {
      jest.spyOn(Game, 'findOne').mockResolvedValue(mockGame);
      const res = await request(app)
        .get(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(transaction.commit).toHaveBeenCalled();
    });

    test('401 - Missing token', async () => {
      const res = await authorizedRequestWithOutToken(ENDPOINT, 'get');
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/token is missing/i);
    });

    test('403 - Invalid token', async () => {
      const res = await authorizedRequestWithBadToken(ENDPOINT, 'get');
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/invalid|expired token/i);
    });

    test('404 - Game not found', async () => {
      jest.spyOn(Game, 'findOne').mockResolvedValue(null);
      const res = await request(app)
        .get(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/game not found/i);
      expect(transaction.rollback).toHaveBeenCalled();
    });

    test('403 - Forbidden (not owner)', async () => {
      jest.spyOn(Game, 'findOne').mockResolvedValue({ ...mockGame, UserId: 999 });
      const res = await request(app)
        .get(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/forbidden/i);
      expect(transaction.rollback).toHaveBeenCalled();
    });

    test('500 - DB error', async () => {
      jest.spyOn(Game, 'findOne').mockRejectedValue(new Error('DB crash'));
      const res = await request(app)
        .get(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/failed to fetch game/i);
      expect(transaction.rollback).toHaveBeenCalled();
    });
  });

  describe('PUT /api/games/updateGame/:gameId', () => {
    const ENDPOINT = '/api/games/updateGame/1';
    const payload = { round: 5, gold: 200, lives: 10 };
    const mockGame = { id: 1, UserId: user.id, round: 1, gold: 100, lives: 20, save: jest.fn() };

    test('200 - Game updated successfully', async () => {
      jest.spyOn(Game, 'findOne').mockResolvedValue({ ...mockGame, save: jest.fn() });
      const res = await request(app)
        .put(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(payload);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(transaction.commit).toHaveBeenCalled();
    });

    test('401 - Missing token', async () => {
      const res = await authorizedRequestWithOutToken(ENDPOINT, 'put', payload);
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/token is missing/i);
    });

    test('403 - Invalid token', async () => {
      const res = await authorizedRequestWithBadToken(ENDPOINT, 'put');
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/invalid|expired token/i);
    });

    test('404 - Game not found', async () => {
      jest.spyOn(Game, 'findOne').mockResolvedValue(null);
      const res = await request(app)
        .put(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(payload);
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/game not found/i);
      expect(transaction.rollback).toHaveBeenCalled();
    });

    test('403 - Forbidden (not owner)', async () => {
      jest.spyOn(Game, 'findOne').mockResolvedValue({ ...mockGame, UserId: 999 });
      const res = await request(app)
        .put(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(payload);
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/forbidden/i);
      expect(transaction.rollback).toHaveBeenCalled();
    });

    test('500 - DB error', async () => {
      jest.spyOn(Game, 'findOne').mockRejectedValue(new Error('DB crash'));
      const res = await request(app)
        .put(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(payload);
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/failed to update game/i);
      expect(transaction.rollback).toHaveBeenCalled();
    });
  });

  describe('POST /api/games/endGame/:gameId', () => {
    const ENDPOINT = '/api/games/endGame/1';
    const payload = { lostedLives: 5 };
    const mockGame = { id: 1, UserId: user.id, round: 10, gold: 100, isHardMode: false };
    const mockStats = { userId: user.id, rounds_passed: 5, games_played: 0, gems_earned: 0, save: jest.fn() };
    const mockPlayer = { id: user.id, rangeId: 3, save: jest.fn() };
    const mockHordeLog = { quality: 100, save: jest.fn() };

    test('200 - Game ended and stats updated', async () => {
      jest.spyOn(Game, 'findOne').mockResolvedValue(mockGame);
      jest.spyOn(hordeQualityLog, 'findOne').mockResolvedValue(mockHordeLog);
      jest.spyOn(Stats, 'findOne').mockResolvedValue(mockStats);
      jest.spyOn(User, 'findByPk').mockResolvedValue(mockPlayer);
      const res = await request(app)
        .post(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(payload);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Game ended successfully');
      expect(res.body).toHaveProperty('round', mockGame.round);
      expect(res.body).toHaveProperty('xpEarned');
      expect(res.body).toHaveProperty('gemsEarned');
      expect(res.body).toHaveProperty('newRank');
    });

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

    test('500 - DB error', async () => {
      jest.spyOn(Game, 'findOne').mockRejectedValue(new Error('DB crash'));
      const res = await request(app)
        .post(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(payload);
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/failed to end game/i);
      expect(transaction.rollback).toHaveBeenCalled();
    });
  });
});
