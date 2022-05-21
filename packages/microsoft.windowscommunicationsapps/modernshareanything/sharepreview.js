
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="ShareAnything.ref.js" />
/// <reference path="ShareAnything.dep.js" />

Share.Preview = /* @constructor */function (linkData, soxeUrl) {
    ///<summary>
    /// SharePreview constructor.  Call using new.
    /// SharePreview is a component that controls the preview area of the share UI.
    ///</summary>
    ///<param name="linkData" type="Share.LinkData">Information about the link to display, should minimally contain "url", optionally "title" and "description"</param>
    ///<param name="soxeUrl" type="String">URL to the SOXE service</param>

    // Verify that "this" is an object of the correct type
    if (/* @static_cast(Function) */this.constructor !== Share.Preview) {
        throw new Error("Share.Preview is a constructor; it must be called using new.");
    }

    if (!linkData || !Jx.isNonEmptyString(linkData.url)) {
        Debug.assert(false, "Share.Preview requires a linkData parameter with url set");
        throw new Error("Share.Preview requires a linkData parameter with url set");
    }

    this._imgArray = [];

    this.initComponent();

    // Save the data locally
    this._soxeUrl = soxeUrl;

    // There is only one Share.Preview allowed per page.  This ID matches the ID of the element in the .html file.
    this._id = "sharePreview";
    this._linkData = linkData;

    this._soxePromise = /*@static_cast(WinJS.Promise)*/null;

    // This event will fire when the SOXE data has finished loading, and the preview is ready to render.
    Debug.Events.define(this, "soxeComplete");
};

Jx.augment(Share.Preview, Jx.Component);
Jx.augment(Share.Preview, Jx.Events);

Share.Preview.prototype.activateUI = function () {
    /// <summary>
    /// activateUI contains initialization that occurs after the UI is present.
    /// </summary>

    // Verify that "this" is an object of the correct type before use
    if (/* @static_cast(Function) */this.constructor !== Share.Preview) {
        throw new Error("activateUI references this; use bind if you cache this method.");
    }

    Jx.Component.prototype.activateUI.call(this);

    if (!this._uiInitialized) {

        this._uiInitialized = true;

        // Bind event handlers
        var proto = Share.Preview.prototype;
        this._cancelHandler = proto._cancelHandler.bind(this);
        this.pageHandler = proto.pageHandler.bind(this);
        this._imgOnLoadEvent = proto._imgOnLoadEvent.bind(this);
        this._errorLoadingImage = proto._errorLoadingImage.bind(this);

        if (this._soxeComplete) {
            // If we've already finished loading, render the preview.

            if (this._hasSoxeData) {
                this._renderWithSoxeData();
            } else {
                this._noSoxeDataRender();
            }

        } else {
            // No data: attach loading close button behavior
            var closeButton = document.getElementById("sharePVClose");

            // It's possible the close button isn't present because SOXE catastrophically failed and the preview UI is rendered already.
            if (closeButton) {
                closeButton.addEventListener("click", this._cancelHandler, false);
            }
        }
    }
};

Share.Preview.prototype.setAuth = function (ticket) {
    /// <summary>
    /// Informs the preview of the auth ticket
    /// The preview will start loading SOXE data at this point.
    /// </summary>
    /// <param name="ticket" type="String">Passport ticket. If null/empty, will continue rendering the preview without SOXE data.</param>

    if (this._soxeComplete || Boolean(this._soxePromise)) {
        // setAuth can only be called once
        return;
    }

    var authTicket = ticket;

    // Get the market for the user
    /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
    var market = Microsoft.WindowsLive.Market.get(Microsoft.WindowsLive.FallbackLogic.language);
    /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
    
    // Call SOXE for data on url.
    if (Jx.isNonEmptyString(authTicket) && Jx.isNonEmptyString(this._linkData.url)) {
        Jx.log.verbose("SharePreview: using auth ticket to start SOXE call");
        this._soxePromise = Share.SOXE.beginSOXERequest(this._linkData.url, authTicket, this._soxeUrl, market);
        var soxeCallback = this._soxeCallback.bind(this);
        var soxeErrorCallback = this._soxeErrorCallback.bind(this);
        // Using msSetImmediate removes the callback from the promise call stack, allowing any errors to propagate up to the global window error handler.
        this._soxePromise.then(
            function soxeThen(result) { msSetImmediate(soxeCallback, result); },
            function soxeError(result) { msSetImmediate(soxeErrorCallback, result); }
        );
    } else {
        // For Mail, the relevant error should already have been recorded in ShareTarget.js where the auth actually failed.
        // Still recording this here since this is a shared component
        Jx.fault("ShareAnything.SharePreview.NoLinkData", "NoSoxeAuth");

        // Not calling SOXE
        this._soxeComplete = true;

        if (this.hasUI()) {
            this._noSoxeDataRender();
        }
    }
};

Share.Preview.prototype.deactivateUI = function () {
    /// <summary>
    /// deactivateUI tears down any connections between the component and the UI
    /// </summary>

    // Verify that "this" is an object of the correct type before use
    if (/* @static_cast(Function) */this.constructor !== Share.Preview) {
        throw new Error("deactivateUI references this; use bind if you cache this method.");
    }

    if (this._soxePromise) {
        this._soxePromise.cancel();
        this._soxePromise = null;
    }

    if (this._uiInitialized) {

        // Once the user is able to change information in the preview, we should
        // save the current data in _data at this point.
        // This will allow it to be re-shown in activateUI, and will also allow getData to work while the UI is not initialized.
        // However, right now, there is no need to do that.  

        this._cleanupFlipView();

        var closeButton = document.getElementById("sharePVClose");
        if (closeButton) {
            closeButton.removeEventListener("click", this._cancelHandler, false);
        }
        this._cancelHandler = null;

        this._uiInitialized = false;
    }

    Jx.Component.prototype.deactivateUI.call(this);
};

Share.Preview.prototype.isVisible = function () {
    /// <summary>
    /// Returns true if this control is visible.
    /// </summary>
    /// <returns type="Boolean">true if visible</returns>

    return this._previewVisible;
};

Share.Preview.prototype.focus = function () {
    /// <summary>Sets the focus on this control.</summary>

    var flipViewElement = document.getElementById("share-pvFlipView");
    if (flipViewElement) {
        flipViewElement.focus();
    }
};

Share.Preview.prototype._cleanupFlipView = function () {
    /// <summary>
    /// Cleans up variable references / events / etc related to the FlipView.
    /// </summary>
    /// <remarks>Can be called multiple times.</remarks>

    if (this._imgArray) {
        var arrayLength = this._imgArray.length;
        for (var j = 0; j < arrayLength; j++) {
            this._imgArray[j].removeEventListener("load", this._imgOnLoadEvent, false);
            this._imgArray[j].removeEventListener("error", this._errorLoadingImage, false);
        }
        this._imgArray = null;
    }

    if (!Jx.isNullOrUndefined(this._flipView)) {
        this._flipView.removeEventListener("pageselected", this.pageHandler, false);
    }
    this._flipView = null;

    this._leftArrow = null;
    this._rightArrow = null;
    this._list = null;
    this._imgOnLoadEvent = null;
    this._errorLoadingImage = null;
    this.pageHandler = null;
};

Share.Preview.prototype.getUI = function (ui) {
    /// <summary>
    /// Retrieves HTML associated with button
    /// </summary>
    /// <param name="ui" type="JxUI">Object container for html/css</param>

    ui.html = ShareAnything.Templates.sharePreview();
    // Note that a hard-coded ID is included for some elements in the template.
    // This does mean that there can only be one Share.Preview on the page at a time.
};

Share.Preview.prototype.hide = function () {
    /// <summary>
    /// Hide the preview.  Note that the caller is expected to provide any animation.
    /// </summary>

    if (Boolean(this._flipView) && this._flipView.currentPage === this._currentFlipperCount - 1) {
        // We're on the last page
        // Remember this for show, in case some images get added while it's hidden.
        this._wasOnLastPageForHide = true;
    }

    document.getElementById(this._id).style.display = "none";
};

Share.Preview.prototype.show = function () {
    /// <summary>
    /// Show the preview.  Note that the caller is expected to provide any animation.
    /// </summary>
    
    document.getElementById(this._id).style.display = "";
        
    if (this._flipView) {
        // Without this, the flipView will be stuck on page 0 with weird internal state.
        this._flipView.forceLayout();

        if (this._wasOnLastPageForHide) {
            // reset this to prevent this logic from happening again
            this._wasOnLastPageForHide = false;

            // Since we were on the last page before, make sure we're still on the last page now.
            this._flipView.currentPage = this._currentFlipperCount - 1;
        }
    }
};

Share.Preview.prototype._initializeFlipper = function () {
    /// <summary>
    /// Create the flipper and assign the renderer and data object.
    /// </summary>

    var flipViewElement = document.getElementById("share-pvFlipView");

    WinJS.UI.processAll(flipViewElement);
    this._flipView = flipViewElement.winControl;
    this._flipView.itemTemplate = this._renderer;

    this._flipView.addEventListener("pageselected", this.pageHandler, false);

    // Get the left and right arrows
    var buttons = flipViewElement.getElementsByTagName("button");

    var buttonsLength = buttons.length;
    for (var k = 0; k < buttonsLength; k++) {
        if (buttons[k].className === "win-navbutton win-navright") {
            this._rightArrow = buttons[k];
            this._rightArrow.id = "pvRightArrow";
        } else if (buttons[k].className === "win-navbutton win-navleft") {
            this._leftArrow = buttons[k];
            this._leftArrow.id = "pvLeftArrow";
        }
    }

    this._list = new WinJS.Binding.List([this._noImageSlide, this._noImageSlide], { binding: true });
    this._flipView.itemDataSource = this._list.dataSource;

    this._currentFlipperCount = 2; // The flipper currently has two no image slides

    this._startImageLoading();
};

Share.Preview.prototype.pageHandler = function (ev) {
    ///<summary>
    /// Event handler for FlipView selected page change event. Handles the arrow visibility setting.
    ///</summary>
    /// <param name="ev" type="Object">Resuming event object.</param>

    if (!this._flipViewInitialized) {
        // the FlipView is ready to have images loaded into it
        // We need to make sure we don't put the images into the FlipView too early so that we don't break the FlipView.
        this._flipViewInitialized = true;
    }

    if (Jx.isRtl()) {
        // Control arrow visibility depending on the current page being viewed by the user for RTL languages.
        if (this._flipView.currentPage === 0) {
            this._leftArrow.className = "win-navbutton win-navleft";
            this._rightArrow.className = "win-navbutton win-navright rightNotVisible";
        } else if (this._flipView.currentPage === (this._currentFlipperCount - 1 /*currentPage starts at zero*/)) {
            this._rightArrow.className = "win-navbutton win-navright";
            this._leftArrow.className = "win-navbutton win-navleft leftNotVisible";
        } else {
            this._rightArrow.className = "win-navbutton win-navright";
            this._leftArrow.className = "win-navbutton win-navleft";
        }
    } else {
        // Control arrow visibility depending on the current page being viewed by the user.
        if (this._flipView.currentPage === 0) {
            this._leftArrow.className = "win-navbutton win-navleft leftNotVisible";
            this._rightArrow.className = "win-navbutton win-navright";
        } else if (this._flipView.currentPage === (this._currentFlipperCount - 1 /*currentPage starts at zero*/)) {
            this._rightArrow.className = "win-navbutton win-navright rightNotVisible";
            this._leftArrow.className = "win-navbutton win-navleft";
        }  else {
            this._rightArrow.className = "win-navbutton win-navright";
            this._leftArrow.className = "win-navbutton win-navleft";
        }
    }

    // Show the flipView if it's ready
    this._checkShowFlipView();
};

Share.Preview.prototype._cancelHandler = function () {
    /// <summary>
    /// Event handler for cancel click
    /// Cancels the SOXE load, and shows the preview UI with existing data.
    /// </summary>
    
    Jx.log.info("Share.Preview: cancel click handler");

    if (!this._soxeComplete && Boolean(this._soxePromise)) {
        this._soxePromise.cancel();
        this._soxePromise = null;
        this._soxeCancelled = true;
    }

    // Render the original information in this case.
    // If SOXE has already finished, this will render the preview with the SOXE title/description but without the images.
    this._noSoxeDataRender();
};

Share.Preview.prototype.getData = function () {
    ///<summary>
    /// Retrieves the current Share.LinkData 
    ///</summary>
    /// <returns type="Share.LinkData">Share data updated with current preview contents</returns>

    // Only change the url if there is UI for the user to choose from
    if (!Jx.isNullOrUndefined(this._flipView)) {
        var /*@dynamic*/ item = this._list.getItem(this._flipView.currentPage);

        // Check for loading or noImage case
        if (Jx.isNullOrUndefined(item.data.img)) {
            this._linkData.thumbnailUrl = "";
        } else {

            var imgWidth = 0;
            var imgHeight = 0;

            var w = /* @static_cast(Number)*/item.data.img.width;
            var h = /* @static_cast(Number)*/item.data.img.height;
            var previewHeight = Share.Constants.previewImageHeight;
            var previewWidth = Share.Constants.previewImageWidth;

            // Figure out which dimension to lock in by comparing the image's aspect ratio to the preview image area's aspect ratio
            // The equation =  originalWidth * imgHeight = imgWidth * originalHeight
            // Replace the locked value with the original and solve for the variable side.
            if ((w / h) >= (previewWidth / previewHeight)) {
                // Lock in width
                imgWidth = previewWidth;
                imgHeight = (imgWidth * h) / w;
            } else {
                // Lock in height
                imgHeight = previewHeight;
                imgWidth = (imgHeight * w) / h;
            }

            this._linkData.thumbnailUrl = item.data.img.src;
            this._linkData.imgHeight = imgHeight.toString();
            this._linkData.imgWidth = imgWidth.toString();
        }
    }

    return this._linkData;
};

Share.Preview.prototype._imgOnLoadEvent = function (ev) {
    ///<summary>
    /// Load event handler for image, checks image validity and adds image to the List.
    ///</summary>
    /// <param name="ev" type="Event">Event object.</param>

    var image = ev.target;
    var isThumbnail = image === this._imgArray[0];

    if (isThumbnail) {
        this._thumbnailLoaded = true;
    }

    var w = /* @static_cast(Number)*/image.width;
    var h = /* @static_cast(Number)*/image.height;

    // We filter out images that are smaller than the min size on any dimension or larger than the max size on any dimension
    var minSize = Share.Constants.minImageSize;
    var maxSize = Share.Constants.maxImageSize;
    var passedSizeCheck = (w >= minSize) && (w <= maxSize) && (h >= minSize) && (h <= maxSize);

    // We also filter out images that are long and thin (banners)
    var passedRatioCheck = ((w > h) ? (w / h) : (h / w)) <= Share.Constants.maxImageRatio;

    // We don't filter images that are direct images according to SOXE (e.g. URL ending in .png) since the user specifically asked for the image
    var isDirectImage = this._linkData.isDirectImage && isThumbnail;
    
    if (isDirectImage || (passedSizeCheck && passedRatioCheck)) {
        image.flipViewReady = true;

        // Image loaded count
        this._imageSuccessCount++;

        if (this._previewVisible) {
            // We've already shown the flipView and initialized it with images.  Add this one to the list.
            this._addSingleImageToFlipView(image);
        }
        // Otherwise, we'll add it to the flipView in _addAllToFlipView.

    } else {
        // Image was filtered out
        NoShip.log("Share.Preview._imgOnLoadEvent - image filtered out: " + image.src);
        this._imageErrorCount++;
    }
    
    // Show the flipView if it's ready
    this._checkShowFlipView();
};

Share.Preview.prototype._addAllToFlipView = function () {
    /// <summary>
    /// Adds all loaded images to the FlipView
    /// </summary>
    /// <remarks>This should happen exactly once, and it should be the first set of images added to the flipView.</remarks>

    Jx.log.verbose("Share.Preview._addAllToFlipView");

    Debug.assert(this._flipView, "Unexpected lack of FlipView in addAllToFlipView");
    Debug.assert(this._imgArray, "Unexpected lack of image array in addAllToFlipView");
    Debug.assert(this._imageSuccessCount > 0, "Should only call addAllToFlipView if there is at least one image to add");

    var imageArray = this._imgArray;
    var arrayLength = imageArray.length;
    for (var i = 0; i < arrayLength; i++) {

        if (imageArray[i].flipViewReady) {
            this._addToFlipViewHelper(imageArray[i]);
            this._imageCount++;
        }
    }

    // Add the noImage slide to the end
    this._flipView.itemDataSource.beginEdits();
    this._list.push(this._noImageSlide);
    this._flipView.itemDataSource.endEdits();

    // Switch the flipView to the first image - right now it's on the no image slide.
    this._flipView.next();
    
    this._currentFlipperCount = this._imageCount + 2; // Add in the no image slides
};

Share.Preview.prototype._addSingleImageToFlipView = function (image) {
    /// <summary>
    /// Adds the given image to the flipView and updates the no image slide.
    /// </summary>
    /// <param name="image" type="HTMLElement">Image to add to the FlipView</param>

    this._addToFlipViewHelper(image);

    // Add the no image slide to the end - addToFlipViewHelper replaces the noImage slide with the image.
    this._flipView.itemDataSource.beginEdits();
    this._list.push(this._noImageSlide);
    this._flipView.itemDataSource.endEdits();

    this._imageCount++;
    this._currentFlipperCount = this._imageCount + 2; // add in the no image slides
};

Share.Preview.prototype._addToFlipViewHelper = function (image) {
    /// <summary>
    /// Helper used by _addSingleImageToFlipView and _addAllToFlipView
    /// Adds the image to the flipView, but doesn't modify the noImage slide or modify any counts.
    /// </summary>
    /// <param name="image" type="HTMLElement">Image to add to the FlipView</param>

    // Create the wrapper around the image - used to additionally pass the type to the renderer
    var soxeImage = /*static_cast(Share.Preview.SoxeImage)*/{
        type: "SOXEImage",
        img: image
    };

    // Workaround: Make sure to use begin/end edits around any change to the FlipView data
    // The FlipView has some bugs where if you try to change its data while it's still processing changes, 
    // it will mess up the internal state of the FlipView control.
    // Making sure to use begin/end edits around any single change (even when you have multiple changes to make) will cause it to process changes synchronously.
    this._flipView.itemDataSource.beginEdits();
    NoShip.log("Share.Preview._addToFlipViewHelper adding image: " + image.src);
    // Replace the last noImage slide with this image (the +1 is for the beginning 'no image' slide)
    this._list.setAt((this._imageCount + 1), soxeImage);
    this._flipView.itemDataSource.endEdits();
};

Share.Preview.prototype._replacePreview = function (noImage) {
    ///<summary>
    /// Move the preview into view (by moving it out of its hidden div)
    ///</summary>
    /// <param name="noImage" type="Boolean">True if there is no image to render.</param>

    var preview = document.getElementById(this._id); // current preview element (containing cancel UX)
    var hiddenPreview = document.getElementById("hiddenSharePreview");  // hidden preview area where the preview is hidden

    // EARLY RETURN
    if (Jx.isNullOrUndefined(hiddenPreview)) {
        // Don't try to replace again if the code has already done so - we've seen cases where this is called multiple times.
        return;
    }

    preview.removeChild(hiddenPreview);

    // Give the soon to be new preview element the proper id, className, and aria settings.
    hiddenPreview.id = this._id;
    hiddenPreview.className = "share-preview";
    hiddenPreview.setAttribute("aria-hidden","false");

    // Replace the old preview with the new preview.
    preview.parentNode.replaceChild(hiddenPreview, preview);

    // If noImage then remove the flipView
    if (noImage) {
        var previewArea = document.getElementById(this._imageId);
        if (!Jx.isNullOrUndefined(previewArea)) {
            previewArea.parentNode.removeChild(previewArea);

            // Also unhook events related to the flipView and clean up HTML references
            this._cleanupFlipView();
        }
    } else {
        // Showing images - add the first images to the flipView
        this._addAllToFlipView();
    }

    this._previewVisible = true;

    // Fire the completed event once we've loaded and rendered the SOXE data.
    Jx.log.verbose("Share.Preview firing SOXE complete event");
    this.raiseEvent("soxeComplete");

    WinJS.UI.Animation.fadeIn(hiddenPreview);
};

Share.Preview.prototype._soxeCallback = function ( /*@dynamic*/dataSoxe) {
    ///<summary>
    /// Callback for the SOXE request, populates LinkData with the SOXE data.
    ///</summary>
    /// <param name="dataSoxe">Soxe data object.</param>

    if (this.isShutdown()) {
        // This is a callback, check to make sure the component is still around before proceeding.
        return;
    }

    Jx.log.verbose("Share.Preview successfully retrieved SOXE data");
    this._soxePromise = null;
    this._soxeComplete = true;
    this._hasSoxeData = true;

    this._linkData.populateSoxeData(dataSoxe);

    if (this.hasUI()) {
        this._renderWithSoxeData();
    }
};

Share.Preview.prototype._soxeErrorCallback = function (error) {
    ///<summary>
    /// Error callback will be called if either Auth.js or the SOXE call return with a failure, in these cases the original data will be displayed in the UI.
    ///</summary>
    ///<param name="error" type="Error">Error object received from SOXE callback.  May be null/undefined.</param>
    
    if (this.isShutdown()) {
        // This is a callback, check to make sure the component is still around before proceeding.
        return;
    }

    Jx.fault("ShareAnything.SharePreview.NoLinkData", "SoxeError", error);

    this._soxePromise = null;
    this._soxeComplete = true;

    if (this.hasUI() && !this._soxeCancelled) {
        this._noSoxeDataRender();
    }
};

Share.Preview.prototype._renderWithSoxeData = function () {
    ///<summary>
    /// Render the preview area with SOXE data
    ///</summary>

    // Set our expected number of images to iterate through
    this._imageTotal = this._linkData.images.length;

    // If the page has no images dont render the flipper
    if (this._linkData.images.length === 0) {
        this._renderPreview(true);
        this._replacePreview(true);
    } else {
        this._renderPreview(false);
        var previewContainer = document.getElementById(this._imageId);
        previewContainer.innerHTML = '<div id="share-pvFlipView" class="flipView" data-win-control="WinJS.UI.FlipView"></div>';
        // Initialize the image flipper
        // This does not complete immediately, setting the itemDataSource is finishing after a msSetImmediate. 
        // So we don’t want to start downloading images until we know the initial data source has been set on the control.
        this._initializeFlipper();
    }
};

Share.Preview.prototype._startImageLoading = function () {
    ///<summary>
    /// Begins image loading when msSetImmediate is called
    ///</summary>

    // Start loading the thumbnails
    var imagesLength = this._linkData.images.length;
    for (var i = 0; i < imagesLength; i++) {
        this._imgArray[i] = document.createElement("img");
        this._imgArray[i].addEventListener("load", this._imgOnLoadEvent, false);
        this._imgArray[i].addEventListener("error", this._errorLoadingImage, false);

        this._imgArray[i].src = this._linkData.images[i];
    }

    this._imagesArrayCreated = true;
};

Share.Preview.prototype._renderPreview = function (renderNoImage) {
    ///<summary>
    /// Renders the title and description
    ///</summary>
    ///<param name="renderNoImage">Indicates whether the "no image" UI should be rendered</param>

    // Update the class of the container
    var previewContainer = document.getElementById("hiddenSharePreview");

    // EARLY RETURN
    if (Jx.isNullOrUndefined(previewContainer) || this._renderedPreview) {
        // Don't try to render again if the code has moved past the render phase, we've seen some cases where this can be called multiple times.
        return;
    }

    // Only display UI elements if there is text for them
    var titleHtml = "";
    if (Jx.isNonEmptyString(this._linkData.title) && (this._linkData.title !== this._linkData.url)) {
        titleHtml = "<div class='singleLineText' id='shareTitle'>" + Jx.escapeHtml(this._linkData.title) + "</div>";
    }

    var descriptionHtml = "";
    if (Jx.isNonEmptyString(this._linkData.description)) {
        descriptionHtml = "<div id='shareDescription'>" + Jx.escapeHtml(this._linkData.description) + "</div>";
    }

    var html = "";
    var className = "";

    if (renderNoImage) {
        className = "noImage";
    } else {
        html += "<div id='" + this._imageId + "'></div>";
        className = "withImage";
    }

    html +=
        "<div id='sharePVTextArea' class='" + className + "'>" +
            titleHtml +
            "<div class='singleLineText' id='shareUrl'>" + Jx.escapeHtml(this._linkData.url) + "</div>" +
            descriptionHtml +
        "</div>";

    // Set this HTML as the entire HTML for the preview container element
    previewContainer.innerHTML = html;

    this._renderedPreview = true;
};


Share.Preview.prototype._errorLoadingImage = function (ev) {
    ///<summary>
    /// Error for loading the image
    ///</summary>
    ///<param name="ev" type="Event"></param>

    Debug.assert(this._imgArray, "Unexpected lack of image array in errorLoadingImage");

    NoShip.log("Share.Preview Error loading image: " + (ev.target ? ev.target.src : ""));

    var isFirstImage = ev.target === this._imgArray[0];
    if (isFirstImage) {
        this._thumbnailLoaded = true;
    }

    this._imageErrorCount++;

    // Shows the FlipView if it's ready
    this._checkShowFlipView();
};

Share.Preview.prototype._checkShowFlipView = function () {
    ///<summary>
    /// Checks to see whether it's time to show the FlipView
    /// Shows the flipView if it is the correct time
    ///</summary>

    var showWithImages = false;
    var isReady = false;

    // Don't show the flipView until it's ready to have images added to it - that can break the FlipView.
    // Don't show it if it's already been shown.
    if (this._flipViewInitialized && !this._previewVisible) {
        // Check to see if the images are ready

        var allImagesLoaded = (this._imageErrorCount + this._imageSuccessCount) === this._imageTotal;

        // Show the flipView if the thumbnail image has finished loading (success or failure) and there is at least one image successfully loaded
        if (this._thumbnailLoaded && this._imageSuccessCount > 0) {
            isReady = true;
            showWithImages = true;
        } else if (allImagesLoaded) {
            if (this._imageSuccessCount === 0) {
                // All of the images have failed to load
                isReady = true;
                showWithImages = false;
            } else {
                // All of the images have loaded and at least one was successful.
                // We shouldn't hit this code unless this._thumbnailLoaded is false - which it shouldn't be if everything is loaded.
                Debug.assert(false, "Thumbnail load didn't register - preview show was delayed too long.");
                isReady = true;
                showWithImages = true;
            }
        }
    }

    if (isReady) {
        this._replacePreview(!showWithImages);
    }
};

Share.Preview.prototype._noSoxeDataRender = function () {
    ///<summary>
    /// Renders the preview area with the data that's currently in the linkData - without extra data loaded from SOXE.
    ///</summary>

    if (!this._renderedPreview) {
        // Only render the preview if we haven't already
        this._renderPreview(true);
    }
    
    this._replacePreview(true);
};

Share.Preview.prototype._renderer = function (itemPromise) {
    ///<summary>
    /// Flip View Renderer
    ///</summary>
    ///<param name="itemPromise" type="WinJS.Promise">The function to be executed when an item loads.</param>
    /// <returns type="Function">Returns itemPromise with the then functionality setup for our renderer.</returns>

    return itemPromise.then(function (/* @dynamic*/item) {
        var element = document.createElement('div');
        if (item.data.type === "noImage") {
            element.innerHTML = '<div class="share-noImageTxt">' + Jx.escapeHtml(Jx.res.getString(Share.Constants.stringsPrefix + "previewNoImage")) + '</div>';
            element.className = "share-noImage";
        } else {
            // Calculate appropriate height/width for image inside bounding box to keep aspect ratio
            // Not using CSS for this because we also want to keep the original image size when it's not too large.
            var w = /* @static_cast(Number)*/item.data.img.width;
            var h = /* @static_cast(Number)*/item.data.img.height;
            var previewHeight = Share.Constants.previewImageHeight;
            var previewWidth = Share.Constants.previewImageWidth;
            var img = document.createElement('img');
            img.src = item.data.img.src;

            var imgWidth;
            var imgHeight;
            
            // Figure out which dimension to lock in by comparing the image's aspect ratio to the preview image area's aspect ratio
            // The equation =  originalWidth * imgHeight = imgWidth * originalHeight
            // Replace the locked value with the original and solve for the variable side.
            if ((w / h) >= (previewWidth / previewHeight)) {
                // Lock in width
                imgWidth = previewWidth;
                imgHeight = (imgWidth * h) / w;
            } else {
                // Lock in height
                imgHeight = previewHeight;
                imgWidth = (imgHeight * w) / h;
            }
            img.className = "imgPreview";
            img.width = imgWidth;
            img.height = imgHeight;

            element.appendChild(img);
        }
        return element;
    });

};

Share.Preview.prototype._setTitle = function (newTitle) {
    ///<summary>
    /// Changes the title based on user input, to be used when enabling title editing.
    ///</summary>
    ///<param name="newTitle" type="String">New string for the title</param>

    Jx.log.info("User edited title.");
    this._linkData.title = newTitle;
    this.linkHasBeenCustomized = true;
};

Share.Preview.prototype._setDescription = function (newDescription) {
    ///<summary>
    /// Changes the description based on user input, to be used when enabling description editing.
    ///</summary>
    ///<param name="newDescription" type="String">New string for the description</param>

    Jx.log.info("User edited description.");
    this._linkData.title = newDescription;
    this.linkHasBeenCustomized = true;
};

// "Globals"
Share.Preview.prototype._imageId = "sharePVImgArea";
Share.Preview.prototype._noImageSlide = /*@static_cast(Share.Preview.SoxeImage)*/{ type: "noImage" };

// These keep track of what state the control is currently in
Share.Preview.prototype._uiInitialized = false; // Indicates whether the UI is available.
Share.Preview.prototype._soxeComplete = false;
Share.Preview.prototype._hasSoxeData = false;
Share.Preview.prototype._soxeCancelled = false; // Set to true when user has cancelled SOXE.
Share.Preview.prototype._renderedPreview = false; // Indicates whether the initial preview has been rendered (somewhere)
Share.Preview.prototype._imagesArrayCreated = false;
Share.Preview.prototype._previewVisible = false; // Indicates whether the preview is visible (_replacePreview has been called)
Share.Preview.prototype._flipViewInitialized = false; // Indicates whether the flipView is ready for images to be loaded into it
Share.Preview.prototype._thumbnailLoaded = false; // Indicates whether the SOXE-preferred thumbnail has finished loading (either success or failure)
Share.Preview.prototype.linkHasBeenCustomized = false;
Share.Preview.prototype._wasOnLastPageForHide = false;

// FlipView/image-related data/html
Share.Preview.prototype._leftArrow = /* @static_cast(HTMLElement) */null;
Share.Preview.prototype._rightArrow = /* @static_cast(HTMLElement) */null;
Share.Preview.prototype._flipView = /* @static_cast(WinJS.UI.FlipView)*/null;
Share.Preview.prototype._list = /* @static_cast( WinJS.Binding.List)*/null;
Share.Preview.prototype._imageCount = 0; // Number of images in the flipper
Share.Preview.prototype._currentFlipperCount = 0; // Number of items in the flipper
Share.Preview.prototype._imageSuccessCount = 0; // Number of successfully loaded images that are good for the FlipView
Share.Preview.prototype._imageErrorCount = 0; // Number of images that failed to load or unsuitable for FlipView
Share.Preview.prototype._imageTotal = 0; // Total number of images returned by soxe
Share.Preview.prototype._imgArray = null;
Share.Preview.prototype._soxePromise = /*@static_cast(WinJS.Promise)*/null;
