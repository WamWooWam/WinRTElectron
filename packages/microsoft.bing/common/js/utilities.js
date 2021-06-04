/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='tracing.js' />
/// <reference path='errors.js' />
/// <reference path='../../shell/js/navigation.js' />
/// <reference path='../../shell/js/viewmanagement.js' />
/// <reference path='../../shell/js/servicelocator.js' />
(function () {
    "use strict";

    var isNullOrUndefined = function (value) {
        /// <summary>
        /// Determines if given value is null or undefined.
        /// </summary>
        /// <param name="value">
        /// Value to test.
        /// </param>
        /// <returns>
        /// True to indicate that given value is null or undefined; otherwise, false.
        /// </returns>
        return value === null || typeof value === "undefined";
    };

    var isNotNullOrUndefined = function (value) {
        /// <summary>
        /// Determines if given value is not null or undefined.
        /// </summary>
        /// <param name="value">
        /// Value to test.
        /// </param>
        /// <returns>
        /// True to indicate that given value is not null or undefined; otherwise, false.
        /// </returns>
        return isNullOrUndefined(value) ? false : true;
    };

    var isPromiseCancellationError = function (error) {
        /// <summary>
        /// Determines if given object represents an error passed to onError handler of
        /// Promise object.
        /// </summary>
        /// <param name="error" type="Error">
        /// Error object.
        /// </param>
        /// <returns>
        /// True to indicate that given object represents cancellation error returned by Promise;
        /// otherwise, false.
        /// </returns>
        var canceledName = "Canceled";
        return error instanceof Error && error.name === canceledName && error.message === canceledName;
    };

    var format = function (formatText) {
        /// <summary>
        /// Converts given format string into string which replaces placeholders inside format
        /// string with values of arguments passed as function parameters.
        /// </summary>
        /// <param name="formatText" type="String">
        /// The format string.
        /// </param>
        /// <returns type="String">
        /// The result of replacing placeholders with argument values.
        /// </returns>
        if (BingApp.Utilities.isNullOrUndefined(formatText)) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("formatText");
        }

        var argumentsCount = arguments.length;
        for (var indexArgument = 1; indexArgument < argumentsCount; indexArgument++) {
            formatText = formatText.replace(new RegExp("\\{" + (indexArgument - 1) + "\\}", "gi"), arguments[indexArgument]);
        }

        return formatText;
    };

    var jsonLoader = function (fileLocation) {
        /// <summary>
        /// Asyncronously loads the content of JSON file, parses it into object and returns
        /// it as result.
        /// </summary>
        /// <param name="fileLocation">
        /// Location of JSON file that will be loaded and parsed.
        /// </param>
        /// <returns>
        /// A promise which completes when object is loaded from JSON file at given location.
        /// </returns>
        if (BingApp.Utilities.isNullOrUndefined(fileLocation)) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("fileLocation");
        }

        var xhrPromise;
        return new WinJS.Promise(
            function init(complete, error) {
                BingApp.traceInfo("Utilities.jsonLoader: started loading from {0} file.", fileLocation);

                xhrPromise = WinJS.xhr({ url: fileLocation });
                xhrPromise.done(
                    function (response) {
                        try {
                            var loadedObject = JSON.parse(response.responseText);
                        }
                        catch (err) {
                            BingApp.traceError("Utilities.jsonLoader: failed to parse JSON retrieved from {0} file.", fileLocation);
                            error(err);
                            return;
                        }
                        complete(loadedObject);
                    },
                    error);
            },
            function cancel() {
                BingApp.traceInfo("Utilities.jsonLoader: cancelling loading from {0} file.", fileLocation);
                if (xhrPromise) {
                    xhrPromise.cancel();
                }
            });
    };

    var isColdStart = function (executionState) {
        /// <summary>
        /// Determines whether app was started from the state that requires full initialization of its UI.
        /// </summary>
        /// <param name="executionState" type = "Windows.ApplicationModel.Activation.ApplicationExecutionState">
        /// App execution state that is passed with app activation event.
        /// </param>
        /// <returns type = "Boolean">
        /// True to indicate that application requires full initialization of its UI (i.e. "cold" start);
        /// otherwise, false.
        /// </returns>
        BingApp.traceVerbose("Utilities.isColdStart: executionState was {0}.", executionState);

        var stateNamespace = Windows.ApplicationModel.Activation.ApplicationExecutionState;
        return executionState !== stateNamespace.suspended && executionState !== stateNamespace.running;
    };

    var areEqualIgnoreCase = function (left, right) {
        /// <summary>
        /// Checks whether the two strings in argument are equal or not, ignoring the case of the
        /// letters.
        /// </summary>
        /// <param name="left" type="String">
        /// The left text to be compared with the right text.
        /// </param>
        /// <param name="right" type="String">
        /// The right text to be compared with the left text.
        /// </param>
        /// <returns type="Boolean">
        /// True if the two strings are equal, ignoring the case of the letters; false otherwise.
        /// </returns>
        if (BingApp.Utilities.isNullOrUndefined(left)) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("left");
        }
        if (BingApp.Utilities.isNullOrUndefined(right)) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("right");
        }
        return left.toUpperCase() === right.toUpperCase();
    };

    var invokeURI = function (uri) {
        /// <summary>
        /// Invokes application based on the URI supplied as an argument.
        /// </summary>
        /// <param name="uri">
        /// URI to launch application.
        /// </param>
        /// <returns type="WinJS.Promise">
        /// A promise which will complete when the launchUriAsync operation is done.
        /// </returns>
        if (!uri) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("uri");
        }

        var appUri;
        try {
            appUri = new Windows.Foundation.Uri(uri);
        } catch (err) {
            BingApp.traceError("invokeURI: Error creating a URI from {0} : fails with message = {1}.", uri, err.message);
            throw new BingApp.Classes.ErrorArgument("uri", "Error creating Windows.Foundation.Uri from passed in uri");
        }

        return Windows.System.Launcher.launchUriAsync(appUri);
    };

    var isWellformedDomain = function (domain) {
        /// <summary>
        /// Validates if the passed in domain is well formed
        /// </summary>
        /// <param name="domain">
        /// Domain to validate.
        /// </param>
        /// <returns type="boolean">
        /// Returns True if the domain is wellformed else returns False.
        /// </returns>
        if (BingApp.Utilities.isNullOrUndefined(domain)) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("domain");
        }

        var uri;
        try {
            uri = new Windows.Foundation.Uri(domain);
        } catch (error) {
            BingApp.traceError("isWellformedDomain: Error creating a URI from {0} : fails with message = {1}.", domain, error.message);
            return false;
        }

        return !uri.suspicious;
    }

    var getPageDimensions = function () {
        /// <summary>
        /// Gets the page width and height
        /// </summary>
        /// <returns>
        /// The page dimensions
        /// </returns>

        return { width: window.innerWidth, height: window.innerHeight };
    }

    var getCookie = function (cookie, cookieName, crumbName) {
        /// <summary>
        /// Returns the cookie, or crumb associated with a cookie, crumb is optional.
        /// </summary>
        /// <param name="cookie">cookies asscociated with domain</param>
        /// <param name="cookieName">optional sub cookie</param>
        /// <param name="crumbName">optional crumb from cookieName</param>
        /// <returns type = "string">
        /// A string containing the cookie value or crumb value
        /// </returns>
        if (BingApp.Utilities.isNullOrUndefined(cookie)) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("cookie");
        }

        var cookieMatch = cookie.match(new RegExp("\\b" + cookieName + "=[^;]+"));
        if (crumbName && cookieMatch) {
            var crumbMatch = cookieMatch[0].match(new RegExp("\\b" + crumbName + "=([^&]*)"));
            return crumbMatch ? crumbMatch[1] : null;
        }
        return cookieMatch ? cookieMatch[0] : null;
    }

    var getTimeStamp = function () {
        /// <summary>
        /// Returns the current getTimeStamp
        /// </summary>
        /// <returns type = "int">
        /// Returns the number of milliseconds since 00:00:00 Jan 1, 1970
        /// </returns>
        return new Date().getTime();
    }

    var ellipsify = function (domEl, maxHeight, text, ellipsis) {
        /// <summary>
        /// Given a DOM element and a maxHeight, creates ellipsed text that will fit within the maxHeight bounds
        /// </summary>
        /// <param name="domEl" type="HTMLElement">
        /// DOM element whose text will be adjusted so that element is below maxHeight
        /// </param>
        /// <param name="maxHeight" type="int">
        // Maximum height of DOM element
        /// </param>
        /// <param name="text" type="string">
        /// String to add ellipses to
        /// </param>
        /// <param name="ellipses" type="string">
        /// Ellipses string to use
        /// </param>
        
       if (domEl && domEl.clientHeight > maxHeight) {
            var threshold = 1.5;

            //if the text is way larger than the bounding container - chop of anything beyond estimated 130%
            if (domEl.clientHeight > maxHeight * threshold)
                text = text.substring(0, Math.floor(text.length * maxHeight * threshold / domEl.clientHeight));

            var words = text.split(/ |\r\n|\r|\n/);
            do {
                words.pop();
                domEl.innerHTML = window.toStaticHTML(words.join(" ").trim() + ellipsis);
            }
            while (domEl.clientHeight > maxHeight);
        }
    }

    function trim(str) {
        /// <summary>
        /// Trims white space from the string extremities.
        /// </summary>
        /// <param name="str" type="string">
        /// string to be trimmed.
        /// </param>
        /// <returns>
        /// Trimmed string
        /// </returns>
        return str.replace(/^\s+|\s+$/g, "");
    }


    function isKeyDownAndSpaceOrEnterKey(eventObj) {
        /// <summary>
        /// Returns true if either the event object type is not 
        /// keydown or if it is, only true if it's the space or enter key
        /// </summary>
        /// <returns>
        /// True if it's the space or enter key
        /// </returns>

        if (eventObj.type !== 'keydown' || (eventObj.which !== 32 && eventObj.which !== 13)) {
            return false;
        }

        return true;
    }

    // Expose utility functions via application namespace
    WinJS.Namespace.define("BingApp.Utilities", {
        format: format,
        jsonLoader: jsonLoader,
        isPromiseCancellationError: isPromiseCancellationError,
        isNullOrUndefined: isNullOrUndefined,
        isNotNullOrUndefined: isNotNullOrUndefined,
        isColdStart: isColdStart,
        areEqualIgnoreCase: areEqualIgnoreCase,
        invokeURI: invokeURI,
        isWellformedDomain: isWellformedDomain,
        getPageDimensions: getPageDimensions,
        getCookie: getCookie,
        getTimeStamp: getTimeStamp,
        ellipsify: ellipsify,
        trim: trim,
        isKeyDownAndSpaceOrEnterKey: isKeyDownAndSpaceOrEnterKey
    });
})();
