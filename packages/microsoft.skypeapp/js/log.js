

(function () {
	"use strict";
	var content = function(line) {
		var d = new Date(),
			timeres = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2) + "." + ("00" + d.getMilliseconds()).slice(-3);
		if (line instanceof Object) {
			line = JSON.stringify(line);
		}

		return { timeres: timeres, line: line };
	};

	self.log = function(line) {
		var contentres = content(line);
		///<disable>JS2043.RemoveDebugCode</disable>
		console.info(contentres.timeres + " " + contentres.line);
		///<enable>JS2043.RemoveDebugCode</enable>

		LibWrap.WrSkyLib.log("UI", contentres.line);
	};

	self.warn = function(line) {
		var contentres = content(line);
		///<disable>JS2043.RemoveDebugCode</disable>
		console.warn(contentres.timeres + " " + contentres.line);
		///<enable>JS2043.RemoveDebugCode</enable>

		LibWrap.WrSkyLib.log("UI Warn", contentres.line);
	};
})();