const express = require('express');
const { checkEmail, registerPlayer, loginUser, updateUser } = require('../controllers/authController'); 
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/auth/checkEmail:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Check if an email is already registered
 *     description: Verifies if the provided email is already registered in the system.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email to check
 *                 example: "payer1@email.com"
 *     responses:
 *       200:
 *         description: Email is available or already registered
 *       400:
 *         description: Bad request, invalid email format
 *       500:
 *         description: Server error
 */
router.post('/checkEmail', checkEmail);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Registers a new user with the provided information (first name, last name, email, password, etc.).
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *                 example: "newUser"
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *                 example: "newUser"
 *               username:
 *                 type: string
 *                 description: User's username
 *                 example: "newUser"
 *               email:
 *                 type: string
 *                 description: User's email
 *                 example: "newuser@email.com"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "securePassword123"
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Bad request, missing fields or invalid data
 *       500:
 *         description: Server error
 */
router.post('/register', registerPlayer);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: User login
 *     description: Logs in a user using their credentials (email and password).
 *     security:
 *      - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's email
 *                 example: "player2@email.com"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "Rafa1234"
 *     responses:
 *       200:
 *         description: Login successful, returns authentication token
 *       400:
 *         description: Bad request, incorrect credentials
 *       401:
 *        description: Incorrect password
 * 
 *       404:
 *        description: Email not found
 * 
 *       500:
 *         description: Server error
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/auth/update/{id}:
 *   put:
 *     tags:
 *       - Auth
 *     summary: Update user information
 *     description: Allows a user to update their information (email, password, etc.) using their user ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: New first name for the user
 *                 example: "changedFirstName"
 *               lastName:
 *                 type: string
 *                 description: New last name for the user
 *                 example: "changedLastName"
 *               username:
 *                 type: string
 *                 description: New username for the user
 *                 example: "newUser"
 *               email:
 *                 type: string
 *                 description: New email for the user
 *                 example: "newemail@email.com"
 *               password:
 *                 type: string
 *                 description: New password for the user
 *                 example: "newSecurePassword"
 *     responses:
 *       200:
 *         description: User information successfully updated
 *       400:
 *         description: Bad request, missing fields or invalid data
 *       404:
 *         description: User not found
 *       401: 
 *         description: Unauthorized access - Token missing or invalid
 *       500:
 *         description: Server error
 *       security:
 *       - bearerAuth: []  # Aquí indicamos que se necesita el token para este endpoint
 */
router.put('/update/:id', authenticateToken, updateUser);

module.exports = router;
