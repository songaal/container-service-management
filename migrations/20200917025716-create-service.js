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
        type: Sequelize.BLOB
      },
      startScript: {
        type: Sequelize.BLOB
      },
      stopScript: {
        type: Sequelize.BLOB
      },
      yaml: {
        type: Sequelize.BLOB
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