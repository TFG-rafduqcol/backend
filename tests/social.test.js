jest.spyOn(console, 'error').mockImplementation(() => {});

const request = require('supertest');
const app = require('../server');
const { sequelize, User, FriendShip } = require('../models/index');
let transaction;
const jwt = require('jsonwebtoken');
const  { authorizedRequestWithOutToken, authorizedRequestWithBadToken } = require('./utils');

describe('GET /api/social/getUserByUsernameOrId/:usernameOrId', () => {
  const ENDPOINT = '/api/social/getUserByUsernameOrId';
  const user = { id: 1, isAdmin: false };
  const mockFriend = {
      id: 2,
      username: 'jhone_doe_friend',
      active_avatar: { image_url: 'http://example.com/avatar_friend.jpg' },
      range: { name: 'Silver', image_url: 'http://example.com/range_friend.jpg' }
  };
  

  const authenticatedRequest = async (usernameOrId) => {
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });    
    return request(app)
      .get(`/api/social/getUserByUsernameOrId/${usernameOrId}`)
      .set('Authorization', `Bearer ${token}`)
      .send();
  };

  beforeAll(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('200 - User retrieves player/s successfully', async () => {

    const mockFriendship = {
      user1Id: 1,
      user2Id: 2,
      status: 'accepted'
    };

    jest.spyOn(User, 'findAll').mockResolvedValue([mockFriend]);
    jest.spyOn(FriendShip, 'findOne').mockResolvedValue(mockFriendship);

    const res = await authenticatedRequest('jhone_doe_friend');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Users retrieved successfully');
    expect(res.body.users).toHaveLength(1);
    expect(res.body.users[0].friendshipStatus).toBe('accepted');
  });

  test('401 - Missing token', async () => {
    const res = await authorizedRequestWithOutToken(`${ENDPOINT}/jhone_doe_friend`, 'get', null);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token is missing');
  });

  test ('403 - Unauthorized user', async () => {
    const res = await authorizedRequestWithBadToken(`${ENDPOINT}/jhone_doe_friend`, 'get', null);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  test('404 - Should return error when user is not found', async () => {
    jest.spyOn(User, 'findAll').mockResolvedValue([]);

    const res = await authenticatedRequest('non_existent_user');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('UserNotFound');
  });


  test('500 - Should handle unexpected errors', async () => {
    jest.spyOn(User, 'findAll').mockRejectedValue(new Error('DB error'));

    const res= await authenticatedRequest('john_doe');

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal server error');
  });
});

describe('GET /api/social/getUserById/:userId', () => {
  const ENDPOINT = '/api/social/getUserById';
  const user = { id: 1, isAdmin: false };
  const mockUser = {
    id: 1,
    username: 'john_doe',
    experience: 1500,
    active_avatar: { image_url: 'http://example.com/avatar.jpg' },
    range: { name: 'Gold', image_url: 'http://example.com/range.jpg' }
  };

  let transaction;

  const authenticatedRequest = async (userId) => {
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
    return request(app)
      .get(`/api/social/getUserById/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send();
  };

  beforeAll(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('200 - Should retrieve user successfully', async () => {
    jest.spyOn(User, 'findByPk').mockResolvedValue(mockUser);

    const res = await authenticatedRequest(1);

    expect(res.status).toBe(200);
    expect(transaction.commit).toHaveBeenCalled();
    expect(res.body.player).toEqual({
      id: 1,
      username: 'john_doe',
      avatar: 'http://example.com/avatar.jpg',
      range: 'Gold',
      range_url: 'http://example.com/range.jpg',
      experience: 1500
    });
  });

  test('401 - Missing token', async () => {
    const res = await authorizedRequestWithOutToken(`${ENDPOINT}/1`, 'get', null);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token is missing');
  });

  test ('403 - Unauthorized user', async () => {
    const res = await authorizedRequestWithBadToken(`${ENDPOINT}/1`, 'get', null);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  test('404 - Should return error when user is not found', async () => {
    jest.spyOn(User, 'findByPk').mockResolvedValue(null);

    const res = await authenticatedRequest(999);

    expect(transaction.rollback).toHaveBeenCalled();
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  test('500 - Should handle unexpected errors', async () => {
    jest.spyOn(User, 'findByPk').mockRejectedValue(new Error('DB error'));

    const res = await authenticatedRequest(1);

    expect(transaction.rollback).toHaveBeenCalled();
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal server error');
  });
});

describe('GET /api/social/getMyFriends', () => {
  const ENDPOINT = '/api/social/getMyFriends';
  const user = { id: 1, isAdmin: false };
  const mockFriendship = {
    user1Id: 1,
    user2Id: 2,
    user1: {
      id: 1,
      username: 'john_doe',
      experience: 1500,
      active_avatar: { image_url: 'http://example.com/avatar.jpg' },
    },
    user2: {
      id: 2,
      username: 'friend_user',
      experience: 900,
      active_avatar: { image_url: 'http://example.com/friend_avatar.jpg' },
    }
  };

  const authenticatedRequest = async () => {
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
    return request(app)
      .get('/api/social/getMyFriends')
      .set('Authorization', `Bearer ${token}`)
      .send();
  };

  beforeAll(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('200 - Should retrieve friends successfully', async () => {
    jest.spyOn(FriendShip, 'findAll').mockResolvedValue([mockFriendship]);

    const res = await authenticatedRequest();

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Friends retrieved successfully');
    expect(res.body.friends).toHaveLength(1);
    expect(res.body.friends[0]).toEqual({
      id: 2,
      username: 'friend_user',
      avatar: 'http://example.com/friend_avatar.jpg',
    });
    expect(transaction.commit).toHaveBeenCalled();
  });

  test('200 - Should return empty friends array if no friendships found', async () => {
    jest.spyOn(FriendShip, 'findAll').mockResolvedValue([]);

    const res = await authenticatedRequest();

    expect(res.status).toBe(200);
    expect(res.body.friends).toEqual([]);
    expect(res.body.message).toBe('Friends retrieved successfully');
    expect(transaction.commit).toHaveBeenCalled();
  });

  test('400 - Should return error when userId is missing', async () => {
    const token = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .get('/api/social/getMyFriends')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User ID is required');
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

  test('500 - Should handle unexpected errors', async () => {
    jest.spyOn(FriendShip, 'findAll').mockRejectedValue(new Error('DB error'));

    const res = await authenticatedRequest();

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal server error');
    expect(transaction.rollback).toHaveBeenCalled();
  });
});


describe('GET /api/social/getMyFriendRequests', () => {
  const ENDPOINT = '/api/social/getMyFriendRequests';
  const user = { id: 1, isAdmin: false };
  const mockFriendship = {
    user2Id: 1,
    user1: {
      id: 2,
      username: 'inviter_user',
      experience: 1200,
      active_avatar: { image_url: 'http://example.com/avatar.jpg' },
      range: { name: 'Gold', image_url: 'http://example.com/gold.png' }
    }
  };

  const authenticatedRequest = async () => {
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
    return request(app)
      .get('/api/social/getMyFriendRequests')
      .set('Authorization', `Bearer ${token}`)
      .send();
  };

  beforeAll(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('200 - Should retrieve friend requests successfully', async () => {
    jest.spyOn(FriendShip, 'findAll').mockResolvedValue([mockFriendship]);

    const res = await authenticatedRequest();

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Friend requests retrieved successfully');
    expect(res.body.users).toHaveLength(1);
    expect(res.body.users[0]).toEqual({
      id: 2,
      username: 'inviter_user',
      avatar: 'http://example.com/avatar.jpg',
      range: 'Gold',
      range_url: 'http://example.com/gold.png',
    });
    expect(transaction.commit).toHaveBeenCalled();
  });

  test('200 - Should return empty users array if no requests found', async () => {
    jest.spyOn(FriendShip, 'findAll').mockResolvedValue([]);

    const res = await authenticatedRequest();

    expect(res.status).toBe(200);
    expect(res.body.users).toEqual([]);
    expect(res.body.message).toBe('Friend requests retrieved successfully');
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

  test('400 - Should return error when userId is missing', async () => {
    const token = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .get('/api/social/getMyFriendRequests')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User ID is required');
  });

  test('500 - Should handle unexpected errors and rollback transaction', async () => {
    jest.spyOn(FriendShip, 'findAll').mockRejectedValue(new Error('DB error'));

    const res = await authenticatedRequest();

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal server error');
    expect(transaction.rollback).toHaveBeenCalled();
  });
});


describe('POST /api/social/sendFriendRequest/:userId', () => {
  const ENDPOINT = '/api/social/sendFriendRequest';
  const loggedUser = { id: 1 };
  const targetUserId = 2;

  const authenticatedRequest = async (id = targetUserId) => {
    const token = jwt.sign(loggedUser, process.env.JWT_SECRET, { expiresIn: '1h' });
    return request(app)
      .post(`/api/social/sendFriendRequest/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send();
  };

  beforeEach(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('200 - Should create new friend request if no existing one', async () => {
    jest.spyOn(FriendShip, 'findOne').mockResolvedValue(null);
    const mockFriendship = { user1Id: 1, user2Id: 2, status: 'pending' };
    jest.spyOn(FriendShip, 'create').mockResolvedValue(mockFriendship);

    const res = await authenticatedRequest();

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Friend request sent successfully');

    expect(FriendShip.create).toHaveBeenCalledWith(
      { user1Id: 1, user2Id: 2, status: 'pending' },
      { transaction }
    );

    expect(transaction.commit).toHaveBeenCalled();
  });


  test('200 - Should delete existing friendship and create new one', async () => {
    const mockDestroy = jest.fn().mockResolvedValue();
    const existingFriendship = { destroy: mockDestroy };

    jest.spyOn(FriendShip, 'findOne').mockResolvedValue(existingFriendship);
    jest.spyOn(FriendShip, 'create').mockResolvedValue({});

    const res = await authenticatedRequest();

    expect(res.status).toBe(200);
    expect(mockDestroy).toHaveBeenCalledWith({ transaction });
    expect(FriendShip.create).toHaveBeenCalled();
    expect(transaction.commit).toHaveBeenCalled();
  });


 test('400 - Should return error if loggedUserId is missing', async () => {
    const token = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '1h' }); 

    const res = await request(app)
      .post(`/api/social/sendFriendRequest/${targetUserId}`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Friend ID is required');
  });

  test('401 - Missing token', async () => {
    const res = await authorizedRequestWithOutToken(`${ENDPOINT}/2`, 'post', null);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token is missing');
  });

  test ('403 - Unauthorized user', async () => {
    const res = await authorizedRequestWithBadToken(`${ENDPOINT}/2`, 'post', null);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Invalid or expired token');
  });


  test('500 - Should handle errors and rollback transaction', async () => {
    jest.spyOn(FriendShip, 'findOne').mockRejectedValue(new Error('DB error'));

    const res = await authenticatedRequest();

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal server error');
    expect(transaction.rollback).toHaveBeenCalled();
  });
});


describe('POST /api/social/changeFriendRequestStatus/:userId', () => {
  const ENDPOINT = '/api/social/changeFriendRequestStatus';
  const loggedUser = { id: 1 };
  const targetUserId = 2;

  const authenticatedRequest = async (id = targetUserId, status = 'accepted') => {
    const token = jwt.sign(loggedUser, process.env.JWT_SECRET, { expiresIn: '1h' });
    return request(app)
      .post(`/api/social/changeFriendRequestStatus/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status });
  };

   beforeEach(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


test('200 - Should modify the status of a friend request', async () => {
  const transaction = { commit: jest.fn(), rollback: jest.fn() };
  const friendship = { status: 'pending', save: jest.fn() };

  jest.spyOn(FriendShip, 'findOne').mockResolvedValue(friendship);

  jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);

  jest.spyOn(friendship, 'save').mockResolvedValue(friendship);

  const res = await authenticatedRequest(2, 'accepted'); 

  expect(res.status).toBe(200);
  expect(res.body.message).toBe('Friend request modified successfully');
  expect(friendship.save).toHaveBeenCalledWith({ transaction });
  expect(transaction.commit).toHaveBeenCalled(); 
});


  test('400 - Should return error if userId, friendId or status are missing', async () => {
    const res = await authenticatedRequest(2, null);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User ID, friend ID, and status are required');
  });

  test('401 - Missing token', async () => {
    const res = await authorizedRequestWithOutToken(`${ENDPOINT}/2`, 'post', null);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token is missing');
  });

  test ('403 - Unauthorized user', async () => {
    const res = await authorizedRequestWithBadToken(`${ENDPOINT}/2`, 'post', null);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  test('404 - Should return error if friendship is not found', async () => {
    jest.spyOn(FriendShip, 'findOne').mockResolvedValue(null);

    const res = await authenticatedRequest(2, 'accepted');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Friend request not found or you're not authorized to modify it");
    expect(transaction.rollback).toHaveBeenCalled();

  });

  test('500 - Should return error if there is a server error', async () => {
    jest.spyOn(FriendShip, 'findOne').mockRejectedValue(new Error('DB crash'));

    const res = await authenticatedRequest(2, 'accepted');

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal server error');
    expect(transaction.rollback).toHaveBeenCalled();
  });
});

describe('DELETE /api/social/removeFriend/:userId', () => {
  const ENDPOINT = '/api/social/removeFriend';
  const mockFriendship = {
    user1Id: 1,
    user2Id: 2,
  };

   const authenticatedRequest = async (friendId) => {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return request(app)
      .delete(`/api/social/removeFriend/${friendId}`)
      .set('Authorization', `Bearer ${token}`)
      .send();
  };

  const authenticatedRequestWithInvalidId = async (friendId) => {
    const token = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '1h' });
    return request(app)
      .delete(`/api/social/removeFriend/${friendId}`)
      .set('Authorization', `Bearer ${token}`)
      .send();
  };



  beforeEach(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

 

  test('200 - Should remove friend successfully', async () => {

    jest.spyOn(FriendShip, 'findOne').mockResolvedValue(mockFriendship);
    const friendship = { destroy: jest.fn()};

    jest.spyOn(FriendShip, 'findOne').mockResolvedValue(friendship);
    jest.spyOn(friendship, 'destroy').mockResolvedValue();


    const res = await authenticatedRequest(2);


    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Friend removed successfully');
    expect(friendship.destroy).toHaveBeenCalledWith({ transaction });
    expect(transaction.commit).toHaveBeenCalled();
  });

  test('400 - Should return error if User ID or friend ID is missing', async () => {
    const res = await authenticatedRequestWithInvalidId(2);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User ID is required");
    expect(transaction.rollback).toHaveBeenCalled();
  });
  
  test('401 - Missing token', async () => {
    const res = await authorizedRequestWithOutToken(`${ENDPOINT}/2`, 'delete', null);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token is missing');
  });

  test ('403 - Unauthorized user', async () => {
    const res = await authorizedRequestWithBadToken(`${ENDPOINT}/2`, 'delete', null);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  test('404 - Should return error if friendship not found', async () => {
    jest.spyOn(FriendShip, 'findOne').mockResolvedValue(null);

    const res = await authenticatedRequest(2);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Friendship not found");
    expect(transaction.rollback).toHaveBeenCalled();
  });

  test('500 - Should return internal server error if something goes wrong', async () => {
    jest.spyOn(FriendShip, 'findOne').mockRejectedValue(new Error('DB crash'));

    const res = await authenticatedRequest(2);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal server error');
    expect(transaction.rollback).toHaveBeenCalled();
  });
});
