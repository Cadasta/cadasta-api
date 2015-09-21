var express = require('express');
var router = express.Router();
var common = require('../common.js');
var settings = require('../settings/settings.js');
var ctrlCommon = require('../controllers/common.js');
var pgb = require('../pg-binding.js');

/**
 * @api {get} /organizations Get all
 * @apiName GetOrganizations
 * @apiGroup Organizations
 * @apiDescription Get all organizations (from the organization table)
 *
 * @apiParam (Optional query string parameters) {String} [fields] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_by] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_dir=ASC] Options: ASC or DESC
 * @apiParam (Optional query string parameters) {Number} [limit] integer of records to return
 * @apiParam (Optional query string parameters) {Boolean} [returnGeometry=false] integer of records to return
 *
 * @apiSuccess {Object} response A feature collection with one organization feature
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON geometry object
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {String} response.features.properties.id organization id
 * @apiSuccess {String} response.features.properties.title organization title
 * @apiSuccess {String} response.features.properties.ckan_id unique CKAN organization identifier
 * @apiSuccess {Boolean} response.features.properties.active organization status
 * @apiSuccess {Boolean} response.features.properties.sys_delete db status
 * @apiSuccess {String} response.features.properties.user_id user id that created organization
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_created Time stamp of last update
 * @apiSuccess {String} response.features.properties.created_by user id of creator
 * @apiSuccess {String} response.features.properties.updated_by user if of updater
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/organizations
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
                "organization_id": 1,
                "title": "Medellin Pilot",
                "ckan_id": "Medellin",
                "active": true,
                "sys_delete": false,
                "time_created": "2015-09-08T15:24:29.278002-07:00",
                "time_updated": "2015-09-08T15:24:29.278002-07:00",
                "created_by": null,
                "updated_by": null
            }
        },
        {
            "type": "Feature",
            "geometry": null,
            "properties": {
                "id": 3,
                "organization_id": 1,
                "title": "Ghana Pilot",
                "ckan_id": "Ghana",
                "active": true,
                "sys_delete": false,
                "time_created": "2015-09-08T15:24:31.811772-07:00",
                "time_updated": "2015-09-08T15:24:31.811772-07:00",
                "created_by": null,
                "updated_by": null
            }
        }
    ]
}
 */
// GET ALL DB RECORDS
router.get('', common.parseQueryOptions, function(req, res, next) {

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    ctrlCommon.getAll("organization", options)
        .then(function(result){
            res.status(200).json(result[0].response);
        })
        .catch(function(err){
            next(err);
        })
        .done();

});

/**
 * @api {get} /organizations/:id Get one
 * @apiName GetOrganization
 * @apiGroup Organizations
 * @apiDescription Get a organization (from the organization table)
 *
 * @apiParam {Number} id organization's unique ID.
 *
 * @apiParam (Optional query string parameters) {String} [fields] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_by] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_dir=ASC] Options: ASC or DESC
 * @apiParam (Optional query string parameters) {Number} [limit] integer of records to return
 * @apiParam (Optional query string parameters) {Boolean} [returnGeometry=false] integer of records to return
 *
 * @apiSuccess {Object} response A feature collection with one organization feature
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON geometry object
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {String} response.features.properties.id organization id
 * @apiSuccess {String} response.features.properties.title organization title
 * @apiSuccess {String} response.features.properties.description organization description
 * @apiSuccess {String} response.features.properties.ckan_id unique CKAN organization identifier
 * @apiSuccess {Boolean} response.features.properties.active organization status
 * @apiSuccess {Boolean} response.features.properties.sys_delete db status
 * @apiSuccess {String} response.features.properties.user_id user id that created organization
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_created Time stamp of last update
 * @apiSuccess {String} response.features.properties.created_by user id of creator
 * @apiSuccess {String} response.features.properties.updated_by user if of updater
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/organizations/1
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
                "title": "HFH",
                "description": null,
                "ckan_id": null,
                "active": true,
                "sys_delete": false,
                "time_created": "2015-09-08T15:11:11.959406-07:00",
                "time_updated": "2015-09-08T15:11:11.959406-07:00",
                "created_by": null,
                "updated_by": null
            }
        }
    ]
}
 */

// GET 1 DB RECORD
router.get('/:id', common.parseQueryOptions, function(req, res, next) {

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    ctrlCommon.getWithId('organization', 'id', req.params.id, options)
        .then(function(result){
            res.status(200).json(result[0].response);
        })
        .catch(function(err){
            next(err);
        })
        .done();

});



// CREATE A ORGANIZATION RECORD


/**
 * @api {post} /organizations Create one
 * @apiName PostOrganization
 * @apiGroup Organizations
 * @apiDescription Create a organization
 *
 *
 * @apiParam {String} ckan_id The id of the organization in the CKAN application database
 * @apiParam {String} ckan_title The title of the organization in the CKAN application database
 * @apiParam {String} ckan_description The description of the organization in the CKAN application database

 *
 * @apiSuccess {Object} cadasta_organization_id The cadasta database id of the created organization

 *
 * @apiExample {curl} Example usage:
 *     curl -H "Content-Type: application/json" -X POST -d '{"ckan_id":"my-org","ckan_title":"My Org", "ckan_description": "My description"}' http://localhost/organizations
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "cadasta_organization_id": 1
        }
 */
router.post('', function(req, res, next) {

    var ckan_id = req.body.ckan_id;
    var ckan_title = req.body.ckan_title;
    var ckan_description = req.body.ckan_description;

    if(ckan_id === undefined || ckan_title === undefined || ckan_description === undefined) {
        return next(new Error('Missing POST parameters.'))
    }

    var sql = "SELECT * FROM cd_create_organization($1,$2,$3)";

    pgb.queryDeferred(sql,{paramValues: [ckan_id, ckan_title, ckan_description]})
        .then(function(response){
            res.status(200).json({cadasta_organization_id: response[0]})
        })
        .catch(function(err){
            next(err);
        })
        .done();

});
module.exports = router;