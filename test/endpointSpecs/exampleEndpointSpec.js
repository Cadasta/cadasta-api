var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);

module.exports = function(app) {

    describe('Example endpoint suite', function () {
        describe('GET /parcel', function () {
            it('should have status 200', function () {

                chai.request(app)
                    .get('/parcel')
                    .then(function (res) {
                        expect(res).to.have.status(200);
                    })
                    .catch(function (err) {
                        throw err;
                    })

            });
        });
    });

};