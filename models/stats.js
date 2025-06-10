const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Stats = sequelize.define(
    "Stats",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        enemies_killed: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        towers_deployed: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        towers_upgraded: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        gold_earned: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        gems_earned: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        rounds_passed: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        games_played: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        timestamps: false,
        tableName: 'stats'
    });

module.exports = Stats ;