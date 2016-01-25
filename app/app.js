
'use strict';

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
		Util.setFullScreen(body[0], !isFullScreen());
	});
	$(".nav-back").click(function() {
		Page.backPage();
	});
	$(".nav-home").click(function() {
		Page.switchPage('mainmenu');
	});
}

$(document).ready(function() {

	Page.setup({
			pages:			Pages,
			views:			Views,
			pageClass:		'app-page',
			includeClass:	'app-include',
	});
	navButtons();

	Appconfig.load('appconfig.json',
		function(config) {
			Page.switchPage('mainmenu');
		}, function(jqXHR, error) {
			console.log('main: error reading appconfig.cfg:', error);
			Page.switchPage('error', {
				error: error,
			});
		}
	);
});

