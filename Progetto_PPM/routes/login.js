var express = require('express');
var passport = require('passport');
var Account = require('../models/User');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('login');
});

router.post('/', passport.authenticate('local'), function(req, res) {
    console.log('sono autenticato eh!');
	var admin=req.app.get('admin');
	//console.log('redirect di wait', admin.getCurrentPage());
	//admin.clientRedirect();
	res.redirect('/redirect');
	
});


module.exports = router;