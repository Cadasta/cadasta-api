var express = require('express');
var path = require('path');
var compression = require('compression')

// Create the express instance
var app = express();

// compress all requests: gzip/deflate
app.use(compression());


// Static directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(err, req, res, next) {
    console.error(err);
    res.status(err.status || 500).json({
        message: err.message,
        error: {}
    });
});

// START THE SERVER
// =============================================================================
app.listen(9999, function(){

    console.log('Docs server listening on port 9999.');

});

module.exports = app;
