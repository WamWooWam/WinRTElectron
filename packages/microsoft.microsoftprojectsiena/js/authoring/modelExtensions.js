//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    (function() {
        function getInput(template, propertyName) {
            var result = template.tryGetInputProperty(propertyName);
            return result.property
        }
        function getOutput(template, propertyName) {
            var result = template.tryGetOutputProperty(propertyName);
            return result.property
        }
        function tryGetInput(template, propertyName) {
            var result = template.tryGetInputProperty(propertyName);
            return result && result.value ? result.property : null
        }
        function tryGetOutput(template, propertyName) {
            var result = template.tryGetOutputProperty(propertyName);
            return result && result.value ? result.property : null
        }
        WinJS.Namespace.define("AppMagic.AuthoringTool.Extensions.ControlTemplate", {
            getInput: getInput, getOutput: getOutput, tryGetInput: tryGetInput, tryGetOutput: tryGetOutput
        })
    })(),
    function() {
        function getDataSource(doc, dataSourceName) {
            var result = doc.tryGetDataSource(dataSourceName);
            if (!result || !result.value)
                throw new Error(AppMagic.Strings.DataSourceNotFound + " " + dataSourceName + ".");
            return result.dataSource
        }
        function tryGetDataSource(doc, dataSourceName) {
            var result = doc.tryGetDataSource(dataSourceName);
            return result && result.value ? result.dataSource : null
        }
        WinJS.Namespace.define("AppMagic.AuthoringTool.Extensions.Document", {
            getDataSource: getDataSource, tryGetDataSource: tryGetDataSource
        })
    }()
})();