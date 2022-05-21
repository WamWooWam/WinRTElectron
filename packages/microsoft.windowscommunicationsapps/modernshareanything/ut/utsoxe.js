
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {
    /// <summary>
    //// Tests methods in the SOXE file.
    //// </summary>
    
    // Back up variables
    var _oldJxLog;
    var _oldAuth;
    var _oldSoxe;
    var _oldWindows;

    
    // setup function gets called before each test runs.
    function setup (tc) {
        _oldJxLog = Jx.log;
        _oldAuth = Share.AuthRequest;
        _oldSoxe = Share.SOXE;

        if (!Jx.isWWA) {
            _oldWindows = window.Windows;

            // Set up mock URI class for non-WWA testing
            Windows = {
                Foundation: {
                    Uri: function (url) {
                        this.host = url;
                    }
                }
            }
        }
    };
    
    // cleanup function gets called after each test runs.
    function cleanup (tc) {
        Jx.log = _oldJxLog;
        Share.AuthRequest = _oldAuth;
        Share.SOXE = _oldSoxe;

        if (!Jx.isWWA) {
            Windows = _oldWindows;
        }
    };
    
    Tokens = function (ticket){
        this.ticket = ticket;
    };
    
    var opt = {
        owner: "nthorn",
        priority: "0"
    }
    
    opt.description = "Tests the status update method when everything is OK";
    Tx.test("ShareAnything.SOXE.testGoodSoxeRequest", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var url = "http://www.live.com/?abc";
        var token = [new Tokens("xyz")];
        var httpOpen= false;
        var httpSetRequestHeader = 0;
        var httpSend = false;
        var requestUrl = "";
        
        var request = {
            open: function (arg0, url, arg2, arg3) {
                requestUrl = url;
                httpOpen = true;
            },
            setRequestHeader: function () {
                httpSetRequestHeader = httpSetRequestHeader + 1;
            },
            send: function () {
                httpSend = true;
            }
        }
 
        var context = {
            lookUpUrl: url,
            ticket: "xyz",
            xmlHttpRequest: request,
            soxeUrl: "http://profile.live.com/soxe"
        }
        
        // Call SoxeRequest
        Share.SOXE._soxeRequest(context);
        
        tc.areEqual(context.soxeUrl + '?url=' + encodeURIComponent(url), requestUrl ,"request url is not as expected");
        tc.isTrue(httpOpen, "request.open is not called");
        tc.areEqual( 3 ,httpSetRequestHeader);
        tc.isTrue(httpSend, "request.send is not called");
    });
    
    opt.description = "Tests the case where the url to lookup is undefined.";
    Tx.test("ShareAnything.SOXE.testInvalidUrl", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var url = undefined;
        var token = [new Tokens("xyz")];
        var jxLogsError = false;
        var errorCallBackCalled = false;
        
        // error callback 
        errorCallBack = function (error) {
            errorCallBackCalled = true;
            tc.areEqual(Share.Constants.ErrorCode.invalidArgument, error.number, "Error did not contain correct info");
        };
        
        // success callBack
        callBack = function () {
            tc.fail("Unexpected call to success callback");
        };
        
        // Mocking Jx.log for testing purposes.
        Jx.log = function () {};
        Jx.log.error = function () {
            jxLogsError = true;
        };

        var context = {
            externalErrorCallBack: errorCallBack,
            externalCallBack: callBack,
            lookUpUrl: url,
            soxeUrl: "http://profile.live.com/soxe"
        }
        
        Share.SOXE._soxeRequest(context, token);
        
        tc.isTrue(jxLogsError, "undefined Url does not cause an error to be logged.");
        tc.isTrue(errorCallBackCalled, "The error call back was not called!");
    });
    
    opt.description = "Tests the case where the url to lookup is undefined.";
    Tx.test("ShareAnything.SOXE.testInvalidToken", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var url = "http://www.live.com";
        var token = [new Tokens('')];
        var jxLogsError = false;
        var errorCallBackCalled = false;
        
        // error callback 
        errorCallBack = function (error) {
            errorCallBackCalled = true;
            tc.areEqual(Share.Constants.ErrorCode.accessDenied, error.number, "Error did not have expected info");
        };
        
        // success callBack
        callBack = function () {
            tc.fail("Unexpected call to success callback");
        };
        
        // Mocking Jx.log for testing purposes.
        Jx.log = function () {};
        Jx.log.error = function () {
            jxLogsError = true;
        };

        var context = {
            lookUpUrl: url,
            xmlHttpRequest: {
                open: function () {},
                setRequestHeader: function () {},
                send: function () { tc.fail("Unexpected call to xmlHttpRequest.send"); }
            },
            externalCallBack: callBack,
            externalErrorCallBack: errorCallBack,
            soxeUrl: "http://profile.live.com/soxe"
        };
        
        Share.SOXE._soxeRequest(context, token);
        
        tc.isTrue(jxLogsError, "undefined token does not cause an error to be logged.");
        tc.isTrue(errorCallBackCalled, "The error call back was not called!");
    });
    
    opt.description = "Tests the xhr response handling success.";
    Tx.test("ShareAnything.SOXE.testEndSOXESuccess", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        var callBackCalled = false;
        var soxeData='';
        var token = [new Tokens('abc')];
        var parsedResponse ='';
        
        request = function (){};
        request.status = 200;
        request.responseText= JSON.stringify(token);
        parsedResponse = JSON.parse(request.responseText);
        
        callBack = function (data) {
            callBackCalled = true;
            soxeData = data;
        }
        
        // Call SoxeRequest
        Share.SOXE._endSOXE(request, callBack, null);
        
        tc.isTrue(callBackCalled, "Success call back is not called.");
        tc.areEqual(parsedResponse[0].ticket, soxeData[0].ticket);
    });
    
    opt.description = "Tests the xhr response handling failure.";
    Tx.test("ShareAnything.SOXE.testEndSOXEFailure", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        var errorCallBackCalled = false;
        var jxLogsError = false;
        
        request = function (){};
        request.status = 403;
        
        // Mocking Jx.log for testing purposes.
        Jx.log = function () {};
        Jx.log.error = function () {
            jxLogsError = true;
        };
        
        errorCallBack = function (error) {
            errorCallBackCalled = true;

            // Also verify the correct error info was passed through
            tc.areEqual(error.number, Share.Constants.ErrorCode.unknownError);
        };
        
        // Call SoxeRequest
        Share.SOXE._endSOXE(request, null, errorCallBack);
        
        tc.isTrue(jxLogsError, "Error is not logged by jx.");
        tc.isTrue(errorCallBackCalled, "Failure call back is not called.");
    });

    opt.description = "Verifies that if an exception is thrown during endSoxe, that the error callback is called.";
    Tx.test("ShareAnything.SOXE.testEndSoxeException", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        
        var errorCallbackCalled = false;
        var jxLogsError = false;
        var thrownError = new Error("This error is thrown as part of the unit test to verify an error scenario");

        Jx.log = {
            exception: function () {
                jxLogsError = true;
            }
        };

        var request = {
            open: function () {},
            setRequestHeader: function () {},
            send: function () {},
        };

        var context = {
            xmlHttpRequest: request,
            externalErrorCallBack: function (error) {
                errorCallbackCalled = true;
                tc.areEqual(thrownError, error, "Error passed to error callback did not match");
            },
            externalCallBack: function () {
                tc.fail("Success callback was called unexpectedly");
            },
            lookUpUrl: "http://www.live.com",
            ticket: "xyz",
            soxeUrl: "http://profile.live.com/soxe"
        }
        var token = [new Tokens("xyz")]; // input to soxeRequest

        // Step 1: _soxeRequest sets up request.onreadystatechange
        Share.SOXE._soxeRequest(context);

        // Step 2: Set up _endSoxe to throw exception
        Share.SOXE._endSOXE = function () {
            throw thrownError;
        }

        // Step 3: call onreadystatechange (which calls _endSOXE) and verify the error callback was called, and error is logged.
        request.readyState = 4;
        request.onreadystatechange();

        tc.isTrue(errorCallbackCalled, "Error callback was expected to be called in this unit test");
        tc.isTrue(jxLogsError, "Jx was expected to log an error");
    });

    opt.description = "Verifies that if an exception is thrown during _soxeRequest, that the error callback is called.";
    Tx.test("ShareAnything.SOXE.testSoxeRequestException", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var errorCallbackCalled = false;
        var jxLoggedError = false;
        var thrownError = new Error("This is an error thrown as part of unit testing an error scenario");

        Jx.log = {
            exception: function () {
                jxLoggedError = true;
            }
        };

        var context = {
            xmlHttpRequest: {
                open: function () { throw thrownError },
                send: function () { tc.fail("Unexpected call to xmlHttpRequest.send"); },
            },
            externalErrorCallBack: function (error) {
                errorCallbackCalled = true;
                tc.areEqual(thrownError, error, "Error passed to error callback does not match");
            },
            externalCallBack: function () {
                tc.fail("Unexpected call to success callback");
            },
            lookUpUrl: "http://www.live.com",
            soxeUrl: "http://profile.live.com/soxe"
        }

        Share.SOXE._soxeRequest(context, {});

        tc.isTrue(jxLoggedError, "Expected Jx to log error case");
        tc.isTrue(errorCallbackCalled, "Expected call to error callback");
    });
})();
