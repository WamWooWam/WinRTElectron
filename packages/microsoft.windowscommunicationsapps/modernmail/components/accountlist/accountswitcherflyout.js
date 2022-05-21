
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*jshint browser:true */
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "AccountSwitcherFlyout", function () {
    "use strict";

    var Flyout = Mail.AccountSwitcherFlyout = function (switcher, createFlyout) {
        ///<summary>The account switcher flyout is used when the app is in skinny mode. The content of the flyout is the 
        /// same List control that is hosted in account switcher in wide mode. When the flyout is about to show, the content
        /// is being added to the flyout by detaching the List from AccountSwitcher and attaching to the flyout. The opposite 
        /// happens when the flyout is dismissed. The list is detached from flyout and re-attached to AccountSwitcher.</summary>
        _markStart("ctor");
        Debug.assert(Jx.isFunction(createFlyout));

        this.initComponent();
        this._switcher = switcher;
        this._createFlyout = createFlyout;

        this._content = null;
        this._flyout = null;

        _markStop("ctor");
    };
    Jx.augment(Flyout, Jx.Component);
    var prototype = Flyout.prototype;

    prototype.dispose = function () {
        Jx.dispose(this._flyout);
    };

    prototype.getUI = function (ui) {
        ui.html = "<div id='" + this._id + "' class='accountSwitcherFlyout'>" +
                      "<div class='inhibitTouchHover'></div>" +
                  "</div>";
    };

    prototype.activateUI = function () {
        this._hooks = new Mail.Disposer(
            new Jx.PressEffect(document.querySelector(".accountSwitcherFlyout"), ".accountItem", [ "className" ], ".inhibitTouchHover")
        );
    };
    
    prototype.deactivateUI = function () {
        Jx.dispose(this._hooks);
    };

    prototype._attachContent = function () {
        _markStart("attachContent");

        var content = this._content = this._switcher.detachList();
        Debug.assert(content.control);
        Debug.assert(content.control.hasUI());
        Debug.assert(Jx.isHTMLElement(content.element));

        this.appendChild(content.control);
        document.getElementById(this._id).appendChild(content.element);

        _markStop("attachContent");
    };
    
    prototype._detachContent = function () {
        _markStart("detachContent");

        this.removeChild(this._content.control);
        this._switcher.attachList(this._content);

        _markStop("detachContent");
    };

    prototype.show = function (entryPoint, viaKeyboard) {
        ///<summary>Called by external code to invoke the flyout</summary>
        Debug.assert(Jx.isHTMLElement(entryPoint));
        Debug.assert(Jx.isBoolean(viaKeyboard));

        _markStart("show");
        var flyout = this._flyout;
        if (!flyout) {
            flyout = this._flyout = this._createFlyout(this, "accounts");
            flyout.setEntryPoint(entryPoint);
        }
        flyout.show({ viaKeyboard: viaKeyboard });
        _markStop("show");
    };


    prototype.hide = function () {
        ///<summary>Called by external code to manually dismiss the flyout.  This is not called on light dismiss.</summary>
        var flyout = this._flyout;
        if (flyout) {
            flyout.hide();
        }
    };

    prototype.beforeShow = function () {
        ///<summary>Called by the flyout when it is about to be shown</summary>
        this._attachContent();
        this._switcher.flyoutBeforeShow();
    };

    prototype.afterHide = function () {
        ///<summary>Called by the flyout when it is about to be hidden, either as a result of a call to hide or light dismiss</summary>
        this._detachContent();
        this._switcher.flyoutDismissed();
    };

    function _markStart(str) {
        Jx.mark("Mail.AccountSwitcherFlyout." + str + ",StartTA,Mail");
    }
    function _markStop(str) {
        Jx.mark("Mail.AccountSwitcherFlyout." + str + ",StopTA,Mail");
    }
});

