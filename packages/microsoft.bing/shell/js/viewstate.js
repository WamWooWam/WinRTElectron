/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path='../../common/js/tracing.js' />
/// <reference path='nativeinstrumentation.js' />
(function () {
    /// <summary>
    /// Instead of using the viewstatechanged event the window resize event is used and 
    /// combined with the viewState to report the type of layout the application is currently using.
    /// Interestingly, the resize event fires when the input pane is displayed, even
    /// though the size of the window does not change. As such, new dimensions are compared
    /// to previous dimensions to determine if there was indeed a change before firing the
    /// event.
    /// </summary>
    "use strict";

    /// <summary>
    /// Events exposed by on-screen keyboard manager.
    /// </summary>
    var events = Object.freeze({
        resize: "viewstate:resize"
    });

    // private static members
    var previousWidth;
    var previousHeight;
    var previousState;

    var viewStateEnum = Windows.UI.ViewManagement.ApplicationViewState;
    var applicationView = Windows.UI.ViewManagement.ApplicationView;

    var mapping = {};
    mapping[viewStateEnum.fullScreenLandscape] = "landscape";
    mapping[viewStateEnum.fullScreenPortrait] = "portrait";
    mapping[viewStateEnum.filled] = "filled";
    mapping[viewStateEnum.snapped] = "snapped";

    function initDimensions(document) {
        /// <summary>
        /// Initializes dimensions of the view.
        /// </summary>
        /// <param name="document">
        /// The document object which body is used to determine view dimensions.
        /// </param>
        var body = document.body;
        previousHeight = body.offsetHeight;
        previousWidth = body.offsetWidth;
        previousState = getViewStateLabel(applicationView.value);
    }

    function getViewStateLabel(viewState) {
        /// <summary>
        /// Gets the label representing the provided view state ID.
        /// </summary>
        /// <param>
        /// The view state ID.
        /// </param>
        /// <returns>
        /// Text label representing view state.
        /// </returns>
        return (mapping[viewState] || "unknown");
    }

    function init(window, document, relay) {
        /// <summary>
        /// Initializes the relaying of view state change events.
        /// </summary>
        /// <param name="window">
        /// The window object. This function will handle window's 'resize' event to determine
        /// view state changes.
        /// </param>
        /// <param name="document">
        /// The document object. This function will uses document's body to determine view dimensions.
        /// </param>
        /// <param name="relay" type="BingApp.Classes.EventRelay">
        /// The event relay that alows for raising events.
        /// </param>
        if (!window) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("window");
        }

        if (!document) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("document");
        }

        if (!relay) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("relay");
        }

        initDimensions(document);

        var onResize = function () {
            /// <summary>
            /// Relays resize events to the listeners.
            /// </summary>
            var body = document.body;
            var height = body.offsetHeight;
            var width = body.offsetWidth;
            var state = getViewStateLabel(applicationView.value);

            // Raise 'resize' event only if width and/or heigh has changed
            if (height !== previousHeight || width !== previousWidth) {
                previousHeight = height;
                previousWidth = width;
                relay.fireEvent(events.resize, {
                    label: state,
                    height: height,
                    width: width,
                });

                // Test hook
                BingApp.tracePerf(events.resize);
            }

            // log instrumentation event only if there is a change in state.
            if (previousState !== state) {
                BingApp.Instrumentation.log(
                    {
                        feature: BingApp.Instrumentation.String.native,
                        name: BingApp.Instrumentation.String.stateChange,
                        oldState: previousState ? previousState : BingApp.Instrumentation.String.initialState,
                        newState: state
                    },
                    BingApp.Instrumentation.modeChange);

                previousState = state;
            }
        };

        window.addEventListener("resize", onResize, false);
    }

    WinJS.Namespace.define("BingApp.ViewState", {
        init: init,
        events: events
    });
})();