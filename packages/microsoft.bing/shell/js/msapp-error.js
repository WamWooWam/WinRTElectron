/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../common/js/tracing.js' />
/// <reference path='../../common/js/utilities.js' />
/// <reference path='../../common/js/errors.js' />
(function () {
    "use strict";

    var failureUrlKey = "failureUrl";
    var navigationErrorPageUri = "/shell/html/navigationerror.html";
    var defaultSearchBoxUri = "/shell/html/defaultsearchbox.html";
    var keyValuePairRegExp = new RegExp("([^?=&]+)(=([^&]*))?", "g");
    var env = new BingApp.Classes.Env();

    function initMsAppError(env, window, pages) {
        /// <summary>
        /// Initializes the error page depending on the failure URL.
        /// </summary>
        /// <param name="env">
        /// The app environment.
        /// </param>
        /// <param name="window">
        /// The window where the error page is rendered.
        /// </param>
        /// <param name="pages">
        /// The namespace providing methods for defining and displaying WinJS pages.
        /// </param>

        // Verify that this error page is loaded in an iframe
        if (window.parent === window) {
            BingApp.traceError("Error page should be loaded in web context, not in the app compartment.");
            throw new BingApp.Classes.ErrorInvalidOperation("BingApp.ErrorPage.init", WinJS.Resources.getString("error_error_page_in_app_context").value);
        }

        // Parse the query string
        var queryString = window.location.search;
        var parsedQueryString = {};
        queryString.replace(keyValuePairRegExp, function (match, key, equalValue, value) {
            /// <summary>
            /// </summary>
            /// <param name="match" type="String">
            /// The string matching the parameter assignment.
            /// </param>
            /// <param name="key" type="String">
            /// The key which is set.
            /// </param>
            /// <param name="equalValue" type="String">
            /// The value to set, prepended with the assignment sign.
            /// </param>
            /// <param name="value" type="String">
            /// The value to set.
            /// </param>
            if (value) {
                parsedQueryString[key] = decodeURIComponent(value);
            } else {
                parsedQueryString[key] = "";
            }
        });

        env.configurationReady().then(function () {
            // Get search box URL
            var market = new Windows.ApplicationModel.Resources.ResourceLoader("market");
            var searchBoxUrl = market.getString("DEFAULT_HOST") + env.configuration["searchBoxPage"];

            // Render the appropriate error page
            var uri;
            var failureUrl = parsedQueryString[failureUrlKey];
            if (failureUrl === searchBoxUrl || failureUrl.indexOf(searchBoxUrl + "?") === 0) {
                // Display the default search box page
                uri = defaultSearchBoxUri;
            } else {
                // Display the navigation error page
                uri = navigationErrorPageUri;
            }
            WinJS.Utilities.empty(errorHost);
            pages.render(uri, errorHost);
        });
    }

    WinJS.Namespace.define("BingApp.ErrorPage", {
        initMsAppError: initMsAppError
    });

    // initialize page UI when the DOM is ready
    WinJS.Utilities.ready().done(function () {
        BingApp.ErrorPage.initMsAppError(env, window, WinJS.UI.Pages);
    });
})();