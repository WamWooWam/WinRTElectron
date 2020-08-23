/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/utilities.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        Hub: MS.Entertainment.UI.Framework.defineUserControl("/Controls/Hub.html#hubControlTemplate", function hubStripConstructor(element, options) {
            if (this.overrideTemplate)
                this._initTemplate(this.overrideTemplate);
            this.panels = [];
            this.eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
            this.domElement.addEventListener("PanelLoadingStarted", function countLoadedPanels(e) {
                this.panelsCompleted++;
                if (this.panelsCompleted === this.panels.length) {
                    this.eventProvider.traceHub_Load_End(this.id || "");
                    WinJS.Utilities.addClass(this.domElement, this.id);
                    var domEvent = document.createEvent("Event");
                    domEvent.initEvent("HubLoaded", true, true);
                    domEvent.hubId = this.id;
                    this.domElement.dispatchEvent(domEvent)
                }
            }.bind(this));
            this.domElement.addEventListener("PanelReady", function panelsReadyHandler() {
                this.panelsReady++;
                if (this.panelsReady === this.panels.length) {
                    var domEvent = document.createEvent("Event");
                    domEvent.initEvent("HubReady", true, true);
                    domEvent.hubId = this.id;
                    this.domElement.dispatchEvent(domEvent);
                    this.eventProvider.traceHub_Ready(this.id || "")
                }
            }.bind(this))
        }, {
            id: null, eventProvider: null, overrideTemplate: "", panelsCompleted: 0, panelsReady: 0, initialize: function initialize() {
                    this.eventProvider.traceHub_Load_Start(this.id || "")
                }
        }, {panels: null}), Panel: MS.Entertainment.UI.Framework.defineUserControl("/Controls/Hub.html#panelControlTemplate", function constructPanel() {
                this._dataContextChanged = this._dataContextChangedImpl.bind(this);
                this._primaryModifierChanged = this._primaryModifierChangedImpl.bind(this);
                this._primaryItemsChanged = this._primaryItemsChangedImpl.bind(this);
                this._primarySelectedItemChanged = this._primarySelectedItemChangedImpl.bind(this);
                this._secondaryModifierChanged = this._secondaryModifierChangedImpl.bind(this);
                this._secondaryItemsChanged = this._secondaryItemsChangedImpl.bind(this);
                this._secondarySelectedItemChanged = this._secondarySelectedItemChangedImpl.bind(this);
                this._tertiaryModifierChanged = this._tertiaryModifierChangedImpl.bind(this);
                this._tertiaryItemsChanged = this._tertiaryItemsChangedImpl.bind(this);
                this._tertiarySelectedItemChanged = this._tertiarySelectedItemChangedImpl.bind(this)
            }, {
                fragmentUrl: "", initialize: function initialize() {
                        var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                        eventProvider.tracePanel_Load_Start(this.id || "");
                        if (this.primaryModifierControl)
                            this.primaryModifierControl.bind("selectedItem", this._primaryModifierControlSelectedItemChanged.bind(this));
                        if (this.secondaryModifierControl) {
                            this.secondaryModifierControl.bind("selectedItem", this._secondaryModifierControlSelectedItemChanged.bind(this));
                            this.secondaryModifierControl.setTabPanel(this.panelFragmentContainer)
                        }
                        if (this.tertiaryModifierControl) {
                            this.tertiaryModifierControl.bind("selectedItem", this._tertiaryModifierControlSelectedItemChanged.bind(this));
                            this.tertiaryModifierControl.setTabPanel(this.panelFragmentContainer)
                        }
                        MS.Entertainment.Framework.AccUtils.createAndAddAriaLink(this.panelContentContainer, this.titleLabel, "aria-labelledby");
                        if (!this.fragmentUrl)
                            return;
                        if (!this.dataContext && this.options && this.options.panel) {
                            this.dataContext = this.options.panel.getDataContext();
                            if (!this.dataContext && this.options.hub)
                                this.dataContext = this.options.hub.getDataContext();
                            if (!this.dataContext && this.options.page)
                                this.dataContext = this.options.page.getDataContext()
                        }
                        this.bind("dataContext", this._dataContextChanged);
                        if (this.dataContext && this.dataContext.panelAction)
                            this.panelAction = this.dataContext.panelAction;
                        this.bind("isLoading", function isLoadingChanged() {
                            if (!this.isLoading || this.hideLoadingPanel) {
                                MS.Entertainment.Utilities.hideElement(this.loadingControl);
                                if (!this.isFailed) {
                                    if (this.titleLabel.text === " ") {
                                        WinJS.Utilities.addClass(this.titleLabel.domElement, "removeFromDisplay");
                                        this.titleLabel.text = String.empty
                                    }
                                    MS.Entertainment.Utilities.showElement(this.panelFragmentContainer)
                                }
                            }
                            else {
                                MS.Entertainment.Utilities.hideElement(this.panelFragmentContainer);
                                if (!this.titleLabel.text)
                                    this.titleLabel.text = " ";
                                this.loadingLabel.textContent = String.load(String.id.IDS_LOADING_STATUS_LABEL);
                                MS.Entertainment.Utilities.showElement(this.loadingControl)
                            }
                        }.bind(this));
                        this.bind("isFailed", function isFailedChanged(newValue, oldValue) {
                            if (this.isFailed) {
                                WinJS.Utilities.addClass(this.domElement, "failed");
                                MS.Entertainment.Utilities.hideElement(this.loadingControl);
                                MS.Entertainment.Utilities.showElement(this.failedControl);
                                MS.Entertainment.Utilities.showElement(this.panelFragmentContainer);
                                var newControl = document.createElement("div");
                                newControl.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.FailedPanel");
                                if (!this.titleLabel.text)
                                    this.titleLabel.text = " ";
                                this.failedControl.appendChild(newControl);
                                WinJS.UI.process(newControl).then(function setModel() {
                                    newControl.winControl.model = this.failedModel
                                }.bind(this));
                                if (this.panelAction) {
                                    var action = WinJS.Binding.unwrap(this.panelAction);
                                    action.action.isEnabled = false
                                }
                                MS.Entertainment.Utilities.hideElement(this.primaryModifierControl.domElement);
                                MS.Entertainment.Utilities.hideElement(this.secondaryModifierControl.domElement);
                                MS.Entertainment.Utilities.hideElement(this.tertiaryModifierControl.domElement)
                            }
                            else {
                                WinJS.Utilities.removeClass(this.domElement, "failed");
                                MS.Entertainment.Utilities.hideElement(this.failedControl);
                                if (oldValue) {
                                    MS.Entertainment.Utilities.showElement(this.panelFragmentContainer);
                                    MS.Entertainment.Utilities.showElement(this.primaryModifierControl.domElement);
                                    MS.Entertainment.Utilities.showElement(this.secondaryModifierControl.domElement);
                                    MS.Entertainment.Utilities.showElement(this.tertiaryModifierControl.domElement);
                                    MS.Entertainment.Utilities.hideElement(this.loadingControl);
                                    if (this.panelAction) {
                                        var action = WinJS.Binding.unwrap(this.panelAction);
                                        action.action.isEnabled = true
                                    }
                                }
                            }
                        }.bind(this));
                        MS.Entertainment.UI.Framework.loadTemplate(this.fragmentUrl).then(function renderControl(controlInstance) {
                            return controlInstance.render(this, this.panelFragmentContainer).then(function raiseEvent() {
                                    if (this.id) {
                                        this.domElement.setAttribute("data-win-automationid", this.id);
                                        WinJS.Utilities.addClass(this.domElement, this.id)
                                    }
                                    var domEvent = document.createEvent("Event");
                                    domEvent.initEvent("PanelLoadingStarted", true, true);
                                    this.panelFragmentContainer.dispatchEvent(domEvent);
                                    var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                                    eventProvider.tracePanel_Load_End(this.id || "")
                                }.bind(this))
                        }.bind(this)).then(function completePanelInit() {
                            if (!this.dataContext || !this.dataContext.doNotRaisePanelReady)
                                MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.panelFragmentContainer)
                        }.bind(this))
                    }, unload: function unload() {
                        this.unbind("dataContext", this._dataContextChanged);
                        if (this.dataContext) {
                            this.dataContext.unbind("primaryModifier", this._primaryModifierChanged);
                            this.dataContext.unbind("secondaryModifier", this._secondaryModifierChanged);
                            this.dataContext.unbind("tertiaryModifier", this._tertiaryModifierChanged);
                            if (this.dataContext.primaryModifier) {
                                this.dataContext.primaryModifier.unbind("items", this._primaryItemsChanged);
                                this.dataContext.primaryModifier.unbind("selectedItem", this._primarySelectedItemChanged)
                            }
                            if (this.dataContext.secondaryModifier) {
                                this.dataContext.secondaryModifier.unbind("items", this._primaryItemsChanged);
                                this.dataContext.secondaryModifier.unbind("selectedItem", this._primarySelectedItemChanged)
                            }
                            if (this.dataContext.tertiaryModifier) {
                                this.dataContext.tertiaryModifier.unbind("items", this._tertiaryItemsChanged);
                                this.dataContext.tertiaryModifier.unbind("selectedItem", this._tertiarySelectedItemChanged)
                            }
                        }
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                    }, hideLoadingPanel: {get: function() {
                            return (this.dataContext) ? this.dataContext.hideLoadingPanel : false
                        }}, handlePanelReady: function handlePanelReady(event) {
                        var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                        if (event.failed || (!event.failed && this.isFailed)) {
                            this.failedModel = event.model;
                            this.isFailed = event.failed
                        }
                        event.panelId = this.id;
                        this.isLoading = false;
                        eventProvider.tracePanel_Ready(this.id || "")
                    }, handlePanelReset: function handlePanelReset(event) {
                        var eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
                        if (!this.isLoading) {
                            eventProvider.tracePanel_Load_Start(this.id || "");
                            this.failedModel = null;
                            this.isFailed = false;
                            this.isLoading = true
                        }
                    }, _dataContextChangedImpl: function _dataContextChangedImpl(newValue, oldValue) {
                        newValue = WinJS.Binding.as(newValue);
                        oldValue = WinJS.Binding.as(oldValue);
                        if (oldValue) {
                            oldValue.unbind("primaryModifier", this._primaryModifierChanged);
                            oldValue.unbind("secondaryModifier", this._secondaryModifierChanged);
                            oldValue.unbind("tertiaryModifier", this._tertiaryModifierChanged)
                        }
                        if (newValue) {
                            newValue.bind("primaryModifier", this._primaryModifierChanged);
                            this.panelAction = newValue.panelAction
                        }
                        else
                            this.panelAction = null
                    }, _dataContextChanged: null, _primaryModifierChangedImpl: function _primaryModifierChangedImpl(newValue, oldValue) {
                        newValue = WinJS.Binding.as(newValue);
                        oldValue = WinJS.Binding.as(oldValue);
                        if (oldValue) {
                            oldValue.unbind("items", this._primaryItemsChanged);
                            oldValue.unbind("selectedItem", this._primarySelectedItemChanged)
                        }
                        if (newValue) {
                            WinJS.Utilities.addClass(this.titleLabel.domElement, "removeFromDisplay");
                            WinJS.Utilities.removeClass(this.primaryModifierControl.domElement, "removeFromDisplay");
                            WinJS.Utilities.addClass(this.primaryModifierControl.domElement, "pivotModifier");
                            newValue.bind("items", this._primaryItemsChanged);
                            newValue.bind("selectedItem", this._primarySelectedItemChanged);
                            this.dataContext.bind("secondaryModifier", this._secondaryModifierChanged);
                            this.dataContext.bind("tertiaryModifier", this._tertiaryModifierChanged);
                            if (this.primaryModifierControl && newValue.settingsKey) {
                                this.primaryModifierControl.isRoamingSetting = !MS.Entertainment.Utilities.isVideoApp2 && newValue.isRoamingSetting;
                                this.primaryModifierControl.settingsKey = newValue.settingsKey
                            }
                        }
                        else {
                            WinJS.Utilities.removeClass(this.titleLabel.domElement, "removeFromDisplay");
                            if (this.primaryModifierControl) {
                                WinJS.Utilities.addClass(this.primaryModifierControl.domElement, "removeFromDisplay");
                                WinJS.Utilities.removeClass(this.primaryModifierControl.domElement, "pivotModifier")
                            }
                            if (this.secondaryModifierControl) {
                                this.dataContext.unbind("secondaryModifier", this._secondaryModifierChanged);
                                WinJS.Utilities.addClass(this.secondaryModifierControl.domElement, "removeFromDisplay");
                                WinJS.Utilities.removeClass(this.secondaryModifierControl.domElement, "pivotModifier")
                            }
                            if (this.tertiaryModifierControl) {
                                this.dataContext.unbind("tertiaryModifier", this._tertiaryModifierChanged);
                                WinJS.Utilities.addClass(this.tertiaryModifierControl.domElement, "removeFromDisplay");
                                WinJS.Utilities.removeClass(this.tertiaryModifierControl.domElement, "pivotModifier")
                            }
                        }
                    }, _primaryModifierChanged: null, _primaryItemsChangedImpl: function _primaryItemsChangedImpl(newValue) {
                        if (this.primaryModifierControl.items !== newValue)
                            this.primaryModifierControl.items = newValue
                    }, _primaryItemsChanged: null, _primarySelectedItemChangedImpl: function _primarySelectedItemChangedImpl(newValue) {
                        if (this.primaryModifierControl.selectedItem !== newValue)
                            this.primaryModifierControl.selectedItem = newValue
                    }, _primarySelectedItemChanged: null, _primaryModifierControlSelectedItemChanged: function _primaryModifierControlSelectedItemChanged(newValue) {
                        if (this.dataContext && this.dataContext.primaryModifier && this.dataContext.primaryModifier.selectedItem !== newValue)
                            this.dataContext.primaryModifier.selectedItem = newValue
                    }, _secondaryModifierChangedImpl: function _secondaryModifierChangedImpl(newValue, oldValue) {
                        newValue = WinJS.Binding.as(newValue);
                        oldValue = WinJS.Binding.as(oldValue);
                        if (oldValue) {
                            oldValue.unbind("items", this._secondaryItemsChanged);
                            oldValue.unbind("selectedItem", this._secondarySelectedItemChanged)
                        }
                        if (newValue) {
                            newValue.bind("items", this._secondaryItemsChanged);
                            newValue.bind("selectedItem", this._secondarySelectedItemChanged)
                        }
                        else {
                            WinJS.Utilities.addClass(this.secondaryModifierControl.domElement, "removeFromDisplay");
                            WinJS.Utilities.removeClass(this.secondaryModifierControl.domElement, "pivotModifier")
                        }
                    }, _secondaryModifierChanged: null, _secondaryItemsChangedImpl: function _secondaryItemsChangedImpl(newValue) {
                        if (!this.secondaryModifierControl)
                            return;
                        if (this.secondaryModifierControl.items !== newValue)
                            this.secondaryModifierControl.items = newValue;
                        if (this.secondaryModifierControl.items.length) {
                            WinJS.Utilities.removeClass(this.secondaryModifierControl.domElement, "removeFromDisplay");
                            WinJS.Utilities.addClass(this.secondaryModifierControl.domElement, "pivotModifier")
                        }
                        else {
                            WinJS.Utilities.addClass(this.secondaryModifierControl.domElement, "removeFromDisplay");
                            WinJS.Utilities.removeClass(this.secondaryModifierControl.domElement, "pivotModifier")
                        }
                    }, _secondaryItemsChanged: null, _secondarySelectedItemChangedImpl: function _secondarySelectedItemChangedImpl(newValue) {
                        if (this.secondaryModifierControl.selectedItem !== newValue)
                            this.secondaryModifierControl.selectedItem = newValue
                    }, _secondarySelectedItemChanged: null, _secondaryModifierControlSelectedItemChanged: function _secondaryModifierControlSelectedItemChanged(newValue) {
                        if (this.dataContext && this.dataContext.secondaryModifier && this.dataContext.secondaryModifier.selectedItem !== newValue)
                            this.dataContext.secondaryModifier.selectedItem = newValue
                    }, _tertiaryModifierChangedImpl: function _tertiaryModifierChangedImpl(newValue, oldValue) {
                        newValue = WinJS.Binding.as(newValue);
                        oldValue = WinJS.Binding.as(oldValue);
                        if (oldValue) {
                            oldValue.unbind("items", this._tertiaryItemsChanged);
                            oldValue.unbind("selectedItem", this._tertiarySelectedItemChanged)
                        }
                        if (newValue) {
                            newValue.bind("items", this._tertiaryItemsChanged);
                            newValue.bind("selectedItem", this._tertiarySelectedItemChanged)
                        }
                        else {
                            WinJS.Utilities.addClass(this.tertiaryModifierControl.domElement, "removeFromDisplay");
                            WinJS.Utilities.removeClass(this.tertiaryModifierControl.domElement, "pivotModifier")
                        }
                    }, _tertiaryModifierChanged: null, _tertiaryItemsChangedImpl: function _tertiaryItemsChangedImpl(newValue) {
                        if (this.tertiaryModifierControl.items !== newValue)
                            this.tertiaryModifierControl.items = newValue;
                        if (this.tertiaryModifierControl.items.length) {
                            WinJS.Utilities.removeClass(this.tertiaryModifierControl.domElement, "removeFromDisplay");
                            WinJS.Utilities.addClass(this.tertiaryModifierControl.domElement, "pivotModifier")
                        }
                    }, _tertiaryItemsChanged: null, _tertiarySelectedItemChangedImpl: function _tertiarySelectedItemChangedImpl(newValue) {
                        if (this.tertiaryModifierControl.selectedItem !== newValue)
                            this.tertiaryModifierControl.selectedItem = newValue
                    }, _tertiarySelectedItemChanged: null, _tertiaryModifierControlSelectedItemChanged: function _tertiaryModifierControlSelectedItemChanged(newValue) {
                        if (this.dataContext && this.dataContext.tertiaryModifier && this.dataContext.tertiaryModifier.selectedItem !== newValue)
                            this.dataContext.tertiaryModifier.selectedItem = newValue
                    }
            }, {
                title: "", dataContext: null, options: null, panelAction: null, id: null, hub: null, isLoading: true, isFailed: false, failedModel: null, showShadow: true
            }, {
                raisePanelReady: MS.Entertainment.Utilities.raisePanelReady, raisePanelReadyTest: MS.Entertainment.Utilities.raisePanelReadyTest, raisePanelReset: MS.Entertainment.Utilities.raisePanelReset
            })
    })
})()
