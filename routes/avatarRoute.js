const express = require('express');
const router = express.Router();
const { getMyAvatars, changeMyActiveAvatar, buyAvatar } = require('../controllers/avatarController');
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

/**
 * @swagger
 * /api/avatars/buyAvatar/{avatarId}:
 *  post:
 *   tags:
 *    - Avatar
 *   summary: Purchase an avatar
 *   description: Allows a logged-in user to purchase an avatar by its ID if they have enough gems.
 *   parameters:
 *    - name: avatarId
 *      in: path
 *      required: true
 *      description: ID of the avatar to be purchased
 *      schema:
 *       type: integer
 *       example: 3
 *   responses:
 *    200:
 *     description: Avatar purchased successfully
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         message:
 *          type: string
 *          example: Avatar purchased successfully.
 *    400:
 *     description: Insufficient coins to purchase avatar
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         error:
 *          type: string
 *          example: InsufficientCoins
 *         message:
 *          type: string
 *          example: You do not have enough coins to buy this avatar.
 *    404:
 *     description: Avatar or user not found
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         error:
 *          type: string
 *          example: AvatarNotFound
 *         message:
 *          type: string
 *          example: Avatar not found
 *    500:
 *     description: Internal server error
 *     content:
 *      application/json:
 *       schema:
 *        type: object
 *        properties:
 *         message:
 *          type: string
 *          example: Internal server error.
 */

router.post('/buyAvatar/:avatarId', authenticateToken, buyAvatar);

module.exports = router;