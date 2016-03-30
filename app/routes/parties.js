var express = require('express');
var router = express.Router();
var common = require('../common.js');
var ctrlCommon = require('../controllers/common.js');
var Q = require('q');
var pgb = require('../pg-binding.js');
var pagination = require('../pagination.js');


/**
 * @api {get} /projects/:project_id/parties/:party_id/details Project parties - details
 * @apiName GetProjectPartyDetails
 * @apiGroup Projects
 * @apiDescription Get all details for a project party attributes, relationships , parcels (most recent 10)
 *
 * @apiParam {Number} id parties unique ID.
 * @apiParam {Number} project_id parties unique project ID.
 *
 *
 * @apiSuccess {Object} response A feature collection with one feature representing a parcel
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON geometry object (always null here)
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {Integer} response.features.properties.id party id
 * @apiSuccess {Integer} response.features.properties.project_id party project id
 * @apiSuccess {Integer} response.features.properties.num_relationships number of party relationships
 * @apiSuccess {String} response.features.properties.full_name party group name
 * @apiSuccess {String} response.features.properties.group_name party group name
 * @apiSuccess {String} response.features.properties.group_name Time stamp of last update
 * @apiSuccess {Timestamp} response.features.properties.time_created timestamp of party creation
 * @apiSuccess {Timestamp} response.features.properties.time_updated timestamp of party update
 * @apiSuccess {Array} response.features.properties.parcels
 * @apiSuccess {Number} response.features.properties.parcels.geometry parcels GeoJSON geometry object
 * @apiSuccess {Object} response.features.properties.parcels.properties GeoJSON feature's properties
 * @apiSuccess {Number} response.features.properties.parcels.properties.project_id project id
 * @apiSuccess {Number} response.features.properties.parcels.properties.parcel_id parcel id
 * @apiSuccess {Number} response.features.properties.parcels.properties.party_id party_id id
 * @apiSuccess {String} response.features.properties.parcels.properties.relationship_id relationship id
 * @apiSuccess {Array} response.features.properties.relationships
 * @apiSuccess {Number} response.features.properties.relationships.geometry relationships GeoJSON geometry object
 * @apiSuccess {Object} response.features.properties.relationships.properties GeoJSON feature's properties
 * @apiSuccess {Number} response.features.properties.relationships.properties.id relationship id
 * @apiSuccess {String} response.features.properties.relationships.properties.tenure_type
 * @apiSuccess {String} response.features.properties.relationships.properties.how_acquired
 * @apiSuccess {Date} response.features.properties.relationships.properties.acquired_date
 * @apiSuccess {Number} response.features.properties.relationships.properties.parcel_id
 * @apiSuccess {Number} response.features.properties.relationships.properties.project_id
 * @apiSuccess {String} response.features.properties.relationships.properties.spatial_source
 * @apiSuccess {Number} response.features.properties.relationships.properties.party_id
 * @apiSuccess {String} response.features.properties.relationships.properties.full_name
 * @apiSuccess {String} response.features.properties.relationships.properties.group_name
 * @apiSuccess {Timestamp} response.features.properties.relationships.properties.time_created
 * @apiSuccess {Timestamp} response.features.properties.relationships.properties.time_updated
 * @apiSuccess {Number} response.features.properties.relationships.properties.active
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/projects/1/parties/1/details
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
                "id": 2,
                "num_relationships": 2,
                "group_name": null,
                "full_name": "Oscar",
                "group_name": "Sanders ",
                "type": "individual",
                "active": true,
                "time_created": "2015-10-28T18:52:00.69074-07:00",
                "time_updated": "2015-10-28T18:52:00.69074-07:00",
                "parcels": [
                    {
                        "type": "Feature",
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        -68.1227874755859,
                                        -16.498764239693
                                    ],
                                    [
                                        -68.1223583221435,
                                        -16.4987230913468
                                    ],
                                    [
                                        -68.1221222877502,
                                        -16.4989699812929
                                    ],
                                    [
                                        -68.1222081184387,
                                        -16.4998135195646
                                    ],
                                    [
                                        -68.1224226951599,
                                        -16.5002661483402
                                    ],
                                    [
                                        -68.1230235099792,
                                        -16.5002250003135
                                    ],
                                    [
                                        -68.1231951713562,
                                        -16.4996077788619
                                    ],
                                    [
                                        -68.1231737136841,
                                        -16.4990317037302
                                    ],
                                    [
                                        -68.1227874755859,
                                        -16.498764239693
                                    ]
                                ]
                            ]
                        },
                        "properties": {
                            "project_id": 1,
                            "parcel_id": 2,
                            "party_id": 2,
                            "relationship_id": 2
                        }
                    }
                ],
                "relationships": [
                    {
                        "type": "Feature",
                        "geometry": null,
                        "properties": {
                            "id": 2,
                            "tenure_type": "own",
                            "how_acquired": "lease",
                            "acquired_date": "2014-09-09",
                            "parcel_id": 2,
                            "project_id": 1,
                            "spatial_source": "survey sketch",
                            "party_id": 2,
                            "full_name": "Oscar",
                            "group_name": "Sanders ",
                            "time_created": "2015-10-28T18:52:00.69074-07:00",
                            "active": true,
                            "time_updated": "2015-10-28T18:52:00.69074-07:00"
                        }
                    }
                ]
            }
        }
    ]
}
 */
router.get('/:project_id/parties/:id/details', common.parseQueryOptions, function(req, res, next) {

    var whereClauseArr = ['project_id = $1', 'party_id = $2'];
    var whereClauseValues = [req.params.project_id, req.params.id];

    //geometry options for show_party_parcels
    var geomOptions =  {
        queryModifiers: {returnGeometry: true},
        outputFormat: 'GeoJSON'
    };

    geomOptions.whereClause = 'WHERE ' + whereClauseArr.join(' AND ');
    geomOptions.whereClauseValues = whereClauseValues;

    //party options
    var partyWhereClauseArr = ['project_id = $1', 'id = $2'];
    var partyWhereClauseValues = [req.params.project_id, req.params.id];

    var partyOptions =  {
        queryModifiers: req.queryModifiers,
        outputFormat: 'GeoJSON'
    };

    partyOptions.whereClause ='WHERE ' + partyWhereClauseArr.join(' AND ');
    partyOptions.whereClauseValues = partyWhereClauseValues;

    Q.all([
        ctrlCommon.getAll('show_parties',  partyOptions),
        ctrlCommon.getAll('show_party_parcels',  geomOptions),
        ctrlCommon.getAll('show_relationships', geomOptions),
        ctrlCommon.getAll('show_relationship_history', geomOptions)
    ])
        .then(function (results) {

            //Process results: Add parcel history and relationships to Parcel GeoJSON
            var geoJSON = results[0][0].response;

            // Add properties to parties geojson
            geoJSON.features[0].properties.parcels = results[1][0].response.features;
            geoJSON.features[0].properties.relationships = results[2][0].response.features;
            geoJSON.features[0].properties.relationship_history = results[3][0].response.features;

            res.status(200).json(geoJSON);
        })
        .catch(function(err){
            next(err)
        })
        .done();
});

// CREATE A PARTY RECORD
/**
 * @api {post} /projects/1/parties Project parties - Create one
 * @apiName PostParties
 * @apiGroup Projects
 * @apiDescription Create a party
 *
 * @apiParam (POST parameters) {String} full_name group name of party
 * @apiParam (POST parameters) {String} group_name Name of Party Group
 * @apiParam (POST parameters) {String="individual, group"} party_type Type of Party
 * apiParam (POST parameters) {String} gender Gender
 * @apiParam (POST parameters) {Date} dob Date of Birth
 * @apiParam (POST parameters) {String} notes Party Notes
 * @apiParam (POST parameters) {String} national_id Party National ID
 *
 * @apiSuccess {Object} cadasta_party_id The cadasta database id of the created party
 *
 * @apiExample {curl} Example usage:
 *     curl -H "Content-Type: application/json" -X POST -d  http://localhost/projects/1/parties
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "cadasta_party_id": 1
        }
 */
router.post('/:project_id/parties', function(req, res, next) {

    if(req.body.full_name === undefined || req.body.group_name === undefined ||
        req.body.group_name === undefined || req.body.party_type === undefined) {
        return next(new Error('Missing POST parameters.'))
    }

    var sql = "SELECT * FROM cd_create_party($1,$2,$3,$4,$5,$6,$7,$8)";

    var party_id;

    pgb.queryDeferred(sql,{paramValues: [req.params.project_id, req.body.party_type, req.body.full_name, req.body.group_name, req.body.gender, req.body.dob, req.body.notes, req.body.national_id]})
        .then(function(r1){

            party_id = r1[0].cd_create_party;

            /**
             * Party creation on UI is validated
             *
             */
            var sqlUpdateParty = 'UPDATE party SET validated = true where id = ' + party_id;

            return pgb.queryDeferred(sqlUpdateParty);
        })
        .then(function(r2){
            res.status(200).json({cadasta_party_id: party_id})
        })
        .catch(function(err){
            next(err);
        })
        .done();

});


// UPDATE A PARTY RECORD
/**
 * @api {patch} /projects/:project_id/parties/:party_id Project parties - Update one
 * @apiName UpdateParties
 * @apiGroup Projects
 * @apiDescription Update a party
 *
 * @apiParam (POST parameters) {String} full_name group name of party
 * @apiParam (POST parameters) {String} group_name Name of Party Group
 * @apiParam (POST parameters) {String="individual, group"} party_type Type of Party
 * @apiParam (POST parameters) {String} gender Gender
 * @apiParam (POST parameters) {Date} dob Date of Birth
 * @apiParam (POST parameters) {String} notes Party Notes
 * @apiParam (POST parameters) {String} national_id Party National ID
 *
 * @apiSuccess {Object} cadasta_party_id The cadasta database id of the created party
 *
 * @apiExample {curl} Example usage:
 *     curl -H "Content-Type: application/json" -X PATCH -d {"full_name": "Daniel Batch","group_name": null,"party_type": "individual","gender": "free form text","dob":"10-10-2010","notes":"We at wal mart corporation have been working hard to make this happen. We own everything","national_id":"XXX3322**iiIeeeeLLLL"} http://localhost/projects/1/parties/1
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "status":"OKAY",
            "cadasta_party_id": 1
        }
 */
router.patch('/:project_id/parties/:party_id', function(req, res, next) {

    // Must have party type and or group name
    if(req.body.party_type === undefined && (req.body.full_name == undefined || req.body.group_name == undefined)){
        return next(new Error('Missing POST parameters.'))
    }

    var sql = "SELECT * FROM cd_update_party($1,$2,$3,$4,$5,$6,$7,$8,$9)";

    pgb.queryDeferred(sql,{paramValues: [req.params.project_id, req.params.party_id,req.body.party_type, req.body.full_name, req.body.group_name, req.body.gender, req.body.dob, req.body.notes, req.body.national_id]})
        .then(function(response){
            res.status(200).json({status:"OKAY",cadasta_party_id: response[0].cd_update_party})
        })
        .catch(function(err){
            next(err);
        })
        .done();
});

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
 * @apiSuccess {String} response.features.properties.full_name party group name
 * @apiSuccess {String} response.features.properties.group_name party group name
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
                "full_name": null,
                "group_name": null,
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
 * @apiSuccess {String} response.features.properties.full_name party group name
 * @apiSuccess {String} response.features.properties.group_name party group name
 * @apiSuccess {String} response.features.properties.group_name Time stamp of last update
 * @apiSuccess {Boolean} response.features.properties.validated Status of survey response validation
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
                "full_name": null,
                "group_name": null,
                "validated":false,
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

    ctrlCommon.getCountWithId('show_parties', 'id', options)
        .then(function(result){
            pagination.addPaginationHeaders(req, res, result[0].count);
            ctrlCommon.getAll('show_parties', options)
            .then(function(result){
                res.status(206).json(result[0].response);
            })
            .catch(function(err){
                next(err);
            })
            .done();
        })
        .catch(function(err){
            next(err);
        })
        .done();

    /*
    ctrlCommon.getAll("show_parties", options)
        .then(function(result){
            res.status(200).json(result[0].response);
        })
        .catch(function(err){
            next(err);
        })
        .done();
    */
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
