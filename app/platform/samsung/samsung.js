/*
 *	samsung.js	Samsung smart TV platform.
 *
 */

var Key		= require('../keycodes.js'),
	Video	= require('./video.js');

var tvKey;
var widgetAPI;
var pluginAPI;
var Plugin = {};

// list of plugin objects.
var pluginList = {
	pluginObjectAudio:		'SAMSUNG-INFOLINK-AUDIO',
	pluginObjectTV:			'SAMSUNG-INFOLINK-TV',
	pluginObjectTVMW:		'SAMSUNG-INFOLINK-TVMW',
	pluginObjectNetwork:	'SAMSUNG-INFOLINK-NETWORK',
	pluginObjectNNavi:		'SAMSUNG-INFOLINK-NNAVI',
//	pluginPlayer:			'SAMSUNG-INFOLINK-PLAYER',
//	sefPlayer:				'SAMSUNG-INFOLINK-SEF',
};

// list of scripts we need to load.
var scriptList = [
	'$MANAGER_WIDGET/Common/API/Plugin.js',
	'$MANAGER_WIDGET/Common/API/Widget.js',
	'$MANAGER_WIDGET/Common/API/TVKeyValue.js',
	'$MANAGER_WIDGET/Common/webapi/1.0/webapis.js',
];

var cssList = [
	'build/samsungtv.css'
];

// load objects and scripts.
function samsungInit() {
	// plugins
	for (var id in pluginList) {
		var o = document.createElement('object');
		o.setAttribute('id', id);
		o.setAttribute('classid', 'clsid:' + pluginList[id]);
		o.style.position = 'absolute';
		o.style.left = 0;
		o.style.right = 0;
		o.style.top = 0;
		o.style.bottom = 0;
		document.body.appendChild(o);
		Plugin[id] = o;
	}
	// css
	for (var c in cssList) {
		var l = document.createElement('link');
		l.setAttribute('rel', 'stylesheet');
		l.setAttribute('type', 'text/css');
		l.setAttribute('href', cssList[c]);
		document.body.appendChild(l);
	}
	// scripts
	for (var idx in scriptList) {
		var s = document.createElement('script');
		s.src = scriptList[idx];
		document.body.appendChild(s);
	}
}

// window.onShow() is samsung specific, and runs after plugins are ready.
function onShow() {
	console.log('samsung.onShow');

	// enable native volume controls.
	Plugin.pluginObjectNNavi.SetBannerState(1);
	pluginAPI.unregistKey(tvKey.KEY_VOL_UP);
	pluginAPI.unregistKey(tvKey.KEY_VOL_DOWN);
	pluginAPI.unregistKey(tvKey.KEY_MUTE);
	pluginAPI.unregistKey(tvKey.KEY_PANEL_VOL_UP);
	pluginAPI.unregistKey(tvKey.KEY_PANEL_VOL_DOWN);
};

var samsung = {

	disableConsole: function() {
		// detect emulator by mac address.
		if (samsung.macAddress.match(/^080027/))
			return;

		// detect jsconsole by missing functions.
		if (!console.count && !console.trace && !console.markTimeline)
			return;

		// actual TV, disable console.
		window.console = {
			debug: function() { },
			dir: function() { },
			echo: function() { },
			error: function() { },
			info: function() { },
			log: function() { },
			time: function() { },
			timeEnd: function() { },
			warn: function() { }
		};
		window.alert = function() { };
	},

	// called by main() when everything has loaded.
	ready: function() {
		console.log('samsung.ready');

		var Common = global.Common;
		tvKey = new Common.API.TVKeyValue();
		widgetAPI = new Common.API.Widget();
		pluginAPI = new Common.API.Plugin();

		samsung.tvKey = tvKey;
		samsung.plugin = Plugin;
		samsung.widgetAPI = widgetAPI;
		samsung.pluginAPI = pluginAPI;

		window.onShow = onShow;

		samsung.disableConsole();

		// tell TV we're ready.
		widgetAPI.sendReadyEvent();
	},

	// exit the app.
	exit: function() {
		widgetAPI.sendReturnEvent();
	},

	// video
	videoObject: function(opts) {
		return new Video({ el: opts.el });
	},

	videoElement: function(attrs) {
		var el = document.createElement('div');
		for (var a in attrs)
			el.setAttribute(a, attrs[a]);
		return el;
	},

	// like a TV? (UI controlled by a simple remote)
	get tvLike() {
		return true;
	},

	get standalone() {
		return true;
	},

	get canFullScreen() {
		return false;
	},

	isFullScreen: function() {
		return true;
	},

	get macAddress() {
		return Plugin.pluginObjectNetwork.GetMAC();
	},
	get ipAddress() {
		var network = Plugin.pluginObjectNetwork;
		return network.GetIP(network.GetActiveType());  
	},

	// duid / modelcode / firmware / systemVersion / productCode
	// no use for them yet, but you never know.
	get duid() {
		return Plugin.pluginObjectNNavi.GetDUID(samsung.macAddress);
	},
	get modelCode() {
		return Plugin.pluginObjectNNAVI.GetModelCode();
	},
	get firmware() {
		return Plugin.pluginObjectNNAVI.GetFirmware();
	},
	get systemVersion() {
		return Plugin.pluginObjectNNAVI.GetSystemVersion(0);
	},
	get productCode() {
		return Plugin.pluginObjectTV.GetProductCode(1);
	},

	// map key.
	mapKey: function(keyCode) {

		switch (keyCode) {
			case tvKey.KEY_RED:
				return Key.Red;
			case tvKey.KEY_GREEN:
				return Key.Green;
			case tvKey.KEY_YELLOW:
				return Key.Yellow;
			case tvKey.KEY_BLUE:
				return Key.Blue;
			case tvKey.KEY_RETURN:
			case tvKey.KEY_PANEL_RETURN:
				event.preventDefault();
				return Key.Back;
			case tvKey.KEY_PLAY:
				return Key.Play;
			case tvKey.KEY_STOP:
				return Key.Stop;
			case tvKey.KEY_PAUSE:
				return Key.Pause;
			case tvKey.KEY_FF:
			case tvKey.KEY_FF_:
				return Key.FastForward;
			case tvKey.KEY_RW:
				return Key.FastRewind;
			case tvKey.KEY_VOL_UP:
			case tvKey.KEY_PANEL_VOL_UP:
				return Key.VolUp;
			case tvKey.KEY_VOL_DOWN:
			case tvKey.KEY_PANEL_VOL_DOWN:
				return Key.VolDown;
			case tvKey.KEY_DOWN:
				return Key.Down;
			case tvKey.KEY_UP:
				return Key.Up;
			case tvKey.KEY_LEFT:
				return Key.Left;
			case tvKey.KEY_RIGHT:
				return Key.Right;
			case tvKey.KEY_ENTER:
			case tvKey.KEY_PANEL_ENTER:
				return Key.Enter;
			case tvKey.KEY_PANEL_CH_DOWN:
			case tvKey.KEY_CH_DOWN:
				return Key.ChannelDown;
			case tvKey.KEY_PANEL_CH_UP:
				return Key.ChannelUp;
			case tvKey.KEY_CHLIST:
				return Key.ChannelList;
			case tvKey.KEY_KEY_EMANUAL:
				event.preventDefault();
				return Key.EManual;
			case tvKey.KEY_EXIT:
				return Key.Exit;
			case tvKey.KEY_GUIDE:
				return Key.Guide;
			case tvKey.KEY_HOME:
				return Key.Home;
			case tvKey.KEY_INFO:
				return Key.Info;
			case tvKey.KEY_GUIDE:
				return Key.Guide;
			case tvKey.KEY_PANEL_MENU:
			case tvKey.KEY_MENU:
				return Key.Menu;
			case tvKey.KEY_MUTE:
				return Key.Mute;
			case tvKey.KEY_REC:
				return Key.Record;
			case tvKey.KEY_SEARCH:
				return Key.Search;
			case tvKey.KEY_SUB_TITLE:
			case tvKey.KEY_SUBTITLE:
				return Key.Subtitle;
			case tvKey.KEY_TOOLS:
				return Key.Tools;
		}
		return 0;
	},
};

if (navigator.userAgent.match(/SmartHub/) &&
	navigator.userAgent.match(/SmartTV/)) {
	module.exports = samsung;
	samsungInit();
} else  {
	module.exports = null;
}

