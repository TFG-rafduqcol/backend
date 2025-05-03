const sequelize = require('../models/index').sequelize;
const User = require('../models/user');
const Avatar = require('../models/avatar');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const Range = require('../models/range');

require('dotenv').config();


const checkEmail = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { email } = req.body;

    if (!email) {
      await transaction.rollback();
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({
      where: { email },
      transaction 
    });

    if (user) {
      await transaction.commit(); 
      return res.status(200).json({
        exists: true,
        message: "Email already registered!"
      });
    }

    await transaction.commit(); 
    return res.status(200).json({ exists: false });
  } catch (error) {
    await transaction.rollback(); 
    console.error("Error checking email:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const registerPlayer = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { firstName, lastName, username, email, password } = req.body;
    
    if (!firstName || !lastName || !username || !email || !password) {
      await transaction.rollback();
      return res.status(400).json({
        error: "ValidationError",
        message: "Email, password, username, email and password are required.",
      });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      username,
      email,
      password,
      isAdmin: false,
      activeAvatarId: 1,
      rangeId: 1,
    }, { transaction }); 

    await transaction.commit();

    res.status(201).json(newUser);
  } catch (error) {
    await transaction.rollback();
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


// Login a user that is already registered
const loginUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
      const { email, password } = req.body;

      if (!email || !password) {
          await transaction.rollback();
          return res.status(400).json({ 
              error: "ValidationError",
              message: "Email and password are required."
          });
      }

      const user = await User.findOne({
        where: { email },
        include: [
          {
            model: Avatar,
            as: 'active_avatar',
            attributes: ['image_url']
          },
          {
            model: Range,
            as: 'range',
            attributes: ['name', 'image_url']
          }
        ],
        transaction
      });

      if (!user) {
          await transaction.rollback();
          return res.status(404).json({
              error: "EmailNotFound",
              message: "Email not register."
          });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password); 

      if (!isPasswordValid) {
          await transaction.rollback();
          return res.status(401).json({
              error: "InvalidPassword",
              message: "Invalid password."
          });
      }

      const payload = {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin ? 1 : 0
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET); 

      await transaction.commit();

      res.status(200).json({
          message: "Login successful",
          token: token, 
          user: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
              email: user.email, 
              experience: user.experience,
              avatar: user.active_avatar.image_url,
              range: user.range.name,
              range_url: user.range.image_url,
              level: user.level,
              gold: user.gold,
              gems: user.gems,
              isAdmin: user.isAdmin
          }, 
      });
  } catch (error) {
      await transaction.rollback();
      console.error("Error during login:", error);
      res.status(500).json({
          error: "ServerError",
          message: "An error occurred during the login process."
      });
  }
};

// Update user information
const updateUser = async (req, res) => {  
  const transaction = await sequelize.transaction();
  try {
      const loggedUserId = req.userId;
      const loggedUser = await User.findByPk(loggedUserId, { transaction });
      let id;

      if (loggedUser.isAdmin) {
        id = req.params.id;
      } else {
        id = loggedUserId;
      }

      let { firstName, lastName, username, email, password} = req.body;

      if (!firstName || !lastName || !username || !email) {
          await transaction.rollback();
          return res.status(400).json({
              error: "ValidationError",
              message: "First name, last name, username, email and password are required."
          });
      }

      const user = await User.findByPk(id, {
        include: [
          {
            model: Avatar,
            as: 'active_avatar',
            attributes: ['image_url']
          },
          {
            model: Range,
            as: 'range',
            attributes: ['name', 'image_url']
          }
        ],
        transaction
      });

      if (!user) {
          await transaction.rollback();
          return res.status(404).json({
              error: "UserNotFound",
              message: "User not found."
          });
      }

      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email: email }, transaction });
        
        if (existingUser) {
            await transaction.rollback();
            return res.status(400).json({
              error: "EmailAlreadyExists",
              message: "Email is already in use by another user."
          });
        }
      }

      if(password && password !== "") {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          password = hashedPassword;
      } else {
          password = user.password;
      }

      await user.update({
          firstName,
          lastName,
          username,
          email,
          password: password,
      }, { transaction });

      const payload = {
        id: user.id,
        username: user.username,
        email: user.email
      };
      
      const token = jwt.sign(payload, process.env.JWT_SECRET); 

      await transaction.commit();
      
      res.status(200).json({
        message: "User updated successfully",
        token: token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email, 
          experience: user.experience,
          avatar: user.active_avatar.image_url,
          range: user.range.name,
          range_url: user.range.image_url,
          level: user.level,
          gold: user.gold,
          gems: user.gems
        }
      });
  } catch (error) {
      await transaction.rollback();
      console.error("Error updating user:", error);
      res.status(500).json({
          error: "ServerError",
          message: "An error occurred while updating the user."
      });
  }
}


module.exports = { checkEmail, registerPlayer, loginUser, updateUser };
