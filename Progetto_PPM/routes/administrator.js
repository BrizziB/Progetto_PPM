var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('administrator2',{title: 'Pagina di amministrazione', user:req.user, adminPage : true});
});

module.exports = router;
