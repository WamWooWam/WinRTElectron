/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* >>>>>>/controls/video/videodownloadmanager.js:2 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";

    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {DownloadManagerGroupActions: {
            PauseAll: "PauseAll", ResumeAll: "ResumeAll", CancelAll: "CancelAll"
        }});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        VideoDownloadManagerDialog: MS.Entertainment.UI.Framework.defineUserControl("/Controls/Video/VideoDownloadManager.html#videoDownloadManagerDialogTemplate", function VideoDownloadManagerDialog() {
            this.templateSelectorConstructor = MS.Entertainment.UI.Controls.VideoDownloadTemplateSelector
        }, {
            _hasPopulatedList: false, _updatingGalleryItems: false, _overlay: null, _refreshTimer: null, _refreshInterval: 3, setOverlay: function setOverlay(instance) {
                    this._overlay = instance;
                    var that = this;
                    this._overlay.buttons = [WinJS.Binding.as({
                            title: String.load(String.id.IDS_VIDEO_DOWNLOAD_MANAGER_PAUSE_ALL), isEnabled: true, isAvailable: false, execute: function onPauseAll() {
                                    that._onPauseAll()
                                }
                        }), WinJS.Binding.as({
                            title: String.load(String.id.IDS_VIDEO_DOWNLOAD_MANAGER_RESUME_All), isEnabled: true, isAvailable: false, execute: function onResumeAll() {
                                    that._onResumeAll()
                                }
                        }), WinJS.Binding.as({
                            title: String.load(String.id.IDS_VIDEO_DOWNLOAD_MANAGER_CANCEL_ALL), isEnabled: true, isAvailable: false, execute: function onCancelAll() {
                                    that._onCancelAll()
                                }
                        }), WinJS.Binding.as({
                            title: String.load(String.id.IDS_VIDEO_DOWNLOAD_MANAGER_CLOSE), isEnabled: true, execute: function onClose() {
                                    that._onClose()
                                }
                        })];
                    this._overlay.defaultButtonIndex = 2;
                    this._overlay.cancelButtonIndex = 2;
                    this._setInitialState()
                }, _setInitialState: function _setInitialState() {
                    this._enablePauseAllButton(false);
                    this._enableResumeAllButton(false);
                    this._enableCancelAllButton(false);
                    this._queryDatabaseItems()
                }, _applyGroupAction: function applyGroupAction(groupActionType) {
                    return this.getMarketplaceNativeFileDownloadsAsync().then(function getMarketplaceNativeFileDownloadsAsync_complete(nativeItems) {
                            if (!nativeItems)
                                return;
                            for (var i = 0; i < nativeItems.length; i++) {
                                var nativeItem = nativeItems[i];
                                if (nativeItem.libraryTypeId !== Microsoft.Entertainment.Queries.ObjectType.video)
                                    continue;
                                if (nativeItem.taskStatus !== Microsoft.Entertainment.FileTransferStatus.completed && nativeItem.taskStatus !== Microsoft.Entertainment.FileTransferStatus.canceled && !nativeItem.isClosed)
                                    switch (groupActionType) {
                                        case MS.Entertainment.UI.Controls.DownloadManagerGroupActions.PauseAll:
                                            nativeItem.pause();
                                            break;
                                        case MS.Entertainment.UI.Controls.DownloadManagerGroupActions.CancelAll:
                                            nativeItem.cancel();
                                            break;
                                        case MS.Entertainment.UI.Controls.DownloadManagerGroupActions.ResumeAll:
                                            nativeItem.resume();
                                            break
                                    }
                            }
                        }.bind(this))
                }, _queryDatabaseItems: function queryDatabaseItems() {
                    return this.getMarketplaceNativeFileDownloadsAsync().then(function getMarketplaceNativeFileDownloadsAsync_complete(nativeDownloadTasks) {
                            var downloadTasks = [];
                            var videoLibraryIds = [];
                            if (!nativeDownloadTasks)
                                return;
                            for (var i = 0; i < nativeDownloadTasks.length; i++) {
                                var downloadTask = nativeDownloadTasks[i];
                                if (downloadTask.libraryTypeId !== Microsoft.Entertainment.Queries.ObjectType.video)
                                    continue;
                                if (downloadTask.taskStatus !== Microsoft.Entertainment.FileTransferStatus.completed && downloadTask.taskStatus !== Microsoft.Entertainment.FileTransferStatus.canceled && !downloadTask.isClosed) {
                                    downloadTasks.push(downloadTask);
                                    videoLibraryIds.push(downloadTask.libraryId)
                                }
                            }
                            return this._getVideoDetails(videoLibraryIds).then(function getVideoDetailsComplete(dbItems) {
                                    if (!dbItems)
                                        return;
                                    var dbItemArray = [];
                                    dbItems.forEach(function(currentDbItem) {
                                        var currentMediaItem = currentDbItem.item.data;
                                        downloadTasks.forEach(function(currentDownloadTask) {
                                            if (currentDownloadTask.mediaId === currentMediaItem.serviceId) {
                                                currentMediaItem.downloadTask = currentDownloadTask;
                                                currentMediaItem.hydrated = true;
                                                dbItemArray.push(currentMediaItem)
                                            }
                                        })
                                    });
                                    dbItemArray.sort(function(a, b) {
                                        if (a.downloadTask.taskStatus < b.downloadTask.taskStatus)
                                            return -1;
                                        else if (a.downloadTask.taskStatus === b.downloadTask.taskStatus)
                                            return b.downloadTask.percentage - a.downloadTask.percentage;
                                        else
                                            return 1
                                    });
                                    if (this._galleryControl)
                                        this._galleryControl.dataSource = new MS.Entertainment.Data.VirtualList(null, dbItemArray);
                                    this._hasPopulatedList = true;
                                    this._updateGroupActions(downloadTasks);
                                    this._resetTimer()
                                }.bind(this), function getVideoDetailsFailed(error) {
                                    MS.Entertainment.UI.Controls.fail("Error while querying the DB for the active downloads in the Download Manager.")
                                })
                        }.bind(this))
                }, _updateGalleryItems: function updateGalleryItems(newItems) {
                    if (!this._hasPopulatedList || !this._galleryControl || !this._galleryControl.dataSource || this._updatingGalleryItems)
                        return;
                    this._updatingGalleryItems = true;
                    this.getMarketplaceNativeFileDownloadsAsync().then(function getMarketplaceNativeFileDownloadsAsync_complete(nativeDownloadTasks) {
                        var downloadTasks = [];
                        if (!nativeDownloadTasks || nativeDownloadTasks.length === 0) {
                            if (this._galleryControl && this._galleryControl.dataSource) {
                                this._galleryControl.dataSource.setSource([]);
                                this._updateGroupActions(downloadTasks)
                            }
                            return
                        }
                        for (var i = 0; i < nativeDownloadTasks.length; i++) {
                            var downloadTask = nativeDownloadTasks[i];
                            if (downloadTask.libraryTypeId !== Microsoft.Entertainment.Queries.ObjectType.video)
                                continue;
                            if (downloadTask.taskStatus !== Microsoft.Entertainment.FileTransferStatus.canceled && downloadTask.taskStatus !== Microsoft.Entertainment.FileTransferStatus.completed && !downloadTask.isClosed)
                                downloadTasks.push(downloadTask)
                        }
                        downloadTasks.sort(function(a, b) {
                            if (a.taskStatus < b.taskStatus)
                                return -1;
                            else if (a.taskStatus === b.taskStatus)
                                return b.percentage - a.percentage;
                            else
                                return 1
                        });
                        for (var listIndex = 0; this._galleryControl && (listIndex < this._galleryControl.dataSource.count); listIndex++) {
                            var currentItem = this._galleryControl.dataSource.getItem(listIndex);
                            var found = false;
                            if (!currentItem || !currentItem.data)
                                continue;
                            for (var taskIndex = 0; taskIndex < downloadTasks.length; taskIndex++)
                                if (downloadTasks[taskIndex].mediaId === currentItem.data.serviceId) {
                                    currentItem.data.downloadTask = downloadTasks[taskIndex];
                                    found = true;
                                    break
                                }
                            if (!found) {
                                this._galleryControl.clearSelection();
                                this._galleryControl.dataSource.removeAt(listIndex);
                                listIndex--
                            }
                        }
                        for (var sortIndex = 0; sortIndex < downloadTasks.length; sortIndex++) {
                            var currentTask = downloadTasks[sortIndex];
                            for (var listIndex = 0; listIndex < this._galleryControl.dataSource.count; listIndex++) {
                                var listItem = this._galleryControl.dataSource.getItem(listIndex);
                                if (listItem && currentTask.mediaId === listItem.data.serviceId) {
                                    if (listIndex !== sortIndex)
                                        this._galleryControl.dataSource.moveAt(listIndex, sortIndex);
                                    break
                                }
                            }
                        }
                        this._updateGroupActions(downloadTasks);
                        this._resetTimer()
                    }.bind(this)).done(function() {
                        this._updatingGalleryItems = false
                    }.bind(this), function() {
                        this._updatingGalleryItems = false
                    }.bind(this))
                }, _getVideoDetails: function getVideoDetails(libraryIds) {
                    var query = new MS.Entertainment.Data.Query.libraryVideos;
                    query.objectIds = libraryIds;
                    return query.execute().then(function getVideoDetailsComplete(q) {
                            return q.result.items
                        }.bind(this), function getVideoDetailsFailed(error) {
                            MS.Entertainment.UI.Controls.fail("Error while querying the DB for the active downloads in the Download Manager.")
                        })
                }, _updateGroupActions: function updateGroupActions(downloadTasks) {
                    var active = 0;
                    var canRetry = 0;
                    var failed = 0;
                    var pending = 0;
                    var paused = 0;
                    for (var i = 0; i < downloadTasks.length; i++) {
                        var downloadTask = downloadTasks[i];
                        if (downloadTask.libraryTypeId !== Microsoft.Entertainment.Queries.ObjectType.video)
                            continue;
                        if (downloadTask.taskStatus !== Microsoft.Entertainment.FileTransferStatus.completed && downloadTask.taskStatus !== Microsoft.Entertainment.FileTransferStatus.canceled && !downloadTask.isClosed)
                            switch (downloadTask.taskStatus) {
                                case Microsoft.Entertainment.FileTransferStatus.pending:
                                case Microsoft.Entertainment.FileTransferStatus.notStarted:
                                    ++pending;
                                    break;
                                case Microsoft.Entertainment.FileTransferStatus.error:
                                    if (downloadTask.canRetry)
                                        ++canRetry;
                                    ++failed;
                                    break;
                                case Microsoft.Entertainment.FileTransferStatus.canceled:
                                    break;
                                case Microsoft.Entertainment.FileTransferStatus.paused:
                                    ++paused;
                                    break;
                                default:
                                    ++active;
                                    break
                            }
                    }
                    var hasPending = (pending > 0);
                    var hasActive = (active > 0);
                    var hasFailed = (failed > 0);
                    var hasRetryable = (canRetry > 0);
                    var hasPaused = (paused > 0);
                    this._enablePauseAllButton(hasPending || hasActive);
                    this._enableResumeAllButton(hasPaused);
                    this._enableCancelAllButton(hasPending || hasActive || hasFailed || hasPaused);
                    this.showDownloads = (this._galleryControl && this._galleryControl.dataSource && this._galleryControl.dataSource.count > 0);
                    var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    this.showCopyingFilesHelpLink = (this.showDownloads && config.video.showDownloadCopyingHelpLink)
                }, getMarketplaceNativeFileDownloadsAsync: function getMarketplaceNativeFileDownloadsAsync() {
                    if (Microsoft.Entertainment.FileTransferQuery) {
                        var query = new Microsoft.Entertainment.FileTransferQuery;
                        query.requestType = Microsoft.Entertainment.FileTransferRequestType.marketPlace;
                        if (query && Microsoft.Entertainment.FileTransferManager)
                            return Microsoft.Entertainment.FileTransferManager.getFileDownloadsByQueryAsync(query).then(function getFileDownloadsByQueryAsync_complete(nativeItems) {
                                    if (nativeItems)
                                        return WinJS.Promise.wrap(nativeItems);
                                    return WinJS.Promise.wrap([])
                                }, function getFileDownloadsByQueryAsync_error(e) {
                                    return WinJS.Promise.wrap([])
                                });
                        else
                            return WinJS.Promise.wrap([])
                    }
                    else
                        return WinJS.Promise.wrap([])
                }, _enablePauseAllButton: function enablePauseAllButton(enable) {
                    if (this._overlay)
                        this._overlay.buttons[0].isAvailable = enable
                }, _enableResumeAllButton: function enableResumeAllButton(enable) {
                    if (this._overlay)
                        this._overlay.buttons[1].isAvailable = enable
                }, _enableCancelAllButton: function enableCancelAllButton(enable) {
                    if (this._overlay)
                        this._overlay.buttons[2].isAvailable = enable
                }, _resetTimer: function _restartTimer() {
                    window.clearTimeout(this._timer);
                    var refreshListIntervalMs = this._refreshInterval * 1000;
                    this._timer = window.setTimeout(function() {
                        this._updateGalleryItems()
                    }.bind(this), refreshListIntervalMs)
                }, _onPauseAll: function onPauseAll() {
                    return this._applyGroupAction(MS.Entertainment.UI.Controls.DownloadManagerGroupActions.PauseAll)
                }, _onResumeAll: function onResumeAll() {
                    return this._applyGroupAction(MS.Entertainment.UI.Controls.DownloadManagerGroupActions.ResumeAll)
                }, _onCancelAll: function onCancelAll() {
                    return this._applyGroupAction(MS.Entertainment.UI.Controls.DownloadManagerGroupActions.CancelAll)
                }, _onClose: function onClose() {
                    if (this._overlay)
                        this._overlay.hide()
                }
        }, {
            showDownloads: true, showCopyingFilesHelpLink: false, templateSelectorConstructor: MS.Entertainment.UI.Controls.GalleryTemplateSelector
        }), VideoDownloadTemplateSelector: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.Controls.GalleryTemplateSelector", function videoDownloadTemplateSelector(galleryView) {
                MS.Entertainment.UI.Controls.GalleryTemplateSelector.prototype.constructor.call(this);
                this._galleryView = galleryView;
                this.addTemplate("episode", "/Controls/Video/VideoDownloadItem.html#episodeDownloadItemHost");
                this.addTemplate("movie", "/Controls/Video/VideoDownloadItem.html#movieDownloadItemHost")
            }, {onSelectTemplate: function onSelectTemplate(item) {
                    var template = null;
                    if (item && item.data) {
                        var data = item.data || {};
                        switch (data.videoType) {
                            case Microsoft.Entertainment.Queries.VideoType.tvEpisode:
                                template = "episode";
                                break;
                            case Microsoft.Entertainment.Queries.VideoType.movie:
                                template = "movie";
                                break;
                            default:
                                throw new Error("videoType not recognized for video download manager!");
                        }
                    }
                    this.ensureTemplatesLoaded([template]);
                    return this.getTemplateProvider(template)
                }}), ShowVideoDownloadManagerDialogAction: MS.Entertainment.deferredDerive(MS.Entertainment.UI.Actions.Action, null, {
                automationId: MS.Entertainment.UI.AutomationIds.showDownloadManager, canExecute: function canExecute() {
                        return true
                    }, executed: function() {
                        MS.Entertainment.UI.Shell.showDialog(String.load(String.id.IDS_VIDEO_DOWNLOAD_MANAGER_TITLE), "MS.Entertainment.UI.Controls.VideoDownloadManagerDialog", {
                            width: null, height: null, customStyle: "videoDownloadManagerDialog"
                        })
                    }
            })
    });
    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).register(MS.Entertainment.UI.Actions.ActionIdentifiers.showVideoDownloadManager, function() {
        return new MS.Entertainment.UI.Controls.ShowVideoDownloadManagerDialogAction
    })
})()
})();
/* >>>>>>/framework/purchasehistoryservice.js:306 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

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
                            if (MS.Entertainment.Utilities.isVideoApp2)
                                Microsoft.Entertainment.Marketplace.Marketplace.getLatestSeasonMetadataAsync()
                        })
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
})();
/* >>>>>>/components/playback/controls/mediaplayer.js:532 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Platform.Playback");
(function() {
    "use strict";
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    var DeviceGroup = WinJS.Namespace.define("Microsoft.Entertainment.Service.Requests.DeviceGroup", null);
    var HNS_PER_MILLISECOND = 10000;
    var FourCCMap = {
            Unknown: "Unknown", "858604357": "EC-3", "1279476033": "AACL", "1212367169": "AACH", "875967048": "H.264"
        };
    function getPassportTicketAsync(returnEmptyOnFailure) {
        if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.sessionManager))
            return WinJS.Promise.wrapError("No SessionMgr is registered");
        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
        return sessionMgr.getPassportTicketAsync(returnEmptyOnFailure)
    }
    function isBlobUrl(url) {
        var blobUrlRegex = /^blob:/i;
        return blobUrlRegex.test(url)
    }
    function enumToString(enumValue, enumeration) {
        for (var name in enumeration)
            if (enumValue === enumeration[name])
                return name;
        return "unknown"
    }
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {
        MediaPlayer: MS.Entertainment.UI.Framework.define(function MediaPlayer_constructor(playerType, mediaInstance, autoPlay) {
            if (!this._tagPlayer)
                this._tagPlayer = this._createHtmlTag(playerType, mediaInstance, autoPlay);
            this._autoPlay = autoPlay;
            this._media = mediaInstance
        }, {
            autoplay: {
                get: function autoplay_get() {
                    return this._autoPlay
                }, set: function autoplay_set(value) {
                        this._autoPlay = value
                    }
            }, muted: {
                    get: function muted_get() {
                        return this._tagPlayer.muted
                    }, set: function muted_set(value) {
                            this._tagPlayer.muted = value
                        }
                }, volume: {
                    get: function volume_get() {
                        return this._tagPlayer.volume
                    }, set: function volume_set(value) {
                            this._tagPlayer.volume = value
                        }
                }, currentTime: {
                    get: function currentTime_get() {
                        return this._tagPlayer.currentTime
                    }, set: function currentTime_set(value) {
                            this._tagPlayer.currentTime = value
                        }
                }, duration: {get: function duration_get() {
                        if (this._tagPlayer.durationOverrideMS)
                            return this._tagPlayer.durationOverrideMS / 1000;
                        return this._tagPlayer.duration
                    }}, error: {get: function error_get() {
                        return this._tagPlayer.error
                    }}, media: {get: function media_get() {
                        return this._media
                    }}, playerType: {get: function playerType_get() {
                        return this._tagPlayer.tagName
                    }}, playbackRate: {
                    get: function playbackRate_get() {
                        return this._tagPlayer.playbackRate
                    }, set: function playbackRate_set(value) {
                            this._tagPlayer.playbackRate = value
                        }
                }, buffered: {get: function buffered_get() {
                        return this._tagPlayer.buffered
                    }}, ended: {get: function ended_get() {
                        return this._tagPlayer.ended
                    }}, isDisposed: {get: function isDisposed_get() {
                        return this._disposed
                    }}, skipThisError: {
                    get: function skipThisError_get() {
                        return this._skipThisError
                    }, set: function skipThisError_set(value) {
                            this._skipThisError = value
                        }
                }, msPlayToDisabled: {get: function msPlayToDisabled_get() {
                        return this._tagPlayer.msPlayToDisabled
                    }}, msPlayToSource: {get: function msPlayToSource_get() {
                        return this._tagPlayer.msPlayToSource
                    }}, play: function MediaPlayer_play() {
                    MSEPlatform.Playback.Etw.traceString("MediaPlayer::Play()");
                    this._tagPlayer.play()
                }, pause: function MediaPlayer_pause() {
                    MSEPlatform.Playback.Etw.traceString("MediaPlayer::Pause()");
                    this._tagPlayer.pause()
                }, stop: function MediaPlayer_stop() {
                    this.pause()
                }, seekToPosition: function MediaPlayer_seekToPosition(positionMsec) {
                    try {
                        var positionSec = positionMsec / 1000;
                        this._tagPlayer.currentTime = positionSec
                    }
                    catch(e) {
                        MSEPlatform.Playback.Etw.tracePlaybackError(e.code, e.msExtendedCode, "MediaPlayer::seekToPosition")
                    }
                }, forceTimeUpdate: function MediaPlayer_forceTimeUpdate() {
                    return this._tagPlayer.currentTime * 1000
                }, addEventListener: function MediaPlayer_addEventListener(type, listener, useCapture) {
                    this._tagPlayer.addEventListener(type, listener, useCapture)
                }, removeEventListener: function MediaPlayer_removeEventListener(type, listener, useCapture) {
                    this._tagPlayer.removeEventListener(type, listener, useCapture)
                }, getElement: function MediaPlayer_getElement() {
                    return this._tagPlayer
                }, getMediaDurationMS: function MediaPlayer_getMediaDurationMS() {
                    function getDurationMS(duration) {
                        if (duration) {
                            if (duration.getMinutes)
                                duration = ((duration.getHours() * 60 * 60) + (duration.getMinutes() * 60) + duration.getSeconds()) * 1000
                        }
                        else
                            duration = 0;
                        return duration
                    }
                    var duration = null;
                    if (this._media && this._media._mediaItem && this._media._mediaItem.data)
                        duration = this._media._mediaItem.data.duration;
                    return getDurationMS(duration)
                }, dispose: function MediaPlayer_dispose() {
                    MSEPlatform.Playback.Etw.traceString("MediaPlayer::dispose: Disposing tag");
                    if (this._tagPlayer._mediaProtectionManagerBindings) {
                        this._tagPlayer._mediaProtectionManagerBindings.cancel();
                        this._tagPlayer._mediaProtectionManagerBindings = null
                    }
                    this._tagPlayer.removeAttribute("src");
                    this._tagPlayer.load();
                    this._media = null;
                    this._disposed = true
                }, configureDRM: function MediaPlayer_configureDRM() {
                    var that = this;
                    var htmlTag = this._tagPlayer;
                    var mediaInstance = this._media;
                    var Playback = MSEPlatform.Playback;
                    var licenseLog = "";
                    var startLicenseAcquisitionTime = new Date;
                    MSEPlatform.Playback.assert(mediaInstance, "mediaInstance should not be null");
                    function getKidFromServiceRequest(e) {
                        return e && e.request && e.request.contentHeader ? e.request.contentHeader.keyIdString : String.empty
                    }
                    function serviceRequested(e) {
                        function onPlaySRCompleted(asyncOp) {
                            if (e && e.completion && e.completion.complete)
                                e.completion.complete(true);
                            MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "License acquisition succeeded");
                            var elapsedTime = new Date - startLicenseAcquisitionTime;
                            Playback.Etw.traceString("DRM:LA Time Elapsed (ms) : " + elapsedTime);
                            licenseLog = "";
                            if (Playback.AudioPlayer.fastStartBlockedOnLA)
                                Playback.AudioPlayer.fastStartBlockedOnLA = false;
                            if (mediaInstance.mediaType === Microsoft.Entertainment.Queries.ObjectType.track && !mediaInstance.trackLeafLicenseAcquired && mediaInstance.isLocal)
                                mediaInstance.trackLeafLicenseAcquired = true
                        }
                        function onPlaySRError(error) {
                            var errorCode = (error && error.number) ? error.number : "unknown";
                            Playback.Etw.traceString("DRM:onPlaySRError: " + errorCode);
                            MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "License acquisition failed with error " + errorCode);
                            var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                            if (error && error.number === MSEPlatform.Playback.Error.NS_E_DRM_INVALID_LICENSE.code && (mediaInstance.mediaType === Microsoft.Entertainment.Queries.ObjectType.track) && signedInUser && signedInUser.isSubscription && mediaInstance.isLocal) {
                                Playback.Etw.traceString("DRM:onPlaySRError: retry root LA for subscription downloaded content");
                                getPassportTicketAsync().then(function _gotTicket(ticket) {
                                    MSEPlatform.Playback.drmIndividualizationPromise.then(function _doAcquireRootLicense() {
                                        Microsoft.Entertainment.Util.PlayReadyHandler.acquireRootLicense(ticket)
                                    })
                                }).then(function _rootSucceeded() {
                                    Playback.Etw.traceString("DRM:onPlaySRError: root LA retry SUCCEEDED");
                                    MS.Entertainment.Utilities.Telemetry.logRootLicenseAcquisition("succeeded");
                                    if (e && e.completion && e.completion.complete)
                                        e.completion.complete(true)
                                }, function _rootFailed(error) {
                                    Playback.Etw.traceString("DRM:onPlaySRError: root LA retry FAILED: " + errorCode);
                                    MS.Entertainment.Utilities.Telemetry.logRootLicenseAcquisition("failed", errorCode);
                                    that._drmNotifyError(error, "DRM ServiceRequest Error (Root LA Retry): " + licenseLog, e)
                                })
                            }
                            else if (error && error.number === MSEPlatform.Playback.Error.MF_E_UNSUPPORTED_RATE.code && mediaInstance.mediaType !== Microsoft.Entertainment.Queries.ObjectType.track && mediaInstance.smidEnablerInEffect && mediaInstance.isLocal)
                                that._drmNotifyError(MSEPlatform.Playback.Error.ZEST_E_ASSET_LICENSE_RIGHT_NOT_OWNED, "Protected Video Content SMID is not owned. " + licenseLog, e);
                            else
                                that._drmNotifyError(error, "DRM ServiceRequest Error: " + licenseLog, e)
                        }
                        function onPlaySRProgress(report) {
                            if (report.indexOf("lease") === -1) {
                                var elapsedTime = new Date - startLicenseAcquisitionTime;
                                Playback.Etw.traceString("DRM:" + elapsedTime + ":" + report);
                                licenseLog += elapsedTime + " : " + report + "\n"
                            }
                            else
                                try {
                                    var leaseObject = JSON.parse(report);
                                    mediaInstance.initialLease = leaseObject.lease
                                }
                                catch(e) {
                                    Playback.Etw.traceString("Exception thrown when parsing the lease: " + report)
                                }
                        }
                        try {
                            if (!mediaInstance)
                                return;
                            if (e.request.type === Microsoft.Media.PlayReadyClient.PlayReadyStatics.individualizationServiceRequestType) {
                                MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, String.empty, "Individualization Requested");
                                e.request.beginServiceRequest().then(function indiv_complete() {
                                    MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, String.empty, "Individualization Successful");
                                    try {
                                        var next = e.request.nextServiceRequest();
                                        if (next) {
                                            e.request = next;
                                            serviceRequested(e)
                                        }
                                        else
                                            onPlaySRCompleted()
                                    }
                                    catch(ex) {
                                        MSEPlatform.Playback.MediaPlayer.drmNotifyException(htmlTag, ex, "DRM Individualization Service Request")
                                    }
                                }, function indiv_error() {
                                    MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, String.empty, "Individualization Failed");
                                    that._drmNotifyError(MSEPlatform.Playback.Error.NS_E_DRM_NEEDS_INDIVIDUALIZATION, null, e)
                                });
                                return
                            }
                            MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "License Needed");
                            mediaInstance.fillDownloadSubscriptionInfoAsync().then(function fillDownloadSubscriptionInfoAsync_complete() {
                                if (!mediaInstance.nativeLicenseRight && mediaInstance.mediaType === Microsoft.Entertainment.Queries.ObjectType.track && mediaInstance.isLocal)
                                    mediaInstance.nativeLicenseRight = Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.subscriptionDownload;
                                var right = MSEPlatform.PurchaseHelpers.LicenseRightMap.toScript(mediaInstance.nativeLicenseRight);
                                return getPassportTicketAsync(right === MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.FreeStream).then(function execute_drm_serviceRequest(ticket) {
                                        var handler;
                                        try {
                                            if (MS.Entertainment.Utilities.isEmptyGuid(mediaInstance.mediaInstanceId) || !right) {
                                                if (mediaInstance.mediaType === Microsoft.Entertainment.Queries.ObjectType.track) {
                                                    MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Track has no MIID or no rights");
                                                    that._drmNotifyError(MSEPlatform.Playback.Error.ZUNE_E_NO_SUBSCRIPTION_DOWNLOAD_RIGHTS, "No rights to this content", e);
                                                    return
                                                }
                                                else if (mediaInstance.signedLicensePolicyTicket) {
                                                    handler = Microsoft.Entertainment.Util.PlayReadyHandler.createForVideoLicensePolicyTicket(mediaInstance.signedLicensePolicyTicket, !mediaInstance.isLocal);
                                                    MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Attempting LPT enabler")
                                                }
                                                else if (!MS.Entertainment.Utilities.isEmptyGuid(mediaInstance.serviceIdSafe)) {
                                                    mediaInstance.smidEnablerInEffect = true;
                                                    handler = Microsoft.Entertainment.Util.PlayReadyHandler.createForVideoServiceMediaId(mediaInstance.serviceIdSafe, !mediaInstance.isLocal);
                                                    MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Attempting SMID enabler")
                                                }
                                                else if (mediaInstance._mediaItem && mediaInstance._mediaItem.data && mediaInstance._mediaItem.data.fileItem) {
                                                    MSEPlatform.PurchaseHelpers.getServiceIdAsync(mediaInstance._mediaItem.data.fileItem).done(function crackedSmid(smid) {
                                                        if (smid) {
                                                            mediaInstance.smidEnablerInEffect = true;
                                                            mediaInstance._mediaItem.data.zuneId = smid;
                                                            handler = Microsoft.Entertainment.Util.PlayReadyHandler.createForVideoServiceMediaId(smid, !mediaInstance.isLocal);
                                                            handler.beginServiceRequest(e.request).then(onPlaySRCompleted, onPlaySRError, onPlaySRProgress)
                                                        }
                                                        else {
                                                            MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Media has no SMID assigned");
                                                            that._drmNotifyError(MSEPlatform.Playback.Error.X8_E_PLAYBACK_PROTECTED_MEDIA_NOT_IDENTIFIED, "Media has no SMID assigned", e)
                                                        }
                                                    }, function cannotCrackSmid(error) {
                                                        MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Cannot crack SMID" + error);
                                                        that._drmNotifyError(MSEPlatform.Playback.Error.X8_E_PLAYBACK_PROTECTED_MEDIA_NOT_IDENTIFIED, "Cannot crack SMID " + error, e)
                                                    });
                                                    return
                                                }
                                            }
                                            else if (mediaInstance.mediaType === Microsoft.Entertainment.Queries.ObjectType.track && mediaInstance.trackLeafLicenseAcquired) {
                                                Playback.Etw.traceString("DRM:onPlaySRError: retry root LA for subscription downloaded content");
                                                handler = new Microsoft.Entertainment.Util.PlayReadyHandler(ticket);
                                                MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Attempting root subscription enabler")
                                            }
                                            else {
                                                handler = new Microsoft.Entertainment.Util.PlayReadyHandler(ticket, right, mediaInstance.shouldLogToDrmDownloadHistory, mediaInstance.offerId ? mediaInstance.offerId : MS.Entertainment.Utilities.EMPTY_GUID, mediaInstance.mediaInstanceId);
                                                MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Attempting MIID+Offer enabler")
                                            }
                                            handler.beginServiceRequest(e.request).then(onPlaySRCompleted, onPlaySRError, onPlaySRProgress)
                                        }
                                        catch(ex) {
                                            MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Unexpected exception thrown");
                                            MSEPlatform.Playback.MediaPlayer._drmNotifyException(that, ex, "License Acquisition Service Request")
                                        }
                                    }, function sign_in_failure(error) {
                                        MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Sign in Failed");
                                        that._drmNotifyError(MSEPlatform.Playback.Error.ZEST_E_SIGNIN_REQUIRED, null, e)
                                    })
                            }, function fillDownloadSubscriptionInfoAsync_error(error) {
                                MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Media Detail Query failed");
                                that._drmNotifyError(MSEPlatform.Playback.Error.X8_E_PLAYBACK_PROTECTED_MEDIA_NOT_IDENTIFIED, "Media has no SMID assigned", e)
                            }).done(null, function reactiveLicenseAcquisitionFailed(error) {
                                MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Unexpected outer exception thrown");
                                that._drmNotifyError(error, "serviceRequested", e)
                            })
                        }
                        catch(ex) {
                            MS.Entertainment.Utilities.Telemetry.logReactiveLicenseAcquisitionProgress(mediaInstance, getKidFromServiceRequest(e), "Unexpected outer exception thrown");
                            MSEPlatform.Playback.MediaPlayer._drmNotifyException(that, ex, "serviceRequested")
                        }
                    }
                    function componentLoadFailed(e) {
                        var traceMsg = "";
                        var postPendedText = "";
                        try {
                            traceMsg += e.information.items.size + " failed components!\n";
                            traceMsg += "Components:\n";
                            var size = e.information.items.size;
                            for (var i = 0; i < size; i++) {
                                traceMsg += e.information.items[i].name + "\nReasons=" + e.information.items[i].reasons + "\n" + "Renewal Id=" + e.information.items[i].renewalId + "\n";
                                postPendedText += ("    - " + e.information.items[i].name + "\n")
                            }
                            e.completion.complete(true);
                            traceMsg += "Resumed source (false)\n";
                            MSEPlatform.Playback.Etw.traceString(traceMsg);
                            that._drmNotifyError(MSEPlatform.Playback.Error.X8_E_PLAYBACK_COMPONENT_LOAD_FAILURE, null, null, postPendedText)
                        }
                        catch(e) {
                            MSEPlatform.Playback.MediaPlayer._drmNotifyException(that, e, "componentLoadFailed")
                        }
                    }
                    var mediaProtectionManager = new Windows.Media.Protection.MediaProtectionManager;
                    mediaProtectionManager.properties["Windows.Media.Protection.MediaProtectionSystemId"] = "{F4637010-03C3-42CD-B932-B48ADF3A6A54}";
                    var copyProtectionSystems = new Windows.Foundation.Collections.PropertySet;
                    copyProtectionSystems["{F4637010-03C3-42CD-B932-B48ADF3A6A54}"] = "Microsoft.Media.PlayReadyClient.PlayReadyWinRTTrustedInput";
                    mediaProtectionManager.properties["Windows.Media.Protection.MediaProtectionSystemIdMapping"] = copyProtectionSystems;
                    if (MS.Entertainment.Utilities.isVideoApp || MS.Entertainment.Utilities.isMusicApp2)
                        mediaProtectionManager.properties["Windows.Media.Protection.MediaProtectionContainerGuid"] = "{9A04F079-9840-4286-AB92-E65BE0885F95}";
                    htmlTag._mediaProtectionManagerBindings = MS.Entertainment.Utilities.addEventHandlers(mediaProtectionManager, {
                        componentloadfailed: componentLoadFailed, servicerequested: serviceRequested
                    });
                    try {
                        htmlTag.msSetMediaProtectionManager(mediaProtectionManager)
                    }
                    catch(e) {
                        MS.Entertainment.Platform.Playback.fail("_configureTagForDRM: Unexpected exception on msSetMediaProtectionManager: " + e.message);
                        MSEPlatform.Playback.MediaPlayer._drmNotifyException(that, e, "configureTagForDRM_msSetMediaProtectionManager")
                    }
                }, _createHtmlTag: function MediaPlayer_createHtmlTag(playerType, mediaInstance, autoPlay) {
                    MSEPlatform.Playback.Etw.traceString("MediaPlayer::createHtmlTag: creating audio/video tag.  mediaInstance.source = " + mediaInstance.source);
                    var Playback = MSEPlatform.Playback;
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var htmlTag = Playback.MediaPlayer.createMediaTag(playerType);
                    if (!htmlTag)
                        throw"MediaPlayer::createHtmlTag(): Error! cannot create " + playerType + " tag. Out of memory?";
                    if (playerType === "audio" && (MS.Entertainment.Utilities.isApp1 || configurationManager.music.backgroundAudioEnabled))
                        try {
                            htmlTag.setAttribute("msAudioCategory", "backgroundCapableMedia")
                        }
                        catch(ex) {
                            MSEPlatform.Playback.Etw.traceString("MediaPlayer::constructor: failed to set backgroundCapableMedia.  exception: " + ex)
                        }
                    else
                        htmlTag.setAttribute("msAudioCategory", "foregroundOnlyMedia");
                    htmlTag.msPlayToDisabled = Playback.shouldDisableDlnaPlayTo(mediaInstance);
                    Playback.Etw.traceString("MediaPlayer::createHtmlTag(), autoplay= " + autoPlay);
                    htmlTag.autoplay = autoPlay;
                    htmlTag.style.width = "100%";
                    htmlTag.style.height = "100%";
                    return htmlTag
                }, _drmNotifyError: function MediaPlayer_drmNotifyError(error, source, serviceRequest, postPendedText) {
                    var that = this;
                    var bubbleError = true;
                    var code = error.number ? error.number : error.code;
                    if (code === MSEPlatform.Playback.Error.ZEST_E_ASSET_LICENSE_RIGHT_NOT_OWNED.code)
                        if (this._media)
                            if (this._media._mediaItem && this._media._mediaItem.data && this._media._mediaItem.data["playFromXbox"]) {
                                bubbleError = false;
                                this._media._mediaItem.data["playPreviewOnly"] = true;
                                WinJS.Promise.timeout().then(function tryPreview() {
                                    MSEPlatform.PlaybackHelpers.playMedia(that._media._mediaItem.data, true)
                                })
                            }
                            else if (this._media.smidEnablerInEffect) {
                                code = MSEPlatform.Playback.Error.X8_E_PLAYBACK_PROTECTED_MEDIA_NOT_IDENTIFIED.code;
                                error.code = code
                            }
                    if (bubbleError) {
                        MSEPlatform.Playback.MediaPlayer._fireTagPlaybackError(this, code, source, postPendedText);
                        if (serviceRequest && serviceRequest.completion && serviceRequest.completion.complete) {
                            this._skipThisError = true;
                            serviceRequest.completion.complete(false)
                        }
                    }
                }, _setSourceFromMediaInstance: function MediaPlayer_setSourceFromMediaInstance() {
                    this._tagPlayer.src = this._media.source
                }, _autoplay: false, _tagPlayer: null, _media: null, _disposed: false, _skipThisError: false
        }, {
            createMediaTag: function MediaPlayer_createMediaTag(type) {
                return document.createElement(type)
            }, _fireTagPlaybackError: function MediaPlayer_fireTagPlaybackError(player, error, context, postPendedText) {
                    MSEPlatform.Playback.Etw.traceString("MediaPlayer::_fireTagPlaybackError:  error = " + MSEPlatform.Playback.mediaErrorToString(error));
                    MSEPlatform.Playback.assert(player && player.firePlaybackError, "Fix misconfigured media tag error handler");
                    if (player && player.firePlaybackError)
                        player.firePlaybackError(error, context, postPendedText)
                }, _drmNotifyException: function MediaPlayer_drmNotifyException(player, ex, source) {
                    MSEPlatform.Playback.Etw.traceString("MediaPlayer::_drmNotifyException: " + JSON.stringify(ex) + " source: " + source);
                    WinJS.Promise.timeout().then(function notifyDrmException() {
                        MSEPlatform.Playback.MediaPlayer._fireTagPlaybackError(player, MSEPlatform.Playback.Error.NS_E_WMP_DRM_GENERIC_LICENSE_FAILURE.code, source)
                    })
                }
        }), AudioPlayer: MS.Entertainment.UI.Framework.derive("MS.Entertainment.Platform.Playback.MediaPlayer", function AudioPlayer_constructor(mediaInstance, autoPlay) {
                MSEPlatform.Playback.Etw.traceString("AudioPlayer::constructor: Creating audio player");
                this.base("audio", mediaInstance, autoPlay);
                if (!this._usingPreActivatedTag && mediaInstance.protectionState !== MSEPlatform.Playback.ProtectionState.unprotected)
                    this.configureDRM();
                if (this._usingFastStartTag) {
                    MSEPlatform.Playback.Etw.traceString("AudioPlayer::constructor: usingFastStart ");
                    MSEPlatform.Playback.assert(!mediaInstance.isLocal, "fast start tag should only be used with streaming content");
                    MSEPlatform.Playback.assert(mediaInstance.protectionState === MSEPlatform.Playback.ProtectionState.drmProtected, "fast start tag should only be used with protected content");
                    this._tagPlayer.fastStartProperties["Url"] = mediaInstance.source
                }
                else if (!this._usingPreActivatedTag)
                    this._setSourceFromMediaInstance()
            }, {
                isFastStartSource: {get: function isFastStartSource_get() {
                        return this._usingFastStartTag
                    }}, _createHtmlTag: function AudioPlayer_createHtmlTag(playerType, mediaInstance, autoPlay) {
                        var htmlTag;
                        this._usingFastStartTag = false;
                        this._usingPreActivatedTag = false;
                        var audioTagForFileActivation = MSEPlatform.Playback.AudioPlayer.audioTagForFileActivation;
                        if (audioTagForFileActivation) {
                            if (!audioTagForFileActivation.error) {
                                htmlTag = audioTagForFileActivation;
                                this._usingPreActivatedTag = true
                            }
                            else {
                                mediaInstance.mediaInstanceId = null;
                                autoPlay = true
                            }
                            MSEPlatform.Playback.AudioPlayer.audioTagForFileActivation = null
                        }
                        if (!this._usingPreActivatedTag)
                            if (!MS.Entertainment.Utilities.isMusicApp2 && autoPlay && MSEPlatform.Playback.AudioPlayer.fastStartTag && !mediaInstance.isLocal && !mediaInstance.disableFastStart && mediaInstance.protectionState === MSEPlatform.Playback.ProtectionState.drmProtected) {
                                MSEPlatform.Playback.Etw.traceString("AudioPlayer::_createHtmlTag(): Using FastStart");
                                htmlTag = MSEPlatform.Playback.AudioPlayer.fastStartTag;
                                htmlTag.autoplay = autoPlay;
                                MSEPlatform.Playback.AudioPlayer.fastStartTag = null;
                                this._usingFastStartTag = true
                            }
                            else
                                htmlTag = MSEPlatform.Playback.MediaPlayer.prototype._createHtmlTag.call(this, playerType, mediaInstance, autoPlay);
                        return htmlTag
                    }, _usingFastStartTag: false, _usingPreActivatedTag: false
            }, {
                createFastStartTag: function AudioPlayer_createFastStartTag() {
                    function configureFastStartTagForDRM(htmlTag) {
                        var disableFastStart = function disableFastStart(e) {
                                if (this.fastStartTag)
                                    this.disposeFastStartTag();
                                this.fastStartBlockedOnLA = true
                            }.bind(this);
                        var mediaProtectionManager = new Windows.Media.Protection.MediaProtectionManager;
                        mediaProtectionManager.properties["Windows.Media.Protection.MediaProtectionSystemId"] = "{F4637010-03C3-42CD-B932-B48ADF3A6A54}";
                        var copyProtectionSystems = new Windows.Foundation.Collections.PropertySet;
                        copyProtectionSystems["{F4637010-03C3-42CD-B932-B48ADF3A6A54}"] = "Microsoft.Media.PlayReadyClient.PlayReadyWinRTTrustedInput";
                        mediaProtectionManager.properties["Windows.Media.Protection.MediaProtectionSystemIdMapping"] = copyProtectionSystems;
                        htmlTag._mediaProtectionManagerBindings = MS.Entertainment.Utilities.addEventHandlers(mediaProtectionManager, {
                            componentloadfailed: disableFastStart, servicerequested: disableFastStart
                        });
                        try {
                            htmlTag.msSetMediaProtectionManager(mediaProtectionManager)
                        }
                        catch(e) {
                            MS.Entertainment.Platform.Playback.fail("_configureFastStartTagForDRM: Unexpected exception on msSetMediaProtectionManager: " + e.message);
                            MSEPlatform.Playback.MediaPlayer._drmNotifyException(htmlTag, e, "configureFastStartTagForDRM_msSetMediaProtectionManager")
                        }
                    }
                    if (this.fastStartTag) {
                        MSEPlatform.Playback.Etw.traceString("-AudioPlayer:_createFastStartTag exists already");
                        return
                    }
                    var extensionManager = new Windows.Media.MediaExtensionManager;
                    this.fastStartTag = MSEPlatform.Playback.MediaPlayer.createMediaTag("audio");
                    this.fastStartTag.fastStartProperties = new Windows.Foundation.Collections.PropertySet;
                    this.fastStartTag.fastStartProperties["Url"] = "";
                    extensionManager.registerSchemeHandler("Microsoft.Entertainment.Platform.Playback.FastStartSchemeHandler", "fsms:", this.fastStartTag.fastStartProperties);
                    this.fastStartTag.setAttribute("msAudioCategory", "backgroundCapableMedia");
                    this.fastStartTag.width = 0;
                    this.fastStartTag.height = 0;
                    this.fastStartTag.autoplay = false;
                    configureFastStartTagForDRM.call(this, this.fastStartTag);
                    this.fastStartTag.src = "fsms://#";
                    MSEPlatform.Playback.Etw.traceString("-AudioPlayer:createFastStartTag: created")
                }, disposeFastStartTag: function AudioPlayer_disposeFastStartTag() {
                        MSEPlatform.Playback.Etw.traceString("AudioPlayer::disposeFastStartTag: Disposing tag");
                        if (this.fastStartTag) {
                            if (this.fastStartTag._mediaProtectionManagerBindings) {
                                this.fastStartTag._mediaProtectionManagerBindings.cancel();
                                this.fastStartTag._mediaProtectionManagerBindings = null
                            }
                            this.fastStartTag.removeAttribute("src");
                            this.fastStartTag.load();
                            this.fastStartTag = null;
                            this.fastStartBlockedOnLA = false
                        }
                        else
                            MSEPlatform.Playback.Etw.traceString("AudioPlayer::disposeFastStartTag: Nothing to dispose")
                    }, hasValidFastStartTag: function AudioPlayer_hasValidFastStartTag() {
                        return !!this.fastStartTag
                    }, audioTagForFileActivation: null, fastStartBlockedOnLA: false, fastStartTag: null
            }), VideoPlayer: MS.Entertainment.UI.Framework.derive("MS.Entertainment.Platform.Playback.MediaPlayer", function VideoPlayer_constructor(mediaInstance, autoPlay) {
                MSEPlatform.Playback.Etw.traceString("VideoPlayer::constructor: Creating video player");
                this.base("video", mediaInstance, autoPlay);
                if (!isBlobUrl(mediaInstance.source)) {
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    if (mediaInstance.videoEncoding === Microsoft.Entertainment.Marketplace.VideoEncoding.h264 && !configurationManager.playback.useC13ForH264Streaming) {
                        var adaptiveSourceOpenedEventHandler = this._adaptiveSourceOpened.bind(this);
                        MSEPlatform.Playback.VideoPlayer._adaptiveSourceManager.addEventListener("adaptivesourceopenedevent", adaptiveSourceOpenedEventHandler);
                        this._unhookEventHandlers = function _unhookEventHandlers() {
                            MSEPlatform.Playback.VideoPlayer._adaptiveSourceManager.removeEventListener("adaptivesourceopenedevent", adaptiveSourceOpenedEventHandler);
                            if (this._adaptiveStreamingEvents) {
                                this._adaptiveStreamingEvents.cancel();
                                this._adaptiveStreamingEvents = null
                            }
                        };
                        this._reporter = new Microsoft.Entertainment.Platform.Playback.SmoothStreamingPlaybackReporter;
                        this._reporter.setMainAttribute("URL", mediaInstance.source);
                        if (this._urlRetryMap)
                            this._urlRetryMap = {}
                    }
                    else if ((MS.Entertainment.Utilities.isVideoApp2 || MS.Entertainment.Utilities.isMusicApp2) && !MS.Entertainment.isAppModeOverride) {
                        var smoothStreamingSessionCreatedEventHandler = this._smoothStreamingSessionCreated.bind(this);
                        var resourceAvailabilityChanged = this._resourceAvailabilityChanged.bind(this);
                        MSEPlatform.Playback.VideoPlayer._smoothStreamingSessionManager.addEventListener("sessioncreated", smoothStreamingSessionCreatedEventHandler);
                        Windows.Xbox.ApplicationModel.ApplicationResourceLimits.addEventListener("resourceavailabilitychanged", resourceAvailabilityChanged);
                        this._unhookEventHandlers = function _unhookEventHandlers() {
                            MSEPlatform.Playback.VideoPlayer._smoothStreamingSessionManager.removeEventListener("sessioncreated", smoothStreamingSessionCreatedEventHandler);
                            Windows.Xbox.ApplicationModel.ApplicationResourceLimits.removeEventListener("resourceavailabilitychanged", resourceAvailabilityChanged)
                        }
                    }
                    if (configurationManager)
                        this._startBitrate = configurationManager.playback.defaultStartBitrate
                }
                MSEPlatform.Playback.VideoPlayer.registerByteStreamHandlerForURL(mediaInstance.source, mediaInstance.videoEncoding);
                this._tagPlayer.videoEncoding = mediaInstance.videoEncoding;
                if (mediaInstance.protectionState !== MSEPlatform.Playback.ProtectionState.unprotected)
                    this.configureDRM();
                var deviceRegistrationCheckPromise = WinJS.Promise.as();
                if (mediaInstance.isLocal && (mediaInstance.protectionState === MSEPlatform.Playback.ProtectionState.drmProtected || MS.Entertainment.Utilities.isLocalMarketplaceVideo(mediaInstance)))
                    deviceRegistrationCheckPromise = this._registerDeviceAsync();
                deviceRegistrationCheckPromise.done(function setSource() {
                    this._setSourceFromMediaInstance()
                }.bind(this), function registerDevice_Failed(error) {
                    var that = this;
                    WinJS.Promise.timeout().then(function notifyDeviceRegistrationFailure() {
                        MSEPlatform.Playback.MediaPlayer._fireTagPlaybackError(that, error.code, "VideoPlayer_registerDeviceAsync")
                    }.bind(this))
                }.bind(this))
            }, {
                dispose: function VideoPlayer_dispose() {
                    MSEPlatform.Playback.Etw.traceString("VideoPlayer::dispose: Disposing video player");
                    this._unhookEventHandlers();
                    if (this._tagPlayer.videoEncoding === Microsoft.Entertainment.Marketplace.VideoEncoding.h264) {
                        var that = this;
                        this._flushTelemetryBuffer();
                        this._reporter = null;
                        this._urlRetryMap = {};
                        this.videoStreamStatistics = null;
                        WinJS.Promise.timeout(1000).then(function() {
                            MSEPlatform.Playback.MediaPlayer.prototype.dispose.call(that)
                        })
                    }
                    else {
                        if (MS.Entertainment.Utilities.isApp2 && !MS.Entertainment.isAppModeOverride && this._smoothStreamingSession)
                            if (!this._isConstrained)
                                try {
                                    var lastBitrate = this._smoothStreamingSession.currentBitrate;
                                    if (lastBitrate > 0) {
                                        MSEPlatform.Playback.Etw.traceString("VideoPlayer::dispose: Updating recorded last bitrate seen = " + lastBitrate);
                                        MSEPlatform.Playback.VideoPlayer.lastBitrateUnconstrained = lastBitrate;
                                        Windows.Storage.ApplicationData.current.localSettings.values[MSEPlatform.Playback.VideoPlayer.lastBitrateUnconstrainedKey] = lastBitrate
                                    }
                                }
                                catch(e) {}
                        MSEPlatform.Playback.MediaPlayer.prototype.dispose.call(this)
                    }
                }, _unhookEventHandlers: function VideoPlayer_unhookEventHandlers() {
                        return
                    }, _registerDeviceAsync: function VideoPlayer_registerDeviceAsync() {
                        function waitForSignIn() {
                            var signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                            if (signInService.isSignedIn)
                                return WinJS.Promise.wrap();
                            else if (signInService.isSigningIn)
                                return new WinJS.Promise(function(c, e, p) {
                                        function onIsSigningInChanged(newValue, oldValue) {
                                            if (!newValue) {
                                                signInService.unbind("isSigningIn", onIsSigningInChanged);
                                                if (signInService.isSignedIn)
                                                    c();
                                                else
                                                    e("sign in failed or canceled")
                                            }
                                        }
                                        signInService.bind("isSigningIn", onIsSigningInChanged)
                                    });
                            else
                                return WinJS.Promise.wrapError(MSEPlatform.Playback.Error.ZEST_E_SIGNIN_REQUIRED)
                        }
                        if (DeviceGroup.DeviceGroupManagement.getDeviceRegisterationStatus() === DeviceGroup.DeviceRegisterationStatus.registered)
                            return WinJS.Promise.as();
                        else
                            return waitForSignIn().then(function signin_Complete() {
                                    return DeviceGroup.DeviceGroupManagement.registerDeviceAsync(true).then(function registerDevice_Completed(deviceAssociationResult) {
                                            if (deviceAssociationResult.result === DeviceGroup.Result.succeeded)
                                                return WinJS.Promise.as();
                                            else {
                                                MSEPlatform.Playback.Etw.traceString("DeviceGroup:RegisterDeviceAsync registration not successful. Code: " + deviceAssociationResult.errorCode);
                                                MS.Entertainment.Utilities.Telemetry.logDeviceGroupAction("DeviceGroup:RegisterDeviceAsync registration not successful", deviceAssociationResult.errorCode);
                                                var playbackError = MSEPlatform.Playback.makePlaybackError(deviceAssociationResult.errorCode, "DeviceGroup", JSON.stringify(deviceAssociationResult));
                                                return WinJS.Promise.wrapError(playbackError)
                                            }
                                        }, function registerDevice_Failed(errorResult) {
                                            MSEPlatform.Playback.Etw.traceString("DeviceGroup:RegisterDeviceAsync failed. Code: " + JSON.stringify(errorResult));
                                            MS.Entertainment.Utilities.Telemetry.logDeviceGroupAction("DeviceGroup:RegisterDeviceAsync registration not successful", errorResult.number);
                                            var playbackError = MSEPlatform.Playback.makePlaybackError(MS.Entertainment.UI.DeviceGroupErrors.DEVICEGROUP_E_UNEXPECTED, "DeviceGroup", JSON.stringify(errorResult));
                                            return WinJS.Promise.wrapError(playbackError)
                                        })
                                }, function signin_Failed(error) {
                                    return WinJS.Promise.wrapError(error)
                                })
                    }, _isConstrained: {get: function VideoPlayer_isConstrained() {
                            return (Windows.Xbox.ApplicationModel.ApplicationResourceLimits.resourceAvailability === Windows.Xbox.ApplicationModel.ResourceAvailability.constrained)
                        }}, _smoothStreamingSessionCreated: function VideoPlayer_smoothStreamingSessionCreated(session) {
                        if (session.uri !== this._media.source)
                            return;
                        var Playback = MSEPlatform.Playback;
                        MSEPlatform.Playback.Etw.traceString("VideoPlayer::_smoothStreamingSessionCreated: Event: smoothstreamingsessioncreated");
                        MS.Entertainment.Platform.assert(this._smoothStreamingSession === null, "_smoothStreamingSessionCreated called while this._smoothStreamingSession was non-null");
                        this._smoothStreamingSession = session;
                        if (Microsoft.Entertainment.Configuration.ConfigurationManager().playback.enableVideo2SmoothStreamingTelemetry && !isBlobUrl(session.uri))
                            try {
                                var reporter = new Microsoft.Entertainment.Platform.Playback.SmoothStreamingPlaybackReporter;
                                session.setReporter(reporter)
                            }
                            catch(e) {
                                MS.Entertainment.Platform.fail("Failed to set session reporter: " + (e && e.message) ? e.message : String.empty, e ? e.number : 0)
                            }
                        try {
                            Playback.VideoPlayer.lastBitrateUnconstrained = Windows.Storage.ApplicationData.current.localSettings.values[Playback.VideoPlayer.lastBitrateUnconstrainedKey]
                        }
                        catch(e) {
                            MS.Entertainment.Platform.fail("Failure to read " + Playback.VideoPlayer.lastBitrateUnconstrainedKey + " from localSettings: " + (e && e.message) ? e.message : "", e ? e.number : 0)
                        }
                        try {
                            if (this._isConstrained)
                                this._smoothStreamingSession.startBitrate = Math.min(this._startBitrate, Playback.VideoPlayer.maxBitrateConstrained);
                            else
                                this._smoothStreamingSession.startBitrate = Playback.VideoPlayer.lastBitrateUnconstrained ? Playback.VideoPlayer.lastBitrateUnconstrained : this._startBitrate
                        }
                        catch(e) {
                            MS.Entertainment.Platform.fail("Exception in _smoothStreamingSessionCreated: " + (e && e.message) ? e.message : 0, e ? e.number : 0)
                        }
                        if (this._smoothStreamingEvents) {
                            this._smoothStreamingEvents.cancel();
                            this._smoothStreamingEvents = null
                        }
                        this._smoothStreamingEvents = MS.Entertainment.Utilities.addEventHandlers(session, {closed: this._smoothStreamingSessionClosed.bind(this)});
                        this._updateSmoothStreamingSessionRates()
                    }, _smoothStreamingSessionClosed: function VideoPlayer_smoothStreamingSessionClosed(evt) {
                        MSEPlatform.Playback.Etw.traceString("VideoPlayer::_smoothStreamingSessionClosed: Event: smoothstreamingsessionclosed(" + evt.errorCode + ")");
                        if (this._smoothStreamingEvents) {
                            this._smoothStreamingEvents.cancel();
                            this._smoothStreamingEvents = null
                        }
                        this._smoothStreamingSession = null
                    }, _resourceAvailabilityChanged: function _resourceAvailabilityChanged(evt) {
                        MSEPlatform.Playback.Etw.traceString("VideoPlayer::_resourceAvailabilityChanged: Event: resourceavailabilitychanged");
                        var Playback = MSEPlatform.Playback;
                        if (this._smoothStreamingSession && Playback.VideoPlayer.respectConstrainedMode) {
                            this._updateSmoothStreamingSessionRates();
                            try {
                                if (this._isConstrained) {
                                    var currentBitrate = this._smoothStreamingSession.currentBitrate;
                                    if (currentBitrate > 0) {
                                        Playback.VideoPlayer.lastBitrateUnconstrained = currentBitrate;
                                        Windows.Storage.ApplicationData.current.localSettings.values[Playback.VideoPlayer.lastBitrateUnconstrainedKey] = currentBitrate
                                    }
                                    if (currentBitrate > Playback.VideoPlayer.maxBitrateConstrained) {
                                        MSEPlatform.Playback.Etw.traceString("VideoPlayer::_resourceAvailabilityChanged: Calling RequestBitrateChange(" + Playback.VideoPlayer.maxBitrateConstrained + ", false)");
                                        this._smoothStreamingSession.requestBitrateChange(Playback.VideoPlayer.maxBitrateConstrained, true)
                                    }
                                }
                                else {
                                    var newBitrate = Playback.VideoPlayer.lastBitrateUnconstrained && Playback.VideoPlayer.lastBitrateUnconstrained > 0 ? Playback.VideoPlayer.lastBitrateUnconstrained : this._startBitrate;
                                    if (newBitrate > this._smoothStreamingSession.currentBitrate) {
                                        MSEPlatform.Playback.Etw.traceString("VideoPlayer::_resourceAvailabilityChanged: Calling RequestBitrateChange(" + newBitrate + ", true)");
                                        this._smoothStreamingSession.requestBitrateChange(newBitrate, true)
                                    }
                                }
                            }
                            catch(e) {
                                MS.Entertainment.Platform.fail("Exception calling requestBitrateChange: " + (e && e.message) ? e.message : 0, e ? e.number : 0)
                            }
                            var positionMs = this.forceTimeUpdate();
                            this.seekToPosition(Math.max(positionMs - 100, 0))
                        }
                    }, _updateSmoothStreamingSessionRates: function VideoPlayer_updateSmoothStreamingSessionRates() {
                        try {
                            var Playback = MSEPlatform.Playback;
                            MS.Entertainment.Platform.assert(this._smoothStreamingSession, "_updateSmoothStreamingSessionRates called while this._smoothStreamingSession was null");
                            if (this._isConstrained) {
                                MSEPlatform.Playback.Etw.traceString("VideoPlayer::_updateSmoothStreamingSessionRates: mode values being applied to this._smoothStreamingSession");
                                this._smoothStreamingSession.maximumBitrate = Playback.VideoPlayer.maxBitrateConstrained;
                                this._smoothStreamingSession.maximumWidth = Playback.VideoPlayer.maxWidthConstrained;
                                this._smoothStreamingSession.maximumHeight = Playback.VideoPlayer.maxHeightConstrained
                            }
                            else {
                                MSEPlatform.Playback.Etw.traceString("VideoPlayer::_updateSmoothStreamingSessionRates: 'Full' (unconstrained) mode values being applied to this._smoothStreamingSession");
                                this._smoothStreamingSession.maximumBitrate = Playback.VideoPlayer.maxBitrateUnconstrained;
                                this._smoothStreamingSession.maximumWidth = Playback.VideoPlayer.maxWidthUnconstrained;
                                this._smoothStreamingSession.maximumHeight = Playback.VideoPlayer.maxHeightUnconstrained
                            }
                        }
                        catch(e) {
                            MS.Entertainment.Platform.fail("_updateSmoothStreamingSessionRates exception: " + (e && e.message) ? e.message : 0, e ? e.number : 0)
                        }
                    }, _adaptiveSourceOpened: function VideoPlayer_adaptiveSourceOpened(args) {
                        var adaptiveSource = args.adaptiveSource;
                        if (adaptiveSource.uri.absoluteUri !== this._media.source)
                            return;
                        this._adaptiveStreamingEvents = MS.Entertainment.Utilities.addEventHandlers(adaptiveSource, {
                            manifestreadyevent: this._onH264PiffManifestReady.bind(this), adaptivesourcestatusupdatedevent: this._onAdaptiveSourceStatusUpdated.bind(this), adaptivesourcefailedevent: this._onAdaptiveSourceFailed.bind(this)
                        })
                    }, _onH264PiffManifestReady: function VideoPlayer_onH264PiffManifestReady(args) {
                        this._currentH264VideoStream = null;
                        this._h264ChunksDownloaded = 0;
                        function getPreferredAudioStream(availableStreams) {
                            function AudioStreamDescriptor(fourCC, bitrate, index) {
                                this._fourCC = fourCC;
                                this._bitrate = bitrate;
                                this._index = index
                            }
                            function compareAudioStreamDescriptors(descriptorOne, descriptorTwo) {
                                var FourCCCodes = new Array(858604357, 1279476033, 1212367169);
                                if (descriptorOne._fourCC === descriptorTwo._fourCC)
                                    return (descriptorTwo._bitrate - descriptorOne._bitrate);
                                else {
                                    var fourCCAIndex = FourCCCodes.indexOf(descriptorOne._fourCC);
                                    var fourCCBIndex = FourCCCodes.indexOf(descriptorTwo._fourCC);
                                    return fourCCAIndex - fourCCBIndex
                                }
                            }
                            var audioStreamDescriptors = new Array;
                            for (var i = 0; i < availableStreams.size; i++)
                                if (availableStreams[i].type === Microsoft.Media.AdaptiveStreaming.MediaStreamType.audio) {
                                    var firstTrack = availableStreams[i].availableTracks[0];
                                    var fourCC = firstTrack.fourCC;
                                    var bitrate = firstTrack.bitrate;
                                    audioStreamDescriptors.push(new AudioStreamDescriptor(fourCC, bitrate, i))
                                }
                            var preferredAudioStream = null;
                            if (audioStreamDescriptors.length !== 0) {
                                audioStreamDescriptors.sort(compareAudioStreamDescriptors);
                                preferredAudioStream = availableStreams[audioStreamDescriptors[0]._index]
                            }
                            return preferredAudioStream
                        }
                        function selectVideoTracks(videoStream) {
                            var availableTracks = videoStream.availableTracks;
                            var availableBitrates = availableTracks.map(function getBitrate(track) {
                                    if (track.bitrate)
                                        return track.bitrate
                                });
                            this._media._mediaItem.data.availableVideoBitrates = availableBitrates;
                            var selectedVideoTracks = [];
                            for (var i = 0; i < availableTracks.size; i++)
                                if (availableTracks[i].maxWidth <= MSEPlatform.Playback.VideoPlayer.maxWidthUnconstrained && availableTracks[i].maxHeight <= MSEPlatform.Playback.VideoPlayer.maxHeightUnconstrained)
                                    selectedVideoTracks.push(availableTracks[i]);
                            MS.Entertainment.Platform.Playback.assert(selectedVideoTracks.length > 0, "Video stream has no tracks available!");
                            videoStream.restrictTracks(selectedVideoTracks);
                            var topBitrate = 0;
                            for (var i = 0; i < selectedVideoTracks.length; i++)
                                if (selectedVideoTracks[i].bitrate >= topBitrate)
                                    topBitrate = selectedVideoTracks[i].bitrate;
                            var startingVideoTracks = [];
                            var startingBitrate = Math.min(topBitrate, this._startBitrate);
                            for (var i = 0; i < selectedVideoTracks.length; i++)
                                if (selectedVideoTracks[i].bitrate >= startingBitrate)
                                    startingVideoTracks.push(selectedVideoTracks[i]);
                            MS.Entertainment.Platform.Playback.assert(startingVideoTracks.length > 0, "Video stream has no tracks which can be selected!");
                            videoStream.selectTracks(startingVideoTracks)
                        }
                        function getPreferredVideoStream(availableStreams) {
                            var firstVideoStream = null;
                            for (var i = 0; i < availableStreams.size; i++)
                                if (availableStreams[i].type === Microsoft.Media.AdaptiveStreaming.MediaStreamType.video) {
                                    firstVideoStream = availableStreams[i];
                                    break
                                }
                            if (firstVideoStream)
                                selectVideoTracks.call(this, firstVideoStream);
                            return firstVideoStream
                        }
                        var manifest = args.adaptiveSource.manifest;
                        var availableStreams = manifest.availableStreams;
                        var selectedStreams = new Array;
                        var preferredAudioStream = getPreferredAudioStream(availableStreams);
                        if (preferredAudioStream) {
                            selectedStreams.push(preferredAudioStream);
                            var preferredVideoStream = getPreferredVideoStream.call(this, availableStreams);
                            if (preferredVideoStream) {
                                selectedStreams.push(preferredVideoStream);
                                manifest.selectStreamsAsync(selectedStreams);
                                this._currentH264VideoStream = preferredVideoStream
                            }
                        }
                        this._initializeVideoStreamStats(preferredVideoStream, preferredAudioStream)
                    }, _initializeVideoStreamStats: function VideoPlayer_initializeVideoStreamStats(preferredVideoStream, preferredAudioStream) {
                        this.videoStreamStatistics = {
                            history: [], failureEvents: [], maxVideoBitrate: 0, maxWidth: 0, maxHeight: 0, videoCodec: FourCCMap.Unknown, audioCodec: FourCCMap.Unknown
                        };
                        for (var i = 0; i < preferredVideoStream.availableTracks.length; i++) {
                            this.videoStreamStatistics.maxVideoBitrate = Math.max(preferredVideoStream.availableTracks[i].bitrate, this.videoStreamStatistics.maxVideoBitrate);
                            this.videoStreamStatistics.maxWidth = Math.max(preferredVideoStream.availableTracks[i].maxWidth, this.videoStreamStatistics.maxWidth);
                            this.videoStreamStatistics.maxHeight = Math.max(preferredVideoStream.availableTracks[i].maxHeight, this.videoStreamStatistics.maxHeight)
                        }
                        this.videoStreamStatistics.videoCodec = FourCCMap[preferredVideoStream.availableTracks[0].fourCC] || FourCCMap.Unknown;
                        this.videoStreamStatistics.audioCodec = FourCCMap[preferredAudioStream.availableTracks[0].fourCC] || FourCCMap.Unknown
                    }, _addVideoStreamFailureStats: function VideoPlayer_addVideoStreamFailureStats(stat)
                    {
                        if (this.videoStreamStatistics) {
                            var MAX_STREAM_FAILURE_ENTRIES = 30;
                            this.videoStreamStatistics.failureEvents.unshift(stat);
                            this.videoStreamStatistics.failureEvents.splice(MAX_STREAM_FAILURE_ENTRIES)
                        }
                    }, _addVideoStreamHistoryStats: function VideoPlayer_addVideoStreamHistoryStats(stat)
                    {
                        function ageOutHistoryBuffers(buffers, positionHNS, maxAgeHNS) {
                            if (!buffers)
                                return;
                            var prevHist = null;
                            for (var i = 0; i < buffers.length; i++) {
                                var hist = buffers[i];
                                if (hist.hnsStartTime < (positionHNS - maxAgeHNS))
                                    buffers.splice(i);
                                if (prevHist)
                                    if ((prevHist.hnsStartTime - hist.hnsStartTime) <= 0)
                                        buffers.splice(i);
                                prevHist = hist
                            }
                        }
                        if (this.videoStreamStatistics) {
                            var MAX_STREAM_HISTORY_HNS = 600000000;
                            this.videoStreamStatistics.history.unshift(stat);
                            ageOutHistoryBuffers(this.videoStreamStatistics.history, this.forceTimeUpdate() * 10000, MAX_STREAM_HISTORY_HNS)
                        }
                    }, _onAdaptiveSourceStatusUpdated: function VideoPlayer_onAdaptiveSourceStatusUpdated(args) {
                        function populateUrlRetryMap(urlInfo) {
                            if (urlInfo)
                                if (this._urlRetryMap[urlInfo])
                                    this._urlRetryMap[urlInfo]++;
                                else
                                    this._urlRetryMap[urlInfo] = 1
                        }
                        if (args)
                            switch (args.updateType) {
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceStatusUpdateType.chunkDownloaded:
                                    this._h264ChunksDownloaded++;
                                    if (this._h264ChunksDownloaded === this._h264ChunksDownloadedThreshold && this._currentH264VideoStream)
                                        this._currentH264VideoStream.selectTracks(this._currentH264VideoStream.availableTracks);
                                    this._reportChunkDownloaded(args);
                                    if ((this._h264ChunksDownloaded % 20) === 0 && this._reporter)
                                        this._reporter.sendLogAsync("Report", false);
                                    break;
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceStatusUpdateType.rebuffer:
                                    if (this._reporter) {
                                        this._reporter.reportBuffering();
                                        MSEPlatform.Playback.Etw.traceString("VideoPlayer::_onAdaptiveSourceStatusUpdated: Rebuffering")
                                    }
                                    this._addVideoStreamFailureStats({
                                        hnsTime: this.forceTimeUpdate() * HNS_PER_MILLISECOND, info: "Rebuffering due to poor network conditions"
                                    });
                                    break;
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceStatusUpdateType.chunkConnectHttpInvalid:
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceStatusUpdateType.nextChunkHttpInvalid:
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceStatusUpdateType.chunkHdrHttpInvalid:
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceStatusUpdateType.chunkHdrError:
                                    populateUrlRetryMap.call(this, args.additionalInfo);
                                    var responseValue = args.httpResponse ? args.httpResponse.toString() : "None";
                                    var hresult = args.result ? args.result.toString() : "None";
                                    var chunkUrl = args.additionalInfo || string.empty;
                                    var errorString = enumToString(args.updateType, Microsoft.Media.AdaptiveStreaming.AdaptiveSourceStatusUpdateType) + "_" + responseValue + "_" + hresult;
                                    if (this._reporter) {
                                        this._reporter.setSubAttribute("hr", errorString);
                                        this._reporter.setSubAttribute("ChunkUrl", chunkUrl);
                                        this._reporter.sendLogAsync("MissingChunk", false);
                                        MSEPlatform.Playback.Etw.traceString("VideoPlayer::_onAdaptiveSourceStatusUpdated: Missing chunk. Url:" + chunkUrl + " hr:" + errorString)
                                    }
                                    this._addVideoStreamFailureStats({
                                        hnsTime: this.forceTimeUpdate() * HNS_PER_MILLISECOND, info: "Missing chunk: hr=" + errorString
                                    });
                                    break;
                                default:
                                    break
                            }
                    }, _flushTelemetryBuffer: function VideoPlayer_flushTelemetryBuffer() {
                        if (this._reporter) {
                            this._reporter.sendLogAsync("Report", false);
                            this._reporter.sendLogAsync("Close", false)
                        }
                    }, _getTelemetryInfoFromChunkDownloadedArgs: function _getTelemetryInfoFromChunkDownloadedArgs(args) {
                        var TelemetryFields = {
                                chunkIndex: 0, url: 1, mediaStreamType: 2, chunkStartTimeHns: 3, chunkDurationns: 4, chunkBitrate: 5, chunkByteCount: 6, downloadRequestedTimeMs: 7, downloadCompletedTimeMs: 8, chunkPerceivedBandwidth: 9, avgPerceivedBandwidth: 10, bufferLevelAtRequested90kHz: 11, bufferLevelAtCompleted90kHz: 12, responseHeaders: 13
                            };
                        function uint32(val) {
                            var value = +val;
                            return isNaN(value) ? 0 : value
                        }
                        function getChunkIP(responseHeaders) {
                            function convertIPToDecimal(dottedIP) {
                                var decimalIP = 0;
                                var currentMultiplier = 1;
                                var splitIP = dottedIP.split(".");
                                for (var i = 0; i < splitIP.length; i++) {
                                    decimalIP += (currentMultiplier * (+splitIP[i]));
                                    currentMultiplier *= 256
                                }
                                return decimalIP
                            }
                            var cdnIPPatterns = [/x-cdn-info: \w+_([\d.]+)/, /X-CDN-Info: ([\d.]+)-\w+/, ];
                            for (var i = 0; i < cdnIPPatterns.length; i++) {
                                var matches = cdnIPPatterns[i].exec(responseHeaders);
                                if (matches && matches.length > 1)
                                    return convertIPToDecimal(matches[1])
                            }
                            return 0
                        }
                        var BUFFER_UNITS_90KHZ_TO_HNS = (1 / 90) * HNS_PER_MILLISECOND;
                        var additionalInfo = args.additionalInfo.split(";");
                        var info = {};
                        info.chunkId = uint32(additionalInfo[TelemetryFields.chunkIndex]);
                        info.url = additionalInfo[TelemetryFields.url];
                        info.bitrate = uint32(additionalInfo[TelemetryFields.chunkBitrate]);
                        info.startTickMs = uint32(additionalInfo[TelemetryFields.downloadRequestedTimeMs]);
                        info.openedTickMs = uint32(additionalInfo[TelemetryFields.downloadRequestedTimeMs]);
                        info.completedTicksMs = uint32(additionalInfo[TelemetryFields.downloadCompletedTimeMs]);
                        info.sizeInBytes = uint32(additionalInfo[TelemetryFields.chunkByteCount]);
                        info.hnsStartTime = uint32(additionalInfo[TelemetryFields.chunkStartTimeHns]);
                        info.avgBandwidth = uint32(additionalInfo[TelemetryFields.avgPerceivedBandwidth]);
                        info.lastBandwidth = uint32(additionalInfo[TelemetryFields.chunkPerceivedBandwidth]);
                        info.hnsBuffer = uint32(additionalInfo[TelemetryFields.bufferLevelAtCompleted90kHz]) * BUFFER_UNITS_90KHZ_TO_HNS;
                        info.isVideo = uint32(additionalInfo[TelemetryFields.mediaStreamType]) === 1;
                        info.chunkIP = getChunkIP(additionalInfo[TelemetryFields.responseHeaders]);
                        info.chunkStartTimeHns = uint32(additionalInfo[TelemetryFields.chunkStartTimeHns]);
                        return info
                    }, _reportChunkDownloaded: function VideoPlayer_reportChunkDownloaded(args) {
                        var info = this._getTelemetryInfoFromChunkDownloadedArgs(args);
                        var bitrateIndex = 0;
                        var width = 0;
                        var height = 0;
                        if (info.isVideo) {
                            this._addVideoStreamHistoryStats(info);
                            if (this._reporter) {
                                if (!this._urlRetryMap[info.url])
                                    this._reporter.setMainAttribute("DownloadRetries", "0");
                                else
                                    this._reporter.setMainAttribute("DownloadRetries", this._urlRetryMap[info.url].toString());
                                for (var i = 0; i < this._currentH264VideoStream.availableTracks.length; i++)
                                    if (this._currentH264VideoStream.availableTracks[i].bitrate === info.bitrate) {
                                        bitrateIndex = this._currentH264VideoStream.availableTracks[i].trackIndex;
                                        width = this._currentH264VideoStream.availableTracks[i].maxWidth;
                                        height = this._currentH264VideoStream.availableTracks[i].maxHeight
                                    }
                                this._reporter.addChunkInfo(bitrateIndex, info.bitrate, width, height);
                                this._reporter.addChunkHistory(info.chunkId, info.bitrate, info.bitrateIndex, info.hnsBuffer, info.avgBandwidth, info.lastBandwidth);
                                this._reporter.addDownloadData(info.startTickMs, info.openedTickMs, info.completedTicksMs, info.sizeInBytes, info.hnsStartTime, info.bitrate);
                                this._reporter.addChunkIP(info.chunkStartTimeHns, info.chunkIP)
                            }
                        }
                    }, selectVideoBitrate: function selectVideoBitrate(requestedBitrate) {
                        if (this._currentH264VideoStream) {
                            if (requestedBitrate) {
                                var requestedVideoTrack = [];
                                for (var i = 0; i < this._currentH264VideoStream.availableTracks.length; i++)
                                    if (this._currentH264VideoStream.availableTracks[i].bitrate === +requestedBitrate) {
                                        requestedVideoTrack.push(this._currentH264VideoStream.availableTracks[i]);
                                        break
                                    }
                                MS.Entertainment.Platform.Playback.assert(requestedVideoTrack.length > 0, "Video stream has no tracks with matching bitrate!");
                                if (requestedVideoTrack.length > 0)
                                    this._currentH264VideoStream.selectTracks(requestedVideoTrack)
                            }
                            else
                                this._currentH264VideoStream.selectTracks(this._currentH264VideoStream.availableTracks);
                            var positionMs = this.forceTimeUpdate();
                            this.seekToPosition(Math.max(positionMs - 100, 0));
                            if (this.videoStreamStatistics && this.videoStreamStatistics.history)
                                this.videoStreamStatistics.history.length = 0
                        }
                    }, _onAdaptiveSourceFailed: function _onAdaptiveSourceFailed(args) {
                        if (this._reporter && args) {
                            var httpResponse = args.httpResponse ? args.httpResponse.toString() : "None";
                            var hresult = args.result ? args.result.toString() : "None";
                            var errorState = enumToString(args.failType, Microsoft.Media.AdaptiveStreaming.AdaptiveSourceFailedType) + "_" + httpResponse + "_" + hresult;
                            switch (args.failType) {
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceFailedType.manifestParseFailed:
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceFailedType.manifestVersionUnsupported:
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceFailedType.manifestHttpInvalidResult:
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceFailedType.manifestInvalid:
                                    this._reporter.setSubAttribute("hr", errorState);
                                    this._reporter.sendLogAsync("CorruptedManifest", true);
                                    MSEPlatform.Playback.Etw.traceString("VideoPlayer::_onAdaptiveSourceFailed: Corrupted Manifest. hr:" + errorState);
                                    break;
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceFailedType.httpRecvFailed:
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceFailedType.httpParseResponseFailed:
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceFailedType.httpInvalidResult:
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceFailedType.httpTooManyRedirect:
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceFailedType.httpRedirectFailed:
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceFailedType.httpRedirectNotAllowed:
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceFailedType.httpCreateFailed:
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceFailedType.httpOpenFailed:
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceFailedType.httpSendFailed:
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceFailedType.chunkConnectHttpInvalidResult:
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceFailedType.chunkNextHttpInvalidResult:
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceFailedType.chunkHdrParseFailed:
                                case Microsoft.Media.AdaptiveStreaming.AdaptiveSourceFailedType.chunkInvalidData:
                                    this.retryableError = true;
                                default:
                                    this._reporter.setSubAttribute("hr", errorState);
                                    this._reporter.sendLogAsync("Error", true);
                                    MSEPlatform.Playback.Etw.traceString("VideoPlayer::_onAdaptiveSourceFailed: Error. hr:" + errorState)
                            }
                        }
                    }, getAudioTracks: function VideoPlayer_getAudioTracks() {
                        MSEPlatform.Playback.assert(this._tagPlayer);
                        return this._tagPlayer.audioTracks
                    }, getSelectedAudioTrack: function VideoPlayer_getSelectedAudioTrack() {
                        var selectedAudioTrack = -1;
                        for (var i = 0; i < this._tagPlayer.audioTracks.length; i++)
                            if (this._tagPlayer.audioTracks[i].enabled) {
                                selectedAudioTrack = i;
                                break
                            }
                        return selectedAudioTrack
                    }, selectAudioTrack: function VideoPlayer_selectAudioTrack(trackIndex) {
                        if (trackIndex === +trackIndex && trackIndex >= 0 && trackIndex < this._tagPlayer.audioTracks.length) {
                            this._tagPlayer.audioTracks[trackIndex].enabled = true;
                            for (var i = 0; i < this._tagPlayer.audioTracks.length; i++)
                                if (i !== trackIndex && this._tagPlayer.audioTracks[i].enabled)
                                    this._tagPlayer.audioTracks[i].enabled = false
                        }
                        else
                            MSEPlatform.Playback.Etw.traceString("VideoPlayer::selectAudioTrack failed. Must provide a valid track index. Track index: " + trackIndex)
                    }, _smoothStreamingSession: null, _smoothStreamingEvents: null, _startBitrate: 2 * 1024 * 1024, _reporter: null, _adaptiveStreamingEvents: null, _currentH264VideoStream: null, _currentlyRegisteredByteStreamHandler: null, _h264ChunksDownloaded: 0, _h264ChunksDownloadedThreshold: 5, _urlRetryMap: {}, videoStreamStatistics: null, retryableError: false
            }, {
                initializeVideoExtensions: function VideoPlayer_initializeVideoExtensions() {
                    if (!MS.Entertainment.Utilities.isAmsterdamApp && (MS.Entertainment.Utilities.isVideoApp1 || MS.Entertainment.Utilities.isApp2 || MS.Entertainment.Utilities.isTestApp)) {
                        this._extensionManager = new Windows.Media.MediaExtensionManager;
                        this._adaptiveSourceManager = Microsoft.Media.AdaptiveStreaming.AdaptiveSourceManager.getDefault();
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        if (configurationManager && this._adaptiveSourceManager) {
                            this._adaptiveSourceManager.sendExtendedCommand("heuristichealthybufferpercent", String(configurationManager.playback.h264StreamingHealthyBufferPercentage));
                            this._adaptiveSourceManager.sendExtendedCommand("httpwaitentireresponse", String(configurationManager.playback.h264StreamingSendSamplesAfterDownloadCompletes));
                            this._adaptiveSourceManager.setDownloadBufferSec(configurationManager.playback.h264StreamingDownloadBufferSizeSecs)
                        }
                        if (MS.Entertainment.Utilities.isApp2 && !MS.Entertainment.isAppModeOverride) {
                            this._smoothStreamingSessionManager = new Windows.Xbox.Media.SmoothStreamingSessionManager;
                            if (configurationManager) {
                                this.maxBitrateConstrained = configurationManager.playback.maxBitrateConstrained;
                                this.maxWidthConstrained = configurationManager.playback.maxWidthConstrained;
                                this.maxHeightConstrained = configurationManager.playback.maxHeightConstrained;
                                this.respectConstrainedMode = configurationManager.playback.respectConstrainedMode
                            }
                        }
                    }
                    if (MS.Entertainment.Utilities.isVideoApp1 && !MS.Entertainment.Utilities.isWindowsBlue)
                        this._extensionManager.registerByteStreamHandler("Microsoft.Entertainment.Platform.Playback.CFFByteStreamHandler", ".mp4", String.empty);
                    if (MS.Entertainment.Utilities.isVideoApp1 && MS.Entertainment.Utilities.isWindowsBlue)
                        this._extensionManager.registerByteStreamHandler("Microsoft.Entertainment.Platform.Playback.MkvMfByteStreamHandler", ".mkv", String.empty)
                }, registerByteStreamHandlerForURL: function VideoPlayer_registerByteStreamHandlerForURL(url, videoEncoding) {
                        if (!isBlobUrl(url) && (MS.Entertainment.Utilities.isVideoApp1 || MS.Entertainment.Utilities.isApp2 || MS.Entertainment.Utilities.isTestApp) && !MS.Entertainment.Utilities.isAmsterdamApp) {
                            var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                            var isH264 = (videoEncoding === Microsoft.Entertainment.Marketplace.VideoEncoding.h264);
                            if (isH264 && !configurationManager.playback.useC13ForH264Streaming) {
                                if (this._currentlyRegisteredByteStreamHandler !== this.VideoStreamFormat.H264) {
                                    this._currentlyRegisteredByteStreamHandler = this.VideoStreamFormat.H264;
                                    var ps = new Windows.Foundation.Collections.PropertySet;
                                    ps.insert("{A5CE1DE8-1D00-427B-ACEF-FB9A3C93DE2D}", this._adaptiveSourceManager);
                                    this._extensionManager.registerByteStreamHandler("Microsoft.Media.AdaptiveStreaming.SmoothByteStreamHandler", "", "text/xml", ps);
                                    MSEPlatform.Playback.Etw.traceString("VideoPlayer::_registerByteStreamHandlerForURL: Registered H.264 bytestream handler. Url:" + url)
                                }
                            }
                            else if (this._currentlyRegisteredByteStreamHandler !== this.VideoStreamFormat.VC1) {
                                this._currentlyRegisteredByteStreamHandler = this.VideoStreamFormat.VC1;
                                if (MS.Entertainment.Utilities.isApp2 && !MS.Entertainment.isAppModeOverride) {
                                    var ps = new Windows.Foundation.Collections.PropertySet;
                                    ps.insert("SmoothStreamingSessionManager", this._smoothStreamingSessionManager);
                                    this._extensionManager.registerByteStreamHandler("Windows.Xbox.Media.SmoothStreamingByteStreamHandler", "", "text/xml", ps)
                                }
                                else {
                                    this._extensionManager.registerByteStreamHandler("Microsoft.Entertainment.Platform.Playback.MBRByteStreamHandler", "", "text/xml");
                                    if (isH264 && configurationManager.playback.useC13ForH264Streaming)
                                        MSEPlatform.Playback.Etw.traceString("VideoPlayer::_registerByteStreamHandlerForURL: Using MBRByteStreamHandler for H.264 streaming!")
                                }
                                MSEPlatform.Playback.Etw.traceString("VideoPlayer::_registerByteStreamHandlerForURL: Registered VC-1 bytestream handler. Url:" + url)
                            }
                        }
                    }, maxWidthUnconstrained: {get: function maxWidthUnconstrained_get() {
                            return (MS.Entertainment.Utilities.isApp1 && !MS.Entertainment.Utilities.isWindowsBlue) ? 1366 : 1920
                        }}, maxHeightUnconstrained: {get: function maxHeightUnconstrained_get() {
                            return (MS.Entertainment.Utilities.isApp1 && !MS.Entertainment.Utilities.isWindowsBlue) ? 768 : 1080
                        }}, maxWidthConstrained: 1920, maxHeightConstrained: 720, maxBitrateConstrained: 850000, maxBitrateUnconstrained: 4294967295, respectConstrainedMode: true, lastBitrateUnconstrained: 0, lastBitrateUnconstrainedKey: "VideoPlayer._lastBitrateUnconstrained", VideoStreamFormat: {
                        H264: "H264", VC1: "VC1"
                    }, _smoothStreamingSessionManager: null, _adaptiveSourceManager: null, _extensionManager: null, _currentlyRegisteredByteStreamHandler: null
            })
    })
})()
})();
/* >>>>>>/components/playback/mediainstance.js:1647 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Platform.Playback");
(function() {
    "use strict";
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {MediaInstance: MS.Entertainment.UI.Framework.define(function MediaInstance_constructor(mediaObject) {
            this._initialize(mediaObject)
        }, {
            source: String.empty, acquisitionData: null, alternateSource: null, mediaType: -1, protectionState: MS.Entertainment.Platform.Playback.ProtectionState.unknown, startPosition: 0, cookie: 1, isLocal: false, playlogEnabled: true, trackingId: String.empty, isAudioAd: false, isPreview: false, inCollection: false, inCloudCollectionV2: false, fromCollection: false, licenseKeyId: null, signedLicensePolicyTicket: null, serviceId: null, duration: null, videoAdSupported: false, videoEncoding: Microsoft.Entertainment.Marketplace.VideoEncoding.unknown, alternateVideoEncoding: null, _bookmark: 0, _played: false, _playcount: 0, _mediaItem: null, _provider: null, _errorDescriptor: null, _initializedPromise: null, _mediaStore: null, _bookmarkWatcher: null, _initialize: function MediaInstance_initialize(mediaObject) {
                    var that = this;
                    var playFromBookmark = true;
                    if (mediaObject) {
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        if (mediaObject.hasOwnProperty("source")) {
                            var source = mediaObject["source"];
                            var manifestHint = /_51.ism\/manifest/i;
                            if (source && source.toString().match(manifestHint) && !MS.Entertainment.Utilities.isVideoApp2) {
                                this["alternateSource"] = source;
                                this["source"] = source.toString().replace(manifestHint, "_ST.ism/manifest")
                            }
                            else
                                this["source"] = source
                        }
                        if (mediaObject.hasOwnProperty("mediaType"))
                            this["mediaType"] = mediaObject["mediaType"];
                        if (mediaObject.hasOwnProperty("startPosition") && mediaObject["startPosition"]) {
                            this["startPosition"] = mediaObject["startPosition"];
                            playFromBookmark = false
                        }
                        if (mediaObject.hasOwnProperty("cookie"))
                            this["cookie"] = mediaObject["cookie"];
                        this["isPreview"] = false;
                        if (mediaObject.hasOwnProperty("mediaItem")) {
                            this["_mediaItem"] = mediaObject["mediaItem"];
                            if (this._mediaItem && this._mediaItem.acquisitionData)
                                this["acquisitionData"] = this._mediaItem.acquisitionData;
                            if (this._mediaItem && this._mediaItem.data) {
                                if (this._mediaItem.data.libraryId)
                                    this["libraryId"] = this._mediaItem.data.libraryId;
                                if (this._mediaItem.data.playPreviewOnly) {
                                    this["playlogEnabled"] = false;
                                    this["isPreview"] = true
                                }
                                if (this._mediaItem.data.playlistId && this._mediaItem.data.playlistId >= 0) {
                                    this["containerLibraryId"] = this._mediaItem.data.playlistId;
                                    this["containerMediaType"] = Microsoft.Entertainment.Queries.ObjectType.playlist
                                }
                                else if (this._mediaItem.data.albumId) {
                                    this["containerLibraryId"] = this._mediaItem.data.albumId;
                                    this["containerMediaType"] = Microsoft.Entertainment.Queries.ObjectType.album
                                }
                                if (this._mediaItem.data.inCollection)
                                    this["inCollection"] = this._mediaItem.data.inCollection;
                                if (this._mediaItem.data.inCloudCollectionV2)
                                    this["inCloudCollectionV2"] = this._mediaItem.data.inCloudCollectionV2;
                                if (this._mediaItem.data.duration)
                                    this["duration"] = this._mediaItem.data.duration;
                                if (this._mediaItem.data.serviceId)
                                    this["serviceId"] = this._mediaItem.data.serviceId;
                                if (this._mediaItem.data.fromCollection)
                                    this["fromCollection"] = this._mediaItem.data.fromCollection
                            }
                        }
                        if (mediaObject.hasOwnProperty("mediaInstanceId"))
                            this["mediaInstanceId"] = mediaObject["mediaInstanceId"];
                        if (mediaObject.hasOwnProperty("licenseKeyId"))
                            this["licenseKeyId"] = mediaObject["licenseKeyId"];
                        if (mediaObject.hasOwnProperty("signedLicensePolicyTicket"))
                            this["signedLicensePolicyTicket"] = mediaObject["signedLicensePolicyTicket"];
                        if (mediaObject.hasOwnProperty("nativeLicenseRight"))
                            this["nativeLicenseRight"] = mediaObject["nativeLicenseRight"];
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        var freeVideoWithAds = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.videoFreeWithAds);
                        if (mediaObject.hasOwnProperty("offerId")) {
                            this["offerId"] = mediaObject["offerId"];
                            var offerId = mediaObject["offerId"];
                            if (freeVideoWithAds && offerId && configurationManager.video.offerIdsVideoFreeWithAds) {
                                MS.Entertainment.Platform.Playback.assert(offerId.length > 3, "OfferId is invalid.");
                                offerId = offerId.substr(1, offerId.length - 2).toLowerCase();
                                var freeOfferWithAds = configurationManager.video.offerIdsVideoFreeWithAds.split(',');
                                for (var count = 0; count < freeOfferWithAds.length; count++)
                                    if (offerId === freeOfferWithAds[count].toLowerCase()) {
                                        this.videoAdSupported = true;
                                        break
                                    }
                            }
                        }
                        if (freeVideoWithAds && configurationManager.video.playVideoFreeWithAds)
                            this.videoAdSupported = true;
                        if (mediaObject.hasOwnProperty("libraryId"))
                            this["libraryId"] = mediaObject["libraryId"];
                        if (mediaObject.hasOwnProperty("isLocal"))
                            this["isLocal"] = mediaObject["isLocal"];
                        else if (this._mediaItem && this._mediaItem.data)
                            this["isLocal"] = this._mediaItem.data.canPlayLocally ? true : false;
                        if (mediaObject.hasOwnProperty("error"))
                            this["_errorDescriptor"] = mediaObject["error"];
                        if (mediaObject.hasOwnProperty("trackingId") && !!mediaObject.trackingId)
                            this["trackingId"] = mediaObject["trackingId"];
                        if (mediaObject.hasOwnProperty("isAudioAd"))
                            this["isAudioAd"] = mediaObject["isAudioAd"];
                        if (mediaObject.hasOwnProperty("protectionState"))
                            this["protectionState"] = mediaObject["protectionState"];
                        if (mediaObject.hasOwnProperty("videoEncoding")) {
                            this["videoEncoding"] = mediaObject["videoEncoding"];
                            this["alternateVideoEncoding"] = null
                        }
                        else if (this.isVideo() && this.isPreview) {
                            this["videoEncoding"] = Microsoft.Entertainment.Marketplace.VideoEncoding.h264;
                            this["alternateVideoEncoding"] = Microsoft.Entertainment.Marketplace.VideoEncoding.vc1
                        }
                        var protectionState = this["protectionState"];
                        if (this.isLocal && this.isMusicTrack() && (protectionState === MS.Entertainment.Platform.Playback.ProtectionState.drmProtected || protectionState === MS.Entertainment.Platform.Playback.ProtectionState.unknown)) {
                            var isSubscription = configurationManager.service.lastSignedInUserSubscription;
                            if (!isSubscription)
                                if (protectionState === MS.Entertainment.Platform.Playback.ProtectionState.drmProtected) {
                                    this["_errorDescriptor"] = {msExtendedCode: MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_FREESTREAMING_NO_RIGHTS.code};
                                    MSEPlatform.Playback.Etw.traceString("MediaInstance_constructor : Free-streaming user trying to play protected content, setting error to 0xC1010094")
                                }
                                else if (protectionState === MS.Entertainment.Platform.Playback.ProtectionState.unknown) {
                                    this["protectionState"] = MS.Entertainment.Platform.Playback.ProtectionState.unprotected;
                                    MSEPlatform.Playback.Etw.traceString("MediaInstance_constructor : unknown protection state. We set to unprotected state")
                                }
                        }
                    }
                    this._initializedPromise = this._loadBookmarkAndPlayDataAsync(playFromBookmark);
                    this._maxPositionValueHolder = 0;
                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.contentRestrictionService)) {
                        var contentRestrictionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.contentRestrictionService);
                        this._ratedContentDescriptionPromise = contentRestrictionService.createRatedContentDescriptionFromMediaItemAsync(this._mediaItem && this._mediaItem.data, MS.Entertainment.Utilities.isMusicApp2)
                    }
                }, maxPosition: {
                    get: function MediaInstance__position_get() {
                        return this._maxPositionValueHolder
                    }, set: function MediaInstance__position_set(value) {
                            if (value > this._maxPositionValueHolder && !this._remoteTrackingMode)
                                this._maxPositionValueHolder = value
                        }
                }, _loadBookmarkAndPlayDataAsync: function MediaInstance_loadBookmarkAndPlayDataAsync(playFromBookmark) {
                    var provider = this._getProvider();
                    if (this.playlogEnabled && provider && this.libraryId && this.libraryId > 0) {
                        var getBookmarkAsync = provider.getBookmarkAsync(this.libraryId).then(function success(result) {
                                this._bookmark = result.value;
                                if (playFromBookmark)
                                    this.startPosition = this._bookmark;
                                return WinJS.Promise.wrap()
                            }.bind(this), function error() {
                                this._bookmark = 0;
                                MSEPlatform.Playback.Etw.traceString("MediaInstance_loadBookmarkAndPlayDataAsync : Failed to load bookmark");
                                return WinJS.Promise.wrap()
                            }.bind(this));
                        var getPlaycountAsync = provider.getPlaycountAsync(this.libraryId).then(function success(result) {
                                this._playcount = result.value;
                                return WinJS.Promise.wrap()
                            }.bind(this), function error() {
                                this._playcount = 0;
                                MSEPlatform.Playback.Etw.traceString("MediaInstance_loadBookmarkAndPlayDataAsync : Failed to load play count");
                                return WinJS.Promise.wrap()
                            }.bind(this));
                        var getPlayedStatusAsync = provider.getPlayedStatusAsync(this.libraryId).then(function success(result) {
                                this._played = result.value;
                                return WinJS.Promise.wrap()
                            }.bind(this), function error() {
                                this._played = 0;
                                MSEPlatform.Playback.Etw.traceString("MediaInstance_loadBookmarkAndPlayDataAsync : Failed to load played status");
                                return WinJS.Promise.wrap()
                            }.bind(this));
                        return WinJS.Promise.join([getBookmarkAsync, getPlaycountAsync, getPlayedStatusAsync]).then(function() {
                                return WinJS.Promise.wrap(this)
                            }.bind(this))
                    }
                    else
                        return WinJS.Promise.wrap(this)
                }, isEqual: function MediaInstance_isEqual(mediaInstance) {
                    var isSame = false;
                    if (mediaInstance && this.source === mediaInstance.source && this.mediaType === mediaInstance.mediaType && this.protectionState === mediaInstance.protectionState && this.startPosition === mediaInstance.startPosition && this.cookie === mediaInstance.cookie)
                        isSame = true;
                    return isSame
                }, toString: function MediaInstance_toString() {
                    var mediaString = this.source + " : " + this.mediaType + " : " + this.protectionState + " : " + this.startPosition + " : " + this.cookie;
                    return mediaString
                }, _getProvider: function _getProvider() {
                    if (!this._mediaStore)
                        this._mediaStore = new Microsoft.Entertainment.Platform.MediaStore;
                    if (this.mediaType === Microsoft.Entertainment.Queries.ObjectType.video)
                        return this._mediaStore.videoProvider;
                    else if (this.mediaType === Microsoft.Entertainment.Queries.ObjectType.track)
                        return this._mediaStore.trackProvider;
                    else
                        return null
                }, _getContainerProvider: function _getContainerProvider() {
                    if (!this._mediaStore)
                        this._mediaStore = new Microsoft.Entertainment.Platform.MediaStore;
                    switch (this.containerMediaType) {
                        case Microsoft.Entertainment.Queries.ObjectType.album:
                            return this._mediaStore.albumProvider;
                        case Microsoft.Entertainment.Queries.ObjectType.playlist:
                            return this._mediaStore.playlistProvider;
                        default:
                            return null
                    }
                }, _getBookmarkWatcher: function _getBookmarkWatcher() {
                    if (!this._bookmarkWatcher)
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.bookmarkOperationsWatcher))
                            this._bookmarkWatcher = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.bookmarkOperationsWatcher);
                    return this._bookmarkWatcher
                }, _getMediaItemProp: function MediaInstance_getMediaItemProp(name, defaultValue, validityCheckFunction) {
                    if (!name || typeof(name) !== "string" || name === String.empty)
                        throw new Error("Invalid property name.");
                    if (!validityCheckFunction || typeof(validityCheckFunction) !== "function")
                        throw new Error("Invalid validity check function.");
                    var result = this[name];
                    if (validityCheckFunction(result))
                        return result;
                    if (this._mediaItem) {
                        var result = this._mediaItem[name];
                        if (validityCheckFunction(result))
                            return result;
                        if (this._mediaItem.data) {
                            var result = this._mediaItem.data[name];
                            if (validityCheckFunction(result))
                                return result
                        }
                    }
                    return defaultValue
                }, isMovie: function MediaInstance_isMovie() {
                    var isType = false;
                    if (this._mediaItem)
                        isType = (this.mediaType === Microsoft.Entertainment.Queries.ObjectType.video && this._mediaItem.data.videoType === Microsoft.Entertainment.Queries.VideoType.movie);
                    return isType
                }, isTVEpisode: function MediaInstance_isTVEpisode() {
                    var isType = false;
                    if (this._mediaItem)
                        isType = (this.mediaType === Microsoft.Entertainment.Queries.ObjectType.video && this._mediaItem.data.videoType === Microsoft.Entertainment.Queries.VideoType.tvEpisode);
                    return isType
                }, isVideo: function MediaInstance_isVideo() {
                    return (this.mediaType === Microsoft.Entertainment.Queries.ObjectType.video)
                }, isMusicVideo: function MediaInstance_isMusicVideo() {
                    var isType = false;
                    if (this._mediaItem)
                        isType = (this.mediaType === Microsoft.Entertainment.Queries.ObjectType.video && this._mediaItem.data.videoType === Microsoft.Entertainment.Queries.VideoType.musicVideo);
                    return isType
                }, isMusicTrack: function MediaInstance_isMusicTrack() {
                    return (this.mediaType === Microsoft.Entertainment.Queries.ObjectType.track)
                }, isMusicAlbum: function MediaInstance_isMusicAlbum() {
                    return (this.mediaType === Microsoft.Entertainment.Queries.ObjectType.album)
                }, isGame: function MediaInstance_isGame() {
                    return (this.mediaType === Microsoft.Entertainment.Queries.ObjectType.game)
                }, isArtist: function MediaInstance_isArtist() {
                    var isType = false;
                    if (this._mediaItem)
                        isType = (this.mediaType === Microsoft.Entertainment.Queries.ObjectType.person && this._mediaItem.personType === Microsoft.Entertainment.Queries.PersonType.artist);
                    return isType
                }, isGenre: function MediaInstance_isGenre() {
                    return (this.mediaType === Microsoft.Entertainment.Queries.ObjectType.genre)
                }, isPlaylist: function MediaInstance_isPlaylist() {
                    return (this.mediaType === Microsoft.Entertainment.Queries.ObjectType.playlist)
                }, bookmark: {
                    set: function MediaInstance_setBookmark(newValue) {
                        this._bookmark = newValue;
                        if (this.libraryId && this.libraryId > 0) {
                            var provider = this._getProvider();
                            if (provider) {
                                var setBookmarkAsync = provider.setBookmarkAsync(this.libraryId, newValue).then(function success() {
                                        MSEPlatform.Playback.Etw.tracePlaylogBookmarkSave(newValue)
                                    }, function error() {
                                        MSEPlatform.Playback.Etw.traceString("MediaInstance_setBookmarkAsync : Failed to save bookmark")
                                    });
                                var bookmarkWatcher = this._getBookmarkWatcher();
                                if (bookmarkWatcher)
                                    bookmarkWatcher.registerOperation(setBookmarkAsync)
                            }
                        }
                    }, get: function MediaInstance_getBookmark() {
                            return this._bookmark
                        }
                }, played: {
                    set: function MediaInstance_setPlayed(newValue) {
                        this._played = newValue;
                        if (this.libraryId && this.libraryId > 0) {
                            var provider = this._getProvider();
                            var containerProvider = this._getContainerProvider();
                            var bookmarkWatcher = this._getBookmarkWatcher();
                            if (provider) {
                                var setPlayedStatusAsync = provider.setPlayedStatusAsync(this.libraryId, newValue).then(function success() {
                                        MSEPlatform.Playback.Etw.tracePlaylogPlayedSave(newValue)
                                    }, function error() {
                                        MSEPlatform.Playback.Etw.traceString("MediaInstance_setPlayedStatusAsync : Failed to save played status")
                                    });
                                if (bookmarkWatcher)
                                    bookmarkWatcher.registerOperation(setPlayedStatusAsync)
                            }
                            if (containerProvider) {
                                var setPlayedStatusAsync = containerProvider.setPlayedStatusAsync(this.containerLibraryId, newValue).then(function success() {
                                        MSEPlatform.Playback.Etw.tracePlaylogPlayedSave(newValue)
                                    }, function error() {
                                        MSEPlatform.Playback.Etw.traceString("MediaInstance_setPlayedStatusAsync : Failed to save played status on container")
                                    });
                                if (bookmarkWatcher)
                                    bookmarkWatcher.registerOperation(setPlayedStatusAsync)
                            }
                        }
                    }, get: function MediaInstance_getPlayed() {
                            return this._played
                        }
                }, playcount: {
                    set: function MediaInstance_setPlaycount(newValue) {
                        this._playcount = newValue;
                        if (this.libraryId && this.libraryId > 0) {
                            var provider = this._getProvider();
                            if (provider)
                                provider.setPlaycountAsync(this.libraryId, newValue).then(function success() {
                                    MSEPlatform.Playback.Etw.tracePlaylogPlayCountSave(newValue)
                                }, function error() {
                                    MSEPlatform.Playback.Etw.traceString("MediaInstance_setPlaycountAsync : Failed to save play count")
                                })
                        }
                    }, get: function MediaInstance_getPlaycount() {
                            return this._playcount
                        }
                }, serviceIdSafe: {get: function MediaInstance_getServiceId() {
                        var serviceMediaIdSafe = this._getMediaItemProp("zuneId", MS.Entertainment.Utilities.EMPTY_GUID, function(value) {
                                return !MS.Entertainment.Utilities.isEmptyGuid(value)
                            });
                        if (MS.Entertainment.Utilities.isValidServiceId(serviceMediaIdSafe))
                            return serviceMediaIdSafe;
                        else {
                            serviceMediaIdSafe = this._getMediaItemProp("serviceId", MS.Entertainment.Utilities.EMPTY_GUID, function(value) {
                                return !MS.Entertainment.Utilities.isEmptyGuid(value)
                            });
                            var serviceIdType = this._getMediaItemProp("serviceIdType", "unknown", function(value) {
                                    return value === MS.Entertainment.Data.Query.edsIdType.zuneCatalog || value === MS.Entertainment.Data.Query.edsIdType.canonical
                                });
                            if (serviceIdType === MS.Entertainment.Data.Query.edsIdType.zuneCatalog)
                                return serviceMediaIdSafe;
                            else
                                return MS.Entertainment.Utilities.EMPTY_GUID
                        }
                    }}, mediaTypeSafe: {get: function MediaInstance_getMediaTypeSafe() {
                        return this._getMediaItemProp("mediaType", -1, function(value) {
                                return value !== -1
                            })
                    }}, shouldLogToDrmDownloadHistory: {get: function MediaInstance_shouldLogToDownloadHistory() {
                        if (this.nativeLicenseRight !== undefined && this.nativeLicenseRight !== null && this.nativeLicenseRight !== Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.unknownMediaRight)
                            return this.nativeLicenseRight !== Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.subscriptionDownload;
                        return this.mediaTypeSafe !== Microsoft.Entertainment.Queries.ObjectType.track
                    }}, fillDownloadSubscriptionInfoAsync: function fillDownloadSubscriptionInfoAsync() {
                    if ((!this.mediaInstanceId || MS.Entertainment.Utilities.isEmptyGuid(this.mediaInstanceId)) && this._mediaItem && this.mediaTypeSafe === Microsoft.Entertainment.Queries.ObjectType.track)
                        return MS.Entertainment.Platform.PurchaseHelpers.queryMediaDetailForCacheItemAsync(this._mediaItem, this.mediaTypeSafe).then(function queryMediaDetailForCacheItemAsync_complete(detail) {
                                if (detail.result && detail.result.item && detail.result.item.rights) {
                                    var right = MS.Entertainment.Platform.PurchaseHelpers.getPreferredRight(detail.result.item.rights, [Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.subscriptionDownload]);
                                    if (right) {
                                        this.mediaInstanceId = right.mediaInstanceId;
                                        this.offerId = right.offerId;
                                        this.nativeLicenseRight = Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.subscriptionDownload
                                    }
                                }
                            }.bind(this));
                    return WinJS.Promise.wrap()
                }
        }, {createInstanceAsync: function MediaInstance_CreateInstanceAsync(itemData) {
                var mediaInstance = new MSEPlatform.Playback.MediaInstance(itemData);
                return mediaInstance._initializedPromise
            }})})
})()
})();
/* >>>>>>/components/playback/controls/playbackcontrollervideo.js:2016 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Platform.Playback");
(function() {
    "use strict";
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {PlaybackControllerVideo: MS.Entertainment.UI.Framework.derive("MS.Entertainment.Platform.Playback.PlaybackController", function PlaybackController_constructor() {
            MSEPlatform.Playback.PlaybackController.prototype.constructor.call(this)
        }, {
            _remapPlaybackError: function _remapPlaybackError(error) {
                var remappedError = error;
                if (MS.Entertainment.Utilities.isApp2 && error && error.msExtendedCode === -2147024891)
                    remappedError = MS.Entertainment.Platform.Playback.makePlaybackError(MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_HDMI_OUTPUT_LOST.code, "PlaybackController_handleCurrentMediaError");
                return remappedError
            }, _processPlaybackErrorPostMapping: function _processPlaybackErrorPostMapping(error) {
                    this._player.reset();
                    this.currentTransportState = MSEPlatform.Playback.TransportState.stopped
                }, _onPlayerEvent: function _onPlayerEvent(event) {
                    MSEPlatform.Playback.PlaybackController.prototype._onPlayerEvent.apply(this, arguments);
                    switch (event.type) {
                        case"playing":
                            this._displayRequestActive();
                            break;
                        case"pause":
                        case"ended":
                        case"error":
                            this._displayRequestRelease();
                            break
                    }
                }, _displayRequestActive: function _displayRequestActive() {
                    this._sessionMgr.displayRequestActive()
                }, _displayRequestRelease: function _displayRequestRelease() {
                    this._sessionMgr.displayRequestRelease()
                }
        }, {})})
})()
})();
/* >>>>>>/components/playback/controls/playbackcontroller.js:2055 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Platform.Playback");
(function() {
    "use strict";
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    var Playback = WinJS.Namespace.define("MS.Entertainment.Platform.Playback", null);
    var VideoRetrySkipTimeMs = 2000;
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {PlaybackController: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.Framework.ObservableBase", function PlaybackController_constructor() {
            var sessionMgr = null;
            var eventHandlers = MS.Entertainment.Utilities.addEvents(this, {
                    currentMediaChanged: function currentMediaChanged(e) {
                        var newMedia = e.detail.newValue;
                        var oldMedia = e.detail.oldValue;
                        MSEPlatform.Playback.Etw.traceString("PlaybackController::currentMediaChanged: ");
                        this._setMedia(newMedia);
                        if (!sessionMgr && MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.sessionManager))
                            sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        if (newMedia && sessionMgr)
                            sessionMgr._notifyUpcomingStreaming(!newMedia.isLocal);
                        if (newMedia)
                            this._isVideo = newMedia.isVideo ? newMedia.isVideo() : false
                    }.bind(this), nextMediaChanged: function nextMediaChanged(e) {
                            var newMedia = e.detail.newValue;
                            MSEPlatform.Playback.Etw.traceString("PlaybackController::nextMediaChanged: " + (newMedia ? newMedia.source : "null"));
                            if (!!newMedia)
                                MS.Entertainment.Platform.Playback.Etw.tracePlaylistSetNextMedia(newMedia);
                            this._setNextMedia(newMedia)
                        }.bind(this), playerStateChanged: function playerStateChanged(e) {
                            var newState = e.detail.newValue;
                            var oldState = e.detail.oldValue;
                            if (!oldState)
                                oldState = "undefined";
                            MSEPlatform.Playback.Etw.tracePlayerStateChanged(newState, oldState)
                        }, currentTransportStateChanged: function currentTransportStateChanged(e) {
                            var newState = e.detail.newValue;
                            var oldState = e.detail.oldValue;
                            if (!oldState)
                                oldState = "undefined";
                            MSEPlatform.Playback.Etw.traceTransportStateChanged(newState, oldState, this._isVideo)
                        }.bind(this)
                });
            this._sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
            this.bind("currentTransportState", function onCurrentTransportStateChanged() {
                this._reschedulePrerollCallback()
            }.bind(this));
            this._configManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
            this._offlineNetworkRequestDelay = this._configManager.playback.offlineNetworkRequestDelay;
            var observablePromises = {};
            var lastPlayerStateError = null;
            this._observableNoLossAssign = function _observableNoLossAssign(name, value) {
                if (name === "playerState")
                    if (value === MS.Entertainment.Platform.Playback.PlayerState.error) {
                        if (!this._errorDescriptor.isCritical)
                            this._errorDescriptor.isCritical = this._isCriticalError(this._errorDescriptor);
                        if (this._currentMedia)
                            this._errorDescriptor.errorOrdinal = this._currentMedia.cookie;
                        this._observableNoLossAssign("error", this._errorDescriptor);
                        lastPlayerStateError = this._errorDescriptor
                    }
                    else if (lastPlayerStateError) {
                        this._observableNoLossAssign("error", null);
                        lastPlayerStateError = null
                    }
                if (!observablePromises[name])
                    observablePromises[name] = this.updateAndNotify(name, value);
                else
                    observablePromises[name] = observablePromises[name].then(function assign() {
                        return this.updateAndNotify(name, value)
                    }.bind(this))
            };
            this._observableNoLossAssignAsyncBegin = function _observableNoLossAssignAsyncBegin(name) {
                var completion;
                if (observablePromises[name]) {
                    observablePromises[name].cancel();
                    observablePromises[name] = null
                }
                observablePromises[name] = new WinJS.Promise(function(c, e, p) {
                    completion = c
                });
                return {
                        complete: function(value) {
                            if (value)
                                this._observableNoLossAssign(name, value);
                            completion()
                        }.bind(this), cancel: function() {
                                if (observablePromises[name]) {
                                    observablePromises[name].cancel();
                                    observablePromises[name] = null
                                }
                            }.bind(this)
                    }
            },
            this.waitForNoLossAssignmentsComplete = function waitForNoLossAssignmentsComplete() {
                return WinJS.Promise.join(observablePromises)
            }
        }, {
            dispose: function dispose() {
                this.reset();
                this.unbind("currentTransportState");
                if (this._playerEventHandlers) {
                    this._playerEventHandlers.cancel();
                    this._playerEventHandlers = null
                }
                this._player._currentMediaEventsCallback = null
            }, targetTransportState: {
                    get: function targetTransportState_get() {
                        return this._targetTransportState
                    }, set: function targetTransportState_set(value) {
                            if (!this._isPlayerSet())
                                return;
                            MSEPlatform.Playback.Etw.traceTargetTransportStateSet(value, this.currentTransportState);
                            if (this._isPlayerState(MSEPlatform.Playback.PlayerState.ready)) {
                                if ((this._targetTransportState !== value) || (MS.Entertainment.Platform.Playback.TransportState.playing === value && (this.playbackRate > 1 || this.playbackRate < -1)))
                                    this._applyTargetTransportState(value)
                            }
                            else if (this._isPlayerState(MSEPlatform.Playback.PlayerState.error))
                                try {
                                    this._applyTargetTransportState(value)
                                }
                                catch(e) {}
                            else
                                this._targetTransportState = value
                        }
                }, autoPlay: {
                    get: function autoPlay_get() {
                        if (!this._isPlayerSet())
                            return false;
                        return this._player.autoPlay
                    }, set: function autoPlay_set(value) {
                            if (!this._isPlayerSet())
                                return;
                            this._player.autoPlay = value
                        }
                }, muted: {
                    get: function muted_get() {
                        if (!this._isPlayerSet())
                            return false;
                        return this._player.muted
                    }, set: function muted_set(value) {
                            if (!this._isPlayerSet())
                                return;
                            this._player.muted = value
                        }
                }, videoEncoding: {get: function videoEncoding_get() {
                        return this.currentMedia ? this.currentMedia.videoEncoding : null
                    }}, videoStreamStatistics: {get: function videoStreamStatistics_get() {
                        if (!this._isPlayerSet())
                            return null;
                        return this._player.videoStreamStatistics
                    }}, _volume: {
                    get: function volume_get() {
                        if (!this._isPlayerSet())
                            return null;
                        return this._player._volume
                    }, set: function volume_set(value) {
                            MS.Entertainment.UI.assert(MS.Entertainment.Utilities.isApp2, "Apply volume directly on the tag should be limited to App2 only");
                            if (!this._isPlayerSet())
                                return;
                            this._player._volume = value
                        }
                }, seekToPosition: function seekToPosition(positionMsec) {
                    if (!this._isPlayerSet())
                        return;
                    if (positionMsec < 0)
                        positionMsec = 0;
                    if (positionMsec > this.duration)
                        positionMsec = this.duration;
                    if (!this._isPlayerState(MSEPlatform.Playback.PlayerState.ready))
                        this._targetPosition = positionMsec;
                    else {
                        if (this.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.playing) {
                            MS.Entertainment.Utilities.Telemetry.logPauseHappened(this, this.forceTimeUpdate());
                            MS.Entertainment.Utilities.Telemetry.logPlayHappened(this, positionMsec)
                        }
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        var isPlayToReceiverSessionRunning = sessionMgr && sessionMgr.primarySession && sessionMgr.primarySession.isPlayToReceiverSessionRunning;
                        if (!isPlayToReceiverSessionRunning)
                            if ((this.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped) && (this._currentMedia && !this._currentMedia.videoAdSupported))
                                this._applyTargetTransportState(MS.Entertainment.Platform.Playback.TransportState.playing);
                        this._player.seekToPosition(positionMsec);
                        if (this.currentTransportState !== MS.Entertainment.Platform.Playback.TransportState.playing)
                            this._targetPosition = positionMsec
                    }
                }, fastFwd: function fastFwd() {
                    if (!this._isPlayerSet())
                        return;
                    this._player.fastFwd()
                }, fastReverse: function fastReverse() {
                    if (!this._isPlayerSet())
                        return;
                    this._player.rewind()
                }, slowFwd: function slowFwd() {
                    if (!this._isPlayerSet())
                        return;
                    this._player.slowFwd()
                }, slowReverse: function slowReverse() {
                    if (!this._isPlayerSet())
                        return;
                    this._player.slowRewind()
                }, selectVideoBitrate: function selectVideoBitrate(requestedBitrate) {
                    if (!this._isPlayerSet())
                        return;
                    this.currentRequestedBitrate = +requestedBitrate;
                    this._player.selectVideoBitrate(requestedBitrate)
                }, getAudioTracks: function getAudioTracks() {
                    if (!this._isPlayerSet())
                        return;
                    return this._player.getAudioTracks()
                }, getSelectedAudioTrack: function getSelectedAudioTrack() {
                    if (!this._isPlayerSet())
                        return;
                    return this._player.getSelectedAudioTrack()
                }, selectAudioTrack: function selectAudioTrack(trackIndex) {
                    if (!this._isPlayerSet())
                        return;
                    this._player.selectAudioTrack(trackIndex)
                }, setPlaybackRate: function setPlaybackRate(playbackRate) {
                    if (!this._isPlayerSet())
                        return;
                    if (playbackRate === +playbackRate && playbackRate >= this.minPlaybackRate && playbackRate <= this.maxPlaybackRate)
                        this._player.playbackRate = playbackRate
                }, reset: function reset(sendStop) {
                    this._internalCurrentMedia = null;
                    if (!this._isPlayerSet())
                        return;
                    if (sendStop && this._player && this.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.playing)
                        MS.Entertainment.Utilities.Telemetry.logSkipHappened(this, this.forceTimeUpdate());
                    this._player.reset(false);
                    this._player.reset(true);
                    if (this._prerollMediaItem) {
                        this._prerollMediaItem = null;
                        this._cancelPrerollCallback()
                    }
                    this.currentPosition = 0;
                    this._targetPosition = 0;
                    if (sendStop)
                        this.currentTransportState = MS.Entertainment.Platform.Playback.TransportState.stopped;
                    this._targetTransportState = MS.Entertainment.Platform.Playback.TransportState.unInitialize;
                    this.duration = 0;
                    this.errorDescriptor = null;
                    this._observableNoLossAssign("playerState", MS.Entertainment.Platform.Playback.PlayerState.notReady);
                    this.readyForNextMedia = false;
                    this.videoWidth = 0;
                    this.videoHeight = 0;
                    this.playbackRate = 1;
                    this.minPlaybackRate = -128;
                    this.maxPlaybackRate = 128;
                    this.currentRequestedBitrate = null
                }, forceError: function forceError(errorCode) {
                    if (!this._isPlayerSet())
                        return;
                    MSEPlatform.Playback.firePlaybackError(this._onPlayerEvent.bind(this), errorCode, "forceError");
                    this.reset(true)
                }, setPlayer: function setPlayer(player) {
                    if (player) {
                        this._player = player;
                        if (this._playerEventHandlers) {
                            this._playerEventHandlers.cancel();
                            this._playerEventHandlers = null
                        }
                        this._playerEventHandlers = MS.Entertainment.Utilities.addEvents(this._player, {
                            _nextMediaLoadedChanged: function _onNextMediaLoaded(e) {
                                var isLoaded = e.detail.newValue;
                                this._handleNextMediaLoaded(isLoaded, this)
                            }.bind(this), _nextMediaStartedChanged: function _onNextMediaStarted(e) {
                                    var isStarted = e.detail.newValue;
                                    this._handleNextMediaStarted(isStarted, this)
                                }.bind(this), _nextMediaErrorChanged: function _onNextMediaError(e) {
                                    var isError = e.detail.newValue;
                                    this._handleNextMediaError(isError)
                                }.bind(this), isRemoteSessionRunningChanged: function _onRemoteSessionChanged(e) {
                                    var isRemoteSessionRunningValue = e.detail.newValue;
                                    this.isRemoteSessionRunning = isRemoteSessionRunningValue
                                }.bind(this), playToSenderConnectionStateChanged: function _onPlayToSenderConnectionStateChanged(e) {
                                    var playToSenderConnectionStateValue = e.detail.newValue;
                                    this.playToSenderConnectionState = playToSenderConnectionStateValue
                                }.bind(this), mediaElementChanged: function _onMediaElementChanged(e) {
                                    var mediaElementValue = e.detail.newValue;
                                    this.mediaElement = mediaElementValue
                                }.bind(this)
                        });
                        this._player._currentMediaEventsCallback = this._onPlayerEvent.bind(this)
                    }
                }, enableTimeUpdate: function enableTimeUpdate() {
                    if (!this._isPlayerSet())
                        return;
                    this._player.enableTimeUpdate();
                    MSEPlatform.Playback.Etw.tracePlaybackEnableTimeUpdate(this.currentPosition)
                }, disableTimeUpdate: function disableTimeUpdate() {
                    if (!this._isPlayerSet())
                        return;
                    this._player.disableTimeUpdate();
                    MSEPlatform.Playback.Etw.tracePlaybackDisableTimeUpdate(this.currentPosition)
                }, forceTimeUpdate: function forceTimeUpdate() {
                    if (this._isPlayerSet() && this._player._currentPlayer) {
                        this.currentPosition = this._player.forceTimeUpdate();
                        MSEPlatform.Playback.Etw.tracePlaybackForceTimeUpdate(this.currentPosition)
                    }
                    return this.currentPosition
                }, isRemoteSession: function isRemoteSession() {
                    if (this._isPlayerSet())
                        return this._player.isRemoteSession();
                    return false
                }, notifyNetworkConnectionChanged: function notifyNetworkConnectionChanged(networkConnection) {
                    WinJS.Promise.timeout().then(this._handleNetworkConnectionChanged(networkConnection))
                }, skipToNextPrerolled: function skipToNextPrerolled(fromSkipButton) {
                    this._reportPrerollErrors();
                    MS.Entertainment.Utilities.Telemetry.logSkipHappened(this, this.forceTimeUpdate());
                    this._player._switchPlayerAsync().done(function switch_completed(succeeded) {
                        if (succeeded) {
                            if (this.targetTransportState === MSEPlatform.Playback.TransportState.playing || this.currentTransportState === MSEPlatform.Playback.TransportState.playing || (this.autoPlay && !fromSkipButton))
                                this._applyTargetTransportState(MSEPlatform.Playback.TransportState.playing)
                        }
                        else
                            this._skipButtonPressed = fromSkipButton
                    }.bind(this), null)
                }, hasPrerolledMedia: function hasPrerolledMedia() {
                    return (this._player && this._player._nextPlayer)
                }, _internalPrerollMediaItem: function _internalPrerollMediaItem(mediaItem) {
                    this._prerollMediaItem = mediaItem;
                    if (this._prerollMediaItem)
                        return WinJS.Promise.as(this._reschedulePrerollCallback());
                    else
                        return WinJS.Promise.as(this._setNextMedia(null))
                }, prerollMediaItem: function PrerollMediaItem(mediaItem) {
                    var Playback = MS.Entertainment.Platform.Playback;
                    var name = (mediaItem && mediaItem.data) ? mediaItem.data.name : String.empty;
                    MSEPlatform.Playback.Etw.traceString("PlaybackController::prerollMediaItem: Control has been asked to preroll \"" + name + "\"");
                    this._cancelPrerollCallback();
                    if (this._player)
                        this._player.controlIsProcessingNextMedia = true;
                    if (MS.Entertainment.Utilities.isMusicApp && mediaItem && mediaItem.data)
                        return MS.Entertainment.Utilities.playabilityTestAsync(mediaItem.data, {
                                mediaRights: MS.Entertainment.Utilities.isApp1, checkExplicit: MS.Entertainment.Utilities.isApp1
                            }).then(function onPlayabilityTest(playability) {
                                if (!playability.isPlayable)
                                    return WinJS.Promise.wrapError(new Playback.UnplayableItemError(mediaItem, mediaItem.index));
                                else
                                    return this._internalPrerollMediaItem(mediaItem)
                            }.bind(this));
                    return this._internalPrerollMediaItem(mediaItem)
                }, _reschedulePrerollCallback: function _reschedulePrerollCallback() {
                    MSEPlatform.Playback.Etw.traceString("PlaybackController::reschedulePrerollCallback");
                    this._cancelPrerollCallback();
                    if (!this._prerollMediaItem) {
                        MSEPlatform.Playback.Etw.traceString("PlaybackController::reschedulePrerollCallback: Control has nothing to preroll. Dropping reschedule request.");
                        if (this._player)
                            this._player.controlIsProcessingNextMedia = false;
                        return
                    }
                    MSEPlatform.Playback.Etw.traceString("PlaybackController::reschedulePrerollCallback: Control is scheduling next media.");
                    var myPrerollPromiseOrdinal = this._prerollPromiseOrdinal;
                    this._prerollPromise = this._collectPrerollInformation().then(function onCollectPrerollInformation(prerollInformation) {
                        if (myPrerollPromiseOrdinal !== this._prerollPromiseOrdinal) {
                            MSEPlatform.Playback.Etw.traceString("PlaybackController::reschedulePrerollCallback: Promise was canceled but completed anyway. Dropping.");
                            if (this._player)
                                this._player.controlIsProcessingNextMedia = false;
                            return
                        }
                        if (this.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped) {
                            MSEPlatform.Playback.Etw.traceString("PlaybackController::reschedulePrerollCallback: Control was stopped, prerolling immediately.");
                            prerollInformation.delayTime = 0
                        }
                        if (prerollInformation.delayTime > 0 && this.currentTransportState !== MS.Entertainment.Platform.Playback.TransportState.playing)
                            if (this.currentMedia && this.currentMedia._errorDescriptor)
                                if (this._errorCount < this._maxSequentialErrors) {
                                    MSEPlatform.Playback.Etw.traceString("PlaybackController::reschedulePrerollCallback: Not playing and in error, prerolling immediately.");
                                    prerollInformation.delayTime = 0
                                }
                                else {
                                    MSEPlatform.Playback.Etw.traceString("PlaybackController::reschedulePrerollCallback: Not scheduling preroll. Too many errors. Report and deactivate playlist");
                                    this._setNextMedia(null);
                                    this._handleErrorsOnEndOfPlaylist()
                                }
                            else {
                                MSEPlatform.Playback.Etw.traceString("PlaybackController::reschedulePrerollCallback: Not scheduling preroll. Determined we should delay but pipeline is not playing");
                                return
                            }
                        MSEPlatform.Playback.Etw.traceString("PlaybackController::reschedulePrerollCallback: Scheduling preroll for " + (prerollInformation.delayTime / 1000) + " seconds from now");
                        return WinJS.Promise.timeout(prerollInformation.delayTime).then(function onPrerollTimeout() {
                                MSEPlatform.Playback.Etw.traceString("PlaybackController::reschedulePrerollCallback: Preroll timeout fired at " + (this.currentPosition / 1000) + " seconds into the file. ");
                                return this._requestNetwork().then(function() {
                                        return this._setPrerollItemAsNextInstance()
                                    }.bind(this))
                            }.bind(this), function onPrerollTimeoutError(error) {
                                if (WinJS.Promise.isCanceledError(error))
                                    MSEPlatform.Playback.Etw.traceString("PlaybackController::reschedulePrerollCallback: _prerollPromise canceled.")
                            })
                    }.bind(this), function onCollectPrerollInformationError(error) {
                        if (WinJS.Promise.isCanceledError(error))
                            MSEPlatform.Playback.Etw.traceString("PlaybackController::reschedulePrerollCallback::onCollectPrerollInformationError: _prerollPromise canceled.")
                    })
                }, _cancelPrerollCallback: function PlaylistCore_cancelPrerollCallback() {
                    if (this._prerollPromise) {
                        MSEPlatform.Playback.Etw.traceString("PlaybackController::cancelPrerollCallback: Canceling scheduled preroll.");
                        this._prerollPromise.cancel();
                        this._prerollPromise = null;
                        this._prerollPromiseOrdinal++
                    }
                }, _collectPrerollInformation: function PlaylistCore_collectPrerollInformation() {
                    return this._hydrateItemForPreroll(this._prerollMediaItem).then(function onHydrateItemForPreroll(result) {
                            var prerollInformation = {
                                    isLocal: null, delayTime: 0
                                };
                            if (result && result.data) {
                                prerollInformation.isLocal = result.data.canPlayLocally;
                                MSEPlatform.Playback.Etw.traceString("PlaybackController::collectPrerollInformation: Preroll item can play locally: " + result.data.canPlayLocally + ".");
                                if (prerollInformation.isLocal === false)
                                    prerollInformation.delayTime = this._calculatePrerollTimeout()
                            }
                            return prerollInformation
                        }.bind(this))
                }, _hydrateItemForPreroll: function _hydrateItemForPreroll(mediaItem) {
                    if (mediaItem && !mediaItem.hydratedForPreroll && mediaItem.data && mediaItem.data.mediaType) {
                        MSEPlatform.Playback.Etw.traceString("PlaybackController::_hydrateItemForPreroll:  >> hydrateLibraryInfoAsync");
                        return MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(mediaItem.data).then(function onHydrateLibraryInfoAsync() {
                                MSEPlatform.Playback.Etw.traceString("PlaybackController::_hydrateItemForPreroll:  << hydrateLibraryInfoAsync");
                                mediaItem.hydratedForPreroll = true;
                                return WinJS.Promise.wrap(mediaItem)
                            }, function onHydrateLibraryInfoAsyncError(e) {
                                MSEPlatform.Playback.Etw.traceString("PlaybackController::_hydrateItemForPreroll:  << hydrateLibraryInfoAsync Error");
                                return WinJS.Promise.wrapError(e)
                            })
                    }
                    else {
                        MSEPlatform.Playback.Etw.traceString("PlaybackController::_hydrateItemForPreroll:  mediaItem hydrated for preroll");
                        if (mediaItem)
                            mediaItem.hydratedForPreroll = true;
                        return WinJS.Promise.wrap(mediaItem)
                    }
                }, _calculatePrerollTimeout: function PlaylistCore_calculatePrerollTimeout() {
                    var currentPosition = this.forceTimeUpdate();
                    var currentDuration = this.duration ? this.duration : 0;
                    var timeout = currentDuration - currentPosition;
                    timeout = timeout - this._configManager.playback.streamingPrerollMS;
                    if (timeout < 0)
                        timeout = 0;
                    MSEPlatform.Playback.Etw.traceString("calculatePrerollTimeout: Determining a preroll timeout position: " + currentPosition + " duration: " + currentDuration + " timeout: " + timeout);
                    return timeout
                }, _setPrerollItemAsNextInstance: function _setPrerollItemAsNextInstance() {
                    MSEPlatform.Playback.Etw.traceString("PlaybackController::_setPrerollItemAsNextInstance: Prerolling at " + (this.currentPosition / 1000) + " seconds into the file.");
                    var onSetComplete = function onSetComplete() {
                            this._prerollMediaItem = null
                        }.bind(this);
                    MS.Entertainment.Platform.Playback.assert(this._prerollMediaItem, "Tried to convert a null preroll item. Dropping.");
                    if (!this._prerollMediaItem) {
                        MSEPlatform.Playback.Etw.traceString("Tried to convert a null preroll item. Dropping.");
                        return
                    }
                    return MS.Entertainment.Platform.Playback.Playlist.PlaylistCore.convertMediaItemToMediaInstance(this._prerollMediaItem, null, MS.Entertainment.Platform.Playback.UsageContext.automatic).then(function onConvertMediaItemToMediaInstance(mediaInstance) {
                            MSEPlatform.Playback.Etw.traceString("onConvertMediaItemToMediaInstance:  mediaInstance.source = " + mediaInstance.source);
                            this.nextMedia = mediaInstance;
                            onSetComplete()
                        }.bind(this), function onConvertMediaItemToMediaInstanceError(error) {
                            MSEPlatform.Playback.Etw.traceString("onConvertMediaItemToMediaInstanceError");
                            if (error && error.isUnplayableItemError) {
                                onSetComplete();
                                this._signalForNextMedia()
                            }
                            else if (!(WinJS.Promise.isCanceledError(error)))
                                return MSEPlatform.Playback.MediaInstance.createInstanceAsync({
                                        cookie: this._prerollMediaItem.index, error: MSEPlatform.Playback.makePlaybackError(error, "prerollMediaItem_convertMediaItemToMediaInstance error"), mediaItem: this._prerollMediaItem
                                    }).then(function(errorMediaInstance) {
                                        this.nextMedia = errorMediaInstance;
                                        onSetComplete()
                                    }.bind(this));
                            else
                                MSEPlatform.Playback.Etw.traceString("onConvertMediaItemToMediaInstanceError: prerollMediaItem canceled")
                        }.bind(this))
                }, _isPlayerSet: function _isPlayerSet() {
                    if (!this._player)
                        MSEPlatform.Playback.Etw.traceString("PlaybackController::isPlayerSet: No, player is not set yet!");
                    return (this._player ? true : false)
                }, _isPlayerState: function _isPlayerState(state) {
                    return (this.playerState === state)
                }, _requestNetwork: function _requestNetwork() {
                    return WinJS.Promise.timeout(0)
                }, _releaseNetwork: function _releaseNetwork() {
                    MSEPlatform.Playback.Etw.traceString("PlaybackController::releaseNetwork");
                    if (this._networkUpRequest) {
                        var releaseMeLater = this._networkUpRequest;
                        this._networkUpRequest = null;
                        WinJS.Promise.timeout(5000).then(function() {
                            releaseMeLater.release()
                        })
                    }
                }, _setMedia: function _setMedia(mediaInstance) {
                    if (mediaInstance && mediaInstance._mediaItem && mediaInstance._mediaItem.data) {
                        var itemData = mediaInstance._mediaItem.data;
                        MSEPlatform.Playback.Etw.traceString("PlaybackController::_setMedia: mediaInstance = { name: " + itemData.name + ", libraryId: " + itemData.libraryId + ", serviceId: " + itemData.serviceId + " }")
                    }
                    else
                        MSEPlatform.Playback.Etw.traceString("PlaybackController::_setMedia: mediaInstance._mediaItem.data= undefined");
                    this._clearReportedErrors();
                    if (this._player)
                        this._player.controlIsProcessingNextMedia = false;
                    if (!mediaInstance) {
                        MS.Entertainment.Utilities.Telemetry.logSkipHappened(this, this.forceTimeUpdate());
                        if (this._canResetOnNullMediaInstance)
                            this.reset(true);
                        else
                            this._canResetOnNullMediaInstance = true;
                        return
                    }
                    if (!this._isPlayerSet())
                        return;
                    if (mediaInstance.isEqual(this._internalCurrentMedia))
                        return;
                    MS.Entertainment.Utilities.Telemetry.logPlaybackAttempted(mediaInstance);
                    this.endOfPlaylist = false;
                    if (this._player && ((this.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.playing) || (this.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.paused)))
                        MS.Entertainment.Utilities.Telemetry.logSkipHappened(this, this.forceTimeUpdate());
                    this.isPreview = mediaInstance.isPreview;
                    if (mediaInstance.videoAdSupported)
                        this.autoPlay = false;
                    this._handleMediaInstance(mediaInstance)
                }, _handleMediaInstance: function _handleMediaInstance(mediaInstance) {
                    this._nextMediaInstanceAfterAd = null;
                    this.isAudioAd = false;
                    this._setPlayerMedia(mediaInstance)
                }, _clearReportedErrors: function _clearReportedErrors() {
                    MSEPlatform.Playback.Etw.traceString("PlaybackController::_setPlayerMedia: clear all reported errors");
                    var playbackEventNotifications = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.playbackEventNotifications);
                    playbackEventNotifications.clearErrors();
                    this._erroredMediaInstances = [];
                    this._lastErrorEncountered = null;
                    this._hasSameErrors = true;
                    this._hasPlayedSong = false;
                    this._errorCount = 0
                }, _setPlayerMedia: function _setPlayerMedia(mediaInstance) {
                    MSEPlatform.Playback.Etw.traceSetMedia(mediaInstance);
                    this.reset(true);
                    if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.contentRestrictionService)) {
                        var errorCode = this._isParentallyBlocked(mediaInstance);
                        if (errorCode) {
                            var mediaItem = (mediaInstance._mediaItem ? mediaInstance._mediaItem.data : null);
                            MSEPlatform.Playback.firePlaybackError(this._onPlayerEvent.bind(this), errorCode, "_setMedia_isParentallyBlocked", mediaItem);
                            return
                        }
                    }
                    if (mediaInstance && mediaInstance._errorDescriptor) {
                        var mediaItem = (mediaInstance._mediaItem ? mediaInstance._mediaItem.data : null);
                        MSEPlatform.Playback.firePlaybackError(this._onPlayerEvent.bind(this), mediaInstance._errorDescriptor, "_setMedia_preexistingCondition", mediaItem);
                        return
                    }
                    if (this.autoPlay)
                        this.currentTransportState = MSEPlatform.Playback.TransportState.starting;
                    this._canResetOnNullMediaInstance = !MS.Entertainment.Platform.Playback.XPlayer.audioTagForFileActivation;
                    this._player.currentMedia = mediaInstance
                }, _setNextMedia: function _setNextMedia(mediaInstance) {
                    if (!this._isPlayerSet())
                        return;
                    var name = (mediaInstance && mediaInstance._mediaItem && mediaInstance._mediaItem.data) ? mediaInstance._mediaItem.data.name : String.empty;
                    MSEPlatform.Playback.Etw.traceString("PlaybackController::_setNextMedia: name= " + name);
                    if (!mediaInstance) {
                        this._player.nextMedia = null;
                        this._player.controlIsProcessingNextMedia = false;
                        this.endOfPlaylist = true;
                        if ((this.autoPlay && !this.activating && (this.currentTransportState !== MSEPlatform.Playback.TransportState.playing && this.currentTransportState !== MSEPlatform.Playback.TransportState.starting)) || (this.currentTransportState === MSEPlatform.Playback.TransportState.starting && this.error))
                            this._handleErrorsOnEndOfPlaylist();
                        return
                    }
                    MS.Entertainment.Utilities.Telemetry.logPlaybackAttempted(mediaInstance);
                    MSEPlatform.Playback.Etw.traceSetNextMedia(this.readyForNextMedia, mediaInstance);
                    if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.contentRestrictionService)) {
                        var errorCode = this._isParentallyBlocked(mediaInstance);
                        if (errorCode) {
                            mediaInstance._errorDescriptor = {msExtendedCode: errorCode.code};
                            this._player.controlIsProcessingNextMedia = false;
                            this._handleNextMediaError(true, null, mediaInstance);
                            return
                        }
                    }
                    if (mediaInstance && mediaInstance._errorDescriptor) {
                        this._player.controlIsProcessingNextMedia = false;
                        this._handleNextMediaError(true, null, mediaInstance);
                        return
                    }
                    this._player.nextMedia = mediaInstance;
                    this._player.controlIsProcessingNextMedia = false
                }, _isParentallyBlocked: function _isParentallyBlocked(mediaInstance) {
                    var errorCode = null;
                    if (mediaInstance._mediaItem) {
                        var mediaItem = mediaInstance._mediaItem.data;
                        if (mediaItem)
                            if (mediaItem.isExplicit && !mediaItem.inCollection) {
                                var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                                if (!signedInUser.xuid)
                                    errorCode = MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_LOGON_TO_PLAY_EXPLICIT_CONTENT;
                                else if (!signedInUser.hasExplicitPrivilege)
                                    errorCode = MS.Entertainment.Platform.Playback.makeParentallyBlockedError()
                            }
                    }
                    return errorCode
                }, _onPlayerEvent: function _onPlayerEvent(event) {
                    switch (event.type)
                    {
                        case"loadedmetadata":
                            MSEPlatform.Playback.Etw.traceString("PlaybackController::onPlayerEvent, loadedmetadata");
                            this.errorDescriptor = null;
                            if (event.srcElement.durationOverrideMS)
                                this.duration = event.srcElement.durationOverrideMS;
                            else if (isFinite(event.srcElement.duration))
                                this.duration = Math.round(event.srcElement.duration * 1000);
                            if (!this._player) {
                                MSEPlatform.Playback.Etw.traceString("PlaybackController::onPlayerEvent, loadedmetadata - player is null");
                                MS.Entertainment.Utilities.fail("loadedmetadata - player is null")
                            }
                            if (!this._player._currentMedia) {
                                MSEPlatform.Playback.Etw.traceString("PlaybackController::onPlayerEvent, loadedmetadata - currentMedia is null");
                                MS.Entertainment.Utilities.fail("loadedmetadata - currentMedia is null")
                            }
                            MSEPlatform.Playback.Etw.traceMediaLoaded(false, this._player._currentMedia, this.duration);
                            if (this._player._currentMedia)
                                this._player._currentMedia.alternateSource = null;
                            this._observableNoLossAssign("playerState", MS.Entertainment.Platform.Playback.PlayerState.ready);
                            if (this._player && this._player._currentMedia && !this._player._currentMedia.isAudioAd) {
                                if (!this.hasPrerolledMedia()) {
                                    MSEPlatform.Playback.Etw.traceString("PlaybackController::onPlayerEvent, loadedmetadata - raising readyForNextMedia");
                                    this.readyForNextMedia = true
                                }
                            }
                            else if (this._nextMediaInstanceAfterAd)
                                this._setNextMedia(this._nextMediaInstanceAfterAd);
                            this.videoWidth = event.srcElement.videoWidth;
                            this.videoHeight = event.srcElement.videoHeight;
                            if (this._targetPosition === 0 && this._player && this._player._currentMedia && this._player._currentMedia.startPosition > 0 && !this.isRemoteSession())
                                this._targetPosition = this._player._currentMedia.startPosition;
                            if (this._targetTransportState !== MSEPlatform.Playback.TransportState.unInitialize && this._targetTransportState !== this.currentTransportState)
                                this._applyTargetTransportState(this._targetTransportState);
                            MSEPlatform.Playback.Etw.traceString("PlaybackController::onPlayerEvent, loadedmetadata, autoplay=" + this.autoPlay);
                            if (this.autoPlay && this._player) {
                                MSEPlatform.Playback.Etw.traceString("PlaybackController::onPlayerEvent, loadedmetadata: calling xplayer.play(), autoplay=true");
                                this._player.play()
                            }
                            break;
                        case"timeupdate":
                            if (event.srcElement && event.srcElement.currentTime)
                                this.currentPosition = Math.round(event.srcElement.currentTime * 1000);
                            break;
                        case"durationchange":
                            if (event.srcElement.durationOverrideMS)
                                this.duration = event.srcElement.durationOverrideMS;
                            else if (event.srcElement && event.srcElement.duration && isFinite(event.srcElement.duration))
                                this.duration = Math.round(event.srcElement.duration * 1000);
                            break;
                        case"ratechange":
                            this.playbackRate = event.srcElement.playbackRate;
                            break;
                        case"playing":
                            MSEPlatform.Playback.Etw.traceString("PlaybackController::onPlayerEvent: Playing");
                            if (MS.Entertainment.Utilities.isVideoApp && this.currentPosition < 1000 && this._targetPosition < 1000) {
                                this.seekToPosition((this._targetPosition > this.currentPosition) ? this._targetPosition : (this.currentPosition + 50));
                                this._targetPosition = 0
                            }
                            else if (this._targetPosition > 0) {
                                this.seekToPosition(this._targetPosition);
                                this._targetPosition = 0
                            }
                            this._targetTransportState = MSEPlatform.Playback.TransportState.playing;
                            this.currentTransportState = MSEPlatform.Playback.TransportState.playing;
                            if (this._player && this._player.currentMedia && this._player.currentMedia.protectionState && (this._player.currentMedia.protectionState === MS.Entertainment.Platform.Playback.ProtectionState.drmProtected)) {
                                MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioAppLaunchPlayProtectedContent();
                                MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioPlayProtectedInApp()
                            }
                            else {
                                MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioAppLaunchPlayNonProtectedContent();
                                MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioPlayNonProtectedInApp()
                            }
                            MS.Entertainment.Instrumentation.PerfTrack.disableScenarioAppLaunchPlayProtectedContent();
                            MS.Entertainment.Instrumentation.PerfTrack.disableScenarioPlayProtectedInApp();
                            MS.Entertainment.Instrumentation.PerfTrack.disableScenarioAppLaunchPlayNonProtectedContent();
                            MS.Entertainment.Instrumentation.PerfTrack.disableScenarioPlayNonProtectedInApp();
                            this._hasPlayedSong = true;
                            this._errorCount = 0;
                            MS.Entertainment.Utilities.Telemetry.logPlayHappened(this, this.forceTimeUpdate());
                            break;
                        case"pause":
                            MSEPlatform.Playback.Etw.traceString("PlaybackController::onPlayerEvent: pause");
                            if (this._targetTransportState === MSEPlatform.Playback.TransportState.stopped)
                                this.currentTransportState = MSEPlatform.Playback.TransportState.stopped;
                            else if (this.currentTransportState === MSEPlatform.Playback.TransportState.stopped) {
                                MSEPlatform.Playback.Etw.traceString("PlaybackController::onPlayerEvent: pause - Current transport state is stopped. Ignoring paused request.");
                                return
                            }
                            else {
                                this._targetTransportState = MSEPlatform.Playback.TransportState.paused;
                                this.currentTransportState = MSEPlatform.Playback.TransportState.paused;
                                MS.Entertainment.Utilities.Telemetry.logPauseHappened(this, this.forceTimeUpdate())
                            }
                            break;
                        case"ended":
                            MSEPlatform.Playback.Etw.traceString("PlaybackController::onPlayerEvent: ended");
                            if (event.target.tagName === "VIDEO" && ((this.currentPosition / this.duration) <= 0.25))
                                MSEPlatform.Playback.Etw.traceString("PlaybackController::onPlayerEvent: playback ended at the start of the media. Ignoring ended event");
                            else {
                                if (!this.hasPrerolledMedia() && !this._player.controlIsProcessingNextMedia) {
                                    this.currentTransportState = MSEPlatform.Playback.TransportState.stopped;
                                    this._targetTransportState = MSEPlatform.Playback.TransportState.stopped;
                                    if (this.endOfPlaylist || (this._lastErrorEncountered && this._lastErrorEncountered.isCritical))
                                        this._handleErrorsOnEndOfPlaylist()
                                }
                                MS.Entertainment.Utilities.Telemetry.logEndHappened(this, this.duration);
                                this.currentPosition = 0;
                                this._reportPrerollErrors();
                                if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.playbackErrorDisplayService)) {
                                    var displayService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.playbackErrorDisplayService);
                                    if (displayService)
                                        displayService.showDialogForNonCriticalErrors = false
                                }
                            }
                            break;
                        case"seeked":
                            this._fireSeekedPositionChanged(this.currentPosition);
                            break;
                        case"error":
                            MS.Entertainment.Instrumentation.PerfTrack.disableAllStartupScenarios();
                            MS.Entertainment.Instrumentation.PerfTrack.disableScenarioPlayProtectedInApp();
                            MS.Entertainment.Instrumentation.PerfTrack.disableScenarioPlayNonProtectedInApp();
                            this.activating = false;
                            var currentMediaInstance = this._player ? this._player.currentMedia || this._currentMedia : null;
                            if (currentMediaInstance === null || (this.isRemoteSessionRunning && event.target.error.code === MSEPlatform.Playback.MediaTagError.MEDIA_ERR_SRC_NOT_SUPPORTED.code && event.target.error.msExtendedCode !== MSEPlatform.Playback.Error.E_ENHANCED_STORAGE.code)) {
                                MSEPlatform.Playback.Etw.traceString("PlaybackController::onPlayerEvent: Error to ignore: error: code=" + MSEPlatform.Playback.errorToString(event.target.error.code));
                                break
                            }
                            if (event.target.error.msExtendedCode === MSEPlatform.Playback.Error.MF_E_NO_PMP_HOST.code)
                                break;
                            var name = (currentMediaInstance && currentMediaInstance._mediaItem && currentMediaInstance._mediaItem.data) ? currentMediaInstance._mediaItem.data.name : String.empty;
                            MSEPlatform.Playback.Etw.traceString("PlaybackController::onPlayerEvent: error: " + MSEPlatform.Playback.mediaErrorToString(event.target.error) + ", itemName=" + name);
                            if (event.srcElement)
                                event.srcElement.errorCode = event.target.error.code;
                            if (currentMediaInstance && currentMediaInstance.videoEncoding === Microsoft.Entertainment.Marketplace.VideoEncoding.h264 && event.target.error.msExtendedCode === MSEPlatform.Playback.Error.E_FAIL.code && this._player.retryableError && MS.Entertainment.UI.NetworkStatusService.isOnline()) {
                                currentMediaInstance.startPosition = this.currentPosition + VideoRetrySkipTimeMs;
                                this._setMedia(currentMediaInstance)
                            }
                            else if (currentMediaInstance && MS.Entertainment.UI.NetworkStatusService.isOnline() && event.target.error.msExtendedCode === MSEPlatform.Playback.Error.E_ENHANCED_STORAGE.code) {
                                MSEPlatform.Playback.Etw.traceString("PlaybackController::onPlayerEvent error: Received PlayReady decryptor error. Restarting playback from last known position.");
                                currentMediaInstance.startPosition = this.currentPosition;
                                this._setMedia(currentMediaInstance)
                            }
                            else if (currentMediaInstance && currentMediaInstance.alternateVideoEncoding !== null) {
                                currentMediaInstance.videoEncoding = currentMediaInstance.alternateVideoEncoding;
                                currentMediaInstance.alternateVideoEncoding = null;
                                this._setMedia(currentMediaInstance)
                            }
                            else if (currentMediaInstance && currentMediaInstance.alternateSource) {
                                currentMediaInstance.source = currentMediaInstance.alternateSource;
                                currentMediaInstance.alternateSource = null;
                                this._setMedia(currentMediaInstance)
                            }
                            else if (event.srcElement && event.srcElement.fastStartProperties && event.srcElement.error && event.srcElement.error.msExtendedCode === MSEPlatform.Playback.Error.MF_E_DRM_UNSUPPORTED.code) {
                                currentMediaInstance.disableFastStart = true;
                                this._setMedia(currentMediaInstance)
                            }
                            else {
                                var err = event.target.error;
                                err.context = (err.context ? err.context + "; " : String.empty) + "onPlayerEvent: Error from tag";
                                this._handleCurrentMediaError(err)
                            }
                            break
                    }
                }, _fireSeekedPositionChanged: function _fireSeekedPositionChanged(currentPosition) {
                    this.seekedPosition = currentPosition;
                    this._reschedulePrerollCallback()
                }, _handleErrorsOnEndOfPlaylist: function _handleErrorsOnEndOfPlaylist() {
                    var displayError = null;
                    if (this._lastErrorEncountered) {
                        var displayError = MS.Entertainment.Platform.Playback.Error.NS_E_WMP_MULTIPLE_ERROR_IN_PLAYLIST;
                        if (this._hasSameErrors)
                            displayError = this._lastErrorEncountered;
                        if (!this._hasPlayedSong)
                            displayError.isCritical = true
                    }
                    var playerStateAsyncAssignment = this._observableNoLossAssignAsyncBegin("playerState");
                    this._player._nextMediaStarted = false;
                    this._player._switchPlayerAsync().done(function setErrorStateOnEnd() {
                        if (displayError) {
                            this.errorDescriptor = displayError;
                            playerStateAsyncAssignment.complete(MS.Entertainment.Platform.Playback.PlayerState.error);
                            this._lastErrorEncountered = null
                        }
                        else
                            playerStateAsyncAssignment.cancel()
                    }.bind(this), function dontcare(){})
                }, _handleNextMediaLoaded: function _handleNextMediaLoaded(isLoaded, iPlayback) {
                    if (isLoaded) {
                        iPlayback.readyForNextMedia = false;
                        this._releaseNetwork();
                        MSEPlatform.Playback.Etw.traceMediaLoaded(true, iPlayback._player._nextMedia, iPlayback._player._nextPlayer ? iPlayback._player._nextPlayer.duration * 1000 : 0);
                        if (this._skipButtonPressed || (iPlayback.currentMedia && iPlayback.currentMedia._errorDescriptor)) {
                            this._skipButtonPressed = false;
                            iPlayback.skipToNextPrerolled()
                        }
                    }
                }, _handleNextMediaStarted: function _handleNextMediaStarted(isStarted, iPlayback) {
                    MSEPlatform.Playback.Etw.traceString("PlaybackController::_handleNextMediaStarted: " + isStarted);
                    if (isStarted) {
                        iPlayback._internalCurrentMedia = iPlayback._player._currentMedia;
                        if (!iPlayback._internalCurrentMedia) {
                            MSEPlatform.Playback.Etw.traceString("PlaybackController::_handleNextMediaStarted: currentMedia null");
                            iPlayback.currentMedia = null
                        }
                        if (iPlayback._player._currentMedia && !iPlayback._player._currentMedia.isAudioAd) {
                            iPlayback.currentMedia = iPlayback._player._currentMedia;
                            iPlayback.errorDescriptor = iPlayback._player._currentMedia._errorDescriptor
                        }
                        iPlayback.isAudioAd = iPlayback._player._currentMedia && iPlayback._player._currentMedia.isAudioAd;
                        iPlayback._observableNoLossAssign("playerState", MS.Entertainment.Platform.Playback.PlayerState.ready);
                        if (iPlayback._player._currentPlayer)
                            iPlayback.duration = Math.round(iPlayback._player._currentPlayer.duration * 1000);
                        if (iPlayback.currentTransportState !== MSEPlatform.Playback.TransportState.playing)
                            iPlayback.currentPosition = 0;
                        if (iPlayback.currentMedia) {
                            MSEPlatform.Playback.Etw.traceNextMediaStarted(iPlayback.currentMedia.source);
                            MS.Entertainment.Utilities.Telemetry.logPlaybackHappened(iPlayback.currentMedia)
                        }
                        this._startProcessingNextMedia()
                    }
                }, _startProcessingNextMedia: function _startProcessingNextMedia() {
                    if (this._internalCurrentMedia) {
                        MSEPlatform.Playback.Etw.traceString("PlaybackController::_handleNextMediaStarted - raising readyForNextMedia");
                        this._signalForNextMedia()
                    }
                }, _handleNextMediaError: function _handleNextMediaError(isError, unReferrencedParam, mediaInstance) {
                    if (isError) {
                        var error;
                        if (!mediaInstance)
                            mediaInstance = this._player._nextMedia;
                        if (mediaInstance && mediaInstance.alternateVideoEncoding !== null) {
                            mediaInstance.videoEncoding = mediaInstance.alternateVideoEncoding;
                            mediaInstance.alternateVideoEncoding = null;
                            this._player._setNextMedia(mediaInstance);
                            return
                        }
                        if (mediaInstance) {
                            if (!this._shouldIgnoreThisErrorForBlocking(mediaInstance._errorDescriptor.code))
                                this._addErroredMediaInstance(mediaInstance);
                            error = this.errorDescriptor;
                            MS.Entertainment.Utilities.Telemetry.logPlaybackError(mediaInstance, error, "PlaybackController_handleNextMediaError")
                        }
                        this._player.reset(true);
                        this._reportPrerollErrors();
                        if (!this._isCriticalError(error)) {
                            var that = this;
                            var nowplayingSession = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager).primarySession;
                            if (nowplayingSession.repeat && this._errorCount > 1)
                                nowplayingSession.mediaCollection.getCount().done(function onGetCount(playlistCount) {
                                    if (that._errorCount >= playlistCount) {
                                        that.endOfPlaylist = true;
                                        that._handleErrorsOnEndOfPlaylist()
                                    }
                                    else
                                        that._signalForNextMedia()
                                }, function onGetCountError(error) {
                                    that._signalForNextMedia()
                                });
                            else
                                this._signalForNextMedia()
                        }
                        else if (!this._hasPlayedSong) {
                            this.endOfPlaylist = true;
                            this._handleErrorsOnEndOfPlaylist()
                        }
                    }
                }, _remapPlaybackError: function _remapPlaybackError(error) {
                    return error
                }, _handleCurrentMediaError: function _handleCurrentMediaError(error) {
                    error = this._remapPlaybackError(error);
                    if (this.isRemoteSession() && error && error.code === 3)
                        this.errorDescriptor = {msExtendedCode: MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_PLAYTO_ERR_DECODE.code};
                    else {
                        this.errorDescriptor = error;
                        this.errorDescriptor.mediaItem = (this.currentMedia && this.currentMedia._mediaItem) ? this.currentMedia._mediaItem.data : null
                    }
                    if (this._player && this._player.currentMedia) {
                        error.errorOrdinal = this._player.currentMedia.cookie;
                        this._player.currentMedia._errorDescriptor = error
                    }
                    var errorContext = error.context || "PlaybackController_handleCurrentMediaError";
                    MSEPlatform.Playback.Etw.tracePlaybackError(error.code, error.msExtendedCode, errorContext);
                    this._lastErrorEncountered = error;
                    this._addErroredMediaInstance(this._player && this._player.currentMedia);
                    MS.Entertainment.Utilities.Telemetry.logPlaybackError(this.currentMedia, error, errorContext);
                    if (this._isCriticalError(error))
                        this.errorDescriptor.isCritical = true;
                    else
                        this._observableNoLossAssign("playerState", MS.Entertainment.Platform.Playback.PlayerState.error);
                    if (this.errorDescriptor.isCritical) {
                        MSEPlatform.Playback.AudioPlayer.disposeFastStartTag();
                        this._setNextMedia(null);
                        this._handleErrorsOnEndOfPlaylist()
                    }
                    this._processPlaybackErrorPostMapping(error)
                }, _processPlaybackErrorPostMapping: function _processPlaybackErrorPostMapping(error){}, _signalForNextMedia: function _signalForNextMedia() {
                    this._player.controlIsProcessingNextMedia = true;
                    this.readyForNextMedia = false;
                    MSEPlatform.Playback.Etw.traceString("PlaybackController::signalForNextMedia requested");
                    if (this._signalForNextMediaPromise) {
                        MSEPlatform.Playback.Etw.traceString("PlaybackController::signalForNextMedia: cancel previous");
                        this._signalForNextMediaPromise.cancel()
                    }
                    this._signalForNextMediaPromise = WinJS.Promise.timeout(10);
                    this._signalForNextMediaPromise.then(function() {
                        MSEPlatform.Playback.Etw.traceString("PlaybackController::signalForNextMedia: raising readyForNextMedia");
                        this.readyForNextMedia = true;
                        this._signalForNextMediaPromise = null
                    }.bind(this))
                }, _isCriticalError: function _isCriticalError(error) {
                    if (!error)
                        return false;
                    else if (this._errorCount >= this._maxSequentialErrors)
                        return true;
                    switch (error.msExtendedCode) {
                        case MSEPlatform.Playback.Error.X8_E_PLAYBACK_STOPPED_DATA_LIMIT_APPROACHING.code:
                        case MSEPlatform.Playback.Error.E_MDS_ROAMING_LIMIT.code:
                        case MSEPlatform.Playback.Error.ERROR_GRAPHICS_ONLY_CONSOLE_SESSION_SUPPORTED.code:
                        case MSEPlatform.Playback.Error.MF_E_AUDIO_PLAYBACK_DEVICE_INVALIDATED.code:
                        case MSEPlatform.Playback.Error.MF_E_CANNOT_CREATE_SINK.code:
                        case MSEPlatform.Playback.Error.MF_E_DEBUGGING_NOT_ALLOWED.code:
                        case MSEPlatform.Playback.Error.MF_E_HIGH_SECURITY_LEVEL_CONTENT_NOT_ALLOWED.code:
                        case MSEPlatform.Playback.Error.ZEST_E_MW_CONCURRENT_STREAM.code:
                        case MSEPlatform.Playback.Error.ZEST_E_MEDIAINSTANCE_STREAMING_OCCUPIED.code:
                        case MSEPlatform.Playback.Error.ZEST_E_MULTITUNER_CONCURRENTSTREAMING_DETECTED.code:
                        case MSEPlatform.Playback.Error.NS_E_COMPRESSED_DIGITAL_AUDIO_PROTECTION_LEVEL_UNSUPPORTED.code:
                        case MSEPlatform.Playback.Error.NS_E_UNCOMPRESSED_DIGITAL_AUDIO_PROTECTION_LEVEL_UNSUPPORTED.code:
                        case MSEPlatform.Playback.Error.NS_E_DRM_DRIVER_AUTH_FAILURE.code:
                        case MSEPlatform.Playback.Error.NS_E_DRM_NEEDS_INDIVIDUALIZATION.code:
                        case MSEPlatform.Playback.Error.NS_E_DRM_UNABLE_TO_INITIALIZE.code:
                        case MSEPlatform.Playback.Error.NS_E_WMP_AUDIO_HW_PROBLEM.code:
                        case MSEPlatform.Playback.Error.NS_E_WMP_BAD_DRIVER.code:
                        case MSEPlatform.Playback.Error.E_MDS_UNAUTHENTICATED_TRACK_LIMIT.code:
                            return true;
                        default:
                            return false
                    }
                }, _fireCriticalPlaybackError: function _fireCriticalPlaybackError(error) {
                    var mediaItem = (this.currentMedia && this.currentMedia._mediaItem ? this.currentMedia._mediaItem.data : null);
                    error.isCritical = true;
                    MSEPlatform.Playback.firePlaybackError(this._onPlayerEvent.bind(this), error, "PlaybackController_fireCriticalError", mediaItem);
                    this._errorCount = 0
                }, _shouldIgnoreThisErrorForBlocking: function _shouldIgnoreThisErrorForBlocking(error) {
                    return ((error === MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_ERR_NOT_LOCAL.code) || (error === MS.Entertainment.Platform.Playback.Error.MF_E_NO_PMP_HOST))
                }, _addErroredMediaInstance: function _addErroredMediaInstance(mediaInstance) {
                    if (!mediaInstance)
                        return;
                    var error = null;
                    var errorCode = null;
                    if (mediaInstance._errorDescriptor) {
                        error = MS.Entertainment.Platform.Playback.makePlaybackError(mediaInstance._errorDescriptor);
                        errorCode = error.msExtendedCode;
                        error.errorOrdinal = mediaInstance.cookie
                    }
                    if (this._hasSameErrors && errorCode && this._lastErrorEncountered && this._lastErrorEncountered.msExtendedCode !== errorCode)
                        this._hasSameErrors = false;
                    this._lastErrorEncountered = error;
                    this._erroredMediaInstances.push(mediaInstance);
                    this._errorCount++;
                    if (this._isCriticalError(error)) {
                        error.isCritical = true;
                        this.errorDescriptor = error
                    }
                }, _reportPrerollErrors: function _reportPrerollErrors() {
                    var playbackEventNotifications = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.playbackEventNotifications);
                    while (this._erroredMediaInstances.length > 0) {
                        var mediaInstance = this._erroredMediaInstances.pop();
                        var mediaItem = null;
                        var errorCode = null;
                        if (mediaInstance) {
                            if (mediaInstance._mediaItem) {
                                mediaItem = mediaInstance._mediaItem.data;
                                if (mediaItem && mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.video && mediaInstance._mediaItem.trackItem)
                                    mediaItem = mediaInstance._mediaItem.trackItem.data
                            }
                            if (mediaInstance._errorDescriptor) {
                                var error = MS.Entertainment.Platform.Playback.makePlaybackError(mediaInstance._errorDescriptor);
                                errorCode = error.msExtendedCode
                            }
                        }
                        playbackEventNotifications.setError(MS.Entertainment.Platform.Playback.PlaybackEventNotifications.getEventingMediaId(mediaItem), errorCode)
                    }
                }, _handleNetworkConnectionChanged: function _handleNetworkConnectionChanged(networkConnection) {
                    switch (networkConnection) {
                        case MS.Entertainment.Platform.NetworkConnection.approachingDataLimit:
                            MSEPlatform.Playback.Etw.traceString("PlaybackController::_handleNetworkConnectionChanged: approachingDataLimit");
                            this._pauseStreamingAndFireError(MSEPlatform.Playback.Error.X8_E_PLAYBACK_STOPPED_DATA_LIMIT_APPROACHING);
                            break;
                        case MS.Entertainment.Platform.NetworkConnection.overDataLimit:
                        case MS.Entertainment.Platform.NetworkConnection.switchedToMetered:
                            MSEPlatform.Playback.Etw.traceString("PlaybackController::_handleNetworkConnectionChanged: overDataLimit");
                            break
                    }
                }, _pauseStreamingAndFireError: function _pauseStreamingAndFireError(error) {
                    MSEPlatform.Playback.Etw.traceString("PlaybackController::_pauseStreamingAndFireError");
                    if (!this._isPlayerSet() || this.currentTransportState === MSEPlatform.Playback.TransportState.unInitialize || this.currentTransportState === MSEPlatform.Playback.TransportState.stopped || this.currentTransportState === MSEPlatform.Playback.TransportState.paused)
                        return;
                    if (!this.currentMedia || this.currentMedia.isLocal)
                        return;
                    this._player.pause();
                    this._targetTransportState = MSEPlatform.Playback.TransportState.paused;
                    this._fireCriticalPlaybackError(error)
                }, _applyTargetTransportState: function _applyTargetTransportState(value) {
                    this._targetTransportState = value;
                    try {
                        switch (value)
                        {
                            case MSEPlatform.Playback.TransportState.stopped:
                                if (this.currentTransportState === MSEPlatform.Playback.TransportState.paused)
                                    this.currentTransportState = MSEPlatform.Playback.TransportState.stopped;
                                else if (this.currentTransportState !== MSEPlatform.Playback.TransportState.stopped)
                                    this._player.stop();
                                break;
                            case MSEPlatform.Playback.TransportState.paused:
                                this._player.pause();
                                if (!this._currentMedia || !this._currentMedia.videoAdSupported)
                                    this.autoPlay = false;
                                break;
                            case MSEPlatform.Playback.TransportState.playing:
                                if (this.currentTransportState !== MSEPlatform.Playback.TransportState.paused)
                                    this.currentTransportState = MSEPlatform.Playback.TransportState.starting;
                                this._player.play();
                                this.activating = false;
                                if (!this._currentMedia || !this._currentMedia.videoAdSupported)
                                    this.autoPlay = true;
                                break;
                            default:
                                throw"PlaybackController_applyTargetTransportState: Error! Unsupported state - " + value;
                        }
                    }
                    catch(exception) {
                        if (this._player._currentPlayer === null)
                            this.currentTransportState = MSEPlatform.Playback.TransportState.stopped;
                        else
                            throw exception;
                    }
                }, currentMedia: MS.Entertainment.UI.Framework.observableProperty("currentMedia", null), currentPosition: MS.Entertainment.UI.Framework.observableProperty("currentPosition", 0), currentTransportState: MS.Entertainment.UI.Framework.observableProperty("currentTransportState", MS.Entertainment.Platform.Playback.TransportState.stopped), isAudioAd: MS.Entertainment.UI.Framework.observableProperty("isAudioAd", false), isPreview: MS.Entertainment.UI.Framework.observableProperty("isPreview", false), duration: MS.Entertainment.UI.Framework.observableProperty("duration", 0), errorDescriptor: MS.Entertainment.UI.Framework.observableProperty("errorDescriptor", null), nextMedia: MS.Entertainment.UI.Framework.observableProperty("nextMedia", null), playerState: MS.Entertainment.UI.Framework.observableProperty("playerState", MS.Entertainment.Platform.Playback.PlayerState.notReady), readyForNextMedia: MS.Entertainment.UI.Framework.observableProperty("readyForNextMedia", false), videoWidth: MS.Entertainment.UI.Framework.observableProperty("videoWidth", 0), videoHeight: MS.Entertainment.UI.Framework.observableProperty("videoHeight", 0), playbackRate: MS.Entertainment.UI.Framework.observableProperty("playbackRate", 1), minPlaybackRate: MS.Entertainment.UI.Framework.observableProperty("minPlaybackRate", -128), maxPlaybackRate: MS.Entertainment.UI.Framework.observableProperty("maxPlaybackRate", 128), _isVideo: MS.Entertainment.UI.Framework.observableProperty("_isVideo", false), seekedPosition: MS.Entertainment.UI.Framework.observableProperty("seekedPosition", 0), isRemoteSessionRunning: MS.Entertainment.UI.Framework.observableProperty("isRemoteSessionRunning", false), playToSenderConnectionState: MS.Entertainment.UI.Framework.observableProperty("playToSenderConnectionState", Windows.Media.PlayTo.PlayToConnectionState.disconnected), mediaElement: MS.Entertainment.UI.Framework.observableProperty("mediaElement", false), error: MS.Entertainment.UI.Framework.observableProperty("error", null), currentRequestedBitrate: MS.Entertainment.UI.Framework.observableProperty("currentRequestedBitrate", null), _configManager: null, _offlineNetworkRequestDelay: 100, _internalCurrentMedia: null, _player: null, _targetTransportState: MSEPlatform.Playback.TransportState.unInitialize, _targetPosition: 0, _sessionMgr: null, _erroredMediaInstances: [], _signalForNextMediaPromise: null, _nextMediaInstanceAfterAd: null, _skipButtonPressed: false, _prerollPromise: null, _prerollPromiseOrdinal: 0, _lastErrorEncountered: null, _hasSameErrors: true, _hasPlayedSong: false, _errorCount: 0, _maxSequentialErrors: 25, _canResetOnNullMediaInstance: true
        }, {createInstance: function createInstance() {
                if (MS.Entertainment.Utilities.isMusicApp1)
                    return new MS.Entertainment.Platform.Playback.PlaybackControllerMusic1;
                else if (MS.Entertainment.Utilities.isMusicApp2)
                    return new MS.Entertainment.Platform.Playback.PlaybackControllerMusic;
                else if (MS.Entertainment.Utilities.isVideoApp)
                    return new MS.Entertainment.Platform.Playback.PlaybackControllerVideo;
                else if (MS.Entertainment.Utilities.isTestApp || MS.Entertainment.Utilities.isAmsterdamApp)
                    return new MS.Entertainment.Platform.Playback.PlaybackController;
                else
                    MS.Entertainment.Utilities.fail("PlaybackController.createInstance() Wrong app mode")
            }})})
})()
})();
/* >>>>>>/components/playback/closedcaptions/presenter.js:3107 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

(function() {
    "use strict";
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    WinJS.Namespace.defineWithParent(MS.Entertainment.Platform.Playback, "ClosedCaptions", {PresenterObservables: MS.Entertainment.defineObservable(function PresenterObservables_ctor(){}, {})});
    WinJS.Namespace.defineWithParent(MS.Entertainment.Platform.Playback, "ClosedCaptions", {Presenter: MS.Entertainment.UI.Framework.derive("MS.Entertainment.Platform.Playback.ClosedCaptions.PresenterObservables", function Presenter_ctor(renderer, rendererContainer) {
            if (!renderer || !rendererContainer)
                throw"Need to pass in a Renderer!";
            MSEPlatform.Playback.ClosedCaptions.PresenterObservables.prototype.constructor.call(this);
            this._ccRenderer = renderer;
            this._iPlaybackControl = renderer._iPlaybackControl;
            this._ccContainer = rendererContainer
        }, {
            flush: function Presenter_flush() {
                this._presenterQueue = [];
                this._ccContainer.innerHTML = ""
            }, start: function Presenter_start() {
                    if (!this._ccContainer)
                        return;
                    if (this._animationFrameHandle)
                        window.cancelAnimationFrame(this._animationFrameHandle);
                    this._animationFrameHandle = window.requestAnimationFrame(this._presenterLoop.bind(this))
                }, stop: function Presenter_stop() {
                    if (this._animationFrameHandle) {
                        window.cancelAnimationFrame(this._animationFrameHandle);
                        this._animationFrameHandle = 0
                    }
                }, presentAt: function Presenter_present(dataGeneratedAt, dataValidUntil, htmlBlob) {
                    if (this._presenterQueue.length >= this._maxPresenterQueueSize) {
                        var droppedFrame = this._presenterQueue.shift();
                        MSEPlatform.Playback.Etw.traceCCDroppedFrame(droppedFrame.dataGeneratedAt, droppedFrame.dataValidUntil, this._currentPosition)
                    }
                    this._presenterQueue.push({
                        dataGeneratedAt: dataGeneratedAt, dataValidUntil: dataValidUntil, htmlBlob: htmlBlob
                    })
                }, _ccRenderer: null, _iPlaybackControl: null, _ccContainer: null, _presenterQueue: [], _maxPresenterQueueSize: 100, _animationFrameHandle: 0, _currentPosition: 0, _lateToleranceMsec: 100, _scheduleAnimationCallback: function Presenter_scheduleAnimationCallback() {
                    this._animationFrameHandle = window.requestAnimationFrame(this._presenterLoop.bind(this))
                }, _presenterLoop: function Presenter_presenterLoop() {
                    if (this._presenterQueue.length === 0) {
                        this._scheduleAnimationCallback();
                        return
                    }
                    var frameToBePresented = null;
                    this._currentPosition = this._iPlaybackControl.currentPosition;
                    do {
                        frameToBePresented = this._presenterQueue[0];
                        if (this._currentPosition < frameToBePresented.dataGeneratedAt) {
                            frameToBePresented = null;
                            break
                        }
                        if (this._currentPosition > frameToBePresented.dataValidUntil + this._lateToleranceMsec) {
                            frameToBePresented = null;
                            var droppedFrame = this._presenterQueue.shift();
                            MSEPlatform.Playback.Etw.traceCCDroppedFrame(droppedFrame.dataGeneratedAt, droppedFrame.dataValidUntil, this._currentPosition)
                        }
                        else {
                            frameToBePresented = this._presenterQueue.shift();
                            break
                        }
                    } while (this._presenterQueue.length > 0);
                    if (frameToBePresented)
                        try {
                            this._ccContainer.style.display = "none";
                            this._ccContainer.innerHTML = frameToBePresented.htmlBlob;
                            MS.Entertainment.Platform.Playback.ClosedCaptions.getUserSettings().applySettings(this._ccContainer);
                            this._ccContainer.style.display = ""
                        }
                        catch(ex) {
                            var msg = "CC Error: Malformed HTML ignored @(" + frameToBePresented.dataGeneratedAt + ") : " + frameToBePresented.htmlBlob;
                            MSEPlatform.Playback.Etw.traceString(msg);
                            var mediaId,
                                source;
                            try {
                                mediaId = this._iPlaybackControl.currentMedia.mediaInstanceId
                            }
                            catch(ex) {
                                {}
                            }
                            try {
                                source = this._iPlaybackControl.currentMedia.source
                            }
                            catch(ex) {
                                {}
                            }
                            if (!source)
                                source = "unknownSource";
                            if (!mediaId)
                                mediaId = "unknownMediaId";
                            MS.Entertainment.Platform.Playback.assert(false, msg, this._iPlaybackControl.currentMedia.serviceIdSafe + "/" + mediaId + " " + source)
                        }
                    this._scheduleAnimationCallback()
                }
        }, {})})
})()
})();
/* >>>>>>/components/playback/closedcaptions/renderer.js:3205 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

(function() {
    "use strict";
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    WinJS.Namespace.defineWithParent(MS.Entertainment.Platform.Playback, "ClosedCaptions", {
        RendererObservables: MS.Entertainment.defineObservable(function RendererObservables_ctor(){}, {ccLcid: 0}), getUserSettings: (function() {
                function app2SettingsSignature() {
                    var signature = "";
                    for (var p in MS.Entertainment.Platform.ClosedCaptions.ClosedCaptionProperties)
                        if (typeof p !== "function")
                            try {
                                signature += p + ": " + JSON.stringify(MS.Entertainment.Platform.ClosedCaptions.ClosedCaptionProperties[p])
                            }
                            catch(ex) {
                                signature += p
                            }
                    return signature
                }
                {};
                var edgeToShadowConverter = {
                        1: "none", 2: "-1px 0px 0px silver, 0px -1px 0px silver, 1px 1px 0px black, 2px 2px 0px black, 3px 3px 0px black", 3: "1px 1px 0px silver, 0px 1px 0px silver, -1px -1px 0px black, -1px 0px 0px black", 4: "0px 0px 4px black, 0px 0px 4px black, 0px 0px 4px black, 0px 0px 4px black", 5: "3px 3px 3px 2px black"
                    };
                function textEdgeShadow(edgeEnum) {
                    return edgeToShadowConverter[+edgeEnum]
                }
                function BaseUserSettingsPlatform() {
                    this.needToModifyDOMToApplySetttings = false;
                    this.loadAndUpdateClosedCaptionStyleSettings = function base_loadAndUpdateClosedCaptionStyleSettings() {
                        var ccSettings = this.loadClosedCaptionStyleSettings();
                        if (ccSettings)
                            this.updateClosedCaptionStyleSettings(ccSettings)
                    };
                    this.loadClosedCaptionStyleSettings = function base_loadClosedCaptionStyleSettings() {
                        var settingsStorage = Windows.Storage.ApplicationData.current.roamingSettings;
                        if (settingsStorage)
                            return {
                                    regionBackgroundColor: settingsStorage.values["CC_REGION_background-color"], regionOpacity: settingsStorage.values["CC_REGION_opacity"], textFontFamily: settingsStorage.values["CC_TEXT_font-family"], textFontSize: settingsStorage.values["CC_TEXT_font-size"], textEdgeAttributeEnum: settingsStorage.values["CC_TEXT_edge-attribute"], textColor: settingsStorage.values["CC_TEXT_color"], textOpacity: settingsStorage.values["CC_TEXT_opacity"], textBackgroundColor: settingsStorage.values["CC_TEXT_background-color"], textBackgroundOpacity: settingsStorage.values["CC_TEXT_background-opacity"]
                                };
                        else
                            return null
                    };
                    this.saveClosedCaptionStyleSettings = function base_saveClosedCaptionStyleSettings(ccSettings) {
                        if (!ccSettings)
                            return;
                        var settingsStorage = Windows.Storage.ApplicationData.current.roamingSettings;
                        if (ccSettings.hasOwnProperty("regionBackgroundColor"))
                            settingsStorage.values["CC_REGION_background-color"] = ccSettings["regionBackgroundColor"];
                        if (ccSettings.hasOwnProperty("regionOpacity"))
                            settingsStorage.values["CC_REGION_opacity"] = ccSettings["regionOpacity"];
                        if (ccSettings.hasOwnProperty("textFontFamily"))
                            settingsStorage.values["CC_TEXT_font-family"] = ccSettings["textFontFamily"];
                        if (ccSettings.hasOwnProperty("textFontSize"))
                            settingsStorage.values["CC_TEXT_font-size"] = ccSettings["textFontSize"];
                        if (ccSettings.hasOwnProperty("textEdgeAttributeEnum"))
                            settingsStorage.values["CC_TEXT_edge-attribute"] = ccSettings["textEdgeAttributeEnum"];
                        if (ccSettings.hasOwnProperty("textColor"))
                            settingsStorage.values["CC_TEXT_color"] = ccSettings["textColor"];
                        if (ccSettings.hasOwnProperty("textOpacity"))
                            settingsStorage.values["CC_TEXT_opacity"] = ccSettings["textOpacity"];
                        if (ccSettings.hasOwnProperty("textBackgroundColor"))
                            settingsStorage.values["CC_TEXT_background-color"] = ccSettings["textBackgroundColor"];
                        if (ccSettings.hasOwnProperty("textBackgroundOpacity"))
                            settingsStorage.values["CC_TEXT_background-opacity"] = ccSettings["textBackgroundOpacity"]
                    };
                    this.updateClosedCaptionStyleSettings = function base_updateClosedCaptionStyleSettings(ccSettings) {
                        var paragraphStyle = ".cc_layout P";
                        var spanStyle = ".cc_layout SPAN";
                        function rgbaFromSplitColor(settings, attr, opacity) {
                            var calculatedOpacity = opacity ? settings[opacity] : settings[attr + "Opacity"];
                            if (calculatedOpacity === String.empty)
                                return "rgb(" + settings[attr + "Color"] + ")";
                            return "rgba(" + settings[attr + "Color"] + "," + calculatedOpacity + ")"
                        }
                        var ccOverrideProcessor = {
                                regionOpacity: function(ctxt, ccSettings) {
                                    if (ccSettings["regionOpacity"]) {
                                        ctxt.rule(paragraphStyle).add("background-color", rgbaFromSplitColor(ccSettings, "regionBackground", "regionOpacity"));
                                        ctxt.rule(paragraphStyle).add("outline", rgbaFromSplitColor(ccSettings, "regionBackground", "regionOpacity") + " 15px solid")
                                    }
                                }, regionBackgroundColor: function(){}, textFontFamily: function(ctxt, ccSettings) {
                                        var textFontFamily = ccSettings["textFontFamily"];
                                        if (!textFontFamily)
                                            return;
                                        ctxt.rule(paragraphStyle).add("font-family", textFontFamily);
                                        ctxt.rule(spanStyle).add("font-family", textFontFamily);
                                        if (this.isFontUsedForSmallCaps(textFontFamily)) {
                                            ctxt.rule(paragraphStyle).add("font-variant", "small-caps");
                                            ctxt.rule(spanStyle).add("font-variant", "small-caps")
                                        }
                                    }, textFontSize: function(ctxt, ccSettings) {
                                        ctxt.rule(paragraphStyle).add("font-size", ccSettings["textFontSize"])
                                    }, textEdgeAttribute: function(ctxt, ccSettings) {
                                        ctxt.rule(paragraphStyle).add("text-shadow", ccSettings["textEdgeAttribute"])
                                    }, textEdgeAttributeEnum: function(ctxt, ccSettings) {
                                        ctxt.rule(paragraphStyle).add("text-shadow", textEdgeShadow(ccSettings["textEdgeAttributeEnum"]))
                                    }, textOpacity: function(){}, textColor: function(ctxt, ccSettings) {
                                        ctxt.rule(paragraphStyle).add("color", rgbaFromSplitColor(ccSettings, "text"));
                                        ctxt.rule(spanStyle).add("color", rgbaFromSplitColor(ccSettings, "text"))
                                    }, textBackgroundColor: function(){}, textBackgroundOpacity: function(ctxt, ccSettings) {
                                        this.needToModifyDOMToApplySetttings = (ccSettings["textBackgroundOpacity"] === String.empty) || (ccSettings["textBackgroundOpacity"] > 0);
                                        ctxt.rule(spanStyle).add("background-color", rgbaFromSplitColor(ccSettings, "textBackground"))
                                    }
                            };
                        function CSSRule() {
                            var attributes = {};
                            this.add = function(attribute, value, overridableByInline) {
                                if (value !== null && value !== undefined)
                                    attributes[attribute] = {
                                        value: value, overridableByInline: !!overridableByInline
                                    }
                            };
                            this.toString = function() {
                                var firstAttribute = true;
                                var cssText = "";
                                for (var attribute in attributes) {
                                    if (firstAttribute)
                                        firstAttribute = false;
                                    else
                                        cssText += "; ";
                                    cssText += attribute + ": ";
                                    cssText += attributes[attribute].value;
                                    if (!attributes[attribute].overridableByInline)
                                        cssText += " !important"
                                }
                                return "{" + cssText + "}"
                            }
                        }
                        {};
                        function CSSContext() {
                            var selectors = {};
                            this.rule = function rule(cssSelector) {
                                if (!selectors[cssSelector])
                                    selectors[cssSelector] = new CSSRule;
                                return selectors[cssSelector]
                            };
                            this.applyStyle = function() {
                                function getEmptyStyleElement() {
                                    var id = "CCStyleSheet";
                                    var ccStyleElement = document.getElementById(id);
                                    if (!ccStyleElement) {
                                        ccStyleElement = document.createElement("STYLE");
                                        document.documentElement.firstChild.appendChild(ccStyleElement);
                                        ccStyleElement.id = id
                                    }
                                    else if (ccStyleElement.sheet && ccStyleElement.sheet.rules) {
                                        var total = ccStyleElement.sheet.rules.length;
                                        for (var i = 0; i < total; i++)
                                            ccStyleElement.sheet.deleteRule(0)
                                    }
                                    return ccStyleElement
                                }
                                var ccStyleElement = getEmptyStyleElement();
                                for (var selector in selectors)
                                    ccStyleElement.sheet.insertRule(selector + selectors[selector], 0)
                            }
                        }
                        {};
                        this.needToModifyDOMToApplySetttings = false;
                        var overrideContext = new CSSContext;
                        for (var customSetting in ccSettings) {
                            MS.Entertainment.Platform.Playback.assert(ccOverrideProcessor[customSetting], "Fix this: Illegal CC custom setting or missing handler - " + customSetting);
                            if (ccOverrideProcessor[customSetting])
                                ccOverrideProcessor[customSetting].bind(this)(overrideContext, ccSettings)
                        }
                        overrideContext.applyStyle()
                    };
                    this.applySettings = function base_applySettings(ccContainer) {
                        if (this.needToModifyDOMToApplySetttings) {
                            var spanCandidates = ccContainer.querySelectorAll("P");
                            for (var i = 0; i < spanCandidates.length; i++) {
                                var pElements = ccContainer.querySelectorAll("P")[i].childNodes;
                                for (var j = 0; j < pElements.length; j++) {
                                    var pChildNode = pElements[j];
                                    if (pChildNode.nodeName === "#text") {
                                        var span = document.createElement('SPAN');
                                        span.className = "cc_text";
                                        pChildNode.parentNode.replaceChild(span, pChildNode);
                                        span.appendChild(pChildNode)
                                    }
                                }
                            }
                        }
                    };
                    this.isFontUsedForSmallCaps = function base_isFontUsedForSmallCaps(fontName) {
                        return fontName === "trebuchet ms"
                    }
                }
                function App2UserSettingsPlatform(){}
                {};
                App2UserSettingsPlatform.prototype = new BaseUserSettingsPlatform;
                App2UserSettingsPlatform.prototype.saveClosedCaptionStyleSettings = function(){};
                var app2CCFontFamilyConverter = {
                        0: String.empty, 1: "courier new", 2: "times new roman", 3: "lucida console", 4: "tahoma", 5: "comic sans ms", 6: "segoe script", 7: "trebuchet ms"
                    };
                App2UserSettingsPlatform.prototype.loadClosedCaptionStyleSettings = function app2_loadClosedCaptionStyleSettings() {
                    var fontSizeEnumConverter = {
                            0: "100%", 1: "50%", 2: "75%", 3: "150%", 4: "200%"
                        };
                    function fontFamily(app2Enum) {
                        return app2CCFontFamilyConverter[app2Enum]
                    }
                    {};
                    function percentagefontSize(enumFontSize) {
                        return fontSizeEnumConverter[enumFontSize]
                    }
                    function rgb(c) {
                        return c.r + "," + c.g + "," + c.b
                    }
                    function opacity(c) {
                        return c.a / 255
                    }
                    function addCCProperty(container, name, value) {
                        if (value === undefined || value === null)
                            return;
                        container[name] = value
                    }
                    var userSettings = MS.Entertainment.Platform.ClosedCaptions.ClosedCaptionProperties;
                    this.currentSignature = app2SettingsSignature();
                    var output = {};
                    if (userSettings.isEnabled && !userSettings.useDefaultOptions) {
                        addCCProperty(output, "regionBackgroundColor", rgb(userSettings.windowColor));
                        addCCProperty(output, "regionOpacity", opacity(userSettings.windowColor));
                        addCCProperty(output, "textFontFamily", fontFamily(userSettings.fontStyle));
                        addCCProperty(output, "textFontSize", percentagefontSize(userSettings.fontSize));
                        addCCProperty(output, "textEdgeAttribute", textEdgeShadow(userSettings.fontEdgeAttribute));
                        addCCProperty(output, "textColor", rgb(userSettings.fontColor));
                        addCCProperty(output, "textOpacity", opacity(userSettings.fontColor));
                        addCCProperty(output, "textBackgroundColor", rgb(userSettings.backgroundColor));
                        addCCProperty(output, "textBackgroundOpacity", opacity(userSettings.backgroundColor))
                    }
                    return output
                };
                var baseApplySettings = App2UserSettingsPlatform.prototype.applySettings;
                App2UserSettingsPlatform.prototype.applySettings = function(ccContainer) {
                    if (this.currentSignature !== app2SettingsSignature())
                        this.loadAndUpdateClosedCaptionStyleSettings();
                    baseApplySettings.bind(this)(ccContainer)
                };
                App2UserSettingsPlatform.prototype.isFontUsedForSmallCaps = function app2_isFontUsedForSmallCaps(fontName) {
                    return fontName === app2CCFontFamilyConverter[MS.Entertainment.Platform.ClosedCaptions.Meta.FontStyle.smallCapitals]
                };
                var ccUserSettingsImplementation = null;
                return function getUserSettingsPlatform() {
                        if (!ccUserSettingsImplementation)
                            try {
                                var testUserSettingsCapability = MS.Entertainment.Platform.ClosedCaptions.ClosedCaptionProperties;
                                ccUserSettingsImplementation = new App2UserSettingsPlatform
                            }
                            catch(ex) {
                                ccUserSettingsImplementation = new BaseUserSettingsPlatform
                            }
                        return ccUserSettingsImplementation
                    }
            })()
    });
    WinJS.Namespace.defineWithParent(MS.Entertainment.Platform.Playback, "ClosedCaptions", {Renderer: MS.Entertainment.UI.Framework.derive("MS.Entertainment.Platform.Playback.ClosedCaptions.RendererObservables", function Renderer_ctor(playbackControl, rendererContainer) {
            if (!playbackControl || !rendererContainer)
                return;
            MSEPlatform.Playback.ClosedCaptions.RendererObservables.prototype.constructor.call(this);
            WinJS.Utilities.addClass(rendererContainer, "hideFromDisplay");
            this._iPlaybackControl = playbackControl;
            this._ccContainer = rendererContainer;
            this._initialize(rendererContainer)
        }, {
            closedCaptionsOn: {
                set: function Renderer_closedCaptionsOn_set(value) {
                    MSEPlatform.Playback.Etw.traceClosedCaptionsOn(value);
                    if (value !== this._closedCaptionsOn)
                        this._onToggleCC(value)
                }, get: function Renderer_closedCaptionsOn_get() {
                        return this._closedCaptionsOn
                    }
            }, _closedCaptionsOn: false, _iPlaybackControl: null, _ccPresenter: null, _ttmlProcessor: null, _ccContainer: null, _ttmlFilepath: String.empty, _ttmlFileLoaded: false, _currentMedia: null, _currentMediaInstance: null, _renderingPaused: true, _playbackControlBindings: null, _resizeCallback: null, _processorLeadTime: 1000, _currentGeneratedAt: 0, _currentValidUntil: 0, _initialize: function Renderer_initialize(rendererContainer) {
                    if (!this._iPlaybackControl)
                        return;
                    if (MS.Entertainment.Utilities.isVideoApp || MS.Entertainment.Utilities.isMusicApp2) {
                        this._ttmlProcessor = new Microsoft.Entertainment.ClosedCaptions.TTMLProcessor;
                        this._ccPresenter = new MSEPlatform.Playback.ClosedCaptions.Presenter(this, rendererContainer);
                        if (this._closedCaptionsOn)
                            this._bindToPlaybackControl();
                        this.bind("ccLcid", this._onLcidChanged.bind(this))
                    }
                    else
                        this._closedCaptionsOn = false
                }, _bindToPlaybackControl: function Renderer_bindToPlaybackControl() {
                    this._playbackControlBindings = WinJS.Binding.bind(this._iPlaybackControl, {
                        currentMedia: this._onMediaChanged.bind(this), videoHeight: this._onVideoSizeChanged.bind(this), currentPosition: this._onPositionChanged.bind(this), currentTransportState: this._onTransportStateChanged.bind(this), seekedPosition: this._onSeeked.bind(this)
                    });
                    this._resizeCallback = this._setupRenderingSurface.bind(this);
                    MS.Entertainment.Utilities.attachResizeEvent(this._ccContainer, this._resizeCallback)
                }, _unbindFromPlaybackControl: function Renderer_unbindFromPlaybackControl() {
                    if (this._playbackControlBindings) {
                        this._playbackControlBindings.cancel();
                        this._playbackControlBindings = null
                    }
                    MS.Entertainment.Utilities.detachResizeEvent(this._ccContainer, this._resizeCallback)
                }, _reset: function Renderer_reset() {
                    this._ttmlFileLoaded = false;
                    this._ccPresenter.flush();
                    this._invalidateRenderingTimeWindow()
                }, _onToggleCC: function Renderer_onToggleCC(activate) {
                    this._closedCaptionsOn = activate;
                    if (activate) {
                        WinJS.Utilities.removeClass(this._ccContainer, "hideFromDisplay");
                        this._iPlaybackControl.enableTimeUpdate();
                        this._bindToPlaybackControl()
                    }
                    else {
                        WinJS.Utilities.addClass(this._ccContainer, "hideFromDisplay");
                        this._stopRendering();
                        this._unbindFromPlaybackControl()
                    }
                }, _onLcidChanged: function Renderer_onLcidChanged(newLcid, oldLcid) {
                    if (!oldLcid || !newLcid || !this._closedCaptionsOn)
                        return;
                    var currentMediaInstance = this._currentMediaInstance;
                    if (currentMediaInstance) {
                        this._ttmlFileLoaded = false;
                        this._onMediaChanged(currentMediaInstance)
                    }
                }, _onMediaChanged: function Renderer_onMediaChanged(newMedia) {
                    if (!newMedia)
                        return;
                    if (!this._closedCaptionsOn)
                        return;
                    if (newMedia.isEqual(this._currentMediaInstance) && this._ttmlFileLoaded) {
                        this._invalidateRenderingTimeWindow();
                        this._startRendering()
                    }
                    else {
                        this._reset();
                        this._currentMediaInstance = newMedia;
                        this._currentMedia = null;
                        if (newMedia._mediaItem)
                            this._currentMedia = newMedia._mediaItem.data;
                        this._getTTMLFilepath().then(function _gotTTMLFile(filePath) {
                            this._loadTTMLFile(filePath).then(function _loadedTTMLFile() {
                                this._startRendering()
                            }.bind(this), function _cantLoadTTMLFile(error){})
                        }.bind(this), function _noTTMLFile(error){})
                    }
                    this._setupRenderingSurface()
                }, _onVideoSizeChanged: function Renderer_onVideoSizeChanged(videoHeight) {
                    this._setupRenderingSurface()
                }, _onPositionChanged: function Renderer_onPositionChanged(playbackPosition) {
                    if (!this._closedCaptionsOn || !this._ttmlFileLoaded)
                        return;
                    this._checkAndProcessNextClosedCaptionsBlob(playbackPosition)
                }, _onTransportStateChanged: function Renderer_onTransportStateChanged(newTS) {
                    if (!this._closedCaptionsOn || !this._ttmlFileLoaded)
                        return;
                    switch (newTS) {
                        case MSEPlatform.Playback.TransportState.playing:
                            WinJS.Promise.timeout(500).then(function onDelayedPlaying() {
                                this._setupRenderingSurface()
                            }.bind(this));
                            this._startRendering();
                            break;
                        case MSEPlatform.Playback.TransportState.paused:
                            this._stopRendering();
                            break;
                        case MSEPlatform.Playback.TransportState.stopped:
                            this._stopRendering();
                            break
                    }
                }, _onSeeked: function Renderer_onSeeked(newPosition) {
                    if (!this._closedCaptionsOn || !this._ttmlFileLoaded)
                        return;
                    this._ccPresenter.flush();
                    this._invalidateRenderingTimeWindow();
                    this._renderingPaused = false;
                    this._checkAndProcessNextClosedCaptionsBlob(this._iPlaybackControl.currentPosition);
                    this._ccPresenter._presenterLoop()
                }, _setupRenderingSurface: function _setupRenderingSurface() {
                    var surfaceHeight = 0;
                    var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    if (this._iPlaybackControl.videoWidth && this._iPlaybackControl.videoHeight) {
                        surfaceHeight = Math.floor(this._iPlaybackControl.videoHeight * (this._ccContainer.clientWidth / this._iPlaybackControl.videoWidth));
                        if (surfaceHeight && this._ccContainer.parentElement && this._ccContainer.parentElement.clientHeight) {
                            surfaceHeight = Math.min(surfaceHeight, this._ccContainer.parentElement.clientHeight);
                            this._ccContainer.style.height = surfaceHeight + "px";
                            this._ccContainer.style.top = ((this._ccContainer.parentElement.clientHeight - surfaceHeight) >> 1) + "px";
                            this._ccContainer.style.fontSize = Math.floor(surfaceHeight * 0.05) + "px"
                        }
                    }
                    this._startRendering()
                }, _invalidateRenderingTimeWindow: function Renderer_invalidateRenderingTimeWindow() {
                    this._currentGeneratedAt = 0;
                    this._currentValidUntil = 0
                }, _findClosedCaptionsUrl: function Renderer_findClosedCaptionsUrl(miid) {
                    var ccInfo = null;
                    if (miid && this._currentMedia && this._currentMedia.closedCaptionFiles) {
                        var ccFiles = this._currentMedia.closedCaptionFiles;
                        var mediaInstanceId = null;
                        var lcid = null;
                        miid = miid.replace(/{/g, '');
                        miid = miid.replace(/}/g, '');
                        for (var i = 0; i < ccFiles.length; i++) {
                            mediaInstanceId = ccFiles[i].mediaInstanceId;
                            lcid = ccFiles[i].lcid;
                            if (mediaInstanceId) {
                                mediaInstanceId = mediaInstanceId.replace(/{/g, '');
                                mediaInstanceId = mediaInstanceId.replace(/}/g, '');
                                if (mediaInstanceId.toLowerCase() === miid && (!this.ccLcid || +lcid === +(this.ccLcid))) {
                                    ccInfo = {
                                        url: ccFiles[i].fileUri, name: ccFiles[i].name
                                    };
                                    break
                                }
                            }
                        }
                    }
                    return ccInfo
                }, _getTTMLFilepath: function Renderer_getTTMLFilepath() {
                    var smid = (this._currentMedia ? this._currentMedia.zuneId || this._currentMedia.serviceId : null);
                    var miid = (this._currentMediaInstance ? (this._currentMediaInstance.mediaInstanceId ? this._currentMediaInstance.mediaInstanceId.toLowerCase() : null) : null);
                    var url = String.empty;
                    var name = String.empty;
                    var ccInfo = this._findClosedCaptionsUrl(miid);
                    if (ccInfo) {
                        url = ccInfo.url;
                        name = ccInfo.name
                    }
                    MSEPlatform.Playback.Etw.traceCCRendererGetTTMLFilepath("begin", smid, miid, this.ccLcid, url);
                    if (smid && miid && url && name)
                        return new WinJS.Promise(function _getTTMLFilePromise(c, e, p) {
                                Microsoft.Entertainment.ClosedCaptionDownloader.getClosedCaptionFileAsync(url, smid, miid, name, this.ccLcid).then(function _getTTMLFile_success(path) {
                                    MSEPlatform.Playback.Etw.traceCCRendererGetTTMLFilepath("end", smid, miid, this.ccLcid, path);
                                    c(path)
                                }.bind(this), function _getTTMLFile_failed(error) {
                                    MSEPlatform.Playback.Etw.traceCCRendererGetTTMLFilepath("failed: " + error, smid, miid, this.ccLcid, url);
                                    e(error)
                                }.bind(this))
                            }.bind(this));
                    else {
                        MSEPlatform.Playback.Etw.traceCCRendererGetTTMLFilepath("failed: E_INVALIDARGS", smid, miid, this.ccLcid, url);
                        return WinJS.Promise.wrapError("E_INVALIDARGS")
                    }
                }, _ttmlProcessorLoadAsync: function _ttmlProcessorLoad(storageFile) {
                    if (!MS.Entertainment.Utilities.isApp2)
                        return this._ttmlProcessor.loadFromStorageFile(storageFile);
                    else
                        return Windows.Storage.FileIO.readTextAsync(storageFile).then(function loadTTMLAsString(ttmlAsString) {
                                try {
                                    this._ttmlProcessor.loadFromString(ttmlAsString)
                                }
                                catch(ex) {
                                    return WinJS.Promise.wrapError("_ttmlProcessor.loadFromString failed with " + ex)
                                }
                            }.bind(this))
                }, _loadTTMLFile: function Renderer_loadTTMLFile(filePath) {
                    if (!filePath)
                        return WinJS.Promise.wrapError("Renderer_loadTTMLFile: Error! Empty filePath.");
                    MSEPlatform.Playback.Etw.traceCCRendererLoadTTMLFile("begin", filePath);
                    return new WinJS.Promise(function _loadTTMLPromise(c, e, p) {
                            try {
                                Windows.Storage.StorageFile.getFileFromPathAsync(filePath).then(function _gotFile(storageFile) {
                                    this._ttmlProcessorLoadAsync(storageFile).then(function _loadTTMLFile_success() {
                                        MSEPlatform.Playback.Etw.traceCCRendererLoadTTMLFile("end", filePath);
                                        this._ttmlFilepath = filePath;
                                        this._ttmlFileLoaded = true;
                                        c()
                                    }.bind(this), function _loadTTMLFile_failed(errorFromLoad) {
                                        MSEPlatform.Playback.Etw.traceCCRendererLoadTTMLFile("failed: " + errorFromLoad, filePath);
                                        e(errorFromLoad)
                                    }, function _loadTTMLFile_progress(progress) {
                                        MSEPlatform.Playback.Etw.traceCCRendererLoadTTMLFile("progress : " + progress, filePath)
                                    })
                                }.bind(this), function _noFileFromStorage(errorFromStorage) {
                                    MSEPlatform.Playback.Etw.traceCCRendererLoadTTMLFile("failed: " + errorFromStorage, filePath);
                                    e(errorFromStorage)
                                })
                            }
                            catch(ex) {
                                MSEPlatform.Playback.Etw.traceCCRendererLoadTTMLFile("failed: " + ex, filePath);
                                e(ex)
                            }
                        }.bind(this))
                }, _getHtmlBlob: function Renderer_getHtmlBlob(msecPosition) {
                    var ttmlOutput = null;
                    try {
                        ttmlOutput = this._ttmlProcessor.renderAt(msecPosition)
                    }
                    catch(ex) {}
                    return (ttmlOutput ? JSON.parse(ttmlOutput) : null)
                }, _applyUserSettings: function Renderer_applyUserSettings(htmlBlob) {
                    return htmlBlob
                }, _startRendering: function Renderer_startRendering() {
                    if (this._renderingPaused) {
                        MSEPlatform.Playback.Etw.traceCCEnterRenderingLoop(this._iPlaybackControl.currentPosition, this._iPlaybackControl.currentTransportState);
                        this._renderingPaused = false;
                        this._ccPresenter.start()
                    }
                }, _stopRendering: function Renderer_stopRendering() {
                    MSEPlatform.Playback.Etw.traceCCExitRenderingLoop(this._iPlaybackControl.currentPosition, this._iPlaybackControl.currentTransportState, this._closedCaptionsOn);
                    this._renderingPaused = true;
                    this._currentValidUntil = 0;
                    this._ccPresenter.stop()
                }, _checkAndProcessNextClosedCaptionsBlob: function Renderer_checkAndProcessNextClosedCaptionsBlob(currentPlaybackPosition) {
                    if (this._ttmlFileLoaded && !this._renderingPaused)
                        while (currentPlaybackPosition + this._processorLeadTime >= this._currentValidUntil) {
                            var requestTime = (this._currentValidUntil === 0 ? currentPlaybackPosition : this._currentValidUntil + 1);
                            var blob = this._getHtmlBlob(requestTime);
                            if (blob) {
                                this._currentGeneratedAt = blob.generatedAt;
                                this._currentValidUntil = blob.validUntil;
                                var finalHtml = this._applyUserSettings(blob.html);
                                this._ccPresenter.presentAt(this._currentGeneratedAt, this._currentValidUntil, finalHtml)
                            }
                            else
                                break
                        }
                }
        }, {
            _closedCaptionsStyleSheetId: "CCStyleSheet", loadAndUpdateClosedCaptionStyleSettings: function loadAndUpdateClosedCaptionStyleSettings() {
                    MS.Entertainment.Platform.Playback.ClosedCaptions.getUserSettings().loadAndUpdateClosedCaptionStyleSettings()
                }, loadClosedCaptionStyleSettings: function loadAndUpdateClosedCaptionStyleSettings() {
                    return MS.Entertainment.Platform.Playback.ClosedCaptions.getUserSettings().loadClosedCaptionStyleSettings()
                }, saveClosedCaptionStyleSettings: function saveClosedCaptionStyleSettings(ccSettings) {
                    MS.Entertainment.Platform.Playback.ClosedCaptions.getUserSettings().saveClosedCaptionStyleSettings(ccSettings)
                }, updateClosedCaptionStyleSettings: function updateClosedCaptionStyleSettings(ccSettings, isPreviewOnly) {
                    MS.Entertainment.Platform.Playback.ClosedCaptions.getUserSettings().updateClosedCaptionStyleSettings(ccSettings, isPreviewOnly)
                }
        })})
})()
})();
/* >>>>>>/controls/transportcontrols/transportcontrols.js:3734 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {TransportControls: MS.Entertainment.UI.Framework.defineUserControl("/Controls/TransportControls/TransportControls.html#transportControlsTemplate", function(element, options) {
            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.volumeService)) {
                var volumeControllerService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.volumeService);
                this._volumeControllerService = volumeControllerService;
                this._volumeStateBinds = WinJS.Binding.bind(volumeControllerService, {
                    volume: this._onVolumeValueChange.bind(this), mute: this._onMuteStateChange.bind(this), isAudioEndpointAvailable: this._onAudioEndpointChange.bind(this)
                })
            }
        }, {
            _initialized: false, _messageTimeout: null, _sessionMgr: null, _uiStateService: null, _bindings: null, _eventHandlers: null, _deferredUpdateTimer: null, _isNowPlayingControls: false, _appBarPlaybackOptionsMenu: null, playbackOptionsActions: null, _volumeStateBinds: null, focusPlayOnInitialize: false, _playToStateBinds: null, _volumeControllerService: null, initialize: function initialize() {
                    this._sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    var localShuffleAction = new MS.Entertainment.UI.ToolbarAction;
                    localShuffleAction.id = "appBarTransportControlsShuffle";
                    localShuffleAction.automationId = MS.Entertainment.UI.AutomationIds.transportShuffle;
                    localShuffleAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_SHUFFLE_OFF_BUTTON);
                    localShuffleAction.icon = MS.Entertainment.UI.Icon.shuffleOn;
                    localShuffleAction.executed = function shuffleExecuted() {
                        this.shuffleButtonClick()
                    }.bind(this);
                    localShuffleAction.isPlaybackOption = true;
                    localShuffleAction.forceTitleChange = true;
                    localShuffleAction.addProperty("isVisible", false);
                    localShuffleAction.ariaLabelOverride = String.load(String.id.IDS_TRANSPORT_CONTROLS_SHUFFLE_BUTTON);
                    localShuffleAction.enableAriaPressedOverride = true;
                    localShuffleAction.addProperty("ariaPressed", false);
                    localShuffleAction.isToggleAction = true;
                    this._shuffleAction = localShuffleAction;
                    var localRepeatAction = new MS.Entertainment.UI.ToolbarAction;
                    localRepeatAction.id = "appBarTransportControlsRepeat";
                    localRepeatAction.automationId = MS.Entertainment.UI.AutomationIds.transportRepeat;
                    localRepeatAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_REPEAT_OFF_BUTTON);
                    localRepeatAction.icon = WinJS.UI.AppBarIcon.refresh;
                    localRepeatAction.executed = function repeatExecuted() {
                        this.repeatButtonClick()
                    }.bind(this);
                    localRepeatAction.isPlaybackOption = true;
                    localRepeatAction.forceTitleChange = true;
                    localRepeatAction.addProperty("isVisible", true);
                    localRepeatAction.ariaLabelOverride = String.load(String.id.IDS_TRANSPORT_CONTROLS_REPEAT_BUTTON);
                    localRepeatAction.enableAriaPressedOverride = true;
                    localRepeatAction.addProperty("ariaPressed", false);
                    localRepeatAction.isToggleAction = true;
                    this._repeatAction = localRepeatAction;
                    var localSkipBackAction = new MS.Entertainment.UI.ToolbarAction;
                    localSkipBackAction.id = "appBarTransportControlsPrevious";
                    localSkipBackAction.automationId = MS.Entertainment.UI.AutomationIds.transportSkipBack;
                    localSkipBackAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_PREVIOUS_BUTTON);
                    localSkipBackAction.icon = MS.Entertainment.UI.Icon.previous;
                    localSkipBackAction.executed = function skipBackExecuted() {
                        this.skipBackButtonClick()
                    }.bind(this);
                    localSkipBackAction.canExecute = function skipBackCanExecute(parameter) {
                        return !this.isDisabled && !this.skipBackDisabled
                    }.bind(this);
                    if (MS.Entertainment.Utilities.isMusicApp2) {
                        localSkipBackAction.voicePhrase = String.load(String.id.IDS_MUSIC2_NOW_PLAYING_PREVIOUS_SONG_VUI_ALM);
                        localSkipBackAction.voicePhoneticPhrase = String.load(String.id.IDS_MUSIC2_NOW_PLAYING_PREVIOUS_SONG_VUI_PRON);
                        localSkipBackAction.voiceConfidence = String.load(String.id.IDS_MUSIC2_NOW_PLAYING_PREVIOUS_SONG_VUI_CONF)
                    }
                    this._skipBackAction = localSkipBackAction;
                    var localSkipBackHoldAction = new MS.Entertainment.UI.ToolbarAction;
                    localSkipBackHoldAction.id = "appBarTransportControlsPreviousHold";
                    localSkipBackHoldAction.automationId = MS.Entertainment.UI.AutomationIds.transportSkipBackHold;
                    localSkipBackHoldAction.canExecute = function skipBackHoldCanExecute(parameter) {
                        return !this.isDisabled
                    }.bind(this);
                    localSkipBackHoldAction.executed = this.skipBackButtonHold.bind(this);
                    this._skipBackHoldAction = localSkipBackHoldAction;
                    var localPlayAction = new MS.Entertainment.UI.ToolbarAction;
                    localPlayAction.id = "appBarTransportControlsPlay";
                    localPlayAction.automationId = MS.Entertainment.UI.AutomationIds.transportPlay;
                    localPlayAction.title = String.load(MS.Entertainment.UI.Controls.TransportControls.playButtonStringId);
                    localPlayAction.icon = MS.Entertainment.UI.Icon.play;
                    localPlayAction.executed = function playExecuted() {
                        this.playPauseButtonClick()
                    }.bind(this);
                    localPlayAction.canExecute = function playCanExecute(parameter) {
                        return !this.isDisabled
                    }.bind(this);
                    this._playAction = localPlayAction;
                    var localPauseAction = new MS.Entertainment.UI.ToolbarAction;
                    localPauseAction.id = "appBarTransportControlsPause";
                    localPauseAction.automationId = MS.Entertainment.UI.AutomationIds.transportPause;
                    localPauseAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_PAUSE_BUTTON);
                    localPauseAction.icon = WinJS.UI.AppBarIcon.pause;
                    localPauseAction.executed = function pauseExecuted() {
                        this.pauseButtonClick()
                    }.bind(this);
                    localPauseAction.canExecute = function pauseCanExecute(parameter) {
                        return !this.isDisabled
                    }.bind(this);
                    this._pauseAction = localPauseAction;
                    this._playPauseAction = this._playAction;
                    if (this._playPauseButton)
                        this.bind("playVisible", function _updatePlayPause() {
                            var voicePhraseStringId;
                            var voicePhoneticPhraseStringId;
                            var voiceConfidenceStringId;
                            if (this.playVisible) {
                                this._playPauseAction = this._playAction;
                                this._playPauseButton.text = this._playAction.title;
                                voicePhraseStringId = String.id.IDS_MUSIC2_NOW_PLAYING_PLAY_VUI_ALM;
                                voicePhoneticPhraseStringId = String.id.IDS_MUSIC2_NOW_PLAYING_PLAY_VUI_PRON;
                                voiceConfidenceStringId = String.id.IDS_MUSIC2_NOW_PLAYING_PLAY_VUI_CONF
                            }
                            else {
                                this._playPauseAction = this._pauseAction;
                                this._playPauseButton.text = this._pauseAction.title;
                                voicePhraseStringId = String.id.IDS_MUSIC2_NOW_PLAYING_PAUSE_VUI_ALM;
                                voicePhoneticPhraseStringId = String.id.IDS_MUSIC2_NOW_PLAYING_PAUSE_VUI_PRON;
                                voiceConfidenceStringId = String.id.IDS_MUSIC2_NOW_PLAYING_PAUSE_VUI_CONF
                            }
                            if (MS.Entertainment.Utilities.isMusicApp2) {
                                this._playPauseAction.voicePhrase = String.load(voicePhraseStringId);
                                this._playPauseAction.voicePhoneticPhrase = String.load(voicePhoneticPhraseStringId);
                                this._playPauseAction.voiceConfidence = String.load(voiceConfidenceStringId);
                                XboxJS.UI.Voice.refreshVoiceElements()
                            }
                        }.bind(this));
                    var localSkipForwardAction = new MS.Entertainment.UI.ToolbarAction;
                    localSkipForwardAction.id = "appBarTransportControlsForward";
                    localSkipForwardAction.automationId = MS.Entertainment.UI.AutomationIds.transportSkipForward;
                    localSkipForwardAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_NEXT_BUTTON);
                    localSkipForwardAction.icon = MS.Entertainment.UI.Icon.next;
                    if (MS.Entertainment.Utilities.isMusicApp2) {
                        localSkipForwardAction.voicePhrase = String.load(String.id.IDS_MUSIC2_NOW_PLAYING_NEXT_SONG_VUI_ALM);
                        localSkipForwardAction.voicePhoneticPhrase = String.load(String.id.IDS_MUSIC2_NOW_PLAYING_NEXT_SONG_VUI_PRON);
                        localSkipForwardAction.voiceConfidence = String.load(String.id.IDS_MUSIC2_NOW_PLAYING_NEXT_SONG_VUI_CONF);
                        WinJS.Promise.timeout().then(function() {
                            XboxJS.UI.Voice.refreshVoiceElements()
                        })
                    }
                    localSkipForwardAction.executed = function skipForwardExecuted() {
                        this.skipForwardButtonClick()
                    }.bind(this);
                    localSkipForwardAction.canExecute = function skipForwardCanExecute(parameter) {
                        return !this.isDisabled && !this.skipForwardDisabled
                    }.bind(this);
                    this._skipForwardAction = localSkipForwardAction;
                    var localSkipForwardHoldAction = new MS.Entertainment.UI.ToolbarAction;
                    localSkipForwardHoldAction.id = "appBarTransportControlsForwardHold";
                    localSkipForwardHoldAction.automationId = MS.Entertainment.UI.AutomationIds.transportSkipForwardHold;
                    localSkipForwardHoldAction.canExecute = function skipForwardHoldCanExecute(parameter) {
                        return !this.isDisabled
                    }.bind(this);
                    localSkipForwardHoldAction.executed = this.skipForwardButtonHold.bind(this);
                    this._skipForwardHoldAction = localSkipForwardHoldAction;
                    this._initializeVolumeAction();
                    var localSmartGlassAction = new MS.Entertainment.UI.ToolbarAction;
                    localSmartGlassAction.id = "appBarTransportControlsSmartGlass";
                    localSmartGlassAction.automationId = MS.Entertainment.UI.AutomationIds.transportSmartGlass;
                    localSmartGlassAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_XBOX_CONTROLLER_BUTTON);
                    localSmartGlassAction.icon = MS.Entertainment.UI.Icon.game;
                    localSmartGlassAction.executed = function SmartGlassExecuted() {
                        this.smartGlassButtonClick()
                    }.bind(this);
                    localSmartGlassAction.canExecute = function SmartGlassCanExecute(parameter) {
                        return !this.smartGlassDisabled
                    }.bind(this);
                    this._smartGlassAction = localSmartGlassAction;
                    var localXboxAction = new MS.Entertainment.UI.ToolbarAction;
                    localXboxAction.id = "appBarTransportControlsXbox";
                    localXboxAction.automationId = MS.Entertainment.UI.AutomationIds.transportXbox;
                    localXboxAction.icon = MS.Entertainment.UI.Icon.takeFromXbox;
                    localXboxAction.adornerRing = MS.Entertainment.UI.Icon.takeFromXboxAdornerAppbar;
                    localXboxAction.adornerMode = MS.Entertainment.UI.Controls.IconButtonMode.Custom;
                    localXboxAction.hideDefaultRing = true;
                    localXboxAction.executed = function XboxExecuted() {
                        this.xboxButtonClick()
                    }.bind(this);
                    localXboxAction.canExecute = function XboxCanExecute(parameter) {
                        return !this.xboxDisabled
                    }.bind(this);
                    this._xboxAction = localXboxAction;
                    var localClosedCaptionAction = new MS.Entertainment.UI.ToolbarAction;
                    localClosedCaptionAction.id = "playbackOptionsClosedCaption";
                    localClosedCaptionAction.automationId = MS.Entertainment.UI.AutomationIds.transportClosedCaption;
                    localClosedCaptionAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_CLOSED_CAPTION_LABEL);
                    localClosedCaptionAction.icon = MS.Entertainment.UI.Icon.closedCaption;
                    localClosedCaptionAction.isComboPlaybackOption = true;
                    localClosedCaptionAction.addProperty("isComboBoxEnabled", false);
                    localClosedCaptionAction.addProperty("availableLanguages", []);
                    localClosedCaptionAction.addProperty("selectedIndex", 0);
                    localClosedCaptionAction.addProperty("isVisible", false);
                    localClosedCaptionAction.currentPlayingMediaInstance = 0;
                    this._closedCaptionAction = localClosedCaptionAction;
                    if (!this._isNowPlayingControls) {
                        this.playbackOptionsActions = [];
                        this.playbackOptionsActions.unshift({action: this._closedCaptionAction});
                        this.playbackOptionsActions.unshift({action: this._repeatAction});
                        this.playbackOptionsActions.unshift({action: this._shuffleAction});
                        this._createPlaybackOptionsMenu()
                    }
                    this.bind("playbackSession", this._playbackSessionChanged.bind(this));
                    this._initialized = true;
                    this._updateStates();
                    if (this.focusPlayOnInitialize && this._playPauseButton) {
                        var playPauseIconButton = this._playPauseButton.domElement.querySelector(".iconButton");
                        if (playPauseIconButton)
                            MS.Entertainment.UI.Framework.focusElement(playPauseIconButton);
                        else
                            MS.Entertainment.UI.Controls.fail("Expected an iconButton child beneath playPause control")
                    }
                }, _initializeVolumeAction: function _initializeVolumeAction() {
                    if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.volumeService))
                        return;
                    var localVolumeAction = new MS.Entertainment.UI.ToolbarAction;
                    localVolumeAction.id = "appBarTransportControlsVolume";
                    localVolumeAction.automationId = MS.Entertainment.UI.AutomationIds.transportVolume;
                    if (this._volumeControllerService.isAudioEndpointAvailable) {
                        if (this._volumeControllerService.mute) {
                            localVolumeAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_VOLUME_MUTE_BUTTON);
                            localVolumeAction.icon = WinJS.UI.AppBarIcon.mute
                        }
                        else {
                            var formattedValue = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber.format(Math.round(this._volumeControllerService.volume * 100));
                            localVolumeAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_VOLUME_BUTTON).format(formattedValue);
                            localVolumeAction.icon = WinJS.UI.AppBarIcon.volume
                        }
                        localVolumeAction.canExecute = function volumeActionCanExecute(parameter) {
                            if (this.playbackSession && this.playbackSession.isRemoteSessionRunning) {
                                this.volumeDisabled = true;
                                return false
                            }
                            else {
                                this.volumeDisabled = false;
                                return true
                            }
                        }.bind(this);
                        localVolumeAction.executed = function volumeButtonExecuted() {
                            this.volumeButtonClick()
                        }.bind(this)
                    }
                    else {
                        localVolumeAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_DISABLED_VOLUME_BUTTON);
                        localVolumeAction.icon = MS.Entertainment.UI.Icon.volumeDisabled;
                        localVolumeAction.canExecute = function volumeActionCanExecute(parameter) {
                            return false
                        }
                    }
                    this._volumeAction = localVolumeAction;
                    var localVolumeHoldAction = new MS.Entertainment.UI.ToolbarAction;
                    localVolumeHoldAction.id = "appBarTransportControlsVolumeHold";
                    localVolumeHoldAction.automationId = MS.Entertainment.UI.AutomationIds.transportVolumeHold;
                    localVolumeHoldAction.canExecute = function volumeHoldCanExecute(parameter) {
                        return true
                    };
                    localVolumeHoldAction.executed = this.volumeButtonHold.bind(this);
                    this._volumeHoldAction = localVolumeHoldAction
                }, _onVolumeValueChange: function volumeValueChange(newValue) {
                    var volumeValue = Math.round(newValue * 100);
                    if (this._volumeAction && this._volumeControllerService.isAudioEndpointAvailable)
                        this._updateTitleOnVolumeButton(volumeValue)
                }, _onMuteStateChange: function muteStateChange(newState) {
                    var muteState = newState;
                    if (this._volumeAction && this._volumeButton && this._volumeControllerService.isAudioEndpointAvailable)
                        if (muteState) {
                            this._volumeButton.icon = WinJS.UI.AppBarIcon.mute;
                            this._volumeAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_VOLUME_MUTE_BUTTON)
                        }
                        else {
                            this._volumeButton.icon = WinJS.UI.AppBarIcon.volume;
                            var volumeValue = Math.round(this._volumeControllerService.volume * 100);
                            this._updateTitleOnVolumeButton(volumeValue)
                        }
                }, _playToStateChanged: function _playToStateChanged() {
                    if (this._volumeAction)
                        this._volumeAction.requeryCanExecute();
                    if (this._closedCaptionAction)
                        this._handleCCVisibility()
                }, _handleCCVisibility: function _handleCCVisibility() {
                    var sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    var playbackSession = sessionManager.nowPlayingSession;
                    var isPlayToSessionRunning = playbackSession.isRemoteSessionRunning;
                    if (isPlayToSessionRunning) {
                        this._ccSavedState = this._closedCaptionAction.isComboBoxEnabled;
                        this._closedCaptionAction.isComboBoxEnabled = false
                    }
                    else
                        this._closedCaptionAction.isComboBoxEnabled = this._ccSavedState
                }, _onAudioEndpointChange: function audioEndpointChange(newState) {
                    this._initializeVolumeAction()
                }, _updateTitleOnVolumeButton: function updateTitleOnVolumeButton(volumeValue) {
                    var formattedValue = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber.format(volumeValue);
                    this._volumeAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_VOLUME_BUTTON).format(formattedValue)
                }, isVolumeServiceRequired: {get: function() {
                        return (MS.Entertainment.Utilities.isApp1)
                    }}, showMessage: function showMessage(messageTitle, messageText, showDuration, showAppBar) {
                    this.messageVisible = true;
                    this.messageTitle = messageTitle;
                    this.messageSubTitle = messageText;
                    if (this._messageTimeout) {
                        this._messageTimeout.cancel();
                        this._messageTimeout = null
                    }
                    if (showAppBar) {
                        var appBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                        if (appBar && appBar.show)
                            appBar.show()
                    }
                    if (showDuration)
                        this._messageTimeout = WinJS.Promise.timeout(showDuration).then(function _delay() {
                            this.clearMessage()
                        }.bind(this))
                }, clearMessage: function clearMessage() {
                    this.messageVisible = false;
                    this.messageTitle = "";
                    this.messageSubTitle = ""
                }, _detachBindings: function _detachBindings() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    if (this._eventHandlers) {
                        this._eventHandlers.cancel();
                        this._eventHandlers = null
                    }
                }, unload: function unload() {
                    if (this._deferredUpdateTimer) {
                        this._deferredUpdateTimer.cancel();
                        this._deferredUpdateTimer = null
                    }
                    if (this._volumeStateBinds) {
                        this._volumeStateBinds.cancel();
                        this._volumeStateBinds = null
                    }
                    this._detachBindings();
                    this.unbind("playbackSession");
                    this.unbind("volumeAction");
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _createPlaybackOptionsMenu: function _createPlaybackOptionsMenu() {
                    var container = document.createElement("div");
                    container.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.PlaybackOptionsList");
                    this._appBarPlaybackOptionsMenu = new MS.Entertainment.UI.Controls.PlaybackOptionsList(this._playbackOptionsContainer.appendChild(container), {_overflowTitleOverride: String.load(String.id.IDS_TRANSPORT_CONTROLS_PLAYBACK_OPTIONS_BUTTON)});
                    container.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.ActionList");
                    this.bind("playbackOptionsActions", function _updateActions() {
                        this._appBarPlaybackOptionsMenu.items = this.playbackOptionsActions
                    }.bind(this));
                    this._appBarPlaybackOptionsMenu.containerWidth = 100;
                    this._appBarPlaybackOptionsMenu._maxItems = 1;
                    if (this._appBarPlaybackOptionsMenu._getOverflowAction().action)
                        this._appBarPlaybackOptionsMenu._getOverflowAction().action.executed = this._appBarPlaybackOptionsMenu.executeActionUpdateCombo
                }, updatePlaybackOptionsActionSet: function updatePlaybackOptionsActionSet() {
                    if (this._appBarPlaybackOptionsMenu)
                        this._appBarPlaybackOptionsMenu.updateActionSets()
                }, _applyBindings: function _applyBindings() {
                    if (this._unloaded)
                        return;
                    this._detachBindings();
                    var mediaStateChanged = this._mediaStateChanged.bind(this);
                    var updateStates = this._updateStates.bind(this);
                    this._eventHandlers = MS.Entertainment.Utilities.addEvents(this.playbackSession, {
                        currentTitleIdChanged: mediaStateChanged, playerStateChanged: this._playerStateChanged.bind(this), currentMediaChanged: mediaStateChanged, currentTransportStateChanged: mediaStateChanged, shuffleChanged: mediaStateChanged, repeatChanged: mediaStateChanged, canSkipBackwardChanged: mediaStateChanged, canSkipForwardChanged: mediaStateChanged, playbackRateChanged: mediaStateChanged, canControlMediaChanged: mediaStateChanged
                    });
                    this._playerStateChanged();
                    this._bindings = WinJS.Binding.bind(this, {
                        _uiStateService: {
                            primarySessionId: mediaStateChanged, isSnapped: updateStates, nowPlayingTileVisible: updateStates
                        }, playbackSession: {isRemoteSessionRunning: this._playToStateChanged.bind(this)}
                    })
                }, _playbackSessionChanged: function _playbackSessionChanged() {
                    if (this._unloaded)
                        return;
                    if (this.playbackSession)
                        this._applyBindings();
                    this._mediaStateChanged()
                }, _playerStateChanged: function _playerStateChanged(e) {
                    this._updateStates()
                }, _mediaStateChanged: function _mediaStateChanged(e) {
                    this._updateStates()
                }, _updateStates: function _updateStates() {
                    if (this._deferredUpdateTimer)
                        return;
                    this._deferredUpdateTimer = WinJS.Promise.timeout(MS.Entertainment.Platform.PlaybackHelpers.deferredUpdateTimeout).then(this._updateStatesDeferred.bind(this))
                }, _updateStatesDeferred: function _updateStatesDeferred() {
                    this._deferredUpdateTimer = null;
                    if (this._unloaded)
                        return;
                    if (this._initialized && this.playbackSession) {
                        var isPlaylist = MS.Entertainment.Platform.PlaybackHelpers.isMusicTrackOrMusicVideo(this.playbackSession.currentMedia);
                        var showNowPlayingSkipAndVolumeButtons = this.playbackSession.currentMedia && (this.playbackSession === this._sessionMgr.nowPlayingSession && !MS.Entertainment.Platform.PlaybackHelpers.isVideo(this.playbackSession.currentMedia));
                        this.nowPlayingSkipBackVisible = showNowPlayingSkipAndVolumeButtons;
                        this.nowPlayingSkipForwardVisible = showNowPlayingSkipAndVolumeButtons;
                        this.nowPlayingVolumeVisible = (this.isVolumeServiceRequired && showNowPlayingSkipAndVolumeButtons);
                        var localPlayToXboxFeatureEnabled = MS.Entertainment.Platform.PlaybackHelpers.isPlayToXboxFeatureEnabled(this.playbackSession.currentMedia);
                        if (!this.playbackSession.currentMedia) {
                            this.isDisabled = true;
                            this.playVisible = true;
                            this.skipBackDisabled = true;
                            this.skipForwardDisabled = true;
                            this.playbackLabelId = MS.Entertainment.UI.Controls.TransportControls.playButtonStringId
                        }
                        else {
                            if (this.playbackSession.targetTransportState === MS.Entertainment.Platform.Playback.TransportState.unInitialize || this.playbackSession.targetTransportState === MS.Entertainment.Platform.Playback.TransportState.paused || this.playbackSession.targetTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped || this.playbackSession.targetTransportState === MS.Entertainment.Platform.Playback.TransportState.buffering || (this.playbackSession.targetTransportState === MS.Entertainment.Platform.Playback.TransportState.playing && this.playbackSession.playbackRate !== 1) || this.playbackSession.playerState === MS.Entertainment.Platform.Playback.PlayerState.error) {
                                this.playVisible = true;
                                this.playbackLabelId = MS.Entertainment.UI.Controls.TransportControls.playButtonStringId
                            }
                            else {
                                this.playVisible = false;
                                this.playbackLabelId = String.id.IDS_TRANSPORT_CONTROLS_PAUSE_BUTTON
                            }
                            if (this.playbackSession.targetTransportState !== MS.Entertainment.Platform.Playback.TransportState.unInitialize && this.playbackSession.targetTransportState !== this.playbackSession.currentTransportState && this.playbackSession.currentTransportState !== MS.Entertainment.Platform.Playback.TransportState.starting && this.playbackSession.playerState !== MS.Entertainment.Platform.Playback.PlayerState.error)
                                this.isDisabled = true;
                            else
                                this.isDisabled = !this.playbackSession.canControlMedia;
                            this.skipBackDisabled = this.isDisabled || (!this.playbackSession.canSkipBackward && isPlaylist);
                            this.skipForwardDisabled = this.isDisabled || (!this.playbackSession.canSkipForward && isPlaylist);
                            var skipNextIconButton = this._skipNextButton.domElement.querySelector(".iconButton");
                            if (this.skipForwardDisabled && this._playPauseButton && this._playPauseButton.domElement && skipNextIconButton === document.activeElement) {
                                var playPauseIconButton = this._playPauseButton.domElement.querySelector(".iconButton");
                                if (playPauseIconButton)
                                    MS.Entertainment.UI.Framework.focusElement(playPauseIconButton);
                                else
                                    MS.Entertainment.UI.Controls.fail("Expected an iconButton child beneath playPause control")
                            }
                            var currentPlayingMediaInstance = -1;
                            if (this.playbackSession._iPlayback && this.playbackSession._iPlayback.currentMedia && this.playbackSession._iPlayback.currentMedia.mediaInstanceId)
                                currentPlayingMediaInstance = this.playbackSession._iPlayback.currentMedia.mediaInstanceId;
                            if (!this._isNowPlayingControls && this._closedCaptionAction && this._closedCaptionAction.currentPlayingMediaInstance !== currentPlayingMediaInstance) {
                                this._closedCaptionAction.currentPlayingMediaInstance = currentPlayingMediaInstance;
                                this._closedCaptionAction.availableLanguages = [];
                                this._closedCaptionAction.isComboBoxEnabled = false;
                                if (this.playbackSession.currentMedia.closedCaptionFiles) {
                                    var numTotalCaptionFiles = this.playbackSession.currentMedia.closedCaptionFiles.length;
                                    var addOffLanguageOption = true;
                                    var that = this;
                                    this.playbackSession.currentMedia.closedCaptionFiles.forEach(function extractCaptionFiles(file) {
                                        var ccFileMediaInstanceID = ("{" + file.mediaInstanceId + "}").toUpperCase();
                                        if (ccFileMediaInstanceID === currentPlayingMediaInstance) {
                                            if (addOffLanguageOption) {
                                                that._closedCaptionAction.availableLanguages.push({
                                                    name: "Off", lcid: 0
                                                });
                                                addOffLanguageOption = false
                                            }
                                            var foundLcid = false;
                                            for (var i = 0; i < that._closedCaptionAction.availableLanguages.length; i++)
                                                if (that._closedCaptionAction.availableLanguages[i].lcid === file.lcid) {
                                                    foundLcid = true;
                                                    break
                                                }
                                            if (!foundLcid)
                                                that._closedCaptionAction.availableLanguages.push(file)
                                        }
                                    });
                                    this._closedCaptionAction.isComboBoxEnabled = this._closedCaptionAction.availableLanguages.length > 0 ? true : false;
                                    var turnCaptionsOff = true;
                                    if (this._closedCaptionAction.isComboBoxEnabled) {
                                        var settingsStorage = Windows.Storage.ApplicationData.current.localSettings;
                                        var foundPreferredLanguage = false;
                                        var englishLcidIndex = 0;
                                        var ENGLISH_LCID = "1033";
                                        if (settingsStorage.values["preferredCaptionLanguage"]) {
                                            for (var i = 0; i < this._closedCaptionAction.availableLanguages.length; i++) {
                                                if (!foundPreferredLanguage && this._closedCaptionAction.availableLanguages[i].lcid === settingsStorage.values["preferredCaptionLanguage"]) {
                                                    this.playbackSession.ccLcid = settingsStorage.values["preferredCaptionLanguage"];
                                                    MS.Entertainment.UI.Controls.TransportControls.setClosedCaptions(true);
                                                    foundPreferredLanguage = true;
                                                    turnCaptionsOff = false
                                                }
                                                if (!englishLcidIndex && this._closedCaptionAction.availableLanguages[i].lcid === ENGLISH_LCID)
                                                    englishLcidIndex = i
                                            }
                                            if (!foundPreferredLanguage && englishLcidIndex) {
                                                this.playbackSession.ccLcid = ENGLISH_LCID;
                                                MS.Entertainment.UI.Controls.TransportControls.setClosedCaptions(true);
                                                turnCaptionsOff = false
                                            }
                                        }
                                    }
                                    if (turnCaptionsOff)
                                        MS.Entertainment.UI.Controls.TransportControls.setClosedCaptions(false)
                                }
                            }
                        }
                        this.dlnaTransferAvailable = ((this.playbackSession.currentMedia && !this.playbackSession.currentMedia.hasServiceId) || (this.playbackSession.currentMedia && MS.Entertainment.Utilities.isMusicApp));
                        if (this._sessionMgr.primarySession.sessionId === MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.remoteLRC)
                            this._xboxAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_PLAY_HERE_BUTTON);
                        else if (this.dlnaTransferAvailable || MS.Entertainment.Utilities.isMusicApp)
                            this._xboxAction.title = String.load(String.id.IDS_XBOX_PLAY_TO_DEVICE);
                        else
                            this._xboxAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_PLAY_ON_XBOX_BUTTON)
                    }
                    this.anyTransferAvailable = this.dlnaTransferAvailable;
                    this.xboxDisabled = (!this.anyTransferAvailable || this.isDisabled);
                    this.xboxVisible = MS.Entertainment.Platform.PlaybackHelpers.isXboxConsoleAvailableInRegion() && !MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped && !MS.Entertainment.Utilities.isMusicApp && !Windows.UI.ViewManagement.ViewSizePreference;
                    this.smartGlassDisabled = true;
                    this.smartGlassVisible = false;
                    this.volumeVisible = (this.isVolumeServiceRequired && !MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped);
                    this._updateIcons();
                    if (this._appBarPlaybackOptionsMenu && this._appBarPlaybackOptionsMenu._getOverflowAction().action) {
                        this._appBarPlaybackOptionsMenu._getOverflowAction().action.isEnabled = !this.isDisabled;
                        WinJS.Utilities.removeClass(this._playbackOptionsContainer, "removeFromDisplay")
                    }
                    if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped) {
                        if (this._appBarPlaybackOptionsMenu && this._appBarPlaybackOptionsMenu._getOverflowAction().action)
                            WinJS.Utilities.addClass(this._playbackOptionsContainer, "removeFromDisplay");
                        this._closedCaptionAction.isVisible = false;
                        this._shuffleAction.isVisible = false;
                        this._repeatAction.isVisible = false
                    }
                    else {
                        this._repeatAction.isVisible = true;
                        this._shuffleAction.isVisible = MS.Entertainment.Utilities.isMusicApp;
                        if (this._shuffleAction.isVisible)
                            this._updateShuffleButton();
                        if (this._repeatAction.isVisible)
                            this._updateRepeatButton();
                        this._closedCaptionAction.isVisible = MS.Entertainment.Platform.PlaybackHelpers.isClosedCaptionFeatureEnabled()
                    }
                    if (this._initialized) {
                        this._playAction.requeryCanExecute();
                        this._pauseAction.requeryCanExecute();
                        this._skipBackAction.requeryCanExecute();
                        this._skipForwardAction.requeryCanExecute();
                        this._xboxAction.requeryCanExecute();
                        this._smartGlassAction.requeryCanExecute();
                        if (this._volumeAction)
                            this._volumeAction.requeryCanExecute()
                    }
                }, _updateIcons: function _updateIcons() {
                    if (this._xboxAction) {
                        if (this.dlnaTransferAvailable) {
                            this._xboxAction.icon = MS.Entertainment.UI.Icon.sendToXbox;
                            this._xboxAction.adornerRing = MS.Entertainment.UI.Icon.sendToXboxAdornerAppbar;
                            this._xboxAction.title = String.load(String.id.IDS_XBOX_PLAY_TO_DEVICE)
                        }
                        else {
                            this._xboxAction.icon = MS.Entertainment.UI.Icon.sendToXbox;
                            this._xboxAction.adornerRing = MS.Entertainment.UI.Icon.sendToXboxAdornerAppbar;
                            this._xboxAction.title = String.load(String.id.IDS_TRANSPORT_CONTROLS_PLAY_ON_XBOX_BUTTON)
                        }
                        if (this._xboxButton)
                            this._xboxButton._updateAction()
                    }
                }, xboxButtonClick: function xboxButtonClick() {
                    if (!this.visibility || !this.playbackSession)
                        return;
                    if (this.xboxTransferAvailable) {
                        this.playbackSession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.stopped;
                        MS.Entertainment.Platform.PlaybackHelpers.playToXbox(this.playbackSession.currentMedia, null, Math.round(this.playbackSession.currentPosition))
                    }
                    else
                        try {
                            Windows.Media.PlayTo.PlayToManager.showPlayToUI()
                        }
                        catch(ex) {
                            MS.Entertainment.UI.Debug.writeLine("Failed to show devices charm (may be disabled?): " + ex)
                        }
                }, smartGlassButtonClick: function smartGlassButtonClick() {
                    if (!this.visibility || !this.playbackSession)
                        return;
                    this.smartGlassActive = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.xboxControls).visibility;
                    if (this.smartGlassActive)
                        MS.Entertainment.UI.Controls.XBoxControls.hide();
                    else
                        MS.Entertainment.UI.Controls.XBoxControls.show()
                }, moreButtonClick: function moreButtonClick() {
                    this._updateStates()
                }, playButtonClick: function playButtonClick() {
                    MS.Entertainment.Utilities.Telemetry.logPlayClicked(this.domElement.className);
                    if (this._playPauseButton) {
                        this._playPauseAction = this._pauseAction;
                        this._playPauseButton.text = this._pauseAction.text;
                        this.playVisible = false
                    }
                    var isCurrentStateStoppedByError = (this.playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped) && !!this.playbackSession.errorDescriptor;
                    if (this.playbackSession.currentMedia !== null && (this.playbackSession.currentOrdinal === null || isCurrentStateStoppedByError))
                        this.playbackSession.activate(document.createElement("div"), this.playbackSession.pendingOrdinal);
                    else
                        this.playbackSession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.playing;
                    if (this.playbackSession.targetTransportState !== MS.Entertainment.Platform.Playback.TransportState.unInitialize)
                        this._updateStates()
                }, pauseButtonClick: function pauseButtonClick() {
                    MS.Entertainment.Utilities.Telemetry.logPauseClicked(this.domElement.className);
                    if (this._playPauseButton) {
                        this._playPauseAction = this._playAction;
                        this._playPauseButton.text = this._playAction.text;
                        this.playVisible = true
                    }
                    this.playbackSession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.paused;
                    this._updateStates()
                }, playPauseButtonClick: function playPauseButtonClick(e) {
                    if (!this.visibility || !this.playbackSession)
                        return;
                    if (this.playVisible)
                        this.playButtonClick();
                    else
                        this.pauseButtonClick()
                }, skipForwardButtonClick: function skipForwardButtonClick(e) {
                    if (!this.visibility || this.skipForwardDisabled || !this.playbackSession)
                        return;
                    if (MS.Entertainment.Platform.PlaybackHelpers.isMusicTrackOrMusicVideo(this.playbackSession.currentMedia))
                        this.playbackSession.skipFwd();
                    else {
                        var positionMs = this.playbackSession.getProperty("currentPosition");
                        this.playbackSession.seekToPosition(positionMs + 29000)
                    }
                    this._updateStates();
                    MS.Entertainment.Utilities.Telemetry.logNextClicked(this.domElement.className)
                }, skipForwardButtonHold: function skipForwardButtonHold() {
                    if (this.playbackSession)
                        this.playbackSession.fastFwd()
                }, volumeButtonClick: function volumeButtonClick(e) {
                    if (!this._volumeAction.isEnabled)
                        return;
                    var appBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                    appBar.sticky = true;
                    var position = WinJS.Utilities.getPosition(this._volumeButton.domElement);
                    var distanceFromBottom = (MS.Entertainment.Utilities.getWindowHeight() - position.top);
                    var left = (position.left >= 0 && position.width >= 0) ? (position.left + Math.round((0.5 * position.width) - 33)) + "px" : "auto";
                    var top = "auto";
                    var right = "auto";
                    var bottom = distanceFromBottom >= 0 ? distanceFromBottom + "px" : "auto";
                    var customStyle = "volumeContainer";
                    if (!this._volumeOverlay) {
                        this._volumeClickActionAvailable = false;
                        this._volumeOverlay = MS.Entertainment.UI.Shell.createOverlay("MS.Entertainment.UI.Controls.VolumeBar", {}, {
                            right: right, top: top, left: left, bottom: bottom
                        });
                        this._volumeOverlay.customStyle = customStyle;
                        this._volumeOverlay.enableKeyboardLightDismiss = true;
                        this._volumeOverlay.show().done(function overlayClosed() {
                            this._volumeOverlay = null
                        }.bind(this))
                    }
                }, volumeButtonHold: function volumeButtonHold() {
                    return
                }, skipBackButtonClick: function skipBackButtonClick(e) {
                    if (!this.visibility || this.skipBackDisabled || !this.playbackSession)
                        return;
                    if (MS.Entertainment.Platform.PlaybackHelpers.isMusicTrackOrMusicVideo(this.playbackSession.currentMedia))
                        this.playbackSession.skipBack();
                    else {
                        var positionMs = this.playbackSession.getProperty("currentPosition");
                        this.playbackSession.seekToPosition(positionMs - 15000)
                    }
                    this._updateStates();
                    MS.Entertainment.Utilities.Telemetry.logPreviousClicked(this.domElement.className)
                }, skipBackButtonHold: function skipBackButtonHold() {
                    if (this.playbackSession)
                        this.playbackSession.fastReverse()
                }, repeatButtonClick: function repeatButtonClick() {
                    if (this.visibility && this.playbackSession) {
                        this.playbackSession.repeat = !this.playbackSession.repeat;
                        this._updateRepeatButton();
                        this._updateStates()
                    }
                }, _updateRepeatButton: function _updateRepeatButton() {
                    var sessionRepeat = this.playbackSession && this.playbackSession.repeat;
                    this._repeatAction.title = sessionRepeat ? String.load(String.id.IDS_TRANSPORT_CONTROLS_REPEAT_ON_BUTTON) : String.load(String.id.IDS_TRANSPORT_CONTROLS_REPEAT_OFF_BUTTON);
                    this._repeatAction.ariaPressed = sessionRepeat
                }, shuffleButtonClick: function shuffleButtonClick() {
                    if (this.visibility && this.playbackSession) {
                        this.playbackSession.shuffle = !this.playbackSession.shuffle;
                        this._updateShuffleButton();
                        this._updateStates()
                    }
                }, _updateShuffleButton: function _updateShuffleButton() {
                    var sessionShuffle = this.playbackSession && this.playbackSession.shuffle;
                    this._shuffleAction.title = sessionShuffle ? String.load(String.id.IDS_TRANSPORT_CONTROLS_SHUFFLE_ON_BUTTON) : String.load(String.id.IDS_TRANSPORT_CONTROLS_SHUFFLE_OFF_BUTTON);
                    this._shuffleAction.ariaPressed = sessionShuffle
                }
        }, {
            playbackLabelId: null, playbackSession: null, isDisabled: true, playVisible: false, nowPlayingSkipBackVisible: false, nowPlayingSkipForwardVisible: false, nowPlayingVolumeVisible: false, skipBackDisabled: true, skipForwardDisabled: true, messageTitle: "", messageSubTitle: "", messageVisible: false, shuffleEnabled: false, repeatEnabled: false, moreVisible: false, smartGlassVisible: false, smartGlassDisabled: true, smartGlassActive: false, volumeVisible: true, volumeDisabled: false, xboxJoined: false, xboxVisible: false, xboxDisabled: true, xboxTransferAvailable: false, dlnaTransferAvailable: false, anyTransferAvailable: false, _playAction: null, _pauseAction: null, _playPauseAction: null, _skipForwardAction: null, _skipForwardHoldAction: null, _smartGlassAction: null, _skipBackAction: null, _skipBackHoldAction: null, _repeatAction: null, _shuffleAction: null, _xboxAction: null, _volumeAction: null, _volumeHoldAction: null, _volumeOverlay: null, _decimalFormatter: null, _ccSavedState: null
        }, {
            _closedCaptionsInitialized: false, applySelectBoxOptionTemplate: function optionTemplate(container, item) {
                    container.textContent = item.name;
                    container.value = item.lcid
                }, applySelectBoxChanged: function selectThingy() {
                    this.domElement.addEventListener("change", function selectionChanged(e) {
                        var sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        var playbackSession = sessionManager.nowPlayingSession;
                        var settingsStorage = Windows.Storage.ApplicationData.current.localSettings;
                        if (playbackSession)
                            if (e.target.selectedIndex) {
                                playbackSession.ccLcid = e.target.options[e.target.selectedIndex].value;
                                MS.Entertainment.UI.Controls.TransportControls.setClosedCaptions(true);
                                settingsStorage.values["preferredCaptionLanguage"] = e.target.options[e.target.selectedIndex].value
                            }
                            else {
                                MS.Entertainment.UI.Controls.TransportControls.setClosedCaptions(false);
                                settingsStorage.values.remove("preferredCaptionLanguage")
                            }
                    })
                }, playButtonStringId: {get: function getPlayButtonStringId() {
                        return MS.Entertainment.Utilities.isMusicApp ? String.id.IDS_PLAY_BUTTON : String.id.IDS_PLAY_BUTTON_VIDEO
                    }}, setClosedCaptions: function setClosedCaptions(value) {
                    var sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    var playbackSession = sessionManager.nowPlayingSession;
                    if (playbackSession) {
                        if (!this._closedCaptionsInitialized && value) {
                            this._closedCaptionsInitialized = true;
                            MS.Entertainment.Platform.Playback.ClosedCaptions.Renderer.loadAndUpdateClosedCaptionStyleSettings()
                        }
                        playbackSession.closedCaptionsOn = !!value
                    }
                }
        })})
})()
})();
/* >>>>>>/framework/externalnavigateaction.js:4443 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function(undefined) {
    "use strict";

    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Actions");
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {externalNavigateAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function externalNavigateActionConstructor() {
            this.base();
            this.isExternalAction = true
        }, {
            executed: function executed(param) {
                var link = this._extractLink(param);
                window.open(link, "_blank")
            }, canExecute: function canExecute(param) {
                    this.useOverrideTitleIfExists();
                    var link = this._extractLink(param);
                    this._applyAutomationId(param);
                    return (link) && (typeof link === "string")
                }, _applyAutomationId: function _applyAutomationId(param) {
                    if (param && param.automationId)
                        this.automationId = param.automationId
                }, _extractLink: function _extractLink(param) {
                    var url = null;
                    MS.Entertainment.UI.Actions.assert(param, "External navigation action requires a valid link.");
                    if (param && param.link)
                        url = param.link;
                    else if (typeof param === "string")
                        url = param;
                    return url
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {externalAdNavigateAction: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.externalNavigateAction", function externalAdNavigateActionConstructor() {
            this.base()
        }, {executed: function executed(param) {
                var link = this._extractLink(param);
                MS.Entertainment.Utilities.Telemetry.logAdClicked(link);
                Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(link)).done(function launchSuccess(s){}, function launchFailure(e){})
            }})});
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.externalNavigate, function() {
        return new MS.Entertainment.UI.Actions.externalNavigateAction
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.externalAdNavigate, function() {
        return new MS.Entertainment.UI.Actions.externalAdNavigateAction
    })
})()
})();
/* >>>>>>/components/video/gracenoteservice.js:4491 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */

(function(MS) {
    (function(Entertainment) {
        (function(Components) {
            (function(Video) {
                (function(Services) {
                    (function(GraceNoteImageSize) {
                        GraceNoteImageSize[GraceNoteImageSize["thumbnail"] = 0] = "thumbnail";
                        GraceNoteImageSize[GraceNoteImageSize["small"] = 1] = "small";
                        GraceNoteImageSize[GraceNoteImageSize["medium"] = 2] = "medium";
                        GraceNoteImageSize[GraceNoteImageSize["large"] = 3] = "large";
                        GraceNoteImageSize[GraceNoteImageSize["extraLarge"] = 4] = "extraLarge"
                    })(Services.GraceNoteImageSize || (Services.GraceNoteImageSize = {}));
                    var GraceNoteImageSize = Services.GraceNoteImageSize;
                    (function(GraceNoteSearchMode) {
                        GraceNoteSearchMode[GraceNoteSearchMode["singleBest"] = 0] = "singleBest";
                        GraceNoteSearchMode[GraceNoteSearchMode["multipleMatch"] = 1] = "multipleMatch"
                    })(Services.GraceNoteSearchMode || (Services.GraceNoteSearchMode = {}));
                    var GraceNoteSearchMode = Services.GraceNoteSearchMode;
                    var GraceNoteService = (function() {
                            function GraceNoteService() {
                                this._registerQueryString = null;
                                this._registerPromise = null;
                                this._graceNoteUser = null;
                                this._registerQueryString = this._buildRegisterQueryString();
                                this._graceNoteUser = MS.Entertainment.Utilities.getUserConfigurationValue("gracenote_user")
                            }
                            Object.defineProperty(GraceNoteService.prototype, "graceNoteUser", {
                                get: function() {
                                    return this._graceNoteUser
                                }, set: function(value) {
                                        this._graceNoteUser = value;
                                        MS.Entertainment.Utilities.setUserConfigurationValue("gracenote_user", this._graceNoteUser)
                                    }, enumerable: true, configurable: true
                            });
                            GraceNoteService.prototype.registerService = function() {
                                var registerUrl = GraceNoteService._baseUrl.format(GraceNoteService._shortClientId);
                                var registerOptions = {
                                        type: "post", url: registerUrl, responseType: "document", data: this._registerQueryString
                                    };
                                if (!this._registerPromise)
                                    this._registerPromise = WinJS.xhr(registerOptions).then(this._parseRegisterResponse.bind(this), function error(result) {
                                        return WinJS.Promise.wrapError(result)
                                    });
                                return this._registerPromise
                            };
                            GraceNoteService.prototype.contributorSearch = function(searchTerm, imageSize, searchMode) {
                                var registerPromise;
                                if (!this.graceNoteUser)
                                    registerPromise = this.registerService();
                                else
                                    registerPromise = WinJS.Promise.as(this.graceNoteUser);
                                return registerPromise.then(function(user) {
                                        var contributorSearchUrl = GraceNoteService._baseUrl.format(GraceNoteService._shortClientId);
                                        var contributorSearchQuery = this._buildContributorSearchQueryString(searchTerm, user, imageSize, searchMode);
                                        var contributorSearchOptions = {
                                                type: "post", url: contributorSearchUrl, responseType: "document", data: contributorSearchQuery
                                            };
                                        var contributorSearchPromise = WinJS.xhr(contributorSearchOptions).then(this._parseContributorResponse.bind(this), function error(result) {
                                                return WinJS.Promise.wrap(null)
                                            });
                                        return contributorSearchPromise
                                    }.bind(this))
                            };
                            GraceNoteService.getIsoLanguageStringFromBcpString = function(bcpLanguageCode) {
                                var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                                var languageString = MS.Entertainment.Utilities.getValueFromCsvList(configurationManager.service.graceNoteSupportedLanguageStringMap, bcpLanguageCode);
                                Entertainment.assert(languageString, "No GraceNote Language string mapping for language " + bcpLanguageCode + ". Update graceNoteSupportedLanguageStringMap.");
                                if (!languageString)
                                    languageString = GraceNoteService._defaultLanguageString;
                                return languageString
                            };
                            GraceNoteService.prototype._buildRegisterQueryString = function() {
                                var registerQueryString = "<QUERIES><QUERY CMD=\"REGISTER\">" + "<CLIENT>{0}</CLIENT>" + "</QUERY></QUERIES>";
                                return registerQueryString.format(GraceNoteService._clientId)
                            };
                            GraceNoteService.prototype._buildAuthHeaderQueryString = function(user) {
                                var authHeaderString = "<AUTH>" + "<CLIENT>{0}</CLIENT>" + "<USER>{1}</USER>" + "</AUTH>";
                                return authHeaderString.format(GraceNoteService._clientId, user)
                            };
                            GraceNoteService.prototype._buildLanguageHeaderString = function() {
                                var languageHeaderString = "<LANG>{0}</LANG>";
                                var languageString = this._getRequestHeaderLanguageString();
                                return languageHeaderString.format(languageString)
                            };
                            GraceNoteService.prototype._getRequestHeaderLanguageString = function() {
                                var resourceLanguage = MS.Entertainment.Utilities.getResourceLanguage();
                                var languageCode = MS.Entertainment.Utilities.getLanguageCodeFromLocale(resourceLanguage);
                                var languageString = GraceNoteService.getIsoLanguageStringFromBcpString(languageCode);
                                return languageString
                            };
                            GraceNoteService.prototype._graceNoteImageSizeToString = function(imageSize) {
                                var imageSizeString = String.empty;
                                switch (imageSize) {
                                    case 0:
                                        imageSizeString = "THUMBNAIL";
                                        break;
                                    case 1:
                                        imageSizeString = "SMALL";
                                        break;
                                    case 2:
                                        imageSizeString = "MEDIUM";
                                        break;
                                    case 3:
                                        imageSizeString = "LARGE";
                                        break;
                                    case 4:
                                        imageSizeString = "XLARGE";
                                        break;
                                    default:
                                        MS.Entertainment.Utilities.assert(false, "Unknown image size requested");
                                        break
                                }
                                return imageSizeString
                            };
                            GraceNoteService.prototype._buildContributorSearchModeQueryString = function(searchMode) {
                                var searchModeQueryString = String.empty;
                                switch (searchMode) {
                                    case 0:
                                        searchModeQueryString = "<MODE>SINGLE_BEST</MODE>";
                                        break;
                                    case 1:
                                        break;
                                    default:
                                        MS.Entertainment.Utilities.assert(false, "Unknown search mode requested");
                                        break
                                }
                                return searchModeQueryString
                            };
                            GraceNoteService.prototype._buildContributorSearchQueryString = function(searchTerm, user, imageSize, searchMode) {
                                if (typeof imageSize === "undefined")
                                    imageSize = 2;
                                if (typeof searchMode === "undefined")
                                    searchMode = 0;
                                var contributorSearchQueryString = "<QUERIES>" + "{0}" + "{1}" + "<QUERY CMD=\"CONTRIBUTOR_SEARCH\">" + "{2}" + "<TEXT TYPE=\"NAME\">{3}</TEXT>" + "<OPTION>" + "<PARAMETER>SELECT_EXTENDED</PARAMETER>" + "<VALUE>IMAGE</VALUE>" + "</OPTION>" + "<OPTION>" + "<PARAMETER>IMAGE_SIZE</PARAMETER>" + "<VALUE>{4}</VALUE>" + "</OPTION>" + "</QUERY>" + "</QUERIES>";
                                return contributorSearchQueryString.format(this._buildAuthHeaderQueryString(user), this._buildLanguageHeaderString(), this._buildContributorSearchModeQueryString(searchMode), searchTerm, this._graceNoteImageSizeToString(imageSize))
                            };
                            GraceNoteService.prototype._parseRegisterResponse = function(response) {
                                if (response) {
                                    var responseXML = response.responseXML;
                                    if (responseXML) {
                                        var userElements = responseXML.getElementsByTagName("USER");
                                        MS.Entertainment.Utilities.assert(userElements && userElements.length === 1, "Unexpected number of users returned.");
                                        this.graceNoteUser = userElements && userElements.length && userElements[0].textContent
                                    }
                                    return WinJS.Promise.wrap(this.graceNoteUser)
                                }
                                else
                                    return WinJS.Promise.wrap(null)
                            };
                            GraceNoteService.prototype._parseContributorResponse = function(response) {
                                var results = {items: []};
                                if (response) {
                                    var responseXML = response.responseXML;
                                    var contributorElements = responseXML && responseXML.getElementsByTagName("CONTRIBUTOR");
                                    if (contributorElements)
                                        for (var i = 0; i < contributorElements.length; i++) {
                                            var contributorElement = contributorElements[i];
                                            var dob = this._getResponseFieldValue(contributorElement, "DATE", null);
                                            var defaultLanguage = this._getRequestHeaderLanguageString();
                                            var contributor = {
                                                    id: this._getResponseFieldValue(contributorElement, "GN_ID", null), name: this._getResponseFieldValue(contributorElement, "NAME", null), dateOfBirth: dob ? this._createDateOfBirthFromResult(dob) : null, placeOfBirth: this._getResponseFieldValue(contributorElement, "PLACE", null), biography: this._getResponseFieldValue(contributorElement, "BIOGRAPHY", null), biographyLanguage: this._getResponseAttributeValue(contributorElement, "BIOGRAPHY", "LANG", defaultLanguage), image: this._getResponseFieldValue(contributorElement, "URL", null)
                                                };
                                            results.items.push(contributor)
                                        }
                                }
                                return WinJS.Promise.wrap(results)
                            };
                            GraceNoteService.prototype._getResponseFieldValue = function(rootNode, tagName, defaultValue) {
                                var result = defaultValue;
                                if (rootNode && rootNode.getElementsByTagName) {
                                    var nodes = rootNode.getElementsByTagName(tagName);
                                    if (nodes && nodes.length)
                                        result = nodes[0].textContent
                                }
                                return result
                            };
                            GraceNoteService.prototype._getResponseAttributeValue = function(rootNode, tagName, attributeName, defaultValue) {
                                var result = defaultValue;
                                if (rootNode && rootNode.getElementsByTagName) {
                                    var nodes = rootNode.getElementsByTagName(tagName);
                                    if (nodes && nodes.length && nodes[0].getAttribute) {
                                        var attribute = nodes[0].getAttribute(attributeName);
                                        if (attribute)
                                            result = attribute
                                    }
                                }
                                return result
                            };
                            GraceNoteService.prototype._createDateOfBirthFromResult = function(dateOfBirth) {
                                if (dateOfBirth && dateOfBirth.indexOf("T") === -1)
                                    dateOfBirth += "T00:00";
                                return new Date(dateOfBirth)
                            };
                            GraceNoteService.factory = function() {
                                return new MS.Entertainment.Components.Video.Services.GraceNoteService
                            };
                            GraceNoteService._clientId = "5043456-342CC764E20FA10EAF0697D4E7F7601C";
                            GraceNoteService._shortClientId = GraceNoteService._clientId.substring(0, 7);
                            GraceNoteService._baseUrl = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_GraceNote);
                            GraceNoteService._defaultLanguageString = "eng";
                            return GraceNoteService
                        })();
                    Services.GraceNoteService = GraceNoteService
                })(Video.Services || (Video.Services = {}));
                var Services = Video.Services
            })(Components.Video || (Components.Video = {}));
            var Video = Components.Video
        })(Entertainment.Components || (Entertainment.Components = {}));
        var Components = Entertainment.Components
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
if (configurationManager.video.supportsGraceNote)
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.graceNoteService, MS.Entertainment.Components.Video.Services.GraceNoteService.factory)
})();
/* >>>>>>/viewmodels/video/castandcrewmodule.js:4711 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };

(function(MS) {
    (function(Entertainment) {
        (function(ViewModels) {
            var CastAndCrewModule = (function(_super) {
                    __extends(CastAndCrewModule, _super);
                    function CastAndCrewModule(mediaItem) {
                        _super.call(this, "castAndCrew");
                        this.mediaItem = mediaItem;
                        this._setProperty = Entertainment.Utilities.BindingAgnostic.setProperty
                    }
                    CastAndCrewModule.prototype._createHeaderAction = function() {
                        return null
                    };
                    CastAndCrewModule.prototype.isAvailable = function() {
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        return WinJS.Promise.as(featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.castAndCrew))
                    };
                    CastAndCrewModule.prototype.getItems = function() {
                        if (!this._getItemsPromise)
                            this._getItemsPromise = this.mediaItem.hydrate().then(function(mediaItem) {
                                if (mediaItem.contributors && mediaItem.contributors.length) {
                                    var hydrateOptions = {graceNoteImageSize: 1};
                                    var sortedContributors = mediaItem.contributors.sort(function(itemA, itemB) {
                                            var returnVal;
                                            if (!itemA && itemB)
                                                returnVal = 1;
                                            else if (itemA && !itemB)
                                                returnVal = -1;
                                            else if (!itemA && !itemB)
                                                returnVal = 0;
                                            else
                                                returnVal = CastAndCrewModule._castAndCrewKeys[itemA.role] - CastAndCrewModule._castAndCrewKeys[itemB.role];
                                            return returnVal
                                        });
                                    var hydratePromises = sortedContributors.slice(0, CastAndCrewModule.maxItemCount).map(function(item) {
                                            if (CastAndCrewModule._castAndCrewKeys[item.role] === CastAndCrewModule._castAndCrewKeys.Actor)
                                                item.isActor = true;
                                            item.showRole = !item.isActor && !!item.localizedRole;
                                            item.showCharacter = item.isActor && !!item.character;
                                            return item.hydrate(hydrateOptions)
                                        });
                                    return WinJS.Promise.join(hydratePromises)
                                }
                                return null
                            }).then(function(items) {
                                items = items || [];
                                items.forEach(function(item) {
                                    item.actionId = Entertainment.UI.Actions.ActionIdentifiers.searchResultsNavigate;
                                    item.actionParameter = {searchText: item.name}
                                });
                                return {items: items}
                            });
                        return this._getItemsPromise
                    };
                    CastAndCrewModule._castAndCrewKeys = {
                        Creator: 1, Director: 2, Actor: 3, Writer: 4
                    };
                    CastAndCrewModule.maxItemCount = 15;
                    return CastAndCrewModule
                })(ViewModels.ModuleBase);
            ViewModels.CastAndCrewModule = CastAndCrewModule
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/video_win/bundlesmodule.js:4792 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };

(function(MS) {
    (function(Entertainment) {
        (function(ViewModels) {
            Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
            var BundleItem = (function(_super) {
                    __extends(BundleItem, _super);
                    function BundleItem(mediaItem) {
                        this.mediaItem = mediaItem;
                        this.secondaryText = String.empty;
                        this._updateMediaItem(false);
                        this._updatePrimaryText();
                        this._mediaItemBinding = WinJS.Binding.bind(this.mediaItem, {bundleOffer: this._updateSecondaryText.bind(this)});
                        _super.call(this)
                    }
                    BundleItem.prototype.dispose = function() {
                        if (this._mediaItemBinding) {
                            this._mediaItemBinding.cancel();
                            this._mediaItemBinding = null
                        }
                        if (this._updateMediaItemPromise) {
                            this._updateMediaItemPromise.cancel();
                            this._updateMediaItemPromise = null
                        }
                    };
                    Object.defineProperty(BundleItem.prototype, "primaryText", {
                        get: function() {
                            return this._primaryText
                        }, set: function(value) {
                                this.updateAndNotify("primaryText", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BundleItem.prototype, "secondaryText", {
                        get: function() {
                            return this._secondaryText
                        }, set: function(value) {
                                this.updateAndNotify("secondaryText", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BundleItem.prototype, "languageText", {
                        get: function() {
                            return this._languageText
                        }, set: function(value) {
                                this.updateAndNotify("languageText", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BundleItem.prototype, "mediaItem", {
                        get: function() {
                            return this._mediaItem
                        }, set: function(value) {
                                this.updateAndNotify("mediaItem", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BundleItem.prototype, "ratingItem", {
                        get: function() {
                            return this._ratingItem
                        }, set: function(value) {
                                this.updateAndNotify("ratingItem", value)
                            }, enumerable: true, configurable: true
                    });
                    BundleItem.prototype._updatePrimaryText = function() {
                        if (this.mediaItem.isMovie)
                            if (this.mediaItem.primaryText)
                                this.primaryText = this.mediaItem.primaryText;
                            else
                                this.primaryText = String.empty;
                        else
                            this.primaryText = String.load(String.id.IDS_APP2_PAGE_TITLE_PRIMARY).format(this.mediaItem.seriesTitle, this.mediaItem.primaryText)
                    };
                    BundleItem.prototype._updateMediaItem = function(forceUpdate) {
                        var _this = this;
                        if (!this.mediaItem)
                            return;
                        if (this._updateMediaItemPromise) {
                            this._updateMediaItemPromise.cancel();
                            this._updateMediaItemPromise = null
                        }
                        var hydrateOptions = {isPartOfBundle: true};
                        var hydrateMediaItemPromise = WinJS.Promise.wrap();
                        if (forceUpdate && this.mediaItem.refresh)
                            hydrateMediaItemPromise = this.mediaItem.refresh(hydrateOptions);
                        else if (this.mediaItem.hydrate && !this.mediaItem.hydrated)
                            hydrateMediaItemPromise = this.mediaItem.hydrate(hydrateOptions);
                        this._updateMediaItemPromise = hydrateMediaItemPromise.then(function() {
                            var hydrateFirstEpisodePromise = WinJS.Promise.wrap();
                            if (MS.Entertainment.Platform.PlaybackHelpers.isTVSeason(_this.mediaItem) && _this.mediaItem.firstEpisode && _this.mediaItem.firstEpisode.hydrate && !_this.mediaItem.firstEpisode.hydrated)
                                hydrateFirstEpisodePromise = _this.mediaItem.firstEpisode.hydrate();
                            return hydrateFirstEpisodePromise
                        }).then(function() {
                            if (MS.Entertainment.Platform.PlaybackHelpers.isTVSeason(_this.mediaItem))
                                return MS.Entertainment.ViewModels.SmartBuyStateEngine.getMarketplaceFileAccessAsync(_this.mediaItem).then(function(stateInfo) {
                                        return WinJS.Promise.wrap(stateInfo && (stateInfo.hasPurchased > 0 || stateInfo.hasPurchasedSeason))
                                    });
                            else
                                return WinJS.Promise.wrap(_this.mediaItem.inCollection)
                        }).then(function(isOwned) {
                            if (_this._isOwned === null || _this._isOwned !== isOwned) {
                                _this._isOwned = isOwned;
                                _this._updateSecondaryText()
                            }
                            var ratingItemHydratePromise = WinJS.Promise.wrap();
                            if (MS.Entertainment.Platform.PlaybackHelpers.isTVSeason(_this.mediaItem) || MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(_this.mediaItem)) {
                                var seriesItem = MS.Entertainment.Utilities.convertMediaItemToTvSeries(_this.mediaItem);
                                ratingItemHydratePromise = seriesItem.hydrate().then(function(series) {
                                    _this.ratingItem = series
                                })
                            }
                            else
                                _this.ratingItem = _this.mediaItem;
                            return ratingItemHydratePromise
                        }).then(function() {
                            _this._updateMediaItemPromise = null
                        }, function(error) {
                            _this._updateMediaItemPromise = null;
                            if (!WinJS.Promise.isCanceledError(error))
                                return WinJS.Promise.wrapError(error);
                            return null
                        })
                    };
                    BundleItem.prototype._updateSecondaryText = function() {
                        if (this.mediaItem.isOwned)
                            this.secondaryText = String.load(String.id.IDS_VIDEO_IN_COLLECTION_LABEL);
                        else if (this.mediaItem.bundleOffer) {
                            var currentVideoDefinition = this.mediaItem.bundleOffer.videoDefinition;
                            var currentPrimaryAudioLanguage;
                            var variousLanguages = true;
                            if (this.mediaItem.bundleOffer.primaryAudioLanguage && this.mediaItem.bundleOffer.primaryAudioLanguage.toUpperCase() !== MS.Entertainment.Utilities.VARIOUS_LANGUAGES_CODE.toUpperCase()) {
                                currentPrimaryAudioLanguage = this.mediaItem.bundleOffer.primaryAudioLanguage;
                                variousLanguages = false
                            }
                            var isSeason = MS.Entertainment.Platform.PlaybackHelpers.isTVSeason(this.mediaItem);
                            var isMovie = MS.Entertainment.Platform.PlaybackHelpers.isMovie(this.mediaItem);
                            var selectedOffer = MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getDefaultBuyOffer(this.mediaItem, isSeason, currentVideoDefinition, currentPrimaryAudioLanguage);
                            if (!selectedOffer) {
                                var matchingOfferId;
                                var bundledItemOffers = this.mediaItem.bundleOffer.bundledItems;
                                for (var i = 0; i < bundledItemOffers.length; i++)
                                    if (bundledItemOffers[i].mid.toUpperCase() === this.mediaItem.zuneId.toUpperCase()) {
                                        matchingOfferId = bundledItemOffers[i].offerId;
                                        break
                                    }
                                var rights;
                                if (isMovie)
                                    rights = this.mediaItem.unfilteredRights;
                                else
                                    rights = this.mediaItem.rights;
                                if (matchingOfferId) {
                                    var matchingOffers = [];
                                    for (var i = 0; i < rights.length; i++) {
                                        var currentOffer = rights[i];
                                        if (currentOffer.offerId && currentOffer.offerId.toUpperCase() === matchingOfferId.toUpperCase())
                                            matchingOffers.push(currentOffer)
                                    }
                                }
                                if (matchingOffers && matchingOffers.length > 0) {
                                    var bundledMediaItem = this.mediaItem.clone();
                                    bundledMediaItem.rights = matchingOffers;
                                    selectedOffer = MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getDefaultBuyOffer(bundledMediaItem, isSeason, currentVideoDefinition, currentPrimaryAudioLanguage, true)
                                }
                            }
                            if (selectedOffer) {
                                this.secondaryText = MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getPriceString(selectedOffer);
                                if (selectedOffer.primaryAudioLanguage && variousLanguages)
                                    this.languageText = MS.Entertainment.Utilities.getDisplayLanguageFromLanguageCode(selectedOffer.primaryAudioLanguage);
                                else
                                    this.languageText = String.empty
                            }
                        }
                    };
                    return BundleItem
                })(Entertainment.UI.Framework.ObservableBase);
            ViewModels.BundleItem = BundleItem;
            var BundlesModule = (function(_super) {
                    __extends(BundlesModule, _super);
                    function BundlesModule(mediaItem) {
                        this._mediaItem = mediaItem;
                        var videoDetailsUiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.videoDetailsUiState);
                        MS.Entertainment.Utilities.addEventHandlers(videoDetailsUiStateService, {
                            videoDefinitionChange: this._onVideoDefinitionChanged.bind(this), videoLanguageChange: this._onVideoLanguageChange.bind(this)
                        });
                        this._selectedPurchaseDefinition = String.empty;
                        this._selectedPurchaseLanguage = String.empty;
                        _super.call(this, "itemsInBundle")
                    }
                    BundlesModule.prototype.dispose = function() {
                        if (this._videoPropertiesChangeEvents) {
                            this._videoPropertiesChangeEvents.cancel();
                            this._videoPropertiesChangeEvents = null
                        }
                    };
                    BundlesModule.prototype.isAvailable = function() {
                        return WinJS.Promise.wrap(this._mediaItem.isBundle)
                    };
                    BundlesModule.prototype.getItems = function() {
                        if (!this._getItemsPromise) {
                            var items = [];
                            this._updateBundledItemOfferIds();
                            if (this._mediaItem.bundledItems && this._mediaItem.bundledItems.length > 0)
                                for (var i = 0; i < this._mediaItem.bundledItems.length; i++) {
                                    var bundleItem = this._mediaItem.bundledItems[i];
                                    Trace.assert(bundleItem, "Bundled Item at index '{0}' in Bundle '{1}' with zuneId '{2}' is null".format(i, this._mediaItem.name, this._mediaItem.zuneId));
                                    if (bundleItem) {
                                        if (bundleItem.videoType === Microsoft.Entertainment.Queries.VideoType.movie)
                                            bundleItem.actionId = Entertainment.UI.Actions.ActionIdentifiers.navigateToVideoDetails;
                                        else
                                            bundleItem.actionId = Entertainment.UI.Actions.ActionIdentifiers.showImmersiveDetails;
                                        bundleItem.actionParameter = {
                                            data: bundleItem, viewModelParams: {
                                                    preferredLanguage: String.empty, preferredVideoResolution: String.empty
                                                }, showDetails: true
                                        };
                                        items.push(new BundleItem(bundleItem))
                                    }
                                }
                            this._getItemsPromise = WinJS.Promise.wrap({items: items})
                        }
                        return this._getItemsPromise
                    };
                    BundlesModule.prototype.setBundleInitialPreferredLanguage = function(preferredLanguage) {
                        this._selectedPurchaseLanguage = preferredLanguage;
                        if (this._mediaItem.bundledItems && this._mediaItem.bundledItems.length > 0)
                            this._mediaItem.bundledItems.forEach(function(mediaItem) {
                                if (mediaItem.actionParameter && mediaItem.actionParameter.viewModelParams)
                                    mediaItem.actionParameter.viewModelParams.preferredLanguage = preferredLanguage
                            })
                    };
                    BundlesModule.prototype.setBundleInitialPreferredVideoResolution = function(preferredVideoResolution) {
                        this._selectedPurchaseDefinition = preferredVideoResolution;
                        if (this._mediaItem.bundledItems && this._mediaItem.bundledItems.length > 0)
                            this._mediaItem.bundledItems.forEach(function(mediaItem) {
                                if (mediaItem.actionParameter && mediaItem.actionParameter.viewModelParams)
                                    mediaItem.actionParameter.viewModelParams.preferredVideoResolution = preferredVideoResolution
                            })
                    };
                    BundlesModule.prototype._onVideoDefinitionChanged = function(event) {
                        this.setBundleInitialPreferredVideoResolution(event.detail);
                        this._updateBundledItemOfferIds()
                    };
                    BundlesModule.prototype._onVideoLanguageChange = function(event) {
                        this.setBundleInitialPreferredLanguage(event.detail);
                        this._updateBundledItemOfferIds()
                    };
                    BundlesModule.prototype._updateBundledItemOfferIds = function() {
                        var buyOffer = MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getDefaultBuyOffer(this._mediaItem, false, this._selectedPurchaseDefinition, this._selectedPurchaseLanguage);
                        if (this._mediaItem.bundledItems && this._mediaItem.bundledItems.length && buyOffer)
                            for (var i = 0; i < this._mediaItem.bundledItems.length; i++) {
                                var item = this._mediaItem.bundledItems[i];
                                if (item)
                                    item.bundleOffer = buyOffer
                            }
                    };
                    return BundlesModule
                })(ViewModels.ModuleBase);
            ViewModels.BundlesModule = BundlesModule
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/video_win/rottentomatoesmodule.js:5065 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");

(function(MS) {
    (function(Entertainment) {
        (function(ViewModels) {
            var RottenTomatoesModule = (function(_super) {
                    __extends(RottenTomatoesModule, _super);
                    function RottenTomatoesModule(mediaItem) {
                        ViewModels.assert(mediaItem, "RottenTomatoesModule::ctor(): Invalid media item provided.");
                        this._mediaItem = mediaItem;
                        _super.call(this, "rottenTomatoes");
                        this.setHeaderSummaryInformation()
                    }
                    Object.defineProperty(RottenTomatoesModule.prototype, "summaryScoreIcon", {
                        get: function() {
                            return this._summaryScoreIcon
                        }, set: function(value) {
                                this.updateAndNotify("summaryScoreIcon", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(RottenTomatoesModule.prototype, "summaryScoreText", {
                        get: function() {
                            return this._summaryScoreText
                        }, set: function(value) {
                                this.updateAndNotify("summaryScoreText", value)
                            }, enumerable: true, configurable: true
                    });
                    RottenTomatoesModule.prototype.setHeaderSummaryInformation = function() {
                        var reviewScore = WinJS.Utilities.getMember("criticReview.reviewScore", this._mediaItem);
                        var reviewScoreCount = WinJS.Utilities.getMember("criticReview.reviewScoreCount", this._mediaItem);
                        if (reviewScore) {
                            this.summaryScoreText = reviewScore ? "{0}%".format(reviewScore) : null;
                            if (reviewScore >= 75 && reviewScoreCount >= 40)
                                this.summaryScoreIcon = RottenTomatoesModule.IconCertifiedFresh;
                            else if (reviewScore >= 60)
                                this.summaryScoreIcon = RottenTomatoesModule.IconFresh;
                            else
                                this.summaryScoreIcon = RottenTomatoesModule.IconRotten
                        }
                    };
                    RottenTomatoesModule.prototype.wrapItems = function(criticReviews) {
                        var _this = this;
                        if (criticReviews && criticReviews.length > 0)
                            criticReviews.forEach(function(currentReview) {
                                _this.setTomatoIcon(currentReview);
                                _this.setItemAction(currentReview);
                                _this.setMetadata(currentReview)
                            })
                    };
                    RottenTomatoesModule.prototype.setMetadata = function(criticReview) {
                        if (!criticReview)
                            return;
                        var details = [];
                        if (criticReview.publication)
                            details.push(criticReview.publication);
                        if (criticReview.date) {
                            var formatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).shortDate;
                            var date = new Date(criticReview.date);
                            var releaseDate = formatter.format(date);
                            details.push(releaseDate)
                        }
                        criticReview.metadata = details.join(String.load(String.id.IDS_DETAILS_INFO_SEPERATOR))
                    };
                    RottenTomatoesModule.prototype.setItemAction = function(criticReview) {
                        if (criticReview && criticReview.publicationUrl && MS.Entertainment.Utilities.verifyUrl(criticReview.publicationUrl)) {
                            criticReview.actionId = Entertainment.UI.Actions.ActionIdentifiers.externalNavigate;
                            criticReview.actionParameter = {link: criticReview.publicationUrl};
                            criticReview.automationId = Entertainment.UI.AutomationIds.externalRottenTomatoesLinkNavigate
                        }
                    };
                    RottenTomatoesModule.prototype.canShowReview = function(criticReview) {
                        if (!criticReview)
                            return false;
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        return (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.rottenTomatoes) && criticReview.criticName && criticReview.publication && criticReview.scoreDescription && criticReview.scoreDescription !== "none")
                    };
                    RottenTomatoesModule.prototype.setTomatoIcon = function(criticReview) {
                        if (!criticReview)
                            return;
                        switch (criticReview.scoreDescription) {
                            case"fresh":
                                criticReview.tomatoIcon = RottenTomatoesModule.IconFresh;
                                break;
                            case"rotten":
                                criticReview.tomatoIcon = RottenTomatoesModule.IconRotten;
                                break;
                            case"none":
                                criticReview.tomatoIcon = null;
                                break;
                            default:
                                Trace.fail("Unknown RottenTomatos ScoreDescription: " + criticReview.scoreDescription)
                        }
                    };
                    RottenTomatoesModule.prototype.getItems = function() {
                        var mediaReviews = WinJS.Utilities.getMember("_mediaItem.criticReview.criticReviews", this) || [];
                        if (mediaReviews && mediaReviews.length > 0) {
                            mediaReviews = mediaReviews.filter(this.canShowReview.bind(this));
                            this.wrapItems(mediaReviews)
                        }
                        return WinJS.Promise.as({items: mediaReviews})
                    };
                    RottenTomatoesModule.prototype._createHeaderAction = function(args) {
                        var externalNavigationAction = null;
                        var websiteUrl = WinJS.Utilities.getMember("_mediaItem.criticReview.url", this);
                        if (websiteUrl && MS.Entertainment.Utilities.verifyUrl(websiteUrl)) {
                            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                            externalNavigationAction = actionService.getAction(Entertainment.UI.Actions.ActionIdentifiers.externalNavigate);
                            externalNavigationAction.parameter = websiteUrl;
                            externalNavigationAction.automationId = Entertainment.UI.AutomationIds.externalRottenTomatoesLinkNavigate;
                            externalNavigationAction.title = String.load(String.id.IDS_APP1_MODULE_VIEW_ALL)
                        }
                        return externalNavigationAction
                    };
                    RottenTomatoesModule.IconCertifiedFresh = "/images/ThirdParty/ico_RottenTomatoes_CertifiedFresh." + MS.Entertainment.Utilities.getPackageImageFileExtension();
                    RottenTomatoesModule.IconFresh = "/images/ThirdParty/ico_RottenTomatoes_Fresh." + MS.Entertainment.Utilities.getPackageImageFileExtension();
                    RottenTomatoesModule.IconRotten = "/images/ThirdParty/ico_RottenTomatoes_Rotten." + MS.Entertainment.Utilities.getPackageImageFileExtension();
                    return RottenTomatoesModule
                })(ViewModels.ModuleBase);
            ViewModels.RottenTomatoesModule = RottenTomatoesModule
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/viewmodels/video_win/moviedetailsviewmodel.js:5203 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };

(function(MS) {
    (function(Entertainment) {
        (function(ViewModels) {
            (function(MovieDetailsModuleKeys) {
                MovieDetailsModuleKeys[MovieDetailsModuleKeys["similarMoviesModule"] = 0] = "similarMoviesModule";
                MovieDetailsModuleKeys[MovieDetailsModuleKeys["castAndCrewModule"] = 1] = "castAndCrewModule";
                MovieDetailsModuleKeys[MovieDetailsModuleKeys["rottenTomatoesModule"] = 2] = "rottenTomatoesModule";
                MovieDetailsModuleKeys[MovieDetailsModuleKeys["bundlesModule"] = 3] = "bundlesModule"
            })(ViewModels.MovieDetailsModuleKeys || (ViewModels.MovieDetailsModuleKeys = {}));
            var MovieDetailsModuleKeys = ViewModels.MovieDetailsModuleKeys;
            var MovieDetailsViewModel = (function(_super) {
                    __extends(MovieDetailsViewModel, _super);
                    function MovieDetailsViewModel(mediaItem, initialPreferences) {
                        Trace.assert(mediaItem, "MovieDetailsViewModel::ctor(): Invalid media item provided.");
                        this.mediaItem = mediaItem;
                        this._marketplaceEvents = MS.Entertainment.Utilities.addEventHandlers(Microsoft.Entertainment.Marketplace.Marketplace, {mediarightchanged: this._onMediaRightChanged.bind(this)});
                        var signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        this._signinEvents = MS.Entertainment.Utilities.addEventHandlers(signInService, {isSignedInChanged: this._onSigninChanged.bind(this)});
                        _super.call(this, initialPreferences)
                    }
                    MovieDetailsViewModel.create = function(mediaItem, initialPreferences) {
                        if (!mediaItem || !MS.Entertainment.Platform.PlaybackHelpers.isMovie(mediaItem)) {
                            Trace.fail("Could not create MovieDetailsViewModel!");
                            return WinJS.Promise.wrapError(new Error("Could not create MovieDetailsViewModel!"))
                        }
                        return new MovieDetailsViewModel(mediaItem, initialPreferences)
                    };
                    MovieDetailsViewModel.prototype.dispose = function() {
                        if (this._refreshBundlePagePromise) {
                            this._refreshBundlePagePromise.cancel();
                            this._refreshBundlePagePromise = null
                        }
                        if (this._marketplaceEvents) {
                            this._marketplaceEvents.cancel();
                            this._marketplaceEvents = null
                        }
                        if (this._signinEvents) {
                            this._signinEvents.cancel();
                            this._signinEvents = null
                        }
                        _super.prototype.dispose.call(this)
                    };
                    Object.defineProperty(MovieDetailsViewModel.prototype, "similarMovies", {
                        get: function() {
                            return this.modules && this.modules[0]
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MovieDetailsViewModel.prototype, "castAndCrew", {
                        get: function() {
                            return this.modules && this.modules[1]
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MovieDetailsViewModel.prototype, "rottenTomatoes", {
                        get: function() {
                            return this.modules && this.modules[2]
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MovieDetailsViewModel.prototype, "itemsInBundle", {
                        get: function() {
                            return this.modules && this.modules[3]
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MovieDetailsViewModel.prototype, "primaryHeaderButtons", {
                        get: function() {
                            return this._primaryHeaderButtons
                        }, set: function(value) {
                                this.updateAndNotify("primaryHeaderButtons", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MovieDetailsViewModel.prototype, "secondaryHeaderButtons", {
                        get: function() {
                            return this._secondaryHeaderButtons
                        }, set: function(value) {
                                this.updateAndNotify("secondaryHeaderButtons", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MovieDetailsViewModel.prototype, "studio", {
                        get: function() {
                            return this._studio
                        }, set: function(value) {
                                this.updateAndNotify("studio", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(MovieDetailsViewModel.prototype, "expirationString", {
                        get: function() {
                            return this._expirationString
                        }, set: function(val) {
                                this.updateAndNotify("expirationString", val)
                            }, enumerable: true, configurable: true
                    });
                    MovieDetailsViewModel.prototype._initializeModules = function() {
                        this.modules = [ViewModels.VideoModuleFactory.createSimilarMoviesModule(this.mediaItem), new ViewModels.CastAndCrewModule(this.mediaItem), new ViewModels.RottenTomatoesModule(this.mediaItem), new ViewModels.BundlesModule(this.mediaItem)]
                    };
                    MovieDetailsViewModel.prototype._getExpirationStringCallback = function(spanInMilliseconds, expirationTickTimer) {
                        this._expirationTickTimer = expirationTickTimer;
                        this.expirationString = MS.Entertainment.Formatters.formatRentalExpirationFromSpanInt(spanInMilliseconds, true)
                    };
                    MovieDetailsViewModel.prototype._getSmartBuyEngineButtons = function() {
                        return MS.Entertainment.ViewModels.SmartBuyButtons.getVideoDetailsButtons(this.mediaItem, MS.Entertainment.UI.Actions.ExecutionLocation.canvas)
                    };
                    MovieDetailsViewModel.prototype._getSmartBuyEngineEventHandler = function() {
                        var _this = this;
                        return function(engine, stateInfo) {
                                var getStatePromise;
                                if (_this._smartBuyStateEngine)
                                    getStatePromise = _this._smartBuyStateEngine.onVideoVerticalDetailsStateChanged(stateInfo).then(function(buttonState) {
                                        _this._refreshPurchaseDetailsString(stateInfo);
                                        var rentalExpirations = WinJS.Utilities.getMember("marketplace.rentalExpirations", stateInfo);
                                        var rentalIsExpired = WinJS.Utilities.getMember("overall.isExpired", rentalExpirations);
                                        var rentalLatestDate = WinJS.Utilities.getMember("overall.latestDate", rentalExpirations);
                                        if (rentalExpirations && rentalExpirations.length && (rentalLatestDate || rentalIsExpired)) {
                                            if (_this._expirationTickTimer) {
                                                window.clearTimeout(_this._expirationTickTimer);
                                                _this._expirationTickTimer = null
                                            }
                                            MS.Entertainment.UI.RentalExpirationService.getExpirationString(_this.mediaItem, rentalLatestDate, _this._getExpirationStringCallback.bind(_this))
                                        }
                                        else
                                            _this.expirationString = String.empty;
                                        return buttonState
                                    });
                                return WinJS.Promise.as(getStatePromise)
                            }
                    };
                    MovieDetailsViewModel.prototype._refreshDetailString = function() {
                        if (!this.mediaItem)
                            return;
                        _super.prototype._refreshDetailsStrings.call(this);
                        var movie = this.mediaItem;
                        this.studio = movie.studios ? MS.Entertainment.Formatters.formatGenresListNonConverter(movie.studios) : String.empty
                    };
                    MovieDetailsViewModel.prototype._refreshPurchaseDetailsString = function(stateInfo) {
                        if (!stateInfo)
                            return;
                        var distributionType = WinJS.Utilities.getMember("_smartBuyStateEngine.buttons.buy.parameter.offer.distributionType", this);
                        if (distributionType && distributionType !== MS.Entertainment.Data.Augmenter.Marketplace.edsOfferDistributionType.presale)
                            return;
                        else {
                            var presaleMetadata = Entertainment.Formatters.formatMoviePresaleMetadata(this.mediaItem, stateInfo);
                            this.mediaItemPurchaseDetails = (presaleMetadata && presaleMetadata.title) ? String.load(String.id.IDS_VIDEO_DETAILS_COMMERCE_HEADER_FORMAT).format(presaleMetadata.title, presaleMetadata.text) : String.empty
                        }
                    };
                    MovieDetailsViewModel.prototype._reloadFilteredModules = function(){};
                    MovieDetailsViewModel.prototype._updateFilterDetails = function(){};
                    MovieDetailsViewModel.prototype._onButtonsChanged = function() {
                        if (!this.disposed && this._smartBuyStateEngine) {
                            this.primaryHeaderButtons = this._smartBuyStateEngine.getCurrentButtonsForLocation(ViewModels.VideoDetailsActionLocations.primaryHeader);
                            this.secondaryHeaderButtons = this._smartBuyStateEngine.getCurrentButtonsForLocation(ViewModels.VideoDetailsActionLocations.secondaryHeader)
                        }
                    };
                    MovieDetailsViewModel.prototype._onSigninChanged = function(isSignedIn) {
                        var _this = this;
                        if (this.disposed || !this.mediaItem)
                            return;
                        var movieItem = this.mediaItem;
                        if (!movieItem.isBundle)
                            return;
                        if (this._refreshBundlePagePromise) {
                            this._refreshBundlePagePromise.cancel();
                            this._refreshBundlePagePromise = null
                        }
                        this._refreshBundlePagePromise = WinJS.Promise.timeout(100).then(function() {
                            return _this.mediaItem.refresh()
                        }).then(function() {
                            return _this._smartBuyStateEngine.updateState()
                        })
                    };
                    MovieDetailsViewModel.prototype._onMediaRightChanged = function(serviceMediaId) {
                        var _this = this;
                        if (this.disposed || !this.mediaItem || !Entertainment.Utilities.isMovie(this.mediaItem))
                            return;
                        var movieItem = this.mediaItem;
                        if (!movieItem || !movieItem.isBundle || !movieItem.bundledItems)
                            return;
                        var checkAllBundledItemsPromises = movieItem.bundledItems.map(function(bundledItem) {
                                return MS.Entertainment.ViewModels.SmartBuyStateEngine.mediaContainsServiceMediaIdAsync(bundledItem, serviceMediaId).then(function(containsServiceId) {
                                        return !_this.disposed && !!_this.mediaItem && containsServiceId
                                    })
                            });
                        WinJS.Promise.join(checkAllBundledItemsPromises).done(function(results) {
                            for (var i = 0; i < results.length; i++)
                                if (results[i] && _this.mediaItem && _this.mediaItem.refresh) {
                                    if (_this._refreshBundlePagePromise) {
                                        _this._refreshBundlePagePromise.cancel();
                                        _this._refreshBundlePagePromise = null
                                    }
                                    _this._refreshBundlePagePromise = WinJS.Promise.timeout(100).then(function() {
                                        return _this.mediaItem.refresh()
                                    });
                                    break
                                }
                        })
                    };
                    return MovieDetailsViewModel
                })(ViewModels.VideoDetailsViewModelBase);
            ViewModels.MovieDetailsViewModel = MovieDetailsViewModel
        })(Entertainment.ViewModels || (Entertainment.ViewModels = {}));
        var ViewModels = Entertainment.ViewModels
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
})();
/* >>>>>>/controls/video_win/moviedetails.js:5419 */
(function() {
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };

(function(MS) {
    (function(Entertainment) {
        (function(UI) {
            (function(Controls) {
                var MovieDetails = (function(_super) {
                        __extends(MovieDetails, _super);
                        function MovieDetails(element, options) {
                            _super.call(this, element, options);
                            MS.Entertainment.UI.Framework.processDeclarativeControlContainer(this)
                        }
                        MovieDetails.prototype.onFooterLinkClicked = function(event) {
                            var foundElement = this.domElement.querySelector(".videoDetails-footer");
                            if (foundElement && MS.Entertainment.Utilities.isInvocationEvent(event))
                                foundElement.scrollIntoView()
                        };
                        MovieDetails.selectTemplate = function(item) {
                            var templateProvider = null;
                            var templateId = "";
                            if (item.mediaItem.isMovie)
                                templateId = ".templateid-movieInBundle";
                            else
                                templateId = ".templateid-tvSeriesInBundle";
                            var template = document.querySelector(templateId);
                            if (template && template.winControl)
                                templateProvider = template.winControl;
                            return WinJS.Promise.wrap(templateProvider)
                        };
                        MovieDetails.getItemSize = function(item) {
                            var itemSize = null;
                            if (item.mediaItem.isMovie)
                                itemSize = MS.Entertainment.UI.Controls.MovieDetails.movieItemSize;
                            else
                                itemSize = MS.Entertainment.UI.Controls.MovieDetails.tvItemSize;
                            return WinJS.Promise.wrap(itemSize)
                        };
                        MovieDetails.isDeclarativeControlContainer = true;
                        MovieDetails.movieItemSize = 160;
                        MovieDetails.tvItemSize = 160;
                        return MovieDetails
                    })(Controls.PageViewBase);
                Controls.MovieDetails = MovieDetails
            })(UI.Controls || (UI.Controls = {}));
            var Controls = UI.Controls
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.MovieDetails);
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.MovieDetails.selectTemplate);
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.MovieDetails.getItemSize)
})();
