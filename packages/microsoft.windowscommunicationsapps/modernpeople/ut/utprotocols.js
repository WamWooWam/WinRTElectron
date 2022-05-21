
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Mocks,Microsoft,Windows,window,Include*/

Include.initializeFileScope(function () {

    var P = window.People,
        D = Mocks.Microsoft.WindowsLive.Platform.Data,
        ContactIMType = Microsoft.WindowsLive.Platform.ContactIMType;

    function verifyProtocol(tc, protocol1, protocol2) {
        tc.areEqual(protocol1.verb, protocol2.verb);
        tc.areEqual(protocol1.contact.sourceId || "", protocol2.contact.sourceId || "");
        tc.areEqual(protocol1.contact.identifier || "", protocol2.contact.identifier || "");
        tc.areEqual(protocol1.contact.email || "", protocol2.contact.email || "");
        tc.areEqual(protocol1.contact.phoneNumber || "", protocol2.contact.phoneNumber || "");
    }

    Tx.test("protocolTests.testProtocols", function (tc) {
        var tests = [
            { url: "tel:12345", verb: "tel", contact: { phoneNumber: "12345" }, mri: "" },
            { url: "message-skype-com:skyper", verb: "message", contact: { sourceId: "SKYPE", identifier: "skyper" }, mri: "8:skyper" },
            { url: "message-yahoo-com:some@yahoo.com", verb: "message", contact: { sourceId: "YAHOO", identifier: "some@yahoo.com" }, mri: "32:some@yahoo.com" },
            { url: "profile-messenger:stilla@live.com", verb: "profile", contact: { sourceId: "WL", identifier: "stilla@live.com" }, mri: "1:stilla@live.com" },
            { url: "videocall-skype-com:skyper", verb: "videocall", contact: { sourceId: "SKYPE", identifier: "skyper" }, mri: "8:skyper" },
            { url: "audiocall-lync-com:lync-contact", verb: "audiocall", contact: { sourceId: "LYNC", identifier: "lync-contact" }, mri: "2:lync-contact" },
            { url: "mailto:me@me.com", verb: "mailto", contact: { email: "me@me.com" }, mri: "" },
            { url: "sms:+14258828080", verb: "sms", contact: { phoneNumber: "+14258828080" }, mri: "" },
            { url: "message-skype-com:live:someone@hotmail.com", verb: "message", contact: { sourceId: "SKYPE", identifier: "live:someone@hotmail.com" }, mri: "8:live:someone@hotmail.com" },
            { url: "message-skype-com:%3F%23:+@().%25%2F%5C%E3%82%A0%D8%A3", verb: "message", contact: { sourceId: "SKYPE", identifier: "?#:+@().%/\\\u30a0\u0623" }, mri: "8:?#:+@().%/\\\u30a0\u0623" }
        ];

        tests.forEach(function (test) {
            var parsedProtocol = P.Protocol.fromUri(new Windows.Foundation.Uri(test.url));
            verifyProtocol(tc, parsedProtocol, test);

            var createdProtocol = P.Protocol.create(test.verb, test.contact);
            verifyProtocol(tc, createdProtocol, test);

            tc.areEqual(parsedProtocol.toUrl(), test.url);
            tc.areEqual(createdProtocol.toUrl(), test.url);

            tc.areEqual(parsedProtocol.toMri(), test.mri);
            tc.areEqual(createdProtocol.toMri(), test.mri);
        });
    });

    Tx.test("protocolTests.testInvalidUrls", function (tc) {
        var badUrls = [
            "profile-nobody-com:test",
            "message:",
            "tel-skype-com:12345",
            "message-messenger://spivey@live.com",
            "profile-facebook-com:"
        ];
        badUrls.forEach(function (badUrl) {
            tc.isFalse(P.Protocol.fromUri(new Windows.Foundation.Uri(badUrl)).isValid());
        });
    });

    Tx.test("protocolTests.testContacts", function (tc) {
        var prov = new D.JsonProvider({
            "Person": {
                "all": [{
                    objectId: "PersonA", linkedContacts: [
                        { objectId: "ContactA1", thirdPartyObjectId: "ABCD", account: { sourceId: "TWITR" } },
                        { objectId: "ContactA2", thirdPartyObjectId: "skyper", account: { sourceId: "SKYPE" } }
                    ]
                },{
                    objectId: "PersonB", linkedContacts: [
                        { objectId: "ContactB1", thirdPartyObjectId: "XYZ", account: { sourceId: "SKYPE" } },
                        { objectId: "ContactB2", thirdPartyObjectId: "skyper2", account: { sourceId: "SKYPE" } }
                    ]
                },{
                    objectId: "PersonC", linkedContacts: [
                        { objectId: "ContactC1", thirdPartyObjectId: "2:00000-0000-0000", account: { sourceId: "ABCH" } }
                    ]
                },{
                    objectId: "PersonD", linkedContacts: [
                        { objectId: "ContactD1", thirdPartyObjectId: "@T#%", account: { sourceId: "????" } }
                    ]
                },{
                    objectId: "PersonE", linkedContacts: [
                        { objectId: "ContactE1", mainMri: "1:someone@live.com", imType: ContactIMType.windowsLive, windowsLiveEmailAddress: "someone@live.com", account: { sourceId: "WL" } }
                    ]
                },{
                    objectId: "PersonF", linkedContacts: [
                        { objectId: "ContactF1", mainMri: "32:someone@yahoo.com", imType: ContactIMType.yahoo, yahooEmailAddress: "someone@yahoo.com", account: { sourceId: "WL" } }
                    ]
                },{
                    objectId: "PersonG", linkedContacts: [
                        { objectId: "ContactG1", mainMri: "2:someone@microsoft.com", imType: ContactIMType.office, federatedEmailAddress: "someone@microsoft.com", account: { sourceId: "ABCH" } }
                    ]
                },{
                    objectId: "PersonH", linkedContacts: [
                        { objectId: "ContactH1", thirdPartyObjectId: "EFGH", account: { sourceId: "TWITR" } }
                    ]
                }]
            }
        }, D.MethodHandlers);
        var platform = prov.getClient();
        
        var tests = [
            { verb: "profile", contact: "ContactA1", uri: "profile-twitter-com:ABCD" },
            { verb: "message", contact: "ContactA2", uri: "message-skype-com:skyper" },
            { verb: "videocall", contact: "ContactB1", uri: "videocall-skype-com:XYZ" },
            { verb: "audiocall", contact: "ContactB2", uri: "audiocall-skype-com:skyper2" },
            { verb: "profile", contact: "ContactC1", uri: "profile-outlook-com:2:00000-0000-0000" },
            { verb: "profile", contact: "ContactD1", uri: "" },
            { verb: "profile", contact: "ContactE1", uri: "profile-messenger:someone@live.com" },
            { verb: "profile", contact: "ContactF1", uri: "profile-yahoo-com:someone@yahoo.com" },
            { verb: "profile", contact: "ContactG1", uri: "profile-lync-com:someone@microsoft.com" },
            { verb: "profile", contact: "ContactH1", uri: "profile-twitter-com:EFGH" },
            { verb: "profile", contact: "", uri: "profile-facebook-com:QQQQ" },
            { verb: "profile", contact: "", uri: "profile-messenger:nobody@live.com" }
        ];
        tests.forEach(function (test) {
            var contact = test.contact ? prov.getObjectById(test.contact) : null;
            if (test.contact) {
                var createdProtocol = P.Protocol.createFromContact(test.verb, contact);
                var uri = createdProtocol.toUrl();
                tc.areEqual(test.uri, uri);
            }

            if (test.uri) {
                var parsedProtocol = P.Protocol.fromUri(new Windows.Foundation.Uri(test.uri));
                var person = parsedProtocol.toPerson(platform);
                var expectedPerson = (test.contact && test.uri) ? contact.person : null;
                tc.areEqual(expectedPerson, person);
            }
        });
    });
});