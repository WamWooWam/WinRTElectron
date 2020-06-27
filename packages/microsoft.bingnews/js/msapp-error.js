/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    var failureUrl = null;
    function getPartnerUrlStringKey(string) {
        var windowName = window.name;
        if (windowName && windowName.indexOf("_AuthFrame")) {
            var parts = windowName.split("_");
            if (parts.length === 2) {
                return "/" + parts[0] + "/" + string
            }
        }
        return null
    }
    function initialize() {
        if (checkForFailure("FORBIDFRAMING")) {
            setupMessage("ForbidFramingError", true)
        }
        else {
            setupMessage("ResourceNotFoundError", false)
        }
        window.parent.postMessage({ action: "hideProgress" }, "*")
    }
    function setupMessage(textResource, showOpenInBrowser) {
        var div = document.getElementById("forbidFramingError");
        if (div) {
            WinJS.Utilities.removeClass(div, "forbidFramingHidden")
        }
        var span = document.getElementById("forbidFramingErrorMessage");
        if (span) {
            var partnerStringKey = getPartnerUrlStringKey(textResource);
            span.textContent = Platform.ServicesAccessor.resourceLoader.getString(partnerStringKey || textResource)
        }
        var button = document.getElementById("openInBrowser");
        if (button && showOpenInBrowser) {
            button.textContent = Platform.ServicesAccessor.resourceLoader.getString("OpenInBrowser");
            button.onclick = function () {
                var uri = new Windows.Foundation.Uri(failureUrl);
                Windows.System.Launcher.launchUriAsync(uri)
            }
        }
        else {
            WinJS.Utilities.addClass(button, "forbidFramingHidden")
        }
    }
    function checkForFailure(failureMessage) {
        var isFound = false;
        var failureName = getQueryParameter("failureName");
        if (failureName && failureName === failureMessage) {
            failureUrl = getQueryParameter("failureUrl");
            if (failureUrl) {
                isFound = true
            }
        }
        return isFound
    }
    function getQueryParameter(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] === variable) {
                return decodeURIComponent(pair[1])
            }
        }
        return ""
    }
    document.addEventListener("DOMContentLoaded", initialize, false)
})()