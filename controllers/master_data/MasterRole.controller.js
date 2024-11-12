var models = require('../../config/sequelizeORM')
var sequelizeQuery = require('../../config/sequelizeQuery')
var api = require('../../tools/common')
var moment = require('moment')
var btoa = require('btoa');


function getAllRole(req, res) {
    models.mst_role.findAll({
        where: {
            is_deleted: 0
        },
        logging: console.log
    }).then(data => {
        if (data.length > 0) {
            api.ok(res, data)
        } else {
            api.error(res, 'Record not found', 200);
        }
    }).catch((e) => {
        api.error(res, e, 500)
    })
}

module.exports = {
    getAllRole
}