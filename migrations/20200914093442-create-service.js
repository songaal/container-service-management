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
      group_id: {
        type: Sequelize.STRING
      },
      server_id: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      pid_cmd: {
        type: Sequelize.STRING
      },
      start_script: {
        type: Sequelize.STRING
      },
      stop_script: {
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