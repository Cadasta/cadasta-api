var pg = require('pg');
var Q = require('q');
var fs = require('fs');
var exec = require('child_process').exec;

// Valid environments upon which to execute the DB nuking and recreation
var validEnvironments = ['development', 'testing'];

// Default environment is testing
var environmentType = process.argv[2] || 'testing';

// Check for valid environment arg
if(validEnvironments.indexOf(environmentType) === -1) {
    console.error('Invalid environment arg: ' + environmentType);
    return;
}

// Get DB settings for the requested environment
var settings = require('./src/deployment-config.json').environment[environmentType].pg;

// build DB connection string
var conString = "postgres://" +
    settings.user + ":" +
    settings.password + "@" +
    settings.server + ":" +
    settings.port + "/" +
    settings.database;

/**
 * This destroys the current database and recreates a
 * fresh one with no tables or functions added yet...
 */
function nukeDB(cb) {
    var db = settings.database;
    var kill = 'psql -d ' + db + ' -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = \'' + db
        + '\' AND pid <> pg_backend_pid()";';
    var drop = 'dropdb ' + db;
    var create = 'createdb ' + db + ' -O ' + settings.user;

    exec(kill, function(error, stdout, stderr) {

        exec(drop, function(error, stdout, stderr) {
            if (stderr) console.error(stderr);

            exec(create, function (error, stdout, stderr) {
                if (stderr) console.error(stderr);

                else console.log('db nuked and recreated.');

                if (typeof cb === 'function') {
                    cb();
                }
            });
        });
    });
}

/**
 * Search thru the SQL and replaces all templated instance with appropriate value
 * @param sqlFile
 * @param tplHash
 * @returns {*}
 */
function sqlTemplate(sqlFile, tplHash) {

    var sql = fs.readFileSync(sqlFile, 'utf8');

    if (tplHash) {
        for (var key in tplHash) {
            var exp = '{{' + key + '}}';
            var regex = new RegExp(exp, 'g');
            var val = tplHash[key];
            sql = sql.replace(regex, val);
        }
    }
    return sql;
};

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

/**
 *  This builds out the new database
 */
function setupDB() {
    var q1 = fs.readFileSync('db/sql/1_db.sql', 'utf8');
    var q2 = fs.readFileSync('db/sql/2_survey-tables.sql', 'utf8');

    query(q1)
        .then(function(){

            console.log('db/sql/1_db.sql complete.');
            return query(q2);
        })
        .then(function(){

            console.log('db/sql/2_survey-tables.sql complete.');
            return;

        })
        .catch(function(err){

            console.error(err);
        })

}

nukeDB(setupDB);