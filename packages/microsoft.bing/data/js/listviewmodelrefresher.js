/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path="//Microsoft.WinJS.1.0/js/ui.js" />
/// <reference path="../../common/js/tracing.js" />
/// <reference path="../../common/js/utilities.js" />
/// <reference path="../../common/js/errors.js" />
/// <reference path="listviewmodel.js" />
(function () {
    "use strict";

    var localSettings = Windows.Storage.ApplicationData.current.localSettings;

    function readLastRefreshDate(storageKey) {
        /// <summary>
        /// Reads last refresh date from local settings.
        /// </summary>
        /// <param name="storageKey" type="String">
        /// Key for the store containing the date of last refresh.
        /// </param>
        /// <returns type="Date">
        /// Date of last refresh stored in local settings.
        /// </returns>
        var refreshData = localSettings.values[storageKey];
        if (refreshData) {
            try {
                return new Date(JSON.parse(refreshData).lastRefresh);
            } catch (error) {
                BingApp.traceError(
                    "ListViewModelRefresher.readLastRefreshDate: failed to parse refresh data stored in '{0}' inside local settings: '{1}'; error message: '{2}'.",
                    storageKey,
                    refreshData,
                    error.message);
            }
        } else {
            BingApp.traceInfo("ListViewModelRefresher.readLastRefreshDate: refresh data not yet stored in '{0}' inside local settings", storageKey);
        }

        return undefined;
    }

    function storeLastRefreshDate(storageKey, lastRefreshDate) {
        /// <summary>
        /// Reads last refresh date from local settings.
        /// </summary>
        /// <param name="storageKey" type="String">
        /// Key for the store containing the date of last refresh.
        /// </param>
        /// <param name="lastRefreshDate" type="Date">
        /// Date of last refresh to be stored in local settings.
        /// </param>
        localSettings.values[storageKey] = JSON.stringify({
            lastRefresh: lastRefreshDate
        });
    }

    function scheduleRefresh(refresher) {
        /// <summary>
        /// Schedules interval-based refreshing of list view model.
        /// </summary>
        /// <param name="refresher" type="BingApp.Classes.ListViewModelRefresher">
        /// Target refreher object.
        /// </param>
        /// <returns>
        /// An object representing periodic refresh operation. This object exposes cancel
        /// function that can be used to stop refresh operation.
        /// </returns>
        // Determine the time before executing refresh
        var waitingPeriod = refresher.interval * 1000 - (Date.now() - refresher.lastRefreshDate.getTime());
        var operation = (waitingPeriod > 0 ? WinJS.Promise.timeout(waitingPeriod) : WinJS.Promise.as()).then(
            function onIntervalExpired() {
                return refresher.listViewModel.refresh(refresher.refreshOptions).then(
                    function onRefreshCompleted() {
                        refresher.lastRefreshDate = new Date();
                        storeLastRefreshDate(refresher.lastRefreshDateStorageKey, refresher.lastRefreshDate);
                        return scheduleRefresh(refresher);
                    });
            });
        return operation;
    }

    /// <summary>
    /// Defines class that takes care of refreshing list view model.
    /// </summary>
    var ListViewModelRefresher = WinJS.Class.define(
        function constructor(listViewModel, options) {
            /// <summary>
            /// Creates ListViewModelRefresher object.
            /// </summary>
            /// <param name="listViewModel" type="BingApp.Classes.ListViewModel">
            /// List view model instance that will be refreshed by this object.
            /// </param>
            /// <param name="options">
            /// Object which describes refresher behavior. It must be defined in the 
            /// following format:
            ///     {
            ///         interval: /*Required. Refresh interval in seconds.*/
            ///         lastRefreshDateStorageKey: /*Optional. Key for the entry in local 
            ///                 settings containing the date of last refresh. If specified
            ///                 then first refresh will not start until given interval 
            ///                 passes since last recorded refresh date. Afterwards, 
            ///                 refresher will store new date upon successful completion of 
            ///                 refresh operation. If key is not specified or recorded value 
            ///                 is not found then first refresh will commence immediately 
            ///                 upon instantiation of refresher object.*/
            ///         refreshOptions: /*Optional. Object containing refresh options.
            ///                 Refer to documentation for ListViewModel.refresh() method
            ///                 for details. If omitted then ListViewModel.refresh will be
            ///                 called without refresh options.*/
            ///         onConfigChanged: /*Optional. Callback function to be called when 
            ///                 application configuration has been changed. The following
            ///                 parameters will be passed to the callback: 
            ///                     refresher,
            ///                     oldConfiguration,
            ///                     newConfiguration 
            ///                 It is appropriate to define this callback if configuration 
            ///                 contains information essential for refresh operation. 
            ///                 Callback implementation may contain logic that determines 
            ///                 whether to force refresh based on changes to configuration.*/
            ///     }
            /// </param>
            /// <returns type="BingApp.Classes.ListViewModelRefresher">
            /// ListViewModelRefresher instance.
            /// </returns>
            if (!(this instanceof BingApp.Classes.ListViewModelRefresher)) {
                BingApp.traceWarning("ListViewModelRefresher.ctor: Attempted using ListViewModelRefresher ctor as function; redirecting to use 'new ListViewModelRefresher()'.");
                return new BingApp.Classes.ListViewModelRefresher(listViewModel, options);
            }

            if (!listViewModel) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("listViewModel");
            }

            if (!options) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("options");
            }

            if (BingApp.Utilities.isNullOrUndefined(options.interval)) {
                throw new BingApp.Classes.ErrorArgument("options", "options.interval must be defined");
            }

            if (options.interval <= 0) {
                throw new BingApp.Classes.ErrorArgument(
                    "options",
                    BingApp.Utilities.format("options.interval must be positive, specified value is invalid: '{0}'.", options.interval));
            }

            var that = this;
            function handleConfigChange(args) {
                that.onConfigChanged(that, args.oldConfiguration, args.newConfiguration);
            }

            Object.defineProperties(this, {
                listViewModel: { value: listViewModel, writable: false, enumerable: false, configurable: false },
                interval: { value: options.interval, writable: true, enumerable: false, configurable: false },
                lastRefreshDateStorageKey: { value: options.lastRefreshDateStorageKey, writable: false, enumerable: false, configurable: false },
                refreshOptions: { value: options.refreshOptions, writable: false, enumerable: false, configurable: false },
                onConfigChanged: { value: options.onConfigChanged, writable: false, enumerable: false, configurable: false },
                configChangedListener: { value: handleConfigChange, writable: false, enumerable: false, configurable: false },
                lastRefreshDate: { value: new Date(0), writable: true, enumerable: false, configurable: false },
                currentScheduledRefresh: { writable: true, enumerable: false, configurable: false },
            });

            // Setup listener for configuration changes
            if (this.onConfigChanged) {
                BingApp.locator.eventRelay.addEventListener(BingApp.Classes.AppConfiguration.events.configChanged, this.configChangedListener);
            }

            // Read last refresh date from local settings
            if (this.lastRefreshDateStorageKey) {
                var storedDate = readLastRefreshDate(this.lastRefreshDateStorageKey);
                if (storedDate) {
                    this.lastRefreshDate = storedDate;
                    BingApp.traceInfo(
                        "ListViewModelRefresher.ctor: lastRefreshDate is loaded from storage entry '{0}' and set to '{1}' value.",
                        this.lastRefreshDateStorageKey,
                        storedDate);
                } else {
                    BingApp.traceInfo(
                        "ListViewModelRefresher.ctor: lastRefreshDate was not found in storage under {0} entry; default value is used: '{1}'.",
                        this.lastRefreshDateStorageKey,
                        this.lastRefreshDate);
                }
            } else {
                BingApp.traceInfo(
                    "ListViewModelRefresher.ctor: storage key for lastRefreshDate was not specified; default value is used: '{0}'.",
                    this.lastRefreshDate);
            }

            this.currentScheduledRefresh = scheduleRefresh(this);
        },
        {
            updateInterval: function (interval) {
                /// <summary>
                /// Changes refresh interval.
                /// </summary>
                /// <param name="interval" type="Number">
                /// New refresh interval in seconds.
                /// </param>
                if (!this.currentScheduledRefresh) {
                    throw new BingApp.Classes.ErrorInvalidOperation("ListViewModelRefresher.updateInterval", "Called on disposed ListViewModelRefresher object.");
                }

                if (BingApp.Utilities.isNullOrUndefined(interval)) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("interval");
                }

                if (interval <= 0) {
                    throw new BingApp.Classes.ErrorArgument(
                        "interval",
                        BingApp.Utilities.format("interval must be positive, specified value is invalid: '{0}'.", interval));
                }

                this.currentScheduledRefresh.cancel();
                this.interval = interval;
                this.currentScheduledRefresh = scheduleRefresh(this);
            },
            forceRefresh: function () {
                /// <summary>
                /// Executes refresh immediately.
                /// </summary>
                if (!this.currentScheduledRefresh) {
                    throw new BingApp.Classes.ErrorInvalidOperation("ListViewModelRefresher.forceRefresh", "Called on disposed ListViewModelRefresher object.");
                }

                this.currentScheduledRefresh.cancel();

                this.lastRefreshDate = new Date(0); // this will set Date to minimal allowed value
                storeLastRefreshDate(this.lastRefreshDateStorageKey, this.lastRefreshDate);

                this.currentScheduledRefresh = scheduleRefresh(this);
            },
            dispose: function () {
                /// <summary>
                /// Disposes of this object and cancels any future list view model refreshes.
                /// </summary>
                if (!this.currentScheduledRefresh) {
                    throw new BingApp.Classes.ErrorInvalidOperation("ListViewModelRefresher.dispose", "Called on disposed ListViewModelRefresher object.");
                }

                // Remove listener for configuration changes
                if (this.onConfigChanged) {
                    BingApp.locator.eventRelay.removeEventListener(BingApp.Classes.AppConfiguration.events.configChanged, this.configChangedListener);
                }

                this.currentScheduledRefresh.cancel();
                this.currentScheduledRefresh = null;
            }
        });

    WinJS.Namespace.define("BingApp.Classes", {
        ListViewModelRefresher: ListViewModelRefresher
    });
})();