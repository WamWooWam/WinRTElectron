/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js");
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ArcProgress: MS.Entertainment.UI.Framework.defineUserControl("/Controls/ArcProgress.html#arcProgressTemplate", function arcProgressConstructor() {
            this._bindings = WinJS.Binding.bind(this, {progress: this._propertyChangedHandler.bind(this)})
        }, {
            initialize: function initialize() {
                WinJS.Promise.timeout().then(function() {
                    this._initLayout()
                }.bind(this))
            }, unload: function unload() {
                    if (this._progressTimer) {
                        this._progressTimer.cancel();
                        this._progressTimer = null
                    }
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, resetOnUpdate: true, animationSpeed: 15, animationStep: 1, _bindings: null, _radians: (Math.PI) / 180, _radius: 50, _strokeOffset: 0, _progressTimer: null, _layoutInitCount: 0, _layoutRefreshMaxTries: 5, LAYOUT_INIT_DELAY: 300, _running: true, _propertyChangedHandler: function _propertyChangedHandler(newValue) {
                    if (!newValue && this.resetOnUpdate)
                        return;
                    this._layoutInitCount = 0;
                    if (this.foregroundPath)
                        this._initLayout()
                }, _initLayout: function _initLayout() {
                    if (this.resetOnUpdate || !this.progress)
                        this.currentProgress = 0;
                    if (this.svgRoot.viewport.width !== 0) {
                        this._radius = Math.min(this.svgRoot.viewport.width, this.svgRoot.viewport.height) / 2;
                        this._strokeOffset = this.strokeThickness / 2;
                        this._radius = this._radius - this._strokeOffset;
                        this._renderArc(this.backgroundPath, 100, this.backgroundColor);
                        this._renderPath();
                        this._layoutInitCount = 0
                    }
                    else if (this._layoutInitCount < this._layoutRefreshMaxTries) {
                        this._layoutInitCount++;
                        WinJS.Promise.timeout(this.LAYOUT_INIT_DELAY).then(function() {
                            this._initLayout()
                        }.bind(this))
                    }
                }, _renderPath: function _renderPath() {
                    if (this._progressTimer) {
                        this._progressTimer.cancel();
                        this._progressTimer = null
                    }
                    if (this.currentProgress <= this.progress) {
                        this._renderArc(this.foregroundPath, this.currentProgress, this.foregroundColor);
                        this._progressTimer = WinJS.Promise.timeout(this.animationSpeed).then(this._renderPath.bind(this));
                        this.currentProgress += this.animationStep
                    }
                }, _renderArc: function _renderArc(targetPath, progress, color) {
                    if (progress === 100)
                        progress = 99.99;
                    var theta = this._radians * (360 * (progress - 25) / 100);
                    var endX = Math.cos(theta) * this._radius;
                    var endY = Math.sin(theta) * this._radius;
                    var arcFlag = (progress <= 50) ? "0,1" : "1,1";
                    var startPoint = (this._radius + this._strokeOffset) + " " + this._strokeOffset;
                    if (targetPath) {
                        targetPath.setAttribute("d", "M " + startPoint + " A" + this._radius + "," + this._radius + " 0 " + arcFlag + " " + (endX + this._radius + this._strokeOffset) + "," + (endY + this._radius + this._strokeOffset));
                        targetPath.setAttribute("stroke", color);
                        targetPath.setAttribute("stroke-width", this.strokeThickness);
                        targetPath.setAttribute("fill", "none")
                    }
                }
        }, {
            strokeThickness: 25, foregroundColor: "#5CBB1D", backgroundColor: "rgba(255,255,255,0.10)", progress: 0, currentProgress: 0
        })})
})()
