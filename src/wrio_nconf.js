const path = require( 'path');
const nconf = require('nconf');

nconf.env().argv();

var basedirPath = path.dirname(require.main.filename); // won't work with unit tests
var filename = path.resolve(__dirname, '../config.json');
nconf.file(filename);
console.log(`Config loaded ${filename}`);

module.exports = nconf;