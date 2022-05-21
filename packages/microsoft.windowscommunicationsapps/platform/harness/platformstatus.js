
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

var PlatformStatus = PlatformStatus || {};

(function () {
    var wl = Microsoft.WindowsLive.Platform;

    function formatResult(signedResult) {
        var ret = "";

        if (signedResult < 0) {
            // Quick signed->unsigned conversion [and the substring removes the extra digit]
            ret = (signedResult + 0x1000000000).toString(16);
            if (ret.length > 8) {
                ret = ret.substring(1);
            }
        }
        else {
            ret = signedResult.toString(16);
        }

        return ret;
    }

    function isDateTimeValid(dateTime) {
        // platform returns 0 for DateTime's that aren't set, but
        // projection changes these into 1600-01-01 in the local timezone
        var zeroTime = new Date(0);
        zeroTime.setYear(1600);

        return (dateTime instanceof Date) && (zeroTime.getTime() != dateTime.getTime());
    }

    function getNameOfEnumValue(enumType, enumValue) {
        var enumValueNumber = Number(enumValue);

        // Try to find a key with the same value
        for (var key in enumType) {
            if (enumType[key] === enumValueNumber) {
                return key.toString();
            }
        }

        // No key was found, so just return the value
        return enumValueNumber.toString();
    }

    function getErrorDescription(resultType, syncResult) {
        var ret = "";
        var message = "Failed";

        var messages = {};
        messages[wl.Result.authNotAttempted] = "(not attempted)";
        messages[wl.Result.e_HTTP_DENIED] = "Please check that your account is correctly enabled for dogfood.  Go to http://windows/livedog/default.aspx for more info.";
        messages[wl.Result.invalidAuthenticationTarget] = "You are currently pointing to: " + PlatformStatus.getEnvironmentSetting() + ".  Please use EPDashboard to point to the correct environment.";
        messages[wl.Result.serverNotAttempted] = "(never synchronized)";

        var errorName = getNameOfEnumValue(wl.Result, syncResult);
        if (messages[syncResult]) {
            message = messages[syncResult];
        }

        ret = resultType + ": " + errorName;
        if (syncResult != wl.Result.success) {
            ret += " (" + formatResult(syncResult) + ") " + message;
        }

        return ret;
    }

    function noopFunction(message) {
    }

    function defaultLogFunction(message) {
        this.ret += "<div>" + message + "</div>";
    }

    function defaultEnterFunction(message) {
        this.ret += "<li>" + message + ": ";
    }

    function defaultExitFunction() {
        this.ret += "</li>";
    }

    PlatformStatus.getAuthStatus = function (account) {
        var authResult = account.lastAuthResult;
        return getErrorDescription("auth", authResult);
    };

    PlatformStatus.getSyncStatus = function (account, resources) {
        var objForDefaultLogging = { ret: "" };

        PlatformStatus.logAccountStatus(defaultLogFunction.bind(objForDefaultLogging), defaultEnterFunction.bind(objForDefaultLogging), defaultExitFunction.bind(objForDefaultLogging), account, resources);

        return objForDefaultLogging.ret;
    };

    PlatformStatus.getSetting = function (settingName, defaultValue) {
        var environmentSetting = "";

        try {
            // Put this in a try catch in case we have not yet saved data.
            // If the property doesn't exist an exception will occur when getSetting is called.
            // However, this is not an error
            environmentSetting = /*@static_cast(String)*/Windows.Storage.ApplicationData.current.localSettings.values.lookup(settingName);
        } catch (e) {
        }

        if (!Jx.isNonEmptyString(environmentSetting)) {
            environmentSetting = defaultValue;
        }

        return environmentSetting;
    };

    PlatformStatus.getEnvironmentSetting = function () {
        return PlatformStatus.getSetting("ENVIRONMENT", "Production");
    };

    var resourcesThatSynchronize = [wl.ResourceType.accounts, wl.ResourceType.calendar, wl.ResourceType.catalogScenarioDocument, wl.ResourceType.catalogServicesDocument, wl.ResourceType.contactAgg, wl.ResourceType.contacts, wl.ResourceType.mail, wl.ResourceType.meContactFolder];

    PlatformStatus.logAccountStatus = function (logFunction, startListFunction, endListFunction, account, resources) {        
        var logFunc = logFunction || noopFunction;
        var startFunc = startListFunction || noopFunction;
        var endFunc = endListFunction || noopFunction;

        if (resources != null)
        {
            for (var resource in resources) {
                var resourceType = resources[resource];
                var accountResource = account.getResourceByType(resourceType);
                if (Jx.isObject(accountResource)) {
                    var synchronizingResource = (-1 != resourcesThatSynchronize.indexOf(resourceType));

                    startFunc(getNameOfEnumValue(wl.ResourceType, resourceType));

                    var resourceState = accountResource.resourceState;
                    var showSynchronizing = accountResource.isSynchronizing;

                    if (wl.ResourceState.error === resourceState) {
                        var syncResult = accountResource.lastSyncResult;
                        logFunc(getErrorDescription("error", syncResult));
                    } else if (wl.ResourceState.none === resourceState) {
                        if (synchronizingResource) {
                            // If we are synchronizing, we'll display that instead
                            if (!showSynchronizing) {
                                logFunc("up to date");
                            }
                        } else {
                            logFunc("not connected");
                        }
                    } else {
                        logFunc(getNameOfEnumValue(wl.ResourceState, resourceState));
                    }

                    if (showSynchronizing) {
                        logFunc("synchronizing...");
                    }

                    if (synchronizingResource)
                    {
                        var lastSyncTime = accountResource.lastSyncTime;
                        if (isDateTimeValid(lastSyncTime)) {
                            logFunc("last success at: " + lastSyncTime);
                        }
                    }

                    endFunc(getNameOfEnumValue(wl.ResourceType, resources[resource]));
                }
            }
        }
    };

})();
