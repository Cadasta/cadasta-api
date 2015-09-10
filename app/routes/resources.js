var express = require('express');
var router = express.Router();
var multer = require('multer');
var common = require('../common.js');
var upload = multer();
var settings = require('../settings/settings.js');
var Q = require('q');


var AWS = require('aws-sdk');
AWS.config.update({accessKeyId: settings.s3.awsAccessKey, secretAccessKey: settings.s3.awsSecretKey});

// CREATE
router.post('/:project_id/:type/:type_id/', upload.single('filedata'), function (req, res, next) {

    // grab all req params
    var project_id = parseInt(req.params.project_id);
    var resource_type = req.params.type;
    var resource_type_id = parseInt(req.params.type_id);
    var file_name = req.body.name;
    var file = req.file.buffer;

    var deferred = Q.defer();

    getOrg(project_id)
        .then(function (res) {
            return res[0];
        }).then(function (res) {

            var org_id = res.id;
            var org_title = res.title;
            var project_title = res.project_title;
            var path = org_title + '-' + org_id + '/' + project_title + '-' + project_id + '/' + resource_type + '/' + file_name + '-' + resource_type_id;

            return uploadS3(path,file);
        }).then(function (path) {
            console.log('Successfully uploaded resource.');
            //create resource in DB
            return createResource(project_id, resource_type, resource_type_id, path);
        }).then(function(res){
            console.log('Successfully uploaded resource id:' + res[0].cd_create_resource + ' to DB.');
            res.status(200).json({message: 'Thanks for the upload.'});

        });

    return deferred.promise;

});

/**
 * Upload file to s3
 * @param path
 * @param file
 * @returns {*|promise}
 */
function uploadS3 (path,file){

    var deferred = Q.defer();

    var s3 = new AWS.S3();
    s3.putObject({
        Bucket: 'cadasta-test-space',
        Key: path,
        Body: file,
        ACL: 'public-read'
    }, function (resp) {

        if (resp instanceof Error) {
            console.log(resp);
            deferred.reject(resp);
            //return res.status(500).json(resp);
        }

        deferred.resolve(path);
    });

    return deferred.promise;

}

function createResource(p_id, type, type_id, path) {

    var deferred = Q.defer();

    var rootURL = 'https://s3.amazonaws.com/cadasta-test-space/';
    var url = rootURL + path;
    var sql = "SELECT * FROM cd_create_resource('" + p_id + "','" + type + "'," + type_id + ",'" + url + "',null)";

    common.query(sql, function (err, res) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(res);
        }
    });

    return deferred.promise;
}

/**
 * Get org id, title and project title
 * @param p_id
 * @returns {*|promise}
 */
function getOrg(p_id) {
    var deferred = Q.defer();

    var sql = 'SELECT o.id,o.title,p.title as project_title FROM organization o, project p WHERE o.id = (SELECT organization_id FROM project where id = ' + p_id + ') and p.organization_id = o.id and p.id = ' + p_id;

    common.query(sql, function (err, res) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(res);
        }
    });

    return deferred.promise;
}

// READ
router.get('/:id', function (req, res, next) {

    //  Use ID to get S3 bucket file path and file name; to be built, just pasting in filename
    var s3File = 'upload-me.txt';
    var downloadFileName = "theFile.txt"

    var s3 = new AWS.S3();

    s3.getObject({
        Bucket: settings.s3.bucket,
        Key: s3File
    }, function (err, data) {
        res.set('Content-disposition', 'attachment; filename=' + downloadFileName);
        res.set('Content-type', 'text/plain');
        res.charset = 'UTF-8';
        res.write(data.Body);
        res.end();
    });

});

// DELETE
router.delete('/:id', function (req, res, next) {

    //  Use ID to get S3 bucket file path and file name; to be built, just pasting in filename
    var s3File = 'upload-me.txt';

    var s3 = new AWS.S3();

    var params = {
        Bucket: settings.s3.bucket,
        Key: s3File
    };

    s3.deleteObject(params, function (err, data) {
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