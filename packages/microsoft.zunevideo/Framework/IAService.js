/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/serviceLocator.js");
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.InformationArchitecture");
    WinJS.Namespace.define("MS.Entertainment.InformationArchitecture", {
        ViewRole: {
            page: "page", hub: "hub", panel: "panel"
        }, Viewability: {
                visible: "visible", passThroughToChildren: "passThroughToChildren", hidden: "hidden"
            }
    });
    WinJS.Namespace.define("MS.Entertainment.InformationArchitecture", {Node: MS.Entertainment.UI.Framework.define(function constructNode(title, moniker, panelFragmentUrl, viewabilityByRoles, alwaysPutOnBackStack) {
            this.children = [];
            this.title = title;
            this.moniker = moniker;
            this.panelFragmentUrl = panelFragmentUrl;
            this.viewabilityByRoles = viewabilityByRoles;
            this.alwaysPutOnBackStack = alwaysPutOnBackStack
        }, {
            title: "", moniker: "", viewabilityByRoles: null, children: null, defaultChild: null, parent: null, panelFragmentUrl: "", useStaticHubStrip: false, showShadow: true, alwaysPutOnBackStack: false, featureDisabled: false, showNotifications: true, titleProviderFactory: null, perfTrackStartPoint: null, addChild: function addChild(node) {
                    if (!node.featureDisabled)
                        this.children.push(node);
                    MS.Entertainment.InformationArchitecture.assert(!node.parent, "Child node added to multiple parents.", node.moniker);
                    node.parent = this
                }, removeChild: function removeChild(node) {
                    this.children = this.children.filter(function isNotThatOneNode(element) {
                        return element !== node
                    });
                    MS.Entertainment.InformationArchitecture.assert(node.parent === this, "Cannot remove child of a different node", node.moniker);
                    node.parent = null
                }, getPage: {
                    value: function getPage() {
                        var _dataContext;
                        var eventSource;
                        return {
                                title: this.title, showNotifications: this.showNotifications, useStaticHubStrip: this.useStaticHubStrip, perfTrackStartPoint: this.perfTrackStartPoint, iaNode: this, getDataContext: function getPageDataContext() {
                                        if (!_dataContext)
                                            _dataContext = this.iaNode.getDataContext();
                                        return _dataContext
                                    }, clearDataContext: function clearPanelDataContext() {
                                        _dataContext = null;
                                        if (this.hubs)
                                            this.hubs.forEach(function(hub) {
                                                hub.clearDataContext()
                                            })
                                    }, options: null, addEventListener: function addEventListener(eventType, listener, capture) {
                                        if (!eventSource) {
                                            var eventMixin = WinJS.Class.mix(WinJS.Class.define(null), WinJS.Utilities.eventMixin);
                                            eventSource = new eventMixin
                                        }
                                        eventSource.addEventListener(eventType, listener, capture)
                                    }, removeEventListener: function removeEventListener(eventType, listener, capture) {
                                        if (eventSource)
                                            eventSource.removeEventListener(eventType, listener, capture)
                                    }, dispatchEvent: function dispatchEvent(eventType, details) {
                                        if (eventSource)
                                            return eventSource.dispatchEvent(eventType, details)
                                    }
                            }
                    }, writable: true, enumerable: true, configurable: false
                }, getHub: {
                    value: function getHub() {
                        var _dataContext;
                        return {
                                title: this.title, showNotifications: this.showNotifications, iaNode: this, titleProviderFactory: this.titleProviderFactory, getDataContext: function getHubDataContext() {
                                        if (!_dataContext)
                                            _dataContext = this.iaNode.getDataContext();
                                        return _dataContext
                                    }, clearDataContext: function clearPanelDataContext() {
                                        _dataContext = null;
                                        if (this.panels)
                                            this.panels.forEach(function(panel) {
                                                panel.clearDataContext()
                                            })
                                    }
                            }
                    }, writable: true, enumerable: true, configurable: false
                }, getPanel: {
                    value: function getPanel() {
                        var _dataContext;
                        MS.Entertainment.InformationArchitecture.assert(!!this.panelFragmentUrl, "Default getPanel() called on a Node with no panel fragment URL.", this.moniker);
                        return {
                                title: this.title, iaNode: this, showShadow: this.showShadow, fragmentUrl: this.panelFragmentUrl, getDataContext: function getPanelDataContext() {
                                        if (!_dataContext)
                                            _dataContext = this.iaNode.getDataContext();
                                        return _dataContext
                                    }, clearDataContext: function clearPanelDataContext() {
                                        _dataContext = null
                                    }
                            }
                    }, writable: true, enumerable: true, configurable: false
                }, getDataContext: {
                    value: function getDataContext() {
                        return null
                    }, writable: true, enumerable: true, configurable: false
                }
        }, {
            preventBackNavigation: function preventBackNavigation(node) {
                if (!node)
                    return;
                var oldGetPage = node.getPage;
                node.getPage = function preventBackNavigationGetPage() {
                    var page = oldGetPage.call(this);
                    var visited = false;
                    page.onNavigatingTo = function preventBackNavigationOnNavigatingTo() {
                        if (visited)
                            return true;
                        else {
                            visited = true;
                            return false
                        }
                    };
                    return page
                }
            }, overridePageFragmentUrl: function overridePageFragmentUrl(node, fragmentUrl) {
                    if (!node)
                        return;
                    var oldGetPage = node.getPage;
                    node.getPage = function createPageOverridePageFragmentUrl() {
                        var page = oldGetPage.call(this);
                        page.overrideFragmentUrl = fragmentUrl;
                        return page
                    }
                }, overrideHubFragmentUrl: function overrideHubFragmentUrl(node, fragmentUrl) {
                    if (!node)
                        return;
                    var oldGetHub = node.getHub;
                    node.getHub = function createHubOverrideHubFragmentUrl() {
                        var hub = oldGetHub.call(this);
                        hub.overrideFragmentUrl = fragmentUrl;
                        return hub
                    }
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.InformationArchitecture", {IAService: MS.Entertainment.UI.Framework.define(function constructIAService() {
            this._createRoot()
        }, {
            _nodesByMoniker: null, _featureEnablementModel: null, _handlers: [], _initialized: false, rootNode: null, isInitialized: {get: function get_initialized() {
                        return this._initialized
                    }}, _hasValue: function _hasValue(value) {
                    return typeof value !== "undefined" && value !== null
                }, _createRoot: function _createRoot() {
                    this._nodesByMoniker = {};
                    var rootNode = this.createNode("", MS.Entertainment.UI.Monikers.root, null, null, MS.Entertainment.InformationArchitecture.ViewRole.page);
                    rootNode.getPage = (function() {
                        var oldGetPage = rootNode.getPage;
                        return function customRootGetPage() {
                                var page = oldGetPage.call(this);
                                if (MS.Entertainment.Utilities.isVideoApp2) {
                                    page.overrideFragmentUrl = "/Components/Video2/HorizontalDashboardPage.html";
                                    page.getDataContext = function getDataContext() {
                                        return new MS.Entertainment.ViewModels.VideoDashboardViewModel
                                    }
                                }
                                else if (MS.Entertainment.Utilities.isMusicApp2 && (new Microsoft.Entertainment.Configuration.ConfigurationManager).music.useDXDashboard) {
                                    page.overrideFragmentUrl = "/Components/Music2/HorizontalDashboardPage.html";
                                    page.getDataContext = function getDataContext() {
                                        return new MS.Entertainment.ViewModels.MusicDashboardViewModel
                                    }
                                }
                                else if (MS.Entertainment.Utilities.isApp2)
                                    page.overrideFragmentUrl = "/Controls/PivotDashboard.html";
                                else if (MS.Entertainment.Utilities.isMusicApp1)
                                    page.overrideFragmentUrl = "/Controls/Music8Dashboard.html";
                                else if (MS.Entertainment.Utilities.isVideoApp1)
                                    page.overrideFragmentUrl = "/Components/Video/VideoSpotlightView1.html";
                                else
                                    page.overrideFragmentUrl = "/Controls/Dashboard.html";
                                return page
                            }
                    })();
                    this.rootNode = rootNode
                }, addIAHandler: function addIAHandler(handler, skipInitialization) {
                    if (!handler) {
                        MS.Entertainment.InformationArchitecture.fail("addIAHandler: No handler specified");
                        return
                    }
                    this._handlers.push({
                        handler: handler, skipInitialization: !!skipInitialization
                    })
                }, initialize: function initialize(resetting) {
                    this._handlers.forEach(function forEachHandler(handlerInfo) {
                        if (handlerInfo)
                            if (!handlerInfo.skipInitialization || resetting)
                                handlerInfo.handler(this)
                    }.bind(this));
                    this._initialized = true
                }, reset: function reset() {
                    this._createRoot();
                    this.initialize(true)
                }, getNode: function getNode(moniker) {
                    MS.Entertainment.InformationArchitecture.assert(MS.Entertainment.UI.Monikers.hasOwnProperty(moniker), "Moniker passed to getNode() is not part of the Monikers enumeration.", moniker);
                    return this._nodesByMoniker[moniker]
                }, createNode: function createNode(title, moniker, panelFragmentUrl, viewabilityByRoles, alwaysPutOnBackStack, feature) {
                    var Viewability = MS.Entertainment.InformationArchitecture.Viewability;
                    var ViewRole = MS.Entertainment.InformationArchitecture.ViewRole;
                    var addNode = true;
                    var newNode;
                    MS.Entertainment.InformationArchitecture.assert(MS.Entertainment.UI.Monikers.hasOwnProperty(moniker), "Moniker passed to createNode() is not part of the Monikers enumeration.", moniker);
                    MS.Entertainment.InformationArchitecture.assert(!this._nodesByMoniker[moniker], "Moniker passed to createNode() is already in use.", moniker);
                    panelFragmentUrl = panelFragmentUrl || null;
                    viewabilityByRoles = viewabilityByRoles || {};
                    if (!viewabilityByRoles[ViewRole.page])
                        viewabilityByRoles[ViewRole.page] = Viewability.visible;
                    MS.Entertainment.InformationArchitecture.assert(Viewability.hasOwnProperty(viewabilityByRoles[ViewRole.page]), "Invalid page viewability passed to createNode().", viewabilityByRoles[ViewRole.page]);
                    if (!viewabilityByRoles[ViewRole.hub])
                        viewabilityByRoles[ViewRole.hub] = Viewability.visible;
                    MS.Entertainment.InformationArchitecture.assert(Viewability.hasOwnProperty(viewabilityByRoles[ViewRole.hub]), "Invalid hub viewability passed to createNode().", viewabilityByRoles[ViewRole.hub]);
                    if (!viewabilityByRoles[ViewRole.panel])
                        viewabilityByRoles[ViewRole.panel] = panelFragmentUrl ? Viewability.visible : Viewability.passThroughToChildren;
                    MS.Entertainment.InformationArchitecture.assert(Viewability.hasOwnProperty(viewabilityByRoles[ViewRole.panel]), "Invalid panel viewability passed to createNode().", viewabilityByRoles[ViewRole.panel]);
                    newNode = new MS.Entertainment.InformationArchitecture.Node(title, moniker, panelFragmentUrl, viewabilityByRoles, alwaysPutOnBackStack);
                    if (feature) {
                        if (!this._featureEnablementModel)
                            this._featureEnablementModel = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        addNode = this._featureEnablementModel.isEnabled(feature)
                    }
                    if (addNode)
                        this._nodesByMoniker[moniker] = newNode;
                    else
                        newNode.featureDisabled = true;
                    return newNode
                }, getViewFromNode: function getViewFromNode(node) {
                    var pages = this._getPagesForNode(node);
                    MS.Entertainment.InformationArchitecture.assert(pages.length === 1, "Wrong number of pages found for node in getViewForNode().", node.moniker);
                    return pages[0] || null
                }, _getPagesForNode: function _getPageForNode(node) {
                    var Viewability = MS.Entertainment.InformationArchitecture.Viewability;
                    var result = [];
                    var page;
                    switch (node.viewabilityByRoles[MS.Entertainment.InformationArchitecture.ViewRole.page]) {
                        case Viewability.visible:
                            page = node.getPage();
                            if (this._hasValue(page.title) && page.iaNode) {
                                page.hubs = page.hubs || this._nestedMap(node.children, this._getHubsForNode);
                                result = [page]
                            }
                            else
                                MS.Entertainment.InformationArchitecture.assert(false, "Page returned by node is not really a Page.", node.moniker);
                            break;
                        case Viewability.passThroughToChildren:
                            result = this._nestedMap(node.children, this._getPagesForNode);
                            break;
                        case Viewability.hidden:
                            break;
                        default:
                            MS.Entertainment.InformationArchitecture.assert(false, "Unknown viewability detected for Page role of node.", node.moniker);
                            break
                    }
                    return result
                }, _getHubsForNode: function _getHubsForNode(node) {
                    var Viewability = MS.Entertainment.InformationArchitecture.Viewability;
                    var result = [];
                    var hub;
                    switch (node.viewabilityByRoles[MS.Entertainment.InformationArchitecture.ViewRole.hub]) {
                        case Viewability.visible:
                            hub = node.getHub();
                            if (this._hasValue(hub.title) && hub.iaNode) {
                                hub.panels = hub.panels || this._nestedMap(node.children, this._getPanelsForNode);
                                result = [hub]
                            }
                            else
                                MS.Entertainment.InformationArchitecture.assert(false, "Hub returned by node is not really a Hub.", node.moniker);
                            break;
                        case Viewability.passThroughToChildren:
                            result = this._nestedMap(node.children, this._getHubsForNode);
                            break;
                        case Viewability.hidden:
                            break;
                        default:
                            MS.Entertainment.InformationArchitecture.assert(false, "Unknown viewability detected for Hub role of node.", node.moniker);
                            break
                    }
                    return result
                }, _getPanelsForNode: function _getPanelsForNode(node) {
                    var Viewability = MS.Entertainment.InformationArchitecture.Viewability;
                    var result = [];
                    var panel;
                    switch (node.viewabilityByRoles[MS.Entertainment.InformationArchitecture.ViewRole.panel]) {
                        case Viewability.visible:
                            panel = node.getPanel();
                            if (this._hasValue(panel.title) && panel.iaNode && panel.fragmentUrl)
                                result = [panel];
                            else
                                MS.Entertainment.InformationArchitecture.assert(false, "Panel returned by node is not really a Panel.", node.moniker);
                            break;
                        case Viewability.passThroughToChildren:
                            result = this._nestedMap(node.children, this._getPanelsForNode);
                            break;
                        case Viewability.hidden:
                            break;
                        default:
                            MS.Entertainment.InformationArchitecture.assert(false, "Unknown viewability detected for Panel role of node.", node.moniker);
                            break
                    }
                    return result
                }, _nestedMap: function _nestedMap(array, converter) {
                    var that = this;
                    var q = array.reduce(function convertThenFlatten(result, element) {
                            var conversionResult = converter.call(that, element);
                            conversionResult.forEach(function accumulateIfValid(element) {
                                if (element)
                                    result.push(element)
                            });
                            return result
                        }, []);
                    return q
                }, getTestHooks: function getTestHooks() {
                    var that = this;
                    return {getNodeRegistry: function getNodeRegistry() {
                                return that._nodesByMoniker
                            }}
                }
        })});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.informationArchitecture, function getNavigationService() {
        return new MS.Entertainment.InformationArchitecture.IAService
    }, true)
})()
