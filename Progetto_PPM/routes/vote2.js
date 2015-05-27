var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
	var utente= req.session.utente;
	res.render('vote2', utente);
});

module.exports = router; 
