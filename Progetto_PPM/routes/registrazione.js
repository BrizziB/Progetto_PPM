var express = require('express');
var passport = require('passport');
var Account = require('../models/User');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('registrazione', {title: 'Registrazione' });
});

router.post('/', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('registrazione', { info : "Nome utente già presente", title : 'Registrazione' });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

module.exports = router;