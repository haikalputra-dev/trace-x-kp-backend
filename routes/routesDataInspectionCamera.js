var express = require("express");
var DataCtrl = require("../controllers/data/InspectionCamera.controller");
var auth = require("../tools/middleware");
var router = express.Router();

// Master Data Auth
router.post("/table", DataCtrl.getTable);
router.post("/statistic", DataCtrl.getStatistic);

module.exports = router;