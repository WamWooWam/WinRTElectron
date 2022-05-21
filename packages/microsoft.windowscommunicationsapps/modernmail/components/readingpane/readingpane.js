
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx,Mail,Debug,Microsoft,MSApp*/

Jx.delayDefine(Mail, "CompReadingPane", function () {
    "use strict";

    var Pane = Mail.CompReadingPane = function (rootId, selection, glomManager, animator) {
        Debug.assert(Jx.isObject(selection));

        _markStart("Ctor");
        this._name = "Mail.CompReadingPane";
        _markStart("Ctor_InitComp");
        this.initComponent();
        _markStop("Ctor_InitComp");

        this._disposer = new Mail.Disposer();
        this._selection = selection;
        this._glomManager = glomManager;

        this._header = new Mail.ReadingPaneHeader(selection);
        this._imageDownloadStatus = new Mail.ImageDownloadStatus();
        this._subjectArea = new Mail.ReadingPaneSubjectArea(selection);
        this._warning = new Mail.ReadingPaneWarning();
        this._body = new Mail.ReadingPaneBody(rootId, this, animator, this._imageDownloadStatus);
        this._attachmentWell = new Mail.ReadingPaneAttachmentWell(rootId, this);
        this._calendarNotification = new Mail.ReadingPaneCalendarNotificationArea(rootId);
        this._truncate = new Mail.ReadingPaneTruncationControl(rootId, this, this._body);

        this._disposer.addMany(this._attachmentWell, this._calendarNotification, this._truncate);

        this._rootElement = null;
        this._canvasCommandBar = null;

        this._inviteArea = null;

        this._message = null;
        this._showPaneOnSelection = false;

        this._printHandler = null;

        this._rootElementId = rootId;

        MSApp.suppressSubdownloadCredentialPrompts(true);

        _markStop("Ctor");
    };

    Jx.augment(Pane, Jx.Component);

    Pane.rootContentElementSelector = ".mailReadingPaneContent";

    Pane.prototype.deactivateUI = function () {
        this._attachmentWell.clear();
        Jx.Component.deactivateUI.call(this);

        if (this._printHandler) {
            this._printHandler.deactivate();
            this._printHandler = null;
        }

        this._header.dispose();
        this._header = null;

        this._imageDownloadStatus.dispose();
        this._imageDownloadStatus = null;

        this._subjectArea.dispose();
        this._subjectArea = null;

        this._warning.dispose();
        this._warning = null;

        if (Jx.isObject(this._inviteArea)) {
            this._inviteArea.shutdown();
            this._inviteArea = null;
        }

        this._truncate.clearProgressRingTimer();

        this._body.deactivateUI();
        this._body = null;

        Jx.dispose(this._canvasCommandBar);
        this._canvasCommandBar = null;

        this._disposer.dispose();

        this._message = null;
    };

    Pane.prototype.getUI = function (ui) {
        ui.html = Mail.Templates.readingPane();
    };

    Pane.prototype.activateUI = function () {
        _markStart("activateUI");

        var rootElement = this._rootElement = document.getElementById(this._rootElementId);

        Jx.scheduler.addJob(null,
            Mail.Priority.readingPaneCommandBar,
            "ReadingPane.activateUI - create canvas command bar",
            function () {
                var commands = {
                    back: ".mailReadingPaneBackButton",
                    deleteMessage: ".mailReadingPaneDeleteButton",
                    respond: ".mailReadingPaneRespondButton",
                    compose: ".mailReadingPaneComposeButton",
                    edit: ".mailReadingPaneEditButton"
                };

                this._canvasCommandBar = new Mail.CompCanvasCommandBar(rootElement, commands);
                Mail.Globals.commandManager.registerCommandHost(/*@static_cast(Mail.Commands.Host)*/this._canvasCommandBar);
            },
            this
        );

        // safeHTML does not allow iframes, insert them here
        this._insertIframes(rootElement);

        Jx.scheduler.addJob(null,
            Mail.Priority.registerPrintHandler,
            "ReadingPane - create print handler",
            function () {
                this._printHandler = new Mail.PrintHandler();
                this._printHandler.activate();
                this._printHandler.setRootElement(rootElement);
            },
            this
        );

        this._body.activateUI();

        this._header.initialize(rootElement.querySelector(".mailReadingPaneHeaderArea"));

        this._imageDownloadStatus.initialize(rootElement.querySelector(".mailReadingPaneImageDownloadStatusArea"));

        this._subjectArea.initialize(rootElement.querySelector(".mailReadingPaneSubjectArea"));

        this._warning.initialize(rootElement.querySelector(".mailReadingPaneWarning"));

        this._inviteArea = new Mail.CalendarInviteArea(this._selection);
        this._inviteArea.initialize(rootElement.querySelector(".mailReadingPaneInviteArea"), [window, rootElement.querySelector(Mail.ReadingPaneBody._Selectors.bodyFrameElementSelector).contentDocument]);

        this._hideOldContent();

        Jx.Component.prototype.activateUI.call(this);

        this._truncate.activateUI();

        this._disposer.add(new Mail.EventHook(Mail.guiState, "layoutChanged", this._onLayoutChanged, this));

        var editButton = rootElement.querySelector(".mailDraftEditButton");
        this._disposer.add(new Mail.EventHook(editButton, "click", this._editClicked, this));

        _markStop("activateUI");
    };

    Pane.prototype._insertIframes = function (rootElement) {
        var iframe = document.createElement("iframe");
        iframe.className = "mailReadingPaneBodyFrame";
        iframe.ariaLive = "off";
        Mail.setAttribute(iframe, "data-win-res", "aria-label:mailReadingPaneMessageBodyAriaLabel");
        Mail.setAttribute(iframe, "role", "document");
        iframe.sandbox = "allow-same-origin allow-top-navigation";
        iframe.tabindex = 0;
        iframe.src = "about:blank";
        rootElement.querySelector(".mailReadingPaneScrollPreserver").appendChild(iframe);
    };

    // This method shows hides the reading pane entirely.
    // Used by secondary reading panes (such as eml attachments) to show and hide the entire pane, not just the content.
    // this includes the header information like to, from, subject, timestamp, the attachment well, and the email body.
    // this ALSO INCLUDES the on canvas buttons at the top of the reading pane.
    Pane.prototype.showPane = function (show) {
        /// <param name="show" type="Boolean">Show/hide this Pane</param>
        var currentMessage = this._message;
        var selectionMessage = this._selection.message;
        if (show && !Mail.Validators.areEqual(currentMessage, selectionMessage)) {
            _markInfo("Delaying show of reading pane for selection. Current:" + (currentMessage ? currentMessage.objectId : "null") + " pending Selection:" + (selectionMessage ? selectionMessage.objectId : "null") );
            this._showPaneOnSelection = true;
            show = false;
        } else if (this._showPaneOnSelection) {
            _markInfo("Clearing showPaneOnSelection flag");
            this._showPaneOnSelection = false;
        }

        _markInfo(show ? "Showing rootElement" : "Hiding rootElement");
        Jx.setClass(this._rootElement, "invisible", !show);
        if (show && this._printHandler) {
            this._printHandler.setRootElement(this._rootElement);
        }
    };

    Pane.prototype.refreshUI = function () {
        _markStart("refreshUI");
        this._truncate.clearProgressRingTimer();

        this._header.setMessage(this._message);
        this._subjectArea.setMessage(this._message);

        if (Mail.GlomManager.messageOpenInAnotherWindow(this._message) && this._message.isDraft) {
            this._rootElement.querySelector(".mailReadingPaneDraftMessage").classList.remove("hidden");
        } else {
            this._warning.setMessage(this._message);
            this._attachmentWell.setMessage(this._message);
            this._calendarNotification.setMessage(this._message);

            Jx.EventManager.fireDirect(null, "readingPaneHeaderLoaded");

            if (this._truncate.canShowBody()) {
                this._body.update(this._message);
            }

            this._inviteArea.setMessage(this._message);
        }

        if (this._printHandler) {
            this._printHandler.checkPrintViability();
        }
        _markStop("refreshUI");
    };

    Pane.prototype._hideOldContent = function () {
        _markStart("HideOldContent");
        var controls = this._rootElement.querySelector(Pane.rootContentElementSelector).querySelectorAll(".hideOnReload");
        for (var i = 0, max = controls.length; i < max; i++) {
            Jx.addClass(controls[i], "hidden");
        }
        this._body.clearMessage();
        _markStop("HideOldContent");
    };

    Pane.prototype.onNewSelectedMessageSynchronous = function (newMessage, forceReload) {
        /// <param name="newMessage" type="Mail.UIDataModel.MailMessage" optional="true"/>
        /// <param name="forceReload" type="Boolean" optional="true"/>
        Debug.assert((newMessage === null) || Jx.isInstanceOf(newMessage, Mail.UIDataModel.MailMessage));

        _markStart("onNewSelectedMessage");

        if (this._showPaneOnSelection) {
            _markInfo("Showing Pane on selection");
            this.showPane(true);
        }

        if (!forceReload && Mail.Validators.areEqual(this._message, newMessage)) {
            _markInfo("returning early because we're already displaying this message");
            _markStop("onNewSelectedMessage");
            return;
        }

        this._truncate.clearProgressRingTimer();

        _markInfo("Changing rendered messsage from " + (this._message ? this._message.objectId : "null") + " to " + (newMessage ? newMessage.objectId : "null") );
        this._message = newMessage;

        this._hideOldContent();

        this._truncate.setMessage(this._message);

        if (Jx.isObject(this._message)) {
            _markStart("SetValidMessage");
            Debug.assert(!this._message.pendingRemoval);

            this._message.recordAction(Microsoft.WindowsLive.Platform.FolderAction.messageViewed);

            this.refreshUI();

            if (Mail.guiState.isThreePane) {
                this.markAsRead();
            }

            _markStop("SetValidMessage");
        } else {
            this._inviteArea.setMessage(null);
            this._header.setMessage(null);
            this._subjectArea.setMessage(null);
            this._warning.setMessage(null);
            this._attachmentWell.setMessage(null);
            this._calendarNotification.setMessage(null);
            Mail.guiState.ensureNavMessageList();
        }

        Jx.EventManager.fireDirect(null, "readingPaneBodyLoaded");

        _markStop("onNewSelectedMessage");
    };

    Mail.CompReadingPane.prototype._getDocHidden = function () {
        // Hook for UT validation of markAsRead
        return document.hidden;
    };

    Mail.CompReadingPane.prototype.markAsRead = function () {
        var message = this._message;
        if (Mail.GlomManager.isParent() && message) {
            // Only mark as read automatically in the parent window & in one pane.
            _markStart("onMarkAsRead");
            Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
            if (Mail.Globals.appSettings.autoMarkAsRead && message.canMarkRead && !message.read && !this._getDocHidden()) {
                var Instr = Mail.Instrumentation;
                Instr.instrumentTriageCommand(Instr.Commands.markAsRead, Instr.UIEntryPoint.automatic, this._selection);
                this._selection.setReadState(true, [message]);
            }
            _markStop("onMarkAsRead");
        }
    };

    Mail.CompReadingPane.prototype._onLayoutChanged = function () {
        if (Mail.guiState.isReadingPaneVisible) {
            this.markAsRead();
        }
        if (!Mail.Utilities.ComposeHelper.isComposeShowing) {
            this._setFocus();
        }
    };

    Pane.prototype._editClicked = function () {
        this._glomManager.handleCommandBarNewChild();
    };

    Pane.prototype.onBodyProcessingDone = function () {
        this._attachmentWell.update();
    };

    Pane.prototype._setFocus = function () {
        Mail.setActiveHTMLElement(this._rootElement.querySelector(Pane.rootContentElementSelector));
    };

    function _markInfo(s) { Jx.mark("ReadingPane:" + s); }
    function _markStart(s) { Jx.mark("ReadingPane." + s + ",StartTA,Mail,ReadingPane"); }
    function _markStop(s) { Jx.mark("ReadingPane." + s + ",StopTA,Mail,ReadingPane"); }
});
