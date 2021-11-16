'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'deploy_histories',
      'groupId',
     Sequelize.BOOLEAN
    );
  }
};