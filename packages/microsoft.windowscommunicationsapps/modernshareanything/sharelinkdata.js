
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="ShareAnything.dep.js" />

Share.LinkData = /*@constructor*/function () {
    ///<summary>
    /// Share.LinkData constructor: LinkData stores link-related data
    /// Intended for use with the Share.Preview component
    ///</summary>
};

Share.LinkData.prototype.populateSoxeData = function (/* @dynamic*/soxeData) {
    ///<summary>
    /// Populates LinkData with the SOXE data.
    ///</summary>
    /// <param name="soxeData">Soxe data object.</param>

    var helper = Share.BaseData;

    if (Jx.isObject(soxeData)) {

        if (Jx.isArray(soxeData.images)) {
            this.images = soxeData.images;
        }

        if (Jx.isNonEmptyString(soxeData.title)) {
            this.title = helper._truncateText(soxeData.title, Share.Constants.titleMax);
        }

        if (Jx.isNonEmptyString(soxeData.description)) {
            // Allow the description to fall back to the previously entered data package description if SOXE doesn't have one.
            this.description = helper._truncateText(soxeData.description, Share.Constants.descriptionMax);       
        }

        if (soxeData.category === "directimage") {
            this.isDirectImage = true;
        }

        // Any consumer of Share.LinkData is expected to handle any special processing around videoUrl
        // For example, the URL should probably be considered a video if there is a videoUrl regardless of presence/absence of the other video properties.

        if (Jx.isNonEmptyString(soxeData.videoUrl)) {
            this.videoUrl = soxeData.videoUrl;
        }

        if (Jx.isNonEmptyString(soxeData.videoHeight)) {
            this.videoHeight = soxeData.videoHeight; 
        }

        if (Jx.isNonEmptyString(soxeData.videoWidth)) {
            this.videoWidth = soxeData.videoWidth; 
        }

        if (Jx.isNonEmptyString(soxeData.flashParams)) {
            this.flashParams = soxeData.flashParams; 
        }

        if (Jx.isNonEmptyString(soxeData.mimeType)) {
            this.embedType = soxeData.mimeType; 
        }
    }
};

Share.LinkData.prototype.tryInitialize = function (uri, dataPackage) {
    ///<summary>
    /// Initializes object with loaded URI and data package information
    /// Returns false if the data is inadequate for use in share.  If false is returned, the Share.LinkData object is not modified
    ///</summary>
    ///<param name="uri" type="Windows.Foundation.Uri">URI to put in the data object</param>
    /// <param name="dataPackage" type="Windows.ApplicationModel.DataTransfer.DataPackageView">Sharing data package containing title, description, and subject</param>
    ///<returns type="Boolean">False if no data was prefilled, True otherwise.</returns>

    var url;

    var helper = Share.BaseData;

    // Validate the URI and translate to string.
    try {
        if (uri !== null) {
            // First, check the scheme for http, https - that's what we support.  We don't want to allow sharing of any other type.
            var scheme = uri.schemeName;
            if (scheme !== "http" && scheme !== "https") {
                Jx.log.info("Share.LinkData.tryInitialize: Uri was unsupported scheme: " + uri.rawUri);
            } else {
                // Convert the URI into a string, since we're not using any of the URI properties.

                // This would throw if we managed to get a non-absolute URI, but it doesn't seem like it's possible to do that.
                url = uri.absoluteUri;
            }
        }
    } catch (e) {
        // This is possibly a non-absolute URI, or not a URI.  
        // Probably a bug or unexpected input from the sharing source rather than this code.
        Jx.log.exception("Share.LinkData.tryInitialize: error converting URI property to string", e);
    }

    if (Jx.isNonEmptyString(url)) {
        url = url.trim();
    }

    var isValid = Jx.isNonEmptyString(url);

    if (isValid) {
        // Only change this object if we've got a valid URL
        this.url = url;

        var title = helper._tryGetTitle(dataPackage);
        var description = this._tryGetDescription(dataPackage);

        // Modify title/description if necessary

        // If the title is empty, then replace it with the URL.
        if (Jx.isNonEmptyString(title)) {
            title = title.trim();
        }
        if (!Jx.isNonEmptyString(title)) {
            title = url;
        }

        // Set title, first truncate if necessary.
        if (Jx.isNonEmptyString(title)) {
            title = helper._truncateText(title, Share.Constants.titleMax);
            this.title = title;
        }

        // Set description, first truncate if necessary.
        if (Jx.isNonEmptyString(description)) {
            description = helper._truncateText(description, Share.Constants.descriptionMax);
            this.description = description;
        }
    }

    return isValid;
};

Share.LinkData.prototype._tryGetDescription = function (dataPackageView) {
    ///<summary>
    /// Given a data package, attempts to retrieve the title
    ///</summary>
    ///<param name="dataPackageView" type="Windows.ApplicationModel.DataTransfer.DataPackageView">DataPackage from which the property should be retrieved</param>
    ///<returns>Description, or null if the description was unable to be retrieved</returns>

    var value = null;
    try {
        value = dataPackageView.properties.description;
    } catch (e) {
        // Description is not required, this is not necessarily an error.
        Jx.log.exception("Share.LinkData._tryGetDescription: error retrieving description from data package: ", e);
    }

    return value;
};

Share.LinkData.prototype.title = ""; // Object title
Share.LinkData.prototype.description = ""; // Object description
Share.LinkData.prototype.url = ""; // Object URL
Share.LinkData.prototype.thumbnailUrl = ""; // Object thumbnail URL
Share.LinkData.prototype.videoHeight = ""; // Video-url metadata
Share.LinkData.prototype.videoWidth = ""; // Video-url metadata
Share.LinkData.prototype.videoUrl = ""; // Video-url metadata
Share.LinkData.prototype.flashParams = ""; // Video-url metadata
Share.LinkData.prototype.embedType = ""; // Video-url metadata
Share.LinkData.prototype.imgHeight = ""; // imgHeight
Share.LinkData.prototype.imgWidth = ""; // imgWidth
Share.LinkData.prototype.isDirectImage = false; // Indicates whether the data represents a direct link to an image (e.g. URL ending in .png)
Share.LinkData.prototype.images = []; // Array of image URLs