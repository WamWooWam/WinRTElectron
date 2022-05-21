
(function () {
    var D = window.Mocks.Microsoft.WindowsLive.Platform.Data;
    var J = window.Jx;
    var P = window.People;

    // The data platform.
    var platformCache = null;

    // List of network for the fake data set.
    var networks = [
        { objectId: "network1", sourceId: "WL", name: "Windows Live", PSARank: 0, authToken: "[{\"target\":\"messengerweb.live.com\",\"ticket\":\"t=EwDwARAnAAAUWkziSC7RbDJKS1VkhugDegv7L0eAAOcGRc+sHXZ/XZoBC7pl4R7f/2oXrzoWESThsw67MGBz6VTdbSDFR0P6ptD7oWWLzBKwelsi8P43G8fY9HY1A2592iPBh4+iKlLE8D1ZfMQ6ds0JZPXfaSf26Bzjb1Xr3+UKt0kDg819rbaxNRLk8iwmfBS8E84QCPcPCLRO5vEiA2YAAAgl33URf3qQ00ABnIqdGkJ7VY0Qo22Yr51KnJHTD8AE8cTTJTXPi3SbEY+GT1jNx+qemwVprHXvHiXUPgAJVtHBbz7B5dubcYrg0gel6GspC0aRs6RdOwIW9u/OLTk2dgwHibtiRjfm4ce+TrBI7YNF0dkJNMtVLBU1mUreOduf2SjbDnJ3VMCpH4PaVAa5/AtlBnOpvmk8Gl8lIH1XSH+5HEd8q87f0B7A9qs/qwRobwkD2k8/Utaawufna0LVwQGUtfBbzDHBZvwaoSGsYeEi/Xl7G5YaDKyP5vzWJIONegzJx45SMroT4TcjZay4gF3HU4gPdVsoZTidiyblQ1cfIXTsCnyQ6e4Hg3ujbC3xDPsR9+SlzH3WGO2Xk72qph2JhAZPcBRswp/PAlgvg83nx7NnnrSzAsWyY51Jv3AdX+lgUs+EH3JXIg5jAQ==&p=\",\"expires\":\"2011-04-16T04:38:41.000Z\",\"error\":null},{\"target\":\"sup.live.com\",\"ticket\":\"t=EwCgAebpAwAUN+MQ7lJ3VIWKMxBsBNLPe+vUtzmAAGO+cVvgtZxDsJ7SARtMYkafi25OcwlxBL1v1zqQ2fsKLc/3IHN078eb/qFS0t6EXb6uSELYcej74DGP7eNwY9MBQ9ChLIgVpFkxks+Vh/jnDghvl+J2xsA1B7MvHrwRC0jiO0bWPmXje+IoxhniSckql5RzK4GNmjnNXTzqEKAFA2YAAAhr8cV1jFGzSPAAlZO0TPz/ZgYg2940KIa1HE+CjteKX9P7qoDWH67Xz8ngkBLQMhzKlZtKxqmHh8gjGUNYVx6xi1ZT3MtTtnFMG7R/KjaCuZw1dCeEvH8opCx7UG/2rVCAhO4r8vJ70qMowHeGz+zXZjCtM9QTZ4EF79XPMmPX7RZfKzHSti1lx4/rS6symsz/Y7G6Aey94srOWaH94LOTogufaxY8BiOyVeoIlwIBrYxziICSFKbWwXhAyO1lj4EpQ5FJ1KD3Do3BMxYGLtAoRzKfRD8Mo+us5vG+PLaVFn1MOHc1DtRLpJ5xUuhREGCqUBQLIKaU3U2xJwE=&p=\",\"expires\":\"2011-04-16T04:38:41.000Z\",\"error\":null}]" },
        { objectId: "network2", sourceId: "FB", name: "Facebook", PSARank: 0, authToken: "FB_Token" }
    ];

    var signedInUser = {
        displayName: "Kyle Farnung",
        isDefault: true,
        meContact: {
            objectId: "person0",
            calculatedUIName: "Kyle Farnung",
            firstName: "Kyle",
            lastName: "Farnung",
            userTile: { objectId: "userTile0.1", appdataURI: "http://example.com/user1.png" },
            linkedContacts: [
                {
                    firstName: "Kyle",
                    lastName: "Farnung",
                    nickname: "",
                    cid: { value: "-93848218903470234" },
                    objectId: "-93848218903470234",
                    network: networks[0]
                },
                {
                    firstName: "Kyle",
                    lastName: "Farnung",
                    nickname: "",
                    objectId: "37473282232111",
                    thirdPartyObjectId: "37473282232111",
                    network: networks[1]
                }
            ]
        }
    };

    var friends = [
        { objectId: "person3", calculatedUIName: "Anthony Johnson", firstName: "Anthony", lastName: "Johnson", linkedContacts: [
                { firstName: "Anthony", lastName: "Johnson", nickname: "", userTile: { objectId: "userTile3.1", appdataURI: "http://example.com/tile1.png" }, objectId: "55245642888", thirdPartyObjectId: "55245642888", network: networks[1] }
            ], userTile: "userTile3.1"
        },
        { objectId: "person1", calculatedUIName: "Bob Smith", firstName: "Bob", lastName: "Smith", linkedContacts: [
                { firstName: "Bob", lastName: "Smith", nickname: "", userTile: { objectId: "userTile1.1", appdataURI: "http://example.com/tile.png" }, cid: { value: "47383847384738" }, objectId: "47383847384738", personalEmailAddress: "bob.smith@example.com", network: networks[0] }
            ], userTile: "userTile1.1"
        },
        { objectId: "person2", calculatedUIName: "Siebe Tolsma", firstName: "Siebe", lastName: "Tolsma", linkedContacts: [
                { firstName: "Siebe", lastName: "Tolsma", nickname: "", userTile: { objectId: "userTile2.1", appdataURI: "http://example.com/siebe.png" }, cid: { value: "2345234699874" }, objectId: "2345234699874", personalEmailAddress: "siebe.tolsma@example.com", network: networks[0] },
                { firstName: "Siebe", lastName: "Tolsma", nickname: "", userTile: { objectId: "userTile2.2", appdataURI: "http://example.com/siebe2.png" }, objectId: "9328403804983", thirdPartyObjectId: "9328403804983", network: networks[1] }
            ], userTile: "userTile2.1"
        },
        { objectId: "person4", calculatedUIName: "Ronald McDonald", firstName: "Ronald", lastName: "McDonald", linkedContacts: [
                { firstName: "Ronald", lastName: "McDonald", nickname: "", cid: { value: "32934803280934" }, objectId: "32934803280934", personalEmailAddress: "ronald.mcdonald@example.com", network: networks[0] }
            ]
        }
    ];

    // Creates the fake data set.
    function makeFakeDataSet() {
        var data = {};
        data.Account = {};
        data.Account["default"] = [signedInUser];

        var meContact = JSON.parse(JSON.stringify(signedInUser.meContact));
        meContact.objectId = "meContact";
        meContact.thirdPartyObjectId = "meContact";

        data.Person = {};
        data.Person["nameBetween_A_true_B_false"] = [friends[0]];
        data.Person["nameBetween_B_true_C_false"] = [friends[1]];
        data.Person["nameBetween_S_true_T_false"] = [friends[2]];

        function addQueries(person) {
            var linkedContacts = person.linkedContacts;

            for (var j = 0; j < linkedContacts.length; j++) {
                if (linkedContacts[j].cid) {
                    data.Person["byCid_" + linkedContacts[j].cid.value] = [person];
                }

                if (linkedContacts[j].network && linkedContacts[j].objectId) {
                    data.Person["bySourceIdAndObjectId_" + linkedContacts[j].network.sourceId + "_" + linkedContacts[j].objectId] = [person];
                }
            }
        }

        addQueries(signedInUser.meContact);

        for (var i = 0; i < friends.length; i++) {
            addQueries(friends[i]);
        }

        return new D.JsonProvider(data);
    }

    // Mock out the missing CpMain stuff.
    if (!J.root) {
        J.root = {};
    }

    if (!J.root.getPlatform) {
        J.root.getPlatform = function () {
            return this.getPlatformCache().getPlatform();
        };
    }

    if (!J.root.getPlatformCache) {
        J.root.getPlatformCache = function () {
            if (platformCache == null) {
                People.FetchContacts = function () { };
                platformCache = new People.PlatformCache(makeFakeDataSet().getClient(), new MockJobSet());
            }
            return platformCache;
        };
    }

    if (!J.root.getJobSet) {
        J.root.getJobSet = function () {
            return new MockJobSet();
        }
    }

    Jx.app = Jx.app || {};
    Jx.app.getEnvironment = Jx.app.getEnvironment || function() { return 'INT'; };
})();
