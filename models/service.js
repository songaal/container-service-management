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
      service.hasMany(models.Variable, {foreignKey: "serviceId", sourceKey: "id"})
      service.belongsTo(models.Groups, {foreignKey: "groupId"})
    }
  };
  service.init({
    groupId: DataTypes.STRING,
    serverId: DataTypes.STRING,
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    pidCmd: DataTypes.BLOB,
    startScript: DataTypes.BLOB,
    stopScript: DataTypes.BLOB,
    yaml: DataTypes.BLOB,
  }, {
    sequelize,
    modelName: 'service',
  });

  return service;
};