/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function(undefined) {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Pages", {BaseInlineDetails: MS.Entertainment.UI.Framework.defineUserControl(null, function baseInlineDetails(element, options) {
            this.media = this.media || {};
            this.mediaBindings = [];
            this._listBindings = []
        }, {
            inlineExtraData: null, allowShare: true, _loadedButtons: false, _shareOperation: null, _overlay: null, _listLoadingControlPromise: null, _listBindings: null, _disableActionsOnListSelection: false, _errorPanelShown: false, _focusOverriden: false, controlName: "BaseInlineDetails", LOADING_PANEL_SHOW_DELAY: 500, LIST_LOADING_SHOW_DELAY: 1500, initialize: function initialize() {
                    this.bind("isLoading", function() {
                        if (!this.fragmentContainer)
                            return;
                        if (!this.isLoading) {
                            var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                            if (!this.isFailed) {
                                eventProvider.traceGalleryControl_InLine_Open_End();
                                if (this.failedControl)
                                    MS.Entertainment.Utilities.hideElement(this.failedControl);
                                if (this.loadingContainer)
                                    MS.Entertainment.Utilities.hideElement(this.loadingContainer).then(function showContent() {
                                        var showPromise = MS.Entertainment.Utilities.showElement(this.fragmentContainer);
                                        this._fragmentContainerShown();
                                        return showPromise
                                    }.bind(this)).then(this._raiseContentReady.bind(this));
                                else {
                                    var showPromise = MS.Entertainment.Utilities.showElement(this.fragmentContainer);
                                    this._fragmentContainerShown();
                                    showPromise.then(this._raiseContentReady.bind(this)).done(function() {
                                        if (!this._focusOverriden)
                                            MS.Entertainment.UI.Framework.focusFirstInSubTree(this.domElement)
                                    }.bind(this))
                                }
                            }
                            else
                                eventProvider.traceGalleryControl_InLine_Open_Error()
                        }
                        else if (this.loadingContainer) {
                            WinJS.Promise.timeout(this.LOADING_PANEL_SHOW_DELAY).then(function _delay() {
                                if (this.isLoading)
                                    MS.Entertainment.Utilities.showElement(this.loadingContainer)
                            }.bind(this));
                            MS.Entertainment.Utilities.hideElement(this.fragmentContainer)
                        }
                    }.bind(this));
                    this.isLoading = true
                }, unload: function unload() {
                    this._releaseMedia();
                    this.hideListLoadingControl();
                    this._clearListBindings();
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, setOverlay: function setOverlay(overlay) {
                    this._overlay = overlay
                }, showListLoadingControl: function showLoadingControl(delay) {
                    if (this._listLoadingControlPromise) {
                        this._listLoadingControlPromise.cancel();
                        this._listLoadingControlPromise = null
                    }
                    if (this.listLoadingContainer)
                        this._listLoadingControlPromise = WinJS.Promise.timeout(delay ? delay : this.LIST_LOADING_SHOW_DELAY).then(function showProgressRing() {
                            var ring = document.createElement("progress");
                            var ringSize = MS.Entertainment.Utilities.isApp2 ? "win-large" : "win-medium";
                            ring.className = ringSize + " win-ring";
                            this.listLoadingContainer.appendChild(ring);
                            WinJS.Utilities.removeClass(this.listLoadingContainer, "removeFromDisplay");
                            this._listLoadingControlPromise = null
                        }.bind(this), function onError(){})
                }, hideListLoadingControl: function hideLoadingControl() {
                    if (this._listLoadingControlPromise) {
                        this._listLoadingControlPromise.cancel();
                        this._listLoadingControlPromise = null
                    }
                    if (this.listLoadingContainer) {
                        MS.Entertainment.Utilities.empty(this.listLoadingContainer);
                        WinJS.Utilities.addClass(this.listLoadingContainer, "removeFromDisplay")
                    }
                }, _releaseMedia: function _releaseMedia() {
                    this._unshareModel();
                    this._clearMediaBindings()
                }, _clearListBindings: function _clearListBindings() {
                    for (var i = 0; i < this._listBindings.length; i++)
                        if (this._listBindings[i])
                            this._listBindings[i].cancel();
                    this._listBindings = []
                }, _clearMediaBindings: function _clearMediaBindings() {
                    for (var i = 0; i < this.mediaBindings.length; i++)
                        if (this.mediaBindings[i])
                            this.mediaBindings[i].cancel();
                    this.mediaBindings = []
                }, _getLists: function _getLists() {
                    if (!this.domElement)
                        return [];
                    var lists = WinJS.Utilities.query("[data-win-control='MS.Entertainment.UI.Controls.GalleryControl']", this.domElement) || [];
                    lists = lists.map(function mapListItem(item) {
                        return item.winControl ? item.winControl : item
                    });
                    if (lists.length <= 0 && this._list)
                        lists = [this._list];
                    return lists
                }, _removeComplete: function removeComplete(eventArgs) {
                    var removed = eventArgs.detail && eventArgs.detail.deleted;
                    var removedMedia = eventArgs.detail && eventArgs.detail.removedItem;
                    if (removed && this.media && this.media.isEqual && this.media.isEqual(removedMedia))
                        if (this._overlay)
                            this._overlay.hide()
                }, _clearSelection: function _clearSelection() {
                    var lists = this._getLists();
                    lists.forEach(function(list) {
                        list.clearSelection()
                    })
                }, _clearInvocation: function _clearInvocation() {
                    var lists = this._getLists();
                    lists.forEach(function(list) {
                        if (list && list.invocationHelper)
                            list.invocationHelper.clearInvocation()
                    })
                }, _shareModel: function _shareModel() {
                    if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.shareSender))
                        return;
                    var sender = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareSender);
                    if (this.media && this.allowShare) {
                        this._unshareModel();
                        try {
                            this._shareOperation = sender.pendingShare(this.media)
                        }
                        catch(e) {
                            this._shareOperation = null
                        }
                    }
                }, _unshareModel: function _unshareModel() {
                    if (this._shareOperation) {
                        this._shareOperation.cancel();
                        this._shareOperation = null
                    }
                }, _setMedia: function _setMedia(media) {
                    var platLog;
                    var dataPoint;
                    if (media) {
                        if (media.serviceType === MS.Entertainment.Data.Augmenter.ServiceTypes.editorialItem)
                            media = MS.Entertainment.Utilities.convertEditorialItem(media);
                        MS.Entertainment.Utilities.Telemetry.logPopoverShown(MS.Entertainment.UI.AutomationIds.showPopover, media)
                    }
                    this._releaseMedia();
                    this.media = media;
                    if (!this.isLoading)
                        this._shareModel()
                }, _showPanel: function showPanel(noDelay) {
                    if (noDelay)
                        this.isLoading = false;
                    else
                        WinJS.Promise.timeout().then(function updateStatus() {
                            this.isLoading = false
                        }.bind(this))
                }, _hidePanel: function showPanel(noDelay) {
                    if (noDelay)
                        this.isLoading = true;
                    else
                        WinJS.Promise.timeout().then(function updateStatus() {
                            this.isLoading = true
                        }.bind(this))
                }, _showElement: function showElement(element, visibility) {
                    if (element)
                        if (visibility)
                            WinJS.Utilities.removeClass(element, "inlineDetailsHidden");
                        else
                            WinJS.Utilities.addClass(element, "inlineDetailsHidden")
                }, _fragmentContainerShown: function _fragmentContainerShown(){}, _raiseContentReady: function _raiseContentReady() {
                    var readyEvent = document.createEvent("Event");
                    readyEvent.initEvent("DetailsReady", true, true);
                    this.domElement.dispatchEvent(readyEvent)
                }
        }, {
            isLoading: true, isFailed: false, media: null, mediaBindings: null
        })});
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Pages");
    WinJS.Namespace.define("MS.Entertainment.Pages", {BaseMediaInlineDetails: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.BaseInlineDetails", null, function baseInlineDetails(element, options) {
            this.smartBuyStateEngine = null;
            this._appBarService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar);
            this._appbarEventHandlers = {deleteMedia: this._removeComplete.bind(this)}
        }, {
            controlName: "BaseMediaInlineDetails", blockErrorPanel: false, _mediaContext: null, _appBarService: null, _appbarEventHandlers: null, _isOnline: false, _currentButtonsBinding: null, _enableCurrentButtonsBinding: false, initialize: function initialize() {
                    MS.Entertainment.Pages.BaseInlineDetails.prototype.initialize.call(this);
                    switch (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).networkStatus) {
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unknown:
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unrestricted:
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.throttled:
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.onDemand:
                            this._isOnline = true;
                            break;
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.localOnly:
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none:
                            this._isOnline = false;
                            if (this._showErrorPanel)
                                this._handleError();
                            break
                    }
                    this._setMedia(this.media);
                    if (this._disableActionsOnListSelection)
                        this._createListSelectionBindings()
                }, _createListSelectionBindings: function _createListSelectionBindings() {
                    var lists = this._getLists();
                    var selectedIndicesChangedCallback = this._selectedIndicesChanged.bind(this);
                    this._clearListBindings();
                    lists.forEach(function(list) {
                        var binding = WinJS.Binding.bind(list, {selectedIndices: selectedIndicesChangedCallback});
                        this._listBindings.push(binding)
                    }.bind(this))
                }, _selectedIndicesChanged: function _selectedIndicesChanged(newValue, oldValue) {
                    this._updateButtonStates(newValue, oldValue)
                }, _updateButtonStates: function _updateButtonStates(newValue, oldValue) {
                    if (oldValue === undefined)
                        return;
                    var enableActions = !Array.isArray(newValue) || newValue.length === 0;
                    var popoverButtons = (this._actionsPanel.currentButtons && this._actionsPanel.currentButtons.getArray()) || [];
                    for (var i = 0; i < popoverButtons.length; i++)
                        popoverButtons[i].isEnabled = enableActions
                }, _releaseSmartButtons: function _releaseSmartButtons() {
                    if (this.smartBuyStateEngine) {
                        this.smartBuyStateEngine.unload();
                        this.smartBuyStateEngine = null
                    }
                    if (this._mediaContext) {
                        this._mediaContext.clearContext();
                        this._mediaContext = null
                    }
                }, _releaseMedia: function _releaseMedia() {
                    MS.Entertainment.Pages.BaseInlineDetails.prototype._releaseMedia.apply(this, arguments);
                    if (MS.Entertainment.UI.Controls.UserFeedbackDialog)
                        MS.Entertainment.UI.Controls.UserFeedbackDialog.inlineDetailsItem = null;
                    if (this._enableCurrentButtonsBinding)
                        this._clearCurrentButtonsBinding();
                    this._releaseSmartButtons()
                }, _setMedia: function _setMedia(media) {
                    if (this._unloaded)
                        return;
                    MS.Entertainment.Pages.BaseInlineDetails.prototype._setMedia.apply(this, arguments);
                    media = this.media;
                    MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(this.media);
                    if (MS.Entertainment.UI.Controls.UserFeedbackDialog)
                        MS.Entertainment.UI.Controls.UserFeedbackDialog.inlineDetailsItem = this;
                    var lists = this._getLists();
                    var mediaContext;
                    if (lists.length || !this.smartBuyStateEngine) {
                        mediaContext = this._appBarService.pushMediaContext(media, this._appbarEventHandlers, null, {executeLocation: MS.Entertainment.UI.Actions.ExecutionLocation.popover});
                        mediaContext.collectionFilter = this.collectionFilter || Microsoft.Entertainment.Platform.MediaAvailability.available
                    }
                    this._initializeLists(lists, mediaContext);
                    if (!this.smartBuyStateEngine) {
                        this._mediaContext = mediaContext;
                        this.smartBuyStateEngine = this._createSmartBuyStateEngine();
                        this.mediaBindings.push(WinJS.Binding.bind(this.smartBuyStateEngine, {currentAppbarActions: this._setAppbarActions.bind(this)}))
                    }
                    if (this._enableCurrentButtonsBinding)
                        this._setCurrentButtonsBinding()
                }, _createSmartBuyStateEngine: function _createSmartBuyStateEngine() {
                    return new MS.Entertainment.ViewModels.SmartBuyStateEngine
                }, _setCurrentButtonsBinding: function _setCurrentButtonsBinding() {
                    this._loadedButtons = false;
                    this._clearCurrentButtonsBinding();
                    if (this.smartBuyStateEngine)
                        this._currentButtonsBinding = WinJS.Binding.bind(this.smartBuyStateEngine, {currentButtons: this._onButtonsChanged.bind(this)})
                }, _clearCurrentButtonsBinding: function _clearCurrentButtonsBinding() {
                    if (this._currentButtonsBinding) {
                        this._currentButtonsBinding.cancel();
                        this._currentButtonsBinding = null
                    }
                }, _onButtonsChanged: function _onButtonsChanged(newButtons, oldButtons) {
                    if (this._unloaded || !newButtons || newButtons.length === 0 || !this._currentButtonsBinding)
                        return;
                    if (!this._loadedButtons) {
                        this._buttonChangedHandler();
                        this._loadedButtons = true
                    }
                    this._setActionButtonFocusOverrides(newButtons.length)
                }, _setActionButtonFocusOverrides: function _setActionButtonFocusOverrides(actionButtonsLength) {
                    if (MS.Entertainment.Utilities.isMusicApp2) {
                        var noOp = ".currentPage :focus";
                        var actionButtons = document.querySelectorAll(".actions .win-focusable");
                        for (var i = 0; i < actionButtons.length; i++)
                            actionButtons[i].removeAttribute("data-win-focus");
                        if (actionButtonsLength === 1)
                            actionButtons[0].setAttribute("data-win-focus", JSON.stringify({
                                up: noOp, down: noOp
                            }));
                        else if (actionButtonsLength > 1) {
                            actionButtons[0].setAttribute("data-win-focus", JSON.stringify({up: noOp}));
                            actionButtons[actionButtonsLength - 1].setAttribute("data-win-focus", JSON.stringify({down: noOp}))
                        }
                    }
                }, _initializeLists: function _initializeLists(lists, mediaContext) {
                    if (lists)
                        lists.forEach(function initializeList(list) {
                            if (list) {
                                if (MS.Entertainment.ViewModels.SmartAppbarActions && MS.Entertainment.ViewModels.SmartAppbarActions.setDefaultGalleryEventHandlers)
                                    list.addSelectionHandlers(MS.Entertainment.ViewModels.SmartAppbarActions.setDefaultGalleryEventHandlers(this._clearSelection.bind(this), this._removeComplete.bind(this)));
                                if (list.invocationHelper) {
                                    var clearInvocation = this._clearInvocation.bind(this);
                                    list.invocationHelper.addInvocationHandlers({deleteMedia: clearInvocation})
                                }
                                list.mediaContext = mediaContext
                            }
                        }, this)
                }, _showCollectionFilter: function _showCollectionFilter() {
                    var stringId;
                    if (this._unloaded)
                        return;
                    switch (this.collectionFilter) {
                        case Microsoft.Entertainment.Platform.MediaAvailability.availableOffline:
                            stringId = String.id.IDS_DETAILS_FILTER_AVAILABLE_OFFLINE;
                            break;
                        case Microsoft.Entertainment.Platform.MediaAvailability.availableFromCloud:
                            stringId = String.id.IDS_DETAILS_FILTER_IN_CLOUD;
                            break;
                        default:
                            break
                    }
                    if (stringId) {
                        var action = new MS.Entertainment.UI.Actions.Action;
                        action.automationId = MS.Entertainment.UI.AutomationIds.collectionFilterLink;
                        action.canExecute = function canExecute() {
                            return true
                        };
                        action.executed = function executed() {
                            if (this._unloaded)
                                return;
                            this.collectionFilter = null;
                            if (this._mediaContext)
                                this._mediaContext.collectionFilter = null;
                            var lists = this._getLists();
                            lists.forEach(function clearLists(list) {
                                if (list.mediaContext && list.mediaContext.collectionFilter)
                                    list.mediaContext.collectionFilter = null;
                                list.dataSource = null
                            });
                            this.showListLoadingControl();
                            this._onClearedFilters();
                            if (this._collectionFilterText)
                                WinJS.Utilities.addClass(this._collectionFilterText, "removeFromDisplay");
                            if (this._collectionFilterLink)
                                WinJS.Utilities.addClass(this._collectionFilterLink.domElement, "removeFromDisplay")
                        }.bind(this);
                        if (this._collectionFilterText) {
                            this._collectionFilterText.textContent = String.load(stringId);
                            WinJS.Utilities.removeClass(this._collectionFilterText, "removeFromDisplay")
                        }
                        if (this._collectionFilterLink) {
                            this._collectionFilterLink.action = action;
                            WinJS.Utilities.removeClass(this._collectionFilterLink.domElement, "removeFromDisplay")
                        }
                    }
                }, _onClearedFilters: function _onClearedFilters() {
                    MS.Entertainment.Pages.fail("called by _showCollectionFilter. Should be overridden")
                }, _setAppbarActions: function _setAppbarActions(newValue, oldValue) {
                    if (!this._unloaded && this._mediaContext)
                        this._mediaContext.setToolbarActions(this.smartBuyStateEngine ? this.smartBuyStateEngine.currentAppbarActions : null)
                }, _formatDurationString: function formatDetailString(value) {
                    var duration = String.empty;
                    if (value && value !== -1)
                        duration = MS.Entertainment.Utilities.formatTimeString(value);
                    return duration
                }, _hydrateMediaIfPossible: function _hydrateMediaIfPossible() {
                    if (this.media.hasServiceId)
                        return this._hydrateMedia();
                    else {
                        this._handleHydrateCompleted();
                        return WinJS.Promise.wrap()
                    }
                }, _hydrateMedia: function _hydrateMedia() {
                    var hydratePromise;
                    if (this.media.hydrate && !this._errorPanelShown) {
                        var hydrateOptions = {
                                forceUpdate: this.media.isFailed, listenForDBUpdates: true
                            };
                        hydratePromise = this.media.hydrate(hydrateOptions).then(this._handleHydrateCompleted.bind(this), this._handleError.bind(this));
                        var binding = WinJS.Binding.bind(this.media, {isFailed: this._handleIsFailedChanged.bind(this)});
                        this.mediaBindings.push(binding)
                    }
                    else {
                        this._handleHydrateCompleted();
                        hydratePromise = WinJS.Promise.wrap()
                    }
                    return hydratePromise
                }, _handleIsFailedChanged: function _handleIsFailedChanged() {
                    if (this._unloaded || !this.media)
                        return;
                    if (this.media.isFailed && !this.media.hydrated)
                        this._handleError()
                }, _handleHydrateCompleted: function _handleHydrateCompleted() {
                    this._shareModel();
                    this._showPanel();
                    this._onHydrateCompleted()
                }, _onHydrateCompleted: function _onHydrateCompleted(){}, _showErrorPanel: {get: function _showErrorPanel() {
                        return this._shouldShowErrorPanel()
                    }}, _shouldShowErrorPanel: function _shouldShowErrorPanel() {
                    return (!this.media.inCollection && !this.blockErrorPanel && !this.isFailed)
                }, _handleError: function _handleError() {
                    if (this._showErrorPanel) {
                        this.isFailed = true;
                        this.isLoading = false;
                        this._errorPanelShown = true;
                        if (this.loadingContainer)
                            MS.Entertainment.Utilities.hideElement(this.loadingContainer);
                        if (this.fragmentContainer)
                            MS.Entertainment.Utilities.hideElement(this.fragmentContainer);
                        if (this.failedControl)
                            MS.Entertainment.Utilities.showElement(this.failedControl);
                        var newControl = document.createElement("div");
                        newControl.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.FailedPanel");
                        this.failedControl.appendChild(newControl);
                        WinJS.UI.process(newControl)
                    }
                    else
                        this._showPanel()
                }
        }, {
            originalLocation: null, detailString: null, smartBuyStateEngine: null, showStreamingStatus: false, streamingStatusText: null, collectionFilter: null, collectionFilterText: String.empty
        }, {Location: {
                collection: MS.Entertainment.Data.ItemLocation.collection, marketplace: MS.Entertainment.Data.ItemLocation.marketplace
            }})})
})()
