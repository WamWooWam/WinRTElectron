/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/serviceLocator.js");
(function(MSE) {
    "use strict";
    WinJS.Namespace.defineWithParent(MSE, "Data", {XhrService: MS.Entertainment.UI.Framework.define(function xhrServiceConstructor() {
            throw"XhrService contains only static methods.";
        }, {}, {
            execute: function(values) {
                return WinJS.xhr(values)
            }, factory: function() {
                    return MSE.Data.XhrService
                }
        })});
    MSE.ServiceLocator.register(MSE.Services.xhr, MSE.Data.XhrService.factory)
})(WinJS.Namespace.define("MS.Entertainment", null))
