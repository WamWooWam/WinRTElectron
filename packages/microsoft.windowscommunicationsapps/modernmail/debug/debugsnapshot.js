

//
// Copyright (C) Microsoft. All rights reserved.
//

/*global Windows,Debug,Jx,Mail,Microsoft,WinJS,MSApp */
/*jshint browser:true*/

(function () {
    "use strict";

    Mail.TarFile = function (defaultFileName) {
        this._dataToSave = [];
        this._defaultFileName = defaultFileName;
    };
    var prototype = Mail.TarFile.prototype;

    prototype.addBytesFile = function (fileName, fileBytes) {
        this._dataToSave.push({fileName:fileName, fileContentBytes:fileBytes});
    };

    prototype.addStringFile = function (fileName, fileString) {
        this._dataToSave.push({fileName:fileName, fileContents:fileString});
    };

    prototype._createTarBuffer = function () {

        function writeBytes (count, b, stream) {
            for (var i = 0; i < count; ++i) {
                stream.writeByte(b);
            }
        }
        function writeNulls (count, stream) {
            writeBytes(count, 0, stream);
        }
        function writeZeros (count, stream) {
            writeBytes(count, 48, stream);
        }
        function writeSpaces (count, stream) {
            writeBytes(count, 32, stream);
        }
        function writeFixedString (string, length, stream) {
            var bytesWritten = stream.writeString(string);
            Debug.assert(bytesWritten <= length);
            writeNulls(length - bytesWritten, stream);
        }
        function getByteCountOfString (string) {
            var writer = Windows.Storage.Streams.DataWriter(new Windows.Storage.Streams.InMemoryRandomAccessStream()),
                length = writer.writeString(string);
            writer.close();
            return length;
        }
        function writeWithChecksum (fileName, fileContents, fileBytes, date, stream) {
            // Write header once, without a checksum.
            // Use that header to calculate the checksum.
            // Write header agian with checksum.

            if (!fileContents && !fileBytes) {
                // Skip empty files
                return;
            }
            var writer = Windows.Storage.Streams.DataWriter(new Windows.Storage.Streams.InMemoryRandomAccessStream());
            writer.unicodeEncoding = Windows.Storage.Streams.UnicodeEncoding.utf8;
            writer.byteOrder = Windows.Storage.Streams.ByteOrder.littleEndian;
            writeFileHeader(fileName, fileContents, fileBytes, date, "00000", writer);
            var buffer = writer.detachBuffer();
            writer.close();
            var bufLength = buffer.length,
                reader = Windows.Storage.Streams.DataReader.fromBuffer(buffer),
                checksum = 0;
            for( var i = 0, iMax = Math.min(bufLength, 512); i < iMax; ++i) {
                var byte = reader.readByte();
                checksum += byte;
            }
            checksum -= 16; // For unknown reasons, checksum is consistantly off by 16.
            var checkString = checksum.toString(8);
            while (checkString.length < 6) {
                checkString = "0" + checkString;
            }
            writeFileHeader(fileName, fileContents, fileBytes, date, (checkString).substr(Math.max(checkString.length - 6,0), 6), stream);
        }
        function writeFileHeader (fileName, fileContents, fileBytes, date, checksum, stream) {
            // Write header bytes to a buffer, buffer is a 512 byte block, representing one file in the tar archive 
            var fileSize = 0;
            Debug.assert(fileContents || fileBytes);
            if (fileContents) {
                fileSize = getByteCountOfString(fileContents);
            } else if (fileBytes) {
                fileSize = fileBytes.length;
            }
            writeFixedString(fileName, 100, stream); //File Name
            writeFixedString("0100666", 7, stream);   //File Mode
            writeNulls(1, stream);
            writeZeros(7, stream); // Owner's numeric user ID
            writeNulls(1, stream);
            writeZeros(7, stream); // Group's numeric user ID
            writeNulls(1, stream);
            writeZeros(11 - (fileSize.toString(8)).length, stream); 
            writeFixedString(fileSize.toString(8), (fileSize.toString(8)).length, stream); // File Size // NOTE: Should be leading 0's ?
            writeNulls(1, stream);
            writeFixedString(date, 11, stream); // Modified time
            writeNulls(1, stream);
            writeFixedString(checksum, 6, stream); // Checksum
            writeNulls(1, stream); // Checksum
            writeSpaces(1, stream); // Checksum
            writeZeros(1, stream); // Link Indicator
            writeNulls(100, stream); // link filename
            writeFixedString("ustar  ", 8, stream); // ustar keyword
            writeFixedString("debug_dump", 32, stream); // description
            writeNulls(512 - (157 + 100 + 6 + 2 + 32), stream);  // Finish block to fill 512 bytes
            if (checksum !== "00000") {
                // Skip file contents if the checksum has not been calculated yet
                var roundedFileSize = Math.ceil(fileSize / 512) * 512; // Finish file contents to 512 block boundry
                // Write file contents after header
                if (fileContents) {
                    writeFixedString(fileContents, roundedFileSize, stream);
                } else {
                    stream.writeBytes(fileBytes);
                    writeNulls(roundedFileSize - fileBytes.length, stream);
                }
            }
        }

        var now = Math.floor(Date.now() / 1000).toString(8),
            writer = Windows.Storage.Streams.DataWriter(new Windows.Storage.Streams.InMemoryRandomAccessStream());
        writer.unicodeEncoding = Windows.Storage.Streams.UnicodeEncoding.utf8;
        writer.byteOrder = Windows.Storage.Streams.ByteOrder.littleEndian;

        this._dataToSave.forEach(function (element) { writeWithChecksum(element.fileName, element.fileContents, element.fileContentBytes, now, writer); });

        // Write 7 k of blank data to the end of the file to needed by some tar parsers.
        writeNulls(512 * 14, writer);
        var buffer = writer.detachBuffer();
        writer.close();
        return buffer;
    };

    prototype.save = function () {
        var buffer = this._createTarBuffer();
        var savePicker = new Windows.Storage.Pickers.FileSavePicker();
        savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.desktop;
        savePicker.fileTypeChoices.insert("tar", [".tar"]);
        savePicker.suggestedFileName = this._defaultFileName;

        return savePicker.pickSaveFileAsync().then(function (file) {
            if (file) {
                // Prevent updates to the remote version of the file until we finish making changes and call CompleteUpdatesAsync.
                Windows.Storage.CachedFileManager.deferUpdates(file);
                return Windows.Storage.FileIO.writeBufferAsync(file, buffer).then(function () {
                    return Windows.Storage.CachedFileManager.completeUpdatesAsync(file).then(function (updateStatus) {
                        if (updateStatus === Windows.Storage.Provider.FileUpdateStatus.complete) {
                            Jx.log.info("Saved :" + file.name);
                            return file.path;
                         } else {
                            Jx.log.info("Failed to save :" + file.name);
                        }
                    });
                });
            } else {
                Jx.log.info("Save canceled :" + file.name);
            }
            return null;
        });
    };

   prototype.upload = function (subfolder) {
        var fileName = this._defaultFileName,
            buffer = this._createTarBuffer(),
            memoryStream = Windows.Storage.Streams.InMemoryRandomAccessStream();
        
        return memoryStream.writeAsync(buffer).then(function () {
            var blob = MSApp.createBlobFromRandomAccessStream("application/x-tar", memoryStream);
            return new WinJS.Promise(function (complete, error) {
                var xmlRequest = new XMLHttpRequest();
                // Joshuala-server is running a web host expecting file uploads
                xmlRequest.open("POST", "http://joshuala-server:5000/", true);
                xmlRequest.onload = function (evt) {
                    if (evt.currentTarget.responseText.indexOf("Upload Complete") !== -1) {
                        complete();
                    } else {
                        Jx.log.info(evt.currentTarget.responseText);
                        error("Server responded with an error");
                    }
                };
                xmlRequest.onerror = error;

                var formData = new FormData();
                formData.append("tarFile", blob, fileName);
                if (subfolder) {
                    formData.append("folder", subfolder);
                }
                xmlRequest.send(formData);
            }).then(function () {
                return fileName;
            });

        });
    };

    function snapshotAll (node, nodeName, parentLine, parentNameLine, result, maxDepth) {
        try {
            var hasOneProperty = false;
            if (parentLine.length > maxDepth) {
                result.push(parentNameLine + "." + nodeName + "=EXCEEDED DEPTH LIMIT\r\n");
                return;
            }
            if (nodeName.length === 0) {
                return;
            }
            if (nodeName.indexOf(".") !== -1) {
                return;
            }
            if (Jx.isArray(node)) {
                result.push(parentNameLine + "." + nodeName + "=<<ARRAY LENGTH(" + node.length + ")>>\r\n");
                hasOneProperty = true;
            }
            if ((nodeName === "_disposables") || (nodeName === "context") || (nodeName === "_target") || (nodeName === "_src") || (nodeName === "_jobSet") || (nodeName === "_parent") || (nodeName === "_children")) {
                result.push(parentNameLine + "." + nodeName + "=<<SKIPPING " + nodeName + " PATTERN>>\r\n");
                return;
            }
            if (parentLine.length >= 2 && ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].indexOf(nodeName[0]) !== -1) {
                result.push(parentNameLine + "." + nodeName + "=<<ASSUMED NAMESPACE>>\r\n");
                return;
            }
            var typeName = typeof node;
            if (typeName === "function") {
                return;
            }
            if (node === null) {
                result.push(parentNameLine + "." + nodeName + "=null\r\n");
                return;
            }
            if (typeName === "string") {
                result.push(parentNameLine + "." + nodeName + "=\"" + node + "\"\r\n");
                return;
            }
            if ((typeName === "boolean") || (typeName === "string") || (typeName === "number") || (typeName === "Date")) {
                result.push(parentNameLine + "." + nodeName + "=" + node + "\r\n");
                return;
            }
            if( Jx.isHTMLElement(node) ) {
                result.push(parentNameLine + "." + nodeName + "=(HTMLElement)\r\n");
                return;
            }
            var propt = null,
                parentLineNext = parentLine.concat([node]),
                parentNameLineNext = parentNameLine + "." + nodeName;
            for (propt in node) {
                hasOneProperty = true;
                try {
                    if (!node.hasOwnProperty(propt)) {
                        continue;
                    }
                    var descriptor = Object.getOwnPropertyDescriptor(node, propt);
                    if (descriptor && (descriptor.get || descriptor.set)) {
                        result.push(parentNameLineNext + "." + propt + "=<<CUSTOM PROPERTY>>\r\n");
                        continue;
                    }
                    if (parentLineNext.indexOf(node[propt]) !== -1) {
                        result.push(parentNameLineNext + "." + propt + "=<<RECURRSIVE TO PARENT OBJECT>>\r\n");
                        continue;
                    }
                    // If for some reason accessing a value causes an exception, keep collecting more data.
                    try {
                        snapshotAll(node[propt], propt, parentLineNext, parentNameLineNext, result, maxDepth);
                    } catch (ex) {
                        result.push("<<Exception accessing " + parentNameLineNext + "." + propt + ">> " + ex.toString());
                    }
                } catch (ex) {
                    result.push("<<Exception inspecting " + parentNameLineNext + "." + propt + ">> " + ex.toString());
                }
            }
            if (!hasOneProperty) {
                result.push(parentNameLine + "." + nodeName + "={}\r\n");
            }
        } catch (ex) {
        }
    }

    function getSnapshot (tarFile, rootObject, objectName, depthLimit) {
        var snapshotAsText = "";
        if (Windows.ApplicationModel.Package.current.id.architecture !== Windows.System.ProcessorArchitecture.arm) {
            Jx.log.info("Starting Data snapshot of " + objectName);
            var snapshotResult = [];
            snapshotAll(rootObject,objectName,[],"",snapshotResult, depthLimit);
            for( var i = 0, iMax = snapshotResult.length; i < iMax; ++i) {
                snapshotAsText = snapshotAsText + snapshotResult[i]; 
            }
            Jx.log.info("Finished Data snapshot of " + objectName);
        } else {
            snapshotAsText = "Snapshot not taken, because snapshot on arm architecture may cause app to time out";
        }
        tarFile.addStringFile(objectName + ".snapshot", snapshotAsText);
        return null;
    }
    var snapNumber = 0;
    function getInterestingValues(tarFile) {
        var selection = Mail.Globals.commandManager._selection,
            interestingValues = "";

        try {
            // InterestingValues can trigger get methods that might throw if the app is in a bad state.
            interestingValues =
                "snapNumber: "              + (++snapNumber)                                               + "\r\n" +
                "appDirection: "            + getComputedStyle(document.body).direction                    + "\r\n" +
                "selectedMessageObjectID: " + (selection.message ? selection.message.objectId : "null")    + "\r\n" +
                "selectedMessageSubject: "  + (selection.message ? selection.message.subject : "null")     + "\r\n" +
                "selectedAccountID: "       + (selection.account ? selection.account.objectId : "null")    + "\r\n" +
                "selectedAccountName: "     + (selection.account ? selection.account.displayName : "null") + "\r\n" +
                "composeShowing: "          + Mail.Utilities.ComposeHelper.isComposeShowing                + "\r\n" +
                "composeLaunching: "        + Mail.Utilities.ComposeHelper.isComposeLaunching              + "\r\n" +
                "build: "                   + Windows.ApplicationModel.Package.current.id.version.build    + "\r\n" +
                "";
        } catch (ex) {
            interestingValues = ex.toString;
        }
        tarFile.addStringFile("interestingValues.txt", interestingValues);
        Jx.log.info("Collecting interesting values set:" + snapNumber);
        return null;
     }

     function getPlatformHTML (tarFile) {
        var selection = Mail.Globals.commandManager._selection,
            Plat = Microsoft.WindowsLive.Platform,
            message = selection ? selection.message : null,
            platformMailMessage = message ? message.platformMailMessage : null,
            scrubbedBody = platformMailMessage ? platformMailMessage.getBody(Plat.MailBodyType.html) : null,
            body = scrubbedBody ? scrubbedBody.body : null;

        if (body) {
            tarFile.addStringFile("platformHTML.htm", body);
        }
        return null;
     }

     function getRenderedHTML (tarFile) {
        var readingPane = document.getElementById("mailFrameReadingPane"),
            readingPaneFrame = readingPane.querySelector(Mail.ReadingPaneBody._Selectors.bodyFrameElementSelector);

        if(readingPaneFrame && readingPaneFrame.contentDocument && readingPaneFrame.contentDocument.documentElement) {
            tarFile.addStringFile("renderedHTML.htm", readingPaneFrame.contentDocument.documentElement.outerHTML );
        }
        return null;
     }

     function getScrubbedHTML (tarFile) {
        var selection = Mail.Globals.commandManager._selection,
            Plat = Microsoft.WindowsLive.Platform,
            message = selection ? selection.message : null,
            platformMailMessage = message ? message.platformMailMessage : null,
            scrubbedBody = platformMailMessage ? platformMailMessage.getBody(Plat.MailBodyType.sanitized) : null,
            body = scrubbedBody ? scrubbedBody.body : null;

        if (body) {
            tarFile.addStringFile("scrubbedHTML.htm", body);
        }
        return null;
     }

     function getOuterHTML (tarFile) {
        tarFile.addStringFile("outerHTML.htm", document.documentElement.outerHTML);
        return null;
     }

     function getRootSnapshot (tarFile) {
        return getSnapshot(tarFile, Jx.root, "root", 8);
     }

     function getEMLFile (tarFile) {
        var selection = Mail.Globals.commandManager._selection,
            promise = null,
            localFolder = Windows.Storage.ApplicationData.current.localFolder,
            search = Windows.Storage.Search;
      
        if (selection.message && selection.message.objectId) {
            var emlOptions = new search.QueryOptions(search.CommonFileQuery.orderByName, [".eml"]),
                emlQuery = localFolder.createFileQueryWithOptions(emlOptions),
                objectId = selection.message.objectId;

            promise = emlQuery.getFilesAsync().then(function (files) { 
                var fileToSave = null;
                files.forEach( function (file) {
                    if (file.name.indexOf(objectId) === 0) {
                        fileToSave = file;
                    }
                });
                if (fileToSave) {
                    Jx.log.info("Adding Selected EML file");
                    return Windows.Storage.FileIO.readBufferAsync(fileToSave).then(function (buffer) {
                        // Perform additional tasks after file is read
                        // Use a dataReader object to read from the buffer
                        var byteArray = new Uint8Array(buffer.length),
                            dataReader = Windows.Storage.Streams.DataReader.fromBuffer(buffer);
                        dataReader.readBytes(byteArray);
                        dataReader.close();
                        tarFile.addBytesFile("SelectedMessage.eml", byteArray);
                    }); 
                } else {
                    tarFile.addStringFile("SelectedMessage.eml", "EML with object ID " + objectId + " not found.");
                }
            });   
        } 
        return promise;
    }

    function getETLFiles (tarFile) {
        var localFolder = Windows.Storage.ApplicationData.current.localFolder,
            search = Windows.Storage.Search;

        return localFolder.createFileQueryWithOptions(new search.QueryOptions(search.CommonFileQuery.orderByName, [".etlCpy"])).getFilesAsync().then(function (files) { 
            var dataPromises = [];

            Jx.log.info("Flushing ETL files");
            // Flush ETL files
            Jx.flushSession();

            Jx.log.info("Deleting temp copies of ETL files from previous run");
            files.forEach( function (file) {
                dataPromises.push(file.deleteAsync());
            });
            return WinJS.Promise.join(dataPromises);
        }).then( function () {
            return localFolder.createFileQueryWithOptions(new search.QueryOptions(search.CommonFileQuery.orderByName, [".etl"])).getFilesAsync().then(function (files) {
                var dataPromises = [];

                Jx.log.info("Copying ETL files");
                files.forEach( function (file) {
                    dataPromises.push( file.copyAsync(localFolder, file.name + "Cpy"));
                });
                return WinJS.Promise.join(dataPromises);
            });
        }).then( function () {
            return localFolder.createFileQueryWithOptions(new search.QueryOptions(search.CommonFileQuery.orderByName, [".etlCpy"])).getFilesAsync().then(function (files) {
                var dataPromises = [];

                Jx.log.info("Adding ETL files");
                files.forEach( function (file) {
                    dataPromises.push( Windows.Storage.FileIO.readBufferAsync(file).then(function (name, buffer) {
                        // Perform additional tasks after file is read
                        // Use a dataReader object to read from the buffer
                        var byteArray = new Uint8Array(buffer.length),
                            dataReader = Windows.Storage.Streams.DataReader.fromBuffer(buffer);
                        dataReader.readBytes(byteArray);
                        dataReader.close();
                        tarFile.addBytesFile(name.substr(0,name.length-3), byteArray);
                    }.bind(null, file.name),
                    function (name, error) {
                        tarFile.addStringFile(name.substr(0,name.length-3) + ".txt", error.toString());
                    }.bind(null, file.name)));
                });
                return WinJS.Promise.join(dataPromises);
            });
        });        
    }

    function getMinReproHelper (tarFile) {

        var appOuterHTML = document.documentElement.outerHTML,
            allIFrames = document.querySelectorAll("iframe");
        Debug.assert(allIFrames.length === 2, "DebugSnapshot geared to assume 2 iframes, please update it");

        // Break existing src tags on iframes
        var indexOfIFrame = appOuterHTML.indexOf("<iframe class");
        var indexOfSrc = appOuterHTML.indexOf("src=", indexOfIFrame);
        if (indexOfSrc !== -1) {
            appOuterHTML = appOuterHTML.substr(0, indexOfSrc) + "origSrc" + appOuterHTML.substr(indexOfSrc+3);
            indexOfIFrame = appOuterHTML.indexOf("<iframe class", indexOfSrc);
            indexOfSrc = appOuterHTML.indexOf("src=", indexOfIFrame);
            if (indexOfSrc !== -1) {
                appOuterHTML = appOuterHTML.substr(0, indexOfSrc) + "origSrc" + appOuterHTML.substr(indexOfSrc+3);
            }
        }
        
        var iframeHTML = "",
            allStyles = null,
            allStylesCSS = null,
            styleI = 0;
        for( var i = 0; i < allIFrames.length; ++i) {
            if (allIFrames[i].classList.contains("mailReadingPaneBodyFrame")) {
                appOuterHTML = appOuterHTML.replace('class="mailReadingPaneBodyFrame', 'src="MinReproReadingPaneHTML.htm" class="mailReadingPaneBodyFrame');
                if(allIFrames[i].contentDocument) {
                    iframeHTML =  allIFrames[i].contentDocument.documentElement.outerHTML;
                    iframeHTML = iframeHTML.replace(/<link href=\"[^\"]*\//g, "<link href=\"");
                    iframeHTML = iframeHTML.replace("<head>", '<head>\r\n<link href="MinReproReadingPaneCSS.css" rel="Stylesheet" type="text/css">\r\n');
                    allStyles = allIFrames[i].contentDocument.styleSheets;
                    allStylesCSS = "";
                    for( styleI = 1; styleI < allStyles.length; ++styleI) {
                        allStylesCSS += (allStyles[styleI].cssText + "\r\n");
                    }
                    tarFile.addStringFile("MinReproHelper\\MinReproReadingPaneCSS.css", allStylesCSS);
                    tarFile.addStringFile("MinReproHelper\\MinReproReadingPaneHTML.htm", iframeHTML);
                }
            } else if (allIFrames[i].classList.contains("modernCanvas-frame")) {
                appOuterHTML = appOuterHTML.replace('<iframe class="modernCanvas-frame', '<iframe src="MinReproCanvasHTML.htm" class="modernCanvas-frame');
                if(allIFrames[i].contentDocument) {
                    iframeHTML =  allIFrames[i].contentDocument.documentElement.outerHTML;
                    iframeHTML = iframeHTML.replace(/<link href=\"[^\"]*\//g, "<link href=\"");
                    iframeHTML = iframeHTML.replace("<head>", '<head>\r\n<link href="MinReproComposeCSS.css" rel="Stylesheet" type="text/css">\r\n');
                    allStyles = allIFrames[i].contentDocument.styleSheets;
                    allStylesCSS = "";
                    for( styleI = 1; styleI < allStyles.length; ++styleI) {
                        allStylesCSS += (allStyles[styleI].cssText + "\r\n");
                    }
                    tarFile.addStringFile("MinReproHelper\\MinReproComposeCSS.css", allStylesCSS);
                    tarFile.addStringFile("MinReproHelper\\MinReproCanvasHTML.htm", iframeHTML);
                }
            }
        }

        appOuterHTML = appOuterHTML.replace('<div class="debugConsoleRoot">', '<div class="debugConsoleRoot hidden">');
        appOuterHTML = appOuterHTML.replace('"debugSnapshotHost"', '"debugSnapshotHost hidden"');
        appOuterHTML = appOuterHTML.replace(/<link href=\"[^\"]*\//g, "<link href=\"");
        appOuterHTML = appOuterHTML.replace("<head>", '<head>\r\n<link href="MinReproCSS.css" rel="Stylesheet" type="text/css">\r\n');

        allStyles = document.styleSheets;
        allStylesCSS = "";
        for( i = 1; i < allStyles.length; ++i) {
            allStylesCSS += (allStyles[i].cssText + "\r\n");
        }
        tarFile.addStringFile("MinReproHelper\\MinReproCSS.css", allStylesCSS);
        tarFile.addStringFile("MinReproHelper\\MinReproAppHTML.htm", appOuterHTML);

        var installFolder = Windows.ApplicationModel.Package.current.installedLocation,
            search = Windows.Storage.Search;

        return installFolder.createFileQueryWithOptions(new search.QueryOptions(search.CommonFileQuery.orderByName, [".png"])).getFilesAsync().then(function (files) { 
            var dataPromises = [],
                imagesSeen = [];

            Jx.log.info("Copying likly used images");
            files.forEach( function (file) {
                if (file.name.indexOf("scale-100") !== -1) {
                    var targetName = "images\\" + file.name.replace(/\.scale-100.*png/,".png").toLowerCase();
                    if (imagesSeen.indexOf(targetName) === -1) {
                        imagesSeen.push(targetName);
                        dataPromises.push( Windows.Storage.FileIO.readBufferAsync(file).then(function (name, buffer) {
                            // Perform additional tasks after file is read
                            // Use a dataReader object to read from the buffer
                            var byteArray = new Uint8Array(buffer.length),
                                dataReader = Windows.Storage.Streams.DataReader.fromBuffer(buffer);
                            dataReader.readBytes(byteArray);
                            dataReader.close();
                            tarFile.addBytesFile(name, byteArray);
                        }.bind(null, targetName),
                        function (name, error) {
                            tarFile.addStringFile(name + ".txt", error.toString());
                        }.bind(null, targetName)));
                    }
                }
            });
            return WinJS.Promise.join(dataPromises);
        });
    }

    function getAppxManifest (tarFile) {
        var installFolder = Windows.ApplicationModel.Package.current.installedLocation,
            search = Windows.Storage.Search;

        return installFolder.createFileQueryWithOptions(new search.QueryOptions(search.CommonFileQuery.orderByName, [".xml"])).getFilesAsync().then(function (files) { 
            var dataPromises = [];

            files.forEach( function (file) {
                if (file.name.toLowerCase() === "appxmanifest.xml") {
                    Jx.log.info("Adding Manifest file");

                    dataPromises.push( Windows.Storage.FileIO.readBufferAsync(file).then(function (name, buffer) {
                        // Perform additional tasks after file is read
                        // Use a dataReader object to read from the buffer
                        var byteArray = new Uint8Array(buffer.length),
                            dataReader = Windows.Storage.Streams.DataReader.fromBuffer(buffer);
                        dataReader.readBytes(byteArray);
                        dataReader.close();
                        tarFile.addBytesFile(name, byteArray);
                    }.bind(null, file.name),
                    function (name, error) {
                        tarFile.addStringFile(name + ".txt", error.toString());
                    }.bind(null, file.name)));
                }
            });
            Debug.assert(dataPromises.length === 1);
            return WinJS.Promise.join(dataPromises);
        }); 

    }

    window.saveSnapshot = function () {

        var suggestedFileName = "Mail Snapshot " + Windows.Globalization.DateTimeFormatting.DateTimeFormatter("month day year hour minute").format(new Date()),
            tarFile = new Mail.TarFile(suggestedFileName),
            savePromises = [];

        savePromises.push(getInterestingValues(tarFile));
        savePromises.push(getPlatformHTML(tarFile));
        savePromises.push(getRenderedHTML(tarFile));
        savePromises.push(getScrubbedHTML(tarFile));
        savePromises.push(getOuterHTML(tarFile));
        savePromises.push(getRootSnapshot(tarFile));
        savePromises.push(getEMLFile(tarFile));
        savePromises.push(getETLFiles(tarFile));
        savePromises.push(getMinReproHelper(tarFile));
        savePromises.push(getAppxManifest(tarFile));

        // Filter out nulls
        savePromises = savePromises.filter(function (element) { return element; });

        WinJS.Promise.join(savePromises).done( function () {
            tarFile.save();
        });
    };

   var SnapshotMenu = Mail.SnapshotMenu = function () {
        var hostDiv = document.createElement("div");
        hostDiv.innerHTML = "" +
            '<div id="DS_whatToSave">' +
                '<div> Debug Snapshot Menu </div> <br>' +
                '<div id="DS_Flyout">' +
                    '<div style="width:400px; height:auto; display:-ms-grid; -ms-grid-rows: 1fr 40px; -ms-grid-columns: 1fr 1fr">' +
                        '<div id="DS_snapshotList"  style="width:100%; height:100%; overflow-Y:scroll; -ms-grid-row:1; -ms-grid-column:1"> </div>' +
                        '<div id="DS_snapshotButtons"  style="display:-ms-grid; -ms-grid-rows: 1fr auto 1fr auto 1fr auto 1fr; -ms-grid-columns: 1fr auto 1fr; -ms-grid-row:1; -ms-grid-column:2">' +
                            '<button id="DS_saveSnapshot" type="button" style="border:solid; border-color:black; background:white; -ms-grid-row:2; -ms-grid-column:2">' +
                                '<span tabindex="-1" class="win-label">Save Snapshot</span>' +
                            '</button>' +
                            '<button id="DS_uploadSnapshot" type="button" style="border:solid; border-color:black; background:white; -ms-grid-row:4; -ms-grid-column:2">' +
                                '<span tabindex="-1" class="win-label">Upload Snapshot</span>' +
                            '</button>' +
                        '</div>' +
                        '<div style="-ms-grid-row:2; -ms-grid-column-span:2" >' +
                            '<input id="DS_copyToClipboardOption" type="checkbox" checked="true" >Copy snapshot path to clipboard</input>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="hidden" id="DS_saveInProgress"> Working <br> <progress id="saveProgress"></progress>' +
                '</div>' +
                '<div> Other Debug Tools </div> <br>' +
                '<div style="display:-ms-grid; -ms-grid-rows:10px auto 10px auto 10px auto; -ms-grid-columns:10px auto 10px auto 10px; ">' +
                    '<button id="DS_showGrid" type="button" style="border:solid; border-color:black; background:white; -ms-grid-row:2; -ms-grid-column:2">' +
                        '<span tabindex="-1" class="win-label">Show redline grid</span>' +
                    '</button>' +
                    '<button id="DS_showWidths" type="button" style="border:solid; border-color:black; background:white; -ms-grid-row:2; -ms-grid-column:4">' +
                        '<span tabindex="-1" class="win-label">Show GUIState widths</span>' +
                    '</button>' +
                    '<button id="DS_forceAnimations" type="button" style="border:solid; border-color:black; background:white; -ms-grid-row:4; -ms-grid-column:2">' +
                        '<span tabindex="-1" class="win-label">Force enable animations</span>' +
                    '</button>' +
                    '<button id="DS_disableLightDismiss" type="button" style="border:solid; border-color:black; background:white; -ms-grid-row:4; -ms-grid-column:4">' +
                        '<span tabindex="-1" class="win-label">Disable light dismiss</span>' +
                    '</button>' +
                    '<button id="DS_reloadCSS" type="button" style="border:solid; border-color:black; background:white; -ms-grid-row:6; -ms-grid-column:2">' +
                        '<span tabindex="-1" class="win-label">Reload CSS</span>' +
                    '</button>' +
                    '<button id="DS_restart" type="button" style="border:solid; border-color:black; background:white; -ms-grid-row:6; -ms-grid-column:4">' +
                        '<span tabindex="-1" class="win-label">Restart App</span>' +
                    '</button>' +
                '</div>' +
            '</div>' +
            '';

        MSApp.execUnsafeLocalFunction(function () {
            // hostDiv contains a checkbox input, which requires exeUnsafe
            document.body.appendChild(hostDiv);
        });

        hostDiv.classList.add("debugSnapshotHost");
        var chexboxItems = SnapshotMenu._chexboxItems,
            optionList = "";
        for( var i = 0, iMax = chexboxItems.length; i < iMax; ++i) {
            optionList += '<input id="SnapshotCheckbox_' + i + '" type="checkbox" checked="' + chexboxItems[i].defaultCheck.toString() + '">' + chexboxItems[i].label + '</input><br>';
        }

        MSApp.execUnsafeLocalFunction(function () {
            hostDiv.querySelector("#DS_snapshotList").innerHTML = optionList;
        });

        var D = Mail.Debug;
        hostDiv.querySelector("#DS_saveSnapshot").addEventListener("click", SnapshotMenu._handleSaveSnapshot, false);
        hostDiv.querySelector("#DS_uploadSnapshot").addEventListener("click", SnapshotMenu._handleUploadSnapshot, false);
        hostDiv.querySelector("#DS_showGrid").addEventListener("click", D.showGrid, false);
        hostDiv.querySelector("#DS_showWidths").addEventListener("click", D.showAppWidth, false);
        hostDiv.querySelector("#DS_forceAnimations").addEventListener("click", D.forceWinJSAnimation, false);
        hostDiv.querySelector("#DS_disableLightDismiss").addEventListener("click", D.disableLightDismiss, false);
        hostDiv.querySelector("#DS_reloadCSS").addEventListener("click", D.reloadCSS, false);
        hostDiv.querySelector("#DS_restart").addEventListener("click", function() { Jx.root.restart(); }, false);
        
        var flyout = new WinJS.UI.Flyout(hostDiv,  { alignment: "center", placement: "top" });
        flyout.addEventListener("afterhide", function() { document.body.removeChild(hostDiv);});
        flyout.show(document.body);

    };

     SnapshotMenu._chexboxItems = [
        { func:getInterestingValues, label:"Useful global values", defaultCheck:true},
        { func:function(tarfile) {getPlatformHTML(tarfile); getRenderedHTML(tarfile); getScrubbedHTML(tarfile); }, label:"Email HTML", defaultCheck:true},
        { func:function(tarfile) {getOuterHTML(tarfile); getMinReproHelper(tarfile);}, label:"App HTML", defaultCheck:true},
        { func:getRootSnapshot, label:"Javascript Snapshot", defaultCheck:true},
        { func:getEMLFile, label:"Selected EML File", defaultCheck:true},
        { func:getETLFiles, label:"Log files", defaultCheck:true},
        { func:getAppxManifest, label:"App Version Info", defaultCheck:true},
        ];

    SnapshotMenu._createTarFile = function (tarFile) {
        return new WinJS.Promise( function (complete) {
            // Delay with set immediate to allow 
            // async start of data collection
            window.setImmediate( function () {
                var savePromises = [];

                var listDiv = document.body.querySelector("#DS_snapshotList");
                var i = 0;
                var chexboxItems = SnapshotMenu._chexboxItems;
                var item = null;
                while (Boolean(item = listDiv.querySelector("#SnapshotCheckbox_" + i))) {
                    if(item.checked) {
                        savePromises.push(chexboxItems[i].func(tarFile));
                    }
                    ++i;
                }

                // Filter out nulls
                savePromises = savePromises.filter(function (element) { return element; });

                WinJS.Promise.join(savePromises).then(complete);
            });
        });
    };
    SnapshotMenu._handleSaveSnapshot = function () {
        var suggestedFileName = "Mail Snapshot " + Windows.Globalization.DateTimeFormatting.DateTimeFormatter("month day year hour minute").format(new Date()),
            tarFile = new Mail.TarFile(suggestedFileName),
            body = document.body;

        SnapshotMenu._createTarFile(tarFile).done( function () {
            tarFile.save().then( function (path) {
                var saveInProg = body.querySelector("#DS_saveInProgress");
                // Flyout may have been dismissed during async work
                if (saveInProg) {
                    saveInProg.classList.add("hidden");
                    if (body.querySelector("#DS_copyToClipboardOption").checked){
                        try {
                            window.clipboardData.setData("Text", path);
                            Jx.log.info("Clipboard set to \"" + path + "\"");
                        } catch (ex) {}
                    }
                }
                var messageText = "Snapshot at: \n" + path;
                new Windows.UI.Popups.MessageDialog(messageText, "Save Complete" ).showAsync();
           });
        });
        body.querySelector("#DS_Flyout").classList.add("hidden");
        body.querySelector("#DS_saveInProgress").classList.remove("hidden");
    };

    SnapshotMenu._handleUploadSnapshot = function () {
        var d = new Date(Date()),
            fileName = "SS_" + d.getFullYear() + "_" + d.getMonth() + "_" + d.getDate() + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.getSeconds() + "_" + Math.floor((Math.random() * 10000)).toString(16),
            folderName = d.getFullYear() + "_" + d.getMonth() + "_" + d.getDate(),
            tarFile = new Mail.TarFile(fileName + ".tar"),
            body = document.body;

        var uploadPromise = SnapshotMenu._createTarFile(tarFile).then( function () {
            return tarFile.upload(folderName).then( function () {
                var saveInProg = body.querySelector("#DS_saveInProgress");
                // Joshuala-server stores uploaded files in zip format in a shared folder called files
                var fullTargetPath = "\\\\joshuala-server\\files\\" + folderName + "\\" + fileName + ".zip";
                var messageText = "Snapshot at: \n" + fullTargetPath;
                 // Flyout may have been dismissed during async work
                if (saveInProg) {
                    saveInProg.classList.add("hidden");
                    if (body.querySelector("#DS_copyToClipboardOption").checked){
                        try {
                            window.clipboardData.setData("Text", fullTargetPath);
                            Jx.log.info("Clipboard set to \"" + fullTargetPath + "\"");
                        } catch (ex) {}
                    }
                }
                new Windows.UI.Popups.MessageDialog(messageText, "Upload Complete").showAsync();
                return fullTargetPath;
           },
           function (errorText) {
                if (!Jx.isNonEmptyString(errorText)) {
                    errorText = "Check network connection and try agian.";
                }
                new Windows.UI.Popups.MessageDialog(errorText, "Upload Failed" ).showAsync();
           });
        });
        body.querySelector("#DS_Flyout").classList.add("hidden");
        body.querySelector("#DS_saveInProgress").classList.remove("hidden");
        return uploadPromise;
    };

}());