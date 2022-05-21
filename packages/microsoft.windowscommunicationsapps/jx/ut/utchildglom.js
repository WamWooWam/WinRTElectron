
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global MSApp,Debug,Jx,Windows,window*/
var TxChildProxy = {
    // unit test errors need to report to the parent window without relying on childGlomManager or parentGlomManager.
    getCallStack: function () {
        // collect a callstack so it can be logged by the main window.
        var stack = "";
        try {
            this.will.generate.an.error();
        } catch (err) {
            stack = err.stack.split(" at reportError")[1];
        }
        return stack;
    },
    reportError: function (err) {
        // Report error to main window, then trigger debugger if it is attached.
        var queueToParent = MSApp.getViewOpener();
        var errorMsg = { type: "txReportError", purpose: "tx", err: err, stack: TxChildProxy.getCallStack() };
        queueToParent.postMessage(errorMsg, "*");
        debugger;
    },
    isTrue: function (b, errorString) {
        if (!b) {
            TxChildProxy.reportError("isTrue FAIL {" + JSON.stringify(b) + errorString ? (", " + errorString) : "" + "}");
        }
    },
    isEqual: function (left, right, errorString) {
        if (left != right) {
            TxChildProxy.reportError("isEqual FAIL {" + JSON.stringify({ left: left, right: right }) + errorString ? (", " + errorString) : "" + "}");
        }
    }


};

var UnitTestEvents = {
    /// Expected messages.
    ping: "ping",
    pingReply: "pingReply",
    closeToCache: "closeToCache",
    closeToDead: "closeToDead",
    windowClose: "windowClose",
    closeByDisposeManager: "closeByDisposeManager",
    changeGlomId: "changeGlomId",
    verifyGlomId: "verifyGlomId",
    changeGlomTitle: "changeGlomTitle",
    createAnotherGlom: "createAnotherGlom"
};
Debug.Events.define.apply(Debug.Events, [Jx.Glom.prototype].concat(Object.keys(UnitTestEvents)));

var ChildGlomTest = {
    onStartingContext: function (event) {
        // verify we only receive starting context when we expect it.
        TxChildProxy.isTrue(Jx.isObject(event));
        TxChildProxy.isTrue(Jx.isObject(event.message));
        TxChildProxy.isTrue(event.message.check);
        TxChildProxy.isTrue(this.expectingStartingContext);
        this.expectingStartingContext = false;
    },
    onPing: function (event) {
        // respond to ping with pingReply
        Jx.glomManager.getParentGlom().postMessage(UnitTestEvents.pingReply, { glomTitle: Windows.UI.ViewManagement.ApplicationView.getForCurrentView().title, glomId: Jx.glomManager.getGlomId(), pingNumber: event.message.pingNumber });
    },
    onCloseToCache: function () {
        // Fake Consolidate Event
        Jx.glomManager._onConsolidated();
    },
    onCloseToDead: function () {
        // Remove handler so glom gets closed instead of reset.
        Jx.glomManager.removeListener(Jx.GlomManager.Events.resetGlom, ChildGlomTest.onReset, ChildGlomTest);
        // Fake Consolidate Event
        Jx.glomManager._onConsolidated();
    },
    onWindowClose: function () {
        window.close();
    },
    onCloseByDispose: function () {
        Jx.glomManager.dispose();
    },
    onChangeGlom: function (event) {
        Jx.glomManager.changeGlomId(event.message.newGlomId);
    },
    onVerifyGlomId: function (event) {
        TxChildProxy.isEqual(Jx.glomManager.getGlomId(), event.message.glomId);
    },
    onChangeGlomTitle: function (event) {
        Jx.glomManager.changeGlomTitle(event.message.glomTitle);
        // Bug# 239215 title doesn't set
        //TxChildProxy.isEqual(Windows.UI.ViewManagement.ApplicationView.getForCurrentView().title, event.message.glomTitle);
    },
    onVerifyWasReset: function () {
        TxChildProxy.isTrue(this.wasReset);
    },
    onReset: function () {
        this.wasReset = true;
        this.expectingStartingContext = true;
    },
    onCreateAnotherGlom: function (event) {
        Jx.glomManager.createOrShowGlom(event.message.glomId, { check: true }, Jx.GlomManager.ShowType.doNotShow);
    },
    onGlomConsolidated: function () {
        Jx.glomManager.consolidateComplete();
    },
    wasReset: false,
    expectingStartingContext: true
};

window.onload = function () {
    Jx.initGlomManager();
    TxChildProxy.isTrue(Jx.glomManager.getIsChild());
    Jx.glomManager.addListener(Jx.GlomManager.Events.startingContext, ChildGlomTest.onStartingContext, ChildGlomTest);
    Jx.glomManager.addListener(Jx.GlomManager.Events.resetGlom, ChildGlomTest.onReset, ChildGlomTest);
    Jx.glomManager.addListener(Jx.GlomManager.Events.glomConsolidated, ChildGlomTest.onGlomConsolidated, ChildGlomTest);
    var parent = Jx.glomManager.getParentGlom();
    parent.addListener(UnitTestEvents.ping, ChildGlomTest.onPing, ChildGlomTest);
    parent.addListener(UnitTestEvents.closeToCache, ChildGlomTest.onCloseToCache, ChildGlomTest);
    parent.addListener(UnitTestEvents.closeToDead, ChildGlomTest.onCloseToDead, ChildGlomTest);
    parent.addListener(UnitTestEvents.windowClose, ChildGlomTest.onWindowClose, ChildGlomTest);
    parent.addListener(UnitTestEvents.closeByDisposeManager, ChildGlomTest.onCloseByDispose, ChildGlomTest);
    parent.addListener(UnitTestEvents.changeGlomId, ChildGlomTest.onChangeGlom, ChildGlomTest);
    parent.addListener(UnitTestEvents.verifyGlomId, ChildGlomTest.onVerifyGlomId, ChildGlomTest);
    parent.addListener(UnitTestEvents.changeGlomTitle, ChildGlomTest.onChangeGlomTitle, ChildGlomTest);
    parent.addListener(UnitTestEvents.createAnotherGlom, ChildGlomTest.onCreateAnotherGlom, ChildGlomTest);
};
