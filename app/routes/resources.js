var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer();
var settings = require('../settings/settings.js');

var AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: settings.s3.awsAccessKey, secretAccessKey: settings.s3.awsSecretKey });

// CREATE
router.post('', upload.single('filedata'), function(req, res, next) {

    var s3 = new AWS.S3();
    s3.putObject({
        Bucket: 'cadasta-test-space',
        Key: req.file.originalname,
        Body: req.file.buffer,
        ACL: 'public-read'
    },function (resp) {

        if(resp instanceof Error){
            console.log(resp);
            return res.status(500).json(resp);
        }
        console.log(arguments);
        console.log('Successfully uploaded package.');
        res.status(200).json({message: 'Thanks for the upload.'});
    });

});

// READ
router.get('/:id', function(req, res, next) {

    //  Use ID to get S3 bucket file path and file name; to be built, just pasting in filename
    var s3File = 'upload-me.txt';
    var downloadFileName = "theFile.txt"

    var s3 = new AWS.S3();

    s3.getObject({
        Bucket: settings.s3.bucket,
        Key: s3File
    }, function(err, data) {
        res.set('Content-disposition', 'attachment; filename=' + downloadFileName);
        res.set('Content-type', 'text/plain');
        res.charset = 'UTF-8';
        res.write(data.Body);
        res.end();
    });

});

// DELETE
router.delete('/:id', function(req, res, next) {

    //  Use ID to get S3 bucket file path and file name; to be built, just pasting in filename
    var s3File = 'upload-me.txt';

    var s3 = new AWS.S3();

    var params = {
        Bucket: settings.s3.bucket,
        Key: s3File
    };

    s3.deleteObject(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            res.status(200).json({message: "File not deleted; " + err})

        }  // error
        else {
            console.log(s3File, " deleted.");                 // deleted
            res.status(200).json({message: "File deleted."});
        }
    });

});

module.exports = router;