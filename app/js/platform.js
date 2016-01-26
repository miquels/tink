/*
 *	platform.js	Abstract out latform specific functions.
 *
 */

var samsung = require('./samsung.js');

// dummy functions.
exports.exit = function() { };
exports.ready = function() { };
exports.mapKey = function() { return 0; };

if (samsung) {
	module.exports = samsung;
}

