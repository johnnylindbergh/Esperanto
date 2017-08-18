var username;
var latestMessage = 0;
	function reload (r) {
	$.get("http://localhost:8080/room/"+r+"/messages/",
	function(d){
		console.log(d)
		for (i = 0; i < Object.keys(d).length; i++){
			console.log(d[i].id)
			if (d[i].id > latestMessage){
				//alert("new message");
				$('#chat').append("<hr></br><h3>"+ d[i]['user_id'] + ":  </h3>");
				$('#chat').append("<p>"+d[i]['message'],"</p></br></br>");
				latestMessage = d[i].id;

			}
		}
	});

}


$(document).ready(function () {
	$('#myform').on('submit', function(e) {
		e.preventDefault();
		
		$.ajax({
			url : $(this).attr('action') || window.location.pathname,
			type: "POST",
			data: $(this).serialize(),
			error: function (jXHR, textStatus, errorThrown) {
				alert(errorThrown);
			}
		});
	});
});