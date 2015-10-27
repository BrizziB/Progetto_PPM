//var io = socket(:3000/.... da aggiungere nome canale

io.on('refresh',function(timers){
	$('#valoreTimerTitolo').text(timers[0]);
	$('#valoreTimerCategoria').text(timers[1]);
	$('#valoreTimerAttesa').text(timers[2]);
	$('#valoreTimerVincitore').text(timers[3]);
	$('#red .punteggi').text(timers[4]);
	$('#red .falli').text(timers[5]);
	$('#blue .punteggi').text(timers[6]);
	$('#blue .falli').text(timers[7]);
});

$('#impostazioniVoto').on('click','button', function(event){
	var element = event.target;
	var type = element.name.substring(5);
	var timer = $('#valoreTimer'+type).text();
	io.emit('changeTimer',type,timer);
});

$('#falloRossi').click(function(event){
	io.emit('fallo','rosso');
});

$('#falloBlu').click(function(event){
	io.emit('fallo','blu');
});

io.on('updatePoints',function(points){
	$('#blue .punteggi').text(points.blue);
	$('#red .punteggi').text(points.red);
});

$('#faseUno, #faseDue').click(function(event){
	io.emit('controlloVotazione', event.target.id);
});