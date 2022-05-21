

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Tx */
/*jshint browser:true*/

(function () {
    Tx.test("BodyLinkFlyout_UnitTest.ensureFlyout", { owner: "joshuala" }, function (tc) {
        var sandbox = document.getElementById("sandbox");
        var origElementID = Mail.CompApp.rootElementId;
        Mail.CompApp.rootElementId = "sandbox";

        sandbox.innerHTML = "";
        tc.isTrue(sandbox.children.length === 0, "Element left in sandbox from previous test");
        Mail.BodyLinkFlyout.ensureFlyout(true);
        // Check that flyout div got added to sandbox
        tc.isTrue(sandbox.children.length === 1);
        Mail.BodyLinkFlyout.dispose();
        // Verify flyout div cleaned itself up
        tc.isTrue(sandbox.children.length === 0);

        Mail.CompApp.rootElementId = origElementID;
        sandbox.innerHTML = "";

    });
    Tx.test("BodyLinkFlyout_UnitTest.onContextMenu", { owner: "joshuala" }, function (tc) {
        var mockFlyout = {
        _flyout: {
            show: function () {
                this.showCalled = true;
            }
            },
            ensureFlyout: Jx.fnEmpty,
            _selectedElement: null,
            showCalled: false,
            _flyoutDiv: {
                offsetWidth: 100,
                offsetHeight: 100,
                style: {left:"", top:""}
            }
        };
        var sandbox = document.getElementById("sandbox");

        // Testing an image inside of a link.  
        MSApp.execUnsafeLocalFunction(function () {
            sandbox.innerHTML = '<div> <a href="https://outlook.com" > <img src="ms-appdata:///local/unitTestImage.png"></img></a> </div>';
        });

        Mail.BodyLinkFlyout.onContextMenu.call(mockFlyout, {
            target: sandbox.querySelector("img"),
            stopPropagation:Jx.fnEmpty,
            preventDefault: Jx.fnEmpty,
            clientX: 0,
            clientY: 0
        });

        // Context menu should walk up from the image, to the link, and set it as the target element.
        // and show the context menu
        tc.isTrue(mockFlyout._flyout.showCalled);
        tc.isTrue(Boolean(mockFlyout._selectedElement));
        tc.areEqual(mockFlyout._selectedElement, sandbox.querySelector("a"));
    });
    Tx.test("BodyLinkFlyout._copySelectedElement", { owner: "joshuala" }, function (tc) {
        var mockContext = {};
        mockContext._selectedElement = document.createElement("A");
        mockContext._selectedElement.href = "CopyMe";
        var BLF = Mail.BodyLinkFlyout;
        var hrefSet = false;
        var textSet = false;

        mockContext._getClipboard = function () {
            return {
                setData: function (type, href) {
                    if (type === "URL") {
                        tc.areEqual(href, "ms-appx://microsoft.windowscommunicationsapps/ModernMail/ut/CopyMe");
                        hrefSet = true;

                        // If setting URL to clipboard fails with an exception, the copy handler should attempt to set text
                        throw "Fail over to Txt";
                    } else {
                        tc.areEqual(href, "ms-appx://microsoft.windowscommunicationsapps/ModernMail/ut/CopyMe");
                        textSet = true;
                    }
                }
            };
        };
        BLF._copySelectedLink.call(mockContext);
        tc.isTrue(hrefSet);
        tc.isTrue(textSet);
    });
})();