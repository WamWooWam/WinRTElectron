/*  © Microsoft. All rights reserved. */
(function() {
"use strict";
var partner="NYT";
WinJS.Namespace.define("NYTJS", {Formatter: WinJS.Class.define(function() {
var dateFormatting=Windows.Globalization.DateTimeFormatting;
this._dateFormat = new dateFormatting.DateTimeFormatter(dateFormatting.YearFormat.full, dateFormatting.MonthFormat.abbreviated, dateFormatting.DayFormat.default, dateFormatting.DayOfWeekFormat.none, dateFormatting.HourFormat.none, dateFormatting.MinuteFormat.none, dateFormatting.SecondFormat.none, ["en-US"]);
this._timeFormat = new dateFormatting.DateTimeFormatter(dateFormatting.YearFormat.none, dateFormatting.MonthFormat.none, dateFormatting.DayFormat.none, dateFormatting.DayOfWeekFormat.none, dateFormatting.HourFormat.default, dateFormatting.MinuteFormat.default, dateFormatting.SecondFormat.none, ["en-US"])
}, {
_dateFormat: null, _timeFormat: null, getDateString: function getDateString(timestamp) {
return this._dateFormat.format(new Date(timestamp * 1000))
}, getTimeString: function getTimeString(timestamp) {
return this._timeFormat.format(new Date(timestamp * 1000))
}, getTimeClass: function getTimeClass(now, timestamp) {
var delta=now / 1000 - timestamp;
if (delta < 60 * 60) {
return "recentTime"
}
else {
return ""
}
}, formatDateTime: function formatDateTime(timestamp, dateTimeType) {
var result="";
if (dateTimeType === CommonJS.Utils.DateTimeFormatting.dateTimeFormat.article) {
result = NYTJS.Formatter.instance.formatArticleDate(timestamp)
}
else if (dateTimeType === CommonJS.Utils.DateTimeFormatting.dateTimeFormat.panoTile) {
result = NYTJS.Formatter.instance.formatPanoDate(timestamp)
}
else if (dateTimeType === CommonJS.Utils.DateTimeFormatting.dateTimeFormat.panoWatermark) {
result = NYTJS.Formatter.instance.formatPanoWatermarkDate(timestamp)
}
else if (dateTimeType === CommonJS.Utils.DateTimeFormatting.dateTimeFormat.video) {
result = NYTJS.Formatter.instance.formatVideoDate(timestamp)
}
return result
}, formatArticleDate: function formatArticleDate(timestamp) {
var sixHours=120000 * 6;
var result="";
if (timestamp) {
if (timestamp.utctime) {
var delta=CommonJS.Utils.getBDITimeDelta(timestamp.utctime);
delta = delta < 0 ? 0 : delta;
var jsTimestamp=(timestamp.utctime / 10000) + CommonJS.Utils._bdiTimeOriginEpoch;
var time=new Date(jsTimestamp);
var formattedDate=this._dateFormat.format(time);
var formattedTime=this._timeFormat.format(time);
var isToday=time.toDateString() === (new Date).toDateString();
if (isToday || delta < sixHours) {
result = formattedTime
}
else {
result = formattedDate
}
}
else {
result = timestamp
}
return "The New York Times - " + result
}
else {
return "The New York Times"
}
}, formatVideoDate: function formatVideoDate(timestamp) {
var jsTimestamp=(timestamp.utctime / 10000) + CommonJS.Utils._bdiTimeOriginEpoch;
var time=new Date(jsTimestamp);
var formattedDate=this._dateFormat.format(time);
return formattedDate
}, formatPanoDate: function formatPanoDate(timestamp) {
var oneHour=120000;
var sixHours=oneHour * 6;
var delta=CommonJS.Utils.getBDITimeDelta(timestamp.utctime);
delta = delta < 0 ? 0 : delta;
var result="";
if (delta < oneHour) {
result = CommonJS.Utils.convertBDITimeToFriendlyTime(timestamp.utctime)
}
else if (delta < sixHours) {
var jsTimestamp=(timestamp.utctime / 10000) + CommonJS.Utils._bdiTimeOriginEpoch;
var time=new Date(jsTimestamp);
result = this._timeFormat.format(time)
}
return result
}, formatPanoWatermarkDate: function formatPanoWatermarkDate(timestamp) {
var time=new Date(timestamp);
var formattedDate=this._dateFormat.format(time);
var formattedTime=this._timeFormat.format(time);
return formattedDate + " " + formattedTime
}, formatTime: function formatTime(timestamp, formatType) {
var now=Date.now(),
delta=now / 1000 - timestamp,
time=new Date(timestamp * 1000);
if (formatType === NYTJS.Formatter.panoWatermark) {
return this._dateFormat.format(time) + " " + this._timeFormat.format(time)
}
else if (formatType === NYTJS.Formatter.articleFormat) {
var formattedDate=this._dateFormat.format(time);
if (this._dateFormat.format(new Date) === formattedDate) {
return this._timeFormat.format(time)
}
else if (delta < 6 * 60 * 60) {
return this._timeFormat.format(time)
}
else {
return formattedDate
}
}
else if (formatType === NYTJS.Formatter.videoFormat) {
return this._dateFormat.format(time)
}
else {
if (delta < 60 * 60) {
return CommonJS.Utils.convertRSSTimeToFriendlyTime(timestamp * 1000)
}
else if (delta < 6 * 60 * 60) {
return this._timeFormat.format(time)
}
else {
return ""
}
}
}
}, {
other: 0, tileFormat: 1, panoWatermark: 2, articleFormat: 3, videoFormat: 4, _instance: null, instance: {get: function get() {
if (!NYTJS.Formatter._instance) {
NYTJS.Formatter._instance = new NYTJS.Formatter
}
return NYTJS.Formatter._instance
}}
})})
})()