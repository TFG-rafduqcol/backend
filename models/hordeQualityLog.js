const { DataTypes } = require("sequelize");

const sequelize = require("../config/db");

const hordeQualityLog = sequelize.define("hordeQualityLog", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    hordeLog: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    towerPositions: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    round: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 1000, 
        },
    },
    quality: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100,
        },
    },
    gameId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'games', 
            key: 'id',
        },
    },



}   , {
    timestamps: true, 
    tableName: 'hordequalitylogs', 
});



module.exports = hordeQualityLog;
