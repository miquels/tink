
'use strict';

/* es6 polyfill*/ require('babel-polyfill');

var $			= require('jquery');

var	Page		= require('./js/page.js'),
	Util		= require('./js/util.js'),
	Appconfig	= require('./js/appconfig.js');

var Mainmenu	= require('./page/mainmenu.js'),
	TVShows		= require('./page/tvshows.js'),
	TVEpisodes	= require('./page/tvepisodes.js'),
	TVSeasons	= require('./page/tvseasons.js'),
	Movies		= require('./page/movies.js'),
	VideoPlayer	= require('./page/video.js');

var Nfo			= require('./view/nfo.js'),
	NfoTemplate	= require('./view/nfotemplate.js'),
	Image		= require('./view/image.js');

var	Platform	= require('./platform/platform.js');

// mapping from div-ids to pages for Page.switchPage();
var Pages = {
	'mainmenu':		Mainmenu,
	'tvshows':		TVShows,
	'tvseasons':	TVSeasons,
	'tvepisodes':	TVEpisodes,
	'movies':		Movies,
	'videoplayer':	VideoPlayer,
};

// mapping from classes to views for page.createViews()
var Views = {
	'app-nfo':				Nfo,
	'app-nfo-template':		NfoTemplate,
	'app-image':			Image,
};


// setup global navbar.
function navButtons() {
	$(".nav-fullscreen").click(function() {
		var body = $("body");
		Util.setFullScreen(body[0], !Util.isFullScreen());
	});
	$(".nav-back").click(function() {
		Page.backPage();
	});
	$(".nav-home").click(function() {
		Page.switchPage('mainmenu');
	});
}

window.addEventListener('load', function main() {

	Page.setup({
			pages:			Pages,
			views:			Views,
			pageClass:		'app-page',
			includeClass:	'app-include',
	});
	navButtons();

	// make sure the focus is always on some element.
	document.body.addEventListener('focusout', function(ev) {
		var elem = ev.target;
		setTimeout(function() {
			var d = document.activeElement;
			if (d == null || d.tagName == 'BODY')
				elem.focus();
		}, 5);
	});

	Appconfig.load('appconfig.json',
		function(config) {
			// XXX debug
			//$('body').keydown(function(ev) {
			//	console.log('body keydown code ' + ev.which);
			//});
			Platform.ready();
			Page.switchPage('mainmenu');
		}, function(jqXHR, error) {
			console.log('main: error reading appconfig.cfg: ' + error);
			Page.switchPage('error', {
				error: error,
			});
		}
	);
});

