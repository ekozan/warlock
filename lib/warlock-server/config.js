
var app = require('./app.js'),
    path = require('path');


var defaults = {
  loglevel: 'info',
  loglength: 110,
  "deploy-sub-domain":"app.3ko.fr",
  // root: process.env.HOME,
  timeout: 4 * 60 * 1000,
  // tmproot: path.join(process.env.HOME, '.spell/tmp'),
  // userconfig: '.spell/.spellconf',
  modules:['users']
};

app.config.file({ file: path.join(__dirname, 'config.json') });
app.config.defaults(defaults);
