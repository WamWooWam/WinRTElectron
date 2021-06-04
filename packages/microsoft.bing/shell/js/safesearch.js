/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='servicelocator.js' />
/// <reference path='env.js' />
/// <reference path="proxy.js />
(function () {
    "use strict";

    var env = BingApp.locator.env;
    var proxy = BingApp.locator.proxy;
    var muid = null;
    var cookieName = "MUID";
    var navigationManager = BingApp.locator.navigationManager;

    function onready() {
        /// <summary>
        /// Called when page is loaded.
        /// </summary>
        WinJS.Resources.processAll();

        // Setup safe search radio button selection
        var currentSetting = env.getSafeSearch();
        var restrictedMarket = env.isMarketRestricted();
        var element = document.querySelector("#" + currentSetting);
        element.checked = true;

        for (var i = 0; i < safesearch.length; i++) {
            if (restrictedMarket && safesearch[i].id !== "STRICT") {
                safesearch[i].parentElement.style.visibility = "hidden";
                continue;
            }

            safesearch[i].onclick = safeSearchChanged;
        }

        var backbuttonElement = document.querySelector("#BACKSETTINGS");
        if (backbuttonElement) {
            backbuttonElement.addEventListener("click", clickhandler, false);
        }

        BingApp.traceInfo("safeSearch.onready: safeSearch opened");
    }

    function safeSearchChanged(e) {
        /// <summary>
        /// Event handler which is called when safe search radio button is clicked.
        /// </summary>
        /// <param name="e">
        /// Click event data.
        /// </param>
        var setting = e.currentTarget.id;
        _onMuidAvailable().done(function (muid) {
            var safeSearchUrl = _getSafeSearchUrl(setting);
            var detail = { url: safeSearchUrl };

            proxy.xhr(detail).done(function (response) {
                if (response.status === 200) {
                    env.setSafeSearch(setting); // save off the current state.
                    navigationManager.refresh(); // refresh the UI
                }
            },
            function (error) {
                BingApp.traceError("safeSearch.safeSearchChanged failed, status:{0}, response:{1}", error.status, error.responseText);
            });
        });
    }

    function _getSafeSearchUrl(setting) {
        /// <summary>
        /// construct the safesearch url with the associated setting.
        /// </summary>
        /// <param name="setting">
        /// Users selected setting.
        /// </param>
        /// <returns>
        /// url for safesearch api call.
        /// </returns>
        if (!setting) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("setting");
        }

        var url = env.configuration["safeSearchUrl"];

        if (!url) {
            BingApp.traceError("safeSearch._getSafeSearchUrl failed to get Url");
            return null;
        }

        // replace placeholders with the values.
        url = BingApp.Utilities.format(url, setting, muid);

        return url;
    }

    function _onMuidAvailable() {
        /// <summary>
        /// returns a WinJS Promise object indicating that MUID is ready.
        /// </summary>
        /// <return>
        /// returns WinJS Promise
        /// </return>
        if (muid) {
            return new WinJS.Promise.as(muid);
        }

        return new WinJS.Promise(
            function init(complete, error) {
                proxy.getCookie(cookieName).done(function (cookie) {
                    if (cookie) {
                        muid = cookie.substring(cookieName.length + 1);
                    }
                    complete(muid);                  
                },
                function (err) {
                    error(err);
                    BingApp.traceError("_onSidAvailable failed :getCookie Error:{0}", err);
                });
            });
    }

    function clickhandler(e) {
        /// <summary>
        /// Click handler for the SafeSearch back button.
        /// </summary>
        /// <param name='e'>
        /// The element that was clicked
        /// </param>
        var currentState = Windows.UI.ViewManagement.ApplicationView.value;
        if (Windows.UI.ViewManagement.ApplicationViewState.snapped === currentState) {
            Windows.UI.ViewManagement.ApplicationView.tryUnsnap();
        }

        e.currentTarget.removeEventListener("click", clickhandler);
            
        try {   
            WinJS.UI.SettingsFlyout.show();
        }
        catch (err) {
            BingApp.traceError("safeSearch.clickhandler failed to show the SettingsFlyout {0}", err.message);
        }

        BingApp.traceInfo("safeSearch.onready: safeSearch closed");
    }

    WinJS.UI.Pages.define("/shell/html/safesearch.html", {
        ready: onready
    });
})();