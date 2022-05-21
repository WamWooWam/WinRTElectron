
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {
    // Place to store original global state that is changed by the tests
    var _originalGetElementById;
    var _originalCreateElement;
    var _originalSOXE;
    var _originalJxFault;
    var _originalJxRes;

    var previewTitleId = "shareTitle";
    var previewDescriptionid = "shareDescription";

    var unitTestElement;

    function setup (tc) {
        ///<summary>
        /// Save global state that will be changed by the tests
        ///</summary>

        _originalGetElementById = document.getElementById;
        _originalCreateElement = document.createElement;
        _originalSOXE = Share.SOXE;
        _originalJxFault = Jx.fault;
        _originalJxRes = Jx.res;

        Jx.res = {
            getString: function (stringId) { return stringId; },
            processAll: function () {}
        };

        Share.SOXE = {
            beginSOXERequest : function() {},
            soxeRequest : function() {},
            endSOXE : function() {}
        };
        
        Jx.log = {
            info : function() {},
            verbose : function() {},
            error : function() {}
        };

        Jx.fault = function () { };

        // Set up HTML element to be used by unit tests
        unitTestElement = document.createElement("div");
        document.body.appendChild(unitTestElement);
    }
    
    function cleanup (tc) {
        ///<summary>
        /// Replace global state
        ///</summary>
        
        document.getElementById = _originalGetElementById;
        document.createElement = _originalCreateElement;
        Jx.fault = _originalJxFault;
        Jx.res = _originalJxRes;
        Share.SOXE = _originalSOXE;
        document.body.removeChild(unitTestElement);
    }
	
	var opt = {
        owner: "nthorn",
        priority: "0"
    };
    
    function createSharePreview() {
        ///<summary>
        /// Calls Share.Preview constructor to create a dummy object.
        ///</summary>
        ///<returns type="Share.Preview">Created Share.Preview object</returns>

        var linkData = {
            url: "http://www.live.com/?previewUnitTest"
        };

        return new Share.Preview(linkData);
    }

    function createPreviewWithElement(id) {
        /// <summary>
        /// Creates the prevew component and attaches it to a div with the given ID
        /// </summary>
        /// <param name="id" type="String" optional="true">HTML ID for element associated with preview</param>

        var htmlId = id;

        if (!htmlId) {
            htmlId = "preview";
        }

        unitTestElement.innerHTML = '<div id="' + htmlId + '"></div>';
        var previewComponent = createSharePreview();
        previewComponent._id = htmlId;

        return previewComponent;
    }

    opt.description = "A test where the constructor is not called via new. Verifies it throws an appropriate helpful message for the caller.";
    Tx.test("ShareAnything.SharePreview.testConstructorWithoutNewError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        tc.expectException(function() {
            var component = Share.Preview();
        }, "Share.Preview is a constructor; it must be called using new.");
    });

    opt.description = "A test to validate initial state after construction";
    Tx.test("ShareAnything.SharePreview.testConstructor", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var linkData = {
            url: "http://www.msn.com",
            title: "title"
        };
        var soxeUrl = "http://www.live.com/soxe";

        var component = new Share.Preview(linkData, soxeUrl);

        tc.areEqual(linkData, component._linkData, "Expected linkData to be saved internally");
        tc.areEqual(soxeUrl, component._soxeUrl, "Expected soxeUrl to be saved internally");
    });

    opt.description = "Validates getData retrieves the data from the stored data";
    Tx.test("ShareAnything.SharePreview.testGetData", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var initialPropertyValue = "This is a mock Share.Data object";
        var mockData = {
            url: "",
            thumbnailUrl: "",
            imgHeight: 0,
            imgWidth: 0,
            initialProperty: initialPropertyValue
        };
        
        // mock an item in the list
        var mockItem = {
            data : {
                img : {
                    src : "mySrc"
                }
            }
        }

        // mock the list
        var mockList = {
            getItem : function (x) {return mockItem;}
        }

        // mock flipper
        var mockFlipper = {
            currentPage : function () { return 0;}
        }

        var component = createSharePreview();
        component._linkData = mockData;
        component._uiInitialized = true;
        component._list = mockList;
        component._flipView = mockFlipper;

        var dataResult = component.getData();

        tc.areEqual("mySrc", component._linkData.thumbnailUrl, "Unexpected result for thumbnail in getData");

        // Test the noImage\loading image case
         // mock an item in the list
        var mockItem = {
            data : {
                img : null
            }
        }

        var dataResult = component.getData();
        tc.areEqual("", component._linkData.thumbnailUrl, "Thumbnail should be returned empty");
    });

    opt.description = "Tests the startImageLoading method";
    Tx.test("ShareAnything.SharePreview.testStartImageLoading", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        document.createElement = function () {
            return {
                src: "",
                addEventListener: function () {}
            };
        }

        var mockData = { 
            thumbnailUrl: "",
            imgHeight: 0,
            imgWidth: 0,
            images: ["mySrc"]
        };

        var component = createSharePreview();
        component._linkData = mockData;
        component._startImageLoading();

        tc.areEqual("mySrc", component._imgArray[0].src, "Src not set properly");
        
    });

    opt.description = "Validates activateUI behaves correctly when it's called multiple times for the finished loading scenario";
    Tx.test("ShareAnything.SharePreview.testActivateUIMultipleFinishLoading", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var renderCount = 0;

        var component = createSharePreview();
        component._soxeComplete = true;
        component._soxePromise = null;
        component._noSoxeDataRender = function () {
            renderCount++;
        };

        component.activateUI();
        component.activateUI();

        tc.areEqual(1, renderCount, "Preview was rendered an incorrect number of times");
    });

    opt.description = "Validates activateUI behaves correctly when it's called multiple times for the attach loading close button behavior";
    Tx.test("ShareAnything.SharePreview.testActivateUIMultipleLoadingButton", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var addEventListenerCount = 0;

        // mock getElementById is used to grab the container in which the title/description are placed.
        document.getElementById = function () {
            return {
                addEventListener: function () { addEventListenerCount++; }
            };
        };

        var component = createSharePreview();

        component.activateUI();
        component.activateUI();

        tc.areEqual(1, addEventListenerCount, "Incorrect number of event listeners added");
    });

    opt.description = "Verifies setAuth behavior";
    Tx.test("ShareAnything.SharePreview.testSetAuth", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var soxeStarted = false;
        var ticket = "FAKETICKET";

        var component = createSharePreview();
        component.hasUI = function () { tc.error("Unexpected call to hasUI"); };
        component._noSoxeDataRender = function () { tc.error("Unexpected call to _noSoxeDataRender"); };

        Share.SOXE.beginSOXERequest = function () {
            var fakePromise = {
                then: function () { }
            };

            soxeStarted = true;
            
            return fakePromise;
        };

        component.setAuth(ticket);

        tc.isTrue(soxeStarted, "Expected soxe to start after setAuth");
    });

    opt.description = "TODO";
    Tx.test("ShareAnything.SharePreview.testSetAuthNoAuth", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        /// <summary>
        /// Verifies behavior when there is no auth. 
        /// This is the retail mode case as well as an error case
        /// </summary>

        var noTicket = ""; // Target will pass in empty string for no ticket

        Share.SOXE.beginSOXERequest = function () { tc.error("Unexpected call to BeginSoxeRequest"); };

        var component = createSharePreview();

        component.setAuth(noTicket);

        tc.isTrue(component._soxeComplete, "Should mark SOXE complete when there is no auth");
    });

    opt.description = "Validates deactivateUI";
    Tx.test("ShareAnything.SharePreview.testDeactivateUI", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var canceledSoxe = false;
        var removedEventListener = false;
        var deactivatedFlipView = false;

        var component = createSharePreview();

        component._soxePromise = {
            cancel: function () { canceledSoxe = true; }
        };
        component._cleanupFlipView = function () {
            deactivatedFlipView = true;
        };
        
        // set up close button
        var closeButton = {
            addEventListener: function (event, listener) {
                this.listener = listener;
            },
            removeEventListener: function (event, listener) {
                // Make sure the correct function was removed
                tc.areEqual(this.listener, listener, "Event listener removed did not match");
                removedEventListener = true;
            }
        };
        document.getElementById = function () { return closeButton; };

        component.activateUI();
        component.deactivateUI();

        tc.isTrue(canceledSoxe, "Expected deactivateUI to cancel SOXE call");
        tc.isTrue(removedEventListener, "Expected deactivateUI to remove close click handler");
        tc.isTrue(deactivatedFlipView, "Expected deactivateUI to clean up flip view");
    });

    opt.description = "Validates deactivateUI when some internal items are null";
    Tx.test("ShareAnything.SharePreview.testDeactivateUINullItems", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var component = createSharePreview();
        component._soxePromise = null; // This will be null after the promise is completed
        component._uiInitialized = true;
        
        // Close button should also be null
        tc.isNull(document.getElementById("sharePVClose"), "Invalid test setup: close button should not be available");

        // the above test verified the functionality, this test is just that this does not throw.
        component.deactivateUI();
    });

    opt.description = "Verifies cleanupFlipView (calls twice)";
    Tx.test("ShareAnything.SharePreview.testCleanupFlipViewTwice", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var removeErrorCount = 0;
        var removeLoadCount = 0;

        var component = createSharePreview();
        // Set up the event handlers
        component._soxeComplete = true;
        component._hasSoxeData = false;
        component._noSoxeDataRender = function () { };
        component.activateUI();
        component._flipView = {
            removeEventListener: function (eventName, eventHandler) {
                tc.areEqual("pageselected", eventName, "Unexpected event name");
                tc.areEqual(component.pageHandler, eventHandler, "Mismatch event handler - pageSelected");
            }
        };

        var mockImage = { 
            removeEventListener: function (eventName, eventHandler) {
                if (eventName === "load") {
                    tc.areEqual(component._imgOnLoadEvent, eventHandler, "Mismatch in event handler");
                    removeLoadCount++;
                } else if (eventName === "error") {
                    tc.areEqual(component._errorLoadingImage, eventHandler, "Mismatch in event handler");
                    removeErrorCount++;
                } else {
                    tc.error("Unexpected removeEvent");
                }
            }
        }

        component._imgArray = [mockImage, mockImage, mockImage];

        // Running this twice since this can be called twice in page flow
        component._cleanupFlipView();
        component._cleanupFlipView();
        
        tc.isNull(component._imgArray, "Did not remove reference to image objects");
        tc.isNull(component._imgOnLoadEvent, "Did not remove reference to image load handler");
        tc.isNull(component._errorLoadingImage, "Did not remove reference to image error handler");
        tc.isNull(component.pageHandler, "Did not remove reference to page selected handler");
        tc.isNull(component._flipView, "Did not remove reference to flipView");
        tc.areEqual(3, removeLoadCount, "Expected image event handlers to be removed once per image");
        tc.areEqual(3, removeErrorCount, "Expected image event handlers to be removed once per image");
    });


    opt.description = "Verifies that the title and description are rendered when non-empty";
    Tx.test("ShareAnything.SharePreview.testRenderPreviewTitleDescription", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);


        var mockData = {
            title: "this is the title for the preview",
            description: "this is the description for the preview",
            url: "http://www.live.com/?previewtitledescription"
        };

        var component = createSharePreview();
        component._linkData = mockData;

        var testPreviewElement = document.createElement('div');
        testPreviewElement.id = "hiddenSharePreview";

        unitTestElement.appendChild(testPreviewElement);

        component._renderPreview(false);

        tc.isFalse(testPreviewElement.innerHTML.indexOf(mockData.title) === -1, "Expected to find title in preview HTML");
        tc.isFalse(testPreviewElement.innerHTML.indexOf(mockData.description) === -1, "Expected to find description in preview HTML");
    });

    opt.description = "Verifies that the title doesn't render if it's empty";
    Tx.test("ShareAnything.SharePreview.testRenderPreviewNoTitle", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var mockData = {
            title : "",
            description : "this is the description",
            url : "http://www.live.com/?testurl=true"
        };



        var component = createSharePreview();
        component._linkData = mockData;

        var testPreviewElement = document.createElement('div');
        testPreviewElement.id = "hiddenSharePreview";

        unitTestElement.appendChild(testPreviewElement);

        component._renderPreview(false);

        tc.isTrue(testPreviewElement.innerHTML.indexOf(previewTitleId) === -1, "HTML string should not contain title ID");
    });

    opt.description = "Verifies that the title doesn't render if it's the same as the URL";
    Tx.test("ShareAnything.SharePreview.testRenderPreviewUrlTitle", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var urlString = "http://www.live.com/?unittest=url";

        var mockData = {
            url: urlString,
            title: urlString,
            description: "this is the description"
        };

        var component = createSharePreview();
        component._linkData = mockData;

        var testPreviewElement = document.createElement('div');
        testPreviewElement.id = "hiddenSharePreview";

        unitTestElement.appendChild(testPreviewElement);

        component._renderPreview(false);

        tc.isTrue(testPreviewElement.innerHTML.indexOf(previewTitleId) === -1, "HTML string should not contain title ID");
    });

    opt.description = "Verifies the cancel soxe callback's behavior";
    Tx.test("ShareAnything.SharePreview.testCancelSoxe", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Set up return value from beginSoxeRequest to return a promise that we'll be checking on later
        var soxeIsCanceled = false;
        var mockPromise = {
            then: function () { },
            cancel: function () { soxeIsCanceled = true; }
        };

        var component = createSharePreview();
        component._soxePromise = mockPromise;

        // Set up noSoxeDataRender for confirmation
        var calledRender = false;
        component._noSoxeDataRender = function () {
            calledRender = true;
        }
        // Call the cancel method to make sure it functions correctly:
        // 1. It should cancel the SOXE call
        // 2. It should call noSoxeDataRender
        component._cancelHandler();

        tc.isTrue(soxeIsCanceled, "Expected cancel method to cancel the SOXE request");
        tc.isTrue(calledRender, "Expected cancel method to call _noSoxeDataRender");
    });

    opt.description = "Test the initializeFlipper method";
    Tx.test("ShareAnything.SharePreview.testInitializeFlipper", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        var imagesStarted = false;

        var flipViewElement = document.createElement('div');
        flipViewElement.id = "share-pvFlipView";
        flipViewElement.winControl = {
            itemTemplate : function () {},
            addEventListener : function () {},
            itemDataSource : function () {},
        }

        var imgPreviewElement = document.createElement('div'); 
        imgPreviewElement.id = "sharePVImgArea";

        var textPreviewElement = document.createElement('div'); 
        textPreviewElement.id = "sharePVTextArea";
        
        var rightArrow = document.createElement("button");
        var leftArrow = document.createElement("button");
        rightArrow.className = "win-navbutton win-navright";
        leftArrow.className = "win-navbutton win-navleft";

        flipViewElement.appendChild(rightArrow);
        flipViewElement.appendChild(leftArrow);
        flipViewElement.appendChild(imgPreviewElement);
        flipViewElement.appendChild(textPreviewElement);
        unitTestElement.appendChild(flipViewElement);

        var component = createSharePreview();
        component._startImageLoading = function () { imagesStarted = true; }
        component._imageId = imgPreviewElement.id;
        component._initializeFlipper();

        // verify the arrows are properly stored
        tc.areEqual(component._leftArrow.className, leftArrow.className, "Left Arrow is not correctly stored."); 
        tc.areEqual(component._rightArrow.className, rightArrow.className, "right Arrow is not correctly stored.");

        tc.isTrue(imagesStarted, "Expected initializeFlipper to start the image loads");
        tc.isNotNull(component._list, "The list was not initialized");
    });

    opt.description = "TODO";
    Tx.test("ShareAnything.SharePreview.testPageHandler", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        ///<summary>
        /// Test the pageHandler method, this sets the class for the arrows based on the current page of the flipper.
        /// Four cases:
        /// 1) first page 2) last page 3) No Soxe Data only one page in flipper 4) All other cases
        ///</summary>

        // Mock the flipView for this method
        var mockFlipView = {
            currentPage : 0 
        }

        // Begin the componenet in a default state
        var component = createSharePreview();
        component._rightArrow = document.createElement("button");
        component._leftArrow = document.createElement("button");
        component._rightArrow.className = "win-navbutton win-navright";
        component._leftArrow.className = "win-navbutton win-navleft";

        // set the component for first page case
        component._flipView = mockFlipView;
        component._currentFlipperCount = 10;
        component._imagesArrayCreated = true;
        component.pageHandler();

        // left arrow should be invisible right arrow should be set to default
        tc.areEqual (component._leftArrow.className,  "win-navbutton win-navleft leftNotVisible", "Case 1) Left Arrow is not invisible");
        tc.areEqual (component._rightArrow.className,  "win-navbutton win-navright", "Case 1) Right Arrow is not default");

         // set the component for last page case
        component._flipView.currentPage = 9;
        component._currentFlipperCount = 10;
        component.pageHandler();

        // left arrow should be invisible right arrow should be set to default
        tc.areEqual (component._leftArrow.className,  "win-navbutton win-navleft", "Case 2) Left Arrow is not default");
        tc.areEqual (component._rightArrow.className,  "win-navbutton win-navright rightNotVisible", "Case 2) Right Arrow is not invisible");

        // Default case
        component._flipView.currentPage = 4;
        component._currentFlipperCount = 10;
        component.pageHandler();

        // left arrow should be invisible right arrow should be set to default
        tc.areEqual (component._leftArrow.className,  "win-navbutton win-navleft", "Case 4) Left Arrow is not default");
        tc.areEqual (component._rightArrow.className,  "win-navbutton win-navright", "Case 4) Right Arrow is not default");
    });

    opt.description = "TODO";
    Tx.test("ShareAnything.SharePreview.testPageHandlerRTL", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        ///<summary>
        /// Test the pageHandler method, this sets the class for the arrows based on the current page of the flipper for rtl langs.
        /// Four cases:
        /// 1) first page 2) last page 3) No Soxe Data only one page in flipper 4) All other cases
        ///</summary>

        // Mock the flipView for this method
        var mockFlipView = {
            currentPage : 0
        }

        // Begin the componenet in a default state
        var component = createSharePreview();
        component._imagesArrayCreated = true;
        component._rightArrow = document.createElement("button");
        component._leftArrow = document.createElement("button");
        component._rightArrow.className = "win-navbutton win-navright";
        component._leftArrow.className = "win-navbutton win-navleft";

        // set the component for first page case
        component._flipView = mockFlipView;
        component._currentFlipperCount = 10;
        Jx.isRtl = function () { return true; };
        component.pageHandler();

        // case 1 the first slide in the flipper
        tc.areEqual (component._leftArrow.className,  "win-navbutton win-navleft", "Case 1) Left Arrow class is not correct");
        tc.areEqual (component._rightArrow.className,  "win-navbutton win-navright rightNotVisible", "Case 1) Right Arrow is not invisible");

            // set the component for last page case
        component._flipView.currentPage = 9;
        component._currentFlipperCount = 10;
        component.pageHandler();

        // case 2 the last page
        tc.areEqual (component._leftArrow.className,  "win-navbutton win-navleft leftNotVisible", "Case 2) Left Arrow is not invisible");
        tc.areEqual (component._rightArrow.className,  "win-navbutton win-navright", "Case 2) Right Arrow is not default");

        // Default case
        component._flipView.currentPage = 4;
        component._currentFlipperCount = 10;
        component.pageHandler();

        // left arrow should be invisible right arrow should be set to default
        tc.areEqual (component._leftArrow.className,  "win-navbutton win-navleft", "Case 4) Left Arrow is not default");
        tc.areEqual (component._rightArrow.className,  "win-navbutton win-navright", "Case 4) Right Arrow is not default");
    });

    opt.description = "Verifies the page handler method initializes the flipView if needed.";
    Tx.test("ShareAnything.SharePreview.testPageHandlerInitializesFlipView", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        var calledCheckShow = false;

        var component = createSharePreview();
        component._leftArrow = {};
        component._rightArrow = {};
        component._flipView = {};
        component._checkShowFlipView = function () { calledCheckShow = true; };

        component.pageHandler();

        tc.isTrue(calledCheckShow, "Expected call to _checkShowFlipView");
        tc.isTrue(component._flipViewInitialized, "Need to record that flipView is initialized otherwise it will not be shown");
    });

    opt.description = "Verifies that if the pageHandler function chooses to dispose the flip view in checkShowFlipView, it doesn't break";
    Tx.test("ShareAnything.SharePreview.testPageHandlerRendersNoImage", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var calledCheckShow = false;

        var component = createSharePreview();
        component._flipView = {};
        component._leftArrow = {};
        component._rightArrow = {};
        component._checkShowFlipView = function () {
            // mimics checkShowFlipView when it chooses to render the noImage case and dispose the flipView
            calledCheckShow = true;
            this._flipView = null;
            this._leftArrow = null;
            this._rightArrow = null;
        }

        // Test is basically that this does not throw
        component.pageHandler();

        tc.isTrue(calledCheckShow, "Invalid test setup: checkShowFlipView was not called.");
    });

    function createMockImageLoadEvent(imageHeight, imageWidth) {
        /// <summary>
        /// Creates a mock image onload event.
        /// Used in testImgOnLoadEvent tests.
        /// </summary>
        /// <param name="imageHeight" type="Number">Height of the loaded image</param>
        /// <param name="imageWidth" type="Number" optional="true">Width of the loaded image.  If not specified, height is used.</param>

        if (!imageWidth && imageWidth !== 0) {
            imageWidth = imageHeight;
        }

        var mockImg = {
            width: imageWidth,
            height: imageHeight
        };

        var mockEvent = {
            srcElement: mockImg,
            target: mockImg
        };

        return mockEvent;
    }

    opt.description = "Tests _imgOnLoadEvent when the image is too small";
    Tx.test("ShareAnything.SharePreview.testImgOnLoadEventTooSmall", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var calledAddToFlipView = false;
        var calledCheckShow = false;

        var mockEvent = createMockImageLoadEvent(10);

        var component = createSharePreview();
        component._imgArray = [{}];
        component._checkShowFlipView = function () { calledCheckShow = true; }
        component._addSingleImageToFlipView = function () { calledAddToFlipView = true; };
         
        component._imgOnLoadEvent(mockEvent);

        tc.isTrue(calledCheckShow, "Should always call checkShowFlipView in the image load event");
        tc.isFalse(calledAddToFlipView, "Should not put an image that's too small in the flip view");
        tc.areEqual(1, component._imageErrorCount, "Too small image should be added to error count");
        tc.areEqual(0, component._imageSuccessCount, "Too small image should not be added to success count");
    });

    opt.description = "Tests _imgOnLoadEvent when the image is long and thin (fails our banner test)";
    Tx.test("ShareAnything.SharePreview.testImgOnLoadEventBanner", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var mockEvent = createMockImageLoadEvent(100, 600);

        var component = createSharePreview();
        component._imgArray = [{}];
        component._checkShowFlipView = function () { };
        
        component._imgOnLoadEvent(mockEvent);

        tc.areEqual(1, component._imageErrorCount, "Banner image should be added to error count");
        tc.areEqual(0, component._imageSuccessCount, "Banner image should no be added to success count");
    });

    opt.description = "Verifies that a direct image will be shown even if it violates some of the other checks.";
    Tx.test("ShareAnything.SharePreview.testImageOnLoadDirectImage", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var mockEvent = createMockImageLoadEvent(1, 50);

        var component = createSharePreview();
        component._imgArray = [mockEvent.target]; // set up the loaded image to be the thumbnail
        component._checkShowFlipView = function () { };
        component._linkData.isDirectImage = true;

        component._imgOnLoadEvent(mockEvent);

        tc.areEqual(0, component._imageErrorCount, "Direct image should not be added to error count");
        tc.areEqual(1, component._imageSuccessCount, "Direct image should be added to success count");
    });

    opt.description = "Tests _imgOnLoadEvent when the image is the thumbnail";
    Tx.test("ShareAnything.SharePreview.testImgOnLoadEventThumbnail", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var mockEvent = createMockImageLoadEvent(10);

        var component = createSharePreview();
        component._checkShowFlipView = function () { };
        component._addSingleImageToFlipView = function () { };
        component._imgArray = [mockEvent.target]; // set up the loaded image to be the thumbnail

        component._imgOnLoadEvent(mockEvent);

        tc.isTrue(component._thumbnailLoaded, "Expected thumbnail loaded flag to be true after loading the thumbnail");
    });

    opt.description = "Tests _imgOnLoadEvent when the preview isn't visible yet";
    Tx.test("ShareAnything.SharePreview.testImgOnLoadEventNoPreview", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var calledAddToFlipView = false;
        var calledCheckShow = false;

        var mockEvent = createMockImageLoadEvent(100);

        var component = createSharePreview();
        component._imgArray = [{}];
        component._checkShowFlipView = function () { calledCheckShow = true; }
        component._addSingleImageToFlipView = function () { calledAddToFlipView = true; };

        component._imgOnLoadEvent(mockEvent);

        tc.isTrue(calledCheckShow, "Should always call checkShowFlipView in the image load event");
        tc.isFalse(calledAddToFlipView, "Should not put an image in the flip view if the preview isn't showing yet");
        tc.areEqual(0, component._imageErrorCount, "Image should not be added to error count");
        tc.areEqual(1, component._imageSuccessCount, "Image should be added to success count");
    });

    opt.description = "Tests _imgOnLoadEvent when the preview is visible";
    Tx.test("ShareAnything.SharePreview.testImgOnLoadEventPreview", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var calledAddToFlipView = false;
        var calledCheckShow = false;
        var images = [{}];

        var mockEvent = createMockImageLoadEvent(100);

        var component = createSharePreview();
        component._imgArray = images;
        component._previewVisible = true;
        component._checkShowFlipView = function () { calledCheckShow = true; }
        component._addSingleImageToFlipView = function () { calledAddToFlipView = true; };

        component._imgOnLoadEvent(mockEvent);

        tc.isTrue(calledCheckShow, "Should always call checkShowFlipView in the image load event");
        tc.isTrue(calledAddToFlipView, "Should image in the flip view if the preview is showing");
        tc.areEqual(0, component._imageErrorCount, "Image should not be added to error count");
        tc.areEqual(1, component._imageSuccessCount, "Image should be added to success count");
    });

    opt.description = "Verifies addAllToFlipView";
    Tx.test("ShareAnything.SharePreview.testAddAllToFlipView", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var lastAction = "start";

        var mockLoadedImage = {
            src: "imagesrc.png",
            flipViewReady: true
        };
        var mockNotLoadedImage = {
            src: "notready.png"
        };

        var component = createSharePreview();
        component._imgArray = [mockLoadedImage, mockLoadedImage, mockNotLoadedImage, mockNotLoadedImage, mockLoadedImage];
        component._imageSuccessCount = 3;
        component._list = [component._noImageSlide, component._noImageSlide];
        component._list.setAt = function (index, item) {
            tc.areEqual("beginEdits", lastAction, "setAt called at unexpected time - changes not correctly wrapped in begin/end edits");
            lastAction = "addItem";
            this[index] = item;
        };
        component._list.push = function (item) {
            tc.areEqual("beginEdits", lastAction, "setAt called at unexpected time - changes not correctly wrapped in begin/end edits");
            lastAction = "addItem";
            this[this.length] = item;
        };
        component._flipView = {
            itemDataSource: {
                beginEdits: function () {
                    tc.isTrue(lastAction === "start" || lastAction === "endEdits", "beginEdits called at unexpected time - changes not correctly wrapped in begin/end edits");
                    lastAction = "beginEdits";
                },
                endEdits: function () {
                    tc.isTrue(lastAction === "addItem", "endEdits called at unexpected time - changes not correctly wrapped in begin/end edits");
                    lastAction = "endEdits";
                }
            },
            next: function () { }
        };

        component._addAllToFlipView();
        
        tc.areEqual("endEdits", lastAction, "Expected last action to be endEdits - changes not correctly wrapped in begin/end edits");
        tc.areEqual(3 + 2, component._list.length, "Unexpected number of added images - should only add loaded images");
        tc.areEqual(component._noImageSlide, component._list[0], "Expected no image slide at the beginning of the list");
        tc.areEqual(component._noImageSlide, component._list[4], "Expected no image slide at the end of the list");
    });

    opt.description = "Verifies addSingleImageToFlipView";
    Tx.test("ShareAnything.SharePreview.testAddSingleImageToFlipView", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // TODO: modify to work with single image

        var lastAction = "start";

        var component = createSharePreview();
        component._list = [component._noImageSlide, {id: "image1"}, {id: "image2"}, {id: "image3"}, component._noImageSlide];
        component._list.setAt = function (index, item) {
            tc.areEqual("beginEdits", lastAction, "setAt called at unexpected time - changes not correctly wrapped in begin/end edits");
            lastAction = "addItem";
            this[index] = item;
        };
        component._list.push = function (item) {
            tc.areEqual("beginEdits", lastAction, "setAt called at unexpected time - changes not correctly wrapped in begin/end edits");
            lastAction = "addItem";
            this[this.length] = item;
        };
        component._flipView = {
            itemDataSource: {
                beginEdits: function () {
                    tc.isTrue(lastAction === "start" || lastAction === "endEdits", "beginEdits called at unexpected time - changes not correctly wrapped in begin/end edits");
                    lastAction = "beginEdits";
                },
                endEdits: function () {
                    tc.isTrue(lastAction === "addItem", "endEdits called at unexpected time - changes not correctly wrapped in begin/end edits");
                    lastAction = "endEdits";
                }
            }
        };

        component._addSingleImageToFlipView({id: "newImage"});

        tc.areEqual("endEdits", lastAction, "Expected last action to be endEdits - changes not correctly wrapped in begin/end edits");
        tc.areEqual(4 + 2, component._list.length, "Unexpected number of added images - should only add loaded images");
        tc.areEqual(component._noImageSlide, component._list[0], "Expected no image slide at the beginning of the list");
        tc.areEqual(component._noImageSlide, component._list[5], "Expected no image slide at the end of the list");
    });

    opt.description = "Test the soxeCallback";
    Tx.test("ShareAnything.SharePreview.testSoxeCallback", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var titleAndDescriptionRendered = false;
        var mockRenderTitleAndDescription = function () {
            titleAndDescriptionRendered = true;
        }

        var populateSoxeDataCalled = false;
        var mockData = {
            populateSoxeData: function () {
                populateSoxeDataCalled = true;
            },
            images: ["url1 ", "url2", "url3"]
        };
        
        // Mock up DOM function that would be reset during tear down
        document.createElement = function (type) { return { addEventListener: function () {}}; };

        unitTestElement.id = "soxeCallBackTest";

        var component = createSharePreview();
        component._imageId =  unitTestElement.id ;
        component._linkData = mockData;
        component._renderPreview = mockRenderTitleAndDescription;
        component._initializeFlipper = function () {};
        component.hasUI = function () { return true; };
        component._soxeCallback(mockData);

        tc.isTrue(titleAndDescriptionRendered, "title and description are rendered");
        tc.isTrue(populateSoxeDataCalled, "populate soxe data is called");
        tc.isTrue(component._hasSoxeData, "Expected hasSoxeData to be true");
    });

    opt.description = "Verifies that the soxeCallback function doesn't do anything if the component is shut down.";
    Tx.test("ShareAnything.SharePreview.testSoxeCallbackShutdown", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var component = createSharePreview();
        component._linkData = {
            populateSoxeData: function () { tc.error("Unexpected call to populateSoxeData"); }
        };
        component.hasUI = function () { tc.error("Unexpected call to hasUI"); };
        component.shutdownComponent();

        // Jx.log will be null during shutdown, make that the case here as well.
        Jx.log = null;

        component._soxeCallback({});

        // Test is that it does not hit any tc.error case, above.
    });

    opt.description = "Verifies soxeErrorCallback does the right thing when the control has UI";
    Tx.test("ShareAnything.SharePreview.testSoxeErrorCallback", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var rendered = false;;

        var component = createSharePreview();
        component.hasUI = function () { return true; };
        component._noSoxeDataRender = function () { rendered = true; };

        component._soxeErrorCallback();

        tc.isTrue(rendered, "Did not see expected call to render");
        tc.isFalse(component._hasSoxeData, "Expect hasSoxeData to be false");
    });

    opt.description = "Verifies soxeErrorCallback does the right thing when the control has no UI";
    Tx.test("ShareAnything.SharePreview.testSoxeErrorCallbackNoUI", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var rendered = false;

        var component = createSharePreview();
        component.hasUI = function () { return false; };
        component._noSoxeDataRender = function () { rendered = true; };

        component._soxeErrorCallback();

        tc.isFalse(rendered, "Unexpected call to render");
        tc.isTrue(component._soxeComplete, "Expect soxeComplete to be true");
    });

    opt.description = "Verifies soxeErrorCallback does the right thing when the control has been shut down";
    Tx.test("ShareAnything.SharePreview.testSoxeErrorCallbackShutdown", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var rendered = false;

        var component = createSharePreview();
        component.hasUI = function () { return false; };
        component._noSoxeDataRender = function () { rendered = true; };
        component.shutdownComponent();

        // Jx.log will be null during shutdown, make that the case here as well.
        Jx.log = null;

        component._soxeErrorCallback();

        tc.isFalse(rendered, "Unexpected call to render");
    });

    opt.description = "Test that the image count is iterated when an error occurs loading an image.";
    Tx.test("ShareAnything.SharePreview.testErrorLoadingImage", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
      
        var calledCheckShow = false;

        var component = createSharePreview();
        component._imageErrorCount = 0;
        component._imgArray = [{}];
        component._checkShowFlipView = function () { calledCheckShow = true; };

        // Test basic error case where image number is iterated
        component._errorLoadingImage({});

        tc.areEqual(1, component._imageErrorCount, "The image error count is not being updated.")
        tc.isTrue(calledCheckShow, "Should always check to see if we should show the flipView");
        tc.isFalse(component._thumbnailLoaded, "Loaded image was not the thumbnail");
    });

    opt.description = "Make sure that the error loading image function records whether the image was the thumbnail";
    Tx.test("ShareAnything.SharePreview.testErrorLoadingImageThumbnail", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var calledCheckShow = false;
        var mockEvent = createMockImageLoadEvent(400);

        var component = createSharePreview();
        component._imageErrorCount = 0;
        component._imgArray = [mockEvent.target];
        component._checkShowFlipView = function () { calledCheckShow = true; };

        // Verify thumbnail-related information
        component._errorLoadingImage(mockEvent);

        tc.areEqual(1, component._imageErrorCount, "The image error count is not being updated.")
        tc.isTrue(calledCheckShow, "Should always check to see if we should show the flipView");
        tc.isTrue(component._thumbnailLoaded, "Loaded image should be recognized as the thumbnail");
    });

    opt.description = "Verifies checkShowFlipView when the thumbnail has loaded";
    Tx.test("ShareAnything.SharePreview.testCheckShowFlipViewThumbnailLoaded", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // thumbnail and flip view are both ready - should render
        var calledReplacePreview = false;

        var component = createSharePreview();
        component._thumbnailLoaded = true;
        component._flipViewInitialized = true;
        component._imageSuccessCount = 5;
        component._imageTotal = 5;
        component._replacePreview = function (showNoImage) {
            tc.isFalse(showNoImage, "Should render with images");
            calledReplacePreview = true;
        };

        component._checkShowFlipView();

        tc.isTrue(calledReplacePreview, "Should show the preview");
    });

    opt.description = "Verifies checkShowFlipView when the thumbnail has not loaded";
    Tx.test("ShareAnything.SharePreview.testCheckShowFlipViewNoThumbnail", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // flipView is ready, thumbnail is not - shouldn't render
        var component = createSharePreview();
        component._thumbnailLoaded = false;
        component._flipViewInitialized = true;
        component._imageSuccessCount = 3;
        component._imageTotal = 5;
        component._replacePreview = function (showNoImage) {
            tc.error("Unexpected call to replacePreview");
        };

        component._checkShowFlipView();

        // Test is that we did not hit the tc.error, above.
    });

    opt.description = "Verifies checkShowFlipView when the flipView hasn't initialized";
    Tx.test("ShareAnything.SharePreview.testCheckShowFlipViewNoFlipView", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // thumbnail is ready, flipView is not.  Shouldn't render
        var component = createSharePreview();
        component._thumbnailLoaded = true;
        component._flipViewInitialized = false;
        component._imageSuccessCount = 5;
        component._imageTotal = 5;
        component._replacePreview = function (showNoImage) {
            tc.error("Unexpected call to replacePreview");
        };

        component._checkShowFlipView();

        // Test is that we did not hit the tc.error, above.
    });

    opt.description = "Verifies checkShowFlipView when all of the images failed";
    Tx.test("ShareAnything.SharePreview.testCheckShowFlipViewAllImagesFailed", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // flipView is ready, images are all failed.  Should render.
        var calledReplacePreview = false;

        var component = createSharePreview();
        component._thumbnailLoaded = true;
        component._flipViewInitialized = true;
        component._imageSuccessCount = 0;
        component._imageErrorCount = 5;
        component._imageTotal = 5;
        component._replacePreview = function (showNoImage) {
            tc.isTrue(showNoImage, "Should render without images");
            calledReplacePreview = true;
        };

        component._checkShowFlipView();

        tc.isTrue(calledReplacePreview, "Should show the preview");
    });

    opt.description = "Test the noSoxeDataRender method when the preview has already been rendered";
    Tx.test("ShareAnything.SharePreview.testNoSoxeDataRenderWithPreview", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        var calledRenderPreview = false;
        var calledReplacePreview = false;

        var component = createSharePreview();
        component._renderedPreview = true;
        component._renderPreview = function () { calledRenderPreview = true; };
        component._replacePreview = function (noImage) {
            tc.isTrue(noImage, "In the noSoxeData case, should not render the FlipView.");
            calledReplacePreview = true;
        };

        component._noSoxeDataRender();

        tc.isFalse(calledRenderPreview, "Should not call render preview if the preview has already been rendered");
        tc.isTrue(calledReplacePreview, "Expected call to replacePreview");
    });

    opt.description = "Test the noSoxeDataRender method when the preview has not been rendered";
    Tx.test("ShareAnything.SharePreview.testNoSoxeDataRenderNoPreview", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var calledRenderPreview = false;
        var calledReplacePreview = false;

        var component = createSharePreview();
        component._renderedPreview = false;
        component._renderPreview = function () { calledRenderPreview = true; };
        component._replacePreview = function (noImage) {
            tc.isTrue(noImage, "In the noSoxeData case, should not render the FlipView.");
            calledReplacePreview = true;
        };

        component._noSoxeDataRender();

        tc.isTrue(calledRenderPreview, "Expected call to renderPreview");
        tc.isTrue(calledReplacePreview, "Expected call to replacePreview");
    });

    this.testRenderer =  function () {
        ///<summary>
        /// Test the renderer used in the flipView
        ///</summary>

        var mockItem = {
            data: {
                type: "noImage"
            }
        };
        var mockElement = null;

        var mockItemPromise = {
            then: function (e) { 
                mockElement = e(mockItem);
            },
            cancel: function () { soxeIsCanceled = true; }
        };

        var component = createSharePreview();

        // Test No image Case
        component._renderer(mockItemPromise, mockElement);

        tc.areEqual(mockElement.className, "share-noImage", "The no image element does not have the proper class name");

        // Test the soxe image case
        mockItem = {
            data: {
                type: "SOXEImage",
                img: {
                    width: 150,
                    height: 100,
                    src: "mySOXEImg"
                }
            }
        };
        mockElement = null;
        component._renderer(mockItemPromise, mockElement);

        tc.areEqual(mockElement.innerHTML, '<img width="210" height="140" class="imgPreview" src="mySOXEImg">', "The image element innerHTML was not set correctly");

        // Test the soxe image case
        mockItem = {
            data: {
                type: "SOXEImage",
                img: {
                    width: 100,
                    height: 150,
                    src: "mySOXEImg"
                }
            }
        };
        mockElement = null;
        component._renderer(mockItemPromise, mockElement);

        tc.areEqual(mockElement.innerHTML, '<img width="96" height="145" class="imgPreview" src="mySOXEImg">', "The image element innerHTML was not set correctly");
    };


    opt.description = "Verifies that the hide function behaves correctly";
    Tx.test("ShareAnything.SharePreview.testHide", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var previewComponent = createPreviewWithElement("previewTestHide");
        previewComponent.hide();

        tc.areEqual("none", document.getElementById("previewTestHide").style.display, "Preview was not hidden");
    });

    opt.description = "Verifies that the hide function behaves correctly when there is no flipView.";
    Tx.test("ShareAnything.SharePreview.testHideNoFlipView", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var previewComponent = createPreviewWithElement();
        previewComponent._flipView = null;

        // Test is that this did not throw.
        previewComponent.hide();
    });

    opt.description = "Verifies that the show function behaves correctly";
    Tx.test("ShareAnything.SharePreview.testShow", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var forceLayoutCalled = false;

        var previewComponent = createPreviewWithElement("previewShow");
        previewComponent._flipView = {
            forceLayout: function () { forceLayoutCalled = true; }
        };

        previewComponent.hide();
        previewComponent.show();
        
        tc.areEqual("", document.getElementById("previewShow").style.display, "Expected preview element to be visible");
        tc.isTrue(forceLayoutCalled, "Expected flipView to be reset");
    });

    opt.description = "Verifies that the show function behaves correctly when there is no flipView.";
    Tx.test("ShareAnything.SharePreview.testShowNoFlipView", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var previewComponent = createPreviewWithElement();
        previewComponent._flipView = null;

        // Basically tests that this does not throw
        previewComponent.show();
    });

    opt.description = "Verifies that if an item is added during hide when the user was on the last page, we keep the user on the last page";
    Tx.test("ShareAnything.SharePreview.testAddItemDuringHide", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var previewComponent = createPreviewWithElement();
        previewComponent._flipView = {
            forceLayout: function () { }
        };

        // mimic the user being on the last page
        previewComponent._currentFlipperCount = 5;
        previewComponent._flipView.currentPage = 4;
        previewComponent.hide();

        tc.isTrue(previewComponent._wasOnLastPageForHide, "Invalid test setup: did not mock user being on the last page correctly");

        // mimic adding a new image
        previewComponent._currentFlipperCount++;

        previewComponent.show();

        // Verify the user is still on the last page even when an image was added during hide
        tc.areEqual(previewComponent._currentFlipperCount - 1, previewComponent._flipView.currentPage, "FlipView should have been moved to the last page");

        // Verify a second show doesn't do it again after moving the current page
        previewComponent._flipView.currentPage = 2;
        previewComponent.show();

        tc.areEqual(2, previewComponent._flipView.currentPage, "Calls to show while already visible should not have any additional effect");
    });

    opt.description = "Verifies that the replace preview method functions properly in the case of an image existing";
    Tx.test("ShareAnything.SharePreview.testReplacePreviewWithImage", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Setup the test
        var addedImages = false;

        var component = createSharePreview();
        component._id = "sharePreview";
        component._imageId = "sharePVImgArea";
        component._addAllToFlipView = function () { addedImages = true; }

        var previewArea = document.createElement("div");
        previewArea.id = "sharePreview";

        var hiddenPreviewElement = document.createElement('div');
        hiddenPreviewElement.id = "hiddenSharePreview";

        var imgPreviewElement = document.createElement('div');
        imgPreviewElement.id = "sharePVImgArea";

        var textPreviewElement = document.createElement('div');
        textPreviewElement.id = "sharePVTextArea";

        hiddenPreviewElement.appendChild(imgPreviewElement);
        hiddenPreviewElement.appendChild(textPreviewElement);
        previewArea.appendChild(hiddenPreviewElement);

        unitTestElement.appendChild(previewArea);

        // Test the call when an image is present
        component._replacePreview(false);

        tc.areEqual(document.getElementById("sharePreview").className, "share-preview", "The preview with an image was not replaced properly.");
        tc.isTrue(addedImages, "Expected call to addAllToFlipView");
    });

    opt.description = "Verifies that the replace preview method functions properly in the case of no images returned from flipper";
    Tx.test("ShareAnything.SharePreview.testReplacePreviewNoImage", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var component = createSharePreview();
        component._id = "sharePreview";
        component._imageId = "sharePVImgArea";
        component._cleanupFlipView = function () { tc.error("Unexpected call to cleanupFlipView"); };

        var previewArea = document.createElement("div");
        previewArea.id = "sharePreview";

        var hiddenPreviewElement = document.createElement('div');
        hiddenPreviewElement.id = "hiddenSharePreview";

        var textPreviewElement = document.createElement('div');
        textPreviewElement.id = "sharePVTextArea";

        // Note that there's no image section now, there is no FlipView to dispose

        hiddenPreviewElement.appendChild(textPreviewElement);
        previewArea.appendChild(hiddenPreviewElement);

        unitTestElement.appendChild(previewArea);

        // Test the call when image HTML is not present
        component._replacePreview(true);

        tc.areEqual(document.getElementById("sharePreview").className, "share-preview", "The preview with an image was not replaced properly.");
        tc.isNull(document.getElementById(component._imageId), "The img area exsists when it should not");
    });

    opt.description = "Verifies that the replace preview method functions properly in the case of no usable images returned from flipper";
    Tx.test("ShareAnything.SharePreview.testReplacePreviewNoUsableImages", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Setup the test
        var disposedFlipView = false;

        var component = createSharePreview();
        component._id = "sharePreview";
        component._imageId = "sharePVImgArea";
        component._cleanupFlipView = function () { disposedFlipView = true; };

        var previewArea = document.createElement("div");
        previewArea.id = "sharePreview";

        // This HTML has both an image and a text section
        var imgPreviewElement = document.createElement('div');
        imgPreviewElement.id = "sharePVImgArea";

        var hiddenPreviewElement = document.createElement('div');
        hiddenPreviewElement.id = "hiddenSharePreview";

        var textPreviewElement = document.createElement('div');
        textPreviewElement.id = "sharePVTextArea";

        hiddenPreviewElement.appendChild(imgPreviewElement);
        hiddenPreviewElement.appendChild(textPreviewElement);
        previewArea.appendChild(hiddenPreviewElement);
        unitTestElement.appendChild(previewArea);

        // Test the call when image HTML is present
        component._replacePreview(true);

        tc.areEqual(document.getElementById("sharePreview").className, "share-preview", "The preview with an image was not replaced properly.");
        tc.isTrue(disposedFlipView, "Expected a call to cleanupFlipView");
        tc.isNull(document.getElementById(component._imageId), "The img area was not removed as expected");
    });
})();