//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ServiceConfig = AppMagic.Constants.Services.Config,
        RssConfigViewModel = WinJS.Class.define(function RssConfigViewModel_ctor(runtime, dataSourceOriginalNameStore, importFn) {
            this._runtime = runtime;
            this._importFn = importFn;
            this._dataSourceOriginalNameStore = dataSourceOriginalNameStore;
            this._feedUrl = ko.observable(AppMagic.AuthoringStrings.DefaultRSSFeedURL);
            this._errorMessages = ko.observableArray([])
        }, {
            _runtime: null, _importFn: null, _dataSourceOriginalNameStore: null, _feedUrl: null, _errorMessages: null, onload: function() {
                    this._loadState()
                }, reset: function() {
                    this._errorMessages.removeAll()
                }, feedUrl: {
                    get: function() {
                        return this._feedUrl()
                    }, set: function(value) {
                            this._feedUrl(value)
                        }
                }, errorMessages: {get: function() {
                        return this._errorMessages()
                    }}, isErrorVisible: {get: function() {
                        return this.errorMessages.length !== 0
                    }}, handleKeypress: function(vm, ev) {
                    return ev.key === AppMagic.Constants.Keys.enter ? (this.addDataSource(), !1) : !0
                }, _validateProperties: function() {
                    this._errorMessages.removeAll();
                    var feedUrl = this._feedUrl();
                    return feedUrl.length === 0 ? this._errorMessages.push(AppMagic.AuthoringStrings.RssErrorFeedUrlEmpty) : AppMagic.Utility.isUrl(feedUrl) || this._errorMessages.push(AppMagic.AuthoringStrings.RssErrorFeedUrlNotHttp), this._errorMessages().length === 0
                }, addDataSource: function() {
                    if (this._validateProperties()) {
                        this._saveState();
                        var feedUrl = this._feedUrl().trim(),
                            tryGetResult = this._dataSourceOriginalNameStore.tryGetGroup("rss", this._getGroupId());
                        tryGetResult.value || this._importFn({
                            type: "rssDataSource", list: [{
                                        suggestedName: "rss", configuration: {url: feedUrl}
                                    }]
                        })
                    }
                }, _loadState: function() {
                    var settings = AppMagic.Settings.instance.getValue(AppMagic.Constants.SettingsKey.RSS) || {},
                        feedUrl = settings.feedUrl || "";
                    this._feedUrl(feedUrl)
                }, _saveState: function() {
                    var settings = {feedUrl: this.feedUrl};
                    AppMagic.Settings.instance.setValue(AppMagic.Constants.SettingsKey.RSS, settings)
                }, _getGroupId: function() {
                    return AppMagic.Services.canonicalizeUrl(this.feedUrl)
                }
        }, {});
    WinJS.Class.mix(RssConfigViewModel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {RssConfigViewModel: RssConfigViewModel})
})();