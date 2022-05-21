
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {
    /// <summary>
    /// Tests the methods in the ShareService class.
    /// </summary>

    // Local variables
    var _shareService;

    // Back up Variables
    var _oldJxLog;
    var _oldRequestHelper;

    function setup (tc) {
        _shareService = new Share.ShareService();
        _oldJxLog = Jx.log;
        _oldRequestHelper = Share.RequestHelper;

        Debug.enableAssertDialog = false;

        MailMessage = /*@constructor*/function () {
            this.to = "";
            this.subject = "";
            this.from = "";
            this.createBody = function () { return new MailBody(); }
        };

    };

    function cleanup (tc) {
        _shareService = null;
        Jx.log = _oldJxLog;
        Share.RequestHelper = _oldRequestHelper;

        Debug.enableAssertDialog = true;
    };
    
    var opt = {
        owner: "nthorn",
        priority: "0"
    };

    NetworkObject = /*@constructor*/function (id) {
        this.id = id;
    };

    opt.description = "Tests share object is null error.";
    Tx.test("ShareTarget.ShareService.testInitiateShareShareObjectIsNull", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var myShare = null;

        ShareUnitTestHelpers.verifyAssert(tc, function () {
            _shareService.initiateShare(myShare);
        }, "initiateShare requires a share object");
    });

    opt.description = "Tests initiateShare";
    Tx.test("ShareTarget.ShareService.testIntiateShare", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var mailSent = false;

        var myShare = {};
        myShare.mailMessage = new MailMessage();
        myShare.mailMessage.to = "to Someone";

        // Mocking Share.RequestHelper for testing purposes.
        Share.RequestHelper = /*@constructor*/function () {
            this.sendMessageToOutbox = function () {
                mailSent = true;
            };
        };

        _shareService.initiateShare(myShare);
        tc.isTrue(mailSent, "Send mail to outbox is called");
    });
    
    opt.description = "Verifies that the initiateShare method saves the requestHelper (so we can use it later in cancel)";
    Tx.test("ShareTarget.ShareService.testIntiateShareSavesHelper", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var myShare = {};
        var mailSent = false;

        myShare.mailMessage = new MailMessage();
        myShare.mailMessage.to = "to Someone";

        // Mocking Share.RequestHelper for testing purposes.
        Share.RequestHelper = /*@constructor*/function () {
            this.sendMessageToOutbox = function () {
                mailSent = true;
            };
        };

        _shareService.initiateShare(myShare);

        tc.isNotNull(_shareService._helper, "Expected share service to save a reference to the RequestHelper");
    });

    opt.description = "Test the cancelShare method";
    Tx.test("ShareTarget.ShareService.testCancel", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var helperCancelCalled = false;
        var mockShareData = {
            mailMessage: {
                test: "this is a mock mail message"
            }
        }

        var mockHelper = {
            cancel: function (mailMessage) {
                helperCancelCalled = true;
                tc.areEqual(mailMessage, mockShareData.mailMessage, "Parameter to cancel was unexpected");
            }
        };

        _shareService._helper = mockHelper;
        _shareService.cancelShare(mockShareData);

        tc.isTrue(helperCancelCalled, "Expected cancelShare to call cancel on the RequestHelper");
    });
})();
