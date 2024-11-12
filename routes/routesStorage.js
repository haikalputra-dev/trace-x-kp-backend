var express = require('express');
var router = express.Router();
var StorageService = require('../services/StorageService')


router.get('/download/:filename', StorageService.download);

router.post('/upload', StorageService.upload.single('file'), (req, res) => {
    console.log(res)
    if (!req.file || req.fileValidationError) {
        return res.status(400).json({
            error: 'No file uploaded.'
        });
    }

    const filename = req.file.filename;
    res.status(200).json({
        message: 'File uploaded successfully.',
        filename
    });
});

router.get('/images/:filename', (req, res) => {
    const filename = req.params.filename;
    res.sendFile(filename, {
        root: './storage/uploads'
    }, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        } else {
            console.log('Sent:', filename);
        }
    });
});

module.exports = router;