var Q = require('q');
var settings = require('./settings/settings.js');
var envSettings = require('./settings/environment-settings.js');
var columnLookup = require('./column-lookup.js');
var errors = require('./errors.js');
var common = {};
var pg = require('pg');

// PostGIS Connection String
var conString = "postgres://" +
    envSettings.development.pg.user + ":" +
    envSettings.development.pg.password + "@" +
    envSettings.development.pg.server + ":" +
    envSettings.development.pg.port + "/" +
    envSettings.development.pg.database;

common.getArguments = function (req) {
    var args;

    //Grab POST or QueryString args depending on type
    if (req.method.toLowerCase() == "post") {
        //If a post, then arguments will be members of the this.req.body property
        args = req.body;
    } else if (req.method.toLowerCase() == "get") {
        //If request is a get, then args will be members of the this.req.query property
        args = req.query;
    }
    return args;
};

common.isInteger = function(x){
    return Math.round(x) === x;
};

common.createDynamicInArrayClause = function(key, dataType, vals, startIndex) {

    startIndex = startIndex || 0;

    var str = vals.split(',')
                .map(function (val, i) {

                    return key + '::' + dataType + '[] @> ARRAY[$' + (startIndex + i + 1) + ']';

                })
                .join(' OR ');

    return '(' + str + ')';
};

common.createDynamicInClause = function(key, vals, startIndex) {

    startIndex = startIndex || 0;

    var str = vals.split(',')
        .map(function (val, i) {

            return '$' + (startIndex + i + 1);

        })
        .join(',');

    return key + ' IN (' + str + ')';
};

common.parseQueryOptions = function(req, res, next) {

    var queryModifiers = {};
    
    try {

        if(req.query.hasOwnProperty('fields')) {

            queryModifiers.fields = req.query.fields;

        }

        queryModifiers.returnGeometry = false;

        if(req.query.hasOwnProperty('returnGeometry') ) {

            if(['true', 'false'].indexOf(req.query.returnGeometry) === -1) {
                throw new errors.OptionError("Bad Request; invalid 'returnGeom' option");
            }

            if(req.query.returnGeometry=== 'true') {
                queryModifiers.returnGeometry = true;
            }
        }

        if(req.query.hasOwnProperty('limit')) {

            if(!common.isInteger(Number(req.query.limit))) {

                throw new errors.OptionError("Bad Request; invalid 'limit' option");
            }

            queryModifiers.limit = "LIMIT " + req.query.limit;
        }

        if(req.query.hasOwnProperty('sort_by')) {

            queryModifiers.sort_by = req.query.sort_by;

        }


        if(req.query.hasOwnProperty('sort_dir')) {

            var orders = ['ASC', 'DESC'];

            if(orders.indexOf(req.query.sort_dir) === -1) {
                throw new errors.OptionError("Bad Request; invalid 'sort_dir' option");
            }

            queryModifiers.sort_dir = req.query.sort_dir;

        }

    }
    catch(e){

        if (e instanceof errors.OptionError) {
            console.error(e.stack);
            res.status(400).json({message: e.message});
        } else {
            res.status(500).json({message: "Internal Server Error"});
            console.error(e.stack);
        }

    }

    req.queryModifiers = queryModifiers;

    next();

};

common.featureCollectionSQL = function(table, mods, where){

    var modifiers = mods || {};
    var geomFragment = (modifiers.returnGeometry) ? "ST_AsGeoJSON(t.geom)::json" :"NULL";
    var limit = modifiers.limit || '';
    var whereClause = where || '';

    var order_by ='';
    var columns = '(SELECT l FROM (select ' + columnLookup[table].join(',') + ') As l)';

    if(typeof modifiers.fields !== 'undefined') {

        columnLookup._validate(table, modifiers.fields);

        columns = '(SELECT l FROM (select ' + modifiers.fields + ') As l)';

    }

    if(typeof modifiers.sort_by !== 'undefined') {

        columnLookup._validate(table, modifiers.sort_by);

        order_by = 'ORDER BY ' + modifiers.sort_by.split(',')
                                            .map(function(col){
                                                return col + ' ' + (modifiers.sort_dir || '');
                                            })
                                            .join(',');

    }

    var sql = "SELECT row_to_json(fc) AS response "
        + "FROM ( SELECT 'FeatureCollection' As type, COALESCE(array_to_json(array_agg(f)), '[]') As features "
        + "FROM (SELECT 'Feature' As type, {{geometry}} As geometry "
        + ", row_to_json({{columns}})  As properties FROM " + table + " As t {{where}} {{order_by}} {{limit}}) As f )  As fc;"


    sql = sql.replace('{{columns}}', columns)
        .replace('{{geometry}}', geomFragment)
        .replace('{{where}}', whereClause)
        .replace('{{limit}}', limit)
        .replace('{{order_by}}', order_by);

    return sql;
};

common.objectArraySQL = function(table, mods, where){

    var modifiers = mods || {};
    var geomFragment = (modifiers.returnGeometry) ? "ST_AsGeoJSON(t.geom)::json" : null;
    var limit = modifiers.limit || '';
    var whereClause = where || '';

    var order_by ='';
    var columns = columnLookup[table].join(',');

    if(typeof modifiers.fields !== 'undefined') {

        columnLookup._validate(table, modifiers.fields);

        columns = modifiers.fields;

    }

    if(geomFragment) {
        columns += ',' + geomFragment;
    }


    if(typeof modifiers.sort_by !== 'undefined') {

        columnLookup._validate(table, modifiers.sort_by);

        order_by = 'ORDER BY ' + modifiers.sort_by.split(',')
                .map(function(col){
                    return col + ' ' + modifiers.sort_dir;
                })
                .join(',');

    }

    var sql = "SELECT {{columns}} FROM {{table}} {{where}} {{order_by}} {{limit}};"


    sql = sql.replace('{{columns}}', columns)
        .replace('{{table}}', table)
        .replace('{{where}}', whereClause)
        .replace('{{limit}}', limit)
        .replace('{{order_by}}', order_by);

    return sql;
};

/*
common.query = function (queryStr, cb) {
    pg.connect(conString, function (err, client, done) {
        if (err) {
            console.error('error fetching client from pool', err);
        }

        client.on('notification', function(msg){
            console.log(msg);
        });

        client.query(queryStr, function (queryerr, result) {
            done();
            if (queryerr) {
                console.error('ERROR RUNNING QUERY:', queryStr, queryerr);
            }
            cb((err || queryerr), (result && result.rows ? result.rows : result));
        });

    });
};
*/

module.exports = common;