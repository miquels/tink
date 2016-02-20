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
		.then((movies) => {
			this.model.set({ items: movies });
			var mv = movies.movie ? movies.movie : this.tvList.itemArray[0];
			this.model.set('focus', mv.name);
			this.select(mv);
		})
		.catch((err) => {
			console.log("movies.show: failed to load",
										this.url, err.textStatus);
		});
	},

	hide: function() {
		this.$el.hide();
		this.model.set('focus', null);
	},

	// select a different movie
	select: function(movie) {
		var name = _.isObject(movie) ? movie.name : movie;
		//console.log('movies.select', name);
		this.movies.getmovie(name)
		.then((movie) => {
			this.setModel(movie, {}, 'movie');
		})
		.catch((err) => {
			if (err)
				console.log("movies.select: failed to load",
											name, err.textStatus);
		})
	},

	// play movie
	enter: function(movie) {
		var name = _.isObject(movie) ? movie.name : movie;
		console.log('movies.enter', name, movie);
		this.movies.getmovie(name)
		.then((movie) => {
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
		.catch((err) => {
			console.log("movies.enter: failed to load",
											name, err.textStatus);
		});
	},
});

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
