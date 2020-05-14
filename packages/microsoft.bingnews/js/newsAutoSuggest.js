/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var suggestionsLabel=null;
var allSuggestions=[];
var sourceSuggestionTagPrefix="source:";
var topicSuggestionTagPrefix="topic:";
var categorySuggestionTagPrefix="category:";
var internationalEditionSuggestionTagPrefix="intled:";
var defaultTopicImage="ms-appx:///images/logoTopic.contrast-white_scale-80.png";
var defaultSourceImage="ms-appx:///images/defaultSource.png";
var defaultInternationalSourceImage="ms-appx:///images/logoSource.contrast-white_scale-80.png";
var defaultCategoryImage="ms-appx:///images/logoCategory.contrast-white_scale-80.png";
function findMatchingEntities(entityArray, queryText, marketString) {
return findMatchingEntitiesUsingPartialMatch(entityArray, queryText)
}
function isDuplicate(result, entity) {
if (result && entity) {
for (var idxPreviousMatch=0; idxPreviousMatch < result.length; idxPreviousMatch++) {
var anEntity=result[idxPreviousMatch].entity;
if (anEntity && anEntity.displayname === entity.displayname && anEntity.sourcedescription === entity.sourcedescription) {
console.log("match skipped as duplicate");
return true
}
}
}
return false
}
function findMatchingEntitiesUsingPartialMatch(entityArray, queryText, matchDisplayName, convert) {
var result=[];
if (entityArray && queryText) {
var queryCompareText=queryText.toLocaleLowerCase();
for (var idxEntity=0; idxEntity < entityArray.length; idxEntity++) {
var entity=entityArray[idxEntity];
var entityTitle=entity.displayname.toLocaleLowerCase();
var entityCompareTitle=entity.alpha.toLocaleLowerCase();
if (!matchDisplayName && (queryCompareText === entityCompareTitle || queryCompareText === entityTitle || entityCompareTitle.indexOf(queryCompareText) >= 0) || entityTitle.indexOf(queryCompareText) >= 0) {
if (isDuplicate(result, entity)) {
continue
}
console.log("found match for" + queryText);
if (convert) {
result.push(convert(entity))
}
else {
result.push({entity: entity})
}
}
}
}
return result
}
function updateStateOnSourceVisited(source) {
NewsJS.Utilities.updateStateOnSourceVisited(source.id, NewsJS.Globalization.getMarketString())
}
function onResultSuggestionChosen(e) {
var source=JSON.parse(e.tag);
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.searchCharm);
NewsJS.Utilities.navigateToSource(source, updateStateOnSourceVisited, "searchcharm")
}
function suggestionsRequested(e) {
var query=e.queryText;
var suggestions=e.request.searchSuggestionCollection;
var deferral=e.request.getDeferral();
msWriteProfilerMark("NewsApp:Autosuggest:getAlgo:s");
var marketString=null;
try {
marketString = NewsJS.Globalization.getMarketStringForAutosuggest()
}
catch(error) {
msWriteProfilerMark("NewsApp:Autosuggest:getAlgo:e");
deferral.complete();
return
}
return NewsJS.Utilities.readSources().then(function() {
return marketString.length > 0 ? NewsJS.Data.Bing.getQuerySuggestions(query, marketString) : WinJS.Promise.wrap({dataObjectList: {size: 0}})
}).then(function(results) {
msWriteProfilerMark("NewsApp:Autosuggest:getAlgo:e");
var resultsArray=[];
for (var i=0; i < results.dataObjectList.size; i++) {
resultsArray.push(results.dataObjectList.getAt(i))
}
var sourcesDataset=NewsJS.StateHandler.instance.allSources;
var resultSuggestionAppended=false;
if (query.length >= 3 && sourcesDataset && sourcesDataset.length > 0) {
var matches=findMatchingEntities(sourcesDataset, query, marketString);
if (matches) {
for (var j=0; j < matches.length; j++) {
var result=matches[j].entity;
if (!News.NewsUtil.instance.isDomainBlockListed(result.title)) {
var imageUrl=(result.win8_image && result.win8_image.length > 0) ? result.win8_image : defaultSourceImage;
var imageUri=new Windows.Foundation.Uri(imageUrl);
var imageSource=Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(imageUri);
suggestions.appendResultSuggestion(result.displayname, result.sourcedescription, JSON.stringify(result), imageSource, result.displayname);
resultSuggestionAppended = true
}
}
}
}
if (resultSuggestionAppended) {
if (!suggestionsLabel) {
suggestionsLabel = PlatformJS.Services.resourceLoader.getString("Suggestions")
}
suggestions.appendSearchSeparator(suggestionsLabel)
}
suggestions.appendQuerySuggestions(resultsArray);
deferral.complete()
}, function() {
msWriteProfilerMark("NewsApp:Autosuggest:getAlgo:e");
deferral.complete()
})
}
function _processBingSuggestions(results) {
var suggestions=[];
if (results) {
var queryLimit=Math.min(5, results.dataObjectList.size);
var suggestionsLabel=queryLimit > 0 ? PlatformJS.Services.resourceLoader.getString("Topic") : null;
var imageUri=new Windows.Foundation.Uri(defaultTopicImage);
var image=Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(imageUri);
var list=results.dataObjectList;
for (var i=0; i < queryLimit; i++) {
var text=list.getAt(i);
suggestions.push(new CommonJS.Search.SearchSuggestion(CommonJS.Search.SearchSuggestion.SearchResultTypes.RESULT, text, suggestionsLabel, topicSuggestionTagPrefix + text, image, text))
}
}
return WinJS.Promise.wrap(suggestions)
}
function findPartiallyMatchingFeaturedSources(featuredSources, searchText, market, onFeaturedSourceFound) {
if (searchText.length >= 3 && featuredSources && featuredSources.length > 0) {
var matches=findMatchingEntities(featuredSources, searchText, market);
if (matches) {
var sourceLimit=Math.min(3, matches.length);
for (var j=0; j < matches.length; j++) {
var result=matches[j].entity;
if (!News.NewsUtil.instance.isDomainBlockListed(result.title)) {
onFeaturedSourceFound(result)
}
}
}
}
}
function _processFeatureSourcesSuggestions(searchText, market) {
var suggestionsLabel;
var suggestions=[];
findPartiallyMatchingFeaturedSources(NewsJS.StateHandler.instance.allSources, searchText, market, function(result) {
if (!suggestionsLabel) {
suggestionsLabel = PlatformJS.Services.resourceLoader.getString("Source")
}
var sourceImageUrl=(result.win8_image && result.win8_image.length > 0) ? result.win8_image : defaultSourceImage;
var sourceImageUri=new Windows.Foundation.Uri(sourceImageUrl);
var sourceImage=Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(sourceImageUri);
var suggestionTag=sourceSuggestionTagPrefix + JSON.stringify(result);
suggestions.push(new CommonJS.Search.SearchSuggestion(CommonJS.Search.SearchSuggestion.SearchResultTypes.RESULT, result.displayname, suggestionsLabel, suggestionTag, sourceImage, result.displayname))
});
return WinJS.Promise.wrap(suggestions)
}
function findPartiallyMatchingInternationalSources(response, searchText, onInternationalSourceFound) {
if (searchText && searchText.length >= 3 && response && response.dataString) {
var jsonResponse=JSON.parse(response.dataString);
var clusters=jsonResponse.clusters;
var clusterCount=clusters.length;
for (var i=0; i < clusterCount; i++) {
var entityList=clusters[i].entityList;
if (entityList && entityList.categoryName) {
if (entityList.categoryName.toLocaleLowerCase().indexOf(searchText) >= 0) {
onInternationalSourceFound(entityList)
}
}
}
}
}
function _processInternationalSourceSuggestion(searchText, response) {
var imageUri;
var image;
var suggestionsLabel;
var suggestions=[];
findPartiallyMatchingInternationalSources(response, searchText, function(entityList) {
if (!suggestionsLabel) {
suggestionsLabel = PlatformJS.Services.resourceLoader.getString("InternationalEdition");
imageUri = new Windows.Foundation.Uri(defaultInternationalSourceImage);
image = Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(imageUri)
}
var regionName=entityList.categoryName;
var tag=internationalEditionSuggestionTagPrefix + entityList.collectionId;
suggestions.push(new CommonJS.Search.SearchSuggestion(CommonJS.Search.SearchSuggestion.SearchResultTypes.RESULT, regionName, suggestionsLabel, tag, image, regionName))
});
return WinJS.Promise.wrap(suggestions)
}
function findPartiallyMatchingCategories(searchText, onCategoryFound) {
if (searchText && searchText.length >= 3) {
var configCategories=PlatformJS.Services.appConfig.getList("CategoriesForMarket");
if (configCategories && configCategories.length) {
var length=configCategories.length;
for (var i=0; i < length; i++) {
var categoryInfo=configCategories[i];
var catName=categoryInfo["Category"].value;
var catKey=categoryInfo["CategoryKey"].value;
var normalizedName=catName.toLocaleLowerCase();
if (normalizedName.indexOf(searchText) >= 0) {
onCategoryFound({
categoryKey: catKey, category: catName
})
}
}
}
}
}
function _getCategorySuggestions(searchText) {
var suggestions=[];
var imageUri;
var image;
var suggestionsLabel;
findPartiallyMatchingCategories(searchText, function(catInfo) {
if (!suggestionsLabel) {
imageUri = new Windows.Foundation.Uri(defaultCategoryImage);
image = Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(imageUri);
suggestionsLabel = PlatformJS.Services.resourceLoader.getString("Category")
}
var tag=categorySuggestionTagPrefix + JSON.stringify(catInfo);
suggestions.push(new CommonJS.Search.SearchSuggestion(CommonJS.Search.SearchSuggestion.SearchResultTypes.RESULT, catInfo.category, suggestionsLabel, tag, image, catInfo.category))
});
return suggestions
}
function getSearchSuggestionDataProvider() {
return {getSuggestionsAsync: function getSuggestionsAsync(searchText, searchLanguage) {
if (!PlatformJS.isPlatformInitialized) {
return WinJS.Promise.wrap([])
}
var marketString=null;
try {
marketString = NewsJS.Globalization.getMarketStringForAutosuggest()
}
catch(error) {
return WinJS.Promise.wrap([])
}
searchText = searchText.toLocaleLowerCase();
var processInternationalSourcesPromise=NewsJS.Utilities.fetchInternationalSources(marketString).then(function onFetchInternationalSourcesComplete(response) {
return _processInternationalSourceSuggestion(searchText, response)
});
var processFeaturedSourcesPromise=NewsJS.Utilities.readSources().then(function onReadSourcesComplete() {
return _processFeatureSourcesSuggestions(searchText, marketString)
});
var processBingSuggestionsPromise=marketString.length > 0 ? NewsJS.Data.Bing.getQuerySuggestions(searchText, marketString).then(function onGetQuerySuggestionsComplete(results) {
return _processBingSuggestions(results)
}) : WinJS.Promise.wrap({dataObjectList: {size: 0}});
allSuggestions = [];
return processFeaturedSourcesPromise.then(function onProcessFeaturedSourcesComplete(results) {
allSuggestions = allSuggestions.concat(results);
return processBingSuggestionsPromise
}).then(function onProcessBingSuggestionsComplete(results) {
allSuggestions = allSuggestions.concat(results);
return processInternationalSourcesPromise
}).then(function onProcessInternationalSourcesComplete(results) {
allSuggestions = allSuggestions.concat(results);
allSuggestions = allSuggestions.concat(_getCategorySuggestions(searchText));
return WinJS.Promise.wrap(allSuggestions)
})
}}
}
function searchHandler(event) {
allSuggestions = [];
NewsJS.Utilities.navigateToSearchPano(event.detail.query, true)
}
function suggestionHandler(event) {
allSuggestions = [];
var tag=event.detail.tag;
if (tag.indexOf(sourceSuggestionTagPrefix) === 0) {
tag = tag.substring(sourceSuggestionTagPrefix.length);
var source=JSON.parse(tag);
NewsJS.Telemetry.Search.recordAutosuggestPress(source.id, NewsJS.Telemetry.String.ActionContext.sources);
NewsJS.Utilities.navigateToSource(source, updateStateOnSourceVisited, "InAppSearch")
}
else if (tag.indexOf(topicSuggestionTagPrefix) === 0) {
var query=tag.substring(topicSuggestionTagPrefix.length);
NewsJS.Telemetry.Search.recordAutosuggestPress(query, NewsJS.Telemetry.String.ActionContext.topics);
NewsJS.Utilities.navigateToSearchPano(query, false)
}
else if (tag.indexOf(categorySuggestionTagPrefix) === 0) {
tag = tag.substring(categorySuggestionTagPrefix.length);
var categoryInfo=JSON.parse(tag);
NewsJS.Telemetry.Search.recordAutosuggestPress(categoryInfo.categoryKey, NewsJS.Telemetry.String.ActionContext.categories);
NewsJS.Utilities.navigateToCategory(categoryInfo.category, categoryInfo.categoryKey)
}
else if (tag.indexOf(internationalEditionSuggestionTagPrefix) === 0) {
tag = tag.substring(internationalEditionSuggestionTagPrefix.length);
NewsJS.Telemetry.Search.recordAutosuggestPress(tag, NewsJS.Telemetry.String.ActionContext.internationalEditions);
NewsJS.Utilities.navigateToInternationalEdition(tag)
}
}
WinJS.Namespace.define("NewsJS.Autosuggest", {
suggestionsRequested: suggestionsRequested, onResultSuggestionChosen: onResultSuggestionChosen, findMatchingEntitiesUsingPartialMatch: findMatchingEntitiesUsingPartialMatch, getSearchSuggestionDataProvider: getSearchSuggestionDataProvider, searchHandler: searchHandler, suggestionHandler: suggestionHandler, findPartiallyMatchingFeaturedSources: findPartiallyMatchingFeaturedSources, findPartiallyMatchingCategories: findPartiallyMatchingCategories, findPartiallyMatchingInternationalSources: findPartiallyMatchingInternationalSources
})
})()