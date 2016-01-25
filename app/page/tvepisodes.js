/*
 *	tvepisodes view implementation.
 */

var Backbone = require('backbone'),
	$			= require('jquery'),
	_			= require('underscore'),
	Page		= require('../js/page.js'),
	Util		= require('../js/util.js');
	Backbone.$	= $;

var tvlist = require('./tvlist.js');

module.exports = tvlist.extend({

	viewname: 'tvepisodes',

	_initialize: function(options) {
		console.log('tvepisodes.initialize called', this.tvshow, this.season);
		this.show(options);
	},

	show: function(options) {

		console.log('tvepisodes.show', options);
		this.$el.show();
		_.extend(this, _.pick(options, [ 'tvshow', 'season', 'episode' ]));

		var focus = this.loadFocus('tvshows', this.tvshow, this.season);
		var ep = this.episode ? this.episode : focus;

		this.tvShows.getseason(this.tvshow, this.season, true)
		.done(function(show) {
			var m = {
				items: show.seasons[this.season].episodes,
				focus: ep,
			};
			this.model.set('focus', null, { silent: true });
			this.setModel(show, m, 'episode');
			// XXX bah. bah. bah.
			if (this.tvList.itemArray.length > 0) {
				this.select(ep ? ep : this.tvList.itemArray[0]);
			}
		}.bind(this))
		.fail(function(jqXHR, textStatus) {
			console.log("TVSeasons.show: failed to load",
										this.url, textStatus);
		});
	},

	hide: function() {
		this.$el.hide();
		//this.setModel({}, {}, 'episode');
	},

	// select a different episode
	select: function(ep) {
		var name = _.isObject(ep) ? ep.name : ep;
		this.tvShows.getepisode(this.tvshow, this.season, name)
		.done(function(show) {
			this.saveFocus('tvshows', this.tvshow, this.season);
			this.setModel(show, {}, 'episode');
		}.bind(this))
		.fail(function(jqXHR, textStatus) {
			console.log("tvepisodes.select: failed to load",
											name, textStatus);
		});
	},

	// play episode
	enter: function(ep) {
		console.log('tvepisodes.enter', ep.name);
		this.tvShows.getepisode(this.tvshow, this.season, ep)
		.done(function(show) {
			Page.switchPage('videoplayer', {
				url: Util.joinpath(show.path, show.season.path, ep.path, ep.video),
				backPage: 'tvepisodes',
				backOptions: {
					url: this.url,
					tvshow: show.name,
					season: show.season.name,
					episode: ep.name,
				},
				subtitles: ep.subs,
			});
		}.bind(this))
		.fail(function(jqXHR, textStatus) {
			console.log("tvepisodes.enter: failed to load",
											ep.name, textStatus);
		});
	},
});

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
