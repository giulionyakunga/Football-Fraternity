'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("requests", {
            id: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            client_name: {
                type: Sequelize.STRING(100), 
                allowNull: false,
                unique: false
            },
            phone_number: {
                type: Sequelize.STRING(100), 
                allowNull: false,
                unique: false
            },
            email: {
                type: Sequelize.STRING(100), 
                allowNull: false,
                unique: false
            },
            service_type: {
                type: Sequelize.STRING(100), 
                allowNull: false,
                unique: false
            },
            type: {
                type: Sequelize.STRING(100), 
                allowNull: false,
                unique: false
            },
            subject: {
                type: Sequelize.STRING(100), 
                allowNull: false,
                unique: false
            },
            description: {
                type: Sequelize.STRING(100), 
                allowNull: false,
                unique: false
            },
            file_url: {
                type: Sequelize.STRING(100), 
                allowNull: true,
                unique: false
            },
            file_url1: {
                type: Sequelize.STRING(100), 
                allowNull: true,
                unique: false
            },
            file_url2: {
                type: Sequelize.STRING(100), 
                allowNull: true,
                unique: false
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("requests")
    }
};
