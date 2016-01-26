/*
 *	samsung.js	Samsung smart TV platform.
 *
 */

var key = require('./keycodes.js');

var Common = global.Common;

var samsungWidgetApi;
if (Common && Common.API && Common.API.Widget)
	samsungWidgetApi = new Common.API.Widget();

var samsungKey;
if (Common && Common.API && Common.API.TVKeyValue)
	samsungKey = new Common.API.TVKeyValue();

var samsung = {};

samsung.exit = function() {
	if (samsungWidgetApi) {
		samsungWidgetApi.sendReturnEvent();
	}
};

samsung.ready = function() {
	if (samsungWidgetApi) {
		samsungWidgetApi.sendReadyEvent();
	}
};

samsung.mapKey = function(keyCode) {

	switch (keyCode) {
		case samsungKey.KEY_RED:
			return key.Red;
		case samsungKey.KEY_GREEN:
			return key.Green;
		case samsungKey.KEY_YELLOW:
			return key.Yellow;
		case samsungKey.KEY_BLUE:
			return key.Blue;
		case samsungKey.KEY_RETURN:
		case samsungKey.KEY_PANEL_RETURN:
			event.preventDefault();
			return key.Back;
		case samsungKey.KEY_PLAY:
			return key.Play;
		case samsungKey.KEY_STOP:
			return key.Stop;
		case samsungKey.KEY_PAUSE:
			return key.Pause;
		case samsungKey.KEY_FF:
		case samsungKey.KEY_FF_:
			return key.FastForward;
		case samsungKey.KEY_RW:
			return key.FastRewind;
		case samsungKey.KEY_VOL_UP:
		case samsungKey.KEY_PANEL_VOL_UP:
			return key.VolUp;
		case samsungKey.KEY_VOL_DOWN:
		case samsungKey.KEY_PANEL_VOL_DOWN:
			return key.VolDown;
		case samsungKey.KEY_DOWN:
			return key.Down;
		case samsungKey.KEY_UP:
			return key.Up;
		case samsungKey.KEY_LEFT:
			return key.Left;
		case samsungKey.KEY_RIGHT:
			return key.Right;
		case samsungKey.KEY_ENTER:
		case samsungKey.KEY_PANEL_ENTER:
			return key.Enter;
		case samsungKey.KEY_PANEL_CH_DOWN:
		case samsungKey.KEY_CH_DOWN:
			return key.ChannelDown;
		case samsungKey.KEY_PANEL_CH_UP:
			return key.ChannelUp;
		case samsungKey.KEY_CHLIST:
			return key.ChannelList;
		case samsungKey.KEY_KEY_EMANUAL:
			event.preventDefault();
			return key.EManual;
		case samsungKey.KEY_EXIT:
			return key.Exit;
		case samsungKey.KEY_GUIDE:
			return key.Guide;
		case samsungKey.KEY_HOME:
			return key.Home;
		case samsungKey.KEY_INFO:
			return key.Info;
		case samsungKey.KEY_GUIDE:
			return key.Guide;
		case samsungKey.KEY_PANEL_MENU:
		case samsungKey.KEY_MENU:
			return key.Menu;
		case samsungKey.KEY_MUTE:
			return key.Mute;
		case samsungKey.KEY_REC:
			return key.Record;
		case samsungKey.KEY_SEARCH:
			return key.Search;
		case samsungKey.KEY_SUB_TITLE:
		case samsungKey.KEY_SUBTITLE:
			return key.Subtitle;
		case samsungKey.KEY_TOOLS:
			return key.Tools;
	}
	return inkey;
}

if (samsungKey && samsungWidgetApi) {
	module.exports = samsung;
} else  {
	module.exports = null;
}

