/*
 *	HTML5 video player
 */

var Backbone = require('backbone'),
	$			= require('jquery'),
	_			= require('underscore'),
	Page		= require('../js/page.js'),
	Util		= require('../js/util.js');

var Video = require('../video/video.js');

module.exports = Backbone.View.extend({

	viewname: 'videoplayer',

	initialize: function(options) {
		console.log('videoplayer.initialize', options);
		this.vd = new Video({
			el:		this.$el,
			stop:	this.goBack.bind(this),
		});
		this.show(options);
	},

	goBack: function() {
		Page.switchPage(this.backPage, this.backOptions);
	},

	show: function(options) {
		console.log('videoplayer.show');
		_.extend(this, _.pick(options, [ 'backPage', 'backOptions' ]));
		this.$el.show();
		var subs = null;
		var url = Util.cleanURL(options.url, false, 'page/video');
		if (options.subtitles) {
			subs = {};
			var d = url.replace(/[^\/]+$/, '');
			for (var i in options.subtitles) {
				var lang = options.subtitles[i].lang || 'on';
				subs[lang] = d + options.subtitles[i].path;
			}
		}
		this.vd.initialize({
			url: url,
			subtitles: subs,
			noFullScreen: Util.isFullScreen(),
		});
		this.vd.play(3500);
	},

	back: function() {
		if (this.vd)
			this.vd.stop();
		this.goBack();
	},

	hide: function() {
		if (this.vd)
			this.vd.stop();
		this.$el.hide();
	},
});

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
