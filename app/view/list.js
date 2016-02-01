
var Platform	= require('../platform/platform.js'),
	listTV		= require('./list-tv.js'),
	listBrowser	= require('./list-browser.js');

module.exports = Platform.tvLike ? listTV : listBrowser;

