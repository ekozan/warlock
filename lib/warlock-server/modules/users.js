var tools = require('warlock-api').tools,
    mongoose = require('mongoose');
var Schema = mongoose.Schema;

exports.name = 'users';

exports.attach = function (options,callback) {
  var app = this;

  if(typeof app.db == "undefined"){
    console.warn('warlock.plugins.users requires the `db` module');
    process.exit(1);
  }



  app.User = User || app.User;
  console.log(app.config.get('groups'));
  app.Groups = app.config.get('groups') || app.Groups;


  app.http.before.push(function(req, res) {
    checkAuth(req,res,{ingore_expire: true ,expire_time: app.config.get('resquest_exprie')});
  });

  app.http.before.push(function(req, res) {
    checkPerm(req,res,{Groups:app.Groups});
  });

  app.router.get('/users',function all(){
    console.log(this.req.current_user);
  });

  app.router.post('/users',function create(){
    console.log(this.req);
  });

  app.router.get('/users/:user',function get(user){
    console.log(this.req.current_user);
  });

  // app.router.put('/users/:user',update(user));
  // app.router.delete('/users/:user',destroy(user));
}


exports.init = function(done){
  console.log('init');
  done();
}


//before functions
function checkAuth(req,res,options){
  var authorization = req.headers['authorization'];

    req.current_user = {};
    req.current_user.group = 'guest';
    req.current_user.isAuth = false;

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
                req.current_user = user;
                req.current_user.isAuth = true;
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
  var group_perms =  options.Groups[req.current_user.group] || [];
  if(group_perms.some(function(perm){
    var match = req.url.match(perm.ressource);
    if(match[0] && perm.perms[req.method])
      return true;
    else
      return false;
  })){
    res.emit('next');
  }else{
    res.statusCode = 401;
    res.json({"message":"You don't have the permission to do that"});
  }
}


//MODELS
var User = mongoose.model('User',new Schema({
  email: String,
  group: String,
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
