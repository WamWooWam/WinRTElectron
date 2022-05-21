
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {
    var _help = ShareUnitTestHelpers;

    // Place to store original global state that is changed by the tests
    var originalJxLog;
    var originalJxRes;
    var originalShareDataLoader;
    
    function setup (tc) {
        ///<summary>
        /// Save global state that will be changed by the tests
        ///</summary>

        originalJxLog = Jx.log;
        originalJxRes = Jx.res;
        originalShareDataLoader = Share.DataLoader;

        Jx.log = {
            error : function () { },
            exception : function () { },
            info : function () { },
            verbose : function () { }
        };
    };
    
    function cleanup (tc) {
        ///<summary>
        /// Replace global state
        ///</summary>
        
        Debug.enableAssertDialog = true;
        Jx.log = originalJxLog;
        Jx.res = originalJxRes;
        Share.DataLoader = originalShareDataLoader;
    };
	
	var opt = {
        owner: "nthorn",
        priority: "0"
    };

    opt.description = "Verifies that the shareOperation, etc are saved by the constructor";
    Tx.test("ShareAnything.ShareData.testConstructorValid", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var shareOperation = _help.getShareOperation(dataPackage);

        var data = new Share.BaseData(shareOperation);

        tc.areEqual(shareOperation, data.shareOperation, "share operation should have been saved in data object");
        tc.areEqual(Share.Constants.DataError.none, data.errorCategory, "Default value for errorCategory should be none");
    });

    opt.description = "A test where the share operation is not passed in to the constructor";
    Tx.test("ShareAnything.ShareData.testConstructorNoShareOperation", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        ShareUnitTestHelpers.verifyAssert(tc, function () {
		    new Share.BaseData();
	    }, "Cannot construct a Share.Data object without the share operation" );
    });

    opt.description = "A test where the share operation is not of appropriate type";
    Tx.test("ShareAnything.ShareData.testConstructorBadShareOperation", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var shareOperation = true;

        ShareUnitTestHelpers.verifyAssert(tc, function () {
	        new Share.BaseData(shareOperation);
	    }, "Cannot construct a Share.Data object without the share operation" );
    });

    opt.description = "A test where the share operation is null";
    Tx.test("ShareAnything.ShareData.testConstructorNullShareOperation", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var expectedText = ""; // Expected text when there's no data
        var shareOperation = null;

        ShareUnitTestHelpers.verifyAssert(tc, function () {
            var data = new Share.BaseData(shareOperation);
        }, "Cannot construct a Share.Data object without the share operation" );
    });

    opt.description = "A test where the shareOperation is non-null but doesn't contain the correct properties";
    Tx.test("ShareAnything.ShareData.testConstructorEmptyShareOperation", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var shareOperation = {};

        ShareUnitTestHelpers.verifyAssert(tc, function () {
            new Share.BaseData(shareOperation);
        }, "Cannot construct a Share.Data object without the share operation" );
    });

    opt.description = "A test for loadDataAsync; verifies that the correct parameters are passed to the DataLoader";
    Tx.test("ShareAnything.ShareData.testLoadDataAsync", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var shareOperation = _help.getShareOperation(dataPackage)
        var data = new Share.BaseData(shareOperation);

        var loadCalled = false;

        var mockDataLoader = {
            loadDataAsync: function (loadDataPackage, shareData) {
                tc.areEqual(data, shareData, "Unexpected value passed for shareData");
                tc.areEqual(shareOperation.data, loadDataPackage, "Unexpected value passed for dataPackage");
                loadCalled = true;
            }
        };

        Share.DataLoader = function () {
            return mockDataLoader;
        }

        data.loadDataAsync(_help.getStandardFormatOrder());

        tc.isTrue(loadCalled, "loadDataAsync was not called on DataLoader");
    });
    
    opt.description = "test tryInitializeWithHtml";
    Tx.test("ShareAnything.ShareData.testInitializeWithHtml", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var html = "<br />";

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var data = new Share.BaseData(_help.getShareOperation(dataPackage));

        var isValid = data.tryInitializeWithHtml(html);

        tc.isFalse(isValid, "Base implementation of tryInitializeWithHtml should always return false");
    });
    
    opt.description = "test tryInitializeWithText";
    Tx.test("ShareAnything.ShareData.testInitializeWithText", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var text = "here is some text";

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var data = new Share.BaseData(_help.getShareOperation(dataPackage));

        var isValid = data.tryInitializeWithText(text);

        tc.isFalse(isValid, "Base implementation of tryInitializeWithText should always return false");
    });

    opt.description = "Test tryInitializeWithLink ";
    Tx.test("ShareAnything.ShareData.testInitializeWithLink", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var subject = "Text share subject";

        var linkData = new Share.LinkData();
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.properties.insert("subject", subject);

        var data = new Share.BaseData(_help.getShareOperation(dataPackage));

        var isValid = data.tryInitializeWithLink(linkData);

        tc.isFalse(isValid, "Base implementation of tryInitializeWithLink should always return false");
    });

    opt.description = "Test tryInitializeWithFiles";
    Tx.test("ShareAnything.ShareData.testInitializeWithFiles", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var mockFiles = ["foo"];

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var data = new Share.BaseData(_help.getShareOperation(dataPackage));

        var isValid = data.tryInitializeWithFiles(mockFiles);

        tc.isFalse(isValid, "Base implementation of tryInitializeWithFiles should always return false");
    });

    opt.description = "Verifies that when the recordError method is called without an error code, the error code is set correctly.";
    Tx.test("ShareAnything.ShareData.testRecordErrorNoErrorCode", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var expectedResult = Share.Constants.ErrorCode.unknownError;

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var data = new Share.BaseData(_help.getShareOperation(dataPackage));

        data.recordError("unit test", Share.Constants.DataError.internalError);

        tc.areEqual(expectedResult, data._errorCode, "Unexpected default error code")
    });

    function verifyErrorCode(errorCode, expectedResult, tc) {
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var data = new Share.BaseData(_help.getShareOperation(dataPackage));
        data._errorCode = errorCode;

        var result = data.getErrorCodeString();

        tc.areEqual(expectedResult, result, "Unexpected string representation of error code");
    }

    opt.description = "Verifies that the correct string is output for a normal error code";
    Tx.test("ShareAnything.ShareData.testGetErrorCode", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var expectedResult = "0x800A01B6";
        var errorCode = -2146827850;

        verifyErrorCode(errorCode, expectedResult, tc);
    });

    opt.description = "Verifies that the error string will contain leading zeros if appropriate";
    Tx.test("ShareAnything.ShareData.testGetErrorCodeLeadingZero", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var expectedResult = "0x00078CAE";
        var errorCode = -4294472530;

        verifyErrorCode(errorCode, expectedResult, tc);
    });

    opt.description = "Verifies that the error string generation will work with positive error code";
    Tx.test("ShareAnything.ShareData.testErrorCodePositive", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // This case is not likely (the exception system doesn't support positive error codes), but it's best to be prepared.
        var errorCode = 3281914756;
        var expectedResult = "0xC39E0B84";

        verifyErrorCode(errorCode, expectedResult, tc);
    });

    opt.description = "Verifies that getErrorCode correctly returns null when the errorCode is zero";
    Tx.test("ShareAnything.ShareData.testErrorCodeZero", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var errorCode = 0;
        var expectedResult = null;

        verifyErrorCode(errorCode, expectedResult, tc);
    });

    opt.description = "Verifies that getErrorCode correctly returns null when the errorCode is not a number";
    Tx.test("ShareAnything.ShareData.testErrorCodeNaN", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var errorCode = "This is not an error code";
        var expectedResult = null;

        verifyErrorCode(errorCode, expectedResult, tc);
    });

    opt.description = "Verifies that getErrorCode correctly returns null when the errorCode matches the unknown error HRESULT";
    Tx.test("ShareAnything.ShareData.testErrorCodeUnknown", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
		
        var errorCode = Share.Constants.ErrorCode.unknownError;
        var expectedResult = null;

        verifyErrorCode(errorCode, expectedResult, tc);
    });
})();
