'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("messages", {
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
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("messages")
    }
};
