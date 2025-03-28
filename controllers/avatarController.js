const User = require("../models/user");
const Avatar = require("../models/avatar");

const getMyAvatars = async (req, res) => {
  
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
        ]
    });

    const allAvatars = await Avatar.findAll({
      attributes: ['id', 'image_url']
    });

    if (!user) {
      return res.status(404).json({
        error: "UserNotFound",
        message: "User not found",
      });
    }

  const userAvatarIds = user.avatars.map(avatar => avatar.id);
  const remainingAvatars  = allAvatars.filter(avatar => !userAvatarIds.includes(avatar.id));

  res.status(200).json({
    message: "Avatars retrieved successfully",
    user_avatars: user.avatars,
    active_avatar: user.active_avatar,
    remainings_avatars: remainingAvatars  
    });
  } catch (error) {
    console.error("Error retrieving user avatars:", error);
    res.status(500).json({
      error: "ServerError",
      message: "An error occurred while retrieving user avatars.",
      });
    }
};


const changeMyActiveAvatar = async (req, res) => {

  try {

    const loggedUserId = req.userId;
    const avatarId = req.params.avatarId;
    
    const avatar = await Avatar.findByPk(avatarId);

    const userAvatars = await User.findOne({
      where: { id: loggedUserId },
      include: [
        { 
          model: Avatar,
          as: 'avatars',  
          attributes: ['id', 'image_url'] 
        }
      ]
    });

    console.log(userAvatars.avatars);

    if (!avatar || !userAvatars.avatars.some(a => a.id === parseInt(avatarId))) {
      return res.status(404).json({
        error: "AvatarNotUnlocked",
        message: "You have not unlocked this avatar.",
      });
    }
    

    await User.update({ activeAvatarId: avatarId }, { where: { id: loggedUserId } });
        
        return res.status(200).json({ message: "Active avatar updated successfully." });
    } catch (error) {
        console.error("Error updating active avatar:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};


module.exports = { getMyAvatars, changeMyActiveAvatar };