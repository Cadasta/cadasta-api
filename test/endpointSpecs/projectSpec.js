var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect;
chai.use(require('chai-things'));
chai.use(chaiHttp);

var testUtils = require('../test-utils/test-utils.js');

module.exports = function(app) {

    describe('Project suite', function () {


        describe('POST /projects', function(){
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .post('/projects')
                    .send({"cadasta_organization_id": 2, "ckan_id": "my-test-project", "title": "My Test Project", "ckan_name": "my name", "description": "my descrption"})
                    .end(function (res) {

                        // Test that the endpoint exists and responds
                        expect(res).to.have.status(200);

                        expect(res.body).to.have.property('cadasta_project_id');

                        done();
                    });
            });
        });

        describe('GET /projects/1/overview', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/projects/1/overview')
                    .end(function (res) {

                        //Test that the endpoint exists and responds
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
                        expect(featureProperties).to.have.property('organization_id');
                        expect(featureProperties).to.have.property('title');
                        //expect(featureProperties).to.have.property('ckan_id');
                        //expect(featureProperties).to.have.property('ckan_name');
//                        expect(featureProperties).to.have.property('description');
                        expect(featureProperties).to.have.property('active');
                        expect(featureProperties).to.have.property('sys_delete');
                        expect(featureProperties).to.have.property('time_created');
                        expect(featureProperties).to.have.property('time_updated');
                        expect(featureProperties).to.have.property('created_by');
                        expect(featureProperties).to.have.property('updated_by');
                        expect(featureProperties).to.have.property('project_resources');
                        expect(featureProperties).to.have.property('project_activity');
                        expect(featureProperties).to.have.property('parcels');

                        var featureResources = features[0].properties.project_resources;

                        // This endpoint, when pointed to test DB, should return several features
                        if(featureResources.length > 0) {

                            // Ensure features have correct properties
                            featureResources.forEach(function(feature){

                                expect(feature).to.have.deep.property('properties.id');
                                expect(feature).to.have.deep.property('properties.project_id', 1);
                                expect(feature).to.have.deep.property('properties.url');
                                expect(feature).to.have.deep.property('properties.type');
                                expect(feature).to.have.deep.property('properties.description');
                                expect(feature).to.have.deep.property('properties.active');
                                expect(feature).to.have.deep.property('properties.sys_delete');
                                expect(feature).to.have.deep.property('properties.time_created');
                                expect(feature).to.have.deep.property('properties.time_updated');
                                expect(feature).to.have.deep.property('properties.created_by');
                                expect(feature).to.have.deep.property('properties.updated_by');
                            });
                        }

                        var featureActivities = features[0].properties.project_activity;

                        // Ensure features have correct properties
                        featureActivities.forEach(function(feature){

                            expect(feature).to.have.deep.property('properties.activity_type');
                            expect(feature).to.have.deep.property('properties.id');
                            expect(feature).to.have.deep.property('properties.type');
                            expect(feature).to.have.deep.property('properties.name');
                            expect(feature).to.have.deep.property('properties.parcel_id');
                            expect(feature).to.have.deep.property('properties.time_created');
                        });

                        var featureParcels = features[0].properties.parcels;

                        // Ensure features have correct properties
                        featureParcels.forEach(function(feature){

                            expect(feature).to.have.property('geometry');

                            expect(feature).to.have.deep.property('properties.id');
                            expect(feature).to.have.deep.property('properties.project_id', 1);
                            expect(feature).to.have.deep.property('properties.spatial_source');
                            expect(feature).to.have.deep.property('properties.user_id');
                            expect(feature).to.have.deep.property('properties.area');
                            expect(feature).to.have.deep.property('properties.length');
                            expect(feature).to.have.deep.property('properties.land_use');
                            expect(feature).to.have.deep.property('properties.gov_pin');
                            expect(feature).to.have.deep.property('properties.active');
                            expect(feature).to.have.deep.property('properties.sys_delete');
                            expect(feature).to.have.deep.property('properties.time_created');
                            expect(feature).to.have.deep.property('properties.time_updated');
                            expect(feature).to.have.deep.property('properties.created_by');
                            expect(feature).to.have.deep.property('properties.updated_by');
                        });

                        done();
                    });

            });
        });

        describe('GET /projects/1/map-data', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/projects/1/map-data')
                    .end(function (res) {

                        //Test that the endpoint exists and responds
                        expect(res).to.have.status(200);

                        expect(res.body).to.have.property('project');
                        expect(res.body).to.have.property('parcels');



                        done();
                    });

            });
        });

    });




};