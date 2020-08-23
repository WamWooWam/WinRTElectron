/* Copyright (C) Microsoft Corporation. All rights reserved. */
var MS;
(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var Share;
            (function(Share) {
                var fx = MS.Entertainment.UI.Framework;
                MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels.Share");
                window.onNewMusicPage = true;
                var Main = (function() {
                        function Main(){}
                        Object.defineProperty(Main.prototype, "dataContext", {
                            get: function() {
                                return this._dataContext
                            }, enumerable: true, configurable: true
                        });
                        Main.prototype.initialize = function() {
                            WinJS.strictProcessing();
                            WinJS.Binding.optimizeBindingReferences = true;
                            MS.Entertainment.appMode = Microsoft.Entertainment.Application.AppMode.music;
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus);
                            MS.Entertainment.Utilities.updateHtmlDirectionAttribute();
                            fx.enableAutoControlCleanup();
                            WinJS.Application.onerror = MS.Entertainment.UI.Debug.unhandledPromiseErrorHandler;
                            if (!this._eventHandlers) {
                                this._eventHandlers = MS.Entertainment.Utilities.addEventHandlers(Windows.UI.WebUI.WebUIApplication, {activated: this._onActivation.bind(this)});
                                this._documentEventHandlers = MS.Entertainment.Utilities.addEventHandlers(document, {visibilitychange: this._onVisibilityChanged.bind(this)})
                            }
                            MS.Entertainment.Framework.KeyboardInteractionListener.init()
                        };
                        Main.prototype._onActivation = function(args) {
                            var eventKind = args && args.kind;
                            if (eventKind === Windows.ApplicationModel.Activation.ActivationKind.shareTarget) {
                                var shareArgs = args;
                                this._handleShare(shareArgs.shareOperation)
                            }
                            else if (eventKind === Windows.ApplicationModel.Activation.ActivationKind.protocol) {
                                var protocolArgs = args;
                                this._handleTestHook(protocolArgs.uri)
                            }
                            else
                                MS.Entertainment.ViewModels.Share.fail("Unknown activation type passed to the share flyout. eventKind: " + eventKind)
                        };
                        Main.prototype._onVisibilityChanged = function() {
                            if (document.hidden) {
                                var shareTarget = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareTarget);
                                shareTarget.handleHidden()
                            }
                        };
                        Main.prototype._handleShare = function(shareOperation) {
                            var shareTarget = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareTarget);
                            shareTarget.shareOperation = shareOperation;
                            this._dataContext = new MS.Entertainment.ViewModels.Share.ShareTargetViewModel;
                            this._loadDocument()
                        };
                        Main.prototype._loadDocument = function() {
                            var _this = this;
                            MS.Entertainment.Utilities.processAllOnDocumentLoaded(document.body, this).done(function() {
                                _this._dataContext.load()
                            }, function(error) {
                                MS.Entertainment.ViewModels.Share.fail("Failed to process share document. " + (error && error.message))
                            })
                        };
                        Main.prototype._handleTestHook = function(uri) {
                            this._dataContext = new MS.Entertainment.ViewModels.Share.ShareTargetViewModel;
                            var tokenlist = uri.rawUri.split('=');
                            MS.Entertainment.UI.Controls.assert(tokenlist.length === 2, "Expected format of url : microsoftmusicshare://url=foo.com");
                            var testHook = this._dataContext.createTestHook();
                            testHook.urlOverride = tokenlist[1];
                            this._loadDocument()
                        };
                        return Main
                    })();
                Share.Main = Main;
                var main = new MS.Entertainment.ViewModels.Share.Main;
                main.initialize()
            })(Share = ViewModels.Share || (ViewModels.Share = {}))
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
