var express = require('express');
var router = express.Router();
var pgb = require('../pg-binding');
var pgUtils = require('../pg-utils');
var throwjs = require('throw.js');

/**
 * @api {get} /custom/get_parcels_list Parcel/Num relationships List
 * @apiName get_parcels_list
 * @apiGroup Custom
 *
 * @apiSuccess {Object} response A feature collection with zero to many features
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON geometry object
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {Integer} response.features.properties.id parcel id
 * @apiSuccess {Timestamp} response.features.properties.time_created timestamp with timezone
 * @apiSuccess {Integer} response.features.properties.num_relationships number of associated relationships
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/custom/get_parcels_list
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
                "id": 12,
                "time_created": "2015-08-20T13:29:27.309732-07:00",
                "num_relationships": 1
            }
        },
        {
            "type": "Feature",
            "geometry": null,
            "properties": {
                "id": 10,
                "time_created": "2015-08-20T13:29:27.309732-07:00",
                "num_relationships": 2
            }
        },
        {
            "type": "Feature",
            "geometry": null,
            "properties": {
                "id": 11,
                "time_created": "2015-08-20T13:29:27.309732-07:00",
                "num_relationships": 1
            }
        }
    ]
}
 *
 * */
router.get('/get_parcels_list', function(req, res, next) {

    // All columns in table with the exception of the geometry column
    var nonGeomColumns = "id,time_created, num_relationships";

    var sql = pgUtils.featureCollectionSQL("show_parcel_list", nonGeomColumns, null);
    var preparedStatement = {
        name: "get_parcel_list",
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


module.exports = router;