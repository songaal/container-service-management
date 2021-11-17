'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('deploys');
    await queryInterface.dropTable('deploy');
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('deploys');
    await queryInterface.dropTable('deploy');
  }
};