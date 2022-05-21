
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {
    var _help = ShareUnitTestHelpers;
  
    // Place to store original global state that is changed by the tests
    var originalJxLog;
    
    function setup (tc) {
        ///<summary>
        /// Save global state that will be changed by the tests
        ///</summary>

        originalJxLog = Jx.log;
        Jx.log = {
            error : function () { },
            info : function () { },
            verbose : function () { },
            exception : function () { }
        };
    };
    
    function cleanup (tc) {
        ///<summary>
        /// Replace global state
        ///</summary>
        
        Jx.log = originalJxLog;
    };
    
    var opt = {
        owner: "nthorn",
        priority: "0"
    };

    
    opt.description = "A test for tryInitialize when uri is not available. Verifies that state ends up being correct.";
    Tx.test("ShareAnything.ShareLinkData.testInitializeNoUri", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var linkData = new Share.LinkData();
        var defaultTextValue = "";

        linkData.tryInitialize();

        tc.areEqual(defaultTextValue, linkData.title, "Unexpected default value for title");
        tc.areEqual(defaultTextValue, linkData.description, "Unexpected default value for description");
        tc.areEqual(defaultTextValue, linkData.url, "Unexpected default value for url");
    });

    opt.description = "A test where the uri is not of appropriate type";
    Tx.test("ShareAnything.ShareLinkData.testInitializeBadUri", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var expectedText = ""; // Expected text when there's no data

        var linkData = new Share.LinkData();
        linkData.tryInitialize(true);

        tc.areEqual(expectedText, linkData.title, "Unexpected default value for title");
        tc.areEqual(expectedText, linkData.description, "Unexpected default value for description");
        tc.areEqual(expectedText, linkData.url, "Unexpected default value for url");
    });

    
    opt.description = "A test where the uri is null";
    Tx.test("ShareAnything.ShareLinkData.testConstructorNullUri", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var expectedText = ""; // Expected text when there's no data

        var linkData = new Share.LinkData();
        linkData.tryInitialize(null);

        tc.areEqual(expectedText, linkData.title, "Unexpected default value for title");
        tc.areEqual(expectedText, linkData.description, "Unexpected default value for description");
        tc.areEqual(expectedText, linkData.url, "Unexpected default value for url");
    });

   
    opt.description = "A test where the uri is non-null but doesn't contain the correct properties";
    Tx.test("ShareAnything.ShareLinkData.testConstructorEmptyUri", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var expectedText = ""; // Expected text when there's no data in activation context

        var linkData = new Share.LinkData();
        linkData.tryInitialize({});

        tc.areEqual(expectedText, linkData.title, "Unexpected default value for title");
        tc.areEqual(expectedText, linkData.description, "Unexpected default value for description");
        tc.areEqual(expectedText, linkData.url, "Unexpected default value for url");
    });

    opt.description = "A test for _initialize when valid link data is received. Verifies that the link data is set up appropriately.";
    Tx.test("ShareAnything.ShareLinkData.testInitializeLinkData", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var text = "This is the data package text";
        var testUri = new Windows.Foundation.Uri("http://www.live.com/?unitTest=Share.LinkData");
        var title = "This is the linkData unit test title";
        var description = "This is the link Data unit test description";

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.properties.title = title;
        dataPackage.properties.description = description;

        // Set up the link data object with valid link data
        var linkData = new Share.LinkData();
        linkData.tryInitialize(testUri, dataPackage.getView());

        // Verify that the url, title, and description were initialized correctly by LinkData
        tc.areEqual(title, linkData.title, "Title was not retrieved correctly from data package");
        tc.areEqual(description, linkData.description, "Description was not retrieved correctly from data package");
        tc.areEqual(testUri.absoluteUri, linkData.url, "Url was not retrieved correctly from data package");
    });

    opt.description = "A test for _initialize when valid link data is received. Verifies that the text is not pulled out of the data package.";
    Tx.test("ShareAnything.ShareLinkData.testInitializeNoText", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var text = "This is the data package text";
        var testUri = new Windows.Foundation.Uri("http://www.live.com/?unitTest=Share.LinkData");
        var title = "This is the linkData unit test title";
        var description = "This is the link Data unit test description";
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.setText(text);
        dataPackage.properties.title = title;
        dataPackage.properties.description = description;

        // Set up the link data object with valid link data
        var linkData = new Share.LinkData();
        linkData.tryInitialize(testUri, dataPackage.getView());

        // Verify message was initialized properly - it should be blank.
        tc.isFalse(Jx.isNonEmptyString(linkData.messageHtml), "Unexpected text prefilled in message for link scenario");
    });

    opt.description = "Tests _initialize in a valid case. Verifies that it gets the URI out of the data package correctly.";
    Tx.test("ShareAnything.ShareLinkData.testInitializeValidUri", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var testUri = new Windows.Foundation.Uri("http://www.live.com/?unitTest=absoluteUri");
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.properties.title = "This title is not referenced in this test";
        dataPackage.properties.description = "This description is not referenced in this test";

        // Set up the link data object with valid link data
        var linkData = new Share.LinkData();
        var result = linkData.tryInitialize(testUri, dataPackage.getView());

        tc.areEqual(testUri.absoluteUri, linkData.url);
        tc.isTrue(Jx.isNonEmptyString(linkData.url), "_initialize is expected to convert the URI to a string");
        tc.isTrue(result, "_initialize should have returned true (success) for this case.");
    });

    opt.description = "Tests _initialize in an invalid scheme case. Verifies that it returns the proper indication of failure.";
    Tx.test("ShareAnything.ShareLinkData.testGetPackageUriBadScheme", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var testUri = new Windows.Foundation.Uri("javascript:alert('hi')");
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.properties.title = "This title is not referenced in this test";
        dataPackage.properties.description = "This description is not referenced in this test";

        var linkData = new Share.LinkData();
        var result = linkData.tryInitialize(testUri, dataPackage.getView());

        tc.isFalse(result, "Share.LinkData initialize should fail with bad scheme URI");
    });

    opt.description = "Verifies that the title is truncated during construction";
    Tx.test("ShareAnything.ShareLinkData.testTitleLengthTruncation", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var lengthLimit = 512;
        var longTitle = _help.generateLongString(600);
        var children = [];
        var testUri = new Windows.Foundation.Uri("http://www.live.com/?lengthTest");

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.properties.title = longTitle;
        dataPackage.properties.description = "This description is not referenced in this test";

        tc.isTrue(longTitle.length > lengthLimit, "Invalid test setup: test string is not too long.");

        var linkData = new Share.LinkData();
        linkData.tryInitialize(testUri, dataPackage.getView());

        tc.areEqual(lengthLimit, linkData.title.length, "Expected the title to be truncated to the length limit");
    });

    opt.description = "Verifies that the description is truncated during construction";
    Tx.test("ShareAnything.ShareLinkData.testDescriptionLengthTruncation", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var lengthLimit = 512;
        var longDescription = _help.generateLongString(600);
        var children = [];
        var testUri = new Windows.Foundation.Uri("http://www.live.com/?lengthTest");

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.properties.title = "This title is not referenced in this test";
        dataPackage.properties.description = longDescription;

        tc.isTrue(longDescription.length > lengthLimit, "Invalid test setup: test string is not too long.");

        var linkData = new Share.LinkData();
        linkData.tryInitialize(testUri, dataPackage.getView());

        tc.areEqual(lengthLimit, linkData.description.length, "Expected the title to be truncated to the length limit");
    });

    opt.description = "Verifies that the title defaults to the URL if it's empty";
    Tx.test("ShareAnything.ShareLinkData.testDefaultTitle", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var uriString = "http://www.live.com/?defaultTitle";
        var testUri = new Windows.Foundation.Uri(uriString);
        var emptyTitle = "    "; 

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.properties.title = emptyTitle;
        dataPackage.properties.description = "The description is not referenced in this test";

        var linkData = new Share.LinkData();
        linkData.tryInitialize(testUri, dataPackage.getView());

        tc.areEqual(linkData.title, linkData.url, "Expected the title to be set to the URL value");
    });

    opt.description = "Verifies that the title is still truncated if it defaults to a URL that is too long.";
    Tx.test("ShareAnything.ShareLinkData.testDefaultTitleTooLong", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var lengthLimit = 512;
        var longUrlString = "http://www.live.com/longurl/?" + _help.generateLongString(600);
        var longUri = new Windows.Foundation.Uri(longUrlString);
        var emptyTitle = "";

        tc.isTrue(longUrlString.length > lengthLimit, "Invalid test setup: test string is not too long.");

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.properties.description = "The description is not referenced in this test";

        var linkData = new Share.LinkData();
        linkData.tryInitialize(longUri, dataPackage.getView());
        tc.areEqual(lengthLimit, linkData.title.length, "Data's title was not truncated when it defaulted to a long URL");
    });

    opt.description = "Verifies that the description and title are truncated during populateSoxeData";
    Tx.test("ShareAnything.ShareLinkData.testPopulateSoxeDataTruncation", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var lengthLimit = 512;
        var longDesc = _help.generateLongString(600);
        var longTitle = _help.generateLongString(600);

        tc.isTrue(longDesc.length > lengthLimit, "Invalid test setup: desc test string is not too long.");
        tc.isTrue(longTitle.length > lengthLimit, "Invalid test setup: title test string is not too long.");
        
        var data = new Share.LinkData();
                
        // Test Soxe Data
        var soxeData = {
            title : longTitle,
            description : longDesc
        };
        
        data.populateSoxeData(soxeData);
    
        tc.areEqual(lengthLimit, data.title.length, "Truncation length did not match expected value");
        tc.areEqual(lengthLimit, data.description.length, "Truncation length did not match expected value");
    });

    opt.description = "Verifies that the populateSoxeData method functions as expected.";
    Tx.test("ShareAnything.ShareLinkData.testPopulateSoxeData", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        // Test Soxe Data
        var soxeData = {
            title : "My Title",
            description : "My Description",
            images : ["thumbsUrl"],
            url : "url",
            videoUrl : "videoUrl",
            videoHeight : "high",
            videoWidth : "wide",
            mimeType: "application/x-shockwave-flash",
            flashParams: "fs=1",
            category: "article"
        };
        
        var linkData = new Share.LinkData();
        linkData.populateSoxeData(soxeData);

        tc.areEqual(soxeData.title, linkData.title, "Title did not match");
        tc.areEqual(soxeData.description, linkData.description, "Description did not match");
        tc.areEqual(soxeData.videoUrl, linkData.videoUrl, "videoUrl did not match");
        tc.areEqual(soxeData.videoHeight, linkData.videoHeight, "videoHeight did not match");
        tc.areEqual(soxeData.videoWidth, linkData.videoWidth, "videoWidth did not match");
        tc.areEqual(soxeData.mimeType, linkData.embedType, "mime type did not match");
        tc.areEqual(soxeData.flashParams, linkData.flashParams, "flashParams did not match");
        tc.isFalse(linkData.isDirectImage, "Should not have registered as direct image");
    });

    opt.description = "Verifies that a direct image from SOXE is correctly registered";
    Tx.test("ShareAnything.ShareLinkData.testPopulateSoxeDataDirectImage", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var soxeData = {
            title: "filename.png",
            description: "",
            images: ["thumbsUrl"],
            url: "thumbsUrl",
            category: "directimage"
        };

        var linkData = new Share.LinkData();
        linkData.populateSoxeData(soxeData);

        tc.isTrue(linkData.isDirectImage, "Should have registered as direct image");
    });

    opt.description = "Verifies that blank SOXE data doesn't override data package data";
    Tx.test("ShareAnything.ShareLinkData.testPopulateSoxeDataNoData", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var expectedTitle = "DataPackage title";
        var expectedDescription = "DataPackage description";

        var uriString = "http://www.live.com/?defaultTitle";
        var testUri = new Windows.Foundation.Uri(uriString);

        var soxeData = {
            title: "",
            description: "",
            images: null,
            url: "url"
        };

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.properties.title = expectedTitle;
        dataPackage.properties.description = expectedDescription;

        var linkData = new Share.LinkData();
        tc.isTrue(linkData.tryInitialize(testUri, dataPackage.getView()), "Invalid unit test setup: linkData did not initialize");

        linkData.populateSoxeData(soxeData);
        tc.areEqual(expectedTitle, linkData.title, "Title did not match");
        tc.areEqual(expectedDescription, linkData.description, "Description did not match");
    });
})();
