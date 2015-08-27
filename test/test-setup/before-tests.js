var pg = require('pg');
var Q = require('q');
var fs = require('fs');

var testData = require('../../node_modules/cadasta-data-transformer/tests/data/form.js');

// Get DB settings for the requested environment
var settings = require('../../app/settings/environment-settings.js').testing;

var DataTransformer = require('../../node_modules/cadasta-data-transformer');
var ingestion_engine = DataTransformer(settings);

var dbSettings = settings.pg;

// build DB connection string
var conString = "postgres://" +
    dbSettings.user + ":" +
    dbSettings.password + "@" +
    dbSettings.server + ":" +
    dbSettings.port + "/" +
    dbSettings.database;



/**
 * Query function to execute an SQL query against Postgres DB.
 *
 * @type {Function}
 */
function query(queryStr) {

    var deferred = Q.defer();

    pg.connect(conString, function(err, client, done) {
        if(err) {
            console.error('error fetching client from pool', err);
        }
        client.query(queryStr, function(queryerr, result) {

            done();

            if(queryerr) {
                //console.error('ERROR RUNNING QUERY:', queryStr, queryerr);
                deferred.reject(queryerr);
            } else {
                deferred.resolve(result && result.rows ? result.rows : result);
            }



        });
    });

    return deferred.promise;
};

var sanitize = function (val) {
    // we want a null to still be null, not a string
    if (typeof val === 'string' && val !== 'null') {
        // $nh9$ is using $$ with an arbitrary tag. $$ in pg is a safe way to quote something,
        // because all escape characters are ignored inside of it.
        var esc = dbSettings.escapeStr;
        return "$" + esc + "$" + val + "$" + esc + "$";
    }
    return val;
};

module.exports = function(){

    var deferred = Q.defer();

    query("SELECT truncate_db_tables();")
        .then(function(response){
            console.log("Tables truncated.");

            return ingestion_engine.formProcessor.load(testData.form);

        })
        .then(function(surveyId){
            // clean up form data
            var results = sanitize(JSON.stringify(testData.form.results));

            return ingestion_engine.dataProcessor.load(results);
        })
        .then(function(response){

            console.log('Test survey and responses loaded successfully.');
            deferred.resolve(true);

        })
        .catch(function(err){

            deferred.reject(err);
        })
        .done();

    return deferred.promise;

};
