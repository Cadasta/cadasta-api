var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect;
chai.use(chaiHttp);

var testUtils = require('../test-utils/test-utils.js');

module.exports = function(app) {

    describe('FieldData suite', function () {

        describe('GET projects/:id/fieldData/:field_data_id/show_responses', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/projects/1/fieldData/1/show_responses')
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
                        expect(featureProperties).to.have.property('user_id');
                        expect(featureProperties).to.have.property('id_string');
                        expect(featureProperties).to.have.property('form_id');
                        expect(featureProperties).to.have.property('name');
                        expect(featureProperties).to.have.property('label');
                        expect(featureProperties).to.have.property('publish');
                        expect(featureProperties).to.have.property('sys_delete');
                        expect(featureProperties).to.have.property('time_created');
                        expect(featureProperties).to.have.property('time_updated');
                        expect(featureProperties).to.have.property('created_by');
                        expect(featureProperties).to.have.property('updated_by');
                        expect(featureProperties).to.have.property('responses');
                        expect(featureProperties).to.have.property('questions');

                        var responsesProperties = featureProperties.responses[0].properties;

                        expect(responsesProperties).to.have.property('project_id');
                        expect(responsesProperties).to.have.property('field_data_id');
                        expect(responsesProperties).to.have.property('respondent_id');
                        expect(responsesProperties).to.have.property('text');
                        expect(responsesProperties).to.have.property('question_id');
                        expect(responsesProperties).to.have.property('time_created');
                        expect(responsesProperties).to.have.property('time_updated');

                        var questionProperties = featureProperties.questions[0].properties;

                        expect(questionProperties).to.have.property('question_id');
                        expect(questionProperties).to.have.property('type');
                        expect(questionProperties).to.have.property('name');
                        expect(questionProperties).to.have.property('label');
                        expect(questionProperties).to.have.property('field_data_id');
                        expect(questionProperties).to.have.property('project_id');

                        done();
                    });

            });
        });

        describe('GET projects/:id/fieldData/:field_data_id/validate_respondents', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .get('/projects/1/fieldData/1')
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
                        expect(featureProperties).to.have.property('user_id');
                        expect(featureProperties).to.have.property('id_string');
                        expect(featureProperties).to.have.property('form_id');
                        expect(featureProperties).to.have.property('name');
                        expect(featureProperties).to.have.property('label');
                        expect(featureProperties).to.have.property('publish');
                        expect(featureProperties).to.have.property('sys_delete');
                        expect(featureProperties).to.have.property('time_created');
                        expect(featureProperties).to.have.property('time_updated');
                        expect(featureProperties).to.have.property('created_by');
                        expect(featureProperties).to.have.property('updated_by');

                        done();
                    });

            });
        });

        describe('PATCH /projects/:id/fieldData/:field_data_id/validate_respondents', function () {
            it('should have status 200 and contain specified data structure', function (done) {

                chai.request(app)
                    .patch('/projects/1/fieldData/1/validate_respondents')
                    .send({
                        "respondent_ids": [
                            1
                        ], "status":true
                    })
                    .end(function (res) {

                        //Test that the endpoint exists and responds
                        expect(res).to.have.status(200);

                        expect(res.body).to.have.property('cadasta_validate_respondent');

                        var response_arr = res.body.cadasta_validate_respondent;

                        expect(response_arr).with.length(1);

                        done();
                    });

            });
        });
    });

};