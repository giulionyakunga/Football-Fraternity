const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

module.exports = sequelize.define("user", {
    id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    first_name: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    middle_name: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    last_name: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    email: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: true
    },
    phone_number: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    password: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    role: {
        type: Sequelize.STRING(20),
        allowNull: false,
    },
    region: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    district: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    ward: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    street: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    selected_card_type: {
        type: Sequelize.STRING(20), 
        allowNull: true,
        unique: false
    },
    card_number: {
        type: Sequelize.STRING(20), 
        allowNull: true,
        unique: false
    },
    app_version: {
        type: Sequelize.STRING(10), 
        allowNull: true,
        unique: false
    },
    operating_system: {
        type: Sequelize.STRING(10), 
        allowNull: true,
        unique: false
    },
});