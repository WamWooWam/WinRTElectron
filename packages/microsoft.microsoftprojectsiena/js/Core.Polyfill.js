//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Polyfill;
    (function(Polyfill) {
        var MappedEventManager = function() {
                function MappedEventManager(addEventListenerFn, removeEventListenerFn) {
                    this._eventsMap = {};
                    this._eventsMap = {};
                    this._addEventListenerImplementation = addEventListenerFn;
                    this._removeEventListenerImplementation = removeEventListenerFn
                }
                return MappedEventManager.prototype.bindMappedEvents = function(element, originalEventName, originalCallback, mappedEvents, useCapture) {
                        this._eventsMap[element.uniqueID] || (this._eventsMap[element.uniqueID] = {});
                        this._eventsMap[element.uniqueID][originalEventName] || (this._eventsMap[element.uniqueID][originalEventName] = []);
                        for (var boundEvents = [], i = 0, len = mappedEvents.length; i < len; i++) {
                            var eventMapping = mappedEvents[i];
                            this._addEventListenerImplementation.call(element, eventMapping.eventNameToUse, eventMapping.wrappedCallback, useCapture);
                            boundEvents.push(eventMapping)
                        }
                        this._eventsMap[element.uniqueID][originalEventName].push({
                            originalCallback: originalCallback, boundEvents: boundEvents, capture: useCapture
                        })
                    }, MappedEventManager.prototype.unbindMappedEvents = function(element, originalEventName, originalCallback, useCapture) {
                        if (this._eventsMap[element.uniqueID] && this._eventsMap[element.uniqueID][originalEventName])
                            for (var mappedEvents = this._eventsMap[element.uniqueID][originalEventName], i = 0, len = mappedEvents.length; i < len; i++) {
                                var mapping = mappedEvents[i];
                                if (mapping.originalCallback === originalCallback && !!useCapture == !!mapping.capture) {
                                    var boundEvents = mapping.boundEvents;
                                    this._unbindAllEvents(element, boundEvents, useCapture);
                                    mappedEvents.splice(i, 1);
                                    break
                                }
                            }
                    }, MappedEventManager.prototype._unbindAllEvents = function(element, boundEvents, useCapture) {
                            for (var i = 0, len = boundEvents.length; i < len; i++) {
                                var boundEvent = boundEvents[i];
                                this._removeEventListenerImplementation.call(element, boundEvent.eventNameToUse, boundEvent.wrappedCallback, useCapture)
                            }
                        }, MappedEventManager
            }();
        Polyfill.MappedEventManager = MappedEventManager
    })(Polyfill = Core.Polyfill || (Core.Polyfill = {}))
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Polyfill;
    (function(Polyfill) {
        var EventListenerOverrider = function() {
                function EventListenerOverrider(eventListenerObject) {
                    if (this._eventNameToOverride = {}, this._eventListenerObject = eventListenerObject, typeof eventListenerObject[EventListenerOverrider.AddEventListener] == "undefined")
                        throw"Prototype must have addEventListener defined.";
                    if (typeof eventListenerObject[EventListenerOverrider.RemoveEventListener] == "undefined")
                        throw"Prototype must have removeEventListener defined";
                    this._previousAddEventListenerImplementation = eventListenerObject[EventListenerOverrider.AddEventListener];
                    this._previousRemoveEventListerImplementation = eventListenerObject[EventListenerOverrider.RemoveEventListener];
                    this._mappedEventManager = new Polyfill.MappedEventManager(this._previousAddEventListenerImplementation, this._previousRemoveEventListerImplementation);
                    var that = this;
                    this._eventListenerObject[EventListenerOverrider.AddEventListener] = function(eventName, listener, useCapture) {
                        return that._shimAddEventListenerMethod.call(that, this, eventName, listener, useCapture)
                    };
                    this._eventListenerObject[EventListenerOverrider.RemoveEventListener] = function(eventName, listener, useCapture) {
                        return that._shimRemoveEventListener.call(that, this, eventName, listener, useCapture)
                    }
                }
                return EventListenerOverrider.prototype.dispose = function() {
                        this._eventListenerObject[EventListenerOverrider.AddEventListener] = this._previousAddEventListenerImplementation;
                        this._eventListenerObject[EventListenerOverrider.RemoveEventListener] = this._previousRemoveEventListerImplementation;
                        this._eventListenerObject = null;
                        this._eventNameToOverride = null
                    }, EventListenerOverrider.prototype.registerOverride = function(eventName, override) {
                        if (eventName = eventName.toLowerCase(), typeof this._eventNameToOverride[eventName] != "undefined")
                            throw"Cannot register multiple overrides. Event name: " + eventName;
                        this._eventNameToOverride[eventName] = override
                    }, EventListenerOverrider.prototype._shimAddEventListenerMethod = function(element, eventName, listener, useCapture) {
                            var override = this._getOverride(eventName);
                            if (override) {
                                eventName = eventName.toLowerCase();
                                var mappedEvents = override.getAddEventListenerOverrides(eventName, listener);
                                this._mappedEventManager.bindMappedEvents(element, eventName, listener, mappedEvents, useCapture)
                            }
                            else
                                this._previousAddEventListenerImplementation.call(element, eventName, listener, useCapture)
                        }, EventListenerOverrider.prototype._shimRemoveEventListener = function(element, eventName, listener, useCapture) {
                            var override = this._getOverride(eventName);
                            override ? (eventName = eventName.toLowerCase(), this._mappedEventManager.unbindMappedEvents(element, eventName, listener, useCapture)) : this._previousRemoveEventListerImplementation.call(element, eventName, listener, useCapture)
                        }, EventListenerOverrider.prototype._getOverride = function(eventName) {
                            var eventNameLowerCase = eventName.toLowerCase();
                            return this._eventNameToOverride[eventNameLowerCase]
                        }, EventListenerOverrider.AddEventListener = "addEventListener", EventListenerOverrider.RemoveEventListener = "removeEventListener", EventListenerOverrider
            }();
        Polyfill.EventListenerOverrider = EventListenerOverrider
    })(Polyfill = Core.Polyfill || (Core.Polyfill = {}))
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Polyfill;
    (function(Polyfill) {
        var DefaultTimeProvider = function() {
                function DefaultTimeProvider(){}
                return DefaultTimeProvider.prototype.getTime = function() {
                        return (new Date).getTime()
                    }, DefaultTimeProvider
            }();
        Polyfill.DefaultTimeProvider = DefaultTimeProvider
    })(Polyfill = Core.Polyfill || (Core.Polyfill = {}))
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Polyfill;
    (function(Polyfill) {
        var ClickWatcher = function() {
                function ClickWatcher(clickRadius, clickExpirationTimeInMilliseconds, timeProvider) {
                    this._clickRadius = 50;
                    this._clickExpirationTimeInMilliseconds = 500;
                    this._activeTouches = {};
                    this._clicks = [];
                    this._timeProvider = timeProvider || new Polyfill.DefaultTimeProvider;
                    this._clickRadius = clickRadius || this._clickRadius;
                    this._clickExpirationTimeInMilliseconds = clickExpirationTimeInMilliseconds || this._clickExpirationTimeInMilliseconds
                }
                return ClickWatcher.prototype.notifyTouchStart = function(touchId, clientX, clientY) {
                        touchId != null && (this._activeTouches[touchId] = new Polyfill.TouchInfo(clientX, clientY, this._clickRadius))
                    }, ClickWatcher.prototype.notifyTouchMove = function(touchId, clientX, clientY) {
                        if (this._isTouchValid(touchId)) {
                            var touch = this._activeTouches[touchId];
                            touch.update(clientX, clientY)
                        }
                    }, ClickWatcher.prototype.notifyTouchEnded = function(touchId) {
                            this._activeTouches[touchId] = null
                        }, ClickWatcher.prototype.executeTouchClick = function(touchId, clientX, clientY, callback, evt) {
                            this._isTouchValid(touchId) && (this._registerClick(clientX, clientY, callback), callback(evt))
                        }, ClickWatcher.prototype.executeMouseClick = function(clientX, clientY, callback, evt) {
                            this._isValidClick(clientX, clientY, callback) && (this._registerClick(clientX, clientY, callback), callback(evt))
                        }, ClickWatcher.prototype._registerClick = function(clientX, clientY, callback) {
                            var clickEvent = new Polyfill.ClickEventInfo(clientX, clientY, 25, this._timeProvider.getTime(), callback);
                            this._clicks.push(clickEvent)
                        }, ClickWatcher.prototype._isValidClick = function(clientX, clientY, callback) {
                            this._removeExpiredClicks();
                            for (var i = 0, len = this._clicks.length; i < len; i++) {
                                var click = this._clicks[i];
                                if (click.intersects(clientX, clientY) && click.Callback === callback)
                                    return !1
                            }
                            return !0
                        }, ClickWatcher.prototype._isTouchValid = function(touchId) {
                            if (touchId == null)
                                return !0;
                            var touch = this._activeTouches[touchId];
                            return touch ? touch.isValid : !1
                        }, ClickWatcher.prototype._removeTouch = function(touchId) {
                            touchId != null && touchId in this._activeTouches && (this._activeTouches[touchId] = null)
                        }, ClickWatcher.prototype._removeExpiredClicks = function() {
                            var _this = this,
                                currentTime = this._timeProvider.getTime();
                            this._clicks = this._clicks.filter(function(click) {
                                return currentTime - click.Ticks < _this._clickExpirationTimeInMilliseconds
                            })
                        }, ClickWatcher
            }();
        Polyfill.ClickWatcher = ClickWatcher
    })(Polyfill = Core.Polyfill || (Core.Polyfill = {}))
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Polyfill;
    (function(Polyfill) {
        var ClickEventOverride = function() {
                function ClickEventOverride() {
                    var _this = this;
                    this._clickWatcher = new Core.Polyfill.ClickWatcher(ClickEventOverride.ClickRadius, ClickEventOverride.ClickExpirationTime);
                    window.onload = function() {
                        document.body.addEventListener("touchstart", _this._onTouchStart.bind(_this), !1);
                        document.body.addEventListener("touchmove", _this._onTouchMove.bind(_this), !1);
                        document.body.addEventListener("touchcancel", _this._onTouchCancel.bind(_this), !1);
                        document.body.addEventListener("touchend", _this._onTouchEnd.bind(_this), !1)
                    }
                }
                return ClickEventOverride.prototype.getAddEventListenerOverrides = function(eventName, callback) {
                        var eventOverrides = [];
                        return eventOverrides.push(new Polyfill.EventOverrideInfo("touchend", this._onElementTouchEnd.bind(this, callback))), eventOverrides.push(new Polyfill.EventOverrideInfo("click", this._onElementClick.bind(this, callback))), eventOverrides
                    }, ClickEventOverride.prototype._onTouchMove = function(evt) {
                        var _this = this;
                        this._forEachChangedTouch(evt, function(touch) {
                            return _this._clickWatcher.notifyTouchMove(touch.identifier, touch.clientX, touch.clientY)
                        })
                    }, ClickEventOverride.prototype._onTouchEnd = function(evt) {
                            var _this = this;
                            this._forEachChangedTouch(evt, function(touch) {
                                return _this._clickWatcher.notifyTouchEnded(touch.identifier)
                            })
                        }, ClickEventOverride.prototype._onTouchCancel = function(evt) {
                            var _this = this;
                            this._forEachChangedTouch(evt, function(touch) {
                                return _this._clickWatcher.notifyTouchEnded(touch.identifier)
                            })
                        }, ClickEventOverride.prototype._onTouchStart = function(evt) {
                            var _this = this;
                            this._forEachChangedTouch(evt, function(touch) {
                                return _this._clickWatcher.notifyTouchStart(touch.identifier, touch.clientX, touch.clientY)
                            })
                        }, ClickEventOverride.prototype._onElementTouchEnd = function(callback, evt) {
                            var _this = this;
                            this._forEachChangedTouch(evt, function(touch) {
                                return _this._clickWatcher.executeTouchClick(touch.identifier, touch.clientX, touch.clientY, callback, evt)
                            })
                        }, ClickEventOverride.prototype._onElementClick = function(callback, evt) {
                            this._clickWatcher.executeMouseClick(evt.clientX, evt.clientY, callback, evt)
                        }, ClickEventOverride.prototype._forEachChangedTouch = function(evt, action) {
                            for (var i = 0, len = evt.changedTouches.length; i < len; i++)
                                action(evt.changedTouches[i])
                        }, ClickEventOverride.ClickRadius = 25, ClickEventOverride.ClickExpirationTime = 500, ClickEventOverride
            }();
        Polyfill.ClickEventOverride = ClickEventOverride
    })(Polyfill = Core.Polyfill || (Core.Polyfill = {}))
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
if (typeof HTMLElement != "undefined") {
    var eventOverrider = new Core.Polyfill.EventListenerOverrider(HTMLElement.prototype);
    if ("ontouchstart" in self) {
        var clickEventHandler = new Core.Polyfill.ClickEventOverride;
        eventOverrider.registerOverride("click", clickEventHandler)
    }
}
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Polyfill;
    (function(Polyfill) {
        var EventOverrideInfo = function() {
                function EventOverrideInfo(eventNameToUse, eventListener) {
                    this._eventNameToUse = eventNameToUse;
                    this._wrappedCallback = eventListener
                }
                return Object.defineProperty(EventOverrideInfo.prototype, "eventNameToUse", {
                        get: function() {
                            return this._eventNameToUse
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(EventOverrideInfo.prototype, "wrappedCallback", {
                        get: function() {
                            return this._wrappedCallback
                        }, enumerable: !0, configurable: !0
                    }), EventOverrideInfo
            }();
        Polyfill.EventOverrideInfo = EventOverrideInfo
    })(Polyfill = Core.Polyfill || (Core.Polyfill = {}))
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
self.setImmediate || (self.setImmediate = function(functionToExecute) {
    return self.setTimeout(functionToExecute, 0)
}, self.clearImmediate = function(handle) {
    self.clearTimeout(handle)
});
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Polyfill;
    (function(Polyfill) {
        var ClickEventInfo = function() {
                function ClickEventInfo(clientX, clientY, radius, ticks, callback) {
                    this._position = new Polyfill.Point2d(clientX, clientY);
                    this._radius = radius;
                    this._ticks = ticks;
                    this._callback = callback
                }
                return Object.defineProperty(ClickEventInfo.prototype, "Radius", {
                        get: function() {
                            return this._radius
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(ClickEventInfo.prototype, "Ticks", {
                        get: function() {
                            return this._ticks
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(ClickEventInfo.prototype, "Callback", {
                            get: function() {
                                return this._callback
                            }, enumerable: !0, configurable: !0
                        }), ClickEventInfo.prototype.intersects = function(clientX, clientY) {
                            var otherPoint = new Polyfill.Point2d(clientX, clientY);
                            return this._position.distanceSquared(otherPoint) < this.Radius * this.Radius
                        }, ClickEventInfo
            }();
        Polyfill.ClickEventInfo = ClickEventInfo
    })(Polyfill = Core.Polyfill || (Core.Polyfill = {}))
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Polyfill;
    (function(Polyfill) {
        var TouchInfo = function() {
                function TouchInfo(clientX, clientY, maxDistance) {
                    this._isValid = !0;
                    this._startPoint = new Polyfill.Point2d(clientX, clientY);
                    this._maxDistanceSquared = maxDistance * maxDistance
                }
                return Object.defineProperty(TouchInfo.prototype, "isValid", {
                        get: function() {
                            return this._isValid
                        }, enumerable: !0, configurable: !0
                    }), TouchInfo.prototype.update = function(clientX, clientY) {
                        var updatedPoint = new Polyfill.Point2d(clientX, clientY);
                        this._startPoint.distanceSquared(updatedPoint) > this._maxDistanceSquared && (this._isValid = !1)
                    }, TouchInfo
            }();
        Polyfill.TouchInfo = TouchInfo
    })(Polyfill = Core.Polyfill || (Core.Polyfill = {}))
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Polyfill;
    (function(Polyfill) {
        var Point2d = function() {
                function Point2d(x, y) {
                    this._x = x;
                    this._y = y
                }
                return Object.defineProperty(Point2d.prototype, "X", {
                        get: function() {
                            return this._x
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(Point2d.prototype, "Y", {
                        get: function() {
                            return this._y
                        }, enumerable: !0, configurable: !0
                    }), Point2d.prototype.distanceSquared = function(otherPoint) {
                            var deltaX = this.X - otherPoint.X,
                                deltaY = this.Y - otherPoint.Y;
                            return deltaX * deltaX + deltaY * deltaY
                        }, Point2d
            }();
        Polyfill.Point2d = Point2d
    })(Polyfill = Core.Polyfill || (Core.Polyfill = {}))
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
self.Windows || (self.Windows = {});