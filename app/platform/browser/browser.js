/*
 *	browser.js	Browser platform (both mobile and desktop).
 *
 */

var Util = require('../../js/util.js');

var browser = {

	// called when everything has loaded.
	ready: function() {
		console.log('browser.ready');
	},

	// exit the app.
	exit: function() {
		if (browser.standalone)
			window.top.close();
	},

	// map key.
	mapKey: function(keyCode) {
		return 0;
	},

	// video.
	videoObject: function(opts) {
		var el = opts.el || opts.element;
		return el;
	},

	videoElement: function(attrs) {
		var el = document.createElement('video');
		for (var a in attrs)
			el.setAttribute(a, attrs[a]);
		return el;
	},

	// like a TV? (UI controlled by a simple remote)
	get tvLike() {
		return false;
	},

	get standalone() {
		// iOS
		if (navigator.standalone)
			return true;

		// Android
		if (navigator.useragent && navigator.useragent.match(/Android/) &&
			screen.height - document.documentElement.clientHeight < 40)
			return true;

		return false;
	},

	get canFullScreen() {
		if (browser.standalone)
			return false;
		if (navigator.useragent && navigator.useragent.match(/iPad|iPod|iPhone/))
			return false;
		return true;
	},

	isFullScreen: function() {
		return Util.isFullScreen();
	},

	setFullScreen: function(elem, val) {
		return Util.setFullScreen(elem, val);
	},

};
module.exports = browser;

