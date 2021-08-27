'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('file_hsts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.STRING
      },
      fileName: {
        type: Sequelize.STRING
      },
      initTime: {
        type: Sequelize.DATE
      },
      fileSize: {
        type: Sequelize.STRING
      },
      phase: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      fileKey: {
        type: Sequelize.STRING
      },
      checkTime: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('file_hsts');
  }
};