
/**
 * Module dependencies.
 */

 var express = require('express')
 , routes = require('./routes')
 , user = require('./routes/user')
 , http = require('http')
 , path = require('path')
 ,	redis=require('redis')

 var app = express();

 app.configure(function(){
 	app.set('port', process.env.PORT || 3000);
 	app.set('views', __dirname + '/views');
 	app.set('view engine', 'jade');
 	app.use(express.favicon());
 	app.use(express.logger('dev'));
 	app.use(express.bodyParser());
 	app.use(express.methodOverride());
 	app.use(app.router);
 	app.use(express.static(path.join(__dirname, 'public')));
 });

 app.configure('development', function(){
 	app.use(express.errorHandler());
 });

 app.get('/', routes.index);
 app.get('/users', user.list);

 var server=http.createServer(app)
 server.listen(app.get('port'), function(){
 	console.log("Express server listening on port " + app.get('port'));
 });

// var pub=redis.createClient()

// var createClient=function(socket){
// 	var client={
// 		socket: socket,
// 		sub: redis.createClient(),
// 		subscribe: function(channelName){
// 			var T=this
// 			T.sub.on('message',function(channel, message){
// 				console.console.log('message',message);
// 				T.socket.of(channel).emit(message)
// 			})
// 			T.sub.subscribe(channelName)

// 		},
// 		unsubscribe: function(){}
// 	}
// 	return client
// }


//  // io.set('log level',0)
//  var io = require('socket.io').listen(server);
//  io.sockets.on('connection', function (client) {
// 	console.log('socket connected');

//  	// userId2socket[client.id]=client
// 	//console.log('client',client);

// 	var c1=createClient(client)
// 	c1.subscribe('saluti')

// 	pub.publish('saluti','ciao')

// });
var io = require('socket.io').listen(server);
var pub = redis.createClient();

// Socket handler
io.sockets.on("connection", function(socket) {
	console.log('connecteed');
  
  var sub = redis.createClient();
  
  sub.subscribe("messages");
  sub.on("message", function(channel, message) {
  	console.log('message',message);
    socket.emit(channel,message);
  });

  socket.on("disconnect", function() {
    sub.unsubscribe("messages");
    sub.quit();
  });
});
pub.publish("messages", JSON.stringify({type: "foo", content: "bar"}));