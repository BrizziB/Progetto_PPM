var boundPhaseButton=false;

var bindButton=function(){
		
		if (boundPhaseButton===false){
			console.log('bindButton eseguito!');
			$('#avviaSpettacolo').one('click',function(){
				socket.emit('inizioFase');
				boundPhaseButton= false;
				console.log('inizio Fase');
			});
			boundPhaseButton=true;
		}
};

var gestioneFasi = function(whichPhase){
	
		var phaseButton = $('#avviaSpettacolo');
		
		console.log('Fase: ',whichPhase,'boundButton: ', boundPhaseButton);
		
		switch(whichPhase){
		case 'inizioSpettacolo':
		case 'faseZero':
			phaseButton.text('Votazione Titolo');
			bindButton();
			break;
		case 'faseIntervallo':
		case 'faseUno':
			phaseButton.text('Votazione Categoria');
			bindButton();
			break;
		
		case 'faseDue':
			phaseButton.text('Votazione Vincitore');
			bindButton();
			break;
			
		case 'faseVotazione':
			phaseButton.text('Ferma la Votazione');
			phaseButton.off('click');
			phaseButton.one('click',function(){
				socket.emit('stopVoto');
				boundPhaseButton= false;
				bindButton();
			});
			break;
			
		case 'fasePlay':
			phaseButton.text('Inizio Spettacolo');
			bindButton();
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

<<<<<<< HEAD
$('#avviaFasi').click(function(){
	console.log('sono stato cliccato!');
	socket.emit('inizioFase');
});
=======
//$('#avviaFasi').click(function(){
//	socket.emit('inizioFase');
//});


>>>>>>> Aggiunte a reset

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

$('#togliRossi').on('click',function(){
	socket.emit('rimuovi','rosso');
});

$('#togliBlu').click(function(){
	socket.emit('rimuovi','blu');
});

<<<<<<< HEAD
$('#avviaFase0').click(function(){
	socket.emit('controlloVotazione', 'faseZero');
});

=======
/*
>>>>>>> Aggiunte a reset
$('#avviaFase1').click(function(){
	socket.emit('controlloVotazione', 'faseUno');
});

$('#avviaFase2').click(function(){
	socket.emit('controlloVotazione', 'faseDue');
});

$('#avviaFasePlay').click(function(){
	socket.emit('controlloVotazione', 'fasePlay');	
});*/

/*$('#avviaSpettacolo').click(function(){
	socket.emit('inizioFase');
});*/

$('#avviaSpettacolo').click(function(){
	socket.emit('reset');
	boundPhaseButton=false;
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

socket.on('remove', function(name, num, pen, pts){
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
