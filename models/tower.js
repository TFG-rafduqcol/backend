const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Tower = sequelize.define("Tower", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            len: [3, 50],
        },
    },
    cost: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 999,
        },
    },
    avatar: {
        type: DataTypes.JSON,
    },
    damage: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
            min: 1,
            max: 99,
        },
    },
    fire_rate: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
            min: 0,
            max: 10,
        },
    },
    range: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
            min: 0,
            max: 10,
        },
    }, 
    position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 8,
        },
    },
}, {
    timestamps: false,
    tableName: "towers",
});

module.exports = Tower;
