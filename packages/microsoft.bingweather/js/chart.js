/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
var tempChart="tempChart";
var rainfallChart="rainfallChart";
var sunshineChart="sunshineChart";
var snowDaysChart="snowdaysChart";
var resourceFile=PlatformJS.Services.resourceLoader;
WinJS.Namespace.define("WeatherAppJS.UI.HWChartManager", {
_clusterPlaceholder: null, _data: null, _plot: null, _yaxis: null, _chartDisplayData: {}, _selectedMonthIndex: null, _currentChart: null, _promisesStack: [], _currentLocation: "", _monthAriaLabel: "", chartWidth: 870, clusterHeight: 739, init: function init(clusterPlaceholder, hwData, locationName) {
var c=WeatherAppJS.UI.HWChartManager;
if (c._clusterPlaceholder) {
c.clearHWCluster()
}
c._clusterPlaceholder = clusterPlaceholder;
c._data = hwData;
c._currentLocation = locationName;
window.addEventListener('resize', c.resize);
c._renderGridAsync().then(function(plot) {
c._plot = plot;
var months=c._plot.querySelectorAll('.month');
for (var i=0; i < months.length; i++) {
months[i].addEventListener('click', (function(index) {
return function() {
c.HandleMonthClick(index)
}
}(i)), false)
}
var chartType=tempChart;
c._currentChart = chartType;
c.drawChart(chartType);
c._selectedMonthIndex = c.GetSelectedMonthIndex();
c._highlightSelectedMonth();
c._drawChartIcons();
c.SetArrowKeyHandler();
c.drawMonthlyModule();
c.setMonthAriaLabel(c._selectedMonthIndex)
}, function(err) {
return
})
}, resetChartData: function resetChartData(hwData) {
var c=WeatherAppJS.UI.HWChartManager;
c._data = hwData;
c.drawChart(c._currentChart);
c.drawMonthlyModule();
c.setMonthAriaLabel(c._selectedMonthIndex)
}, drawChart: function drawChart(chartType) {
var c=WeatherAppJS.UI.HWChartManager;
c._computeChartSize();
var rawChartData=WeatherAppJS.UI.HWChartManager._getChartData(chartType, c._data);
var chartOptions=WeatherAppJS.UI.HWChartManager._getChartOptions(chartType);
var chartDisplayData=c._getChartDisplayData(chartType, rawChartData, chartOptions);
c._setXAxis();
if (c._plot && chartDisplayData) {
var bars=c._plot.querySelectorAll('.data');
for (var i=0; i < bars.length; i++) {
bars[i].style.backgroundColor = chartDisplayData.fillColor;
WeatherAppJS.Utilities.UI.fadeInAsync(bars[i]).then();
bars[i].style.height = chartDisplayData.barData[i].height;
bars[i].style.marginTop = chartDisplayData.barData[i].marginTop
}
}
}, clearHWCluster: function clearHWCluster() {
var c=WeatherAppJS.UI.HWChartManager;
c._clusterPlaceholder = null;
WeatherAppJS.Utilities.Common.cleanupPromiseStack(c._promisesStack);
window.removeEventListener('resize', c.resize);
c._data = null;
c._selectedMonthIndex = null;
if (c._plot) {
c._plot.innerHTML = ''
}
}, _highlightSelectedMonth: function _highlightSelectedMonth() {
var c=WeatherAppJS.UI.HWChartManager;
var months=c._plot.querySelectorAll('.month');
for (var i=0; i < months.length; i++) {
if (i === c._selectedMonthIndex) {
WinJS.Utilities.addClass(months[i], 'chartSelectedMonth')
}
else {
WinJS.Utilities.removeClass(months[i], 'chartSelectedMonth')
}
}
}, _renderGridAsync: function _renderGridAsync() {
var that=this;
return new WinJS.Promise(function(complete, error) {
var loadModulePromise=CommonJS.loadModule({
fragmentPath: "/html/delayedTemplate.html", templateId: "historicalChartGrid"
}, {}, null, null, null);
WeatherAppJS.UI.HWChartManager._promisesStack.push(loadModulePromise);
loadModulePromise.then(function(plot) {
var c=WeatherAppJS.UI.HWChartManager;
c._plot = plot.querySelector('.historicalGrid');
if (c._clusterPlaceholder) {
var clusterChartPlot=c._clusterPlaceholder.querySelector('.chartPlot');
if (clusterChartPlot) {
clusterChartPlot.appendChild(c._plot);
complete(c._plot)
}
else {
error('no cluster placeholder')
}
}
else {
error('no cluster placeholder')
}
}, function(err) {
error(err)
})
})
}, _drawChartIcons: function _drawChartIcons() {
var c=WeatherAppJS.UI.HWChartManager;
var lastDrawnChart=null;
var availableCharts=0;
var column=2;
var data=c._getChartData(tempChart, c._data);
if (data.max !== null) {
lastDrawnChart = c.drawChartHeader(tempChart, column, true);
column = column + 2;
availableCharts++
}
data = c._getChartData(rainfallChart, c._data);
if (data.max !== null) {
lastDrawnChart = c.drawChartHeader(rainfallChart, column, false);
column = column + 2;
availableCharts++
}
data = c._getChartData(sunshineChart, c._data);
if (data.max !== null) {
lastDrawnChart = c.drawChartHeader(sunshineChart, column, false);
column = column + 2;
availableCharts++
}
data = c._getChartData(snowDaysChart, c._data);
if (data.max !== null) {
lastDrawnChart = c.drawChartHeader(snowDaysChart, column, false);
column = column + 2;
availableCharts++
}
lastDrawnChart.removeEventListener('keydown', WeatherAppJS.UI.HWChartManager._chartButtonKeydownHandler, false);
lastDrawnChart.addEventListener("keydown", function(event) {
var keyCode=(event && event.keyCode) ? event.keyCode : null;
var isRTL=(WeatherAppJS.Utilities.Common.getDirection() === 'rtl') ? true : false;
var monthTitleElem=WeatherAppJS.UI.HWChartManager._clusterPlaceholder.querySelector("#hwMonth");
switch (keyCode) {
case WinJS.Utilities.Key.rightArrow:
{
event.stopImmediatePropagation();
event.preventDefault();
var nextElem=isRTL ? event.srcElement.previousElementSibling : monthTitleElem;
if (!nextElem) {
CommonJS.NavigableView.dispatchBoundaryEvent(event.srcElement, CommonJS.NavigableView.Direction.RIGHT)
}
else {
nextElem.focus()
}
}
break;
case WinJS.Utilities.Key.leftArrow:
{
event.stopImmediatePropagation();
event.preventDefault();
var nextElement=isRTL ? monthTitleElem : event.srcElement.previousElementSibling;
if (!nextElement) {
CommonJS.NavigableView.dispatchBoundaryEvent(event.srcElement, CommonJS.NavigableView.Direction.LEFT)
}
else {
monthTitleElem.focus()
}
}
break
}
}, false);
c.addChartAttributions();
WinJS.Utilities.addClass(c._clusterPlaceholder.querySelector("#" + c._getChartHeaderParams(c._currentChart).id), "selected")
}, drawChartHeader: function drawChartHeader(chartType, position, displayTitle) {
var that=WeatherAppJS.UI.HWChartManager;
displayTitle = displayTitle || false;
var header=that._getChartHeader(chartType, position);
header.addEventListener("click", that.chartHeaderClickHandler);
header.addEventListener("keydown", function(event) {
that.HandleKeyboardEvent(event)
});
var ariaText=that._getHeaderAriaText(chartType);
header.setAttribute("aria-label", ariaText);
var headerPh=that._clusterPlaceholder.querySelector("#hwHeaders");
if (headerPh) {
headerPh.appendChild(header)
}
var title=that._getChartTitle(chartType, position, displayTitle);
var titlePh=that._clusterPlaceholder.querySelector("#hwChartTitle");
if (titlePh) {
titlePh.appendChild(title)
}
return header
}, _getChartTitle: function _getChartTitle(chartType, position, display) {
var title=WeatherAppJS.UI.HWChartManager._getChartHeaderTitleParams(chartType);
var titleDiv=document.createElement('div');
titleDiv.id = title.id;
titleDiv.innerText = title.label;
WinJS.Utilities.addClass(titleDiv, "chartTitleEach");
titleDiv.style.msGridColumn = position;
titleDiv.style.display = (display) ? "block" : "none";
titleDiv.setAttribute("aria-hidden", true);
return titleDiv
}, _getChartHeader: function _getChartHeader(chartType, position) {
var headerParams=WeatherAppJS.UI.HWChartManager._getChartHeaderParams(chartType);
var button=document.createElement('button');
button.style.msGridRow = 1;
button.style.msGridColumn = position;
button.id = headerParams.id;
button.setAttribute("tabindex", "0");
button.addEventListener('keydown', WeatherAppJS.UI.HWChartManager._chartButtonKeydownHandler, false);
WinJS.Utilities.addClass(button, "chartFilterButton win-commandring win-commandicon " + headerParams.icon);
var span=document.createElement("span");
button.appendChild(span);
return button
}, _chartButtonKeydownHandler: function _chartButtonKeydownHandler(evt) {
WeatherAppJS.Utilities.TabIndexManager.handleArrowKeyForAccessibility(evt, true)
}, _getChartHeaderTitleParams: function _getChartHeaderTitleParams(chartType) {
switch (chartType) {
case tempChart:
return {
id: "hwTempHdrTitle", label: resourceFile.getString("TemperatureFilter")
};
case rainfallChart:
return {
id: "hwRainfallHdrTitle", label: resourceFile.getString("RainfallFilter")
};
case sunshineChart:
return {
id: "hwSunshineHdrTitle", label: resourceFile.getString("SunshineFilter")
};
case snowDaysChart:
return {
id: "hwSnowDaysHdrTitle", label: resourceFile.getString("SnowDaysFilter")
};
default:
return null
}
}, _getChartHeaderParams: function _getChartHeaderParams(chartType) {
switch (chartType) {
case tempChart:
return {
icon: "tempChartButton", id: "hwTempHdrIcon"
};
case rainfallChart:
return {
icon: "rainfallChartButton", id: "hwRainfallHdrIcon"
};
case sunshineChart:
return {
icon: "sunshineChartButton", id: "hwSunshineHdrIcon"
};
case snowDaysChart:
return {
icon: "snowdaysChartButton", id: "hwSnowDaysHdrIcon"
};
default:
return null
}
}, _getHeaderAriaText: function _getHeaderAriaText(chartType) {
switch (chartType) {
case tempChart:
return resourceFile.getString("TemperatureAriaText");
case rainfallChart:
return resourceFile.getString("RainfallAriaText");
case sunshineChart:
return resourceFile.getString("SunshineAriaText");
case snowDaysChart:
return resourceFile.getString("SnowAriaText");
default:
return null
}
}, _createXAxis: function _createXAxis() {
var months=WeatherAppJS.Services.Utilities.getAbbreviatedMonthNames();
var c=WeatherAppJS.UI.HWChartManager;
var xaxisPlaceholder=c._clusterPlaceholder.querySelector('.xaxis');
var xaxisTicks=xaxisPlaceholder.querySelectorAll('.monthname');
for (var xtick=0; xtick < xaxisTicks.length; xtick++) {
xaxisTicks[xtick].innerText = months[xtick];
xaxisTicks[xtick].addEventListener('click', (function(index) {
return function() {
c.HandleMonthClick(index)
}
}(xtick)), false)
}
}, _createYAxis: function _createYAxis(maxmin) {
var c=WeatherAppJS.UI.HWChartManager;
var yaxisWrapper=c._clusterPlaceholder.querySelector('.yticksWrapper');
var yGridWrapper=c._clusterPlaceholder.querySelector('.yGridWrapper');
var chartPlot=c._clusterPlaceholder.querySelector('.chart');
var chartHeight=WinJS.Utilities.getTotalHeight(chartPlot);
yaxisWrapper.innerHTML = '';
yGridWrapper.innerHTML = '';
var max=maxmin.max;
var min=maxmin.min;
var step=(chartHeight / (max - min));
var yStep=(max - min) / 8;
var formatInt=WeatherAppJS.Utilities.Formatting.formatInt;
var count=0;
while (min <= max) {
var ytick=document.createElement('div');
WinJS.Utilities.addClass(ytick, 'ytick');
var yGridWire=document.createElement('div');
WinJS.Utilities.addClass(yGridWire, 'gridWire');
if (c._currentChart === tempChart) {
yStep = Math.ceil(yStep);
ytick.innerHTML = c.FormatTickDegChart(min);
WinJS.Utilities.addClass(ytick, 'tempChart')
}
else if (c._currentChart === rainfallChart) {
if (yStep < 0.5) {
yStep = Math.round(yStep * 10) / 10
}
else {
yStep = Math.round(yStep * 5) / 5
}
ytick.innerHTML = c.FormatTickInchesChart(min);
WinJS.Utilities.addClass(ytick, 'rainfallChart')
}
else if (c._currentChart === sunshineChart) {
yStep = Math.ceil(yStep);
ytick.innerHTML = "<span class=\"histYAxisValue sunshineLabel\">" + resourceFile.getString("GraphHoursPerDay").format(formatInt(min)) + "</span>";
WinJS.Utilities.addClass(ytick, 'sunshineChart')
}
else {
yStep = Math.ceil(yStep);
ytick.innerHTML = "<span class=\"histYAxisValue\">" + resourceFile.getString("GraphDays").format(formatInt(min)) + "</span>";
WinJS.Utilities.addClass(ytick, 'snowdaysChart')
}
var marginFromTop=(chartHeight - (step * yStep * count));
ytick.style.marginTop = (marginFromTop <= 7) ? (marginFromTop + 7) + 'px' : (marginFromTop) + 'px';
yGridWire.style.marginTop = (chartHeight) + 'px';
if (count === 0) {
yGridWire.style.marginTop = (chartHeight) + 'px'
}
else {
yGridWire.style.marginTop = -((step * yStep) + 1) + 'px'
}
yaxisWrapper.appendChild(ytick);
yGridWrapper.appendChild(yGridWire);
min = min + yStep;
count++
}
}, _setXAxis: function _setXAxis() {
var c=WeatherAppJS.UI.HWChartManager;
c._createXAxis()
}, _getChartDisplayData: function _getChartDisplayData(chartType, rawData, options) {
var c=WeatherAppJS.UI.HWChartManager;
if (!rawData && c._chartDisplayData[chartType]) {
return c._chartDisplayData[chartType]
}
else {
var displayMetadata;
var chartPlot=c._clusterPlaceholder.querySelector('.chart');
if (chartPlot) {
var arr=rawData.arr;
var yAxisMaxMin=WeatherAppJS.UI.HWChartManager._calculateMaxMin(rawData, chartType);
var chartHeight=WinJS.Utilities.getTotalHeight(chartPlot);
var step=chartHeight / (yAxisMaxMin.max - yAxisMaxMin.min);
var maxValue=null;
var height=null;
displayMetadata = {
fillColor: options.fillColor, barData: []
};
for (var i=0; i < arr.length; i++) {
var tmp={};
if (rawData.isRange) {
maxValue = arr[i][2];
height = maxValue - arr[i][1]
}
else {
maxValue = arr[i][1];
height = maxValue
}
var currStep=(yAxisMaxMin.max - maxValue);
tmp.marginTop = (step * currStep) + 'px';
tmp.height = (step * height) + 'px';
displayMetadata.barData.push(tmp)
}
c._chartDisplayData[chartType] = displayMetadata;
c._createYAxis({
max: yAxisMaxMin.max, min: yAxisMaxMin.min
})
}
return displayMetadata
}
}, _calculateMaxMin: function _calculateMaxMin(data, chartType) {
var max=data.max;
var min=data.min;
var yaxisMax=null;
var yaxisMin=null;
var roundingIndex=1;
if (chartType === tempChart) {
roundingIndex = 5
}
else if (chartType === rainfallChart) {
roundingIndex = 0.5
}
switch (chartType) {
case tempChart:
case sunshineChart:
case snowDaysChart:
if (data.max % roundingIndex === 0) {
yaxisMax = data.max + roundingIndex
}
else {
yaxisMax = (Math.ceil(data.max / roundingIndex)) * roundingIndex
}
if (!data.min) {
yaxisMin = 0
}
else if (data.min % roundingIndex === 0) {
yaxisMin = data.min - roundingIndex
}
else {
yaxisMin = ((Math.floor(data.min / roundingIndex)) * roundingIndex)
}
break;
case rainfallChart:
yaxisMax = Math.ceil(data.max / roundingIndex) * roundingIndex;
yaxisMin = Math.floor(data.min);
break
}
return {
max: yaxisMax, min: yaxisMin, roundingIndex: roundingIndex
}
}, _getChartData: function _getChartData(chartType, hwData) {
var data={};
data.arr = [];
data.max = null;
data.min = null;
data.isRange = false;
var datapoint={};
switch (chartType) {
case tempChart:
for (var tempIndex=0; tempIndex < 12; tempIndex++) {
var monthlyData=hwData.monthlyData[tempIndex];
datapoint = [tempIndex + 1, monthlyData.MinTemp, monthlyData.MaxTemp];
data.arr[tempIndex] = datapoint;
if (data.max === null || monthlyData.MaxTemp > data.max) {
data.max = monthlyData.MaxTemp
}
if (data.min === null || data.min > monthlyData.MinTemp) {
data.min = monthlyData.MinTemp
}
}
data.isRange = true;
break;
case rainfallChart:
for (var rainIndex=0; rainIndex < 12; rainIndex++) {
datapoint = [rainIndex + 1, hwData.monthlyData[rainIndex].Precipitation];
data.arr.push(datapoint);
if (hwData.monthlyData[rainIndex].Precipitation > data.max) {
data.max = hwData.monthlyData[rainIndex].Precipitation
}
}
break;
case sunshineChart:
for (var sunIndex=0; sunIndex < 12; sunIndex++) {
datapoint = [sunIndex + 1, hwData.monthlyData[sunIndex].AvgSunshineHours];
data.arr.push(datapoint);
if (hwData.monthlyData[sunIndex].AvgSunshineHours > data.max) {
data.max = hwData.monthlyData[sunIndex].AvgSunshineHours
}
}
break;
case snowDaysChart:
for (var snowIndex=0; snowIndex < 12; snowIndex++) {
datapoint = [snowIndex + 1, hwData.monthlyData[snowIndex].SnowyDayCount];
data.arr.push(datapoint);
if (hwData.monthlyData[snowIndex].SnowyDayCount > data.max) {
data.max = hwData.monthlyData[snowIndex].SnowyDayCount
}
}
break
}
return data
}, _getChartOptions: function _getChartOptions(chartType) {
switch (chartType) {
case tempChart:
return WeatherAppJS.UI.HWChartManager.GetTempChartOptions();
case rainfallChart:
return WeatherAppJS.UI.HWChartManager.GetRainfallChartOptions();
case sunshineChart:
return WeatherAppJS.UI.HWChartManager.GetSunshineOptions();
case snowDaysChart:
return WeatherAppJS.UI.HWChartManager.GetSnowDayChartOptions();
default:
return null
}
}, GetTempChartOptions: function GetTempChartOptions() {
var that=WeatherAppJS.UI.HWChartManager;
var options={};
options.fillColor = "#F8991D";
return options
}, GetRainfallChartOptions: function GetRainfallChartOptions() {
var that=WeatherAppJS.UI.HWChartManager;
var options={};
options.fillColor = "#8CB9F9";
return options
}, GetSnowDayChartOptions: function GetSnowDayChartOptions() {
var that=WeatherAppJS.UI.HWChartManager;
var options={};
options.fillColor = "#8CB9F9";
return options
}, GetInchesChartOptions: function GetInchesChartOptions() {
var that=WeatherAppJS.UI.HWChartManager;
var options=that.getChartOptions();
return options
}, GetSunshineOptions: function GetSunshineOptions() {
var that=WeatherAppJS.UI.HWChartManager;
var options={};
options.fillColor = "#F8991D";
return options
}, chartHeaderClickHandler: function chartHeaderClickHandler(e) {
var layoutState=Windows.UI.ViewManagement.ApplicationView.value;
var c=WeatherAppJS.UI.HWChartManager;
var chartType=c._getChartForHeaderId(e.target.id);
c._currentChart = chartType;
msWriteProfilerMark("WeatherApp:HWChartFilterChange:s");
switch (chartType) {
case tempChart:
WeatherAppJS.Utilities.Instrumentation.incrementInt32("HWTemperatureFilterClicked");
WeatherAppJS.Utilities.Instrumentation.onClickHWFilter("Temperature", c._currentLocation);
break;
case rainfallChart:
WeatherAppJS.Utilities.Instrumentation.incrementInt32("HWRainfallFilterClicked");
WeatherAppJS.Utilities.Instrumentation.onClickHWFilter("Rainfall", c._currentLocation);
break;
case sunshineChart:
WeatherAppJS.Utilities.Instrumentation.incrementInt32("HWSunshineFilterClicked");
WeatherAppJS.Utilities.Instrumentation.onClickHWFilter("Sunshine", c._currentLocation);
break;
case snowDaysChart:
WeatherAppJS.Utilities.Instrumentation.incrementInt32("HWSnowDaysFilterClicked");
WeatherAppJS.Utilities.Instrumentation.onClickHWFilter("SnowDays", c._currentLocation);
break
}
c.drawChart(chartType);
var header=c._clusterPlaceholder.querySelector('#hwHeaders');
var filters=header.childNodes;
var winjsAddClass=WinJS.Utilities.addClass;
var winjsRemoveClass=WinJS.Utilities.removeClass;
for (var filterIndex=0; filterIndex < filters.length; filterIndex++) {
if (filters[filterIndex].nodeType === 1) {
var filterId=filters[filterIndex].id;
var iconDiv=header.querySelector("#" + filterId);
if (filterId === e.target.id) {
winjsAddClass(iconDiv, "selected")
}
else {
winjsRemoveClass(iconDiv, "selected")
}
}
}
var titleIdToShow=c._getChartHeaderTitleParams(chartType).id;
var titlesPh=c._clusterPlaceholder.querySelector("#hwChartTitle");
var titles=titlesPh.childNodes;
for (var titleIndex=0; titleIndex < titles.length; titleIndex++) {
titles[titleIndex].style.display = (titles[titleIndex].id === titleIdToShow) ? 'block' : 'none'
}
c.SetFocusOnMonth();
msWriteProfilerMark("WeatherApp:HWChartFilterChange:e")
}, _getChartForHeaderId: function _getChartForHeaderId(headerId) {
switch (headerId) {
case"hwTempHdrIcon":
return tempChart;
case"hwRainfallHdrIcon":
return rainfallChart;
case"hwSunshineHdrIcon":
return sunshineChart;
case"hwSnowDaysHdrIcon":
return snowDaysChart;
default:
return null
}
}, drawMonthlyModule: function drawMonthlyModule() {
var c=WeatherAppJS.UI.HWChartManager;
var monthPlaceholder=c._clusterPlaceholder.querySelector("#hwMonthlyModule");
if (monthPlaceholder) {
c.RenderMonthlyModule();
c.RenderMonthlyModuleHorizontal()
}
WinJS.UI.Animation.enterContent(monthPlaceholder, {left: "-20px"});
WeatherAppJS.Utilities.UI.fadeInAsync(monthPlaceholder)
}, GetSelectedMonthIndex: function GetSelectedMonthIndex() {
var c=WeatherAppJS.UI.HWChartManager;
if (c._selectedMonthIndex === null) {
var currentDate=new Date;
var currentMonth=currentDate.getMonth();
c._selectedMonthIndex = currentMonth;
return c._selectedMonthIndex
}
else {
return c._selectedMonthIndex
}
}, RenderMonthlyModule: function RenderMonthlyModule() {
var c=WeatherAppJS.UI.HWChartManager;
if (!c._clusterPlaceholder) {
return null
}
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
var symbolPosition=weatherFormatting.getSymbolPosition();
var setDir=null;
var monthNamePh=c._clusterPlaceholder.querySelector("#hwMonth");
monthNamePh.addEventListener('keydown', WeatherAppJS.Utilities.TabIndexManager.handleArrowKeyForAccessibility, true);
var monthPropertiesPh=c._clusterPlaceholder.querySelector("#hwProperties");
var months=WeatherAppJS.Services.Utilities.getMonthNames();
monthNamePh.innerText = months[c._selectedMonthIndex];
this._monthAriaLabel = monthNamePh.innerText;
var pdiv={};
var propertyValue=null;
var formattedTempDate=null;
var displayUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
if (!displayUnit) {
throw"Settings manager couldn't return display unit";
}
var selectedMonthData=c._data.monthlyData[c._selectedMonthIndex];
var row=0;
if (selectedMonthData.MaxTemp !== '') {
pdiv[row] = c.GetPropertyDiv(row, resourceFile.getString("MonthlyMaxTemp"), weatherFormatting.getTemperatureWithDegreeUnit(selectedMonthData.MaxTemp), symbolPosition);
row = row + 1
}
if (selectedMonthData.MinTemp !== '') {
pdiv[row] = c.GetPropertyDiv(row, resourceFile.getString("MonthlyMinTemp"), weatherFormatting.getTemperatureWithDegreeUnit(selectedMonthData.MinTemp), symbolPosition);
row = row + 1
}
if (selectedMonthData.MaxRecordedTemp !== '') {
setDir = null;
if (selectedMonthData.MaxRecordedTempDate) {
var formattedMaxTemp=weatherFormatting.formatInt(selectedMonthData.MaxRecordedTemp);
propertyValue = resourceFile.getString("RecordTemperatureYear").format(formattedMaxTemp, selectedMonthData.MaxRecordedTempDate)
}
else {
propertyValue = weatherFormatting.getTemperatureWithDegreeUnit(selectedMonthData.MaxRecordedTemp);
setDir = symbolPosition
}
pdiv[row] = c.GetPropertyDiv(row, resourceFile.getString("MonthlyRecordedHighTemp"), propertyValue, setDir);
row = row + 1
}
if (selectedMonthData.MinRecordedTemp !== '') {
setDir = null;
if (selectedMonthData.MinRecordedTempDate) {
var formattedMinTemp=weatherFormatting.formatInt(selectedMonthData.MinRecordedTemp);
propertyValue = resourceFile.getString("RecordTemperatureYear").format(formattedMinTemp, selectedMonthData.MinRecordedTempDate)
}
else {
propertyValue = weatherFormatting.getTemperatureWithDegreeUnit(selectedMonthData.MinRecordedTemp);
setDir = symbolPosition
}
pdiv[row] = c.GetPropertyDiv(row, resourceFile.getString("MonthlyRecordedLowTemp"), propertyValue, setDir);
row = row + 1
}
if (selectedMonthData.Precipitation !== '') {
pdiv[row] = c.GetPropertyDiv(row, resourceFile.getString("MonthlyRainfall"), weatherFormatting.getLengthUnitForHW(selectedMonthData.Precipitation, displayUnit));
row = row + 1
}
if (selectedMonthData.SnowyDayCount !== '') {
pdiv[row] = c.GetPropertyDiv(row, resourceFile.getString("MonthlySnowDays"), weatherFormatting.getDaysUnit(selectedMonthData.SnowyDayCount));
row = row + 1
}
if (selectedMonthData.AvgSunshineHours !== '') {
pdiv[row] = c.GetPropertyDiv(row, resourceFile.getString("MonthlySunshine"), weatherFormatting.getHoursPerDayUnit(selectedMonthData.AvgSunshineHours));
row = row + 1
}
if (selectedMonthData.RainyDayCount !== '') {
pdiv[row] = c.GetPropertyDiv(row, resourceFile.getString("MonthlyRainyDays"), weatherFormatting.getDaysUnit(selectedMonthData.RainyDayCount));
row = row + 1
}
if (selectedMonthData.SeaTemp !== '') {
pdiv[row] = c.GetPropertyDiv(row, resourceFile.getString("MonthlySeaTemp"), weatherFormatting.getTemperatureWithDegreeUnit(selectedMonthData.SeaTemp), symbolPosition);
row = row + 1
}
monthPropertiesPh.innerHTML = "";
for (var i=0; i < row; i++) {
monthPropertiesPh.appendChild(pdiv[i])
}
}, GetPropertyDiv: function GetPropertyDiv(row, nameText, value, symbolPosition) {
var winjsAddClass=WinJS.Utilities.addClass;
var idiv=document.createElement('tr');
winjsAddClass(idiv, 'hwPropertyDiv');
var propertyNameDiv=document.createElement('td');
var propertyValueDiv=document.createElement('td');
var propertyValueSpan=document.createElement('span');
propertyValueDiv.appendChild(propertyValueSpan);
propertyNameDiv.innerText = nameText;
propertyValueSpan.innerHTML = value;
winjsAddClass(propertyNameDiv, "hwPropertyName");
winjsAddClass(propertyNameDiv, "clearFloats");
winjsAddClass(propertyValueDiv, "hwPropertyValue");
if (symbolPosition) {
propertyValueSpan.setAttribute("dir", symbolPosition)
}
idiv.appendChild(propertyNameDiv);
idiv.appendChild(propertyValueDiv);
this._monthAriaLabel = this._monthAriaLabel + "\n" + nameText + "," + value.replace("-", " minus ");
return idiv
}, RenderMonthlyModuleHorizontal: function RenderMonthlyModuleHorizontal() {
var c=WeatherAppJS.UI.HWChartManager;
var weatherFormatting=WeatherAppJS.Utilities.Formatting;
var symbolPosition=weatherFormatting.getSymbolPosition();
var setDir=null;
if (c._selectedMonthIndex === null) {
var today=new Date;
var month=today.getMonth();
c._selectedMonthIndex = month
}
if (c._clusterPlaceholder) {
var monthNamePh=c._clusterPlaceholder.querySelector("#hwMonthHistorical");
var monthPropertiesLeftPh=c._clusterPlaceholder.querySelector("#hwHistoricalLeftProperties");
var months=WeatherAppJS.Services.Utilities.getMonthNames();
monthNamePh.innerText = months[c._selectedMonthIndex];
var pdiv={};
var propertyValue=null;
var formattedTempDate=null;
var displayUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
if (!displayUnit) {
throw"Settings manager couldn't return display unit";
}
var selectedMonthData=c._data.monthlyData[c._selectedMonthIndex];
var row=0;
if (selectedMonthData.MaxTemp !== '') {
pdiv[row] = c.GetHistoricalPortraitPropertyDiv(row, resourceFile.getString("MonthlyMaxTemp"), weatherFormatting.getTemperatureWithDegreeUnit(selectedMonthData.MaxTemp), symbolPosition);
row = row + 1
}
if (selectedMonthData.MinTemp !== '') {
pdiv[row] = c.GetHistoricalPortraitPropertyDiv(row, resourceFile.getString("MonthlyMinTemp"), weatherFormatting.getTemperatureWithDegreeUnit(selectedMonthData.MinTemp), symbolPosition);
row = row + 1
}
if (selectedMonthData.MaxRecordedTemp !== '') {
setDir = null;
if (selectedMonthData.MaxRecordedTempDate) {
var formattedMaxTemp=weatherFormatting.formatInt(selectedMonthData.MaxRecordedTemp);
propertyValue = resourceFile.getString("RecordTemperatureYear").format(formattedMaxTemp, selectedMonthData.MaxRecordedTempDate)
}
else {
propertyValue = weatherFormatting.getTemperatureWithDegreeUnit(selectedMonthData.MaxRecordedTemp);
setDir = symbolPosition
}
pdiv[row] = c.GetHistoricalPortraitPropertyDiv(row, resourceFile.getString("MonthlyRecordedHighTemp"), propertyValue, setDir);
row = row + 1
}
if (selectedMonthData.MinRecordedTemp !== '') {
setDir = null;
if (selectedMonthData.MinRecordedTempDate) {
var formattedMinTemp=weatherFormatting.formatInt(selectedMonthData.MinRecordedTemp);
propertyValue = resourceFile.getString("RecordTemperatureYear").format(formattedMinTemp, selectedMonthData.MinRecordedTempDate)
}
else {
propertyValue = weatherFormatting.getTemperatureWithDegreeUnit(selectedMonthData.MinRecordedTemp);
setDir = symbolPosition
}
pdiv[row] = c.GetHistoricalPortraitPropertyDiv(row, resourceFile.getString("MonthlyRecordedLowTemp"), propertyValue, setDir);
row = row + 1
}
if (selectedMonthData.Precipitation !== '') {
pdiv[row] = c.GetHistoricalPortraitPropertyDiv(row, resourceFile.getString("MonthlyRainfall"), weatherFormatting.getLengthUnitForHW(selectedMonthData.Precipitation, displayUnit));
row = row + 1
}
if (row <= 5) {
monthPropertiesLeftPh.innerHTML = "";
for (var i=0; i < row; i++) {
monthPropertiesLeftPh.appendChild(pdiv[i])
}
}
var monthPropertiesRightPh=c._clusterPlaceholder.querySelector("#hwHistoricalRightProperties");
row = 0;
if (selectedMonthData.SnowyDayCount !== '') {
pdiv[row] = c.GetHistoricalPortraitPropertyDiv(row, resourceFile.getString("MonthlySnowDays"), weatherFormatting.getDaysUnit(selectedMonthData.SnowyDayCount));
row = row + 1
}
if (selectedMonthData.AvgSunshineHours !== '') {
pdiv[row] = c.GetHistoricalPortraitPropertyDiv(row, resourceFile.getString("MonthlySunshine"), weatherFormatting.getHoursPerDayUnit(selectedMonthData.AvgSunshineHours));
row = row + 1
}
if (selectedMonthData.RainyDayCount !== '') {
pdiv[row] = c.GetHistoricalPortraitPropertyDiv(row, resourceFile.getString("MonthlyRainyDays"), weatherFormatting.getDaysUnit(selectedMonthData.RainyDayCount));
row = row + 1
}
if (selectedMonthData.SeaTemp !== '') {
pdiv[row] = c.GetHistoricalPortraitPropertyDiv(row, resourceFile.getString("MonthlySeaTemp"), weatherFormatting.getTemperatureWithDegreeUnit(selectedMonthData.SeaTemp), symbolPosition);
row = row + 1
}
monthPropertiesRightPh.innerHTML = "";
for (var rowIndex=0; rowIndex < row; rowIndex++) {
monthPropertiesRightPh.appendChild(pdiv[rowIndex])
}
}
}, GetHistoricalPortraitPropertyDiv: function GetHistoricalPortraitPropertyDiv(row, nameText, value, symbolPosition) {
var winjsAddClass=WinJS.Utilities.addClass;
var idiv=document.createElement('tr');
winjsAddClass(idiv, 'hwPropertyDiv');
winjsAddClass(idiv, 'hwPropertyRow');
var propertyNameDiv=document.createElement('td');
var propertyValueDiv=document.createElement('td');
var propertyValueSpan=document.createElement('span');
propertyValueDiv.appendChild(propertyValueSpan);
propertyNameDiv.innerText = nameText;
propertyValueSpan.innerHTML = value;
winjsAddClass(propertyNameDiv, "hwPropertyName");
winjsAddClass(propertyValueDiv, "hwPropertyValue");
if (symbolPosition) {
propertyValueSpan.setAttribute("dir", symbolPosition)
}
idiv.appendChild(propertyNameDiv);
idiv.appendChild(propertyValueDiv);
return idiv
}, HandleMonthClick: function HandleMonthClick(monthIndex) {
msWriteProfilerMark("WeatherApp:HWChartMonthChange:s");
var c=WeatherAppJS.UI.HWChartManager;
c._selectedMonthIndex = monthIndex;
var eventAttr={
location: c._currentLocation, chartType: c._currentChart, monthIndex: monthIndex
};
Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Historical Weather", "Month", Microsoft.Bing.AppEx.Telemetry.UserActionOperation.select, PlatformJS.Utilities.getLastClickUserActionMethod(), 0, JSON.stringify(eventAttr));
var monthPlaceholder=document.querySelector("#hwMonthlyModule");
c.drawMonthlyModule();
c.setMonthAriaLabel(c._selectedMonthIndex);
c._highlightSelectedMonth();
c.SetFocusOnMonth();
msWriteProfilerMark("WeatherApp:HWChartMonthChange:e")
}, setMonthAriaLabel: function setMonthAriaLabel(monthIndex) {
var labels=WeatherAppJS.UI.HWChartManager._clusterPlaceholder.querySelectorAll(".month");
var newMonth=labels[monthIndex];
newMonth.setAttribute("aria-label", this._monthAriaLabel)
}, FormatTickDegChart: function FormatTickDegChart(val, axis) {
var formatting=WeatherAppJS.Utilities.Formatting;
var symbolPosition=formatting.getSymbolPosition();
return "<span class=\"histYAxisValue\" dir=\"" + symbolPosition + "\">" + formatting.getTemperatureWithDegreeUnit(val) + "</span>"
}, FormatTickInchesChart: function FormatTickInchesChart(val, axis) {
if (val !== Math.floor(val)) {
val = val.toFixed(2)
}
var displayUnit=WeatherAppJS.SettingsManager.getDisplayUnit();
return "<span class=\"histYAxisValue\">" + WeatherAppJS.Utilities.Formatting.getLengthUnitForHW(val, displayUnit) + "</span>"
}, SetFocusOnMonth: function SetFocusOnMonth() {
var c=WeatherAppJS.UI.HWChartManager;
var monthList=c._clusterPlaceholder.querySelectorAll('.month');
var currentMonth=monthList[c._selectedMonthIndex];
currentMonth.focus()
}, HandleKeyboardEvent: function HandleKeyboardEvent(event) {
switch (event.keyCode) {
case WinJS.Utilities.Key.enter:
case WinJS.Utilities.Key.space:
WeatherAppJS.UI.HWChartManager.chartHeaderClickHandler(event);
break;
default:
break
}
}, SetArrowKeyHandler: function SetArrowKeyHandler() {
var c=WeatherAppJS.UI.HWChartManager;
var tickLabels=c._clusterPlaceholder.querySelectorAll(".month");
var isLTR=WeatherAppJS.Utilities.Common.getDirection() === "ltr" ? true : false;
for (var index=0, len=tickLabels.length; index < len; index++) {
tickLabels[index].addEventListener("keydown", function(event) {
var newMonthIndex=-1;
var month=event.currentTarget;
switch (event.keyCode) {
case WinJS.Utilities.Key.leftArrow:
newMonthIndex = isLTR ? c._selectedMonthIndex - 1 : c._selectedMonthIndex + 1;
event.stopImmediatePropagation();
event.preventDefault();
break;
case WinJS.Utilities.Key.rightArrow:
newMonthIndex = isLTR ? c._selectedMonthIndex + 1 : c._selectedMonthIndex - 1;
event.stopImmediatePropagation();
event.preventDefault();
break
}
if (newMonthIndex >= 0 && newMonthIndex < 12) {
var labels=event.currentTarget.parentNode.querySelectorAll(".month");
var newMonth=labels[newMonthIndex];
newMonth.tabIndex = "0";
c.HandleMonthClick(newMonthIndex);
this.blur();
this.tabIndex = "-1";
this.removeAttribute("aria-label")
}
})
}
}, addChartAttributions: function addChartAttributions() {
var c=WeatherAppJS.UI.HWChartManager;
var attributionPlaceholder=c._clusterPlaceholder.querySelector("#hwAttributions");
var attrib1=attributionPlaceholder.querySelector('#hwAttrib1');
var attribText1=attrib1.querySelector('.attribtext');
var sunshineSeaTempAttrib=document.createElement('A');
var ariaText="";
if (c._data.seaTempProvider !== undefined && c._data.seaTempProvider !== null && c._data.seaTempProvider.provider !== '') {
sunshineSeaTempAttrib.setAttribute('href', WeatherAppJS.Utilities.Common.getProviderAttributionUrl(c._data.seaTempProvider.provider));
sunshineSeaTempAttrib.innerText = c._data.seaTempProvider.provider;
attrib1.appendChild(sunshineSeaTempAttrib);
attribText1.innerText = resourceFile.getString("SunshineAndSeaTempAttribution");
ariaText = resourceFile.getString("SunshineAndSeaTempAttributionAriaText").format(c._data.seaTempProvider.provider)
}
else if (c._data.sunshineHrsProvider !== undefined && c._data.sunshineHrsProvider !== null && c._data.sunshineHrsProvider.provider !== '') {
sunshineSeaTempAttrib.setAttribute('href', WeatherAppJS.Utilities.Common.getProviderAttributionUrl(c._data.sunshineHrsProvider.provider));
sunshineSeaTempAttrib.innerText = c._data.sunshineHrsProvider.provider;
attrib1.appendChild(sunshineSeaTempAttrib);
attribText1.innerText = resourceFile.getString("SunshineAttribution");
ariaText = resourceFile.getString("SunshineAttributionAriaText").format(c._data.sunshineHrsProvider.provider)
}
if (sunshineSeaTempAttrib) {
sunshineSeaTempAttrib.id = "autoID_SunshineSeaTempAttribution";
sunshineSeaTempAttrib.setAttribute("aria-label", ariaText);
sunshineSeaTempAttrib.tabIndex = "0";
sunshineSeaTempAttrib.addEventListener('click', function(event) {
WeatherAppJS.Utilities.Instrumentation.onClickAttribution(this.textContent, 'Historical Weather')
})
}
}, _computeChartSize: function _computeChartSize() {
var c=WeatherAppJS.UI.HWChartManager;
var that=this;
if (!that._chartDisplayData) {
return
}
var chartMaxWidth=that.chartWidth;
var chartMinWidth=500;
var clusterMaxHeight=that.clusterHeight;
var clusterMinHeight=517;
var chartContainer=c._clusterPlaceholder.querySelector(".chart");
var historicalClusterWrapper=c._clusterPlaceholder.querySelector(".chartClusterWrapper");
var xAxisContainer=c._clusterPlaceholder.querySelector(".xaxis");
var yGridContainer=c._clusterPlaceholder.querySelector(".yGrid");
var hwChartContainer=c._clusterPlaceholder.querySelector("#hwChart");
var chartYAxisWrapperContainer=c._clusterPlaceholder.querySelector(".wrapper");
var months=c._clusterPlaceholder.querySelectorAll(".month");
var yaxis=c._clusterPlaceholder.querySelector(".yaxis");
if (chartContainer && xAxisContainer && yGridContainer && hwChartContainer && chartYAxisWrapperContainer && yGridContainer && months && yaxis) {
var displayData=PlatformJS.Utilities.getDisplayData();
var screenWidth=(displayData && displayData.innerWidth) ? displayData.innerWidth : window.innerWidth;
var screenHeight=(displayData && displayData.innerHeight) ? (displayData.innerHeight - 226) : (window.innerHeight - 226);
var tempContainerWidth=(screenWidth >= chartMinWidth && screenWidth <= chartMaxWidth) ? screenWidth : (screenWidth > chartMaxWidth ? chartMaxWidth : chartMinWidth);
var tempContainerHeight=(screenHeight >= clusterMinHeight && screenHeight <= clusterMaxHeight) ? screenHeight : (screenHeight > clusterMaxHeight ? clusterMaxHeight : clusterMinHeight);
var chartContainerWidth=tempContainerWidth;
var chartContainerHeight=tempContainerWidth / 0.8;
if (chartContainerHeight > tempContainerHeight) {
chartContainerHeight = tempContainerHeight;
if (tempContainerWidth > tempContainerHeight * 1.2) {
chartContainerWidth = tempContainerHeight * 1.2
}
else {
chartContainerWidth = tempContainerWidth
}
}
var yaxiswidth=PlatformJS.BootCache.instance.getEntry("yaxisWidth", function() {
return yaxis.clientWidth
});
chartContainer.style.width = chartContainerWidth - yaxiswidth + "px";
xAxisContainer.style.width = chartContainerWidth - yaxiswidth + "px";
yGridContainer.style.width = chartContainerWidth - yaxiswidth + "px";
hwChartContainer.style.width = chartContainerWidth + "px";
hwChartContainer.style.height = chartContainerHeight + "px";
chartYAxisWrapperContainer.style.height = chartContainerHeight - 20 + "px";
yGridContainer.style.height = chartContainerHeight - 20 + "px";
for (var i=0; i < months.length; i++) {
months[i].style.height = chartContainerHeight - 20 + "px"
}
}
}, resize: function resize() {
msSetImmediate(function() {
var c=WeatherAppJS.UI.HWChartManager;
if (c && c._currentChart && c._clusterPlaceholder) {
c.drawChart(c._currentChart)
}
})
}
})
})()