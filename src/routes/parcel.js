var express = require('express');
var router = express.Router();
var pgb = require('../pg-binding');
var throwjs = require('throw.js');

/**
 * @api {get} /parcel/:id Request parcel information
 * @apiName GetParcel
 * @apiGroup Parcel
 *
 * @apiParam {Number} id parcel's unique ID.
 *
 * @apiSuccess {String} geom Geometry of the parcel as GeoJSON.
 *
 */
router.get('/:id', function(req, res, next) {

    var sqlString = "select ST_AsGeoJSON(geom) AS geom from parcel WHERE id = " + req.params.id;

    pgb.queryDeferred(sqlString)
        .then(function(result){

            // If no results send bad request error
            if(result.length === 0) {
                return next(new throwjs.badRequest());
            }

            res.status(200).json(result);

        })
        .catch(function(err){
            next(err);
        });

});

module.exports = router;