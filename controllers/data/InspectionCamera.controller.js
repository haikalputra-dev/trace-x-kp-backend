var models = require("../../config/sequelizeORM");
var sequelizeQuery = require("../../config/sequelizeQuery");
var api = require("../../tools/common");
const {
    Op
} = require("sequelize");
const {
    Client,
    Pool
} = require("pg");
let client;
let pool;
var Sequelize = require("sequelize");
const axios = require('axios');
var moment = require('moment');

async function getTable(req, res){
    try {
        const {
            lotno,
            line,
            tag,
            ring,
            pro,
            type_data
        } = req.body;


        const datasource = await sequelizeQuery.sequelizeTraceXProject.query(
            `SELECT a.*, b.line_code FROM mst_data_source a LEFT JOIN mst_line b ON a.line = b.id WHERE b.line_code = :line AND a.data_item = :tag AND a.ring = :ring AND a.type_data = :type_data`, {
                replacements: {
                    line,
                    tag,
                    ring,
                    type_data
                },
                type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT,
            }
        );

        if (!datasource.length) {
            return api.error(res, "Datasource not found", 200);
        }

        const [database] = await sequelizeQuery.sequelizeTraceXProject.query(
            `SELECT * FROM mst_database WHERE id = :databaseId`, {
                replacements: {
                    databaseId: datasource[0].database
                },
                type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT
            }
        );

        if (!database) {
            return api.error(res, "Database configuration not found", 200);
        }

        // Create Database Connection   
        const DBConnection = createConnectionDatabase(database)
        if (!DBConnection) {
            return api.error(res, "Database Connection Error", 200);
        }

        // Create Query   
        let query = datasource[0].query;
        query = query.replace(/:lotno/g, `'${lotno}'`).replace(/:pro/g, `'${pro}'`);

        let dataTable = await DBConnection.query(query, {
            type: DBConnection.QueryTypes.SELECT
        })


        if (dataTable.length == 0) {
            return api.error(res, "Record Not Found", 200);
        }

        api.ok(res, dataTable)
    } catch (error) {
        api.error(res, error, 500)
    }
}

async function getStatistic(req, res){
    try {
        const {
            lotno,
            line,
            tag,
            ring,
            pro,
            type_data,
            table,
            field,
            start,
            end
        } = req.body;


        const datasource = await sequelizeQuery.sequelizeTraceXProject.query(
            `SELECT a.*, b.line_code FROM mst_data_source a LEFT JOIN mst_line b ON a.line = b.id WHERE b.line_code = :line AND a.data_item = :tag AND a.ring = :ring AND a.type_data = :type_data`, {
                replacements: {
                    line,
                    tag,
                    ring,
                    type_data
                },
                type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT,
            }
        );

        if (!datasource.length) {
            return api.error(res, "Datasource not found", 200);
        }

        const [database] = await sequelizeQuery.sequelizeTraceXProject.query(
            `SELECT * FROM mst_database WHERE id = :databaseId`, {
                replacements: {
                    databaseId: datasource[0].database
                },
                type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT
            }
        );

        if (!database) {
            return api.error(res, "Database configuration not found", 200);
        }

        // Create Database Connection   
        const DBConnection = createConnectionDatabase(database)
        if (!DBConnection) {
            return api.error(res, "Database Connection Error", 200);
        }

        // Create Query   
        let query = datasource[0].query;        
        query = query.replace(/:field/g, `${field}`)
        .replace(/:table/g, `${table}`)
        .replace(/:lotno/g, `'${lotno}'`)
        .replace(/:pro/g, `'${pro}'`)
        .replace(/:start/g, `'${formatTime(start)}'`)
        .replace(/:end/g, `'${formatTime(end)}'`);

        let dataTable = await DBConnection.query(query, {
            type: DBConnection.QueryTypes.SELECT
        })


        if (dataTable.length == 0) {
            return api.error(res, "Record Not Found", 200);
        }

        api.ok(res, dataTable)
    } catch (error) {
        api.error(res, error, 500)
    }
}

function createConnectionDatabase(data) {
    if (!data.port) {
        return new Sequelize(data.name, data.username, data.password, {
            host: data.host,
            dialect: data.dialect,
            define: {
                timestamps: false,
                timezone: "+07:00"
            },
            timezone: "+07:00",
            logging: false,
            operatorsAliases: 0,
        });
    } else {
        return new Sequelize(data.name, data.username, data.password, {
            host: data.host,
            dialect: data.dialect,
            port: data.port,
            define: {
                timestamps: false,
                timezone: "+07:00"
            },
            timezone: "+07:00",
            logging: false,
            operatorsAliases: 0,
        });
    }
}

const formatTime = (time) => {
    return moment(time).format("YYYY-MM-DD HH:mm:ss");
};

module.exports = {
    getTable,
    getStatistic
}