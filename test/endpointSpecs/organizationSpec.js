var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = require('chai').expect;
chai.use(require('chai-things'));
chai.use(chaiHttp);

var testUtils = require('../test-utils/test-utils.js');

module.exports = function(app) {

    describe('Organizations suite', function () {

        it('should have status 200 and contain specified data structure', function (done) {

            chai.request(app)
                .post('/organizations')
                .send({ckan_id: 'my-test-project', ckan_title:"My Test Project", ckan_description:" My Project Description"})
                .end(function (res) {

                    // Test that the endpoint exists and responds
                    expect(res).to.have.status(200);

                    expect(res.body).to.have.property('cadasta_organization_id');

                    done();
                });

        });

    });
};