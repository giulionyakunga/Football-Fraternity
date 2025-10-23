const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

module.exports = sequelize.define("message", {
    id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
    },
    name: {
        type: Sequelize.STRING(100), 
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING(100),
        allowNull: false,
    },
    phone_number: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: false
    },
    text: {
        type: Sequelize.STRING(1000), 
        allowNull: false,
        unique: false
    },
});