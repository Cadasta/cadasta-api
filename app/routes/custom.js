var express = require('express');
var router = express.Router();
var pgb = require('../pg-binding');
var common = require('../common.js');
var settings = require

/**
 * @api {get} /custom_get_parcels_list Parcel/Num relationships List
 * @apiName custom_get_parcels_list
 * @apiGroup Custom
 *
 * @apiParam {String} tenure_type Options: own, lease, occupy, informal occupy
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
 *     curl -i http://localhost/custom_get_parcels_list
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
router.get('/get_parcels_list', common.parseQueryOptions, function(req, res, next) {

    var args = common.getArguments(req);
    var options = {};
    var tenure_type;
    var obj = {};

    if (args.tenure_type) {
        obj = createWhereClause(args.tenure_type);
        options.whereClause = 'WHERE ' + obj.str + '';
    } else {
        obj.uriList = [];
    }

    req.queryModifiers.sort_by = req.queryModifiers.sort_by || "time_created,id";
    req.queryModifiers.sort_dir = req.queryModifiers.sort_dir || "DESC";

    common.tableColumnQuery("show_parcel_list")
        .then(function(response){

            var sql = common.featureCollectionSQL("show_parcel_list", req.queryModifiers, options.whereClause);

            return pgb.queryDeferred(sql,{paramValues:obj.uriList});
        })
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();


});

function createWhereClause(arr) {
    var obj = {};

    obj.str = '';
    obj.uriList = arr.split(',');

    obj.uriList.forEach(function (val, i) {
        if (i < obj.uriList.length - 1) {
            obj.str += 'tenure_type::text[] @> ARRAY[$' + (i + 1) +'] OR ';
        } else {
            obj.str += 'tenure_type::text[] @> ARRAY[$' + (i + 1) + ']';
        }
    });

    return obj;
}

module.exports = router;
