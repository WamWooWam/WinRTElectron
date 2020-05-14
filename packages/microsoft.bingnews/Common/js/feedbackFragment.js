/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function _feedbackFragment_6() {
"use strict";
WinJS.Namespace.define("CommonJS.Feedback", {
onFeedbackInputChange: function onFeedbackInputChange() {
var userSuggest=document.getElementById("userSuggest");
if (userSuggest) {
var currentTime=new Date;
CommonJS.feedbackAutosaveTime = currentTime.getTime();
CommonJS.feedbackAutosave = userSuggest.innerText
}
}, encodingReservedCharacters: function encodingReservedCharacters(string) {
return escape(encodeURIComponent(string)).replace("*", "")
}, sendFeedback: function sendFeedback() {
var messageBar=null;
if (!window.navigator.onLine) {
messageBar = new CommonJS.MessageBar(CommonJS.resourceLoader.getString("/platform/noInternetDescription"), {autoHide: true});
messageBar.show();
return
}
var select1=document.getElementById("question1");
var select2=document.getElementById("question2");
var userSuggest=document.getElementById("userSuggest");
var questionTitle=document.getElementById("questionTitle");
var answer1="NA";
var answer2="NA";
var userComment="NA";
if (select1.selectedIndex !== -1) {
answer1 = select1.selectedIndex
}
console.log("answer of question1: " + answer1);
if (select2.selectedIndex !== -1) {
answer2 = select2.selectedIndex
}
console.log("answer of question2: " + answer2);
var regS=/\"/g;
userComment = userSuggest.innerText.replace(regS, "'");
console.log("user comments: " + userComment);
var http=new XMLHttpRequest;
var supportedMarkets="ar-ae;ar-dz;ar-eg;ar-me;ar-sa;ar-xa;bg-bg;ca-es;cs-cz;da-dk;de-at;de-ch;de-de;de-lu;el-cy;el-gr;en-ae;en-al;en-am;en-au;en-az;en-ba;en-bd;en-bg;en-bh;en-bn;en-by;en-ca;en-dk;enee;en-eg;en-fi;en-gb;en-ge;en-hk;en-hr;en-id;en-ie;en-il;en-in;en-iq;en-is;en-jo;en-kw;en-lb;en-lk;en-lt;en-lv;en-ly;en-md;en-me;en-mk;en-mt;en-my;en-ni;en-ni;en-no;en-nz;en-om;en-ph;en-pk;en-pr;en-qa;en-ro;en-sa;en-sf;en-sg;en-sl;en-sr;en-th;en-tr;en-tt;en-us;en-vn;en-wi;en-ww;en-xa;en-xc;en-xe;en-xo;en-xp;en-xs;en-ye;en-za;es-ar;es-bo;es-cl;es-co;es-r;es-do;es-ec;es-es;es-gt;es-hn;es-la;es-mx;es-ni;es-pa;es-pe;es-pr;es-py;es-sv;es-us;es-uy;es-ve;es-ww;et-ee;eu-es;fi-fi;fr-be;fr-ca;fr-ch;fr-dz;fr-fr;fr-lu;fr-ma;fr-tn;fr-xa;fr-xc;fr-xi;gu-in;he-il;hi-in;hr-hr;hu-hu;id-id;it-it;ja-jp;kk-kz;kn-in;ko-kr;lt-lt;lv-lv;mk-mk;ml-in;mr-in;ms-my;nl-be;nl-nl;no-no;pl-pl;pt-br;pt-pt;ro-ro;ru-kz;ru-ru;ru-ua;sk-sk;sl-l;sr-cyrl-cs;sr-sp;sv-se;ta-in;te-in;th-th;tr-tr;uk-ua;vi-vn;zh-cn;zh-hk;zh-tw;";
var currentMarket=Platform.Globalization.Marketization.getCurrentMarket().toLowerCase();
var marketSupported=true;
if (supportedMarkets.indexOf(currentMarket) < 0) {
marketSupported = false;
console.warn("Current market " + currentMarket + " is not a supported market on Feedback service")
}
var productKey=PlatformJS.Services.appConfig.getString("FeedbackProductKey");
if (!productKey || productKey === "") {
productKey = "";
console.warn("Something goes wrong, could not find the feedback product key, feedback data will not be sent.")
}
var urlMarket=marketSupported ? currentMarket : "en-us";
var url="https://feedback.discoverbing.com/eformpost.aspx?locale=" + CommonJS.Feedback.encodingReservedCharacters(urlMarket) + "&productKey=" + CommonJS.Feedback.encodingReservedCharacters(productKey) + "&ct=feedback&subtype=free";
var version=Windows.ApplicationModel.Package.current.id.version;
var versionString=CommonJS.Feedback.encodingReservedCharacters("v" + version.major + "." + version.minor + "." + version.build + "." + version.revision);
var arch=Windows.ApplicationModel.Package.current.id.architecture;
var archString="undefinedEnum";
if (arch === 0) {
archString = "X86"
}
else if (arch === 5) {
archString = "Arm"
}
else if (arch === 9) {
archString = "X64"
}
else if (arch === 11) {
archString = "Neutral"
}
else if (arch === 65535) {
archString = "Unknown"
}
var FBSettingID="returnQuery=%3Fproductkey%3D";
var FBSettingIDAnswer=productKey;
var SettingMarket="%26mkt%3D";
var SettingMarketAnswer=CommonJS.Feedback.encodingReservedCharacters(currentMarket);
var MiscStr="&eformpost=true&feedbackParam1=&feedbackParam2=&feedbackParam3=&feedbackParam4=&feedbackParam5=&feedbackParam6=&feedbackParam7=&feedbackParam8=&feedbackParam9=&feedbackParam10=&feedbackParam11=&feedbackParam12=&feedbackParam13=&feedbackParam14=&feedbackParam15=&feedbackParam16=&feedbackParam17=&feedbackParam18=";
var FBParamComment="&BDED91FC-2D64-4D36-A=";
var FBParamCommentAnswer=CommonJS.Feedback.encodingReservedCharacters(userComment);
var FBParamRate="&79DD6AA6-5937-459A-9=";
var FBParamRateAnswer=CommonJS.Feedback.encodingReservedCharacters(answer1);
var FBParamRecommend="&8D66D9FC-4D23-45A6-9=";
var FBParamRecommendAnswer=CommonJS.Feedback.encodingReservedCharacters(answer2);
var FBParamRes="&F3A98558-1BD9-47CD-9=";
var FBParamResAnswer=CommonJS.Feedback.encodingReservedCharacters(window.screen.width + "x" + window.screen.height);
var FBParamArch="&28DFC297-F3F5-43E8-8=";
var FBParamArchAnswer=CommonJS.Feedback.encodingReservedCharacters(archString);
var FBParamBuildNO="&EEDB9897-C13A-4762-B=";
var FBParamBuildNOAnswer=CommonJS.Feedback.encodingReservedCharacters(versionString);
var FBParamLatLong="&0FD2B25D-FCDB-4F77-9=";
var FBParamLatLongAnswer="";
var FBParamGEO="&B1AD7E05-6A79-4ADA-A=";
var FBParamGEOAnswer="";
var FBParamNetworkStatus="&9A97D97E-42B7-439D-9=";
var FBParamNetworkStatusAnswer="";
var FBParamMarketInfo="&2D4DD1B4-2907-4D35-B=";
var FBParamMarketInfoAnswer=marketSupported ? CommonJS.Feedback.encodingReservedCharacters(currentMarket) : CommonJS.Feedback.encodingReservedCharacters(currentMarket + "(unsupported)");
MiscStr = MiscStr + FBParamMarketInfoAnswer;
var params=FBSettingID + FBSettingIDAnswer + SettingMarket + SettingMarketAnswer + MiscStr + FBParamComment + FBParamCommentAnswer + FBParamRate + FBParamRateAnswer + FBParamRecommend + FBParamRecommendAnswer + FBParamRes + FBParamResAnswer + FBParamArch + FBParamArchAnswer + FBParamBuildNO + FBParamBuildNOAnswer + FBParamLatLong + FBParamLatLongAnswer + FBParamGEO + FBParamGEOAnswer + FBParamNetworkStatus + FBParamNetworkStatusAnswer + FBParamMarketInfo + FBParamMarketInfoAnswer;
console.log("post URL: " + url);
console.log("submit string: " + params);
http.open("POST", url, true);
http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
http.setRequestHeader("Content-length", params.length);
http.setRequestHeader("Accept-Encoding", "gzip, deflate");
http.setRequestHeader("Host", "feedback.discoverbing.com");
http.setRequestHeader("User-Agent", window.navigator.userAgent);
http.setRequestHeader("Connection", "close");
http.onreadystatechange = function() {
if (http.readyState === 4) {
if (http.status === 200) {
console.log("feedback submitted.")
}
else {
console.log("feedback submit failed.")
}
}
};
http.ontimeout = function() {
console.log("feedback submit timeout.")
};
if (productKey !== "") {
http.send(params)
}
else {
console.warn("http post is cancelled due to invalid product key")
}
messageBar = new CommonJS.MessageBar(CommonJS.resourceLoader.getString("/platform/feedbackThankYou"), {autoHide: true});
messageBar.show();
userSuggest.innerText = "";
CommonJS.feedbackAutosave = "";
PlatformJS.Utilities.getControl("SharedFeedbackPage").hide()
}
})
})()