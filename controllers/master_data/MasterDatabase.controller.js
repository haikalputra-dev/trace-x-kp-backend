var models = require('../../config/sequelizeORM')
var sequelizeQuery = require('../../config/sequelizeQuery')
var api = require('../../tools/common')
const {
    Op
} = require('sequelize');

const getDatabases = async (req, res) => {
    try {
        const data = await models.mst_database.findAll({
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




const addDatabase = async (req, res) => {
    try {
        const create = await models.mst_database.create(req.body, {
            raw: true
        });
        api.ok(res, create);
    } catch (e) {
        api.error(res, e, 500);
    }
};

const updateDatabase = async (req, res) => {
    try {
        const data = await models.mst_database.update(
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

const deleteDatabase = async (req, res) => {
    try {
        const data = await models.mst_database.update({
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
    getDatabases,
    addDatabase,
    updateDatabase,
    deleteDatabase
};