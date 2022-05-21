
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//

(function () {

    var U = Mail.UnitTest;

    function setup (tc) {
        tc.cleanup = function () {
            Mail.UnitTest.restoreJx();
            Mail.UnitTest.disposeGlobals();
        };

        Mail.UnitTest.setupStubs();
        Mail.UnitTest.stubJx(tc, "activation");
        Mail.UnitTest.stubJx(tc, "appData");
        Mail.UnitTest.stubJx(tc, "res");

        Mail.UnitTest.initGlobals(tc);
        var platform = Mail.Globals.platform,
            account = new Mail.Account(platform.accountManager.defaultAccount, platform);
        Mail.Globals.appState.setSelectedView(account.inboxView);
        Mail.Globals.appState.setSelectedMessages(null, -1, []);

    }

    var verify_RemoveMessagePassed, verify_AddErrorMsgPassed;

    function verify_AddErrorMsg (tc, id, priority, options) {
        tc.isTrue(id === "emailVerifyID");
        tc.isTrue(priority === 1);
        tc.isTrue(Jx.isObject(options));
        tc.isTrue(Jx.isObject(options.button2));
        tc.isTrue(options.button2.text === "/messagebar/messageBarCloseText");
        tc.isTrue(options.button2.tooltip === "/messagebar/messageBarCloseText");
        tc.isTrue(options.cssClass === "mailMessageBar");
        tc.isTrue(options.messageText === "/messagebar/messageBarIDCRLUnverifiedEasi");
        verify_AddErrorMsgPassed = true;
    }

    function verify_RemoveMessage (tc, id) {
        tc.isTrue(id === "emailVerifyID");
        verify_RemoveMessagePassed = true;
    }
    Tx.test("DefaultAccountAuthPresenter.basics", function (tc) {
        setup(tc);

        if (Jx.isNullOrUndefined(Microsoft.WindowsLive.Platform.Result)) {
            Microsoft.WindowsLive.Platform.Result = { emailVerificationRequired: 1 };
        }
        var presenter = new Mail.DefaultAccountAuthPresenter();
        window.Chat = window.Chat || {};
        var messageBar = { addErrorMessage: verify_AddErrorMsg.bind(null, tc), removeMessage: verify_RemoveMessage.bind(null, tc), mockedType: Chat.MessageBar };
        Mail.UnitTest.ensureSynchronous(function () {
            presenter.init(messageBar, Mail.Globals.platform, "mailMessageBar");
        });
        presenter._account = { lastAuthResult: Microsoft.WindowsLive.Platform.Result.emailVerificationRequired, emailAddress: "unitTests@awesome.net" };
        presenter._accountChanged({ target: presenter._account });
        presenter._account.lastAuthResult = 0;
        presenter._accountChanged({ target: presenter._account });
        tc.isTrue(verify_AddErrorMsgPassed);
        tc.isTrue(verify_RemoveMessagePassed);
    });

})();
