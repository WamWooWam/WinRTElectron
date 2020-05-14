/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("NewsJS", {MarketPicker: WinJS.Class.define(function marketPicker_ctor(element, options) {
var attribute=null,
parentSettings=null,
that=this;
this.element = element ? element : document.createElement("div");
this.element.winControl = this;
this._setControlEnabled(false);
this._marketSelectorContainer = document.createElement("div");
this._marketSelectorContainer.setAttribute("id", "MarketList");
this._marketSelect = document.createElement("select");
this._marketSelect.setAttribute("id", "MarketDropDown");
WinJS.Utilities.addClass(this.element, "newsMarketSelect");
this._marketSelectorContainer.appendChild(this._marketSelect);
this.element.appendChild(this._marketSelectorContainer);
this._marketPicker_onChange = function marketPicker_onChange(event) {
that._marketChanged(event)
};
this._marketSelect.addEventListener("change", this._marketPicker_onChange);
WinJS.UI.setOptions(this, options)
}, {
element: null, currentMarket: {
set: function set(value) {
this._currentMarket = this._marketSelect.value = value
}, get: function get() {
return this._currentMarket
}
}, _controlEnabled: false, _marketSelect: null, _marketLabel: null, _marketSelectorContainer: null, _currentMarket: null, _applyPrompt: null, _promptLabel: null, _marketPicker_onChange: null, _marketChangeCallback: null, _populate: function _populate() {
var that=this;
var optionsRendered=false;
that._currentMarket = Platform.Globalization.Marketization.getCurrentMarket();
var sourcesFeedMarket=NewsJS.Globalization.getMarketStringForSources();
return new WinJS.Promise(function(complete) {
var optionsRenderingComplete=function() {
that._setControlEnabled(true);
complete()
};
var qs=new Platform.QueryService("MarketSourcesData");
var urlParams=PlatformJS.Collections.createStringDictionary();
urlParams.insert("market", sourcesFeedMarket);
var options=new Platform.DataServices.QueryServiceOptions;
qs.downloadDataAsync(urlParams, null, null, options).then(function(responseData) {
if (!optionsRendered) {
if (responseData && responseData.dataString && responseData.dataString.length > 0) {
that._renderOptions(responseData, sourcesFeedMarket)
}
else {
that._renderFallback()
}
optionsRenderingComplete()
}
}, function(err) {
that._renderFallback();
optionsRenderingComplete()
}, function(p) {
if (p.statusCode === Platform.DataServices.QueryServiceStatusCode.cachedEntryFound) {
var responseData=p.cachedResponse;
if (responseData && responseData.dataString && responseData.dataString.length > 0) {
optionsRendered = true;
that._renderOptions(responseData, sourcesFeedMarket);
optionsRenderingComplete()
}
}
})
})
}, _renderFallback: function _renderFallback() {
var marketDisplay=Platform.Globalization.Marketization.getCurrentMarketInfo();
var option=document.createElement("option");
var defaultMarket=NewsJS.Globalization.getMarketStringForSources();
option.value = defaultMarket;
option.text = marketDisplay.displayName;
this._marketSelect.appendChild(option);
this._marketSelect.value = defaultMarket
}, _renderOptions: function _renderOptions(responseData, sourcesFeedMarket) {
var json=JSON.parse(responseData.dataString);
var clusters=json.clusters;
for (var i=0; i < clusters.length; i++) {
var cluster=clusters[i];
var el=cluster.entityList;
var displayMarket=el.collectionId;
var display=el.categoryName;
if (displayMarket && display) {
var option=document.createElement("option");
option.value = displayMarket;
option.text = display;
this._marketSelect.appendChild(option);
if (displayMarket.toLowerCase() === sourcesFeedMarket.toLowerCase()) {
this._marketSelect.value = displayMarket
}
}
}
}, _marketChanged: function _marketChanged(event) {
this._currentMarket = this._marketSelect.value;
this._marketChangeCallback(this._marketSelect.value)
}, _setControlEnabled: function _setControlEnabled(isEnabled) {
this._controlEnabled = isEnabled;
if (this.element) {
this.element.disabled = !this._controlEnabled
}
}
})})
})()