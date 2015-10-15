var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	var admin = req.app.get('admin');  		
	var titCat;
	titCat.categoria = admin.getCurrentCategory();
	switch(req.query.type){
  	case "play": 
  		res.render('wait');
  		break;
  	
  	case "title":
  		titCat.categoria = null; 	

  	case "category":
  		titCat.titolo = admin.getCurrentTitle();
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
