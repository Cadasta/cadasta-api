var express = require('express');
var router = express.Router();
var pgb = require('../pg-binding');
var pgUtils = require('../pg-utils');
var throwjs = require('throw.js');

/**
 * @api {get} /parcel Request all parcels
 * @apiName GetParcels
 * @apiGroup Parcel
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
 *     curl -i http://localhost/parcel
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
                        [
                            -105.231556892395,
                            21.1681321755877
                        ],
                        [
                            -105.231213569641,
                            21.1652507347151
                        ],
                        [
                            -105.227437019348,
                            21.1661712010929
                        ],
                        [
                            -105.224862098694,
                            21.1647304685776
                        ],
                        [
                            -105.223617553711,
                            21.1619290040903
                        ],
                        [
                            -105.22340297699,
                            21.1582870209836
                        ],
                        [
                            -105.217137336731,
                            21.1587272654609
                        ],
                        [
                            -105.220828056335,
                            21.1639300555639
                        ],
                        [
                            -105.223445892334,
                            21.168452332221
                        ],
                        [
                            -105.223574638367,
                            21.1700931240934
                        ],
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
                "active": false,
                "archived": null,
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
    var nonGeomColumns = "id,spatial_source,user_id,area,land_use,gov_pin,active,archived,time_created,time_updated,created_by,updated_by";

    var sql = pgUtils.featureCollectionSQL(nonGeomColumns, {geometryColumn: 'geom'});
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

/**
 * @api {get} /parcel/:id Request one parcel
 * @apiName GetParcel
 * @apiGroup Parcel
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
 *     curl -i http://localhost/parcel/1
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
                        [
                            -105.231556892395,
                            21.1681321755877
                        ],
                        [
                            -105.231213569641,
                            21.1652507347151
                        ],
                        [
                            -105.227437019348,
                            21.1661712010929
                        ],
                        [
                            -105.224862098694,
                            21.1647304685776
                        ],
                        [
                            -105.223617553711,
                            21.1619290040903
                        ],
                        [
                            -105.22340297699,
                            21.1582870209836
                        ],
                        [
                            -105.217137336731,
                            21.1587272654609
                        ],
                        [
                            -105.220828056335,
                            21.1639300555639
                        ],
                        [
                            -105.223445892334,
                            21.168452332221
                        ],
                        [
                            -105.223574638367,
                            21.1700931240934
                        ],
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
                "active": false,
                "archived": null,
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
    var nonGeomColumns = "id,spatial_source,user_id,area,land_use,gov_pin,active,archived,time_created,time_updated,created_by,updated_by";

    var sql = pgUtils.featureCollectionSQL(nonGeomColumns, {geometryColumn: 'geom', whereClause: 'WHERE id = $1'});
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