/**
 * Created by rgwozdz on 8/15/15.
 */

var moduleUnderTest = require("../../app/common.js")
var assert = require('chai').assert;

describe('common.js module', function() {
    describe('parseQueryOptions', function () {
        it('should return expected Object with properties and values', function () {

            var result = moduleUnderTest.parseQueryOptions({fields:'a,b', limit: 2, order_by: 'a,b', order:'DESC', returnGeom:'false'}, {
                columns: 'a,b,c',
                geometryColumn: null });

            var expectedResult = {
                columns: 'a,b',
                geometryColumn: null,
                limit: 'LIMIT 2',
                order_by: 'ORDER BY a,b'
            };

            assert.equal(JSON.stringify(result), JSON.stringify(expectedResult));

        });

        it('should return expected Object with properties and values', function () {

            var result = moduleUnderTest.parseQueryOptions({}, {
                columns: 'a,b,c',
                geometryColumn: 'geom'});

            var expectedResult = {
                columns: 'a,b,c',
                geometryColumn: null
            };

            assert.equal(JSON.stringify(result), JSON.stringify(expectedResult));

        });

    });
});
