var express = require('express');
var router = express.Router();
var multer = require('multer');
var common = require('../common.js');
var pgb = require('../pg-binding.js');
var settings = require('../settings/settings.js');
var ctrlCommon = require('../controllers/common.js');
var Q = require('q');

// FIELD DATA GET 1 RESPONSE
/**
 *
 * @api {get} /project/:project_id/fieldData/:field_data_id/show_responses Project FieldData - Get all responses
 * @apiName GetFieldData
 * @apiGroup Custom Views
 *
 * @apiDescription Get one project fieldData (from the field_data table)
 *
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
 * @apiSuccess {Integer} response.features.properties.id field data id
 * @apiSuccess {Integer} response.features.properties.user_id ckan user id
 * @apiSuccess {Integer} response.features.properties.parcel_id parcel_id
 * @apiSuccess {String} response.features.properties.id_string ona unique string identifier
 * @apiSuccess {String} response.features.properties.form_id ona unique form id
 * @apiSuccess {String} response.features.properties.name form name
 * @apiSuccess {Boolean} response.features.properties.publish publish
 * @apiSuccess {Timestamp} response.features.properties.time_created timestamp of field_data creation
 * @apiSuccess {Timestamp} response.features.properties.time_updated timestamp of field_data update
 * @apiSuccess {Object[]} response.features.properties.responses An array of responses
 * @apiSuccess {Object[]} response.features.properties.responses.properties feature's properties
 * @apiSuccess {String} response.features.properties.responses.properties.project_id Cadasta project id
 * @apiSuccess {String} response.features.properties.responses.properties.field_data_id field data id
 * @apiSuccess {String} response.features.properties.responses.properties.respondent_id individual respondent id
 * @apiSuccess {Object} response.features.properties.responses.properties.response Dictionary of respondent responses
 * @apiSuccess {Object[]} response.features.properties.questions An array of field data questions
 * @apiSuccess {Object} response.features.properties.questions.properties feature's properties
 * @apiSuccess {Integer} response.features.properties.questions.properties.question_id question id
 * @apiSuccess {String} response.features.properties.questions.properties.type question type
 * @apiSuccess {String} response.features.properties.questions.properties.label question label
 * @apiSuccess {Integer} response.features.properties.questions.properties.field_data_id field data id
 * @apiSuccess {Integer} response.features.properties.questions.properties.project_id Cadasta project id
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/projects/1/fieldData/1/show_responses
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
                "id": 1,
                "project_id": 1,
                "user_id": null,
                "parcel_id": 12,
                "id_string": "CJF-minimum",
                "form_id": 139,
                "name": null,
                "label": null,
                "publish": true,
                "time_created": "2015-11-05T13:36:52.538861-08:00",
                "time_updated": "2015-11-05T13:36:52.538861-08:00",
                "responses": [
                    {
                        "type": "Feature",
                        "geometry": null,
                        "properties": {
                            "project_id": 1,
                            "field_data_id": 1,
                            "respondent_id": 3,
                            "response": {
                                "1": "2015-10-07T12:29:31.535-07",
                                "2": "2015-10-07T12:30:34.093-07",
                                "3": "2015-10-07",
                                "4": "35385206286421",
                                "5": "samantha",
                                "6": "Jorge",
                                "8": "Garcia",
                                "9": "47.6686462 -122.3843782 0.0 30.0",
                                "10": "1976-07-07",
                                "11": "lease",
                                "12": "lease",
                                "13": "uuid:8b696d77-0478-4967-b816-0d23f751f0ce"
                            },
                            "time_created": "2015-11-05T13:36:52.576802-08:00",
                            "time_updated": "2015-11-05T13:36:52.576802-08:00"
                        }
                    }
                ],
                "questions": [
                    {
                        "type": "Feature",
                        "geometry": null,
                        "properties": {
                            "question_id": 8,
                            "type": "text",
                            "label": "Applicant Last Name (Surname)",
                            "field_data_id": 1,
                            "project_id": 1
                        }
                    }
                ]
            }
        }
    ]
}
 */

router.get('/:project_id/fieldData/:id/show_responses', common.parseQueryOptions, function(req, res, next) {

    var whereClauseArr = ['project_id = $1', 'field_data_id = $2'];
    var whereClauseValues = [req.params.project_id, req.params.id];

    var viewOptions =  {
        queryModifiers: req.queryModifiers,
        outputFormat: req.query.outputFormat || 'GeoJSON'
    };

    if(whereClauseArr.length > 0) {
        viewOptions.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
        viewOptions.whereClauseValues = whereClauseValues;
    }

    var tableWhereClauseArr = ['project_id = $1', 'id = $2'];
    var tableWhereClauseValues = [req.params.project_id, req.params.id];

    var tableOptions =  {
        queryModifiers: req.queryModifiers,
        outputFormat: req.query.outputFormat || 'GeoJSON'
    };

    if(whereClauseArr.length > 0) {
        viewOptions.tableWhereClauseArr = 'WHERE ' + tableWhereClauseArr.join(' AND ');
        viewOptions.tableWhereClauseValues = tableWhereClauseValues;
    }

    Q.all([
        ctrlCommon.getAll('field_data',  tableOptions),
        ctrlCommon.getAll('show_field_data_responses',  viewOptions),
        ctrlCommon.getAll('show_field_data_questions',  viewOptions)
    ])
        .then(function (results) {

            //Process results: Add parcel history and relationships to Parcel GeoJSON
            var geoJSON = results[0][0].response;

            // Add properties to parties geojson
            geoJSON.features[0].properties.responses = results[1][0].response.features;
            geoJSON.features[0].properties.questions = results[2][0].response.features;


            res.status(200).json(geoJSON);
        })
        .catch(function(err){
            next(err)
        })
        .done();

});

// FIELD DATA GET ALL
/**
 *
 * @api {get} /project/:project_id/fieldData Project FieldData - Get all
 * @apiName GetAllFieldData
 * @apiGroup Field Data
 *
 * @apiDescription Get all project fieldData (from the field_data table)
 *
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
 * @apiSuccess {Integer} response.features.properties.id field data id
 * @apiSuccess {Integer} response.features.properties.user_id ckan user id
 * @apiSuccess {Integer} response.features.properties.parcel_id parcel_id
 * @apiSuccess {String} response.features.properties.id_string ona unique string identifier
 * @apiSuccess {String} response.features.properties.form_id ona unique form id
 * @apiSuccess {String} response.features.properties.name form name
 * @apiSuccess {Boolean} response.features.properties.publish publish
 * @apiSuccess {Timestamp} response.features.properties.time_created timestamp of field_data creation
 * @apiSuccess {Timestamp} response.features.properties.time_updated timestamp of field_data update
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/projects/1/fieldData
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
   "type":"FeatureCollection",
   "features":[
      {
         "type":"Feature",
         "geometry":null,
         "properties":{
            "id":1,
            "project_id":1,
            "user_id":null,
            "parcel_id":12,
            "id_string":"CJF-minimum",
            "form_id":139,
            "num_submissions":12,
            "name":null,
            "label":null,
            "publish":true,
            "time_created":"2015-11-05T13:36:52.538861-08:00",
            "time_updated":"2015-11-05T13:36:52.538861-08:00",
            "created_by":null,
            "updated_by":null
         }
      },
      {
         "type":"Feature",
         "geometry":null,
         "properties":{
            "id":2,
            "project_id":1,
            "user_id":null,
            "parcel_id":12,
            "id_string":"CJF-minimum-two",
            "form_id":139,
            "num_submissions":12,
            "name":null,
            "label":null,
            "publish":true,
            "time_created":"2015-11-05T13:36:52.538861-08:00",
            "time_updated":"2015-11-05T13:36:52.538861-08:00",
            "created_by":null,
            "updated_by":null
         }
      }
   ]
}
 */

router.get('/:project_id/fieldData', common.parseQueryOptions, function(req, res, next) {

    var whereClauseArr = [];
    var whereClauseValues = [];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    whereClauseArr.push('project_id = $1');
    whereClauseValues.push(req.params.project_id);

    options.whereClause ='WHERE ' + whereClauseArr.join(' AND ');
    options.whereClauseValues = whereClauseValues;

    ctrlCommon.getAll("show_field_data_list", options)
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});

// FIELD DATA GET 1
/**
 *
 * @api {get} /project/:project_id/fieldData/:field_data_id Project FieldData - Get one
 * @apiName GetFieldData
 * @apiGroup Field Data
 *
 * @apiDescription Get one project fieldData (from the field_data table)
 *
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
 * @apiSuccess {Integer} response.features.properties.id field data id
 * @apiSuccess {Integer} response.features.properties.user_id ckan user id
 * @apiSuccess {Integer} response.features.properties.parcel_id parcel_id
 * @apiSuccess {String} response.features.properties.id_string ona unique string identifier
 * @apiSuccess {String} response.features.properties.form_id ona unique form id
 * @apiSuccess {String} response.features.properties.name form name
 * @apiSuccess {Boolean} response.features.properties.publish publish
 * @apiSuccess {Timestamp} response.features.properties.time_created timestamp of field_data creation
 * @apiSuccess {Timestamp} response.features.properties.time_updated timestamp of field_data update
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/projects/1/fieldData/1
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
   "type":"FeatureCollection",
   "features":[
      {
         "type":"Feature",
         "geometry":null,
         "properties":{
            "id":1,
            "project_id":1,
            "user_id":null,
            "parcel_id":12,
            "id_string":"CJF-minimum",
            "form_id":139,
            "name":null,
            "label":null,
            "publish":true,
            "time_created":"2015-11-05T13:36:52.538861-08:00",
            "time_updated":"2015-11-05T13:36:52.538861-08:00",
            "created_by":null,
            "updated_by":null
         }
      }
   ]
}
 */
router.get('/:project_id/fieldData/:id', common.parseQueryOptions, function(req, res, next) {

    var whereClauseArr = [];
    var whereClauseValues = [];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    whereClauseArr.push('project_id = $1','id = $2');
    whereClauseValues.push(req.params.project_id, req.params.id);

    options.whereClause ='WHERE ' + whereClauseArr.join(' AND ');
    options.whereClauseValues = whereClauseValues;

    ctrlCommon.getAll("field_data", options)
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});

/**
 * @api {patch} /projects/:project_id/fieldData/:field_data_id/validate_respondents Project field data - Validate field data submissions
 * @apiName ValidateFieldData
 * @apiGroup Field Data
 * @apiDescription Validate field data submissions
 *
 * @apiParam (POST parameters) {Array} respondent_ids Respondent ids
 * @apiParam (POST parameters) {Boolean} status Validation status

 *
 * @apiSuccess {Object} cadasta_validate_respondent Array of validated Respondent ids
 *
 * @apiExample {curl} Example usage:
 *     curl -H "Content-Type: application/json" -X PATCH -d {"respondent_ids": [18,19,20,21]} http://localhost/projects/1/fieldData/1/validate_respondents
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "status":"OKAY",
            "cadasta_validate_respondent": [12,13,14,15]
        }
 */

router.patch('/:project_id/fieldData/:field_data_id/validate_respondents', function(req, res, next) {

    // Must have party type and or group name
    if(req.body.respondent_ids === undefined || req.body.status === undefined){
        return next(new Error('Missing POST parameters.'))
    }

    var respondent_ids = req.body.respondent_ids;

    // Create string of respondent ids
    var id_string = respondent_ids.join(",");

    var sql = "SELECT * FROM cd_validate_respondents($1, $2)";

    pgb.queryDeferred(sql,{paramValues: [id_string, req.body.status]})
        .then(function(response){
            res.status(200).json({status:"OKAY",cadasta_validate_respondent: response[0].cd_validate_respondents})
        })
        .catch(function(err){
            next(err);
        })
        .done();
});

module.exports = router;