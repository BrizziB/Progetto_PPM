var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socketServer = require('socket.io');
var session = require('express-session');
var HashMap = require('hashmap');

var routes = require('./routes/index');
var users = require('./routes/users');
var wait = require('./routes/wait');
var administrator = require('./routes/administrator');
var vote = require('./routes/vote');
var vote2 = require('./routes/vote2');

var Utente = function(){
	this.votato =  false;
	this.aggiungiTitolo = true;
};

function team (teamName, nFoulsBeforePenalty){
	punteggi = new Array();
	if(nFoulsBeforePenalty==undefined){
		nFoulsBeforePenalty=5;
	}
	var penalties=0;
	var numFouls=0;//infrazione
	var points=0;  //PUNTI TOTALI
	this.getTeamName=function(){
		return teamName;
	};
	this.getFouls=function(){
		return numFouls;
	};
	this.getPenalty=function(){
		return penalties;
	};
	this.setFouls=function(nFouls){
		numFouls=nFouls%nFoulsBeforePenalty;
		penalties=(nFouls-numFouls)/nFoulsBeforePenalty;
	};
	this.addFoul=function(){
		numFouls=(numFouls+1)%nFoulsBeforePenalty;
		if (numFouls===0){
			penalties++;
		}
	};
	this.removeFouls=function(){
		numFouls=(numFouls-1+nFoulsBeforePenalty)%nFoulsBeforePenalty;
		if (numFouls===0){
			penalties--;
		}
	};
	this.setPoints=function(nPoints){
		points=nPoints;
	};
	this.getPoints=function(){
		return points;
	};
	this.addPoint=function(){
		points++;
	};
}

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

/*questo oggetto contiene la lista degli oggetti da votare.
 * E' fatta da due mappe hash. Entrambe utilizzano un ID univoco per ciascun oggetto
 * e una contiene l'oggetto, l'altro il numero di voti
 */
var idGenerator= (function(){
	var baseID=0;
	return function(){
		return baseID++;
	};
})();

function listaOggettiVoti(){
	var id;
	var contenitoreVoti=new HashMap();
	var contenitoreOggetti = new HashMap();
	if (arguments.length!==0){
		for(var i=0,l=arguments.length;i<l;i++){
			id=idGenerator();
			contenitoreOggetti.set(arguments[i],id);
			contenitoreVoti.set(id,0);
		}
	}	
	this.aggiungiOggetto=function(nomeOggetto,nVoti){
		if (contenitoreOggetti.has(nomeOggetto)){
			return false;
		}
		if (nVoti===undefined){
			nVoti=0;
		}
		id =idGenerator();
		contenitoreOggetti.set(nomeOggetto,id);
		contenitoreVoti.set(id,nVoti);
		return true;
	};
	this.rimuoviOggetto=function(nomeOggetto){
		if (contenitoreOggetti.has(nomeOggetto)){
			id = contenitoreOggetti.get(nomeOggetto);
			contenitoreOggetti.remove(nomeOggetto);
			contenitoreVoti.remove(id);
			return true;		
		}
		return false;
	};
	
	this.prendiVoti=function(nomeOggetto){
		if (contenitoreOggetti.has(nomeOggetto)){
			id = contenitoreOggetti.get(nomeOggetto);
			return contenitoreVoti.get(id);
		}
		return null;
	};

	this.impostaVoto=function(nomeOggetto,nVoti){
		if(contenitoreOggetti.has(nomeOggetto)){
			id=contenitoreOggetti.get(nomeOggetto);
		}
		else{
			id=idGenerator();
			contenitoreOggetti.set(nomeOggetto,id);
		}
		contenitoreVoti.set(id,nVoti);
	};
	
	var incrementaVoto=function(nomeOggetto,nVoti){
		var sostituto;
		if(contenitoreOggetti.has(nomeOggetto)){
			id = contenitoreOggetti.get(nomeOggetto);
			sostituto= nVoti+contenitoreVoti.get(id);
		}
		else{
			id=idGenerator();
			sostituto=nVoti;
			contenitoreOggetti.set(nomeOggetto,nVoti);
		}
		contenitoreVoti.set(id,sostituto);
		//console.log(nomeOggetto);
	};
	
	this.modificaVoto=function(nomeOggetto,nVoti){
		incrementaVoto(nomeOggetto,nVoti);
	};
	this.aggiungiVoto=function(nomeOggetto,nVoti){
		if (nVoti===undefined){
			nVoti=1;
		}
		else if (nVoti <= 0){
			return false;
		}
		incrementaVoto(nomeOggetto,nVoti);
		return true;
	};
	this.rimuoviVoto=function(nomeOggetto,nVoti){
		if (nVoti===undefined){
			nVoti=1;
		}
		else if (nVoti <= 0){
			return false;
		}
		incrementaVoto(nomeOggetto,0-nVoti);
		return true;
	};
	
	this.listaOggetti=function(){
		return contenitoreOggetti.keys();
	};
	this.numeroOggetti=function(){
		return contenitoreOggetti.count();
	};
	this.listaVoti=function(){
		return contenitoreVoti.clone();
	};
	this.oggettoDaID=function(idOggetto){
		return contenitoreOggetti.search(idOggetto);
	};
	this.listaOrdinataPerNome=function(){
		return contenitoreOggetti.keys().sort();
	};
	//doppio ciclo necessario per unire oggetto al voto
	this.ciclaLista=function(funzione){
	contenitoreOggetti.forEach(function(id,nomeOggetto){
			funzione(contenitoreVoti.get(id),nomeOggetto);
		});
	};
	id = null;
}


function Settings(){
	var nFoulsBeforePenalty;
	var titleTimer;
	var catTimer;
	var waitTimer;
	var winnerTimer;
//TODO vanno scritte..
	var titleFunction;
	var catFunction;
	var waitFunction;
	var winnerFunction;
//fin qui son da scrivere
	
	this.setNFoulsBeforePenalty=function(num){
		nFoulsBeforePenalty=num;
	};
	
	this.setTitleTimer=function(time){
		titleTimer=time;
	};
	this.setCatTimer=function(time){
		catTimer=time;
	};
	this.setWaitTimer=function(time){
		waitTimer=time;
	};
	this.setWinnerTimer=function(time){
		winnerTimer=time;
	};
	
	this.getNFoulsBeforePenalty=function(){
		return nFoulsBeforePenalty;
	};
	
	this.getTitleTimer=function(){
		return titleTimer;
	};
	this.getCatTimer=function(){
		return catTimer;
	};
	this.getWaitTimer=function(){
		return waitTimer;
	};
	this.getWinnerTimer=function(){
		return winnerTimer;
	};
	
	this.getTitleFunction=fucntion(){
		return titleFunction;
	};
	
	this.getCatFunction=fucntion(){
		return catFunction;
	};
	
	this.getWaitFunction=fucntion(){
		return waitFunction;
	};
	
	this.getWinnerFunction=fucntion(){
		return winnerFunction;
	};
	
};

function Admin(){
	var currentMatchNum;
	var currentTitle;
	var currentCategory;
	var matchSettings = new Settings();
	var currentPage;
	var blueTeam = new team("blue");
	var redTeam = new team("red");
	
	this.blueTeam=function(){
		return blueTeam;
		
	};
	this.redTeam=function(){
		return redTeam;
	};
	
	this.getCurrentPage = function(){
		return currentPage;
	};
	
	var setCurrentPage = function(page){
		currentPage=page;
	};
	
	//invariante: stiamo inviando la pagina corrente dopo la modifica
	var clientRedirect = function (){
		io.emit('redirect', getCurrentPage());
	};
	
	var isStopped=false;
	var timer;
	this.stopVotazione=function(){
		clearTimeout(timer);
		isStopped=true;
	};
	
	var theBeast = function(timerArray){ //BElla oh..
		if (timerArray.length==0)
			return;
		var element = timerArray.pop();
		var next = element.page;
		var delay = element.delay;
		setTimeOut(function (){
			setCurrentPage(next);
			theBeast(timerArray);
		}, delay);
	};
	
	var phase1 = function(){
		var timerArray = [ ];		
		timerArray.push({delay: matchSettings.getWaitTimer() ,page: "/wait"  });
		timerArray.push({delay: matchSettings.getCategoryTimer() ,page: "/wait/result"  });
		timerArray.push({delay: matchSettings.getWaitTimer() ,page: "/vote/category"  });
		timerArray.push({delay: matchSettings.getTitleTimer() ,page: "/wait/result"  });
		
		setCurrentPage("/vote/title");
		theBeast(timerArray);
		
	};
	
}

var admin = new Admin();
var red = new contenitoreVoti("red", 0);
var blue = new contenitoreVoti("blue", 0);

var sessionMiddleWare = session({
	secret: 'progettoPPM', 
	resave: false,
    saveUninitialized: true});

var app = express();
var io = new socketServer();
var winVote = io.of("/winVote");
var votoTitoloCategoria = io.of("/votoTitoloCategoria");
app.io = io;

io.use(function(socket, next){
	sessionMiddleWare(socket.request, socket.request.res, next);
});

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

//TODO:TOGLIERE VARIABILI TEST!!!!!!!!
//var test= {title : 'Voto', aggiungiTitolo : true};

app.use('/',function(req,res,next){
	//req.session.test=test;
	if (req.session.utente === undefined){
		req.session.utente=new Utente();
		req.session.utente.sessionID=req.sessionID;
	}
	next();
}
, routes);
app.use('/users', users);
app.use('/wait', wait);
app.use('/administrator', administrator);
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

/*function aggiungiVoti(elemento, lista, nVoti){
	if (nVoti === undefined){
		nVoti = 1;
	}
	for (var i=0, l=lista.length;i<l;i++){
		if (lista[i].prendiNomeOggetto()===elemento){
			lista[i].aggiungiVoti(nVoti);
			return;
		}
	}
} */
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
//TODO: i voti devono essere mantenuti dall'admin
var listaTitoli = new listaOggettiVoti('Test1','Test2','Test3');

winVote.on('connection', function(socket){
	// ---- Boris -----
	console.log("Connessione ! ");
	socket.emit('welcomeVote', blue.getVoti(), red.getVoti());
	socket.emit('welcomeWait', admin.blueTeam().getFouls(), admin.redTeam().getFouls(), admin.blueTeam().getPenalty(), admin.redTeam().getPenalty());
	socket.on('blueClick', function(){
		aggiornaSessioneDopoVoto(socket);
		disabilitaVotoUtente(socket.request.session,io.sockets.sockets);
		blue.aggiungiVoti(1);
		console.log("hanno votato blu");		
		winVote.emit('blueVote', blue.getVoti());
	});
	socket.on('redClick', function(){
		aggiornaSessioneDopoVoto(socket);
		disabilitaVotoUtente(socket.request.session,io.sockets.sockets);
		red.aggiungiVoti(1);
		console.log("hanno votato rosso");
		winVote.emit('redVote', red.getVoti());
	});
	
	socket.on('stopVoting', function(){
		if(red.getVoti()>blue.getVoti()){
			console.log("evento STOP VOTING rosso rilevato");
			admin.redTeam().addPoint();
			admin.redTeam().punteggi[admin.CurrentMatchNum]=red.getVoti();
			admin.blueTeam().punteggi[admin.CurrentMatchNum]=blue.getVoti();
			red.setVoti(0);
			blue.setVoti(0);
			winVote.emit('stopVote', 'red', admin.redTeam().getPoints(), admin.blueTeam().getPoints());
		}
		if(blue.getVoti()>red.getVoti()){
			console.log("evento STOP VOTING blu rilevato");
			admin.blueTeam().addPoint();
			admin.redTeam().punteggi[admin.CurrentMatchNum]=red.getVoti();
			admin.blueTeam().punteggi[admin.CurrentMatchNum]=blue.getVoti();
			red.setVoti(0);
			blue.setVoti(0);
			winVote.emit('stopVote', 'blue', admin.redTeam().getPoints(), admin.blueTeam().getPoints());
		}
		else{
			winVote.emit('stopVote', 'PARI');
		}
	});
	
});

io.on('connection', function(socket){
	socket.on('redFaul', function(){
		admin.redTeam().addFoul();
		console.log("falli dei red: "+admin.redTeam().getFouls()+" ! ");
		io.emit('faul', admin.redTeam().getTeamName(), admin.redTeam().getFouls(), admin.redTeam().getPenalty());
	});
	
	socket.on('blueFaul', function(){
		admin.blueTeam().addFoul();
		console.log("falli dei blue: "+admin.blueTeam().getFouls()+" ! ");
		io.emit('faul', admin.blueTeam().getTeamName(), admin.blueTeam().getFouls(), admin.blueTeam().getPenalty());
	});
	socket.on('goToWait1', function(){
		io.emit('goToWait');
	});
});
	// ---- Boris -----FINE
	
	// ---- Pitti -----
io.on('connection', function(socket){
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
				//TODO: controllare!!!
				listaTitoli.aggiungiVoto(testo);
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
	
	// ---- Pitti -----FINE
	//FIXME la variabile "votato" dovrà essere posta a false ogni volta che si passa di fase. Sennò il voto in scegli categoria blocca anche il voto in scegli titolo e vote2
});
//  [  ]
module.exports = app;