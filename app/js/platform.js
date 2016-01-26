/*
 *	platform.js	Abstract out latform specific functions.
 *
 */

var Common = global.Common;
var sf = global.sf;

var samsungWidgetApi;
if (Common && Common.API && Common.API.Widget)
	samsungWidgetApi = new Common.API.Widget();

var samsungKey;
if (Common && Common.API && Common.API.TVKeyValue)
	samsungKey = new Common.API.TVKeyValue();

var samsungPreventDefault;
if (sf && sf.key)
	samsungPreventDefault = sf.key.preventDefault;

exports.samsungKey = samsungKey;
exports.samsungPreventDefault = samsungPreventDefault;

exports.exit = function() {
	if (samsungWidgetApi) {
		samsungWidgetApi.sendReturnEvent();
	}
};

exports.ready = function() {
	if (samsungWidgetApi) {
		samsungWidgetApi.sendReadyEvent();
	}
};

