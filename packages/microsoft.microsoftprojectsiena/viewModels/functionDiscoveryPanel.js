//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var Util = AppMagic.Utility,
        FunctionDiscoveryPanel = WinJS.Class.derive(AppMagic.Utility.Disposable, function FunctionDiscoveryPanel_ctor(intellisense, categoryId) {
            this._intellisense = intellisense;
            this._categoryId = categoryId;
            AppMagic.Utility.Disposable.call(this);
            this._categories = functionCategoryProvider.getCategories(intellisense);
            this._categoriesVisible = ko.observable(!1);
            this._selectedCategory = ko.observable(null);
            this._selectedCategoryFns = ko.observableArray();
            this._selectedFn = ko.observable(null);
            this.trackAnonymous(this._selectedCategory.subscribe(function(newValue) {
                this.refreshFunctions()
            }, this));
            this._selectedCategory(this._categories[0])
        }, {
            _categories: null, _categoriesVisible: null, _categoryId: null, _intellisense: null, _selectedCategory: null, _selectedCategoryFns: null, _selectedFn: null, _handleListArrowDownUpKey: function(key, list, selectedItem) {
                    var len = list.length,
                        index = list.indexOf(selectedItem());
                    switch (key) {
                        case AppMagic.Constants.Keys.down:
                            index < len - 1 && index++;
                            break;
                        case AppMagic.Constants.Keys.up:
                            index > 0 && index--;
                            break;
                        default:
                            break
                    }
                    selectedItem(list[index])
                }, categories: {get: function() {
                        return this._categories
                    }}, categoriesVisible: {
                    get: function() {
                        return this._categoriesVisible()
                    }, set: function(value) {
                            this._categoriesVisible(value)
                        }
                }, handleCategoryArrowClick: function() {
                    this._categoriesVisible(!this._categoriesVisible())
                }, handleCategoryClick: function(data) {
                    this._selectedCategory(data);
                    this._categoriesVisible(!1)
                }, handleCategoryContainerKeyDown: function(data, evt) {
                    return evt.key === AppMagic.Constants.Keys.down ? (this.handleCategoryArrowClick(), !1) : !0
                }, handleCategoryKeyDown: function(data, evt) {
                    switch (evt.key) {
                        case AppMagic.Constants.Keys.down:
                        case AppMagic.Constants.Keys.up:
                            this._handleListArrowDownUpKey(evt.key, this._categories, this._selectedCategory);
                            evt.stopPropagation();
                            break;
                        case AppMagic.Constants.Keys.enter:
                        case AppMagic.Constants.Keys.tab:
                            this._categoriesVisible(!1);
                            break
                    }
                }, handleFnClick: function(data) {
                    this._selectedFn(data)
                }, handleFnArrowDownUpKey: function(key) {
                    this._handleListArrowDownUpKey(key, this._selectedCategoryFns(), this._selectedFn)
                }, handleHelpClick: function() {
                    var helpLink = this._selectedFn().helpLink;
                    var url = new Platform.Foundation.Uri(helpLink);
                    Platform.System.Launcher.launchUriAsync(url)
                }, refreshFunctions: function() {
                    var selectedCategoryFnEnumarable = this._intellisense.getFunctionsForCategory(this._selectedCategory().key, this._categoryId),
                        selectedCategoryFns = Util.enumerableToArray(selectedCategoryFnEnumarable),
                        sortedSelectedCategoryFns = selectedCategoryFns.sort(function(a, b) {
                            return a.name.localeCompare(b.name)
                        });
                    this._selectedCategoryFns(sortedSelectedCategoryFns);
                    this._selectedCategoryFns().length > 0 ? this._selectedFn(this._selectedCategoryFns()[0]) : this._selectedFn({
                        name: "", description: "", helpLink: ""
                    })
                }, selectedCategory: {get: function() {
                        return this._selectedCategory()
                    }}, selectedCategoryFunctions: {get: function() {
                        return this._selectedCategoryFns()
                    }}, selectedFunction: {get: function() {
                        return this._selectedFn()
                    }}
        }, {}),
        FunctionCategoryProvider = WinJS.Class.define(function() {
            this._provider = new Microsoft.AppMagic.Authoring.FunctionCategoryProvider
        }, {
            _categories: null, _provider: null, getCategories: function() {
                    if (!this._categories) {
                        var categoriesEnumerable = this._provider.getFunctionCategories();
                        this._categories = Util.enumerableToArray(categoriesEnumerable)
                    }
                    return this._categories
                }
        }),
        functionCategoryProvider = new FunctionCategoryProvider;
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {FunctionDiscoveryPanel: FunctionDiscoveryPanel})
})(Windows);