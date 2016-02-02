/*
 * samsungvideo.js	HTML5 video element emulation using the
 *					native samsung player.
 */

//
// pass 'el: element' (DOM element) to constructor.
//
function SamsungVideo(opts) {

	var el = opts.el || opts.element;
	this.el = el;
	this.element = el;
	this.width = el.offsetWidth;
	this.height = el.offsetHeight;

    this.state = -1;
	this.audio = document.getElementById("pluginObjectAudio");

	return this;
}
module.exports = SamsungVideo;

var	UNKNOWN = -1;
var	STOPPED = 0;
var	PLAYING = 1;
var	PAUSED  = 2;

SamsungVideo.prototype = {
	constructor:	SamsungVideo,

	textTracks:		[],
	AVPlayer :		{},
	state:			UNKNOWN,
	curTime:		0,
	seekTime:		null,
	loading:		false,
	duration:		0,
	url:			null,
	buffering:		false,

	get currentTime() {
		return this.curTime;
	},

	set currentTime(tm) {
		console.log('XXX set currentTime skip to '+ (tm - this.curTime));
		var delta = tm - this.curTime;
		this.skip(delta);
	},

	get paused() {
		return this.state == PAUSED;
	},

	get volume() {
		return this.audio ? this.audio.GetVolume() / 100 : 0.2;
	},

	set volume(v) {
		if (this.audio == null)
			return;
		console.log('XXX SamsungVideo.setvolume' + v);
		v = parseInt((v * 100) + 0.5);
		if (v > 100) v = 100;
		if (v < 0) v = 0;
		var vol = this.audio.GetVolume();
		if (vol < v) {
			while (this.audio.GetVolume() < v)
				this.audio.SetVolumeWithKey(0);
			this.el.dispatchEvent(new Event('volumechange'));
			return;
		}
		if (vol > v) {
			while (this.audio.GetVolume() > v)
				this.audio.SetVolumeWithKey(1);
			this.el.dispatchEvent(new Event('volumechange'));
			return;
		}
	},

	get muted() {
		return this.audio ? this.audio.GetUserMute() == 1 : false;
	},

	set muted(mute) {
		if (this.audio)
			this.audio.SetUserMute(mute ? 1 : 0);
		this.el.dispatchEvent(new Event('volumechange'));
	},

	pause: function() {
		if (this.state == PLAYING) {
			this.AVPlayer.pause();
			this.state = PAUSED;
			console.log('XXX SamsungVideo.pause');
			this.el.dispatchEvent(new Event('pause'));
		}
	},

	play: function() {
		if (this.state == PAUSED) {
			this.AVPlayer.resume();
			this.state = PLAYING;
			console.log('XXX SamsungVideo.play');
			this.el.dispatchEvent(new Event('play'));
			this.el.dispatchEvent(new Event('playing'));
			return;
		}
		var startTime = this.curTime;
        this.AVPlayer.play(
			() => {
				this.state = PLAYING;
				this.el.dispatchEvent(new Event('playing'));
			},
			() => {
				this.state = UNKNOWN;
			},
			startTime
		);
	},

	stop: function() {
		if (this.state != STOPPED && this.state != UNKNOWN) {
			this.state = STOPPED;
			this.AVPlayer.stop();
			console.log('XXX SamsungVideo.stop');
			this.el.dispatchEvent(new Event('ended'));
		}
	},

	get src() {
		return this.url;
	},

	set src(url) {

		// reset state.
		delete this.state;
		delete this.curTime;
		delete this.seekTime;
		delete this.duration;
		delete this.loading;
		delete this.buffering;
		if (this.AVPlayer.stop)
			this.AVPlayer.stop();

		this.url = url;
		if (url == null || url == "") {
			return url;
		}

		if (!this.AVPlayer.open) {
			// get a fresh AVPlay object if needed.
			try {
				var avplay = global.webapis.avplay;
				avplay.getAVPlay(this.onAVPlayObtained.bind(this), () => {
					console.log('SamsungVideo: getAVPlay: error');
				});
			} catch(e) {
				console.log('SamsungVideo: getAVPlay:' + e.message);
				return null;
			}
		} else {
			// just re-init.
			this.onAVPlayObtained(this.AVPlayer);
		}

		// and open the URL.
        try {
        	this.AVPlayer.open(this.url);
			this.loading = true;
			console.log('XXX SamsungVideo.set src()');
			this.el.dispatchEvent(new Event('loadstart'));
		} catch(e) {
			console.log('AVPlayer.open ' + url + ' failed: ' + e.message);
			this.loading = false;
			this.url = null;
		}
		return this.url;
	},

	// non-standard.
	skip: function(secs) {
		console.log('XXX SamsungVideo.skip ' + secs);
		if (this.state == PLAYING || this.state == PAUSED) {
			if (this.state == PAUSED)
				this.AVPlayer.resume();
			if (secs > 0)
				this.AVPlayer.jumpForward(secs);
			if (secs < 0)
				this.AVPlayer.jumpBackward(0 - secs);
			if (this.state == PAUSED)
				this.AVPlayer.pause();
		}
	},

	 bufferingCB: function() {
		return {
			onbufferingstart: () => {
				this.buffering = true;
				if (this.loading) {
					this.duration = this.AVPlayer.getDuration() / 1000;
					console.log('XXX SamsungVideo.onbufferingstart (loading)');
					this.el.dispatchEvent(new Event('loadedmetadata'));
				}
				console.log('XXX SamsungVideo.onbufferingstart');
				this.el.dispatchEvent(new Event('waiting'));
			},
			onbufferingprogress: (percent) => {
				this.buffering = true;
				console.log('XXX SamsungVideo.onbufferingprogress');
				this.el.dispatchEvent(new Event('waiting'));
			},
			onbufferingcomplete: () => {
				this.buffering = false;
				if (this.loading) {
					console.log('XXX SamsungVideo.onbufferingcomplete (loading)');
					this.el.dispatchEvent(new Event('loadeddata'));
					this.el.dispatchEvent(new Event('canplay'));
					this.el.dispatchEvent(new Event('canplaythrough'));
					this.loading = false;
				}
				console.log('XXX SamsungVideo.onbufferingcomplete');
			},
		};
	},

	playCB: function() {
		return {
			oncurrentplaytime: (time) => {
				this.curTime = time.millisecond / 1000;
				this.el.dispatchEvent(new Event('timeupdate'));
			},
			onresolutionchanged: (width, height) => {
				//console.log("resolution changed:", width, ",", height);
			},
			onstreamcompleted: () => {
				this.AVPlayer.stop();
				this.state = STOPPED;
				console.log('XXX SamsungVideo.onstreamcompleted');
				this.el.dispatchEvent(new Event('ended'));
			},
			onerror: () => {
				//console.log("AVPlay: error playing: ' + error.name);
			},
		};
	},

	// plugin loaded, initialize the rest.
	onAVPlayObtained: function(avplay) {

		this.AVPlayer = avplay;

		var zindex = this.el.style['z-index'];
		console.log('SamsungVideo.onAVPlayObtained zindex is' + zindex);
		if (zindex == null)
			zindex  = 0;
		else
			zindex = parseInt(zindex);

		this.state = UNKNOWN;
		var bufferingCB = this.bufferingCB();
		var playCB = this.playCB();

		this.AVPlayer.init({
			//containerID : this.id,
			//containerID : this.el.id,
			containerID : 'video-container',
			bufferingCallback : bufferingCB,
			playCallback : playCB,
			displayRect: {
				top: 0,
				left: 0,
				width: 960,
				height: 540
			},
			autoRatio: true, 
			zIndex: zindex,
			onstreamcompleted: playCB.onstreamcompleted,
			onerror: (error) => playCB.onerror,
		});
		this.AVPlayer.setSpeed(1);
    },
};

