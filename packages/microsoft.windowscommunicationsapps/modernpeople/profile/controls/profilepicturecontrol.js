
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="ProfilePictureControl.ref.js"/>
/// <reference path="../../Shared/JSUtil/Include.js"/>
/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../../Shared/Jx/core/Jx.js"/>
/// <reference path="Windows.Graphics.Imaging.js"/>
/// <reference path="Windows.Media.Capture.js"/>
/// <reference path="Windows.Security.Authentication.OnlineId.js"/>
/// <reference path="Windows.Storage.Streams.js"/>
/// <reference path="Windows.Storage.Pickers.js"/>
/// <reference path="Windows.System.UserProfile.js"/>
/// <reference path="%_NTTREE%\drop\published\ModernContactPlatform\Microsoft.WindowsLive.Platform.js" />

Jx.delayDefine(People.Controls, "ProfilePictureControl", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People,
        C = P.Controls,
        N = P.Nav;
    var Imaging = Windows.Graphics.Imaging,
        Storage = Windows.Storage,
        Pickers = Windows.Storage.Pickers,
        ViewManagement = Windows.UI.ViewManagement,
        ApplicationView = ViewManagement.ApplicationView;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    // Constants
    var c_rtl = Jx.isRtl();
    var c_left = !c_rtl ? "left" : "right";

    var c_defaultTile = Include.replacePaths("$(imageResources)/ic-default-220.png");
    var c_userTileSize = 220;  // Default user tile size
    var c_maxPhotoSize = 2200; // Size to which larger photos will be shrunk
    var c_zoomMin = .1;        // Minimum zoom to allow
    var c_zoomMax = 4;         // Maximum zoom to allow

    var c_cropBorder = 4;     // Width of border around crop square
    var c_keyboardDelta = 10; // Distance to translate in response to arrow keys
    var c_zoomEpsilon = .001; // Approximation amount for zoom comparisons

    var c_encoderIdForDecoderId = {};
    c_encoderIdForDecoderId[Imaging.BitmapDecoder.gifDecoderId] = Imaging.BitmapEncoder.gifEncoderId;
    c_encoderIdForDecoderId[Imaging.BitmapDecoder.pngDecoderId] = Imaging.BitmapEncoder.pngEncoderId;
    c_encoderIdForDecoderId[Imaging.BitmapDecoder.jpegDecoderId] = Imaging.BitmapEncoder.jpegEncoderId;
    var c_defaultEncoderId = Imaging.BitmapEncoder.jpegEncoderId;

    // ================================================================================================
    // Perf Helper.
    ////    <event value="2006" task="mePictureEditAction"          opcode="win:Start"  symbol="mePictureEditAction_start"          template="meProfileActionTemplate"  keywords="profile"/>
    ////    <event value="2007" task="mePictureEditAction"          opcode="win:Stop"   symbol="mePictureEditAction_end"            template="meProfileActionTemplate"  keywords="profile"/>

    var perfProfilePictureAction = function (actionOp, actionFunc) {
        return function () {
            try {
                NoShip.People.etw("mePictureEditAction_start", { action: actionOp });
                return actionFunc.apply(this, arguments);
            } finally {
                NoShip.People.etw("mePictureEditAction_end", { action: actionOp });
            }
        };
    };

    // ================================================================================================
    C.ProfilePictureControl = /*@constructor*/function (host) {
        /// <summary>Constructor for the ProfilePictureControl</summary>
        /// <param name="host" type="P.CpMain" optional="false">Hosting application that implements the IPageHost methods</param>
        Debug.assert(Jx.isObject(host));
        this._host = host;
        this._container = /*@static_cast(HTMLElement)*/ null;
        this._person = /*@static_cast(Microsoft.WindowsLive.Platform.IMe)*/ null;
        
        this._elements = /*static_cast(ControlElements)*/{
            photo: null,
            scroller: null,
            container: null,
            hitTargetZoom: null,
            hitTarget: null,
            inner: null,
            anchor: null,
            mask: null,
            crop: null
        };
        this._controlProperties = /*static_cast(ControlProperties)*/{
            scale: 1,
            photoWidth: 0,
            photoHeight: 0,
            zoomMin: 0,
            zoomMax: 0,
            scrollLimitLeft: 0,
            scrollLimitTop: 0,
            minScrollHeight: 0,
            minScrollWidth: 0,
            crop: { x: 0, y: 0, width: 0, height: 0 }
        };
        this._photoProperties = /*static_cast(PhotoProperties)*/{
            url: null,
            changed: false,
            tempFile: /*@static_cast(Windows.Storage.StorageFile)*/null,
            storageFile: /*@static_cast(Windows.Storage.StorageFile)*/null,
            crop: null
        };

        this._snappedX = -1;
        this._snappedY = -1;
        this._updateScrollerHandle = null;
    };

    var prototype = C.ProfilePictureControl.prototype;
    
    // ================================================================================================.
    // IPage Control Interface Methods, called by a Host Page Control.
    // ================================================================================================.
    prototype.load = perfProfilePictureAction("load", _loadAction);
    /*@bind(C.ProfilePictureControl)*/function _loadAction (/*@dynamic*/initArgs) {
        /// <summary>Loads the control</summary>
        /// <param name="initArgs" type="Object" optional="false">
        /// Required IPageHost load parameters:
        ///     element: the HTMLElement to contain the control
        ///     mode: "load" or "hydrate"
        ///     data: the IMeContact whose usertile to display and change
        /// </param>
	    $include("$(cssResources)/controls-people.css");

        Debug.assert(!Jx.isNullOrUndefined(initArgs));
        Debug.assert(Jx.isHTMLElement(initArgs.element));
        Debug.assert(Jx.isNonEmptyString(initArgs.mode));
        Debug.assert(Jx.isObject(initArgs.data));

        this._loaded = true;
        this._dragging = false;
        this._container = initArgs.element;
        this._person = initArgs.data;
        this._buttonsControl = new ButtonsControl();

        this._createDisplay();
        this._showProfilePicture();
    };

    prototype.save = perfProfilePictureAction("save", _saveAction);
    /*@bind(C.ProfilePictureControl)*/function _saveAction () {
        if (this._photoProperties.url === null) {
            if (this._photoProperties.changed) {
                this._person.clearUserTile();
            }
        } else {
            this._setUserTile();
        }

        this._host.back();
    };

    prototype.cancel = function () {
        if (this._photoProperties.tempFile) {
            this._photoProperties.tempFile.deleteAsync();
        }
        this._host.back();
    };

    prototype.prepareSuspension = Jx.fnEmpty;

    prototype.activate = perfProfilePictureAction("activate", _activateAction);
    /*@bind(C.ProfilePictureControl)*/function _activateAction () {
        /// <summary>Called when the control is activated (being navigated to). The control can set focus in this call.</summary>
        var commandBar = this._host.getCommandBar();
        commandBar.addCommand(new P.Command("photoPicker", "/meStrings/picCtrl_cmdPicker", null, "\uE1C1", true, true, this, this.openPhotoPicker));
        commandBar.addCommand(new P.Command("webcam", "/meStrings/picCtrl_cmdWebCam", null, "\uE114", true, true, this, this.openWebCam));
        commandBar.addCommand(new P.Command("deletePic", "/meStrings/picCtrl_cmdDelete", null, "\uE107", true, (this._photoProperties.url !== null), this, this.removePicture));

        var frameCommands = this._host.getFrameCommands();
        frameCommands.addCommand(new P.Command("savePic", null, "/meStrings/picCtrl_cmdSave_tooltip", "\uE105", true, true, this, this.save));
        frameCommands.addCommand(new P.Command("cancelPic", null, "/meStrings/picCtrl_cmdCancel_tooltip", "\uE10A", true, true, this, this.cancel));

        // Add button event handlers
        this._buttonsControl.activate();

        // Add events for zooming
        var elements = this._elements;
        this._MSContentZoomListener = this._onZoom.bind(this);
        elements.scroller.addEventListener("MSContentZoom", this._MSContentZoomListener, false);
        elements.scroller.addEventListener("mousedown", function (/*@type(Event)*/ev) { if (ev.button === 1) { ev.preventDefault(); } }, false); // Prevent middle-button scrolling

        elements.container.addEventListener("keydown", this._onKeyDown.bind(this), false);
        elements.container.addEventListener("mousewheel", this._onMouseWheel.bind(this), false);

        elements.hitTarget.addEventListener("MSPointerDown", this._onMSPointerDown.bind(this), false);
        this._MSPointerMoveListener = this._onMSPointerMove.bind(this);
        this._MSPointerUpListener = this._onMSPointerUp.bind(this);

        // Add listener to reset photo and scroller upon photo load
        elements.photo.addEventListener("load", this._showImage.bind(this), false);

        // Add window resize listener to set up photo and move to previous position
        this._resizeListener = this._onResize.bind(this);
        window.addEventListener("resize", this._resizeListener, false);
    };

    prototype.deactivate = function () {
        /// <summary>Called when the control is deactivated (being navigated away)</summary>
        /// <returns type="Boolean">True if it's okay to navigate away, false if the control should not be deactivated</returns>
        window.removeEventListener("resize", this._resizeListener, false);
        window.removeEventListener("MSPointerUp", this._MSPointerUpListener, false);
        return true;
    };

    prototype.unload = function () {
        ///<summary>Unloads the control by releasing resources</summary>
        this._loaded = false;
    };

    prototype.openPhotoPicker = perfProfilePictureAction("openPhotoPicker", _openPhotoPickerAction);
    /*@bind(C.ProfilePictureControl)*/function _openPhotoPickerAction () {
        /// <summary>Called when user open photo picker. Reloads the profile picture after user select an image. </summary>
        var that = this;
        var picker = new Pickers.FileOpenPicker();
        picker.viewMode = Pickers.PickerViewMode.thumbnail;
        picker.suggestedStartLocation = Pickers.PickerLocationId.picturesLibrary;
        picker.fileTypeFilter.replaceAll([".jpg", ".jpeg", ".gif", ".png", ".bmp", ".tif", ".tiff"]);
        picker.pickSingleFileAsync().done(function (file) {
            that._elements.container.focus();
            if (file) {
                that._loadFromFileItem(file);
                that = null;
            }
        }, Jx.fnEmpty);
    };

    prototype.openWebCam = perfProfilePictureAction("openWebCam", _openWebCamAction);
    /*@bind(C.ProfilePictureControl)*/function _openWebCamAction () {
        /// <summary>Called when user open web cam to take picture.
        /// Reloads the profile picture after user taking a picture and confirms it.</summary>
        var that = this;
        var captureUI = new Windows.Media.Capture.CameraCaptureUI();
        captureUI.photoSettings.allowCropping = false;

        captureUI.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo).done(function (item) {
            that._elements.container.focus();
            if (item) {
                that._loadFromFileItem(item);
                that = null;
            }
        }, Jx.fnEmpty);
    };

    prototype.removePicture = perfProfilePictureAction("remove", _removeAction);
    /*@bind(C.ProfilePictureControl)*/function _removeAction () {
        /// <summary>Removes the existing photo and shows the default user tile</summary>
        this._setImage(null);
    };

    // ================================================================================================.
    // Internal functions.
    // ================================================================================================.
    prototype._createDisplay = function () {
        /// <summary>Creates the visual display, called from the load method to prepare to receive the focus</summary>
        var buttonsControl = this._buttonsControl;
        buttonsControl.addButton(new ZoomButton("zoomIn", "\uE109", this._doZoom.bind(this, 1), "ctrl + plus"));
        buttonsControl.addButton(new ZoomButton("zoomOut", "\uE108", this._doZoom.bind(this, -1), "ctrl + -"));
        buttonsControl.addButton(new ZoomButton("zoomToFit", "\uE185", this._zoomToFit.bind(this)));

        this._container.innerHTML =
            "<div id='profilePicture-container'>" +
                "<div id='profilePicture-scroller' aria-label='" + getEscapedString("picCtrl_image") + "'>" +
                    "<div id='profilePicture-hitTargetContainer'>" +
                        "<div id='profilePicture-hitTargetZoom'></div>" +
                        "<div id='profilePicture-hitTarget'></div>" +
                    "</div>" +
                    "<div id='profilePicture-inner'>" +
                        "<img id='profilePicture-photo' width='0' height='0' aria-label='" + getEscapedString("picCtrl_image") + "'>" +
                    "</div>" +
                    "<div id='profilePicture-anchor'></div>" +
                "</div>" +
                buttonsControl.getUI() +
                "<div id='profilePicture-mask'>" +
                    "<div id='profilePicture-crop' style='width:" + String(c_userTileSize) + "px;height:" + String(c_userTileSize) + "px;'></div>" +
                "</div>" +
            "</div>";

        // Prevent container from interfering with our scrolling in snap mode
        this._container.style.msScrollLimitXMax = "0px";

        var elements = this._elements = {
            container: document.getElementById("profilePicture-container"),
            scroller: document.getElementById("profilePicture-scroller"),
            hitTargetZoom: document.getElementById("profilePicture-hitTargetZoom"),
            hitTarget: document.getElementById("profilePicture-hitTarget"),
            inner: document.getElementById("profilePicture-inner"),
            photo: document.getElementById("profilePicture-photo"),
            anchor: document.getElementById("profilePicture-anchor"),
            mask: document.getElementById("profilePicture-mask"),
            crop: document.getElementById("profilePicture-crop")
        };

        // Position and resize the mask
        this._setUpMask();
    };

    prototype._setUpMask = function () {
        ///<summary>Resizes and positions the mask</summary>
        var mask = this._elements.mask;
        var container = this._elements.container;
        var scroller = this._elements.scroller;

        // Set the size explicitly again in case of a window resize
        scroller.style.width = String(scroller.clientWidth) + 'px';
        scroller.style.height = String(scroller.clientHeight) + 'px';

        // Position mask so crop window is centered within container
        var maskBorder = Math.ceil((Math.max(container.offsetWidth, container.offsetHeight) - c_userTileSize) / 2);
        mask.style.borderWidth = String(maskBorder) + "px";

        setPos(mask,
                Math.floor((container.clientWidth - c_userTileSize) / 2) - maskBorder - c_cropBorder,
                Math.floor((container.clientHeight - c_userTileSize) / 2) - maskBorder - c_cropBorder);
    };

    prototype._loadFromFileItem = function (photo) {
        /// <summary>Load image from StorageFile and render.</summary>
        /// <param name="photo" type="Storage.StorageFile" />
        NoShip.People.etw("mePictureEditAction_start", { action: "LoadImage" });

        var photoStream;
        var prevTempFile = this._photoProperties.tempFile;
        var that = this;

        // Open the stream to check for multiple frames
        var randomAccessStream = /*@static_cast(Storage.Streams.IRandomAccessStreamReference)*/photo;
        randomAccessStream.openReadAsync().then(function (stream) {
            photoStream = stream;
            return Imaging.BitmapDecoder.createAsync(stream);
        }).done(function (/*@type(Imaging.BitmapDecoder)*/decoder) {
            // Extract first frame if there are multiple frames
            if (decoder.frameCount > 1) {
                var pixelData;
                var tempFile;
                var tempFileStream;

                // Grab the first frame
                decoder.getPixelDataAsync().then(function (/*@type(Imaging.PixelDataProvider)*/pixelDataProvider) {
                    pixelData = pixelDataProvider.detachPixelData();
                    closeStream(photoStream);

                    // Create temporary file to hold first frame
                    return Storage.ApplicationData.current.temporaryFolder.createFileAsync(
                        "profilepicture",
                        Storage.CreationCollisionOption.generateUniqueName
                    );
                }).then(function (/*@type(Storage.StorageFile)*/file) {
                    tempFile = file;
                    return file.openAsync(Storage.FileAccessMode.readWrite);
                }).then(function (stream) {
                    // Encode frame to file stream
                    tempFileStream = stream;
                    var encoderId = c_encoderIdForDecoderId[decoder.decoderInformation.codecId];
                    encoderId = encoderId ? encoderId : c_defaultEncoderId;
                    return Imaging.BitmapEncoder.createAsync(encoderId, tempFileStream);
                }).then(function (/*@type(Imaging.BitmapEncoder)*/encoder) {
                    encoder.setPixelData(
                        decoder.bitmapPixelFormat,
                        decoder.bitmapAlphaMode,
                        decoder.orientedPixelWidth,
                        decoder.orientedPixelHeight,
                        decoder.dpiX,
                        decoder.dpiY,
                        pixelData
                    );
                    return encoder.flushAsync();
                }).done(function () {
                    closeStream(tempFileStream);

                    // Delete previous temp file
                    if (prevTempFile) {
                        prevTempFile.deleteAsync();
                    }

                    // Set image using temp file
                    that._photoProperties.storageFile = that._photoProperties.tempFile = tempFile;
                    that._setImage("ms-appdata:///temp/" + tempFile.name);
                }, function () {
                    // If a promise failed, close the streams
                    closeStream(photoStream);
                    closeStream(tempFileStream);
                });
            } else {
                closeStream(photoStream);

                // Set image using original file
                that._photoProperties.storageFile = photo;
                that._setImage(URL.createObjectURL(photo, { oneTimeOnly: true }));
            }
        }, Jx.fnEmpty);
    };

    prototype._showProfilePicture = function () {
        ///<summary>Display the current user tile</summary>
        var userTile = this._person.getUserTile(Microsoft.WindowsLive.Platform.UserTileSize.original, false),
            userTileCrop = this._person.userTileCrop;

        var url = null;
        if (!Jx.isNullOrUndefined(userTile) && Jx.isNonEmptyString(userTile.appdataURI)) {
            url = userTile.appdataURI;

            // Validate and set crop
            Debug.assert(!Jx.isNullOrUndefined(userTileCrop), "userTileCrop should not be null.");
            if (!Jx.isNullOrUndefined(userTileCrop) && userTileCrop.width > 0 && userTileCrop.height > 0) {
                this._photoProperties.crop = userTileCrop;
            }
            NoShip.People.etw("mePictureEditAction_start", { action: "LoadImage" });
        }

        this._setImage(url);
    };

    prototype._showImage = function () {
        ///<summary>Adjusts the photo size and the control for new photo</summary>
        if (!this._loaded) {
            return;
        }

        var controlProps = this._controlProperties;
        var photoProps = this._photoProperties;
        var container = this._elements.container;
        var scroller = this._elements.scroller;

        // Cancel dragging
        this._dragging = false;

        // Scale the photo as necessary
        this._setScale();

        // Calculate initial zoom
        var zoom = 1;
        var scale = controlProps.scale;
        var photoWidth = controlProps.photoWidth,
            photoHeight = controlProps.photoHeight;

        // If we have a saved crop, use that for zooming and positioning
        if (photoProps.crop) {
            var newZoom = (c_userTileSize / photoProps.crop.width) / scale;
            // Validate crop
            if (newZoom >= c_zoomMin && newZoom <= c_zoomMax &&
                photoProps.crop.x + photoProps.crop.width <= photoWidth / scale &&
                photoProps.crop.y + photoProps.crop.height <= photoHeight / scale) {
                zoom = newZoom;
                var newX = getCropPosition(photoProps.crop.x * scale, photoWidth, photoProps.crop.width),
                    newY = photoProps.crop.y * scale;
            } else {
                photoProps.crop = null;
            }
        } else if (scale <= 1) {  // Otherwise, set zoom if not scaled up
            // Zoom out to fit scaled image within container
            var heightRatio = photoHeight / container.clientHeight;
            var widthRatio = photoWidth / container.clientWidth;

            if ((heightRatio >= widthRatio) && (heightRatio > 1)) {
                // Size to height
                zoom = container.clientHeight / photoHeight;
                // Ensure width still fits within crop
                if (photoWidth * zoom < c_userTileSize) {
                    zoom = c_userTileSize / photoWidth;
                }
            } else if ((heightRatio < widthRatio) && (widthRatio > 1)) {
                // Size to width
                zoom = container.clientWidth / photoWidth;
                // Ensure height still fits within crop
                if (photoHeight * zoom < c_userTileSize) {
                    zoom = c_userTileSize / photoHeight;
                }
            }
        }

        // Calculate minimum zoom based on smallest photo dimension
        var zoomMin = Math.max(c_zoomMin, c_userTileSize / Math.min(photoWidth, photoHeight));

        // Calculate max zoom using global max and scale factor already applied
        var zoomMax = Math.min(c_zoomMax, Math.max(c_zoomMax / scale, 1));

        // If default user tile is used, disable zooming by setting min and max to 1,
        // else round zoom up to 4 decimal places since that is the limit we can set
        var isDefaultUserTile = photoProps.url === null;
        zoomMin = isDefaultUserTile ? 1 : Math.ceil(zoomMin * Math.pow(10, 4)) / Math.pow(10, 4);
        zoomMax = isDefaultUserTile ? 1 : Math.floor(zoomMax * Math.pow(10, 4)) / Math.pow(10, 4);
        this._buttonsControl.disableButton("zoomToFit", isDefaultUserTile);

        // Set zoom limits using percentages
        scroller.style.msContentZoomLimitMin = String(zoomMin * 100) + "%";
        scroller.style.msContentZoomLimitMax = String(zoomMax * 100) + "%";

        controlProps.zoomMin = zoomMin;
        controlProps.zoomMax = zoomMax;

        this._setDimensions();

        // Apply zoom and scroll
        scroller.msContentZoomFactor = zoom;

        // Find scroll limits
        this._updateScroller();

        if (photoProps.crop) {
            scroller.scrollLeft = controlProps.scrollLimitLeft + newX;
            scroller.scrollTop = controlProps.scrollLimitTop + newY;
        } else {
            this._centerImage(zoom);
        }

        // Show/hide crop border
        Jx.setClass(this._elements.crop, "inactive", isDefaultUserTile);

        // Unhide photo
        Jx.removeClass(this._elements.photo, "hidden");

        
        if (!((/^http:/).test(this._elements.photo.src))) {
            NoShip.People.etw("mePictureEditAction_end", { action: "LoadImage" });
        }
        
    };

    prototype._setScale = function () {
        ///<summary>Scales the photo if its dimensions are outside of min/max boundaries</summary>
        var photo = /*@static_cast(HTMLImageElement)*/this._elements.photo;
        var photoWidth = photo.naturalWidth,
            photoHeight = photo.naturalHeight;
        var maxDimension = Math.max(photoWidth, photoHeight);
        var minDimension = Math.min(photoWidth, photoHeight);

        var scale = 1;
        scale = (maxDimension > c_maxPhotoSize) ? c_maxPhotoSize / maxDimension : scale;  // Scale photo down to max size
        scale = (minDimension * scale < c_userTileSize) ? c_userTileSize / minDimension : scale; // Scale photo up if it doesn't fill crop window
        this._controlProperties.scale = scale;

        photoWidth = Math.round(photoWidth * scale);
        photoHeight = Math.round(photoHeight * scale);
        this._sizePhoto(photoWidth, photoHeight);
    };

    prototype._setDimensions = function () {
        ///<summary>Sets size and position of control elements based on photo size</summary>
        var controlProps = this._controlProperties;
        var photoWidth = controlProps.photoWidth,
            photoHeight = controlProps.photoHeight;
        var zoomMin = controlProps.zoomMin;
        var scroller = this._elements.scroller;

        // Scrollable width should be outer width, plus room to scroll the zoomed-out photo along the crop window.
        // Divide by the minimum zoom to get the necessary width.
        var scrollWidth = Math.ceil((scroller.clientWidth + photoWidth * zoomMin - c_userTileSize) / zoomMin);
        var scrollHeight = Math.ceil((scroller.clientHeight + photoHeight * zoomMin - c_userTileSize) / zoomMin);
        this._sizeControls(scrollWidth, scrollHeight);

        // Center photo and hit target within scrolling container, rounded down (toward top-left)
        var photoLeft = Math.floor((scrollWidth - photoWidth) / 2);
        var photoTop = Math.floor((scrollHeight - photoHeight) / 2);
        this._movePhoto(photoLeft, photoTop);
    };

    prototype._setImage = function (url) {
        /// <summary>Set URL of photo and update command bar</summary>
        /// <param name="url" type="String">URL of the picture to display, or null to show the default user tile.</param>
        if (!this._loaded) {
            return;
        }

        var photo = this._elements.photo;
        var commandBar = this._host.getCommandBar();

        if (Jx.isNonEmptyString(photo.src)) {
            // Changing image instead of first time setting
            this._photoProperties.crop = null;
        }
        this._photoProperties.changed = Jx.isNonEmptyString(photo.src);
        this._photoProperties.url = url;

        photo.src = "";
        if (url === null) {
            photo.src = c_defaultTile;
            commandBar.hideCommand("deletePic");
        } else {
            photo.src = url;
            commandBar.showCommand("deletePic");
        }

        // Hide photo until image loads
        Jx.addClass(photo, "hidden");
    };

    prototype._setUserTile = function () {
        /// <summary>Determines the crop position and photo to save</summary>
        var controlProps = this._controlProperties;
        var photoProps = this._photoProperties;
        var scroller = this._elements.scroller;

        // Determine crop and scale
        var crop = {};

        // Set new crop relative to scaled photo size
        crop.width = crop.height = Math.round(c_userTileSize / scroller.msContentZoomFactor);
        crop.x = getCropPosition(scroller.scrollLeft - controlProps.scrollLimitLeft, controlProps.photoWidth, crop.width);
        crop.y = scroller.scrollTop - controlProps.scrollLimitTop;

        controlProps.crop = crop;
        var oldCrop = this._person.userTileCrop;

        if (!("isMock" in this._host.getPlatform())) {
            if (!photoProps.changed) {
                // Save if crop has changed
                var cropHasChanged = Object.getOwnPropertyNames(crop).some(function (key) { return crop[key] !== oldCrop[key]; });
                if (controlProps.scale !== 1 || cropHasChanged) {
                    // Load original user tile photo
                    var save = this._savePhotoStreams.bind(this);
                    Storage.StorageFile.getFileFromApplicationUriAsync(
                        new Windows.Foundation.Uri(photoProps.url)
                    ).done(save, Jx.fnEmpty);
                }
            } else {
                // Photo has changed, so save using captured file
                this._savePhotoStreams(photoProps.storageFile);
            }
        }
    };

    prototype._savePhotoStreams = function (photo) {
        /// <summary>Creates and saves the large and webready user tile streams to set the user tiles</summary>
        /// <param name="photo" type="Storage.StorageFile">Source file</param>
        var controlProps = this._controlProperties;
        var scroller = this._elements.scroller;

        // Streams for original photo and new user tiles
        var photoStream;
        var encoderId;
        var that = this;

        var randamAccessStream = /*@static_cast(Storage.Streams.IRandomAccessStreamReference)*/ photo;
        randamAccessStream.openReadAsync().then(function (/*@type(Storage.Streams.IRandomAccessStream)*/stream) {
            photoStream = stream;
            return Imaging.BitmapDecoder.createAsync(stream);
        }).done(function (/*@type(Imaging.BitmapDecoder)*/decoder) {
            // Array of promises for photo manipulations
            var promises = [];

            encoderId = c_encoderIdForDecoderId[decoder.decoderInformation.codecId];
            if (!encoderId) {
                encoderId = c_defaultEncoderId;
            }

            // Crop original photo
            var transform = new Imaging.BitmapTransform();
            var bounds = {
                width: controlProps.crop.width,
                height: controlProps.crop.height,
                x: controlProps.crop.x,
                y: controlProps.crop.y
            };
            applyScale(bounds, controlProps.scale);

            // Don't crop past an edge
            bounds.x = Math.min(bounds.x, decoder.orientedPixelWidth - bounds.width);
            bounds.y = Math.min(bounds.y, decoder.orientedPixelHeight - bounds.height);

            transform.bounds = bounds;

            // Create promise to generate cropped photo
            var large;
            var getLarge = decoder.getPixelDataAsync(
                decoder.bitmapPixelFormat,
                decoder.bitmapAlphaMode,
                transform,
                Imaging.ExifOrientationMode.respectExifOrientation,
                Imaging.ColorManagementMode.colorManageToSRgb
            ).then(function (/*@type(Imaging.PixelDataProvider)*/pixelDataProvider) {
                large = new Storage.Streams.InMemoryRandomAccessStream();
                return Imaging.BitmapEncoder.createAsync(encoderId, large).then(function (/*@type(Imaging.BitmapEncoder)*/encoder) {
                    // Scale the cropped photo to user tile size
                    encoder.bitmapTransform.scaledWidth = c_userTileSize;
                    encoder.bitmapTransform.scaledHeight = c_userTileSize;
                    encoder.bitmapTransform.interpolationMode = Imaging.BitmapInterpolationMode.linear;

                    encoder.setPixelData(
                        decoder.bitmapPixelFormat,
                        decoder.bitmapAlphaMode,
                        bounds.width,
                        bounds.height,
                        decoder.dpiX,
                        decoder.dpiY,
                        pixelDataProvider.detachPixelData());
                    return encoder.flushAsync();
                });
            });
            promises.push(getLarge);

            var webReady;
            var photoStreamClone;

            // Re-encode original photo if we need to scale it and/or convert to supported codec
            if (controlProps.scale < 1 || Jx.isNullOrUndefined(c_encoderIdForDecoderId[decoder.decoderInformation.codecId])) {
                var originalWidth;
                var originalHeight;
                webReady = /*@static_cast(Storage.Streams.IRandomAccessStream)*/new Storage.Streams.InMemoryRandomAccessStream();

                // Create promise to generate uncropped photo
                photoStreamClone = photoStream.cloneStream();
                var getWebReady = Imaging.BitmapDecoder.createAsync(photoStreamClone).then(function (/*@type(Imaging.BitmapDecoder)*/webDecoder) {
                    originalWidth = webDecoder.pixelWidth;
                    originalHeight = webDecoder.pixelHeight;
                    return Imaging.BitmapEncoder.createForTranscodingAsync(webReady, webDecoder);
                }).then(function (encoder) {
                    if (controlProps.scale < 1) {
                        encoder.bitmapTransform.scaledWidth = originalWidth * controlProps.scale;
                        encoder.bitmapTransform.scaledHeight = originalHeight * controlProps.scale;
                        encoder.bitmapTransform.interpolationMode = Imaging.BitmapInterpolationMode.linear;
                    }
                    return encoder.flushAsync();
                });
                promises.push(getWebReady);
            } else {
                webReady = photoStream;
            }

            // Set user tile when both images are ready
            WinJS.Promise.join(promises).done(function () {
                var crop = controlProps.crop;
                if (controlProps.scale > 1) {
                    // Shrink crop position to account for the scaled-up photo
                    applyScale(crop, controlProps.scale);
                }

                // Validate crop
                crop.x = Math.min(crop.x, controlProps.photoWidth - crop.width);
                crop.y = Math.min(crop.y, controlProps.photoHeight - crop.height);

                // Set user tile
                that._person.setUserTile(webReady, large, crop);

                // Write to windows
                if (Windows.System.UserProfile.UserInformation.accountPictureChangeEnabled) {
                    var auth = new Windows.Security.Authentication.OnlineId.OnlineIdAuthenticator();
                    if (!auth.canSignOut) {
                        // Non-local account
                        var largeRandomAccessStream = /*@static_cast(Storage.Streams.IRandomAccessStream)*/large;
                        Windows.System.UserProfile.UserInformation.setAccountPicturesFromStreamsAsync(null, largeRandomAccessStream, null);
                    }
                }

                // Close streams
                closeStream(photoStream);
                closeStream(photoStreamClone);
             
                // Remove temp file
                if (that._photoProperties.tempFile) {
                    that._photoProperties.tempFile.deleteAsync();
                }
            }, function () {
                // Close streams
                closeStream(photoStream);
                closeStream(photoStreamClone);
            });
        }, Jx.fnEmpty);
    };

    prototype._onResize = function () {
        ///<summary>Handles resize events by updating the display</summary>
        var controlProps = this._controlProperties;
        var scroller = this._elements.scroller;

        // Cancel dragging
        this._dragging = false;

        // Note the scroll positions before we properly resize the scroller
        var oldX = this._snappedX === -1 ? scroller.scrollLeft - controlProps.scrollLimitLeft : this._snappedX;
        var oldY = this._snappedY === -1 ? scroller.scrollTop - controlProps.scrollLimitTop : this._snappedY;

        // Now we can let the scroller auto-fill the correct space
        scroller.style.width = scroller.style.height = "";

        // Update display
        this._setUpMask();
        this._setDimensions();

        // Find scroll limits
        this._updateScroller();

        // Restore crop position
        if (isSnapped()) {
            // We do not want to scroll in snapped view as that makes the view looks weird. 
            // Instead, we remember the scroll position and use it when user unsnapped. 
            this._snappedX = oldX;
            this._snappedY = oldY;
        } else {
            this._snappedX = this._snappedY = -1;
            this._scrollTo(controlProps.scrollLimitLeft + oldX, controlProps.scrollLimitTop + oldY);
        }
    };

    prototype._onMSPointerDown = function (/*@dynamic*/ev) {
        ///<summary>Handles pointer down event over photo hit target</summary>
        // Only respond to left mouse button events
        if (!this._dragging && ((ev.pointerType === "mouse" || ev.pointerType === ev.MSPOINTER_TYPE_MOUSE) && ev.button === 0)) {
            this._dragging = true;

            // Note starting offsets
            this._offsetLeft = this._startingOffsetLeft = parseInt(this._elements.photo.style[c_left]);
            this._offsetTop = this._startingOffsetTop = this._elements.photo.offsetTop;

            // Note starting mouse position
            this._lastX = ev.clientX;
            this._lastY = ev.clientY;

            // Attach mouse listeners
            this._elements.container.addEventListener("MSPointerMove", this._MSPointerMoveListener, false);
            window.addEventListener("MSPointerUp", this._MSPointerUpListener, false);
        }
    };

    prototype._onMSPointerMove = function (/*@type(Event)*/ev) {
        ///<summary>Handles pointer move event over photo hit target</summary>
        if (this._dragging) {
            var horizontal = ev.clientX - this._lastX;
            var vertical = ev.clientY - this._lastY;
            var scroller = this._elements.scroller;
            if (horizontal) {
                var dx = horizontal / scroller.msContentZoomFactor;
                this._offsetLeft += c_rtl ? -dx : dx;
                this._lastX = ev.clientX;
            }
            if (vertical) {
                this._offsetTop += vertical / scroller.msContentZoomFactor;
                this._lastY = ev.clientY;
            }
            this._movePhoto(this._offsetLeft, this._offsetTop);
        }
    };

    prototype._onMSPointerUp = function (/*@dynamic*/ev) {
        ///<summary>Handles pointer up event over photo hit target</summary>
        // Cancel dragging
        if (this._dragging && ((ev.pointerType === "mouse" || ev.pointerType === ev.MSPOINTER_TYPE_MOUSE) && ev.button === 0)) {
            this._dragging = false;
            var photo = this._elements.photo;
            var scroller = this._elements.scroller;

            var moveLeft = this._startingOffsetLeft - parseInt(photo.style[c_left]);
            var moveTop = this._startingOffsetTop - photo.offsetTop;

            // Move back to the starting position
            this._movePhoto(this._startingOffsetLeft, this._startingOffsetTop);
            this._scrollTo(scroller.scrollLeft + moveLeft, scroller.scrollTop + moveTop);

            this._elements.container.removeEventListener("MSPointerMove", this._MSPointerMoveListener, false);
            window.removeEventListener("MSPointerUp", this._MSPointerUpListener, false);
        }
    };

    prototype._onMouseWheel = function (/*@type(Event)*/ev) {
        ///<summary>Handles mousewheel ctrl-scrolling</summary>
        if (ev.ctrlKey) {
            this._doZoom(ev.wheelDelta / 120);
        }
        ev.preventDefault();
    };

    prototype._onKeyDown = function (/*@type(Event)*/ev) {
        ///<summary>Handles key down events by scrolling or zooming</summary>
        var key = WinJS.Utilities.Key;
        var scroller = this._elements.scroller;
        var scrollDelta = c_keyboardDelta / scroller.msContentZoomFactor;

        switch (ev.keyCode) {
            case key.add:
            case key.equal:
                if (ev.ctrlKey) {
                    this._doZoom(1); // Zoom in
                }
                break;
            case key.subtract:
            case key.dash:
                if (ev.ctrlKey) {
                    this._doZoom(-1); // Zoom out
                }
                break;
            case key.upArrow:
                scroller.scrollTop -= scrollDelta;
                ev.preventDefault();
                break;
            case key.downArrow:
                scroller.scrollTop += scrollDelta;
                ev.preventDefault();
                break;
            case key.leftArrow:
                // Don't override alt-left for back navigation
                if (!ev.altKey) {
                    scroller.scrollLeft -= scrollDelta * (c_rtl ? -1 : 1);
                    ev.preventDefault();
                }
                break;
            case key.rightArrow:
                scroller.scrollLeft += scrollDelta * (c_rtl ? -1 : 1);
                ev.preventDefault();
                break;
            case key.space:
            case key.pageDown:
            case key.pageUp:
            case key.home:
            case key.end:
                // Prevent native scrolling
                ev.preventDefault();
                break;
        }
    };

    prototype._onZoom = function () {
        ///<summary>Zoom handler</summary>
        
        if (this._etwTask) {
            NoShip.People.etw(this._etwTask + "_end");
        }
        

        // For smooth zooming, and snap-back effect, only update scroll range after a series of zoom events.
        if (this._updateScrollerHandle) {
            msClearImmediate(this._updateScrollerHandle);
        }
        this._updateScrollerHandle = msSetImmediate(this._updateScroller.bind(this));
    };

    prototype._doZoom = function (dz) {
        ///<summary>Zooms by the specified amount</summary>
        ///<param name="dz" type="Number">Increment to zoom by. Positive axis corresponds with zooming in.</param>
        
        this._etwTask = dz > 0 ? "mePicZoomIn" : "mePicZoomOut";
        NoShip.People.etw(this._etwTask + "_start");
        

        var scroller = this._elements.scroller;

        var oldZoom = scroller.msContentZoomFactor;
        var newZoom = oldZoom * (dz > 0 ? 1.1 : (1 / 1.1));

        // Disallow zooming past minimum or maximum
        if (((dz > 0) && (oldZoom >= this._controlProperties.zoomMax - c_zoomEpsilon)) ||
            ((dz < 0) && (oldZoom <= this._controlProperties.zoomMin + c_zoomEpsilon))) {
            return;
        }

        // Remove scroll limits
        scroller.style.msScrollLimitXMin = scroller.style.msScrollLimitXMax =
            scroller.style.msScrollLimitYMin = scroller.style.msScrollLimitYMax = "";

        // Set new zoom and scroll position
        scroller.msContentZoomFactor = newZoom;

        this._scrollTo(scroller.scrollLeft +
                        (scroller.clientWidth * (1 / oldZoom - 1 / scroller.msContentZoomFactor)) / 2,
                        scroller.scrollTop +
                        (scroller.clientHeight * (1 / oldZoom - 1 / scroller.msContentZoomFactor)) / 2);

        // Add scroll limits
        this._updateScroller();
    };

    prototype._zoomToFit = function () {
        ///<summary>Zooms all the way out and centers</summary>
        
        this._etwTask = "mePicZoomToFit";
        NoShip.People.etw(this._etwTask + "_start");
        

        // Zoom and update scroll limits
        this._elements.scroller.msContentZoomFactor = this._controlProperties.zoomMin;
        this._updateScroller();
        this._centerImage();
    };

    prototype._scrollTo = function (scrollLeft, scrollTop) {
        ///<summary>Sets both scroll positions simultaneously</summary>
        ///<param name="scrollLeft" type="Number"/>
        ///<param name="scrollTop" type="Number"/>
        var anchor = this._elements.anchor;
        setPos(anchor, scrollLeft, scrollTop);
        anchor.scrollIntoView();
    };

    prototype._centerImage = function (zoom) {
        ///<summary>Scrolls to center the image within the container</summary>
        ///<param name="zoom" type="Number" optional="true">If specified, zoom will be used in calculating center</param>
        var scroller = this._elements.scroller;
        var inner = this._elements.inner;

        if (Jx.isNullOrUndefined(zoom)) {
            zoom = scroller.msContentZoomFactor;
        }
        scroller.scrollLeft = (inner.clientWidth - scroller.clientWidth / zoom) / 2;
        scroller.scrollTop = (inner.clientHeight - scroller.clientHeight / zoom) / 2;
    };

    prototype._updateScroller = function () {
        ///<summary>Updates scroll limits for new zoom</summary>
        var scroller = this._elements.scroller;
        var container = this._elements.container;
        var controlProps = this._controlProperties;
        var zoom = scroller.msContentZoomFactor;
        var buttonsControl = this._buttonsControl;

        var zoomIn = (zoom >= controlProps.zoomMax - c_zoomEpsilon);
        buttonsControl.disableButton("zoomIn", zoomIn);

        var zoomOut = (zoom <= controlProps.zoomMin + c_zoomEpsilon);
        buttonsControl.disableButton("zoomOut", zoomOut);

        var cropOffsetWidth = (container.clientWidth - c_userTileSize) / 2;
        var cropOffsetHeight = (container.clientHeight - c_userTileSize) / 2;

        var calculateMinMax = function (minScroll, photo, cropOffset) {
            // Distance to top of photo, minus the crop offset
            // Floor and ceil so we don't have whitespace inside crop window
            var min = Math.ceil(Math.floor((minScroll - photo) / 2) - cropOffset / zoom);
            var max = Math.max(Math.floor(Math.floor((minScroll + photo) / 2) - (cropOffset + c_userTileSize) / zoom), 0);
            min = Math.min(min, max);
            return { min: min, max: max };
        };

        var yLimits = calculateMinMax(controlProps.minScrollHeight, controlProps.photoHeight, cropOffsetHeight);
        controlProps.scrollLimitTop = yLimits.min;
        scroller.style.msScrollLimitYMin = String(yLimits.min) + "px";
        scroller.style.msScrollLimitYMax = String(yLimits.max) + "px";

        var xLimits = calculateMinMax(controlProps.minScrollWidth, controlProps.photoWidth, cropOffsetWidth);
        controlProps.scrollLimitLeft = xLimits.min;
        scroller.style.msScrollLimitXMin = String(xLimits.min) + "px";
        scroller.style.msScrollLimitXMax = String(xLimits.max) + "px";
    };

    prototype._movePhoto = function (x, y) {
        setPos(this._elements.photo, x, y);
        setPos(this._elements.hitTarget, x, y);
    };

    prototype._sizePhoto = function (width, height) {
        this._elements.photo.width = width;
        this._elements.photo.height = height;
        setSize(this._elements.hitTarget, width, height);
        this._controlProperties.photoWidth = width;
        this._controlProperties.photoHeight = height;
    };

    prototype._sizeControls = function (width, height) {
        setSize(this._elements.inner, width, height);
        setSize(this._elements.hitTargetZoom, width, height);
        this._controlProperties.minScrollWidth = width;
        this._controlProperties.minScrollHeight = height;
    };

    function getCropPosition(xpos, photoWidth, cropWidth) {
        return c_rtl ? photoWidth - cropWidth - xpos : xpos;
    };

    function closeStream(stream) {
        var streamOperation = /*@static_cast(Windows.Foundation.IAsyncOperation)*/stream;
        if (streamOperation) {
            streamOperation.close();
        }
    };

    function setSize(element, width, height) {
        element.style.width = String(width) + "px";
        element.style.height = String(height) + "px";
    }

    function setPos(element, x, y) {
        element.style[c_left] = String(x) + "px";
        element.style.top = String(y) + "px";
    }

    function applyScale(object, scale) {
        for (var prop in object) {
            object[prop] = Math.round(object[prop] / scale);
        }
    }

    function getEscapedString(id) {
        return Jx.escapeHtml(Jx.res.getString("/meStrings/" + id));
    }

    function isSnapped() {
        return ViewManagement.ApplicationView.value === ViewManagement.ApplicationViewState.snapped;
    }

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var ButtonsControl = /*@constructor*/function () {
        this._buttons = {};
    };
    /// <enable>JS2076.IdentifierIsMiscased</enable>
    ButtonsControl.prototype.addButton = function (button) {
        /// <param name="button" type="ZoomButton"/>
        var buttonName = button.getName();
        Debug.assert(this._buttons[buttonName] === undefined, "Already have a button with the buttonName: " + buttonName);
        this._buttons[buttonName] = button;
    };
    ButtonsControl.prototype.disableButton = function (buttonName, disabled) {
        Debug.assert(this._buttons[buttonName] !== undefined, "Cannot find the given buttonName: " + buttonName);
        this._buttons[buttonName].disabled(disabled);
    };
    ButtonsControl.prototype.getUI = function () {
        var buttons = this._buttons;
        var buttonsUI = "<div id='profilePicture-buttons'>";
        for (var buttonName in buttons) {
            buttonsUI += buttons[buttonName].getUI();
        }
        buttonsUI += "</div>";
        return buttonsUI;
    };
    ButtonsControl.prototype.activate = function () {
        var buttons = this._buttons;
        for (var buttonName in buttons) {
            buttons[buttonName].activate();
        }
    };

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var ZoomButton = /*@constructor*/function (buttonName, symbol, eventHandler, keyboardShortcut) {
        /// <param name="keyboardShortcut" type="String" optional="true">Optional params for keyboard shortcut</param>
        this._name = buttonName;
        this._id = "profilePicture-" + buttonName;
        this._symbol = symbol;
        this._eventHandler = eventHandler;
        this._keyboardShortcut = keyboardShortcut ? keyboardShortcut : null;
        this._element = null;
    };
    /// <enable>JS2076.IdentifierIsMiscased</enable>
    ZoomButton.prototype.getUI = function () {
        var stringId = "picCtrl_" + this._name;
        var ariaLabel = getEscapedString(stringId);
        var titleId = stringId + "_tooltip";

        var compoundString = function getEscapedCompoundString(values) {
            return Jx.escapeHtml(Jx.res.loadCompoundString("/meStrings/" + titleId, values));
        };
        var title = this._keyboardShortcut ? compoundString([Jx.key.getLabel(this._keyboardShortcut)]) : getEscapedString(titleId);

        return "<div id='" + this._id + "' class='profilePicture-button' tabIndex='0' role='button' aria-label='" + ariaLabel + "' title='" + title + "'>" +
                    this._symbol +
                "</div>";
    };
    ZoomButton.prototype.activate = function () {
        var element = this._element = document.getElementById(this._id);
        element.addEventListener("click", this._eventHandler, false);
        element.addEventListener("keydown", this._onKeyDown.bind(this), false);
        P.Animation.addPressStyling(element);
    };
    ZoomButton.prototype.disabled = function (disabled) {
        ///<param name="disabled" type="Boolean"/>
        var element = this._element;
        element.disabled = disabled;
        element.setAttribute("aria-disabled", String(disabled));
    };
    ZoomButton.prototype._onKeyDown = function (ev) {
        ///<summary>A keydown event handler that tracks pressed state</summary>
        ///<param name="ev" type="Event"/>
        if ((ev.key === "Enter" || ev.key === "Spacebar")) {
            this._eventHandler();
            if (!Jx.hasClass(ev.target, "pressed")) {
                Jx.addClass(ev.target, "pressed");

                var onKeyUp = function () {
                    document.removeEventListener("keyup", onKeyUp, false);
                    Jx.removeClass(ev.target, "pressed");
                };
                document.addEventListener("keyup", onKeyUp, false);
            }
        }
    };
    ZoomButton.prototype.getName = function () {
        return this._name;
    };
});
