/*
 *	platform.js	Abstract out latform specific functions.
 *
 */

var samsung = require('./samsung/samsung.js'),
	browser = require('./browser/browser.js');

switch (true) {
	case samsung != null:
		module.exports = samsung;
		break;
	case browser != null:
		module.exports = browser;
		break;
	default:
		break;
}

