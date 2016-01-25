/*
 *	movies view implementation.
 */

var Backbone = require('backbone'),
	$			= require('jquery'),
	_			= require('underscore'),
	Page		= require('../js/page.js'),
	Util		= require('../js/util.js');
	Backbone.$	= $;

var tvlist = require('./tvlist.js');

module.exports = tvlist.extend({

	viewname: 'movies',

	_initialize: function(options) {

		console.log('movies.initialize called');
		this.show(options);
	},

	show: function(options) {

		console.log('movies.initialize called');
		this.$el.show();
		_.extend(this, _.pick(options, [ 'movies' ]));

		var focus = this.loadFocus('movies', this.movie);
		var sh = this.movie ? this.movie : focus;

		// load the data.
		this.movies.getmovies()
		.done(function(movies) {
			var m = {
				items: movies,
				focus: sh,
			};
			this.model.set('focus', null, { silent: true });
			this.setModel({ name: '' }, m, 'movie');
			// XXX bah. bah. bah.
			if (this.tvList.itemArray.length > 0) {
				this.select(sh ? sh : this.tvList.itemArray[0]);
			}
		}.bind(this))
		.fail(function(jqXHR, textStatus) {
			console.log("movies.show: failed to load",
											this.url, textStatus);
		});
	},

	hide: function() {
		this.$el.hide();
		//this.setModel({}, {}, 'tvshows');
	},

	// select a different movie
	select: function(movie) {
		var name = _.isObject(movie) ? movie.name : movie;
		//console.log('movies.select', name);
		this.movies.getmovie(name)
		.fail(function(jqXHR, textStatus) {
			console.log("movies.select: failed to load",
											name, textStatus);
		})
		.done(function(movie) {
			this.saveFocus('movies');
			this.setModel(movie, {}, 'movie');
		}.bind(this));
	},

	// play movie
	enter: function(movie) {
		var name = _.isObject(movie) ? movie.name : movie;
		console.log('movies.enter', name, movie);
		this.movies.getmovie(name)
		.done(function(movie) {
			Page.switchPage('videoplayer', {
				url: Util.joinpath(movie.path, movie.video),
				backPage: 'movies',
				backOptions: {
					url: this.url,
					movie: movie.name,
				},
				subtitles: movie.subs,
			});
		}.bind(this))
		.fail(function(jqXHR, textStatus) {
			console.log("movies.enter: failed to load",
											name, textStatus);
		});
	},
});

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
