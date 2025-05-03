jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

const request = require('supertest');
const app = require('../server');
const { sequelize, User, Avatar, Range } = require('../models/index');
const bcrypt = require('bcryptjs');
let transaction;
const jwt = require('jsonwebtoken');


/* ─── Tests checkEmail ─────────────────────── */
describe('POST /api/auth/checkEmail', () => {
  beforeAll(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);

  });

  afterEach(() => {
    jest.clearAllMocks();

  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await sequelize.close();

  });

  test('400 if email is blank', async () => {
    const res = await request(app)
      .post('/api/auth/checkEmail')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email is required');
  });

  test('200 exists true', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue({ id: 1, email: 'a@b.com' });

    const res = await request(app)
      .post('/api/auth/checkEmail')
      .send({ email: 'a@b.com' });

    expect(res.status).toBe(200);
    expect(res.body.exists).toBe(true);
    expect(res.body.message).toBe('Email already registered!');
    expect(transaction.commit).toHaveBeenCalled();
  });

  test('200 exists false', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/checkEmail')
      .send({ email: 'x@y.com' });

    expect(res.status).toBe(200);
    expect(res.body.exists).toBe(false);
    expect(transaction.commit).toHaveBeenCalled();
  });

  test('500 on error', async () => {
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/auth/checkEmail')
      .send({ email: 'err@e.com' });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal server error');
    expect(transaction.rollback).toHaveBeenCalled();
  });
});

/* ─── Tests registerPlayer ─────────────────────── */
describe('POST /api/auth/register', () => {
  const ENDPOINT = '/api/auth/register';
  const payload = {
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'Rafa1234'
  };

  beforeAll(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('201 on success', async () => {
    const newUser = { id: 1, ...payload, isAdmin: false, activeAvatarId: 1, rangeId: 1 };
    jest.spyOn(User, 'create').mockResolvedValue(newUser);

    const res = await request(app).post(ENDPOINT).send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(newUser);
    expect(transaction.commit).toHaveBeenCalled();
  });

  test('400 on duplicate email (UniqueConstraint)', async () => {
    const err = new Error();
    err.name = 'SequelizeUniqueConstraintError';
    err.errors = [{ path: 'email' }];
    jest.spyOn(User, 'create').mockRejectedValue(err);

    const res = await request(app).post(ENDPOINT).send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('EmailDuplicate');
    expect(transaction.rollback).toHaveBeenCalled();
  });

  test('500 on other error', async () => {
    jest.spyOn(User, 'create').mockRejectedValue(new Error('Oops'));

    const res = await request(app).post(ENDPOINT).send(payload);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('ServerError');
    expect(transaction.rollback).toHaveBeenCalled();
  });

  test('400 if required fields are missing', async () => {
    const res = await request(app).post(ENDPOINT).send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

/* ─── Tests loginPlayer ─────────────────────── */
describe('POST /api/auth/login', () => {
  const ENDPOINT = '/api/auth/login';
  const payload = {
    password: 'Rafa1234',
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    email: "john@example.com",
    experience: 100,
    active_avatar: {
        image_url: "https://example.com/avatar.jpg"
    },
    range: {
        name: "Gold",
        image_url: "https://example.com/range.jpg"
    },
    level: 10,
    gold: 1000,
    gems: 50,
    isAdmin: false
  };

  beforeAll(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('200 on success', async () => {
    const mockUser = {
      id: 1,
      firstName: payload.firstName,
      lastName: payload.lastName,
      username: payload.username,
      email: payload.email,
      password: '$2b$10$hashedPasswordHere',
      experience: payload.experience,
      active_avatar: {
          image_url: payload.active_avatar.image_url
      },
      range: {
          name: payload.range.name,
          image_url: payload.range.image_url
      },
      level: payload.level,
      gold: payload.gold,
      gems: payload.gems,
      isAdmin: payload.isAdmin
    };
  
    jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);  
  
    const res = await request(app).post(ENDPOINT).send(payload);
  
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.id).toBe(mockUser.id);
    expect(res.body.user.firstName).toBeDefined();
    expect(res.body.user.avatar).toBe(mockUser.active_avatar.image_url);
    expect(res.body.user.range).toBe(mockUser.range.name);
    expect(res.body.user.level).toBeDefined();
    expect(res.body.user.isAdmin).toBe(mockUser.isAdmin);
  });
  

  test('404 if email not register', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);

    const res = await request(app).post(ENDPOINT).send(payload);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Email not register.');
    expect(transaction.rollback).toHaveBeenCalled();
  });

  test('401 if password invalid', async () => {
    const mockUser = {
      id: 1,
      firstName: payload.firstName,
      lastName: payload.lastName,
      username: payload.username,
      email: payload.email,
      password: '$2b$10$hashedPasswordHere',
      experience: payload.experience,
      active_avatar: {
          image_url: payload.active_avatar.image_url
      },
      range: {
          name: payload.range.name,
          image_url: payload.range.image_url
      },
      level: payload.level,
      gold: payload.gold,
      gems: payload.gems,
      isAdmin: payload.isAdmin
    };

    jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false); 

    const res = await request(app).post(ENDPOINT).send(payload);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid password.');
    expect(transaction.rollback).toHaveBeenCalled();
  });

  test('400 if email or password is missing', async () => {
    const res = await request(app).post(ENDPOINT).send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email and password are required.');
  });

  test('500 on server error', async () => {
    jest.spyOn(User, 'findOne').mockRejectedValue(new Error('DB crash'));

    const res = await request(app).post(ENDPOINT).send(payload);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('An error occurred during the login process.');
    expect(transaction.rollback).toHaveBeenCalled();
  });
});
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});


describe('PUT /api/auth/update', () => {
  const ENDPOINT = '/api/auth/update';
  const userPayload = {
    firstName: 'John',
    lastName: 'Doe',
    username: 'johnny',
    email: 'john@example.com',
    password: 'newpassword123',
  };
  const user = { id: 1, isAdmin: false };

  const mockUser = {
    id: 1,
    firstName: 'Old',
    lastName: 'Name',
    username: 'olduser',
    email: 'old@example.com',
    password: 'oldpassword',
    experience: 100,
    level: 2,
    gold: 50,
    gems: 10,
    isAdmin: false,
    active_avatar: { image_url: 'avatar.png' },
    range: { name: 'Gold', image_url: 'range.png' },
    update: jest.fn().mockResolvedValue(true)
  };

  const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };

  beforeAll(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    app.use((req, res, next) => {
      req.userId = 1;
      next();
    });
  });

  const authenticatedRequest = async ()  => {
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });      
    return request(app)
      .put(`${ENDPOINT}/1`)  
      .set('Authorization', `Bearer ${token}`)
      .send(userPayload);
  };

  test('200 - Successfully updates user', async () => {

    jest.spyOn(User, 'findByPk').mockResolvedValueOnce(mockUser); 
    jest.spyOn(User, 'findByPk').mockResolvedValueOnce(mockUser); 

    jest.spyOn(User, 'findOne').mockResolvedValue(null); 
    jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt');
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('passwordHashed');

      jest.spyOn(User.prototype, 'update').mockResolvedValueOnce({
        id: mockUser.id,
        firstName: userPayload.firstName,
        lastName: userPayload.lastName,
        username: userPayload.username,
        email: userPayload.email,
        password: 'passwordHashed',
    });


    const res = await authenticatedRequest();
    
    expect(res.status).toBe(200);
    expect(mockUser.update).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: userPayload.firstName,
        lastName: userPayload.lastName,
        username: userPayload.username,
        email: userPayload.email,
        password: 'passwordHashed',
      }),
      expect.objectContaining({
        transaction: mockTransaction,
      })
    );
    
    expect(res.body.user.id).toBe(mockUser.id);
    expect(res.body.user.firstName).toBe(userPayload.firstName);
    expect(res.body.user.lastName).toBe(userPayload.lastName);
    expect(res.body.user.username).toBe(userPayload.username);
    expect(res.body.user.email).toBe(userPayload.email);
    expect(res.body.token).toBeDefined(); 
    

  

  });

  // test('400 - Missing required fields', async () => {
  //   const badPayload = { ...userPayload, email: '' };

  //   const res = await request(app)
  //     .put(`${ENDPOINT}/1`)
  //     .set('Authorization', 'Bearer validtoken')
  //     .send(badPayload);

  //   expect(res.status).toBe(400);
  //   expect(res.body.message).toMatch(/First name.*required/);
  //   expect(mockTransaction.rollback).toHaveBeenCalled();
  // });

  // test('404 - User not found', async () => {
  //   jest.spyOn(User, 'findByPk').mockResolvedValueOnce(mockUser); // loggedUser
  //   jest.spyOn(User, 'findByPk').mockResolvedValueOnce(null); // user to update

  //   const res = await authenticatedRequest();

  //   expect(res.status).toBe(404);
  //   expect(res.body.message).toBe('User not found.');
  //   expect(mockTransaction.rollback).toHaveBeenCalled();
  // });

  // test('400 - Email already in use', async () => {
  //   jest.spyOn(User, 'findByPk').mockResolvedValueOnce(mockUser); // loggedUser
  //   jest.spyOn(User, 'findByPk').mockResolvedValueOnce(mockUser); // user to update
  //   jest.spyOn(User, 'findOne').mockResolvedValue({ id: 999 }); // another user with the same email

  //   const res = await authenticatedRequest();

  //   expect(res.status).toBe(400);
  //   expect(res.body.message).toBe('Email is already in use by another user.');
  //   expect(mockTransaction.rollback).toHaveBeenCalled();
  // });

  // test('500 - Internal server error', async () => {
  //   jest.spyOn(User, 'findByPk').mockRejectedValue(new Error('DB crash'));

  //   const res = await authenticatedRequest();

  //   expect(res.status).toBe(500);
  //   expect(res.body.message).toBe('An error occurred while updating the user.');
  //   expect(mockTransaction.rollback).toHaveBeenCalled();
  // });
});
