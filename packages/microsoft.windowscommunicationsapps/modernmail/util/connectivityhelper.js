
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Windows,Jx,Debug*/

Jx.delayDefine(Mail.Utilities, "ConnectivityMonitor", function () {
    "use strict";

    var Utilities = window.Mail.Utilities;

    Utilities.ConnectivityMonitor = {
        hasNoInternetConnection: function () {
            this._ensureListener();
            Debug.assert(Jx.isValidNumber(this._level));
            return (this._level !== Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess);
        },
        dispose: function () {
            if (this._listeningFunc) {
                Windows.Networking.Connectivity.NetworkInformation.removeEventListener("networkstatuschanged", this._listeningFunc);
                this._listeningFunc = null;
                this._level = null;
            }
        },
        Events: {
            connectivityChanged: "connectivityChanged"
        },
        _level: null,
        _listeningFunc: null,
        _ensureListener: function () {
            if (!this._listeningFunc) {
                Mail.writeProfilerMark("ConnectivityMonitor._ensureListener", Mail.LogEvent.start);
                this._listeningFunc = this._updateLevel.bind(this);
                Windows.Networking.Connectivity.NetworkInformation.addEventListener("networkstatuschanged", this._listeningFunc);
                this._updateLevel();
                Debug.assert(Jx.isValidNumber(this._level));
                Mail.writeProfilerMark("ConnectivityMonitor._ensureListener", Mail.LogEvent.stop);
            }
        },
        _updateLevel: function () {
            Mail.writeProfilerMark("ConnectivityMonitor._updateLevel", Mail.LogEvent.start);

            /// <disable>JS2076.IdentifierIsMiscased</disable>
            var Connectivity = Windows.Networking.Connectivity,
                NetworkConnectivityLevel = Connectivity.NetworkConnectivityLevel;
            /// <enable>JS2076.IdentifierIsMiscased</enable>
            var level = NetworkConnectivityLevel.none;

            // The NetworkInformation API has a tendency to throw exceptions or return null
            // when the network is in a variety of unconnected states.
            try {
                var profile = Connectivity.NetworkInformation.getInternetConnectionProfile();
                if (Jx.isObject(profile)) {
                    level = /*@static_cast(Number)*/profile.getNetworkConnectivityLevel();
                }
            }
            catch (e) {
                // If we can't get the Network Connectivity Level, we should assume we aren't connected
                Jx.log.exception("Exception from Connectivity.NetworkInformation", e);
                level = NetworkConnectivityLevel.none;
            }

            if (level !== this._level) {
                this._level = level;
                Jx.EventManager.fireDirect(null, this.Events.connectivityChanged, level);
            }
            Mail.writeProfilerMark("ConnectivityMonitor._updateLevel", Mail.LogEvent.stop);
        }
    };
});
