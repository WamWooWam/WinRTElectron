

(function () {
    "use strict";

    function asNumber(n) {
        return n === undefined ? undefined : +n;
    }

    var ListProjection = WinJS.Binding.ListProjection;

    var MappedListProjection = WinJS.Class.derive(ListProjection, function (list, mapFn) {
        this._list = list;
        this._addListListener("itemchanged", this._listItemChanged);
        this._addListListener("iteminserted", this._listItemInserted);
        this._addListListener("itemmutated", this._listItemMutated);
        this._addListListener("itemmoved", this._listItemMoved);
        this._addListListener("itemremoved", this._listItemRemoved);
        this._addListListener("reload", this._listReload);

        this._map = mapFn || function (item) { return item; };
        this.MappedItems = new WinJS.Binding.List();

        this._initKeys();
    }, {
        _map: null,
        MappedItems: null,
        _filter: null,
        _filteredKeys: null,
        _initKeys: function () {
            var list = this._list;
            var keys = [];
            for (var i = 0, len = list.length; i < len; i++) {
                var item = list.getItem(i);
                keys.push(item.key);
                var transformedItem = this._map(item.data);
                this.MappedItems.push(transformedItem);
            }
            this._filteredKeys = keys;
        },

        _findInsertionPosition: function (key, index) {
            
            var previousKey;
            while ((--index) >= 0) {
                var item = this._list.getItem(index);
                if (item && item.data) {
                    previousKey = item.key;
                    break;
                }
            }
            var filteredKeys = this._filteredKeys;
            var filteredIndex = previousKey ? (filteredKeys.indexOf(previousKey) + 1) : 0;
            return filteredIndex;
        },

        _listItemChanged: function (event) {
            var key = event.detail.key;
            
            
            var newValue = event.detail.newValue;
            var oldItem = event.detail.oldItem;
            var newItem = event.detail.newItem;

            var filteredKeys = this._filteredKeys;
            var filteredIndex = filteredKeys.indexOf(key);

            var oldTransValue = this.MappedItems.getAt(filteredIndex);
            var newTransValue = this._map(newValue);
            this.MappedItems.setAt(filteredIndex, newTransValue);
            this._notifyItemChanged(key, filteredIndex, oldTransValue, newTransValue, oldItem, newItem);
        },
        _listItemInserted: function (event) {
            var key = event.detail.key;
            var index = event.detail.index;
            var value = event.detail.value;
            var filteredIndex = index;
            var filteredKeys = this._filteredKeys;

            filteredKeys.splice(filteredIndex, 0, key);
            var transformedValue = this._map(value);
            this.MappedItems.splice(filteredIndex, 0, transformedValue);
            this._notifyItemInserted(key, filteredIndex, transformedValue);
        },
        _listItemMoved: function (event) {
            var key = event.detail.key;
            var newIndex = event.detail.newIndex;
            var filteredKeys = this._filteredKeys;
            var oldFilteredIndex = filteredKeys.indexOf(key);
            if (oldFilteredIndex !== -1) {
                var transformedValue = this.MappedItems.getAt(oldFilteredIndex);

                filteredKeys.splice(oldFilteredIndex, 1);
                this.MappedItems.splice(oldFilteredIndex, 1);

                var newFilteredIndex = this._findInsertionPosition(key, newIndex);
                filteredKeys.splice(newFilteredIndex, 0, key);
                this.MappedItems.splice(newFilteredIndex, 0, transformedValue);

                this._notifyItemMoved(key, oldFilteredIndex, newFilteredIndex, transformedValue);
            }
        },
        _listItemMutated: function (event) {
            var key = event.detail.key;
            var filteredKeys = this._filteredKeys;
            var filteredIndex = filteredKeys.indexOf(key);
            var item = this.getItem(filteredIndex);
            this._notifyItemMutated(key, item.data, item);
        },
        _listItemRemoved: function (event) {
            var key = event.detail.key;
            
            
            var filteredKeys = this._filteredKeys;
            var filteredIndex = filteredKeys.indexOf(key);
            filteredKeys.splice(filteredIndex, 1);

            var transformedItem = this.MappedItems.getItem(filteredIndex);
            this.MappedItems.splice(filteredIndex, 1);

            this._notifyItemRemoved(key, filteredIndex, transformedItem.data, transformedItem);
        },
        _listReload: function () {
            this._initKeys();
            this._notifyReload();
        },

        
        length: {
            get: function () { return this._filteredKeys.length; },
            set: function (value) {
                if (typeof value === "number" && value >= 0) {
                    var current = this.length;
                    if (current > value) {
                        this.splice(value, current - value);
                    }
                } else {
                    
                    throw new WinJS.ErrorFromName("WinJS.Binding.List.IllegalLength", strings.illegalListLength);
                }
            }
        },

        getItem: function (index) {
            
            
            
            
            
            
            
            index = asNumber(index);
            return this.MappedItems.getItem(index);
        },

        indexOfKey: function (key) {
            
            
            
            
            
            
            
            return this._filteredKeys.indexOf(key);
        },
        notifyItemChanged: function (index) {
            
            
            
            
            
            
            index = asNumber(index);
            var item = this.getItem(index);
            var key = this._filteredKeys[index];
            this.MappedItems._notifyItemChanged(key, index, item.data, item.data, item , item);
            return this._notifyItemChanged(key, index, item.data, item.data, item , item);
        },
        notifyMutated: function (index) {
            
            
            
            
            
            
            index = asNumber(index);
            this.MappedItems.notifyMutated(index);
            return this._notifyMutatedFromKey(this._filteredKeys[index]);
        },

        setAt: function () {
            throw new Error("Unsupported function!");
        },

        
        _spliceFromKey: function (key, howMany) {
            
            if (arguments.length > 2) {
                
                var args = copyargs(arguments);
                args[1] = 0; 
                this._list._spliceFromKey.apply(this._list, args);
            }
            
            
            var result = [];
            if (howMany) {
                var keysToRemove = [];
                var filteredKeys = this._filteredKeys;
                var filteredKeyIndex = filteredKeys.indexOf(key);
                for (var i = filteredKeyIndex, len = filteredKeys.length; i < len && (i - filteredKeyIndex) < howMany; i++) {
                    key = filteredKeys[i];
                    keysToRemove.push(key);
                }
                var that = this;
                keysToRemove.forEach(function (key) {
                    result.push(that._list._spliceFromKey(key, 1)[0]);
                });
            }
            return result;
        },

        dataSource: {
            get: function () {
                return this.MappedItems.dataSource;
            }
        }
    }, {
        supportedForProcessing: false
    }
    );


    WinJS.Namespace.define("MvvmJS.Binding", {
        MappedListProjection: MappedListProjection
    });

}());