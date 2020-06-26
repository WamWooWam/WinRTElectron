//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(global) {"use strict";
    var ExpectedSourceOrigin = "ms-appx://" + decodeURIComponent(document.domain);
    global.AppMagic = global.AppMagic || {};
    AppMagic.Controls = AppMagic.Controls || {};
    function IframeMediaChannel(onPortMessage) {
        global.onIframeMediaMessage = function(jsonMessage) {
            var message = JSON.parse(jsonMessage);
            onPortMessage(message)
        }
    }
    IframeMediaChannel.prototype.postMessage = function(message) {
        var jsonMessage = JSON.stringify(message);
        window.external.notify(jsonMessage)
    };
    AppMagic.Controls.IframeMediaChannel = IframeMediaChannel
})(window);