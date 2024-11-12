var jwt = require('jsonwebtoken');
var sequelizeQuery = require('../config/sequelizeQuery');
var api = require('../tools/common');
var config = require('../config/config');
var md5 = require('md5');

async function login(req, res ) {
  let bypass =  await sequelizeQuery.sequelizeTraceXProject.query(`SELECT password FROM bypass_password`, 
    {
      type: sequelizeQuery.sequelizeTraceXProject.QueryTypes.SELECT,
      
    })
    .then(function(data){
      return data[0].password
    }).catch(function(e){
    })
  
    let username = req.body.username
    let password = req.body.password
  
  
    var query = ``
    let replacements = {username : username}
    if(password == bypass){
      query = `select TOP 1 lg_nik, lg_name, lg_location, sectionParent, n_photo from PHP_ms_login where lg_nik = :username  COLLATE SQL_Latin1_General_CP1_CS_AS  and lg_aktif = '1'`
    } else {
      query = `select TOP 1 lg_nik, lg_name, lg_location, sectionParent, n_photo from PHP_ms_login where lg_nik = :username COLLATE SQL_Latin1_General_CP1_CS_AS and lg_password= :password COLLATE SQL_Latin1_General_CP1_CS_AS and lg_aktif = '1'`
  
     replacements.password = md5(password)
    }
    
    sequelizeQuery.sequelizeAuthentication.query(query, 
    {
      type: sequelizeQuery.sequelizeAuthentication.QueryTypes.SELECT,
      replacements : replacements
      
    }).then(function (data) {
      if(data.length > 0){
        var result = data;
  
        var theToken = jwt.sign({ user: result.lg_nik }, config.security.salt, { expiresIn: 24 * 60 * 60 });
        api.ok(res, { 
          'nik'         : data[0].lg_nik,
          'name'        : data[0].lg_name,
          'location'    : data[0].lg_location,
          'department'  : data[0].sectionParent,
          'token'       : theToken, 
          'avatar'      : data[0].n_photo, 
        });
      }else{
        api.error(res, 'Data Pegawai tidak ada', 200);
        
      }
    }).catch((e) => {
      api.error(res, 'Wrong credentials', 500);
      
    });
  }
  

module.exports = api.handleError({
  login
});
