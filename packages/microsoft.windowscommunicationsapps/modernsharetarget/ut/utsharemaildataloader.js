
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {
    var _help = ShareUnitTestHelpers;

    // Place to store original global state that is changed by the tests
    var originalJxLog;

    // TestData class for validating data load
    Share.TestData = function () {
        // Call base class constructor
        Share.MailData.apply(this, arguments);
    };
    Jx.augment(Share.TestData, Share.MailData);
    Share.TestData.prototype.tryInitializeWithText = function (text) {
        this.text = text;
        this.containedDataFormats.push(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text);
        return true;
    };
    Share.TestData.prototype.tryInitializeWithUri = function (uri) {
        this.uri = uri;
        this.containedDataFormats.push(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink);
        return true;
    }

    Share.TestData.prototype.tryInitializeWithFiles = function () {
        this.containedDataFormats.push(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems);
        return true;
    }
    Share.TestData.prototype.tryInitializeWithHtml = function (html) {
        this.html = html;
        this.containedDataFormats.push(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html);
        return true;
    };
    Share.TestData.prototype.tryInitializeWithBitmap = function (bitmap) {
        this.bitmap = bitmap;
        this.containedDataFormats.push(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap);
        return true;
    };
    

    function setup(tc) {
        ///<summary>
        /// Save global state that will be changed by the tests
        ///</summary>

        originalJxLog = Jx.log;

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
    };
    
    var opt = {
        owner: "nthorn",
        priority: "0",
        timeoutMs: 1000
    };
    
    opt.description = "A test for the constructor";
    Tx.test("ShareTarget.ShareMailDataLoader.testConstructor", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var formatOrder = [
                "UniformResourceLocatorW",
                "Text",
                "HTML Format",
        ];

        var data = new Share.MailDataLoader(formatOrder);
        
        tc.areEqual(formatOrder, data._formatOrder, "Format order not set in constructor");
    });
    
    opt.description = "A test where loadDataAsync is expected to extract text from the data package";
    Tx.asyncTest("ShareTarget.ShareMailDataLoader.testLoadText", opt, function (tc) {
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
                    tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Invalid test setup: type is not text");
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
    Tx.asyncTest("ShareTarget.ShareMailDataLoader.testLoadHtml", opt, function (tc) {
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
                    tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Invalid test setup: type is not html");
                    tc.areEqual(htmlFormat, data.html, "Constructor is expected to pull html content out of the data package, and content did not match.");

                    tc.start();
                },
                function error(ex) {
                    tc.error("An error occurred loading data: " + ex);
                    tc.start();
                }
            );
    });

    opt.description = "A test where loadDataAsync is expected to extract files";
    Tx.asyncTest("ShareTarget.ShareMailDataLoader.testLoadFiles", opt, function (tc) {
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
                                tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Type was not files as expected");

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

    opt.description = "A test where create is supposed to add a bitmap to the data object";
    Tx.asyncTest("ShareTarget.ShareMailDataLoader.testLoadBitmap", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.properties.title = "This title is not referenced in this test";
        dataPackage.properties.description = "This description is not referenced in this test";

        _help.addBitmapToPackageAsync(dataPackage).done(function dataPackageComplete() {
            var data = new Share.TestData(_help.getShareOperation(dataPackage));

            data.loadDataAsync(_help.getStandardFormatOrder()).done(function complete() {
                tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Type was not bitmap as expected");
                tc.isNotNull(data.bitmap, "Expected bitmap to be set");

                tc.start();
            },
            function error(ex) {
                tc.error("An error occurred while executing bitmap load: " + ex);
                tc.start();
            });
        }, function error(ex) {
            tc.error("An error occurred while executing bitmap load: " + ex);
            tc.start();
        });
    });
    
    opt.description = "A test where create is supposed to add a web link to the data object";
    Tx.asyncTest("ShareTarget.ShareMailDataLoader.testLoadWebLink", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var uri = new Windows.Foundation.Uri("http://www.live.com");
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.setUri(uri);
        dataPackage.properties.title = "This title is not referenced in this test";
        dataPackage.properties.description = "This description is not referenced in this test";

        var data = new Share.TestData(_help.getShareOperation(dataPackage));

        data.loadDataAsync(_help.getStandardFormatOrder()).
            then(
                function complete() {
                    tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Type was not WebLink as expected");
                    tc.isNotNull(data.uri, "Expected URI to be set");

                    tc.start();
                },
                function error(ex) {
                    tc.error("An error occurred while executing link load: " + ex);
                    tc.start();
                }
            );
    });

    opt.description = "A test with both HTML and text data";
    Tx.asyncTest("ShareTarget.ShareMailDataLoader.testLoadHtmlAndText", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var htmlData = "unit test for Share.Data<br>";
        var htmlFormat = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(htmlData);
        var textData = "unit test for Share.Data & stuff";
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.setText(textData);
        dataPackage.setHtmlFormat(htmlFormat);

        var data = new Share.TestData(_help.getShareOperation(dataPackage));

        data.loadDataAsync(_help.getStandardFormatOrder()).
            then(
                function complete() {
                    tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Invalid test setup: type is not html");
                    tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Text should not have been set because HTML was valid");
                    tc.areEqual(htmlFormat, data.html, "Constructor is expected to pull html content out of the data package, and content did not match.");
                    tc.isTrue(Jx.isNullOrUndefined(data.text), "Text should not have been set because HTML was valid.");

                    tc.start();
                },
                function error(ex) {
                    tc.error("An error occurred while executing link load: " + ex);
                    tc.start();
                }
            );
    });

    opt.description = "A test with both WebLink and text data";
    Tx.asyncTest("ShareTarget.ShareMailDataLoader.testLoadWebLinkAndText", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var uri = new Windows.Foundation.Uri("http://www.live.com");
        var textData = "unit test for Share.Data & stuff";
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.setUri(uri);
        dataPackage.setText(textData);
        dataPackage.properties.title = "This title is not referenced in this test";
        dataPackage.properties.description = "This description is not referenced in this test";

        var data = new Share.TestData(_help.getShareOperation(dataPackage));

        data.loadDataAsync(_help.getStandardFormatOrder()).
            then(
                function complete() {
                    tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Type was not WebLink as expected");
                    tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Text should not have been set because HTML was valid");
                    tc.isTrue(Jx.isNullOrUndefined(data.text), "Text should not have been set because HTML was valid.");
                    tc.isNotNull(data.uri, "Expected URI to be set");

                    tc.start();
                },
                function error(ex) {
                    tc.error("An error occurred while executing link load: " + ex);
                    tc.start();
                }
            );
    });

    opt.description = "A test with all supported data types";
    Tx.asyncTest("ShareTarget.ShareMailDataLoader.testLoadAllSupportedData", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.stop();

        var htmlData = "unit test for Share.Data<br>";
        var htmlFormat = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(htmlData);
        var uri = new Windows.Foundation.Uri("http://www.live.com");
        var textData = "unit test for Share.Data & stuff";
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.setUri(uri);
        dataPackage.setText(textData);
        dataPackage.setHtmlFormat(htmlFormat);
        dataPackage.properties.title = "This title is not referenced in this test";
        dataPackage.properties.description = "This description is not referenced in this test";

        _help.addBitmapToPackageAsync(dataPackage).then(function () {
            return _help.addFileToPackageAsync(dataPackage);
        }).
            then(
                function dataPackageComplete() {
                    var data = new Share.TestData(_help.getShareOperation(dataPackage));

                    data.loadDataAsync(_help.getStandardFormatOrder()).
                        then(
                            function loadComplete() {
                                tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Type was not files as expected");
                                tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Type was not WebLink as expected");
                                tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Text should not have been set because HTML was valid");
                                tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Invalid test setup: type is not html");
                                tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Bitmap should not have been set because files were valid");
                                tc.areEqual(htmlFormat, data.html, "Constructor is expected to pull html content out of the data package, and content did not match.");
                                tc.isTrue(Jx.isNullOrUndefined(data.text), "Text should not have been set because HTML was valid.");
                                tc.isNotNull(data.uri, "Expected URI to be set");

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

    opt.description = "A test where there is a data package, but there are no items in it.";
    Tx.asyncTest("ShareTarget.ShareMailDataLoader.testLoadWithNoItemsInPackage", opt, function (tc) {
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
    Tx.asyncTest("ShareTarget.ShareMailDataLoader.testLoadOnlyUnrecognizedTypes", opt, function (tc) {
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
    
})();
