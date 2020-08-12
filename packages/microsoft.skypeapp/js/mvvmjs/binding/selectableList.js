

(function(undefined) {
    "use strict";

    var SelectableList = MvvmJS.Class.derive(WinJS.Binding.List, function(list, options) {
        this.base(list, options);

        this._selectedItems = [];
    }, {
        _selectedItems: null,

        selectItems: function (items) {
            items.forEach(function(x) {
                this.selectItem(x);
            },this);
        },

        selectSingleItem: function(item) {
            var shouldSelect = this._selectedItems.length !== 1 || this._selectedItems.index(function (x) { return x.key === item.key; }) === -1;
            if (shouldSelect) {
                this._selectedItems.clear();
                this._selectedItems.push(item);
                this._onselectionchanged({
                    type: SelectableList.SelectionChangedType.add
                });
                this.notify("selection");
            }
        },


        selectItem: function(item) {
            var index = this._selectedItems.index(function(x) { return x.key === item.key; });
            if (index === -1) {
                this._selectedItems.push(item);
                this._onselectionchanged({
                    type: SelectableList.SelectionChangedType.add
                });
                this.notify("selection");
            }
        },

        unselectItem: function(item) {
            var index = this._selectedItems.index(function (x) { return x.key === item.key; });
            if (index != -1) {
                this._selectedItems.splice(index, 1);
                this._onselectionchanged({
                    type: SelectableList.SelectionChangedType.remove,
                    index: index
                });
                this.notify("selection");
            }
        },

        clearSelection: function() {
            this._selectedItems.clear();
            this._onselectionchanged({
                type: SelectableList.SelectionChangedType.clear
            });
            this.notify("selection");
        }
    }, {
        selection: {
            get: function () {
                return this._selectedItems.concat([]);
            }
        }

    }, {
        Events: {
            selectionchanged: "selectionchanged"
        },
        SelectionChangedType: {
            add: "add",
            remove: "remove",
            clear: "clear"
        }
    });


    SelectableList = WinJS.Class.mix(SelectableList, MvvmJS.Utilities.createEventProperties(SelectableList.Events.selectionchanged));

    WinJS.Namespace.define("MvvmJS.Binding", {
        SelectableList: SelectableList
    });

}());