/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='//Microsoft.WinJS.1.0/js/ui.js' />
/// <reference path='../../common/js/tracing.js' />
/// <reference path='../../common/js/utilities.js' />
/// <reference path='eventrelay.js' />
/// <reference path='env.js' />
/// <reference path='servicelocator.js' />
(function () {
    "use strict";

    var cc = Windows.System.UserProfile.GlobalizationPreferences.homeGeographicRegion;
    var localSettings = Windows.Storage.ApplicationData.current.localSettings;

    /// <summary>
    /// Constants for Client Upgrade functionality
    /// </summary>
    var STORE_UPDATE_URI = "ms-windows-store:Updates";

    /// <summary>
    /// Constants for Configuration cached locally
    /// </summary>
    var APP_CONFIG = "appConfig";
    var CONFIG_REFRESH_TIMESTAMP = "configRefreshTimestamp";
    var APP_VERSION_KEY = "appVersion";
    var APPLY_CONFIG_FLAG = "applyConfigurationFlag";
    var APP_CONFIG_TTL = "appConfigTTL";
    var VERSION_UNSUPPORTED = 0;
    var VERSION_SUPPORTED = 1;
    var FEATURE_DISABLED = 0;
    var FEATURE_ENABLED = 1;
    var TTL = 1 * 24 * 60 * 60 * 1000; // 1 day in milliseconds, default 
    var TEST_APP_CONFIG_PATH = "/shell/configuration/test.appconfiguration.json";
    var events = Object.freeze({
        configChanged: "configChanged"
    });

    var appConfigKey = APP_CONFIG + cc;
    var configRefreshTimestampKey = CONFIG_REFRESH_TIMESTAMP + cc;
   
    // NOTE: env.js caches CC in localSettings under "cc" key that could be used to make config related decisions when CC gets updated.

    /// <summary>
    /// Defines class that is associated with the application's configuration.
    /// </summary>
    var AppConfiguration = WinJS.Class.define(
        function constructor() {
            /// <summary>
            /// Holds the parsed configuration object, in memory only
            /// This will be exposed throught the singleton AppConfiguration object so rest of the components can query the most recent configuration settings directly
            /// </summary>
            this.configuration = null;
            if (BingApp.Utilities.isNullOrUndefined(localSettings.values[APPLY_CONFIG_FLAG])) {
                localSettings.values[APPLY_CONFIG_FLAG] = true; // defaults to True
            }
        },
        {
            checkConfiguration: function() {
                /// <summary>
                /// Sends a request to the configuration endpoint if the TTL of the last response has expired
                /// </summary>
                BingApp.traceInfo("AppConfig.checkConfiguration: Checks if there is a need to refresh the configuration.");
                var appConfig = localSettings.values[appConfigKey];

                // update the TTL from the client config (for test hook purposes)
                BingApp.locator.env.configurationReady().then(function () {
                    TTL = BingApp.locator.env.configuration[APP_CONFIG_TTL];
                });

                var sendXHRRequest = true;
                var lastConfigRefreshTimestamp = localSettings.values[configRefreshTimestampKey];
                if (!this._isAppVersionChanged() && lastConfigRefreshTimestamp) {
                    var timeElapsed = Date.now() - lastConfigRefreshTimestamp;
                    // check to see if the cached config's TTL has exprired, in which case we need to refresh the configuration from server end point
                    if (timeElapsed < TTL) {
                        // check the cached configuration to evaluate if the user needs to be prompted to upgrade
                        sendXHRRequest = false;
                        this._parseConfiguration(appConfig);
                    }
                }

                if (sendXHRRequest) {
                    this._getConfiguration();
                }
            },
            _getConfiguration: function() {
                /// <summary>
                /// Checks to see if a local file exists for test app configuration else Sends request to the configuration service to retrieve client specific config as a JSON Blob
                /// </summary>
                var that = this;
                
                function loadAppConfiguration(response, isTestConfig) {
                    if (!(that._parseConfiguration(response.responseText)) && isTestConfig) {
                        BingApp.traceError("AppConfig._getConfiguration: Test App Configuration is not a valid JSON");
                        throw new Error("Test App Configuration is not a valid JSON");
                    }

                    // persist locally in app storage
                    localSettings.values[appConfigKey] = response.responseText;
                    localSettings.values[configRefreshTimestampKey] = Date.now();

                    BingApp.traceInfo("AppConfig._getConfiguration: Configuration loaded from {0}", isTestConfig ? "test.appconfiguration file." : "configuration server." );
                };

                function loadServerAppConfiguration() {
                    BingApp.traceInfo("AppConfig._getConfiguration: Preparing and sending a request to the configuration service.");

                    // Anything going through the proxy needs to provide relative URI since the proxy is already set to the actual domain
                    var configURL = "/win8app/config" +
                        BingApp.locator.env.getQueryStringWithIFrameParams();

                    // fetch the configuration using the proxy
                    BingApp.traceInfo("AppConfig.getConfiguration: Sending XHR request to configuration end point={0}.", configURL);
                    BingApp.locator.proxy.xhr({
                        type: "GET",
                        url: configURL
                    }).then(function onComplete(response) {
                        loadAppConfiguration(response, false);
                    }, function onError(error) {
                        BingApp.traceError("AppConfig._getConfiguration: Config XHR request to {0} failed with message={1} and statusText={2}.", configURL, error.message, error.statusText);
                        BingApp.Instrumentation.log({ name: "ConfigFailed" }, BingApp.Instrumentation.failureEvent);
                    }
                    );
                };

                try {
                    WinJS.xhr({ url: TEST_APP_CONFIG_PATH }).done(
                        function testConfigExists(testConfig) {
                            if (testConfig.responseText && testConfig.responseText.trim().length) {
                                // not an empty string
                                loadAppConfiguration(testConfig, true);
                            } else {
                                loadServerAppConfiguration();
                            }
                        },
                        function loadingTestConfigFailed(err) {
                            BingApp.traceVerbose("AppConfig._getConfiguration: Config XHR request to mockConfig file failed with error:{0}", err.description);
                            loadServerAppConfiguration();
                        }
                    );
                } catch (err) {
                    BingApp.traceError("AppConfig._getConfiguration: Config XHR request to mockConfig file failed with error:{0}", err.description);
                    loadServerAppConfiguration();
                }

            },
            _parseConfiguration: function(data) {
                /// <summary>
                /// Parses the JSON blob received as response from Config service and caches the data locally.
                /// </summary>
                /// <param name="data">
                /// Represents the Configuration response.
                /// </param>
                /// <returns type="Boolean">
                /// true if parse was successful. false otherwise
                /// </returns>
                BingApp.traceInfo("AppConfig._parseConfiguration: Parsing the config JSON response and caching locally.");

                if (data) {
                    try {
                        var response = JSON.parse(data);
                    } catch (error) {
                        BingApp.traceError("AppConfig._parseConfiguration: failed to parse JSON retrieved from Configuration Response. Exact error message is {0}", error.message);
                        return false; //unsuccessful parse
                    }

                    var prevAppConfig = this.configuration;
                    // Store the most recently parsed config object for quick access
                    this.configuration = response;

                    // Determine if new configuration contains any different values and if so raise event
                    var oldAndNewAreDifferent = false;
                    try {
                        oldAndNewAreDifferent = JSON.stringify(prevAppConfig) !== data;
                    } catch (err) {
                        BingApp.traceError("AppConfig._parseConfiguration: failed to stringify JSON for comparison. Exact error message is {0}", err.message);
                        oldAndNewAreDifferent = true;
                    }

                    if (oldAndNewAreDifferent) {
                        BingApp.locator.eventRelay.fireEvent(events.configChanged, {
                            oldConfiguration: prevAppConfig,
                            newConfiguration: this.configuration
                        });
                    }

                    // look if the version is supported anymore
                    if (response.supported === VERSION_UNSUPPORTED) {
                        this._promptForUpgrade();
                    } else if (this._isAppVersionChanged()) {
                        //storing new app version
                        localSettings.values[APP_VERSION_KEY] = BingApp.Classes.Shell.fullVersion;
                    }

                    // Apply config values
                    this._applyConfig(response);

                    return true; //successful parse
                }

                return false; //unsuccessful parse
            },
            _applyConfig: function(data) {
                /// <summary>
                /// Parses the JSON blob received as response from Config service or local cache and applies the changes on this app session.
                /// </summary>
                /// <param name="data">
                /// Represents the Configuration blob.
                /// </param>
                BingApp.traceInfo("AppConfig._applyConfig: Applying the configuration blob on this app session.");

                if (data && localSettings.values[APPLY_CONFIG_FLAG]) {
                    // look for service end points
                    // Domain Host
                    if (data.host) {
                        BingApp.locator.env.setHost(data.host);
                    }

                    // Bing API Host (for Autosuggest)
                    if (data.api && data.api.host) {
                        BingApp.locator.env.setAutosuggestHost(data.api.host);
                    }
                }
            },
            isAutosuggestEnabled: function () {
                /// <summary>
                /// Helper utility to check if AS is enabled or not
                /// </summary>
                if (this.configuration && this.configuration.autosuggest) {
                    return (this.configuration.autosuggest.enabled === FEATURE_ENABLED);
                }

                return true;
            },
            _promptForUpgrade: function() {
                /// <summary>
                /// Prompts the user to upgrade the client application to the latest version supported on Windows AppStore.
                /// </summary>
                BingApp.traceInfo("AppConfig._promptForUpgrade: Prompting the user to upgrade to the latest version available on Store.");

                // Create the message dialog and set its content 
                var msg = new Windows.UI.Popups.MessageDialog(WinJS.Resources.getString("update_version_out_of_date").value + WinJS.Resources.getString("update_download").value);

                // Add buttons and set their command handlers 
                msg.commands.append(new Windows.UI.Popups.UICommand(WinJS.Resources.getString("update_go_to").value, this._forcedUpgradeHandler));

                // Set the command to be invoked when a user presses 'ESC' 
                // Magic value of -2 provided by Windows that is not documented on MSDN yet
                // Use of this value makes the dialog truly modal, even against charm invocations
                msg.cancelCommandIndex = -2;

                // Show the message dialog 
                msg.showAsync();
            },
            _forcedUpgradeHandler: function() {
                /// <summary>
                /// Sets up logic to handle navigation to Store Updates page when the upgrade is accepted by the user
                /// </summary>
                BingApp.traceInfo("AppConfig._forcedUpgradeHandler: Forcing the user to upgrade the latest and greatest app version.");

                BingApp.Instrumentation.logClick({ name: "Upgrade" });
                BingApp.Utilities.invokeURI(STORE_UPDATE_URI).done(
                    function onComplete() {
                        BingApp.traceInfo("AppConfig._forcedUpgradeHandler: Succeeded in navigating to the Store page for updates.");

                        // Bring up the dialog again for scenarios where the user snaps our app or does not proceed with the upgrade from the Store page
                        // We do not want the user to continue with the app so in any case if the user lands up on the app again, we want the user to be presented with the same dialog.
                        BingApp.locator.appConfiguration._promptForUpgrade();
                    },
                    function onError() {
                        BingApp.traceInfo("AppConfig._forcedUpgradeHandler: Failed to navigate to the Store page for updates.");

                        // Bring up the dialog again for scenarios where the user snaps our app or does not proceed with the upgrade from the Store page
                        // We do not want the user to continue with the app so in any case if the user lands up on the app again, we want the user to be presented with the same dialog.
                        BingApp.locator.appConfiguration._promptForUpgrade();
                    });
            },
            _isAppVersionChanged: function () {
                /// <summary>
                /// checks if current version is the same as the version stored in local settings
                /// </summary>
                /// <returns type="Boolean">
                /// true if app version saved is differnet that current app version
                /// </returns>
                var storedAppVersion = localSettings.values[APP_VERSION_KEY];
                var currentAppVersion = BingApp.Classes.Shell.fullVersion;
                return (storedAppVersion !== currentAppVersion);
            }
        },
        {
            APPLY_CONFIG_FLAG: APPLY_CONFIG_FLAG,
            events: events
        }
);

    // Expose App configuration functionality as BingApp.Classes.AppConfiguration
    // Expose Shell class via application namespace
    WinJS.Namespace.define("BingApp.Classes", {
        AppConfiguration: AppConfiguration
    });
})();
