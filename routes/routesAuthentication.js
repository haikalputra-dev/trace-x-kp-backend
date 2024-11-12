var express = require('express');
var api = require('../tools/common');
var multer = require('multer')
var path = require('path')
var AuthController = require('../controllers/Auth.controller');
var auth = require('../tools/middleware');
var router = express.Router();
var svgCaptcha = require('svg-captcha');
const randomFile = require('select-random-file')

const dir = path.resolve(__dirname, '../public/background')
router.get('/random-background', function (req, res) {
    randomFile(dir, (err, file) => {
        var dirFile = '/background/' + file
        api.ok(res, dirFile)
    })
})
router.get('/captcha', function (req, res) {
    var captcha = svgCaptcha.createMathExpr({

    });
    api.ok(res, captcha)
});

const DIR = 'src/assets/img/tmp';

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});


//User Authentication and authorization
router.post('/auth/login', AuthController.login);
router.get('/auth/check-token', auth.authorization, function (req, res) {
    api.ok(res, 'Token Provided')
})


module.exports = router;