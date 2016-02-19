/*
 *	Load and store config.
 */

var $	= require('jquery'),
	jqp	= require('./jqajax-promise.js');

var config = {};

function load(name, ok, fail) {
	var cfgurl = location.pathname.replace(/[^\/]*$/, name);
	console.log('loading config from ' + cfgurl);
	jqp(cfgurl, {
		dataType: "json",
	}).then((resp) => {
		config = resp.data;
		ok(resp.data);
	}, fail);
}
exports.load = load;

function get() {
	return config;
}
exports.get = get;

