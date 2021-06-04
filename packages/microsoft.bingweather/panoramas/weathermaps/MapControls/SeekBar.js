/*  © Microsoft. All rights reserved. */
(function() {
'use strict';
WinJS.Namespace.define("WeatherAppJS.Maps", {SeekBar: WinJS.Class.define(function(element, options) {
var that=this;
element = element || document.createElement("div");
element.winControl = this;
this._init(element);
WinJS.UI.setOptions(this, options)
}, {
_domElement: null, _slider: null, _playButton: null, _timerLabel: null, _animationTimer: null, _frameDelay: 0, _animationEndDelay: 0, _currentTickWidth: 0, _totalTicksToSkip: 0, _animationCompletedOnce: false, isEnabled: false, isMouseOver: false, _init: function _init(element) {
this._domElement = element;
WinJS.Utilities.addClass(this._domElement, "seekBarContainer");
this._slider = document.createElement("input");
this._slider.setAttribute("type", "range");
this._slider.value = 0;
this._slider.tickValues = [];
WinJS.Utilities.addClass(this._slider, "sbSlider");
var sliderDiv=document.createElement("div");
WinJS.Utilities.addClass(sliderDiv, "sbSliderDiv");
sliderDiv.appendChild(this._slider);
var playButtonDiv=document.createElement("div");
WinJS.Utilities.addClass(playButtonDiv, "sbPlayButtonDiv");
this._playButton = document.createElement("button");
var appCmdButton=new WinJS.UI.AppBarCommand(this._playButton, {icon: "play"});
WinJS.Utilities.addClass(this._playButton, "sbPlayButton");
playButtonDiv.appendChild(this._playButton);
this._timerLabel = document.createElement("div");
WinJS.Utilities.addClass(this._timerLabel, "sbTimerLabel");
this._sliderTicksSurface = document.createElement("div");
WinJS.Utilities.addClass(this._sliderTicksSurface, "sbSliderTicksSurface");
this._sliderTickValuesContainer = document.createElement("div");
WinJS.Utilities.addClass(this._sliderTickValuesContainer, "sbSliderTickValuesContainer");
this._sliderTicksSurface.appendChild(this._sliderTickValuesContainer);
this._sliderTickValuesDiv = document.createElement("div");
WinJS.Utilities.addClass(this._sliderTickValuesDiv, "sbSliderTickValuesDiv");
this._sliderTickValuesContainer.appendChild(this._sliderTickValuesDiv);
this._sliderCurrentTick = document.createElement('div');
WinJS.Utilities.addClass(this._sliderCurrentTick, "sbSliderCurrentTick hideModule");
sliderDiv.appendChild(this._sliderCurrentTick);
this._domElement.appendChild(this._sliderTicksSurface);
this._domElement.appendChild(sliderDiv);
this._domElement.appendChild(playButtonDiv);
this._domElement.appendChild(this._timerLabel);
this._registerEventHandlers();
this.disable();
this.initSliderValues(0, 0, 0);
this._bindableResizeHandler = this.onResize.bind(this);
window.addEventListener('resize', this._bindableResizeHandler, false)
}, onResize: function onResize() {
this.update()
}, _onPlayButtonClick: function _onPlayButtonClick(event) {
this.isPlaying = !this.isPlaying
}, _registerEventHandlers: function _registerEventHandlers() {
var that=this;
if (that._playButton) {
that._playButton.addEventListener("click", that._onPlayButtonClick.bind(that), false)
}
if (that._slider) {
that._slider.addEventListener("change", sliderChanged, false);
that._slider.addEventListener("keydown", preventInteraction, false);
that._slider.addEventListener("MSPointerDown", preventInteraction, false);
that._slider.addEventListener("keyup", preventInteraction, false);
that._slider.addEventListener("MSPointerUp", preventInteraction, false);
that._slider.addEventListener("MSPointerCancel", preventInteraction, false);
that._slider.addEventListener("mouseover", setMouseOver, false);
that._slider.addEventListener("mouseout", setMouseOver, false)
}
function sliderChanged() {
that.dispatchEvent("sliderchanged", {value: that.sliderValue});
that._updateCurrentTick()
}
function preventInteraction(evt) {
if (evt.keyCode !== WinJS.Utilities.Key.tab) {
evt.preventDefault()
}
}
function setMouseOver() {
if (that.isMouseOver) {
that.isMouseOver = false
}
else {
that.isMouseOver = true
}
}
}, _processAnimationFrame: function _processAnimationFrame() {
var that=this;
var pauseDelay=0;
if (this.isPlaying) {
this.sliderValue = ((parseInt(this.sliderValue) + 1) % (parseInt(this.sliderMaxValue) + 1));
this.dispatchEvent("sliderchanged", {value: that.sliderValue});
if (this.sliderValue === this.sliderMaxValue) {
pauseDelay = that._animationEndDelay;
if (!that._animationCompletedOnce) {
this.dispatchEvent("animationcompleted", {});
that._animationCompletedOnce = true
}
}
window.requestAnimationFrame(function() {
clearTimeout(that._animationTimer);
that._animationTimer = setTimeout(function() {
that._processAnimationFrame()
}, that._frameDelay + pauseDelay);
pauseDelay = 0
})
}
}, _updateCurrentTick: function _updateCurrentTick() {
var that=this;
that._sliderCurrentTick.innerText = that._slider.tickValues[that.sliderValue];
if (!that._currentTickWidth) {
var tick=document.querySelector('.tickValue');
that._currentTickWidth = parseInt(window.getComputedStyle(tick).width)
}
that._sliderCurrentTick.style.marginLeft = (-40 + (that._currentTickWidth * that.sliderValue / that._totalTicksToSkip)) + 'px'
}, toggleSliderTicksSurfaceHeight: function toggleSliderTicksSurfaceHeight(increase) {
var that=this;
if (increase) {
WinJS.Utilities.addClass(that._sliderTicksSurface, "sbSliderTicksSurfaceLarge")
}
else {
WinJS.Utilities.removeClass(that._sliderTicksSurface, "sbSliderTicksSurfaceLarge")
}
}, togglePlayButtonDisplay: function togglePlayButtonDisplay(show) {
var that=this;
if (show) {
WinJS.Utilities.removeClass(that._playButton, "hidePlayButton")
}
else {
WinJS.Utilities.addClass(that._playButton, "hidePlayButton")
}
}, toggleTickValues: function toggleTickValues(show) {
var that=this;
if (show) {
WinJS.Utilities.removeClass(that._sliderTickValuesDiv, "hideModule")
}
else {
WinJS.Utilities.addClass(that._sliderTickValuesDiv, "hideModule")
}
}, toggleCurrentTickDisplay: function toggleCurrentTickDisplay(show) {
var that=this;
if (show) {
WinJS.Utilities.removeClass(that._sliderCurrentTick, "hideModule")
}
else {
WinJS.Utilities.addClass(that._sliderCurrentTick, "hideModule")
}
}, setTickValues: function setTickValues(tickArray) {
var that=this;
var sliderTicks=document.querySelector('.sbSliderTickValuesDiv');
if (sliderTicks) {
var totalLength=parseInt(window.getComputedStyle(sliderTicks).width);
that._sliderTickValuesDiv.innerHTML = '';
if (tickArray && tickArray.length > 0) {
that._slider.tickValues = tickArray
}
var totalTickValues=that._slider.tickValues.length;
if (totalTickValues > 16) {
that._totalTicksToSkip = 4
}
else {
that._totalTicksToSkip = 2
}
var eachTickSize=totalLength / totalTickValues;
for (var i=0; i < totalTickValues; i++) {
if (i % that._totalTicksToSkip === 0) {
var tick=document.createElement('div');
WinJS.Utilities.addClass(tick, 'tickValue');
if (i + that._totalTicksToSkip <= totalTickValues) {
tick.style.width = (eachTickSize * that._totalTicksToSkip) + 'px'
}
tick.innerText = that._slider.tickValues[i];
that._sliderTickValuesDiv.appendChild(tick)
}
}
}
}, play: function play() {
if (this.sliderMaxValue !== 0 && !this._animationTimer) {
this._frameDelay = MapConfigs.getMapScenarioConfigItem("AnimationFrameDelayInMilliseconds").value;
this._animationEndDelay = MapConfigs.getMapScenarioConfigItem("AnimationEndDelayInMilliseconds").value;
this._processAnimationFrame()
}
}, pause: function pause() {
clearTimeout(this._animationTimer);
this._animationTimer = null
}, resetAnimation: function resetAnimation() {
this.sliderValue = 0;
this.isPlaying = false;
clearTimeout(this._animationTimer);
this._animationTimer = null
}, enable: function enable() {
var that=this;
if (that._playButton) {
that._playButton.removeAttribute("disabled")
}
if (that._slider) {
that._slider.removeAttribute("disabled")
}
that.isEnabled = true
}, disable: function disable() {
var that=this;
if (that._playButton) {
that._playButton.disabled = "disabled"
}
if (that._slider) {
that._slider.disabled = "disabled"
}
that.isEnabled = false
}, _isPlaying: false, isPlaying: {
get: function get() {
return this._isPlaying
}, set: function set(value) {
if (value) {
if (this._isPlaying !== true) {
this._isPlaying = true;
if (this._playButton && this._playButton.winControl) {
this._playButton.winControl.icon = "pause"
}
this.play();
this.dispatchEvent("play", {})
}
}
else {
if (this._isPlaying !== false) {
this._isPlaying = false;
if (this._playButton && this._playButton.winControl) {
this._playButton.winControl.icon = "play"
}
this.pause();
this.dispatchEvent("paused", {})
}
}
}
}, sliderValue: {
get: function get() {
if (this._slider) {
return this._slider.value
}
}, set: function set(value) {
if (this._slider) {
this._slider.value = value
}
}
}, sliderMaxValue: {
get: function get() {
if (this._slider) {
return this._slider.max
}
}, set: function set(value) {
if (this._slider) {
this._slider.max = value
}
}
}, sliderMinValue: {
get: function get() {
if (this._slider) {
return this._slider.min
}
}, set: function set(value) {
if (this._slider) {
this._slider.max = value
}
}
}, initSliderValues: function initSliderValues(value, max, min) {
this.sliderValue = value || 0;
this.sliderMinValue = min || 0;
this.sliderMaxValue = max || 0
}, dispose: function dispose() {
clearTimeout(this._animationTimer);
this._animationTimer = null;
var e=this._domElement;
if (e.parentNode) {
e.parentNode.removeChild(e)
}
this._domElement = null;
window.removeEventListener('resize', this._bindableResizeHandler, false);
this._bindableResizeHandler = null
}, update: function update() {
this.setTickValues()
}, show: function show() {
var that=this;
WinJS.UI.Animation.fadeIn(that._domElement);
that._domElement.style.visibility = 'visible'
}, hide: function hide() {
var that=this;
WinJS.UI.Animation.fadeOut(that._domElement).then(function() {
if (that._domElement) {
that._domElement.style.visibility = 'hidden'
}
})
}
})});
WinJS.Class.mix(WeatherAppJS.Maps.SeekBar, WinJS.Utilities.createEventProperties("play", "paused", "sliderchanged", "sliderchangestart", "sliderchangedend", "animationcompleted"), WinJS.UI.DOMEventMixin)
})()