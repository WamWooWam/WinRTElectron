/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/utilities.js");
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI");
    WinJS.Namespace.define("MS.Entertainment.UI", {RentalExpirationService: MS.Entertainment.UI.Framework.define(null, {}, {
            getExpirationString: function getExpirationString(media, date, callback) {
                if (date) {
                    var spanInMilliseconds = date - Date.now();
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var useTestExpiration = configurationManager.service.useTestExpirationService;
                    if (useTestExpiration) {
                        var testExpirationIndex = MS.Entertainment.UI.RentalExpirationService.testExpirationIndexes[media];
                        if (testExpirationIndex === undefined)
                            testExpirationIndex = MS.Entertainment.UI.RentalExpirationService.testExpirationIndexes[media] = 0;
                        spanInMilliseconds = MS.Entertainment.UI.RentalExpirationService.getTestExpirations()[testExpirationIndex];
                        if (testExpirationIndex < MS.Entertainment.UI.RentalExpirationService.getTestExpirations().length - 1)
                            MS.Entertainment.UI.RentalExpirationService.testExpirationIndexes[media]++
                    }
                    var expirationTickTimer = null;
                    if (spanInMilliseconds > 0) {
                        var milliSecondsToNextUpdate = spanInMilliseconds % (60 * 1000);
                        expirationTickTimer = window.setTimeout(function() {
                            this.getExpirationString(media, date, callback)
                        }.bind(this), milliSecondsToNextUpdate)
                    }
                    callback(spanInMilliseconds, expirationTickTimer)
                }
                else
                    callback(-1, null)
            }, testExpirationIndexes: [], testExpirations: [], generateNearbyExpirations: function generateExpirations(expSpan) {
                    MS.Entertainment.UI.RentalExpirationService.testExpirations.push(expSpan + 3000);
                    MS.Entertainment.UI.RentalExpirationService.testExpirations.push(expSpan);
                    MS.Entertainment.UI.RentalExpirationService.testExpirations.push(expSpan - 58000)
                }, getTestExpirations: function getTestExpirations() {
                    if (MS.Entertainment.UI.RentalExpirationService.testExpirations.length === 0) {
                        var dateZero = new Date(0, 0, 0);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 12) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 4, 1) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 4) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 3, 2) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 3, 1) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 3) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 2, 2) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 2, 1) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 2) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 1, 2) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 1, 1) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 1) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 0, 2, 2) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 0, 2, 1) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 0, 2) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 0, 1, 2) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 0, 1, 1) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 0, 1) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 0, 0, 2) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 0, 0, 1) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(new Date(0, 0, 0, 0, 0, 5) - dateZero);
                        MS.Entertainment.UI.RentalExpirationService.generateNearbyExpirations(-60000)
                    }
                    return MS.Entertainment.UI.RentalExpirationService.testExpirations
                }, testExpirationSpan: function testSpan(span) {
                    var message;
                    message = MS.Entertainment.Formatters.formatRentalExpirationFromSpanInt(span);
                    Debug.writeln(message)
                }, testExpirationFormatter: function testExpirationFormatter() {
                    var test = MS.Entertainment.UI.RentalExpirationService.getTestExpirations();
                    test.forEach(function(exp) {
                        if (exp % 60000 === 3000)
                            Debug.writeln("");
                        MS.Entertainment.UI.RentalExpirationService.testExpirationSpan(exp)
                    })
                }
        })})
})()
