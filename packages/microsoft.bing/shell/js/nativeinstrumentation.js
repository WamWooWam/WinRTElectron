/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='servicelocator.js' />
/// <reference path='navigationjs' />
(function () {
    "use strict";

    var env = BingApp.locator.env;
    var xlsUrl = null;
    var muid = null;
    var cookieName = "MUID";
    var igUrl = null;
    var proxy = BingApp.locator.proxy;
    var lastInstrumentationEventTS = null;
    var activationFormCodeSent = false;
    var oemId = null; // oem product code which is appended to querystring.
    var checkedOemId = false;

    // When proxy is ready get the MUID
    _initializeMuid().done(
        function (muid) {
            if (muid) {
                BingApp.traceInfo("BingApp.Instrumentation._initializeMuid: success");
            }
        },
        function (err) {
            BingApp.traceError("BingApp.Instrumentation._initializeMuid failure: {0}", err.message);
        });

    var navigationManager = BingApp.locator.navigationManager;
    var pageIGs = []; // map of pagename impression

    var patternsPage = [
        { pattern: "//app/home", pageName: "start" },
        { pattern: "//app/start", pageName: "start" },
        { pattern: "//app/search", pageName: "serp" },
        { pattern: "//app/images/grid", pageName: "images" }
    ];

    /// <summary>
    /// State used by the Instrumentation abstraction.
    /// </summary>
    var state = Object.freeze({
        ready: "ready",
        requestPending: "requestPending",
        error: "error",
        expired: "expired",
        requireRefresh: "requireRefresh"
    });

    var regexps = patternsPage.map(function (p) { return new RegExp(p.pattern, "g") });

    var ts = BingApp.Utilities.getTimeStamp;

    // Expose a logClick function for consumers
    function logClick(data) {
        /// <summary>
        /// exposes a method for consumers to log instrumentation click data.
        /// Event will be of type Cl.ClickEvent
        /// </summary>
        /// <param name="data">
        /// A JSON object containing the data to be logged via instrumention.
        /// </param>
        log(data, BingApp.Instrumentation.clickEvent);
    }

    // Expose the log function for consumers 
    function log(data, type) {
        /// <summary>
        /// exposes a method for consumers to log instrumentation data.
        /// </summary>
        /// <param name="data">
        /// A JSON object containing the data to be logged via instrumention.
        /// </param>
        /// <param name="type">
        /// The type of Event to log, can't be null.
        /// </param>
        if (!data) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("data");
        }

        if (!type) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("type");
        }

        // ensure that all our state information is well formed then fire instrumentation.
        _initializeMuid().done(
            function (muid) {
                // ensure that the Impression guid is ready.
                _onready().done(
                    function (igInfo) {

                        var xlsUrl = env.configuration["xlsLoggingUrl"];
                        if (!xlsUrl) {
                            BingApp.traceError("BingApp.Instrumentation failure, xlsUrl");
                            return null;
                        }

                        var xlsPayLoad = _createXMLPayLoad(data, type, igInfo.ig, igInfo.pageName);
                        if (!xlsPayLoad) {
                            BingApp.traceError("BingApp.Instrumentation.log failed: _createXMLPayLoad");
                        }

                        var detail = { url: xlsUrl, type: 'POST', data: xlsPayLoad };
                        proxy.xhr(detail).done(
                            function (response) {
                                if (response) {
                                    BingApp.traceInfo("instrumentation.log  success, status:{1} response: {1}", response.status, response.reponseText);
                                    lastInstrumentationEventTS = ts();
                                }
                            },
                            function (error) {
                                if (error) {
                                    BingApp.traceError("BingApp.Instrumentation.log failed status:{0}, response:{1}", error.status, error.responseText);
                                }
                            });
                    },
                    function (err) {
                        BingApp.traceError("BingApp.Instrumentation.log failed: {0}", err.message);
                    });
            },
            function (error) {
                BingApp.traceError("BingApp.Instrumentation.log failed: {0}", error);
            });
    }

    function resumeLogging() {
        /// <summary>
        /// upon resume, reset instrumentation as necessary.
        /// </summary>
        var currentTS = ts();
        var refreshInterval = env.configuration["resumeRefreshInterval"];
        if (!lastInstrumentationEventTS || (currentTS - lastInstrumentationEventTS > refreshInterval)) {
            pageIGs = []; // reset all the IG state, will be populated on next instrumentation events.
        }
    }

    function refresh(complete, error) {
        /// <summary>
        /// Refresh the impression guid for instrumentation.
        /// </summary>
        /// <param name="complete">
        /// Callback function to be called once impression guid is refreshed.
        /// </param>
        /// <param name="error">
        /// Callback function to be called if impression guid failed to be refreshed.
        /// </param>
        var pageName = _getPageName();

        if (!pageName) {
            error(new WinJS.ErrorFromName("BingApp.Instrumentation.RefreshError", "Current page is invalid."));
            return;
        }

        _refreshImpression(pageName, complete, error);
    }

    function updatePageIG(ig) {
        /// <summary>
        /// Refresh the impression guid for currently loaded view.
        /// </summary>
        /// <param name="ig">
        /// impression guid to use for native events.
        /// </param>
        var pageName = _getPageName();
        if (pageName) {
            if (ig) {
                // simply update the ig for the page.
                pageIGs[pageName] = _makeIgInfo(pageName, ig, ts(), BingApp.Instrumentation.State.ready);
            }
            else {
                var igInfo = getCurrentIGInfoForPage(pageName);
                if (igInfo && (igInfo.state !== BingApp.Instrumentation.State.requestPending)) {
                    // if there is a existing IG associated with the page, and ig passed in is null, then we set state to requireRefresh unless 
                    // we are in a requestPending state - which means it is currently being updated. Setting to requireRefresh will force an IG refresh 
                    // on the next instrumentation event. If igInfo is null, do nothing, because it will be created for the first instrumentation event on this page.
                    igInfo.state = BingApp.Instrumentation.State.requireRefresh;           
                }
            }

            _fireUpdateIG(); // valid pageName fire the message.
        }
    }

    function clear() {
        /// <summary>
        /// clears the existing state of the instrumentation object.
        /// </summary>
        muid = null;
        lastInstrumentationEventTS = null;
        pageIGs = [];
        activationFormCodeSent = false;
    }

    function getCurrentIGInfoForPage(pageName) {
        /// <summary>
        /// Return current IGInfo object for a named page.
        /// </summary>
        /// <returns>
        /// IgInfo object
        /// </returns>
        if (pageName) {
            return pageIGs[pageName];
        }

        return null;
    }

    function getIGForPage(pageName) {
        /// <summary>
        /// Returns IG promise for the provided pageName. 
        /// </summary>
        /// <param>
        /// pageName
        /// </param>
        /// <returns>
        /// WinJS.Promise to the current IG of the page specified.
        /// </returns>
        return _getCurrentIG(pageName);
    }

    function getIGForCurrentPage() {
        /// <summary>
        /// Returns IG Promise of current view.
        /// </summary>
        /// <returns>
        /// WinJS.Promise to the current view IG.
        /// </returns>
        return _getCurrentIG();
    }

    function _getCurrentIG(page) {
        /// <summary>
        /// Returns IG Promise
        /// </summary>
        /// <returns>
        /// <param>
        /// pageName - optional
        /// </param>
        /// WinJS.Promise to the current view IG, or the specified page.
        /// </returns>
        var pageName = page || _getPageName();
        var igInfo = getCurrentIGInfoForPage(pageName);
        if (igInfo && igInfo.state === BingApp.Instrumentation.State.ready) {
            return WinJS.Promise.as(igInfo.ig);
        }

        return new WinJS.Promise(
            function init(complete, error) {
                if (!_isPageValidForIGRefresh(pageName)) { // only make requests for start page.
                    BingApp.traceError("BingApp.Instrumentation.getCurrentIG failed : Invalid pageName {0}", pageName);
                    error(new WinJS.ErrorFromName("BingApp.Instrumentation.Error", "Invalid pageName."));
                }
                else {
                    _onready().done(
                        function (igInfo) {
                            complete(igInfo.ig);
                        },
                        function (err) {
                            BingApp.traceError("BingApp.Instrumentation.getCurrentIG failed: {0}", err.message);
                            error(err);
                        });
                }
            });
    }

    function _refreshImpression(pageName, complete, error) {
        /// <summary>
        /// gets an impression guid for instrumentation.
        /// </summary>
        /// <param name="pageName">
        /// pagename of the view.
        /// </param>
        /// <param name="complete">
        /// Callback function to be called once impression guid is refreshed.
        /// </param>
        /// <param name="error">
        /// Callback function to be called if impression guid failed to be refreshed.
        /// </param>
        if (!pageName) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("pageName");
        }

        if (!complete) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("complete");
        }

        if (!error) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("error");
        }

        if (!_isPageValidForIGRefresh(pageName)) {
            return; // start page is the only page that we can refresh currently.
        }

        env.configurationReady().done(function () {
            var igUrl = env.configuration["igUrl"];
            igUrl = BingApp.Utilities.format(igUrl, pageName, BingApp.Classes.Shell.fullVersion);

            if (!activationFormCodeSent && BingApp.Classes.Shell.lastActivationFormCode) {
                // append the form code to indicate how the application was launched.
                activationFormCodeSent = true;
                igUrl += "&form=" + BingApp.Classes.Shell.lastActivationFormCode;
            }

            // Check if we have a OEM value to append the call, this is done once on first attempt.
            if (!checkedOemId) {
                var oemFound = /&PC=\w+\b/m.exec(env.getQueryStringWithIFrameParams("", window));
                if (oemFound && oemFound.length > 0) {
                    oemId = oemFound[0];
                }
                checkedOemId = true;
            }

            // append oemId if necessary
            if (oemId) {
                igUrl += oemId;
            }

            var detail = { url: igUrl };
           
            proxy.xhr(detail).done(
                function (response) {
                    if (response.status === 200) {
                        var data = null;
                        try {
                            /// Expected response is JSON string, however when attaching inst studio, extra html commentary is added to the response. 
                            /// HTML comment is appended to the response, thereby invalidating the expected JSON response.
                            /// So we first check the response for the beginning of the comment - if found we extract the data from the start of 
                            /// reponseText to the beginning of the added "<!--". We attempt to parse the extracted data. If is throws fine, because
                            /// this response can't be trusted. And unknown to this version of the client.
                            /// In the case where we don't have a "Inst Studio appended comment" we again simply try to parse the text, again if it
                            /// throws we handle it with the exception handler. This fine because we weren't expecting this response.
                            var inststudioattached = response.responseText.indexOf("<!--");
                            if (inststudioattached === -1) { // Not found.
                                data = JSON.parse(response.responseText); // will throw if bad JSON
                            }
                            else {
                                var responseString = response.responseText.substring(0, inststudioattached); 
                                data = JSON.parse(responseString); // will throw if bad JSON
                            }

                        }
                        catch (e) {
                            BingApp.traceError("nativeinstrumentation._refreshImpression failed, status:{0}, response:{1}, error:{2}", response.status, response.responseText, e.message);

                            error(e); // callback with error.
                            
                            pageIGs[pageName].error.forEach(function (errorhandler) { // notify any waiting handlers that an error occured.
                                errorhandler(e);
                            });

                            return;
                        }

                        var completehandlers = pageIGs[pageName].complete; // cache any handlers that need to know about this update of impression guid.
                        pageIGs[pageName] = _makeIgInfo(pageName, data.ig, ts(), BingApp.Instrumentation.State.ready); // refresh the page impression guid with the changes, clearing out additional listeners.

                        complete(pageIGs[pageName]); // notify main listener of impression change.

                        completehandlers.forEach(function (callback) { // notify additional listeners of the impression change.
                            callback(pageIGs[pageName]);
                        });
                    }
                },
            function (err) {
                BingApp.traceError("BingApp.Instrumentation._refreshImpression failed, status:{0}, response:{1}", error.status, error.responseText);
                error(err); // notify main listener of failure.
                pageIGs[pageName].error.forEach(function (callback) { // notify additional listeners of the failure.
                    callback(err);
                });
            });
        });
    }

    function _getPageName() {
        /// <summary>
        /// examines uri and determines the pageName of the current view.
        /// </summary>
        var uri = navigationManager.getCurrentUri();
        if (uri) {
            for (var i = 0; i < patternsPage.length; ++i) {
                if (regexps[i].test(uri.absoluteUri)) {
                    regexps[i].lastIndex = 0; // reset the starting index.
                    return patternsPage[i].pageName;
                }
            }
        }

        return uri; // caller upon receiving null should throw.
    }

    function _getCurrentIGInfo() {
        /// <summary>
        /// retrieves the current IG to use.
        /// </summary>
        /// <returns>
        /// the IG Info object to use for the instrumentation
        /// </returns>
        var pageName = _getPageName();

        if (!pageName) {
            BingApp.traceError("_getCurrentIG failure: pageName");
            return null;
        }

        var expiration = env.configuration["expirationInterval"];

        // Check if IG Refresh is needed
        var currentTS = ts();
        var pageData = pageIGs[pageName];

        if (pageData) { // Valid pageData object
            var returnData = false;

            if (pageData.state === BingApp.Instrumentation.State.requestPending) { // Check object state.
                returnData = true;
            }

            if (currentTS - pageData.ts < expiration) { // Check if the impression has expired.
                returnData = true;
            }
            
            if (returnData) {
                return pageData;
            }
        }

        // IG has expired so refresh all state information.
        pageIGs[pageName] = _makeIgInfo(pageName, null, null, BingApp.Instrumentation.State.requireRefresh);

        return pageIGs[pageName]
    }

    function _createXMLPayLoad(data, type, currentIG, pageName) {
        /// <summary>
        /// creates the xml payload for a xls instrumentation packet.
        /// </summary>
        /// <param name="data">
        /// Users defined data to log
        /// </param>
        /// <param name="type">
        /// type of event
        /// </param>
        /// <param name="currentIG">
        /// Impression guid for the instrumention ping.
        /// </param>
        /// <returns>
        /// returns xml string containing instrumentation payload.
        /// </returns>

        // Ensure that we have all necessary state information.
        if (!muid) {
            BingApp.traceError("BingApp.Instrumentation._createXMLPayLoad failure: muid");
            return null;
        }

        if (!currentIG) {
            BingApp.traceError("BingApp.Instrumentation._createXMLPayLoad failure: currentIG");
            return null;
        }

        if (!data) {
            BingApp.traceError("BingApp.Instrumentation._createXMLPayLoad failure: data");
            return null;
        }

        if (!type) {
            BingApp.traceError("BingApp.Instrumentation._createXMLPayLoad failure: type");
            return null;
        }

        if (!pageName) {
            BingApp.traceError("BingApp.Instrumentation._createXMLPayLoad failure: pageName");
            return null;
        }
       
        // Need to insert the FID, type and TS into supplied data.
        data.FID = pageName;
        data.T = type;
        data.TS = ts();
        
        var baseXML = "<ClientInstRequest>" +
            "<CID>{0}</CID>" +
            "<Events>" +
            "<E>" +
            "<T>Event.ClientInst</T>" +
            "<IG>{1}</IG>" +
            "<TS>{2}</TS>" +
            "<D><![CDATA[{3}]]></D>" +
            "</E>" +
            "</Events>" +
            "</ClientInstRequest>";

        // Replace sentinals with their corresponding values
        var xml = BingApp.Utilities.format(baseXML, muid, currentIG, ts(), JSON.stringify(data));
        return xml;
    }

    function _makeIgInfo(pageName, ig, ts, state) {
        /// <summary>
        /// creates the Impression guid info object.
        /// </summary>
        /// <param name="ig">
        /// impression guid, can be null
        /// </param>
        /// <param name="ts">
        /// timestamp can be null
        /// </param>
        /// <param name="state">
        /// State of the IgInfo object
        /// </param>
        /// <returns>
        /// object populated with the parameters.
        /// </returns>
        var complete = [];
        var error = []
        return { pageName: pageName, ig: ig, ts: ts, state: state, complete: complete, error: error };
    }

    function _initializeMuid() {
        /// <summary>
        /// initializes the muid. 
        /// </summary>
        /// <returns>
        /// promise for initailized muid.
        /// </returns>
        if (muid) {
            return new WinJS.Promise.as(muid);
        }

        return new WinJS.Promise(
            function init(complete, error) {
                proxy.getCookie(cookieName).done(function (cookie) {
                    if (cookie) {
                        muid = cookie.substring(cookieName.length + 1);
                        if (muid) {
                            complete(muid);
                        }
                        else {
                            error(new WinJS.ErrorFromName("BingApp.Instrumentation.Error", "Failure retrieving MUID."));
                        }
                    }
                    else {
                        BingApp.traceError("BingApp.Instrumentation._initializeMuid failed to retrieve MUID");
                        error(new WinJS.ErrorFromName("BingApp.Instrumentation.Error", "Failure retrieving MUID."));
                    }
                });
            });
    }

    function _onready() {
        /// <summary>
        /// returns a WinJS Promise object indicating that instrumentation is ready.
        /// </summary>
        /// <returns>
        /// returns WinJS Promise
        /// </returns>
        var igInfo = _getCurrentIGInfo();
        if (igInfo && igInfo.state === BingApp.Instrumentation.State.ready) {
            return new WinJS.Promise.as(igInfo);
        }

        return new WinJS.Promise(
            function init(complete, error) {
                if (igInfo && igInfo.state === BingApp.Instrumentation.State.requireRefresh) {
                    igInfo.state = BingApp.Instrumentation.State.requestPending; // Move state to requestPending.
                    refresh(complete, error);
                }
                else {
                    if (igInfo) {
                        igInfo.complete.push(complete); // these will be called when request returns.
                        igInfo.error.push(error);
                    }
                    else {
                        BingApp.traceError("BingApp.Instrumentation._onready :Unexpected IGInfo object");
                        error(new WinJS.ErrorFromName("BingApp.Instrumentation.Error", "Unexpected IGInfo object"));
                    }
                }
            });
    }

    function _isPageValidForIGRefresh(pageName) {
        /// <summary>
        /// returns boolean indicating if pageName can be refresh
        /// </summary>
        /// <param>
        /// pageName 
        /// </param>
        /// <returns>
        /// boolean.
        /// </returns>
        return pageName === 'start';
    }

    function _fireUpdateIG() {
        /// <summary>
        /// Fires the message that the IG is updated.
        /// </summary>
        /// <param name="ig" type="string" >
        /// instrumentation guid. 
        /// </param>
        BingApp.traceInfo("BingApp.Instrumentation._fireUpdateIG :received");

        BingApp.Instrumentation.getIGForCurrentPage().done(
            function (ig) {
                BingApp.locator.eventRelay.fireEvent(
                    BingApp.Instrumentation.updateIG,
                    {
                        currentIG: ig
                    });
            },
            function (err) {
                BingApp.traceError("BingApp.Instrumentation._fireUpdateIG: failure: Unable to retrieve IG for current view.");
            });
    }

    // Expose BingApp.Instrumentation functions via application namespace
    WinJS.Namespace.define("BingApp.Instrumentation", {
        modeChange: "CI.ModeChange",
        activation: "CI.Activation",
        clickEvent: "CI.Click",
        failureEvent: "CI.Failure",
        updateIG: "updateIg",
        log: log,
        logClick: logClick,
        refresh: refresh,
        resumeLogging: resumeLogging,
        updatePageIG: updatePageIG,
        clear: clear,
        State: state,
        getCurrentIGInfoForPage: getCurrentIGInfoForPage,
        getIGForPage: getIGForPage,
        getIGForCurrentPage: getIGForCurrentPage
    });

    // Expose BingApp.Instrumentation functions via application namespace
    WinJS.Namespace.define("BingApp.Instrumentation.String", {
        stateChange: "stateChange",
        native: "native",
        initialState: "none"
    });

})();