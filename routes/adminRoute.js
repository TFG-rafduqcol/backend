const express = require('express');
const { isAdmin, getAllUsers, registerUser, deleteUser } = require('../controllers/adminController'); 
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/isAdmin', authenticateToken, isAdmin);

router.get('/getAllUsers', authenticateToken, getAllUsers);

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


router.post('/register', authenticateToken, registerUser);

router.delete('/deleteUser/:userId', authenticateToken, deleteUser);

module.exports = router;