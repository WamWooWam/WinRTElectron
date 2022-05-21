
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Mocks,Microsoft,Windows,window,Include*/

Include.initializeFileScope(function () {
    // Shortcut for the changing namespace
    var P = People;
    var C = People.Controls;
    var U = People.UnitTest;

    var jxResGetString = null;
    var throwOnAssert = null;

    function setup () {
        
        throwOnAssert = Debug.throwOnAssert;
        Debug.throwOnAssert = true;
        


        if (!Jx.app) {
            Jx.app = new Jx.Application();
        }
        jxResGetString = Jx.res.getString;
        Jx.res.getString = function () { return "nothing"; };
    }

    function cleanup () {
        
        Debug.throwOnAssert = throwOnAssert;
        
        Jx.res.getString = jxResGetString;
    }

    function getDummyHost (tc, commandDiv) {
        if (commandDiv === null) {
            commandDiv = document.createElement('div');
        }

        var theHost = new U.DummyPageHost(commandDiv);
        theHost._appbar._winappbar.addEventListener = function () { };
        theHost._appbar._winappbar.removeEventListener = function () { };
        // Create a test scheduler
        var scheduler = new P.Scheduler();
        theHost.setJobSet(scheduler.getJobSet());
        // Sanity check to ensure that the dummy host is implementing the expected interface methods
        UnitTestUtils.assertImplements(tc, theHost, new U.Interfaces.IPageHost());

        return theHost;
    }


    Tx.test("ContactEditControlTest.test_ImplementsExpectedInterface", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var myHost = getDummyHost(tc, null);
        var control = new C.ContactEditControl(myHost);

        UnitTestUtils.assertImplements(tc, control, new U.Interfaces.IPageControl());
    });

});
