/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../common/js/tracing.js' />
(function () {
    "use strict";

    // private static members
    var market = new Windows.ApplicationModel.Resources.ResourceLoader("market");
    var fallBackAppConfig = new Windows.ApplicationModel.Resources.ResourceLoader("appconfig");
    var STORAGE_KEY = "BingApp.Classes.Env";
    var DEFAULT_HOST = market.getString("DEFAULT_HOST"); // usually www.bing-int.com or www.dev2-bing-int.com
    var DEFAULT_AS_API_HOST = market.getString("DEFAULT_API_HOST"); // usually api.bing-int.com, used for autosuggest
    var DEFAULT_FLIGHT = "flt7:0"; // usually flt7:win8appserp
    var cachedCCKey = "cc";
    var SAFE_SEARCH_PREFERENCE = "SAFE_SEARCH_PREF";
    var SAFE_SEARCH_RESTRICTED_MARKETS = ["ae", "bh", "cn", "dz", "eg", "id", "in", "iq",
                                          "jo", "kr", "kw", "lb", "ly", "ma", "my", "om", "qa",
                                          "sa", "sg", "th", "tn", "tr", "xa", "ye" ]

    var defaultHost = null;
    var oemPartnerCode = null;

    function constructor() {
        /// <summary>
        /// Allocates a new instance of the BingApp.Classes.Env class.
        /// </summary>
        var that = this;

        var cc = Windows.System.UserProfile.GlobalizationPreferences.homeGeographicRegion;
        var localSettings = Windows.Storage.ApplicationData.current.localSettings;
        var cachedCC = localSettings.values[cachedCCKey];

        this.defaultHost = DEFAULT_HOST;
        if (this.defaultHost) {
            this.defaultHost = this.defaultHost.toLowerCase();
        }

        // Our market files are currently language based so unless the user has Chinese as the top language, we are not going to pull the Chinese market file to point the user to cn.bing.com
        // This is a temporary workaround for RTM
        // TODO : Need to remove the following special check for CN and instead make the market files region based (GA work item)
        this.host = cc.toLowerCase() === "cn" ? "http://cn.bing.com" : DEFAULT_HOST;
        if (this.host) {
            this.host = this.host.toLowerCase();
        }

        this.autosuggestHost = DEFAULT_AS_API_HOST;
        if (this.autosuggestHost) {
            this.autosuggestHost = this.autosuggestHost.toLowerCase();
        }

        this.requestParameters = {
        };

        // Lookup local storage only if the cached settings are for region === user's current region
        // We need to skip looking into local storage and overriding the default host if the user switched region
        // This is a safeguard for China region to honor cn.bing.com and not override it from the previously cached host
        // See TFS bug # 270540, 270207
        if (cachedCC && cachedCC === cc) {
            // try restoring from local storage
            var storageValue = null;

            try {
                storageValue = window.localStorage[STORAGE_KEY];
            }
            catch (error) {
                BingApp.traceError("Env.ctor: failed to parse env data stored locally with error: '{0}'. Revert to using default values.", error.message);
            }

            if (storageValue) {
                try {
                    storageValue = JSON.parse(storageValue);
                } catch (error) {
                    BingApp.traceError("Env.ctor: failed to parse env data stored locally with error: '{0}'. Revert to using default values.", error.message);
                    storageValue = null;
                }

                if (storageValue) {
                    if (storageValue.host) {
                        this.setHost(storageValue.host);
                    }

                    if (storageValue.defaultHost) {
                        this.setDefaultHost(storageValue.defaultHost);
                    }

                    if (storageValue.autosuggestHost) {
                        this.setAutosuggestHost(storageValue.autosuggestHost);
                    }

                    if (storageValue.requestParameters) {
                        this.requestParameters = storageValue.requestParameters;
                    }
                }
            }
        }

        // Country code and language are OS-dependent, and their values in the request parameters
        // should be updated at least every time the app is restarted (related bug: 202421).
        this.requestParameters.cc = cc;
        this.requestParameters.setlang = Windows.System.UserProfile.GlobalizationPreferences.languages[0];
        localSettings.values[cachedCCKey] = cc;

        // Load configuration values that can be modified before app launch.  These settings
        // are delay loaded, so they should only be values that are not critical for
        // app startup.
        this.configuration = {};
        var loadTestSettings = new BingApp.Classes.LoadJsonOperation();
        this._loadTestSettingsPromise = loadTestSettings.run({
            fileLocation: "/shell/configuration/env.configuration.json"
        }).then(function (config) {
            that.configuration = config;
        });

        // load the oem partner code from a file called custom.data, which would reside in the installation directory
        // if it exists. 
        getOEMPartnerCode().done(
                function (code) {
                    oemPartnerCode = code;
                },
                function (err) {
                    BingApp.traceError("env.constructor failed to get OEM Partner code {0}", err.message);
                });
    }

    function save(e) {
        /// <summary>
        /// Saves the environment data to the local storage.
        /// </summary>
        /// <param name="e">
        /// The environment to save.
        /// </param>
        if (e) {

            try{
                window.localStorage[STORAGE_KEY] = JSON.stringify({
                    host: e.host,
                    defaultHost: e.defaultHost,
                    autosuggestHost: e.autosuggestHost,
                    requestParameters: e.requestParameters
                });
            } catch (error) {
                BingApp.traceError("Env.save: failed to save data stored locally with error: '{0}' .", error.message);
            }


        }
    }

    function setHost(host) {
        /// <summary>
        /// Sets the host.
        /// </summary>
        /// <param name="host" type="String">
        /// The new host to set.
        /// </param>
        if (host) {
            host = host.toLowerCase();
            if (this.host !== host) {
                this.host = host;
                BingApp.traceInfo("Env set to " + this.host);
                this.save(this);
            }
        }
    }

    function getHostUrl() {
        /// <summary>
        /// Gets the host URL.
        /// </summary>
        /// <returns>
        /// The host URL (protocol and host).
        /// </returns>
        return this.host;
    }

    function getDefaultHostUrl() {
        /// <summary>
        /// Gets the default host URL - either the one from markets file or the one set from configuration pane (internal only)
        /// </summary>
        /// <returns>
        /// The default host URL (protocol and host).
        /// </returns>
        return this.defaultHost;
    }

    function setDefaultHost(defaultHost) {
        /// <summary>
        /// Sets the default host.
        /// </summary>
        /// <param name="host" type="String">
        /// The new host to set.
        /// </param>
        if (defaultHost) {
            defaultHost = defaultHost.toLowerCase();
            if (this.defaultHost !== defaultHost) {
                this.defaultHost = defaultHost;
                this.save(this);
            }
        }
    }

    function getAutosuggestHostUrl() {
        /// <summary>
        /// Gets the host URL.
        /// </summary>
        /// <returns>
        /// The host URL (protocol and host).
        /// </returns>
        return this.autosuggestHost;
    }

    function setAutosuggestHost(autosuggestHost) {
        /// <summary>
        /// Sets the AutoSuggest API host.
        /// </summary>
        /// <param name="autoSuggestHost" type="String">
        /// The new AS API host to set.
        /// </param>
        if (autosuggestHost) {
            autosuggestHost = autosuggestHost.toLowerCase();
            if (this.autosuggestHost !== autosuggestHost) {
                this.autosuggestHost = autosuggestHost;
                BingApp.traceInfo("AS API set to " + this.autosuggestHost);
                this.save(this);
            }
        }
    }

    function reset() {
        /// <summary>
        /// Clears the query parameters
        /// and sets the host to default value
        /// </summary>
        this.setHost(DEFAULT_HOST);
        this.setAutosuggestHost(DEFAULT_AS_API_HOST);
        this.requestParameters = {};
        BingApp.traceInfo("Reset the env, requestParamaters cleared");
        this.save(this);
    }

    function setRequestParameter(param, val) {
        /// <summary>
        /// Sets or deletes a parameter.
        /// </summary>
        /// <param name="param" type="String">
        /// The parameter to set or remove.
        /// </param>
        /// <param name="val" type="String" optional="true">
        /// The value to set.
        /// </param>
        if (param) {
            if (val) {
                this.requestParameters[param] = val;
                BingApp.traceInfo("Env.requestParameters['" + param + "'] set to " + val);
            } else {
                delete this.requestParameters[param];
                BingApp.traceInfo("Env.requestParameters['" + param + "'] was deleted");
            }
            this.save(this);
        }
    }

    function getQueryString() {
        /// <summary>
        /// Gets the query string, from the list of request parameters.
        /// </summary>
        /// <returns type="String">
        /// The query string.
        /// </returns>
        var params = [];
        var that = this;
        Object.keys(this.requestParameters).forEach(function (key) {
            params.push(key + "=" + that.requestParameters[key]); // escape, encodeURI, encodeURIComponent all replace ':' by %3A which messes up ?setflight
        });

        return params.join("&");
    }

    function getQueryStringWithIFrameParams(query, window) {
        /// <summary>
        /// Builds the query string, from the list of existing parameters, settings parameters and current app parameters
        /// </summary>
        /// <param name="query" type="String" optional="true">
        /// Existing query parameters
        /// </param>
        /// <param name="window" type="Object" optional="true">
        /// The value to set.
        /// </param>
        /// <returns type="String">
        /// The query string.
        /// </returns>

        // Append version and frame dimension to the query
        var height = 0;
        var width = 0;
        var deviceDPI = undefined;
        var body = window && window.document && window.document.body;
        var screen = window && window.screen;
        if (body) {
            height = body.offsetHeight;
            width = body.offsetWidth;
        }

        if (screen && screen.deviceXDPI && screen.deviceYDPI) {
            deviceDPI = screen.deviceXDPI + "," + screen.deviceYDPI;
        }

        if (query) {
            query = query + "&";
        } else {
            query = "?";
        }
        query = query + this.getQueryString();

        // De-duplicate querystring parameters, and override values with more recent ones
        var collection = BingApp.Utilities.QueryString.parse(query, { decode: true });
        collection["w8-height"] = height;
        collection["w8-width"] = width;
        collection["w8-version"] = BingApp.Classes.Shell.fullVersion;
        if (deviceDPI) {
            collection["w8-devicedpi"] = deviceDPI;
        }

        if (oemPartnerCode) {
            collection["PC"] = oemPartnerCode;
        }
        return BingApp.Utilities.QueryString.serialize(collection);
    }

    function sanitizeQueryString(query) {
        /// <summary>
        /// Builds new query by removing parameters that were added by getQueryStringWithIFrameParams 
        /// or getQueryString methods.
        /// </summary>
        /// <param name="query" type="String">
        /// Existing query parameters.
        /// </param>
        /// <returns type="String">
        /// The query string without standard parameters.
        /// </returns>
        var collection;
        try {
            collection = BingApp.Utilities.QueryString.parse(query, { decode: true });
        } catch (e) {
            BingApp.traceError("Env.sanitizeQueryString: failed to parse query '{0}' with error '{1}'. Returning empty query back.", query, e.message);
            return BingApp.Utilities.QueryString.serialize({});
        }

        Object.keys(this.requestParameters).forEach(function (key) {
            delete collection[key];
        });

        ["w8-height", "w8-width", "w8-version", "w8-devicedpi"].forEach(function (key) {
            delete collection[key];
        });

        return BingApp.Utilities.QueryString.serialize(collection);
    }

    function getSafeSearch() {
        var localSettings = Windows.Storage.ApplicationData.current.localSettings;
        var safeSearchState = localSettings.values[SAFE_SEARCH_PREFERENCE];
        return safeSearchState || getDefaultSafeSearch();
    }

    function setSafeSearch(val) {
        var validSettings = {
            STRICT: "STRICT",
            DEMOTE: "DEMOTE",
            OFF: "OFF"
        };

        if (!validSettings[val]) {
            // TODO: Get string from rsrc file
            throw BingApp.Classes.ErrorArgument("val", "Invalid safe search setting");
        }

        var localSettings = Windows.Storage.ApplicationData.current.localSettings;
        localSettings.values[SAFE_SEARCH_PREFERENCE] = val;
    }

    function getDefaultSafeSearch() {
        // TODO: TFS# 200759 Env.configuration: - needs to be available when settings is invoked.
        // For now we are getting the values locally.
        return isMarketRestricted() ? "STRICT" : "DEMOTE";
    }

    function isMarketRestricted() {
        var code = Windows.System.UserProfile.GlobalizationPreferences.homeGeographicRegion.toLowerCase();
        return (SAFE_SEARCH_RESTRICTED_MARKETS.indexOf(code) !== -1);
    }

    function isICPEnabled() {
        /// <summary>
        /// If the current location of the user is cn then we have to display icp text.
        /// </summary>
        /// <returns type="boolean">
        /// Should UI display the ICP text.
        /// </returns>
        var code = Windows.System.UserProfile.GlobalizationPreferences.homeGeographicRegion.toLowerCase();
        return code === "cn";
    }

    function configurationReady() {
        /// <summary>
        /// Ensures that the JSON configuration file is loaded.
        /// </summary>
        /// <returns type="WinJS.Promise">
        /// A promise which completes when the configuration file is loaded.
        /// </returns>
        return this._loadTestSettingsPromise;
    }

    function hasDataProviderUrl(providerName) {
        /// <summary>
        /// returns true if url for data provider can be retrieved
        /// </summary>
        /// <param name="providerName" type="String" >
        /// Name that identifies data provider, it should be the same name as in config file
        /// </param>
        /// <returns type="bool">
        /// true if url is available false otherwise
        /// </returns>
        if (!providerName) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("providerName");
        }

        var config = BingApp.locator.appConfiguration.configuration;

        if (config && config.trends) {
            if (config.trends.enabled && config.trends[providerName] && config.trends[providerName].enabled && config.trends[providerName].url) {
                return true;
            } else {
                return false;
            }
        } else {
            var defaultProviderUrls = fallBackAppConfig.getString("DEFAULT_PROVIDER_URLS");
            if (defaultProviderUrls && JSON.parse(defaultProviderUrls)[providerName]) {
                return true;
            } else {
                return false;
            }
        }
    }

    function getDataProviderUrl(providerName) {
        /// <summary>
        /// returns url for data provider
        /// </summary>
        /// <param name="providerName" type="String" >
        /// Name that identifies data provider, it should be the same name as in config file
        /// </param>
        /// <returns type="String">
        /// url for requested data provider
        /// </returns>

        var config = BingApp.locator.appConfiguration.configuration;

        if (hasDataProviderUrl(providerName)) {
            if (config && config.trends) {
                return config.trends[providerName].url;
            } else {
                return JSON.parse(fallBackAppConfig.getString("DEFAULT_PROVIDER_URLS"))[providerName];
            }
        } else {
            throw new BingApp.Classes.ErrorArgument("providerName", "Provider is not enabled or requested url does not exist in config file");
        }
    }

    function getOEMPartnerCode() {
        /// <summary>
        /// returns a promise to the OEM partner code
        /// </summary>
        /// <returns type="WinJS.Promise">
        /// promise to the OEM PartnerCode.
        /// </returns>
        if (oemPartnerCode) {
            return WinJS.Promise.as(oemPartnerCode);
        }

        return new WinJS.Promise(
                function init(complete, error) {
                    Windows.ApplicationModel.Package.current.installedLocation.getFileAsync("custom.data").done(
                        function (file) {
                            file.openAsync(Windows.Storage.FileAccessMode.read).then(function (readStream) {
                                try {
                                    var reader = new Windows.Storage.Streams.DataReader(readStream);
                                    reader.loadAsync(readStream.size).done(
                                        function (numBytesLoaded) {
                                            var fileContent = reader.readString(numBytesLoaded);
                                            fileContent = BingApp.Utilities.trim(fileContent);

                                            var validCode = /[A-Z]{1}[A-Z0-9]{1,10}$/m.test(fileContent);
                                            if (validCode && fileContent.length <= 10) {
                                                complete(fileContent);
                                            }
                                            else {
                                                BingApp.traceError("env.getOEMPartnerCode invalid partner Code : {0} return {1} ", fileContent, validCode);
                                                error(new WinJS.ErrorFromName("BingApp.locator.Env", "Invalid OEM code"));
                                            }
                                        },
                                        function (e) {
                                            BingApp.traceError("env.getOEMPartnerCode failed to load : {0}", e.message);
                                            error(new WinJS.ErrorFromName("BingApp.locator.Env", "Invalid OEM code"));
                                        });
                                }
                                catch (e) {
                                    BingApp.traceError("env.getOEMPartnerCode failed to load : {0}", e.message);
                                    error(new WinJS.ErrorFromName("BingApp.locator.Env", "Invalid OEM code"));
                                }
                            });
                        },
                        function (err) {
                            BingApp.traceError("env.getOEMPartnerCode failure : err {0}", err.message);
                            error(err);
                        });
                });
    }

    var instanceMembers = {
        // public
        host: null,
        autosuggestHost: null,
        requestParameters: null,
        setHost: setHost,
        getHostUrl: getHostUrl,
        setDefaultHost: setDefaultHost,
        getDefaultHostUrl: getDefaultHostUrl,
        getAutosuggestHostUrl: getAutosuggestHostUrl,
        setAutosuggestHost: setAutosuggestHost,
        getQueryString: getQueryString,
        getQueryStringWithIFrameParams: getQueryStringWithIFrameParams,
        sanitizeQueryString: sanitizeQueryString,
        setRequestParameter: setRequestParameter,
        save: save,
        reset: reset,
        configuration: null,
        getSafeSearch: getSafeSearch,
        setSafeSearch: setSafeSearch,
        isMarketRestricted: isMarketRestricted,
        isICPEnabled: isICPEnabled,
        configurationReady: configurationReady,
        hasDataProviderUrl: hasDataProviderUrl,
        getDataProviderUrl: getDataProviderUrl,
        getOEMPartnerCode: getOEMPartnerCode,
        // non-enumerable
        _loadTestSettingsPromise: null
    };

    var staticMembers = {};

    WinJS.Namespace.define("BingApp.Classes", {
        Env: WinJS.Class.define(constructor, instanceMembers, staticMembers)
    });

})();