var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect;
chai.use(chaiHttp);

var testUtils = require('../test-utils/test-utils.js');

module.exports = function(app) {

    describe('Relationships suite', function () {

        describe('GET projects/:id/relationships/:relationship_id/relationship_history', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/projects/1/relationships/1/relationship_history')
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

                        expect(featureProperties).to.have.property('project_id');
                        expect(featureProperties).to.have.property('relationship_id');
                        expect(featureProperties).to.have.property('origin_id');
                        expect(featureProperties).to.have.property('parent_id');
                        expect(featureProperties).to.have.property('parcel_id', 1);
                        expect(featureProperties).to.have.property('version', 1);
                        expect(featureProperties).to.have.property('expiration_date');
                        expect(featureProperties).to.have.property('description');
                        expect(featureProperties).to.have.property('date_modified');
                        expect(featureProperties).to.have.property('active');
                        expect(featureProperties).to.have.property('time_created');
                        expect(featureProperties).to.have.property('time_updated');
                        expect(featureProperties).to.have.property('created_by');
                        expect(featureProperties).to.have.property('updated_by');
                        expect(featureProperties).to.have.property('tenure_type');
                        expect(featureProperties).to.have.property('spatial_source');
                        expect(featureProperties).to.have.property('party_id',1);
                        expect(featureProperties).to.have.property('full_name');
                        expect(featureProperties).to.have.property('group_name');

                        done();
                    });

            });
        });

        describe('GET /relationships/:id/resources', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/projects/1/relationships/1/resources')
                    .end(function (res) {

                        // Test that the endpoint exists and responds
                        expect(res).to.have.status(200);

                        // Test that it returns GeoJSON
                        testUtils.expectFeatureCollection(res.body);

                        //  Get the GeoJSON features for further testing
                        var features = res.body.features;

                        done();
                    });

            });
        });

        describe('GET projects/:id/relationships/:relationship_id/relationships_list', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/projects/1/relationships/relationships_list')
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
                        expect(featureProperties).to.have.property('tenure_type');
                        expect(featureProperties).to.have.property('parcel_id');
                        expect(featureProperties).to.have.property('project_id');
                        expect(featureProperties).to.have.property('spatial_source');
                        expect(featureProperties).to.have.property('how_acquired');
                        expect(featureProperties).to.have.property('party_id');
                        expect(featureProperties).to.have.property('full_name');
                        expect(featureProperties).to.have.property('group_name');
                        expect(featureProperties).to.have.property('time_created');
                        expect(featureProperties).to.have.property('active');
                        expect(featureProperties).to.have.property('time_updated');

                        done();
                    });

            });
        });

        describe('GET projects/:id/relationships/:relationship_id/details', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/projects/1/relationships/1/details')
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
                        expect(featureProperties).to.have.property('tenure_type');
                        expect(featureProperties).to.have.property('parcel_id');
                        expect(featureProperties).to.have.property('project_id');
                        expect(featureProperties).to.have.property('spatial_source');
                        expect(featureProperties).to.have.property('how_acquired');
                        expect(featureProperties).to.have.property('acquired_date');
                        expect(featureProperties).to.have.property('party_id');
                        expect(featureProperties).to.have.property('full_name');
                        expect(featureProperties).to.have.property('group_name');
                        expect(featureProperties).to.have.property('time_created');
                        expect(featureProperties).to.have.property('active');
                        expect(featureProperties).to.have.property('time_updated');

                        done();
                    });

            });
        });

        describe('POST /projects/1/relationships', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .post('/projects/1/relationships')
                    .send({"parcel_id": 1,"ckan_user_id": null,"party_id": 1,"geojson": {"type":"Point","coordinates":[-72.9490754,40.8521095]},"tenure_type":"mineral rights","acquired_date":"10/31/2015","how_acquired":null,"description":null})
                    .end(function (res) {

                        //Test that the endpoint exists and responds
                        expect(res).to.have.status(200);

                        expect(res.body).to.have.property('cadasta_relationship_id');

                        done();
                    });

            });
        });

        describe('PATCH /projects/:id/relationships/:relationship_id suite', function () {

            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .patch('/projects/1/relationships/1')
                    .send({
                        "parcel_id": null,
                        "party_id": null,
                        "geojson":null,
                        "tenure_type":"joint tenancy",
                        "acquired_date":"11/1/2015",
                        "how_acquired":"informally leased from government",
                        "description":null
                    })
                    .end(function (res) {

                        // Test that the endpoint exists and responds
                        expect(res).to.have.status(200);

                        expect(res.body).to.have.property('cadasta_relationship_history_id');

                        done();
                    });

            });

        });


    });

};