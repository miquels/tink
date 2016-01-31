/*
 * samsungvideo.js	minimal HTML5 video element emulation using the
 *					native samsung player.
 */

//
// pass 'el: element' (DOM element) to constructor.
//
function SamsungVideo(opts) {
    this.state = -1;

	var el = opts.el || opts.element;
	this.el = el;
	this.element = el;
	this.width = el.offsetWidth;
	this.height = el.offsetHeight;
	console.log('XXX construct el is', el, 'wxh', this.width, this.height, 'id', el.id);

	return this;
}
if (global.webapis && global.webapis.avplay) {
	module.exports = SamsungVideo;
} else {
	module.exports = null;
}

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
	loading:		false,
	duration:		0,
	url:			null,
	buffering:		false,

	get currentTime() {
		return this.curTime;
	},

	set currentTime(tm) {
		this.skip(tm - this.curTime);
		this.curTime = tm;
	},

	get paused() {
		return this.state == PAUSED;
	},

	pause: function() {
		if (this.state == PLAYING) {
			this.AVPlayer.pause();
			this.state = PAUSED;
			console.log('XXX pause this.el is', this.el);
			this.el.dispatchEvent(new Event('pause'));
		}
	},

	play: function() {
		if (this.state == PAUSED) {
			this.AVPlayer.resume();
			this.state = PLAYING;
			console.log('XXX play this.el is', this.el);
			this.el.dispatchEvent(new Event('play'));
			this.el.dispatchEvent(new Event('playing'));
			return;
		}
		var startTime = this.curTime;
        this.AVPlayer.play(
			() => {
				this.state = PLAYING;
				console.log('play2 XXX this.el is', this.el);
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
			console.log('XXX stop this.el is', this.el);
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
				console.log('global.webapis.avplay is ', avplay);
				console.log('calling getAVPlay ');
				avplay.getAVPlay(this.onAVPlayObtained.bind(this), () => {
					console.log('SamsungVideo: getAVPlay: error');
				});
				console.log('done calling getAVPlay ');
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
			console.log('XXX set src, open this.el is', this.el);
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
		console.log('skip ' + secs);
		if (this.state == PLAYING || this.state == PAUSED) {
			if (secs > 0)
				this.AVPlayer.jumpForward(secs);
			if (secs < 0)
				this.AVPlayer.jumpBackward(secs);
		}
	},

	 bufferingCB: function() {
		return {
			onbufferingstart: () => {
				this.buffering = true;
				if (this.loading) {
					this.duration = this.AVPlayer.getDuration() / 1000;
					console.log('XXX onbufferingstart (loading) this.duration is', this.duration);
					this.el.dispatchEvent(new Event('loadedmetadata'));
				}
				console.log('XXX onbufferingstart this.el is', this.el);
				this.el.dispatchEvent(new Event('waiting'));
			},
			onbufferingprogress: (percent) => {
				this.buffering = true;
				console.log('XXX onbufferingprogress this.el is', this.el);
				this.el.dispatchEvent(new Event('waiting'));
			},
			onbufferingcomplete: (percent) => {
				this.buffering = false;
				if (this.loading) {
					console.log('XXX onbufferingcomplete (loading) this.el is', this.el);
					this.el.dispatchEvent(new Event('loadeddata'));
					this.el.dispatchEvent(new Event('canplay'));
					this.el.dispatchEvent(new Event('canplaythrough'));
					this.loading = false;
				}
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
				console.log('XXX onstreamcompleted this.el is', this.el);
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
		console.log('XXX onAVPlayObtained avplay is now', avplay, 'containerid', this.el.id);

		var zindex = this.el.style['z-index'];
		console.log('zindex is', zindex);
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

