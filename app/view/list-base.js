/*
 *	Listview base implementation.
 *
 */

import Backbone	from 'backbone';
import _		from 'underscore';
import Key		from '../platform/keys.js';

function isiOS() {
	var ua = navigator.userAgent;
	return ua.match(/iPad|iPhone|iPod/);
}

export default class ListBase extends Backbone.View {

	get events() {
		return {
			"keydown":	"_keyDown",
			"keyup":	"_keyUp",
		};
	};

	constructor(options) {
		super(options);
		console.log('ListBase constructor called');

		this.listenTo(this.model, 'change:items', this.model_change_items);
		this.listenTo(this.model, 'change:focus', this.model_change_focus);

		// copy options.
		_.extend(this, _.pick(options, [ 'itemHtml' ]));

		this.stylesheet = '';
		this.itemArray = [];
		this.focusedItemId = 0;
		this.lastClickTime = 0;
		this.lastClickTarget = null;
		this.lastScrollTop;

		if (!isiOS()) {
			this.$el.on('click', this._click.bind(this));
		} else {
			this.$el.on('touchstart', this._touchStart.bind(this));
			this.$el.on('touchend', this._touchEnd.bind(this));
		}

		// add css
		this.$el.addClass('app-listview');

		// make ourself tabbable and focusable, and focus.
		this.$el.css('tabindex', "0");
		this.$el.css('outline', "0");
		this.$el.focus();
	};

	// model.items has changed.
	model_change_items(model) {
		this.items(model.get('items'));
	};

	// model.focus has changed.
	model_change_focus(model) {
		if (this.changeFocus)
			return;
		var name = model.get('focus') || '';
		var id = this.findItemByName(name).did;
		this._focusItemId(id)
	};

	// walk up the tree to find the 'li' item and select it.
	_evSelect(ev) {
		var elem = ev.target;
		while (elem != null && elem !== ev.currentTarget) {
			if (elem.dataset.id !== undefined)
				break;
			elem = elem.parentElement;
		}
		if (!elem || elem.dataset.id === undefined)
			return null;
		return {
			itemId: elem.dataset.id,
			elem: elem,
		};
	};

	// something was clicked on.
	_click(ev) {
		var what = this._evSelect(ev);

		// check for doubleclick.
		var dbl;
		if (ev.type.match(/touch|click/)) {
			if (ev.timeStamp < this.lastClickTime + 400 &&
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
			var id = parseInt(what.itemId);
			if (dbl || ev.target.className.match(/enter/))
				this._enter(id);
			else
				this._select(id);
		}
	};

	// touchstart; remember position.
	_touchStart(ev) {
		this.lastScrollTop = this.$el.scrollTop();
	};

	// touchend; if we scrolled, do nothing.
	_touchEnd(ev) {
		var st = this.$el.scrollTop();
		if (Math.abs(st - this.lastScrollTop) > 4)
			return;
		this._click(ev);
	};

	// something was chosen: update focus and trigger 'enter' event.
	_enter(id) {
		if (id == null)
			id = this.focusedItemId;
		var item =  this.itemArray[id];
		this.focusedItemId = id;

		if (item.name) {
			this.changeFocus = true;
			this.model.set('focus', item.name);
			this.changeFocus = false;
			this.trigger('enter', item);
		}
	};

	// something was selected: update focus and trigger 'select' event.
	_select(id) {
		if (id == null)
			id = this.focusedItemId;
		var item =  this.itemArray[id];
		this.focusedItemId = id;

		if (item.name) {
			this.changeFocus = true;
			this.model.set('focus', item.name);
			this.changeFocus = false;
			this.trigger('select', item);
		}
	};

	// back action chosen.
	_back() {
		this.trigger('back');
	};

	_keyDown(ev) {
		console.log('XXX list-base keydown ' + ev.which);
		var key = Key.map(ev);

		switch (key) {
			case Key.Enter:
			case Key.Right:
			case Key.Space:
				this._enter();
				ev.preventDefault();
				return;
			case Key.Escape:
			case Key.Left:
			case Key.Back:
				this._back();
				ev.preventDefault();
				return;
			case Key.Up:
				this._arrowUp();
				ev.preventDefault();
				return;
			case Key.Down:
				this._arrowDown();
				ev.preventDefault();
				return;
			case Key.PageUp:
			case Key.FastRewind:
				this._pageUp();
				ev.preventDefault();
				return;
			case Key.PageDown:
			case Key.FastForward:
				this._pageDown();
				ev.preventDefault();
				return;
		}
		if ((key >= 48 && key <= 57) ||
			(key >= 65 && key <= 90)) {
				this._keyAlpha(ev.which);
			ev.preventDefault();
			return;
		}
	};

	// some keys only take real action when they are released,
	// this is so that keyboard repeat does the right thing.
	_keyUp(ev) {
		//console.log('keyup', ev);
		var key = Key.map(ev);
		switch (key) {
			case Key.Up:
			case Key.Down:
			case Key.PageUp:
			case Key.PageDown:
			case Key.FastRewind:
			case Key.FastForward:
				this._select();
		}
	};

	// choose item 0-9 a-z
	_keyAlpha(keyCode) {
		var item = this.findItemByName(String.fromCharCode(keyCode));
		if (item) {
			this._focusItemId(item.did);
			this._select(item.did);
		}
	};

	// select next item
	_arrowDown() {
		var id = this.focusedItemId + 1;
		if (id >= this.itemArray.length)
			id = 0;
		this._focusItemId(id);
	};

	// select previous item
	_arrowUp() {
		var id = this.focusedItemId - 1;
		if (id < 0)
			id = this.itemArray.length - 1;
		this._focusItemId(id);
	};

	// go forward 1 letter in the alphabet
	_pageDown() {
		var l = this.itemArray[this.focusedItemId].sortName;
		if (l == '')
			return;
		var id = this.focusedItemId + 1;
		while (id < this.itemArray.length) {
			if (this.itemArray[id].sortName[0] != l[0])
				break;
			id++;
		}
		if (id == this.itemArray.length)
			id = 0;
		this._focusItemId(id);
	};

	// go back 1 letter in the alphabet
	_pageUp() {
		var l = this.itemArray[this.focusedItemId].sortName;
		if (l == '')
			return;
		var id = this.focusedItemId - 1;
		while (id >= 0) {
			if (this.itemArray[id].sortName[0] != l[0])
				break;
			id--;
		}
		if (id < 0)
			id = this.itemArray.length - 1;
		id = this.findItemByName(this.itemArray[id].sortName[0]).did;
		this._focusItemId(id);
	};

	// default implementation of itemHtml
	itemHtml(item) {
		return _.escape(item.name);
	};

	// generate <li> for one item
	_itemHtml(item) {
		return '<li data-id="' + item.did + '" tabindex="-1">' +
			this.itemHtml(item) + '</li>';
	};

	// initialize a new list of items.
	items(items) {

		// fake an empty entry if we have nothing else.
		if (items == null || _.isEmpty(items)) {
			items = [{
				name: '',
				sortName: '',
			}];
		}

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

		this.itemMap = items;

		for (var i in itemArray)
			itemArray[i].did = parseInt(i);
		this.itemArray = itemArray;

		var name = this.model.get('focus') || '';
		this.focusedItemId = this.findItemByName(name).did;

		// and render.
		this._render();
	};

	// rerender one item
	renderItem(name, options) {
		var item = this.itemMap[name];
		if (item) {
			var li = this.ul.find('[data-id="' + id + '"]');
			if (li.length > 0)
				li.html(this.itemHtml(item), options);
		}
	};

	// find an item, or the nearest one alphabetically.
	findItemByName(name) {
		name = name.toLowerCase().replace(/^the[ 	]+/, '');
		for (var i in this.itemArray) {
			// XXX FIXME: seasons have no special 'sortName' so are
			// not lowercased. This is a quick hack/fix.
			//console.log('compare', this.itemArray[i].sortName, name);
			var itemName = this.itemArray[i].sortName.toLowerCase();
			if (itemName.localeCompare(name) >= 0)
				return this.itemArray[i];
		}
		return this.itemArray[0];
	};
};

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
