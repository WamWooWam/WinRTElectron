/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI", {DashboardRefresherService: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.Framework.ObservableBase", function(){}, {
            _refreshTimeout: null, _contentRestrictionNotificationBinding: null, initialize: function initialize() {
                    WinJS.Promise.timeout(this._getCurrentTimeout()).done(this.dashboardRefreshTimeout.bind(this));
                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.contentRestrictionService)) {
                        var contentRestrictionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.contentRestrictionService);
                        this._contentRestrictionNotificationBinding = MS.Entertainment.UI.Framework.addEventHandlers(contentRestrictionService, {browseRestrictionsChanged: this.dashboardRefreshTimeout.bind(this)})
                    }
                }, dispose: function dispose() {
                    if (this._contentRestrictionNotificationBinding) {
                        this._contentRestrictionNotificationBinding.cancel();
                        this._contentRestrictionNotificationBinding = null
                    }
                }, dashboardRefreshTimeout: function dashboardRefreshTimeout() {
                    if (this._refreshTimeout)
                        this._refreshTimeout.cancel();
                    this.dispatchEvent("refreshDashboard");
                    this._refreshTimeout = WinJS.Promise.timeout(this._getCurrentTimeout()).done(this.dashboardRefreshTimeout.bind(this))
                }, _getCurrentTimeout: function _getCurrentTimeout() {
                    if (!this._configuration)
                        this._configuration = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var timeout = 43200000;
                    switch (MS.Entertainment.appMode) {
                        case Microsoft.Entertainment.Application.AppMode.games:
                            timeout = this._configuration.shell.gamesDashboardRefreshTimer;
                            break;
                        case Microsoft.Entertainment.Application.AppMode.music:
                            timeout = this._configuration.shell.musicDashboardRefreshTimer;
                            break;
                        case Microsoft.Entertainment.Application.AppMode.music2:
                            timeout = this._configuration.shell.music2DashboardRefreshTimer;
                            break;
                        case Microsoft.Entertainment.Application.AppMode.video:
                            timeout = this._configuration.shell.videoDashboardRefreshTimer;
                            break;
                        case Microsoft.Entertainment.Application.AppMode.video2:
                            timeout = this._configuration.shell.video2DashboardRefreshTimer;
                            break
                    }
                    if (!timeout)
                        timeout = 43200000;
                    return timeout
                }, _configuration: null, refreshDashboard: MS.Entertainment.UI.Framework.observableProperty("refreshDashboard", false)
        }, {refreshDelayTime: 3000})});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.dashboardRefresher, function createDashboardRefresherService() {
        return new MS.Entertainment.UI.DashboardRefresherService
    })
})()
