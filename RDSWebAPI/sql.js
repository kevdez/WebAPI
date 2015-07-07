var mssql = require('mssql');
var config = require('./config');

var connection = new mssql.Connection(config.sql, function (err) {
    if (err) {
        console.log(err);
    }
});

module.exports = connection;
