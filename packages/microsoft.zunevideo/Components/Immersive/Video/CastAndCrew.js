/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Controls/listControls.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ContributorList: MS.Entertainment.UI.Framework.defineUserControl("/Components/Immersive/Video/MovieImmersiveTemplates.html#ContributorList", function contributorListConstructor(){}, {
            singularTitle: null, pluralTitle: null, zeroTitle: null, _bindings: null, initialize: function initialize() {
                    this._bindings = WinJS.Binding.bind(this, {dataSource: this.dataSourceChanged.bind(this)})
                }, unload: function unload() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, dataSourceChanged: function listItemsChanged() {
                    if (!this.dataSource || this.dataSource.length === 0)
                        this.contributorTitle = this.zeroTitle;
                    else if (this.dataSource.length === 1)
                        this.contributorTitle = this.singularTitle;
                    else
                        this.contributorTitle = this.pluralTitle;
                    this.boundDataSource = this.dataSource
                }
        }, {
            contributorTitle: null, boundDataSource: null, dataSource: null
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {CastAndCrewList: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.BaseImmersiveSummary", "/Components/Immersive/Video/MovieImmersiveTemplates.html#CastAndCrew", function castAndCrewListContstructor(element, options) {
            this.dataContext = options.dataContext || MS.Entertainment.UI.Controls.CastAndCrewList.emptyDataContext;
            if (this.dataContext.selectedTemplate) {
                this.panelTemplate = this.dataContext.selectedTemplate.panelTemplateUrl || this.panelTemplate;
                this.panelOptions = this.dataContext.selectedTemplate.panelOptions || this.panelOptions;
                this.itemTemplate = this.dataContext.selectedTemplate.templateUrl || this.itemTemplate;
                this.className = this.dataContext.selectedTemplate.className || this.className
            }
            this._contributingRoleControls = {}
        }, {
            className: null, isViewMore: false, _bindings: null, keyboardNavigationManager: null, _focusInitialized: false, _focusEventHandlers: null, _controlListKeys: null, _contributingRoleControls: null, initialize: function initialize() {
                    this.itemsChanged = this.itemsChanged.bind(this);
                    var edsContributorRole = MS.Entertainment.Data.Augmenter.Marketplace.edsContributorRole;
                    this._controlListKeys = [edsContributorRole.creator, edsContributorRole.director, edsContributorRole.actor, edsContributorRole.writer];
                    this.loadContributingRoleControlMap();
                    this._focusEventHandlers = [MS.Entertainment.Utilities.addEvents(this, {focusin: this._focusHandler.bind(this)})];
                    if (MS.Entertainment.Utilities.isApp1)
                        this.keyboardNavigationManager = new MS.Entertainment.Framework.VerticalKeyboardNavigationManager(this.domElement, null, true);
                    else
                        for (var control in this._contributingRoleControls) {
                            this._contributingRoleControls[control].listControl.keyboardNavigable = true;
                            if (this.isViewMore)
                                this._focusEventHandlers.push(MS.Entertainment.UI.Framework.addEventHandlers(this._contributingRoleControls[control].listControl.domElement, {firstTimeRendered: this._forceFocusHandler.bind(this)}))
                        }
                    this._bindings = WinJS.Binding.bind(this, {dataContext: {items: this.itemsChanged}});
                    var promise = this.dataContext.previousSignal ? WinJS.Binding.unwrap(this.dataContext.previousSignal).promise : WinJS.Promise.wrap();
                    promise.done(function showFrame() {
                        this.visible = true;
                        if (this.dataContext.visibleSignal)
                            WinJS.Binding.unwrap(this.dataContext.visibleSignal).complete()
                    }.bind(this))
                }, loadContributingRoleControlMap: function loadTemplates() {
                    var edsContributorRole = MS.Entertainment.Data.Augmenter.Marketplace.edsContributorRole;
                    this._contributingRoleControls[edsContributorRole.creator] = this.creatorControl;
                    this._contributingRoleControls[edsContributorRole.actor] = this.actorControl;
                    this._contributingRoleControls[edsContributorRole.director] = this.directorControl;
                    this._contributingRoleControls[edsContributorRole.writer] = this.writerControl
                }, unload: function unload() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    if (this._focusEventHandlers) {
                        for (var focusEventHandler in this._focusEventHandlers)
                            this._focusEventHandlers[focusEventHandler].cancel();
                        this._focusEventHandlers = null
                    }
                    MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.unload.call(this)
                }, _forceFocusHandler: function _forceFocusHandler() {
                    this._focusHandler(true)
                }, _focusHandler: function _focusHandler(event) {
                    var force = event === true;
                    WinJS.Promise.timeout(1).done(function delayFocusItem() {
                        if (!this._focusInitialized || force) {
                            var querySelectorString = ".control-immersiveListViewItem";
                            var firstListItem = this.domElement.querySelector(querySelectorString);
                            if (firstListItem) {
                                if (MS.Entertainment.Utilities.isApp1 && !this.isViewMore)
                                    this.keyboardNavigationManager.setFocusedItem(firstListItem, true);
                                else if (this.isViewMore)
                                    MS.Entertainment.UI.Framework.focusElement(firstListItem);
                                if (this._focusInitialized)
                                    return;
                                this._focusEventHandlers.push(MS.Entertainment.Utilities.addEvents(firstListItem, {focusin: this._scrollToTop.bind(this)}));
                                for (var contributingRole in this._contributingRoleControls)
                                    if (this._contributingRoleControls[contributingRole] && this._contributingRoleControls[contributingRole].listControl && this._contributingRoleControls[contributingRole].listControl.domElement)
                                        this._contributingRoleControls[contributingRole].listControl.domElement.tabIndex = -1;
                                this._setControlFocusDirectionOverrides();
                                if (MS.Entertainment.UI.Framework.focusedItemInContainer(this.domElement))
                                    this._focusInitialized = true
                            }
                        }
                    }.bind(this))
                }, _setControlFocusDirectionOverrides: function _setControlFocusDirectionOverrides() {
                    if (this.isViewMore)
                        return;
                    var leftOfCastAndCrew = null;
                    var leftOfCastAndCrewViewMore = null;
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var criticReviewsVisible = (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.rottenTomatoes) && this.dataContext && this.dataContext._mediaItem && this.dataContext._mediaItem.criticReview && this.dataContext._mediaItem.criticReview.reviewScore > 0);
                    if (criticReviewsVisible) {
                        leftOfCastAndCrew = MS.Entertainment.UI.Controls.RottenTomatoesImmersivePanel.cssSelectors.rottenTomatoesOverview;
                        leftOfCastAndCrewViewMore = MS.Entertainment.UI.Controls.RottenTomatoesImmersivePanel.cssSelectors.rottenTomatoesViewMore
                    }
                    else {
                        leftOfCastAndCrew = MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.smartBuyButton;
                        leftOfCastAndCrewViewMore = MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.movieHeroViewMore
                    }
                    var belowCastAndCrew = MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.noOp;
                    if (this.dataContext && this.dataContext.frame && !this.dataContext.frame.hideViewMoreIfEnoughSpace)
                        belowCastAndCrew = MS.Entertainment.UI.Controls.CastAndCrewList.cssSelectors.castAndCrewViewMore;
                    var middleCastAndCrewItemFocusDirectionMap = JSON.stringify({
                            left: leftOfCastAndCrew, right: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.related
                        });
                    var topCastAndCrewItemFocusDirectionMap = JSON.stringify({
                            left: leftOfCastAndCrew, right: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.related, up: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.noOp
                        });
                    var bottomCastAndCrewItemFocusDirectionMap = JSON.stringify({
                            left: leftOfCastAndCrew, right: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.related, down: belowCastAndCrew
                        });
                    var bottomCastAndCrewItemClass = "bottomCastAndCrewItem";
                    var castAndCrewItems = this.domElement.querySelectorAll(MS.Entertainment.UI.Controls.CastAndCrewList.cssSelectors.castAndCrewMember);
                    if (castAndCrewItems && castAndCrewItems.length > 0) {
                        if (castAndCrewItems.length === 1) {
                            var onlyCastAndCrewItemFocusDirectionMap = JSON.stringify({
                                    left: leftOfCastAndCrew, right: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.related, down: belowCastAndCrew, up: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.noOp
                                });
                            castAndCrewItems[0].setAttribute("data-win-focus", onlyCastAndCrewItemFocusDirectionMap);
                            WinJS.Utilities.addClass(castAndCrewItems[0], bottomCastAndCrewItemClass)
                        }
                        else {
                            castAndCrewItems[0].setAttribute("data-win-focus", topCastAndCrewItemFocusDirectionMap);
                            WinJS.Utilities.removeClass(castAndCrewItems[0], bottomCastAndCrewItemClass);
                            castAndCrewItems[castAndCrewItems.length - 1].setAttribute("data-win-focus", bottomCastAndCrewItemFocusDirectionMap);
                            WinJS.Utilities.addClass(castAndCrewItems[castAndCrewItems.length - 1], bottomCastAndCrewItemClass)
                        }
                        for (var i = 1; i < castAndCrewItems.length - 1; i++) {
                            castAndCrewItems[i].setAttribute("data-win-focus", middleCastAndCrewItemFocusDirectionMap);
                            WinJS.Utilities.removeClass(castAndCrewItems[i], bottomCastAndCrewItemClass)
                        }
                    }
                    var bottomCastAndCrewItemSelector = ".currentPage ." + bottomCastAndCrewItemClass;
                    var castAndCrewViewMoreItemFocusDirectionMap = JSON.stringify({
                            left: leftOfCastAndCrewViewMore, right: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.related, down: MS.Entertainment.UI.Controls.ImmersiveVideoHero.cssSelectors.noOp, up: bottomCastAndCrewItemSelector
                        });
                    var castAndCrewViewMore = document.querySelector(MS.Entertainment.UI.Controls.CastAndCrewList.cssSelectors.castAndCrewViewMore);
                    if (castAndCrewViewMore)
                        castAndCrewViewMore.setAttribute("data-win-focus", castAndCrewViewMoreItemFocusDirectionMap)
                }, _scrollToTop: function _scrollToTop() {
                    if (this.domElement)
                        this.domElement.scrollTop = 0;
                    if (this.isViewMore && this._criticReviewList && this._criticReviewList.children && this._criticReviewList.children.length > 0)
                        this._criticReviewList.children[0].scrollIntoView()
                }, itemsChanged: function itemsChanged() {
                    if (this.dataContext && this.dataContext.items) {
                        this.dataContext.items.forEach(function itemIterator(currentItem) {
                            if (currentItem.role)
                                if (this._contributingRoleControls[currentItem.role]) {
                                    var currentRoleControl = this._contributingRoleControls[currentItem.role];
                                    if (!currentRoleControl.itemList)
                                        currentRoleControl.itemList = new MS.Entertainment.ObservableArray;
                                    currentRoleControl.itemList.push(currentItem)
                                }
                                else
                                    MS.Entertainment.Framework.fail("Unknown contributing roletype: " + currentItem.role)
                        }.bind(this));
                        for (var index = 0; index < this._controlListKeys.length; index++) {
                            var currentRoleControl = this._contributingRoleControls[this._controlListKeys[index]];
                            if (currentRoleControl.itemList) {
                                currentRoleControl.dataSource = currentRoleControl.itemList;
                                currentRoleControl.itemList = null
                            }
                        }
                    }
                }
        }, {visible: false}, {
            cssSelectors: {
                castAndCrewViewMore: ".currentPage .viewMoreRow.cast .template-moreButton .win-focusable", castAndCrewMember: ".currentPage .control-contributorList .control-immersiveListViewItemContainer .control-immersiveListViewItem"
            }, emptyDataContext: {
                    selectedTemplate: {templateUrl: null}, items: null
                }, makeCastAndCrewFrame: function loadCastAndCrewFrame(mediaItem, previousSignal, visibleSignal) {
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var castAndCrewEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.castAndCrew);
                    if (!MS.Entertainment.UI.NetworkStatusService.isOnline() || !castAndCrewEnabled || !mediaItem || !mediaItem.contributors || !mediaItem.contributors.length > 0)
                        return WinJS.Promise.wrap();
                    var castAndCrewViewModel = new MS.Entertainment.ViewModels.CastAndCrewViewModel(mediaItem);
                    castAndCrewViewModel.visibleSignal = visibleSignal;
                    castAndCrewViewModel.previousSignal = previousSignal;
                    var frame = MS.Entertainment.UI.Controls.Immersive.makeFrame(String.load(String.id.IDS_VIDEO_CAST_HEADING), 1, MS.Entertainment.UI.Controls.CastAndCrewList, "/Components/Immersive/Video/CastAndCrewMore.html", MS.Entertainment.ViewModels.MovieImmersiveViewModel.Monikers.cast, MS.Entertainment.Utilities.isVideoApp2);
                    frame.hideViewMoreIfEnoughSpace = castAndCrewViewModel.maxItems === 0 || mediaItem.contributors.length <= castAndCrewViewModel.maxItems;
                    frame.visibleSignal = visibleSignal;
                    frame.getData = function relatedGetData() {
                        castAndCrewViewModel.frame = frame;
                        return WinJS.Promise.wrap(castAndCrewViewModel)
                    };
                    return WinJS.Promise.wrap(frame)
                }
        })})
})()
