/*
 *	Listview for TVs.
 *
 *	TVs are particular: no mouse, just up/down/left/right/enter,
 *	and little memory, so we need to do things differently.
 */

var Backbone	= require('backbone'),
	_			= require('underscore'),
	$			= require('jquery');
	Backbone.$	= $;

var listbase = require('./list-base.js');

function ord(c) {
	return c.charCodeAt(0);
}
function chr(n) {
	return String.fromCharCode(n);
}

module.exports = listbase.extend({

	_initialize: function() {
		console.log('ListviewTV._initialize');

		this.focusedItemId = -1;
		this.top = 0;

		// calculate how many items we can fit in this div.
		var ul = $('<ul><li>&nbsp;</li></ul>');
		this.$el.append(ul);
		this.itemsPP = Math.floor(this.$el.height() / ul.outerHeight());

		console.log('ListviewTV._initialize: $el.height', this.$el.height());
		console.log('ListviewTV._initialize: ul.height', ul.outerHeight());
		console.log('ListviewTV._initialize: itemsPP', this.itemsPP);

		ul.remove();
	},

	// focus on one of the items.
	_focusItem: function(item) {

		var did;
		if (typeof(item) == 'number')
			did = item;
		else
			did = item.did;
		this.focusedItemId = did;

		// is the item on-screen?
		var top = Math.floor(did / this.itemsPP) * this.itemsPP;
		if (top != this.top)
			this._render();

		// focus
		this.ul.find('[data-id=' + did + ']').focus();
	},

	// render the items that are in view.
	_render: function() {
		//console.log('listviewTV._render start');

		var focused = this.focusedItemId;
		if (focused < 0)
			focused = 0;
		var top = Math.floor(focused / this.itemsPP) * this.itemsPP;
		this.top = top;

		// create html
		var list = [];
		for (var i = top; i < top + this.itemsPP; i++) {
			if (i < this.itemArray.length)
				list.push(this._itemHtml(this.itemArray[i]));
		}

		// parse html
		var ul = $('<ul>').html(list.join(''));

		// replace.
		if (this.ul)
			this.ul.remove();
		this.$el.append(ul);
		this.ul = ul;

		return;
	},

	_keyDown: function(evt) {
		console.log("listviewTV._keyDown", evt.which);
		if (this.itemArray.length == 0)
			return;
		if (evt.which == 13) {
			this._enter(evt);
			evt.preventDefault();
			return;
		}
		if (evt.which == 37) {
			this._arrowLeft();
			evt.preventDefault();
			return;
		}
		if (evt.which == 38) {
			this._arrowUp();
			evt.preventDefault();
			return;
		}
		if (evt.which == 39) {
			this._arrowRight();
			evt.preventDefault();
			return;
		}
		if (evt.which == 40) {
			this._arrowDown();
			evt.preventDefault();
			return;
		}
	},

	_keyUp: function(evt) {
		console.log("listviewTV._keyUp", evt.which);
		if (evt.which >= 37 && evt.which <= 40) {
			this._click(evt);
			evt.preventDefault();
		}
	},

	_arrowUp: function() {
		this.focusedItemId--;
		if (this.focusedItemId < 0)
			this.focusedItemId = this.itemArray.length - 1;
		this._focusItem(this.focusedItemId);
	},

	_arrowDown: function() {
		this.focusedItemId++;
		if (this.focusedItemId >= this.itemArray.length)
			this.focusedItemId = 0;
		this._focusItem(this.focusedItemId);
	},

	_arrowLeft: function() {
		var l = ord('~');
		var fid = this.focusedItemId;
		if (fid >= 0) {
			var c = ord(this.itemArray[fid].sortName);
			c--;
			if (c < ord('a') && c > ord('0'))
				c = ord('0');
			if (c < ord('0') || fid == 0)
				c = ord('~');
			l = chr(c);
		}
		this._focus(l);
	},

	_arrowRight: function() {
		var l = ' ';
		var fid = this.focusedItemId;
		if (fid >= 0) {
			console.log('listviewTV._arrowRight: focused is', fid);
			var c = this.itemArray[fid].sortName.charCodeAt(0);
			c++;
			if (c > '0'.charCodeAt(0) && c <= '9'.charCodeAt(0))
				c = 'a'.charCodeAt(0);
			if (c > 'z'.charCodeAt(0))
				c = '0'.charCodeAt(0);
			l = String.fromCharCode(c);
		}
		this._focus(l);
	},
});

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
