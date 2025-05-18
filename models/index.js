const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');

const User = require('./user');
const Game = require('./game');
const Wave = require('./wave');
const Enemy = require('./enemy');
const Tower = require('./tower');
const Projectile = require('./projectile');
const Upgrade = require('./upgrade');
const Avatar = require('./avatar');
const Range = require('./range');
const FriendShip = require('./friendShip');


User.hasMany(Game);
Game.belongsTo(User);

Game.belongsToMany(Wave, { through: 'GameWaves' });
Wave.belongsToMany(Game, { through: 'GameWaves' });

Wave.belongsToMany(Enemy, { through: 'WaveEnemies' });
Enemy.belongsToMany(Wave, { through: 'WaveEnemies' });


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

module.exports = { sequelize, User, Game, Wave, Tower, Projectile, Upgrade, Enemy, Range, Avatar, FriendShip };