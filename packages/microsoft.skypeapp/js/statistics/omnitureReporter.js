

(function () {
    "use strict";
    
    var externalConfigUrl = "https://az351254.vo.msecnd.net/win8/omniture/omniture.js";
    var CONFIG_LOADING_TIMEOUT = 10000;
    var configLoading = null;

    
    var trackingEnabled = true;
    var samplingRate = 5; 

    var pagesDefinitions = {
        startUsingSkype:        { pageName: "skypeloginwin8/link/start", prop43: "skypeloginwin8/link/start_load", eVar69: "win8: microsoftID", eVar73: "win8: microsoftID_login" },
        acceptTermsOfUse:       { pageName: "skypeloginwin8/link/create-technical-confirm", prop43: "skypeloginwin8/link/create-technical-confirm_load", eVar69: "win8: microsoftID/create-technical" },
        skypeUserCredentials:   { pageName: "skypeloginwin8/link/sign-in-new", prop43: "skypeloginwin8/link/sign-in-new_load", eVar69: "win8: microsoftID/unprompted-user" },
        selectSkypeAccount:     { pageName: "skypeloginwin8/link/suggested-users", prop43: "skypeloginwin8/link/suggested-users_load", eVar69: "win8: microsoftID/suggested-user" },
        accountUserCredentials: { pageName: "skypeloginwin8/link/sign-in-suggested", prop43: "skypeloginwin8/link/sign-in-suggested_load", eVar69: "win8: microsoftID/suggested-user" },
        mergeAccounts:          { pageName: "skypeloginwin8/link/merge", prop43: "skypeloginwin8/link/merge_load" },
        accountAlreadyLinked: { pageName: "skypeloginwin8/link/account-already-merged", prop43: "skypeloginwin8/link/account-already-merged_load", prop9: "skypeloginwin8: " + LibWrap.WrSkyLib.auth_RESULT_AUTH_ANOTHER_MAPPING_EXISTS, eVar9: "D=c9" },
    };

    var actionDefinitions = {
        createTechnicalAccount: {
            events: "event11,event54",
            prop43: "skypeloginwin8/link/create-technical-confirm_success",
        },
        mergeAccounts: {
            events: "event54",
            prop43: "skypeloginwin8/link/merge_success",
        },
        error: function (errorCode) {
            
            return {
                prop9: "skypeloginwin8: {0}".format(errorCode), 
                eVar9: "D=c9",
            };
        }
    };

    function init() {
        log("[Stats] Omniture init using default values");

        loadConfiguration();

        window.s_account = Skype.OmnitureReporter.ExternalAPI.isReleaseBuild ? "skypeallprod,skypeclientprod" : "skypealldev,skypeclientdev";

        if (!window.s) {
            
            var scriptTag = document.createElement("script");
            scriptTag.onload = onOmnitureScriptLoaded;
            scriptTag.setAttribute("src", "/3rdparty/omniture/s_code.js");
            document.body.appendChild(scriptTag);
        } else {
            onOmnitureScriptLoaded();
        }
    };

    function onOmnitureScriptLoaded() {
        if (window.s) {
            window.s.ssl = true;
        }
    }

    function loadConfiguration() {
        log("[Stats] Omniture loading configuration file");

        
        configLoading = new WinJS.Promise(function (complete, error) {
            try {
                WinJS.Promise.timeout(CONFIG_LOADING_TIMEOUT,
                    Skype.OmnitureReporter.ExternalAPI.xhr({ url: externalConfigUrl })
                    .done(
                        function completed(r) {
                            try {
                                var result = JSON.parse(r.responseText);

                                trackingEnabled = !!result.track;

                                if (!isNaN(result.rate)) {
                                    samplingRate = Math.max(0.001, Math.min(100, result.rate));
                                }
                                log("[Stats] Omniture configuration file loaded, tracking={0}, samplingRate={1}".format(trackingEnabled, samplingRate));
                            } catch (e) {
                                log("[Stats] Omniture json parse failed, using defaults");
                            };
                            complete();
                        },
                        function error(request) {
                            log("[Stats] Omniture json loading failed, using default values");
                            complete();
                        }
                    )
                );
            } catch (ex) {
                log("[Stats] Omniture json loading failed, using default values");
                complete();
            }
        });
        configLoading.then(function () {
            configLoading = null;
        });
    }
    
    function trackPage(pageName) {
        if (configLoading) {
            configLoading.then(function () {
                trackPage(pageName);
            });
        } else if (trackingEnabled && window.s && samplingPassed() && pagesDefinitions.hasOwnProperty(pageName)) {
            log("[Stats] Omniture tracking page={0}".format(pageName));
            var event = pagesDefinitions[pageName];

            
            event.channel = "skypeloginwin8";

            var uiLang = Skype.Globalization.getCurrentLanguage();
            var isoLang = Skype.Globalization.mapBCP47toSkypeIsoLang(uiLang);

            event.eVar5 = window.s.prop5 = isoLang; 
            event.eVar6 = Skype.Version.skypeVersion; 
            event.prop24 = "D=v6";
            event.prop54 = "win8 client login";
            event.eVar54 = "D=c54";

            event.prop41 = samplingRate;

            window.s.trackPage(event);
        };
    };

    function trackAction(event) {
        if (configLoading) {
            configLoading.then(function () {
                trackAction(event);
            });
        } else if (trackingEnabled && window.s && samplingPassed()) {
            log("[Stats] Omniture tracking action={0}".format(event));
            window.s.trackAction(event);
        }
    };

    function samplingPassed() {
        var passed = Math.random() * 100 < samplingRate;
        log("[Stats] Omniture sampling passed={0}, samplingRate={1}%".format(passed, samplingRate));
        return passed;
    }

    WinJS.Namespace.define("Skype.OmnitureReporter", {
        init: init,
        trackPage: trackPage,
        trackAction: trackAction,

        
        actions:         { get: function () { return actionDefinitions; }},
        trackingEnabled: { get: function () { return trackingEnabled; }},
        samplingRate:    { get: function () { return samplingRate; }},

        ExternalAPI: {
            xhr: WinJS.xhr,
            isReleaseBuild: LibWrap.Build.release
        }
    });
})();