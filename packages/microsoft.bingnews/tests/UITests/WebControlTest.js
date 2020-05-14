/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
uiTest("Verify Web Control", ["Web"], function() {
return new WinJS.Promise(function(complete, error) {
WinJS.Promise.timeout(BingApps.NewsTest.Timeouts.startTimeout).then(function() {
try {
PlatformJS.Navigation.navigateToChannel(BingApps.NewsTest.BingDaily.heroChannel)
}
catch(e) {
throw WinJS.ErrorFromName("Exception", "Could not navigate to hero");
}
}).then(function() {
return BingApps.NewsApp.Test.WaitNSec(5)
}).then(function() {
return BingApps.NewsApp.Test.Web.searchForKeyword(BingApps.NewsApp.Test.Web.SearchTerm.Microsoft)
}).then(function() {
return BingApps.NewsApp.Test.WaitNSec(20)
}).then(BingApps.NewsApp.Test.Web.clickFirstSearchArticle).then(function() {
return BingApps.NewsApp.Test.WaitNSec(20)
}).then(BingApps.NewsApp.Test.Web.validatePageHadNoFailures).then(function() {
return BingApps.NewsApp.Test.WaitNSec(20)
}).then(function() {
if (!BingApps.NewsApp.Test.Web.VerifyPageName(BingApps.NewsApp.Test.Web.SearchTerm.Microsoft))
throw WinJS.ErrorFromName("Exception", "wrong search page");
return true
}).then(BingApps.NewsApp.Test.Async.TestFinishedSuccess, BingApps.NewsApp.Test.Async.HandleException).done(complete, error)
})
})
})()