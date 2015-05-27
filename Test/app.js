//////////////////////////////////////////////////////// REQUIRE /////////////////////////////////////////////////////////////////////////////

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socketServer = require('socket.io');
var session = require('express-session');
var methodOverride =require('method-override');
var secret = 'session-secret-key';
var store = new session.MemoryStore();
var myCookieParser = cookieParser('progettoPPM');
var routes = require('./routes/index');
var users = require('./routes/users');
var wait = require('./routes/wait');
var admin = require('./routes/admin');
var vote = require('./routes/vote');

var Utente = function(){
	this.canVote = true;
};

var team = function (teamName){
	this.teamName=teamName;
	this.numFauls=0;
	this.numPen=0;
	this.points=0;
};

function contenitoreVoti(nomeOggetto, numeroVoti){
	if(!numeroVoti)
		{numeroVoti=0;}
	var nome=nomeOggetto;
	var voti=numeroVoti;
	this.aggiungiVoti=function(nVoti){
		if(!nVoti){
			nVoti=1;
		}
		voti+=nVoti;
	};
	this.rimuoviVoti=function(nVoti){
		if(!nVoti){
			nVoti=1;
		}
		voti-=nVoti;
	};	
	this.setVoti=function(nVoti){
		voti=nVoti;
	};
	this.getVoti=function(){
		return voti;
	};	
	this.getNome=function(){
		return nome;
	};
}


var app = express();
var io = new socketServer();
app.io=io;

//var FileStore = require('session-file-store')(session);
//var store=new FileStore(session);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

///////////////////////////////////////////////////////// MIDDLEWARES /////////////////////////////////////////////////////////////////////////
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

var sessionMiddleWare = session({
	secret: 'progettoPPM', 
	resave: false,
    saveUninitialized: true});

io.use(function(socket, next){
	sessionMiddleWare(socket.request, socket.request.res, next);
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleWare);

var test= {title: 'Voto'};

///////////////////////////////////////////////////////// ROUTING PATH //////////////////////////////////////////////////////////////////////////
app.use('/', routes);
app.use('/users', users);
app.use('/wait', wait);
app.use('/admin', admin);
app.use('/vote', function(req, res, next){
	if(req.session.utente === undefined){
		req.session.utente = new Utente();
	}
	next();
}
, vote);

//////////////////////////////////////////////////// 404 & ERROR HANDLERS /////////////////////////////////////////////////////////////////////
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

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

/////////////////////////////////////////////////SESSIONE CON SOCKET.IO ///////////////////////////////////////////////////////////////

// variabili per vote.jade 
var red = new contenitoreVoti("red", 0);
var blue = new contenitoreVoti("blue", 0);
//variabili per wait.jade

var blueTeam=new team("blue");
var redTeam=new team("red");

//funzioni per vote
function findClientsSocket(roomId){
	var socketList=[];
	var client = io.of("/");
	if(client){
		for (var id in client.connected) {
			var index = client.connected[id].rooms.indexOf(roomId) ;
			if (index !== -1){
				socketList.push(client.connected[id]);
			}
			else {
				socketList.push(client.connected[id]);
			}
		}
	}
	return socketList;
}
function updateSession(socket){
	var sess = socket.request.session;
	sess.utente.canVote = false;
	sess.save();
	findClientsSocket();
	var socketList = findClientsSocket();
	for(var i=0; i<socketList.length; i++){
		socketList[i].emit("disabilitaVoto");
	}
}

io.on('connection', function(socket){
	console.log("Connessione ! ");
	socket.emit('welcomeVote', blue.getVoti(), red.getVoti());
	socket.emit('welcomeWait', blueTeam.numFauls, redTeam.numFauls, blueTeam.numPen, redTeam.numPen);
	
	socket.on('blueClick', function(){
		updateSession(socket);
		blue.aggiungiVoti(1);
		console.log("hanno votato blu");		
		io.emit('blueVote', blue.getVoti());
	});
	socket.on('redClick', function(){
		updateSession(socket);
		red.aggiungiVoti(1);
		console.log("hanno votato rosso");
		io.emit('redVote', red.getVoti());
	});
	
	socket.on('stopVoting', function(){
		if(red.getVoti()>blue.getVoti()){
			console.log("evento STOP VOTING rosso rilevato");
			redTeam.points++;
			red.setVoti(0);
			blue.setVoti(0);
			io.emit('stopVote', 'red', redTeam.points, blueTeam.points);
		}
		if(blue.getVoti()>red.getVoti()){
			console.log("evento STOP VOTING blu rilevato");
			blueTeam.points++;
			red.setVoti(0);
			blue.setVoti(0);
			io.emit('stopVote', 'blue', redTeam.points, blueTeam.points);
		}
		else{
			io.emit('stopVote', 'PARI');
		}
	});
	
	socket.on('redFaul', function(){
		redTeam.numFauls++;
		console.log("falli dei red: "+redTeam.numFauls+" ! ");
		if(redTeam.numFauls===5){
			redTeam.numPen++;
			redTeam.numFauls=0;
		}
		io.emit('faul', redTeam.teamName, redTeam.numFauls, redTeam.numPen);
	});
	
	socket.on('blueFaul', function(){
		blueTeam.numFauls++;
		console.log("falli dei blue: "+blueTeam.numFauls+" ! ");
		if(blueTeam.numFauls===5){
			blueTeam.numPen++;
			blueTeam.numFauls=0;
		}
		io.emit('faul', blueTeam.teamName, blueTeam.numFauls, blueTeam.numPen);
	});
	socket.on('goToWait1', function(){
		io.emit('goToWait');
	});
});

////////////////////////////////////////////////////// EXPORT /////////////////////////////////////////////////////////////////////////////////

module.exports = app;

