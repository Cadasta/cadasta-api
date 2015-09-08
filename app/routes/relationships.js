var express = require('express');
var router = express.Router();
var common = require('../common.js');
var ctrlCommon = require('../controllers/common.js');


/**
 * @api {get} /relationships/:id/relationship_history Get relationship's history
 * @apiName GetRelationshipHistory
 * @apiGroup Relationships
 * @apiDescription Get relationship history records for a given relationship_id
 * @apiParam {Number} id relationship's unique ID.
 *
 * @apiParam (Optional query string parameters) {String} [fields] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_by] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_dir=ASC] Options: ASC or DESC
 * @apiParam (Optional query string parameters) {Number} [limit] integer of records to return
 *
 * @apiSuccess {Object} response A feature collection with feature per parcel history record
 * @apiSuccess {String} response.type "Feature Collection"
 * @apiSuccess {Object[]} response.features An array of feature objects
 * @apiSuccess {String} response.features.type "Feature"
 * @apiSuccess {Object} response.features.geometry GeoJSON geometry object (always null here)
 * @apiSuccess {Object} response.features.properties GeoJSON feature's properties
 * @apiSuccess {Number} response.features.properties.id history id
 * @apiSuccess {Number} response.features.properties.relationship_id relationship id
 * @apiSuccess {Number} response.features.properties.origin_id origin id
 * @apiSuccess {Number} response.features.properties.parent_id parent id
 * @apiSuccess {String} response.features.properties.expiration_date expiration_date
 * @apiSuccess {String} response.features.properties.description description
 * @apiSuccess {String} response.features.properties.date_modified YYYY-MM-DD of last update
 * @apiSuccess {Boolean} response.features.properties.active active/archived flag
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_updated Time stamp of last update
 * @apiSuccess {Number} response.features.properties.created_by id of creator
 * @apiSuccess {Number} response.features.properties.updated_by id of updater
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/relationships/1/relationship_history
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
            "id": 1,
            "relationship_id": 1,
            "origin_id": 1,
            "version": 1,
            "parent_id": null,
            "expiration_date": null,
            "description": "History",
            "date_modified": "2015-08-31",
            "active": true,
            "time_created": "2015-08-31T13:00:18.339167-07:00",
            "time_updated": null,
            "created_by": 11,
            "updated_by": null
          }
        }
      ]
    }
 */
router.get('/:id/relationship_history', common.parseQueryOptions, function(req, res, next) {

    req.queryModifiers.returnGeometry = false;

    ctrlCommon.getWithId('relationship_history', 'relationship_id', req.params.id, {queryModifiers: req.queryModifiers, outputFormat: 'GeoJSON'})
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});
module.exports = router;