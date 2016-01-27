/*
 *	Main menu.
 *
 *	XXX FIXME This is a quick hack implementation.
 *
 *	We should really make this a proper view - the menu options
 *	should be a collection, the menu items a model in the collection.
 *
 *	Maybe even implement a seperate 'choose by image' listbox,
 *	with horizontal and vertical layout options, that we can reuse.
 *
 *	Oh. And SASS.
 */

var Backbone		= require('backbone'),
	Page			= require('../js/page.js'),
	model			= require('./mainmenu-model.js'),
	appconfig		= require('../js/appconfig.js'),
	_				= require('underscore'),
	$				= require('jquery'),
	Key				= require('../js/keys.js');

module.exports = Backbone.View.extend({

	viewname: 'mainmenu',

	events: {
			"keydown":		"_keyDown",
			"keyup":		"_keyUp",
	},

	initialize: function(options) {
		console.log('Main.initialize', options);

		this.model = new model( { } );
		this.lastClickTime = 0;
		this.lastClickTarget = null;

		// Meh.
		this.model.set('bgimg',
				this.$el.find('[id=main-movies]').find('img').attr('src'));

		// find config.
		var config = appconfig.get();
		for (var i in config.mainmenu) {
			var m = config.mainmenu[i];

			switch(m.type) {
				case 'tvshows':
					this.tvshowsurl = m.url;
					break;
				case 'movies':
					this.moviesurl = m.url;
					break;
			}
		}

		// initialize the subviews.
		Page.createViews(this, { model: this.model });

		this.$el.focus();
		this.$el.find('#main-movies img').focus();

		var self = this;
		this.$el.find('.main-button').each(function() {
			$(this).click(function(ev) {
				var el =$(this);
				self._click.call(self, ev, $(this));
			});
		});
	},

	show: function(options) {
		console.log('Main.show', options);
		this.$el.show();
		this.$el.find('#main-movies img').focus();

		// XXX hack
		var i = this.model.get('bgimg');
		this.model.set('bgimg', null,  { silent: true });
		this.model.set('bgimg', i);
	},

	hide: function() {
		console.log('Main.hide');
		this.$el.hide();
	},

	_keyUp: function(ev) {
		//console.log('UP key: ' + ev.which + ' mapped to ' + Key.map(ev));
	},

	_keyDown: function(ev) {
		console.log('XXX key: ' + ev.which + ' mapped to ' + Key.map(ev));
		switch (Key.map(ev)) {
			case Key.Enter:
				console.log('XXX call _click');
				this._click(ev, $(ev.target));
				break;
			case Key.Left:
			case Key.Right:
				var n = this.$el.find(':focus').attr('id') || '';
				var img;
				if (n.match(/movies/)) {
					console.log('focus tvshows');
					img = this.$el.find('#main-tvshows-img');
				} else {
					console.log('focus movies');
					img = this.$el.find('#main-movies-img');
				}
				if (img && img.length) {
					this.model.set('bgimg', img.attr('src'));
					img.focus();
				}
		}
	},

	_click: function(ev, el) {

		var img = el.find("img");
		if (img.length) {
			this.model.set('bgimg', img.attr('src'));
		}
		console.log('XXX _click ' + el.attr('id'));
		switch (el.attr('id')) {
			case 'main-movies':
			case 'main-movies-img':
				if (this.moviesurl) {
					Page.switchPage('movies', {
						url:	this.moviesurl,
					});
				}
				break;
			case 'main-tvshows':
			case 'main-tvshows-img':
				console.log('main-tvshows', this.tvshowsurl);
				if (this.tvshowsurl) {
					Page.switchPage('tvshows', {
						url:	this.tvshowsurl,
					});
				}
				break;
		}
	},

	select: function(options) {
	},

});

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
