/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../common/js/tracing.js' />
/// <reference path='../../common/js/errors.js' />
"use strict";

(function () {

    var currentSettings,
        // for optimization we only write to disk periodically external callers should always use currentSettingsSavedToDisk
        //
        currentSettingsSavedToDisk,
        ccToSaveToDisk,
        setlangToSaveToDisk,
        numImages,
        host,
        hpArchiveUrl,
        refreshInterval,
        maxHotspots = 4,
        tagImage = "image",
        tagUrlBase = "urlBase",
        tagCopyright = "copyright",
        tagCopyrightSource = "copyrightsource",
        tagDate = "enddate",
        tagHotspots = "hotspots",
        tagHotspot = "hotspot",
        tagDesc = "desc",
        tagLink = "link",
        tagQuery = "query",
        tagLocX = "LocX",
        tagLocY = "LocY",
        strTextContent = "textContent",
        strBGLastDate = "BGLastDate",
        strTallImageSuffix = "_768x1366.jpg",
        strWideImageSuffix = "_1366x768.jpg";

    var events = Object.freeze({
        downloadComplete: "hpdownloader:downloadcomplete",
        settingsLoaded: "hpdownloader:settingsLoaded"
    });

    function start() {
        /// <summary>
        /// downloads the HP meta data and downloads any images missing from the local cache
        /// wrapper arround startHelper to periodically retry to pick up new HP images
        /// </summary>
        /// <returns>
        /// Promise that completes once all the images are loaded.
        /// </returns>

        function downloadPoll() {
            // defensive programming
            //
            if (BingApp.Utilities.isNullOrUndefined(refreshInterval)) {
                // 1/2 day in milliseconds
                //
                refreshInterval = 43200000;
            }
           
            WinJS.Promise.timeout(refreshInterval).then(function () {
                startHelper(false).done(downloadPoll, downloadPoll);
            });
        }

        return startHelper(true).then(downloadPoll, downloadPoll);
    }

    function startHelper(firstrun) {
        /// <summary>
        /// downloads the HP meta data and downloads any images missing from the local cache
        /// </summary>
        /// <param name="firstrun">
        /// Whether this is the intital run or subsequent run called by polling
        /// </param>
        /// <returns>
        /// Promise that completes once all the images are loaded.
        /// </returns>

        // Array of image meta data to fetch. Note that images that are already 
        // populated are not re-fetched
        //
        var imagesToFetch = null;

        // The index of the current image we need to fetch in currentidx
        //
        var currentidx = 0;

        return new WinJS.Promise(function init(complete, error) {

            // $TODO$ consolidate function with other common code
            //
            function errorTrace(trace) {
                BingApp.traceError(trace);
                error(new WinJS.ErrorFromName("BingApp.BackgroundImageLoader.Error", trace));
            }

            // function this is called when landscape and portrait
            // for a single day are downloaded, calls complete to finish the promise
            // if this is the last image, otherwise calls singleDayImageDownload to
            // get the next day's images
            //
            function singleImageDownloadComplete() {

                // completed one download, move to the next one
                //
                currentidx++;

                // if we have more days to download
                //
                if (currentidx < imagesToFetch.length) {
                    var imageDownloadPromise = singleDayImageDownload(imagesToFetch[currentidx]);
                    imageDownloadPromise.done(singleImageDownloadComplete, error);
                }
                // we have downloaded all the images
                //
                else {
                    var collection = {};
                    collection["cc"] = ccToSaveToDisk;
                    collection["setlang"] = setlangToSaveToDisk;
                    BingApp.HPDataProvider.setSettingsLangAndRegion(collection);
                    currentSettingsSavedToDisk = currentSettings;

                    BingApp.HPDataProvider.updateSettings(JSON.stringify(currentSettings)).done(function settingwrite() {
                        BingApp.locator.eventRelay.fireEvent(events.downloadComplete);
                        complete();
                    },
                    function (){
                        errorTrace("Write settings to disk failed")
                    });
                }
            };

            // To kick start the promise, we load environment variables
            // then download the HPMetaData from the end point and see the delta with the current cache
            // if we need to download images we call singleDayImageDownload to start the loop.
            //
            var env = BingApp.locator.env;
            env.configurationReady()
                .done(function () {

                    // Loads configuration
                    //
                    loadConfiguration(env);

                    // Get the current settings stored on disk
                    //
                    getCachedSettings(firstrun).done(function readComplete() {

                        var serverMetaDataPromise = BingApp.HPDataProvider.getCurrentServerHPMetaData(hpArchiveUrl);

                        serverMetaDataPromise.done(function metaDataComplete(result) {
                            imagesToFetch = parseMetaDataResponse(result);
                            if (imagesToFetch && imagesToFetch.length > 0) {
                                // If we need to download images call singleDayImageDownload, success will call
                                // singleImageDownloadComplete which will download remaining images if needed.
                                //
                                singleDayImageDownload(imagesToFetch[currentidx], currentSettings).done(singleImageDownloadComplete, error);
                            }
                            else {
                                if (BingApp.Utilities.isNullOrUndefined(imagesToFetch)) {
                                    errorTrace("parseMetaDataResponse failed");
                                }
                                else {
                                    complete();
                                }
                            }
                        },
                        function () {
                            var errorMsg = "getCurrentServerHPMetaData failed for url:" + hpArchiveUrl;
                            errorTrace(errorMsg);
                        });
                    },
                    function () {
                        errorTrace("getCachedSettings failed");
                    });
                },
                function (){
                    errorTrace("configurationReady failed");
                });                
        });
    }

    function loadConfiguration(env) {
        /// <summary>
        /// Loads the configuration from the environment object
        /// </summary>
        /// <param name="env">
        /// The environment object
        /// </param>

        // set environment variables
        //
        host = env.getDefaultHostUrl();
        numImages = env.configuration["numImages"];
        refreshInterval = env.configuration["refreshInterval"];

        var collection = {};
        collection["format"] = "xml";
        collection["idx"] = "0";
        collection["n"] = numImages;
        // parameter is used to get hotspots in international markets
        //
        collection["h"] = "1";

        // store these in variables as once we write the HP meta data to disk we also
        // store these values to support clearing cache data if these values change. 
        // Use variables here to avoid an edge case where user changes these values while images
        // are being downloaded
        //
        ccToSaveToDisk = BingApp.HPDataProvider.getUserCC();
        setlangToSaveToDisk = BingApp.HPDataProvider.getUserLang();

        collection["cc"] = ccToSaveToDisk;
        collection["setlang"] = setlangToSaveToDisk;

        try {
            hpArchiveUrl = host + env.configuration["HPArchiveUrl"] + BingApp.Utilities.QueryString.serialize(collection);
        } catch (error) {
            BingApp.traceError("BackgroundImageLoader.getArchiveUrl: query string serialization error for text: {0}; error name: {1}; error message: {2}", e.queryText, error.name, error.message);
            hpArchiveUrl = host + env.configuration["DefaultHPArchiveUrl"];
        }
    }

    function validateSettings(settings) {
        /// <summary>
        /// Does basic validation to see if the settings object is valid
        /// </summary>
        /// <param name="settings">
        /// The settings object to validate
        /// </param>
        /// <returns>
        /// Boolean indicating whether the settings object is valid or not
        /// </returns>

        // do some basic validation in case the file on disk is corrupt or malformed
        //
        var settingsValid = false;

        if (currentSettings.length <= 2 * numImages) {
            var invalidObjectPresent = false;

            for (var i = 0; i < currentSettings.length; i++) {
                var curObject = currentSettings[i];
                if (BingApp.Utilities.isNullOrUndefined(curObject) ||
                    BingApp.Utilities.isNullOrUndefined(curObject.index) ||
                    BingApp.Utilities.isNullOrUndefined(curObject.hs) ||
                    BingApp.Utilities.isNullOrUndefined(curObject.imgDate) ||
                    BingApp.Utilities.isNullOrUndefined(curObject.info) ||
                    BingApp.Utilities.isNullOrUndefined(curObject.tallImgUrl) ||
                    BingApp.Utilities.isNullOrUndefined(curObject.wideImgUrl)){
                    invalidObjectPresent = true;
                    break;
                }
            }

            if (!invalidObjectPresent) {
                settingsValid = true;
            }
        }

        return settingsValid;
    }


    function getCachedSettings(firstrun) {
        /// <summary>
        /// Loads the cached image meta data 
        /// </summary>
        /// <param name="firstrun">
        /// Whether this is the initial run or subsequent run called by polling
        /// </param>
        /// <returns>
        /// A promise that completes once the settings are loaded
        /// </returns>

        // we always read from disk on a new HPDownload run as the last
        // run may not have written to disk successfully and the in memory copy 
        // may be inconsistent with what is on disk
        //
        return new WinJS.Promise(function init(complete, error) {

            function finishPromise() {
                currentSettingsSavedToDisk = currentSettings;
                BingApp.locator.eventRelay.fireEvent(events.settingsLoaded);
                complete(currentSettings);
            }

            // Optimization to only read from disk and do validation on startup. Also handles an edge
            // case if someone corrupts disk after startup we don't want to clear the data
            // as it can cause write access errors as the view is holding onto image files we 
            // will attempt to overwrite
            // 
            if (!firstrun) {
                currentSettings = currentSettingsSavedToDisk;
                complete(currentSettings);
            }
            else {
                BingApp.HPDataProvider.loadSettings().done(function settingsLoaded(cachedSettings) {
                    try {
                        if (cachedSettings) {
                            currentSettings = JSON.parse(cachedSettings);

                            if (!validateSettings(currentSettings)) {
                                currentSettings = [];
                            }
                            else {
                                // check if all the files referenced by currentsettings exist on disk
                                //
                                BingApp.HPDataProvider.doHPFilesExist(currentSettings).done(function HPfilesExist(isExist) {
                                    if (!isExist) {
                                        currentSettings = [];
                                    }
                                    else {
                                        // Check that the market and language match current user language and
                                        // market
                                        //
                                        var collection = BingApp.HPDataProvider.getSettingsLangAndRegion();
                                        if (collection) {
                                            var cc = collection["cc"];
                                            var setlang = collection["setlang"];                                            
                                        }

                                        if ((cc && cc !== BingApp.HPDataProvider.getUserCC()) ||
                                            (setlang && setlang !== BingApp.HPDataProvider.getUserLang())) {
                                            currentSettings = [];
                                        }
                                    }

                                    finishPromise();
                                },
                                function doesFileExistError() {
                                    error(new WinJS.ErrorFromName("BingApp.BackgroundImageLoader.Error", "BingApp.HPDataProvider.doHPFilesExist() failed"));
                                });

                                return;
                            }

                        }
                        else {
                            currentSettings = [];
                        }
                    } catch (error) {
                        // string had an error, backgrounds doesnt change
                        BingApp.traceError("BackgroundImageLoader.getCachedSettings: JSON parsing failed on string: {0}", error.message);
                        currentSettings = [];
                    }

                    finishPromise();
                },
                function () {
                    error(new WinJS.ErrorFromName("BingApp.BackgroundImageLoader.Error", "BingApp.HPDataProvider.loadSettings() failed"));
                });
            }
        });
    }

    function parseMetaDataResponse(result) {
        /// <summary>
        /// Parses the xml response and returns an array of images
        /// that need to be downloaded based on a delta with the current cache
        /// </summary>
        /// <param name="result">
        /// The result object
        /// </param>
        /// <returns>
        /// An array of the image meta data to download
        /// </returns>

        if (BingApp.Utilities.isNullOrUndefined(result) ||
            BingApp.Utilities.isNullOrUndefined(result.responseXML)) {
            return;
        }

        var xmlDoc = result.responseXML;

        if (BingApp.Utilities.isNullOrUndefined(xmlDoc)) {
            return;
        }

        var imgNodes,
            hotspotsNodes,
            imageData = [],
            needToDownload = true;

        // get the nodes for images and hotspots
        //
        try {
            imgNodes = getNodes(xmlDoc, tagImage);
            hotspotsNodes = getNodes(xmlDoc, tagHotspots);
        } catch (error) {
            BingApp.traceError("BackgroundImageLoader.parseBgResponse: error in xml: {0}", error.message);
            return;
        }

        // Typically we should have at least numImages hotspots and image nodes, defensive programming
        // in case this is not true
        //
        var countImages = Math.min(numImages, imgNodes.length, hotspotsNodes.length);

        // stores the images we need to download
        //
        var imagesToDownload = [];

        for (var i = 0; i < countImages; i++) {
            
            needToDownload = true;

            try {

                imageData[i] = parseImageData(xmlDoc, i, imgNodes[i], hotspotsNodes[i]);

            } catch (error) {

                // In case parsing the xml throws an exception
                BingApp.traceError("BackgroundImageLoader.parseBgResponse: error in parseImageData: {0} for image {1}", error.message, i);

                // try and parse remaining images if possible
                //
                continue;
            }


            // Check if xml has changed
            for (var j = 0; !BingApp.Utilities.isNullOrUndefined(currentSettings) && j < currentSettings.length; j++) {
                if (imageData[i].imgDate === currentSettings[j].imgDate) {
                    needToDownload = false;
                    break;
                }
            }

            // if we find no match in cache, add it to the list to download
            //
            if (needToDownload) {
                imagesToDownload.push(imageData[i]);
            }
        }

        return imagesToDownload;
    }

    function parseImageData(xmlDoc, imageIndex, imgNode, hotspotsNodes) {
        /// <param name="xmlDoc">
        /// The xmldoc returned
        /// </param>
        /// <param name="imageIndex">
        /// The index of the node
        /// </param>
        /// <param name="imgNode">
        /// The image node
        /// </param>
        /// <param name="hotspotsNodes">
        /// The hotspots node
        /// </param>
        /// <returns>
        /// The background data object from xml for image node
        /// </returns>

        var imgUrl = getNodeText(imgNode, tagUrlBase),
            imgDate = getNodeText(imgNode, tagDate),
            attrib = getNodeText(imgNode, tagCopyrightSource);

        if (!attrib) {
            attrib = getNodeText(imgNode, tagCopyright);
        }

        var backgroundObj = { hs: [], tallImgUrl: host + imgUrl + strTallImageSuffix, wideImgUrl: host + imgUrl + strWideImageSuffix, imgDate: imgDate, info: attrib };

        var hotspotNodes = getNodes(hotspotsNodes, tagHotspot);

        for (var i = 0; i < hotspotsNodes.childElementCount && i < maxHotspots; i++) {
            var hotspot = hotspotNodes[i];
            var hsObj = {};
            hsObj[tagLocX] = getNodeText(hotspot, tagLocX);
            hsObj[tagLocY] = getNodeText(hotspot, tagLocY);
            hsObj[tagDesc] = getNodeText(hotspot, tagDesc);
            hsObj[tagLink] = getNodeText(hotspot, tagLink);
            hsObj[tagQuery] = getNodeText(hotspot, tagQuery);

            backgroundObj.hs.push(hsObj);
        }

        return backgroundObj;
    }

    function getNodes(doc, nodeName) {
        /// <summary>
        /// Returns list of nodes with nodeName
        /// </summary>
        /// <param name="doc">
        /// The document object
        /// </param>
        /// <param name="nodeName">
        /// The node we are looking for
        /// </param>
        /// <returns>
        /// The list of nodes with nodeName
        /// </returns>

        return doc.querySelectorAll(nodeName);
    }

    function getNodeText(nodes, nodeName) {
        /// <summary>
        /// Returns node text
        /// </summary>
        /// <param name="nodes">
        /// The nodes name
        /// </param>
        /// <param name="nodeName">
        /// The node we are looking for
        /// </param>
        /// <returns>
        /// The node text
        /// </returns>

        var node = nodes.querySelectorAll(nodeName);
        if (node.length > 0 && node[0][strTextContent]) {
            return node[0][strTextContent];
        }

        return null;
    }

    function singleDayImageDownload(imageToFetch) {

        /// <summary>
        /// Given the image to download, downloads portrait and landscape using singleDayImageDownloadHelper
        /// then processes the current local storage data to write them to disk.
        /// Returns a promise that completes when the operation is finished
        /// </summary>
        /// <param name="imageToFetch">
        /// The meta data for the current image to fetch
        /// </param>
        /// <returns>
        /// Promise that fires when download and write to disk complete
        /// </returns>
        return new WinJS.Promise(function init(complete, error) 
        {
            function errorTrace(trace) {
                /// <summary>
                /// Processes error path by tracing and calling error to complete the promise
                /// </summary>
                /// <param name="trace">
                /// The string to trace
                /// </param>
                BingApp.traceError(trace);
                error(new WinJS.ErrorFromName("BingApp.BackgroundImageLoader.Error", trace));
            }

            // Download the landscape and portrait for the day
            //
            var downloadPromise = singleDayImageDownloadHelper(imageToFetch);
            downloadPromise.done(function downloadComplete(byteArrayCollection)
            {
                /// <summary>
                /// Writes the bytestreams passed in to disk and updates all appropriate datastructures
                /// </summary>
                /// <param name="byteArrayCollection">
                /// An array of size 2 for bytestream for landscape and portrait respectively.
                /// </param>

                // All of these should be present. If any inputs are bad, it is an error
                //
                if (BingApp.Utilities.isNullOrUndefined(currentSettings) ||
                    BingApp.Utilities.isNullOrUndefined(byteArrayCollection) ||
                    byteArrayCollection.length !== 2 ||
                    BingApp.Utilities.isNullOrUndefined(byteArrayCollection[0]) ||
                    BingApp.Utilities.isNullOrUndefined(byteArrayCollection[1])) {
                    errorTrace("invalid params in downloadComplete");
                    return;
                }

                // Get the index on disk to write to
                //
                var index = getDiskIndex();

                // Create the file for both landscape and portrait
                //
                var portraitFileCreatePromise = BingApp.HPDataProvider.createHPFile("portrait" + index + ".jpg");
                var landscapeFileCreatePromise = BingApp.HPDataProvider.createHPFile("landscape" + index + ".jpg");

                var dataPromises = [];
                dataPromises.push(portraitFileCreatePromise);
                dataPromises.push(landscapeFileCreatePromise);

                // Wait for file creation to succeed before trying to write data
                //
                WinJS.Promise.join(dataPromises).done(function fileCreateComplete(fileHandle) {

                    if (BingApp.Utilities.isNullOrUndefined(fileHandle) ||
                        fileHandle.length !== 2 ||
                        BingApp.Utilities.isNullOrUndefined(fileHandle[0]) ||
                        BingApp.Utilities.isNullOrUndefined(fileHandle[1])) {
                        errorTrace("invalid params for filehandle");
                        return;
                    }

                    var dataPromisesAsyncWrite = [];
                    dataPromisesAsyncWrite.push(BingApp.HPDataProvider.writeHPFile(fileHandle[0], byteArrayCollection[0]));
                    dataPromisesAsyncWrite.push(BingApp.HPDataProvider.writeHPFile(fileHandle[1], byteArrayCollection[1]));

                    // Wait for both async write to succeed before updating the settings meta data
                    // so future reads will render the image
                    //
                    WinJS.Promise.join(dataPromisesAsyncWrite).done(function fileWriteComplete() {

                        var metaDataOfDayAdded = {
                            tallImgUrl: imageToFetch.tallImgUrl + strTallImageSuffix,
                            wideImgUrl: imageToFetch.wideImgUrl + strWideImageSuffix,
                            imgDate: imageToFetch.imgDate,
                            info: imageToFetch.info,
                            index: index,
                            hs: imageToFetch.hs
                        };

                        var insertIndex = -1;

                        // Settings are sorting in descending order, newest first.
                        //
                        var newImageDate = parseInt(imageToFetch.imgDate, 10);
                        for (var i = 0; i < currentSettings.length; i++) {
                            if (newImageDate > parseInt(currentSettings[i].imgDate, 10)) {
                                insertIndex = i;
                                currentSettings.splice(insertIndex, 0, metaDataOfDayAdded);
                                break;
                            }
                        }

                        if (insertIndex === -1) {
                            currentSettings.push(metaDataOfDayAdded);
                            insertIndex = currentSettings.length - 1;
                        }

                        complete();

                    }, function joinErrorAsyncWrite() {
                        errorTrace("join error on async write");
                    });
                }, function joinErrorAsyncCreate() {
                    errorTrace("join error on async create");
                });
            },
            function downloadCompleteError(errorObject) {
                errorTrace("download image failed");
            });
        });
    }

    function getDiskIndex() {
        /// <summary>
        /// When we are ready to write the image data for a given day to disk, this function
        /// returns the index of the file to use for storage. To simplify cleanup we use the file
        /// names landscape+index.jpg and portrait+index.jpg
        /// </summary>
        /// <returns>
        /// The index to use in the filename when writing to disk
        /// </returns>

        // We have an array in localstorage. First step is to find a free index to write to
        // we have size 14 array, so we can download 7 new images without clobbering data that may be read
        // at the same time
        //
        var index = -1;

        var emptyElementsArray = new Array(numImages * 2);

        for (var i = 0; i < currentSettings.length; i++) {
            var currentIndex = currentSettings[i].index;

            // defensive programming
            //
            if (currentIndex < numImages * 2) {
                emptyElementsArray[currentIndex] = 1;
            }
        }

        for (var i = 0; i < emptyElementsArray.length; i++) {
            if (BingApp.Utilities.isNullOrUndefined(emptyElementsArray[i])) {
                index = i;
                break;
            }
        }

        // storage is full, we need to evict the oldest
        //
        for (; index === -1;) {
            if (currentSettings.length > 0) {
                index = currentSettings[currentSettings.length - 1].index;
                currentSettings.pop();
                if (index >= numImages * 2) {
                    index = -1;
                }
            }
            else {
                // defensive programming if every object in the currentSettings
                // is pointing to an invalid index
                //
                index = 0;
            }
        }

        return index;
    }

    function fetchSingleImage(url) {
        /// <summary>
        /// Called to download a single image
        /// raw data
        /// </summary>
        /// <param name="url">
        /// The url of the image to fetch
        /// </param>
        /// <returns>
        /// A promise that completes once the download completes and is parsed
        /// </returns>

        return BingApp.HPDataProvider.singleImageDownload(url).then(function ParseSuccessResponse(response){
            var byteArray = new Uint8Array(response.response);
            return byteArray;
        },
        function ParseErrorResponse(response){
            BingApp.traceError("fetchSingleImage failed for url:{0}", url);
        });
    }

    function singleDayImageDownloadHelper(imageToFetch) {
        /// <summary>
        /// Downloads both landscape and portrait images for a single day in parallel
        /// Returns a join promise so that done is only fired once both requests complete
        /// in order to prevent us downloading too many images in parallel and slowing down
        /// the time for image render for the top image
        /// </summary>
        /// <param name="imageToFetch">
        /// The meta data for the image to download
        /// </param>
        /// <returns>
        /// A promise that fires once the responses return
        /// </returns>

        var dataPromises = [];

        var portraitImagePromise = fetchSingleImage(imageToFetch.tallImgUrl);
        var landscapeImagePromise = fetchSingleImage(imageToFetch.wideImgUrl);

        dataPromises.push(portraitImagePromise);
        dataPromises.push(landscapeImagePromise);

        return WinJS.Promise.join(dataPromises);
    }

    function getSettings() {
        /// <summary>
        /// Called by start view to get the current settings
        /// </summary>
        /// <returns>
        /// The current settings
        /// </returns>

        return currentSettingsSavedToDisk;
    }

    WinJS.Namespace.define("BingApp.BackgroundImageLoader", {
        start: start,
        getSettings: getSettings,
        events: events
    });
})();




(function () {

    var strSettingsFile = "hpsettings.js";

    function singleImageDownload(url) {
        /// <summary>
        /// Downloads a single image sets option as "arraybuffer" to do binary download
        /// </summary>
        /// <param name="url">
        /// The url of the enpoint
        /// </param>
        /// <returns>
        /// Promise for XHR
        /// </returns>

        // $TODO$ should we route through XHR proxy component
        //
        return WinJS.xhr({ url: url, responseType: "arraybuffer" });
    };

    function getCurrentServerHPMetaData(url) {
        /// <summary>
        /// Downloads the HP meta data
        /// </summary>
        /// <param name="url">
        /// The url of the end point
        /// </param>
        /// <returns>
        /// Promise for XHR
        /// </returns>

        return WinJS.xhr({ url: url });
    }

    function createHPFile(filename) {
        /// <summary>
        /// creates a file in the localfolder async
        /// </summary>
        /// <param name="filename">
        /// The filename to create
        /// </param>
        /// <returns>
        /// Promise for file creation
        /// </returns>

        var localFolder = Windows.Storage.ApplicationData.current.localFolder;
        return localFolder.createFileAsync(filename, Windows.Storage.CreationCollisionOption.replaceExisting);
    }

    function writeHPFile(hpFilehandle, byteArray) {
        /// <summary>
        /// writes to a file async
        /// </summary>
        /// <param name="hpFilehandle">
        /// The file handle of the file to create
        /// </param>
        /// <param name="byteArray">
        /// The data to write to file
        /// </param>
        /// <returns>
        /// Promise for aync file write
        /// </returns>
        return Windows.Storage.FileIO.writeBytesAsync(hpFilehandle, byteArray);
    }

    function updateSettings(settings)
    {
        /// <summary>
        /// Store updated HP meta data to settings
        /// </summary>
        /// <param name="settings">
        /// The settings string to write
        /// </param>
        /// <returns>
        /// Promise for aync file write
        /// </returns>

        return new WinJS.Promise(function init(complete, error) {

            getSettingsFileHandle().done(function fileHandleComplete(settingsFileHandle) {
                Windows.Storage.FileIO.writeTextAsync(settingsFileHandle, settings).done(function writeTextComplete() {
                    complete();
                },
                function () {
                    error(new WinJS.ErrorFromName("BingApp.BackgroundImageLoader.Error", "writeTextAsync() failed"));
                });
            },
            function () {
                error(new WinJS.ErrorFromName("BingApp.BackgroundImageLoader.Error", "getSettingsFileHandle() failed"));
            });
        });        
    }

    function loadSettings() {
        /// <summary>
        /// Load updated HP meta data from settings
        /// </summary>
        /// <returns>
        /// Promise for when the file read completes
        /// </returns>

        return new WinJS.Promise(function init(complete, error) {

            getSettingsFileHandle().done(function fileHandleComplete(settingsFileHandle) {
                Windows.Storage.FileIO.readTextAsync(settingsFileHandle).done(function readTextComplete(text) {
                    complete(text);
                },
                function () {
                    error(new WinJS.ErrorFromName("BingApp.BackgroundImageLoader.Error", "readTextAsync() failed"));
                });
            },
            function () {
                error(new WinJS.ErrorFromName("BingApp.BackgroundImageLoader.Error", "getSettingsFileHandle() failed"));
            });
        });
    }

    function getSettingsFileHandle() {
        /// <summary>
        /// Get file handle for the settings file
        /// </summary>
        /// <returns>
        /// Promise for when the file handle is obtained
        /// </returns>

        var localFolder = Windows.Storage.ApplicationData.current.localFolder;

        // $TODO$ refactor, shares common code
        //
        return localFolder.createFileAsync(strSettingsFile, Windows.Storage.CreationCollisionOption.openIfExists);
    }

    function getSettingsLangAndRegion() {
        /// <summary>
        /// Get language and region associated with the settings on disk
        /// </summary>
        /// <returns>
        /// collection contaings setlang and cc
        /// </returns>

        var collection = {};
        var marketSettings = Windows.Storage.ApplicationData.current.localSettings.values["backgroundimageloader.marketsettings"];

        if (marketSettings)
        {
            // This can fail if the string is corrupt
            //
            try{
                collection = BingApp.Utilities.QueryString.parse(marketSettings, { decode: true });
            }
            catch (e) {
                BingApp.traceError("getSettingsLangAndRegion failed on string parsing for: {0}", marketSettings);
            }
        }

        return collection;
    }

    function setSettingsLangAndRegion(collection) {
        /// <summary>
        /// Set language and region associated with the settings on disk
        /// </summary>
        /// <param name="collection">
        /// The collection containing setlang and cc value to set
        /// </param>
        Windows.Storage.ApplicationData.current.localSettings.values["backgroundimageloader.marketsettings"] = BingApp.Utilities.QueryString.serialize(collection);
    }

    function getUserLang() {
        /// <summary>
        /// Get language associated with the user
        /// </summary>
        /// <returns>
        /// User's OS language
        /// </returns>
        return Windows.System.UserProfile.GlobalizationPreferences.languages[0];
    }

    function getUserCC() {
        /// <summary>
        /// Get country code associated with the user
        /// </summary>
        /// <returns>
        /// User's OS CC
        /// </returns>
        return Windows.System.UserProfile.GlobalizationPreferences.homeGeographicRegion;
    }

    function doHPFilesExist(settings) {
        /// <summary>
        /// Checks that all files referenced by the settings object exist on disk
        /// </summary>
        /// <returns>
        /// Promise for when the checks complete
        /// </returns>

        var localFolder = Windows.Storage.ApplicationData.current.localFolder;

        var fileQueryResults = localFolder.createFileQuery();

        return fileQueryResults.getFilesAsync().then(
            function (files) {
                var collection = {};
                files.forEach(
                    function (file) {
                        var filename = file.name.toLowerCase();
                        if (filename.indexOf(".jpg", filename.length - 4) !== -1) {
                            collection[filename] = "1";
                        }
                    }
                );

                var isExist = true;

                for(var i = 0; i < settings.length; i++){
                    var curObject = settings[i];

                    if (!collection["portrait" + curObject.index + ".jpg"] ||
                        !collection["landscape" + curObject.index + ".jpg"]) {
                        BingApp.traceError("BackgroundImageLoader.doHPFilesExist: file at index: {0} missing", i);
                        isExist = false;
                        break;
                    }
                }

                return isExist;
            },
            function getFilesAsyncError() {
                error(new WinJS.ErrorFromName("BingApp.BackgroundImageLoader.Error", "BingApp.HPDataProvider.getFilesAsync() failed"));
            }
        );
    }

    WinJS.Namespace.define("BingApp.HPDataProvider", {
        singleImageDownload: singleImageDownload,
        getCurrentServerHPMetaData : getCurrentServerHPMetaData,
        updateSettings: updateSettings,
        loadSettings : loadSettings,
        createHPFile: createHPFile,
        writeHPFile: writeHPFile,
        doHPFilesExist: doHPFilesExist,
        getSettingsLangAndRegion: getSettingsLangAndRegion,
        setSettingsLangAndRegion: setSettingsLangAndRegion,
        getUserCC: getUserCC,
        getUserLang: getUserLang,
    });
})();