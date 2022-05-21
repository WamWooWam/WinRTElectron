
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="ShareAnything.ref.js" />
/// <reference path="ShareAnything.dep.js" />

Share.BaseData = /* @constructor */function (shareOperation) {
    /// <summary>
    /// Share.BaseData constructor.
    /// </summary>
    /// <param name="shareOperation" type="Windows.ApplicationModel.DataTransfer.ShareTarget.ShareOperation">ShareOperation for this request</param>

    var hasOperation = Boolean(shareOperation) && Boolean(shareOperation.data);

    Debug.assert(hasOperation, "Cannot construct a Share.Data object without the share operation");

    if (!hasOperation) {
        throw new Error("Cannot construct a Share.Data object without the share operation");
    }

    // The current share operation
    // Contains the share data package and quickLink data, and also needs to be kept around to pass to doneTransfer.
    this.shareOperation = shareOperation;

    this.errorCategory = Share.Constants.DataError.none;
    this._errorCode = 0;
};

Share.BaseData.prototype.loadDataAsync = function (formatOrder) {
    /// <summary>
    /// Asynchronously loads data from the share operation into this Share.SourceData object.
    /// </summary>
    /// <param name="formatOrder" type="Array">Ordered list of formats to look for in the DataPackage.  Array of String.</param>
    /// <returns type="WinJS.Promise">This promise is complete when the data is successfully loaded into this object. The promise has no return value on success.</returns>

    var dataLoader = this.createDataLoader(formatOrder);
	return dataLoader.loadDataAsync(this.shareOperation.data, this);
};

Share.BaseData.prototype.createDataLoader = function (formatOrder) {
    /// <summary>
    /// Creates a new data loader object
    /// </summary>
    /// <param name="formatOrder" type="Array">Ordered list of formats to look for in the DataPackage.  Array of String.</param>
    /// <returns type="Share.DataLoader"></returns>

    return new Share.DataLoader(formatOrder);
};

Share.BaseData.prototype.tryInitializeWithText = function (textData) {
    /// <summary>
    /// Adds the given text data to this object
    /// Returns false if the data is inadequate for use in share.  If false is returned, this object was not modified
    /// </summary>
    /// <param name="textData" type="String">text to put in the data object</param>
    /// <returns type="Boolean">False if no data was prefilled, True otherwise.</returns>

    return false;
};

Share.BaseData.prototype.tryInitializeWithHtml = function (htmlData) {
    /// <summary>
    /// Adds the given html data to this object
    /// Returns false if the data is inadequate for use in share.  If false is returned, this object was not modified
    /// </summary>
    /// <param name="htmlData" type="String">html to put in the data object</param>
    /// <returns type="Boolean">False if no data was prefilled, True otherwise.</returns>
    
    return false;
};

Share.BaseData.prototype.tryInitializeWithLink = function (linkData) {
    /// <summary>
    /// Adds the given link data to this object
    /// Returns false if the data is inadequate for use in share.  If false is returned, this object was not modified
    /// </summary>
    /// <param name="linkData" type="Share.LinkData">LinkData to add to this data object</param>
    /// <returns type="Boolean">False if no data was prefilled, True otherwise.</returns>

    return false;
};

Share.BaseData.prototype.tryInitializeWithFiles = function (files) {
    /// <summary>
    /// Adds the given files data to this object.
    /// Returns false if the data was inadequate for use in share.  If false is returned, this object is not modified.
    /// </summary>
    /// <param name="files" type="Array">Files to add.</param>
    /// <returns type="Boolean">False if no data was prefilled, True otherwise</returns>

    return false;
};

Share.BaseData.prototype.recordError = function (errorMessage, errorCategory, exception, errorCode) {
    /// <summary>
    /// Stores error state.
    /// Intended for use when specifying that some error has occurred while loading data.
    /// If errorMessage is passed in, also logs error using Jx.log.error/exception
    /// </summary>
    /// <param name="errorMessage" type="String">Non-user facing error message suitable for logs. Specifying this param causes the error to be logged.</param>
    /// <param name="errorCategory" type="String">Share.Constants.DataError value representing the category of error</param>
    /// <param name="exception" type="Error" optional="true">Exception associated with this error</param>
    /// <param name="errorCode" type="Number" optional="true">Optional error code associated with error.  If not specified, it will attempt to be pulled out of the exception.</param>

    // default error code to unknown
    var finalErrorCode = Share.Constants.ErrorCode.unknownError;

    if (errorMessage) {
        // Log error

        if (exception) {
            Jx.log.exception(errorMessage, exception);
        } else {
            Jx.log.error(errorMessage);
        }
    }

    if (Boolean(exception) && Boolean(exception.number)) {
        finalErrorCode = exception.number;
    }

    // the errorCode param overrides any error from the exception
    if (errorCode) {
        finalErrorCode = errorCode;
    }

    Debug.assert(errorCategory === Share.Constants.DataError.invalidFormat || errorCategory === Share.Constants.DataError.internalError, "Unexpected errorCategory: " + errorCategory);

    this.errorCategory = errorCategory;
    this._errorCode = finalErrorCode;
};

Share.BaseData.prototype.getErrorCodeString = function () {
    /// <summary>
    /// Converts the current errorCode into a hex string suitable for display
    /// </summary>
    /// <param name="errorCode" type="Number">Error code to be converted to hex string</param>
    /// <returns type="String">Hex string representation of number, or null if no error code.</returns>

    var positiveNumber;
    var errorCode = this._errorCode;

    if (!Jx.isNumber(errorCode) || errorCode === 0 || errorCode === Share.Constants.ErrorCode.unknownError) {
        // It's possible we don't have an error code; null is the expected response.
        return null;
    }

    if (errorCode < 0) {
        // Convert to a positive number while keeping the bits the same
        positiveNumber = 0xFFFFFFFF + errorCode + 1;
    } else {
        positiveNumber = errorCode;
    }

    var numberString = positiveNumber.toString(16);

    // Make sure the string is at least 8 characters long (standard hex error code length) by prepending 0's
    while (numberString.length < 8) {
        numberString = "0" + numberString;
    }

    // prepend 0x
    numberString = "0x" + numberString.toUpperCase();

    return numberString;
};

// "Static" helper methods related to getting data out of the package

Share.BaseData._tryGetTitle = function (dataPackageView) {
    ///<summary>
    /// Given a data package, attempts to retrieve the title
    ///</summary>
    ///<param name="dataPackageView" type="Windows.ApplicationModel.DataTransfer.DataPackageView">DataPackage from which the property should be retrieved</param>
    ///<returns type="String">Title, or null if the title was unable to be retrieved</returns>

    var value = null;
    try {
        value = dataPackageView.properties.title;
    } catch (e) {
        // Title is supposed to be required, this should not happen.
        Jx.log.exception("Share.BaseData._tryGetTitle: error retrieving title from data package", e);
    }

    return value;
};

Share.BaseData._truncateText = function (text, lengthLimit) {
    ///<summary>
    /// Trim and Truncate input text if it is over the length limit.
    ///</summary>
    ///<param name="text" type="String">Text to truncate</param>
    ///<param name="lengthLimit" type="Number">Maximum length of returned string</param>
    ///<returns type="String">returns the truncated and trimmed string.</returns>

    text = text.trim();
    if (text.length > lengthLimit) {
        text = text.substring(0, lengthLimit);
    }
    return text;
};

Share.BaseData.prototype.shareOperation = /*@static_cast(Windows.ApplicationModel.DataTransfer.ShareTarget.ShareOperation)*/null;
Share.BaseData.prototype.errorCategory = "";
