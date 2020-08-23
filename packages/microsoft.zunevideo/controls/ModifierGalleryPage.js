/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ModifierGalleryPage: MS.Entertainment.UI.Framework.defineUserControl(null, function(element, options) {
            this._traceProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
            var container = element.querySelector("[data-ent-member='_container']");
            WinJS.UI.processAll(container).done(function() {
                WinJS.Binding.processAll(container, this)
            }.bind(this))
        }, {
            processChildren: true, deferInitialization: false, preventHideDuringInitialize: true, controlName: "ModifierGalleryPage", _hubsCalculated: false, initialize: function initialize() {
                    this._initialized = true;
                    this._populateHub();
                    this._calculateHubs();
                    this._modifierControlBindings = WinJS.Binding.bind(this, {
                        galleryModifier: {selectedItem: this._galleryModifierSelectedItemChanged.bind(this)}, primaryModifierControl: {selectedItem: this._primaryModifierSelectedItemChanged.bind(this)}, secondaryModifierControl: {selectedItem: this._secondaryModifierSelectedItemChanged.bind(this)}, tertiaryModifierControl: {selectedItem: this._tertiaryModifierSelectedItemChanged.bind(this)}
                    })
                }, unload: function unload() {
                    if (this._modifierControlBindings) {
                        this._modifierControlBindings.cancel();
                        this._modifierControlBindings = null
                    }
                    if (this._modifierDataSourceBindings) {
                        this._modifierDataSourceBindings.cancel();
                        this._modifierDataSourceBindings = null
                    }
                    if (this._complexBindings) {
                        this._complexBindings.cancel();
                        this._complexBindings = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, onNavigateTo: function onNavigateTo(page, hub, panel) {
                    if (this._ownedPage && (this._ownedPage !== page)) {
                        MS.Entertainment.UI.Controls.fail("Expected to always be called on the same page");
                        return
                    }
                    if (!this._ownedPage)
                        this._ownedPage = page;
                    this._traceProvider.traceHubStrip_Load_Start(page.iaNode.moniker);
                    var selectedHub = page.hubs.indexOf(hub);
                    if (selectedHub !== this.selectedHub) {
                        var panelIndex = Math.max(hub.iaNode.children.indexOf(hub.iaNode.defaultChild), 0);
                        this._panelTemplatePromise = MS.Entertainment.UI.Framework.loadTemplate(hub.panels[panelIndex].fragmentUrl, null, true);
                        this.selectedHub = selectedHub;
                        this.selectedHubItem = page.hubs[this.selectedHub];
                        if (this._complexBindings) {
                            this._complexBindings.cancel();
                            this._complexBindings = null
                        }
                        this._populateHub();
                        if (this._initialized && !this._hubsCalculated)
                            this._calculateHubs()
                    }
                }, handlePanelReady: function handlePanelReady(e) {
                    this._traceProvider.tracePanel_Ready(this._currentPanel.iaNode.moniker);
                    this._traceProvider.traceHub_Ready(this._currentHub.iaNode.moniker);
                    this._traceProvider.traceHubStrip_Ready(this._ownedPage.iaNode.moniker);
                    if (e.failed || (!e.failed && this._isFailed)) {
                        this._failedModel = e.model;
                        this._isFailed = e.failed
                    }
                    var event = document.createEvent("Event");
                    event.initEvent("HubStripVisible", true, false);
                    this.domElement.dispatchEvent(event);
                    this._traceProvider.traceHubStrip_Load_End(this._ownedPage.iaNode.moniker);
                    var event = document.createEvent("Event");
                    event.initEvent("HubStripLoaded", true, false);
                    this.domElement.dispatchEvent(event);
                    this._traceProvider.traceHubStrip_Ready("dashboard");
                    var event = document.createEvent("Event");
                    event.initEvent("HubStripReady", true, false);
                    this.domElement.dispatchEvent(event);
                    this._isLoading = false;
                    this._adjustLoadingAndContainerPanels()
                }, handlePanelReset: function handlePanelReset(e) {
                    if (!this._isLoading) {
                        this._traceProvider.tracePanel_Load_Start(this._currentPanel.iaNode.moniker);
                        this._failedModel = null;
                        this._isFailed = false;
                        this._isLoading = !this.dataContext || this.dataContext.doNotRaisePanelReady
                    }
                    this._adjustLoadingAndContainerPanels()
                }, _ownedPage: null, _currentHub: null, _currentPanel: null, _traceProvider: null, _modifierControlBindings: null, _modifierDataSourceBindings: null, _complexBindings: null, _panelTemplatePromise: null, _adjustLoadingAndContainerPanels: function _adjustLoadingAndContainerPanels() {
                    var progressRing;
                    var failedControlDiv;
                    if (!this._isLoading && !this._isFailed) {
                        MS.Entertainment.Utilities.hideElement(this._loadingPanel);
                        MS.Entertainment.Utilities.empty(this._loadingProgress);
                        MS.Entertainment.Utilities.hideElement(this._failedPanel);
                        MS.Entertainment.Utilities.showElement(this._panelContainer);
                        WinJS.Utilities.removeClass(this.domElement, "failed");
                        if (this._panelAction)
                            this._panelTitle.action = this._panelAction.action
                    }
                    else if (!this._isLoading && this._isFailed) {
                        WinJS.Utilities.addClass(this.domElement, "failed");
                        MS.Entertainment.Utilities.hideElement(this._loadingPanel);
                        MS.Entertainment.Utilities.empty(this._loadingProgress);
                        MS.Entertainment.Utilities.showElement(this._panelContainer);
                        if (this._panelAction)
                            this._panelTitle.action = null;
                        if (!this._failedPanel.firstElementChild) {
                            failedControlDiv = document.createElement("div");
                            failedControlDiv.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.FailedPanel");
                            this._failedPanel.appendChild(failedControlDiv);
                            (new MS.Entertainment.UI.Controls.FailedPanel(failedControlDiv))
                        }
                        this._failedPanel.firstElementChild.winControl.model = this._failedModel;
                        MS.Entertainment.Utilities.showElement(this._failedPanel)
                    }
                    else if (this._isLoading) {
                        WinJS.Utilities.removeClass(this.domElement, "failed");
                        MS.Entertainment.Utilities.showElement(this._loadingPanel);
                        if (this._loadingProgress.children && this._loadingProgress.children.length < 1) {
                            progressRing = document.createElement("progress");
                            progressRing.className = "galleryProgress win-medium win-ring";
                            this._loadingProgress.appendChild(progressRing)
                        }
                        MS.Entertainment.Utilities.hideElement(this._failedPanel);
                        MS.Entertainment.Utilities.hideElement(this._panelContainer)
                    }
                }, _titleOverrideChanged: function _titleOverrideChanged(newValue, oldValue) {
                    if (newValue !== null && newValue !== undefined)
                        this.pageTitle = newValue;
                    else if (this._ownedPage)
                        this.pageTitle = this._ownedPage.title;
                    else
                        this.pageTitle = String.empty
                }, _subTitleOverrideChanged: function _subTitleOverrideChanged(newValue, oldValue) {
                    if (newValue)
                        this.pageSubTitle = newValue;
                    else
                        this.pageSubTitle = String.empty
                }, _secondaryModifierLabelChanged: function _secondaryModifierLabelChanged(newValue, oldValue) {
                    if (!this.secondaryModifierControl)
                        return;
                    if (newValue)
                        this.secondaryModifierControl.descriptionLabel = newValue
                }, _hideHubsChanged: function _hideHubsChanged(newValue, oldValue) {
                    if (newValue === undefined)
                        return;
                    if (newValue) {
                        if (this.galleryModifier && this.galleryModifier.domElement)
                            WinJS.Utilities.addClass(this.galleryModifier.domElement, "removeFromDisplay");
                        WinJS.Utilities.removeClass(this._pageTitle, "removeFromDisplay");
                        WinJS.Utilities.removeClass(this._pageSubTitle, "removeFromDisplay")
                    }
                    else {
                        if (this.galleryModifier && this.galleryModifier.domElement)
                            WinJS.Utilities.removeClass(this.galleryModifier.domElement, "removeFromDisplay");
                        WinJS.Utilities.addClass(this._pageTitle, "removeFromDisplay");
                        WinJS.Utilities.addClass(this._pageSubTitle, "removeFromDisplay")
                    }
                }, _refreshPrimaryModifier: function _refreshPrimaryModifier(value) {
                    this.primaryModifierControl.selectionManager = this.dataContext.viewModel.modifierSelectionManager
                }, _refreshSecondaryModifier: function _refreshSecondaryModifier(value) {
                    this.secondaryModifierControl.selectionManager = this.dataContext.viewModel.secondaryModifierSelectionManager
                }, _populateHub: function _populateHub() {
                    if (!this._initialized || !this._ownedPage)
                        return;
                    if (this._ownedPage.hubs[this.selectedHub] === this._currentHub)
                        return;
                    this._currentHub = this._ownedPage.hubs[this.selectedHub];
                    if (this._ownedPage.hubs.length === 1) {
                        if (this.galleryModifier && this.galleryModifier.domElement)
                            WinJS.Utilities.addClass(this.galleryModifier.domElement, "removeFromDisplay")
                    }
                    else {
                        WinJS.Utilities.addClass(this._pageTitle, "removeFromDisplay");
                        WinJS.Utilities.addClass(this._pageSubTitle, "removeFromDisplay")
                    }
                    MS.Entertainment.Utilities.empty(this._panelContainer);
                    var panelIndex = Math.max(this._currentHub.iaNode.children.indexOf(this._currentHub.iaNode.defaultChild), 0);
                    var oldPanel = this._currentPanel;
                    var panel = this._currentHub.panels[panelIndex];
                    this._currentPanel = panel;
                    var context = MS.Entertainment.UI.Controls.ModifierGalleryPage.extractContextForPanel(this._ownedPage, this._currentHub, panel);
                    this.dataContext = context;
                    if (this._modifierDataSourceBindings)
                        this._modifierDataSourceBindings.cancel();
                    this._modifierDataSourceBindings = WinJS.Binding.bind(context, {
                        primaryModifier: {items: this._hasPrimaryModifierItems.bind(this)}, secondaryModifier: {items: this._hasSecondaryModifierItems.bind(this)}, tertiaryModifier: {items: this._hasTertiaryModifierItems.bind(this)}
                    });
                    MS.Entertainment.UI.Framework.assert(!this._complexBindings, "bindings should have been cleared");
                    this._complexBindings = WinJS.Binding.bind(this.dataContext, {viewModel: {
                            titleOverride: this._titleOverrideChanged.bind(this), subTitleOverride: this._subTitleOverrideChanged.bind(this), secondaryModifierLabelOverride: this._secondaryModifierLabelChanged.bind(this), hideHubs: this._hideHubsChanged.bind(this), modifierSelectionManager: {dataSource: this._refreshPrimaryModifier.bind(this)}, secondaryModifierSelectionManager: {dataSource: this._refreshSecondaryModifier.bind(this)}
                        }});
                    this._traceProvider.traceHub_Load_Start(this._currentHub.iaNode.moniker);
                    this._isLoading = true;
                    this._adjustLoadingAndContainerPanels();
                    if (!this._panelTemplatePromise)
                        this._panelTemplatePromise = MS.Entertainment.UI.Framework.loadTemplate(panel.fragmentUrl, null, true);
                    this._panelTemplatePromise.then(function(render) {
                        if (oldPanel)
                            WinJS.Utilities.removeClass(this._panelContainer, oldPanel.iaNode.moniker);
                        WinJS.Utilities.addClass(this._panelContainer, panel.iaNode.moniker);
                        this._traceProvider.tracePanel_Load_Start(panel.iaNode.moniker);
                        return render.render({dataContext: context}, this._panelContainer)
                    }.bind(this)).done(function() {
                        this._traceProvider.tracePanel_Load_End(panel.iaNode.moniker);
                        this._traceProvider.traceHub_Load_End(this._currentHub.iaNode.moniker);
                        if (!this.dataContext || !this.dataContext.doNotRaisePanelReady)
                            MS.Entertainment.UI.Controls.Panel.raisePanelReady(this._panelContainer)
                    }.bind(this))
                }, _calculateHubs: function _calculateHubs() {
                    if (!this._ownedPage)
                        return;
                    var page = this._ownedPage;
                    var selectedHubItem = this.selectedHubItem;
                    var hubs = page.hubs.map(function(iaHub) {
                            return WinJS.Binding.as({
                                    title: iaHub.title, moniker: iaHub.iaNode.moniker
                                })
                        }.bind(this));
                    if (!this.pageTitle)
                        if (hubs.length === 1)
                            this.pageTitle = hubs[0].title;
                        else
                            this.pageTitle = page.title;
                    WinJS.Utilities.addClass(this.domElement, page.iaNode.moniker);
                    this.hubs = hubs;
                    if (this.galleryModifier) {
                        this.galleryModifier.items = page.hubs;
                        this.galleryModifier.selectedItem = selectedHubItem || this.galleryModifier.selectedItem
                    }
                    this._hubsCalculated = true
                }, _hasPrimaryModifierItems: function _hasPrimaryModifierItems(newValue) {
                    if (!this.primaryModifierControl || !this.primaryModifierControl.domElement)
                        return;
                    if (newValue && newValue.length)
                        WinJS.Utilities.removeClass(this.primaryModifierControl.domElement, "removeFromDisplay");
                    else
                        WinJS.Utilities.addClass(this.primaryModifierControl.domElement, "removeFromDisplay")
                }, _hasSecondaryModifierItems: function _hasSecondaryModifierItems(newValue) {
                    if (!this.secondaryModifierControl || !this.secondaryModifierControl.domElement)
                        return;
                    if (newValue && newValue.length)
                        WinJS.Utilities.removeClass(this.secondaryModifierControl.domElement, "removeFromDisplay");
                    else
                        WinJS.Utilities.addClass(this.secondaryModifierControl.domElement, "removeFromDisplay")
                }, _hasTertiaryModifierItems: function _hasTertiaryModifierItems(newValue) {
                    if (!this.tertiaryModifierControl || !this.tertiaryModifierControl.domElement)
                        return;
                    if (newValue && newValue.length)
                        WinJS.Utilities.removeClass(this.tertiaryModifierControl.domElement, "removeFromDisplay");
                    else
                        WinJS.Utilities.addClass(this.tertiaryModifierControl.domElement, "removeFromDisplay")
                }, _galleryModifierSelectedItemChanged: function _galleryModifierSelectedItemChanged(newValue, oldValue) {
                    if (!newValue || (WinJS.Utilities.getMember("iaNode.moniker", newValue) && WinJS.Utilities.getMember("iaNode.moniker", newValue) === WinJS.Utilities.getMember("selectedHubItem.iaNode.moniker", this)))
                        return;
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    navigationService.navigateTo(this._ownedPage.iaNode, newValue.iaNode)
                }, _primaryModifierSelectedItemChanged: function _primaryModifierSelectedItemChanged(newValue, oldValue) {
                    if (this.dataContext && this.dataContext.primaryModifier && this.dataContext.primaryModifier.selectedItem !== newValue)
                        this.dataContext.primaryModifier.selectedItem = newValue
                }, _secondaryModifierSelectedItemChanged: function _primaryModifierSelectedItemChanged(newValue, oldValue) {
                    if (this.dataContext && this.dataContext.secondaryModifier && this.dataContext.secondaryModifier.selectedItem !== newValue)
                        this.dataContext.secondaryModifier.selectedItem = newValue
                }, _tertiaryModifierSelectedItemChanged: function _primaryModifierSelectedItemChanged(newValue, oldValue) {
                    if (this.dataContext && this.dataContext.tertiaryModifier && this.dataContext.tertiaryModifier.selectedItem !== newValue)
                        this.dataContext.tertiaryModifier.selectedItem = newValue
                }, ignoreFirstOne: true
        }, {
            pageTitle: null, pageSubTitle: null, hubs: null, selectedHub: -1, selectedHubItem: null, dataContext: null
        }, {extractContextForPanel: function extractContextForPanel(page, hub, panel) {
                var getNodeDataContext = function getNodeDataContext(node) {
                        var dataContext = null;
                        if (node) {
                            if (node.clearDataContext)
                                node.clearDataContext();
                            dataContext = node.getDataContext()
                        }
                        return dataContext
                    };
                var dataContext = getNodeDataContext(panel);
                if (!dataContext)
                    dataContext = getNodeDataContext(hub);
                if (!dataContext)
                    dataContext = getNodeDataContext(page);
                MS.Entertainment.UI.Controls.assert(dataContext, "Didn't find a data context on the panel, hub, or page");
                return dataContext || {}
            }})})
})()
