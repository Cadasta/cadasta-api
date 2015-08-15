var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var path = require('path');
var app  = require('../../app/app.js');
var chai = require('chai');
var chaiHttp = require('chai-http');

chai.use(chaiHttp);

// Add promise support if this does not exist natively.
if (!global.Promise) {
    var q = require('q');
    chai.request.addPromises(q.Promise);
}

// filesOption allows you to pass specific test testFiles and not run
var filesOption = argv.testFiles || null;

var testFiles;

if(filesOption) {

    // Specific testFiles targeted for test from the filesOption command line option
    testFiles = filesOption.split(',');


} else {

    // Get all testFiles from endpointSpecs directory
    testFiles = fs.readdirSync(__dirname + '/../endpointSpecs');


    testFiles = testFiles
        .filter(function(file){
            return path.extname(file) === '.js';
        });
}

// Loop thru test files
testFiles.forEach(function(file){

    require('../endpointSpecs/' + file)(app);

});