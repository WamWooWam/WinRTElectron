/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        Dashboard: MS.Entertainment.UI.Framework.defineUserControl(null, function dashboardConstructor(element, options) {
            window.msWriteProfilerMark("ent:Dashboard.Start,StartTM");
            this._panelReadyTimeouts = {};
            this._adjustScrollLimit = this._adjustScrollLimit.bind(this);
            this._calculateSnapPoints = this._calculateSnapPoints.bind(this);
            this._handlersToCancel = MS.Entertainment.Utilities.addEventHandlers(this.domElement, {
                PanelLoadingStarted: this._handlePanelLoadingStarted.bind(this), PanelComplete: this._handlePanelLoadingComplete.bind(this)
            });
            this._networkStatusBinding = WinJS.Binding.bind(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {networkStatus: this._onNetworkStatusChanged.bind(this)})
        }, {
            preventHideDuringInitialize: true, allowAnimations: false, doNotReversePanelsLeftOfHome: false, shouldCalculateSnapPoints: true, _data: null, _defaultHub: null, _leftOfHomeContainerWidth: 0, _panelsStillToLoad: null, _keyboardNavigationManager: null, _currentStatus: MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unknown, _isFrozen: false, _networkStatusBinding: null, _handlersToCancel: null, _currentLeftScrollLimit: 4000, _currentLeftScrollLimitAdjusted: false, _panelReadyTimeouts: null, _leftOfHomeOffset: 4000, _leftOfHomeControls: null, _leftOfHomeOnScreenPromise: null, _leftOfHomeOnScreen: true, _scrollLeft: 0, _ready: false, _frozenScrollPosition: null, _itemControlAppBarSelection: null, _snapPoints: null, _adjustScrollLimit: function _adjustScrollLimit() {
                    if (!this._leftOfHome || this._unloaded)
                        return;
                    if (this._leftOfHome && this._leftOfHome.children.length < 1)
                        return;
                    if (!this._leftOfHomeContainerWidth)
                        this._leftOfHomeContainerWidth = this._leftOfHome.clientWidth;
                    var left = WinJS.Utilities.getRelativeLeft(this._leftOfHome.firstElementChild, this._contentScroller);
                    if (MS.Entertainment.Utilities.getTextDirection() === MS.Entertainment.Utilities.TextDirections.RightToLeft)
                        left = (this._leftOfHomeContainerWidth - WinJS.Utilities.getRelativeLeft(this._leftOfHome.firstElementChild, this.domElement) - this._leftOfHome.firstElementChild.clientWidth);
                    if (left === this._currentLeftScrollLimit)
                        return;
                    this._currentLeftScrollLimit = left;
                    this._contentScroller.style.msScrollLimitXMin = left + "px";
                    this._currentLeftScrollLimitAdjusted = true
                }, _getPanelForElement: function _getPanelForElement(element) {
                    var panel;
                    var panelIndex;
                    var childPanels = WinJS.Utilities.children(this._leftOfHome);
                    childPanels.include(this._homeAndToTheRight.children);
                    childPanels.forEach(function(child, index) {
                        if (child.contains(element)) {
                            panel = child;
                            panelIndex = index
                        }
                    });
                    if (!panel)
                        return;
                    return {
                            panel: panel, index: panelIndex
                        }
                }, _createAndLoadPanel: function _createAndLoadPanel(panelItem, targetContainer) {
                    var panelDiv = document.createElement("div");
                    panelDiv.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.DashboardPanel");
                    panelDiv.setAttribute("data-ent-dashboardPanel", "true");
                    panelDiv.className = "dashboardPanel " + panelItem.moniker + " " + panelItem.hub.iaNode.moniker;
                    targetContainer.appendChild(panelDiv);
                    var readyTimeout = MS.Entertainment.Utilities.isApp2 ? MS.Entertainment.UI.Controls.Dashboard.APP2_READY_TIMEOUT_MS : MS.Entertainment.UI.Controls.Dashboard.READY_TIMEOUT_MS;
                    this._panelReadyTimeouts[panelItem.moniker] = WinJS.Promise.timeout(readyTimeout).then(function() {
                        var domEvent = document.createEvent("Event");
                        domEvent.initEvent("PanelComplete", true, true);
                        domEvent.moniker = panelItem.moniker;
                        panelDiv.dispatchEvent(domEvent)
                    });
                    (new MS.Entertainment.UI.Controls.DashboardPanel(panelDiv, {panelInformation: panelItem}))
                }, _handlePanelLoadingStarted: function _handlePanelLoadingStarted(e) {
                    MS.Entertainment.UI.Controls.assert(e.moniker, "Expected a moniker");
                    var indexOfMoniker = this._data.panelsToLoad.indexOf(e.moniker);
                    if (indexOfMoniker > -1)
                        this._data.panelsToLoad.splice(indexOfMoniker, 1)
                }, _handlePanelLoadingComplete: function _handlePanelLoadingComplete(e) {
                    MS.Entertainment.UI.Controls.assert(e.moniker, "Expected a moniker");
                    var indexOfMoniker = this._data.panelsToComplete.indexOf(e.moniker);
                    if (e.moniker === this._data.defaultPanelMoniker && !this._ready) {
                        var event = document.createEvent("Event");
                        event.initEvent("HubStripVisible", true, false);
                        this.domElement.dispatchEvent(event);
                        if (MS.Entertainment.Utilities.isMusicApp1 && !this._itemControlAppBarSelection)
                            this._itemControlAppBarSelection = new MS.Entertainment.UI.Controls.AppBarSelectionManager(this.domElement);
                        var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        uiState.isHubStripVisible = true;
                        window.msWriteProfilerMark("ent.Dashboard.Visible");
                        window.msWriteProfilerMark("ent:Dashboard.Navigate,StopTM");
                        WinJS.Promise.timeout(50).done(function focusFirstElement() {
                            this.focusHome();
                            this._handlePanelLoadingCompletePart2(e)
                        }.bind(this))
                    }
                    else
                        this._handlePanelLoadingCompletePart2(e)
                }, focusHome: function focusHome() {
                    if (this._homeAndToTheRight && this._homeAndToTheRight.children)
                        this._keyboardNavigationManager.focusFirstItemInContainer(this._homeAndToTheRight.children[0], true, MS.Entertainment.UI.Controls.Overlay.anyVisible())
                }, _handlePanelLoadingCompletePart2: function _handlePanelLoadingCompletePart2(e) {
                    var indexOfMoniker = this._data.panelsToComplete.indexOf(e.moniker);
                    if (indexOfMoniker > -1) {
                        this._data.panelsToComplete.splice(indexOfMoniker, 1);
                        if (this._panelReadyTimeouts[e.moniker])
                            this._panelReadyTimeouts[e.moniker].cancel()
                    }
                    if (!this._data.panelsToComplete.length) {
                        (new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell).traceHubStrip_Load_End("dashboard");
                        var event = document.createEvent("Event");
                        event.initEvent("HubStripLoaded", true, false);
                        this.domElement.dispatchEvent(event);
                        (new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell).traceHubStrip_Ready("dashboard");
                        var event = document.createEvent("Event");
                        event.initEvent("HubStripReady", true, false);
                        this.domElement.dispatchEvent(event);
                        if (!this._ready)
                            MS.Entertainment.Utilities.Telemetry.logPageView(this._contentScroller, {
                                uri: MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).getUserLocation(), pageTypeId: MS.Entertainment.Utilities.Telemetry.PageTypeId.Dash
                            }, {
                                uri: MS.Entertainment.Utilities.Telemetry.TelemetryParameterValues.None, pageTypeId: MS.Entertainment.Utilities.Telemetry.TelemetryParameterValues.None
                            });
                        this._ready = true;
                        this._calculateSnapPoints();
                        this.domElement.addEventListener("PanelReady", this._calculateSnapPoints)
                    }
                    if (this._panelsStillToLoad && this._panelsStillToLoad.length) {
                        var panelInfo = this._panelsStillToLoad.shift();
                        this._createAndLoadPanel(panelInfo.panel, panelInfo.target)
                    }
                }, _calculateSnapPoints: function _calculateSnapPoints() {
                    window.requestAnimationFrame(function() {
                        if (this._unloaded)
                            return;
                        var updateScrollPositions = function(item) {
                                item.scrollPosition = nextOffSet;
                                var itemWidth;
                                if (this.shouldCalculateSnapPoints)
                                    itemWidth = item.clientWidth;
                                else
                                    itemWidth = MS.Entertainment.Utilities.getWindowWidth();
                                nextOffSet += itemWidth;
                                scrollPoints.push(nextOffSet);
                                this._snapPoints.push({
                                    left: item.scrollPosition, right: nextOffSet
                                })
                            }.bind(this);
                        var scrollPoints = [];
                        this._snapPoints = [];
                        var nextOffSet = this._currentLeftScrollLimit;
                        if (this._leftOfHome && this._leftOfHome.children && this._leftOfHome.children.length)
                            Array.prototype.forEach.call(this._leftOfHome.children, updateScrollPositions);
                        if (this._homeAndToTheRight && this._homeAndToTheRight.children && this._homeAndToTheRight.children.length)
                            Array.prototype.forEach.call(this._homeAndToTheRight.children, updateScrollPositions);
                        var snapList;
                        if (!this.shouldCalculateSnapPoints)
                            snapList = "snapInterval(" + this._currentLeftScrollLimit + "px, 100%)";
                        else
                            snapList = "snapList(" + this._currentLeftScrollLimit + "px, " + scrollPoints.join("px, ") + "px)";
                        this._contentScroller.style.msScrollSnapPointsX = snapList
                    }.bind(this))
                }, _buildPanelList: function _buildPanelList() {
                    var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                    eventProvider.traceHubStrip_Load_Start("dashboard");
                    var homeAndToTheRight = this._data.homeAndToTheRight.concat([]);
                    var leftOfHome = this.doNotReversePanelsLeftOfHome ? this._data.leftOfHome.concat([]) : this._data.leftOfHome.reverse();
                    var panelsToLoad = [];
                    panelsToLoad.push({
                        panel: homeAndToTheRight.shift(), target: this._homeAndToTheRight
                    });
                    var max = Math.max(homeAndToTheRight.length, leftOfHome.length);
                    for (var i = 0; i < max; i++) {
                        if (i < leftOfHome.length)
                            panelsToLoad.push({
                                panel: leftOfHome[i], target: this._leftOfHome
                            });
                        if (i < homeAndToTheRight.length)
                            panelsToLoad.push({
                                panel: homeAndToTheRight[i], target: this._homeAndToTheRight
                            })
                    }
                    this._panelsStillToLoad = panelsToLoad;
                    this._leftOfHome.addEventListener("PanelReady", this._adjustScrollLimit);
                    this._leftOfHome.addEventListener("SizeAdjusted", this._adjustScrollLimit);
                    this._leftOfHome.addEventListener("PanelLoadingStarted", this._adjustScrollLimit);
                    if (!leftOfHome.length)
                        this._currentLeftScrollLimitAdjusted = true;
                    var firstPanel = panelsToLoad.shift();
                    if (firstPanel.panel)
                        this._createAndLoadPanel(firstPanel.panel, firstPanel.target)
                }, _onNetworkStatusChanged: function _onNetworkStatusChanged(newValue) {
                    if (!this._isFrozen)
                        switch (newValue) {
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unknown:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unrestricted:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.throttled:
                                WinJS.Utilities.removeClass(this.domElement, "offline");
                                break;
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.onDemand:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.localOnly:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none:
                                WinJS.Utilities.addClass(this.domElement, "offline");
                                break
                        }
                    this._currentState = newValue
                }, initialize: function initialize() {
                    this._title.innerText = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).applicationTitle;
                    if (this._titleIcon)
                        this._titleIcon.innerText = MS.Entertainment.UI.Icon.xboxXenonLogo;
                    this._keyboardNavigationManager = new MS.Entertainment.Framework.DashboardKeyboardNavigationManager(this._contentScroller, this._contentScroller);
                    window.msWriteProfilerMark("ent:Dashboard.Start,StopTM")
                }, freeze: function freeze() {
                    if (!Windows.UI.ViewManagement.ViewSizePreference)
                        if (this._contentScroller)
                            this._frozenScrollPosition = this._scrollLeft;
                    this._isFrozen = true;
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    if (!Windows.UI.ViewManagement.ViewSizePreference)
                        if (this._frozenScrollPosition !== this._contentScroller.scrollLeft) {
                            this._contentScroller.scrollLeft = this._frozenScrollPosition;
                            this._scrollLeft = this._frozenScrollPosition
                        }
                    this._isFrozen = false;
                    this._onNetworkStatusChanged(this._currentState)
                }, unload: function unload() {
                    if (this._networkStatusBinding) {
                        this._networkStatusBinding.cancel();
                        this._networkStatusBinding = null
                    }
                    if (this._handlersToCancel) {
                        this._handlersToCancel.cancel();
                        this._handlersToCancel = null
                    }
                    if (this._itemControlAppBarSelection) {
                        this._itemControlAppBarSelection.dispose();
                        this._itemControlAppBarSelection = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, onNavigateTo: function onNavigateTo(page, hub, panel) {
                    window.msWriteProfilerMark("ent:Dashboard.Navigate,StartTM");
                    var defaultHub = {
                            hub: hub, index: page.hubs.indexOf(hub)
                        };
                    if (hub)
                        MS.Entertainment.UI.Controls.assert(defaultHub.index !== -1, "Didn't find the hub in the pages list of hubs: " + hub.title);
                    if (defaultHub.index === -1)
                        defaultHub.index = 0;
                    var leftOfHome = [];
                    var homeAndToTheRight = [];
                    var panelMonikers = [];
                    page.hubs.forEach(function mapHubToHub(viewHub, index) {
                        MS.Entertainment.UI.Controls.assert(!viewHub.overrideFragmentUrl, "Dashboard doesn't support custom hubs");
                        var bucket;
                        if (index < defaultHub.index)
                            bucket = leftOfHome;
                        else
                            bucket = homeAndToTheRight;
                        viewHub.panels.forEach(function createPanelData(viewPanel, index) {
                            MS.Entertainment.UI.Controls.assert(viewPanel.fragmentUrl, "Don't support not setting fragment for a panel in the dashboard");
                            var newPanel = {
                                    moniker: viewPanel.iaNode.moniker, title: viewPanel.title, fragment: viewPanel.fragmentUrl, page: page, hub: viewHub, panel: viewPanel
                                };
                            bucket.push(newPanel);
                            panelMonikers.push(viewPanel.iaNode.moniker)
                        })
                    });
                    var panelMoniker = WinJS.Utilities.getMember("iaNode.moniker", panel) || "";
                    this._data = {
                        leftOfHome: leftOfHome, homeAndToTheRight: homeAndToTheRight, panelsToLoad: panelMonikers, panelsToComplete: panelMonikers.concat([]), defaultPanelMoniker: panelMoniker
                    };
                    this._buildPanelList()
                }, onScroll: function onScroll() {
                    this._scrollLeft = this._contentScroller.scrollLeft;
                    if ((this._scrollLeft > this._leftOfHomeOffset && !this._leftOfHomeOnScreen) || (this._scrollLeft <= this._leftOfHomeOffset && this._leftOfHomeOnScreen))
                        return;
                    if (!this._leftOfHomeControls || !this._leftOfHomeControls.length)
                        this._leftOfHomeControls = this._leftOfHome.querySelectorAll("[data-win-control]");
                    if (this._leftOfHomeOnScreenPromise) {
                        this._leftOfHomeOnScreenPromise.cancel();
                        this._leftOfHomeOnScreenPromise = null
                    }
                    if (this._scrollLeft > this._leftOfHomeOffset && this._leftOfHomeControls.length) {
                        if (this._leftOfHomeControls) {
                            for (var i = 0; i < this._leftOfHomeControls.length; i++) {
                                var winControl = this._leftOfHomeControls[i].winControl;
                                if (winControl && winControl.onOffScreen)
                                    winControl.onOffScreen()
                            }
                            this._leftOfHomeOnScreen = false
                        }
                    }
                    else if (this._leftOfHomeControls && this._leftOfHomeControls.length)
                        this._leftOfHomeOnScreenPromise = WinJS.Promise.timeout(200).then(function signalOnScreen() {
                            for (var i = 0; i < this._leftOfHomeControls.length; i++) {
                                var winControl = this._leftOfHomeControls[i].winControl;
                                if (winControl && winControl.onOnScreen) {
                                    winControl.onOnScreen();
                                    this._leftOfHomeOnScreenPromise = null
                                }
                            }
                            this._leftOfHomeOnScreen = true
                        }.bind(this))
                }, onSearchClick: function onSearchClick() {
                    MS.Entertainment.Utilities.Telemetry.logTelemetryEventWithUIPath(MS.Entertainment.Utilities.Telemetry.TelemetryEvents.SearchGlyphClick);
                    var searchAction = new MS.Entertainment.UI.Actions.SearchAction;
                    searchAction.execute()
                }, processChildren: true, controlName: "dashboard"
        }, null, {
            READY_TIMEOUT_MS: 3000, APP2_READY_TIMEOUT_MS: 10000
        }), DashboardPanel: MS.Entertainment.UI.Framework.defineUserControl("/Controls/DashboardPanel.html#panelTemplate", function dashboardPanel_Constructor(element, options) {
                this._panelTemplatePromise = MS.Entertainment.UI.Framework.loadTemplate(this.panelInformation.fragment);
                this._applyPanelInformation(this.panelInformation);
                this.domElement.addEventListener("PanelReady", this._handlePanelReady.bind(this));
                window.msWriteProfilerMark("ent:DashboardPanel." + this.panelInformation.moniker + ".Start,StartTM")
            }, {
                _panelReadyEventArgs: null, _panelTemplatePromise: null, _dataContext: null, _panelAction: null, _isLoading: true, _isFailed: false, _failedModel: null, _applyPanelInformation: function _applyPanelInformation(panelInformation) {
                        MS.Entertainment.UI.Controls.assert(panelInformation, "Didn't get any panel infomration. Need that to render");
                        var dataContext;
                        var panelAction;
                        var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                        eventProvider.tracePanel_Load_Start(panelInformation.moniker || String.empty);
                        if (panelInformation.panel) {
                            dataContext = panelInformation.panel.getDataContext();
                            if (!dataContext && panelInformation.hub)
                                dataContext = panelInformation.hub.getDataContext();
                            if (!dataContext && panelInformation.page)
                                dataContext = panelInformation.page.getDataContext()
                        }
                        if (dataContext && dataContext.panelAction)
                            panelAction = dataContext.panelAction;
                        this._dataContext = dataContext;
                        this._panelAction = panelAction
                    }, _handlePanelReady: function _handlePanelReady(e) {
                        if (this._unloaded)
                            return;
                        if (!this._initialized) {
                            this._panelReadyEventArgs = e;
                            return
                        }
                        var domEvent = document.createEvent("Event");
                        domEvent.initEvent("PanelComplete", true, true);
                        domEvent.moniker = this.panelInformation.moniker;
                        this.domElement.dispatchEvent(domEvent);
                        window.msWriteProfilerMark("ent:DashboardPanel." + this.panelInformation.moniker + ".Start,StopTM");
                        (new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell).tracePanel_Ready(this.panelInformation.moniker);
                        if (e.failed || (!e.failed && this._isFailed)) {
                            this._failedModel = e.model;
                            this._isFailed = e.failed
                        }
                        this._isLoading = false;
                        this._adjustLoadingAndContainerPanels()
                    }, _handlePanelReset: function _handlePanelReset(e) {
                        if (!this._isLoading) {
                            (new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell).tracePanel_Load_Start(this.panelInformation.moniker);
                            this._failedModel = null;
                            this._isFailed = false;
                            this._isLoading = true
                        }
                        this._adjustLoadingAndContainerPanels()
                    }, _adjustLoadingAndContainerPanels: function _adjustLoadingAndContainerPanels() {
                        var progressRing;
                        if (!this._isLoading && !this._isFailed) {
                            MS.Entertainment.Utilities.hideElement(this._loadingPanel);
                            MS.Entertainment.Utilities.empty(this._loadingPanel);
                            MS.Entertainment.Utilities.hideElement(this._failedPanel);
                            MS.Entertainment.Utilities.showElement(this._container);
                            WinJS.Utilities.removeClass(this.domElement, "failed");
                            if (this._panelAction)
                                this._panelTitle.action = this._panelAction.action;
                            this._checkAndSetTabIndexOnItem();
                            this._actionBindings = WinJS.Binding.bind(this._panelTitle, {action: {isEnabled: this._checkAndSetTabIndexOnItem.bind(this)}})
                        }
                        else if (!this._isLoading && this._isFailed) {
                            WinJS.Utilities.addClass(this.domElement, "failed");
                            MS.Entertainment.Utilities.hideElement(this._loadingPanel);
                            MS.Entertainment.Utilities.empty(this._loadingPanel);
                            MS.Entertainment.Utilities.showElement(this._container);
                            if (this._panelAction)
                                this._panelTitle.action = null;
                            if (!this._failedPanel.firstElementChild) {
                                var failedControlDiv = document.createElement("div");
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
                            if (this._loadingPanel.children && this._loadingPanel.children.length < 1) {
                                progressRing = document.createElement("progress");
                                progressRing.className = "fillParent win-medium win-ring";
                                this._loadingPanel.appendChild(progressRing)
                            }
                            MS.Entertainment.Utilities.hideElement(this._failedPanel);
                            MS.Entertainment.Utilities.hideElement(this._container)
                        }
                        if (this._panelTitle && this._panelTitle.action && !this._panelTitle.action.automationId)
                            this._panelTitle.action.automationId = this.panelInformation.moniker + "_panelHeader"
                    }, freeze: function freeze() {
                        if (this._dataContext && this._dataContext.viewModel && this._dataContext.viewModel.dashboardFreezeHandler)
                            this._dataContext.viewModel.dashboardFreezeHandler();
                        MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                    }, thaw: function thaw() {
                        MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                        if (this._dataContext && this._dataContext.viewModel && this._dataContext.viewModel.dashboardThawHandler)
                            this._dataContext.viewModel.dashboardThawHandler()
                    }, initialize: function initialize() {
                        window.msWriteProfilerMark("ent:DashboardPanel." + this.panelInformation.moniker + "Init");
                        if (this._panelTitle && this._panelTitle.domElement)
                            MS.Entertainment.Framework.AccUtils.createAndAddAriaLink(this._container, this._panelTitle.domElement, "aria-labelledby");
                        this._adjustLoadingAndContainerPanels();
                        this._panelTemplatePromise.then(function(render) {
                            render.render({dataContext: this._dataContext}, this._container).then(function() {
                                var domEvent = document.createEvent("Event");
                                domEvent.initEvent("PanelLoadingStarted", true, true);
                                domEvent.moniker = this.panelInformation.moniker;
                                this.domElement.dispatchEvent(domEvent);
                                var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                                eventProvider.tracePanel_Load_End(this.panelInformation.moniker || "");
                                if (!this._dataContext || !this._dataContext.doNotRaisePanelReady)
                                    MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement);
                                if (this._panelReadyEventArgs) {
                                    this._handlePanelReady(this._panelReadyEventArgs);
                                    this._panelReadyEventArgs = null
                                }
                            }.bind(this))
                        }.bind(this));
                        this._panelTitle.text = this.panelInformation.title;
                        if (this._panelAction)
                            this._panelTitle.action = this._panelAction.action;
                        else if ((new Microsoft.Entertainment.Configuration.ConfigurationManager).shell.retailExperience)
                            this._panelTitle.visibility = true;
                        else
                            this._panelTitle.visibility = false
                    }, _checkAndSetTabIndexOnItem: function _checkAndSetTabIndexOnItem() {
                        if (this._panelTitle.action && this._panelTitle.action.isEnabled) {
                            if (this.noTitleActionTabStop)
                                this.noTitleActionTabStop.setAttribute("tabindex", -1)
                        }
                        else if (!this.noTitleActionTabStop)
                            this._setupTabPanel(true)
                    }, _setupTabPanel: function _setupTabPanel(retry) {
                        var initialResults = this._container.querySelectorAll(".win-focusable");
                        var firstItem = null;
                        var actualTarget = null;
                        for (var j = 0; j < initialResults.length; j++) {
                            firstItem = initialResults[j];
                            if (this._checkItemValidTarget(firstItem)) {
                                this.noTitleActionTabStop = firstItem;
                                if (this.noTitleActionTabStop) {
                                    this.noTitleActionTabStop.setAttribute("tabindex", 0);
                                    break
                                }
                            }
                        }
                        if (!this.noTitleActionTabStop && initialResults.length > 0 && retry)
                            MS.Entertainment.UI.Framework.waitForControlToInitialize(initialResults[0]).then(function retryFunction() {
                                this._setupTabPanel(false)
                            }.bind(this))
                    }, _checkItemValidTarget: function _checkItemValidTarget(item) {
                        if (item) {
                            var disabledAttribute = item.getAttribute("disabled");
                            return item.currentStyle && item.currentStyle.visibility !== "hidden" && item.currentStyle.display !== "none" && disabledAttribute !== "disabled" && disabledAttribute !== "" && item.offsetHeight !== 0 && item.offsetWidth !== 0
                        }
                        else
                            return false
                    }, unload: function unload() {
                        if (this._dataContext && this._dataContext.dispose)
                            this._dataContext.dispose();
                        if (this._actionBindings) {
                            this._actionBindings.cancel();
                            this._actionBindings = null
                        }
                        if (this._panelReadyEventArgs)
                            this._panelReadyEventArgs = null;
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                    }, onOffScreen: function onOffScreen() {
                        if (this._dataContext && this._dataContext.onOffScreen)
                            this._dataContext.onOffScreen()
                    }, onOnScreen: function onOnScreen() {
                        if (this._dataContext && this._dataContext.onOnScreen)
                            this._dataContext.onOnScreen()
                    }, panelInformation: null, noTitleActionTabStop: null
            })
    })
})()
