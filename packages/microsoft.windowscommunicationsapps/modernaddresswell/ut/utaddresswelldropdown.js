
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,WinJS,Microsoft,document,AddressWell*/

(function () {
    // Temporary variables that will be changed by the test
    var _originalJxRes;
    var _originalJxHasClass;
    var _originalCreateElement;
    var _originalGetElementById;
    var _mockDropDown;
    var _originalJxBici;
    var _testElement;

    function setup () {
        /// <summary>
        /// Saves variables that will be changed by the tests
        /// </summary>

        _originalJxRes = Jx.res;
        Jx.res = {};
        Jx.res.processAll = function () { };
        Jx.res.getString = function (id) { return id; };
        _originalJxHasClass = Jx.hasClass;
        Jx.hasClass = function (el, cls) {
            return Boolean(el.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)')));
        };

        _originalJxBici = Jx.bici;
        Jx.bici = {
            addToStream: function () { }
        };

        _testElement = document.createElement("div");
        document.body.appendChild(_testElement);
        _originalCreateElement = document.createElement;
        _originalGetElementById = document.getElementById;
        _mockDropDown = new AddressWell.DropDown("idPrefix", new Jx.Log());
    }

    function cleanup () {
        /// <summary>
        /// Restores variables that were changed by the tests
        /// </summary>
        Jx.res = _originalJxRes;
        Jx.hasClass = _originalJxHasClass;
        Jx.bici = _originalJxBici;

        document.getElementById = _originalGetElementById;
        document.createElement = _originalCreateElement;
        document.body.removeChild(_testElement);
        _mockDropDown = null;
    }

    Tx.test("AddressWellDropDownUnitTests.testConstructor", function (tc) {
        /// <summary>
        /// Tests that properties are being set correctly in the constructor
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var dropDown = new AddressWell.DropDown("idPrefix", new Jx.Log());
        tc.areEqual("idPrefixDD", dropDown._id);

        tc.isTrue(dropDown.isAttr(AddressWell.highlightIdAttr), "Highlight ID attribute not initialized");
        tc.isTrue(dropDown.isAttr(AddressWell.highlightAreaAttr), "Highlight Area attribute not initialized");

        // Verify that the contacts collection is a non-empty arrays
        tc.areEqual(0, dropDown._contacts.length, "Expected _contacts to be initialized to empty array");
    });

    Tx.test("AddressWellDropDownUnitTests.testConstructorEmptyIdPrefix", function (tc) {
        /// <summary>
        /// Tests the case where the idPrefix parameter is empty
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        tc.expectException(function () {var dropDown = new AddressWell.DropDown("", new Jx.Log());}, "idPrefix parameter must be a non-empty string");
    });

    Tx.test("AddressWellDropDownUnitTests.testConstructorNullIdPrefix", function (tc) {
        /// <summary>
        /// Tests the case where the idPrefix parameter is null
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        tc.expectException(function () {var dropDown = new AddressWell.DropDown(null, new Jx.Log());}, "idPrefix parameter must be a non-empty string");
    });

    Tx.test("AddressWellDropDownUnitTests.testDeactivateUI", function (tc) {
        /// <summary>
        /// Test for deactivateUI
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var unbindListenersCalled = false;
        var removeChildCount = 0;

        var dropDown = _mockDropDown;

        dropDown._contacts = [5, 6, 7, 8];
        dropDown._listElement = { innerHTML: "html", hasAttribute: function () { return false; } };

        // Need to mock-activate the UI before deactivateUI does anything
        dropDown._uiInitialized = true;
        dropDown._unbindListeners = function () { unbindListenersCalled = true; };

        // This method tests deactivateUI, but also tests that it can be called twice without changing the results.
        dropDown.deactivateUI();
        dropDown.deactivateUI();

        tc.areEqual(0, dropDown._contacts.length, "Expect deactivateUI to clear out _contacts state");
        tc.isTrue(unbindListenersCalled, "Unbind click should be called during deactivateUI");
        tc.isNull(dropDown._unbindListeners, "Unbind click should be null after deactivateUI");
        tc.isNull(dropDown._rootElement, "Expect deactivateUI to clear out element state for root element");
        tc.isNull(dropDown._containerElement, "Expect deactivateUI to clear out element state for container element");
    });

    Tx.test("AddressWellDropDownUnitTests.testGetRootElement", function (tc) {
        /// <summary>
        /// Tests that root element is returned.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var rootElement = { id: "myElement" };

        _mockDropDown._rootElement = rootElement;
        tc.areEqual(rootElement, _mockDropDown.getRootElement(), "Root element is incorrect");
    });

    Tx.test("AddressWellDropDownUnitTests.testGetUI", function (tc) {
        /// <summary>
        /// Tests that getUI sets the right properties
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var ui = {};

        _mockDropDown.getUI(ui);
        tc.isNotNull(ui.html, "html property should have been populated");
    });

    Tx.test("AddressWellDropDownUnitTests.testHandleCompleteKey", function (tc) {
        /// <summary>
        /// Tests that it calls the right functions depending on the view
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        _mockDropDown._uiInitialized = true;
        _mockDropDown._highlightIndex = 0;
        var selectItemCalled = 0;
        _mockDropDown._selectItem = function () { selectItemCalled++; };
        var itemClickOnElementCalled = 0;
        _mockDropDown._itemClickOnElement = function () { itemClickOnElementCalled++; };
        _mockDropDown._getDropDownElementByNodePosition = function () { };

        // List view
        _mockDropDown._currentView = AddressWell.DropDownView.peopleSearchList;
        _mockDropDown.handleCompleteKey();
        tc.areEqual(0, selectItemCalled, "Select item should not have been called");
        tc.areEqual(1, itemClickOnElementCalled, "ItemClickOnElement should have been called");
    });

    Tx.test("AddressWellDropDownUnitTests.testHandlePageUpDownKey", function (tc) {
        /// <summary>
        /// Tests that keys get handled accordingly
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        _mockDropDown.getAttr = function (name) { return AddressWell.HighlightArea.dropDown; };
        _mockDropDown._currentView = AddressWell.DropDownView.peopleSearchList;

        // 10 mock contacts
        _mockDropDown._listElement = { children: [] };
        for (var i = 0; i < 10; i++) {
            _mockDropDown._listElement.children.push({});
        }

        // Index within range
        _mockDropDown._highlightIndex = 2;
        _mockDropDown._changeHighlight = function (index) {
            tc.areEqual(7, index, "Highlight is called on the wrong index");
        };
        _mockDropDown.handlePageUpDownKey(AddressWell.Key.pageDown);

        _mockDropDown._highlightIndex = 7;
        _mockDropDown._changeHighlight = function (index) {
            tc.areEqual(2, index, "Highlight is called on the wrong index");
        };
        _mockDropDown.handlePageUpDownKey(AddressWell.Key.pageUp);

        // Index out of range
        _mockDropDown._highlightIndex = 8;
        _mockDropDown._changeHighlight = function (index) {
            tc.areEqual(9, index, "Highlight is called on the wrong index");
        };
        _mockDropDown.handlePageUpDownKey(AddressWell.Key.pageDown);

        _mockDropDown._highlightIndex = 2;
        _mockDropDown._changeHighlight = function (index) {
            tc.areEqual(0, index, "Highlight is called on the wrong index");
        };
        _mockDropDown.handlePageUpDownKey(AddressWell.Key.pageUp);
    });

    Tx.test("AddressWellDropDownUnitTests.testAriaLive", function (tc) {
        /// <summary>
        /// Tests that we can add and remove aria-live attribute
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        _mockDropDown._listElement = document.createElement("ul");

        _mockDropDown.addAriaLive();
        tc.isTrue(_mockDropDown._listElement.hasAttribute("aria-live"), "Element should have aria-live set");

        _mockDropDown.removeAriaLive();
        tc.isFalse(_mockDropDown._listElement.hasAttribute("aria-live"), "Element should not have aria-live set");
    });

    Tx.test("AddressWellDropDownUnitTests.testGetDropDownElementByNodePosition", function (tc) {
        /// <summary>
        /// Tests the the function returns the right element
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Empty list
        _mockDropDown._listElement = { children: [] };
        tc.isNull(_mockDropDown._getDropDownElementByNodePosition(0), "Empty list should return null");

        // Invalid index
        _mockDropDown._listElement = { children: [{}] };
        tc.isNull(_mockDropDown._getDropDownElementByNodePosition(-1), "Invalid index -1 should return null");
        tc.isNull(_mockDropDown._getDropDownElementByNodePosition(5), "Invalid index 5 should return null");

        // Valid index
        _mockDropDown._listElement = { children: [{}, {}] };
        tc.isNotNull(_mockDropDown._getDropDownElementByNodePosition(1), "Valid index 1 should return null");
    });

    Tx.test("AddressWellDropDownUnitTests.testChangeHighlight", function (tc) {
        /// <summary>
        /// Tests the selects the correct highlight
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Mock up functions
        var expectedOldElement = null;
        var expectedNewElement = null;
        _mockDropDown._updateHighlightUI = function (oldEl, newEl) {
            tc.areEqual(expectedOldElement, oldEl, "Old element is not expected");
            tc.areEqual(expectedNewElement, newEl, "New element is not expected");
        };

        _mockDropDown._itemIdBase = "IB";

        // Create an element in the DOM with expected ID
        var elementById0 = document.createElement("div");
        elementById0.id = _mockDropDown._itemIdBase + "0";
        _testElement.appendChild(elementById0);
        var elementById1 = document.createElement("div");
        elementById1.id = _mockDropDown._itemIdBase + "1";
        _testElement.appendChild(elementById1);

        // Create an element in the list view
        _mockDropDown._listElement = document.createElement("ul");
        var elementByPosition0 = document.createElement("li");
        _mockDropDown._listElement.appendChild(elementByPosition0);
        var elementByPosition1 = document.createElement("li");
        _mockDropDown._listElement.appendChild(elementByPosition1);

        // Start with no highlight in list view
        _mockDropDown._currentView = AddressWell.DropDownView.peopleSearchList;
        expectedOldElement = null;
        expectedNewElement = elementByPosition0;
        _mockDropDown._changeHighlight(0);
        _mockDropDown._highlightIndex = 0;

        // Now change highlight in list view
        expectedOldElement = elementByPosition0;
        expectedNewElement = elementByPosition1;
        _mockDropDown._changeHighlight(1);
        _mockDropDown._highlightIndex = 1;
        
        // Clear highlight in list view
        expectedOldElement = elementByPosition1;
        expectedNewElement = null;
        _mockDropDown._changeHighlight(-1);
        _mockDropDown._highlightIndex = -1;
    });

    Tx.test("AddressWellDropDownUnitTests.testHighlightAreaChanged", function (tc) {
        /// <summary>
        /// Tests that the highlight function is called appropriately
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var changeHighlightCount = 0;
        _mockDropDown._changeHighlight = function (index) { changeHighlightCount++; };

        // UI not initialized
        _mockDropDown._uiInitialized = false;
        _mockDropDown._highlightAreaChanged(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input);
        tc.areEqual(0, changeHighlightCount, "UI not initialized - count should be 0");

        // Highlight area is drop down
        _mockDropDown._uiInitialized = true;
        _mockDropDown._highlightAreaChanged(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.dropDown);
        tc.areEqual(0, changeHighlightCount, "Highlight area is drop down - count should be 0");

        // Highlight area is input
        _mockDropDown._uiInitialized = true;
        _mockDropDown._highlightAreaChanged(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input);
        tc.areEqual(1, changeHighlightCount, "Highlight area is input - count should be 1");
    });

    Tx.test("AddressWellDropDownUnitTests.testItemClick", function (tc) {
        /// <summary>
        /// Tests that the function selects the right item
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var selectedItemCount = 0;
        _mockDropDown._selectItem = function (clickedIndex) { selectedItemCount++; };
        var selectedSearchLinkCount = 0;
        _mockDropDown._selectSearchLink = function (clickedElement) { selectedSearchLinkCount++; };
        _mockDropDown.setAttr = function () { };

        // Element not found
        var mockElement1 = document.createElement("div");
        var mockElement2 = document.createElement("div");
        var mockElement3 = document.createElement("div");
        var mockElement4 = document.createElement("div");
        mockElement3.appendChild(mockElement4);
        mockElement2.appendChild(mockElement3);
        mockElement1.appendChild(mockElement2);

        var mockEvent = { target: mockElement4 };
        _mockDropDown._itemClick(mockEvent);
        tc.areEqual(0, selectedItemCount, "select item should not have been called");
        tc.areEqual(0, selectedSearchLinkCount, "select search link should not have been called");

        // Valid contact element
        mockElement1.setAttribute("data-awIndex", "2");
        mockEvent = { target: mockElement1 };
        _mockDropDown._itemClick(mockEvent);
        tc.areEqual(1, selectedItemCount, "select item count should be 1");

        // Valid search link element
        mockElement1.setAttribute("data-awIndex", AddressWell.dropDownSearchLinkPrefix + "2");
        mockEvent = { target: mockElement1 };
        _mockDropDown._itemClick(mockEvent);
        tc.areEqual(1, selectedSearchLinkCount, "select search link should be 1");
    });

    Tx.test("AddressWellDropDownUnitTests.testGetSourceElement", function (tc) {
        /// <summary>
        /// Tests that the functions gets the correct index
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Index not found
        var mockElement1 = document.createElement("div");
        var mockElement2 = document.createElement("div");
        var mockElement3 = document.createElement("div");
        var mockElement4 = document.createElement("div");
        mockElement3.appendChild(mockElement4);
        mockElement2.appendChild(mockElement3);
        mockElement1.appendChild(mockElement2);

        var mockEvent = { target: mockElement4 };
        //_mockDropDown._currentView === AddressWell.DropDownView.peopleSearchList;
        tc.isNull(_mockDropDown._getSourceElement(mockEvent), "Source element should be null");

        // Valid element
        mockElement1.setAttribute("data-awIndex", "2");
        mockEvent = { target: mockElement1 };
        //_mockDropDown._currentView === AddressWell.DropDownView.tile;
        tc.areEqual(mockElement1, _mockDropDown._getSourceElement(mockEvent), "Incorrect element returned");
    });

    Tx.test("AddressWellDropDownUnitTests.testGetListOfContactsHtml", function (tc) {
        /// <summary>
        /// Test that list items are being rendered correctly.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Mock dependency functions we don't care about
        Jx.res.loadCompoundString = function () { return ""; };
        _mockDropDown._setVisibility = function () { };
        _mockDropDown._detachContextMenuHandler = function () { };
        _mockDropDown._listElement = document.createElement("ul");

        var contact1 = new AddressWell.Contact({ calculatedUIName: "Name1" }, [{ emailAddress: "email1" }], "mySrc");
        var contact2 = new AddressWell.Contact({ calculatedUIName: "Name2" }, [{ emailAddress: "email2" }], null);
        var contact3 = new AddressWell.Contact({ calculatedUIName: null }, [{ emailAddress: "email3" }], null);
        var contactNoEmail = new AddressWell.Contact({ calculatedUIName: "Name4" }, [{}], null);

        // No contacts case
        _mockDropDown._listElement.innerHTML = _mockDropDown._getListOfContactsHtml([]);
        tc.areEqual(0, _mockDropDown._listElement.children.length, "Container should not have any children");

        // With contacts case
        _mockDropDown._listElement.innerHTML = _mockDropDown._getListOfContactsHtml([contact1, contact2, contact3]);
        tc.areEqual(3, _mockDropDown._listElement.children.length, "List element should have 3 items");

        // Verify Images for Pawn case and user tile case
        // index of returns -1 in the case that the expected string is not contained in the base string.
        tc.isTrue((_mockDropDown._listElement.children[0].children[0].src.indexOf("mySrc") !== -1), "mySrc was not used in the path of the image");
        tc.isTrue((_mockDropDown._listElement.children[1].children[0].src.indexOf("UserPawn") !== -1), "UserPawn was not used in the path of the image");

        // Verify Name for calculatedUIName case and email case
        tc.areEqual("Name1", _mockDropDown._listElement.children[0].children[1].innerText, "The first contect should have a calculatedUIName.");
        tc.areEqual("email3", _mockDropDown._listElement.children[2].children[1].innerText, "The third contact should have an email used for the name element.");

        // Test no email address case
        _mockDropDown._listElement.innerHTML = _mockDropDown._getListOfContactsHtml([contactNoEmail]);
        tc.areEqual(1, _mockDropDown._listElement.children.length, "Container should have one child");
    });

    Tx.test("AddressWellDropDownUnitTests.testSelectSearchLink", function (tc) {
        /// <summary>
        /// Test that the function extracts the correct search link ID
        /// <summary>
        tc.cleanup = cleanup;
        setup();

        var expectedIDString = "";
        var raiseEventCalled = false;
        _mockDropDown.raiseEvent = function (name, value) {
            tc.areEqual(expectedIDString, value, "Value is unexpected");
            raiseEventCalled = true;
        };

        var mockElement = document.createElement("div");

        // Missing attribute
        _mockDropDown._selectSearchLink(mockElement);
        tc.isFalse(raiseEventCalled, "RaiseEvent should not have been called");

        // Attribute does not contain prefix
        mockElement.setAttribute("data-awIndex", "BLAHBLAHNoPrefix");
        _mockDropDown._selectSearchLink(mockElement);
        tc.isFalse(raiseEventCalled, "RaiseEvent should not have been called");

        // Valid attribute
        expectedIDString = "ID";
        mockElement.setAttribute("data-awIndex", AddressWell.dropDownSearchLinkPrefix + expectedIDString);
        _mockDropDown._selectSearchLink(mockElement);
        tc.isTrue(raiseEventCalled, "RaiseEvent should have been called");
    });
})();
