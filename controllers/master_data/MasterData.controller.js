var models = require('../../config/sequelizeORM')
var sequelizeQuery = require('../../config/sequelizeQuery')
var api = require('../../tools/common')
var moment = require('moment')
var btoa = require('btoa');


// Kelas
function add_Class(req, res) {
  models.mst_classes.create(req.body, {
    raw: true
  }).then(function (create) {
    api.ok(res, create)
  }).catch((e) => {
    api.error(res, e, 500)
  })
}

function get_Classes(req, res) {
  sequelizeQuery.sequelizeSchoolManagement.query(
      `SELECT a.*, b.MajorName, c.FullName AS TeacherName FROM mst_classes a 
      LEFT JOIN mst_majors b ON b.Id = a.MajorID 
      LEFT JOIN mst_teachers c ON a.TeacherID = c.Id`, {
        type: sequelizeQuery.sequelizeSchoolManagement.QueryTypes.SELECT
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



function edit_Class(req, res) {
  models.mst_classes.update(
      req.body, {
        where: {
          Id: req.params.id
        }
      })
    .then(data => {
      api.ok(res, req.body)
    }).catch((e) => {
      api.error(res, e, 500)
    })
}

function delete_Class(req, res) {
  models.mst_classes.destroy({
      where: {
        Id: req.params.id
      }
    })
    .then(function (deletedRecord) {
      if (deletedRecord === 1) {
        api.ok(res, deletedRecord)
      } else {
        api.error(res, 'Record not found', 200);
      }
    }).catch((e) => {
      api.error(res, e, 500)
    })
}


function get_ClassByID(req, res) {
  models.mst_classes.findAll({
    where: {
      Id: req.params.id
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


// Murid 

function add_Student(req, res) {
  models.mst_students.create(req.body, {
    raw: true
  }).then(function (create) {
    api.ok(res, create)
  }).catch((e) => {
    api.error(res, e, 500)
  })
}

function get_Students(req, res) {
  models.mst_students.findAll()
    .then(function (data) {
      if (data.length > 0) {
        api.ok(res, data)
      } else {
        api.error(res, "Data Kosong", 200)
      }
    }).catch(function (e) {
      api.error(res, e, 500)
    })
}

function edit_Student(req, res) {
  models.mst_students.update(
      req.body, {
        where: {
          Id: req.params.id
        }
      })
    .then(data => {
      api.ok(res, req.body)
    }).catch((e) => {
      api.error(res, e, 500)
    })
}

function delete_Student(req, res) {
  models.mst_students.destroy({
      where: {
        Id: req.params.id
      }
    })
    .then(function (deletedRecord) {
      if (deletedRecord === 1) {
        api.ok(res, deletedRecord)
      } else {
        api.error(res, 'Record not found', 200);
      }
    }).catch((e) => {
      api.error(res, e, 500)
    })
}

function get_StudentByID(req, res, next) {
  models.mst_students.findAll({
    where: {
      Id: req.params.id
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

//Alat


function add_Device(req, res) {
  models.mst_devices.create(req.body, {
    raw: true
  }).then(function (create) {
    api.dataCreated(res, create)
  }).catch((e) => {
    api.serverError(res, e, 500)
  })
}

function get_Devices(req, res) {
  sequelizeQuery.sequelizeSchoolManagement.query(
      `SELECT a.*, 
       @rownum := @rownum + 1 AS Number
  FROM mst_devices a, 
       (SELECT @rownum := 0) r`, {
        type: sequelizeQuery.sequelizeSchoolManagement.QueryTypes.SELECT
      }
    )
    .then(function (data) {
      if (data.length > 0) {
        api.dataCreated(res, data)
      } else {
        api.success(res, 'Record not found', 200)
      }
    }).catch((e) => {
      console.log(e)
      api.serverError(res, e, 500)
    })
}

function edit_Device(req, res) {
  models.mst_devices.update(
      req.body, {
        where: {
          Id: req.params.id
        }
      })
    .then(data => {
      api.success(res, req.body)
    }).catch((e) => {
      api.serverError(res, e, 500)
    })
}

function delete_Device(req, res) {
  models.mst_devices.destroy({
      where: {
        Id: req.params.id
      }
    })
    .then(function (deletedRecord) {
      if (deletedRecord === 1) {
        api.success(res, deletedRecord, 'berhasil di hapus')
      } else {
        api.success(res, 'Record not found', 200);
      }
    }).catch((e) => {
      api.serverError(res, e, 500)
    })
}

function deleteMultiple_Device(req, res) {
  models.mst_devices.destroy({
      where: {
        Id: req.body.Id
      }
    })
    .then(function (deletedRecord) {
      console.log(deletedRecord)
      if (deletedRecord) {
        api.success(res, deletedRecord)
      } else {
        api.success(res, 'Record not found', 200);
      }
    }).catch((e) => {
      api.serverError(res, e, 500)
    })
}


function get_DeviceByID(req, res, next) {
  models.mst_devices.findAll({
    where: {
      Id: req.params.id
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


// Mata Pelajaran


function add_Subject(req, res) {
  models.mst_subjects.create(req.body, {
    raw: true
  }).then(function (create) {
    api.ok(res, create)
  }).catch((e) => {
    api.error(res, e, 500)
  })
}





module.exports = {
  add_Class,
  get_Classes,
  edit_Class,
  delete_Class,
  get_ClassByID,

  add_Student,
  get_Students,
  edit_Student,
  delete_Student,
  get_StudentByID,

  add_Device,
  get_Devices,
  edit_Device,
  delete_Device,
  get_DeviceByID,
  deleteMultiple_Device,

};