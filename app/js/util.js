/*
 *	util	Utility functions.
 *
 *	util.joinpath()
 *	util.FullScreen()
 *	util.isFullScreen()
 *	util.cleanURL()
 */

function joinpath() {
	var ret = [];
	for (var a in arguments) {
		var p = arguments[a];
		if (p == null || p == '')
			continue;
		if (p.match(/^([a-z]+:|\/)/)) {
			// absolute.
			p = p.replace(/\/+$/, '');
			ret = [];
		} else {
			p = p.replace(/^\/+/, '').replace(/\/+$/, '');
		}
		if (p != '')
			ret.push(p);
	}
	return ret.join('/');
}
exports.joinpath = joinpath;

function isFullScreen() {
	return (document.fullScreenElement &&
			document.fullScreenElement !== null)
       			|| document.mozFullScreen
       			|| document.webkitIsFullScreen;
}
exports.isFullScreen = isFullScreen;

function setFullScreen(elem, enable) {
	var m;
	if (elem && enable !== false) {
		m = [	'requestFullscreen', 'msRequestFullscreen',
				'mozRequestFullScreen', 'webkitRequestFullscreen' ];
	} else {
		m = [	'exitFullscreen', 'msExitFullscreen',
				'mozCancelFullScreen', 'webkitExitFullscreen' ];
		elem = document;
	}
	for (var f in m) {
		if (elem[m[f]]) {
			elem[m[f]]();
			break;
		}
	}
}
exports.setFullScreen = setFullScreen;

// To prevent redirects, remove double slashes,
// and make sure the url ends in / for dirs.
function cleanURL(url, isDir, callerName) {
	var oURL = url;
	var s = /^([a-z]+:\/\/|\/\/|)(.*)/.exec(url);
	if (s) {
		url = s[1] + s[2].replace(/\/+/g, '/');
	}
	if (isDir && !url.match(/\/$/))
		url += '/';
	if (callerName && url != oURL)
		console.log('cleanURL:', callerName, oURL, ' -> ', url);
	return url;
}
exports.cleanURL = cleanURL;

