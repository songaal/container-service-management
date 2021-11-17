'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('history_deploys');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('history_deploys');
  }
};
