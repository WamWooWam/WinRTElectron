/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Maps", {TimeStamp: WinJS.Class.define(function(element, options) {
var that=this;
element = element || document.createElement("div");
element.winControl = this;
this._init(element);
this._setOptions(options)
}, {
_domElement: null, _firstLine: null, _secondLine: null, _setOptions: function _setOptions(options){}, _init: function _init(element) {
var that=this;
var firstLine=document.createElement("div");
WinJS.Utilities.addClass(firstLine, "tsFirstLine");
that._firstLine = firstLine;
var secondLine=document.createElement("div");
WinJS.Utilities.addClass(secondLine, "tsSecondLine");
that._secondLine = secondLine;
WinJS.Utilities.addClass(element, "tsContainer");
this._domElement = element;
this._domElement.appendChild(firstLine);
this._domElement.appendChild(secondLine)
}, updateTimeStamp: function updateTimeStamp(ts) {
var that=this;
var firstLine=this._formatFirstLine(ts);
var secondLine=this._formatSecondLine(ts);
that._firstLine.innerText = firstLine;
that._secondLine.innerText = secondLine
}, _formatFirstLine: function _formatFirstLine(ts) {
return WeatherAppJS.Maps.Utilities.formatSnapTime(ts)
}, _formatSecondLine: function _formatSecondLine(ts) {
var jsDateInUTC=WeatherAppJS.Maps.Utilities._getJSDateFromSnapTime(ts);
var localDate=WeatherAppJS.Utilities.Formatting.convertUTCToLocalDate(jsDateInUTC);
var dateTimeFormatter=new Windows.Globalization.DateTimeFormatting.DateTimeFormatter(Windows.Globalization.DateTimeFormatting.YearFormat.none, Windows.Globalization.DateTimeFormatting.MonthFormat.default, Windows.Globalization.DateTimeFormatting.DayFormat.default, Windows.Globalization.DateTimeFormatting.DayOfWeekFormat.abbreviated);
return dateTimeFormatter.format(localDate)
}
})})
})()