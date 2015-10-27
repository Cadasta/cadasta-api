/**
 * Created by DBaah on 8/26/15.
 */
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect;
chai.should();
chai.use(chaiHttp);

var testUtils = require('../test-utils/test-utils.js');

module.exports = function(app) {

    describe('Custom suite', function () {

        describe('GET /show_activity', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/show_activity')
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
                                expect(feature).to.have.deep.property('properties.activity_type');
                                expect(feature).to.have.deep.property('properties.type');
                                expect(feature).to.have.deep.property('properties.name');
                                expect(feature).to.have.deep.property('properties.parcel_id');
                                expect(feature).to.have.deep.property('properties.time_created');
                            });
                        }

                        done();
                    });

            });
        });

        describe('GET /show_parcels_list', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/show_parcels_list')
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

        describe('GET /show_parcels_list?tenure_type=own', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/show_parcels_list?tenure_type=own')
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

        describe('GET /show_relationships', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/show_relationships')
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
                                expect(feature).to.have.deep.property('properties.spatial_source');
                                expect(feature).to.have.deep.property('properties.tenure_type');
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

        describe('GET /show_relationships/1', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/show_relationships/1')
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
                        expect(featureProperties).to.have.property('spatial_source');
                        expect(featureProperties).to.have.property('tenure_type');
                        expect(featureProperties).to.have.property('party_id');
                        expect(featureProperties).to.have.property('first_name');
                        expect(featureProperties).to.have.property('last_name');
                        expect(featureProperties).to.have.property('parcel_id', 1);
                        expect(featureProperties).to.have.property('time_created');

                        var featureGeometry = features[0].geometry;


                        done();
                    });

            });
        });


    });

};