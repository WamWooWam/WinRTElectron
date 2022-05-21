
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,People*/

Jx.delayDefine(Mail, "NavPaneManager", function () {
    "use strict";

    Mail.NavPaneManager = /* @constructor*/function (host, selection, guiState, animator, platform, appSettings) {
        Debug.assert(Jx.isObject(guiState));
        Mail.log("NavPane_Ctor", Mail.LogEvent.start);

        this.initComponent();

        this._host = host;
        this._selection = selection;
        this._guiState = guiState;
        this._animator = animator;
        this._platform = platform;
        this._appSettings = appSettings;

        this._createFlyout = this._createFlyout.bind(this);
        this._viewSwitcher = new Mail.ViewSwitcher(platform, this, selection, appSettings, this._createFlyout);
        this._accountSwitcher = new Mail.AccountSwitcher(platform, host, selection, Jx.scheduler, this._createFlyout);
        this._header = new Mail.AccountNameHeader(selection);
        this.append(this._accountSwitcher, this._viewSwitcher, this._header);

        this._hooks = null;
        this._viewSwitcherElement = null;

        Mail.log("NavPane_Ctor", Mail.LogEvent.stop);
    };
    Jx.augment(Mail.NavPaneManager, Jx.Component);
    Jx.augment(Mail.NavPaneManager, Jx.Events);
    var prototype = Mail.NavPaneManager.prototype;
    Debug.Events.define(prototype, "widthChanged");

    prototype.deactivateUI = function () {
        this.detach(People.DialogEvents.opened, Mail.AccountSettings.onDialogOpened);
        this.detach(People.DialogEvents.closed, Mail.AccountSettings.onDialogClosed);
        Jx.dispose(this._hooks);
        Jx.Component.deactivateUI.call(this);
    };

    prototype.getUI = function (ui) {
        /// <param name="ui" type="JxUI"></param>
        ui.html =
        "<div id='" + this._id + "' class='mailFrameNavPaneBackground'>" +
            "<div class='mailNavPane'>" +
                "<div id='mailNavPaneHeaderArea'>" +
                    Jx.getUI(this._header).html +
                "</div>" +
                "<div class='viewSwitcher'>" +
                    Jx.getUI(this._viewSwitcher).html +
                "</div>" +
                Jx.getUI(this._accountSwitcher).html +
            "</div>" +
        "</div>";
    };

    prototype.activateUI = function () {
        Mail.log("NavPane_activateUI", Mail.LogEvent.start);
        Jx.Component.prototype.activateUI.call(this);

        var rootElement = document.getElementById(this._id),
            navPaneElement = rootElement.querySelector(".mailNavPane"),
            headerElement = navPaneElement.querySelector("#mailNavPaneHeaderArea"),
            viewSwitcherElement = this._viewSwitcherElement = navPaneElement.querySelector(".viewSwitcher");
        this._animator.setNavPaneElements(rootElement, navPaneElement, headerElement, viewSwitcherElement);

        var guiState = this._guiState;
        this._hooks = new Mail.Disposer(
            new Mail.EventHook(guiState, "viewStateChanged", this._viewStateChanged, this),
            new Mail.EventHook(this._selection, "navChanged", this._onNavigation, this)
        );

        this.on(People.DialogEvents.opened, Mail.AccountSettings.onDialogOpened);
        this.on(People.DialogEvents.closed, Mail.AccountSettings.onDialogClosed);
        Mail.log("NavPane_activateUI", Mail.LogEvent.stop);
    };

    prototype._createFlyout = function (content, type) {
        ///<summary>Creates a flyout next to the nav pane with the specified content</summary>
        ///<param name="content" type="Jx.Component"/>
        ///<param name="type" type="String">One of the types defined in NavPaneFlyout.js</param>
        Debug.assert(Jx.isObject(content), "Invalid parameter: content");

        var flyout = new Mail.NavPaneFlyout(this, content, type);
        this._host.hostComponent(flyout);
        return flyout;
    };

    Object.defineProperty(prototype, "isWide", { get: function () {
        return this._guiState.isNavPaneWide;
    } });

    Object.defineProperty(prototype, "windowWidth", { get: function () {
        return this._guiState.width;
    } });

    prototype._viewStateChanged = function () {
        this.raiseEvent("widthChanged");
    };

    prototype.selectAccount = function (account, synchronous) {
        // Bubble out account clicks to the frame
        this._host.selectAccount(account, synchronous);
    };

    prototype.selectViewAsync = function (view) {
        // Bubble out view clicks to the frame
        this._host.selectViewAsync(view);
    };

    function disposeComponent(owner, child) {
        if (child) {
            owner.removeChild(child);
            child.deactivateUI();
            child.shutdownComponent();
        }
    }

    function activateComponent(owner, child, container) {
        owner.appendChild(child);
        child.initUI(container);
    }

    prototype._onNavigation = function (ev) {
        if (ev.accountChanged) {
            // Create a new view switcher
            disposeComponent(this, this._viewSwitcher);
            var viewSwitcher = this._viewSwitcher = new Mail.ViewSwitcher(this._platform, this, this._selection, this._appSettings, this._createFlyout);
            activateComponent(this, viewSwitcher, this._viewSwitcherElement);
        }
    };
});

