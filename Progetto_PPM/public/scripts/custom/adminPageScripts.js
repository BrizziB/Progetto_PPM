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
	alert(timers);
});

$('#impostazioniVoto').on('click','button', function(event){
	var element = event.target;
	var type = element.name.substring(5);
	var timer = $('#valoreTimer'+type).text();
	socket.emit('changeTimer',type,timer);
});

$('#falloRossi').on('click',function(){
	socket.emit('fallo','rosso');
	console.log ("premuto Fallo Rosso");
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
	alert('inizio fase');
});