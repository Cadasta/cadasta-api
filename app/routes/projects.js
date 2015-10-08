var express = require('express');
var router = express.Router();
var common = require('../common.js');
var settings = require('../settings/settings.js');
var ctrlCommon = require('../controllers/common.js');
var pgb = require('../pg-binding.js');
var errors = require('../errors');

var Q = require('q');

/**
 * @api {get} /projects Get all
 * @apiName GetProjects
 * @apiGroup Projects
 * @apiDescription Get all projects (from the project table)
 *
 * @apiParam (Optional query string parameters) {String} [ckan_id] CKAN project id of the Cadasta DB project record
 * @apiParam (Optional query string parameters) {String} [fields] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_by] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_dir=ASC] Options: ASC or DESC
 * @apiParam (Optional query string parameters) {Number} [limit] integer of records to return
 * @apiParam (Optional query string parameters) {Boolean} [returnGeometry=false] integer of records to return
 *
 * @apiSuccess {Object} response A feature collection with one project feature
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON geometry object
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {String} response.features.properties.id project id
 * @apiSuccess {Number} response.features.properties.organization_id organization id
 * @apiSuccess {String} response.features.properties.title project title
 * @apiSuccess {String} response.features.properties.ckan_id unique CKAN project identifier
 * @apiSuccess {Boolean} response.features.properties.active project status
 * @apiSuccess {Boolean} response.features.properties.sys_delete db status
 * @apiSuccess {String} response.features.properties.user_id user id that created project
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_created Time stamp of last update
 * @apiSuccess {String} response.features.properties.created_by user id of creator
 * @apiSuccess {String} response.features.properties.updated_by user if of updater
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/projects
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

    var whereClauseArr = [];
    var whereClauseValues = [];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: req.query.outputFormat || 'GeoJSON'
    };

    if(req.query.organization_id) {
        whereClauseValues.push(parseInt(req.query.organization_id));
        whereClauseArr.push('organization_id = $' + whereClauseValues.length);
    }

    if(req.query.ckan_id) {
        whereClauseValues.push(req.query.ckan_id);
        whereClauseArr.push('ckan_id = $' + whereClauseValues.length);
    }

    if(whereClauseArr.length > 0) {
        options.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
        options.whereClauseValues = whereClauseValues;
    }

    ctrlCommon.getAll("show_project_extents", options)
        .then(function(result){

            var result = result.length > 0 ? result[0].response || result : [];

            res.status(200).json(result);
        })
        .catch(function(err){
            next(err);
        })
        .done();

});

/**
 * @api {get} /projects/:id Get one
 * @apiName GetProject
 * @apiGroup Projects
 * @apiDescription Get a project (from the project table)
 *
 * @apiParam {Number} id project's unique ID.
 *
 * @apiParam (Optional query string parameters) {String} [fields] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_by] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_dir=ASC] Options: ASC or DESC
 * @apiParam (Optional query string parameters) {Number} [limit] integer of records to return
 * @apiParam (Optional query string parameters) {Boolean} [returnGeometry=false] integer of records to return
 *
 * @apiSuccess {Object} response A feature collection with one project feature
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON geometry object
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {String} response.features.properties.id project id
 * @apiSuccess {Number} response.features.properties.organization_id organization id
 * @apiSuccess {String} response.features.properties.title project title
 * @apiSuccess {String} response.features.properties.ckan_id unique CKAN project identifier
 * @apiSuccess {Boolean} response.features.properties.active project status
 * @apiSuccess {Boolean} response.features.properties.sys_delete db status
 * @apiSuccess {String} response.features.properties.user_id user id that created project
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_created Time stamp of last update
 * @apiSuccess {String} response.features.properties.created_by user id of creator
 * @apiSuccess {String} response.features.properties.updated_by user if of updater
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/projects/1
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

    ctrlCommon.getWithId('show_project_extents', 'id', req.params.id, options)
        .then(function(result){
            res.status(200).json(result[0].response);
        })
        .catch(function(err){
            next(err);
        })
        .done();

});

// CREATE A PROJECT RECORD
/**
 * @api {post} /projects Create one
 * @apiName PostProjects
 * @apiGroup Projects
 * @apiDescription Create a project
 *
 * @apiParam {Integer} cadasta_organization_id The cadasta id of the project's "parent"
 * @apiParam {String} ckan_id The id of the project in the CKAN application database
 * @apiParam {String} ckan_title The title of the project in the CKAN application database
 *
 * @apiSuccess {Object} cadasta_project_id The cadasta database id of the created project

 *
 * @apiExample {curl} Example usage:
 *     curl -H "Content-Type: application/json" -X POST -d '{"cadasta_organization_id", "ckan_id":"my-org","ckan_title":"My Org"}' http://localhost/projects
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "cadasta_project_id": 1
        }
 */
router.post('', function(req, res, next) {

    var cadasta_organization_id = req.body.cadasta_organization_id;
    var ckan_id = req.body.ckan_id;
    var ckan_title = req.body.ckan_title;

    if(cadasta_organization_id === undefined || ckan_id === undefined || ckan_title === undefined) {
        return next(new Error('Missing POST parameters.'))
    }

    var sql = "SELECT * FROM cd_create_project($1,$2,$3)";

    pgb.queryDeferred(sql,{paramValues: [cadasta_organization_id, ckan_id, ckan_title]})
        .then(function(response){
            res.status(200).json({cadasta_project_id: response[0]})
        })
        .catch(function(err){
            next(err);
        })
        .done();

});

//Get a project overview
/**
 * @api {get} /projects/:id/overview Project Overview - get one
 * @apiName Project Overview
 * @apiGroup Projects

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
 *     curl -i http://localhost/projects/1/overview
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
router.get('/:id/overview', common.parseQueryOptions, function(req, res, next) {

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

// Get project parcel list
/**
 * @api {get} /projects/:id/parcels_list Project parcel List - get all
 * @apiName project_parcel_list
 * @apiGroup Projects
 * @apiDescription Get records from the show_parcels_list database view with a specific project id
 *
 * @apiParam {Number} id Project id number
 *
 * @apiParam (Optional query string parameters) {String} [tenure_type] Options: own, lease, occupy, informal occupy
 * @apiParam (Optional query string parameters) {String} [sort_dir=ASC] Options: ASC or DESC
 * @apiParam (Optional query string parameters) {Number} [limit] integer of records to return
 * @apiParam (Optional query string parameters) {Boolean} [returnGeometry=false] integer of records to return

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
 *     curl -i http://localhost/show_parcels_list
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
router.get('/:id/parcels_list', common.parseQueryOptions, function(req, res, next) {

    req.queryModifiers.sort_by = req.queryModifiers.sort_by || "time_created,id";
    req.queryModifiers.sort_dir = req.queryModifiers.sort_dir || "DESC";

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    var whereClauseArr = ['project_id = $1'];
    var whereClauseValues = [req.params.id];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: req.query.outputFormat || 'GeoJSON'
    };

    if(req.query.tenure_type) {
        whereClauseValues = whereClauseValues.concat(req.query.tenure_type.split(','));
        whereClauseArr.push(common.createDynamicInArrayClause('tenure_type', 'text', req.query.tenure_type, whereClauseArr.length));
    }

    if(whereClauseArr.length > 0) {
        options.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
        options.whereClauseValues = whereClauseValues;
    }


    ctrlCommon.getAll('show_parcels_list', options)
        .then(function(result){
            res.status(200).json(result[0].response);
        })
        .catch(function(err){
            next(err);
        })
        .done();

});

// Get project parcel
/**
 * @api {get} projects/:id/parcels/:parcel_id Project parcel - Get one
 * @apiName GetProjectParcel
 * @apiGroup Projects
 * @apiDescription Get a project specific parcel (from the parcels table)
 *
 * @apiParam {Number} id project's unique ID.
 * @apiParam {Number} parcel_id parcel's unique ID.
 * *
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
 *     curl -i http://localhost/projects/1/parcels/1
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
router.get('/:id/parcels/:parcel_id', common.parseQueryOptions, function(req, res, next) {

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    var whereClauseArr = ['project_id = $1', 'id = $2'];
    var whereClauseValues = [req.params.id, req.params.parcel_id];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: req.query.outputFormat || 'GeoJSON'
    };

    if(whereClauseArr.length > 0) {
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
 * @api {get} projects/:id/parcels/:id/history Project parcel relationship history
 * @apiName GetProjectParcelHistory
 * @apiGroup Projects
 *
 * @apiDescription Get a project parcel's parcel history (from the parcel_history table)
 *
 * @apiParam {Number} id project's unique ID.
 * @apiParam {Number} parcel_id parcel's unique ID.
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
 *     curl -i http://localhost/projects/1/parcels/1/history
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
router.get('/:id/parcels/:parcel_id/history', common.parseQueryOptions, function(req, res, next) {

    req.queryModifiers.returnGeometry = false;

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    var whereClauseArr = ['project_id = $1', 'parcel_id = $2'];
    var whereClauseValues = [req.params.id, req.params.parcel_id];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: req.query.outputFormat || 'GeoJSON'
    };

    if(whereClauseArr.length > 0) {
        options.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
        options.whereClauseValues = whereClauseValues;
    }

    ctrlCommon.getWithId('show_parcel_history', 'parcel_id', req.params.id, {queryModifiers: req.queryModifiers, outputFormat: 'GeoJSON'})
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});

/**
 * @api {get} /projects/:id/parcels/:parcel_id/show_relationship_history Get Project parcel relationship history
 * @apiName GetProjectParcelRelationshipHistory
 * @apiGroup Projects
 * @apiDescription Get a project parcel's relationship history (from the show_relationship_history view)
 * @apiParam {Number} id project's unique ID.
 * @apiParam {Number} parcel_id parcel's unique ID.
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
 *     curl -i http://localhost/projects/1/parcels/1/show_relationship_history
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
router.get('/:id/parcels/:parcel_id/show_relationship_history', common.parseQueryOptions, function(req, res, next) {

    // harvest endpoint specific URI query params
    var activeFilter = req.query.active || null;
    var typeFilters = req.query.relationship_type || null;

    // No need to return geometry
    req.queryModifiers.returnGeometry = false;

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    // Where clause needs to limite by project and parcel ids
    var whereClauseArr = ['project_id = $1', 'parcel_id = $2'];
    var whereClauseValues = [req.params.id, req.params.parcel_id];

    // If any "relationship_type" filters submitted, add them to composite parameterized where clause
    if (typeFilters) {
        whereClauseValues = whereClauseValues.concat(typeFilters.split(','));
        whereClauseArr.push(common.createDynamicInClause('relationship_type', typeFilters, whereClauseValues.length));
    }

    // If "active" filter submitted, add it to composite parameterized where clause
    if (activeFilter) {
        whereClauseValues.push(activeFilter);
        whereClauseArr.push('active = $' + (whereClauseValues.length))
    }

    if(whereClauseArr.length > 0) {
        options.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
        options.whereClauseValues = whereClauseValues;
    }

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
 * @api {get} /projects/:id/parcels/:parcel_id/details Project parcel details
 * @apiName GetProjectParcelDetails
 * @apiGroup Projects
 * @apiDescription Get all details for a project parcel: parcel attributes, parcel history (most recent 10), relationships (most recent 10)
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
 *     curl -i http://localhost/projects/1/parcels/1/details
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
router.get('/:id/parcels/:parcel_id/details', common.parseQueryOptions, function(req, res, next) {

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON',
        returnGeometry: true,

    };

    // Where clause needs to be limited by project and parcel ids
    var whereClauseArr = ['project_id = $1', 'id = $2'];
    var whereClauseValues = [req.params.id, req.params.parcel_id];
    options.whereClause  = 'WHERE ' + whereClauseArr.join(' AND ');
    options.whereClauseValues = whereClauseValues;

    var otherOpts = {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    otherOpts.queryModifiers.limit = 'LIMIT 10';
    otherOpts.queryModifiers.sort_by = 'time_updated';
    otherOpts.queryModifiers.sort_dir =  'DESC';

    // Where clause needs to be limited by project and parcel ids
    var whereClauseArr = ['project_id = $1', 'parcel_id = $2'];

    otherOpts.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
    otherOpts.whereClauseValues = whereClauseValues;

    Q.all([
        ctrlCommon.getAll('parcel',  options),
        ctrlCommon.getAll('show_parcel_history', otherOpts),
        ctrlCommon.getAll('show_relationships', otherOpts)
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
router.get('/:id/parcels/:parcel_id/resources', common.parseQueryOptions, function(req, res, next) {

    var whereClauseArr = [];
    var whereClauseValues = [];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    var whereClauseArr = ['project_id = $1', 'parcel_id = $2'];
    var whereClauseValues = [req.params.id, req.params.parcel_id];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: req.query.outputFormat || 'GeoJSON'
    };

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