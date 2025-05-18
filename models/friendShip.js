const { DataTypes } = require('sequelize');
const sequelize = require("../config/db");
const User = require('./user'); 

const FriendShip = sequelize.define('FriendShip', {
  user1Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,  
      key: 'id',
    },
  },
  user2Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,  
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  },
}, {
  tableName: 'friendships',
  timestamps: true,
});

FriendShip.belongsTo(User, { foreignKey: 'user1Id', as: 'user1' }); 
FriendShip.belongsTo(User, { foreignKey: 'user2Id', as: 'user2' }); 

module.exports = FriendShip;
