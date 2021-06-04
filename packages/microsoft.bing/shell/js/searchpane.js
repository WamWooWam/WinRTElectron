/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../common/js/errors.js' />
/// <reference path='eventrelay.js' />
(function () {
    "use strict";

    /// <summary>
    /// Events exposed by seachPane manager.
    /// </summary>
    var events = Object.freeze({
        visibilityChanged: "searchPane:visibilityChanged"
    });

    function init(relay) {
        /// <summary>
        /// Initializes the relaying of the searchPane visibility events.
        /// </summary>
        /// <param name="relay" type="BingApp.Classes.EventRelay">
        /// The event relay that alows for raising events.
        /// </param>
        if (!relay) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("relay");
        }

        var searchPane = Windows.ApplicationModel.Search.SearchPane.getForCurrentView();
        var onVisibilityChanging = function (event) {
            /// <summary>
            /// Raises event indicating that the visibility of the searchPane changed.
            /// </summary>
            /// <param name="event">
            /// The visibility event.
            /// </param>
            relay.fireEvent(events.visibilityChanged, {
                visible: event.visible,
            });
        };

        searchPane.addEventListener("visibilitychanged", onVisibilityChanging);
    }

    function isVisible() {
        /// <summary>
        /// Gets whether the SearchPane is Visible.
        /// </summary>
        /// <returns type="Boolean">Wether the SearchPane is Visible.</returns>
        var searchPane = Windows.ApplicationModel.Search.SearchPane.getForCurrentView();
        return searchPane.visible;
    }

    WinJS.Namespace.define("BingApp.SearchPane", {
        init: init,
        isVisible: isVisible,
        events: events
    });
})();