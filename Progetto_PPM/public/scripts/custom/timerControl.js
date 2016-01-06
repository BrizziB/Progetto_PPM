$("document").ready(function(){
  
var higherClockHidden=true;
var localTimerHandler=null;
var localTimerTime;

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

var timerControl=function(time){
	var seconds = time % 60;
	if (time<60){
		if (higherClockHidden===false){
			higherClockHidden=true;
			$(".higherClock").hide();
			$(".minutes").text(0)
		}
		$(".seconds").text(seconds);
	}
	else
		{
			if (higherClockHidden===true){
				$(".higherClock").show();
				higherClockHidden=false;
			}
			$(".minutes").text(overflowTime(time));
			$(".seconds").text(checkTime(seconds));

		}
};

var localTimer=function(time){
	localTimerTime=time;
	if(localTimerHandler===null && time !== undefined && time !==null){
		localTimerHandler=setInterval(function(){
			if(localTimerTime<=0){
				timerControl(0);
				clearInterval(localTimerHandler);
				localTimeHandler=null;
				location.reload(true);
			}
			else{
				timerControl(localTimerTime);
				localTimerTime--;
			}
		},1000);
	}
};

timer.on('timer',function(time){
	localTimer(time);
	});

$(window).on('beforeunload', function(){
	if(localTimerHandler!==null){
		clearInterval(localTimerHandler);
		localTimerHandler=null;
	}
});

});