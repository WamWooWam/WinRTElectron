/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/CoreFX.js", "/Framework/debug.js", "/Framework/utilities.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {FeaturedContent: MS.Entertainment.UI.Framework.defineUserControl(null, function FeaturedContent_Constructor(element, options) {
            this._view = this._getView()
        }, {
            enableClickEvents: false, doNotRaisePanelReady: false, _suppressFirstTimeBinds: false, _loadedTemplate: String.empty, _dataPromise: null, _dataComplete: null, _eventHandlers: null, _refreshingView: false, controlName: "FeaturedContent", _uiStateEventHandler: null, _refreshViewCallback: null, _bindings: null, initialize: function() {
                    this._dataPromise = new WinJS.Promise(function(c, e, p) {
                        this._dataComplete = c
                    }.bind(this));
                    this._suppressFirstTimeBinds = true;
                    this._clearBindings();
                    this._bindings = [];
                    this._bindings.push(WinJS.Binding.bind(this, {
                        _view: this._loadViewTemplate.bind(this), data: this._dataChanged.bind(this)
                    }));
                    if (this._refreshViewCallback) {
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).removeEventListener("windowresize", this._refreshViewCallback);
                        this._refreshViewCallback = null
                    }
                    this._refreshViewCallback = this._refreshView.bind(this);
                    if (this.templates)
                        this._bindings.push(WinJS.Binding.bind(this, {templates: this._loadViewTemplate.bind(this)}));
                    this._suppressFirstTimeBinds = false;
                    this._loadViewTemplate();
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).addEventListener("windowresize", this._refreshViewCallback)
                }, unload: function unload() {
                    if (this._refreshViewCallback) {
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).removeEventListener("windowresize", this._refreshViewCallback);
                        this._refreshViewCallback = null
                    }
                    if (this._uiStateEventHandler) {
                        this._uiStateEventHandler.cancel();
                        this._uiStateEventHandler = null
                    }
                    if (this._eventHandlers) {
                        this._eventHandlers.cancel();
                        this._eventHandlers = null
                    }
                    this._clearBindings();
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _clearBindings: function _clearBindings() {
                    if (this._bindings)
                        this._bindings.forEach(function unbind(binding) {
                            binding.cancel()
                        });
                    this._bindings = null
                }, _refreshView: function _refreshView() {
                    var newView = this._getView();
                    if (this._view !== newView) {
                        this._refreshingView = true;
                        this._view = newView
                    }
                }, _dataChanged: function _dataChanged() {
                    if (this._suppressFirstTimeBinds)
                        return;
                    if (this.data === null) {
                        if (!this.doNotRaisePanelReady)
                            MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement, true);
                        return
                    }
                    if (this._dataComplete) {
                        this._dataComplete(this.data);
                        this._dataComplete = null
                    }
                    else {
                        this._dataPromise = WinJS.Promise.as(this.data);
                        this._reloadViewTemplate(this._loadedTemplate)
                    }
                }, _setDataOnPreLoadedTemplate: function _setDataOnPreLoadedTemplate() {
                    var dataContext = null;
                    var container = null;
                    for (var i = 0; i < this._numViews; i++) {
                        var child = this.domElement.children[i];
                        if (i === this._view) {
                            WinJS.Utilities.removeClass(child, "removeFromDisplay");
                            container = child
                        }
                        else
                            WinJS.Utilities.addClass(child, "removeFromDisplay")
                    }
                    this._onTemplateLoaded(container);
                    if (WinJS.Utilities.hasClass(container, "bindingBlock"))
                        container = container.children[0];
                    this._dataPromise.then(function processAll(data) {
                        dataContext = data;
                        if (WinJS.Utilities.hasClass(container, "bindingBlock"))
                            return MS.Entertainment.UI.Framework.processDeclarativeControlContainer(container.winControl);
                        else
                            return WinJS.UI.processAll(container)
                    }).then(function processAll() {
                        return WinJS.Binding.processAll(container, dataContext)
                    }).done(function updatePlaybackControlBinds() {
                        var nowPlayingChild = this._nowPlaying && this._nowPlaying.children[0];
                        if (nowPlayingChild && this._nowPlayingControl)
                            WinJS.Binding.processAll(nowPlayingChild, this._nowPlayingControl);
                        if (this._upgradeTile && this._upgradeTile.domElement)
                            WinJS.Binding.processAll(this._upgradeTile.domElement, this._upgradeTile)
                    }.bind(this), function onError(error) {
                        if (error && error.message !== "Canceled")
                            MS.Entertainment.UI.Controls.fail("Error occurred while processing featured content changes: " + (error && error.message))
                    })
                }, _loadViewTemplate: function _loadViewTemplate(newValue, oldValue) {
                    MS.Entertainment.UI.Controls.assert(this._view > -1, "No view set");
                    if (this._suppressFirstTimeBinds) {
                        if (!this._suppressFirstTimeBinds)
                            MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement, true);
                        return
                    }
                    if (this.templates) {
                        var maxSuppliedTemplateIndex = this.templates.length - 1;
                        var selectedTemplate = this.templates[Math.min(this._view, maxSuppliedTemplateIndex)];
                        if (selectedTemplate !== this._loadedTemplate) {
                            MS.Entertainment.Utilities.empty(this.domElement);
                            if (selectedTemplate)
                                this._reloadViewTemplate(selectedTemplate);
                            else
                                this._loadedTemplate = String.empty
                        }
                    }
                    else if (this.domElement)
                        this._setDataOnPreLoadedTemplate()
                }, _reloadViewTemplate: function _reloadViewTemplate(template) {
                    if (!template || !this.domElement) {
                        if (this.domElement)
                            this._setDataOnPreLoadedTemplate();
                        return
                    }
                    MS.Entertainment.Utilities.empty(this.domElement);
                    var container = document.createElement("div");
                    this.domElement.appendChild(container);
                    MS.Entertainment.Utilities.loadHtmlPage(template, container, this._dataPromise).then(function() {
                        if (this._unloaded)
                            return;
                        this._loadedTemplate = template;
                        this._onTemplateLoaded(container)
                    }.bind(this))
                }, _onTemplateLoaded: function _onTemplateLoaded(container) {
                    this._refreshingView = false;
                    if (!this.doNotRaisePanelReady)
                        MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement);
                    if (this.enableClickEvents) {
                        if (this._eventHandlers) {
                            this._eventHandlers.cancel();
                            this._eventHandlers = null
                        }
                        this._eventHandlers = MS.Entertainment.Utilities.addEvents(container, {click: this._onItemClicked.bind(this)})
                    }
                }, _onItemClicked: function _onItemClicked(e) {
                    if (this._uiStateEventHandler) {
                        this._uiStateEventHandler.cancel();
                        this._uiStateEventHandler = null
                    }
                    var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    if (uiStateService.stageThreeActivated) {
                        var element = e.srcElement;
                        while (element && element !== this.domElement) {
                            if (element.clickDataContext && element.clickDataContext.doclick) {
                                element.clickDataContext.doclick({
                                    target: element.clickDataContext, domElement: element
                                });
                                e.stopPropagation();
                                return
                            }
                            else if (element === this._dashboardNowPlaying && this._nowPlayingControl) {
                                this._nowPlayingControl.nowPlayingClick();
                                e.stopPropagation();
                                return
                            }
                            element = element.parentElement
                        }
                    }
                    else {
                        var oldEvent = e;
                        this._uiStateEventHandler = MS.Entertainment.Utilities.addEventHandlers(uiStateService, {stageThreeActivatedChanged: function stageThreeActivatedChanged(activateEvent) {
                                if (activateEvent.detail.newValue)
                                    this._onItemClicked(oldEvent)
                            }.bind(this)})
                    }
                }, _getView: function _getView() {
                    return MS.Entertainment.UI.Controls.FeaturedContent.getViewByResolution()
                }
        }, {
            _view: -1, _numViews: 2, data: undefined, templates: null
        }, {getViewByResolution: function getViewByResolution() {
                return (MS.Entertainment.Utilities.isHighResolution() ? 1 : 0)
            }})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {SpotlightFeaturedContent: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.FeaturedContent", null, null, {
            _nowPlayingControl: null, _nowPlayingBindings: null, _upgradeServiceBindings: null, _scriptsLoadedEventHandler: null, unload: function unload() {
                    if (this._nowPlayingBindings) {
                        this._nowPlayingBindings.cancel();
                        this._nowPlayingBindings = null
                    }
                    if (this._upgradeServiceBindings) {
                        this._upgradeServiceBindings.cancel();
                        this._upgradeServiceBindings = null
                    }
                    if (this._nowPlayingControl)
                        this._nowPlayingControl = null;
                    MS.Entertainment.UI.Controls.FeaturedContent.prototype.unload.call(this)
                }, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.FeaturedContent.prototype.initialize.call(this);
                    if (!MS.Entertainment.Utilities.isApp2) {
                        var upgradeService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.upgradeReminderDisplayer);
                        this._upgradeServiceBindings = MS.Entertainment.Utilities.addEventHandlers(upgradeService, {upgradeRequiredChanged: this._displayUpgradeMessageIfNeeded.bind(this)})
                    }
                }, _onTemplateLoaded: function _onTemplateLoaded(container) {
                    if (this._scriptsLoadedEventHandler) {
                        this._scriptsLoadedEventHandler.cancel();
                        this._scriptsLoadedEventHandler = null
                    }
                    MS.Entertainment.UI.Controls.FeaturedContent.prototype._onTemplateLoaded.apply(this, arguments);
                    MS.Entertainment.UI.Framework.processDeclMembers(container, this, true);
                    var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    if (uiStateService.stageThreeActivated)
                        this._loadNowPlayingTile(container);
                    else
                        this._scriptsLoadedEventHandler = MS.Entertainment.Utilities.addEventHandlers(uiStateService, {stageThreeActivatedChanged: function stageThreeActivatedChanged(activateEvent) {
                                if (activateEvent.detail.newValue) {
                                    if (this._scriptsLoadedEventHandler) {
                                        this._scriptsLoadedEventHandler.cancel();
                                        this._scriptsLoadedEventHandler = null
                                    }
                                    this._loadNowPlayingTile(container)
                                }
                            }.bind(this)})
                }, _loadNowPlayingTile: function loadNowPlayingTile(container) {
                    var host = null;
                    if (this._nowPlaying && this._nowPlaying.appendChild && !this._nowPlayingControl) {
                        MS.Entertainment.Utilities.empty(this._nowPlaying);
                        host = document.createElement("div");
                        host.className = "fillParent homeHubNowPlayingTile";
                        this._nowPlaying.appendChild(host);
                        MS.Entertainment.Utilities.toggleHideOnElement(this._nowPlaying, false);
                        var options = {
                                allowAnimations: false, preventHideDuringInitialize: true, isRemoteSession: false
                            };
                        if (host)
                            this._nowPlayingControl = new MS.Entertainment.UI.Controls.HomeNowPlayingTilePoster(host, options);
                        if (this._nowPlayingControl) {
                            WinJS.Binding.processAll(host, this._nowPlayingControl);
                            this._nowPlayingBindings = WinJS.Binding.bind(this._nowPlayingControl, {visible: function bind_nowPlaying() {
                                    if (this._nowPlayingControl.visible)
                                        WinJS.Utilities.addClass(this.domElement.parentElement.parentElement, "nowPlayingTileShowing");
                                    else
                                        WinJS.Utilities.removeClass(this.domElement.parentElement.parentElement, "nowPlayingTileShowing")
                                }.bind(this)})
                        }
                    }
                    this._displayUpgradeMessageIfNeeded()
                }, _upgradeTile: null, _displayUpgradeMessageIfNeeded: function _displayUpgradeMessageIfNeeded() {
                    if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.upgradeReminderDisplayer) || !MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.upgradeReminderDisplayer).upgradeRequired || !this._upgradeContainer)
                        return;
                    MS.Entertainment.Utilities.empty(this._upgradeContainer);
                    var host = document.createElement("div");
                    host.className = "fillParent";
                    this._upgradeContainer.appendChild(host);
                    MS.Entertainment.Utilities.toggleHideOnElement(this._upgradeContainer, false);
                    MS.Entertainment.UI.Controls.UpgradeTile.getUpgradeFeedInformation().done(function(data) {
                        this._upgradeTile = new MS.Entertainment.UI.Controls.UpgradeTile(host, data)
                    }.bind(this))
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {NowPlayingFeaturedContent: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.SpotlightFeaturedContent", null, null, {
            controlName: "NowPlayingFeaturedContent", _nowPlayingControl: null, _userEngagementBinding: null, _userEngagementMessage: null, _userEngagementService: null, _uiStateService: {get: function() {
                        return MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState)
                    }}, freeze: function freeze() {
                    this._releaseNowPlayingControl();
                    MS.Entertainment.UI.Controls.SpotlightFeaturedContent.prototype.freeze.call(this)
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Controls.SpotlightFeaturedContent.prototype.thaw.call(this);
                    if (!this._refreshingView)
                        this._reclaimNowPlayingControl()
                }, unload: function unloaded() {
                    this._releaseNowPlayingControl();
                    if (this._userEngagementBinding) {
                        this._userEngagementBinding.cancel();
                        this._userEngagementBinding = null
                    }
                    MS.Entertainment.UI.Controls.SpotlightFeaturedContent.prototype.unload.call(this)
                }, _onTemplateLoaded: function _onTemplateLoaded(container) {
                    MS.Entertainment.UI.Controls.FeaturedContent.prototype._onTemplateLoaded.apply(this, arguments);
                    MS.Entertainment.UI.Framework.processDeclMembers(container, this, true);
                    if (!this._uiStateService.isSnapped)
                        this._reclaimNowPlayingControl();
                    this._displayUpgradeMessageIfNeeded();
                    if (this.outOfBandMessagingContainer) {
                        if (!this._userEngagementService)
                            this._userEngagementService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userEngagementService);
                        if (this._userEngagementService.userEngagementMessageContent)
                            this._showUserEngagementMessage();
                        if (!this._userEngagementBinding)
                            this._userEngagementBinding = MS.Entertainment.UI.Framework.addEventHandlers(this._userEngagementService, {
                                displayUserEngagementServiceVisuals: this._showUserEngagementMessage.bind(this), hideUserEngagementServiceVisuals: this._hideUserEngagementMessage.bind(this)
                            })
                    }
                }, _showUserEngagementMessage: function _showUserEngagementMessage() {
                    WinJS.Utilities.removeClass(this.outOfBandMessagingContainer, "removeFromDisplay");
                    MS.Entertainment.Utilities.empty(this.outOfBandMessagingContainer);
                    var messagingContainerInnerDiv = document.createElement("div");
                    messagingContainerInnerDiv.className = this.outOfBandMessagingContainer.className;
                    this._userEngagementMessage = new MS.Entertainment.UI.UserEngagementServiceMessage(messagingContainerInnerDiv, {userMessageResponse: this._userEngagementService.userEngagementMessageContent});
                    this.outOfBandMessagingContainer.appendChild(messagingContainerInnerDiv);
                    this._hideSecondColumnItemsFromAccessibility()
                }, _hideSecondColumnItemsFromAccessibility: function _hideSecondColumnItemsFromAccessibility() {
                    if (this.columnTwoFirstItem && this.columnTwoFirstItem.domElement) {
                        WinJS.Utilities.removeClass(this.columnTwoFirstItem.domElement, "win-focusable");
                        this.columnTwoFirstItem.domElement.setAttribute("aria-hidden", "true")
                    }
                    if (this.columnTwoSecondItem && this.columnTwoSecondItem.domElement) {
                        WinJS.Utilities.removeClass(this.columnTwoSecondItem.domElement, "win-focusable");
                        this.columnTwoSecondItem.domElement.setAttribute("aria-hidden", "true")
                    }
                    if (this.columnTwoThirdItem && this.columnTwoThirdItem.domElement) {
                        WinJS.Utilities.removeClass(this.columnTwoThirdItem.domElement, "win-focusable");
                        this.columnTwoThirdItem.domElement.setAttribute("aria-hidden", "true")
                    }
                }, _hideUserEngagementMessage: function _hideUserEngagementMessage() {
                    this._showSecondColumnItemsToAccessibility();
                    WinJS.Utilities.addClass(this.outOfBandMessagingContainer, "removeFromDisplay");
                    MS.Entertainment.Utilities.empty(this.outOfBandMessagingContainer);
                    this._userEngagementMessage = null
                }, _showSecondColumnItemsToAccessibility: function _showSecondColumnItemsToAccessibility() {
                    if (this.columnTwoFirstItem && this.columnTwoFirstItem.domElement) {
                        WinJS.Utilities.addClass(this.columnTwoFirstItem.domElement, "win-focusable");
                        this.columnTwoFirstItem.domElement.setAttribute("aria-hidden", "false")
                    }
                    if (this.columnTwoSecondItem && this.columnTwoSecondItem.domElement) {
                        WinJS.Utilities.addClass(this.columnTwoSecondItem.domElement, "win-focusable");
                        this.columnTwoSecondItem.domElement.setAttribute("aria-hidden", "false")
                    }
                    if (this.columnTwoThirdItem && this.columnTwoThirdItem.domElement) {
                        WinJS.Utilities.addClass(this.columnTwoThirdItem.domElement, "win-focusable");
                        this.columnTwoThirdItem.domElement.setAttribute("aria-hidden", "false")
                    }
                }, _reclaimNowPlayingControl: function _getNowPlayingControl() {
                    if (!this._uiStateService.isSnapped) {
                        this._uiStateService.nowPlayingTileVisible = true;
                        this._nowPlayingControl = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.nowPlayingControlManager).getNowPlayingControl(MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying);
                        if (this._dashboardNowPlaying) {
                            MS.Entertainment.Utilities.empty(this._dashboardNowPlaying);
                            this._dashboardNowPlaying.appendChild(this._nowPlayingControl.domElement)
                        }
                    }
                }, _releaseNowPlayingControl: function _releaseNowPlayingControl() {
                    if (this._nowPlayingControl) {
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.nowPlayingControlManager).releaseNowPlayingControl(MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying);
                        this._nowPlayingControl = null
                    }
                    this._uiStateService.nowPlayingTileVisible = false
                }
        })})
})()
