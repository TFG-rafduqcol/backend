const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { STROKE_TYPES } = require("../utils/strokes");

const Enemy = sequelize.define(
    "Enemy",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 999,
            },
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                len: [3, 50],
            },
        },
        health: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 999,
            },
        },
        speed: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            validate: {
                min: 0,
                max: 10,
            },
        },
        lifes : {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 999,
            },
        },
        gold: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
                max: 100,
            },
        },
        avatar: {
            type: DataTypes.JSON,
        },
    },
    {
        timestamps: false,
        tableName: "enemies",
    }
);

module.exports = Enemy;
