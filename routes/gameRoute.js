const express = require('express');
const router = express.Router();
const { createGame, deployTower } = require('../controllers/gameController');
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
 * /api/games/deployTower:
 *   post:
 *     tags:
 *       - Game
 *     summary: Deploy a tower in a game session
 *     description: Deploys a new tower with the given properties (name, position) into a specific game session.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gameId:
 *                 type: string
 *                 description: The ID of the game where the tower will be deployed.
 *                 example: "3"
 *               name:
 *                 type: string
 *                 description: The name of the tower to be deployed. 
 *                 example: "canon"
 *               position:
 *                 type: integer
 *                 description: The position on the map where the tower will be deployed.
 *                 example: 5
 *     responses:
 *       200:
 *         description: Tower successfully deployed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Tower deployed successfully'
 *                 tower:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the deployed tower.
 *                       example: 1
 *                     name:
 *                       type: string
 *                       description: The name of the tower.
 *                       example: "canon"
 *                     cost:
 *                       type: integer
 *                       description: The cost of the tower.
 *                       example: 100
 *                     fire_rate:
 *                       type: number
 *                       format: float
 *                       description: The fire rate of the tower.
 *                       example: 1.0
 *                     range:
 *                       type: number
 *                       format: float
 *                       description: The range of the tower.
 *                       example: 0.4
 *                     position:
 *                       type: integer
 *                       description: The position of the tower on the map.
 *                       example: 5
 *                     projectileId:
 *                       type: integer
 *                       description: The ID of the projectile associated with the tower.
 *                       example: 2
 *       400:
 *         description: Bad request, invalid tower name or projectiles not found for the selected tower
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Invalid tower name'
 *       404:
 *         description: Game not found or user not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Game not found or user not authorized'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Internal server error'
 */

router.post('/deployTower', authenticateToken, deployTower);

module.exports = router;
