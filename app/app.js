var argv = require('minimist')(process.argv.slice(2));
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var compression = require('compression')
var bodyParser = require('body-parser');
var cors = require("cors");
// Logging packages
var rollbar = require('rollbar');
var winston = require('winston');
require('winston-rollbar').Rollbar;
require('./console-winston');


// Get the runtime environment from the node app argument; default to development
var environment = argv.env || null;

if(!environment) {
    console.error("\nPlease provide an environment setting, e.g., '--env development'.\n", 1);
    process.exit(1);
}

var settings, environments, validEnvironments, envSettings;

//if settings.js doesn't exist, let the user know and exit
try {
    settings = require('./settings/settings.js');
} catch (e) {
    console.error("Missing app/settings/settings.js file.\n", e);
    process.exit(1);
}

try {
    environments = require("./settings/environment-settings.js");
} catch (e) {
    console.error("Missing app/settings/settings.js file.\n", e);
    process.exit(1);
}

if(!environments.hasOwnProperty(environment)) {

    var validEnvironments = Object.keys(environments).toString();

    console.error("\nThe --env value you provided is not found in the list of valid environments: "
        + validEnvironments.split(',').join(', '), 1);
    process.exit(1);
}

// Define environment settings
envSettings = environments[environment];

// Copy the Environment specific to the settings module, then they will be available wherever settings module is required.
for (var i in envSettings) {

    if(settings.hasOwnProperty(i)){
        throw Error("Environment settings cannot overwrite runtime settings.")
    }

    settings[i] = envSettings[i];
}

settings.pg = envSettings.pg;

var DataTransformer = require('cadasta-data-transformer');
var ingestion_engine = DataTransformer(settings);

//Register the CSV Provider
require("cadasta-provider-csv").register(ingestion_engine);

//Register the GeoJSON Provider
require("cadasta-provider-geojson").register(ingestion_engine);

//Register the ONA-data Provider
require("cadasta-provider-ona").register(ingestion_engine, settings);

// Create the express instance
var app = express();

// Set app env
app.set('env', environment);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// compress all requests: gzip/deflate
app.use(compression());

// CORS
app.use(cors());

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Static directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint configuration
var index = require('./routes/index');
var custom = require('./routes/custom');
var parcels = require('./routes/parcels');
var relationships = require('./routes/relationships');
var resources = require('./routes/resources');
var projects = require('./routes/projects');
var parties = require('./routes/parties');
var organizations = require('./routes/organizations');
var field_data = require('./routes/field_data');


app.use('/', index);
app.use('/', custom);
app.use('/parcels', parcels);
app.use('/providers', ingestion_engine.router);
app.use('/projects', projects,resources,relationships, parties,field_data);
app.use('/organizations', organizations);



// Environment-specific configuration
if (app.get('env') === 'development') {

    // Use the morgan logger and print stack trace
    app.use(logger('dev'));
    printStackTrace(app);

} else if (app.get('env') === 'testing') {

    // print stack trace
    printStackTrace(app);

} else {

    // print stack trace and log warnings
    printStackTrace(app);
    addLogging(app, settings);

}


// START THE SERVER
// =============================================================================
app.listen(envSettings.apiPort, function(){

    console.log('API listening on port ' + envSettings.apiPort);

});

module.exports = app;


function printStackTrace(app){
    // will print stacktrace
    app.use(function(err, req, res, next) {

        //Bad Db column request
        if(err.code === "42703") {
            err.status = 400;
            err.message = "Bad request: " + err.message;

        }

        console.error(err, err.stack);
        res.status(err.status || 500).json({
            message: err.message,
            error: err
        });
    });
}

function hideStackTrace(app){
    // will print stacktrace
    app.use(function(err, req, res, next) {
        console.error(err);
        res.status(err.status || 500).json({
            message: err.message,
            error: {}
        });
    });
}

function addLogging(app,settings){

    if(settings.useRollbar) {
        app.use(rollbar.errorHandler(settings.rollbarKey));
        winston.add(winston.transports.Rollbar, { rollbarAccessToken: settings.rollbarKey, level:'warn' });
        rollbar.handleUncaughtExceptions(settings.rollbarKey, { exitOnUncaughtException: true });
    }
}
