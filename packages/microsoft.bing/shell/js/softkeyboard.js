/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../common/js/errors.js' />
/// <reference path='eventrelay.js' />
(function () {
    "use strict";

    /// <summary>
    /// Events exposed by on-screen keyboard manager.
    /// </summary>
    var events = Object.freeze({
        visibilityChanged: "inputpane:visibilitychanged"
    });

    function init(relay) {
        /// <summary>
        /// Initializes the relaying of on-screen keyboard visibility events.
        /// </summary>
        /// <param name="relay" type="BingApp.Classes.EventRelay">
        /// The event relay that alows for raising events.
        /// </param>
        if (!relay) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("relay");
        }

        var inputPane = Windows.UI.ViewManagement.InputPane.getForCurrentView();
        var onVisibilityChanging = function (event) {
            /// <summary>
            /// Raises event indicating that the visibility of the on-screen keyboard changed.
            /// </summary>
            /// <param name="event">
            /// The visibility event.
            /// </param>
            var visible = event.type.toLowerCase() === "showing";
            relay.fireEvent(events.visibilityChanged, {
                visible: visible,
                occludeRect: event.occludedRect
            });
        };

        inputPane.addEventListener("showing", onVisibilityChanging);
        inputPane.addEventListener("hiding", onVisibilityChanging);
    }

    WinJS.Namespace.define("BingApp.SoftKeyboard", {
        init: init,
        events: events
    });
})();