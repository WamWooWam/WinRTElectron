/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function appexPlatformAds_ConfigInit() {
"use strict";
function _isTempCluster(bindingList, position) {
var cluster=_getClusterAt(bindingList, position);
return cluster && cluster.isTempCluster === true
}
function _isLastCluster(bindingList, position) {
var cluster=_getClusterAt(bindingList, position);
return cluster && cluster.isLastCluster === true
}
function _getClusterAt(bindingList, position) {
var cluster=null;
if (bindingList.getAt) {
cluster = bindingList.getAt(position)
}
else {
cluster = bindingList[position]
}
return cluster
}
function _isAdCluster(bindingList, position) {
var cluster=_getClusterAt(bindingList, position);
if (cluster && cluster.clusterContent && (cluster.clusterContent.contentControl === "PlatformJS.Ads.AdsWrapperControl" || cluster.clusterContent.contentControl === "PlatformJS.Ads.DelayedAdsWrapperControl")) {
return true
}
return false
}
function _skipTempClusters(bindingList, position) {
var numTempClusters=0;
for (var index=0; index <= position; index++) {
if (_isTempCluster(bindingList, index) || _isAdCluster(bindingList, index)) {
numTempClusters++
}
}
position = position + numTempClusters;
return position
}
;
function _removeExistingAdClusterConfigs(bindingList) {
var totalClusters=bindingList.length;
for (var clusterIndex=0; clusterIndex < totalClusters; clusterIndex++) {
if (_isAdCluster(bindingList, clusterIndex)) {
bindingList.splice(clusterIndex, 1);
totalClusters--;
clusterIndex--
}
}
}
function _setOtherAdOptionsToAdsCluster(cluster, tagList) {
if (!cluster) {
return
}
var clusterContent=cluster.clusterContent;
if (!clusterContent) {
return
}
if (!(clusterContent.contentOptions && tagList && tagList.length)) {
return
}
var clusterContentOptions=clusterContent.contentOptions;
var otherAdOptions=clusterContentOptions.otherAdOptions;
if (!otherAdOptions) {
clusterContentOptions.otherAdOptions = otherAdOptions = {}
}
otherAdOptions.adTags = ADSNS.mergeAdTags(otherAdOptions.adTags, tagList)
}
function _computeAdClusterIndices(bindingList, overrideKey) {
var panoIntervals=ADSNS.Config.instance.adManager.getPanoFrequency(overrideKey);
var clusterIndex=0;
var totalClusters=bindingList.length;
var indices=[];
var nextInsertPosition=panoIntervals.start;
if (nextInsertPosition <= 0 || totalClusters < 1) {
return indices
}
var repeatInterval=panoIntervals.repeat;
var skipCount=0;
for (clusterIndex = 0; clusterIndex < totalClusters; clusterIndex++) {
if (_isTempCluster(bindingList, clusterIndex)) {
skipCount++
}
if ((clusterIndex - skipCount) === nextInsertPosition) {
indices.push(clusterIndex);
if (repeatInterval > 0) {
nextInsertPosition += repeatInterval
}
else {
nextInsertPosition = totalClusters + 1;
break
}
}
}
if (indices.length > 0) {
if ((clusterIndex - skipCount) === nextInsertPosition && !_isLastCluster(bindingList, clusterIndex - 1)) {
indices.push(clusterIndex)
}
}
else {
if (_isLastCluster(bindingList, clusterIndex - 1)) {
indices.push(clusterIndex - 1)
}
else {
indices.push(clusterIndex)
}
}
return indices
}
var AdsConfigBootCacheKey="Ads2";
var AdSettingsRetrievalDelayInMS=500;
var ADSNS=WinJS.Namespace.define("PlatformJS.Ads", {
Config: WinJS.Class.define(function adsConfig_ctor() {
msWriteProfilerMark("AdsConfig:ctor:s");
var that=this;
this._initFromBootCache();
this._adManager = new ADSNS.AdSettingsManager;
this._getPlatformInitializedPromise().then(function loadAdConfigFromCI() {
that._initFromConfig();
return WinJS.Promise.timeout(AdSettingsRetrievalDelayInMS).then(function loadCMSSettings() {
return that._adManager.loadSettingsFromCMS()
})
}).done(null, function errorHandler(){});
msWriteProfilerMark("AdsConfig:ctor:e")
}, {
_enableAdLabel: false, _adManager: null, applicationId: null, adManager: {get: function get() {
return this._adManager
}}, enableAdLabel: {get: function get() {
return this._enableAdLabel
}}, _initFromBootCache: function _initFromBootCache() {
msWriteProfilerMark("AdsConfig:_initFromBootCache:s");
var cachedConfig=PlatformJS.BootCache.instance.getEntry(AdsConfigBootCacheKey);
if (cachedConfig) {
this.applicationId = cachedConfig.ApplicationID || null;
var adSettings=cachedConfig.AdSettings;
if (adSettings) {
this._enableAdLabel = adSettings.EnableAdLabel
}
}
msWriteProfilerMark("AdsConfig:_initFromBootCache:e")
}, _saveInitToBootCache: function _saveInitToBootCache(adsConfig) {
var cachedConfig={};
cachedConfig.ApplicationID = adsConfig.getString("ApplicationID", "") || null;
var adSettings=adsConfig.getDictionary("AdSettings");
if (adSettings) {
var settings={};
settings.EnableAdLabel = adSettings.getBool("EnableAdLabel", false);
cachedConfig.AdSettings = settings
}
PlatformJS.BootCache.instance.addOrUpdateEntry(AdsConfigBootCacheKey, cachedConfig)
}, _getPlatformInitializedPromise: function _getPlatformInitializedPromise() {
if (PlatformJS && PlatformJS.platformInitializedPromise) {
return PlatformJS.platformInitializedPromise
}
return WinJS.Promise.timeout(1000).then(this._getPlatformInitializedPromise.bind(this))
}, _initFromConfig: function _initFromConfig() {
var adsConfig=PlatformJS.Services.configuration.getDictionary("Ads2");
if (adsConfig) {
this.applicationId = adsConfig.getString("ApplicationID", "");
var adSettings=adsConfig.getDictionary("AdSettings");
if (adSettings) {
this._enableAdLabel = adSettings.getBool("EnableAdLabel", false)
}
this._saveInitToBootCache(adsConfig)
}
}
}, {
_instance: null, instance: {get: function get() {
if (!ADSNS.Config._instance) {
ADSNS.Config._instance = new ADSNS.Config
}
return ADSNS.Config._instance
}}, clearAdsConfig: function clearAdsConfig() {
ADSNS.Config._instance = null
}, adVisible: function adVisible() {
if (!ADSNS.Config.instance.applicationId) {
return false
}
if (!PlatformJS.Utilities.hasInternetConnection()) {
return false
}
if (PlatformJS.Utilities.isHighCostConnection()) {
return false
}
return true
}
}), addOrderedAdsClusterConfig: function addOrderedAdsClusterConfig(bindingList, clusterConfig, category, subcategory, providerId, overrideKey) {
msWriteProfilerMark("AdsConfig:addOrderedAdsClusterConfig:s");
if (!bindingList) {
msWriteProfilerMark("AdsConfig:addOrderedAdsClusterConfig:e");
return
}
if (typeof category !== "string") {
debugger;
category = ""
}
if (typeof providerId !== "string") {
providerId = ADSNS.defaultProviderID
}
_removeExistingAdClusterConfigs(bindingList);
var indices=_computeAdClusterIndices(bindingList, overrideKey);
for (var index=indices.length - 1; index >= 0; index--) {
var clusterIndex=indices[index];
var adCluster=ADSNS.getAdsClusterConfig(clusterConfig, clusterIndex, category, subcategory, providerId);
if (adCluster) {
bindingList.splice(clusterIndex, 0, adCluster);
if (clusterConfig) {
clusterConfig = JSON.parse(JSON.stringify(clusterConfig))
}
}
}
ADSNS.updateEntityClusters(bindingList, overrideKey);
if (clusterConfig) {
clusterConfig = null
}
msWriteProfilerMark("AdsConfig:addOrderedAdsClusterConfig:e")
}, updateEntityClusters: function updateEntityClusters(bindingList, overrideKey) {
msWriteProfilerMark("AdsConfig:updateEntityClusters:s");
var ecIntervals=ADSNS.Config.instance.adManager.getClusterFrequency(overrideKey);
var currentECIndex=0;
var nextECAdIndex=ecIntervals.start;
var repeatECAdInterval=ecIntervals.repeat;
var totalClusters=bindingList.length;
for (var clusterIndex=0; clusterIndex < totalClusters; clusterIndex++) {
var currentCluster=_getClusterAt(bindingList, clusterIndex);
if (currentCluster) {
if (currentCluster.isEntityCluster === true) {
currentECIndex++;
var clusterContent=currentCluster.clusterContent;
if (!clusterContent) {
currentCluster.clusterContent = clusterContent = {}
}
var contentOptions=clusterContent.contentOptions;
if (!contentOptions) {
clusterContent.contentOptions = contentOptions = {}
}
if (currentECIndex === nextECAdIndex) {
contentOptions.showInClusterAd = true;
nextECAdIndex += repeatECAdInterval
}
else {
contentOptions.showInClusterAd = false
}
}
}
}
msWriteProfilerMark("AdsConfig:updateEntityClusters:e")
}, getOrderedAdsClusters: function getOrderedAdsClusters(clusterConfig, channelId) {
debugger
}, addAdsClusterConfig: function addAdsClusterConfig(bindingList, clusterConfig, category, subcategory, providerId, overrideKey) {
msWriteProfilerMark("AdsConfig:addAdsClusterConfig:s");
if (!bindingList) {
msWriteProfilerMark("AdsConfig:addAdsClusterConfig:e");
return
}
if (typeof category !== "string") {
debugger;
category = ""
}
if (typeof providerId !== "string") {
debugger;
providerId = ADSNS.defaultProviderID
}
_removeExistingAdClusterConfigs(bindingList);
var indices=_computeAdClusterIndices(bindingList, overrideKey);
for (var index=0, len=indices.length; index < len; index++) {
var adCluster=ADSNS.getAdsClusterConfig(clusterConfig, indices[index], category, subcategory, providerId);
if (adCluster) {
bindingList.push(adCluster);
if (clusterConfig) {
clusterConfig = JSON.parse(JSON.stringify(clusterConfig))
}
}
}
ADSNS.updateEntityClusters(bindingList, overrideKey);
if (clusterConfig) {
clusterConfig = null
}
msWriteProfilerMark("AdsConfig:addAdsClusterConfig:e")
}, getAdjustedAdClusterPosition: function getAdjustedAdClusterPosition(bindingList, currentClusterPosition) {
if (!bindingList || !currentClusterPosition) {
return
}
var clusterPosition=bindingList.length;
if (currentClusterPosition && currentClusterPosition < bindingList.length) {
clusterPosition = _skipTempClusters(bindingList, currentClusterPosition)
}
if (clusterPosition >= bindingList.length) {
clusterPosition = bindingList.length;
var lastCluster=_getClusterAt(bindingList, clusterPosition - 1);
if (lastCluster && lastCluster.isLastCluster === true) {
clusterPosition = null
}
}
return clusterPosition
}, setAdConfig: function setAdConfig(ads, pageId) {
debugger
}, getCMSConfig: function getCMSConfig(category, subcategory, width, height, providerId) {
msWriteProfilerMark("AdsConfig:getCMSConfig:s");
if (typeof category !== "string") {
debugger;
category = ""
}
if (typeof providerId !== "string") {
debugger;
providerId = ADSNS.defaultProviderID
}
var result=ADSNS.Config.instance.adManager.getAdConfig(category, subcategory, width, height, providerId);
msWriteProfilerMark("AdsConfig:getCMSConfig:e");
return result
}, getEntityClusterConfig: function getEntityClusterConfig(category, subcategory, providerId) {
if (!category) {
debugger;
category = ""
}
if (typeof providerId !== "string") {
providerId = ADSNS.defaultProviderID
}
var adConfigs=ADSNS.getCMSConfig(category, subcategory, ADSNS.AdSettingsManager.tileAdWidth, ADSNS.AdSettingsManager.tileAdHeight, providerId);
return adConfigs && adConfigs.length && adConfigs[0]
}, getArticleReaderAdConfig: function getArticleReaderAdConfig(category, subcategory, providerId, overrideKey) {
if (typeof category !== "string") {
debugger;
category = ""
}
if (typeof providerId !== "string") {
providerId = ADSNS.defaultProviderID
}
var adManager=ADSNS.Config.instance.adManager;
var articleReaderAdFrequency=adManager.getArticleFrequency(overrideKey);
return articleReaderAdFrequency.start > 0 && adManager.getArticleReaderAdConfigs(category, subcategory, providerId)
}, getVideoAdsConfig: function getVideoAdsConfig(category, subcategory, providerId, overrideKey) {
if (typeof category !== "string") {
category = ""
}
if (typeof providerId !== "string") {
providerId = ADSNS.defaultProviderID
}
var videoAdFrequency=ADSNS.Config.instance.adManager.getVideoFrequency(overrideKey);
var adConfigs=ADSNS.getCMSConfig(category, subcategory, ADSNS.AdSettingsManager.videoAdWidth, ADSNS.AdSettingsManager.videoAdHeight, providerId);
var adConfig=adConfigs && adConfigs[0];
var start=videoAdFrequency.start;
var repeat=videoAdFrequency.repeat;
if (typeof repeat !== "number" || repeat < 0) {
repeat = 0
}
if (typeof start === "number") {
if (start === 0 && repeat > 0) {
start = 1
}
start--
}
else {
start = -1
}
if (adConfig) {
return {
adUnitId: adConfig.adUnitId, appID: ADSNS.Config.instance.applicationId, adStartFrequency: start, adRepeatFrequency: repeat, adProvider: providerId, adServer: "mmppf"
}
}
return null
}, getClusterAdsConfig: function getClusterAdsConfig() {
debugger
}, getAdsConfig: function getAdsConfig(category, subcategory, providerId) {
msWriteProfilerMark("AdsConfig:getAdsConfig:s");
if (typeof category !== "string") {
category = ""
}
if (typeof providerId !== "string") {
providerId = ADSNS.defaultProviderID
}
var result=null;
if (ADSNS.Config.adVisible()) {
var adConfigs=ADSNS.getCMSConfig(category, subcategory, ADSNS.AdSettingsManager.thinAdWidth, ADSNS.AdSettingsManager.thinAdHeight, providerId);
result = adConfigs && adConfigs.length && adConfigs[0]
}
msWriteProfilerMark("AdsConfig:getAdsConfig:e");
return result
}, getAdsClusterConfig: function getAdsClusterConfig(clusterConfig, clusterPosition, category, subcategory, providerId) {
msWriteProfilerMark("AdsConfig:getAdsClusterConfig:s");
if (typeof clusterPosition !== "number" || clusterPosition < 1) {
debugger
}
if (typeof category !== "string") {
debugger;
category = ""
}
if (typeof providerId !== "string") {
debugger;
providerId = ADSNS.defaultProviderID
}
var adConfig=ADSNS.getAdsConfig(category, subcategory, providerId);
if (!adConfig) {
msWriteProfilerMark("AdsConfig:getAdsClusterConfig:e");
return null
}
if (!clusterConfig) {
clusterConfig = {}
}
clusterConfig.clusterContent = {
contentControl: "PlatformJS.Ads.AdsWrapperControl", contentOptions: {
className: adConfig.adType, otherAdOptions: clusterConfig.otherAdOptions, adUnitId: adConfig.adUnitId
}
};
if (adConfig.adTags) {
_setOtherAdOptionsToAdsCluster(clusterConfig, adConfig.adTags)
}
clusterConfig.clusterPosition = clusterPosition;
clusterConfig.clusterIndex = clusterPosition;
clusterConfig.supressTitleInHeader = true;
var clusterKey="AdsCluster_";
clusterKey += adConfig.adUniqueKey ? adConfig.adUniqueKey + "_" : "";
clusterKey += clusterPosition || 0;
clusterConfig.clusterKey = clusterKey;
if (!clusterConfig.clusterTitle) {
clusterConfig.clusterTitle = PlatformJS.Services.resourceLoader.getString("/platform/advertisement")
}
clusterConfig.platformInvisibleCluster = true;
msWriteProfilerMark("AdsConfig:getAdsClusterConfig:e");
return clusterConfig
}, mergeAdTags: function mergeAdTags(targetTagList, additionalTagList) {
if (!additionalTagList || !additionalTagList.length) {
return
}
if (!targetTagList) {
targetTagList = []
}
if (!Array.isArray(targetTagList)) {
debugger;
targetTagList = []
}
for (var additionalIndex=0, alen=additionalTagList.length; additionalIndex < alen; additionalIndex++) {
var additionalTag=additionalTagList[additionalIndex];
var additionalTagKey=additionalTag.key;
if (additionalTagKey) {
var foundMatchingKey=false;
for (var targetIndex=0, tlen=targetTagList.length; targetIndex < tlen; targetIndex++) {
var targetTag=targetTagList[targetIndex];
if (targetTag && targetTag.key === additionalTagKey) {
foundMatchingKey = true
}
}
if (!foundMatchingKey) {
targetTagList.push(additionalTag)
}
}
}
return targetTagList
}, defaultProviderID: {get: function get() {
return "AAPDEK"
}}
})
})();
(function appexPlatformAds_AdSettingsManagerInit() {
"use strict";
var AdSettingsBootCacheKey="AdSettings";
var adSettingsPlatform="windows";
var adSettingsColumns=2;
var defaultAdRefreshRate=120;
var logLevel=PlatformJS.Telemetry.logLevel.Normal;
var deferredTelemetryPromise=new WinJS.Promise(function deferredTelemetryReady(complete) {
PlatformJS.deferredTelemetry(function setupTelemetry() {
complete(Microsoft.Bing.AppEx.Telemetry.FlightRecorder)
})
});
function logAdError(errorMessage) {
deferredTelemetryPromise.then(function logAdError(telemetry) {
if (errorMessage) {
telemetry.logContentError(logLevel, "", errorMessage, 0, "", null)
}
})
}
function logAdResolutionError(errorMessage, category, subcategory, width, height) {
deferredTelemetryPromise.then(function logAdResolutionError(telemetry) {
if (errorMessage) {
var data={
c: category, s: subcategory, w: width, h: height
};
telemetry.logContentErrorWithJsonAttributes(logLevel, "", errorMessage, 0, "", null, JSON.stringify(data))
}
})
}
function getAdUnitIdFromIdArray(idArray) {
if (Array.isArray(idArray)) {
for (var idIndex in idArray) {
var idItem=idArray[idIndex];
if (idItem) {
var idItemKey=idItem.key;
if (typeof idItemKey === "string" && idItemKey.toLowerCase() === adSettingsPlatform) {
return idItem.value
}
}
}
}
}
function getMatchingAdItems(adItems, width, height) {
var result=[];
if (Array.isArray(adItems)) {
for (var index in adItems) {
var adItem=adItems[index];
if (typeof width !== "number" && typeof height !== "number") {
result.push(adItem)
}
else {
if (adItem.width === width && adItem.height === height) {
result.push(adItem)
}
}
}
}
return result
}
function generateAdConfig(adItem, providerId) {
var width=adItem.width;
var height=adItem.height;
var adSettingsStatic=ADSNS.AdSettingsManager;
var adType=null;
var type=adSettingsStatic.emptyAdType;
if (width === adSettingsStatic.tileAdWidth && height === adSettingsStatic.tileAdHeight) {
adType = adSettingsStatic.tileAdClass;
type = adSettingsStatic.tileAdType
}
else if (width === adSettingsStatic.thinAdWidth && height === adSettingsStatic.thinAdHeight) {
adType = adSettingsStatic.thinAdClass;
type = adSettingsStatic.thinAdType
}
else if (width === adSettingsStatic.emptyAdWidth && height === adSettingsStatic.emptyAdHeight) {
type = adSettingsStatic.emptyAdType
}
else if (width === adSettingsStatic.videoAdWidth && height === adSettingsStatic.videoAdHeight) {
type = adSettingsStatic.videoAdType
}
var tags=[];
if (providerId) {
tags.push({
key: "PROVIDERID", value: providerId
})
}
else {
debugger
}
return {
type: type, adType: adType, adUnitId: adItem.adUnitId, adTags: tags, adUniqueKey: adItem.uniqueKey
}
}
function getProviderIdFromProviderHref(providerHref) {
if (typeof providerHref === "string") {
var index=providerHref.lastIndexOf("/");
if (index >= 0) {
return providerHref.substr(index + 1)
}
}
return ""
}
function generateAdConfigsFromAdItems(adItems, providerId) {
var adConfigs=[];
if (!Array.isArray(adItems)) {
return adConfigs
}
for (var index in adItems) {
var adItem=adItems[index];
var adConfig=generateAdConfig(adItem, providerId);
if (adConfig) {
adConfigs.push(adConfig)
}
}
return adConfigs
}
var ADSNS=WinJS.Namespace.define("PlatformJS.Ads", {AdSettingsManager: WinJS.Class.define(function adSettingsManager_ctor() {
msWriteProfilerMark("AdSettingsManager:ctor:s");
this._loadOfflineSettings();
msWriteProfilerMark("AdSettingsManager:ctor:e")
}, {
_appGlobalConfig: null, _appDefaultLayoutConfig: null, _appLayoutConfig: null, _adItems: null, _defaultAdItems: null, _exclusionAdItems: null, _enableAds: true, enableAds: {get: function get() {
return this._enableAds
}}, _configReadyPromise: null, _parseAppConfiguration: function _parseAppConfiguration(appConfig) {
msWriteProfilerMark("AdSettingsManager:_parseAppConfiguration:s");
if (!appConfig) {
logAdError("adAppConfiguration is missing from AdSettings");
msWriteProfilerMark("AdSettingsManager:_parseAppConfiguration:e");
return
}
this._appGlobalConfig = appConfig.global;
var layoutConfig=appConfig[adSettingsPlatform];
var newLayoutConfig={};
if (Array.isArray(layoutConfig)) {
for (var index in layoutConfig) {
var config=layoutConfig[index];
var columns=config.columns;
if (columns === adSettingsColumns) {
var layoutType=config.layout;
layoutType = (typeof layoutType === "string") ? layoutType.toLowerCase() : "";
if (layoutType === "default" || layoutType === "") {
this._appDefaultLayoutConfig = config;
if (typeof config.adsEnabled === "boolean") {
this._enableAds = config.adsEnabled
}
}
else {
newLayoutConfig[layoutType] = config
}
}
}
}
this._appLayoutConfig = newLayoutConfig;
msWriteProfilerMark("AdSettingsManager:_parseAppConfiguration:e")
}, _parseAdItems: function _parseAdItems(adItems) {
msWriteProfilerMark("AdSettingsManager:_parseAdItems:s");
if (!adItems) {
logAdError("adItems is missing from AdSettings");
msWriteProfilerMark("AdSettingsManager:_parseAdItems:e");
return
}
this._exclusionAdItems = [];
var newAdItems={};
var newDefaultAdItems=[];
if (Array.isArray(adItems)) {
for (var index in adItems) {
var adItem=adItems[index];
var id=adItem.id;
var adUnitId=getAdUnitIdFromIdArray(id);
if (adUnitId) {
var category=adItem.category;
var subcategory=adItem.subcategory;
category = typeof category === "string" ? category.toLowerCase() : (category ? category : "");
subcategory = typeof subcategory === "string" ? subcategory.toLowerCase() : (subcategory ? subcategory : "");
var newAdItem={
width: adItem.width, height: adItem.height, uniqueKey: adItem.uniqueid, adUnitId: adUnitId
};
if (category === "") {
if (subcategory === "") {
newDefaultAdItems.push(newAdItem);
this._parseExclusionAdItems(adItem)
}
else {
logAdError("unexpected adItem from AdSettings - default category with custom subcategory " + subcategory)
}
}
else {
var newCategoryAdItems=newAdItems[category];
if (!newCategoryAdItems) {
newCategoryAdItems = {};
newAdItems[category] = newCategoryAdItems
}
var newSubcategoryAdItems=newCategoryAdItems[subcategory];
if (!newSubcategoryAdItems) {
newSubcategoryAdItems = [];
newCategoryAdItems[subcategory] = newSubcategoryAdItems
}
newSubcategoryAdItems.push(newAdItem)
}
}
}
}
this._adItems = newAdItems;
this._defaultAdItems = newDefaultAdItems;
msWriteProfilerMark("AdSettingsManager:_parseAdItems:e")
}, _parseExclusionAdItems: function _parseExclusionAdItems(adItem) {
if (!adItem.providerBasedIds) {
return
}
var exclusionAdItem={
width: adItem.width, height: adItem.height, uniqueKey: adItem.uniqueid, adUnits: {}
};
var providerBasedIds=adItem.providerBasedIds;
for (var i=0, length=providerBasedIds.length; i < length; i++) {
var excItem=providerBasedIds[i];
var adUnits=exclusionAdItem.adUnits;
var providerId=getProviderIdFromProviderHref(excItem.providerHref);
var adUnitId=getAdUnitIdFromIdArray(excItem.id);
if (providerId && adUnitId) {
if (adUnits[providerId]) {
logAdError("duplicate entry in providerBasedIds of adItem (uniqueid)" + adItem.uniqueid)
}
else {
adUnits[providerId] = adUnitId
}
}
}
this._exclusionAdItems.push(exclusionAdItem)
}, _loadOfflineSettings: function _loadOfflineSettings() {
var cachedConfig=PlatformJS.BootCache.instance.getEntry(AdSettingsBootCacheKey);
if (cachedConfig) {
var settings=cachedConfig["adAppGlobalConfig"];
this._appGlobalConfig = settings ? JSON.parse(settings) : {};
settings = cachedConfig["adAppDefaultLayoutConfig"];
this._appDefaultLayoutConfig = settings ? JSON.parse(settings) : {};
settings = cachedConfig["adAppLayoutConfig"];
this._appLayoutConfig = settings ? JSON.parse(settings) : {};
settings = cachedConfig["adItems"];
this._adItems = settings ? JSON.parse(settings) : {};
settings = cachedConfig["defaultAdItems"];
this._defaultAdItems = settings ? JSON.parse(settings) : {};
settings = cachedConfig["exclusionAdItems"];
this._exclusionAdItems = settings ? JSON.parse(settings) : []
}
}, _persistSettings: function _persistSettings() {
var cachedConfig={};
cachedConfig["adAppGlobalConfig"] = JSON.stringify(this._appGlobalConfig);
cachedConfig["adAppDefaultLayoutConfig"] = JSON.stringify(this._appDefaultLayoutConfig);
cachedConfig["adAppLayoutConfig"] = JSON.stringify(this._appLayoutConfig);
cachedConfig["adItems"] = JSON.stringify(this._adItems);
cachedConfig["defaultAdItems"] = JSON.stringify(this._defaultAdItems);
cachedConfig["exclusionAdItems"] = JSON.stringify(this._exclusionAdItems);
PlatformJS.BootCache.instance.addOrUpdateEntry(AdSettingsBootCacheKey, cachedConfig)
}, _getAppConfig: function _getAppConfig(overrideKey, configKey, configValueType) {
var configValue=null;
if (this._appDefaultLayoutConfig) {
var defaultConfigValue=this._appDefaultLayoutConfig[configKey];
if (typeof defaultConfigValue === configValueType) {
configValue = defaultConfigValue
}
}
if (overrideKey && typeof overrideKey === "string" && this._appLayoutConfig) {
var overrideLayoutConfig=this._appLayoutConfig[overrideKey.toLowerCase()];
if (overrideLayoutConfig) {
var overrideConfigValue=overrideLayoutConfig[configKey];
if (typeof overrideConfigValue === configValueType) {
configValue = overrideConfigValue
}
}
}
return configValue
}, _getFrequencySettings: function _getFrequencySettings(overrideKey, startIntervalKey, repeatIntervalKey) {
var startInterval=this._getAppConfig(overrideKey, startIntervalKey, "number");
var repeatInterval=this._getAppConfig(overrideKey, repeatIntervalKey, "number");
return {
start: startInterval, repeat: repeatInterval
}
}, _getProviderAdConfig: function _getProviderAdConfig(width, height, providerId) {
var exclusionAdItems=getMatchingAdItems(this._exclusionAdItems, width, height);
var matchingAdItems=[];
for (var i=0, totalItems=exclusionAdItems.length; i < totalItems; i++) {
var exclusionAdItem=exclusionAdItems[i];
var adUnits=exclusionAdItem && exclusionAdItem.adUnits;
if (adUnits) {
var adUnitId=adUnits[providerId];
if (adUnitId) {
matchingAdItems.push({
width: exclusionAdItem.width, height: exclusionAdItem.height, uniqueKey: exclusionAdItem.uniqueid, adUnitId: adUnitId
})
}
}
}
return matchingAdItems
}, dispose: function dispose() {
if (this._configReadyPromsie) {
this._configReadyPromise.cancel();
this._configReadyPromise = null
}
this._appGlobalConfig = null;
this._appDefaultLayoutConfig = null;
this._appLayoutConfig = null;
this._adItems = null;
this._defaultAdItems = null
}, loadSettingsFromCMS: function loadSettingsFromCMS() {
msWriteProfilerMark("AdSettingsManager:loadAdSettingsFromCMS:s");
var that=this;
this._configReadyPromise = WinJS.Promise.as({});
try {
var newAdConfigService=new Platform.QueryService("AdSettingsData")
}
catch(e) {
debugger;
logAdError("AdSettingsData is not properly configured in AppConfiguration.xml")
}
if (newAdConfigService) {
var urlParams=PlatformJS.Collections.createStringDictionary();
var options=new Platform.DataServices.QueryServiceOptions;
var market=(Platform.Utilities.Globalization.getCurrentMarket() || "").toLowerCase();
urlParams.insert("market", market);
urlParams.insert("platform", adSettingsPlatform);
try {
this._configReadyPromise = newAdConfigService.downloadDataAsync(urlParams, null, null, options).then(function adsSettingDownloadComplete(response) {
msWriteProfilerMark("AdSettingsManager:_loadAdSettingsFromCMS:parse:s");
var adSettings=response && (response.dataObject || (response.dataString ? JSON.parse(response.dataString) : null));
if (Array.isArray(adSettings)) {
adSettings = adSettings[0]
}
if (adSettings) {
that._parseAppConfiguration(adSettings.adAppConfiguration);
if (that._enableAds) {
that._parseAdItems(adSettings.adItems)
}
that._persistSettings()
}
msWriteProfilerMark("AdSettingsManager:loadAdSettingsFromCMS:parse:e")
}, function adSettingsDownloadFailed(e) {
logAdError("Failed to retrieve AdSettingsData as configured in AppConfiguration.xml")
})
}
catch(e) {
debugger;
logAdError("Failed to retrieve AdSettingsData as configured in AppConfiguration.xml")
}
}
msWriteProfilerMark("AdSettingsManager:loadAdSettingsFromCMS:e");
return this._configReadyPromise
}, getVideoFrequency: function getVideoFrequency(overrideKey) {
return this._getFrequencySettings(overrideKey, "videoStartInterval", "videoPlaybackInterval")
}, getArticleFrequency: function getArticleFrequency(overrideKey) {
return this._getFrequencySettings(overrideKey, "articleStartInterval", "articleInterval")
}, getGalleryFrequency: function getGalleryFrequency(overrideKey) {
return this._getFrequencySettings(overrideKey, "galleryStartInterval", "galleryInterval")
}, getListFrequency: function getListFrequency(overrideKey) {
return this._getFrequencySettings(overrideKey, "listStartInterval", "listInterval")
}, getClusterFrequency: function getClusterFrequency(overrideKey) {
return this._getFrequencySettings(overrideKey, "clusterStartInterval", "clusterInterval")
}, getPanoFrequency: function getPanoFrequency(overrideKey) {
return this._getFrequencySettings(overrideKey, "panoStartInterval", "panoInterval")
}, getRefreshRate: function getRefreshRate() {
return this._getAppConfig("", "adRefreshRate", "number") || defaultAdRefreshRate
}, getAdConfig: function getAdConfig(category, subcategory, width, height, providerId) {
if (PlatformJS.mainProcessManager.retailModeEnabled || !this._enableAds || !this._adItems) {
return []
}
var matchingAdItems=[];
category = typeof category === "string" ? category.toLowerCase() : (category ? category : "");
subcategory = typeof subcategory === "string" ? subcategory.toLowerCase() : (subcategory ? subcategory : "");
category = category === "default" ? "" : category;
var hasFallenBackToDefault=false;
matchingAdItems = this._getProviderAdConfig(width, height, providerId);
if (matchingAdItems.length === 0) {
var categoryAdItems=this._adItems[category];
if (categoryAdItems) {
var subcategoryAdItems=categoryAdItems[subcategory];
matchingAdItems = getMatchingAdItems(subcategoryAdItems, width, height);
if (matchingAdItems.length === 0 && subcategory) {
if (category && subcategory) {
hasFallenBackToDefault = true
}
subcategoryAdItems = categoryAdItems[""];
matchingAdItems = getMatchingAdItems(subcategoryAdItems, width, height)
}
}
}
if (matchingAdItems.length === 0) {
if (category) {
hasFallenBackToDefault = true
}
matchingAdItems = getMatchingAdItems(this._defaultAdItems, width, height)
}
var adConfigs=generateAdConfigsFromAdItems(matchingAdItems, providerId);
if (hasFallenBackToDefault) {
logAdResolutionError("Failed to find a perfectly matching adItem", category, subcategory, width, height)
}
else if (!adConfigs.length) {
logAdError("There's no default adItem to fallback")
}
return adConfigs
}, getArticleReaderAdConfigs: function getArticleReaderAdConfigs(category, subcategory, providerId) {
var configs=this.getAdConfig(category, subcategory, null, null, providerId);
var newConfigs=[];
var adSettingsStatic=ADSNS.AdSettingsManager;
for (var index=0, len=configs.length; index < len; index++) {
var config=configs[index];
if (config.type === adSettingsStatic.thinAdType || config.type === adSettingsStatic.tileAdType || config.type === adSettingsStatic.emptyAdType) {
newConfigs.push(config)
}
}
return newConfigs
}, getProviderAdConfigs: function getProviderAdConfigs(width, height, providerId) {
var matchingAdItems=this._getProviderAdConfig(width, height, providerId);
return generateAdConfigsFromAdItems(matchingAdItems, providerId)
}
}, {
thinAdWidth: 300, thinAdHeight: 600, thinAdType: "thin", thinAdClass: "adTypeThin", tileAdWidth: 300, tileAdHeight: 250, tileAdType: "tile", tileAdClass: "adTypeTile", emptyAdWidth: 0, emptyAdHeight: 0, emptyAdType: "skip", videoAdWidth: 999, videoAdHeight: 999, videoAdType: "video"
})})
})();
(function appexPlatformAds_DisplayControllerInit() {
"use strict";
WinJS.Namespace.define("PlatformJS.Ads", {DisplayController: WinJS.Class.define(function _AdsDisplayController_15(maxCount) {
this._counter = 0;
this._maxCount = maxCount
}, {
_counter: 0, _maxCount: 0, increment: function increment() {
this._counter++
}, reset: function reset() {
this._counter = 0
}, isVisible: function isVisible() {
msWriteProfilerMark("AdsConfig:isVisible:s");
var result=this._isVisibleImpl();
msWriteProfilerMark("AdsConfig:isVisible:e");
return result
}, _isVisibleImpl: function _isVisibleImpl() {
if (!PlatformJS.Ads.Config.instance.applicationId) {
return false
}
if (!PlatformJS.Utilities.hasInternetConnection()) {
return false
}
if (PlatformJS.Utilities.isHighCostConnection()) {
return false
}
if (this._maxCount === 0) {
return false
}
if (this._maxCount === 1) {
return true
}
if (this._counter > this._maxCount) {
return false
}
return true
}
})})
})();
(function appexPlatformAds_AdsFetchProxyControlInit() {
"use strict";
var eventNS=CommonJS.WindowEventManager;
WinJS.Namespace.define("PlatformJS.Ads", {AdsFetchProxyControl: WinJS.Class.define(function adsPrefetchProxyControl_ctor(options) {
var that=this;
this.element = document.createElement("div");
this.element.winControl = this;
CommonJS.Utils.markDisposable(this.element);
this._adElement = document.createElement("div");
WinJS.Utilities.addClass(this._adElement, "platformAd");
WinJS.Utilities.addClass(this.element, "platformAdWrapper");
this.element.appendChild(this._adElement);
this._renderPromise = new WinJS.Promise(function _AdsFetchProxyControl_26(complete) {
that._renderPromiseSignal = complete
});
this._setupEvents();
WinJS.UI.setOptions(this, options);
this._hideInSemanticZoom();
this.element.style.visibility = "hidden";
document.body.appendChild(this.element);
this._eventManager = eventNS.getInstance();
this._create()
}, {
element: null, otherAdOptions: null, _adElement: null, _adControl: null, _scheduler: null, _scheduledPromise: null, _adShown: false, _handlerInvoked: false, _renderPromiseSignal: null, _className: null, _adUnitID: null, _completionHandler: null, _errorHandler: null, _readyHandler: null, _semanticZoom: null, _zoomChanged: null, _isLiveAd: false, _collapsed: false, _eventManager: null, scheduler: {
get: function get() {
return this._scheduler
}, set: function set(value) {
this._scheduler = value
}
}, className: {
get: function get() {
return this._className
}, set: function set(value) {
this._className = value;
WinJS.Utilities.addClass(this._adElement, value)
}
}, adUnitId: {set: function set(value) {
this._adUnitID = value
}}, completionHandler: {set: function set(value) {
this._completionHandler = value
}}, errorHandler: {set: function set(value) {
this._errorHandler = value
}}, readyHandler: {set: function set(value) {
this._readyHandler = value
}}, collapsed: {set: function set(value) {
this._collapsed = value
}}, render: function render() {
return WinJS.Promise.wrap({})
}, dispose: function dispose() {
if (this._scheduledPromise) {
this._scheduledPromise.cancel();
this._scheduledPromise = null
}
if (this._renderPromise) {
this._renderPromise.cancel();
this._renderPromise = null
}
if (this._adControl) {
this._adControl.dispose();
this._adControl = null
}
if (this._adElement) {
try {
WinJS.Utilities.disposeSubTree(this._adElement);
this.element.removeChild(this._adElement)
}
catch(error) {}
this._adElement = null
}
if (this.element) {
try {
if (this.element.parentNode === document.body) {
document.body.removeChild(this.element)
}
}
catch(error) {}
this.element.onmouseout = null;
this.element.onmouseover = null;
this.element = null
}
if (this._semanticZoom && this._zoomChanged) {
this._semanticZoom.removeEventListener("zoomchanged", this._zoomChanged);
this._semanticZoom = null;
this._zoomChanged = null
}
this._eventManager = null
}, refresh: function refresh() {
if (this._adControl) {
this._adControl.dispose();
this._adControl = null
}
this._adShown = false;
this._create()
}, _hideInSemanticZoom: function _hideInSemanticZoom() {
var that=this;
var semanticZoom=WinJS.Utilities.query(".win-semanticzoom");
if (semanticZoom.length > 0) {
var zoomControl=this._semanticZoom = semanticZoom[0].winControl;
var zoomChanged=this._zoomChanged = function() {
if (zoomControl.zoomedOut) {
WinJS.Utilities.addClass(that.element, "adTypeHidden")
}
else {
WinJS.Utilities.removeClass(that.element, "adTypeHidden")
}
};
zoomControl.addEventListener("zoomchanged", zoomChanged)
}
}, _setupEvents: function _setupEvents() {
var that=this;
this.element.onmouseover = function() {
if (that._isLiveAd) {
return
}
WinJS.Utilities.addClass(that.element, "platformAdWrapperHover")
};
this.element.onmouseout = function() {
if (that._isLiveAd) {
return
}
WinJS.Utilities.removeClass(that.element, "platformAdWrapperHover")
}
}, _create: function _create() {
var that=this;
if (this._adUnitID && PlatformJS.Ads.Config.instance.applicationId) {
var adsOptions={
applicationId: PlatformJS.Ads.Config.instance.applicationId, adUnitId: this._adUnitID, enableDefaultImageAd: true, onErrorOccurred: function onErrorOccurred(adControl, error) {
that._onErrorOccurred(adControl, error)
}, onAdRefreshed: function onAdRefreshed(adControl) {
that._onAdRefreshed(adControl)
}, onBeforeAdRender: function onBeforeAdRender(adControl) {
return that._onBeforeAdRender(adControl)
}, onEngagedChanged: function onEngagedChanged(adControl) {
that._onEngagedChanged(adControl)
}, onPointerUp: function onPointerUp() {
if (!that._isLiveAd) {
WinJS.UI.Animation.pointerUp(that.element).then()
}
}, onPointerDown: function onPointerDown() {
if (!that._isLiveAd) {
WinJS.UI.Animation.pointerDown(that.element).then()
}
}
};
if (this.otherAdOptions) {
for (var option in this.otherAdOptions) {
adsOptions[option] = this.otherAdOptions[option]
}
}
var adConfig=PlatformJS.Ads.Config.instance;
if (adConfig && adConfig.adManager) {
adsOptions.refreshPeriodSeconds = adConfig.adManager.getRefreshRate()
}
MicrosoftNSJS.Advertising.AdControl.enableWebViewPool = true;
this._adControl = new MicrosoftNSJS.Advertising.AdControl(this._adElement, adsOptions);
if (adConfig && adConfig.enableAdLabel === false) {
this._adControl.addAdTag("adLabel", "false")
}
this._adControl.addAdTag("tts", "false");
this._adControl.addAdTag("BINGAPPSVERSION", PlatformJS.Services.process.getAppVersionString());
if (this._collapsed) {
this._adControl.addAdTag("ADDISP", "NOAD")
}
if (this.otherAdOptions && this.otherAdOptions.adTags && this.otherAdOptions.adTags.length) {
var adTags=this.otherAdOptions.adTags;
for (var i=0; i < adTags.length; i++) {
var key=String(adTags[i].key);
var value=String(adTags[i].value);
try {
if (key.toUpperCase() === "PROVIDERID") {
value = PlatformJS.Utilities.EntityIdConverter.convertBase62ToBase32(value)
}
this._adControl.addAdTag(key, value)
}
catch(e) {
debugger
}
}
}
}
}, _onAdRefreshed: function _onAdRefreshed(adControl) {
if (!this._adShown && this._adElement) {
this._adElement.style.opacity = 0.5;
this._adShown = true;
WinJS.UI.executeTransition(this._adElement, {
property: "opacity", delay: 0, duration: 100, timing: "linear", from: 0.5, to: 1
})
}
if (!this._handlerInvoked) {
if (this._completionHandler) {
this._completionHandler()
}
this._handlerInvoked = true
}
if (adControl._ad && adControl._ad.adParameters) {
var adParams=JSON.parse(adControl._ad.adParameters);
if (adParams && adParams.type && adParams.type.tx === "LiveAd") {
this._isLiveAd = true
}
}
if (this._collapsed && this.element) {
var ad=this.element.querySelector("iframe");
if (ad) {
ad.tabIndex = -1
}
}
}, _onEngagedChanged: function _onEngagedChanged(adControl) {
if (!adControl) {
CommonJS.processListener.enableSearchOnType();
return
}
if (adControl.isEngaged) {
CommonJS.processListener.disableSearchOnType()
}
else {
CommonJS.processListener.enableSearchOnType()
}
this._eventManager.dispatchEvent(eventNS.Events.AD_ENGAGE, adControl.isEngaged)
}, _onBeforeAdRender: function _onBeforeAdRender(adControl) {
var that=this;
msSetImmediate(function _AdsFetchProxyControl_381() {
if (that._readyHandler) {
that._readyHandler()
}
});
if (this._scheduledPromise) {
this._scheduledPromise.cancel()
}
this._scheduledPromise = CommonJS.SchedulePromise(this._scheduler, CommonJS.TaskPriority.normal, "AdsFetchProxyControl:BeforeRender").then(function adsfetchproxycontrol_beforerender() {
msWriteProfilerMark("CommonControls:AdsFetchProxyControl:BeforeRender");
if (that && that._renderPromise) {
return that._renderPromise
}
else {
return WinJS.Promise.wrap(null)
}
});
return this._scheduledPromise
}, _onErrorOccurred: function _onErrorOccurred(adControl, error) {
if (!this._handlerInvoked) {
if (error.errorMessage.indexOf("request is already in progress") < 0) {
if (this._errorHandler) {
this._errorHandler()
}
this._handlerInvoked = true
}
}
}
})})
})();
(function appexPlatformAds_AdsWrapperControlInit() {
"use strict";
WinJS.Namespace.define("PlatformJS.Ads", {AdsWrapperControl: WinJS.Class.define(function adsWrapperControl_ctor(div, options) {
this.element = div ? div : document.createElement("div");
this.element.winControl = this;
CommonJS.Utils.markDisposable(this.element);
WinJS.UI.setOptions(this, options);
options.collapsed = !!this._collapsedAd;
if (options.fetchedAd) {
this._fetchedAd = options.fetchedAd;
options.fetchedAd = null
}
else {
this._fetchedAd = new PlatformJS.Ads.AdsFetchProxyControl(options);
this._fetchedAd.scheduler = this._scheduler
}
var fetchedAdElement=this._fetchedAd.element;
if (fetchedAdElement) {
this.element.appendChild(fetchedAdElement);
if (fetchedAdElement.style) {
fetchedAdElement.style.visibility = "visible"
}
}
if (this._fetchedAd._renderPromiseSignal) {
this._fetchedAd._renderPromiseSignal()
}
}, {
element: null, _className: null, _fetchedAd: null, _scheduler: null, _scheduledPromise: null, _collapsedAd: false, scheduler: {
get: function get() {
return this._scheduler
}, set: function set(value) {
this._scheduler = value;
if (this._fetchedAd) {
this._fetchedAd.scheduler = value
}
}
}, className: {
get: function get() {
return this._className
}, set: function set(value) {
if (value) {
this._className = value;
WinJS.Utilities.addClass(this.element, value);
this._collapsedAd = value === "adTypeCollapse";
if (this._collapsedAd && this.element && this.element.parentElement) {
WinJS.Utilities.addClass(this.element.parentElement, "collapsedAdCluster")
}
}
}
}, render: function render() {
var that=this;
if (this._scheduledPromise) {
this._scheduledPromise.cancel()
}
this._scheduledPromise = CommonJS.SchedulePromise(this._scheduler, CommonJS.TaskPriority.normal, "AdsWrapperControl:Render").then(function adswrappercontrol_render() {
msWriteProfilerMark("CommonControls:AdsWrapperControl:Render");
if (that._fetchedAd) {
return that._fetchedAd.render()
}
else {
return WinJS.Promise.wrap({})
}
}).then(function notifyAdsAdded(value) {
var manager=PlatformJS.mainProcessManager;
if (manager.adsClusterAdded) {
manager.adsClusterAdded(value)
}
return value
});
return this._scheduledPromise
}, dispose: function dispose() {
if (this._fetchedAd) {
this._fetchedAd.dispose()
}
this.element = null
}, refresh: function refresh() {
if (this._fetchedAd) {
this._fetchedAd.refresh()
}
}
})})
})();
(function appexPlatformAds_delayedAdsControlInit() {
"use strict";
var noop=function(){};
WinJS.Namespace.define("PlatformJS.Ads", {DelayedAdsWrapperControl: WinJS.Class.derive(PlatformJS.Ads.AdsWrapperControl, function delayedAdsWrapperControl_ctor(div, options) {
var element=this.element = div ? div : document.createElement("div");
this.element.winControl = this;
this._baseOptions = options;
this._isInSemanticZoomPanoramaPanel = options.isInSemanticZoomPanoramaPanel;
CommonJS.Utils.markDisposable(element);
element.style.visibility = "visible";
WinJS.Utilities.addClass(this.element, "platformImageCardImage");
element.style.backgroundImage = "url('" + this._defaultImageUrl + "')";
var that=this;
this._addAbleToRenderAdListener(function ableToRenderCallback() {
that._onAbleToRenderAdFinished()
});
WinJS.UI.setOptions(this, options)
}, {
_baseOptions: null, _isInSemanticZoomPanoramaPanel: false, _onAbleToRenderAdListenerBinding: null, _defaultImageUrl: "ms-appx:///MSAdvertisingJS/ads/images/defaultimageads/300x600/DefaultImageAd.png", _renderReady: false, _onAbleToRenderAdFinished: function _onAbleToRenderAdFinished() {
PlatformJS.mainProcessManager.removeSemanticZoomFinishedListener(this._onAbleToRenderAdListenerBinding);
this._replaceWithAdsWrapper()
}, _addAbleToRenderAdListener: function _addAbleToRenderAdListener(callback) {
this._onAbleToRenderAdListenerBinding = callback;
if (this._isInSemanticZoomPanoramaPanel) {
PlatformJS.mainProcessManager.addSemanticZoomFinishedListener(this._onAbleToRenderAdListenerBinding)
}
else {
PlatformJS.mainProcessManager.addAfterFirstViewListener(this._onAbleToRenderAdListenerBinding)
}
}, _removeAbleToRenderAdListener: function _removeAbleToRenderAdListener() {
if (this._isInSemanticZoomPanoramaPanel) {
PlatformJS.mainProcessManager.removeSemanticZoomFinishedListener(this._onAbleToRenderAdListenerBinding)
}
else {
PlatformJS.mainProcessManager.removeAfterFirstViewListener(this._onAbleToRenderAdListenerBinding)
}
this._onAbleToRenderAdListenerBinding = null
}, render: function render() {
this._renderReady = true;
this._replaceWithAdsWrapper()
}, dispose: function dispose() {
this.element = null;
if (this._onAbleToRenderAdListenerBinding) {
this._removeAbleToRenderAdListener();
this._replaceWithAdsWrapper = noop;
this._onAbleToRenderAdFinished = noop
}
}, refresh: function refresh(){}, _replaceWithAdsWrapper: function _replaceWithAdsWrapper() {
if (this.element && this._renderReady && PlatformJS.mainProcessManager.isSemanticZoomFinished) {
WinJS.Utilities.removeClass(this.element, "platformImageCardImage");
this.element.style.backgroundImage = "";
PlatformJS.mainProcessManager.removeSemanticZoomFinishedListener(this._onAbleToRenderAdListenerBinding);
this._removeAbleToRenderAdListener();
this._replaceWithAdsWrapper = noop;
this._onSemanticZoomFinished = noop;
this.disposeImplAdded = false;
this.dispose = PlatformJS.Ads.AdsWrapperControl.prototype.dispose;
this.refresh = PlatformJS.Ads.AdsWrapperControl.prototype.refresh;
this.render = PlatformJS.Ads.AdsWrapperControl.prototype.render;
PlatformJS.Ads.AdsWrapperControl.call(this, this.element, this._baseOptions);
WinJS.Utilities.addClass(this.element, this._className);
this.render();
this.refresh()
}
}
})})
})();
(function appexPlatformAds_RotatingAdsWrapperControlInit() {
"use strict";
WinJS.Namespace.define("PlatformJS.Ads", {RotatingAdsWrapperControl: WinJS.Class.define(function rotatingadswrapperctrl_ctor(element, options) {
this.element = element || document.createElement("div");
WinJS.Utilities.addClass(this.element, "platformRotatingAdsWrapper");
this.element.winControl = this;
CommonJS.Utils.markDisposable(this.element);
WinJS.UI.setOptions(this, options)
}, {
element: null, landscapeOptions: null, portraitOptions: null, currentViewState: null, _landscapeAd: null, _portraitAd: null, _scheduler: null, scheduler: {
get: function get() {
return this._scheduler
}, set: function set(value) {
this._scheduler = value
}
}, adOptions: {set: function set(value) {
this.landscapeOptions = value.landscapeOptions;
this.portraitOptions = value.portraitOptions;
this._createAd(PlatformJS.Utilities.getDisplayData().landscape)
}}, dispose: function dispose() {
this._disposeAd();
this.element = null
}, onWindowResize: function onWindowResize(event) {
CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, event, this.relayout.bind(this))
}, relayout: function relayout() {
var displayData=PlatformJS.Utilities.getDisplayData();
this._disposeAd();
this._createAd(displayData.landscape)
}, _disposeAd: function _disposeAd() {
if (this._landscapeAd) {
if (this._landscapeAd.element) {
this.element.removeChild(this._landscapeAd.element)
}
this._landscapeAd.dispose();
this._landscapeAd = null
}
if (this._portraitAd) {
if (this._portraitAd.element) {
this.element.removeChild(this._portraitAd.element)
}
this._portraitAd.dispose();
this._portraitAd = null
}
}, _createAd: function _createAd(isLandscape) {
this.currentViewState = isLandscape;
if (isLandscape) {
if (!this._landscapeAd) {
var landscapeDiv=document.createElement("div");
WinJS.Utilities.addClass(landscapeDiv, "platformLandscapeAd");
this.element.appendChild(landscapeDiv);
this._landscapeAd = new PlatformJS.Ads.AdsWrapperControl(landscapeDiv, this.landscapeOptions, this._scheduler)
}
}
else {
if (!this._portraitAd) {
var portraitDiv=document.createElement("div");
WinJS.Utilities.addClass(portraitDiv, "platformPortraitAd");
this.element.appendChild(portraitDiv);
this._portraitAd = new PlatformJS.Ads.AdsWrapperControl(portraitDiv, this.portraitOptions, this._scheduler)
}
}
}
})})
})();
(function appexPlatformAds_AdUnitInit() {
"use strict";
var _adTypes=Object.freeze({
thinTypeClass: "adTypeThin", tileTypeClass: "adTypeTile", noadTypeClass: "adTypeCollapse", thin: "thin", tile: "tile", noad: "noad", getClassType: function getClassType(specType) {
switch (specType) {
case this.thin:
return this.thinTypeClass;
case this.tile:
return this.tileTypeClass;
case this.noad:
return this.noadTypeClass;
default:
return specType
}
}
});
WinJS.Namespace.define("PlatformJS.Ads", {AdUnit: WinJS.Class.define(function adunit_ctor(adSpec) {
debugger;
if (adSpec.id) {
this.adUnitId = adSpec.id
}
if (adSpec.appID) {
this.appID = adSpec.appID
}
this.adHeight = adSpec.height;
this.adWidth = adSpec.width;
if (adSpec.type) {
var type=adSpec.type.toLowerCase().trim();
this.adType = _adTypes.getClassType(type);
this.type = type
}
if (adSpec.adTags) {
this._setupAdTags(adSpec.adTags)
}
}, {
type: null, adUnitId: null, appID: null, adHeight: 0, adWidth: 0, adType: null, adTags: null, _setupAdTags: function _setupAdTags(tags) {
if (tags && tags.length) {
this.adTags = [];
for (var i=0; i < tags.length; i++) {
if (tags[i].Key && tags[i].Value) {
this.adTags.push({
key: tags[i].Key, value: tags[i].Value
})
}
}
}
}
})});
WinJS.Namespace.define("PlatformJS.Ads", {VideoAdUnit: WinJS.Class.derive(PlatformJS.Ads.AdUnit, function videoadunit_ctor(adSpec) {
if (adSpec.adUnit) {
PlatformJS.Ads.AdUnit.call(this, adSpec.adUnit)
}
if (adSpec.adProvider) {
this.adProvider = adSpec.adProvider.toLowerCase().trim()
}
if (adSpec.adStartFrequency) {
this.adStartFrequency = adSpec.adStartFrequency
}
if (adSpec.adRepeatFrequency) {
this.adRepeatFrequency = adSpec.adRepeatFrequency
}
if (adSpec.adServer) {
this.adServer = adSpec.adServer.toLowerCase().trim()
}
}, {
adProvider: null, adStartFrequency: 0, adRepeatFrequency: 0, adServer: null
})});
WinJS.Namespace.define("PlatformJS.Ads", {ClusterAdUnit: WinJS.Class.derive(PlatformJS.Ads.AdUnit, function clusteradunit_ctor(adSpec) {
if (adSpec.adUnit) {
PlatformJS.Ads.AdUnit.call(this, adSpec.adUnit)
}
if (adSpec.adClusterId) {
this.clusterId = adSpec.adClusterId
}
if (typeof adSpec.adClusterPosition === "number") {
this.clusterPosition = adSpec.adClusterPosition - 1
}
if (adSpec.adClusterKey) {
this.clusterKey = adSpec.adClusterKey
}
var adCounter=1;
this.adDisplayController = new PlatformJS.Ads.DisplayController(adCounter)
}, {
clusterId: "", clusterPosition: null, clusterKey: null, resetOnSuspend: false, adDisplayController: null, getClusterConfigKey: function getClusterConfigKey() {
var key=null;
if (this.clusterKey) {
key = this.clusterKey
}
if (!key) {
key = "AdsCluster";
if (this.clusterId) {
key += "_" + this.clusterId
}
}
return key
}
})})
})();
(function appexPlatformAds_PageAdsConfigInit() {
"use strict";
var _clusterAdLevel=Object.freeze({
main: "main", secondary: "secondary", none: "none"
});
WinJS.Namespace.define("PlatformJS.Ads", {PageAdsConfig: WinJS.Class.define(function pageadsconfig_ctor(pageads) {
debugger;
var i;
var unit=null;
if (pageads.articleReaderAds && Array.isArray(pageads.articleReaderAds)) {
this.articleReaderAds = [];
for (i = 0; i < pageads.articleReaderAds.length; i++) {
unit = pageads.articleReaderAds[i];
if (unit) {
var articleReaderUnit=new PlatformJS.Ads.AdUnit(unit);
this.articleReaderAds.push(articleReaderUnit)
}
}
}
if (pageads.videoAds && Array.isArray(pageads.videoAds)) {
this.videoAds = {};
for (i = 0; i < pageads.videoAds.length; i++) {
unit = pageads.videoAds[i];
if (unit) {
var videoUnit=new PlatformJS.Ads.VideoAdUnit(unit);
if (videoUnit.type !== "noad") {
this.videoAds[videoUnit.adProvider] = videoUnit
}
}
}
}
if (pageads.clusterAds && Array.isArray(pageads.clusterAds)) {
this.clusterAds = {};
this.entityClusterAds = {};
this.secondaryLevelClusterAds = {};
this.customLevelClusterAds = {};
for (i = 0; i < pageads.clusterAds.length; i++) {
unit = pageads.clusterAds[i];
if (unit) {
var ecId=unit.EntityClusterId;
if (ecId) {
if (typeof ecId === "string") {
ecId = ecId.toLowerCase()
}
this.entityClusterAds[ecId] = new PlatformJS.Ads.AdUnit(unit.adUnit)
}
else {
var clusterUnit=new PlatformJS.Ads.ClusterAdUnit(unit);
if ((!clusterUnit.clusterPosition && clusterUnit.clusterPosition !== 0) || clusterUnit.clusterPosition >= 1) {
var adUnitLevel=unit.clusterLevel;
if (typeof adUnitLevel === "string") {
adUnitLevel = adUnitLevel.toLowerCase()
}
var clusterId=clusterUnit.clusterId;
if (typeof clusterId === "string") {
clusterId = clusterId.toLowerCase()
}
if (!adUnitLevel || adUnitLevel === _clusterAdLevel.main) {
this.clusterAds[clusterId] = clusterUnit
}
else if (adUnitLevel === _clusterAdLevel.secondary) {
this.secondaryLevelClusterAds[clusterId] = clusterUnit
}
else if (adUnitLevel !== _clusterAdLevel.none) {
var clusterAds=this.customLevelClusterAds[adUnitLevel];
if (!clusterAds) {
clusterAds = {};
this.customLevelClusterAds[adUnitLevel] = clusterAds
}
clusterAds[clusterId] = clusterUnit
}
}
}
}
}
}
}, {
articleReaderAds: null, videoAds: null, clusterAds: null, entityClusterAds: null, secondaryLevelClusterAds: null, customLevelClusterAds: null
})})
})();
(function appexPlatform_PartnerAdsConfig_Init() {
"use strict";
var ADSPartnersNS=WinJS.Namespace.define("PlatformJS.Ads.Partners", {
DisplayController: WinJS.Class.derive(PlatformJS.Ads.DisplayController, function displayController_ctor(maxCount) {
PlatformJS.Ads.DisplayController.call(this, maxCount)
}, {
isVisible: function isVisible() {
if (!Platform.Networking.NetworkManager.instance.isNetworkAvailable) {
return false
}
switch (this._maxCount) {
case 0:
return false;
case-1:
case 1:
return true;
default:
return this._counter > this._maxCount ? false : true
}
}, getMaxAdDisplayCount: function getMaxAdDisplayCount() {
var max=Number.POSITIVE_INFINITY;
if (this._maxCount !== -1) {
max = this._maxCount - this._counter
}
return max
}
}), AdFormatter: WinJS.Class.define(function adFormatter_ctor(){}, {
getKeywordString: function getKeywordString(options) {
return []
}, formatAd: function formatAd(ad, adType, options) {
if (!ad || !options) {
return ad
}
var newAd;
if (adType === "interstitial") {
options.orientation = "landscape";
ad.adMetadata.controlOptions.adOptions.landscapeOptions.otherAdOptions.adTags = this.getKeywordString(options);
options.orientation = "portrait";
ad.adMetadata.controlOptions.adOptions.portraitOptions.otherAdOptions.adTags = this.getKeywordString(options);
newAd = {
articleId: ad.articleId, adMetadata: JSON.stringify(ad.adMetadata)
}
}
else if (adType === "cluster") {
newAd = {
subclusterAdFrequency: ad.subclusterAdFrequency, adsList: []
};
for (var i=0; i < options.numberOfAds; i++) {
options.index = i;
newAd.adsList.push({
adTags: this.getKeywordString(options), applicationId: ad.applicationId
})
}
}
else {
ad.adMetadata.controlOptions.otherAdOptions.adTags = this.getKeywordString(options);
newAd = JSON.stringify(ad.adMetadata)
}
return newAd
}
}), AdsManager: WinJS.Class.define(function adsManager_ctor() {
this._partnerAds = {};
this._formattedAds = {}
}, {
_partnerAds: {}, _formattedAds: {}, getFormattedAds: function getFormattedAds(partner) {
if (!this._partnerAds[partner]) {
var partnerAd=this._partnerAds[partner] = this.getPartnerAdsFromConfig(partner)
}
if (!this._formattedAds[partner] && partnerAd) {
var configuredAds={
interstitial: {
adsList: [], adDisplayController: null
}, end: {
adsList: [], adDisplayController: null
}, cluster: {
adsList: [], adDisplayController: null
}
};
var appId=partnerAd.appId;
var partnerAdInterstitialConfig=partnerAd.interstitialConfig;
configuredAds.interstitial.adDisplayController = new ADSPartnersNS.DisplayController(partnerAdInterstitialConfig.getInt32("MaxCount"));
configuredAds.interstitial.articleGap = partnerAdInterstitialConfig.getInt32("ArticleGap");
configuredAds.interstitial.startAfterArticle = partnerAdInterstitialConfig.getInt32("StartAfterArticleNum");
configuredAds.end.adDisplayController = new ADSPartnersNS.DisplayController(partnerAd.endConfig.getInt32("MaxCount"));
configuredAds.cluster.adDisplayController = new ADSPartnersNS.DisplayController(1);
var ad=partnerAd.endConfig;
var adUnitId=ad.getString("AdUnitID");
var adMetadata={
controlType: "PlatformJS.Ads.AdsWrapperControl", controlOptions: {
otherAdOptions: {
applicationId: appId, adUnitId: adUnitId
}, className: ad.getString("Classname"), adUnitId: adUnitId
}, height: ad.getInt32("AdHeight"), width: ad.getInt32("AdWidth")
};
configuredAds.end.adsList.push({adMetadata: adMetadata});
var adOrientations=partnerAdInterstitialConfig.getDictionary("AdOrientations");
var landscape=adOrientations.getDictionary("Landscape");
var portrait=adOrientations.getDictionary("Portrait");
var landscapeAdUnitId=landscape.getString("AdUnitID");
var portraitAdUnitId=portrait.getString("AdUnitID");
var landscapeOptions={
otherAdOptions: {
applicationId: appId, adUnitId: landscapeAdUnitId
}, className: landscape.getString("Classname"), adUnitId: landscapeAdUnitId
};
var portraitOptions={
otherAdOptions: {
applicationId: appId, adUnitId: portraitAdUnitId
}, className: portrait.getString("Classname"), adUnitId: portraitAdUnitId
};
var interAd={adMetadata: {
controlType: "PlatformJS.Ads.RotatingAdsWrapperControl", controlOptions: {adOptions: {
landscapeOptions: landscapeOptions, portraitOptions: portraitOptions
}}
}};
configuredAds.interstitial.adsList.push(interAd);
ad = partnerAd.clusterConfig;
configuredAds.cluster.adsList.push({
subclusterAdFrequency: ad.getInt32("SubClusterAdFrequency", 1), applicationId: appId
});
var sectionAdUnitIds=ad.getDictionary("SectionAdUnitIds") || {};
this.sectionAdUnitIds[partner] = {};
var sections=Object.keys(sectionAdUnitIds);
for (var i=0; i < sections.length; i++) {
var section=sections[i];
var sectionAdUnitId=sectionAdUnitIds[section];
if (sectionAdUnitId.value) {
this.sectionAdUnitIds[partner][section] = sectionAdUnitId.value
}
}
this._formattedAds[partner] = configuredAds
}
return this._formattedAds[partner]
}, getPartnerAdsFromConfig: function getPartnerAdsFromConfig(partner) {
var adsNode=CommonJS.Partners.Config.getConfig(partner, "Ads", {});
var appId=adsNode.getString("ApplicationID");
var config=adsNode.getDictionary("PartnerAdsConfig");
return {
appId: appId, interstitialConfig: config.getDictionary("Interstitial"), endConfig: config.getDictionary("End"), clusterConfig: config.getDictionary("Cluster")
}
}, getSectionAdUnitId: function getSectionAdUnitId(partner, section) {
if (!this.sectionAdUnitIds[partner]) {
this.getFormattedAds(partner)
}
return this.sectionAdUnitIds[partner][section]
}, sectionAdUnitIds: {}, getFormattedAdsMetadataForPartnerByType: function getFormattedAdsMetadataForPartnerByType(partnerName, adType, adOptions) {
var ads=this.getFormattedAds(partnerName);
var finalAds=null;
if (ads) {
finalAds = ads[adType];
var newAdList=[];
var adFormatter=ADSPartnersNS.AdsManager.adFormatters[partnerName];
if (adFormatter) {
for (var ad in finalAds.adsList) {
var p=adFormatter.formatAd(finalAds.adsList[ad], adType, adOptions);
newAdList.push(p)
}
}
finalAds.formattedAdsList = newAdList
}
return finalAds
}, getCountedAds: function getCountedAds(partnerName, type, adOptions) {
var ads=this.getFormattedAdsMetadataForPartnerByType(partnerName, type, adOptions);
var adsList=[];
for (var i=0; i < ads.formattedAdsList.length; i++) {
if (ads.adDisplayController.isVisible()) {
adsList.push(ads.formattedAdsList[i]);
ads.adDisplayController.increment()
}
}
return adsList
}, getDisplayControllerForAdType: function getDisplayControllerForAdType(partnerName, adType) {
var ads=this.getFormattedAdsMetadataForPartnerByType(partnerName, adType, null);
return ads.adDisplayController
}
}, {
adFormatters: {}, _instance: null, instance: {get: function get() {
if (!ADSPartnersNS.AdsManager._instance) {
ADSPartnersNS.AdsManager._instance = new ADSPartnersNS.AdsManager
}
return ADSPartnersNS.AdsManager._instance
}}
})
})
})()