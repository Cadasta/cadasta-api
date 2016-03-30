var Q = require('q');
var columnLookup = require('../column-lookup.js');
var common = require('../common.js');
var pgb = require('../pg-binding.js');

var controller = {};


var tableColumnQuery = controller.tableColumnQuery = function(tablename) {

    var deferred = Q.defer();

    // First time here, load column names into lookup file
    if(columnLookup.hasOwnProperty(tablename)) {
        deferred.resolve(true);
        return deferred.promise;
    }

    var sql = "SELECT json_agg(CAST(column_name AS text)) as column_name  FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '" + tablename + "' AND column_name <> 'geom';"

    pgb.queryDeferred(sql)
        .then(function(response){
            columnLookup[tablename] = response[0].column_name;
            deferred.resolve(true);
        })
        .catch(function(e){
            deferred.reject(e)
        })
        .done();

    return deferred.promise;
};


controller.getAll = function(tablename, opts){

    var options = opts || {};
    options.queryModifiers = options.queryModifiers || {};
    options.outputFormat  = options.outputFormat || "object array";
    options.whereClause = options.whereClause || '';
    options.whereClauseValues = options.whereClauseValues || [];

    var deferred = Q.defer();

    tableColumnQuery(tablename)
        .then(function(response){

            var sql;

            if(options.outputFormat === 'GeoJSON')
                sql = common.featureCollectionSQL(tablename,  options.queryModifiers, options.whereClause);
            else
                sql = common.objectArraySQL(tablename,  options.queryModifiers, options.whereClause);

            return pgb.queryDeferred(sql, {paramValues: options.whereClauseValues});
        })
        .then(function(result){

            deferred.resolve(result)

        })
        .catch(function(err){
            deferred.reject(err);
        })
        .done();

    return deferred.promise;

};

controller.getWithId = function(tablename, idKey, idValue, opts){

    var options = opts || {};
    options.queryModifiers = options.queryModifiers || {};
    options.outputFormat  = options.outputFormat || "object array";

    var deferred = Q.defer();

    tableColumnQuery(tablename)
        .then(function(response){

            var sql;

            if(options.outputFormat === 'GeoJSON')
                sql = common.featureCollectionSQL(tablename,  options.queryModifiers, "WHERE " + idKey + " = $1");
            else
                sql = common.objectArraySQL(tablename,  options.queryModifiers, "WHERE " + idKey + " = $1");


            return pgb.queryDeferred(sql,{paramValues: [idValue]});
        })
        .then(function(result){

            deferred.resolve(result)

        })
        .catch(function(err){
            deferred.reject(err);
        })
        .done();

    return deferred.promise;

};


controller.getIntersectsWithId = function(tablename, idKey, idValue, projectId, opts){

    var options = opts || {};
    options.queryModifiers = options.queryModifiers || {};
    options.outputFormat  = options.outputFormat || "object array";

    var deferred = Q.defer();

    tableColumnQuery(tablename)
        .then(function(response){

            var sql;
            var geom = JSON.stringify(options.geom);

            if(options.outputFormat === 'GeoJSON')
                // select all project parcels that intersect with the geom excluding the parcel with the specified id.
                sql = common.featureCollectionSQL(tablename, options.queryModifiers, "WHERE st_intersects(st_buffer(st_geomfromgeojson('" + geom + "')," + options.buffer + " ), t.geom::geography) AND project_id = $1 AND " + idKey + " <> $2");
            else
                sql = common.objectArraySQL(tablename,  options.queryModifiers, "WHERE " + idKey + " = $1");
            return pgb.queryDeferred(sql,{paramValues: [projectId, idValue]});
        })
        .then(function(result){

            deferred.resolve(result)

        })
        .catch(function(err){
            deferred.reject(err);
        })
        .done();

    return deferred.promise;

};

controller.getIntersectsWithBBox = function(tablename, idKey, idValue, xmin, ymin, xmax, ymax, opts){

    var options = opts || {};
    options.queryModifiers = options.queryModifiers || {};
    options.outputFormat  = options.outputFormat || "object array";
    var bbox = 'POLYGON((' + xmin + ' ' + ymin + ', ' + xmin + ' ' + ymax + ', '
                        + xmax + ' ' + ymax + ', ' + xmax + ' ' + ymin + ', '
                        + xmin + ' ' + ymin + '))';

    var deferred = Q.defer();

    tableColumnQuery(tablename)
        .then(function(response){

            var sql;
            if(options.outputFormat === 'GeoJSON')
                // select all parcels that lies within the provided bounding box
                sql = common.featureCollectionSQL(tablename, options.queryModifiers, "WHERE st_intersects(t.geom, st_geomfromtext('" + bbox + "', 4326)) AND " + idKey + " = $1");
            else
                sql = common.objectArraySQL(tablename,  options.queryModifiers, "WHERE " + idKey + " = $1");
            return pgb.queryDeferred(sql,{paramValues: [idValue]});
        })
        .then(function(result){

            deferred.resolve(result)

        })
        .catch(function(err){
            deferred.reject(err);
        })
        .done();

    return deferred.promise;

};

controller.getCountWithId = function(tablename, idKey, opts){

    var options = opts || {};
    options.queryModifiers = options.queryModifiers || {};
    var whereClause = options.whereClause;
    var whereClauseValues = options.whereClauseValues;
    var deferred = Q.defer();

    tableColumnQuery(tablename)
        .then(function(response){

            var sql = 'SELECT COUNT(' + idKey + ') FROM ' + tablename + ' ' + whereClause + ';';
            return pgb.queryDeferred(sql, {paramValues: whereClauseValues});
        })
        .then(function(result){

            deferred.resolve(result)

        })
        .catch(function(err){
            deferred.reject(err);
        })
        .done();

    return deferred.promise;

};


controller.sanitize = function (val) {
    // we want a null to still be null, not a string
    if (typeof val === 'string' && val !== 'null') {
        // $nh9$ is using $$ with an arbitrary tag. $$ in pg is a safe way to quote something,
        // because all escape characters are ignored inside of it.
        var esc = 'anystr';
        return "$" + esc + "$" + val + "$" + esc + "$";
    }
    return val;
};

module.exports = controller;
