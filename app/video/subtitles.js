/*
 *	subtitles	SRT subtitle support.
 *
 *	Subs.load(url)	loads the SRT file
 *
 *	Subs.get(time)	gets the subtitles for a certain point in time.
 *					{
 *						start:		time in seconds
 *						end:		time in seconds
 *						text:		array of subtitles
 *						changed:	changed since last get()
 *					}
 */

var $ = require('jquery');

function Subs(url) {
	this.url = url;
	this.idx = -1;
	this.changed = true;
	this.running = true;
	return this;
}
module.exports = Subs;

function parseTime(tm) {
	var s = /^(\d+):(\d+):(\d+),(\d+)$/.exec(tm);
	if (!s)
		return null;
	var t = [];
	for (var n = 1; n < 5; n++) {
		t.push(parseInt(s[n]));
	}
	var r =  (t[0] * 3600) + (t[1] * 60) + t[2] + (t[3] / 1000);
	return r;
}

var spanElem = $('<span>');

// The $.ajax request that downloads the subtitles forces
// charset=iso-8859-1. If the original happened to be in
// UTF-8 anyway, we get wrongly encoded data..
function fixencoding(line) {
	try {
		// ..on wrongly encoded data, this will fix the encoding.
		// on correct data, this will fail and throw an exception,
		// in which case we simply return the correct data.
		line = decodeURIComponent(escape(line));
	} catch(e) {  }
	return line;
}

// Filter out all tags but B, I, U.
function filter(sub) {
	if (sub._clean)
		return sub;
	// now, this should work just fine. HOWEVER, tags can span
	// multiple lines, and we show each line in a seperate div :(
	// so for now just hack it.
	/*
	spanElem.html(sub.text.join('\n'));
	spanElem.find(':not(b, i, u)').remove();
	sub._clean = true;
	sub.text = spanElem.html().split('\n');
	*/
	for (var i in sub.text) {
		sub.text[i] = sub.text[i].replace(/<[^>]*>/g, '');
		sub.text[i] = fixencoding(sub.text[i]);
	}
	sub._clean = true;
	return sub;
}

function parseSrt(data) {
	var lines = data.split("\n");
	var state = 1;
	var ret = [];
	var cur;
	var lineno = 0;
	for (var i in lines) {
		lineno++;
		var line = lines[i].replace(/[ \t\r\n]*$/, '');
		switch(state) {
			case 1:
				if (line == "")
					break;
				if (line.match(/^[0-9]+$/)) {
					state = 2;
					break;
				}
				// This is an error, but we will try to recover-
				// stay in state 1 until we see a line starting
				// with a number.
				console.log('Subs.parseStr: error on line', lineno);
				break;
			case 2:
				var ts = line.split(/[ \t]+/);
				if (ts.length != 3 || ts[1] != '-->') {
					console.log('Subs.parseStr: error on line', lineno);
					state = 1;
					break;
				}
				var start = parseTime(ts[0]);
				var end = parseTime(ts[2]);
				if (start == null || end == null) {
					console.log('Subs.parseStr: error on line', lineno);
					state = 1;
					break;
				}
				ret.push({ start: start, end: end, text: [] });
				cur = ret.length - 1;
				state = 3;
				break;
			case 3:
				if (line == "") {
					state = 4;
					break;
				}
				ret[cur].text.push(line);
				break;
			case 4:
				if (line == "")
					break;
				if (line.match(/^[0-9]+$/)) {
					state = 2;
					break;
				}
				ret[cur].text.push(line);
				break;
		}
	}
	if (state < 0) {
		console.log("Subs.parseStr: corrupt srt file on line", lineno);
		return null;
	}
	//console.log('subs:',ret);
	return ret;
}

function inrange(sub, time) {
	return (time >= sub.start && time <= sub.end);
}

Subs.prototype = {
	constructor: Subs,

	// load the subtitles using ajax.
	load: function(url) {

		if (url == null)
			url = this.url;
		if (url == this.url && this.subtitles) {
			return $.Deferred().resolve(this);
		}

		this.url = url;
		this.subtitles = null;
		this.idx = -1;
		this.changed = true;

		// NOTE:
		// .srt files are normally in ANSI / iso-8859-1, so
		// force the mime charset to charset=iso-8859-1.
		return $.ajax(url, {
			beforeSend: function(xhr) {
				xhr.overrideMimeType("text/plain; charset=iso-8859-1");
			},
			dataType: 'text',
		}).then(function(data) {
			this.subtitles = parseSrt(data);
			if (this.subtitles == null)
				return $.Deferred().reject();
			//console.log('subtitles loaded', this.url);
			this.changed = true;
			return this;
		}.bind(this));
	},

	// subtitles changed to 'none'.
	_empty: function(time, quiet) {
		var r = {
			changed:	this.changed,
			start:		time,
			end:		time,
			text:		[],
		};
		//if (this.changed)
		//	console.log('empty');
		if (!quiet) {
			this.changed = false;
			this._timeNextUpdate(time);
		}
		return r;
	},

	_updateIn: function(time, max) {
		if (this.subtitles == null)
			return -1;
		var len = this.subtitles.length;
		if (len == 0 || this.idx < -1 || this.idx >= len)
			return -1;

		// end of current subtitle nearby?
		if (this.idx >= 0) {
			var d = this.subtitles[this.idx].end - time;
			if (d >= 0 && d < max)
				return d;
		}

		// start of next subtitle nearby?
		if (this.idx < len + 1) {
			d = this.subtitles[this.idx + 1].start - time;
			if (d >= 0 && d < max)
				return d;
		}

		return -1;
	},

	// next subtitle, when?
	_timeNextUpdate: function(time) {

		//console.log('timeNextUpdate');

		// see if a subtitle start/stop
		// is coming up within the next 30 secs.
		var d = this._updateIn(time, 30);
		if (d < 0) {
			//console.log('next subtitle out of timerange');
			return;
		}

		// already set a timer?
		if (this.timerId && this.timerTime >= time &&
							this.timerTime <= (time + d)) {
			//console.log('timer already set for', this.timerTime);
			return -1;
		}

		// OK set an update trigger.
		if (this.timerId)
			clearTimeout(this.timeriD);
		this.timerTime = time + d;
		this.timerId = setTimeout(function() {
			this.periodicUpdate();
		}.bind(this), d);
		//console.log('set timer in', d, 'secs');
	},

	// get the subtitles for a certain timepoint.
	get: function(time) {

		if (time == null)
			time = 0;

		//console.log('0. looking for subs at', time);

		// check if we have subs.
		if (this.subtitles == null)
			return this._empty(time);
		var slen = this.subtitles.length;
		if (slen == 0)
			return this._empty(time);

		//console.log('1. looking for subs at', time);

		var lastsub;
		if (this.idx >= 0 && this.idx < slen) {

			// no change?
			lastsub = this.subtitles[this.idx];
			if (inrange(lastsub, time)) {
				//console.log('return lastsub and nochange');
				return $.extend({ changed: false }, filter(lastsub));
			}

			// can we continue where we left off?
			if (time < lastsub.start)
				this.idx = -1;

		}

		//console.log('2. looking for subs at', time, this.idx, slen);

		// find it.
		var s = this.idx >= 0 ? this.idx : 0;
		for (var i = s; i < slen; i++) {

			var sub = this.subtitles[i];
			if (inrange(sub, time)) {
				this.idx = i;
				this.changed = true;
				//console.log('new:', sub);
				this._timeNextUpdate(time);
				return $.extend({ changed: true }, filter(sub));
			}
				
			if (sub.start > time)
				break;
		}

		return this._empty(time);
	},

	// set the subtitle update callback.
	onUpdate: function(cb) {
		this.subcb = cb;
	},

	// set the getTime callback
	getTime: function(cb) {
		this._getTime = cb;
	},

	// must be called at start and at least every 30 secs
	// preferably a few times a second.
	periodicUpdate: function() {
		if (!this.running || !this._getTime)
			return;
		var sub = this.get(this._getTime());
		if (sub.changed && this.subcb) {
			//console.log('update subs');
			this.subcb(sub);
		}
	},

	start: function() {
		this.running = true;
		this.periodicUpdate();
	},

	stop: function() {
		if (this.timerId)
			clearTimeout(this.timerId);
		this.timerId = null;
		if (this.subcb) {
			this.changed = true;
			//console.log('stop, set to empty');
			this.subcb(this._empty(0, true));
		}
		this.idx = -1;
		this.running = false;
	},

	destroy: function() {
		this.stop();
		this.subtitles = null;
	},
};

