/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(UI) {
            (function(Controls) {
                (function(Video) {
                    var WatchProgress = (function(_super) {
                            __extends(WatchProgress, _super);
                            function WatchProgress(element, options) {
                                this.templateStorage = (options && options.templateStorage) || "/Controls/Video/WatchProgress.html";
                                this.templateName = "watchProgress";
                                _super.call(this, element, options);
                                this.forceShowOnOwned = this.forceShowOnOwned || false;
                                this._showWatchProgress = this._showWatchProgress || true;
                                this._setupNavigationEventHandlers()
                            }
                            Object.defineProperty(WatchProgress.prototype, "forceShowOnOwned", {
                                get: function() {
                                    return this._forceShowOnOwned
                                }, set: function(value) {
                                        this._forceShowOnOwned = value;
                                        this.updateAndNotify("forceShowOnOwned", value)
                                    }, enumerable: true, configurable: true
                            });
                            Object.defineProperty(WatchProgress.prototype, "showWatchProgress", {
                                get: function() {
                                    return this._showWatchProgress
                                }, set: function(value) {
                                        this._showWatchProgress = value;
                                        this.updateAndNotify("_showWatchProgress", this._showWatchProgress)
                                    }, enumerable: true, configurable: true
                            });
                            Object.defineProperty(WatchProgress.prototype, "percentageWatched", {
                                get: function() {
                                    return this._percentageWatched
                                }, set: function(value) {
                                        this._percentageWatched = Math.max(0, Math.min(value, 100));
                                        this.updateVisibility();
                                        this.updateAndNotify("_percentageWatched", this._percentageWatched)
                                    }, enumerable: true, configurable: true
                            });
                            Object.defineProperty(WatchProgress.prototype, "viewModel", {
                                get: function() {
                                    return this._viewModel
                                }, set: function(value) {
                                        this._viewModel = value;
                                        if (this._bindings) {
                                            this._bindings.cancel();
                                            this._bindings = null
                                        }
                                        this._bindings = WinJS.Binding.bind(this, {_viewModel: {libraryId: this.getProgressWatched.bind(this)}});
                                        this.getProgressWatched()
                                    }, enumerable: true, configurable: true
                            });
                            WatchProgress.prototype.updateVisibility = function() {
                                this.showWatchProgress = (this.forceShowOnOwned && this._viewModel && this._viewModel.inCollection) || !!this.percentageWatched
                            };
                            WatchProgress.prototype.initialize = function() {
                                this.updateAccessibility()
                            };
                            WatchProgress.prototype.unload = function() {
                                if (this._bindings) {
                                    this._bindings.cancel();
                                    this._bindings = null
                                }
                                if (this._navigationEventHandlers) {
                                    this._navigationEventHandlers.cancel();
                                    this._navigationEventHandlers = null
                                }
                                _super.prototype.unload.call(this)
                            };
                            WatchProgress.prototype.updateAccessibility = function() {
                                if (!this._progressBar || !this._ariaLabel)
                                    return;
                                var progressText = String.load(String.id.IDS_DETAILS_PERC_WATCHED_LABEL).format(this.percentageWatched);
                                this._progressBar.setAttribute("aria-valuenow", this.percentageWatched);
                                this._ariaLabel.textContent = progressText;
                                this._ariaLabel.setAttribute("aria-valuetext", progressText);
                                this._ariaLabel.setAttribute("aria-label", progressText)
                            };
                            WatchProgress.prototype.getProgressWatched = function() {
                                var _this = this;
                                if (!this.viewModel) {
                                    this.percentageWatched = 0;
                                    return
                                }
                                if (this._viewModel.libraryId === undefined || this._viewModel.libraryId === -1) {
                                    this.percentageWatched = 0;
                                    return
                                }
                                var ms = new Microsoft.Entertainment.Platform.MediaStore;
                                var pendingBookmarkWriteOperations;
                                if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.bookmarkOperationsWatcher)) {
                                    var bookmarkWatcher = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.bookmarkOperationsWatcher);
                                    pendingBookmarkWriteOperations = bookmarkWatcher.waitForPendingOperations()
                                }
                                return WinJS.Promise.as(pendingBookmarkWriteOperations).then(function() {
                                        return WinJS.Promise.timeout(500)
                                    }).then(function() {
                                        return WinJS.Promise.join({
                                                bookmark: ms.videoProvider.getBookmarkAsync(_this._viewModel.libraryId), playedStatus: ms.videoProvider.getPlayedStatusAsync(_this._viewModel.libraryId)
                                            })
                                    }).then(function(results) {
                                        var bookmark = results.bookmark;
                                        var playedStatus = results.playedStatus;
                                        if (bookmark && _this._viewModel)
                                            _this._viewModel._bookmark = bookmark;
                                        if (_this._viewModel && _this._viewModel._bookmark && _this._viewModel._bookmark.value > 0) {
                                            var duration = _this._viewModel.duration;
                                            var durationMilli = duration.getMilliseconds ? (duration.getMilliseconds() + (1000 * (duration.getSeconds() + (60 * (duration.getMinutes() + (60 * duration.getHours())))))) : duration;
                                            _this.percentageWatched = Math.ceil((100 * _this._viewModel._bookmark.value) / durationMilli)
                                        }
                                        else if (playedStatus && playedStatus.value)
                                            _this.percentageWatched = 100;
                                        else
                                            _this.percentageWatched = 0;
                                        _this.updateAccessibility();
                                        return WinJS.Promise.wrap(_this.percentageWatched)
                                    })
                            };
                            WatchProgress.prototype._setupNavigationEventHandlers = function() {
                                if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.navigation)) {
                                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                    var page = WinJS.Binding.unwrap(navigationService.currentPage);
                                    if (this._navigationEventHandlers) {
                                        this._navigationEventHandlers.cancel();
                                        this._navigationEventHandlers = null
                                    }
                                    this._navigationEventHandlers = MS.Entertainment.UI.Framework.addEventHandlers(page, {onNavigateTo: function onNavigateTo(args) {
                                            this.getProgressWatched()
                                        }.bind(this)})
                                }
                            };
                            return WatchProgress
                        })(MS.Entertainment.UI.Framework.UserControl);
                    Video.WatchProgress = WatchProgress
                })(Controls.Video || (Controls.Video = {}));
                var Video = Controls.Video
            })(UI.Controls || (UI.Controls = {}));
            var Controls = UI.Controls
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(Video) {
            (function(Services) {
                var BookmarkOperationsWatcher = (function() {
                        function BookmarkOperationsWatcher() {
                            this._pendingOperationsCount = 0;
                            this._signal = null
                        }
                        BookmarkOperationsWatcher.prototype.registerOperation = function(operation) {
                            var _this = this;
                            if (!operation) {
                                Trace.fail("Expected an operation!");
                                return
                            }
                            Trace.assert(this._pendingOperationsCount >= 0, "Unexpected _pendingOperationsCount: {0}".format(this._pendingOperationsCount));
                            this._pendingOperationsCount++;
                            operation.done(function() {
                                _this._onOperationComplete()
                            }, function() {
                                _this._onOperationComplete()
                            })
                        };
                        BookmarkOperationsWatcher.prototype.waitForPendingOperations = function() {
                            var promise;
                            if (this._pendingOperationsCount > 0) {
                                if (!this._signal)
                                    this._signal = new MS.Entertainment.UI.Framework.Signal;
                                promise = this._signal.promise
                            }
                            return WinJS.Promise.as(promise)
                        };
                        BookmarkOperationsWatcher.prototype._onOperationComplete = function() {
                            Trace.assert(this._pendingOperationsCount > 0, "Unexpected _pendingOperationsCount: {0}".format(this._pendingOperationsCount));
                            this._pendingOperationsCount--;
                            if (this._pendingOperationsCount === 0 && this._signal) {
                                var signal = this._signal;
                                this._signal = null;
                                signal.complete()
                            }
                        };
                        BookmarkOperationsWatcher.factory = function() {
                            return new BookmarkOperationsWatcher
                        };
                        return BookmarkOperationsWatcher
                    })();
                Services.BookmarkOperationsWatcher = BookmarkOperationsWatcher
            })(Video.Services || (Video.Services = {}));
            var Services = Video.Services
        })(Entertainment.Video || (Entertainment.Video = {}));
        var Video = Entertainment.Video
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.bookmarkOperationsWatcher, MS.Entertainment.Video.Services.BookmarkOperationsWatcher.factory, true);
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.Video.WatchProgress)
