/*
 *	Listview for TVs.
 *
 *	TVs are particular: no mouse, just up/down/left/right/enter,
 *	and little memory, so we need to do things differently.
 */

import Backbone	from 'backbone';
import _		from  'underscore';
import $		from 'jquery';

import ListBase	from './list-base.js';

export default class ListTV extends ListBase {

	constructor(opts) {
		super(opts);
		console.log('ListTV constructor called');

		this.top = 0;

		// calculate how many items we can fit in this div.
		var ul = $('<ul><li>&nbsp;</li></ul>');
		this.$el.append(ul);
		this.itemsPP = Math.floor(this.$el.height() / ul.outerHeight());

		//console.log('ListviewTV._initialize: $el.height', this.$el.height());
		//console.log('ListviewTV._initialize: ul.height', ul.outerHeight());
		//console.log('ListviewTV._initialize: itemsPP', this.itemsPP);

		ul.remove();
		this.items(this.model.get('items'));
	};

	// focus on one of the items.
	_focusItemId(did) {

		this.focusedItemId = did;

		// is the item on-screen?
		var top = Math.floor(did / this.itemsPP) * this.itemsPP;
		if (top != this.top)
			this._render();

		// focus
		this.ul.find('[data-id=' + did + ']').focus();
	};

	// render the items that are in view.
	_render() {
		//console.log('listviewTV._render start');

		var focused = this.focusedItemId;
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

		this.ul.find('[data-id=' + focused + ']').focus();

		return;
	};
};

// vim: tabstop=4:softtabstop=4:shiftwidth=4:noexpandtab
