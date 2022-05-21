
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

window.ShareUnitTestHelpers = {
    getShareOperation : function(dataPackage) {
        ///<summary>
        /// Puts together a share operation with all of the properties that the Share.Data class needs
        ///</summary>
        ///<param name="dataPackage" type="Windows.ApplicationModel.DataTransfer.DataPackage">Data package for the activation context</param>
        ///<returns type="Windows.ApplicationModel.DataTransfer.ShareTarget.ShareOperation">ShareOperation containing the DataPackage</returns>

        var shareOperation = { data: dataPackage.getView() };

        return shareOperation;
    },
    addFileToPackageAsync : function (dataPackage, tc) {
        ///<summary>
        /// Adds a file (from the current package) to the data package.
        ///</summary>
        ///<param name="dataPackage" type="Windows.ApplicationModel.DataTransfer.DataPackage">Data package to which the file should be added</param>
        ///<returns>Promise associated with the file add</returns>

        return new WinJS.Promise(function (complete, error) {
            var appRootFolder = Windows.ApplicationModel.Package.current.installedLocation; 
            appRootFolder.getFolderAsync("SharingTestApp\\files").then(function(filesFolder) {
                filesFolder.getFilesAsync().then(function (files) {
                    try 
                    {
                        // Workaround for bug 324883 - Windows 8 Bugs. 
                        var filesArray = [];
                        for (var i = 0; i < files.size; i++) {
                            filesArray[i] = files[i];
                        }
                        dataPackage.setStorageItems(filesArray);
                    } catch(e) {
                        // Expected with the workaround.
                    }
                    complete();
                },
                function getFileError() {
                    tc.error("Unable to retrieve files to add to data package");
                    error();
                });
            },
            function getFolderError() {
                tc.error("Unable to retrieve files to add to data package");
                error();
            });
        });
    },
    addBitmapToPackageAsync : function (dataPackage) {
        return Windows.ApplicationModel.Package.current.installedLocation.getFileAsync("SharingTestApp\\images\\ShareAnythingLogo.png")
           .then(function (thumbnailFile) {
               dataPackage.properties.thumbnail = Windows.Storage.Streams.RandomAccessStreamReference.createFromFile(thumbnailFile);

               return Windows.ApplicationModel.Package.current.installedLocation.getFileAsync("SharingTestApp\\images\\ShareAnythingLogoLarge.png");
           }).then(function (imageFile) {
               dataPackage.setBitmap(Windows.Storage.Streams.RandomAccessStreamReference.createFromFile(imageFile));
           });
    },
    generateLongString : function (longLength) {
        ///<summary>
        /// Generates a string with the given length
        ///</summary>
        var longString = "This is a long string. ";
        
        // It's not fast, but it works.
        while (longString.length < longLength) {
            longString = longString.concat(longString);
        }

        if (longString.length > longLength) {
            longString = longString.substring(0, longLength);
        }

        return longString;
    },
    setDataOfType : function (dataPackage, dataFormat) {
        ///<summary>
        /// Sets data on the data package with particular format
        /// Hooks up to a nonfunctional DataProviderHandler - data is not retrievable, but does exist on the package formats list.
        ///</summary>

        dataPackage.setDataProvider(dataFormat, function () {
            LiveUnit.Assert.fail("Unexpected call to retrieve data");
        });
    },
    getStandardFormatOrder: function () {
        ///<summary>
        /// Returns an Array object containing the default formatOrder values
        ///</summary>
        ///<returns type="Array">Array of string format order config</returns>
        
        return [
                "HTML Format",
                "UniformResourceLocatorW",
                "Shell IDList Array",
                "Text"
        ];
    },
    verifyAssert: function (tc, fn, msg) {
        ///<summary>
        /// Verify that an assert fires when calling fn(). Do nothing in non-debug builds.
        ///</summary>
        var lastError;
        if (Debug.hasOwnProperty("assert")) {
            try {
                Debug.throwOnAssert = true;
                fn();
            }
            catch (e) {
                Debug.throwOnAssert = false;
                lastError = e;
            }
            tc.isTrue(lastError instanceof Debug.AssertError, msg);
        }
    }
}
