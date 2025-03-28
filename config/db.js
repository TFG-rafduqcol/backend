const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("towerdefense", "towerdefense", "root", {
    host: "localhost",
    dialect: "mariadb"
});

module.exports = sequelize;



