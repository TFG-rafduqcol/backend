const User = require('../models/user');
const FriendShip = require('../models/friendShip');
const Avatar = require('../models/avatar');
const Range = require('../models/range');
const { Op } = require('sequelize');


// Returns a user by username or ID
const getUserByUsernameOrId = async (req, res) => {
  const loggedUserId = req.userId;
  try {
    const { usernameOrId } = req.params;
    if (!usernameOrId) {
      return res.status(400).json({ message: "Username is required" });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { id: usernameOrId },
          { username: usernameOrId }
        ]
      },
      include: [
        { model: Avatar, as: 'active_avatar', attributes: ['image_url'] },
        { model: Range, as: 'range', attributes: ['name', 'image_url'] }
      ]
    });

    if (!users.length) {
      if (existingUser) {
            return res.status(404).json({
                error: "UserNotFound",
            });
        }
    }

    const usersWithFriendshipStatus = await Promise.all(users.map(async (user) => {
      const friendship = await FriendShip.findOne({
        where: {
          [Op.or]: [
            { user1Id: loggedUserId, user2Id: user.id },
            { user1Id: user.id, user2Id: loggedUserId }
          ]
        }
      });

      let friendshipStatus = "not_friends";

      if (user.id === loggedUserId) {
        friendshipStatus = "me";
      } else if (friendship) {
        if (friendship.user2Id === loggedUserId && friendship.status === 'rejected') {
          friendshipStatus = "rejected_by_yourself";
        } else {
          friendshipStatus = (friendship.user1Id === loggedUserId && friendship.status === 'pending')
            ? "already_send"
            : friendship.status;
        }
      }
      

      return {
        id: user.id,
        username: user.username,
        avatar: user.active_avatar?.image_url || null,
        level: user.level,
        range: user.range?.name || null,
        range_url: user.range?.image_url || null,
        friendshipStatus
      };
    }));

    return res.status(200).json({
      users: usersWithFriendshipStatus,
      message: "Users retrieved successfully"
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const getUserById = async(req, res) => {

  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findByPk(userId, {
      include: [
        { model: Avatar, as: 'active_avatar', attributes: ['image_url'] },
        { model: Range, as: 'range', attributes: ['name', 'image_url'] }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      player: {
        id: user.id,
        username: user.username,
        avatar: user.active_avatar?.image_url || null,
        level: user.level,
        range: user.range?.name || null,
        range_url: user.range?.image_url || null,
        experience: user.experience,
      }
    });
  } catch (error) {
      console.error("Error getting user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

      


// Returns the friends of a user by user ID
const getMyFriends = async (req, res) => {
  const loggedUserId = req.userId;
  if (!loggedUserId) {
      return res.status(400).json({ message: "User ID is required" });
  }

  try {
      const friendships = await FriendShip.findAll({
          where: {
              [Op.or]: [
                  { user1Id: loggedUserId },
                  { user2Id: loggedUserId }
              ],
              status: 'accepted'
          },
          include: [
              {
                  model: User,
                  as: 'user1',
                  attributes: ['id', 'username', 'experience'],
                  include: [{
                      model: Avatar,
                      as: 'active_avatar',
                      attributes: ['image_url']
                  }, 
                    {
                        model: Range,
                        as: 'range',
                        attributes: ['name', 'image_url']
                    }]
              },
              {
                  model: User,
                  as: 'user2',
                  attributes: ['id', 'username', 'experience'],
                  include: [{
                      model: Avatar,
                      as: 'active_avatar',
                      attributes: ['image_url']
                  }, 
                    {
                        model: Range,
                        as: 'range',
                        attributes: ['name', 'image_url']
                    }]
              }
          ],
      });


      const friends = friendships.map(friendship => {
          const user = friendship.user1Id === loggedUserId ? friendship.user2 : friendship.user1;
          return user ? {
              id: user.id,
              username: user.username,
              avatar: user.active_avatar?.image_url || null,
              range: user.range?.name || null,
              range_url: user.range?.image_url || null,
              level: user.level
            } : null;
      }).filter(friend => friend !== null);

      return res.status(200).json({
          friends,
          message: "Friends retrieved successfully"
      });
  } catch (error) {
      console.error("Error getting friends:", error);
      return res.status(500).json({ message: "Internal server error" });
  }
};

// Returns the friend requests of a user by user ID
const getMyFriendRequests = async (req, res) => {
  const loggedUserId = req.userId;
  
  if (!loggedUserId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const friendships = await FriendShip.findAll({
      where: { user2Id: loggedUserId, status: 'pending' },
      include: [
        {
          model: User,
          as: 'user1',
          attributes: ['id', 'username', 'experience'],
          include: [
            { model: Avatar, as: 'active_avatar', attributes: ['image_url'] },
            { model: Range, as: 'range', attributes: ['name', 'image_url'] }
          ]
        }
      ]
    });

    const users = friendships
      .map(friendship => friendship.user1)
      .filter(user => user)  
      .map(user => ({
        id: user.id,
        username: user.username,
        avatar: user.active_avatar?.image_url || null,
        range: user.range?.name || null,
        range_url: user.range?.image_url || null,
        level: user.level
      }));

    return res.status(200).json({
      users,
      message: "Friend requests retrieved successfully"
    });
  } catch (error) {
    console.error("Error getting friend requests:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Send a friend request to a user by user ID
const sendFriendRequest = async (req, res) => {
  const loggedUserId = req.userId;
  const { userId } = req.params;

  try {
      if (!loggedUserId || !userId) {
          return res.status(400).json({ message: "User ID and friend ID are required" });
      }

      const friendship = await FriendShip.findOne({
          where: {
              [Op.or]: [
                  { user1Id: loggedUserId, user2Id: userId },
                  { user1Id: userId, user2Id: loggedUserId }
              ]
          }
      });

      if (friendship) {
        await friendship.destroy();
      }

      await FriendShip.create({
          user1Id: loggedUserId,
          user2Id: userId,
          status: 'pending'
      });

      return res.status(200).json({ message: "Friend request sent successfully" });
  } catch (error) {
      console.error("Error sending friend request:", error);
      return res.status(500).json({ message: "Internal server error" });
  }
};


// Change the status of a friend request 
const changeFriendRequestStatus = async (req, res) => {
  const loggedUserId = req.userId;
  const { userId } = req.params;  
  const { status } = req.body;

  try {
      if (!loggedUserId || !userId || !status) {
          return res.status(400).json({ message: "User ID, friend ID, and status are required" });
      }

      const friendship = await FriendShip.findOne({
          where: {
              user1Id: userId,        
              user2Id: loggedUserId 
          }
      });

      if (!friendship) {
          return res.status(404).json({ message: "Friend request not found or you're not authorized to modify it" });
      }

      friendship.status = status;
      await friendship.save();

      return res.status(200).json({ message: "Friend request modified successfully" });
  } catch (error) {
      console.error("Error modifying friend request:", error);
      return res.status(500).json({ message: "Internal server error" });
  }
};

const removeFriend = async (req, res) => {
  const loggedUserId = req.userId;
  const { userId } = req.params;

  try {
      if (!loggedUserId || !userId) {
          return res.status(400).json({ message: "User ID and friend ID are required" });
      }

      const friendship = await FriendShip.findOne({
          where: {
              [Op.or]: [
                  { user1Id: loggedUserId, user2Id: userId },
                  { user1Id: userId, user2Id: loggedUserId }
              ]
          }
      });

      if (!friendship) {
          return res.status(404).json({ message: "Friendship not found" });
      }

      await friendship.destroy();

      return res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
      console.error("Error removing friend:", error);
      return res.status(500).json({ message: "Internal server error" });
  }
};






module.exports = { getUserByUsernameOrId, getUserById, getMyFriends, getMyFriendRequests, sendFriendRequest, changeFriendRequestStatus, removeFriend }; 