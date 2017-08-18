$("#roomButton").hover(function() {
	 $(this).css("animation-name", "buttonAnimation");
	$(this).css("width", "250px");
	$('input').show();
	});
	
function submit()
	{
		return false;
	}

	

$("#butt a").click(function() {
	//window.location.href = '/room/';	
	$("#roomForm").submit();
		});
	

$.get("http://localhost:8080/getrooms/",
function(d){
	console.log(d);
	for (i = 0; i < Object.keys(d).length; i++){
		
		$('#roomList').append("<a id='room'href='" + "/room/"+d[i]['room'] +  "/'><h2>"+d[i]['room']+"</h2></br><p>Last Visit: ("+d[i]['lastVisit']+")</p></a></br>");
	//$('#roomList').append("<div id='room'><p>"+d[i]['room']+"</br>"+d[i]['lastVisit'],"</p></div>");
	}
});








			
//$("#messagesB").click(function() {
//				 alert('roomB');
//				});
//				
//$("#messagesC").click(function() {
//					 alert('roomC');
//					});
//					
//$("#messagesD").click(function() {
//						 alert('roomD');
//						});
//						
//$("#messagesC").click(function() {
//							 alert('roomC');
//							});

