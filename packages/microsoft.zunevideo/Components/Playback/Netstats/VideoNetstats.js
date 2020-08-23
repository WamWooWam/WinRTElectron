/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(Platform) {
            (function(Playback) {
                var MSEPlayback = MS.Entertainment.Platform.Playback;
                var hnsPerSecond = 10000000;
                var hnsPerMillisecond = 10000;
                var defaultStrokestyle = "#FFFFFF";
                var defaultFillstyle = "#FFFFFF";
                {};
                var VideoNetstatsControl = (function(_super) {
                        __extends(VideoNetstatsControl, _super);
                        function VideoNetstatsControl(element, options) {
                            _super.call(this, element, options);
                            this.suppressUnload = true;
                            this.columnWidth = 16;
                            this.columnGutter = 2;
                            this.lineWidth = 3;
                            this.numChartLines = 5;
                            this.chartLabelOffset = 12;
                            this.textDisplayOffset = 10;
                            this.maxbwStrokestyle = "#00FF00";
                            this.bwStrokeStyle = "#FF0000";
                            this.currentPositionFillstyle = "#FFFFFF";
                            this.currentPositionStrokestyle = "#FFFFFF";
                            this.goodChunkFillstyle = "#00FF00";
                            this.badChunkFillstyle = "#FF0000";
                            this.chartLinesStrokestyle = "#FFFFFF";
                            this.canvasRenderWidth = 1920;
                            this.canvasRenderHeight = 400;
                            this._drawOverlay = false;
                            this._sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                            this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                            var platLog = Microsoft.Entertainment.Platform.Logging;
                            this._sessionGuid = platLog.DataPoint.properties.sessionGuid;
                            this._canvas = document.createElement("canvas");
                            this._canvas.style.cssText = "width: 100%; height: 100%; position: absolute; top: 0px; left: 0px; direction: ltr;";
                            this._canvas.width = this.canvasRenderWidth;
                            this._canvas.height = this.canvasRenderHeight;
                            element.appendChild(this._canvas);
                            this._bindings = WinJS.Binding.bind(this, {_sessionManager: {nowPlayingSession: {currentTransportState: this._currentTransportStateChanged.bind(this)}}})
                        }
                        VideoNetstatsControl.prototype.unload = function() {
                            _super.prototype.unload.call(this);
                            this._cancelDrawLoop();
                            if (this._bindings) {
                                this._bindings.cancel();
                                this._bindings = null
                            }
                        };
                        Object.defineProperty(VideoNetstatsControl.prototype, "drawOverlay", {
                            get: function() {
                                return this._drawOverlay
                            }, set: function(value) {
                                    this._drawOverlay = value;
                                    if (this._drawOverlay && this._currentTransportState === Playback.TransportState.playing)
                                        this._beginDrawLoop();
                                    if (!this._drawOverlay) {
                                        this._cancelDrawLoop();
                                        this.clearCanvas()
                                    }
                                }, enumerable: true, configurable: true
                        });
                        VideoNetstatsControl.prototype._currentTransportStateChanged = function(value, oldValue) {
                            if (!value || this._unloaded)
                                return;
                            this._currentTransportState = value;
                            if (this._currentTransportState === Playback.TransportState.playing && this._drawOverlay)
                                this._beginDrawLoop();
                            else
                                this._cancelDrawLoop()
                        };
                        VideoNetstatsControl.prototype._beginDrawLoop = function() {
                            var _this = this;
                            if (!this._drawLoopTimerToken)
                                this._drawLoopTimerToken = setInterval(function() {
                                    return _this._onDrawLoop()
                                }, MS.Entertainment.Platform.Playback.VideoNetstatsControl.drawTimeoutMs)
                        };
                        VideoNetstatsControl.prototype._cancelDrawLoop = function() {
                            if (this._drawLoopTimerToken) {
                                clearInterval(this._drawLoopTimerToken);
                                this._drawLoopTimerToken = null
                            }
                        };
                        VideoNetstatsControl.prototype._onDrawLoop = function() {
                            this._updateDisplay(this._sessionManager.nowPlayingSession.videoStreamStatistics)
                        };
                        VideoNetstatsControl.prototype._updateDisplay = function(stats) {
                            this.clearCanvas();
                            if (!stats || this._uiStateService.isSnapped)
                                return;
                            var ctx = this._canvas.getContext("2d");
                            var positionMs = this._sessionManager.primarySession.forceTimeUpdate();
                            var maxBitrate = (stats.maxVideoBitrate) + 100000;
                            var chartLinesWidth = Math.round(ctx.canvas.width * 0.75);
                            var chartWidth = chartLinesWidth * 0.8;
                            var chartHeight = Math.round(ctx.canvas.height * 0.5);
                            this._drawChartLines(ctx, chartLinesWidth, chartHeight, this.numChartLines, maxBitrate / (this.numChartLines - 1));
                            this._drawChunkHistogram(stats, positionMs, maxBitrate, ctx, chartWidth, chartHeight, this.columnWidth, this.columnGutter);
                            this._drawNetworkBandwidthGraph(stats, maxBitrate, ctx, chartWidth, chartHeight, this.lineWidth, this.columnWidth, this.columnGutter);
                            this._displayStreamInfo(stats, ctx, 0, chartHeight + 50);
                            this._displayFailureEvents(stats, ctx, chartLinesWidth + 10, this.textDisplayOffset)
                        };
                        VideoNetstatsControl.prototype._drawChunkHistogram = function(stats, positionMs, maxBitrate, ctx, width, height, colWidth, colGutter) {
                            var nowLeft = -1;
                            var futureLeft = -1;
                            var positionHNS = positionMs * hnsPerMillisecond;
                            var left = 0;
                            for (var j = stats.history.length; j > 0; j--) {
                                var hist = stats.history[j - 1];
                                var top = hist.bitrate / maxBitrate;
                                top = Math.round(top * height);
                                if (hist.lastBandwidth === 0 && hist.hnsStartTime !== 0)
                                    ctx.fillStyle = this.badChunkFillstyle;
                                else
                                    ctx.fillStyle = this.goodChunkFillstyle;
                                ctx.fillRect(left, height - top, colWidth, top);
                                var radius = colWidth / 2;
                                if (hist.hnsStartTime <= positionHNS && (hist.hnsStartTime + MSEPlayback.VideoNetstatsControl.getDuration(stats.history, j - 1, MSEPlayback.VideoNetstatsControl.defaultVideoChunkDurationHns) > positionHNS)) {
                                    ctx.fillStyle = this.currentPositionFillstyle;
                                    ctx.strokeStyle = this.currentPositionStrokestyle;
                                    ctx.beginPath();
                                    ctx.arc(left + radius, height - radius, radius, 0, 2 * Math.PI);
                                    ctx.fill();
                                    if (nowLeft === -1)
                                        nowLeft = left
                                }
                                futureLeft = left;
                                left = left + colWidth + colGutter;
                                if (left > width)
                                    break
                            }
                            ctx.font = "20px Segoe UI";
                            ctx.fillStyle = defaultFillstyle;
                            ctx.textAlign = "center";
                            var currentPositiontext = MSEPlayback.VideoNetstatsControl.secondsToTimeString(positionMs / 1000, false);
                            var currentPositionRenderLength = ctx.measureText(currentPositiontext);
                            if (nowLeft > currentPositionRenderLength.width)
                                ctx.fillText(currentPositiontext, nowLeft, height + 20);
                            ctx.textAlign = "start";
                            if (nowLeft > currentPositionRenderLength.width * 2)
                                if (stats.history.length) {
                                    var pastLengthSeconds = (stats.history[stats.history.length - 1].hnsStartTime / (hnsPerSecond)) - (positionMs / 1000);
                                    ctx.fillText(MSEPlayback.VideoNetstatsControl.secondsToTimeString(pastLengthSeconds, true), 0, height + 20)
                                }
                            if (futureLeft - nowLeft > currentPositionRenderLength.width)
                                if (stats.history.length) {
                                    var futureLengthSeconds = (stats.history[j].hnsStartTime / (hnsPerSecond)) - (positionMs / 1000);
                                    ctx.fillText(MSEPlayback.VideoNetstatsControl.secondsToTimeString(futureLengthSeconds, true), futureLeft, height + 20)
                                }
                        };
                        VideoNetstatsControl.prototype._drawNetworkBandwidthGraph = function(stats, maxBandwidth, ctx, width, height, lineWidth, colWidth, colGutter) {
                            var left = colWidth / 2;
                            var previousPositionValid = false;
                            var currentStrokeStyle = this.bwStrokeStyle;
                            var previousPos = [];
                            ctx.beginPath();
                            ctx.lineWidth = lineWidth;
                            ctx.strokeStyle = currentStrokeStyle;
                            for (var j = stats.history.length; j > 0; j--) {
                                var hist = stats.history[j - 1];
                                var top = hist.lastBandwidth / maxBandwidth;
                                top = Math.round(top * height);
                                top = Math.min(height, top);
                                var beginNewPath = false;
                                if (top >= height) {
                                    if (currentStrokeStyle !== this.maxbwStrokestyle) {
                                        currentStrokeStyle = this.maxbwStrokestyle;
                                        beginNewPath = true
                                    }
                                }
                                else if (currentStrokeStyle !== this.bwStrokeStyle) {
                                    currentStrokeStyle = this.bwStrokeStyle;
                                    ctx.beginPath();
                                    ctx.strokeStyle = currentStrokeStyle;
                                    ctx.moveTo(previousPos[0], height - previousPos[1])
                                }
                                if (!previousPositionValid)
                                    ctx.moveTo(left, height - top);
                                else if (top !== 0)
                                    ctx.lineTo(left, height - top);
                                if (top === 0)
                                    previousPositionValid = false;
                                else
                                    previousPositionValid = true;
                                ctx.stroke();
                                if (beginNewPath) {
                                    ctx.beginPath();
                                    ctx.strokeStyle = currentStrokeStyle;
                                    if (top !== 0)
                                        ctx.moveTo(left, height - top)
                                }
                                previousPos = [left, top];
                                left = left + colWidth + colGutter;
                                if (left > width)
                                    break
                            }
                            ctx.strokeStyle = defaultStrokestyle
                        };
                        VideoNetstatsControl.prototype._drawChartLines = function(ctx, width, height, intervals, step) {
                            ctx.strokeStyle = this.chartLinesStrokestyle;
                            ctx.font = "10px Segoe UI";
                            ctx.lineWidth = 1;
                            for (var i = 0; i < intervals; i++) {
                                var y = height - (i * height / (intervals - 1));
                                ctx.beginPath();
                                ctx.moveTo(0, y);
                                ctx.lineTo(width, y);
                                ctx.stroke();
                                if (i !== 0) {
                                    ctx.beginPath();
                                    ctx.fillStyle = defaultFillstyle;
                                    ctx.textAlign = "start";
                                    ctx.fillText(MSEPlayback.VideoNetstatsControl.bitrateToString(i * step), 5, y + this.chartLabelOffset);
                                    ctx.textAlign = "right";
                                    ctx.fillText(MSEPlayback.VideoNetstatsControl.bitrateToString(i * step), width - 5, y + this.chartLabelOffset);
                                    ctx.fill()
                                }
                            }
                            ctx.stroke();
                            ctx.strokeRect(0, 0, width, height)
                        };
                        VideoNetstatsControl.prototype._displayFailureEvents = function(stats, ctx, x, y) {
                            ctx.font = "10px Consolas";
                            ctx.fillStyle = defaultFillstyle;
                            for (var j = 0; j < stats.failureEvents.length; j++) {
                                var stat = stats.failureEvents[j];
                                var failureString = stat.hnsTime.toFixed(0) + ":" + stat.info;
                                var currentY = y + j * 10;
                                ctx.fillText(failureString, x, currentY)
                            }
                        };
                        VideoNetstatsControl.prototype._displayStreamInfo = function(stats, ctx, x, y) {
                            ctx.font = "20px Segoe UI";
                            ctx.fillStyle = defaultFillstyle;
                            ctx.fillText("Selected Video Stream: " + stats.maxWidth + "X" + stats.maxHeight + ", " + stats.videoCodec, x, y);
                            ctx.fillText("Selected Audio Stream: " + stats.audioCodec, x, y + 30);
                            ctx.fillText("Session GUID: " + this._sessionGuid, x, y + 60)
                        };
                        VideoNetstatsControl.getDuration = function(buffers, i, defaultDuration) {
                            var duration = defaultDuration;
                            for (var j = i - 1; j >= 0; j--) {
                                var hist = buffers[i];
                                var histNext = buffers[j];
                                if (hist.hnsStartTime === histNext.hnsStartTime)
                                    continue;
                                duration = histNext.hnsStartTime - hist.hnsStartTime;
                                break
                            }
                            return duration
                        };
                        VideoNetstatsControl.secondsToTimeString = function(time, includeSign) {
                            var seconds;
                            var minutes;
                            var hours;
                            var timeString;
                            var signString = String.empty;
                            if (time < 0)
                                signString = "-";
                            else
                                signString = "+";
                            time = Math.abs(time);
                            time = time - time % 1;
                            seconds = time % 60;
                            time = time - seconds;
                            time = time / 60;
                            minutes = time % 60;
                            time = time - minutes;
                            hours = time / 60;
                            timeString = seconds.toString();
                            if (hours || minutes) {
                                if (seconds < 10)
                                    timeString = "0" + timeString;
                                timeString = minutes + ":" + timeString
                            }
                            else
                                timeString = timeString + "s";
                            if (hours) {
                                if (minutes < 10)
                                    timeString = "0" + timeString;
                                timeString = hours + ":" + timeString
                            }
                            if (includeSign)
                                timeString = signString + timeString;
                            return timeString
                        };
                        VideoNetstatsControl.bitrateToString = function(bitrate) {
                            var kbps = bitrate / 1000;
                            kbps = kbps - kbps % 1;
                            return kbps + " kbps"
                        };
                        VideoNetstatsControl.prototype.clearCanvas = function() {
                            if (this._canvas) {
                                var ctx = this._canvas.getContext("2d");
                                ctx.save();
                                ctx.setTransform(1, 0, 0, 1, 0, 0);
                                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                                ctx.restore()
                            }
                        };
                        VideoNetstatsControl.drawTimeoutMs = 1000;
                        VideoNetstatsControl.defaultVideoChunkDurationHns = 20000000;
                        return VideoNetstatsControl
                    })(MS.Entertainment.UI.Framework.UserControl);
                Playback.VideoNetstatsControl = VideoNetstatsControl
            })(Platform.Playback || (Platform.Playback = {}));
            var Playback = Platform.Playback
        })(Entertainment.Platform || (Entertainment.Platform = {}));
        var Platform = Entertainment.Platform
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
