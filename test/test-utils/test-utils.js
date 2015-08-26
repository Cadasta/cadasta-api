var chai = require("chai");
var expect = chai.expect;

var utils = {};

utils.expectFeatureCollection = function(response){


    expect(response).to.have.property('type',"FeatureCollection");
    expect(response).to.have.property('features');

    var features = response.features;

    expect(features).to.be.instanceof(Array);

    features.forEach(function(feature){
        expect(feature).to.have.property('type', 'Feature');
        expect(feature).to.have.property("properties");
        expect(feature.properties).to.be.instanceof(Object);
        expect(feature).to.have.property('geometry');
    });

};

module.exports = utils;