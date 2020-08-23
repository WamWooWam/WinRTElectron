/* Copyright (C) Microsoft Corporation. All rights reserved. */
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(UI) {
            (function(Components) {
                (function(Shell) {
                    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Components.Shell");
                    var DragDataService = (function() {
                            function DragDataService() {
                                var _this = this;
                                this._draggedItem = null;
                                this._draggedItemPromise = null;
                                this._documentDragEndHandler = null;
                                this._documentDragEndHandler = MS.Entertainment.Utilities.addEventHandlers(document.body, {dragend: function() {
                                        if (_this._hasDragData) {
                                            Shell.fail("DragDataService::onDragEndEvent: Drag data needs to be cleaned up by the component that called DragDataService::startDrag.");
                                            _this.finishDrag()
                                        }
                                    }})
                            }
                            Object.defineProperty(DragDataService.prototype, "_hasDragData", {
                                get: function() {
                                    return !!(this.draggedItem || this.draggedItemPromise)
                                }, enumerable: true, configurable: true
                            });
                            Object.defineProperty(DragDataService.prototype, "draggedItem", {
                                get: function() {
                                    return this._draggedItem
                                }, enumerable: true, configurable: true
                            });
                            Object.defineProperty(DragDataService.prototype, "draggedItemPromise", {
                                get: function() {
                                    return this._draggedItemPromise
                                }, enumerable: true, configurable: true
                            });
                            DragDataService.prototype.startDrag = function(draggedItemPromise) {
                                var _this = this;
                                Shell.assert(!this._hasDragData, "DragDataService::draggedItemPromise: Attempted to set a new drag context without clearing existing context.");
                                Shell.assert(draggedItemPromise, "DragDataService::draggedItemPromise: Attempted to start a drag operation without valid drag data.");
                                this._draggedItemPromise = draggedItemPromise && draggedItemPromise.then(function(item) {
                                    Shell.assert(item && item.data, "DragDataService::draggedItemPromise: Expected to get item from dragged item promise.");
                                    _this._draggedItem = item;
                                    return _this._draggedItem
                                }, function(error) {
                                    Shell.fail("DragDataService::draggedItemPromise: Failed to get item from promise: " + (error && error.message));
                                    _this._draggedItem = null;
                                    return WinJS.Promise.wrapError(error)
                                })
                            };
                            DragDataService.prototype.finishDrag = function() {
                                if (this._draggedItemPromise) {
                                    this._draggedItemPromise.cancel();
                                    this._draggedItemPromise = null
                                }
                                this._draggedItem = null;
                                var dragCompleteEvent = document.createEvent("Event");
                                dragCompleteEvent.initEvent(DragDataService.dragCompleteEvent, true, false);
                                document.body.dispatchEvent(dragCompleteEvent)
                            };
                            DragDataService.dragCompleteEvent = "dragComplete";
                            return DragDataService
                        })();
                    Shell.DragDataService = DragDataService;
                    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.dragData, function() {
                        return new DragDataService
                    })
                })(Components.Shell || (Components.Shell = {}));
                var Shell = Components.Shell
            })(UI.Components || (UI.Components = {}));
            var Components = UI.Components
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
