var express = require('express');
var router = express.Router();
var common = require('../common.js');
var ctrlCommon = require('../controllers/common.js');


/**
 * @api {get} /projects/relationships/:id/relationship_history Get relationship's history
 * @apiName GetRelationshipHistory
 * @apiGroup Relationships
 * @apiDescription Get relationship history records for a given relationship_id
 * @apiParam {Number} id relationship's unique ID.
 *
 * @apiParam (Optional query string parameters) {String} [fields] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_by] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_dir=ASC] Options: ASC or DESC
 * @apiParam (Optional query string parameters) {Number} [limit] integer of records to return
 *
 * @apiSuccess {Object} response A feature collection with feature per parcel history record
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON geometry object (always null here)
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {Number} response.features.properties.id history id
 * @apiSuccess {Number} response.features.properties.relationship_id relationship id
 * @apiSuccess {Number} response.features.properties.origin_id origin id
 * @apiSuccess {Number} response.features.properties.parent_id parent id
 * @apiSuccess {String} response.features.properties.expiration_date expiration_date
 * @apiSuccess {String} response.features.properties.description description
 * @apiSuccess {String} response.features.properties.date_modified YYYY-MM-DD of last update
 * @apiSuccess {Boolean} response.features.properties.active active/archived flag
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_updated Time stamp of last update
 * @apiSuccess {Number} response.features.properties.created_by id of creator
 * @apiSuccess {Number} response.features.properties.updated_by id of updater
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/relationships/1/relationship_history
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
            "relationship_id": 1,
            "origin_id": 1,
            "version": 1,
            "parent_id": null,
            "expiration_date": null,
            "description": "History",
            "date_modified": "2015-08-31",
            "active": true,
            "time_created": "2015-08-31T13:00:18.339167-07:00",
            "time_updated": null,
            "created_by": 11,
            "updated_by": null
          }
        }
      ]
    }
 */
router.get('/:project_id/relationships/:id/relationship_history', common.parseQueryOptions, function(req, res, next) {

    var whereClauseArr = ['project_id = $1','relationship_id = $2'];
    var whereClauseValues = [req.params.project_id, req.params.id];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    options.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
    options.whereClauseValues = whereClauseValues;

    req.queryModifiers.returnGeometry = false;

    ctrlCommon.getAll('show_relationship_history', options)
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});

/**
 * @api {get} /projects/relationships Get all
 * @apiName GetRelationships
 * @apiGroup Relationships
 *
 * @apiDescription Get all relationships (from the relationship table)
 *
 * @apiParam (Optional query string parameters) {String} [fields] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_by] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_dir=ASC] Options: ASC or DESC
 * @apiParam (Optional query string parameters) {Number} [limit] integer of records to return
 * @apiParam (Optional query string parameters) {Boolean} [returnGeometry=false] integer of records to return
 *
 * @apiSuccess {Object} response A feature collection with zero to many features
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON geometry object
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {Integer} response.features.properties.id Relationship id
 * @apiSuccess {Integer} response.features.properties.project_id Project id
 * @apiSuccess {Integer} response.features.properties.parcel_id Parcel id
 * @apiSuccess {Integer} response.features.properties.party_id Party id
 * @apiSuccess {Integer} response.features.properties.geom_id Geometry id
 * @apiSuccess {String} response.features.properties.tenure_type Type of tenure (own, lease, occupy, informal occupy)
 * @apiSuccess {String} response.features.properties.acquired_date Date of acquisition
 * @apiSuccess {String} response.features.properties.how_acquired Description of how relationship was acquired
 * @apiSuccess {Boolean} response.features.properties.active Status of relationship
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_updated Time stamp of last update
 * @apiSuccess {Integer} response.features.properties.created_by id of creator
 * @apiSuccess {Integer} response.features.properties.updated_by id of updater
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/relationships
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
                "parcel_id": 1,
                "party_id": 1,
                "geom_id": null,
                "tenure_type": 1,
                "acquired_date": "2015-08-03",
                "how_acquired": "lease",
                "active": true,
                "sys_delete": false,
                "time_created": "2015-09-08T15:15:37.470562-07:00",
                "time_updated": "2015-09-08T15:15:37.470562-07:00",
                "created_by": 11,
                "updated_by": null
            }
        }
    ]
}
 */

router.get('/:project_id/relationships', common.parseQueryOptions, function(req, res, next) {

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

    ctrlCommon.getAll("relationship", options)
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});

/**
 * @api {get} /projects/:project_id/relationships/:id/resources Get relationship resources
 * @apiName GetRelationshipResources
 * @apiGroup Relationships
 *
 * @apiDescription Get all relationship resources (from the resource_parcel table)
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
 * @apiSuccess {Integer} response.features.properties.relationship_id resource relationship id
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
 *     curl -i http://localhost/relationships/1/resources
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
                "relationship_id": 1,
                "resource_id": 32,
                "type": null,
                "url": "http://www.cadasta.org/32/relationship",
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

router.get('/:project_id/relationships/:id/resources', common.parseQueryOptions, function(req, res, next) {

    var whereClauseArr = [];
    var whereClauseValues = [];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    whereClauseArr.push('relationship_id = $1');
    whereClauseValues.push(req.params.id);

    whereClauseArr.push('project_id = $2');
    whereClauseValues.push(req.params.project_id);

    options.whereClause ='WHERE ' + whereClauseArr.join(' AND ');
    options.whereClauseValues = whereClauseValues;

    ctrlCommon.getAll("show_relationship_resources", options)
        .then(function(result){
            res.status(200).json(result[0].response);
        })
        .catch(function(err){
            next(err);
        })
        .done();

});
module.exports = router;