const express = require('express');
const router = express.Router();
const { createGame} = require('../controllers/gameController');
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


module.exports = router;
