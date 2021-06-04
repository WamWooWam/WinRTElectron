/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("WeatherAppJS", {topEdgy: WinJS.Class.define(function() {
this.initialize()
}, {
channelMyPlaces: null, channelWeatherMaps: null, initialize: function initialize() {
var settingsManager=WeatherAppJS.SettingsManager;
var channelManager=PlatformJS.Navigation && PlatformJS.Navigation.mainNavigator && PlatformJS.Navigation.mainNavigator.channelManager;
if (channelManager) {
var standardChannels=channelManager.standardChannels;
for (var channelProperty in standardChannels) {
var channelData=standardChannels[channelProperty];
this._assign(channelData)
}
}
settingsManager.addEventListener('favoriteadded', this.setupPlacesL2.bind(this));
settingsManager.addEventListener('favoriteremoved', this.setupPlacesL2.bind(this))
}, _assign: function _assign(channelData) {
switch (channelData.id) {
case"MyPlaces":
this.channelMyPlaces = channelData;
break;
case"WeatherMaps":
this.channelWeatherMaps = channelData;
break
}
}, initializeEdgy: function initializeEdgy() {
this.setupPlacesL2()
}, setupPlacesL2: function setupPlacesL2() {
var that=this;
if (this.channelMyPlaces) {
var subChannels=[];
WeatherAppJS.SettingsManager.getFavoritesAsync().then(function(favList) {
var geocodeCache=WeatherAppJS.GeocodeCache;
for (var favindex in favList) {
if (favList[favindex] !== null) {
var locId=favList[favindex].getId();
var channelId="MyPlaces" + locId;
var locationDisplayName=locId ? geocodeCache.getFullDisplayName(locId, false, true) : "";
var newChannel=that.createChannel(channelId, locationDisplayName, "", [], "/panoramas/home/home.html", "WeatherAppJS.Pages.Home", {locID: locId});
subChannels.push(newChannel)
}
}
that.channelMyPlaces.subChannels = subChannels;
PlatformJS.Navigation.mainNavigator.channelManager.channelConfigChanged = true
})
}
}, createChannel: function createChannel(id, title, icon, subChannels, fragment, page, state) {
return {
id: id, title: title, icon: icon, subChannels: subChannels, pageInfo: {
fragment: fragment, page: page, channelId: id
}, state: state
}
}
}, {
_instance: null, instance: {get: function get() {
if (!WeatherAppJS.topEdgy._instance) {
WeatherAppJS.topEdgy._instance = new WeatherAppJS.topEdgy
}
return WeatherAppJS.topEdgy._instance
}}
})})
})()