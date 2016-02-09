/*
 *	tvseasons view implementation.
 */

var _		= require('underscore'),
	Page	= require('../js/page.js'),
	tvlist	= require('./tvlist.js');

module.exports = tvlist.extend({

	viewname: 'tvseasons',

	_initialize: function(options) {
		console.log('tvseasons.initialize called', this.tvshow);
		this.show(options);
	},

	show: function(options) {

		console.log('tvseasons.show', options);
		this.$el.show();
		_.extend(this, _.pick(options, [ 'tvshow', 'season' ]));

		var focus = this.loadFocus('tvshows', this.tvshow);
		var se = this.season ? this.season : focus;

		this.tvShows.getshow( { show: this.tvshow })
		.done(function(show) {
			var m = {
				items: show.seasons,
				focus: se,
			};
			this.model.set('focus', null, { silent: true });
			this.setModel(show, m, 'season');
			// XXX bah. bah. bah.
			if (this.tvList.itemArray.length > 0) {
				this.select(se ? se : this.tvList.itemArray[0]);
			}
		}.bind(this))
		.fail(function(jqXHR, textStatus) {
			console.log("tvseasons.show: failed to load",
										this.url, textStatus);
		});
	},

	hide: function() {
		this.$el.hide();
		//this.setModel({}, {}, 'season');
	},

	// select a different season
	select: function(season) {
		var name = _.isObject(season) ? season.name : season;
		console.log('tvseasons.select', name);

		this.tvShows.getshow({ show: this.tvshow, season: name })
		.done(function(show) {
			this.saveFocus('tvshows', this.tvshow);
			this.setModel(show, {}, 'season');
		}.bind(this))
		.fail(function(jqXHR, textStatus) {
			console.log("tvseasons.select: failed to load",
											name, textStatus);
		});
	},

	// switch to the seasons view.
	enter: function(season) {
		console.log('tvseasons.enter', season.name);
		Page.switchPage('tvepisodes', {
			url:		this.url,
			tvshow:		this.tvshow,
			season:		season.name,
		});
	},

});

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
