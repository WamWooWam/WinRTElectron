
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug,WinJS */
/*jshint browser:true*/

Jx.delayDefine(Mail, "ViewFlyout", function () {
    "use strict";

    var contentFactories = {
        "folders": function (switcher, account, jobSet) { return new Mail.FolderFlyout(switcher, account, jobSet); },
        "people": function (switcher, account, jobSet) { return new Mail.PeopleFlyout(switcher, account, jobSet); }
    };

    var Flyout = Mail.ViewFlyout = function (switcher, account, type, createFlyout) {
        _markStart("ctor");
        Debug.assert(Jx.isObject(switcher));
        Debug.assert(Jx.isInstanceOf(account, Mail.Account));
        Debug.assert(Jx.isNonEmptyString(type));
        Debug.assert(Jx.isFunction(createFlyout));
        Debug.assert(Jx.isFunction(contentFactories[type]));

        this.initComponent();
        this._switcher = switcher;
        this._account = account;
        this._createFlyout = createFlyout;
        this._type = type;

        this._content = null;
        this._flyout = null;
        this._element = null;

        this._jobSet = Jx.scheduler.createJobSet();
        this._jobSet.visible = false;
        Jx.scheduler.addJob(this._jobSet, Mail.Priority.viewFlyout, null, this._ensureFlyout, this);
        _markStop("ctor");
    };
    Jx.augment(Flyout, Jx.Component);
    Jx.augment(Flyout, Jx.Events);
    var prototype = Flyout.prototype;

    Debug.Events.define(prototype, "beforeShow", "afterHide");

    prototype.dispose = function () {
        this._jobSet.cancelJobs();
        Jx.scheduler.addJob(null, Mail.Priority.viewFlyout, null, this._lazyDispose, this);
    };

    prototype._lazyDispose = function () {
        Jx.dispose(this._flyout);
        Jx.dispose(this._jobSet);
    };

    prototype._ensureFlyout = function () {
        ///<summary>This method may be called asynchronously to pre-create the flyout, or synchronously when the user invokes it.  It creates the light-dismiss flyout, but not its content.
        ///Creating the flyout will result in getUI/activateUI being called, which signal the entry of this component into the HTML tree.</summary>
        if (!this._flyout) {
            _markStart("ensureFlyout");
            this._flyout = this._createFlyout(this, this._type);
            Jx.scheduler.addJob(this._jobSet, Mail.Priority.viewFlyout, null, this._ensureContent, this);
            _markStop("ensureFlyout");
        }
    };

    prototype.getUI = function (ui) {
        ui.html = "<div id='" + this._id + "' class='viewFlyoutContainer'></div>";
    };

    prototype.activateUI = function () {
        this._element = document.getElementById(this._id);
        Debug.assert(this._element);

        Jx.Component.prototype.activateUI.call(this);
    };

    prototype._ensureContent = function () {
        ///<summary>This can be called asynchronously to pre-populate the flyout content, or synchronously when the user invokes the flyout.</summary>
        Debug.assert(this._flyout);
        Debug.assert(this._element);

        if (!this._content) {
            _markStart("ensureContent");
            _markStart("ensureContent:create");
            var content = this._content = contentFactories[this._type](this._switcher, this._account, this._jobSet, this);
            this.appendChild(content);
            _markStop("ensureContent:create");

            _markStart("ensureContent:getUI");
            var html = Jx.getUI(content).html;
            _markStop("ensureContent:getUI");

            _markStart("ensureContent:innerHTML");
            this._element.innerHTML = html;
            _markStop("ensureContent:innerHTML");

            _markStart("ensureContent:activateUI");
            content.activateUI();
            _markStop("ensureContent:activateUI");
            _markStop("ensureContent");
        }
    };

    prototype.show = function (options) {
        ///<summary>Called by external code to invoke the flyout</summary>
        _markStart("show");
        this._ensureFlyout();
        this._ensureContent();
        var result = this._flyout.show(options);
        _markStop("show");
        return result;
    };

    prototype.hide = function () {
        ///<summary>Called by external code to manually dismiss the flyout.  This is not called on light dismiss.</summary>
        var flyout = this._flyout;
        if (flyout) {
            return flyout.hide();
        }
        return WinJS.Promise.as();
    };

    prototype.setEntryPoint = function (element) {
        var flyout = this._flyout;
        if (flyout) {
            flyout.setEntryPoint(element);
        }
    };

    Object.defineProperty(prototype, "isVisible", { get: function () {
        var flyout = this._flyout;
        return flyout && flyout.isVisible;
    } });

    prototype.beforeShow = function () {
        ///<summary>Called by the flyout when it is about to be shown</summary>
        this._jobSet.visible = true;
        this._content.beforeShow();
        this.raiseEvent("beforeShow", { target: this });
    };

    prototype.afterHide = function () {
        ///<summary>Called by the flyout when it is about to be hidden, either as a result of a call to hide or light dismiss</summary>
        this._jobSet.visible = false;
        this._content.afterHide();
        this.raiseEvent("afterHide", { target: this });
    };

    Debug.call(function () {
        Flyout.addTestContentFactory = function (type, fn) {
            contentFactories[type] = fn;
        };
    });

    function _markStart(str) {
        Jx.mark("Mail.ViewFlyout." + str + ",StartTA,Mail");
    }
    function _markStop(str) {
        Jx.mark("Mail.ViewFlyout." + str + ",StopTA,Mail");
    }
});

