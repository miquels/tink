/*
 *	NfoTemplate implementation.
 *
 *	The class for this view is "app-nfo-template".
 *
 * FIXME:	currently slightly broken. doesn't know about
 *			data-key="item show:item" syntax.
 */

var Backbone	= require('backbone'),
	_			= require('underscore'),
	$			= require('jquery');
	Backbone.$	= $;

module.exports= Backbone.View.extend({

	initialize: function(options) {

		console.log('NfoTemplate initialize called');
		this.listenTo(this.model, 'change', this.change);
		this.listenTo(this.model, 'reset', this.render);

		// find template and compile it.
		var id = this.$el.data('id');
		if (id) {
			var data = $('#' + id).html();
			this.template =  _.template(data);
		}
		this.render();
	},

	render: function(options) {
		//console.log("NfoTemplate.render");
		var nfo = this.model.get('nfoJSON');
		if (nfo == null) {
			this.$el.html();
			return;
		}
		this.$el.html(this.template({ nfo: nfo }));
	},

	change: function(model) {
		if (_.find(_.keys(model.changed, function(key) {
				return key.match(/nfoJSON/);
		})))
			this.render();
	},
});

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
