const express = require('express');
const router = express.Router();
const { createGame, getGameById} = require('../controllers/gameController');
const authenticateToken = require('../middlewares/authMiddleware');


/**
 * @swagger
 * /api/games/createGame:
 *   post:
 *     tags:
 *       - Game
 *     summary: Create a new game session
 *     description: Creates a new game session with the provided map, path, and user ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               path:
 *                 type: string
 *                 description: The level path within the map.
 *                 example: "/level-1"
 *     responses:
 *       201:
 *         description: Game session successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier of the created game session.
 *                   example: "65c9b7a34d1a6e0023e6f7c5"
 *                 map:
 *                   type: string
 *                   example: "DesertArena"
 *                 path:
 *                   type: string
 *                   example: "/level-1"
 *                 userId:
 *                   type: string
 *                   description: ID of the user who created the session.
 *                   example: "user123"
 *       400:
 *         description: Bad request, missing fields or invalid data
 *       401:
 *         description: Unauthorized, token missing or invalid
 *       500:
 *         description: Internal server error
 */
router.post('/createGame', authenticateToken, createGame);



/**
 * @swagger
 * /api/games/getGame/{gameId}:
 *   get:
 *     tags:
 *       - Game
 *     summary: Retrieve a game session by ID
 *     description: Fetches the details of a specific game session by its unique ID. The session must belong to the authenticated user.
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the game session to retrieve.
 *     responses:
 *       200:
 *         description: Game session retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "65c9b7a34d1a6e0023e6f7c5"
 *                 map:
 *                   type: string
 *                   example: "DesertArena"
 *                 path:
 *                   type: string
 *                   example: "/level-1"
 *                 userId:
 *                   type: string
 *                   example: "user123"
 *       403:
 *         description: Forbidden – the game does not belong to the authenticated user
 *       404:
 *         description: Game not found
 *       401:
 *         description: Unauthorized – token missing or invalid
 *       500:
 *         description: Internal server error
 */

router.get('/getGame/:gameId', authenticateToken, getGameById);

module.exports = router;
