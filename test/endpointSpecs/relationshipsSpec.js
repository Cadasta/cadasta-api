var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect;
chai.use(chaiHttp);

var testUtils = require('../test-utils/test-utils.js');

module.exports = function(app) {

    describe('Relationships suite', function () {

        describe('GET /relationships', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/relationships')
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

                                expect(feature).to.have.deep.property('properties.relationship_id');
                                expect(feature).to.have.deep.property('properties.spatial_source');
                                expect(feature).to.have.deep.property('properties.relationship_type');
                                expect(feature).to.have.deep.property('properties.parcel_id');
                                expect(feature).to.have.deep.property('properties.party_id');
                                expect(feature).to.have.deep.property('properties.first_name');
                                expect(feature).to.have.deep.property('properties.last_name');
                                expect(feature).to.have.deep.property('properties.time_created');
                            });
                        }

                        done();
                    });

            });
        });

        describe('GET /relationships/1', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/relationships/1')
                    .end(function (res) {

                        // Test that the endpoint exists and responds
                        expect(res).to.have.status(200);

                        // Test that it returns GeoJSON
                        testUtils.expectFeatureCollection(res.body);

                        //  Get the GeoJSON features for further testing
                        var features = res.body.features;

                        // Make sure only one feature returned
                        expect(features).with.length(1);

                        // Check properties
                        var featureProperties = features[0].properties;
                        expect(featureProperties).to.have.property('relationship_id', 1);
                        expect(featureProperties).to.have.property('spatial_source', "survey_sketch");
                        expect(featureProperties).to.have.property('relationship_type', 'own');
                        expect(featureProperties).to.have.property('party_id', 1);
                        expect(featureProperties).to.have.property('first_name', 'Thurmond');
                        expect(featureProperties).to.have.property('last_name', 'Thomas');
                        expect(featureProperties).to.have.property('parcel_id', 1);
                        expect(featureProperties).to.have.property('time_created');

                        var featureGeometry = features[0].geometry;


                        done();
                    });

            });
        });

        describe('GET /relationship/1/history', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/relationships/1/history')
                    .end(function (res) {

                        // Test that the endpoint exists and responds
                        expect(res).to.have.status(200);

                        // Test that it returns GeoJSON
                        testUtils.expectFeatureCollection(res.body);

                        //  Get the GeoJSON features for further testing
                        var features = res.body.features;

                        // Make sure only one feature returned
                        expect(features).with.length(1);

                        // Check properties
                        var featureProperties = features[0].properties;

                        expect(featureProperties).to.have.property('id');
                        expect(featureProperties).to.have.property('relationship_id');
                        expect(featureProperties).to.have.property('origin_id');
                        expect(featureProperties).to.have.property('parent_id');
                        expect(featureProperties).to.have.property('version', 1);
                        expect(featureProperties).to.have.property('expiration_date');
                        expect(featureProperties).to.have.property('description');
                        expect(featureProperties).to.have.property('date_modified');
                        expect(featureProperties).to.have.property('active');
                        expect(featureProperties).to.have.property('time_created');
                        expect(featureProperties).to.have.property('time_updated');
                        expect(featureProperties).to.have.property('created_by');
                        expect(featureProperties).to.have.property('updated_by');

                        done();
                    });

            });
        });
    });

};