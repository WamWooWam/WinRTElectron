/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function _bdiReportFragment_6() {
"use strict";
WinJS.Namespace.define("CommonJS.BdiReportFragment", {
domCollapser: WinJS.Binding.converter(function _bdiReportFragment_9(data) {
var styleDisplay="none";
if (data && data.length > 0) {
styleDisplay = ""
}
return styleDisplay
}), setReportType: function setReportType(statusStr) {
var badImgElem=document.getElementById("buttonBadImg");
var badSnippetElem=document.getElementById("buttonBadSnippet");
var otherElem=document.getElementById("buttonOther");
var reportTypeElem=document.getElementById("reportType");
var selectedClass="feedbackDivTableLeftTdDiv feedbackDivTableLeftTdDivSelected feedbackColor";
var unselectedClass="feedbackDivTableLeftTdDiv feedbackDivTableLeftTdDivUnselected feedbackColor";
if (statusStr === "BAD_IMAGE") {
badImgElem.className = selectedClass;
badSnippetElem.className = unselectedClass;
otherElem.className = unselectedClass;
reportTypeElem.innerText = 0
}
else if (statusStr === "BAD_SNIPPET") {
badImgElem.className = unselectedClass;
badSnippetElem.className = selectedClass;
otherElem.className = unselectedClass;
reportTypeElem.innerText = 1
}
else if (statusStr === "OTHER") {
badImgElem.className = unselectedClass;
badSnippetElem.className = unselectedClass;
otherElem.className = selectedClass;
reportTypeElem.innerText = 2;
var notesText=document.getElementById("notesText");
if (notesText) {
notesText.focus()
}
}
}, submitReport: function submitReport() {
var messageBar=null;
if (!window.navigator.onLine) {
messageBar = new CommonJS.MessageBar(CommonJS.resourceLoader.getString("/platform/noInternetDescription"), {autoHide: true});
messageBar.show();
return
}
var notesText=document.getElementById("notesText");
var userComments="";
if (notesText) {
userComments = notesText.innerText
}
var reportType=document.getElementById("reportType").innerText;
var bdiRequestUrl=document.getElementById("bdiRequestUrl").innerText;
var rawResponse=document.getElementById("rawResponse").innerText;
var articleHeadline=document.getElementById("articleHeadline").innerText;
var articleSnippet=document.getElementById("articleSnippet").innerText;
var articleUrl=document.getElementById("articleUrl").innerText;
var imageUrl=document.getElementById("imageUrl").innerText;
var bdiReporter=(Platform.Utilities.BdiResultReport) ? Platform.Utilities.BdiResultReport.instance : null;
if (bdiReporter) {
bdiReporter.reportBdiResult(reportType, bdiRequestUrl, rawResponse, articleHeadline, articleSnippet, articleUrl, imageUrl, userComments);
messageBar = new CommonJS.MessageBar("Thank you. Your report has been sent.", {autoHide: true});
messageBar.show()
}
notesText.innerText = "";
PlatformJS.Utilities.getControl("SharedBdiReportPage").hide()
}
})
})()