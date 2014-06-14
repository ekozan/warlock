var tools = require('warlock-api').tools,
    mongoose = require('mongoose');
var Schema = mongoose.Schema;

exports.name = 'users';

exports.attach = function (options,callback) {
  var app = this;
  app.User = User || app.User;
  app.current_user = {};
  app.current_user.isAuth = false;
  app.requireAuth = function(){

  };

  console.log('attach user');

  if(typeof app.db == "undefined"){
    console.warn('warlock.plugins.users requires the `db` module');
    process.exit(1);
  }


  app.http.before.push(function(req, res) {
    checkAuth(req,res,{ingore_expire: true ,expire_time: app.config.get('resquest_exprie')});
  });
  app.http.before.push(function(req, res) {
    checkPerm(req,res,{perms: app.config.get('perms')});
  });

  app.router.get('/users',function all(){
    if(app.current_user.isAuth)
    {

    }else{

    }
  });

  app.router.get('/users/:user',function get(user){

  });
  // app.router.post('/users/:user',create(user));
  // app.router.put('/users/:user',update(user));
  // app.router.delete('/users/:user',destroy(user));
}


exports.init = function(done){
  console.log('init');
  done();
}

// rest api function




// Ohter

function checkAuth(req,res,options){
  var authorization = req.headers['authorization'],
      app = this;
  app.user = {};

  if(authorization)
  {
    console.log("try auth");
    auth_parts = authorization.split(' ');
    if(auth_parts.length == 4  && auth_parts[0] == "WL-TOKEN")
    {
      console.log("good header");
      var now = new Date().getTime();
      if(options.ingore_expire || parseInt(auth_parts[3]) < now && (parseInt(auth_parts[3]) + parseInt(options.expire_time)) > now)
      {
        User.findOne({email: auth_parts[1]},function(err,user){
          if(err) return;
          if(user)
          {
            console.log('user exist');
            tools.sign(user.pkey,"eeeeee",function(err,signhash){
              if(err) that.res.json({"err":err});
              if(auth_parts[2] == signhash)
              {
                app.current_user = user;
                app.current_user.isAuth = true;
                res.emit('next');
              }else{
                console.log("badsign"+signhash);
                res.emit('next');
              }
            });
          }
          else{
            res.emit('next');
          }
        });
      }else{
        console.log("expired resquest time now " + (parseInt(auth_parts[3])+parseInt(options.expire_time)) +" -> "+ new Date().getTime());
        res.emit('next');
      }

    }else{
      console.log("bad header");
      res.emit('next');
    }
  }else{
    res.emit('next');
  }
}


function checkPerm(req,res,options){
  var perms = {} || options.perms;
  console.log(req);
  console.log(app);
}



var User = mongoose.model('User',new Schema({
  email: String,
  type: String,
  pkey: String
}).pre('save', function (next) {
  var user = this;
  if (!user.isModified('pkey')) return next();
  tools.pbkdf2(user.pkey,user.email,function(err,hash){
    if(err) return next(err);
    user.pkey = hash;
    next();
  });
}));
