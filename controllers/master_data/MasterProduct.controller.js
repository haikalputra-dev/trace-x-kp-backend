var models = require('../../config/sequelizeORM')
var sequelizeQuery = require('../../config/sequelizeQuery')
var api = require('../../tools/common')
const {
    Op
} = require('sequelize');

const getProducts = async (req, res) => {
    try {
        const data = await models.mst_product.findAll({
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



const addProduct = async (req, res) => {
    try {
        const create = await models.mst_product.create(req.body, {
            raw: true
        });
        api.ok(res, create);
    } catch (e) {
        api.error(res, e, 500);
    }
};

const getProductById = async (req, res) => {
    try {
        const data = await models.mst_product.findAll({
            where: {
                id: req.params.id
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



const getProductByCodeLine = async (req, res) => {
    try {
        const data = await models.mst_product.findAll({
            where: {
                is_deleted: 0,
                product_code: req.params.code,
                line: req.params.line
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
const getProductByCode = async (req, res) => {
    try {
        const data = await models.mst_product.findAll({
            where: {
                is_deleted: 0,
                product_code: req.params.code
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

const updateProduct = async (req, res) => {
    try {
        const data = await models.mst_product.update(
            req.body, {
                where: {
                    id: req.params.id
                }
            }
        );
        api.ok(res, req.body);
    } catch (e) {
        api.error(res, e, 500);
    }
};

const deleteProduct = async (req, res) => {
    try {
        const data = await models.mst_product.update({
            is_deleted: 1
        }, {
            where: {
                id: req.params.id
            }
        });
        api.ok(res, req.body);
    } catch (e) {
        api.error(res, e, 500);
    }
};

const searchProductsByName = async (req, res) => {
    try {
        const {
            name
        } = req.query;

        const products = await models.mst_product.findAll({
            where: {
                product_name: {
                    [Op.like]: `%${name}%`
                },
                is_deleted: 0,
            }
        });


        api.ok(res, products);
    } catch (error) {
        console.error(error);
        api.error(res, error, 500);
    }
};

module.exports = {
    getProducts,
    addProduct,
    getProductById,
    getProductByCodeLine,
    getProductByCode,
    updateProduct,
    deleteProduct,
    searchProductsByName
};