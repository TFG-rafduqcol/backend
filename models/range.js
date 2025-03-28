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
            defaultValue: "Bronze",
            validate: {
                isIn: [["Bronze", "Silver", "Gold", "Diamond", "Master"]],
            },
        },
        image_url: {
            type: DataTypes.STRING,
            defaultValue: "http://192.168.100.7:8000/www/images/master.png"
        },
    },
    {
        timestamps: false,
        tableName: 'ranges'
    });

module.exports = Range ;