const express = require('express');
const router = express.Router();
const { getMyAvatars, changeMyActiveAvatar } = require('../controllers/avatarController');
const authenticateToken = require("../middlewares/authMiddleware");

/** 
 * @swagger
 * /api/avatars/getMyAvatars:
 *  get:
 *   tags:
 *    - Avatar
 *   summary: Get all avatars of the logged user
 *   description: Get all avatars of the logged user
 *   responses:
 *    200:
 *     description: Avatars retrieved successfully
 *    404:
 *     description: User not found
 *    500:
 *     description: An error occurred while retrieving user avatars
 */

router.get('/getMyAvatars', authenticateToken, getMyAvatars);



/**
 * @swagger
 * /api/avatars/changeMyActiveAvatar/{avatarId}:
 *  put:
 *   tags:
 *    - Avatar
 *   summary: Change the active avatar of the logged user
 *   description: Change the active avatar of the logged user by providing the avatar ID.
 *   parameters:
 *    - name: avatarId
 *      in: path
 *      required: true
 *      description: ID of the avatar to be set as active
 *      schema:
 *       type: integer
 *       example: 2
 *   responses:
 *    200:
 *     description: Active avatar updated successfully
 *    404:
 *     description: Avatar not found or avatar not associated with the user
 *    500:
 *     description: An error occurred while updating the active avatar
 */

router.put('/changeMyActiveAvatar/:avatarId', authenticateToken, changeMyActiveAvatar);

module.exports = router;