var express = require('express');
var router = express.Router();
var common = require('../common.js');
var ctrlCommon = require('../controllers/common.js');
var Q = require('q');

/**
 * @api {get} /parcels Get all
 * @apiName GetParcels
 * @apiGroup Parcels
 *
 * @apiDescription Get all parcels (from the parcels table)
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
 * @apiSuccess {String} response.features.properties.id parcel id
 * @apiSuccess {String} response.features.properties.project_id project id
 * @apiSuccess {Number} response.features.properties.spatial_source integer code for the spatial source of the parcel
 * @apiSuccess {String} response.features.properties.user_id user id that created parcel
 * @apiSuccess {Number} response.features.properties.area Area (meters) of Polygon
 * @apiSuccess {Number} response.features.properties.length Length (meters) of LineString
 * @apiSuccess {String} response.features.properties.land_use Options: Commercial, Real Estate
 * @apiSuccess {String} response.features.properties.gov_pin government pin
 * @apiSuccess {Boolean} response.features.properties.active organization status
 * @apiSuccess {Boolean} response.features.properties.sys_delete db status
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_updated Time stamp of last update
 * @apiSuccess {String} response.features.properties.created_by user id of creator
 * @apiSuccess {String} response.features.properties.updated_by user if of updater
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/parcels
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "type": "FeatureCollection",
        "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -105.228338241577,
                            21.1714137482368
                        ],
                        [
                            -105.229024887085,
                            21.1694127979643
                        ],
                        ...
                        ...
                        [
                            -105.228338241577,
                            21.1714137482368
                        ]
                    ]
                ]
            },
            "properties": {
                "id": 1,
                "spatial_source": 4,
                "user_id": "1",
                "area": null,
                "land_use": null,
                "gov_pin": null,
                "active": true,
                "time_created": "2015-08-06T15:41:26.440037-07:00",
                "time_updated": null,
                "created_by": 1,
                "updated_by": null
            }
        }
    ]
}
 */

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

    ctrlCommon.getAll("parcel", options)
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});

/**
 * @api {get} /parcels/:id Get one
 * @apiName GetParcel
 * @apiGroup Parcels
 * @apiDescription Get a parcel (from the parcels table)
 *
 * @apiParam {Number} id parcel's unique ID.
 *
 * @apiParam (Optional query string parameters) {String} [fields] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_by] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_dir=ASC] Options: ASC or DESC
 * @apiParam (Optional query string parameters) {Number} [limit] integer of records to return
 * @apiParam (Optional query string parameters) {Boolean} [returnGeometry=false] integer of records to return
 *
 * @apiSuccess {Object} response A feature collection with one parcel feature
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON geometry object
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {String} response.features.properties.id parcel id
 * @apiSuccess {Number} response.features.properties.spatial_source integer code for the spatial source of the parcel
 * @apiSuccess {String} response.features.properties.user_id user id that created parcel
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_created Time stamp of last update
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/parcels/1
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "type": "FeatureCollection",
        "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -105.228338241577,
                            21.1714137482368
                        ],
                        [
                            -105.229024887085,
                            21.1694127979643
                        ],
                        ...
                        ...
                        [
                            -105.228338241577,
                            21.1714137482368
                        ]
                    ]
                ]
            },
            "properties": {
                "id": 1,
                "spatial_source": 4,
                "user_id": "1",
                "area": null,
                "land_use": null,
                "gov_pin": null,
                "active": true,
                "time_created": "2015-08-06T15:41:26.440037-07:00",
                "time_updated": null,
                "created_by": 1,
                "updated_by": null
            }
        }
    ]
}
 */

router.get('/:id', common.parseQueryOptions, function(req, res, next) {

    ctrlCommon.getWithId('parcel', 'id', req.params.id, {queryModifiers: req.queryModifiers, outputFormat: 'GeoJSON'})
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});


/**
 * @api {get} /parcels/:id/history Get parcel history
 * @apiName GetParcelHistory
 * @apiGroup Parcels
 *
 * @apiDescription Get a parcel's parcel history (from the parcel_history table)
 *
 * @apiParam {Number} id parcel's unique ID.
 *
 * @apiParam (Optional query string parameters) {String} [fields] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_by] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_dir=ASC] Options: ASC or DESC
 * @apiParam (Optional query string parameters) {Number} [limit] integer of records to return
 *
 * @apiSuccess {Object} response A feature collection with one feature per parcel history record
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON geometry object (always null here)
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {Number} response.features.properties.id history id
 * @apiSuccess {Number} response.features.properties.parcel_id parcel id
 * @apiSuccess {Number} response.features.properties.origin_id origin id
 * @apiSuccess {Number} response.features.properties.parent_id parent id
 * @apiSuccess {String} response.features.properties.version version
 * @apiSuccess {String} response.features.properties.description description
 * @apiSuccess {String} response.features.properties.date_modified YYYY-MM-DD of last update
 * @apiSuccess {Boolean} response.features.properties.active active/archived flag
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_updated Time stamp of last update
 * @apiSuccess {Number} response.features.properties.created_by id of creator
 * @apiSuccess {Number} response.features.properties.updated_by id of updater
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/parcels/1/history
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
                "parcel_id": 1,
                "origin_id": 1,
                "parent_id": null,
                "version": 1,
                "description": "new description",
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
router.get('/:id/history', common.parseQueryOptions, function(req, res, next) {

    req.queryModifiers.returnGeometry = false;

    ctrlCommon.getWithId('parcel_history', 'parcel_id', req.params.id, {queryModifiers: req.queryModifiers, outputFormat: 'GeoJSON'})
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});

/**
 * @api {get} /parcels/:id/show_relationship_history Get parcel relationship history
 * @apiName GetParcelRelationshipHistory
 * @apiGroup Parcels
 * @apiDescription Get a parcel's relationship history (from the show_relationship_history view)
 * @apiParam {Number} id parcel's unique ID.
 *
 * @apiParam (Optional query string parameters) {String} [fields] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_by] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_dir=ASC] Options: ASC or DESC
 * @apiParam (Optional query string parameters) {Number} [limit] integer of records to return
 *
 * @apiSuccess {Object} response A feature collection with one feature per parcel history record
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON geometry object (always null here)
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {Number} response.features.properties.relationship_id relationship id
 * @apiSuccess {Number} response.features.properties.origin_id origin id
 * @apiSuccess {String} response.features.properties.version version
 * @apiSuccess {Number} response.features.properties.parent_id parent id
 * @apiSuccess {Number} response.features.properties.parcel_id parcel id
 * @apiSuccess {Number} response.features.properties.expiration_date expiration_date
 * @apiSuccess {String} response.features.properties.description description
 * @apiSuccess {String} response.features.properties.date_modified YYYY-MM-DD of last update
 * @apiSuccess {Boolean} response.features.properties.active active/archived flag
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_updated Time stamp of last update
 * @apiSuccess {Number} response.features.properties.created_by id of creator
 * @apiSuccess {Number} response.features.properties.updated_by id of updater
 * @apiSuccess {String} response.features.properties.relationship_type relationship type
 * @apiSuccess {String} response.features.properties.spatial_source spatial source
 * @apiSuccess {String} response.features.properties.first_name first name of creator
 * @apiSuccess {String} response.features.properties.last_name last_name of creator
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/parcels/:id/show_relationship_history
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
                "origin_id": 1,
                "version": 1,
                "parent_id": null,
                "parcel_id": 1,
                "expiration_date": null,
                "description": "History",
                "date_modified": "2015-09-02",
                "active": true,
                "time_created": "2015-09-02T18:09:15.057843+00:00",
                "time_updated": "2015-09-02T18:09:15.057843+00:00",
                "created_by": 11,
                "updated_by": null,
                "relationship_type": "own",
                "spatial_source": "survey_sketch",
                "party_id": 1,
                "first_name": "Thurmond",
                "last_name": "Thomas"
              }
            }
          ]
        }
 */
router.get('/:id/show_relationship_history', common.parseQueryOptions, function(req, res, next) {

    // harvest endpoint specific URI query params
    var activeFilter = req.query.active || null;
    var typeFilters = req.query.relationship_type || null;

    var whereClauseArr = [];
    var whereClauseValues = [];

    //  Begin building composite, parameterized where clause;  this endpoint will always have parcel_id filter
    whereClauseArr.push('parcel_id = $1');
    whereClauseValues.push(req.params.id);

    // If any "relationship_type" filters submitted, add them to composite parameterized where clause
    if (typeFilters) {
        whereClauseArr.push(common.createDynamicInClause('relationship_type', typeFilters, whereClauseValues.length));
        typeFilters.split(',').forEach(function(val){ whereClauseValues.push(val)});
    }

    // If "active" filter submitted, add it to composite parameterized where clause
    if (activeFilter) {
        whereClauseArr.push('active = $' + (whereClauseValues.length + 1))
        whereClauseValues.push(activeFilter);
    }

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON',
        whereClause: 'WHERE ' + whereClauseArr.join(' AND '),
        whereClauseValues: whereClauseValues
    };

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
 * @api {get} /parcels/:id/details Get parcel details
 * @apiName GetParcelDetails
 * @apiGroup Parcels
 * @apiDescription Get all details for a parcel: parcel attributes, parcel history (most recent 10), relationships (most recent 10)
 * @apiParam {Number} id parcel's unique ID.
 *
 *
 * @apiSuccess {Object} response A feature collection with one feature representing a parcel
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON geometry object (always null here)
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {Number} response.features.properties.id history id
 * @apiSuccess {Number} response.features.properties.parcel_id parcel id
 * @apiSuccess {Number} response.features.properties.origin_id origin id
 * @apiSuccess {Number} response.features.properties.parent_id parent id
 * @apiSuccess {String} response.features.properties.version version
 * @apiSuccess {String} response.features.properties.description description
 * @apiSuccess {String} response.features.properties.date_modified YYYY-MM-DD of last update
 * @apiSuccess {Boolean} response.features.properties.active active/archived flag
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_updated Time stamp of last update
 * @apiSuccess {Number} response.features.properties.created_by id of creator
 * @apiSuccess {Number} response.features.properties.updated_by id of updater
 * @apiSuccess {Array} response.features.properties.parcel_history
 * @apiSuccess {Number} response.features.properties.parcel_history.id history id
 * @apiSuccess {Number} response.features.properties.parcel_history.parcel_id parcel id
 * @apiSuccess {Number} response.features.properties.parcel_history.origin_id origin id
 * @apiSuccess {Number} response.features.properties.parcel_history.parent_id parent id
 * @apiSuccess {String} response.features.properties.parcel_history.version version
 * @apiSuccess {String} response.features.properties.parcel_history.description description
 * @apiSuccess {String} response.features.properties.parcel_history.date_modified YYYY-MM-DD of last update
 * @apiSuccess {Boolean} response.features.properties.parcel_history.active active/archived flag
 * @apiSuccess {String} response.features.properties.parcel_history.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.parcel_history.time_updated Time stamp of last update
 * @apiSuccess {Number} response.features.properties.parcel_history.created_by id of creator
 * @apiSuccess {Number} response.features.properties.parcel_history.updated_by id of updater
 * @apiSuccess {Array} response.features.properties.relationships
 * @apiSuccess {Number} response.features.properties.relationships.id
 * @apiSuccess {Number} response.features.properties.relationships.parcel_id
 * @apiSuccess {Number} response.features.properties.relationships.party_id
 * @apiSuccess {Number} response.features.properties.relationships.geom_id
 * @apiSuccess {Number} response.features.properties.relationships.tenure_type
 * @apiSuccess {Number} response.features.properties.relationships.acquired_date
 * @apiSuccess {Number} response.features.properties.relationships.how_acquired
 * @apiSuccess {Number} response.features.properties.relationships.active
 * @apiSuccess {Number} response.features.properties.relationships.time_created
 * @apiSuccess {Number} response.features.properties.relationships.time_updated
 * @apiSuccess {Number} response.features.properties.relationships.created_by
 * @apiSuccess {Number} response.features.properties.relationships.updated_by
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/parcels/1/details
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
                  -73.724739,
                  40.588342
                ]
              },
              "properties": {
                "id": 1,
                "spatial_source": 1,
                "user_id": "11",
                "area": null,
                "land_use": null,
                "gov_pin": null,
                "active": true,
                "sys_delete": false,
                "time_created": "2015-09-01T09:53:16.466337-07:00",
                "time_updated": null,
                "created_by": 11,
                "updated_by": null,
                "parcel_history": [
                  {
                    "id": 1,
                    "parcel_id": 1,
                    "origin_id": 1,
                    "parent_id": null,
                    "version": 1,
                    "description": "new description",
                    "date_modified": "2015-09-01T07:00:00.000Z",
                    "active": true,
                    "time_created": "2015-09-01T16:53:16.466Z",
                    "time_updated": null,
                    "created_by": 11,
                    "updated_by": null
                  }
                ],
                "relationships": [
                  {
                    "id": 1,
                    "parcel_id": 1,
                    "party_id": 1,
                    "geom_id": null,
                    "tenure_type": 1,
                    "acquired_date": null,
                    "how_acquired": null,
                    "active": true,
                    "sys_delete": false,
                    "time_created": "2015-09-01T16:53:16.466Z",
                    "time_updated": null,
                    "created_by": 11,
                    "updated_by": null
                  }
                ]
              }
            }
          ]
        }
 */
router.get('/:id/details', common.parseQueryOptions, function(req, res, next) {

    Q.all([
        ctrlCommon.getWithId('parcel', 'id', req.params.id, {queryModifiers: {returnGeometry: true}, outputFormat: "GeoJSON"}),
        ctrlCommon.getWithId('parcel_history', 'parcel_id', req.params.id, {queryModifiers: {limit: 'LIMIT 10', sort_by: 'time_updated', sort_dir: 'DESC'}}),
        ctrlCommon.getWithId('show_relationships', 'parcel_id', req.params.id, {queryModifiers: {limit: 'LIMIT 10', sort_by: 'time_created', sort_dir: 'DESC'}})
    ])
        .then(function (results) {

            //Process results: Add parcel history and relationships to Parcel GeoJSON
            var geoJSON = results[0][0].response;

            // If Id return no parcel, message the user
            if(geoJSON.features.length === 0) {
                return res.status(200).json({message: "no parcel"});
            }

            // Add properties to parcel's geojson
            geoJSON.features[0].properties.parcel_history = results[1];
            geoJSON.features[0].properties.relationships = results[2];

            res.status(200).json(geoJSON);
        })
        .catch(function(err){
            next(err)
        })
        .done();

});

/**
 *
 * @api {get} /parcels/:id/resources Get parcel resources
 * @apiName GetParcelResources
 * @apiGroup Parcels
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
 *     curl -i http://localhost/parcels/1/resources
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
                "parcel_id": 1,
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

router.get('/:id/resources', common.parseQueryOptions, function(req, res, next) {

    var whereClauseArr = [];
    var whereClauseValues = [];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    whereClauseArr.push('parcel_id = $1');
    whereClauseValues.push(req.params.id);

    options.whereClause ='WHERE ' + whereClauseArr.join(' AND ');
    options.whereClauseValues = whereClauseValues;

    ctrlCommon.getAll("show_parcel_resources", options)
        .then(function(result){
            res.status(200).json(result[0].response);
        })
        .catch(function(err){
            next(err);
        })
        .done();

});


module.exports = router;