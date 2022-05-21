
// Copyright (C) Microsoft. All rights reserved.

/*global Share, Windows, Jx, Microsoft, MailManager, MailView, MailCollection, FolderManager, AccountManager, AttachmentCollection, MailMessage, Tx, MockResource, MockPlatform, MockAccount, MockShareOperation */
/*jshint browser:true*/

(function () {
    /// <summary>
    /// Tests methods in the RequestHelper file.
    /// </summary>

    // Local variables
    var _requestHelper;

    // Back up variables
    var _oldHttp;
    var _oldJxFault;
    var _oldJxLog;
    var _oldJxWwa;
    var _oldAuth;
    var _oldAttachmentWell;

    // setup function gets called before each test runs.
    function setup () {
        _requestHelper = new Share.RequestHelper();
        _requestHelper._getInternetConnectionProfile = function () {
            return {
                getNetworkConnectivityLevel: function () {
                    return Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess;
                }
            };
        };
        _oldHttp = XMLHttpRequest;
        _oldAuth = Share.AuthRequest;
        _oldAttachmentWell = Jx.isNullOrUndefined(window.AttachmentWell) ? {} : window.AttachmentWell;
        _oldJxFault = Jx.fault;
        _oldJxLog = Jx.log;
        _oldJxWwa = Jx.isWWA;

        Jx.log = {
            info: function () { },
            error: function () { },
            verbose: function () { },
            exception: function () { }
        };
        Jx.fault = function () { };

        // Define platform enums (if not already defined)
        window.Microsoft = window.Microsoft || {};
        Microsoft.WindowsLive = Microsoft.WindowsLive || {};
        Microsoft.WindowsLive.Platform = Microsoft.WindowsLive.Platform || {};
        Microsoft.WindowsLive.Platform.CollectionChangeType = Microsoft.WindowsLive.Platform.CollectionChangeType || {};
        Microsoft.WindowsLive.Platform.CollectionChangeType.itemAdded = Microsoft.WindowsLive.Platform.CollectionChangeType.itemAdded || "add";
        Microsoft.WindowsLive.Platform.CollectionChangeType.itemRemoved = Microsoft.WindowsLive.Platform.CollectionChangeType.itemRemoved || "remove";
        Microsoft.WindowsLive.Platform.MailFolderType = Microsoft.WindowsLive.Platform.MailFolderType || {};
        Microsoft.WindowsLive.Platform.MailFolderType.outbox = Microsoft.WindowsLive.Platform.MailFolderType.outbox || "outbox";
        Microsoft.WindowsLive.Platform.SortOrder = Microsoft.WindowsLive.Platform.SortOrder || {};
        Microsoft.WindowsLive.Platform.OutboxQueue = Microsoft.WindowsLive.Platform.OutboxQueue || {};

        window.MailManager = function () {
            this.ensureMailView = function () { return new MailView(); };
        };
        window.MailView = function () { };
        window.FolderManager = function () {
            this.getSpecialMailFolder = function () { };
        };
        window.AccountManager = function () {
            this.defaultAccount = "account";
            this.loadAccount = function () { };
        };
        window.MockPlatform = function () {
            this.mailManager = new MailManager();
            this.folderManager = new FolderManager();
            this.accountManager = new AccountManager();
        };
        window.MockResource = function () {
            this.eventListenerAdded = false;
            this.addEventListener = function () {
                this.eventListenerAdded = true;
            };
            this.removeEventListener = function () {
                this.eventListenerAdded = false;
            };
        };
        window.MockAccount = function () {
            this.getResourceByType = function () {
                return new MockResource();
            };
        };
        window.AttachmentCollection = function () {
            this.count = 1;
        };
        window.MailMessage = function () {
            this.objectId = "IDNumber";
            this.commit = function () { };
            this.deleteObject = function () { };
            this.outboxQueue = "";
            this.removeEventListener = function () { };
            this.addEventListener = function () { };
            this.getOrdinaryAttachmentCollection = function () {
                return AttachmentCollection;
            };
            this.moveToOutbox = Jx.fnEmpty;
        };
        window.MailCollection = function () {
            this.oncollectionchanged = function () { };
            this.unlock = function () { };
            this.dispose = function () { };
            this.removeEventListener = function () { };
            this.addEventListener = function () { };
        };
    }

    // cleanup function gets called after each test runs.
    // Do not reset XMLHttpRequest this causes a windows warning dialog to popup.
    function cleanup () {
        _requestHelper = null;
        Jx.fault = _oldJxFault;
        Jx.log = _oldJxLog;
        Jx.isWWA = _oldJxWwa;
        Share.AuthRequest = _oldAuth;
        window.AttachmentWell = _oldAttachmentWell;
    }

    var opt = {
        owner: "nthorn",
        priority: "0"
    };

    opt.description = "Tests the method that saves the message to the outbox.";
    Tx.test("ShareTarget.RequestHelper.testSendMessageToOutbox", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        window.AttachmentWell = {
            Compose: { }
        };

        var mailMessage = new MailMessage();
        var platform = new MockPlatform();
        var account = new MockAccount();
        var commitIsCalled = false;

        mailMessage.commit = function () {
            commitIsCalled = true;
            this.objectId = "ObjectId set during commit";
        };

        _requestHelper.sendMessageToOutbox(mailMessage, account, platform);

        tc.isTrue(commitIsCalled, "commit is not called");
        tc.isTrue(Jx.isObject(_requestHelper._resource), "Expected _resource to be saved when sending message to outbox.");
        tc.isTrue(_requestHelper._resource.eventListenerAdded, "Expected _requestHelper to have added an event listener to the _resource object.");
        tc.areEqual(mailMessage.objectId, _requestHelper._mailMessageId, "requestHelper should pick up the object ID after commit");
    });

    opt.description = "Test endTransfer called with mail sent.";
    Tx.test("ShareTarget.RequestHelper.testEndTransferSuccess", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var reportCompletedCalled = false;

        var mockReportCompleted = function () { reportCompletedCalled = true; };

        _requestHelper._reportCompleted = mockReportCompleted;
        _requestHelper.mailSent = true; // mail has been sent.
        _requestHelper._endTransfer(false);

        tc.isTrue(reportCompletedCalled, "ReportCompleted should be called");
    });

    opt.description = "Test endTransfer called in the cancel mail case";
    Tx.test("ShareTarget.RequestHelper.testEndTransferCancel", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var reportCompletedCalled = false;

        window.MockShareOperation = function () {
            this.reportCompleted = function () { reportCompletedCalled = true; };
        };

        var mockRequest = {};

        _requestHelper.mailSent = true; // mail has been sent.
        _requestHelper._request = mockRequest;
        _requestHelper._shareOperation = new MockShareOperation();
        _requestHelper._mailCollection = new MailCollection();
        _requestHelper._endTransfer(true);

        tc.isTrue(reportCompletedCalled, "Report Completed has not been called");
    });

    opt.description = "Verifies that if reportCompleted is called more than once, it doesn't call the operation more than once.";
    Tx.test("ShareTarget.RequestHelper.testReportCompletedTwice", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var reportCompletedCalledCount = 0;

        var mockShareOperation = {
            reportCompleted: function () { reportCompletedCalledCount++; }
        };

        _requestHelper._shareOperation = mockShareOperation;

        _requestHelper._reportCompleted();
        _requestHelper._reportCompleted();

        tc.areEqual(1, reportCompletedCalledCount, "Unexpected number of calls to reportCompleted");
    });

    opt.description = "Verify the cancel mail scenario";
    Tx.test("ShareTarget.RequestHelper.testCancelMail", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        Jx.isWWA = true;

        // Things we'd like to verify:
        // - called reportCompleted on platform
        // - mail was deleted
        // - removed event listener on mail collection
        var reportCompletedCalled = false;
        var deleted = false;
        var mockOperation = {
            reportCompleted: function () { reportCompletedCalled = true; }
        };
        var mockMailMessage = {
            deleteObject: function () { deleted = true; }
        };

        _requestHelper.mailSent = false;
        _requestHelper._shareOperation = mockOperation;


        _requestHelper.cancel(mockMailMessage);

        tc.isTrue(deleted, "Expected cancel to delete the mail");
        tc.isTrue(reportCompletedCalled, "Cancel should call reportCompleted");
    });

    opt.description = "Verify that _endTransfer is not called if the resource is still sending mail.";
    Tx.test("ShareTarget.RequestHelper.testResourceChangedStillSending", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        _requestHelper._mailMessage = {
            isInSpecialFolderType: function (folderType) {
                tc.areEqual(Microsoft.WindowsLive.Platform.MailFolderType.outbox, folderType, "Expected _requestHelper to ask for the Outbox folder type only; Refactoring this test may be needed.");
                return true;
            }
        };
        _requestHelper._resource = {
            isSendingMail: true,
            lastSendMailResult: 0,
            removeEventListener: Jx.fnEmpty
        };

        _requestHelper._endTransfer = function () {
            tc.error("Should not call endTransfer if mail is not done sending");
        };

        _requestHelper._resourceChanged();
    });

    opt.description = "Verify that _endTransfer is called if the resource is done sending mail.";
    Tx.test("ShareTarget.RequestHelper.testResourceChangedDoneSending", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        _requestHelper._mailMessage = {
            isInSpecialFolderType: function (folderType) {
                tc.areEqual(Microsoft.WindowsLive.Platform.MailFolderType.outbox, folderType, "Expected _requestHelper to ask for the Outbox folder type only; Refactoring this test may be needed.");
                return false;
            }
        };
        _requestHelper._resource = {
            isSendingMail: false,
            lastSendMailResult: 0,
            removeEventListener: Jx.fnEmpty
        };
        _requestHelper._mailError = Share.MailConstants.MailError.none;

        var endTransferCalled = false;
        _requestHelper._endTransfer = function () {
            endTransferCalled = true;
        };

        _requestHelper._resourceChanged();

        tc.isTrue(endTransferCalled, "Expected endTransfer to be called once message was sent.");
        tc.areEqual(_requestHelper._mailError, Share.MailConstants.MailError.none, "Error should not be set when message was sent successfully.");
    });

    opt.description = "Verify that _mailError is set properly if an authentication error occurs.";
    Tx.test("ShareTarget.RequestHelper.testResourceChangedAuthenticationError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        _requestHelper._mailMessage = {
            isInSpecialFolderType: function (folderType) {
                tc.areEqual(Microsoft.WindowsLive.Platform.MailFolderType.outbox, folderType, "Expected _requestHelper to ask for the Outbox folder type only; Refactoring this test may be needed.");
                return true;
            }
        };
        _requestHelper._resource = {
            isSendingMail: false,
            lastSendMailResult: Microsoft.WindowsLive.Platform.Result.passwordLogonFailure,
            removeEventListener: Jx.fnEmpty
        };
        _requestHelper._mailError = Share.MailConstants.MailError.none;

        var endTransferCalled = false;
        _requestHelper._endTransfer = function () {
            endTransferCalled = true;
        };

        _requestHelper._resourceChanged();

        tc.isTrue(endTransferCalled, "Expected endTransfer to be called if an error occurs during send.");
        tc.areEqual(_requestHelper._mailError, Share.MailConstants.MailError.authError, "Error was not set correctly.");
    });

    opt.description = "Verify that _mailError is set properly if an internet error occurs.";
    Tx.test("ShareTarget.RequestHelper.testResourceChangedInternetError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        _requestHelper._mailMessage = {
            isInSpecialFolderType: function (folderType) {
                tc.areEqual(Microsoft.WindowsLive.Platform.MailFolderType.outbox, folderType, "Expected _requestHelper to ask for the Outbox folder type only; Refactoring this test may be needed.");
                return true;
            }
        };
        _requestHelper._resource = {
            isSendingMail: false,
            lastSendMailResult: -1,
            removeEventListener: Jx.fnEmpty
        };
        _requestHelper._mailError = Share.MailConstants.MailError.none;

        var endTransferCalled = false;
        _requestHelper._endTransfer = function () {
            endTransferCalled = true;
        };

        _requestHelper._getInternetConnectionProfile = function () {
            return null;
        };

        _requestHelper._resourceChanged();

        tc.isTrue(endTransferCalled, "Expected endTransfer to be called if an error occurs during send.");
        tc.areEqual(_requestHelper._mailError, Share.MailConstants.MailError.internetError, "Error was not set correctly.");
    });

    opt.description = "Verify that _mailError is set properly if an error occurs that block send.";
    Tx.test("ShareTarget.RequestHelper.testResourceChangedGenericError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        _requestHelper._mailMessage = {
            isInSpecialFolderType: function (folderType) {
                tc.areEqual(Microsoft.WindowsLive.Platform.MailFolderType.outbox, folderType, "Expected _requestHelper to ask for the Outbox folder type only; Refactoring this test may be needed.");
                return true;
            }
        };
        _requestHelper._resource = {
            isSendingMail: false,
            lastSendMailResult: -1,
            removeEventListener: Jx.fnEmpty
        };
        _requestHelper._mailError = Share.MailConstants.MailError.none;

        var endTransferCalled = false;
        _requestHelper._endTransfer = function () {
            endTransferCalled = true;
        };

        _requestHelper._resourceChanged();

        tc.isTrue(endTransferCalled, "Expected endTransfer to be called if an error occurs during send.");
        tc.areEqual(_requestHelper._mailError, Share.MailConstants.MailError.outboxError, "Error was not set correctly.");
    });

    opt.description = "Verify that _mailError is not set when an error occurs that does not block send.";
    Tx.test("ShareTarget.RequestHelper.testResourceChangedGenericError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        _requestHelper._mailMessage = {
            isInSpecialFolderType: function (folderType) {
                tc.areEqual(Microsoft.WindowsLive.Platform.MailFolderType.outbox, folderType, "Expected _requestHelper to ask for the Outbox folder type only; Refactoring this test may be needed.");
                return false;
            }
        };
        _requestHelper._resource = {
            isSendingMail: false,
            lastSendMailResult: -1,
            removeEventListener: Jx.fnEmpty
        };
        _requestHelper._mailError = Share.MailConstants.MailError.none;

        var endTransferCalled = false;
        _requestHelper._endTransfer = function () {
            endTransferCalled = true;
        };

        _requestHelper._resourceChanged();

        tc.isTrue(endTransferCalled, "Expected endTransfer to be called.");
        tc.areEqual(_requestHelper._mailError, Share.MailConstants.MailError.none, "Error should not be set if the message was sent successfully.");
    });

    opt.description = "Verify that if we get a resource changed event after a call to cancel, nothing breaks.";
    Tx.test("ShareTarget.RequestHelper.testCancelMailThenResourceChanged", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        Jx.isWWA = true;

        var mockOperation = {
            reportCompleted: function () { }
        };

        var messageId = "unitTestMessageId";

        // Mock up a requestHelper that has a pending mail share but no network
        _requestHelper.mailSent = false;
        _requestHelper.networkShareSent = true;
        _requestHelper._shareOperation = mockOperation;
        _requestHelper._mailMessageId = messageId;
        _requestHelper._resource = new MockResource();

        _requestHelper.cancel(new MailMessage());

        _requestHelper._endTransfer = function () {
            tc.error("Should not call endTransfer after cancel has been called");
        };

        _requestHelper._resourceChanged();
    });

    opt.description = "Test the mailMessage syncStatus change event.";
    Tx.test("ShareTarget.RequestHelper.testMailMessageChangedNothing", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Test case: Mail Has no error, so doneTransfer should not be not called now

        // Setup test case
        var endTransferCalled = false;

        var ourChangeEvent = {
            target: {
                syncStatus: 0,
                photoMailStatus: 0
            }
        };

        var ourEndTransfer = function () {
            endTransferCalled = true;
        };

        _requestHelper._endTransfer = ourEndTransfer;
        _requestHelper._mailMessageChanged(ourChangeEvent);

        tc.isFalse(endTransferCalled, "The item event is of type added report completed should not be called.");
    });

    opt.description = "Test that sync status errors are handled properly";
    Tx.test("ShareTarget.RequestHelper.testMailMessageChangedSyncStatus", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        // Test Case 2: syncStatus > 0 - Mail has an error, so endTransfer is called

        var status = 101;

        var errorLogged = false;
        var endTransferCalled = false;
        var ourEndTransfer = function () {
            endTransferCalled = true;
        };

        var ourChangeEvent = {
            target: {
                syncStatus: status,
                photoMailStatus: 0
            }
        };

        Jx.fault = function (place1, place2, error) {
            errorLogged = true;
            tc.areEqual("MessageSyncStatus", place2, "Error location was not recorded correctly");
            tc.areEqual(status, error.number, "Error code was not recorded correctly");
        };

        _requestHelper._endTransfer = ourEndTransfer;
        _requestHelper._mailMessageChanged(ourChangeEvent);

        tc.isTrue(endTransferCalled, "EndTransfer should be called when there is an error with the send");
        tc.areEqual(Share.MailConstants.MailError.outboxError, _requestHelper._mailError, "Expected error to be set");
        tc.isTrue(errorLogged, "Should have logged an error for this case");
    });

    function testReportCompletedError(errorType, tc) {
        var reportErrorCalled = false;

        var mockShareOperation = {
            reportCompleted: function () { tc.error("Unexpected call to reportCompleted"); },
            reportError: function () { reportErrorCalled = true; }
        };

        _requestHelper._shareOperation = mockShareOperation;
        _requestHelper._mailError = errorType;

        _requestHelper._reportCompleted();

        tc.isTrue(reportErrorCalled, "ReportError should be called");
    }

    opt.description = "Verifies that if reportError is called if we have a mail sync error.";
    Tx.test("ShareTarget.RequestHelper.testReportCompletedOutboxError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        testReportCompletedError(Share.MailConstants.MailError.outboxError, tc);
    });

    opt.description = "Verifies that reportError is called when there is a preOutboxError";
    Tx.test("ShareTarget.RequestHelper.testReportCompletedPreOutboxError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        testReportCompletedError(Share.MailConstants.MailError.preOutboxError, tc);
    });

    opt.description = "Verifies that reportError is called when there is an internetError";
    Tx.test("ShareTarget.RequestHelper.testReportCompletedPreOutboxError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        testReportCompletedError(Share.MailConstants.MailError.internetError, tc);
    });

    opt.description = "Verifies that reportError is called when there is an authError";
    Tx.test("ShareTarget.RequestHelper.testReportCompletedAuthError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        testReportCompletedError(Share.MailConstants.MailError.authError, tc);
    });
})();
