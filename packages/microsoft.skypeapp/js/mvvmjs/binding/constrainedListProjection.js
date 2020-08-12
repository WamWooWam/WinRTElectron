

(function () {
    "use strict";

    var FilteredListProjection = WinJS.Binding.FilteredListProjection;
    var ConstrainedListProjection = WinJS.Class.derive(FilteredListProjection,
        function (list, limitCount) {
            this._limitCount = limitCount;

            var that = this;

            FilteredListProjection.prototype.constructor.call(this, list, function (value) {
                if (limitCount === -1) {
                    return true;
                }

                var index = that._list.indexOf(value);
                if (index > limitCount - 1) {
                    return false;
                }
                return true;
            });
        }, {
            _initFilteredKeys: function () {
                var list = this._list;
                var keys = [];
                for (var i = 0, len = list.length; i < len && (this._limitCount === -1 || i < this._limitCount) ; i++) {
                    var item = list.getItem(i);
                    if (item) {
                        keys.push(item.key);
                    }
                }
                this._filteredKeys = keys;
            },

            _listItemInserted: function (event) {
                var key = event.detail.key;
                var index = event.detail.index;
                var value = event.detail.value;

                if (this._limitCount !== -1 && index >= this._limitCount) {
                    return;
                }

                FilteredListProjection.prototype._listItemInserted.call(this, event);

                if (this._limitCount !== -1 && this._filteredKeys.length > this._limitCount) {
                    
                    index = this._filteredKeys.length - 1;
                    key = this._filteredKeys[index];
                    value = this.getAt(index);
                    var item = {
                        key: key,
                        data: value
                    };

                    this._listItemMutated({
                        detail: {
                            key: key,
                            index: index,
                            value: value,
                            item: item
                        }
                    });

                }
            },

            _listItemRemoved: function (event) {
                FilteredListProjection.prototype._listItemRemoved.call(this, event);

                if (this._filteredKeys.length < this._limitCount) {
                    if (this._list.length > this._filteredKeys.length) {

                        
                        var index = this._filteredKeys.length;
                        var item = this._list.getItem(index);

                        var key = item.key;
                        var value = item.data;

                        this._listItemInserted({
                            detail: {
                                key: key,
                                index: index,
                                value: value,
                                item: item
                            }
                        });
                    }
                }
            }
        });

    WinJS.Namespace.define("MvvmJS.Binding", {
        ConstrainedListProjection: ConstrainedListProjection
    });

}());
