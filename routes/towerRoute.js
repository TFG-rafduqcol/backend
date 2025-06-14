const express = require('express');
const router = express.Router();
const { deployTower, upgradeTower, deleteTower } = require('../controllers/towerController');
const authenticateToken = require('../middlewares/authMiddleware');


/**
 * @swagger
 * /api/towers/deployTower:
 *   post:
 *     tags:
 *       - Tower
 *     summary: Deploy a tower in a game session
 *     description: Deploys a new tower with the given properties (name, position) into a specific game session.
 *     security:
 *       - bearerAuth: []
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
 *                 example: "2"
 *               name:
 *                 type: string
 *                 description: The name of the tower to be deployed. 
 *                 example: "stoenCannon"
 *               position:
 *                 type: integer
 *                 description: The position on the map where the tower will be deployed.
 *                 example: 1
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
 *                       example: "stoenCannon"
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


/**
 * @swagger
 * /api/towers/upgradeTower/{towerId}:
 *   put:
 *     tags:
 *       - Tower    
 *     summary: Upgrade a tower in a game session
 *     description: Upgrades a tower by applying the corresponding upgrade and boosting its stats (damage, range) based on the tower's level.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: towerId
 *         required: true
 *         description: The ID of the tower to be upgraded.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Tower successfully upgraded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Tower upgraded successfully'
 *                 tower:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the upgraded tower.
 *                       example: 1
 *                     name:
 *                       type: string
 *                       description: The name of the tower.
 *                       example: "stoneCannon"
 *                     cost:
 *                       type: integer
 *                       description: The new cost of the tower after upgrade.
 *                       example: 200
 *                     fire_rate:
 *                       type: number
 *                       format: float
 *                       description: The updated fire rate of the tower.
 *                       example: 1.1
 *                     range:
 *                       type: number
 *                       format: float
 *                       description: The updated range of the tower.
 *                       example: 0.46
 *                     upgradeId:
 *                       type: integer
 *                       description: The ID of the upgrade applied to the tower.
 *                       example: 2
 *       400:
 *         description: Bad request, invalid tower ID or upgrade failure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Invalid tower ID or upgrade failed'
 *       404:
 *         description: Tower or game not found, or user not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Tower not found or game not found'
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
router.put('/upgradeTower/:towerId', authenticateToken, upgradeTower);

/**
 * @swagger
 * /api/towers/deleteTower/{towerId}:
 *   delete:
 *     tags:
 *       - Tower
 *     summary: Delete a tower from a game session
 *     description: Removes a tower from the game, refunding 50% of its cost back to the game balance.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: towerId
 *         required: true
 *         description: The ID of the tower to be deleted.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Tower successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Tower deleted successfully'
 *       404:
 *         description: Tower not found or user not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Tower not found or game not found'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Failed to delete tower'
 */

router.delete('/deleteTower/:towerId', authenticateToken, deleteTower);

module.exports = router;