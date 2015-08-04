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

var deploymentConfig = require("./deployment-config.json");
var settings = require('./settings.js');
var routes = require('./routes/index');
var users = require('./routes/users');

// Create the express instance
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// Set the valid environments
var validEnvironments = ['production', 'staging', 'development', 'testing'];

// Get the runtime environment from the node app argument; default to development
var environment = process.argv[2] || 'development';

// Ensure the environment argument is valid
if(validEnvironments.indexOf(environment) === -1) {
    console.error('Invalid environment type');
    return;
}

// Set app env
app.set('env', environment);

// Environment specific configuration settings
var envSettings = deploymentConfig.environment[environment];
settings.pg = envSettings.pg;

// compress all requests: gzip/deflate
app.use(compression());

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Static directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint configuration
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler; Remove this?
/*
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
*/


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

function addLogging(app,envSettings){
    app.use(rollbar.errorHandler(envSettings.rollbarKey));
    winston.add(winston.transports.Rollbar, { rollbarAccessToken: envSettings.rollbarKey, level:'warn' });
    rollbar.handleUncaughtExceptions(envSettings.rollbar, { exitOnUncaughtException: true });

}