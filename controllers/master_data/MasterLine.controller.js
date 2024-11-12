var models = require('../../config/sequelizeORM')
var sequelizeQuery = require('../../config/sequelizeQuery')
var api = require('../../tools/common')
const {
    Op
} = require('sequelize');

const getLines = async (req, res) => {
    try {
        const data = await models.mst_line.findAll({
            where: {
                is_deleted: 0
            },
            logging: console.log
        });

        if (data.length > 0) {
            api.ok(res, data);
        } else {
            api.error(res, 'Record not found', 200);
        }
    } catch (e) {
        api.error(res, e, 500);
    }
};

const getLinesByCode = async (req, res) => {
    try {
        const data = await models.mst_line.findAll({
            where: {
                is_deleted: 0,
                line_code: req.params.code,
                plant_code: req.params.plant
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


const addLines = async (req, res) => {
    try {
        const create = await models.mst_line.create(req.body, {
            raw: true
        });
        api.ok(res, create);
    } catch (e) {
        api.error(res, e, 500);
    }
};

const updateLine = async (req, res) => {
    try {
        const data = await models.mst_line.update(
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

const deleteLine = async (req, res) => {
    try {
        const data = await models.mst_line.update({
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
    getLines,
    getLinesByCode,
    addLines,
    updateLine,
    deleteLine
};