//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var TableItemViewModel = WinJS.Class.define(function TableItemViewModel_ctor(tableName, isSelected) {
            this._tableName = tableName;
            this._isSelected = ko.observable(isSelected)
        }, {
            _tableName: null, _isSelected: null, tableName: {get: function() {
                        return this._tableName
                    }}, isSelected: {
                    get: function() {
                        return this._isSelected()
                    }, set: function(value) {
                            this._isSelected(value)
                        }
                }
        }),
        TableSelectorViewModel = WinJS.Class.define(function TableSelectorViewModel_ctor() {
            this._tables = ko.observableArray([])
        }, {
            _tables: null, tables: {get: function() {
                        return this._tables()
                    }}, setTables: function(tableMap) {
                    var tableItems = Object.keys(tableMap).map(function(tableName) {
                            return new TableItemViewModel(tableName, !!tableMap[tableName])
                        });
                    this._tables(tableItems)
                }, selectAllTables: function() {
                    for (var tables = this.tables, len = tables.length, i = 0; i < len; i++)
                        tables[i].isSelected = !0
                }, unselectAllTables: function() {
                    for (var tables = this.tables, len = tables.length, i = 0; i < len; i++)
                        tables[i].isSelected = !1
                }, importTables: function() {
                    this.dispatchEvent(TableSelectorViewModel.events.import, this.tables.filter(function(x) {
                        return x.isSelected
                    }).map(function(x) {
                        return x.tableName
                    }))
                }
        }, {events: {"import": "import"}}),
        SharePointTableSelectorViewModel = WinJS.Class.derive(TableSelectorViewModel, function SharePointTableSelectorViewModel_ctor() {
            TableSelectorViewModel.prototype.constructor()
        }, {reset: function() {
                this.dispatchEvent(SharePointTableSelectorViewModel.events.reset)
            }}, {events: {
                "import": "import", reset: "reset"
            }});
    WinJS.Class.mix(TableSelectorViewModel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {
        TableSelectorViewModel: TableSelectorViewModel, SharePointTableSelectorViewModel: SharePointTableSelectorViewModel
    })
})();