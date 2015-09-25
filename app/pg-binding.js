var pg = require('pg');
var Q = require('q');
var settings = require('./settings/settings.js').pg;

// PostGIS Connection String
var conString = "postgres://" +
    settings.user + ":" +
    settings.password + "@" +
    settings.server + ":" +
    settings.port + "/" +
    settings.database;

/**
 * Main query function to execute an SQL query; callback form.
 *
 * @type {Function}
 */
module.exports.queryCallback = function(sql, cb, opts) {

    var options = opts || {};
    var parameterizedQueryValues = options.paramValues || null;

    pg.connect(conString, function(err, client, done) {
        if(err) {
            console.error('error fetching client from pool', err);
        }
        client.query(sql, parameterizedQueryValues, function(queryerr, result) {
            done();
            if(queryerr) {
                console.error('ERROR RUNNING QUERY:', sql, queryerr);
            }
            cb((err || queryerr), (result && result.rows ? result.rows : result));
        });
    });
};

/**
 * Main query function to execute an SQL query; deferred form.
 *
 * @type {Function}
 */
module.exports.queryDeferred = function(sql, opts){

    var options = opts || {};
    var parameterizedQueryValues = options.paramValues || null;

    var deferred = Q.defer();

    pg.connect(conString, function(err, client, done) {

        if(err) {
            console.error('error fetching client from pool', err);
            deferred.reject(err);
        }

        client.query(sql, parameterizedQueryValues, function(queryerr, result) {
            done();
            if(queryerr) {
                console.error('ERROR RUNNING QUERY:', sql, queryerr);
                deferred.reject(queryerr);
            } else {
                deferred.resolve(result && result.rows ? result.rows : []);
            }
        });

    });

    return deferred.promise;
};

