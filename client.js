function reload () {
	$.get("http://localhost:8080/messages",
	function(d){
		//alert(Object.keys(d).length);
	$('#feed').prepend(d)
		//alert(storedTweets)
	});

}

setInterval(reload, 1000);