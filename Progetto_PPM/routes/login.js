var express = require('express');
var passport = require('passport');
var Account = require('../models/User');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});


module.exports = router;