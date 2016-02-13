/*
 *	tvepisodes view implementation.
 */

var Backbone = require('backbone'),
	$			= require('jquery'),
	_			= require('underscore'),
	Page		= require('../js/page.js'),
	Util		= require('../js/util.js');

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
		_.extend(this, _.pick(options, [ 'tvshow', 'season' ]));

		this.tvShows.getshow({
			show: this.tvshow,
			season: this.season,
			episode: options.episode,
			deep: true })
		.done((show) => {
			this.model.set({ items: show.season.episodes, focus: null });
			var e = show.episode ? show.episode : this.tvList.itemArray[0];
			this.select(e);
		})
		.fail((jqXHR, textStatus) => {
			console.log("TVSeasons.show: failed to load",
										this.url, textStatus);
		});
	},

	// select a different episode
	select: function(ep) {
		var name = _.isObject(ep) ? ep.name : ep;
		this.tvShows.getshow({
			show: this.tvshow,
			season: this.season,
			episode: name})
		.done((show) => {
			console.log('XXX focus[', name, '[');
			this.setModel(show, { focus: name }, 'episode');
		})
		.fail((jqXHR, textStatus) => {
			console.log("tvepisodes.select: failed to load",
											name, textStatus);
		});
	},

	// play episode
	enter: function(ep) {
		console.log('tvepisodes.enter', ep.name);
		this.tvShows.getshow({
			show: this.tvshow,
			season: this.season,
			episode: ep })
		.done((show) => {
			var url = Util.joinpath(
				this.url, show.path,
				show.season.path, ep.path, ep.video
			);
			Page.switchPage('videoplayer', {
				url: url,
				backPage: 'tvepisodes',
				backOptions: {
					url: this.url,
					tvshow: show.name,
					season: show.season.name,
					episode: ep.name,
				},
				subtitles: ep.subs,
			});
		})
		.fail((jqXHR, textStatus) => {
			console.log("tvepisodes.enter: failed to load",
											ep.name, textStatus);
		});
	},
});

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
