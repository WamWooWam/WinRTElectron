
// Copyright (C) Microsoft Corporation.  All rights reserved.

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />
/// <reference path="..\Model\Identity.js"/>

Jx.delayDefine(People.Social, ["loadUtilities", "unreadNotifications", "populateDemoDataAsync"], function () {

    var P = window.People;
    var S = P.Social;
    var R = P.RecentActivity;

    S.loadUtilities = Jx.fnEmpty;

    S.unreadNotifications = {
        isEnabled: function () {
            if (this._isInitialized) {
                return this._notifications !== null;
            }
            else {
                return Jx.appData.localSettings().container("People").container("Social").get("notificationsEnabled");
            }
        },

        getCount: function () {
            if (this._notifications !== null) {
                return this._notifications.unreadCount;
            }

            return 0;
        },

        initialize: function (platform) {
            /// <summary>Manages listening for and reporting notifications.</summary>
            /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
            Debug.assert(!this._isInitialized);

            People.loadSocialNotifications();

            this._isInitialized = true;

            if (!S.disableNotifications) {
                var capabilities = this._capabilities = People.RecentActivity.Platform.SocialCapabilities.meCapabilities;
                    capabilities.addListener("propertychanged", this._onCapabilityPropertyChanged, this);

                if (capabilities.canShowNotifications) {
                    this._initializeNotificationsInternal();
                }
            }

            Jx.appData.localSettings().container("People").container("Social").set("notificationsEnabled", this.isEnabled());

            this._raiseChangedEvent();
        },

        refreshCount: function () {
            if (this._notifications) {
                this._notifications.refreshUnreadCount();
            }
            else {
                this._isRefreshPending = true;
            }
        },

        _initializeNotificationsInternal: function () {
            /// <summary>Handles the PropertyChanged events for the notifications.</summary>
            if (!this._notifications) {
                var meIdentity = R.Identity.createMeIdentity();
                this._notifications = meIdentity.networks.aggregatedNetwork.notifications;
                this._notifications.addListener("propertychanged", this._onNotificationsPropertyChanged, this);

                if (this._isRefreshPending) {
                    this._isRefreshPending = false;
                    this.refreshCount();
                }
            }
        },

        _onCapabilityPropertyChanged: function (e) {
            /// <summary>Handles the PropertyChanged events for the social capabilities.</summary>
            /// <param name="e" type="Object">The event arguments.</param>
            if (e.propertyName === 'CanShowNotifications') {
                var capabilities = e.sender;

                if (capabilities.canShowNotifications) {
                    this._initializeNotificationsInternal();
                    this._raiseChangedEvent();
                }
                else if (this._notifications) {
                    this._notifications.removeListener("propertychanged", this._onNotificationsPropertyChanged, this);
                    this._notifications = null;
                    this._raiseChangedEvent();
                }

                Jx.appData.localSettings().container("People").container("Social").set("notificationsEnabled", this.isEnabled());
            }
        },

        _onNotificationsPropertyChanged: function (e) {
            /// <summary>Handles the PropertyChanged events for the notifications.</summary>
            /// <param name="e" type="Object">The event arguments.</param>
            if (e.propertyName === "UnreadCount") {
                this._raiseChangedEvent();
            }
        },

        _raiseChangedEvent: function () {
            Jx.raiseEvent(this, "changed", {
                sender: this
            });
        },

        _isInitialized: false,
        _isRefreshPending: false,
        _notifications: null
    };

    Debug.Events.define(S.unreadNotifications, "changed");

    S.populateDemoDataAsync = function (path, platform) {
        /// <summary>Populates social retail data async.</summary>
        /// <param name="path" type="String">The path to the xml file in the form of "ms-appx:///****"</param>
        /// <param name="e" type="Object">The platform object.</param>
        People.loadSocialProviders();
        return People.RecentActivity.Providers.RetailModeHelper.populateDemoDataAsync(path, platform);
    };

    var formatRE = /\{(\d+)\}/g;

    S.format = function (formatter) {
        /// <summary>Formats a string using the C# style placeholders ("{\d+}")</summary>
        /// <param name="formatter" type="String">The formatter.</param>
        /// <param name="values">The placeholder values.</param>
        var values = arguments;

        return formatter.replace(formatRE, function (m, capture) {
            var value = values[parseInt(capture) + 1];

            if (Jx.isNullOrUndefined(value)) {
                return '';
            }

            return value.toString();
        });
    };

    S.clearKeys = function (o) {
        /// <summary>Removes all keys in the object.</summary>
        /// <param name="o">The object.</param>
        for (var n in o) {
            delete o[n];
        }
    };

    S.Events = {
        removeListenerSafe: function (type, fn, obj) {
            /// <summary>Removes a listener from an event, but does not raise an exception/assert if the listener is not attached.</summary>
            /// <param name="type" type="String">The type of the event.</param>
            /// <param name="fn">The listener.</param>
            /// <param name="object">The target.</param>
            if (this._jxev) {
                var evt = this._jxev[type];
                if (evt) {
                    var listeners = evt.listeners;
                    for (var i = listeners.length; i >= 0; i--) {
                        var listener = listeners[i];
                        if (Boolean(listener) && listener.fn === fn && listener.obj === obj) {
                            if (evt.recursionCount !== 0) {
                                listeners[i] = null;
                                evt.isSweepNeeded = true;
                            }
                            else {
                                listeners.splice(i, 1);
                            }

                            return true;
                        }
                    }
                }
            }

            return false;
        }
    };

    S.removeListenerSafe = function (target, type, fn, obj) {
        /// <summary>Removes a listener from an event, but does not raise an exception/assert if the listener is not attached.</summary>
        return S.Events.removeListenerSafe.call(target, type, fn, obj);
    };

});
