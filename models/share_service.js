'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class share_service extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

    }
  };
  share_service.init({
    serviceId: DataTypes.STRING,
    fromGroupId: DataTypes.STRING,
    toGroupId: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'share_service',
  });

  return share_service;
};