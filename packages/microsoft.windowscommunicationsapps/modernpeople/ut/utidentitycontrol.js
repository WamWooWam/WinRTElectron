
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,People,Mocks,Microsoft,document,Include,MockJobSet,getComputedStyle*/

Include.initializeFileScope(function () {
    
    function setup(tc) {
        var fadeOut = WinJS.UI.Animation.fadeOut;
        WinJS.UI.Animation.fadeOut = function () { return WinJS.Promise.as(); };
        tc.cleanup = function () {
            WinJS.UI.Animation.fadeOut = this._fadeOut;
        };
    };

    Tx.test("identityControlTests.testCreation", function (tc) {
        setup(tc);
        var provider = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider({});
        var person = provider.loadObject("Person", {
            calculatedUIName: "Test Name",
            userTile: { appdataURI: "http://oeexchange/photos/jerryder.jpg" }
        });
        var jobSet = new MockJobSet();

        var rootElement = document.createElement("div");

        // Create an IC with a few children
        var ic = new People.IdentityControl(person, jobSet);
        rootElement.insertAdjacentHTML("beforeEnd", ic.getUI(People.IdentityElements.Name, { className: "testNameElement" }) + "</div>");
        rootElement.insertAdjacentHTML("beforeEnd", ic.getUI(People.IdentityElements.Tile, { className: "testTileElement" }));
        ic.activateUI(rootElement);

        // Verify that the data was properly set
        tc.areEqual("Test Name", rootElement.querySelector(".testNameElement").innerText);
        tc.areEqual("url(\"http://oeexchange/photos/jerryder.jpg\")", getComputedStyle(rootElement.querySelector(".testTileElement")).backgroundImage);

        ic.shutdownUI();
    });

    Tx.test("identityControlTests.testUpdates", function (tc) {
        setup(tc);
        var provider = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider({});
        var person = provider.loadObject("Person", {
            calculatedUIName: "First Name",
            userTile: { appdataURI: "http://oeexchange/photos/neilpa.jpg" }
        });
        var jobSet = new MockJobSet();

        var rootElement = document.createElement("div");

        // Create a Tile IC
        var ic = new People.IdentityControl(person, jobSet);
        rootElement.innerHTML = ic.getUI(People.IdentityElements.TileLayout);
        ic.activateUI(rootElement);

        // Verify that the data was properly set
        tc.areEqual("First Name", rootElement.querySelector(".ic-name").innerText);
        tc.areEqual("url(\"http://oeexchange/photos/neilpa.jpg\")", getComputedStyle(rootElement.querySelector(".ic-tile")).backgroundImage);

        // Change some properties and make sure the UI updates
        person.mock$setProperty("calculatedUIName", "Second Name");
        tc.areEqual("Second Name", rootElement.querySelector(".ic-name").innerText);
        person.userTile.mock$setProperty("appdataURI", "http://oeexchange/photos/jspivey.jpg");
        tc.areEqual("url(\"http://oeexchange/photos/jspivey.jpg\")", getComputedStyle(rootElement.querySelector(".ic-tile")).backgroundImage);

        // Change them again
        person.mock$setProperty("calculatedUIName", "Third Name");
        tc.areEqual("Third Name", rootElement.querySelector(".ic-name").innerText);
        person.userTile.mock$setProperty("appdataURI", "http://oeexchange/photos/jwatson.jpg");
        tc.areEqual("url(\"http://oeexchange/photos/jwatson.jpg\")", getComputedStyle(rootElement.querySelector(".ic-tile")).backgroundImage);

        ic.shutdownUI();

        // Updates are ignored after shutdown
        person.mock$setProperty("calculatedUIName", "Fourth Name");
        tc.areEqual("Third Name", rootElement.querySelector(".ic-name").innerText);
        person.userTile.mock$setProperty("appdataURI", "http://oeexchange/photos/hlin.jpg");
        tc.areEqual("url(\"http://oeexchange/photos/jwatson.jpg\")", getComputedStyle(rootElement.querySelector(".ic-tile")).backgroundImage);
    });

    Tx.test("identityControlTests.testRecycle", function (tc) {
        setup(tc);
        var provider = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider({});
        var personA = provider.loadObject("Person", {
            calculatedUIName: "Person A",
            userTile: { appdataURI: "http://oeexchange/photos/mfarns.jpg" }
        });
        var jobSet = new MockJobSet();

        var rootElement = document.createElement("div");

        // Create a Billboard IC
        var ic = new People.IdentityControl(personA, jobSet);
        rootElement.innerHTML = ic.getUI(People.IdentityElements.BillboardLayout);
        ic.activateUI(rootElement);

        // Verify that the data was properly set
        tc.areEqual("Person A", rootElement.querySelector(".ic-name").innerText);
        tc.areEqual("url(\"http://oeexchange/photos/mfarns.jpg\")", getComputedStyle(rootElement.querySelector(".ic-tile")).backgroundImage);
        
        // Change the person and make sure the UI updates
        var personB = provider.loadObject("Person", {
            calculatedUIName: "Person B",
            userTile: { appdataURI: "http://oeexchange/photos/matthewg.jpg" },
        });
        ic.updateDataSource(personB);
        tc.areEqual("Person B", rootElement.querySelector(".ic-name").innerText);
        tc.areEqual("url(\"http://oeexchange/photos/matthewg.jpg\")", getComputedStyle(rootElement.querySelector(".ic-tile")).backgroundImage);
        
        // Change some properties on person A and nothing changes
        personA.mock$setProperty("calculatedUIName", "Person A 2");
        tc.areEqual("Person B", rootElement.querySelector(".ic-name").innerText);
        personA.userTile.mock$setProperty("appdataURI", "http://oeexchange/photos/kasuryan.jpg");
        tc.areEqual("url(\"http://oeexchange/photos/matthewg.jpg\")", getComputedStyle(rootElement.querySelector(".ic-tile")).backgroundImage);
        
        // Change some properties on person B and changes are reflected
        personB.mock$setProperty("calculatedUIName", "Person B 2");
        tc.areEqual("Person B 2", rootElement.querySelector(".ic-name").innerText);
        personB.userTile.mock$setProperty("appdataURI", "http://oeexchange/photos/avrame.jpg");
        tc.areEqual("url(\"http://oeexchange/photos/avrame.jpg\")", getComputedStyle(rootElement.querySelector(".ic-tile")).backgroundImage);
        
        // Change to a different kind of data object
        var literal = {
            objectType: "literal",
            name: "Literal",
            userTile: "http://oeexchange/photos/dannygl.jpg"
        };
        ic.updateDataSource(literal);
        tc.areEqual("Literal", rootElement.querySelector(".ic-name").innerText);
        tc.areEqual("url(\"http://oeexchange/photos/dannygl.jpg\")", getComputedStyle(rootElement.querySelector(".ic-tile")).backgroundImage);
        
        ic.shutdownUI();
    });

    Tx.test("identityControlTests.testClone", function (tc) {
        setup(tc);
        var provider = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider({});
        var personA = provider.loadObject("Person", {
            calculatedUIName: "Person A",
            userTile: { appdataURI: "http://oeexchange/photos/dannygl.jpg" },
        });
        var personB = provider.loadObject("Person", {
            calculatedUIName: "Person B",
            userTile: { appdataURI: "http://oeexchange/photos/rickz.jpg" },
        });
        var personC = provider.loadObject("Person", {
            calculatedUIName: "Person C",
            userTile: { appdataURI: "http://oeexchange/photos/gsierra.jpg" },
        });
        var jobSet = new MockJobSet();


        // Create a Billboard IC
        var templateIC = new People.IdentityControl();
        var templateElement = document.createElement("div");
        templateElement.innerHTML = templateIC.getUI(People.IdentityElements.BillboardLayout);
        templateElement = templateElement.firstChild;

        // Clone the IC
        var element1 = templateElement.cloneNode(true);
        var ic1 = templateIC.clone(element1, personA, jobSet); 

        // Verify the properties are set
        tc.areEqual("Person A", element1.querySelector(".ic-name").innerText);
        tc.areEqual("url(\"http://oeexchange/photos/dannygl.jpg\")", getComputedStyle(element1.querySelector(".ic-tile")).backgroundImage);
        
        // Clone it again
        var element2 = templateElement.cloneNode(true);
        var ic2 = templateIC.clone(element2, personB, jobSet);

        // Verify the properties are set on this IC and the other clone is unchanged
        tc.areEqual("Person A", element1.querySelector(".ic-name").innerText);
        tc.areEqual("url(\"http://oeexchange/photos/dannygl.jpg\")", getComputedStyle(element1.querySelector(".ic-tile")).backgroundImage);
        tc.areEqual("Person B", element2.querySelector(".ic-name").innerText);
        tc.areEqual("url(\"http://oeexchange/photos/rickz.jpg\")", getComputedStyle(element2.querySelector(".ic-tile")).backgroundImage);
        
        // Recycle one clone and the other doesn't change
        ic1.updateDataSource(personC);
        tc.areEqual("Person C", element1.querySelector(".ic-name").innerText);
        tc.areEqual("url(\"http://oeexchange/photos/gsierra.jpg\")", getComputedStyle(element1.querySelector(".ic-tile")).backgroundImage);
        tc.areEqual("Person B", element2.querySelector(".ic-name").innerText);
        tc.areEqual("url(\"http://oeexchange/photos/rickz.jpg\")", getComputedStyle(element2.querySelector(".ic-tile")).backgroundImage);
        
        ic1.shutdownUI();
        ic2.shutdownUI();
        templateIC.shutdownUI();
    });
});