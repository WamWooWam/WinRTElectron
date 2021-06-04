/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../common/js/eventsource.js' />
(function () {
    "use strict";

    /// <summary>
    /// Static list of events raised by ViewController.
    /// </summary>
    var events = Object.freeze({
        /// <summary>
        /// This event is raised when view is about to be unloaded.
        /// </summary>
        unloading: "unloading",
    });

    /// <summary>
    /// Defines base class for view controllers.
    /// </summary>
    var ViewController = WinJS.Class.derive(
        BingApp.Classes.EventSource,
        function constructor() {
            BingApp.Classes.EventSource.call(this);
        },
        {
            setNavigationUri: function (uri, options) {
                /// <summary>
                /// This method is used by View Manager to set navigation Uri for the view.
                /// </summary>
                /// <param name="uri">
                /// Navigation Uri.
                /// </param>
                /// <param name="options" optional="true">
                /// Optional argument which contains navigation options passed with navigation operation.
                /// </param>
            },
            notifyUnloading: function () {
                /// <summary>
                /// Handles unloading of this view from Bing App.
                /// </summary>
                this.fireEvent(events.unloading);
            },
            getHost: function () {
                /// <summary>
                /// Gets element that will host contained view.
                /// </summary>
                return null;
            }
        },
        {
            events: events,
        });

    // Expose ViewController class via application namespace
    WinJS.Namespace.define("BingApp.Classes", {
        ViewController: ViewController
    });
})();
