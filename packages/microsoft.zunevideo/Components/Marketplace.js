/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Pages", {MarketplaceBase: MS.Entertainment.UI.Framework.defineUserControl("/Components/Marketplace.html#marketplaceTemplate", function marketplaceBaseConstructor(element, options){}, {
            view: null, templateSelectorConstructor: MS.Entertainment.UI.Controls.GalleryTemplateSelector, allowEmpty: false, clearItemsDuringQuery: false, usePageScroller: true, usePageScrollerChildAsAnimationRoot: false, pageScrollerAnimationRootSelectors: null, _pageScroller: null, _bindings: null, _viewModelEventHandlers: null, _currentGalleryClass: String.empty, _scrollerPadding: 175, selectedTemplate: {get: function() {
                        return (this._viewModel) ? this._viewModel.selectedTemplate : null
                    }}, initialize: function initialize() {
                    this.domElement.addEventListener("galleryFirstPageRendered", function galleryFirstPageRender() {
                        MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioMarketplaceGalleryRequestToLoad()
                    });
                    this.bind("_viewModel", this._initializePage.bind(this));
                    this._bindings = WinJS.Binding.bind(this, {dataContext: this._updateViewModel.bind(this)});
                    MS.Entertainment.UI.Framework.UserControl.prototype.initialize.call(this)
                }, unload: function unload() {
                    if (this._viewModel && this._viewModel.dispose)
                        this._viewModel.dispose();
                    if (this._viewModel && this._viewModel.unregisterServices)
                        this._viewModel.unregisterServices();
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    if (this._pageScroller) {
                        this._pageScroller.dispose();
                        this._pageScroller = null
                    }
                    this._uninitializePage();
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, freeze: function freeze() {
                    if (this._viewModel && this._viewModel.freeze)
                        this._viewModel.freeze();
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    if (this._viewModel && this._viewModel.thaw)
                        this._viewModel.thaw();
                    if (this._pageScroller)
                        this._pageScroller.refreshScrollPosition()
                }, _uninitializePage: function _uninitializePage() {
                    if (this._viewModelEventHandlers) {
                        this._viewModelEventHandlers.cancel();
                        this._viewModelEventHandlers = null
                    }
                }, _updateViewModel: function _updateViewModel(newValue) {
                    if (newValue)
                        this._viewModel = newValue.viewModel
                }, _initializePage: function initializePage() {
                    this._uninitializePage();
                    this._viewModelEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._viewModel, {
                        itemsChanged: this._setGalleryItems.bind(this), isFailedChanged: this._setFailedEvent.bind(this), largeItemIndexChanged: this._updateGalleryLargeItemIndex.bind(this)
                    });
                    this._setGalleryItems();
                    this._setFailedEvent();
                    this._updateGalleryLargeItemIndex()
                }, _setPageScollerAnimationRoots: function _setPageScollerAnimationRoots() {
                    var rootElements = [];
                    if (!this._pageScroller || !Array.isArray(this.pageScrollerAnimationRootSelectors))
                        return;
                    this.pageScrollerAnimationRootSelectors.reduce(function(data, selector) {
                        var element = this.domElement.querySelector(selector);
                        if (element)
                            data.push(element);
                        return data
                    }.bind(this), rootElements);
                    this._pageScroller.animationRoots = rootElements
                }, _setGalleryItems: function setGalleryItems() {
                    var node = this.selectedTemplate;
                    if (this._unloaded || !node || !this._viewModel.items || (!this._viewModel.items.count && (!this.allowEmpty && !node.allowEmpty && (this._viewModel.isCurrentQuery() || !this.clearItemsDuringQuery))) || (!this._viewModel.isCurrentQuery() && !this.clearItemsDuringQuery)) {
                        this._galleryView.dataSource = null;
                        return
                    }
                    if (this._galleryView.useItemsControlInGallery) {
                        this._initializeSelectionHandlers();
                        var items = new MS.Entertainment.Data.ObservableArrayVirtualListAdapter;
                        items.initialize(this._viewModel.items, function adapterFactory(item) {
                            return item
                        });
                        this._galleryView.dataSource = items;
                        if (this.usePageScroller) {
                            if (!this._pageScroller) {
                                this._pageScroller = new MS.Entertainment.UI.Controls.PageScroller(this._galleryScrollContainer, this._nextPageScroller, this._previousPageScroller);
                                this._pageScroller.leftScrollPadding = this._scrollerPadding;
                                this._pageScroller.rightScrollPadding = this._scrollerPadding;
                                this._pageScroller.logicalContainerSelector = ".marketplaceGalleryFlex";
                                this._pageScroller.useFirstChildAsAnimationRoot = this.usePageScrollerChildAsAnimationRoot;
                                this._setPageScollerAnimationRoots()
                            }
                            this._pageScroller.resetScrollPosition()
                        }
                        return
                    }
                    this._galleryView.headerType = node.headerType || MS.Entertainment.UI.Controls.GalleryControl.HeaderType.auto;
                    this._galleryView.largeItemSize = node.largeItemSize || this._galleryView.largeItemSize;
                    this._galleryView.multiSize = node.multiSize || false;
                    this._galleryView.maxRows = node.maxRows || -1;
                    this._galleryView.startNewColumnOnHeaders = node.startNewColumnOnHeaders || false;
                    this._galleryView.slotSize = node.slotSize;
                    this._galleryView.itemMargin = node.itemMargin;
                    this._galleryView.itemSize = node.itemSize;
                    this._galleryView.itemTemplate = node.templateUrl;
                    this._galleryView.panelTemplate = node.panelTemplateUrl;
                    this._galleryView.panelOptions = node.panelOptions;
                    this._galleryView.actionTemplate = node.actionTemplateUrl;
                    this._galleryView.mediaType = node.mediaType;
                    this._galleryView.headerClass = node.headerClass || null;
                    this._galleryView.horizontal = node.horizontal || false;
                    this._galleryView.grouped = node.grouped;
                    this._galleryView.layout = node.layout || MS.Entertainment.UI.Controls.GalleryControl.Layout.grid;
                    this._galleryView.invokeBehavior = node.invokeBehavior || MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.popOver;
                    this._galleryView.invokeHelperFactory = node.invokeHelperFactory || null;
                    this._galleryView.headerTemplate = node.groupTemplate || this._galleryView.headerTemplate || null;
                    this._galleryView.forceInteractive = node.forceInteractive || false;
                    this._galleryView.backdropColor = node.backdropColor;
                    this._galleryView.raisePanelResetEvents = node.raisePanelResetEvents || true;
                    this._galleryView.actionOptions = node.actionOptions || null;
                    this._galleryView.emptyGalleryTemplate = (!this._viewModel.isCurrentQuery() && this.clearItemsDuringQuery) ? null : node.emptyGalleryTemplate;
                    this._galleryView.emptyGalleryModel = this._viewModel.emptyGalleryModel || null;
                    this._galleryView.delayHydrateLibraryId = node.delayHydrateLibraryId || false;
                    this._galleryView.minimumListLength = node.minimumListLength;
                    this._galleryView.panelTemplateTypeMappings = node.panelTemplateTypeMappings;
                    this._galleryView.selectionStyleFilled = node.selectionStyleFilled || false;
                    this._galleryView.maxSelectionCount = node.maxSelectionCount;
                    this._galleryView.restoreFocusOnDataChanges = node.restoreFocusOnDataChanges || false;
                    if (node.selectionMode)
                        this._galleryView.selectionMode = node.selectionMode;
                    if (node.swipeBehavior)
                        this._galleryView.swipeBehavior = node.swipeBehavior;
                    this._galleryView.grouperItemThreshold = -1;
                    if (node.groupHeaderPosition)
                        this._galleryView.headerPosition = node.groupHeaderPosition;
                    if (this._galleryView.grouped) {
                        this._galleryView.grouperType = node.grouperType;
                        this._galleryView.grouper.keyPropertyName = node.grouperField;
                        this._galleryView.grouper.useKeyAsData = (node.grouperKeyAsData !== undefined) ? node.grouperKeyAsData : true
                    }
                    else
                        this._galleryView.grouperType = null;
                    if (this._currentGalleryClass)
                        WinJS.Utilities.removeClass(this._galleryView.domElement, this._currentGalleryClass);
                    if (node.galleryClass) {
                        WinJS.Utilities.addClass(this._galleryView.domElement, node.galleryClass);
                        this._currentGalleryClass = node.galleryClass
                    }
                    this._initializeSelectionHandlers();
                    this._galleryView.dataSource = this._viewModel.items
                }, _initializeSelectionHandlers: function _initializeSelectionHandlers() {
                    if (this._galleryView.selectionMode !== MS.Entertainment.UI.Controls.GalleryControl.SelectionMode.none) {
                        var defaultSelectionHandlers = MS.Entertainment.ViewModels.SmartAppbarActions.setDefaultGalleryEventHandlers(this._clearSelection.bind(this));
                        this._galleryView.addSelectionHandlers(defaultSelectionHandlers);
                        this._galleryView.addSelectionHandlers({deleteMedia: this._handleItemDeleted.bind(this)})
                    }
                }, _handleItemDeleted: function _handleItemDeleted(eventArgs) {
                    var deleted = eventArgs.detail && eventArgs.detail.deleted;
                    if (deleted)
                        this._clearSelection()
                }, _clearSelection: function _clearSelection() {
                    this._galleryView.clearSelection()
                }, _setFailedEvent: function updateFailed() {
                    if (this._viewModel.isFailed)
                        MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement, true, this._viewModel.failedGalleryModel)
                }, _updateGalleryLargeItemIndex: function updateGalleryLargeItemIndex() {
                    if (this._unloaded)
                        return;
                    this._galleryView.largeItemIndex = this._viewModel.largeItemIndex
                }, _mergeGroupItems: function mergeGroupItems(lessSignificantGroupItem, moreSignificantGroupItem) {
                    if (lessSignificantGroupItem && moreSignificantGroupItem) {
                        var combinedItem = {};
                        for (var property in lessSignificantGroupItem)
                            combinedItem[property] = lessSignificantGroupItem[property];
                        for (property in moreSignificantGroupItem)
                            combinedItem[property] = moreSignificantGroupItem[property];
                        return combinedItem
                    }
                    else if (lessSignificantGroupItem)
                        return lessSignificantGroupItem;
                    else if (moreSignificantGroupItem)
                        return moreSignificantGroupItem
                }
        }, {
            _viewModel: null, dataContext: null
        })});
    WinJS.Namespace.define("MS.Entertainment.Pages", {Marketplace: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.MarketplaceBase", "/Components/Marketplace.html#marketplaceTemplate", function marketplaceConstructor(element, options){}, {
            _galleryImageChangedCallback: null, _heroImageChangedCallback: null, _modifierSelectedItemChangedCallback: null, _marketplaceViewModelEventHandlers: null, _modifierEventHandlers: null, _secondaryModifierEventHandlers: null, _updatingSecondaryFilter: false, selectedTemplate: {get: function() {
                        return (!this.combinedQueryOptions) ? null : this._mergeGroupItems(this._viewModel.Templates[this.combinedQueryOptions.template], this.combinedQueryOptions)
                    }}, primaryFilterSelectedItem: {get: function() {
                        return this._viewModel && this._viewModel.modifierSelectionManager ? this._viewModel.modifierSelectionManager.selectedItem : null
                    }}, secondaryFilterSelectedItem: {get: function() {
                        return this._viewModel && this._viewModel.secondaryModifierSelectionManager ? this._viewModel.secondaryModifierSelectionManager.selectedItem : null
                    }}, primaryFilterDataSource: {
                    get: function() {
                        return this._viewModel && this._viewModel.modifierSelectionManager ? this._viewModel.modifierSelectionManager.dataSource : null
                    }, set: function(value) {
                            if (this._viewModel && this._viewModel.modifierSelectionManager)
                                this._viewModel.modifierSelectionManager.dataSource = value
                        }
                }, secondaryFilterDataSource: {
                    get: function() {
                        return this._viewModel && this._viewModel.secondaryModifierSelectionManager ? this._viewModel.secondaryModifierSelectionManager.dataSource : null
                    }, set: function(value) {
                            if (this._viewModel && this._viewModel.secondaryModifierSelectionManager)
                                this._viewModel.secondaryModifierSelectionManager.dataSource = value
                        }
                }, initialize: function initialize() {
                    this._galleryImageChangedCallback = this._setGalleryImage.bind(this);
                    this._heroImageChangedCallback = this._setHeroImage.bind(this);
                    this._modifierSelectedItemChangedCallback = this._modifierSelectionChanged.bind(this);
                    this._modifierChanged = this._modifierChanged.bind(this);
                    this._secondaryModifierChanged = this._secondaryModifierChanged.bind(this);
                    MS.Entertainment.Pages.MarketplaceBase.prototype.initialize.apply(this, arguments)
                }, addEventHandlers: function addEventHandlers() {
                    this._marketplaceViewModelEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._viewModel, {
                        galleryImageUrlChanged: this._galleryImageChangedCallback, heroImageUrlChanged: this._heroImageChangedCallback, modifierChanged: this._modifierChanged, secondaryModifierChanged: this._secondaryModifierChanged
                    })
                }, cancelEventHandlers: function cancelEventHandlers() {
                    if (this._marketplaceViewModelEventHandlers) {
                        this._marketplaceViewModelEventHandlers.cancel();
                        this._marketplaceViewModelEventHandlers = null
                    }
                    this._cancelModifierEventHandlers();
                    this._cancelSecondaryModifierEventHandlers()
                }, _cancelModifierEventHandlers: function _cancelModifierEventHandlers() {
                    if (this._modifierEventHandlers) {
                        this._modifierEventHandlers.cancel();
                        this._modifierEventHandlers = null
                    }
                }, _cancelSecondaryModifierEventHandlers: function _cancelSecondaryModifierEventHandlers() {
                    if (this._secondaryModifierEventHandlers) {
                        this._secondaryModifierEventHandlers.cancel();
                        this._secondaryModifierEventHandlers = null
                    }
                }, unload: function unload() {
                    MS.Entertainment.Pages.MarketplaceBase.prototype.unload.call(this)
                }, _uninitializePage: function _uninitializePage() {
                    MS.Entertainment.Pages.MarketplaceBase.prototype._uninitializePage.apply(this, arguments);
                    this.cancelEventHandlers()
                }, _initializePage: function initializePage() {
                    MS.Entertainment.Pages.MarketplaceBase.prototype._initializePage.apply(this, arguments);
                    this.addEventHandlers();
                    this._galleryImageChangedCallback();
                    if (!this.primaryFilterDataSource || this.primaryFilterDataSource.length === 0 || !this.primaryFilterSelectedItem)
                        this._viewModel.populatePrimaryFilter();
                    else
                        this._modifierSelectedItemChangedCallback()
                }, _setGalleryImage: function setGalleryImage() {
                    this._hubImage = this._viewModel.galleryImageUrl
                }, _setHeroImage: function setHeroImage() {
                    if (this._heroImageContainer && this._viewModel && this._viewModel.heroImageUrl) {
                        this._heroImageContainer.target = this._viewModel.heroImageUrl;
                        if (this._heroPrimaryTextContainer && this._viewModel.heroPrimaryText)
                            MS.Entertainment.Utilities.showElement(this._heroPrimaryTextContainer);
                        if (this._heroSecondaryTextContainer && this._viewModel.heroSecondaryText)
                            MS.Entertainment.Utilities.showElement(this._heroSecondaryTextContainer);
                        this.usePageScrollerChildAsAnimationRoot = false;
                        this.pageScrollerAnimationRootSelectors = [".marketplaceGallery-image", ".marketplaceGalleryFlex"];
                        this._setPageScollerAnimationRoots();
                        if (this._pageScroller && this._pageScroller.useFirstChildAsAnimationRoot)
                            this._pageScroller.useFirstChildAsAnimationRoot = this.usePageScrollerChildAsAnimationRoot
                    }
                }, _updateSecondaryFilter: function updateSecondaryFilter(primaryFilterItem) {
                    if (primaryFilterItem && !this._updatingSecondaryFilter) {
                        var secondaryFilterUpdated = false;
                        this._updatingSecondaryFilter = true;
                        if (!primaryFilterItem.secondaryFilter && this.secondaryFilterDataSource && this.secondaryFilterDataSource.length !== 0) {
                            this.secondaryFilterDataSource = [];
                            secondaryFilterUpdated = true
                        }
                        else if (primaryFilterItem.secondaryFilter !== undefined && (this.combinedQueryOptions === undefined || primaryFilterItem.secondaryFilter !== this.combinedQueryOptions.secondaryFilter)) {
                            this._viewModel.populateSecondaryFilter(this.primaryFilterSelectedItem);
                            secondaryFilterUpdated = true
                        }
                        this._updatingSecondaryFilter = false;
                        this.combinedQueryOptions = primaryFilterItem;
                        return secondaryFilterUpdated
                    }
                }, _updateGalleryItems: function updateGalleryItems(combinedQueryOptions) {
                    if (combinedQueryOptions && combinedQueryOptions.query) {
                        var imageQuery = null;
                        var galleryImage = null;
                        var contentQuery = new combinedQueryOptions.query;
                        this.combinedQueryOptions = combinedQueryOptions;
                        this._viewModel.combinedQueryOptions = combinedQueryOptions;
                        if (combinedQueryOptions.serviceId !== undefined)
                            contentQuery.serviceId = combinedQueryOptions.serviceId;
                        if (combinedQueryOptions.genre !== undefined)
                            contentQuery.genre = combinedQueryOptions.genre;
                        if (combinedQueryOptions.studio !== undefined)
                            contentQuery.studio = combinedQueryOptions.studio;
                        if (combinedQueryOptions.network !== undefined)
                            contentQuery.network = combinedQueryOptions.network;
                        if (combinedQueryOptions.impressionGuid !== undefined)
                            contentQuery.impressionGuid = combinedQueryOptions.impressionGuid;
                        if (combinedQueryOptions.orderBy !== undefined)
                            contentQuery.orderBy = combinedQueryOptions.orderBy;
                        if (combinedQueryOptions.sort !== undefined)
                            contentQuery.sort = combinedQueryOptions.sort;
                        if (combinedQueryOptions.startsWith !== undefined)
                            contentQuery.startsWith = combinedQueryOptions.startsWith;
                        if (combinedQueryOptions.imageUri !== undefined)
                            galleryImage = combinedQueryOptions.imageUri;
                        if (combinedQueryOptions.galleryImage !== undefined && combinedQueryOptions.serviceId !== undefined) {
                            imageQuery = new combinedQueryOptions.galleryImage;
                            imageQuery.id = combinedQueryOptions.serviceId
                        }
                        if (combinedQueryOptions.desiredMediaItemTypes !== undefined)
                            contentQuery.desiredMediaItemTypes = combinedQueryOptions.desiredMediaItemTypes;
                        if (combinedQueryOptions.playlistId !== undefined)
                            contentQuery.playlistId = combinedQueryOptions.playlistId;
                        if (combinedQueryOptions.mediaItemObjectType !== undefined)
                            contentQuery.mediaItemObjectType = combinedQueryOptions.mediaItemObjectType;
                        this._viewModel.beginQuery(contentQuery, imageQuery, galleryImage)
                    }
                }, _modifierChanged: function _modifierChanged() {
                    this._cancelModifierEventHandlers();
                    if (this._viewModel.modifierSelectionManager) {
                        this._modifierEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._viewModel.modifierSelectionManager, {selectedItemChanged: this._modifierSelectedItemChangedCallback});
                        this._modifierSelectionChanged()
                    }
                }, _secondaryModifierChanged: function _secondaryModifierChanged() {
                    this._cancelSecondaryModifierEventHandlers();
                    if (this._viewModel.secondaryModifierSelectionManager) {
                        this._secondaryModifierEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._viewModel.secondaryModifierSelectionManager, {selectedItemChanged: this._modifierSelectedItemChangedCallback});
                        this._modifierSelectionChanged()
                    }
                }, _modifierSelectionChanged: function modifierSelectionChanged() {
                    var primaryFilterSelectedItem = this.primaryFilterSelectedItem;
                    if (primaryFilterSelectedItem !== null)
                        if (!this._updateSecondaryFilter(primaryFilterSelectedItem)) {
                            this._galleryView.emptyGalleryTemplate = null;
                            this._galleryView.dataSource = null;
                            var mergedItem = this._mergeGroupItems(primaryFilterSelectedItem, this.secondaryFilterSelectedItem);
                            this._updateGalleryItems(mergedItem)
                        }
                }
        }, {_hubImage: null}, {})});
    WinJS.Namespace.define("MS.Entertainment.Pages", {MarketplaceListViewModelGallery: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.MarketplaceBase", "/Components/Marketplace.html#marketplaceListViewModelGalleryTemplate", function marketplaceListViewModelGalleryConstructor(element, options){})})
})()
