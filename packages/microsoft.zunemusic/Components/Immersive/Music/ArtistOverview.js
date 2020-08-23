/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/ViewModels/MediaItemModel.js", "/Components/Immersive/Shared/BaseImmersiveSummary.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ArtistImmersiveOverviewSummary: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.BaseImmersiveSummary", "/Components/Immersive/Music/ArtistOverview.html#ImmersiveOverview", function immersiveOverview(){}, {initialize: function initialize() {
                MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.initialize.apply(this, arguments);
                var domEvent = document.createEvent("Event");
                domEvent.initEvent("contentready", true, false);
                this.domElement.dispatchEvent(domEvent)
            }})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ArtistImmersiveHeroSummary: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.BaseImmersiveSummary", "/Components/Immersive/Music/ArtistOverview.html#ImmersiveHeroSummary", function immersiveOverview(){}, {
            _dataContextBindings: null, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.initialize.apply(this, arguments);
                    var domEvent = document.createEvent("Event");
                    domEvent.initEvent("contentready", true, false);
                    this.domElement.dispatchEvent(domEvent);
                    this.viewMoreAction = this._getViewMoreAction();
                    this.viewMoreAction.parameter = {onExecuted: function() {
                            MS.Entertainment.UI.Framework.focusFirstInSubTree(this._container)
                        }.bind(this)};
                    this._scrollViewer._SMALL_SCROLL_AMOUNT = 300;
                    var scrollViewerSounds = WinJS.Utilities.getMember("XboxJS.UI.ScrollViewer._sounds");
                    if (scrollViewerSounds && scrollViewerSounds.selectButtonClick)
                        scrollViewerSounds.selectButtonClick = null;
                    this.frame.getData().done(function bindData(dataContext) {
                        this._dataContextBindings = WinJS.Binding.bind(dataContext, {description: function updateScroller() {
                                this._scrollViewer.refresh()
                            }.bind(this)})
                    }.bind(this))
                }, unload: function unload() {
                    if (this._dataContextBindings) {
                        this._dataContextBindings.cancel();
                        this._dataContextBindings = null
                    }
                    MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.unload.call(this)
                }, _dismissScrollViewer: function _dismissScrollViewer() {
                    WinJS.Utilities.removeClass(this._container, "focused");
                    if (WinJS.Utilities.getMember("_scrollViewer._scrollingContainer.msZoomTo", this))
                        this._scrollViewer._scrollingContainer.msZoomTo({
                            contentX: 0, contentY: 0
                        });
                    var domEvent = document.createEvent("Event");
                    domEvent.initEvent("keyup", true, true);
                    domEvent.key = "Esc";
                    this._scrollViewer.element.dispatchEvent(domEvent);
                    if (this._scrollViewer && !this._scrollViewer._isActive && this._scrollViewer._previousFocusRoot && !WinJS.UI.AutomaticFocus.focusRoot)
                        MS.Entertainment.UI.Framework.setFocusRoot(this._scrollViewer._previousFocusRoot)
                }, _onFocusIn: function _onFocusIn() {
                    WinJS.Utilities.addClass(this._container, "focused");
                    var domEvent = document.createEvent("Event");
                    domEvent.initEvent("keyup", true, true);
                    domEvent.key = "Enter";
                    this._scrollViewer.element.dispatchEvent(domEvent)
                }, _onFocusOut: function _onFocusOut() {
                    this._dismissScrollViewer()
                }, _onPointerOut: function _onPointerOut(e) {
                    if (e.srcElement === this._container || e.srcElement === this._bioBackground)
                        this._dismissScrollViewer()
                }, _onKeyDown: function _onKeyDown(evt) {
                    switch (evt.keyCode) {
                        case WinJS.Utilities.Key.rightArrow:
                        case WinJS.Utilities.Key.rArrow:
                        case WinJS.Utilities.Key.rOtherArrow:
                            var domEvent = document.createEvent("Event");
                            domEvent.initEvent("keyup", true, true);
                            domEvent.key = "Esc";
                            this._scrollViewer.element.dispatchEvent(domEvent);
                            break
                    }
                }, _getViewMoreAction: function _getViewMoreAction() {
                    var viewMoreButtonAction = MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function viewMoreButtonAction() {
                            this.base()
                        }, {
                            automationId: MS.Entertainment.UI.AutomationIds.unsnapButtonAction, executed: function executed(parameter) {
                                    if (parameter && parameter.onExecuted)
                                        parameter.onExecuted();
                                    WinJS.Promise.timeout(600).done(function refreshVui() {
                                        XboxJS.UI.Voice.refreshVoiceElements()
                                    })
                                }, canExecute: function canExecute(parameter) {
                                    return true
                                }
                        });
                    var action = new viewMoreButtonAction;
                    if (action.isVoiceEnabled) {
                        action.voicePhrase = String.load(String.id.IDS_MUSIC2_ARTIST_DETAILS_VIEW_BIO_VUI_ALM);
                        action.voicePhoneticPhrase = String.load(String.id.IDS_MUSIC2_ARTIST_DETAILS_VIEW_BIO_VUI_PRON);
                        action.voiceConfidence = String.load(String.id.IDS_MUSIC2_ARTIST_DETAILS_VIEW_BIO_VUI_CONF)
                    }
                    return action
                }
        }, {viewMoreAction: null})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ArtistImmersiveOverviewGenericSummary: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.ArtistImmersiveOverviewSummary", "/Components/Immersive/Music/ArtistOverview.html#ImmersiveOverviewGeneric")})
})()
