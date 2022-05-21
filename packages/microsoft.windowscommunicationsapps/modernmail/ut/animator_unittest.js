
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//
/*jshint browser:true */
/*global Mail,Jx,Tx,setImmediate,clearImmediate */

(function () {

    var animator = null;
    var sandbox;
    var animateCount = {};

    var emptyPromise = {
        then: function (complete) {
            this.immediateId = setImmediate(function () {
                this.immediateId = null;
                var next = complete();
                if (!next) {
                    this.done();
                }
            }.bind(this));
            return this;
        },
        done: function (complete) { this.immediateId = setImmediate(complete); },
        cancel: function () {
            if (Jx.isValidNumber(this.immediateId)) {
                clearImmediate(this.immediateId);
            }
        },
        immediateId: null
    };

    var incrementAnimateCount = function (tc, element) {
        var name = element.id || element.className;
        animateCount[name] = (animateCount[name] || 0) + 1;
    };
    
    var verifyAnimateCount = function (tc, expected) {
        Object.keys(expected).forEach(function (name) {
            tc.areEqual(expected[name], animateCount[name] || 0);
        });
    };

    var clearAnimateCount = function () {
        animateCount = {};
    };

    function setup (tc) {
        var originalWinJS = window.WinJS;
        tc.cleanup = function () {
            Mail.UnitTest.disposeGlobals();
            Mail.UnitTest.restoreJx();
            Mail.UnitTest.restoreGUIState();
            window.WinJS = originalWinJS;
            sandbox.removeNode(true);
            sandbox = animator = null;
        };

        Mail.UnitTest.setupStubs();
        Mail.UnitTest.stubJx(tc, "appData");
        Mail.UnitTest.stubJx(tc, "activation");
        Mail.UnitTest.initGlobals(tc);
        var platform = Mail.Globals.platform;
        Mail.Globals.appState.setSelectedView(new Mail.Account(platform.accountManager.defaultAccount, platform).inboxView);
        Mail.UnitTest.stubGUIState();

        var sandbox = document.createElement("div");
        sandbox.innerHTML = 
            "<div id='navPaneBackground'></div>" + 
                "<div id='navPane'>" +
                    "<div id='navPaneHeader'></div>" + 
                    "<div id='viewSwitcher'></div>" + 
                "</div>" + 
            "</div>" +
            "<div id='messageListBackground'></div>" + 
                "<div id='messageList'>" +
                    "<div id='mailMessageListCollection'></div>" +
                "</div>" + 
            "</div>" +
            "<div id='readingPane'>" +
                "<div class='mailReadingPaneBodyWrapper'></div>" +
                "<div class='mailReadingPaneContent'></div>" +
            "</div>";

        var animationFunction = function (element) {
            if (Jx.isArray(element)) {
                element.forEach(function (e) {
                    animationFunction(e);
                });
                return emptyPromise;
            }
            incrementAnimateCount(tc, element);
            return emptyPromise;
        };
        window.WinJS = {
            UI: {
                enableAnimations: Jx.fnEmpty,
                isAnimationEnabled: function () {
                    return true;
                },
                Animation: {
                    enterPage: animationFunction,
                    fadeIn: animationFunction,
                    enterContent: animationFunction
                },
                executeTransition: animationFunction
            }
        };
        window.WinJS.Promise = function () { return emptyPromise; };
        window.WinJS.Promise.wrap = function () { return emptyPromise; };
        window.WinJS.Promise.as = function () { return emptyPromise; };
        window.WinJS.Promise.any = function () { return emptyPromise; };
        window.WinJS.Promise.join = function () { return emptyPromise; };
        window.WinJS.Promise.timeout = function () { return emptyPromise; };

        animator = new Mail.Animator(Mail.guiState);
        animator.setNavPaneElements(
            sandbox.querySelector("#navPaneBackground"),
            sandbox.querySelector("#navPane"),
            sandbox.querySelector("#navPaneHeader"),
            sandbox.querySelector("#viewSwitcher")
        );
        animator.setMessageListElements(
            sandbox.querySelector("#messageListBackground"),
            sandbox.querySelector("#messageList"),
            sandbox.querySelector("#mailMessageListCollection")
        );
        animator.setReadingPaneElements(
            sandbox.querySelector("#readingPane")
        );
    }

    Tx.test("Animator.AnimatorAppLaunch", function (tc) {
        setup(tc);

        var eventFired = false; 
        animator.addListener(Mail.Animator.appLaunchAnimated, function () {
            eventFired = true;
        });
        clearAnimateCount();

        Mail.UnitTest.ensureSynchronous(function () {
            animator._onAppLaunch();
        });

        tc.isTrue(eventFired);
        var expectedCounts = {
            navPane: 1,
            messageList: 1,
            readingPane: 1,
            navPaneBackground: 1,
            messageListBackground: 1,
            navPaneHeader: 0,
            viewSwitcher: 0,
            mailReadingPaneBodyWrapper: 0,
            mailReadingPaneContent: 0
        };
        verifyAnimateCount(tc, expectedCounts);
    });

    Tx.test("Animator.AnimatorSwitchAccount", function (tc) {
        setup(tc);

        clearAnimateCount();
        var listView = {
            addEventListener: Jx.fnEmpty,
            removeEventListener: Jx.fnEmpty
        };
        animator.registerMessageList(listView);

        Mail.UnitTest.ensureSynchronous(function () {
            animator.animateSwitchAccount({ });
        });

        var expectedCounts = {
            navPane: 0,
            messageList: 1,
            readingPane: 0,
            navPaneBackground: 0,
            messageListBackground: 0,
            navPaneHeader: 1,
            viewSwitcher: 1,
            mailReadingPaneBodyWrapper: 0,
            mailReadingPaneContent: 1,
            mailMessageListCollection: 0
        };
        verifyAnimateCount(tc, expectedCounts);
    });

})();
