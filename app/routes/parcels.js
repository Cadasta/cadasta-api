var express = require('express');
var router = express.Router();
var pgb = require('../pg-binding');
var pgUtils = require('../pg-utils');
var throwjs = require('throw.js');

/**
 * @api {get} /parcels Request all parcels
 * @apiName GetParcels
 * @apiGroup Parcels
 *
 * @apiSuccess {Object} response A feature collection with zero to many features
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
router.get('', function(req, res, next) {

    // All columns in table with the exception of the geometry column
    var nonGeomColumns = "id,spatial_source,user_id,area,land_use,gov_pin,active,time_created,time_updated,created_by,updated_by";

    var sql = pgUtils.featureCollectionSQL("parcel", nonGeomColumns, {geometryColumn: 'geom'});
    var preparedStatement = {
        name: "get_all_parcels",
        text: sql,
        values:[]};

    pgb.queryDeferred(preparedStatement)
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        });

});

/**
 * @api {get} /parcels/:id Request one parcel
 * @apiName GetParcel
 * @apiGroup Parcels
 *
 * @apiParam {Number} id parcel's unique ID.
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

router.get('/:id', function(req, res, next) {

    // All columns in table with the exception of the geometry column
    var nonGeomColumns = "id,spatial_source,user_id,area,land_use,gov_pin,active,time_created,time_updated,created_by,updated_by";

    var sql = pgUtils.featureCollectionSQL("parcel", nonGeomColumns, {geometryColumn: 'geom', whereClause: 'WHERE id = $1'});
    var preparedStatement = {
        name: "get_parcel",
        text: sql,
        values:[req.params.id]};

    pgb.queryDeferred(preparedStatement)
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        });

});

module.exports = router;