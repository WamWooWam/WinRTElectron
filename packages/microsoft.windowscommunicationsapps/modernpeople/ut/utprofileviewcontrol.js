
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,Debug,People,document,Include*/

Include.initializeFileScope(function () {
    // Shortcut for the changing namespace
    var C = People.Controls;
    var U = People.UnitTest;

    var jxResGetString = null;
    var throwOnAssert = null;
    var perfEvents = null;

    function setup () {
        
        throwOnAssert = Debug.throwOnAssert;
        Debug.throwOnAssert = true;
        


        if (!Jx.app) {
            Jx.app = new Jx.Application();
        }
        Jx.app.addListener = function () {};
        Jx.app.removeListener = function () {};
        jxResGetString = Jx.res.getString;
        Jx.res.getString = function () { return "nothing"; }
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
        var scheduler = new People.Scheduler();
        theHost.setJobSet(scheduler.getJobSet());
        // Sanity check to ensure that the dummy host is implementing the expected interface methods
        UnitTestUtils.assertImplements(tc, theHost, new U.Interfaces.IPageHost());

        return theHost;
    }

    function capturePerfEvents(tc) {
        perfEvents = new UnitTestUtils.capturePerfEvents(tc);
    }

    function resetPerfEvents () {
        perfEvents.resetEvents();
    }

    function findChildWithId (container, expectedId) {
        for (var idx = 0, len = container.children.length; idx < len; idx++) {
            var child = container.children.item(idx);
            if (child.id === expectedId) {
                return child;
            } else if (child.hasChildNodes()) {
                var found = findChildWithId(child, expectedId);
                if (found) {
                    return found;
                }
            }
        }

        return null;
    }

    Tx.test("ProfileViewControlTests.test_ImplementsExpectedInterface", function (tc) {
        tc.cleanup = cleanup;
        setup();
 
        var myHost = getDummyHost(tc, null);
        var control = new C.ProfileViewControl(myHost);

        UnitTestUtils.assertImplements(tc, control, new U.Interfaces.IPageControl());
    });


    Tx.test("ProfileViewControlTests.test_CheckLoadWithTestData", function (tc) {
        tc.cleanup = cleanup;
        setup();
 
        var mockProvider = new U.TestMockIMePeople();
        var testIds = ['fred01', 'barney01', 'acme01'];
        var testFieldValues = ['firstName', 'middleName', 'lastName'];

        for (var lp1 = 0, len = testIds.length; lp1 < len; lp1++) {
            var id = testIds[lp1];
            var myHost = getDummyHost(tc, null);

            capturePerfEvents(tc);

            var control = new C.ProfileViewControl(myHost);

            var testPerson = mockProvider.getIMe(id);
            resetPerfEvents();
            var myDiv = document.createElement('div');
            control.load({ element: myDiv, mode: 'load', data: testPerson });

            // The div should now have child elements
            Jx.scheduler.testFlush();
            tc.isTrue(myDiv.hasChildNodes(), 'Validate that the div has been altered');
            tc.areEqual(testPerson, control._person, 'Validated that the person is the same object');

            for (var lp2 = 0, len2 = testIds.length; lp2 < len2; lp2++) {
                var fieldName = testFieldValues[lp2];
                var expectedDivName = 'fieldValueDiv_' + fieldName;
                var fieldDiv = findChildWithId(myDiv, expectedDivName);
                if (testPerson[fieldName]) {
                    var fieldValue = fieldDiv.innerText;

                    tc.areEqual(fieldValue, testPerson[fieldName]);
                } else {
                    tc.isNull(fieldDiv);
                }
            }
        }
    });
});
