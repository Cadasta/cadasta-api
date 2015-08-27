/**
 * Created by DBaah on 8/26/15.
 */
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect;
chai.use(chaiHttp);

var testUtils = require('../test-utils/test-utils.js');

module.exports = function(app) {

    describe('Custom suite', function () {

        describe('GET /custom_get_parcels_list', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/custom/custom_get_parcels_list')
                    .end(function (res) {

                        // Test that the endpoint exists and responds
                        expect(res).to.have.status(200);

                        // Test that it returns GeoJSON
                        testUtils.expectFeatureCollection(res.body);

                        //  Get the GeoJSON features for further testing
                        var features = res.body.features;

                        // This endpoint, when pointed to test DB, should return several features
                        if(features.length > 0) {

                            // Ensure features have correct properties
                            features.forEach(function(feature){
                                expect(feature).to.have.deep.property('properties.id');
                                expect(feature).to.have.deep.property('properties.time_created');
                                expect(feature).to.have.deep.property('properties.area');
                                expect(feature).to.have.deep.property('properties.tenure_type');
                                expect(feature).to.have.deep.property('properties.num_relationships');
                            });
                        }

                        done();
                    });

            });
        });

        describe('GET /custom_get_parcels_list?tenure_type=own', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/custom/custom_get_parcels_list?tenure_type=own')
                    .end(function (res) {

                        // Test that the endpoint exists and responds
                        expect(res).to.have.status(200);

                        // Test that it returns GeoJSON
                        testUtils.expectFeatureCollection(res.body);

                        //  Get the GeoJSON features for further testing
                        var features = res.body.features;

                        // This endpoint, when pointed to test DB, should return several features
                        if(features.length > 0) {

                            // Ensure features have correct properties
                            features.forEach(function(feature){
                                expect(feature).to.have.deep.property('properties.id');
                                expect(feature).to.have.deep.property('properties.time_created');
                                expect(feature).to.have.deep.property('properties.area');
                                expect(feature).to.have.deep.property('properties.tenure_type');
                                expect(feature).to.have.deep.property('properties.num_relationships');

                                expect(feature.properties.tenure_type).to.be.instanceof(Array);
                            });
                        }

                        done();
                    });

            });
        });

    });

};