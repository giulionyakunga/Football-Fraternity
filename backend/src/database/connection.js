const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("football_fraternity", 'root', 'Giulio2012!', { host: '127.0.0.1', dialect: 'mysql', operatorsAliases: false });

module.exports = sequelize;
global.sequelize = sequelize;