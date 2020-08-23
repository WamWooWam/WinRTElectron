/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function(WinJS, undefined) {
    "use strict";
    WinJS.Namespace.define("MicrosoftNSJS.Advertising", {AdPackage: WinJS.Class.define(function(applicationId, adUnitId) {
            this._onAdRefreshed = null;
            this._onErrorOccurred = null;
            this.applicationId = applicationId,
            this.adUnitId = adUnitId;
            this._placement = null;
            this._requestInProgress = false;
            this._initializeAdData()
        }, {
            onAdRefreshed: {
                get: function() {
                    return this._onAdRefreshed
                }, set: function(value) {
                        if (typeof(value) === 'function' || value === null || typeof(value) === 'undefined')
                            this._onAdRefreshed = value
                    }
            }, onErrorOccurred: {
                    get: function() {
                        return this._onErrorOccurred
                    }, set: function(value) {
                            if (typeof(value) === 'function' || value === null || typeof(value) === 'undefined')
                                this._onErrorOccurred = value
                        }
                }, refresh: function() {
                    if ((typeof(this.applicationId) === 'undefined' || this.applicationId === null) || (typeof(this.adUnitId) === 'undefined' || this.adUnitId === null)) {
                        this._fireErrorOccurred('applicationId and adUnitId are required', MicrosoftNSJS.Advertising.AdPackage._ERROR_ENUM.ClientConfiguration);
                        return
                    }
                    console.log('ad package refresh called');
                    if (!this._requestInProgress)
                        this._requestVastJson()
                }, reportEvent: function(eventType) {
                    try {
                        console.log('received event ' + eventType);
                        if (this.fullAdPayload.VAST.Ad.length > 0)
                            if (eventType === MicrosoftNSJS.Advertising.AdPackage.eventType.AdImpression && this._impressionUrls.length > 0)
                                return this._placement.reportClientEvents(this._impressionUrls);
                            else if (eventType === MicrosoftNSJS.Advertising.AdPackage.eventType.AdError && this._errorEventUrl != null)
                                return this._placement.reportClientEvents(new Array(this._errorEventUrl));
                            else if (eventType === MicrosoftNSJS.Advertising.AdPackage.eventType.AdClickThru && this._videoClickThroughTrackingUrls.length > 0)
                                return this._placement.reportClientEvents(this._videoClickThroughTrackingUrls);
                            else {
                                var eventUrl = this._trackingEventUrls[eventType];
                                if (this._placement !== null && typeof(eventUrl) !== 'undefined')
                                    return this._placement.reportClientEvents(new Array(eventUrl))
                            }
                    }
                    catch(e) {
                        this._fireErrorOccurred(e.message, MicrosoftNSJS.Advertising.AdPackage._ERROR_ENUM.Other)
                    }
                    console.log('no event found for' + eventType);
                    return new WinJS.Promise(function(){})
                }, dispose: function() {
                    this._stopPingTimer();
                    if (this._placement !== null) {
                        this._placement.onadrefreshed = null;
                        this._placement.onerroroccurred = null;
                        this._placement = null
                    }
                    this._onAdRefreshed = null;
                    this._onErrorOccurred = null
                }, _createAdPlacement: function() {
                    return new MicrosoftAdvertising.Shared.WinRT.VASTAdPlacement
                }, _requestVastJson: function() {
                    try {
                        if (this._placement === null) {
                            this._placement = this._createAdPlacement();
                            var self = this;
                            this._placement.onadrefreshed = function(evt) {
                                self._adRefreshedCallback(evt)
                            };
                            this._placement.onerroroccurred = function(evt) {
                                self._errorOccurredCallback(evt)
                            };
                            this._placement.applicationId = this.applicationId;
                            this._placement.adUnitId = this.adUnitId
                        }
                        this._placement.adUnitId = this.adUnitId;
                        this._placement.latitude = '';
                        this._placement.longitude = '';
                        this._requestInProgress = true;
                        var ad = this._placement.getVASTAd();
                        this._startPingTimer()
                    }
                    catch(e) {
                        this._fireErrorOccurred(e.message, MicrosoftNSJS.Advertising.AdPackage._ERROR_ENUM.Other)
                    }
                }, _pingTimerId: null, _startPingTimer: function() {
                    if (this._pingTimerId === null) {
                        var placement = this._placement;
                        this._pingTimerId = setInterval(function() {
                            placement.ping()
                        }, 100)
                    }
                }, _stopPingTimer: function() {
                    if (this._pingTimerId !== null) {
                        clearInterval(this._pingTimerId);
                        this._pingTimerId = null
                    }
                }, _loadData: function() {
                    if (typeof(this.fullAdPayload) === 'object' && typeof(this.fullAdPayload.VAST) === 'object' && typeof(this.fullAdPayload.VAST.Ad) === 'object' && this.fullAdPayload.VAST.Ad.length > 0 && typeof(this.fullAdPayload.VAST.Ad[0].InLine) === 'object') {
                        var creatives = this.fullAdPayload.VAST.Ad[0].InLine.Creatives;
                        for (var i = 0; i < creatives.length; i++)
                            if (this.linearCreative === null && creatives[i].type === 'linear') {
                                this.linearCreative = creatives[i].Linear;
                                if (this.linearCreative.TrackingEvents !== null && typeof(this.linearCreative.TrackingEvents) === 'object')
                                    this._trackingEventUrls = this.linearCreative.TrackingEvents;
                                if (this.linearCreative.VideoClicks !== null && typeof(this.linearCreative.VideoClicks) === 'object' && this.linearCreative.VideoClicks.ClickTracking !== null && typeof(this.linearCreative.VideoClicks.ClickTracking) === 'object' && this.linearCreative.VideoClicks.ClickTracking.length > 0)
                                    this._videoClickThroughTrackingUrls = this.linearCreative.VideoClicks.ClickTracking
                            }
                            else if (this.adCompanions === null && creatives[i].type === 'companionads')
                                this.adCompanions = creatives[i].CompanionAds;
                        if (typeof(this.fullAdPayload.VAST.Ad[0].InLine.Impressions) === 'object')
                            this._impressionUrls = this.fullAdPayload.VAST.Ad[0].InLine.Impressions;
                        if (typeof(this.fullAdPayload.VAST.Ad[0].InLine.Error) === 'string')
                            this._errorEventUrl = this.fullAdPayload.VAST.Ad[0].InLine.Error
                    }
                }, _fireErrorOccurred: function(msg, errorCode) {
                    console.error("AdPackage: " + msg + " (" + errorCode + ")");
                    if (typeof(this._onErrorOccurred) === "function")
                        this._onErrorOccurred(this, {
                            errorMessage: msg, errorCode: errorCode
                        })
                }, _adRefreshedCallback: function(evt) {
                    this._stopPingTimer();
                    var ad = this._placement.getVASTAd();
                    if (ad !== null)
                        this._onAdReceived(ad);
                    this._requestInProgress = false
                }, _onAdReceived: function(ad) {
                    var fullAdPayload = JSON.parse(ad.vastjson);
                    if (fullAdPayload !== null) {
                        this._initializeAdData();
                        this.fullAdPayload = fullAdPayload;
                        this._loadData()
                    }
                    if (typeof(this._onAdRefreshed) === 'function')
                        this._onAdRefreshed(this)
                }, _errorOccurredCallback: function(evt) {
                    this._stopPingTimer();
                    if (typeof(evt) !== "object")
                        this._fireErrorOccurred("Other", MicrosoftNSJS.Advertising.AdPackage._ERROR_ENUM.Other);
                    else
                        this._fireErrorOccurred(evt.errorMessage, evt.errorCode);
                    this._requestInProgress = false
                }, _initializeAdData: function() {
                    this.fullAdPayload = null;
                    this.linearCreative = null;
                    this.adCompanions = null;
                    this._trackingEventUrls = {};
                    this._impressionUrls = [];
                    this._videoClickThroughTrackingUrls = [];
                    this._errorEventUrl = null
                }
        }, {
            eventType: {
                AdImpression: "Impression", AdClickThru: "AdClickThru", AdError: "Error", AdStarted: "creativeView", AdVideoStart: "start", AdVideoFirstQuartile: "firstQuartile", AdVideoMidpoint: "midpoint", AdVideoThirdQuartile: "thirdQuartile", AdComplete: "complete", AdMute: "mute", AdUnMute: "unmute", AdPaused: "pause", AdRewind: "rewind", AdPlaying: "resume", AdFullScreen: "fullscreen", AdExpand: "expand", AdCollapse: "collapse", AdAcceptInvitation: "acceptinvitation", AdClose: "close"
            }, _ERROR_ENUM: {
                    Unknown: "Unknown", NoAdAvailable: "NoAdAvailable", NetworkConnectionFailure: "NetworkConnectionFailure", ClientConfiguration: "ClientConfiguration", ServerSideError: "ServerSideError", InvalidServerResponse: "InvalidServerResponse", Other: "Other"
                }
        })})
})(WinJS)
