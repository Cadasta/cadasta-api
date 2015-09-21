var express = require('express');
var router = express.Router();
var pgb = require('../pg-binding');
var common = require('../common.js');
var ctrlCommon = require('../controllers/common.js');

var Q = require('q');

/**
 * @api {get} /show_parcels_list Parcel List - get all
 * @apiName show_parcels_list
 * @apiGroup Custom Views
 * @apiDescription Get records from the show_parcels_list database view
 *
 * @apiParam {String} tenure_type Options: own, lease, occupy, informal occupy
 * @apiParamExample  Query String Example:
 *  curl -i http://localhost/custom/get_parcels_list?tenure_type=own,lease
 * @apiSuccess {Object} response A feature collection with zero to many features
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON geometry object
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {Integer} response.features.properties.id parcel id
 * @apiSuccess {Timestamp} response.features.properties.time_created timestamp with timezone
 * @apiSuccess {Numeric} response.features.properties.area area of parcel geometry
 * @apiSuccess {String} response.features.properties.tenure_type type of relationship tenure
 * @apiSuccess {Integer} response.features.properties.num_relationships number of associated relationships
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/custom_get_parcels_list
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *
 * {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": null,
            "properties": {
                "id": 45,
                "time_created": "2015-08-24T14:03:27.144363-07:00",
                "area": null,
                "tenure_type": "own",
                "num_relationships": 6
            }
        },
        {
            "type": "Feature",
            "geometry": null,
            "properties": {
                "id": 44,
                "time_created": "2015-08-24T14:03:27.144363-07:00",
                "area": null,
                "tenure_type": "lease",
                "num_relationships": 5
            }
        },
        {
            "type": "Feature",
            "geometry": null,
            "properties": {
                "id": 43,
                "time_created": "2015-08-24T14:03:27.144363-07:00",
                "area": null,
                "tenure_type": "occupy",
                "num_relationships": 2
            }
        }
    ]
}
 *
 * */
router.get('/show_parcels_list', common.parseQueryOptions, function(req, res, next) {

    var args = common.getArguments(req);
    var whereClause = '';
    var whereClauseValues = [];

    if (args.tenure_type) {
        whereClause = 'WHERE ' + common.createDynamicInArrayClause('tenure_type', 'text', args.tenure_type);
        whereClauseValues = args.tenure_type.split(',');
    }

    req.queryModifiers.sort_by = req.queryModifiers.sort_by || "time_created,id";
    req.queryModifiers.sort_dir = req.queryModifiers.sort_dir || "DESC";

    ctrlCommon.getAll("show_parcels_list", {queryModifiers: req.queryModifiers, outputFormat: 'GeoJSON', whereClause: whereClause, whereClauseValues: whereClauseValues})
        .then(function(result){
            res.status(200).json(result[0].response);
        })
        .catch(function(err){
            next(err);
        })
        .done();

});

/**
 * @api {get} /show_activity Activity - get all
 * @apiName show_activity_all
 * @apiGroup Custom Views
 * @apiDescription Get records from the show_activity database view
 *
 * @apiParam (Optional query string parameters) {String} [fields] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_by] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_dir=ASC] Options: ASC or DESC
 * @apiParam (Optional query string parameters) {Number} [limit] integer of records to return
 * @apiParam (Optional query string parameters) {Boolean} [returnGeometry=false] integer of records to return
 * @apiParam (Optional query string parameters) {Integer} [project_id] integer of project_id
 * 
 * @apiSuccess {Object} response A feature collection with zero to many features
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON geometry object
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {String} response.features.properties.activity_type activity type
 * @apiSuccess {String} response.features.properties.type type
 * @apiSuccess {Number} response.features.properties.id activity's id (could be parcel or relationship id)
 * @apiSuccess {Number} response.features.properties.name activity creator's name
 * @apiSuccess {Number} response.features.properties.id activity's id parcel id
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/activities
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *
 * {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": null,
      "properties": {
        "activity_type": "parcel",
        "id": 1,
        "type": "survey_grade_gps",
        "name": null,
        "parcel_id": null,
        "time_created": "2015-08-12T03:46:01.673153+00:00"
      }
    },
    {
      "type": "Feature",
      "geometry": null,
      "properties": {
        "activity_type": "parcel",
        "id": 2,
        "type": "survey_grade_gps",
        "name": null,
        "parcel_id": null,
        "time_created": "2015-08-12T03:46:01.673153+00:00"
      }
    }
  ]
}
 */
router.get('/show_activity', common.parseQueryOptions, function(req, res, next) {

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

    ctrlCommon.getAll("show_activity", options)
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});


/**
 * @api {get} /show_relationships Relationships - get all
 * @apiName show_relationships_all
 * @apiGroup Custom Views
 * @apiDescription Get records from the show_relationships database view
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
 * @apiSuccess {Number} response.features.properties.relationship_id relationship id
 * @apiSuccess {String} response.features.properties.relationship_type relationship type
 * @apiSuccess {String} response.features.properties.spatial_source spatial source
 * @apiSuccess {Number} response.features.properties.parcel_id relationship's parcel id
 * @apiSuccess {Number} response.features.properties.party_id relationship's party id
 * @apiSuccess {String} response.features.properties.first_name first name of creator
 * @apiSuccess {String} response.features.properties.last_name last_name of creator
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
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
      "geometry": {
        "type": "Point",
        "coordinates": [
          47.867583,
          -122.164306
        ]
      },
      "properties": {
        "relationship_id": 1,
        "relationship_type": "Own",
        "parcel_id": 1,
        "spatial_source": "survey_grade_gps",
        "party_id": 1,
        "first_name": "Daniel",
        "last_name": "Baah",
        "time_created": "2015-08-12T03:46:01.673153+00:00"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          47.670367,
          -122.387855
        ]
      },
      "properties": {
        "relationship_id": 2,
        "relationship_type": "Own",
        "parcel_id": 2,
        "spatial_source": "survey_grade_gps",
        "party_id": 2,
        "first_name": "Sarah",
        "last_name": "Bindman",
        "time_created": "2015-08-12T03:46:01.673153+00:00"
      }
    }
  ]
}
 */

router.get('/show_relationships', common.parseQueryOptions, function(req, res, next) {

    ctrlCommon.getAll("show_relationships", {queryModifiers: req.queryModifiers, outputFormat: 'GeoJSON'})
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});

/**
 * @api {get} /show_relationships/:id Relationships - get one
 * @apiName show_relationships_one
 * @apiGroup Custom Views
 * @apiDescription Get a record from the show_relationships database view
 * @apiParam {Number} id relationship's unique ID.
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
 * @apiSuccess {Number} response.features.properties.relationship_id relationship id
 * @apiSuccess {String} response.features.properties.relationship_type relationship type
 * @apiSuccess {String} response.features.properties.spatial_source spatial source
 * @apiSuccess {Number} response.features.properties.parcel_id relationship's parcel id
 * @apiSuccess {Number} response.features.properties.party_id relationship's party id
 * @apiSuccess {String} response.features.properties.first_name first name of creator
 * @apiSuccess {String} response.features.properties.last_name last_name of creator
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/relationships
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *
 *     {
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [
                  47.867583,
                  -122.164306
                ]
              },
              "properties": {
                "relationship_id": 1,
                "relationship_type": "Own",
                "parcel_id": 1,
                "spatial_source": "survey_grade_gps",
                "party_id": 1,
                "first_name": "Daniel",
                "last_name": "Baah",
                "time_created": "2015-08-12T03:46:01.673153+00:00"
              }
            }
          ]
        }
 */

router.get('/show_relationships/:id', common.parseQueryOptions, function(req, res, next) {

    ctrlCommon.getWithId('show_relationships', 'relationship_id', req.params.id, {queryModifiers: req.queryModifiers, outputFormat: 'GeoJSON'})
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});

/**
 * @api {get} /show_parcel_resources Parcel Resources - get all
 * @apiName GetParcelResources
 * @apiGroup Custom Views
 *
 * @apiDescription Get all parcel resources (from the resource_parcel table)
 *
 * @apiParam (Optional query string parameters) {String} [parcel_id] Options: Parcel id integer
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
 * @apiSuccess {Integer} response.features.properties.parcel_id resource parcel id
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
 *     curl -i http://localhost/show_parcel_resources
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
                "parcel_id": 2,
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

router.get('/show_parcel_resources', common.parseQueryOptions, function(req, res, next) {

    var whereClauseArr = [];
    var whereClauseValues = [];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    if(req.query.parcel_id) {
        whereClauseArr.push('parcel_id = $1');
        whereClauseValues.push(parseInt(req.query.parcel_id));
        options.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
        options.whereClauseValues = whereClauseValues;
    }

    ctrlCommon.getAll("show_parcel_resources", options)
        .then(function(result){
            res.status(200).json(result[0].response);
        })
        .catch(function(err){
            next(err);
        })
        .done();

});

/**
 * @api {get} /show_party_resources Party Resources - get all
 * @apiName GetPartyResources
 * @apiGroup Custom Views
 *
 * @apiDescription Get all party resources (from the resource_party table)
 *
 * @apiParam (Optional query string parameters) {String} [party_id] Options: Party id integer
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
 * @apiSuccess {Integer} response.features.properties.party_id resource party id
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
 *     curl -i http://localhost/show_party_resources
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
                "party_id": 2,
                "resource_id": 32,
                "type": null,
                "url": "http://www.cadasta.org/32/party",
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

router.get('/show_party_resources', common.parseQueryOptions, function(req, res, next) {

    var whereClauseArr = [];
    var whereClauseValues = [];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    if(req.query.party_id) {
        whereClauseArr.push('party_id = $1');
        whereClauseValues.push(parseInt(req.query.party_id));
        options.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
        options.whereClauseValues = whereClauseValues;
    }

    ctrlCommon.getAll("show_party_resources", options)
        .then(function(result){
            res.status(200).json(result[0].response);
        })
        .catch(function(err){
            next(err);
        })
        .done();

});

/**
 * @api {get} /show_relationship_resources Relationship Resources - get all
 * @apiName GetRelationshipResources
 * @apiGroup Custom Views
 *
 * @apiDescription Get all relationship resources (from the resource_relationship table)
 *
 * @apiParam (Optional query string parameters) {String} [relationship_id] Options: Parcel id integer
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
 * @apiSuccess {Integer} response.features.properties.relationship_id resource parcel id
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
 *     curl -i http://localhost/show_relationship_resources
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
                "relationship_id": 2,
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

router.get('/show_relationship_resources', common.parseQueryOptions, function(req, res, next) {

    var whereClauseArr = [];
    var whereClauseValues = [];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    if(req.query.relationship_id) {
        whereClauseArr.push('relationship_id = $1');
        whereClauseValues.push(parseInt(req.query.relationship_id));
        options.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
        options.whereClauseValues = whereClauseValues;
    }

    ctrlCommon.getAll("show_relationship_resources", options)
        .then(function(result){
            res.status(200).json(result[0].response);
        })
        .catch(function(err){
            next(err);
        })
        .done();

});


/**
 * @api {get} /project_overview/:id Project Overview - get one
 * @apiName Project Overview
 * @apiGroup Custom Views

 * @apiDescription Get activity,resources, project extent and parcel geometries for a single project

 * @apiParam {Number} id Project id number

 * @apiSuccess {Object} response A feature collection with one feature representing a project
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON of project extent
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {Number} response.features.properties.id project id
 * @apiSuccess {Number} response.features.properties.organization_id organization id
 * @apiSuccess {String} response.features.properties.title title
 * @apiSuccess {Number} response.features.properties.ckan_id ckan id
 * @apiSuccess {Boolean} response.features.properties.active active/archived flag
 * @apiSuccess {Boolean} response.features.properties.sys_delete delete flag
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_updated Time stamp of last update
 * @apiSuccess {Number} response.features.properties.created_by id of creator
 * @apiSuccess {Number} response.features.properties.updated_by id of updater
 * @apiSuccess {Object[]} response.features.properties.project_resources array of project resource objects
 * @apiSuccess {String} response.features.properties.project_resources.type "Feature"
 * @apiSuccess {Object} response.features.properties.project_resources.geometry always null
 * @apiSuccess {Object} response.features.properties.project_resources.properties GeoJSON feature's properties
 * @apiSuccess {Number} response.features.properties.project_resources.properties.id resource id
 * @apiSuccess {Number} response.features.properties.project_resources.properties.project_id project id
 * @apiSuccess {String} response.features.properties.project_resources.properties.url resource url
 * @apiSuccess {String} response.features.properties.project_resources.properties.type resource type
 * @apiSuccess {String} response.features.properties.project_resources.properties.description resource description
 * @apiSuccess {Boolean} response.features.properties.project_resources.properties.active active/archived flag
 * @apiSuccess {Boolean} response.features.properties.project_resources.properties.sys_delete delete flag
 * @apiSuccess {String} response.features.properties.project_resources.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.project_resources.properties.time_updated Time stamp of last update
 * @apiSuccess {Number} response.features.properties.project_resources.properties.created_by id of creator
 * @apiSuccess {Number} response.features.properties.project_resources.properties.updated_by id of updater
 * @apiSuccess {Object[]} response.features.properties.project_activity array of project activity objects
 * @apiSuccess {String} response.features.properties.project_activity.type "Feature"
 * @apiSuccess {Object} response.features.properties.project_activity.geometry always null
 * @apiSuccess {Object} response.features.properties.project_activity.properties GeoJSON feature's properties
 * @apiSuccess {String} response.features.properties.project_activity.properties.activity_type activity type
 * @apiSuccess {Number} response.features.properties.project_activity.properties.id activity id
 * @apiSuccess {String} response.features.properties.project_activity.properties.type type of activity
 * @apiSuccess {String} response.features.properties.project_activity.properties.name activity name
 * @apiSuccess {Number} response.features.properties.project_activity.properties.parcel_id parcel id
 * @apiSuccess {String} response.features.properties.project_activity.properties.time_created Time stamp of creation
 * @apiSuccess {Object[]} response.features.properties.parcels array of project parcel objects
 * @apiSuccess {String} response.features.properties.parcels.type "Feature"
 * @apiSuccess {Object} response.features.properties.parcels.geometry parcel geometry
 * @apiSuccess {Object} response.features.properties.parcels.properties GeoJSON parcel's properties
 * @apiSuccess {Number} response.features.properties.parcels.properties.id parcel id
 * @apiSuccess {Number} response.features.properties.parcels.properties.project_id project id
 * @apiSuccess {Number} response.features.properties.parcels.properties.spatial_source spatial source
 * @apiSuccess {String} response.features.properties.parcels.properties.user_id parcel creator user id
 * @apiSuccess {Number} response.features.properties.parcels.properties.area area of parcel
 * @apiSuccess {Number} response.features.properties.parcels.properties.length length of parcel
 * @apiSuccess {String} response.features.properties.parcels.properties.land_use parcel land use
 * @apiSuccess {Number} response.features.properties.parcels.properties.gov_pin government parcel id
 * @apiSuccess {Boolean} response.features.properties.parcels.properties.active active/archived flag
 * @apiSuccess {Boolean} response.features.properties.parcels.properties.sys_delete delete flag
 * @apiSuccess {String} response.features.properties.parcels.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.parcels.properties.time_updated Time stamp of last update
 * @apiSuccess {Number} response.features.properties.parcels.properties.created_by id of creator
 * @apiSuccess {Number} response.features.properties.parcels.properties.updated_by id of updater

 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/parcel_overview/1
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [
                                    -68.1512832641601,
                                    -16.4848144489816
                                ],
                                [
                                    -68.1435585021973,
                                    -16.5295818911947
                                ],
                                [
                                    -68.1191825866699,
                                    -16.5159223369972
                                ],
                                [
                                    -68.1524848937988,
                                    -16.4644023247451
                                ],
                                [
                                    -68.1512832641601,
                                    -16.4848144489816
                                ]
                            ]
                        ]
                    },
                    properties: {
                        id: 1,
                        organization_id: 1,
                        title: "Bolivia",
                        ckan_id: null,
                        active: true,
                        sys_delete: false,
                        time_created: "2015-09-16T15:14:31.46313-07:00",
                        time_updated: "2015-09-16T15:14:31.46313-07:00",
                        created_by: null,
                        updated_by: null,
                        project_resources: [
                            {
                                type: "Feature",
                                geometry: null,
                                properties: {
                                    id: 1,
                                    project_id: 1,
                                    url: "http://www.cadasta.org/2/parcel",
                                    type: "parcel",
                                    description: null,
                                    active: true,
                                    sys_delete: false,
                                    time_created: "2015-09-16T16:10:44.884044-07:00",
                                    time_updated: "2015-09-16T16:10:44.884044-07:00",
                                    created_by: null,
                                    updated_by: null
                                }
                            }
                        ],
                        project_activity: [
                            {
                                type: "Feature",
                                geometry: null,
                                properties: {
                                    activity_type: "parcel",
                                    id: 1,
                                    type: "survey_sketch",
                                    name: null,
                                    parcel_id: null,
                                    time_created: "2015-09-16T15:25:42.137404-07:00"
                                }
                            }
                        ],
                        parcels: [
                            {
                                type: "Feature",
                                geometry: {
                                    type: "Point",
                                    coordinates: [
                                        -73.724739,
                                        40.588342
                                    ]
                                },
                                properties: {
                                    id: 1,
                                    project_id: 1,
                                    spatial_source: 1,
                                    user_id: "11",
                                    area: null,
                                    length: null,
                                    land_use: null,
                                    gov_pin: null,
                                    active: true,
                                    sys_delete: false,
                                    time_created: "2015-09-16T15:25:42.137404-07:00",
                                    time_updated: "2015-09-16T15:25:42.137404-07:00",
                                    created_by: 11,
                                    updated_by: null
                                }
                            }
                        ]
                    }
                }
            ]
        }
 */


router.get('/project_overview/:id', common.parseQueryOptions, function(req, res, next) {

    var opts = {queryModifiers: {limit: 'LIMIT 10', project_id:req.params.id, sort_by: 'time_created', sort_dir: 'DESC'}, outputFormat: 'GeoJSON'};
    var geomopts = {queryModifiers: {returnGeometry: true, limit: 'LIMIT 10'}, outputFormat: 'GeoJSON'};

    Q.all([
        ctrlCommon.getWithId('show_project_extents', 'id', req.params.id, geomopts),
        ctrlCommon.getAll('resource', opts),
        ctrlCommon.getAll('show_activity', opts),
        ctrlCommon.getAll('parcel', geomopts)
    ])
        .then(function (results) {

            //Process results: Add parcel history and relationships to Parcel GeoJSON
            var geoJSON = results[0][0].response;

            // If Id return no parcel, message the user
            if (geoJSON.features.length === 0) {
                return res.status(200).json({message: "no parcel"});
            } else {
                // Add properties to parcel's geojson
                geoJSON.features[0].properties.project_resources = results[1][0].response.features;
                geoJSON.features[0].properties.project_activity = results[2][0].response.features;
                geoJSON.features[0].properties.parcels = results[3][0].response.features;

                res.status(200).json(geoJSON);

            }
            ;

            //llop through results[2][0].response.EACH -- add geom and prop to array
        })
        .catch(function (err) {
            next(err)
        })
        .done();

});


module.exports = router;
