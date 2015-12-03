$(document).ready(function(){
var socket=io(":3000/adminChan");

socket.on('refresh',function(timers){
	$('#blue .punteggio').text(timers[4]);
	$('#blue .falli').text(timers[5]);
	$('#red .punteggio').text(timers[6]);
	$('#red .falli').text(timers[7]);
	$("#red .penalita").text(timers[8]);
	$("#blue .penalita").text(timers[9]);
	
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
	
});
});