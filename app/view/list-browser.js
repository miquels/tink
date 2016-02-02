/*
 *	Listview for normal browsers.
 */

var Backbone	= require('backbone'),
	_			= require('underscore'),
	$			= require('jquery');

var listbase = require('./list-base.js');

// we use box-sizing: border-box, so this is simple.
function calcHeight(elem) {
	return parseFloat(elem.css('height').replace(/px$/, ''));
}

module.exports= listbase.extend({

	_initialize: function(options) {
		if (options && options.scrollbar)
			this.$el.css('overflow-y', 'scroll');
		if (options && !options.itemHtml)
			this.itemHtml = this._browserItemHtml;
		this.$el.addClass('app-listbox-browser');
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
				'<div class="enterdiv"><i class="enter material-icons md-light md-em">play_circle_outline</i></div>';
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
