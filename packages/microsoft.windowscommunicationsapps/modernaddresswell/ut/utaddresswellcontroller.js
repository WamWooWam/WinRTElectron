
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,WinJS,Microsoft,AddressWell,Debug,document,window*/

(function ()
{
    // Temporary variables that will be changed by the test
    var _originalInput;
    var _originalDropDown;
    var _originalScrollIntoView;
    var _originalJxBici;
    var _originalJxComponentActivate;
    var _originalJxComponentDeactivate;
    var _originalJxFault;
    var _originalJxIsHTMLElement;
    var _originalJxLog;
    var _originalJxRes;
    var _originalJxWwa;
    var _originalAddEventListener;
    var _originalRemoveEventListener;
    var _originalWindowAddEventListener;
    var _originalWindowRemoveEventListener;
    var _originalGetElementById;
    var _originalSetTimeout;
    var _originalClearTimeout;
    var _originalInnerHeight;
    var _originalClearTileCache;
    var _originalGetUserTileUrlFromCache;
    var _controller;
    var _originalMsSetImmediate;
    var _originalMaxSearchDuration;
    var _originalMinProgressDuration;
    
    function GetWrappedCallback(fn) {
        return fn;
    }

    function setup () {
        /// <summary>
        /// Constructs a default address well input copmonent, and saves variables that will be changed by the tests
        /// </summary>
        _originalInput = AddressWell.Input;
        _originalDropDown = AddressWell.DropDown;
        _originalScrollIntoView = AddressWell.scrollIntoViewIfNotInView;
        _originalJxRes = Jx.res;
        _originalJxWwa = Jx.isWWA;
        _originalJxComponentActivate = Jx.Component.prototype.activateUI;
        _originalJxComponentDeactivate = Jx.Component.prototype.deactivateUI;
        _originalDebug = Debug;
        _originalJxBici = Jx.bici;
        _originalJxIsHTMLElement = Jx.isHTMLElement;
        _originalJxFault = Jx.fault;
        _originalJxLog = Jx.log;

        _originalAddEventListener = document.addEventListener;
        _originalRemoveEventListener = document.removeEventListener;
        _originalWindowAddEventListener = window.addEventListener;
        _originalWindowRemoveEventListener = window.removeEventListener;
        _originalGetElementById = document.getElementById;
        _originalSetTimeout = window.setTimeout;
        _originalClearTimeout = window.clearTimeout;
        _originalInnerHeight = window.innerHeight;
        _originalMsSetImmediate = window.msSetImmediate;
        _originalClearTileCache = AddressWell.clearTileCache;
        _originalGetUserTileUrlFromCache = AddressWell.getUserTileUrlFromCache;
        _originalMaxSearchDuration = AddressWell.maxSearchDuration;
        _originalMinProgressDuration = AddressWell.minProgressDuration;

        Debug.enableAssertDialog = false;

        Jx.res = {};
        Jx.res.processAll = function () {};
        Jx.res.loadCompoundString = function (id) { return "string"; };
        Jx.res.getString = function (id) {return "string"; };
        Jx.bici = {
            addToStream: function () { }
        };
        Jx.fault = function () { };

        _controller = new AddressWell.Controller("idPrefix", null, null, true, "", null);
        _controller.setContextualAccount({});
    }
    
    function cleanup () {
        /// <summary>
        /// Restores variables that were changed by the tests
        /// </summary>
        Debug.enableAssertDialog = true;
        AddressWell.Input = _originalInput;
        AddressWell.DropDown = _originalDropDown;
        AddressWell.scrollIntoViewIfNotInView = _originalScrollIntoView;
        Jx.res = _originalJxRes;
        Jx.isWWA = _originalJxWwa;
        Jx.bici = _originalJxBici;
        Jx.isHTMLElement = _originalJxIsHTMLElement;
        Jx.fault = _originalJxFault;
        Jx.log = _originalJxLog;
        Jx.Component.prototype.activateUI = _originalJxComponentActivate;
        Jx.Component.prototype.deactivateUI = _originalJxComponentDeactivate;
        document.addEventListener = _originalAddEventListener;
        document.removeEventListener = _originalRemoveEventListener;
        window.addEventListener = _originalWindowAddEventListener;
        window.removeEventListener = _originalWindowRemoveEventListener;
        document.getElementById = _originalGetElementById;
        window.setTimeout = _originalSetTimeout;
        window.clearTimeout = _originalClearTimeout;
        window.innerHeight = _originalInnerHeight;
        window.setImmediate = _originalMsSetImmediate;
        AddressWell.clearTileCache = _originalClearTileCache;
        AddressWell.getUserTileUrlFromCache = _originalGetUserTileUrlFromCache;
        AddressWell.maxSearchDuration = _originalMaxSearchDuration;
        AddressWell.minProgressDuration = _originalMinProgressDuration;
        _controller = null;
    }

    Tx.test("AddressWellControllerUnitTests.testConstructorNullIdPrefix", function (tc) {
        /// <summary>
        /// Tests the case where the idPrefix parameter is null
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        tc.expectException(function () { var controller = new AddressWell.Controller(null, null, null, false, "", null);}, "idPrefix parameter must be not null and non empty");
    });
    
    Tx.test("AddressWellControllerUnitTests.testConstructorEmptyIdPrefix", function (tc) {
        /// <summary>
        /// Tests the case where the idPrefix parameter is empty
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        tc.expectException(function () { var controller = new AddressWell.Controller("", null, null, false, "", null);}, "idPrefix parameter must be not null and non empty");
    });

    Tx.test("AddressWellControllerUnitTests.testConstructor", function (tc) {
        /// <summary>
        /// Tests that properties are being set correctly in the constructor
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        // Set up mock objects
        Jx.isWWA = false;
        var inputRecipients = null;
        var inputContactsPlatform = null;
        var inputHintText = "";

        // Mock up Input and DropDown
        AddressWell.Input = /*@constructor*/function (idPrefix, recipients, contactsPlatform, log, hintText) {
            this.initComponent();
            inputRecipients = recipients;
            inputContactsPlatform = contactsPlatform;
            inputHintText = hintText;
        };
        Jx.augment(AddressWell.Input, Jx.Component);
        AddressWell.Input.prototype.setSearchOnEnter = Jx.fnEmpty;
        AddressWell.DropDown = /*@constructor*/function (idPrefix) {
            this.initComponent();
        };
        Jx.augment(AddressWell.DropDown, Jx.Component);

        
        // Case 1: null contacts are passed in
        var controller1 = new AddressWell.Controller("idPrefix", null, null, false, "hintText1");
        tc.areEqual(0, inputRecipients.length, "Incorrect recipients being passed to input");
        tc.isNull(inputContactsPlatform, "Incorrect contacts platform being passed to input");
        tc.areEqual("idPrefixAWC", controller1._containerId);
        tc.isNotNull(controller1._input, "Input should not be null");
        tc.isNotNull(controller1._dropDown, "Drop down should not be null");
        tc.isFalse(controller1._showSuggestions);
        tc.areEqual("hintText1", inputHintText, "hintText1 is not passed down");
        // WinLive 426438 - Hardcoding to true for M2 until relevancy is ready in M3
        ////tc.isFalse(controller1._hideTileView);

        // Case 2: Valid contacts are passed in
        var controller2 = new AddressWell.Controller("idPrefix", [{}, {}], {}, true, "hintText2");
        tc.areEqual(2, inputRecipients.length, "Incorrect recipients being passed to input");
        tc.isNotNull(inputContactsPlatform, "Incorrect contacts platform being passed to input");
        tc.isTrue(controller2._showSuggestions);
        tc.areEqual("hintText2", inputHintText, "hintText2 is not passed down");
        tc.areEqual(AddressWell.ContactSelectionMode.emailContacts, controller2._contactSelectionMode);
        // Hardcoding to true until tiles view ships
        ////tc.isTrue(controller2._hideTileView);

        // Case 3: Setting for Messaging App
        var controller3 = new AddressWell.Controller("idPrefix", null, {}, true, "hintText3", AddressWell.ContactSelectionMode.chatContacts);
        tc.areEqual(0, inputRecipients.length, "Incorrect recipients being passed to input");
        tc.isNotNull(inputContactsPlatform, "Incorrect contacts platform being passed to input");
        tc.isTrue(controller3._showSuggestions);
        tc.areEqual("hintText3", inputHintText, "hintText2 is not passed down");
        tc.areEqual(AddressWell.ContactSelectionMode.chatContacts, controller3._contactSelectionMode);
    });

    Tx.test("AddressWellControllerUnitTests.testGetUI", function (tc) {
        /// <summary>
        /// Tests that getUI sets the right properties
        /// </summary>
        
        tc.cleanup = cleanup;
        setup();

        var ui = {};
        _controller.getUI(ui);
        tc.isNotNull(ui.html, "html property should have been populated");
    });

    Tx.test("AddressWellControllerUnitTests.testActivateUI", function (tc) {
        /// <summary>
        /// Tests that function sets up the correct bindings
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        // Mock up Jx component, will be replaced in tearDown.
        Jx.Component.prototype.activateUI = function () {};
        
        // Mock up document.getElementById
        var containerElement = {};
        var containerAddEventCount = 0;
        containerElement.addEventListener = function (name, handler, isCapture) {
            containerAddEventCount++;
            tc.areEqual(AddressWell.Events.focus, name, "Unexpected event attached to container");
            tc.isTrue(isCapture, "isCapture flag should be set to true");
        };
        document.getElementById = function (elementId) {
            if (elementId === "idPrefixAWC") {
                return containerElement;
            } else {
                tc.error("Test did not expect getElementById for id: " + elementId);
            }
        };

        // Mock up drop down component
        var bindHighlightIdCalled = 0;
        var bindDropDownVisibleCalled = 0;
        var dropDownAddListenerCount = 0;
        var ariaDropdownCalled = 0;
        _controller._dropDown = {
            bindAttr: function (sourceName, destination, destinationName) {
            },
            addListener: function (sourceName, destination, destinationName) {
            },
            getAriaControlledId: function () { return "dropdown"; },
            setAriaControls: function (id) { ariaDropdownCalled++; }
        };

        // Mock up input component
        var bindAttr2WayCalled = 0;
        var inputAddListenerCount = 0;
        var ariaInputCalled = 0;
        var focusAdded = 0;
        _controller._input = {
            bindAttr2Way: function (sourceName, destination, destinationName) {
            },
            addListener: function (sourceName, destination, destinationName) {
            },
            getAriaControlledId: function () { return "input"; },
            setAriaControls: function (id) { ariaInputCalled++; }
        };

        var resizeEventCount = 0;
        window.addEventListener = function (eventName) {
            tc.areEqual(AddressWell.Events.resize, eventName, "Event name is incorrect");
            resizeEventCount++;
        };

        // Check UI initialized state before test run
        tc.isFalse(_controller._uiInitialized, "UI should not have been initialized");

        // Test calling the function the first time
        _controller.activateUI();
        tc.isTrue(_controller._uiInitialized, "UI should have been initialized");
        tc.areEqual(1, resizeEventCount);

        // Test calling the function the second time.  Verify that event handlers should not have been called again.
        _controller.activateUI();
        tc.isTrue(_controller._uiInitialized, "UI should have been initialized");
        tc.areEqual(1, resizeEventCount);
    });

    Tx.test("AddressWellControllerUnitTests.testDeactivateUI", function (tc) {
        /// <summary>
        /// Tests that deactivateUI dettaches the correct event handlers
        /// </summary>
        
        tc.cleanup = cleanup;
        setup();

        // Mock up Jx component 
        Jx.Component.prototype.deactivateUI = function () {};

        var inputRemoveListenerCount = 0;
        _controller._input.removeListener = function (name, method, context) {
            inputRemoveListenerCount++;
        };

        var dropDownRemoveListenerCount = 0;
        _controller._dropDown.removeListener = function (name, method, context) {
            dropDownRemoveListenerCount++;
        };

        _controller._peoplePicker = {
            removeListener: function (name, method, context) {
                tc.areEqual(AddressWell.Events.addPeopleFromPicker, name, "Unexpected source name for people picker: " + name);
            }
        };

        var removeContainerListenerCount = 0;
        _controller._removeContainerListener = function () {
            removeContainerListenerCount++;
        };

        var containerRemoveEventCount = 0;
        _controller._containerElement = {
            removeEventListener: function (name, handler, isCapture) {
                containerRemoveEventCount++;
                tc.areEqual(AddressWell.Events.focus, name, "Unexpected event attached to container");
                tc.isTrue(isCapture, "isCapture flag should be set to true");
            }
        };

        var resizeEventCount = 0;
        window.removeEventListener = function (eventName) {
            tc.areEqual(AddressWell.Events.resize, eventName, "Event name is incorrect");
            resizeEventCount++;
        };

        var inputPaneShowingCount = 0;
        _controller._inputPane = {
            removeEventListener: function () { inputPaneShowingCount++; }
        };


        // Mock having called activateUI
        _controller._uiInitialized = true;

        // Test calling the function the first time
        _controller.deactivateUI();
        tc.isFalse(_controller._uiInitialized);

        // Test calling the function the second time.  Verify that event handler should not have been called again.
        _controller.deactivateUI();
        tc.isFalse(_controller._uiInitialized);
    });

    Tx.test("AddressWellControllerUnitTests.testClear", function (tc) {
        /// <summary>
        /// Verifies that variables are reset
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        _controller._input = {
            clear: function () { },
            isDirty: true
        };
        _controller._navigateAway = function () { };

        _controller.clear();
        tc.isFalse(_controller._input.isDirty, "isDirty should have been reset");
    });

    Tx.test("AddressWellControllerUnitTests.testGetScrollableElement", function (tc) {
        /// <summary>
        /// Verifies that scrollable element is set correctly
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        _controller._containerElement = document.createElement("div");
        var mockParent = document.createElement("div");
        mockParent.appendChild(_controller._containerElement);
        var parent2 = document.createElement("div");
        parent2.appendChild(mockParent);
        
        try {
            document.body.appendChild(parent2);

            _controller._scrollableElement = null;

            var element = _controller._getScrollableElement();
            tc.areEqual(document.body, element, "Scrollable element should be body");

            _controller._scrollableElement = null;

            parent2.style.overflow = "scroll";
            element = _controller._getScrollableElement();
            tc.areEqual(parent2, element, "Scrollable element should be parent");

            _controller._scrollableElement = null;

            mockParent.style.overflow = "hidden";
            mockParent.style.overflowY = "auto";
            element = _controller._getScrollableElement();
            tc.areEqual(mockParent, element, "Scrollable element should be parent");

        } finally {
            // Clean up the DOM after we are done testing
            document.body.removeChild(parent2);
        }
    });

    Tx.test("AddressWellControllerUnitTests.testNavigateAway", function (tc) {
        /// <summary>
        /// Verifies behavior of being navigated away
        /// </summary>
        
        tc.cleanup = cleanup;
        setup();

        var completeUserInputCalled = false;
        var clearHighlightCalled = false;
        var removeFocusFromContainerCalled = false;
        var hideCalled = false;
        var removeAriaLiveCalled = false;
        var removeContainerListenerCalled = false;

        _controller._input = {
            completeUserInput: function () {
                completeUserInputCalled = true; 
            },
            clearHighlight: function() { 
                clearHighlightCalled = true;
            },
            removeFocusFromContainer: function () {
                removeFocusFromContainerCalled = true;
            }
        };
        _controller._dropDown = {
            hide: function () {
                hideCalled = true;
            },
            removeAriaLive: function () {
                removeAriaLiveCalled = true;
            },
            handleCompleteKey: function () {
                tc.error("Unexpected call to dropdown handleCompleteKey");
            }
        };

        _controller._removeContainerListener = function () {
            removeContainerListenerCalled = true;
        };

        _controller.raiseEvent = function(eventName) {
            tc.areEqual(AddressWell.Events.addressWellBlur, eventName);
        };

        // controlInUse === 0
        _controller._navigateAway();

        tc.isTrue(completeUserInputCalled, "Should complete user input when tabbing out");
        tc.isTrue(clearHighlightCalled, "Should clearHighlight when tabbing out");
        tc.isTrue(removeFocusFromContainerCalled, "Should remove focus from container when tabbing out");
        tc.isTrue(hideCalled, "Should hide the dropdown when tabbing out");
        tc.isTrue(removeAriaLiveCalled, "Should remove aria-live fro the dropdown");
        tc.isTrue(removeContainerListenerCalled, "Should call remove Container listener");

        // controlInUse > 1
        _controller._navigateAway();
    });

    Tx.test("AddressWellControllerUnitTests.testHandleTabInput", function (tc) {
        /// <summary>
        /// Verifies behavior of _handleTab when the highlight area is in the input
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var handleCompleteKeyCalled = false;
        _controller._dropDown = {
            handleCompleteKey: function() {
                handleCompleteKeyCalled = true;
            },
            isVisible: function() {
                return false;
            }
        };

        var focusCalled = false;
        _controller.focusInput = function() {
            focusCalled = true;
        };

        var event = {preventDefault: function () {}};

        // Test the case when drop down is not visible
        _controller._handleTab(event);
        tc.isFalse(handleCompleteKeyCalled);
        tc.isFalse(focusCalled);

        // Test the case when drop down is visible, and there is a highlighted item
        navigateAwayCalled = false;
        _controller._dropDown.isVisible = function () { return true; };
        _controller._dropDown.getAttr = function () { return "highlight"; };
        _controller._handleTab(event);
        tc.isTrue(handleCompleteKeyCalled);
        tc.isTrue(focusCalled);
    });

    Tx.test("AddressWellControllerUnitTests.testContainerBlurHandler", function (tc) {
        /// <summary>
        /// Tests that the function handles the blur event appropriately
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        // Create a mock element to setup as the active element
        var mockElement = document.createElement("input");
        var mockElementContainer = document.createElement("div");
        mockElementContainer.appendChild(mockElement);

        var navigateAwayCalled = false;
        var focusInputCalled = false;
        var domEvent = {};
        var resetVars = function () {
            navigateAwayCalled = false;
            focusInputCalled = false;
            domEvent = {};
            mockElement.id = "";
            mockElementContainer.id = "";
        };
        _controller._navigateAway = function () { navigateAwayCalled = true; };
        _controller.focusInput = function () { focusInputCalled = true; };

        try {
            document.body.appendChild(mockElementContainer);

            // Case 1: The element does not belong in the control
            resetVars();
            mockElement.focus();
            _controller._containerBlurHandler(domEvent);
            tc.isTrue(navigateAwayCalled, "Case 1 navigateAwayCalled");
            tc.isFalse(focusInputCalled, "Case 1 focusInputCalled");

            // Case 2: The element belongs under the input component
            resetVars();
            mockElement.id = _controller._input._id;
            mockElement.focus();
            _controller._containerBlurHandler(domEvent);
            tc.isFalse(navigateAwayCalled, "Case 2 navigateAwayCalled");
            tc.isFalse(focusInputCalled, "Case 2 focusInputCalled");

            // Case 3: The element belongs under the drop down component
            resetVars();
            mockElementContainer.id = _controller._dropDown._id;
            mockElement.focus();
            _controller._containerBlurHandler(domEvent);
            tc.isFalse(navigateAwayCalled, "Case 3 navigateAwayCalled");
            tc.isFalse(focusInputCalled, "Case 3 focusInputCalled");

        } finally {
            // Clean up the DOM after we are done testing
            document.body.removeChild(mockElementContainer);
        }
    });

    Tx.test("AddressWellControllerUnitTests.testAddDropdownRecipients", function (tc) {
        /// <summary>
        /// Tests that the function is adding recipient objects
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var addRecipientCalled = 0;

        // Set up mocks to help with verification
        _controller._input = {
            addRecipients: function () { addRecipientCalled++; },
            clearInputField: function () { }
        };
        
        _controller._addDropDownRecipients({ recipients: [{ person: { objectId: 123 } }, { person: { objectId: 456 } }, { person: { objectId: 123 } }] });

        // Verify that addRecipient was called
        tc.areEqual(1, addRecipientCalled, "addRecipient is called the incorrect number of times");
    });


    Tx.asyncTest("AddressWellControllerUnitTests.testQueryContactsByInputNullPlatform", function (tc) {
        /// <summary>
        /// Tests that function calls the complete call back when the platform is null
        /// </summary>

        // Async test should call tc.stop first.  
        tc.stop();
 
        tc.cleanup = cleanup;
        setup();

        // Mock up functions
        _controller._lvCollectionDispose = function () { };
        _controller._platform = null;

        _controller._queryContactsByInputAsync("input", AddressWell.ListViewSearchType.people, null).done(
            new GetWrappedCallback(function complete(searchId) {
                tc.areEqual(AddressWell.SearchErrorType.noResults, _controller._lvSearchErrorType, "Incorrect search error type");
                tc.areEqual(1, searchId, "Should return 1 for searchId");
                tc.start();
            }),
            new GetWrappedCallback(function error(ex) {
                tc.error("An error occurred in queryContactsByInput: " + ex);
            })
        );
    });

    Tx.asyncTest("AddressWellControllerUnitTests.testQueryContactsByInputNullPeopleManager", function (tc) {
        /// <summary>
        /// Tests that function calls the complete call back when peopleManager is null
        /// </summary>

        // Async test should call tc.stop first.  
        tc.stop();
 
        tc.cleanup = cleanup;
        setup();

        // Mock up functions
        _controller._lvCollectionDispose = function () { };
        _controller._peopleManager = null;
        _controller._platform = {peopleManager: null};

        _controller._queryContactsByInputAsync("input", AddressWell.ListViewSearchType.people, null).done(
            new GetWrappedCallback(function complete(searchId) {
                tc.areEqual(AddressWell.SearchErrorType.noResults, _controller._lvSearchErrorType, "Incorrect search error type");
                tc.areEqual(1, searchId, "Should return 1 for searchId");
                tc.start();
            }),
            new GetWrappedCallback(function error(ex) {
                tc.error("An error occurred in queryContactsByInput: " + ex);
            })
        );
    });

    Tx.asyncTest("AddressWellControllerUnitTests.testQueryContactsByInputNotWWA", function (tc) {
        /// <summary>
        /// Tests that function calls the complete call back when it's not WWA
        /// </summary>

        // Async test should call tc.stop first.  
        tc.stop();
 
        tc.cleanup = cleanup;
        setup();

        // Mock up functions
        Jx.isWWA = false;
        _controller._lvCollectionDispose = function () { };

        _controller._queryContactsByInputAsync("input", AddressWell.ListViewSearchType.people, null).done(
            new GetWrappedCallback(function complete(searchId) {
                tc.areEqual(AddressWell.SearchErrorType.noResults, _controller._lvSearchErrorType, "Incorrect search error type");
                tc.areEqual(1, searchId, "Should return 1 for searchId");
                tc.start();
            }),
            new GetWrappedCallback(function error(ex) {
                tc.error("An error occurred in queryContactsByInput: " + ex);
            })
        );
    });

    Tx.asyncTest("AddressWellControllerUnitTests.testQueryContactsByInputSearchError", function (tc) {
        /// <summary>
        /// Tests that function calls the complete call back upon exception in search API
        /// </summary>

        // Async test should call tc.stop first.  
        tc.stop();
 
        tc.cleanup = cleanup;
        setup();

        // Mock up functions
        _controller._lvCollectionDispose = function () { };
        _controller._peopleManager = {
            search: function () { throw new Error("Mock exception during search API call"); }
        };
        _controller._platform = { peopleManager: _controller._peopleManager };
        _controller._contactSelectionMode = AddressWell.ContactSelectionMode.chatContacts;

        _controller._queryContactsByInputAsync("input", AddressWell.ListViewSearchType.people, null).done(
            new GetWrappedCallback(function complete(searchId) {
                tc.areEqual(1, searchId, "Should return 1 for searchId");
                tc.start();
            }),
            new GetWrappedCallback(function error(ex) {
                tc.error("An error occurred in queryContactsByInput: " + ex);
            })
        );
    });

    Tx.asyncTest("AddressWellControllerUnitTests.testQueryChatPersonSearchError", function (tc) {
        /// <summary>
        /// Tests that function calls the complete call back upon exception in connected account search API
        /// </summary>

        // Async test should call tc.stop first.  
        tc.stop();
 
        tc.cleanup = cleanup;
        setup();

        // Mock up functions
        _controller._lvCollectionDispose = function () { };
        _controller._contactSelectionMode = AddressWell.ContactSelectionMode.chatContacts;
        _controller._peopleManager = {
            search: function () { throw new Error("Mock exception during connected account search API call"); }
        };
        _controller._platform = { peopleManager: _controller._peopleManager };

        _controller._queryContactsByInputAsync("input", AddressWell.ListViewSearchType.people, {} /* Ensure that connected account is not null */).done(
            new GetWrappedCallback(function complete(searchId) {
                tc.areEqual(AddressWell.SearchErrorType.none, _controller._lvSearchErrorType, "Incorrect search error type");
                tc.areEqual(1, searchId, "Should return 1 for searchId");
                tc.start();
            }),
            new GetWrappedCallback(function error(ex) {
                tc.error("An error occurred in queryContactsByInput: " + ex);
            })
        );
    });

    Tx.test("AddressWellControllerUnitTests.testQueryContactsByInputInit", function (tc) {
        /// <summary>
        /// Tests that function calls the search API correctly
        /// </summary>
 
        tc.cleanup = cleanup;
        setup();

        // Mock up objects
        _controller._platform = {};
        _controller._peopleManager = {};
        _controller._contactSelectionMode = AddressWell.ContactSelectionMode.chatContacts;
        var queryContactsByInputEndCalled = false;
        _controller._queryContactsByInputEnd = function () { queryContactsByInputEndCalled = true; };
        _controller._lvCollectionDispose = function () {};
        var completeCallback = function () { };
        var chatSearchCalled = false;
        _controller._chatSearch = function () { chatSearchCalled = true; };

        // Input without @
        _controller._lvInput = "input";
        _controller._queryContactsByInputInit(completeCallback);
        tc.isFalse(queryContactsByInputEndCalled, "end function should not have been called");
        tc.areEqual(completeCallback, _controller._lvCompleteCallback, "Callback function is incorrect");
        tc.areEqual(0, _controller._lvResults.length, "There should be 0 results");
        tc.areEqual(1, _controller._lvSearchId, "Search ID should have been incremented to 1");

        // Input with @
        _controller._lvInput = "input@";
        _controller._queryContactsByInputInit(completeCallback);
        tc.areEqual(2, _controller._lvSearchId, "Search ID should have been incremented to 2");

        // Search ID greater than max value
        _controller._lvSearchId = AddressWell.maxSearchCounter + 1;
        _controller._queryContactsByInputInit(completeCallback);
        tc.areEqual(0, _controller._lvSearchId, "Search ID should have been reset to 0");

        // People search
        chatSearchCalled = false;
        connectedAccountSearchCalled = false;
        _controller._lvSearchType = AddressWell.ListViewSearchType.people;
        _controller._queryContactsByInputInit(completeCallback);
        tc.isTrue(chatSearchCalled, "People search should have been called");
    });

    Tx.test("AddressWellControllerUnitTests.testQueryContactsByInputEnd", function (tc) {
        /// <summary>
        /// Tests that function calls the callback and disposes objects
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var completed = false;
        _controller._lvCompleteCallback = function (searchId) {
            completed = true;
            tc.areEqual(_controller._lvSearchId, searchId, "Incorrect search ID");
        };

        _controller._lvCollectionDispose = function () { };

        _controller._queryContactsByInputEnd();
        tc.isTrue(completed, "CompleteCallback is not called");
    });

    Tx.test("AddressWellControllerUnitTests.testCollectionDispose", function (tc) {
        /// <summary>
        /// Tests that function cleans up correctly
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var removeEventListenerCalled = false;
        var disposed = false;
        _controller._lvCollection = {
            removeEventListener: function (eventName) {
                tc.areEqual("collectionchanged", eventName, "Incorrect event name");
                removeEventListenerCalled = true;
            },
            dispose: function () {
                disposed = true;
            }
        };
        _controller._lvCollectionChangedHandler = function () { };

        var cancelled = false;
        _controller._lvSearchPromise = new WinJS.Promise(
        /* init */ function () { },
        /* onCancel */ function () { cancelled = true; });

        _controller._lvCollectionDispose();
        tc.isNull(_controller._lvCollection, "Collection should be null");
        tc.isNull(_controller._lvCollectionChangedHandler, "Handler should be null");
        tc.isNull(_controller._lvSearchPromise, "Ongoing search promise should have been null");
        tc.isTrue(removeEventListenerCalled, "removeEventListener should have been called");
        tc.isTrue(disposed, "dispose should have been called");
        tc.isTrue(cancelled, "cancel should have been called");
    });

    Tx.test("AddressWellControllerUnitTests.testCollectionDisposeException", function (tc) {
        /// <summary>
        /// Tests that function cleans up correctly depite exceptions
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var removeEventListenerCalled = false;
        _controller._lvCollection = {
            removeEventListener: function (eventName) {
                tc.areEqual("collectionchanged", eventName, "Incorrect event name");
                removeEventListenerCalled = true;
            },
            dispose: function () {
                throw new Error("Mock exception");
            }
        };
        _controller._lvCollectionChangedHandler = function () { };

        _controller._lvCollectionDispose();
        tc.isNull(_controller._lvCollection, "Collection should be null");
        tc.isNull(_controller._lvCollectionChangedHandler, "Handler should be null");
    });

    Tx.test("AddressWellControllerUnitTests.testCollectionChangedSearchCompleteChatSearch", function (tc) {
        /// <summary>
        /// Tests that appropriate functions are called.
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        _controller._lvSearchType = AddressWell.ListViewSearchType.people;

        var fetchCalled = false;
        _controller._lvCollection = {
            totalCount: 0,
            count: 0,
            fetchMoreItems: function () { fetchCalled = true; }
        };

        var ended = false;
        _controller._queryContactsByInputEnd = function () { ended = true; };

        var eventArgs = { eType: Microsoft.WindowsLive.Platform.CollectionChangeType.localSearchComplete };

        // 0 Results
        _controller._lvCollectionChanged(eventArgs);
        tc.isFalse(fetchCalled, "Fetch more item should not have been called");
        tc.isTrue(ended, "End should have been called for 0 results");

        // Results > 0
        ended = false;
        _controller._lvCollection.totalCount = 1;
        _controller._lvCollectionChanged(eventArgs);
        tc.isTrue(fetchCalled, "Fetch more item should have been called");
        tc.isFalse(ended, "End should not have been called for results > 0");

        // Exception case
        _controller._lvCollection.fetchMoreItems = function () {
            throw new Error("Mock exception");
        };
        ended = false;
        _controller._lvCollection.totalCount = 1;
        _controller._lvCollectionChanged(eventArgs);
        tc.isTrue(ended, "End should have been called for exception case");
    });

    Tx.test("AddressWellControllerUnitTests.testCollectionChangedBatchEnd", function (tc) {
        /// <summary>
        /// Tests that function calls the appropriate function correct number of times.
        /// </summary>
        
        tc.cleanup = cleanup;
        setup();

        // Mock up objects
        _controller._lvCollection = {
            totalCount: 0,
            count: 0
        };
        var loopThroughCollectionCalled = false;
        _controller._loopThroughCollection = function () { loopThroughCollectionCalled = true;};

        var eventArgs = { eType: Microsoft.WindowsLive.Platform.CollectionChangeType.batchEnd };

        // Search type is people search
        _controller._lvSearchType = AddressWell.ListViewSearchType.people;
        _controller._lvCollectionChanged(eventArgs);
        tc.isTrue(loopThroughCollectionCalled, "Function should have been called for connected account search");
    });

    Tx.test("AddressWellControllerUnitTests.testLoopThroughCollection", function (tc) {
        /// <summary>
        /// Tests that function calls the appropriate function correct number of times.
        /// </summary>
        
        tc.cleanup = cleanup;
        setup();

        // Mock up objects
        var queryItemIndex = 0;
        _controller._lvCollection = {
            totalCount: 0,
            count: 0,
            item: function (index) {
                queryItemIndex = index;
                return {};
            }
        };

        var chatPersonCount = 0;
        _controller._processChatPerson = function (peopleResults, person, actualInputToCheck) {
            tc.areEqual(_controller._lvResults, peopleResults, "results are incorrect");
            return chatPersonCount;
        };
        var ended = false;
        _controller._queryContactsByInputEnd = function () { ended = true; };

        // 0 Results
        _controller._lvCollection.count = 0;
        _controller._loopThroughCollection();
        tc.areEqual(0, queryItemIndex, "We should not have gone through the loop");
        tc.isTrue(ended, "End should have been called for 0 results");

        // Number of results < AddressWell.maxWordWheelContacts
        ended = false;
        _controller._lvCollection.count = 5;
        chatPersonCount = AddressWell.maxWordWheelContacts - 1;
        _controller._loopThroughCollection();
        tc.areEqual(4, queryItemIndex, "The loop should have continued since we have not reached the maximum");
        tc.isTrue(ended, "End should have been called for Number of results < AddressWell.maxWordWheelContacts");

        // Number of results = AddressWell.maxWordWheelContacts
        ended = false;
        _controller._lvCollection.count = 5;
        chatPersonCount = AddressWell.maxWordWheelContacts;
        _controller._loopThroughCollection();
        tc.areEqual(0, queryItemIndex, "The loop should have stopped since we have reached the maximum");
        tc.isTrue(ended, "End should have been called for Number of results = AddressWell.maxWordWheelContacts");

        // Number of results > AddressWell.maxWordWheelContacts
        ended = false;
        _controller._lvCollection.count = 5;
        chatPersonCount = AddressWell.maxWordWheelContacts + 1;
        _controller._loopThroughCollection();
        tc.areEqual(0, queryItemIndex, "The loop should have stopped since we have more than the maximum");
        tc.isTrue(ended, "End should have been called for Number of results > AddressWell.maxWordWheelContacts");

        // Exception case
        _controller._lvCollection.item = function () {
            throw new Error("Mock exception");
        };
        ended = false;
        _controller._lvCollection.count = 5;
        chatPersonCount = AddressWell.maxWordWheelContacts - 1;
        _controller._loopThroughCollection();
        tc.isTrue(ended, "End should have been called even when there's an exception");
        tc.areEqual(AddressWell.SearchErrorType.noResults, _controller._lvSearchErrorType, "Incorrect error type set");
    });

    Tx.test("AddressWellControllerUnitTests.testProcessInputChanges", function (tc) {
        /// <summary>
        /// Tests that the right functions are being called as a result of user input.
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var suggestionViewCalled = false;
        var listViewCalled = false;
        _controller._displaySuggestionsView = function () {
            suggestionViewCalled = true;
        };
        _controller._displayListView = function (input) {
            listViewCalled = true;
        };
        _controller._queryRelevantContacts = function () {
            return [];
        };

        // User input is empty
        _controller._uiInitialized = true;
        _controller._processInputChanges("");
        tc.isTrue(suggestionViewCalled, "Suggestions should have been displayed");

        var suggestionViewCalled = false;
        var listViewCalled = false;

        // User input is not empty
        _controller._uiInitialized = true;
        _controller._processInputChanges("abc");
        tc.isTrue(listViewCalled, "List view should have been displayed");

        var suggestionViewCalled = false;
        var listViewCalled = false;

        // User input has only spaces
        _controller._uiInitialized = true;
        _controller._input.getUserInput = function () {return "          "; };
        _controller._userInputChanged();
        tc.isTrue(suggestionViewCalled, "Suggestions should have been displayed");
    });

    Tx.asyncTest("AddressWellControllerUnitTests.testUserInputChangedProcessDelay", function (tc) {
        /// <summary>
        /// Tests that input changes are not processed immediately, but delayed.
        /// </summary>
        tc.stop();
        tc.cleanup = cleanup;
        setup();

        var listViewCalled = false;
        _controller._displayListView = function (input) {
            listViewCalled = true;
            tc.start();
        };

        _controller._uiInitialized = true;

        _controller._input.getUserInput = function () { return "a"; };
        _controller._userInputChanged();
        tc.isFalse(listViewCalled, "Results should not have been displayed");

        _controller._input.getUserInput = function () { return "ab"; };
        _controller._userInputChanged();
        tc.isFalse(listViewCalled, "Results should not have been displayed");

        _controller._input.getUserInput = function () { return "abc"; };
        _controller._userInputChanged();
        tc.isFalse(listViewCalled, "Results should not have been displayed");
    });

    Tx.test("AddressWellControllerUnitTests.testDisplayListViewForConnectedAccountNullAccount", function (tc) {
        /// <summary>
        /// Tests that the function should not have ran
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var renderProgressCalled = false;
        _controller._dropDown = {
            renderProgress: function () { renderProgressCalled = true; }
        };

        _controller._input = {
            getUserInput: function () {
                return "input";
            }
        };

        _controller._displayListViewForConnectedAccount(null);

        tc.isFalse(renderProgressCalled, "renderProgress should not have been called");
    });

    Tx.test("AddressWellControllerUnitTests.testDisplayListViewForConnectedAccountEmptyUserInput", function (tc) {
        /// <summary>
        /// Tests that the function should not have ran
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var renderProgressCalled = false;
        _controller._dropDown = {
            renderProgress: function () { renderProgressCalled = true; }
        };

        _controller._input = {
            getUserInput: function () {
                return "";
            }
        };

        _controller._displayListViewForConnectedAccount({});

        tc.isFalse(renderProgressCalled, "renderProgress should not have been called");
    });

    Tx.asyncTest("AddressWellControllerUnitTests.testDisplayListViewForConnectedAccountMaxTimeout", function (tc) {
        /// <summary>
        /// Tests that function calls complete and renders the drop down with error text if search does not return in the maximum allowed time frame.
        /// This test verifies that _lvMinProgressTimeout should have been expired and _lvMinProgressTimeoutCallback is null when the dropdown is rendered.
        /// </summary>
        ///<param name="signalTestCompleted">Calling this method indicates that the test is finished.</param>

        // Async test should call tc.stop first.  
        tc.stop();

        tc.cleanup = cleanup;
        setup();

        // Mock up a shorter max timeout - 3 seconds should be enough for the test
        AddressWell.maxSearchDuration = 3000;
        // Ensure that our minimum time to render the progress UI is much shorter than the max timeout
        AddressWell.minProgressDuration = 500;
        
        // Mock up functions
        _controller._lvCollectionDispose = function () { };
        var searchCalled = false;
        _controller._connectedAccountSearch = function () {
            tc.log("In _connectedAccountSearch - we are not doing anything in this code path so it should just hang indefinitely.");
            searchCalled = true;
        };
        _controller._peopleManager = {};
        _controller._platform = { peopleManager: _controller._peopleManager };

        _controller._input = {
            getUserInput: function () {
                tc.log("In getUserInput");
                return "input";
            }
        };

        var callback = function (errorString) {
            tc.log("In RenderText - success case");
            tc.areEqual(AddressWell.SearchErrorType.noResults, _controller._serverSearchAgent._lvSearchErrorType, "Incorrect error type being set");
            tc.start();
        };
        var wrappedCallback = GetWrappedCallback(callback);

        var that = this;
        _controller._dropDown = {
            renderProgress: function () { tc.log("In renderProgress"); },
            renderText: function () { wrappedCallback(that); },
            isVisible: function () { return true; }
        };

        _controller._displayListViewForConnectedAccount({});
        // The callback function should have been verified above
    });

    Tx.test("AddressWellControllerUnitTests.testQueryContactsByInputOnComplete", function (tc) {
        /// <summary>
        /// Tests that the function checks conditions in order to render the list view appropriately
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var renderCalled = false;
        var renderTextCalled = false;
        _controller._dropDown = {
            render: function () { renderCalled = true; },
            renderText: function () { renderTextCalled = true;}
        };
        var scrollIntoViewCalled = false;
        _controller._scrollIntoView = function () { scrollIntoViewCalled = true; };
        var disposeCalled = false;
        _controller._lvCollectionDispose = function () { disposeCalled = true; };
        var addDropDownRecipientCalled = false;
        _controller._addDropDownRecipients = function () { addDropDownRecipientCalled = true; };
        _controller._getConnectedAccounts = function () { return {}; };

        tc.log("Case: Connected account search with minProgressTimeout set");
        _controller._lvSearchType = AddressWell.ListViewSearchType.connectedAccount;
        _controller._lvSearchId = 1; // Matching search ID
        _controller._queryContactsByInputOnComplete(1);
        disposeCalled = false;

        tc.log("Case: Mismatching search ID");
        _controller._lvSearchId = 5;
        _controller._queryContactsByInputOnComplete(1);
        tc.isFalse(renderTextCalled, "RenderText should not have been called for Mismatching search ID");
        tc.isFalse(renderCalled, "Render should not have been called for Mismatching search ID");
        tc.isFalse(scrollIntoViewCalled, "ScrollIntoView should not have been called for Mismatching search ID");
        tc.isFalse(disposeCalled, "Dispose should not have been called for Mismatching search ID");
        tc.isFalse(addDropDownRecipientCalled, "AddDropDownRecipient should not have been called for mismatching search ID");

        tc.log("Case: Matching search Id, connected account, with error");
        _controller._lvSearchId = 1;
        _controller._lvSearchType = AddressWell.ListViewSearchType.people;
        _controller._lvSearchErrorType = AddressWell.SearchErrorType.noResults;
        _controller._lvCollection = {};
        _controller._contactSelectionMode = AddressWell.ContactSelectionMode.chatContacts;
        _controller._queryContactsByInputOnComplete(1);
        tc.isTrue(renderTextCalled, "RenderText should have been called");

        tc.log("Case: Matching search Id, connected account, no error, with exactly one contact from results");
        _controller._lvSearchId = 1;
        _controller._lvSearchType = AddressWell.ListViewSearchType.people;
        _controller._lvSearchErrorType = AddressWell.SearchErrorType.none;
        _controller._lvCollection = {};
        _controller._contactSelectionMode = AddressWell.ContactSelectionMode.chatContacts;
        _controller._lvResults = [{ recipients: ["email"], person: {} }];
        _controller._queryContactsByInputOnComplete(1);
        tc.isFalse(addDropDownRecipientCalled, "AddDropDownRecipient should have been called");

        tc.log("Case: Matching search Id, people search, collection is not null");
        _controller._lvSearchId = 1;
        _controller._lvSearchType = AddressWell.ListViewSearchType.people;
        _controller._lvCollection = {};
        _controller._contactSelectionMode = AddressWell.ContactSelectionMode.chatContacts;
        _controller._queryContactsByInputOnComplete(1);
        tc.isTrue(renderCalled, "Render should have been called");
        tc.isTrue(disposeCalled, "Dispose should have been called");
    });

    Tx.test("AddressWellControllerUnitTests.testAttachContainerListener", function (tc) {
        /// <summary>
        /// Tests that the function attaches the right number of listeners
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var blurEvent = 0;
        var mockElement = {};
        mockElement.addEventListener = function (eventName) {
            if (eventName === AddressWell.Events.blur) {
                blurEvent++;
            } else {
                tc.error("Unexpected bound event: " + eventName);
            }
        };
        _controller._containerElement = mockElement;

        _controller._containerBlur = null;

        // Call the function the first time
        _controller._attachContainerListener();
        tc.areEqual(1, blurEvent, "1 - unexpected number of blur event bound to container");
        tc.isNotNull(_controller._containerBlur, "1 - blur handler should not be null");

        // Call the function again and verify that we should not attach events
        _controller._attachContainerListener();
        tc.areEqual(1, blurEvent, "2 - unexpected number of blur event bound to container");
        tc.isNotNull(_controller._containerBlur, "2 - blur handler should not be null");
    });

    Tx.test("AddressWellControllerUnitTests.testRemoveContainerListener", function (tc) {
        /// <summary>
        /// Tests that the function removes the right number of listeners
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var blurEvent = 0;
        var mockElement = {};
        mockElement.removeEventListener = function (eventName) {
            if (eventName === AddressWell.Events.blur) {
                blurEvent++;
            } else {
                tc.error("Unexpected bound event: " + eventName);
            }
        };
        _controller._containerElement = mockElement;
        _controller._containerBlur = {};

        // Call the function the first time
        _controller._removeContainerListener();
        tc.areEqual(1, blurEvent, "1 - unexpected number of blur event bound to container");
        tc.isNull(_controller._containerBlur, "1 - blur handler should be null");

        // Call the function again and verify that we should not attach events
        _controller._removeContainerListener();
        tc.areEqual(1, blurEvent, "2 - unexpected number of blur event bound to container");
        tc.isNull(_controller._containerBlur, "2 - blur handler should be null");
    });

    Tx.test("AddressWellControllerUnitTests.testInputPaneShowing", function (tc) {
        /// <summary>
        /// Tests that the function calls setTimeout
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var activeElement = document.createElement("input");
        activeElement.id = _controller._input._inputFieldId;
        _controller._getScrollableElement = function () { return document.createElement("div"); };
        var setTimeoutCount = 0;
        try {
            // Set up activeElement
            document.body.appendChild(activeElement);
            activeElement.focus();

            window.setTimeout = function (callback, duration) {
                setTimeoutCount++;
                tc.isTrue((duration > 0), "Duration must be greater than 0");
            };

            var event = { occludedRect: { y: 0 } };
            _controller._inputPaneShowing(event);
            tc.areEqual(1, setTimeoutCount, "setTimeout should have been called");
            tc.isNotNull(_controller._inputPaneShowingTimeout, "Timeout shold have been cached");
        } finally {
            // Clean up the DOM after we are done testing
            document.body.removeChild(activeElement);
        }
    });

    Tx.test("AddressWellControllerUnitTests.testScrollIntoViewEverythingFits", function (tc) {
        /// <summary>
        /// Verifies scrollIntoView when everything fits
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var scrollableElement = { offsetHeight: 40 };
        _controller._getScrollableElement = function () { return scrollableElement; };
        window.innerHeight = 45;

        var expectedCheckTop = false;

        Jx.isHTMLElement = function (element) { return true; };

        var scrollIntoViewCalled = false;

        var inputRootElement = { offsetHeight: 20 };
        _controller._input = {
            getRootElement: function () {
                return inputRootElement;
            },
            _inputElement: { id: "inputElement" }
        };
        _controller._dropDown = {
            getRootElement: function () {
                return { offsetHeight: 20 };
            },
            _bottomElement: { id: "bottomElement" }
        };
        _controller.hasFocus = function () { return true; }

        AddressWell.scrollIntoViewIfNotInView = function (element, checkTop, xScrollableElement) {

            tc.areEqual(_controller._dropDown._bottomElement, element, "Element is incorrect");
            tc.areEqual(expectedCheckTop, checkTop, "Checktop is incorrect");

            scrollIntoViewCalled = true;
        };

        _controller._scrollIntoView();

        tc.isTrue(scrollIntoViewCalled, "Failed to call scrollIntoView");
    });

    Tx.test("AddressWellControllerUnitTests.testScrollIntoViewNothingFits", function (tc) {
        /// <summary>
        /// Verifies scrollIntoView when things don't fit
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var scrollableElement = { offsetHeight: 200 };
        _controller._getScrollableElement = function () { return scrollableElement; };
        window.innerHeight = 225;
        var expectedCheckTop = true;

        var mockScrollToElement = {
            offsetHeight: 10,
            id: "scrollToElement"
        };
        mockScrollToElement.scrollIntoView = function (checkTop) {
            tc.areEqual(expectedCheckTop, checkTop, "CheckTop is incorrect");
            scrollIntoViewCalled = true;
        };
        document.getElementById = function (id) {
            return mockScrollToElement;
        };

        var scrollIntoViewCalled = false;

        var inputRootElement = { offsetHeight: 100 };
        _controller._input = {
            getRootElement: function () {
                return inputRootElement;
            },
            _inputElement: { id: "inputElement" }
        };
        _controller._dropDown = {
            getRootElement: function () {
                return { offsetHeight: 200 };
            },
            _bottomElement: { id: "bottomElement" }
        };
        _controller.hasFocus = function () { return true; }
        

        Jx.isHTMLElement = function (element) { return true; };

        _controller._scrollIntoView();

        tc.isTrue(scrollIntoViewCalled, "Failed to call scrollIntoView");
    });

    Tx.test("AddressWellControllerUnitTests.testControllerAddRecipientsByString", function (tc) {
        /// <summary>
        /// Tests the addRecipientsByString method used by partners.
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var inputString = "test";
        _controller._input.addRecipientsByString = function (recipientsString, biciRecipientAddMethod) {
            tc.areEqual(inputString + ";", recipientsString, "String is incorrect");
            tc.areEqual(AddressWell.RecipientAddMethod.preFilled, biciRecipientAddMethod, "Bici data point is incorrect");
        };

        _controller.addRecipientsByString(inputString);
    });

    Tx.test("AddressWellControllerUnitTests.testProcessChatPerson", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var controllerChat = new AddressWell.Controller("idPrefix", null, {}, true, "hintText3", AddressWell.ContactSelectionMode.chatContacts);
        controllerChat._lvResults = [];
        
        controllerChat._lvCollection = {
            count : 2,
            item : function (index) {
                if (index === 0) {
                    // return me contact.
                    return { objectType : "MeContact" };
                } else {
                    return { objectType : "Contact" };
                }
            }
        };

        controllerChat._loopThroughCollection();
        tc.areEqual(1, controllerChat._lvResults.length, "Invalid number of the filtered chat contacts");
    });
    
})();