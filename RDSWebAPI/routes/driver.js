'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var sql = require('../sql');
var mssql = require('mssql');
var config = require('../config');
var driver = express.Router();

// utility function that makes sure driver exists in the SQL Driver table.
function driverExists(driverNo, callback) {
    var request = sql.request();
    request.query('select * from dbo.driver where driverno = ' + driverNo);
    var result = false;
    request.on('error', function (err) {
        result = false;
    })
    request.on('row', function (row) {
        result = true;
    });
    request.on('done', function (returnValue) {
        callback(result);
    });
}; 

// GET /drivers/:driver_no : returns a single driver
driver.route('/:driver_no')
.get(function (req, res) {
    var drivercheck = driverExists(req.params.driver_no, function (result) {
        if (result == true) {
            var request = sql.request();
            request.query('select * from dbo.driver where driverno=' + req.params.driver_no);
            request.on('error', function (err) {
                res.json({ Error: "Something happened on SELECT statement. Try again later." });
            });
            request.on('row', function (row) {
                res.json(row);
            });
        } else {
            res.json({ Error: "Driver " + req.params.driver_no + " does not exist." });
        }
    })
})

// PUT /drivers/:driver_no : updates a single driver
.put(function (req, res) {
    var drivercheck = driverExists(req.params.driver_no, function (result) {
        if (result == true) {
            var update = {};
            update.Password = (req.body.Password) ? req.body.Password : null;
            update.GcmRegisteredId = (req.body.GcmRegisteredId) ? req.body.GcmRegisteredId : null;
            update.LastUpdatedTime = new Date();
            
            var request = sql.request();
            request.input('DriverNo', mssql.Int, req.params.driver_no);
            request.input('Password', mssql.VarChar(10), update.Password);
            request.input('GcmRegisteredId', mssql.VarChar(mssql.MAX), update.GcmRegisteredId);
            request.input('LastUpdatedTime', mssql.DateTime2, update.LastUpdatedTime);
            request.output('intResult', mssql.Int);
            request.output('errorCode', mssql.VarChar(40));
            
            request.execute('UpdateDriver', function (err, recordsets, returnValue) {
                if (err) {
                    console.log("Stored Procedure 'UpdateDriver' execute error: " + err);
                }
            });
            request.on('error', function (err) {
                res.json({ Error : "Stored Procedure 'UpdateDriver' execute error: " + err });
            });
            request.on('done', function (returnValue) {
                res.json({ Success: "Driver " + req.params.driver_no + " was updated!" });
            })
        } else {
            res.json({ Error: "Driver " + req.params.driver_no + " does not exist." });
        }
    });
})

// DELETE /drivers/:driver_no : deletes a single driver
.delete(function (req, res) {
    var drivercheck = driverExists(req.params.driver_no, function (result) {
        if (result == true) {
            var request = sql.request();
            request.input('DriverNo', mssql.Int, req.params.driver_no);
            request.execute('DeleteDriver', function (err, recordsets, returnValue) {
                if (err) {
                    console.log("Stored Procedure 'DeleteDriver' execute error: " + err);
                }
            });
            request.on('error', function (err) {
                res.json({ Error : "Stored Procedure 'DeleteDriver' execute error: " + err });
            });
            request.on('done', function (returnValue) {
                res.json({ Success: "Driver " + req.params.driver_no + " was deleted!" });
            })
        } else {
            res.json({ Error: "Driver " + req.params.driver_no + " does not exist." });
        }
    });
});

driver.route('/')
// GET /drivers : returns all drivers
.get(function (req, res) {
    var request = sql.request();
    var data = [];
    request.query('select * from dbo.driver');
    request.on('row', function (row) {
        data.push(row);
    });
    request.on('done', function(returnValue) {
        res.json({ drivers : data });
    });
})

// POST /drivers : creates 1 new driver
.post(function (req, res) {
    var drivercheck = driverExists(req.body.DriverNo, function (result) {
        if (result == false) {
            
            var creation = {};
            creation.Password = (req.body.Password) ? req.body.Password : null;
            creation.GcmRegisteredId = (req.body.GcmRegisteredId) ? req.body.GcmRegisteredId : null;
            creation.LastUpdatedTime = new Date();
            
            var request = sql.request();
            request.input('DriverNo', mssql.Int, req.body.DriverNo);
            request.input('Password', mssql.VarChar(10), creation.Password);
            request.input('GcmRegisteredId', mssql.VarChar(mssql.MAX), creation.GcmRegisteredId);
            request.input('LastUpdatedTime', mssql.DateTime2, creation.LastUpdatedTime);
            
            request.execute('CreateDriver', function (err, recordsets, returnValue) {
                if (err) {
                    console.log("Stored Procedure 'CreateDriver' execute error: " + err);
                }
            });
            request.on('error', function (err) {
                res.json({ Error : "Stored Procedure 'CreateDriver' execute error: " + err });
            });
            request.on('done', function (returnValue) {
                res.json({ Success: "Driver " + req.body.DriverNo + " was created!" });
            })
        }
        else {
            res.json({ Error: "Driver already exists." });
        }
    });
});

module.exports = driver;
