
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

Jx.delayDefine(People.Accounts, "authenticateOAuthAsync", function () {
    "use strict";

    var P = window.People,
        A = P.Accounts,
        W = Windows.Security.Authentication.Web,
        WABStatus = W.WebAuthenticationStatus,
        Uri = Windows.Foundation.Uri;
    
    var GoogleClientId = "680536898769.apps.googleusercontent.com",
        GoogleClientSecret = "K42IZLOoy0mhX6QfGZkCwWGS";

    A.authenticateOAuthAsync = function (emailAddressHint) {
        ///<summary>Returns a promise that Shows the web auth UI and perform subsequent steps necessary to obtain tokens.
        ///This function is hard coded for Google OAuth support at the moment.</summary>
        ///<param name="emailAddress" type="String" optional="true">Email hint shown in the Web UI, if available.</param>
        Debug.assert(Jx.isString(emailAddressHint) || Jx.isNullOrUndefined(emailAddressHint));
        return new WinJS.Promise(function (completeHandler, errorHandler, progressHandler) {
            // WebAuthenticationBroker to get CODE
            var startURL = "https://accounts.google.com/o/oauth2/auth?" +
                "client_id=" + GoogleClientId +
                "&redirect_uri=http://localhost/" +
                "&response_type=code" +
                "&scope=https://mail.google.com/%20https://www.googleapis.com/auth/userinfo.email";
            if (emailAddressHint !== undefined)
            {
                startURL += "&login_hint=" + Uri.escapeComponent(emailAddressHint);
            }
            var startURI = new Uri(startURL);
            var endURI = new Uri("http://localhost");
            var accountDetails = {};
            W.WebAuthenticationBroker.authenticateAsync(W.WebAuthenticationOptions.none, startURI, endURI)
            .then(function (result) {
                // CODE is possibly in response. Handle possible errors.
                var responseStatus = result.responseStatus;
                if (responseStatus === WABStatus.errorHttp) {
                    var errorNumber = hrFromHttp(result.responseErrorDetail);
                    return WinJS.Promise.wrapError(new Error(errorNumber, errorNumber));
                } else if (responseStatus === WABStatus.userCancel) {
                    return WinJS.Promise.wrapError(new Error("Canceled"));
                }
                var resultURI = new Uri(result.responseData);
                var resultQuery = resultURI.queryParsed;
                if (resultURI.query.indexOf("error=") !== -1) {
                    var errorReason = resultQuery.getFirstValueByName("error");
                    if ("access_denied" === errorReason) {
                        // User cancel
                        return WinJS.Promise.wrapError(new Error("Canceled"));
                    } else {
                        return WinJS.Promise.wrapError(new Error(0x80004005, resultQuery.getFirstValueByName("error")));
                    }
                }
                progressHandler("initialAuthComplete");
                var code = resultQuery.getFirstValueByName("code");
                accountDetails.code = code;
                return code;
            }).then(function (code) {
                // Exchange CODE for tokens
                var postPayload = "code=" + Uri.escapeComponent(code) +
                    "&client_id=" + GoogleClientId +
                    "&client_secret=" + GoogleClientSecret + 
                    "&redirect_uri=http://localhost/" +
                    "&grant_type=authorization_code";
                var xhrOptions = {
                    type: "POST",
                    url: "https://accounts.google.com/o/oauth2/token",
                    responseType: "json",
                    data: postPayload,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                };
                return WinJS.xhr(xhrOptions);
            }).then(function (result) {
                // Handle errors and request user email address
                if (isHttpError(result.status)) {
                    var errorNumber = hrFromHttp(result.status);
                    return WinJS.Promise.wrapError(new Error(errorNumber, errorNumber));
                }
                var obj = JSON.parse(result.response);
                accountDetails.accessToken = obj.access_token;
                accountDetails.refreshToken = obj.refresh_token;
                if (!Jx.isNumber(obj.expires_in)) {
                    return WinJS.Promise.wrapError(new Error(0x80004005, "Invalid expires_in"));
                }
                var expires = new Date();
                expires.setSeconds(expires.getSeconds() + obj.expires_in);
                accountDetails.accessTokenExpiry = expires;
                var xhrOptions = {
                    type: "GET",
                    url: "https://www.googleapis.com/oauth2/v2/userinfo",
                    responseType: "json",
                    headers: {
                        "Authorization": "Bearer " + Uri.escapeComponent(obj.access_token)
                    }
                };
                return WinJS.xhr(xhrOptions);
            }).then(function (result) {
                if (isHttpError(result.status)) {
                    var errorNumber = hrFromHttp(result.status);
                    return WinJS.Promise.wrapError(new Error(errorNumber, errorNumber));
                } else {
                    var obj = JSON.parse(result.response);
                    accountDetails.emailAddress = obj.email;
                    Jx.log.info("authenticateOAuthAsync() success");
                    return accountDetails;
                }
            }).done(function (result) {
                completeHandler(result);
            }, function (err) {
                if (err instanceof Error) {
                    errorHandler(err);
                } else if (err instanceof XMLHttpRequest) {
                    var errorNumber = hrFromHttp(err.status);
                    errorHandler(new Error(errorNumber, errorNumber));
                } else {
                    errorHandler(new Error(0x80004005, "Failed"));
                }
            });
        });
    };
    
    var makeHr = function (sev, fac, code) {
        return sev << 31 | fac << 16 | code;
    };
    
    var hrFromHttp = function (http) {
        return makeHr(1, 0x19, 0x4000 | (http & 0x00000FFF));
    };
    
    var isHttpError = function (http) {
        return http !== 200;
    };
});
