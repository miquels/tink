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

		var focus = this.loadFocus('tvshows', this.tvshow);
		var sh = this.tvshow ? this.tvshow : focus;

		// load the data.
		this.tvShows.getshows()
		.done(function(shows) {
			var m = {
				items: shows,
				focus: sh,
			};
			this.model.set('focus', null, { silent: true });
			this.setModel({ name: '' }, m, 'show');
			// XXX bah. bah. bah.
			if (this.tvList.itemArray.length > 0) {
				this.select(sh ? sh : this.tvList.itemArray[0]);
			}
		}.bind(this))
		.fail(function(jqXHR, textStatus) {
			console.log("tvshows.initialize: failed to load",
											this.url, textStatus);
		});
	},

	hide: function() {
		this.$el.hide();
		//this.setModel({}, {}, 'show');
	},

	// select a different show
	select: function(show) {
		var name = _.isObject(show) ? show.name : show;
		console.log('tvshows.select', name);
		this.tvShows.getshow(name, false)
		.fail(function(jqXHR, textStatus) {
			console.log("tvshows.select: failed to load",
											name, textStatus);
		})
		.done(function(show) {
			this.saveFocus('tvshows');
			this.setModel(show, {}, 'show');
		}.bind(this));
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
