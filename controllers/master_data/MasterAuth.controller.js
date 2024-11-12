var models = require('../../config/sequelizeORM')
var sequelizeQuery = require('../../config/sequelizeQuery')
var api = require('../../tools/common')
var moment = require('moment')
var btoa = require('btoa');


// Auth
function getAuthorization(req, res) {
  models.mst_authorization.findAll({
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

function getAuthorizationBySite(req, res) {
  models.mst_authorization.findAll({
    where: {
      is_deleted: 0,
      site: req.params.site
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

function getAuthorizationByEmployeeCode(req, res) {
  models.mst_authorization.findAll({
      where: {
        employee_code: req.params.code,
        is_deleted: 0
      },
      logging: console.log
    })
    .then(data => {
      if (data.length > 0) {
        api.ok(res, data)
      } else {
        api.error(res, 'Record not found', 200);
      }
    }).catch((e) => {
      api.error(res, e, 500)
    })
}

function getAutocompleteEmployee(req, res) {
  sequelizeQuery.sequelizeAuthentication.query(
      `SELECT TOP 10 *, CONCAT(lg_name, ' - ', lg_nik) as label FROM PHP_ms_login WHERE lg_aktif = '1' AND lg_nik  LIKE N'%${req.params.term}%' OR lg_name LIKE N'%${req.params.term}%' ORDER BY lg_nik DESC`, {
        type: sequelizeQuery.sequelizeAuthentication.QueryTypes.SELECT
      }
    )
    .then(function (data) {
      if (data.length > 0) {
        api.ok(res, data)
      } else {
        api.error(res, 'Record not found', 200)
      }
    }).catch((e) => {
      api.error(res, e, 500)
    })
}

function addAuthorization(req, res) {
  req.body.created_date = moment().format('YYYY-MM-DD HH:mm:ss'); 
  
  models.mst_authorization.create(req.body, {
    raw: true
  }).then(function (create) {
    api.ok(res, create)
  }).catch((e) => {
    api.error(res, e, 500)
  })
}

function getAuthorizationByID(req, res, next) {
  models.mst_authorization.findAll({
    where: {
      id: req.params.id
    },
    logging: console.log
  }).then(data => {
    if (data.length > 0) {
      api.ok(res, data)
    } else {
      api.error(res, 'Data Kosong', 200);
    }
  }).catch((e) => {
    api.error(res, e, 500)
  })
}



function updateAuthorization(req, res) {
  models.mst_authorization.update(
      req.body, {
        where: {
          id: req.params.id
        }
      })
    .then(data => {
      api.ok(res, req.body)
    }).catch((e) => {
      api.error(res, e, 500)
    })
}

function deleteAuthorization(req, res) {
  models.mst_authorization.update({
      is_deleted: 1
    }, {
      where: {
        id: req.params.id
      }
    })
    .then(data => {
      api.ok(res, req.body)
    }).catch((e) => {
      api.error(res, e, 500)
    })
}


module.exports = {
  getAuthorization,
  getAuthorizationByEmployeeCode,
  getAutocompleteEmployee,
  addAuthorization,
  getAuthorizationByID,
  updateAuthorization,
  deleteAuthorization,
  getAuthorizationBySite
};