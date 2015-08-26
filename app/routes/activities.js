var express = require('express');
var router = express.Router();
var pgb = require('../pg-binding');
var pgUtils = require('../pg-utils');
var common = require('../common.js');

/**
 * @api {get} /activities Request all activities
 * @apiName GetActivities
 * @apiGroup Activities
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
 *     curl -i http://localhost/activities
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
router.get('', function(req, res, next) {

    // All columns in table with the exception of the geometry column
    var nonGeomColumns = "activity_type,id,type,name, parcel_id,time_created";

    var queryOptions = {
        columns: nonGeomColumns,
        geometryColumn: 'geom',
        order_by: '',
        limit: '',
        whereClause: ''
    };

    try{
        queryOptions = common.parseQueryOptions(req.query, nonGeomColumns, queryOptions)
    } catch (e) {
        return res.status(400).send(e);
    }

    var sql = pgUtils.featureCollectionSQL("show_activity", nonGeomColumns, queryOptions);

    pgb.queryDeferred(sql)
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        });

});


module.exports = router;