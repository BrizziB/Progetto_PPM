var express = require('express');
var router = express.Router();
var app =express();
var layoutPagina={};

/* GET users listing. */

router.get('*',function(req,res,next){
	if (req.session.utente.votato===true){
		layoutPagina.title="Attendi la fine della votazione...";
		layoutPagina.titoloLista="Ecco i risultati in tempo reale";
	}
	layoutPagina.user=req.user;
	layoutPagina.timer = true;
	layoutPagina.votoAbilitato= req.session.utente.votato?false:true;
	layoutPagina.titoloScelto = false;
/* - Parte per il pulsante reset su vote.jade -	
  if (app.get('env') === 'development') {
		layoutPagina.dev=true;
	}*/
	next();
});
//XXX: redirect temporaneo, da decidere struttura pagine con Boris!
router.get('/',function(req,res,next){
	res.redirect('/vote/titolo');
});

router.get('/titolo', function(req, res, next) {
	if (req.session.utente.votato===false){
		layoutPagina.title="Seleziona il titolo!";
		layoutPagina.titoloLista="Seleziona il titolo dalla lista";
	}
	layoutPagina.aggiungiTitolo= layoutPagina.votoAbilitato; 
	res.render('vote',layoutPagina);
});

router.get('/categoria', function(req, res, next) {
	if (req.session.utente.votato===false){
		layoutPagina.title="Seleziona la categoria!";
		layoutPagina.titoloLista="Seleziona la categoria dalla lista";
	}
	layoutPagina.aggiungiTitolo = false;
	layoutPagina.aggiungiTitolo= false;
	var admin = req.app.get('admin');
	layoutPagina.titoloScelto = admin.getCurrentTitle();
	

	
	res.render('vote',layoutPagina);
});
module.exports = router;
