$("document").ready(function(){
  
var higherClockHidden=false;
	

$(".timer").append("<span class='higherClock'><span class='minutes'></span>:</span><span class='seconds'></span>");
$(".higherClock").hide();
	
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
	$(".seconds").text(checkTime(seconds));
	if (timer<60){
		if (higherClockHidden===false){
			higherClockHidden=true;
			$(".higherClock").hide();
			$(".minutes").text(0)
		}
	}
	else
		{
			if (higherClockHidden===true){
				$(".higherClock").show();
				higherClockHidden=false;
			}
			$(".minutes").text(overflowTime(time));
		}

	});

});