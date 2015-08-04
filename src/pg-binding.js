var pg = require('pg');
var Q = require('q');
var settings = require('./settings.js').pg;

// PostGIS Connection String
var conString = "postgres://" +
    settings.user + ":" +
    settings.password + "@" +
    settings.server + ":" +
    settings.port + "/" +
    settings.database;

/**
 * Main query function to execute an SQL query.
 *
 * @type {Function}
 */
module.exports.queryCallback = function(sql, cb, opts) {
    pg.connect(conString, function(err, client, done) {
        if(err) {
            console.error('error fetching client from pool', err);
        }
        client.query(sqlStr, sqlParams, function(queryerr, result) {
            done();
            if(queryerr) {
                console.error('ERROR RUNNING QUERY:', sqlStr, queryerr);
            }
            cb((err || queryerr), (result && result.rows ? result.rows : result));
        });
    });
};


module.exports.queryDeferred = function(sqlStr, opts){

    var options = opts || {};
    var sqlParams = options.sqlParams || null;

    var deferred = Q.defer();

    pg.connect(conString, function(err, client, done) {

        if(err) {
            console.error('error fetching client from pool', err);
            deferred.reject(err);
        }

        client.query(sqlStr, sqlParams, function(queryerr, result) {
            done();
            if(queryerr) {
                console.error('ERROR RUNNING QUERY:', sqlStr, queryerr);
                deferred.reject(queryerr);
            } else {
                deferred.resolve(result && result.rows ? result.rows : []);
            }
        });

    });

    return deferred.promise;
};