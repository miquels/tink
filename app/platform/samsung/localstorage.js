/*
 *	Samsung TV localstorage polyfill.
 */

if (window.localStorage == null && window.FileSystem) {

	// globals.
	var curWidget = window.curWidget;
	var FileSystem = window.FileSystem;

	var FS = new FileSystem();
	var fileName = curWidget.id + "_localStorage.db";
	var changed = false;
	var timerId = null;

	var flushDelay = 200;
	var data = Object.create(null);

	var localStorage = {

		_init: function() {
			// create app directory.
			if (!FS.isValidCommonPath(curWidget.id))
				FS.createCommonDir(curWidget.id);

			// read "database"
			var fileObj = FS.openCommonFile(fileName, "r+");
			if (fileObj) {
				var content = fileObj.readAll();
				FS.closeCommonFile(fileObj);
				try {
					var obj = JSON.parse(content);
					for (var k in obj)
						data[k] = obj[k];
				} catch (e) {
					// botched.
					data = Object.create(null);
					fileObj = FS.openCommonFile(fileName, "w");
					if (fileObj)
						fileObj.writeAll("{}");
					FS.closeCommonFile(fileObj);
				}
			}
		},

		// save data to disk.
		_save: function() {
			timerId = null;
			var file = FS.openCommonFile(fileName, "w");
			file.writeAll(JSON.stringify(data));
			FS.closeCommonFile(file);
			changed = false;
		},

		// save data to disk, might delay a bit.
		_flush: function(sync) {
			if (!changed)
				return;
			if (timerId != null) {
				clearTimer(timerId);
				timerId = null;
			}
			if (sync)
				localStorage._save();
			else
				timerId = setTimer(localStorage.save, flushDelay);
		},

		// force data to disk.
		flush: function() {
			localStorage._flush(true);
		},

		setItem: function(key, value) {
				data[key] = value;
				changed = true;
				localStorage._flush();
				return value;
		},

		getItem: function (key) {
				return data[key];
		},

		removeItem: function (key) {
			delete data[key];
			changed = true;
			localStorage._flush();
		},

		clear: function() {
			data = Object.create(null);
			changed = true;
			localStorage._flush();
		},
	};

	localStorage._init();
	window.localStorage = localStorage;
}

