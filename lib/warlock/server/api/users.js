var app = require('../app'),
	mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	bcrypt = require('bcryptjs');

var users = exports;

users.init = function(){
	app.router.path(/\/users\/?(\w+)?/, function () {
	    this.post(function (id) {
	    });

	    this.get(users.get);
	   	this.post(users.create);
	    this.delete(users.delete);

	    this.get(/\/friends/, function (id) {
	    });
	});

}


users.get = function (id) {
	var that = this
	if(id){
		var User = mongoose.model('User', users.userSchema);
		User.findOne({name:id},function(err, fuser){
			if(err){
				that.res.json({"message":""+err.message});
			}
			
			if(fuser == null)
			{

				bcrypt.hash('bacon', 8, function(err, hash) {
					that.res.json({"message": "user don't exist","pass":hash});
				});

			}else{
				that.res.json({"message":fuser});
			}
		});
	}else{
		this.res.json({"message":"Users List if admin"});
	}
};	

users.create = function (id) {
	var that = this
	if(id){
		var User = mongoose.model('User', users.userSchema);
		User.findOne({name:id},function(err, fuser){
			if(err){
				that.res.json({"message":""+err.message});
			}
			
			if(fuser == null)
			{
				User.create({name:id},function(err){
					that.res.json({"message":fuser});
				});
			}else{
				that.res.json({"message":fuser + " already exist"});
			}
		});
	}
};	

users.delete = function(id){
	var that = this
	if(id){
		var User = mongoose.model('User', users.userSchema);
		User.remove({name:id},function(err){
			if(err){return that.res.json({"message":"error"});}
			that.res.json({"message":"succcess"});
		});
	}
}




users.userSchema = new Schema({
  name:  String,
  password: String,
  groupe: Number,
  updated: { type: Date, default: Date.now }
});


users.groupSchema = new Schema({
  name:  String,
  groupe: Number,
  updated: { type: Date, default: Date.now },
  perms:{
  	admin:Boolean,
  	canReadApi:Boolean,
  	canCreateInstance:Boolean,
  	Instance: {
  		canCreate:Boolean,
  		canDelete:Boolean,
  		canUpgrade:Boolean,
  		maxInstance:Number,
  		maxMemory:Number
  	},
  }
});