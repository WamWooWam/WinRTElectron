//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var Timer = function() {
                function Timer(){}
                return Timer.prototype.initView = function(container, controlContext) {
                        typeof controlContext.isRunning == "undefined" && (controlContext.isRunning = !1);
                        controlContext.viewModel = new AppMagic.Controls.TimerViewModel(controlContext);
                        ko.applyBindings(controlContext.viewModel, container);
                        controlContext.viewModel.resumeIfNeeded()
                    }, Timer.prototype.disposeView = function(container, controlContext) {
                        controlContext.viewModel.dispose()
                    }, Timer.prototype.onChangeAutoStart = function(evt, controlContext) {
                            controlContext.realized && evt.newValue !== null && controlContext.viewModel.startOrStop(controlContext.isParentScreenActive(), controlContext)
                        }, Timer.prototype.onChangeStart = function(evt, controlContext) {
                            controlContext.realized && evt.newValue !== null && (evt.newValue ? controlContext.viewModel.startTimer(controlContext) : controlContext.viewModel.stopTimer(controlContext))
                        }, Timer.prototype.onChangeReset = function(evt, controlContext) {
                            controlContext.realized && evt.newValue !== null && evt.newValue && (controlContext.modelProperties.Value.setValue(0), controlContext.viewModel.stopTimer(controlContext))
                        }, Timer.prototype.onChangeRepeat = function(evt, controlContext) {
                            controlContext.realized && evt.newValue !== null && evt.newValue && !controlContext.isRunning && controlContext.properties.Duration() === controlContext.modelProperties.Value.getValue() && controlContext.viewModel.startTimer(controlContext)
                        }, Timer.prototype.onChangeDuration = function(evt, controlContext) {
                            controlContext.realized && evt.newValue !== null && controlContext.viewModel.processInterval(controlContext)
                        }, Timer
            }();
        Controls.Timer = Timer
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var TimerInterval = function() {
                function TimerInterval(){}
                return TimerInterval.prototype.clearTimeout = function(intervalId) {
                        clearTimeout(intervalId)
                    }, TimerInterval.prototype.setInterval = function(fn, interval) {
                        return setInterval(fn, interval)
                    }, TimerInterval
            }();
        Controls.TimerInterval = TimerInterval
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var AppMagic;
(function(AppMagic) {
    var Controls;
    (function(Controls) {
        var TimerViewModel = function() {
                function TimerViewModel(controlContext, timerInterval) {
                    this._controlContext = null;
                    this._intervalId = null;
                    this._controlContext = controlContext;
                    this._timerInterval = timerInterval;
                    (typeof timerInterval == "undefined" || timerInterval === null) && (this._timerInterval = new AppMagic.Controls.TimerInterval);
                    this._timerSubscriptions = [];
                    this._timerSubscriptions.push(controlContext.isParentScreenActive.subscribe(function(newValue) {
                        controlContext.realized && this.startOrStop(newValue, controlContext)
                    }, this))
                }
                return Object.defineProperty(TimerViewModel.prototype, "properties", {
                        get: function() {
                            return this._controlContext.properties
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(TimerViewModel.prototype, "viewState", {
                        get: function() {
                            return this._controlContext.viewState
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(TimerViewModel.prototype, "autoProperties", {
                            get: function() {
                                return this._controlContext.autoProperties
                            }, enumerable: !0, configurable: !0
                        }), TimerViewModel.prototype.dispose = function() {
                            this._clearInterval()
                        }, TimerViewModel.prototype.resumeIfNeeded = function() {
                            if (this._controlContext.isRunning) {
                                this._controlContext.viewModel._startTimerNoEvent(this._controlContext);
                                return
                            }
                            this.startOrStop(this._controlContext.isParentScreenActive(), this._controlContext)
                        }, TimerViewModel.prototype.startTimer = function(controlContext) {
                            controlContext.behaviors.OnTimerStart();
                            this._startTimerNoEvent(controlContext)
                        }, TimerViewModel.prototype._startTimerNoEvent = function(controlContext) {
                            controlContext.realized && (controlContext.modelProperties.Value.getValue() >= controlContext.properties.Duration() && controlContext.modelProperties.Value.setValue(0), controlContext.isRunning = !0, this.processInterval(controlContext), this._timerIntervalCallback())
                        }, TimerViewModel.prototype.startOrStop = function(newValue, controlContext) {
                            controlContext.properties.AutoStart() && newValue && !controlContext.isRunning && this.startTimer(controlContext);
                            controlContext.properties.AutoPause() && !newValue && controlContext.isRunning && this.stopTimer(controlContext)
                        }, TimerViewModel.prototype.stopTimer = function(controlContext) {
                            controlContext.isRunning = !1;
                            this._clearInterval()
                        }, TimerViewModel.prototype.processInterval = function(controlContext) {
                            if (!controlContext.realized || controlContext.properties.Duration() === null) {
                                controlContext.viewModel.stopTimer(controlContext);
                                return
                            }
                            var duration = Core.Utility.clamp(controlContext.properties.Duration(), TimerViewModel.INTERVAL, TimerViewModel.ONE_DAY_IN_MILLISECONDS),
                                value = controlContext.modelProperties.Value.getValue();
                            value >= duration && (controlContext.behaviors.OnTimerEnd(), (controlContext.properties.Repeat() === null ? !1 : controlContext.properties.Repeat()) ? controlContext.modelProperties.Value.setValue(0) : controlContext.viewModel.stopTimer(controlContext))
                        }, TimerViewModel.prototype._clearInterval = function() {
                            this._intervalId !== null && (this._timerInterval.clearTimeout(this._intervalId), this._intervalId = null)
                        }, TimerViewModel.prototype.onTimerClicked = function() {
                            !this.viewState.disabled() && this._controlContext.realized && (this._controlContext.behaviors.OnSelect(), this._controlContext.isRunning ? this.stopTimer(this._controlContext) : this.startTimer(this._controlContext))
                        }, TimerViewModel.prototype._timerIntervalCallback = function() {
                            var _this = this;
                            this._clearInterval();
                            this._intervalId = this._timerInterval.setInterval(function() {
                                _this.processInterval(_this._controlContext);
                                _this._controlContext.isRunning && _this._controlContext.modelProperties.Value.setValue(_this._controlContext.modelProperties.Value.getValue() + TimerViewModel.INTERVAL)
                            }, TimerViewModel.INTERVAL)
                        }, TimerViewModel.INTERVAL = 50, TimerViewModel.ONE_DAY_IN_MILLISECONDS = 864e5, TimerViewModel
            }();
        Controls.TimerViewModel = TimerViewModel
    })(Controls = AppMagic.Controls || (AppMagic.Controls = {}))
})(AppMagic || (AppMagic = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
