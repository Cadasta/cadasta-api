var express = require('express');
var router = express.Router();
var multer = require('multer');
var common = require('../common.js');
var upload = multer();
var settings = require('../settings/settings.js');
var ctrlCommon = require('../controllers/common.js');
var Q = require('q');
var pgb = require('../pg-binding.js');


var AWS = require('aws-sdk');
AWS.config.update({accessKeyId: settings.s3.awsAccessKey, secretAccessKey: settings.s3.awsSecretKey});

/**
 * @api {post} /projects/project_id/resource_type/resource_type_id/resources Upload
 * @apiName UploadResource
 * @apiGroup Resources
 *
 * @apiDescription Upload parcel, party, or relationship project resource
 *
 * @apiParam (Required path parameters) {Number} [project_id] Project id
 * @apiParam (Required path parameters) {String} [resource_type] Options: project, parcel, party, relationship
 * @apiParam (Required path parameters) {Number} [resource_type_id] id of resource_type
 * @apiParam (Required multipart body parameters) {File} [filedata] file data
 * @apiParam (Required multipart body parameters) {String} [filename] file name 
 *
 * @apiSuccess {Object} response an Object message property
 *
 * @apiExample {curl} Example usage:
 *     curl -i -F filename=test -F filedata=@newfile.rtf http://localhost:9000/project/3/parcel/3/resources
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"message":"Success"}
 */


// Upload Resource
router.post('/:project_id/:type/:type_id/resources', upload.single('filedata'), function (req, res, next) {

    // grab all req params
    var project_id = parseInt(req.params.project_id);
    var resource_type = req.params.type;
    var resource_type_id = parseInt(req.params.type_id);

    if ( req.body.filename === undefined ) {
        return next(new Error('Missing POST body form field: "filename"'))
    }
    var file_name = req.body.filename.replace(/ /g, "").replace(/%20/g, "");  // remove white space

    var file = req.file.buffer;
    var path;

    var deferred = Q.defer();

    getOrg(project_id)
        .then(function (res) {

            var org_id = res[0].id;
            path = org_id + '/' + project_id + '/' + resource_type + '/' + resource_type_id + '-' + file_name;

            return uploadS3(path,file);
        }).then(function (s3response) {

            console.log('Successfully uploaded resource to S3.');
            //create resource in DB
            return createResource(project_id, resource_type, resource_type_id, s3response.path,file_name);

        }).then(function(result){

            //console.log('Successfully uploaded resource id:' + result[0].cd_create_resource + ' to DB.');
            res.status(200).json({message: "Success"});

        }).catch(function(err){

            // do not delete if already exists in DB
            if (err.constraint == 'resource_url_key'){
                res.status(400).json({ error:err, type:"duplicate", message:err.detail });
            } else {
                // delete from S3 if DB throws error
                deleteS3(path)
                    .then(function(resp){
                        res.status(400).json({message:err.message, error:err});
                    })
                    .catch(function(err){
                        res.status(400).json({message:err.message, error:err});
                    })
            }


        }).done();

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
        Bucket: settings.s3.bucket,
        Key: path,
        Body: file,
        ACL: 'public-read'
    }, function (err, data) {

        if (err instanceof Error) {
            console.log(err);
            deferred.reject(err);
            //return res.status(500).json(resp);
        }

        deferred.resolve({s3:data,path:path});
    });

    return deferred.promise;

}


/**
 *
 * @param path - s3 path to file
 * @returns {*|promise}
 */

function deleteS3(path){

    var deferred = Q.defer();

    var s3 = new AWS.S3();

    var params = {
        Bucket: settings.s3.bucket,
        Key: path
    };

    s3.deleteObject(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            deferred.reject({message: "File not deleted; " + err});

        }  // error
        else {
            console.log(path, " deleted from S3.");                 // deleted
            deferred.resolve({message: "File deleted from S3."});
        }
    });

    return deferred.promise;

}

function createResource(p_id, type, type_id, path, filename) {

    var deferred = Q.defer();

    var rootURL = 'https://s3.amazonaws.com/' + settings.s3.bucket + '/';
    var url = rootURL + path;
    var sql = "SELECT * FROM cd_create_resource('" + p_id + "','" + type + "'," + type_id + ",'" + url + "',null, '" + filename + "')";

    pgb.queryDeferred(sql)
        .then(function(res){
            deferred.resolve(res);
        })
        .catch(function(err){
            deferred.reject(err);
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

    pgb.queryDeferred(sql)
        .then(function(res){
            deferred.resolve(res);
        })
        .catch(function(err){
            deferred.reject(err);
        });

    return deferred.promise;
}

// READ
//router.get('/resources/:id/', function (req, res, next) {
//
//    //  Use ID to get S3 bucket file path and file name; to be built, just pasting in filename
//    var s3File = 'upload-me.txt';
//    var downloadFileName = "theFile.txt";
//
//    var s3 = new AWS.S3();
//
//    s3.getObject({
//        Bucket: settings.s3.bucket,
//        Key: s3File
//    }, function (err, data) {
//        res.set('Content-disposition', 'attachment; filename=' + downloadFileName);
//        res.set('Content-type', 'text/plain');
//        res.charset = 'UTF-8';
//        res.write(data.Body);
//        res.end();
//    });
//
//});

// DELETE
//router.delete('/resources/:id', function (req, res, next) {
//
//    //  Use ID to get S3 bucket file path and file name; to be built, just pasting in filename
//    var s3File = 'upload-me.txt';
//
//    var s3 = new AWS.S3();
//
//    var params = {
//        Bucket: settings.s3.bucket,
//        Key: s3File
//    };
//
//    s3.deleteObject(params, function (err, data) {
//        if (err) {
//            console.log(err, err.stack);
//            res.status(200).json({message: "File not deleted; " + err})
//
//        }  // error
//        else {
//            console.log(s3File, " deleted.");                 // deleted
//            res.status(200).json({message: "File deleted."});
//        }
//    });
//
//});


module.exports = router;
