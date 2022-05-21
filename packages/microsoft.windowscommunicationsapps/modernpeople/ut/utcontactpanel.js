
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,Mocks,Microsoft,People,MockJobSet,document,getComputedStyle,Include*/

Include.initializeFileScope(function () {

    var P = People;
    var M = Mocks;
    var Plat = Microsoft.WindowsLive.Platform;

    var parentElement;
    var calls;
    var provider;
    function setup (tc) {
        calls = new M.CallVerifier(tc);

        provider = new M.Microsoft.WindowsLive.Platform.Data.JsonProvider();
        provider.loadData({
            Account: {
                'connected': [
                    { objectId: "AccountA", displayName: "Account Name A", sourceId: "TWITR", meContact: { calculatedUIName: "my name", verbs: [{ verbType: Plat.VerbType.profile, url: "http://twitter.com"}] }, mock$configureType: Plat.ConfigureType.editOnWeb, canDelete: true, peopleScenarioState: Plat.ScenarioState.connected  },
                    { objectId: "AccountB", displayName: "Account Name B" },
                    { objectId: "AccountC", displayName: "Account Name C" },
                    { objectId: "AccountD", displayName: "" }
                ]
            }
        });

        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);

        Jx.res.oldGetString = Jx.res.getString;
        Jx.res.oldLoadCompoundString = Jx.res.loadCompoundString;
        Jx.res.getString = function (name) { return "UT" + name; };
        Jx.res.loadCompoundString = function () { return Array.prototype.slice.call(arguments, 1).join(","); };

        Jx.oldAppData = Jx.appData;
        Jx.appData = new Jx.AppData();

        Jx.oldBici = Jx.bici;
        Jx.bici = new Jx.Bici();

        Jx.oldApp = Jx.app;
        Jx.app = { getEnvironment: function () { } };
    }

    function cleanup () {
        if (parentElement) {
            document.body.removeChild(parentElement);
            parentElement = null;
        }

        calls = null;

        Jx.res.getString = Jx.res.oldGetString;
        Jx.res.loadCompoundString = Jx.res.oldLoadCompoundString;

        Jx.appData.dispose();
        Jx.appData = Jx.oldAppData;
        Jx.bici.endExperience();
        Jx.bici = Jx.oldBici;
        Jx.app = Jx.oldApp;
    }


    function createPanel(person) {
        var host = {
            getJobSet: function () { return new MockJobSet(); },
            getPlatform: function () { return provider.getClient(); },
            getCommandBar: function () {
                return {
                    addCommand: function () { },
                    updateCommand: function () { },
                    refresh: function () { }
                };
            },
            getNavBar: function () { },
            getLayout: function () {
                return {
                    getLayoutState: function () { return "full"; }
                };
            }
        };
        var panel = new P.ContactPanel(host, person);
        parentElement.innerHTML = panel.getUI();
        panel.activateUI(parentElement);
        panel.ready();
        return panel;
    }

    Tx.test("contactPanelTests.testEmail", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Create a panel with no contacts
        var person = provider.loadObject("Person", { });
        var panel = createPanel(person);
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#emailCommand")).display);
        tc.areNotEqual(null, parentElement.querySelector(".profileLanding-contact"));

        // Add a mostRelevantEmail to no effect
        person.mock$setProperty("mostRelevantEmail", "email1@test.com");
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#emailCommand")).display);

        // Add a contact to no effect
        person.linkedContacts.mock$addItem(provider.loadObject("Contact", { }), 0);
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#emailCommand")).display);

        // Add an email address to that contact
        person.linkedContacts.item(0).mock$setProperty("personalEmailAddress", "email2@test.com");
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand")).display);
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#emailCommand .contactCommand-disambiguator")).display);
        tc.areEqual("email2@test.com", parentElement.querySelector("#emailCommand .contactCommand-value").innerText);

        // Add a duplicate email address to no effect
        person.linkedContacts.item(0).mock$setProperty("businessEmailAddress", "email2@test.com");
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand")).display);
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#emailCommand .contactCommand-disambiguator")).display);
        tc.areEqual("email2@test.com", parentElement.querySelector("#emailCommand .contactCommand-value").innerText);

        // Set a non-duplicate email address, disambiguator appears
        person.linkedContacts.item(0).mock$setProperty("businessEmailAddress", "email3@test.com");
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand")).display);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand .contactCommand-disambiguator")).display);
        tc.areEqual("email2@test.com", parentElement.querySelector("#emailCommand .contactCommand-value").innerText);

        // Add another contact
        person.linkedContacts.mock$addItem(provider.loadObject("Contact", { }), 1);
        person.linkedContacts.item(1).mock$setProperty("windowsLiveEmailAddress", "email4@test.com");
        person.linkedContacts.item(1).mock$setProperty("otherEmailAddress", "email1@test.com");
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand")).display);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand .contactCommand-disambiguator")).display);
        tc.areEqual("email2@test.com", parentElement.querySelector("#emailCommand .contactCommand-value").innerText);

        // Delete a contact
        person.linkedContacts.mock$removeItem(0);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand")).display);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand .contactCommand-disambiguator")).display);
        tc.areEqual("email1@test.com", parentElement.querySelector("#emailCommand .contactCommand-value").innerText);

        // Remove an email address, disambiguator disappears
        person.linkedContacts.item(0).mock$setProperty("otherEmailAddress", "");
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand")).display);
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#emailCommand .contactCommand-disambiguator")).display);
        tc.areEqual("email4@test.com", parentElement.querySelector("#emailCommand .contactCommand-value").innerText);

        // Remove the last email, command disappears
        person.linkedContacts.item(0).mock$setProperty("windowsLiveEmailAddress", "");
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#emailCommand")).display);
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#emailCommand .contactCommand-disambiguator")).display);
        panel.deactivateUI();

        // Create a panel with values already, verify mostRelevantEmail works
        person = provider.loadObject("Person", {
            mostRelevantEmail: "a@test.com",
            linkedContacts: [{
                windowsLiveEmailAddress: "b@test.com",
                personalEmailAddress: "c@test.com"
            }, {
                personalEmailAddress: "a@test.com",
                businessEmailAddress: "d@test.com"
            }]
        });
        panel = createPanel(person);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand")).display);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand .contactCommand-disambiguator")).display);
        tc.areEqual("a@test.com", parentElement.querySelector("#emailCommand .contactCommand-value").innerText);

        // Verify the MRU is loaded from settings
        Jx.appData.localSettings().container("People").container("LandingPageMRU").container("TestPersonId").set("email", "mailto:mru@test.com");
        person = provider.loadObject("Person", {
            objectId: "TestPersonId",
            mostRelevantEmail: "mostRelevant@test.com",
            linkedContacts: [{
                windowsLiveEmailAddress: "other@test.com",
                personalEmailAddress: "mru@test.com"
            }, {
                personalEmailAddress: "other2@test.com",
                businessEmailAddress: "mostRelevant@test.com"
            }]
        });
        panel = createPanel(person);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand")).display);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand .contactCommand-disambiguator")).display);
        tc.areEqual("mru@test.com", parentElement.querySelector("#emailCommand .contactCommand-value").innerText);

        // Removing the MRU value falls back to most relevant
        person.linkedContacts.item(0).mock$setProperty("personalEmailAddress", "");
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand")).display);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand .contactCommand-disambiguator")).display);
        tc.areEqual("mostRelevant@test.com", parentElement.querySelector("#emailCommand .contactCommand-value").innerText);

        // Adding the MRU value back does nothing
        person.linkedContacts.item(1).mock$setProperty("otherEmailAddress", "mru@test.com");
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand")).display);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand .contactCommand-disambiguator")).display);
        tc.areEqual("mostRelevant@test.com", parentElement.querySelector("#emailCommand .contactCommand-value").innerText);
        
        // Changing the MRU does nothing
        person.mock$setProperty("mostRelevantEmail", "other2@test.com");
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand")).display);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand .contactCommand-disambiguator")).display);
        tc.areEqual("mostRelevant@test.com", parentElement.querySelector("#emailCommand .contactCommand-value").innerText);

        // Removing the currently shown value picks up the MRU
        person.linkedContacts.item(1).mock$setProperty("businessEmailAddress", "notrelevant@test.com");
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand")).display);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#emailCommand .contactCommand-disambiguator")).display);
        tc.areEqual("mru@test.com", parentElement.querySelector("#emailCommand .contactCommand-value").innerText);
        panel.deactivateUI();
    });
    
    Tx.test("contactPanelTests.testChat", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Create a panel with no IMable contacts
        var account = provider.loadObject("Account", { sourceId: "SKYPE", displayName: "Skype" });
        var person = provider.loadObject("Person", { 
            objectId: "TestPersonId",
            linkedContacts: [{
                thirdPartyObjectId: "abc",
                imType: Plat.ContactIMType.none,
                onlineStatus: Plat.ContactStatus.offline
            }] 
        });
        var panel = createPanel(person);
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#chatCommand")).display);

        // Add an mobile phone
        person.linkedContacts.item(0).mock$setProperty("mobilePhoneNumber", "8828080");
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#chatCommand")).display);
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#chatCommand .contactCommand-disambiguator")).display);
        tc.areNotEqual(-1, parentElement.querySelector("#chatCommand .contactCommand-value").innerText.indexOf("8828080"));

        // Set up an IMable contact
        person.linkedContacts.item(0).mock$setProperty("imType", Plat.ContactIMType.skype);
        person.linkedContacts.item(0).mock$setProperty("account", account);
        person.linkedContacts.item(0).mock$setProperty("mainMri", "mri0");
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#chatCommand")).display);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#chatCommand .contactCommand-disambiguator")).display);

        // Remove the mobile phone
        person.linkedContacts.item(0).mock$setProperty("mobilePhoneNumber", "");
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#chatCommand")).display);
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#chatCommand .contactCommand-disambiguator")).display);
        var value = parentElement.querySelector("#chatCommand .contactCommand-value").innerText;
        tc.areNotEqual(-1, value.indexOf("Skype"));

        panel.deactivateUI();
    });

    Tx.test("contactPanelTests.testVideoCall", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var person = provider.loadObject("Person", { linkedContacts: [{
            imType: Plat.ContactIMType.none,
            thirdPartyObjectId: "abc",
            account: provider.loadObject("Account", {
                sourceId: "SKYPE",
                displayName: "Skype"
            })
        }] });
        var panel = createPanel(person);

        // Button is missing for most contacts
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#videoCallCommand")).display);

        // But visible for skype contacts
        person.linkedContacts.item(0).mock$setProperty("imType", Plat.ContactIMType.skype);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#videoCallCommand")).display);
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#videoCallCommand .contactCommand-disambiguator")).display);

        panel.deactivateUI();
    });
 
    Tx.test("contactPanelTests.testCall", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var person = provider.loadObject("Person", { linkedContacts: [{
            homePhoneNumber: "425-000-0000",
            mobilePhoneNumber: "888-9990000"
        }] });
        var panel = createPanel(person);

        person.mock$setProperty("mostRelevantPhone", "888-9990000");

        // The panel selects the best phone number based on mostRelevantPhone.
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#callCommand")).display);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#callCommand .contactCommand-disambiguator")).display);
        tc.areNotEqual(-1, parentElement.querySelector("#callCommand .contactCommand-value").innerText.indexOf("888-9990000"));

        // Delete a number. The selection is updated.
        person.linkedContacts.item(0).mock$setProperty("mobilePhoneNumber", "");
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#callCommand")).display);
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#callCommand .contactCommand-disambiguator")).display);
        tc.areNotEqual(-1, parentElement.querySelector("#callCommand .contactCommand-value").innerText.indexOf("425-000-0000"));

        // Down to no number
        person.linkedContacts.item(0).mock$setProperty("homePhoneNumber", "");
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#callCommand")).display);

        // Change to a skype account
        person.linkedContacts.item(0).mock$setProperty("thirdPartyObjectId", "skypeuser");
        person.linkedContacts.item(0).mock$setProperty("account", provider.loadObject("Account", { sourceId: "SKYPE", displayName: "Skype" }));
        person.linkedContacts.item(0).mock$setProperty("imType", Plat.ContactIMType.skype);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#callCommand")).display);
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#callCommand .contactCommand-disambiguator")).display);
        tc.areNotEqual(-1, parentElement.querySelector("#callCommand .contactCommand-value").innerText.indexOf("Skype"));

        // Add a phone number back
        person.mock$setProperty("mostRelevantPhone", "12345");
        person.linkedContacts.item(0).mock$setProperty("homePhoneNumber", "12345");
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#callCommand")).display);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#callCommand .contactCommand-disambiguator")).display);
        tc.areNotEqual(-1, parentElement.querySelector("#callCommand .contactCommand-value").innerText.indexOf("Skype"));

        panel.deactivateUI();
    });

    Tx.test("contactPanelTests.testMap", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var emptyLocation = { street: "", city: "", state: "", zipCode: "", country: "" };
        var person = provider.loadObject("Person", { linkedContacts: [{
            homeLocation: { city: "Redmond", state: "WA" },
            otherLocation: { zipCode: "98052" }
        }, {
            homeLocation: { street: "123 Fake Street" },
            businessLocation: { street: "1 Redmond Way", city: "Redmond", state: "Washington", zipCode: "98052" }
        }] });
        var panel = createPanel(person);

        // The panel selects the best address from the 2nd contact.
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#mapCommand")).display);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#mapCommand .contactCommand-disambiguator")).display);
        tc.areEqual("1 Redmond Way", parentElement.querySelector("#mapCommand .contactCommand-value").innerText);

        // Delete an address to check dedupe across contacts and types
        person.linkedContacts.item(1).mock$setProperty("homeLocation", emptyLocation);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#mapCommand")).display);
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#mapCommand .contactCommand-disambiguator")).display);
        tc.areEqual("1 Redmond Way", parentElement.querySelector("#mapCommand .contactCommand-value").innerText);

        // Drop the second contact, the two other addresses are no longer dupes
        person.linkedContacts.mock$removeItem(1);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#mapCommand")).display);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#mapCommand .contactCommand-disambiguator")).display);
        tc.areEqual("Redmond", parentElement.querySelector("#mapCommand .contactCommand-value").innerText);

        // Back to one address
        person.linkedContacts.item(0).mock$setProperty("homeLocation", emptyLocation);
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#mapCommand")).display);
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#mapCommand .contactCommand-disambiguator")).display);
        tc.areEqual("98052", parentElement.querySelector("#mapCommand .contactCommand-value").innerText);

        // Down to no addresses
        person.linkedContacts.item(0).mock$setProperty("otherLocation", emptyLocation);
        tc.areEqual("none", getComputedStyle(parentElement.querySelector("#mapCommand")).display);

        panel.deactivateUI();
    });

    Tx.test("contactPanelTests.testMe", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Create the panel with the me contact
        var me = provider.loadObject("MeContact", {
            calculatedUIName: "My Name",
            personalEmailAddress: "test@test.com"
        });
        me.linkedContacts.mock$addItem(me, 0);
        var panel = createPanel(me);

        // Verify the IC is present and the commands are not
        tc.areNotEqual(-1, parentElement.innerHTML.indexOf("My Name"));
        tc.areEqual(-1, parentElement.innerHTML.indexOf("test@test.com"));
        tc.areEqual("block", getComputedStyle(parentElement.querySelector("#allInfoCommand")).display);
        tc.areEqual(null, parentElement.querySelector("#emailCommand"));
        tc.areEqual(null, parentElement.querySelector("#chatCommand"));
        tc.areEqual(null, parentElement.querySelector("#mapCommand"));

        panel.deactivateUI();
    });
});
