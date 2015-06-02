socket.on('aggiornaListaVoto',function(lista,lunghezzaListaServer){
	if ($("#listaVoti li").length>=lunghezzaListaServer){
		return;                         
	}
	$.each(lista, function(key, value){
		var openLi = "<li data-icon=\"carat-r\">";
		var openA = '<a href="#risposta" data-rel="dialog">';
		var htmlTesto = "<span class=\"testo\">"+value+"</span>";
		var htmlConta = "<span class=\"ui-li-count contatoreVoto\">"+key+"</span>";
		var closeA = '</a>';
		var closeLi = "</li>";
		var html;
		if (votato){
			$(htmlTesto).css("font-weight","bold");
			html = openLi +  htmlTesto + htmlConta + closeLi;
		}
		else{
			html = openLi + openA + htmlTesto + htmlConta + closeA + closeLi;
		}
		//var html = openLi + openA + htmlTesto + htmlConta + closeA + closeLi;
		//$('<li data-icon="true"><a href="#risposta" data-rel="dialog">'+ value +'<span id="'+value.replace(/ /g,'')+'" class="ui-li-count contatoreVoto">42</span></a></li>')
		$(html).appendTo("#listaVoti").hide();
	});
	if (!votato){
		$(".contatoreVoto").hide();
	}
	$("#listaVoti").listview("refresh");
	var elementiNascosti = $("#listaVoti li:hidden");
	elementiNascosti.slideDown(1000);
//	if (votato){
//		elementiNascosti.prop("data-icon","false")
//		.addClass('ui-disabled');
//		$(".contatoreVoto").show();
//	}
}) ;


function disabilitaVoto(){
	votato = true;
	//$("#listaVoti li").addClass('ui-disabled').prop("data-icon","false");
	$("#listaVoti li").each(function(){
		var element =$(this);
		var getTesto=element.find("span").detach();
		element.empty();
		element.append(getTesto);		
	});
	//
	//$(".testo").css("font-weight", "bold");
	$("#listaVoti").listview("refresh");	
	$("#nuovoTitolo").remove();                     
	$(".contatoreVoto").show();
	$("#titoloLista").text('Ecco i risultati in tempo reale');
	$(document).prop('title', 'Attendi la fine della votazione...');
	//window.location.reload(true);
}   

$("#listaVoti").on("click","li",function(event){
	var elem = $(this);
	var testo = elem.find("span.testo").text();
	//console.log("testo: "+testo);
	socket.emit('voto',testo);
}); 

socket.on('disabilitaVoto',function(){
	disabilitaVoto();
});
//TODO: Aggiungere aggiornamento voto
/*socket.on('aggiornaNumeroVoti',function(){
	
})*/