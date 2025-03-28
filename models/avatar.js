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
            defaultValue: "http://192.168.100.7:8000/www/images/avatar_1.jpeg"
        },
    },
    {
        timestamps: false,
        tableName: 'avatars'
    });



module.exports = Avatar;
