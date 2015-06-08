var app = require('./server/app');

var secret = process.env.SECRET || 'arandomblobhere';
var viewspath = __dirname + '/public/views';
var staticpath = __dirname + '/public/dist';

var server = app(secret, viewspath, staticpath);
var port = process.env.PORT || 3000;
server.listen(port);
console.log("server running on port " + port);
