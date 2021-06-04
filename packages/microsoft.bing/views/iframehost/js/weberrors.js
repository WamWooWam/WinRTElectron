/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="../../../common/js/errors.js" />
/// <reference path="../../../shell/js/eventrelay.js" />
/// <reference path="../../../shell/js/navigation.js" />
(function () {
    "use strict";

    /// <summary>
    /// Set of handled events.
    /// </summary>
    var events = Object.freeze({
        error: "error:network",
        retry: "error:retry",
        navigateOut: "navigateOut",
    });

    /// <summary>
    /// Id that is used to identify iframe hosting content.
    /// </summary>
    var iframeRelayId = "ContentLoadingFailureHost";

    function handleError() {
        /// <summary>
        /// Cancels current navigation and raises event to indicate whether the navigation 
        /// manager history is empty or not.
        /// </summary>
        var navigationManager = BingApp.locator.navigationManager;
        var relay = BingApp.locator.eventRelay;

        navigationManager.cancelNavigation(false);
    }

    function handleRetry() {
        /// <summary>
        /// Refreshes the application UI, on retry message events.
        /// </summary>
        BingApp.locator.navigationManager.refresh();
    }

    function register(iframe) {
        /// <summary>
        /// Registers to handle events raised by error page displayed inside given iframe in the case
        /// of content loading failure.
        /// </summary>
        /// <param name="iframe">
        /// Iframe element.
        /// </param>
        if (!iframe) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("iframe");
        }

        var relay = BingApp.locator.eventRelay;

        // NOTE:    The navigation error page is not hosted in a Bing domain but in the
        //          application so we have to specify target origin explicitly.
        var appTargetOrigin = window.location.protocol + "//" + window.location.host;
        relay.registerIframe(iframeRelayId, iframe, appTargetOrigin);
        relay.addEventListener(events.navigateOut, iframeRelayId);

        relay.addEventListener(events.error, handleError);
        relay.addEventListener(events.retry, handleRetry);
    }

    function unregister(iframe) {
        /// <summary>
        /// Unregisters from handling events raised by error page displayed inside given iframe in the case
        /// of content loading failure.
        /// </summary>
        /// <param name="iframe">
        /// Iframe element.
        /// </param>
        if (!iframe) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("iframe");
        }

        var relay = BingApp.locator.eventRelay;

        // Note that this will remove all listeners for iframeRelayId
        relay.unregisterIframe(iframeRelayId);

        relay.removeEventListener(events.error, handleError);
        relay.removeEventListener(events.retry, handleRetry);
    }

    WinJS.Namespace.define("BingApp.WebErrors", {
        register: register,
        unregister: unregister,
        events: events,
    });
})();