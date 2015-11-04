var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect;
chai.use(chaiHttp);

var testUtils = require('../test-utils/test-utils.js');

module.exports = function(app) {

    describe('Parties Suite', function(){
        describe('GET /projects/1/parties', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/projects/1/parties')
                    .end(function (res) {

                        //Test that the endpoint exists and responds
                        expect(res).to.have.status(200);

                        var features = res.body.features;

                        // Check properties
                        var featureProperties = features[0].properties;

                        expect(featureProperties).to.have.property('id');
                        expect(featureProperties).to.have.property('project_id');
                        expect(featureProperties).to.have.property('num_relationships');
                        expect(featureProperties).to.have.property('group_name');
                        expect(featureProperties).to.have.property('first_name');
                        expect(featureProperties).to.have.property('last_name');
                        expect(featureProperties).to.have.property('type');
                        expect(featureProperties).to.have.property('active');
                        expect(featureProperties).to.have.property('time_created');
                        expect(featureProperties).to.have.property('time_updated');

                        done();
                    });

            });
        });
        describe('GET /projects/1/parties/1', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/projects/1/parties/2')
                    .end(function (res) {

                        //Test that the endpoint exists and responds
                        expect(res).to.have.status(200);

                        var features = res.body.features;

                        // Test the response only returns one feature
                        expect(features).with.length(1);

                        // Check properties
                        var featureProperties = features[0].properties;

                        expect(featureProperties).to.have.property('id',2);
                        expect(featureProperties).to.have.property('project_id',1);
                        expect(featureProperties).to.have.property('num_relationships',1);
                        expect(featureProperties).to.have.property('group_name');
                        expect(featureProperties).to.have.property('first_name', 'Oscar');
                        expect(featureProperties).to.have.property('last_name', 'Sanders ');
                        expect(featureProperties).to.have.property('type', 'individual');
                        expect(featureProperties).to.have.property('active');
                        expect(featureProperties).to.have.property('time_created');
                        expect(featureProperties).to.have.property('time_updated');

                        done();
                    });

            });
        });
        describe('GET /projects/1/parties/1/details', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/projects/1/parties/1/details')
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
                        expect(featureProperties).to.have.property('project_id');
                        expect(featureProperties).to.have.property('num_relationships');
                        expect(featureProperties).to.have.property('group_name');
                        expect(featureProperties).to.have.property('first_name');
                        expect(featureProperties).to.have.property('last_name');
                        expect(featureProperties).to.have.property('type');
                        expect(featureProperties).to.have.property('active');
                        expect(featureProperties).to.have.property('time_created');
                        expect(featureProperties).to.have.property('time_updated');

                        var parcels = featureProperties.parcels[0].properties;
                        expect(parcels).to.have.property('project_id');
                        expect(parcels).to.have.property('parcel_id');
                        expect(parcels).to.have.property('party_id');
                        expect(parcels).to.have.property('relationship_id');

                        var relationships = featureProperties.relationships[0].properties;
                        expect(relationships).to.have.property('id');
                        expect(relationships).to.have.property('tenure_type');
                        expect(relationships).to.have.property('how_acquired');
                        expect(relationships).to.have.property('acquired_date');
                        expect(relationships).to.have.property('parcel_id');
                        expect(relationships).to.have.property('project_id');
                        expect(relationships).to.have.property('spatial_source');
                        expect(relationships).to.have.property('party_id');
                        expect(relationships).to.have.property('first_name');
                        expect(relationships).to.have.property('last_name');
                        expect(relationships).to.have.property('time_created');
                        expect(relationships).to.have.property('active');
                        expect(relationships).to.have.property('time_updated');

                        done();
                    });

            });
        });
        describe('POST /projects/1/parties', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .post('/projects/1/parties')
                    .send({
                        "first_name": null,
                        "last_name": null,
                        "group_name": "Wallys World",
                        "party_type": "group",
                        "gender": "Male",
                        "dob":"2010-10-22",
                        "notes":"We at wal mart corporation have been working hard to make this happen. We own everything",
                        "national_id":"XXX3322**iiIeeeeLLLL"
                    })
                    .end(function (res) {

                        //Test that the endpoint exists and responds
                        expect(res).to.have.status(200);

                        expect(res.body).to.have.property('cadasta_party_id');

                        done();
                    });

            });
        });
        
    })

};