var models = require('../../config/sequelizeORM')
var sequelizeQuery = require('../../config/sequelizeQuery')
var api = require('../../tools/common')
const {
    Op
} = require('sequelize');

const getStandard = async (req, res) => {
    try {
        const data = await models.mst_standard.findAll({
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




const addStandard = async (req, res) => {
    try {
        const create = await models.mst_standard.create(req.body, {
            raw: true
        });
        api.ok(res, create);
    } catch (e) {
        api.error(res, e, 500);
    }
};

const updateStandard = async (req, res) => {
    try {
        const data = await models.mst_standard.update(
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

const deleteStandard = async (req, res) => {
    try {
        const data = await models.mst_standard.update({
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
    getStandard,
    addStandard,
    updateStandard,
    deleteStandard
};