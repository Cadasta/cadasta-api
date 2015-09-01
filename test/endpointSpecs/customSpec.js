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

        describe('GET /custom/get_parcels_list', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/custom/get_parcels_list')
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

        describe('GET /custom/get_parcels_list?tenure_type=own', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/custom/get_parcels_list?tenure_type=own')
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

        describe('GET /custom/get_parcel_details/:id', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/custom/get_parcel_details/1')
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
                        expect(featureProperties).to.have.property('user_id');
                        expect(featureProperties).to.have.property('area');
                        expect(featureProperties).to.have.property('land_use');
                        expect(featureProperties).to.have.property('gov_pin');
                        expect(featureProperties).to.have.property('active');
                        expect(featureProperties).to.have.property('time_created');
                        expect(featureProperties).to.have.property('time_updated');
                        expect(featureProperties).to.have.property('created_by');
                        expect(featureProperties).to.have.property('updated_by');
                        expect(featureProperties).to.have.property('parcel_history');
                        expect(featureProperties).to.have.property('parcel_history');

                        var geometry = features[0].geometry;

                        expect(geometry).to.have.property('coordinates');

                        var relationships = featureProperties.relationships;
                        relationships.should.all.have.property('relationship_id');
                        relationships.should.all.have.property('parcel_id');
                        relationships.should.all.have.property('relationship_type');
                        relationships.should.all.have.property('spatial_source');
                        relationships.should.all.have.property('party_id');
                        relationships.should.all.have.property('first_name');
                        relationships.should.all.have.property('last_name');
                        relationships.should.all.have.property('time_created');
                        //relationships.should.all.have.property('time_updated');
                        
                        var parcel_history = featureProperties.parcel_history;
                        parcel_history.should.all.have.property('id');
                        parcel_history.should.all.have.property('parcel_id');
                        parcel_history.should.all.have.property('origin_id');
                        parcel_history.should.all.have.property('parent_id');
                        parcel_history.should.all.have.property('version');
                        parcel_history.should.all.have.property('description');
                        parcel_history.should.all.have.property('date_modified');
                        parcel_history.should.all.have.property('active');
                        parcel_history.should.all.have.property('time_created');
                        parcel_history.should.all.have.property('time_updated');
                        parcel_history.should.all.have.property('created_by');
                        parcel_history.should.all.have.property('updated_by');

                        done();
                    });

            });
        });
    });

};