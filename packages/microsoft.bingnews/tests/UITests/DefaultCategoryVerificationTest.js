/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
uiTest("Verify all Default Bing Editor Categories Exist - En-US Market ", ["DCat"], function() {
var DefaultClustersENUS_NameArray=["hero", "MySources", "NextSteps", "rt_Business_EN-US", "rt_Entertainment_EN-US", "rt_Opinions_EN-US", "rt_Politics_EN-US", "rt_ScienceAndTechnology_EN-US", "rt_Sports_EN-US", "rt_US_EN-US", "rt_World_EN-US"];
return new WinJS.Promise(function(complete, error) {
WinJS.Promise.timeout(BingApps.NewsTest.Timeouts.startTimeout).then(function() {
try {
PlatformJS.Navigation.navigateToChannel(BingApps.NewsTest.BingDaily.heroChannel)
}
catch(e) {
throw new WinJS.ErrorFromName("Exception", "Could not navigate to hero");
}
}).then(function() {
return BingApps.NewsApp.Test.WaitNSec(10)
}).then(function() {
try {
var pageClusters=document.getElementsByClassName("platformClusterHeader");
if (!pageClusters || pageClusters.length < DefaultClustersENUS_NameArray.length)
throw new WinJS.ErrorFromName("Exception", "Error, page clusters mismatch");
for (var index in DefaultClustersENUS_NameArray)
if (!pageClusters[DefaultClustersENUS_NameArray[index]])
throw new WinJS.ErrorFromName("Exception", "Error: " + DefaultClustersENUS_NameArray[index] + "was not found");
return {Status: "All Page Clusters Verified"}
}
catch(e) {
throw new WinJS.ErrorFromName("Exception", "Error, Failed to Verify Default Clusters, EN-US Market");
}
return {Status: "Test Complete"}
}).then(BingApps.NewsApp.Test.Async.TestFinishedSuccess, BingApps.NewsApp.Test.Async.HandleException).done(complete, error)
})
})
})()