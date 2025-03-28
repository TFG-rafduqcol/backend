const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Upgrade = sequelize.define("Upgrade", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    cost: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 999,
        },
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 999,
        },
    },
    damage_boost: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
            min: 0,
            max: 1,
        },
    },
    range_boost: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
            min: 0,
            max: 1,
        },
    },
}, {
    timestamps: false,
    tableName: "upgrades",
});

module.exports = Upgrade;
