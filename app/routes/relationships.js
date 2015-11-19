var express = require('express');
var router = express.Router();
var common = require('../common.js');
var ctrlCommon = require('../controllers/common.js');
var Q = require('q');
var pgb = require('../pg-binding.js');

/**
 * @api {get} /projects/relationships/:id/relationship_history Project relationships - Get history
 * @apiName GetRelationshipHistory
 * @apiGroup Projects
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
 * @api {get} /projects/relationships Project relationships - Get all
 * @apiName GetRelationships
 * @apiGroup Projects
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
 * @apiSuccess {String="freehold, long term leasehold, leasehold, customary rights, occupancy, tenancy, hunting/fishing/harvest rights, grazing rights, indigenous land rights, joint tenancy, tenancy in common, undivided co-ownership, easement, equitable servitude, mineral rights, water rights, concessionary rights, carbon rights"} response.features.properties.tenure_type Type of tenure
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
 * @api {get} /projects/:project_id/relationships/:id/resources Project relationships - Get resources
 * @apiName GetRelationshipResources
 * @apiGroup Projects
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

/**
 * @api {get} /projects/id:/relationships/relationships_list Project relationships - Get relationship list
 * @apiName GetRelationships
 * @apiGroup Projects
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
 * @apiSuccess {Object} response.features.geometry Relationships GeoJSON geometry object. If Null, Parcels GeoJSON geometry object
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {Integer} response.features.properties.id Relationship id
 * @apiSuccess {String="freehold, long term leasehold, leasehold, customary rights, occupancy, tenancy, hunting/fishing/harvest rights, grazing rights, indigenous land rights, joint tenancy, tenancy in common, undivided co-ownership, easement, equitable servitude, mineral rights, water rights, concessionary rights, carbon rights"} response.features.properties.tenure_type Type of tenure
 * @apiSuccess {Integer} response.features.properties.project_id Project id
 * @apiSuccess {Integer} response.features.properties.parcel_id Parcel id
 * @apiSuccess {Integer} response.features.properties.party_id Party id
 * @apiSuccess {String} response.features.properties.full_name Party full name
 * @apiSuccess {String} response.features.properties.group_name Party group name
 * @apiSuccess {String} response.features.properties.how_acquired Acquisition description
 * @apiSuccess {String} response.features.properties.acquired_date Acquisition date
 * @apiSuccess {Boolean} response.features.properties.validated Status of survey response validation
 * @apiSuccess {Boolean} response.features.properties.active Status of relationship
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_updated Time stamp of last update
 * @apiSuccess {Integer} response.features.properties.created_by id of creator
 * @apiSuccess {Integer} response.features.properties.updated_by id of updater
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/projects/1/relationships/relationships_list
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
                "tenure_type": "easement",
                "parcel_id": 1,
                "project_id": 1,
                "spatial_source": "digitized",
                "party_id": 1,
                "how_acquired":"Borrowed",
                "date_acquired:":"2010-05-25",
                "validated":false,
                "full_name": "Makkonen",
                "group_name": "Ontario ",
                "time_created": "2015-10-26T17:30:33.192933-07:00",
                "active": true,
                "time_updated": "2015-10-26T17:30:33.192933-07:00"
            }
        }
    ]
}
 */

router.get('/:project_id/relationships/relationships_list', common.parseQueryOptions, function(req, res, next) {

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

    ctrlCommon.getAll("show_relationships", options)
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});

/**
 * @api {get} projects/:id/relationships/:relationship_id Project relationship - Get one details
 * @apiName GetProjectRelationship
 * @apiGroup Relationships
 * @apiDescription Get a project specific relationship (from the relationship table)
 *
 * @apiParam {Number} id project's unique ID.
 * @apiParam {Number} relationship_id relationship's unique ID
 * .
 * @apiSuccess {Object} response A feature collection with zero to many features
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry Relationships GeoJSON geometry object. If Null, Parcels GeoJSON geometry object
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {Integer} response.features.properties.id Relationship id
 * @apiSuccess {String="freehold, long term leasehold, leasehold, customary rights, occupancy, tenancy, hunting/fishing/harvest rights, grazing rights, indigenous land rights, joint tenancy, tenancy in common, undivided co-ownership, easement, equitable servitude, mineral rights, water rights, concessionary rights, carbon rights"} response.features.properties.tenure_type Type of tenure
 * @apiSuccess {Integer} response.features.properties.project_id Project id
 * @apiSuccess {Integer} response.features.properties.parcel_id Parcel id
 * @apiSuccess {Integer} response.features.properties.party_id Party id
 * @apiSuccess {String} response.features.properties.full_name Party full name
 * @apiSuccess {String} response.features.properties.group_name Party group name
 * @apiSuccess {String} response.features.properties.how_acquired Acquisition description
 * @apiSuccess {String} response.features.properties.acquired_date Acquisition date
 * @apiSuccess {Boolean} response.features.properties.active Status of relationship
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_updated Time stamp of last update
 * @apiSuccess {Integer} response.features.properties.created_by id of creator
 * @apiSuccess {Integer} response.features.properties.updated_by id of updater
 *
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/projects/1/relationships/1/details
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": null,
            "properties": {
                "id": 1,
                "tenure_type": "easement",
                "how_acquired": "inheritance",
                "acquired_date": "2010-05-25",
                "parcel_id": 1,
                "project_id": 1,
                "spatial_source": "digitized",
                "party_id": 1,
                "full_name": "Makkonen",
                "group_name": "Ontario ",
                "time_created": "2015-10-27T13:09:05.374558-07:00",
                "active": true,
                "time_updated": "2015-10-27T13:09:05.374558-07:00"
            }
        }
    ]
}
 */
router.get('/:id/relationships/:relationship_id/details', common.parseQueryOptions, function(req, res, next) {

    var whereClauseArr = ['project_id = $1', 'id = $2'];
    var whereClauseValues = [req.params.id, req.params.relationship_id];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: req.query.outputFormat || 'GeoJSON'
    };

    if(whereClauseArr.length > 0) {
        options.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
        options.whereClauseValues = whereClauseValues;
    }

    var historyOptions =  {
        queryModifiers: {sort_by:'version', sort_dir:'DESC'},
        outputFormat: req.query.outputFormat || 'GeoJSON'
    };

    if(whereClauseArr.length > 0) {
        historyOptions.whereClause = 'WHERE ' + ['project_id = $1', 'relationship_id = $2'].join(' AND ');
        historyOptions.whereClauseValues = [req.params.id, req.params.relationship_id];
    }

    Q.all([
        ctrlCommon.getAll('show_relationships',  options),
        ctrlCommon.getAll('show_relationship_history',  historyOptions)
    ])
        .then(function (results) {

            //Process results: Add parcel history and relationships to Parcel GeoJSON
            var geoJSON = results[0][0].response;

            // Add properties to parties geojson
            geoJSON.features[0].properties.relationship_history = results[1][0].response.features;

            res.status(200).json(geoJSON);
        })
        .catch(function(err){
            next(err)
        })
        .done();

});

// CREATE A RELATIONSHIP RECORD
/**
 * @api {post} /projects/:id/relationships Project relationships- Create one
 * @apiName PostRelationships
 * @apiGroup Projects
 * @apiDescription Create a project relationship
 *
 * @apiParam {Integer} parcel_id Cadasta parcel id
 * @apiParam {String} ckan_id The id of the CKAN user
 * @apiParam {Integer} party_id Cadasta party id
 * @apiParam {Integer} geojson GeoJSON geometry object
 * @apiParam {String="freehold, long term leasehold, leasehold, customary rights, occupancy, tenancy, hunting/fishing/harvest rights, grazing rights, indigenous land rights, joint tenancy, tenancy in common, undivided co-ownership, easement, equitable servitude, mineral rights, water rights, concessionary rights, carbon rights"} tenure_type Cadasta relationship tenure type
 * @apiParam {Date} acquired_data Date tenure was acquired
 * @apiParam {String} how_acquired Description of how tenure was acquired
 * @apiParam {String} how_acquired Relationship description
 *
 * @apiSuccess {Object} cadasta_relationship_id The cadasta database id of the created relationship

 *
 * @apiExample {curl} Example usage:
 *     curl -H "Content-Type: application/json" -X POST -d {"parcel_id": 10,"ckan_user_id": null,"party_id": 8,"geojson": null,"tenure_type":"leasehold","acquired_date":"10/31/2015","how_acquired":"borrowed","description":"gift from grandfather"} http://localhost/projects/1/relationships
 *
 * @api {post} /projects/:id/relationships
 * @apiParamExample {application/json} Request-Example:
 * {
    "parcel_id": 10,
    "ckan_user_id": null,
    "party_id": 8,
    "geojson": null,
    "tenure_type":"easement",
    "acquired_date":"10/31/2015",
    "how_acquired":"borrowed",
    "description":"gift from grandfather"
}
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "cadasta_relationship_id": 1
        }
 */
router.post('/:project_id/relationships', function(req, res, next) {

    if(req.body.parcel_id === undefined
        || req.body.party_id === undefined || req.body.tenure_type === undefined) {

        return next(new Error('Missing POST parameters.'))
    }

    var geojson = ctrlCommon.sanitize(req.body.geojson);

    var sql = "SELECT * FROM cd_create_relationship($1,$2,$3,$4,$5,$6,$7,$8,$9)";

    var paramValues =  [req.params.project_id,req.body.parcel_id, req.body.ckan_user_id,
        req.body.party_id, geojson, req.body.tenure_type, req.body.acquired_date, req.body.how_acquired, req.body.description];

    pgb.queryDeferred(sql,{paramValues:paramValues})
        .then(function(response){
            res.status(200).json({cadasta_relationship_id: response[0].cd_create_relationship})
        })
        .catch(function(err){
            res.status(400).json({message:err.message, error:err});
        })
        .done();

});


/**
 * @api {post} /projects/:id/relationships/:relationship_id Project Relationship - Update One
 * @apiName UpdateRelationship
 * @apiGroup Projects
 * @apiDescription Update a Relationship
 *
 *
 * @apiParam {Integer} id Cadasta project id
 * @apiParam {Integer} relationship_id Cadasta relationship id
 *
 * @apiParam (POST parameters) {String} [geojson] GeoJSON geometry object
 * @apiParam (POST parameters) {String="freehold, long term leasehold, leasehold, customary rights, occupancy, tenancy, hunting/fishing/harvest rights, grazing rights, indigenous land rights, joint tenancy, tenancy in common, undivided co-ownership, easement, equitable servitude, mineral rights, water rights, concessionary rights, carbon rights"} [tenure_type] Cadasta relationship tenure type
 * @apiParam (POST parameters) {Date} [acquired_date] Date of tenure acquisition
 * @apiParam (POST parameters) {String} [how_acquired] How tenure was acquired
 * @apiParam (POST parameters) {String} [description] Description of tenure history
 *
 * @apiSuccess {Object} cadasta_relationship_history_id The Cadasta database id of the created relationship history

 *
 * @apiExample {curl} Example usage:
 *     curl -H "Content-Type: application/json" -X PATCH -d {"geojson":null,"tenure_type":"easement","acquired_date":"11/1/2015","how_acquired":"informally leased from government","description":"new description"} http://localhost/projects/1/relationships/4
 *
 * @api {patch} /projects/:id/relationships/:relationship_id
 *
 * @apiParamExample {application/json} Request-Example:
 *
 *{
    "geojson":null,
    "tenure_type":"easement",
    "acquired_date":"11/1/2015",
    "how_acquired":"informally leased from government",
    "description":"new description"
}
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "status":"OKAY",
            "cadasta_relationship_history_id": 1
        }
 */
router.patch('/:id/relationships/:relationship_id', function(req, res, next) {

    if(req.params.id === undefined ||req.params.relationship_id === undefined) {
        return next(new Error('Missing required POST parameters.'))
    }

    var geojson = ctrlCommon.sanitize(req.body.geojson);

    var sql = 'SELECT * FROM cd_update_relationship ($1, $2, $3, $4, $5, $6, $7, $8, $9)';

    var paramValues = [req.params.id, req.params.relationship_id, req.body.party_id, req.body.parcel_id,geojson, req.body.tenure_type, req.body.acquired_date, req.body.how_acquired, req.body.description];

    pgb.queryDeferred(sql, {paramValues:paramValues})
        .then(function(response){
            res.status(200).json({status:"OKAY", cadasta_relationship_history_id: response[0].cd_update_relationship})
        })
        .catch(function(err){
            res.status(400).json({status:"ERROR", message:err.message})
        })
        .done();

});


module.exports = router;