
$(document).ready(function(){
	var redirectSocket=io();
	redirectSocket.on('redirect', function(){
		location.reload(true);
	});
});