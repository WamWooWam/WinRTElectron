/* Copyright (C) Microsoft Corporation. All rights reserved. */
this.scriptValidator("/Framework/debug.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Utilities");
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(Utilities) {
            var ABTesting = (function() {
                    function ABTesting(){}
                    ABTesting.registerABTest = function(abTest, abGroups) {
                        MS.Entertainment.UI.Framework.assert(abTest, "Calling registerABTest with an empty abTest name");
                        MS.Entertainment.UI.Framework.assert(abGroups, "Calling registerABTest an empty list of groups");
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        MS.Entertainment.UI.Framework.assert(configurationManager.abTestingOverrides[abTest] !== undefined, "Calling registerABTest on a test that was not registered in ConfigurationManager");
                        if (configurationManager.abTestingOverrides[abTest] === undefined)
                            return;
                        var numGroups = abGroups.length;
                        if (numGroups === 0)
                            return;
                        if (ABTesting._abGroups === null)
                            ABTesting._abGroups = [];
                        if (ABTesting._abGroups[abTest])
                            return;
                        var percentages = 0;
                        var i = 0;
                        var validPercentages = true;
                        for (i = 0; i < abGroups.length; i++) {
                            if (abGroups[i].percentage === undefined || typeof abGroups[i].percentage !== "number") {
                                validPercentages = false;
                                break
                            }
                            percentages = percentages + abGroups[i].percentage
                        }
                        validPercentages = validPercentages && percentages === 100;
                        if (!validPercentages) {
                            var numGroups = abGroups.length;
                            var percentPerGroup = 100 / numGroups;
                            for (i = 0; i < abGroups.length; i++)
                                abGroups[i].percentage = percentPerGroup
                        }
                        ABTesting._abGroups[abTest] = abGroups
                    };
                    ABTesting.isABTestRegistered = function(abTest) {
                        return (ABTesting._abGroups && ABTesting._abGroups[abTest])
                    };
                    ABTesting.getABGroupOverride = function(abTest) {
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        return configurationManager.abTestingOverrides[abTest]
                    };
                    ABTesting.getABGroupNumber = function(abTest) {
                        MS.Entertainment.UI.Framework.assert(ABTesting.isABTestRegistered(abTest), "Calling getABGroupNumber on a group that is not registered");
                        var abGroupNumber = ABTesting.getABGroupOverride(abTest);
                        if (abGroupNumber !== undefined && abGroupNumber === -1) {
                            var settingsStorage = null;
                            if (MS.Entertainment.Utilities.isApp1)
                                settingsStorage = Windows.Storage.ApplicationData.current.roamingSettings;
                            else
                                settingsStorage = Windows.Storage.ApplicationData.current.localSettings;
                            abGroupNumber = settingsStorage.values["ABTests_" + abTest]
                        }
                        return abGroupNumber
                    };
                    ABTesting.getABGroupName = function(abTest) {
                        MS.Entertainment.UI.Framework.assert(ABTesting.isABTestRegistered(abTest), "Calling getABGroupName on a group that is not registered");
                        if (!ABTesting.isABTestRegistered(abTest))
                            return String.empty;
                        var abGroupNumber = ABTesting.getABGroupNumber(abTest);
                        if (abGroupNumber !== undefined && abGroupNumber !== -1)
                            return ABTesting._abGroups[abTest][abGroupNumber] ? ABTesting._abGroups[abTest][abGroupNumber].abGroupName : String.empty;
                        return String.empty
                    };
                    ABTesting.createABGroupNumber = function(abTest) {
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        MS.Entertainment.UI.Framework.assert(configurationManager.abTestingOverrides[abTest] !== undefined, "Calling createABGroupName on a test that was not registered in ConfigurationManager");
                        if (configurationManager.abTestingOverrides[abTest] === undefined)
                            return String.empty;
                        var abGroupName = ABTesting.getABGroupName(abTest);
                        if (!abGroupName) {
                            var abGroups = null;
                            MS.Entertainment.UI.Framework.assert(ABTesting.isABTestRegistered(abTest), "Calling createABGroupName on a group that is not registered");
                            if (ABTesting.isABTestRegistered(abTest))
                                abGroups = ABTesting._abGroups[abTest];
                            if (!abGroups)
                                return String.empty;
                            var flightNumber = configurationManager.telemetry.flightNumber;
                            var randNum = Math.floor(flightNumber / 100);
                            var sumPerc = 0;
                            var abGroupNumber = 0;
                            while (randNum > sumPerc) {
                                sumPerc += abGroups[abGroupNumber].percentage;
                                abGroupNumber++
                            }
                            abGroupNumber = abGroupNumber === 0 ? 0 : abGroupNumber - 1;
                            abGroupName = abGroups[abGroupNumber].abGroupName;
                            var settingsStorage = null;
                            if (MS.Entertainment.Utilities.isApp1)
                                settingsStorage = Windows.Storage.ApplicationData.current.roamingSettings;
                            else
                                settingsStorage = Windows.Storage.ApplicationData.current.localSettings;
                            settingsStorage.values["ABTests_" + abTest] = abGroupNumber;
                            ABTesting.logABGroupCreate(abTest)
                        }
                        return abGroupName
                    };
                    ABTesting.getABGroupNameForTelemetry = function(abTest) {
                        var abGroupName = String.empty;
                        if (!ABTesting.isABTestRegistered(abTest))
                            return abGroupName;
                        var abGroupOverride = ABTesting.getABGroupOverride(abTest);
                        if (abGroupOverride === undefined || abGroupOverride === -1 || typeof abGroupOverride !== "number") {
                            var abGroupNameT = ABTesting.getABGroupName(abTest);
                            if (abGroupNameT)
                                abGroupName = abGroupNameT
                        }
                        return abGroupName
                    };
                    ABTesting.logABGroupCreate = function(abTest) {
                        var abGroupName = ABTesting.getABGroupNameForTelemetry(abTest);
                        if (abGroupName !== String.empty)
                            MS.Entertainment.Utilities.Telemetry.logTelemetryEventWithParameterArray("ABGroupCreated", [{
                                    parameterName: "GroupName", parameterValue: abGroupName
                                }])
                    };
                    ABTesting.logABGroupName = function(datapoint, abTest) {
                        var abGroupName = ABTesting.getABGroupNameForTelemetry(abTest);
                        if (!!abGroupName)
                            datapoint.appendParameter(abTest, abGroupName)
                    };
                    ABTesting.setABGroupNumber = function(abTest, abGroupNumber) {
                        var settingsStorage = null;
                        if (MS.Entertainment.Utilities.isApp1)
                            settingsStorage = Windows.Storage.ApplicationData.current.roamingSettings;
                        else
                            settingsStorage = Windows.Storage.ApplicationData.current.localSettings;
                        settingsStorage.values["ABTests_" + abTest] = abGroupNumber
                    };
                    ABTesting._abGroups = null;
                    return ABTesting
                })();
            Utilities.ABTesting = ABTesting
        })(Entertainment.Utilities || (Entertainment.Utilities = {}));
        var Utilities = Entertainment.Utilities
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
