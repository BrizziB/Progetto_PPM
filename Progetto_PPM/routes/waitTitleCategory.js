var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	var admin = req.app.get('admin');
	var titCat;
	titCat.titolo = admin.getCurrentTitle();
	if(req.query.type==='category'){
		titCat.categoria = admin.getCurrentCategory();
	}else{
		titCat.categoria = null;
	}
		
});

module.exports = router;
