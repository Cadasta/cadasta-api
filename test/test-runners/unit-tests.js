var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var path = require('path');

// filesOption allows you to pass specific test testFiles and not run
var filesOption = argv.testFiles || null;

var testFiles;

console.log(__dirname);

if(filesOption) {

    // Specific testFiles targeted for test from the filesOption command line option
    testFiles = filesOption.split(',');


} else {

    // Get all testFiles from unitSpecs directory
    testFiles = fs.readdirSync(__dirname + '/../unitSpecs');


    testFiles = testFiles
        .filter(function(file){
            return path.extname(file) === '.js';
        });
}

// Loop thru test files
testFiles.forEach(function(file){

    require('../unitSpecs/' + file);

});