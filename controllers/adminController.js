const User = require("../models/user");
const FriendShip = require("../models/friendship");
const Game = require("../models/game");
const { Op } = require("sequelize");

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


module.exports = { getAllUsers, deleteUser };
