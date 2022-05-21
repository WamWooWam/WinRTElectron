
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/

/// <reference path="..\..\common\common.js" />
/// <reference path="..\Helpers\Helpers.js" />

/*global document,setImmediate,Windows,WinJS,Debug,Jx,Calendar,People*/

Jx.delayDefine(Calendar.Views, 'AgendaBackground', function () {

    function _start(evt) { Jx.mark('Calendar:AgendaBackground.' + evt + ',StartTA,Calendar'); }
    function _stop(evt) { Jx.mark('Calendar:AgendaBackground.' + evt + ',StopTA,Calendar'); }
    function _startAsync(evt) { Jx.mark('Calendar:AgendaBackground.' + evt + ',StartTM,Calendar'); }
    function _stopAsync(evt) { Jx.mark('Calendar:AgendaBackground.' + evt + ',StopTM,Calendar'); }

    //
    // Namespaces
    //

    var Templates = Calendar.Templates.Agenda;

    var Animation = WinJS.UI.Animation,
        ApplicationData = Windows.Storage.ApplicationData,
        BitmapDecoder = Windows.Graphics.Imaging.BitmapDecoder,
        BitmapEncoder = Windows.Graphics.Imaging.BitmapEncoder,
        CreationCollisionOption = Windows.Storage.CreationCollisionOption;

    //
    // Agenda Background Component
    //

    var Background = Calendar.Views.AgendaBackground = function () {
        /// <summary>Initializes a new Agenda view object</summary>
        this.initComponent();
        this._id = 'calAgendaBackground';

        // do some one-time initialization
        if (!Background._name) {
            Background._name = 'Calendar.Views.AgendaBackground';

            // Button text used for the "confirm" button in the FilePicker
            Background._pickerCommitButton = Jx.res.getString('AgendaBackgroundPickerButton');

            // The short edge length of the photo (e.g. landscape photos will be resized to be a variable number of pixels wide, but only 1920 pixels tall)
            Background._shortEdgeLength = 1920;

            // The name of our setting
            Background._settingName = 'agendaBackground';

            // Pieces of the image path
            Background._localFolderUriBase = 'ms-appdata:///local/';
            Background._folderName = 'CalBackground';
            Background._fileName = 'Background';
            Background._fileNameCount = 0;
            Background._extJpeg = 'jpg';
            Background._extPng = 'png';

            // The default background
            Background._default = '/ModernCalendar/views/agenda/Background.jpg';
            
            // Cache the background image between view loads for faster reloading
            Background._cacheImage = null;
        }
    };

    Jx.augment(Background, Jx.Component);
    
    var proto = Background.prototype;

    Background._getSupportedFileExtensions = function () {
        /// <summary>Gets the file extensions supported by the Windows BitmapDecoder</summary>
        /// <returns>The array of supported file extensions</returns>
        _start('_getSupportedFileExtensions');

        var supportedFileExtensions = [];
        var codecInfoCollection = BitmapDecoder.getDecoderInformationEnumerator();

        codecInfoCollection.forEach(function (codecInfo) {
            codecInfo.fileExtensions.forEach(function (fileExtension) {
                supportedFileExtensions.push(fileExtension);
            }, this);
        }, this);

        _stop('_getSupportedFileExtensions');

        return supportedFileExtensions;
    };

    // Jx.Component

    proto.getUI = function (ui) {
        /// <summary>Provides the base UI for the view</summary>
        /// <param name="ui">The UI object to fill in</param>
        ui.html = Templates.backgroundContainer({
            id: this._id
        });
    };

    proto.activateUI = function (jobSet) {
        /// <summary>Activates the UI elements</summary>
        /// <param name="jobSet">The UI job set</param>
        /// <param name="settings">The app settings</param>
        _start('activateUI');

        this._jobSet = jobSet;

        var data = {};
        this.fire('getSettings', data);
        this._settings = data.settings;

        // Locate the element
        var host = this._host = document.getElementById(this._id);
        this._progress = host.querySelector('.backgroundprogress');
        this._hideProgress();

        // Create the background fields
        this._backgroundUri = null;
        this._backgroundElement = null;

        // Schedule the background image load
        jobSet.addUIJob(this, this._load, null, People.Priority.perfLowFidelity);

        _stop('activateUI');
    };

    proto.deactivateUI = function () {
        /// <summary>Deactivates the UI elements</summary>
        _start('deactivateUI');

        this._jobSet.cancelAllChildJobs();
        Jx.dispose(this._jobSet);
        this._jobSet = null;

        if (this._changePromise) {
            this._changePromise.cancel();
            this._changePromise = null;
        }

        this._backgroundUri = null;
        this._settings = null;

        // Release the DOM elements
        this._backgroundElement = null;
        this._progress = null;
        this._host = null;

        _stop('deactivateUI');
    };

    // Background methods

    proto.changeAsync = function (useDefault) {
        /// <summary>Changes the background image</summary>
        /// <param name="useDefault">A boolean indicating whether the default image should be used</param>
        /// <returns>A promise indicating when the background change is completed</returns>
        var that = this;
        if (useDefault) {
            this._changePromise = this._changeAsync(Background._default)
                .then(this._cleanUpBackgrounds.bind(this));
        } else {
            this._changePromise = this._browse()
                .then(function (file) {
                    // Show the progress indicator
                    that._showProgress();

                    // Process the file
                    return that._process(file);
                })
                .then(function (background) {
                    // Hide the progress
                    that._hideProgress();

                    // Assuming we received a background, set it
                    if (background) {
                        return that._changeAsync(background);
                    }
                }, function (error) {
                    // Hide the progress
                    that._hideProgress();

                    // Pass the error on
                    return WinJS.Promise.wrapError(error);
                });
        }

        return this._changePromise;
    };

    proto._getSetting = function () {
        /// <summary>Get the background setting</summary>
        /// <returns>The settings object, if found, null otherwise</returns>
        return this._settings.get(Background._settingName);
    };

    proto._setSetting = function (backgroundUri) {
        /// <summary>Sets the background setting</summary>
        /// <param name="backgroundUri">The background URI</param>
        Debug.assert(Jx.isNonEmptyString(backgroundUri), 'Jx.isNonEmptyString(backgroundUri)');

        if (backgroundUri !== Background._default) {
            this._settings.set(Background._settingName, backgroundUri);
        } else {
            // We've gone back to the default, remove the setting
            this._settings.remove(Background._settingName);
        }
    };

    proto._load = function () {
        /// <summary>Load the initial background</summary>
        var background = this._getSetting();
        if (background) {
            this._changePromise = this._changeAsync(background);
            this._changePromise.done();
        } else {
            this._changePromise = this._changeAsync(Background._default);
            this._changePromise.done();
        }
    };

    proto._changeAsync = function (backgroundUri) {
        /// <summary>Change the background image for the agenda</summary>
        /// <param name="backgroundUri">The URI for the new background image</param>
        Debug.assert(Jx.isNonEmptyString(backgroundUri), 'Jx.isNonEmptyString(backgroundUri)');

        _startAsync('_changeAsync');

        var that = this;
        var promise;

        if (this._backgroundUri !== backgroundUri) {
            this._backgroundUri = backgroundUri;
            this._setSetting(this._backgroundUri);

            var oldElement = this._backgroundElement;
            var element = this._backgroundElement = Templates.background();

            if (backgroundUri === Background._default) {
                element.classList.add('backgroundDefault');
            }

            element.style.opacity = 0;
            element.style.backgroundImage = 'url("' + backgroundUri + '")';
            this._host.appendChild(element);

            promise = this._loadImageAsync(backgroundUri).then(function () {
                return that._animate(element, oldElement);
            });
        } else {
            promise = WinJS.Promise.wrap(null);
        }

        return promise.then(function () {
            _stopAsync('_changeAsync');
        });
    };

    proto._loadImageAsync = function (backgroundUri) {
        var backgroundImage;
        var onImageLoad;

        return new WinJS.Promise(function (complete) {
            backgroundImage = Background._cacheImage = new Image();

            onImageLoad = function () {
                if (backgroundImage && onImageLoad) {
                    backgroundImage.removeEventListener('load', onImageLoad);
                    backgroundImage.removeEventListener('error', onImageLoad);
                    onImageLoad = null;
                }

                setImmediate(function () {
                    complete();
                });
            };

            // We don't care whether it loads or errors, just wait for the first one to fire
            backgroundImage.addEventListener('load', onImageLoad);
            backgroundImage.addEventListener('error', onImageLoad);
            backgroundImage.src = backgroundUri;
        }, function () {
            // If we still have an image reference, remove the listener
            if (backgroundImage && onImageLoad) {
                backgroundImage.removeEventListener('load', onImageLoad);
                backgroundImage.removeEventListener('error', onImageLoad);
                
                onImageLoad = null;
                backgroundImage = null;
            }
        });
    };

    proto._showProgress = function () {
        /// <summary>Show the progress indicator</summary>
        this._progress.style.display = '';
    };

    proto._hideProgress = function () {
        /// <summary>Hide the progress indicator</summary>
        if (this._progress) {
            this._progress.style.display = 'none';
        }
    };

    proto._animate = function (newElement, oldElement) {
        /// <summary>Animate to the new background</summary>
        /// <param name="newElement">The new background's DOM element</param>
        /// <param name="oldElement" optional="True">The old background's DOM element</param>
        Debug.assert(Jx.isObject(newElement), 'Jx.isObject(newElement)');
        Debug.assert(Jx.isNullOrUndefined(oldElement) || Jx.isObject(oldElement), 'Jx.isNullOrUndefined(oldElement) || Jx.isObject(oldElement)');

        _startAsync('_animate');

        newElement.style.zIndex = 2;

        if (oldElement) {
            oldElement.style.zIndex = 1;
        }

        var that = this;
        return Animation.fadeIn(newElement).then(function () {
            that._animationPromise = null;

            if (oldElement) {
                that._host.removeChild(oldElement);
            }

            _stopAsync('_animate'); // used in perfbench

            that.fire("viewReady");
        });
    };

    proto._browse = function () {
        /// <summary>Launch the picker to allow the user to choose a new background</summary>
        /// <returns>A file Promise if the user selects a file, null otherwise</returns>
        var fileTypes = Background._getSupportedFileExtensions();
        var fileOpenPicker = new Windows.Storage.Pickers.FileOpenPicker();
        fileOpenPicker.commitButtonText = Background._pickerCommitButton;
        fileOpenPicker.fileTypeFilter.replaceAll(fileTypes);
        fileOpenPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
        fileOpenPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;

        return fileOpenPicker.pickSingleFileAsync();
    };

    proto._process = function (file) {
        /// <summary>Process the image file</summary>
        /// <param name="file">The StorageFile to process</param>
        /// <returns>A Promise linked to completion</returns>
        if (!file) {
            return WinJS.Promise.wrap(null);
        }

        _startAsync('_process');

        var that = this;
        var inStream;
        var outStream;
        var outFile;
        var bitmapDecoder;
        var bitmapWidth;
        var bitmapHeight;
        var bitmapEncoderId;
        var bitmapEncoder;
        var error;

        // Open the file for reading to get the stream
        return file.openReadAsync().then(function (stream) {
            inStream = stream;

            // Create the bitmap decoder
            return BitmapDecoder.createAsync(stream);
        }).then(function (decoder) {
            bitmapDecoder = decoder;

            bitmapWidth = bitmapDecoder.orientedPixelWidth;
            bitmapHeight = bitmapDecoder.orientedPixelHeight;

            // Determine the output file name - PNG will be transcoded to PNG, everything else to JPEG
            var fileExt;

            if (bitmapDecoder.decoderInformation.codecId === BitmapDecoder.pngDecoderId) {
                fileExt = Background._extPng;
                bitmapEncoderId = BitmapEncoder.pngEncoderId;
            } else {
                fileExt = Background._extJpeg;
                bitmapEncoderId = BitmapEncoder.jpegEncoderId;
            }
            
            // Create the new file
            return that._createFile(fileExt);
        }).then(function (file) {
            outFile = file;

            // Open the new file for writing
            return outFile.openAsync(Windows.Storage.FileAccessMode.readWrite);
        }).then(function (stream) {
            outStream = stream;

            // Create the bitmap encoder for the specified output (PNG or JPEG)
            return BitmapEncoder.createAsync(bitmapEncoderId, stream);
        }).then(function (encoder) {
            bitmapEncoder = encoder;

            // Determine the ratio between the target length and the actual length
            var widthRatio = Background._shortEdgeLength / bitmapWidth;
            var heightRatio = Background._shortEdgeLength / bitmapHeight;

            // Pick the larger ratio, but cap at 1 - we won't ever enlarge an image
            var winningRatio = Math.min(1, Math.max(widthRatio, heightRatio));

            // Set the height and width to the transform
            bitmapEncoder.bitmapTransform.scaledWidth = Math.round(bitmapWidth * winningRatio);
            bitmapEncoder.bitmapTransform.scaledHeight = Math.round(bitmapHeight * winningRatio);

            // Get the pixel data from the decoder
            return bitmapDecoder.getPixelDataAsync();
        }).then(function (pixels) {
            // Write the pixel data to the output file and flush the encoder
            bitmapEncoder.setPixelData(bitmapDecoder.bitmapPixelFormat, bitmapDecoder.bitmapAlphaMode, bitmapWidth, bitmapHeight, bitmapDecoder.dpiX, bitmapDecoder.dpiY, pixels.detachPixelData());
            return bitmapEncoder.flushAsync();
        }).then(null, function (ex) {
            // Save and eat any transcoding errors, we'll raise them again later
            error = ex;
        }).then(function () {
            // Now that we've eaten the errors, let's cleanup

            // Close the input stream, if it exists
            if (inStream) {
                inStream.close();
            }

            // Close the output stream, if it exists
            if (outStream) {
                outStream.close();
            }

            if (error) {
                // We've encountered an error, we should try to delete the file
                var deadFile = outFile;
                outFile = null;

                if (deadFile) {
                    // Delete the dead file, if possible
                    return deadFile.deleteAsync().then(null, function () {
                        // If the delete fails, there's nothing we can do
                    });
                }
            } else {
                // No errors, clean up other backgrounds
                return that._cleanUpBackgrounds(outFile);
            }
        }).then(function () {
            _stopAsync('_process');

            if (error) {
                // Raise the error again
                return WinJS.Promise.wrapError(error);
            } else {
                // Return the new background URI
                return WinJS.Promise.wrap(Background._localFolderUriBase + Background._folderName + '/' + outFile.name);
            }
        });
    };

    proto._createFile = function (fileExt) {
        /// <summary>Create the given file in the background directory</summary>
        /// <param name="fileExt">The file extension for the output file</param>
        /// <returns>A Promise indicating the completion of the file creation, returning a StorageFile object</returns>
        Debug.assert(Jx.isNonEmptyString(fileExt), 'Jx.isNonEmptyString(fileExt)');

        // Create the folder, opening the currently existing folder if present
        return ApplicationData.current.localFolder.createFolderAsync(Background._folderName, CreationCollisionOption.openIfExists)
            .then(function (folder) {
                // Get the current file name count and increment
                var count = Background._fileNameCount++;

                // Build the file name
                var fileName = Background._fileName + count + '.' + fileExt;

                // Create the file, allowing for a unique name generation in the event of conflicts
                return folder.createFileAsync(fileName, CreationCollisionOption.generateUniqueName);
            });
    };

    proto._cleanUpBackgrounds = function (currentFile) {
        /// <summary>Clean up the backgrounds directory</summary>
        /// <param name="currentFile">A StorageFile object representing the background currently in use (this file will be kept)</param>
        /// <returns>A Promise that indicates completion of all delete operations</returns>
        Debug.assert(Jx.isNullOrUndefined(currentFile) || Jx.isObject(currentFile), 'Jx.isNullOrUndefined(currentFile) || Jx.isObject(currentFile)');

        return ApplicationData.current.localFolder.getFolderAsync(Background._folderName).then(function (folder) {
            return folder.getFilesAsync();
        }).then(function (files) {
            var promiseArray = [];

            files.forEach(function (file) {
                if (!currentFile || !file.isEqual(currentFile)) {
                    promiseArray.push(file.deleteAsync());
                }
            });

            return WinJS.Promise.join(promiseArray);
        }).then(null, function () {
            // Ignore any errors that occur
        });
    };

});