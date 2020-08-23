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
        (function(Data) {
            var ObservableArrayVirtualListAdapter = (function(_super) {
                    __extends(ObservableArrayVirtualListAdapter, _super);
                    function ObservableArrayVirtualListAdapter() {
                        _super.call(this);
                        this._virtualList = null;
                        this._disposed = false;
                        this._initialized = false;
                        this._itemFactory = null;
                        this._inNotificationBatch = false;
                        this.maxItems = Number.MAX_VALUE;
                        this.pagingDelayMS = 250;
                        this.pageInDataOnItemRemoved = false
                    }
                    ObservableArrayVirtualListAdapter.prototype.dispose = function() {
                        if (!this._disposed) {
                            this._clear();
                            this._disposed = true
                        }
                    };
                    ObservableArrayVirtualListAdapter.prototype.initialize = function(virtualList, itemFactory) {
                        MS.Entertainment.assert(virtualList, "virtualList argument expected");
                        MS.Entertainment.assert(itemFactory, "itemFactory argument expected");
                        MS.Entertainment.assert(!this._initialized, "initialize should only be called once!");
                        this._initialized = true;
                        this._itemFactory = itemFactory;
                        this._clear();
                        this._virtualList = virtualList;
                        return this._pageInVirtualListData()
                    };
                    ObservableArrayVirtualListAdapter.prototype._pageInVirtualListData = function() {
                        var _this = this;
                        var itemsPromise = WinJS.Promise.as();
                        if (this._virtualList && !this._disposed)
                            itemsPromise = this._virtualList.itemsFromIndex(this.length).then(function(result) {
                                if (_this._disposed)
                                    return;
                                if (result && result.items && _this._virtualList && !_this._disposed) {
                                    if (!_this.length)
                                        _this._virtualList.setNotificationHandler({
                                            beginNotifications: _this._beginNotifications.bind(_this), endNotifications: _this._endNotifications.bind(_this), invalidateAll: _this._invalidateAll.bind(_this), inserted: _this._inserted.bind(_this), removed: _this._removed.bind(_this), changed: _this._changed.bind(_this), moved: _this._moved.bind(_this)
                                        });
                                    var maxLength = Math.min(result.items.length, _this.maxItems);
                                    for (var i = result.offset; (i < maxLength) && (_this.length < _this.maxItems); i++)
                                        _this.push(_this._itemFactory(result.items[i].data));
                                    if (result.totalCount > _this.length && _this.length < _this.maxItems)
                                        WinJS.Promise.timeout(_this.pagingDelayMS).done(function() {
                                            if (_this._disposed)
                                                return;
                                            _this._pageInVirtualListData()
                                        })
                                }
                            }, function(error) {
                                MS.Entertainment.fail("itemsFromIndex failed!" + (error && error.message))
                            });
                        return itemsPromise
                    };
                    ObservableArrayVirtualListAdapter.prototype._clear = function() {
                        if (this._virtualList) {
                            this._virtualList.setNotificationHandler(null);
                            this._virtualList = null
                        }
                        if (this.length)
                            this.splice(0, this.length)
                    };
                    ObservableArrayVirtualListAdapter.prototype._beginNotifications = function() {
                        this._inNotificationBatch = true
                    };
                    ObservableArrayVirtualListAdapter.prototype._endNotifications = function() {
                        this._inNotificationBatch = false;
                        this._pageInDataForRemovedItems()
                    };
                    ObservableArrayVirtualListAdapter.prototype._pageInDataForRemovedItems = function() {
                        if (this._shouldPageInDataForRemovedItems())
                            this._invalidateAll()
                    };
                    ObservableArrayVirtualListAdapter.prototype._shouldPageInDataForRemovedItems = function() {
                        return this.pageInDataOnItemRemoved && !this._inNotificationBatch && (this.length < this.maxItems) && (this.length < this._virtualList.count)
                    };
                    ObservableArrayVirtualListAdapter.prototype._invalidateAll = function() {
                        if (!this._disposed) {
                            this.splice(0, this.length);
                            this._pageInVirtualListData()
                        }
                    };
                    ObservableArrayVirtualListAdapter.prototype._inserted = function(item, keyBefore, keyAfter, index) {
                        if (!this._disposed) {
                            MS.Entertainment.assert(index >= 0 && (index <= this.length || index > this.maxItems), "index out of bounds");
                            if (index >= 0 && index <= this.length && index < this.maxItems) {
                                if (this.length === this.maxItems)
                                    this.pop();
                                if (index >= this.length)
                                    this.push(this._itemFactory(item.data));
                                else
                                    this.splice(index, 0, this._itemFactory(item.data))
                            }
                        }
                    };
                    ObservableArrayVirtualListAdapter.prototype._removed = function(key, index) {
                        if (!this._disposed) {
                            MS.Entertainment.assert(index >= 0 && (index < this.length || index >= this.maxItems), "index out of bounds");
                            if (index >= 0 && index < this.length) {
                                this.splice(index, 1);
                                this._pageInDataForRemovedItems()
                            }
                        }
                    };
                    ObservableArrayVirtualListAdapter.prototype._changed = function(newValue, oldValue) {
                        if (!this._disposed) {
                            var index = this._virtualList.indexFromKey(oldValue.key);
                            MS.Entertainment.assert(index >= 0 && (index < this.length || index >= this.maxItems), "index out of bounds");
                            if (index >= 0 && index < this.length) {
                                var item = this.item(index);
                                item.data = newValue.data
                            }
                        }
                    };
                    ObservableArrayVirtualListAdapter.prototype._moved = function(item, keyBefore, keyAfter, oldIndex, newIndex) {
                        if (!this._disposed) {
                            MS.Entertainment.assert(this.maxItems === Number.MAX_VALUE, "move action is not currently supported when maxItems is set");
                            MS.Entertainment.assert(oldIndex >= 0 && (oldIndex < this.length || oldIndex >= this.maxItems), "oldIndex out of bounds");
                            MS.Entertainment.assert(newIndex >= 0 && (newIndex < this.length || newIndex >= this.maxItems), "newIndex out of bounds");
                            if (oldIndex >= 0 && oldIndex < this.length && newIndex >= 0 && newIndex < this.length) {
                                this.splice(oldIndex, 1);
                                this.splice(newIndex, 0, item)
                            }
                        }
                    };
                    return ObservableArrayVirtualListAdapter
                })(Entertainment.ObservableArray);
            Data.ObservableArrayVirtualListAdapter = ObservableArrayVirtualListAdapter
        })(Entertainment.Data || (Entertainment.Data = {}));
        var Data = Entertainment.Data
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
