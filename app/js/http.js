/*
 * http.js		Like webdav, but parses directory listings instead.
 *
 * TODO:		parse date output.
 *
 * Author:		Miquel van Smoorenburg
 *
 */

var $	= require('jquery'),
	jqp	= require('./jqajax-promise.js');

function Http(opts) {
	for (var i in opts) {
		this[i] = opts[i];
	}
};
module.exports = Http;

// This function parses the html directory index
function parseindex(html, xhr) {

	var ret = { time: null, items: [] };

	var m = xhr.getResponseHeader('Last-Modified');
	if (m) {
		var d = Date.parse(m);
		if (!isNaN(d))
			ret.time = d;
	}

	var parsed = $('<div>').html($.parseHTML(html));
	parsed.find('a').each(function() {
		var a = $(this);
		var path = a.attr('href');
		if (path.match(/(^\.|^\+|\/.*\/)/))
			return;
		var name = a.text().replace(/^\s*(.*?)\s*/, "$1");
		ret.items.push({
			path: path,
			name: name,
			sortName: name.toLowerCase().replace(/^the +/, ''),
		});
	});

	return ret;
}

Http.prototype = {
	constructor: Http,

	// Listdir. Returns a promise (in the form of a jqXHR).
	listdir: function(url) {

		// prevent redirects.
		if (!url.match(/\/$/))
			url += '/';

		return jqp(url, {
			type: 'GET',
			dataType: 'html',
		}).then(function(resp) {
			return parseindex(resp.data, resp.jqXHR);
		});
	},
};

