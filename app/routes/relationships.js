var express = require('express');
var router = express.Router();
var pgb = require('../pg-binding');
var common = require('../common.js');

/**
 * @api {get} /relationships Request all relationships
 * @apiName GetRelationships
 * @apiGroup Relationships
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
 * @apiSuccess {Number} response.features.properties.relationship_id relationship id
 * @apiSuccess {String} response.features.properties.relationship_type relationship type
 * @apiSuccess {String} response.features.properties.spatial_source spatial source
 * @apiSuccess {Number} response.features.properties.parcel_id relationship's parcel id
 * @apiSuccess {Number} response.features.properties.party_id relationship's party id
 * @apiSuccess {String} response.features.properties.first_name first name of creator
 * @apiSuccess {String} response.features.properties.last_name last_name of creator
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/relationships
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          47.867583,
          -122.164306
        ]
      },
      "properties": {
        "relationship_id": 1,
        "relationship_type": "Own",
        "parcel_id": 1,
        "spatial_source": "survey_grade_gps",
        "party_id": 1,
        "first_name": "Daniel",
        "last_name": "Baah",
        "time_created": "2015-08-12T03:46:01.673153+00:00"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          47.670367,
          -122.387855
        ]
      },
      "properties": {
        "relationship_id": 2,
        "relationship_type": "Own",
        "parcel_id": 2,
        "spatial_source": "survey_grade_gps",
        "party_id": 2,
        "first_name": "Sarah",
        "last_name": "Bindman",
        "time_created": "2015-08-12T03:46:01.673153+00:00"
      }
    }
  ]
}
 */
router.get('', common.parseQueryOptions, function(req, res, next) {

    var sql = common.featureCollectionSQL("show_relationships", req.queryModifiers);

    pgb.queryDeferred(sql)
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        });

});

/**
 * @api {get} /relationships/:id Request one relationship
 * @apiName GetRelationship
 * @apiGroup Relationships
 *
 * @apiParam {Number} id relationship's unique ID.
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
 * @apiSuccess {Number} response.features.properties.relationship_id relationship id
 * @apiSuccess {String} response.features.properties.relationship_type relationship type
 * @apiSuccess {String} response.features.properties.spatial_source spatial source
 * @apiSuccess {Number} response.features.properties.parcel_id relationship's parcel id
 * @apiSuccess {Number} response.features.properties.party_id relationship's party id
 * @apiSuccess {String} response.features.properties.first_name first name of creator
 * @apiSuccess {String} response.features.properties.last_name last_name of creator
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/relationships
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *
 *     {
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "geometry": {
                "type": "Point",
                "coordinates": [
                  47.867583,
                  -122.164306
                ]
              },
              "properties": {
                "relationship_id": 1,
                "relationship_type": "Own",
                "parcel_id": 1,
                "spatial_source": "survey_grade_gps",
                "party_id": 1,
                "first_name": "Daniel",
                "last_name": "Baah",
                "time_created": "2015-08-12T03:46:01.673153+00:00"
              }
            }
          ]
        }
 */
router.get('/:id', common.parseQueryOptions, function(req, res, next) {


    var sql = common.featureCollectionSQL("show_relationships", req.queryModifiers, "WHERE relationship_id = $1");

    pgb.queryDeferred(sql, {paramValues: [req.params.id]})
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        });

});

module.exports = router;