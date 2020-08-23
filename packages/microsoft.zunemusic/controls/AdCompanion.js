/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {AdCompanion: MS.Entertainment.UI.Framework.defineUserControl("/Controls/AdCompanion.html#adCompanionTemplate", function AdCompanion(element, options) {
            this.eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell;
            this.lastShowPromise = WinJS.Promise.as();
            this.lastHidePromise = WinJS.Promise.as()
        }, {
            showOnInitialize: false, eventProvider: null, lastShowPromise: null, lastHidePromise: null, adInfoSaved: null, _closedCallback: null, initialize: function initialize() {
                    this.closeButton.textContent = MS.Entertainment.UI.Icon.close;
                    this.closeButton.setAttribute("aria-label", String.load(String.id.IDS_CLOSE_BUTTON));
                    this.contentContainer.setAttribute("aria-label", String.load(String.id.IDS_ADVERTISEMENT));
                    this._initialized = true;
                    if (this.showOnInitialize)
                        this.showAdCompanion(this.adInfoSaved)
                }, showAdCompanion: function showAdCompanion(adInfo) {
                    if (!this._initialized) {
                        this.adInfoSaved = adInfo;
                        this.showOnInitialize = true;
                        return
                    }
                    if (!adInfo && !adInfo.imageUrl)
                        MS.Entertainment.UI.Controls.fail("Tried to show ad companion with no ad");
                    else {
                        var hidePromise = this.lastHidePromise;
                        var showCompletion;
                        var imageOnLoad;
                        var imageOnError;
                        imageOnLoad = function imageOnLoadInternal() {
                            this.clickCallback = adInfo.clickCallback;
                            this._closedCallback = adInfo.closedCallback;
                            this.linkUrl = adInfo.linkUrl;
                            WinJS.Utilities.removeClass(this.body, "hidden");
                            WinJS.Utilities.addClass(this.body, "adCompanionSlideIn");
                            MS.Entertainment.Utilities.waitForStartedTransitionsToComplete(this.body).then(function fireShowETW() {
                                this.eventProvider.traceAd_Companion_Shown(this.linkUrl, this.imageUrl);
                                showCompletion()
                            }.bind(this));
                            this.adImage.removeEventListener("load", imageOnLoad);
                            this.adImage.removeEventListener("error", imageOnError)
                        }.bind(this);
                        imageOnError = function imageOnErrorInternal(error) {
                            if (!error || error.message !== "Canceled") {
                                this.adImage.removeEventListener("load", imageOnLoad);
                                this.adImage.removeEventListener("error", imageOnError);
                                this.adImage.src = String.empty;
                                showCompletion()
                            }
                        }.bind(this);
                        hidePromise.done(function hideDone() {
                            if (!WinJS.Utilities.hasClass(this.body, "adCompanionSlideIn")) {
                                this.lastShowPromise = new WinJS.Promise(function(c, e, p) {
                                    showCompletion = c
                                });
                                this.adImage.addEventListener("load", imageOnLoad);
                                this.adImage.addEventListener("error", imageOnError);
                                this.adImage.src = adInfo.imageUrl
                            }
                        }.bind(this))
                    }
                }, hideAdCompanion: function hideAdCompanion() {
                    var showPromise = this.lastShowPromise;
                    var hideCompletion;
                    showPromise.done(function showDone() {
                        if (this.body && WinJS.Utilities.hasClass(this.body, "adCompanionSlideIn")) {
                            this.lastHidePromise = new WinJS.Promise(function(c, e, p) {
                                hideCompletion = c
                            });
                            WinJS.Utilities.removeClass(this.body, "adCompanionSlideIn");
                            MS.Entertainment.Utilities.waitForStartedTransitionsToComplete(this.body).then(function fireHideETW() {
                                this.eventProvider.traceAd_Companion_Hidden(this.linkUrl, this.imageUrl);
                                WinJS.Utilities.addClass(this.body, "hidden");
                                if (this._closedCallback)
                                    this._closedCallback();
                                this.clickCallback = null;
                                this._closedCallback = null;
                                this.linkUrl = null;
                                hideCompletion()
                            }.bind(this))
                        }
                    }.bind(this))
                }, companionClicked: function companionClicked() {
                    if (this.linkUrl) {
                        Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(this.linkUrl)).done(null, function launchFailure(e) {
                            MS.Entertainment.UI.Controls.assert(false, "Failed to launch ad companion url")
                        });
                        if (this.clickCallback)
                            this.clickCallback()
                    }
                }
        }, {
            linkUrl: null, clickCallback: null
        }, {
            currentAdCompanion: null, showAdCompanion: function showAdCompanion(adInfo) {
                    if (!(adInfo && adInfo.imageUrl)) {
                        MS.Entertainment.UI.Shell.assert(false, "invalid adInfo param");
                        return
                    }
                    if (!MS.Entertainment.UI.Controls.AdCompanion.currentAdCompanion) {
                        MS.Entertainment.UI.Controls.AdCompanion.currentAdCompanion = new MS.Entertainment.UI.Controls.AdCompanion;
                        document.body.appendChild(MS.Entertainment.UI.Controls.AdCompanion.currentAdCompanion.domElement)
                    }
                    MS.Entertainment.UI.Controls.AdCompanion.currentAdCompanion.showAdCompanion(adInfo)
                }, hideAdCompanion: function hideAdCompanion() {
                    if (MS.Entertainment.UI.Controls.AdCompanion.currentAdCompanion)
                        MS.Entertainment.UI.Controls.AdCompanion.currentAdCompanion.hideAdCompanion()
                }
        })})
})()
