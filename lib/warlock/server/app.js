var flatiron = require('flatiron'),
	path = require('path'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema;



var app = module.exports = flatiron.app;

mongoose.connect('mongodb://localhost/admin',{ server: { poolSize: 10 }});


app.use(flatiron.plugins.http,{
 headers:{
 	'x-powered-by': 'Warlock 0.1.0',
 	'Access-Control-Allow-Origin':'*',
 	'Content-Type': 'application/json'
 }
});

app.config.file({ file: path.join(__dirname, 'config.json') });


app.router.get('/', function () {
  this.res.statusCode = 400;
  this.res.json({"message":"No resource specified"});
});

['Users'].forEach(function (key) {
	var k = key.toLowerCase();
	app[k] = require('./api/'+k);
	app[k].init();
});

app.start(8008);