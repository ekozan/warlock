

exports.name = 'users';

exports.attach = function (options) {
  var app = this;
  app.user = {} || app.user;

}


exports.init = function(done){
  console.log('init');
  done();
}
