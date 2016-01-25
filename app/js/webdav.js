/*
 * webdav.js	Webdav functionality. Basically, PROPFIND.
 *
 * Author:		Miquel van Smoorenburg
 *
 */

var $		= require('jquery'),
	Util	= require('./util.js');

function Webdav(opts) {
	for (var i in opts) {
		this[i] = opts[i];
	}
};
module.exports = Webdav;

// helper function to map from webdav properties to
// something more generic: name, path, time.
function mapdir(props, cntr) {

  var e = {};
  if (props.getlastmodified) {
		var d = new Date(props.getlastmodified);
		if (d && !(d !== d))
			e.time = d;
	}

	if (props.isSelf) {
		if (cntr)
			cntr.time = e.time;
		return null;
	}

	// note that the 'path' is set to the *uri encoded* name,
	// and 'name' to an uri decoded name.
  if (props.href.match(/\/$/)) {
      e.path = props.href.replace(/^.*\/(.*\/)$/, "$1");
  } else {
      e.path = props.href.replace(/^.*\/(.*)$/, "$1");
  }
	e.name = props.name.replace(/\/+$/, "");
  e.sortName = e.name.toLowerCase().replace(/^the +/, '');

  return e;
}

// This function parses the output from propfind,
// and returns an array of objects.
function parsemulti(xml, xhr, mapper, aux) {

	var ret = [];
	// Chrome accepts just 'response' here,
	// Firefox wants D:response
	var ns = '';
	var resp = xml.getElementsByTagName(ns +'response');
	if (resp.length == 0) {
		ns = 'D:';
		resp = xml.getElementsByTagName(ns +'response');
	}

	var first = true;
	for (var i = 0; i < resp.length; i++) {

		var r = resp[i];
		var obj = { resourcetype: '' };

		// must have a href.
		var href = r.getElementsByTagName(ns + 'href');
		if (!href)
			continue;

		// First entry is 'self'
		if (first && ret.length == 0) {
			obj.isSelf = true;
			first = false;
		}

		// Some servers end a directory (collection) in a '/' and some
		// don't. Some servers include http://servername, others don't.
		// First normalization: remove servername, remove trailing /.
		var hr = href[0].textContent.replace(/\/$/, '').
								   replace(/^https?:\/\/[^\/]+/, '');
		if (hr == '') hr = '/';
		var nm = hr.replace(/^.*\/+/, '');
		obj['href'] = hr;
		obj['name'] = decodeURIComponent(nm);

		// and a list of properties.
		var props = r.getElementsByTagName(ns + 'propstat')
		//console.log('xml: propstat: ' + props.length);

		for (var i2 = 0; i2 < props.length; i2++) {

			var p = props[i2].getElementsByTagName(ns + 'prop');
			//console.log('xml: numprops: ' + p.length);

			for (var i3 = 0; i3 < p.length; i3++) {

				// use .childNodes, not .children - not all browsers
				// support .children.
				var c = p[i3].childNodes;
				//console.log('xml: childnodes: ' + c.length);
				for (var i4 = 0; i4 < c.length; i4++) {

					var e = c[i4];
					if (e.nodeType != 1) {
						continue;
					}
					var name = e.tagName.replace(/^[0-9a-zA-Z_-]+:/, '');
					//console.log('xml: name ' + name + ' tagname ' + e.tagName);

					// a <resourcetype> goes down one more level.
					if (name == 'resourcetype') {
						var coll = e.getElementsByTagName(ns + 'collection');
						if (coll && coll.length > 0) {
						  obj[name] = 'collection';
						}
					  } else {
						  obj[name] = e.textContent;
					 }
				}
			}
		}

		// Now always add a / if it's a collection.
		if (obj['resourcetype'] == 'collection' && !obj['href'].match(/\/$/)) {
			obj['href'] += '/';
			obj['name'] += '/';
		}

		if (mapper) {
			var o = mapper(obj, aux);
			if (o)
				ret.push(o);
		} else {
			ret.push(obj);
		}
	}

	// unsorted!
	return ret;
}

var props = [
		//'getcontentlength',
		'getlastmodified',
		'resourcetype',
];
var bodystart =
		'<?xml version="1.0"?>\n' +
		'<d:propfind xmlns:d="DAV:">\n' +
		'<d:prop>\n';

Webdav.prototype = {
	constructor: Webdav,

	// Propfind. Returns a promise (in the form of a jqXHR).
	// Resolves to array of file/dir objects.
	propfind: function(url, depth, mapper, aux) {

		var body = bodystart;
		for (var p in props) {
			body += '<d:' + props[p] + '/>\n';
		}
		body += '</d:prop>\n';
		body += '</d:propfind>\n';

		if (depth == null)
			depth = "1";

		url = Util.cleanURL(url, true, 'Webdav.propfind');

		return $.ajax(url, {
			type: 'PROPFIND',
			dataType: 'xml',
			headers: {
				Depth: depth,
			},
		}).then(function(data, textStatus, xhr) {
			return parsemulti(data, xhr, mapper, aux);
		});
	},

	// Get a full directory listing.
	listdir: function(url) {
		var cntr = {};
		var dfd = this.propfind(url, 1, mapdir, cntr)
		  .then(function(data) {
			cntr.items = data;
			return cntr;
		});
		return dfd;
	},
};

