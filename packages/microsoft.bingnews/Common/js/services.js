/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', { Version: 'latest' });
(function appexPlatformObjectExtensionsInit() {
    'use strict';
    var e = WinJS.Promise.wrapError();
    var d = Object.getPrototypeOf(e).done;
    Object.getPrototypeOf(e).done = function (c, e, p) {
        e = e || function _services_19(v) {
            if (!(v instanceof Error)) {
                var description;
                try {
                    description = JSON.stringify(v)
                }
                catch (e) {
                    description = "[unknown]"
                }
                v = {
                    number: 0, stack: "", description: description
                }
            }
            else if (v.name === "Canceled") {
                return
            }
            WinJS.Application.queueEvent({
                type: "error", detail: v
            })
        };
        d.call(this, c, e, p)
    };
    var c = WinJS.Promise.wrap();
    Object.getPrototypeOf(c).done = function (c) {
        this.then(c).then(null, function _services_40(v) {
            if ((v instanceof Error) && (v.name === "Canceled")) {
                return
            }
            var errorDescription;
            try {
                errorDescription = JSON.stringify(v)
            }
            catch (e) {
                errorDescription = "[unknown]"
            }
            debugger;
            var T = Microsoft.Bing.AppEx.Telemetry;
            T.FlightRecorder.logCrash(T.LogLevel.critical, T.RuntimeEnvironment.javascript, errorDescription, null);
            T.FlightRecorder.uploadNow(true);
            Platform.Process.exitApplication("Services.js last chance error handling for WinJS.Promise.done : " + errorDescription)
        })
    }
})();
(function appexWinJSNavigationWrapperInit() {
    "use strict";
    var navigate = WinJS.Navigation.navigate;
    var navPlatformInitializingUi = function () { };
    var navRemovePlatformInitializingUi = function () { };
    var isFirstNav = true;
    var appInitializationComplete = false;
    var lastDelayedNavigation = null;
    var navPromiseSet = false;
    var navPromise = function () {
        navPromiseSet = true;
        PlatformJS.platformInitializedPromise.then(function PlatformInitNavigation() {
            return PlatformJS.applicationInitializationDelegate()
        }).then(function appInitNavigation() {
            appInitializationComplete = true;
            if (lastDelayedNavigation) {
                lastDelayedNavigation();
                lastDelayedNavigation = null;
                navRemovePlatformInitializingUi()
            }
            WinJS.Navigation.navigate = navigate
        })
    };
    var deferredNavigate = function (location, initialState) {
        if (!appInitializationComplete && !isFirstNav) {
            navPlatformInitializingUi();
            lastDelayedNavigation = function _deferral() {
                navigate(location, initialState)
            };
            if (!navPromiseSet) {
                navPromise()
            }
        }
        else {
            isFirstNav = false;
            navigate(location, initialState)
        }
    };
    WinJS.Navigation.navigate = deferredNavigate;
    WinJS.Namespace.define("PlatformJS", {
        execDeferredNavigate: function execDeferredNavigate(delegate) {
            if (!delegate || typeof delegate !== 'function') {
                return
            }
            if (appInitializationComplete) {
                lastDelayedNavigation = null;
                delegate()
            }
            else {
                lastDelayedNavigation = delegate;
                if (!navPromiseSet) {
                    navPromise()
                }
            }
        }
    })
})();
(function appexPlatformProcessManagerInit() {
    "use strict";
    var _platformInitializedCompletionFunction = null;
    WinJS.Namespace.define("PlatformJS", {
        DataService: {}, mainProcessManager: null, modernPerfTrack: null, isDebug: false, isProdBuild: true, _launchedLanguage: null, isPlatformInitialized: false, _bootCompletePromise: null, isAppBootComplete: false, isWarmBoot: false, isFlightingEnabled: true, shouldClearState: false, _performTestGC: null, applicationInitializationDelegate: function applicationInitializationDelegate() {
            return WinJS.Promise.wrap(null)
        }, platformInitializedPromise: new WinJS.Promise(function _services_179(complete) {
            _platformInitializedCompletionFunction = complete
        }), _deferredTelemetryEvents: [], deferredTelemetry: function deferredTelemetry(delegate) {
            if (!delegate || typeof delegate !== 'function') {
                return
            }
            if (!PlatformJS.isPlatformInitialized || this._deferredTelemetryEvents.length > 0) {
                this._deferredTelemetryEvents.push(delegate)
            }
            else {
                delegate()
            }
        }, performTestModeGC: function performTestModeGC() {
            if (this._performTestGC === null) {
                if (Windows.Storage.ApplicationData.current.localSettings.values.hasKey("PerformTestGC") && Windows.Storage.ApplicationData.current.localSettings.values["PerformTestGC"] === true) {
                    this._performTestGC = true
                }
                else {
                    this._performTestGC = false
                }
            }
            if (this._performTestGC) {
                CollectGarbage();
                if (PlatformJS.isPlatformInitialized) {
                    Platform.Process.collect()
                }
            }
        }, perfTrackScenario_Launch: 1444, perfTrackScenario_Launch_AppInitialization: 1675, perfTrackScenario_Launch_MarketOverride: 1676, perfTrackScenario_Launch_ServiceInitialization: 1677, perfTrackScenario_Launch_NavigationInitialization: 1678, perfTrackScenario_Launch_PlatformActivation: 1679, perfTrackScenario_Launch_LoadPage: 1680, perfTrackScenario_Launch_PopulatePage: 1681, perfTrackScenario_Launch_Realization: 1682, perfTrackScenario_PanoramaVisibleClustersLoaded: 1446, perfTrackScenario_PageLoaded: 1537, perfTrackScenario_TimeToRefresh: 1591, perfTrackScenario_Panorama360Loaded: 1636, PerfTrackLoggerStub: WinJS.Class.define(function perfTrackLoggerStub_ctor() { }, {
            dataUploadEnabled: false, disableDataUpload: function disableDataUpload() { }, enableDataUpload: function enableDataUpload() { }, writeStartEvent: function writeStartEvent(scenarioId, scenarioName, matchKey) { }, writeStopEvent: function writeStopEvent(scenarioId, scenarioName, matchKey) { }, writeStopEventWithMetadata: function writeStopEventWithMetadata(scenarioId, scenarioName, matchKey, dword1, dword2, dword3, dword4, dword5, string1, string2) { }, writeLaunchStopEvent: function writeLaunchStopEvent(timePoint, activationKind) { }, writeResizeStopEvent: function writeResizeStopEvent(timePoint, isMajorChange, isRotation, width, height) { }, writeResumeStopEvent: function writeResumeStopEvent(timePoint) { }, writeTriggerEvent: function writeTriggerEvent(scenarioId, scenarioName, duration) { }, writeTriggerEventWithMetadata: function writeTriggerEventWithMetadata(scenarioId, scenarioName, duration, dword1, dword2, dword3, dword4, dword5, string1, string2) { }
        }), ModernPerfTrack: WinJS.Class.define(function modernPerfTrack_ctor() {
            this.stageTimestamps = [];
            this.stageNames = [];
            try {
                this._perfTrackLogger = new Microsoft.PerfTrack.PerfTrackLogger(Microsoft.PerfTrack.PerfTrackLogger.windowsDataUploadEnabled)
            }
            catch (e) {
                this._perfTrackLogger = new PlatformJS.PerfTrackLoggerStub;
                debugger
            }
            try {
                this.appName = Windows.ApplicationModel.Package.current.id.name
            }
            catch (e) {
                this.appName = "";
                debugger
            }
        }, {
            _perfTrackLogger: null, appName: null, launchFlags: 0, launchDetails: 0, activationDetails: 0, activationArguments: "", isLaunchFinished: false, stageTimestamps: null, stageNames: null, writeStartEvent: function writeStartEvent(scenarioId, scenarioName, matchKey) {
                this._perfTrackLogger.writeStartEvent(scenarioId, scenarioName, matchKey)
            }, writeStopEventWithMetadata: function writeStopEventWithMetadata(scenarioId, scenarioName, matchKey, matchKeyAsMetadata) {
                var metadata = matchKeyAsMetadata ? matchKey : "";
                var market = PlatformJS.Utilities.Globalization.getCurrentMarket();
                this._perfTrackLogger.writeStopEventWithMetadata(scenarioId, scenarioName, matchKey, 0, 0, 0, 0, 0, metadata, market)
            }, writeStopEventWithFlagsAndMetadata: function writeStopEventWithFlagsAndMetadata(scenarioId, scenarioName, matchKey, flag1, flag2, flag3, flag4, flag5, metadataString1, metadataString2) {
                this._perfTrackLogger.writeStopEventWithMetadata(scenarioId, scenarioName, matchKey, flag1, flag2, flag3, flag4, flag5, metadataString1, metadataString2)
            }, writeLaunchStageStartEvent: function writeLaunchStageStartEvent(scenarioId, scenarioName) {
                if (!this.isLaunchFinished) {
                    this._perfTrackLogger.writeStartEvent(scenarioId, scenarioName, this.appName)
                }
            }, writeLaunchStageStopEvent: function writeLaunchStageStopEvent(scenarioId, scenarioName) {
                if (!this.isLaunchFinished) {
                    var market = PlatformJS.Utilities.Globalization.getCurrentMarket();
                    this._perfTrackLogger.writeStopEventWithMetadata(scenarioId, scenarioName, this.appName, this.launchFlags, this.launchDetails, this.activationDetails, 0, 0, market, "")
                }
            }, writeLaunchStopEvent: function writeLaunchStopEvent(timePoint, activationKind) {
                this._perfTrackLogger.writeLaunchStopEvent(timePoint, activationKind)
            }, writeResizeStopEvent: function writeResizeStopEvent(timePoint, isMajorChange, isRotation, width, height) {
                this._perfTrackLogger.writeResizeStopEvent(timePoint, isMajorChange, isRotation, width, height)
            }, writeResumeStopEvent: function writeResumeStopEvent(timePoint) {
                this._perfTrackLogger.writeResumeStopEvent(timePoint)
            }, addStage: function addStage(stageName) {
                if (!this.isLaunchFinished) {
                    this.stageTimestamps.push(Date.now());
                    this.stageNames.push(stageName)
                }
            }, getLaunchStageTimingString: function getLaunchStageTimingString() {
                var result = "";
                if (!this.isLaunchFinished) {
                    var length = Math.min(this.stageNames.length, this.stageTimestamps.length);
                    if (length > 1) {
                        var stages = [];
                        var prevTimestamp = this.stageTimestamps[0];
                        for (var i = 1; i < length; i++) {
                            var currentTimestamp = this.stageTimestamps[i];
                            stages.push(this.stageNames[i] + ":" + (currentTimestamp - prevTimestamp));
                            prevTimestamp = currentTimestamp
                        }
                        result = stages.join()
                    }
                    this.isLaunchFinished = true;
                    this.stageTimestamps = [];
                    this.stageNames = []
                }
                return result
            }
        }), _platformInitializationStarted: false, _beginPlatformInitialization: function _beginPlatformInitialization() {
            this._startPlatformInitialization();
            PlatformJS.BootCache.instance.saveCacheToDisk().then(function setWarmbootReady(succeeded) {
                Windows.Storage.ApplicationData.current.localSettings.values["warmBootReady"] = succeeded
            })
        }, startPlatformInitialization: function startPlatformInitialization() {
            if (!this._platformInitializationStarted) {
                PlatformJS.isWarmBoot = false;
                PlatformJS.modernPerfTrack.launchDetails |= (1 << 8);
                msWriteProfilerMark("AppLaunch: Forced Platform initialization: caused either by app code or protocol activation");
                this._startPlatformInitialization()
            }
        }, _startPlatformInitialization: function _startPlatformInitialization() {
            if (!this._platformInitializationStarted) {
                this.mainProcessManager._initializeServicePhaseTwo(true)
            }
        }, _isPrelaunched: false, isPrelaunched: {
            get: function get() {
                return this._isPrelaunched
            }, set: function set(value) {
                this._isPrelaunched = value;
                Platform.Process.isPrelaunched = value
            }
        }, ProcessManager: WinJS.Class.define(function processManager_ctor() {
            var orientationSensor = null,
                that = this;
            this._dirtyShutdownCountAtLaunch = Windows.Storage.ApplicationData.current.localSettings.values["Platform_DirtyShutdownCount"];
            this._previousBootSuccessValueAtLaunch = Windows.Storage.ApplicationData.current.localSettings.values[this._previousBootSuccessKey];
            var shouldInitializePlatform = this._shouldInitializePlatform();
            this._processListeners = [];
            PlatformJS.Collections = function () {
                if (shouldInitializePlatform) {
                    return Platform.ServicesAccessor.collections
                }
                else {
                    return {}
                }
            }();
            PlatformJS.Services = function () {
                if (shouldInitializePlatform) {
                    return Platform.ServicesAccessor
                }
                else {
                    return {
                        process: {
                            onInitialize: function onInitialize() {
                                throw new Error("invalid call to onInitialize during warmboot");
                            }, onBeforeNavigate: function onBeforeNavigate() {
                                if (!PlatformJS.isProdBuild) {
                                    throw new Error("invalid call to onBeforeNavigate during warmboot");
                                }
                            }, onAfterNavigate: function onAfterNavigate() {
                                if (!PlatformJS.isProdBuild) {
                                    throw new Error("invalid call to onAfterNavigate during warmboot");
                                }
                            }, onActivate: function onActivate() {
                                PlatformJS.platformInitializedPromise.then(function _services_444() {
                                    Platform.ServicesAccessor.process.onActivate()
                                })
                            }, onCheckpointAsync: function onCheckpointAsync() {
                                if (!PlatformJS.isProdBuild) {
                                    throw new Error("invalid call to onCheckpointAsync during warmboot");
                                }
                                return WinJS.Promise.wrap(null)
                            }, onVisibilityChange: function onVisibilityChange(hidden) {
                                if (!PlatformJS.isProdBuild) {
                                    throw new Error("invalid call to onVisibilityChange during warmboot");
                                }
                            }, startPostActivateWork: function startPostActivateWork() {
                                if (!PlatformJS.isProdBuild) {
                                    throw new Error("invalid call to startPostActivateWork during warmboot");
                                }
                            }
                        }, manifest: {
                            instrumentationMapping: {
                                hasKey: function hasKey() {
                                    return false
                                }
                            }
                        }, resourceLoader: function resourceLoader() {
                            return new Windows.ApplicationModel.Resources.ResourceLoader("Resources")
                        }(), platformEventSource: {
                            processActivateStart: function processActivateStart() { }, processActivateStop: function processActivateStop() { }, processCheckpointStart: function processCheckpointStart() { }, processCheckpointStop: function processCheckpointStop() { }
                        }
                    }
                }
            }();
            PlatformJS.isWarmBoot = !shouldInitializePlatform;
            if (!shouldInitializePlatform) {
                this._setPrimaryLanguage()
            }
            this._initializeService(shouldInitializePlatform)
        }, {
            _activated: false, _isSuspended: false, _initializeCompletionCalled: false, _checkPointTimer: null, _processListeners: null, _crashReporter: null, _currentViewState: null, _previousBootSuccessKey: "App.previousBootSuccess", _isRecoverModeValue: null, _isLanguageOrLocationChanged: null, _nonActivationAppLaunchEvent: null, _previousBootSuccessValueAtLaunch: false, _dirtyShutdownCountAtLaunch: 0, isSemanticZoomFinished: false, _windowSizeManager: null, _dpiChangeManager: null, _postActiveComplete: null, searchTileArguments: null, _retailModeEnabled: null, retailModeEnabled: {
                get: function get() {
                    if (this._retailModeEnabled === null) {
                        this._retailModeEnabled = false;
                        if (Windows.Storage.ApplicationData.current.localSettings.values.hasKey("Platform_RetailMode")) {
                            this._retailModeEnabled = Windows.Storage.ApplicationData.current.localSettings.values["Platform_RetailMode"]
                        }
                    }
                    return this._retailModeEnabled
                }, set: function set(value) {
                    this._retailModeEnabled = value;
                    Windows.Storage.ApplicationData.current.localSettings.values["Platform_RetailMode"] = value
                }
            }, showSettings: function showSettings() {
                for (var i = 0; i < this._processListeners.length; i++) {
                    if (this._processListeners[i].showSettings) {
                        this._processListeners[i].showSettings();
                        break
                    }
                }
            }, isRecoverMode: function isRecoverMode() {
                if (this._isRecoverModeValue === null) {
                    if (PlatformJS.isDebug) {
                        this._isRecoverModeValue = false
                    }
                    else {
                        var dirtyShutdownCount = Windows.Storage.ApplicationData.current.localSettings.values["Platform_DirtyShutdownCount"];
                        var recoverModeTriggerCount = 3;
                        this._isRecoverModeValue = dirtyShutdownCount && (dirtyShutdownCount >= recoverModeTriggerCount)
                    }
                }
                return this._isRecoverModeValue
            }, _setPrimaryLanguage: function _setPrimaryLanguage() {
                var overrideLanguageOnResume = Windows.Storage.ApplicationData.current.localSettings.values["Platform_PrimaryLanguageOverrideOnResume"];
                if (overrideLanguageOnResume) {
                    Windows.Globalization.ApplicationLanguages.primaryLanguageOverride = overrideLanguageOnResume
                }
            }, _getAppVersionString: function _getAppVersionString() {
                var version = Windows.ApplicationModel.Package.current.id.version;
                if (version) {
                    return version.major + "." + version.minor + "." + version.build + "." + version.revision
                }
            }, isVersionUpdate: function isVersionUpdate() {
                var isVersionUpdate = false;
                var currentAppVersion = this._getAppVersionString();
                var lastKnownCurrentVersion = Windows.Storage.ApplicationData.current.localSettings.values["currentAppVersion"];
                if (currentAppVersion && lastKnownCurrentVersion) {
                    var currentVersionSplit = currentAppVersion.split(".");
                    var lastKnownVersionSplit = lastKnownCurrentVersion.split(".");
                    if (currentVersionSplit && lastKnownVersionSplit && currentVersionSplit.length === lastKnownVersionSplit.length) {
                        for (var i = 0; i < currentVersionSplit.length; i++) {
                            if (parseInt(currentVersionSplit[i]) > parseInt(lastKnownVersionSplit[i])) {
                                isVersionUpdate = true;
                                break
                            }
                        }
                    }
                }
                return isVersionUpdate
            }, _shouldInitializePlatform: function _shouldInitializePlatform() {
                var initializePlatform = true;
                var delayPlatformInitialization = Windows.Storage.ApplicationData.current.localSettings.values["delayPlatformInitialization"] === true;
                var previousBootSuccess = this._previousBootSuccessValueAtLaunch === true;
                this._isLanguageOrLocationChanged = !this.retailModeEnabled && !PlatformJS.Utilities.Globalization.isSavedLanguageAndLocationSame();
                var resetHistory = Windows.Storage.ApplicationData.current.localSettings.values["platform_resetHistory"] === true;
                var isRecoverMode = this.isRecoverMode();
                var hasPendingConfigurationUpdate = Windows.Storage.ApplicationData.current.localSettings.values["Platform_ConfigHasPendingUpdate"] === true;
                var isVersionUpdate = this.isVersionUpdate();
                var clearState = resetHistory || this._isLanguageOrLocationChanged || !previousBootSuccess || isRecoverMode || hasPendingConfigurationUpdate || isVersionUpdate;
                if (clearState) {
                    PlatformJS.shouldClearState = true;
                    this.resetBootCacheAsync();
                    msWriteProfilerMark("Platform:BootCachePurgedOnBoot")
                }
                var warmBootReady = Windows.Storage.ApplicationData.current.localSettings.values["warmBootReady"] === true;
                if (warmBootReady && delayPlatformInitialization && !clearState) {
                    initializePlatform = false
                }
                Windows.Storage.ApplicationData.current.localSettings.values[this._previousBootSuccessKey] = false;
                var log = "AppLaunch:: IsWarmBoot:{0} ResetHistory:{1} IsLanguageOrLocationChanged:{2} PreviousBootSuccess:{3} IsRecoverMode:{4} HasPendingConfigUpdate:{5} IsVersionUpdate:{6}";
                msWriteProfilerMark(log.format(!initializePlatform, resetHistory, this._isLanguageOrLocationChanged, previousBootSuccess, isRecoverMode, hasPendingConfigurationUpdate, isVersionUpdate));
                var isFREDone = Windows.Storage.ApplicationData.current.localSettings.values.hasKey("FREDone") === true;
                PlatformJS.modernPerfTrack.launchFlags = PlatformJS.shouldClearState + (isFREDone << 1) + ((!initializePlatform) << 2);
                PlatformJS.modernPerfTrack.launchDetails = delayPlatformInitialization + (previousBootSuccess << 1) + (this._isLanguageOrLocationChanged << 2) + (resetHistory << 3) + (isRecoverMode << 4) + (hasPendingConfigurationUpdate << 5) + (isVersionUpdate << 6) + (warmBootReady << 7);
                return initializePlatform
            }, _initializeServicePhaseTwo: function _initializeServicePhaseTwo(shouldInitializePlatform) {
                if (PlatformJS._platformInitializationStarted) {
                    return
                }
                var that = this;
                this._bootCompletePromise = PlatformJS.BootCache.instance.initializeAsync().then(function _services_651(cacheParseSuccess) {
                    if (shouldInitializePlatform || !cacheParseSuccess) {
                        if (!cacheParseSuccess) {
                            that.resetBootCacheAsync();
                            PlatformJS.isWarmBoot = false
                        }
                        if (typeof Platform.Configuration === "undefined") {
                            Platform.Configuration = Microsoft.Bing.AppEx.ClientPlatform.Configuration
                        }
                        if (typeof Platform.Globalization === "undefined") {
                            Platform.Globalization = Microsoft.Bing.AppEx.ClientPlatform.Globalization
                        }
                        if (typeof Platform.Resources === "undefined") {
                            Platform.Resources = Microsoft.Bing.AppEx.ClientPlatform.Resources
                        }
                        PlatformJS.Services = Platform.ServicesAccessor;
                        PlatformJS.Collections = Platform.ServicesAccessor.collections;
                        PlatformJS._platformInitializationStarted = true;
                        that._initializeSqliteAsync().then(function completed() { }, function error() { });
                        WinJS.Navigation.addEventListener("beforenavigate", function processManager_onBeforeNavigated(event) {
                            PlatformJS.Services.process.onBeforeNavigate();
                            that._errorShownByPlatform = false
                        });
                        WinJS.Navigation.addEventListener("navigated", function processManager_onNavigated(event) {
                            PlatformJS.Services.process.onAfterNavigate()
                        });
                        return PlatformJS.Services.process.onInitialize().then(function process_InitCompleted() {
                            that._beforePlatformInitialized();
                            PlatformJS.isPlatformInitialized = true;
                            that._initializeProcessListeners();
                            _platformInitializedCompletionFunction();
                            that._onPlatformInitialized();
                            return WinJS.Promise.wrap(null)
                        })
                    }
                    else {
                        return WinJS.Promise.wrap(null)
                    }
                })
            }, _initializeService: function _initializeService(shouldInitializePlatform) {
                var that = this;
                this._activated = false;
                this.processListeners = [];
                WinJS.Application.addEventListener("activated", function processManager_onActivated(event) {
                    that._onActivated(event)
                });
                this._windowSizeManager = new PlatformJS.WindowSizeManager;
                this._dpiChangeManager = new PlatformJS.DpiChangeManager;
                msWriteProfilerMark("Platform:MarketOverrides:s");
                if (!PlatformJS.modernPerfTrack.isLaunchFinished) {
                    PlatformJS.modernPerfTrack.addStage("AI");
                    PlatformJS.modernPerfTrack.writeLaunchStageStopEvent(PlatformJS.perfTrackScenario_Launch_AppInitialization, "App Initialization");
                    PlatformJS.modernPerfTrack.writeLaunchStageStartEvent(PlatformJS.perfTrackScenario_Launch_MarketOverride, "Market Override")
                }
                if (typeof AppexJS === "object") {
                    if (AppexJS.PreInitialize) {
                        if (AppexJS.PreInitialize.doMarketOverrides) {
                            var overrides = AppexJS.PreInitialize.doMarketOverrides();
                            if (overrides) {
                                if (!PlatformJS.isWarmBoot) {
                                    if (overrides.marketStringOverride) {
                                        PlatformJS.Utilities.Globalization.setCurrentMarket(overrides.marketStringOverride)
                                    }
                                    Platform.Globalization.Marketization.disablePrimaryLanguageOverride = overrides.disablePrimaryLanguageOverride
                                }
                            }
                        }
                    }
                }
                msWriteProfilerMark("Platform:MarketOverrides:e");
                if (!PlatformJS.modernPerfTrack.isLaunchFinished) {
                    PlatformJS.modernPerfTrack.addStage("MO");
                    PlatformJS.modernPerfTrack.writeLaunchStageStopEvent(PlatformJS.perfTrackScenario_Launch_MarketOverride, "Market Override");
                    PlatformJS.modernPerfTrack.writeLaunchStageStartEvent(PlatformJS.perfTrackScenario_Launch_ServiceInitialization, "Service Initialization")
                }
                this._initializeServicePhaseTwo(shouldInitializePlatform);
                this._launchedLanguage = PlatformJS.Utilities.Globalization.getQualifiedLanguageString()
            }, _initializeSqliteAsync: function _initializeSqliteAsync() {
                msWriteProfilerMark("Platform:initializeSqlite:s");
                return SqliteWrapper.SqliteCache.initializeAsync().then(function _services_791() {
                    msWriteProfilerMark("Platform:initializeSqlite:e")
                })
            }, _eventsRegister: null, _addListener: function _addListener(eventName, listener) {
                var result;
                if (listener) {
                    if (!this._eventsRegister) {
                        this._eventsRegister = {}
                    }
                    if (!this._eventsRegister[eventName]) {
                        this._eventsRegister[eventName] = new CommonJS.Utils.IdEntryCollection
                    }
                    result = this._eventsRegister[eventName].addEntry(listener)
                }
                return result
            }, _removeListener: function _removeListener(eventName, id) {
                var listeners = this._eventsRegister && this._eventsRegister[eventName];
                if (listeners) {
                    listeners.removeEntry(id)
                }
            }, _invokeListeners: function _invokeListeners(eventName, event) {
                var listeners = this._eventsRegister && this._eventsRegister[eventName];
                if (listeners) {
                    listeners.doForEach(function callEventListener(listener) {
                        if (listener) {
                            listener(event)
                        }
                    })
                }
            }, afterFirstView: function afterFirstView(event) {
                if (this._afterFirstView) {
                    this._afterFirstView(event)
                }
                this._invokeListeners("afterFirstView", event)
            }, addAfterFirstViewListener: function addAfterFirstViewListener(listener) {
                return this._addListener("afterFirstView", listener)
            }, removeAfterFirstViewListener: function removeAfterFirstViewListener(id) {
                this._removeListener("afterFirstView", id)
            }, _afterFirstView: function _afterFirstView(event) {
                this._afterFirstView = function (event) { };
                console.error("Platform:afterFirstView:s");
                msWriteProfilerMark("Platform:afterFirstView:s");
                CommonJS.Progress.canDestroySplash(true);
                CommonJS.Progress.destroySplash(true);
                PlatformJS.isAppBootComplete = true;
                PlatformJS._beginPlatformInitialization();
                var that = this;
                PlatformJS.platformInitializedPromise.then(function _fireAfterFirstViewHandlers() {
                    for (var i = 0, ilen = that._processListeners.length; i < ilen; i++) {
                        if (that._processListeners[i].afterFirstView) {
                            that._processListeners[i].afterFirstView(event)
                        }
                    }
                    Windows.Storage.ApplicationData.current.localSettings.values[that._previousBootSuccessKey] = true;
                    msWriteProfilerMark("Platform:afterFirstView:e")
                })
            }, prefetchEnd: function prefetchEnd(event) {
                this._invokeListeners("prefetchEnd", event)
            }, addPrefetchEndViewListener: function addPrefetchEndViewListener(listener) {
                return this._addListener("prefetchEnd", listener)
            }, removePrefetchEndViewListener: function removePrefetchEndViewListener(id) {
                this._removeListener("prefetchEnd", id)
            }, semanticZoomFinished: function semanticZoomFinished(event) {
                this.isSemanticZoomFinished = true;
                this._invokeListeners("semanticZoomFinished", event)
            }, addSemanticZoomFinishedListener: function addSemanticZoomFinishedListener(listener) {
                return this._addListener("semanticZoomFinished", listener)
            }, removeSemanticZoomFinishedListener: function removeSemanticZoomFinishedListener(id) {
                this._removeListener("semanticZoomFinished", id)
            }, adsClusterAdded: function adsClusterAdded(event) {
                this._invokeListeners("adsClusterAdded", event)
            }, addAdsClusterAddedListener: function addAdsClusterAddedListener(listener) {
                return this._addListener("adsClusterAdded", listener)
            }, removeAdsClusterAddedListener: function removeAdsClusterAddedListener(id) {
                this._removeListener("adsClusterAdded", id)
            }, _initializeProcessListeners: function _initializeProcessListeners() {
                if (this._processListeners.length === 0) {
                    var processListenersList = PlatformJS.BootCache.instance.getEntry("AppManifest.processListeners", function _services_888() {
                        var listeners = [];
                        for (var i = 0; i < PlatformJS.Services.manifest.processListeners.size; i++) {
                            listeners[i] = { name: PlatformJS.Services.manifest.processListeners[i].name }
                        }
                        return listeners
                    });
                    if (processListenersList && processListenersList.length) {
                        var processListener = null;
                        for (var i = 0; i < processListenersList.length; i++) {
                            processListener = PlatformJS.Utilities.createObject(processListenersList[i].name);
                            if (processListener) {
                                this._processListeners.push(processListener)
                            }
                        }
                    }
                    else {
                        console.error("Platform:_initializeProcessListeners: processListenersList should not be null.");
                        debugger
                    }
                    PlatformJS.Navigation.mainNavigator = new PlatformJS.Navigation.Navigator(this._processListeners);
                    this._processListeners.push(PlatformJS.Navigation.mainNavigator);
                    this._processListeners.push(new CommonJS.ProcessListener);
                    PlatformJS.Utilities.registerGlobalClickProxy()
                }
            }, _onCheckpoint: function _onCheckpoint(event) {
                var that = this;
                if (!that._isSuspended && PlatformJS.isPrelaunched) {
                    PlatformJS.isPrelaunched = false
                }
                event.setPromise(PlatformJS.platformInitializedPromise.then(function processCheckpoint() {
                    PlatformJS.Services.platformEventSource.processCheckpointStart();
                    for (var i = that._processListeners.length - 1; i >= 0; i--) {
                        if (that._processListeners[i].onCheckpoint) {
                            that._processListeners[i].onCheckpoint(event)
                        }
                    }
                    that._handlePendingNonActivationAppLaunchEvent();
                    PlatformJS.Services.process.onCheckpointAsync().done();
                    PlatformJS.Services.platformEventSource.processCheckpointStop();
                    return PlatformJS.BootCache.instance.saveCacheToDisk().then(function setWarmbootReady(succeeded) {
                        if (!succeeded) {
                            Windows.Storage.ApplicationData.current.localSettings.values["warmBootReady"] = false
                        }
                    })
                }))
            }, _handlePendingNonActivationAppLaunchEvent: function _handlePendingNonActivationAppLaunchEvent() {
                if (this._nonActivationAppLaunchEvent) {
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "AppLaunch", JSON.stringify(this._nonActivationAppLaunchEvent));
                    this._nonActivationAppLaunchEvent = null
                }
            }, _beforePlatformInitialized: function _beforePlatformInitialized() {
                PlatformJS.DataService.QueryService = Platform.QueryService;
                while (PlatformJS._deferredTelemetryEvents.length > 0) {
                    var d = PlatformJS._deferredTelemetryEvents.shift();
                    d()
                }
            }, _onPlatformInitialized: function _onPlatformInitialized(event) {
                msWriteProfilerMark("Platform:Initialized:event");
                var that = this;
                this._crashReporter = new PlatformJS.CrashReporterProxy;
                WinJS.Application.addEventListener("checkpoint", function processManager_onCheckpoint(event) {
                    that._onCheckpoint(event)
                });
                Windows.UI.WebUI.WebUIApplication.addEventListener("suspending", function processManager_onSuspending(event) {
                    that._onSuspending(event)
                });
                Windows.UI.WebUI.WebUIApplication.addEventListener("resuming", function processManager_onResuming(event) {
                    that._onResuming(event)
                });
                this._updateNetworkChangedHandlers();
                Platform.Globalization.Marketization.updateSavedLanguageAndLocation();
                for (var i = 0; i < this._processListeners.length; i++) {
                    if (this._processListeners[i].onPlatformInitialized) {
                        this._processListeners[i].onPlatformInitialized(event)
                    }
                }
            }, _updateNetworkChangedHandlers: function _updateNetworkChangedHandlers() {
                CommonJS.NetworkIndicator.updateNetworkStatusChangedEventRegistration();
                CommonJS.Error.updateNetworkChangedHandler()
            }, _onLayoutChange: function _onLayoutChange(event) {
                PlatformJS.deferredTelemetry(function _services_1041() {
                    PlatformJS.Services.instrumentation.incrementInt32Array(Platform.Instrumentation.InstrumentationDataSetId.platform, Platform.Instrumentation.InstrumentationDataPointId.layoutChangeCount, event.viewState, 4, 1)
                })
            }, _onWindowResize: function _onWindowResize(event) {
                for (var i = 0; i < this._processListeners.length; i++) {
                    if (this._processListeners[i].onWindowResize) {
                        this._processListeners[i].onWindowResize(event)
                    }
                }
            }, exitApplicationWithWorkarounds: function exitApplicationWithWorkarounds(message, failFast) {
                var failFastValue = typeof failFast !== 'undefined' ? failFast : true;
                if (MSApp && MSApp.getViewOpener) {
                    MSApp.getViewOpener = null
                }
                Platform.Process.exitApplication(message, failFastValue)
            }, forceSuspend: function forceSuspend() {
                this._onSuspending(null)
            }, _onSuspending: function _onSuspending(event) {
                PlatformJS.Services.platformEventSource.processSuspendStart();
                for (var i = this._processListeners.length - 1; i >= 0; i--) {
                    if (this._processListeners[i].onSuspending) {
                        this._processListeners[i].onSuspending(event)
                    }
                }
                var thresholdKey = "Unknown";
                var thresholdReached = false;
                switch (Windows.ApplicationModel.Package.current.id.architecture) {
                    case Windows.System.ProcessorArchitecture.arm:
                        thresholdKey = "ARM";
                        break;
                    case Windows.System.ProcessorArchitecture.neutral:
                        thresholdKey = "Neutral";
                        break;
                    case Windows.System.ProcessorArchitecture.unknown:
                        thresholdKey = "Unknown";
                        break;
                    case Windows.System.ProcessorArchitecture.x64:
                        thresholdKey = "X64";
                        break;
                    case Windows.System.ProcessorArchitecture.x86:
                        thresholdKey = "X86";
                        break;
                    default:
                        thresholdKey = "Unknown";
                        break
                }
                if (PlatformJS.Services.isConfigurationInitialized && PlatformJS.Navigation.mainNavigator && PlatformJS.Navigation.mainNavigator.weightedNavigationCounter) {
                    var threshold = CommonJS.Configuration.ConfigurationManager.custom.getDictionary("TerminateThreshold").getInt32(thresholdKey);
                    var currentScore = PlatformJS.Navigation.mainNavigator.weightedNavigationCounter.getCount();
                    if ((threshold !== 0) && (currentScore >= threshold)) {
                        thresholdReached = true;
                        PlatformJS.deferredTelemetry(function _services_1140() {
                            PlatformJS.Services.instrumentation.incrementInt32(Platform.Instrumentation.InstrumentationDataSetId.platform, Platform.Instrumentation.InstrumentationDataPointId.terminateOnSuspendCount);
                            Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logSessionExit(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Threshold = " + threshold + ", Score = " + currentScore)
                        })
                    }
                }
                PlatformJS.Images.dispose();
                PlatformJS.Services.process.onSuspend();
                PlatformJS.Services.platformEventSource.processSuspendStop();
                if (PlatformJS.Utilities.Globalization.isEmbargoed) {
                    PlatformJS.Services.platformEventSource.traceInfo("Embargoed country/region detected. Closing app.");
                    Platform.Diagnostics.PlatformEventSourceAccessor.stopTraceSession();
                    PlatformJS.mainProcessManager.exitApplicationWithWorkarounds("OnSuspending: Embargoed country/region detected. Closing app.")
                }
                if (thresholdReached) {
                    PlatformJS.Services.platformEventSource.traceInfo("Threshold = " + threshold + ", Score = " + currentScore + ". Closing app.");
                    Platform.Diagnostics.PlatformEventSourceAccessor.stopTraceSession();
                    setTimeout(function _services_1168() {
                        PlatformJS.mainProcessManager.exitApplicationWithWorkarounds("OnSuspending: Close the app since the threshold for page navigations have been reached.")
                    }, 3000)
                }
                var pendingUpdate = Platform.Configuration.ConfigurationManager.hasPendingUpdate || CommonJS.FlightingManager.instance.hasPendingUpdate;
                if (PlatformJS.isPlatformInitialized && pendingUpdate) {
                    msWriteProfilerMark("Platform:Configuration:ConfigurationManager:hasPendingUpdate:" + Platform.Configuration.ConfigurationManager.hasPendingUpdate);
                    msWriteProfilerMark("CommonJS.FlightingManager.instance.hasPendingUpdate:" + CommonJS.FlightingManager.instance.hasPendingUpdate);
                    var suspendingDeferral = event.suspendingOperation.getDeferral();
                    var clearBootCachePromise = this.resetBootCacheAsync().then(function resetBootCacheComplete() {
                        CommonJS.Configuration.ConfigurationManager.resetFlighting();
                        Platform.Diagnostics.PlatformEventSourceAccessor.stopTraceSession();
                        suspendingDeferral.complete()
                    }, function resetBootCacheError() {
                        CommonJS.Configuration.ConfigurationManager.resetFlighting();
                        Platform.Diagnostics.PlatformEventSourceAccessor.stopTraceSession();
                        suspendingDeferral.complete()
                    })
                }
                else {
                    Platform.Diagnostics.PlatformEventSourceAccessor.stopTraceSession()
                }
                this._isSuspended = true
            }, _onMarketConfigurationChange: function _onMarketConfigurationChange(eventName, obj) {
                CommonJS.reloadResourceLoader();
                var settingsPage = PlatformJS.Utilities.getControl("settingsPage");
                if (settingsPage) {
                    settingsPage.hide()
                }
                this._resetCss();
                this._applyAnyPendingConfigChanges(true);
                this._resetSettingPageChrome();
                Platform.Globalization.Marketization.hasPendingUpdate = false
            }, _onUpdatedMarket: function _onUpdatedMarket() {
                for (var i = 0; i < this._processListeners.length; i++) {
                    if (this._processListeners[i].onUpdatedMarket) {
                        this._processListeners[i].onUpdatedMarket()
                    }
                }
            }, resetBootCacheAsync: function resetBootCacheAsync() {
                msWriteProfilerMark("Platform:ResettingBootCache");
                Windows.Storage.ApplicationData.current.localSettings.values["warmBootReady"] = false;
                PlatformJS.Utilities.Globalization.clearSavedGlobalizationData();
                Platform.Process.isResetDoNotPurgeSignalled = true;
                return PlatformJS.BootCache.instance.reset()
            }, _resetSettingPageChrome: function _resetSettingPageChrome() {
                var container = document.getElementById("settingsPage");
                if (container) {
                    var title = PlatformJS.Services.resourceLoader.getString("/platform/optionsTitle");
                    var clearHistory = PlatformJS.Services.resourceLoader.getString("ClearHistory");
                    var clearHistoryInstruction = PlatformJS.Services.resourceLoader.getString("ClearHistoryInstruction");
                    var dataContext = {
                        pageTitle: title, clearHistory: clearHistory, clearHistoryInstruction: clearHistoryInstruction
                    };
                    WinJS.Binding.processAll(container, dataContext)
                }
            }, _resetCss: function _resetCss() {
                var newQualifiedLanguageString = PlatformJS.Utilities.Globalization.getQualifiedLanguageString();
                var htmlTag = document.getElementsByTagName("html")[0];
                htmlTag.lang = newQualifiedLanguageString;
                htmlTag.removeAttribute("dir");
                htmlTag.dir = window.getComputedStyle(htmlTag).direction;
                if (this._launchedLanguage !== newQualifiedLanguageString) {
                    var linkTags = document.getElementsByTagName("link");
                    for (var index = 0; index < linkTags.length; index++) {
                        var link = linkTags[index];
                        var hrefValue = link.getAttribute("href");
                        link.setAttribute("href", "");
                        link.setAttribute("href", hrefValue)
                    }
                    this._launchedLanguage = newQualifiedLanguageString
                }
            }, _applyAnyPendingConfigChanges: function _applyAnyPendingConfigChanges(forceToHome) {
                if (Platform.Configuration.ConfigurationManager.hasPendingUpdate) {
                    Platform.Configuration.ConfigurationManager.instance.applyPendingUpdate();
                    PlatformJS.Services.process.applyPendingConfigurationUpdate();
                    PlatformJS.Cache.CacheService.reset();
                    PlatformJS.Navigation.mainNavigator.navigateAway();
                    PlatformJS.Navigation.mainNavigator.channelManager.reloadChannels();
                    if (PlatformJS.Ads) {
                        PlatformJS.Ads.Config.clearAdsConfig()
                    }
                    for (var i = this._processListeners.length - 1; i >= 0; i--) {
                        if (this._processListeners[i].onUpdatedConfig) {
                            this._processListeners[i].onUpdatedConfig(event)
                        }
                    }
                    PlatformJS.Navigation.mainNavigator.returnHomeAndClearHistoryIfNecessary(true)
                }
            }, _onResuming: function _onResuming(event) {
                var that = this;
                this._isSuspended = false;
                if (Windows.Storage.ApplicationData.current.localSettings.values["etw_logging"]) {
                    var newFile = Windows.Storage.ApplicationData.current.localSettings.values["etw_logging_newFile"];
                    Platform.Diagnostics.PlatformEventSourceAccessor.startTraceSession(newFile)
                }
                CommonJS.NetworkIndicator.checkNetworkState();
                PlatformJS.Services.platformEventSource.processResumeStart();
                this._bootCompletePromise.then(function processManager_onResumeInitializeCompletion() {
                    that._applyAnyPendingConfigChanges(false);
                    PlatformJS.Services.process.onResume();
                    for (var i = 0; i < that._processListeners.length; i++) {
                        try {
                            if (that._processListeners[i].onResuming) {
                                that._processListeners[i].onResuming(event)
                            }
                        }
                        catch (e) { }
                    }
                    CommonJS.FlightingManager.instance.initializeAsync(true);
                    PlatformJS.Services.platformEventSource.processResumeStop();
                    PlatformJS.modernPerfTrack.writeResumeStopEvent(Microsoft.PerfTrack.PerfTrackTimePoint.responsive);
                    PlatformJS.modernPerfTrack.writeResumeStopEvent(Microsoft.PerfTrack.PerfTrackTimePoint.visibleComplete)
                });
                this._nonActivationAppLaunchEvent = {
                    method: "normal", sessionType: "resume", activation: false
                }
            }, _initSearchTileArgs: function _initSearchTileArgs(args) {
                var argsJson = null;
                if (args) {
                    try {
                        argsJson = JSON.parse(args)
                    }
                    catch (e) { }
                    if (PlatformJS.Navigation.isSearchTileActivation(argsJson)) {
                        this.searchTileArguments = argsJson
                    }
                }
            }, _onActivated: function _onActivated(event) {
                msWriteProfilerMark("Platform:Activated:s");
                var that = this;
                var splashScreen = event.detail.splashScreen;
                this.searchTileArguments = null;
                PlatformJS.modernPerfTrack.activationDetails = event.detail.prelaunchActivated ? 1 : 0;
                PlatformJS.modernPerfTrack.activationDetails += (event.detail.kind << 1);
                PlatformJS.modernPerfTrack.activationArguments = event.detail.arguments;
                if (event.detail.kind !== Windows.ApplicationModel.Activation.ActivationKind.launch || event.detail.arguments || event.detail.prelaunchActivated) {
                    PlatformJS.isPrelaunched = event.detail.prelaunchActivated;
                    if (event.detail.prelaunchActivated && Platform.ServicesAccessor.manifest.disablePrelaunch) {
                        Windows.Storage.ApplicationData.current.localSettings.values[this._previousBootSuccessKey] = this._previousBootSuccessValueAtLaunch;
                        Platform.Process.setDirtyShutdownCount(this._dirtyShutdownCountAtLaunch);
                        PlatformJS.mainProcessManager.exitApplicationWithWorkarounds("Prelaunch activation is disabled via configuration.", false);
                        return
                    }
                    PlatformJS.startPlatformInitialization()
                }
                if (event.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
                    this._initSearchTileArgs(event.detail.arguments);
                    if (event.detail.arguments && event.detail.arguments === "RetailExperience") {
                        if (!this.retailModeEnabled) {
                            Windows.Storage.ApplicationData.current.localSettings.values["Platform_RetailExperienceMarket"] = PlatformJS.Utilities.Globalization.getCurrentMarket(true);
                            this.retailModeEnabled = true
                        }
                        Platform.ServicesAccessor.process.onVisibilityChange(true);
                        PlatformJS.mainProcessManager.exitApplicationWithWorkarounds("OnActivated: Terminating App after Retail Experience launch")
                    }
                }
                splashScreen.addEventListener("dismissed", function processManager_onDismissed(evt) {
                    that._onSystemSplashScreenDismissed(event)
                }, false);
                PlatformJS.deferredTelemetry(function _services_1418() {
                    PlatformJS.Services.instrumentation.setInt32(Platform.Instrumentation.InstrumentationDataSetId.ceipPing, Platform.Instrumentation.InstrumentationDataPointId.activationKind, event.detail.kind);
                    PlatformJS.Services.instrumentation.incrementInt32Array(Platform.Instrumentation.InstrumentationDataSetId.platform, Platform.Instrumentation.InstrumentationDataPointId.layoutChangeCount, Windows.UI.ViewManagement.ApplicationView.value, 4, 1)
                });
                if (!that._activated) {
                    CommonJS.Progress.setSystemSplash(event.detail.activatedOperation.getDeferral(), function processManager_initialExtendedSplash() {
                        that._postSplashComplete()
                    });
                    CommonJS.Progress.setActivationKind(event.detail.kind);
                    setTimeout(function processManager_postSplashTimeout() {
                        if (CommonJS.Progress.isShowingSystemSplash()) {
                            CommonJS.Progress.initializeExtendedSplash(splashScreen, false);
                            CommonJS.Progress.destroySystemSplash(false)
                        }
                    }, 4000)
                }
                else {
                    that._postSplashComplete()
                }
                this._bootCompletePromise.then(function processManager_initializeCompletion() {
                    var historySetup = null;
                    var historySetup2 = WinJS.Promise.wrap(null);
                    var earlyFetchPromise = null;
                    if (!that._activated && !that._initializeCompletionCalled) {
                        that._initializeCompletionCalled = true;
                        var isRecoverMode = that.isRecoverMode();
                        that._initializeProcessListeners();
                        var isVersionUpdate = that.isVersionUpdate();
                        var resetHistory = Windows.Storage.ApplicationData.current.localSettings.values["platform_resetHistory"];
                        var clearState = (event.detail.previousExecutionState === Windows.ApplicationModel.Activation.ApplicationExecutionState.notRunning) || (event.detail.previousExecutionState === Windows.ApplicationModel.Activation.ApplicationExecutionState.terminated) || (event.detail.previousExecutionState === Windows.ApplicationModel.Activation.ApplicationExecutionState.closedByUser) || resetHistory || that._isLanguageOrLocationChanged;
                        if (isVersionUpdate || clearState) {
                            var promises = [];
                            var listeners = that._processListeners;
                            for (var j = 0; j < that._processListeners.length; j++) {
                                if (listeners[j].onBeforeActivate) {
                                    msWriteProfilerMark("Platform:ProcessListenerBeforeActivate" + j + ":s");
                                    promises.push(listeners[j].onBeforeActivate(event, isRecoverMode, "Home"));
                                    msWriteProfilerMark("Platform:ProcessListenerBeforeActivate" + j + ":e")
                                }
                            }
                            if (promises.length) {
                                earlyFetchPromise = promises.length > 1 ? WinJS.Promise.join(promises) : promises[0]
                            }
                        }
                        historySetup = PlatformJS.Navigation.mainNavigator.initialize(clearState, isVersionUpdate);
                        if (earlyFetchPromise !== null) {
                            historySetup2 = WinJS.Promise.join([earlyFetchPromise, historySetup]).then(function processManager_getHistorySetup() {
                                return historySetup
                            })
                        }
                        else {
                            historySetup2 = historySetup
                        }
                    }
                    else {
                        historySetup2 = WinJS.Promise.wrap(null)
                    }
                    historySetup2.then(function processManager_historySetupComplete(target) {
                        if (target && (earlyFetchPromise === null)) {
                            var listeners = that._processListeners;
                            for (var i = 0; i < that._processListeners.length; i++) {
                                if (listeners[i].onBeforeActivate) {
                                    msWriteProfilerMark("Platform:ProcessListenerBeforeActivate" + i + ":s");
                                    listeners[i].onBeforeActivate(event, isRecoverMode, target.pageInfo.channelId);
                                    msWriteProfilerMark("Platform:ProcessListenerBeforeActivate" + i + ":e")
                                }
                            }
                        }
                        that._platformActivation(target, isRecoverMode, event)
                    })
                })
            }, _onSystemSplashScreenDismissed: function _onSystemSplashScreenDismissed(event) {
                msWriteProfilerMark("Platform:SystemSplashScreenDismissed:s");
                msWriteProfilerMark("Platform:SystemSplashScreenDismissed:e")
            }, _platformActivation: function _platformActivation(target, isRecoverMode, event) {
                msWriteProfilerMark("Platform:PlatformActivation:s");
                if (!PlatformJS.modernPerfTrack.isLaunchFinished) {
                    PlatformJS.modernPerfTrack.addStage("NI");
                    PlatformJS.modernPerfTrack.writeLaunchStageStopEvent(PlatformJS.perfTrackScenario_Launch_NavigationInitialization, "Navigation Initialization");
                    PlatformJS.modernPerfTrack.writeLaunchStageStartEvent(PlatformJS.perfTrackScenario_Launch_PlatformActivation, "Platform Activation")
                }
                var applicationAccessor = null,
                    historySetup = null,
                    that = this;
                PlatformJS.Services.platformEventSource.processActivateStart();
                if (event.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.protocol) {
                    var truncatedURI = event.detail.uri.rawUri.substring(0, 499);
                    PlatformJS.deferredTelemetry(function _services_1596() {
                        PlatformJS.Services.instrumentation.setString(Platform.Instrumentation.InstrumentationDataSetId.ceipPing, Platform.Instrumentation.InstrumentationDataPointId.protocolUri, truncatedURI)
                    })
                }
                PlatformJS.platformInitializedPromise.then(function _services_1604() {
                    Platform.Process.setUIDispatcher();
                    Platform.Process.registerPlatformUIEventHandler("first_network_request_suspended", that._handleFirstNetworkCallSuspended.bind(that));
                    Platform.Process.registerPlatformUIEventHandler("http_response_badid", that._onBadId.bind(that));
                    Platform.Process.registerPlatformUIEventHandler("http_status_403_error", that._handle403Error.bind(that));
                    Platform.Process.registerPlatformUIEventHandler("market_configuration_changed", that._onMarketConfigurationChange.bind(that));
                    Platform.Process.registerPlatformUIEventHandler("network_request_resumed", that._handleNetworkResumeMessaging.bind(that));
                    Platform.Process.registerPlatformUIEventHandler("network_request_suspended", that._handleNetworkSuspendMessaging.bind(that));
                    Platform.Process.registerPlatformUIEventHandler("platform_retailmode_changed", that._retailModeChanged.bind(that));
                    Platform.Process.registerPlatformUIEventHandler("string_resource_changed", that._overrideWinJSGetString.bind(that));
                    Platform.Process.registerPlatformUIEventHandler("show_version_update_UI", that.showVersionUI.bind(that));
                    Platform.Process.registerPlatformUIEventHandler("updated_market", that._onUpdatedMarket.bind(that))
                });
                if (event.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.protocol) {
                    var queryParsed = event.detail.uri.queryParsed;
                    for (var index = 0; index < queryParsed.length; index++) {
                        if (queryParsed[index].name === "disablegettingstarted" && queryParsed[index].value === "true") {
                            Windows.Storage.ApplicationData.current.localSettings.values[CommonJS.TempCluster.getShowSettingsKey()] = false
                        }
                        else if (queryParsed[index].name === "setflight" && queryParsed[index].value === "0") {
                            PlatformJS.isFlightingEnabled = false
                        }
                    }
                }
                if (!that._activated) {
                    PlatformJS.deferredTelemetry(function _services_1637() {
                        switch (event.detail.kind) {
                            case Windows.ApplicationModel.Activation.ActivationKind.launch:
                                Platform.ServicesAccessor.process.onActivateLaunchTelemetry(event.detail.arguments, that.searchTileArguments !== null);
                                break;
                            case Windows.ApplicationModel.Activation.ActivationKind.protocol:
                                Platform.ServicesAccessor.process.onActivateProtocolTelemetry(event.detail.uri.absoluteUri, event.detail.arguments);
                                break;
                            case Windows.ApplicationModel.Activation.ActivationKind.search:
                                Platform.ServicesAccessor.process.onActivateSearchTelemetry(event.detail.queryText, event.detail.arguments);
                                break;
                            case Windows.ApplicationModel.Activation.ActivationKind.share:
                                Platform.ServicesAccessor.process.onActivateShareTelemetry("", event.detail.arguments);
                                break;
                            default:
                                msWriteProfilerMark("Unsupported FR launch type: " + event.detail.kind);
                                Platform.ServicesAccessor.process.onActivateLaunchTelemetry(event.detail.arguments);
                                break
                        }
                    });
                    PlatformJS.Services.process.onActivate();
                    msWriteProfilerMark("Platform:onActivateDone:s");
                    that._resetCss();
                    document.addEventListener("msvisibilitychange", function processManager_onMSVisiblityChange(event) {
                        that._onVisibilityChange(event)
                    });
                    Windows.Storage.ApplicationData.current.localSettings.values["platform_resetHistory"] = false;
                    historySetup = WinJS.Promise.wrap(target);
                    that._postPlatformActivation(historySetup, event);
                    that._activated = true;
                    msWriteProfilerMark("Platform:onActivateDone:e")
                }
                else {
                    that._handleReactivation(event)
                }
                that._logAppLaunchEvent(event);
                msWriteProfilerMark("Platform:PlatformActivation:e");
                if (!PlatformJS.modernPerfTrack.isLaunchFinished) {
                    PlatformJS.modernPerfTrack.addStage("PA");
                    PlatformJS.modernPerfTrack.writeLaunchStageStopEvent(PlatformJS.perfTrackScenario_Launch_PlatformActivation, "Platform Activation");
                    PlatformJS.modernPerfTrack.writeLaunchStageStartEvent(PlatformJS.perfTrackScenario_Launch_LoadPage, "Load Page")
                }
            }, _logAppLaunchEvent: function _logAppLaunchEvent(event) {
                var customAttributes = { activation: true };
                var that = this;
                this._nonActivationAppLaunchEvent = null;
                switch (event.detail.previousExecutionState) {
                    case Windows.ApplicationModel.Activation.ApplicationExecutionState.suspended:
                        customAttributes.sessionType = "resume";
                        break;
                    case Windows.ApplicationModel.Activation.ApplicationExecutionState.terminated:
                        customAttributes.sessionType = "start";
                        break;
                    case Windows.ApplicationModel.Activation.ApplicationExecutionState.running:
                        customAttributes.sessionType = "running";
                        break
                }
                PlatformJS.deferredTelemetry(function _services_1714() {
                    var T = Microsoft.Bing.AppEx.Telemetry;
                    switch (event.detail.kind) {
                        case Windows.ApplicationModel.Activation.ActivationKind.launch:
                            if (event.detail.arguments) {
                                T.FlightRecorder.setImpressionNavMethod((that.searchTileArguments !== null) ? T.ImpressionNavMethod.searchTile : T.ImpressionNavMethod.secondaryTile)
                            }
                            var activationContext = that.getActivationContextJson(that.searchTileArguments);
                            if (!activationContext) {
                                activationContext = that.getActivationContextUrl(event.detail.arguments);
                                if (!activationContext) {
                                    activationContext = "normal"
                                }
                            }
                            customAttributes.method = activationContext;
                            customAttributes.args = event.detail.arguments;
                            break;
                        case Windows.ApplicationModel.Activation.ActivationKind.protocol:
                            if (event.detail.uri.absoluteUri) {
                                T.FlightRecorder.setImpressionNavMethod(T.ImpressionNavMethod.deepLink)
                            }
                            var uri = event.detail.uri.absoluteUri;
                            var activationContext = that.getActivationContextUrl(uri);
                            customAttributes.method = activationContext ? activationContext : "deep-link";
                            customAttributes.uri = uri;
                            customAttributes.args = event.detail.arguments;
                            break;
                        case Windows.ApplicationModel.Activation.ActivationKind.search:
                            customAttributes.method = "search";
                            customAttributes.query = event.detail.queryText;
                            customAttributes.args = event.detail.arguments;
                            break;
                        case Windows.ApplicationModel.Activation.ActivationKind.share:
                            customAttributes.method = "share";
                            customAttributes.uri = "";
                            customAttributes.args = event.detail.arguments;
                            break;
                        default:
                            msWriteProfilerMark("Unsupported FR activation type: " + event.detail.kind);
                            customAttributes.method = "unknown";
                            customAttributes.args = event.detail.arguments;
                            break
                    }
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "AppLaunch", JSON.stringify(customAttributes))
                })
            }, getActivationContextJson: function getActivationContextJson(args) {
                if (args && args.context && args.context[0] && args.context[0].activationContext) {
                    return args.context[0].activationContext
                }
                else {
                    return null
                }
            }, getActivationContextUrl: function getActivationContextUrl(args) {
                var activationContext = null;
                if (args && typeof args === 'string') {
                    var matchedText = args.match(/activationcontext=.+$/);
                    if (matchedText) {
                        activationContext = matchedText[0].split("=")[1].toLowerCase()
                    }
                }
                return activationContext
            }, _handleReactivation: function _handleReactivation(event) {
                var historySetup;
                historySetup = WinJS.Promise.wrap(null);
                this._postPlatformActivation(historySetup, event);
                PlatformJS.platformInitializedPromise.then(function _services_1802() {
                    if (event.detail.previousExecutionState === Windows.ApplicationModel.Activation.ApplicationExecutionState.suspended) {
                        Platform.Process.instance.sendReportsAsync(false)
                    }
                    else {
                        Platform.Process.instance.sendReportsAsync(true)
                    }
                })
            }, _postPlatformActivation: function _postPlatformActivation(historySetup, event) {
                msWriteProfilerMark("Platform:PostPlatformActivation:s");
                var that = this;
                if (this._checkPointTimer) {
                    clearInterval(this._checkPointTimer)
                }
                else {
                    var checkpointInterval = PlatformJS.BootCache.instance.getEntry("app.checkpointInterval", function _services_1828() {
                        return PlatformJS.Services.configuration.getDictionary("PLM").getInt32("CheckpointIntervalInMilliseconds", 60 * 1000)
                    });
                    this._checkPointTimer = setInterval(function processManager_checkPointTimer() {
                        WinJS.Application.checkpoint()
                    }, checkpointInterval)
                }
                var target = null;
                var diskState = null;
                historySetup.then(function processManager_historySetupComplete(t) {
                    target = t;
                    if (target && target.state && !target.state.__lookupStateFile) {
                        return WinJS.Promise.wrap(target.state)
                    }
                    else if (target) {
                        return PlatformJS.Navigation.mainNavigator.readEntryStateFromDiskAsync(target)
                    }
                    else {
                        return WinJS.Promise.wrap(null)
                    }
                }).then(function processManager_readEntryStateFromDiskAsyncComplete(state) {
                    if (state) {
                        diskState = state.state
                    }
                    return WinJS.Promise.wrap(target)
                }).then(function processManager_getTargetComplete(target) {
                    var promises = [];
                    var listeners = that._processListeners;
                    var desired = null;
                    var isRecoverMode = that.isRecoverMode();
                    for (var i = 0; i < that._processListeners.length; i++) {
                        if (listeners[i].onActivated) {
                            msWriteProfilerMark("Platform:ProcessListenerActivated" + i + ":s");
                            var temp = that._processListeners[i].onActivated(event, isRecoverMode);
                            if (temp && desired) {
                                throw "Multiple ProcessListenerActivated tried to override the target landing page";
                            }
                            if (temp) {
                                desired = temp
                            }
                            msWriteProfilerMark("Platform:ProcessListenerActivated" + i + ":e")
                        }
                    }
                    return WinJS.Promise.wrap(desired).then(function processManager_getDesiredComplete(desired) {
                        var actualTarget = null;
                        var useTarget = true;
                        var comparison = null;
                        if (target) {
                            comparison = {
                                pageInfo: target.pageInfo, state: diskState
                            }
                        }
                        else {
                            useTarget = false;
                            comparison = {
                                pageInfo: {
                                    page: WinJS.Navigation.history.current.location.page, fragment: WinJS.Navigation.history.current.location.fragment
                                }, state: WinJS.Navigation.history.current.state
                            }
                        }
                        if (that._processNavigationForDuplicate(desired, comparison)) {
                            actualTarget = desired || target
                        }
                        else if (useTarget) {
                            actualTarget = target
                        }
                        return WinJS.Promise.wrap(actualTarget)
                    })
                }).then(function processManager_getActualTargetComplete(target) {
                    if (target) {
                        if (target.mode === "print") {
                            PlatformJS.Navigation.mainNavigator.loadPage({
                                location: target.pageInfo, state: target.state
                            })
                        }
                        else if (event.detail.kind === 1 && Windows.UI.ViewManagement.ApplicationView.value === 2 && event.detail.previousExecutionState !== Windows.ApplicationModel.Activation.ApplicationExecutionState.notRunning) {
                            PlatformJS.Navigation.mainNavigator.pendingNavigation = target
                        }
                        else {
                            WinJS.Navigation.navigate(target.pageInfo, target.state)
                        }
                    }
                    PlatformJS.Services.platformEventSource.processActivateStop();
                    msWriteProfilerMark("Platform:Activated:e");
                    msWriteProfilerMark("Platform:PostPlatformActivation:e")
                })
            }, _processNavigationForDuplicate: function _processNavigationForDuplicate(target, current) {
                if (!target && current) {
                    return true
                }
                if (!(current && current.pageInfo && target && target.pageInfo)) {
                    return true
                }
                function getType(literal) {
                    var node = window;
                    var segments = literal.split(".");
                    for (var i = 0, ilen = segments.length; i < ilen; i++) {
                        node = node[segments[i]];
                        if (!node) {
                            return null
                        }
                    }
                    return node
                }
                var location = current.pageInfo;
                var targetPageInfo = target.pageInfo;
                if (location.fragment === targetPageInfo.fragment && location.page === targetPageInfo.page) {
                    var pageType = getType(targetPageInfo.page);
                    if (pageType && pageType.areStateEqual) {
                        return !pageType.areStateEqual(current.state, target.state)
                    }
                }
                return true
            }, _postSplashComplete: function _postSplashComplete() {
                var that = this;
                PlatformJS.platformInitializedPromise.then(function postSplashCompletion() {
                    setTimeout(function processManager_postSplashTimeout() {
                        msWriteProfilerMark("Platform:PostSplashComplete:s");
                        Windows.Storage.ApplicationData.current.localSettings.values.insert("currentAppVersion", PlatformJS.Services.process.getAppVersionString());
                        CommonJS.NetworkIndicator.statusChange();
                        if (!that._postActiveComplete) {
                            PlatformJS.Services.process.startPostActivateWork();
                            that._postActiveComplete = true
                        }
                        for (var i = 0; i < that._processListeners.length; i++) {
                            if (that._processListeners[i].startPostActivateWork) {
                                that._processListeners[i].startPostActivateWork()
                            }
                        }
                        CommonJS.Settings.showMarketNotification();
                        CommonJS.NetworkIndicator.checkNetworkState();
                        PlatformJS.performTestModeGC();
                        msWriteProfilerMark("Platform:PostSplashComplete:e")
                    }, 1000)
                })
            }, _overrideWinJSGetString: function _overrideWinJSGetString() {
                WinJS.Resources.getString = function (resourceId) {
                    var resourceValue = Platform.ServicesAccessor.resourceLoader.getValue(resourceId);
                    return {
                        value: resourceValue.value, lang: resourceValue.language
                    }
                }
            }, _retailModeChanged: function _retailModeChanged() {
                this._retailModeEnabled = null
            }, _onBadId: function _onBadId(eventName, obj) {
                Platform.Process.instance.onBadIdAsync()
            }, _handleFirstNetworkCallSuspended: function _handleFirstNetworkCallSuspended(eventName, obj) {
                CommonJS.Progress.destroySplash(true)
            }, _errorShownByPlatform: false, _handleNetworkSuspendMessaging: function _handleNetworkSuspendMessaging(eventName, obj) {
                if (this._errorShownByPlatform) {
                    return
                }
                this._errorShownByPlatform = true;
                switch (obj.code) {
                    case Platform.DataServices.QueryServiceMessaging.large:
                        CommonJS.Error.showError(CommonJS.Error.NO_INTERNET, null, null, true);
                        break;
                    case Platform.DataServices.QueryServiceMessaging.small:
                        if (!CommonJS.messageBar && !CommonJS.Error._errorControl) {
                            var messageBar = new CommonJS.MessageBar(PlatformJS.Services.resourceLoader.getString("/platform/noInternetTitle") + " " + PlatformJS.Services.resourceLoader.getString("/platform/noInternetDescription"), { autoHide: true });
                            messageBar.show()
                        }
                        break
                }
            }, _handleNetworkResumeMessaging: function _handleNetworkResumeMessaging(eventName, obj) {
                if (!this._errorShownByPlatform) {
                    return
                }
                this._errorShownByPlatform = false;
                switch (obj.code) {
                    case Platform.DataServices.QueryServiceMessaging.large:
                        CommonJS.Error.removeError(true);
                        break;
                    case Platform.DataServices.QueryServiceMessaging.small:
                        break
                }
            }, showVersionUI: function showVersionUI(eventName, obj) {
                if (obj.code === Platform.Utilities.VersionUpdateUIType.forcedUpdate) {
                    var o = JSON.parse(obj.message);
                    CommonJS.Update.showForceUpdate(o.AppStoreUrl, o.ForceUpdate)
                }
            }, _handle403Error: function _handle403Error(eventName, obj) {
                var allowList = PlatformJS.Services.configuration.getList("DomainAllowList403");
                if (allowList) {
                    var uri = null;
                    try {
                        uri = new Windows.Foundation.Uri(obj.message)
                    }
                    catch (e) { }
                    if (uri) {
                        var matchFound = false;
                        for (var i = 0; i < allowList.size; i++) {
                            var urlString = allowList[i];
                            try {
                                var listUri = new Windows.Foundation.Uri(urlString.value);
                                if (listUri.host.toLowerCase() === uri.host.toLowerCase() && listUri.path.toLowerCase() === uri.path.toLowerCase()) {
                                    matchFound = true;
                                    break
                                }
                            }
                            catch (e) { }
                        }
                        if (matchFound && !PlatformJS.Utilities.Globalization.isEmbargoed) {
                            PlatformJS.Utilities.Globalization.isEmbargoed = true;
                            CommonJS.Error.showMarketError()
                        }
                    }
                }
            }, _onOrientationChange: function _onOrientationChange(event) {
                PlatformJS.deferredTelemetry(function _services_2130() {
                    PlatformJS.Services.instrumentation.incrementInt32Array(Platform.Instrumentation.InstrumentationDataSetId.platform, Platform.Instrumentation.InstrumentationDataPointId.layoutChangeCount, Windows.UI.ViewManagement.ApplicationView.value, 4, 1)
                })
            }, _onDpiChange: function _onDpiChange(event) {
                for (var i = 0; i < this._processListeners.length; i++) {
                    if (this._processListeners[i].onDpiChange) {
                        this._processListeners[i].onDpiChange(event)
                    }
                }
            }, _onVisibilityChange: function _onVisibilityChange(event) {
                var that = this;
                PlatformJS.platformInitializedPromise.then(function _services_2168() {
                    PlatformJS.Services.process.onVisibilityChange(document.msHidden);
                    if (document.msVisibilityState !== "hidden" && PlatformJS.isPrelaunched) {
                        PlatformJS.isPrelaunched = false
                    }
                    for (var i = 0; i < that._processListeners.length; i++) {
                        if (that._processListeners[i].onVisibilityChange) {
                            that._processListeners[i].onVisibilityChange(event)
                        }
                    }
                    if (document.msVisibilityState === "hidden") {
                        if (Platform.Globalization.Marketization.hasPendingUpdate || !PlatformJS.Utilities.Globalization.isSavedLanguageAndLocationSame()) {
                            that.resetBootCacheAsync().then(function marketPendingUpdate() {
                                that._onSuspending(null);
                                PlatformJS.Services.platformEventSource.traceInfo("A market update was detected. Closing app.");
                                PlatformJS.mainProcessManager.exitApplicationWithWorkarounds("OnVisibilityChange: A market update was detected. Closing app.")
                            })
                        }
                        if (PlatformJS.Utilities.Globalization.isEmbargoed) {
                            that._onSuspending(null);
                            PlatformJS.Services.platformEventSource.traceInfo("Embargoed country/region detected. Closing app.");
                            PlatformJS.mainProcessManager.exitApplicationWithWorkarounds("OnVisibilityChange: Embargoed country/region detected. Closing app.")
                        }
                    }
                })
            }
        }), initialize: function initialize() {
            WinJS.Binding.optimizeBindingReferences = true;
            var isdebug = Windows.Storage.ApplicationData.current.localSettings.values["app.isDebug"];
            if (isdebug === undefined) {
                isdebug = Platform.Process.isDebug();
                Windows.Storage.ApplicationData.current.localSettings.values["app.isDebug"] = isdebug
            }
            PlatformJS.isDebug = isdebug;
            var isProdBuild = Windows.Storage.ApplicationData.current.localSettings.values["app.isProdBuild"];
            if (isProdBuild === undefined) {
                isProdBuild = Platform.Process.isProd();
                Windows.Storage.ApplicationData.current.localSettings.values["app.isProdBuild"] = isProdBuild
            }
            PlatformJS.isProdBuild = isProdBuild;
            if (Windows.Storage.ApplicationData.current.localSettings.values["etw_logging"]) {
                var newFile = Windows.Storage.ApplicationData.current.localSettings.values["etw_logging_newFile"];
                Platform.Diagnostics.PlatformEventSourceAccessor.startTraceSession(newFile)
            }
            if (!PlatformJS.mainProcessManager) {
                PlatformJS.mainProcessManager = new PlatformJS.ProcessManager
            }
        }, getLaunchParams: function getLaunchParams(event) {
            var args = {};
            if (event.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.protocol) {
                if (event.detail.uri) {
                    var uriQuery = event.detail.uri.query;
                    if (uriQuery && uriQuery.length > 0) {
                        var queryStr = uriQuery.substring(1);
                        var params = queryStr.split("&");
                        for (var i = 0; i < params.length; i++) {
                            var kv = params[i];
                            var pair = kv.split("=");
                            if (pair.length === 2) {
                                pair[1] = pair[1].replace(/\+/g, " ");
                                args[pair[0]] = decodeURIComponent(pair[1])
                            }
                        }
                    }
                }
            }
            return args
        }
    })
})();
(function appexPlatformWindowSizeManagerInit(WinJS) {
    'use strict';
    if (!PlatformJS.modernPerfTrack) {
        PlatformJS.modernPerfTrack = new PlatformJS.ModernPerfTrack
    }
    PlatformJS.modernPerfTrack.writeStartEvent(PlatformJS.perfTrackScenario_Launch, "App Launch", PlatformJS.modernPerfTrack.appName);
    if (!PlatformJS.modernPerfTrack.isLaunchFinished) {
        PlatformJS.modernPerfTrack.addStage("AS");
        PlatformJS.modernPerfTrack.writeLaunchStageStartEvent(PlatformJS.perfTrackScenario_Launch_AppInitialization, "App Initialization")
    }
    var NS = WinJS.Namespace.define("PlatformJS", {
        WindowSizeManager: WinJS.Class.define(function windowSizeManager_ctor() {
            this._displayData = PlatformJS.Utilities.getDisplayData();
            var that = this;
            WinJS.Utilities.ready(function WindowSizeManagerInitialize() {
                that._lastFullScreen = that._displayData.isFullScreen;
                that._lastOrientation = that._displayData.landscape
            });
            CommonJS.WindowEventManager.addEventListener(CommonJS.WindowEventManager.Events.PAGE_RESIZE, this._onWindowResize.bind(this), false)
        }, {
            _displayData: null, _lastFullScreen: null, _lastOrientation: null, _onWindowResize: function _onWindowResize(event) {
                var lastFullScreen = this._lastFullScreen;
                var lastOrientation = this._lastOrientation;
                var fullScreen = this._displayData.isFullScreen;
                var orientation = this._displayData.landscape;
                if (orientation !== lastOrientation) {
                    this._lastOrientation = orientation;
                    PlatformJS.mainProcessManager._onOrientationChange(event)
                }
                if (fullScreen !== lastFullScreen) {
                    this._lastFullScreen = fullScreen;
                    var viewState = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
                    var viewStateChangedArgs = {
                        detail: [{ viewState: viewState }], type: "viewstatechanged", viewState: viewState
                    };
                    PlatformJS.mainProcessManager._onLayoutChange(viewStateChangedArgs)
                }
                PlatformJS.mainProcessManager._onWindowResize(event)
            }
        }), DpiChangeManager: WinJS.Class.define(function dpiChangeManager_ctor() {
            Windows.Graphics.Display.DisplayProperties.addEventListener("logicaldpichanged", this._onLogicalDpiChanged.bind(this))
        }, {
            _onLogicalDpiChanged: function _onLogicalDpiChanged(event) {
                PlatformJS.mainProcessManager._onDpiChange(event)
            }
        }), CrashReporterProxy: WinJS.Class.define(function crashReporterProxy_ctor() {
            WinJS.Application.onerror = this._onApplicationError.bind(this);
            var crashReporter = this._reporter = (Platform.CrashReporting && Platform.CrashReporting.CrashReport) ? Platform.CrashReporting.CrashReport.instance : null;
            if (crashReporter) {
                WinJS.Navigation.addEventListener("navigating", this._onNavigating.bind(this));
                document.addEventListener("click", this._onUserAction.bind(this))
            }
        }, {
            _reporter: null, _onUserAction: function _onUserAction(evt) {
                this._reporter.addUserActionHistory("nodeName:\"" + evt.target.nodeName + "\", className:\"" + evt.target.className + "\", X:" + evt.x + " Y:" + evt.y + "\ninnerText: " + evt.target.innerText + "\n")
            }, _onNavigating: function _onNavigating(eventInfo) {
                var curr = WinJS.Navigation.history.current;
                this._reporter.addNavHistory("location:" + JSON.stringify(curr.location) + "\nstate:" + JSON.stringify(curr.state))
            }, _onApplicationError: function _onApplicationError(eventInfo) {
                var detail = eventInfo.detail;
                if (detail) {
                    var msg = "",
                        stack = "",
                        extraInfo = "";
                    detail.CommonJSVersion = CommonJS.Version ? CommonJS.Version : "";
                    if (detail.exception) {
                        msg = detail.exception.message ? detail.exception.message : detail.exception;
                        stack = detail.exception.stack
                    }
                    else if (detail.error) {
                        if (detail.error[0]) {
                            msg = detail.error[0].message;
                            stack = detail.error[0].name
                        }
                        else {
                            msg = detail.error.message;
                            stack = detail.error.stack ? detail.error.stack : detail.error.filename + " : " + detail.error.lineno
                        }
                    }
                    else if (detail.stack) {
                        msg = detail.description;
                        stack = detail.stack
                    }
                    else if (detail.errorMessage) {
                        msg = detail.errorMessage;
                        stack = detail.errorUrl + ": " + detail.errorLine
                    }
                    try {
                        extraInfo = JSON.stringify(detail)
                    }
                    catch (e) { }
                    var T = Microsoft.Bing.AppEx.Telemetry;
                    T.FlightRecorder.logCrashWithJsonAttributes(T.LogLevel.critical, T.RuntimeEnvironment.javascript, msg, stack, extraInfo);
                    T.FlightRecorder.uploadNow(true);
                    if (this._reporter) {
                        this._reporter.sendCrashInfo(msg, stack, extraInfo)
                    }
                }
                return false
            }
        }), FramesPerSecondIndicator: WinJS.Class.define(function framesPerSecondIndicator_ctor(element) {
            this._delegate = this._measureFramesPerSecond.bind(this);
            this._element = element
        }, {
            _element: null, _running: false, _lastMeasure: 0, _frameCounter: 0, _delegate: null, start: function start() {
                this._running = true;
                this._measureFramesPerSecond()
            }, stop: function stop() {
                this._running = false
            }, _measureFramesPerSecond: function _measureFramesPerSecond() {
                var now = (new Date).getTime() % 1000;
                if (now < this._lastMeasure) {
                    this._element.innerText = this._frameCounter + "fps";
                    this._frameCounter = 0
                }
                this._frameCounter += 1;
                this._lastMeasure = now;
                if (this._running) {
                    requestAnimationFrame(this._delegate)
                }
            }
        }), UIDelayIndicator: WinJS.Class.define(function uiDelayIndicator_ctor(element) {
            this._delegate = this._measureUIDelays.bind(this);
            this._element = element
        }, {
            _element: null, _running: false, _lastMarker: 0, _maximumDelay: null, _delegate: null, start: function start() {
                this._running = true;
                this._measureUIDelays()
            }, stop: function stop() {
                this._running = false
            }, _measureUIDelays: function _measureUIDelays() {
                var now = (new Date).getTime();
                if (this._lastMarker !== 0) {
                    var delay = (now - this._lastMarker);
                    if (delay > this._maximumDelay) {
                        this._maximumDelay = delay;
                        this._element.innerText = delay + "ms"
                    }
                }
                this._lastMarker = now;
                requestAnimationFrame(this._delegate)
            }
        })
    });
    WinJS.Application.addEventListener("activated", function uiDelayIndicator_onActivated(event) {
        if (PlatformJS.isDebug) {
            var perfIndicatorElement = document.createElement("div");
            var indicatorElement = document.createElement("span");
            var fpsIndicatorElement = document.createElement("span");
            var delayIndicatorElement = document.createElement("span");
            if (PlatformJS.isWarmBoot) {
                indicatorElement.innerText = "warmBoot"
            }
            else {
                indicatorElement.innerText = "coldBoot"
            }
            if (PlatformJS.mainProcessManager.retailModeEnabled) {
                indicatorElement.innerText += ":retailMode"
            }
            WinJS.Utilities.addClass(perfIndicatorElement, "platformPerformanceIndicator");
            perfIndicatorElement.appendChild(fpsIndicatorElement);
            perfIndicatorElement.appendChild(delayIndicatorElement);
            perfIndicatorElement.appendChild(indicatorElement);
            var framesPerSecondIndicator = new NS.FramesPerSecondIndicator(fpsIndicatorElement);
            framesPerSecondIndicator.start();
            var delayIndicator = new NS.UIDelayIndicator(delayIndicatorElement);
            delayIndicator.start();
            document.body.appendChild(perfIndicatorElement)
        }
    })
})(WinJS);
(function appexPlatformServicesOnDemandLoaderInit(global) {
    'use strict';
    function importScripts(files) {
        if (!files) {
            return
        }
        files = files.constructor === Array ? files : [files];
        files.forEach(function _services_2536(file) {
            var script = document.createElement("script");
            script.src = file;
            script.defer = false;
            document.head.appendChild(script)
        })
    }
    function importCSS(files) {
        if (!files) {
            return
        }
        files = files.constructor === Array ? files : [files];
        files.forEach(function _services_2549(file) {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = file;
            document.head.appendChild(link)
        })
    }
    function importDepObjs(deps) {
        if (!deps) {
            return
        }
        deps = deps.constructor === Array ? deps : [deps];
        deps.forEach(function _services_2562(obj) {
            getDeepObject(global, obj)
        })
    }
    function getDeepObject(obj, key) {
        if (!key) {
            return obj
        }
        if (typeof key === 'string') {
            key = key.split(".")
        }
        key.forEach(function _services_2574(k) {
            obj = obj && obj[k]
        });
        return obj
    }
    function onDemandLoader(objPath, jsFiles, cssFiles, deps) {
        var splitted = objPath.split(".");
        var className = splitted.pop();
        var namespace = splitted.join(".");
        var classDef = {};
        var loadingInProgress = false;
        var loadInfo = {
            js: jsFiles, css: cssFiles, deps: deps
        };
        var namespaceObj = getDeepObject(global, splitted);
        if (!namespaceObj) {
            namespaceObj = WinJS.Namespace.define(namespace, {})
        }
        if (namespaceObj[className]) {
            return namespaceObj[className]
        }
        classDef[className] = {
            get: (function _services_2597(namespaceObj, className, loadInfo) {
                importDepObjs(loadInfo.deps);
                if (loadingInProgress) {
                    return null
                }
                loadingInProgress = true;
                delete namespaceObj[className];
                loadingInProgress = false;
                importScripts(loadInfo.js);
                importCSS(loadInfo.css);
                return namespaceObj[className]
            }).bind(null, namespaceObj, className, loadInfo), configurable: true, set: (function _services_2613(namespaceObj, className, value) {
                loadingInProgress = true;
                delete namespaceObj[className];
                loadingInProgress = false;
                namespaceObj[className] = value
            }).bind(null, namespaceObj, className)
        };
        WinJS.Namespace.define(namespace, classDef)
    }
    PlatformJS.onDemandLoader = onDemandLoader
})(this);
(function CUXProcessListenerInit() {
    'use strict';
    WinJS.Namespace.define("CommonJS", {
        ProcessListener: WinJS.Class.define(function processListenerInit() {
            if (!CommonJS.processListener) {
                CommonJS.processListener = this;
                this._localSettings = Windows.Storage.ApplicationData.current.localSettings.values
            }
            return CommonJS.processListener
        }, {
            _personalizationUpgradeNeededKey: "personalizationUpgrade", _freSetSyncPersonalizationNeededKey: "freSetSyncPersonalizationNeeded", _prefetchEndCheckPersonalizationSettingListenerID: null, _showPersnoalizationTimeout: null, _searchBox: null, _localSettings: null, afterFirstView: function afterFirstView() {
                if (CommonJS.FlightingManager) {
                    msSetImmediate(function loadFlightingManager() {
                        CommonJS.FlightingManager.instance.initializeAsync()
                    })
                }
                msSetImmediate(this._checkPersonalizationSetting.bind(this));
                msSetImmediate(this._checkTermsUpdate.bind(this));
                CommonJS.Watermark.Init();
                if (PlatformJS.isDebug) {
                    WinJS.UI.Fragments.cache("/common/Tools/NTL/html/ntl.html").then(function onNtlLoad_complete() {
                        if (CommonJS.DebugServices) {
                            CommonJS.DebugServices.start()
                        }
                        else {
                            debugger
                        }
                    }, function onNtlLoad_error(errorMessage) { })
                }
            }, onNavigating: function onNavigating(event) {
                this._searchBox = null
            }, getSearchBoxInstance: function getSearchBoxInstance() {
                if (this._searchBox) {
                    return this._searchBox
                }
                else {
                    return null
                }
            }, setupSearchBox: function setupSearchBox() {
                msWriteProfilerMark("Platform:Navigation:SetupSearchBox:s");
                var that = this;
                var currentPage = PlatformJS.Navigation.mainNavigator.currentIPage;
                if (currentPage && currentPage.getSearchBoxData) {
                    currentPage.getSearchBoxData().then(function navigator_searchBoxData(searchBoxData) {
                        if (searchBoxData && !currentPage.hasBoundGlobalSearchBox) {
                            var options = searchBoxData.options || {};
                            options.isPageSearch = true;
                            if (PlatformJS.mainProcessManager.retailModeEnabled) {
                                options.disabled = true
                            }
                            var searchBoxElement = searchBoxData.element;
                            if (!searchBoxElement) {
                                searchBoxElement = document.createElement("div")
                            }
                            var pageElement = document.getElementById("platformPageArea");
                            var fragments = WinJS.Utilities.query(".fragment", pageElement);
                            if (fragments && fragments.length > 0 && fragments[0]) {
                                pageElement = fragments[0];
                                var platformPanoramaViewport = pageElement.getElementsByClassName("platformPanoramaViewport");
                                if (platformPanoramaViewport && platformPanoramaViewport.length > 0) {
                                    pageElement = platformPanoramaViewport[0]
                                }
                            }
                            if (pageElement) {
                                pageElement.appendChild(searchBoxElement);
                                currentPage.hasBoundGlobalSearchBox = true
                            }
                            var startMinimized = options.startMinimized;
                            if (!options.startMinimized && CommonJS.Immersive.PlatformHeroControl.getInstance()) {
                                var heroVisibleWidth = CommonJS.Immersive.PlatformHeroControl.getHeroVisibleWidth();
                                if (heroVisibleWidth) {
                                    if (heroVisibleWidth < 0 || ((window.innerWidth - heroVisibleWidth) > CommonJS.Search.SEARCH_BOX_WIDTH)) {
                                        options.startMinimized = false
                                    }
                                    else {
                                        options.startMinimized = true
                                    }
                                }
                            }
                            var searchTextBox = new CommonJS.Search.SearchTextBox(searchBoxElement, options);
                            that._searchBox = searchTextBox;
                            searchTextBox.startMinimized = startMinimized ? true : false
                        }
                    })
                }
            }, disableSearchOnType: function disableSearchOnType() {
                if (CommonJS && CommonJS.Search) {
                    CommonJS.Search.disableTypeToSearch()
                }
            }, enableSearchOnType: function enableSearchOnType() {
                if (CommonJS && CommonJS.Search) {
                    CommonJS.Search.enableTypeToSearch()
                }
            }, _checkPersonalizationSetting: function _checkPersonalizationSetting() {
                var that = this;
                if (this._upgrade81FirstRun() || this._personalizationUpgradeNeeded) {
                    this._handlePersonalizationUpgrade()
                }
                else if (!CommonJS.Utils.isFREDone() || this._freSetSyncPersonalizationNeeded) {
                    this._freSetSyncOnPersonalizationOn()
                }
                else {
                    Platform.Storage.PersonalizedDataService.isConnectedAsync().then(function pdsIsConnected_Complete(connected) {
                        if (connected && Platform.Storage.PersonalizedDataService.isPersonalDataPlatformEnabled) {
                            var pds = CommonJS.PrivacySettings._getPDS();
                            if (pds) {
                                pds.isPersonalizationEnabledAsync().then(function isPersonalizationEnabled(personalizationEnabled) {
                                    if (!personalizationEnabled) {
                                        that._showPersonalizationUpgradeDialog(pds, false)
                                    }
                                })
                            }
                        }
                    })
                }
            }, _freSetSyncOnPersonalizationOn: function _freSetSyncOnPersonalizationOn() {
                var that = this;
                this._freSetSyncPersonalizationNeeded = true;
                Platform.Storage.PersonalizedDataService.isConnectedAsync().then(function fre_PdsIsConnected_Complete(connected) {
                    if (connected) {
                        Platform.Storage.PersonalizedDataService.isPersonalDataPlatformEnabled = true;
                        var pds = CommonJS.PrivacySettings._getPDS();
                        if (pds) {
                            pds.setPersonalizationEnabled(true).then(function fre_PdsSetPersonalizationEnabled_Complete() {
                                that._removeFRESetSyncPersonalizationNeeded();
                                that._handleDelayPrivacyIndicator()
                            })
                        }
                    }
                })
            }, _freSetSyncPersonalizationNeeded: {
                get: function get() {
                    return this._localSettings[this._freSetSyncPersonalizationNeededKey]
                }, set: function set(value) {
                    this._localSettings[this._freSetSyncPersonalizationNeededKey] = value
                }
            }, _removeFRESetSyncPersonalizationNeeded: function _removeFRESetSyncPersonalizationNeeded() {
                this._localSettings.remove(this._freSetSyncPersonalizationNeededKey)
            }, _handleDelayPrivacyIndicator: function _handleDelayPrivacyIndicator() {
                var channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel("Home", "standard"),
                    current = WinJS.Navigation.history.current;
                if (channelInfo && current) {
                    var homeFragment = PlatformJS.Utilities.getDeepObject(channelInfo, "pageInfo.fragment"),
                        homePage = PlatformJS.Utilities.getDeepObject(channelInfo, "pageInfo.page"),
                        currentFragment = PlatformJS.Utilities.getDeepObject(current, "location.fragment"),
                        currentPage = PlatformJS.Utilities.getDeepObject(current, "location.page");
                    if (homeFragment === currentFragment && homePage === currentPage) {
                        var waitForPreFetch = PlatformJS.Services.configuration.getBool("PrivacyIndicatorWaitForPrefetch"),
                            delay = PlatformJS.Services.configuration.getBool("DelayPrivacyIndicator"),
                            that = this;
                        if (waitForPreFetch) {
                            this._prefetchEndCheckPersonalizationSettingListenerID = PlatformJS.mainProcessManager.addPrefetchEndViewListener(function delayCheckPersonalizationSetting() {
                                if (that._prefetchEndCheckPersonalizationSettingListenerID !== null) {
                                    PlatformJS.mainProcessManager.removePrefetchEndViewListener(that._prefetchEndCheckPersonalizationSettingListenerID);
                                    that._prefetchEndCheckPersonalizationSettingListenerID = null
                                }
                                that._delayShowPersonalizationSetting()
                            })
                        }
                        else if (delay) {
                            this._delayShowPersonalizationSetting()
                        }
                        if (waitForPreFetch || delay) {
                            var removePersonalizationListener = function () {
                                if (that._prefetchEndCheckPersonalizationSettingListenerID !== null) {
                                    PlatformJS.mainProcessManager.removePrefetchEndViewListener(that._prefetchEndCheckPersonalizationSettingListenerID);
                                    that._prefetchEndCheckPersonalizationSettingListenerID = null
                                }
                                clearTimeout(that._showPersnoalizationTimeout);
                                WinJS.Navigation.removeEventListener("beforenavigate", removePersonalizationListener)
                            };
                            WinJS.Navigation.addEventListener("beforenavigate", removePersonalizationListener)
                        }
                        else {
                            this._checkIfShowPersonalizationIndicator()
                        }
                    }
                }
            }, _checkIfShowPersonalizationIndicator: function _checkIfShowPersonalizationIndicator() {
                var that = this,
                    pds = Platform.Storage.PersonalizedDataService;
                pds.isConnectedAsync().then(function afterCheckMSASingedIn(isConnected) {
                    if (isConnected) {
                        if (Platform.Storage.PersonalizedDataService.isPersonalDataPlatformEnabled) {
                            that._showPersonalizationIndicatorIfNeeded(true)
                        }
                        else {
                            var adsControl = that._getAdsControl();
                            if (adsControl) {
                                that._showPersonalizationIndicatorIfNeeded(adsControl.getUserTargetingSetting() === "On")
                            }
                            else {
                                that._adsClusterAddedListenerID = PlatformJS.mainProcessManager.addAdsClusterAddedListener(function checkAdsSettings() {
                                    PlatformJS.mainProcessManager.removeAdsClusterAddedListener(that._adsClusterAddedListenerID);
                                    that._adsClusterAddedListenerID = null;
                                    adsControl = that._getAdsControl();
                                    if (adsControl) {
                                        that._showPersonalizationIndicatorIfNeeded(adsControl.getUserTargetingSetting() === "On")
                                    }
                                });
                                var removeAdsClusterListener = function () {
                                    if (that._adsClusterAddedListenerID !== null) {
                                        PlatformJS.mainProcessManager.removeAdsClusterAddedListener(that._adsClusterAddedListenerID);
                                        that._adsClusterAddedListenerID = null
                                    }
                                    WinJS.Navigation.removeEventListener("beforenavigate", removeAdsClusterListener)
                                };
                                WinJS.Navigation.addEventListener("beforenavigate", removeAdsClusterListener)
                            }
                        }
                    }
                    else {
                        that._showPersonalizationIndicatorIfNeeded(false)
                    }
                })
            }, _showPersonalizationIndicatorIfNeeded: function _showPersonalizationIndicatorIfNeeded(personalized) {
                if (PlatformJS.mainProcessManager.retailModeEnabled) {
                    return
                }
                var lastPersonalizedKey = "appPersonalizedAtLastStart",
                    lastPersonalized = false,
                    remainingIndicatorCountKey = "personalizedIndicatorRemainingCount",
                    remainingIndicatorCount = 3,
                    message,
                    isPersonalized = CommonJS.resourceLoader.getString("/platform/MessageOptimizedMSAinfo"),
                    modifySettings = CommonJS.resourceLoader.getString("/platform/MessagePersonalizeSettings"),
                    duration = PlatformJS.BootCache.instance.getEntry("PrivacyWarningMessageDuration", function _Navigator_1382() {
                        return PlatformJS.Services.configuration.getInt32("PrivacyWarningMessageDuration")
                    });
                if (!personalized) {
                    this._localSettings[lastPersonalizedKey] = personalized
                }
                else {
                    lastPersonalized = this._localSettings[lastPersonalizedKey];
                    if (lastPersonalized !== personalized) {
                        this._localSettings[lastPersonalizedKey] = personalized;
                        remainingIndicatorCount = 3
                    }
                    else {
                        remainingIndicatorCount = this._localSettings[remainingIndicatorCountKey]
                    }
                    if (remainingIndicatorCount) {
                        message = "<a id=\"modifyPersonalizationSettingLink\">" + isPersonalized + modifySettings + "</a>";
                        CommonJS.Watermark.setWatermarkHtml(message, CommonJS.Watermark.STARTTIME.NOW, duration, function setModifySettingsLink() {
                            var modifySettingsLink = document.getElementById("modifyPersonalizationSettingLink");
                            if (modifySettingsLink) {
                                modifySettingsLink.onclick = CommonJS.PrivacySettings.onPrivacySettingsCmd
                            }
                        }, CommonJS.Watermark.PRIORITY.PRIVACYWARING);
                        remainingIndicatorCount--;
                        this._localSettings[remainingIndicatorCountKey] = remainingIndicatorCount
                    }
                }
            }, _checkTermsUpdate: function _checkTermsUpdate() {
                var that = this;
                var termsUpdateFREDoneKey = "termsUpdateNotificationFREDone";
                var isTermsFREDone = this._localSettings[termsUpdateFREDoneKey] || false;
                if (!isTermsFREDone) {
                    this._localSettings[termsUpdateFREDoneKey] = true;
                    return
                }
                Platform.Storage.PersonalizedDataService.isConnectedAsync().then(function signedInCheckCompleted(connected) {
                    that._showCustomTermsUpdatedMsg(connected && Platform.Storage.PersonalizedDataService.isPersonalDataPlatformEnabled)
                })
            }, _showCustomTermsUpdatedMsg: function _showCustomTermsUpdatedMsg(isUserSignedInApp) {
                var that = this;
                var termsUpdateSetting = PlatformJS.Services.configuration.getDictionary("TermsUpdateNotification");
                if (termsUpdateSetting) {
                    var enabled = termsUpdateSetting.getBool("Enable");
                    if (enabled) {
                        var prepareTermsUpdateBeginDateString = termsUpdateSetting.getString("PrepareTermsUpdateBeginDate"),
                            prepareTermsUpdateEndDateString = termsUpdateSetting.getString("PrepareTermsUpdateEndDate"),
                            prepareTermsUpdateLink = termsUpdateSetting.getString("PrepareTermsUpdateLink"),
                            termsUpdatedBeginDateString = termsUpdateSetting.getString("TermsUpdatedBeginDate"),
                            termsUpdatedEndDateString = termsUpdateSetting.getString("TermsUpdatedEndDate"),
                            termsUpdatedLink = termsUpdateSetting.getString("TermsUpdatedLink"),
                            now = new Date,
                            message = null,
                            link = null,
                            popupDismissedDateSettingKey = null,
                            actionPrefix = "";
                        var prepareTermsUpdateNotificationDismissedDateKey = "prepareTermsUpdateNotificationDismissedDate",
                            prepareTermsUpdateDismissedDate = new Date(0),
                            termsUpdatedNotificationDismissedDateKey = "termsUpdatedNotificationDismissedDate",
                            termsUpdatedDismissedDate = new Date(0);
                        if (prepareTermsUpdateBeginDateString && prepareTermsUpdateEndDateString) {
                            var beginDate = new Date(prepareTermsUpdateBeginDateString),
                                endDate = new Date(prepareTermsUpdateEndDateString);
                            var prepareTermsUpdateBeginDate = new Date(beginDate.getUTCFullYear(), beginDate.getUTCMonth(), beginDate.getUTCDate()),
                                prepareTermsUpdateEndDate = new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 23, 59, 59, 999)
                        }
                        if (termsUpdatedBeginDateString && termsUpdatedEndDateString) {
                            var beginDate = new Date(termsUpdatedBeginDateString),
                                endDate = new Date(termsUpdatedEndDateString);
                            var termsUpdatedBeginDate = new Date(beginDate.getUTCFullYear(), beginDate.getUTCMonth(), beginDate.getUTCDate()),
                                termsUpdatedEndDate = new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 23, 59, 59, 999)
                        }
                        if (this._localSettings[prepareTermsUpdateNotificationDismissedDateKey]) {
                            prepareTermsUpdateDismissedDate = new Date(this._localSettings[prepareTermsUpdateNotificationDismissedDateKey])
                        }
                        if (this._localSettings[termsUpdatedNotificationDismissedDateKey]) {
                            termsUpdatedDismissedDate = new Date(this._localSettings[termsUpdatedNotificationDismissedDateKey])
                        }
                        if (termsUpdatedDismissedDate && termsUpdatedBeginDate && termsUpdatedEndDate && termsUpdatedDismissedDate < termsUpdatedBeginDate && now >= termsUpdatedBeginDate && now <= termsUpdatedEndDate) {
                            message = CommonJS.resourceLoader.getString("/platform/MessageTermsAndPrivacyUpdated");
                            link = termsUpdatedLink;
                            popupDismissedDateSettingKey = termsUpdatedNotificationDismissedDateKey;
                            actionPrefix = "Post-update"
                        }
                        else if (prepareTermsUpdateDismissedDate && prepareTermsUpdateBeginDate && prepareTermsUpdateEndDate && prepareTermsUpdateDismissedDate < prepareTermsUpdateBeginDate && now >= prepareTermsUpdateBeginDate && now <= prepareTermsUpdateEndDate && now < termsUpdatedBeginDate) {
                            message = CommonJS.resourceLoader.getString("/platform/MessageTermsAndPrivacyUpdateNotif");
                            link = prepareTermsUpdateLink;
                            popupDismissedDateSettingKey = prepareTermsUpdateNotificationDismissedDateKey;
                            actionPrefix = "Pre-update"
                        }
                        if (message && link) {
                            if (isUserSignedInApp) {
                                this._localSettings[popupDismissedDateSettingKey] = now.toISOString();
                                return
                            }
                            var messageData = {
                                message: message, defaultFocusButtonIndex: 0, defaultCancelButtonIndex: 1, styleClass: "fre", buttons: [{
                                    label: CommonJS.resourceLoader.getString("/platform/MessageTermsUpdateButton"), clickHandler: function learnMoreClicked() {
                                        that._logUserAction("Terms of use", actionPrefix + ": learn more");
                                        that._localSettings[popupDismissedDateSettingKey] = now.toISOString();
                                        Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(link))
                                    }
                                }, {
                                    label: CommonJS.resourceLoader.getString("/platform/MessageTermsUpdateCloseButton"), clickHandler: function closeTOU() {
                                        that._logUserAction("Terms of use", actionPrefix + ": dismiss");
                                        that._localSettings[popupDismissedDateSettingKey] = now.toISOString()
                                    }
                                }]
                            };
                            var messageDialog = new CommonJS.UI.MessageDialog(messageData);
                            messageDialog.showAsync();
                            this._logAppAction(actionPrefix + " - " + (new Date).toString(), "ToU Notice", "terms of use shown")
                        }
                    }
                }
            }, _getAdsControl: function _getAdsControl() {
                var adsElements = document.getElementsByClassName("platformAd");
                if (adsElements.length) {
                    return adsElements[0].winControl
                }
                else {
                    return null
                }
            }, _upgrade81FirstRun: function _upgrade81FirstRun() {
                var isVersionUpdate = PlatformJS.mainProcessManager.isVersionUpdate();
                if (isVersionUpdate) {
                    var lastKnownCurrentVersion = this._localSettings["currentAppVersion"];
                    if (lastKnownCurrentVersion) {
                        var lastKnownCurrentVersionSplit = lastKnownCurrentVersion.split('.');
                        var versionRevisionNumber = 200;
                        if (lastKnownCurrentVersionSplit && lastKnownCurrentVersionSplit.length === 4 && lastKnownCurrentVersionSplit[0] === "3" && lastKnownCurrentVersionSplit[1] === "0" && lastKnownCurrentVersionSplit[2] === "1" && parseInt(lastKnownCurrentVersionSplit[3], 10) >= versionRevisionNumber) {
                            return true
                        }
                    }
                }
                return false
            }, _personalizationUpgradeNeeded: {
                get: function get() {
                    return this._localSettings[this._personalizationUpgradeNeededKey]
                }, set: function set(value) {
                    this._localSettings[this._personalizationUpgradeNeededKey] = value
                }
            }, _removePersonalizationUpgradeNeeded: function _removePersonalizationUpgradeNeeded() {
                this._localSettings.remove(this._personalizationUpgradeNeededKey)
            }, _handlePersonalizationUpgrade: function _handlePersonalizationUpgrade() {
                var that = this;
                this._personalizationUpgradeNeeded = true;
                Platform.Storage.PersonalizedDataService.isConnectedAsync().then(function pdsIsConnected_Complete(connected) {
                    if (connected) {
                        var syncEnabled = Platform.Storage.PersonalizedDataService.isPersonalDataPlatformEnabled;
                        var pds = CommonJS.PrivacySettings._getPDS();
                        if (pds) {
                            pds.isPersonalizationEnabledAsync().then(function isPersonalizationEnabled(personalizationEnabled) {
                                if (!syncEnabled || !personalizationEnabled) {
                                    that._showPersonalizationUpgradeDialog(pds, true)
                                }
                                else {
                                    that._removePersonalizationUpgradeNeeded()
                                }
                            })
                        }
                        else {
                            console.log("Personal data service not accessible.")
                        }
                    }
                })
            }, _showPersonalizationUpgradeDialog: function _showPersonalizationUpgradeDialog(pds, isUpgrade) {
                var that = this;
                var telemetryContext = "Personalization upgrade";
                var messageData = {
                    title: CommonJS.resourceLoader.getString("/platform/TitleMSAConnectionDescription"), message: CommonJS.resourceLoader.getString("/platform/MessageMSAConnectionDescription"), buttons: [{
                        label: CommonJS.resourceLoader.getString("/platform/accept"), clickHandler: function acceptClicked() {
                            that._logUserAction(telemetryContext, "Accepted");
                            Platform.Storage.PersonalizedDataService.isPersonalDataPlatformEnabled = true;
                            pds.setPersonalizationEnabled(true);
                            if (isUpgrade) {
                                that._removePersonalizationUpgradeNeeded()
                            }
                        }
                    }, {
                        label: CommonJS.resourceLoader.getString("/platform/decline"), clickHandler: function declineClicked() {
                            that._logUserAction(telemetryContext, "Declined");
                            Platform.Storage.PersonalizedDataService.isPersonalDataPlatformEnabled = false;
                            if (isUpgrade) {
                                that._removePersonalizationUpgradeNeeded()
                            }
                        }
                    }], styleClass: "fre"
                };
                var messageDialog = new CommonJS.UI.MessageDialog(messageData);
                messageDialog.showAsync();
                this._logAppAction((new Date).toString(), telemetryContext, "Upgrade message shown")
            }, _delayShowPersonalizationSetting: function _delayShowPersonalizationSetting() {
                this._showPersnoalizationTimeout = setTimeout(this._checkIfShowPersonalizationIndicator.bind(this), 5000)
            }, _logUserAction: function _logUserAction(context, action) {
                PlatformJS.deferredTelemetry(function _logUserAction() {
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, context, action, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0)
                })
            }, _logAppAction: function _logAppAction(element, context, operation) {
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logAppAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, context, element, operation, 0)
            }
        }, { processListener: null })
    })
})();
(function appexPlatformUtilitiesInit() {
    "use strict";
    WinJS.Namespace.define("PlatformJS.Telemetry", {
        Impression: WinJS.Class.define(function _telemetry_16() {
            this._contentKeysMappings = {}
        }, {
            _contentKeysMappings: null, _realImpression: null, _kValue: 1, isWrapper: true, _createKey: function _createKey(sourceName, partnerCode, contentId) {
                if (!sourceName && !partnerCode && !contentId) {
                    return null
                }
                sourceName = sourceName ? sourceName : "";
                partnerCode = partnerCode ? partnerCode : "";
                contentId = contentId ? contentId : "";
                return sourceName + "\t" + partnerCode + "\t" + contentId
            }, addContent: function addContent(sourceName, partnerCode, contentId, type, date, uri, slug, isSummary, worth, isAd, adCampaign) {
                var that = this;
                if (PlatformJS.isPlatformInitialized && that._realImpression) {
                    return that._realImpression.addContent(sourceName, partnerCode, contentId, type, date, uri, slug, isSummary, worth, isAd, adCampaign)
                }
                else {
                    PlatformJS.deferredTelemetry(function _telemetry_48() {
                        if (that._realImpression) {
                            that._realImpression.addContent(sourceName, partnerCode, contentId, type, date, uri, slug, isSummary, worth, isAd, adCampaign)
                        }
                    });
                    var contentKey = this._createKey(sourceName, partnerCode, contentId);
                    if (!contentKey) {
                        return 0
                    }
                    if (this._contentKeysMappings.contentKey) {
                        return this._contentKeysMappings.contentKey
                    }
                    else {
                        this._contentKeysMappings[contentKey] = this._kValue
                    }
                    return this._kValue++
                }
            }, logContentClear: function logContentClear(level, reason) {
                var that = this;
                PlatformJS.deferredTelemetry(function _telemetry_73() {
                    if (that._realImpression) {
                        that._realImpression.logContentClear(level, reason)
                    }
                })
            }, logContentClearWithJsonAttributes: function logContentClearWithJsonAttributes(level, reason, jsonAttributes) {
                var that = this;
                PlatformJS.deferredTelemetry(function _telemetry_81() {
                    if (that._realImpression) {
                        that._realImpression.logContentClearWithJsonAttributes(level, reason, jsonAttributes)
                    }
                })
            }, logContent: function logContent(level) {
                var that = this;
                PlatformJS.deferredTelemetry(function _telemetry_89() {
                    if (that._realImpression) {
                        that._realImpression.logContent(level)
                    }
                })
            }, logContentWithJsonAttributes: function logContentWithJsonAttributes(level, jsonAttributes) {
                var that = this;
                PlatformJS.deferredTelemetry(function _telemetry_97() {
                    if (that._realImpression) {
                        that._realImpression.logContentWithJsonAttributes(level, jsonAttributes)
                    }
                })
            }, addContentLayoutRegion: function addContentLayoutRegion(name, kValues) {
                var that = this;
                PlatformJS.deferredTelemetry(function _telemetry_105() {
                    if (that._realImpression) {
                        that._realImpression.addContentLayoutRegion(name, kValues)
                    }
                })
            }, logContentLayout: function logContentLayout(level) {
                var that = this;
                PlatformJS.deferredTelemetry(function _telemetry_113() {
                    if (that._realImpression) {
                        that._realImpression.logContentLayout(level)
                    }
                })
            }, logContentLayoutWithJsonAttributes: function logContentLayoutWithJsonAttributes(level, jsonAttributes) {
                var that = this;
                PlatformJS.deferredTelemetry(function _telemetry_121() {
                    if (that._realImpression) {
                        that._realImpression.logContentLayoutWithJsonAttributes(level, jsonAttributes)
                    }
                })
            }, logContentView: function logContentView(level, k, viewMechanism, logOnlyIfNotViewed, progress) {
                var that = this;
                PlatformJS.deferredTelemetry(function _telemetry_129() {
                    if (that._realImpression) {
                        that._realImpression.logContentView(level, k, viewMechanism, logOnlyIfNotViewed, progress)
                    }
                })
            }, logContentViewWithJsonAttributes: function logContentViewWithJsonAttributes(level, k, viewMechanism, logOnlyIfNotViewed, progress, jsonAttributes) {
                var that = this;
                PlatformJS.deferredTelemetry(function _telemetry_137() {
                    if (that._realImpression) {
                        that._realImpression.logContentViewWithJsonAttributes(level, k, viewMechanism, logOnlyIfNotViewed, progress, jsonAttributes)
                    }
                })
            }, logContentShare: function logContentShare(level, target, uri, k) {
                var that = this;
                PlatformJS.deferredTelemetry(function _telemetry_145() {
                    if (that._realImpression) {
                        that._realImpression.logContentShare(level, target, uri, k)
                    }
                })
            }, logContentShareWithJsonAttributes: function logContentShareWithJsonAttributes(level, target, uri, k, jsonAttributes) {
                var that = this;
                PlatformJS.deferredTelemetry(function _telemetry_153() {
                    if (that._realImpression) {
                        that._realImpression.logContentShareWithJsonAttributes(level, target, uri, k, jsonAttributes)
                    }
                })
            }, logContentError: function logContentError(level, k, uri, message, httpCode, exception, latency) {
                var that = this;
                PlatformJS.deferredTelemetry(function _telemetry_161() {
                    if (that._realImpression) {
                        that._realImpression.logContentError(level, k, uri, message, httpCode, exception, latency)
                    }
                })
            }, logContentErrorWithJsonAttributes: function logContentErrorWithJsonAttributes(level, k, uri, message, httpCode, exception, latency, jsonAttributes) {
                var that = this;
                PlatformJS.deferredTelemetry(function _telemetry_169() {
                    if (that._realImpression) {
                        that._realImpression.logContentErrorWithJsonAttributes(level, k, uri, message, httpCode, exception, latency, jsonAttributes)
                    }
                })
            }
        }), flightRecorder: {
            logImpressionStart: function logImpressionStart(logLevel, context, impressionType, navMethod, partnerCode) {
                var impression;
                if (PlatformJS.isPlatformInitialized) {
                    impression = Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logImpressionStart(logLevel, context, impressionType, navMethod, partnerCode)
                }
                else {
                    impression = new PlatformJS.Telemetry.Impression;
                    PlatformJS.deferredTelemetry(function _telemetry_187() {
                        impression._realImpression = Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logImpressionStart(logLevel, context, impressionType, navMethod, partnerCode)
                    })
                }
                return impression
            }, logImpressionStartWithJsonAttributes: function logImpressionStartWithJsonAttributes(logLevel, context, impressionType, navMethod, partnerCode, jsonAttributes) {
                var impression;
                if (PlatformJS.isPlatformInitialized) {
                    impression = Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logImpressionStartWithJsonAttributes(logLevel, context, impressionType, navMethod, partnerCode, jsonAttributes)
                }
                else {
                    impression = new PlatformJS.Telemetry.Impression;
                    PlatformJS.deferredTelemetry(function _telemetry_200() {
                        impression._realImpression = Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logImpressionStartWithJsonAttributes(logLevel, context, impressionType, navMethod, partnerCode, jsonAttributes)
                    })
                }
                return impression
            }, logImpressionResume: function logImpressionResume(logLevel, resumedImpression) {
                var actualImpression = this._getRealImpression(resumedImpression);
                if (actualImpression) {
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logImpressionResume(logLevel, actualImpression)
                }
            }, logImpressionResumeWithJsonAttributes: function logImpressionResumeWithJsonAttributes(logLevel, resumedImpression, jsonAttributes) {
                var actualImpression = this._getRealImpression(resumedImpression);
                if (actualImpression) {
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logImpressionResumeWithJsonAttributes(logLevel, actualImpression, jsonAttributes)
                }
            }, logImpressionExit: function logImpressionExit(logLevel) {
                PlatformJS.deferredTelemetry(function _telemetry_221() {
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logImpressionExit(logLevel)
                })
            }, initializeDisplay: function initializeDisplay(width, height, scale) {
                PlatformJS.deferredTelemetry(function _telemetry_227() {
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.initializeDisplay(width, height, scale)
                })
            }, logDisplayChange: function logDisplayChange(level, width, height, scale) {
                PlatformJS.deferredTelemetry(function _telemetry_232() {
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logDisplayChange(level, width, height, scale)
                })
            }, logPreferencesAsJson: function logPreferencesAsJson(level, jsonPreferences) {
                PlatformJS.deferredTelemetry(function _telemetry_238() {
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logPreferencesAsJson(level, jsonPreferences)
                })
            }, logPerf: function logPerf(level, markerText, name, perfContext, duration) {
                PlatformJS.deferredTelemetry(function _telemetry_244() {
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logPerf(level, markerText, name, perfContext, duration)
                })
            }, logCodeError: function logCodeError(level, message, stack) {
                PlatformJS.deferredTelemetry(function _telemetry_250() {
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCodeError(level, PlatformJS.Telemetry.JavaScriptRuntimeEnvironment, message, stack)
                })
            }, _getRealImpression: function _getRealImpression(impression) {
                if (!impression) {
                    return null
                }
                if (impression.isWrapper) {
                    return impression._realImpression
                }
                else {
                    return impression
                }
            }
        }, logLevel: {
            Diagnostic: -2, Low: -1, Normal: 0, High: 1, Critical: 2
        }, contentWorth: {
            Normal: 0, Free: 1, Premium: 2, Subscription: 3
        }, contentType: {
            Unknown: "unknown", Package: "package", Image: "image", Cluster: "cluster", Article: "article", Map: "map", Chart: "chart", Audio: "audio", Video: "video", Table: "table", Slideshow: "slideshow", Link: "link"
        }, searchMethod: {
            Unknown: 0, Charm: 1, Form: 2, View: 3
        }, JavaScriptRuntimeEnvironment: 2
    })
})()