//$("#red .falli").text("pino")	
var blueFauls;
var redFauls;
var bluePenality;
var redPenality;

socket.on('faul', function(name, num, pen){
		if (name ==='red'){
			$("#red .falli").text(num);
			$("#red .penalita").text(pen);
		}
		if (name ==='blue'){
			$("#blue .falli").text(num);
			$("#blue .penalita").text(pen);
		}
});