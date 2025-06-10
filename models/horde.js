const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const enemy = require('./enemy');

const Horde = sequelize.define('Horde', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    enemyCount: {
        type: DataTypes.VIRTUAL,
        get() {
            const enemyCount = this.getDataValue('enemyCount');
            return enemyCount ? enemyCount.length : 0;
        }
    },
});

Horde.hasMany(enemy, { onDelete: 'cascade' });
enemy.belongsTo(Horde);

module.exports = Horde;


