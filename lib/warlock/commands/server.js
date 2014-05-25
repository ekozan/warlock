var warlock = require('../../warlock'),
    utile = require('../common'),
    async = utile.async,
    ipm2 = require('pm2-interface')(),
    path = require('path'),
    fs = require('fs'),
    spawn = require('child_process').spawn,
        back = require('back'),
	server = exports;

server.usage = [
  'The `warlock server` command manages',
  'Applications on Spell. Valid commands are:',
  '',
  'warlock server start',
   'warlock server stop',

  '',
];

server.start = function (callback) {
  startApp(function(err,success){
  		callback(err);
  });
}

server.stop = function (callback) {
}



// Solenoid start Function from node jitsu

var startApp = function startApp(callback) {

  var backoff = { retries: 5, minDelay: 100, timeout:2000 },
      runDir = path.resolve(process.mainModule.filename, '../../');
      homeDir = path.join(process.env.HOME, '.warlock');
      startLog = path.join(homeDir, 'start.log'),
      responded = false,
      retries = 0,
      args = [],
      pid = '',
      env = {},
      pidFile = path.join(homeDir,'warlock.pid'),
      nodeModulesBin = null,
      backupPath = null,
      initPath = null,
      attempt = null,
      start = null,
      child = null,
      tail = null;

  warlock.log.info('Starting API ...');

  //
  // Set the node_modules .bin path to be set in various locations
  //
  nodeModulesBin = path.join(runDir, 'node_modules', '.bin');

  //
  // Setup the `aeternum` arguments.
  //
  args = ['start', '--min-uptime', 1000, '-o', path.join(homeDir, 'forza.log'), '--', 'forza'];

  //
  // Setup `forza` arguments.
  //
  args.push('-h', warlock.config.get('instruments_host'));
  args.push('-p', warlock.config.get('instruments_port').toString());

  args.push('--start-log', startLog);
  args.push('--app-user', 'root');
  args.push('--app-name', "warlock Api webserver");
  args.push('--');

  //
  // Merge the env with `app.env` and `process.env`.
  //
  [process.env].forEach(function (obj) {
    if (!obj || typeof obj !== 'object') { return }
    Object.keys(obj).forEach(function (key) {
      env[key] = obj[key];
    });
  });

  env.PATH = [nodeModulesBin]
    // .concat(options.enginePaths)
    .concat(env.PATH.split(':'))
    .join(':');

  //
  // Remark: we have to do custom detection of coffee-script as it needs to be
  // prepended with node (#!/usr/bin/env node is not intelligent enough)
  //
  start = ["node",path.join(runDir,"lib/warlock/server/app.js")];

  //
  // Set possible path locations where a coffee binary would live and replace
  // 'coffee' with one of these paths
  //

  	args.push.apply(args, start);

    // ### function done (err)
    // Responds once to the callback
    //
    function done(err) {
      if (!responded) {
        responded = true;
        callback.apply(null, arguments);
      }
    }

    //
    // ### function awaitStart ()
    // Writes `options.pidFile` and tails the `forza`
    // start log for the start event.
    //
    function awaitStart() {
      async.series([
        function writePid(next) {
          warlock.log.info('Writing pidfile: ' + pidFile);
          fs.writeFile(pidFile, pid, next.bind(null, null));
        },
        function tailLog(next) {
          var allLog = '',
              json;

          //
          // Helper function which attempts to respawn
          // the `tail` process in the (rare) case
          // that forza has not already written to it.
          //
          function retry(err) {
            //
            // Exponential backoff for retrying the tail process
            //
            return back(function (fail) {
              if(fail) {
                warlock.log.info('Tail failed after ' + backoff.retries + ' retries');
                attempt = null;
                return next(err);
              }
              warlock.log.info('Retry # ' + backoff.attempt + ' with ' + backoff.timeout + 'ms interval');
              tailLog(next);
            }, backoff);
          }

          warlock.log.info('Tailing forza log: ' + startLog);
          tail = spawn('tail', [ startLog ]);
          tail.on('error', retry);

          //
          // Remark: use close event so we ensure we got all possible data out
          // of the streams
          //
          tail.on('close', function (code, signal) {
            warlock.log.info('Tail closing..');
            //
            // Remark: tail.kill() sends sigterm so ensure we have the json and
            // we killed it appropriately
            //
            if (typeof json !== 'undefined' || signal === 'SIGTERM') {
              return next();
            }

            retry(new Error('tailing start log exited poorly with code ' + code || signal))
          });

          tail.stdout.on('data', function (data) {
            allLog += data;

            try { json = JSON.parse(allLog) }
            catch (ex) { return }

            // Use console.log to ensure it is JSON parseable
            console.log(JSON.stringify(json));

            try { tail.kill() }
            catch (ex) { }
          });
        }
      ], done);
    }

    warlock.log.info('Spawn: ' + args.join(' '));
    child = spawn('aeternum', args, {
      cwd: path.join(runDir),
      env: env
    });

    child.on('error', done);
    child.stdout.on('data', function (chunk) {
      pid += chunk.toString('utf8');
    });

    child.stdout.on('end', function () {
      if (!responded) {
        pid = parseInt(pid, 10).toString();
        warlock.log.info('`aeternum` pid: ' + pid);
        awaitStart();
      }
    });
};