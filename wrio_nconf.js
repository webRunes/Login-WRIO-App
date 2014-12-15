var exports = module.exports = {};

exports.init = function () {
	var path = require('path');
	var fs = require("fs");

	// nconf config
	var nconf = require('nconf');
	var fs = require('fs');
	// Favor command-line arguments and environment variables.
	nconf.env().argv();
	nconf.file({file:'./config.json'});
	nconf.set('database:host', '127.0.0.1');
	// Check for a config file or the default location.
	// if (path = nconf.get('conf')) {
	// 	nconf.file({file: path});
	// }
	// else if (fs.statSync('config.json')) {
	// 	nconf.file('config.json');
	// }
	// end nconf config
	return nconf;
};
