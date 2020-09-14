'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class server extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  server.init({
    name: DataTypes.STRING,
    user: DataTypes.STRING,
    password: DataTypes.STRING,
    ip: DataTypes.STRING,
    port: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'server',
  });
  return server;
};