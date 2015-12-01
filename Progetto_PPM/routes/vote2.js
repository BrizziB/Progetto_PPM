var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
	var utente= req.session.utente;
	res.locals.timer=true;
	res.locals.user=req.user;
	res.render('vote2', utente);
});

module.exports = router; 
