
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// GlomManager to be loaded in parent windows
/*global Jx, Mail, Debug */
/*jshint browser:true*/

Jx.delayDefine(Mail, ["GlomManager", "ParentGlomManager"], function () {
    "use strict";
    var MailMultiWindowEvents = {
        /// Expected messages.
        showMessageList: "showMessageList",
        childGlomVisible: "childGlomVisible",
        releasingMessage: "releasingMessage",
        parentWindowVisibilityChanged: "parentWindowVisibilityChanged"
    };
    Debug.Events.define(Jx.Glom.prototype, MailMultiWindowEvents.showMessageList);
    Debug.Events.define(Jx.Glom.prototype, MailMultiWindowEvents.childGlomVisible);
    Debug.Events.define(Jx.Glom.prototype, MailMultiWindowEvents.releasingMessage);

    var GlomManager = Mail.GlomManager = function (selection, guiState) {
        Debug.assert(Jx.isInstanceOf(selection, Mail.Selection));
        Debug.assert(Jx.isInstanceOf(guiState, Mail.GUIState));
        Mail.writeProfilerMark("Parent mail glom manager constructor");
        Jx.initGlomManager();
        this._selection = selection;
        Mail.Globals.appState.addRestartCheck("Child glom age check", this._canRestart, this);
        this._guiState = guiState;
        this._openGloms = {};
        var glomManager = Jx.glomManager;
        Debug.assert(Jx.isInstanceOf(glomManager, Jx.ParentGlomManager));
        this._disposer = new Mail.Disposer(glomManager,
            new Mail.EventHook(glomManager, Jx.GlomManager.Events.glomCreated, this._handleNewChild, this),
            new Mail.EventHook(glomManager, Jx.GlomManager.Events.glomClosed, this._handleChildClosed, this),
            new Mail.EventHook(document, "msvisibilitychange", this._handleVisibilityChange, this)
        );
        this._glomUtil = this._disposer.add(new Mail.GlomManagerUtil(this, selection));
        glomManager.enableGlomCache("/ModernMail/ChildApp/ChildApp.html" + document.location.hash, 3);
    };

    // Enable unit testing by assigning it a second name
    Mail.ParentGlomManager = Mail.GlomManager;

    var proto = GlomManager.prototype = {};
    Jx.augment(Mail.GlomManager, Jx.Events);
    Debug.Events.define(proto, MailMultiWindowEvents.releasingMessage);

    proto.dispose = function () {
        Mail.writeProfilerMark("Parent mail glom manager dispose");
        this._disposer.dispose();
        Jx.glomManager = null;
    };

    Mail.youngestWindow = function (openGloms) {
        var youngest = Mail.Utilities.msInOneDay * 10;
        for (var index in openGloms) {
            var glomTracker = openGloms[index];
            Debug.assert(Jx.isNumber(glomTracker.openTime) && glomTracker.openTime > 0);
            if (glomTracker.openTime > youngest) {
                youngest = glomTracker.openTime;
            }
        }
        return (Date.now() - youngest) / Mail.Utilities.msInOneDay;
    };
    proto.getParentVisible = function () {
        return !document.hidden;
    };
    proto._handleVisibilityChange = function () {
        var visibleMessage = {visible:this.getParentVisible()};
        var messageType = MailMultiWindowEvents.parentWindowVisibilityChanged;
        for (var index in this._openGloms) {
            var glom = this._openGloms[index].glom;
            if (glom) {
                glom.postMessage(messageType, visibleMessage);
            }
        }
    };
    proto._canRestart = function () {
        var youngest = Mail.youngestWindow(this._openGloms);
        // Return true if the youngest window is at least a day old
        return youngest > 1;
    };
    proto._handleNewChild = function (event) {
        // Event handler from Jx.GlomManager when a new child window has been created.
        Mail.writeProfilerMark("Parent mail glom manager handleNewChild");
        Debug.assert(Jx.isObject(event));
        var glom = event.glom,
            glomId = glom.getGlomId(),
            glomTracker = this._openGloms[glomId];

        if (glomId === "Worker") {
            // Window worker is special. 
            // Let WorkerOwner manage it.
            return;
        }
        Debug.assert(Jx.isInstanceOf(glom, Jx.Glom));
        if (!glomTracker) {
            // This can happen if the glom wasn't opened by mailGlomManager
            glomTracker = this._openGloms[glomId] = { keepAlive: null, openTime: null, glom:null};
        }
        glomTracker.openTime = Date.now();
        glomTracker.glom = glom;
        
        glom.addListener(MailMultiWindowEvents.showMessageList, this._handleShowMessageList, this);
        glom.addListener(MailMultiWindowEvents.childGlomVisible, this._handleChildGlomVisible, this);
        glom.addListener(MailMultiWindowEvents.releasingMessage, this._handleReleasingMessage, this);

        glom.postMessage(MailMultiWindowEvents.parentWindowVisibilityChanged, {visible:!document.hidden});
    };
    proto._handleShowMessageList = function () {
        // Event handler for showMessageList message from child windows.
        Mail.writeProfilerMark("Parent mail glom manager handleShowMessageList");
        this._guiState.ensureNavMessageList();
    };
    proto._handleChildGlomVisible = function () {
        // Event handler for childGlomVisible message from child windows.
        Mail.writeProfilerMark("Parent mail glom manager handleChildGlomVisible");
        this._guiState.handleGlomVisible();
    };
    proto._handleReleasingMessage = function (event) {
        Mail.writeProfilerMark("Parent mail glom manager handleGlomClosing");
        this.raiseEvent(MailMultiWindowEvents.releasingMessage, { context: event.message });
    };
    proto.handleCommandBarNewChild = function () {
        var message = this._selection.message;
        Debug.assert(message, "Attepted to open new child window without a selected message");
        if (message) {
            var Instr = Mail.Instrumentation,
                cmd = message.isDraft ? Instr.Commands.newComposeWindow : Instr.Commands.newReadingPaneWindow;
            Instr.instrumentMailCommand(cmd);
            this._glomUtil.openChildMailWindow(message, /* isEmlMessage */ false);
        }
    };

    proto._handleChildClosed = function (event) {
        // Event handler from Jx.GlomManager when a child window has closed
        Mail.writeProfilerMark("Parent mail glom manager handleChildClosed");
        Debug.assert(Jx.isObject(event) && Jx.isObject(event.glom) && Jx.isNonEmptyString(event.glom.getGlomId()));
        var glomId = event.glom.getGlomId(),
            glomTracker = this._openGloms[glomId];
        if (glomTracker) {
            if (glomTracker.keepAlive) {
                glomTracker.keepAlive.dispose();
            }
            delete this._openGloms[glomId];
        }
    };
    proto.addKeepAlive = function (keepAlive) {
        if (!this._openGloms[keepAlive.objectId]) {
            this._openGloms[keepAlive.objectId] = { keepAlive: keepAlive };
        }
    };


    // Global methods to determine if this is a childGlom or a parentGlom.
    // This prevents needing the GlomManager object, and is much faster than checking window.location.href or MSApp.getViewOpener().
    GlomManager.isParent = function () {
        return true;
    };

    GlomManager.isChild = function () {
        return false;
    };

    GlomManager.messageOpenInAnotherWindow = function (message) {
        return message && Jx.glomManager.isGlomOpen(message.objectId);
    };

});

