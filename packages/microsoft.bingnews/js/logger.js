/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS", {
        Logger: WinJS.Class.define(function () {
            this._debug = Platform.Process.isDebug()
        }, {
            _outputStream: null, _writer: null, _debug: false, initialize: function initialize(filename) {
                if (!this._debug) {
                    return WinJS.Promise.wrap({})
                }
                var that = this;
                var localFolder = Windows.Storage.ApplicationData.current.localFolder;
                return localFolder.createFileAsync(filename, Windows.Storage.CreationCollisionOption.generateUniqueName).then(function (newFile) {
                    return newFile.openAsync(Windows.Storage.FileAccessMode.readWrite).then(function (stream) {
                        that._outputStream = stream.getOutputStreamAt(0);
                        that._writer = new Windows.Storage.Streams.DataWriter(that._outputStream)
                    })
                })
            }, log: function log(string) {
                if (!this._debug) {
                    return
                }
                this._writer.writeString(string);
                this._writer.writeString("\r\n")
            }, close: function close() {
                if (!this._debug) {
                    return WinJS.Promise.wrap({})
                }
                var that = this;
                return this._writer.storeAsync().then(function () {
                    that._outputStream.flushAsync().then(function () {
                        that._writer.detachBuffer();
                        that._writer.detachStream();
                        that._writer.close();
                        that._outputStream.close()
                    })
                })
            }
        })
    })
})()