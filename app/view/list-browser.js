/*
 *	Listview for normal browsers.
 */

var Backbone	= require('backbone'),
	_			= require('underscore'),
	$			= require('jquery'),
	keys		= require('../js/keys.js');

var listbase = require('./list-base.js');

// we use box-sizing: border-box, so this is simple.
function calcHeight(elem) {
	return parseFloat(elem.css('height').replace(/px$/, ''));
}

var css = [
	'.itemdiv {',
	'	max-width: 100%;',
	'	float: left;',
	'	overflow-x: hidden;',
	'}',
	'.enterdiv {',
	'	display: none;',
	'	float: right;',
	'	margin-left: auto;',
	'	padding-left: 0.2em;',
	'	padding-right: 0.3em;',
	'	background: inherit;',
	'}',
	'li {',
	'	display: block;',
	'	display: flex;',
	'	cursor: default;',
	'}',
	'li:focus:hover {',
	'	cursor: pointer;',
	'}',
	'li:focus .enterdiv {',
	'	display: block;',
	'}',
].join("\n");

module.exports= listbase.extend({

	_initialize: function(options) {
		if (options && options.scrollbar)
			this.$el.css('overflow-y', 'scroll');
		if (options && !options.itemHtml)
			this.itemHtml = this._browserItemHtml;
		// should probably do something like
		// this.addStyleSheet(css);
		this.stylesheet = css;
		this.$el.focus();
	},

	// set focus to one of the elements.
	_focusItemId: function(id) {
		this.focusedItemId = id;
		var el = this.ul.find('[data-id=' + id + ']');
		if (el.length == 0)
			return;
		el.focus();
	},

	_browserItemHtml: function(item) {
		return '<div class="itemdiv">' + _.escape(item.name) + '</div>' +
				'<div class="enterdiv"><i class="enter fa fa-chevron-circle-right"></i></div>';
		//return '<div>' + _.escape(item.name) + '</div>';
	},

	// render all items in bulk.
	_render: function() {
		console.log('listviewBrowser: _render start');
		var t = new Date().getTime();

		// create html
		var list = [];
		for (var i in this.itemArray) {
			list.push(this._itemHtml(this.itemArray[i]));
		}
		var html = list.join('');
		//console.log('listviewBrowser: _render built data in', (new Date().getTime() - t));
		t = new Date().getTime();

		// parse html
		var ul = $('<ul>').html(html);

		//console.log('listviewBrowser: _render parsed html in', (new Date().getTime() - t));
		t = new Date().getTime();

		// replace.
		if (this.ul)
			this.ul.remove();
		this.$el.append(ul);
		this.ul = ul;

		// set focus
		this._focusItemId(this.focusedItemId);

		//console.log('listviewBrowser: _render appended html in', (new Date().getTime() - t));

		return;
	},
});

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
