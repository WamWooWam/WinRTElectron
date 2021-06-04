/*  © Microsoft. All rights reserved. */
(function(global) {
"use strict";
WinJS.Namespace.define("WeatherAppJS.Configs.Cluster", {
heroOverview: function heroOverview(locId, bypassCache, isFre, isTianqi) {
var config={
clusterKey: "Cluster001", clusterTitle: PlatformJS.Services.resourceLoader.getString("Current"), hideTitle: true, isSticky: true, titleClass: "headerFontLight", clusterContent: {
contentControl: "WeatherAppJS.Controls.Clusters.HeroClusterControl", contentOptions: {
locId: locId, bypassCache: bypassCache, isFre: isFre, isTianqi: isTianqi
}
}
};
return config
}, hourlyForecast: function hourlyForecast(locId, bypassCache, isFre) {
var config={
clusterKey: "Cluster002", clusterTitle: PlatformJS.Services.resourceLoader.getString("HourlyForecast"), clusterContent: {
contentControl: "WeatherAppJS.Controls.Clusters.ClusterController", contentOptions: {
model: {
modelControl: "WeatherAppJS.Controls.Models.ClusterDataModel", modelControlConfig: {
query: WeatherAppJS.LocationsManager.getCCDataForLocationAsync, queryOptions: {
locationName: locId, bypassCache: bypassCache, isFre: isFre
}
}
}, view: WeatherAppJS.Configs.View.hourly
}
}
};
return config
}, maps: function maps(locId, bypassCache, isFre, isTianQi) {
var config={
clusterKey: "Cluster003", clusterTitle: PlatformJS.Services.resourceLoader.getString("Maps"), clusterContent: {
contentControl: "WeatherAppJS.Controls.Clusters.ClusterController", contentOptions: {
model: {
modelControl: "WeatherAppJS.Controls.Models.ClusterDataModel", modelControlConfig: {
query: WeatherAppJS.LocationsManager.getMapsDataForLocationAsync, queryOptions: {
locationName: locId, bypassCache: bypassCache, isFre: isFre, isTianQi: isTianQi
}
}
}, view: WeatherAppJS.Configs.View.maps
}
}
};
return config
}, interactiveMapsControl: function interactiveMapsControl(locId, bypassCache, isFre) {
var config={
clusterKey: "Cluster007", clusterTitle: PlatformJS.Services.resourceLoader.getString("Maps"), clusterContent: {
contentControl: "WeatherAppJS.Controls.Clusters.interactiveMapsClusterControl", contentOptions: {
locId: locId, bypassCache: bypassCache, isFre: isFre
}
}
};
return config
}, historical: function historical(locId, bypassCache, isFre) {
var config={
clusterKey: "Cluster004", clusterTitle: PlatformJS.Services.resourceLoader.getString("HistoricalWeather"), clusterContent: {
contentControl: "WeatherAppJS.Controls.Clusters.ClusterController", contentOptions: {
model: {
modelControl: "WeatherAppJS.Controls.Models.ClusterDataModel", modelControlConfig: {
query: WeatherAppJS.LocationsManager.getHWDataForLocationAsync, queryOptions: {
locationName: locId, bypassCache: bypassCache, isFre: isFre
}
}
}, view: WeatherAppJS.Configs.View.historical
}
}
};
return config
}, nearbySkiResorts: function nearbySkiResorts(locID, bypassCache) {
var config={
clusterKey: "Cluster005", clusterTitle: PlatformJS.Services.resourceLoader.getString("NearbySkiResorts"), clusterContent: {
contentControl: "WeatherAppJS.Controls.Clusters.ClusterController", contentOptions: {
hideTitleUntilRender: true, model: {
modelControl: "WeatherAppJS.Controls.Models.ClusterDataModel", modelControlConfig: {
query: WeatherAppJS.LocationsManager.getNearbySkiResortsAsync, queryOptions: {
locID: locID, bypassCache: bypassCache
}
}
}, view: WeatherAppJS.Configs.View.NearbyResorts
}
}
};
return config
}, skiResortsHero: function skiResortsHero(locId, bypassCache) {
var config={
clusterKey: "Cluster001", clusterTitle: PlatformJS.Services.resourceLoader.getString("Current"), hideTitle: true, isSticky: true, titleClass: "headerFontLight", clusterContent: {
contentControl: "WeatherAppJS.Controls.Clusters.SkiResortsHeroClusterControl", contentOptions: {
locId: locId, bypassCache: bypassCache
}
}
};
return config
}, skiOverview: function skiOverview(resortId, bypassCache) {
var config={
clusterKey: "Cluster050", clusterTitle: PlatformJS.Services.resourceLoader.getString("Overview"), clusterContent: {
contentControl: "WeatherAppJS.Controls.Clusters.ClusterController", contentOptions: {
model: {
modelControl: "WeatherAppJS.Controls.Models.ClusterDataModel", modelControlConfig: {
query: WeatherAppJS.LocationsManager.getSkiDetailsOverviewAsync, queryOptions: {
resortId: resortId, bypassCache: bypassCache
}
}
}, view: WeatherAppJS.Configs.View.skiOverview
}
}
};
return config
}, skiWebcam: function skiWebcam(resortId, bypassCache) {
var config={
clusterKey: "Cluster051", clusterTitle: PlatformJS.Services.resourceLoader.getString("CamsPanorama"), clusterContent: {
contentControl: "WeatherAppJS.Controls.Clusters.ClusterController", contentOptions: {
model: {
modelControl: "WeatherAppJS.Controls.Models.ClusterDataModel", modelControlConfig: {
query: WeatherAppJS.LocationsManager.getSkiDetailsPhotosynthPanoramasAsync, queryOptions: {
resortId: resortId, bypassCache: bypassCache
}
}
}, view: WeatherAppJS.Configs.View.skiWebcam
}
}
};
return config
}, skiDeals: function skiDeals(resortId, bypassCache) {
var config={
clusterKey: "Cluster052", clusterTitle: PlatformJS.Services.resourceLoader.getString("DealsNews"), clusterContent: {
contentControl: "WeatherAppJS.Controls.Clusters.ClusterController", contentOptions: {
model: {
modelControl: "WeatherAppJS.Controls.Models.ClusterDataModel", modelControlConfig: {
query: WeatherAppJS.LocationsManager.getSkiDetailsDealsAndNewsAsync, queryOptions: {
resortId: resortId, bypassCache: bypassCache
}
}
}, view: WeatherAppJS.Configs.View.skiDeals
}
}
};
return config
}, skiReviews: function skiReviews(resortId, bypassCache) {
var config={
clusterKey: "Cluster053", clusterTitle: PlatformJS.Services.resourceLoader.getString("Reviews"), clusterContent: {
contentControl: "WeatherAppJS.Controls.Clusters.ClusterController", contentOptions: {
model: {
modelControl: "WeatherAppJS.Controls.Models.ClusterDataModel", modelControlConfig: {
query: WeatherAppJS.LocationsManager.getSkiDetailsReviewsAsync, queryOptions: {
resortId: resortId, bypassCache: bypassCache
}
}
}, view: WeatherAppJS.Configs.View.skiReviews
}
}
};
return config
}, skiNearbySkiResorts: function skiNearbySkiResorts(resortId, bypassCache) {
var config={
clusterKey: "Cluster054", clusterTitle: PlatformJS.Services.resourceLoader.getString("NearbySkiResorts"), clusterContent: {
contentControl: "WeatherAppJS.Controls.Clusters.ClusterController", contentOptions: {
hideTitleUntilRender: true, model: {
modelControl: "WeatherAppJS.Controls.Models.ClusterDataModel", modelControlConfig: {
query: WeatherAppJS.LocationsManager.getNearbySkiResortsAsync, queryOptions: {
locID: resortId, bypassCache: bypassCache, getById: true
}
}
}, view: WeatherAppJS.Configs.View.NearbyResorts
}
}
};
return config
}, skiHourlyForecast: function skiHourlyForecast(resortId, bypassCache) {
var config={
clusterKey: "Cluster055", clusterTitle: PlatformJS.Services.resourceLoader.getString("HourlyForecast"), clusterContent: {
contentControl: "WeatherAppJS.Controls.Clusters.ClusterController", contentOptions: {
model: {
modelControl: "WeatherAppJS.Controls.Models.ClusterDataModel", modelControlConfig: {
query: WeatherAppJS.LocationsManager.getSkiDetailsHourlyDataAsync, queryOptions: {
locationName: resortId, bypassCache: bypassCache
}
}
}, view: WeatherAppJS.Configs.View.hourly
}
}
};
return config
}, chinaNewsCluster: function chinaNewsCluster(columnLimit) {
var maxcolumns=columnLimit || 3;
var clusterKey="Cluster203";
var config={
clusterKey: clusterKey, clusterTitle: PlatformJS.Services.resourceLoader.getString("News"), clusterContent: {
contentControl: "CommonJS.News.EntityCluster", contentOptions: {
mode: CommonJS.News.ClusterMode.dynamic, maxColumnCount: maxcolumns, provider: new WeatherAppJS.EntityCluster.NewsClusterProvider({clusterKey: clusterKey}), configKey: "EntityClusterDefaultFinanceSportsConfig", configObject: CommonJS.News.EntityClusterConfig.DefaultFinanceSports, theme: "weatherAppEntityCluster", onitemclick: WeatherAppJS.EntityCluster.itemClickHandler
}
}
};
return config
}, chinaVideoCluster: function chinaVideoCluster(columnLimit) {
var maxcolumns=columnLimit || 3;
var clusterKey="Cluster204";
var config={
clusterKey: clusterKey, clusterTitle: PlatformJS.Services.resourceLoader.getString("/platform/VideosClusterLabel"), clusterContent: {
contentControl: "CommonJS.News.EntityCluster", contentOptions: {
mode: CommonJS.News.ClusterMode.dynamic, maxColumnCount: maxcolumns, provider: new WeatherAppJS.EntityCluster.VideoClusterProvider({clusterKey: clusterKey}), configKey: "EntityClusterDefaultFinanceSportsConfig", configObject: CommonJS.News.EntityClusterConfig.DefaultFinanceSports, theme: "weatherAppEntityCluster"
}
}
};
return config
}, chinaHourlyForecast: function chinaHourlyForecast(locId, bypassCache, isFre) {
var config={
clusterKey: "Cluster201", clusterTitle: PlatformJS.Services.resourceLoader.getString("HourlyForecast"), clusterContent: {
contentControl: "WeatherAppJS.Controls.Clusters.ClusterController", contentOptions: {
model: {
modelControl: "WeatherAppJS.Controls.Models.ClusterDataModel", modelControlConfig: {
query: WeatherAppJS.LocationsManager.getTianQiDataForLocationAsync, queryOptions: {
locationName: locId, bypassCache: bypassCache, isFre: isFre
}
}
}, view: WeatherAppJS.Configs.View.hourlyChina
}
}
};
return config
}
});
WinJS.Namespace.define("WeatherAppJS.Configs.Model", {
overview: function overview(locId, bypassCache) {
var config={
modelControl: "WeatherAppJS.Controls.Models.ClusterDataModel", modelControlConfig: {
query: WeatherAppJS.LocationsManager.getCCDataForLocationAsync, queryOptions: {
locationName: locId, bypassCache: bypassCache
}
}
};
return config
}, alerts: function alerts(locId, bypassCache) {
var config={
modelControl: "WeatherAppJS.Controls.Models.ClusterDataModel", modelControlConfig: {
query: WeatherAppJS.LocationsManager.getAlertsDataForLocationAsync, queryOptions: {
locationName: locId, bypassCache: bypassCache
}
}
};
return config
}
});
WinJS.Namespace.define("WeatherAppJS.Configs.View", {
hourly: {
control: "WeatherAppJS.Controls.ViewBlocks.WeatherChromeView", moduleInfo: {
renderer: WeatherAppJS.Utilities.Templates.getHourlyForecastTemplate2, options: {
fragmentPath: "/html/templates.html", hourlyHeaderTemplate: "hourlyHeaderModule", hourlyRowTemplate: "hourlyModule"
}
}
}, hourlyChina: {
control: "WeatherAppJS.Controls.ViewBlocks.WeatherChromeView", moduleInfo: {
renderer: WeatherAppJS.Utilities.Templates.getHourlyForecastTemplate2, options: {
fragmentPath: "/html/templates.html", hourlyHeaderTemplate: "hourlyHeaderModule", hourlyRowTemplate: "hourlyModule", isChinaExp: true
}
}
}, maps: {
control: "WeatherAppJS.Controls.ViewBlocks.MapsItemsContainerView", moduleInfo: {
fragmentPath: "/html/mapsTemplate.html", templateId: "mapModule"
}, controlOptions: {innerListContainerClass: "platformListLayout"}
}, historical: {
control: "WeatherAppJS.Controls.ViewBlocks.WeatherChromeView", moduleInfo: {renderer: WeatherAppJS.Utilities.Templates.getHistoricalTemplate}
}, skiOverview: {
control: "WeatherAppJS.Controls.ViewControls.WeatherMultiViewControl", moduleInfo: {
fragmentPath: "/html/secondaryTemplates.html", templateId: "skiDetailsOverview"
}
}, skiOverviewTrail: {
control: "WeatherAppJS.Controls.ViewBlocks.WeatherChromeView", moduleInfo: {
fragmentPath: "/html/secondaryTemplates.html", templateId: "skiDetailsOverviewTrail"
}
}, skiOverviewIntroduction: {
control: "WeatherAppJS.Controls.ViewBlocks.WeatherChromeView", moduleInfo: {
fragmentPath: "/html/secondaryTemplates.html", templateId: "skiDetailsOverviewIntroduction"
}
}, skiOverviewElevation: {
control: "WeatherAppJS.Controls.ViewBlocks.WeatherChromeView", moduleInfo: {
fragmentPath: "/html/secondaryTemplates.html", templateId: "skiDetailsOverviewIntroduction"
}
}, skiOverviewCurrentInfo: {
control: "WeatherAppJS.Controls.ViewBlocks.WeatherChromeView", moduleInfo: {
fragmentPath: "/html/secondaryTemplates.html", templateId: "skiDetailsOverviewCurrentInfo"
}
}, skiOverviewExtraInfo: {
control: "WeatherAppJS.Controls.ViewBlocks.WeatherChromeView", moduleInfo: {
fragmentPath: "/html/secondaryTemplates.html", templateId: "extraInfoAttribution"
}, controlOptions: {innerListContainerClass: "platformListLayout"}
}, skiWebcam: {
control: "WeatherAppJS.Controls.ViewBlocks.SkiSlideshowContainerView", moduleInfo: {
fragmentPath: "/html/secondaryTemplates.html", templateId: "skiDetailsSlideShow"
}, controlOptions: {innerListContainerClass: "platformListLayout"}
}, skiDeals: {
control: "WeatherAppJS.Controls.ViewBlocks.SkiDealsContainerView", moduleInfo: {
fragmentPath: "/html/secondaryTemplates.html", templateId: "skiDetailsDeals"
}, controlOptions: {innerListContainerClass: "platformListLayout"}
}, skiReviews: {
control: "WeatherAppJS.Controls.ViewBlocks.SkiReviewContainerView", moduleInfo: {
fragmentPath: "/html/secondaryTemplates.html", templateId: "skiDetailsReviewsChart"
}, controlOptions: {innerListContainerClass: "platformListLayout skiReviewDetailsList"}
}, NearbyResorts: {
control: "WeatherAppJS.Controls.ViewBlocks.NearbyResortsContainerView", moduleInfo: {
fragmentPath: "/html/delayedTemplate.html", templateId: "NearbyResortsTemplate"
}, controlOptions: {innerListContainerClass: "platformListLayout"}
}, photosynthPanoramas: {
control: "WeatherAppJS.Controls.ViewBlocks.PhotosynthContainerView", moduleInfo: {
fragmentPath: "/html/secondaryTemplates.html", templateId: "photosynthItemTemplate"
}, controlOptions: {innerListContainerClass: "platformListLayout"}
}
})
})(WinJS)