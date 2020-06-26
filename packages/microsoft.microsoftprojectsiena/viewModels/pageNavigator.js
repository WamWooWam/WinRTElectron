//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var PageNavigator = WinJS.Class.derive(AppMagic.Utility.Disposable, function PageNavigator_ctor() {
            this._activePage = ko.observable(null);
            this._pageStack = ko.observableArray();
            this._activePage.subscribe(function(page) {
                typeof page.activate != "undefined" && page.activate(this._pageData)
            }, this);
            AppMagic.Utility.Disposable.call(this);
            this.track("_eventTracker", new AppMagic.Utility.EventTracker)
        }, {
            _activePage: null, _pageStack: null, _pageData: null, animateAddPage: function(element) {
                    element.nodeType === Node.ELEMENT_NODE && (element.style["z-index"] = 0, WinJS.UI.Animation.fadeIn(element))
                }, animateRemovePage: function(element) {
                    element.nodeType === Node.ELEMENT_NODE && (element.style["z-index"] = 1, WinJS.UI.Animation.fadeOut(element).then(function() {
                        element.parentNode.removeChild(element)
                    }))
                }, navigate: function(page, data) {
                    this.push(page);
                    this.navigateTop(data)
                }, navigateBack: function(data) {
                    this._pageStack().length > 1 && (this._pageStack.shift(), this.navigateTop(data))
                }, navigateTop: function(data) {
                    typeof data == "undefined" && (data = null);
                    var page = this._pageStack()[0];
                    this._pageData = data;
                    this._activePage(page)
                }, push: function(page) {
                    this._eventTracker.add(page, "hideflyout", function() {
                        this.dispatchEvent("hideflyout")
                    }, this);
                    this._pageStack.unshift(page)
                }, canGoBack: {get: function() {
                        return this._pageStack().length > 1
                    }}, activePage: {get: function() {
                        return this._activePage()
                    }}, pageNames: {get: function() {
                        return this._pageStack().map(function(page) {
                                return page.pageName
                            }).join(", ")
                    }}
        }, {});
    WinJS.Class.mix(PageNavigator, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {PageNavigator: PageNavigator})
})();