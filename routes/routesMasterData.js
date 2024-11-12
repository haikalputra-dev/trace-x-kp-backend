var express = require('express');
var MasterDataCtrl = require('../controllers/master_data/MasterData.controller')
var MasterAuthCtrl = require('../controllers/master_data/MasterAuth.controller')
var MasterRoleCtrl = require('../controllers/master_data/MasterRole.controller')
var MasterProductCtrl = require('../controllers/master_data/MasterProduct.controller')
var MasterLineCtrl = require('../controllers/master_data/MasterLine.controller')
var MasterDatabaseCtrl = require('../controllers/master_data/MasterDatabase.controller')
var MasterDataSourceCtrl = require('../controllers/master_data/MasterDataSource.controller')
var MasterProdidentityCtrl = require('../controllers/master_data/MasterProdidentity.controller')
var MasterStandardCtrl = require('../controllers/master_data/MasterStandard.controller')
var auth = require('../tools/middleware');
var router = express.Router();

// Master Data Auth
router.get('/authorization', MasterAuthCtrl.getAuthorization)
router.get('/authorization/:id', MasterAuthCtrl.getAuthorizationByID);
router.get('/authorization-by-site/:site', MasterAuthCtrl.getAuthorizationBySite);
router.get('/authorization-by-code/:code', MasterAuthCtrl.getAuthorizationByEmployeeCode);
router.get('/autocomplete-employee/:term', MasterAuthCtrl.getAutocompleteEmployee);
router.post('/authorization', MasterAuthCtrl.addAuthorization)
router.put('/authorization/:id', MasterAuthCtrl.updateAuthorization);
router.put('/delete-authorization/:id', MasterAuthCtrl.deleteAuthorization);

// Master Data Role
router.get('/role', MasterRoleCtrl.getAllRole)

// Master Data Products

router.get('/products', auth.authorization, MasterProductCtrl.getProducts)
router.post('/products', auth.authorization, MasterProductCtrl.addProduct)
router.get('/products/:id', auth.authorization, MasterProductCtrl.getProductById)
router.get('/products/code/:code/:line', auth.authorization, MasterProductCtrl.getProductByCodeLine)
router.get('/products/code/:code', auth.authorization, MasterProductCtrl.getProductByCode)
router.put('/products/:id', auth.authorization, MasterProductCtrl.updateProduct)
router.put('/products/delete/:id', auth.authorization, MasterProductCtrl.deleteProduct)
router.get('/products/search/byName', auth.authorization, MasterProductCtrl.searchProductsByName);

// Master Data Line
router.get('/lines', MasterLineCtrl.getLines)
router.get('/lines/code/:code/:plant', MasterLineCtrl.getLinesByCode)
router.post('/lines', MasterLineCtrl.addLines)
router.put('/lines/:id', MasterLineCtrl.updateLine)
router.put('/lines/delete/:id', MasterLineCtrl.deleteLine)

// Master Data Database
router.get('/databases', MasterDatabaseCtrl.getDatabases)
router.post('/databases', MasterDatabaseCtrl.addDatabase)
router.put('/databases/:id', MasterDatabaseCtrl.updateDatabase)
router.put('/databases/delete/:id', MasterDatabaseCtrl.deleteDatabase)

// Master Data Standard
router.get('/standard', MasterStandardCtrl.getStandard)
router.post('/standard', MasterStandardCtrl.addStandard)
router.put('/standard/:id', MasterStandardCtrl.updateStandard)
router.put('/standard/delete/:id', MasterStandardCtrl.deleteStandard)

// Master Data DataSource
router.get('/datasources', MasterDataSourceCtrl.getDataSources)
router.post('/datasources', MasterDataSourceCtrl.addDataSource)
router.put('/datasources/:id', MasterDataSourceCtrl.updateDataSource)
router.put('/datasources/delete/:id', MasterDataSourceCtrl.deleteDataSource)

// Prodidentity
router.get('/prodidentity/lotno/:lotno', MasterProdidentityCtrl.getProdidentityByLotNo)
router.get('/prodidentity/search/by/lotno', MasterProdidentityCtrl.getProdidentitySearchByLotNo)
router.get('/prodidentity/search/by/lotno/groupby', MasterProdidentityCtrl.getProdidentitySearchByLotNoGroupBy)




module.exports = router;