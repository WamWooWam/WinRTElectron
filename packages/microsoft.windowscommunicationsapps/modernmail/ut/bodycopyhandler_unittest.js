

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Tx, Windows */
/*jshint browser:true*/

(function () {
    Tx.test("BodyCopyHandler._onContextMenu", { owner: "joshuala" }, function (tc) {

        var origContextFunction = Mail.BodyLinkFlyout.onContextMenu;
        var contextCalled = false;
        Mail.BodyLinkFlyout.onContextMenu = function() { contextCalled = true; };
        var mockMessage = {
            mockedType:Mail.UIDataModel.MailMessage,
            irmCanExtractContent:true
        };

        var bodyCopyHandler = new Mail.BodyCopyHandler(mockMessage, document.getElementById("sandbox"));

        bodyCopyHandler._onContextMenu();
        // with a message that allows "extractContent" the context menu is expected
        tc.isTrue(contextCalled);
        bodyCopyHandler.dispose();

        mockMessage.irmCanExtractContent = false;
        contextCalled = false;
        bodyCopyHandler = new Mail.BodyCopyHandler(mockMessage, document.getElementById("sandbox"));
        bodyCopyHandler._onContextMenu();
        // with a message that prohibits "extractContent" the context menu is not expected
        tc.isFalse(contextCalled);
        bodyCopyHandler.dispose();
        Mail.BodyLinkFlyout.onContextMenu = origContextFunction;
        
    });

    Tx.test("BodyCopyHandler._onCopy", { owner: "joshuala" }, function (tc) {
        var mockMessage = {
            mockedType:Mail.UIDataModel.MailMessage,
            irmCanExtractContent:true
        };
        var BCH = Mail.BodyCopyHandler;
        var sandbox = document.getElementById("sandbox");
        sandbox.innerHTML = '<div id="bodyCopyHandlerSelectionTest">SelectedText</div>'; 
        var selectionDiv = document.getElementById("bodyCopyHandlerSelectionTest");
        var bodyCopyHandler = new BCH(mockMessage, sandbox);
		var range = document.body.createTextRange();
        
        range.moveToElementText(selectionDiv);
        range.select();

        var origClipboard = BCH._getClipboard;
        var cliboardSet = false;
        BCH._getClipboard = function () {
            return {
                setContent: function (content) {
                    cliboardSet = true;
                    // Verify the content being set is the inner text of the selected element
                    tc.areEqual(content.getText(), "SelectedText");
                }
            };
        };
        bodyCopyHandler._onCopy({ preventDefault: Jx.fnEmpty });

        // Verify clipboard has been set
        tc.isTrue(cliboardSet);
        BCH._getClipboard = origClipboard;
        sandbox.innerHTML = "";
    });
})();