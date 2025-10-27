const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

module.exports = sequelize.define("document", {
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
    title: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    description: {
        type: Sequelize.STRING(500), 
        allowNull: false,
        unique: false
    },
    document_type: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    file_url: {
        type: Sequelize.STRING(100), 
        allowNull: true,
        unique: false
    },
    file_name: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    file_type: {
        type: Sequelize.STRING(100), 
        allowNull: false,
        unique: false
    },
    size: {
        type: Sequelize.STRING(10), 
        allowNull: false,
    },
});