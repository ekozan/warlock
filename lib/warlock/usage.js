
var colors = require('colors');

module.exports = [
  ' __      __                   ___                   __         '.cyan,
  '/\\ \\  __/\\ \\                 /\\_ \\                 /\\ \\        '.cyan,
  '\\ \\ \\/\\ \\ \\ \\     __     _ __\\//\\ \\     ___     ___\\ \\ \\/\'\\    '.cyan,
  ' \\ \\ \\ \\ \\ \\ \\  /\'__`\  /\\`\'__\\\\ \\ \\   / __`\\  /\'___\\ \\ , <    '.cyan,
  '  \\ \\ \\_/ \\_\\ \\/\\ \\L\\.\\_\\ \\ \\/  \\_\\ \\_/\\ \\L\\ \\/\\ \\__/\\ \\ \\\\`\\  '.cyan,
  '   \\ `\\___x___/\\ \\__/.\\_\\\\ \\_\\  /\\____\\ \\____/\\ \\____\\\\ \\_\\ \\_\\'.cyan,
  '    \'\\/__//__/  \\/__/\\/_/ \\/_/  \\/____/\\/___/  \\/____/ \\/_/\\/_/'.cyan,
  '                 '.cyan,

  '',

  'Usage:'.cyan.bold.underline,
  '',
  ' warlock <resource> <action> <param1> <param2> ...',
  '',

  'Common Commands:'.cyan.bold.underline,
  '',

  'To manage user into Warlock'.cyan,
  ' warlock users',
  '',

  'To manage config into Warlock'.cyan,
  ' warlock config',
  '',

  'Additional Commands'.cyan.bold.underline,
  ' warlock start',
  ' warlock stop',
  ' warlock restart',
  ' warlock reload'
];