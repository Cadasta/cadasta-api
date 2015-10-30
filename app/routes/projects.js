var express = require('express');
var router = express.Router();
var clone = require('clone');
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

    ctrlCommon.getAll("project", options)
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
 * @apiDescription Get project
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
 * @apiParam {String} ckan_name The name of the project in the CKAN application database
 * @apiParam {String} title The title of the project in the CKAN application database
 * @apiParam {String} ona_api_key The ONA API Key for the project
 *
 * @apiSuccess {Object} cadasta_project_id The cadasta database id of the created project

 *
 * @apiExample {curl} Example usage:
 *     curl -H "Content-Type: application/json" -X POST -d '{"cadasta_organization_id": "1","ckan_id": "my-org","ckan_name": "My Org","title": "my-title","ona_api_key": "1239qsjdad1","description": "new-description"}' http://localhost/projects
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "cadasta_project_id": 1
        }
 */
router.post('', function(req, res, next) {

    if(req.body.cadasta_organization_id === undefined || req.body.ckan_id === undefined
        || req.body.ckan_name === undefined || req.body.title === undefined || req.body.description === undefined || req.body.ona_api_key === undefined) {
        return next(new Error('Missing POST parameters.'))
    }

    var sql = "SELECT * FROM cd_create_project($1,$2,$3,$4,$5,$6)";

    pgb.queryDeferred(sql,{paramValues: [req.body.cadasta_organization_id, req.body.ckan_id, req.body.ckan_name, req.body.title, req.body.description, req.body.ona_api_key]})
        .then(function(response){
            res.status(200).json({cadasta_project_id: response[0].cd_create_project})
        })
        .catch(function(err){
            next(err);
        })
        .done();

});


/**
 * @api {patch} /projects/:id Update one
 * @apiName UpdateProject
 * @apiGroup Projects
 * @apiDescription Update an project
 *
 * @apiParam {Number} id project's unique ID.
 *
 * @apiParam (POST parameters) {String} ckan_name "name" attribute from the CKAN database
 * @apiParam (POST parameters) {String} title "title" attribute from the CKAN database
 * @apiParam (POST parameters) {String} description "description" attribute from the CKAN database
 * @apiParam (POST parameters) {String} ona_api_key "ona_api_key" attribute from the CKAN database
 *
 * @apiSuccess {Object} response
 * @apiSuccess {String} response.success true
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "success": true
        }
 */
router.patch('/:id', function(req, res, next) {

    if(req.body.ckan_name === undefined || req.body.title === undefined || req.body.description === undefined || req.body.ona_api_key === undefined) {
        return next(new Error('Missing POST parameters.'))
    }

    var sql = "UPDATE project SET ckan_name = $1, title=$2, description=$3, time_updated=current_timestamp, ona_api_key=$4 where id=$5";

    pgb.queryDeferred(sql,{paramValues: [req.body.ckan_name, req.body.title, req.body.description, req.body.ona_api_key,req.params.id]})
        .then(function(response){

            res.status(200).json({success: true});
        })
        .catch(function(err){
            next(err);
        })
        .done();


});

/**
 * @api {patch} /projects/:id/archive Archive one
 * @apiName ArchiveProject
 * @apiGroup Projects
 * @apiDescription Archive a project
 *
 * @apiParam {Number} id project's unique ID.
 *

 * @apiSuccess {Object} response
 * @apiSuccess {String} response.success true
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "success": true
        }
 */
router.patch('/:id/archive', function(req, res, next) {

    var sql = "UPDATE project SET active = false, time_updated=current_timestamp where id=$1";

    pgb.queryDeferred(sql,{paramValues: [req.params.id]})
        .then(function(response){

            res.status(200).json({success: true});
        })
        .catch(function(err){
            next(err);
        })
        .done();



});

/**
 * @api {patch} /projects/:id/sys_delete Flag one for system delete
 * @apiName FlagDeleteProject
 * @apiGroup Projects
 * @apiDescription Flag a project for deletion
 *
 * @apiParam {Number} id project's unique ID.
 *

 * @apiSuccess {Object} response
 * @apiSuccess {String} response.success true
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "success": true
        }
 */
router.patch('/:id/sys_delete', function(req, res, next) {

    var sql = "UPDATE project SET active = false, sys_delete = true, time_updated=current_timestamp where id=$1";

    pgb.queryDeferred(sql,{paramValues: [req.params.id]})
        .then(function(response){

            res.status(200).json({success: true});
        })
        .catch(function(err){
            next(err);
        })
        .done();



});

//Get a project overview
/**
 * @api {get} /projects/:id/overview Project Overview
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

    var queryModifiers = clone(req.queryModifiers);
    queryModifiers.sort_by = queryModifiers.sort_by || 'time_created';
    queryModifiers.sort_dir = queryModifiers.sort_dir || 'DESC';

    var geoQueryModifiers = clone(req.queryModifiers);
    geoQueryModifiers.returnGeometry = geoQueryModifiers.returnGeometry || true;

    var opts = {queryModifiers: queryModifiers, outputFormat: 'GeoJSON'};
    var geomopts = {queryModifiers: geoQueryModifiers, outputFormat: 'GeoJSON'};

    opts.queryModifiers.limit = 'LIMIT 10';

    opts.whereClause = geomopts.whereClause = 'WHERE project_id = $1';
    opts.whereClauseValues = geomopts.whereClauseValues = [req.params.id];

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
                return res.status(200).json({message: "no project"});
            } else {
                // Add properties to parcel's geojson
                geoJSON.features[0].properties.project_resources = results[1][0].response.features;
                geoJSON.features[0].properties.project_activity = results[2][0].response.features;
                geoJSON.features[0].properties.parcels = results[3][0].response.features;

                res.status(200).json(geoJSON);

            }

            //loop through results[2][0].response.EACH -- add geom and prop to array
        })
        .catch(function (err) {
            next(err)
        })
        .done();

});

/**
 * @api {get} /projects/:id/map-data Project Map Data
 * @apiName ProjectMapData
 * @apiGroup Projects

 * @apiDescription Get project extent geometry, and all project parcel geometries

 * @apiParam {Number} id Project id number

 * @apiSuccess {Object} response
 * @apiSuccess {Object} response.project A feature collection with one feature representing a project
 * @apiSuccess {Object} response.parcels A feature collection with zero to many features representing project parcels

 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/projects/1/map-data
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            project: {
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

                        }
                    }
                ]
            },
            parcels: {
                type: "FeatureCollection",
                features: [
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
 */
router.get('/:id/map-data', common.parseQueryOptions, function(req, res, next) {

    req.queryModifiers.returnGeometry = true;

    var opts = {queryModifiers: req.queryModifiers, outputFormat: 'GeoJSON'};

    opts.whereClause = 'WHERE project_id = $1';
    opts.whereClauseValues =  [req.params.id];

    Q.all([
        ctrlCommon.getWithId('show_project_extents', 'id', req.params.id, opts),
        ctrlCommon.getAll('parcel', opts)
    ])
        .then(function (results) {

            //Process results: Add parcel history and relationships to Parcel GeoJSON
            var project = results[0][0].response;
            var parcels = results[1][0].response

            // If Id return no parcel, message the user
            if (project.features.length === 0) {
                return res.status(200).json({message: "no project"});
            } else {
                res.status(200).json({project: project, parcels:parcels});

            }

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
 *
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
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/projects/1/parcels_list
 *
 * @apiParamExample  Query string example:
 *     curl -i http://localhost/projects/1/parcels_list?tenure_type=own,lease
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

// Get project resources
/**
 * @api {get} /projects/:id/resources Project resources - get all
 * @apiName GetProjectResources
 * @apiGroup Projects
 * @apiDescription Get records from the resources table with a specific project id
 *
 * @apiParam {Number} id Project id number
 *
 * @apiParam (Optional query string parameters) {String} [fields] Options: id, project_id, url, file_name, type, description, active, time_created, time_updated, created_by, updated_by
 * @apiParam (Optional query string parameters) {String} [sort_by] Options: id, project_id, url, file_name, type, description, active, time_created, time_updated, created_by, updated_by
 * @apiParam (Optional query string parameters) {String} [sort_dir=ASC] Options: ASC or DESC
 * @apiParam (Optional query string parameters) {Number} [limit] integer of records to return
 *
 * @apiParamExample  Query String Example:
 *  curl -i http://localhost/custom/get_parcels_list?tenure_type=own,lease
 * @apiSuccess {Object} response A feature collection with zero to many features
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.id "Feature"
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {Integer} response.features.properties.resource_id resource id
 * @apiSuccess {Integer} response.features.properties.parcel_id resource parcel id
 * @apiSuccess {Integer} response.features.properties.project_id resource project id
 * @apiSuccess {String} response.features.properties.type resource type (parcel,party,relationship)
 * @apiSuccess {String} response.features.properties.url resource download url
 * @apiSuccess {String} response.features.properties.file_name resource file name on S3
 * @apiSuccess {String} response.features.properties.description resource description
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_updated Time stamp of last update
 * @apiSuccess {Number} response.features.properties.created_by id of creator
 * @apiSuccess {Number} response.features.properties.updated_by id of updater
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/projects/1/resources
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
router.get('/:id/resources', common.parseQueryOptions, function(req, res, next) {

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

    if(whereClauseArr.length > 0) {
        options.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
        options.whereClauseValues = whereClauseValues;
    }


    ctrlCommon.getAll('resource', options)
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
 * @api {get} projects/:id/parcels/:id/history Project parcel history
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

    var whereClauseArr = ['project_id = $1', 'parcel_id = $2'];
    var whereClauseValues = [req.params.id, req.params.parcel_id];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: req.query.outputFormat || 'GeoJSON'
    };

    options.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
    options.whereClauseValues = whereClauseValues;

    ctrlCommon.getAll('show_parcel_history',options)
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});

/**
 * @api {get} /projects/:id/parcels/:parcel_id/show_relationship_history Project parcel relationship history
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
 *
 * @apiParam {Number} id project's unique ID.
 * @apiParam {Number} parcel_id parcel's unique ID.
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
        queryModifiers: {returnGeometry: true },
        outputFormat: 'GeoJSON'
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

    var geomOpts = {
        queryModifiers: {returnGeometry: true },
        outputFormat: 'GeoJSON'
    };

    otherOpts.queryModifiers.limit = 'LIMIT 10';
    otherOpts.queryModifiers.sort_by = 'time_created';
    otherOpts.queryModifiers.sort_dir =  'DESC';

    // Where clause needs to be limited by project and parcel ids
    var whereClauseArr = ['project_id = $1', 'parcel_id = $2'];

    otherOpts.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
    otherOpts.whereClauseValues = whereClauseValues;

    geomOpts.whereClause = otherOpts.whereClause;
    geomOpts.whereClauseValues = otherOpts.whereClauseValues;

    Q.all([
        ctrlCommon.getAll('parcel',  options),
        ctrlCommon.getAll('show_parcel_history', otherOpts),
        ctrlCommon.getAll('show_relationships', geomOpts)
    ])
        .then(function (results) {

            //Process results: Add parcel history and relationships to Parcel GeoJSON
            var geoJSON = results[0][0].response;

            // If Id return no parcel, message the user
            if(geoJSON.features.length === 0) {
                return res.status(200).json({message: "no parcel"});
            }

            // Add properties to parcel's geojson
            geoJSON.features[0].properties.parcel_history = results[1][0].response.features;
            geoJSON.features[0].properties.relationships = results[2][0].response.features;

            res.status(200).json(geoJSON);
        })
        .catch(function(err){
            next(err)
        })
        .done();

});

/**
 * @api {get} /parcels/:id/resources Get project parcel resources
 * @apiName GetProjectParcelResources
 * @apiGroup Projects
 *
 * @apiDescription Get a project parcels resources (from the resource_parcel table)
 *
 * @apiParam {Number} id project's unique ID.
 * @apiParam {Number} parcel_id parcel's unique ID.
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
 * @apiSuccess {String} response.features.properties.file_name resource file name on S3
 * @apiSuccess {String} response.features.properties.description resource description
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_updated Time stamp of last update
 * @apiSuccess {Number} response.features.properties.created_by id of creator
 * @apiSuccess {Number} response.features.properties.updated_by id of updater
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/projects/1/parcels/1/resources
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

/**
 * @api {get} /:id/activity Project activity
 * @apiName GetProjectActivity
 * @apiGroup Projects
 * @apiDescription Get a project's activity records
 *
 * @apiParam {Number} id project's unique ID.
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
 *     curl -i http://localhost/projects/1/activity
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
router.get('/:id/activity', common.parseQueryOptions, function(req, res, next) {

    var whereClauseArr = [];
    var whereClauseValues = [];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    whereClauseArr.push('project_id = $1');
    whereClauseValues.push(parseInt(req.params.id));

    options.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
    options.whereClauseValues = whereClauseValues;


    ctrlCommon.getAll("show_activity", options)
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});

// Get project resources
/**
 * @api {get} /projects/:id/resources Project resources - get all
 * @apiName GetProjectResources
 * @apiGroup Projects
 * @apiDescription Get records from the resources table with a specific project id
 *
 * @apiParam {Number} id Project id number
 *
 * @apiParam (Optional query string parameters) {String} [fields] Options: id, project_id, url, file_name, type, description, active, time_created, time_updated, created_by, updated_by
 * @apiParam (Optional query string parameters) {String} [sort_by] Options: id, project_id, url, file_name, type, description, active, time_created, time_updated, created_by, updated_by
 * @apiParam (Optional query string parameters) {String} [sort_dir=ASC] Options: ASC or DESC
 * @apiParam (Optional query string parameters) {Number} [limit] integer of records to return
 *
 * @apiParamExample  Query String Example:
 *  curl -i http://localhost/custom/get_parcels_list?tenure_type=own,lease
 * @apiSuccess {Object} response A feature collection with zero to many features
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.id "Feature"
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {Integer} response.features.properties.resource_id resource id
 * @apiSuccess {Integer} response.features.properties.parcel_id resource parcel id
 * @apiSuccess {Integer} response.features.properties.project_id resource project id
 * @apiSuccess {String} response.features.properties.type resource type (parcel,party,relationship)
 * @apiSuccess {String} response.features.properties.url resource download url
 * @apiSuccess {String} response.features.properties.file_name resource file name on S3
 * @apiSuccess {String} response.features.properties.description resource description
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_updated Time stamp of last update
 * @apiSuccess {Number} response.features.properties.created_by id of creator
 * @apiSuccess {Number} response.features.properties.updated_by id of updater
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/projects/1/resources
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
router.get('/:project_id/resources', common.parseQueryOptions, function(req, res, next) {

    req.queryModifiers.sort_by = req.queryModifiers.sort_by || "time_created,id";
    req.queryModifiers.sort_dir = req.queryModifiers.sort_dir || "DESC";

    var whereClauseArr = ['project_id = $1'];
    var whereClauseValues = [req.params.project_id];

    var options =  {
        queryModifiers: req.queryModifiers,
        outputFormat: req.query.outputFormat || 'GeoJSON'
    };

    if(whereClauseArr.length > 0) {
        options.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
        options.whereClauseValues = whereClauseValues;
    }

    ctrlCommon.getAll('resource', options)
        .then(function(result){
            res.status(200).json(result[0].response);
        })
        .catch(function(err){
            next(err);
        })
        .done();

});


/**
 * @api {post} /projects/:id/parcels Project Parcel - Create Parcel
 * @apiName CreateParcel
 * @apiGroup Projects
 *
 * @apiDescription Create a Project Parcel
 *
 *
 * @apiParam {Integer} project_id Cadasta project id
 * @apiParam {String="digitized", "recreational_gps", "survey_grade_gps", "survey_sketch"} spatial_source parcel spatial source
 * @apiParam {String} [geojson] GeoJSON of the parcel
 * @apiParam {String="Commercial, Land Use"} [land_use] parcel land use type
 * @apiParam {String} [gov_pin] Government pin
 * @apiParam {String} description Parcel description
 *
 * @apiSuccess {Object} cadasta_parcel_id The cadasta database id of the created parcel

 *
 * @apiExample {curl} Example usage:
 *     curl -H "Content-Type: application/json" -X POST -d '{"spatial_source": "digitized","geojson":{"type": "LineString","coordinates": [[91.91986083984375,43.04881979669318],[91.94183349609375,42.974511174899156]]},"land_use": "Commercial","gov_pin": "433421ss","description": "This is my test parcel"}' http://localhost/projects/1/parcels
 *
 *
 * @api {post} /projects/:id/parcels
 * @apiParamExample {application/json} Request-Example:
 * {
    "spatial_source": "digitized",
    "geojson": {
        "type": "LineString",
        "coordinates": [
            [
                91.91986083984375,
                43.04881979669318
            ],
            [
                91.94183349609375,
                42.974511174899156
            ]
        ]
    },
    "land_use": "Commercial",
    "gov_pin": "433421ss",
    "description": "This is my test parcel"
}
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "status":"OKAY",
            "cadasta_parcel_id": 1
        }
 */
router.post('/:id/parcels', function(req, res, next) {

    if(req.params.id === undefined || req.body.spatial_source === undefined || req.body.description == undefined) {
        return next(new Error('Missing required POST parameters.'))
    }

    var geojson = ctrlCommon.sanitize(req.body.geojson);

    var sql = "SELECT * FROM cd_create_parcel($1,$2,$3,$4,$5,$6)";

    pgb.queryDeferred(sql,{paramValues: [req.params.id, req.body.spatial_source, geojson, req.body.land_use, req.body.gov_pin, req.body.description]})
        .then(function(response){
            res.status(200).json({status:"OKAY", cadasta_parcel_id: response[0].cd_create_parcel})
        })
        .catch(function(err){
            res.status(200).json({status:"ERROR", message:err.message})
        })
        .done();

});

/**
 * @api {post} /projects/:id/parcels/:parcel_id Project Parcel - Update One
 * @apiName UpdateParcel
 * @apiGroup Projects
 * @apiDescription Update a Parcel
 *
 *
 * @apiParam {Integer} id Cadasta project id
 * @apiParam {Integer} parcel_id Cadasta parcel id
 *
 * @apiParam (POST parameters) {String} [geojson] GeoJSON geometry object
 * @apiParam (POST parameters) {String="digitized", "recreational_gps", "survey_grade_gps", "survey_sketch"} [spatial_source] parcel spatial source
 * @apiParam (POST parameters) {String="Commercial, Land Use"} [land_use] parcel land use type
 * @apiParam (POST parameters) {String} [gov_pin] Government pin
 * @apiParam (POST parameters) {String} [description] Parcel description
 *
 * @apiSuccess {Object} cadasta_parcel_history_id The cadasta database id of the created parcel

 *
 * @apiExample {curl} Example usage:
 *     curl -H "Content-Type: application/json" -X PATCH -d {"spatial_source":"digitized"} http://localhost/projects/1/parcels/4
 *
 * @api {patch} /projects/:id/parcels/:parcel_id
 *
 * @apiParamExample {application/json} Request-Example:
 *
 *{"spatial_source": "digitized",
"geojson":{
        "type": "Linestring",
        "coordinates": [
          [
            91.91986083984375,
            43.04881979669318
          ],
          [
            91.94183349609375,
            42.974511174899156
          ]
        ]
      },
"land_use": "Residential",
"gov_pin": null,
"description": null
}*

 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "status":"OKAY",
            "cadasta_parcel_history_id": 1
        }
 */
router.patch('/:id/parcels/:parcel_id', function(req, res, next) {

    if(req.params.id === undefined && (req.body.geojson === undefined || req.body.spatial_source === undefined ||
        req.body.land_use === undefined || req.body.gov_pin === undefined || req.body.description === undefined)) {
        return next(new Error('Missing required POST parameters.'))
    }

    var geojson = ctrlCommon.sanitize(req.body.geojson);

    var sql = 'SELECT * FROM cd_update_parcel ($1, $2, $3, $4, $5, $6, $7)';

    pgb.queryDeferred(sql,{paramValues: [req.params.id, req.params.parcel_id, geojson, req.body.spatial_source, req.body.land_use, req.body.gov_pin, req.body.description]})
        .then(function(response){
            res.status(200).json({status:"OKAY", cadata_parcel_history_id: response[0].cd_update_parcel})
        })
        .catch(function(err){
            res.status(400).json({status:"ERROR", message:err.message})
        })
        .done();

});


module.exports = router;