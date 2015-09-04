var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer();
var settings = require('../settings/settings.js');
var AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: settings.awsAccessKey, secretAccessKey: settings.awsSecretKey });

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


/*


    var params = {
        localFile: req.file,

        s3Params: {
            Bucket: "cadasta-test-space",
            Key: "test-dir/test-upload.txt",
            // other options supported by putObject, except Body and ContentLength.
            // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
        },
    };
    var uploader = client.uploadFile(params);
    uploader.on('error', function(err) {
        console.error("unable to upload:", err.stack);
        res.status(500).json(err);
    });
    uploader.on('progress', function() {
        console.log("progress", uploader.progressMd5Amount,
            uploader.progressAmount, uploader.progressTotal);
    });
    uploader.on('end', function() {
        console.log("done uploading");
        res.status(200).json({message: 'Thanks for the upload.'});
    });

*/


});


module.exports = router;