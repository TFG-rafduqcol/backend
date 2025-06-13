const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Range = sequelize.define(
    "Range",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            defaultValue: "Silver",
            validate: {
                isIn: [["Silver", "Gold", "Master"]],
            },
        },
        image_url: {
            type: DataTypes.STRING,
            defaultValue: "https://127.0.0.1:8000/www/images/silver.png"
        },
    },
    {
        timestamps: false,
        tableName: 'ranges'
    });

module.exports = Range ;