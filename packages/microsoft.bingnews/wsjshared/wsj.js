/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var partner="WSJ";
var dateFormatting=Windows.Globalization.DateTimeFormatting;
WinJS.Namespace.define("WSJJS", {
MarketData: WinJS.Class.define(function(element, options) {
this.element = element || document.createElement("div");
this.element.winControl = this;
WinJS.Utilities.addClass(this.element, "marketData");
WinJS.UI.setOptions(this, options);
this._quoteUrl = CommonJS.Partners.Config.getConfig(partner, "QuotesUrl", "");
this._refreshInterval = CommonJS.Partners.Config.getConfig(partner, "QuotesRefreshInterval", 60);
this._token = CommonJS.Partners.Config.getConfig(partner, "QuotesToken", "");
var symbols=CommonJS.Partners.Config.getConfig(partner, "QuotesSymbols", []);
this.symbols = [];
for (var i=0; i < symbols.size; i++) {
this.symbols.push(symbols[i].value)
}
this._timer = null;
this.container = document.createElement("div");
WinJS.Utilities.addClass(this.container, "container");
this.element.appendChild(this.container);
var getQuote=document.createElement("button");
getQuote.textContent = PlatformJS.Services.resourceLoader.getString("/wsj/GetQuote");
WinJS.Utilities.addClass(getQuote, "quoteButton");
var that=this;
getQuote.onclick = function() {
window.open(that._quoteUrl)
};
this.element.appendChild(getQuote);
this.fetch()
}, {
symbols: [], update: function update(dataString) {
var that=this;
this.container.innerHTML = "";
var xml=new Windows.Data.Xml.Dom.XmlDocument;
var xmlLoadSettings=new Windows.Data.Xml.Dom.XmlLoadSettings;
xmlLoadSettings.prohibitDtd = true;
xmlLoadSettings.resolveExternals = false;
xml.loadXml(dataString, xmlLoadSettings);
var nodes=xml.selectNodes("//InstrumentMatch");
for (var i=0; i < nodes.size; i++) {
var node=nodes.getAt(i);
var ticker=node.selectSingleNode(".//Ticker");
var price=node.selectSingleNode(".//Last/Price/Value");
if (ticker && price) {
var tickerSpan=document.createElement("span");
var priceSpan=document.createElement("span");
WinJS.Utilities.addClass(tickerSpan, "ticker");
WinJS.Utilities.addClass(priceSpan, "price");
tickerSpan.innerText = ticker.innerText;
priceSpan.innerText = price.innerText;
this.container.appendChild(tickerSpan);
this.container.appendChild(priceSpan)
}
}
}, _timer: null, resetTimer: function resetTimer() {
if (this._timer) {
clearTimeout(this._timer);
this._timer = null
}
}, scheduleNextRefresh: function scheduleNextRefresh() {
var that=this;
this._timer = setTimeout(function() {
that.resetTimer();
that.fetch()
}, this._refreshInterval)
}, dispose: function dispose() {
this.resetTimer()
}, fetch: function fetch() {
var queryService=new PlatformJS.DataService.QueryService("WSJ.Quotes"),
params=PlatformJS.Collections.createStringDictionary(),
options=new Platform.DataServices.QueryServiceOptions,
symbols=this.symbols.join(",");
options.requestHeaders.insert("Dylan2010.EntitlementToken", this._token);
options.bypassCache = false;
params.insert("symbols", symbols);
params.insert("key", this._token.substring(0, 10));
var quotes=null,
that=this;
return queryService.downloadDataAsync(params, null, null, options).then(function(response) {
if (!quotes || !response.isCachedResponse) {
quotes = response.dataString;
that.update(quotes)
}
that.scheduleNextRefresh()
}, function(error) {
that.scheduleNextRefresh()
}, function(progress) {
if (progress.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryFound && progress.cachedResponse) {
quotes = progress.cachedResponse.dataString;
that.update(quotes)
}
})
}
}), Formatter: WinJS.Class.define(function() {
this._dateFormat = new dateFormatting.DateTimeFormatter(dateFormatting.YearFormat.full, dateFormatting.MonthFormat.abbreviated, dateFormatting.DayFormat.default, dateFormatting.DayOfWeekFormat.none);
this._timeFormat = new dateFormatting.DateTimeFormatter(dateFormatting.HourFormat.default, dateFormatting.MinuteFormat.default, dateFormatting.SecondFormat.none)
}, {
_dateFormat: null, _timeFormat: null, getDateString: function getDateString(timestamp) {
try {
return this._dateFormat.format(new Date(timestamp))
}
catch(e) {
return ""
}
}, getTimeString: function getTimeString(timestamp) {
try {
return this._timeFormat.format(new Date(timestamp))
}
catch(e) {
return ""
}
}, parseTime: function parseTime(dateString) {
var timestamp=Date.parse(dateString) / 1000,
year=null,
month=null,
day=null,
hour=null,
minute=null;
if (isNaN(timestamp) && (typeof dateString === "string")) {
var dateTime=dateString.split(" ");
if (dateTime[0]) {
var date=dateTime[0].split("-");
if (date.length >= 3) {
year = parseInt(date[0]);
month = parseInt(date[1]);
day = parseInt(date[2])
}
}
if (dateTime[1]) {
var time=dateTime[1].split(":");
if (time.length >= 2) {
hour = parseInt(time[0]);
minute = parseInt(time[1])
}
}
if (year !== null && month !== null && day !== null && hour !== null && minute !== null) {
var newDateString=[month, "/", day, "/", year, " ", hour, ":", minute, " EDT"].join("");
var dateObj=new Date(newDateString);
timestamp = dateObj.getTime() / 1000
}
}
return timestamp
}, formatTime: function formatTime(dateString, formatType) {
var now=Date.now(),
timestamp=this.parseTime(dateString);
if (isNaN(timestamp)) {
return ""
}
var delta=now / 1000 - timestamp,
time=new Date(timestamp * 1000);
if (formatType === WSJJS.Formatter.panoWatermark) {
return this._dateFormat.format(time) + " " + this._timeFormat.format(time)
}
else if (formatType === WSJJS.Formatter.articleFormat) {
var formattedDate=this._dateFormat.format(time);
if (this._dateFormat.format(new Date) === formattedDate) {
return this._timeFormat.format(time)
}
else if (delta < 6 * 60 * 60) {
return this._timeFormat.format(time)
}
else {
return formattedDate
}
}
else {
return this._dateFormat.format(time) + " " + this._timeFormat.format(time)
}
}
}, {
other: 0, tileFormat: 1, panoWatermark: 2, articleFormat: 3, _instance: null, instance: {get: function get() {
if (!WSJJS.Formatter._instance) {
WSJJS.Formatter._instance = new WSJJS.Formatter
}
return WSJJS.Formatter._instance
}}
}), AuthControl: WinJS.Class.derive(NewsJS.Partners.BaseNativeAuthControl, function wsj_auth_ctrl_ctor(options) {
this._partner = partner;
NewsJS.Partners.BaseNativeAuthControl.call(this, options);
var subscribeInstructions=document.createElement("div");
subscribeInstructions.innerText = PlatformJS.Services.resourceLoader.getString("/wsj/SubscribeNow");
this.customContainer.appendChild(subscribeInstructions);
WinJS.Utilities.addClass(subscribeInstructions, "subscribeInstructions");
var subscribeInfo=document.createElement("div");
subscribeInfo.innerHTML = PlatformJS.Services.resourceLoader.getString("/wsj/subscribeInfo");
this.customContainer.appendChild(subscribeInfo);
WinJS.Utilities.addClass(subscribeInfo, "subscribeInfo")
}, {
_onCreateAccountClick: function _onCreateAccountClick() {
var url=CommonJS.Partners.Config.getConfig(partner, "CreateAccountUrl");
window.open(url)
}, _onForgotPasswordClick: function _onForgotPasswordClick() {
var url=CommonJS.Partners.Config.getConfig(partner, "ForgotPasswordUrl");
window.open(url)
}, _onPrivacyPolicyClick: function _onPrivacyPolicyClick() {
var url=CommonJS.Partners.Config.getConfig(partner, "PrivacyStatementLink");
window.open(url)
}, _onTOUClick: function _onTOUClick() {
var url=CommonJS.Partners.Config.getConfig(partner, "TermsOfUseLink");
window.open(url)
}, validateAsync: function validateAsync(userName, password) {
if (!userName || !password) {
return WinJS.Promise.wrapError(PlatformJS.Services.resourceLoader.getString("/wsj/credentialsInvalid"))
}
var url=CommonJS.Partners.Config.getConfig(partner, "AuthUrl", "https://iwap.wsj.com/iphone/role?username={0}&password={1}");
url = url.format(encodeURIComponent(userName), encodeURIComponent(password));
return WinJS.xhr({
url: url, type: "GET"
}).then(function(response) {
if (response.status === 200) {
var xml=response.responseXML;
if (xml) {
var description=xml.querySelector("description");
if (description && description.textContent === "Precondition Failure") {
var error=xml.querySelector("value");
if (error) {
return WinJS.Promise.wrapError(error.textContent)
}
else {
return WinJS.Promise.wrapError(PlatformJS.Services.resourceLoader.getString("/wsj/credentialsInvalid"))
}
}
}
return WinJS.Promise.wrap(xml)
}
else {
return WinJS.Promise.wrapError(PlatformJS.Services.resourceLoader.getString("/wsj/credentialsInvalid"))
}
})
}, _replaceText: function _replaceText(className, newText) {
newText = PlatformJS.Services.resourceLoader.getString("/wsj/" + newText);
if (className && this.container) {
var elements=WinJS.Utilities.query(className, this.container);
if (elements && elements[0] && elements[0].tagName) {
switch (elements[0].tagName.toUpperCase()) {
case"DIV":
case"BUTTON":
elements[0].innerText = newText;
break;
case"INPUT":
elements[0].placeholder = newText;
break
}
}
}
}
}), ProcessListener: WinJS.Class.derive(NewsJS.Partners.BaseProcessListener, function wsj_processListener_ctor() {
this._partner = partner;
NewsJS.Partners.BaseProcessListener.call(this);
PlatformJS.Utilities.addAppexUriScheme("wallstreetjournal");
PlatformJS.Navigation.addDefaultController()
}, {
onActivated: function onActivated(event, isRecoveryMode) {
NewsJS.Partners.Theme.defaultTheme = "WSJ";
return NewsJS.Partners.BaseProcessListener.prototype.onActivated.call(this, event, isRecoveryMode)
}, handleProtocolLaunch: function handleProtocolLaunch(event) {
var arg=event.detail.uri;
var result=NewsJS.Utilities.parseUri(arg);
return NewsJS.Utilities.processProtocolLaunch(result)
}
}, {
channelListAvailable: false, processNewChannels: function processNewChannels(latestFeed, isCachedResponse) {
if (!WSJJS.ProcessListener.channelListAvailable || !isCachedResponse) {
WSJJS.ProcessListener.channelListAvailable = true
}
}
}), ArticleManager: WinJS.Class.derive(NewsJS.Partners.ArticleManager, function articleManager_ctor() {
this._latest = null;
this._partner = partner;
this._articlePrefix = CommonJS.Partners.Config.getConfig(partner, "ArticlePrefix", "http://online.wsj.com/article/");
this._initialized = false;
this._sectionsMap = {}
}, {
_latest: null, _initialized: false, _listContains: function _listContains(list, value) {
for (var i=0; i < list.length; i++) {
if (list[i].value === value) {
return true
}
}
return false
}, edition: {
get: function get() {
return "edition_us"
}, set: function set(value) {
if (value !== this._edition) {
this._edition = value;
this._latest = null;
CommonJS.Partners.Config.setConfig(partner, WSJJS.ArticleManager.currentEdition, value);
PlatformJS.Navigation.mainNavigator.returnHomeAndClearHistoryIfNecessary(true)
}
}
}, initializeAsync: function initializeAsync(config) {
return WinJS.Promise.wrap()
}, serializeAsync: function serializeAsync() {
return WinJS.Promise.wrap()
}, resetAsync: function resetAsync() {
return WinJS.Promise.wrap()
}, _imagePrefix: null, getLatestAsync: function getLatestAsync(bypassCache) {
var that=this;
if (this._initialized) {
return that._getLatestAsync(bypassCache)
}
else {
return this.initializeAsync(null).then(function() {
return that._getLatestAsync(bypassCache)
})
}
}, _getLatestAsync: function _getLatestAsync(bypassCache) {
var config=this.getFeeds(),
i=0;
if (!this._latest) {
this._latest = {sections: []};
for (i = 0; i < config.size; i++) {
var title=PlatformJS.Services.resourceLoader.getString("/wsj/" + WSJJS.ArticleManager.getSectionTitle(config[i].Identifier.value));
this._latest.sections.push({
sectionName: config[i].Identifier.value, fullfeed: config[i].Feed.value, title: title, feedType: config[i].Type ? config[i].Type.value : "section", pinTitle: config[i].Type && config[i].Type.value === "WSJ.GetVideoSection" ? PlatformJS.Services.resourceLoader.getString("/wsj/VideoTitleFormat").format(title) : null
})
}
for (i = 0; i < this._latest.sections.length; i++) {
this._sectionsMap[this._latest.sections[i].sectionName] = this._latest.sections[i]
}
}
return WinJS.Promise.wrap(this._latest)
}, getFeedInfo: function getFeedInfo(feedType, feedIdentifierValue) {
var category=this._sectionsMap[feedIdentifierValue];
return category
}, getFeedInfoAsync: function getFeedInfoAsync(feedType, feedIdentifierValue, bypassCache) {
var that=this;
return that.getLatestAsync(bypassCache).then(function(latest) {
if (feedIdentifierValue === "WSJ LIVE") {
return WinJS.Promise.wrap({
feedType: feedType, sectionName: feedIdentifierValue, title: PlatformJS.Services.resourceLoader.getString("/wsj/WSJ LIVE")
})
}
var category=that.getFeedInfo(feedType, feedIdentifierValue);
if (feedIdentifierValue === "LEADERSHIP VIDEO") {
category.queryServiceName = "WSJ.GetVideoSubSection"
}
if (category) {
return WinJS.Promise.wrap(category)
}
else {
return WinJS.Promise.wrapError("Unable to find feed info")
}
})
}, normalizeGuid: function normalizeGuid(url) {
var articlePrefix="http://.*/article/";
if (url.search(articlePrefix) === 0) {
var urlObj=new Windows.Foundation.Uri(url);
var path=urlObj.path;
path = path.replace("/article/", "");
path = path.replace(".html", "");
return path
}
else {
return encodeURI(url)
}
}, _removeArticleFromList: function _removeArticleFromList(guidList, guid) {
for (var i=0; i < guidList.length; i++) {
if (guidList[i].articleId === guid) {
guidList.splice(i, 1);
return
}
}
}, _parseFullFeed: function _parseFullFeed(dataString, feedIdentifierValue, feedType) {
var data=null,
that=this;
try {
var jsonString=Platform.Utilities.Helpers.convertXmlToJsonString(dataString);
data = JSON.parse(jsonString)
}
catch(e) {}
if (!data) {
return null
}
var feedItems=data.rss.channel.item;
var articles=feedItems || [];
var articleMap={};
var guidList=[],
i=0;
for (i = 0; i < articles.length; i++) {
var article=articles[i];
article.access = feedType === "WSJ.GetVideoSection" ? "anonymous" : "subscribed";
if (typeof(article.category) === "string") {
article.access = article.category === "FREE" ? "anonymous" : "subscribed"
}
else if (article.category && article.category.domain === "AccessClassName") {
article.access = article.category.value === "PAID" ? "subscribed" : "anonymous"
}
else if (feedType === "WSJ.GetVideoSection") {
article.access = "anonymous"
}
article.guid = this.normalizeGuid(article.link);
guidList.push({
headline: article.title, articleId: article.guid, access: article.access, timestamp: new Date(article.pubDate).getTime()
});
if (i === 0 && !data.rss.channel.lastBuildDate) {
data.rss.channel.lastBuildDate = article.pubDate
}
}
var finalList=[];
var videoList=[];
for (i = 0; i < articles.length; i++) {
var feedItem=articles[i];
var thumbnail=null;
var video=null;
if (feedItem.content) {
thumbnail = feedItem.content
}
if (feedItem.group) {
if (feedItem.group.thumbnail && feedItem.group.thumbnail.length > 0 && feedItem.group.thumbnail[0].url && feedItem.group.thumbnail[0].height && feedItem.group.thumbnail[0].width) {
thumbnail = feedItem.group.thumbnail[0]
}
if (feedItem.group.content && feedItem.group.content.length > 0 && feedItem.group.content[0].url) {
video = feedItem.group.content[0]
}
}
var scaling=0;
if (thumbnail) {
if (thumbnail.height && thumbnail.width) {
thumbnail.height = parseInt(thumbnail.height);
thumbnail.width = parseInt(thumbnail.width)
}
else {
thumbnail.height = 369;
thumbnail.width = 553
}
}
if (thumbnail && thumbnail.width >= 480 && thumbnail.width < 610) {
scaling = 610 / thumbnail.width;
thumbnail.width *= scaling;
thumbnail.height *= scaling
}
if (thumbnail && thumbnail.height >= 340 && thumbnail.height < 350) {
scaling = 350 / thumbnail.height;
thumbnail.width *= scaling;
thumbnail.height *= scaling
}
var description="";
if (feedItem.description && Array.isArray(feedItem.description.value)) {
if (!feedItem.description.value[0]) {
this._removeArticleFromList(guidList, feedItem.guid);
continue
}
description = feedItem.description.value.join("&nbsp;")
}
else if ((typeof(feedItem.description) === "string")) {
description = feedItem.description
}
if (feedType === "WSJ.GetVideoSection" && (!thumbnail || !video)) {
this._removeArticleFromList(guidList, feedItem.guid);
continue
}
var byline=feedItem.byline ? PlatformJS.Services.resourceLoader.getString("/wsj/ByLineFormat").format(feedItem.byline) : "";
var kicker=feedItem.displayName ? feedItem.displayName : "";
if (i === 0 && feedItem.encoded && (!thumbnail || !thumbnail.width || !thumbnail.height || !thumbnail.url)) {
var desc=feedItem.encoded;
desc = desc.split(" ");
var len=desc.length;
var maxCount=Math.min(100, len);
desc = desc.splice(0, maxCount);
desc = desc.join(" ");
if (desc) {
description = desc;
if (maxCount < len) {
description += "&nbsp;&#187;"
}
}
}
feedItem.newsClusterItem = {
articleUrl: feedItem.link, articleURL: feedItem.link, publishTime: WSJJS.Formatter.instance.formatTime(feedItem.pubDate, WSJJS.Formatter.tileFormat), publishTimeRaw: feedItem.pubDate, snippet: description, source: byline, sourceImageUrl: "", kicker: kicker, title: feedItem.title + (feedItem.access === "subscribed" ? "<div class=\"lockIcon\"></div>" : ""), headline: feedItem.title, byline: byline, thumbnail: thumbnail, video: video, imageAttribution: thumbnail && thumbnail.credit ? thumbnail.credit : "", articleId: feedItem.guid, type: feedType === "WSJ.GetVideoSection" ? "video" : "article", access: feedItem.access, articleIndex: i + 1, feedIdentifierValue: feedIdentifierValue, feedType: feedType, articleList: guidList, articleid: feedItem.guid, contentid: feedItem.guid
};
if (video) {
var newsClusterItem=feedItem.newsClusterItem;
video.title = newsClusterItem.title;
video.snippet = newsClusterItem.snippet;
video.thumbnailUrl = newsClusterItem.thumbnail.url;
video.articleIndex = newsClusterItem.articleIndex;
videoList.push(video)
}
finalList.push(feedItem)
}
for (var k=0; k < finalList.length; k++) {
finalList[k].newsClusterItem.videoList = videoList
}
return {
categoryInfo: data.rss.channel, feedItems: finalList
}
}, getArticleAsync: function getArticleAsync(feedType, feedIdentifierValue, articleId, pubDate) {
var that=this,
queryService=new PlatformJS.DataService.QueryService("WSJ.GetArticle"),
options=new Platform.DataServices.QueryServiceOptions,
urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("source", articleId.indexOf("http") === 0 ? "online" : "mobilefeeds");
urlParams.insert("guid", articleId);
urlParams.insert("timestamp", encodeURIComponent(pubDate));
var article=null;
return queryService.downloadDataAsync(urlParams, null, null, options).then(function(response) {
if (!response.isCachedResponse || !article) {
try {
article = response.dataString
}
catch(e) {}
}
if (article) {
return WinJS.Promise.wrap(article)
}
else {
return WinJS.Promise.wrapError("ArticleNotFound")
}
}, function(error) {
if (article) {
return WinJS.Promise.wrap(article)
}
else {
return WinJS.Promise.wrapError(error)
}
}, function(progress) {
if (progress.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryFound && progress.cachedResponse) {
try {
article = progress.cachedResponse.dataString
}
catch(e) {}
}
})
}, getVideoInfoAsync: function getVideoInfoAsync(guidList) {
var queryService=new PlatformJS.DataService.QueryService("WSJ.GetVideoInfo"),
options=new Platform.DataServices.QueryServiceOptions,
urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("guid", guidList.join(","));
return queryService.downloadDataAsync(urlParams, null, null, options).then(function(response) {
var json=JSON.parse(response.dataString);
return WinJS.Promise.wrap(json)
})
}
}, {
currentEdition: "CurrentEdition", _instance: null, instance: {get: function get() {
if (!WSJJS.ArticleManager._instance) {
WSJJS.ArticleManager._instance = new WSJJS.ArticleManager
}
return WSJJS.ArticleManager._instance
}}, getSectionTitle: function getSectionTitle(section) {
var title=section;
if (section === "PERSONAL JOURNAL") {
var today=new Date;
var offset=today.getTimezoneOffset() * 60 * 1000;
var utc=today.getTime() + offset;
var eastOffset=3600000 * -5;
var eastTime=new Date(utc + eastOffset);
switch (eastTime.getDay()) {
case 5:
title = "FRIDAY JOURNAL";
break;
case 6:
case 0:
title = "WEEKEND JOURNAL";
break;
default:
break
}
}
return title
}
})
});
WinJS.Namespace.define("WSJJS.NewsCluster", {Provider: WinJS.Class.derive(NewsJS.Partners.NewsClusterProvider, function WSJJS_cluster_provider(categoryInfo, title, maxArticles, onsuccess, onerror, bypassCache, isPrimaryCluster) {
this.isPrimaryCluster = isPrimaryCluster;
this._articleManager = WSJJS.ArticleManager.instance;
this._partner = partner;
this._imagePrefix = CommonJS.Partners.Config.getConfig(partner, "ImagePrefix", "http://s.wsj.net/public/resources/images/");
NewsJS.Partners.NewsClusterProvider.call(this, categoryInfo, title, maxArticles, onsuccess, onerror, bypassCache)
}, {
selectTemplateClass: function selectTemplateClass(index, item) {
if (index < 1 && item.newsClusterItem.type !== "video") {
item.newsClusterItem.templateClass = "WSJLead"
}
else {
if (item.newsClusterItem.type === "video") {
item.newsClusterItem.templateClass = "WSJVideo"
}
else {
item.newsClusterItem.templateClass = "WSJRegular"
}
}
return item.newsClusterItem
}, getFeedIdentifierValue: function getFeedIdentifierValue() {
return this.categoryInfo.sectionName
}
})});
WinJS.Namespace.define("WSJJS", {BasePanoPage: WinJS.Class.derive(NewsJS.BasePartnerPano, function(state) {
if (!PlatformJS.Ads.Partners.AdsManager.adFormatters[partner]) {
PlatformJS.Ads.Partners.AdsManager.adFormatters[partner] = new WSJJS.Ads.AdFormatter
}
this._partner = "WSJ";
NewsJS.BasePartnerPano.call(this, state);
WSJJS.BasePanoPage.setupPage();
this.addSubscribeButton()
}, {
addSubscribeButton: function addSubscribeButton() {
if (!this._subscribeButton) {
var subscribeButton=this._subscribeButton = document.createElement("button");
WinJS.Utilities.addClass(subscribeButton, "subscribeButton");
subscribeButton.textContent = PlatformJS.Services.resourceLoader.getString("/wsj/SubscribeButton");
var page=document.querySelector(".wsjPano.platformPage");
page.appendChild(subscribeButton)
}
}, itemInvoked: function itemInvoked(item, event) {
if (item.type !== "article") {
NewsJS.BasePartnerPano.prototype.itemInvoked.call(this, item, event)
}
else {
this._itemInvoked(item, event)
}
}, getValidActions: function getValidActions() {
var defaultAction={
icon: {
type: "image", url: "/wsjshared/images/WSJLogoBlack.png"
}, text: PlatformJS.Services.resourceLoader.getString("/wsj/thewsj"), textSize: "small"
};
var subscribeAction={
icon: {
type: "glyph", className: "subscribe"
}, textHeader: PlatformJS.Services.resourceLoader.getString("/wsj/ArticleHeaderSubscriptionMessage"), text: PlatformJS.Services.resourceLoader.getString("/wsj/ArticleSubscriptionMessage"), textSize: "small", customized: true
};
var downloadAction={
icon: {
type: "image", url: "/wsjshared/images/WSJLogoBlack.png"
}, textHeader: PlatformJS.Services.resourceLoader.getString("/wsj/ArticleHeaderDownloadMessage"), text: PlatformJS.Services.resourceLoader.getString("/wsj/ArticleDownloadMessage"), textSize: "small", customized: true
};
if (NewsJS.Partners.Config.isPartnerApp) {
return {
defaultAction: defaultAction, subscribeAction: subscribeAction
}
}
else {
return {
subscribeAction: subscribeAction, downloadAction: downloadAction
}
}
}, getActionsHandlerType: function getActionsHandlerType() {
return "WSJJS.ArticleReader.WSJArticleActionsHandler"
}, getActionKeys: function getActionKeys() {
if (NewsJS.Partners.Config.isPartnerApp) {
return ["defaultAction", "subscribeAction"]
}
else {
return ["subscribeAction", "downloadAction"]
}
}
}, {
setupPage: function setupPage() {
WSJJS.BasePanoPage.setupLoginButton()
}, setupLoginButton: function setupLoginButton() {
var separator=new WinJS.UI.AppBarCommand(document.createElement("hr"), {type: "separator"});
separator.element.id = "separator";
var loginCmd=new WinJS.UI.AppBarCommand(document.createElement("button"), {
label: PlatformJS.Services.resourceLoader.getString("/partners/Login"), icon: "\uE181", onclick: function onclick(event) {
CommonJS.dismissAllEdgies()
}
});
loginCmd.element.id = "loginButton";
WinJS.Utilities.addClass(loginCmd.element, "signInButton");
var logoutCmd=new WinJS.UI.AppBarCommand(document.createElement("button"), {
label: PlatformJS.Services.resourceLoader.getString("/wsj/signOutLabel"), icon: "\uE181", onclick: function onclick(event) {
CommonJS.dismissAllEdgies()
}
});
logoutCmd.element.id = "logoutButton";
WinJS.Utilities.addClass(logoutCmd.element, "signOutButton");
var edgy=WinJS.Utilities.query(".newsActionEdgyRight");
if (edgy.length > 0) {
edgy = edgy[0]
}
else {
edgy = document.getElementById("bottomEdgy")
}
edgy.appendChild(separator.element);
edgy.appendChild(loginCmd.element);
edgy.appendChild(logoutCmd.element)
}
})});
WinJS.Namespace.define("WSJJS.ArticleReader", {
Page: WinJS.Class.derive(NewsJS.Partners.ArticleReaderPage, function WSJJS_articlereader_page(state) {
this.partner = partner;
this.articleManager = WSJJS.ArticleManager.instance;
if (!PlatformJS.Ads.Partners.AdsManager.adFormatters[partner]) {
PlatformJS.Ads.Partners.AdsManager.adFormatters[partner] = new WSJJS.Ads.AdFormatter
}
NewsJS.Partners.ArticleReaderPage.call(this, state);
this._wsjArticleChangedListener = this._wsjArticleChanged.bind(this);
this._articleManager.addEventListener("articlechanged", this._wsjArticleChangedListener)
}, {
_setupBottomEdgy: function _setupBottomEdgy() {
NewsJS.NewsArticleReaderPage.prototype._setupBottomEdgy.call(this);
WSJJS.BasePanoPage.setupPage()
}, onShareRequest: function onShareRequest(articleData){}, dispose: function dispose() {
if (this._articleManager && this._articleManager.removeEventListener) {
this._articleManager.removeEventListener("articlechanged", this._wsjArticleChangedListener)
}
NewsJS.Partners.ArticleReaderPage.prototype.dispose.call(this)
}
}), Provider: WinJS.Class.derive(NewsJS.Partners.ArticleReaderProvider, function WSJJS_articlereader_provider_ctor(state) {
this.partner = partner;
this._imagePrefix = CommonJS.Partners.Config.getConfig(partner, "ImagePrefix", "http://s.wsj.net/public/resources/images/");
this.guidMap = {};
this.articleTypeMap = {};
this.articleManager = WSJJS.ArticleManager.instance;
NewsJS.Partners.ArticleReaderProvider.call(this, state)
}, {
_imagePrefix: null, _createImageDescriptor: function _createImageDescriptor(media, type) {
var imageNodes=type === "ILLUSTRATION" ? media.selectNodes("(./alt-image[last()])|(./image)|(./link/image)") : media;
var imageNode=null;
for (var i=0; i < imageNodes.length; i++) {
if (imageNodes.length) {
imageNode = imageNodes[imageNodes.length - 1 - i]
}
var mediaCredit=media.selectSingleNode("./media-credit"),
mediaCaption=media.selectSingleNode("./media-caption"),
thumbnailSrc=type === "ILLUSTRATION" ? imageNode.attributes.getNamedItem("src-id") : imageNode.attributes.getNamedItem("thumbnail-src"),
height=imageNode.attributes.getNamedItem("height"),
width=imageNode.attributes.getNamedItem("width");
if (thumbnailSrc && height && width && thumbnailSrc.nodeValue && height.nodeValue && width.nodeValue) {
break
}
}
if (!thumbnailSrc || !height || !width || !thumbnailSrc.nodeValue || !height.nodeValue || !width.nodeValue) {
return null
}
var imageData={
url: this._imagePrefix + thumbnailSrc.nodeValue, height: parseInt(height.nodeValue), width: parseInt(width.nodeValue)
},
asset={
credit: mediaCredit ? mediaCredit.innerText : "", caption: mediaCaption ? mediaCaption.innerText : ""
};
var model=AppEx.Common.ArticleReader.Model;
var image=new model.ImageDescriptor;
image.attribution = asset.credit ? asset.credit : "";
image.caption = asset.caption ? asset.caption : "";
image.altText = image.attribution;
var resource=new model.ImageResourceDescriptor;
resource.height = imageData.height;
resource.width = imageData.width;
resource.name = "original";
resource.url = imageData.url;
image.images = [resource];
return image
}, _processContentBlock: function _processContentBlock(p) {
var model=AppEx.Common.ArticleReader.Model,
contentBlock=new model.Block.ContentBlock,
attributes=new model.BlockAttributes.ContentAttributes;
contentBlock.attributes = attributes;
var result=WSJJS.ArticleReader.Provider.transform.transformToString(p);
contentBlock.attributes.content = result.replace("<?xml version=\"1.0\"?>", "");
return contentBlock
}, _processTitleImageBlock: function _processTitleImageBlock(media, type) {
var model=AppEx.Common.ArticleReader.Model;
var titleImage=new model.Block.TitleImageBlock;
titleImage.image = this._createImageDescriptor(media, type);
titleImage.locationHint = "";
titleImage.sizeHint = 2;
if (titleImage.image) {
var resource=titleImage.image.images[0];
var minWidth=1070;
if (resource.width > 740 && resource.height > 490 && resource.width > resource.height) {
var scaleFactor=minWidth / resource.width;
resource.width *= scaleFactor;
resource.height *= scaleFactor
}
if (this._validateTitleImage(resource)) {
return titleImage
}
else {
return null
}
}
else {
return null
}
}, _processImageBlock: function _processImageBlock(media, type) {
var model=AppEx.Common.ArticleReader.Model,
imageBlock=new model.Block.InlineImageBlock,
attributes=imageBlock.attributes = new model.BlockAttributes.InlineImageAttributes;
attributes.image = this._createImageDescriptor(media, type);
if (attributes.image) {
return imageBlock
}
else {
return null
}
}, _processInset: function _processInset(inset, articleInfo) {
var model=AppEx.Common.ArticleReader.Model,
media=inset.selectSingleNode("./media"),
that=this;
if (!media) {
return null
}
var param1=inset.attributes.getNamedItem("param1");
if (param1 && param1.nodeValue === "TABLETEXCLUDE") {
return null
}
var type=media.attributes.getNamedItem("type");
type = type ? type.value : null;
if (type === "FLASH") {
var caption=inset.selectSingleNode("./small-hed");
caption = caption ? caption.innerText : "";
return this._processFlash(media, articleInfo, caption)
}
return null
}, _processFlash: function _processFlash(media, articleInfo, caption) {
var image=media.selectSingleNode("./image");
if (image) {
var slug=image.attributes.getNamedItem("slug");
slug = slug ? slug.value : null;
if (slug === "slideshow") {
return this._processSlideShowBlock(media, articleInfo, image, caption)
}
}
}, _processSlideShowBlock: function _processSlideShowBlock(media, articleInfo, image, caption) {
var model=AppEx.Common.ArticleReader.Model,
that=this,
externalBlock=new model.Block.ExternalBlock,
attributes=externalBlock.attributes = new model.BlockAttributes.ExternalAttributes;
attributes.controlType = "NewsJS.SlideShowEntryBlock";
var slideshowId=image.attributes.getNamedItem("alternate-text");
slideshowId = slideshowId ? slideshowId.value : null;
var mediaCredit=media.selectSingleNode("./media-credit");
mediaCredit = mediaCredit ? mediaCredit.innerText : "";
var mediaCaption=media.selectSingleNode("./media-caption");
mediaCaption = mediaCaption ? mediaCaption.innerText : "";
mediaCaption = caption || mediaCaption;
var thumbnail=media.attributes.getNamedItem("thumbnail-src");
var height=media.attributes.getNamedItem("height");
var width=media.attributes.getNamedItem("width");
if (!thumbnail || !height || !width || !slideshowId) {
return
}
height = height.value;
width = width.value;
thumbnail = thumbnail.value;
var options={
articleData: {articleId: slideshowId}, providerType: "WSJJS.SlideShow.Provider", theme: partner, parentArticle: {
id: articleInfo.articleId, type: articleInfo.articleType, feedIdentifierValue: articleInfo.feedIdentifierValue, caption: caption
}, slideShowPage: "WSJJS.SlideShow.Page"
};
attributes.placement = "inline";
thumbnail = options.thumbnail = {
url: this._imagePrefix + thumbnail, height: height, width: width
};
thumbnail.altText = caption || mediaCaption + " " + mediaCredit;
thumbnail.attribution = mediaCaption + " " + mediaCredit;
attributes.maxHeight = options.thumbnail.height;
attributes.maxWidth = options.thumbnail.width;
attributes.controlOptionsSerialized = JSON.stringify(options);
return externalBlock
}, feedType: null, feedIdentifierValue: null, guidMap: null, articleTypeMap: null, initializeAsync: function initializeAsync(config) {
this.feedType = config.feedType;
this.feedIdentifierValue = config.feedIdentifierValue;
var guidList=this.sprinkleAds(JSON.parse(config.articleList));
for (var i=0; i < guidList.length; i++) {
var current=this.guidMap[guidList[i].articleId] = guidList[i];
if (i > 0) {
current.previousArticleId = guidList[i - 1].articleId
}
if (i < guidList.length - 1) {
current.nextArticleId = guidList[i + 1].articleId
}
var offset=0;
var moreArticles=[];
while (moreArticles.length < 4) {
offset++;
if (i + offset < guidList.length) {
var currentMoreArticle=guidList[i + offset];
if (currentMoreArticle.type !== "ad") {
var currentHeadline=currentMoreArticle.headline;
var currentArticleId=currentMoreArticle.articleId;
if (currentHeadline && currentArticleId) {
var moreArticle={
headline: currentHeadline, articleId: currentArticleId
};
moreArticles.push(moreArticle)
}
}
}
else {
break
}
}
current.moreArticles = moreArticles
}
if (!WSJJS.ArticleReader.Provider.transform) {
var uri=new Windows.Foundation.Uri("ms-appx:///wsjshared/transform.xml");
return Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).then(function(file) {
var xmlLoadSettings=new Windows.Data.Xml.Dom.XmlLoadSettings;
xmlLoadSettings.prohibitDtd = true;
xmlLoadSettings.resolveExternals = false;
return Windows.Data.Xml.Dom.XmlDocument.loadFromFileAsync(file, xmlLoadSettings)
}).then(function(xml) {
WSJJS.ArticleReader.Provider.transform = new Windows.Data.Xml.Xsl.XsltProcessor(xml);
return WinJS.Promise.wrap()
}, function(){})
}
else {
return WinJS.Promise.wrap({})
}
}, isAd: function isAd(article) {
if (typeof article === "string") {
return this.getAdInfo(article) !== null
}
else if (article.type === "ad") {
return true
}
return false
}, getAdInfo: function getAdInfo(articleId) {
var article=this.guidMap[articleId];
if (article && article.type === "ad") {
return article
}
else {
return null
}
}, _processTitleBlock: function _processTitleBlock(articleBody, date) {
var model=AppEx.Common.ArticleReader.Model,
that=this,
title=new model.Title,
publisher=new model.SourceDescriptor,
favicon=new model.ImageResourceDescriptor,
bylineNode=articleBody.selectSingleNode("./byline"),
mainHedNode=articleBody.selectSingleNode("./headline/main-hed");
if (bylineNode) {
title.byline = bylineNode.innerText.replace(/\s\s+/g, " ").replace(/^\s+|\s+$/g, "")
}
else {
title.byline = ""
}
title.date = date ? WSJJS.Formatter.instance.formatTime(date.innerText, WSJJS.Formatter.articleFormat) : "";
title.headline = mainHedNode ? mainHedNode.innerText.replace(/\s\s+/g, " ").replace(/^\s+|\s+$/g, "") : "";
title.allowAds = true;
title.pgCode = "";
title.author = title.byline || "";
title.publisher = publisher;
title.style = 100;
publisher.name = NewsJS.Partners.Config.isPartnerApp ? "" : PlatformJS.Services.resourceLoader.getString("/wsj/thewsj");
publisher.favicon = favicon;
favicon.height = 40;
favicon.width = 360;
favicon.url = NewsJS.Partners.Config.isPartnerApp ? "" : "/wsjshared/images/WSJ_Logo_black.svg";
favicon.name = publisher.name;
return title
}, _processVideoBlock: function _processVideoBlock(media) {
var model=AppEx.Common.ArticleReader.Model,
videoBlock=new model.Block.InlineVideoBlock,
attributes=new model.BlockAttributes.InlineVideoAttributes,
video=new model.VideoDescriptor,
imageNode=media.selectSingleNode("./image"),
mediaCredit=media.selectSingleNode("./media-credit"),
mediaCaption=media.selectSingleNode("./media-caption");
if (!imageNode) {
return null
}
var slug=imageNode.attributes.getNamedItem("slug");
if (!slug) {
return null
}
slug = slug.value;
if (slug.indexOf("video") !== 0) {
return null
}
var videoId=imageNode.attributes.getNamedItem("src-id");
if (!videoId) {
return null
}
videoId = videoId.nodeValue;
mediaCaption = mediaCaption ? mediaCaption.innerText : "";
mediaCredit = mediaCredit ? mediaCredit.innerText : "";
videoBlock.attributes = attributes;
attributes.video = video;
attributes.sizeHint = 2;
video.attribution = mediaCaption ? mediaCaption + " " + mediaCredit : mediaCredit;
video.caption = video.attribution;
video.videoSource = videoId;
return videoBlock
}, _removeBlock: function _removeBlock(block, assetList) {
var index=assetList.indexOf(block);
assetList.splice(index, 1)
}, processVideosAsync: function processVideosAsync(videoBlocks, assetList) {
var guidList=[],
that=this;
for (var i=0; i < videoBlocks.length; i++) {
guidList.push(videoBlocks[i].attributes.video.videoSource)
}
return WSJJS.ArticleManager.instance.getVideoInfoAsync(guidList).then(function(videoInfos) {
var videoMap={},
j=0;
videoInfos = videoInfos.items;
for (j = 0; j < videoInfos.length; j++) {
if (videoInfos[j].id) {
videoMap[videoInfos[j].id.replace(/[{}]/g, "")] = videoInfos[j]
}
}
for (j = 0; j < videoBlocks.length; j++) {
var videoBlock=videoBlocks[j],
videoObj=videoBlock.attributes.video;
var videoInfo=videoMap[videoObj.videoSource];
if (videoInfo) {
var thumbnailList=videoInfo.thumbnailList;
var poster=thumbnailList && thumbnailList.length > 0 ? thumbnailList[thumbnailList.length - 1] : null;
var videoList=videoInfo.videoMP4List;
var video=videoList && videoList.length > 0 ? videoList[0] : null;
if (!video) {
that._removeBlock(videoBlock, assetList)
}
videoObj.height = poster.height;
videoObj.width = poster.width;
videoObj.videoSource = video.url;
videoObj.posterUrl = poster.url
}
else {
that._removeBlock(videoBlock, assetList)
}
}
return WinJS.Promise.wrap()
}, function() {
for (var j=0; j < videoBlocks.length; j++) {
that._removeBlock(videoBlocks[j], assetList)
}
return WinJS.Promise.wrap()
})
}, isArticleLocked: function isArticleLocked(articleId) {
var articleInfo=this.guidMap[articleId];
if (articleInfo) {
return articleInfo.access !== "anonymous"
}
return false
}, getArticleAsync: function getArticleAsync(articleId) {
var that=this;
var nextArticleId=null;
var previousArticleId=null;
var articleInfo=this.guidMap[articleId];
if (articleInfo) {
nextArticleId = articleInfo.nextArticleId;
previousArticleId = articleInfo.previousArticleId
}
if (articleInfo.type === "ad") {
articleInfo.nextArticle = {articleId: nextArticleId};
articleInfo.previousArticle = {articleId: previousArticleId};
return WinJS.Promise.wrap(articleInfo)
}
articleInfo.feedIdentifierValue = this.feedIdentifierValue;
var dataPromise=WSJJS.ArticleManager.instance.getArticleAsync(this.feedType, this.feedIdentifierValue, articleId, articleInfo.timestamp);
return dataPromise.then(function(articleString) {
var articleData=new Windows.Data.Xml.Dom.XmlDocument;
var model=AppEx.Common.ArticleReader.Model,
article=new model.Article,
title=null;
var xmlLoadSettings=new Windows.Data.Xml.Dom.XmlLoadSettings;
xmlLoadSettings.prohibitDtd = true;
xmlLoadSettings.resolveExternals = false;
articleData.loadXml(articleString, xmlLoadSettings);
articleData.normalize();
articleData = articleData.selectSingleNode("/article-doc");
var articleType=articleData.selectSingleNode("@type");
articleType = articleType ? articleType.innerText : "";
articleInfo.articleType = articleType;
var articleBody=articleData.selectSingleNode("./article/article-body");
article.title = title = that._processTitleBlock(articleBody, articleData.selectSingleNode("@last-pub-date"));
that.articleTypeMap[articleId] = articleType;
var processedArticleBody=that.processArticleBody(articleBody, articleInfo, title);
if (!processedArticleBody || (processedArticleBody.assetBlocks.length === 0 && processedArticleBody.contentBlocks.length === 0 && processedArticleBody.videoBlocks.length === 0)) {
processedArticleBody = that.processArticleBody(articleData.selectSingleNode("./summary/summary-body"), articleInfo, title)
}
if (!processedArticleBody) {
return WinJS.Promise.wrapError("Unable to process article")
}
var haveTitleImage=processedArticleBody.haveTitleImage,
contentBlocks=processedArticleBody.contentBlocks,
assetBlocks=processedArticleBody.assetBlocks,
videoBlocks=processedArticleBody.videoBlocks;
article.metadata = new model.ArticleInfo;
article.metadata.articleId = articleId;
article.metadata.adGroups = that.createArticleAds();
article.metadata.instrumentationId = CommonJS.Partners.Config.getConfig(partner, "InstrumentationId", "");
if (nextArticleId) {
var nextArticle=null;
article.nextArticle = nextArticle = new model.ArticleInfo;
nextArticle.articleId = nextArticleId
}
if (previousArticleId) {
var previousArticle=null;
article.previousArticle = previousArticle = new model.ArticleInfo;
previousArticle.articleId = previousArticleId
}
var moreArticlesData=articleInfo.moreArticles;
if (moreArticlesData) {
var moreArticles=[];
for (var j=0, lenj=moreArticlesData.length; j < lenj; j++) {
var currentMoreArticle=moreArticlesData[j];
var moreArticle=new model.ArticleInfo;
moreArticle.articleId = currentMoreArticle.articleId;
moreArticle.headline = currentMoreArticle.headline;
moreArticles.push(moreArticle)
}
article.moreArticles = moreArticles
}
var postProcess=null;
if (videoBlocks.length > 0) {
postProcess = that.processVideosAsync(videoBlocks, assetBlocks)
}
else {
postProcess = new WinJS.Promise.wrap
}
return postProcess.then(function() {
that._sprinkleContent(article, contentBlocks, assetBlocks, {
haveMultimediaSpan: false, initialContentBlocks: haveTitleImage ? 5 : 0
});
return WinJS.Promise.wrap(article)
}, function(error) {
that._sprinkleContent(article, contentBlocks, assetBlocks, {
haveMultimediaSpan: false, initialContentBlocks: haveTitleImage ? 5 : 0
});
return WinJS.Promise.wrap(article)
})
})
}, getCacheId: function getCacheId() {
return "PlatformImageCache"
}, processArticleBody: function processArticleBody(articleBody, articleInfo, title) {
var haveTitleImage=false,
contentBlocks=[],
assetBlocks=[],
videoBlocks=[],
blockNodes=null,
that=this;
if (articleBody) {
blockNodes = articleBody.selectNodes("./*")
}
else {
return null
}
for (var i=0; i < blockNodes.length; i++) {
var blockNode=blockNodes.getAt(i);
var block=null;
if (blockNode.tagName === "p" || blockNode.tagName === "tagline") {
block = that._processContentBlock(blockNode);
contentBlocks.push(block)
}
else if (blockNode.tagName === "media") {
var mediaType=blockNode.attributes.getNamedItem("type").nodeValue;
if (mediaType === "ILLUSTRATION") {
if (!haveTitleImage) {
title.titleImage = that._processTitleImageBlock(blockNode, mediaType);
if (title.titleImage) {
title.style = 2;
haveTitleImage = true
}
}
if (!title.titleImage) {
block = that._processImageBlock(blockNode, mediaType)
}
}
else if (mediaType === "VIDEO") {
block = that._processVideoBlock(blockNode);
if (block) {
videoBlocks.push(block)
}
}
else if (mediaType === "FLASH") {
block = that._processFlash(blockNode, articleInfo, null)
}
if (block) {
assetBlocks.push(block)
}
}
else if (blockNode.tagName === "inset") {
block = that._processInset(blockNode, articleInfo);
if (block) {
assetBlocks.push(block)
}
}
}
return {
haveTitleImage: haveTitleImage, contentBlocks: contentBlocks, assetBlocks: assetBlocks, videoBlocks: videoBlocks
}
}
}, {transform: null})
});
WinJS.Namespace.define("WSJJS.ArticleReader", {WSJArticleActionsHandler: WinJS.Class.define(function(){}, {onActionInvoked: function onActionInvoked(event) {
var data=event.data;
var actionKey=data.actionKey;
switch (actionKey) {
case"defaultAction":
break;
case"subscribeAction":
break;
case"downloadAction":
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(data.impressionNavMethod);
NewsJS.BasePartnerPano.launchPartnerApp(partner);
break
}
}})});
WinJS.Namespace.define("WSJJS.SlideShow", {
Page: WinJS.Class.derive(NewsJS.Partners.SlideShowPage, function wsj_slideshowpage_ctor(state) {
this.partner = partner;
NewsJS.Partners.SlideShowPage.call(this, state)
}, {}), Provider: WinJS.Class.define(function(articleData) {
this.articleId = articleData.articleId;
this._imagePrefix = CommonJS.Partners.Config.getConfig(partner, "ImagePrefix", "http://s.wsj.net/public/resources/images/")
}, {
_imagePrefix: null, articleId: null, initializeAsync: function initializeAsync(config) {
return WinJS.Promise.wrap({})
}, queryAsync: function queryAsync() {
var that=this,
promise=WSJJS.ArticleManager.instance.getArticleAsync("section", "section", that.articleId);
return promise.then(function(articleString) {
var articleData=new Windows.Data.Xml.Dom.XmlDocument;
var xmlLoadSettings=new Windows.Data.Xml.Dom.XmlLoadSettings;
xmlLoadSettings.prohibitDtd = true;
xmlLoadSettings.resolveExternals = false;
articleData.loadXml(articleString, xmlLoadSettings);
var summary=articleData.selectSingleNode("/article-doc/summary/summary-body");
articleData = articleData.selectSingleNode("/article-doc/article/article-body");
var headline=summary.selectSingleNode("./headline/main-hed");
var articleSummary=summary.selectSingleNode("./p");
articleSummary = articleSummary ? articleSummary.innerText : "";
headline = headline ? headline.innerText : "";
var insets=articleData.selectNodes("./inset");
var slides=[];
slides.instrumentationId = CommonJS.Partners.Config.getConfig(partner, "InstrumentationId", "");
for (var i=0; i < insets.length; i++) {
var inset=insets.getAt(i);
var media=inset.selectSingleNode("./media");
if (!media) {
continue
}
var image=media.selectNodes("./alt-image[last()]|./image");
if (image.length) {
image = image[image.length - 1]
}
var credit=media.selectSingleNode("./media-credit");
credit = credit ? credit.innerText : "";
var caption=inset.selectSingleNode("./p");
caption = caption ? caption.innerText : "";
var src=image.attributes.getNamedItem("src-id");
src = src ? that._imagePrefix + src.nodeValue : null;
var height=image.attributes.getNamedItem("height");
height = height ? height.nodeValue : null;
var width=image.attributes.getNamedItem("width");
width = width ? width.nodeValue : null;
if (!src) {
continue
}
slides.push({
thumbnail: {
url: src, altText: caption
}, altText: caption, attribution: credit, caption: caption, desc: caption, image: {
url: src, height: height, width: width
}, title: ""
})
}
return WinJS.Promise.wrap({
title: headline, desc: articleSummary, byline: "", version: 1, slides: slides
})
})
}
})
});
WinJS.Namespace.define("WSJJS.Ads", {AdFormatter: WinJS.Class.derive(PlatformJS.Ads.Partners.AdFormatter, function() {
var adsNode=CommonJS.Partners.Config.getConfig(partner, "Ads", {});
var sectionIds=adsNode.getDictionary("SiteIds");
var sections=Object.keys(sectionIds);
for (var i=0; i < sections.length; i++) {
var section=sections[i];
var siteId=sectionIds[section];
if (siteId.value) {
this._siteIds[section] = siteId.value
}
}
this._partnerId = adsNode.getString("PartnerId")
}, {
_siteIds: {}, _partnerId: null, getKeywordString: function getKeywordString(options) {
var adTags=[];
if (options.location === "cluster") {
adTags.push({
key: "WSJsId", value: this._siteIds[options.section]
})
}
else if (options.location === "article") {
if (options.position === "interstitial") {
adTags.push({
key: "WSJsId", value: this._siteIds["int_" + options.orientation]
})
}
else if (options.position === "MiddleRight") {
adTags.push({
key: "WSJsId", value: this._siteIds["ArticleTower"]
})
}
}
adTags.push({
key: "WSJpId", value: this._partnerId
});
return adTags
}
})})
})()