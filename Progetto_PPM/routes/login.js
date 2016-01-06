var express = require('express');
var passport = require('passport');
var Account = require('../models/User');
var router = express.Router();

router.get('/', function(req, res) {
	var failure=false;
	if (req.query.failure=== 'true'){
		failure=true;
		
	}
	
    res.render('login', {title: 'Login', failLogin: failure});
});

router.post('/', passport.authenticate('local', {failureRedirect: '/login?failure=true'}), function(req, res, next) {
    console.log('sono autenticato');
	var admin=req.app.get('admin');
	//console.log('redirect di wait', admin.getCurrentPage());
	//admin.clientRedirect();
	res.redirect('/redirect');
	
});


module.exports = router;