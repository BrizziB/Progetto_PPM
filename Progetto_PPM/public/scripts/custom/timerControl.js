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
	var seconds = time % 60;
	var minutes = overflowTime(time);
	$(".seconds").text(checkTime(seconds));
	$(".minutes").text(minutes);
});