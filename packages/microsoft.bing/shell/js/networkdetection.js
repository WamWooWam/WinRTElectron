/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../common/js/tracing.js' />
/// <reference path='../../common/js/eventsource.js' />
(function () {
    "use strict";

    /// <summary>
    /// Internal object encapsulating possible states for network detection service.
    /// </summary>
    var states = Object.freeze({
        none: 0, // indicates no network connection
        internetAccess: 1 // identifies connected state with internet access
    });

    var networkInfo = Windows.Networking.Connectivity.NetworkInformation;
    var networkConnectivityInfo = Windows.Networking.Connectivity.NetworkConnectivityLevel;
    var networkStatusChangedEvent = "networkstatuschanged";

    // this state needs to be private to this singleton and hence this variable will be used as a closure to
    // provide read only access.
    var connectionState = states.none;

    /// <summary>
    /// Defines class that raises Network connectivity events and exposes an API to check if internet connection is
    /// available.
    /// </summary>
    var NetworkDetectionService = WinJS.Class.define(
        function constructor() {
            /// <summary>
            /// Initializes a new instance of BingApp.Classes.NetworkDetectionService class.
            /// </summary>
            /// <returns type="BingApp.Classes.NetworkDetectionService">
            /// NetworkDetectionService instance.
            /// </returns>

            if (!(this instanceof BingApp.Classes.NetworkDetectionService)) {
                BingApp.traceWarning("NetworkDetectionService.ctor: Attempted using NetworkDetectionService ctor as function; redirecting to use 'new NetworkDetectionService()'.");
                return new BingApp.Classes.NetworkDetectionService();
            }

            // set the initial state
            this._setNetworkState();

            // register for the event, save the wrapper so that we can unregister later
            var self = this;
            this._onNetworkStatusChangeWrapper = function (eventArgs) {
                self._onNetworkStatusChange(eventArgs);
            };

            networkInfo.addEventListener(networkStatusChangedEvent, this._onNetworkStatusChangeWrapper );
        },
        {
            isConnected: function () {
                /// <summary>
                /// Determines whether the user is connected to the internet
                /// </summary>
                /// <returns>
                /// <b>true</b> to indicate that connectivity exists; otherwise, <b>false</b>.
                /// </returns>
                return (connectionState === states.internetAccess);
            },

            unregisterForNetworkStatusChange: function () {
                /// <summary>
                /// Unregisters for the network status changed event
                /// </summary>

                networkInfo.removeEventListener(networkStatusChangedEvent, this._onNetworkStatusChangeWrapper);
            },

            _setNetworkState: function () {
                /// <summary>
                /// Sets the current state of the network
                /// </summary>

                try {
                    var connectionProfile = networkInfo.getInternetConnectionProfile();
                    if (connectionProfile === null) {
                        connectionState = states.none;
                        return;
                    }

                    switch (connectionProfile.getNetworkConnectivityLevel()) {
                        case networkConnectivityInfo.internetAccess:
                            connectionState = states.internetAccess;
                            BingApp.traceInfo("NetworkDetectionService._setNetworkState: internet connection available.");
                            break;
                        default:
                            connectionState = states.none;
                            BingApp.traceInfo("NetworkDetectionService._setNetworkState: internet connection not available.");
                            break;
                    }
                } catch (error) {
                    connectionState = states.none;
                    BingApp.traceError("NetworkDetectionService._setNetworkState: unexpected error: {0}", error.message);
                }
            },

            _onNetworkStatusChange: function (eventArgs) {
                /// <summary>
                /// Event handler for Network Status Change event
                /// </summary>
                /// <param name="eventArgs" type="Object">
                /// Event arguments
                /// </param>
                this._setNetworkState();
                BingApp.locator.eventRelay.fireEvent(networkStatusChangedEvent, { connectionState: connectionState });
            },

            _onNetworkStatusChangeWrapper: null
        },
        {
            connectionStates: states,
            networkStatusChangedEvent: networkStatusChangedEvent
        });
    
        // Expose NetworkDetectionService class via application namespace
        WinJS.Namespace.define("BingApp.Classes", {
            NetworkDetectionService: NetworkDetectionService
        });
})();
