/*  © Microsoft. All rights reserved. */
(function() {
WinJS.Namespace.define("BingApps.NewsApp.Test.Web", {
SearchTerm: {Microsoft: "Microsoft"}, getSearchBarAndButton: function getSearchBarAndButton() {
try {
var searchBarsOnPage=document.querySelectorAll('.' + BingApps.NewsTest.Search.boxInput);
var searchButtonsOnPage=document.querySelectorAll('.' + BingApps.NewsTest.Search.button);
if (!searchBarsOnPage || !searchButtonsOnPage)
throw new WinJS.ErrorFromName("Exception", "Component missing");
var searchBar=null;
for (var i=0; i < searchBarsOnPage.length; i++) {
if (searchBarsOnPage[i].placeholder === "Search News")
searchBar = searchBarsOnPage[i]
}
if (searchBar === null)
throw new WinJS.ErrorFromName("Exception", "Search Bar should not be null");
var searchButton=null;
for (var i=0; i < searchButtonsOnPage.length; i++) {
if (searchButtonsOnPage[i].className === BingApps.NewsTest.Search.button || searchButtonsOnPage[i].className === "win-searchbox-button cux-searchtextbox-button-hide")
searchButton = searchButtonsOnPage[i]
}
if (searchButton === null)
throw new WinJS.ErrorFromName("Exception", "Search Button should not be null");
return {
bar: searchBar, button: searchButton
}
}
catch(e) {
throw new WinJS.ErrorFromName("Exception", "Error while gathering the search bar and search button");
}
return {
bar: null, button: null
}
}, searchForKeyword: function searchForKeyword(searchKeyword) {
if (!searchKeyword)
throw new WinJS.ErrorFromName("Exception", "No Keyword to Search for");
var searchComponents;
try {
searchComponents = BingApps.NewsApp.Test.Web.getSearchBarAndButton();
if (!searchComponents || !searchComponents.bar || !searchComponents.button)
throw new WinJS.ErrorFromName("Exception", "Object not complete");
searchComponents.bar.value = searchKeyword;
BingApps.TestUtilities.sendClick(searchComponents.button)
}
catch(e) {
throw new WinJS.ErrorFromName("Exception", "Error while Searching for Keyword");
}
return {status: "Click Sent"}
}, VerifyPageName: function VerifyPageName(pagename) {
if (!pagename)
throw new WinJS.ErrorFromName("Exception", "No Page Name to Verify");
var serpTitle;
try {
serpTitle = document.getElementById(BingApps.NewsTest.Search.serpHeaderTitle)
}
catch(e) {}
return serpTitle && serpTitle.innerHTML === pagename
}, VerifyPageNameIsMicrosoft: function VerifyPageNameIsMicrosoft() {
return BingApps.NewsApp.Test.Web.VerifyPageName(BingApps.NewsApp.Test.Web.SearchTerm.Microsoft)
}, clickFirstSearchArticle: function clickFirstSearchArticle() {
if (!BingApps.NewsApp.Test.Web.VerifyPageNameIsMicrosoft())
throw new WinJS.ErrorFromName("Exception", "wrong search page");
var articleEntity=document.getElementsByClassName('grid');
if (articleEntity)
BingApps.TestUtilities.sendClick(articleEntity[0]);
else
throw new WinJS.ErrorFromName("Exception", "Article Entity Not Found");
return {status: "Article Entity Clicked"}
}, validatePageHadNoFailures: function validatePageHadNoFailures() {
var platformError=null;
try {
platformError = document.getElementsByClassName("platformErrorHost") || document.getElementsByClassName("platformError");
if (platformError && platformError.length !== 0)
throw new WinJS.ErrorFromName("Exception", "Load Failure Objects detected, Page did not load: Test Failure");
BingApps.TestUtilities.simulateClickOnBackButton()
}
catch(e) {
throw new WinJS.ErrorFromName("Exception", "Error while validating page for failures");
}
return {status: "No Error Found"}
}
})
})()