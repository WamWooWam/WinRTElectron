
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,WinJS,Microsoft,document,AddressWell*/

(function () {
    // The AddressWell Input component used in the tests
    var _addressWellInput;
    // Temporary variables that will be changed by the tests
    var _originalJxRes;
    var _originalDocumentElementById;
    var _originalDocumentCreateElement;
    var _originalDocumentGetByTagName;
    var _originalWinJS;
    var _originalDocumentActiveElement;
    var _originalScrollIntoContainer;
    var _originalClearTileCache;
    var _originalGetUserTileUrlFromCache;
    var _originalJxBici = Jx.bici;
    var _originalJxFault;
    var _originalJxHasClass;
    var _originalJxRtl = Jx.isRtl;
    var _originalMsSetImmediate;

    function _makeRecipient(initObject, initialState) {
        return new AddressWell.Recipient(initObject, initialState);
    }

    function _makeRecipientParser() {
        return new AddressWell.RecipientParser({}, {});
    }

    function setup () {
        /// <summary>
        /// Constructs a default address well input copmonent, and saves variables that will be changed by the tests
        /// </summary>
        
        _originalJxBici = Jx.bici;
        _originalJxFault = Jx.fault;
        _originalJxHasClass = Jx.hasClass;
        _originalJxRes = Jx.res;

        Jx.res = {};
        Jx.res.processAll = function () { };
        Jx.res.getString = function (id) { return "string"; };
        Jx.res.loadCompoundString = function (id) { return "string"; };

        Jx.bici = {
            addToStream: function () { }
        };

        Jx.hasClass = function (el, cls) {
            return Boolean(el.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)')));
        };

        Jx.fault = function () { };

        _originalDocumentElementById = document.getElementById;
        _originalDocumentCreateElement = document.createElement;
        _originalDocumentGetByTagName = document.getElementsByTagName;
        _originalWinJS = window.WinJS;
        WinJS = { UI: {} };
        _originalDocumentActiveElement = document.activeElement;
        _originalScrollIntoContainer = AddressWell.scrollIntoContainer;
        _originalClearTileCache = AddressWell.clearTileCache;
        _originalGetUserTileUrlFromCache = AddressWell.getUserTileUrlFromCache;
        _addressWellInput = new AddressWell.Input("idPrefix", [], {}, new Jx.Log(), "");
        _originalMsSetImmediate = window.msSetImmediate;
    }

    function cleanup () {
        /// <summary>
        /// Restores variables that were changed by the tests
        /// </summary>
        _addressWellInput = null;
        Jx.bici = _originalJxBici;
        Jx.hasClass = _originalJxHasClass;
        Jx.fault = _originalJxFault;
        Jx.isRtl = _originalJxRtl;
        Jx.res = _originalJxRes;

        document.getElementById = _originalDocumentElementById;
        document.createElement = _originalDocumentCreateElement;
        document.getElementsByTagName = _originalDocumentGetByTagName;
        document.activeElement = _originalDocumentActiveElement;
        window.WinJS = _originalWinJS;
        AddressWell.scrollIntoContainer = _originalScrollIntoContainer;
        AddressWell.clearTileCache = _originalClearTileCache;
        AddressWell.getUserTileUrlFromCache = _originalGetUserTileUrlFromCache;

        window.msSetImmediate = _originalMsSetImmediate;
    }

    Tx.test("AddressWellInputUnitTests.testConstructor", function (tc) {
        /// <summary>
        /// Tests properties when invoking the constructor
        /// </summary>
        tc.cleanup = cleanup;
        setup();
  
        var addressWellInput = new AddressWell.Input("idPrefix", [], null, new Jx.Log(), "hintText");

        tc.areEqual(0, addressWellInput._recipients.length, "There should be no recipient in the array");
        tc.areEqual("idPrefixC", addressWellInput._containerId);
        tc.areEqual("idPrefixIF", addressWellInput._inputFieldId);
        tc.areEqual("idPrefixL", addressWellInput._listId);
        tc.isNotNull(addressWellInput._emailRegExp);
        tc.areEqual("hintText", addressWellInput._hintText);
    });

    Tx.test("AddressWellInputUnitTests.testConstructorNullIdPrefix", function (tc) {
        /// <summary>
        /// Tests the case where the idPrefix parameter is null
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        tc.expectException(function() {var addressWellInput = new AddressWell.Input(null, [], null, new Jx.Log(), "");}, "idPrefix parameter must be not null and non empty" );
    });

    Tx.test("AddressWellInputUnitTests.testConstructorEmptyIdPrefix", function (tc) {
        /// <summary>
        /// Tests the case where the idPrefix parameter is empty
        /// </summary>
        tc.cleanup = cleanup;
        setup();

         tc.expectException(function() {var addressWellInput = new AddressWell.Input("", [], null, new Jx.Log(), "");}, "idPrefix parameter must be not null and non empty" );
    });

    Tx.test("AddressWellInputUnitTests.testGetUI", function (tc) {
        /// <summary>
        /// Tests getUI function sets the right properties
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var ui = {};

        // No hint text
        var aw = new AddressWell.Input("idPrefix", [], null, new Jx.Log(), "");
        aw.getUI(ui);
        tc.isNotNull(ui.html, "html property should have been populated");
        tc.areEqual(-1, ui.html.indexOf('placeholder'), "Place holder text should not be found");

        // With hint text
        aw = new AddressWell.Input("idPrefix", [], null, new Jx.Log(), "hintText");
        aw.getUI(ui);
        tc.isNotNull(ui.html, "html property should have been populated");
        tc.areNotEqual(-1, ui.html.indexOf('placeholder="hintText"'), "Place holder text should be found");
    });

    Tx.test("AddressWellInputUnitTests.testDeactivateUI", function (tc) {
        /// <summary>
        /// Tests that deactivateUI dettaches the correct event handlers
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Mock up elements, event handlers, and functions.
        var containerElement = {};
        var inputElement = {};
        var recipientElement = {};

        var containerMSGestureTapRemoveEvent = 0;
        var containerContextMenuEvent = 0;
        var containerKeyDownEvent = 0;
        var containerPointerDownEvent = 0;
        containerElement.removeEventListener = function (eventName) {
            if (eventName === AddressWell.Events.msGestureTap) {
                containerMSGestureTapRemoveEvent++;
            } else if (eventName === AddressWell.Events.contextmenu) {
                containerContextMenuEvent++;
            } else if (eventName === AddressWell.Events.keydown) {
                containerKeyDownEvent++;
            } else if (eventName === AddressWell.Events.msPointerDown) {
                containerPointerDownEvent++;
            } else {
                tc.fail("unexpected event removed: " + eventName);
            }
        };

        var inputKeyDownRemoveEvent = 0;
        var inputInputRemoveEvent = 0;
        var inputPasteRemoveEvent = 0;
        var inputFocusRemoveEvent = 0;
        var inputContextMenuEvent = 0;
        var inputCompositionStartEvent = 0;
        var inputCompositionEndEvent = 0;
        inputElement.removeEventListener = function (eventName) {
            if (eventName === AddressWell.Events.keydown) {
                inputKeyDownRemoveEvent++;
            } else if (eventName === AddressWell.Events.input) {
                inputInputRemoveEvent++;
            } else if (eventName === AddressWell.Events.paste) {
                inputPasteRemoveEvent++;
            } else if (eventName === AddressWell.Events.focus) {
                inputFocusRemoveEvent++;
            } else if (eventName === AddressWell.Events.contextmenu) {
                inputContextMenuEvent++;
            } else if (eventName === AddressWell.Events.compositionstart) {
                inputCompositionStartEvent++;
            } else if (eventName === AddressWell.Events.compositionend) {
                inputCompositionEndEvent++;
            } else {
                tc.fail("unexpected event removed: " + eventName);
            }
        };

        _addressWellInput._rootElement = containerElement;
        _addressWellInput._inputElement = inputElement;
        _addressWellInput._uiInitialized = true;

        // Test calling the functon the first time
        _addressWellInput.deactivateUI();
        tc.areEqual(1, containerMSGestureTapRemoveEvent, "containerMsGestureTapRemoveEvent is incorrect");
        tc.areEqual(1, containerContextMenuEvent, "contextmenu event removed from container incorrect number of times");
        tc.areEqual(1, containerKeyDownEvent, "keydown event removed from container incorrect number of times");
        tc.areEqual(1, containerPointerDownEvent, "pointer down event attached incorrect number of times");
        tc.areEqual(1, inputKeyDownRemoveEvent, "inputKeyDownRemoveEvent is incorrect");
        tc.areEqual(1, inputInputRemoveEvent, "inputInputRemoveEvent is incorrect");
        tc.areEqual(1, inputPasteRemoveEvent, "inputPasteRemoveEvent is incorrect");
        tc.areEqual(1, inputFocusRemoveEvent, "inputFocusRemoveEvent is incorrect");
        tc.areEqual(1, inputContextMenuEvent, "inputContextMenuEvent is incorrect");
        tc.areEqual(1, inputCompositionStartEvent, "detached from compositionstart incorrect number of times");
        tc.areEqual(1, inputCompositionEndEvent, "detached from compositionend incorrect number of times");
        tc.isFalse(_addressWellInput._uiInitialized, "UI should not have been initialized");

        // Test calling the function the second time.  Verify that event handlers should not have been called again.
        _addressWellInput.deactivateUI();
        tc.areEqual(1, containerMSGestureTapRemoveEvent, "containerMsGestureTapRemoveEvent is incorrect");
        tc.areEqual(1, containerContextMenuEvent, "contextmenu event removed from container incorrect number of times");
        tc.areEqual(1, containerKeyDownEvent, "keydown event removed from container incorrect number of times");
        tc.areEqual(1, containerPointerDownEvent, "pointer down event attached incorrect number of times");
        tc.areEqual(1, inputKeyDownRemoveEvent, "inputKeyDownRemoveEvent is incorrect");
        tc.areEqual(1, inputInputRemoveEvent, "inputInputRemoveEvent is incorrect");
        tc.areEqual(1, inputPasteRemoveEvent, "inputPasteRemoveEvent is incorrect");
        tc.areEqual(1, inputFocusRemoveEvent, "inputFocusRemoveEvent is incorrect");
        tc.areEqual(1, inputContextMenuEvent, "inputContextMenuEvent is incorrect");
        tc.areEqual(1, inputCompositionStartEvent, "detached from compositionstart incorrect number of times");
        tc.areEqual(1, inputCompositionEndEvent, "detached from compositionend incorrect number of times");
        tc.isFalse(_addressWellInput._uiInitialized, "UI should not have been initialized");
    });

    Tx.test("AddressWellInputUnitTests.testGetRootElement", function (tc) {
        /// <summary>
        /// Tests that root element is returned.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var rootElement = { id: "myElement" };
        _addressWellInput._rootElement = rootElement;
        tc.areEqual(rootElement, _addressWellInput.getRootElement(), "Root element is incorrect");
    });

    Tx.test("AddressWellInputUnitTests.testGetRecipients", function (tc) {
        /// <summary>
        /// Tests that the function returns the right items
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var jsRecipient = {
            id: "js recipient",
            isJsRecipient: true
        };

        var platformRecipient = {
            id: "platform recipient",
            isJsRecipient: false
        };

        _addressWellInput._recipients = [null, {}, undefined, jsRecipient, platformRecipient];

        // Case: requesting all recipients
        var result = _addressWellInput.getRecipients(false);
        tc.areEqual(3, result.length, "There should be 3 valid recipients");
        tc.areEqual(5, _addressWellInput._recipients.length, "The original recipients array should not have been modified");

        // Case: requesting only recipients suitable for use with the platform
        result = _addressWellInput.getRecipients(true);
        tc.areEqual(2, result.length, "There should be 2 valid recipients");
        tc.areEqual(5, _addressWellInput._recipients.length, "The original recipients array should not have been modified");
    });

    Tx.test("AddressWellInputUnitTests.testGetRecipientsStringInNameEmailPairs", function (tc) {
        /// <summary>
        /// Tests that function returns the correct string
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var recipient1 = _makeRecipient({ calculatedUIName: "Name1", emailAddress: "email1" });
        var recipient2 = _makeRecipient({ emailAddress: "email2" });
        var recipient3 = _makeRecipient({ calculatedUIName: "Name3" });
        var recipient4 = _makeRecipient({});
        var recipient5 = _makeRecipient({ calculatedUIName: '" NameInQuotes"', emailAddress: "email5" });

        _addressWellInput._recipients = [recipient1, recipient2, recipient3, recipient4, recipient5];

        var expected = '"Name1" <email1>;<email2>;"Name3" ;"\" NameInQuotes\"" <email5>;';
        tc.areEqual(expected, _addressWellInput.getRecipientsStringInNameEmailPairs(), "Result is incorrect");
    });

    Tx.test("AddressWellInputUnitTests.testGetError", function (tc) {
        /// <summary>
        /// Tests that function returns the correct error string
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var errorString = null;

        // Mock up dependency functions
        _addressWellInput.completeUserInput = function (raiseEvent) { tc.isFalse(raiseEvent); };

        Jx.res.getString = function (stringId) {
            return stringId;
        };

        // Case 1: Empty case
        _addressWellInput._recipients = [];
        tc.areEqual(AddressWell.stringsPrefix + "awErrorEmpty", _addressWellInput.getError(), "Should return empty error");

        // Case 2: Maximum number of characters has reached
        _addressWellInput._recipients = [_makeRecipient({})];
        var maxInput = "";
        for (var i = 0; i < AddressWell.maxStringLength; i++) {
            maxInput += "a";
        }
        _addressWellInput.getRecipientsStringInNameEmailPairs = function () {
            return maxInput;
        };
        tc.areEqual(AddressWell.stringsPrefix + "awErrorMaximum", _addressWellInput.getError(), "Should return maximum error");

        // Case 3: Invalid email address detected
        _addressWellInput._recipients = [AddressWell.Recipient.fromEmail("foo@@bar.com")];
        _addressWellInput.getRecipientsStringInNameEmailPairs = function () {
            return "valid";
        };
        tc.areEqual(AddressWell.stringsPrefix + "awErrorInvalid", _addressWellInput.getError(), "Should return invalid email format error");

        // Case 4: Unresolved email address detected
        _addressWellInput._recipients = [AddressWell.Recipient.fromEmail("foo")];
        tc.areEqual(AddressWell.stringsPrefix + "awErrorUnresolvableRecipients", _addressWellInput.getError(), "Should return unresolveed email format error");

        // Case 5: Pending-resolution email address detected
        _addressWellInput._recipients = [AddressWell.Recipient.fromEmail("foo")];
        _addressWellInput._recipients[0].setId("1");
        _addressWellInput._recipients[0].generateHTMLElement(0, false);
        _addressWellInput._recipients[0].updateState(AddressWell.RecipientState.pendingResolution);
        tc.areEqual(AddressWell.stringsPrefix + "awErrorResolutionsPending", _addressWellInput.getError(), "Should return pending-resolution format error");

        // Case 6: No error to return
        _addressWellInput._recipients = [AddressWell.Recipient.fromEmail("foo@hotmail.com")];
        tc.isNull(_addressWellInput.getError(), "Should return null error");
    });

    Tx.test("AddressWellInputUnitTests.testClearHighlight", function (tc) {
        /// <summary>
        /// Tests that clearHighlight clears highlight only when there's highlighted recipient
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Set up mock objects
        var mockElement = { className: _addressWellInput._highlightClass };
        document.getElementById = function (elementId) { return mockElement; };

        // Case 1: No highlight
        _addressWellInput._highlightIndex = -1;
        _addressWellInput.clearHighlight();

        // Verify case 1
        tc.areEqual(_addressWellInput._highlightClass, mockElement.className, "Class name should not have been changed");

        // Case 2: Highlight on first element
        _addressWellInput._highlightIndex = 0;
        _addressWellInput.clearHighlight();

        // Verify case 2
        tc.areEqual(" ", mockElement.className, "Class name should have been removed");
    });

    Tx.test("AddressWellInputUnitTests.testCompleteUserInput", function (tc) {
        /// <summary>
        /// Tests that completeUserInput handles various input types.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Set up mock functions
        var addRecipientCalled = false;
        _addressWellInput.addRecipientsByString = function (recipient, biciRecipientAddMethod) {
            addRecipientCalled = true;
            tc.areEqual(AddressWell.RecipientAddMethod.typing, biciRecipientAddMethod, "Bici data point is incorrect");
        };

        var clearCalled = false;
        _addressWellInput.clearInputField = function (shouldSignal) {
            clearCalled = true;
        };
        _addressWellInput._inputElement = {};

        // Empty input
        _addressWellInput._inputElement.value = "";
        _addressWellInput.completeUserInput();
        tc.isFalse(addRecipientCalled, "Add recipient should not have been called");
        tc.isFalse(clearCalled, "clear input field should not have been called");

        // Input with only white spaces
        _addressWellInput._inputElement.value = "             ";
        _addressWellInput.completeUserInput();
        tc.isFalse(addRecipientCalled, "Add recipient should not have been called");
        tc.isFalse(clearCalled, "clear input field should not have been called");

        // Valid input
        _addressWellInput._inputElement.value = "abc";
        _addressWellInput.completeUserInput();
        tc.isTrue(addRecipientCalled, "Add recipient should have been called");
        tc.isTrue(clearCalled, "clear input field should have been called");
    });

    Tx.test("AddressWellInputUnitTests.testClearInputField", function (tc) {
        /// <summary>
        /// Tests the logic for clearInputField function.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Set up mock objects and functions
        _addressWellInput._inputElement = {};

        _addressWellInput.adjustInputFieldLength = function (shouldUseCachedContainerWidth) {
            tc.isTrue(shouldUseCachedContainerWidth);
        };

        // Case 1: empty input value
        _addressWellInput._inputElement.value = "";
        _addressWellInput.clearInputField();
        tc.areEqual("", _addressWellInput._inputElement.value);
        tc.areEqual("", _addressWellInput._previousInputValue);

        // Case 2: non-empty input value
        _addressWellInput._inputElement.value = "abc";
        _addressWellInput.clearInputField();
        tc.areEqual("", _addressWellInput._inputElement.value);
        tc.areEqual("", _addressWellInput._previousInputValue);
    });

    Tx.test("AddressWellInputUnitTests.testAddRecipient", function (tc) {
        /// <summary>
        /// Test that the function makes the right calls.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Set up mock functions
        var generateRecipientHtmlCalled = false;
        var addRecipientsAnimationCalled = false;
        var addRecipientsToCollectionCalled = false;
        var emptyRecipient = _makeRecipient({});
        emptyRecipient.generateHTMLElement = function () {
            generateRecipientHtmlCalled = true;
        };
        _addressWellInput._addRecipientsAnimation = function (item) {
            addRecipientsAnimationCalled = true;
        };
        _addressWellInput._addRecipientsToCollection = function (recipient) {
            addRecipientsToCollectionCalled = true;
        };
        _addressWellInput._inputElement = { hasAttribute: Jx.fnEmpty };
        _addressWellInput._updateAriaFlowAttributes = Jx.fnEmpty;
        _addressWellInput.isDirty = false;

        // Verify
        _addressWellInput.addRecipient(emptyRecipient);
        tc.isTrue(generateRecipientHtmlCalled, "generateRecipientHtmlCalled should have been called");
        tc.isTrue(addRecipientsAnimationCalled, "addRecipientsAnimationCalled should have been called");
        tc.isTrue(addRecipientsToCollectionCalled, "addRecipientsToCollection should have been called");
        tc.isTrue(_addressWellInput.isDirty, "isDirty should be set to true");
    });

    Tx.test("AddressWellInputUnitTests.testAddRecipientsEmpty", function (tc) {
        /// <summary>
        /// Verifies addRecipients when the collection is empty
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var addRecipientsHtmlCalled = 0;

        _addressWellInput._addRecipientsHtml = function () {
            addRecipientsHtmlCalled++;
        };
        _addressWellInput._addRecipientsToCollection = function (recipients) { };
        _addressWellInput._updateAriaFlowAttributes = Jx.fnEmpty;

        // Add recipient to collection.
        _addressWellInput.addRecipients([]);

        tc.areEqual(0, addRecipientsHtmlCalled, "Did not expect any calls to addRecipientHtmlCalled with no recipients");
    });

    Tx.test("AddressWellInputUnitTests.testAddRecipients", function (tc) {
        /// <summary>
        /// Verifies addRecipients
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var addRecipientsHtmlCalled = 0;
        var recipientCount = 0;

        _addressWellInput._addRecipientsHtml = function (recipients) {
            addRecipientsHtmlCalled++;
            recipientCount = recipients.length;
        };
        _addressWellInput._updateAriaFlowAttributes = Jx.fnEmpty;
        _addressWellInput._addRecipientsToCollection = function (recipients) { };

        // Set up the recipient data with 4 recipients with email and 2 recipients without email.
        var recipientsTestData = [
            { emailAddress: "email1@email.com" },
            { emailAddress: "email2@email.com" },
            { id: "This recipient has no email" },
            { emailAddress: "email3@email.com" },
            { id: "This recipient has no email 2" },
            { emailAddress: "email4@email.com" }
        ];

        _addressWellInput.addRecipients(recipientsTestData);

        tc.areEqual(1, addRecipientsHtmlCalled, "addRecipientsHtmlCalled should have only been called once.");
        tc.areEqual(6, recipientCount, "Unexpected number of recipients added");
    });

    function addRecipientsByStringHelper (tc, inputString, expectedRecipients, expectedOutput) {
        /// <summary>
        /// A helper function to test addRecipientsByString function
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        /// <param name="inputString" type="String">The input string to test<param>
        /// <param name="expectedRecipients" type="Array">The expected list of recipients</param>
        /// <param name="expectedOutput" type="String">The returned value by the function, if there is any</param>
        var parser = _makeRecipientParser();

        var actualRecipients = [];
        _addressWellInput.addRecipients = function (recipients) {
            actualRecipients = actualRecipients.concat(recipients);
        };
        var biciCalled = false;
        Jx.bici.addToStream = function (datapointId, datapointName, datapointValue) {
            tc.areEqual(AddressWell.selectionBiciId, datapointId, "Bici data point ID is incorrect");
            tc.areEqual(AddressWell.RecipientAddMethod.preFilled, datapointName, "Bici data point name is incorrect");
            tc.areEqual(actualRecipients.length, expectedRecipients.length, "Bici data point value is incorrect");
        };

        var outputString = _addressWellInput.addRecipientsByString(inputString, AddressWell.RecipientAddMethod.preFilled);

        tc.areEqual(expectedOutput, outputString, "Incorrect output string");
        tc.areEqual(expectedRecipients.length, actualRecipients.length, "Length of actual recipients are incorrect");
        for (var i = 0; i < expectedRecipients.length; i++) {
            tc.areEqual(expectedRecipients[i].calculatedUIName, actualRecipients[i].calculatedUIName, "Incorrect calculatedUIName at position " + i);
            tc.areEqual(expectedRecipients[i].emailAddress, actualRecipients[i].emailAddress, "Incorrect email address at position " + i);
        }
        tc.areEqual("", _addressWellInput._parser._emailFromParser);
        tc.areEqual("", _addressWellInput._parser._personNameFromParser);
        tc.isFalse(_addressWellInput._parser._parsingName);
        tc.isFalse(_addressWellInput._parser._parsingEmail);
        tc.areEqual("", _addressWellInput._parser._stringBeforeSeparator);

        if (expectedRecipients > 0) {
            tc.isTrue(biciCalled, "Bici should have been called");
        }
    }

    function createRecipientHelper (name, email) {
        /// <summary>
        /// A helper function to construct dummy recipient objects given name and email
        /// </summary>
        return { calculatedUIName: name, emailAddress: email };
    }

    Tx.test("AddressWellInputUnitTests.testAddRecipientsByString", function (tc) {
        /// <summary>
        /// Test that the function parses the string correctly
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Verify single recipient addition
        addRecipientsByStringHelper(tc,
            'single@email.com;',
            [createRecipientHelper("single@email.com", "single@email.com")],
            ""
        );
        addRecipientsByStringHelper(tc,
            '<single@email.com>;',
            [createRecipientHelper("single@email.com", "single@email.com")],
            ""
        );
        addRecipientsByStringHelper(tc,
            'Text;',
            [createRecipientHelper("Text", "Text")],
            ""
        );
        addRecipientsByStringHelper(tc, 
            '"StringOnlyWithQuotes";',
            [createRecipientHelper("StringOnlyWithQuotes", "StringOnlyWithQuotes")],
            ""
        );
        addRecipientsByStringHelper(tc, 
            'First Last     <     foo@bar.com     >;',
            [createRecipientHelper("First Last", "foo@bar.com")],
            ""
        );
        addRecipientsByStringHelper(tc, 
            '"First Last     " <foo@bar.com>;',
            [createRecipientHelper("First Last", "foo@bar.com")],
            ""
        );
        addRecipientsByStringHelper(tc, 
            '" " <email@noName.com>;',
            [createRecipientHelper('email@noName.com', 'email@noName.com')],
            ""
        );
        addRecipientsByStringHelper(tc, 
            '"Last, First" <nameHasComma@email.com>;',
            [createRecipientHelper('Last, First', 'nameHasComma@email.com')],
            ""
        );
        addRecipientsByStringHelper(tc, 
            '<incompleteEmail@domain.com;',
            [createRecipientHelper('incompleteEmail@domain.com', 'incompleteEmail@domain.com')],
            ""
        );
        addRecipientsByStringHelper(tc, 
            '<email@domain.com> "Name After Email";',
            [createRecipientHelper('Name After Email', 'email@domain.com')],
            ""
        );
        addRecipientsByStringHelper(tc, 
            '<email<emailWthExtraBracket@email.com>;',
            [createRecipientHelper('email', 'emailWthExtraBracket@email.com')],
            ""
        );
        addRecipientsByStringHelper(tc, 
            '<email1@domain.com> "Name" <email2@domain.com>;',
            [createRecipientHelper('Name', 'email1@domain.com')],
            ""
        );
        addRecipientsByStringHelper(tc, 
            '<"emailInQuotes"@domain.com>;',
            [createRecipientHelper('"emailInQuotes"@domain.com', '"emailInQuotes"@domain.com')],
            ""
        );
        addRecipientsByStringHelper(tc, 
            'Foo+amazon@domain.com;',
            [createRecipientHelper('Foo+amazon@domain.com', 'Foo+amazon@domain.com')],
            ""
        );
        addRecipientsByStringHelper(tc, 
            '<weirdEmailInBrackets@[10.10.10.10]>;',
            [createRecipientHelper('weirdEmailInBrackets@[10.10.10.10]', 'weirdEmailInBrackets@[10.10.10.10]')],
            ""
        );
        addRecipientsByStringHelper(tc, 
            'first.last@[IPv6:::12.34.56.78];',
            [createRecipientHelper('first.last@[IPv6:::12.34.56.78]', 'first.last@[IPv6:::12.34.56.78]')],
            ""
        );
        addRecipientsByStringHelper(tc, 
            '"Name \\"With \\"Quotes" <x@y.com>;',
            [createRecipientHelper('Name "With "Quotes', 'x@y.com')],
            ""
        );
        addRecipientsByStringHelper(tc, 
            '"VJ\'s email" <foo@bar.com>;',
            [createRecipientHelper("VJ's email", "foo@bar.com")],
            ""
        );
        addRecipientsByStringHelper(tc, 
            'withExtraSeparators@email.com;;;,,,',
            [createRecipientHelper('withExtraSeparators@email.com', 'withExtraSeparators@email.com')],
            ""
        );
        addRecipientsByStringHelper(tc, 
            '"Name <with brackets <  >" <email@domain.com>;',
            [createRecipientHelper('Name <with brackets <  >', 'email@domain.com')],
            ""
        );
        addRecipientsByStringHelper(tc, 
            '<script>alert("hello")</script>;',
            [createRecipientHelper('hello', 'script')],
            ""
        );

        // Verify multiple recipients separated by various or multiple separators
        var expectedRecipients = [
            createRecipientHelper("jiamin@hotmail.com", "jiamin@hotmail.com"),
            createRecipientHelper("jiamin@live.com", "jiamin@live.com"),
            createRecipientHelper("First Last", "foo@bar.com"),
            createRecipientHelper("Last, First", "x@y.com"),
            createRecipientHelper("email@noName.com", "email@noName.com"),
            createRecipientHelper("NameWithNoEmail", "NameWithNoEmail"),
            createRecipientHelper("Name with ; semicolon", "a@b.com")
        ];
        addRecipientsByStringHelper(tc, 
            'jiamin@hotmail.com, <jiamin@live.com>; First Last <foo@bar.com>,;; "Last, First" <x@y.com>؛ "  " <email@noName.com>;"NameWithNoEmail",; "Name with ; semicolon" <a@b.com>,;',
            expectedRecipients,
            ""
        );

        // Verify formats that we don't support
        addRecipientsByStringHelper(tc, 
            'First Last foo@bar.com;',
            [createRecipientHelper("First Last foo@bar.com", "First Last foo@bar.com")],
            ""
        );
        addRecipientsByStringHelper(tc, 
            '"NameWithInvalidEmail" << >>;',
            [createRecipientHelper('NameWithInvalidEmail', 'NameWithInvalidEmail')],
            ""
        );

        // Verify that portion of the string that did not get parsed is being returned
        addRecipientsByStringHelper(tc, 
            '"Name"<a@b.com>; 1@2.com',
            [createRecipientHelper('Name', 'a@b.com')],
            " 1@2.com"
        );
        addRecipientsByStringHelper(tc, 
            'incompleteEntry@domain.com',
            [],
            "incompleteEntry@domain.com"
        );
        addRecipientsByStringHelper(tc, 
            'withExtraSeparators@email.com;;;,,,extra',
            [createRecipientHelper('withExtraSeparators@email.com', 'withExtraSeparators@email.com')],
            "extra"
        );
    });

    Tx.test("AddressWellInputUnitTests.testDeleteRecipientByIndex", function (tc) {
        /// <summary>
        /// Tests that the function deletes the given index.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var removeCount = 0;
        _addressWellInput.clearHighlight = function () { };
        _addressWellInput._recipients = [_makeRecipient({}), _makeRecipient({}), _makeRecipient({})];

        document.getElementById = function (elementId) {
            return {};
        };
        var withAnimation = false;
        _addressWellInput._deleteRecipientAnimation = function () { 
            removeCount++; 
            withAnimation = true;
        };
        _addressWellInput._deleteRecipientAnimationCallback = function () { 
            removeCount++;
            withAnimation = false;
        };

        var lastEvent = null;
        var eventCount = 0;
        var mockParent = {
            raiseEvent : function (eventName) {
                lastEvent = eventName;
                eventCount++;
            }
        };
        _addressWellInput.raiseEvent = function(eventName) {
            lastEvent = eventName;
            eventCount++;
        };
        _addressWellInput.getParent = function () {
            return mockParent;
        };

        // Index out of range
        _addressWellInput.deleteRecipientByIndex(-1, false);
        tc.areEqual(0, removeCount, "Nothing should have been removed");
        _addressWellInput.deleteRecipientByIndex(100, false);

        // Valid index without animation
        _addressWellInput.deleteRecipientByIndex(1, false);
        tc.areEqual(1, removeCount, "1 item is removed");
        tc.isNull(_addressWellInput._recipients[1], "Item is not being set to null");
        tc.isFalse(withAnimation, "Animation should be false");
        tc.areEqual(AddressWell.Events.recipientRemoved, lastEvent, "The recipientRemoved should have fired");
        
        // Valid index with animation
        _addressWellInput.deleteRecipientByIndex(2, true);
        tc.areEqual(2, removeCount, "2 items are removed");
        tc.isTrue(withAnimation, "Animation should be true");
        tc.areEqual(AddressWell.Events.recipientRemoved, lastEvent, "The recipientRemoved should have fired");
        tc.areEqual(2, eventCount, "Nothing should have been removed");
        
    });

    Tx.test("AddressWellInputUnitTests.testContainerKeyDownHandler", function (tc) {
        /// <summary>
        /// Tests that function handles the cases appropriately
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        document.getElementById = function (elementId) {
            return {};
        };
        var focusCalled = false;
        _addressWellInput.focus = function () { focusCalled = true; };

        var recipientKeyDownCalled = false;
        _addressWellInput._recipientKeyDownHandler = function (ev) { recipientKeyDownCalled = true; };

        var inputKeyDownCalled = false;
        _addressWellInput._inputKeyDownHandler = function (ev) { inputKeyDownCalled = true; };

        // Recipient found
        _addressWellInput._highlightIndex = 0;
        _addressWellInput.containerKeyDownHandler({ key: AddressWell.Key.enter });
        tc.isTrue(recipientKeyDownCalled);
    });

    Tx.test("AddressWellInputUnitTests.testGetSourceRecipientElement", function (tc) {
        /// <summary>
        /// Tests that the function returns the right recipient element
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Element not found
        var mockElement1 = document.createElement("div");
        var mockElement2 = document.createElement("div");
        var mockElement3 = document.createElement("div");
        var mockElement4 = document.createElement("div");
        mockElement3.appendChild(mockElement4);
        mockElement2.appendChild(mockElement3);
        mockElement1.appendChild(mockElement2);

        var event = { target: mockElement4 };
        tc.isNull(_addressWellInput._getSourceRecipientElement(event));

        // Element found
        mockElement1.setAttribute("data-awIndex", "0");
        event = { target: mockElement1 };
        tc.isNotNull(_addressWellInput._getSourceRecipientElement(event));
    });

    /*Tx.test("AddressWellInputUnitTests.testContainerContextMenuHandler", function (tc) {
        /// <summary>
        /// Tests that the function is calling into the appropriate functions
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var containerClickCalled = false;
        _addressWellInput._containerClickHandler = function (event) {
            containerClickCalled = true;
        };
        var displayContextMenuForRecipientCalled = false;
        _addressWellInput._displayContextMenuForRecipient = function () {
            displayContextMenuForRecipientCalled = true;
        };
        _addressWellInput._copyText("CONTENT");
        var displayContextMenuForContainerCalled = false;
        _addressWellInput._displayContextMenuForContainer = function () {
            displayContextMenuForContainerCalled = true;
        };
        var highlightCalled = false;
        _addressWellInput._highlight = function () {
            highlightCalled = true;
        };

        var event = {
            preventDefault: function () { },
            stopPropagation: function () { }
        };

        _addressWellInput._getSourceRecipientElement = function () { return {}; };
        
        var reset = function () {
            containerClickCalled = false;
            displayContextMenuForRecipientCalled = false;
            displayContextMenuForContainerCalled = false;
            highlightCalled = false;
        };

        tc.areEqual("CONTENT", window.clipboardData.getData("Text"), "Invalid test setup: Clipboard data is not being set correctly");

        // Test when context menu is invoked by tap/click on a recipient and the recipient is the same as the highlighted recipient
        _addressWellInput._highlightIndex = 1; // There's already a highlighted recipient
        _addressWellInput._getRecipientIndex = function () { return 1; }; // Clicked recipient is the same as highlighted recipient
        _addressWellInput._containerContextMenuHandler(event);
        tc.isFalse(containerClickCalled, "1a - container clicked should not have been called since there is a recipient being highlighted");
        tc.isFalse(highlightCalled, "1a - highlight should not have been called");
        tc.isTrue(displayContextMenuForRecipientCalled, "1a - display context menu for recipient");

        reset();

        // Test when context menu is invoked by tap/click on a recipient and the recipient is NOT the same as the highlighted recipient
        _addressWellInput._highlightIndex = 1; // There's already a highlighted recipient
        _addressWellInput._getRecipientIndex = function () { return 2; }; // Clicked recipient is NOT the same as highlighted recipient
        _addressWellInput._containerContextMenuHandler(event);
        tc.isFalse(containerClickCalled, "1b - container clicked should not have been called since there is a recipient being highlighted");
        tc.isTrue(highlightCalled, "1b - highlight should have been called");
        tc.isTrue(displayContextMenuForRecipientCalled, "1b - display context menu for recipient");

        reset();

        // Test when context menu is invoked by tap/click on the container
        _addressWellInput._highlightIndex = -1;
        _addressWellInput._getSourceRecipientElement = function () { return null; }; // Didn't click on any particular element
        _addressWellInput._containerContextMenuHandler(event);
        tc.isTrue(containerClickCalled, "3 - container clicked should have been called since no recipient is being highlighted");
        tc.isTrue(displayContextMenuForContainerCalled, "3 - container context menu should have been called");

        reset();

        // Test when context menu is invoked by click/tap on the container and there is a recipient highlighted
        _addressWellInput._highlightIndex = 1; // There's a highlighted recipient
        _addressWellInput._getSourceRecipientElement = function () { return null; }; // Didn't click on any particular element
        _addressWellInput._getRecipientIndex = function () { tc.fail("Unexpected call to getRecipientIndex"); };
        _addressWellInput._containerContextMenuHandler(event);
        tc.isFalse(containerClickCalled, "4 - container click should not have been called since a recipient is highlighted");
        tc.isFalse(highlightCalled, "4 - should not highlight a new recipient since we didn't click on a recipient");
        tc.isFalse(displayContextMenuForRecipientCalled, "4 - should not use the recipient context menu since we didn't click on a recipient");
        tc.isTrue(displayContextMenuForContainerCalled, "4 - container context menu should have been called");
    });

    Tx.test("AddressWellInputUnitTests.testDisplayContextMenuForRecipient", function (tc) {
        /// <summary>
        /// Tests that the helper function actually invokes the context menu rendering logic and we got correct menu items.
        /// This function only runs in WWA mode.
        /// This function does not verify clicking the menu item as there is a P0 BVT to verify that.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        if (Jx.isWWA) {
            _addressWellInput._recipients.push(_makeRecipient({}, AddressWell.RecipientState.resolved));
            _addressWellInput._showContextMenuForRecipient = function () { };
            var menu = _addressWellInput._displayContextMenuForRecipient(0);
            tc.areEqual(5, menu.commands.length, "There should be only five menu commands");
            tc.areEqual("launchProfile", menu.commands[0].id, "First command is incorrect");
            tc.areEqual("cut", menu.commands[1].id, "First command is incorrect");
            tc.areEqual("copy", menu.commands[2].id, "Second command is incorrect");
            tc.areEqual("edit", menu.commands[3].id, "Third command is incorrect");
            tc.areEqual("removeRecipient", menu.commands[4].id, "Fourth command is incorrect");
        }
    });

    Tx.test("AddressWellInputUnitTests.testDisplayContextMenuForContainer", function (tc) {
        /// <summary>
        /// Tests that the helper function actually invokes the context menu rendering logic and we got correct menu items.
        /// This function only runs in WWA mode.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        if (Jx.isWWA) {
            _addressWellInput._showContextMenuForContainer = function () { };
            var mockDOMEvent = {};
            var menu = _addressWellInput._displayContextMenuForContainer(mockDOMEvent);
            tc.areEqual(1, menu.commands.length, "There should be only one menu command");
            tc.areEqual("paste", menu.commands[0].id, "First command is incorrect");
        }
    });*/

    Tx.test("AddressWellInputUnitTests.testRecipientClickHandler", function (tc) {
        /// <summary>
        /// Verifies the recipient click handler when the recipient is not highlighted
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var recipientElement = { id: "mockRecipientElement" };
        var changedHighlight = false;
        var contextMenuDisplayed = false;

        // Set up state so that the recipient is not highlighted.
        _addressWellInput._getRecipientIndex = function () { return 5; };
        _addressWellInput._highlightIndex = -1;

        // Unit test verification
        _addressWellInput._highlight = function (element) {
            changedHighlight = true;
            tc.areEqual(recipientElement, element, "Recipient element did not match");
        };
        _addressWellInput._displayContextMenuForRecipient = function () {
            contextMenuDisplayed = true;
        };

        _addressWellInput._recipientClickHandler(recipientElement);

        tc.isTrue(changedHighlight, "Expected call to highlight");
        tc.isTrue(contextMenuDisplayed, "Expected call to display context menu");
    });

    Tx.test("AddressWellInputUnitTests.testRecipientClickHandlerHighlighted", function (tc) {
        /// <summary>
        /// Verifies the recipient click handler when the recipient is highlighted
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var contextMenuDisplayed = false;

        // Set up state so that the recipient is highlighted
        _addressWellInput._getRecipientIndex = function () { return 5; };
        _addressWellInput._highlightIndex = 5;

        // Unit Test verification
        _addressWellInput._displayContextMenuForRecipient = function () { contextMenuDisplayed = true; };
        _addressWellInput._highlight = function () { tc.fail("Unexpected call to highlight"); };

        _addressWellInput._recipientClickHandler({});

        tc.isTrue(contextMenuDisplayed, "Expected call to display context menu");
    });

    Tx.test("AddressWellInputUnitTests.testRecipientKeyDownHandler", function (tc) {
        /// <summary>
        /// Tests that function handles the keys appropriately.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Tab
        var clearHighlightCalled = false;
        _addressWellInput.clearHighlight = function () { clearHighlightCalled = true; };
        var domEvent = { key: AddressWell.Key.tab };
        _addressWellInput._recipientKeyDownHandler(domEvent);
        tc.isTrue(clearHighlightCalled);

        // Arrow left
        var arrowKeyCalled = false;
        _addressWellInput._arrowKeyHandler = function (ev) { arrowKeyCalled = true; };
        _addressWellInput._rootElement = {};

        domEvent = { key: AddressWell.Key.arrowLeft };
        _addressWellInput._recipientKeyDownHandler(domEvent);
        tc.isTrue(arrowKeyCalled);

        // Arrow right
        arrowKeyCalled = false;
        domEvent = { key: AddressWell.Key.arrowRight };
        _addressWellInput._recipientKeyDownHandler(domEvent);
        tc.isTrue(arrowKeyCalled);

        // Page up
        _addressWellInput._rootElement.scrollTop = AddressWell.pagingHeightForRecipients + 1;
        domEvent = { key: AddressWell.Key.pageUp };
        _addressWellInput._recipientKeyDownHandler(domEvent);
        tc.areEqual(1, _addressWellInput._rootElement.scrollTop);

        // Page down
        _addressWellInput._rootElement.scrollHeight = 100;
        _addressWellInput._rootElement.scrollTop = 0;
        domEvent = { key: AddressWell.Key.pageDown };
        _addressWellInput._recipientKeyDownHandler(domEvent);
        tc.areEqual(100, _addressWellInput._rootElement.scrollTop);

        // Enter
        var displayConextMenuForRecipientInvoked = false;
        _addressWellInput._highlightIndex = 5;
        domEvent = { key: AddressWell.Key.enter, preventDefault: Jx.fnEmpty };
        _addressWellInput._displayContextMenuForRecipient = function (recipientIndex) {
            tc.areEqual(recipientIndex, _addressWellInput._highlightIndex);
            displayConextMenuForRecipientInvoked = true;
        };
        _addressWellInput._recipientKeyDownHandler(domEvent);
        tc.isTrue(displayConextMenuForRecipientInvoked);

        // Spacebar
        displayConextMenuForRecipientInvoked = false;
        _addressWellInput._highlightIndex = 2;
        domEvent = { key: AddressWell.Key.spacebar, preventDefault: Jx.fnEmpty };
        _addressWellInput._displayContextMenuForRecipient = function (recipientIndex) {
            tc.areEqual(recipientIndex, _addressWellInput._highlightIndex);
            displayConextMenuForRecipientInvoked = true;
        };
        _addressWellInput._recipientKeyDownHandler(domEvent);
        tc.isTrue(displayConextMenuForRecipientInvoked);


        // CTRL + <Var> cases
        // CTRL + C
        var copyHandlerCalled = false;
        _addressWellInput._inputCopyHandler = function (ev) { copyHandlerCalled = true; };

        domEvent = { key: AddressWell.Key.c,
            ctrlKey: true
        };
        _addressWellInput._recipientKeyDownHandler(domEvent);
        tc.isTrue(copyHandlerCalled, "Copy Handler was not called as expected");

        // CTRL + X
        var cutHandlerCalled = false;
        _addressWellInput._inputCutHandler = function (ev) { cutHandlerCalled = true; };

        domEvent = { key: AddressWell.Key.x,
            ctrlKey: true
        };
        _addressWellInput._recipientKeyDownHandler(domEvent);
        tc.isTrue(cutHandlerCalled, "Cut Handler was not called as expected");

        // CTRL + ENTER
        var keyDownCalledOnCtrlEnter = false;
        _addressWellInput._inputKeyDownHandler = function (ev) { keyDownCalledOnCtrlEnter = true; };
        _addressWellInput.focus = function () { };

        domEvent = { key: AddressWell.Key.enter,
            ctrlKey: true
        };
        _addressWellInput._recipientKeyDownHandler(domEvent);
        tc.isTrue(keyDownCalledOnCtrlEnter, "CTRL + Enter was not passed on as expected");
    });

    Tx.test("AddressWellInputUnitTests.testInputFocusHandler", function (tc) {
        /// <summary>
        /// Tests that function does the right things
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Mock up functions
        var addFocusToContainerCalled = false;
        _addressWellInput.addFocusToContainer = function () {
            addFocusToContainerCalled = true;
        };
        _addressWellInput.raiseEvent = function (name) {
        };

        // Empty input case
        _addressWellInput._inputElement = { value: "" };
        _addressWellInput._inputFocusHandler();
        tc.isTrue(addFocusToContainerCalled, "addFocusToContainer should have been called");
        tc.areEqual("", _addressWellInput._inputElement.value, "Input value should be empty");

        // Non empty input case
        addFocusToContainerCalled = false;
        _addressWellInput._inputElement = { value: "abc" };
        _addressWellInput._inputFocusHandler();
        tc.isTrue(addFocusToContainerCalled, "addFocusToContainer should have been called");
        tc.areEqual("abc", _addressWellInput._inputElement.value, "Input value should be unchanged");
    });

    function testInputKeyDown(
    tc,
    key,
    assertDescription,
    shouldCompleteUserInput,
    shouldCallPreventDefault,
    shouldCallStopPropagation,
    shouldCallDeleteHandler,
    shouldFireTabEvent,
    shouldFireEscapeEvent,
    shouldFireArrowEvent,
    shouldFireCompleteKeyEvent,
    shouldShiftKeyBePressed,
    shouldCtrlKeyBePressed,
    shouldDisplayContextMenuForRecipient,
    shouldFirePageKeyEvent,
    shouldCallHighlight,
    keyCode) {
        /// <summary>
        /// Helper function for testing the keyDown event handler
        /// </summary>

        // Mock up objects and functions

        var completeUserInputCalled = false;
        var deleteHandlerCalled = false;
        var preventDefaultCalled = false;
        var stopPropagationCalled = false;
        var tabEventCalled = false;
        var escapeEventCalled = false;
        var arrowEventCalled = false;
        var completeEventCalled = false;
        var displayContextManuCalled = false;
        var pageKeyEventCalled = false;
        var highlightCalled = false;

        _addressWellInput._inputElement = { blur: Jx.fnEmpty };

        _addressWellInput.completeUserInput = function () {
            completeUserInputCalled = true;
        };
        _addressWellInput._deleteHandler = function (ev) {
            deleteHandlerCalled = true;
        };
        _addressWellInput._arrowKeyHandler = function () {
            arrowEventCalled = true;
        };
        _addressWellInput._displayContextMenuForRecipient = function () {
            displayContextManuCalled = true;
        };
        _addressWellInput.raiseEvent = function (eventName) {
            if (eventName === AddressWell.Events.addressWellTabKey) {
                tabEventCalled = true;
            } else if (eventName === AddressWell.Events.addressWellEscapeKey) {
                escapeEventCalled = true;
            } else if (eventName === AddressWell.Events.addressWellCompleteKey) {
                completeEventCalled = true;
            } else if (eventName === AddressWell.Events.pageKey) {
                pageKeyEventCalled = true;
            } else {
                tc.fail("Unexpected event name for fireDirect: " + eventName);
            }
        };
        _addressWellInput._highlight = function () { highlightCalled = true; };

        var domEvent = {};
        domEvent.key = key;
        domEvent.keyCode = keyCode;
        domEvent.preventDefault = function () {
            preventDefaultCalled = true;
        };
        domEvent.stopPropagation = function () {
            stopPropagationCalled = true;
        };
        if (shouldShiftKeyBePressed) {
            domEvent.shiftKey = true;
        } else {
            domEvent.shiftKey = false;
        }

        if (shouldCtrlKeyBePressed) {
            domEvent.ctrlKey = true;
        } else {
            domEvent.ctrlKey = false;
        }
        _addressWellInput._inputKeyDownHandler(domEvent);

        tc.areEqual(shouldCompleteUserInput, completeUserInputCalled, "CompleteUserInput called state was not as expected for case: " + assertDescription);
        tc.areEqual(shouldCallPreventDefault, preventDefaultCalled, "preventDefault called state was not as expected for case: " + assertDescription);
        tc.areEqual(shouldCallStopPropagation, stopPropagationCalled, "stopPropagation called state was not as expected for case: " + assertDescription);
        tc.areEqual(shouldCallDeleteHandler, deleteHandlerCalled, "Delete handler called state was not expected for case: " + assertDescription);
        tc.areEqual(shouldFireTabEvent, tabEventCalled, "Tab event fired state was not as expected for case: " + assertDescription);
        tc.areEqual(shouldFireEscapeEvent, escapeEventCalled, "Escape event fired state was not as expected for case: " + assertDescription);
        tc.areEqual(shouldFireArrowEvent, arrowEventCalled, "Arrow event fired state was not as expected for case: " + assertDescription);
        tc.areEqual(shouldFireCompleteKeyEvent, completeEventCalled, "Complete event fired state was not as expected for case: " + assertDescription);
        tc.areEqual(shouldDisplayContextMenuForRecipient, displayContextManuCalled, "Display context menu was not expected for case: " + assertDescription);
        tc.areEqual(shouldFirePageKeyEvent, pageKeyEventCalled, "Page up/down event fired state was not as expected for case: " + assertDescription);
        tc.areEqual(shouldCallHighlight, highlightCalled, "highlightCalled is not expected for case: " + assertDescription);
    }

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerEnterInput", function (tc) {
        /// <summary>
        /// Tests that inputKeyDownHandler is routing to the correct functions for the Enter key when the highlight is in the input area.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Highlight in input area
        _addressWellInput.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input);

        testInputKeyDown(tc, AddressWell.Key.enter,
            "Enter key with highlight in input",
            true, // completeUserInput
            true, // preventDefault
            false, // stopPropagation
            false, // deleteHandler
            false, // tab event
            false, // escape event
            false, // arrow event
            false, // complete key event
            false, // ev.shiftKey
            false, // ev.ctrlKey
            false, // display context menu
            false, // page key event
            false, // highlight
            0); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerCtrlEnterDropDown", function (tc) {
        /// <summary>
        /// Tests that inputKeyDownHandler is routing to the correct functions for the CTRL + Enter key when the highlight is in the dropdown area.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        _addressWellInput.setAttr(AddressWell.dropDownVisibleAttr, true);

        // Highlight in dropdown area
        _addressWellInput.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.dropDown);

        testInputKeyDown(tc, AddressWell.Key.enter,
            "Enter key with highlight in dropdown",
            false, // completeUserInput
            true, // preventDefault
            true, // stopPropagation
            false, // deleteHandler
            false, // tab event
            false, // escape event
            false, // arrow event
            true, // complete key event
            false, // ev.shiftKey
            true, // ev.ctrlKey
            false, // display context menu
            false, // page key event
            false, // highlight
            0); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerTabInput", function (tc) {
        /// <summary>
        /// Tests that inputKeyDownHandler is routing to the correct functions for the tab key when the highlight is in the input area.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Highlight in input area
        _addressWellInput.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input);

        testInputKeyDown(tc, AddressWell.Key.tab,
            "Tab key with highlight in input",
            false, // completeUserInput
            false, // preventDefault
            false, // stopPropagation
            false, // deleteHandler
            true, // tab event
            false, // escape event
            false, // arrow event
            false, // complete key event
            false, // ev.shiftKey
            false, // ev.ctrlKey
            false, // display context menu
            false, // page key event
            false, // highlight
            0); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerDeleteInput", function (tc) {
        /// <summary>
        /// Tests that inputKeyDownHandler is routing to the correct functions for the delete key when the highlight is in the input area.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Highlight in input area
        _addressWellInput.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input);

        testInputKeyDown(tc, AddressWell.Key.deleteKey,
            "Delete key with highlight in input",
            false, // completeUserInput
            false, // preventDefault
            true, // stopPropagation
            true, // deleteHandler
            false, // tab event
            false, // escape event
            false, // arrow event
            false, // complete key event
            false, // ev.shiftKey
            false, // ev.ctrlKey
            false, // display context menu
            false, // page key event
            false, // highlight
            0); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerBackspaceInput", function (tc) {
        /// <summary>
        /// Tests that inputKeyDownHandler is routing to the correct functions for the backspace key when the highlight is in the input area.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Highlight in input area
        _addressWellInput.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input);

        testInputKeyDown(tc, AddressWell.Key.backspace,
            "Backspace key with highlight in input",
            false, // completeUserInput
            false, // preventDefault
            true, // stopPropagation
            true, // deleteHandler
            false, // tab event
            false, // escape event
            false, // arrow event
            false, // complete key event
            false, // ev.shiftKey
            false, // ev.ctrlKey
            false, // display context menu
            false, // page key event
            false, // highlight
            0); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerEscapeDropDownVisible", function (tc) {
        /// <summary>
        /// Tests that inputKeyDownHandler is routing to the correct functions for the escape key.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        _addressWellInput.setAttr(AddressWell.dropDownVisibleAttr, true);

        testInputKeyDown(tc, AddressWell.Key.escape,
            "Escape key",
            false, // completeUserInput
            true, // preventDefault
            true, // stopPropagation
            false, // deleteHandler
            false, // tab event
            true, // escape event
            false, // arrow event
            false, // complete key event
            false, // ev.shiftKey
            false, // ev.ctrlKey
            false, // display context menu
            false, // page key event
            false, // highlight
            0); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerEscapeDropDownInvisible", function (tc) {
        /// <summary>
        /// Tests that inputKeyDownHandler is routing to the correct functions for the escape key.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        _addressWellInput.setAttr(AddressWell.dropDownVisibleAttr, false);

        testInputKeyDown(tc, AddressWell.Key.escape,
            "Escape key",
            false, // completeUserInput
            false, // preventDefault
            false, // stopPropagation
            false, // deleteHandler
            false, // tab event
            true, // escape event
            false, // arrow event
            false, // complete key event
            false, // ev.shiftKey
            false, // ev.ctrlKey
            false, // display context menu
            false, // page key event
            false, // highlight
            0); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerSelectionInput", function (tc) {
        /// <summary>
        /// Tests that function is invoking context menu for recipient.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Highlight in input area
        _addressWellInput.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input);
        _addressWellInput._highlightIndex = 0;

        testInputKeyDown(tc, AddressWell.Key.selection,
            "Selection key with highlight in input",
            false, // completeUserInput
            true, // preventDefault
            true, // stopPropagation
            false, // deleteHandler
            false, // tab event
            false, // escape event
            false, // arrow event
            false, // complete key event
            false, // ev.shiftKey
            false, // ev.ctrlKey
            true, // display context menu
            false, // page key event
            false, // highlight
            0); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerShiftF10Input", function (tc) {
        /// <summary>
        /// Tests that function is invoking context menu for recipient.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Highlight in input area
        _addressWellInput.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input);
        _addressWellInput._highlightIndex = 0;

        testInputKeyDown(tc, AddressWell.Key.f10,
            "Selection key with highlight in input",
            false, // completeUserInput
            true, // preventDefault
            true, // stopPropagation
            false, // deleteHandler
            false, // tab event
            false, // escape event
            false, // arrow event
            false, // complete key event
            true, // ev.shiftKey
            false, // ev.ctrlKey
            true, // display context menu
            false, // page key event
            false, // highlight
            0); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerSelectionDropDown", function (tc) {
        /// <summary>
        /// Tests that function is invoking context menu for recipient.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Highlight in dropdown area
        _addressWellInput.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.dropDown);

        testInputKeyDown(tc, AddressWell.Key.selection,
            "Selection key with highlight in drop down",
            false, // completeUserInput
            false, // preventDefault
            true, // stopPropagation
            false, // deleteHandler
            false, // tab event
            false, // escape event
            false, // arrow event
            false, // complete key event
            false, // ev.shiftKey
            false, // ev.ctrlKey
            false, // display context menu
            false, // page key event
            false, // highlight
            0); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerArrowInput", function (tc) {
        /// <summary>
        /// Tests that inputKeyDownHandler is routing to the correct functions for an arrow key when the highlight is in the input area.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Highlight in input area
        _addressWellInput.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input);

        testInputKeyDown(tc, AddressWell.Key.arrowUp,
            "Arrow key with highlight in input",
            false, // completeUserInput
            false, // preventDefault
            true, // stopPropagation
            false, // deleteHandler
            false, // tab event
            false, // escape event
            true, // arrow event
            false, // complete key event
            false, // ev.shiftKey
            false, // ev.ctrlKey
            false, // display context menu
            false, // page key event
            false, // highlight
            0); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerOtherInput", function (tc) {
        /// <summary>
        /// Tests that inputKeyDownHandler is routing to the correct functions for the "other" key case when the highlight is in the input area.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Highlight in input area
        _addressWellInput.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input);

        testInputKeyDown(tc, 0,
            "Other key with highlight in input",
            false, // completeUserInput
            false, // preventDefault
            false, // stopPropagation
            false, // deleteHandler
            false, // tab event
            false, // escape event
            false, // arrow event
            false, // complete key event
            false, // ev.shiftKey
            false, // ev.ctrlKey
            false, // display context menu
            false, // page key event
            false, // highlight
            0); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerPageUpDropDown", function (tc) {
        /// <summary>
        /// Tests that function is firing the pageKey event when highlight is in drop down.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Highlight in dropdown area
        _addressWellInput.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.dropDown);

        testInputKeyDown(tc, AddressWell.Key.pageUp,
            "Page Up key with highlight in drop down",
            false, // completeUserInput
            false, // preventDefault
            false, // stopPropagation
            false, // deleteHandler
            false, // tab event
            false, // escape event
            false, // arrow event
            false, // complete key event
            false, // ev.shiftKey
            false, // ev.ctrlKey
            false, // display context menu
            true, // page key event
            false, // highlight
            0); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerPageDownInput", function (tc) {
        /// <summary>
        /// Tests that function is not firing the pageKey event when highlight is in inptc.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Highlight in dropdown area
        _addressWellInput.setAttr(AddressWell.highlightAreaAttr, AddressWell.HighlightArea.input);

        testInputKeyDown(tc, AddressWell.Key.pageDown,
            "Page Down key with highlight in input",
            false, // completeUserInput
            false, // preventDefault
            false, // stopPropagation
            false, // deleteHandler
            false, // tab event
            false, // escape event
            false, // arrow event
            false, // complete key event
            false, // ev.shiftKey
            false, // ev.ctrlKey
            false, // display context menu
            false, // page key event
            false, // highlight
            0); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerKeyCodeIMEInUse", function (tc) {
        /// <summary>
        /// Tests that function is not processed when IME is in use.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        testInputKeyDown(tc, AddressWell.Key.pageDown,
            "IME is in use",
            false, // completeUserInput
            false, // preventDefault
            false, // stopPropagation
            false, // deleteHandler
            false, // tab event
            false, // escape event
            false, // arrow event
            false, // complete key event
            false, // ev.shiftKey
            false, // ev.ctrlKey
            false, // display context menu
            false, // page key event
            false, // highlight
            AddressWell.imeInUseKeyCode); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerHome1", function (tc) {
        /// <summary>
        /// Tests that function does not call highlight in the case of empty input value.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        _addressWellInput._inputElement = { value: "" };

        _addressWellInput._containerElement = {
            children: [_addressWellInput._inputElement]
        };

        testInputKeyDown(tc, AddressWell.Key.home,
            "Home key on empty input field",
            false, // completeUserInput
            false, // preventDefault
            false, // stopPropagation
            false, // deleteHandler
            false, // tab event
            false, // escape event
            false, // arrow event
            false, // complete key event
            false, // ev.shiftKey
            false, // ev.ctrlKey
            false, // display context menu
            false, // page key event
            false, // highlight
            0); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerHome2", function (tc) {
        /// <summary>
        /// Tests that function calls highlight for home key in the case of non-empty inptc.
        /// </summary>

         tc.cleanup = cleanup;
        setup();
       _addressWellInput._inputElement = { value: "abc" };

       _addressWellInput._containerElement = {
           children: [{}, _addressWellInput._inputElement]
       };

        testInputKeyDown(tc, AddressWell.Key.home,
            "Home key on non empty input field",
            false, // completeUserInput
            true, // preventDefault
            false, // stopPropagation
            false, // deleteHandler
            false, // tab event
            false, // escape event
            false, // arrow event
            false, // complete key event
            false, // ev.shiftKey
            false, // ev.ctrlKey
            false, // display context menu
            false, // page key event
            true, // highlight
            0); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerEnd1", function (tc) {
        /// <summary>
        /// Tests that function does not call highlight in the case of empty input value
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        _addressWellInput._inputElement = { value: "" };

        _addressWellInput._containerElement = {
            children: [_addressWellInput._inputElement]
        };

        testInputKeyDown(tc, AddressWell.Key.end,
            "End key on empty input field",
            false, // completeUserInput
            false, // preventDefault
            false, // stopPropagation
            false, // deleteHandler
            false, // tab event
            false, // escape event
            false, // arrow event
            false, // complete key event
            false, // ev.shiftKey
            false, // ev.ctrlKey
            false, // display context menu
            false, // page key event
            false, // highlight
            0); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testInputKeyDownHandlerEnd2", function (tc) {
        /// <summary>
        /// Tests that function calls highlight for end key in the case of non-empty inptc.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        _addressWellInput._inputElement = { value: "abc" };

        _addressWellInput._containerElement = {
            children: [{}, _addressWellInput._inputElement]
        };

        testInputKeyDown(tc, AddressWell.Key.end,
            "End key on non empty input field",
            false, // completeUserInput
            true, // preventDefault
            false, // stopPropagation
            false, // deleteHandler
            false, // tab event
            false, // escape event
            false, // arrow event
            false, // complete key event
            false, // ev.shiftKey
            false, // ev.ctrlKey
            false, // display context menu
            false, // page key event
            true, // highlight
            0); // keyCode
    });

    Tx.test("AddressWellInputUnitTests.testNotifyInputChange", function (tc) {
        /// <summary>
        /// Tests that notifyInputChange is setting the attribute correctly.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Mock up objects and functions
        _addressWellInput._inputElement = { value: "" };
        var raiseEventCalled = false;
        _addressWellInput.raiseEvent = function (name) {
            tc.areEqual(name, AddressWell.Events.userInputChanged, "Incorrect event raised");
            raiseEventCalled = true;
        };

        // Case 1: Input value consists of white spaces
        raiseEventCalled = false;
        _addressWellInput.isDirty = false;
        _addressWellInput._inputElement = { value: "       " };
        _addressWellInput._notifyInputChange();
        tc.isTrue(raiseEventCalled);
        tc.isTrue(_addressWellInput.isDirty, "1 - isDirty should be set to true");

        // Case 2: valid input value
        raiseEventCalled = false;
        _addressWellInput.isDirty = false;
        _addressWellInput._inputElement = { value: "abc" };
        _addressWellInput._notifyInputChange();
        tc.isTrue(raiseEventCalled);
        tc.isTrue(_addressWellInput.isDirty, "2 - isDirty should be set to true");

        // Case 3: Input is the same as previous input
        raiseEventCalled = false;
        _addressWellInput._previousInputValue = "saved value";
        _addressWellInput.isDirty = false;
        _addressWellInput._inputElement = { value: "saved value" };
        _addressWellInput._notifyInputChange();
        tc.isFalse(raiseEventCalled, "Raise event should not have been called");
        tc.isFalse(_addressWellInput.isDirty, "3 - isDirty should not have been changed");
    });

    Tx.test("AddressWellInputUnitTests.testInputChangeHandler", function (tc) {
        /// <summary>
        /// Tests that function is setting the values correctly
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var handleInputUpdateCalled = false;
        _addressWellInput._handleInputUpdate = function () {
            handleInputUpdateCalled = true;
        };

        _addressWellInput._inputElement = { value: "" };
        //_addressWellInput._biciRecipientAddMethod === -1;
        _addressWellInput.addRecipientsByString = function (value, addMethod) {
            tc.areEqual(AddressWell.RecipientAddMethod.typing, addMethod, "BICI method is incorrect");
        };
        _addressWellInput._inputChangeHandler();
        tc.isTrue(handleInputUpdateCalled);
    });

    Tx.test("AddressWellInputUnitTests.testInputChangeHandlerDuringComposition", function (tc) {
        /// <summary>
        /// Verifies that input doesn't trigger addRecipientsByString during IME composition
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var handleInputUpdateCalled = false;
        _addressWellInput._handleInputUpdate = function () {
            handleInputUpdateCalled = true;
        };

        _addressWellInput.addRecipientsByString = function () {
            tc.fail("Unexpected call to addRecipientsByString");
        };

        _addressWellInput._imeStartHandler();
        _addressWellInput._inputChangeHandler();

        // The other "test" is that it doesn't hit the fail case, above.
        tc.isTrue(handleInputUpdateCalled, "Need to call handleInputUpdate even during IME composition");
    });

    Tx.test("AddressWellInputUnitTests.testInputCopyHandler", function (tc) {
        /// <summary>
        /// Tests that function is copying the right recipient text onto the clipboard
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        _addressWellInput._recipients = [_makeRecipient({ calculatedUIName: "name", emailAddress: "myName@email.com"})];
        _addressWellInput._highlightIndex = 0;
        _addressWellInput._copyText = function (text) {
            tc.areEqual('"name" <myName@email.com>;', text, "Incorrect recipient text being placed on clipboard");
        };
        _addressWellInput._inputCopyHandler();
    });

    Tx.test("AddressWellInputUnitTests.testInputEditHandler", function (tc) {
        /// <summary>
        /// Tests that function is copying the right recipient information onto the clipboard
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        _addressWellInput._containerPasteHandler = function (text) {
            tc.areEqual('myName@email.com', text, "Incorrect recipient text being placed on clipboard");
        };
        var hasAnimation = true;
        _addressWellInput._deleteHighlight = function (withAnimation) {
            tc.areEqual(hasAnimation, withAnimation);
        };
        _addressWellInput._recipients = [{ calculatedUIName: "name", emailAddress: "myName@email.com"}];
        _addressWellInput._highlightIndex = 0;
        _addressWellInput._inputEditHandler(hasAnimation);
    });

    Tx.test("AddressWellInputUnitTests.testDeleteHandler", function (tc) {
        /// <summary>
        /// Tests that deleteHandler is calling the right functions.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Set up mock objects and functions
        var deleteHighlightCalled = false;
        var adjustInputFieldLengthCalled = false;
        _addressWellInput._inputElement = {};
        _addressWellInput._deleteHighlight = function () {
            deleteHighlightCalled = true;
        };
        _addressWellInput.adjustInputFieldLength = function () {
            adjustInputFieldLengthCalled = true;
        };

        // Case 1 - Backspace on empty input value, empty recipients list
        _addressWellInput._highlightIndex = -1;
        _addressWellInput._getIndexToLastRecipient = function () { return -1; };
        _addressWellInput._inputElement.value = "";
        _addressWellInput._deleteHandler({ key: AddressWell.Key.backspace });
        tc.areEqual(-1, _addressWellInput._highlightIndex, "highlightIndex is incorrect Case 1");
        tc.isFalse(deleteHighlightCalled, "deleteHighlight should not have been called Case 1");
        tc.isFalse(adjustInputFieldLengthCalled, "adjustInputFieldLength should not have been called Case 1");

        // Case 2 - Backspace on empty input value, non-empty recipients list, recipient is not a contact
        _addressWellInput._highlightIndex = -1;
        _addressWellInput._getIndexToLastRecipient = function () { return 0; };
        _addressWellInput._recipients = [_makeRecipient({ person: { objectId: "id" } })];
        _addressWellInput._inputElement.value = "";
        deleteHighlightCalled = false;
        hightElementCalled = false;
        adjustInputFieldLengthCalled = false;
        var domEvent = {
            key: AddressWell.Key.backspace,
            preventDefault: function () { }
        };
        _addressWellInput._inputEditHandler = function (withAnimation) {
            tc.isFalse(withAnimation, "inputEditHandler should have been called Case 2.5");
        };
        _addressWellInput._highlight = function () {
            hightElementCalled = true;
        }
        _addressWellInput._deleteHandler(domEvent);
        tc.isFalse(deleteHighlightCalled, "deleteHighlight should not have been called Case 2");
        tc.isFalse(adjustInputFieldLengthCalled, "adjustInputFieldLength should not have been called Case 2");
        tc.isTrue(hightElementCalled, "_hightlight() should have been called, not _deleteHighlight");

        // Case 3 - Backspace on non-empty input value, non-empty recipients list
        _addressWellInput._highlightIndex = -1;
        _addressWellInput._getIndexToLastRecipient = function () { return 0; };
        _addressWellInput._inputElement.value = "abc";
        deleteHighlightCalled = false;
        adjustInputFieldLengthCalled = false;
        _addressWellInput._deleteHandler({ key: AddressWell.Key.backspace });
        tc.areEqual(-1, _addressWellInput._highlightIndex, "highlightIndex is incorrect Case 3");
        tc.isFalse(deleteHighlightCalled, "deleteHighlight should have been called Case 3");
        tc.isTrue(adjustInputFieldLengthCalled, "adjustInputFieldLength should have been called Case 3");

        // Case 4 - Delete on non-empty input value, non-empty recipients list
        _addressWellInput._highlightIndex = -1;
        _addressWellInput._getIndexToLastRecipient = function () { return 0; };
        _addressWellInput._inputElement.value = "abc";
        deleteHighlightCalled = false;
        adjustInputFieldLengthCalled = false;
        _addressWellInput._deleteHandler({ key: AddressWell.Key.deleteKey });
        tc.areEqual(-1, _addressWellInput._highlightIndex, "highlightIndex is incorrect Case 4");
        tc.isFalse(deleteHighlightCalled, "deleteHighlight should not have been called Case 4");
        tc.isTrue(adjustInputFieldLengthCalled, "adjustInputFieldLength should have been called Case 4");

        // Case 5 - Delete on empty input value, with highlight recipient
        _addressWellInput._highlightIndex = 1;
        _addressWellInput._inputElement.value = "";
        deleteHighlightCalled = false;
        adjustInputFieldLengthCalled = false;
        _addressWellInput._deleteHandler({ key: AddressWell.Key.deleteKey });
        tc.areEqual(1, _addressWellInput._highlightIndex, "highlightIndex is incorrect Case 5");
        tc.isTrue(deleteHighlightCalled, "deleteHighlight should have been called Case 5");
        tc.isFalse(adjustInputFieldLengthCalled, "adjustInputFieldLength should not have been called Case 5");

        // Case 6 - Delete on empty input value, with non highlight recipient
        _addressWellInput._highlightIndex = -1;
        _addressWellInput._inputElement.value = "";
        deleteHighlightCalled = false;
        adjustInputFieldLengthCalled = false;
        _addressWellInput._deleteHandler({ key: AddressWell.Key.deleteKey });
        tc.areEqual(-1, _addressWellInput._highlightIndex, "highlightIndex is incorrect Case 6");
        tc.isFalse(deleteHighlightCalled, "deleteHighlight should not have been called Case 6");
        tc.isFalse(adjustInputFieldLengthCalled, "adjustInputFieldLength should not have been called Case 6");
    });

    Tx.test("AddressWellInputUnitTests.testArrowKeyHandler", function (tc) {
        /// <summary>
        /// Tests that arrow key logic is correct
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Mock up objects and functions
        var clearHighlightCalled = false;
        var focusCalled = false;
        var highlightCalled = false;
        var fireDirectCalled = false;
        var mockHighlightArea = AddressWell.HighlightArea.input;
        _addressWellInput.getAttr = function (attributeName) {
            if (attributeName === AddressWell.highlightAreaAttr) {
                return mockHighlightArea;
            }
        };
        _addressWellInput._recipients = [{}, {}, {}, {}, {}];
        _addressWellInput._getIndexToLastRecipient = function () {
            return _addressWellInput._recipients.length - 1;
        };
        _addressWellInput.clearHighlight = function () {
            clearHighlightCalled = true;
        };
        _addressWellInput.focus = function () {
            focusCalled = true;
        };
        _addressWellInput._highlight = function (element) {
            _addressWellInput._highlightIndex = element;
            highlightCalled = true;
        };
        _addressWellInput.raiseEvent = function (eventName) {
            if (eventName === AddressWell.Events.arrowKey) {
                fireDirectCalled = true;
            }
        };
        // Empty out item id base so that the element id is just the index string
        _addressWellInput._itemIdBase = "";
        document.getElementById = function (id) {
            return parseInt(id, 10 /*radix*/);
        };

        // Case 1: Input field is not empty, arrow key left
        _addressWellInput._inputElement = { value: "abc" };
        _addressWellInput._arrowKeyHandler({ key: AddressWell.Key.arrowLeft });
        tc.isFalse(clearHighlightCalled, "Case 1: clearHighlight should not have been called");
        tc.isFalse(focusCalled, "Case 1: focus should not have been called");
        tc.isFalse(highlightCalled, "Case 1: highlight should not have been called");
        tc.isFalse(fireDirectCalled, "Case 1: fireDirect should not have been called");

        // Case 2: Input field is empty, highlightArea is not input
        _addressWellInput._inputElement = { value: "" };
        mockHighlightArea = AddressWell.HighlightArea.dropDownList;
        _addressWellInput._arrowKeyHandler({ key: AddressWell.Key.arrowLeft });
        tc.isTrue(fireDirectCalled, "Case 2: fireDirect should be called");
        fireDirectCalled = false;

        // Case 3: Highlight area is input, key is neither left nor right arrow
        _addressWellInput._arrowKeyHandler({ key: AddressWell.Key.arrowUp });
        mockHighlightArea = AddressWell.HighlightArea.input;
        _addressWellInput._arrowKeyHandler({ key: AddressWell.Key.arrowLeft });
        tc.isTrue(fireDirectCalled, "Case 3: fireDirect should be called");
        fireDirectCalled = false;

        // Case 4: Left arrow with existing highlighted element in range
        _addressWellInput._highlightIndex = 1;
        _addressWellInput._arrowKeyHandler({ key: AddressWell.Key.arrowLeft });
        tc.isFalse(clearHighlightCalled, "Case 4: clearHighlight should not have been called");
        tc.isFalse(focusCalled, "Case 4: focus should not have been called");
        tc.isTrue(highlightCalled, "Case 4: highlight should have been called");
        tc.isFalse(fireDirectCalled, "Case 4: fireDirect should not have been called");
        tc.areEqual(0, _addressWellInput._highlightIndex, "Case 4: new highlight index is not correct");
        highlightCalled = false;

        // Case 5: Right arrow with existing highlighted element in range
        _addressWellInput._highlightIndex = 1;
        _addressWellInput._arrowKeyHandler({ key: AddressWell.Key.arrowRight });
        tc.isFalse(clearHighlightCalled, "Case 5: clearHighlight should not have been called");
        tc.isFalse(focusCalled, "Case 5: focus should not have been called");
        tc.isTrue(highlightCalled, "Case 5: highlight should have been called");
        tc.isFalse(fireDirectCalled, "Case 5: fireDirect should not have been called");
        tc.areEqual(2, _addressWellInput._highlightIndex, "Case 5: new highlight index is not correct");
        highlightCalled = false;

        // Case 6: Left arrow with existing highlighted element being the first item
        _addressWellInput._highlightIndex = 0;
        _addressWellInput._arrowKeyHandler({ key: AddressWell.Key.arrowLeft });
        tc.isFalse(highlightCalled, "Case 6: highlight should not have been called");
        tc.areEqual(0, _addressWellInput._highlightIndex, "Case 6: new highlight index is not correct");

        // Case 7: Right arrow with existing highlighted element being the last item
        _addressWellInput._highlightIndex = 4;
        _addressWellInput._arrowKeyHandler({ key: AddressWell.Key.arrowRight });
        tc.isTrue(clearHighlightCalled, "Case 7: clearHighlight should have been called");
        tc.isTrue(focusCalled, "Case 7: focus should have been called");
        tc.isFalse(highlightCalled, "Case 7: highlight should not have been called");
        clearHighlightCalled = false;
        focusCalled = false;

        // Case 8: Left arrow with no existing highlight
        _addressWellInput._highlightIndex = -1;
        _addressWellInput._arrowKeyHandler({ key: AddressWell.Key.arrowLeft });
        tc.isFalse(clearHighlightCalled, "Case 8: clearHighlight should not have been called");
        tc.isFalse(focusCalled, "Case 8: focus should not have been called");
        tc.isTrue(highlightCalled, "Case 8: highlight should have been called");
        tc.areEqual(4, _addressWellInput._highlightIndex, "Case 8: new highlight index is not correct");
        highlightCalled = false;

        // Case 9: Right arrow with no existing highlight
        _addressWellInput._highlightIndex = -1;
        _addressWellInput._arrowKeyHandler({ key: AddressWell.Key.arrowRight });
        tc.isFalse(clearHighlightCalled, "Case 9: clearHighlight should not have been called");
        tc.isFalse(focusCalled, "Case 9: focus should not have been called");
        tc.isFalse(highlightCalled, "Case 9: highlight should not have been called");
        tc.areEqual(-1, _addressWellInput._highlightIndex, "Case 9: new highlight index is not correct");

        // Case 10: Input field is not empty, arrow key is up
        _addressWellInput._inputElement = { value: "abc" };
        _addressWellInput._arrowKeyHandler({ key: AddressWell.Key.arrowUp });
        tc.isTrue(fireDirectCalled, "Case 10: fireDirect should have been called");
        fireDirectCalled = false;

        // Case 11: Input field is not empty, highlight area is not input, arrow key is left
        _addressWellInput._inputElement = { value: "abc" };
        mockHighlightArea = AddressWell.HighlightArea.dropDownList;
        _addressWellInput._arrowKeyHandler({ key: AddressWell.Key.arrowLeft });
        tc.isTrue(fireDirectCalled, "Case 11: fireDirect should have been called");
        fireDirectCalled = false;

        // Case 12: A null recipient is detected.  Right arrow with existing highlighted element in range
        _addressWellInput._inputElement = { value: "" };
        mockHighlightArea = AddressWell.HighlightArea.input;
        _addressWellInput._recipients = [{}, null, null, {}, {}];
        _addressWellInput._highlightIndex = 0;
        _addressWellInput._arrowKeyHandler({ key: AddressWell.Key.arrowRight });
        tc.isFalse(clearHighlightCalled, "Case 12: clearHighlight should not have been called");
        tc.isFalse(focusCalled, "Case 12: focus should not have been called");
        tc.isTrue(highlightCalled, "Case 12: highlight should have been called");
        tc.isFalse(fireDirectCalled, "Case 12: fireDirect should not have been called");
        tc.areEqual(3, _addressWellInput._highlightIndex, "Case 12: new highlight index is not correct");
        highlightCalled = false;
    });

    Tx.test("AddressWellInputUnitTests.testGetRecipientIndex", function (tc) {
        /// <summary>
        /// Ensures that function gets the right index
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var recipientElement = { id: _addressWellInput._itemIdBase + "5" };
        tc.areEqual(5, _addressWellInput._getRecipientIndex(recipientElement), "Incorrect index");
    });

    Tx.test("AddressWellInputUnitTests.testDeleteHighlight", function (tc) {
        /// <summary>
        /// Ensures that deleteHighlight calls the right functions
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Set up mock objects and functions
        var deleteRecipientByIndexCalled = false;
        _addressWellInput.deleteRecipientByIndex = function (index) {
            deleteRecipientByIndexCalled = true;
        };
        _addressWellInput.raiseEvent = function (name, value) {
            tc.areEqual(name, AddressWell.Events.removeRecipientIndex);
            tc.areEqual(value, 0);
        };

        // Case 1: Invalid highlight index
        _addressWellInput._highlightIndex = -1;
        _addressWellInput._deleteHighlight();
        tc.isFalse(deleteRecipientByIndexCalled, "Delete should not have happened");

        // Case 2: Verify deletion
        _addressWellInput._highlightIndex = 0;
        _addressWellInput._deleteHighlight();
        tc.isTrue(deleteRecipientByIndexCalled, "Delete should have happened");
    });

    Tx.test("AddressWellInputUnitTests.testHighlight", function (tc) {
        /// <summary>
        /// Tests that highlight function highlights the given element and calls the correct functions
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Mock up objects and functions
        _addressWellInput._inputElement = { id: "activeId" };
        var element = {
            name: "element",
            className: "",
            focus: function () { },
            removeAttribute: function () { }
        };
        var completeUserInputCalled = false;
        var clearHighlightCalled = false;
        var setAttrCalled = false;
        _addressWellInput.completeUserInput = function (shouldSignal) {
            completeUserInputCalled = true;
            tc.isTrue(shouldSignal);
        };
        _addressWellInput.clearHighlight = function () {
            clearHighlightCalled = true;
        };
        _addressWellInput.setAttr = function (attribute, value) {
            if (attribute === AddressWell.highlightAreaAttr && value === AddressWell.HighlightArea.input) {
                setAttrCalled = true;
            }
        };
        _addressWellInput._getRecipientIndex = function (element) {
            return 1;
        };
        document.activeElement = { id: "activeId" };
        AddressWell.scrollIntoContainer = function (container, element) { };

        // Verify highlight
        _addressWellInput._highlight(element);
        tc.isTrue(completeUserInputCalled, "completeUserInput should have been called");
        tc.isTrue(clearHighlightCalled, "clearHighlight should have been called");
        tc.areEqual(1, _addressWellInput._highlightIndex, "Highlight index is incorrect");
        tc.areEqual(" " + _addressWellInput._highlightClass, element.className, "Should have recieved highlight styles");
        tc.isTrue(setAttrCalled, "SetAttr is not called");
    });

    Tx.test("AddressWellInputUnitTests.testAddRecipientToCollection", function (tc) {
        /// <summary>
        /// Tests that a given recipient object is added to the collection.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var lastEvent = null;
        var eventCount = 0;
        var mockParent = {
            raiseEvent : function (eventName) {
                lastEvent = eventName;
                eventCount++;
            }
        };
        _addressWellInput.raiseEvent = function (eventName) {
            lastEvent = eventName;
            eventCount++;
        };
        _addressWellInput.getParent = function () {
            return mockParent;
        };

        // Test adding objects
        _addressWellInput._addRecipientsToCollection([{}]);
        tc.areEqual(1, _addressWellInput._recipients.length, "Length is incorrect");
        tc.areEqual(AddressWell.Events.recipientsAdded, lastEvent, "recipientsAdded event should be fired");

        _addressWellInput._addRecipientsToCollection([{}]);
        tc.areEqual(2, _addressWellInput._recipients.length, "Length is incorrect");
        tc.areEqual(AddressWell.Events.recipientsAdded, lastEvent, "recipientsAdded event should be fired");

        _addressWellInput._addRecipientsToCollection([{ person: { objectId: "id"} }]);
        tc.areEqual(3, _addressWellInput._recipients.length, "Length is incorrect");
        tc.areEqual(AddressWell.Events.recipientsAdded, lastEvent, "recipientsAdded event should be fired");
        tc.areEqual(3, eventCount, "recipientsAdded event should be fired 3 times so far");
    });

    Tx.test("AddressWellInputUnitTests.testGetRecipientString", function (tc) {
        /// <summary>
        /// Tests that function returns the correct string for a single recipient
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var recipient1 = _makeRecipient({ calculatedUIName: "Name1", emailAddress: "email1" });
        var recipient2 = _makeRecipient({ emailAddress: "email2" });
        var recipient3 = _makeRecipient({ calculatedUIName: "Name3" });
        var recipient4 = _makeRecipient({ calculatedUIName: '" NameInQuotes"', emailAddress: "email5" });

        var expected1 = '"Name1" <email1>;';
        var expected2 = '<email2>;';
        var expected3 = '"Name3" ;';
        var expected4 = '"\" NameInQuotes\"" <email5>;';

        tc.areEqual(expected1, recipient1.toString(), "Result 1 is incorrect");
        tc.areEqual(expected2, recipient2.toString(), "Result 2 is incorrect");
        tc.areEqual(expected3, recipient3.toString(), "Result 3 is incorrect");
        tc.areEqual(expected4, recipient4.toString(), "Result 4 is incorrect");
    });

    Tx.test("AddressWellInputUnitTests.testLoadRecipientByEmailInvalid", function (tc) {
        /// <summary>
        /// Tests that function constructs the recipient object in JS if appropriate
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var platform = {
            peopleManager: {
                loadRecipientByEmail: function () {
                    tc.fail("Unexpected call to loadRecipientByEmail");
                }
            }
        };
       
        // Note: email passed to _loadRecipientByEmail is invalid, which will cause it not to call into the peopleManager
        var recipient = AddressWell.Recipient.fromEmail("email", "name", platform);
        tc.areEqual("email", recipient.emailAddress);
        tc.areEqual("name", recipient.calculatedUIName);
        tc.isNull(recipient.person);
        tc.isTrue(recipient.isJsRecipient, "Recipient was not marked as JS recipient");
    });

    Tx.test("AddressWellInputUnitTests.testLoadRecipientByEmail", function (tc) {
        /// <summary>
        /// Verifies that function loads the recipient from the platform in the normal case
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var recipient = _makeRecipient({ id: "platformRecipient" });
        var hasLoadedRecipient = false;

        var platform = {
            peopleManager: {
                loadRecipientByEmail: function () {
                    hasLoadedRecipient = true;
                    return recipient;
                }
            }
        };

        var result = AddressWell.Recipient.fromEmail("fakeAddress@fabrikam.com", "name", platform);

        tc.isTrue(hasLoadedRecipient, "invalid test setup: test did not call into loadRecipientByEmail");
        tc.areEqual(recipient.id, result.id, "Recipient did not match");
    });

    Tx.test("AddressWellInputUnitTests.testLoadRecipientByEmailError", function (tc) {
        /// <summary>
        /// Verifies the behavior when loadRecipientByEmail encounters a platform exception
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var triedLoadingRecipient = false;

        var platform = {
            peopleManager: {
                loadRecipientByEmail: function () {
                    triedLoadingRecipient = true;
                    throw new Error("This is an error loading recipient for testing purposes");
                }
            }
        };

        var result = AddressWell.Recipient.fromEmail("testAddress@thisisatest.com", "Name", platform);
        tc.isTrue(triedLoadingRecipient, "Invalid test setup: test did not call into platform");
        tc.areEqual("Name", result.calculatedUIName, "Recipient should have been returned even when there is a platform error");
    });

    Tx.test("AddressWellInputUnitTests.testHighlightAreaChanged", function (tc) {
        /// <summary>
        /// Tests highlightAreaChanged function
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var clearHighlightCalled = false;
        _addressWellInput.clearHighlight = function () {
            clearHighlightCalled = true;
        };

        _addressWellInput._uiInitialized = true;
        _addressWellInput._highlightAreaChanged("", "");
        tc.isTrue(clearHighlightCalled, "clearHighlight should have been called if new value is empty");
        clearHighlightCalled = false;
        _addressWellInput._highlightAreaChanged("", AddressWell.HighlightArea.dropDownTile);
        tc.isTrue(clearHighlightCalled, "clearHighlight should have been called if new value is not input");
        clearHighlightCalled = false;
        _addressWellInput._highlightAreaChanged("", AddressWell.HighlightArea.dropDownList);
        tc.isTrue(clearHighlightCalled, "clearHighlight should have been called if new value is not input");
        clearHighlightCalled = false;
        _addressWellInput._highlightAreaChanged("", AddressWell.HighlightArea.input);
        tc.isFalse(clearHighlightCalled, "clearHighlight should not have been called since new value is input");
    });

    Tx.test("AddressWellInputUnitTests.testGetAriaControlledId", function (tc) {
        /// <summary>
        /// Tests getAriaControlledId
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // verify it returns the expected value

        _addressWellInput._inputFieldId = "this is the test ID set up by the unit test";

        tc.areEqual(_addressWellInput._inputFieldId, _addressWellInput.getAriaControlledId());
    });

    Tx.test("AddressWellInputUnitTests.testSetAriaControls", function (tc) {
        /// <summary>
        /// Tests getAriaControls
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        // Verify it sets the correct property on the correct element
        var setAttributeCalled = false;
        var id = "this is the test ID";
        var input = {
            setAttribute: function (attribute, value) {
                setAttributeCalled = true;
                tc.areEqual("aria-controls", attribute, "Unexpected attribute set");
                tc.areEqual(id, value, "Unexpected attribute value");
            }
        };

        _addressWellInput._inputElement = input;

        _addressWellInput.setAriaControls(id);

        tc.isTrue(setAttributeCalled, "setAriaControls did not call setAttribute");
    });

})();

