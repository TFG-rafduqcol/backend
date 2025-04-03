const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Game = sequelize.define("Game", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    map: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "localhost:8000/www/images/MapaAzteka.png",
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "default_path",
    },
    round: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    gold: {
        type: DataTypes.INTEGER,
        defaultValue: 500,
        validate: {
          min: 0,
          max: 1000000,
        },
      },

}   , {
    timestamps: true, 
    tableName: 'games', 
});



module.exports = Game;
