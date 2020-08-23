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
    var Entertainment;
    (function(Entertainment) {
        var ViewModels;
        (function(ViewModels) {
            var ProgressStackPanelViewModel = (function(_super) {
                    __extends(ProgressStackPanelViewModel, _super);
                    function ProgressStackPanelViewModel() {
                        _super.call(this);
                        this._items = new Entertainment.ObservableArray;
                        this._listeners = []
                    }
                    Object.defineProperty(ProgressStackPanelViewModel.prototype, "items", {
                        get: function() {
                            return this._items
                        }, enumerable: true, configurable: true
                    });
                    ProgressStackPanelViewModel.prototype.addProgressItem = function(title, max, icon, statusFormat) {
                        var item = new Entertainment.Models.ProgressItem(title, max);
                        item.icon = icon;
                        item.statusFormat = statusFormat;
                        this._listeners.push(Entertainment.Utilities.addEventHandlers(item, {
                            onCancelled: this._removeProgressItem.bind(this), onCompleted: this._removeProgressItem.bind(this)
                        }));
                        this.items.push(item);
                        return item
                    };
                    ProgressStackPanelViewModel.prototype.dispose = function() {
                        if (this._listeners) {
                            this._listeners.forEach(function(listener) {
                                listener.cancel()
                            });
                            this._listeners = null
                        }
                    };
                    ProgressStackPanelViewModel.prototype._removeProgressItem = function(event) {
                        var item = event.detail;
                        if (item) {
                            var position = this.items.indexOf(item);
                            if (position >= 0)
                                this.items.removeAt(position)
                        }
                    };
                    return ProgressStackPanelViewModel
                })(Entertainment.UI.Framework.ObservableBase);
            ViewModels.ProgressStackPanelViewModel = ProgressStackPanelViewModel
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
