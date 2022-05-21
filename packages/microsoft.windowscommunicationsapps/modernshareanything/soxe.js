
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="ShareAnything.ref.js" />
/// <reference path="ShareAnything.dep.js" />

Share.SOXE =  {};
    /// <summary>
    /// SOXE class calls the soxe service and sends the parsed info back to the caller.
    /// </summary>

Share.SOXE.beginSOXERequest = function (lookUpUrl, ticket, soxeUrl, market) {
    /// <summary>
    /// Calls SOXE to get information about the given URL.  Returns a Promise.
    /// </summary>
    /// <param name="lookUpUrl" type="String">The url to send to soxe.</param>
    /// <param name="ticket" type="String">The ticket for server side requests.</param>
    /// <param name="soxeUrl" type="String">The URL to the SOXE server</param>
    /// <param name="market" type="String">The market to send to SOXE</param>
    /// <returns type="WinJS.Promise">Promise, which will return JSON-parsed SOXE data on success.</returns>
    /// <remarks>This async method is not hot start - it does not start processing until .then is called.</remarks>

    var soxeXmlHttpRequest = new XMLHttpRequest();

    return new WinJS.Promise(
        function (complete, error, progress) {
            // Context method allows us to pass data to _soxeRequest
            var context = {
                lookUpUrl: lookUpUrl,
                ticket: ticket,
                soxeUrl: soxeUrl,
                externalCallBack: complete,
                externalErrorCallBack: error,
                // passing this through so that we have the request object in order to set up the cancel method, below.
                xmlHttpRequest: soxeXmlHttpRequest,
                market: market
            };

            Share.SOXE._soxeRequest(context);
        },
        function cancel() {
            soxeXmlHttpRequest.abort();
        }
    );
};

Share.SOXE._soxeRequest = function (/* @dynamic*/context) {
    /// <summary>
    /// The callBack function for the auth token lookup function.
    /// </summary>
    /// <param name="context">Context object contains lookUpUrl, callbacks, and XMLHttpRequest to use.</param>

    try {
        var lookUpUrl = /* @static_cast(String)*/context.lookUpUrl;
        var ticket = /* @static_cast(String)*/context.ticket;
        var externalCallBack = /* @static_cast(Function)*/context.externalCallBack;
        var externalErrorCallBack = /* @static_cast(Function)*/context.externalErrorCallBack;
        var request = /* @static_cast(XMLHttpRequest)*/context.xmlHttpRequest;
        var soxeUrl = /* @static_cast(String)*/context.soxeUrl;
        var market = /* @static_cast(String)*/context.market;

        if (Jx.isNonEmptyString(lookUpUrl)) {

            // Build the SOXE url
            var url; 
            if (Share.SOXE._soxeUrlOverride) {
                url = Share.SOXE._soxeUrlOverride + '&url=' + encodeURIComponent(lookUpUrl);
            } else {
                url = soxeUrl + '?url=' + encodeURIComponent(lookUpUrl);
            }
            
            var uri = new Windows.Foundation.Uri(url);
            request.open("GET", url, true, null, null);
            request.setRequestHeader("Host", uri.host);
            request.setRequestHeader("Accept-Language", market);

            if (Jx.isNonEmptyString(ticket)) {
                request.setRequestHeader("WLAuthToken", ticket);
            } else {
                var authErrorMessage = "SOXE does not have a valid ticket";
                var authError = new Error(authErrorMessage);
                authError.number = Share.Constants.ErrorCode.accessDenied;
                Jx.log.error(authErrorMessage);
                externalErrorCallBack(authError);
                return;
            }

            // Set a timeout length to wait for a SOXE response, call the external error if timeout occurs.
            request.timeout = Share.SOXE._timeout;
            request.ontimeout = externalErrorCallBack;

            request.onreadystatechange =  function () {
                try {
                    if (request.readyState === 4) {
                        Share.SOXE._endSOXE(request, externalCallBack, externalErrorCallBack);
                    }
                } catch (e) {
                    Jx.log.exception("Error retrieving/parsing SOXE results.", e);

                    externalErrorCallBack(e);
                }
            };

            request.send(null);
        } else {
            var errorMessage = "Url to send to SOXE was invalid.";
            var error = new Error(errorMessage);
            error.number = Share.Constants.ErrorCode.invalidArgument;
            Jx.log.error(errorMessage);
            externalErrorCallBack(error);
        }
    } catch (e) {
        Jx.log.exception("Error sending SOXE request.", e);

        externalErrorCallBack(e);
    }
};

Share.SOXE._endSOXE = function (request, externalCallBack, externalErrorCallBack) {
    /// <summary>
    /// This method handles the success or error callbacks.
    /// </summary>
    /// <param name="request" type="XMLHttpRequest">The xhr request.</param>
    /// <param name="externalCallBack" type="Function">The function to send the SOXE data back to.</param>
    /// <param name="externalErrorCallBack" type="Function">The function to call if an error occurs.</param>

    // Get the response and package the data back up to caller.
    if (request.status === 200) {
        externalCallBack(JSON.parse(request.responseText));
    } else if (request.status !== 200) {
        var errorMessage = "SOXE could not return results. Status code: " + /* @static_cast(String)*/request.status;
        var error = new Error(errorMessage);
        error.number = Share.Constants.ErrorCode.unknownError;
        Jx.log.error(errorMessage);
        externalErrorCallBack(error);
    }
};


// The maximum time (in Milliseconds) to wait for a response.
Share.SOXE._timeout = 15000;
Share.SOXE._soxeUrlOverride = "";