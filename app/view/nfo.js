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

import Backbone from 'backbone';
import _		from 'underscore';

export default class NFO extends Backbone.View {

	constructor(options) {
		console.log('Nfo.constructor called');
		super(options);
		this.listenTo(this.model, 'change', this.change);
		this.listenTo(this.model, 'reset', this.render);
		this.render();
	};

	render(options) {
		//console.log("Nfo.render");
		var self = this;
		this.$el.find("[data-key]").each(function() {
			self.renderOne($(this));
		});
		if (this.$el.data('key'))
			this.renderOne(this.$el);
	};

	renderOne(el) {
		//console.log('Nfo.renderOne checking', nfo, key);
		var json, key;
		var keys = el.data('key').split(/[ \t]+/);
		for (var i in keys) {
			key = keys[i];
			var nfo = key.replace(/[_0-9a-z]+$/, 'nfo');
			key = key.replace(/^.*:/, '');
			json = this.model.get(nfo + 'JSON');
			if (json && json[key])
				break;
		}
		if (json == null || json[key] == null) {
			el.hide();
			return;
		}
		if ( el.data('hashtml') == null)
			el.data('hashtml', el.html() == '' ? 0 : 1)
		if (el.data('hashtml') == 0)
			el.html(_.escape(json[key]));
		el.show();
	};

	change(model) {
		if (_.find(_.keys(model.changed, function(key) {
			return key.match(/nfoJSON/);
		})))
			this.render();
	};
};

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
