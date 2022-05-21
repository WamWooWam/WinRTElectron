
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*exported createMockPlatformCollection,removeTextMarkers,runSync,People*/
/*global window,Jx,Calendar,setImmediate,WinJS,-removeTextMarkers,-runSync,-People*/

//
// Resources
//

Jx.res.getString = function(id) {
    return id;
};

Jx.res.getFormatFunction = function(id) {
    return function() {
        return id + ";" + Array.prototype.join.call(arguments, ";");
    };
};

function removeTextMarkers(s) {
    return s.replace(/\u200e/g, "")
            .replace(/\u200b/g, "");
}

//
// Sync/Async
//

function runSync(func, context, args, skipMockAnimations) {
    /// <summary>
    /// Runs the given function synchronously
    /// The function runs, callbacks are captured, and then after the function is finished running any callbacks are also run.
    /// Animations are disabled and any animation callbacks are captured similarly.
    /// </summary>
    /// <param name="func" type="Function">Code to run synchronously</param>
    /// <param name="context" type="Object">"this" object for the function</param>
    /// <param name="args" type="Array">Array of arguments to pass to function</param>
    /// <param name="skipMockAnimations" type="Boolean">Indicates whether this function should avoid mocking things in the Animations namespace</param>

    var immediate = window.setImmediate,
        clearImmediate = window.clearImmediate,
        timeout = window.setTimeout,
        clearTimeout = window.clearTimeout,
        requestAnimationFrame = window.requestAnimationFrame,
        cancelAnimationFrame = window.cancelAnimationFrame,
        fadeIn,
        fadeOut,
        executeTransition,
        useMockAnimations = false,
        animationsEnabled = false,
        callbacks = [],
        callbackArgs = [],
        runSyncFinished = false;

    if (window.WinJS && WinJS.UI && WinJS.UI.Animation) {
        useMockAnimations = !skipMockAnimations;

        if (useMockAnimations) {
            fadeIn = WinJS.UI.Animation.fadeIn;
            fadeOut = WinJS.UI.Animation.fadeOut;
            executeTransition = WinJS.UI.executeTransition;
            animationsEnabled = WinJS.UI.isAnimationEnabled();

            WinJS.UI.disableAnimations();
        }
    }

    window.setImmediate = window.msSetImmediate = function (callback) {
        callbacks.push(callback);
        callbackArgs.push(Array.prototype.slice.call(arguments, 1));
        return -callbacks.length;
    };

    window.requestAnimationFrame = window.setTimeout = function (callback) {
        callbacks.push(callback);
        callbackArgs.push([]);
        return -callbacks.length;
    };

    window.cancelAnimationFrame = window.clearImmediate = window.msClearImmediate = window.clearTimeout = function (id) {
        if (id < 0) {
            callbacks[-id-1] = null;
        } else {
            clearTimeout(id);
        }
    };

    function generateAnimationFunction(originalFunction) {
        /// <summary>Creates a mock animation function that calls the original and then returns a mock promise which will complete synchronously</summary>

        return function () {

            // Call original, which should complete immediately since animations are disabled
            originalFunction().done();

            function getCallback(isThen) {
                return function (successCallback) {
                    if (runSyncFinished) {
                        throw new Error("Error running promise synchronously - promise callback (then/done) was not initialized during runSync");
                    }

                    if (successCallback) {
                        setImmediate(successCallback);
                    }

                    if (isThen) {
                        var mockPromise = {
                            then: getCallback(true),
                            done: getCallback(false),
                            cancel: Jx.fnEmpty
                        };

                        return mockPromise;
                    }
                };
            }

            var mockPromise = {
                then: getCallback(true),
                done: getCallback(false),
                cancel: Jx.fnEmpty
            };

            return mockPromise;
        };
    }

    // Mock animation-related functions so that their promises complete sync.
    // This is necessary in addition to disabling animations - without this the promise callback won't necessarily have completed by the end of the runSync block.
    if (useMockAnimations) {
        WinJS.UI.Animation.fadeIn = generateAnimationFunction(fadeIn);
        WinJS.UI.Animation.fadeOut = generateAnimationFunction(fadeOut);
        WinJS.UI.executeTransition = generateAnimationFunction(executeTransition);
    }

    var result;
    try {
        result = func.apply(context, args);
        for (var i = 0; i < callbacks.length; i++) {
            if (callbacks[i]) {
                callbacks[i].apply(null, callbackArgs[i]);                    
            }
        }
    } finally {
        window.setImmediate = window.msSetImmediate = immediate;
        window.clearImmediate = window.msClearImmediate = clearImmediate;
        window.setTimeout = timeout;
        window.clearTimeout = clearTimeout;
        window.cancelAnimationFrame = cancelAnimationFrame;
        window.requestAnimationFrame = requestAnimationFrame;

        if (useMockAnimations) {
            WinJS.UI.Animation.fadeIn = fadeIn;
            WinJS.UI.Animation.fadeOut = fadeOut;
            WinJS.UI.executeTransition = executeTransition;
        }

        if (animationsEnabled) {
            WinJS.UI.enableAnimations();
        }
    }

    runSyncFinished = true;

    return result;
}

//
// Helpers (date/time formatting)
// 

this.mockDateTimeFormatting = function () {
    Calendar.Helpers.ensureFormats();
};

this.restoreDateTimeFormatting = function () {
};

//
// People
//

var People = window.People || {};
People.Priority = People.Priority || {};

//
// QuickEvent
//

(function (global) {
    var QuickEvent;

    global.mockQuickEvent = function () {
        QuickEvent = Calendar.Controls.QuickEvent;

        Calendar.Controls.QuickEvent = function () {
            return {
                _opened: false,
                _date: null,
                isOpen: function () { return this._opened; },
                onDismiss: function () { this._opened = false; },
                activateUI: function (el, date) { this._opened = true; this._date = date; },
                deactivateUI: function () { this._opened = false; },
                getParent: function () { return null; },
                _setParent: Jx.fnEmpty
            };
        };
    };

    global.restoreQuickEvent = function () {
        Calendar.Controls.QuickEvent = QuickEvent;
    };
})(this);

//
// TimeIndicator
//

(function(global) {
    var TimeIndicator,
        startClock,
        DatePicker;

    global.mockTimeIndicator = function() {
        TimeIndicator = Calendar.Controls.TimeIndicator;

        Calendar.Controls.TimeIndicator = function() {
            return {
                activateUI:   Jx.fnEmpty,
                deactivateUI: Jx.fnEmpty
            };
        };
    };

    global.restoreTimeIndicator = function() {
        Calendar.Controls.TimeIndicator = TimeIndicator;
    };

    global.mockDatePicker = function () {
        DatePicker = Calendar.Controls.DatePicker;

        Calendar.Controls.DatePicker = function () {
            return {
                prototype: {},
                setIdSuffix: Jx.fnEmpty,
                activateUI: Jx.fnEmpty,
                deactivateUI: Jx.fnEmpty,
                getParent: function () { return null; },
                _setParent: Jx.fnEmpty,
                shutdownUI: Jx.fnEmpty,
                setToday: Jx.fnEmpty,
                setFocusDate: Jx.fnEmpty,
                setHighlightDates: Jx.fnEmpty,
                addCustomClass: Jx.fnEmpty,
            };
        };

        // need to keep this in synch with the version in DatePicker.js
        Calendar.Controls.DatePicker.PickMode = {
            monthGrid: 0,
            yearGrid: 1,
        };

        // need to keep this in synch with the version in DatePicker.js
        Calendar.Controls.DatePicker.ClientView = {
            unknown: 0,
            day: 1,
            workWeek: 2,
            week: 3,
            month: 4,
            eventDetails: 5,
        };

    };

    global.restoreDatePicker = function () {
        Calendar.Controls.DatePicker = DatePicker;
    };
})(this);

//
// MockJobset
//

var MockJobset = function() {
    this._token  = 0;
    this._parent = null;

    this._children = [];
};

MockJobset.prototype.addUIJob = function(ctx, fn, args) { // ctx, fn, args, pri
    var token = this._token,
        that  = this;

    window.setImmediate(function() {
        if (token === that._token) {
            fn.apply(ctx, args);
        }
    });
};

MockJobset.prototype.setVisibility = function() { // isVisible
};

MockJobset.prototype.createChild = function() {
    var child = new MockJobset();
    this._children.push(child);
    child._parent = this;

    return child;
};

MockJobset.prototype.cancelJobs = function() {
    this._token++;
};

MockJobset.prototype.cancelAllChildJobs = function() {
    this.cancelJobs();

    this._children.forEach(function(child) {
        child.cancelJobs();
    });
};

MockJobset.prototype.dispose = function() {
    this.cancelAllChildJobs();
};

function createMockPlatformCollection (sourceArray) {
    /// <summary>Returns a mock platform ICollection object based on the given array</summary>

    var collectionObject = {
        _locked: true,
        item: function (i) { return sourceArray[i]; },
        lock: function () { this._locked = true; },
        unlock: function () { this._locked = false; },
        dispose: function () { this._disposed = true; }
    };

    Object.defineProperty(collectionObject, "count", {
        get: function () { return sourceArray.length; }
    });

    return collectionObject;
}