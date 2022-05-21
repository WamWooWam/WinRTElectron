
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,WinJS*/

Jx.delayDefine(Mail, "BodyLinkFlyout", function () {
    "use strict";

    Mail.BodyLinkFlyout = {
        _flyout: null,
        _flyoutDiv: null,
        _appRoot: null,
        _selectedElement: null,

        _copySelectedElement: function () {
            // Copy fails if stack does not unroll first
            Jx.scheduler.addJob(null,
                Mail.Priority.bodyLinkFlyout,
                "BodyLinkFlyout - Copy link html to clipboard",
                function () {
                    this._selectedElement.ownerDocument.execCommand("Copy");
                },
                this
            );

        },

        // Get method to allow unit tests to override clipboard
        _getClipboard: function () {
            return window.clipboardData;
        },
    
        _copySelectedLink: function () {
            Mail.writeProfilerMark("BodyLinkFlyout._copySelectedLink", Mail.LogEvent.start);
            var selectedElement = this._selectedElement;
            var href = Jx.isHTMLElement(selectedElement) ? selectedElement.href : null;
            if (Jx.isNonEmptyString(href)) {
                var clipboardData = this._getClipboard();
                try {
                    clipboardData.setData("URL", href);
                } catch (e) {
                    // Some href values won't copy to clipboard under type URL.
                    Jx.log.exception("Failed to copy URL to clipboard", e);
                    try {
                        clipboardData.setData("Text", href);
                    } catch (ex) {
                        Jx.log.exception("Failed to copy TEXT to clipboard", ex);
                    }
                }
            }
            Mail.writeProfilerMark("BodyLinkFlyout._copySelectedLink", Mail.LogEvent.stop);
        },

        ensureFlyout: function (showCopyOption) {
            if (!this._flyout) {
                Mail.writeProfilerMark("BodyLinkFlyout.ensureFlyout", Mail.LogEvent.start);
                var flyoutDiv = this._flyoutDiv = document.createElement("div");
                Debug.assert(Jx.isHTMLElement(flyoutDiv));
                flyoutDiv.id = "ReadingPaneBodyLinkFlyout";
                var appRoot = this._appRoot = document.getElementById(Mail.CompApp.rootElementId);
                Debug.assert(Jx.isHTMLElement(appRoot));
                appRoot.appendChild(flyoutDiv);
                var commands = [];
                var res = Jx.res;
                if (showCopyOption) {
                    commands.push({ id: "ReadingPaneBodyLink.Copy", label: res.getString("mailReadingPaneBodyContextMenuCopy"), onclick: this._copySelectedElement.bind(this) });
                }
                commands.push({ id: "ReadingPaneBodyLink.CopyLink", label: res.getString("mailReadingPaneBodyContextMenuCopyLink"), onclick: this._copySelectedLink.bind(this) });
                this._flyout = new WinJS.UI.Menu(flyoutDiv, {
                    commands: commands, sticky: true
                });
                this._afterHideHook = new Mail.EventHook(this._flyout, "afterhide", this.dispose, this, true /*capture*/);
                Mail.writeProfilerMark("BodyLinkFlyout.ensureFlyout", Mail.LogEvent.stop);
            }
        },

        dispose: function () {
            Jx.dispose(this._afterHideHook);
            this._flyoutDiv.parentElement.removeChild(this._flyoutDiv);
            this._flyout = null;
            this._flyoutDiv = null;
            this._selectedElement = null;
        },

        onContextMenu: function (e) {
            /// <param name="e" type="Event"></param>
            Mail.writeProfilerMark("BodyLinkFlyout.onContextMenu", Mail.LogEvent.start);
            var linkTarget = e.target;
            while (!Jx.isNullOrUndefined(linkTarget) && linkTarget.nodeName !== "AREA" && linkTarget.nodeName !== "A") {
                linkTarget = linkTarget.parentNode;
            }

            if (Jx.isNullOrUndefined(linkTarget)) {
                return;
            }

            if (!Jx.isNonEmptyString(linkTarget.href)) {
                return;
            }
            this.ensureFlyout(Jx.isNonEmptyString(linkTarget.innerHTML));
            // Check to make sure we only override context menu behavior if nothing is selected.
            var frameWindow = linkTarget.ownerDocument.parentWindow;
            var selection = frameWindow.getSelection();

            if ((selection.rangeCount === 0) || (selection.getRangeAt(0).collapsed)) {
                // Select the entire link so the user knows what they are about to copy
                selection.removeAllRanges();
                var range = document.createRange();
                range.selectNodeContents(linkTarget);
                selection.addRange(range);
            }

            // Prevent the appbar from appearing
            e.stopPropagation();
            e.preventDefault();

            // Show the menu flyout, but then position it manually to the cursor instead of to the element
            // using body element as anchor in order to trigger winJS to format the menu in the desired fashion.
            this._flyout.show(this._appRoot, "top", "left");

            var iFrameElement = frameWindow.frameElement,
                flyoutLeft = e.clientX,
                flyoutTop = e.clientY;

            // This event is in relation to the iframe window, so need to adjust for iframe position if there is one
            if (iFrameElement) {
                var iFrameBoundingBox = iFrameElement.getBoundingClientRect();
                flyoutLeft = e.clientX + iFrameBoundingBox.left;
                flyoutTop = e.clientY + iFrameBoundingBox.top;
            }

            // Need to prevent menu from overlapping past the bottom or right side of the screen.
            var body = document.body,
                offsetWidth = body.offsetWidth,
                offsetHeight = body.offsetHeight;
            var flyoutDiv = this._flyoutDiv,
                flyoutOffsetWidth = flyoutDiv.offsetWidth,
                flyoutOffsetHeight = flyoutDiv.offsetHeight;
            
            if (flyoutLeft > (offsetWidth - flyoutOffsetWidth)) {
                flyoutLeft = offsetWidth - flyoutOffsetWidth - 10;
            }
            if (flyoutTop > (offsetHeight - flyoutOffsetHeight)) {
                flyoutTop = offsetHeight - flyoutOffsetHeight - 10;
            }

            var style = flyoutDiv.style;
            style.left = flyoutLeft.toString() + "px";
            style.top = flyoutTop.toString() + "px";

            // Set selected element for copying
            this._selectedElement = linkTarget;

            Mail.writeProfilerMark("BodyLinkFlyout.onContextMenu", Mail.LogEvent.stop);

        }
    };

});