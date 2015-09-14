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

    ctrlCommon.getAll("show_activity", {queryModifiers: req.queryModifiers, outputFormat: 'GeoJSON'})
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


module.exports = router;
