/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='viewmanagement.js' />
/// <reference path='servicelocator.js' />
/// <reference path="proxy.js />
(function () {
    "use strict";

    var env = BingApp.locator.env;
    var proxy = BingApp.locator.proxy;
    var sid = null;
    var HISTORY_TOGGLE_SETTING = "HISTORY_TOGGLE_PREF";

    /// regular expression pattern, used to interpret the response of the historyHandler API.
    /// "1\s*,\s*1" looks for variation of 1,1 with various proportions of whitespace between the 1 characters.
    /// "1\s*,\s*0" looks for variation of 1,0 with various proportions of whitespace between the 1 and 0 characters.
    var pattern = [{ pattern: "1\s*,\s*1", state: true }, { pattern: "1\s*,\s*0", state: false }];

    function onready() {
        /// <summary>
        /// Ensures the UI components are associated with their corresponding code handlers.
        /// </summary>
        // Localize strings
        WinJS.Resources.processAll();

        // Setup history enabled toggle
        historyEnabled.winControl.checked = isHistoryEnabled();
        historyEnabled.onchange = enableHistoryToggled;

        clearHistoryButton.onclick = clearHistory;
    }
      
    function enableHistoryToggled(e) {
        /// <summary>
        /// user has changed their history setting.
        /// </summary>
        /// <param name="e">notification event</param>
        var enabled = historyEnabled.winControl.checked;
        var setting = enabled ? "toggle_on" : "toggle_off";

        _onSidAvailable().done(function (sid) {
            var historyToggleUrl = env.configuration["omaHistoryUrl"];
            historyToggleUrl = BingApp.Utilities.format(historyToggleUrl, setting, sid, "abc");

            var detail = { url: historyToggleUrl };
            proxy.xhr(detail).done(function (response) {
                if (response && response.status === 200) {
                    _setHistoryToggleSetting(enabled); // save off the state.
                }
            },
            function (error) {
                BingApp.traceError("searchHistory.enableHistoryToggled failed, status{0} response{1}", error.status, error.responseText);
            });
        });
    }

    // TODO: For RTM this code is not needed, we will reintroduce when we support authentication.
    //function currentHistorySetting(complete, error) {
    //    /// <summary>
    //    /// makes an api call to determine users online history setting
    //    /// </summary>
    //    /// <param name="complete">optional callback for success</param>
    //    /// <param name="error">optional callback for error</param>
    //    _onSidAvailable().done(function (sid) {

    //        var omaHistoryQueryUrl = env.configuration["omaHistoryQueryUrl"];
    //        omaHistoryQueryUrl = omaHistoryQueryUrl.replace("{0}", sid).replace("{1}", "abc");

    //        var detail = { url: omaHistoryQueryUrl };

    //        proxy.xhr(detail).done(function (response) {
    //            if (response && response.status === 200) {
    //                if (complete) {
    //                    complete(_onlineHistoryState(response.responseText));
    //                }
    //            }
    //        },
    //        function (err) {
    //            if (err && error) {
    //                error(err);
    //            }
    //            
    //            BingApp.traceError("searchHistory.currentHistorySetting failed status:{0}, response:{1}", err.status, err.responseText);
    //        });
    //    });
    //}

    function isHistoryEnabled() {
        return _getHistoryToggleSetting();
    }

    function clearHistory() {
        /// <summary>
        /// clears the users online search history when available.
        /// </summary>
        _onSidAvailable().done(function (sid) {
            var clearHistoryUrl = env.configuration["omaHistoryUrl"];
            clearHistoryUrl = BingApp.Utilities.format(clearHistoryUrl, "clear", sid, "abc");

            var detail = { url: clearHistoryUrl };

            proxy.xhr(detail).done(function (response) {
                if (response && response.status === 200) {
                    BingApp.traceInfo("searchHistory.clearHistory success, status:{1} response: {1}", response.status, response.reponseText);
                }
            }, 
            function (error) {
                if (error) {
                    BingApp.traceError("searchHistory.clearHistory failed status:{0}, response:{1}", error.status, error.responseText);
                }
            });
        });
    }
           

    /// Check response text and determines online history state.
    function _onlineHistoryState(data) {
        for (var i = 0; i < pattern.length; ++i) {
            var regexp = new RegExp(pattern[i].pattern, "g");
            if (regexp.test(data)) {
                return pattern[i].state;
            }
        }

        return true;
    }

    function _setHistoryToggleSetting(val) {
        if (typeof (val) !== "boolean") {
            // TODO: Get string from rsrc file
            throw BingApp.Classes.ErrorArgument("val", "Invalid historytoggle setting");
        }

        var localSettings = Windows.Storage.ApplicationData.current.localSettings;
        localSettings.values[HISTORY_TOGGLE_SETTING] = val;
    }

    function _getHistoryToggleSetting() {
        var localSettings = Windows.Storage.ApplicationData.current.localSettings;
        var val = localSettings.values[HISTORY_TOGGLE_SETTING];
        if (typeof (val) === "boolean") {
            return val;
        }

        return true;
    }

    function _onSidAvailable() {
        /// <summary>
        /// returns a WinJS Promise object indicating that Sid is ready.
        /// </summary>
        /// <return>
        /// returns WinJS Promise
        /// </return>
        if (sid) {
            return new WinJS.Promise.as(sid);
        }

        return new WinJS.Promise(
            function init(complete, error) {
                proxy.getCookie("_SS", "SID").done(function (cookie) {
                    if (cookie) {
                        sid = cookie;
                        complete(sid);
                    }
                },
                function (err) {
                    error(err);
                    BingApp.traceError("_onSidAvailable failed :getCookie Error:{0}", err);
                });
            });
    }
 
    WinJS.UI.Pages.define("/shell/html/searchhistory.html", {
        ready: onready
    });
})();
