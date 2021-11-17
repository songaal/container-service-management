'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('history_deploys', 'deployTime', {
      type: Sequelize.DATE,
      allowNull: true,
    })
  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('history_deploys', 'deployTime', {
      type: Sequelize.DATE,
      allowNull: true,
    })
  }
};
