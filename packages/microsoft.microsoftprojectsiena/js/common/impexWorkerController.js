//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ImpexWorkerController = WinJS.Class.define(function ImpexWorkerController_ctor(dispatcher) {
            this._workerHandle = dispatcher.createWorker(["AppMagic", "Common", "ImpexWorker"], [], [AppMagic.IO.Path.getFullPath("js/common/impexWorker.js")])
        }, {
            _workerHandle: null, createZip: function(root) {
                    return this._workerHandle.invokeWorker("createZip", [root]).then(function(zipResult) {
                            return zipResult.result
                        })
                }, loadZip: function(buffer, impexID) {
                    var base64String = Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(buffer),
                        params = [{
                                base64String: base64String, impexID: impexID
                            }];
                    return this._workerHandle.invokeWorker("loadZip", params).then(function(loadResult) {
                            return loadResult.result
                        })
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Common", {ImpexWorkerController: ImpexWorkerController})
})();