var express = require('express');
var router = express.Router();
var pgb = require('../pg-binding');
var common = require('../common.js');

/**
 * @api {get} /activities Request all activities
 * @apiName GetActivities
 * @apiGroup Activities
 *
 *
 * @apiParam (Optional query string parameters) {String} [fields] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_by] Options: id, spatial_source, user_id, time_created, time_updated
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
router.get('', common.parseQueryOptions, function(req, res, next) {

    common.tableColumnQuery("show_activity")
        .then(function(response){

            var sql = common.featureCollectionSQL("show_activity", req.queryModifiers);

            return pgb.queryDeferred(sql,{paramValues: [req.params.id]});
        })
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});


module.exports = router;