var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect;
chai.use(require('chai-things'));
chai.use(chaiHttp);

var testUtils = require('../test-utils/test-utils.js');

module.exports = function(app) {

    describe('Parcels suite', function () {

        describe('GET /parcels', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/parcels')
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
                                expect(feature).to.have.deep.property('properties.user_id');
                                expect(feature).to.have.deep.property('properties.area');
                                expect(feature).to.have.deep.property('properties.land_use');
                                expect(feature).to.have.deep.property('properties.gov_pin');
                                expect(feature).to.have.deep.property('properties.active');
                                expect(feature).to.have.deep.property('properties.time_created');
                                expect(feature).to.have.deep.property('properties.time_updated');
                                expect(feature).to.have.deep.property('properties.created_by');
                                expect(feature).to.have.deep.property('properties.updated_by');
                            });
                        }

                        done();
                    });

            });
        });

        describe('GET /parcels?fields&limit&order_by&order', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/parcels?fields=id,user_id&limit=2&sort_by=time_created,id&sort_dir=DESC')
                    .end(function (res) {

                        // Test that the endpoint exists and responds
                        expect(res).to.have.status(200);

                        // Test that it returns GeoJSON
                        testUtils.expectFeatureCollection(res.body);

                        //  Get the GeoJSON features for further testing
                        var features = res.body.features;

                        expect(features).with.length(2);

                        // Ensure features have correct properties
                        features.forEach(function(feature){

                            expect(feature).to.have.deep.property('properties.id');
                            expect(feature).to.have.deep.property('properties.user_id');
                        });

                        expect(features[1].properties.id > features[0].properties.id)

                        done();
                    });

            });
        });

        describe('GET /parcels/1', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/parcels/1?returnGeometry=true')
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

                        expect(featureProperties).to.have.property('id', 1);
                        expect(featureProperties).to.have.property('spatial_source', 1);
                        expect(featureProperties).to.have.property('user_id', "11");
                        expect(featureProperties).to.have.property('area');
                        expect(featureProperties).to.have.property('land_use');
                        expect(featureProperties).to.have.property('gov_pin');
                        expect(featureProperties).to.have.property('active');
                        expect(featureProperties).to.have.property('time_created');
                        expect(featureProperties).to.have.property('time_updated');
                        expect(featureProperties).to.have.property('created_by');
                        expect(featureProperties).to.have.property('updated_by');

                        var featureGeometry = features[0].geometry;

                        expect(featureGeometry).to.have.property('coordinates');
                        expect(featureGeometry.coordinates).with.length(2);
                        expect(featureGeometry.coordinates[0]).to.equal(-73.724739);
                        expect(featureGeometry.coordinates[1]).to.equal(40.588342);


                        done();
                    });

            });
        });

        describe('GET /parcels/:id/show_relationship_history', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/parcels/1/show_relationship_history?relationship_type=own&active=true')
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

                        expect(featureProperties).to.have.property('relationship_id');
                        expect(featureProperties).to.have.property('parcel_id');
                        expect(featureProperties).to.have.property('origin_id');
                        expect(featureProperties).to.have.property('parent_id');
                        expect(featureProperties).to.have.property('version');
                        expect(featureProperties).to.have.property('description');
                        expect(featureProperties).to.have.property('date_modified');
                        expect(featureProperties).to.have.property('expiration_date');
                        expect(featureProperties).to.have.property('active');
                        expect(featureProperties).to.have.property('time_created');
                        expect(featureProperties).to.have.property('time_updated');
                        expect(featureProperties).to.have.property('created_by');
                        expect(featureProperties).to.have.property('updated_by');
                        expect(featureProperties).to.have.property('spatial_source');
                        expect(featureProperties).to.have.property('relationship_type');
                        expect(featureProperties).to.have.property('party_id');
                        expect(featureProperties).to.have.property('first_name');
                        expect(featureProperties).to.have.property('last_name');

                        done();
                    });

            });
        });

        describe('GET /parcels/:id/history', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/parcels/1/history')
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
                        expect(featureProperties).to.have.property('parcel_id');
                        expect(featureProperties).to.have.property('origin_id');
                        expect(featureProperties).to.have.property('parent_id');
                        expect(featureProperties).to.have.property('version', 1);
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

        describe('GET /parcels/:id/details', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/parcels/1/details')
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