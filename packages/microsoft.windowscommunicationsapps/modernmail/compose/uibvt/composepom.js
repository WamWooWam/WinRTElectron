
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global $, TestAddressWell */

// Actions available from Compose
Jx.delayDefine(self, "ComposePom", function () {
    // Constructor
    ComposePom = function () { };

    // Get properties
    ComposePom.prototype = {
        get window() { return $(".composeWindow")[0]; },
        get newButton() { return $(".mailReadingPaneComposeButton")[0]; },
        get toLine() { return new TestAddressWell("#toAWC"); },
        get ccLine() { return new TestAddressWell("#ccAWC"); },
        get bccLine() { return new TestAddressWell("#bccAWC"); },
        get subject() { return $(".composeSubjectLine")[0]; },
        get more() { return $(".cmdDetails")[0]; },
        get priority() { return $(".composePriorityField")[0]; },
        get permission() { return $(".composeIrmField")[0]; },
        get send() { return $(".cmdSend")[0]; },
        get deleteButton() { return $(".cmdDelete")[0]; },
        get save() { return $("#save")[0]; }
    };
});
