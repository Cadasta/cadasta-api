var express = require('express');
var router = express.Router();
var common = require('../common.js');
var ctrlCommon = require('../controllers/common.js');

/**
 * @api {get} /parcels Request all parcels
 * @apiName GetParcels
 * @apiGroup Parcels
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
 * @apiSuccess {String} response.features.properties.id parcel id
 * @apiSuccess {Number} response.features.properties.spatial_source integer code for the spatial source of the parcel
 * @apiSuccess {String} response.features.properties.user_id user id that created parcel
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_updated Time stamp of last update
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

router.get('', common.parseQueryOptions, function(req, res, next) {

    ctrlCommon.getAll("parcel", {queryModifiers: req.queryModifiers, outputFormat: 'GeoJSON'})
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});

/**
 * @api {get} /parcels/:id Request one parcel
 * @apiName GetParcel
 * @apiGroup Parcels
 *
 * @apiParam {Number} id parcel's unique ID.
 *
 * @apiParam (Optional query string parameters) {String} [fields] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_by] Options: id, spatial_source, user_id, time_created, time_updated
 * @apiParam (Optional query string parameters) {String} [sort_dir=ASC] Options: ASC or DESC
 * @apiParam (Optional query string parameters) {Number} [limit] integer of records to return
 * @apiParam (Optional query string parameters) {Boolean} [returnGeometry=false] integer of records to return
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

router.get('/:id', common.parseQueryOptions, function(req, res, next) {

    ctrlCommon.getWithId('parcel', 'id', req.params.id, req.queryModifiers)
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});


/**
 * @api {get} /parcels/:id Request one parcel
 * @apiName GetParcel
 * @apiGroup Parcels
 *
 * @apiParam {Number} id parcel's unique ID.
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
 * @apiSuccess {Number} response.features.properties.parcel_id parcel id
 * @apiSuccess {Number} response.features.properties.origin_id origin id
 * @apiSuccess {Number} response.features.properties.parent_id parent id
 * @apiSuccess {String} response.features.properties.version version
 * @apiSuccess {String} response.features.properties.description description
 * @apiSuccess {String} response.features.properties.date_modified YYYY-MM-DD of last update
 * @apiSuccess {Boolean} response.features.properties.active active/archived flag
 * @apiSuccess {String} response.features.properties.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.time_updated Time stamp of last update
 * @apiSuccess {Number} response.features.properties.created_by id of creator
 * @apiSuccess {Number} response.features.properties.updated_by id of updater
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/parcels/1/history
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
                "parcel_id": 1,
                "origin_id": 1,
                "parent_id": null,
                "version": 1,
                "description": "new description",
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
router.get('/:id/history', common.parseQueryOptions, function(req, res, next) {

    req.queryModifiers.returnGeometry = false;

    ctrlCommon.getWithId('parcel_history', 'parcel_id', req.params.id, req.queryModifiers)
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});

module.exports = router;