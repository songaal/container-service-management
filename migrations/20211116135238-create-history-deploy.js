'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('history_deploys');
    await queryInterface.dropTable('deploy_history');
    await queryInterface.dropTable('deploy_histories');
    await queryInterface.dropTable('deploy_hst');
    await queryInterface.dropTable('deploy_hsts');
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('history_deploys');
    await queryInterface.dropTable('deploy_history');
    await queryInterface.dropTable('deploy_histories');
    await queryInterface.dropTable('deploy_hst');
    await queryInterface.dropTable('deploy_hsts');
  }
};