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
      type: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING
      },
      pidCmd: {
        type: Sequelize.TEXT
      },
      startScript: {
        type: Sequelize.TEXT,
      },
      stopScript: {
        type: Sequelize.TEXT,
      },
      yaml: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('services');
  }
};