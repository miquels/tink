/*
 *	Load and store config.
 */

import jqp	from './jqajax-promise.js';

var config = {};

export function load(name) {
	var cfgurl = location.pathname.replace(/[^\/]*$/, name);
	console.log('loading config from ' + cfgurl);
	return jqp(cfgurl, {
		dataType: "json",
	})
	.then((resp) => {
		config = resp.data;
		return resp.data;
	});
}

export function get() {
	return config;
}

