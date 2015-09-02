//var io = socket(:3000/.... da aggiungere nome canale

io.on('init',function(timers){
	$('#valoreTimerTitolo').text(timers[0]);
	$('#valoreTimerCategoria').text(timers[1]);
	$('#valoreTimerAttesa').text(timers[2]);
	$('#valoreTimerVincitore').text(timers[3]);
	$('#red .punteggi').text(timers[4]);
	$('#red .falli').text(timers[5]);
	$('#blue .punteggi').text(timers[6]);
	$('#blue .falli').text(timers[7]);
});

$('#impostazioniVoto').on('click','button', function(event){});