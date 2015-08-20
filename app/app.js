var argv = require('minimist')(process.argv.slice(2));
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var compression = require('compression')
var bodyParser = require('body-parser');
// Logging packages
var rollbar = require('rollbar');
var winston = require('winston');
require('winston-rollbar').Rollbar;
require('./console-winston');


// Set the valid environments
var validEnvironments = ['production', 'staging', 'development', 'testing'];

// Get the runtime environment from the node app argument; default to development
var environment = argv.env || 'development';

// Ensure the environment argument is valid
if(validEnvironments.indexOf(environment) === -1) {
    console.error('Invalid environment type');
    return;
}

var settings, envSettings;

//if settings.js doesn't exist, let the user know and exit
try {
    settings = require('./settings/settings.js');

    // Environment specific configuration settings
    envSettings = require("./settings/environment-settings.js")[environment];
} catch (e) {
    console.log("Missing a settings file.\n", e);
    return;
}

// Copy the Environment specific Postgres settings to the settings module, then they will be available whereever settings module is required.
settings.pg = envSettings.pg;



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

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Static directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint configuration
var routes = require('./routes/index');
var parcel = require('./routes/parcel');
var parcels = require('./routes/parcels');
var relationships = require('./routes/relationships');
var relationship = require('./routes/relationship');
var activities = require('./routes/activities');
var custom = require('./routes/custom');

app.use('/', routes);
app.use('/parcels', parcels);
app.use('/parcel', parcel);
app.use('/relationships', relationships);
app.use('/relationship', relationship);
app.use('/activities', activities);
app.use('/custom', custom);


// Environment-specific configuration
if (app.get('env') === 'development') {

    // Use the morgan logger and print stack trace
    app.use(logger('dev'));
    printStackTrace(app);

} else if (app.get('env') === 'testing') {

    // print stack trace
    printStackTrace(app);

} else if (app.get('env') === 'staging') {

    // print stack trace and log warnings and errors to Rollbar logging dashboard
    printStackTrace(app);
    addLogging(app, envSettings);

} else if (app.get('env') === 'production') {

    // hide stack trace and log warnings and errors to Rollbar logging dashboard
    hideStackTrace(app);
    addLogging(app, envSettings);
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
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

function hideStackTrace(app){
    // will print stacktrace
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: {}
        });
    });
}

function addLogging(app,settings){

    if(settings.useRollbar) {
        app.use(rollbar.errorHandler(envSettings.rollbarKey));
        winston.add(winston.transports.Rollbar, { rollbarAccessToken: envSettings.rollbarKey, level:'warn' });
        rollbar.handleUncaughtExceptions(envSettings.rollbar, { exitOnUncaughtException: true });
    }
}