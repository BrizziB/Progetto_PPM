var express = require('express');
var router = express.Router();
var app =express();

/* GET users listing. */
router.get('/', function(req, res, next) {
	//var test = req.session.test;
	var layoutPagina={};
	if (req.session.utente.votato===false){
		layoutPagina.title="Seleziona il titolo!";
		layoutPagina.titoloLista="Seleziona il titolo dalla lista";
	}
	else{
		layoutPagina.title="Attendi la fine della votazione...";
		layoutPagina.titoloLista="Ecco i risultati in tempo reale";
	}
	layoutPagina.aggiungiTitolo= req.session.utente.aggiungiTitolo; 
	layoutPagina.votoAbilitato= req.session.utente.votato?false:true;
	if (app.get('env') === 'development') {
		layoutPagina.dev=true;
	}
	res.render('vote',layoutPagina);
});

module.exports = router;
