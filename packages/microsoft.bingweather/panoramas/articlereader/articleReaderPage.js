/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS", {ArticleReaderPage: WinJS.Class.derive(DynamicPanoJS.DynamicArticleReaderPage, function(state) {
DynamicPanoJS.DynamicArticleReaderPage.call(this, state);
CommonJS.setTheme("articleReaderBackground", false)
}, {
getPageImpressionContext: function getPageImpressionContext() {
if (this.instrumentationEntryPoint === 1) {
return WeatherAppJS.Instrumentation.PageContext.PartnerPano + WeatherAppJS.Instrumentation.PageContext.ArticleReader
}
return WeatherAppJS.Instrumentation.PageContext.ArticleReader
}, _getSharingAppParam: function _getSharingAppParam() {
return 4
}
})})
})()