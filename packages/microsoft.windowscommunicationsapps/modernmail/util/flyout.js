
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Mail,Debug,WinJS*/
/*jshint browser:true*/

Jx.delayDefine(Mail, ["Flyout", "FlyoutContent"], function () {
    "use strict";

    // Wrapper to enable hosting a Jx.Component inside a WinJS.UI.Flyout. Also fixes the show/hide
    // methods to return promises like similiar WinJS classes.
    var Flyout = Mail.Flyout = function (container, content, options) {
        Debug.assert(Jx.isHTMLElement(container));
        Debug.assert(Jx.isObject(content));
        Debug.assert(Jx.isObject(options));
        Debug.assert(Jx.isNonEmptyString(options.anchor) || Jx.isHTMLElement(options.anchor));

        this._content = content;
        this._options = options;
        var host = this._host = document.createElement("div");
        host.className = options.className || "";
        this._flyout = this._createFlyout(host, options);
        this._afterHide = null;

        container.appendChild(host);
        content.setFlyout(this);
    };

    Flyout.prototype.dispose = function () {
        this.hide().then(function () {
            this._content.setFlyout(null);
            this._flyout.dispose();
            this._host.removeNode(true);
            this._host = null;
        }.bind(this));
    };

    Flyout.prototype.show = function (placement, alignment) {
        Debug.assert(this._afterHide === null, "flyout already shown");

        var host = this._host,
            flyout = this._flyout,
            content = this._content,
            options = this._options;

        // Add the component to the DOM before showing the flyout
        content.initUI(host);

        // Shutdown the content when the flyout is hidden
        var cleanup = function () {
            this._afterHide = null;

            // Enables fire-and-forget flyouts with proper cleanup
            if (options.singleShow) {
                this.dispose();
            }
        }.bind(this);

        this._afterHide = Mail.Promises.waitForEvent(flyout, "afterhide")
            .then(function () { content.shutdownUI(); })
            .then(cleanup, cleanup);

        // Flyouts should return promises from show()
        var afterShow = Mail.Promises.waitForEvent(flyout, "aftershow");
        flyout.show(options.anchor, placement, alignment);
        return afterShow;
    };

    Flyout.prototype.hide = function () {
        var afterHide = this._afterHide;
        if (afterHide) {
            this._afterHide = null;
            this._flyout.hide();
        }
        return afterHide || WinJS.Promise.as();
    };

    Flyout.prototype.replace = function (content) {
        var container = this._host.parentElement,
            options = this._options;

        return this.hide().then(function () {
            if (!options.singleShow) {
                this.dispose();
            }
            return new Flyout(container, content, options).show();
        }.bind(this));
    };

    Flyout.prototype._createFlyout = function (host, options) {
        host.classList.add("mailFlyout");
        return new WinJS.UI.Flyout(host, options);
    };


    var FlyoutContent = Mail.FlyoutContent = function () {
        this.initComponent();
        this._flyout = null;
    };
    Jx.inherit(FlyoutContent, Jx.Component);

    FlyoutContent.prototype.setFlyout = function (flyout) {
        this._flyout = flyout;
    };

});

