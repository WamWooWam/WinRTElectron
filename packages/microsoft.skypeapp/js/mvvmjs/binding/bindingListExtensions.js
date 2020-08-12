

(function () {
    "use strict";

    
    var ListBase = Object.getPrototypeOf(Object.getPrototypeOf(new WinJS.Binding.List().createGrouped().groups));
    var FilteredListProjection = Object.getPrototypeOf(new WinJS.Binding.List().createFiltered(function () { return true; }));
    var ListProjection = { prototype: Object.getPrototypeOf(FilteredListProjection) };

    ListBase.index = function (predicate) {
        var array = this;

        for (var i = 0; i < array.length; i++) {
            var item = array.getAt(i);
            if (predicate(item, i)) {
                return i;
            }
        }

        return -1;
    };


    FilteredListProjection._listItemRemoved = function (event) {
        var key = event.detail.key;
        var value = event.detail.value;
        var item = event.detail.item;
        
        var filteredKeys = this._filteredKeys;
        var filteredIndex = filteredKeys.indexOf(key);
        if (filteredIndex !== -1) {
            filteredKeys.splice(filteredIndex, 1);
            this._notifyItemRemoved(key, filteredIndex, value, item);
        }
    };
    FilteredListProjection._listItemMutated = function (event) {
        var key = event.detail.key;
        var value = event.detail.value;
        var item = event.detail.item;
        var filter = this._filter;
        var filteredKeys = this._filteredKeys;
        var filteredIndex = filteredKeys.indexOf(key);
        if (filteredIndex !== -1) {
            if (!filter(value)) {
                filteredKeys.splice(filteredIndex, 1);
                this._notifyItemRemoved(key, filteredIndex, value, item);
            } else {
                this._notifyItemMutated(key, value, item);
            }
        } else {
            if (filter(value)) {
                this._listItemInserted({ detail: { key: key, index: this._list.indexOfKey(key), value: value } });
            }
        }
    };

    var SortedListProjection = Object.getPrototypeOf(new WinJS.Binding.List().createSorted(function () { return true; }));
    SortedListProjection._listItemRemoved = function (event, knownMin) {
        var key = event.detail.key;
        
        var value = event.detail.value;
        var item = event.detail.item;
        var sortedKeys = this._sortedKeys;
        var sortedIndex = sortedKeys.indexOf(key, knownMin);
        if (sortedIndex !== -1) {
            sortedKeys.splice(sortedIndex, 1);
            this._notifyItemRemoved(key, sortedIndex, value, item);
        }
    };
    SortedListProjection._listItemMutated = function (event) {
        var key = event.detail.key;
        var value = event.detail.value;
        var item = event.detail.item;
        var index = this._list.indexOfKey(key);

        var oldSortedIndex = this._sortedKeys.indexOf(key);
        this._sortedKeys.splice(oldSortedIndex, 1);
        var newSortedIndex = this._findInsertionPos(key, index, value);
        this._sortedKeys.splice(oldSortedIndex, 0, key);
        if (oldSortedIndex !== newSortedIndex) {
            this._listItemRemoved({ detail: { key: key, index: index, value: value, item: item } });
            this._listItemInserted({ detail: { key: key, index: index, value: value } });
        } else {
            this._notifyItemMutated(key, value, item);
        }
    };

    SortedListProjection._findInsertionPos = function (key, index, value, startingMin, startingMax) {
        var sorter = this._sortFunction;
        var sortedKeys = this._sortedKeys;
        var min = Math.max(0, startingMin || -1);
        var max = Math.min(sortedKeys.length, startingMax || Number.MAX_VALUE);
        var mid = min;
        while (min <= max) {
            mid = ((min + max) / 2) >>> 0;
            var sortedKey = sortedKeys[mid];
            if (!sortedKey) {
                break;
            }
            var sortedItem = this.getItemFromKey(sortedKey);
            var r = sorter(sortedItem.data, value);
            if (r < 0) {
                min = mid + 1;
            } else if (r === 0) {
                return this._findStableInsertionPos(key, index, min, max, mid, value);
            } else {
                max = mid - 1;
            }
        }
        return min;
    };

    var FilteredListProjectionClass = { prototype: FilteredListProjection };


    WinJS.Namespace.define("WinJS.Binding", {
        FilteredListProjection: FilteredListProjectionClass,
        ListProjection: ListProjection,
    });

}());




