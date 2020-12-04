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
      server.hasMany(models.GroupServer, {foreignKey: "serverId", sourceKey: "id"})
      server.hasMany(models.Services, {foreignKey: "serverId", sourceKey: "id"})
    }
  };
  server.init({
    name: DataTypes.STRING,
    user: DataTypes.STRING,
    password: DataTypes.STRING,
    ip: DataTypes.STRING,
    port: DataTypes.STRING,
    dockerPort: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'server',
  });
  return server;
};