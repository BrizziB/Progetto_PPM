var timer= io(":3000/timerChan");

var checkTime=function(time){
	if(time<10){
		time= "0"+time;
	} 
	return time;		
};

var overflowTime= function(time){
	return Math.floor(time/60);
};


timer.on('timer',function(time){
	console.log('Ricevo l\'evento!');
	var seconds = time % 60;
	var minutes = overflowTime(time);
	console.log($(".seconds"));
	$(".seconds").text(checkTime(seconds));
	$(".minutes").text(minutes);
});