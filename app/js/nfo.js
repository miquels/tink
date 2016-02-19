/*
 *	NFO		Get NFO file, parse it into JSON, and return it.
 *			This module also caches the JSON.
 */

var $ = require('jquery');
var util = require('./util.js');
var jqp = require('./jqajax-promise.js');

var cache = {};
var timeout = 120;

function get(url) {
	url = util.cleanURL(url, false, 'nfo.get');
	var c = cache[url];
	var now = (new Date).getTime();

	// if we have a valid cache entry, return it.
	if (c && c.json)
		return Promise.resolve(c.json);

	// if we have an invalid cache entry, retry after timeout.
	if (c && c.time < now + timeout)
		return Promise.reject(new Error('timeout'));

	// get it.
	c = cache[url] = {
		time: now,
		url: url,
	};
	return jqp(url, {
		dataType: 'xml',
	}).then(function(resp) {
		c.json = parse(resp.data);
		if (!c.json)
			return Promise.reject(new Error('nfo parse error'));
		return c.json;
	});
}
module.exports = get;

/*
 *	This function parses an XML NFO file and turns it into
 *	a JSON object.
 *
 *	FIXME: We really should just use one of the xml2json libraries.
 */
function parse(xml) {
	var ret = {};

	if (!xml) {
		console.log('nfo.parse: empty xml doc');
		return null;
	}
	var elem = xml; // .documentElement;
	if (!elem) {
		console.log('nfo.parse: xml.documentElement not set');
		return;
	}

	var info;
	var tags = [ 'episodedetails', 'tvshow', 'movie' ];
	var tag;
	for (var t in tags) {
	    var tag = tags[t];
	    info =  elem.getElementsByTagName(tag);
	    if (info && info[0]) {
	        info = info[0];
	        break;
	    }
	}
	if (!info) {
		console.log('nfo.parse: no episode or tvshow info found in xml');
		return;
	}
	switch(tag) {
		case 'episodedetails':
		case 'tvshow':
			ret.type = 'TV Show';
			break;
		case 'movie':
			ret.type = 'Movie';
			break;
	}

	var list = [ 'title', 'runtime', 'rating', 'year', 'plot', 'genre',
				'mpaa', 'season', 'episode', 'aired', 'studio' ];
	for (var x in list) {
		var u = list[x];
		var elem = info.getElementsByTagName(u);
		//consolelog('parsenfo: ' + u + ' -> ' + (elem ? elem[0] : 'void'));
		if (elem == null || elem[0] == null || elem[0].firstChild == null)
			continue;
		// XXX FIXME HTML escapes? for security? not sure
		//consolelog('parsenfo: final:' + u + ' -> ' + elem[0].firstChild.data);
		ret[u] = elem[0].firstChild.data;
	}
	return ret;
}

