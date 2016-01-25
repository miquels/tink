/*
 *	page.js		Stuff for page population and page switching.
 *
 */

'use strict';

var Hammer	= require('hammerjs'),
	$		= require('jquery'),
	_		= require('underscore');

// mapping from pages to views for switchPage();
var PageMap = {};

// mapping from classes to views for App.createViews()
var ViewMap = {};

// currently instantiated pages.
var Pages = {};

// current page (view)
var currentPage;

var backButtonId;

function switchPage(pageName, options) {

	if (currentPage && currentPage.hide)
		currentPage.hide.call(currentPage);

	if (Pages[pageName]) {
		console.log("page.switchPage: show", pageName);
		currentPage = Pages[pageName];
		currentPage.show(options);
		return;
	}

	console.log("page.switchPage: instantiate", pageName);
	var page = PageMap[pageName];
	if (!page) {
		console.log("page.switchPage: error: no such page: ", pageName);
		return;
	}
	options = options || {};
	options.el = '#' + pageName;
	$(options.el).show();
	Pages[pageName] = new page(options);
	currentPage = Pages[pageName];
}
exports.switchPage = switchPage;

// Instantiate subviews.
function createViews(self, options) {
	self.views = [];
	for (var className in ViewMap) {
		self.$el.find('.' + className).each(function() {
			var view = ViewMap[className];
			var args = _.extend({
				el:		$(this),
			}, options);
			self.views.push(new view(args));
		});
	}
}
exports.createViews = createViews;

// Destroy subviews.
function destroyViews(self) {
	for (var v in self.views)
		v.remove();
}
exports.destroyViews = destroyViews;

function backPage() {
	if (currentPage && currentPage.back)
		currentPage.back.call(currentPage);
}
exports.backPage = backPage;

// Initially hide all pages.
function hidePages(pageClass) {
	$('.' + pageClass).hide();
}

// Resolve the includes
function resolveIncludes(includeClass) {
	$('.' + includeClass).each(function() {
		var id = $(this).data('id');
		if (id)
			$(this).html($('#' + id).html());
	});
}

// Intercept the 'back' button for our own purposes.
function backButton() {
	backButtonId = (new Date()).getTime();
	history.replaceState({ id: backButtonId }, '', window.location);
	history.pushState({ id: 0 }, '', window.location);
	$(window).on('popstate', function() {
		if (history.state.id == backButtonId) {
			history.forward()
		} else {
			console.log('page.backButton: user pressed the back button');
			backPage();
		}
	});
}

function setupTouch() {
	var mc = new Hammer($('body')[0]);
	mc.on("swiperight", backPage);
}

function setup(options) {
	backButton();
	setupTouch();
	if (options.pageClass)
		hidePages(options.pageClass, options.noHideId);
	if (options.includeClass)
		resolveIncludes(options.includeClass);
	PageMap = options.pages;
	ViewMap = options.views;
}
exports.setup = setup;

