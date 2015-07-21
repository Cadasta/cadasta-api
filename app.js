var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var compression = require('compression')
var bodyParser = require('body-parser');

var deploymentConfig = require("./deployment-config.json");
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

var validDeployments = ['production', 'staging', 'development', 'testing'];

var deploymentType = process.argv[2] || 'development';

if(validDeployments.indexOf(deploymentType) === -1) {
    console.error('Invalid deployment type');
    return;
}

// Set app env
app.set('env', deploymentType);

// Environment specific configuration settings
var envSettings = deploymentConfig.environment[deploymentType];

// compress all requests: gzip/deflate
app.use(compression())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

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

    app.use(logger('dev'));
    printStackTrace(app);

} else if (app.get('env') === 'testing') {

    printStackTrace(app);

} else if (app.get('env') === 'staging') {

    printStackTrace(app);

} else if (app.get('env') === 'production') {

    hideStackTrace(app);

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