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
	_focusItem: function(item) {
		var id = _.isObject ? item.did : item;
		var el = this.ul.find('[data-id=' + id + ']');
		if (el.length == 0)
			return;
		el.focus();
	},

	_goto: function(item) {
		//console.log(item);
		this.model.set('focus', item.name, { silent: true });
		this._focusItem(item);
	},

	_keyDown: function(ev) {
		//console.log('keydown', ev);
		if (this.itemArray.length == 0)
			return;
		var key = keys.map(ev);
		switch (key) {
			case keys.key.Enter:
			case keys.key.Right:
			case keys.key.Space:
				this._enter(ev);
				ev.preventDefault();
				return;
			case keys.key.Escape:
			case keys.key.Left:
			case keys.key.Back:
				this._back(ev);
				ev.preventDefault();
				return;
			case keys.key.Up:
				this._arrowUp();
				ev.preventDefault();
				return;
			case keys.key.Down:
				this._arrowDown();
				ev.preventDefault();
				return;
		}
		if ((key >= 48 && key <= 57) ||
			(key >= 65 && key <= 90)) {
				this._keyAlpha(ev.which);
			ev.preventDefault();
			return;
		}
	},

	_keyUp: function(ev) {
		//console.log('keydup', ev);
		if (this.itemArray.length == 0)
			return;
		if (ev == null)
			ev = { which: 38 };
		var key = keys.map(ev);
		if (key == keys.key.Up || key == keys.key.Down) {
			var item = this._getFocus();
			if (item)
				this.trigger('select', item);
		}
	},

	_keyAlpha: function(keyCode) {
		var item = this.findItem(String.fromCharCode(keyCode));
		if (item)
			this._goto(item);
		this._keyUp();
	},

	_arrowDown: function(ev) {
		var item = this._getFocus();
		//console.log('item', item, id);
		var id = item ? item.did : -1;
		//console.log('item2', item, id);
		id++;
		if (id >= this.itemArray.length)
			id = 0;
		//console.log('goto', id);
		this._goto(this.itemArray[id]);
	},

	_arrowUp: function(ev) {
		if (this.itemArray.length == 0)
			return;
		var item = this._getFocus();
		var id = item ? item.did : 0;
		id--;
		if (id < 0)
			id = this.itemArray.length -1;
		this._goto(this.itemArray[id]);
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
		this._focus(this.model.get('focus'));

		//console.log('listviewBrowser: _render appended html in', (new Date().getTime() - t));

		return;
	},
});

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
