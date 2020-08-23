/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Controls/listControls.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        ImmersiveRelatedItems: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.BaseImmersiveSummary", "/Components/Immersive/Shared/RelatedItems.html#ImmersiveRelatedItemsTemplate", function moreGalleryControlBase(element, options) {
            this.dataContext = options.dataContext || MS.Entertainment.UI.Controls.ImmersiveRelatedItems.emptyDataContext;
            if (this.dataContext.selectedTemplate) {
                this.panelTemplate = this.dataContext.selectedTemplate.panelTemplateUrl || this.panelTemplate;
                this.panelOptions = this.dataContext.selectedTemplate.panelOptions || this.panelOptions;
                this.itemTemplate = this.dataContext.selectedTemplate.templateUrl || this.itemTemplate;
                this.className = this.dataContext.selectedTemplate.className || this.className
            }
        }, {
            className: null, initialize: function initialize() {
                    var thumbnailButton = this.domElement.querySelector(".relatedHeroItem");
                    if (thumbnailButton) {
                        thumbnailButton.tabIndex = 0;
                        WinJS.Utilities.addClass(thumbnailButton, "acc-keyboardFocusTarget");
                        WinJS.Utilities.addClass(thumbnailButton, "win-focusable");
                        thumbnailButton.addEventListener("click", this.onItemClick.bind(this));
                        thumbnailButton.addEventListener("keydown", this.onKeyDown.bind(this))
                    }
                    var querySelectorString = ".control-immersiveListViewItem";
                    var firstListItem = this.domElement.querySelector(querySelectorString);
                    if (firstListItem)
                        firstListItem.tabIndex = 0
                }, onKeyDown: function onKeyDown(event) {
                    if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space)
                        this.onItemClick(event)
                }, onItemClick: function onItemClick(event) {
                    var popOverParameters = {itemConstructor: this.panelTemplate};
                    popOverParameters.dataContext = {
                        data: this.dataContext.heroActionItem, location: MS.Entertainment.Data.ItemLocation.marketplace
                    };
                    MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                }
        }, {
            itemTemplate: null, panelTemplate: null
        }, {emptyDataContext: {
                selectedTemplate: {templateUrl: null}, heroItem: {
                        name: null, description: null
                    }, items: null
            }}), ImmersiveRelatedTileItems: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.BaseImmersiveSummary", "/Components/Immersive/Shared/RelatedItems.html#ImmersiveRelatedTilesTemplate", function moreGalleryControlBase(element, options) {
                this.dataContext = options.dataContext || MS.Entertainment.UI.Controls.ImmersiveRelatedItems.emptyDataContext;
                if (this.dataContext.selectedTemplate) {
                    this.invokeBehavior = this.dataContext.selectedTemplate.invokeBehavior || this.invokeBehavior;
                    this.actionOptions = this.dataContext.selectedTemplate.actionOptions || this.actionOptions;
                    this.itemTemplate = this.dataContext.selectedTemplate.templateUrl || this.itemTemplate;
                    this.className = this.dataContext.selectedTemplate.className || this.className;
                    this.panelTemplate = this.dataContext.selectedTemplate.panelTemplateUrl || this.panelTemplate;
                    this.panelOptions = this.dataContext.selectedTemplate.panelOptions || this.panelOptions
                }
            }, {
                initialize: function initialize() {
                    if (this.domElement) {
                        this.domElement.addEventListener("click", this.onItemClick.bind(this));
                        this.domElement.addEventListener("keypress", this.onKeyPress.bind(this))
                    }
                }, onKeyPress: function onKeyPress(event) {
                        if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space)
                            this.onItemClick(event)
                    }, onItemClick: function onItemClick(event) {
                        var listItem = event.target;
                        if (!WinJS.Utilities.hasClass(listItem, "horizontalListItem"))
                            listItem = MS.Entertainment.Utilities.findParentElementByClassName(listItem, "horizontalListItem");
                        if (!listItem) {
                            listItem = event.target;
                            while (listItem && listItem !== this.domElement) {
                                if (listItem.dataContext)
                                    break;
                                listItem = listItem.parentElement
                            }
                            {}
                        }
                        if (listItem && listItem.dataContext)
                            if (listItem.dataContext.action)
                                listItem.dataContext.action.execute();
                            else if (this.invokeBehavior === MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.action) {
                                Trace.assert(this.actionOptions, "RelatedItems: invokeBehavior is set as action, but there are no actionOptions");
                                Trace.assert(this.actionOptions.id, "RelatedItems: invokeBehavior is set as action, but there is no action id defined");
                                var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                                var itemAction = actionService.getAction(this.actionOptions.id);
                                itemAction.parameter = this.actionOptions.parameter || {};
                                itemAction.parameter.data = listItem.dataContext;
                                itemAction.execute()
                            }
                            else if (MS.Entertainment.Platform.PlaybackHelpers.isMusicVideo(listItem.dataContext)) {
                                var smartBuyStateEngine;
                                var appBarService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar);
                                var mediaContext = appBarService.pushMediaContext(listItem.dataContext, null, [], {executeLocation: MS.Entertainment.UI.Actions.ExecutionLocation.invokeInline});
                                smartBuyStateEngine = new MS.Entertainment.ViewModels.SmartBuyStateEngine;
                                smartBuyStateEngine.initialize(listItem.dataContext, MS.Entertainment.ViewModels.SmartBuyButtons.getMusicVideoInlineDetailsButtons(mediaContext), MS.Entertainment.ViewModels.MusicStateHandlers.onMusicVideoInlineDetailsStateChanged);
                                var setAppbarActions = function setAppBarActions() {
                                        mediaContext.setToolbarActions(smartBuyStateEngine.currentAppbarActions)
                                    };
                                var smartStateEngineBindings = WinJS.Binding.bind(smartBuyStateEngine, {currentAppbarActions: setAppbarActions.bind(this)});
                                var contextualData = {
                                        title: listItem.dataContext.title, subTitle: listItem.dataContext.artistName
                                    };
                                listItem.dataContext.hydrate();
                                MS.Entertainment.UI.Controls.CommandingPopOver.showContextualCommands(contextualData).then(function hideComplete() {
                                    smartStateEngineBindings.cancel();
                                    smartStateEngineBindings = null
                                })
                            }
                            else {
                                var popOverParameters = {itemConstructor: this.panelTemplate};
                                var location = listItem.dataContext.fromCollection ? MS.Entertainment.Data.ItemLocation.collection : MS.Entertainment.Data.ItemLocation.marketplace;
                                popOverParameters.dataContext = {
                                    data: listItem.dataContext, location: location
                                };
                                MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                            }
                    }
            }, {
                className: null, itemTemplate: null, panelTemplate: null, actionOptions: null, invokeBehavior: null
            }, {emptyDataContext: {
                    selectedTemplate: {templateUrl: null}, items: null
                }})
    })
})()
