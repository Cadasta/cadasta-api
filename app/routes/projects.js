var express = require('express');
var router = express.Router();
var common = require('../common.js');
var settings = require('../settings/settings.js');
var ctrlCommon = require('../controllers/common.js');
var pgb = require('../pg-binding.js');

var Q = require('q');

/**
 * @api {get} /projects Get all
 * @apiName GetProjects
 * @apiGroup Projects
 * @apiDescription Get all projects (from the project table)
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
        outputFormat: 'GeoJSON'
    };

    if(req.query.organization_id) {
        whereClauseArr.push('organization_id = $1');
        whereClauseValues.push(parseInt(req.query.organization_id));
        options.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
        options.whereClauseValues = whereClauseValues;
    }

    ctrlCommon.getAll("show_project_extents", options)
        .then(function(result){
            res.status(200).json(result[0].response);
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
 * @api {get} /projects/overview/:id Project Overview - get one
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
 *     curl -i http://localhost/projects/overview/1
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


router.get('/overview/:id', common.parseQueryOptions, function(req, res, next) {

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