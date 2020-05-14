/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
WinJS.Namespace.define("NewsJS", {EmptyPage: WinJS.Class.define(function(state){}, {
getPageImpressionContext: function getPageImpressionContext() {
return NewsJS.Telemetry.String.ImpressionContext.emptyPage
}, getPageState: function getPageState() {
return null
}, getPageData: function getPageData() {
return WinJS.Promise.wrap({})
}
})})
})()