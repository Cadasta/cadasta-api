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
        client.query(sql, paramValues, function(queryerr, result) {
            done();
            if(queryerr) {
                console.error('ERROR RUNNING QUERY:', sqlStr, queryerr);
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

module.exports.sanitize = function (val) {
    // we want a null to still be null, not a string
    if (typeof val === 'string' && val !== 'null') {
        // $nh9$ is using $$ with an arbitrary tag. $$ in pg is a safe way to quote something,
        // because all escape characters are ignored inside of it.
        var esc = settings.escapeStr;
        return "$" + esc + "$" + val + "$" + esc + "$";
    }
    return val;
};