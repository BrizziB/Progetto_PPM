var gestioneFasi = function(whichPhase){
	
	var phaseButton = $('#avviaSpettacolo');
	
	switch(whichPhase){
	
	case 'faseZero':
		phaseButton.text('Votazione Titolo');
		phaseButton.prop("disabled", false);
		break;
	
	case 'faseUno':
		phaseButton.text('Votazione Categoria');
		phaseButton.prop("disabled", false);
		break;
	
	case 'faseDue':
		phaseButton.text('Votazione Vincitore');
		phaseButton.prop("disabled", false);
		break;
		
	case 'faseVotazione':
		phaseButton.text('Votazione in corso');
		phaseButton.prop("disabled", true);
		break;
		

	case 'fasePlay':
		phaseButton.text('Inizio Spettacolo');
		phaseButton.prop("disabled", false);
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

$('#avviaFase0').click(function(){
	socket.emit('controlloVotazione', 'faseZero');
});

$('#avviaFase1').click(function(){
	socket.emit('controlloVotazione', 'faseUno');
});

$('#avviaFase2').click(function(){
	socket.emit('controlloVotazione', 'faseDue');
});

$('#avviaFasePlay').click(function(){
	socket.emit('controlloVotazione', 'fasePlay');	
});
$('#avviaSpettacolo').click(function(){
	socket.emit('inizioFase');
});

socket.on('updatePoints',function(points){
	$('#blue .punteggio').text(points.blue);
	$('#red .punteggio').text(points.red);
});

socket.on('faul', function(name, num, pen, pts){
	if (name ==='red'){
		$("#red .punteggio").text(pts);
		$("#red .falli").text(num);
		$("#red .penalita").text(pen);
	}
	if (name ==='blue'){
		$("#blue .punteggio").text(pts);
		$("#blue .falli").text(num);
		$("#blue .penalita").text(pen);
	}
});	
