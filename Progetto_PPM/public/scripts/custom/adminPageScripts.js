//var io = socket(:3000/.... da aggiungere nome canale

socket.on('refresh',function(timers){
	$('#valoreTimerTitolo').val(timers[0]);
	$('#valoreTimerCategoria').val(timers[1]);
	$('#valoreTimerAttesa').val(timers[2]);
	$('#valoreTimerVincitore').val(timers[3]);
	$('#red .punteggio').text(timers[4]);
	$('#red .falli').text(timers[5]);
	$('#blue .punteggio').text(timers[6]);
	$('#blue .falli').text(timers[7]);
	$("#red .penalita").text(timers[8]);
	$("#blue .penalita").text(timers[9]);
	
});

$('#impostazioniVoto').on('click','button', function(event){
	var element = event.target;
	var type = element.id.substring(12);
	var timer = $('#valoreTimer'+type).val();
	socket.emit('changeTimer',type,timer);
});

$('#falloRossi').on('click',function(){
	socket.emit('fallo','rosso');
});

$('#falloBlu').click(function(){
	socket.emit('fallo','blu');
});

socket.on('updatePoints',function(points){
	$('#blue .punteggi').text(points.blue);
	$('#red .punteggi').text(points.red);
});

$('#faseUno, #faseDue').click(function(event){
	socket.emit('controlloVotazione', event.target.id);
});