var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect;
chai.use(chaiHttp);

var testUtils = require('../test-utils/test-utils.js');

module.exports = function(app) {

    describe('Relationships suite', function () {

        describe('GET /relationships/:id/relationship_history', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('projects/1/relationships/1/relationship_history')
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


        describe('GET /relationships/:id/resources', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/relationships/1/resources')
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

    });

};