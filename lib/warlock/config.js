
var path = require('path'),
    warlock = require('../warlock');

//
// Store the original `jitsu.config.load()` function
// for later use.
//
var _load = warlock.config.load;

//
// Update env if using Windows
//
if (process.platform == "win32") {
  process.env.HOME = process.env.USERPROFILE;
}

//
// Setup target file for `.jitsuconf`.
//
//
// TODO: Refactor broadway to emit `bootstrap:after` and put this
// code in a handler for that event
//
try {
  warlock.config.env().file({
    file: warlock.argv.warlockconf || warlock.argv.j || '.warlockconf',
    dir: process.env.HOME,
    search: true
  });
}
catch (err) {
  console.log('Error parsing ' + warlock.config.stores.file.file.magenta);
  console.log(err.message);
  console.log('');
  console.log('This is most likely not an error in warlock');
  console.log('Please check the .jitsuconf file and try again');
  console.log('');
  process.exit(1);
}


var defaults = {
  colors: true,
  loglevel: 'info',
  instruments_host: '127.0.0.1',
  instruments_port: 9885,
  loglength: 110,
  protocol: 'https',
  requiresAuth: ['apps'],
  root: process.env.HOME,
  timeout: 4 * 60 * 1000,
  tmproot: path.join(process.env.HOME, '.warlock/tmp'),
  userconfig: '.warlockconf',
};


warlock.config.defaults(defaults);

//
// Use the `flatiron-cli-config` plugin for `jitsu config *` commands
//
warlock.use(require('flatiron-cli-config'), {
  store: 'file',
  restricted: [
    'auth',
    'root',
    'remoteUri',
    'tmproot',
    'userconfig'
  ],
  before: {
    list: function () {
      var username = warlock.config.get('username'),
          configFile = warlock.config.stores.file.file;

      var display = [
        ' here is the ' + configFile.grey + ' file:',
        'To change a property type:',
        'warlock config set <key> <value>',
      ];

      if (!username) {
        warlock.log.warn('No user has been setup on this machine');
        display[0] = 'Hello' + display[0];
      }
      else {
        display[0] = 'Hello ' + username.green + display[0];
      }

      display.forEach(function (line) {
        warlock.log.help(line);
      });

      return true;
    }
  }
});

//
// Override `jitsu.config.load` so that we can map
// some existing properties to their correct location.
//
warlock.config.load = function (callback) {
  _load.call(warlock.config, function (err, store) {
    if (err) {
      return callback(err, true, true, true);
    }

    warlock.config.set('userconfig', warlock.config.stores.file.file);

    if (store.auth) {
      var auth = store.auth.split(':');
      warlock.config.clear('auth');
      warlock.config.set('username', auth[0]);
      warlock.config.set('password', auth[1]);
      // create a new token and remove password from being saved to .jitsuconf
      warlock.tokens.create(auth[0], (warlock.config.get('apiTokenName')||'warlock'), function(err, result) {
          if(!err && result) {
            var token = Object.getOwnPropertyNames(result).filter(function(n){return n !== 'operation'}).pop();
            warlock.config.set('apiToken', result[token]);
            warlock.config.set('apiTokenName', token);
            warlock.config.clear('password');
            return warlock.config.save(callback);
          }
        });


    }

    callback(null, store);
  });
};

