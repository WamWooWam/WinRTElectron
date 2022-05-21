
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Tx,window,Debug*/

(function () {
    /// Set this value to a very high number to effectivly disable async timeout for debugging.
    var asyncDebugOverride = 0; // 9000000

    /// Track current test to log errors agianst when they are reported by child window.
    var currentTest = null;

    /// Handle error message report from child window.
    var onTxMessage = function (event) {
        if (event.data.purpose === "tx") {
            event.preventDefault();
            event.stopPropagation();
            switch (event.data.type) {
                case "txReportError":
                    Tx.log("Child window reports error: " + JSON.stringify(event.data));
                    currentTest.isTrue(false);
                    break;
            }
        }
    };

    /* Using a global parentGlomMgr and reusing it in unit tests is not ideal.  However, there isn't a way to flush the postMessage queue.  So creating a different
       glomMgr per unit test has the problem of the new glom manager will receive async close events that result from the previously glom
       manager exiting.
    */
    var parentGlomMgr = null;

    Tx.test("GlomManagerTest Setup", function () {
        window.addEventListener("message", onTxMessage);
        parentGlomMgr = new Jx.ParentGlomManager();
    });

    var verifyEmptyParentGlomMgr = function (tc, pgm) {
        // Verifies the glomManager's resources are cleaned.
        var openGlom = null;
        for (openGlom in pgm._childGloms) {
            tc.isTrue(false);
        }
        for (openGlom in pgm._resettingGloms) {
            tc.isTrue(false);
        }
        tc.isTrue(pgm._readyGloms.length === 0);
    };

    var startAfterGlomUnloaded = function (tc, glomManager, glomId) {
        // Allow test to continue only after the glomUnloaded event has been received.
        var oldHandleUnload = glomManager._msgHandlers[Jx.GlomManager.InternalEvents.glomUnloaded];
        var newHandleUnload = function (event) {
            tc.isTrue(event.data.fromGlomId === glomId);
            glomManager._msgHandlers[Jx.GlomManager.InternalEvents.glomUnloaded] = oldHandleUnload;
            glomManager._msgHandlers[Jx.GlomManager.InternalEvents.glomUnloaded](event);
            tc.start();
        };
        glomManager._msgHandlers[Jx.GlomManager.InternalEvents.glomUnloaded] = newHandleUnload;
    };

    var startAfterGlomReset = function (tc, glomManager, glomId) {
        // Allow test to continue only after the glomReset event has been received.
        var oldHandleReset = glomManager._msgHandlers[Jx.GlomManager.Events.resetGlom];
        var newHandleReset = function (event) {
            tc.isTrue(event.data.fromGlomId === glomId);
            glomManager._msgHandlers[Jx.GlomManager.Events.resetGlom] = oldHandleReset;
            glomManager._msgHandlers[Jx.GlomManager.Events.resetGlom](event);
            tc.start();
        };
        glomManager._msgHandlers[Jx.GlomManager.Events.resetGlom] = newHandleReset;
    };

    Tx.asyncTest("GlomManagerTests.EndToEnd", { timeoutMs: (asyncDebugOverride ? asyncDebugOverride : 3000) }, function (tc) {
        // End to end test performs the following actions:
        // 1. Create a child glom without enabling cache.
        // 2. Verfiies glomManager create handler
        // 3. Verifies child can change its title
        // 4. Verifies child has correct glomId.
        // 5. Sends custom message to glom
        // 6. Receives custom reply.
        // 7. Closes glom via Jx.Glom.dispose()
        // 8. Verifies glomManager closed handler
        // 9. Verifies isGlomOpen
        //
        currentTest = tc;
        var glomCreatedCalled = false,
            glomShowingCalled = false;
        var onGlomCreated = function (event) {
            glomCreatedCalled = true;

            var glom = event.glom;
            tc.isTrue(glom.getGlomId() === "windowWithoutCache");
            var onPingReply = function (event) {
                tc.isTrue(event.message.pingNumber === 5);
                // Bug# 239215 title doesn't set
                //tc.isTrue(event.message.glomTitle === "newTitle");
                tc.isTrue(event.message.glomId === event.fromGlomId);
                tc.isTrue("windowWithoutCache" === event.fromGlomId);
                tc.isTrue(Jx.GlomManager.ParentGlomId === event.targetGlomId);
                glom.dispose();
                // calling postMessage on a disposed glom should do nothing. (Including NOT crash)
                glom.postMessage("dontCrash", {dontCrashTest:true});
            };
            var TestEvents = {
                pingReply: "pingReply"
            };
            Debug.Events.define.apply(Debug.Events, [Jx.Glom.prototype].concat(Object.keys(TestEvents)));
            glom.addListener(TestEvents.pingReply, onPingReply);
            glom.postMessage("verifyGlomId", { glomId: "windowWithoutCache" });
            glom.postMessage("changeGlomTitle", { glomTitle: "newTitle" });
            glom.postMessage("ping", { pingNumber: 5 });
        };

        var onGlomShowing = function (event) {
            glomShowingCalled = true;
            var glom = event.glom;
            tc.isTrue(glom.getGlomId() === "windowWithoutCache");
        };

        var onGlomClosed = function (event) {
            tc.isTrue(glomCreatedCalled && glomShowingCalled);
            tc.isTrue(event.glom.getGlomId() === "windowWithoutCache");
            // Since cache was not enabled, and this is the only child glom created
            // there shouldn't be any glom objects associated with parent glom manager after this event.
            // using setImmediate to let stack unwind.
            window.setImmediate(function (tc, parentGlomMgr) {
                verifyEmptyParentGlomMgr(tc, parentGlomMgr);
                parentGlomMgr.removeListener(Jx.GlomManager.Events.glomCreated, onGlomCreated);
                parentGlomMgr.removeListener(Jx.GlomManager.Events.glomShowing, onGlomShowing);
                parentGlomMgr.removeListener(Jx.GlomManager.Events.glomClosed, onGlomClosed);
                tc.start();
            }.bind(null, tc, parentGlomMgr));

        };
        parentGlomMgr.addListener(Jx.GlomManager.Events.glomCreated, onGlomCreated);
        parentGlomMgr.addListener(Jx.GlomManager.Events.glomShowing, onGlomShowing);
        parentGlomMgr.addListener(Jx.GlomManager.Events.glomClosed, onGlomClosed);
        var originalAssertFunc = parentGlomMgr._assertUnknownShowEnum,
            unknownShowEnumDetected = false;
        parentGlomMgr._assertUnknownShowEnum = function () { unknownShowEnumDetected = true; };
        // Sending an unknown show enum will make the show method fall through the switch statements of known show enums 
        // and fire the shown event as if the glom was shown.
        parentGlomMgr.createOrShowGlom("windowWithoutCache", { check: true }, "UnitTest_ShowEnum", "ms-appx://microsoft.windowscommunicationsapps/Jx/ut/utChildGlom.htm");
        parentGlomMgr._assertUnknownShowEnum = originalAssertFunc;
        tc.isTrue(parentGlomMgr.isGlomOpen("windowWithoutCache"));
        tc.isFalse(parentGlomMgr.isGlomOpen("someOtherWindow"));
        tc.isTrue(unknownShowEnumDetected);
        tc.stop();
    });

    /*
    Creating lots of windows in one test and using them in later tests is NOT ideal.  This creates an order dependency.
    However, creating child gloms is expensive, and creating them all at once lets them load in parallel and saves 500-800ms
    per test compared to creating them within each test.
    An alternative is to create one massive test that tests everything.  But this is both difficult to read, and makes failures
    in tx logs ambigious.
    */
    Tx.test("GlomManagerTests.CreateLotsOfWindows", { timeoutMs: (asyncDebugOverride ? asyncDebugOverride : 3000) }, function (tc) {
        currentTest = tc;
        parentGlomMgr.enableGlomCache("ms-appx://microsoft.windowscommunicationsapps/Jx/ut/utChildGlom.htm", 3);
        // force cache fill
        parentGlomMgr._checkForEmptyCache();
        tc.isTrue(parentGlomMgr._readyGloms.length === 1);
        // Make sure gloms with different URL's done use cache.
        parentGlomMgr.createOrShowGlom("someOtherURL", { check: true }, Jx.GlomManager.ShowType.doNotShow, "ms-appx://microsoft.windowscommunicationsapps/Jx/ut/utChildGlom2.htm");
        tc.isTrue(parentGlomMgr.isGlomOpen("someOtherURL"));
        tc.isTrue(parentGlomMgr._readyGloms.length === 1);
        // Make sure gloms with the same url as cache use the cache.
        parentGlomMgr.createOrShowGlom("windowWithCache", { check: true }, Jx.GlomManager.ShowType.doNotShow);
        tc.isTrue(parentGlomMgr._readyGloms.length === 0);

        // Precreate gloms for later tests to save unit test total time.
        parentGlomMgr.createOrShowGlom("windowToChangeGlomId", { check: true }, Jx.GlomManager.ShowType.doNotShow);
        parentGlomMgr.createOrShowGlom("windowToDisposeChildGlomMgr", { check: true }, Jx.GlomManager.ShowType.doNotShow);
        parentGlomMgr.createOrShowGlom("windowToDisposeWindowClose", { check: true }, Jx.GlomManager.ShowType.doNotShow);
        parentGlomMgr.createOrShowGlom("windowToConsolidateWithReset", { check: true }, Jx.GlomManager.ShowType.doNotShow);
        parentGlomMgr.createOrShowGlom("windowToConsolidateWithoutReset", { check: true }, Jx.GlomManager.ShowType.doNotShow);

    });

    Tx.asyncTest("GlomManagerTests.CreateGlomFromChild", { timeoutMs: (asyncDebugOverride ? asyncDebugOverride : 1000) }, function (tc) {
        // Test creating a glom from a child.
        currentTest = tc;
        var glom = parentGlomMgr.connectToGlom("windowWithCache");
        glom.postMessage("createAnotherGlom", { glomId: "SisterGlom" });
        var onSisterGlomCreated = function (event) {
            // Since this handler was registered after the createOrShowGlom's above, it should only receive
            // the sister glom creation event.
            tc.isTrue(event.glom.getGlomId() === "SisterGlom");
            parentGlomMgr.removeListener(Jx.GlomManager.Events.glomCreated, onSisterGlomCreated);
            tc.start();
        };
        parentGlomMgr.addListener(Jx.GlomManager.Events.glomCreated, onSisterGlomCreated);
        tc.stop();
    });

    Tx.asyncTest("GlomManagerTests.ChangeGlomId", { timeoutMs: (asyncDebugOverride ? asyncDebugOverride : 500) }, function (tc) {
        // Test a child changing its glom ID to a glom that is already open.
        currentTest = tc;
        var previousSomeOtherGlomClosed = false;
        var newSomeOtherGlomOpened = false;
        var oldWindowToChangeClosed = false;
        var onGlomClosed = function (event) {
            var closedGlomId = event.glom.getGlomId();
            if (closedGlomId === "someOtherURL") {
                previousSomeOtherGlomClosed = true;
                return;
            } else if (closedGlomId === "windowToChangeGlomId") {
                oldWindowToChangeClosed = true;
                return;
            }
            // Unexpected window closed
            tc.isTrue(false);

        };
        var onGlomCreated = function (event) {
            currentTest = tc;
            tc.isTrue(event.glom.getGlomId() === "someOtherURL");
            newSomeOtherGlomOpened = true;
            tc.isTrue(previousSomeOtherGlomClosed);
            tc.isTrue(oldWindowToChangeClosed);
            parentGlomMgr.removeListener(Jx.GlomManager.Events.glomCreated, onGlomCreated);
            parentGlomMgr.removeListener(Jx.GlomManager.Events.glomClosed, onGlomClosed);
            tc.start();
        };
        parentGlomMgr.addListener(Jx.GlomManager.Events.glomClosed, onGlomClosed);
        parentGlomMgr.addListener(Jx.GlomManager.Events.glomCreated, onGlomCreated);
        var glom = parentGlomMgr.connectToGlom("windowToChangeGlomId");
        glom.postMessage("changeGlomId", { newGlomId: "someOtherURL" });
        tc.stop();
    });

    Tx.asyncTest("GlomManagerTests.CloseViaChildGlomMgrDispose", { timeoutMs: (asyncDebugOverride ? asyncDebugOverride : 500) }, function (tc) {
        // Test a child glom closing itself by disposing of childGlomManager.
        currentTest = tc;
        var glom = parentGlomMgr.connectToGlom("windowWithCache");
        glom.postMessage("closeByDisposeManager");
        var onGlomClosed = function (event) {
            // Since this handler was registered after the createOrShowGlom's above, it should only receive
            // the sister glom creation event.
            tc.isTrue(event.glom.getGlomId() === "windowWithCache");
            parentGlomMgr.removeListener(Jx.GlomManager.Events.glomClosed, onGlomClosed);
        };
        parentGlomMgr.addListener(Jx.GlomManager.Events.glomClosed, onGlomClosed);
        startAfterGlomUnloaded(tc, parentGlomMgr, "windowWithCache");
        tc.stop();
    });

    Tx.asyncTest("GlomManagerTests.windowToDisposeWindowClose", { timeoutMs: (asyncDebugOverride ? asyncDebugOverride : 500) }, function (tc) {
        // Test closing a child glom by having it call window.close
        currentTest = tc;
        var glom = parentGlomMgr.connectToGlom("windowToDisposeWindowClose");
        glom.postMessage("windowClose");
        var onGlomClosed = function (event) {
            // Since this handler was registered after the createOrShowGlom's above, it should only receive
            // the sister glom creation event.
            tc.isTrue(event.glom.getGlomId() === "windowToDisposeWindowClose");
            parentGlomMgr.removeListener(Jx.GlomManager.Events.glomClosed, onGlomClosed);
        };
        parentGlomMgr.addListener(Jx.GlomManager.Events.glomClosed, onGlomClosed);
        startAfterGlomUnloaded(tc, parentGlomMgr, "windowToDisposeWindowClose");
        tc.stop();
    });

    Tx.asyncTest("GlomManagerTests.windowToConsolidateWithReset", { timeoutMs: (asyncDebugOverride ? asyncDebugOverride : 1000) }, function (tc) {
        // Test that a child glom that consolidates with a reset handler gets reset.
        currentTest = tc;
        var glom = parentGlomMgr.connectToGlom("windowToConsolidateWithReset");
        glom.postMessage("closeToCache");
        var onGlomClosed = function (event) {
            // Since this handler was registered after the createOrShowGlom's above, it should only receive
            // the sister glom creation event.
            tc.isTrue(event.glom.getGlomId() === "windowToConsolidateWithReset");
            parentGlomMgr.removeListener(Jx.GlomManager.Events.glomClosed, onGlomClosed);
        };
        parentGlomMgr.addListener(Jx.GlomManager.Events.glomClosed, onGlomClosed);
        startAfterGlomReset(tc, parentGlomMgr, "windowToConsolidateWithReset");
        tc.stop();
    });

    Tx.asyncTest("GlomManagerTests.windowToConsolidateWithoutReset", { timeoutMs: (asyncDebugOverride ? asyncDebugOverride : 500) }, function (tc) {
        // Test that a child glom that consolidates without a reset handler gets closed.
        currentTest = tc;
        var glom = parentGlomMgr.connectToGlom("windowToConsolidateWithoutReset");
        glom.postMessage("closeToDead");
        var onGlomClosed = function (event) {
            // Since this handler was registered after the createOrShowGlom's above, it should only receive
            // the sister glom creation event.
            tc.isTrue(event.glom.getGlomId() === "windowToConsolidateWithoutReset");
            parentGlomMgr.removeListener(Jx.GlomManager.Events.glomClosed, onGlomClosed);
        };
        parentGlomMgr.addListener(Jx.GlomManager.Events.glomClosed, onGlomClosed);
        startAfterGlomUnloaded(tc, parentGlomMgr, "windowToConsolidateWithoutReset");
        tc.stop();
    });

    Tx.test("GlomManagerTest Cleanup", function (tc) {
        window.removeEventListener("message", onTxMessage);
        currentTest = null;
        parentGlomMgr.dispose();
        var openGlom = null;
        for (openGlom in parentGlomMgr._childGloms) {
            tc.isTrue(false);
        }
        for (openGlom in parentGlomMgr._resettingGloms) {
            tc.isTrue(false);
        }
        tc.isTrue(parentGlomMgr._readyGloms.length === 0);
    });

})();