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

const getDataMinMax = async (req, res) => {
    try {
        const {
            lotno,
            line,
            tag,
            ring,
            tanggal,
            ijp,
            type_data,
            prod_start,
            prod_end
        } = req.body;

        console.log(lotno, line, tag, ring, tanggal, ijp, type_data, prod_start, prod_end)

        const datasource = await sequelizeQuery.sequelizeTraceXProject.query(
            `SELECT a.*, b.line_code 
         FROM mst_data_source a 
         LEFT JOIN mst_line b ON a.line = b.id 
         WHERE b.line_code = :line AND a.data_item = :tag AND a.ring = :ring AND a.type_data = :type_data`, {
                replacements: {
                    line,
                    tag,
                    ring,
                    type_data
                },
                type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT,
            }
        );

        console.log('type data', type_data);
        console.log('tag', tag);
        console.log('ring', ring);
        console.log('line', line);

        if (!datasource.length) {
            console.log("gak ada")
            return api.error(res, "Record not found", 200);
        }

        // Formatting Start Time & End Time   
        if (!ijp) {
            start_time = formatTime(prod_start)
            end_time = formatTime(prod_end)
        } else {
            ijp_start = formatIjpStartRange(ijp, datasource[0].range);
            ijp_end = formatIjpEndRange(ijp, datasource[0].range);
            start_time = `${tanggal} ${ijp_start}:00`;
            end_time = `${tanggal} ${ijp_end}:00`;
        }

        const [database] = await sequelizeQuery.sequelizeTraceXProject.query(
            `SELECT * FROM mst_database WHERE id = :databaseId`, {
                replacements: {
                    databaseId: datasource[0].database
                },
                type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT
            }
        );

        console.log(database)

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
        query = query.replace(':lotno', `'${lotno}'`).replace(':start_time', `'${start_time}'`).replace(':end_time', `'${end_time}'`);
        let dataMinMax = await DBConnection.query(query, {
            type: DBConnection.QueryTypes.SELECT
        })

        if (dataMinMax.length == 0) {
            return api.error(res, "Record Not Found", 200);
        }

        console.log("okeoke", dataMinMax)

        api.ok(res, dataMinMax[0])
    } catch (e) {
        console.error(e);
        console.log('error');
        api.error(res, e.message || "Server Error", 500);
    }
};

const getDataTrend = async (req, res) => {
    try {
        const {
            lotno,
            line,
            tag,
            ring,
            tanggal,
            ijp,
            type_data,
            min,
            max,
            product_category,
            prod_start,
            prod_end
        } = req.body;

        console.log(req.body);

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

        const standard = await sequelizeQuery.sequelizeTraceXProject.query(
            `SELECT * FROM mst_standard WHERE data_item = :tag`, {
                replacements: {
                    tag: tag,
                },
                type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT,
            }
        );

        if (standard.length === 0) {
            return api.error(res, "Eror standard tidak ditemukan", 200);
        }

        let status;
        let dataStandard;
        if (standard.length > 1) {
            const filteredDataStandard = standard.find(
                (item) => item.product_category === product_category
            );
            console.log(filteredDataStandard);
            if (filteredDataStandard.min <= min && max <= filteredDataStandard.max) {
                status = "Comply";
            } else if (!filteredDataStandard.min && !filteredDataStandard.max){
                status = "Comply";
            } else {
                status = "Not Comply"
            }
            dataStandard = {
                status: status,
                min: filteredDataStandard.min,
                max: filteredDataStandard.max,
                unit: filteredDataStandard.unit,
            };
        } else {
            if (standard[0].min <= min && max <= standard[0].max) {
                status = "Comply";
            } else if (!standard[0].min && !standard[0].max){
                status = "Comply";
            } else {
                status = "Not Comply"
            }
            dataStandard = {
                status: status,
                min: standard[0].min,
                max: standard[0].max,
                unit: standard[0].unit,
            };
        }

        // Formatting Start Time & End Time   
        let ijp_start;
        let ijp_end;
        let start_time;
        let end_time
        if (!ijp) {
            start_time = formatTime(prod_start)
            end_time = formatTime(prod_end)
        } else {
            ijp_start = formatIjpStartRange(ijp, datasource[0].range);
            ijp_end = formatIjpEndRange(ijp, datasource[0].range);
            start_time = `${tanggal} ${ijp_start}:00`;
            end_time = `${tanggal} ${ijp_end}:00`;
            console.log(ijp);
        }

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
        query = query.replace(':lotno', `'${lotno}'`).replace(':start_time', `'${start_time}'`).replace(':end_time', `'${end_time}'`);
        let dataTrend = await DBConnection.query(query, {
            type: DBConnection.QueryTypes.SELECT
        })

        console.log(query);
        if (dataTrend.length == 0) {
            return api.error(res, "Record Not Found", 200);
        }

        api.ok(res, {
            dataStandard,
            dataTrend,
        })
    } catch (e) {
        console.error(e);
        api.error(res, e.message || "Server Error", 500);
    }
};



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

const formatIjpStartRange = (timeStr, mins) => {
    const h = Number(timeStr.slice(0, 2));
    const m = Number(timeStr.slice(2));
    if (h >= 24 || m >= 60 || isNaN(h) || isNaN(m)) return '00:00';
    const totalMinutes = h * 60 + m - mins;
    if (totalMinutes < 0) return '00:00';
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

const formatIjpEndRange = (timeStr, max) => {
    const h = Number(timeStr.slice(0, 2));
    const m = Number(timeStr.slice(2));
    if (h >= 24 || m >= 60 || isNaN(h) || isNaN(m)) return '00:00';
    const totalMinutes = h * 60 + m + max;
    if (totalMinutes < 0) return '00:00';
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

const formatTime = (time) => {
    return moment(time).format("YYYY-MM-DD HH:mm:ss");
};


module.exports = {
    getDataMinMax,
    getDataTrend
}