var express = require('express');
var router = express.Router();
var common = require('../common.js');
var ctrlCommon = require('../controllers/common.js');
var Q = require('q');

/**
 *
 * @api {get} /project/:project_id/parties Project Parties - Get one
 * @apiName GetParties
 * @apiGroup Projects
 *
 * @apiDescription Get one project party (from the party table)
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
 * @apiSuccess {Integer} response.features.properties.id party id
 * @apiSuccess {Integer} response.features.properties.project_id party project id
 * @apiSuccess {Integer} response.features.properties.num_relationships number of party relationships
 * @apiSuccess {String} response.features.properties.first_name party first name
 * @apiSuccess {String} response.features.properties.last_name party last name
 * @apiSuccess {String} response.features.properties.group_name Time stamp of last update
 * @apiSuccess {Timestamp} response.features.properties.time_created timestamp of party creation
 * @apiSuccess {Timestamp} response.features.properties.time_updated timestamp of party update
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/projects/1/parties/64
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
                "project_id": 1,
                "id": 64,
                "num_relationships": 0,
                "group_name": "Wal-Mart",
                "first_name": null,
                "last_name": null,
                "type": "group",
                "active": true,
                "time_created": "2015-10-28T15:00:52.522756-07:00",
                "time_updated": "2015-10-28T15:00:52.522756-07:00"
            }
        }
    ]
}
 */

router.get('/:project_id/parties/:id', common.parseQueryOptions, function(req, res, next) {

    var whereClauseArr = ['project_id = $1', 'id = $2'];
    var whereClauseValues = [req.params.project_id, req.params.id];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    options.whereClause ='WHERE ' + whereClauseArr.join(' AND ');
    options.whereClauseValues = whereClauseValues;

    ctrlCommon.getAll("show_parties", options)
        .then(function(result){
            res.status(200).json(result[0].response);
        })
        .catch(function(err){
            next(err);
        })
        .done();

});

/**
 *
 * @api {get} /project/:project_id/parties Project Parties - Get all
 * @apiName GetParties
 * @apiGroup Projects
 *
 * @apiDescription Get all project parties (from the party table)
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
 * @apiSuccess {Integer} response.features.properties.id party id
 * @apiSuccess {Integer} response.features.properties.project_id party project id
 * @apiSuccess {Integer} response.features.properties.num_relationships number of party relationships
 * @apiSuccess {String} response.features.properties.first_name party first name
 * @apiSuccess {String} response.features.properties.last_name party last name
 * @apiSuccess {String} response.features.properties.group_name Time stamp of last update
 * @apiSuccess {Timestamp} response.features.properties.time_created timestamp of party creation
 * @apiSuccess {Timestamp} response.features.properties.time_updated timestamp of party update
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/projects/1/parties
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
                "project_id": 1,
                "id": 64,
                "num_relationships": 0,
                "group_name": "Wal-Mart",
                "first_name": null,
                "last_name": null,
                "type": "group",
                "active": true,
                "time_created": "2015-10-28T15:00:52.522756-07:00",
                "time_updated": "2015-10-28T15:00:52.522756-07:00"
            }
        }
    ]
}
 */

router.get('/:project_id/parties', common.parseQueryOptions, function(req, res, next) {

    var whereClauseArr = ['project_id = $1'];
    var whereClauseValues = [req.params.project_id];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    options.whereClause ='WHERE ' + whereClauseArr.join(' AND ');
    options.whereClauseValues = whereClauseValues;

    ctrlCommon.getAll("show_parties", options)
        .then(function(result){
            res.status(200).json(result[0].response);
        })
        .catch(function(err){
            next(err);
        })
        .done();

});


/**
 *
 * @api {get} /project/:project_id/parties/:id/resources Get party resources
 * @apiName GetPartyResources
 * @apiGroup Parties
 *
 * @apiDescription Get all parcel resources (from the resource_parcel table)
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
 * @apiSuccess {Integer} response.features.properties.resource_id resource id
 * @apiSuccess {Integer} response.features.properties.party_id resource parcel id
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
 *     curl -i http://localhost/parties/1/resources
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
                "party_id": 1,
                "resource_id": 32,
                "type": null,
                "url": "http://www.cadasta.org/32/parcel",
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

router.get('/:project_id/parties/:id/resources', common.parseQueryOptions, function(req, res, next) {

    var whereClauseArr = ['party_id = $1', 'project_id = $2'];
    var whereClauseValues = [req.params.id, req.params.project_id];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    options.whereClause ='WHERE ' + whereClauseArr.join(' AND ');
    options.whereClauseValues = whereClauseValues;

    ctrlCommon.getAll("show_party_resources", options)
        .then(function(result){
            res.status(200).json(result[0].response);
        })
        .catch(function(err){
            next(err);
        })
        .done();

});

module.exports = router;