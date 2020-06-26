//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var DataCollectionsViewModel = WinJS.Class.derive(AppMagic.Utility.Disposable, function DataCollectionsViewModel_ctor(doc, rt) {
            AppMagic.Utility.Disposable.call(this);
            this._document = doc;
            this._runtime = rt;
            this.track("_dataViewerViewModel", new AppMagic.AuthoringTool.ObjectViewer.DataViewerViewModel);
            this._collectionOptions = ko.observable({
                collections: [], selected: -1
            })
        }, {
            _document: null, _dataViewerViewModel: null, _collectionOptions: null, collectionOptions: {get: function() {
                        return this._collectionOptions()
                    }}, dataViewerViewModel: {get: function() {
                        return this._dataViewerViewModel
                    }}, onClickCollectionSelector: function() {
                    this.dispatchEvent(DataCollectionsViewModel.events.clickcollectionselector)
                }, reload: function() {
                    for (var collections = [], dataSources = this._document.dataSources.first(); dataSources.hasCurrent; dataSources.moveNext()) {
                        var ds = dataSources.current;
                        ds.kind === Microsoft.AppMagic.Authoring.DataSourceKind.collection && collections.push(ds.name)
                    }
                    var lastUsedIndex = 0,
                        selected = this._collectionOptions().selected;
                    if (selected >= 0) {
                        var lastUsed = this._collectionOptions().collections[selected],
                            index = collections.indexOf(lastUsed);
                        index >= 0 && (lastUsedIndex = index)
                    }
                    this._collectionOptions().collections = collections;
                    collections.length === 0 && (this._collectionOptions().selected = -1);
                    this._collectionOptions.valueHasMutated();
                    collections.length > 0 ? this.setCollectionData(lastUsedIndex) : this._dataViewerViewModel.clearData();
                    this._dataViewerViewModel.notifyShow()
                }, onClickCollectionOption: function(collectionOptionIndex) {
                    var lastSelectedIndex = this._collectionOptions().selected;
                    lastSelectedIndex >= 0 && lastSelectedIndex !== collectionOptionIndex ? this.dispatchEvent(DataCollectionsViewModel.events.collectionoptionclicked, {collectionOptionIndex: collectionOptionIndex}) : this.setCollectionData(collectionOptionIndex)
                }, setCollectionData: function(collectionOptionIndex) {
                    this._collectionOptions().selected = collectionOptionIndex;
                    this._collectionOptions.valueHasMutated();
                    var collectionName = this._collectionOptions().collections[collectionOptionIndex],
                        ds = this._document.getCollectionDataSource(collectionName);
                    var columnsAndTypes = ds.type.getColumnsAndTypes(),
                        propertiesSchema = AppMagic.Utility.getSchemaArrayFromType(columnsAndTypes),
                        schema = AppMagic.Schema.createSchemaForArrayFromPointer(propertiesSchema);
                    this._runtime.getData(collectionName).then(function(data) {
                        this._dataViewerViewModel.setData(collectionName, data, schema, !1)
                    }.bind(this))
                }, onClickDepthLevel: function(depth) {
                    if (depth !== this._dataViewerViewModel.viewers.length - 1)
                        this._dataViewerViewModel.onClickDepthLevel(depth)
                }, notifyClickBack: function() {
                    return this._dataViewerViewModel.clearData(), !0
                }
        }, {events: {
                clickcollectionselector: "clickcollectionselector", collectionoptionclicked: "collectionoptionclicked"
            }});
    WinJS.Class.mix(DataCollectionsViewModel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {DataCollectionsViewModel: DataCollectionsViewModel})
})();