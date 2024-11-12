var express = require("express");
var DataCtrl = require("../controllers/data/Data.controller");
var auth = require("../tools/middleware");
var router = express.Router();


router.post("/efficiency", DataCtrl.getDataEfficiency);

// Data Result IPC Quality
router.post("/resultipcquality/table", DataCtrl.getDataResultIpcQualityTable);
router.post("/resultipcquality/data", DataCtrl.getDataResultIpcQualityData);

// Data Result Microbiology
router.post("/resultmicrobiology/table", DataCtrl.getDataResultMicrobiologyTable);

// Data Result Bottle Dimension
router.post("/resultbottledimension/table", DataCtrl.getDataResultBottleDimensionTable);
router.post("/resultbottledimension/chart", DataCtrl.getDataResultBottleDimensionChart);

// Data Result Capping Performance
router.post("/cappingperformance/table", DataCtrl.getDataResultCappingPerformanceTable);
router.post("/cappingperformance/data", DataCtrl.getDataResultCappingPerformanceData);

// Data Result Preform Check
router.post("/resultpreformcheck/table", DataCtrl.getDataResultPreformCheckTable);
router.post("/resultpreformcheck/data", DataCtrl.getDataResultPreformCheckData);

// Data Result CCP
router.post("/resultccp/table", DataCtrl.getDataResultCCPTable);
router.post("/resultccp/chart", DataCtrl.getDataResultCCPChart);

// Data Result Preparation Syrup
router.post("/resultpreparationsyrup/table", DataCtrl.getDataResultPreparationSyrupTable);
router.post("/resultpreparationsyrup/data", DataCtrl.getDataResultPreparationSyrupData);

// Data Result Abnormally
router.post("/resultabnormally/chart", DataCtrl.getDataResultAbnormallyChart);
router.post("/resultabnormally/table", DataCtrl.getDataResultAbnormallyTable);

//Data Result Bottle Pressure
router.post("/resultbottlepressure/table", DataCtrl.getDataResultBottlePressureTable)
router.post("/resultbottlepressure/chart", DataCtrl.getDataResultBottlePressureChart)

// Data Result Packaging Material
router.post("/resultpackagingmaterial/lotmaterial", DataCtrl.getDataResultPackagingMaterialLotnoMaterial);
router.post("/resultpackagingmaterial/table", DataCtrl.getDataResultPackagingMaterialTable);
router.post("/resultpackagingmaterial/data", DataCtrl.getDataResultPackagingMaterialData);

module.exports = router;