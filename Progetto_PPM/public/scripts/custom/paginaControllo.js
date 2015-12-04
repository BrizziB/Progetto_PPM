var socket=io(":3000/paginaControllo");

$("#contrPaginaCorr").click(function(){
	socket.emit('attivaDisattivaPagina');
    if (noCurrentPage===false){
    	noCurrentPage = true;
        $("#nonAttivo").show();
        $("#attivo").hide();
    }
    else{               
    	noCurrentPage = false;  
        $("#nonAttivo").hide();
        $("#attivo").show();
    }
});

$("#elimTuttiVoti").click(function(){
	socket.emit('eliminaVoto','');
});

$("#eliminaVoto").click(function(){
	socket.emit('eliminaVoto',$("#CancellaVoto").text());
});

$('#faseUno, #faseDue, #fasePlay, #faseZero').click(function(event){
	socket.emit('controlloVotazione', event.target.id);
});