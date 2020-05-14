/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var PageSessionMessageDispatcher=WinJS.Class.define(null, {
_dictionary: null, _clearBindToThis: null, register: function register(message, action) {
if (message === null || message === undefined || action === null || action === undefined) {
return
}
if (this._dictionary === null) {
this._dictionary = {};
this._clearBindToThis = this._clear.bind(this);
WinJS.Navigation.addEventListener("navigating", this._clearBindToThis)
}
var entry=this._dictionary[message];
if (!entry) {
this._dictionary[message] = entry = []
}
entry.push(action)
}, dispatch: function dispatch(message, args) {
if (message === null || message === undefined) {
return
}
if (this._dictionary) {
var entry=this._dictionary[message];
if (entry) {
for (var i=0, ilen=entry.length; i < ilen; i++) {
entry[i](args)
}
}
}
}, _clear: function _clear() {
this._dictionary = null;
if (this._clearBindToThis) {
WinJS.Navigation.removeEventListener("navigating", this._clearBindToThis);
this._clearBindToThis = null
}
}
});
WinJS.Namespace.define("NewsApp", {PageEvents: new PageSessionMessageDispatcher})
})();
(function() {
"use strict";
WinJS.Namespace.define("NewsApp", {PanoramaProxy: WinJS.Class.define(function(list, key, market) {
this._market = market;
this._list = list;
this._key = key
}, {
_remove: function _remove() {
var that=this;
if (this._list) {
this._list.forEach(function(value, index, array) {
if (value.clusterKey === that._key) {
that._list.splice(index, 1)
}
})
}
}, remove: function remove(persist) {
var eventArgs={
persist: persist ? true : false, key: this._key
};
NewsApp.PageEvents.dispatch("removingcluster", eventArgs);
this._remove();
if (persist) {
NewsApp.PersonalizationManager.removeClusterDefinition(this._key, this._market).then(function(results) {
NewsApp.PageEvents.dispatch("removedcluster", eventArgs)
})
}
}, hide: function hide() {
this._remove()
}
})})
})();
(function() {
"use strict";
var nullRoamedState={
state: null, market: ""
},
lastGoodRoamedState=nullRoamedState;
function getDefaultClusters(market) {
return _getDefaultClustersState(market).then(function(response) {
return response && response.clustersDefinition ? response.clustersDefinition : null
})
}
function synchronizeAfterCustomization(currentClusterKeys, clustersBeforeCustomization, deletedClustersBeforeCustomization, clustersAdded, market, editorialMarket) {
lastGoodRoamedState = nullRoamedState;
return _getDefaultClustersState(market, true).then(function(defaultClustersState) {
var defaultClusterMap={},
origDeletedClusterMap={},
userRemovedList=[],
originalClusterMap={},
currentClusterKeysMap={},
defaultClusters=defaultClustersState ? defaultClustersState.clustersDefinition : clustersBeforeCustomization,
editorialMarket=defaultClustersState ? defaultClustersState.editorialMarket : editorialMarket;
currentClusterKeysMap = _createClusterKeysMap(currentClusterKeys);
origDeletedClusterMap = _createClusterDefinitionsMap(deletedClustersBeforeCustomization);
for (var m=0, mlen=clustersBeforeCustomization.length; m < mlen; m++) {
var origCluster=clustersBeforeCustomization[m];
originalClusterMap[origCluster.guid] = origCluster;
if (!currentClusterKeysMap[origCluster.guid] && !origDeletedClusterMap[origCluster.guid]) {
if (origCluster.clusterType === "NewsApp.Controls.TempClusterWrapper") {
if (m === 1 || m === mlen - 1) {
currentClusterKeysMap[origCluster.guid] = origCluster.guid;
if (m === 1) {
currentClusterKeys.splice(1, 0, origCluster.guid)
}
else {
currentClusterKeys.push(origCluster.guid)
}
}
}
else {
userRemovedList.push(origCluster)
}
}
}
defaultClusterMap = _createClusterDefinitionsMap(defaultClusters);
var updatedClusterDefinitions=[];
for (var i=0, ilen=currentClusterKeys.length; i < ilen; i++) {
var key=currentClusterKeys[i],
entry=defaultClusterMap[key];
if (entry) {
if (origDeletedClusterMap[key]) {
delete origDeletedClusterMap[key]
}
updatedClusterDefinitions.push(entry)
}
else {
var clusterMissingFromDefaults=originalClusterMap[key];
if (!clusterMissingFromDefaults && clustersAdded) {
clusterMissingFromDefaults = clustersAdded[key]
}
if (clusterMissingFromDefaults) {
if (clusterMissingFromDefaults.server) {
if (origDeletedClusterMap[key]) {
delete origDeletedClusterMap[key]
}
}
else {
updatedClusterDefinitions.push(clusterMissingFromDefaults)
}
}
}
}
for (var clusterKey in origDeletedClusterMap) {
userRemovedList.push(origDeletedClusterMap[clusterKey])
}
return _saveClusters(true, updatedClusterDefinitions, userRemovedList, market, editorialMarket, false)
})
}
function getClusterDefinitions(market) {
return getClusterDefinitionsState(market, false, true, false).then(function(clusterDefsState) {
return clusterDefsState.clustersDefinition
})
}
function getClusterDefinitionsState(market, bypassCache, mergeFromCloud, internationalEdition) {
market = market || NewsJS.Globalization.getMarketString();
return new WinJS.Promise(function(complete) {
_readRoamedDefinitionData(market).then(function(roamedDefinitionData) {
var alreadySynchedWithTheCloudEdition=Windows.Storage.ApplicationData.current.localSettings.values["BingDailyAlreadySynchedWithCloud"] && !internationalEdition;
var roamedDefinitionDataHasClusterDefinitions=roamedDefinitionData.clustersDefinition && roamedDefinitionData.clustersDefinition.length > 0 && isHeroCluster(roamedDefinitionData.clustersDefinition[0]);
var useRoamedDefinitionData=roamedDefinitionDataHasClusterDefinitions && (!mergeFromCloud || alreadySynchedWithTheCloudEdition);
var readDataPromise=useRoamedDefinitionData ? WinJS.Promise.wrap(roamedDefinitionData) : _readAndMergeDefinitionData(market, roamedDefinitionData, bypassCache, internationalEdition);
readDataPromise.then(function(definitionData) {
var state=definitionData || _getMinimalState(market);
complete(state)
}, function(error) {
_buildDefaultClustersState(market, error).then(function(defaultClustersState) {
return _saveRoamingOrPrepareFRE(defaultClustersState, market, internationalEdition)
}).done(function(response) {
complete(response)
}, function(error) {
complete(_getMinimalState(market))
})
})
})
})
}
function addClusterDefinition(clusterDefinition, market) {
return new WinJS.Promise(function(complete) {
getClusterDefinitionsState(market).then(function(clustersState) {
lastGoodRoamedState = nullRoamedState;
var clusters=clustersState.clustersDefinition,
deletedClusters=clustersState.clustersDeleted,
editorialMarket=clustersState.editorialMarket;
var clusterExists=false;
var indexToInsert=-1;
for (var i=0, ilen=clusters.length; i < ilen; i++) {
var cluster=clusters[i];
if (cluster.guid === clusterDefinition.guid) {
clusterExists = true;
break
}
if (cluster.append) {
indexToInsert = i;
break
}
}
if (clusterExists) {
complete(true)
}
else {
if (indexToInsert === -1) {
indexToInsert = ilen
}
if (indexToInsert > -1) {
clusters.splice(indexToInsert, 0, clusterDefinition);
_saveClusters(true, clusters, deletedClusters, market, editorialMarket, false).done(function() {
complete(true)
}, function() {
complete(false)
})
}
else {
complete(false)
}
}
}, function(err) {
complete(false)
})
})
}
function removeClusterDefinition(guid, market) {
market = market || NewsJS.Globalization.getMarketString();
return new WinJS.Promise(function(complete) {
var clusters=NewsJS.StateHandler.instance.getClustersDefinition(market);
for (var i=0; i < clusters.length; i++) {
if (clusters[i] && clusters[i].guid === guid) {
NewsJS.StateHandler.instance.removeCluster(market, clusters[i]);
complete(true);
return true
}
}
complete(false);
return false
})
}
function applyClusterAdditionsAndDeletions(market, clustersToDelete, clustersToAddBack) {
if (lastGoodRoamedState && lastGoodRoamedState.state && lastGoodRoamedState.market === market) {
var clustersState=lastGoodRoamedState.state;
lastGoodRoamedState = nullRoamedState;
if (clustersToAddBack && clustersToAddBack.length > 0) {
var indexToInsert=-1;
for (var i=0, ilen=clustersState.clustersDefinition.length; i < ilen; i++) {
var cluster=clustersState.clustersDefinition[i];
if (cluster.append) {
indexToInsert = i;
break
}
}
if (indexToInsert === -1) {
indexToInsert = ilen
}
for (var j=0, jlen=clustersToAddBack.length; j < jlen; j++) {
NewsJS.StateHandler.instance.addCluster(market, indexToInsert, clustersToAddBack[j]);
indexToInsert++
}
}
if (clustersToDelete && clustersToDelete.length > 0) {
NewsJS.StateHandler.instance.removeClusters(market, clustersToDelete)
}
clustersState = {
clustersDefinition: NewsJS.StateHandler.instance.getClustersDefinition(market), clustersDeleted: NewsJS.StateHandler.instance.getClustersDeleted(market)
};
return WinJS.Promise.wrap(clustersState)
}
else {
return getClusterDefinitionsState(market).then(function(state) {
lastGoodRoamedState = {
state: state, market: market
};
return applyClusterAdditionsAndDeletions(market, clustersToDelete, clustersToAddBack)
}, function(error) {
return WinJS.Promise.wrapError("current roamed state unavailable")
})
}
}
function _shouldFilterCluster(clusterDefinition, currentReleaseNumber) {
var shouldFilter=false;
if (!clusterDefinition.server && clusterDefinition.minReleaseNumber) {
if (clusterDefinition.minReleaseNumber && clusterDefinition.minReleaseNumber > currentReleaseNumber) {
shouldFilter = true
}
}
return shouldFilter
}
function isTempCluster(clusterDefinition) {
if (clusterDefinition && clusterDefinition.guid) {
return (clusterDefinition.guid.toLowerCase() === "tempcluster")
}
return false
}
function isNextStepsCluster(clusterDefinition) {
if (clusterDefinition && clusterDefinition.guid) {
return (clusterDefinition.guid.toLowerCase() === "nextsteps")
}
return false
}
function isSourcesCluster(clusterDefinition) {
if (clusterDefinition && clusterDefinition.guid) {
return (clusterDefinition.guid.toLowerCase() === "mysources")
}
return false
}
function isHeroCluster(clusterDefinition) {
if (clusterDefinition) {
if (clusterDefinition.guid) {
return (clusterDefinition.guid.toLowerCase() === "hero")
}
else if (clusterDefinition.clusterType) {
return (clusterDefinition.clusterType === "NewsApp.Controls.HeroControl")
}
}
return false
}
function isTopicFollowed(state, query) {
var topicCheck=function(clusterDefinition) {
return clusterDefinition.providerConfiguration.query && clusterDefinition.providerConfiguration.query.toLocaleLowerCase() === query.toLocaleLowerCase()
};
return _isClusterPresent(state, "NewsApp.Controls.UserSection.TopicControl", "NewsApp.DataProviders.Generic.TopicDataProvider", topicCheck)
}
function isCategoryFollowed(state, market, guid) {
var categoryCheck=function(clusterDefinition) {
return clusterDefinition.guid === guid && clusterDefinition.providerConfiguration.market.toLowerCase() === market.toLowerCase()
};
return _isClusterPresent(state, "NewsApp.Controls.CategoryControl", "NewsApp.DataProviders.CMS.DataProvider", categoryCheck)
}
function isInternationalEditionFollowed(state, title, market) {
var intlEditionCheck=function(clusterDefinition) {
return clusterDefinition.providerConfiguration.market.toLowerCase() === market.toLowerCase() && clusterDefinition.title === title
};
return _isClusterPresent(state, "NewsApp.Controls.UserSection.InternationalEditionControl", "NewsApp.DataProviders.CMS.InternationalProvider", intlEditionCheck)
}
function isSourceFollowed(state, id, market, type) {
var sourceCheck=function(clusterDefinition) {
return (clusterDefinition.providerConfiguration.sourceId === id && clusterDefinition.providerConfiguration.market.toLowerCase() === market.toLowerCase())
};
var control=null;
var provider=null;
switch (type) {
case"partner":
control = "NewsApp.Controls.UserSection.SourceControl";
provider = "NewsApp.DataProviders.CMS.PartnerProvider";
break;
case"rss":
control = "NewsApp.Controls.UserSection.SourceControl";
provider = "NewsApp.DataProviders.Generic.CustomRSSSourceDataProvider";
break;
case"algo":
control = "NewsApp.Controls.UserSection.SourceControl";
provider = "NewsApp.DataProviders.Generic.AlgoSourceDataProvider";
break
}
var followed=false;
if (control && provider) {
followed = _isClusterPresent(state, control, provider, sourceCheck)
}
return followed
}
function createTopicUserSection(title, query, market) {
market = market.toUpperCase();
return {
guid: (title + ".Topic." + market).toLowerCase(), clusterType: "NewsApp.Controls.UserSection.TopicControl", title: title, providerConfiguration: {
providerType: "NewsApp.DataProviders.Generic.TopicDataProvider", strategy: "conflatedSearch", market: market, query: query
}, minReleaseNumber: NewsApp.PersonalizationManager.ReleaseNumber.JUNE_2013
}
}
function createInternationalEditionUserSection(title, market) {
market = market.toUpperCase();
return {
guid: title + ".IntlEdition." + market, title: title, clusterType: "NewsApp.Controls.UserSection.InternationalEditionControl", providerConfiguration: {
providerType: "NewsApp.DataProviders.CMS.InternationalProvider", strategy: "international", market: market
}, minReleaseNumber: NewsApp.PersonalizationManager.ReleaseNumber.JUNE_2013
}
}
function createSourceSection(type, market, source) {
var sectionDef=null;
if (source) {
var title=source.displayname;
market = market.toUpperCase();
switch (type) {
case"partner":
title = title || source.panoTitle;
var feedName=source.featured_url || source.feedName;
sectionDef = {
guid: (source.id || title) + ".Partner." + market, clusterType: "NewsApp.Controls.UserSection.SourceControl", title: title, providerConfiguration: {
providerType: "NewsApp.DataProviders.CMS.PartnerProvider", strategy: "partner", market: market, feedName: source.featured_url || source.feedName, sourceId: source.id, instrumentationId: source.instrumentation_id
}, minReleaseNumber: NewsApp.PersonalizationManager.ReleaseNumber.JUNE_2013
};
if (source.css) {
sectionDef.providerConfiguration.css = source.css
}
break;
case"algo":
sectionDef = {
guid: (source.id || title) + ".Algo." + market, clusterType: "NewsApp.Controls.UserSection.SourceControl", title: title, providerConfiguration: {
providerType: "NewsApp.DataProviders.Generic.AlgoSourceDataProvider", market: market, domain: source.title, sourceId: source.id
}, minReleaseNumber: NewsApp.PersonalizationManager.ReleaseNumber.JUNE_2013
};
break;
case"rss":
var feedUrlsArray=source.feedUrlsArray ? source.feedUrlsArray : (source.rss_urls ? source.rss_urls.split(',') : null);
if (feedUrlsArray && feedUrlsArray.length > 0) {
var url=feedUrlsArray[0].trim();
try {
url = decodeURIComponent(url)
}
catch(exception) {}
sectionDef = {
guid: (source.id || title) + ".RSS." + market, clusterType: "NewsApp.Controls.UserSection.SourceControl", title: title, providerConfiguration: {
providerType: "NewsApp.DataProviders.Generic.CustomRSSSourceDataProvider", feed: url, isCustomRSS: source.isCustomRSS, sourceName: source.displayname, market: market, sourceId: source.id
}, minReleaseNumber: NewsApp.PersonalizationManager.ReleaseNumber.JUNE_2013
}
}
break
}
}
return sectionDef
}
function getDefaultClusterDefinition(market, categoryKey) {
return getDefaultClusters(market).then(function(defaultClusters) {
for (var c in defaultClusters) {
var cluster=defaultClusters[c];
if (cluster.providerConfiguration.categoryKey === categoryKey && cluster.providerConfiguration.providerType === "NewsApp.DataProviders.CMS.DataProvider") {
return cluster
}
}
return null
}, function(error) {
return null
})
}
function defaultEditorialMarket(market) {
if (!market || market.toUpperCase() === NewsJS.Globalization.getMarketString().toUpperCase()) {
return NewsJS.Globalization.getMarketStringForEditorial()
}
else {
return market.toUpperCase()
}
}
function _getMinimalState(market) {
return {
isMinimal: true, clustersDefinition: _getMinimalClusters(market), clustersDeleted: []
}
}
function _getMinimalClusters(market) {
return [{
server: true, pinned: true, isMinimal: true, title: "_TopStory_", guid: "hero", clusterType: "NewsApp.Controls.HeroControl", providerConfiguration: {
providerType: "NewsApp.DataProviders.CMS.DataProvider", categoryKey: "hero", strategy: "hero", market: defaultEditorialMarket(market)
}
}]
}
function _getDefaultClustersState(market, failSilently) {
return _getBingDailyClusterDefinitionsResponse(market).then(function(response) {
var responseData=response && response.data ? response.data : null;
if (responseData && responseData.clustersDefinition) {
_putHeroFirst(responseData.clustersDefinition);
_putAppendsLast(responseData.clustersDefinition)
}
return responseData
}, function(error) {
if (failSilently) {
return null
}
throw error;
})
}
function _getBingDailyClusterDefinitionsResponse(market, checkFREIfOffline, bypassCache) {
var market=market || NewsJS.Globalization.getMarketString(),
editorialMarket=NewsJS.Globalization.getMarketStringForEditorial(),
config={
providerType: "NewsApp.DataProviders.Azure.BingDailyClusterDefinitionsDataProvider", market: market.toUpperCase()
};
var args={};
if (bypassCache) {
args.bypassCache = true
}
var promises=[];
if (checkFREIfOffline && !NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection() && market === NewsJS.Globalization.getMarketString()) {
var todayConfig={
providerType: "NewsApp.DataProviders.CMS.DataProvider", market: editorialMarket, strategy: "checkFRE"
};
promises.push(PlatformJS.Utilities.createObject(todayConfig.providerType, todayConfig).request().then(function(results) {
return !results
}, function(error) {
return false
}))
}
promises.push(PlatformJS.Utilities.createObject(config.providerType, config).request(args).then(function(response) {
return response
}));
return WinJS.Promise.join(promises).then(function(promiseResults) {
if (promiseResults.length === 1) {
return promiseResults[0]
}
else {
var isTodayAvailable=promiseResults[0];
if (!isTodayAvailable || promiseResults[1].isLocalResponse) {
throw new Error("FREOffline");
}
return promiseResults[1]
}
})
}
function _buildDefaultClustersState(market, error) {
var market=market || NewsJS.Globalization.getMarketString();
if (NewsJS.Utilities.isFREOffline(error)) {
return WinJS.xhr({url: "ms-appx:///cannedData/FREOfflineClustersDefinition.json"}).then(function(results) {
return JSON.parse(results.response)
}, function(error) {
return _getMinimalState(market)
})
}
return _getDefaultClustersState(market).then(function(defaultClustersState) {
return {
editorialMarket: defaultClustersState.editorialMarket, clustersDefinition: defaultClustersState.clustersDefinition, clustersDeleted: []
}
}, function(error) {
return _getMinimalState(market)
})
}
function _readAndMergeDefinitionData(market, roamedResults, bypassCache, internationalEdition) {
return _getBingDailyClusterDefinitionsResponse(market, false, bypassCache).then(function(cloudResults) {
var cloudResultsHasData=cloudResults && cloudResults.data;
if (cloudResultsHasData) {
lastGoodRoamedState = nullRoamedState;
var mergedResults=_mergeResults(market, cloudResults.data.clustersDefinition, roamedResults.clustersDefinition, roamedResults.clustersDeleted);
var editorialMarket=cloudResults.data.editorialMarket ? cloudResults.data.editorialMarket : defaultEditorialMarket(market);
var editorIntended=NewsJS.StateHandler.instance.hasPulledPdpData && mergedResults.isCloudDifferentFromRoamed;
return _saveClusters(editorIntended, mergedResults.clustersDefinition, mergedResults.clustersDeleted, market, editorialMarket, internationalEdition)
}
else {
return WinJS.Promise.wrap(lastGoodRoamedState.state)
}
}).then(function(returnResults) {
Windows.Storage.ApplicationData.current.localSettings.values["BingDailyAlreadySynchedWithCloud"] = true;
return returnResults
})
}
function _readRoamedDefinitionData(market) {
if (PlatformJS.isDebug && NewsJS.StateHandler.instance.isPreviewModeEnabled) {
return WinJS.Promise.wrap({
clustersDefinition: [], clustersDeleted: []
})
}
var clusterState={
clustersDefinition: NewsJS.StateHandler.instance.getClustersDefinition(market), clustersDeleted: NewsJS.StateHandler.instance.getClustersDeleted(market)
};
return WinJS.Promise.wrap(clusterState).then(function(categories) {
lastGoodRoamedState = {
state: categories, market: market
};
return categories
})
}
function _createClusterDefinitionsMap(clusterDefinitions) {
var clusterDefinitionsMap={};
var clusterDefinitionsLength=0;
var clusterDefintionsIndex=0;
var cluster=null;
if (clusterDefinitions) {
clusterDefinitionsLength = clusterDefinitions.length;
for (clusterDefintionsIndex = 0; clusterDefintionsIndex < clusterDefinitionsLength; clusterDefintionsIndex++) {
cluster = clusterDefinitions[clusterDefintionsIndex];
if (cluster.guid) {
clusterDefinitionsMap[cluster.guid] = cluster
}
}
}
return clusterDefinitionsMap
}
function _createClusterKeysMap(clusterKeys) {
var clusterKeysLength=0;
var clusterKeysIndex=0;
var clusterKeysMap={};
var key;
if (clusterKeys) {
clusterKeysLength = clusterKeys.length;
for (clusterKeysIndex = 0; clusterKeysIndex < clusterKeysLength; clusterKeysIndex++) {
key = clusterKeys[clusterKeysIndex];
clusterKeysMap[key] = key
}
}
return clusterKeysMap
}
function _putHeroFirst(clusterDefinitions, heroIndex) {
var clusterDefLength=(clusterDefinitions ? clusterDefinitions.length : 0);
var clusterDefIndex=0;
var heroCluster=null;
if (clusterDefLength > 0 && !isHeroCluster(clusterDefinitions[0])) {
if (!heroIndex) {
for (clusterDefIndex = 0; clusterDefIndex < clusterDefLength; clusterDefIndex++) {
if (isHeroCluster(clusterDefinitions[clusterDefIndex])) {
break
}
}
}
heroCluster = clusterDefinitions.splice(heroIndex, 1)[0];
clusterDefinitions.unshift(heroCluster)
}
}
function _putAppendsLast(clusterDefinitions) {
var clusterDefIndex=0;
var clustersToAppend=[];
var cluster=null;
for (clusterDefIndex = 0; clusterDefIndex < clusterDefinitions.length; clusterDefIndex++) {
cluster = clusterDefinitions[clusterDefIndex];
if (cluster && cluster.append && clusterDefIndex < clusterDefinitions.length) {
clustersToAppend.push(clusterDefinitions.splice(clusterDefIndex, 1)[0])
}
}
NewsJS.Utilities.appendList(clusterDefinitions, clustersToAppend)
}
function _mergeCloudAndRoamedMaps(market, cloudClustersMap, cloudClusterIndexesMap, roamedClustersMap, roamedClusters, mustAddList, mustAppendList) {
var roamedClustersLength=roamedClusters.length;
var roamedClusterIndex=0;
var mergedClusters=[];
var cluster=null;
var clusterToAdd=cloudClustersMap["hero"] || roamedClustersMap["hero"];
var mustAddListStartingLength=mustAddList.length;
var numIter=0;
var inserted=false;
if (clusterToAdd) {
mergedClusters.push(clusterToAdd)
}
for (roamedClusterIndex = 0; roamedClusterIndex < roamedClustersLength; roamedClusterIndex++) {
cluster = roamedClusters[roamedClusterIndex];
if (!cluster.server || cloudClustersMap[cluster.guid]) {
clusterToAdd = cloudClustersMap[cluster.guid] || cluster;
if (!inserted) {
if (!isHeroCluster(clusterToAdd)) {
for (numIter = 0; (mustAddList.length > 0) && (numIter < mustAddListStartingLength); numIter++) {
if (cloudClusterIndexesMap[mustAddList[0].guid] <= mergedClusters.length) {
mergedClusters.push(mustAddList.shift())
}
else {
break
}
}
inserted = (mustAddList.length === 0)
}
}
if (!isHeroCluster(clusterToAdd)) {
mergedClusters.push(clusterToAdd)
}
}
else if (cluster && market) {
NewsJS.StateHandler.instance.removeCluster(market, cluster)
}
}
if (!inserted) {
NewsJS.Utilities.appendList(mergedClusters, mustAddList)
}
NewsJS.Utilities.appendList(mergedClusters, mustAppendList);
return mergedClusters
}
function _mergeResults(market, cloudDefinitions, roamedDefinitions, roamedDeletions) {
var mapCloudDefinitions={};
var mapCloudIndexes={};
var mapRoamedDeletions={};
var mapRoamedDefinitions={};
var mustAddList=[];
var mustAppendList=[];
var def=null;
var finalList=[];
var cloudDefIndex=0;
var cloudDefLength=cloudDefinitions.length;
var cloudHeroDefIndex=0;
var roamedDefLength=roamedDefinitions.length;
var roamedDefIndex=0;
var hasRoamedData=(roamedDefLength !== 0 || roamedDeletions.length !== 0);
var isCloudDifferentFromRoamed=false;
var numHiddenClusters=0;
if (cloudDefLength > 0 && !hasRoamedData) {
_putHeroFirst(cloudDefinitions);
return {
clustersDefinition: cloudDefinitions, clustersDeleted: [], isCloudDifferentFromRoamed: true
}
}
mapRoamedDeletions = _createClusterDefinitionsMap(roamedDeletions);
mapRoamedDefinitions = _createClusterDefinitionsMap(roamedDefinitions);
for (cloudDefIndex = 0; cloudDefIndex < cloudDefLength; cloudDefIndex++) {
def = cloudDefinitions[cloudDefIndex];
if (isHeroCluster(def)) {
cloudHeroDefIndex = cloudDefIndex
}
if (!def.append) {
mapCloudIndexes[def.guid] = cloudDefIndex
}
mapCloudDefinitions[def.guid] = def;
if (!mapRoamedDeletions[def.guid] && !mapRoamedDefinitions[def.guid] && !def.hidden) {
if (def.append) {
mustAppendList.push(def)
}
else {
mustAddList.push(def)
}
isCloudDifferentFromRoamed = true
}
if (def.hidden) {
numHiddenClusters++
}
}
isCloudDifferentFromRoamed = isCloudDifferentFromRoamed || cloudDefLength - numHiddenClusters < roamedDefLength + roamedDeletions.length;
finalList = _mergeCloudAndRoamedMaps(market, mapCloudDefinitions, mapCloudIndexes, mapRoamedDefinitions, roamedDefinitions, mustAddList, mustAppendList);
return {
clustersDefinition: finalList, clustersDeleted: roamedDeletions, isCloudDifferentFromRoamed: isCloudDifferentFromRoamed
}
}
function _saveRoamingOrPrepareFRE(clustersState, market, internationalEdition) {
if (clustersState && clustersState.clustersDefinition && clustersState.clustersDefinition.length) {
var clustersDefinition=clustersState.clustersDefinition;
if (clustersState.isMinimal || clustersDefinition[0].isFREOffline) {
var editorialMarket=NewsJS.Globalization.getMarketStringForEditorial();
if (clustersDefinition[0].isFREOffline && editorialMarket === market) {
CommonJS.disableAllEdgies(true);
NewsJS.Utilities.removeSearchBox()
}
if (clustersDefinition[0].providerConfiguration && !clustersDefinition[0].providerConfiguration.market) {
clustersDefinition[0].providerConfiguration.market = defaultEditorialMarket(market)
}
return WinJS.Promise.wrap(clustersState)
}
else {
if (!PlatformJS.isDebug || !NewsJS.StateHandler.instance.isPreviewModeEnabled) {
var filteredClusters=[];
for (var i=0, ilen=clustersState.clustersDefinition.length; i < ilen; i++) {
var clusterDefinition=clustersState.clustersDefinition[i];
if (clusterDefinition && !clusterDefinition.hidden) {
filteredClusters.push(clusterDefinition)
}
}
clustersState.clustersDefinition = filteredClusters
}
if (!internationalEdition) {
for (var i=0; i < clustersState.clusterDefinitions.length; i++) {
NewsJS.StateHandler.instance.addCluster(market, i, clustersState.clusterDefinitions[i])
}
}
return WinJS.Promise.wrap(null)
}
}
else {
return WinJS.Promise.wrap(null)
}
}
function _saveClusters(intended, clusterDefinitions, clustersDeleted, market, editorialMarket, internationalEdition) {
var market=market || NewsJS.Globalization.getMarketString();
var fileData={
clustersDefinition: clusterDefinitions, clustersDeleted: clustersDeleted
};
if (editorialMarket) {
fileData.editorialMarket = editorialMarket
}
lastGoodRoamedState = {
state: fileData, market: market
};
if (clusterDefinitions && clusterDefinitions.length && (clusterDefinitions[0].isFREOffline || clusterDefinitions[0].isMinimal)) {
if (fileData.clustersDefinition[0].providerConfiguration && !fileData.clustersDefinition[0].providerConfiguration.market) {
fileData.clustersDefinition[0].providerConfiguration.market = editorialMarket
}
return WinJS.Promise.wrap(fileData)
}
if (internationalEdition) {
return WinJS.Promise.wrap(fileData)
}
if (clusterDefinitions && clusterDefinitions.length > 0) {
if (intended) {
NewsJS.StateHandler.instance.updateClustersUI(market, clusterDefinitions)
}
else {
NewsJS.StateHandler.instance.updateClusters(market, clusterDefinitions)
}
}
if (clustersDeleted && clustersDeleted.length > 0) {
if (intended) {
NewsJS.StateHandler.instance.removeClustersUI(market, clustersDeleted)
}
else {
NewsJS.StateHandler.instance.removeClusters(market, clustersDeleted)
}
}
var fileData={
clustersDefinition: clusterDefinitions, clustersDeleted: clustersDeleted
};
lastGoodRoamedState = {
state: fileData, market: market
};
return WinJS.Promise.wrap(fileData)
}
function _differentClusters(currentClusters, newClusters) {
if (!currentClusters || !newClusters || currentClusters.length !== newClusters.length) {
return true
}
for (var i=0; i < currentClusters.length; i++) {
if (currentClusters[i].guid !== newClusters[i].guid) {
return true
}
}
return false
}
function _isClusterPresent(state, clusterType, providerType, callback) {
var clusterDefinitions=state.clustersDefinition;
for (var i=0; clusterDefinitions && i < clusterDefinitions.length; i++) {
var clusterDefinition=clusterDefinitions[i];
if (clusterDefinition.clusterType === clusterType && clusterDefinition.providerConfiguration && clusterDefinition.providerConfiguration.providerType === providerType && callback && callback(clusterDefinition)) {
return true
}
}
return false
}
WinJS.Namespace.define("NewsApp.PersonalizationManager", {
ReleaseNumber: {
MARCH_2013: 201303, JUNE_2013: 201306
}, synchronizeAfterCustomization: synchronizeAfterCustomization, getDefaultClusters: getDefaultClusters, getClusterDefinitions: getClusterDefinitions, getClusterDefinitionsState: getClusterDefinitionsState, addClusterDefinition: addClusterDefinition, removeClusterDefinition: removeClusterDefinition, applyClusterAdditionsAndDeletions: applyClusterAdditionsAndDeletions, isUnknownCluster: _shouldFilterCluster, isHeroCluster: isHeroCluster, isTempCluster: isTempCluster, isSourcesCluster: isSourcesCluster, isNextStepsCluster: isNextStepsCluster, isTopicFollowed: isTopicFollowed, isCategoryFollowed: isCategoryFollowed, isInternationalEditionFollowed: isInternationalEditionFollowed, isSourceFollowed: isSourceFollowed, createTopicUserSection: createTopicUserSection, createInternationalEditionUserSection: createInternationalEditionUserSection, createSourceSection: createSourceSection, getDefaultClusterDefinition: getDefaultClusterDefinition
})
})()