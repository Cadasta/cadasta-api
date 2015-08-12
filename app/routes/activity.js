var express = require('express');
var router = express.Router();
var pgb = require('../pg-binding');
var pgUtils = require('../pg-utils');
var throwjs = require('throw.js');

/**
 * @api {get} /activity Request all activities
 * @apiName GetActivities
 * @apiGroup Activity
 *
 * @apiSuccess {Object} response A feature collection with zero to many features
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON geometry object
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {String} response.features.properties.activity_type activity type
 * @apiSuccess {String} response.features.properties.type type
 * @apiSuccess {Number} response.features.properties.id activity's parcel id
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/activity
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
        "activity_type": "party",
        "id": 2,
        "type": "",
        "time_created": "2015-08-12T03:46:01.673153+00:00"
      }
    },
    {
      "type": "Feature",
      "geometry": null,
      "properties": {
        "activity_type": "relationship",
        "id": 2,
        "type": "Own",
        "time_created": "2015-08-12T03:46:01.673153+00:00"
      }
    }
  ]
}
 */
router.get('', function(req, res, next) {

    // All columns in table with the exception of the geometry column
    var nonGeomColumns = "activity_type,id,type,time_created";

    var sql = pgUtils.featureCollectionSQL("show_activity", nonGeomColumns);
    var preparedStatement = {
        name: "get_all_show_activity",
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