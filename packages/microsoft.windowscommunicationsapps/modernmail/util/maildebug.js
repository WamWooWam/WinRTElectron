
//
// Copyright (C) Microsoft. All rights reserved.
//


/*global Jx, Mail */
/*jshint browser:true*/

(function () {
    "use strict";
    var D = Mail.Debug = {},
        Plat = Microsoft.WindowsLive.Platform;

    D.ReadingPane = {
        getFrame: function () {
            var readingPane = document.getElementById("mailFrameReadingPane");
            return readingPane.querySelector(Mail.ReadingPaneBody._Selectors.bodyFrameElementSelector);
        }
    };
    D.abbreviatedLogLength = 1000;
    D.abbreviatedLog = function (str) {
        window.clipboardData.setData("Text", str);
        Jx.log.info(str.substr(0,D.abbreviatedLogLength));
        if (str.length > D.abbreviatedLogLength) {
            Jx.log.info("    >> String too long - full string is " + String(str.length) + " characters long");
        }
    };
    window.renderedHTML = function () {
        D.abbreviatedLog(D.ReadingPane.getFrame().contentDocument.documentElement.outerHTML);
    };
    window.scrubbedHTML = function () {
        D.abbreviatedLog(Mail.Globals.appState.lastSelectedMessage.platformMailMessage.getBody(Plat.MailBodyType.sanitized).body);
    };
    window.platformHTML = function () {
        D.abbreviatedLog(Mail.Globals.appState.lastSelectedMessage.platformMailMessage.getBody(Plat.MailBodyType.html).body);
    };

    window.getWorkerOwner = function () {
        Debug.assert(Jx.isInstanceOf(Debug.workerOwner, Mail.WorkerOwner));
        return Debug.workerOwner;
    };

    window.getUnscrubbedCount = function () {
        return Jx.root._platform.mailManager.getMessageCollectionBySanitizedVersion(Plat.SanitizedVersion.notSanitized).count;
    };

    D.showGrid = function () {
        for (var ii = 0, max = Math.max(window.screen.width, window.screen.height); ii < max;  ii = ii + (ii === 0 ? 19 : 20)) {
            var horizontal = window.document.createElement("div");
            var vertical = window.document.createElement("div");
            horizontal.style.zIndex = vertical.style.zIndex = 100;
            horizontal.style.position = vertical.style.position = "fixed";
            horizontal.style.left = vertical.style.top = "0px";
            horizontal.style.top = vertical.style.left = String(ii) + "px";
            horizontal.style.height = vertical.style.width = String(ii === 0 ? 19 : 20) + "px";
            horizontal.style.width = vertical.style.height = "100%";
            horizontal.style.borderBottomColor = vertical.style.borderRightColor = "#CEE6F5";
            horizontal.style.borderBottomStyle = vertical.style.borderRightStyle = "solid";
            horizontal.style.borderBottomWidth = vertical.style.borderRightWidth = "1px";
            horizontal.style.pointerEvents = vertical.style.pointerEvents = "none";
            window.document.body.appendChild(vertical);
            window.document.body.appendChild(horizontal);
        }
    };

    D.defaultFontSettings = function (action, ignoreSettings) {
        action = !Jx.isBoolean(action) || action;
        ignoreSettings = Jx.isBoolean(ignoreSettings) ? ignoreSettings : false;
        if (action && !D.defaultFontEnabled) {
            D.defaultFontEnabled = true;
            D.resetMailSettingsFlyout = true;
            D.ignoreFontAppSettings = ignoreSettings;
        } else if (!action && D.defaultFontEnabled) {
            D.defaultFontEnabled = false;
            D.resetMailSettingsFlyout = true;
        }
    };

    function updateWidthDisplay () {
        var id = "_FRAMEWIDTHINFO",
            info = document.getElementById(id);
        if (!info) {
            info = document.createElement("div");
            info.id = id;

            Mail.setAttribute(info, "style",
                "position: fixed;" +
                "left: 0px;" +
                "top: 0px;" +
                "height: 100%;" +
                "width: 100%;" +
                "text-align: center;" +
                "line-height: 60px;" +
                "color: darkblue;" +
                "font-size: 30px;" +
                "z-index: 100;" +
                "pointer-events: none;" +
                "font-weight: 500;" +
                "text-shadow: 0px 0px 3px yellow;"
            );

            document.body.appendChild(info);
        }

        function getWidth(selector) { return Math.round(document.querySelector("#mailFrame " + selector).getBoundingClientRect().width); }

        var navPaneWidth = getWidth(".mailFrameNavPaneBackground"),
            messageListWidth = getWidth(".mailFrameMessageListBackground"),
            readingPaneWidth = getWidth("#mailFrameReadingPaneSection");
        info.innerText = window.innerWidth + "px = " + navPaneWidth + "px + " + messageListWidth + "px + " + readingPaneWidth + "px\n" +
                         "Physical width: " + window.outerWidth + "px";
    }

    D.showAppWidth = function() {
        window.addEventListener("resize", updateWidthDisplay, false);
        Mail.guiState.addListener("layoutChanged", updateWidthDisplay, null);
        updateWidthDisplay();
    };

    D.forceWinJSAnimation = function () {
        while (!WinJS.UI.isAnimationEnabled()) {
            WinJS.UI.enableAnimations();
        }
    };

    D.reloadCSS = function () {
        var children = document.head.querySelectorAll("link[rel='stylesheet']"),
            stylesheets = [];
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            child.removeNode(true);
            stylesheets.push(child.getAttribute("href") + "?" + Date.now());
        }

        stylesheets.map(Jx.loadCss);
    };

    D.disableLightDismiss = function () {
        WinJS.UI.SettingsFlyout.prototype._hide = Jx.fnEmpty;
        WinJS.UI.Menu.prototype._hide = Jx.fnEmpty;
    };

})();


