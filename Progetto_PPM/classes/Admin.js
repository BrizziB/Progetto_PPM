/*var app =require('../app');
console.log(app);
var io = app.get('io');*/

var ListaOggettiVoti =require('./ListaOggettiVoti');
//VARIABILI AGGIUNTE
var User = require('../models/User.js');

exports.team = function (teamName, nFoulsBeforePenalty){
	var punteggi = []; //va aggiornato dopo ogni improvvisazione
	if(nFoulsBeforePenalty === undefined){
		nFoulsBeforePenalty=5;
	}
	var penalties=0;
	var numFouls=0;//infrazione
	var votes=0; //numero di voti per ogni match
	var points=0;  //PUNTI TOTALI
	
	this.addVote=function(){
		votes++;
	};
	
	this.getVotes=function(){
		return votes;
	};
	
	this.setVotes=function(nvotes){
		votes=nvotes;
	};
	this.getPunteggi=function(){
		return punteggi;
	};
	
	this.setPunteggi=function(index, score){
		punteggi[index] = score;
	};
	
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
			var pts=this.getPoints() -1 ;
			this.setPoints(pts);
		}
	};
	this.removeFouls=function(){
		if (numFouls==0 && penalties>0){
			numFouls=nFoulsBeforePenalty;
			penalties--;
			points++;
			}
		if(numFouls > 0){
			numFouls--;
		}
		if(numFouls == 0 && penalties==0){
			return;
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
};

var team=exports.team;


exports.Admin = function(socketio){
	var currentMatchNum=0;
	var currentTitle;
	var currentCategory;
	var currentPage = '/wait?type=start';
	var blueTeam = new team("blue");
	var redTeam = new team("red");
	var startVote = false;
	var titles= new ListaOggettiVoti('Titolo Test1','Titolo Test2','Titolo Test3');
	var categories= new ListaOggettiVoti('Categoria Test1','Categoria Test2','Categoria Test3');
	var isTitleVote= true;
	var nFoulsBeforePenalty;
	var titleTimer=10;
	var catTimer=10;
	var waitTimer=5;
	var winnerTimer=10;
	var io=socketio;
	
	var phase = {
		START: 'inizioSpettacolo',
		TITLE : 'faseZero',
		INTERVALTITLE: 'faseIntervallo',
		CATEGORY : 'faseUno',
		PLAY : 'fasePlay',
		WINNER : 'faseDue',
		DISABLEBUTTON : 'faseVotazione'
	};
	
	var versionEnum = {
			NONE: 0,
			TIMERVERSION : 1,
			INTERVALVERSION : 2
		};

	var version = versionEnum.NONE;
	var nextPhase = phase.TITLE;
	var currentPhase = phase.START;
	
	var timerBeast=null;
	var waitBeast=null;
	var timerTime=-1;
	
	this.getTimer= function(){
		return timerTime>0?timerTime:0;
	};
	
	var isPhaseInternal = function(){
		return nextPhase;
	};
	
	this.isPhase= function(){
		return isPhaseInternal();
	};
	
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
	this.blueTeam=function(){
		return blueTeam;		
	};
	this.redTeam=function(){
		return redTeam;
	};
	
	var getCurrentPageInternal= function(){
		return currentPage;
	};
	
	this.getCurrentPage = function(){
		return getCurrentPageInternal();
	};
	
	var setCurrentPage = function(page){
		currentPage=page;
	};
	
	//invariante: stiamo inviando la pagina corrente dopo la modifica
	var clientRedirect = function (){
		io.emit('redirect');
		console.log('redirect a pagina corrente  ', getCurrentPageInternal());
		
	};

	///XXX: questa funzione è realmente utile?
	this.assegnaPunteggi=function(){
	//TODO: da implementare, controllare se io.emit viene emesso ed intercettato
		io.of('/adminChan').emit('updatePoints',{red: redTeam.getPunteggi(),blue: blueTeam.getPunteggi()});
	};
	

	
	this.stopVotazione=function(current,next){
		switch(version){
			case versionEnum.TIMERVERSION:
				clearTimeout(waitBeast);
				version=versionEnum.NONE;
				nextPhase=currentPhase;
				break;
			case versionEnum.INTERVALVERSION:
				clearInterval(timerBeast);
				version=versionEnum.NONE;
				nextPhase=currentPhase;
				break;
			case versionEnum.NONE:
				console.log('Nessuna votazione in corso');
				break;
			default:
				console.log('Impossibile determinare lo stato della votazione!');
				return;
		}
		if (current)
			{currentPhase = current;
		};
		if (next){
			nextPhase = next;
		}	
			
		io.of('/adminChan').emit('updatePhase', isPhaseInternal());
	};

	this.startSpettacolo = function(){
		nextPhase = phase.TITLE;
		currentPhase = phase.START;
		currentPage = '/wait?type=start';
		io.of('/adminChan').emit('updatePhase', isPhaseInternal());
	};
	
	this.resetSpettacolo = function(){
		currentPage = '/wait?type=start';
		this.stopVotazione(phase.START,phase.TITLE);

	};
	
	this.intervalloTitolo=function(){
		currentpage='/wait?type=title';
		currentP
	};

	//funzione cattiva !
	var theBeast = function(timerArray){ //gli elementi di timerArray sono inseriti partendo dall'ultimo perchè torna bene col pop()
		if (timerArray.length===0){
			return;
			}
		var element = timerArray.pop();
		var next = element.page;
		var delay = element.delay;
		var funct = element.funct;
		version=versionEnum.TIMERVERSION;
		
		waitBeast=setTimeout(function (){
			if (funct){
				funct();
			}
			setCurrentPage(next);
			clientRedirect();
			theBeast(timerArray);
			version=versionEnum.NONE;
		}, delay*1000);
	};

	//funzione ancora più cattiva !
	var theBeast2 = function(timerArray){ //gli elementi di timerArray sono inseriti partendo dall'ultimo perchè torna bene col pop()
		if (timerArray.length===0){
			return;
			}
		var element = timerArray.pop();
		var next = element.page;
		var delay = element.delay;
		var funct = element.funct;
		var timerFunct = element.timerFunct;
		version=versionEnum.INTERVALVERSION;

		timerBeast=setInterval(function(){
			if(delay ===0){
				if (funct){
					funct();
				}
				setCurrentPage(next);
				clientRedirect();
				clearInterval(timerBeast);
				theBeast2(timerArray);
				version=versionEnum.NONE;
			}
			else{	
				if(timerFunct){
					timerFunct(delay);
				}
				delay--;
				timerTime=delay;
			}
		},1000);
	};	
	
	this.getCurrentTitle=function(){
		return currentTitle;
	};
	this.getCurrentCategory=function(){
		return currentCategory;
	};	
	
	this.getCurrentMatchNum=function(){
		return currentMatchNum;
	};
	
	var updateMatch = function (){

		currentMatchNum++;
		
	};
	
	this.setWinner = function(){
		console.log('setWinner sta eseguendo ora');
		redTeam.setPunteggi(currentMatchNum, redTeam.getVotes() );
		blueTeam.setPunteggi(currentMatchNum, blueTeam.getVotes() );
		
		if(blueTeam.getVotes()>redTeam.getVotes()){	
			blueTeam.addPoint();
		}		
		if(blueTeam.getVotes()<redTeam.getVotes()){	
			redTeam.addPoint();
		}
		if(blueTeam.getVotes()===redTeam.getVotes()){	
			redTeam.addPoint();
			blueTeam.addPoint();
		}
		updateMatch();
		User.update({},{$set:{votato:false}},{multi:true}).exec();
		nextPhase=phase.TITLE;
		currentPhase=phase.START;
		io.of('/adminChan').emit('updatePoints',{red: redTeam.getPoints(),blue: blueTeam.getPoints()});
		io.of('/adminChan').emit('updatePhase', isPhaseInternal());
	};


	var titleWinner = function(){
		var maxVotes= -1;
		var maxTitle = '';
		titles.ciclaLista(function(nVotes,title){
			if(nVotes> maxVotes){
				maxVotes = nVotes;
				maxTitle =title;
			}
		});
		User.update({},{$set:{votato:false}},{multi:true}).exec();
		currentTitle = maxTitle;
		currentPhase = phase.INTERVALTITLE; 
		nextPhase=phase.CATEGORY;
		io.of('/adminChan').emit('updatePhase', isPhaseInternal());
	};

	var categoryWinner = function(){
		var maxVotes= -1;
		var maxCategory = '';
		categories.ciclaLista(function(nVotes,category){
			if(nVotes> maxVotes){
				maxVotes = nVotes;
				maxCategory =category;
			}
		});
		currentCategory = maxCategory;
		User.update({},{$set:{votato:false}},{multi:true}).exec();
		nextPhase = phase.PLAY;
		currentPhase = phase.PLAY;
		io.of('/adminChan').emit('updatePhase', isPhaseInternal());
	};
	
	this.getTitlesCats= function(){
		if (isTitleVote){
			return titles;
		}
		else{
			return categories;
		}
		
	};
//XXX:richiede array per il momento	
	var setTitles= function(newtitles){
		console.log('fuori if di setTitles',titles.listaOggetti());
		if (typeof titles === typeof ListaOggettiVoti){
			titles = newtitles;
		}
		else{
			titles=new ListaOggettiVoti(newtitles);
			console.log('Dentro l\'else di setTitles:',titles.listaOggetti());
		}
	};
//XXX:richiede array per il momento	
	var setCategories= function(newcategories){
		if (typeof newcategories === typeof ListaOggettiVoti){
			categories = newcategories;
		}
		else{
			categories=new ListaOggettiVoti(newcategories);
		
		}
	};
	
	this.categoryInit = function(){
		isTitleVote= false;
		setCategories(['Libero','Cantato','In rima','Senza parole', 'Stile soap-opera']);
	};
	
	this.titleInit= function(){
		console.log('Dentro titleInit:',setTitles);
		//setTitles(['Prova1','Prova2','Prova3','Prova4']);
		setTitles('');
		isTitleVote= true;
	};

	var timerFunction = function(time){
		io.of("/timerChan").emit('timer',time);
		console.log('Mi eseguo! Tempo:',time);
	};
	
	var timerReducedFunction = (function(){
		var internalInterval=15;
		return function(time){
			var emit = false;
			internalInterval++;
			if(time>120){
				if(internalInterval>=15){
					emit = true;
					internalInterval=0;
				}
			}else
			if(time>50){
				if(internalInterval>=10){
					emit = true;
					internalInterval=0;
				}
			}else
			if(time>10){
				if(internalInterval>=5){
					emit = true;
					internalInterval=0;
				}
			}else{
				emit=true;
			}
			if(emit === true){
				io.of("/timerChan").emit('timer',time);
				console.log('Emesso evento da timerReducedFunction! Tempo:',time);
			}
			console.log('interval: ',internalInterval);
	};
	})();
	
	
	this.phase0 = function(){ //arriva fino alla pagina di attesa durante lo spettacolo
		var timerArray = [];
		timerArray.push({delay: this.getTitleTimer() ,page: "/wait?type=title",funct: titleWinner, timerFunct:timerReducedFunction});
		
		this.titleInit();
		setCurrentPage("/vote/titolo");
		clientRedirect();
		nextPhase=phase.DISABLEBUTTON;
		io.of('/adminChan').emit('updatePhase', this.isPhase());
		theBeast2(timerArray);

	};
	
	this.phase1 = function(){ //arriva fino alla pagina di attesa durante lo spettacolo
		var timerArray = [];
		timerArray.push({delay: this.getCatTimer() ,page: "/wait?type=category", funct: categoryWinner,timerFunct: timerReducedFunction  });		
		this.categoryInit();

		setCurrentPage("/vote/categoria");
		clientRedirect();
		nextPhase=phase.DISABLEBUTTON;
		io.of('/adminChan').emit('updatePhase', this.isPhase());
		theBeast2(timerArray);
	};
	
	this.startPlay=function(){
		nextPhase=phase.WINNER;
		setCurrentPage("/wait?type=play");
		clientRedirect();
		io.of('/adminChan').emit('updatePhase', this.isPhase());
		
	};

	this.phase2 = function(){ //parte facendo caricare la pagina di voteWinner e, al timeout invoca la pagina finale di riepilogo
		var timerArray = [];
		timerArray.push({delay: this.getWinnerTimer() ,page: "/wait?type=result", funct: this.setWinner, timerFunct: timerReducedFunction  });	

		io.of('/adminChan').emit('updatePhase', this.isPhase());
		
		blueTeam.setVotes(0);
		redTeam.setVotes(0);
		setCurrentPage("/vote/matchwinner");
		clientRedirect();
		nextPhase=phase.DISABLEBUTTON;
		io.of('/adminChan').emit('updatePhase', this.isPhase());
		theBeast2(timerArray);
	};

	
	this.spettacolo=function(){
		switch(nextPhase){
		case phase.TITLE:
			this.phase0();
			break;
			
		case phase.CATEGORY:
			this.phase1();
			break;
			
		case phase.PLAY:
			this.startPlay();
			break;
			
		case phase.WINNER:
			this.phase2();
			break;
		}
	};

};

