var express = require('express');
var passport = require('passport');
var Account = require('../models/User');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('login');
});

router.post('/', passport.authenticate('local'), function(req, res) {
    console.log('sono autenticato eh!');
    req.app.io.emit('redirect');
	res.redirect('/');
});


module.exports = router;