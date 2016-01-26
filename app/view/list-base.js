/*
 *	Listview base implementation.
 *
 */


var Backbone	= require('backbone'),
	_			= require('underscore'),
	$			= require('jquery');
	Backbone.$	= $;

var css = [
	'ul {',
	'	list-style-type: none;',
	'}',
	'li {',
	'	position: relative;',
	'	width: 100%;',
	'	display: block;',
	'	text-decoration: none;',
	'	white-space: nowrap;',
	'	overflow-x: hidden;',
	'	overflow-y: auto;',
	'}',
	'li:focus {',
	'	background-color: #FF8C00;',
	'}',
	'.counter {',
	'	color: #333333;',
	'	background-color: #bbbbbb;',
	'	position: absolute;',
	'	right: 0px;',
	'	border: 0px;',
	'	border-radius: 0.5em;',
	'	padding-left: 0.45em;',
	'	padding-right: 0.45em;',
	'}',
].join("\n");


function isiOS() {
	var ua = navigator.userAgent;
	return ua.match(/iPad|iPhone|iPod/);
}

module.exports = Backbone.View.extend({

	events: {
		"keydown":	"__keyDown",
		"keyup":	"__keyUp",
	},

	initialize: function(options) {

		console.log('ListviewBase initialize called');
		this.listenTo(this.model, 'change:items change:focus', this.model_change);

		// copy options.
		_.extend(this, _.pick(options, [ 'itemHtml' ]));

		this.stylesheet = '';
		this.itemArray = [];
		this.lastClickTime = 0;
		this.lastClickTarget = null;
		this.lastScrollTop;

		if (!isiOS()) {
			this.$el.on('click', this._click.bind(this));
		} else {
			this.$el.on('touchstart', this._touchStart.bind(this));
			this.$el.on('touchend', this._touchEnd.bind(this));
		}

		// initialize view.
		if (this._initialize)
			this._initialize(options);

		// generate scoped CSS
		var style = "<style scoped>" + css + this.stylesheet + "</style>";

		// make ourself tabbable and focusable, and focus.
		this.$el.attr("tabindex", 0);
		this.$el.css('outline', 0);
		this.$el.focus();

		// fill div with data.
		this.$el.html(style);
		this.items(this.model.get('items') || {});
		this._focus(this.model.get('focus'));

	},

	// model has changed.
	model_change: function(model) {
		// new items.
		if (model.hasChanged('items')) {
			this.items(model.get('items'));
			// sets focus as well.
			return;
		}
		// focus change.
		if (model.hasChanged('focus')) {
			this._focus(model.get('focus'));
		}
	},


	_getFocus: function() {
		//console.log('focus', this.model.get('focus'));
		var items = this.model.get('items');
		return items[this.model.get('focus')];
	},

	__keyDown: function(ev) {
		if (this._keyDown)
			this._keyDown(ev);
	},

	__keyUp: function(ev) {
		if (this._keyUp)
			this._keyUp(ev);
	},

	// walk up the tree to find the 'li' item and select it.
	_evSelect: function(ev) {
		var elem = ev.target;
		while (elem != null && elem !== ev.currentTarget) {
			if (elem.dataset.id !== undefined)
				break;
			elem = elem.parentElement;
		}
		if (!elem || elem.dataset.id === undefined)
			return null;
		//console.log("listviewBase: triggered event on", elem);

		// remember what is focused right now.
		var item = this.itemArray[elem.dataset.id];
		this.focusedItemId = elem.dataset.id;

		return {
			item: item,
			elem: elem,
		};
	},

	// something was selected.
	_click: function(ev) {
		var what = this._evSelect(ev);
		var dbl;
		if (ev.type.match(/touch|click/)) {
			if (ev.timeStamp < this.lastClickTime + 200 &&
				ev.target == this.lastClickTarget) {
					dbl = true;
					this.lastClickTime = 0;
			} else {
				this.lastClickTime = ev.timeStamp;
				this.lastClickTarget = ev.target;
			}
		}
		if (what) {
			if (isiOS())
				what.elem.focus();
			this.model.set('focus', what.item.name, { silent: true });
			if (dbl || ev.target.className.match(/enter/))
				this.trigger('enter', what.item);
			else
				this.trigger('select', what.item);
		}
	},

	_touchStart: function(ev) {
		this.lastScrollTop = this.$el.scrollTop();
	},

	_touchEnd: function(ev) {
		var st = this.$el.scrollTop();
		if (Math.abs(st - this.lastScrollTop) > 4)
			return;
		this._click(ev);
	},

	// something was chosen.
	_enter: function(ev) {
		var item = this._evSelect(ev);
		if (item) {
			this.model.set('focus', item.name, { silent: true });
			this.trigger('enter', item);
		}
	},

	// want to go to the previous page
	_back: function(ev) {
		this.trigger('back');
	},

	// default implementation of itemHtml
	itemHtml: function(item) {
		return _.escape(item.name);
	},

	// generate <li> for one item
	_itemHtml: function(item) {
		return '<li data-id="' + item.did + '" tabindex="-1">' +
			this.itemHtml(item) + '</li>';
	},

	// initialize a new list of items.
	items: function(items) {

		this.itemMap = items;

		// sort the items
		var tmp = [];
		for (var i in items)
			tmp.push(items[i]);
		var itemArray = tmp.sort(function(a, b) {
			return a.sortName.localeCompare(b.sortName);
		});

		// changed?
		// XXX this is a hack. We have 'items' in the model, which is
		// valid - it is our model, but it's a pointer to the
		// whole 'show' thing, which can be huge, and anything
		// anytime changes there (load show episodes for example),
		// 1. the whole old and new objects are compared, and
		// 2. change:items triggers.
		// This sucks. Rethink the model.
		// Perhaps not for the 'tvshows' list but only for
		// individual shows? Makes sense.
		if (this.itemArray.length == itemArray.length) {
			var same = true;
			for (i in this.itemArray) {
				if (this.itemArray[i] != itemArray[i]) {
					same = false;
					break;
				}
			}
			if (same)
				return;
		}

		for (var i in itemArray)
			itemArray[i].did = i;
		this.itemArray = itemArray;

		// and render.
		this._render();
	},

	// rerender one item
	renderItem: function(name, options) {
		var item = this.itemMap[name];
		if (item) {
			var li = this.ul.find('[data-id="' + id + '"]');
			if (li.length > 0)
				li.html(this.itemHtml(item), options);
		}
	},

	// find an item, or the nearest one alphabetically.
	findItem: function(name) {
		name = name.toLowerCase().replace(/^the[ 	]+/, '');
		for (var i in this.itemArray) {
			//console.log('compare', this.itemArray[i].sortName, name);
			if (this.itemArray[i].sortName.localeCompare(name) >= 0)
				return this.itemArray[i];
		}
		if (this.itemArray.length > 0)
			return this.itemArray[0];
		return null;
	},

	// focus one of the items.
	// if none, focus the first.
	_focus: function(name) {
		var item = this.findItem(name || '');
		if (item != null)
			this._focusItem(item);
	},

	// clear items
	clear: function() {
		if (this.ul) {
			this.ul.remove();
			this.ul = $("<ul>");
		}
		this.itemMap = {};
		this.itemArray = [];
	},
});

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
