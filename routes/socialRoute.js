const express = require('express');
const { getUserByUsernameOrId, getUserById, getMyFriends, getMyFriendRequests, sendFriendRequest, changeFriendRequestStatus, removeFriend } = require('../controllers/socialController');
const authenticateToken = require("../middlewares/authMiddleware");


const router = express.Router();

/**
 * @swagger
 * /api/social/getUserByUsernameOrId/{usernameOrId}:
 *   get:
 *     tags:
 *       - Social
 *     summary: Get user by username or ID
 *     description: Fetch a user using their username or ID
 *     parameters:
 *       - in: path
 *         name: usernameOrId
 *         required: true
 *         description: The username or ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       401: 
 *          description: Unauthorized access - Token missing or invalid
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.get('/getUserByUsernameOrId/:usernameOrId', authenticateToken, getUserByUsernameOrId);

/**
 * @swagger
 * /api/social/getUserById/{userId}:
 *   get:
 *     tags:
 *       - Social
 *     summary: Get user by ID
 *     description: Fetch a user using their ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User found
 *       401: 
 *         description: Unauthorized access - Token missing or invalid
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/getUserById/:userId', authenticateToken, getUserById);


/**
 * @swagger
 * /api/social/getMyFriends:
 *   get:
 *     tags:
 *       - Social
 *     summary: Get friends of the logged-in user
 *     description: Fetch all friends of the logged-in user
 *     responses:
 *       200:
 *         description: List of friends found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Friends not found
 *       500:
 *         description: Server error
 */

router.get('/getMyFriends', authenticateToken, getMyFriends);

/**
 * @swagger
 * /api/social/getMyFriendRequests:
 *   get:
 *     tags:
 *       - Social
 *     summary: Get friend requests of the logged-in user
 *     description: Fetch all friend requests for the logged-in user
 *     responses:
 *       200:
 *         description: List of friend requests found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No friend requests found
 *       500:
 *         description: Server error
 */

router.get('/getMyFriendRequests', authenticateToken, getMyFriendRequests);

/**
 * @swagger
 * /api/social/sendFriendRequest/{userId}:
 *   post:
 *     tags:
 *       - Social
 *     summary: Send a friend request
 *     description: Send a friend request to a user by their user ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user to send the friend request to
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend request sent successfully
 *       400:
 *         description: Friend request already sent or invalid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/sendFriendRequest/:userId', authenticateToken, sendFriendRequest);

/**
 * @swagger
 * /api/social/changeFriendRequestStatus/{userId}:
 *   post:
 *     tags:
 *       - Social
 *     summary: Change the status of a friend request
 *     description: Accept or reject a friend request from a user by their user ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user whose friend request status is being changed
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *                 example: accepted
 *     responses:
 *       200:
 *         description: Friend request status updated successfully
 *       400:
 *         description: Invalid status or request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Friend request not found
 *       500:
 *         description: Server error
 */

router.post('/changeFriendRequestStatus/:userId', authenticateToken, changeFriendRequestStatus);

/**
 * @swagger
 * /api/social/removeFriend/{userId}:
 *   delete:
 *     tags:
 *       - Social
 *     summary: Remove a friend
 *     description: Remove a user from your friend list by their user ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the friend to remove
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Friend not found
 *       500:
 *         description: Server error
 */

router.delete('/removeFriend/:userId', authenticateToken, removeFriend);

module.exports = router;
