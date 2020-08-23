/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/ViewModels/MediaItemModel.js", "/Components/Immersive/Shared/BaseImmersiveSummary.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {MovieImmersiveOverviewSummary: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.BaseImmersiveOverviewSummary", "/Components/Immersive/Video/MovieImmersiveTemplates.html#ImmersiveOverview", function immersiveOverview() {
            this._appbarService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar)
        }, {
            _buttons: null, _mediaContext: null, _appbarService: null, _bindings: null, expirationTickTimer: null, usesSmartBuyStateEngine: true, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.BaseImmersiveOverviewSummary.prototype.initialize.apply(this, arguments);
                    if (this.dataContext.showButtons)
                        if (this.dataContext.mediaItem.videoType === Microsoft.Entertainment.Queries.VideoType.movie) {
                            var onRentalStateRetrieved = function onRentalStateRetrieved(stateInfo) {
                                    if (MS.Entertainment.Utilities.isVideoApp)
                                        if (stateInfo && stateInfo.marketplace && stateInfo.marketplace.rentalExpirations && stateInfo.marketplace.rentalExpirations.length > 0 && (stateInfo.marketplace.rentalExpirations.overall.latestDate || stateInfo.marketplace.rentalExpirations.overall.isExpired)) {
                                            if (this.expirationTickTimer) {
                                                window.clearTimeout(this.expirationTickTimer);
                                                this.expirationTickTimer = null
                                            }
                                            MS.Entertainment.UI.RentalExpirationService.getExpirationString(this.dataContext.mediaItem, stateInfo.marketplace.rentalExpirations.overall.latestDate, this.getExpirationStringCallback.bind(this))
                                        }
                                        else
                                            this.dataContext.expirationString = String.empty
                                }.bind(this);
                            if (this.smartBuyStateEngine) {
                                var onSmartBuyStateChanged = function onSmartBuyStateChanged(stateInfo) {
                                        onRentalStateRetrieved(stateInfo);
                                        return MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.prototype.onVideoDetailsTwoButtonStateChanged.apply(this, arguments)
                                    };
                                this.smartBuyStateEngine.initialize(this.dataContext.mediaItem, MS.Entertainment.ViewModels.SmartBuyButtons.getVideoDetailsButtons(this.dataContext.mediaItem, MS.Entertainment.UI.Actions.ExecutionLocation.canvas), onSmartBuyStateChanged)
                            }
                            else
                                MS.Entertainment.ViewModels.SmartBuyStateEngine.queryMediaStateAsync(this.dataContext.mediaItem).then(function queryMediaStateAsync_complete(stateInfo) {
                                    onRentalStateRetrieved(stateInfo)
                                }.bind(this))
                        }
                    if (this.dataContext.mediaItem && this.dataContext.mediaItem.hasServiceId && MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.fileTransfer)) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        fileTransferService.registerListener(MS.Entertainment.UI.Controls.MovieImmersiveOverviewSummary._downloadMovieNotificationListenerId, function getTaskKey(task) {
                            return (this.dataContext && this.dataContext.mediaItem && task.libraryTypeId === Microsoft.Entertainment.Queries.ObjectType.video && task.libraryId === this.dataContext.mediaItem.libraryId) ? task.libraryId : null
                        }.bind(this), this.dataContext.mediaItem, MS.Entertainment.UI.FileTransferNotifiers.genericFile);
                        MS.Entertainment.UI.FileTransferService.pulseAsync(this.dataContext.mediaItem)
                    }
                    this._mediaContext = this._appbarService.pushMediaContext(this.dataContext.mediaItem, null, null, {executeLocation: MS.Entertainment.UI.Actions.ExecutionLocation.canvas});
                    if (this.smartBuyStateEngine)
                        this._bindings = WinJS.Binding.bind(this.smartBuyStateEngine, {currentAppbarActions: this._updateAppBar.bind(this)});
                    this.movieOverviewMetadata = this.formatMovieOverviewMetadata(this.dataContext.mediaItem);
                    this.ratingControlDisabled = MS.Entertainment.Utilities.isApp2;
                    this.displayStarRatingControl = MS.Entertainment.Utilities.isApp2;
                    this.displayActionButtons = !MS.Entertainment.Utilities.isVideoApp2;
                    this._waitForActionsReadyOrTimeout().done(function actionsReady() {
                        this.visible = true;
                        if (this.dataContext.visibleSignal)
                            WinJS.Binding.unwrap(this.dataContext.visibleSignal).complete();
                        WinJS.Promise.timeout(1000).done(function() {
                            if (MS.Entertainment.Utilities.isVideoApp2) {
                                var event = document.createEvent("Event");
                                event.initEvent("contentready", true, false);
                                this.domElement.dispatchEvent(event)
                            }
                        }.bind(this))
                    }.bind(this))
                }, _waitForActionsReadyOrTimeout: function _waitForActionsReadyOrTimeout() {
                    var previousFramePromise = this.dataContext.previousSignal ? WinJS.Binding.unwrap(this.dataContext.previousSignal).promise : WinJS.Promise.wrap();
                    var promises = [previousFramePromise];
                    var movieButtons = WinJS.Utilities.getMember("_buttons.domElement", this);
                    if (movieButtons && this.smartBuyStateEngine)
                        promises.push(MS.Entertainment.Utilities.waitForDomEvent("ActionsReady", movieButtons));
                    return WinJS.Promise.any([WinJS.Promise.join(promises), WinJS.Promise.timeout(2000)])
                }, unload: function unload() {
                    if (this.smartBuyStateEngine) {
                        this.smartBuyStateEngine.unload();
                        this.smartBuyStateEngine = null
                    }
                    if (this._mediaContext) {
                        this._mediaContext.clearContext();
                        this._mediaContext = null
                    }
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    if (this.expirationTickTimer) {
                        window.clearTimeout(this.expirationTickTimer);
                        this.expirationTickTimer = null
                    }
                    MS.Entertainment.UI.Controls.BaseImmersiveOverviewSummary.prototype.unload.call(this)
                }, freeze: function overview_freeze() {
                    if (this._mediaContext) {
                        this._mediaContext.clearContext();
                        this._mediaContext = null
                    }
                    MS.Entertainment.UI.Controls.BaseImmersiveOverviewSummary.prototype.freeze.call(this)
                }, thaw: function overview_thaw() {
                    MS.Entertainment.UI.Controls.BaseImmersiveOverviewSummary.prototype.thaw.call(this);
                    this._mediaContext = this._appbarService.pushMediaContext(this.dataContext.mediaItem, null, null, {executeLocation: MS.Entertainment.UI.Actions.ExecutionLocation.canvas});
                    if (this.smartBuyStateEngine)
                        this._mediaContext.setToolbarActions(this.smartBuyStateEngine.currentAppbarActions)
                }, getExpirationStringCallback: function getExpirationStringCallback(spanInMilliseconds, expirationTickTimer) {
                    this.expirationTickTimer = expirationTickTimer;
                    this.dataContext.expirationString = MS.Entertainment.Formatters.formatRentalExpirationFromSpanInt(spanInMilliseconds, true)
                }, _createSmartBuyStateEngine: function _createSmartBuyStateEngine() {
                    return new MS.Entertainment.ViewModels.VideoSmartBuyStateEngine
                }, _updateAppBar: function _updateAppBar(newValue, oldValue) {
                    if ((oldValue === undefined || this.smartBuyStateEngine) && this._mediaContext)
                        this._mediaContext.setToolbarActions(newValue)
                }, formatMovieOverviewMetadata: function formatMovieOverviewMetadata(sourceValue) {
                    var result = String.empty;
                    if (sourceValue) {
                        var parts = [];
                        if (sourceValue.releaseDate)
                            parts.push(MS.Entertainment.Formatters.formatYearFromDateNonConverter(sourceValue.releaseDate));
                        if (sourceValue.genre)
                            parts.push(MS.Entertainment.Formatters.formatGenresListNonConverter(sourceValue.genre));
                        if (sourceValue.studioName)
                            parts.push(sourceValue.studioName);
                        else if (sourceValue.studios && sourceValue.studios.length > 0 && sourceValue.studios[0].name)
                            parts.push(sourceValue.studios[0].name);
                        var languages = MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getLanguagesForRights(sourceValue, MS.Entertainment.Utilities.defaultClientTypeFromApp);
                        if (languages && languages.length === 1)
                            parts.push(String.load(String.id.IDS_DETAILS_AUDIO_LANGUAGE).format(MS.Entertainment.Utilities.getDisplayLanguageFromLanguageCode(languages[0])));
                        if (sourceValue.rating)
                            parts.push(sourceValue.rating);
                        if (sourceValue.duration)
                            parts.push(MS.Entertainment.Formatters.formatDurationFromDateNonConverter(sourceValue.duration));
                        result = parts.join(String.load(String.id.IDS_DETAILS_INFO_SEPERATOR))
                    }
                    return result
                }
        }, {
            movieOverviewMetadata: String.empty, visible: false, displayStarRatingControl: false, displayActionButtons: false, ratingControlDisabled: false
        }, {
            _downloadMovieNotificationListenerId: "MovieImmersiveOverviewSummary", cssSelectors: {starRatingControl: '.movie .overview .ratingContainer .control-starRating:not(.disabled) .mediaRatingControl'}
        })})
})()
