const User = require("../models/user");
const FriendShip = require("../models/friendship");
const Game = require("../models/game");
const { Op } = require("sequelize");


const isAdmin = async (req, res, next) => {
    try {
        const userId = req.userId; 
        const user = await User.findByPk(userId);
        const isAdmin = user ? Boolean(user.isAdmin) : false;
        return res.status(200).json({ isAdmin });
    } catch (error) {
        console.error("Error checking admin status:", error);
        return res.status(500).json({
            error: "ServerError",
            message: "An error occurred while checking admin status.",
        });
    }
};
        
const getAllUsers = async (req, res) => {

    try {
        
        const loggedUserId = req.userId;
        const loggedUser = await User.findByPk(loggedUserId);

        if (!loggedUser || loggedUser.isAdmin === false) {
            return res.status(403).json({
                error: "Forbidden",
                message: "You do not have permission to access this resource."
            });
        }

        // Paginación: ?page=1
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        const { count, rows: users } = await User.findAndCountAll({
            attributes: ['id', 'username', 'email', 'isAdmin'],
            limit,
            offset
        });

        res.status(200).json({
            message: "Users retrieved successfully",
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalUsers: count,
            users
        });
    } catch (error) {
        console.error("Error retrieving users:", error);
        res.status(500).json({
            error: "ServerError",
            message: "An error occurred while retrieving users.",
        });
    }
};


// Register a new user
const registerUser = async (req, res) => {

    try {

      const { firstName, lastName, username, email, role, password } = req.body;
      const isAdmin = req.isAdmin ? role : 0;
      
      const newUser = await User.create({
        firstName,
        lastName,
        username,
        email,
        password, 
        isAdmin, 
        activeAvatarId: 1,
        rangeId: 1,
      });
  
      res.status(201).json(newUser);
    } catch (error) {
      if ((error.name === "SequelizeUniqueConstraintError" && error.errors[0].path.includes("email")) ||
        (error.code === "ER_DUP_ENTRY" && error.sqlState === "23000")) {
        return res.status(400).json({
          error: "EmailDuplicate",
          message: "This email is already in use."
        });
      }
  
      console.error("Error registering user:", error);
      res.status(500).json({
        error: "ServerError",
        message: "An error occurred while registering the user."
      });
    }
  };
  


const deleteUser = async (req, res) => {
    try {
        const loggedUserId = req.userId;
        const loggedUser = await User.findByPk(loggedUserId);

        if (!loggedUser || loggedUser.isAdmin === false) {
            return res.status(403).json({
                error: "Forbidden",
                message: "You do not have permission to access this resource."
            });
        }

        const userId = req.params.userId;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                error: "NotFound",
                message: "User not found."
            });
        }

        // Elimina las relaciones en la tabla friendships
        await FriendShip.destroy({
            where: {
                [Op.or]: [
                    { user1Id: userId },
                    { user2Id: userId }
                ]
            }
        });
        
        // Elimina los juegos del usuario
        await Game.destroy({
            where: {
                userId
            }
        });

        //Elimina las estadisticas del usuario
        

        await user.destroy();

        res.status(200).json({
            message: "User deleted successfully",
            userId
        });

    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            error: "ServerError",
            message: "An error occurred while deleting the user.",
        });
    }
};


module.exports = { isAdmin, getAllUsers, deleteUser, registerUser };
