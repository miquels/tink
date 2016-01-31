/*
 *	samsung.js	Samsung smart TV platform.
 *
 */

var key = require('./keycodes.js');

var samsung = {};

var tvKey;
var widgetAPI;
var pluginAPI;
var Plugin = {};

var Common = global.Common;
if (Common && Common.API && Common.API.Widget) {
	module.exports = samsung;
	tvKey = new Common.API.TVKeyValue();
	widgetAPI = new Common.API.Widget();
	pluginAPI = new Common.API.Plugin();
} else  {
	module.exports = null;
}

var pluginList = {
	pluginObjectAudio:		'SAMSUNG-INFOLINK-AUDIO',
//	pluginObjectTV:			'SAMSUNG-INFOLINK-TV',
	pluginObjectTVMW:		'SAMSUNG-INFOLINK-TVMW',
	pluginObjectNetwork:	'SAMSUNG-INFOLINK-NETWORK',
	pluginObjectNNavi:		'SAMSUNG-INFOLINK-NNAVI',
//	pluginPlayer:			'SAMSUNG-INFOLINK-PLAYER',
//	sefPlayer:				'SAMSUNG-INFOLINK-SEF',
};

function createPlugins() {
	for (var id in pluginList) {
		var clsid = pluginList[id];
		var elem = document.getElementById(id);
		if (elem && elem.nodeName.match(/object/i))
			return;

		console.log('samsung.Plugin create: ' + id + ' ' + clsid);
		elem = document.createElement('object');
		elem.id = id;
		elem.setAttribute('classid', 'clsid:' + clsid);
		elem.setAttribute('style',
			'opacity:0.0;background-color:#000000;width:0px;height:0px;');
		document.body.appendChild(elem);
	}
}

samsung.ready = function() {

	createPlugins();

	// enable platform volume up/down/mute keys.
	document.getElementById('pluginObjectNNavi').SetBannerState(1);

	console.log('unregister ' + tvKey.KEY_VOL_UP);
	pluginAPI.unregistKey(tvKey.KEY_VOL_UP);
	console.log('unregister ' + tvKey.KEY_VOL_DOWN);
	pluginAPI.unregistKey(tvKey.KEY_VOL_DOWN);
	console.log('unregister ' + tvKey.KEY_MUTE);
	pluginAPI.unregistKey(tvKey.KEY_MUTE);
	console.log('unregister ' + tvKey.KEY_PANEL_VOL_UP);
	pluginAPI.unregistKey(tvKey.KEY_PANEL_VOL_UP);
	console.log('unregister ' + tvKey.KEY_PANEL_VOL_DOWN);
	pluginAPI.unregistKey(tvKey.KEY_PANEL_VOL_DOWN);

	// tell TV we're ready.
	if (widgetAPI) {
		widgetAPI.sendReadyEvent();
	}
};

samsung.exit = function() {
	widgetAPI.sendReturnEvent();
};

samsung.mapKey = function(keyCode) {

	switch (keyCode) {
		case tvKey.KEY_RED:
			return key.Red;
		case tvKey.KEY_GREEN:
			return key.Green;
		case tvKey.KEY_YELLOW:
			return key.Yellow;
		case tvKey.KEY_BLUE:
			return key.Blue;
		case tvKey.KEY_RETURN:
		case tvKey.KEY_PANEL_RETURN:
			event.preventDefault();
			return key.Back;
		case tvKey.KEY_PLAY:
			return key.Play;
		case tvKey.KEY_STOP:
			return key.Stop;
		case tvKey.KEY_PAUSE:
			return key.Pause;
		case tvKey.KEY_FF:
		case tvKey.KEY_FF_:
			return key.FastForward;
		case tvKey.KEY_RW:
			return key.FastRewind;
		case tvKey.KEY_VOL_UP:
		case tvKey.KEY_PANEL_VOL_UP:
			return key.VolUp;
		case tvKey.KEY_VOL_DOWN:
		case tvKey.KEY_PANEL_VOL_DOWN:
			return key.VolDown;
		case tvKey.KEY_DOWN:
			return key.Down;
		case tvKey.KEY_UP:
			return key.Up;
		case tvKey.KEY_LEFT:
			return key.Left;
		case tvKey.KEY_RIGHT:
			return key.Right;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			return key.Enter;
		case tvKey.KEY_PANEL_CH_DOWN:
		case tvKey.KEY_CH_DOWN:
			return key.ChannelDown;
		case tvKey.KEY_PANEL_CH_UP:
			return key.ChannelUp;
		case tvKey.KEY_CHLIST:
			return key.ChannelList;
		case tvKey.KEY_KEY_EMANUAL:
			event.preventDefault();
			return key.EManual;
		case tvKey.KEY_EXIT:
			return key.Exit;
		case tvKey.KEY_GUIDE:
			return key.Guide;
		case tvKey.KEY_HOME:
			return key.Home;
		case tvKey.KEY_INFO:
			return key.Info;
		case tvKey.KEY_GUIDE:
			return key.Guide;
		case tvKey.KEY_PANEL_MENU:
		case tvKey.KEY_MENU:
			return key.Menu;
		case tvKey.KEY_MUTE:
			return key.Mute;
		case tvKey.KEY_REC:
			return key.Record;
		case tvKey.KEY_SEARCH:
			return key.Search;
		case tvKey.KEY_SUB_TITLE:
		case tvKey.KEY_SUBTITLE:
			return key.Subtitle;
		case tvKey.KEY_TOOLS:
			return key.Tools;
	}
	return 0;
}

