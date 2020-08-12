/*!
Build Version: 2.48.1
Repository Version: 6377
*/
(function () {
    "use strict";

    
    var baseAdController = WinJS.Class.define(function (params) {
        this.applicationId = params.applicationId; 
        this.el = params.el;

        this._prevSuspendedState = true;
        this._isSuspended = true;
        this._hasCreatedAdContainer = false;
        this._adRendered = false;
        this._isShutdown = false;
        this._hasShownFailedView = false;
        this.skypeAPI = null;
        this._country = null;
        this._hasLanguageChanged = false;
        this._hasAdLogicDataChanged = false;
        this._paidUserlogic = null;
        this._trackingEnabled = true;
        this._isPaidUserLastUpdate = null;
        this._isPaidUserChanged = false;
        this.adContainerView = null;

        this.skypeAPI = new Skype.Ads.SkypeAPI();
        this._language = this.skypeAPI.language;
        this._paidUserlogic = new Skype.Ads.PaidUserLogic(this.skypeAPI);
        this._paidUserlogic.addEventListener("IsPaidUserChanged", this._handlePaidUserChanged.bind(this));
        this._isEngaged = false;
        this._appResumingHandler = function () {
            if (!this._prevSuspendedState) {
                this.resume();
            }
        }.bind(this);
        Skype.Ads.Utils.lifeCycleInstance.addEventListener("resuming", this._appResumingHandler);

        this._appSuspendingHandler = function () {
            this._prevSuspendedState = this._isSuspended;
            this.suspend();
        }.bind(this);
        Skype.Ads.Utils.lifeCycleInstance.addEventListener("suspending", this._appSuspendingHandler);

        this._langChangedHandlerAsync = function () {
            var newLang = this.skypeAPI.language;
            if (!newLang) {
                return; 
            }

            this._hasLanguageChanged = (newLang !== this._language);

            this._language = newLang;

            if (this._isSuspended || this._isShutdown) {
                return WinJS.Promise.wrap(null);
            }

            
            if (this._hasLanguageChanged && this.adContainerView && this.adContainerView.isVisible) {
                this._hasLanguageChanged = false;
                return this._createAdContainerAsync(true);
            }

            return WinJS.Promise.wrap(null);
        }.bind(this);
        WinJS.Resources.addEventListener("contextchanged", this._langChangedHandlerAsync);

        this._adLogicDataRefreshedHandler = function () {
            this._hasAdLogicDataChanged = true;
        }.bind(this);
        Skype.Ads.adLogicInstance().addEventListener("onAdLogicDataRefreshed", this._adLogicDataRefreshedHandler);
    }, {
        
        _handlePaidUserChanged: function (evt) {
            this.isPaidUser = evt.detail;
        },
        isPaidUser : {
            get: function () {
                if (this._isPaidUserLastUpdate === null) {
                    this._isPaidUserLastUpdate = this._paidUserlogic.isPaidUser;
                }
                return this._isPaidUserLastUpdate;
            },
            set: function (value) {
                this._isPaidUserChanged = (value !== this._isPaidUserLastUpdate);
                this._isPaidUserLastUpdate = value;
            }
        },

        createAds: function () { },

        createAdContainerAsync: function () {
            return this._createAdContainerAsync(false);
        },

        
        _createAdContainerAsync: function (skipCheck) {
            if (!skipCheck && this._hasCreatedAdContainer) {
                Skype.Ads.Utils.logADT("not creating ad container again since it has already been called.");
                return WinJS.Promise.wrap(null);
            }

            this._hasCreatedAdContainer = true;

            if (this._isShutdown) {
                return WinJS.Promise.wrap(null);
            }

            
            this.suspend();

            this._isSuspended = false;

            if (!Skype.Ads.connectivityStatusInstance.isConnected) {
                this._removeAdContainer();
                Skype.Ads.Utils.logADT("aborting createAdContainer, no network connectivity");
                return WinJS.Promise.wrap(null);
            }

            if (!Skype.Ads.country) {
                this._removeAdContainer();
                Skype.Ads.Utils.logADT("no country/region code yet, abort creating container");
                return WinJS.Promise.wrap(null);
            }

            this._country = Skype.Ads.country;

            var adLogicInstance = Skype.Ads.adLogicInstance();
            if (!adLogicInstance.isLoaded()) {
                this._removeAdContainer();
                Skype.Ads.Utils.logADT("ad config not loaded yet, abort creating container");
                return WinJS.Promise.wrap(null);
            }

            if (!adLogicInstance.hasAdsEnabled(this._country, this.isPaidUser)) {
                this._removeAdContainer();
                Skype.Ads.Utils.logADT("ads are disabled for the country/region " + this._country);
                return WinJS.Promise.wrap(null);
            }

            if (!this._language) {
                this._removeAdContainer();
                Skype.Ads.Utils.logADT("language is null, likely because lib is not ready, aborting ad create");
                return WinJS.Promise.wrap(null);
            }

            this._setTracking(adLogicInstance);

            var isPanorma = this.placement === Skype.Ads.PlacementTypes.Panorama;

            
            var viewDiv = this.el.querySelector('#viewDiv');
            if (!viewDiv) {
                viewDiv = document.createElement('div');
                viewDiv.id = "viewDiv";
                this.el.appendChild(viewDiv);
            }

            this.containersModel = new Skype.Ads.AdContainersModel(adLogicInstance, this.applicationId || adLogicInstance.getAdLogic().applicationId, this.isPaidUser, this.placement, this._country, this._language);

            this._isFirstTimeUsage = Skype.Ads.isFirstTimeUsage;

            if (this.containersModel.canShowAds(this._isFirstTimeUsage)) {
                this._addFlexTag();
            }

            var initContainerModel = this.containersModel.getContainer(this._isFirstTimeUsage);

            if (!initContainerModel) {
                
                this._removeAdContainer();
                Skype.Ads.Utils.logADT("container model contains no ads to show, removing ad container");
                return WinJS.Promise.wrap(null);
            }

            this.adContainerView = new Skype.Ads.AdContainerView({
                model: initContainerModel,
                el: viewDiv,
                showPremium: (isPanorma && !this.isPaidUser),
                adController: this
            });

            this.adContainerView.addEventListener("onAllAdsFailed", this._handleOnAllAdsFailed.bind(this));
            this.adContainerView.addEventListener("onAdRenderingComplete", this.handleAdRenderingComplete.bind(this));
            this.adContainerView.addEventListener("onEngagedChanged", this.handleOnEngagedChanged.bind(this));

            this.adContainerView.addEventListener("onAdRefreshed", function () {
                this.dispatchEvent('onAdRefreshed');
            }.bind(this));


            this._adRendered = false;

            this._createAdContainerPromise = this.adContainerView.renderContainerAsync(isPanorma).then(
                function (result) {
                    if (this._isSuspended || this._isShutdown) {
                        this._removeAdContainer();
                        return null;
                    }

                    if (!result) {
                        this._removeAdContainer();
                        return result;
                    }

                    if (result && result.name === "Canceled") {
                        Skype.Ads.Utils.logADT("canceled rendering container");
                        return result;
                    }

                    var renderSuccess = this.adContainerView.renderAds();
                    if (renderSuccess) {
                        this.dispatchEvent("AdContainerAdded");
                    }

                    return renderSuccess;
                }.bind(this),
                function (error) {
                    Skype.Ads.Utils.logADT("promise error returned while trying to render container: " + error);
                    return error;
                });

            return this._createAdContainerPromise;
        },
        _addFlexTag: function () {

            var adLogicInstance = Skype.Ads.adLogicInstance();

            if (!adLogicInstance) {
                return;
            }

            var guid = adLogicInstance.getFlexTagGuid(this._country, this.placement);
            
            if (!guid) {
                return;
            }

            var url = adLogicInstance.flexTagUrl;
            if (!url) {
                return;
            }

            var src = url + '?win8Overrides=true&guid=' + guid;

            Skype.Ads.Utils.logADT("loading flextag from src=" + src);

            var flexTag = this.el.querySelector('#flextag');

            
            if (flexTag) {
                flexTag.src = src;
                return;
            }

            
            var iframe = document.createElement('iframe');
            iframe.id = 'flextag';
            iframe.src = src;
            iframe.width = '1px';
            iframe.height = '1px';
            iframe.scrolling = 'no';
            iframe.sandbox = "allow-scripts";
            iframe.frameBorder = '0px';
            iframe.style.visibility = 'hidden';
            iframe.style.display = 'none';
            this.el.appendChild(iframe);
        },
        _setTracking: function (adLogicInstance) {
            if (this._country) {
                this._trackingEnabled = adLogicInstance.hasTrackingEnabled(this._country);
                if (!this._trackingEnabled) {
                    Skype.Ads.Utils.logADT("tracking is disabled for the country/region " + this._country);
                }
            }
        },
        allowAds: function () {
            var allowAds = true;
            
            if (this.placement === Skype.Ads.PlacementTypes.CallConversation) {
                allowAds = this.skypeAPI.allowAds;
                if (allowAds) {
                    Skype.Ads.Utils.logADT("BW/CPU check indicates Ads are allowed for live conversation");
                } else {
                    Skype.Ads.Utils.logADT("BW/CPU check indicates Ads are NOT allowed for live conversation");
                }
            }

            return allowAds;
        },

        suspend: function (event) {

            if (this._isSuspended || this._isShutdown) {
                return;
            }

            this._cancelPromises();

            this._isSuspended = true;

            if (this.adContainerView) {
                this.adContainerView.dispatchEvent("suspend");
            }

            
            
            
            
            if (!this._adRendered || this._hasShownFailedView) {
                this._removeAdContainer();
            }
        },
        _cancelPromises: function () {
            if (this._createAdContainerPromise) {
                this._createAdContainerPromise.cancel();
                this._createAdContainerPromise = null;
            }

            if (this._resumePromise) {
                this._resumePromise.cancel();
                this._resumePromise = null;
            }
        },

        
        resume: function () {

            if (!this._isSuspended || this._isShutdown) {
                return WinJS.Promise.wrap(null);
            }

            if (!Skype.Ads.connectivityStatusInstance.isConnected) {
                var connectivityFailMsg = "aborting ad resume, no network connectivity";
                this._removeAdContainer();
                Skype.Ads.Utils.logADT(connectivityFailMsg);
                this._isSuspended = false;
                return WinJS.Promise.wrap(null);
            }

            if (!Skype.Ads.country) {
                Skype.Ads.Utils.logADT("no country/region code, abort resume");
                return WinJS.Promise.wrap(null);
            }

            
            if (!this._hasAdLogicDataChanged && this._hasShownFailedView) {
                return WinJS.Promise.wrap(null);
            }

            this._hasShownFailedView = false;

            this._isSuspended = false;

            var hasCountryChanged = false;
            if (Skype.Ads.country != this._country) {
                hasCountryChanged = true;
                this._country = Skype.Ads.country;
            }

            var hasFirstTimeUsageChanged = false;
            var isFirstTimeUsage = Skype.Ads.isFirstTimeUsage;
            if (isFirstTimeUsage != this._isFirstTimeUsage) {
                hasFirstTimeUsageChanged = true;
                this._isFirstTimeUsage = isFirstTimeUsage;
            }

            var adLogicInstance = Skype.Ads.adLogicInstance();
            this._setTracking(adLogicInstance);

            var needToCreateNewContainer = !this.adContainerView || !this.adContainerView.isVisible || !this.adContainerView.model || this._hasLanguageChanged || hasCountryChanged || this._hasAdLogicDataChanged || this._isPaidUserChanged || hasFirstTimeUsageChanged;

            if (needToCreateNewContainer) {
                
                this._hasAdLogicDataChanged = false;
                this._isPaidUserChanged = false;
                this._hasLanguageChanged = false;
                this._resumePromise = this._createAdContainerAsync(true);
                return this._resumePromise;
            }

            if (this.containersModel && this.containersModel.canShowAds(this._isFirstTimeUsage)) {
                this._addFlexTag();
            }

            var isPanorma = this.placement === Skype.Ads.PlacementTypes.Panorama;

            
            if (isPanorma) {
                this.adContainerView.dispatchEvent("resume", false);
                
                this._resumePromise = WinJS.Promise.timeout(this.adContainerView.model.resumeRefreshDelaySec * 1000.0).then(
                    function (complete) {
                        
                        if (this._isEngaged || !this.adContainerView || this.adContainerView.upgradeContainer) {
                            return null;
                        }
                        if (this._isSuspended || this._isShutdown || !this.adContainerView.isVisible) {
                            this._removeAdContainer();
                            return null;
                        }
                        this._adRendered = false;
                        return this.adContainerView.renderAds();
                    }.bind(this),
                    function (error) {
                        if (error && error.name === 'Canceled') {
                            return error;
                        }
                        
                        this._removeAdContainer();
                        return error;
                    }.bind(this));
                return this._resumePromise;
            } else if (this.adContainerView) {
                this.adContainerView.dispatchEvent("resume");
            }

            return WinJS.Promise.wrap(true);
        },
        shutdown: function () {
            if (this._isShutdown) {
                return;
            }
            this.suspend();
            if (this._appResumingHandler) {
                Skype.Ads.Utils.lifeCycleInstance.removeEventListener("resuming", this._appResumingHandler);
            }
            if (this._appSuspendingHandler) {
                Skype.Ads.Utils.lifeCycleInstance.removeEventListener("suspending", this._appSuspendingHandler);
            }
            if (this._langChangedHandlerAsync) {
                WinJS.Resources.removeEventListener("contextchanged", this._langChangedHandlerAsync);
            }
            var adLogicInstance = Skype.Ads.adLogicInstance();
            if (adLogicInstance) {
                adLogicInstance.removeEventListener("onAdLogicDataRefreshed", this._adLogicDataRefreshedHandler);
            }
            if (this.adContainerView) {
                this.adContainerView.dispatchEvent("shutdown");
            }
            if (this._paidUserlogic) {
                this._paidUserlogic.shutdown();
            }
            if (this.skypeAPI) {
                this.skypeAPI.shutdown();
            }
            this._removeAdContainer();
            this._isShutdown = true;
            Skype.Ads.Utils.logADT("ad controller has been shutdown");
        },



        
        _handleOnAllAdsFailed: function (e) {
            

            if (this._isSuspended || this._isShutdown) {
                this._removeAdContainer();
                return;
            }

            this._adRendered = false;

            
            
            if (e && e.detail &&
                (e.detail.errorCode === Skype.Ads.ErrorCodes.AdLoading_Timeout ||
                 e.detail.errorCode === Skype.Ads.ErrorCodes.AdLoading_InvalidServerResponse ||
                 e.detail.errorCode === Skype.Ads.ErrorCodes.AdLoading_NetworkConnectionFailure ||
                 e.detail.errorCode === Skype.Ads.ErrorCodes.AdLoading_ServerSideError)) {
                this._showFailedView("AdLoading error", true);
                return;
            }

            
            var nextContainerModel = this.containersModel.getNextAdContainer();
            if (nextContainerModel) {
                this.adContainerView.renderAds(nextContainerModel);
                return;
            }

            this._showFailedView("All ads failed, showing backup creative or removing ad container");
        },
        _showFailedView: function (errorMsgStr, skipSettingHasShownFailedViewFlag) {
            Skype.Ads.Utils.logADT(errorMsgStr);

            
            if (this.placement === Skype.Ads.PlacementTypes.Panorama && this.adContainerView) {
                this.adContainerView.renderFailedView();
                if (!skipSettingHasShownFailedViewFlag) {
                    this._hasShownFailedView = true;
                }
            } else {
                this._removeAdContainer();
            }
        },
        _removeAdContainer: function () {
            if (this.adContainerView) {
                Skype.Ads.Utils.logADT("ad container being removed");
                this.adContainerView.dispatchEvent("remove");
            }
            this.dispatchEvent("AdContainerRemoved");
        },
        
        handleAdRenderingComplete: function () {
            this._adRendered = true;
            
        },
        handleOnEngagedChanged: function (evt) {
            
            this._isEngaged = evt && evt.detail;
            this.dispatchEvent("OnEngagedChanged", this._isEngaged);
        },
        verifyParameters: function (params) {
            var msg;
            if (!params) {
                msg = "Missing parameters.";
            } else if (!params.el) {
                msg = "Missing 'el' parameter.";
            } 
            if (msg) {
                Skype.Ads.Utils.logADT(msg);
                throw new WinJS.ErrorFromName("Skype.Ads.InvalidParameters", msg);
            }
        },

        
        sendCtaTrackingEvent: function (ctaType, adType) {
            if (!this._trackingEnabled) { return; }
            
            var ctaEvent = new Skype.Ads.CTATrackingModel();
            if (this.skypeAPI) {
                ctaEvent.setSkypeName(this.skypeAPI.skypeName);
            }
            if (this._country) {
                ctaEvent.setCountry(this._country);
            }
            if (this._language) {
                ctaEvent.setLanguage(this._language);
            }
            if (adType !== 'undefined') {
                ctaEvent.setAdType(Skype.Ads.Utils.getEnumName(Skype.Ads.AdTypes, adType));
            }
            ctaEvent.setIsPaidUser(this.isPaidUser);
            ctaEvent.setPageView(Skype.Ads.Utils.getEnumName(Skype.Ads.PlacementTypes, this.placement));
            ctaEvent.setCtaType(Skype.Ads.Utils.getEnumName(Skype.Ads.CTATypes, ctaType));
            Skype.Ads.track(ctaEvent);
        },
        sendErrorTrackingEvent: function (errorMsgStr, errorCode, adUnitId, adType) {
            if (!this._trackingEnabled) { return; }

            if (errorCode === Skype.Ads.ErrorCodes.AdLoading_NoAd) {
                this.sendNoAdTrackingEvent(adUnitId);
                return;
            }

            if (!Skype.Ads.connectivityStatusInstance.isConnected) {
                Skype.Ads.Utils.logADT("no network connectivity detected, so skipping sending tracking message: " + errorMsgStr);
                return;
            }

            
            var errorEvent = new Skype.Ads.ErrorTrackingModel();
            if (this.skypeAPI) {
                errorEvent.setSkypeName(this.skypeAPI.skypeName);
            }
            if (this._country) {
                errorEvent.setCountry(this._country);
            }
            if (this._language) {
                errorEvent.setLanguage(this._language);
            }
            if (errorMsgStr) {
                errorEvent.setErrorData(errorMsgStr);
            }
            if (typeof(adType) === 'number') {
                errorEvent.setAdType(Skype.Ads.Utils.getEnumName(Skype.Ads.AdTypes, adType));
            }
            errorEvent.setErrorCode(Skype.Ads.Utils.getEnumName(Skype.Ads.ErrorCodes, errorCode));
            errorEvent.setPageView(Skype.Ads.Utils.getEnumName(Skype.Ads.PlacementTypes, this.placement));
            Skype.Ads.track(errorEvent);
        },
        sendNoAdTrackingEvent: function(adUnitId) {
            if (!this._trackingEnabled) { return; }
            var noAdEvent = new Skype.Ads.NoAdTrackingModel();
            noAdEvent.setIsPaidUser(this.isPaidUser);
            noAdEvent.setPageView(Skype.Ads.Utils.getEnumName(Skype.Ads.PlacementTypes, this.placement));
            if (adUnitId) {
                noAdEvent.setAdUnitId(adUnitId);
            }
            if (this.skypeAPI) {
                noAdEvent.setSkypeName(this.skypeAPI.skypeName);
            }
            if (this._country) {
                noAdEvent.setCountry(this._country);
            }
            if (this._language) {
                noAdEvent.setLanguage(this._language);
            }
            Skype.Ads.track(noAdEvent);
        },
        sendExpandTrackingEvent: function (adType, adUnitId, creativeURL) {
            if (!this._trackingEnabled) { return; }
            
            var expandEvent = new Skype.Ads.ExpandAdTrackingModel();
            if (this.skypeAPI) {
                expandEvent.setSkypeName(this.skypeAPI.skypeName);
            }
            if (this._country) {
                expandEvent.setCountry(this._country);
            }
            if (this._language) {
                expandEvent.setLanguage(this._language);
            }
            if (creativeURL) {
                expandEvent.setCreativeUrl(creativeURL);
            }
            expandEvent.setAdType(Skype.Ads.Utils.getEnumName(Skype.Ads.AdTypes, adType));
            expandEvent.setAdUnitId(adUnitId);
            expandEvent.setPageView(Skype.Ads.Utils.getEnumName(Skype.Ads.PlacementTypes, this.placement));
            expandEvent.setIsPaidUser(this.isPaidUser);
            Skype.Ads.track(expandEvent);
        },
        sendCollapseTrackingEvent: function (adType, adUnitId, creativeUrl, adTimeOpenMs) {
            if (!this._trackingEnabled) { return; }
            var collapseEvent = new Skype.Ads.CollapseAdTrackingModel();
            if (this.skypeAPI) {
                collapseEvent.setSkypeName(this.skypeAPI.skypeName);
            }
            if (this._country) {
                collapseEvent.setCountry(this._country);
            }
            if (this._language) {
                collapseEvent.setLanguage(this._language);
            }
            if (creativeUrl) {
                collapseEvent.setCreativeUrl(creativeUrl);
            }
            if (typeof (adTimeOpenMs) === 'number') {
                collapseEvent.setAdTimeOpenMs(adTimeOpenMs);
            }
            collapseEvent.setAdType(Skype.Ads.Utils.getEnumName(Skype.Ads.AdTypes, adType));
            collapseEvent.setAdUnitId(adUnitId);
            collapseEvent.setPageView(Skype.Ads.Utils.getEnumName(Skype.Ads.PlacementTypes, this.placement));
            collapseEvent.setIsPaidUser(this.isPaidUser);
            Skype.Ads.track(collapseEvent);
        },
        sendLoadTrackingEvent: function (adType, adUnitId, loadTime, creativeUrl) {
            if (!this._trackingEnabled) { return; }
            
            var loadEvent = new Skype.Ads.LoadAdTrackingModel();
            if (this.skypeAPI) {
                loadEvent.setSkypeName(this.skypeAPI.skypeName);
            }
            if (this._country) {
                loadEvent.setCountry(this._country);
            }
            if (this._language) {
                loadEvent.setLanguage(this._language);
            }
            if (typeof(adType) === 'number') {
                loadEvent.setAdType(Skype.Ads.Utils.getEnumName(Skype.Ads.AdTypes, adType));
            }
            if (adUnitId) {
                loadEvent.setAdUnitId(adUnitId);
            }
            if (typeof (loadTime) === 'number') {
                loadEvent.setAdTimeToLoadMs(loadTime);
            }
            if (creativeUrl) {
                loadEvent.setCreativeUrl(creativeUrl);
            }
            loadEvent.setPageView(Skype.Ads.Utils.getEnumName(Skype.Ads.PlacementTypes, this.placement));
            loadEvent.setIsPaidUser(this.isPaidUser);
            Skype.Ads.track(loadEvent);
        },
        sendClickTrackingEvent: function (adType, adUnitId, creativeUrl, clickThroughUrl) {
            if (!this._trackingEnabled) { return; }
            var clickEvent = new Skype.Ads.ClickAdTrackingModel();
            if (this.skypeAPI) {
                clickEvent.setSkypeName(this.skypeAPI.skypeName);
            }
            if (this._country) {
                clickEvent.setCountry(this._country);
            }
            if (this._language) {
                clickEvent.setLanguage(this._language);
            }
            if (typeof (adType) === 'number') {
                clickEvent.setAdType(Skype.Ads.Utils.getEnumName(Skype.Ads.AdTypes, adType));
            }
            if (adUnitId) {
                clickEvent.setAdUnitId(adUnitId);
            }
            if (creativeUrl) {
                clickEvent.setCreativeUrl(creativeUrl);
            }
            if (clickThroughUrl) {
                clickEvent.setAdditionalData("clickThroughUrl", clickThroughUrl);
            }
            clickEvent.setPageView(Skype.Ads.Utils.getEnumName(Skype.Ads.PlacementTypes, this.placement));
            clickEvent.setIsPaidUser(this.isPaidUser);
            Skype.Ads.track(clickEvent);
        }
    },{
        

    });

    
    baseAdController = WinJS.Class.mix(baseAdController, WinJS.Utilities.eventMixin);

    WinJS.Namespace.define("Skype.Ads", {
        BaseAdController: baseAdController,
    });

}());
(function () {
    "use strict";

    
    var BaseModel = WinJS.Class.define(function (params) {
        this.attrs = {};
        if (params && params.event_type) {
            this.event_type = params.event_type;
        } else {
            this.event_type = "ADT_NOT_PROVIDED";
            Skype.Ads.Utils.logADT("error: event type for tracking event was not provided");
        }
    }, {
        setSkypeName: function (skypeName) {
            this.skypeName = skypeName;
        },
        setCountry: function (country) {
            if (this.attrs) {
                this.attrs.country = country;
            }
        },
        setLanguage: function (language) {
            if (this.attrs) {
                this.attrs.language = language;
            }
        },
        setAdditionalData: function (key, value) {
            if (this.attrs) {
                if (!this.attrs.additionalData) {
                    this.attrs.additionalData = {};
                }
                this.attrs.additionalData[key] = value;
            }
        },
        getEventData: function () {
            if (!this.attrs) {
                Skype.Ads.Utils.logADT("BaseEventTrackingModel : no attributes are defined");
                return false;
            }
            
            var data = {};
            data.id = Skype.Ads.Utils.getGuid();
            data.timestamp = new Date().getTime();
            data.type = "ADTTracking";
            data.event_type = this.event_type;

            data.initiating_user_composite = {};
            if (this.skypeName) {
                data.initiating_user_composite.username = this.skypeName;
            }
            var ipAddress = Skype.Ads.ipAddress;
            if (ipAddress) {
                data.initiating_user_composite.endpoint = ipAddress;
            }
            var version = Skype.Ads.SkypeAPI.skypeVersion;
            if (version) {
                data.initiating_user_composite.ui_version = version;
            }
            var adLogicInstance = Skype.Ads.adLogicInstance();
            if (adLogicInstance && adLogicInstance.configUrl) {
                this.attrs.configUrl = adLogicInstance.configUrl;
            }
            data.extension = this.attrs;

            return data;
        }
    }, {
        
    });

    WinJS.Namespace.define("Skype.Ads", {
        BaseEventTrackingModel: BaseModel
    });

}());
(function () {
    "use strict";

    
    var BaseAdmodel = WinJS.Class.define(function (params) {
    },{
        
    },{
        
    });

    WinJS.Namespace.define("Skype.Ads", {
        BaseAdModel: BaseAdmodel
    });

}());
(function () {
    "use strict";

    
    var BaseAdView = WinJS.Class.define(function (params) {
        this.model = this.model || params.model || new Skype.Ads.BaseAdModel();
        this.width = this.model.width || 250;
        this.height = this.model.height || 250;
        this.rendered = false;
    }, {
        
        render: function () {
            this.rendered = true;
            this.dispatchEvent("rendered");
        }
    }, {
        
    });

    
    BaseAdView = WinJS.Class.mix(BaseAdView, WinJS.Utilities.eventMixin);

    WinJS.Namespace.define("Skype.Ads", {
        BaseAdView: BaseAdView
    });

}());
(function () {
    "use strict";

    var logADT = typeof log === "undefined" ?
    function () {
        ///<disable>JS2043.RemoveDebugCode</disable>
        console.log(['ADT: '] + Array.prototype.splice.call(arguments, 0));
        ///<enable>JS2043.RemoveDebugCode</enable>
    } :
    function () {
        log(['ADT: '] + Array.prototype.splice.call(arguments, 0));
    };

    var _gid = 0;
    function getUniqueId() {
        _gid += 1;
        return _gid;
    }
        
    function getGuid() {
        
        var r;
        var guid = "";
        for (var i = 0; i < 8; i++) {
            
            r = Math.floor(Math.random() * Math.pow(2, 16));

            if (i === 3) {
                r = r & 0x0fff | 0x4000; 
            } else if (i === 4) {
                r = r & 0x3fff | 0x8000; 
            }

            
            if (r < 16) {
                guid += "000";
            } else if (r < 256) {
                guid += "00";
            } else if (r < 4096) {
                guid += "0";
            }

            guid += r.toString(16);

            if (i > 0 && i < 5) {
                guid += '-';
            }
        }

        return guid;
    }

    function getEnumName(enumType, value) {
        for (var v in enumType) {
            if (enumType[v] === value) {
                return v;
            }
        }
        return null;
    }

    
    
    
    
    
    
    
    
    var LifeCycle = WinJS.Class.define(function (webUIAppObj, appObj) {
        
        webUIAppObj.addEventListener("resuming", function () {
            this.dispatchEvent("resuming");
        }.bind(this));
        webUIAppObj.addEventListener("suspending", function (e) {
            var deferral = e && e.suspendingOperation && e.suspendingOperation.getDeferral();
            setTimeout(function () {
                deferral && deferral.complete();
            }, 1500);
            this.dispatchEvent("suspending");
        }.bind(this));
        appObj.addEventListener("activated", function (e) {
            this.dispatchEvent("activated", e);
        }.bind(this));
    }, {
        
    }, {
        
    }
    );

    
    LifeCycle = WinJS.Class.mix(LifeCycle, WinJS.Utilities.eventMixin);

    var lifeCycleInstance = new LifeCycle(Windows.UI.WebUI.WebUIApplication, WinJS.Application);

    var deepObjectCompare = function (obj1, obj2) {
        if (typeof (obj1) !== typeof (obj2)) {
            return false;
        }

        if (typeof (obj1) === 'function') {
            return obj1.toString() === obj2.toString();
        }

        if (obj1 instanceof Object && obj2 instanceof Object) {
            var count2 = 0;
            for (var j in obj2) {
                if (obj2.hasOwnProperty(j)) {
                    count2++;
                }
            }
            var count1 = 0;
            for (var k in obj1) {
                if (obj1.hasOwnProperty(k)) {
                    count1++;
                }
            }
            if (count1 !== count2) {
                return false;
            }
            var result = false;
            for (var i in obj1) {
                if (obj1.hasOwnProperty(i)) {
                    result = deepObjectCompare(obj1[i], obj2[i]);
                    if (!result) {
                        return false;
                    }
                }
            }
            return true;
        } else {
            return obj1 === obj2;
        }
    };

    WinJS.Namespace.define("Skype.Ads.Utils", {
        logADT: logADT,
        getUniqueId: getUniqueId,
        getGuid: getGuid,
        getEnumName: getEnumName,
        deepObjectCompare: deepObjectCompare,
        lifeCycleInstance: lifeCycleInstance,

    });
}());
(function () {
    "use strict";

    
    var ConversationAdController = WinJS.Class.derive(Skype.Ads.BaseAdController, function (params) {
        this.verifyParameters(params);

        this.isLive = params.isLive;
        this.el = null;

        if (this.isLive) {
            this.placement = Skype.Ads.PlacementTypes.CallConversation;
        } else {
            this.placement = Skype.Ads.PlacementTypes.ChatConversation;
        }

        Skype.Ads.BaseAdController.prototype.constructor.call(this, params);
    },{
        

        
        createAds: function () {
            Skype.Ads.Utils.logADT('conversation createAds');
            return this.createAdContainerAsync();
        }
    },{
        
    });

    WinJS.Namespace.define("Skype.Ads", {
        ConversationAdController: ConversationAdController
    });

}());
(function () {
    "use strict";

    
    var DisplayAdController = WinJS.Class.derive(Skype.Ads.BaseAdController, function (params) {
        this.verifyParameters(params);
        
        this.isLive = false;
        this.el = null;
        this.placement = Skype.Ads.PlacementTypes.Panorama;

        Skype.Ads.BaseAdController.prototype.constructor.call(this, params);
    }, {
        

        
        createAds: function () {
            Skype.Ads.Utils.logADT('display createAds');
            return this.createAdContainerAsync();
        }
    }, {
        
    });

    WinJS.Namespace.define("Skype.Ads", {
        DisplayAdController: DisplayAdController,
    });

}());
(function () {
    "use strict";

    
    var ClickAdTrackingModel = WinJS.Class.derive(Skype.Ads.BaseEventTrackingModel, function () {
        var params = {};
        params.event_type = "ADT_CLICK";
        Skype.Ads.BaseEventTrackingModel.prototype.constructor.call(this, params);
    }, {
        
        setAdType: function (adType) {
            if (this.attrs) {
                this.attrs.adType = adType;
            }
        },
        setIsPaidUser: function (isPaidUser) {
            if (this.attrs) {
                this.attrs.isPaidUser = isPaidUser;
            }
        },
        setPageView: function (pageView) {
            if (this.attrs) {
                this.attrs.pageView = pageView;
            }
        },
        setAdUnitId: function (adUnitId) {
            if (this.attrs) {
                this.attrs.adUnitId = adUnitId;
            }
        },
        setCreativeUrl: function (creativeUrl) {
            if (this.attrs) {
                this.attrs.creativeUrl = creativeUrl;
            }
        }
    }, {
        
    });

    WinJS.Namespace.define("Skype.Ads", {
        ClickAdTrackingModel: ClickAdTrackingModel,
    });

}());
(function () {
    "use strict";

    
    var CollapseAdTrackingModel = WinJS.Class.derive(Skype.Ads.BaseEventTrackingModel, function () {
        var params = {};
        params.event_type = "ADT_COLLAPSE";
        Skype.Ads.BaseEventTrackingModel.prototype.constructor.call(this, params);
    }, {
        
        setAdType: function (adType) {
            if (this.attrs) {
                this.attrs.adType = adType;
            }
        },
        setIsPaidUser: function (isPaidUser) {
            if (this.attrs) {
                this.attrs.isPaidUser = isPaidUser;
            }
        },
        setPageView: function (pageView) {
            if (this.attrs) {
                this.attrs.pageView = pageView;
            }
        },
        setAdUnitId: function (adUnitId) {
            if (this.attrs) {
                this.attrs.adUnitId = adUnitId;
            }
        },
        setCreativeUrl: function (creativeUrl) {
            if (this.attrs) {
                this.attrs.creativeUrl = creativeUrl;
            }
        },
        setAdTimeOpenMs: function (adTimeOpenMs) {
            if (this.attrs) {
                this.attrs.adTimeOpenMs = adTimeOpenMs;
            }
        }
    }, {
        
    });

    WinJS.Namespace.define("Skype.Ads", {
        CollapseAdTrackingModel: CollapseAdTrackingModel,
    });

}());
(function () {
    "use strict";

    
    var ConfigLoadTrackingModel = WinJS.Class.derive(Skype.Ads.BaseEventTrackingModel, function () {
        var params = {};
        params.event_type = "ADT_CONFIGLOAD";
        Skype.Ads.BaseEventTrackingModel.prototype.constructor.call(this, params);

    }, {
        
    }, {
        
    });

    WinJS.Namespace.define("Skype.Ads", {
        ConfigLoadTrackingModel: ConfigLoadTrackingModel,
    });

}());
(function () {
    "use strict";

    
    var CTATrackingModel = WinJS.Class.derive(Skype.Ads.BaseEventTrackingModel, function () {
        var params = {};
        params.event_type = "ADT_CTA";
        Skype.Ads.BaseEventTrackingModel.prototype.constructor.call(this, params);

    }, {
        
        setIsPaidUser: function (isPaidUser) {
            if (this.attrs) {
                this.attrs.isPaidUser = isPaidUser;
            }
        },
        setPageView: function (pageView) {
            if (this.attrs) {
                this.attrs.pageView = pageView;
            }
        },
        setCtaType: function (ctaType) {
            if (this.attrs) {
                this.attrs.ctaType = ctaType;
            }
        },
        setAdType: function (adType) {
            if (this.attrs) {
                this.attrs.adType = adType;
            }
        }
    }, {
        
    });

    
    var ctaTypes = { MORE_SKYPE:0, DISCOVER_PREMIUM:1, DISCOVER_MORE_FEATURES:2, CALL_PHONES:3};

    WinJS.Namespace.define("Skype.Ads", {
        CTATrackingModel: CTATrackingModel,
        CTATypes: ctaTypes
    });

}());
(function () {
    "use strict";

    
    var ErrTrackingModel = WinJS.Class.derive(Skype.Ads.BaseEventTrackingModel, function () {
        var params = {};
        params.event_type = "ADT_ERROR";
        Skype.Ads.BaseEventTrackingModel.prototype.constructor.call(this, params);

    }, {
        
        setErrorCode: function (errorCode) {
            if (this.attrs) {
                this.attrs.errorCode = errorCode;
            }
        },
        setErrorData: function (errorData) {
            if (this.attrs) {
                this.attrs.errorData = errorData;
            }
        },
        setPageView: function (pageView) {
            if (this.attrs) {
                this.attrs.pageView = pageView;
            }
        },
        setAdType: function (adType) {
            if (this.attrs) {
                this.attrs.adType = adType;
            }
        }
    }, {
        
    });

    
    
    var ErrorCodes = {
        AdLoading_Timeout: 0,
        AdLoading_InvalidServerResponse: 1,
        AdLoading_NetworkConnectionFailure: 2,
        AdLoading_ServerSideError: 3,
        AdLoading_NoAd: 4, 
        CountryCodeError: 5,
        ConfigFileError: 6,
        AdLoading_Other: 7,
    };

    WinJS.Namespace.define("Skype.Ads", {
        ErrorTrackingModel: ErrTrackingModel,
        ErrorCodes: ErrorCodes
    });

}());
(function () {
    "use strict";

    
    var ExpandAdTrackingModel = WinJS.Class.derive(Skype.Ads.BaseEventTrackingModel, function () {
        var params = {};
        params.event_type = "ADT_EXPAND";
        Skype.Ads.BaseEventTrackingModel.prototype.constructor.call(this, params);

    }, {
        
        setAdType: function (adType) {
            if (this.attrs) {
                this.attrs.adType = adType;
            }
        },
        setIsPaidUser: function (isPaidUser) {
            if (this.attrs) {
                this.attrs.isPaidUser = isPaidUser;
            }
        },
        setPageView: function (pageView) {
            if (this.attrs) {
                this.attrs.pageView = pageView;
            }
        },
        setAdTimeToLoadMs: function (adTimeToLoadMs) {
            if (this.attrs) {
                this.attrs.adTimeToLoadMs = adTimeToLoadMs;
            }
        },
        setAdUnitId: function (adUnitId) {
            if (this.attrs) {
                this.attrs.adUnitId = adUnitId;
            }
        },
        setCreativeUrl: function (creativeUrl) {
            if (this.attrs) {
                this.attrs.creativeUrl = creativeUrl;
            }
        }
    }, {
        
    });

    WinJS.Namespace.define("Skype.Ads", {
        ExpandAdTrackingModel: ExpandAdTrackingModel,
    });

}());
(function () {
    "use strict";

    
    var LoadAdTrackingModel = WinJS.Class.derive(Skype.Ads.BaseEventTrackingModel, function () {
        var params = {};
        params.event_type = "ADT_LOAD";
        Skype.Ads.BaseEventTrackingModel.prototype.constructor.call(this, params);

    }, {
        
        setAdType: function (adType) {
            if (this.attrs) {
                this.attrs.adType = adType;
            }
        },
        setIsPaidUser: function (isPaidUser) {
            if (this.attrs) {
                this.attrs.isPaidUser = isPaidUser;
            }
        },
        setPageView: function (pageView) {
            if (this.attrs) {
                this.attrs.pageView = pageView;
            }
        },
        setAdTimeToLoadMs: function (adTimeToLoadMs) {
            if (this.attrs) {
                this.attrs.adTimeToLoadMs = adTimeToLoadMs;
            }
        },
        setAdUnitId: function (adUnitId) {
            if (this.attrs) {
                this.attrs.adUnitId = adUnitId;
            }
        },
        setCreativeUrl: function (creativeUrl) {
            if (this.attrs) {
                this.attrs.creativeUrl = creativeUrl;
            }
        }
    }, {
        
    });

    WinJS.Namespace.define("Skype.Ads", {
        LoadAdTrackingModel: LoadAdTrackingModel,
    });

}());
(function () {
    "use strict";

    
    var NoAdTrackingModel = WinJS.Class.derive(Skype.Ads.BaseEventTrackingModel, function () {
        var params = {};
        params.event_type = "ADT_NOAD";
        Skype.Ads.BaseEventTrackingModel.prototype.constructor.call(this, params);

    }, {
        
        setIsPaidUser: function (isPaidUser) {
            if (this.attrs) {
                this.attrs.isPaidUser = isPaidUser;
            }
        },
        setPageView: function (pageView) {
            if (this.attrs) {
                this.attrs.pageView = pageView;
            }
        },
        setAdUnitId: function (adUnitId) {
            if (this.attrs) {
                this.attrs.adUnitId = adUnitId;
            }
        }
    }, {
        
    });

    WinJS.Namespace.define("Skype.Ads", {
        NoAdTrackingModel: NoAdTrackingModel,
    });

}());
(function () {
    "use strict";

    
    var XConfigLoadTrackingModel = WinJS.Class.derive(Skype.Ads.BaseEventTrackingModel, function () {
        var params = {};
        params.event_type = "ADT_XCONFIGLOAD";
        Skype.Ads.BaseEventTrackingModel.prototype.constructor.call(this, params);
    }, {
        
        setErrorData: function (errorData) {
            if (this.attrs) {
                this.attrs.errorData = errorData;
            }
        }
    }, {
        
    });

    WinJS.Namespace.define("Skype.Ads", {
        XConfigLoadTrackingModel: XConfigLoadTrackingModel,
    });

}());
(function () {
    "use strict";

    
    var XCountryCodeTrackingModel = WinJS.Class.derive(Skype.Ads.BaseEventTrackingModel, function () {
        var params = {};
        params.event_type = "ADT_XCOUNTRYLOAD";
        Skype.Ads.BaseEventTrackingModel.prototype.constructor.call(this, params);
    }, {
        
        setErrorData: function (errorData) {
            if (this.attrs) {
                this.attrs.errorData = errorData;
            }
        }
    }, {
        
    });

    WinJS.Namespace.define("Skype.Ads", {
        XCountryCodeTrackingModel: XCountryCodeTrackingModel,
    });

}());
(function () {
    "use strict";

    
    var AdContainerModel = WinJS.Class.derive(Skype.Ads.BaseAdModel, function (params) {
        this._name = params.name;
        this._onNoAd = params.onNoAd;
        this._ads = params.adsToRender;
        this.adsPerContainer = params.ads.length;
    },{
        
        name: { get: function () { return this._name; } },
        onNoAd: {
            get: function () { return this._onNoAd; },
            set: function (value) { this._onNoAd = value; }
        },
        ads: { get: function () { return this._ads; } },
        resumeRefreshDelaySec: {
            get: function () {
                var value = this._ads && this._ads.length > 0 && this._ads[0].resumeRefreshDelaySec;
                if (typeof value === 'number' && value > 0) {
                    return value;
                }
                return 5000; 
            }
        }
    },{
        
    });

    WinJS.Namespace.define("Skype.Ads", {
        AdContainerModel: AdContainerModel,
    });

}());
(function () {
    "use strict";

    
    var AdContainersModel = WinJS.Class.define(function (adLogicInstance, applicationId, isPaid, placement, country, language) {

        this._currentContainerIndex = 0;
        this._containers = [];
        this._allowedAdTypes = [Skype.Ads.AdTypes.NoAd]; 

        if (!adLogicInstance) {
            return;
        }
         
        this._adLogicInstance = adLogicInstance;

        var containers = [];

        this._isPaid = isPaid;
        this._placement = placement;
        this._country = country;
        this._language = language;

        var adLogic = adLogicInstance.getAdLogic();

        if (placement === Skype.Ads.PlacementTypes.ChatConversation || placement === Skype.Ads.PlacementTypes.CallConversation) {
            if (isPaid) {
                containers = [];
            } else {
                containers = adLogic.conversationNonPaidContainers;
            }
        } else if (placement === Skype.Ads.PlacementTypes.Panorama) {
            if (isPaid) {
                containers = adLogic.panoramaPaidContainers;
            } else {
                containers = adLogic.panoramaNonPaidContainers;
            }
        } else {
            Skype.Ads.Utils.logADT("invalid placement value provided, placement = " + placement);
            return; 
        }

        var getAdUnitId = function (width, height, adType) {
            return this._adLogicInstance.getAdUnitId(this._language, this._country, width, height, this._isPaid, adType, this._placement);
        }.bind(this);
	
        var isValidEnumValue = function (value, enumType) {
            for (var i in enumType) {
                if (enumType.propertyIsEnumerable(i) && enumType[i] === value) {
                    return true;
                }
            }

            return false;
        };

        var refreshPeriod = adLogic.adRefreshPeriodSec || 60.0;

        
        var adModel, incrementTime, staggeredRefreshDelaySec;
        for (var i = 0, len = containers.length; i < len; i++) {
            var ads = containers[i].ads;
            var newAds = [];
            incrementTime = ads.length > 0 ? refreshPeriod / ads.length : 0;
            staggeredRefreshDelaySec = refreshPeriod;
            for (var j = 0, lenAds = ads.length; j < lenAds; j++) {
                var ad = ads[j];

                
                
                if (!ad.adUnitId && !isValidEnumValue(ad.adType, Skype.Ads.AdTypes)) {
                     continue;
                }

                
                if (!isValidEnumValue(ad.ctrlType, Skype.Ads.CtrlTypes)) {
                    continue;
                }

                if (ad.ctrlType === Skype.Ads.CtrlTypes.MS) {
                    ad.applicationId = applicationId;
                    adModel = new Skype.Ads.MsAdModel(ad, getAdUnitId, refreshPeriod, staggeredRefreshDelaySec);
                    staggeredRefreshDelaySec += incrementTime;
                    if (adModel.isValid()) {
                        newAds.push(adModel);
                        if (this._allowedAdTypes.indexOf(ad.adType) === -1) {
                            this._allowedAdTypes.push(ad.adType);
                        }
                    }
                }
            }

            
            var newAdContainer = {};
            for (var p in containers[i]) {
                if (containers[i].hasOwnProperty(p)) {
                    newAdContainer[p] = containers[i][p];
                }
            }
            newAdContainer.adsToRender = newAds;
            newAdContainer.adRefreshPeriodSec = adLogic.adRefreshPeriodSec;
            this._containers.push(new Skype.Ads.AdContainerModel(newAdContainer));
        }

        
        
        for (i = 0; i < this._containers.length; i++) {
            if (this._containers[i].ads.length === 0) {

                
                var nextIndex = this._containers[i].onNoAd;
                for (j = 0; j < this._containers.length; j++) {
                    if (this._containers[j].onNoAd === i) {
                        this._containers[j].onNoAd = nextIndex;
                    }
                }

                if (i === 0) {
                    
                    this._containers.splice(i, 1);
                    for (j = 0; j < this._containers.length; j++) {
                        if (this._containers[j].onNoAd !== -1) {
                            this._containers[j].onNoAd--;
                        }
                    }
                }
            }
        }
    },{
        
        _length: {
            get: function () {
                return this._containers.length;
            }
        },
        
        
        
        
        getContainer: function (isFirstTimeUsage) {

            var randomAdTypes = null;
            
            if (this._adLogicInstance.isLoaded() &&
                typeof isFirstTimeUsage === 'boolean' &&
                this._placement === Skype.Ads.PlacementTypes.Panorama) {

                randomAdTypes = this._adLogicInstance.pickRandomAdType(this._country, this._isPaid, isFirstTimeUsage, this._allowedAdTypes);
                if (this._isNoAd(randomAdTypes)) {
                    return null;
                }
            }

            return this._getContainerWithMatchingAdType(randomAdTypes);
        },
        _isNoAd: function (adTypes) {
            if (adTypes && Array.isArray(adTypes)) {
                return (adTypes.indexOf(Skype.Ads.AdTypes.NoAd) !== -1);
            }
            return false;
        },
        
        
        
        
        _getContainerWithMatchingAdType: function (adTypes) {
            var index = 0;
            var ads;
            var containerModel;

            if (this._length <= 0) {
                return null;
            }

            if (Array.isArray(adTypes)) {
                while (index < this._length) {
                    containerModel = this._containers[index];
                    ads = containerModel.ads;
                    for (var j = 0, adTypesLen = adTypes.length; j < adTypesLen; j++) {
                        for (var i = 0, len = ads.length; i < len; i++) {
                            if (ads[i].adType === adTypes[j]) {
                                this._currentContainerIndex = index;
                                return containerModel;
                            }
                        }
                    }
                    index++;
                }
            }

            
            if (this._currentContainerIndex < 0 || this._currentContainerIndex >= this._containers.length) {
                this._currentContainerIndex = 0;
            }
            return this._containers[this._currentContainerIndex];
        },
        _getNextAdContainerInSequence: function () {
            if (this._length <= 0) {
                return null;
            }

            this._currentContainerIndex++;

            if (this._currentContainerIndex >= this._length) {
                this._currentContainerIndex = 0;
            }

            var nextContainerModel = this._containers[this._currentContainerIndex];

            return nextContainerModel;
        },
        
        
        
        getNextAdContainer: function () {
            if (this._currentContainerIndex < 0 || this._currentContainerIndex >= this._length) {
                return null;
            }

            var adTypes = null;
            if (this._placement === Skype.Ads.PlacementTypes.Panorama) {
                adTypes = this._adLogicInstance.getAdTypesWithPercentGreaterThanZero(this._country, this._isPaid);
            }

            var currContainerModel, noAdIndex;

            do {
                currContainerModel = this._containers[this._currentContainerIndex];

                if (currContainerModel) {
                    noAdIndex = currContainerModel.onNoAd;
                    if (noAdIndex >= 0 && noAdIndex < this._length) {
                        this._currentContainerIndex = noAdIndex;
                        if (!adTypes || this._isAdTypeInCurrentContainer(adTypes)) {
                            return this._containers[this._currentContainerIndex];
                        }
                    }
                }

            } while (noAdIndex != -1 && currContainerModel);

            return null;
        },
        
        
        _isAdTypeInCurrentContainer: function (adTypes) {
            if (this._currentContainerIndex < 0 || this._currentContainerIndex >= this._length) {
                return false;
            }
            if (this._length <= 0 || !adTypes || !Array.isArray(adTypes)) {
                return false;
            }
            var ads = this._containers[this._currentContainerIndex].ads;
            for (var j = 0, adTypesLen = adTypes.length; j < adTypesLen; j++) {
                for (var i = 0, adsLen = ads.length; i < adsLen; i++) {
                    if (ads[i].adType === adTypes[j]) {
                        return true;
                    }
                }
            }

            return false;
        },
        
        canShowAds: function (isFirstTimeUsage) {
            if (this._isPaid || isFirstTimeUsage) {
                return false;
            }

            
            var adTypes = [Skype.Ads.AdTypes.ThirdPartyAd, Skype.Ads.AdTypes.Offers, Skype.Ads.AdTypes.SponsoredContent];

            if (this._placement === Skype.Ads.PlacementTypes.Panorama) {
                var adTypesGreaterThanZero = this._adLogicInstance.getAdTypesWithPercentGreaterThanZero(this._country, this._isPaid);
                
                if (adTypesGreaterThanZero.indexOf(Skype.Ads.AdTypes.ThirdPartyAd) !== -1 ||
                    adTypesGreaterThanZero.indexOf(Skype.Ads.AdTypes.NoAd) !== -1 ||
                    adTypesGreaterThanZero.indexOf(Skype.Ads.AdTypes.Offers) !== -1 ||
                    adTypesGreaterThanZero.indexOf(Skype.Ads.AdTypes.SponsoredContent) !== -1) {
                    
                    return this._doesAllowedAdTypesContainAnyOfTheseAdTypes(adTypes);
                }
            } else {
                
                
                return this._doesAllowedAdTypesContainAnyOfTheseAdTypes(adTypes);
            }

            return false;
        },
        _doesAllowedAdTypesContainAnyOfTheseAdTypes: function (adTypes) {
            if (Array.isArray(adTypes)) {
                for (var i = 0, len = adTypes.length; i < len; i++) {
                    if (this._allowedAdTypes.indexOf(adTypes[i]) !== -1) {
                        return true;
                    }
                }
            }

            return false;
        }
        
    },{
        
    });

    WinJS.Namespace.define("Skype.Ads", {
        AdContainersModel: AdContainersModel
    });

}());
(function () {
    "use strict";

    
    
    
    
    
    var _fileContents = {};
    var _isFileRead = false;
    var _fileName = "ad_config";
    var _isFirstTimeUsage = false;
    var _errorReadingFile = false;

    var updateFirstTimeUserStatusAsync = function (firstTimeUserDays) {
        return readFileAsync().then(
            
            function () {
                if (_errorReadingFile || typeof (_fileContents.ts) !== 'number') {
                    _isFirstTimeUsage = true;
                    Skype.Ads.Utils.logADT("file does not exist or can not be read, is a first time user");
                    _fileContents.ts = new Date().getTime();
                    return saveFileAsync().then(
                        function () {
                            return _isFirstTimeUsage;
                        }
                    );
                } else {
                    if (typeof (firstTimeUserDays) !== 'number') {
                        return _isFirstTimeUsage;
                    }
                    var now = new Date().getTime();
                    var firstTimeUserDaysInMs = firstTimeUserDays * 24 * 3600 * 1000;
                    _isFirstTimeUsage = (now <= (_fileContents.ts + firstTimeUserDaysInMs));
                    Skype.Ads.Utils.logADT("first time user status = " + _isFirstTimeUsage);
                    return _isFirstTimeUsage;
                }
            }
       );
    };

    
    var _inProgressPromises = [];

    
    function waitIfIOInProgressAsync(nextAsyncToCall) {
        var processNextAsync = function (nextAsync) {
            return nextAsync().then(function () {
                _inProgressPromises = [];
                Skype.Ads.Utils.logADT("i/o done.");
            });
        };

        
        if (_inProgressPromises.length > 0) {
            Skype.Ads.Utils.logADT("i/o on config file in progress, will wait my turn.");
            var inProgressPromises = _inProgressPromises;
            var joinPromise = WinJS.Promise.join(inProgressPromises).then(
                function () {
                    Skype.Ads.Utils.logADT("i/o on config file done, my turn now.");
                    return processNextAsync(nextAsyncToCall);
                });
            _inProgressPromises = [joinPromise];
            return joinPromise;
        } else {
            Skype.Ads.Utils.logADT("no i/o on config file in process, i can start now.");
            var promise = processNextAsync(nextAsyncToCall);
            _inProgressPromises.push(promise);
            return promise;
        }
    }

    function readFileAsync() {
        if (_isFileRead) {
            return WinJS.Promise.wrap(_fileContents);
        }
        var localFolder = Windows.Storage.ApplicationData.current.localFolder;
        if (!localFolder) {
            return WinJS.Promise.wrap(_fileContents);
        }

        var getFile = function () {
            Skype.Ads.Utils.logADT("get config file start");
            return localFolder.getFileAsync(_fileName)
            .then(
                function (file) {
                    return Windows.Storage.FileIO.readTextAsync(file)
                    .then(
                        function (fileContents) {
                            
                            if (_isFileRead) {
                                return _fileContents;
                            }

                            if (fileContents) {
                                try {
                                    var result = JSON.parse(fileContents);
                                    if (result) {
                                        
                                        if (!_fileContents.ts && result.ts && typeof (result.ts) === 'number') {
                                            _fileContents.ts = result.ts;
                                        }
                                        if (!_fileContents.config && result.config) {
                                            _fileContents.config = result.config;
                                        }
                                        if (!_fileContents.countryCode && result.countryCode && typeof (result.countryCode) === 'string') {
                                            _fileContents.countryCode = result.countryCode;
                                        }
                                    }
                                }
                                catch (e) {
                                    Skype.Ads.Utils.logADT("exeception when trying parsing JSON file: " + _fileName + " error=" + e);
                                }
                            }
                            return _fileContents;
                        }
                    );
                })
                .then(
                    function (fileContents) {
                        Skype.Ads.Utils.logADT("ad config file successfully read");
                        _isFileRead = true;
                        _errorReadingFile = false;
                        return fileContents;
                    },
                    function (error) {
                        
                        Skype.Ads.Utils.logADT("file does not exist or can't be read: " + _fileName + " error=" + error);
                        _isFileRead = true;
                        _errorReadingFile = true;
                        return _fileContents;
                    }
                );
        };

        return waitIfIOInProgressAsync(getFile);
    }

    function saveFileAsync() {
        if (!_fileContents || !_isFileRead) {
            return WinJS.Promise.wrap(null);
        }

        var json;
        try {
            json = JSON.stringify(_fileContents);
        }
        catch (e) {
            Skype.Ads.Utils.logADT("failed to stringify file contents: " + _fileContents);
            return WinJS.Promise.wrap(null);
        }
        if (!json) {
            return WinJS.Promise.wrap(null);
        }
        var localFolder = Windows.Storage.ApplicationData.current.localFolder;
        if (!localFolder) {
            return WinJS.Promise.wrap(null);
        }

        var create = function () {
            Skype.Ads.Utils.logADT("create config file start");
            return localFolder.createFileAsync(_fileName, Windows.Storage.CreationCollisionOption.replaceExisting).then(
            function (file) {
                return Windows.Storage.FileIO.writeTextAsync(file, json);
            }).then(
                function () {
                    _errorReadingFile = false; 
                    Skype.Ads.Utils.logADT("done saving ad config file");
                },
                function (error) {
                    
                    Skype.Ads.Utils.logADT("error when trying to create to local file: " + _fileName + ", error=" + error);
                    return null;
                }
            );
        };

        return waitIfIOInProgressAsync(create);
    }

    function getValueAsync(fieldName) {
        
        return readFileAsync().then(
            
            function () {
                return _fileContents[fieldName];
            });
    }

    function setValueAsync(newValue, fieldName) {
        
        return readFileAsync().then(
            
            function () {
                if (Skype.Ads.Utils.deepObjectCompare(newValue, _fileContents[fieldName])) {
                    return WinJS.Promise.wrap(true); 
                }
                _fileContents[fieldName] = newValue;
                return saveFileAsync();
            });
    }

    WinJS.Namespace.define("Skype.Ads", {
        
        getPersistedAdConfigAsync: function () {
            return getValueAsync("config");
        },
        setPersistedAdConfigAsync: function (newConfig) {
            return setValueAsync(newConfig, "config");
        },

        
        getPersistedCountryCodeAsync: function () {
            return getValueAsync("countryCode");
        },
        setPersistedCountryCodeAsync: function (newCountryCode) {
            return setValueAsync(newCountryCode, "countryCode");
        },

        isFirstTimeUsage: {
            get: function () {
                return _isFirstTimeUsage;
            },

        },
        updateFirstTimeUserStatusAsync: updateFirstTimeUserStatusAsync,

    });
}());
(function () {
    "use strict";
    
    var _defaultApplicationId = "f72aaadc-da38-4589-b9bb-33fd7c511da2";

    
    var MsAdModel = WinJS.Class.derive(Skype.Ads.BaseAdModel, function (params, getAdUnitId, adRefreshPeriodSec, staggeredRefreshDelaySec) {
        this._applicationId = params.applicationId ? params.applicationId : _defaultApplicationId;
        this._width = params.width || 250.0;
        this._height = params.height || 250.0;
        this._adType = params.adType || 0;
        this._adRefreshPeriodSec = adRefreshPeriodSec || 60.0;
        this._staggeredRefreshDelaySec = staggeredRefreshDelaySec || 60.0;
        this._resumeRefreshDelaySec = params.resumeRefreshDelaySec || 5;

        if (params.adUnitId) {
            this._adUnitId = params.adUnitId;
        } else {
            if (getAdUnitId && typeof (getAdUnitId) === "function") {
                this._adUnitId = getAdUnitId(this._width, this._height, this._adType);
            } else {
                this._adUnitId = null;
            }
        }

        this._id = "ad-" + this._adUnitId + "-" + Skype.Ads.Utils.getUniqueId();
    },{
        
        adUnitId: { get: function () { return this._adUnitId; } },
        applicationId: { get: function () { return this._applicationId; } },
        id: { get: function () { return this._id; } },
        width: { get: function () { return this._width; } },
        height: { get: function () { return this._height; } },
        adType: { get: function () { return this._adType; } },
        adRefreshPeriodSec: { get: function () { return this._adRefreshPeriodSec; } },
        staggeredRefreshDelaySec: { get: function () { return this._staggeredRefreshDelaySec; } },
        resumeRefreshDelaySec: { get: function () { return this._resumeRefreshDelaySec; } },
        isValid: function () {
            if (this.adUnitId) {
                return true;
            } else {
                Skype.Ads.Utils.logADT("invalid AdUnitId in MS Ad Model: " + this.adUnitId);
                return false;
            }
        }
    },{
        
    });


    WinJS.Namespace.define("Skype.Ads", {
        MsAdModel: MsAdModel,
        defaultApplicationId: {
            get: function () {
                return _defaultApplicationId;
            }
        }
    });

}());


(function () {
    "use strict";

    
    var AdContainerView = WinJS.Class.derive(Skype.Ads.BaseAdView, function (params) {
        Skype.Ads.BaseAdView.prototype.constructor.call(this, params);
        this._updateWidth();
        this.el = params.el;
        this._showPremium = params.showPremium || false;
        this._adController = params.adController;
        this.addEventListener("suspend", this._suspend.bind(this, true));
        this.addEventListener("resume", function (e) {
            this._resume(e && e.detail !== undefined ? e.detail : true);
        }.bind(this));
        this.addEventListener("shutdown", this._shutdown.bind(this));
        this.addEventListener("remove", this._remove.bind(this));

        this._isSuspended = false;
        this._isShutdown = false;
        this._numLoadsAndErrors = 0; 
        this._maxNumViews = 2;
        this.isVisible = false;

    }, {
        
        _attachFooterListeners: function () {
            var premiumBtns = this.premiumBtn = this.el.querySelectorAll('.premium-footer-btn');
            if (premiumBtns && premiumBtns.length) {
                for (var i = 0; i < premiumBtns.length; i++) {
                    premiumBtns[i].addEventListener('click', function () {
                        
                        if (!this.upgradeContainer) {
                            var adType;
                            if (this.model && this.model.ads && Array.isArray(this.model.ads) && this.model.ads.length > 0) {
                                adType = this.model.ads[0].adType;
                            }
                            this._trackCTA(Skype.Ads.CTATypes.MORE_SKYPE, adType);
                            this._showUpgradeView();
                        } else if (!this.premiumBtn.disabled) {
                            this._hideUpgradeView();
                            this._resume(false);
                        }
                    }.bind(this));
                }
            }
        },

        _showUpgradeView: function (hideClose) {
            return WinJS.UI.Fragments.render("///SkypeAdSDK/html/premium.html").then(function (fragment) {
               
                var upgradeContainer = fragment.querySelector('.no-ads');
                this._suspend(false);

                
                upgradeContainer.style.msGridRowSpan = this._maxNumViews;

                
                WinJS.Resources.processAll(upgradeContainer);

                this.upgradeContainer = upgradeContainer;

                var noAdsLk = upgradeContainer.querySelector('.no-ads-lk');

                
                upgradeContainer.addEventListener("transitionend", function () {
                    this.premiumBtn.disabled = false;
                }.bind(this));
                noAdsLk.addEventListener("click", function () {
                    this._trackCTA(Skype.Ads.CTATypes.DISCOVER_PREMIUM);
                    this._login();
                }.bind(this));

                if (hideClose) {
                    WinJS.Utilities.addClass(this.adContainerContentEl, 'creative-container');
                    WinJS.Utilities.removeClass(this.adContainerContentEl, 'ads-rendered');
                    WinJS.Utilities.removeClass(this.adContainerContentEl, 'panorama-ad');
                    WinJS.Utilities.removeClass(this.adContainerContentEl, 'panorama-ad-grid');
                } else {
                    if (WinJS.Utilities.hasClass(this.adContainerContentEl, 'panorama-ad-error')) {
                        WinJS.Utilities.removeClass(this.adContainerContentEl, 'panorama-ad-error');
                        WinJS.Utilities.addClass(this.adContainerContentEl, 'panorama-with-error');
                    }
                    this._attachUpgradeViewListeners();
                }

                this.adContainerContentEl.appendChild(upgradeContainer);
                this.premiumBtn.disabled = true;

                
                var containerHeight = WinJS.Utilities.getContentHeight(upgradeContainer);

                this._reduceUpgradeViewFontSize = function () {
                    var noAdsTitle = this._clearElementFontSize(upgradeContainer.querySelector('.no-ads-title'));
                    
                    WinJS.Utilities.removeClass(upgradeContainer, 'reduce-padd');

                    if (noAdsLk.offsetHeight > containerHeight) {
                        WinJS.Utilities.addClass(upgradeContainer, 'reduce-padd');
                        if (noAdsLk.offsetHeight > containerHeight) {
                            this._reduceElementFontSize(noAdsTitle, noAdsLk, containerHeight, 16);
                            
                            
                            
                        }
                    }
                }.bind(this);

                this._reduceUpgradeViewFontSize();

                
                window.setTimeout(function () {
                    if (this.upgradeContainer) {
                        WinJS.Utilities.addClass(this.upgradeContainer, hideClose ? 'noanim' : 'active');
                    }
                }.bind(this), 0);

                Skype.Ads.Utils.logADT('showUpgradeView');


            }.bind(this));
        },
        _clearElementFontSize: function (element) {
            element.style.fontSize = '';
            element.style.lineHeight = '';
            return element;
        },
        _reduceElementFontSize: function (element, content, containerHeight, minTitleFontSize) {
            window.setTimeout(function () {
                var defaultFontSize = parseFloat(element.currentStyle.fontSize),
                    defaultLineHeight = parseFloat(element.currentStyle.lineHeight),
                    newFontSize = defaultFontSize - 0.5;
                element.style.fontSize = newFontSize + 'px';
                element.style.lineHeight = Math.max((newFontSize / defaultFontSize) * defaultLineHeight, 1.3);
              
                if ((content.offsetHeight > containerHeight) && newFontSize > minTitleFontSize) {
                    this._reduceElementFontSize(element, content, containerHeight, minTitleFontSize);
                }
            }.bind(this), 0);
        },
        _attachUpgradeViewListeners: function () {
            var closeCross = this.upgradeContainer.querySelector('.no-ads-close-wrap');

            
            closeCross.addEventListener('click', function () {
                this._hideUpgradeView();
                this._resume(false);
            }.bind(this));

        },
        _hideUpgradeView: function (removeImmediately) {
            if (this.upgradeContainer) {

                if (!this.adContainerContentEl) {
                    this.upgradeContainer = null;
                    return;
                }

                var hasAdError = WinJS.Utilities.hasClass(this.adContainerContentEl, 'panorama-with-error');

                var removeUpgradeContainer = function () {
                    if (this.upgradeContainer) {
                        
                        try {
                            this.adContainerContentEl.removeChild(this.upgradeContainer);
                        } catch (e) {
                            Skype.Ads.Utils.logADT("no child to remove, caught error = " + e);
                        }
                        this.upgradeContainer = null;
                    }
                    if (hasAdError && this.adContainerContentEl) {
                        WinJS.Utilities.removeClass(this.adContainerContentEl, 'panorama-with-error');
                    }
                    this.premiumBtn.disabled = false;
                }.bind(this);

                if (!removeImmediately && WinJS.Utilities.hasClass(this.upgradeContainer, 'active')) {
                    
                    this.upgradeContainer.addEventListener("transitionend", removeUpgradeContainer);

                    
                    if (hasAdError && this.adContainerContentEl) {
                        WinJS.Utilities.addClass(this.adContainerContentEl, 'panorama-ad-error');
                    }
                    this.premiumBtn.disabled = true;
                    WinJS.Utilities.removeClass(this.upgradeContainer, 'active');
                } else {
                    WinJS.Utilities.removeClass(this.upgradeContainer, 'noanim');
                    removeUpgradeContainer();
                }
            }
        },
        
        renderContainerAsync: function (isPanorama) {
            this._isPanorama = isPanorama;
            if (this._isShutdown) {
                return WinJS.Promise.wrap(null);
            }

            return WinJS.UI.Fragments.render("///SkypeAdSDK/html/layout.html").then(
                function (layoutFragment) {
                    if (this._isShutdown) {
                        return null;
                    }

                    this._remove();
                    this.el.style.position = 'relative';

                    var adContainerContent = WinJS.Utilities.query('.ad-container-content', layoutFragment);

                    
                    if (!isPanorama) {
                        
                        adContainerContent.setStyle('background-color', 'transparent');
                    } else {
                        adContainerContent.addClass('panorama-ad');
                    }

                    adContainerContent.include(WinJS.Utilities.query('.ad-container-header', layoutFragment));
                    this.adContainerContentEl = adContainerContent.setStyle('width', this.width + 'px')[0];

                    
                    WinJS.Resources.processAll(layoutFragment);

                    
                    this.el.appendChild(layoutFragment);

                    Skype.Ads.BaseAdView.prototype.render.call(this);

                    this.isVisible = true;

                    return true;
                }.bind(this))
                .then(function (result) {
                    if (!result || this._isShutdown || !this.adContainerContentEl) {
                        return null; 
                    }

                    if (isPanorama) {
                        return WinJS.UI.Fragments.render("///SkypeAdSDK/html/loading.html").then(
                            function (fragment) {
                                this._loadingDiv = fragment.querySelector('#loading-container');
                                this._loadingDiv.style.zIndex = "1"; 
                                this._loadingDiv.style.opacity = 1;
                                this._loadingDiv.style.msGridRowSpan = this._maxNumViews;
                                this.adContainerContentEl.parentNode.appendChild(this._loadingDiv);
                                
                                return true; 
                            }.bind(this));
                    }

                    return true; 
                }.bind(this));
        },
        renderFailedView: function () {
            
            if (this._adController) {
                this._adController.sendLoadTrackingEvent(Skype.Ads.AdTypes.BackupCreative);
            }

            WinJS.Utilities.removeClass(this.adContainerContentEl, 'panorama-ad-grid panorama-ad-error');
            this._clearFooter();

            WinJS.UI.Fragments.render("///SkypeAdSDK/html/callphones.html").then(
              function (fragment) {
                  var callPhonesDiv = fragment.querySelector('#call-phones');

                  callPhonesDiv.addEventListener("click", function () {
                      Skype.UI.navigate("dialer");
                      this._trackCTA(Skype.Ads.CTATypes.CALL_PHONES, Skype.Ads.AdTypes.BackupCreative);
                  }.bind(this));

                  
                  WinJS.Resources.processAll(callPhonesDiv);

                  WinJS.Utilities.addClass(this.adContainerContentEl, 'creative-container');
                  this.adContainerContentEl.appendChild(callPhonesDiv);
                  this._fadeOutLoadingDiv();
              }.bind(this));
        },
        _login: function () {
            if (this._adController && this._adController.skypeAPI) {
                this._adController.skypeAPI.requestToken(function (token) {
                    
                    var url = "https://secure.skype.com/account/login";
                    if (token) {
                        url += "?nonce=" + token;
                    }
                    Skype.Ads.Utils.logADT("opening " + url);
                    try {
                        Windows.System.Launcher.launchUriAsync(Windows.Foundation.Uri(url));
                    } catch (e) {
                        Skype.Ads.Utils.logADT("exception thrown by launchUriAsync: " + e);
                    }
                });
            }
        },
        _trackCTA: function (ctaType, adType) {
            if (this._adController) {
                this._adController.sendCtaTrackingEvent(ctaType, adType);
            }
        },
        _fadeOutLoadingDiv: function () {
            if (this._loadingDiv && this._loadingDiv.style.opacity > 0) {
                this._loadingDiv.style.opacity = 0;
                this._removeLoadingDivHandler = this._removeLoadingDiv.bind(this);
                this._loadingDiv.addEventListener("transitionend", this._removeLoadingDivHandler);
            }
        },
        _removeLoadingDiv: function () {
            if (!this._loadingDiv) {
                return;
            }

            if (this._removeLoadingDivHandler) {
                this._loadingDiv.removeEventListener("transitionend", this._removeLoadingDivHandler);
            }

            if (!this.adContainerContentEl) {
                this._loadingDiv = null;
                return;
            }

            var container = this.adContainerContentEl.parentNode;
            if (container) {
                
                try {
                    container.removeChild(this._loadingDiv);
                } catch (e) {
                }
            }

            this._loadingDiv = null;
        },
        
        renderAds: function (containerModel) {
            if (this._isShutdown) {
                return false;
            }
            
            
            var numAdModels;

            if (!this.adContainerContentEl) {
                Skype.Ads.Utils.logADT("unexpected error: ad container model is not defined, removing ad container");
                this._remove();
                return false;
            }

            
            
            if (containerModel && this.adContainerContentEl.children.length !== 0) {
                Skype.Ads.Utils.logADT("containerModel can not be used because ads are still displayed, removing ad container");
                this._remove();
                return false;
            }

            
            if (containerModel) {
                this.model = containerModel;
            }

            if (!this.model) {
                Skype.Ads.Utils.logADT("unexpected error: ad container model is not defined, removing ad container");
                this._remove();
                return false;
            }

            this._isSuspended = false;

            
            this._updateWidth();
            this.adContainerContentEl.style.width = this.width + 'px';

            

            numAdModels = this.model.ads.length;
            
            this._numLoadsAndErrors = 0;

            for (var j = 0; j < numAdModels; j++) {
                this._createAd(this.model.ads[j], j + 1);
            }

            
            
            if (numAdModels > 1 || this._haveOnlySingle300by250Ad()) {
                WinJS.Utilities.addClass(this.adContainerContentEl, 'panorama-ad-grid');
            }

            WinJS.Resources.processAll(this.adContainerContentEl);
            WinJS.Utilities.addClass(this.adContainerContentEl, 'ads-rendered');

            return true;
        },
        _updateWidth: function () {
            
            if (this.model && this.model.ads) {
                var maxWidth = 0;
                for (var i = 0, numAds = this.model.ads.length; i < numAds; i++) {
                    maxWidth = Math.max(this.model.ads[i].width, maxWidth);
                }
                this.width = maxWidth;
            }
        },
        _createAd: function (adModel, row) {
            var newAdView = new Skype.Ads.MsAdView({ model: adModel, adController: this._adController });

            
            var adWrapperDiv = document.createElement("div");

            
            var adDiv = document.createElement("div");

            
            
            
            
            

            if (this._isPanorama) {
                var footerDiv = document.createElement("div");
                footerDiv.id = adModel.adUnitId;
                footerDiv.classList.add("ads-footer");
                if (adModel.adType === Skype.Ads.AdTypes.ThirdPartyAd) {
                    footerDiv.classList.add("rdParty"); 
                }
                var button1 = document.createElement("button");
                button1.classList.add("premium-footer-btn");
                
                button1.tabIndex = -1;
                button1.setAttribute("data-win-res", "{ textContent: 'premiumLinkText' }");
                var button2 = document.createElement("button");
                button2.classList.add("skype-footer-btn");
                
                button2.tabIndex = -1;
                button2.innerText = "Skype";
                footerDiv.appendChild(button1);
                footerDiv.appendChild(button2);
            }

            
            var errorHandler = function (e) {
                
                this._onAdErrorOcurredHandler(newAdView, e && e.detail);
            }.bind(this);
            newAdView.onErrorOccurredHandler = errorHandler;
            newAdView.addEventListener("onErrorOccurred", errorHandler);

            var loadedHandler = function (e) {
                this._onAdLoadOcurredHandler(newAdView);
            }.bind(this);
            newAdView.onAdLoadOcurredHandler = loadedHandler;
            newAdView.addEventListener("initialAdLoad", loadedHandler);

            var refreshedHandler = this._onAdRefreshOcurredHandler.bind(this);
            newAdView.onAdRefreshedHandler = refreshedHandler;
            newAdView.addEventListener("onAdRefreshed", refreshedHandler);

            var engagedHandler = this._onEngagedHandler.bind(this);
            newAdView.onEngagedHandler = engagedHandler;
            newAdView.addEventListener("onEngagedChanged", engagedHandler);

            adWrapperDiv.classList.add("ad-view");
            adWrapperDiv.classList.add("ad-view-active");

            adDiv.style.width = newAdView.width + "px";
            adDiv.style.height = newAdView.height + "px";

            adWrapperDiv.appendChild(adDiv);
            if (this._isPanorama) {
                adWrapperDiv.appendChild(footerDiv);
            }
            
            
            if (newAdView.height > 250) {
                adWrapperDiv.style.msGridRowSpan = this._maxNumViews;
            }

            
            if (this.adContainerContentEl) {

                
                adWrapperDiv.style.msGridRow = row;

                
                
                
                if (this.adContainerContentEl.children.length > 0) {
                    var adWrapper = this.adContainerContentEl.children[0];
                    if (adWrapper && adWrapper.children.length > 0) {
                        var adView = adWrapper.children[0].adView; 
                        if (adView && adView.model) {
                            var adWrapperRow = adWrapper.style.msGridRow;
                            if (adView.model.adType === newAdView.model.adType) {
                                adWrapperDiv.style.msGridRow = adWrapperRow;
                            } else {
                                
                                if (adWrapperRow == 1) {
                                    adWrapperDiv.style.msGridRow = 2;
                                } else {
                                    adWrapperDiv.style.msGridRow = 1;
                                }
                            }
                        }
                    }
                } 

                
                var first = this.adContainerContentEl.firstChild;
                if (first) {
                    this.adContainerContentEl.insertBefore(adWrapperDiv, first);
                } else {
                    this.adContainerContentEl.appendChild(adWrapperDiv);
                }

                
                
                newAdView.render(adDiv, this._isSuspended);
            }
        },
        _showFooter: function () {
            if (!this.adContainerContentEl) {
                return;
            }

            this._clearFooter();

            var thirdPartyFooters = WinJS.Utilities.query('.ads-footer.rdParty', this.adContainerContentEl);

            if (thirdPartyFooters.length > 0) {
                for (var i = 0; i < thirdPartyFooters.length; i++) {
                        WinJS.Utilities.addClass(thirdPartyFooters[i], 'rdparty-ad-footer');
                }
            } else {
                WinJS.Utilities.query('.ads-footer', this.adContainerContentEl).addClass('house-ad-footer');
            }

            if (this._showPremium) {
                this._attachFooterListeners.call(this);
            }
        },
        _clearFooter: function () {
            if (!this.adContainerContentEl) {
                return;
            }
            WinJS.Utilities.query('.ads-footer', this.adContainerContentEl).removeClass('rdparty-ad-footer house-ad-footer');
        },
        
        _onAdLoadOcurredHandler: function (loaded_adView) {
            if (this._isShutdown || !loaded_adView || !this.adContainerContentEl || !this.model || !this.model.ads) {
                return;
            }

            this._numLoadsAndErrors++;
            
            
            if (this._numLoadsAndErrors == this.model.ads.length) {
                this._fadeOutLoadingDiv();
                this.dispatchEvent("onAdRenderingComplete"); 
            }

            
            var loaded_adDiv = loaded_adView.el;
            if (!loaded_adDiv) {
                return;
            }
            var loaded_adWrapper = loaded_adDiv.parentNode;
            if (!loaded_adWrapper) {
                return;
            }
            var loaded_row = loaded_adWrapper.style.msGridRow;

            if (loaded_row < 1) {
                return;
            }

            function startTransition(adView, adWrapper) {
                WinJS.Utilities.removeClass(adWrapper, 'ad-view-active');
                
                setTimeout(removeEl.bind(this, adView, adWrapper), 1100);
            }

            function removeEl(adView, adWrapper) {
                this._shutdownAdView(adView);
                if (this.adContainerContentEl) {
                    
                    try {
                        this.adContainerContentEl.removeChild(adWrapper);
                    } catch (e) {
                        Skype.Ads.Utils.logADT("no child to remove, caught error = " + e);
                    }
                }
            }

            
            for (var i = 0, len = this.adContainerContentEl.children.length; i < len; i++) {
                var adWrapper = this.adContainerContentEl.children[i];
                if (adWrapper && adWrapper.children.length > 0 && adWrapper.style.msGridRow === loaded_row) {
                    var adDiv = adWrapper.children[0]; 
                    var adView = adWrapper.children[0].adView; 
                    if (adView && loaded_adDiv !== adDiv) {
                        
                        
                        setTimeout(startTransition.bind(this, adView, adWrapper), 100);
                    }
                }
            }
            
            WinJS.Utilities[this._haveOnlySingle300by250Ad() ? "addClass" : "removeClass"](this.adContainerContentEl, 'panorama-ad-error');

            this._showFooter();
        },



        
        _haveOnlySingle300by250Ad: function () {
            var heights = Array(this._maxNumViews);
            for (var k = 0; k < heights.length; k++) {
                heights[k] = 0;
            }

            if (this.adContainerContentEl) {
                for (var j = 0, len = this.adContainerContentEl.children.length; j < len; j++) {
                    var adWrapper = this.adContainerContentEl.children[j];
                    if (adWrapper && adWrapper.children.length > 0) {
                        var adView = adWrapper.children[0].adView; 
                        var row = parseInt(adWrapper.style.msGridRow);
                        if (adView && adView.model && row > 0) {
                            heights[row - 1] = adView.model.height;
                        }
                    }
                }
            }

            var total = 0;
            for (var i = 0; i < heights.length; i++) {
                total += heights[i];
            }

            return total < 500;
        },

        
        
        _onAdErrorOcurredHandler: function (newAdView, errorMsg) {
            var adWrapper, adDiv;

            if (this._isShutdown || !this.adContainerContentEl || !newAdView) {
                return;
            }

            this._numLoadsAndErrors++;

            if (this._adController && errorMsg) {
                this._adController.sendErrorTrackingEvent(errorMsg.msg, errorMsg.errorCode, errorMsg.adUnitId, newAdView && newAdView.model ? newAdView.model.adType : null);
            }

            if (!newAdView.hasAdRendered) {
                
                
                for (var i = 0, len = this.adContainerContentEl.children.length; i < len; i++) {
                    adWrapper = this.adContainerContentEl.children[i];
                    if (adWrapper && adWrapper.children.length > 0) {
                        adDiv = adWrapper.children[0]; 
                        if (adDiv.id === newAdView.el.id) {
                            this._shutdownAdView(newAdView);
                            this.adContainerContentEl.removeChild(adWrapper);
                            break;
                        }
                    }
                }
            }

            if (this.adContainerContentEl.children.length === 0) {
                Skype.Ads.Utils.logADT("all ads have failed");
                this.dispatchEvent("onAllAdsFailed", errorMsg);
                return;
            }

            
            if (this._numLoadsAndErrors == this.model.ads.length) {
                
                this.dispatchEvent("onAdRenderingComplete");
            }

            
            if (this._haveOnlySingle300by250Ad()) {
                for (var j = 0, elLen = this.adContainerContentEl.children.length; j < elLen; j++) {
                    adWrapper = this.adContainerContentEl.children[j];
                    if (adWrapper) {
                        adWrapper.style.msGridRow = 1;
                    }
                }
            }
        },

        _onAdRefreshOcurredHandler: function () {
            this.dispatchEvent("onAdRefreshed");
        },

        _onEngagedHandler: function (evt) {
            
            this.dispatchEvent("onEngagedChanged", evt && evt.detail);
        },

        _suspend: function (swap) {
            if (this._isShutdown) {
                return;
            }

            this._removeLoadingDiv();
            this._isSuspended = true;
            this._hideUpgradeView(true);

            
            
            
            var checkSwap = swap && (!this._haveOnlySingle300by250Ad());

            this._foreachAdView(function (adView, adWrapper) {
                adView.suspend();

                if (checkSwap) {
                    
                    var rowAdTypeShouldBeAt = null;
                    if (this.model && this.model.ads && adView.model) {
                        for (var i = 0; i < this.model.ads.length; i++) {
                            if (this.model.ads[i].adType === adView.model.adType) {
                                rowAdTypeShouldBeAt = i + 1;
                                break;
                            }
                        }
                        if (rowAdTypeShouldBeAt !== null && adWrapper.style.msGridRow != rowAdTypeShouldBeAt) {
                            adWrapper.style.msGridRow = rowAdTypeShouldBeAt;
                        }
                    }
                }
            }.bind(this));
        },
        _resume: function (doInitialRefresh) {
            if (this._isShutdown) {
                return;
            }

            this._isSuspended = false;
            this._foreachAdView(function (adView) {
                adView.resume(doInitialRefresh);
            });
        },
        _shutdown: function () {
            this._suspend(false);
            this._remove();
            this._isShutdown = true;
        },

        _remove: function () {
            Skype.Ads.Utils.logADT("clearing ad container");
            this.isVisible = false;
            this._shutdownAdViews();
            this.el.containerName = "";
            this.el.innerHTML = "";
        },

        _shutdownAdViews: function () {
            this._foreachAdView(function (adView) {
                this._shutdownAdView(adView);
            }.bind(this));
        },

        _foreachAdView: function (func) {
            var adWrapper, adView;
            if (this.adContainerContentEl) {
                for (var i = 0, len = this.adContainerContentEl.children.length; i < len; i++) {
                    adWrapper = this.adContainerContentEl.children[i];
                    if (adWrapper && adWrapper.children.length > 0) {
                        adView = adWrapper.children[0].adView; 
                        if (adView) {
                           func(adView, adWrapper);
                        }
                    }
                }
            }
        },

        _shutdownAdView: function (adView) {
            if (!adView) {
                return;
            }
            if (adView.onErrorOccurredHandler) {
                adView.removeEventListener("onErrorOccurred", adView.onErrorOccurredHandler);
            }
            if (adView.onAdLoadOcurredHandler) {
                adView.removeEventListener("initialAdLoad", adView.onAdLoadOcurredHandler);
            }
            if (adView.onAdRefreshedHandler) {
                adView.removeEventListener("onAdRefreshed", adView.onAdRefreshedHandler);
            }
            if (adView.onEngagedHandler) {
                adView.removeEventListener("onEngagedChanged", adView.onEngagedHandler);
            }
            
            adView.shutdown();
        },

    }, {
        
    });

    WinJS.Namespace.define("Skype.Ads", {
        AdContainerView: AdContainerView
    });

}());
(function () {
    "use strict";

    if (!MicrosoftNSJS.Advertising) {
        throw new Exception("MS Ads SDK library missing in global namespace!");
    }

    
    var MsAdView = WinJS.Class.derive(Skype.Ads.BaseAdView, function (params) {
        Skype.Ads.BaseAdView.prototype.constructor.call(this, params);
        this._adController = params ? params.adController : null;
        this.adControl = null;
        this._periodicRefreshTimer = null;
        this._adReponseTimer = null;
        this._hasErrored = false;
        this._isSuspended = false;
        this._isShutdown = false;
        this._hasAdRendered = false;
        this._refreshStart = null;
        this._engageStart = null;
        
        this._isSponsoredContent = false;
        this._creativeUrl = null;
        this._onReceiveMessageHandler = this._onReceiveMessage.bind(this);
        window.addEventListener('message', this._onReceiveMessageHandler);
    }, {
        
        hasAdRendered: {
            get: function () {
                return this._hasAdRendered;
        }},
        render: function (adDiv, isSuspended) {
            if (this._isShutdown) {
                return;
            }
            Skype.Ads.Utils.logADT("MS Ad render start for " + this.model.id);
            this._isSuspended = isSuspended;
            this.el = adDiv;
            this.el.adView = this;
            this.bindAdControl(adDiv);
            if (!this._isSuspended) {
                this.resume(false);
            }
            
            this._startAdResponseTimer();
            Skype.Ads.BaseAdView.prototype.render.call(this);
        },
        suspend: function () {
            this._isSuspended = true;
            Skype.Ads.Utils.logADT("MS Ad view suspended for " + this.model.id);
            this._stopTimers();
            if (this.adControl) {
                this.adControl.suspend();
            }
        },
        resume: function (doInitialRefresh) {
            if (this._isShutdown) {
                return;
            }
            this._isSuspended = false;
            Skype.Ads.Utils.logADT("MS Ad view resumed for " + this.model.id);
            this._stopTimers();
            if (this.adControl) {
                this.adControl.resume();
            }
            var initRefreshStep;
            if (doInitialRefresh) {
                initRefreshStep = 0;
            } else {
                initRefreshStep = 1;
            }
            this._refresh(this, initRefreshStep, this.model.resumeRefreshDelaySec * 1000);
        },
        shutdown: function () {
            this.suspend();
            if (this.adControl) {
                this.adControl.dispose();
                this.adControl.onAdRendered = null;
                this.adControl.onErrorOccurred = null;
                this.adControl.onEngagedChanged = null;
            }
            if (this._onReceiveMessageHandler) {
                window.removeEventListener('message', this._onReceiveMessageHandler);
            }
            this._isShutdown = true;
            Skype.Ads.Utils.logADT("MS Ad view is shutdown for " + this.model.id);
        },
        _refresh: function (self, refreshStep, stepZeroRefreshMs) {
            if (this._hasErrored || this._isSuspended) {
                Skype.Ads.Utils.logADT("ad refresh attempted but ad is state: errored = " + this._hasErrored + " or suspended=" + this._isSuspended);
                return;
            }

            var delay;
            switch (refreshStep) {
                case 0:
                    delay = stepZeroRefreshMs;
                    break;
                case 1:
                    delay = this.model.staggeredRefreshDelaySec * 1000;
                    break;
                default:
                    delay = this.model.adRefreshPeriodSec * 1000;
                    break;
            }

            refreshStep++;

            if (self._periodicRefreshTimer) {
                clearTimeout(self._periodicRefreshTimer);
            }
            self._periodicRefreshTimer = setTimeout(function () {
                var timerID = self._periodicRefreshTimer;
                if (self._hasErrored || self._isSuspended) {
                    Skype.Ads.Utils.logADT("ad refresh timer fired but ad is state: errored = " + self._hasErrored + " or suspended=" + self._isSuspended);
                    return;
                }

                
                
                
                

                if (self._hasAdRendered && self._adController && !self._adController.allowAds()) {
                    Skype.Ads.Utils.logADT("skipping ad refresh because bw/cpu check indicates low resources");
                } else {
                    if (document.hidden || (self.el && (self.el.offsetWidth === 0 || self.el.offsetHeight === 0)) || (self.adControl && self.adControl.isEngaged)) {
                        Skype.Ads.Utils.logADT("document/control is hidden or ad control is currently engaged so we are skipping ad refresh this time and will try again next time");
                        self._refresh(self, refreshStep, stepZeroRefreshMs);
                        return;
                    }

                    var now = new Date();
                    self._refreshStart = now.getTime();
                    Skype.Ads.Utils.logADT("Ad onAdRefresh started for " + self.model.id + " called at " + now.toString());
                    self.dispatchEvent("onAdRefreshStart");

                    
                    self._startAdResponseTimer();

                    self.adControl.refresh();
                }
                
                if (self._periodicRefreshTimer === timerID) {
                    self._refresh(self, refreshStep, stepZeroRefreshMs);
                }
            }, delay);

        },
        _stopTimers: function () {
            if (this._periodicRefreshTimer) {
                clearTimeout(this._periodicRefreshTimer);
                this._periodicRefreshTimer = null;
            }
            this._stopAdResponseTimer();
        },
        _startAdResponseTimer: function () {
            this._stopAdResponseTimer();
            this._adResponseTimer = setTimeout(function () {
                this.onErrorOccurred("timeout", { errorMessage: "ms ad control did not respond within 10 seconds", errorCode: "timeout" });
            }.bind(this), 10000);
        },
        _stopAdResponseTimer: function () {
            if (this._adResponseTimer) {
                clearTimeout(this._adResponseTimer);
                this._adResponseTimer = null;
            }
        },
        onAdRendered: function (e) {
            this._stopAdResponseTimer();
            if (this._isShutdown) {
                Skype.Ads.Utils.logADT("ad control is shutdown and received refreshed message, ignoring message");
                return;
            }

            if (this.adControl && this.adControl.isEngaged) {
                return; 
            }

            
            if (this.adControl && this.adControl._adIFrame) {
                this.adControl._adIFrame.tabIndex = "-1";
                this.adControl._adIFrame.setAttribute("aria-hidden", "true");
            }

            
            
            
            this._isSponsoredContent = (this.model.adType === Skype.Ads.AdTypes.SponsoredContent);
            if (!this._isSponsoredContent &&
                this.adControl && this.adControl._ad && this.adControl._ad.prmParameters) {
                var prmStr = this.adControl._ad.prmParameters;
                try {
                    var prm = JSON.parse(prmStr);
                    if (prm && prm.sc && prm.sc.t === 'url' && prm.sc.u) {
                        this._isSponsoredContent = true;
                    }
                } catch (e) {
                    Skype.Ads.Utils.logADT("error parsing _ads.prmParameters(" + prmStr + ") from MS Ad SDK:" + e);
                }
            }
            this._hasAdRendered = true;
            Skype.Ads.Utils.logADT("Ad onAdRendered for " + this.model.id + " called at " + new Date().toString());
            if (!this.initialAdLoad) {
                this.initialAdLoad = true;
                this.dispatchEvent("initialAdLoad");
            }
            this.dispatchEvent("onAdRefreshed");

            
            
            if (!this._isSponsoredContent) {
                this._sendLoadTrackingEvent();
            }
        },
        _sendLoadTrackingEvent: function() {
            var now = new Date();
            var loadTime = null;
            Skype.Ads.Utils.logADT("Ad onAdRendered for " + this.model.id + " called at " + now.toString());
            if (this._refreshStart) {
                loadTime = now.getTime() - this._refreshStart;
                Skype.Ads.Utils.logADT("Ad refresh time (ms) = " + loadTime);
            }
            
            if (this._adController && this.model && loadTime && loadTime > 0) {
                this._adController.sendLoadTrackingEvent(this._getAdType(), this.model.adUnitId, loadTime, this._creativeUrl);
            }
        },
        _getAdType: function () {
            var adType;
            if (this._isSponsoredContent) {
                adType = Skype.Ads.AdTypes.SponsoredContent;
            } else {
               adType = this.model && this.model.adType;
            }
            return adType;
        },
        onErrorOccurred: function (e, msg) {

            if (msg) {
                var errorMsg = msg.errorMessage;
                var errorCode = msg.errorCode;
            }

            
            if (errorMsg === "refresh triggered but request is already in progress") {
                return;
            }

            this._stopTimers();

            if (this._isShutdown) {
                Skype.Ads.Utils.logADT("ad control is shutdown and received error message: " + errorMsg);
                return;
            }

            if (errorMsg.indexOf("refresh() may not be called more than once every") !== -1) {
                if (this._isSuspended) {
                    return; 
                } else {
                    Skype.Ads.Utils.logADT("can't refresh at the moment because ms ad sdk is imposing minimum refresh period, trying again in: 30 seconds ");
                    this._refresh(this, 0, 30000.0);
                    return;
                }
            }

            if (errorMsg === "refresh not performed because ad is not on screen") {
                if (this._isSuspended) {
                    return; 
                } else {
                    
                    Skype.Ads.Utils.logADT("during last refresh ad was off screen, trying to refresh again in 15 seconds");
                    this._refresh(this, 0, 15000.0);
                    return;
                }
            }
            
            if (this._hasErrored) {
                
                Skype.Ads.Utils.logADT("ad has already errored, ignoring error = " + errorCode);
                return;
            }

            if (this.adControl && this.adControl.isEngaged) {
                
                Skype.Ads.Utils.logADT("ignorning errors coming from expanded view, ignoring error = " + errorCode);
                return;
            }

            if (this.adControl && this.model) { 
                this._hasErrored = true;
                Skype.Ads.Utils.logADT("adloading related error from MS Ad for " + this.model.id + ", error message: " + errorMsg, ", errorcode: " + errorCode);
                this.dispatchEvent("onErrorOccurred", { adUnitId: this.model.adUnitId, msg: errorMsg, errorCode: this._convertMSAdErrorCodesToSkypeAdsErrorCodes(errorCode) });
            }
        },
        _convertMSAdErrorCodesToSkypeAdsErrorCodes: function (msErrorCode) {
            switch (msErrorCode) {
                case this.adControl._ERROR_ENUM.NetworkConnectionFailure:
                    return Skype.Ads.ErrorCodes.AdLoading_NetworkConnectionFailure;
                case this.adControl._ERROR_ENUM.ServerSideError:
                    return Skype.Ads.ErrorCodes.AdLoading_ServerSideError;
                case this.adControl._ERROR_ENUM.InvalidServerResponse:
                    return Skype.Ads.ErrorCodes.AdLoading_InvalidServerResponse;
                case this.adControl._ERROR_ENUM.NoAdAvailable:
                    return Skype.Ads.ErrorCodes.AdLoading_NoAd;
                case "timeout":
                    return Skype.Ads.ErrorCodes.AdLoading_Timeout;
                default:
                    return Skype.Ads.ErrorCodes.AdLoading_Other;
            }
        },
        onEngagedChanged: function (e) {
            if (!this.adControl || !this.model) {
                return;
            }
            Skype.Ads.Utils.logADT("Ad onEngagedChanged = " + this.adControl.isEngaged + " for model= " + this.model.id + " called at " + (new Date()).toString());
            this.dispatchEvent("onEngagedChanged", this.adControl.isEngaged);

            if (this._adController) {
                if (this.adControl.isEngaged) {
                    this._engageStart = new Date().getTime();
                    this._adController.sendExpandTrackingEvent(this._getAdType(), this.model.adUnitId, this._creativeUrl);
                } else {
                    var adTimeOpenMs;
                    if (this._engageStart) {
                        adTimeOpenMs = new Date().getTime() - this._engageStart;
                        Skype.Ads.Utils.logADT("expanded view collapsed, engaged time = " + adTimeOpenMs);
                        this._adController.sendCollapseTrackingEvent(this._getAdType(), this.model.adUnitId, this._creativeUrl, adTimeOpenMs);
                    }
                    this._engageStart = null;
                }
            }
        },
        bindAdControl: function (adDiv) {
            this._refreshStart = new Date().getTime();
            this.dispatchEvent("onAdRefreshStart");

            var isSkypeAd = this.model && (this.model.adType === Skype.Ads.AdTypes.SkypeLifeCycle || this.model.adType === Skype.Ads.AdTypes.SkypeHousePromoAd);

            this.adControl = new MicrosoftNSJS.Advertising.AdControl(adDiv,
                {
                    isSkypeAd: isSkypeAd,
                    applicationId: this.model.applicationId,
                    adUnitId: this.model.adUnitId,
                    isAutoRefreshEnabled: false
                });

            
            this.adControl._refreshPeriodSeconds = this.model.adRefreshPeriodSec;

            this.adControl.onAdRendered = this.onAdRendered.bind(this);
            this.adControl.onErrorOccurred = this.onErrorOccurred.bind(this);
            this.adControl.onEngagedChanged = this.onEngagedChanged.bind(this);
        },
        _onReceiveMessage: function (msg) {
            if (this._isSuspended) {
                return;
            }

            
            
            

            
            if (msg.origin !== "ms-appx-web://" + document.location.host) {
                return;
            }

            var msgStr = msg.data;

            
            var colonIx = msgStr.indexOf(":");
            if (colonIx < 0) {
                return;
            }

            var msgId = msgStr.substr(0, colonIx);
            if (msgId === "null") {
                return;
            }

            if (!this.el || !this.el.id) {
                return;
            }

            
            
            var localId = this.el.id + "-sponsoredcontent";

            if (localId !== msgId) {
                return;
            }

            msgStr = msgStr.substr(colonIx + 1);

            
            
            
            
            
            
            

            var e = null;
            try {
                e = JSON.parse(msgStr);
            } catch (exception) {
                Skype.Ads.Utils.logADT("unable to parse sponsored content event msg: " + msg);
                return;
            }

            if (!e || !e.eventType || !e.eventData) {
                return;
            }

            
            this._creativeUrl = e.eventData.creativeUrl;

            if (e.eventType === "LOAD") {
                this._sendLoadTrackingEvent();
            } else if (e.eventType === "CLICK" && e.eventData.clickThroughUrl && this._adController && this.model) {
                this._adController.sendClickTrackingEvent(this._getAdType(), this.model.adUnitId, this._creativeUrl, e.eventData.clickThroughUrl);
            }
        }
    }, {
        
    });

    WinJS.Namespace.define("Skype.Ads", {
        MsAdView: MsAdView,
    });

}());
(function () {
    "use strict";

    
    var ctrlTypes = {
        MS: 0,
        SC: 1
    };
    var adTypes = { BackupCreative: -1, ThirdPartyAd: 0, SkypeLifeCycle: 1, SkypeHousePromoAd: 2, NoAd: 3, SponsoredContent: 4, Offers: 5};
    var placementTypes = { Panorama: 0, ChatConversation: 1, CallConversation: 2 };

    WinJS.Namespace.define("Skype.Ads", {
        CtrlTypes: ctrlTypes,
        AdTypes: adTypes,
        PlacementTypes: placementTypes
    });

    Skype.Ads.Utils.lifeCycleInstance.addEventListener("activated", function (e) {
        var prevState = e && e.detail && e.detail.previousExecutionState;

        if (_configReader && (prevState === Windows.ApplicationModel.Activation.ApplicationExecutionState.running || prevState === Windows.ApplicationModel.Activation.ApplicationExecutionState.suspended)) {
            var kind = e && e.detail && e.detail.kind;
            Skype.Ads.Utils.logADT("ignoring activation because already have configReader instance and previousExecutionState=" + prevState + ", launch kind=" + kind);
            return;
        }


        initAndStartConfigReader();

    });

    Skype.Ads.Utils.lifeCycleInstance.addEventListener("resuming", function () {

        initAndStartConfigReader();

    }, false);

    Skype.Ads.Utils.lifeCycleInstance.addEventListener("suspending", function () {
        
        if (_configReader) {
            _configReader._stopXhr();
        }
    });

    function initAndStartConfigReader() {
        if (_configReader) {
            _configReader.restart();
        } else {
            createInstances();
            _configReader.start();
        }
    }

    function createInstances(options) {
        if (!_configReader) {
            _configReader = new ConfigReader(options);
        }
        if (!_adLogicInstance) {
            _adLogicInstance = new AdLogic(_configReader);
        }
    }

    var _initApplicationId = null;

    var configReaderStatus = {started: 0, stopped: 1, failed: 2 };

    function createConfigObj(configUrl, version, adUnitIdMap, adLogic, cntryDefaultLangMapping, flexTags) {
        return {
            url: configUrl,
            version: version,
            adUnitIdMap: adUnitIdMap,
            adLogic: adLogic,
            cntryDefaultLangMapping: cntryDefaultLangMapping,
            flexTags: flexTags
        };
    }

    
    var _configReader;
    var ConfigReader = WinJS.Class.define(function (options) {
        
        if (!options) {
            options = {};
        }

        this._updateIntervalInHours = options.updateIntervalInHours || 1.0; 
        this._minUpdateIntervalInHours = options.minUpdateIntervalInHours || 1 / 60.0; 
        this._failRetryTimeoutInHours = options.failRetryTimeOutInHours || 1 / 60.0; 
        this._defaultServer = "https://az361816.vo.msecnd.net/configuration/blue-config.json";
        this._serverURL = options.serverURL || this._defaultServer;
        


        this._refreshTimerId = null,
        this._timerExpireTime = null,
        this._msPerHour = 3600.0 * 1000.0;
        this._numFailures = 0;
        this._status = configReaderStatus.stopped;
    },
    {
        
        status: {
            get: function () {
                return this._status;
            }
        },

        start: function () {
            this.stop();
            this._status = configReaderStatus.started;
            this._readDataFromServer();
        },

        stop: function () {
            
            if (this._getDataPromise) {
                this._getDataPromise.cancel();
                this._getDataPromise = null;
            }

            this._status = configReaderStatus.stopped;
            this._timerExpireTime = null;
            if (this._refreshTimerId) {
                clearTimeout(this._refreshTimerId);
                this._refreshTimerId = null;
            }
        },

        _stopXhr: function() {
            if (this._getDataPromise) {
                this._getDataPromise.cancel();
                this._getDataPromise = null;
            }
        },

        _restartTimer: function (refreshInMinutes) {
            this._minUpdateIntervalInHours = 0;
            this._startTimer(refreshInMinutes * 60000.0);
        },

        restart: function (serverURL) {
            
            if (!this._timerExpireTime || serverURL) {
                this.stop();
                this._status = configReaderStatus.started;
                if (serverURL) {
                    this._serverURL = serverURL;
                }
                this._readDataFromServer();
                return;
            }

            var now = new Date().getTime();
            if (now >= this._timerExpireTime) {
                this.stop();
                this._status = configReaderStatus.started;
                this._readDataFromServer();
            } else {
                var remainingTime = this._timerExpireTime - now;
                this.stop();
                this._status = configReaderStatus.started;
                this._startTimer(remainingTime);
            }
        },

        _readDataFromServer: function () {
            

            if (this.status === configReaderStatus.stopped) {
                Skype.Ads.Utils.logADT("readDataFromServer attempted by config reader is stopped");
                return;
            }

            if (this._numFailures >= 10) {
                var timeout = this._updateIntervalInHours * this._msPerHour;
                Skype.Ads.Utils.logADT("number of failures reached 10, trying again after timeout(ms) = " + timeout);
                this._numFailures = 0; 
                this._startTimer(timeout); 
                return;
            }

            if (!Skype.Ads.connectivityStatusInstance.isConnected) {
                this._fail("when trying to read config file, no network connectivity, skipping and trying again shortly", false);
                return;
            }

            this._getDataPromise = this._getConfigDataAsync().then(
                function (result) {
                    if (this._serverURL === this._defaultServer && !this._verifySignature(result.key, result.signature, result.configJSON)) {
                        this._tryBackup("signature verification failed on config data");
                    } else {
                        var newConfigDataObj = this._validateConfig(result.configObj);
                        if (newConfigDataObj) {
                            this._numFailures = 0; 
                            Skype.Ads.setPersistedAdConfigAsync(newConfigDataObj).done(function () {
                                this._sendConfigLoadTrackingEvent();
                                this._refreshConfig(newConfigDataObj);
                                this._startTimer(this._updateIntervalInHours * this._msPerHour);
                            }.bind(this));
                        } else {
                            this._tryBackup("received null config obj, likely file failed validation tests.");
                        }
                    }
                }.bind(this),
                function (error) {
                    if (error && error.name === "Canceled") {
                        Skype.Ads.Utils.logADT("xhr canceled");
                    } else {
                        this._tryBackup("config load xhr error=" + error);
                    }
                    return error;
                }.bind(this));
        },

        
        
        
        _verifySignature: function (publicKeyStr, signatureStr, msgStr) {
            if (!publicKeyStr || !signatureStr || !msgStr) {
                Skype.Ads.Utils.logADT("invalid parameters given to verifySignature");
                return false;
            }
            try {
                var IBufferPublicKey = Windows.Security.Cryptography.CryptographicBuffer.decodeFromBase64String(publicKeyStr);

                var objAlgProv = Windows.Security.Cryptography.Core.AsymmetricKeyAlgorithmProvider.openAlgorithm(Windows.Security.Cryptography.Core.AsymmetricAlgorithmNames.rsaSignPkcs1Sha1);

                var publicKey = objAlgProv.importPublicKey(IBufferPublicKey);

                var iBufferSignature = Windows.Security.Cryptography.CryptographicBuffer.decodeFromBase64String(signatureStr);

                var iBufferMsg = Windows.Security.Cryptography.CryptographicBuffer.convertStringToBinary(msgStr, Windows.Security.Cryptography.BinaryStringEncoding.utf8);

                return Windows.Security.Cryptography.Core.CryptographicEngine.verifySignature(publicKey, iBufferMsg, iBufferSignature);
            } 
            catch (e) {
                Skype.Ads.Utils.logADT("exception when trying to verify signature: " + e);
                return false;
            }
        },

        
        
        
        
        
        
        
        _getConfigDataAsync: function () {

            Skype.Ads.Utils.logADT("start getting config file: " + new Date());

            var timeout = 10000; 

            var xhr;

            return new WinJS.Promise(
            function (complete, error) {
                xhr = new XMLHttpRequest();

                xhr.onreadystatechange = function () {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            try {
                                var configDataObj = JSON.parse(xhr.response);
                                var key = xhr.getResponseHeader('x-ms-meta-token');
                                var signature = xhr.getResponseHeader('x-ms-meta-signature');
                                complete({ configObj: configDataObj, configJSON: xhr.response , key: key, signature: signature });
                            }
                            catch (e) {
                                error("error parsing response");
                            }
                        } else {
                            if (xhr.status !== 0) {
                                error("xhr status:" + xhr.status);
                            }
                        }
                    }
                };

                xhr.open("GET", this._serverURL, true);
                xhr.timeout = timeout;
                xhr.ontimeout = function () {
                    error("timeout, xhr status:" + xhr.status);
                };
                try {
                    xhr.send(null);
                }
                catch (e) {
                    error("xhr.send exception: " + e);
                }
            }.bind(this),
            function (error) {
                
                if (xhr) {
                    xhr.abort();
                }
                return error;
            }.bind(this));
        },

        _tryBackup: function (msg) {
            Skype.Ads.getPersistedAdConfigAsync().done(
                function (backupConfig) {
                    if (backupConfig) {
                        var newConfigDataObj = this._validateConfig(backupConfig);
                        if (newConfigDataObj) {
                            this.dispatchEvent("onUseBackupConfig", backupConfig);
                            this._sendXConfigLoadTrackingEvent(msg);
                            this._refreshConfig(newConfigDataObj);
                            this._numFailures = 0; 
                            this._startTimer(this._updateIntervalInHours * this._msPerHour);
                            return;
                        }
                        this._fail("persisted config validation failed", true);
                    } else {
                        
                        this._fail(msg, true);
                    }
                }.bind(this)
           );
        },

        _fail: function (msg, sendTrackingEvent) {
            if (sendTrackingEvent) {
                this._sendErrorTrackingEvent(msg);
            }
            this._retry(msg, true);
        },
        _retry: function (msg, isFail) {
            this._status = configReaderStatus.failed;
            this._numFailures++;
            Skype.Ads.Utils.logADT(msg);
            if (isFail) {
                this.dispatchEvent("onConfigRefreshedFailed");
            }
            this._startTimer(this._failRetryTimeoutInHours * this._msPerHour); 
        },

        _sendErrorTrackingEvent: function (errorMsgStr) {
            if (!Skype.Ads.connectivityStatusInstance.isConnected) {
                Skype.Ads.Utils.logADT("no network connectivity detected, so skipping sending tracking message: " + errorMsgStr);
                return;
            }

            var errorEvent = new Skype.Ads.ErrorTrackingModel();

            this._setBaseData(errorEvent);

            if (errorMsgStr) {
                errorEvent.setErrorData(errorMsgStr);
            }

            errorEvent.setErrorCode(Skype.Ads.Utils.getEnumName(Skype.Ads.ErrorCodes, Skype.Ads.ErrorCodes.ConfigFileError));

            Skype.Ads.track(errorEvent);
        },
        _sendXConfigLoadTrackingEvent: function (errorMsgStr) {
            if (!Skype.Ads.connectivityStatusInstance.isConnected) {
                Skype.Ads.Utils.logADT("no network connectivity detected, so skipping sending tracking message: " + errorMsgStr);
                return;
            }

            var event = new Skype.Ads.XConfigLoadTrackingModel();

            this._setBaseData(event);

            if (errorMsgStr) {
                event.setErrorData(errorMsgStr);
            }

            Skype.Ads.track(event);
        },
        _sendConfigLoadTrackingEvent: function () {
            var event = new Skype.Ads.ConfigLoadTrackingModel();

            this._setBaseData(event);

            Skype.Ads.track(event);
        },

        _setBaseData: function (event) {
            var skypeAPI = new Skype.Ads.SkypeAPI();
            if (!skypeAPI) {
                return;
            }

            var name = skypeAPI.skypeName;
            if (name) {
                event.setSkypeName(name);
            }

            var country = Skype.Ads.country;
            if (country) {
                event.setCountry(country);
            }

            var lang = skypeAPI.language;
            if (lang) {
                event.setLanguage(lang);
            }

            skypeAPI.shutdown();
        },

        
        _validateConfig: function (configDataObj) {
            var isDataValid = true;

            if (!configDataObj) {
                return null;
            }

            var version = configDataObj.version;
            if (typeof (configDataObj.version) !== 'string') {
                version = "1.0";
            }

            var adLogic = configDataObj.adLogic;
            adLogic = this._addDefaultsForMissingAdLogicFields(adLogic);
            if (!this._isAdLogicValid(adLogic)) {
                Skype.Ads.Utils.logADT("Invalid ad logic data");
                isDataValid = false;
            }

            var adUnitIdMap = configDataObj.adUnitIdMap;
            if (!this._isAdUnitIdMapValid(adUnitIdMap)) {
                Skype.Ads.Utils.logADT("Invalid ad unit id map data");
                isDataValid = false;
            }

            var countryLangMap = configDataObj.cntryDefaultLangMapping;
            if (!this._isCntryDefaultLangMapValid(countryLangMap)) {
                Skype.Ads.Utils.logADT("invalid country/region map");
                isDataValid = false;
            }

            
            var flexTags = configDataObj.flexTags || { url: "", map: [] };
            if (!this._isFlexTagsValid(flexTags)) {
                Skype.Ads.Utils.logADT("invalid flextag map");
                isDataValid = false;
            }

            if (!isDataValid) {
                return null;
            }
            
            return createConfigObj(this._serverURL, version, adUnitIdMap, adLogic, countryLangMap, flexTags);
        },

        
        _startTimer: function (delayInMilliseconds) {
            if (this.status === configReaderStatus.stopped) {
                Skype.Ads.Utils.logADT("startTimer attempted by config reader is stopped");
                return;
            }
            this.stop();
            this._status = configReaderStatus.started;
            
            if (delayInMilliseconds < this._minUpdateIntervalInHours * this._msPerHour) {
                delayInMilliseconds = this._minUpdateIntervalInHours * this._msPerHour;
            }
            if (delayInMilliseconds > this._updateIntervalInHours * this._msPerHour) {
                delayInMilliseconds = this._updateIntervalInHours * this._msPerHour;
            }
            this._timerExpireTime = new Date().getTime() + delayInMilliseconds;
            Skype.Ads.Utils.logADT("starting timer, will expire in (ms): " + delayInMilliseconds);
            this._refreshTimerId = setTimeout(function () {
                this._readDataFromServer();
            }.bind(this), delayInMilliseconds);
        },

        
        
        
        
        
        
        
        
        _isAdUnitIdMapValid: function (adUnitIdMap) {
            if (!adUnitIdMap) {
                return false;
            }

            if (!adUnitIdMap.length) {
                return false;
            }

            for (var i = 0, len = adUnitIdMap.length; i < len; i++) {
                var pair = adUnitIdMap[i];
                if (!pair.key || !pair.value) {
                    return false;
                }
                var key = pair.key;
                
                
                if (!key.lang) {
                    return false;
                }
                
                if (typeof(key.cntry) !== 'string') {
                    return false;
                }
                if (!this._isValidSize(key.width, key.height)) {
                    return false;
                }
                if (typeof (key.isPaid) !== 'boolean') {
                    return false;
                }
                if (typeof (key.adType) !== 'number') {
                    return false;
                }

                if (typeof (key.placement) !== 'number') {
                    return false;
                }
            }

            return true;
        },

        
        
        
        
        
        
        
        
        
        
        
        
        _isFlexTagsValid: function(flexTags) {
            if (!flexTags || !flexTags.map){
                return false;
            }

            if (typeof(flexTags.url) !== 'string') {
                return false;
            }

            if (!Array.isArray(flexTags.map)) {
                return false;
            }

            for (var i = 0, len = flexTags.map.length; i < len; i++) {
                var pair = flexTags.map[i];
                if (!pair.key || !pair.guidValue) {
                    return false;
                }
                var key = pair.key;
                if (typeof(key.cntry) !== 'string') {
                    return false;
                }
                if (typeof (key.placement) !== 'number') {
                    return false;
                }
            }

            return true;
        },

        _addDefaultsForMissingAdLogicFields: function (adLogic) {
            if (!adLogic) {
                return null;
            }

            if (typeof (adLogic.adRefreshPeriodSec) !== 'number') {
                adLogic.adRefreshPeriodSec = 60; 
            }

            if (typeof (adLogic.firstTimeUserDays) !== 'number') {
                adLogic.firstTimeUserDays = 14; 
            }

            if (typeof adLogic.showAdsInDefaultLang !== 'boolean') {
                adLogic.showAdsInDefaultLang = true;
            }

            return adLogic;
        },

        
        
        
        
        
        
        
        
        
        
        
        
        _isAdLogicValid: function (adLogic) {
            if (!adLogic) {
                return false;
            }

            if (adLogic.trackingParameters) {
                

                var sendThresholdMins = adLogic.trackingParameters.sendThresholdMins;
                if (sendThresholdMins !== undefined && (typeof(sendThresholdMins) !== 'number' || sendThresholdMins <= 0 || sendThresholdMins > 60)) {
                    return false;
                }

                var maxBufferSize = adLogic.trackingParameters.maxBufferSize;
                var bufferThreshold = adLogic.trackingParameters.bufferThreshold;

                
                if (maxBufferSize !== undefined || bufferThreshold !== undefined) {
                    if (typeof(maxBufferSize) !== 'number' || typeof(bufferThreshold) !== 'number') {
                        return false;
                    }

                    if (maxBufferSize < bufferThreshold || maxBufferSize < 1 || bufferThreshold < 1) {
                        return false;
                    }
                }
            }

            
            if (adLogic.adRefreshPeriodSec <= 30) {
                return false;
            }

            if (adLogic.firstTimeUserDays < 0.0) {
                return false;
            }

            if (typeof adLogic.showAdsInDefaultLang !== 'boolean') {
                return false;
            }
           
            if (!this._isContainersValid(adLogic.conversationNonPaidContainers) ||
                !this._isContainersValid(adLogic.panoramaPaidContainers) ||
                !this._isContainersValid(adLogic.panoramaNonPaidContainers)) {
                return false;
            }

            return true;
        },

        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        _isContainersValid: function (containers) {
            if (!containers || !Array.isArray(containers)) {
                return false;
            }

            
            if (containers.length === 0) {
                return true;
            }

            var noAdIndexes = [];

            for (var c = 0, numContainers = containers.length; c < numContainers; c++) {
                var container = containers[c];

                if (typeof (container.onNoAd) !== 'number') {
                    return false;
                }

                noAdIndexes.push(container.onNoAd);

                if (!container.name) {
                    container.name = "defaultContainerName";
                }

                if (!container.ads || !container.ads.length) {
                    return false;
                }

                for (var i = 0, len = container.ads.length; i < len; i++) {
                    var ad = container.ads[i];
                    if (!this._isValidSize(ad.width, ad.height)) {
                        return false;
                    }
                    if (typeof (ad.adType) !== 'number') {
                        return false;
                    }
                    if (typeof (ad.ctrlType) !== 'number') {
                        return false;
                    }
                }
            }
            
            if (!noAdIndexes.length) {
                return false;
            }

            
            
            var visitedIndexes = [];
            var index = 0;
            visitedIndexes.push(0);
            do {
                index = noAdIndexes[index];
                
                if (index === -1) {
                    break;
                }
                if (index < 0 || index >= noAdIndexes.length) {
                    return false;
                }

                for (var v = 0, numVisited = visitedIndexes.length; v < numVisited; v++) {
                    if (index === visitedIndexes[v]) {
                        return false;
                    }
                }

                visitedIndexes.push(index);
            } while(1)

            return true;
        },

        _isCntryDefaultLangMapValid: function (countryLangMap) {
            if (!countryLangMap) {
                return false;
            }

            var defaultPercents = [{ percent: 100.0, adTypes: [Skype.Ads.AdTypes.ThirdPartyAd, Skype.Ads.AdTypes.SkypeHousePromoAd] }, { percent: 0.0, adTypes: [Skype.Ads.AdTypes.SkypeLifeCycle] }, { percent: 0.0, adTypes: [Skype.Ads.AdTypes.NoAd] }, { percent: 0, adTypes: [Skype.Ads.AdTypes.SponsoredContent] }, { percent: 0, adTypes: [Skype.Ads.AdTypes.Offers] }];

            
            for (var i in countryLangMap) {
                if (typeof (countryLangMap[i].defaultLanguage) !== 'string') {
                    return false;
                }

                if (typeof (countryLangMap[i].trackingEnabled) !== 'boolean') {
                    return false;
                }

                if (typeof (countryLangMap[i].name) !== 'string') {
                    return false;
                }

                if (!this._checkAdPercents(countryLangMap[i].adPercents)) {
                    countryLangMap[i].adPercents = defaultPercents;
                }

                if (!this._checkAdPercents(countryLangMap[i].adPercentsPaidUser)) {
                    countryLangMap[i].adPercentsPaidUser = defaultPercents;
                }
            }

            return true;
        },

        
        _checkAdPercents: function (adPercents) {
            if (adPercents) {
                var sum = 0.0, value;
                for (var j = 0, len = adPercents.length; j < len; j++) {
                    value = adPercents[j].percent;
                    if (typeof (value) !== 'number') {
                        return false;
                    }
                    sum += value;
                }
                if (sum < 99.0 || sum > 101.0) {
                    return false;
                }
            } else {
                return false;
            }

            return true;
        },

        _isValidSize: function (width, height) {
            if (typeof (width) !== 'number') {
                return false;
            }

            if (typeof (height) !== 'number') {
                return false;
            }

            
            var min = 40;
            var max = 800;

            if (width < min || width > max) {
                return false;
            }

            
            min = 40;
            max = 800;
            if (height < min || height > max) {
                return false;
            }

            return true;
        },

        _currentConfig: null,
        currentConfig: {
            get: function () {
                return this._currentConfig;
            }
        },

        
        _refreshConfig: function (newConfig) {

            
            
            
            if (newConfig.adLogic) {
                if (!_initApplicationId) {
                    if (newConfig.adLogic.applicationId) {
                        _initApplicationId = newConfig.adLogic.applicationId;
                    } else {
                        _initApplicationId = Skype.Ads.defaultApplicationId;
                    }
                }
                
                newConfig.adLogic.applicationId = _initApplicationId;
            }

            this._currentConfig = newConfig;

            var self = this;

            function next() {
                Skype.Ads.Utils.logADT("starting: refresh of data in ad logic table");
                
                self.dispatchEvent("onConfigRefreshed", newConfig);
            }

            
            
            Skype.Ads.updateFirstTimeUserStatusAsync(newConfig.adLogic.firstTimeUserDays).done(function () {
                next();
            },
            function (error) {
                next();
            });
        },
    },
    {
        
    });

    
    ConfigReader = WinJS.Class.mix(ConfigReader, WinJS.Utilities.eventMixin);

    
    var _adLogicInstance = null;
    var adLogicInstance = function () {
        createInstances();
        return _adLogicInstance;
    };
    var AdLogic = WinJS.Class.define(function (configReader) {
        

        
        this._config = null;

        this._adUnitIdMap = null;
        this._cntryDefaultLangMapping = null;
        this._flexTagMap = null;

        var self = this;
        var update = function (newConfig) {
            self._config = newConfig;
            self._createMaps();
            self.dispatchEvent("onAdLogicDataRefreshed");
        };
        if (configReader && configReader.currentConfig) {
            update(configReader.currentConfig);
        }
        configReader.addEventListener("onConfigRefreshed", function (evt) {
            if (evt && evt.detail) {
                update(evt.detail);
            }
        });
    },
    {
        
        
        
        
        
        _createMaps: function (adUnitIdMap, cntryDefaultLangMap, flexTags) {
            var map;
            if (adUnitIdMap) {
                map = adUnitIdMap;
            } else {
                map = this._config.adUnitIdMap;
            }
            this._adUnitIdMap = {};
            for (var i = 0, len = map.length; i < len; i++) {
                this._adUnitIdMap[this._hashAdUnitId(map[i].key)] = map[i].value;
            }
            this._createLangMap(cntryDefaultLangMap);
            this._createFlexTagMap(flexTags);
        },
        _createLangMap: function (cntryDefaultLangMapping) {
            if (!cntryDefaultLangMapping) {
                cntryDefaultLangMapping = this._config.cntryDefaultLangMapping;
            }
            this._cntryDefaultLangMapping = {};
            for (var j in cntryDefaultLangMapping) {
                if (cntryDefaultLangMapping.hasOwnProperty(j)) {
                    var key = j.toLowerCase(),
                        propObj = cntryDefaultLangMapping[j];
                    propObj.defaultLanguage = typeof propObj === 'string' ? propObj.toLowerCase() : propObj.defaultLanguage.toLowerCase();
                    this._cntryDefaultLangMapping[key] = propObj;
                }
            }
        },

        
        _createFlexTagMap: function (flexTags) {
            var flexTagMap = null;
            if (flexTags && flexTags.map) {
                flexTagMap = flexTags.map;
            } else if (this._config && this._config.flexTags && this._config.flexTags.map) {
                flexTagMap = this._config.flexTags.map;
            }
            if (!flexTagMap) {
                return;
            }
            this._flexTagMap = {};
            for (var i = 0, len = flexTagMap.length; i < len; i++) {
                this._flexTagMap[this._hashFlexTag(flexTagMap[i].key)] = flexTagMap[i].guidValue;
            }
        },
        flexTagUrl: {
            get: function () {
                if (this._config && this._config.flexTags && this._config.flexTags.url) {
                    return this._config.flexTags.url;
                } else {
                    return null;
                }
            }
        },
        getFlexTagGuid: function(country, placement) {
            if (!this._flexTagMap) {
                Skype.Ads.Utils.logADT("failed calling getFlexTagGuid, configuration is null");
                return null;
            }
            return this._flexTagMap[this._hashFlexTag({ cntry: this._getValidCountry(country), placement: placement })];
        },
        _hashFlexTag: function (key) {
            return key.cntry.toString().toLowerCase() + key.placement.toString();
        },
        
        configUrl: {
            get: function () {
                return this._config && this._config.url;
            }},
        isLoaded: function () {
            return this._cntryDefaultLangMapping !==  null;
        },
        hasAdsEnabled: function (country, isPaidUser) {
            var adPercents = this._getAdPercents(country, isPaidUser);
            if (adPercents) {
                
                for (var i = 0, len = adPercents.length; i < len; i++) {
                    if (adPercents[i].adTypes.indexOf(Skype.Ads.AdTypes.NoAd) !== -1 && adPercents[i].percent >= 100.0) {
                        return false;
                    }
                }

                return true;
            }
            return false;
        },
        hasTrackingEnabled: function (country) {
            var countryDefaults = this._getCountryDefaults(country);
            if (countryDefaults) {
                return countryDefaults.trackingEnabled;
            }

            return false;
        },
        _getCountryDefaults: function (country) {
            if (!this._cntryDefaultLangMapping || typeof country !== 'string') {
                return null;
            }
            var validCountry = this._getValidCountry(country);
            if (validCountry && this._cntryDefaultLangMapping[validCountry]) {
                return this._cntryDefaultLangMapping[validCountry];
            }
            return null;
        },
        _getValidCountry: function (country) {
            
            if (!this._cntryDefaultLangMapping.hasOwnProperty(country)) {
                return "xx";
            } else {
                return country;
            }
        },

        
        
        
        pickRandomAdType: function (country, isPaidUser, isFirstTimeUsage, allowedAdTypes) {

            
            if (isFirstTimeUsage) {
                var isLCMAllowed = (allowedAdTypes.indexOf(Skype.Ads.AdTypes.SkypeLifeCycle) !== -1);
                return isLCMAllowed ? [Skype.Ads.AdTypes.SkypeLifeCycle] : [Skype.Ads.AdTypes.NoAd];
            }

            var adPercents = this._getAdPercents(country, isPaidUser);

            if (adPercents) {

                var normalizeFactor = 0;
                var indexesToKeep = [];
                var keep;
                for (var i = 0, len = adPercents.length; i < len; i++) {
                    if (adPercents[i].percent <= 0.0) {
                        continue;
                    }

                    keep = false;
                    for (var j = 0, lenAdTypes = adPercents[i].adTypes.length; j < lenAdTypes; j++) {
                        var adType = adPercents[i].adTypes[j];
                        if (Array.isArray(allowedAdTypes) && allowedAdTypes.indexOf(adType) !== -1) {
                            keep = true;
                            break;
                        }
                    }
                    if (!keep) {
                        continue;
                    }

                    indexesToKeep.push(i);
                    normalizeFactor += adPercents[i].percent;

                }

                if (normalizeFactor > 0) {
                    var r = Math.random() * 100.0;  

                    
                    if (r < 0.0001) {
                        r = 0.0001;
                    }

                    var total = 0.0;
                    var index;
                    for (i = 0, len = indexesToKeep.length; i < len; i++) {
                        index = indexesToKeep[i];
                        total += 100.0 * (adPercents[index].percent / normalizeFactor);
                        if (r <= total) {
                            var adTypes = adPercents[index].adTypes;
                            Skype.Ads.Utils.logADT("randomly picked adTypes are: " + adTypes);
                            return adTypes;
                        }
                    }
                }
            }

            Skype.Ads.Utils.logADT("fail back random picked: No Ad");
            return [Skype.Ads.AdTypes.NoAd];
        },
        
        getAdTypesWithPercentGreaterThanZero: function (country, isPaidUser) {
            var adPercents = this._getAdPercents(country, isPaidUser);
            if (adPercents) {
                var adTypes = [];
                for (var i = 0, len = adPercents.length; i < len; i++) {
                    if (adPercents[i].percent > 0.0) {
                        for (var j = 0; j < adPercents[i].adTypes.length; j++) {
                            adTypes.push(adPercents[i].adTypes[j]);
                        }
                    }
                }

                return adTypes;
            }

            return null;
        },
        _getAdPercents: function (country, isPaidUser) {
            var countryDefaults = this._getCountryDefaults(country);
            if (countryDefaults && typeof isPaidUser === 'boolean') {
                return isPaidUser ? countryDefaults.adPercentsPaidUser : countryDefaults.adPercents;
            }
            return null;
        },
        getAdUnitId: function (language, country, width, height, isPaid, adType, placement) {
            if (!this._config) {
                Skype.Ads.Utils.logADT("failed calling getAdUnitId, configuration is null");
                return null;
            }

            if (typeof(language) !== "string" || typeof(country) !== "string" || 
                typeof(width) !== "number" || typeof(height) !== "number" ||
                typeof (isPaid) !== "boolean" || typeof(adType) !== "number" ||
                typeof (placement) !== "number") {
                Skype.Ads.Utils.logADT("failed calling getAdUnitId, invalid parameter(s)");
                return null;
            }

            
            if (!this._adUnitIdMap || !this._cntryDefaultLangMapping) {
                this._createMaps();
            }

            var validCountry = this._getValidCountry(country);

            var isSkypeAd = (adType === Skype.Ads.AdTypes.SkypeLifeCycle || adType === Skype.Ads.AdTypes.SkypeHousePromoAd);

            
            if (isSkypeAd) {
                validCountry = "**";
            }

            var key = { lang: language, cntry: validCountry, width: width, height: height, isPaid: isPaid, adType: adType, placement: placement };
            var value = this._adUnitIdMap[this._hashAdUnitId(key)];

            
            
            var adlogic = this.getAdLogic();
            if (adlogic && adlogic.showAdsInDefaultLang && !value && !isSkypeAd) {
                var defaultlang = this._cntryDefaultLangMapping[validCountry.toLowerCase()].defaultLanguage;
                if (defaultlang) {
                    key = { lang: defaultlang, cntry: validCountry, width: width, height: height, isPaid: isPaid, adType: adType, placement: placement };
                    value = this._adUnitIdMap[this._hashAdUnitId(key)];
                }
            }
	        if (!value) {
	            Skype.Ads.Utils.logADT("Invalid ad unit id returned from map, indicating no mapping value present for: lang=" + language + ", country/region=" + validCountry + ", width=" + width + "height=" + height + ", isPaid=" + isPaid + ", adType=" + adType + ", placement=" + placement);
                return null;
            }
            return value;
        },
        _hashAdUnitId: function (key) {
            return key.lang.toString().toLowerCase() +
                   key.cntry.toString().toLowerCase() +
                   key.width.toString() +
                   key.height.toString() +
                   key.isPaid.toString() +
                   key.adType.toString() +
                   key.placement.toString();
        },
        getAdLogic: function () {
            if (!this._config) {
                Skype.Ads.Utils.logADT("configuration not available yet, can not get adlogic.");
                return null;
            }

            
            return this._config.adLogic;
        }
    },
    {
        
    });

    
    AdLogic = WinJS.Class.mix(AdLogic, WinJS.Utilities.eventMixin);

    WinJS.Namespace.define("Skype.Ads", {
        adLogicInstance: adLogicInstance,


        
        restartConfigReader: function (serverURL) {
            _configReader.restart(serverURL);
        },
        restartConfigReaderTimer: function(refreshInMinutes) {
            _configReader._restartTimer(refreshInMinutes);
        }
    });

}());
(function () {
    "use strict";

    
    Skype.Ads.Utils.lifeCycleInstance.addEventListener("resuming", function () {
        
        updateStatus();
    }, false);

    function updateStatus() {
        if (!_connectivityStatus) {
            _connectivityStatus = new ConnectivityStatus();
        } else {
            _connectivityStatus._updateNetworkStatus();
        }
    }

    
    var _connectivityStatus;

    var ConnectivityStatus = WinJS.Class.define(function () {
        
        this._isConnectedToNetwork = false;
        var networkInfo = Windows.Networking.Connectivity.NetworkInformation;
        if (networkInfo) {
            networkInfo.addEventListener("networkstatuschanged", this._updateNetworkStatus.bind(this));
        } else {
            Skype.Ads.Utils.logADT("couldn't get network information, network connectivity handler not attached.");
        }
        this._updateNetworkStatus();
        this.ipAddress = null;
    }, {
        
        _updateNetworkStatus: function () {
            var networkInfo = Windows.Networking.Connectivity.NetworkInformation;
            if (!networkInfo) {
                Skype.Ads.Utils.logADT("couldn't get network information");
                this._setConnectivityStatus(false);
                return;
            }
            this.ipAddress = null;
            try {
                var connectionProfile = networkInfo.getInternetConnectionProfile();
            }
            catch (e1) {
                Skype.Ads.Utils.logADT("couldn't get internet connection profile, caught error: " + e1);
                this._setConnectivityStatus(false);
                return;
            }
            if (connectionProfile) {
                try {
                    var connectivity = connectionProfile.getNetworkConnectivityLevel();
                    if (connectivity === Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess) {
                        this._setConnectivityStatus(true);

                        var hosts = networkInfo.getHostNames();
                        if (hosts) {
                            hosts.forEach(function (host) {
                                
                                if (host.type === Windows.Networking.HostNameType.ipv4) {
                                    this.ipAddress = host.rawName;
                                }
                            }.bind(this));
                        }

                        return;
                    }
                }
                catch (e2) {
                    Skype.Ads.Utils.logADT("while trying to determine network connectivity level, caught error: " + e2);
                }
            }

            Skype.Ads.Utils.logADT("none or limited network connectivity");
            this._setConnectivityStatus(false);
        },

        _setConnectivityStatus: function (newConnectivityStatus) {
            if (newConnectivityStatus !== this._isConnectedToNetwork) {
                this._isConnectedToNetwork = newConnectivityStatus;
                Skype.Ads.Utils.logADT("network connectivity status changed...is connected=" + newConnectivityStatus);
                this.dispatchEvent("onConnectivityStatusChanged", this._isConnectedToNetwork);
            }
        },

        isConnected: {
            get: function () {
                return this._isConnectedToNetwork;
            }
        }

    }, {
        
    });
    
    
    ConnectivityStatus = WinJS.Class.mix(ConnectivityStatus, WinJS.Utilities.eventMixin);

    WinJS.Namespace.define("Skype.Ads", {
        connectivityStatusInstance: {
            get: function () {
                updateStatus();
                return _connectivityStatus;
            }
        },
        ipAddress: {
            get: function () {
                if (_connectivityStatus) {
                    return _connectivityStatus.ipAddress;
                } else {
                    return null;
                }
            }
        }
    });

}());
(function () {
    "use strict";

    
    Skype.Ads.Utils.lifeCycleInstance.addEventListener("activated", function (e) {
        var prevState = e && e.detail && e.detail.previousExecutionState;

        if (prevState === Windows.ApplicationModel.Activation.ApplicationExecutionState.running || prevState === Windows.ApplicationModel.Activation.ApplicationExecutionState.suspended) {
            return;
        }

        
        earlyXhr("https://mobileads.msn.com/");
        
        earlyXhr("https://ads1.msads.net/");
    });

    function earlyXhr(url) {
        Skype.Ads.Utils.logADT("starting early xhr call to " + url);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        try {
            xhr.send(null);
        }
        catch (e) {
            Skype.Ads.Utils.logADT("early xhr fail: " + e);
        }
    }

}());
(function () {
    "use strict";

    

    Skype.Ads.Utils.lifeCycleInstance.addEventListener("activated", function (e) {
        var prevState = e && e.detail && e.detail.previousExecutionState;

        if (_countryCode && (prevState === Windows.ApplicationModel.Activation.ApplicationExecutionState.running || prevState === Windows.ApplicationModel.Activation.ApplicationExecutionState.suspended)) {
            var kind = e && e.detail && e.detail.kind;
            Skype.Ads.Utils.logADT("ignoring activation because already have country code = " + _countryCode + " and previousExecutionState=" + prevState + ", launch kind=" + kind);
            return;
        }

        getCountryCodeAsync();

        Skype.Ads.connectivityStatusInstance.addEventListener("onConnectivityStatusChanged", function (evt) {
            
            if (evt && evt.detail) {
                getCountryCodeAsync();
            }
        });
    });

    Skype.Ads.Utils.lifeCycleInstance.addEventListener("resuming", function () {
        getCountryCodeAsync();
    }, false);

    Skype.Ads.Utils.lifeCycleInstance.addEventListener("suspending", function () {
        if (_xhr) {
            _xhr.abort();
        }
    });

    var _countryCode = null;
    var _url = "https://apps.skype.com/countrycode";
    var _xhrtimeout = 10000; 

    
    var _retryTimer = null;
    var _numRetries = 0;
    var _shortTimeout = 1000 * 60;
    var _longTimeout = 1000 * 3600;
    var _numRetriesBeforeLongTimeout = 10;

    

    var _xhr = null;

    var getCountryCodeAsync = function (donecallback, errorcallback) {

        cancelRetryTimer();

        if (!Skype.Ads.connectivityStatusInstance.isConnected) {
            Skype.Ads.Utils.logADT("no network connectivity detected, will retry in a bit");
            startRetryTimer();
            return;
        }

        
        if (_xhr) {
            _xhr.abort();
        }
        

        var now = new Date();
        Skype.Ads.Utils.logADT("start get country/region code: " + now);

        _xhr = new XMLHttpRequest();

        var getPersistDone = function (countryCode) {
            if (countryCode) {
                _countryCode = countryCode.toLowerCase();
                Skype.Ads.Utils.logADT("use persisted country/region code: " + _countryCode);
                if (donecallback && typeof (donecallback) === 'function') {
                    donecallback(_countryCode);
                }
            }
        };

        _xhr.onreadystatechange = function () {
            if (_xhr.readyState === XMLHttpRequest.DONE) {
                if (_xhr.status === 200) {
                    try {
                        var resultObj = JSON.parse(_xhr.response);
                        if (resultObj.country_code) {
                            _countryCode = resultObj.country_code.toLowerCase();
                            Skype.Ads.Utils.logADT("new country/region code: " + _countryCode);
                            _numRetries = 0;
                            Skype.Ads.setPersistedCountryCodeAsync(_countryCode).done(
                                function () {
                                    if (donecallback && typeof (donecallback) === 'function') {
                                        donecallback(_countryCode);
                                    }
                                });
                        } else {
                            countryCodeFail("no country/region code field", getPersistDone, errorcallback);
                        }
                    }
                    catch (e) {
                        countryCodeFail("get country/region code json parse error", getPersistDone, errorcallback);
                    }
                } else {
                    
                    
                    if (_xhr.status !== 0) {
                        countryCodeFail("get country/region code xhr result error code: " + _xhr.status, getPersistDone, errorcallback);
                    }
                }
            }
        };

        _xhr.open("GET", _url + "?" + now.getTime(), true);
        _xhr.timeout = _xhrtimeout;
        _xhr.ontimeout = function () {
            countryCodeFail("get country/region code xhr timeout, result error code: " + _xhr.status, getPersistDone, errorcallback);
        };
        try {
            _xhr.send(null);
        }
        catch (e) {
            countryCodeFail("exception occured during xhr send to get country/region code: " + e, getPersistDone, errorcallback);
        }
    };

    function cancelRetryTimer() {
        if (_retryTimer) {
            clearTimeout(_retryTimer);
            _retryTimer = null;
        }
    }

    function startRetryTimer() {
        
        
        _numRetries++;
        cancelRetryTimer();
        var timeout = _shortTimeout; 
        if (_numRetries >= _numRetriesBeforeLongTimeout) {
            timeout = _longTimeout; 
        }
        Skype.Ads.Utils.logADT("failed to get country code, retry in " + timeout + " ms");
        _retryTimer = setTimeout(function () {
            getCountryCodeAsync();
        }, timeout); 
    }

    function countryCodeFail(errorMsgStr, completecallback, errorcallback) {
        
        Skype.Ads.getPersistedCountryCodeAsync().done(
            function (countryCode) {
                if (countryCode) {
                    completecallback(countryCode);
                    Skype.Ads.Utils.logADT("got error: " + errorMsgStr + ", so using persisted country code: " + countryCode);
                    sendPersistedErrorTrackEvent(errorMsgStr);
                } else {
                    sendErrorTrackingEvent(errorMsgStr, errorcallback);
                }
            });
    }

    function setBaseData(event) {
        var skypeAPI = new Skype.Ads.SkypeAPI();
        if (!skypeAPI) {
            return;
        }

        var name = skypeAPI.skypeName;
        if (name) {
            event.setSkypeName(name);
        }

        var country = Skype.Ads.country;
        if (country) {
            event.setCountry(country);
        }

        var lang = skypeAPI.language;
        if (lang) {
            event.setLanguage(lang);
        }

        skypeAPI.shutdown();
    }

    function sendPersistedErrorTrackEvent(errorMsgStr) {
        if (!Skype.Ads.connectivityStatusInstance.isConnected) {
            Skype.Ads.Utils.logADT("no network connectivity detected, so skipping sending tracking message: " + errorMsgStr);
            return;
        }

        var event = new Skype.Ads.XCountryCodeTrackingModel();
        
        setBaseData(event);

        if (errorMsgStr) {
            event.setErrorData(errorMsgStr);
        }

        Skype.Ads.track(event);
    }

    function sendErrorTrackingEvent(errorMsgStr, errorcallback) {
        if (errorcallback && typeof (errorcallback) === 'function') {
            errorcallback(errorMsgStr);
        }

        Skype.Ads.Utils.logADT(errorMsgStr);

        startRetryTimer();

        if (!Skype.Ads.connectivityStatusInstance.isConnected) {
            Skype.Ads.Utils.logADT("no network connectivity detected, so skipping sending tracking message: " + errorMsgStr);
            return;
        }

        var errorEvent = new Skype.Ads.ErrorTrackingModel();

        setBaseData(errorEvent);

        if (errorMsgStr) {
            errorEvent.setErrorData(errorMsgStr);
        }

        errorEvent.setErrorCode(Skype.Ads.Utils.getEnumName(Skype.Ads.ErrorCodes, Skype.Ads.ErrorCodes.CountryCodeError));

        Skype.Ads.track(errorEvent);
    }

    WinJS.Namespace.define("Skype.Ads", {
        country: {
            get: function () {
                return _countryCode;
            },

        },

    });

}());
(function () {
    "use strict";

    
    
    var PaidUserLogic = WinJS.Class.define(function (skypeAPI) {
        this._api = skypeAPI;
        this._isPaidUser = null,

        this._onAccountChangeHandler = function () {
            
            var result = this._calcIsPaidUser();
            if (result != this._isPaidUser) {
                this._isPaidUser = result;
                this.dispatchEvent("IsPaidUserChanged", result);
            }
        }.bind(this);
        this._api.addEventListener("AccountPropsForPaidUserChanged", this._onAccountChangeHandler);
        
    }, {
        shutdown: function () {
            if (this._api && this._onAccountChangeHandler) {
                this._api.removeEventListener("AccountPropsForPaidUserChanged", this._onAccountChangeHandler);
            }
        },

        isPaidUser: {
            get: function () {
                if (!this._isPaidUser) {
                    this._isPaidUser = this._calcIsPaidUser();
                }
                return this._isPaidUser;
            }
        },
        _calcIsPaidUser: function () { return (this._hasCredit() ||  this._hasActiveSubscriptions()); },
        
        _hasCredit: function () {
            if (!this._api) {
                return false;
            }
            var bal = this._api.skypeOutBalance;
            if (bal === null) {
                return false;
            }
            var accountBalance = parseInt(bal, 10);
            var curr = this._api.skypeOutBalanceCurrency;
            if (curr === null) {
                return false;
            }
            var freeCall = (typeof curr == "string" && curr.toLowerCase() == "freecall");
            Skype.Ads.Utils.logADT("USER-PROP: Account Balance: " + accountBalance);
            Skype.Ads.Utils.logADT("USER-PROP: Currency: " + curr);
            return accountBalance > 0 && !freeCall;
        },
        
        
        
        
        
        
        
        _hasActiveSubscriptions: function () {
            if (!this._api) {
                return false;
            }
            var subs = this._api.subscriptions;
            if (subs === null) {
                return false;
            }

            var subscriptionsCount = subs.length,
                subscriptionsActive = 0;
            
            if (subscriptionsCount === 0) {
                Skype.Ads.Utils.logADT("User has no active subscriptions");
                return false;
            }
            var now = Date.now().valueOf() / 1000;
            for (var i = 0; i < subscriptionsCount; i++) {
                if (subs[i].hasOwnProperty("status")) {
                    if (subs[i].status !== 1) {
                        
                        if (subs[i].hasOwnProperty("endDate")) {
                            if (subs[i].endDate > now) {
                                subscriptionsActive++;
                                Skype.Ads.Utils.logADT("Has subscription name: + " + subs[i].name + " with status: " + subs[i].status + " but doesn't expire until: " + subs[i].endDate + ", counting as active subscription");
                                continue;
                            }
                        }
                        Skype.Ads.Utils.logADT("Subscription " + subs[i].name + " is not active");
                    } else {
                        
                        subscriptionsActive++;
                        Skype.Ads.Utils.logADT("Subscription " + subs[i].name + " is active");
                    }                       
                }
            }
            return subscriptionsActive > 0;
        },
    }, {
        
    });

    
    PaidUserLogic = WinJS.Class.mix(PaidUserLogic, WinJS.Utilities.eventMixin);

    WinJS.Namespace.define("Skype.Ads", {
        PaidUserLogic: PaidUserLogic
    });

}());

(function () {
    "use strict";

    
    var SkypeAPI = WinJS.Class.define(function () {

        this._prevUiLang = null;
        this._isoLang = null;
        this._langList = null;
        this._skypeName = null;
        this._requests = [];
        
        if (lib && lib.account) {
            this._onAccountChangeHandler = function (event) {
                if (event && event.detail && event.detail.length) {
                    var property = event.detail[0];
                    if (property === this._propertyMap["skypeOutBalance"] ||
                        property === this._propertyMap["skypeOutBalanceCurrency"] ||
                        property === this._propertyMap["subscriptions"]) {
                        this.dispatchEvent("AccountPropsForPaidUserChanged");
                    }
                }
            }.bind(this);
            lib.account.addEventListener("propertychange", this._onAccountChangeHandler);

            
            this._onAuthTokenResultHandler = function (e) {
                var success = e.detail[0];
                var requestId = e.detail[1];
                var token = e.detail[2];

                Skype.Ads.Utils.logADT("onauthtokenresult called, success=" + success + ", requestId=" + requestId + ", token=" + token);

                
                var i;
                for (i = 0; i < this._requests.length ; i++) {
                    if (this._requests[i].requestId === requestId) {
                        if (success) {
                            this._requests[i].callback(token);
                        } else {
                            this._requests[i].callback(""); 
                        }

                        
                        clearTimeout(this._requests[i].timeoutId);

                        this._requests.splice(i, 1); 
                        break;
                    }
                }
            }.bind(this);
            lib.addEventListener("authtokenresult", this._onAuthTokenResultHandler);

            this._onLogoutHandler = function (e) {
                for (var i = 0; i < this._requests.length ; i++) {
                    clearTimeout(this._requests[i].timeoutId);
                }
                this._requests = [];
            }.bind(this);
            lib.addEventListener("logout", this._onLogoutHandler);

        } else {
            Skype.Ads.Utils.logADT("skype lib not available");
        }
    }, {
        
        shutdown: function () {
            if (this.onAccountChangeHandler && lib && lib.account) {
                lib.account.removeEventListener("propertychange", this._onAccountChangeHandler);
            }
            if (this._onAuthTokenResultHandler && lib) {
                lib.removeEventListener("authtokenresult", this._onAuthTokenResultHandler);
            }
            if (this._onLogoutHandler && lib) {
                lib.removeEventListener("logout", this._onLogoutHandler);
            }
        },

        _account: {
            get: function () {
                return lib.account;
            }
        },

        language: {
            get: function () {
                if (!this._isLibOK) {
                    return null;
                }

                
                var uiLang = Windows.Globalization.ApplicationLanguages.languages[0];
                
                if (!this._isoLang || this._prevUiLang !== uiLang) {
                    this._prevUiLang = uiLang;

                    
                    var isEnglishBasedLang = (uiLang.indexOf('en-', 0) !== -1) || (uiLang.indexOf('EN-', 0) !== -1);
                    this._isoLang = Skype.Globalization.mapBCP47toSkypeIsoLang(uiLang);

                    
                    
                    
                    if (!isEnglishBasedLang && this._isoLang === 'en') {
                        this._isoLang = uiLang;
                    }
                }

                return this._isoLang;
            }
        },
        
        isValidLang: function (skypeIsoLang) {
            if (!this._isLibOK) {
                return false;
            }

            
            if (!this._langList) {
                this._langList = new LibWrap.VectGIString();
                lib.getSupportedUILanguageList(this._langList);
            }

            
            var isValid = false;
            for (var i = 0; i < this._langList.getCount() ; i++) {
                if (skypeIsoLang == this._langList.get(i)) {
                    return true;
                }
            }

            return false;
        },
        
        
        
        
        
        
        
        
        

        
        
        
        
        
        
        skypeOutBalance: {
            get: function () {
                if (!this._isLibOK) {
                    return null;
                }

                return this._account.getIntProperty(this._propertyMap["skypeOutBalance"]);
            }
        },
        skypeOutBalanceCurrency: {
            get: function () {
                if (!this._isLibOK) {
                    return null;
                }

                return this._account.getStrProperty(this._propertyMap["skypeOutBalanceCurrency"]);
            }
        },
        
        subscriptions: {
            get: function () {
                if (!this._isLibOK) {
                    return null;
                }

                var ssName = new LibWrap.VectGIString;
                var ssTime = new LibWrap.VectUnsignedInt;
                var ssStatus = new LibWrap.VectUnsignedInt;
                var ssPackage = new LibWrap.VectUnsignedInt;
                var ssService = new LibWrap.VectUnsignedInt;
                this._account.getSubscriptionInfo(ssName, ssTime, ssStatus, ssPackage, ssService);
                var total = ssName.getCount();
                var subscriptions = [];
                for (var i = 0; i < total; i++) {
                    subscriptions.push({ name: ssName.get(i), status: ssStatus.get(i), endDate: ssTime.get(i) });
                }
                return subscriptions;
            }
        },
        allowAds: {
            get: function () {
                if (!this._isLibOK) {
                    return false;
                }

                var netBandWidthOk = lib.getIntLibProp(this._propertyMap["netBW"]);
                var cpuOk = lib.getIntLibProp(this._propertyMap["cpu"]);
                return netBandWidthOk & cpuOk;
            }
        },
        _isLibOK: {
            get: function () {
                if (!lib || !lib.account || !LibWrap) {
                    return false;
                } else {
                    return true;
                }
            }
        },

        skypeName: {
            get: function () {
                if (!this._isLibOK) {
                    return null;
                }

                if (!lib.myself) {
                    return null;
                }

                if (this._skypeName) {
                    return this._skypeName;
                }

                this._skypeName = lib.myself.getStrProperty(this._propertyMap["skypeName"]);
                if (this._skypeName) {
                    var isLiveId = (this._skypeName.indexOf("live:") === 0);
                    if (!isLiveId) {
                        this._skypeName = "skypeid:" + this._skypeName;
                    }
                }
                return this._skypeName;
            }
        },
        _propertyMap: {
            skypeOutBalance: LibWrap.PROPKEY.account_SKYPEOUT_BALANCE,
            skypeOutBalanceCurrency: LibWrap.PROPKEY.account_SKYPEOUT_BALANCE_CURRENCY,
            subscriptions: LibWrap.PROPKEY.account_SUBSCRIPTIONS,
            country: LibWrap.PROPKEY.contact_IPCOUNTRY,
            netBW: LibWrap.WrSkyLib.libprop_LIBPROP_AD_ALLOWED_BASIC,
            cpu: LibWrap.WrSkyLib.libprop_LIBPROP_AD_ALLOWED_RICH,
            skypeName: LibWrap.PROPKEY.contact_SKYPENAME
            
        },

        requestToken: function (callback) {
            var REQUEST_TIMEOUT = 5e3; 
            var requestId = lib.requestSSOToken();
            Skype.Ads.Utils.logADT('SSO token requested, requestId = ' + requestId);

            var timeoutId = setTimeout(function () {
                Skype.Ads.Utils.logADT('SSO token request timeout, requestId = ' + requestId);
                
                for (var i = 0; i < this._requests.length ; i++) {
                    if (this._requests[i].requestId === requestId) {
                        this._requests[i].callback(""); 
                        this._requests.splice(i, 1); 
                        break;
                    }
                }
            }.bind(this), REQUEST_TIMEOUT);

            var request = { requestId: requestId, callback: callback, timeoutId: timeoutId };
            this._requests.push(request);
        }
    }, {
        
        skypeVersion: {
            get: function () {
                return Skype.Version.skypeVersion;
            }
        }
    });

    
    SkypeAPI = WinJS.Class.mix(SkypeAPI, WinJS.Utilities.eventMixin);

    WinJS.Namespace.define("Skype.Ads", {
        SkypeAPI: SkypeAPI
    });
}());

(function () {
    "use strict";
    
    var Logger = WinJS.Class.define(function () {
        
        
        this._buffer = [];
        this._lastSendTime = Date.now(); 
        this._timer = null;
        this._connectionStatus = null; 
        this._numDroppedEvents = 0; 

        Skype.Ads.connectivityStatusInstance.addEventListener("onConnectivityStatusChanged", function (evt) {
            
            if (evt) {
                this.connectionStatusUpdate(evt.detail);
            }
        }.bind(this));
    }, {
        

        

        
        logEvent: function (eventModel) {
            if (eventModel) {
                var msg = eventModel.getEventData();
                this._addEventToBuffer(msg);
                this._messagingMonitorAlgo(false);
            }
        },

        
        connectionStatusUpdate: function (status) {
            if (typeof (status) !== 'boolean') {
                return;
            }
            var isDiff = (this._connectionStatus !== status);
            this._connectionStatus = status;
            if (status && isDiff) {
                this._messagingMonitorAlgo(false);
            }
        },

        
        
        flushBuffer: function () {
            return this._messagingMonitorAlgo(true);
        },

        
        _addEventsBackToBuffer: function (arrayOfEvents) {
            this._buffer = arrayOfEvents.concat(this._buffer);
            if (this._buffer.length > this._maxBufferSize) {
                
                var numToDrop = this._buffer.length - this._maxBufferSize;
                this._numDroppedEvents += numToDrop;
                this._buffer.splice(this._buffer.length - numToDrop, numToDrop); 
                Skype.Ads.Utils.logADT("tracking buffer full, dropping " + numToDrop + " events");
            }
        },
        _addEventToBuffer: function (event) {
            if (this._buffer.length < this._maxBufferSize) {
                this._buffer.push(event);
            } else {
                this._numDroppedEvents++;
                Skype.Ads.Utils.logADT("tracking buffer full, dropping one event");
            }
        },
        
        _sendThreshold : {
            get: function() {
                var sendThresholdMinsDefault = 5; 
                var trackingParams = this._getTrackingParameters();
                var v = trackingParams && trackingParams.sendThresholdMins || sendThresholdMinsDefault;
                return v * 60 * 1000; 
            }
        },
        _maxBufferSize : {
            get: function() {
                var maxBufferSizeDefault = this._bufferThreshold * 2; 
                var trackingParams = this._getTrackingParameters();
                return trackingParams && trackingParams.maxBufferSize || maxBufferSizeDefault;
            }
        },
        _bufferThreshold: {
            get: function () {
                var bufferThresholdDefault = 10; 
                var trackingParams = this._getTrackingParameters();
                return trackingParams && trackingParams.bufferThreshold || bufferThresholdDefault;
            }
        },
        _dataCollectorUrl: {
            get: function () {
                
                var dataCollectorUrlDefault;

///<disable>JS3059</disable>
                dataCollectorUrlDefault = "https://pipe.skype.com/Client/2.0/"; 
                var adLogic = this._getAdLogic();
                return adLogic && adLogic.dataCollectorUrl || dataCollectorUrlDefault;
            }
        },
        _getTrackingParameters: function () {
            var adLogic = this._getAdLogic();
            return adLogic && adLogic.trackingParameters;
        },
        _getAdLogic: function () {
            var adLogicInstance = Skype.Ads.adLogicInstance();
            return adLogicInstance && adLogicInstance.getAdLogic();
        },

        
        _messagingMonitorAlgo: function (forceFlush) {
            if (this._buffer.length <= 0) {
                this._cancelTimer();
                return WinJS.Promise.wrap(null);
            }

            
            if (this._connectionStatus == null) {
                this._connectionStatus = Skype.Ads.connectivityStatusInstance.isConnected;
            }
            if (!this._connectionStatus) {
                this._cancelTimer();
                return WinJS.Promise.wrap(null);
            }

            if (forceFlush || 
                (Date.now() - this._lastSendTime > this._sendThreshold) ||
                (this._buffer.length >= this._bufferThreshold)) {
                this._cancelTimer();
                return this._sendDataCommand();
            }

            
            this._startTimer();
            return WinJS.Promise.wrap(null);
        },

        _startTimer: function () {
            
            if (this._timer == null) {
                this._timer = setTimeout(function () {
                    this._messagingMonitorAlgo(true);
                }.bind(this), this._sendThreshold);
            }
        },
        _cancelTimer: function () {
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }
        },

        
        _sendDataCommand: function () {
            var backupBuffer = this._buffer;
            this._buffer = [];

            var numDroppedEvents = this._numDroppedEvents;
            var data = {};
            data.data_package_id = Skype.Ads.Utils.getGuid();
            var version = Skype.Ads.SkypeAPI.skypeVersion;
            if (version) {
                data.version = version;
            }
            data.timestamp = new Date().getTime();
            data.source = "ADTTracking";
            data.schema = 2;
            data.records = backupBuffer;

            
            if (data.records.length > 0 && data.records[0].extension) {
                data.records[0].extension.messageLoss = this._numDroppedEvents;
            }

            return WinJS.Promise.timeout(5000, WinJS.xhr({
                url: this._dataCollectorUrl,
                responseType: "json",
                headers: {
                    "content-type": "application/json"
                },
                type: "POST",
                data: JSON.stringify(data)
            }).then(
                function complete(request) {
                    this._lastSendTime = Date.now();
                    
                    this._numDroppedEvents -= numDroppedEvents;
                    if (this._numDroppedEvents < 0) {
                        this._numDroppedEvents = 0;
                    }
                }.bind(this),
                function error(request) {
                    this._addEventsBackToBuffer(backupBuffer);
                    this._startTimer();
                }.bind(this)
            ));
        }

    }, {
        
    });

    
    var loggerInstance;

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    WinJS.Namespace.define("Skype.Ads", {


        track: function (eventModel) {

            if (!loggerInstance) {
                
                loggerInstance = new Logger();
            }
            
            loggerInstance.logEvent(eventModel);

        }
    });

}());

