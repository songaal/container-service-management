'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'deploy_histories',
      'groupId',
     Sequelize.BOOLEAN
    );
  }
};
