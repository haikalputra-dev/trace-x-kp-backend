const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: 'storage/uploads/',
    filename: (req, file, cb) => {
        console.log(file + "qqwq")
        console.log(req + "zxczx")
        const originalname = file.originalname;
        const extname = path.extname(originalname);
        const basename = path.basename(originalname, extname);

        let filename = originalname;
        console.log("asdasdas" + filename)
        let i = 1;
        while (fs.existsSync(`storage/uploads/${filename}`)) {
            filename = `${basename} (${i})${extname}`;
            i++;
        }

        cb(null, filename);
    },
});

const fileChecking = function (filename, res) {
    const filePath = path.join(__dirname, '../..', `/storage/uploads/`, filename);
    console.log(filePath)
    if (fs.existsSync(filePath)) {
        const fileExtension = path.extname(filename).toLowerCase();
        if (fileExtension === '.pdf') {
            res.setHeader('Content-Type', 'application/pdf');
        } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension)) {
            res.setHeader('Content-Type', `image/${fileExtension.substring(1)}`);
        } else {
            return false;
        }
        return filePath;
    } else {
        return false;
    }
}

const upload = multer({
    storage: storage
});


const download = function (req, res) {
    console.log(req)
    const filePath = fileChecking(req.params.filename, res);
    console.log(filePath)
    if (filePath) {
        const contentDisposisiton = req.query.inline == 'true' ? 'inline' : 'attachment';
        res.setHeader('Content-Disposition', `${contentDisposisiton}; filename="${req.params.filename}"`);
        const fileStream = fs.createReadStream(filePath);
        console.log(contentDisposisiton);
        fileStream.pipe(res);
    } else {
        res.redirect('/api/not-found');
    }
}

module.exports = {
    upload,
    download
};