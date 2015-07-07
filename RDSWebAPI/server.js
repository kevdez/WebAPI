var config = require('./config')
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var fs = require('fs');
var fileStreamRotator = require('file-stream-rotator');
var bodyParser = require('body-parser');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// logging
var logDirectory = __dirname + '/log';
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory) // make sure directory exists
var accessLogStream = fileStreamRotator.getStream({
    filename: logDirectory + '/access-%DATE%.log',
    frequency: 'daily',
    verbose: false
});
app.use(morgan('combined', { stream: accessLogStream }));


var indexRouter = require('./routes/index');
var apidocs = require('./routes/api');
var router0_1 = require('./routes/router0_1');

// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// authentication
app.use(function (req, res, next) {
    if (req.method == "POST" || req.method == "PUT" || req.method == "DELETE") {
        var auth;
        console.log("authenticating...");
        if (req.headers.authorization) {
            auth = new Buffer(req.headers.authorization.substring(6), 'base64')
            .toString()
            .split(":");
        }
        
        if (!auth || auth[0] !== config.auth.user || auth[1] !== config.auth.password) {
            res.statusCode = 401;
            res.setHeader('www-authenticate', 'Basic realm="myrealmname"');
            res.end('Unauthoriazed');
        } else {
            next();
        }
    } else {
        next();
    }
});

// REGISTER OUR ROUTES
app.use('/', indexRouter);
app.use('/api', apidocs);
app.use('/api/v0.1/', router0_1);


// START THE SERVER
app.listen(config.port);
console.log('Magic happens on port ' + config.port);