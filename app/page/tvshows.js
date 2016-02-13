/*
 *	tvshows view implementation.
 */

var _		= require('underscore'),
	Page	= require('../js/page.js'),
	tvlist	= require('./tvlist.js');

module.exports = tvlist.extend({

	viewname: 'tvshows',

	_initialize: function(options) {

		console.log('tvshows.initialize called');
		this.show(options);
	},

	show: function(options) {

		console.log('tvshows.show called');
		this.$el.show();
		_.extend(this, _.pick(options, [ 'tvshow' ]));

		// load the data.
		this.tvShows.getshows({ show: this.tvshow })
		.done((shows) => {
			this.model.set({ items: shows, focus: null });
			var s = shows.show ? shows.show : this.tvList.itemArray[0];
			this.select(s);
		})
		.fail((jqXHR, textStatus) => {
			console.log("tvshows.initialize: failed to load",
											this.url, textStatus);
		});
	},

	// select a different show
	select: function(show) {
		var name = _.isObject(show) ? show.name : show;
		console.log('tvshows.select', name);
		this.tvShows.getshow({ show: name })
		.fail((jqXHR, textStatus) => {
			console.log("tvshows.select: failed to load", name, textStatus);
		})
		.done((show) => {
			this.setModel(show, { focus: name }, 'show');
		});
	},

	// switch to the seasons view.
	enter: function(show) {
		console.log('tvshows.enter', show.name);
		Page.switchPage('tvseasons', {
			url:		this.url,
			tvshow:		show.name,
		});
	},

});

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
