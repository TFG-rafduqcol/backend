const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');

const User = require('./user');
const Game = require('./game');
const Enemy = require('./enemy');
const Tower = require('./tower');
const Projectile = require('./projectile');
const Upgrade = require('./upgrade');
const Avatar = require('./avatar');
const Range = require('./range');
const FriendShip = require('./friendShip');
const Stats = require('./stats');


User.hasMany(Game);
Game.belongsTo(User);



Game.hasMany(Tower, {
  as: 'towers',  
  foreignKey: 'gameId' 
});

Tower.belongsTo(Game, {
  as: 'game',  
  foreignKey: 'gameId'
});

Projectile.hasMany(Tower, {
  foreignKey: 'projectileId',
  as: 'towers'
});
Tower.belongsTo(Projectile, {
  foreignKey: 'projectileId',
  as: 'projectile'
}
  
);

Upgrade.hasOne(Tower, {
  foreignKey: 'upgradeId',
  as: 'tower'
});

Tower.belongsTo(Upgrade, {
  foreignKey: 'upgradeId',
  as: 'upgrade'
});


User.belongsTo(Range, {
  foreignKey: 'rangeId',
  as: 'range'
});
Range.hasMany(User, {
  foreignKey: 'rangeId',
  as: 'users'
});


//Active avatar: A user can have one active avatar, but an avatar can be active for many users
User.belongsTo(Avatar, {
    foreignKey: 'activeAvatarId',
    as: 'active_avatar'
});


//Avatars: A user can have many avatars, and an avatar can belong to many users
User.belongsToMany(Avatar, { 
    through: 'UserAvatars', 
    as : 'avatars', 
    foreignKey: 'userId', 
    otherKey: 'avatarId'});

Avatar.belongsToMany(User, {
  through: 'UserAvatars',
  foreignKey: 'avatarId',
  otherKey: 'userId'
});

//Stats: A user can have one stats, and a stats can belong to one user
User.hasOne(Stats, {
  foreignKey: 'userId',
  as: 'stats', 
  onDelete: 'CASCADE',
});

Stats.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = { sequelize, User, Game, Tower, Projectile, Upgrade, Enemy, Range, Avatar, FriendShip, Stats };