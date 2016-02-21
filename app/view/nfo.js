/*
 *	Nfo implementation.
 *
 *	The class for this view is "app-nfo".
 *
 *	Children elements are filled with data based on the data
 *	from the NFO file
 *
 *	data-key="year"		If the element has internal HTML: just
 *						show it if the key is present, otherwise
 *						hide the element.
 *						If the element has no internal HTML:
 *						set the content to the data and show the element.
 *
 *	example:			<div data-key="year">Year: <span data-key="year"/></div>
 *
 *						Here the <div> remains hidden unless
 *						there is a 'year' key in the nfo file.
 *
 *  TODO: merge this with nfotemplateview somehow.
 */

import Backbone		from 'backbone';
import $			from 'jquery';
import _			from 'underscore';
import * as NfoData	from '../js/nfodata.js';

export default class NFO extends Backbone.View {

	constructor(options) {
		super(options);
		console.log('Nfo.constructor called');
		this.nfoURL = {};
		this.nfoJSON = {};
		this.$elems = this.$el.find("[data-key]");
		if (this.$el.data('key'))
			this.$elems = this.$elems.add(this.$el);
		this.$elems.each((idx, el) => {
			var nfos = $(el).data('key').split(/[ \t]+/);
			for (var i in nfos) {
				// show:ATTR -> show:nfo, ATTR -> nfo.
				var n = nfos[i].replace(/[^:]*$/, "nfo");
				this.nfoURL[n] = null;
				this.nfoJSON[n] = {};
			}
		});
		this.listenTo(this.model, 'change', this.change);
		//this.listenTo(this.model, 'reset', this.render);
		this.render();
	};

	render(options) {
		//console.log("Nfo.render");
		this.$elems.each((idx, el) => {
			this.renderOne($(el));
		});
	};

	renderOne($el) {
		//console.log('Nfo.renderOne checking', nfo, key);
		var data;
		var keys = $el.data('key').split(/[ \t]+/);
		for (var i in keys) {
			var n = keys[i].replace(/[^:]*$/, "nfo");
			var a = keys[i].replace(/^.*:/, "");
			data = this.nfoJSON[n][a];
			if (data)
				break;
		}
		if (data == null) {
			$el.hide();
			return;
		}
		if ( $el.data('hashtml') == null)
			$el.data('hashtml', $el.html() == '' ? 0 : 1)
		if ($el.data('hashtml') == 0)
			$el.html(_.escape(data));
		$el.show();
	};

	change(model) {
		var plist = [];
		for (var nfo in model.changed) {
			var url = this.nfoURL[nfo];
			if (url !== undefined && model.get(nfo) != url) {
				var n = nfo;
				var u = model.get(nfo);
				var p = NfoData.get(u)
				.then((data) => {
					var urlnow = model.get(n);
					if (urlnow == u) {
						this.nfoURL[n] = u;
						this.nfoJSON[n] = data;
					}
				});
				plist.push(p);
			}
		}
		if (plist.length > 0)
			Promise.all(plist).then(this.render.bind(this));
	};
};

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
