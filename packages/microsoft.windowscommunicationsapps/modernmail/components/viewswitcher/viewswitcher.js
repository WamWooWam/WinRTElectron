
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*jshint browser:true */
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "ViewSwitcher", function () {
    "use strict";

    var MailView = Mail.UIDataModel.MailView;

    var ViewSwitcher = Mail.ViewSwitcher = function (platform, host, selection, appSettings, flyoutFactory) {
        _markStart("ctor");
        Debug.assert(Jx.isObject(host));
        Debug.assert(Jx.isObject(selection));
        Debug.assert(Jx.isObject(appSettings));
        Debug.assert(Jx.isFunction(flyoutFactory));

        this.initComponent();

        this._host = host;
        this._selection = selection;

        var account = selection.account,
            view = selection.view,
            settings = appSettings.getLocalAccountSettings(selection.account);
        this._accountViews = new Mail.AccountViews(account, this, settings, flyoutFactory);
        this.appendChild(this._accountViews);
        this._hooks = new Mail.Disposer(new Mail.EventHook(selection, "navChanged", this._onNavigation, this));

        this._onViewSelected(view);
        _markStop("ctor");
    };
    Jx.augment(ViewSwitcher, Jx.Component);
    var prototype = ViewSwitcher.prototype;

    prototype.shutdownComponent = function () {
        Jx.dispose(this._hooks);
        Jx.Component.prototype.shutdownComponent.call(this);
    };

    prototype.getUI = function (ui) {
        _markStart("getUI");
        Debug.assert(this._accountViews);
        ui.html = Jx.getUI(this._accountViews).html;
        _markStop("getUI");
    };

    prototype.activateUI = function () {
        _markStart("activateUI");
        Jx.Component.prototype.activateUI.call(this);
        _markStop("activateUI");
    };

    prototype.selectViewAsync = function (view) {
        _markStart("selectViewAsync");
        Debug.assert(Jx.isInstanceOf(view, MailView));
        this._host.selectViewAsync(view);
        _markStop("selectViewAsync");
    };

    prototype._selectDefaultView = function () {
        _markStart("selectDefaultView");
        var defaultView = this._selection.account.inboxView;
        if (defaultView) {
            this.selectViewAsync(defaultView);
        }
        _markStop("selectDefaultView");
    };

    prototype._onNavigation = function (ev) {
        this._onViewSelected(ev.target.view);
    };

    prototype._onViewSelected = function (view) {
        this._accountViews.onViewSelected(view);
        this._deleteListener = this._hooks.replace(this._deleteListener,
            new Mail.EventHook(view, "deleted", this._onSelectedViewDeleted, this));
        this._changedListener = this._hooks.replace(this._changedListener,
            new Mail.EventHook(view, "changed", this._onSelectedViewChanged, this));
    };

    prototype._onSelectedViewDeleted = function () {
        this._selectDefaultView();
    };

    prototype._onSelectedViewChanged = function (ev) {
        // Switch to the default view if the selected view is disabled or moved under deleted items
        var view = ev.target, source = view.sourceObject;
        if ((Mail.Validators.hasPropertyChanged(ev, "isEnabled") && !view.isEnabled) ||
            (Mail.Validators.hasPropertyChanged(ev, "parentFolder") && source && source.underDeletedItems)) {
            this._selectDefaultView();
        }
    };

    prototype.getFlyout = function (name) {
        return this._accountViews.getFlyout(name);
    };

    Object.defineProperty(prototype, "isWide", { get: function () {
        return this._host.isWide;
    } });

    prototype.addListener = function (ev, fn, target) {
        return this._host.addListener(ev, fn, target);
    };

    prototype.removeListener = function (ev, fn, target) {
        return this._host.removeListener(ev, fn, target);
    };

    function _markStart(str) {
        Jx.mark("Mail.ViewSwitcher." + str + ",StartTA,Mail");
    }
    function _markStop(str) {
        Jx.mark("Mail.ViewSwitcher." + str + ",StopTA,Mail");
    }

});
