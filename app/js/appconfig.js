/*
 *	Load and store config.
 */

var $ = require('jquery');

var config = {};

function load(name, ok, fail) {
	var cfgurl = location.pathname.replace(/[^\/]*$/, name);
	console.log('loading config from', cfgurl);
	$.getJSON(cfgurl).then(function(data) {
		config = data;
		ok(data);
	}, fail);
}
exports.load = load;

function get() {
	return config;
}
exports.get = get;

