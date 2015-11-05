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
		votes=votes+nvotes;
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
};

var team=exports.team;


exports.Admin = function(socketio){
	var currentMatchNum=1;
	var currentTitle;
	var currentCategory;
	var currentPage = '/wait?type=start';
	var blueTeam = new team("blue");
	var redTeam = new team("red");
	var startVote = false;
	var titlesCatsList=new ListaOggettiVoti('Pippo','Pluto','Topolino','Minnie');
	var nFoulsBeforePenalty;
	var titleTimer=10;
	var catTimer=10;
	var waitTimer=10;
	var winnerTimer=10;
	var io=socketio;
	
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
	
	this.getTitlesCats= function(){
		return titlesCatsList;
	};
	this.setTitlesCats= function(titlesCats){
		titlesCatsList=titlesCats;
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
	//TODO: controllare se io.emit viene emesso ed intercettato
		io.emit('redirect', getCurrentPageInternal());
	};

	///XXX: questa funzione è realmente utile?
	this.assegnaPunteggi=function(){
	//TODO: da implementare, controllare se io.emit viene emesso ed intercettato
		io.of('/adminChan').emit('updatePoints',{red: redTeam.getPunteggi(),blue: blueTeam.getPunteggi()});
	};
	
	var isStopped=false;
	var timer;
	this.stopVotazione=function(){
		clearTimeout(timer);
		isStopped=true;
	};
	//funzione cattiva !
	var theBeast = function(timerArray){ //gli elementi di timerArray sono inseriti partendo dall'ultimo perchè torna bene col pop()
		if (timerArray.length===0){
			return;}
		var element = timerArray.pop();
		var next = element.page;
		var delay = element.delay;
		var funct = element.funct;
		setTimeout(function (){
			if (funct){
				funct();
			}
			setCurrentPage(next);
			clientRedirect();
			console.log("puoi vedermi!");
			theBeast(timerArray);
		}, delay*1000);
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
	
	
	this.setWinner = function(){
		redTeam.setPunteggi(this.getCurrentMatchNum(), redTeam.getVotes() );
		blueTeam.setPunteggi(this.getCurrentMatchNum(), blueTeam.getVotes() );
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
		User.update({},{$set:{votato:false}},{multi:true}).exec();
		io.of('/adminChan').emit('updatePoints',{red: redTeam.getPunteggi(),blue: blueTeam.getPunteggi()});
	};
//XXX:	
//-FUNZIONI PROPOSTE DA AGGIUNGERE
	var titleWinner = function(){
		var titles = titlesCatsList;
		var maxVotes= -1;
		var maxTitle = '';
		titles.ciclaLista(function(nVotes,title){
			if(nVotes> maxVotes){
				nVotes = maxVotes;
				maxTitle =title;
			}
		});
		User.update({},{$set:{votato:false}},{multi:true}).exec();
		currentTitle = maxTitle;
	};

	var categoryWinner = function(){
		var categories = titlesCatsList;
		var maxVotes= -1;
		var maxCategory = '';
		categories.ciclaLista(function(nVotes,category){
			if(nVotes> maxVotes){
				nVotes = maxVotes;
				maxCategory =category;
			}
		});
		currentCategory = maxCategory;
		User.update({},{$set:{votato:false}},{multi:true}).exec();
	};	
//-FINE
//FUNZIONE MODIFICATA	
	this.phase1 = function(){ //arriva fino alla pagina di attesa durante lo spettacolo
		var timerArray = [];		
		timerArray.push({delay: this.getWaitTimer() ,page: "/wait? type=play"  });
		timerArray.push({delay: this.getCatTimer() ,page: "/wait? type=category", funct: categoryWinner  });
		timerArray.push({delay: this.getWaitTimer() ,page: "/vote/categoria"  });
		timerArray.push({delay: this.getTitleTimer() ,page: "/wait? type=title",funct: titleWinner  });
		
		setCurrentPage("/vote/titolo");
		console.log("pagina corrente:  "+this.getCurrentPage());
		theBeast(timerArray);
	};
		
	
/*FUNZIONE ORIGINALE
	this.phase1 = function(){ //arriva fino alla pagina di attesa durante lo spettacolo
		var timerArray = [];		
		timerArray.push({delay: .getWaitTimer() ,page: "/wait? type=play"  });
		timerArray.push({delay: .getCategoryTimer() ,page: "/wait? type=category"  });
		timerArray.push({delay: .getWaitTimer() ,page: "/vote/category"  });
		timerArray.push({delay: .getTitleTimer() ,page: "/wait? type=title"  });
		
		setCurrentPage("/vote/title");
		theBeast(timerArray);		
	};
	*/
	this.phase2 = function(){ //parte facendo caricare la pagina di voteWinner e, al timeout invoca la pagina finale di riepilogo
		var timerArray = [];
		timerArray.push({delay: this.getWaitTimer() ,page: "/wait?type=result", funct: this.setWinner  });
		setCurrentPage("/vote/matchwinner");
		theBeast(timerArray);
	};

};

