var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socketServer = require('socket.io');
var session=require('express-session');
//var FileStore= require('session-file-store')(session);

var routes = require('./routes/index');
var users = require('./routes/users');
var vote = require('./routes/vote');

var Utente = function(){
	this.votato =  false;
	this.aggiungiTitolo = true;
};

//TODO: Inizializzare socket.io per bene

var app = express();
var io = new socketServer();
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
var sessionMiddleWare= session({secret:'progettoPPM', resave: false, saveUninitialized : false});


io.use(function(socket, next) {
    sessionMiddleWare(socket.request, socket.request.res, next);
});


app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleWare);

var test= {title : 'Voto', aggiungiTitolo : true};

app.use('/', routes);
app.use('/users', users);
app.use('/vote',function(req,res,next){
			req.session.test=test;
			if (req.session.utente === undefined){
				req.session.utente=new Utente();
			}
			next();
		}
		,vote);

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

//variabile test

function comparabile(stringa){
    return stringa.toLowerCase().replace(/ /g,"");
}

function aggiungiVoti(elemento, nVoti){
	if (nVoti === undefined){
		nVoti = 1;
	}
	//TO DO: implementare la funzione
}

function aggiornaSessioneDopoVoto(socket){
	var sess = socket.request.session;
	sess.utente.aggiungiTitolo = false;
	sess.utente.votato = true;
	sess.save();	
}

var listaTitoli = ['Test1', 'Test2','Test3'];

var socketList=[];

io.on('connection',function(socket){
	console.log('User Connected');
	//socketList.push(socket);
	console.log(socketList.length);
	socket.emit('aggiornaListaVoto', listaTitoli, listaTitoli.length);
	socket.on('nuovoElemento',function(testo){
		var esistente = false;
		var testoDaComparare = comparabile(testo);
		for(var indice=0, lunghezza =listaTitoli.length; indice<lunghezza; indice++){
			if (comparabile(listaTitoli[indice])===testoDaComparare){
				esistente=true;
				break;
			}			
		}
		if (esistente===false){
			listaTitoli[listaTitoli.length]=testo;
			io.emit('aggiornaListaVoto',[testo],listaTitoli.length);		
		}
		else
			{
			//TO DO: aggiungere logica per confermare come voto
				aggiungiVoti(testo);
				socket.emit('votato',testo);
			}
		aggiornaSessioneDopoVoto(socket);
	});
	socket.on('voto',function(voto){
		aggiornaSessioneDopoVoto(socket);
		//come fare ad aggiornare varie finestre ed evitare il voto da esse?
		/*var socketSess=socket.request.session;
		console.log(socketSess);
		console.log(socketList[0].request.sess);
		for (var i=0, nSocks=socketList.length; i<nSocks;i++){
			var localSess = socketList[i].request.session;
			console.log(localSess);
			if (localSess===socketSess){
				socketList[i].emit('disabilitaVoto');
			}
		}*/
		//socket.emit('disabilitaVoto');
	});
});

module.exports = app;
