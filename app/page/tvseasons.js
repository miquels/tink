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
		_.extend(this, _.pick(options, [ 'tvshow' ]));

		// load the data
		this.tvShows.getshow({ show: this.tvshow, season: options.season })
		.then((show) => {
			this.model.set({ items: show.seasons, focus: null });
			var s = show.season ? show.season : this.tvList.itemArray[0];
			this.select(s.name);
		})
		.catch((err) => {
			if (err)
				console.log("tvseasons.show: failed to load",
										this.url, err.textStatus);
		});
	},

	// select a different season
	select: function(season) {
		var name = _.isObject(season) ? season.name : season;
		console.log('tvseasons.select', name);

		this.tvShows.getshow({ show: this.tvshow, season: name })
		.then((show) => {
			this.setModel(show, { focus: name }, 'season');
		})
		.catch((err) => {
			if (err)
				console.log("tvseasons.select: failed to load",
											name, err.textStatus);
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
