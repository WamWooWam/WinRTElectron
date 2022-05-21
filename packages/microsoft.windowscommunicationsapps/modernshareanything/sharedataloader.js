
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="ShareAnything.dep.js" />

Share.DataLoader = /* @constructor */function (formatOrder) {
    /// <param name="formatOrder" type="Array">Ordered list of formats to look for in the DataPackage.  Array of String.</param>

    this._formatOrder = formatOrder;
};

// Parameters for loading data
Share.DataLoader.prototype._dataPackage = /* @static_cast(Windows.ApplicationModel.DataTransfer.DataPackageView) */null;
Share.DataLoader.prototype._shareData = /*@static_cast(Share.BaseData)*/null;

// State: current stage of loading, current load promise
Share.DataLoader.prototype._started = false;
Share.DataLoader.prototype._canceled = false;
Share.DataLoader.prototype._completed = false;
Share.DataLoader.prototype._error = /*@static_cast(Error)*/null; // If this is non-null, we're done and have an error result.
Share.DataLoader.prototype._currentLoadPromise = /*@static_cast(WinJS.Promise)*/null;

// Callbacks
Share.DataLoader.prototype._successCallback = /*@static_cast(Function)*/null;
Share.DataLoader.prototype._errorCallback = /*@static_cast(Function)*/null;

Share.DataLoader.prototype.loadDataAsync = function (dataPackage, shareData) {
    /// <summary>
    /// Asynchronously loads information from the Windows DataPackage into the given object.
    /// </summary>
    /// <param name="dataPackage" type="Windows.ApplicationModel.DataTransfer.DataPackageView">Windows DataPackage containing data to put into the data object</param>
    /// <param name="shareData" type="Share.BaseData">Object to be filled with the information from the Windows DataPackage</param>
    /// <returns type="WinJS.Promise">
    /// Returns a promise which completes once the data is populated. This promise will not return any value on success.
    /// </returns>

    if (this._started) {
        throw new Error("Usage error: each instance of DataLoader can only load data once.");
    }

    this._started = true;
    this._dataPackage = dataPackage;
    this._shareData = shareData;

    try {
        // Hot async: start work now, as the consumer creates the async task, not when they call "then".
        // Start loading the data at index 0.
        this.beginLoading();
    } catch (e) {
        // Make sure error callback is called on exception (see below)
        this.callError(e);
    }

    // Note that this promise may actually complete before the caller calls "then" (loadDataAsyncThen, below).
    // We take this into account by saving the _completed state in this object, and making sure to call the success callback either:
    // - If things are ready before "then", call callback immediately upon receiving the it in "then", or
    // - If "then" was called before the promise is complete, callCompleted calls the callback.

    // The error callback works similarly.
    // We don't have any expected scenarios for the error callback - a failure to find data is a "success".  Only exceptions call the error callback.

    var that = this;
    return new WinJS.Promise(
        function DataLoader_loadDataAsyncThen(complete, error) {
            /// <summary>
            /// This is the .then callback for the promise - the caller uses this to pass in the completed and error callbacks.
            /// </summary>
            /// <param name="completed" type="Function">Completed callback</param>
            /// <param name="error" type="Function">Error callback</param>

            // Save callbacks into local instance, and call them if the work is already complete.
            that._successCallback = complete;
            that._errorCallback = error;

            if (that._completed) {
                that._successCallback();
            };
            
            if (that._error) {
                that._errorCallback(that._error);
            };
        }, 
        function DataLoader_loadDataAsyncCancel() {
            /// <summary>
            /// This is the .cancel callback for the promise - the caller uses this to cancel the data load.
            /// </summary>
            /// <remarks>The promise base class will throw a "canceled" error and call the error callback, no need to do that here.</remarks>

            // Set canceled flag; internal methods will check this before doing work.
            that._canceled = true;

            if (that._currentLoadPromise) {
                that._currentLoadPromise.cancel();
                that._currentLoadPromise = null;
            }
        }
    );
};

Share.DataLoader.prototype.callCompleted = function () {
    /// <summary>
    /// Calling this method indicates that the data loading is complete.
    /// It will call the completed callback if it's ready.
    /// </summary>

    if (this._canceled) {
        // Caller will not expect a completed callback after calling cancel.
        return;
    }

    this._completed = true;
    if (this._successCallback) {
        this._successCallback();
    }
};

Share.DataLoader.prototype.callError = function (error) {
    /// <summary>
    /// Calling this method indicates that loading is "complete" with the given error.
    /// It will call the error callback if it is ready.
    /// </summary>
    /// <param name="error" type="Error">The error that occurred</param>

    if (this._canceled) {
        // Caller will not expect an error callback after calling cancel.
        return;
    }

    this._error = error;
    if (this._errorCallback) {
        this._errorCallback(error);
    }
};

Share.DataLoader.prototype.beginLoading = function () {
    /// <summary>
    /// Begins the data load process
    /// </summary>

    this._loadDataInOrder(0);
};

Share.DataLoader.prototype._loadDataInOrder = function (formatIndex) {
    /// <summary>
    /// Internal method to load data in appropriate order (recursive).
    /// Stops when it finds data that succeeds at validation, or can't find any of the configured formats in the package.
    /// </summary>
    /// <param name="formatIndex" type="Number">Which format to start looking at in the format array</param>

    if (this._canceled) {
        // If the caller has canceled the operation, don't do anything.
        return;
    }

    // This method loops through the configured formats in order (via recursion).
    // If it finds data to load, it starts loading it.
    // The async data load callbacks check to see if the data is valid, and if not valid, this function will be called again at the next format index.
    // When finished, calls callCompleted.

    var formatOrder = this._formatOrder;

    Debug.assert(this._currentLoadPromise === null, "Share.DataLoader internal error: should not hit _loadDataInOrder while there is a loading promise running");

    // this._currentLoadPromise is set here as the promise used to load the current format. 
    // It also indicates that there is a load currently running (only one load runs at a time).
    // If we don't find the current format, we'll get to the end without setting _currentLoadPromise and this method will be called again.

    var nextIndex = formatIndex + 1;

    // Need local state for this since callbacks modify currentLoadPromise and they can be called inline
    // Indicates whether we've started up a loading promise
    var startedLoading = false;

    if (formatIndex < formatOrder.length) {
        var format = formatOrder[formatIndex];
        Jx.log.verbose("Share.DataLoader looking for format: " + format);
        if (this._dataPackage.contains(format)) {
            Jx.log.verbose("Share.DataLoader found format " + format + ", loading format.");

            if (format === Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink) {
                startedLoading = true;
                this._currentLoadPromise = this._dataPackage.getWebLinkAsync();
                this._currentLoadPromise.
                    then(
                        this._getUriCallback(nextIndex), 
                        this._getFailureCallback(format, nextIndex)
                    );
            } else if (format === Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems) {
                startedLoading = true;
                this._currentLoadPromise = this._dataPackage.getStorageItemsAsync();
                this._currentLoadPromise.
                    then(
                        this._getStorageItemsCallback(nextIndex),
                        this._getFailureCallback(format, nextIndex)
                    );
            } else if (format === Windows.ApplicationModel.DataTransfer.StandardDataFormats.html) {
                startedLoading = true;
                this._currentLoadPromise = this._dataPackage.getHtmlFormatAsync();
                this._currentLoadPromise.
                    then(
                        this._getHtmlCallback(nextIndex),
                        this._getFailureCallback(format, nextIndex)
                    );
            } else if (format === Windows.ApplicationModel.DataTransfer.StandardDataFormats.text) {
                startedLoading = true;
                this._currentLoadPromise = this._dataPackage.getTextAsync();
                this._currentLoadPromise.
                    then(
                        this._getTextCallback(nextIndex), 
                        this._getFailureCallback(format, nextIndex)
                    );
            } else {
                // The format wasn't a format that we know how to handle.  This is not expected, we're iterating through config values.
                Debug.assert(false, "Share.DataLoader: format type not recognized: " + format);
                Jx.fault("ShareAnything.ShareDataLoader.js", "UnrecognizedConfigFormat");

                // Code will continue looking at next format in the configurable format list
            }
        }
    }
    
    if (!startedLoading) {
        // We didn't find data to load for the current format

        // Try again if there is a next format
        if (nextIndex < formatOrder.length) {
            Jx.log.verbose("Share.DataLoader calling loadDataInOrder with next index because there was no promise");
            this._loadDataInOrder(nextIndex);
        } else {
            Jx.log.info("Share.DataLoader was not able to find any data to use in the data package.");
            this._shareData.recordError(null /*don't log*/, Share.Constants.DataError.invalidFormat);
            this.callCompleted();
        }
    }
};

Share.DataLoader.prototype._getFailureCallback = function (formatType, nextIndex) {
    /// <summary>
    /// Returns a function that can be used as the error callback for data loading failure
    /// </summary>
    /// <param name="formatType" type="String">Format type being loaded</param>
    /// <param name="nextIndex" type="Number">Next index to try loading</param>
    /// <returns type="Function">Error callback for data loading failure</returns>
    
    var that = this;
    return function DataLoader_loadDataCallbackFailure(error) {
        /// <param name="error">Error encountered while loading data</param>

        try {
            Jx.log.exception("Share.DataLoader: Error loading from dataPackage for type: " + formatType, error);

            that._currentLoadPromise = null;
            if (!that._canceled) {
                Jx.log.verbose("Share.DataLoader: Data load callback failure.  Trying next format.");
                that._loadDataInOrder(nextIndex);
            }
        } catch (e) {
            // Make sure the error callback is called
            that.callError(e);
        }
    };
};

Share.DataLoader.prototype._getStorageItemsCallback = function (nextIndex) {
    /// <summary>
    /// Returns a function that can be used as the storageItems load callback
    /// </summary>
    /// <param name="nextIndex">Next index to try loading if validation fails</param>
    /// <returns type="Function">Success callback for storageItems load</returns>

    var that = this;
    return function DataLoader_getStorageItemsThen(filesResult) {
        ///<param name="filesResult" type="Array">Loaded file list</param>

        try {
            // Clear out the loading promise since it's complete.
            that._currentLoadPromise = null;

            // Check the data - if the data is good, call the completed method.  If not, try loading the next format.
            var isValid = that._shareData.tryInitializeWithFiles(filesResult);
            if (!isValid) {
                Jx.log.verbose("Share.DataLoader failed to validate storageItems format, trying next format");
                that._loadDataInOrder(nextIndex);
            } else {
                Jx.log.info("Share.DataLoader successfully added storageItems information to data object");                                
                that.callCompleted();
            }
        } catch (e) {
            // Make sure the error callback is called
            that.callError(e);
        }
    };
};

Share.DataLoader.prototype._getUriCallback = function (nextIndex) {
    /// <summary>
    /// Returns a function that can be used as the URI load callback
    /// </summary>
    /// <param name="nextIndex">Next index to try loading if validation fails</param>
    /// <returns type="Function">Success callback for URI load</returns>

    var that = this;
    return function DataLoader_getUriThen(uriResult) {
        ///<param name="uriResult" type="Windows.Foundation.Uri">Loaded URI</param>

        try {
            // Clear out the loading promise since it's complete
            that._currentLoadPromise = null;

            // Check the data - if the data is good, call the completed method.  If not, try loading the next format.
            var linkData = new Share.LinkData();
            var isValid = linkData.tryInitialize(uriResult, that._dataPackage);

            if (isValid) {
                isValid = that._shareData.tryInitializeWithLink(linkData);
            }

            if (!isValid) {
                // Error, continue trying other formats
                Jx.log.info("Share.DataLoader failed to validate URI format, trying next format");
                that._loadDataInOrder(nextIndex);
            } else {
                Jx.log.info("Share.DataLoader successfully added URI data to data object");
                that.callCompleted();
            }
        } catch (e) {
            // Make sure the error callback is called
            that.callError(e);
        }
    };
};

Share.DataLoader.prototype._getHtmlCallback = function (nextIndex) {
    /// <summary>
    /// Returns a function that can be used as the HTML load callback
    /// </summary>
    /// <param name="nextIndex">Next index to try loading if validation fails</param>
    /// <returns type="Function">Success callback for HTML load</returns>

    var that = this;
    return function DataLoader_getHtmlThen(htmlResult) {
        ///<param name="htmlResult" type="String">Loaded html data</param>

        try {
            // Clear out the current loading promise since it's completed
            that._currentLoadPromise = null;

            // Check the data - if the data is good, call the completed method.  If not, try loading the next format.
            var isValid = that._shareData.tryInitializeWithHtml(htmlResult);
            if (!isValid) {
                Jx.log.verbose("Share.DataLoader failed to validate html format, trying next format");
                that._loadDataInOrder(nextIndex);
            } else {
                Jx.log.info("Share.DataLoader successfully added html information to data object");
                that.callCompleted();
            }
        } catch (e) {
            // Make sure the error callback is called
            that.callError(e);
        }
    };
};

Share.DataLoader.prototype._getTextCallback = function (nextIndex) {
    /// <summary>
    /// Returns a function that can be used as the text load callback
    /// </summary>
    /// <param name="nextIndex">Next index to try loading if validation fails</param>
    /// <returns type="Function">Success callback for text load</returns>

    var that = this;
    return function DataLoader_loadDataInOrder_getTextThen(textResult) {
        ///<param name="textResult" type="String">Loaded text</param>

        try {
            // Clear out the current load promise since it's just finished
            that._currentLoadPromise = null;

            // Check the data - if it's good, call completed.  If not, try loading the next format.
            var isValid = that._shareData.tryInitializeWithText(textResult);
            if (!isValid) {
                Jx.log.info("Share.DataLoader failed to validate text format, trying next format");
                that._loadDataInOrder(nextIndex);
            } else {
                Jx.log.info("Share.DataLoader successfully added Text data to data object");
                that.callCompleted();
            }
        } catch (e) {
            // Make sure the error callback is called
            that.callError(e);
        }
    };
};
