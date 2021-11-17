'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('deploy_histories', 'deployTime', {
      type: Sequelize.DATE,
      allowNull: true,
    })
  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('deploy_histories', 'deployTime', {
      type: Sequelize.DATE,
      allowNull: true,
    })
  }
};
