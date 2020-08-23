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
        var Models;
        (function(Models) {
            var ProgressItem = (function(_super) {
                    __extends(ProgressItem, _super);
                    function ProgressItem(title, maxTick) {
                        _super.call(this);
                        this._currentTick = 0;
                        this._icon = null;
                        this._maxTick = ProgressItem.DEFAULT_TICK_MAXIMUM;
                        this._stackRank = 1;
                        this._status = String.empty;
                        this._statusFormat = String.empty;
                        this._tickInterval = ProgressItem.DEFAULT_TICK_INTERVAL;
                        this._title = String.empty;
                        this.title = title,
                        this.maxTick = maxTick
                    }
                    Object.defineProperty(ProgressItem.prototype, "cancelAction", {
                        get: function() {
                            return this._cancelAction
                        }, set: function(value) {
                                var _this = this;
                                var action;
                                if (value) {
                                    this._cancelActionDelegate = value;
                                    action = {
                                        isEnabled: true, canExecute: function() {
                                                return true
                                            }, execute: function() {
                                                _this._cancelActionDelegate.execute();
                                                if (_this.onCancelled)
                                                    _this.onCancelled()
                                            }
                                    }
                                }
                                this.updateAndNotify("cancelAction", action)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ProgressItem.prototype, "currentTick", {
                        get: function() {
                            return this._currentTick
                        }, set: function(value) {
                                this.updateAndNotify("currentTick", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ProgressItem.prototype, "icon", {
                        get: function() {
                            return this._icon
                        }, set: function(value) {
                                this.updateAndNotify("icon", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ProgressItem.prototype, "isComplete", {
                        get: function() {
                            return this.currentTick >= this.maxTick
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ProgressItem.prototype, "itemAction", {
                        get: function() {
                            return this._itemAction
                        }, set: function(value) {
                                this.updateAndNotify("itemAction", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ProgressItem.prototype, "maxTick", {
                        get: function() {
                            return this._maxTick
                        }, set: function(value) {
                                this.updateAndNotify("maxTick", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ProgressItem.prototype, "stackRank", {
                        get: function() {
                            return this._stackRank
                        }, set: function(value) {
                                this.updateAndNotify("stackRank", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ProgressItem.prototype, "status", {
                        get: function() {
                            return this._status
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ProgressItem.prototype, "statusFormat", {
                        get: function() {
                            return this._statusFormat
                        }, set: function(value) {
                                this._statusFormat = value;
                                this._updateStatus()
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ProgressItem.prototype, "tickInterval", {
                        get: function() {
                            return this._tickInterval
                        }, set: function(value) {
                                this.updateAndNotify("tickInterval", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ProgressItem.prototype, "title", {
                        get: function() {
                            return this._title
                        }, set: function(value) {
                                this.updateAndNotify("title", value)
                            }, enumerable: true, configurable: true
                    });
                    ProgressItem.prototype.increment = function() {
                        if (!this.isComplete) {
                            this.currentTick += this.tickInterval;
                            this._updateStatus();
                            if (this.isComplete && this.onCompleted)
                                this.onCompleted()
                        }
                    };
                    ProgressItem.prototype.onCompleted = function() {
                        this.dispatchEvent("onCompleted", this)
                    };
                    ProgressItem.prototype.onCancelled = function() {
                        this.dispatchEvent("onCancelled", this)
                    };
                    ProgressItem.prototype._updateStatus = function() {
                        var status = String.empty;
                        if (this.statusFormat)
                            status = Entertainment.Utilities.Pluralization.getPluralizedString(this.statusFormat, this.maxTick).format(this.currentTick, this.maxTick);
                        this.updateAndNotify("status", status)
                    };
                    ProgressItem.DEFAULT_TICK_MAXIMUM = 10;
                    ProgressItem.DEFAULT_TICK_INTERVAL = 1;
                    return ProgressItem
                })(Entertainment.UI.Framework.ObservableBase);
            Models.ProgressItem = ProgressItem
        })(Models = Entertainment.Models || (Entertainment.Models = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
