
exports.name = 'deploy';

exports.attach = function (options,callback) {
  if(app.config.get('server-type') == "deployer"){
    //publish http api;
  }

  this.deployer.client = new deployer.client({

  });
}


var deployer = function(options){
  var options = {} || options;
  this.server = function(options){
  }
  this.client = function(options){
  }
}
