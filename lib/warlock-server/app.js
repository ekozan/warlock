var flatiron = require('flatiron'),
    path = require('path');

var app = module.exports = flatiron.app;

app.use(flatiron.plugins.http,{
  headers:{
    'x-powered-by': 'Warlock 0.1.0',
    'Access-Control-Allow-Origin':'*',
    'Content-Type': 'application/json'
  }
});


require('./config.js');

app.router.get('/', function () {
    this.res.statusCode = 400;
    this.res.json({"message":"No resource specified"});
});

var modules = app.config.get('modules');

modules.forEach(function (key) {
    app.use(require('./plugins/'+key));
});

app.start();
