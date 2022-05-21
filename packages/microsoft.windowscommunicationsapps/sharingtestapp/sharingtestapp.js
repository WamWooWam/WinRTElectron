
// Copyright (C) Microsoft. All rights reserved.

/// <reference path="SharingTestApp.dep.js" />

// namespace obj
window.SharingTest = window.SharingTest || {};

var hasTransitionedToInline = false;
var inlineApp = /*@static_cast(SharingTest.InlineAppHelper)*/null; // app that was actually created inline
var inlineApps = []; // list of apps that can be created inline

var packageTitle = null;

var isDefaultShare = false;

var sharingManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
sharingManager.addEventListener("datarequested", sharingDataRequested);

var testSoxeUrl = getTestSoxeUrl();

// Current "contents" of the data package
// Data package is built on the fly using this information.
var dataPackageText = /*@static_cast(String)*/null;
var dataPackageWebLink = /*@static_cast(Windows.Foundation.Uri)*/null;
var dataPackageApplicationLink = /*@static_cast(Windows.Foundation.Uri)*/null;
var dataPackageSourceWebLink = /*@static_cast(Windows.Foundation.Uri)*/null;
var dataPackageSourceApplicationLink = /*@static_cast(Windows.Foundation.Uri)*/null;
var dataPackageHtml = /*@static_cast(String)*/null;
var dataPackageBitmap = null;
var dataPackageFiles = /*@static_cast(Array)*/null;
var dataPackageFolder = /*@static_cast(Array)*/null;
var dataRetrievalTime = /*@static_cast(Number)*/null;
var dataPackageHtmlFiles = /*@static_cast(Array)*/null; 

function initialize() {
    /// <summary>
    /// Initializes required information for the test app
    /// </summary>

    Jx.log.level = Jx.LOG_VERBOSE;

    Jx.app = new Jx.Application();

    var inlineFolderName = "inlineApps";

    // Dynamically include files from "inlineApps" folder
    // This allows various apps to drop scripts that will allow the test app to show their app inline
    // See the SharingTestApp.dep.js file for more info
    var appRootFolder = /*@static_cast(Windows.Storage.Search.IStorageFolderQueryOperations)*/Windows.ApplicationModel.Package.current.installedLocation;
    var options = new Windows.Storage.Search.QueryOptions(Windows.Storage.Search.CommonFileQuery.orderBySearchRank, [".js", ".css"]);
    options.userSearchFilter = "folder:" + inlineFolderName;
    var search = appRootFolder.createFileQueryWithOptions(options);
    search.getFilesAsync().done(
        function inlineFilesSuccess(inlineFiles) {
            /// <param name="inlineFiles" type="Array"></param>
            for (var i = 0; i < inlineFiles.length; i++) {
                var file = /*@static_cast(Windows.Storage.StorageFile)*/inlineFiles[i];

                // Get relative file path starting with /sharingTestApp/
                var filePath = file.name;
                var folderIndex = file.path.indexOf(inlineFolderName);
                if (folderIndex !== -1 && file.path.length > (folderIndex + inlineFolderName.length + 1)) {
                    filePath = "/sharingTestApp/" + inlineFolderName + file.path.substr(folderIndex + inlineFolderName.length);
                }

                // get the file extension
                var array = file.name.split(".");
                var ext = array[array.length - 1];

                if (ext === "js") {
                    includeJs(filePath);
                } else if (ext === "css") {
                    includeCss(filePath);
                }
            }
        },
        function inlineFilesError() {
            Jx.log.verbose("No inline files found, disabling inline view");
        });
}

function suspending () {
    ///<summary>
    /// Handles app suspend/close: call into inline app's shutdown method.
    ///</summary>

    if (hasTransitionedToInline && Boolean(inlineApp)) {

        inlineApp.shutdown();
        inlineApp = null;

        document.body.innerHTML = "The share target test application has been suspended and does not support resume";
    }
}

Windows.UI.WebUI.WebUIApplication.addEventListener("suspending", suspending);
window.addEventListener("beforeunload", suspending, false);

function addInlineApp(inlineAppHelper) {
    /// <summary>
    /// Adds an app to the list of apps that can be created inline
    /// </summary>
    /// <param name="inlineAppHelper" type="SharingTest.InlineAppHelper">appHelper to create the inline app</param>

    // See SharingTestApp.dep.js for more info on this general feature

    var index = inlineApps.length;
    inlineApps.push(inlineAppHelper);

    var appOption = document.createElement("option");
    appOption.value = index;
    appOption.text = inlineAppHelper.name;

    var inlineSelect = document.getElementById("inlineSelect");
    inlineSelect.appendChild(appOption);
    inlineSelect.style.display = "";

    document.getElementById("inlineShareButton").style.display = "";
}

function createInline () {
    ///<summary>
    /// Grabs the current data package and switches the current UI to a mode that contains the sharing target component
    ///</summary>

    // Hide the configuration UI, show the share target UI
    document.getElementById("shareConfigure").style.display = "none";
    document.getElementById("shareTargetDisplay").style.display = "block";

    // Create mock share operation that contains the data package
    var shareOperation = /*@static_cast(Windows.ApplicationModel.DataTransfer.ShareTarget.ShareOperation)*/{
        data: getDataPackage().getView(),
        reportCompleted: doneTransfer,
        reportError: doneTransfer,
        reportStarted: function () {}
    };

    // Create the app and pass the share information
    var appIndex = document.getElementById("inlineSelect").value;
    inlineApp = /*@static_cast(SharingTest.InlineAppHelper)*/ inlineApps[appIndex];
    inlineApp.create(shareOperation);

    hasTransitionedToInline = true;
}

function doneTransfer () {
    /// <summary>
    /// Mock of DoneTransfer so that the fake inline share experience can call it.
    /// </summary>
    
    window.close();
}

function showSoxeOptions() {
    ///<summary>
    /// Shows a popup to prompt for SOXE configuration
    ///</summary>

    document.getElementById("soxeTestOptions").style.display = "block";
    document.getElementById("soxeSave").addEventListener("click", saveSoxeOptions, false);
}

function saveSoxeOptions() {
    ///<summary>
    /// Closes the popup for SOXE configuration, saves the result.
    ///</summary>

    document.getElementById("soxeTestOptions").style.display = "none";

    testSoxeUrl = getTestSoxeUrl();

    if (!document.getElementById("soxeReal").checked) {
        if (window.Share) {
            Share.SOXE._soxeUrlOverride = testSoxeUrl;
        }
    }
}

function getTestSoxeUrl() {
    ///<summary>
    /// Retrieves the test SOXE URL from the test SOXE form data.
    ///</summary>
    var form = document.forms["soxeTestForm"];

    var soxeHandlerUrl = "http://bvt.samples.live-int.com/MVCTest/ShareAnythingtestSoxeHandler/?";

    // JsCop doesn't currently handle form.elements.  Not worth fixing for this code.
    /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>

    // Add form values to URL
    for (var i = 0; i < form.elements.length; i++) {
        var element = /*@static_cast(HTMLElement)*/form.elements[i];
        if (element.name === "save") {
            // Skip the save button
            continue;
        }

        soxeHandlerUrl += element.name + "=" + encodeURIComponent(element.value) + "&";
    }
    /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>

    return soxeHandlerUrl;
}

function sharingDataRequested (ev) {
    ///<summary>
    /// This function handles the callback sent by Windows when sharing data is requested.
    ///</summary>
    ///<param name="ev" type="Windows.ApplicationModel.DataTransfer.DataRequestedEventArgs"></param>

    if (!isDefaultShare) {
        ev.request.data = getDataPackage();
    }
    // else, For default share, use the windows default by not providing anything
}

function setupExecutionTime () {
    ///<summary>
    /// Retrieves the data load execution time from the user input textbox
    ///</summary>
    ///<remarks>Defaults to no delay if not specified</remarks>
    
    var rawTime = document.getElementById("timeBox").value;
    var intTime = parseInt(rawTime);
    var finalTime = null;

    if (Jx.isNumber(intTime) && !isNaN(intTime)) {
        finalTime = intTime;
    }
    
    dataRetrievalTime = finalTime;
}

function getDataPackage () {
    ///<summary>
    /// retrieves the data package based on current page contents / dataPackage globals
    ///</summary>

    var packageToShare = new Windows.ApplicationModel.DataTransfer.DataPackage();

    // Set up title/description/subject
    
    packageToShare.properties.title = getTitle();

    var description = getDescription();
    if (description !== null) {
        packageToShare.properties.description = description;
    }

    var subject = getSubject();
    if (subject !== null) {
        // Probably related to WinLive 470615
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        packageToShare.properties.insert("subject", subject);
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
    }

    if (dataPackageSourceWebLink !== null) {
        packageToShare.properties.contentSourceWebLink = dataPackageSourceWebLink;
    }

    if (dataPackageSourceApplicationLink !== null) {
        packageToShare.properties.contentSourceApplicationLink = dataPackageSourceApplicationLink;
    }

    // Save the execution time out of the textbox into local state
    setupExecutionTime();

    // Set the data on the package
    if (dataRetrievalTime !== null) {
        // Need to use a delay
        if (dataPackageText !== null) {
            packageToShare.setDataProvider(
                Windows.ApplicationModel.DataTransfer.StandardDataFormats.text,
                getDelayLoadDataHandler(dataPackageText));
        }

        if (dataPackageWebLink !== null) {
            packageToShare.setDataProvider(
                Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink,
                getDelayLoadDataHandler(dataPackageWebLink));
        }

        if (dataPackageApplicationLink !== null) {
            packageToShare.setDataProvider(
                Windows.ApplicationModel.DataTransfer.StandardDataFormats.applicationLink,
                getDelayLoadDataHandler(dataPackageApplicationLink));
        }

        if (dataPackageHtml !== null) {
            packageToShare.setDataProvider(
                Windows.ApplicationModel.DataTransfer.StandardDataFormats.html,
                getDelayLoadDataHandler(dataPackageHtml));

            if (dataPackageHtmlFiles) {
                for (var j = 0; j < dataPackageHtmlFiles.length; j++) {
                    packageToShare.resourceMap["resourceMapImg" + j.toString()] = dataPackageHtmlFiles[j];
                }
            }
        }

        if (dataPackageBitmap !== null) {
            packageToShare.setDataProvider(
                Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap,
                getDelayLoadDataHandler(dataPackageBitmap));
        }

        if (dataPackageFiles !== null) {
            // Also need to set file types for this, so that the sharing platform can properly set up the share.
            var fileTypes = [];
            for (var i = 0; i < dataPackageFiles.length; i++) {
                fileTypes.push(dataPackageFiles[i].fileType);
            }

            // Probably related to WinLive 470615
            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            packageToShare.properties.fileTypes.replaceAll(fileTypes);
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>

            packageToShare.setDataProvider(
                Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems,
                getDelayLoadDataHandler(dataPackageFiles));
        }

    } else {
        // No delay, just set data.
        if (dataPackageText !== null) {
            packageToShare.setText(dataPackageText);
        }

        if (dataPackageWebLink !== null) {
            packageToShare.setWebLink(dataPackageWebLink);
        }

        if (dataPackageApplicationLink !== null) {
            packageToShare.setApplicationLink(dataPackageApplicationLink);
        }

        if (dataPackageHtml !== null) {
            packageToShare.setHtmlFormat(dataPackageHtml);

            if (dataPackageHtmlFiles) {
                for (var k = 0; k < dataPackageHtmlFiles.length; k++) {
                    packageToShare.resourceMap["resourceMapImg" + k.toString()] = dataPackageHtmlFiles[k];
                }
            }
        }

        if (dataPackageBitmap !== null) {
            packageToShare.setBitmap(dataPackageBitmap);
        }

        // Technically the files may not have finished loading by now
        // but this is a test app - we can make the consumers wait for that (they can see them in the data package display)
        if (dataPackageFiles !== null) {
            packageToShare.setStorageItems(dataPackageFiles);
        }

        // Technically the files may not have finished loading by now
        // but this is a test app - we can make the consumers wait for that (they can see them in the data package display)
        if (dataPackageFolder !== null) {
            packageToShare.setStorageItems(dataPackageFolder);
        }
    }

    return packageToShare;
}

function getDelayLoadDataHandler(/*@dynamic*/data) {
    ///<summary>
    /// This function returns a handler for the request for data from the data package
    ///</summary>
    ///<param name="data">Data to set on package</param>
    ///<returns type="Function">Handler for setDataProvider</returns>

    return function delayLoadDataHandler(request) {
        ///<summary>
        /// This function handles the request for data from the data package, adding the delay specified by the global dataRetrievalTime.
        ///</summary>
        ///<param name="request" type="Windows.ApplicationModel.DataTransfer.DataProviderRequest"></param>

        var deferral = request.getDeferral();
        WinJS.Promise.timeout(dataRetrievalTime).
            then(
                function delayLoad_complete() {
                    request.setData(data);
                    deferral.complete();
                }
            );
    };
};

function defaultShare() {
    ///<summary>
    /// Sets up current state so that when share happens, the source app will return the default
    ///</summary>

    isDefaultShare = true;

    displayPackage();
}

function share() {
    ///<summary>
    /// The application programatically invokes share with the current data package.
    ///</summary>

    Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
}

function soxeChange () {
    ///<summary>
    /// reacts to change in SOXE server selection
    ///</summary>

    if (window.Share) {
        if (document.getElementById("soxeReal").checked) {
            Share.SOXE._soxeUrlOverride = null;
        } else {
            Share.SOXE._soxeUrlOverride = testSoxeUrl;
        }
    }
}

function getTitle() {
    ///<summary>
    /// reacts to change in title field; updates data package.
    ///</summary>

    var elTitle = document.getElementById("title");

    var titleValue = elTitle.value;

    if (!titleValue) {
        titleValue = "title is required";
    }

    return titleValue;
}

function getDescription() {
    ///<summary>
    /// reacts to change in description field; updates data package.
    ///</summary>

    var elDesc = document.getElementById("desc");

    var descValue = null;

    if (elDesc.value) {
        descValue = elDesc.value;
    }

    return descValue;
}

function getSubject() {
    ///<summary>
    /// reacts to change in subject field; updates data package.
    ///</summary>

    var elSubject = document.getElementById("subject");

    var value = null;

    if (elSubject.value) {
        value = elSubject.value;
    } 

    return value;
}

function textChange() {
    ///<summary>
    /// reacts to change in text field; updates data package.
    ///</summary>

    dataPackageText = document.getElementById("textBox").value;

    if (dataPackageText.length === 0) {
        dataPackageText = null;
    }

    displayPackage();
}

function htmlChange() {
    ///<summary>
    /// reacts to change in html field; updates data package.
    ///</summary>

    var originalHtml = /*@static_cast(String)*/document.getElementById("htmlBox").value;
    if (originalHtml.length === 0) {
        // Remove HTML from the package
        dataPackageHtml = null;
    } else {
        // Construct the CF_HTML string to be placed in the package
        var cfHtml = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(originalHtml);
        dataPackageHtml = cfHtml;
    }

    displayPackage();
}

function webLinkChange() {
    ///<summary>
    /// reacts to change in WebLink field; updates data package.
    ///</summary>

    dataPackageWebLink = _uriFieldChange("webLinkBox");

    displayPackage();
}

function applicationLinkChange() {
    ///<summary>
    /// reacts to change in ApplicationLink field; updates data package.
    ///</summary>

    dataPackageApplicationLink = _uriFieldChange("applicationLinkBox");

    displayPackage();
}

function sourceWebLinkChange() {
    ///<summary>
    /// reacts to change in contentSourceWebLink field; updates data package.
    ///</summary>

    dataPackageSourceWebLink = _uriFieldChange("sourceWebLinkBox");

    displayPackage();
}

function sourceApplicationLinkChange() {
    ///<summary>
    /// reacts to change in contentSourceApplicationLink field; updates data package.
    ///</summary>

    dataPackageSourceApplicationLink = _uriFieldChange("sourceApplicationLinkBox");

    displayPackage();
}

function _uriFieldChange(elementId) {
    /// <summary>
    /// Helper function to extract the value of a URI field and validate it
    /// </summary>

    var isValid = false,
        element = document.getElementById(elementId),
        uri;

    try {
        uri = new Windows.Foundation.Uri(element.value);
        isValid = true;
    } catch (e) { }

    if (isValid) {
        element.style.color = "black";

        return uri
    } else {
        element.style.color = "red";
        
        return null;
    }
}

function addBitmap() {
    ///<summary>
    /// Adds bitmap to the data package based on the select option
    ///</summary>
    var bitmapOptionValue = document.getElementById("bitmapLocation").value;

    if (bitmapOptionValue === "picker") {
        // Get files via picker
        var picker = new Windows.Storage.Pickers.FileOpenPicker();
        picker.fileTypeFilter.append("*");
        picker.pickSingleFileAsync().then(processBitmap);
    } else {
        // This gives us the root application folder, not SharingTestApp folder
        var appRootFolder = Windows.ApplicationModel.Package.current.installedLocation;
        appRootFolder.getFileAsync("SharingTestApp\\images\\ShareAnythingLogoLarge.png").then(
            function (file) {
                ///<param name="file" type="Windows.Storage.StorageFile">Bitmap file</param>
                processBitmap(file);
            });
    }
}

function processBitmap(file) {
    /// <summary>
    /// Puts together bitmap referred to by a given file
    /// </summary>
    /// <param name="file">Bitmap file to add to the package</param>

    if (file === null) {
        // Reset the dataPackageBitmap if we have no bitmap to include
        dataPackageBitmap = null;
    } else {
        dataPackageBitmap = Windows.Storage.Streams.RandomAccessStreamReference.createFromFile(file);
    }

    displayPackage();
}

function addFiles() {
    ///<summary>
    /// Adds files to the data package based on the select option
    ///</summary>
    var fileOptionValue = document.getElementById("fileLocation").value;

    if (fileOptionValue === "picker") {
        // Get files via picker
        var picker = new Windows.Storage.Pickers.FileOpenPicker();
        picker.fileTypeFilter.append("*");
        picker.pickMultipleFilesAsync().then(processFiles);
    } else {
        // Get files via package location

        // This gives us the root application folder, not SharingTestApp folder
        var appRootFolder = Windows.ApplicationModel.Package.current.installedLocation; 
        appRootFolder.getFolderAsync("SharingTestApp\\files").then(
            function (filesFolder) {
                ///<param name="filesFolder" type="Windows.Storage.StorageFolder">Loaded folder</param>
                filesFolder.getFilesAsync().then(processFiles);
            });
    }
}

function processFiles(files) {
    ///<summary>
    /// Processes given files and places in data package
    ///</summary>
    ///<param name="files" type="Array">Files to add to the package</param>

    if (files.length > 0) {
        dataPackageFiles = files;
    } else {
        dataPackageFiles = null;
    }

    displayPackage();
}

function addFolder() {
    ///<summary>
    /// Adds folder to the data package based on the select option
    ///</summary>

    // Get folder via picker
    var picker = new Windows.Storage.Pickers.FolderPicker();
    picker.fileTypeFilter.append("*");
    picker.pickSingleFolderAsync().then(processFolder);
}

function processFolder(folder) {
    ///<summary>
    /// Processes given files and places in data package
    ///</summary>
    ///<param name="folder" type="Array">Folder to add to the package</param>

    if (folder) {
        dataPackageFolder = [folder];
    } else {
        // The picker was dismissed with no selected folder
        dataPackageFolder = null;
    }

    displayPackage();
}

function htmlWithFiles() {
    /// <summary>
    /// Handler for button click that indicates the user wants to use html with inline files
    /// </summary>

    var htmlBox = document.getElementById("htmlBox");
    htmlBox.value = "";
    htmlBox.disabled = true;

    displayPackage();

    var fileOptionValue = document.getElementById("htmlFileLocation").value;

    if (fileOptionValue === "picker") {
        // Get files via picker
        var picker = new Windows.Storage.Pickers.FileOpenPicker();
        // Right now, we only support img types, because the canvas only supports images
        picker.fileTypeFilter.replaceAll([".jpg", ".jpeg", ".png", ".gif", ".tif", ".tiff", ".bmp"]);
        picker.pickMultipleFilesAsync().then(processHtmlFiles);
    } else {
        // Get files via package location

        // This gives us the root application folder, not ShareAnythingTestApp folder
        var appRootFolder = Windows.ApplicationModel.Package.current.installedLocation;
        appRootFolder.getFolderAsync("SharingTestApp\\inlineHtmlFiles").then(
            function (filesFolder) {
                ///<param name="filesFolder" type="Windows.Storage.StorageFolder">Loaded folder</param>
                filesFolder.getFilesAsync().then(processHtmlFiles);
            });
    }
}

function processHtmlFiles(files) {
    /// <summary>
    /// Puts together html containing the given files
    /// </summary>
    /// <param name="files" type="Array">Files to add to the html</param>

    if (files.length === 0) {
        // Reset the dataPackageHtml if we have no html to include
        dataPackageHtml = null;
        dataPackageHtmlFiles = null;

        document.getElementById("htmlBox").disabled = false;
    } else {
        dataPackageHtmlFiles = [];

        // Right now, we only support img types, because the canvas only supports images
        var html = "";

        for (var i = 0; i < files.length; i++) {
            html += "File " + i.toString() + ": ";

            // Create the mapping between ID (index) and file stream.  We'll store this in the dataPackage resourceMap later.
            var streamRef = Windows.Storage.Streams.RandomAccessStreamReference.createFromFile(files[i]);
            dataPackageHtmlFiles[i] = streamRef;

            html += '<img alt="" src="resourceMapImg' + i.toString() + '" /><br />';
        }

        dataPackageHtml = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(html);
    }

    displayPackage();
}

function displayPackage() {
    ///<summary>
    /// Displays the current contents of the data package
    ///</summary>
    var displayContainer = document.getElementById("shareDataPackageDisplay");
    displayContainer.innerHTML = "";

    if (isDefaultShare) {
        displayContainer.innerText = "Default share; no data package";
    } else {
        // Print out the data we have saved up to go into the data package.
        if (dataPackageText !== null) {
            displayContainer.appendChild(document.createTextNode("Text: "));

            var displayText;
            if (dataPackageText !== null) {
                displayText = dataPackageText;
            } else {
                displayText = "unknown text";
            }

            displayContainer.appendChild(document.createTextNode(displayText));
            displayContainer.appendChild(document.createElement("br"));
        }

        if (dataPackageWebLink !== null) {
            displayContainer.appendChild(document.createTextNode("WebLink: "));

            var displayUri;

            if (dataPackageWebLink !== null) {
                displayUri = dataPackageWebLink.absoluteUri;
            } else {
                displayUri = "unknown URI";
            }

            displayContainer.appendChild(document.createTextNode(displayUri));
            displayContainer.appendChild(document.createElement("br"));
        }

        if (dataPackageApplicationLink !== null) {
            displayContainer.appendChild(document.createTextNode("ApplicationLink: "));

            var displayUri;

            if (dataPackageApplicationLink !== null) {
                displayUri = dataPackageApplicationLink.absoluteUri;
            } else {
                displayUri = "unknown URI";
            }

            displayContainer.appendChild(document.createTextNode(displayUri));
            displayContainer.appendChild(document.createElement("br"));
        }

        if (dataPackageHtml !== null) {
            displayContainer.appendChild(document.createTextNode("HTML Format: "));

            var displayHtml;

            if (dataPackageHtml !== null) {
                displayHtml = Jx.escapeHtml(dataPackageHtml).replace(/\n/g, "<br />");
            } else {
                displayHtml = "unknown HTML";
            }

            var span = document.createElement("span");
            span.innerHTML = displayHtml;
            displayContainer.appendChild(span);
            displayContainer.appendChild(document.createElement("br"));

            if (dataPackageHtmlFiles !== null) {
                var inlineFilesText = "Inline HTML files: " + dataPackageHtmlFiles.length.toString() + " file(s).";
                displayContainer.appendChild(document.createTextNode(inlineFilesText));
            }
        }

        if (dataPackageBitmap !== null) {
            displayContainer.appendChild(document.createTextNode("Bitmap"));

            // display some representation of bitmap

            displayContainer.appendChild(document.createElement("br"));
        }

        if (dataPackageFiles !== null) {
            displayContainer.appendChild(document.createTextNode("Files array: "));

            var filesContainer = document.createElement("div");
            filesContainer.className = "shareFiles";
            displayContainer.appendChild(filesContainer);

            filesContainer.appendChild(document.createTextNode(dataPackageFiles.length.toString() + " file(s): "));

            for (var j = 0; j < dataPackageFiles.length; j++) {
                var fileContainer = document.createElement("div");
                fileContainer.innerText = dataPackageFiles[j].path;
                filesContainer.appendChild(fileContainer);
            }
            displayContainer.appendChild(document.createElement("br"));
        }

        if (dataPackageFolder !== null) {
            displayContainer.appendChild(document.createTextNode("Folder: "));

            var folderContainer = document.createElement("div");
            folderContainer.className = "shareFolder";
            displayContainer.appendChild(folderContainer);

            folderContainer.appendChild(document.createTextNode(dataPackageFolder[0].name));

            displayContainer.appendChild(document.createElement("br"));
        }
    }
}

function reset() {
    ///<summary>
    /// Resets the data package to empty
    ///</summary>
    isDefaultShare = false;

    // Title
    document.getElementById("title").value = "";
    // Description
    document.getElementById("desc").value = "";
    // Subject
    document.getElementById("subject").value = "";
    // Text
    document.getElementById("textBox").value = "";
    // Html
    var htmlBox = document.getElementById("htmlBox");
    htmlBox.value = "";
    htmlBox.disabled = false;
    document.getElementById("htmlFileLocation").value = "picker";
    // Bitmap
    document.getElementById("bitmapLocation").value = "picker";
    // WebLink
    document.getElementById("webLinkBox").value = "";
    // ApplicationLink
    document.getElementById("applicationLinkBox").value = "";
    // SourceWebLink
    document.getElementById("sourceWebLinkBox").value = "";
    // SourceApplicationLink
    document.getElementById("sourceApplicationLinkBox").value = "";
    // Data load time
    document.getElementById("timeBox").value = "";

    dataPackageHtml = null;
    dataPackageHtmlFiles = null;
    dataPackageText = null;
    dataPackageWebLink = null;
    dataPackageApplicationLink = null;
    dataPackageSourceWebLink = null;
    dataPackageSourceApplicationLink = null;
    dataPackageBitmap = null;
    dataPackageFiles = null;

    displayPackage();
}

function includeJs (src) {
    /// <summary>
    /// Includes a single JS file in the page.
    /// </summary>
    /// <param name="src" type="String">src of the JS file to include</param>

    var node = document.createElement("script");
    node.type = "text/javascript";
    node.src = src;
    var /*@type(HTMLElement)*/head = document.getElementsByTagName("head")[0];
    head.appendChild(node);
};

function includeCss (href) {
    /// <summary>
    /// Includes a single CSS file in the page.
    /// </summary>
    /// <param name="href" type="String">href of the CSS file to include</param>
    var e = document.createElement("link");
    e.type = "text/css";
    e.rel = "stylesheet";
    e.href = href;
    var /*@type(HTMLElement)*/head = document.getElementsByTagName("head")[0];
    head.appendChild(e);
};

initialize();