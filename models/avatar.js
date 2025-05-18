const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Avatar = sequelize.define(
    "Avatar",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        image_url: {
            type: DataTypes.STRING,
            defaultValue: "http://127.0.0.1:8000/www/images/avatar_1.jpeg"
        },
        gems: {
            type: DataTypes.INTEGER,
            defaultValue: 50
        },
    },
    {
        timestamps: false,
        tableName: 'avatars'
    });



module.exports = Avatar;
