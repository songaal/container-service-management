'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('deploy_histories');
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('deploy_histories');
  }
};