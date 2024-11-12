var express = require("express");
var DataCtrl = require("../controllers/data/UtilityData.controller");
var auth = require("../tools/middleware");
var router = express.Router();

// Master Data Auth
router.post("/min-max", DataCtrl.getDataMinMaxUtility);
router.post("/trend", DataCtrl.getDataTrendUtility);

module.exports = router;
