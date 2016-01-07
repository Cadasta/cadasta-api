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

                        // Ensure features have correct properties
                        features.forEach(function(feature){

                            expect(feature).to.have.deep.property('properties.id');
                            expect(feature).to.have.deep.property('properties.user_id');
                        });

 //                       expect(features[1].properties.id > features[0].properties.id)

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
                        expect(featureProperties).to.have.property('spatial_source', 3);
                        expect(featureProperties).to.have.property('user_id', null);
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


                        done();
                    });

            });
        });

        describe('GET /parcels/:id/show_relationship_history', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/parcels/1/show_relationship_history?relationship_type=mineral rights&active=true')
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
                        expect(featureProperties).to.have.property('expiration_date');
                        expect(featureProperties).to.have.property('active');
                        expect(featureProperties).to.have.property('time_created');
                        expect(featureProperties).to.have.property('time_updated');
                        expect(featureProperties).to.have.property('created_by');
                        expect(featureProperties).to.have.property('updated_by');
                        expect(featureProperties).to.have.property('spatial_source');
                        expect(featureProperties).to.have.property('relationship_type');
                        expect(featureProperties).to.have.property('party_id');
                        expect(featureProperties).to.have.property('full_name');
                        expect(featureProperties).to.have.property('group_name');

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
                        relationships.should.all.have.property('id');
                        relationships.should.all.have.property('parcel_id');
                        relationships.should.all.have.property('tenure_type');
                        relationships.should.all.have.property('spatial_source');
                        relationships.should.all.have.property('party_id');
                        relationships.should.all.have.property('full_name');
                        relationships.should.all.have.property('group_name');
                        relationships.should.all.have.property('time_created');
                        //relationships.should.all.have.property('time_updated');

                        var parcel_history = featureProperties.parcel_history;
                        parcel_history.should.all.have.property('id');
                        parcel_history.should.all.have.property('parcel_id');
                        parcel_history.should.all.have.property('origin_id');
                        parcel_history.should.all.have.property('parent_id');
                        parcel_history.should.all.have.property('version');
                        parcel_history.should.all.have.property('description');
                        parcel_history.should.all.have.property('active');
                        parcel_history.should.all.have.property('time_created');
                        parcel_history.should.all.have.property('time_updated');
                        parcel_history.should.all.have.property('created_by');
                        parcel_history.should.all.have.property('updated_by');


                        done();
                    });

            });
        });

        describe('GET projects/:id/parcels/:id/details', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/projects/1/parcels/1/details')
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

                        var relationshipProperties = featureProperties.relationships[0].properties;
                        expect(relationshipProperties).to.have.property('id');
                        expect(relationshipProperties).to.have.property('parcel_id');
                        expect(relationshipProperties).to.have.property('tenure_type');
                        expect(relationshipProperties).to.have.property('spatial_source');
                        expect(relationshipProperties).to.have.property('party_id');
                        expect(relationshipProperties).to.have.property('full_name');
                        expect(relationshipProperties).to.have.property('group_name');
                        expect(relationshipProperties).to.have.property('time_created');


                        var parcel_historyProperties = featureProperties.parcel_history[0].properties;
                        expect(parcel_historyProperties).to.have.property('id');
                        expect(parcel_historyProperties).to.have.property('parcel_id');
                        expect(parcel_historyProperties).to.have.property('origin_id');
                        expect(parcel_historyProperties).to.have.property('parent_id');
                        expect(parcel_historyProperties).to.have.property('version');
                        expect(parcel_historyProperties).to.have.property('description');
                        expect(parcel_historyProperties).to.have.property('active');
                        expect(parcel_historyProperties).to.have.property('time_created');
                        expect(parcel_historyProperties).to.have.property('time_updated');
                        expect(parcel_historyProperties).to.have.property('created_by');
                        expect(parcel_historyProperties).to.have.property('updated_by');

                        var relationship_historyProperties = featureProperties.relationship_history[0].properties;
                        expect(relationship_historyProperties).to.have.property('project_id');
                        expect(relationship_historyProperties).to.have.property('relationship_id');
                        expect(relationship_historyProperties).to.have.property('origin_id');
                        expect(relationship_historyProperties).to.have.property('parent_id');
                        expect(relationship_historyProperties).to.have.property('version');
                        expect(relationship_historyProperties).to.have.property('tenure_type');
                        expect(relationship_historyProperties).to.have.property('acquired_date');
                        expect(relationship_historyProperties).to.have.property('how_acquired');
                        expect(relationship_historyProperties).to.have.property('parcel_id');
                        expect(relationship_historyProperties).to.have.property('relationship_type');
                        expect(relationship_historyProperties).to.have.property('expiration_date');
                        expect(relationship_historyProperties).to.have.property('description');
                        expect(relationship_historyProperties).to.have.property('active');
                        expect(relationship_historyProperties).to.have.property('time_created');
                        expect(relationship_historyProperties).to.have.property('length');
                        expect(relationship_historyProperties).to.have.property('area');
                        expect(relationship_historyProperties).to.have.property('time_updated');
                        expect(relationship_historyProperties).to.have.property('created_by');
                        expect(relationship_historyProperties).to.have.property('updated_by');
                        expect(relationship_historyProperties).to.have.property('spatial_source');
                        expect(relationship_historyProperties).to.have.property('party_id');
                        expect(relationship_historyProperties).to.have.property('full_name');
                        expect(relationship_historyProperties).to.have.property('group_name');

                        done();
                    });

            });
        });

        describe('POST /projects/:id/parcels suite', function () {

            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .post('/projects/3/parcels')
                    .send({spatial_source: 'digitized', geojson:{"type": "LineString","coordinates": [[91.91986083984375,43.04881979669318],[91.94183349609375,42.974511174899156]]}
                        , land_use:"community land", gov_pin:'433421ss', description: 'Test parcel'})
                    .end(function (res) {

                        // Test that the endpoint exists and responds
                        expect(res).to.have.status(200);

                        expect(res.body).to.have.property('cadasta_parcel_id');

                        done();
                    });

            });

        });

        describe('PATCH /projects/:id/parcels/:id suite', function () {

            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .patch('/projects/1/parcels/1')
                    .send({"geojson": {"type": "LineString", "coordinates": [[91.91986083984375, 43.04881979669318], [91.94183349609375, 42.974511174899156]]}, "spatial_source":"digitized", "description": "new descriotion"})
                    .end(function (res) {

                        // Test that the endpoint exists and responds
                        expect(res).to.have.status(200);

                        expect(res.body).to.have.property('cadata_parcel_history_id');

                        done();
                    });

            });

        });

        describe('PATCH /projects/:id/parcels/:id suite', function () {

            it('should have status 400 and contain specified data structure', function (done) {

                chai.request(app)
                    .patch('/projects/1/parcels/1')
                    .send({"geojson": {"type": "LineString", "coordinates": [[91.91986083984375, 43.04881979669318], [91.94183349609375, 42.974511174899156]]}, "spatial_source":"digi", "description": "new descriotion"})
                    .end(function (res) {
                        // Test that the endpoint exists and responds
                        expect(res).to.have.status(400);

                        expect(res.body).to.have.property('status',"ERROR");

                        done();
                    });

            });

        });


    });

};