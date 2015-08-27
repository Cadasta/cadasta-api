/**
 * Created by rgwozdz on 8/6/15.
 */

/**
 * Function to generate GeoJSON Feature Collection from Postgres table resources.
 *
 * @type {Function}
 * @param {String} propertyColumns comma delimited of string of all non-geometric table columns to appear in GeoJSON "properties"
 * @param {Object} mods, where object containing optional parameters
 * @param {String} mods, where.geometryColumn the name of the geometry column
 * @param {String} mods, where.whereClause the SQL where clause by which to limit the records returned
 * @return {String} The SQL query for generating GeoJSON
 */
module.exports.featureCollectionSQL = function(table, mods, where){

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