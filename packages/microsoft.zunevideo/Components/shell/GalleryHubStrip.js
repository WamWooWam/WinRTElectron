/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Controls/hubstrip.js", "/Framework/corefx.js", "/Framework/serviceLocator.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Shell", {GalleryHubStrip: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.HubStrip", null, function constructGalleryHubStrip() {
            this._callShowElementOnHubLoad = true;
            this._showPageTitle = true;
            this._showPivots = true
        }, {
            _lastLoadedPage: null, _keyboardNavigationManager: null, getPageTitleFromNavigationService: true, _onCurrentHubChanged: function _onCurrentHubChanged() {
                    if (this.selectedIndex !== -1) {
                        var navigation = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        var currentHubMoniker = this.hubs[this.selectedIndex].id;
                        if (this._lastLoadedPage === WinJS.Binding.unwrap(navigation.currentPage))
                            if (navigation.currentHub.iaNode.moniker !== currentHubMoniker)
                                navigation.navigateTo(null, currentHubMoniker)
                    }
                }, controlName: "GalleryHubStrip", initialize: function initialize() {
                    MS.Entertainment.UI.Controls.HubStrip.prototype.initialize.apply(this, arguments);
                    this.leftEdgeOffset = 0;
                    this.leftPanelOffset = 125;
                    this.rightEdgeOffset = 50;
                    if (this._callShowElementOnHubLoad) {
                        MS.Entertainment.Utilities.hideElement(this._scroller);
                        MS.Entertainment.Utilities.hideElement(this._navigationContainer.domElement)
                    }
                    this.setupAnimations(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigationDirection);
                    this.bind("selectedIndex", this._onCurrentHubChanged.bind(this));
                    this._keyboardNavigationManager = new MS.Entertainment.Framework.KeyboardNavigationManager(this._scroller, this._scroller);
                    if (this._navigationContainer)
                        this._navigationContainer.setTabPanel(this._scroller)
                }, freeze: function freeze() {
                    if (this._initialized)
                        this.setupAnimations(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigationDirection);
                    MS.Entertainment.UI.Controls.HubStrip.prototype.freeze.call(this)
                }, setupAnimations: function setupAnimations(navigationDirection) {
                    if (!navigationDirection)
                        navigationDirection = MS.Entertainment.Navigation.NavigationDirection.forward;
                    if (this._scroller && this._scroller.hasAttribute("data-ent-hideanimation"))
                        WinJS.Utilities.removeClass(this._scroller, this._scroller.getAttribute("data-ent-hideanimation"));
                    if (this._scroller && this._scroller.hasAttribute("data-ent-showanimation"))
                        WinJS.Utilities.removeClass(this._scroller, this._scroller.getAttribute("data-ent-showanimation"));
                    if (this._scroller) {
                        this._scroller.removeAttribute("data-ent-hideanimation");
                        this._scroller.removeAttribute("data-ent-showanimation")
                    }
                    if (this._navigationContainer.domElement.hasAttribute("data-ent-hideanimation"))
                        WinJS.Utilities.removeClass(this._navigationContainer.domElement, this._navigationContainer.domElement.getAttribute("data-ent-hideanimation"));
                    if (this._navigationContainer.domElement.hasAttribute("data-ent-showanimation"))
                        WinJS.Utilities.removeClass(this._navigationContainer.domElement, this._navigationContainer.domElement.getAttribute("data-ent-showanimation"));
                    this._navigationContainer.domElement.removeAttribute("data-ent-hideanimation");
                    this._navigationContainer.domElement.removeAttribute("data-ent-showanimation");
                    this._navigationContainer.domElement.setAttribute("data-ent-hideanimation", "exitPage");
                    this._navigationContainer.domElement.setAttribute("data-ent-showanimation", "enterPage");
                    WinJS.Utilities.addClass(this._navigationContainer, "enterPageOffset2");
                    if (this._scroller) {
                        this._scroller.setAttribute("data-ent-showanimation", "enterPage");
                        this._scroller.setAttribute("data-ent-hideanimation", "exitPage");
                        WinJS.Utilities.addClass(this._scroller, "enterPageOffset3")
                    }
                }, onNavigateTo: function onNavigateTo(page, hub, panel) {
                    var destinationHubIndex;
                    var destinationPanelIndex;
                    if (this._lastLoadedPage !== page) {
                        this.id = page.iaNode.moniker;
                        this.isolateHubs = page.useStaticHubStrip;
                        this.hubs = page.hubs.map(function mapHubToHub(viewHub) {
                            var fragment = viewHub.overrideFragmentUrl || null;
                            var newHub = new MS.Entertainment.UI.Controls.HubStrip.Hub(viewHub.iaNode.moniker, viewHub.title, fragment, {
                                    page: page, hub: viewHub
                                });
                            destinationPanelIndex = Math.max(viewHub.iaNode.children.indexOf(viewHub.iaNode.defaultChild), 0);
                            newHub.defaultPanelIndex = destinationPanelIndex;
                            newHub.panels = viewHub.panels.map(function createPanelData(viewPanel) {
                                var fragment = viewPanel.fragmentUrl || null;
                                var newPanel = new MS.Entertainment.UI.Controls.HubStrip.Panel(viewPanel.iaNode.moniker, viewPanel.title, fragment, null, {
                                        page: page, hub: viewHub, panel: viewPanel
                                    });
                                newPanel.showShadow = viewPanel.showShadow;
                                newPanel.hub = newHub;
                                return newPanel
                            });
                            return newHub
                        });
                        this._lastLoadedPage = page
                    }
                    destinationHubIndex = page.hubs.indexOf(hub);
                    if (destinationHubIndex !== this.selectedIndex)
                        this.moveTo(destinationHubIndex)
                }, shift: function shift(direction) {
                    if (this.isolateHubs)
                        return;
                    var isRightKey = (direction === MS.Entertainment.UI.Actions.ShiftDashboard.Direction.right);
                    var isLeftKey = (direction === MS.Entertainment.UI.Actions.ShiftDashboard.Direction.left);
                    var currentPosition;
                    var desiredPosition;
                    if (isRightKey || isLeftKey) {
                        currentPosition = this.selectedIndex;
                        desiredPosition = currentPosition;
                        if (isRightKey) {
                            if (currentPosition < this._scroller.childNodes.length - 1)
                                desiredPosition = currentPosition + 1
                        }
                        else if (isLeftKey)
                            if (currentPosition > 0)
                                desiredPosition = currentPosition - 1;
                        this.moveTo(desiredPosition, true);
                        this._keyboardNavigationManager.focusFirstItemInContainer(this._scroller.childNodes[this.selectedIndex], true)
                    }
                }
        })})
})()
