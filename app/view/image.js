/*
 *	Imageview implementation. class="app-image".
 *
 *	Set the img attribute of an element, or the 'background-image' css property.
 *
 *	Usage:	data-img="what" data-type="bg" data-dst="element"
 *
 *			data-img		What image to pick from the context
 *							(poster, folder, fanart, thumb)
 *			data-default	Default image (otherwise, "empty")
 *			data-type		fg: set img attributes (default)
 *							bg: set css background property
 *			data-target		target a different element.
 *
 */

import Backbone	from 'backbone';
import _		from  'underscore';
import $		from 'jquery';

// 1x1 transparent pixel, inline.
var pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAA' +
			'AC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';

export default class Image extends Backbone.View {

	constructor(options) {
		super(options);
		console.log('Image constructor called');

		_.extend(this, _.pick(options, [ 'url' ]));

		this.uriparser = document.createElement('a');

		var item = this.$el.data('img');
		if (item == null)
			return;
		this.item = item.split(/[ \t]+/);
		this.type = this.$el.data('type');

		this.dflimg = this.$el.data('default');
		if (this.dflimg === null)
			this.dflimg = this._getimg();
		if (this.dflimg === '' || this.dflimg === null)
			this.dflimg = pixel;

		this.target = this.$el;
		var target = this.$el.data('target');
		if (target) {
			this.target = $(target);
			if (target.length == 0)
				this.target = $("<div>");
		}

		this.listenTo(this.model, _.map(this.item, function(i) {
				return('change:' + i);
		}).join(' '), this.render);
		this.render();
	};

	_canon(path) {
		this.uriparser.href = path;
		return this.uriparser.href;
	};

	_cssbgurl(url) {
		if (url == null || !url.match(/^url/))
			return null;
		return url.replace(/^url\(("|')?(.*?)("|')?\)$/, "$2");
	};

	_getimg() {
		var r;
		if (this.type == 'bg')
			r = this._cssbgurl(this.target.css('background-image'));
		else
			r = this.target.find("img").attr('src');
		return r && r != '' && r != '#' ? r : null;
	};

	render() {
		var url;
		for (var i in this.item) {
			url = this.model.get(this.item[i]);
			if (url) {
				url = this._canon(url);
				break;
			}
		}
		//console.log('Image.render', this.target, this.item, url);
		if (url == null)
			url = pixel;
		if (url == this._getimg())
			return;
		if (this.type == 'bg') {
			var cssurl = url;
			if (url.match(/[()]/))
				cssurl = "'" + url + "'";
			this.target.css('background-image', "url(" + cssurl + ")");
			if (this._getimg() != url) {
				this.target.css('background-image', 'none');
			}
			return;
		}
		this.target.find("img").attr('src', url);
	};
};

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
