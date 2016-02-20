/*
 * pqueue.js	A lossy promise queue.
 *				You hand a function or closure that returns a Promise
 *				to PQueue.push(). The function is not executed, but
 *				placed into a deferred promise, and put onto the queue.
 *				The deferred promise is returned.
 *
 *				After soon as the currently executing deferred resolves,
 *				all queued deferreds are canceled (by calling .reject(null)),
 *				except for the last one, which is executed.
 *
 *				When a executed deferred resolves, and there are other
 *				deferreds still queued, the deferred is not resolved
 *				but canceled.
 *
 * TODO:		- make behaviour configurable:
 *				  o max number in parallel
 *				  o use strict order or not for parallel requests
 *				  o lossy or not
 *				  o lossy after resolve or not
 *				- make .push() accept promise as well as function() { }
 *				- figure out right terminology to talk about this stuff.
 */

'use strict';

class Deferred {
	constructor() {
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
		this.then = this.promise.then.bind(this.promise);
		this.catch = this.promise.catch.bind(this.promise);
	};
};

export default class PQueue {
	constructor() {
		this.qlist = [];
		this.qbusy = false;
	};

	_next() {
		setTimeout(() => {
			// cancel outstanding requests, resolve the last one.
			this.qbusy = false;
			while (this.qlist.length > 0) {
				var q = this.qlist.shift();
				if (this.qlist.length > 0) {
					q.deferred.reject(null);
				} else {
					this.push.apply(this, q.args)
					.then((res) => {
						if (this.qlist.length > 0)
							q.deferred.reject(null);
						else
							q.deferred.resolve(res);
					})
					.catch(q.deferred.reject);
				}
			}
		}, 0);
	};

	push(func, ...args) {
		if (this.qbusy) {
			var d = new Deferred();
			this.qlist.push({ deferred: d, args: arguments });
			return d;
		}
		this.qbusy = true;
		return func(...args)
		.then((ret) => { this._next(); return ret; })
		.catch((ret) => { this._next(); return ret; });
	};
};

