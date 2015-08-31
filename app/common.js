var Q = require('q');
var pgBinding = require('./pg-binding');
var settings = require('./settings/settings.js');
var columnLookup = require('./endpoint-column-lookup.js');
var errors = require('./errors.js');
var common = {};

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

common.parseQueryOptions = function(req, res, next) {

    var queryModifiers = {};
    
    try {

        if(req.query.hasOwnProperty('fields')) {

            queryModifiers.fields = req.query.fields;

        }

        queryModifiers.returnGeometry = false;

        if(req.query.hasOwnProperty('returnGeometry')/* && columnLookup[req.baseUrl].geometry*/ ) {

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
    var columns = 't.*';

    if(typeof modifiers.fields !== 'undefined') {

        columnLookup._validate(table, modifiers.fields);

        columns = '(SELECT l FROM (select ' + modifiers.fields + ') As l)';

    }

    if(typeof modifiers.sort_by !== 'undefined') {

        columnLookup._validate(table, modifiers.sort_by);

        order_by = 'ORDER BY ' + modifiers.sort_by.split(',')
                                            .map(function(col){
                                                return col + ' ' + modifiers.sort_dir;
                                            })
                                            .join(',');

    }

    var sql = "SELECT row_to_json(fc) AS response "
        + "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
        + "FROM (SELECT 'Feature' As type, {{geometry}} As geometry "
        + ", row_to_json({{columns}})  As properties FROM " + table + " As t {{where}} {{order_by}} {{limit}}) As f )  As fc;"


    sql = sql.replace('{{columns}}', columns)
        .replace('{{geometry}}', geomFragment)
        .replace('{{where}}', whereClause)
        .replace('{{limit}}', limit)
        .replace('{{order_by}}', order_by);

    return sql;
};

common.tableColumnQuery = function(tablename) {

    var deferred = Q.defer();

    // First time here, load column names into lookup file
    if(columnLookup.hasOwnProperty(tablename)) {
        deferred.resolve(true);
        return deferred.promise;

    }

    var sql = "SELECT json_agg(CAST(column_name AS text)) as column_name  FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '" + tablename + "' AND column_name <> 'geom';"

    pgBinding.queryDeferred(sql)
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

common.sanitize = function (val) {
    // we want a null to still be null, not a string
    if (typeof val === 'string' && val !== 'null') {
        // $nh9$ is using $$ with an arbitrary tag. $$ in pg is a safe way to quote something,
        // because all escape characters are ignored inside of it.
        var esc = settings.pg.escapeStr;
        return "$" + esc + "$" + val + "$" + esc + "$";
    }
    return val;
};

module.exports = common;