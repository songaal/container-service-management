'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('services', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      groupId: {
        type: Sequelize.STRING
      },
      serverId: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      pidCmd: {
        type: Sequelize.STRING
      },
      startScript: {
        type: Sequelize.STRING
      },
      stopScript: {
        type: Sequelize.STRING
      },
      yaml: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('services');
  }
};