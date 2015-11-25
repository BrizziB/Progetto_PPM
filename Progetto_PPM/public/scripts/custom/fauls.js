//$("#red .falli").text("pino")	
var blueFauls;
var redFauls;
var bluePenality;
var redPenality;

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