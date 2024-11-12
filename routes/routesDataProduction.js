var express = require("express");
var DataCtrl = require("../controllers/data/ProductionData.controller");
var auth = require("../tools/middleware");
var router = express.Router();

// Master Data Auth
router.post("/min-max", DataCtrl.getDataMinMax);
router.post("/trend", DataCtrl.getDataTrend);

module.exports = router;