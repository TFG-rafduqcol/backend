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
 *     responses:
 *       200:
 *         description: Horda generada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enemigos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       vida:
 *                         type: integer
 *                         example: 50
 *                 vidaTotalHorda:
 *                   type: integer
 *                   example: 500
 *                 dpsTotal:
 *                   type: number
 *                   example: 250.5
 *                 totalCeldas:
 *                   type: integer
 *                   example: 75
 *       401:
 *         description: No autorizado. Token inválido o ausente.
 *       500:
 *         description: Error interno del servidor.
 */

router.post('/generateHorde/:gameId', generateHorde);

module.exports = router;