
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global ShareUnitTestHelpers, Jx, Share, Debug, Tx, Windows*/

(function () {
    var _help = ShareUnitTestHelpers;

    // Place to store original global state that is changed by the tests
    var originalJxLog;
    var originalJxRes;
    var originalShareDataLoader;

    function setup () {
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
    }
    
    function cleanup () {
        ///<summary>
        /// Replace global state
        ///</summary>
        
        Debug.enableAssertDialog = true;
        Jx.log = originalJxLog;
        Jx.res = originalJxRes;
        Share.DataLoader = originalShareDataLoader;
    }
    
    var opt = {
        owner: "nthorn",
        priority: "0"
    };

    opt.description = "Verifies that the shareOperation, etc are saved by the constructor";
    Tx.test("ShareTarget.ShareMailData.testConstructorValid", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var shareOperation = _help.getShareOperation(dataPackage);

        var data = new Share.MailData(shareOperation);

        tc.areEqual(shareOperation, data.shareOperation, "share operation should have been saved in data object");
        tc.areEqual(Share.Constants.DataError.none, data.errorCategory, "Default value for errorCategory should be none");
    });

    opt.description = "A test where the share operation is null";
    Tx.test("ShareTarget.ShareMailData.testConstructorNullShareOperation", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        // This prevents the expected assert dialog from popping up here
        Debug.enableAssertDialog = false;

        var shareOperation = null;
        ShareUnitTestHelpers.verifyAssert(tc, function () {
            new Share.MailData(shareOperation);
        }, "Cannot construct a Share.Data object without the share operation");
    });

    opt.description = "Tests that the MailData object creates a MailDataLoader";
    Tx.test("ShareTarget.ShareMailData.testCreateDataLoader", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var shareOperation = _help.getShareOperation(dataPackage);
        var data = new Share.MailData(shareOperation);
        var dataLoader = data.createDataLoader();

        tc.isTrue(dataLoader instanceof Share.MailDataLoader, "Expected MailData to create a MailDataLoader object");
    });

    opt.description = "A test where the subject is not set on the data package";
    Tx.test("ShareTarget.ShareMailData.testSubjectUndefined", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        var title = "this is my unit test title";

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.properties.title = title;

        var dataObject = new Share.MailData(_help.getShareOperation(dataPackage));
        dataObject.calculateSubject();

        // Subject should fall back to title
        tc.areEqual(title, dataObject.subject, "Unexpected subject");
    });

    opt.description = "A test where the subject and title are not set on the data package";
    Tx.test("ShareTarget.ShareMailData.testSubjectTitleUndefined", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();

        var dataObject = new Share.MailData(_help.getShareOperation(dataPackage));
        dataObject.calculateSubject();

        // Subject should default to empty string
        tc.areEqual("", dataObject.subject, "Unexpected subject");
    });

    opt.description = "A test where the subject is empty";
    Tx.test("ShareTarget.ShareMailData.testEmptySubject", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        var title = "This is the title that is not empty";

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.properties.title = title;
        dataPackage.properties.insert("Subject", "");

        var dataObject = new Share.MailData(_help.getShareOperation(dataPackage));
        dataObject.calculateSubject();

        // We should use the subject even if it's empty
        tc.areEqual("", dataObject.subject, "Unexpected subject");
    });

    opt.description = "A test where the subject and title are empty";
    Tx.test("ShareTarget.ShareMailData.testEmptySubjectAndTitle", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        var empty = "";

        // This is not actually allowed by the system at the moment, but given the ever-changing nature of the system, I'd like to keep this test around.
        // creating a mock data package.
        var dataPackage = {
            properties: {
                hasKey: function () { return true; },
                lookup: function () { return empty; },
                title: empty
            },
            getView: function () {
                return this;
            }
        };

        var dataObject = new Share.MailData(_help.getShareOperation(dataPackage));
        dataObject.calculateSubject();

        // Subject should default to empty string
        tc.areEqual(empty, dataObject.subject, "Unexpected subject");
    });

    opt.description = "A test where the subject is present";
    Tx.test("ShareTarget.ShareMailData.testSubject", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        var subject = "This is the subject";
        var title = "This is the title";

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.properties.title = title;
        dataPackage.properties.insert("Subject", subject);

        var dataObject = new Share.MailData(_help.getShareOperation(dataPackage));
        dataObject.calculateSubject();

        // Verify it pulls the subject
        tc.areEqual(subject, dataObject.subject, "Unexpected subject");
    });

    opt.description = "A test where the subject is long";
    Tx.test("ShareTarget.ShareMailData.testTruncateSubject", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        var subject = _help.generateLongString(512);
        
        tc.isTrue(subject.length > Share.Constants.subjectMax, "Invalid test setup: length needs to be greater than max.");

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.properties.insert("Subject", subject);

        var dataObject = new Share.MailData(_help.getShareOperation(dataPackage));
        dataObject.calculateSubject();

        // Verify the subject was truncated
        tc.areEqual(Share.Constants.subjectMax, dataObject.subject.length, "Subject length was not truncated as expected");
    });

    opt.description = "This test verifies that if 'Subject' is not defined, 'subject' is used.";
    Tx.test("ShareTarget.ShareMailData.testSubjectAlsoUsesLowercase", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var subject = "this is the lowercase subject";
        var title = "this is the lowercase title";

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.properties.title = title;
        dataPackage.properties.insert("subject", subject);

        var dataObject = new Share.MailData(_help.getShareOperation(dataPackage));
        dataObject.calculateSubject();

        tc.areEqual(subject, dataObject.subject, "Unexpected subject");
    });

    opt.description = "This test verifies that 'Subject' is used over 'subject'";
    Tx.test("ShareTarget.ShareMailData.testSubjectPrefersUppercase", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var subject = "this is the preferred subject";
        var subjectLower = "this is the lower priority subject";
        var title = "this is the title";

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.properties.title = title;
        dataPackage.properties.insert("subject", subjectLower);
        dataPackage.properties.insert("Subject", subject);

        var dataObject = new Share.MailData(_help.getShareOperation(dataPackage));
        dataObject.calculateSubject();

        tc.areEqual(subject, dataObject.subject, "Unexpected subject");
    });

    opt.description = "test tryInitializeWithHtml where the html is null";
    Tx.test("ShareTarget.ShareMailData.testInitializeWithHtmlNull", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var defaultHtml = "";
        var html = null;

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        tc.areEqual(defaultHtml, data.messageHtml, "Unexpected default value of messageHtml");

        var isValid = data.tryInitializeWithHtml(html);

        tc.isFalse(isValid);
        tc.areEqual(defaultHtml, data.messageHtml, "Did not expect any update to messageHtml after invalid initialize");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should not contain HTML data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should not contain web link data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should not contain text data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should not contain file data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should not contain bitmap data.");
    });

    opt.description = "test tryInitializeWithHtml where the html is empty string";
    Tx.test("ShareTarget.ShareMailData.testInitializeWithHtmlEmpty", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var defaultHtml = "";
        var html = "";
        var subject = "test subject";

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.properties.insert("subject", subject);

        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        tc.areEqual(defaultHtml, data.messageHtml, "Unexpected default value of messageHtml");

        var isValid = data.tryInitializeWithHtml(html);

        tc.isFalse(isValid);
        tc.areEqual(defaultHtml, data.messageHtml, "Did not expect any update to messageHtml after invalid initialize");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should not contain HTML data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should not contain web link data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should not contain text data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should not contain file data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should not contain bitmap data.");
        tc.areEqual("", data.subject, "Did not expect subject to be filled in after invalid initialize");
    });

    opt.description = "test tryInitializeWithHtml where the html contains only whitespace";
    Tx.test("ShareTarget.ShareMailData.testInitializeWithHtmlOnlyWhitespace", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        var defaultHtml = "";
        var html = "  \n";

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        
        tc.areEqual(defaultHtml, data.messageHtml, "Unexpected default value of messageHtml");


        var isValid = data.tryInitializeWithHtml(html);

        tc.isFalse(isValid);
        tc.areEqual(defaultHtml, data.messageHtml, "Did not expect any update to messageHtml after invalid initialize");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should not contain HTML data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should not contain web link data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should not contain text data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should not contain file data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should not contain bitmap data.");
    });

    opt.description = "test tryInitializeWithHtml where the html is valid";
    Tx.test("ShareTarget.ShareMailData.testInitializeWithHtmlValid", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        var defaultHtml = "";
        var html = "<b>This is some html</b>";
        var htmlFormat = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(html);

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();

        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        tc.areEqual(defaultHtml, data.messageHtml, "Unexpected default value of messageHtml");

        var isValid = data.tryInitializeWithHtml(htmlFormat);

        tc.isTrue(isValid);
        // Also verify correct properties were set
        tc.areEqual(html, data.messageHtml, "messageHtml should have been modified after valid initialize");
        tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should contain HTML data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should not contain web link data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should not contain text data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should not contain file data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should not contain bitmap data.");
    });

    opt.description = "test tryInitializeWithHtml where the html is a text/html string rather than CF_HTML";
    Tx.test("ShareTarget.ShareMailData.testLoadNonHtmlFragment", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var html = "<b>this is an html string</b>";
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        var isValid = data.tryInitializeWithHtml(html);

        tc.isFalse(isValid, "We should not allow non CF_HTML strings, even if they are text/html");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should not contain HTML data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should not contain web link data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should not contain text data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should not contain file data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should not contain bitmap data.");
    });

    opt.description = "test _extractHtmlFromFragment with a valid CF_HTML string";
    Tx.test("ShareTarget.ShareMailData.testExtractHtmlFromFragmentValid", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var html = "Version:1.0\r\nStartHTML:00000097\r\nEndHTML:00000205\r\nStartFragment:00000153\r\nEndFragment:00000172\r\n<!DOCTYPE><HTML><HEAD></HEAD><BODY><!--StartFragment --><P>The Fragment</P><!--EndFragment --></BODY></HTML>";
        var expected = "<!DOCTYPE><HTML><HEAD></HEAD><BODY><!--StartFragment --><P>The Fragment</P><!--EndFragment --></BODY></HTML>";
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        var result = data._extractHtmlFromFragment(html);

        tc.areEqual(result, expected, "Expected full HTML to be returned.");
    });

    opt.description = "test _extractHtmlFromFragment with a valid CF_HTML string containing unicode characters";
    Tx.test("ShareTarget.ShareMailData.testExtractHtmlFromFragmentWithUnicodeValid", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var html = "Version:1.0\r\nStartHTML:00000097\r\nEndHTML:00000201\r\nStartFragment:00000153\r\nEndFragment:00000168\r\n<!DOCTYPE><HTML><HEAD></HEAD><BODY><!--StartFragment -->\u8DA6\u8DA6\u8DA6\u8DA6\u8DA6<!--EndFragment --></BODY></HTML>";
        var expected = "<!DOCTYPE><HTML><HEAD></HEAD><BODY><!--StartFragment -->\u8DA6\u8DA6\u8DA6\u8DA6\u8DA6<!--EndFragment --></BODY></HTML>";
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        var result = data._extractHtmlFromFragment(html);

        tc.areEqual(result, expected, "Expected full HTML to be returned.");
    });

    opt.description = "test _extractHtmlFromFragment with missing EndHTML parameter";
    Tx.test("ShareTarget.ShareMailData.testExtractHtmlFromFragmentMissingEndHTML", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var html = "Version:1.0\r\nStartHTML:00000079\r\nStartFragment:00000135\r\nEndFragment:00000154\r\n<!DOCTYPE><HTML><HEAD></HEAD><BODY><!--StartFragment --><P>The Fragment</P><!--EndFragment --></BODY></HTML>";
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        var result = data._extractHtmlFromFragment(html);

        tc.isNull(result, "Should not be able to extract HTML when CF_HTML parameters are incorrect.");
    });

    opt.description = "test _extractHtmlFromFragment with invalid EndHTML parameter";
    Tx.test("ShareTarget.ShareMailData.testExtractHtmlFromFragmentInvalidEndHTML", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var html = "Version:1.0\r\nStartHTML:00000097\r\nEndHTML:00000999\r\nStartFragment:00000153\r\nEndFragment:00000172\r\n<!DOCTYPE><HTML><HEAD></HEAD><BODY><!--StartFragment --><P>The Fragment</P><!--EndFragment --></BODY></HTML>";
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        var result = data._extractHtmlFromFragment(html);

        tc.isNull(result, "Should not be able to extract HTML when CF_HTML parameters are incorrect.");
    });

    opt.description = "test tryInitializeWithText where the text is null";
    Tx.test("ShareTarget.ShareMailData.testInitializeWithTextNull", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var defaultHtml = "";
        var text = null;

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        tc.areEqual(defaultHtml, data.messageHtml, "Unexpected default value of messageHtml");

        var isValid = data.tryInitializeWithText(text);

        tc.isFalse(isValid);
        tc.areEqual(defaultHtml, data.messageHtml, "Did not expect any update to messageHtml after invalid initialize");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should not contain HTML data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should not contain web link data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should not contain text data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should not contain file data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should not contain bitmap data.");
    });

    opt.description = "test tryInitializeWithText where the text is empty string";
    Tx.test("ShareTarget.ShareMailData.testInitializeWithTextEmpty", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var defaultHtml = "";
        var text = "";

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();

        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        tc.areEqual(defaultHtml, data.messageHtml, "Unexpected default value of messageHtml");

        var isValid = data.tryInitializeWithText(text);

        tc.isFalse(isValid);
        tc.areEqual(defaultHtml, data.messageHtml, "Did not expect any update to messageHtml after invalid initialize");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should not contain HTML data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should not contain web link data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should not contain text data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should not contain file data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should not contain bitmap data.");
    });

    opt.description = "test tryInitializeWithHtml where the html contains only whitespace";
    Tx.test("ShareTarget.ShareMailData.testInitializeWithTextOnlyWhitespace", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        var defaultHtml = "";
        var text = "  \n";

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        
        tc.areEqual(defaultHtml, data.messageHtml, "Unexpected default value of messageHtml");


        var isValid = data.tryInitializeWithText(text);

        tc.isFalse(isValid);
        tc.areEqual(defaultHtml, data.messageHtml, "Did not expect any update to messageHtml after invalid initialize");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should not contain HTML data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should not contain web link data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should not contain text data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should not contain file data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should not contain bitmap data.");
    });

    opt.description = "test tryInitializeWithText where the text is valid";
    Tx.test("ShareTarget.ShareMailData.testInitializeWithTextValid", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        var defaultHtml = "";
        var text = "This is some text & stuff";
        var encodedText = "This is some text &amp; stuff";

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();

        var data = new Share.MailData(_help.getShareOperation(dataPackage));
        
        tc.areEqual(defaultHtml, data.messageHtml, "Unexpected default value of messageHtml");

        var isValid = data.tryInitializeWithText(text);

        tc.isTrue(isValid);
        // Also verify correct properties were set
        tc.areEqual(encodedText, data.messageHtml, "messageHtml should have been modified after valid initialize");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should not contain HTML data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should not contain web link data.");
        tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should contain text data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should not contain file data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should not contain bitmap data.");
    });

    opt.description = "Test initializeWithLink with http link";
    Tx.test("ShareTarget.ShareMailData.testInitializeWithUri", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        var uri = new Windows.Foundation.Uri("http://www.bing.com");
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();

        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        var isValid = data.tryInitializeWithUri(uri);

        tc.isTrue(isValid, "Expected isValid case");
        tc.areEqual(uri, data.uri, "Expected uri to be set as state on data object");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should not contain HTML data.");
        tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should contain web link data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should not contain text data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should not contain file data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should not contain bitmap data.");
    });

    opt.description = "Test initializeWithLink with https link";
    Tx.test("ShareTarget.ShareMailData.testInitializeWithHttpsUri", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var uri = new Windows.Foundation.Uri("https://www.bing.com");
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();

        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        var isValid = data.tryInitializeWithUri(uri);

        tc.isTrue(isValid, "Expected isValid case");
        tc.areEqual(uri, data.uri, "Expected uri to be set as state on data object");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should not contain HTML data.");
        tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should contain web link data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should not contain text data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should not contain file data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should not contain bitmap data.");
    });

    opt.description = "Test initializeWithLink with mailto link";
    Tx.test("ShareTarget.ShareMailData.testInitializeWithMailtoUri", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var uri = new Windows.Foundation.Uri("mailto://nobody@example.com");
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();

        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        var isValid = data.tryInitializeWithUri(uri);

        tc.isFalse(isValid, "Expected isValid to be false for a mailto link");
        tc.areEqual(null, data.uri, "Link data should not be set for invalid data");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should not contain HTML data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should not contain web link data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should not contain text data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should not contain file data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should not contain bitmap data.");
    });

    opt.description = "Test initializeWithLink with null link";
    Tx.test("ShareTarget.ShareMailData.testInitializeWithUriNull", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var uri = null;
        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();

        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        var isValid = data.tryInitializeWithUri(uri);

        tc.isFalse(isValid, "Expected isValid to be false for null data");
        tc.areEqual(null, data.uri, "Link data should not be set for invalid data");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should not contain HTML data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should not contain web link data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should not contain text data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should not contain file data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should not contain bitmap data.");
    });

    opt.description = "Test tryInitializeWithFiles when the file list is null";
    Tx.test("ShareTarget.ShareMailData.testInitializeWithFilesNull", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var mockFiles = null;

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        var isValid = data.tryInitializeWithFiles(mockFiles);

        tc.isFalse(isValid, "Null files list should not be valid");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should not contain HTML data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should not contain web link data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should not contain text data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should not contain file data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should not contain bitmap data.");
    });

    opt.description = "Test tryInitializeWithFiles when the file list is empty";
    Tx.test("ShareTarget.ShareMailData.testInitializeWithFilesEmpty", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var mockFiles = [];

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        var isValid = data.tryInitializeWithFiles(mockFiles);

        tc.isFalse(isValid, "Empty files list should not be valid");
        tc.isNull(data.storageItems, "Should not have modified storageItems state on invalid data");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should not contain HTML data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should not contain web link data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should not contain text data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should not contain file data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should not contain bitmap data.");
    });

    opt.description = "Test tryInitializeWithFiles when the file list is valid";
    Tx.test("ShareTarget.ShareMailData.testInitializeWithFilesValid", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var mockFiles = ["foo"];

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();

        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        var isValid = data.tryInitializeWithFiles(mockFiles);

        tc.isTrue(isValid, "Expected a valid result");
        tc.areEqual(mockFiles, data.storageItems, "Expected files to be set on data as state");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should not contain HTML data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should not contain web link data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should not contain text data.");
        tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should contain file data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should not contain bitmap data.");
    });

    opt.description = "Test tryInitializeWithBitmap when the bitmap is null";
    Tx.test("ShareTarget.ShareMailData.testInitializeWithBitmapNull", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();

        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        var isValid = data.tryInitializeWithBitmap(null);

        tc.isFalse(isValid, "Null bitmap should not be valid");
        tc.isNull(data.bitmap, "Should not have modified bitmap state on invalid data");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should not contain HTML data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should not contain web link data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should not contain text data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should not contain file data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should not contain bitmap data.");
    });

    opt.description = "Test tryInitializeWithBitmap when the bitmap is valid";
    Tx.test("ShareTarget.ShareMailData.testInitializeWithBitmapValid", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var mockBitmap = { openReadAsync: Jx.fnEmpty };

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();

        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        var isValid = data.tryInitializeWithBitmap(mockBitmap);

        tc.isTrue(isValid, "Expected a valid result");
        tc.areEqual(mockBitmap, data.bitmap, "Expected bitmap to be set on data as state");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should not contain HTML data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should not contain web link data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should not contain text data.");
        tc.isFalse(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should not contain file data.");
        tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should contain bitmap data.");
    });

    opt.description = "Test initializing with all valid types";
    Tx.test("ShareTarget.ShareMailData.testInitializeWithAllTypes", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var html = "<b>This is some html</b>";
        var htmlFormat = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(html);
        var text = "This is some text & stuff";
        var uri = new Windows.Foundation.Uri("http://www.bing.com");
        var mockFiles = ["foo"];
        var mockBitmap = { openReadAsync: Jx.fnEmpty };

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();

        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        data.tryInitializeWithHtml(htmlFormat);
        data.tryInitializeWithText(text);
        data.tryInitializeWithUri(uri);
        data.tryInitializeWithFiles(mockFiles);
        data.tryInitializeWithBitmap(mockBitmap);

        tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html), "Share mail data should contain HTML data.");
        tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink), "Share mail data should contain web link data.");
        tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text), "Share mail data should contain text data.");
        tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems), "Share mail data should contain file data.");
        tc.isTrue(data.containsShareType(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap), "Share mail data should contain bitmap data.");
    });

    opt.description = "Test source link property";
    Tx.test("ShareTarget.ShareMailData.testSourceUri", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var uri = new Windows.Foundation.Uri("http://www.bing.com");

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        dataPackage.properties.contentSourceWebLink = uri;

        var data = new Share.MailData(_help.getShareOperation(dataPackage));

        tc.areEqual(uri, data.sourceUri, "Source Uri should return the value of the contentSourceWebLink");
    });
})();
