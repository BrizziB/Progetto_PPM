var HashMap = require('hashmap');

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

//Codice funzione successiva ottenuto da http://www.shamasis.net/2011/08/infinite-ways-to-detect-array-in-javascript/
/**
 * Check whether an object is Array or not
 * @type Boolean
 * @param {object} subject is the variable that is
 * tested for Array identity check
 */
var isArray = (function () {
    // Use compiler's own isArray when available
    if (Array.isArray) {
        return Array.isArray;
    } 

    // Retain references to variables for performance
    // optimization
    var objectToStringFn = Object.prototype.toString,
        arrayToStringResult = objectToStringFn.call([]); 

    return function (subject) {
        return objectToStringFn.call(subject) === arrayToStringResult;
    };
}());

function ListaOggettiVoti(){
	var id;
	var contenitoreVoti=new HashMap();
	var contenitoreOggetti = new HashMap();
	if (arguments.length!==0){
		for(var i=0,l=arguments.length;i<l;i++){
			if(arguments[i]===undefined || arguments[i] === null || arguments[i] === ''){
				continue;
			}
			if (isArray(arguments[i])){
				var argArray=arguments[i];
				for (var k=0,m=argArray.length;k<m;k++){
					id=idGenerator();
					contenitoreOggetti.set(argArray[k],id);
					contenitoreVoti.set(id,0);				
				}
			}else
			{
				id=idGenerator();
				contenitoreOggetti.set(arguments[i],id);
				contenitoreVoti.set(id,0);
			}
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
	this.rimuoviLista = function(){
		contenitoreOggetti.clear();
		contenitoreVoti.clear();
	};
	
	this.listaOggetti=function(){
		return contenitoreOggetti.keys();
	};
	this.numeroOggetti=function(){
		return contenitoreOggetti.count();
	};
	this.listaVoti=function(){
		var arrayVoti = [];
		contenitoreVoti.forEach(function(nVoti,IDNumber){
			arrayVoti.push({ID:IDNumber,Voti:nVoti});
		});
		return arrayVoti;
	};
	this.iDDaOggetto=function(nomeOggetto){
		return contenitoreOggetti.get(nomeOggetto);
	};
	this.oggettoDaID=function(idOggetto){
		return contenitoreOggetti.search(idOggetto);
	};
	this.iDDaOggetto=function(nomeOggetto){
		return contenitoreOggetti.get(nomeOggetto);
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

module.exports = ListaOggettiVoti;