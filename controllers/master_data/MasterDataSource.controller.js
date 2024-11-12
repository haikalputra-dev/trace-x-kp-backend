var models = require('../../config/sequelizeORM')
var sequelizeQuery = require('../../config/sequelizeQuery')
var api = require('../../tools/common')
const {
    Op
} = require('sequelize');

const getDataSources = async (req, res) => {
    try {
        const data = await sequelizeQuery.sequelizeTraceXProject.query(
            `SELECT 
                mst_data_source.*, 
                mst_line.line as nama_line, 
                mst_line.line_code,
                mst_database.host,
                mst_database.name
            FROM 
                mst_data_source
            LEFT JOIN 
                mst_line 
            ON 
                mst_data_source.line = mst_line.id
            LEFT JOIN 
                mst_database
            ON
                mst_data_source.database = mst_database.id
            WHERE 
                mst_data_source.is_deleted = 0`, {
                type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT
            }
        );

        if (data.length > 0) {
            api.ok(res, data);
        } else {
            api.error(res, 'Record not found', 200);
        }
    } catch (e) {
        api.error(res, e, 500);
    }
};

const addDataSource = async (req, res) => {
    try {
        const create = await models.mst_data_source.create(req.body, {
            raw: true
        });
        api.ok(res, create);
    } catch (e) {
        api.error(res, e, 500);
    }
};

const updateDataSource = async (req, res) => {
    try {
        const data = await models.mst_data_source.update(
            req.body, {
                where: {
                    id: req.params.id
                }
            }
        );
        api.ok(res, data);
    } catch (e) {
        api.error(res, e, 500);
    }
};

const deleteDataSource = async (req, res) => {
    try {
        const data = await models.mst_data_source.update({
            is_deleted: 1
        }, {
            where: {
                id: req.params.id
            }
        });
        console.log(data, "ok")
        api.ok(res, data);
    } catch (e) {
        api.error(res, e, 500);
    }
};


module.exports = {
    getDataSources,
    addDataSource,
    updateDataSource,
    deleteDataSource
};