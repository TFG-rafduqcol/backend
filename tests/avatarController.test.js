jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

const request = require('supertest');
const app = require('../server');
const { sequelize, User, Avatar } = require('../models/index');
const jwt = require('jsonwebtoken');
const  { authorizedRequestWithOutToken, authorizedRequestWithBadToken } = require('./utils');


describe('GET /api/avatars/getMyAvatars', () => {
    const ENDPOINT = '/api/avatars/getMyAvatars';
    const userId = 1;
        const mockToken = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret');

    let transaction;

    beforeAll(() => {
        transaction = { commit: jest.fn(), rollback: jest.fn() };
        jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const authenticatedRequest = () =>
        request(app)
        .get(ENDPOINT)
        .set('Authorization', `Bearer ${mockToken}`);

    test('200 - Returns user avatars successfully', async () => {
        const mockUserAvatars = [
            { id: 1, image_url: 'url1' },
            { id: 2, image_url: 'url2' }
        ];
        const mockActiveAvatar = { id: 1, image_url: 'url1' };
        const mockAllAvatars = [
            ...mockUserAvatars,
            { id: 3, image_url: 'url3' }
        ];

        jest.spyOn(User, 'findOne').mockResolvedValue({
            avatars: mockUserAvatars,
            active_avatar: mockActiveAvatar
        });

        jest.spyOn(Avatar, 'findAll').mockResolvedValue(mockAllAvatars);

        const res = await authenticatedRequest();

        expect(res.status).toBe(200);
        expect(res.body.user_avatars).toEqual(mockUserAvatars);
        expect(res.body.active_avatar).toEqual(mockActiveAvatar);
        expect(res.body.remainings_avatars).toEqual([{ id: 3, image_url: 'url3' }]);
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

        test('404 - User not found', async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue(null);

            const res = await authenticatedRequest();

            expect(res.status).toBe(404);
            expect(res.body.message).toMatch(/user not found/i);
            expect(transaction.rollback).toHaveBeenCalled();
        });

        test('500 - Unexpected error while retrieving avatars', async () => {
            jest.spyOn(User, 'findOne').mockRejectedValue(new Error('DB failure'));

            const res = await authenticatedRequest();

            expect(res.status).toBe(500);
            expect(res.body.message).toMatch(/error occurred/i);
            expect(transaction.rollback).toHaveBeenCalled();
        });
});
describe('PUT /api/avatars/changeMyActiveAvatar/:avatarId', () => {
  const ENDPOINT = '/api/avatars/changeMyActiveAvatar';
  let transaction;

  const loggedUserId = 1;
  const avatarId = 42;

  const authenticatedRequest = async (id = avatarId) => {
    const token = jwt.sign({ id: loggedUserId, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return request(app)
      .put(`${ENDPOINT}/${id}`)
      .set('Authorization', `Bearer ${token}`);
  };

  beforeAll(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('200 - Active avatar updated successfully', async () => {
    const mockAvatar = { id: 42, image_url: 'avatar_url' };
    const mockUserAvatars = [
      { id: 41, image_url: 'avatar1_url' },
      { id: 42, image_url: 'avatar2_url' }
    ];

    jest.spyOn(Avatar, 'findByPk').mockResolvedValue(mockAvatar);
    jest.spyOn(User, 'findOne').mockResolvedValue({
      avatars: mockUserAvatars,
    });
    jest.spyOn(User, 'update').mockResolvedValue([1]);  

    const res = await authenticatedRequest(avatarId);

    expect(res.status).toBe(200); 
    expect(res.body.message).toBe("Active avatar updated successfully.");
    expect(transaction.commit).toHaveBeenCalled();
  });

  test('401 - Missing token', async () => {
    const res = await authorizedRequestWithOutToken(`${ENDPOINT}/42`, 'put', null);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token is missing');
  });

  test ('403 - Unauthorized user', async () => {
    const res = await authorizedRequestWithBadToken(`${ENDPOINT}/42`, 'put', null);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  test('404 - Avatar not unlocked', async () => {
    const mockAvatarNotUnlocked = { id: 43, image_url: 'avatar_url' }; 
    const mockUserAvatars = [
      { id: 41, image_url: 'avatar1_url' },
      { id: 42, image_url: 'avatar2_url' }
    ];

    jest.spyOn(Avatar, 'findByPk').mockResolvedValue(mockAvatarNotUnlocked);
    jest.spyOn(User, 'findOne').mockResolvedValue({
      avatars: mockUserAvatars,
    });

    const res = await authenticatedRequest(mockAvatarNotUnlocked.id);

    expect(res.status).toBe(404);  
    expect(res.body.message).toBe("You have not unlocked this avatar.");
    expect(transaction.rollback).toHaveBeenCalled();
  });

  test('500 - Unexpected error while updating active avatar', async () => {
    const mockAvatar = { id: 42, image_url: 'avatar_url' };
    const mockUserAvatars = [
      { id: 41, image_url: 'avatar1_url' },
      { id: 42, image_url: 'avatar2_url' }
    ];

    jest.spyOn(Avatar, 'findByPk').mockResolvedValue(mockAvatar);
    jest.spyOn(User, 'findOne').mockResolvedValue({
      avatars: mockUserAvatars,
      activeAvatarId: 41
    });

    jest.spyOn(User, 'update').mockRejectedValue(new Error('DB failure')); 

    const res = await authenticatedRequest(avatarId);

    expect(res.status).toBe(500); 
    expect(res.body.message).toBe("Internal server error.");
    expect(transaction.rollback).toHaveBeenCalled();
  });
});
