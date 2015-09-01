var express = require('express');
var router = express.Router();
var pgb = require('../pg-binding');
var common = require('../common.js');
var ctrlCommon = require('../controllers/common.js');

var Q = require('q');

/**
 * @api {get} /custom/get_parcels_list Parcel/Num relationships List
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
    var whereClause = '';
    var obj = {};

    if (args.tenure_type) {
        obj = createDynamicInClause('tenure_type', 'text', args.tenure_type);
        whereClause = 'WHERE ' + obj.str + '';
    } else {
        obj.uriList = [];
    }

    req.queryModifiers.sort_by = req.queryModifiers.sort_by || "time_created,id";
    req.queryModifiers.sort_dir = req.queryModifiers.sort_dir || "DESC";

    ctrlCommon.getAll("show_parcels_list", {queryModifiers: req.queryModifiers, outputFormat: 'GeoJSON', whereClause: whereClause, whereClauseValues: obj.uriList})
        .then(function(result){

            res.status(200).json(result[0].response);

        })
        .catch(function(err){
            next(err);
        })
        .done();

});

function createDynamicInClause(key, dataType, valArr) {

    var obj = {};

    obj.uriList = valArr.split(',');

    obj.str = obj.uriList.map(function (val, i) {

            return key + '::' + dataType + '[] @> ARRAY[$' + (i + 1) + ']';

        })
        .join(' OR ');

    return obj;
}

/**
 * @api {get} /custom/get_parcel_details/:id Request parcel details for UI rendering; limits relationships and history to 10 items
 * @apiName GetParcelDetails
 * @apiGroup Custom
 *
 * @apiParam {Number} id parcel's unique ID.
 *
 *
 * @apiSuccess {Object} response A feature collection with one feature representing a parcel
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
 * @apiSuccess {Array} response.features.properties.parcel_history
 * @apiSuccess {Number} response.features.properties.parcel_history.id history id
 * @apiSuccess {Number} response.features.properties.parcel_history.parcel_id parcel id
 * @apiSuccess {Number} response.features.properties.parcel_history.origin_id origin id
 * @apiSuccess {Number} response.features.properties.parcel_history.parent_id parent id
 * @apiSuccess {String} response.features.properties.parcel_history.version version
 * @apiSuccess {String} response.features.properties.parcel_history.description description
 * @apiSuccess {String} response.features.properties.parcel_history.date_modified YYYY-MM-DD of last update
 * @apiSuccess {Boolean} response.features.properties.parcel_history.active active/archived flag
 * @apiSuccess {String} response.features.properties.parcel_history.time_created Time stamp of creation
 * @apiSuccess {String} response.features.properties.parcel_history.time_updated Time stamp of last update
 * @apiSuccess {Number} response.features.properties.parcel_history.created_by id of creator
 * @apiSuccess {Number} response.features.properties.parcel_history.updated_by id of updater
 * @apiSuccess {Array} response.features.properties.relationships
 * @apiSuccess {Number} response.features.properties.relationships.id
 * @apiSuccess {Number} response.features.properties.relationships.parcel_id
 * @apiSuccess {Number} response.features.properties.relationships.party_id
 * @apiSuccess {Number} response.features.properties.relationships.geom_id
 * @apiSuccess {Number} response.features.properties.relationships.tenure_type
 * @apiSuccess {Number} response.features.properties.relationships.acquired_date
 * @apiSuccess {Number} response.features.properties.relationships.how_acquired
 * @apiSuccess {Number} response.features.properties.relationships.active
 * @apiSuccess {Number} response.features.properties.relationships.time_created
 * @apiSuccess {Number} response.features.properties.relationships.time_updated
 * @apiSuccess {Number} response.features.properties.relationships.created_by
 * @apiSuccess {Number} response.features.properties.relationships.updated_by
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost/custom/get_parcel_detailss/1
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
                  -73.724739,
                  40.588342
                ]
              },
              "properties": {
                "id": 1,
                "spatial_source": 1,
                "user_id": "11",
                "area": null,
                "land_use": null,
                "gov_pin": null,
                "active": true,
                "sys_delete": false,
                "time_created": "2015-09-01T09:53:16.466337-07:00",
                "time_updated": null,
                "created_by": 11,
                "updated_by": null,
                "parcel_history": [
                  {
                    "id": 1,
                    "parcel_id": 1,
                    "origin_id": 1,
                    "parent_id": null,
                    "version": 1,
                    "description": "new description",
                    "date_modified": "2015-09-01T07:00:00.000Z",
                    "active": true,
                    "time_created": "2015-09-01T16:53:16.466Z",
                    "time_updated": null,
                    "created_by": 11,
                    "updated_by": null
                  }
                ],
                "relationships": [
                  {
                    "id": 1,
                    "parcel_id": 1,
                    "party_id": 1,
                    "geom_id": null,
                    "tenure_type": 1,
                    "acquired_date": null,
                    "how_acquired": null,
                    "active": true,
                    "sys_delete": false,
                    "time_created": "2015-09-01T16:53:16.466Z",
                    "time_updated": null,
                    "created_by": 11,
                    "updated_by": null
                  }
                ]
              }
            }
          ]
        }
 */

router.get('/get_parcel_details/:id', common.parseQueryOptions, function(req, res, next) {

    Q.all([
        ctrlCommon.getWithId('parcel', 'id', req.params.id, {queryModifiers: {returnGeometry: true}, outputFormat: "GeoJSON"}),
        ctrlCommon.getWithId('parcel_history', 'parcel_id', req.params.id, {queryModifiers: {limit: 'LIMIT 10', sort_by: 'time_updated', sort_dir: 'DESC'}}),
        ctrlCommon.getWithId('show_relationships', 'parcel_id', req.params.id, {queryModifiers: {limit: 'LIMIT 10', sort_by: 'time_created', sort_dir: 'DESC'}})
        ])
        .then(function (results) {

            //Process results: Add parcel history and relationships to Parcel GeoJSON
            var geoJSON = results[0][0].response;

            // If Id return no parcel, message the user
            if(geoJSON.features.length === 0) {
                return res.status(200).json({message: "no parcel"});
            }

            // Add properties to parcel's geojson
            geoJSON.features[0].properties.parcel_history = results[1];
            geoJSON.features[0].properties.relationships = results[2];

            res.status(200).json(geoJSON);
        })
        .catch(function(err){
            next(err)
        })
        .done();



});


module.exports = router;
