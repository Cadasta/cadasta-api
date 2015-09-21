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

        describe('GET /show_relationship_resources', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/show_relationship_resources')
                    .end(function (res) {

                        // Test that the endpoint exists and responds
                        expect(res).to.have.status(200);

                        // Test that it returns GeoJSON
                        testUtils.expectFeatureCollection(res.body);

                        //  Get the GeoJSON features for further testing
                        var features = res.body.features;

                        // Make sure only one feature returned
                        expect(features).with.length(3);

                        // Check properties
                        var featureProperties = features[0].properties;
                        expect(featureProperties).to.have.property('resource_id');
                        expect(featureProperties).to.have.property('relationship_id');
                        expect(featureProperties).to.have.property('project_id');
                        expect(featureProperties).to.have.property('type');
                        expect(featureProperties).to.have.property('url');
                        expect(featureProperties).to.have.property('description');
                        expect(featureProperties).to.have.property('time_created');
                        expect(featureProperties).to.have.property('time_updated');
                        expect(featureProperties).to.have.property('created_by');
                        expect(featureProperties).to.have.property('updated_by');

                        var featureGeometry = features[0].geometry;

                        done();
                    });

            });
        });


    });

};