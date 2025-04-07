const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { STROKE_TYPES } = require("../utils/strokes");

const Projectile = sequelize.define("Projectile", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 50],
        },
    },
    speed: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
            min: 1,
            max: 20,
        },
    },
    stroke: {
        type: DataTypes.ENUM(...STROKE_TYPES),
        allowNull: false,
    },
    avatar: {
        type: DataTypes.JSON,
    },  
}, {
    timestamps: false,
    tableName: "projectiles",
});

module.exports = Projectile;
