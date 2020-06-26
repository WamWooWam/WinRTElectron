//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var WorkerDispatcher = WinJS.Class.define(function WorkerDispatcher_ctor(workerContext) {
            this._workerContext = workerContext;
            this._workers = {};
            this._onMessageHandler = this._onMessage.bind(this);
            this._workerContext.addEventListener("message", this._onMessageHandler, !1)
        }, {
            _workerContext: null, _workers: null, _onMessageHandler: null, _cid: 0, _onMessage: function(evt) {
                    var messageId = evt.data.messageid;
                    try {
                        switch (evt.data.type) {
                            case"importscripts":
                                this._onMessageImportScripts(evt.data);
                                break;
                            case"createworker":
                                this._onMessageCreateWorker(evt.data);
                                break;
                            case"destroyworker":
                                this._onMessageDestroyWorker(evt.data);
                                break;
                            case"invokeworker":
                                this._onMessageInvokeWorker(evt.data);
                                break;
                            case AppMagic.Services.XmlHttpRequest.PostMessageXmlHttpRequestConstants.ResultMessage:
                                break;
                            default:
                                throw new Error;
                        }
                    }
                    catch(e) {
                        var detail = e.detail || {};
                        this._workerContext.postMessage({
                            type: "error", messageid: messageId, detail: detail
                        })
                    }
                }, _onMessageImportScripts: function(message) {
                    importScripts.apply(null, message.detail.scripts);
                    this._workerContext.postMessage({
                        type: "importscriptssuccess", messageid: message.messageid
                    })
                }, _onMessageCreateWorker: function(message) {
                    var workerId = message.detail.workerid,
                        workerScriptDependencies = message.detail.workerscriptdependencies;
                    typeof workerScriptDependencies != "undefined" && importScripts.apply(null, message.detail.workerscriptdependencies);
                    var ClassCtor = self;
                    message.detail.classspecifier.forEach(function(x) {
                        ClassCtor = ClassCtor[x]
                    });
                    var classObj = {};
                    classObj = ClassCtor.prototype;
                    ClassCtor.apply(classObj, message.detail.ctorargs);
                    this._workers[workerId] = classObj;
                    this._workerContext.postMessage({
                        type: "createworkersuccess", messageid: message.messageid
                    })
                }, _onMessageDestroyWorker: function(message) {
                    var workerId = message.detail.workerid;
                    delete this._workers[workerId];
                    this._workerContext.postMessage({
                        type: "destroyworkersuccess", messageid: message.messageid
                    })
                }, _onMessageInvokeWorker: function(message) {
                    var workerId = message.detail.workerid,
                        worker = this._workers[workerId],
                        fn = worker[message.detail.functionname];
                    WinJS.Promise.wrap().then(function() {
                        return fn.apply(worker, message.detail.parameters)
                    }).then(function(result) {
                        this._workers[workerId] !== "undefined" && this._workerContext.postMessage({
                            type: "invokeworkersuccess", messageid: message.messageid, detail: {result: result}
                        })
                    }.bind(this), function() {
                        this._workers[workerId] !== "undefined" && this._workerContext.postMessage({
                            type: "invokeworkerfail", messageid: message.messageid, detail: {}
                        })
                    }.bind(this))
                }
        }, {});
    new WorkerDispatcher(self)
})();