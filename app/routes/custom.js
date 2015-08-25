var express = require('express');
var router = express.Router();
var pgb = require('../pg-binding');
var pgUtils = require('../pg-utils');
var throwjs = require('throw.js');
var common = require('../common.js');

/**
 * @api {get} /custom/get_parcels_list Parcel/Num relationships List
 * @apiName get_parcels_list
 * @apiGroup Custom
 *
 * @apiParam {String} tenure_type Options: own, lease, occupy, informal occupy
 * @apiParamExample  Query String Example:
 *  curl -i http://localhost/custom/get_parcels_list?tenure_type?=own,lease
 * @apiSuccess {Object} response A feature collection with zero to many features
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON geometry object
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {Integer} response.features.properties.id parcel id
 * @apiSuccess {Timestamp} response.features.properties.time_created timestamp with timezone
 * @apiSuccess {Numeric} response.features.properties.area area of parcel geometry
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
                "area": null,
                "num_relationships": 1
            }
        },
        {
            "type": "Feature",
            "geometry": null,
            "properties": {
                "id": 10,
                "time_created": "2015-08-20T13:29:27.309732-07:00",
                "area": null,
                "num_relationships": 2
            }
        },
        {
            "type": "Feature",
            "geometry": null,
            "properties": {
                "id": 11,
                "time_created": "2015-08-20T13:29:27.309732-07:00",
                "area": null,
                "num_relationships": 1
            }
        }
    ]
}
 *
 * */

router.get('/get_parcels_list', function (req, res, next) {

    var args = common.getArguments(req);
    var options = {};
    var tenure_type;
    var obj = {};

    if (args.tenure_type) {
        obj = createWhereClause(args.tenure_type);
        options.whereClause = 'WHERE tenure_type IN (' + obj.str + ')';
    } else {
        obj.uriList = [];
    }

    // All columns in table with the exception of the geometry column
    var nonGeomColumns = "id,time_created,area,tenure_type,num_relationships";

    var sql = pgUtils.featureCollectionSQL("show_parcel_list", nonGeomColumns, options);

    // Handle bad requests; arg must tenure_type
    if (Object.keys(args).length > 0 && Object.keys(args).indexOf('tenure_type') == -1) {
        res.status(400).json({error: "Bad Request; invalid 'tenure_type' option"});
    } else {
        pgb.queryDeferred(sql, {sqlParams: obj.uriList})
            .then(function (result) {
                res.status(200).json(result[0].response);
            })
            .catch(function (err) {
                next(err);
            });
    }

});

function createWhereClause(arr) {
    var obj = {};

    obj.str = '';
    obj.uriList = arr.split(',');

    obj.uriList.forEach(function (val, i) {
        if (i < obj.uriList.length - 1) {
            obj.str += '$' + (i + 1) + ', ';
        } else {
            obj.str += '$' + (i + 1) + '';
        }
    });

    return obj;
}

module.exports = router;