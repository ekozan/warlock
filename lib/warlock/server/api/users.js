var app = require('../app');

var users = exports;

users.init = function(){

	app.router.path(/\/users\/?(\w+)?/, function () {
	    this.post(function (id) {
	    });

	    this.get(function (id) {
	    	this.res.json({"message":"No resource specified"});
	    });

	    this.get(/\/friends/, function (id) {
	    });
	});

}