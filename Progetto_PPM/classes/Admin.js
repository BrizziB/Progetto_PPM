//var ListaOggettiVoti=require('./classes/ListaOggettiVoti.js');

exports.team = function (teamName, nFoulsBeforePenalty){
	var punteggi = []; //va aggiornato dopo ogni improvvisazione
	if(nFoulsBeforePenalty === undefined){
		nFoulsBeforePenalty=5;
	}
	var penalties=0;
	var numFouls=0;//infrazione
	var points=0;  //PUNTI TOTALI
	
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
}

var team=exports.team;

function Settings(){
	var nFoulsBeforePenalty;
	var titleTimer;
	var catTimer;
	var waitTimer;
	var winnerTimer;
	
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
}

exports.Admin = function(){
	var currentMatchNum;
	var currentTitle;
	var currentCategory;
	var matchSettings = new Settings();
	var currentPage = '/wait';
	var blueTeam = new team("blue");
	var redTeam = new team("red");
	var startVote = false;
	var titlesCatsList;
	
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
		io.emit('redirect', getCurrentPageInternal());
	};
	
	this.assegnaPunteggi=function(){
		
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
			setCurrentPage(next);
			clientRedirect();
			if (funct){
				funct();
			}
			theBeast(timerArray);
		}, delay);
	};
	
	this.phase1 = function(){ //arriva fino alla pagina di attesa durante lo spettacolo
		var timerArray = [];		
		timerArray.push({delay: matchSettings.getWaitTimer() ,page: "/wait? type=play"  });
		timerArray.push({delay: matchSettings.getCategoryTimer() ,page: "/wait? type=category"  });
		timerArray.push({delay: matchSettings.getWaitTimer() ,page: "/vote/category"  });
		timerArray.push({delay: matchSettings.getTitleTimer() ,page: "/wait? type=title"  });
		
		setCurrentPage("/vote/title");
		theBeast(timerArray);		
	};
	
	this.phase2 = function(){ //parte facendo caricare la pagina di voteWinner e, al timeout invoca la pagina finale di riepilogo
		var timerArray = [];
		timerArray.push({delay: matchSettings.getWaitTimer() ,page: "/wait?type=result"  });
		setCurrentPage("/vote/matchwinner");
		theBeast(timerArray);
	};
	
	this.getCurrentTitle=function(){
		return currentTitle;
	};
	this.getCurrentCategory=function(){
		return currentCategory;
	};
}

console.log(module.exports);
