/**
 * Created by rgwozdz on 8/6/15.
 */

/**
 * Function to generate GeoJSON Feature Collection from Postgres table resources.
 *
 * @type {Function}
 * @param {String} propertyColumns comma delimited of string of all non-geometric table columns to appear in GeoJSON "properties"
 * @param {Object} opts object containing optional parameters
 * @param {String} opts.geometryColumn the name of the geometry column
 * @param {String} opts.whereClause the SQL where clause by which to limit the records returned
 * @return {String} The SQL query for generating GeoJSON
 */
module.exports.featureCollectionSQL = function(table, propertyColumns, opts){

    var options = opts || {};
    var geomFragment = (typeof options.geometryColumn === "undefined" || options.geometryColumn === null) ? "NULL" : "ST_AsGeoJSON(t." + options.geometryColumn + ")::json";
    var limit = options.limit || '';
    var order_by = options.order_by || '';
    var whereClause = options.whereClause || '';
    propertyColumns = options.columns || propertyColumns;

    var sql = "SELECT row_to_json(fc) AS response "
        + "FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features "
        + "FROM (SELECT 'Feature' As type "
            + ", {{geometry}} As geometry "
            + ", row_to_json((SELECT l FROM (select {{columns}}) As l "
        + ")) As properties "
        + "FROM " + table + " As t {{where}} {{limit}} {{order_by}}) As f )  As fc;"

    return sql.replace('{{columns}}', propertyColumns)
                .replace('{{geometry}}', geomFragment)
                .replace('{{where}}', whereClause)
                .replace('{{limit}}', limit)
                .replace('{{order_by}}', order_by);
};