/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.strictProcessing();
    WinJS.Binding.optimizeBindingReferences = true;
    scriptValidator();
    MS.Entertainment.Utilities.updateHtmlDirectionAttribute();
    MS.Entertainment.UI.Framework.unblockCriticalPreloading();
    MS.Entertainment.UI.Framework.enableAutoControlCleanup();
    MS.Entertainment.UI.Framework.enableSetImmediateBatching();
    var appDisplayName = "";
    if (window.usingNewMusicPage)
        return;
    var applicationLifetimeManager = null;
    var commonEventProvider = null;
    var tileManager = null;
    var initialized = false;
    var alreadyHandledLaunch = false;
    var startPlaybackOnLaunch = false;
    var stageTwoInitialized = false;
    var stageThreePromise = null;
    var stageFourPromise = null;
    var stageFourDelay = 5000;
    var shouldShowAppBar = false;
    var showAppBarDelay = 0;
    var wasRecentlyResumed = false;
    var isPrelaunched = false;
    if (window.clientInformation && window.clientInformation.cpuClass === "ARM")
        showAppBarDelay = 5000;
    WinJS.Application.onerror = MS.Entertainment.UI.Debug.unhandledPromiseErrorHandler;
    WinJS.Namespace.define("MS.Entertainment.UI.Application", {Activation: MS.Entertainment.UI.Framework.define(null, null, {
            handlePrelaunch: function handlePrelaunch(args) {
                isPrelaunched = true;
                MS.Entertainment.UI.Application.Helpers.removeExtendedSplashScreen();
                var delayedStageThreePath = "/delayedStageThreeStartup.html";
                if (window.useNewVideoPage)
                    delayedStageThreePath = "/Classic" + delayedStageThreePath;
                MS.Entertainment.Utilities.loadHtmlPage(delayedStageThreePath, "delayedStartupContainer");
                var activationArgsClone = MS.Entertainment.Utilities.cloneActivationArguments(args);
                var madeVisibleCount = 0;
                var documentEvents = MS.Entertainment.UI.Framework.addEventHandlers(document, {visibilitychange: function() {
                            if (document.hidden)
                                return;
                            isPrelaunched = false;
                            documentEvents.cancel();
                            MS.Entertainment.Utilities.resetPerfTrackStartTime();
                            MS.Entertainment.UI.Application.Activation.activated(activationArgsClone, false, true)
                        }})
            }, activated: function activated(activationArgs, isNonRootActivationHandler, preLaunched) {
                    if (window.sessionStorage["HardBlockEnabled"] === "true") {
                        WinJS.Promise.timeout().then(function _delay() {
                            window.location.href = "UpdateApp.html"
                        });
                        MS.Entertainment.Instrumentation.PerfTrack.disableAllStartupScenarios();
                        return
                    }
                    if (activationArgs.prelaunchActivated) {
                        MS.Entertainment.UI.Application.Activation.handlePrelaunch(activationArgs);
                        return
                    }
                    if (!isNonRootActivationHandler) {
                        if (activationArgs.arguments === MS.Entertainment.Utilities.retailExperienceArgument)
                            MS.Entertainment.Utilities.setRetailExperienceState(true);
                        WinJS.Application.start();
                        if (!commonEventProvider)
                            commonEventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Common;
                        commonEventProvider.traceProcessInitializeEventStart();
                        var startTime = new Date;
                        if (!applicationLifetimeManager)
                            applicationLifetimeManager = new Microsoft.Entertainment.ApplicationLifetimeManager;
                        if (!preLaunched)
                            applicationLifetimeManager.raiseActivated(activationArgs)
                    }
                    var isFirstRun = !initialized;
                    var isSupported = true;
                    if (!initialized) {
                        var className;
                        MS.Entertainment.UI.Application.Helpers.activationTelemetryData = [];
                        if (!isNonRootActivationHandler) {
                            var demoModeAppStateReset = MS.Entertainment.Utilities.resetAppStateForRetailExperienceIfNeeded();
                            (new Microsoft.Entertainment.Application.Application).init(Microsoft.Entertainment.Application.ExecMode.foreground);
                            if (demoModeAppStateReset)
                                MS.Entertainment.Utilities.removeAllPlaylistsIfDemoMode()
                        }
                        var stateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        var currentPackage = Windows.ApplicationModel.Package.current;
                        var currentVersion = currentPackage.id.version;
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        var minVersionSupported;
                        var minServiceVersionSupported;
                        if (MS.Entertainment.Utilities.valueFromPropertyPathFragments(Windows, ["ApplicationModel", "Search", "SearchPane", "hideThisApplication"]))
                            Windows.ApplicationModel.Search.SearchPane.hideThisApplication();
                        if (MS.Entertainment.Utilities.isMusicApp) {
                            appDisplayName = String.load(String.id.IDS_MANIFEST_MUSIC_APP_NAME);
                            className = "music music2 app2";
                            stateService.applicationTitle = String.load(String.id.IDS_XBOX_MUSIC2_APP_TITLE);
                            minVersionSupported = MS.Entertainment.Utilities.parseVersionString(configurationManager.fue.minMusicAppSupportedVersion);
                            minServiceVersionSupported = MS.Entertainment.Utilities.parseVersionString(configurationManager.service.minMusicServiceSupportedVersion)
                        }
                        else if (MS.Entertainment.Utilities.isVideoApp) {
                            appDisplayName = String.load(String.id.IDS_MANIFEST_VIDEO_APP_NAME);
                            if (MS.Entertainment.Utilities.isVideoApp1) {
                                className = "video video1 app1";
                                stateService.applicationTitle = String.load(String.id.IDS_XBOX_VIDEO_APP_TITLE)
                            }
                            else {
                                className = "video video2 app2";
                                stateService.applicationTitle = String.load(String.id.IDS_XBOX_VIDEO2_APP_TITLE)
                            }
                            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                            if (!featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace) && !featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace))
                                className += " " + MS.Entertainment.Utilities.noMarketplaceRootClassName;
                            minVersionSupported = MS.Entertainment.Utilities.parseVersionString(configurationManager.fue.minVideoAppSupportedVersion);
                            minServiceVersionSupported = MS.Entertainment.Utilities.parseVersionString(configurationManager.service.minVideoServiceSupportedVersion)
                        }
                        else if (MS.Entertainment.Utilities.isTestApp) {
                            appDisplayName = "test";
                            className = "test";
                            minVersionSupported = MS.Entertainment.Utilities.parseVersionString("1.0.0.0");
                            minServiceVersionSupported = MS.Entertainment.Utilities.parseVersionString("1.0.0.0")
                        }
                        else
                            className = String.empty;
                        if (configurationManager.shell.retailExperience)
                            className += " demo";
                        var versionSupported = (MS.Entertainment.Utilities.compareVersions(currentVersion, minVersionSupported) >= 0);
                        stateService.servicesEnabled = (MS.Entertainment.Utilities.compareVersions(currentVersion, minServiceVersionSupported) >= 0);
                        if (!versionSupported) {
                            WinJS.Promise.timeout().then(function _delay() {
                                window.location.href = "UpdateApp.html"
                            });
                            MS.Entertainment.Instrumentation.PerfTrack.disableAllStartupScenarios();
                            return
                        }
                        WinJS.Utilities.addClass(document.documentElement, className);
                        MS.Entertainment.UI.Framework.flags.attachCookieToRemovedDomElements = configurationManager.shell.attachCookieToRemovedDomElements;
                        MS.Entertainment.UI.Framework.flags.attachLargeObjectToUnloadedControl = configurationManager.shell.attachLargeObjectToUnloadedControl;
                        if (MS.Entertainment.Utilities.isApp2) {
                            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.winJSNavigation))
                                MS.Entertainment.ServiceLocator.unregister(MS.Entertainment.Services.winJSNavigation);
                            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.videoQueryCacheService)) {
                                var videoQueryCacheService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.videoQueryCacheService);
                                videoQueryCacheService.startQueries()
                            }
                            var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                            signIn.signInApp2User();
                            if (!MS.Entertainment.isAppModeOverride);
                            document.body.addEventListener("keyup", function(e) {
                                if (e.keyCode === WinJS.Utilities.Key.invokeButton || (!e.altKey && e.keyCode === WinJS.Utilities.Key.enter && !MS.Entertainment.Utilities.doesElementSupportKeyboardInput(e.target))) {
                                    if (document.activeElement && document.activeElement.click && e.target && e.target.tagName && e.target.tagName.toLowerCase() !== "button") {
                                        MS.Entertainment.Utilities.playSelectButtonClick();
                                        document.activeElement.click();
                                        e.stopPropagation();
                                        e.preventDefault()
                                    }
                                }
                                else if ((e.keyCode === WinJS.Utilities.Key.resetFocus) || (e.altKey && e.keyCode === WinJS.Utilities.Key.f))
                                    MS.Entertainment.UI.Framework.resetFocusToTopMostContent();
                                else if (e.altKey && e.keyCode === WinJS.Utilities.Key.m);
                            }, false)
                        }
                        if (MS.Entertainment.Utilities.isMusicApp)
                            MS.Entertainment.Utilities.useRadioStrings();
                        initialized = true
                    }
                    else
                        MS.Entertainment.Instrumentation.PerfTrack.disableAllStartupScenarios();
                    if (!isNonRootActivationHandler) {
                        var stopTime = new Date;
                        var duration = stopTime.valueOf() - startTime.valueOf();
                        commonEventProvider.traceProcessInitializeEventStop(duration)
                    }
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userTimeTelemetryManager).appActivated();
                    var doActivate = function doActivate(evt) {
                            var navigationService;
                            var eventKind;
                            var deeplinkUri;
                            var launchArgs;
                            var previousExecutionState;
                            var PlatLog = Microsoft.Entertainment.Platform.Logging;
                            var dataPoint = new PlatLog.DataPoint(PlatLog.LoggingLevel.telemetry, PlatLog.TelemetryAuthMethod.unauthenticated);
                            dataPoint.appendEventName("X8Run");
                            dataPoint.appendParameter("ClientResolution", screen.width + "x" + screen.height);
                            try {
                                eventKind = evt.kind;
                                previousExecutionState = evt.previousExecutionState
                            }
                            catch(e) {
                                var error = e && e.detail && e.detail.error;
                                var description = e && e.detail && e.detail.exception;
                                MS.Entertainment.fail("Exception while trying to acquire activation arguments. Error exception was:" + description + "." + "\n Error was:" + error);
                                return
                            }
                            try {
                                if (evt && evt.uri && evt.uri.rawUri)
                                    deeplinkUri = new Windows.Foundation.Uri(evt.uri.rawUri)
                            }
                            catch(e) {
                                var error = e && e.detail && e.detail.error;
                                var description = e && e.detail && e.detail.exception;
                                MS.Entertainment.fail("Could not access activation event URI. Error exception was: " + description + "." + "\n Error was " + error)
                            }
                            try {
                                if (evt && evt.arguments)
                                    launchArgs = evt.arguments
                            }
                            catch(e) {
                                var error = e && e.detail && e.detail.error;
                                var description = e && e.detail && e.detail.exception;
                                MS.Entertainment.fail("Could not access activation event arguments. Error exception was: " + description + "." + "\n Error was " + error)
                            }
                            if (eventKind === Windows.ApplicationModel.Activation.ActivationKind.launch && !deeplinkUri && launchArgs)
                                eventKind = Windows.ApplicationModel.Activation.ActivationKind.protocol;
                            else if (eventKind === Windows.ApplicationModel.Activation.ActivationKind.protocol && deeplinkUri && (!deeplinkUri.host || deeplinkUri.host === "default" || deeplinkUri.host === "media-default") && (!deeplinkUri.query || !alreadyHandledLaunch))
                                if (deeplinkUri.schemeName && deeplinkUri.schemeName.toLowerCase().indexOf("playto") !== -1)
                                    eventKind = Windows.ApplicationModel.Activation.ActivationKind.protocol;
                                else
                                    eventKind = Windows.ApplicationModel.Activation.ActivationKind.launch;
                            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.applicationStateManager)) {
                                var applicationStateManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.applicationStateManager);
                                var previousStateDeeplinkUri = applicationStateManager.getPreviousApplicationStateDeeplink(previousExecutionState, eventKind);
                                var appAndMachineRegionMatch = !MS.Entertainment.Utilities.isVideoApp2 || MS.Entertainment.Utilities.appRegionMatchesMachineRegion();
                                var isSnapped = MS.Entertainment.Utilities.getWindowWidth() <= 480;
                                if (!deeplinkUri && appAndMachineRegionMatch && previousStateDeeplinkUri && !isSnapped) {
                                    deeplinkUri = previousStateDeeplinkUri;
                                    eventKind = Windows.ApplicationModel.Activation.ActivationKind.protocol
                                }
                                else
                                    applicationStateManager.clearPreviousApplicationState()
                            }
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).activationKind = eventKind;
                            switch (eventKind) {
                                case Windows.ApplicationModel.Activation.ActivationKind.protocol:
                                    alreadyHandledLaunch = true;
                                    var deepLinkProcessed = false;
                                    var preProcessPromise = WinJS.Promise.as();
                                    var finishInitializing = function finishInitializing(){};
                                    var processStageTwo = function processStageTwo() {
                                            MS.Entertainment.UI.Application.Activation.activateStageTwo();
                                            var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                                            if (uiStateService.isSnapped && !(deeplinkUri && deeplinkUri.host === "media-playback"))
                                                MS.Entertainment.UI.Components.Shell.getUnsnapAction().execute()
                                        };
                                    if (MS.Entertainment.Utilities.isApp1) {
                                        MS.Entertainment.UI.Application.Helpers.showExtendedSplashScreen(evt.splashScreen);
                                        processStageTwo();
                                        preProcessPromise = MS.Entertainment.UI.Application.Activation.activateStageThree()
                                    }
                                    else {
                                        if (MS.Entertainment.Utilities.isVideoApp2)
                                            processStageTwo();
                                        finishInitializing = function finishInitializing() {
                                            processStageTwo();
                                            MS.Entertainment.UI.Application.Activation.activateStageThree()
                                        }
                                    }
                                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                                    signIn.signInOnStart();
                                    preProcessPromise.done(function preProcessFinished() {
                                        if (MS.Entertainment.Utilities.isApp2)
                                            MS.Entertainment.UI.Application.Helpers.showExtendedSplashScreen(evt.splashScreen);
                                        var playToUris = {
                                                microsoftMusic: new Windows.Foundation.Uri("microsoftmusic://playto?"), microsoftVideo: new Windows.Foundation.Uri("microsoftvideo://playto?")
                                            };
                                        var playToStartedFrom = {
                                                xboxVideo: "PlayTo-XboxVideo", xboxMusic: "PlayTo-XboxMusic", uknown: "PlayTo-Unknown"
                                            };
                                        if (!deeplinkUri && launchArgs)
                                            dataPoint.appendParameter("StartedFrom", "Deeplink");
                                        else if (MS.Entertainment.Utilities.isApp2 && deeplinkUri.schemeName && deeplinkUri.schemeName.toLowerCase().indexOf("playto") !== -1)
                                            switch (deeplinkUri.schemeName.toLowerCase()) {
                                                case"ms-playto-audio":
                                                    dataPoint.appendParameter("StartedFrom", playToStartedFrom.uknown);
                                                    deeplinkUri = playToUris.microsoftMusic;
                                                    break;
                                                case"ms-playtoapp-xboxmusic":
                                                    dataPoint.appendParameter("StartedFrom", playToStartedFrom.xboxMusic);
                                                    deeplinkUri = playToUris.microsoftMusic;
                                                    break;
                                                case"ms-playto-video":
                                                    dataPoint.appendParameter("StartedFrom", playToStartedFrom.uknown);
                                                    deeplinkUri = playToUris.microsoftVideo;
                                                    break;
                                                case"ms-playtoapp-xboxvideo":
                                                    dataPoint.appendParameter("StartedFrom", playToStartedFrom.xboxVideo);
                                                    deeplinkUri = playToUris.microsoftVideo;
                                                    break;
                                                default:
                                                    break
                                            }
                                        else
                                            dataPoint.appendParameter("StartedFrom", "Tile");
                                        if (!deepLinkProcessed)
                                            WinJS.Promise.join({
                                                validDeepLink: (deeplinkUri), showWelcomeDialog: MS.Entertainment.UI.Application.Helpers.shouldShowWelcomeDialog(), isLocationDeeplink: (deeplinkUri && deeplinkUri.host === "location"), isTestDeeplink: (deeplinkUri && deeplinkUri.host === "runTest")
                                            }).then(function(result) {
                                                var showWelcomeDialog = result.validDeepLink && result.validDeepLink !== playToUris.microsoftVideo && result.showWelcomeDialog && !result.isTestDeeplink;
                                                MS.Entertainment.UI.Application.Helpers.appConfig.showWelcomeDialog = showWelcomeDialog;
                                                var stage3Promise = WinJS.Promise.as();
                                                if (result.isLocationDeeplink || result.isTestDeeplink) {
                                                    MS.Entertainment.UI.Application.Activation.activateStageTwo();
                                                    if (result.isTestDeeplink)
                                                        stage3Promise = MS.Entertainment.UI.Application.Activation.activateStageThree()
                                                }
                                                if (showWelcomeDialog)
                                                    return stage3Promise.then(function() {
                                                            return MS.Entertainment.UI.Application.Helpers.removeExtendedSplashScreen()
                                                        });
                                                else
                                                    return stage3Promise
                                            }).done(function processDeeplink() {
                                                var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                                if (!MS.Entertainment.UI.DeepLink.processProtocol((deeplinkUri && deeplinkUri.rawUri), dataPoint, launchArgs)) {
                                                    finishInitializing();
                                                    MS.Entertainment.Instrumentation.PerfTrack.disableAllStartupScenarios();
                                                    navigationService.clearBackStackOnNextNavigate(false);
                                                    if (!navigationService.currentPage)
                                                        navigationService.init();
                                                    else
                                                        MS.Entertainment.UI.Application.Helpers.removeExtendedSplashScreen();
                                                    var title = MS.Entertainment.Utilities.isVideoApp ? String.load(String.id.IDS_VIDEO_DEEPLINK_ERROR_GENERIC_TITLE) : String.load(String.id.IDS_MUSIC_DEEPLINK_ERROR_GENERIC_TITLE);
                                                    var description = MS.Entertainment.Utilities.isVideoApp ? String.load(String.id.IDS_VIDEO_DEEPLINK_ERROR_GENERIC_DESC) : String.load(String.id.IDS_MUSIC_DEEPLINK_ERROR_GENERIC_DESC);
                                                    WinJS.Promise.timeout(1).done(function showErrorDialog() {
                                                        MS.Entertainment.UI.Shell.showMessageBox(title, description)
                                                    })
                                                }
                                                else {
                                                    finishInitializing();
                                                    var forceExitToSystemOnBack = true;
                                                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.applicationStateManager)) {
                                                        var applicationStateManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.applicationStateManager);
                                                        if (applicationStateManager.previousApplicationState && applicationStateManager.previousApplicationState.hasBackStack)
                                                            forceExitToSystemOnBack = false
                                                    }
                                                    navigationService.forceExitToSystemOnBack = forceExitToSystemOnBack;
                                                    MS.Entertainment.UI.Application.Helpers.removeExtendedSplashScreen();
                                                    if (isFirstRun)
                                                        if ((MS.Entertainment.Utilities.isVideoApp) || (MS.Entertainment.Utilities.isMusicApp))
                                                            if (deeplinkUri && deeplinkUri.host && deeplinkUri.host === "play")
                                                                MS.Entertainment.Instrumentation.PerfTrack.enableScenarioAppLaunchPlayProtectedContent()
                                                }
                                            })
                                    });
                                    break;
                                case Windows.ApplicationModel.Activation.ActivationKind.file:
                                    MS.Entertainment.UI.Application.Helpers.waitForDatabaseUpdated();
                                    if (isFirstRun && !isNonRootActivationHandler)
                                        if ((MS.Entertainment.Utilities.isVideoApp) || (MS.Entertainment.Utilities.isMusicApp)) {
                                            MS.Entertainment.Instrumentation.PerfTrack.enableScenarioAppLaunchPlayNonProtectedContent();
                                            MS.Entertainment.Instrumentation.PerfTrack.enableScenarioAppLaunchPlayProtectedContent()
                                        }
                                    MS.Entertainment.UI.Application.Helpers.showExtendedSplashScreen(evt.splashScreen);
                                    var loadFileActivationHtmlPromise = null;
                                    if (MS.Entertainment.Utilities.isApp1)
                                        loadFileActivationHtmlPromise = MS.Entertainment.Utilities.loadHtmlPage("/fileActivationStartup.html", "delayedStartupContainer");
                                    else
                                        loadFileActivationHtmlPromise = WinJS.Promise.wrap();
                                    loadFileActivationHtmlPromise.done(function loadFileActivationFiles() {
                                        MS.Entertainment.UI.Framework.setImmediateMode = MS.Entertainment.UI.Framework.setImmediateModes.none;
                                        var suppressNavigateToImmersive = false;
                                        var beginPlaybackPromise = new WinJS.Promise.as;
                                        if (!isNonRootActivationHandler)
                                            beginPlaybackPromise = MS.Entertainment.Activation.fileActivationHandler(evt, !isFirstRun, suppressNavigateToImmersive);
                                        beginPlaybackPromise.then(function continueStageTwo() {
                                            if (!suppressNavigateToImmersive)
                                                MS.Entertainment.UI.Application.Helpers.removeExtendedSplashScreen();
                                            MS.Entertainment.UI.Framework.setImmediateMode = MS.Entertainment.UI.Framework.setImmediateModes.startup;
                                            MS.Entertainment.UI.Application.Activation.activateStageTwo();
                                            if (isFirstRun && suppressNavigateToImmersive) {
                                                var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                                if (!isNonRootActivationHandler && !preLaunched)
                                                    navigationService.skipEnterAnimationOnNextNavigation = true;
                                                navigationService.init()
                                            }
                                            else
                                                MS.Entertainment.UI.Application.Activation.activateStageThree()
                                        }, function onError() {
                                            MS.Entertainment.Instrumentation.PerfTrack.disableAllStartupScenarios();
                                            MS.Entertainment.UI.Application.Activation.activateStageTwo();
                                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).init()
                                        })
                                    });
                                    dataPoint.appendParameter("StartedFrom", "File");
                                    break;
                                case Windows.ApplicationModel.Activation.ActivationKind.launch:
                                    if (alreadyHandledLaunch)
                                        return;
                                    alreadyHandledLaunch = true;
                                    MS.Entertainment.UI.Application.Helpers.showExtendedSplashScreen(evt.splashScreen);
                                    if (deeplinkUri && deeplinkUri.query && deeplinkUri.host === "default")
                                        try {
                                            var playState = deeplinkUri.queryParsed.getFirstValueByName("PlayState");
                                            startPlaybackOnLaunch = playState && playState.toLowerCase() === MS.Entertainment.UI.DeepLink.PlayStateType.play
                                        }
                                        catch(e) {
                                            startPlaybackOnLaunch = false
                                        }
                                    else
                                        startPlaybackOnLaunch = MS.Entertainment.Utilities.isMusicApp2;
                                    MS.Entertainment.UI.Application.Activation.activateStageTwo();
                                    if (MS.Entertainment.Utilities.isVideoApp) {
                                        var defaultLaunchSetting = String.Empty;
                                        var moniker = String.empty;
                                        if (MS.Entertainment.Utilities.isVideoApp1) {
                                            defaultLaunchSetting = Windows.Storage.ApplicationData.current.roamingSettings.values["launchLocation"];
                                            moniker = MS.Entertainment.UI.Monikers[defaultLaunchSetting]
                                        }
                                        if (!defaultLaunchSetting || !moniker)
                                            if (MS.Entertainment.Utilities.isVideoApp1)
                                                MS.Entertainment.ViewModels.VideoSpotlight.startupVideoSpotlight = new MS.Entertainment.ViewModels.VideoSpotlight
                                    }
                                    navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                    if (!isNonRootActivationHandler && !preLaunched)
                                        navigationService.skipEnterAnimationOnNextNavigation = true;
                                    navigationService.init();
                                    dataPoint.appendParameter("StartedFrom", "Tile");
                                    break;
                                case Windows.ApplicationModel.Activation.ActivationKind.search:
                                    MS.Entertainment.UI.Application.Helpers.showExtendedSplashScreen(evt.splashScreen);
                                    MS.Entertainment.UI.Application.Activation.activateStageTwo();
                                    MS.Entertainment.UI.Application.Activation.activateStageThree().done(function stageThreeActivated() {
                                        var handled = false;
                                        if (evt && evt.queryText) {
                                            MS.Entertainment.ViewModels.SearchContractViewModel.init();
                                            if (MS.Entertainment.ViewModels.SearchContractViewModel.current)
                                                handled = MS.Entertainment.ViewModels.SearchContractViewModel.current.searchKeywordSubmitted(evt)
                                        }
                                        if (!handled)
                                            if (!MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage)
                                                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).init();
                                        dataPoint.appendParameter("StartedFrom", "Deeplink");
                                        dataPoint.appendParameter("DeeplinkSource", "Search")
                                    });
                                    break
                            }
                            {};
                            if (!isNonRootActivationHandler)
                                MS.Entertainment.Utilities.Telemetry.closeDataPoint(dataPoint)
                        };
                    doActivate(activationArgs)
                }, resuming: function resuming(e) {
                    if (isPrelaunched)
                        return;
                    if (!commonEventProvider)
                        commonEventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Common;
                    commonEventProvider.traceProcessResumeEventStart();
                    var startTime = new Date;
                    if (!applicationLifetimeManager)
                        applicationLifetimeManager = new Microsoft.Entertainment.ApplicationLifetimeManager;
                    applicationLifetimeManager.raiseResuming();
                    if (tileManager && MS.Entertainment.Utilities.isApp1)
                        tileManager.updateTile();
                    commonEventProvider.traceProcessResumeTelemetryStart();
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userTimeTelemetryManager).appResumed();
                    commonEventProvider.traceProcessResumeTelemetryStop();
                    MS.Entertainment.Instrumentation.PerfTrack.onResuming();
                    wasRecentlyResumed = true;
                    var stopTime = new Date;
                    var duration = stopTime.valueOf() - startTime.valueOf();
                    commonEventProvider.traceProcessResumeEventStop(duration);
                    if (MS.Entertainment.Utilities.isApp2)
                        MS.Entertainment.Platform.PlayTo.initPlayToReceiver().done(null, function onInitPlayToReceiverError(){})
                }, suspending: function suspending(e) {
                    if (isPrelaunched)
                        return;
                    if (!commonEventProvider)
                        commonEventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Common;
                    commonEventProvider.traceProcessSuspendEventStart();
                    var startTime = new Date;
                    if (!applicationLifetimeManager)
                        applicationLifetimeManager = new Microsoft.Entertainment.ApplicationLifetimeManager;
                    applicationLifetimeManager.raiseSuspending();
                    commonEventProvider.traceProcessSuspendTelemetryStart();
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userTimeTelemetryManager).appSuspended();
                    commonEventProvider.traceProcessSuspendTelemetryStop();
                    MS.Entertainment.Instrumentation.PerfTrack.onSuspending();
                    var stopTime = new Date;
                    var duration = stopTime.valueOf() - startTime.valueOf();
                    commonEventProvider.traceProcessSuspendEventStop(duration);
                    if (MS.Entertainment.Utilities.isApp2)
                        MS.Entertainment.Platform.PlayTo.stopPlayToReceiver(e.suspendingOperation.getDeferral()).done(function onStopPlayToReceiver(){}, function onStopPlayToReceiverError(){})
                }, unload: function unload(e) {
                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.sessionManager)) {
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        if (sessionMgr)
                            sessionMgr.displayRequestRelease()
                    }
                    var app = new Microsoft.Entertainment.Application.Application;
                    app.shutdownAsync();
                    window.removeEventListener("unload", MS.Entertainment.UI.Application.Activation.unload)
                }, activateStageTwo: function activateStageTwo() {
                    if (stageTwoInitialized)
                        return;
                    stageTwoInitialized = true;
                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.contentRestrictionService))
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.contentRestrictionService).initialize();
                    MS.Entertainment.UI.Components.Shell.initializeSnappedMode();
                    if (MS.Entertainment.Utilities.isApp2) {
                        WinJS.Utilities.addClass(document.body, "showKeyboardFocus");
                        MS.Entertainment.Platform.PlayTo.initPlayToReceiver().done(null, function onInitPlayToReceiverError(){})
                    }
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    if (MS.Entertainment.Utilities.isMusicApp2) {
                        var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        var attemptedReload = false;
                        if (startPlaybackOnLaunch) {
                            signIn.signInOnStart();
                            var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                            attemptedReload = true;
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.nowPlayingControlManager).preloadNowPlayingControls();
                            if (signedInUser && signedInUser.gamerTag === configurationManager.service.lastSignedInUserGamerTag)
                                MS.Entertainment.Platform.PlaybackHelpers.reloadNowPlaying(true);
                            else
                                attemptedReload = false
                        }
                        else
                            MS.Entertainment.Platform.PlaybackHelpers.reloadNowPlaying(false);
                        var binding = MS.Entertainment.Utilities.addEventHandlers(signIn, {isSignedInChanged: function onSignInChange(event) {
                                    var isSignedIn = event.detail.newValue;
                                    if (isSignedIn) {
                                        if (startPlaybackOnLaunch && !attemptedReload) {
                                            MS.Entertainment.Platform.PlaybackHelpers.reloadNowPlaying(true);
                                            attemptedReload = true
                                        }
                                    }
                                    else {
                                        var playbackSession = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager).nowPlayingSession;
                                        if (playbackSession) {
                                            playbackSession.setDataSource(null);
                                            playbackSession.currentMedia = null;
                                            playbackSession.pendingOrdinal = null;
                                            MS.Entertainment.Platform.PlaybackHelpers.playActionInitiated = false
                                        }
                                        attemptedReload = false;
                                        playbackSession = null
                                    }
                                }})
                    }
                    var iaService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.informationArchitecture);
                    iaService.initialize();
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus);
                    if (MS.Entertainment.FeatureEnablement)
                        MS.Entertainment.FeatureEnablement.initialize()
                }, activateStageThree: function activateStageThree() {
                    var _delayTimerMS = 50;
                    if (shouldShowAppBar && !window.onNewMusicPage)
                        WinJS.Promise.timeout(showAppBarDelay).done(function() {
                            var appBarControl = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                            if (appBarControl)
                                appBarControl.show(MS.Entertainment.UI.Controls.BottomAppBar.defaultHideTimeoutMS);
                            shouldShowAppBar = false;
                            showAppBarDelay = 0
                        });
                    if (stageThreePromise)
                        return stageThreePromise;
                    var delayedStageThreePath = "/delayedStageThreeStartup.html";
                    if (window.onNewVideoPage)
                        delayedStageThreePath = "/Classic" + delayedStageThreePath;
                    stageThreePromise = MS.Entertainment.Utilities.loadHtmlPage(delayedStageThreePath, "delayedStartupContainer").then(function loadStageThreeFiles() {
                        if (MS.Entertainment.UI.Application.Helpers.activationTelemetryData && MS.Entertainment.UI.Application.Helpers.activationTelemetryData.length > 0) {
                            MS.Entertainment.UI.Application.Helpers.activationTelemetryData.forEach(function itemIterator(dataPoint) {
                                dataPoint.write()
                            });
                            MS.Entertainment.UI.Application.Helpers.activationTelemetryData = null
                        }
                        if (MS.Entertainment.UI.FileTransferNotificationHandlers) {
                            MS.Entertainment.UI.fileTransferNotificationHandler = new MS.Entertainment.UI.FileTransferNotificationHandlers;
                            MS.Entertainment.UI.fileTransferNotificationHandler.startTransferListener()
                        }
                        if (MS.Entertainment.Utilities.isMusicApp)
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.freePlayLimits).initialize();
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dashboardRefresher).initialize();
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.backButton);
                        if (!window.onNewVideoPage) {
                            var pointerUpHandler = function mouseClickHandler(event) {
                                    if (event.button === 3) {
                                        var navigateBackAction = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions).getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
                                        navigateBackAction.automationId = MS.Entertainment.UI.AutomationIds.mouseNavigateBack;
                                        navigateBackAction.parameter = MS.Entertainment.UI.Actions.navigate.NavigateLocation.back;
                                        navigateBackAction.execute()
                                    }
                                };
                            document.addEventListener("MSPointerUp", pointerUpHandler);
                            document.addEventListener("pointerup", pointerUpHandler)
                        }
                        MS.Entertainment.ViewModels.SearchContractViewModel.init();
                        if (MS.Entertainment.ViewModels.SearchContractViewModel.current)
                            MS.Entertainment.ViewModels.SearchContractViewModel.current.loadSearchObject();
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.typeToSearch))
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.typeToSearch).enableTypeToSearch();
                        if (MS.Entertainment.Utilities.isMusicApp || MS.Entertainment.Utilities.isVideoApp)
                            MS.Entertainment.Utilities.DRM.individualizationAsync();
                        if (!window.onNewVideoPage) {
                            MS.Entertainment.Framework.KeyboardInteractionListener.init();
                            MS.Entertainment.Framework.KeyboardShortcutHandler.instance.initialize();
                            MS.Entertainment.UI.Shell.createShellKeyboardShortcuts()
                        }
                        if (MS.Entertainment.UI.Shell.createShellVoiceShortcuts)
                            MS.Entertainment.UI.Shell.createShellVoiceShortcuts();
                        if (MS.Entertainment.UI.App2 && MS.Entertainment.UI.App2.registerForVoiceEvents)
                            MS.Entertainment.UI.App2.registerForVoiceEvents();
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.pinnedList))
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.pinnedList);
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.shareSender)) {
                            var sender = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareSender);
                            sender.setDefaultEmptyMessage()
                        }
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.contentRestrictionStateHandler))
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.contentRestrictionStateHandler).initialize();
                        MS.Entertainment.UI.PurchaseHistoryService.initialize();
                        if (MS.Entertainment.Utilities.isMusicApp) {
                            var cloudCollectionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.cloudCollection);
                            cloudCollectionService.startListening()
                        }
                        else if (MS.Entertainment.Utilities.isVideoApp)
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).bind("isSignedIn", function onSignInChange(isSignedIn) {
                                if (isSignedIn) {
                                    MS.Entertainment.Utilities.Telemetry.ensureKeystoneStarted();
                                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.videoCloudCollection)) {
                                        var videoCloudCollection = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.videoCloudCollection);
                                        videoCloudCollection.startSync()
                                    }
                                    if (Microsoft.Entertainment.FileTransferManager)
                                        Microsoft.Entertainment.FileTransferManager.scheduleProgressCheck()
                                }
                            });
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.systemMTCMetadataUpdater))
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.systemMTCMetadataUpdater);
                        var appNotificationInitPromise = WinJS.Promise.as();
                        if (!MS.Entertainment.Utilities.isApp2)
                            appNotificationInitPromise = WinJS.Promise.timeout(_delayTimerMS).then(function delay1() {
                                return WinJS.UI.process(MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appInfoNotification))
                            }).then(function initializeControl(control) {
                                if (control)
                                    control.delayedInitialize()
                            }).then(function loadCriticalNotification() {
                                return WinJS.UI.process(MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appCriticalNotification)).then(function(control) {
                                        control.delayedInitialize()
                                    })
                            });
                        return appNotificationInitPromise.then(function delay() {
                                if ((new Microsoft.Entertainment.Configuration.ConfigurationManager).shell.retailExperience)
                                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification).send(new MS.Entertainment.UI.Notification({
                                        notificationType: MS.Entertainment.UI.Notification.Type.Informational, title: String.load(String.id.IDS_DEMO_IN_DEMO_MODE), subTitle: "", moreDetails: "", action: null, category: "demo", isPersistent: true
                                    }));
                                if (MS.Entertainment.Utilities.isVideoApp2 && WinJS.Utilities.getMember("Microsoft.Entertainment.BackgroundTasks.EpgChannelUpdateTask"))
                                    WinJS.Promise.timeout(2000).then(function() {
                                        var epg = new Microsoft.Entertainment.BackgroundTasks.EpgChannelUpdateTask;
                                        epg.scheduleBackgroundTask();
                                        epg.updateChannelsNow()
                                    });
                                return WinJS.Promise.timeout(_delayTimerMS).then(function processAppBar() {
                                        var bottomAppBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                                        var processAppBarPromise = WinJS.Promise.wrap();
                                        if (bottomAppBar && bottomAppBar.domElement === undefined)
                                            processAppBarPromise = WinJS.UI.processAll(bottomAppBar);
                                        processAppBarPromise.done(function loadAppBar() {
                                            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.tileManager) && MS.Entertainment.Utilities.isApp1)
                                                tileManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.tileManager);
                                            if (!MS.Entertainment.Utilities.isApp2)
                                                MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar).deferredInit();
                                            else
                                                MS.Entertainment.UI.Controls.CommandingPopOver.enableEdgeGlobalCommands();
                                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).stageThreeActivated = true
                                        }.bind(this))
                                    }).then(function delay3() {
                                        return WinJS.Promise.timeout(_delayTimerMS).then(function signIn() {
                                                var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                                                return signIn.signInOnStart()
                                            })
                                    }).then(function delay4() {
                                        return WinJS.Promise.timeout(_delayTimerMS).then(function initializePlaybackErrorDisplayService() {
                                                if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.playbackErrorDisplayService))
                                                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.playbackErrorDisplayService).initialize()
                                            })
                                    }).then(function delay5() {
                                        var stageFourTimer = WinJS.Promise.timeout(stageFourDelay).then(MS.Entertainment.UI.Application.Activation.activateStageFour);
                                        return stageFourTimer
                                    })
                            })
                    });
                    var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    if (MS.Entertainment.Utilities.isVideoApp2)
                        var isSnappedBinding = WinJS.Binding.bind(uiStateService, {isSnapped: function _isSnappedChanged(isSnapped) {
                                    if (isSnapped)
                                        return MS.Entertainment.Video.Video2WelcomeDialog.hide();
                                    else
                                        return MS.Entertainment.Video.Video2WelcomeDialog.show()
                                }});
                    return stageThreePromise
                }, activateStageFour: function activateStageFour() {
                    if (stageFourPromise)
                        return stageFourPromise;
                    stageFourPromise = MS.Entertainment.Utilities.loadHtmlPage("/delayedStageFourStartup.html", "delayedStartupContainer").then(function stageFourLoadFiles() {
                        if (MS.Entertainment.UI.Actions.ImportPlaylists)
                            MS.Entertainment.UI.Actions.ImportPlaylists.resumeLastPlaylistImport();
                        if (MS.Entertainment.Utilities.isMusicApp2) {
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.idleApplicationService).initialize();
                            MS.Entertainment.UI.Application.Helpers.loadNavigateToNowPlayingOnIdleService()
                        }
                        if (MS.Entertainment.Utilities.isApp1 && MS.Entertainment.Framework.UpgradeToBlueNotification)
                            MS.Entertainment.Framework.UpgradeToBlueNotification.showNotification();
                        if (!MS.Entertainment.Utilities.isApp2)
                            MS.Entertainment.UI.Framework.unblockPreloading();
                        if (MS.Entertainment.Utilities.isVideoApp)
                            MS.Entertainment.Data.Query.Video.requestFields.cacheRequestFields()
                    });
                    return stageFourPromise
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Application.Helpers", {
        splashScreenCleared: function splashScreenCleared() {
            (new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell).traceSplashScreen_Removed()
        }, activationTelemetryData: null, windowResizeSplashScreenHandler: null, showExtendedSplashScreen: function showExtendedSplashScreen(splashDetails) {
                var splashScreenImage = document.querySelector(".extendedSplashScreenImage");
                var splashScreenProgressContainer = document.querySelector(".extendedSplashScreenProgressContainer");
                if (!splashScreenImage)
                    return;
                if (!splashDetails) {
                    MS.Entertainment.UI.Application.Helpers.removeExtendedSplashScreen();
                    return
                }
                MS.Entertainment.UI.Application.Helpers.windowResizeSplashScreenHandler = function() {
                    try {
                        var imageLocation = splashDetails.imageLocation;
                        splashScreenImage.style.top = imageLocation.y + "px";
                        splashScreenImage.style.left = imageLocation.x + "px";
                        splashScreenImage.style.height = imageLocation.height + "px";
                        splashScreenImage.style.width = imageLocation.width + "px";
                        splashScreenProgressContainer.style.marginTop = imageLocation.y + imageLocation.height + 32 + "px"
                    }
                    catch(e) {
                        MS.Entertainment.fail("Exception trying to get splash screen information: " + e.toString())
                    }
                };
                MS.Entertainment.UI.Application.Helpers.windowResizeSplashScreenHandler();
                window.addEventListener("resize", MS.Entertainment.UI.Application.Helpers.windowResizeSplashScreenHandler)
            }, updateExtendedSplashScreenMessage: function updateExtendedSplashScreenMessage(title, message) {
                var splashScreenTitle = document.querySelector(".extendedSplashScreenTitle");
                var splashScreenMessage = document.querySelector(".extendedSplashScreenMessage");
                if (splashScreenTitle)
                    splashScreenTitle.innerText = title;
                if (splashScreenMessage)
                    splashScreenMessage.innerText = message
            }, waitForDatabaseUpdated: function waitForDatabaseUpdated() {
                var mediaStore;
                var promise;
                if (MS.Entertainment.Utilities.isMusicApp)
                    mediaStore = new Microsoft.Entertainment.Platform.MediaStore;
                if (mediaStore && mediaStore.databaseNeedsUpgrade) {
                    var query;
                    var waitTitle = String.load(String.id.IDS_APP_UPDATE_SPLASH_TITLE);
                    var waitMessage = String.load(String.id.IDS_APP_UPDATE_SPLASH_SUBTITLE);
                    MS.Entertainment.UI.Application.Helpers.updateExtendedSplashScreenMessage(waitTitle, waitMessage);
                    promise = mediaStore.ensureDatabaseOpenedAsync().then(null, function ignoreError(){})
                }
                return WinJS.Promise.as(promise)
            }, _inProgressRemoveExtendedSplashScreen: false, removeExtendedSplashScreenDOM: function removeExtendedSplashScreenDOM() {
                var extendedSplashScreen = document.querySelector(".extendedSplashScreen");
                if (!extendedSplashScreen)
                    return;
                window.removeEventListener("resize", MS.Entertainment.UI.Application.Helpers.windowResizeSplashScreenHandler);
                MS.Entertainment.UI.Application.Helpers.windowResizeSplashScreenHandler = null;
                MS.Entertainment.UI.Application.Helpers._inProgressRemoveExtendedSplashScreen = false;
                if (extendedSplashScreen.parentElement)
                    extendedSplashScreen.parentElement.removeChild(extendedSplashScreen);
                if (isPrelaunched) {
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    navigationService.skipEnterAnimationOnNextNavigation = false;
                    var unsnappedElement = document.getElementById("htmlUnsnapped");
                    if (unsnappedElement)
                        WinJS.Utilities.removeClass(unsnappedElement, "hideFromDisplay")
                }
            }, removeExtendedSplashScreen: function removeExtendedSplashScreen() {
                if (MS.Entertainment.UI.Application.Helpers._inProgressRemoveExtendedSplashScreen)
                    return WinJS.Promise.as();
                if (isPrelaunched) {
                    MS.Entertainment.UI.Application.Helpers.removeExtendedSplashScreenDOM();
                    return WinJS.Promise.as()
                }
                MS.Entertainment.UI.Application.Helpers._inProgressRemoveExtendedSplashScreen = true;
                return MS.Entertainment.UI.Application.Helpers.waitForDatabaseUpdated().then(function databaseUpdateFinishedOrNotNeeded() {
                        return MS.Entertainment.Utilities.loadDemoScripts()
                    }).then(function demoScriptsLoaded() {
                        var extendedSplashScreen = document.querySelector(".extendedSplashScreen");
                        var welcomeScreenDisplayed = WinJS.Promise.as();
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.welcomeDialogService))
                            welcomeScreenDisplayed = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.welcomeDialogService).initialize();
                        if (!extendedSplashScreen) {
                            MS.Entertainment.UI.Application.Helpers._inProgressRemoveExtendedSplashScreen = false;
                            return
                        }
                        welcomeScreenDisplayed.done(MS.Entertainment.UI.Application.Helpers.removeExtendedSplashScreenDOM, MS.Entertainment.UI.Application.Helpers.removeExtendedSplashScreenDOM);
                        var unsnappedElement = document.getElementById("htmlUnsnapped");
                        var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        if (unsnappedElement && !uiStateService.isSnapped)
                            WinJS.Utilities.removeClass(unsnappedElement, "hideFromDisplay");
                        if (MS.Entertainment.Utilities.isApp2)
                            WinJS.Utilities.addClass(document.body, "showKeyboardFocus");
                        var currentPage = document.querySelector(".pageContainer.currentPage");
                        if (currentPage) {
                            MS.Entertainment.Utilities.enterElement(currentPage).done(function() {
                                MS.Entertainment.UI.Framework.setFocusRoot(currentPage)
                            });
                            if (MS.Entertainment.Utilities.isApp2 && document.activeElement)
                                WinJS.Utilities.addClass(document.activeElement, "acc-keyboardFocusTarget")
                        }
                        else {
                            var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                            navigationService.skipEnterAnimationOnNextNavigation = false
                        }
                        return MS.Entertainment.UI.Application.Helpers.shouldShowWelcomeDialog().then(function(shouldShowWelcomeDialog) {
                                if (!shouldShowWelcomeDialog)
                                    return;
                                MS.Entertainment.assert(MS.Entertainment.Utilities.isApp2, "Only allowed in App2");
                                var showPromise = MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.welcomeDialogService) ? MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.welcomeDialogService).show() : MS.Entertainment.Video.Video2WelcomeDialog.show();
                                var onDialogDismissed = function onDialogDismissed() {
                                        if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.welcomeDialogService))
                                            MS.Entertainment.UI.Application.Helpers.setShowWelcomeDialogState(false);
                                        if (unsnappedElement && !uiStateService.isSnapped) {
                                            var dashboardElement = document.querySelector(".currentPage .navigationHost.dashboardHost");
                                            if (dashboardElement && dashboardElement.winControl && dashboardElement.winControl.focusHome)
                                                dashboardElement.winControl.focusHome()
                                        }
                                    };
                                return showPromise.then(onDialogDismissed, onDialogDismissed)
                            })
                    })
            }, appConfig: {get: function get() {
                    var configManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    return MS.Entertainment.Utilities.isMusicApp ? configManager.music : configManager.video
                }}, shouldShowWelcomeDialog: function shouldShowWelcomeDialog() {
                if (!MS.Entertainment.Utilities.isApp2)
                    return WinJS.Promise.as(false);
                var showWelcomeDialog = MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.welcomeDialogService) || MS.Entertainment.UI.Application.Helpers.appConfig.showWelcomeDialog;
                var welcomeDialogRequired;
                if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.welcomeDialogService))
                    welcomeDialogRequired = MS.Entertainment.UI.WelcomeDialogService.isWelcomeScreenRequired();
                else if (MS.Entertainment.Utilities.isVideoApp2) {
                    var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var hasMarketplace = (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace) || featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace));
                    showWelcomeDialog = (!uiStateService.isSnapped && !hasMarketplace)
                }
                else if (!MS.Entertainment.isAppModeOverride && MS.Entertainment.Utilities.supportsProtectedContent)
                    showWelcomeDialog = false;
                return WinJS.Promise.join({
                        shouldShowWelcomeDialog: showWelcomeDialog, welcomeDialogRequired: welcomeDialogRequired || showWelcomeDialog
                    }).then(function(result) {
                        return result.shouldShowWelcomeDialog && WinJS.Utilities.getMember("welcomeDialogRequired.shouldDisplayWelcomeScreen", result)
                    })
            }, setShowWelcomeDialogState: function setShowWelcomeDialogState(value) {
                if (!MS.Entertainment.Utilities.isApp2)
                    return;
                MS.Entertainment.UI.Application.Helpers.appConfig.showWelcomeDialog = value
            }, visibilityChanged: function visibilityChanged() {
                var isVisible = !document.hidden;
                if (!commonEventProvider)
                    commonEventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Common;
                commonEventProvider.traceAppVisibilityChanged(isVisible);
                var freezeThawTargets = [];
                var pageContainer;
                var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                uiStateService.isAppVisible = !document.hidden;
                var freezeThawPageContainer = function freezeThawPageContainer() {
                        pageContainer = document.getElementById("pageContainer");
                        if (pageContainer && pageContainer.childElementCount > 0)
                            (function() {
                                var target = document.querySelector("#pageContainer .currentPage");
                                MS.Entertainment.assert(target, "Didn't find the current page to thaw");
                                if (target)
                                    freezeThawTargets.push(target)
                            })();
                        var overlays = document.querySelectorAll(".overlayAnchor");
                        if (overlays)
                            Array.prototype.forEach.call(overlays, function(overlay) {
                                freezeThawTargets.push(overlay)
                            })
                    };
                if (!uiStateService.isSnapped)
                    freezeThawPageContainer();
                else
                    (function() {
                        var target = document.querySelector("#htmlSnapped");
                        if (WinJS.Utilities.hasClass(target, "hideFromDisplay"))
                            freezeThawPageContainer();
                        else {
                            MS.Entertainment.assert(target, "Didn't find the current page to thaw");
                            freezeThawTargets.push(target)
                        }
                    })();
                if (freezeThawTargets && freezeThawTargets.length)
                    if (document.hidden)
                        freezeThawTargets.forEach(function(freezeThawTarget) {
                            MS.Entertainment.Utilities.freezeControlsInSubtree(freezeThawTarget)
                        });
                    else {
                        freezeThawTargets.forEach(function(freezeThawTarget) {
                            MS.Entertainment.Utilities.thawControlsInSubtree(freezeThawTarget)
                        });
                        if (WinJS.Utilities.getMember("Microsoft.PerfTrack.PerfTrackTimePoint.responsive"))
                            if (wasRecentlyResumed)
                                MS.Entertainment.Instrumentation.PerfTrack.getLogger().writeResumeStopEvent(Microsoft.PerfTrack.PerfTrackTimePoint.responsive)
                    }
                wasRecentlyResumed = false;
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userTimeTelemetryManager).appVisibilityChanged();
                if (isVisible && MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.richPresence)) {
                    var richPresenceService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.richPresence);
                    richPresenceService.refreshRichPresence()
                }
                try {
                    var mediaStore = new Microsoft.Entertainment.Platform.MediaStore;
                    mediaStore.prepareDatabaseForSuspend(!isVisible)
                }
                catch(e) {}
                if (isVisible && MS.Entertainment.Utilities.isVideoApp2 && MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.videoCloudCollection)) {
                    var videoCloudCollection = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.videoCloudCollection);
                    videoCloudCollection.startSync()
                }
            }, handleDashboardVisible: function handleDashboardVisible() {
                if (!MS.Entertainment.Utilities.isApp2) {
                    var appBar = document.querySelector(".bottomAppBar");
                    WinJS.Utilities.removeClass(appBar, "removeFromDisplay")
                }
                document.removeEventListener("HubStripVisible", MS.Entertainment.UI.Application.Helpers.handleDashboardVisible);
                MS.Entertainment.UI.Application.Helpers.removeExtendedSplashScreen();
                WinJS.Promise.timeout(1).done(function() {
                    MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioAppLaunch()
                })
            }, handleDashboardReady: function handleDashboardReady() {
                document.removeEventListener("HubStripReady", MS.Entertainment.UI.Application.Helpers.handleDashboardReady);
                MS.Entertainment.UI.Framework.setImmediateMode = MS.Entertainment.UI.Framework.setImmediateModes.normal;
                WinJS.Promise.timeout().then(function _delayHandleDashboardReady() {
                    MS.Entertainment.UI.Application.Activation.activateStageThree()
                })
            }, rejectImageDrags: function rejectImageDrags(event) {
                if (event.target.tagName === "IMG")
                    event.preventDefault()
            }, navigateBack: function navigateBack() {
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateBack()
            }, loadNavigateToNowPlayingOnIdleService: function loadNavigateToNowPlayingOnIdleService() {
                var idleApplicationService = new MS.Entertainment.Framework.IdleApplicationService;
                idleApplicationService.initialize();
                idleApplicationService.setIdleTime(60000);
                var playbackSession = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager).primarySession;
                var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                idleApplicationService.addEventListener(idleApplicationService.applicationIdleEvent, function navigateToNowPlaying() {
                    if (uiStateService && !uiStateService.isSnapped && !uiStateService.nowPlayingVisible && !uiStateService.isSearchPaneVisible && !uiStateService.overlayVisible && !uiStateService.activeListening && !uiStateService.nuiEngaged && playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.playing && playbackSession.playerState === MS.Entertainment.Platform.Playback.PlayerState.ready)
                        MS.Entertainment.Platform.PlaybackHelpers.showImmersive(null, {
                            sessionId: playbackSession.sessionId, startFullScreen: false
                        })
                })
            }
    });
    if (!MS.Entertainment.Utilities.systemAppListenersAttached) {
        Windows.UI.WebUI.WebUIApplication.addEventListener("activated", MS.Entertainment.UI.Application.Activation.activated);
        Windows.UI.WebUI.WebUIApplication.addEventListener("resuming", MS.Entertainment.UI.Application.Activation.resuming);
        Windows.UI.WebUI.WebUIApplication.addEventListener("suspending", MS.Entertainment.UI.Application.Activation.suspending);
        window.addEventListener("unload", MS.Entertainment.UI.Application.Activation.unload, false);
        document.addEventListener("dragstart", MS.Entertainment.UI.Application.Helpers.rejectImageDrags, true);
        MS.Entertainment.Utilities.systemAppListenersAttached = true
    }
    document.addEventListener("visibilitychange", MS.Entertainment.UI.Application.Helpers.visibilityChanged, false);
    document.addEventListener("HubStripVisible", MS.Entertainment.UI.Application.Helpers.handleDashboardVisible);
    document.addEventListener("HubStripReady", MS.Entertainment.UI.Application.Helpers.handleDashboardReady);
    MS.Entertainment.Utilities.processAllOnDocumentLoaded().then(function mainLoaded() {
        (new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell).traceFinish_ProcessAll()
    })
})()
