var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socketServer = require('socket.io');
var session = require('express-session');
var HashMap = require('hashmap');
var mongoose = require('mongoose');
var FileStore = require('session-file-store')(session);

//classi personali
var ListaOggettiVoti=require('./classes/ListaOggettiVoti.js');
var adminVars = require('./classes/Admin.js');
var team = adminVars.team;
var Admin = adminVars.Admin;

//inizializzazione passport e strategie
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google').Strategy;
var FacebookStrategy =require('passport-facebook').Strategy;

//definizione routes
var routes = require('./routes/index');
var users = require('./routes/users');
var wait = require('./routes/wait');
var waitResult = require('./routes/waitResult');
var administrator = require('./routes/administrator');
var vote = require('./routes/vote');
var vote2 = require('./routes/vote2');
var login = require('./routes/login');
var registrazione = require('./routes/registrazione');

//modelli mongoose
var User = require('./models/User.js');

//TODO: eliminare riferiminti a aggiungiTitolo
var Utente = function(){
	this.votato =  false;
	this.aggiungiTitolo = true;
};


var fileStore = new FileStore({
	ttl: 60 * 60 * 5
});
var sessionMiddleWare = session({
	secret: 'progettoPPM', 
	resave: false,
    saveUninitialized: true,
    store: fileStore
});

var app = express();
var io = new socketServer();
app.set('io',{io: io});
var whilePlay = io.of("/whilePlay");
var winVote = io.of("/winVote");
var votoTitoloCategoria = io.of("/votoTitoloCategoria");
var matchResult = io.of("/matchResult");
var adminChan = io.of("/adminChan");
app.io = io;
io.use(function(socket, next){
	sessionMiddleWare(socket.request, socket.request.res, next);
});

var admin = new Admin(io);
app.set('admin',admin);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleWare);

var mongoUrl = "mongodb://localhost/superPPM";
mongoose.connect(mongoUrl, function(error) {
    // handle the error case
    if (error) {
        console.error("Failed to connect to the Mongo server!!");
        console.error(error);
        throw error;
    } else {
        console.log("connected to mongo server at: " + mongoUrl);
    }
});
//require("./passport-configuration");
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.use(new GoogleStrategy({
	returnURL: 'http://localhost:3000/auth/google/return',
	realm: 'http://localhost:3000'
},function(identifier, profile, done){
	User.findOne({'profileID': identifier},function(err,user){
		if(err){
			return done(err);
		}
		if (!user){
			user = new User({
				username: profile.username,
				provider:'google',
				profileID: identifier
			});
			user.save(function(err){
				if (err){
					console.log(err);
				}
				return done(err,user);
			});
		}else{
			return done(err,user);
		}
	});	
}));

passport.use(new FacebookStrategy({
    clientID: 'nunsesa',
    clientSecret: 'nunsesa',
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
},
function(accessToken, refreshToken, profile, done) {
    User.findOne({
        'profileID': profile.id 
    }, function(err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            user = new User({
                username: profile.username,
                provider: 'facebook',
                profileID: profile.id
            });
            user.save(function(err) {
                if (err) {
                	console.log(err);
                	}
                return done(err, user);
            });
        } else {
            return done(err, user);
        }
    });
}
));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//controlla se sei autenticato (middleware)
function ensureAuthenticated(req, res, next) {
	  if (req.isAuthenticated()) { return next(); }
	  res.redirect('/login');
	}

//XXX:CODICE PER IL TEST
var noCurrentPage = false;
/*app.get('/test',function(req,res,next){
	res.render('paginaControllo',{title:"Pagina di Controllo per test", noCurrentPage: noCurrentPage, user: false});
}); */
///
app.get('/redirect', function(req, res, next){
	res.render('redirect', {title: 'redirect in corso'});
});

app.get('/logout', function(req, res) {
    req.logout();
    req.session.utente=null;
    res.redirect('/');
});

app.get('/redirectPage', function(req, res, next){
	res.redirect('/');
});
app.use('/administrator',function(req,res,next){
	if(req.isAuthenticated() === true && req.user.admin===true){
		return next();
	}else{
		res.redirect('/');
	}
}, administrator);

app.all('*',function(req, res, next){
	console.log('utente:',req.user);
	if(req.isAuthenticated() === true && req.originalUrl!==admin.getCurrentPage()){
		if(noCurrentPage === true){
			return next();
		}
		res.redirect(admin.getCurrentPage());
	}
	else{
		return next();
	}
});

app.use('/',routes);
app.use('/login',login);
app.use('/registrazione', registrazione);

app.all('*', function(req,res,next){
	
	if(req.isAuthenticated() === true){
		if (req.session.utente === null || req.session.utente === undefined){
			req.session.utente=new Utente();
		}
		req.session.utente.sessionID=req.user.username;
		req.session.utente.votato=req.user.votato;
		return next();
		}
	else{
		res.redirect('/');
		}

});
app.use('/users', users);
app.use('/wait', wait);
app.use('/waitResult', waitResult);
app.use('/vote',vote);
app.use('/vote/matchwinner',vote2);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

function comparabile(stringa){
    return stringa.toLowerCase().replace(/ /g,"");
}

function aggiornaSessioneDopoVoto(socket){
	var sess = socket.request.session;
	sess.utente.aggiungiTitolo = false;
	sess.utente.votato = true;
	sess.save();
	//var User = require('./models/User');
	User.update({username: sess.utente.sessionID},{ $set:{votato: true}},function (err, numberAffected, raw) {
		  if (err) {return handleError(err);}
		});	
}

//XXX Funzione con bug: emette solo sul namespace '/'
function disabilitaVotoUtente(sess,sockAttuali){
	var sessID = sess.utente.sessionID;
	console.log(sessID);
	for(var i=0, l=sockAttuali.length; i<l; i++){
		if (sessID===sockAttuali[i].request.session.utente.sessionID){
			sockAttuali[i].emit('disabilitaVoto');
		}
	}	
}

function disabilitaVotoUtenteNSP(sess,namespace){
	var sessID = sess.utente.sessionID;
	var sockAttuali=io.of(namespace || "/").connected;
	//console.log(sockAttuali);
	for(var i in sockAttuali){
		if (sessID===sockAttuali[i].request.session.utente.sessionID){
			sockAttuali[i].emit('disabilitaVoto');
		}
	}	
}


whilePlay.on('connection', function(socket){
	console.log("connessione a whilePlay");
	socket.emit('welcomeWait', admin.blueTeam().getFouls(), admin.redTeam().getFouls(), admin.blueTeam().getPenalty(), admin.redTeam().getPenalty(), admin.getCurrentTitle(), admin.getCurrentCategory());
	
	socket.on('redFaul', function(){
		admin.redTeam().addFoul();
		console.log("falli dei red: "+admin.redTeam().getFouls()+" ! ");
		whilePlay.emit('faul', admin.redTeam().getTeamName(), admin.redTeam().getFouls(), admin.redTeam().getPenalty());
	});
	
	socket.on('blueFaul', function(){
		admin.blueTeam().addFoul();
		console.log("falli dei blue: "+admin.blueTeam().getFouls()+" ! ");
		whilePlay.emit('faul', admin.blueTeam().getTeamName(), admin.blueTeam().getFouls(), admin.blueTeam().getPenalty());
	});
	
});
winVote.on('connection', function(socket){
	console.log("Connessione a winVote ! ");
	socket.emit('welcomeVote', admin.blueTeam().getVotes(), admin.redTeam().getVotes());
	
	socket.on('blueClick', function(){
		aggiornaSessioneDopoVoto(socket);
		disabilitaVotoUtenteNSP(socket.request.session,'/winVote');
		admin.blueTeam().addVote();
		console.log("hanno votato blu");		
		winVote.emit('blueVote', admin.blueTeam().getVotes());
		console.log(admin.blueTeam().getVotes());
	});
	socket.on('redClick', function(){
		aggiornaSessioneDopoVoto(socket);
		disabilitaVotoUtenteNSP(socket.request.session,'/winVote');
		admin.redTeam().addVote();
		console.log("hanno votato rosso");		
		winVote.emit('redVote', admin.redTeam().getVotes());
	});	
	
});
matchResult.on('connection', function(socket){
	console.log("connessione a matchResult");
	socket.emit('welcomeResult', admin.blueTeam().getVotes(), admin.redTeam().getVotes(), admin.blueTeam().getPunteggi(), admin.redTeam().getPunteggi(), admin.getCurrentMatchNum());	
	console.log('voti blu: ',admin.blueTeam().getVotes(),'voti rossi: ',  admin.redTeam().getVotes(), 'punteggi blu', admin.blueTeam().getPunteggi(), 'punteggi rossi: ', admin.redTeam().getPunteggi(),'match corrente: ', admin.getCurrentMatchNum());

});

	// ---- Boris -----FINE
	
	// ---- Pitti -----
votoTitoloCategoria.on('connection', function(socket){
	console.log('Connessione!');
//XXX: codice poco sicuro...
	var listaTitoli = admin.getTitlesCats();
	var listaOggetti = [];
	var listaOggettiID = [];
	(function(){
		listaOggetti =listaTitoli.listaOggetti();
		var indice;
		for (indice in listaOggetti ){
			listaOggettiID.push(listaTitoli.iDDaOggetto(listaOggetti[indice]));
		}
	}());
	socket.emit('aggiornaListaVoto',listaOggetti, listaOggettiID, listaTitoli.numeroOggetti());
	socket.emit('aggiornaVoti',listaTitoli.listaVoti());
	//console.log(listaTitoli);
	socket.on('nuovoElemento',function(testo){
		var esistente = false;
		var testoDaComparare = comparabile(testo);
		listaTitoli.ciclaLista(function(nVoti,titolo){
			if (!esistente && comparabile(titolo)===testoDaComparare){
				esistente= true;
			}
		});
		//TODO: in realtà non va messo qui e va temporizzato		
		if (esistente===false){
			listaTitoli.aggiungiOggetto(testo,1);
			votoTitoloCategoria.emit('aggiornaListaVoto',[testo],[listaTitoli.iDDaOggetto(testo)],listaTitoli.numeroOggetti());
		}
		else
			{
				//TODO: controllare!!!
				listaTitoli.aggiungiVoto(testo);
				socket.emit('votato',testo);
			}
		aggiornaSessioneDopoVoto(socket);
		//disabilitaVotoUtente(socket.request.session,io.sockets.sockets);
		disabilitaVotoUtenteNSP(socket.request.session,'/votoTitoloCategoria');
		votoTitoloCategoria.emit('aggiornaVoti',listaTitoli.listaVoti());
	});
	socket.on('voto',function(voto){
		aggiornaSessioneDopoVoto(socket);
		//aggiungiVoti(voto,listaTitoliContenitori);
		listaTitoli.aggiungiVoto(voto);
		disabilitaVotoUtenteNSP(socket.request.session,'/votoTitoloCategoria');
		//disabilitaVotoUtente(socket.request.session,io.sockets.sockets);
		votoTitoloCategoria.emit('aggiornaVoti',listaTitoli.listaVoti());
	});

	socket.on('richiediElementoMancante',function(idOggetto){
		var oggetto =listaTitoli.oggettoDaID(idOggetto);
		socket.emit('riceviElementoMancante',oggetto, idOggetto,listaTitoli.prendiVoti(oggetto));
	});
	/* - Parte per il pulsante reset su vote.jade -
	 * if (app.get('env') === 'development') {
		socket.on('reset',function(){
			delete socket.request.session.utente;
			socket.request.session.save();
			votoTitoloCategoria.emit('refresh');
		});
	}*/
	
	// ---- Pitti -----FINE
	//FIXME la variabile "votato" dovrà essere posta a false ogni volta che si passa di fase. Sennò il voto in scegli categoria blocca anche il voto in scegli titolo e vote2
});

    var selezionaFase = function(fase, socket){
		console.log('fase: ',fase);

		switch(fase){
		case 'faseUno':
			admin.phase1();
			console.log('inizio fase1');

			break;
		case 'faseDue':
			admin.phase2();
			console.log('inizio fase2');
			break;
			
		case 'faseVotazione':
			socket.emit('updatePhase',fase);
			break;
			
		case 'faseZero':
			admin.phase0();
			console.log('inizio fase0');
			break;
			
		case 'fasePlay':
			console.log('faseplay da admin');
			admin.startPlay();
			break;
		case 'inizioSpettacolo':
			admin.startSpettacolo();
			break;
		case 'faseIntervallo':
			socket.emit('updatePhase',fase);
			break;
		

		default:
			console.log('Errore: impossibile controllare la votazione!');
		}
	};

adminChan.on('connect',function(socket){
	console.log('Admin connesso!');
	var titleTimer = admin.getTitleTimer();
	var catTimer = admin.getCatTimer();
	var waitTimer = admin.getWaitTimer();
	var winnerTimer = admin.getWinnerTimer();
	var redTeam = admin.redTeam();
	var blueTeam = admin.blueTeam();
	socket.emit('refresh',[titleTimer,catTimer,waitTimer,winnerTimer,blueTeam.getPoints(),blueTeam.getFouls(),redTeam.getPoints(),redTeam.getFouls(), redTeam.getPenalty(), blueTeam.getPenalty()], admin.isPhase());
	socket.on('changeTimer',function(type,time){
		switch(type){
		case 'Titolo':
			admin.setTitleTimer(time);
			break;
		case 'Categoria':
			admin.setCatTimer(time);
			break;
		case 'Attesa':
			admin.setWaitTimer(time);
			break;
		case 'Vincitore':
			admin.setWinnerTimer(time);
			break;
		default:
			console.log('Errore: impossibile selezionare il timer da modificare!');
	}
	});

	socket.on('stopVoto',function(){
		admin.stopVotazione();
	});
	socket.on('controlloVotazione',selezionaFase, socket);
	
	socket.on('inizioFase',function(){
		console.log('fase ricevuta da app.js: ',admin.isPhase())
		selezionaFase(admin.isPhase(), socket);
	});
	
	socket.on('reset',function(){
		admin.resetSpettacolo();
	});
	
	socket.on('fallo',function(type){		
			switch(type){
				case 'rosso':
					admin.redTeam().addFoul();
					adminChan.emit('faul', 'red', admin.redTeam().getFouls(), admin.redTeam().getPenalty(), admin.redTeam().getPoints());
					break;
				case 'blu':
					admin.blueTeam().addFoul();
					adminChan.emit('faul', 'blue', admin.blueTeam().getFouls(), admin.blueTeam().getPenalty(), admin.blueTeam().getPoints());
					break;
				default:
					console.log('Errore: impossibile attribuire il fallo');
			
			}
	});
	
	socket.on('rimuovi',function(type){		
		switch(type){
			case 'rosso':
				admin.redTeam().removeFouls();
				adminChan.emit('remove', 'red', admin.redTeam().getFouls(), admin.redTeam().getPenalty(), admin.redTeam().getPoints());
				break;
			case 'blu':
				admin.blueTeam().removeFouls();
				adminChan.emit('remove', 'blue', admin.blueTeam().getFouls(), admin.blueTeam().getPenalty(), admin.blueTeam().getPoints());
				break;
			default:
				console.log('Errore: impossibile rimuovere il fallo');
		
		}
});
	
			
});

//XXX:CODICE PER IL TEST
io.of("paginaControllo").on('connect',function(socket){
	socket.on('attivaDisattivaPagina',function(){
		noCurrentPage = !noCurrentPage;
		console.log('noCurrentPage impostato su: ', noCurrentPage);
	});
	
	socket.on('eliminaVoto',function(nome){
		if (nome ===''){
			User.update({},{$set:{votato:false}},{multi:true}).exec();
		}
		else{
			User.update({username: nome},{$set:{votato:false}}).exec();
		}
			
	});
	
	socket.on('controlloVotazione',selezionaFase);
});

io.of("timerChan").on('connect',function(socket){
	if(noCurrentPage === false){
		socket.emit('timer',admin.getTimer());
	}
});
//  [  ]
module.exports = app;