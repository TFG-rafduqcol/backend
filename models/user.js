const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const bcrypt = require("bcrypt");

const User = sequelize.define( "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [3, 50],
      },
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [3, 50],
      },
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [3, 10],
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [8, 255],
        is: {
          args: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
          msg: "The password must contain at least 8 characters, one lowercase letter, one uppercase letter, and one number.",
        },
      },
    },
    experience: {
      type: DataTypes.INTEGER,
      defaultValue: 2000,
      validate: {
        min: 2000,
        max: 31700,
      },
    },
    gold: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 1000000,
      },
    },
    gems: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 999,
      },
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  
  },
  
  {
    timestamps: true,
    tableName: "users",
    
    getterMethods: {
      level() {
        const experience = this.experience;
        const baseExperience = 2000;
        const additionalExperience = 300;
        return Math.floor((experience - baseExperience) / additionalExperience) + 1; 
      }
    }
  }
);

User.belongsToMany(User, { 
  through: 'FriendShip', 
  as: 'Friends', 
  foreignKey: 'user1Id', 
  otherKey: 'user2Id' 
});


User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

module.exports = User;
