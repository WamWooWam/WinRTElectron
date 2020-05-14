/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("NYTJS", {BlogsPano: WinJS.Class.derive(NYTJS.BasePanoPage, function blogsPano_ctor(state) {
this._setupSectionPin = null;
NYTJS.BasePanoPage.call(this, state);
this._title = PlatformJS.Services.resourceLoader.getString("/nyt/blogs");
this._autoRefresh = null
}, {
_computeTimestamp: function _computeTimestamp(categoryTimestamp){}, loadPageData: function loadPageData(bypassCache) {
NewsJS.BasePartnerPano.prototype.loadPageData.call(this, bypassCache);
var that=this;
this._pageDataPromise = NYTJS.ArticleManager.instance.getBlogsListAsync().then(function(blogsList) {
that._providers = [];
that._clusters = [];
that._createTimer();
if (blogsList.length > 0) {
that._pageLoadSucceeded();
for (var i=0; i < blogsList.length; i++) {
var category=blogsList[i];
var provider=new NYTJS.NewsCluster.BlogsListProvider(category.blogs, category.blogCategory);
that._providers.push(provider);
that._clusters.push(NYTJS.NewsCluster.BlogsListProvider.createBlogsCluster(PlatformJS.Services.resourceLoader.getString("/nyt/BlogsHeader").format(category.blogCategory), provider, function(event) {
that.itemInvoked(event.detail.item, event)
}))
}
return that._populatePano()
}
else {
that._pageLoadFailed()
}
}, function() {
that._pageLoadFailed()
})
}, itemInvoked: function itemInvoked(item, event) {
var that=this;
if (item.type === "pano") {
WinJS.Navigation.navigate({
fragment: "/nytshared/nytCategoryPano.html", page: "NYTJS.CategoryPano"
}, item.state)
}
}
})})
})()