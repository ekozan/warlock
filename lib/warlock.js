var path = require('path'),
    util = require('util'),
    colors = require('colors'),
    flatiron = require('flatiron');
require('pkginfo')(module, 'name', 'version');

var warlock = module.exports = flatiron.app;

warlock.use(flatiron.plugins.cli, {
  version: true,
  usage: require('./warlock/usage'),
  source: path.join(__dirname, 'warlock', 'commands'),
  argv: {
    version: {
      alias: 'v',
      description: 'print warlock version and exit',
      string: true
    }
  }
});

warlock.options.log = {
  console: {
    raw: warlock.argv.raw
  }
};


warlock.prompt.override = warlock.argv;

require('./warlock/config');



warlock.api = {};
warlock.api.started = false;
warlock.api.init = function (callback) {
  if (warlock.api.start === true) {
    return callback();
  }

  var userAgent = warlock.config.get('headers:user-agent');
  if (!userAgent) {
    warlock.config.set('headers:user-agent', 'warlock/' + warlock.version);
  }

  ['Users', 'Apps'].forEach(function (key) {
    var k = key.toLowerCase();
    warlock[k] = new warlock.api[key](warlock.config);
    warlock[k].on('debug::request', debug);
    warlock[k].on('debug::response', debug);
    function debug (data) {
      if (warlock.argv.debug || warlock.config.get('debug')) {
        if (data.headers && data.headers['Authorization']) {
          data = JSON.parse(JSON.stringify(data));
          data.headers['Authorization'] = Array(data.headers['Authorization'].length).join('*');
        }

        util.inspect(data, false, null, true).split('\n').forEach(warlock.log.debug);
      }
    };
  });
  warlock.api.started = true;
  return callback();};
warlock.api.Client = require('warlock-api').Client;
warlock.api.Apps = require('warlock-api').Apps;
warlock.api.Users = require('warlock-api').Users;

warlock.welcome = function () {
  warlock.log.info('Welcome to ' + 'Warlock'.grey + ' administration console');
  warlock.log.info('Warlock v' + warlock.version + ', node ' + process.version);
  warlock.log.info('It worked if it ends with ' + 'warlock cast:'.grey + ' critical strike'.green.bold);
};





warlock.start = function (callback) {

  warlock.init(function (err) {
	    if (err) {
	      warlock.welcome();
	      warlock.showError(jitsu.argv._.join(' '), err);
	      return callback(err);
	    }

      warlock.welcome();

     return warlock.exec(warlock.argv._, callback);
   });
};

warlock.exec = function (command, callback) {
	function execCommand (err) {
	    if (err) {
	      return callback(err);
	    }

	    warlock.log.info('Executing command ' + command.join(' ').magenta);
	    warlock.router.dispatch('on', command.join(' '), warlock.log, function (err, shallow) {
			if (err) {
				warlock.showError(command.join(' '), err, shallow);
				return callback(err);
			}
	      callback();
	    });
  	}


 return warlock.api.started ? execCommand(): warlock.api.init(execCommand);
};


warlock.showError = function(command, err, shallow, skip){
  warlock.log.info('\n');
  warlock.log.error('Error on command : ' + command.magenta);
  if (err.result) {
      if (err.result.message) {
        warlock.log.error(err.result.message);
      }
  }
  else if (err.message) {
    warlock.log.error("Error msg : "+err.message);
  }
}


