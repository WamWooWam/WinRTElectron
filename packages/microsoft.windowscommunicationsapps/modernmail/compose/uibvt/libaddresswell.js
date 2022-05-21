
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global $, WinJS, BVT */

// AddressWell library
Jx.delayDefine(self, "TestAddressWell", function () {
    // Constructor
    TestAddressWell = function (identifier) {
        this.id = identifier;
        this.inputField = $("[id$=IF]", this.id)[0];
    };
    var proto = TestAddressWell.prototype;

    //Adds the recipient to the address well. Recipient can be a single string or an array of strings.
    proto.addRecipient = function (recipient) {
        return new WinJS.Promise(function (complete /*, error, progress*/) {
            BVT.marks.once("AddressWell.Input.addRecipientsByString,StopTA,AddressWell", function () {
                complete();
            });

            // Join array into a delimited string. This is more reliable than adding sequentially
            if (recipient instanceof Array) {
                recipient = recipient.join(";");
            }

            // add the name and change focus such that the name resolves
            $(this.id)[0].focus();
            this.inputField.value = recipient;
            $(this.id)[0].blur();
        }.bind(this));
    };

    // Get the current list of recipients
    proto.recipients = function () {
        var recipients = $("#awRecipientName", this.id);
        var addresses = [];
        for (var i = 0; i < recipients.length; i++) {
            addresses.push(recipients[i].innerText);
        }
        return addresses;
    };

    // Empty the address well
    proto.clearRecipients = function () {
        $("#[id$=L]", this.id)[0].innerText = "";
    };
});
