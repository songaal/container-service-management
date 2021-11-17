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
    deployTime: DataTypes.DATE,
    user: DataTypes.STRING,
    result: DataTypes.STRING,
    service: DataTypes.STRING,
    deployId: DataTypes.STRING,
    deployEndTime: DataTypes.STRING,
    deployType: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'history_deploy',
  });
  return history_deploy;
};