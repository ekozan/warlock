
var app = require('./app.js'),
    path = require('path');


var defaults = {
  loglevel: 'info',
  loglength: 110,
  "deploy-sub-domain":"app.3ko.fr",
  timeout: 4 * 60 * 1000,
  modules:['db','users'],
  server_port:8008,
  resquest_exprie: 2 * 60000,
  groups:{
    guest:[
      {ressource:'/users',perms:{POST:true}},
    ],
    user:[
      {ressource:'/users/.+',perms:{GET:true,POST:true,PUT:true,DELETE:true}},
    ],
    admin:[
      {ressource:'/users',perms:{GET:true,POST:true,PUT:true,DELETE:true}},
    ]
  }
};

app.config.file({ file: path.join(__dirname, 'config.json') });
app.config.defaults(defaults);
