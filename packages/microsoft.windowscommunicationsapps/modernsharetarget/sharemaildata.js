
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Share, Jx, Windows*/
/*jshint browser:true*/

Share.MailData = function () {
    /// <summary>
    /// Share.MailData constructor.
    /// </summary>

    // Call base class constructor
    Share.BaseData.apply(this, arguments);

    this.containedDataFormats = [];
};

Jx.augment(Share.MailData, Share.BaseData);

Share.MailData.prototype.createDataLoader = function () {
    /// <summary>
    /// Creates the Mail-specific data loader that loads all data provided
    /// </summary>
    /// <returns type="Share.DataLoader"></returns>

    return new Share.MailDataLoader();
};

Share.MailData.prototype.calculateSubject = function () {
    /// <summary>
    /// Determines the subject based on the current dataPackage
    /// </summary>

    var helper = Share.BaseData;
    
    // Try to get the subject out of various fields (but if the subject is empty string, we'll still use it)
    var subject = this._tryGetProperty(this.shareOperation.data, "Subject");
    if (!Jx.isString(subject)) {
        subject = this._tryGetProperty(this.shareOperation.data, "subject");
        
        if (!Jx.isString(subject)) {
            subject = helper._tryGetTitle(this.shareOperation.data);
        }
    }

    this.subject = helper._truncateText(subject, Share.Constants.subjectMax);
};

Share.MailData.prototype.containsShareType = function (type) {
    /// <summary>
    /// Returns true when this data object contains the provided share type
    /// </summary>
    /// <param name="type" type="Windows.ApplicationModel.DataTransfer.StandardDataFormats">type of data to check for</param>
    /// <returns type="Boolean"></returns>

    return this.containedDataFormats.indexOf(type) !== -1;
};

Share.MailData.prototype.isEmpty = function () {
    /// <summary>
    /// Returns true when there is no data loaded into this object
    /// </summary>
    /// <returns type="Boolean"></returns>

    return this.containedDataFormats.length === 0;
};

Share.MailData.prototype.tryInitializeWithText = function (textData) {
    /// <summary>
    /// Adds the given text data to this object
    /// Returns false if the data is inadequate for use in share.  If false is returned, this object is not modified
    /// </summary>
    /// <param name="textData" type="String">text to put in the data object</param>
    /// <returns type="Boolean">False if no data was prefilled, True otherwise.</returns>

    var isValid = false;

    if (Jx.isNonEmptyString(textData)) {

        var messageHtml = Jx.escapeHtml(textData);
        isValid = Jx.isNonEmptyString(messageHtml.trim());

        if (isValid) {
            this.messageHtml = messageHtml;

            this.containedDataFormats.push(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text);
        }
    }

    return isValid;
};

Share.MailData.prototype.tryInitializeWithHtml = function (htmlData) {
    /// <summary>
    /// Adds the given html data to this object
    /// Returns false if the data is inadequate for use in share.  If false is returned, this object is not modified
    /// </summary>
    /// <param name="htmlData" type="String">html to put in the data object</param>
    /// <returns type="Boolean">False if no data was prefilled, True otherwise.</returns>

    var isValid = false;

    if (Jx.isNonEmptyString(htmlData)) {
        var messageHtml = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.getStaticFragment(htmlData);

        isValid = Jx.isNonEmptyString(messageHtml.trim());

        if (isValid) {
            // If we were able to get HTML, try to pull any style elements from the HTML so we can add them to the canvas as well
            var fullHtml = this._extractHtmlFromFragment(htmlData);
            if (fullHtml) {
                fullHtml = window.toStaticHTML(fullHtml);

                // Create a document fragment with the full HTML so we can query for the style elements
                var range = document.createRange(),
                    docFrag = range.createContextualFragment(htmlData),
                    styleElements = docFrag.querySelectorAll("style");

                // Prepend each style element (maintaining the order) to the messageHtml so it will get added to the canvas
                for (var i = styleElements.length; i--;) {
                    var styleElement = styleElements[i];
                    messageHtml = styleElement.outerHTML + messageHtml;
                }
            }

            this.messageHtml = messageHtml;

            this.containedDataFormats.push(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html);
        }
    }

    return isValid;
};

Share.MailData.prototype._extractHtmlFromFragment = function (htmlFragment) {
    /// <summary>
    /// Retrieves the full HTML contents from a CF_HTML fragment
    /// </summary>
    /// <param name="htmlFragment" type="String">html fragment string to parse</param>
    /// <returns type="String">the full HTML contents of the document fragment, or null if problems with the format of the fragment prevent parsing</returns>

    Share.mark("extractHtmlFromFragment", Share.LogEvent.start);

    var extractedHtml = null,
        startParam = htmlFragment.match(/StartHTML:\d+/i),
        endParam = htmlFragment.match(/EndHTML:\d+/i);

    // We should have both a start and end parameter, but if not, we got bad data
    if (startParam && endParam) {
        // Retrieve the offset numbers from the string
        var htmlOffsetStart = Number(startParam[0].slice(10)), // Remove "StartHTML:"
            htmlOffsetEnd = Number(endParam[0].slice(8)); // Remove "EndHTML:";

        // Offsets assume UTF-8 encoding
        var utf8HtmlFragment = window.unescape(encodeURIComponent(htmlFragment)),
            fragmentLength = utf8HtmlFragment.length;

        // Make sure the offsets we got make sense
        if (htmlOffsetStart <= fragmentLength && htmlOffsetEnd <= fragmentLength && htmlOffsetStart <= htmlOffsetEnd) {
            // The HTML Fragment sits between those two numbers in the htmlFragment
            var utf8Html = utf8HtmlFragment.slice(htmlOffsetStart, htmlOffsetEnd);

            // We need to reconvert the string before we can return it
            extractedHtml = decodeURIComponent(window.escape(utf8Html));
        } else {
            Jx.log.error("StartHTML " + htmlOffsetStart + " and EndHTML " + htmlOffsetEnd + " don't make sense for fragment of length " + fragmentLength);
        }
    } else {
        Jx.log.error("Malformed CF_HTML fragment, missing StartHTML or EndHTML");
    }

    Share.mark("extractHtmlFromFragment", Share.LogEvent.end);

    return extractedHtml;
};

Share.MailData.prototype.tryInitializeWithUri = function (uri) {
    /// <summary>
    /// Adds the given link data to this object
    /// </summary>
    /// <param name="uri" type="Windows.Foundation.Uri">Uri to add to this data object</param>

    var isValid = Jx.isObject(uri);

    if (isValid) {
        // Make sure we were given a web link
        var scheme = uri.schemeName.toLowerCase();
        isValid = scheme === "http" || scheme === "https";
        if (isValid) {
            this.uri = uri;
            this.containedDataFormats.push(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink);
        }
    }

    return isValid;
};

Share.MailData.prototype.tryInitializeWithFiles = function (files) {
    /// <summary>
    /// Adds the given files data to this object.
    /// Returns false if the data was inadequate for use in share.  If false is returned, this object is not modified.
    /// </summary>
    /// <param name="files" type="Array">Files to add.</param>
    /// <returns type="Boolean">False if no data was prefilled, True otherwise</returns>

    // Only validation we have for now is length of file list
    var isValid = Boolean(files) && (files.length > 0);

    if (isValid) {
        this.containedDataFormats.push(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems);
        
        this.storageItems = files;         
    } else {
        Jx.log.verbose("Received empty list of files from package");
    }

    return isValid;
};

Share.MailData.prototype.tryInitializeWithBitmap = function (bitmap) {
    /// <summary>
    /// Adds the given bitmap stream to this object.
    /// Returns false if the data was inadequate for use in share. If false is returned, this object is not modified.
    /// </summary>
    /// <param name="bitmap" type="Windows.Storage.Streams.RandomAccessStreamReference">Bitmap stream to add.</param>
    /// <returns type="Boolean">False if no data was prefilled, True otherwise</returns>

    var isValid = Boolean(bitmap);

    if (isValid) {
        this.containedDataFormats.push(Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap);

        this.bitmap = bitmap;
    } else {
        Jx.log.verbose("Received empty bitmap from package");
    }

    return isValid;
};

Share.MailData.prototype._tryGetProperty = function (dataPackageView, propertyName) {
    ///<summary>
    /// Given a data package, attempts to retrieve the given property
    ///</summary>
    ///<param name="dataPackageView" type="Windows.ApplicationModel.DataTransfer.DataPackageView">DataPackage from which the property should be retrieved</param>
    ///<param name="propertyName" type="String">Name of the property to retrieve</param>
    ///<returns>Property value, or null if the property was unable to be retrieved</returns>

    var value = null;
    if (dataPackageView.properties.hasKey(propertyName)) {
        value = dataPackageView.properties.lookup(propertyName);
    }

    return value;
};

Share.MailData.prototype.containedDataFormats = null; // The different data formats that this share data contains
Share.MailData.prototype.messageHtml = ""; // User message, in HTML format

Share.MailData.prototype.subject = "";
Share.MailData.prototype.mailMessage = null;
Share.MailData.prototype.account = null;
Share.MailData.prototype.platform = null;
Share.MailData.prototype.quickLink = null; // The quicklink to pass to the share platform.
Share.MailData.prototype.uri = null;
Share.MailData.prototype.storageItems = null;
Share.MailData.prototype.bitmap = null;
Object.defineProperty(Share.MailData.prototype, "sourceUri", {
    get: function () {
        return this.shareOperation.data.properties.contentSourceWebLink;
    }
});
