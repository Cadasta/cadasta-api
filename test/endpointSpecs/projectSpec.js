var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect;
chai.use(require('chai-things'));
chai.use(chaiHttp);

var testUtils = require('../test-utils/test-utils.js');

module.exports = function(app) {

    describe('Project suite', function () {


        it('should have status 200 and contain specified data structure', function (done) {

            chai.request(app)
                .post('/projects')
                .send({cadasta_organization_id: 2, ckan_id: 'my-test-project', ckan_title:"My Test Project"})
                .end(function (res) {

                    // Test that the endpoint exists and responds
                    expect(res).to.have.status(200);

                    expect(res.body).to.have.property('cadasta_project_id');

                    done();
                });

        });

    });
};