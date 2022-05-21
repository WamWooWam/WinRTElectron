
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Mail,Debug,Windows */
/*jshint browser:true*/

Jx.delayDefine(Mail, "StandardReadingPane", function () {
    "use strict";

    Mail.StandardReadingPane = function (rootId, selection, glomManager, animator) {
        _markStart("ctor");

        this._name = "Mail.StandardReadingPane";

        _markStart("ctor_InitComp");
        this.initComponent();
        _markStop("ctor_InitComp");

        this._applicationView = null;
        this._onNewSelectedMessageAsyncJob = null;
        this._messagesChangedHandler = this._onMessagesChangedBeforeViewChange;
        this._disposer = null;
        this._readingPane = new Mail.CompReadingPane(rootId, selection, glomManager, animator);
        this._selection = selection;
        this._glomManager = glomManager;
        this.append(this._readingPane);

        _markStop("ctor");
    };

    Jx.augment(Mail.StandardReadingPane, Jx.Component);

    Mail.StandardReadingPane.prototype.getUI = function (ui) {
        Debug.assert(Jx.isObject(ui));
        _markStart("getUI");
        ui.html = Jx.getUI(this._readingPane).html;
        _markStop("getUI");
    };

    Mail.StandardReadingPane.prototype.activateUI = function () {
        _markStart("activateUI");
        Jx.Component.prototype.activateUI.call(this);

        var selection = this._selection;
        this._disposer = new Mail.Disposer(
            new Mail.EventHook(selection, "navChanged", this._onNavChanged, this),
            new Mail.EventHook(selection, "messagesChanged", this._onMessagesChanged, this)
        );

        this._applicationView = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();

        if (Jx.glomManager.getIsParent()) {
            this._disposer.addMany(
                new Mail.EventHook(Jx.glomManager, Jx.GlomManager.Events.glomCreated, this._onGlomCreated, this),
                new Mail.EventHook(this._glomManager, "releasingMessage", this._onReleasingMessage, this),
                Mail.EventHook.createGlobalHook("composeVisibilityChanged", function () {
                    var message = this._selection.message;
                    if (message && !message.isDraft) {
                        this._readingPane.showPane(true);
                    }
                }, this)
            );
        }

        this._onNewSelectedMessageSynchronous();

        _markStop("activateUI");
    };

    Mail.StandardReadingPane.prototype.deactivateUI = function () {
        _markStart("deactivateUI");

        Jx.Component.deactivateUI.call(this);
        Jx.dispose(this._disposer);
        this._disposer = null;
        this._onNewSelectedMessageAsyncJob = null;
        this._applicationView = null;

        _markStop("deactivateUI");
    };

    Mail.StandardReadingPane.prototype._onNavChanged = function (ev) {
        Debug.assert(Jx.isObject(ev));

        if (!ev.accountChanged && ev.viewChanged) {
            // The selected view in the account changed - we need to handle the message change differently
            _markInfo("_onNavChanged - only view changed - using one-off handler");
            this._messagesChangedHandler = this._onMessagesChangedAfterViewChange;
        } else {
            _markInfo("_onNavChanged - account and view changed / view did not change");
        }
    };

    Mail.StandardReadingPane.prototype._onMessagesChanged = function (ev) {
        _markStart("_onMessagesChanged");
        this._messagesChangedHandler(ev);
        _markStop("_onMessagesChanged");
    };

    Mail.StandardReadingPane.prototype._onMessagesChangedBeforeViewChange = function (ev) {
        Debug.assert(Jx.isObject(ev));

        if (ev.messageChanged) {
            _markInfo("_onMessagesChangedBeforeViewChange - message changed");
            this._onNewSelectedMessage(ev.keyboard);
        } else {
            _markInfo("_onMessagesChangedBeforeViewChange - message did not change");
        }
    };

    Mail.StandardReadingPane.prototype._onMessagesChangedAfterViewChange = function (ev) {
        Debug.assert(Jx.isObject(ev));

        // This is a one-off handler for selected message change as a result of a view (not account) change
        if (ev.messageChanged) {
            _markInfo("_onMessagesChangedAfterViewChange - message changed");
            this._onNewSelectedMessage(ev.keyboard);
        } else {
            // The message remained the same after the view change. We need to fake the readingPane loaded events
            // because animations trigger on them (WinBlue:258020)
            _markInfo("_onMessagesChangedAfterViewChange - message did not change");
            Jx.EventManager.fireDirect(null, "readingPaneHeaderLoaded");
            Jx.EventManager.fireDirect(null, "readingPaneBodyLoaded");
        }

        // This is a one-off listener
        _markInfo("_onMessagesChangedAfterViewChange - restoring original handler");
        this._messagesChangedHandler = this._onMessagesChangedBeforeViewChange;
    };

    Mail.StandardReadingPane.prototype._onNewSelectedMessage = function (isKeyboard) {
        Debug.assert(Jx.isBoolean(isKeyboard));
        _markStart("_onNewSelectedMessage");

        // If the keyboard was used, then we want to delay selection by about 250ms.
        // When navigating with keyboard, we get a lot of selection events.  So its
        // best to wait a little while when selection changes because of the keyboard.
        // But clearing old content is fast so we should do that right away, so only
        // delay if there is actual message.
        var newJob = null;
        if (isKeyboard && Jx.isObject(this._selection.message)) {
            _markInfo("_onNewSelectedMessage - setting timeout");
            newJob = Jx.scheduler.addTimerJob(null, Mail.Priority.readingPaneNewSelectedMessage, null, 250, this._onNewSelectedMessageSynchronous, this);
        } else {
            _markInfo("_onNewSelectedMessage - scheduling a job");
            newJob = Jx.scheduler.addJob(null, Mail.Priority.readingPaneNewSelectedMessage, null, this._onNewSelectedMessageSynchronous, this);
        }
        this._onNewSelectedMessageAsyncJob = this._disposer.replace(this._onNewSelectedMessageAsyncJob, newJob);

        _markStop("_onNewSelectedMessage");
    };

    Mail.StandardReadingPane.prototype._onNewSelectedMessageSynchronous = function () {
        _markStart("_onNewSelectedMessageSynchronous");

        // Don't interupt compose's animation, the new draft will be selected when its animation is complete
        var ComposeHelper = Mail.Utilities.ComposeHelper;
        var newMessage = null;
        if (!ComposeHelper.isComposeLaunching) {
            newMessage = this._selection.message;

            if (newMessage && newMessage.isDraft && !Mail.GlomManager.messageOpenInAnotherWindow(newMessage)) {
                this._openCompose(newMessage);
            } else {
                if (ComposeHelper.isComposeShowing) {
                    // Hide compose if it is visible
                    ComposeHelper.hideCurrent();
                }

                document.getElementById("idCompCompose").classList.add("invisible");
                this._readingPane.onNewSelectedMessageSynchronous(newMessage);
                this._readingPane.showPane(true);
            }
        }

        var enableScreenCapture = true;
        if (newMessage) {
            enableScreenCapture = newMessage.irmCanExtractContent;
        }

        var applicationView = this._applicationView;
        if (applicationView.isScreenCaptureEnabled !== enableScreenCapture) {
            applicationView.isScreenCaptureEnabled = enableScreenCapture;
        }

        _markStop("_onNewSelectedMessageSynchronous");
    };

    Mail.StandardReadingPane.prototype._openCompose = function (message, moveFocus) {
        _markInfo("_openCompose");
        this._readingPane.showPane(false);
        Mail.Utilities.ComposeHelper.onEdit(message, moveFocus);
    };

    Mail.StandardReadingPane.prototype._onGlomCreated = function (event) {
        _markInfo("_onGlomCreated");
        Debug.assert(Jx.glomManager.getIsParent());

        var message = this._selection.message,
            glomId = event.glom.getGlomId();

        if (message && message.objectId === glomId && message.isDraft) {
            this._onNewSelectedMessageSynchronous();
        }
    };

    Mail.StandardReadingPane.prototype._onReleasingMessage = function (event) {
        _markStart("_onReleasingMessage");
        Debug.assert(Jx.glomManager.getIsParent());

        var selection = this._selection,
            message = selection.message,
            closeContext = event.context,
            closedMessageId = closeContext.messageId;

        if (message && message.objectId === closedMessageId && message.isDraft) {
            // Draft is closing in a child window, so we need to get the latest instance of this draft
            // and switch to compose in this (the parent) window
            var mailManager = Mail.Globals.platform.mailManager;
            var promise = mailManager.waitForInstanceNumberOnMessage(closedMessageId, closeContext.instanceNumber);
            // waitForInstanceNumberOnMessage returns null if the message has been deleted
            if (promise) {
                _markInfo("_onReleasingMessage - start waiting for instance number");
                promise.done(function () {
                    _markInfo("_onReleasingMessage - got instance number");
                    var newMessage = mailManager.loadMessage(closedMessageId);
                    this._openCompose(new Mail.UIDataModel.MailMessage(newMessage, selection.account), true /*moveFocus*/);
                }.bind(this));
            }
        }

        _markStop("_onReleasingMessage");
    };

    function _markInfo(s) { Jx.mark("StandardReadingPane:" + s); }
    function _markStart(s) { Jx.mark("StandardReadingPane." + s + ",StartTA,Mail,StandardReadingPane"); }
    function _markStop(s) { Jx.mark("StandardReadingPane." + s + ",StopTA,Mail,StandardReadingPane"); }

});