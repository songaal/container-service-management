'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('deploy_histories', 'deployEndTime', {
      type: Sequelize.DATE,
      allowNull: true,
    })
  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('deploy_histories', 'deployEndTime', {
      type: Sequelize.DATE,
      allowNull: true,
    })
  }
};
