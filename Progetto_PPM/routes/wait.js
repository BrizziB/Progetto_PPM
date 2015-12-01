var express = require('express');
var router = express.Router();
var app=express();

/* GET users listing. */
router.get('/', function(req, res, next) {
	var admin = req.app.get('admin');  		
	var titCat ={};
	console.log(res.locals);
		
	titCat.titolo = admin.getCurrentTitle();
	titCat.categoria = admin.getCurrentCategory();
	titCat.title='Ecco i Risultati';
	titCat.user = req.user;
	
	console.log('titolo e categoria: ', titCat.categoria, titCat.titolo);
	switch(req.query.type){
  	case "start": 
  		res.render('wait',{title: 'Attendere l\'inizio della rappresentazione!',user: req.user});
  		break;
  	
  	case "play":
  		titCat.title='Rappresentazione in corso';
  		res.render('wait',titCat);
  		break;
  		
  	case "title":
  		titCat.categoria = null;
  		res.render('waitTitleCategory',titCat); 	
  		break;
  		
  	case "category":  
  		res.render('waitTitleCategory',titCat);
		break;
	
  	case "result": 
  		res.render('waitResult',{title: 'Risultati del match', user: req.user});
  		break;
  	
  	default:
  		console.log('Errore: tipo di wait non supportato!');
  }  
});

module.exports = router;

