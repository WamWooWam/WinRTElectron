
// global variable to store the ShareTargetActivationContext object
var shareOperation = null;
var displayText = true;
var totalUploadCount;
var uploadCompletedCounter;
var uploadFailedCounter;


/// <summary>
/// Build the target UI based on the datapackage content. This is called after activation
/// </summary>
function onLoad() {
    if (shareOperation) {

        toggleVisibility("targetIdDiv");
        toggleVisibility("ImagePreviewDiv");
        toggleVisibility("TextPreviewDiv");
        toggleVisibility("WebLinkPreviewDiv");
        toggleVisibility("ApplicationLinkPreviewDiv");
        toggleVisibility("thumbnailPreviewDiv");
        logText("Activated for the share contract");

        id("targetId").value = "";
        try {

            // Source app info
            MSApp.execUnsafeLocalFunction(function () { id("sourceInfo").innerHTML += "We are getting data from app: "; });
            if (shareOperation.data.properties.applicationName) {
                MSApp.execUnsafeLocalFunction(function () { id("sourceInfo").innerHTML += shareOperation.data.properties.applicationName + "<BR>"; });
            } else {
                MSApp.execUnsafeLocalFunction(function () { id("sourceInfo").innerHTML += "No information about the source<BR>"; });
            }
            MSApp.execUnsafeLocalFunction(function () { id("sourceInfo").innerHTML += "Link to the source app: "; });
            if (shareOperation.data.properties.applicationListingUri) {
                MSApp.execUnsafeLocalFunction(function () { id("sourceInfo").innerHTML += shareOperation.data.properties.applicationListingUri.absoluteUri + "<BR>"; });
            } else {
                MSApp.execUnsafeLocalFunction(function () { id("sourceInfo").innerHTML += "No information about the source<BR>"; });
            }
             MSApp.execUnsafeLocalFunction(function () { id("sourceInfo").innerHTML += "Content source web link: "; });
            if (shareOperation.data.properties.contentSourceWebLink) {
                MSApp.execUnsafeLocalFunction(function () { id("sourceInfo").innerHTML += shareOperation.data.properties.contentSourceWebLink.absoluteUri + "<BR>"; });
            } else {
                MSApp.execUnsafeLocalFunction(function () { id("sourceInfo").innerHTML += "None<BR>"; });
            }
            MSApp.execUnsafeLocalFunction(function () { id("sourceInfo").innerHTML += "Content source application link: "; });
            if (shareOperation.data.properties.contentSourceApplicationLink) {
                MSApp.execUnsafeLocalFunction(function () { id("sourceInfo").innerHTML += shareOperation.data.properties.contentSourceApplicationLink.absoluteUri + "<BR>"; });
            } else {
                MSApp.execUnsafeLocalFunction(function () { id("sourceInfo").innerHTML += "None<BR>"; });
            }

            // if there is a thumbnail preview, display it
            MSApp.execUnsafeLocalFunction(function () { id("TitlePreview").value += shareOperation.data.properties.title; });
            MSApp.execUnsafeLocalFunction(function () { id("DescrPreview").value += shareOperation.data.properties.description; });

            try {
                logText("Retrieving thumbnail...");
                if (shareOperation.data.properties.thumbnail) {
                    shareOperation.data.properties.thumbnail.openReadAsync().then(function (thumbnailStream) {
                        toggleVisibility("thumbnailPreviewDiv");
                        _displayImageFromStream(thumbnailStream, "ThumbnailPreview");
                    });
                } else {
                    logText("No thumbnail was found");
                }

            } catch (excep) {
                logText("Exception thrown: " + excep);
            }

            //
            // log the data received based on data type
            //

            // HTML content
            if (shareOperation.data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.html)) {
                shareOperation.data.getHtmlFormatAsync().then(function (html) {

                    // Extract the HTML fragment from the HTML format
                    var htmlFragment = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.getStaticFragment(html);
                    MSApp.execUnsafeLocalFunction(function () { id("TextPreview").value += htmlFragment; });

                    // Set the plaintext field
                    id("htmlPlainText").innerText = html;

                    // Set the innerHTML of the iframe to the HTML fragment
                    var iFrame = id("htmlContent");
                    id("htmlPreview").style.display = "";
                    MSApp.execUnsafeLocalFunction(function () { id("htmlContent").contentDocument.documentElement.innerHTML = htmlFragment; });

                    // Now we loop through any images and use the resourceMap to map each image element's src
                    var images = iFrame.contentDocument.documentElement.getElementsByTagName("img");
                    logText("Retrieving images in the fragment: " + images.length);
                    var blob = null;
                    if (images.length > 0) {
                        shareOperation.data.getResourceMapAsync().then(function (resourceMap) {
                            for (var i = 0, len = images.length; i < len; i++) {
                                logText("Handling image #" + i);
                                var streamReference = resourceMap[images[i].getAttribute("src")];
                                // Call a helper function to map the image element's src to a corresponding blob URL generated from the resourceMap
                                setResourceMapURL(streamReference, resourceMap, images[i]);
                            }
                        });
                    }
                });
                displayText = false;
            } else {
                toggleVisibility("htmlPreview");
            }

            // TEXT content
            if (shareOperation.data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.text)) {
                shareOperation.data.getTextAsync().then(function (text) {

                    toggleVisibility("TextPreviewDiv");

                    if (displayText === true) {

                        MSApp.execUnsafeLocalFunction(function () { id("TextPreview").value += text; });
                    } else {
                        //MSApp.execUnsafeLocalFunction(function () { id("TextPreview").value += text.substring(0, 25) + "..."; });
                        MSApp.execUnsafeLocalFunction(function () { id("TextPreview").value += text; });

                    }
                });
            }

            // URI content
            if (shareOperation.data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink)) {
                shareOperation.data.getWebLinkAsync().then(function (uri) {
                    toggleVisibility("WebLinkPreviewDiv");
                    MSApp.execUnsafeLocalFunction(function () { id("WebLinkPreview").value += uri.absoluteUri; });
                });
            }
            if (shareOperation.data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.applicationLink)) {
                shareOperation.data.getApplicationLinkAsync().then(function (uri) {
                    toggleVisibility("ApplicationLinkPreviewDiv");
                    MSApp.execUnsafeLocalFunction(function () { id("ApplicationLinkPreview").value += uri.absoluteUri; });
                });
            }

        } catch (ex) {
            logText(">>> onLoad: Exception: " + ex);
        }
    }
}

/// <summary>
/// Handler executed on activation of the target
/// </summary>
/// <param name="eventArgs">
/// Arguments of the event. In the case of the Share contract, it has the ShareTargetActivationContext
/// </param>
function activatedHandler(eventArgs) {
    logText("ActivatedHandler: Entering...");
    // in this sample we only do something if it was activated with the Share contract
    if (eventArgs.kind === Windows.ApplicationModel.Activation.ActivationKind.shareTarget) {
        // we receive the Share activation context as part of the eventArgs
        shareOperation = eventArgs.shareOperation;
    }
}

/// <summary>
/// Sets the blob URL for an image element based on a reference to an image stream within a resource map
/// </summary>
function setResourceMapURL(streamReference, resourceMap, imageElement) {
    logText("setResourceMapURL");
    if (streamReference) {
        logText("streamReference is set properly");
        streamReference.openReadAsync().then(function (imageStream) {
            if (imageStream) {
                blob = MSApp.createBlobFromRandomAccessStream(imageStream.contentType, imageStream);
                var url = URL.createObjectURL(blob);
                imageElement.src = url;
            }
        });
    }
}

/// <summary>
/// Log messages on screen
/// </summary>
/// <param name="msg">
/// The message to be displayed in the on-screen logging area.
/// </param>
function logText(msg) {
    MSApp.execUnsafeLocalFunction(function () { id("logTxt").innerHTML += msg + "<BR>"; });
}

/// <summary>
/// Log messages on screen in the data preview section
/// </summary>
/// <param name="msg">
/// The message to be displayed in the on-screen logging area.
/// </param>
function logDataPreview(msg) {
    MSApp.execUnsafeLocalFunction(function () { id("dataPreviewText").innerHTML += msg + "<BR>"; });
}

/// <summary>
/// Log messages on screen and render HTML content
/// </summary>
/// <param name="html">
/// The message to be displayed in the on-screen logging area.
/// </param>
function logHtmlPreview(html) {
    id("htmlPreview").style.display = "";

    var index = html.indexOf("<HTML", 0);
    var trimmedHtml = html.substring(index);
    MSApp.execUnsafeLocalFunction(function () { id("htmlContent").contentDocument.documentElement.innerHTML = trimmedHtml; });
}

/// <summary>
/// Display the image contained in a stream to a specific location in the HTML page
/// </summary>
function _displayImageFromStream(bitmapStream, imageLocation) {
    try {

        var img = id(imageLocation);
        var blob = window.MSApp.createBlobFromRandomAccessStream(bitmapStream.contentType, bitmapStream);
        var url = window.URL.createObjectURL(blob, {oneTimeOnly: true});
        img.src = url;
        MSApp.execUnsafeLocalFunction(function () { id("statusText").value = "Bitmap - Success"; });
    } catch (ex) {
        logDataPreview("Issue while displaying the bitmap: " + ex);
        MSApp.execUnsafeLocalFunction(function () { id("statusText").value = "Bitmap - failed! See logging for details..."; });
    }
}

/// <summary>
/// Toggle the visibility (hide/show) of an HTML element in the page
/// </summary>
function toggleVisibility(objectId) {
    var elt = id(objectId);
    if (elt.style.display !== 'none') {
        elt.style.display = 'none';
    } else {
        elt.style.display = '';
    }
}

/// <summary>
/// Programmatic invocation of the Share flow from the target
/// </summary>
function showShareUI() {
    logText("call ShowShareUI...");
    Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
    logText("Done!");
}

/// <summary>
/// return the element by id
/// </summary>
function id(elementId) {
    return document.getElementById(elementId);
}

// Initialize the activation handler
Windows.UI.WebUI.WebUIApplication.addEventListener("activated", activatedHandler, false);