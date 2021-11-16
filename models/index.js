'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(
    config.database, config.username, config.password, config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Users = require("./user")(sequelize, Sequelize);
db.Variable = require("./variable")(sequelize, Sequelize);
db.Services = require("./service")(sequelize, Sequelize);
db.Servers = require("./server")(sequelize, Sequelize);
db.Groups = require("./group")(sequelize, Sequelize);
db.GroupServer = require("./group_server")(sequelize, Sequelize);
db.GroupAuth = require("./group_auth")(sequelize, Sequelize);
db.ShareService = require("./share_service")(sequelize, Sequelize);
db.FileHistory = require("./file_hst")(sequelize, Sequelize);
db.HistoryDeploy = require("./history_deploy")(sequelize, Sequelize);
db.Deploy = require("./deploy")(sequelize, Sequelize);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});


module.exports = db;

// const fs = require('fs');
// const path = require('path');
// const Sequelize = require('sequelize');
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// const config = require(__dirname + '/../config/config.json')[env];
// const db = {};
//
// let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }
//
// fs
//   .readdirSync(__dirname)
//   .filter(file => {
//     return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
//   })
//   .forEach(file => {
//     const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });
//
// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });
//
// (async () => {
//     try {
//         await sequelize.authenticate();
//         console.log('Connection has been established successfully.');
//     } catch (error) {
//         console.error('Unable to connect to the database:', error);
//     }
// })()
//
// db.sequelize = sequelize;
// db.Sequelize = Sequelize;
//
// module.exports = db;
//
// // export default db;