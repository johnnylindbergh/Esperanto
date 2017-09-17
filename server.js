var express = require('express');
var anyDB = require('any-db');
var mustacheExpress = require('mustache-express');
var mustache = require('mustache');
//Make sure zipcodes.db exists before you do this!
var conn = anyDB.createConnection('sqlite3://chat.db');
var localeDict = [];

localeDict['Spanish'] = "es";
localeDict['Chinese'] = "zh-CN";
localeDict['French'] = "fr";
localeDict['Hindi'] = "hi";
localeDict['Arabic'] = "ar";
localeDict['Portuguese'] = "pt";
localeDict['Russian'] = "ru";
localeDict['German'] = "de";
localeDict['English'] = "en";



var app = express();
var GoogleTranslate = require('google-translate-api-nodejs-client');
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.engine('html', mustacheExpress());
//app.use(express.static('views'));
app.use('/', express.static('views'))
app.use('/', express.static('views/css'))

app.set('view engine', 'mustache');
conn.query('CREATE TABLE IF NOT EXISTS messageTable (id integer PRIMARY KEY AUTOINCREMENT, user_id integer, language TEXT, room integer, message TEXT, time timestamp NOT NULL default CURRENT_TIMESTAMP)')
conn.query('CREATE TABLE IF NOT EXISTS roomTable (id integer PRIMARY KEY AUTOINCREMENT, room TEXT,lastVisit timestamp NOT NULL default CURRENT_TIMESTAMP)')
conn.query('CREATE TABLE IF NOT EXISTS userTable (id integer PRIMARY KEY AUTOINCREMENT, username TEXT, language TEXT)')

.on('error', function(e){
	console.log('myer:',e);
});


//app.get('/', function(request, response){
	//response.send('<p>Test Page</p>');
//});

function translate(source, target, text) {
	
var result = ''
new GoogleTranslate({
	API_KEY:""
})
.translate({
	source:source,
	target:target,
	text:text

}, function (err, translation) {
	console.log('aljsld',translation);
	//return (translation)
	var result = translation;
	console.log(err);
})
console.log("this",result);
return (result)
};


app.get('/', function(request, response){
	response.render('index.html');
});

app.get('/messages', function(request, response){
	conn.query('SELECT * FROM messageTable')
	   	.on('data', function(e){
	   		console.log('e:',e.message);
			console.log('e:',e.id);
	   		response.send(e);
		//	response.write('</br>');

	   	})
		.on('end',function(er){
			console.log('end\n');
			//response.end();
		})
		.on('error',function(er){
			console.log('error:',er);
			//response.end();
		});	
});

//app.post('/', function(request, response){
//	
//}

app.post('/', function(request, response){
	//console.log(request.body.name)
	conn.query('INSERT INTO messageTable (message) VALUES ($1);',
		 [request.body.name])
	   	.on('error', function(e){
	   		console.log(e);
	   	});
	//response.render('room.html');
	
//		var message = []
//		conn.query('SELECT message FROM messageTable')
//		   	.on('data', function(e){
//		   		console.log('e:',e.message);
//		   		message.push(e);
//				
//
//		   	})
//			.on('end',function(er){
//				console.log('end\n');
//				
//				//response.send(message)
//				//response.end();
//			})
//			.on('error',function(er){
//				//console.log('error:',er);
//				//response.end();
//			});
	//response.send('You sent the message "' + request.body.name + '".');

});
function sendMessage(message, room, username, language){
	//get room id from DB
	
	var roomId;
	conn.query('SELECT id FROM roomTable WHERE room=($1);',
	 [room])
	   	.on('data', function(r){
			console.log('data returned');
			 roomId = r.id;
			console.log('room id:', roomId);
			console.log('room given id:', room);
			conn.query('INSERT INTO messageTable (room, message, language, user_id) VALUES ($1,$2,$3,$4);',
				 [roomId, message, language, username])
			   	.on('error', function(e){
			   		console.log('s:', e);
			   	});
			
			conn.query('UPDATE roomTable SET lastVisit=CURRENT_TIMESTAMP WHERE id=($1);',
			 [roomId])
			   	.on('error', function(e){
			   		console.log('s:', e);
			   	});
				var userExists = false;
				conn.query('SELECT id FROM userTable WHERE username=($1);',
				 [username])
				   	.on('data', function(r){
						userExists = true;
					})
					.on('error', function(r){
						console.log(r);
					})
					.on('end', function(d){
						console.log(d);
						if (userExists == false){
							conn.query('INSERT INTO userTable (username, language) VALUES ($1,$2);',
								 [username, language])
							   	.on('error', function(e){
							   		console.log('s:', e);
							   	});
							
						}
					})
					
//			conn.query('INSERT INTO roomTable (lastVisit) VALUES CURRENT_TIMESTAMP;')
//			   	.on('error', function(e){
//			   		console.log(e);
//			   	});
			
			
			
	   	})
		.on('error',function(er){
			console.log('error:',er);
		});	
		
		
	
	}
	
function getLangOfUser(user){
	var data = ""
	conn.query("select language from userTable WHERE username = ($1)",[user])
	.on('data', function (dataResponse) {
		data = dataResponse;
	})
	.on('end', function () {
		if (data != ""){
			return data;
		}else{
			return false;
		}
	})
	
	
	
}

function translationHandle(response, totalMessages, currentMessage, translationArray,message){
	if (totalMessages == currentMessage){
		console.log(translationArray);
		console.log(message);
		for (var m = 0; m < totalMessages; m++){
			message[m]['message'] = translationArray[m];
			
		}
		console.log(message);
		response.send(message);
		response.end();
		
	}
	
	//return (message)
	
}

function renderRoom(roomN, response, request, json, LangTarget,user) {
	//console.log(roomN, response, request, json, LangTarget, username);
	var exists = false;
	var serverRoomName;
	var serverRoomId;
	var results;
	conn.query('SELECT * FROM roomTable WHERE room=($1);',
	 [roomN])
	   	.on('data', function(r){
			exists = true;
			console.log('render room:',r.room,r.id);
			results = r;
			serverRoomName = r.room;
			serverRoomId = r.id;
			results = r;
			if (json == true){
				console.log('json');
				var message = [];
				var translatedMessages = [];
				conn.query('SELECT * FROM messageTable WHERE room=($1);',
				 [serverRoomId])					   	
				.on('data', function(e){
						   		console.log('e:',e);
						   		message.push(e);
								console.log(e);
								
				
						   	})
							.on('end',function(er){
								console.log('m:',message);
								console.log(message.length);
								var isDone = 0;
								for (var m = 0; m < message.length; m++){
									console.log(m);
									
									if (message[m]['language'] != LangTarget){
										console.log('translation required');
										console.log("message[m]['language']",message[m]['language']);
										console.log("message[m]['message']",message[m]['message']);
										console.log("targetLang", LangTarget);

										var translationArray = [];
										new GoogleTranslate({
											API_KEY:"AIzaSyB2pGbsK1wnw4Qhmd2zj9okdkT55zOjqsE"
										})
										.translate({
											source:message[m]['language'],
											target:LangTarget,
											text:message[m]['message']

										}, function (err, translation) {
											console.log(translation);
											translationArray.push(translation);
											isDone++;
											translationHandle(response, message.length, translationArray.length, translationArray,message);
											
										})

										
									}
									
								}
								//response.send(message)
								console.log(translationArray)
								//response.end();
							})
							.on('error',function(er){
								console.log('error:',er);
								//response.end();
							});
			}

			

	   	})
		.on('end',function(er){
			console.log('end\n');
			if (json == false){
				response.render('room.html',{room: serverRoomName});
			}else{
				if (!exists){
					response.render('index.html');
				}
			}
			
		})
		.on('error',function(er){
			console.log('error:',er);
			
		});	
		
		}


app.post('/roomCreated/', function(req, res){
	//var output = req.params.p;	
	app.use('/roomCreated', express.static('views'))
	var roomName = req.body.roomName
	var targetLang = req.body.language;
	console.log(roomName)
	conn.query('INSERT INTO roomTable (room) VALUES ($1);',
		 [roomName])
	   	.on('error', function(e){
	   		console.log(e);
			
	   	});
	res.render('roomCreated.html',{room: roomName});
	//renderRoom(roomName, res, req, false, targetLang);
});

//app.get('/roomCreated/', function (req,res) {
//	app.use('/roomCreated/', express.static('views'));
//	response.render('roomCreated.html',{roomName: serverRoomName});
//})

//if params are given
//app.get('/room/', function(req, res){
//	res.redirect('/');
//});
app.get('/room/:r/messages/', function(req, res){
	var room = req.params.r;
	//var user = req.params.u;
	var user = 'testUser';
	console.log(user);
	renderRoom(room, res, req, true, 'en', user);
	
});

app.get('/getrooms/', function(req, res){
	roomList = []
	conn.query('SELECT * FROM roomTable;')
	   	.on('data', function(d){
			roomList.push(d)
			})
		.on('end', function(d){
			console.log('end:',d);
			res.send(roomList)
			res.end();
			})
		
		
	
});

app.get('/room/:p', function(req, res){
	
	var room = req.params.p;	
	console.log('/room/'+room);
	app.use(('/room/'+room), express.static('views'));

	console.log(room)
	renderRoom(room, res, req, false,'mee');
});

app.post('/room/:p', function(req, res){
	var room = req.params.p;	
	console.log('/room/'+room);
	app.use(('/room/'+room), express.static('views'));
	var message = req.body.name;
	var user_name = req.body.username;
	var user_lang = req.body.language;
	console.log(room, message,user_name);
	sendMessage(message, room, user_name, user_lang);
	renderRoom(room, res, req, false, user_name);
	
	});
	

var keys = Object.keys(localeDict);
var lang = localeDict[keys[ (keys.length-1) * Math.random() << 0]];
console.log(translate(localeDict['English'], lang, "Hello, Welcome to Johnny's server"));

//translate(localeDict['English'], localeDict['Chinese'], "Hello, Welcome to Johnny's server");


	
//Visit localhost:8080
var port = 8080;
app.listen(port);
console.log('listening on port:',port);
