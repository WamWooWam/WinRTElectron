/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Application", {updatePage: function updatePage() {
            updateAppTitle.textContent = WinJS.Resources.getString('IDS_VERSION_CHECK_UPGRADE_CAPTION').value;
            updateAppDescription.textContent = WinJS.Resources.getString('IDS_VERSION_CHECK_UPGRADE_TEXT').value;
            launchStoreLink.textContent = WinJS.Resources.getString('IDS_VERSION_CHECK_UPGRADE_LINK').value;
            var launchInfo = "ms-windows-store:Updates";
            launchStoreLink.href = launchInfo;
            window.sessionStorage.setItem("HardBlockEnabled", "true")
        }})
})()
