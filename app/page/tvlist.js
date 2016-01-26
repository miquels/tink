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
	Util		= require('../js/util.js'),
	NFO			= require('../js/nfo.js');

var storeFocus = {};

var tvshowsFS;
var moviesFS;

module.exports = Backbone.View.extend({

	initialize: function(options) {

		console.log('tvlist.initialize called');

		_.extend(this, _.pick(options,
			[ 'url', 'movie', 'tvshow', 'season', 'episode' ]));

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
				moviesFS = new KodiFS({ url: this.url });
			this.movies = moviesFS;
		} else {
			if (tvshowsFS == null)
				tvshowsFS = new KodiFS({ url: this.url });
			this.tvShows = tvshowsFS;
		}

		this._initialize(options);
	},

	_fname: function(options) {
		return '/' + _.without(options, null, undefined).join('/');
	},

	loadFocus: function() {
		var a = Array.prototype.slice.call(arguments);
		var f = storeFocus[this._fname(a)];
		//console.log('tvList.loadFocus', a, this._fname(a), f);
		return f;
	},

	saveFocus: function() {
		var a = Array.prototype.slice.call(arguments);
		var f = this.model.get('focus');
		//console.log('tvList.saveFocus', a, this._fname(a), f);
		storeFocus[this._fname(a)] = f;
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

		var model = { filling: true };

		// set	show:poster		URL to show poster
		//		season:poster	URL to season poster
		// etc.
		var url = '';
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

					// set nfoJSON async.
					if (o == 'nfo') {
						var k2 = k, v2 = v;
						NFO(v).then(function(data) {
							if (model.filling) {
								model[k+'JSON'] = data;
							} else {
								var m = {};
								if (this.model.get(k2) == v)
									m[k2+'JSON'] = data;
								if (this.model.get('nfo') == v2)
									m.nfoJSON = data;
								this.model.set(m);
							}
						}.bind(this));
					}
				}
			}
		}
		model.filling = null;
		delete model.filling;

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
		//console.log('setModel',_.extend(model, options));
		this.model.set(_.extend(model, options));
	},

	back: function() {
		switch(this.viewName) {
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
