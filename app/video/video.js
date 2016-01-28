/*
 *	Customized video player.
 */

var $		= require('jquery'),
	Subs	= require('./subtitles.js'),
	Key	=	 require('../js/keys.js');

function Video(options) {
	this.cursor = 'auto';
	this._initialize.apply(this, arguments);
	this.initialize.apply(this, arguments);
	return this;
}

function isFullScreen() {
	return (document.fullScreenElement &&
			document.fullScreenElement !== null)
        			|| document.mozFullScreen
        			|| document.webkitIsFullScreen;
}

function setFullScreen(elem, enable) {
	var m;
	if (elem && enable !== false) {
		m = [	'requestFullscreen', 'msRequestFullscreen',
				'mozRequestFullScreen', 'webkitRequestFullscreen' ];
	} else {
		m = [	'exitFullscreen', 'msExitFullscreen',
				'mozCancelFullScreen', 'webkitExitFullscreen' ];
		elem = document;
	}
	for (var f in m) {
		if (elem[m[f]]) {
			elem[m[f]]();
			break;
		}
	}
}

function sliderPos(el, ev) {
	var left = el.offset().left;
	var width = el.width();
	var pos = ev.changedTouches[0].pageX;
	var r = (pos - left) / width;
	return r * 100;
}

var tmpElem = $("<span>");

function showSubs(elem, sub) {

	//console.log('showSubs', elem, sub);
	for (var i = 0; i < elem.length; i++) {
		if (i >= sub.text.length) {
			elem[i].innerHTML = (i > 1) ? '' : '&nbsp';
		} else {
			//console.log(sub.text[i]);
			elem[i].innerHTML = sub.text[i];
		}
	}
}

function isiOS() {
	var ua = navigator.userAgent;
	return ua.match(/iPad|iPhone|iPod/i);
}

function fmt_digits(n) {
    return n < 10 ? '0' + n : n;
}

function hhmmss(do_hour, tm) {
	var h = Math.floor(tm / 3600);
	var m = Math.floor((tm % 3600) / 60);
	var s = Math.floor(tm % 60);
	if (do_hour)
		return fmt_digits(h) + ':' + fmt_digits(m) + fmt_digits(s);
	return fmt_digits(m) + ':' + fmt_digits(s);
}

Video.prototype = {
	constructor: Video,

	initialize: function(options) {

		console.log('Video.initialize'); //, options);
		options = options || {};
		this.seekDragging = false;
		this.subsOn = false;
		this.subtitles = options.subtitles;

		this.hideControls();

		this.noFullScreen = options.noFullScreen;
		if (navigator.userAgent.match(/iPad|iPhone|iPod/))
			this.noFullScreen = true;

		if (this.noFullScreen) {
			this.fullScreenButton.addClass('video-btn-inactive');
		} else {
			this.fullScreenButton.removeClass('video-btn-inactive');
			setFullScreen(this.cntr[0], true);
		}

		this.saveCursor();
		if (options.url)
			this.video.src = options.url;
		if (options.time)
			this.setTime(options.Time);
		if (options.subtitles) {
			//console.log('set subtitles to', options.subtitles);
			this.subButton.removeClass('video-btn-inactive');
		} else {
			//console.log('NO SUBS');
			this.subButton.addClass('video-btn-inactive');
		}
	},

	_initialize: function(options) {

		this.el = options.el;
		this.stopCb = options.stop;
		this.seek = -1;

		$('#video-container').focus();

		// Subs
		this.subs = new Subs();
		this.subs.getTime(function() {
			return this.video.currentTime;
		}.bind(this));
		var sublines = this.el.find(".video-subline");
		this.subs.onUpdate(function(s) {
			showSubs(sublines, s);
		});

		// Video
		var $video = this.el.find("#video-element");
		this.video = $video[0];
		this.cntr = this.el.find("#video-container");

		// Buttons
		this.playButton = this.el.find("#video-play-pause");
		this.subButton = this.el.find("#video-subtitles");
		var stopButton = this.el.find("#video-stop");
		this.fullScreenButton = this.el.find("#video-full-screen");

		// Sliders
		this.seekBar = this.el.find("#video-seek-bar");

		// Info
		this.timeInfo = this.el.find("#video-time");

		// on mousemove (or tap)
		this.cntr.mousemove(function() {
			if (!this.seekDragging)
				this.showControls();
		}.bind(this));

		// XXX FIXME
		// do all the sub start / stop stuff, and timers etc
		// based on video events.
		$video.on("ended", function() {
			this.stopped();
		}.bind(this));

		$video.on("loadedmetadata", function() {
		}.bind(this));

		$video.on("loadeddata", function() {
			// For now, we disable any built in subtitles tracks
			// because we have our own customized subtitle track
			// element that loads .srt files externally.
			//console.log('loaded data, tracks:', this.video.textTracks.length);
			for (var i = 0; i < this.video.textTracks.length; i++)
				this.video.textTracks[i].mode = 'disabled';
		}.bind(this));

		var clickEvent = 'click';
		if (isiOS()) {
			clickEvent = 'touchend';
			this.cntr.on('touchstart', function() {
				// nothing, needed for the :active pseudo class.
				// might want to show controls on start/down
				// and hide on end/up
				return;
			});
		}

		// Event listeners for keys
		this.cntr.on('keydown', function(ev) {

			this.showControls();
			console.log('keydown ' + ev.which + ' map ' + Key.map(ev));
			switch (Key.map(ev)) {
				case Key.Left:
					this.setTime(this.video.currentTime - 10);
					ev.preventDefault();
					break;
				case Key.Right:
					this.setTime(this.video.currentTime + 10);
					ev.preventDefault();
					break;
				case Key.PageUp:
				case Key.FastRewind:
					this.setTime(this.video.currentTime - 30);
					ev.preventDefault();
					break;
				case Key.PageDown:
				case Key.FastForward:
					this.setTime(this.video.currentTime + 30);
					ev.preventDefault();
					break;
				case Key.Pause:
					this.pause();
					ev.preventDefault();
					break;
				case Key.Play:
					this.play(1);
					ev.preventDefault();
					break;
				case Key.Back:
				case Key.Stop:
					this.stopped();
					ev.preventDefault();
					break;
				case Key.Space:
				case 32:
					if (this.video.paused == true)
						this.play(3500);
					else
						this.pause();
					break;
			}
		}.bind(this));

		// Event listener for the play/pause button
		this.playButton.on(clickEvent, function() {
			if (this.video.paused == true)
				this.play(3500);
			else
				this.pause();
		}.bind(this));

		// Event listener for the stop button
		stopButton.on(clickEvent, function() {
			this.stopped();
		}.bind(this));

		// Event listener for the full-screen button
		this.fullScreenButton.on(clickEvent, function() {
			if (!this.noFullScreen)
				setFullScreen(this.cntr[0], !isFullScreen());
		}.bind(this));

		// Event listener for the subtitles button.
		this.subButton.on(clickEvent, this.subsOnOff.bind(this));

		// Seekbar touch start.
		this.seekBar.on("touchstart", function(ev) {
			//console.log('seekbar touchstart event');
			this.seekDragging = true;
			this.showControls(true);
			this.video.pause();
			var p = sliderPos(this.seekBar, ev.originalEvent);
			this.setTimePct(p);
		}.bind(this));

		// Seekbar touch end.
		this.seekBar.on("touchend", function(ev) {
			//console.log('seekbar touchmove event');
			var p = sliderPos(this.seekBar, ev.originalEvent);
			this.setTimePct(p);
			this.seekDragging = false;
			this.video.play();
			this.hideControls(1500);
		}.bind(this));

		// Seekbar touch dragging.
		this.seekBar.on("touchmove", function(ev) {
			//console.log('seekbar touchmove event');
			var p = sliderPos(this.seekBar, ev.originalEvent);
			this.setTimePct(p);
		}.bind(this));

		if (clickEvent == 'click') {

			// Seekbar mousedrag start
			this.seekBar.on("mousedown", function() {
				this.showControls(true);
				this.seekDragging = true;
				this.video.pause();
			}.bind(this));

			// Seekbar mousedrag stop
			this.seekBar.on("mouseup", function() {
				this.seekDragging = false;
				this.video.play();
				this.hideControls(1500);
			}.bind(this));

			// Seekar mouse dragging.
			this.seekBar.on("input change", function() {
				//console.log('seekbar change event', this.seekBar[0].value);
				this.setTimePct(this.seekBar[0].value);
			}.bind(this));
		}

		// Update the seek bar as the video plays
		$video.on("timeupdate", function() {
			this.updateTime();
		}.bind(this));

	},

	updateTime: function(time) {
		time = this.video.currentTime;
		if (this.seekBar && !this.seekDragging)
			this.seekBar[0].value = (100 / this.video.duration) * time;
		if (this.timeInfo) {
			var do_hour = !this.video.duration || this.video.duration >= 3600;
			this.timeInfo.text(hhmmss(do_hour, time) + ' / ' +
						hhmmss(do_hour, this.video.duration));
		}
		this.subs.periodicUpdate();
	},

	setTime: function(time) {
		this.video.currentTime = time;
		this.seekBar[0].value = (100 / this.video.duration) * time;
		this.subs.periodicUpdate();
	},

	setTimePct: function(pct) {
		console.log('updateTimePct', pct);
		this.setTime((this.video.duration / 100) * pct);
	},

	hideControls: function(delay) {
		if (delay) {
			if (!this.tmOut)
				this.tmOut = setTimeout(this.hideControls.bind(this), delay);
			return;
		}
		this.el.find('#video-controls').css('opacity', '0');
		this.el.css('cursor', 'none');
		this.tmOut = null;
	},

	showControls: function(permanent) {
		if (this.tmOut) {
			clearTimeout(this.tmOut);
			this.tmOut = null;
		}
		this.el.find('#video-controls').css('opacity', '0.9');
		this.el.css('cursor', this.cursor);
		if (!permanent && this.video.src && !this.video.paused)
			this.hideControls(2200);
	},

	saveCursor: function() {
		var c = this.el.css('cursor');
		if (!c || c == 'none')
			c = 'default';
		this.cursor = c;
	},

	subsOnOff: function() {
		if (this.subsOn) {
			console.log('stop subs');
			this.subsOn = false;
			this.subs.stop();
			return;
		}
		var s;
		if (this.subtitles)
			s = this.subtitles.nl || this.subtitles.on || this.subtitles.en;
		if (s) {
			this.subs.load(s).then(function() {
				console.log('start subs', s);
				this.subsOn = true;
				this.subs.start();
			}.bind(this));
		}
	},

	play: function(controldelay) {
		this.subs.start();
		this.video.play();
		this.playButton.text('pause');
		this.hideControls(controldelay);
	},

	pause: function() {
		// Pause the video
		this.video.pause();
		this.playButton.text('play_arrow');
		this.showControls();
	},

	stop: function() {
		this.video.pause();
		this.subs.destroy();
		this.playButton.text('play_arrow');
		if (!this.noFullScreen)
			setFullScreen(this.cntr[0], false);
		delete this.video.src;
		this.showControls();
	},

	stopped: function() {
		this.stop();
		if (this.stopCb)
			this.stopCb();
	},
};
module.exports = Video;

