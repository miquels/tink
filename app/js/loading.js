/*
 *	Show a modal spinner.
 *
 *	CSS from: http://www.designcouch.com/home/why/2013/05/23/dead-simple-pure-css-loading-spinner/
 *
 */

var $ = require('jquery');

var html = '\
	<style scoped>\
	.spinner {\
	  height: 60px;\
	  width: 60px;\
	  margin: 94px auto 0 auto;\
	  position: relative;\
	  -webkit-animation: rotation .6s infinite linear;\
	  -moz-animation: rotation .6s infinite linear;\
	  -o-animation: rotation .6s infinite linear;\
	  animation: rotation .6s infinite linear;\
	  border-left: 6px solid rgba(0, 174, 239, .15);\
	  border-right: 6px solid rgba(0, 174, 239, .15);\
	  border-bottom: 6px solid rgba(0, 174, 239, .15);\
	  border-top: 6px solid rgba(0, 174, 239, .8);\
	  border-radius: 100%;\
	}\
	@-webkit-keyframes rotation {\
	  from {\
	    -webkit-transform: rotate(0deg);\
	  }\
	  to {\
	    -webkit-transform: rotate(359deg);\
	  }\
	}\
	@-moz-keyframes rotation {\
	  from {\
	    -moz-transform: rotate(0deg);\
	  }\
	  to {\
	    -moz-transform: rotate(359deg);\
	  }\
	}\
	@-o-keyframes rotation {\
	  from {\
	    -o-transform: rotate(0deg);\
	  }\
	  to {\
	    -o-transform: rotate(359deg);\
	  }\
	}\
	@keyframes rotation {\
	  from {\
	    transform: rotate(0deg);\
	  }\
	  to {\
	    transform: rotate(359deg);\
	  }\
	}\
	</style>\
	<style>\
	#loading-page {\
		left: 0x;\
		top: 0px;\
		margin: 0;\
		padding: 0;\
		width: 100%;\
		height: 100%;\
		z-index: 100;\
		cursor: wait;\
		background: rgba(0, 0, 0, 0.5);\
	}\
	</style>\
	<div class="spinner"></div>\
';

var spinnerDiv = $('<div>').html(html);
spinnerDiv.attr('id', 'loading-page');
spinnerDiv.hide();
$('body').append(spinnerDiv);

var Loading = {
	show: function(after, max) {
		if (timerId)
			clearTimeout(timerId);
		if (after) {
			timerId = setTimeout(function() {
				Loading.show(0, max);
			}, after);
			return;
		}
		timerId = null;
		if (max)
			timerId = setTimeout(Loading.hide, max);
		spinnerDiv.show();
	},

	hide: function() {
		spinnerDiv.hide();
		timerId = null;
	},
};

module.exports = Loading;

