socket.on('aggiornaListaVoto',function(lista,lunghezzaListaServer){
	if ($("#listaVoti li").length>=lunghezzaListaServer){
		return;                         
	}
	$.each(lista, function(key, value){
		var openLi = "<li data-icon=\"true\">";
		var openA = '<a href="#risposta" data-rel="dialog">';
		var htmlTesto = "<span class=\"testo\">"+value+"</span>";
		var htmlConta = "<span class=\"ui-li-count contatoreVoto\">"+key+"</span>";
		var closeA = '</a>';
		var closeLi = "</li>";
		var html = openLi + openA + htmlTesto + htmlConta + closeA + closeLi;
		//$('<li data-icon="true"><a href="#risposta" data-rel="dialog">'+ value +'<span id="'+value.replace(/ /g,'')+'" class="ui-li-count contatoreVoto">42</span></a></li>')
		$(html).appendTo("#listaVoti").hide();
	});
	$(".contatoreVoto").hide();
	$("#listaVoti").listview("refresh");
	$("#listaVoti li:hidden").each(function(){
		$(this).slideDown(1000);
		if (votato){
			var liItem=$(this);
			liItem.prop("data-icon","false").addClass('ui-disabled');
		} 
	});
	if (votato){
		$(".contatoreVoto").show();
	}
}) ;

function disabilitaVoto(){
	votato = true;
	$("#listaVoti li").addClass('ui-disabled')
		.prop("data-icon","false");
	$(".nuovoTitolo").hide();                     
	$(".contatoreVoto").show();
	//window.location.reload(true);
}   

$("#listaVoti").on("click","li",function(event){
	var elem = $(this);
	var testo = elem.children("a").children("span.testo").text();
	console.log("testo: "+testo);
	socket.emit('voto',testo);
}); 

socket.on('disabilitaVoto',function(){
	disabilitaVoto();
});

socket.on('aggiornaNumeroVoti',function(){
	
})