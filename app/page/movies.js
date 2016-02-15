/*
 *	movies view implementation.
 */

var Backbone = require('backbone'),
	$			= require('jquery'),
	_			= require('underscore'),
	Page		= require('../js/page.js'),
	Util		= require('../js/util.js');

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

		// load the data.
		this.movies.getmovies({ movie: options.movie })
		.done((movies) => {
			this.model.set({ items: movies, focus: null });
			var mv = movies.movie ? movies.movie : this.tvList.itemArray[0];
			this.select(mv);
		})
		.fail((jqXHR, textStatus) => {
			console.log("movies.show: failed to load",
											this.url, textStatus);
		});
	},

	// select a different movie
	select: function(movie) {
		var name = _.isObject(movie) ? movie.name : movie;
		//console.log('movies.select', name);
		this.movies.getmovie(name)
		.done((movie) => {
			this.setModel(movie, { focus: name }, 'movie');
		})
		.fail((jqXHR, textStatus) => {
			if (jqXHR)
				console.log("movies.select: failed to load",
											name, textStatus);
		})
	},

	// play movie
	enter: function(movie) {
		var name = _.isObject(movie) ? movie.name : movie;
		console.log('movies.enter', name, movie);
		this.movies.getmovie(name)
		.done((movie) => {
			Page.switchPage('videoplayer', {
				url: Util.joinpath(this.movies.url, movie.path, movie.video),
				backPage: 'movies',
				backOptions: {
					url: this.url,
					movie: movie.name,
				},
				subtitles: movie.subs,
			});
		})
		.fail((jqXHR, textStatus) => {
			console.log("movies.enter: failed to load",
											name, textStatus);
		});
	},
});

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
