var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect;
chai.use(chaiHttp);

var testUtils = require('../test-utils/test-utils.js');

module.exports = function(app) {

    describe('Parties Suite', function(){
        describe('GET /projects/3/parties', function () {
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
        describe('GET /projects/3/parties/1', function () {
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

    })

};