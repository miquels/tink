/*
 *	tvlist view base implementation.
 *
 *	This is the Controller for one page. It has to have at
 *	least one view/list.js as the main UI. All other components
 *	are optional.
 *
 *	Options that can be passed in:
 *
 *	url:		base tvshow url
 *	tvshow:		tvshow name
 *	season:		season name
 *	episode:	episode name
 *
 * This is a base implementation, not to be used directly.
 * TVShows, TVSeasons, TVEpisodes extend this view.
 */

var	Backbone	= require('backbone'),
	_			= require('underscore'),
	$			= require('jquery'),
	KodiFS		= require('../js/kodifs.js'),
	tvlistmodel = require('./tvlistmodel.js'),
	listview	= require('../view/list.js'),
	Page		= require('../js/page.js'),
	Util		= require('../js/util.js');

var tvshowsFS;
var moviesFS;

module.exports = Backbone.View.extend({

	initialize: function(options) {

		console.log('tvlist.initialize called');

		_.extend(this, _.pick(options,
			[ 'url', 'proto', 'movie', 'tvshow', 'season', 'episode' ]));

		// the tvlist model (main UI)
		this.model = new tvlistmodel();

		// instantiate the tvlist view
		this.url = options.url;
		this.tvList = new listview({
			model:		this.model,
			el:			this.$('.app-list'),
			scrollbar:	true,
		});

		// and listen for click / select / back
		this.listenTo(this.tvList, 'select', this.select);
		this.listenTo(this.tvList, 'enter', this.enter);
		this.listenTo(this.tvList, 'back', this.back);

		// instantiate all other views.
		Page.createViews(this, { model: this.model });

		// XXX FIXME movies and tvshows are too tangled up right now.
		if (this.viewname == 'movies') {
			if (moviesFS == null)
				moviesFS = new KodiFS({ url: this.url, proto: this.proto });
			this.movies = moviesFS;
		} else {
			if (tvshowsFS == null)
				tvshowsFS = new KodiFS({ url: this.url, proto: this.proto });
			this.tvShows = tvshowsFS;
		}

		this._initialize(options);
	},

	// show the page.
	show: function(options) {
		this.$el.show();
	},

	// hide the page.
	hide: function(data) {
		this.$el.hide();
	},

	// update the model.
	setModel: function(show, options, curctx) {

		//console.log('tvlist.setModel', show.name, curctx, show);
		var urlitems = [ 'poster', 'banner', 'folder',
							'fanart', 'thumb', 'nfo' ];

		var model = { };

		// set	show:poster		URL to show poster
		//		season:poster	URL to season poster
		// etc.
		var url = this.url;
		var ctxlist = [ 'show', 'season', 'episode' ];
		if (curctx == 'movie')
			ctxlist = [ 'movie' ];

		for (var c in ctxlist) {

			var ctx = ctxlist[c];
			var info = (ctx == 'show' || ctx == 'movie') ? show : show[ctx];
			if (info == null)
				continue;

			model[ctx + ':name']  = info.name,
			model[ctx + ':nfo']   = info.nfo,
			model[ctx + ':time']  = info.time,

			url = Util.joinpath(url, info.path);
			for (var o in _.pick(info, urlitems)) {
				if (info[o] != null) {
					var k = ctx + ':' + o;
					var v = Util.joinpath(url, info[o]);
					model[k] = v;
				}
			}
		}

		// shortcut for current context (show/season/episode)
		for(var k in model) {
			var wv = k.split(':');
			if (wv[0] == curctx)
				model[wv[1]] = model[k];
		}

		for (var i in this.model.toJSON()) {
				if (i != 'items' && i != 'focus' && model[i] === undefined)
					model[i] = null;
		}
		this.model.set(_.extend(model, options));
	},

	back: function() {
		switch(this.viewname) {
		case 'tvshows':
		case 'movies':
			Page.switchPage('mainmenu');
			break;
		case 'tvseasons':
			Page.switchPage('tvshows', {
				url: this.url,
				tvshow: this.tvshow,
			});
			break;
		case 'tvepisodes':
			Page.switchPage('tvseasons', {
				url: this.url,
				tvshow: this.tvshow,
				season: this.season,
			});
			break;
		case 'tvepisode':
			Page.switchPage('tvepisodes', {
				url: this.url,
				tvshow: this.tvshow,
				season: this.season,
				episode: this.episode,
			});
			break;
		}
	},

	remove: function() {
		Page.destroyViews(this);
		Backbone.View.remove.apply(this);
	},

});

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
