/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/utilities.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {MessageLinkBox: MS.Entertainment.UI.Framework.defineUserControl("/Controls/MessageLinkBox.html#messageLinkBoxTemplate", function messageLinkBoxConstructor(element, options) {
            this.webLinkText = String.load(String.id.IDS_COLLECTION_TOOLTIP_LEARN_MORE)
        }, {}, {})})
})()
