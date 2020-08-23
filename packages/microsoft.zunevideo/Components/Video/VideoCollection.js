/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/Controls/PlaybackControl.js", "/Framework/corefx.js", "/Framework/utilities.js", "/Framework/servicelocator.js", "/Framework/Data/queries/libraryqueries.js", "/ViewModels/Video/VideoCollectionViewModel.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Pages", {
        VideoCollection: MS.Entertainment.UI.Framework.defineUserControl("/Components/Video/VideoCollection.html#videoCollectionTemplate", function videoCollectionConstructor(element, options) {
            if (this.view === MS.Entertainment.ViewModels.VideoCollection.ViewTypes.other)
                this.templateSelectorConstructor = MS.Entertainment.Pages.VideoCollectionTemplateSelector
        }, {
            _viewModel: null, _galleryView: null, _initializePageCallback: null, _primaryModifierSelectionChangedCallback: null, _viewModelDataChangedCallback: null, _episodeClickedHandler: null, _folderClickedHandler: null, _currentClickHandler: null, _selectedEpisode: null, view: null, galleryClass: null, templateSelectorConstructor: MS.Entertainment.UI.Controls.GalleryTemplateSelector, _viewModelEvents: null, initialize: function initialize() {
                    var onGalleryFirstRendered = function galleryFirstPageRender() {
                            MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioAppLaunchToCollection();
                            MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioCollectionGalleryRequestToLoad();
                            if (this.domElement)
                                this.domElement.removeEventListener("galleryFirstPageRendered", onGalleryFirstRendered)
                        }.bind(this);
                    this.domElement.addEventListener("galleryFirstPageRendered", onGalleryFirstRendered);
                    this._initializePageCallback = this._initializePage.bind(this);
                    this._primaryModifierSelectionChangedCallback = this._primaryModifierSelectionChanged.bind(this);
                    this._viewModelDataChangedCallback = this._viewModelDataChanged.bind(this);
                    this._episodeClickedHandler = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(this._episodeClicked, this);
                    this._folderClickedHandler = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(this._folderClicked, this);
                    this.bind("dataContext", this._initializePageCallback);
                    var clearSelection = this._clearSelection.bind(this);
                    var removeItem = this._removeItemCompleted.bind(this);
                    var handlers = {
                            deleteMedia: removeItem, deleteSeries: removeItem, play: clearSelection, playFreeOffer: clearSelection, playOnXbox360: clearSelection, tryDownloadAgain: clearSelection, removeFailedVideo: clearSelection, movieDetails: clearSelection, playTrailer: clearSelection, restartVideo: clearSelection, resumeVideo: clearSelection, playDisabled: clearSelection, buyEpisode: clearSelection, buyVideo: clearSelection, rentVideo: clearSelection, seriesDetails: clearSelection, downloadFromMarketplace: clearSelection, downloadSeason: clearSelection, getOnXbox: clearSelection
                        };
                    this._galleryView.addSelectionHandlers(handlers)
                }, unload: function unload() {
                    this.unbind("dataContext", this._initializePageCallback);
                    if (this._viewModelEvents) {
                        this._viewModelEvents.cancel();
                        this._viewModelEvents = null
                    }
                    if (this._viewModel)
                        this._viewModel.dispose();
                    this._setClickHandler(null);
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, freeze: function freeze() {
                    if (this._selectedEpisode) {
                        var control = this._selectedEpisode.querySelector("[data-win-control]").winControl;
                        control.domElement.removeEventListener("click", control.panelClickHandler, false)
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    if (this._selectedEpisode) {
                        var control = this._selectedEpisode.querySelector("[data-win-control]").winControl;
                        control.expand(this._selectedEpisode);
                        control.panelClickHandler = this._inPlacePanelClick.bind(this);
                        control.domElement.addEventListener("click", control.panelClickHandler, false)
                    }
                }, _removeItemCompleted: function _removeItemCompleted(eventArgs) {
                    var removed = eventArgs.detail && eventArgs.detail.deleted;
                    if (removed)
                        this._clearSelection()
                }, _clearSelection: function _clearSelection() {
                    this._galleryView.clearSelection()
                }, _initializePage: function initializePage() {
                    if (!this.dataContext || this._unloaded)
                        return;
                    this._viewModel = this.dataContext.viewModel;
                    this.view = this._viewModel.view;
                    this._viewModel.items = null;
                    this._initializeModifiers();
                    this._initializeGalleryView();
                    this._viewModelEvents = MS.Entertainment.Utilities.addEventHandlers(this._viewModel, {itemsChanged: this._viewModelDataChangedCallback});
                    this._viewModel.beginQuery()
                }, _setClickHandler: function setClickHandler(handler) {
                    if (this._currentClickHandler)
                        this._galleryView.domElement.removeEventListener("iteminvoked", this._currentClickHandler);
                    this._currentClickHandler = handler;
                    if (this._currentClickHandler)
                        this._galleryView.domElement.addEventListener("iteminvoked", this._currentClickHandler, false)
                }, _initializeGalleryView: function initializeGalleryView() {
                    if (this.galleryClass)
                        WinJS.Utilities.addClass(this._galleryView.domElement, this.galleryClass);
                    this._galleryView.queryToPause = null;
                    this._galleryView.dataSource = null;
                    this._galleryView.mediaType = this.view;
                    this._galleryView.emptyGalleryModel = new MS.Entertainment.UI.Controls.DefaultFailedPanelModel;
                    this._galleryView.emptyGalleryModel.isVisible = false;
                    this._galleryView.emptyGalleryModel.primaryStringId = String.id.IDS_COLLECTION_VIDEO_LIBRARY_EMPTY;
                    if (MS.Entertainment.Utilities.isApp2)
                        this._galleryView.emptyGalleryModel.secondaryStringId = String.id.IDS_VIDEO_COLLECTION_EMPTY
                }, _initializeModifiers: function initializeModifiers() {
                    var that = this;
                    var sorts = MS.Entertainment.ViewModels.VideoCollection.Sorts[this._viewModel.view]();
                    var values = [];
                    for (var x = 0; x < sorts.values.length; x++) {
                        var node = sorts[sorts.values[x]];
                        var value = {
                                label: node.title, value: node.value, type: "sort"
                            };
                        values.push(value)
                    }
                    this._bindings = WinJS.Binding.bind(this, {_viewModel: {modifierSelectionManager: {selectedItem: this._primaryModifierSelectionChangedCallback.bind(this)}}});
                    this._viewModel.modifierSelectionManager = new MS.Entertainment.UI.Framework.SelectionManager(values, 0, this._viewModel.settingsKey)
                }, _primaryModifierSelectionChanged: function primaryModifierSelectionChanged(newValue) {
                    if (newValue)
                        this._updateViewModel(newValue)
                }, _updateViewModel: function updateViewModel(item) {
                    switch (item.type) {
                        case"sort":
                            if (this._viewModel.sort !== item.value) {
                                this._viewModel.sort = item.value;
                                this._viewModel.beginQuery()
                            }
                            break
                    }
                }, _viewModelDataChanged: function viewModelDataChanged() {
                    if (!this._viewModel.items || !this._viewModel.isCurrentQuery() || !this._viewModel.view || !this._viewModel.sort)
                        return;
                    var node = MS.Entertainment.ViewModels.VideoCollection.Templates[this._viewModel.view][this._viewModel.sort];
                    this._galleryView.headerTemplate = node.headerTemplate || null;
                    if (node.panelTemplate) {
                        this._galleryView.panelTemplate = node.panelTemplate ? node.panelTemplate : null;
                        this._galleryView.panelOptions = node.panelOptions ? node.panelOptions : null
                    }
                    else {
                        this._galleryView.panelTemplate = null;
                        this._galleryView.panelOptions = null
                    }
                    this._galleryView.emptyGalleryModel.isVisible = this._viewModel.items.count === 0;
                    this._galleryView.itemSize = node.itemSize || null;
                    this._galleryView.slotSize = node.slotSize || null;
                    this._galleryView.maxRows = node.maxRows || -1;
                    this._galleryView.multiSize = node.multiSize || false;
                    this._galleryView.panelTemplateTypeMappings = [{
                            key: "videoType", value: Microsoft.Entertainment.Queries.VideoType.tvEpisode, panelTemplate: MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl()
                        }],
                    this._galleryView.itemTemplate = node.template;
                    this._galleryView.itemClass = node.itemClass || null;
                    this._galleryView.headerClass = node.headerClass || null;
                    this._galleryView.tap = node.tap || MS.Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly;
                    this._galleryView.backdropColor = node.backdropColor || MS.Entertainment.ViewModels.VideoGalleryColors.backdropColor;
                    this._galleryView.invokeBehavior = node.invokeBehavior || MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.popOver;
                    this._galleryView.actionTemplate = node.actionTemplateUrl || null;
                    switch (this._viewModel.view) {
                        case MS.Entertainment.ViewModels.VideoCollection.ViewTypes.all:
                        case MS.Entertainment.ViewModels.VideoCollection.ViewTypes.other:
                            this._galleryView.emptyGalleryModel.details = this._getEmptyCollectionDetails();
                            break;
                        case MS.Entertainment.ViewModels.VideoCollection.ViewTypes.movies:
                            this._galleryView.emptyGalleryModel.details = this._getEmptyCollectionMoviesDetails();
                            break;
                        case MS.Entertainment.ViewModels.VideoCollection.ViewTypes.tv:
                            this._galleryView.emptyGalleryModel.details = this._getEmptyCollectionTVDetails();
                            break
                    }
                    if (node.groupHeaderPosition)
                        this._galleryView.headerPosition = node.groupHeaderPosition;
                    if (node.grouped) {
                        this._galleryView.grouperType = node.grouperType;
                        this._galleryView.grouper.keyPropertyName = node.grouperField;
                        if ("grouperKeyAsData" in node)
                            this._galleryView.grouper.useKeyAsData = node.grouperKeyAsData
                    }
                    else
                        this._galleryView.grouperType = null;
                    if (node.galleryClass) {
                        if (this.galleryClass)
                            WinJS.Utilities.removeClass(this._galleryView.domElement, this.galleryClass);
                        WinJS.Utilities.addClass(this._galleryView.domElement, node.galleryClass);
                        this.galleryClass = node.galleryClass
                    }
                    if (this._viewModel.view === MS.Entertainment.ViewModels.VideoCollection.ViewTypes.other)
                        this._setClickHandler(this._folderClickedHandler);
                    else
                        this._setClickHandler(null);
                    this._galleryView.queryToPause = this._viewModel.getQuery();
                    this._galleryView.dataSource = this._viewModel.items;
                    this._selectedEpisode = null;
                    this._inPlacePanelAnimating = false
                }, _getEmptyCollectionDetails: function _getEmptyCollectionDetails() {
                    var details = null;
                    if (MS.Entertainment.Utilities.isApp1) {
                        var isStorageLibrarySupported = WinJS.Utilities.getMember("Windows.Storage.StorageLibrary") ? true : false;
                        var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                        var openFileAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.openFile);
                        var onManageFoldersAction = isStorageLibrarySupported ? actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.manageFolders) : null;
                        var onMoreAboutLibrariesAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.launchApp);
                        onMoreAboutLibrariesAction.automationId = MS.Entertainment.UI.AutomationIds.launchAppMoreAboutLibraries;
                        onMoreAboutLibrariesAction.parameter = {
                            uri: MS.Entertainment.UI.FWLink.videoLibraries, appendSource: false
                        };
                        details = [{
                                stringId: String.id.IDS_COLLECTION_VIDEO_LIBRARY_EMPTY_2, linkStringId: isStorageLibrarySupported ? String.id.IDS_COLLECTION_VIDEO_MANAGE_FOLDERS_LINK : String.id.IDS_COLLECTION_VIDEO_MORE_LIBRARIES_LINK, linkAction: isStorageLibrarySupported ? onManageFoldersAction : onMoreAboutLibrariesAction, linkIcon: WinJS.UI.AppBarIcon.find
                            }, {
                                stringId: String.id.IDS_COLLECTION_VIDEO_LIBRARY_OPEN_FILE, linkStringId: String.id.IDS_COLLECTION_OPEN_FILES_LINK, linkAction: openFileAction, linkIcon: WinJS.UI.AppBarIcon.folder
                            }]
                    }
                    return details
                }, _getEmptyCollectionMoviesDetails: function _getEmptyCollectionMoviesDetails() {
                    var details = null;
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    if (MS.Entertainment.Utilities.isApp1 && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace)) {
                        var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                        var navigateToMovieMarketplace = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
                        navigateToMovieMarketplace.parameter = MS.Entertainment.UI.Monikers.movieMarketplace;
                        details = [{
                                linkStringId: String.id.IDS_COLLECTION_MOVIE_EMPTY_LINK, linkAction: navigateToMovieMarketplace, linkIcon: MS.Entertainment.UI.Icon.store
                            }]
                    }
                    return details
                }, _getEmptyCollectionTVDetails: function _getEmptyCollectionTVDetails() {
                    var details = null;
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    if (MS.Entertainment.Utilities.isApp1 && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace)) {
                        var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                        var navigateToTVMarketplace = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
                        navigateToTVMarketplace.parameter = MS.Entertainment.UI.Monikers.tvMarketplace;
                        details = [{
                                linkStringId: String.id.IDS_COLLECTION_TV_EMPTY, linkAction: navigateToTVMarketplace, linkIcon: MS.Entertainment.UI.Icon.store
                            }]
                    }
                    return details
                }, _folderClicked: function folderClicked(event) {
                    var item = this._galleryView.getDataObjectAtIndex(event.detail.itemIndex);
                    var folder = (item && item._value && item._value.folderId >= 0) ? item._value : null;
                    if (folder && folder.folderId >= 0 && this._viewModel && this._viewModel.openFolder)
                        this._viewModel.openFolder(folder)
                }, _episodeClicked: function episodeClicked(event) {
                    if (!this._inPlacePanelAnimating) {
                        var element = this._galleryView.getElementAtIndex(event.detail.itemIndex, true);
                        var item = element.querySelector("[data-win-control]").winControl;
                        this._handlePanelClick(element, item, event.detail.itemIndex)
                    }
                }, _inPlacePanelClick: function inPlacePanelClick(event) {
                    if (event.srcElement.type !== "button" && !this._inPlacePanelAnimating) {
                        var element = MS.Entertainment.Utilities.findParentElementByClassName(event.srcElement, "win-item");
                        var item = element.querySelector("[data-win-control]").winControl;
                        this._handlePanelClick(element, item)
                    }
                }, _handlePanelClick: function handlePanelClick(element, item, itemIndex) {
                    var promises = [];
                    this._inPlacePanelAnimating = true;
                    if (element === this._selectedEpisode) {
                        item.domElement.removeEventListener("click", item.panelClickHandler);
                        promises.push(item.collapse(this._selectedEpisode));
                        this._selectedEpisode = null
                    }
                    else {
                        if (this._selectedEpisode) {
                            var control = this._selectedEpisode.querySelector("[data-win-control]");
                            if (control && control.winControl) {
                                var oldItem = control.winControl;
                                oldItem.domElement.removeEventListener("click", oldItem.panelClickHandler);
                                if (oldItem.isSelected)
                                    promises.push(oldItem.collapse(this._selectedEpisode))
                            }
                        }
                        this._galleryView.ensureVisible(itemIndex);
                        WinJS.Promise.timeout().then(function() {
                            item.panelClickHandler = this._inPlacePanelClick.bind(this);
                            item.domElement.addEventListener("click", item.panelClickHandler, false)
                        }.bind(this));
                        promises.push(item.expand(element));
                        this._selectedEpisode = element
                    }
                    WinJS.Promise.join(promises).then(function doneAnimating() {
                        this._inPlacePanelAnimating = false
                    }.bind(this))
                }
        }, {dataContext: null}, {canInvokeForItemOverride: WinJS.Utilities.markSupportedForProcessing(function canInvokeForItem(item) {
                return !(item && item.data && item.data.type === Microsoft.Entertainment.Queries.ObjectType.folder)
            })}), VideoCollectionTemplateSelector: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.Controls.GalleryTemplateSelector", function videoCollectionTemplateSelector(galleryView) {
                MS.Entertainment.UI.Controls.GalleryTemplateSelector.prototype.constructor.call(this);
                this._galleryView = galleryView;
                this.addTemplate(MS.Entertainment.UI.Controls.TemplateSelectorBase.templateType.emptyGallery, "/Controls/GalleryControl.html#listViewEmptyGalleryTemplate");
                this.addTemplate("folder", "/Components/Video/VideoCollectionTemplates.html#personalFolderTile");
                this.addTemplate("otherVideo", "/Components/Video/VideoStartupTemplates.html#personalFileTile")
            }, {onSelectTemplate: function onSelectTemplate(item) {
                    var template = null;
                    if (item && item.data) {
                        var data = item.data || {};
                        if (data.type === Microsoft.Entertainment.Queries.ObjectType.folder)
                            template = "folder";
                        else
                            template = "otherVideo"
                    }
                    this.ensureTemplatesLoaded([template]);
                    return this.getTemplateProvider(template)
                }})
    })
})()
