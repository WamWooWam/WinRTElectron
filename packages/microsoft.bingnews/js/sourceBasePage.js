/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("NewsJS", {SourceBasePage: WinJS.Class.derive(NewsJS.NewsBasePage, function(state) {
NewsJS.NewsBasePage.call(this, state);
var that=this;
this._jsLoadedPromise = PlatformJS.platformInitializedPromise.then(function _startBingDailyLazyLoad() {
return WinJS.UI.Fragments.renderCopy("/bingDaily/lazyBingDaily.html")
});
if (state.entity) {
var followButtonControl=PlatformJS.Utilities.getControl("followSource");
if (followButtonControl) {
this.setFollowButtonState(NewsJS.Utilities.isSourceFollowed(state.entity));
followButtonControl.onclick = function(e) {
that.followButtonClicked()
}
}
}
else {
var followButton=document.getElementById("followSource");
if (followButton) {
WinJS.Utilities.addClass(followButton, "hidden")
}
}
var refreshButton=PlatformJS.Utilities.getControl("refreshButton");
if (refreshButton) {
refreshButton.label = PlatformJS.Services.resourceLoader.getString("Refresh");
refreshButton.onclick = function(e) {
that.refresh();
NewsJS.Telemetry.SourcePage.recordRefreshButtonClick(state.entity, e)
}
}
}, {
onBindingComplete: function onBindingComplete() {
NewsJS.NewsBasePage.prototype.onBindingComplete.call(this)
}, showErrorIfBlocked: function showErrorIfBlocked() {
var that=this;
var sourceIsBlocked=false;
if (that._state && that._state.entity) {
if (News.NewsUtil.instance.isDomainBlockListed(that._state.entity.title)) {
var errOptions={
altDescription: PlatformJS.Services.resourceLoader.getString("SourceBlockListed").format(that._state.entity.displayname), altButtonText: CommonJS.resourceLoader.getString("Home")
};
CommonJS.Error.showError(CommonJS.Error.STANDARD_ERROR, function() {
PlatformJS.Navigation.navigateToChannel("Home")
}, null, false, false, errOptions);
sourceIsBlocked = true
}
}
return sourceIsBlocked
}, refresh: function refresh() {
this.loadPageData(true);
CommonJS.dismissAllEdgies()
}, setFollowButtonState: function setFollowButtonState(followed) {
var followButton=PlatformJS.Utilities.getControl("followSource");
if (followButton) {
followButton.extraClass = "appexSymbol";
if (followed) {
followButton.label = PlatformJS.Services.resourceLoader.getString("RemoveThisSource");
followButton.icon = "\uE018"
}
else {
followButton.label = PlatformJS.Services.resourceLoader.getString("AddThisSource");
followButton.icon = "\uE017"
}
}
}, followButtonClicked: function followButtonClicked() {
var that=this;
var success;
var shouldFollow=!NewsJS.Utilities.isSourceFollowed(that._state.entity);
if (shouldFollow) {
success = NewsJS.Utilities.followSources([that._state.entity])
}
else {
success = NewsJS.Utilities.unfollowSources([that._state.entity])
}
success.then(function(result) {
this.setFollowButtonState(shouldFollow);
if (shouldFollow && !NewsJS.StateHandler.instance.userDiscoveredAddSource) {
NewsJS.StateHandler.instance.userDiscoveredAddSource = true
}
})
}
})})
})()