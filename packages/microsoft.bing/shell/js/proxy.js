/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='/shell/js/servicelocator.js' />
(function () {
    "use strict";

    ///
    /// BingApp.Proxy proxies requests so that they are executed in the proxy's
    /// compartment. This allows us to make calls to Bing from the app
    /// compartment, while using all the state (cookies, cache, etc.) in
    /// the web compartment.
    ///
    /// Sample usage:
    ///     BingApp.locator.proxy.xhr({
    ///         type: "GET",
    ///         url: "/win8app/config",
    ///     }).then(function success(result) {
    ///         if (result.status === 200) {
    ///             Windows.UI.Popups.MessageDialog(result.responseText).showAsync();
    ///         }
    ///     }, function error(result) {
    ///         ...
    ///     });
    ///

    var Proxy = WinJS.Class.define(
        function (proxyFrame) {
            this._proxyReady = (proxyFrame ? WinJS.Promise.as(proxyFrame) : this._setupProxyFrame());
        }, {
            _setupProxyFrame: function () {
                return new WinJS.Promise(function (complete, error) {
                    window.addEventListener("load", function () {
                        var proxyContainer = document.getElementById("proxy");
                        if (proxyContainer) {
                            WinJS.Utilities.empty(proxyContainer);

                            var proxyFrame = document.createElement("iframe");
                            proxyFrame.addEventListener("load", function () {
                                complete(proxyFrame);
                            });

                            proxyFrame.src = BingApp.locator.env.getHostUrl() + "/win8app/proxy";

                            proxyContainer.appendChild(proxyFrame);
                        } else {
                            error(new WinJS.ErrorFromName("BingApp.Classes.Proxy", "missing proxy container"));
                        }
                    });
                });
            },

            _sendRequest: function (action, detail) {
                /// <summary>
                /// Sends a request to the proxy frame to perform the specified action.
                /// </summary>
                /// <param name="action" type="String">
                /// Action to perform.
                /// </param>
                /// <param name="detail" type="Object">
                /// Details for the action.
                /// </param>
                /// <returns>
                /// A promise with the proxy result.
                /// </returns>
                var that = this;
                return new WinJS.Promise(function (complete, error) {
                    that._proxyReady.done(function (proxyFrame) {
                        // construct a message channel for the proxy to communicate
                        // back through (http://www.w3.org/TR/html5/comms.html)
                        var messageChannel = new MessageChannel();
                        messageChannel.port1.onmessage = function (event) {
                            messageChannel.port1.close();
                            if (event && event.data && (event.data.result !== undefined)) {
                                complete(event.data.result);
                            } else {
                                error((event && event.data && event.data.error) || "unknown error occurred");
                            }
                        };

                        // send the message to the proxy (need to stringify the
                        // request because there is a conflicting onmessage listener
                        // in Bing.Frame.Event which throws an exception otherwise.
                        BingApp.traceInfo("Proxy._sendRequest: Posting a message to the proxy service with action={0}.", action);
                        try {
                            // We use "*" below since we intend to the proxy to respect any domain , not just the one it was initially loaded with.
                            // Here is a scenario where this is required: A user physically in China sets the Region to US and loads the app. The app 
                            // realizes the Region is US and pulls www.bing.com from the market files and initializes env, proxy etc to load on bing.com.
                            // Now when the config comes back, it says the domain should be cn.bing.com since the user is physically in China and overrides the host.
                            // The proxy that ws initially loaded on bing.com should now work well with cn.bing.com.
                            // This is not a security issue because we only load trusted/first party pages in the proxy iframe
                            proxyFrame.contentWindow.postMessage(JSON.stringify({
                                name: "proxy",
                                action: action,
                                detail: detail
                            }), "*" , [messageChannel.port2]);
                        } catch (err) {
                            BingApp.traceError("Proxy._sendRequest: Failed to send a postMessage across, Error message={0} and statusText={1}.", err.message, err.statusText);
                            error(err);
                        }
                    }, error);
                });
            },

            xhr: function (options) {
                /// <summary>
                /// Makes an XHR request from the proxy's compartment.
                /// </summary>
                /// <param name="options" type="Object">
                /// Options for the XHR that match the input to WinJS.xhr().
                /// </param>
                /// <returns>
                /// A promise with the proxy result.
                /// </returns>
                if (options && options.uri && options.uri instanceof Windows.Foundation.Uri) {
                    // called with Windows.Foundation.Uri which will blow up when we attempt to stringify
                    // extract the absoluteUri and make it seamless
                    // NOTE: The server side proxy service expects url and not uri to be passed, hence setting url explicitly and nuking uri
                    options.url = options.uri.absoluteUri;
                    // TODO for future: make the service understand uri to make this extra work go away
                    delete options[uri];
                }

                BingApp.traceInfo("Proxy.xhr: Calling xhr with options.url={0}, options.type={1}", options.url, options.type);
                return this._sendRequest("xhr", options);
            },

            getCookie: function (cookie, crumb) {
                /// <summary>
                /// Retrieves cookies from the proxy's compartment.
                /// through the proxy.
                /// </summary>
                /// <param name="cookie" type="Object">
                /// Name of cookie to retrieve (optional).
                /// </param>
                /// <param name="crumb" type="Object">
                /// Name of crumb within cookie to retrieve (optional).
                /// </param>
                /// <returns>
                /// All cookies, a single cookie, or a single cookie crumb
                /// </returns>
                BingApp.traceInfo("Proxy.getCookie: Calling getCookie with cookie={0}, crumb={1}", cookie, crumb);
                return this._sendRequest("get_cookie", { cookie: cookie, crumb: crumb });
            }
        });
    
    WinJS.Namespace.define("BingApp.Classes", {
        Proxy: Proxy
    });
})();