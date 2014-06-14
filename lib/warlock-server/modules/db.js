exports.name = 'db';

exports.attach = function (options,callback) {
  var app = this;
  app.db = {} || app.db;
  app.db = require('mongoose');
  console.log('attach db');
}

exports.init = function(done){
  var app = this;
  console.log('init db');
  try{
    app.db.connect('mongodb://localhost/test');
  }catch(e){
    console.warn('');
    process.exit(1);
  }
  done();
}
