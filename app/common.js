var columnLookup = require('./endpoint-column-lookup.js');
var common = module.exports = {};

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

    function OptionError(message) {
        this.name = 'URL option error';
        this.message = message || 'Error.';
        this.stack = (new Error()).stack;
    }

    var queryModifiers = {};

    var allFields = columnLookup[req.baseUrl].properties || null;
    
    try {

        queryModifiers.fields = allFields.join(',');

        if(req.query.hasOwnProperty('fields') && allFields) {

            var selectedFieldsArr = req.query.fields.split(',');

            selectedFieldsArr.forEach(function(field){

                if(allFields.indexOf(field) === -1) {
                    throw new OptionError("Bad Request; invalid 'fields' option");
                }

            });

            queryModifiers.fields = req.query.fields;

        }

        queryModifiers.returnGeometry = false;
        queryModifiers.geometryColumn = null;

        if(req.query.hasOwnProperty('returnGeometry') && columnLookup[req.baseUrl].geometry ) {

            if(['true', 'false'].indexOf(req.query.returnGeometry) === -1) {
                throw new OptionError("Bad Request; invalid 'returnGeom' option");
            }

            if(req.query.returnGeometry=== 'true') {
                queryModifiers.returnGeometry = true;
                queryModifiers.geometryColumn = columnLookup[req.baseUrl].geometry;
            }
        }

        if(req.query.hasOwnProperty('limit')) {

            if(!common.isInteger(Number(req.query.limit))) {

                throw new OptionError("Bad Request; invalid 'limit' option");
            }

            queryModifiers.limit = "LIMIT " + req.query.limit;
        }

        if(req.query.hasOwnProperty('sort_by')) {

            var orderByArr = req.query.sort_by.split(',');

            orderByArr.every(function(field){

                if(allFields.indexOf(field) === -1) {
                    throw new OptionError("Bad Request; invalid 'order_by' option");
                }

            });

            queryModifiers.order_by = 'ORDER BY ' + req.query.sort_by;
        }


        if(req.query.hasOwnProperty('sort_dir')) {

            var orders = ['ASC', 'DESC'];

            if(orders.indexOf(req.query.sort_dir) === -1) {
                throw new OptionError("Bad Request; invalid 'order' option");
            }

            if(queryModifiers.order_by) {
                queryModifiers.order_by = queryModifiers.order_by + ' ' + req.query.sort_dir;
            }
        }
    }
    catch(e){

        if (e instanceof OptionError) {
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
    var geomFragment = (typeof modifiers.geometryColumn === "undefined" || modifiers.geometryColumn === null) ? "NULL" : "ST_AsGeoJSON(t." + modifiers.geometryColumn + ")::json";
    var limit = modifiers.limit || '';
    var order_by = modifiers.order_by || '';
    var whereClause = where || '';
    var columns = modifiers.fields;

    var sql = "SELECT row_to_json(fc) AS response "
        + "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
        + "FROM (SELECT 'Feature' As type "
        + ", {{geometry}} As geometry "
        + ", row_to_json((SELECT l FROM (select {{columns}}) As l "
        + ")) As properties "
        + "FROM " + table + " As t {{where}} {{order_by}} {{limit}}) As f )  As fc;"

    return sql.replace('{{columns}}', columns)
        .replace('{{geometry}}', geomFragment)
        .replace('{{where}}', whereClause)
        .replace('{{limit}}', limit)
        .replace('{{order_by}}', order_by);
};