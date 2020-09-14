'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class service extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  service.init({
    group_id: DataTypes.STRING,
    server_id: DataTypes.STRING,
    name: DataTypes.STRING,
    pid_cmd: DataTypes.STRING,
    start_script: DataTypes.STRING,
    stop_script: DataTypes.STRING,
    yaml: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'service',
  });
  return service;
};