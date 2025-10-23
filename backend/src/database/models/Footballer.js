const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

module.exports = sequelize.define("footballer", {
    id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    full_name: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    position: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    club: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    nationality: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    age: {
        type: Sequelize.INTEGER(11), 
        allowNull: false,
    },
    contract_status: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    date_of_birth: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    preferred_foot: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    height: {
        type: Sequelize.FLOAT(100,4),
        allowNull: false,
    },
    weight: {
        type: Sequelize.FLOAT(100,4),
        allowNull: false,
    },
    matches: {
        type: Sequelize.INTEGER(11), 
        allowNull: false,
    },
    goals: {
        type: Sequelize.INTEGER(11), 
        allowNull: false,
    },
    assists: {
        type: Sequelize.INTEGER(11), 
        allowNull: false,
    },
    rating: {
        type: Sequelize.FLOAT(100,4),
        allowNull: false,
    },
    contract_status: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    contract_start: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    contract_end: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    image_url: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
});