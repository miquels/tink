/*
 *	NFOData	Get NFO file, parse it into JSON, and return it.
 *			This module also caches the JSON.
 */

import $	from 'jquery';
import util	from './util.js';
import jqp	from './jqajax-promise.js';

var cache = {};
var retry = 120;

export function get(url) {
	if (url == null)
		return Promise.resolve({});

	url = util.cleanURL(url, false, 'nfo.get');
	var c = cache[url];
	var now = (new Date).getTime();

	// if we have a valid cache entry, return it.
	if (c && c.json)
		return Promise.resolve(c.json);

	// promise not yet resolved?
	if (c && c.jqp)
		return c.jqp;

	// invalid entry, not yet timed out?
	if (c && c.time > now + retry)
		return Promise.resolve({});

	// get it.
	c = cache[url] = {
		time: now,
		url: url,
	};
	c.jqp = jqp(url, {
		dataType: 'xml',
	}).then(function(resp) {
		c.jqp = null;
		c.json = parse(resp.data);
		if (!c.json) {
			console.log('url:', url, 'nfo parse error');
			return Promise.resolve({});
		}
		return c.json;
	}).catch((err) => {
		console.log(err);
		return {};
	});
	return c.jqp;
}

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

