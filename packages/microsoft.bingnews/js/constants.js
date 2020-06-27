/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS", {
        Constants: WinJS.Class.define(function () { }, {}, {
            appCacheDirectory: "appCache", _todayDataProviderCacheFile: "todayDataProvider.json", _sourcesGalleryProviderCacheFileTemplate: "sourcesGalleryProvider_{0}.json", getTodayDataProviderCacheFilePath: function getTodayDataProviderCacheFilePath() {
                return NewsJS.Constants.appCacheDirectory + "\\" + NewsJS.Constants._todayDataProviderCacheFile
            }, getSourcesGalleryProviderCacheFilePath: function getSourcesGalleryProviderCacheFilePath(market) {
                return NewsJS.Constants.appCacheDirectory + "\\" + NewsJS.Constants._sourcesGalleryProviderCacheFileTemplate.format(market)
            }
        })
    })
})()