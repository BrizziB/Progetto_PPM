var express = require('express');
var router = express.Router();
var app=express();

/* GET users listing. */
router.get('/', function(req, res, next) {
	var admin = req.app.get('admin');  		
	var titCat =(function(){
		this.categoria = admin.getCurrentCategory();
		this.titolo = admin.getCurrentTitle();
	})();
	switch(req.query.type){
  	case "start": 
  		res.render('wait');
  		break;
  	
  	case "play":
  		res.render('wait');
  		break;
  		
  	case "title":
  		titCat.categoria = null; 	

  	case "category":
  		
  		res.render('waitTitleCategory',titCat);
		break;
	
  	case "result": 
  		res.render('waitResult');
  		break;
  	
  	default:
  		console.log('Errore: tipo di wait non supportato!');
  }  
});

module.exports = router;

