
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Share, Jx, Windows, WinJS*/

Share.MailDataLoader = function () {
    // Call base class constructor
    Share.DataLoader.apply(this, arguments);
};

Jx.augment(Share.MailDataLoader, Share.DataLoader);

Share.MailDataLoader.prototype.beginLoading = function () {
    /// <summary>
    /// This function loads the HTML, WebLink, and StorageFiles properties asynchronously
    /// If the HTML and WebLink properties are empty, it loads the Text property
    /// If the files property is empty, it loads the Bitmap property
    /// </summary>

    var dataFormat = Windows.ApplicationModel.DataTransfer.StandardDataFormats;

    // Retrieve the basic data
    var uriPromise = this._createDataLoadPromise(dataFormat.webLink, this._dataPackage.getWebLinkAsync, this._shareData.tryInitializeWithUri),
        htmlPromise = this._createDataLoadPromise(dataFormat.html, this._dataPackage.getHtmlFormatAsync, this._shareData.tryInitializeWithHtml),
        filesPromise = this._createDataLoadPromise(dataFormat.storageItems, this._dataPackage.getStorageItemsAsync, this._shareData.tryInitializeWithFiles);

    // Retrieve the text if the WebLink and HTML were empty
    var textPromise = WinJS.Promise.join([uriPromise, htmlPromise]).then(function () {
        // We only need to retrieve the text if there was no valid WebLink or HTML content loaded
        if (this._shareData.containsShareType(dataFormat.webLink) || this._shareData.containsShareType(dataFormat.html)) {
            return WinJS.Promise.as(null);
        } else {
            return this._createDataLoadPromise(dataFormat.text, this._dataPackage.getTextAsync, this._shareData.tryInitializeWithText);
        }
    }.bind(this),
    function (error) {
        Jx.log.exception("Share.MailDataLoader: Error joining WebLink and HTML Promises", error);
    });

    // Retrieve the bitmap if the files were empty
    var bitmapPromise = filesPromise.then(function () {
        // We only care about the bitmap data if there is no file data
        if (this._shareData.containsShareType(dataFormat.storageItems)) {
            return WinJS.Promise.as(null);
        } else {
            return this._createDataLoadPromise(dataFormat.bitmap, this._dataPackage.getBitmapAsync, this._shareData.tryInitializeWithBitmap);
        }
    }.bind(this),
    function (error) {
        Jx.log.exception("Share.MailDataLoader: Error in files promise", error);
    });

    // Wait for all promises to finish before completing
    WinJS.Promise.join([bitmapPromise, textPromise]).then(function () {
        if (this._shareData.isEmpty()) {
            Jx.log.info("Share.DataLoader was not able to find any data to use in the data package.");
            this._shareData.recordError(null /*don't log*/, Share.Constants.DataError.invalidFormat);
        }
        // Calculate the subject based on the existing data
        this._shareData.calculateSubject();

        this.callCompleted();
    }.bind(this),
    function (error) {
        this.callError(error);
    }.bind(this));
};

Share.MailDataLoader.prototype._createDataLoadPromise = function (format, loadFunction, initializeFunction) {
    /// <summary>
    /// Checks if the given format is in the data package, and if so, returns a promise created by the provided function.
    /// Otherwise, it returns an empty promise.
    /// </summary>
    /// <param name="format" type="Windows.ApplicationModel.DataTransfer.StandardDataFormats">Format to load</param>
    /// <param name="loadFunction" type="function">Function used to load the given format; must return a promise</param>
    /// <param name="initializeFunction" type="function">Function used to initialize the data; must return a boolean indicating if the data was valid</param>

    if (this._dataPackage.contains(format)) {
        return loadFunction.apply(this._dataPackage).then(
            function (result) {
                try {
                    var isValid = initializeFunction.apply(this._shareData, [result]);

                    if (!isValid) {
                        // Error, continue trying other formats
                        Jx.log.info("Share.MailDataLoader failed to validate format: " + format);
                    } else {
                        Jx.log.info("Share.MailDataLoader successfully added to data object format: " + format);
                    }
                } catch (e) {
                    // Make sure the error callback is called
                    this.callError(e);
                }
            }.bind(this),
            function (error) {
                Jx.log.exception("Share.MailDataLoader: Error loading from dataPackage for type: " + format, error);
            });
    } else {
        return WinJS.Promise.as(null);
    }
};
