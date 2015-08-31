var Q = require('q');

var common = require('../common.js');
var pgb = require('../pg-binding.js');

var controller = {};

controller.getAll = function(tablename, queryModifiers){

    var deferred = Q.defer();

    common.tableColumnQuery(tablename)
        .then(function(response){

            var sql = common.featureCollectionSQL(tablename,  queryModifiers);

            return pgb.queryDeferred(sql);
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

controller.getWithId = function(tablename, idKey, idValue, queryModifiers){

    var deferred = Q.defer();

    common.tableColumnQuery(tablename)
        .then(function(response){

            var sql = common.featureCollectionSQL(tablename,  queryModifiers, "WHERE " + idKey + " = $1");

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