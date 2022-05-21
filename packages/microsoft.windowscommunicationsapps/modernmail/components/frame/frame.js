
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*jshint browser:true */
/*global Mail,People,Jx,Debug,Chat,Microsoft,Windows*/

Jx.delayDefine(Mail, "CompFrame", function () {
    "use strict";

    Mail.CompFrame = function (platform, appState) {
        Mail.log("Frame_Ctor", Mail.LogEvent.start);
        Debug.assert(Jx.isInstanceOf(appState, Mail.AppState));
        this._name = "Mail.CompFrame";

        Mail.log("Frame_Ctor_InitComp", Mail.LogEvent.start);
        this.initComponent();

        Mail.log("Frame_Ctor_Children", Mail.LogEvent.start);

        var selection = this._selection = new Mail.Selection(platform, appState),
            guiState = Mail.guiState = new Mail.GUIState(selection),
            animator = this._animator = Mail.Globals.animator = new Mail.Animator(guiState),
            glomManager = this._glomManager = new Mail.GlomManager(selection, guiState),
            commandManager = Mail.Globals.commandManager = new Mail.Commands.Manager(this._glomManager, selection),
            appSettings = Mail.Globals.appSettings;

        this._platform = platform;
        var readingPaneSection = this._readingPaneSection = new Mail.ReadingPaneSection(selection, animator, glomManager),
            commandBar = this._commandBar = new Mail.CompCommandBar(commandManager),
            messageList = this._messageList = new Mail.CompMessageList(this, selection, commandBar, animator, appSettings),
            navPane = this._navPane = new Mail.NavPaneManager(this, selection, guiState, animator, platform, appSettings),
            welcomeMessage = this._welcomeMessage = new Mail.WelcomeMessage(this, selection, animator, appSettings, [ messageList, readingPaneSection ], commandManager);

        this.append(messageList, readingPaneSection, commandBar, navPane, welcomeMessage);

        Mail.Utilities.ComposeHelper.registerSelection(selection);

        var workerOwner = new Mail.WorkerOwner(selection);
        Debug.only(Debug.workerOwner = workerOwner);

        this._disposer = new Mail.Disposer(
            selection,
            workerOwner,
            Mail.UIDataModel.FolderCache,
            guiState,
            animator,
            glomManager,
            commandManager
        );

        this._frameElement = null;

        Mail.log("Frame_Ctor_Children", Mail.LogEvent.stop);
        Mail.log("Frame_Ctor", Mail.LogEvent.stop);
    };

    Mail.CompFrame.frameElementId = "mailFrame";

    Jx.augment(Mail.CompFrame, Jx.Component);

    Mail.CompFrame.prototype.getUI = function (ui) {
        /// <param name="ui" type="JxUI"></param>
        Mail.log("Frame_getUI", Mail.LogEvent.start);

        var navPaneUI = Jx.getUI(this._navPane),
            messageListUI = Jx.getUI(this._messageList),
            readingPaneSectionUI = Jx.getUI(this._readingPaneSection),
            commandBarUI = Jx.getUI(this._commandBar);

        ui.html =
            "<div id='" + Mail.CompFrame.frameElementId + "'>" +
                '<div id="fakePeekBar"></div>' +
                navPaneUI.html +
                messageListUI.html +
                readingPaneSectionUI.html +
            "</div>" +
            "<div id='mailFrameCommandBar'>" + commandBarUI.html + "</div>";

        Debug.assert(navPaneUI.css + messageListUI.css + readingPaneSectionUI.css + commandBarUI.css === "");

        Mail.log("Frame_getUI", Mail.LogEvent.stop);
    };

    Mail.CompFrame.prototype.onActivateUI = function () {
        var frameElement = this._frameElement = document.getElementById(Mail.CompFrame.frameElementId),
            appState = Mail.Globals.appState;
        this._disposer.addMany(
            new Mail.DragDrop(frameElement, this._selection, this._messageList),
            new Mail.SuspendResumeHelper(this._platform, appState),
            new Mail.EventHook(appState, "updateSelection", this._updateSelection, this),
            new Mail.EventHook(this._selection, "navChanged", this._onNavigation, this),
            Mail.EventHook.createEventManagerHook(this, People.DialogEvents.closed, this._onDialogClosed, this)
        );

        // The focus on startup needs to happen after the splash screen dismissal because calling
        // setActive on an invisible element throws JS exception and has no effect
        var appLaunchAnimationPromise = Mail.Promises.waitForEvent(this._animator, Mail.Animator.appLaunchAnimated).then(function () {
            if (appState.lastActivationType !== Windows.ApplicationModel.Activation.ActivationKind.protocol) {
                this._messageList.focus();
            }
        }.bind(this));

        this._disposer.add(new Mail.Disposable(appLaunchAnimationPromise, "cancel"));

        Mail.guiState.updateViewState();
    };

    Mail.CompFrame.prototype.onDeactivateUI = function () {
        Jx.dispose(this._disposer);
    };

    Mail.CompFrame.prototype.selectAccount = function (account, synchronous) {
        // Callback when an account is clicked in the account list
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));
        Debug.assert(Jx.isNullOrUndefined(synchronous) || Jx.isBoolean(synchronous));

        var mailAccount = new Mail.Account(account, this._platform);
        if (synchronous) {
            this._selection.updateNav(mailAccount);
        } else {
            this._selection.updateNavAsync(mailAccount);
        }
    };

    Mail.CompFrame.prototype.selectViewAsync = function (view) {
        // Callback when a view is clicked in the view switcher
        var selection = this._selection;
        selection.updateNavAsync(selection.account, view);
    };

    Mail.CompFrame.prototype._updateSelection = function (ev) {
        // Callback from appstate when we get a toast/tile secondary activation
        this._selection.updateNav(ev.account, ev.view, ev.message);
    };

    Mail.CompFrame.prototype._onNavigation = function (ev) {
        // Animate the change if something actually changed
        if (ev.accountChanged) {
            this._animator.animateSwitchAccount();
        } else if (ev.viewChanged) {
            this._animator.animateSwitchView();
        }
    };

    Mail.CompFrame.prototype._onDialogClosed = function () {
        Jx.safeSetActive(this._frameElement);
    };

    Mail.CompFrame.prototype._initializeMessageBar = function () {
        Mail.writeProfilerMark("CompFrame._initializeMessageBar", Mail.LogEvent.start);

        var messageBar = new Chat.MessageBar(5 /* z-index, above .mailFrameNavPaneBackground */, document.getElementById("appBody")),
            authMessageBarPresenter = new Chat.AuthMessageBarPresenter(),
            proxyAuthenticator = new Chat.ProxyAuthenticator(),
            accountAuthPresenter = new Mail.DefaultAccountAuthPresenter(),
            syncMessageBarHelper = new Mail.SyncMessageBarHelper(),
            outboxMonitor = new Mail.OutboxMonitor(),
            oofPresenter = new Mail.SelectedAccountOofPresenter(),
            rulesPresenter = new Mail.RulesMessageBarPresenter(),
            isLiveDemo = Jx.appData.localSettings().get("LiveDemoMode") || false;

        this._disposer.add(oofPresenter);
        var selection = this._selection;
        oofPresenter.init(messageBar, selection, "mailMessageBar");

        var platform = this._platform;
        if (!isLiveDemo) {
            this._disposer.addMany(outboxMonitor, accountAuthPresenter, syncMessageBarHelper, rulesPresenter,
                new Mail.Disposable(authMessageBarPresenter, "shutdown"),
                new Mail.Disposable(proxyAuthenticator, "shutdown"),
                new Mail.AccountSyncStatus(messageBar, selection, platform)
            );

            authMessageBarPresenter.init(messageBar, platform, "mailMessageBar", true);
            proxyAuthenticator.init(platform, Microsoft.WindowsLive.Platform.ApplicationScenario.mail);
            accountAuthPresenter.init(messageBar, platform, "mailMessageBar");
            syncMessageBarHelper.init(messageBar, "mailMessageBar");
            outboxMonitor.init(messageBar, platform, new Mail.GenericQueueHandler(selection, platform));
            rulesPresenter.init(messageBar, platform, "mailMessageBar");
        }

        Mail.writeProfilerMark("CompFrame._initializeMessageBar", Mail.LogEvent.stop);
    };

    Mail.CompFrame.prototype.postStartupWork = function () {
        this._postStartupQueue = new Jx.ScheduledQueue(null,
            Mail.Priority.framePostStartupWork,
            "CompFrame.postStartupWork", [
                function () { this._commandBar.register(); },
                this._initializeMessageBar
            ],
            this
        );
    };

    Mail.CompFrame.prototype.hostComponent = function (component) {
        Debug.assert(Jx.isObject(component));

        this.appendChild(component);

        var html = Jx.getUI(component).html;
        if (html) {
            this._frameElement.insertAdjacentHTML("beforeEnd", html);
        }
        component.activateUI();
    };

});

