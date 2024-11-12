var Sequelize = require("sequelize");

const sequelizeTraceXProject = new Sequelize(process.env.starter_database_name, process.env.starter_database_user, process.env.starter_database_password, {
  host: process.env.starter_database_host,
  dialect: process.env.starter_database_dialect,
  port: process.env.starter_database_port,
  define: {
    timestamps: false,
    timezone: "+07:00"
  },
  logging: false,
  timezone: "+07:00",
  operatorsAliases: 0
});

const sequelizeAuthentication = new Sequelize("XMS_NxG", "XMSAPPS", "Rider3>_<3", {
  host: "192.168.1.214",
  dialect: "mssql",
  define: {
    timestamps: false,
    timezone: "+07:00"
  },
  timezone: "+07:00",
  logging: false,
  operatorsAliases: 0,

});



sequelizeTraceXProject
  .authenticate()
  .then(() => {
    console.log('[OK] DB Trace X connected!');
  })
  .catch(err => {
    console.error('[ERR] DB Trace X connection error!', err);
  });


sequelizeAuthentication
  .authenticate()
  .then(() => {
    console.log('[OK] DB Auth connected!');
  })
  .catch(err => {
    console.error('[ERR] DB Auth connection error!', err);
  });

module.exports = {
  sequelizeTraceXProject,
  sequelizeAuthentication

};