/**
 * Created by rgwozdz on 8/15/15.
 */

var moduleUnderTest = require("../../app/common.js")
var assert = require('chai').assert;

describe('common.js module', function() {
    describe('featureCollectionSQL', function () {
        it('should return expected SQL string with all options (geom and where clause)', function () {

            var result = moduleUnderTest.featureCollectionSQL("testTable",{fields: "testCol1,testCol2", geometryColumn: "testGeomCol"}, 'WHERE id = $1');

            var expectedResult = "SELECT row_to_json(fc) AS response FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type , ST_AsGeoJSON(t.testGeomCol)::json As geometry , row_to_json((SELECT l FROM (select testCol1,testCol2) As l )) As properties FROM testTable As t WHERE id = $1  ) As f )  As fc;";

            assert.equal(result, expectedResult);

        });

        it('should return expect SQL string with no options (no geom or where clause)', function () {

            var result = moduleUnderTest.featureCollectionSQL("testTable",{fields: "testCol1,testCol2"});

            var expectedResult = "SELECT row_to_json(fc) AS response FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type , NULL As geometry , row_to_json((SELECT l FROM (select testCol1,testCol2) As l )) As properties FROM testTable As t   ) As f )  As fc;";

            assert.equal(result, expectedResult);

        });

    });
});
