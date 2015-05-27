var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	//console.log(req.session.utente);
	//req.session.reload();
	var test = req.session.test;
	test.aggiungiTitolo= req.session.utente.aggiungiTitolo; 
	test.votoAbilitato= req.session.utente.votato?false:true;
	//console.log('test');
	res.render('vote',test);
});

module.exports = router;
