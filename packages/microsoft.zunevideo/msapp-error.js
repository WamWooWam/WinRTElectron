/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    function initialize() {
        var json = {
                httpStatus: "", failureName: "", failureUrl: ""
            };
        for (var property in json) {
            var parameterValue = getQueryParameter(property);
            if (parameterValue)
                json[property] = unescape(parameterValue);
            else
                json[property] = "Unknown"
        }
        json["verb"] = json["message"] = "NAVIGATION_ERROR";
        json["header"] = {
            version: {
                major: "1", minor: "0"
            }, taskId: "OTHER"
        };
        var jsonString = JSON.stringify(json);
        var origin = "ms-appx://" + document.location.host;
        window.parent.postMessage(jsonString, origin)
    }
    function getQueryParameter(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] === variable)
                return pair[1]
        }
        return ""
    }
    document.addEventListener("DOMContentLoaded", initialize, false)
})()
