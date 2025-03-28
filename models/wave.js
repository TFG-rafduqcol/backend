const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const enemy = require('./enemy');

const Wave = sequelize.define('Wave', {
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

Wave.hasMany(enemy, { onDelete: 'cascade' });
enemy.belongsTo(Wave);

module.exports = Wave;


