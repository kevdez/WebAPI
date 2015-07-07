var express = require('express');
var router = express.Router();

/* GET API docs page. */
router.get('/', function (req, res) {
    res.render('api', { title: 'API documentation' });
});


module.exports = router;