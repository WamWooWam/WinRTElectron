
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Jx UTs

/// <reference path="jx.js" />

/*global Tx,Jx,NoShip*/

(function () {

    Tx.test("JxTests.testEtw", function (/*tc*/) {
        /// <summary>
        /// Tests Jx.etw()
        /// </summary>

        // $TODO
    });

    Tx.test("JxTests.testPerfTrack", function (/*tc*/) {
        /// <summary>
        /// Tests Jx.ptStart() and Jx.ptStop()
        /// </summary>

        // TODO: we fire PerfTrack events to ensure that the APIs are not throwing exceptions
        // but currently we don't have a good way in JS to verify that the events are actually fired

        // Fire sample PerfTrack scenario with no key
        Jx.ptStart("Jx-UT");
        Jx.ptStop("Jx-UT");

        // Fire sample PerfTrack scenario with key
        Jx.ptStart("Jx-UT", "TestKey1");
        Jx.ptStop("Jx-UT", "TestKey1");

        // Fire sample PerfTrack scenario with key and data
        Jx.ptStart("Jx-UT", "TestKey2");
        Jx.ptStopData("Jx-UT", "TestKey2", 111, 222, 333, 444, 555, "data1", "data2");

        // Fire custom PerfTrack stop events
        Jx.ptStopLaunch(Jx.TimePoint.visibleComplete, 0);
        Jx.ptStopLaunch(Jx.TimePoint.responsive, 1);
        Jx.ptStopResume(Jx.TimePoint.visibleComplete);
        // Don't call resize from a worker.
        if (!Jx.isWorker){
            Jx.ptStopResize(Jx.TimePoint.responsive, true, true, 800, 600);
        }
    });
    
    Tx.test("JxTests.testFault", function (/*tc*/) {
        /// <summary>
        /// Tests Jx.fault() 
        /// </summary>

        if (Jx.isWorker) return; // Doesn't work in web workers TODO: fix it
        if (!Jx.isWWA) return; // It only works in WWA

        // disable upload for unittest by settings "WLIEnabled" to false in appsettings
        var appData = new Jx.AppData();
        var wliEnabled = "WLIEnabled";
        var settings = appData.localSettings().createContainer("ResponseTable_ShipAsserts");
        var oldValue = settings.get(wliEnabled);
       
        // disable upload
        settings.set(wliEnabled, false);

        var Exception = function () {};
        var exObj = new Exception();
        exObj.number = 1;

        Jx.fault("JxFault-UT", "erroridentifying string", exObj);

        // restore old state
        if (oldValue) {
            settings.set(wliEnabled, oldValue);
        } else {
            settings.remove(wliEnabled);
        }
    });

    Tx.test("JxTests.testFaultNoExObject", function (/*tc*/) {
        /// <summary>
        /// Tests Jx.fault() with two parameters only
        /// </summary>

        if (Jx.isWorker) return; // Doesn't work in web workers TODO: fix it
        if (!Jx.isWWA) return; // It only works in WWA

        // disable upload for unittest by settings "WLIEnabled" to false in appsettings
        var appData = new Jx.AppData();
        var wliEnabled = "WLIEnabled";
        var settings = appData.localSettings().createContainer("ResponseTable_ShipAsserts");
        var oldValue = settings.get(wliEnabled);
        
        // disable upload
        settings.set(wliEnabled, false);

        Jx.fault("JxFault-UT", "erroridentifying string");

        // restore old state
        if (oldValue) {
            settings.set(wliEnabled, oldValue);
        } else {
            settings.remove(wliEnabled);
        }
    });

    Tx.test("JxTests.testFaultStringInsteadOfExObject", function (/*tc*/) {
        /// <summary>
        /// Tests Jx.fault()  with string passed in place of exception object
        /// </summary>

        if (Jx.isWorker) return; // Doesn't work in web workers TODO: fix it
        if (!Jx.isWWA) return; // It only works in WWA

        // disable upload for unittest by settings "WLIEnabled" to false in appsettings
        var appData = new Jx.AppData();
        var wliEnabled = "WLIEnabled";
        var settings = appData.localSettings().createContainer("ResponseTable_ShipAsserts");
        var oldValue = settings.get(wliEnabled);

        // disable upload
        settings.set(wliEnabled, false);

        Jx.fault("JxFault-UT", "erroridentifying string", "foobar");

        // restore old state
        if (oldValue) {
            settings.set(wliEnabled, oldValue);
        } else {
            settings.remove(wliEnabled);
        }

    });

    Tx.test("JxTests.testErRegisterFile", function (/*tc*/) {
        /// <summary>
        /// Tests Jx.erRegisterFile() 
        /// </summary>

        if (Jx.isWorker) return; // Doesn't work in web workers TODO: fix it
        if (!Jx.isWWA) return; // It only works in WWA

        Jx.erRegisterFile("foobarfilepath");
    });

})();