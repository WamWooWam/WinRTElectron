

(function capturing() {
    "use strict";

    var ThumbnailFactory = MvvmJS.Class.define(function (lib) {
        Skype.Diagnostics.ETW.Debug && Skype.Diagnostics.ETW.Debug.addAutoTracingToObject(this, this.__className);
    }, {

        _getThumbnailAsync: function (inputFile) {
            return inputFile.getThumbnailAsync(Windows.Storage.FileProperties.ThumbnailMode.videosView, 256)
                .then(function (thumbnail) {
                    if (thumbnail && thumbnail.size > 0) {
                        return thumbnail;
                    }
                    return WinJS.Promise.wrapError("Thumbnail creation failed. No thumbnail storage item!");
                });
        },

        _getThumbnailBufferAsync: function (inputFile) {
            var thumbnail, reader, size;
            
            function cleanup() {
                thumbnail && thumbnail.close();
                reader && reader.close();
            };

            return this._getThumbnailAsync(inputFile)
                .then(function (item) {
                    thumbnail = item;
                    var inputStream = thumbnail.getInputStreamAt(0);
                    reader = new Windows.Storage.Streams.DataReader(inputStream);
                    size = thumbnail.size;

                    return reader.loadAsync(size);
                })
                .then(function () {
                    ///<disable>JS2005.UseShortFormInitializations</disable>
                    var buffer = new Array(size);
                    reader.readBytes(buffer);
                    cleanup();
                    return buffer;
                }).then(null, function (error) {
                    cleanup();
                    return error;
                });                
        },

        _saveBufferToFile: function (args) {
            assert(args.file, "missing argument: file");
            assert(args.buffer, "missing argument: buffer");

            return Windows.Storage.FileIO.writeBytesAsync(args.file, args.buffer);
        },

        _createFileAsync: function () {
            var outputFolder = Windows.Storage.ApplicationData.current.localFolder;
            var thumbnailName = "thumbnail.bmp";

            return outputFolder.createFileAsync(thumbnailName, Windows.Storage.CreationCollisionOption.replaceExisting);
        },

        createThumbnailFileAsync: function (inputFile) {
            assert(inputFile, "missing argument: input file");

            var image;
            return WinJS.Promise.join({
                    buffer: this._getThumbnailBufferAsync(inputFile),
                    file: this._createFileAsync().then(function(file) { return image = file;})
                })
                .then(this._saveBufferToFile.bind(this))
            
                .then(function () {
                    return image;
                })
            
                
                .then(null, function () {
                    return WinJS.Promise.join([
                        image && image.deleteAsync(), 
                        WinJS.Promise.wrapError("Thubnail creation failed (saving the file)")
                    ]);
                });
        }

    });
    
    WinJS.Namespace.define("Skype.VideoMessaging", {
        ThumbnailFactory: ThumbnailFactory,
        thumbnailFactory: new ThumbnailFactory(),
    });

})();
