/*
 * keys.js	Map device-specific keys to generic values.
 *
 */

var Platform	= require('./platform.js'),
	keycodes	= require('./keycodes.js'),
	_			= require('underscore');

var keys = _.extend({}, keycodes);
keys.map = function(event, inkey) {

	inkey = inkey || event.which;

	// first, platform mapping.
	var k = Platform.mapKey(inkey);
	if (k)
		return k;

	// map browser differences (firefox).
	switch (inkey) {
		case 181:
			return key.Mute;
		case 182:
			return key.VolUp;
		case 183:
			return key.VolDown;
	}

	return inkey;
}

module.exports = keys;

