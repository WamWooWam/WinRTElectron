/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js", "/Framework/selectionManager.js", "/Controls/pivotControls.js");
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Framework");
    WinJS.Namespace.define("MS.Entertainment.Music", {MusicPage: MS.Entertainment.UI.Framework.defineUserControl(null, function MusicPage(element, options) {
            var appbar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
            if (appbar && appbar.suspendActionListChanges)
                appbar.suspendActionListChanges();
            this._resetPage();
            this._hubsSelectionManager = new MS.Entertainment.UI.Framework.SelectionManager(null, 0);
            var container = element.querySelector("[data-ent-member='_container']");
            WinJS.UI.processAll(container).done(function() {
                WinJS.Binding.processAll(container, this)
            }.bind(this))
        }, {
            processChildren: true, controlName: "MusicPages", _hubsSelectionManager: null, _pivotsSourcePath: null, _modifierSourcePath: null, _page: null, _complexBindings: null, _eventHandlers: null, _loadedHub: null, _initialized: false, _pageReadyOnce: false, _pageLoadedOnce: false, _title: null, _loadedOnce: false, _isFailed: false, _isLoading: true, _signedInUserBindings: null, _uiStateBindings: null, _uiStateEventHandlers: null, _itemControlAppBarSelection: null, _lastChangeWasNavigate: true, title: {
                    get: function() {
                        return this._title
                    }, set: function(value) {
                            if (value !== this._title) {
                                var oldValue = this._title;
                                this._title = value;
                                this.notify("title", value, oldValue);
                                if (this._initialized && !this._unloaded)
                                    this._titleContainer.textContent = value
                            }
                        }
                }, loadedOnce: {
                    get: function() {
                        return this._loadedOnce
                    }, set: function(value) {
                            if (value !== this._title) {
                                var oldValue = this._loadedOnce;
                                this._loadedOnce = value;
                                this.notify("loadedOnce", value, oldValue);
                                if (this._initialized && !this._unloaded)
                                    this._bodyContainer.visibility = value
                            }
                        }
                }, isFailed: {
                    get: function() {
                        return this._isFailed
                    }, set: function(value) {
                            if (value !== this._isFailed) {
                                var oldValue = this._isFailed;
                                this._isFailed = value;
                                this.notify("isFailed", value, oldValue);
                                this._isFailedChanged(value, oldValue)
                            }
                        }
                }, isLoading: {
                    get: function() {
                        return this._isLoading
                    }, set: function(value) {
                            if (value !== this._isLoading) {
                                var oldValue = this._isLoading;
                                this._isLoading = value;
                                this.notify("isLoading", value, oldValue);
                                this._isLoadingChanged(value, oldValue)
                            }
                        }
                }, currentHub: {get: function() {
                        return (this._hubsSelectionManager && this._hubsSelectionManager.selectedItem) ? this._hubsSelectionManager.selectedItem : MS.Entertainment.Music.MusicHub.empty
                    }}, isCurrentHubEmpty: {get: function() {
                        return MS.Entertainment.Music.MusicHub.isEmpty(this.currentHub)
                    }}, currentHubId: {get: function() {
                        return this.currentHub.id
                    }}, pivotsUsePanels: {get: function() {
                        return (this.currentHub.dataContext) ? this.currentHub.dataContext.pivotsUsePanels : false
                    }}, modifiersUsePanels: {get: function() {
                        return (this.currentHub.dataContext) ? this.currentHub.dataContext.modifiersUsePanels : false
                    }}, hideLoadingPanel: {get: function() {
                        return (this.currentHub.dataContext) ? this.currentHub.dataContext.hideLoadingPanel : false
                    }}, hideNavigationContainer: {get: function() {
                        return (this.currentHub.dataContext) ? this.currentHub.dataContext.hideNavigationContainer : false
                    }}, hideSidebar: {get: function() {
                        return (this.currentHub.dataContext) ? this.currentHub.dataContext.hideSidebar : false
                    }}, hidePivotsOnFailed: {get: function() {
                        return (this.currentHub.dataContext && this.currentHub.dataContext.hidePivotsOnFailed !== undefined) ? this.currentHub.dataContext.hidePivotsOnFailed : true
                    }}, initialize: function initialize() {
                    window.msWriteProfilerMark("ent:MusicPage.Initialized");
                    if (this._unloaded)
                        return;
                    this._eventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._hubsSelectionManager, {selectedItemChanged: this._onSelectionChanged.bind(this)});
                    this._onSelectionChanged();
                    MS.Entertainment.Framework.AccUtils.createAriaLinkId(this.hubContainer);
                    if (this._pivotControl)
                        this._pivotControl.setTabPanelId(this.hubContainer.id);
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var musicMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                    if (!musicMarketplaceEnabled)
                        WinJS.Utilities.addClass(this.domElement, "marketplaceDisabled");
                    this._initialized = true;
                    if (this.dataContext && this.dataContext.pageIsFlexHub)
                        if (this.currentHub && this.currentHub.dataContext && this.currentHub.dataContext.viewModel)
                            this.currentHub.dataContext.viewModel.queryTitleCallback = this._setPageTitleCallBack.bind(this);
                    if (this._titleContainer)
                        this._titleContainer.textContent = this.title;
                    if (this._bodyContainer)
                        this._bodyContainer.visibility = this.loadedOnce;
                    this._isLoadingChanged(this.isLoading);
                    this._isFailedChanged(this.isFailed)
                }, _setPageTitleCallBack: function _setPageTitleCallBack(title) {
                    this.title = title
                }, unload: function unload() {
                    this._resetPage();
                    this._uninitializeSidebar();
                    if (this._signedInUserBindings) {
                        this._signedInUserBindings.cancel();
                        this._signedInUserBindings = null
                    }
                    if (this._hubsSelectionManager && this._hubsSelectionManager.dataSource)
                        this._hubsSelectionManager.dataSource.forEach(function(item) {
                            item.dispose()
                        });
                    if (this._hubsSelectionManager) {
                        this._hubsSelectionManager.dispose();
                        this._hubsSelectionManager = null
                    }
                    if (this._complexBindings) {
                        this._complexBindings.cancel();
                        this._complexBindings = null
                    }
                    if (this._eventHandlers) {
                        this._eventHandlers.cancel();
                        this._eventHandlers = null
                    }
                    if (this._loadedHub && this._loadedHub.dispose) {
                        this._loadedHub.dispose();
                        this._loadedHub = null
                    }
                    if (this.dataContext) {
                        if (this.dataContext.viewModel && this.dataContext.viewModel.dispose)
                            this.dataContext.viewModel.dispose();
                        this.dataContext = null
                    }
                    if (this._itemControlAppBarSelection) {
                        this._itemControlAppBarSelection.dispose();
                        this._itemControlAppBarSelection = null
                    }
                    this._page = null;
                    this.modifierDescriptionFormatter = null;
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, handlePanelReady: function handlePanelReady(event) {
                    var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                    if (event.failed || (!event.failed && this.isFailed)) {
                        this.failedModel = event.model;
                        this.isFailed = event.failed
                    }
                    event.panelId = this.currentHubId;
                    this.isLoading = false;
                    eventProvider.tracePanel_Ready(this.currentHubId || "");
                    eventProvider.traceHub_Ready(this.currentHubId || "");
                    this._invokePageReadyOnce()
                }, handlePanelReset: function handlePanelReset() {
                    var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                    if (!this.isLoading) {
                        this.failedModel = null;
                        this.isFailed = false;
                        this.isLoading = true;
                        eventProvider.tracePanel_Load_Start(this.currentHubId || "");
                        eventProvider.traceHub_Load_Start(this.currentHubId || "")
                    }
                }, handleGalleryFirstPage: function handleGalleryFirstPage() {
                    WinJS.Promise.timeout().then(function musicPageResumeActionListChanges() {
                        window.msWriteProfilerMark("ent:MusicPages.ResumeActionListChanges");
                        var appbar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                        if (appbar && appbar.resumeActionListChanges)
                            appbar.resumeActionListChanges()
                    })
                }, onNavigateTo: function onNavigateTo(page, hub, panel) {
                    var pageDataContext;
                    var modifierSelectionManager;
                    var pivotSelectionManager;
                    var dataContext;
                    window.msWriteProfilerMark("ent:MusicPage.NavigateTo");
                    this._lastChangeWasNavigate = true;
                    if (this.id !== page.iaNode.moniker) {
                        dataContext = page.getDataContext();
                        this.id = page.iaNode.moniker;
                        this._resetPage();
                        this._page = page;
                        this._changeHubSelection(page, hub, dataContext);
                        this.title = page.title;
                        this.dataContext = dataContext;
                        this._invokePageLoadStart()
                    }
                    else if (this._hubsSelectionManager.selectedItem.id !== hub.iaNode.moniker)
                        this._changeHubSelection(page, hub);
                    if (this.dataContext && this.dataContext.pageIsFlexHub)
                        this.hidePivots = true
                }, _changeHubSelection: function _changeHubSelection(page, hub, dataContext) {
                    this._hubsSelectionManager.dataSource = null;
                    this._hubsSelectionManager.settingsKey = (dataContext && dataContext.preventHubSelectionSave) ? null : this.id + "_viewSelection";
                    this._hubsSelectionManager.dataSource = this._mapHubs(this._page.hubs);
                    if (hub && this._hubsSelectionManager.dataSource && page.options && page.options.selectHub)
                        for (var hubIndex = 0; hubIndex < this._hubsSelectionManager.dataSource.length; hubIndex++)
                            if (hub.iaNode.moniker === this._hubsSelectionManager.dataSource[hubIndex].id) {
                                this._hubsSelectionManager.selectedIndex = hubIndex;
                                break
                            }
                    this._startViewModelQuery()
                }, _startViewModelQuery: function _startViewModelQuery() {
                    if (this.currentHub.dataContext.viewModel && this.currentHub.dataContext.viewModel.begin)
                        this.currentHub.dataContext.viewModel.begin()
                }, _setIsFailed: function _setIsFailed(newValue) {
                    this.isFailed = newValue
                }, _isFailedChanged: function _isFailedChanged(value, oldValue) {
                    if (this._initialized && !this._unloaded)
                        if (value) {
                            WinJS.Utilities.addClass(this.loadingControl, "removeFromDisplay");
                            MS.Entertainment.Utilities.hideElement(this.hubContainer);
                            MS.Entertainment.Utilities.showElement(this.failedControl);
                            var newControl = document.createElement("div");
                            newControl.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.FailedPanel");
                            this.failedControl.appendChild(newControl);
                            WinJS.UI.process(newControl).then(function setModel() {
                                newControl.winControl.model = this.failedModel
                            }.bind(this));
                            if (this.panelAction) {
                                var panelAction = WinJS.Binding.unwrap(this.panelAction);
                                if (panelAction && panelAction.action)
                                    panelAction.action.isEnabled = false
                            }
                            if (this.hidePivotsOnFailed) {
                                WinJS.Utilities.addClass(this._modifierControl.domElement, "removeFromDisplayOnError");
                                if (this._secondaryModifierControl)
                                    WinJS.Utilities.addClass(this._secondaryModifierControl.domElement, "removeFromDisplayOnError");
                                if (this._filterControl)
                                    WinJS.Utilities.addClass(this._filterControl.domElement, "removeFromDisplayOnError");
                                WinJS.Utilities.addClass(this._pivotControl.domElement, "removeFromDisplayOnError")
                            }
                        }
                        else {
                            MS.Entertainment.Utilities.hideElement(this.failedControl);
                            if (oldValue) {
                                MS.Entertainment.Utilities.showElement(this.hubContainer);
                                WinJS.Utilities.addClass(this.loadingControl, "removeFromDisplay")
                            }
                            WinJS.Utilities.removeClass(this._modifierControl.domElement, "removeFromDisplayOnError");
                            if (this._secondaryModifierControl)
                                WinJS.Utilities.removeClass(this._secondaryModifierControl.domElement, "removeFromDisplayOnError");
                            if (this._filterControl)
                                WinJS.Utilities.removeClass(this._filterControl.domElement, "removeFromDisplayOnError");
                            WinJS.Utilities.removeClass(this._pivotControl.domElement, "removeFromDisplayOnError")
                        }
                }, _isLoadingChanged: function _isLoadingChanged(value, oldValue) {
                    if (this._initialized && !this._unloaded)
                        if (!value || this.hideLoadingPanel) {
                            WinJS.Utilities.addClass(this.loadingControl, "removeFromDisplay");
                            if (!this.isFailed)
                                MS.Entertainment.Utilities.showElement(this.hubContainer);
                            MS.Entertainment.Utilities.empty(this.loadingControl)
                        }
                        else {
                            MS.Entertainment.Utilities.hideElement(this.hubContainer);
                            WinJS.Utilities.removeClass(this.loadingControl, "removeFromDisplay");
                            var ring = document.createElement("progress");
                            ring.className = "win-medium win-ring galleryProgress";
                            this.loadingControl.appendChild(ring)
                        }
                }, _minModifierItemsChanged: function _minModifierItemsChanged(newValue, oldValue) {
                    if (this._initialized && !this._unloaded)
                        this._modifierControl.minItems = newValue
                }, _modifierDescriptionChanged: function _modifierDescriptionChanged(newValue, oldValue) {
                    if (this._initialized && !this._unloaded)
                        if (this._filterControl && this._filterControl.items) {
                            this._filterControl.descriptionLabelText = newValue;
                            this._modifierControl.descriptionLabelText = String.load(String.id.IDS_FILTER_SORTED_BY)
                        }
                        else
                            this._modifierControl.descriptionLabelText = newValue
                }, _titleOverrideChanged: function _titleOverrideChanged(newValue, oldValue) {
                    if (newValue !== null && newValue !== undefined)
                        this.title = newValue;
                    else if (this._page)
                        this.title = this._page.title;
                    else
                        this.title = String.empty
                }, _pivotSelectedIndexOverrideChanged: function _pivotSelectedIndexOverrideChanged(newValue, oldValue) {
                    if (this._hubsSelectionManager && newValue !== null && newValue !== undefined)
                        this._hubsSelectionManager.selectedIndex = newValue
                }, _refreshModifierSelectionManagers: function _refreshModifierSelectionManagers() {
                    if (this._complexBindings) {
                        var modifierSelectionManager;
                        var secondaryModifierSelectionManager;
                        if (this.modifiersUsePanels) {
                            modifierSelectionManager = this._hubsSelectionManager;
                            secondaryModifierSelectionManager = null
                        }
                        else if (this.currentHub && this.currentHub.dataContext && this.currentHub.dataContext.viewModel) {
                            modifierSelectionManager = this.currentHub.dataContext.viewModel.modifierSelectionManager;
                            secondaryModifierSelectionManager = this.currentHub.dataContext.viewModel.secondaryModifierSelectionManager
                        }
                        modifierSelectionManager = modifierSelectionManager || MS.Entertainment.Music.MusicPage.empty;
                        secondaryModifierSelectionManager = secondaryModifierSelectionManager || MS.Entertainment.Music.MusicPage.empty;
                        this._modifierControl.selectionManager = this.modifierSelectionManager = modifierSelectionManager;
                        if (this._secondaryModifierControl) {
                            this._secondaryModifierControl.selectionManager = this.secondaryModifierSelectionManager = secondaryModifierSelectionManager;
                            this._secondaryModifierControl.items = secondaryModifierSelectionManager ? secondaryModifierSelectionManager.dataSource : null
                        }
                    }
                }, _refreshFilterSelectionManagers: function _refreshFilterSelectionManagers() {
                    if (this._complexBindings && this._filterControl) {
                        var filterSelectionManager;
                        if (!this.modifiersUsePanels && this.currentHub && this.currentHub.dataContext && this.currentHub.dataContext.viewModel)
                            filterSelectionManager = this.currentHub.dataContext.viewModel.filterSelectionManager;
                        filterSelectionManager = filterSelectionManager || MS.Entertainment.Music.MusicPage.empty;
                        this._filterControl.selectionManager = this.filterSelectionManager = filterSelectionManager
                    }
                }, _refreshPivotSelectionManagers: function _refreshPivotSelectionManagers() {
                    if (this._complexBindings) {
                        var pivotsSelectionManager;
                        if (this.pivotsUsePanels)
                            pivotsSelectionManager = this._hubsSelectionManager;
                        else if (this.currentHub && this.currentHub.dataContext && this.currentHub.dataContext.viewModel)
                            pivotsSelectionManager = this.currentHub.dataContext.viewModel.pivotsSelectionManager;
                        pivotsSelectionManager = pivotsSelectionManager || MS.Entertainment.Music.MusicPage.empty;
                        this._pivotControl.selectionManager = this.pivotsSelectionManager = pivotsSelectionManager
                    }
                }, _mapHubs: function _mapHubs(hubs) {
                    var result;
                    if (hubs)
                        result = hubs.map(function mapHubToHub(hub) {
                            return new MS.Entertainment.Music.MusicHub({
                                    page: this._page, hub: hub
                                })
                        }, this);
                    else
                        result = [];
                    return result
                }, _resetPage: function _resetPage() {
                    this.hubs = [];
                    this.dataContext = {};
                    this.title = null;
                    this._page = {};
                    if (this._loadedHub && this._loadedHub.dispose)
                        this._loadedHub.dispose();
                    this._loadedHub = MS.Entertainment.Music.MusicHub.empty
                }, _onSelectionChanged: function _onSelectionChanged(args) {
                    if (this._complexBindings) {
                        this._complexBindings.cancel();
                        this._complexBindings = null
                    }
                    if (this._pageReadyOnce && MS.Entertainment.Utilities.isApp2)
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).lastNavigationWasPage = false;
                    if (this.currentHub)
                        this._loadHub()
                }, _loadHub: function _loadHub() {
                    var currentHub = this.currentHub;
                    if (MS.Entertainment.Music.MusicHub.isEmpty(currentHub) || currentHub === this._loadedHub)
                        return;
                    if (this._loadedHub && this._loadedHub.clearDataContext) {
                        this._loadedHub.clearDataContext();
                        this._loadedHub = null
                    }
                    this.handlePanelReset();
                    this._loadedHub = currentHub;
                    if (currentHub.options) {
                        var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        navigationService.currentHub = currentHub.options.hub
                    }
                    MS.Entertainment.Utilities.empty(this.hubContainer);
                    window.msWriteProfilerMark("ent:MusicPage.LoadHubTemplate,StartTM");
                    MS.Entertainment.UI.Framework.loadTemplate(currentHub.fragmentUrl, null, true).then(function renderHub(controlInstance) {
                        if (this._loadedHub === currentHub)
                            return this._renderHub(controlInstance, currentHub)
                    }.bind(this)).then(function finalizeHub() {
                        this.loadedOnce = true
                    }.bind(this));
                    MS.Entertainment.UI.Framework.assert(!this._complexBindings, "bindings should have been cleared");
                    if (!this._lastChangeWasNavigate)
                        this._startViewModelQuery();
                    this._lastChangeWasNavigate = false;
                    var viewModelBindings = {
                            modifierDescriptionFormatter: {result: this._modifierDescriptionChanged.bind(this)}, isFailed: this._setIsFailed.bind(this), titleOverride: this._titleOverrideChanged.bind(this), pivotSelectedIndexOverride: this._pivotSelectedIndexOverrideChanged.bind(this)
                        };
                    if (!this.modifiersUsePanels) {
                        viewModelBindings["modifierSelectionManager"] = {dataSource: this._refreshModifierSelectionManagers.bind(this)};
                        viewModelBindings["filterSelectionManager"] = {dataSource: this._refreshFilterSelectionManagers.bind(this)};
                        viewModelBindings["secondaryModifierSelectionManager"] = {dataSource: this._refreshModifierSelectionManagers.bind(this)}
                    }
                    if (!this.pivotsUsePanels)
                        viewModelBindings["pivotsSelectionManager"] = {dataSource: this._refreshPivotSelectionManagers.bind(this)};
                    if (this.hideNavigationContainer)
                        WinJS.Utilities.addClass(this._pivotControl.domElement, "removeFromDisplay");
                    this._complexBindings = WinJS.Binding.bind(currentHub, {dataContext: {
                            viewModel: viewModelBindings, minModifierItems: this._minModifierItemsChanged.bind(this)
                        }});
                    this._refreshModifierSelectionManagers();
                    this._refreshFilterSelectionManagers();
                    this._refreshPivotSelectionManagers()
                }, _renderHub: function _renderHub(controlInstance, musicHub) {
                    return controlInstance.render(musicHub, this.hubContainer).then(function raiseEvent() {
                            if (this._loadedHub !== musicHub)
                                return;
                            window.msWriteProfilerMark("ent:MusicPage.LoadHubTemplate,StopTM");
                            if (musicHub.id)
                                this.hubContainer.setAttribute("data-win-automationid", musicHub.id);
                            else
                                this.hubContainer.removeAttribute("data-win-automationid");
                            var domEvent = document.createEvent("Event");
                            domEvent.initEvent("PanelLoadingStarted", true, true);
                            this.hubContainer.dispatchEvent(domEvent);
                            var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                            eventProvider.tracePanel_Load_End(musicHub.id || "");
                            eventProvider.traceHub_Load_End(musicHub.id || "");
                            this._invokePageLoadedOnce();
                            if (!musicHub || !musicHub.dataContext || !musicHub.dataContext.doNotRaisePanelReady) {
                                window.msWriteProfilerMark("ent:MusicPages.RaisePanelReady");
                                MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.hubContainer)
                            }
                        }.bind(this))
                }, _uninitializeSidebar: function _uninitializeSidebar() {
                    if (this._uiStateBindings) {
                        this._uiStateBindings.cancel();
                        this._uiStateBindings = null
                    }
                    if (this._uiStateEventHandlers) {
                        this._uiStateEventHandlers.cancel();
                        this._uiStateEventHandlers = null
                    }
                }, _initializeSidebar: function _initializeSidebar() {
                    this._uninitializeSidebar();
                    if (!this.hideSidebar) {
                        var loadSidebar = this._loadSidebar.bind(this);
                        var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        this._uiStateEventHandlers = MS.Entertainment.Utilities.addEventHandlers(uiState, {windowresize: loadSidebar});
                        this._uiStateBindings = WinJS.Binding.bind(uiState, {isSnapped: loadSidebar});
                        this._signedInUserBindings = WinJS.Binding.bind(signedInUser, {isSubscription: loadSidebar});
                        this._loadSidebar()
                    }
                }, _loadSidebar: function _loadSidebar() {
                    if (this._uiStateEventHandlers && this._uiStateBindings && this._signedInUserBindings && this._sidebarHost) {
                        MS.Entertainment.Utilities.empty(this._sidebarHost);
                        var viewModel = this.currentHub.dataContext.viewModel;
                        if (viewModel.getSidebarItems) {
                            var sidebarItems = viewModel.getSidebarItems(viewModel.view);
                            if (sidebarItems)
                                for (var i = 0; i < sidebarItems.length; i++)
                                    this._sidebarHost.appendChild(sidebarItems[i])
                        }
                        if (this._sidebarHost.children.length > 0)
                            WinJS.Utilities.addClass(this.domElement, "sidebarEnabled");
                        else
                            WinJS.Utilities.removeClass(this.domElement, "sidebarEnabled")
                    }
                }, _invokePageLoadStart: function _invokePageLoadStart() {
                    var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                    eventProvider.traceHubStrip_Load_Start(this.id || "");
                    this._pageLoadedOnce = false;
                    this._pageReadyOnce = false
                }, _invokePageLoadedOnce: function _invokePageLoadedOnce() {
                    if (!this._pageLoadedOnce) {
                        this._pageLoadedOnce = true;
                        var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                        eventProvider.traceHubStrip_Load_End(this.id);
                        var visibleEvent = document.createEvent("Event");
                        visibleEvent.initEvent("HubStripVisible", true, false);
                        this.domElement.dispatchEvent(visibleEvent)
                    }
                }, _invokePageReadyOnce: function _invokePageReadyOnce() {
                    if (!this._pageReadyOnce) {
                        this._pageReadyOnce = true;
                        var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                        eventProvider.traceHubStrip_Ready(this.id);
                        var readyEvent = document.createEvent("Event");
                        readyEvent.initEvent("HubStripLoaded", true, false);
                        this.domElement.dispatchEvent(readyEvent);
                        var readyEvent = document.createEvent("Event");
                        readyEvent.initEvent("HubStripReady", true, false);
                        this.domElement.dispatchEvent(readyEvent);
                        var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        uiState.isHubStripVisible = true;
                        this._initializeSidebar()
                    }
                }
        }, {
            modifierSelectionManager: null, filterSelectionManager: null, secondaryModifierSelectionManager: null, pivotsSelectionManager: null, dataContext: null, id: null, hidePivots: false, showSideContentContainer: false
        }, {
            empty: {}, applyGetPage: function applyGetPage(iaNode) {
                    MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(iaNode, "Components/Music/MusicPageHost.html")
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Music", {MusicHub: MS.Entertainment.defineOptionalObservable(function MusicHubInstance(options) {
            this.options = options;
            if (options && options.hub) {
                this.id = options.hub.iaNode.moniker;
                this.fragmentUrl = options.hub.overrideFragmentUrl;
                if (options.hub.titleProviderFactory) {
                    this._titleProvider = options.hub.titleProviderFactory();
                    this._titleProviderBindings = WinJS.Binding.bind(this._titleProvider, {title: this._titleProviderTitleChanged.bind(this)})
                }
                else
                    this.label = options.hub.title
            }
        }, {
            _dataContext: null, _disposed: false, _titleProvider: null, _titleProviderBindings: null, dispose: function dispose() {
                    this._disposed = true;
                    this.clearDataContext();
                    if (this._titleProviderBindings) {
                        this._titleProviderBindings.cancel();
                        this._titleProviderBindings = null
                    }
                    if (this._titleProvider && this._titleProvider.dispose) {
                        this._titleProvider.dispose();
                        this._titleProvider = null
                    }
                }, _titleProviderTitleChanged: function _titleProviderTitleChanged(title) {
                    if (title) {
                        this.label = title;
                        this.isDisabled = false
                    }
                    else {
                        this.label = String.empty;
                        this.isDisabled = true
                    }
                }, clearDataContext: function clearDataContext() {
                    if (this._dataContextBinds) {
                        this._dataContextBinds.cancel();
                        this._dataContextBinds = null
                    }
                    if (this._dataContext) {
                        if (this._dataContext.viewModel && this._dataContext.viewModel.dispose)
                            this._dataContext.viewModel.dispose();
                        this._dataContext = null
                    }
                    if (this.options && this.options.hub)
                        this.options.hub.clearDataContext()
                }, instance: {get: function() {
                        return this
                    }}, dataContext: {get: function() {
                        var original = this._dataContext;
                        if (!this._disposed) {
                            if (!this._dataContext && this.options && this.options.hub)
                                this._dataContext = this.options.hub.getDataContext();
                            if (!this._dataContext && this.options && this.options.page)
                                this._dataContext = this.options.page.getDataContext()
                        }
                        return this._dataContext
                    }}
        }, {
            id: null, selected: false, label: null, isDisabled: false, titleOverride: null, pivotSelectedIndexOverride: null, fragmentUrl: null, options: null, isRoot: true
        }, {
            empty: {
                dataContext: null, selected: false, id: null, fragmentUrl: null, options: null
            }, isEmpty: function isEmpty(value) {
                    return WinJS.Binding.unwrap(value) === MS.Entertainment.Music.MusicHub.empty
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {SearchResultsPivotTitleProvider: MS.Entertainment.defineObservable(function searchResultsPivotTitleProviderConstructor(defaultStringId, formatStringId, countProperty, hideOnZero) {
            this._defaultString = String.load(defaultStringId);
            this._formatString = String.load(formatStringId);
            this._hideOnZero = hideOnZero;
            var binding = {};
            binding[countProperty] = this._onCountChange.bind(this);
            var searchResultCounts = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.searchResultCounts);
            this._bindings = WinJS.Binding.bind(searchResultCounts, binding)
        }, {
            title: String.empty, _defaultString: null, _formatString: null, _bindings: null, _hideOnZero: false, _onCountChange: function onCountChange(count) {
                    var formattedCount;
                    if (count === -1)
                        this.title = this._defaultString;
                    else if (this._hideOnZero && count === 0)
                        this.title = null;
                    else {
                        formattedCount = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber.format(count);
                        this.title = this._formatString.format(formattedCount)
                    }
                }, dispose: function dispose() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {MusicSearchResultCounts: MS.Entertainment.defineObservable(function searchResultCountsConstructor(){}, {
            clearOnRestore: false, allCount: -1, artistsCount: 0, albumsCount: 0, songsCount: 0, playlistsCount: 0, musicVideosCount: 0, backup: function backup() {
                    this.clearOnRestore = false;
                    return {
                            allCount: this.allCount, artistsCount: this.artistsCount, albumsCount: this.albumsCount, songsCount: this.songsCount, playlistsCount: this.playlistsCount, musicVideosCount: this.musicVideosCount
                        }
                }, restore: function restore(savedSearchResultCounts) {
                    if (!this.clearOnRestore) {
                        this.allCount = savedSearchResultCounts.allCount;
                        this.artistsCount = savedSearchResultCounts.artistsCount;
                        this.albumsCount = savedSearchResultCounts.albumsCount;
                        this.songsCount = savedSearchResultCounts.songsCount;
                        this.playlistsCount = savedSearchResultCounts.playlistsCount;
                        this.musicVideosCount = savedSearchResultCounts.musicVideosCount
                    }
                    else {
                        this.clearCounts();
                        this.clearOnRestore = false
                    }
                }, clearCounts: function clearCounts() {
                    this.allCount = -1;
                    this.artistsCount = 0;
                    this.albumsCount = 0;
                    this.songsCount = 0;
                    this.playlistsCount = 0;
                    this.musicVideosCount = 0
                }
        })});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.searchResultCounts, function getSearchResultCountsService() {
        return new MS.Entertainment.ViewModels.MusicSearchResultCounts
    })
})()
