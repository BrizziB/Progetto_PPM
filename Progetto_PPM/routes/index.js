var express = require('express');
var router = express.Router();
//var app =express();

/* GET home page. */
/*router.get('/', function(req, res, next) {
	var admin =req.app.get('admin');
	console.log(admin!==undefined);
	if(req.isAuthenticated() === true){
		res.redirect(admin.getCurrentPage());
		}
	else{
		res.render('index', { user : req.user });
	}
});*/

router.get('/', function(req, res, next) {
		res.render('index', { user : req.user });
});

module.exports = router;
