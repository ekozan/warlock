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
  app.Groups = app.config.get('groups') || app.Groups;


  app.http.before.push(function(req, res) {
    checkAuth(req,res,{expire_time: app.config.get('resquest_exprie')});
  });

  app.http.before.push(function(req, res) {
    checkPerm(req,res,{Groups:app.Groups});
  });

  app.router.get('/users',function all(){
    var res = this.res;
    User.find({}, function (err, users) {
         var userMap = {};
         users.forEach(function(user) {
              var id = user._id;
              user._id = undefined;
              user.password = undefined;
              user.pkey = undefined;
              user.__v = undefined;
              userMap[id] = user;
         });
         res.json(userMap);
    });
  });

  app.router.post('/users',function create(){
    var res = this.res;
    var data = this.req.body;
    data.group = 'user';
    var user = new User(data);
    user.save(function(err){
      if (err){
        if(err.code == 11000){
          res.statusCode = 500;
          res.json({"message":"User already exist"});
        }else{
          res.statusCode = 500;
          res.json({"message":"Server error"});
        }
      }else{
        res.statusCode = 200;
        res.json({"message":"User created"});
      }
    })
  });

  app.router.get('/users/me',function getMe(){
    this.res.statusCode = 200;
    console.log(this.req.current_user);
    this.res.json(this.req.current_user);
  });

  app.router.get('/users/:user',function get(user){
    console.log(this.req.body);
  });

  // app.router.put('/users/:user',update(user));
  // app.router.delete('/users/:user',destroy(user));
}


// exports.init = function(done){
//   done();
// }


//before functions
function checkAuth(req,res,options){
  var authorization = req.headers['authorization'];

    req.current_user = {};
    req.current_user.group = 'guest';
    req.current_user.isAuth = false;

  if(authorization)
  {
    auth_parts = authorization.split(' ');
    if(auth_parts.length == 4  && auth_parts[0] == "WL-TOKEN")
    {
      var now = new Date().getTime();
      if(options.ingore_expire || parseInt(auth_parts[3]) < now && (parseInt(auth_parts[3]) + parseInt(options.expire_time)) > now)
      {
        User.findOne({email: auth_parts[1]}).lean().exec(function(err,user){
          if(err) return;
          if(user){
            tools.sign(user.pkey,user.email+req.method+req.url+parseInt(auth_parts[3]),function(err,signhash){
              if(err) that.res.json({"err":err});
              if(auth_parts[2] == signhash)
              {
                user.id = user._id;
                user._id = undefined;
                user.password = undefined;
                user.pkey = undefined;
                user.__v = undefined;
                req.current_user = user;
                req.current_user.isAuth = true;
                res.emit('next');
              }else{
                res.emit('next');
              }
            });
          }else{
            //invalid sign (bad password or exploit)
            res.emit('next');
          }
        });
      }else{
        //exploit
        res.statusCode = 403;
        res.json({'message':'attempted replay attack ? [token-time = '+parseInt(auth_parts[3])+', current-time = '+now+']'})
        //res.emit('next');
      }

    }else{
      // bad client ;)
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
    if(match && match[0] && perm.perms[req.method])
      return true;
    else
      return false;
  })){
    res.emit('next');
  }else{
    if(req.current_user.isAuth){
      res.statusCode = 403;
      res.json({"message":"You don't have the permission to do that"});
    }else{
      res.statusCode = 401;
      res.json({"message":"The request requires user authentication"});
    }
  }
}


//MODELS
var User = mongoose.model('User',new Schema({
  email: { type: String, required: true , unique:true},
  group:  { type: String, required: true },
  password: String,
  pkey: String,
  created_at: { type: Date, default: Date.now },
  updated_at: Date
}).pre('save', function (next) {
  var user = this;
  user.updated_at = Date.now;
  if (!user.isModified('password')) return next();
  tools.pbkdf2(user.password,user.email,function(err,hash){
    if(err) return next(err);
    user.password = null;
    user.pkey = hash;
    next();
  });
}));
