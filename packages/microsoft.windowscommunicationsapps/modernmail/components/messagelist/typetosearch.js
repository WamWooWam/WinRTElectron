
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,WinJS*/

Jx.delayDefine(Mail, "TypeToSearch", function () {
    "use strict";

    Mail.TypeToSearch = function (searchBox, host) {
        Debug.assert(Jx.isInstanceOf(searchBox, WinJS.UI.SearchBox));
        Debug.assert(Jx.isHTMLElement(host));

        this._box = searchBox;
        this._listener = this._focusChanged.bind(this);
        this._host = host;

        this._eventHooks = new Mail.Disposer(
            new Mail.EventHook(window, "focusin", this._listener, this, false),
            new Mail.EventHook(searchBox, "receivingfocusonkeyboardinput", this._onTypeToSearch, this, false));

        // Since creation of this componenent is deferred focus may have already changed. This will
        // handle setting the initial value of showOnKeyboardInput
        this._focusChanged({ target: document.activeElement });
    };
    var proto = Mail.TypeToSearch.prototype;
    Jx.augment(Mail.TypeToSearch, Jx.Events);

    Debug.Events.define(proto, "typetosearch");

    proto.dispose = function () {
        Jx.dispose(this._eventHooks);
        this._box.focusOnKeyboardInput = false;
    };

    proto._onTypeToSearch = function () {
        if (this._isTypeToSearchEnabled(document.activeElement)) {
            this.raiseEvent("typetosearch");
        }
    };

    proto._focusChanged = function (/*@dynamic*/ev) {
        ///<summary>Disable type-to-search when focus changes to something outside the mail app to a dialog, flyout, etc. This prevents
        ///us from inadvertantly transferring focus to the search box when we're in some other input control.</summary>
        this._box.focusOnKeyboardInput = this._isTypeToSearchEnabled(ev.target);
    };

    proto._isTypeToSearchEnabled = function (target) {
        var ComposeHelper = Mail.Utilities.ComposeHelper,
            guiState = Mail.guiState;

        if ((guiState.isReadingPaneVisible) && (ComposeHelper.isComposeLaunching || ComposeHelper.isComposeShowing)) {
            // Disable type to search if compose is up and the reading pane is visible
            return false;
        }

        if (!target) {
            return !this._host.disabled;
        }

        if (Mail.isElementEditable(target)) {
            return false;
        }

        // Checking isTargetEditable is not enough because some editable elements are hosted in an iframe which belongs to the web context.
        // In those cases, tagName would be IFRAME but we don't have the permission to inspect the activeElement of the contentDocument of that iframe
        if (!this._host.disabled && (target === document.body || target === document.documentElement)) {
            return true;
        }

        if (Mail.isElementOrDescendant(target, this._host)) {
            return true;
        }

        if (Mail.isElementOrDescendant(target, document.getElementById(Mail.CompCommandBar.appBarElementId))) {
            return true;
        }
        return false;
    };
});
