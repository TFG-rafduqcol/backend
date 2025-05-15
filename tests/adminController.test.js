jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

const request = require('supertest');
const app = require('../server');
const { sequelize, User, Game, FriendShip } = require('../models/index');
const jwt = require('jsonwebtoken');
const  { authorizedRequestWithOutToken, authorizedRequestWithBadToken } = require('./utils');



describe('GET /api/admin/isAdmin', () => {
  const ENDPOINT = '/api/admin/isAdmin';
  const user = { id: 1, isAdmin: true };

  let transaction;

  beforeAll(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const authenticatedRequest = async (mockedUser) => {
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });

    jest.spyOn(User, 'findByPk').mockResolvedValueOnce(mockedUser);

    return request(app)
      .get(ENDPOINT)
      .set('Authorization', `Bearer ${token}`);
  };

  test('200 - User is admin', async () => {
    const mockUser = { id: 1, isAdmin: true };

    const res = await authenticatedRequest(mockUser);

    expect(res.status).toBe(200);
    expect(res.body.isAdmin).toBe(true);
    expect(transaction.commit).toHaveBeenCalled();
  });

  test('200 - User is not admin', async () => {
    const mockUser = { id: 1, isAdmin: false };

    const res = await authenticatedRequest(mockUser);

    expect(res.status).toBe(200);
    expect(res.body.isAdmin).toBe(false);
    expect(transaction.commit).toHaveBeenCalled();
  });

  test('401 - User not found', async () => {
    const res = await authenticatedRequest(null); 

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User not found or not authenticated.");
    expect(transaction.rollback).toHaveBeenCalled();
  });

  test('401 - Missing token', async () => {
    const res = await authorizedRequestWithOutToken(`${ENDPOINT}`, 'get', null);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token is missing');
  });

  test ('403 - Unauthorized user', async () => {
    const res = await authorizedRequestWithBadToken(`${ENDPOINT}`, 'get', null);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  test('500 - DB crash', async () => {
    jest.spyOn(User, 'findByPk').mockRejectedValue(new Error('DB crash'));

    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .get(ENDPOINT)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('An error occurred while checking admin status.');
    expect(transaction.rollback).toHaveBeenCalled();
  });
});

describe('GET /api/admin/getAllUsers', () => {
  const ENDPOINT = '/api/admin/getAllUsers';
  const adminUser = { id: 1, isAdmin: true };
  const nonAdminUser = { id: 2, isAdmin: false };

  let transaction;

  beforeAll(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const authenticatedRequest = async (mockedUser, users = [], totalCount = 0, tokenUser = adminUser) => {
    const token = jwt.sign(tokenUser, process.env.JWT_SECRET, { expiresIn: '1h' });

    jest.spyOn(User, 'findByPk').mockResolvedValueOnce(mockedUser);

    if (mockedUser && mockedUser.isAdmin) {
      jest.spyOn(User, 'findAndCountAll').mockResolvedValueOnce({
        count: totalCount,
        rows: users
      });
    }

    return request(app)
      .get(ENDPOINT)
      .set('Authorization', `Bearer ${token}`);
  };

  test('200 - Admin retrieves users successfully', async () => {
    const mockUsers = [
      { id: 1, username: 'admin', email: 'admin@example.com', isAdmin: true },
      { id: 2, username: 'user', email: 'user@example.com', isAdmin: false }
    ];

    const res = await authenticatedRequest(adminUser, mockUsers, mockUsers.length);

    expect(res.status).toBe(200);
    expect(res.body.totalUsers).toBe(2);
    expect(res.body.users.length).toBe(2);
    expect(res.body.message).toBe("Users retrieved successfully");
    expect(transaction.commit).toHaveBeenCalled();
  });

   test('401 - Missing token', async () => {
    const res = await authorizedRequestWithOutToken(`${ENDPOINT}`, 'get', null);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token is missing');
  });

  test ('403 - Unauthorized user', async () => {
    const res = await authorizedRequestWithBadToken(`${ENDPOINT}`, 'get', null);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  test('403 - Non-admin user is forbidden', async () => {
    const res = await authenticatedRequest(nonAdminUser);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("You do not have permission to access this resource.");
    expect(transaction.rollback).toHaveBeenCalled();
  });

  test('403 - User not found', async () => {
    const res = await authenticatedRequest(null);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("You do not have permission to access this resource.");
    expect(transaction.rollback).toHaveBeenCalled();
  });

  test('500 - DB crash during findByPk', async () => {
    jest.spyOn(User, 'findByPk').mockRejectedValueOnce(new Error("DB error"));

    const token = jwt.sign(adminUser, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .get(ENDPOINT)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("An error occurred while retrieving users.");
    expect(transaction.rollback).toHaveBeenCalled();
  });
});


describe('DELETE /api/admin/deleteUser/:userId', () => {
  const ENDPOINT = '/api/admin/deleteUser';
  let transaction;

  const adminUser = { id: 1, isAdmin: true };
  const targetUserId = 42;

  const authenticatedRequest = async (id = targetUserId, userPayload = adminUser) => {
    const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    return request(app)
      .delete(`${ENDPOINT}/${id}`)
      .set('Authorization', `Bearer ${token}`);
  };

  beforeAll(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('200 - Deletes user successfully', async () => {
    const mockLoggedUser = { isAdmin: true };
    const mockTargetUser = { id: targetUserId, destroy: jest.fn() };
    jest.spyOn(User, 'findByPk')
      .mockResolvedValueOnce(mockLoggedUser)   
      .mockResolvedValueOnce(mockTargetUser); 

    jest.spyOn(FriendShip, 'destroy').mockResolvedValueOnce(1);
    jest.spyOn(Game, 'destroy').mockResolvedValueOnce(1);

    const res = await authenticatedRequest(targetUserId, { id: 1, isAdmin: true });

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(`${targetUserId}`);
    expect(transaction.commit).toHaveBeenCalled();
  });

   test('401 - Missing token', async () => {
    const res = await authorizedRequestWithOutToken(`${ENDPOINT}/1`, 'delete', null);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token is missing');
  });

  test ('403 - Unauthorized user', async () => {
    const res = await authorizedRequestWithBadToken(`${ENDPOINT}/1`, 'delete', null);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  test('403 - Non-admin trying to delete user', async () => {
    const nonAdminUser = { isAdmin: false };
    jest.spyOn(User, 'findByPk').mockResolvedValueOnce(nonAdminUser);

    const res = await authenticatedRequest(targetUserId, { id: 2, isAdmin: false });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/do not have permission/i);
    expect(transaction.rollback).toHaveBeenCalled();
  });

  test('404 - Target user not found', async () => {
    const mockLoggedUser = { isAdmin: true };

    jest.spyOn(User, 'findByPk')
      .mockResolvedValueOnce(mockLoggedUser)  
      .mockResolvedValueOnce(null);          

    const res = await authenticatedRequest();

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/user not found/i);
    expect(transaction.rollback).toHaveBeenCalled();
  });

  test('500 - Unexpected server error', async () => {
    const mockLoggedUser = { isAdmin: true };
    jest.spyOn(User, 'findByPk')
      .mockResolvedValueOnce(mockLoggedUser)
      .mockImplementationOnce(() => { throw new Error('DB error'); });

    const res = await authenticatedRequest();

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/error occurred/i);
    expect(transaction.rollback).toHaveBeenCalled();
  });
});
