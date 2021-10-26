'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('deploy_histories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      groupId : {
        type: Sequelize.STRING
      },
      deployTime: {
        type: Sequelize.DATE
      },
      user: {
        type: Sequelize.STRING
      },
      result: {
        type: Sequelize.STRING
      },
      service: {
        type: Sequelize.STRING
      },
      deployId: { 
        type : DataTypes.STRING 
      },
      deployEndTime: {
        type : DataTypes.DATE
      },
      deployType: {
        type : DataTypes.STRING
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
    await queryInterface.dropTable('deploy_histories');
  }
};