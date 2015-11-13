socket.on('refresh',function(timers){
	$('#red .punteggio').text(timers[4]);
	$('#red .falli').text(timers[5]);
	$('#blue .punteggio').text(timers[6]);
	$('#blue .falli').text(timers[7]);
	$("#red .penalita").text(timers[8]);
	$("#blue .penalita").text(timers[9]);
	
});