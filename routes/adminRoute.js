const express = require('express');
const { isAdmin, getAllUsers, registerUser, deleteUser } = require('../controllers/adminController'); 
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();


/**
 * @swagger
 * /api/admin/isAdmin:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Check if current user is admin
 *     description: Returns a boolean indicating whether the authenticated user is an administrator.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin status retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAdmin:
 *                   type: boolean
 *       401:
 *         description: Unauthorized - missing or invalid token.
 *       500:
 *         description: Internal server error.
 */

router.get('/isAdmin', authenticateToken, isAdmin);

/**
 * @swagger
 * /api/admin/getAllUsers:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Retrieve all users
 *     description: Returns a list of all users. Only accessible by administrators.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: You do not have permission to access this resource.
 *       500:
 *         description: Internal server error.
 */

router.get('/getAllUsers', authenticateToken, getAllUsers);

/**
 * @swagger
 * /api/admin/register:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Register a new user
 *     description: Registers a new user in the system. Only accessible by administrators.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - username
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: integer
 *                 description: 0 for normal user, 1 for admin.
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User successfully registered.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Email is already in use.
 *       401:
 *         description: Unauthorized - missing or invalid token.
 *       500:
 *         description: Internal server error.
 */


router.post('/register', authenticateToken, registerUser);

/**
 * @swagger
 * /api/admin/deleteUser/{userId}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete a user
 *     description: Deletes a user by their ID. Only accessible by administrators.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to be deleted.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User successfully deleted.
 *       403:
 *         description: You do not have permission to delete this user.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

router.delete('/deleteUser/:userId', authenticateToken, deleteUser);

module.exports = router;