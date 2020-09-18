'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class group_server extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      group_server.belongsTo(models.Groups, {foreignKey: "groupId"})
      // group_server.belongsTo(models.Server, {foreignKey: "serverId"})
    }
  };
  group_server.init({
    serverId: DataTypes.STRING,
    groupId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'group_server',
  });
  return group_server;
};