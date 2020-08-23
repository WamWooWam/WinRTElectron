/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/utilities.js", "/Controls/PivotControls.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {HubStrip: MS.Entertainment.UI.Framework.defineUserControl("/Controls/HubStrip.html#hubStripTemplate", function hubStripConstructor() {
            this._rebuildUX = this._rebuildUX.bind(this);
            this._handleResize = this._handleResize.bind(this);
            this._currentLoadingHubs = [];
            this._hubsById = {};
            if (this.getPageTitleFromNavigationService) {
                var page = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                this._pageTitle = page.title
            }
        }, {
            ignoreChildrenInitialization: true, _callShowElementOnHubLoad: false, _doNotReshowAnimations: false, _clientWidth: -1, _scrollLeft: -1, _showPageTitle: false, _showAppPreview: false, _showPivots: false, _pageTitle: "", _forceDefaultHubReady: false, _showStarted: false, initialize: function initialize() {
                    var that = this;
                    this.bind("hubs", this.onHubsChanged.bind(this));
                    this.bind("selectedIndex", this.onSelectedIndexChanged.bind(this))
                }, onSelectedIndexChanged: function onSelectedIndexChanged() {
                    if (this.hubs)
                        this.hubs.forEach(function(hub, indexer) {
                            hub.isSelected = (indexer === this.selectedIndex)
                        }, this)
                }, hubLoadedHandler: function hubLoadedHandler(e) {
                    this._hubsLoaded++;
                    if (this._defaultHubIsReady || this.isolateHubs) {
                        var event = document.createEvent("Event");
                        event.initEvent("HubStripVisible", true, false);
                        this.domElement.dispatchEvent(event);
                        this.animateHubStripIn()
                    }
                    this._hubsById[e.hubId].isLoading = false;
                    if (this._hubsLoaded === this.renderedHubs.length) {
                        var domEvent = document.createEvent("Event");
                        domEvent.initEvent("HubStripLoaded", true, true);
                        this.domElement.dispatchEvent(domEvent);
                        (new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell).traceHubStrip_Load_End(this.id)
                    }
                    e.stopPropagation()
                }, animateHubStripIn: function animateHubStripIn() {
                    if (!this._unloaded && ((this._defaultHubIsReady && (this.isolateHubs || (this._hubsLoaded === this.defaultIndex + 1) || (this._hubsLoaded === this.hubs.length))) || this._forceDefaultHubReady)) {
                        this._waitCursor.isBusy = false;
                        if (this._showStarted)
                            return;
                        this._showStarted = true;
                        if (!this.showPanelTitles)
                            this.hidePanelTitles();
                        var stripShownPromise = this.runHubStripAnimation();
                        if (stripShownPromise)
                            stripShownPromise = stripShownPromise.then(function hubStripPromiseComplete() {
                                var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                                uiState.isHubStripVisible = true;
                                var domEvent = document.createEvent("Event");
                                domEvent.initEvent("HubStripReady", true, true);
                                this.domElement.dispatchEvent(domEvent);
                                (new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell).traceHubStrip_Ready(this.id)
                            }.bind(this));
                        return stripShownPromise
                    }
                }, runHubStripAnimation: function runHubStripAnimation() {
                    var stripShownPromise = new WinJS.Promise.wrap;
                    if (!this.isolateHubs) {
                        this.onScroll(null);
                        this._navigationContainer.domElement.parentElement.style.opacity = "1";
                        if (this._callShowElementOnHubLoad && !this._doNotReshowAnimations) {
                            this._doNotReshowAnimations = true;
                            MS.Entertainment.Utilities.showElement(this._navigationContainer.domElement);
                            stripShownPromise = MS.Entertainment.Utilities.showElement(this._scroller).then(function fixOpacity() {
                                this._scroller.style.opacity = "1"
                            }.bind(this))
                        }
                        else
                            this._scroller.style.opacity = "1"
                    }
                    else {
                        this._navigationContainer.domElement.parentElement.style.opacity = "1";
                        if (this._callShowElementOnHubLoad && !this._doNotReshowAnimations) {
                            this._doNotReshowAnimations = true;
                            MS.Entertainment.Utilities.showElement(this._navigationContainer.domElement);
                            stripShownPromise = MS.Entertainment.Utilities.showElement(this._scroller).then(function fixOpacity() {
                                this._scroller.style.opacity = "1"
                            }.bind(this))
                        }
                        else
                            this._scroller.style.opacity = "1"
                    }
                    return stripShownPromise
                }, hubReadyHandler: function hubReadyHandler(e) {
                    this._hubsReady++;
                    this._hubsById[e.hubId].isReady = true;
                    if (!this._forceDefaultHubReady) {
                        if (!this._defaultHubIsReady)
                            if (this.hubs[this.defaultIndex].id === e.hubId) {
                                this._defaultHubIsReady = true;
                                this._setPageTitleVisibility();
                                this.animateHubStripIn();
                                for (var i = 0; i < this._scroller.children.length; i++) {
                                    if (i === this.defaultIndex)
                                        continue;
                                    if (i < this.defaultIndex)
                                        this._currentLoadingHubs.splice(0, 1)
                                }
                                if (this._currentLoadingHubs.length > 0)
                                    WinJS.Utilities.removeClass(this._currentLoadingHubs[0].element, "removeFromDisplay")
                            }
                        if (this._currentLoadingHubs.length > 0 && e.hubId === this._currentLoadingHubs[0].hub.id)
                            do {
                                var justLoadedHub = this._currentLoadingHubs.splice(0, 1);
                                WinJS.Utilities.removeClass(justLoadedHub[0].element, "removeFromDisplay");
                                if (this._currentLoadingHubs.length > 0)
                                    WinJS.Utilities.removeClass(this._currentLoadingHubs[0].element, "removeFromDisplay");
                                else
                                    break
                            } while (this._currentLoadingHubs.length > 0 && this._currentLoadingHubs[0].hub.isReady)
                    }
                }, _forceShowHubStrip: function _forceShowHubStrip() {
                    this._defaultHubIsReady = true;
                    this._setPageTitleVisibility();
                    this.animateHubStripIn();
                    for (var j = 0; j < this._currentLoadingHubs.length; j++)
                        WinJS.Utilities.removeClass(this._currentLoadingHubs[j].element, "removeFromDisplay");
                    this._currentLoadingHubs.length = 0
                }, _setPageTitleVisibility: function _setPageTitleVisibility() {
                    if (!this._unloaded) {
                        if (this._showPageTitle && this._showAppPreview) {
                            WinJS.Utilities.removeClass(this._titleContainer.domElement, "removeFromDisplay");
                            MS.Entertainment.Utilities.showElement(this._titleContainer.domElement);
                            this._title.text = this._pageTitle
                        }
                        else if (this._showPageTitle && !this._showAppPreview && this.hubNavigationTitle) {
                            this.hubNavigationTitle.text = this._pageTitle;
                            WinJS.Utilities.removeClass(this.hubNavigationTitle.domElement, "removeFromDisplay");
                            MS.Entertainment.Utilities.showElement(this.hubNavigationTitle.domElement)
                        }
                        if (this._showPivots)
                            if (this.hubs && this.hubs.length > 1) {
                                WinJS.Utilities.removeClass(this._navigationContainer.domElement, "removeFromDisplay");
                                MS.Entertainment.Utilities.showElement(this._navigationContainer.domElement)
                            }
                            else if (this.hubs && this.hubs.length === 1 && this.hubNavigationTitle) {
                                this.hubNavigationTitle.text = this.hubs[0].title;
                                WinJS.Utilities.addClass(this._titleContainer.domElement, "removeFromDisplay")
                            }
                    }
                }, _handleResize: function _handleResize() {
                    if (this._handleResizeBatch)
                        this._handleResizeBatch.cancel();
                    this._handleResizeBatch = WinJS.Promise.timeout(150).then(function batchRun() {
                        if (!this.isolateHubs)
                            this.selectedIndex = this._calculateCurrentHubIndexFromScrollPosition();
                        else
                            this.moveTo(this.selectedIndex, false, true)
                    }.bind(this))
                }, defaultIndex: 0, isolateHubs: false, showPanelTitles: true, _defaultHubIsReady: false, _handleResizeBatch: null, _childResizeListeners: null, id: "", _scroller: null, _easeVelocity: 0, _easeInterval: -1, _hubsLoaded: 0, _hubsReady: 0, _scrollingInterval: -1, _currentLoadingHubs: null, _hubsById: null, _suppressOtherMoveToScrolling: false, hidePanelTitles: function hidePanelTitles() {
                    var titleElements = this.domElement.querySelectorAll(".panelTitle");
                    Array.prototype.forEach.call(titleElements, function hidePanelTitle(titleElement, indexer) {
                        WinJS.Utilities.addClass(titleElement, "removeFromDisplay")
                    })
                }, buildHubInfoCache: function buildHubInfoCache() {
                    Array.prototype.filter.call(this._scroller.children, function filterFloaters(element) {
                        return !WinJS.Utilities.hasClass(element, "hubStripFloater")
                    }).forEach(function calculateOffsetForHubCache(hub, indexer) {
                        if (indexer <= this.renderedHubs.length - 1) {
                            this.renderedHubs[indexer].domElement = hub;
                            this.renderedHubs[indexer].hubOffset = hub.offsetLeft;
                            this.renderedHubs[indexer].width = hub.clientWidth
                        }
                    }.bind(this))
                }, buildPanelInfoCache: function buildPanelInfoCache(hub, index) {
                    var panels = hub.querySelectorAll(".panel");
                    Array.prototype.forEach.call(panels, function calculateOffsetForPanelCache(panelDom, panelIndexer) {
                        var panel = this.renderedHubs[index].panels[panelIndexer];
                        if (panel) {
                            panel.domElement = panelDom;
                            panel.panelOffset = panelDom.parentElement.offsetLeft;
                            panel.width = panelDom.clientWidth
                        }
                    }.bind(this))
                }, onHubsChanged: function onHubsChanged() {
                    var hubStrip = this;
                    this.selectedIndex = -1;
                    var lastSeenSelectedIndex;
                    if (this.hubs) {
                        this.hubs.forEach(function augmentHub(hub, indexer) {
                            hub.index = indexer;
                            hub.onNavigate = function onHubNavigate() {
                                hubStrip.moveTo(indexer, true)
                            }
                        });
                        if (this.isolateHubs) {
                            this.selectedIndex = this.defaultIndex;
                            this.bind("selectedIndex", function selectedIndexChangedFromHubsChanged() {
                                if (lastSeenSelectedIndex !== this.selectedIndex) {
                                    lastSeenSelectedIndex = this.selectedIndex;
                                    this._rebuildUX()
                                }
                            }.bind(this));
                            WinJS.Utilities.removeClass(this._scroller, "continuousHubStrip")
                        }
                        else {
                            WinJS.Utilities.addClass(this._scroller, "continuousHubStrip");
                            WinJS.Promise.timeout().then(this._rebuildUX)
                        }
                    }
                }, _rebuildUX: function _rebuildUX() {
                    var that = this;
                    var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                    eventProvider.traceHubStrip_Load_Start(this.id || "");
                    this._showStarted = false;
                    WinJS.Promise.timeout(MS.Entertainment.UI.Controls.HubStrip.DEFAULT_HUB_READY_TIMEOUT).then(function showHubStripIfTakenTooLong() {
                        if (!this._showStarted) {
                            this._forceDefaultHubReady = true;
                            this._forceShowHubStrip()
                        }
                    }.bind(this));
                    if (this.isolateHubs)
                        WinJS.Utilities.addClass(this.domElement, "isolateHubs");
                    else
                        WinJS.Utilities.removeClass(this.domElement, "isolateHubs");
                    if (this.isolateHubs && this._scroller.children.length > 0) {
                        this._scroller.firstChild.setAttribute("data-ent-hideanimation", "galleryPanelExit");
                        this._scroller.firstChild.setAttribute("data-ent-showanimation", "galleryPanelEnter");
                        MS.Entertainment.Utilities.removeChild(this._scroller, this._scroller.firstChild).then(function isolateHubExit() {
                            that._rebuildScrollerUX()
                        })
                    }
                    else
                        this._rebuildScrollerUX()
                }, _rebuildScrollerUX: function _rebuildScrollerUX() {
                    var that = this;
                    MS.Entertainment.Utilities.empty(this._scroller);
                    this._waitCursor.isBusy = true;
                    if (!this.hubs || this.hubs.length === 0)
                        return;
                    if (this.isolateHubs) {
                        var index = this.selectedIndex >= 0 ? this.selectedIndex : 0;
                        this.renderedHubs = [this.hubs[index]]
                    }
                    else
                        this.renderedHubs = this.hubs;
                    this._hubsLoaded = 0;
                    this.renderedHubs.forEach(function loadHub(hub, indexer) {
                        if (hub.htmlPage !== "/Controls/Hub.html")
                            that._hubsLoaded++;
                        that._hubsById[hub.id] = hub;
                        var hubContainer = document.createElement("div");
                        hubContainer.className = "hub";
                        hubContainer.id = document.uniqueID;
                        hubContainer.setAttribute("data-win-automationId", hub.id);
                        that._scroller.appendChild(hubContainer);
                        if ((indexer !== that.defaultIndex) && !that.isolateHubs) {
                            that._currentLoadingHubs.push({
                                hub: hub, element: hubContainer
                            });
                            if (indexer > that.defaultIndex) {
                                hub.isLoading = true;
                                WinJS.Utilities.addClass(hubContainer, "removeFromDisplay")
                            }
                        }
                        else if ((indexer === that.defaultIndex) && (!that.isolateHubs) && (that.selectedIndex < 0))
                            that.selectedIndex = that.defaultIndex;
                        MS.Entertainment.Utilities.loadHtmlPage(hub.htmlPage, hubContainer, hub).then(function pageLoaded() {
                            if (hub.options)
                                Array.prototype.forEach.call(hubContainer.children, function passOptionsIfDesired(child) {
                                    var control = child.winControl;
                                    if (control && control.setHubOptions)
                                        control.setHubOptions(hub.options)
                                })
                        })
                    })
                }, onScroll: function onScroll(e) {
                    if (this.isolateHubs)
                        return;
                    this._scrollLeft = this._scroller.scrollLeft;
                    if (this._hubsLoaded === 0 || this._hubsLoaded < this.defaultIndex + 1)
                        return;
                    this._updateIsScrolling();
                    var currentScrollerIndex = this._calculateCurrentHubIndexFromScrollPosition();
                    this.selectedIndex = currentScrollerIndex;
                    this._updatePanelAnimations(this._scrollLeft)
                }, _updatePanelAnimations: function _updatePanelAnimations(offset, updateAllPanels, slideInPanels) {
                    var allLoaded = (this._hubsLoaded > 0 && this._hubsLoaded >= this.defaultIndex + 1);
                    var subPromises = [];
                    if (allLoaded) {
                        if (this._clientWidth < 0)
                            this._clientWidth = this._scroller.clientWidth;
                        var scrollRight = this._scroller.offsetWidth + offset;
                        var gutterThreshold = offset + this._clientWidth - (this._clientWidth * .1);
                        var actionTileThreshold = offset + this._clientWidth - (this._clientWidth * .2);
                        for (var i = 0; i < this.renderedHubs.length; i++) {
                            var hub = this.renderedHubs[i];
                            if (!hub.domElement)
                                continue;
                            if (!updateAllPanels && i !== this.selectedIndex && i !== this.selectedIndex + 1) {
                                hub.isVisible = false;
                                continue
                            }
                            if (hub.width !== hub.domElement.clientWidth || hub.hubOffset !== hub.domElement.offsetLeft) {
                                hub.width = hub.domElement.clientWidth;
                                hub.hubOffset = hub.domElement.offsetLeft
                            }
                            this.buildPanelInfoCache(hub.domElement, i);
                            for (var j = 0; j < hub.panels.length; j++) {
                                var panel = hub.panels[j];
                                if (!panel || !panel.domElement)
                                    continue;
                                if (panel.width !== panel.domElement.clientWidth || panel.panelOffset !== panel.domElement.offsetLeft) {
                                    panel.width = panel.domElement.clientWidth;
                                    panel.panelOffset = panel.domElement.offsetLeft
                                }
                                var panelOffset = panel.panelOffset + hub.hubOffset
                            }
                            hub.isVisible = hub.hubOffset <= scrollRight && hub.hubOffset + hub.width >= offset
                        }
                    }
                    return subPromises.length > 0 ? WinJS.Promise.join(subPromises) : WinJS.Promise.wrap()
                }, _updateIsScrolling: function _updateIsScrolling() {
                    var that = this;
                    if (this._scrollingInterval !== -1)
                        window.clearTimeout(this._scrollingInterval);
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isScrolling = true;
                    this._scrollingInterval = window.setTimeout(function clearScrollingFlag() {
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isScrolling = false;
                        that._scrollingInterval = -1
                    }, 1000)
                }, _calculateCurrentHubIndexFromScrollPosition: function _calculateCurrentHubIndexFromScrollPosition(offset) {
                    if (this._clientWidth < 0)
                        this._clientWidth = this._scroller.clientWidth;
                    if (this._clientWidth <= 0)
                        return -1;
                    var index = 0;
                    var total = 0;
                    var left = offset ? offset : this._scrollLeft;
                    var currentPosition = left + (this._clientWidth / 2);
                    this.buildHubInfoCache();
                    for (index = 0; index < this.renderedHubs.length && total <= currentPosition; index++)
                        total += this.renderedHubs[index].width;
                    index--;
                    while (index > 0 && this.renderedHubs[index - 1].hubOffset >= left)
                        index--;
                    return index
                }, moveTo: function moveToFn(index, snapToLeftEdge, skipAnimation, hubOffset) {
                    var completion;
                    var promise = new WinJS.Promise(function(c, e, p) {
                            completion = c
                        });
                    if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isScrolling && this.selectedIndex === index)
                        return WinJS.Promise.wrap();
                    if (this.isolateHubs)
                        if (this._hubsLoaded === 0)
                            this.defaultIndex = index;
                        else
                            this.selectedIndex = index;
                    else {
                        var destination = 0;
                        if (this._hubsLoaded > 0 && (this._hubsLoaded - 1) >= index) {
                            if (index > this.renderedHubs.length)
                                return;
                            this.buildHubInfoCache();
                            var selectedHub = this.renderedHubs[index];
                            this.buildPanelInfoCache(selectedHub.domElement, index);
                            if (snapToLeftEdge)
                                if (MS.Entertainment.Utilities.getTextDirection() === MS.Entertainment.Utilities.TextDirections.LeftToRight)
                                    destination = (selectedHub.hubOffset + selectedHub.panels[selectedHub.defaultPanelIndex].panelOffset) - this.leftEdgeOffset;
                                else
                                    destination = this._scroller.clientWidth - selectedHub.hubOffset - selectedHub.width - this.leftEdgeOffset;
                            else
                                destination = (selectedHub.hubOffset + selectedHub.panels[selectedHub.defaultPanelIndex].panelOffset) + selectedHub.width - this._scrollWidth + this.rightEdgeOffset;
                            destination = Math.max(destination, 0);
                            if (hubOffset)
                                destination = destination + hubOffset;
                            if (this.animationEnabled)
                                this.scrollToAnimated(destination);
                            else if (!this._suppressOtherMoveToScrolling)
                                this.scrollTo(destination);
                            this.onScroll(null);
                            (new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell).traceHubStrip_MoveToComplete(this.hubs[index].id)
                        }
                        else
                            this.defaultIndex = index;
                        completion();
                        return promise
                    }
                }, scrollTo: function scrollToFn(pixelOffset) {
                    this._scroller.scrollLeft = pixelOffset;
                    this.onScroll(null)
                }, scrollToAnimated: function scrollToAnimatedFn(pixelOffset) {
                    var that = this;
                    var completion;
                    var promise = new WinJS.Promise(function(c, e, p) {
                            completion = c
                        });
                    var eventCount = this._scroller.children.length;
                    var animationEnd = function(event) {
                            eventCount--;
                            if (eventCount === 0) {
                                if (that._scroller !== undefined) {
                                    for (var i = 0; i < that._scroller.children.length; i++) {
                                        that._scroller.children[i].removeEventListener("transitionend", animationEnd, false);
                                        WinJS.Utilities.removeClass(that._scroller.children[i], "hubStripScrollTransition");
                                        that._scroller.children[i].style.msTransform = "translateX(0px)"
                                    }
                                    completion()
                                }
                                that.scrollTo(pixelOffset)
                            }
                        };
                    if (!MS.Entertainment.ServiceLocator || MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).animationsEnabled) {
                        var translateAmount = -(pixelOffset - this._scroller.scrollLeft);
                        for (var i = 0; i < this._scroller.children.length; i++) {
                            this._scroller.children[i].addEventListener("transitionend", animationEnd, false);
                            WinJS.Utilities.addClass(this._scroller.children[i], "hubStripScrollTransition");
                            this._scroller.children[i].style.msTransform = "translateX(" + translateAmount + "px)"
                        }
                    }
                    else
                        this.scrollTo(pixelOffset);
                    return promise
                }
        }, {
            hubs: null, renderedHubs: [], selectedIndex: -1, leftEdgeOffset: 0, leftPanelOffset: 0, rightEdgeOffset: 0, animationEnabled: false
        }, {
            Hub: MS.Entertainment.defineObservable(function hubConstructor(id, title, overrideFragmentUrl, options) {
                this.id = id;
                this.title = title;
                this.htmlPage = overrideFragmentUrl || "/Controls/Hub.html";
                this.instance = this;
                this.options = options;
                this.panels = new MS.Entertainment.ObservableArray
            }, {
                id: "", title: "", htmlPage: "", onNavigate: null, instance: null, options: undefined, panels: null, isVisible: null, isSelected: false, isLoading: false, isReady: false, defaultPanelIndex: 0, doNavigation: function doNavigation() {
                        if (this.winControl.dataSource.instance.onNavigate !== null)
                            this.winControl.dataSource.onNavigate()
                    }
            }), Panel: MS.Entertainment.defineObservable(function panelConstructor(id, title, fragmentUrl, dataContext, options, showShadow) {
                    this.id = id;
                    this.title = title;
                    this.fragmentUrl = fragmentUrl;
                    this.dataContext = dataContext;
                    this.options = options;
                    if (showShadow !== undefined)
                        this.showShadow = showShadow
                }, {
                    id: "", title: "", fragmentUrl: "", dataContext: null, options: undefined, hub: null, showShadow: true
                }), DEFAULT_HUB_READY_TIMEOUT: 10000
        })})
})()
