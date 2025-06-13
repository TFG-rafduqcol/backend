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
            defaultValue: "http://192.168.100.7:8000/images/avatars/avatar_1.jpeg"
        },
        gems: {
            type: DataTypes.INTEGER,
            defaultValue: 50,
            validate: {
                min: 0,
                max: 1000, 
            },
        },
    },
    {
        timestamps: false,
        tableName: 'avatars'
    });



module.exports = Avatar;
