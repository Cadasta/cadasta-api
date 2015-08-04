var pg = require('pg');
var settings = require('./settings').pg;

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
module.exports.queryCallback = function(sqlStr, cb) {
    pg.connect(conString, function(err, client, done) {
        if(err) {
            console.error('error fetching client from pool', err);
        }
        client.query(sqlStr, function(queryerr, result) {
            done();
            if(queryerr) {
                console.error('ERROR RUNNING QUERY:', sqlStr, queryerr);
            }
            cb((err || queryerr), (result && result.rows ? result.rows : result));
        });
    });
};


module.exports.queryDeferred = function(sqlStr, sqlParams){

    var sqlPars = sqlParams || null;

    var deferred = Q.defer();

    pg.connect(conString, function(err, client, done) {

        if(err) {
            console.error('error fetching client from pool', err);
            deferred.reject(err);
        }

        client.query(sqlStr, function(queryerr, result) {
            done();
            if(queryerr) {
                console.error('ERROR RUNNING QUERY:', sqlStr, queryerr);
                deferred.reject(queryerr);
            } else {
                deferred.resolve(result && result.rows ? result.rows : result);
            }
        });

    });

    return deferred.promise;
};