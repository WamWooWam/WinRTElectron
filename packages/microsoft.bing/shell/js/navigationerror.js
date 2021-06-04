/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../common/js/tracing.js' />
/// <reference path='../../common/js/utilities.js' />
/// <reference path='../../common/js/errors.js' />
(function () {
    "use strict";

    // private static
    var messageError = "error:network";
    var messageRetry = "error:retry";
    var messageContentReady = "contentReady";
    var messageNavigateOut = "navigateOut";
    var messageNavigateTo = "navigateTo";

    function initNavigationError(window) {
        /// <summary>
        /// Initializes the navigation error page UI.
        /// </summary>
        /// <param name="window">
        /// The window where the error page is rendered.
        /// </param>

        // NOTE: the application and the error page have the same origin
        var origin = window.location.protocol + "//" + window.location.host;

        // log error information (contained in query string)
        var queryString = window.location.search;
        if (queryString.length > 0) {
            BingApp.traceError("msapp-error information: " + queryString);
        }

        // notify the parent iframe that the error page content is ready
        message = JSON.stringify({
            name: messageContentReady
        });
        window.parent.postMessage(message, origin);

        // notify the parent iframe that a navigation error occurred
        var message = JSON.stringify({
            name: messageError,
            value: {
                error: queryString
            }
        });
        window.parent.postMessage(message, origin);

        // localize the HTML page
        WinJS.Resources.processAll();

        retryButton.addEventListener("click", function () {
            var message = JSON.stringify({
                name: messageRetry
            });
            window.parent.postMessage(message, origin);
        });

        // add event listener for navigate out message
        window.addEventListener("message", function (event) {
            if (event.origin === origin) {
                var message;
                try {
                    message = JSON.parse(event.data);
                } catch (error) {
                    BingApp.traceError(
                        "NavigationError.onMessage: error while parsing message '{0}' from app compartment; error message: '{1}'.",
                        event.data,
                        error.message);
                    message = null;
                }

                if (message && message.name === messageNavigateOut && message.value.navigationUri) {
                    var reply = JSON.stringify({
                        name: messageNavigateTo,
                        value: {
                            uri: message.value.navigationUri
                        }
                    });
                    window.parent.postMessage(reply, origin);
                }
            }
        }, false);

        window.addEventListener("resize", function () {
            // update error text CSS depending on the view state
            if (Windows.UI.ViewManagement.ApplicationView.value === Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                WinJS.Utilities.addClass(errorMessage, "fontMedium");
                WinJS.Utilities.removeClass(errorMessage, "fontLarge");
            } else {
                WinJS.Utilities.addClass(errorMessage, "fontLarge");
                WinJS.Utilities.removeClass(errorMessage, "fontMedium");
            }
        }, false);
    }

    WinJS.Namespace.define("BingApp.ErrorPage", {
        initNavigationError: initNavigationError
    });

    function ready() {
        /// <summary>
        /// Initializes the navigation error page.
        /// </summary>
        WinJS.UI.processAll();
        BingApp.ErrorPage.initNavigationError(window);

        BingApp.traceInfo("NavigationError.ready: navigation error page is displayed.");
    }

    WinJS.UI.Pages.define("/shell/html/navigationerror.html", {
        ready: ready
    });
})();