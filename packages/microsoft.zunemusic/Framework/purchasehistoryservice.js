/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/utilities.js");
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI");
    WinJS.Namespace.define("MS.Entertainment.UI", {PurchaseHistoryService: MS.Entertainment.defineObservable(function PurchaseHistoryServiceConstructor() {
            this._grovelTimer = null;
            this._grovelTimerStartDate = null;
            this._sessionPurchaseFlowActivityCount = 0
        }, {
            inPurchaseFlow: false, isGroveling: false, hasGrovelEverCompleted: false, _hasPendingGrovelRequest: false, _grovelTimer: null, _grovelTimerStartDate: null, _previousAttemptFailed: false, _sessionPurchaseFlowActivityCount: null, _signInBindings: null, _purchasedEventHandler: null, _networkStatusBinding: null, _lastBookmarkSyncDate: null, isUsingXdlcForIngestion: function isUsingXdlcForIngestion() {
                    return MS.Entertainment.Utilities.isVideoApp
                }, grovel: function grovel(resetLastUpdateDateTime, restoringPurchases, ignoreIfWithinMinimumIncrement) {
                    if (this.isGroveling || !MS.Entertainment.UI.PurchaseHistoryService.isFeatureEnabled) {
                        this._hasPendingGrovelRequest = true;
                        return
                    }
                    if (ignoreIfWithinMinimumIncrement && this._grovelTimerStartDate) {
                        var configuration = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        var minimumIncrement = configuration.service.purchaseHistoryMinimumIncrementInSeconds * 1000;
                        if ((this._grovelTimerStartDate.valueOf() + minimumIncrement) > (new Date).valueOf())
                            return
                    }
                    this._stopGrovelTimer();
                    if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).isSignedIn && (MS.Entertainment.Utilities.isMusicApp || MS.Entertainment.Utilities.isVideoApp)) {
                        this.isGroveling = true;
                        var resetIsGroveling = function resetIsGroveling() {
                                this.isGroveling = false;
                                if (this._hasPendingGrovelRequest) {
                                    this._hasPendingGrovelRequest = false;
                                    this.grovel()
                                }
                            }.bind(this);
                        var grovelFunction;
                        if (this.isUsingXdlcForIngestion())
                            grovelFunction = this._grovelUsingXdlc.bind(this, restoringPurchases);
                        else
                            grovelFunction = this._grovelUsingMds.bind(this);
                        grovelFunction().then(function onGrovelingSuccess(hasFailures) {
                            if (!hasFailures && !this.hasGrovelEverCompleted)
                                this.hasGrovelEverCompleted = true;
                            resetIsGroveling();
                            this._startSync()
                        }.bind(this), function onGrovelingError(error) {
                            if (error && error.number && typeof error.number === "number")
                                error = error.number;
                            this._hasPendingGrovelRequest = false;
                            if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).isSignedIn)
                                this._startGrovelTimer(true);
                            resetIsGroveling();
                            this._startSync()
                        }.bind(this)).done(function onGrovelingCompleted() {
                            if (MS.Entertainment.Utilities.isVideoApp2) {
                                Microsoft.Entertainment.Marketplace.Marketplace.getLatestSeasonMetadataAsync();
                                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                                var watchlistEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.videoWatchlist);
                                if (watchlistEnabled) {
                                    var syncManager = new Microsoft.Entertainment.Sync.SyncManager;
                                    syncManager.syncAsync(Microsoft.Entertainment.Sync.RequestSyncOption.checkIfDirty).then(function trimWatchlist() {
                                        var watchlistService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.watchlistService);
                                        watchlistService.trimWatchlist()
                                    }.bind(this))
                                }
                            }
                        }.bind(this))
                    }
                }, _grovelUsingMds: function _grovelUsingMds() {
                    var config = MS.Entertainment.UI.PurchaseHistoryService._getConfig();
                    var historyToken = config.historyToken ? config.historyToken : "";
                    var aggressiveGrovel = config.incompletePurchaseFlows !== 0;
                    return Microsoft.Entertainment.Marketplace.Marketplace.grovelPastPurchasedMusic(historyToken, !!aggressiveGrovel).then(function grovelPastPurchasedMediaComplete(result) {
                            if (!result.hasFailures)
                                MS.Entertainment.UI.PurchaseHistoryService._setConfig(result.nextHistoryToken, 0);
                            this._startGrovelTimer(result.hasFailures);
                            return result.hasFailures
                        }.bind(this))
                }, _grovelUsingXdlc: function _grovelUsingXdlc(restoringPurchases) {
                    var configManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var forceVideoIngestionRefreshSyncToken = configManager.fulfillment.forceVideoIngestionRefreshSyncToken;
                    var dontShortCircuitAndForceUpdateAllRights = forceVideoIngestionRefreshSyncToken !== configManager.fulfillment.lastHandledIngestionRefreshSyncToken;
                    return Microsoft.Entertainment.Fulfillment.Video.Entitlements.refreshAsync(null, !!(dontShortCircuitAndForceUpdateAllRights || restoringPurchases), !!dontShortCircuitAndForceUpdateAllRights, !!restoringPurchases, true).then(function refreshVideoOffersAsync_complete(result) {
                            if (dontShortCircuitAndForceUpdateAllRights && !result.hasFailures)
                                configManager.fulfillment.lastHandledIngestionRefreshSyncToken = forceVideoIngestionRefreshSyncToken;
                            this._startGrovelTimer(result.hasFailures);
                            return result.hasFailures
                        }.bind(this), function refreshVideoOffersAsync_error(error) {
                            this._startGrovelTimer(true);
                            return WinJS.Promise.wrapError(error)
                        }.bind(this))
                }, _startGrovelTimer: function _startGrovelTimer(previousAttemptFailed) {
                    var configuration = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var secondsBeforeNextGrovel = previousAttemptFailed ? configuration.service.purchaseHistoryReattemptAfterFailureInSeconds : configuration.service.purchaseHistoryFrequencyInSeconds;
                    this._previousAttemptFailed = previousAttemptFailed;
                    this._stopGrovelTimer();
                    this._grovelTimerStartDate = new Date;
                    this._grovelTimer = WinJS.Promise.timeout(secondsBeforeNextGrovel * 1000).then(this.grovel.bind(this))
                }, _stopGrovelTimer: function _stopGrovelTimer() {
                    if (this._grovelTimer) {
                        var timer = WinJS.Binding.unwrap(this._grovelTimer);
                        if (timer)
                            timer.cancel();
                        this._grovelTimer = null
                    }
                }, _startSync: function _startSync() {
                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.videoCloudCollection)) {
                        if (this._lastBookmarkSyncDate) {
                            var configuration = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                            var safetySyncIntervalInMs = configuration.sync.videoSafetySyncIntervalInSeconds * 1000;
                            if (this._lastBookmarkSyncDate.valueOf() + safetySyncIntervalInMs > (new Date).valueOf())
                                return
                        }
                        var videoCloudCollection = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.videoCloudCollection);
                        videoCloudCollection.startSync();
                        this._lastBookmarkSyncDate = new Date
                    }
                }
        }, {
            isFeatureEnabled: {get: function isFeatureEnabled() {
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    if (MS.Entertainment.Utilities.isMusicApp)
                        return featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                    if (MS.Entertainment.Utilities.isVideoApp)
                        return featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace) || featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                    return false
                }}, enterPurchaseFlowActivity: function enterPurchaseFlowActivity() {
                    if (!MS.Entertainment.UI.PurchaseHistoryService.isFeatureEnabled)
                        return;
                    var service = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseHistory);
                    service._stopGrovelTimer();
                    if (++service._sessionPurchaseFlowActivityCount === 1) {
                        service.inPurchaseFlow = true;
                        var config = MS.Entertainment.UI.PurchaseHistoryService._getConfig();
                        MS.Entertainment.UI.PurchaseHistoryService._setConfig(config.historyToken, config.incompletePurchaseFlows + 1)
                    }
                }, leavePurchaseFlowActivity: function leavePurchaseFlowActivity(failureOccurred) {
                    if (!MS.Entertainment.UI.PurchaseHistoryService.isFeatureEnabled)
                        return;
                    var service = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseHistory);
                    service._stopGrovelTimer();
                    var purchaseFlowSessionClosed = (service._sessionPurchaseFlowActivityCount !== 0 && --service._sessionPurchaseFlowActivityCount === 0);
                    if (failureOccurred) {
                        var config = MS.Entertainment.UI.PurchaseHistoryService._getConfig();
                        MS.Entertainment.UI.PurchaseHistoryService._setConfig(config.historyToken, config.incompletePurchaseFlows + 1)
                    }
                    if (purchaseFlowSessionClosed) {
                        service.inPurchaseFlow = false;
                        var config = MS.Entertainment.UI.PurchaseHistoryService._getConfig();
                        if (config.incompletePurchaseFlows !== 0)
                            MS.Entertainment.UI.PurchaseHistoryService._setConfig(config.historyToken, config.incompletePurchaseFlows - 1);
                        service.grovel()
                    }
                }, initialize: function initialize() {
                    this._signInBindings = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).bind("isSignedIn", MS.Entertainment.UI.PurchaseHistoryService._onSignInChange);
                    MS.Entertainment.Utilities.SignIn.addEventListener("signInRefreshed", function _onSignInRefreshed() {
                        MS.Entertainment.UI.PurchaseHistoryService._onSignInChange(true)
                    });
                    if (WinJS.Utilities.getMember("App2.ApplicationModel.Store.Product"))
                        this._purchasedEventHandler = MS.Entertainment.Utilities.addEventHandlers(App2.ApplicationModel.Store.Product, {productpurchased: function onPurchaseCompleted(result) {
                                var purchaseHistoryService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseHistory);
                                if (purchaseHistoryService && !purchaseHistoryService.inPurchaseFlow)
                                    purchaseHistoryService.grovel()
                            }});
                    this._networkStatusBinding = WinJS.Binding.bind(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {networkStatus: MS.Entertainment.UI.PurchaseHistoryService._onNetworkStatusChanged})
                }, dispose: function dispose() {
                    if (this._signInBindings) {
                        this._signInBindings.cancel();
                        this._signInBindings = null
                    }
                    if (this._purchasedEventHandler) {
                        this._purchasedEventHandler.cancel();
                        this._purchasedEventHandler = null
                    }
                    if (this._networkStatusBinding) {
                        this._networkStatusBinding.cancel();
                        this._networkStatusBinding = null
                    }
                }, refreshVideoOffersAsync: function refreshVideoOffersAsync(offerIds) {
                    return Microsoft.Entertainment.Fulfillment.Video.Entitlements.refreshAsync(offerIds, true, true, true, false).then(function refreshVideoOffersAsync_complete(result) {
                            var purchaseHistoryService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseHistory);
                            if (result.hasFailures)
                                purchaseHistoryService._startGrovelTimer(true);
                            return result
                        }, function refreshVideoOffersAsync_error(error) {
                            var purchaseHistoryService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseHistory);
                            purchaseHistoryService._startGrovelTimer(true);
                            return WinJS.Promise.wrapError(error)
                        })
                }, _onNetworkStatusChanged: function _onNetworkStatusChanged(newValue) {
                    var purchaseHistoryService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseHistory);
                    if (purchaseHistoryService._previousAttemptFailed && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).isSignedIn)
                        switch (newValue) {
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unknown:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unrestricted:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.throttled:
                                WinJS.Promise.timeout(1000).then(function _onNetworkStatusChanged_delay() {
                                    purchaseHistoryService.grovel()
                                });
                                break
                        }
                }, _onSignInChange: function _onSignInChange(isSignedIn) {
                    if (!MS.Entertainment.UI.PurchaseHistoryService.isFeatureEnabled)
                        return;
                    var service = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseHistory);
                    if (isSignedIn)
                        service.grovel();
                    else {
                        service._stopGrovelTimer();
                        service.hasGrovelEverCompleted = false
                    }
                }, _getConfig: function _getConfig() {
                    var configuration = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var configString = configuration.service.pastPurchaseData;
                    var config = configString ? JSON.parse(configString) : {};
                    if (!config.historyToken)
                    {
                        config.historyToken = null;
                        config.incompletePurchaseFlows = 1
                    }
                    if (!config.incompletePurchaseFlows && !(typeof config.incompletePurchaseFlows === "number"))
                        config.incompletePurchaseFlows = 1;
                    return config
                }, _setConfig: function _setConfig(historyToken, incompletePurchaseFlows) {
                    var config = {
                            historyToken: historyToken, incompletePurchaseFlows: incompletePurchaseFlows
                        };
                    var configuration = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    configuration.service.pastPurchaseData = JSON.stringify(config)
                }
        })});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.purchaseHistory, function PurchaseHistoryServiceFactory() {
        return new MS.Entertainment.UI.PurchaseHistoryService
    })
})()
