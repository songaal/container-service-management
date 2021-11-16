'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class history_deploy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  history_deploy.init({
    groupId: DataTypes.STRING,
    deployTime: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'history_deploy',
  });
  return history_deploy;
};