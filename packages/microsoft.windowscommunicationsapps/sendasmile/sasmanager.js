
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// This file contains controller logic for the SendASmile control. It postpones loading the actual control JS and
// SaS JS dependencies until the user clicks on the feedback button.

/// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
/// <disable>JS3057.AvoidImplicitTypeCoercion</disable>

/*global window,document,Microsoft,Windows,Debug,Jx,SasManager*/

Jx.delayDefine(window, "SasManager", function () {

    window.SasManager = {  _config: /*@static_cast(SasConfig)*/ null, sasControl: null, _ownPlatform: null, _helpFlyoutCallbackFn: null };

    var _application = 0;
    var _sasCtr = null;
    var _sasCommand = null;
    var _localizedAppName = "";
    var _platform = null;
    var _marketSupported = null;
    var _market = null;
    var _language = null;
    var _appBar = null;
    
    var _hideEventName = "sashide";
    var _showEventName = "sasshow";
    var _enabledEventName = "sasenabled";

    Debug.Events.define(SasManager, _hideEventName, _showEventName, _enabledEventName);

    SasManager.init = function (localizedAppName, sasCommandId, platform) {
        /// <summary>Adds the SaS button to the app bar -hidden by default- but does NOT immediately load the control</summary>
        /// <param name="application" type="string" optional="false">The name of the application (e.g SasManager.Application.mail</param>
        /// <param name="sasCommandId" type="string" optional="true">The id of the appBar button that serves as the SaS launcher</param>
        /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client" optional="true">This is the contacts platform's object</param>
        _localizedAppName = localizedAppName;
        _application = Jx.appId ? Jx.appId : 0;        
        
        _platform = (!platform && Jx.root) ? Jx.root._platform : platform;        

        // If we still don't have the platform, create our own
        if (!_platform) {
            try {
                if (!SasManager._ownPlatform) {
                    /// <disable>JS3053.IncorrectNumberOfArguments</disable>
                    SasManager._ownPlatform = new Microsoft.WindowsLive.Platform.Client("launch");
                    /// <enable>JS3053.IncorrectNumberOfArguments</enable>

                    var activation = Jx.activation;
                    activation.addListener(activation.suspending, SasManager._onSuspending, this);
                    activation.addListener(activation.resuming, SasManager._onResuming, this);
                }
                _platform = SasManager._ownPlatform;
            } catch (ex) {
                Jx.log.exception("Feedback: Platform failed to initialize", ex);
            }
        }
        var sasElement = document.getElementById(sasCommandId);

        if (sasElement) {
            // Get the App Bar (it's the parent of the command button)
            _appBar = sasElement.parentNode;
            
            if (!_appBar.winControl) {
                // The App Bar is not a control...which is not expected
                Jx.log.error("Feedback: App bar is not a WinJS control");
            } else {
                // Regardless of whether or not the App Bar is hidden, we can still access the proper command
                _sasCommand = _appBar.winControl.getCommandById(sasCommandId);
                
                SasManager._trySetHidden();
            }
        }

        Jx.initEvents(SasManager);

        if (!SasManager._config) {
            SasManager._initConfig();
        }
    };

    SasManager.handleFeedbackClick = function () {
        /// <summary>We will show the SaS SettingsFlyout, initializing it if necessary</summary>
        if (!SasManager.sasControl) {
            SasManager.sasControl = new Jx.Sas(Jx.getAppNameFromId(Jx.appId), _localizedAppName);
            Jx.root.append(SasManager.sasControl);

            // DOM-wise, the Flyout lives in the span
            _sasCtr = document.createElement("span");
            _sasCtr.id = "sasFlyoutCtr";
            document.body.appendChild(_sasCtr);

            SasManager.sasControl.setUserInfo(SasManager._getUserId(), SasManager.showInAppBar());
        } 

        if (!SasManager.sasControl.hasUI()) {
            SasManager.sasControl.initUI(_sasCtr);
        }

        // Explicitly hide the appbar
        try {
            if (_appBar) {
                _appBar.winControl.hide();
            } 
        } catch (ex) {
            Jx.log.exception("Feedback: Unable to hide appbar", ex);
        }
        
        // Shows the SettingsFlyout
        SasManager.sasControl.show.apply(SasManager.sasControl);
    };
    
    SasManager.shutdown = function () {
        /// <summary>Shuts down the control, hiding and removing the Flyout from the DOM if present</summary>
        if (SasManager.sasControl) {
            SasManager.sasControl.shutdownUI();
            SasManager.sasControl = null;
            _sasCtr.outerText = "";
            _sasCtr = null;
        }

        SasManager = null;
    };
    
    SasManager.setHelpFlyoutCallback = function (callbackFn) {
        /// <summary>Sets the callback function to use when the user clicks the "help" option on the survey</summary>
        /// <param name="callbackFn" type="Function">Callback function</param>
        SasManager._helpFlyoutCallbackFn = callbackFn;
    };
    
    SasManager.getSettingsCommand = function () {
        /// <summary>Returns a SettingsCommand that will trigger the Feedback Flyout when clicked</summary>
        /// <disable>JS3053.IncorrectNumberOfArguments</disable>
        return new Windows.UI.ApplicationSettings.SettingsCommand("settings.feedback",
            Jx.res.getString("/strings/sasSurveyHeader"),
            SasManager.handleFeedbackClick);
        /// <enable>JS3053.IncorrectNumberOfArguments</enable>
    };

    SasManager.commandShown = function () {
        return _sasCommand && !_sasCommand.hidden;
    };

    SasManager.showInAppBar = function () {
        /// <summary>Whether or not to show the Feedback button in the AppBar</summary>
        /// <returns type="Boolean">Should an entrypoint be added in the AppBar?</returns>   
        Jx.mark("SasManager:showInAppBar,StartTA,SasManager");
        var result = false;
        try {
            if (SasManager._config) {
                result = SasManager._config.enableFeedback &&
                    SasManager._config.application.lookup(_application).addAppBarButton &&
                    !SasManager._isRetailExperience();
            } 
        } catch (ex) {
            Jx.log.exception("Feedback: Error determining whether or not to show SaS in the appbar", ex);
        }

        Jx.mark("SasManager:showInAppBar,StopTA,SasManager");

        return result;
    };
    
    SasManager.isMarketSupported = function () {
        /// <summary>Whether or not the market is supported</summary>
        /// <returns type="Boolean">Is the current market supported?</returns>
        if (_marketSupported === null) {
            _marketSupported = SasManager._findMarketInConfig();
        }

        return _marketSupported;
    };
    
    SasManager.addListener = function (type, fn, obj) {
        return Jx.addListener(SasManager, type, fn, obj);
    };

    SasManager.removeListener = function (type, fn, obj) {
        return Jx.removeListener(SasManager, type, fn, obj);
    };

    SasManager._isRetailExperience = function () {
        /// <summary>Returns whether or not the current application is in Retail/Demo mode</summary>
        /// <returns>Is the app in demo mode?</returns>
        var locSet = Jx.appData.localSettings();
        return locSet.get("RetailExperience");
    };
    
    SasManager._findMarketInConfig = function () {
        /// <summary>Searches the configuration for an entry that matches the current market</summary>
        /// <returns>Config entry</returns>
        var market = SasManager.getMarket();
        try {
            var marketEntry = SasManager._config.supportedMarkets.market[market.toLowerCase()];
            
            // We should check to see if there is an entry for the language i.e en-*
            if (!marketEntry) {
                var wilcardMarket = market.substr(0, market.lastIndexOf("-") + 1) + "*";
                marketEntry = SasManager._config.supportedMarkets.market[wilcardMarket.toLowerCase()];
            }
            
            return marketEntry;
        } catch (ex) {
            Jx.log.exception("Feedback: Error when attempting to find market in configuration", ex);
            return null;
        }
    };
    
    SasManager.getLanguage = function () {
        /// <summary>Gets the FMS langauge for the current market</summary>
        /// <returns type="String">FMS language (i.e "en")</returns>
        if (_language === null) {
            var configEntry = SasManager._findMarketInConfig();
            var market = SasManager.getMarket();
            
            if (configEntry && configEntry.language) {   
                _language = configEntry.language;
            } else {            
                var marketSplit = market.split("-");
                _language = marketSplit[0];
                
                // Example mappings: ja-jp => ja, pt-br => pt-br, sr-latn-cs => sr-latn            
                if (marketSplit.length > 2) {
                    _language += "-" + marketSplit[1];
                }
            }           
        }
        
        return _language;
    };
    
    SasManager.addSettingsEntry = function () {
        /// <summary>Whether or not to add the Feedback link in the Settings charm</summary>
        /// <returns type="Boolean">Should an entrypoint be added in Settings?</returns>        
        try {
            if (SasManager._config) {
                return SasManager._config.enableFeedback &&
                    SasManager._config.application.lookup(_application).addSettingsLink &&
                    SasManager.isMarketSupported() &&
                    !SasManager._isRetailExperience();
            }
        } catch (ex) {
            Jx.log.exception("Feedback: Error in addSettingsEntry", ex);
        }
        
        return false;
    };

    SasManager.enableIssueReporting = function () {
        /// <summary>Whether or not to automatically collect logs when submitting feedback</summary>
        /// <returns type="Boolean">Should logs be collected?</returns>        
        return SasManager._config.application.lookup(_application).enableLogCollection;
    };
    
    SasManager.getConfig = function () {
        /// <summary>Returns the configuration that is being used</summary>
        /// <returns type="SasConfig">The configuration</returns>        
        return SasManager._config;
    };
    
    SasManager.getMarket = function () {
        /// <summary>Gets the current market using the user's language as the fallback</summary>
        /// <returns type="String">The current market (i.e "en-us")</returns>
        if (_market === null) {
            _market = Microsoft.WindowsLive.Market.get(Microsoft.WindowsLive.FallbackLogic.language);
        }
        
        return _market;
    };
    
    SasManager.fireShowEvent = function () {
        /// <summary>Called when the Sendasmile flyout is shown: fires the show Jx event</summary>
        try {
            Jx.raiseEvent(SasManager, _showEventName);
        } catch (e) {
            Jx.log.exception("Feedback: error raising show event", e);
        }
    };
    
    SasManager.fireHideEvent = function () {
        /// <summary>Called when the Sendasmile flyout is hidden: fires the hide Jx event</summary>
        try {
            Jx.raiseEvent(SasManager, _hideEventName);
        } catch (e) {
            Jx.log.exception("Feedback: error raising hide event", e);
        }
    };

    SasManager.fireEnabledEvent = function () {
        /// <summary>Called when the Sendasmile flyout is hidden: fires the hide Jx event</summary>
        try {
            Jx.raiseEvent(SasManager, _enabledEventName);
        } catch (e) {
            Jx.log.exception("Feedback: error raising enabled event", e);
        }
    };

    SasManager._onSuspending = function () {
        /// <summary>Sends the suspend event to the platform if we created our own</summary>
        if (SasManager._ownPlatform) {
            // Win8 bug 637158
            try {
                SasManager._ownPlatform.suspend();
            } catch (e) {
                Jx.log.exception("Feedback: error suspending", e);
            }
        }
    };

    SasManager._onResuming = function () {
        /// <summary>Sends the resume event to the platform if we created our own</summary>
        if (SasManager._ownPlatform) {
            SasManager._ownPlatform.resume();
        }
    };

    SasManager._initConfig = function () {
        ///<summary>Load the dynamic config</summary>
        
        // Default config: disable everything! No feedback for you!
        SasManager._config =  /*@static_cast(SasConfig)*/ { 
            enableFeedback: false,
            application: { 
                lookup: function () {
                    return { 
                        addSettingsLink: false,
                        enableLogCollection: false,
                        addAppBarButton: false,
                        surveyId: null
                    };
                }
            },
            supportedMarkets: "",
            privacyUrl: "",
            fmsDomain: ""
        };
        
        if (_platform && !_platform.isMock) {
            var configPromise = Microsoft.WindowsLive.Config.Shared.Feedback.loadAsync(_platform);

            var configChangeCallback = function (ev) {     
                SasManager._config = ev.target;
            
                if (_sasCommand) {
                    // We toggle the visibility of the appbar button as appropriate
                    SasManager._trySetHidden();
                }
                
                // Clear market supported cache
                _marketSupported = null;                
            };

            configPromise.done(function (config) {
                SasManager._config = config;
                SasManager._config.addEventListener('changed', configChangeCallback, false);

                if (_sasCommand) {
                    // We toggle the visibility of the appbar button as appropriate
                    SasManager._trySetHidden();
                }
            }, function () {
                Jx.log.error("Feedback: Error loading dynamic config");
            });
        }
    };

    SasManager._getUserId = function () {
        /// <summary>Tries to get the user id from the contacts platform</summary>
        /// <returns type="String">The user's display name, in string form</returns>

        var userId = "Anonymous";

        try {
            userId = _platform.accountManager.defaultAccount.userDisplayName;
        } catch (e) {
            Jx.log.exception("Feedback: Issue getting user ID from contacts platform", e);
        }

        return userId;
    };
    
    SasManager._trySetHidden = function () {
        /// <summary>Sets the hidden state for AppBarCommand now or when safe (app bar is hidden)</summary>

        if (_appBar && _appBar.winControl && _sasCommand) {
            if (_appBar.winControl.hidden) {
                SasManager._initAppBarButton();
            } else {
                _appBar.winControl.addEventListener("afterhide", SasManager._appBarHidden, false);
            }
        } else {
            Jx.log.error("Feedback: initialization error setting command hidden state.");
        }
    };

    SasManager._initAppBarButton = function () {
        /// <summary>Sets the SendaSmile App Bar button</summary>
        
        try {
            _sasCommand.icon = "\uE19D";
            _sasCommand.onclick = SasManager.handleFeedbackClick;
            _sasCommand.type = "button";
            _sasCommand.label = Jx.res.getString("/strings/sasSurveyHeader");
            _sasCommand.tooltip = Jx.res.getString("/strings/sasSurveyHeader");
            _sasCommand.section = "global";

            // By default we do not show the app bar button: we only show to DF users
            _sasCommand.hidden = !SasManager.showInAppBar();
            SasManager.fireEnabledEvent();
        } catch (e) {
            Jx.log.exception("Feedback: Issue initializing App Bar button", e);
        }
    };
    
    SasManager._appBarHidden = function () {
        /// <summary>Handler called when the appbar is hidden</summary>
        
        SasManager._initAppBarButton();
            
        // Remove the event listener
        _appBar.winControl.removeEventListener("afterhide", SasManager._appBarHidden, false);        
    };
});