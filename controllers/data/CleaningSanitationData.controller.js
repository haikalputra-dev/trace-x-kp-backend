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
const https = require('https');



const jasperPDF = async (req, res) => {
    const {
        url,
        username,
        password
    } = req.query;

    const agent = new https.Agent({
        rejectUnauthorized: false
    });

    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            httpsAgent: agent,
            headers: {
                'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
            }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching PDF:', error);
        res.status(500).send('Error fetching PDF');
    }
}

const getCleaningSanitation = async (req, res) => {
    try {
        const data = await models.mst_cleaning_sanitation.findAll({
            where: {
                line_code: req.params.code,
            },
            logging: console.log
        });

        if (data.length > 0) {
            api.ok(res, data);
        } else {
            api.error(res, 'Data Kosong', 200);
        }
    } catch (e) {
        api.error(res, e, 500);
    }
};

const getTableCleaningSanitation = async (req, res) => {
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

        if (datasource.length === 0) {
            return api.error(res, "Eror data source tidak ditemukan", 200);
        }

        const standard = await sequelizeQuery.sequelizeTraceXProject.query(
            `SELECT * FROM mst_standard WHERE header_item = :tag`, {
                replacements: {
                    tag: tag,
                },
                type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT,
            }
        );

        if (standard.length === 0) {
            return api.error(res, "Eror standard tidak ditemukan", 200);
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
        let dataTable = await DBConnection.query(query, {
            type: DBConnection.QueryTypes.SELECT
        })

        if (dataTable.length == 0) {
            return api.error(res, "Record Not Found", 200);
        }

        let responseData = createResData(dataTable, standard)
        api.ok(res, responseData)
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

const toTitleCase = (str) =>
    str
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

function createResData(dataSource, standard) {
    return standard.map((item) => {
      const key = item.data_item;
      const value = dataSource[0][key]; // Mengambil value dari data1 berdasarkan key data_item
  
      return {
        ...item,
        item: toTitleCase(key), // Mengubah format key menjadi Title Case
        value: value || null,   // Jika tidak ada value, set null
      };
    });
  }

module.exports = {
    jasperPDF,
    getCleaningSanitation,
    getTableCleaningSanitation
}