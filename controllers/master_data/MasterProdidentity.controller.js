var models = require('../../config/sequelizeORM')
var sequelizeQuery = require('../../config/sequelizeQuery')
var api = require('../../tools/common')
const {
    Op
} = require('sequelize');

const getProdidentity = async (req, res) => {
    try {
        const data = await models.mst_prodidentity.findAll({
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

const getProdidentityByLotNo = async (req, res) => {
    try {
        const data = await models.mst_prodidentity.findAll({
            where: {
                lotno: req.params.lotno
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

const getProdidentitySearchByLotNo = async (req, res) => {
    try {
        const data = await models.mst_prodidentity.findAll({
            where: {
                lotno: {
                    [Op.like]: `%${req.query.lotno}%`
                }
            },
            limit: 10,
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

const getProdidentitySearchByLotNoGroupBy = async (req, res) => {
    try {
        const data = await models.mst_prodidentity.findAll({
            where: {
                lotno: {
                    [Op.like]: `%${req.query.lotno}%`
                }
            },
            group: ['lotno'],
            limit: 10,
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



module.exports = {
    getProdidentity,
    getProdidentityByLotNo,
    getProdidentitySearchByLotNo,
    getProdidentitySearchByLotNoGroupBy
};