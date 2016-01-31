
var Key = require('../js/keys.js');

function SamsungAudio() {
	this.plugin = document.getElementById("pluginObjectAudio");
	if (!this.plugin)
		return null;
	this.plugin.Open("Audio",1.0,"Audio");
	console.log('SamsungAudio enabled');
	return this;
}
module.exports = SamsungAudio;

SamsungAudio.prototype = {
	constructor:	SamsungAudio,

	setVolume: function(volume) {
		this.plugin.Execute("SetVolume", volume);
	},

	setRelativeVolume: function(delta) {
		this.plugin.Execute("SetVolumeWithKey", delta);
	},

	getVolume: function() {
		return this.plugin.Execute("GetVolume");
	},

	mute: function(enable) {
		this.plugin.Execute("SetUserMute", enable);
	},

	handleKey: function(key) {
		switch(key) {
			case key.VolUp:
				if (this.muteEnabled) {
					this.muteEnabled = false;
					this.mute(this.muteEnabled);
				}
				this.setRelativeVolume(1);
				break;
			case key.VolDown:
				if (this.muteEnabled) {
					this.muteEnabled = false;
					this.mute(this.muteEnabled);
				}
				this.setRelativeVolume(0);
				break;
			case key.Mute:
				this.muteEnabled = !!this.muteEnabled;
				this.mute(this.muteEnabled);
				break;
		}
	},
};

