function aggiornaNumeroVoti(listaNumeroVoti){
	var aggiunte = false;
	var listaAggiunte = new HashMap();
	listaNumeroVoti.forEach(function(value,key){
		var elem = $("#listavoti li[id='"+key+"']");
		if (elem === null){
			socket.emit('richiediElementoMancante',key);
			aggiunte = true;
			listaAggiunte.set(key,value);
			return;
		}else{
			elem.find("span.contatoreVoto").text(value);
		}		
	})
	if (aggiunte===true){
		aggiornaNumeroVoti(listaAggiunte);
	}
}

socket.on('riceviElementoMancante',function(nomeOggetto, idOggetto, nVoti){
	var openLi = "<li id=" + idOggetto + ">";
	var openA = '<a href="#risposta" data-rel="dialog" class="ui-btn ui-corner-all ui-shadow">';
	var htmlTesto = "<span class=\"testo\">" + nomeOggetto + "</span>";
	var htmlConta = "<span class=\"ui-li-count contatoreVoto\">"+nVoti+"</span>";
	var htmlTestoBottone ="<span class =\"testoBottone\">Vota!<\span>"
	var closeA = '</a>';
	var closeLi = "</li>";
	var html;
	if (votato){
		//$(htmlTesto).css("font-weight","bold");
		html = openLi +  htmlTesto + htmlConta + closeLi;
	}
	else{
		html = openLi +  htmlTesto + htmlConta + openA + htmlTestoBottone + closeA + closeLi;
	}
	$(html).appendTo("#listaVoti").hide();
	if (!votato){
		$(".contatoreVoto").hide();
	}
});

socket.on('aggiornaListaVoto',function(lista,listaID,lunghezzaListaServer){
	if ($("#listaVoti li").length>=lunghezzaListaServer){
		return;                         
	}
	$.each(lista, function(key, value){
		var openLi = "<li id=" + listaID[key] + ">";
		var openA = '<a href="#risposta" data-rel="dialog" class="ui-btn ui-corner-all ui-shadow">';
		var htmlTesto = "<span class=\"testo\">" + value + "</span>";
		var htmlConta = "<span class=\"ui-li-count contatoreVoto\">"+key+"</span>";
		var htmlTestoBottone ="<span class =\"testoBottone\">Vota!<\span>"
		var closeA = '</a>';
		var closeLi = "</li>";
		var html;
		if (votato){
			//$(htmlTesto).css("font-weight","bold");
			html = openLi +  htmlTesto + htmlConta + closeLi;
		}
		else{
			html = openLi +  htmlTesto + htmlConta + openA + htmlTestoBottone + closeA + closeLi;
		}
		$(html).appendTo("#listaVoti").hide();
	});
	if (!votato){
		$(".contatoreVoto").hide();
	}
	$("#listaVoti").listview("refresh");
	var elementiNascosti = $("#listaVoti li:hidden");
	elementiNascosti.slideDown(1000);
	//TODO: aggiungere la funzione per controllare il numero di voti?
}) ;

function disabilitaVoto(){
	votato = true;
	/*$("#listaVoti li").each(function(){
		var element =$(this);
		var getTesto=element.find("span").detach();
		element.empty();
		element.append(getTesto);		
	});*/
	//
	$("#listaVoti a").remove();
	//$(".testo").css("font-weight", "bold");
	$("#listaVoti").listview("refresh");	
	$("#nuovoTitolo").remove();                     
	$(".contatoreVoto").show();
	$("#titoloLista").text('Ecco i risultati in tempo reale');
	$(document).prop("title", "Attendi la fine della votazione...");
	//window.location.reload(true);
}   

//FIXME: dopo aver cliccato, quando torno alla pagina principale il titolo non è cambiato!
$("#listaVoti").on("click","a",function(event){
	var elem = $(this);
	var testo = elem.find("span.testo").text();
	socket.emit('voto',testo);
}); 

socket.on('disabilitaVoto',function(){
	disabilitaVoto();
});

socket.on('aggiornaVoti',function(listaVoti){
	aggiornaNumeroVoti(listaVoti);
});
