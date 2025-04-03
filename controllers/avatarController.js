const sequelize = require('../models/index').sequelize;
const User = require("../models/user");
const Avatar = require("../models/avatar");
const getMyAvatars = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const loggedUserId = req.userId;

    const user = await User.findOne({
      where: { id: loggedUserId },
      include: [
          {
            model: Avatar,
            as: 'active_avatar',  
            attributes: ['id', 'image_url']  
          },
          {
            model: Avatar,
            as: 'avatars',  
            attributes: ['id', 'image_url'] 
          }
        ],
      transaction
    });

    const allAvatars = await Avatar.findAll({
      attributes: ['id', 'image_url'],
      transaction
    });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        error: "UserNotFound",
        message: "User not found",
      });
    }

    const userAvatarIds = user.avatars.map(avatar => avatar.id);
    const remainingAvatars = allAvatars.filter(avatar => !userAvatarIds.includes(avatar.id));

    await transaction.commit();
    
    res.status(200).json({
      message: "Avatars retrieved successfully",
      user_avatars: user.avatars,
      active_avatar: user.active_avatar,
      remainings_avatars: remainingAvatars  
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error retrieving user avatars:", error);
    res.status(500).json({
      error: "ServerError",
      message: "An error occurred while retrieving user avatars.",
    });
  }
};

const changeMyActiveAvatar = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const loggedUserId = req.userId;
    const avatarId = req.params.avatarId;

    const avatar = await Avatar.findByPk(avatarId, { transaction });

    const userAvatars = await User.findOne({
      where: { id: loggedUserId },
      include: [
        { 
          model: Avatar,
          as: 'avatars',  
          attributes: ['id', 'image_url'] 
        }
      ],
      transaction
    });

    if (!avatar || !userAvatars.avatars.some(a => a.id === parseInt(avatarId))) {
      await transaction.rollback();
      return res.status(404).json({
        error: "AvatarNotUnlocked",
        message: "You have not unlocked this avatar.",
      });
    }

    await User.update({ activeAvatarId: avatarId }, { where: { id: loggedUserId }, transaction });
    await transaction.commit();
        
    return res.status(200).json({ message: "Active avatar updated successfully." });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating active avatar:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


module.exports = { getMyAvatars, changeMyActiveAvatar };