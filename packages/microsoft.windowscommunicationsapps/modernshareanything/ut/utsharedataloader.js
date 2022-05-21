
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {
    var _help = ShareUnitTestHelpers;

    // Place to store original global state that is changed by the tests
    var originalJxLog;
    var originalShareLinkData;

    // TestData class for validating data load
    Share.TestData = function () {
        // Call base class constructor
        Share.BaseData.apply(this, arguments);
    };
    Jx.augment(Share.TestData, Share.BaseData);
    Share.TestData.prototype.tryInitializeWithText = function (text) {
        this.text = text;
        this.incomingShareType = Windows.ApplicationModel.DataTransfer.StandardDataFormats.text;
        return true;
    };
    Share.TestData.prototype.tryInitializeWithLink = function (linkData) {
        this.linkData = linkData;
        this.incomingShareType = Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink;
        return true;
    }

    Share.TestData.prototype.tryInitializeWithFiles = function () {
        this.incomingShareType = Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems;
        return true;
    }
    Share.TestData.prototype.tryInitializeWithHtml = function (html) {
        this.html = html;
        this.incomingShareType = Windows.ApplicationModel.DataTransfer.StandardDataFormats.html;
        return true;
    };
    

    function setup(tc) {
        ///<summary>
        /// Save global state that will be changed by the tests
        ///</summary>

        originalJxLog = Jx.log;
        originalShareLinkData = Share.LinkData;

        Jx.log = {
            error : function () { },
            exception : function () { },
            info : function () { },
            verbose : function () { }
        };
    };
    
    function cleanup(tc) {
        ///<summary>
        /// Replace global state
        ///</summary>
        
        Jx.log = originalJxLog;
        Share.LinkData = originalShareLinkData;
    };
    
    var opt = {
        owner: "nthorn",
        priority: "0",
        timeoutMs: 1000
    };
    
    opt.description = "A test for the constructor";
    Tx.test("ShareAnything.ShareDataLoader.testConstructor", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var formatOrder = [
                "UniformResourceLocatorW",
                "Text",
                "HTML Format",
        ];

        var data = new Share.DataLoader(formatOrder);
        
        tc.areEqual(formatOrder, data._formatOrder, "Format order not set in constructor");
    });
    
    opt.description = "A test where loadDataAsync is expected to extract text from the data package";
    Tx.asyncTest("ShareAnything.ShareDataLoader.testLoadText", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();
        var textData = "unit test for Share.Data & stuff";
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.setText(textData);

        var format = _help.getStandardFormatOrder();

        var data = new Share.TestData(_help.getShareOperation(dataPackage));

        data.loadDataAsync(format).
            then(
                function complete() {
                    tc.areEqual(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text, data.incomingShareType, "Invalid test setup: type is not text");
                    tc.areEqual(textData, data.text, "Constructor is expected to pull text content out of the data package, and content did not match.");
                    tc.start();
                },
                function error(ex) {
                    tc.error("An error occurred loading data: " + ex);
                    tc.start();
                }
            );
    });
    
    opt.description = "A test where loadDataAsync is expected to extract html from the data package";
    Tx.asyncTest("ShareAnything.ShareDataLoader.testLoadHtml", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();
        
        var htmlData = "unit test for Share.Data<br>";
        var htmlFormat = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(htmlData);
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.setHtmlFormat(htmlFormat);

        var data = new Share.TestData(_help.getShareOperation(dataPackage));
        
        data.loadDataAsync(_help.getStandardFormatOrder()).
            then(
                function complete() {
                    tc.areEqual(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html, data.incomingShareType, "Invalid test setup: type is not html");
                    tc.areEqual(htmlFormat, data.html, "Constructor is expected to pull html content out of the data package, and content did not match.");

                    tc.start();
                },
                function error(ex) {
                    tc.error("An error occurred loading data: " + ex);
                    tc.start();
                }
            );
    });

    opt.description = "A test where _initialize is expected to extract files";
    Tx.asyncTest("ShareAnything.ShareDataLoader.testLoadFiles", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();

        _help.addFileToPackageAsync(dataPackage).
            then(
                function dataPackageComplete() {
                    var data = new Share.TestData(_help.getShareOperation(dataPackage));

                    data.loadDataAsync(_help.getStandardFormatOrder()).
                        then(
                            function loadComplete() {
                                tc.areEqual(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems, data.incomingShareType, "Type was not files as expected");

                                tc.start();
                            },
                            function loadError(loadEx) {
                                tc.error("An error occurred while loading the files into the data: " + error);
                                tc.start();
                            }
                        );
                }, 
                function e(error) {
                    tc.error("An error occurred while executing the file retrieval process: " + error);
                    tc.start();
                }
            );
    });
    
    opt.description = "A test where create is supposed to add Share.LinkData to the data object";
    Tx.asyncTest("ShareAnything.ShareDataLoader.testLoadLink", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.setUri(new Windows.Foundation.Uri("http://www.live.com"));
        dataPackage.properties.title = "This title is not referenced in this test";
        dataPackage.properties.description = "This description is not referenced in this test";

        var data = new Share.TestData(_help.getShareOperation(dataPackage));

        data.loadDataAsync(_help.getStandardFormatOrder()).
            then(
                function complete() {
                    tc.areEqual(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink, data.incomingShareType, "Type was not WebLink as expected");
                    // Simply verify that there is link data - there are more detailed tests for this elsewhere.
                    tc.isNotNull(data.linkData, "No linkData on data object");

                    tc.start();
                },
                function error(ex) {
                    tc.error("An error occurred while executing link load: " + ex);
                    tc.start();
                }
            );
    });

    opt.description = "A test where there is a data package, but there are no items in it.";
    Tx.asyncTest("ShareAnything.ShareDataLoader.testLoadWithNoItemsInPackage", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();

        var data = new Share.TestData(_help.getShareOperation(dataPackage));
        data.loadDataAsync(_help.getStandardFormatOrder()).
            then(
                function complete() {
                   
                    // Check error properties
                    tc.areEqual(Share.Constants.DataError.invalidFormat, data.errorCategory, "Unexpected value for error when no format is found");

                    tc.start();
                },
                function error(ex) {
                    tc.error("An error occurred while executing load: " + ex);
                    tc.start();
                }
            );
    });

    opt.description = "A test where there is a data package, but only items we don't support.";
    Tx.asyncTest("ShareAnything.ShareDataLoader.testLoadOnlyUnrecognizedTypes", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        _help.setDataOfType(dataPackage, "application/pdf");
        _help.setDataOfType(dataPackage, "application/octet-stream");
        _help.setDataOfType(dataPackage, "application/ogg");

        var data = new Share.TestData(_help.getShareOperation(dataPackage));

        data.loadDataAsync(_help.getStandardFormatOrder()).
            then(
                function complete() {
                    
                    // Verify properties on data after load
                    tc.areEqual(Share.Constants.DataError.invalidFormat, data.errorCategory, "Unexpected value for error when no format is found");

                    tc.start();
                },
                function error(ex) {
                    tc.error("An error occurred while executing load: " + ex);
                    tc.start();
                }
            );
    });

    opt.description = "Verifies that if a type is rejected by the data object, the next type is loaded.";
    Tx.asyncTest("ShareAnything.ShareDataLoader.testLoadChoosesNextTypeIfRejected", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.setText("This is my text");
        dataPackage.setHtmlFormat(Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat("html"));

        var formatOrder = _help.getStandardFormatOrder();

        var data = new Share.TestData(_help.getShareOperation(dataPackage));
        data.tryInitializeWithHtml = function () {
            return false;
        }

        data.loadDataAsync(formatOrder).
            then(
                function complete() {
                    tc.areEqual(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text, data.incomingShareType, "Expected data to be filled with text info");
                    tc.start();
                },
                function error(ex) {
                    tc.error("An error occurred while executing load: " + ex);
                    tc.start();
                }
            );
    });

    opt.description = "A test to make sure URI is chosen first if it's the first item in the config";
    Tx.asyncTest("ShareAnything.ShareDataLoader.testOrderTypeIsFirst", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var inputText = "This is the text input that shouldn't be chosen";
        var uri = new Windows.Foundation.Uri("http://www.live.com/PickMe/");

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.setText(inputText);
        dataPackage.setUri(uri);

        var formatOrder = [
                "UniformResourceLocatorW",
                "Text",
                "HTML Format",
        ];

        var data = new Share.TestData(_help.getShareOperation(dataPackage));

        data.loadDataAsync(formatOrder).
            then(
                function complete() {
                    
                    tc.areEqual(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink, data.incomingShareType, "Expected to pick up webLink type based on order");
                    tc.areEqual(uri.absoluteUri, data.linkData.url, "Unexpected content pulled in for uri");

                    tc.start();
                },
                function error(ex) {
                    tc.error("An error occurred while executing load: " + ex);
                    tc.start();
                }
            );
    });

    opt.description = "A test to make sure that html is chosen when the config has another item above it, but that item is not in the package.";
    Tx.asyncTest("ShareAnything.ShareDataLoader.testOrderNotFirstConfigItem", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var inputHtml = "<p>This is html in a paragraph!!</p>";
        var htmlFormat = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(inputHtml);
        var inputText = "This is the text input that shouldn't be chosen";
        var uri = new Windows.Foundation.Uri("http://www.live.com");

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.setUri(uri);
        dataPackage.setText(inputText);
        dataPackage.setHtmlFormat(htmlFormat);

        var formatOrder = [
                "Shell IDList Array",
                "HTML Format",
                "Text",
                "UniformResourceLocatorW"
        ];

        var data = new Share.TestData(_help.getShareOperation(dataPackage));

        data.loadDataAsync(formatOrder).
            then(
                function complete() {
                    
                    tc.areEqual(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html, data.incomingShareType, "Expected to pick up html type based on order");
                    tc.areEqual(htmlFormat, data.html, "Unexpected content pulled in for messageHtml");

                    tc.start();
                },
                function error(ex) {
                    tc.error("An error occurred while executing load: " + ex);
                    tc.start();
                }
            );
    });


    opt.description = "A test where there is a data package with several items, but the first is of unrecognized type.";
    Tx.asyncTest("ShareAnything.ShareDataLoader.testOrderUnrecognizedTypeFirst", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();
        var uri = new Windows.Foundation.Uri("http://www.live.com/PickMe/");

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();

        _help.setDataOfType(dataPackage, "application/pdf");
        dataPackage.setUri(uri);

        var data = new Share.TestData(_help.getShareOperation(dataPackage));

        data.loadDataAsync(_help.getStandardFormatOrder()).
            then(
                function complete() {
                    
                    tc.areEqual(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink, data.incomingShareType, "Type was not WebLink as expected");

                    tc.start();
                },
                function error(ex) {
                    tc.error("An error occurred while executing load: " + ex);
                    tc.start();
                }
            );
    });

    opt.description = "A test where there are some weird types in the config list";
    Tx.asyncTest("ShareAnything.ShareDataLoader.testOrderUnrecognizedTypeInConfig", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var uri = new Windows.Foundation.Uri("http://www.live.com/PickMe/");

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();

        _help.setDataOfType(dataPackage, "application/pdf");
        dataPackage.setUri(uri);

        var formatOrder = [
                "This Does Not Exist",
                "This also Does not exist",
                "Weird",
                "UniformResourceLocatorW"
        ];

        var data = new Share.TestData(_help.getShareOperation(dataPackage));

        data.loadDataAsync(formatOrder).
            then(
                function complete() {
                    
                    tc.areEqual(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink, data.incomingShareType, "Type was not WebLink as expected");

                    tc.start();
                },
                function error(ex) {
                    tc.error("An error occurred while executing load: " + ex);
                    tc.start();
                }
            );
    });

    opt.description = "A test that verifies that when we remove standard data types from the config, they are not chosen.";
    Tx.asyncTest("ShareAnything.ShareDataLoader.testOrderCanRemoveDataTypes", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var inputHtml = "<p>This is html in a paragraph!!</p>";
        var inputText = "This is the text input that shouldn't be chosen";
        var uri = new Windows.Foundation.Uri("http://www.live.com");

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.setUri(uri);
        dataPackage.setText(inputText);
        dataPackage.setHtmlFormat(Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(inputHtml));

        var formatOrder = [
                "Text",
        ];

        var data = new Share.TestData(_help.getShareOperation(dataPackage));

        data.loadDataAsync(formatOrder).
            then(
                function complete() {
                    
                    tc.areEqual(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text, data.incomingShareType, "Expected to pick up text type based on config");

                    tc.start();
                },
                function error(ex) {
                    tc.error("An error occurred while executing load: " + ex);
                    tc.start();
                }
            );
    });
    
    opt.description = "A test that verifies that when there is an exception in the getText callback, it calls into the error callback";
    Tx.asyncTest("ShareAnything.ShareDataLoader.testGetTextCallbackException", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.setText("this is my text");

        var errorMessage = "This is the artificially created error for unit test purposes"

        var data = new Share.TestData(_help.getShareOperation(dataPackage));
        data.tryInitializeWithText = function () {
            throw new Error(errorMessage);
        };

        data.loadDataAsync(_help.getStandardFormatOrder()).
            then(
                function complete() {
                    tc.error("Invalid test setup: data load should fail");
                    tc.start();
                },
                function error(ex) {
                    // Verify that the error is the same one that we wanted to throw
                    tc.areEqual(errorMessage, ex.description, "Unexpected error in error callback");
                    tc.start();
                }
            );
    });

    opt.description = "A test that verifies that when there is an exception in the getHtml callback, it calls into the error callback";
    Tx.asyncTest("ShareAnything.ShareDataLoader.testGetHtmlCallbackException", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.setHtmlFormat("this is my html");

        var errorMessage = "This is the artificially created error for unit test purposes"

        var data = new Share.TestData(_help.getShareOperation(dataPackage));
        data.tryInitializeWithHtml = function () {
            throw new Error(errorMessage);
        };

        data.loadDataAsync(_help.getStandardFormatOrder()).
            then(
                function complete() {
                    tc.error("Invalid test setup: data load should fail");
                    tc.start();
                },
                function error(ex) {
                    // Verify that the error is the same one that we wanted to throw
                    tc.areEqual(errorMessage, ex.description, "Unexpected error in error callback");
                    tc.start();
                }
            );
    });

    opt.description = "A test that verifies that when there is an exception in the getStorageItems callback, it calls into the error callback";
    Tx.asyncTest("ShareAnything.ShareDataLoader.testGetStorageItemsCallbackException", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();

        var errorMessage = "This is the artificially created error for unit test purposes"

        _help.addFileToPackageAsync(dataPackage).
            then(
                function fileAddComplete() {
                    var data = new Share.TestData(_help.getShareOperation(dataPackage));
                    data.tryInitializeWithFiles = function () {
                        throw new Error(errorMessage);
                    };

                    data.loadDataAsync(_help.getStandardFormatOrder()).
                        then(
                            function complete() {
                                tc.error("Invalid test setup: data load should fail");
                                tc.start();
                            },
                            function error(ex) {
                                // Verify that the error is the same one that we wanted to throw
                                tc.areEqual(errorMessage, ex.description, "Unexpected error in error callback");
                                tc.start();
                            }
                        );

                },
                function fileAddError(fileError) {
                    tc.error("Error occurred adding file to package: " + fileError);
                    tc.start();
                }
            );


    });

    opt.description = "A test that verifies that when there is an exception in the getUri callback, it calls into the error callback";
    Tx.asyncTest("ShareAnything.ShareDataLoader.testGetUriCallbackException", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.setUri(new Windows.Foundation.Uri("http://www.live.com/GetUriTest"));

        var errorMessage = "This is the artificially created error for unit test purposes"

        var data = new Share.TestData(_help.getShareOperation(dataPackage));
        data.tryInitializeWithLink = function () {
            throw new Error(errorMessage);
        };

        data.loadDataAsync(_help.getStandardFormatOrder()).
            then(
                function complete() {
                    tc.error("Invalid test setup: data load should fail");
                    tc.start();
                },
                function error(ex) {
                    // Verify that the error is the same one that we wanted to throw
                    tc.areEqual(errorMessage, ex.description, "Unexpected error in error callback");
                    tc.start();
                }
            );
    });

    opt.description = "A test that verifies that when there is an exception in the getXXX failure callback, it calls into the overall error callback";
    Tx.asyncTest("ShareAnything.ShareDataLoader.testFailureCallbackException", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var errorMessage = "This is the artificially created error for unit test purposes"

        // Make sure that the order is URI and then text
        var formatOrder = ["UniformResourceLocatorW", "Text"];

        var mockDataPackage = {
            properties: {
                hasKey: function() { return false; },
                title: "mock package title",
                description: "mock package description"
            },
            contains: function(formatType) {
                return true;
            },
            getWebLinkAsync: function () {
                // Mock promise to call into the error callback - this allows us to get the code to execute in the error callback
                return new WinJS.Promise(function promiseThen(success, error) {
                    setTimeout(error, 0);
                });
            },
            // The second call throws an exception, should occur within the error callback function
            // (in DP4, should still throw)
            getTextAsync: function () {
                throw new Error(errorMessage);
            },
            getView: function () { return this; }
        };

        var data = new Share.TestData(_help.getShareOperation(mockDataPackage));

        data.loadDataAsync(formatOrder).
            then(
                function complete() {
                    tc.error("Invalid test setup: data load should fail");
                    tc.start();
                },
                function error(ex) {
                    // Verify that the error is the same one that we wanted to throw
                    tc.areEqual(errorMessage, ex.description, "Unexpected error in error callback");
                    tc.start();
                }
            );
    });

    opt.description = "A test that verifies that when there is an exception in the initial call to loadDataInOrder, the overall error callback is called.";
    Tx.asyncTest("ShareAnything.ShareDataLoader.testImmediateException", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var errorMessage = "This is the artificially created error for unit test purposes"

        var mockDataPackage = {
            properties: {
                hasKey: function() { return false; },
                title: "mock package title",
                description: "mock package description"
            },
            contains: function(formatType) {
                return formatType === Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink;
            },
            getWebLinkAsync: function() {
                throw new Error(errorMessage);
            },
            getView: function () { return this; }
        };

        var data = new Share.TestData(_help.getShareOperation(mockDataPackage));

        data.loadDataAsync(_help.getStandardFormatOrder()).
            then(
                function complete() {
                    tc.error("Invalid test setup: data load should fail");
                    tc.start();
                },
                function error(ex) {
                    // Verify that the error is the same one that we wanted to throw
                    tc.areEqual(errorMessage, ex.description, "Unexpected error in error callback");
                    tc.start();
                }
            );
    });

    opt.description = "Verifies the behavior of the _getFailureCallback method";
    Tx.test("ShareAnything.ShareDataLoader.testGetFailureCallback", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var nextIndex = 45;
        var loadDataCalled = false;

        var dataLoader = new Share.DataLoader(_help.getStandardFormatOrder());
        dataLoader._loadDataInOrder = function (index) {
            tc.areEqual(nextIndex, index, "Unexpected index used for _loadDataInOrder");
            loadDataCalled = true;
        };
        dataLoader._currentLoadPromise = {};

        var failureCallback = dataLoader._getFailureCallback("formatString", nextIndex);

        var mockError = {
            message: "Unit test mock error"
        }

        failureCallback(mockError);

        tc.isTrue(loadDataCalled, "Failure callback should call back into _loadDataInOrder");
        tc.isNull(dataLoader._currentLoadPromise, "Callback should have set _currentLoadPromise to null");
    });

    opt.description = "Verifies the behavior of the _getStorageItemsCallback when the storageItems are good";
    Tx.test("ShareAnything.ShareDataLoader.testGetStorageItemsCallbackGood", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var nextIndex = 52;
        var loadDataCalled = false;
        var completedCalled = false;

        var mockFiles = {
            id: "mock files object"
        };

        var dataLoader = new Share.DataLoader(_help.getStandardFormatOrder());
        dataLoader._loadDataInOrder = function (index) {
            tc.areEqual(nextIndex, index, "Unexpected index used for _loadDataInOrder");
            loadDataCalled = true;
        };
        dataLoader._shareData = {
            tryInitializeWithFiles: function(filesArgument) {
                tc.areEqual(mockFiles, filesArgument, "Unexpected value passed in for files");
                return true;
            }
        };
        dataLoader.callCompleted = function () {
            completedCalled = true;
        };
        dataLoader._currentLoadPromise = {};

        var storageItemsCallback = dataLoader._getStorageItemsCallback(nextIndex);

        storageItemsCallback(mockFiles);

        tc.isFalse(loadDataCalled, "Should not call loadData again on success");
        tc.isTrue(completedCalled, "Expected complete call");
        tc.isNull(dataLoader._currentLoadPromise, "Callback should have set _currentLoadPromise to null");
    });

    opt.description = "Verifies the behavior of the _getStorageItemsCallback when the storageItems are no good";
    Tx.test("ShareAnything.ShareDataLoader.testGetStorageItemsCallbackBad", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var nextIndex = 17;
        var loadDataCalled = false;
        var completedCalled = false;

        var mockFiles = {
            id: "mock files object"
        };

        var dataLoader = new Share.DataLoader(_help.getStandardFormatOrder());
        dataLoader._loadDataInOrder = function (index) {
            tc.areEqual(nextIndex, index, "Unexpected index used for _loadDataInOrder");
            loadDataCalled = true;
        };
        dataLoader._shareData = {
            tryInitializeWithFiles: function(filesArgument) {
                tc.areEqual(mockFiles, filesArgument, "Unexpected value passed in for files");
                return false;
            }
        };
        dataLoader.callCompleted = function () {
            completedCalled = true;
        };
        dataLoader._currentLoadPromise = {};

        var storageItemsCallback = dataLoader._getStorageItemsCallback(nextIndex);

        storageItemsCallback(mockFiles);

        tc.isTrue(loadDataCalled, "Should have called loadData again after bad files");
        tc.isFalse(completedCalled, "Did not expect complete call after bad files");
        tc.isNull(dataLoader._currentLoadPromise, "Callback should have set _currentLoadPromise to null");
    });
    
    opt.description = "Verifies the behavior of the _getUriCallback when the uri is good";
    Tx.test("ShareAnything.ShareDataLoader.testGetUriCallbackGood", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var nextIndex = 24;
        var loadDataCalled = false;
        var completedCalled = false;

        var mockUri = {
            id: "mock URI object"
        };

        var dataLoader = new Share.DataLoader(_help.getStandardFormatOrder());
        dataLoader._loadDataInOrder = function (index) {
            tc.areEqual(nextIndex, index, "Unexpected index used for _loadDataInOrder");
            loadDataCalled = true;
        };
        dataLoader._shareData = {
            tryInitializeWithLink: function () {
                return true;
            }
        };
        dataLoader.callCompleted = function () {
            completedCalled = true;
        };
        dataLoader._currentLoadPromise = {};

        // Mock out Share.LinkData so we can control the validation
        Share.LinkData = function () {
            this.tryInitialize = function (uri) {
                tc.areEqual(mockUri, uri, "Unexpected value passed in for URI");
                return true;
            };
        };

        var callback = dataLoader._getUriCallback(nextIndex);

        callback(mockUri);

        tc.isFalse(loadDataCalled, "Should not call loadData again on success");
        tc.isTrue(completedCalled, "Expected complete call");
        tc.isNull(dataLoader._currentLoadPromise, "Callback should have set _currentLoadPromise to null");
    });

    opt.description = "Verifies the behavior of the _getUriCallback when the uri is good";
    Tx.test("ShareAnything.ShareDataLoader.testGetUriCallbackBad", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var nextIndex = 19;
        var loadDataCalled = false;
        var completedCalled = false;

        var mockUri = {
            id: "mock URI object"
        };

        var dataLoader = new Share.DataLoader(_help.getStandardFormatOrder());
        dataLoader._loadDataInOrder = function (index) {
            tc.areEqual(nextIndex, index, "Unexpected index used for _loadDataInOrder");
            loadDataCalled = true;
        };
        dataLoader._shareData = {
            tryInitializeWithLink: function () {
                return true;
            }
        };
        dataLoader.callCompleted = function () {
            completedCalled = true;
        };
        dataLoader._currentLoadPromise = {};

        // Mock out Share.LinkData so we can control the validation
        Share.LinkData = function () {
            this.tryInitialize = function (uri) {
                tc.areEqual(mockUri, uri, "Unexpected value passed in for URI");
                return false;
            };
        };

        var callback = dataLoader._getUriCallback(nextIndex);

        callback(mockUri);

        tc.isTrue(loadDataCalled, "Expected call to loadData for bad data");
        tc.isFalse(completedCalled, "Unexpected complete call after bad data");
        tc.isNull(dataLoader._currentLoadPromise, "Callback should have set _currentLoadPromise to null");
    });

    opt.description = "Verifies the behavior of the _getUriCallback when the uri is good";
    Tx.test("ShareAnything.ShareDataLoader.testGetUriCallbackBad2", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var nextIndex = 19;
        var loadDataCalled = false;
        var completedCalled = false;

        var mockUri = {
            id: "mock URI object"
        };

        var dataLoader = new Share.DataLoader(_help.getStandardFormatOrder());
        dataLoader._loadDataInOrder = function (index) {
            tc.areEqual(nextIndex, index, "Unexpected index used for _loadDataInOrder");
            loadDataCalled = true;
        };
        dataLoader._shareData = {
            tryInitializeWithLink: function () {
                // For this test, the sharedata object rejects the URI
                return false;
            }
        };
        dataLoader.callCompleted = function () {
            completedCalled = true;
        };
        dataLoader._currentLoadPromise = {};

        // Mock out Share.LinkData so we can control the validation
        Share.LinkData = function () {
            this.tryInitialize = function (uri) {
                tc.areEqual(mockUri, uri, "Unexpected value passed in for URI");
                return true;
            };
        };

        var callback = dataLoader._getUriCallback(nextIndex);

        callback(mockUri);

        tc.isTrue(loadDataCalled, "Expected call to loadData for bad data");
        tc.isFalse(completedCalled, "Unexpected complete call after bad data");
        tc.isNull(dataLoader._currentLoadPromise, "Callback should have set _currentLoadPromise to null");
    });

    opt.description = "Verifies the behavior of the _getHtmlCallback when the html is good";
    Tx.test("ShareAnything.ShareDataLoader.testGetHtmlCallbackGood", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var nextIndex = 37;
        var loadDataCalled = false;
        var completedCalled = false;

        var html = "<br />";

        var dataLoader = new Share.DataLoader(_help.getStandardFormatOrder());
        dataLoader._loadDataInOrder = function (index) {
            tc.areEqual(nextIndex, index, "Unexpected index used for _loadDataInOrder");
            loadDataCalled = true;
        };
        dataLoader._shareData = {
            tryInitializeWithHtml: function(htmlArgument) {
                tc.areEqual(html, htmlArgument, "Unexpected value passed in for html");
                return true;
            }
        };
        dataLoader.callCompleted = function () {
            completedCalled = true;
        };
        dataLoader._currentLoadPromise = {};

        var callback = dataLoader._getHtmlCallback(nextIndex);

        callback(html);

        tc.isFalse(loadDataCalled, "Should not call loadData again on success");
        tc.isTrue(completedCalled, "Expected complete call");
        tc.isNull(dataLoader._currentLoadPromise, "Callback should have set _currentLoadPromise to null");
    });

    opt.description = "Verifies the behavior of the _getHtmlCallback when the html is no good";
    Tx.test("ShareAnything.ShareDataLoader.testGetHtmlCallbackBad", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var nextIndex = 90;
        var loadDataCalled = false;
        var completedCalled = false;

        var html = "bad";

        var dataLoader = new Share.DataLoader(_help.getStandardFormatOrder());
        dataLoader._loadDataInOrder = function (index) {
            tc.areEqual(nextIndex, index, "Unexpected index used for _loadDataInOrder");
            loadDataCalled = true;
        };
        dataLoader._shareData = {
            tryInitializeWithHtml: function(htmlArgument) {
                tc.areEqual(html, htmlArgument, "Unexpected value passed in for html");
                return false;
            }
        };
        dataLoader.callCompleted = function () {
            completedCalled = true;
        };
        dataLoader._currentLoadPromise = {};

        var callback = dataLoader._getHtmlCallback(nextIndex);

        callback(html);

        tc.isTrue(loadDataCalled, "Should have called loadData again after bad data");
        tc.isFalse(completedCalled, "Did not expect complete call after bad data");
        tc.isNull(dataLoader._currentLoadPromise, "Callback should have set _currentLoadPromise to null");
    });

    opt.description = "Verifies the behavior of the _getTextCallback when the text is good";
    Tx.test("ShareAnything.ShareDataLoader.testGetTextCallbackGood", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var nextIndex = 37;
        var loadDataCalled = false;
        var completedCalled = false;

        var text = "This is my text";

        var dataLoader = new Share.DataLoader(_help.getStandardFormatOrder());
        dataLoader._loadDataInOrder = function (index) {
            tc.areEqual(nextIndex, index, "Unexpected index used for _loadDataInOrder");
            loadDataCalled = true;
        };
        dataLoader._shareData = {
            tryInitializeWithText: function(textArgument) {
                tc.areEqual(text, textArgument, "Unexpected value passed in for text");
                return true;
            }
        };
        dataLoader.callCompleted = function () {
            completedCalled = true;
        };
        dataLoader._currentLoadPromise = {};

        var callback = dataLoader._getTextCallback(nextIndex);

        callback(text);

        tc.isFalse(loadDataCalled, "Should not call loadData again on success");
        tc.isTrue(completedCalled, "Expected complete call");
        tc.isNull(dataLoader._currentLoadPromise, "Callback should have set _currentLoadPromise to null");
    });

    opt.description = "Verifies the behavior of the _getTextCallback when the text is no good";
    Tx.test("ShareAnything.ShareDataLoader.testGetTextCallbackBad", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var nextIndex = 95;
        var loadDataCalled = false;
        var completedCalled = false;

        var text = "bad text";

        var dataLoader = new Share.DataLoader(_help.getStandardFormatOrder());
        dataLoader._loadDataInOrder = function (index) {
            tc.areEqual(nextIndex, index, "Unexpected index used for _loadDataInOrder");
            loadDataCalled = true;
        };
        dataLoader._shareData = {
            tryInitializeWithText: function(textArgument) {
                tc.areEqual(text, textArgument, "Unexpected value passed in for html");
                return false;
            }
        };
        dataLoader.callCompleted = function () {
            completedCalled = true;
        };
        dataLoader._currentLoadPromise = {};

        var callback = dataLoader._getTextCallback(nextIndex);

        callback(text);

        tc.isTrue(loadDataCalled, "Should have called loadData again after bad data");
        tc.isFalse(completedCalled, "Did not expect complete call after bad data");
        tc.isNull(dataLoader._currentLoadPromise, "Callback should have set _currentLoadPromise to null");
    });
})();
