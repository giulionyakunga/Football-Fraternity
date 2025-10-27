'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("documents", {
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
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("documents")
    }
};
