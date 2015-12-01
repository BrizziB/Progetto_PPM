



var gestioneFasi = function(whichPhase){
	
	var phaseButton = $('#avviaFasi');
	
	switch(whichPhase){
	
	case 'faseUno':
		phaseButton.text('avvia Fase 1');
		phaseButton.prop("disabled", false);
		break;
	
	case 'faseDue':
		phaseButton.text('avvia Fase 2');
		phaseButton.prop("disabled", false);
		break;
		
	case 'faseVotazione':
		phaseButton.text('Votazione in corso');
		phaseButton.prop("disabled", true);
		break;
	}
};


socket.on('refresh',function(timers, whichPhase){
	$('#valoreTimerTitolo').val(timers[0]);
	$('#valoreTimerCategoria').val(timers[1]);
	//$('#valoreTimerAttesa').val(timers[2]);
	$('#valoreTimerVincitore').val(timers[3]);
	$('#blue .punteggio').text(timers[4]);
	$('#blue .falli').text(timers[5]);
	$('#red .punteggio').text(timers[6]);
	$('#red .falli').text(timers[7]);
	$("#red .penalita").text(timers[8]);
	$("#blue .penalita").text(timers[9]);
	
	gestioneFasi(whichPhase);
	
});

socket.on('updatePhase',function(whichPhase){
	gestioneFasi(whichPhase);
});

$('#avviaFasi').click(function(){
	console.log('sono stato cliccato!');
	socket.emit('inizioFase');
});

$('form').on('submit', function(event){
	var element;
	event.preventDefault();
	var fields =$(this).serializeArray();
	console.log(fields);
	$.each(fields, function(i, element){
		console.log(element);
		var type = element.name.substring(5);
		var timer = element.value;
		socket.emit('changeTimer',type,timer);
	});
	
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
	$('#blue .punteggio').text(points.blue);
	$('#red .punteggio').text(points.red);
});
