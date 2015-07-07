var express = require('express');

var router0_1 = express.Router();

var driver = require('./driver');
var message = require('./message');
var image = require('./image');

// middleware to catch ALL requests
router0_1.use(function (req, res, next) {
    console.log('Something is happening');
    next(); // go to the next route, dont stop here
})

// GET localhost:8080/api/v0.1/
router0_1.get('/', function (req, res) {
    res.json({
        message: 'HELLO! Welcome to our RDS API!',
        version: 0.1, author: "Kevin Hernandez"
    });
});

router0_1.use('/drivers', driver);

module.exports = router0_1;