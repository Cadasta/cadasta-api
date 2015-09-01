var Q = require('q');

var common = require('../common.js');
var pgb = require('../pg-binding.js');

var controller = {};

controller.getAll = function(tablename, opts){

    var options = opts || {};
    options.queryModifiers = options.queryModifiers || {};
    options.outputFormat  = options.outputFormat || "object array";
    options.whereClause = options.whereClause || '';
    options.whereClauseValues = options.whereClauseValues || [];

    var deferred = Q.defer();

    common.tableColumnQuery(tablename)
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

    common.tableColumnQuery(tablename)
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

module.exports = controller;