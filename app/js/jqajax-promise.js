
var $	= require('jquery');

class AjaxError extends Error {
	constructor(jqXHR, textStatus, errorThrown) {
		super(textStatus);
		this.name = 'AjaxError';
		this.jqXHR = jqXHR;
		this.errorThrown = errorThrown;
	}
}

export default function jqAjaxPromise(...args) {
	var jqXHR = $.ajax(...args);
	return new Promise(function(resolve, reject) {
		jqXHR
		.then((data, textStatus, jqXHR) => {
			resolve({
					data:		data,
					jqXHR:		jqXHR,
					textStatus:	textStatus,
			});
		})
		.fail((j, t, e) => reject(new AjaxError(j, t, e)));
	});
}

