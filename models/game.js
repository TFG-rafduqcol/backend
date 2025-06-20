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
        defaultValue: 0,
    },
    gold: {
        type: DataTypes.INTEGER,
        defaultValue: 350,
        validate: {
          min: 0,
          max: 1000000,
        },
      },
    lives: {
        type: DataTypes.INTEGER,
        defaultValue: 20,
        validate: {
          min: -100,
          max: 20,
        },
      },
      hardMode: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

}   , {
    timestamps: true, 
    tableName: 'games', 
});



module.exports = Game;
