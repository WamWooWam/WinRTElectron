
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,People,Mocks,Include,document*/

Include.initializeFileScope(function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var MockDataPackage = function () {
    };
    MockDataPackage.prototype.setHtmlFormat = function (html) {
        this._html = html;
    };
    MockDataPackage.prototype.setText = function (text) {
        this._text = text;
    };
    MockDataPackage.prototype.properties = { title: "" };
    MockDataPackage.prototype.resourceMap = {};

    var MockDataRequest = function () {
        this.data = new MockDataPackage();
    };
    MockDataRequest.prototype.data = null;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    // Test that thumbnail/share title are set, and that the event is marked "handled".
    Tx.test("shareSourceUnitTests.testSharePersonMetadata", function (tc) {
        var provider = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider({});
        var person = provider.loadObject("Person", {
            calculatedUIName: "Test Name",
            userTile: { appdataURI: "http://oeexchange/photos/jerryder.jpg" }
        });

        var eventArgsFromWinRT = { request: new MockDataRequest() };
        var dataRequestedEventArgs = new People.ShareSource.DataRequestedEventArgs(eventArgsFromWinRT);
        People.ShareSource.sharePersonCallback(person, dataRequestedEventArgs);

        tc.isTrue(dataRequestedEventArgs.handled);

        var data = dataRequestedEventArgs.request.data;
        tc.areEqual(data.properties.title, person.calculatedUIName);
        tc.areNotEqual(data.properties.thumbnail, null);
    });

    // Test that a "fully-populated" person gets all its info shared in Text format.
    Tx.test("shareSourceUnitTests.testSharePersonWithAllFields_Text", function (tc) {
        var provider = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider({});
        var person = provider.loadObject("Person", {
            calculatedUIName: "Test Name",
            mostRelevantPhone: "555-555-5555",
            mostRelevantEmail: "fake@fake.biz",
            userTile: { appdataURI: "http://oeexchange/photos/jerryder.jpg" }
        });

        // Injecting a location into the person object itself would be tricky.
        // Luckily, the function we're testing takes location as an arg anyway.
        var location = {
            street: "One Microsoft Way",
            city: "Redmond",
            state: "WA",
            zipCode: "98052",
            country: "United States"
        };

        var request = new MockDataRequest();
        People.ShareSource.sharePersonAsText(person, location, request);

        var textOutput = request.data._text;
        // Verify that the string contains all of the person's properties.
        tc.areNotEqual(textOutput.search(person.calculatedUIName), -1);
        tc.areNotEqual(textOutput.search(person.mostRelevantPhone), -1);
        tc.areNotEqual(textOutput.search(person.mostRelevantEmail), -1);
        tc.areNotEqual(textOutput.search(location.street), -1);
    });

    // Test that a "fully-populated" person gets all its info shared in Html format.
    Tx.test("shareSourceUnitTests.testSharePersonWithAllFields_Html", function (tc) {
        var provider = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider({});
        var person = provider.loadObject("Person", {
            calculatedUIName: "Test Name",
            mostRelevantPhone: "555-555-5555",
            mostRelevantEmail: "fake@fake.biz",
            userTile: { appdataURI: "http://oeexchange/photos/jerryder.jpg" }
        });

        // Injecting a location into the person object itself would be tricky.
        // Luckily, the function we're testing takes location as an arg anyway.
        var location = {
            street: "One Microsoft Way",
            city: "Redmond",
            state: "WA",
            zipCode: "98052",
            country: "United States"
        };

        var request = new MockDataRequest();
        People.ShareSource.sharePersonAsHtml(person, location, request);

        var htmlOutputString = request.data._html;
        // Verify that the string contains all of the person's properties.
        tc.areNotEqual(htmlOutputString.search(person.calculatedUIName), -1);
        tc.areNotEqual(htmlOutputString.search(person.mostRelevantPhone), -1);
        tc.areNotEqual(htmlOutputString.search(person.mostRelevantEmail), -1);
        tc.areNotEqual(htmlOutputString.search(location.street), -1);

        var htmlOutputDOM = document.createElement("body");
        htmlOutputDOM.innerHTML = htmlOutputString;
        // Verify that the DOM contains divs for all of the person's properties.
        tc.areNotEqual(htmlOutputDOM.querySelector("#contactName"), null);
        tc.areNotEqual(htmlOutputDOM.querySelector("#contactPhone"), null);
        tc.areNotEqual(htmlOutputDOM.querySelector("#contactEmail"), null);
        tc.areNotEqual(htmlOutputDOM.querySelector("#contactAddress"), null);
        tc.areNotEqual(htmlOutputDOM.querySelector("#userTile"), null);
    });

    // Verify that a person with no properties (just a name) can be shared without
    // issues and that the HTML representation contains no extraneous elements.
    Tx.test("shareSourceUnitTests.testSharePersonWithMinFields", function (tc) {
        var provider = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider({});
        var person = provider.loadObject("Person", {
            calculatedUIName: "Test Name"
        });

        var eventArgsFromWinRT = { request: new MockDataRequest() };
        var dataRequestedEventArgs = new People.ShareSource.DataRequestedEventArgs(eventArgsFromWinRT);
        People.ShareSource.sharePersonCallback(person, dataRequestedEventArgs);

        var data = dataRequestedEventArgs.request.data;

        var textOutput = data._text;
        // Verify that the string contains one line: the person's name.
        tc.areNotEqual(textOutput.search(person.calculatedUIName), -1);
        var numberOfLines = textOutput.split("\n").length - 1; // Each line ends in \n
        tc.areEqual(numberOfLines, 1);

        var htmlOutputString = data._html;
        var htmlOutputDOM = document.createElement("body");
        htmlOutputDOM.innerHTML = htmlOutputString;
        // Verify that the DOM contains a div for the person's name,
        // and no divs for any other properties.
        tc.areNotEqual(htmlOutputDOM.querySelector("#contactName"), null);
        tc.areEqual(htmlOutputDOM.querySelector("#contactPhone"), null);
        tc.areEqual(htmlOutputDOM.querySelector("#contactEmail"), null);
        tc.areEqual(htmlOutputDOM.querySelector("#contactAddress"), null);
        tc.areEqual(htmlOutputDOM.querySelector("#userTile"), null);
    });
});

