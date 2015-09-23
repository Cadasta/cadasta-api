var express = require('express');
var router = express.Router();
var multer = require('multer');
var common = require('../common.js');
var upload = multer();
var settings = require('../settings/settings.js');
var ctrlCommon = require('../controllers/common.js');
var Q = require('q');

var AWS = require('aws-sdk');
AWS.config.update({accessKeyId: settings.s3.awsAccessKey, secretAccessKey: settings.s3.awsSecretKey});

/**
 * @api {get} /resources/project_id/resource_type/resource_type_id Upload
 * @apiName UploadResource
 * @apiGroup Resources
 *
 * @apiDescription Upload parcel, party, or relationship project resource
 *
 * @apiParam (Optional query string parameters) {String} [project_id] Options: Project id integer
 * @apiParam (Optional query string parameters) {String} [fields] Options: id, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_by] Options: id, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_dir=ASC] Options: ASC or DESC
 * @apiParam (Optional query string parameters) {Number} [limit] integer of records to return
 *
 * @apiSuccess {Object} response an Object message property
 *
 * @apiExample {curl} Example usage:
 *     curl -i -F name=test -F filedata=@newfile.rtf localhost:9000/resources/1/parcel/3
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {"message":"Thanks for the upload."}
 */

// Upload Resource
router.post('/:project_id/:type/:type_id/', upload.single('filedata'), function (req, res, next) {

    // grab all req params
    var project_id = parseInt(req.params.project_id);
    var resource_type = req.params.type;
    var resource_type_id = parseInt(req.params.type_id);
    var file_name = req.file.originalname;
    var file = req.file.buffer;

    var deferred = Q.defer();

    getOrg(project_id)
        .then(function (res) {

            var org_id = res[0].id;
            var org_title = res[0].title;
            var project_title = res[0].project_title;
            var path = org_title + '-' + org_id + '/' + project_title + '-' + project_id + '/' + resource_type + '/' + resource_type_id + '-' +file_name;

            return uploadS3(path,file);
        }).then(function (path) {
            console.log('Successfully uploaded resource.');
            //create resource in DB
            return createResource(project_id, resource_type, resource_type_id, path,file_name);
        }).then(function(result){
            console.log('Successfully uploaded resource id:' + result[0].cd_create_resource + ' to DB.');
            res.status(200).json({message: "Thanks for the upload."});

        }).catch(function(err){
            console.log(err);
            next(err);
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

function createResource(p_id, type, type_id, path,filename) {

    var deferred = Q.defer();

    var rootURL = 'https://s3.amazonaws.com/cadasta-test-space/';
    var url = rootURL + path;
    var sql = "SELECT * FROM cd_create_resource('" + p_id + "','" + type + "'," + type_id + ",'" + url + "',null, '" + filename + "')";

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
    var downloadFileName = "theFile.txt";

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

/**
 * @api {get} /resources Get all
 * @apiName GetResources
 * @apiGroup Resources
 *
 * @apiDescription Get all resources (from the resource table)
 *
 * @apiParam (Optional query string parameters) {String} [project_id] Options: Project id integer
 * @apiParam (Optional query string parameters) {String} [fields] Options: id, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_by] Options: id, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_dir=ASC] Options: ASC or DESC
 * @apiParam (Optional query string parameters) {Number} [limit] integer of records to return
 *
 * @apiSuccess {Object} response A feature collection with zero to many features
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON geometry object
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {Integer} response.features.properties.id resource id
 * @apiSuccess {Integer} response.features.properties.project_id resource project id
 * @apiSuccess {String} response.features.properties.type resource type (parcel,party,relationship)
 * @apiSuccess {String} response.features.properties.url resource download url
 * @apiSuccess {String} response.features.properties.description resource description
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_updated Time stamp of last update
 * @apiSuccess {Number} response.features.properties.created_by id of creator
 * @apiSuccess {Number} response.features.properties.updated_by id of updater
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/resources
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": null,
            "properties": {
                "id": 2,
                "type": null,
                "url": "http://www.cadasta.org/2/parcel",
                "description": null,
                "active": true,
                "sys_delete": false,
                "time_created": "2015-09-09T14:57:34.398855-07:00",
                "time_updated": "2015-09-09T14:57:34.398855-07:00",
                "created_by": null,
                "updated_by": null,
                "project_id": 1
            }
        }
    ]
}
 */

// GET ALL DB RECORDS
router.get('', common.parseQueryOptions, function(req, res, next) {

    var whereClauseArr = [];
    var whereClauseValues = [];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    if(req.query.project_id) {
        whereClauseArr.push('project_id = $1');
        whereClauseValues.push(parseInt(req.query.project_id));
        options.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
        options.whereClauseValues = whereClauseValues;
    }

    ctrlCommon.getAll("resource", options)
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});

module.exports = router;