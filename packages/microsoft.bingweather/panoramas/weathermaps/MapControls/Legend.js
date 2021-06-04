/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Maps", {Legend: WinJS.Class.define(function(element, options) {
var that=this;
element = element || document.createElement("div");
element.winControl = this;
this._setOptions(options);
this._init(element)
}, {
_domElement: null, _setOptions: function _setOptions(options){}, _init: function _init(element) {
var that=this;
that._domElement = element
}, render: function render(legendConfig) {
var that=this;
that._domElement.innerHTML = "";
var legendContainer=that._domElement;
WinJS.Utilities.addClass(that._domElement, "mapsLegendContainer");
that._domElement.setAttribute('dir', 'ltr');
for (var l in legendConfig) {
var legend=legendConfig[l];
var url,
height,
width,
margin,
labels,
layoutScheme,
startOffset,
endOffset,
icon,
unit;
url = legend.url,
height = legend.height,
width = legend.width,
margin = legend.margin;
labels = legend.labels,
layoutScheme = legend.layoutScheme,
icon = legend.icon;
unit = legend.unit;
startOffset = legend.startOffset;
if (legend.endOffset) {
endOffset = width - legend.endOffset
}
var legendPlaceholder=that._createLegendSkeleton(legendContainer, height, width, margin);
that._renderImage(legendPlaceholder, url, icon);
that._renderLabels(legendPlaceholder, labels, layoutScheme, width, startOffset, endOffset);
that._renderUnit(legendPlaceholder, labels, unit, width, startOffset, endOffset);
that._renderIcon(legendPlaceholder, icon, width)
}
}, _createLegendSkeleton: function _createLegendSkeleton(legendContainer, height, width, margin) {
var legendPlaceholder=document.createElement("div");
WinJS.Utilities.addClass(legendPlaceholder, "mapsLegend");
var imageDiv=document.createElement("div");
WinJS.Utilities.addClass(imageDiv, "legendImage");
imageDiv.style.height = height + "px";
var gapDiv=document.createElement("div");
WinJS.Utilities.addClass(gapDiv, "legendImageLabelGap");
var labelsDiv=document.createElement("div");
WinJS.Utilities.addClass(labelsDiv, "legendLabels");
labelsDiv.setAttribute("dir", WeatherAppJS.Utilities.Formatting.getSymbolPosition());
legendPlaceholder.appendChild(labelsDiv);
legendPlaceholder.appendChild(gapDiv);
legendPlaceholder.appendChild(imageDiv);
legendPlaceholder.style.width = width + "px";
legendPlaceholder.style.marginRight = margin ? margin + "px" : "0px";
legendContainer.appendChild(legendPlaceholder);
return legendPlaceholder
}, _renderImage: function _renderImage(legendPlaceholder, url, icon) {
var imageDiv=legendPlaceholder.querySelector(".legendImage");
var legendImage=new CommonJS.ImageCard(imageDiv, {noIdentifier: 1});
legendImage.imageSource = {
url: url, cacheId: "StaticMapsImageCache"
};
legendImage.alternateText = icon ? PlatformJS.Services.resourceLoader.getString(icon + "Legend") : " "
}, _renderLabels: function _renderLabels(legendPlaceholder, labels, layoutScheme, width, startOffset, endOffset) {
var that=this;
if (layoutScheme === WeatherAppJS.Maps.Legend.layoutScheme.centered) {
if (!startOffset && !endOffset) {
that._renderLabelsCentered(legendPlaceholder, labels, 0, width)
}
else {
that._renderLabelsCentered(legendPlaceholder, labels, startOffset, endOffset)
}
}
else {
that._renderLabelsJustified(legendPlaceholder, labels, 0, width)
}
}, _renderUnit: function _renderUnit(legendPlaceholder, labels, unit, width, startOffset, endOffset) {
var that=this;
if (!unit) {
return
}
var unitDiv=document.createElement("div");
WinJS.Utilities.addClass(unitDiv, "legendUnit");
var locUnit="",
offset;
var lcUnit=unit.toLowerCase();
if (lcUnit === 'c') {
unitDiv.style.right = "0px";
WinJS.Utilities.addClass(unitDiv, "legendIcon legendIconC")
}
else if (lcUnit === 'f') {
unitDiv.style.right = "0px";
WinJS.Utilities.addClass(unitDiv, "legendIcon legendIconF")
}
else if (lcUnit === "mm/h") {
locUnit = PlatformJS.Services.resourceLoader.getString("mmPerHour");
offset = endOffset + ((endOffset - startOffset) / (2 * labels.length));
unitDiv.innerText = locUnit;
unitDiv.style.left = offset + "px"
}
else if (lcUnit === "in/h") {
locUnit = PlatformJS.Services.resourceLoader.getString("inPerHour");
offset = endOffset + ((endOffset - startOffset) / (2 * labels.length));
unitDiv.innerText = locUnit;
unitDiv.style.left = offset + "px"
}
var labelsDiv=legendPlaceholder.querySelector(".legendLabels");
labelsDiv.appendChild(unitDiv)
}, _renderIcon: function _renderIcon(legendPlaceholder, icon, width) {
var that=this;
if (!icon || icon === "") {
return
}
var iconDiv=document.createElement("div");
WinJS.Utilities.addClass(iconDiv, "legendIcon");
var lcIcon=icon.toLowerCase();
var iconClass="legendIcon" + lcIcon;
WinJS.Utilities.addClass(iconDiv, iconClass);
iconDiv.style.left = ((width / 2) - 10) + "px";
var labelsDiv=legendPlaceholder.querySelector(".legendLabels");
labelsDiv.appendChild(iconDiv)
}, _renderLabelsJustified: function _renderLabelsJustified(legendPlaceholder, labels, startOffset, endOffset) {
var that=this;
var offsetLeft,
maxWidth;
if (!labels || labels.length < 1) {
return
}
var labelsDiv=legendPlaceholder.querySelector(".legendLabels");
var labelDiv,
labelText;
var numLabels=labels.length;
maxWidth = (endOffset - startOffset) / numLabels;
if (labels[0]) {
labelDiv = document.createElement("div");
WinJS.Utilities.addClass(labelDiv, "legendLabel");
labelText = that._getLabelText(labels[0]);
labelDiv.style.maxWidth = maxWidth + "px";
labelDiv.innerText = labelText;
labelDiv.style.left = "0px";
labelDiv.style.textAlign = "left";
labelsDiv.appendChild(labelDiv)
}
if (labels[numLabels - 1]) {
labelDiv = document.createElement("div");
WinJS.Utilities.addClass(labelDiv, "legendLabel");
labelText = that._getLabelText(labels[numLabels - 1]);
labelDiv.style.maxWidth = maxWidth + "px";
labelDiv.innerText = labelText;
labelDiv.style.right = "0px";
labelDiv.style.textAlign = "right";
labelsDiv.appendChild(labelDiv)
}
if (numLabels <= 2) {
return
}
var centeredLabels=[];
for (var i=1; i < numLabels - 2; i++) {
centeredLabels.push(labels[i])
}
that._renderLabelsCentered(legendPlaceholder, centeredLabels, (startOffset + maxWidth), (endOffset - maxWidth))
}, _renderLabelsCentered: function _renderLabelsCentered(legendPlaceholder, labels, startOffset, endOffset) {
var that=this;
var offsetLeft,
maxWidth;
if (!labels || labels.length < 1) {
return
}
var labelsDiv=legendPlaceholder.querySelector(".legendLabels");
var numLabels=labels.length;
maxWidth = (endOffset - startOffset) / (numLabels - 1);
for (var i=0; i < numLabels; i++) {
var labelDiv=document.createElement("div");
WinJS.Utilities.addClass(labelDiv, "legendLabel");
var labelText=that._getLabelText(labels[i]);
offsetLeft = (startOffset - (maxWidth / 2)) + (maxWidth * i);
labelDiv.style.maxWidth = maxWidth + "px";
labelDiv.style.width = maxWidth + "px";
labelDiv.style.textAlign = "center";
labelDiv.innerText = labelText;
labelDiv.style.left = offsetLeft + "px";
labelsDiv.appendChild(labelDiv)
}
}, _getLabelText: function _getLabelText(legLabel) {
var labelText;
if (isFinite(legLabel)) {
labelText = WeatherAppJS.Utilities.Formatting.formatInt(legLabel)
}
else {
var resourceKey=legLabel + "Legend";
labelText = PlatformJS.Services.resourceLoader.getString(resourceKey)
}
return labelText
}, dispose: function dispose() {
this._domElement.innerHTML = ""
}
}, {
layoutScheme: {
centered: 1, justified: 2
}, createConfig: function createConfig(LegendDataList) {
var legendsConfig=[];
if (LegendDataList) {
for (var i=0; i < LegendDataList.length; i++) {
var legend={};
var legendRsp=LegendDataList[i];
legend.url = legendRsp.LegendUrl;
legend.height = +legendRsp.LegendHeight;
legend.width = +legendRsp.LegendWidth;
legend.startOffset = +legendRsp.StartOffset;
legend.endOffset = +legendRsp.EndOffset;
legend.margin = +legendRsp.Padding;
legend.icon = legendRsp.Glyph;
legend.unit = legendRsp.LegendUnit;
legend.layoutScheme = (legendRsp.Layout === "1") ? WeatherAppJS.Maps.Legend.layoutScheme.centered : WeatherAppJS.Maps.Legend.layoutScheme.justified;
legend.labels = legendRsp.LegendLabels;
legendsConfig.push(legend)
}
}
return legendsConfig
}
})})
})()