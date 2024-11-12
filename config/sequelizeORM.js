var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
var config = require("./config");

const modelProjectStarter = path.join(__dirname, "../models/aio_starter");
const configProjectStarter = new Sequelize(
    config.project_starter_db.name,
    config.project_starter_db.username,
    config.project_starter_db.password, {
        logging: config.project_starter_db.logging,
        dialect: config.project_starter_db.dialect,
        host: config.project_starter_db.host,
        port: config.project_starter_db.port,
        define: {
            timestamps: false,
            timezone: "+07:00"  
        },
        timezone: "+07:00",
        operatorsAliases: 0
    }
);
const db = {};
let model;

// Starter Apps
fs.readdirSync(modelProjectStarter)
    .filter(file => {
        return file.indexOf(".") !== 0 && file.indexOf(".map") === -1;
    })
    .forEach(file => {
        model = require(path.join(modelProjectStarter, file))(configProjectStarter, Sequelize.DataTypes);
        db[model.name] = model;
    });
Object.keys(db).forEach(name => {
    if ("associate" in db[name]) {
        db[name].associate(db);
    }
});

module.exports = db