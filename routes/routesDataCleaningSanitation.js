var express = require("express");
var DataCtrl = require("../controllers/data/CleaningSanitationData.controller");
var auth = require("../tools/middleware");
var router = express.Router();

router.get('/jasper-pdf', DataCtrl.jasperPDF);
router.get('/cleaning/:code', DataCtrl.getCleaningSanitation);
router.post('/table-data', DataCtrl.getTableCleaningSanitation);


module.exports = router;