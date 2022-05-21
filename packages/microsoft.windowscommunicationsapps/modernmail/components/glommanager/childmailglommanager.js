
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// GlomManager to be loaded in child windows
/*global Jx, Mail, Debug, WinJS */
/*jshint browser:true*/

Jx.delayDefine(Mail, ["GlomManager", "ChildMailGlomManager"], function () {
    "use strict";
    var MailMultiWindowEvents = {
        // Expected messages.
        showMessageList: "showMessageList",
        releasingMessage: "releasingMessage",
        parentWindowVisibilityChanged: "parentWindowVisibilityChanged"
    };
    Debug.Events.define(Jx.Glom.prototype, MailMultiWindowEvents.parentWindowVisibilityChanged);
    var GlomManager = Mail.GlomManager = function (selection, /*ignored*/guiState, platform) {
        Debug.assert(Jx.isInstanceOf(selection, Mail.Selection));
        Debug.assert(Jx.isObject(platform));

        Mail.writeProfilerMark("Child mail glom manager constructor");
        Jx.initGlomManager();
        this._selection = selection;
        this._platform = platform;
        this._message = null;
        
        var glomManager = Jx.glomManager,
            GlomManagerEvents = Jx.GlomManager.Events;

        this._disposer = new Mail.Disposer(glomManager,
            new Mail.EventHook(selection, "messagesChanged", this._handleMessageSelected, this),
            new Mail.EventHook(selection, "deleteItemsStart", this._handleDeleteStart, this),
            new Mail.EventHook(glomManager, GlomManagerEvents.startingContext, this._handleStartingContext, this),
            new Mail.EventHook(glomManager, GlomManagerEvents.resetGlom, this._handleReset, this),
            new Mail.EventHook(glomManager, GlomManagerEvents.glomConsolidated, this._glomConsolidated, this),
            new Mail.EventHook(glomManager.getParentGlom(), MailMultiWindowEvents.parentWindowVisibilityChanged, this._handleParentVisChange, this),
            new Mail.GlomManagerUtil(this, selection)
        );
        this._handleMessageDeleted = this._handleMessageDeleted.bind(this);
        this._handleMessageChanged = this._handleMessageChanged.bind(this);
        Mail.Utilities.ComposeHelper.setGlomManager(this);
        this._consolidateStarted = false;
        this._currentDisplayIds = null;
        this._parentVisible = false;
    };

    // Enable unit testing by assigining it a second name
    Mail.ChildMailGlomManager = Mail.GlomManager;

    var proto = GlomManager.prototype;
    proto.dispose = function () {
        Mail.log("Child mail glom manager disposed");
        Jx.dispose(this._disposer);
        this._selection = null;
        this._platform = null;
        Mail.Utilities.ComposeHelper.setGlomManager(null);
    };

    var instanceNumberPromiseTimeout = 2000; // 2 seconds
    proto._loadMessageInstance = function (messageId, instanceNumber) {
        var platform = this._platform;

        var loadMessage = function () {
            try {
                var UIDataModel = Mail.UIDataModel,
                    platformMessage = platform.mailManager.loadMessage(messageId),
                    account = platformMessage ? Mail.Account.load(platformMessage.accountId, platform) : null,
                    message = account ? new UIDataModel.MailMessage(platformMessage, account) : null;
                if (message) {
                    var primaryViewId = message ? message.primaryViewId : null,
                        view = primaryViewId ? account.loadView(primaryViewId) : null;
                    // View might be null here because it's initialized async in the platform for new messages such 
                    // as server side search results or EML attachments.
                    // updateNav will default to Inbox view in these cases.
                    this._selection.updateNav(account, view, message);
                    this._selection.updateMessages(message, -1, [message], false);
                }
            } catch (ex) {
                Jx.log.exception("Failed to select message with error: ", ex);
                Debug.assert(false, "Failed to select message in child window");
            }
        }.bind(this);

        Mail.writeProfilerMark("Child mail glom manager _loadMessageInstance", Mail.LogEvent.start);
        var waitForInstanceNumberPromise = platform.mailManager.waitForInstanceNumberOnMessage(messageId, instanceNumber);
        if (waitForInstanceNumberPromise) {
            return WinJS.Promise.timeout(instanceNumberPromiseTimeout, waitForInstanceNumberPromise).then(
                function complete() {
                    Mail.writeProfilerMark("Child mail glom manager _loadMessageInstance", Mail.LogEvent.stop);
                    loadMessage();
                },
                function error() {
                    Mail.writeProfilerMark("Child mail glom manager _loadMessageInstance timed out", Mail.LogEvent.info);
                    Mail.writeProfilerMark("Child mail glom manager _loadMessageInstance", Mail.LogEvent.stop);
                    loadMessage();
                }
            );
        } else {
            Mail.writeProfilerMark("Child mail glom manager: Missing promise from platform", Mail.LogEvent.info);
            return WinJS.Promise.wrap();
        }
    };
    proto._handleParentVisChange = function (event) {
        this._updateParentVisible(event.message.visible);
    };
    proto._updateParentVisible = function (visible) {
        this._parentVisible = visible;
        Jx.setClass(document.getElementById("mailFrameReadingPaneSection"), "parentVisible", visible);
    };
    proto.getParentVisible = function () {
        return this._parentVisible;
    };
    proto._handleStartingContext = function (event) {
        Debug.assert(Jx.isObject(event));
        Debug.only(this._debugInitialized = true);
        // Message from window creator.  Contains information for the message to show.
        Mail.writeProfilerMark("Child mail glom manager handleStartingContext", Mail.LogEvent.start);

        var context = event.message;
        this._updateParentVisible(context.isParentVisible);
        this._loadMessageInstance(context.messageId, context.instanceNumber).done(function () {
            Mail.writeProfilerMark("Child mail glom manager handleStartingContext instance loaded", Mail.LogEvent.start);
            if (this._message) {

                // reset focus from previous invocation.
                Jx.safeSetActive(document.getElementById("idCompApp"));

                Mail.writeProfilerMark("StartDelayBuildCompose", Mail.LogEvent.start);
                Mail.Utilities.ComposeHelper.ensureComposeObject();
                Mail.writeProfilerMark("StartDelayBuildCompose", Mail.LogEvent.stop);

                Mail.writeProfilerMark("StartDelayInsertComposeHTML", Mail.LogEvent.start);
                Mail.Utilities.ComposeHelper.ensureComposeHTML();
                Mail.writeProfilerMark("StartDelayInsertComposeHTML", Mail.LogEvent.stop);

                Jx.ptStop("Mail-ChildStart");
            } else {
                Mail.writeProfilerMark("Message failed to load and/or select.  Closing child window");
                this._cleanlyCloseWindow();
            }
            Mail.writeProfilerMark("Child mail glom manager handleStartingContext instance loaded", Mail.LogEvent.stop);
        }.bind(this));
        Mail.writeProfilerMark("Child mail glom manager handleStartingContext", Mail.LogEvent.stop);
    };
    proto._updateGlomTitle = function (message) {
        // Method to update the window title to match the message passed in.
        Mail.writeProfilerMark("Child mail glom manager update glom title");
        if (message) {
            Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
            var draftPrefix = "";
            if (message.isDraft) {
                draftPrefix = Jx.res.getString("mailMessageListDraftPrefix") + " ";
            }
            var subject = message.subject;
            if (subject.length === 0) {
                subject = Jx.res.getString("mailUIMailMessageNoSubject");
            }
            Jx.glomManager.changeGlomTitle(draftPrefix + subject);
        } else {
            Jx.glomManager.changeGlomTitle(Jx.res.getString("mailWindowTitleNoSubject"));
        }
    };
    proto._handleMessageSelected = function (ev) {
        Mail.writeProfilerMark("GlomManager._handleMessageSelected", Mail.LogEvent.start);
        if (ev.messageChanged) {
            if (this._message) {
                this._message.removeListener("deleted", this._handleMessageDeleted);
                this._message.removeListener("changed", this._handleMessageChanged);
            }
            this._message = this._selection.message;
            if (this._message) {
                this._message.addListener("deleted", this._handleMessageDeleted);
                this._message.addListener("changed", this._handleMessageChanged);
                // Keep a copy of current display Ids to compare later
                this._currentDisplayIds = this._message.displayViewIds;
            }
            this._updateGlomTitle(this._message);
        }
        Mail.writeProfilerMark("GlomManager._handleMessageSelected", Mail.LogEvent.stop);
    };
    proto._ensureMessageList = function () {
        Mail.writeProfilerMark("Child mail glom manager post message to ensure message list");
        Jx.glomManager.getParentGlom().postMessage(MailMultiWindowEvents.showMessageList);
    };
    proto._handleDeleteStart = function () {
        // Hide the current window at the start of delete for improved preceived delete perf
        Mail.writeProfilerMark("Child mail hidding window at start of delete process");
        Jx.glomManager.createOrShowGlom(Jx.GlomManager.ParentGlomId, {}, Jx.GlomManager.ShowType.showAndCloseThis);
    };
    proto._cleanlyCloseWindow = function () {
        Mail.writeProfilerMark("Child mail glom manager cleanlyCloseWindow (consolidate)");
        if (this._selection.message && this._message) {
            this._ensureMessageList();
            var message = this._message;
            Jx.glomManager.getParentGlom().postMessage(MailMultiWindowEvents.releasingMessage, {
                messageId: message.objectId,
                instanceNumber: message.instanceNumber
            });
            this._selection.clearMessageSelection();
        }
        Jx.glomManager.createOrShowGlom(Jx.GlomManager.ParentGlomId, {}, Jx.GlomManager.ShowType.showAndCloseThis);
        if(this._consolidateStarted) {
            this._consolidateStarted = false;
            Jx.glomManager.consolidateComplete();
        }
    };
    proto._glomConsolidated = function () {
        Debug.assert(!this._consolidateStarted);
        this._consolidateStarted = true;
        this.handleHomeButton();
    };
    proto.handleComposeComplete = function () {
        Mail.writeProfilerMark("Child mail glom manager compose complete");
        this._cleanlyCloseWindow();
    };
    proto.handleHomeButton = function () {
        Mail.writeProfilerMark("Child mail glom manager home button");
        if (this._message && this._message.isDraft) {
            Mail.Utilities.ComposeHelper.handleHomeButton();
        } else {
            this._cleanlyCloseWindow();
            Debug.only(function (initialized) {
                if (!initialized) {
                    // Visual studio tries to be helpful sometimes by switching a child window into a view
                    // that is not initialized.  This allows the user to get back to the main window.
                    Jx.log.info("Home button pressed without a message.  Switching to main window")
                    var ViewManagement = Windows.UI.ViewManagement;
                    ViewManagement.ApplicationViewSwitcher.switchAsync(
                        MSApp.getViewOpener().viewId,
                        ViewManagement.ApplicationView.getForCurrentView().id,
                        ViewManagement.ApplicationViewSwitchingOptions.consolidateViews).done(
                            function (e) { Jx.log.info("Home button switch done " + e); },
                            function (e) { Jx.log.info("Home button switch error " + e); });
                }
            }(this._debugInitialized));
        }
    };
    proto.composeComplete = proto.handleComposeComplete;
    proto.updateWindowTitleWithMessage = function (message) {
        Mail.writeProfilerMark("Child mail glom manager message updated");
        this._updateGlomTitle(message);
    };
    proto._handleMessageDeleted = function () {
        Mail.writeProfilerMark("Child mail glom manager message deleted");
        this._cleanlyCloseWindow();
    };
    proto._handleMessageChanged = function (event) {
        Debug.assert(!Jx.isNullOrUndefined(event));
        if (Mail.Validators.hasPropertyChanged(event, "displayViewIds")) {
            var newDisplayIds = event.target.displayViewIds;
            // It is ok if new display Ids have been added, but if any have been removed
            // then consider the message "moved" and close the child window. 
            for (var i = 0, iMax = this._currentDisplayIds.length; i < iMax; ++i) {
                if (!newDisplayIds.indexOf(this._currentDisplayIds.getAt(i)).returnValue) {
                    Mail.writeProfilerMark("Child mail glom manager - message's display view Id changed");
                    this._cleanlyCloseWindow();
                    break;
                }
            }
            this._currentDisplayIds = newDisplayIds;
        }
    };

    Debug.only(Mail.GlomManager._debugHasReset = false);
    proto._handleReset = function () {
        this._selection.clearMessageSelection();
        if (document.activeElement) {
            document.activeElement.blur();
        }
        // For debugging errors that might only happen on child windows that have been reset.
        Debug.only(Mail.GlomManager._debugHasReset = true);
        Debug.only(this._debugInitialized = false);
    };

    // Global methods to determine if this is a childGlom or a parentGlom.
    // This prevents needing the GlomManager object, and is much faster than checking window.location.href or MSApp.getViewOpener().
    GlomManager.isParent = function () {
        return false;
    };
    GlomManager.isChild = function () {
        return true;
    };
    GlomManager.messageOpenInAnotherWindow = function () { 
        // Child windows have no knowlage of other windows open state.
        return false;
    };
});
