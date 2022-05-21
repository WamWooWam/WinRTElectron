
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail, Jx, Compose, Tx*/
/*jshint browser:true*/

(function () {
    var sandbox,
        testInfo = { owner: "tonypan", priority: 0 };

    var compFrame = {
        getUI:Mail.CompFrame.prototype.getUI,
        _navPane:{
            getUI:Mail.NavPaneManager.prototype.getUI,
            _header: {
                getUI:Mail.AccountNameHeader.prototype.getUI,
                _selection:{account:{name:"UnitTestAccountName"}}
            },
            _viewSwitcher:{
                getUI:Mail.ViewSwitcher.getUI,
                _accountViews:{
                    getUI:Mail.AccountViews.prototype.getUI,
                    _list:{
                        getUI:function (ui) { ui.html = "";}
                    }
                }
            },
            _accountSwitcher:{
                getUI:Mail.AccountSwitcher.prototype.getUI,
                _singleAccountHasError: function () { return false; },
                _singleAccountHasOof: function () { return false; },
                _items: {count:1},
                _list:{
                    getUI:function (ui) { ui.html = "";}
                },
                _aggregator:{
                    getUI:Mail.AccountSwitcherAggregator.prototype.getUI,
                    _id:"AccountSwitcherAggregatorID",
                    _hasError:function() { return false; },
                    _hasUnseenFav:function () { return true; },
                    getDisplayCount:function () { return 1; },
                    getOverflowGlyph:function () { return 1; },
                    _unseenInboxCount:function () { return 1; }
                }
            }
        },
        _messageList:{
            getUI:Mail.CompMessageList.prototype.getUI
        },
        _readingPaneSection:{
            getUI:Mail.ReadingPaneSection.prototype.getUI,
            _readingPane:{
                getUI:Mail.StandardReadingPane.prototype.getUI,
                _readingPane:{
                    getUI:Mail.CompReadingPane.prototype.getUI
                }
            }
        },
        _commandBar:{
            getUI:Mail.CompCommandBar.prototype.getUI,
            _peekBar:{
                getUI:function (ui) {ui.html = "";}
            }
        }
    };

    function getAppHTML() {
        return Jx.getUI(compFrame).html;
    }

    function addSubject(rootElement) {
        var oldDisposer = Mail.Disposer;
        var oldEventHook = Mail.EventHook;
        Mail.EventHook = Mail.Disposer = function() {
            this.addMany = function() {};
        };

        var readingPaneSubject = {
            initialize:Mail.ReadingPaneSubjectArea.prototype.initialize,
            _host:null
        };

        readingPaneSubject.initialize(rootElement.querySelector(".mailReadingPaneSubjectArea"));

        Mail.Disposer = oldDisposer;
        Mail.EventHook = oldEventHook;
    }

    function addCompose(rootElement, tc) {
        var div = document.createElement("DIV");
        var returnEmpty = function() { return ""; };
        var compuseUI = {
            getUI:Mail.FullscreenComposeUI.prototype.composeGetUI,
            getComponentCache: function () {
                return {
                    getComponent: function (componentName) {
                        switch (componentName) {
                            case "Compose.AttachmentWell":
                                return {
                                    getAttachmentAreaHTML:returnEmpty,
                                    getProgressBarHTML:returnEmpty
                                };
                            case "Compose.BackButton":
                                return new Compose.BackButton();
                            case "Compose.SendButton":
                                return new Compose.SendButton();
                            case "Compose.AttachButton":
                                return new Compose.AttachButton();
                            case "Compose.DeleteButton":
                                return new Compose.DeleteButton();
                            case "Compose.NewButton":
                                return new Compose.NewButton();
                            case "Compose.From":
                            case "Compose.ReadOnlyHeader":
                            case "Compose.ToCcBcc":
                            case "Compose.Priority":
                            case "Compose.IrmChooser":
                            case "Mail.ExpandButton":
                            case "Compose.Subject":
                            case "Compose.WarningMessage":
                            case "Compose.BodyComponent":
                                return {html:""};
                            default:
                                tc.isTrue(false, "Unexpected component request " + componentName);
                                return {html:""};
                        }
                    }
                };
            }
        };
        div.innerHTML = Jx.getUI(compuseUI).html;
        rootElement.appendChild(div.firstChild);
    }

    function colorize(rootElement) {
        rootElement.querySelector("#mailFrame").style["background-color"] = "lime";
        rootElement.getElementsByClassName("mailFrameNavPaneBackground")[0].style["background-color"] = "red";
        rootElement.getElementsByClassName("mailFrameMessageListBackground")[0].style["background-color"] = "white";
        rootElement.querySelector("#mailFrameReadingPaneSection").style["background-color"] = "blue";
    }

    function setup (tc) {
        var content = getAppHTML();
        sandbox = document.getElementById("sandbox");
        var body = sandbox.contentDocument.body;
        body.innerHTML = content;

        Mail.UnitTest.stubJx(tc, "appData");
        addSubject(body);
        addCompose(body, tc);
        colorize(body);
        tc.areEqual(sandbox.contentDocument.readyState, "complete");
    }

    function setWidth (width) {
        sandbox.style.width = width + "px";
    }

    function getRect (selector) {
        return sandbox.contentDocument.querySelector(selector).getBoundingClientRect();
    }

    function verifyWidth (tc, frameWidth, expectedNavPaneWidth, expectedMessageListWidth, expectedReadingPaneWidth) {
        setWidth(frameWidth);

        var navPaneWidth = Math.round(getRect(".mailFrameNavPaneBackground").width),
            messageListWidth = Math.round(getRect(".mailFrameMessageListBackground").width),
            readingPaneWidth = Math.round(getRect("#mailFrameReadingPaneSection").width);

        tc.areEqual(expectedNavPaneWidth, navPaneWidth);
        tc.areEqual(expectedMessageListWidth, messageListWidth);
        if (expectedReadingPaneWidth) {
            tc.areEqual(expectedReadingPaneWidth, readingPaneWidth);
        }
    }

    Tx.test("Layouts.test_OnePane", testInfo, function (tc) {
        setup(tc);

        verifyWidth(tc, 320, 80, 240); // OnePaneNarrow_Lower
        verifyWidth(tc, 501, 80, 421); // OnePaneNarrow_Upper
        verifyWidth(tc, 502, 180, 322); // OnePaneWide_Lower
        verifyWidth(tc, 843, 180, 663); // OnePaneWide_Upper

        // OnePane_End_To_End
        for (var width = 320; width < 844; width++) {
            var expectedNavPaneWidth = (width <= 501) ? 80 : 180;
            verifyWidth(tc, width, expectedNavPaneWidth, width - expectedNavPaneWidth);
        }
    });

    Tx.test("Layouts.test_ThreePane", testInfo, function (tc) {
        setup(tc);

        verifyWidth(tc, 844, 80, 272); // ThreePaneNarrow_Lower
        verifyWidth(tc, 1024, 80, 330); // ThreePaneNarrow_Upper
        verifyWidth(tc, 1025, 180, 330); // ThreePaneWide_Min_Lower
        verifyWidth(tc, 1366, 180, 440); // ThreePaneWide_Min_Upper
        verifyWidth(tc, 1367, 180, 440); // ThreePaneWide_Flex_1
        verifyWidth(tc, 1701, 224, 548); // ThreePaneWide_Flex_2
        verifyWidth(tc, 1822, 240, 587); // ThreePaneWide_Flex_3
        verifyWidth(tc, 1823, 240, 587); // ThreePaneWide_Max_Lower
        verifyWidth(tc, 2173, 240, 700); // ThreePaneWide_Max_Upper
        verifyWidth(tc, 9999, 240, 700); // ThreePaneWide_Max_MessageList

        // ThreePane_End_To_End
        for (var width = 844; width < 4000; width += 5) {
            var expectedNavPaneWidth;
            if (width <= 1024) {
                expectedNavPaneWidth = 80;
            } else if (width <= 1366) {
                expectedNavPaneWidth = 180;
            } else if (width <= 1822) {
                expectedNavPaneWidth = Math.round(width * 13.17 / 100);
            } else {
                expectedNavPaneWidth = 240;
            }

            var expectedMessageListWidth = Math.round(Math.min(700, width * 32.21 / 100));
            verifyWidth(tc, width, expectedNavPaneWidth, expectedMessageListWidth);
        }
    });

    Tx.test("Layouts.test_ReadingPane_As_Child", testInfo, function (tc) {
        setup(tc);

        var frame = sandbox.contentDocument.querySelector("#mailFrame");
        frame.className = "childWindow";
        for (var width = 320; width <= 3000; width += 5) {
            verifyWidth(tc, width, 0, 0, width);
        }
        frame.removeAttribute("class");
    });

    Tx.test("Layouts.test_ReadingPane_Compose_Margins", testInfo, function (tc) {
        setup(tc);

        var body = sandbox.contentDocument.querySelector("body"),
            frame = sandbox.contentDocument.querySelector("#mailFrame"),
            readingPaneMargin,
            composeMargin;

        // Using the canvas button as the proxy of rendered margin
        var readingPaneButtonArea = sandbox.contentDocument.querySelector(".mailReadingPaneCanvasButtonArea"),
            composeButtonArea = sandbox.contentDocument.querySelector(".composeButtonArea");

        function ensureMarginsAreEqual() {
            readingPaneMargin = parseInt(sandbox.contentWindow.getComputedStyle(readingPaneButtonArea).paddingLeft, 10),
            composeMargin = parseInt(sandbox.contentWindow.getComputedStyle(composeButtonArea).paddingLeft, 10);
            tc.areEqual(readingPaneMargin, composeMargin);
        }

        // Make sure the Reading Pane and Compose margins are always equal
        for (var width = 320; width <= 2000; width++) {
            body.className = "";
            Jx.setClass(frame, "readingPaneActive", width < 844);
            setWidth(width);

            ensureMarginsAreEqual();

            // Check child windows too
            body.className = "childWindow";

            ensureMarginsAreEqual();
        }

        body.removeAttribute("class");
    });

    var smallCanvasButtonLimit = 490;

    Tx.test("Layouts.test_Small_CanvasButton_Limit", testInfo, function (tc) {
        setup(tc);

        var expectedReadingPaneMinWidthInThreePane = 492;
        verifyWidth(tc, 844, 80, 272, expectedReadingPaneMinWidthInThreePane);
        tc.isTrue(smallCanvasButtonLimit <= expectedReadingPaneMinWidthInThreePane);
    });

    function removeHidden(selector) {
        Jx.removeClass(sandbox.contentDocument.querySelector(selector), "hidden");
    }

    Tx.test("Layouts.test_CanvasButtons", testInfo, function (tc) {
        setup(tc);

        removeHidden(".mailMessageListRespondButton");
        removeHidden(".mailMessageListComposeButton");
        removeHidden(".mailMessageListDeleteButton");
        removeHidden(".mailReadingPaneRespondButton");
        removeHidden(".mailReadingPaneComposeButton");
        removeHidden(".mailReadingPaneDeleteButton");
        removeHidden(".cmdAttachSnap");
        removeHidden(".cmdNewSnap");
        removeHidden(".cmdDeleteSnap");
        removeHidden(".cmdAttach");
        removeHidden(".cmdNew");
        removeHidden(".cmdDelete");

        var mailButton1, mailButton2, mailButton3,composeButton1, composeButton2, composeButton3,
            mailGap1, mailGap2, composeGap1, composeGap2;

        for (var width = 320; width <= 1366; width++) {
            setWidth(width);

            var useSmallButtons = width <= smallCanvasButtonLimit;

            mailButton1 = getRect(".mailMessageListRespondButton");
            mailButton2 = getRect(".mailMessageListComposeButton");
            mailButton3 = getRect(".mailMessageListDeleteButton");

            if (width < 400) {
                tc.areEqual(mailButton1.height, 0);
                tc.areEqual(mailButton1.width, 0);
                tc.areEqual(mailButton3.height, 0);
                tc.areEqual(mailButton3.width, 0);
                mailButton1 = null;
                mailButton3 = null;
            } else if (width < 440) {
                tc.areEqual(mailButton1.height, 0);
                tc.areEqual(mailButton1.width, 0);
                mailButton1 = null;
            } else if (width >= 844) {
                tc.areEqual(mailButton1.height, 0);
                tc.areEqual(mailButton1.width, 0);
                tc.areEqual(mailButton2.height, 0);
                tc.areEqual(mailButton2.width, 0);
                tc.areEqual(mailButton3.height, 0);
                tc.areEqual(mailButton3.width, 0);
                mailButton1 = getRect(".mailReadingPaneRespondButton");
                mailButton2 = getRect(".mailReadingPaneComposeButton");
                mailButton3 = getRect(".mailReadingPaneDeleteButton");
            }

            if (width < 672 || (width >= 844 && width < 1366)) {
                composeButton1 = getRect(".cmdAttachSnap");
                composeButton2 = getRect(".cmdNewSnap");
                composeButton3 = getRect(".cmdDeleteSnap");
            } else {
                composeButton1 = getRect(".cmdAttach");
                composeButton2 = getRect(".cmdNew");
                composeButton3 = getRect(".cmdDelete");
            }

            // Verify sizes
            var expectedButtonSize = useSmallButtons ? 30 : 40;
            [mailButton1, mailButton2, mailButton3, composeButton1, composeButton2, composeButton3].forEach(
                function (button) {
                    if (button) {
                        tc.areEqual(button.height, expectedButtonSize);
                        tc.areEqual(button.width, expectedButtonSize);
                    }
                }
            );

            // Verify gaps
            var expectedGapSize;
            if (useSmallButtons) {
                expectedGapSize = 10;
            } else if (width <= 767 || (width >= 844 && width <= 1024)) {
                expectedGapSize = 20;
            } else {
                expectedGapSize = 30;
            }

            if (mailButton1 && mailButton2 && mailButton3) {
                mailGap1 = mailButton2.left - mailButton1.left - mailButton1.width;
                mailGap2 = mailButton3.left - mailButton2.left - mailButton2.width;
                tc.areEqual(mailGap1, expectedGapSize);
                tc.areEqual(mailGap2, expectedGapSize);
            }

            composeGap1 = composeButton2.left - composeButton1.left - composeButton1.width;
            composeGap2 = composeButton3.left - composeButton2.left - composeButton2.width;
            tc.areEqual(composeGap1, expectedGapSize);
            tc.areEqual(composeGap2, expectedGapSize);
        }
    });

    Tx.asyncTest("Layouts.test_Subject", testInfo, function (tc) {
        tc.stop();
        setup(tc);

        var subjectArea = sandbox.contentDocument.querySelector(".mailReadingPaneSubjectArea");
        subjectArea.style.width = "6em";
        var subject = sandbox.contentDocument.querySelector(".mailReadingPaneSubject");

        function fillText (previousHeight) {
            subject.innerText += "more text ";
            var style = sandbox.contentWindow.getComputedStyle(subject),
                currentHeight = parseInt(style.height, 10);
            tc.isTrue(currentHeight >= previousHeight);
            if (currentHeight === previousHeight) {
                tc.areEqual(parseInt(style.lineHeight, 10) * 4, currentHeight);
                subject.innerText = "";
                tc.start();
            } else {
                window.requestAnimationFrame(fillText.bind(null, currentHeight));
            }
        }

        window.requestAnimationFrame(fillText.bind(null, -1));
    });

    function setInnerText(selector, txt) {
        sandbox.contentDocument.querySelector(selector).innerText = txt;
    }

    function setInnerHtml(selector, htm) {
        sandbox.contentDocument.querySelector(selector).innerHTML = htm;
    }

    function setDisplayBlock(selector) {
        sandbox.contentDocument.body.querySelector(selector).style.display = "block";
    }

    Tx.test("Layouts.test_SearchScope", testInfo, function (tc) {
        setup(tc);

        setDisplayBlock("#mailMessageListSearchHeader");
        setInnerText("#mailMessageListSearchScope .comboboxText",
            "Search in a folder with a very very long name that should never overlap the " +
            "canvas buttons no matter what because it's very important that the user is able to " +
            "see the buttons clearly.");
        setInnerHtml(".mailMessageListRespondButton", "<div class='unitTestLocate'>&#xE172;</div>");
        setInnerHtml(".mailMessageListComposeButton", "<div class='unitTestLocate'>&#xE109;</div>");
        setInnerHtml(".mailMessageListDeleteButton", "<div class='unitTestLocate'>&#xE107;</div>");
        setInnerHtml("#mailMessageListSearchScope .comboboxArrow", "&#x2002;&#xE015;");

        var previousGap = -1;
        for (var width = 320; width < 844; width++) {
            setWidth(width);

            var leftMostButton = Array.prototype.reduce.call(
                sandbox.contentDocument.querySelectorAll(".unitTestLocate"),
                function (leftMost, button) {
                    var rect = button.getBoundingClientRect();
                    return rect.width > 0 ? Math.min(leftMost, rect.left) : leftMost;
                },
                Infinity
            );

            tc.isFalse(leftMostButton === Infinity);

            var arrow = getRect("#mailMessageListSearchScope .comboboxArrow"),
                scopeText = getRect("#mailMessageListSearchScope .comboboxText");

            tc.areEqual(arrow.bottom, scopeText.bottom);
            tc.isTrue(arrow.width + scopeText.width < width);
            tc.isTrue(leftMostButton > arrow.right);
            tc.isTrue(previousGap === -1 || previousGap === leftMostButton - arrow.right);

            previousGap = leftMostButton - arrow.right;
        }
    });
})();

