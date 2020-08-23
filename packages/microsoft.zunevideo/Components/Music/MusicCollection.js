/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Pages", {
        MusicCollection: MS.Entertainment.UI.Framework.defineUserControl(null, function musicCollectionConstructor(element, options) {
            var gallery = document.createElement("div");
            gallery.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.GalleryControl");
            gallery.className = "collectionMusicGalleryView collectionMusic collectionGallery";
            this._galleryView = new MS.Entertainment.UI.Controls.GalleryControl(gallery, {
                tap: MS.Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly, selectionMode: MS.Entertainment.UI.Controls.GalleryControl.SelectionMode.multi, templateSelectorConstructor: MS.Entertainment.Pages.MusicCollectionGalleryItemTemplateSelector, swipeBehavior: MS.Entertainment.UI.Controls.GalleryControl.swipeBehavior.select, focusFirstItemOnPageLoad: true, selectionStyleFilled: true
            });
            element.appendChild(gallery)
        }, {
            _viewModel: null, _galleryView: null, _songClickedHandler: null, _artistClickedHandler: null, _currentClickHandler: null, _selectedSong: null, _bindings: null, _uiStateBindings: null, _viewModelEvents: null, _appBarService: null, view: null, canZoom: {get: function() {
                        return this._galleryView && this._galleryView.canZoom
                    }}, isZoomReady: {get: function() {
                        return this._galleryView && this._galleryView.isZoomReady
                    }}, isZoomedOut: {
                    get: function() {
                        return this._galleryView && this._galleryView.isZoomedOut
                    }, set: function(newValue) {
                            if (this._galleryView) {
                                this._galleryView.isZoomedOut = newValue;
                                this.updateAndNotify("isZoomedOut", newValue)
                            }
                        }
                }, initialize: function initialize() {
                    var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    this._appBarService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar);
                    this.domElement.addEventListener("galleryFirstPageRendered", function galleryFirstPageRender() {
                        MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioAppLaunchToCollection();
                        MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioCollectionGalleryRequestToLoad()
                    });
                    this._songClickedHandler = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(this._songClicked, this);
                    this._bindings = WinJS.Binding.bind(this, {
                        dataContext: this._initializePage.bind(this), _galleryView: {
                                canZoom: function notifyCanZoom(newValue) {
                                    this.notify("canZoom", newValue, false)
                                }.bind(this), isZoomedOut: function setIsZoomedOut(newValue) {
                                        this.updateAndNotify("isZoomedOut", newValue)
                                    }.bind(this)
                            }
                    });
                    this._uiStateBindings = WinJS.Binding.bind(uiState, {networkStatus: this._onNetworkStatusChanged.bind(this)});
                    var updateGallery = this._updateGallery.bind(this);
                    var clearSelection = this._clearSelection.bind(this);
                    var removeItem = this._removeItemCompleted.bind(this);
                    var defaultSelectionHandlers = MS.Entertainment.ViewModels.SmartAppbarActions.setDefaultGalleryEventHandlers(clearSelection, removeItem);
                    this._galleryView.addSelectionHandlers(defaultSelectionHandlers);
                    this._galleryView.addSelectionHandlers({
                        createNewPlaylist: updateGallery, renamePlaylist: updateGallery, deleteMedia: removeItem, findAlbumInfo: clearSelection
                    })
                }, unload: function unload() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._binding = null
                    }
                    if (this._uiStateBindings) {
                        this._uiStateBindings.cancel();
                        this._uiStateBindings = null
                    }
                    if (this._galleryView)
                        this._galleryView.clearSelectionHandlers();
                    this._disposeViewModel();
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, freeze: function freeze() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    if (this._selectedSong) {
                        var control = this._selectedSong.querySelector("[data-win-control], .ent-control").winControl;
                        control.expand(this._selectedSong);
                        control.panelClickHandler = this._inPlacePanelClick.bind(this);
                        control.domElement.addEventListener("click", control.panelClickHandler, false)
                    }
                }, _disposeViewModel: function _disposeViewModel() {
                    if (this._viewModel)
                        this._viewModel.dispose();
                    if (this._viewModelEvents) {
                        this._viewModelEvents.cancel();
                        this._viewModelEvents = null
                    }
                }, _setClickHandler: function setClickHandler(handler) {
                    if (this._currentClickHandler)
                        this._galleryView.domElement.removeEventListener("iteminvoked", this._currentClickHandler);
                    this._currentClickHandler = handler;
                    this._galleryView.domElement.addEventListener("iteminvoked", this._currentClickHandler, false)
                }, _initializePage: function initializePage() {
                    if (!this.dataContext)
                        return;
                    this._disposeViewModel();
                    this._viewModel = this.dataContext.viewModel;
                    this._viewModel.view = this.view;
                    this._initializeGalleryView();
                    this._viewModelEvents = MS.Entertainment.Utilities.addEventHandlers(this._viewModel, {
                        itemsChanged: this._viewModelDataChanged.bind(this), isFailedChanged: this._viewModelFailedChanged.bind(this), notificationsChanged: this._onNotificationsChanged.bind(this)
                    });
                    this._viewModelDataChanged()
                }, _initializeGalleryView: function initializeGalleryView() {
                    var node = this._viewModel.selectedTemplate;
                    this._galleryView.queryToPause = null;
                    this._galleryView.mediaType = this.view;
                    this._galleryView.emptyGalleryTemplate = node.emptyGalleryTemplate || "Controls/GalleryControl.html#listViewEmptyGalleryWithNotificationsTemplate";
                    this._galleryView.emptyGalleryModel = new MS.Entertainment.UI.Controls.DefaultFailedPanelModel;
                    this.dataContext.hideShadow = node.hideShadow
                }, _viewModelFailedChanged: function _viewModelFailedChanged() {
                    if (this._viewModel && this._viewModel.errorModel)
                        MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement, true, this._viewModel.errorModel)
                }, _viewModelDataChanged: function viewModelDataChanged() {
                    if (!this._viewModel.items || !this._viewModel.isCurrentQuery())
                        return;
                    var node = this._viewModel.selectedTemplate;
                    if (node.headerTemplate)
                        this._galleryView.headerTemplate = node.headerTemplate;
                    else
                        this._galleryView.headerTemplate = null;
                    if (node.panelTemplate) {
                        this._galleryView.panelTemplate = node.panelTemplate ? node.panelTemplate : null;
                        this._galleryView.panelOptions = node.panelOptions ? node.panelOptions : null;
                        this._galleryView.itemSize = node.itemSize ? node.itemSize : null;
                        this._galleryView.slotSize = node.slotSize ? node.slotSize : null
                    }
                    else {
                        this._galleryView.panelTemplate = null;
                        this._galleryView.panelOptions = null;
                        this._galleryView.itemSize = null;
                        this._galleryView.slotSize = null
                    }
                    this._galleryView.headerType = node.headerType || MS.Entertainment.UI.Controls.GalleryControl.HeaderType.auto;
                    this._galleryView.invokeBehavior = node.invokeBehavior || MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.popOver;
                    this._galleryView.actionOptions = node.actionOptions || null;
                    this._galleryView.invokeHelperFactory = node.invokeHelperFactory || null;
                    this._updateEmptyModel();
                    this._galleryView.itemTemplate = node.template;
                    this._galleryView.zoomedOutTemplate = node.zoomedOutTemplate;
                    this._galleryView.actionTemplate = node.actionTemplate;
                    this._galleryView.itemClass = node.itemClass || null;
                    this._galleryView.headerClass = node.headerClass || null;
                    this._galleryView.layout = node.layout || MS.Entertainment.UI.Controls.GalleryControl.Layout.grid;
                    this._galleryView.tap = node.tap || MS.Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly;
                    this._galleryView.headerPosition = node.groupHeaderPosition || null;
                    this._galleryView.forceInteractive = node.forceInteractive || false;
                    this._galleryView.grouperItemThreshold = node.grouperItemThreshold;
                    this._updateMinimumListLength();
                    this._galleryView.userGatedGallery = node.userGatedGallery || false;
                    this._galleryView.userGatedGalleryTemplate = node.userGatedGalleryTemplate || "Controls/GalleryControl.html#listViewEmptyGalleryWithNotificationsTemplate";
                    this._updateUserGatedModel();
                    this._galleryView.syncScreen = node.syncScreen || false;
                    this._galleryView.syncScreenTemplate = node.syncScreenTemplate || null;
                    this._updateSyncScreenModel();
                    this._galleryView.restoreFocusOnDataChanges = node.restoreFocusOnDataChanges || false;
                    this._galleryView.backdropColor = node.backdropColor;
                    this._galleryView.selectionHelperOptions = node.selectionHelperOptions || null;
                    this._galleryView.allowSelectAll = node.allowSelectAll || false;
                    this._galleryView.allowHeaders = node.allowHeaders === undefined ? true : node.allowHeaders;
                    this._galleryView.allowZoom = node.allowZoom || false;
                    this._galleryView.maxSelectionCount = node.maxSelectionCount;
                    if (!this._galleryView.mediaContext)
                        this._galleryView.mediaContext = this._appBarService.pushDefaultContext();
                    var clonedQuery = this._viewModel.cloneCurrentQuery();
                    if (clonedQuery)
                        clonedQuery.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.collection, Microsoft.Entertainment.Platform.AcquisitionContextType.playAll);
                    this._galleryView.mediaContext.containingMedia = {
                        playbackItemSource: clonedQuery, playbackOffset: 0
                    };
                    var collectionFilter = this._getCollectionFilter();
                    this._galleryView.mediaContext.collectionFilter = collectionFilter;
                    this._galleryView.mediaContext.setToolbarActions(node.getAppBarActions ? node.getAppBarActions() : []);
                    if (node.grouped || (node.grouperType && node.allowZoom)) {
                        this._galleryView.grouperType = node.grouperType;
                        this._galleryView.grouper.keyPropertyName = node.grouperField;
                        this._galleryView.grouper.parentKeyPropertyName = node.grouperParentKeyPropertyName;
                        this._galleryView.grouper.titlePropertyName = node.grouperTitlePropertyName;
                        this._galleryView.grouper.useKeyAsData = (node.grouperKeyAsData !== undefined) ? node.grouperKeyAsData : true
                    }
                    else
                        this._galleryView.grouperType = null;
                    if (this._currentGalleryClass) {
                        WinJS.Utilities.removeClass(this._galleryView.domElement, this._currentGalleryClass);
                        this._currentGalleryClass = String.empty
                    }
                    if (node.galleryClass) {
                        WinJS.Utilities.addClass(this._galleryView.domElement, node.galleryClass);
                        this._currentGalleryClass = node.galleryClass
                    }
                    this._galleryView.queryToPause = this._viewModel.pausableQuery;
                    this._galleryView.dataSource = this._viewModel.items;
                    if (collectionFilter && collectionFilter !== Microsoft.Entertainment.Platform.MediaAvailability.available)
                        WinJS.Utilities.addClass(this._galleryView.domElement, "collectionFiltered");
                    else
                        WinJS.Utilities.removeClass(this._galleryView.domElement, "collectionFiltered");
                    this._selectedSong = null;
                    this._inPlacePanelAnimating = false
                }, _getCollectionFilter: function _getCollectionFilter() {
                    var collectionFilter;
                    var selectedFilter;
                    if (this._viewModel && this._viewModel.filterSelectionManager)
                        selectedFilter = WinJS.Binding.unwrap(this._viewModel.filterSelectionManager.selectedItem);
                    if (selectedFilter && selectedFilter.value && selectedFilter.value.queryOptions)
                        collectionFilter = selectedFilter.value.queryOptions.mediaAvailability;
                    return collectionFilter
                }, _onNetworkStatusChanged: function _onNetworkStatusChanged() {
                    if (this._uiStateBindings)
                        this._updateEmptyModel()
                }, _onNotificationsChanged: function _onNotificationsChanged() {
                    if (this._viewModelEvents) {
                        this._updateMinimumListLength();
                        this._updateEmptyModel()
                    }
                }, _updateMinimumListLength: function _updateMinimumListLength() {
                    var notifications = this._viewModel.createNotificationActionCells ? this._viewModel.createNotificationActionCells() : null;
                    var numNotifications = (notifications && notifications.length) || 0;
                    this._galleryView.minimumListLength = numNotifications + this._viewModel.selectedTemplate.minimumListLength
                }, _updateEmptyModel: function _updateEmptyModel() {
                    if (!this._viewModel.items || !this._viewModel.isCurrentQuery())
                        return;
                    var titleId;
                    var descriptionId;
                    var details;
                    switch (this._viewModel._view) {
                        case MS.Entertainment.ViewModels.MusicCollection.ViewTypes.playlists:
                            titleId = String.id.IDS_PLAYLIST_NO_CONTENT_TITLE;
                            details = this._getEmptyPlaylistCollectionDetails();
                            break;
                        case MS.Entertainment.ViewModels.MusicCollection.ViewTypes.smartDJs:
                            titleId = String.id.IDS_RADIO_EMPTY_GALLERY_TITLE;
                            details = MS.Entertainment.Pages.MusicCollection.getEmptySmartDJCollectionDetails();
                            break;
                        case MS.Entertainment.ViewModels.MusicCollection.ViewTypes.playlists2:
                            titleId = String.id.IDS_MUSIC2_PLAYLISTS_GALLERY_EMPTY_TITLE;
                            descriptionId = String.id.IDS_MUSIC2_PLAYLISTS_GALLERY_EMPTY_DESC;
                            details = this._getEmptyPlaylistCollectionDetails();
                            break;
                        case MS.Entertainment.ViewModels.MusicCollection.ViewTypes.musicVideos:
                            titleId = String.id.IDS_MUSIC2_COLLECTION_MUSIC_VIDEOS_EMPTY_TITLE;
                            descriptionId = String.id.IDS_MUSIC2_COLLECTION_MUSIC_VIDEOS_EMPTY_DESC;
                            details = this._getEmptyCollectionDetails();
                            break;
                        default:
                            if (MS.Entertainment.Utilities.isMusicApp1)
                                titleId = String.id.IDS_COLLECTION_MUSIC_EMPTY;
                            else {
                                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                                if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.cloudCollectionV2Enabled))
                                    switch (this._viewModel._lastUsedFilterItem.id) {
                                        case MS.Entertainment.ViewModels.MusicCollectionAutomationIds.collectionFilterAll:
                                            titleId = String.id.IDS_MUSIC2_COLLECTION_EMPTY_TITLE_CLOUDV2_ALL;
                                            break;
                                        case MS.Entertainment.ViewModels.MusicCollectionAutomationIds.collectionFilterRoamsViaCloud:
                                            titleId = String.id.IDS_COLLECTION_MUSIC_EMPTY;
                                            break;
                                        case MS.Entertainment.ViewModels.MusicCollectionAutomationIds.collectionFilterRoamsViaCloudDrive:
                                        default:
                                            titleId = String.id.IDS_MUSIC2_COLLECTION_EMPTY_TITLE_CLOUDV2;
                                            break
                                    }
                                else
                                    titleId = String.id.IDS_MUSIC2_COLLECTION_EMPTY_TITLE
                            }
                            descriptionId = MS.Entertainment.Utilities.isMusicApp1 ? null : String.id.IDS_MUSIC2_COLLECTION_EMPTY_DESC;
                            details = this._getEmptyCollectionDetails();
                            break
                    }
                    var filter = this._getCollectionFilter();
                    if (filter && filter !== Microsoft.Entertainment.Platform.MediaAvailability.available)
                        details = details.concat(this._getEmptyFilteredDetails());
                    var notifications = this._viewModel.createNotificationActionCells ? this._viewModel.createNotificationActionCells() : null;
                    if (this._galleryView && this._galleryView.emptyGalleryModel) {
                        this._galleryView.emptyGalleryModel.primaryStringId = titleId;
                        this._galleryView.emptyGalleryModel.secondaryStringId = descriptionId;
                        this._galleryView.emptyGalleryModel.details = details;
                        this._galleryView.emptyGalleryModel.notifications = notifications
                    }
                }, _getEmptyCollectionDetails: function _getEmptyCollectionDetails() {
                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                    var details = [];
                    var filter = this._getCollectionFilter();
                    if (MS.Entertainment.Utilities.isMusicApp1 && filter !== Microsoft.Entertainment.Platform.MediaAvailability.availableFromCloud) {
                        var onMoreAboutLibrariesAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.showLocalGrovelInfoDialog);
                        details = [{
                                stringId: String.id.IDS_COLLECTION_MUSIC_EMPTY_2, linkStringId: String.id.IDS_COLLECTION_MUSIC_MORE_LIBRARIES_LINK, linkAction: onMoreAboutLibrariesAction, linkIcon: MS.Entertainment.UI.Icon.search
                            }]
                    }
                    var isMusicMarketplaceNetworkEnabled = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace);
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    if (isMusicMarketplaceNetworkEnabled && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace)) {
                        var navigateToMusicMarketplace = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
                        navigateToMusicMarketplace.parameter = MS.Entertainment.UI.Monikers.musicMarketplace;
                        if (MS.Entertainment.Utilities.isMusicApp1)
                            details.push({
                                stringId: String.id.IDS_MUSIC_COLLECTION_EMPTY_DESC, linkStringId: String.id.IDS_COLLECTION_MUSIC_EMPTY_LINK, linkAction: navigateToMusicMarketplace, linkIcon: MS.Entertainment.UI.Icon.flexhub
                            });
                        else {
                            details.push({
                                linkStringId: String.id.IDS_MUSIC2_BROWSE_CATALOG_BUTTON_VUI_GUI, linkAction: navigateToMusicMarketplace, linkIcon: MS.Entertainment.UI.Icon.flexhub, voicePhrase: String.load(String.id.IDS_MUSIC2_BROWSE_CATALOG_BUTTON_VUI_ALM), voicePhoneticPhrase: String.load(String.id.IDS_MUSIC2_BROWSE_CATALOG_BUTTON_VUI_PRON), voiceConfidence: String.load(String.id.IDS_MUSIC2_BROWSE_CATALOG_BUTTON_VUI_CONF)
                            });
                            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.cloudCollectionV2Enabled)) {
                                var learnMoreAction = new MS.Entertainment.UI.Actions.Action;
                                learnMoreAction.automationId = MS.Entertainment.UI.AutomationIds.dashboardHomeUpsellPanelLearnMore;
                                learnMoreAction.canExecute = function canExecute(params) {
                                    return true
                                };
                                learnMoreAction.executed = function executed() {
                                    var cloudCollectionV2Url = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_CloudCollectionV2);
                                    Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(cloudCollectionV2Url))
                                };
                                details.push({
                                    linkStringId: String.id.IDS_MUSIC2_CLOUDV2_INFO_BUTTON_VUI_GUI, linkAction: learnMoreAction, linkIcon: MS.Entertainment.UI.Icon.flexhub, voicePhrase: String.load(String.id.IDS_MUSIC2_CLOUDV2_INFO_BUTTON_VUI_ALM), voicePhoneticPhrase: String.load(String.id.IDS_MUSIC2_CLOUDV2_INFO_BUTTON_VUI_PRON), voiceConfidence: String.load(String.id.IDS_MUSIC2_CLOUDV2_INFO_BUTTON_VUI_CONF)
                                })
                            }
                        }
                    }
                    return details
                }, _getEmptyPlaylistCollectionDetails: function _getEmptyPlaylistCollectionDetails() {
                    var details = [];
                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                    var createPlaylistAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.createPlaylist);
                    createPlaylistAction.automationId = MS.Entertainment.UI.AutomationIds.collectionCreatePlaylist;
                    if (MS.Entertainment.Utilities.isMusicApp1) {
                        details.push({
                            stringId: String.id.IDS_PLAYLIST_CREATE_PLAYLIST_DESC_TEXT, linkStringId: String.id.IDS_PLAYLIST_CREATE_PLAYLIST_LINK, linkAction: createPlaylistAction, linkIcon: WinJS.UI.AppBarIcon.add
                        });
                        var importPlaylistsAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.importPlaylists);
                        importPlaylistsAction.automationId = MS.Entertainment.UI.AutomationIds.collectionImportPlaylist;
                        details.push({
                            stringId: String.id.IDS_PLAYLIST_IMPORT_EXISTING_PLAYLIST_DESC_TEXT, linkStringId: String.id.IDS_PLAYLIST_IMPORT_EXISTING_PLAYLIST_LINK, linkAction: importPlaylistsAction, linkIcon: WinJS.UI.AppBarIcon.importall
                        })
                    }
                    else {
                        details.push({
                            linkStringId: String.id.IDS_PLAYLIST_GALLERY_ACTION_BUTTON_VUI_GUI, linkAction: createPlaylistAction, linkIcon: WinJS.UI.AppBarIcon.add, voicePhrase: String.load(String.id.IDS_PLAYLIST_GALLERY_ACTION_BUTTON_VUI_ALM), voicePhoneticPhrase: String.load(String.id.IDS_PLAYLIST_GALLERY_ACTION_BUTTON_VUI_PRON), voiceConfidence: String.load(String.id.IDS_PLAYLIST_GALLERY_ACTION_BUTTON_VUI_CONF)
                        });
                        var navigateToMusicMarketplace = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
                        navigateToMusicMarketplace.parameter = MS.Entertainment.UI.Monikers.musicMarketplace;
                        details.push({
                            linkStringId: String.id.IDS_MUSIC2_BROWSE_CATALOG_BUTTON_VUI_GUI, linkAction: navigateToMusicMarketplace, linkIcon: MS.Entertainment.UI.Icon.flexhub, voicePhrase: String.load(String.id.IDS_MUSIC2_BROWSE_CATALOG_BUTTON_VUI_ALM), voicePhoneticPhrase: String.load(String.id.IDS_MUSIC2_BROWSE_CATALOG_BUTTON_VUI_PRON), voiceConfidence: String.load(String.id.IDS_MUSIC2_BROWSE_CATALOG_BUTTON_VUI_CONF)
                        })
                    }
                    return details
                }, _getEmptyFilteredDetails: function _getEmptyFilteredDetails() {
                    var clearFilterAction = new MS.Entertainment.UI.Actions.Action;
                    clearFilterAction.automationId = MS.Entertainment.UI.AutomationIds.collectionEmptyShowAllMusicLink;
                    clearFilterAction.canExecute = function canExecute() {
                        return true
                    };
                    clearFilterAction.executed = function executed() {
                        if (this._viewModel && this._viewModel.clearFilter)
                            this._viewModel.clearFilter()
                    }.bind(this);
                    return [{
                                stringId: String.id.IDS_COLLECTION_FILTER_MUSIC_EMPTY_TEXT, linkStringId: String.id.IDS_COLLECTION_FILTER_MUSIC_EMPTY_LINK, linkAction: clearFilterAction, linkIcon: WinJS.UI.AppBarIcon.filter
                            }]
                }, _updateUserGatedModel: function _updateUserGatedModel() {
                    if (this._galleryView && this._galleryView.userGatedGallery) {
                        var titleId;
                        var descriptionId;
                        var details;
                        switch (this._viewModel._view) {
                            case MS.Entertainment.ViewModels.MusicCollection.ViewTypes.playlists2:
                                titleId = String.id.IDS_MUSIC2_PLAYLISTS_GALLERY_EMPTY_TITLE;
                                descriptionId = String.id.IDS_MUSIC2_PLAYLISTS_GALLERY_GATED_DESC;
                                details = this._getUserGatedMusic2PlaylistCollectionDetails();
                                this._galleryView.userGatedGalleryModel = new MS.Entertainment.UI.Controls.DefaultFailedPanelModel;
                                break;
                            case MS.Entertainment.ViewModels.MusicCollection.ViewTypes.newlyAdded:
                            case MS.Entertainment.ViewModels.MusicCollection.ViewTypes.musicVideos:
                                titleId = String.id.IDS_MUSIC2_COLLECTION_GATED_TITLE;
                                descriptionId = String.id.IDS_MUSIC2_COLLECTION_GATED_DESC;
                                details = this._getUserGatedMusic2CollectionDetails();
                                this._galleryView.userGatedGalleryModel = new MS.Entertainment.UI.Controls.FailedPanelWithQueryModel;
                                this._galleryView.userGatedGalleryModel.query = this._createRecentAlbumsQuery();
                                this._galleryView.userGatedGalleryModel.itemTemplate = "/Components/Shell/Music2WelcomeDialog.html#welcomeDialogAlbumTemplate";
                                break;
                            default:
                                MS.Entertainment.Pages.fail("Unsupported user gated view: " + this._viewModel._view);
                                break
                        }
                        this._galleryView.userGatedGalleryModel.primaryStringId = titleId;
                        this._galleryView.userGatedGalleryModel.secondaryStringId = descriptionId;
                        this._galleryView.userGatedGalleryModel.details = details;
                        this._galleryView.userGatedGalleryModel.className = MS.Entertainment.Pages.MusicCollection.userGatedClass
                    }
                }, _updateSyncScreenModel: function _updateSyncScreenModel() {
                    if (this._galleryView && this._galleryView.syncScreen) {
                        var titleId;
                        var descriptionId;
                        var action;
                        switch (this._viewModel._view) {
                            case MS.Entertainment.ViewModels.MusicCollection.ViewTypes.playlists2:
                                titleId = String.id.IDS_MUSIC2_PLAYLISTS_SYNC_TITLE;
                                descriptionId = String.id.IDS_MUSIC2_PLAYLISTS_SYNC_DESC;
                                action = this._createSyncWaitAction(this._viewModel._view);
                                this._galleryView.syncScreenModel = new MS.Entertainment.UI.Controls.DefaultFailedPanelModel;
                                break;
                            case MS.Entertainment.ViewModels.MusicCollection.ViewTypes.newlyAdded:
                            case MS.Entertainment.ViewModels.MusicCollection.ViewTypes.albums2:
                            case MS.Entertainment.ViewModels.MusicCollection.ViewTypes.artists2:
                            case MS.Entertainment.ViewModels.MusicCollection.ViewTypes.musicVideos:
                                titleId = String.id.IDS_MUSIC2_COLLECTION_SYNC_TITLE;
                                descriptionId = String.id.IDS_MUSIC2_COLLECTION_SYNC_DESC;
                                action = this._createSyncWaitAction(this._viewModel._view);
                                this._galleryView.syncScreenModel = new MS.Entertainment.UI.Controls.FailedPanelWithQueryModel;
                                this._galleryView.syncScreenModel.query = this._createRecentAlbumsQuery();
                                this._galleryView.syncScreenModel.itemTemplate = "/Components/Shell/Music2WelcomeDialog.html#welcomeDialogAlbumTemplate";
                                break;
                            default:
                                MS.Entertainment.Pages.fail("Unsupported playlist/collection syncing view: " + this._viewModel._view);
                                break
                        }
                        this._galleryView.syncScreenModel.primaryStringId = titleId;
                        this._galleryView.syncScreenModel.secondaryStringId = descriptionId;
                        this._galleryView.syncScreenModel.details = null;
                        this._galleryView.syncScreenModel.action = action;
                        this._galleryView.syncScreenModel.showLoadingRing = true;
                        this._galleryView.syncScreenModel.className = MS.Entertainment.Pages.MusicCollection.syncScreenClass
                    }
                }, _createRecentAlbumsQuery: function _createRecentAlbumsQuery() {
                    var albumsQuery = new MS.Entertainment.Data.Query.Music.RecentList;
                    return {getItems: function getItems() {
                                return albumsQuery.execute().then(function gotRecentAlbums(q) {
                                        var albums = q && q.result && q.result.itemsArray.filter(function imageFilter(item) {
                                                return item.mediaType === Microsoft.Entertainment.Queries.ObjectType.album && !!item.imageResizeUri
                                            });
                                        if (albums.length >= MS.Entertainment.Pages.MusicCollection.recentAlbumsToDisplay)
                                            return WinJS.Promise.wrap(albums.slice(0, MS.Entertainment.Pages.MusicCollection.recentAlbumsToDisplay));
                                        return WinJS.Promise.wrap()
                                    }.bind(this), function onError(error) {
                                        MS.Entertainment.Music.fail("Failed to complete albums query: " + error && error.message);
                                        return WinJS.Promise.wrapError(error)
                                    })
                            }}
                }, _getUserGatedMusic2CollectionDetails: function _getUserGatedMusic2CollectionDetails() {
                    return [{
                                linkStringId: String.id.IDS_MUSIC2_CONTINUE_BUTTON_DESC_VUI_GUI, linkAction: this._createDismissAction(MS.Entertainment.Utilities.UserConfigurationValues.collectionDialogXuids), linkIcon: WinJS.UI.AppBarIcon.filter, voicePhrase: String.load(String.id.IDS_MUSIC2_CONTINUE_BUTTON_DESC_VUI_ALM), voicePhoneticPhrase: String.load(String.id.IDS_MUSIC2_CONTINUE_BUTTON_DESC_VUI_PRON), voiceConfidence: String.load(String.id.IDS_MUSIC2_CONTINUE_BUTTON_DESC_VUI_CONF)
                            }]
                }, _getUserGatedMusic2PlaylistCollectionDetails: function _getUserGatedMusic2PlaylistCollectionDetails() {
                    return [{
                                linkStringId: String.id.IDS_MUSIC2_CONTINUE_BUTTON_DESC_VUI_GUI, linkAction: this._createDismissAction(MS.Entertainment.Utilities.UserConfigurationValues.playlistDialogXuids), linkIcon: WinJS.UI.AppBarIcon.filter, voicePhrase: String.load(String.id.IDS_MUSIC2_CONTINUE_BUTTON_DESC_VUI_ALM), voicePhoneticPhrase: String.load(String.id.IDS_MUSIC2_CONTINUE_BUTTON_DESC_VUI_PRON), voiceConfidence: String.load(String.id.IDS_MUSIC2_CONTINUE_BUTTON_DESC_VUI_CONF)
                            }]
                }, _createDismissAction: function _createDismissAction(configurationValue) {
                    var dismissAction = new MS.Entertainment.UI.Actions.Action;
                    dismissAction.automationId = MS.Entertainment.UI.AutomationIds.collectionEmptyShowAllMusicLink;
                    dismissAction.canExecute = function canExecute() {
                        return true
                    };
                    dismissAction.executed = function executed() {
                        MS.Entertainment.Utilities.setUserConfigurationValue(configurationValue, true);
                        if (this._galleryView.syncScreen && this._viewModel.selectedTemplate.syncScreen) {
                            this._galleryView.userGatedGalleryModel.updateProperty("primaryStringId", this._galleryView.syncScreenModel.primaryStringId);
                            this._galleryView.userGatedGalleryModel.updateProperty("secondaryStringId", this._galleryView.syncScreenModel.secondaryStringId);
                            this._galleryView.userGatedGalleryModel.updateProperty("details", this._galleryView.syncScreenModel.details);
                            this._galleryView.userGatedGalleryModel.updateProperty("showLoadingRing", this._galleryView.syncScreenModel.showLoadingRing);
                            this._galleryView.userGatedGalleryModel.updateProperty("className", this._galleryView.syncScreenModel.className);
                            if (this._galleryView.syncScreenModel)
                                this._galleryView.syncScreenModel.action.execute()
                        }
                        else
                            this._viewModel.refresh()
                    }.bind(this);
                    return dismissAction
                }, _setSyncScreenDisplayed: function _setSyncScreenDisplayed(viewType) {
                    if (!viewType)
                        MS.Entertainment.fail();
                    var userConfigurationValue = null;
                    switch (viewType) {
                        case MS.Entertainment.ViewModels.MusicCollection.ViewTypes.playlists2:
                            userConfigurationValue = MS.Entertainment.Utilities.UserConfigurationValues.playlistSyncScreenDismissed;
                            break;
                        case MS.Entertainment.ViewModels.MusicCollection.ViewTypes.newlyAdded:
                        case MS.Entertainment.ViewModels.MusicCollection.ViewTypes.albums2:
                        case MS.Entertainment.ViewModels.MusicCollection.ViewTypes.artists2:
                            userConfigurationValue = MS.Entertainment.Utilities.UserConfigurationValues.albumArtistSyncScreenDismissed;
                            break;
                        default:
                            MS.Entertainment.Pages.fail("_setSyncScreenDisplayed: Invalid viewType defined " + viewType);
                            return
                    }
                    MS.Entertainment.Utilities.setUserConfigurationValue(userConfigurationValue, true)
                }, _createSyncWaitAction: function _createSyncWaitAction(viewType) {
                    var syncWaitAction = new MS.Entertainment.UI.Actions.Action;
                    syncWaitAction.automationId = MS.Entertainment.UI.AutomationIds.collectionEmptyShowAllMusicLink;
                    syncWaitAction.canExecute = function canExecute() {
                        return true
                    };
                    syncWaitAction.executed = function executed() {
                        if (this._viewModel.pausableQuery)
                            this._viewModel.pausableQuery.unpause();
                        var canDismissSync = new WinJS.Promise(function waitToDismissSync(complete) {
                                var viewModelBinding;
                                var dismissSyncIfReady = function dismissSyncIfReady() {
                                        if (this._viewModel.totalCount >= 1 || !this._viewModel.selectedTemplate.syncScreen) {
                                            this._setSyncScreenDisplayed(viewType);
                                            complete();
                                            if (viewModelBinding) {
                                                viewModelBinding.cancel();
                                                viewModelBinding = null
                                            }
                                        }
                                    }.bind(this);
                                viewModelBinding = WinJS.Binding.bind(this._viewModel, {
                                    totalCountString: dismissSyncIfReady, selectedTemplate: {syncScreen: dismissSyncIfReady}
                                })
                            }.bind(this));
                        var dismissSyncPromise = WinJS.Promise.join([WinJS.Promise.timeout(MS.Entertainment.Pages.MusicCollection.SYNC_SCREEN_WAIT_TIME_MS), canDismissSync]);
                        WinJS.Promise.as(dismissSyncPromise).done(function refreshViewModel() {
                            this._viewModel.refresh()
                        }.bind(this))
                    }.bind(this);
                    return syncWaitAction
                }, _songClicked: function songClicked(event) {
                    if (!this._inPlacePanelAnimating) {
                        var element = this._galleryView.getElementAtIndex(event.detail.itemIndex, true);
                        var item = element.querySelector("[data-win-control], .ent-control").winControl;
                        this._handlePanelClick(element, item, event.detail.itemIndex)
                    }
                }, _inPlacePanelClick: function inPlacePanelClick(event) {
                    if (event.srcElement.type !== "button" && !this._inPlacePanelAnimating) {
                        var element = MS.Entertainment.Utilities.findParentElementByClassName(event.srcElement, "win-item");
                        var item = element.querySelector("[data-win-control], .ent-control").winControl;
                        this._handlePanelClick(element, item)
                    }
                }, _handlePanelClick: function handlePanelClick(element, item, itemIndex) {
                    var promises = [];
                    this._inPlacePanelAnimating = true;
                    if (element === this._selectedSong) {
                        item.domElement.removeEventListener("click", item.panelClickHandler);
                        promises.push(item.collapse(this._selectedSong));
                        this._selectedSong = null
                    }
                    else if (item) {
                        if (this._selectedSong) {
                            var control = this._selectedSong.querySelector("[data-win-control], .ent-control");
                            if (control && control.winControl) {
                                var oldItem = control.winControl;
                                oldItem.domElement.removeEventListener("click", oldItem.panelClickHandler);
                                if (oldItem.isSelected)
                                    promises.push(oldItem.collapse(this._selectedSong))
                            }
                        }
                        this._galleryView.ensureVisible(itemIndex);
                        WinJS.Promise.timeout().then(function() {
                            item.panelClickHandler = this._inPlacePanelClick.bind(this);
                            item.domElement.addEventListener("click", item.panelClickHandler, false)
                        }.bind(this));
                        promises.push(item.expand(element));
                        this._selectedSong = element
                    }
                    WinJS.Promise.join(promises).then(function doneAnimating() {
                        this._inPlacePanelAnimating = false
                    }.bind(this))
                }, _removeItemCompleted: function _removeItemCompleted(eventArgs) {
                    var removed = eventArgs.detail && eventArgs.detail.deleted;
                    var removedItem = eventArgs.detail && eventArgs.detail.removedItem;
                    if (removed) {
                        this._clearSelection();
                        if (this._viewModel) {
                            if (this._viewModel.removeItemCompleted)
                                this._viewModel.removeItemCompleted(removedItem);
                            if (this._viewModel.pausableQuery && this._viewModel.pausableQuery.forceLiveRefresh)
                                this._viewModel.pausableQuery.forceLiveRefresh()
                        }
                    }
                }, _updateGallery: function _updateGallery() {
                    this._clearSelection();
                    if (this._viewModel && this._viewModel.updateQuery)
                        this._viewModel.updateQuery()
                }, _clearSelection: function _clearSelection() {
                    this._galleryView.clearSelection()
                }, showingDialog: false
        }, {dataContext: null}, {
            getEmptySmartDJCollectionDetails: function _getEmptySmartDJCollectionDetails(completeAction) {
                var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                var playSmartDJAction;
                var details;
                if (MS.Entertainment.Utilities.isMusicApp1) {
                    playSmartDJAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.selectArtist);
                    playSmartDJAction.automationId = MS.Entertainment.UI.AutomationIds.appBarPlaySmartDJ;
                    playSmartDJAction.parameter = {
                        isSmartDJ: true, successCallback: completeAction
                    };
                    details = [{
                            linkStringId: String.id.IDS_SMARTDJ_PAGE_CREATE_SMARTDJ_ACTION, linkAction: playSmartDJAction, linkIcon: MS.Entertainment.UI.Icon.smartDj, linkIconPressed: MS.Entertainment.UI.Icon.smartDjPressed, linkHideDefaultRing: true
                        }]
                }
                else {
                    playSmartDJAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.searchArtist);
                    playSmartDJAction.automationId = MS.Entertainment.UI.AutomationIds.dashboardSmartDJSearchArtist;
                    playSmartDJAction.parameter = {
                        hasSmartDJ: true, galleryClass: "smartDjActionGallery"
                    };
                    details = [{
                            linkStringId: String.id.IDS_MUSIC2_RADIO_START_PANEL_VUI_GUI, linkAction: playSmartDJAction, linkIcon: MS.Entertainment.UI.Icon.smartDj, linkIconPressed: MS.Entertainment.UI.Icon.smartDjPressed, linkHideDefaultRing: true
                        }]
                }
                return details
            }, userGatedClass: "userGatedGallery", recentAlbumsToDisplay: 6, SYNC_SCREEN_WAIT_TIME_MS: 6000
        }), MusicCollectionGalleryItemTemplateSelector: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.Controls.GalleryTemplateSelector", function galleryTemplateSelector() {
                MS.Entertainment.UI.Controls.TemplateSelectorBase.prototype.constructor.call(this);
                this.notificationDefaultTemplate = "Components/Music/MusicCollectionTemplates.html#verticalNotificationActionTemplate"
            }, {
                notificationDefaultTemplate: {
                    get: function() {
                        return this.getTemplate(MS.Entertainment.Pages.MusicCollectionGalleryItemTemplateSelector.templateType.notificationDefault)
                    }, set: function(value) {
                            this.addTemplate(MS.Entertainment.Pages.MusicCollectionGalleryItemTemplateSelector.templateType.notificationDefault, value)
                        }
                }, onSelectTemplate: function onSelectTemplate(item) {
                        if (item && item.data && item.data.isNotification)
                            return this.getTemplateProvider(MS.Entertainment.Pages.MusicCollectionGalleryItemTemplateSelector.templateType.notificationDefault);
                        else
                            return MS.Entertainment.UI.Controls.GalleryTemplateSelector.prototype.onSelectTemplate.apply(this, arguments)
                    }
            }, {templateType: {notificationDefault: "notificationDefault"}})
    })
})()
