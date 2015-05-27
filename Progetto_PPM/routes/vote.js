var express = require('express');
var router = express.Router();
var app =express();

/* GET users listing. */
router.get('/', function(req, res, next) {
	var test = req.session.test;
	test.aggiungiTitolo= req.session.utente.aggiungiTitolo; 
	test.votoAbilitato= req.session.utente.votato?false:true;
	if (app.get('env') === 'development') {
		test.dev=true;
	}
	res.render('vote',test);
});

module.exports = router;
