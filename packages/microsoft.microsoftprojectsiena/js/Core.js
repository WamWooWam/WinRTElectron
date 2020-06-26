//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Collections;
(function(Collections) {
    var Generic;
    (function(Generic) {
        var Dictionary = function() {
                function Dictionary() {
                    this._dict = Object.create(null)
                }
                return Dictionary.fromHashTable = function(ht) {
                        var dict = new Dictionary;
                        return Object.keys(ht).forEach(function(key) {
                                return dict.addValue(key, ht[key])
                            }), dict
                    }, Object.defineProperty(Dictionary.prototype, "count", {
                        get: function() {
                            return Object.keys(this._dict).length
                        }, enumerable: !0, configurable: !0
                    }), Object.defineProperty(Dictionary.prototype, "keys", {
                            get: function() {
                                return Object.keys(this._dict)
                            }, enumerable: !0, configurable: !0
                        }), Dictionary.prototype.forEach = function(callbackfn, thisArg) {
                            var _this = this,
                                callbackfnWithThis = callbackfn.bind(thisArg);
                            Object.keys(this._dict).forEach(function(key) {
                                return callbackfnWithThis(_this._dict[key], key)
                            })
                        }, Dictionary.prototype.containsKey = function(key) {
                            return typeof this._dict[key] != "undefined"
                        }, Dictionary.prototype.addValue = function(key, value) {
                            Contracts.check(!this.containsKey(key));
                            this._dict[key] = value
                        }, Dictionary.prototype.getValue = function(key) {
                            return this._dict[key]
                        }, Dictionary.prototype.tryGetValue = function(key) {
                            return typeof this._dict[key] == "undefined" ? {
                                    value: !1, outValue: null
                                } : {
                                    value: !0, outValue: this._dict[key]
                                }
                        }, Dictionary.prototype.setValue = function(key, value) {
                            this._dict[key] = value
                        }, Dictionary.prototype.deleteValue = function(key) {
                            delete this._dict[key]
                        }, Dictionary
            }();
        Generic.Dictionary = Dictionary
    })(Generic = Collections.Generic || (Collections.Generic = {}))
})(Collections || (Collections = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Collections;
(function(Collections) {
    var Generic;
    (function(Generic) {
        var Set = function() {
                function Set() {
                    this._items = []
                }
                return Object.defineProperty(Set.prototype, "count", {
                        get: function() {
                            return this._items.length
                        }, enumerable: !0, configurable: !0
                    }), Set.prototype.add = function(item) {
                        return this._items.indexOf(item) < 0 ? (this._items.push(item), !0) : !1
                    }, Set.prototype.remove = function(item) {
                            var i = this._items.indexOf(item);
                            return i >= 0 ? (this._items.splice(i, 1), !0) : !1
                        }, Set.prototype.clear = function() {
                            this._items = []
                        }, Set.prototype.contains = function(item) {
                            return this._items.indexOf(item) >= 0
                        }, Set.prototype.items = function() {
                            return this._items.slice(0)
                        }, Set.prototype.toggle = function(item) {
                            this.contains(item) ? this.remove(item) : this.add(item)
                        }, Set
            }();
        Generic.Set = Set
    })(Generic = Collections.Generic || (Collections.Generic = {}))
})(Collections || (Collections = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            b.hasOwnProperty(p) && (d[p] = b[p]);
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    },
    Collections;
(function(Collections) {
    var Generic;
    (function(Generic) {
        var ObservableSet = function(_super) {
                __extends(ObservableSet, _super);
                function ObservableSet() {
                    _super.apply(this, arguments);
                    this._listeners = [];
                    this._observedItems = []
                }
                return ObservableSet.prototype.add = function(item) {
                        return _super.prototype.add.call(this, item) ? (this._invoke(item, !0), !0) : !1
                    }, ObservableSet.prototype.remove = function(item) {
                        return _super.prototype.remove.call(this, item) ? (this._invoke(item, !1), !0) : !1
                    }, ObservableSet.prototype.clear = function() {
                            var items = this.items();
                            _super.prototype.clear.call(this);
                            for (var i = 0, len = items.length; i < len; i++)
                                this._invoke(items[i], !1)
                        }, ObservableSet.prototype.subscribe = function(item, listener) {
                            var i = this._observedItems.indexOf(item);
                            i < 0 && (i = this._observedItems.length, this._observedItems.push(item), this._listeners.push([]));
                            this._listeners[i].push(listener)
                        }, ObservableSet.prototype.unsubscribe = function(item, listener) {
                            var i = this._observedItems.indexOf(item);
                            if (!(i < 0)) {
                                var listeners = this._listeners[i],
                                    j = listeners.indexOf(listener);
                                j < 0 || (listeners.splice(j, 1), listeners.length === 0 && (this._observedItems.splice(i, 1), this._listeners.splice(i, 1)))
                            }
                        }, ObservableSet.prototype._invoke = function(item, isContained) {
                            var i = this._observedItems.indexOf(item);
                            i < 0 || this._listeners[i].forEach(function(listener) {
                                return listener(isContained)
                            })
                        }, ObservableSet
            }(Generic.Set);
        Generic.ObservableSet = ObservableSet
    })(Generic = Collections.Generic || (Collections.Generic = {}))
})(Collections || (Collections = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Collections;
(function(Collections) {
    var Generic;
    (function(Generic) {
        var TwoKeyDictionary = function() {
                function TwoKeyDictionary() {
                    this._dict = {}
                }
                return Object.defineProperty(TwoKeyDictionary.prototype, "count", {
                        get: function() {
                            return Object.keys(this._dict).length
                        }, enumerable: !0, configurable: !0
                    }), TwoKeyDictionary.prototype.containsKey = function(k0, k1) {
                        var value = this._dict[TwoKeyDictionary._encodeKeys(k0, k1)];
                        return Core.Utility.isDefined(value)
                    }, TwoKeyDictionary.prototype.getValue = function(k0, k1) {
                            return this._dict[TwoKeyDictionary._encodeKeys(k0, k1)]
                        }, TwoKeyDictionary.prototype.tryGetValue = function(k0, k1) {
                            var value = this._dict[TwoKeyDictionary._encodeKeys(k0, k1)];
                            return Core.Utility.isDefined(value) ? {
                                    value: !0, outValue: value
                                } : {
                                    value: !1, outValue: null
                                }
                        }, TwoKeyDictionary.prototype.addValue = function(k0, k1, value) {
                            Contracts.check(!this.containsKey(k0, k1));
                            this._dict[TwoKeyDictionary._encodeKeys(k0, k1)] = value
                        }, TwoKeyDictionary.prototype.setValue = function(k0, k1, value) {
                            this._dict[TwoKeyDictionary._encodeKeys(k0, k1)] = value
                        }, TwoKeyDictionary.prototype.deleteValue = function(k0, k1) {
                            delete this._dict[TwoKeyDictionary._encodeKeys(k0, k1)]
                        }, TwoKeyDictionary._encodeKeys = function(k0, k1) {
                            return k0.length.toString() + "+" + k1.length.toString() + "_" + k0 + k1
                        }, TwoKeyDictionary
            }();
        Generic.TwoKeyDictionary = TwoKeyDictionary
    })(Generic = Collections.Generic || (Collections.Generic = {}))
})(Collections || (Collections = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Disposable = function() {
            function Disposable() {
                this._disposed = !1;
                this._trackingKeys = [];
                this._trackedAnonymousObjects = []
            }
            return Object.defineProperty(Disposable.prototype, "isDisposed", {
                    get: function() {
                        return this._disposed
                    }, enumerable: !0, configurable: !0
                }), Disposable.prototype.dispose = function() {
                    if (!this._disposed) {
                        for (var i = 0, len = this._trackingKeys.length; i < len; i++) {
                            var key = this._trackingKeys[i];
                            this._disposeItem(this[key]);
                            this[key] = null
                        }
                        this._disposeAnonymousObjects();
                        this._trackingKeys = [];
                        this._disposed = !0
                    }
                }, Disposable.prototype._disposeAnonymousObjects = function() {
                        for (var i = 0, len = this._trackedAnonymousObjects.length; i < len; i++) {
                            var disposable = this._trackedAnonymousObjects[i];
                            this._disposeItem(disposable)
                        }
                        this._trackedAnonymousObjects = []
                    }, Disposable.prototype._disposeItem = function(obj) {
                        if (obj instanceof Array) {
                            for (var i = 0, len = obj.length; i < len; i++)
                                this._disposeItem(obj[i]);
                            obj.splice(0)
                        }
                        else
                            Core.Utility.isNullOrUndefined(obj) || typeof obj.dispose != "function" || obj.dispose()
                    }, Disposable.prototype.track = function(key, obj) {
                        this._disposeItem(this[key]);
                        this[key] = obj;
                        this._trackingKeys.indexOf(key) === -1 && this._trackingKeys.push(key)
                    }, Disposable.prototype.trackObjectProperties = function(key, obj) {
                        this.track(key, obj);
                        for (var propertyName in obj) {
                            var property = obj[propertyName];
                            typeof property.dispose == "function" && this.trackAnonymous(property)
                        }
                    }, Disposable.prototype.trackAnonymous = function(obj) {
                        var idx = this._trackedAnonymousObjects.indexOf(obj);
                        idx === -1 && this._trackedAnonymousObjects.push(obj)
                    }, Disposable
        }();
    Core.Disposable = Disposable
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var EventTracker = function(_super) {
            __extends(EventTracker, _super);
            function EventTracker() {
                _super.apply(this, arguments);
                this._trackedEvents = []
            }
            return EventTracker.prototype.add = function(dispatcher, eventName, handler, target) {
                    this._add(dispatcher, eventName, handler, target, !1)
                }, EventTracker.prototype.addCapture = function(dispatcher, eventName, handler, target) {
                    this._add(dispatcher, eventName, handler, target, !0)
                }, EventTracker.prototype._add = function(dispatcher, eventName, handler, target, useCapture) {
                        target && (handler = this._bind(handler, target));
                        dispatcher.addEventListener(eventName, handler, useCapture);
                        this._trackedEvents.push({
                            dispatcher: dispatcher, eventName: eventName, handler: handler, useCapture: useCapture
                        })
                    }, EventTracker.prototype.remove = function(dispatcher, eventName) {
                        for (var i = 0, len = this._trackedEvents.length; i < len; i++) {
                            var item = this._trackedEvents[i];
                            if (item.dispatcher === dispatcher && item.eventName === eventName) {
                                item.dispatcher.removeEventListener(item.eventName, item.handler, item.useCapture);
                                this._unbind(item.handler);
                                this._trackedEvents.splice(i, 1);
                                break
                            }
                        }
                    }, EventTracker.prototype.removeAll = function() {
                        for (var i = 0, len = this._trackedEvents.length; i < len; i++) {
                            var item = this._trackedEvents[i];
                            item.dispatcher.removeEventListener(item.eventName, item.handler, item.useCapture);
                            this._unbind(item.handler)
                        }
                        this._trackedEvents = []
                    }, EventTracker.prototype._bind = function(functionToBind, boundObject) {
                        var objectToBindTo = {};
                        objectToBindTo._boundThis = boundObject;
                        var ret = function() {
                                return functionToBind.apply(this._boundThis, arguments)
                            }.bind(objectToBindTo);
                        return ret._bindInfo = objectToBindTo, ret
                    }, EventTracker.prototype._unbind = function(functionToUnbind) {
                        functionToUnbind._bindInfo && (functionToUnbind._bindInfo._boundThis = null, functionToUnbind._bindInfo = null)
                    }, EventTracker.prototype.dispose = function() {
                        this.isDisposed || (this.removeAll(), _super.prototype.dispose.call(this))
                    }, EventTracker
        }(Core.Disposable);
    Core.EventTracker = EventTracker
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Contracts;
(function(Contracts) {
    function check(value, msg) {
        value || _except(msg)
    }
    Contracts.check = check;
    function checkAbstract() {
        _except("Abstract function called.")
    }
    Contracts.checkAbstract = checkAbstract;
    function checkValue(value, msg) {
        (typeof value == "undefined" || value === null) && _except(msg)
    }
    Contracts.checkValue = checkValue;
    function checkDefined(value, msg) {
        typeof value == "undefined" && _except(msg)
    }
    Contracts.checkDefined = checkDefined;
    function checkNonNull(value, msg) {
        value === null && _except(msg)
    }
    Contracts.checkNonNull = checkNonNull;
    function checkNonEmpty(value, msg) {
        (typeof value != "string" || value.length <= 0) && _except(msg)
    }
    Contracts.checkNonEmpty = checkNonEmpty;
    function checkNonEmptyOrNull(value, msg) {
        value !== null && checkNonEmpty(value, msg)
    }
    Contracts.checkNonEmptyOrNull = checkNonEmptyOrNull;
    function checkNonEmptyOrUndefined(value, msg) {
        typeof value != "undefined" && checkNonEmpty(value, msg)
    }
    Contracts.checkNonEmptyOrUndefined = checkNonEmptyOrUndefined;
    function checkNull(value, msg) {
        value !== null && _except(msg)
    }
    Contracts.checkNull = checkNull;
    function checkUndefined(value, msg) {
        typeof value != "undefined" && _except(msg)
    }
    Contracts.checkUndefined = checkUndefined;
    function checkNullOrUndefined(value, msg) {
        typeof value != "undefined" && value !== null && _except(msg)
    }
    Contracts.checkNullOrUndefined = checkNullOrUndefined;
    function checkNullOrNumberOrUndefined(value, msg) {
        typeof value != "undefined" && value !== null && typeof value != "number" && _except(msg)
    }
    Contracts.checkNullOrNumberOrUndefined = checkNullOrNumberOrUndefined;
    function checkArray(value, msg) {
        value instanceof Array || _except(msg)
    }
    Contracts.checkArray = checkArray;
    function checkArrayBuffer(value, msg) {
        value instanceof ArrayBuffer || _except(msg);
        checkNumber(value.byteLength)
    }
    Contracts.checkArrayBuffer = checkArrayBuffer;
    function checkEmptyArray(value, msg) {
        checkArray(value, msg);
        value.length !== 0 && _except(msg)
    }
    Contracts.checkEmptyArray = checkEmptyArray;
    function checkNonEmptyArray(value, msg) {
        checkArray(value, msg);
        value.length === 0 && _except(msg)
    }
    Contracts.checkNonEmptyArray = checkNonEmptyArray;
    function checkNonEmptyArrayBuffer(value, msg) {
        checkArrayBuffer(value, msg);
        value.byteLength === 0 && _except(msg)
    }
    Contracts.checkNonEmptyArrayBuffer = checkNonEmptyArrayBuffer;
    function checkArrayOrNull(value, msg) {
        value instanceof Array || value === null || _except(msg)
    }
    Contracts.checkArrayOrNull = checkArrayOrNull;
    function checkArrayOrUndefined(value, msg) {
        value instanceof Array || typeof value == "undefined" || _except(msg)
    }
    Contracts.checkArrayOrUndefined = checkArrayOrUndefined;
    function checkObject(value, msg) {
        (value === null || !(value instanceof Object) || value instanceof Array) && _except(msg)
    }
    Contracts.checkObject = checkObject;
    function checkObjectOrNull(value, msg) {
        value !== null && checkObject(value, msg)
    }
    Contracts.checkObjectOrNull = checkObjectOrNull;
    function checkObjectOrUndefined(value, msg) {
        typeof value != "undefined" && checkObject(value, msg)
    }
    Contracts.checkObjectOrUndefined = checkObjectOrUndefined;
    function checkRange(value, startRange, endRange, msg) {
        checkValue(value);
        checkValue(startRange);
        checkValue(endRange);
        (value < startRange || value > endRange) && _except(msg)
    }
    Contracts.checkRange = checkRange;
    function checkFunction(value, msg) {
        typeof value != "function" && _except(msg)
    }
    Contracts.checkFunction = checkFunction;
    function checkFunctionOrNull(value, msg) {
        typeof value != "function" && value !== null && _except(msg)
    }
    Contracts.checkFunctionOrNull = checkFunctionOrNull;
    function checkFunctionOrUndefined(value, msg) {
        typeof value != "function" && typeof value != "undefined" && _except(msg)
    }
    Contracts.checkFunctionOrUndefined = checkFunctionOrUndefined;
    function checkNumber(value, msg) {
        typeof value != "number" && _except(msg)
    }
    Contracts.checkNumber = checkNumber;
    function checkNumberOrNull(value, msg) {
        typeof value != "number" && value !== null && _except(msg)
    }
    Contracts.checkNumberOrNull = checkNumberOrNull;
    function checkNumberOrString(value, msg) {
        typeof value != "number" && typeof value != "string" && _except(msg)
    }
    Contracts.checkNumberOrString = checkNumberOrString;
    function checkNumberOrUndefined(value, msg) {
        typeof value != "number" && typeof value != "undefined" && _except(msg)
    }
    Contracts.checkNumberOrUndefined = checkNumberOrUndefined;
    function checkBoolean(value, msg) {
        typeof value != "boolean" && _except(msg)
    }
    Contracts.checkBoolean = checkBoolean;
    function checkBooleanOrNull(value, msg) {
        typeof value != "boolean" && value !== null && _except(msg)
    }
    Contracts.checkBooleanOrNull = checkBooleanOrNull;
    function checkBooleanOrUndefined(value, msg) {
        typeof value != "boolean" && typeof value != "undefined" && _except(msg)
    }
    Contracts.checkBooleanOrUndefined = checkBooleanOrUndefined;
    function checkBlob(value, msg) {
        value instanceof Blob || _except(msg)
    }
    Contracts.checkBlob = checkBlob;
    function checkString(value, msg) {
        typeof value != "string" && _except(msg)
    }
    Contracts.checkString = checkString;
    function checkStringOrNull(value, msg) {
        typeof value != "string" && value !== null && _except(msg)
    }
    Contracts.checkStringOrNull = checkStringOrNull;
    function checkStringOrNullOrBlob(value, msg) {
        typeof value == "string" || value === null || value instanceof Blob || _except(msg)
    }
    Contracts.checkStringOrNullOrBlob = checkStringOrNullOrBlob;
    function checkStringOrUndefined(value, msg) {
        typeof value != "string" && typeof value != "undefined" && _except(msg)
    }
    Contracts.checkStringOrUndefined = checkStringOrUndefined;
    function checkStringOrUndefinedOrBlob(value, msg) {
        typeof value == "string" || typeof value == "undefined" || value instanceof Blob || _except(msg)
    }
    Contracts.checkStringOrUndefinedOrBlob = checkStringOrUndefinedOrBlob;
    function checkAllStrings(array, msg) {
        array instanceof Array ? array.forEach(function(item) {
            typeof item != "string" && _except(msg)
        }) : _except(msg)
    }
    Contracts.checkAllStrings = checkAllStrings;
    function checkHashTableOfObjects(dict, msg) {
        checkObject(dict);
        Object.keys(dict).forEach(function(key) {
            checkObject(dict[key])
        })
    }
    Contracts.checkHashTableOfObjects = checkHashTableOfObjects;
    function checkPureObject(value, msg) {
        (typeof value != "object" || value === null) && _except(msg)
    }
    Contracts.checkPureObject = checkPureObject;
    function checkPrimitiveTypeOrNull(value, msg) {
        typeof value != "string" && typeof value != "number" && typeof value != "boolean" && value !== null && _except(msg)
    }
    Contracts.checkPrimitiveTypeOrNull = checkPrimitiveTypeOrNull;
    function checkPrimitiveType(value, msg) {
        typeof value != "string" && typeof value != "number" && typeof value != "boolean" && _except(msg)
    }
    Contracts.checkPrimitiveType = checkPrimitiveType;
    function _sourceFromStacktrace() {
        try {
            throw new Error;
        }
        catch(e) {
            return e.stack
        }
    }
    Contracts._sourceFromStacktrace = _sourceFromStacktrace;
    function _except(msg) {
        msg = msg || "Unknown error.";
        var callStack = _sourceFromStacktrace();
        throw new Error("Exception message: '" + msg + "'\nException call stack:\n" + callStack);
    }
    Contracts._except = _except
})(Contracts || (Contracts = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Promise;
    (function(Promise) {
        function createCompletablePromise(initFunction, cancelFunction) {
            Contracts.checkFunctionOrUndefined(initFunction);
            Contracts.checkFunctionOrUndefined(cancelFunction);
            var complete,
                error,
                promise = new WinJS.Promise(function(c, e, progress) {
                    complete = c;
                    error = e;
                    initFunction && initFunction(c, e, progress)
                }, cancelFunction);
            Contracts.checkFunction(complete);
            return {
                    complete: complete, promise: promise, error: error
                }
        }
        Promise.createCompletablePromise = createCompletablePromise
    })(Promise = Core.Promise || (Core.Promise = {}))
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Promise;
    (function(Promise) {
        var PromiseQueue = function() {
                function PromiseQueue() {
                    this._jobs = null;
                    this._currentRunningJob = null;
                    this._isCanceling = !1;
                    this._jobs = []
                }
                return PromiseQueue.prototype.cancelAll = function() {
                        if (this._jobs.length > 0) {
                            this._isCanceling = !0;
                            for (var i = 0, len = this._jobs.length; i < len; i++)
                                this._jobs[i].promise.cancel();
                            this._isCanceling = !1;
                            this._jobs.splice(0, this._jobs.length)
                        }
                        this._currentRunningJob !== null && this._currentRunningJob.promise.cancel()
                    }, PromiseQueue.prototype.getJobsCount = function() {
                        return (this._currentRunningJob === null ? 0 : 1) + this._jobs.length
                    }, PromiseQueue.prototype.pushJob = function(fnThatReturnsPromise) {
                            var newJob = {
                                    start: null, promise: null
                                },
                                promise = new WinJS.Promise(function(start) {
                                    newJob.start = start
                                });
                            return this._jobs.push(newJob), promise = promise.then(fnThatReturnsPromise).then(function(result) {
                                    return this._shiftJobsAndStartNextJobIfExists(), result
                                }.bind(this), function(error) {
                                    if (this._isCanceling || this._shiftJobsAndStartNextJobIfExists(), Core.Utility.isCanceledError(error))
                                        throw error;
                                    throw error;
                                }.bind(this)), newJob.promise = promise, this._currentRunningJob === null && this._shiftJobsAndStartNextJobIfExists(), promise
                        }, PromiseQueue.prototype._shiftJobsAndStartNextJobIfExists = function() {
                            this._jobs.length > 0 ? (this._currentRunningJob = this._jobs.shift(), this._currentRunningJob.start()) : this._currentRunningJob = null
                        }, PromiseQueue
            }();
        Promise.PromiseQueue = PromiseQueue
    })(Promise = Core.Promise || (Core.Promise = {}))
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Utility;
    (function(Utility) {
        function clamp(value, minimum, maximum) {
            return value = Math.max(value, minimum), Math.min(value, maximum)
        }
        Utility.clamp = clamp
    })(Utility = Core.Utility || (Core.Utility = {}))
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Utility;
    (function(Utility) {
        function isNullOrUndefined(obj) {
            return obj === null || typeof obj == "undefined"
        }
        Utility.isNullOrUndefined = isNullOrUndefined;
        function isDefined(value) {
            return typeof value != "undefined"
        }
        Utility.isDefined = isDefined;
        function isCanceledError(error) {
            return Contracts.checkObject(error), error instanceof Error && error.description === "Canceled" && error.message === "Canceled"
        }
        Utility.isCanceledError = isCanceledError
    })(Utility = Core.Utility || (Core.Utility = {}))
})(Core || (Core = {}));
//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
var Core;
(function(Core) {
    var Utility;
    (function(Utility) {
        function startsWith(text, pattern) {
            Contracts.checkString(text);
            Contracts.checkString(pattern);
            var regex = new RegExp("^" + pattern);
            return regex.test(text)
        }
        Utility.startsWith = startsWith;
        function startsWithNumber(text) {
            return startsWith(text, "[0-9]")
        }
        Utility.startsWithNumber = startsWithNumber;
        function replaceAllButAlphanumericsOrUnderscores(source, replacement, groupAdjacentMatches) {
            return (Contracts.checkString(source), Contracts.checkString(replacement), groupAdjacentMatches) ? source.replace(/[^a-zA-Z0-9_]+/g, replacement) : source.replace(/[^a-zA-Z0-9_]/g, replacement)
        }
        Utility.replaceAllButAlphanumericsOrUnderscores = replaceAllButAlphanumericsOrUnderscores;
        function formatString(format) {
            for (var args = [], _i = 1; _i < arguments.length; _i++)
                args[_i - 1] = arguments[_i];
            return format.replace(/{(\d+)}/g, function(x, i) {
                    var val = args[parseInt(i, 10)];
                    return typeof val == "undefined" ? x : val
                })
        }
        Utility.formatString = formatString
    })(Utility = Core.Utility || (Core.Utility = {}))
})(Core || (Core = {}));