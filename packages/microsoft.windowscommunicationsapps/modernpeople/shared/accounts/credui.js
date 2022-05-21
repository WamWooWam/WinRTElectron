
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../JSUtil/Include.js"/>
/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People.Accounts, ["getUserAuthTokenAsync", "showCredUIAsync"], function () {

    var P = window.People,
        A = P.Accounts,
        O = Windows.Security.Authentication.OnlineId,
        Result = Microsoft.WindowsLive.Platform.Result;


    A.getUserAuthTokenAsync = function (success, failure) {
        ///<summary>Attempts to silently retrieve the user's auth token</summary>
        ///<param name="success" type="Function">Callback that recieves the token if auth succeeds</param>
        ///<param name="failure" type="Function">Callback that notifies of auth failure</param>
        authenticateUserAsync(O.CredentialPromptType.doNotPrompt, success, failure);
    };

    A.showCredUIAsync = function (success, failure, canceled, orginatingError) {
        ///<summary>Invokes the Windows CredUI, prompting the user for his username and password</summary>
        ///<param name="success" type="Function">Callback that notifies of sign-in success</param>
        ///<param name="failure" type="Function">Callback that notifies of auth failure</param>
        ///<param name="canceled" type="Function" optional="true">Callback that notifies of user-cancelation</param>
        ///<param name="orginatingError" type="String" optional="true">The platform error which triggered the invocation of the CredUI</param>
        authenticateUserAsync(O.CredentialPromptType.promptIfNeeded, success, failure, canceled, orginatingError);
    };

    var authenticateUserAsync = function (promptType, success, failure, canceled, orginatingError) {

        // We need to launch the Windows Authenticator (i.e. the CredUI).
        var auth = new O.OnlineIdAuthenticator();
        var serviceUrl = (orginatingError === Result.defaultAccountDoesNotExist ? "startup.live.com" : "ssl.live.com");
        
        var env = Jx.app.getEnvironment();
        if (Jx.isNonEmptyString(env) && env === "INT") {
            serviceUrl = (orginatingError === Result.defaultAccountDoesNotExist ? "startup.live-int.com" : "ssl.live-int.com");
        }
        

        var request = new O.OnlineIdServiceTicketRequest(serviceUrl, "MBI_SSL");
        auth.authenticateUserAsync([request], promptType).done(
            function (res) {
                Jx.log.info("authenticateUserAsync() success");
                if (res.tickets && res.tickets[0].value !== "") {
                    success(res.tickets[0].value);
                } else {
                    failure();
                }
            },
            function (res) {
                if (Jx.isNumber(res.number)) {
                    // If we have an error number, assume an actual error case.
                    failure(res.number);
                } else {
                    // We assume user-cancellation
                    Debug.assert(res.name === "Canceled");
                    Jx.log.info("authenticateUserAsync() cancelled");
                    if (canceled) {
                        canceled();
                    }
                }
            });
    };
});
