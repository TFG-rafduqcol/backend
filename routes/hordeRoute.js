const express = require('express');
const authenticateToken = require('../middlewares/authMiddleware');
const { generateHorde } = require('../controllers/hordeController');
const router = express.Router();

/**
 * @swagger
 * /api/hordes/generateHorde/{gameId}:
 *   post:
 *     tags:
 *       - Horde
 *     summary: Generar una horda de enemigos
 *     description: Genera una horda adaptada al DPS de las torres colocadas en una partida. Requiere autenticación.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         description: ID de la partida para la cual se genera la horda.
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Datos sobre enemigos derrotados y oro ganado para ajustar la dificultad
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               earnedGold:
 *                 type: integer
 *                 description: Cantidad de oro ganado en la ronda anterior
 *                 example: 50
 *               lostedLives:
 *                 type: integer
 *                 description: Vidas perdidas en la ronda anterior
 *                 example: 2
 *               enemiesKilled:
 *                 type: integer
 *                 description: Cantidad de enemigos eliminados en la ronda anterior
 *                 example: 8
 *     responses:
 *       200:
 *         description: Horda generada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pathPixels:
 *                   type: integer
 *                   description: Longitud total del camino en píxeles
 *                   example: 1250
 *                 towers:
 *                   type: array
 *                   description: Información de las torres colocadas
 *                   items:
 *                     type: object
 *                     properties:
 *                       position:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "stoneCannon"
 *                       x:
 *                         type: integer
 *                         example: 255
 *                       y:
 *                         type: integer
 *                         example: 670
 *                       range:
 *                         type: integer
 *                         example: 120
 *                       damage:
 *                         type: integer
 *                         example: 10
 *                       fire_rate:
 *                         type: number
 *                         example: 0.5
 *                 enemies:
 *                   type: array
 *                   description: Información de los enemigos en la horda
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       spawnTime:
 *                         type: number
 *                         example: 0
 *                       speed:
 *                         type: number
 *                         example: 0.8
 *                       health:
 *                         type: integer
 *                         example: 50
 *                       name:
 *                         type: string
 *                         example: "devilOrc"
 *                 totalHealth:
 *                   type: integer
 *                   description: Salud total de la horda
 *                   example: 500
 *                 totalDamage:
 *                   type: number
 *                   description: Daño total que podrían infligir las torres
 *                   example: 250.5
 *                 diff:
 *                   type: number
 *                   description: Diferencia entre salud total y daño ajustado
 *                   example: 25.5
 *       400:
 *         description: Solicitud inválida, falta gameId o datos incorrectos.
 *       401:
 *         description: No autorizado. Token inválido o ausente.
 *       500:
 *         description: Error interno del servidor.
 */

router.post('/generateHorde/:gameId', authenticateToken, generateHorde);

module.exports = router;