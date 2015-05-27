var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socketServer = require('socket.io');
var session=require('express-session');
var HashMap = require('hashmap');
//var FileStore= require('session-file-store')(session);

var routes = require('./routes/index');
var users = require('./routes/users');
var vote = require('./routes/vote');

var Utente = function(){
	this.votato =  false;
	this.aggiungiTitolo = true;
};

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
				req.session.utente.sessionID=req.sessionID;
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



function comparabile(stringa){
    return stringa.toLowerCase().replace(/ /g,"");
}

function aggiungiVoti(elemento, lista, nVoti){
	if (nVoti === undefined){
		nVoti = 1;
	}
	for (var i=0, l=lista.length;i<l;i++){
		if (lista[i].prendiNomeOggetto()===elemento){
			lista[i].aggiungiVoti(nVoti);
			return;
		}
	}
}

function aggiornaSessioneDopoVoto(socket){
	var sess = socket.request.session;
	sess.utente.aggiungiTitolo = false;
	sess.utente.votato = true;
	sess.save();	
}

function disabilitaVotoUtente(sess,sockAttuali){
	var sessID = sess.utente.sessionID;
	for(var i=0, l=sockAttuali.length; i<l; i++){
		if (sessID===sockAttuali[i].request.session.utente.sessionID){
			sockAttuali[i].emit('disabilitaVoto');
		}
	}
	
}

function listaOggettiVoti(){
	var contenitore=new HashMap();
	if (arguments.length!==0){
		for(var i=0,l=arguments.length;i<l;i++){
			contenitore.set(arguments[i],0);
		}
	}	
	this.aggiungiOggetto=function(nomeOggetto,nVoti){
		if (contenitore.has(nomeOggetto)){
			return false;
		}
		if (nVoti===undefined){
			nVoti=0;
		}
		contenitore.set(nomeOggetto,nVoti);
		return true;
	};
	this.rimuoviOggetto=function(nomeOggetto){
		contenitore.remove(nomeOggetto);
	};
	
	this.prendiVoti=function(nomeOggetto){
		return contenitore.get(nomeOggetto);
	};
	this.impostaVoto=function(nomeOggetto,nVoti){
		contenitore.set(nomeOggetto,nVoti);
	};
	
	var cambiaVoto=function(nomeOggetto,nVoti){
		var sostituto;
		if(contenitore.has(nomeOggetto)){
			sostituto= nVoti+contenitore.get(nomeOggetto);
		}
		else{
			sostituto=nVoti;
		}
		contenitore.set(nomeOggetto,sostituto);
		console.log(nomeOggetto);
	};
	
	this.modificaVoto=function(nomeOggetto,nVoti){
		cambiaVoto(nomeOggetto,nVoti);
	};
	this.aggiungiVoto=function(nomeOggetto,nVoti){
		if (nVoti===undefined){
			nVoti=1;
		}
		else if (nVoti <= 0){
			return false;
		}
		cambiaVoto(nomeOggetto,nVoti);
		return true;
	};
	this.rimuoviVoto=function(nomeOggetto,nVoti){
		if (nVoti===undefined){
			nVoti=1;
		}
		else if (nVoti <= 0){
			return false;
		}
		cambiaVoto(nomeOggetto,0-nVoti);
		return true;
	};
	
	this.listaOggetti=function(){
		return contenitore.keys();
	};
	this.numeroOggetti=function(){
		return contenitore.count();
	};
	this.listaOrdinataPerNome=function(){
		return contenitore.keys().sort();
	};
	/*this.listaOrdinataPerVoti=function(descending){
		var compara;
		if(descending){
			compara=function(a,b){return b-a;};
		}else{
			compara=function(a,b){return a-b;};
		}
		var listaValoriVoti = contenitore.values().sort(compara());
		var listaOrdinata=[];
		var contTemp=contenitore.clone();
		contTemp.forEach(function(value,key){
			
		});
	};*/
	this.ciclaLista=function(funzione){
		contenitore.forEach(funzione);
	};
}

//contenitore voti
function  contenitoreVoti(nomeOggetto,numeroVoti){
	
	if (numeroVoti===undefined || numeroVoti < 0){
		numeroVoti=0;
	}
	var nome= nomeOggetto;
	var voti = numeroVoti;
	/*var setID = (function(){
		var IDcounter = 0;
		return function(){return IDcounter +=1;}
	})();
	var ID =setID();
	this.getID=function(){
		return ID;
	};*/
	this.aggiungiVoti=function(nVoti){
		if( numeroVoti <= 0){
			nVoti=1;
		}
		voti+=nVoti;
	};
	this.rimuoviVoti=function(nVoti){
			if(numeroVoti <= 0){
			nVoti=1;
		}
		voti-=nVoti;
	};
	this.impostaVoti=function(nVoti){
		voti=nVoti;
	};
	this.prendiVoti=function(){
		return voti;
	};
	this.prendiNomeOggetto=function(){
		return nome;
	};
}

/*function listaNomiContenitori(listaContenitori){
	var lista = [];
	for (var i=0, l=listaContenitori.length;i<l;i++){
		lista[i]=listaContenitori[i].prendiNomeOggetto();
	}
	return lista;
}*/



/*var listaTitoliContenitori = [new contenitoreVoti('Test1'),
                   new contenitoreVoti('Test2'),
                   new contenitoreVoti('Test3')];


var listaTitoli = listaNomiContenitori(listaTitoliContenitori);*/

var listaTitoli = new listaOggettiVoti('Test1','Test2','Test3');

var socketList=[];

io.on('connection',function(socket){
	console.log('User Connected');
	socket.emit('aggiornaListaVoto', listaTitoli.listaOggetti(), listaTitoli.numeroOggetti());
	//console.log(listaTitoli);
	socket.on('nuovoElemento',function(testo){
		var esistente = false;
		var testoDaComparare = comparabile(testo);
		/*for(var indice=0, lunghezza =listaTitoli.length; indice<lunghezza; indice++){
			if (comparabile(listaTitoli[indice])===testoDaComparare){
				esistente=true;
				break;
			}			
		}*/
		listaTitoli.ciclaLista(function(nVoti,titolo){
			if (!esistente && comparabile(titolo)===testoDaComparare){
				esistente= true;
			}
		});
		if (esistente===false){
			listaTitoli.aggiungiOggetto(testo,1);
			/*listaTitoliContenitori[listaTitoliContenitori.length]=new contenitoreVoti(testo,1);
			listaTitoli[listaTitoli.length]=testo;*/
			io.emit('aggiornaListaVoto',[testo],listaTitoli.numeroOggetti());		
		}
		else
			{
				//TO DO: aggiungere logica di voto
				socket.emit('votato',testo);
			}
		aggiornaSessioneDopoVoto(socket);
		disabilitaVotoUtente(socket.request.session,io.sockets.sockets);
	});
	socket.on('voto',function(voto){
		aggiornaSessioneDopoVoto(socket);
		//aggiungiVoti(voto,listaTitoliContenitori);
		listaTitoli.aggiungiVoto(voto);
		disabilitaVotoUtente(socket.request.session,io.sockets.sockets);
	});
	if (app.get('env') === 'development') {
		socket.on('reset',function(){
			delete socket.request.session.utente;
			socket.request.session.save();
			io.emit('refresh');
		});
	}
	socket.on('disconnect',function(){
		console.log('User disconnected');
	});
});

module.exports = app;
