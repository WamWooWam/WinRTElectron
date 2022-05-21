
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="WindowsLive.ref.js" />
/// <reference path="..\..\WinJS\WinJS.ref.js" />
/// <reference path="Jx.js" />

/*global self,window,document,Debug,Microsoft,WinJS,Jx,msWriteProfilerMark,confirm,MSApp*/



// Debug is a JS9+ built-in object

Debug.global = this;

Debug.throwOnAssert = false; // Useful for unit tests
Debug.enableAssertDialog = true; // Useful for unit tests

Debug.AssertError = /*@constructor*/function (message) {
    /// <summary>AssertError constructor.</summary>
    /// <param name="message" type="String" optional="true">Assert message.</param>

    this.message = message || ""; // 'message' is an Error property
};

Debug.AssertError.prototype = new Error();

Debug.AssertError.prototype.name = "AssertError";

Debug.assert = function (/*@dynamic*/expr, msg) {
    /// <summary>Evaluate the expression and show a debug dialog when the result is falsy.</summary>
    /// <param name="expr">Expression to evaluate.</param>
    /// <param name="msg" type="String" optional="true">Optional assert message.</param>

    if (!expr) {
        var text = (msg || "ASSERT") + "\r\n" + Debug.callstack(1);
        msWriteProfilerMark(text);
        if (Debug.throwOnAssert) {
            throw new Debug.AssertError(msg);
        } else if (Debug.assertDialog(text)) {
            /// <disable>JS2043.RemoveDebugCode</disable>
            /*jshint debug:true */
            debugger;
        }
    }
};

Debug.assertDialog = function (text) {
    /// <summary>Shows the assert dialog and returns its result</summary>
    /// <param name="text" type="String">Assert message</param>

    if (Debug.enableAssertDialog) {
        try {
            if (Debug.global.Microsoft) {
                return Microsoft.WindowsLive.Diagnostics.AssertDialog.show(text);
            } else if (Debug.global.confirm) {
                return !confirm(text + "\r\n\r\nPress \"Cancel\" to debug.");
            }
        } catch (ex) {
            try {
                if (Debug.global.Jx) {
                    Jx.log.error(text + "\n\nEnsure Diagnostics.appxfragment is referenced from the installed <SKU>.xml");
                }
            } catch (ex2) {
            }
        }
    }
    return true;
};

Debug.callstack = function (skip) {
    /// <summary>Returns the current callstack</summary>
    /// <param name="skip" type="Number" optional="true">Number of frames from the top to ignore</param>
    try {
        skip = skip || 0;

        var stack;
        try {
            throw new Error();
        } catch (exStack) {
            stack = exStack.stack;
        }

        if (stack) {
            // Declutter the stack string
            stack = stack.replace(/\n\s*at\s*/g, "\n"); // Trim off " at " on every line
            stack = stack.replace(/\(.*\//g, "("); // Cut file URLs down to filenames 
            stack = stack.replace(/:\d+\)/g, ")");  // Remove column number

            var lines = stack.split("\n");
            lines.splice(0, skip + 2);  // Skip past the first line "Error", this function and any other requested frames
            return lines.join("\r\n");
        }

        return "";

    } catch (ex) {
        return "<error retrieving callstack: " + ex + ">";
    }
};

Debug.validate = /*@varargs*/function (/*@dynamic*/object) {
    /// <summary> Call validate on supplied object 
    /// Usage:
    /// function Foo(){...}
    /// Foo.prototype.validate = function (p1, p2) { ... };
    /// Foo.prototype.run = function () {
    ///     ...
    ///     Debug.validate(this, arg1, arg2);
    ///     ...
    /// }
    /// </summary>
    /// <param name="object" />
    Function.call.apply(object.validate, arguments);
};

Debug.call = /*@varargs*/function () {
    /// <summary> Call a function only in DEBUG.  Example use:
    /// Debug.call(fn, context, arg1, arg2, ...);
    /// </summary>

    // This below line is a method of avoiding altering the arguments array for proper function application.
    // Debug.call can be roughly translated as follows:
    //
    // Debug.call = function(fn, context, ...) { 
    //     return fn.call(context,...); 
    // }
    // Note that this would require something like:
    //   fn.apply(context, Array.prototype.slice(arguments, 2))
    Function.call.apply(Function.call, arguments);
};

Debug.only = /*@varargs*/function () {
    /// <summary>No-op debug-only wrapper; pass an (ignored) expression to be evaluated in 
    /// debug-only. Syntactically-simpler alternative to Debug.call or /// #DEBUG, /// #ENDDEBUG.
    /// Example use: Debug.only(Jx.log.info("..."));
    /// </summary>
};

Debug.setObjectName = function (/*@dynamic*/obj, debugName) {
    /// <summary>Set the object's debug name.</summary>
    /// <param name="obj">Object on which to set the debug name.</param>
    /// <param name="debugName" type="String">Debug name to set.</param>

    if (obj) {
        obj._debugObjectName = debugName;
    }
};

Debug.getObjectName = function (/*@dynamic*/obj) {
    /// <summary>Get the object's debug name.</summary>
    /// <param name="obj">Object from which to get the name.</param>
    /// <returns type="String">Returns the object's debug name.</returns>

    return obj ? (obj._debugObjectName || "") : "";
};

// Detects if a function is already bound. Relies on the fact that accessing arguments
// of an already bound function always throws the same exception object. Non-bound functions,
// either in JS or native do not exhibit this behavior in both strict and non-strict modes.
// http://www.ecma-international.org/ecma-262/5.1/#sec-15.3.4.5 (points 19-21)
//Debug._boundException = Object.getOwnPropertyDescriptor((function (){}).bind(null), "arguments").get;
Debug.isFunctionBound = function (func) {
    Debug.assert(Jx.isFunction(func));
    //return Debug._boundException === Object.getOwnPropertyDescriptor(func, "arguments").get;
    return false;
};

Debug.hookPromiseErrors = function (assertOnException) {
    /// <summary>Registers a WinJS.Promise.onerror hook to log exceptions and unhandled
    /// errors, and optionally assert on exceptions. base.js must be loaded prior to 
    /// calling.</summary>
    /// <param name="assertOnException" type="Boolean">Whether to assert at the point
    /// of a (potentially-handled) exception</param>

    if (!Debug.global.WinJS) {
        Debug.assert(false, "base.js must be loaded prior to registering this hook");
        return;
    }
    
    var unhandledErrors = {};
    WinJS.Promise.onerror = function (evt) {
        try {
            var details = evt.detail;
            var id = details.id;
            if (!details.parent) {
                var exception = details.exception;
                if (exception) {
                    var message = "Exception in Promise: " + exception;
                    if (Jx.isNonEmptyString(exception.stack)) {
                        message += "\r\n" + exception.stack;
                    }
                    var assert = assertOnException || Debug.fullDebug; // opt-in to asserts statically or via debug console
                    Jx.log.error(message + (assert ? "" : "\n[To assert when thrown, set Debug.fullDebug=true in debug console.]"));
                    if (assert) {
                        Debug.assert(false, message);
                    }
                } else if (!details.handler) {
                    unhandledErrors[id] = details.error;
                    // Log only if this error remains unhandled when the setImmediate queue is next pumped
                    WinJS.Promise.timeout().then(function () {
                        var errorEntry = unhandledErrors[id];
                        if (errorEntry) {
                            if (Array.isArray(errorEntry)) {
                                var numEntries = errorEntry.length;
                                Debug.assert(numEntries >= 1, "Not expecting an empty array of Promise errors; need handling?");
                                var lastEntry = errorEntry[numEntries - 1];
                                Debug.assert(numEntries === 1 || lastEntry.message === "Canceled",
                                    "Not expecting a chain of Promise errors; need handling?");
                                errorEntry = lastEntry;
                            }
                            if (errorEntry.message !== "Canceled") {
                                Jx.log.error("Unhandled error in Promise after timeout: " + errorEntry);
                            }
                            delete unhandledErrors[id];
                        }
                    });
                }
            }
            if (details.handler) {
                // Error was handled; we don't need to log it
                delete unhandledErrors[id];
            }
        } catch (ex) {
            Debug.assert(false, "Exception in Promise.onerror hook: " + ex);
        }
    };
};

// TODO: move it to DebugConsole
Debug.dumpScripts = function () {
    var scripts = document.scripts, 
        len = scripts.length,
        s = "<table>", 
        script, i, src, rs;
    
    for (i = 0; i < len; i++) {
        script = scripts[i];
        src = script.getAttribute("src") || "{inline script}";
        rs = script.readyState;
        s += "<tr><td>" + String(i) + "</td><td>" + src + "</td><td>" + rs + "</td></tr>";
        msWriteProfilerMark("" + String(i) + ": " + src + " (" + rs + ")");
    }
    
    Debug.console.writeHTML(s + "</table>");
};

// TODO: move it to DebugConsole
Debug.dumpStyles = function () {
    var ss = document.styleSheets, 
        len = ss.length,
        h = "<table>", 
        s, i, href, rs;
    
    for (i = 0; i < len; i++) {
        s = ss[i];
        href = s.href || "inline:" + s.cssText.substr(0, 20);
        rs = s.readyState;
        h += "<tr><td>" + String(i) + "</td><td>" + href + "</td><td>" + rs + "</td></tr>";
        msWriteProfilerMark("" + String(i) + ": " + href + " (" + rs + ")");
    }
    
    Debug.console.writeHTML(h + "</table>");
};

Debug.log = function (msg) {
    /// <summary>Log a message with the "info" level in debug builds only.</summary>
    /// <param name="msg" type="String">Log message.</param>
    Jx.log.info(msg);
};

// WWA only shortcuts
if ("window" in self && "Windows" in self) {
    window.addEventListener("keydown", function (ev) {
    /// <param name="ev" type="Event">The keydown event object.</param>

        var keyCode = ev.keyCode,
            shift = ev.shiftKey, 
            ctrl = ev.ctrlKey, 
            alt = ev.altKey;

        if (keyCode === 188 && shift && ctrl && !alt) {
            // ctrl+shift+<
            window.history.back();
        } else if (keyCode === 190 && shift && ctrl && !alt) {
            // ctrl+shift+>
            window.history.forward();
        } else if (keyCode === 115 && !shift && ctrl && !alt) {
            // ctrl+f4
            MSApp.terminateApp(new Error());
        } else if (keyCode === 116 && shift && ctrl && !alt) {
            // ctrl+shift+f5
            window.location.reload();
        } else if (keyCode === 117 && !shift && !ctrl && !alt) {
            // f6
            if (window.RedGrid) {
                window.RedGrid.toggle();
            } else {
                var script = document.createElement("script");
                script.addEventListener("load", function () {
                    window.RedGrid.toggle();
                });
                script.src = "/Jx/RedGrid.js";
                document.head.appendChild(script);
            }
        }
    }, false);
}



;//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// NoShip namespace

/// <reference path="Jx.js" />

/*global window,NoShip,Jx*/

// TODO: remove the namespace definition in ship builds

/// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
this.NoShip = this.NoShip || {};
/// <enable>JS3092.DeclarePropertiesBeforeUse</enable>



NoShip.log = function (msg) {
    /// <summary>Log a message with the "info" level in noship builds only.</summary>
    /// <param name="msg" type="String">Log message.</param>
    Jx.log.info(msg);
};

NoShip.only = /*@varargs*/function () {
    /// <summary>No-op noship-only wrapper; pass an (ignored) expression to be evaluated in 
    /// noship-only. Syntactically-simpler alternative /// #IFDEF NOT_SHIP, /// #ENDIF.
    /// Example use: NoShip.only(Jx.log.perf("..."));
    /// </summary>
};




;//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Jx.ref.js" />

/*global self,window,msWriteProfilerMark,WinJS,Debug,Microsoft,MSApp,Jx,Windows*/

// Ensure that Jx is loaded once.
Debug.assert(!("Jx" in self), "Jx is already loaded");

self.Jx = {};


Jx.debug = true;


/// <summary>True if it's running in WWAHost.</summary>
Jx.isWWA = "Windows" in self;

/// <summary>True if it's running in a web worker.</summary>
Jx.isWorker = "WorkerGlobalScope" in self;

/// <summary>True if it's running in a Trident based browser.</summary>
Jx.isTrident = "msCapture" in self;

Jx.inherit = /*@extension('Wlx,InheritHandler')*/function (/*@dynamic*/objCtor, /*@dynamic*/base) {
    /// <summary>Helper for prototypal inheritance</summary>
    /// <param name="objCtor">Constructor of the derived object.</param>
    /// <param name="base">Base object or constructor</param>

    Debug.assert(Jx.isFunction(objCtor));
    Debug.assert(Jx.isObject(base) || Jx.isFunction(base));

    function T() { }
    T.prototype = base.prototype || base; // Object literals don't have prototype
    objCtor.prototype = new T();
    objCtor.prototype.constructor = objCtor;
};

Jx.mix = /*@extension('Wlx,MixHandler')*/function (/*@dynamic*/dest, /*@dynamic*/src) {
    /// <summary>Copy all properties from src to dest</summary>
    /// <param name="dest">Destination object</param>
    /// <param name="src">Source object</param>
    /// <returns>Returns the destination object.</returns>

    // Ensure the src is valid
    Debug.assert(src);

    // Enumerate all properties in src
    for (var i in src) {

        // Don't copy properties inherited from prototype. Object.prototype might be augmented.
        if (src.hasOwnProperty(i)) {

            // Don't override properties
            Debug.assert(!dest.hasOwnProperty(i));

            dest[i] = src[i];
        }
    }

    return dest;
};

Jx.augment = /*@extension('Wlx,AugmentHandler')*/function (/*@dynamic*/dest, /*@dynamic*/src) {
    /// <summary>Copy properties from src to dest.prototype</summary>
    /// <param name="dest">Destination object or constructor</param>
    /// <param name="src">Source object</param>
    /// <returns>Returns the destination object.</returns>

    Debug.assert(Jx.isFunction(dest) || Jx.isObject(dest));
    Debug.assert(Jx.isObject(dest.prototype)); // Dest should have a prototype - object literals don't have a prototype

    // Use the prototype of the source if it has one.
    return Jx.mix(dest.prototype, src.prototype || src);
};

Jx.dispose = function (/*@dynamic*/obj) {
    /// <summary>Safe object dispose call.</summary>
    /// <param name="obj" optional="true">Object to dispose.</param>
    if (obj && obj.dispose) {
        Debug.assert(Jx.isFunction(obj.dispose), "Jx.dispose - obj.dispose is not a function");
        obj.dispose();
    } else if (obj && obj.close) {
        Debug.assert(Jx.isFunction(obj.close), "Jx.dispose - obj.close is not a function");
        obj.close();
    }
};

Jx._escapeRegex = /[&<>'"]/g;
Jx._escapeChars = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
};

Jx._escapeFn = function (c) {
    return Jx._escapeChars[c] || " ";
};

Jx.escapeHtml = function (str) {
    /// <summary>HTML escapes the input string</summary>
    /// <param name="str" type="String">Input string</param>
    /// <returns type="String">Returns an HTML escaped version of the input string</returns>

    Debug.assert(Jx.isString(str));

    return str.replace(Jx._escapeRegex, Jx._escapeFn);
};

Jx._escapeToSingleLineRegex = /[\n\r]+|[&<>'"]/g;

Jx.escapeHtmlToSingleLine = function (str) {
    /// <summary>HTML escapes the input string</summary>
    /// <param name="str" type="String">Input string</param>
    /// <returns type="String">Returns an HTML escaped and single line version of the input string</returns>

    Debug.assert(Jx.isString(str));

    return str.replace(Jx._escapeToSingleLineRegex, Jx._escapeFn);
};

Jx.fnEmptyString = /*@varargs*/function () {
    /// <summary>
    /// Function that returns an empty string.
    /// Used as default implementation for functions that can be overriden in inherited objects.
    /// Marked as having variable arguments so it can be used in place of any function.
    /// </summary>
    return "";
};

Jx.fnEmpty = /*@varargs*/function () {
    /// <summary>Empty function used as default implementation for functions that can be overriden in inherited objects</summary>
};

Jx.isString = function (/*@dynamic*/v) {
    /// <summary>Check if the given argument is a string.</summary>
    /// <param name="v">Argument to check.</param>
    /// <returns type="Boolean">Returns true if the argument is a string.</returns>    
    return typeof v === "string";
};

Jx.isNonEmptyString = function (/*@dynamic*/v) {
    /// <summary>Check if the given argument is a non-empty string.</summary>
    /// <param name="v">Argument to check.</param>
    /// <returns type="Boolean">Returns true if it's a non-empty string.</returns>    
    return typeof v === "string" && Boolean(v);
};

Jx.isDefined = function (/*@dynamic*/v) {
    /// <summary>Check if the given argument is null or undefined.</summary>
    /// <param name="v">Argument to check.</param>
    /// <returns type="Boolean">Returns true if it's neither null nor undefined.</returns>
    
    /*jshint eqnull:true */
    return v != null;
};

Jx.isNullOrUndefined = function (/*@dynamic*/v) {
    /// <summary>Check if the given argument is null or undefined.</summary>
    /// <param name="v">Argument to check.</param>
    /// <returns type="Boolean">Returns true if it's null or undefined.</returns>    
    return v === undefined || v === null;
};

Jx.isUndefined = function (/*@dynamic*/v) {
    /// <summary>Check if the given argument is undefined.</summary>
    /// <param name="v">Argument to check.</param>
    /// <returns type="Boolean">Returns true if it's undefined.</returns>    
    return v === undefined;
};

Jx.isObject = function (/*@dynamic*/obj) {
    /// <summary>Check if the given argument is a valid object.</summary>
    /// <param name="obj">Argument to check.</param>
    /// <returns type="Boolean">Returns true if it's an object that is not null or undefined.</returns>
    return obj !== undefined && obj !== null && typeof obj === "object";
};

Jx.isInstanceOf = function (/*@dynamic*/obj, instance) {
    /// <summary>Check if the given argument is a valid object
    ///     and an instance of the given class.</summary>
    /// <param name="obj">Argument to check.</param>
    /// <param name="instance" type="Function">Instance type to check.</param>
    /// <returns type="Boolean">Returns true if it's an object of the given class.</returns>
    if (!Jx.isObject(obj)) {
        return false;
    }
    var isInstance = ((instance === undefined) || (obj instanceof instance));
    
    // For fake objects - often used in unit tests and mock platforms - put
    // a .mockedType property that specifies the class you're trying to fake.
    // This will then use that property in debug only.
    isInstance = isInstance || (obj.mockedType === instance);
    
    return isInstance;
};

Jx.isObjectType = function (/*@dynamic*/obj) {
    /// <summary>Check if the given argument has the "object" type.</summary>
    /// <param name="obj">Argument to check.</param>
    /// <returns type="Boolean">Returns true if the argument has the "object" type.</returns>    
    return typeof obj === "object";
};

Jx.isFunction = function (/*@dynamic*/v) {
    /// <summary>Check if the given argument has the "function" type.</summary>
    /// <param name="v">Argument to check.</param>
    /// <returns type="Boolean">Returns true if the argument has the "function" type.</returns>    
    return typeof v === "function";
};

Jx.isArray = function (/*@dynamic*/v) {
    /// <summary>Check if the given argument is a valid array.</summary>
    /// <param name="v">Argument to check.</param>
    /// <returns type="Boolean">Returns true if it's a valid array.</returns>    
    return Array.isArray(v);
};

Jx.isNumber = function (/*@dynamic*/n) {
    /// <summary>Check if the given argument is a number.</summary>
    /// <param name="n">Argument to check.</param>
    /// <returns type="Boolean">Returns true if it's a number.</returns>    
    return typeof n === "number";
};

Jx.isValidNumber = function (/*@dynamic*/n) {
    /// <summary>Check if the given argument is a valid number. NaN and infinite values are not valid numbers.</summary>
    /// <param name="n">Argument to check.</param>
    /// <returns type="Boolean">Returns true if it's a valid number.</returns>    
    return typeof n === "number" && isFinite(n);
};

Jx.isBoolean = function (/*@dynamic*/v) {
    /// <summary>Check if the given argument is a boolean type.</summary>
    /// <param name="v">Argument to check.</param>
    /// <returns type="Boolean">Returns true if it's a boolean.</returns>    
    return typeof v === "boolean";
};

Jx.isDate = function (/*@dynamic*/n) {
    /// <summary>Check if the given argument is a Date object.</summary>
    /// <param name="n">Argument to check.</param>
    /// <returns type="Boolean">Returns true if it's a Date object.</returns>
    return n instanceof Date;
};

Jx._uidLast = 0;

Jx.uid = function () {
    /// <summary>Get a new unique id.</summary>
    /// <returns type="Number">Returns an unique id.</returns>

    return ++this._uidLast;
};



Debug.isValidMark = function (msg) {
    // $TODO use regexp to validate and add UTs
    return Jx.isNonEmptyString(msg);
};



Jx._markPrefix = "";

Jx.setMarkPrefix = function (str) {
    Jx._markPrefix = str;
};

Jx.mark = function (msg) {
    /// <summary>Write a profiler mark using msWriteProfilerMark().</summary>
    /// <param name="msg" type="String">Message to write.</param>

    // Use the msg format described here: http://sharepoint/sites/IE/Resources/wiki/Wiki%20Pages/Perf_IEVis%20Nested%20Events.aspx 
    
    Debug.assert(Debug.isValidMark(msg), "Jx.mark: Debug.isValidMark(msg)");

    msWriteProfilerMark(Jx._markPrefix + msg);
};

Jx._startTA = function (s) { 
    Jx.mark("Jx." + s + ",StartTA,Jx"); 
};

Jx._stopTA = function (s) { 
    Jx.mark("Jx." + s + ",StopTA,Jx"); 
};

Jx.help = function (app) {
    /// <summary>Launch the help for app.</summary>
    /// <param name="app" type="String">App id.</param>

    var ids = {
        calendar: "282451",
        mail: "282452",
        people: "282453",
    };

    Debug.assert(app in ids, "Jx.help: invalid app");

    var Sys = Windows.System;
    var options = new Sys.LauncherOptions(); 
    options.desiredRemainingView = Windows.UI.ViewManagement.ViewSizePreference.useHalf; 
    Sys.Launcher.launchUriAsync(new Windows.Foundation.Uri("http://go.microsoft.com/fwlink/p/?LinkId=" + ids[app]), options).done();    
};

/// <summary>Binary Jx object</summary>
Jx.abi = /*@static_cast(Microsoft.WindowsLive.IJx)*/null;

Jx.initABI = function () {
    /// <summary>Creates a new Jx ABI object if needed.</summary>

    // Keep the ABI creation in a separate function so it can be delay loaded and mocked
    Jx._startTA("abi");
    Jx.abi = new Microsoft.WindowsLive.Jx();
    Jx._stopTA("abi");
    Jx.initABI = Jx.fnEmpty;
};

Jx.etw = function (evid) {     
    /// <summary>Write ETW event id.</summary>
    /// <param name="evid" type="String">The event id.</param>

    Debug.assert(Jx.isNonEmptyString(evid), "Jx.etw: Jx.isNonEmptyString(evid)");

    Jx.initABI();

    // "Unspecified error" usually means that evid is not a valid event id which are defined in jx.cpp
    Jx.abi.etw(evid);
};

Jx.startSession = function () {     
    /// <summary>Start the ETW session.</summary>

    Jx.initABI();
    Jx.abi.startSession();
};

Jx.flushSession = function () {     
    /// <summary>Flush the ETW session.</summary>

    // Jx.startSession should have initialized Jx.abi, don't try to reinitialize it.
    if (Jx.abi) {
        Jx.abi.flushSession();
    }
};

Jx.ptStart = function (ptName, ptKey) {     
    /// <summary>Write a PerfTrack Start event.</summary>
    /// <param name="ptName" type="String">The PerfTrack scenario name.</param>
    /// <param name="ptKey" type="String" optional="true">The PerfTrack scenario key.</param>

    Debug.assert(Jx.isNonEmptyString(ptName), "Jx.ptStart: Jx.isNonEmptyString(ptName)");

    Jx.initABI();

    // "Unspecified error" usually means that ptStart is not a valid event id which are defined in perftrack.cpp
    Jx.abi.ptStart(ptName, ptKey || "");
};

Jx.ptStop = function (ptName, ptKey) {     
    /// <summary>Write a PerfTrack Stop event.</summary>
    /// <param name="ptName" type="String">The PerfTrack scenario name.</param>
    /// <param name="ptKey" type="String" optional="true">The PerfTrack scenario key.</param>

    Debug.assert(Jx.isNonEmptyString(ptName), "Jx.ptStop: Jx.isNonEmptyString(ptName)");

    Jx.initABI();

    // "Unspecified error" usually means that ptStop is not a valid event id which are defined in perftrack.cpp
    Jx.abi.ptStop(ptName, ptKey || "");
};

Jx.ptStopData = function (ptName, ptKey, dw1, dw2, dw3, dw4, dw5, str1, str2) {
    /// <summary>Write a PerfTrack Stop event with metadata.</summary>
    /// <param name="ptName" type="String">The PerfTrack scenario name.</param>
    /// <param name="ptKey" type="String">The PerfTrack scenario key.</param>
    /// <param name="dw1" type="Number">PerfTrack metadata.</param>
    /// <param name="dw2" type="Number">PerfTrack metadata.</param>
    /// <param name="dw3" type="Number">PerfTrack metadata.</param>
    /// <param name="dw4" type="Number">PerfTrack metadata.</param>
    /// <param name="dw5" type="Number">PerfTrack metadata.</param>
    /// <param name="str1" type="String">PerfTrack metadata.</param>
    /// <param name="str2" type="String">PerfTrack metadata.</param>

    Debug.assert(Jx.isNonEmptyString(ptName), "Jx.ptStopData: Jx.isNonEmptyString(ptName)");
    Debug.assert(Jx.isNonEmptyString(ptKey), "Jx.ptStopData: Jx.isNonEmptyString(ptKey)");
    Debug.assert(Jx.isValidNumber(dw1), "Jx.ptStopData: Jx.isValidNumber(dw1)");
    Debug.assert(Jx.isValidNumber(dw2), "Jx.ptStopData: Jx.isValidNumber(dw2)");
    Debug.assert(Jx.isValidNumber(dw3), "Jx.ptStopData: Jx.isValidNumber(dw3)");
    Debug.assert(Jx.isValidNumber(dw4), "Jx.ptStopData: Jx.isValidNumber(dw4)");
    Debug.assert(Jx.isValidNumber(dw5), "Jx.ptStopData: Jx.isValidNumber(dw5)");

    Jx.initABI();

    // "Unspecified error" usually means that ptStop is not a valid event id which are defined in perftrack.cpp
    Jx.abi.ptStopData(ptName, ptKey, dw1, dw2, dw3, dw4, dw5, str1, str2);
};

// PerfTrack time points used in custom stop events
Jx.TimePoint = { 
    visibleComplete: 0, 
    responsive: 1,
};

Jx.ptStopLaunch = function (timePoint, kind) {     
    Debug.assert(Jx.findKey(Jx.TimePoint, timePoint) !== undefined);
    Debug.assert(Jx.isValidNumber(kind) && kind >= 0);

    Jx.initABI();
    Jx.abi.ptStopLaunch(timePoint, kind);
};

Jx.ptStopResume = function (timePoint) {     
    Debug.assert(Jx.findKey(Jx.TimePoint, timePoint) !== undefined);

    Jx.initABI();
    Jx.abi.ptStopResume(timePoint);
};

Jx.ptStopResize = function (timePoint, isMajorChange, isRotate, logicalWidth, logicalHeight) {     
    Debug.assert(Jx.findKey(Jx.TimePoint, timePoint) !== undefined);
    Debug.assert(Jx.isBoolean(isMajorChange));
    Debug.assert(Jx.isBoolean(isRotate));
    Debug.assert(Jx.isValidNumber(logicalWidth));
    Debug.assert(Jx.isValidNumber(logicalHeight));

    Jx.initABI();
    Jx.abi.ptStopResize(timePoint, isMajorChange, isRotate, logicalWidth, logicalHeight);
};

Jx.fault = function (faultBucketName, faultOriginIdentifier, /*@dynamic*/exceptionObject) {
    /// <summary>report a fault using errorreponder to upload logs.</summary>
    /// <param name="faultBucketName " type="String">This string is used to differentiate/bucketize faults. You can use the name of your control, feature, scenario name, class name or filename as the bucket name.</param>
    /// <param name="faultOriginIdentifier" type="String" >This helps differentiate faults within a fault bucket. Say if you are using foo.js as the faultbucket, you might use the function name to different origin points in foo.js</param>
    /// <param name="exceptionObject" optional="true">Exception to be reported.</param>

    Debug.assert(Jx.isNonEmptyString(faultBucketName), "Jx.fault: Jx.isNonEmptyString(faultBucketName)");
    Debug.assert(Jx.isNonEmptyString(faultOriginIdentifier), "Jx.fault: Jx.isNonEmptyString(faultOriginIdentifier)");

    var msg = "Jx.fault:" + " ( " + faultBucketName + " ) : ( " + faultOriginIdentifier + " )";

    var errorCode = -1;

    if (Jx.isValidNumber(exceptionObject)) {
        Debug.assert(exceptionObject !== 0, "Jx.fault: exception should be non-zero");
        exceptionObject = {number: exceptionObject, message: "From HRESULT"};
    }

    if (exceptionObject) {

        // For situations such as as shutdown path where log may be destroyed
        if (Jx.log) {
            // write the exception object to the log file
            Jx.log.exception(msg, exceptionObject);
        }

        // if the exception object has number capture the errocode with it.
        if (Jx.isNumber(exceptionObject.number)) {
            errorCode = exceptionObject.number;
        }
    } else {
        if (Jx.log) {
            Jx.log.error(msg);
        }
    }

    Jx.initABI();
    Jx.abi.fault(faultBucketName, faultOriginIdentifier, errorCode);
};

Jx.erRegisterFile = function (filePath) {
    /// <summary>register any file to upload when uploading via errorreponder. See Jx.fault. 
    /// This function can be called at any time before calling Jx.fault. 
    /// Default App logs are auto collected and do not need to be registered
    /// </summary>
    /// <param name="filePath" type="String">File path you would like registered for upload.</param>
    Debug.assert(Jx.isNonEmptyString(filePath), "Jx.erRegisterFile: Jx.isNonEmptyString(filePath)");

    Jx.log.info("Jx.erRegisterFile: " + filePath);

    Jx.initABI();
    Jx.abi.erRegisterFile(filePath);
};

Jx.promoteOriginalStack = function (/*@dynamic*/exception) {
    /// <summary>Helper to maintain stack context across rethrown exceptions. If the specified exception is an Error
    /// object (or derives from it), promotes its stack property to its description. Works around a WER limitation 
    /// which couldn't be addressed for Win8: it reports the stack at the rethrow, not the original stack.</summary>
    /// <param name="exception">The original exception; only Error objects will be adjusted</param>

    if (exception instanceof Error) {
        var stack = /*@static_cast(String)*/exception.stack;
        if (Jx.isNonEmptyString(stack)) {
            var description = exception.description;
            if (Jx.isNonEmptyString(description) && stack.indexOf(description) === 0) {
                // stack begins with description (this is typical); replace it
                exception.description = stack;
            } else {
                exception.description = JSON.stringify(description) + " " + stack;
            }
        }
    }

    // Note: we don't rethrow the exception here to avoid less-useful Watson bucketing, which
    // is still based on the rethrow stack (the promoted original stack is available in the cab)
};

// Returns the first key in obj that has obj[key] ==== value
Jx.findKey = function (obj, value) {
    Debug.assert(Jx.isObject(obj), "Jx.findKey: invalid obj");
    for (var k in obj) {
        if (obj[k] === value) {
            return k;
        }
    }
    // returns undefined if the value was not found
};

// This method intentionally returns undefined in the default case.
/// <disable>JS3054.NotAllCodePathsReturnValue</disable>
Jx.getAppNameFromId = function (appId) {
    /// <summary>
    /// Retrieves the app's name from the given AppId
    /// Intended for use to put together app-specific CSS file names, see "AppColor in CSS" cookbook OneNote page for more details.
    /// </summary>
    /// <param name="appId" type="Number">AppId for which to get the name (can use Jx.appId)</param>
    /// <returns type="String">string app name, undefined if appId is not valid</returns>

    var jxAppIds = Object.keys(Jx.AppId);
    var jxAppIdLength = jxAppIds.length;
    for (var i = 0; i < jxAppIdLength; i++) {
        var appIdName = jxAppIds[i];
        // special case "min", it has the same value as "chat" and we want to return "chat".  "max" does not have this problem.
        if (Jx.AppId[appIdName] === appId && appIdName !== "min") {
            return appIdName;
        }
    }
    Debug.assert(false, "Unrecognized appId");
};
/// <enable>JS3054.NotAllCodePathsReturnValue</enable>

Jx.terminateApp = function (error) {
    /// <summary>Calls MSApp.terminateApp with the passed in error object, augmenting
    /// it as necessary to ensure a WER report.</summary>
    /// <param name="error" type="Error">An error object to be passed to MSApp.terminateApp</param>
    Debug.assert(error);
    if (!error) {
        error = new Error("[Jx.terminateApp: no original error]");
    }

    // MSApp.terminateApp currently requires a strictly-shaped Error object to successfully
    // produce a WER report [Win8 bugs 954338, 956063]
    if (!Jx.isString(error.description)) {
        // message is the ECMA standard property, description is the legacy IE equivalent
        // maintained for back-compat -- MSApp.terminateApp wants the latter
        error.description = error.message || "[Jx.terminateApp: no original description/message]";
    }

    if (!Jx.isString(error.stack)) {
        // If the Error hasn't been thrown, do so now to get the stack at this point
        // (may be useful for synchronous Promise.done errors)
        if (error instanceof Error) {
            try {
                throw error;
            } catch (ex) {
                error.stack = "[Jx.terminateApp] " + ex.stack;
            }
        }

        if (!Jx.isString(error.stack)) {
            error.stack = "[Jx.terminateApp: no original stack]";
        }
    }

    if (!Jx.isValidNumber(error.number)) {
        error.number = 0;
    }

    Debug.assert(false, "About to fail fast via terminateApp: " + error.description);
    MSApp.terminateApp(error);
};

Jx.ensurePromiseErrorHandling = function () {
    /// <summary>Setup WinJS promise.done error handling so that sufficient context (stack) is preserved
    /// for WER reporting. This is based on the guidance from WinJS team for Win8 time frame as a fix in WinJS is too late to be made for RTM.
    /// Refer WinLive 600585 for additional details. </summary>

    // If base.js is loaded, replace with our custom handlers
    if (Boolean(window.WinJS) && Boolean(window.WinJS.Promise)) {
        // No-op further calls
        Jx.ensurePromiseErrorHandling = function () { };

        var terminateOnError = function (v) {
            /// <summary>Prepares the error object and terminates the app.</summary>
            /// <param name="v" type="Error">An error object</param>
            if (!(v instanceof Error)) {
                var description;
                try {
                    description = JSON.stringify(v);
                } catch (e) {
                    description = "[Jx terminateOnError: unknown description]";
                }
                v = new Error(description); // [number + stack set in Jx.terminateApp]
            } else if (v.name === "Canceled") {
                return; // suppress cancel
            }

            Jx.terminateApp(v);
        };

        var errorPromise = /*@static_cast(Object)*/WinJS.Promise.wrapError(null);
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        var doneError = /*@static_cast(Function)*/Object.getPrototypeOf(errorPromise).done;
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
        Object.getPrototypeOf(errorPromise).done = function (c, e, p) {
            e = e || terminateOnError;
            doneError.call(this, c, e, p);
        };

        var completePromise = /*@static_cast(Object)*/WinJS.Promise.wrap();
        Object.getPrototypeOf(completePromise).done = /*@bind(WinJS.Promise)*/function (c) {
            this.then(c).then(null, terminateOnError);
        };
    
    } else {
        Debug.assert(false, "Jx.ensurePromiseErrorHandling - base.js is not loaded yet!");
    
    }
};

// Jx.appId stores the current appId.  Should be set to a value in the Jx.AppId enum.  
// Set as part of Jx.Application constructor
// Intended to be used by various controls so that they can determine which AppColor to use.  May be used by Jx.Launch in the future.
Jx.appId = -1;

(function () {
    // Date time formatters are expensive and it's useful to cache, delay load and instrument them.
    //
    // Example:
    //  var formatter = new Jx.DTFormatter("month year"); // a very lightweight proxy is built here
    //  var s = formatter.format(new Date()); // the formatter is created and cached here

    var _dtf;
    Jx.dtf = function () { 
        return _dtf || (_dtf = Windows.Globalization.DateTimeFormatting.DateTimeFormatter); 
    };
   
    var _formatters = {}; // date time formatters cache

    function dtFormatter(pattern) {
        Debug.assert(Jx.isNonEmptyString(pattern), "Jx.dtFormatter: invalid pattern");
        if (!(pattern in _formatters)) {
            var mark = "DTF:" + pattern;
            Jx._startTA(mark);
            var DTF = Jx.dtf();
            var formatter;
            if (pattern === "shortDate") {
                formatter = DTF.shortDate;
            } else if (pattern === "longDate") {
                formatter = DTF.longDate;
            } else if (pattern === "shortTime") {
                formatter = DTF.shortTime;
            } else {
                formatter = new DTF(pattern);
            }
            _formatters[pattern] = formatter;
            Jx._stopTA(mark);
        }
        return _formatters[pattern];
    }
    
    // new DateTimeFormatter(pattern)
    var DTFormatter = Jx.DTFormatter = function (pattern) {
        Debug.assert(Jx.isNonEmptyString(pattern), "Jx.DTFormatter: invalid pattern");
        this._pattern = pattern;
    };

    DTFormatter.prototype = {
        format: function (date) {
            Debug.assert(Jx.isDate(date), "Jx.DTFormatter.format: invalid date");
            return dtFormatter(this._pattern).format(date);
        }
    };
    
    Object.defineProperty(DTFormatter.prototype, "clock", {
        get: function() { return dtFormatter(this._pattern).clock; }
    });

    // expose _formatters in debug for UTs
    Debug.call(function () { 
        DTFormatter._getFormatters = function () { return _formatters; };
        DTFormatter._setFormatters = function (v) { _formatters = v; };
        DTFormatter._dtFormatters = dtFormatter;
    });

})();



// IE overrides
if (!Jx.isWWA) {

    Jx.unsafe = /*@dynamic*/function (func) {
        /// <summary>Wrapper for MSApp.execUnsafeLocalFunction in WWAHost.</summary>
        /// <param name="func" type="Function">Function to run.</param>
        /// <returns>Returns the return value of func.</returns>
        Debug.assert(Jx.isFunction(func));
        return func();
    };

    Jx.etw = function (evid) {         
        /// <summary>Write ETW event id.</summary>
        /// <param name="evid" type="String">The event id.</param>
        Debug.assert(Jx.isNonEmptyString(evid), "Jx.etw: Jx.isNonEmptyString(evid)");
        Jx.log.info("Jx.etw." + evid);
    };

    Jx.erRegisterFile = function (filePath) {
        /// <summary>register any file to upload when uploading via errorreponder. See Jx.fault. 
        /// This function can be called at any time before calling Jx.fault. 
        /// Default App logs are auto collected and do not need to be registered
        /// </summary>
        /// <param name="filePath" type="String">File path you would like registered for upload.</param>
        Debug.assert(Jx.isNonEmptyString(filePath), "Jx.erRegisterFile: Jx.isNonEmptyString(filePath)");

        Jx.log.info("Jx.erRegisterFile: " + filePath);
    };

    Jx.fault = function (faultBucketName, faultOriginIdentifier, /*@dynamic*/exceptionObject) {
        /// <summary>report a fault using errorreponder to upload logs.</summary>
        /// <param name="faultBucketName " type="String">This string is used to differentiate/bucketize faults. You can use the name of your control, feature, scenario name, class name or filename as the bucket name.</param>
        /// <param name="faultOriginIdentifier" type="String" >This helps differentiate faults within a fault bucket. Say if you are using foo.js as the faultbucket, you might use the function name to different origin points in foo.js</param>
        /// <param name="exceptionObject" optional="true">Exception to be reported.</param>

        Debug.assert(Jx.isNonEmptyString(faultBucketName), "Jx.fault: Jx.isNonEmptyString(faultBucketName)");
        Debug.assert(Jx.isNonEmptyString(faultOriginIdentifier), "Jx.fault: Jx.isNonEmptyString(faultOriginIdentifier)");

        var msg = "Jx.fault: " + " ( " + faultBucketName + " ) : ( " + faultOriginIdentifier + " )";

        var errorCode = -1;

        if (exceptionObject) {

            // For situations such as as shutdown path where log may be destroyed
            if (Jx.log) {
                // write the exception object to the log file
                Jx.log.exception(msg, exceptionObject);
            }

            // if the exception object has number capture the errocode with it.
            if (Jx.isNumber(exceptionObject.number)) {
                errorCode = exceptionObject.number;
            }
        } else {
            if (Jx.log) {
                Jx.log.error(msg);
            }
        }
    };

    Jx.ensurePromiseErrorHandling = function () {
        /// <summary>Setup WinJS promise.done error handling so that sufficient context (stack) is preserved
        /// for WER reporting. This is based on the guidance from WinJS team for Win8 time frame as a fix in WinJS is too late to be made for RTM.
        /// Refer WinLive 600585 for additional details. </summary>
        Jx.log.info("Jx.ensurePromiseErrorHandling");
    };
}



;//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Debug,Jx*/


Jx._delayDefineFns = [];


Jx.delayDefine = function(namespace, key, fn) {
    // <summary>
    // On first attempt to access any of the given properties (keys), the specified fn will be invoked. 
    // It is expected that this fn will load the required properties.
    // </summary>
    // <param name="namespace">The namespace in which the properties resides</param>
    // <param name="key">The name of the properties</param>
    // <param name="fn" type="Function">The function that define the properties</param>
    Debug.assert(Jx.isObject(namespace), "Jx.delayDefine: invalid namespace");
    Debug.assert(Jx.isFunction(fn), "Jx.delayDefine: invalid fn");

    if (Jx.isNonEmptyString(key)) {
        Object.defineProperty(namespace, key, {
            get: function() {
                
                // The debug console and the leak tracker set Debug.scanningTypes while walking the namespace hierarchy.
                // Prevent that from causing code to be delay-loaded: they aren't interested in code that isn't loaded yet.
                if (Debug.scanningTypes) { return; }
                

                // Check if the function is called multiple times.
                Debug.assert(Jx._delayDefineFns.indexOf(fn) < 0, "Jx.delayDefine function called multiple times");

                // Replace this property with an undefined value. We expect the value to be set when we call the function.
                Object.defineProperty(namespace, key, { value: undefined, writable: true });

                Jx.mark("Jx.delayDefine:" + key + ",StartTA,Jx");
                fn();
                Jx.mark("Jx.delayDefine:" + key + ",StopTA,Jx");

                
                // Remember functions that are already executed
                Jx._delayDefineFns.push(fn);
                

                Debug.assert(namespace[key] !== undefined, "Unable to delay define " + key);
                return namespace[key];
            },
            set: function(value) {
                // <summary> 
                // This setter will only be called if the function that provides this property is invoked directly
                // and writes this property before the delay loader is invoked. Normally, the
                // delay loader will have redefined this property as a writable value.
                // </summary>

                Object.defineProperty(namespace, key, { value: value, writable: true });
            },
            enumerable: true,
            configurable: true
        });
    } else if (Jx.isArray(key)) {
        for (var i = 0, len = key.length; i < len; i++) {
            Jx.delayDefine(namespace, key[i], fn);
        }
    } else {
        Debug.assert(false, "Jx.delayDefine: invalid key");
    }
};

Jx._delayGroups = {}; // hash of array of functions - keep track of groups and associated functions


Jx._delayGroupExecuted = []; // array of strings - keep track of already executed groups


Jx.delayGroup = function(group, fn) {
    Debug.assert(Jx.isNonEmptyString(group), "Jx.delayGroup: invalid group");
    Debug.assert(Jx.isFunction(fn), "Jx.delayGroup: invalid fn");
    
    Debug.assert(Jx._delayGroupExecuted.indexOf(group) < 0, "Jx.delayGroup: group already executed");

    // initialize group if needed
    var groups = Jx._delayGroups;
    var funcs = (groups[group] = groups[group] || []);

    Debug.assert(funcs.indexOf(fn) < 0, "Jx.delayGroup: duplicate function");

    // Add the function to the group
    funcs.push(fn);
};

Jx.delayGroupExec = function(group) {
    Debug.assert(Jx.isNonEmptyString(group), "Jx.delayGroupExec: invalid group");

    Debug.assert(Jx._delayGroupExecuted.indexOf(group) < 0, "Jx.delayGroupExec: group already executed");

    var groups = Jx._delayGroups;
    var funcs = groups[group];
    if (funcs) {
        // Exec all functions in this group
        Jx.mark("Jx.delayGroupExec:" + group + ",StartTA,Jx");
        for (var i = 0, len = funcs.length; i < len; i++) {
            funcs[i]();
        }
        Jx.mark("Jx.delayGroupExec:" + group + ",StopTA,Jx");

        // remove group
        groups[group] = null; 

        
        // remember that the group has been executed
        Jx._delayGroupExecuted.push(group);
        
    }
};

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Events object

/// <reference path="Log.js" />
/// <reference path="Jx.ref.js" />

/*global Debug,Jx*/

Jx.Events = {
    initEvents: function () {
        /// <summary>Optionally prepares an object to source events.</summary>

        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        this._jxev = this._jxev || {};
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>

        return this;
    },

    addListener: function (type, fn, /*@dynamic*/obj) {
        /// <summary>Add an event listener to this object.</summary>
        /// <param name="type" type="String">The event identifier.</param>
        /// <param name="fn" type="Function">The function callback.</param>
        /// <param name="obj" optional="true">The context in which to call the callback function.</param>
        /// <returns>Returns this object.</returns>

        Debug.assert(Debug.Events.isDefined(this, type));
        Debug.assert(Jx.isFunction(fn));
        Debug.assert(Jx.isUndefined(obj) || Jx.isObjectType(obj));

        // _jxev isn't defined since it dynamically added.
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        var ev = this._jxev = this._jxev || {};
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>

        ev[type] = ev[type] || { recursionCount: 0, isSweepNeeded: false, listeners: [] };
        ev[type].listeners.push({ fn: fn, obj: obj });
        return this;
    },

    removeListener: function (type, fn, /*@dynamic*/obj) {
        /// <summary>Remove an event listener from this object.</summary>
        /// <param name="type" type="String">The event identifier.</param>
        /// <param name="fn" type="Function">The function callback.</param>
        /// <param name="obj" optional="true">The context in which to call the callback function.</param>
        /// <returns>Returns this object.</returns>

        var listeners, /*@type(JxDirectEventListener)*/listener, i, /*@type(JxDirectEvent)*/evt;

        Debug.assert(Debug.Events.isDefined(this, type));
        Debug.assert(Jx.isFunction(fn));
        Debug.assert(Jx.isUndefined(obj) || Jx.isObjectType(obj));

        if (this._jxev) {
            evt = this._jxev[type];
            if (evt) {
                listeners = evt.listeners;
                for (i = listeners.length; i--; ) {
                    listener = listeners[i];
                    if (Boolean(listener) && listener.fn === fn && listener.obj === obj) {
                        if (evt.recursionCount !== 0) {
                            listeners[i] = null;
                            evt.isSweepNeeded = true;
                        } else {
                            listeners.splice(i, 1);
                        }
                        return this;
                    }
                }
            }
        }

        Debug.assert(false, "Listener not found");

        return this;
    },

    hasListener: function (type) {
        /// <param name="type" type="String">The event identifier.</param>
        /// <returns type="Boolean">Returns true if there are any listeners for this event identifier.</returns>
        Debug.assert(Debug.Events.isDefined(this, type));

        var jxev = this._jxev;
        if (jxev) {
            var evt = jxev[type];
            if (evt) {
                var listeners = evt.listeners;
                for (var i = 0, len = listeners.length; i < len; ++i) {
                    if (listeners[i]) {
                        return true;
                    }
                }
            }
        }

        return false;
    },

    disposeEvents: function () {
        /// <summary>Dispose events.</summary>
        if (this._jxev) {
            this._jxev = null;
        }
        Debug.Events.dispose(this); 
    },

    raiseEvent: function (type, /*@dynamic*/ev, results) {
        /// <summary>Fire an event on this object.</summary>
        /// <param name="type" type="String">The event identifier.</param>
        /// <param name="ev" optional="true">The event arguments.</param>
        /// <param name="results" type="Object" optional="true">optional output information</param>
        /// <returns>Returns this object.</returns>

        var logString = "Jx.Events.raiseEvent:" + type;
        Jx.mark(logString + ",StartTA,Jx,Events");

        results = results || {};
        results.listeners = 0;

        var listeners, listener, i, len, evt, jxev = this._jxev;

        Debug.assert(Debug.Events.isDefined(this, type));

        if (jxev) {
            evt = jxev[type];
            if (evt) {
                listeners = evt.listeners;
                ++evt.recursionCount;

                // Invoke all listeners
                for (i = 0, len = listeners.length; i < len; ++i) {
                    listener = listeners[i];
                    if (listener) {
                        listener.fn.call(listener.obj, ev);
                        results.listeners++;
                    }
                }

                if (--evt.recursionCount === 0 && evt.isSweepNeeded) {
                    // If this is the last call to fire on the stack and a sweep is needed
                    // (a listener was nulled out rather than removed) then cleanup the listeners.
                    for (i = listeners.length; i--; ) {
                        if (!listeners[i]) {
                            listeners.splice(i, 1);
                        }
                    }
                    evt.isSweepNeeded = false;
                }
            }
        }
        Jx.mark(logString + ",StopTA,Jx,Events");
        return this;
    }
};

Jx.initEvents = function (/*@dynamic*/target) {
    /// <summary>Optional, prepares an object to source events.</summary>
    /// <param name="target">The target object.</param>
    Debug.assert(Jx.isObject(target));
    return Jx.Events.initEvents.call(target);
};

Jx.addListener = function (/*@dynamic*/target, type, fn, /*@dynamic*/obj) {
    /// <summary>Add an event listener to the target object.</summary>
    /// <param name="target">The target object.</param>
    /// <param name="type" type="String">The event identifier.</param>
    /// <param name="fn" type="Function">The function callback.</param>
    /// <param name="obj" optional="true">The context in which to call the callback function.</param>
    /// <returns type="Object">Returns the target object.</returns>
    Debug.assert(Jx.isObject(target));
    return Jx.Events.addListener.call(target, type, fn, obj);
};

Jx.removeListener = function (/*@dynamic*/target, type, fn, /*@dynamic*/obj) {
    /// <summary>Remove an event listener from the target object.</summary>
    /// <param name="target">The target object.</param>
    /// <param name="type" type="String">The event identifier.</param>
    /// <param name="fn" type="Function">The function callback.</param>
    /// <param name="obj" optional="true">The context in which to call the callback function.</param>
    /// <returns type="Object">Returns the target object.</returns>
    Debug.assert(Jx.isObject(target));
    return Jx.Events.removeListener.call(target, type, fn, obj);
};

Jx.hasListener = function (/*@dynamic*/target, type) {
    /// <param name="target">The target object.</param>
    /// <param name="type" type="String">The event identifier.</param>
    /// <returns type="Boolean">Returns true if there are any listeners for this event identifier.</returns>
    Debug.assert(Jx.isObject(target));
    return Jx.Events.hasListener.call(target, type);
};

Jx.raiseEvent = function (/*@dynamic*/target, type, /*@dynamic*/ev) {
    /// <summary>Fire an event on this object.</summary>
    /// <param name="target">The target object.</param>
    /// <param name="type" type="String">The event identifier.</param>
    /// <param name="ev" optional="true">The event arguments.</param>
    /// <returns type="Object">Returns the target object.</returns>
    Debug.assert(Jx.isObject(target));
    return Jx.Events.raiseEvent.call(target, type, ev);
};

Jx.disposeEvents = function (/*@dynamic*/target) {
    /// <summary>Dispose events.</summary>
    /// <param name="target">The target object.</param>
    Debug.assert(Jx.isObject(target));
    return Jx.Events.disposeEvents.call(target);
};


Debug.Events = {
    define: /*@varargs*/function (/*@dynamic*/target /* ... */) {
        /// <summary>Define an event on the target object.</summary>
        /// <param name="target">The target object.</param>

        Debug.assert(Jx.isObject(target));

        // Store all event names passed as arguments
        var a = Array.prototype;
        target._jxevdbg = a.concat(target._jxevdbg || [], a.slice.call(arguments, 1));
    },

    isDefined: function (/*@dynamic*/target, type) {
        /// <summary>Check if an event is defined on the target object.</summary>
        /// <param name="target">The target object.</param>
        /// <param name="type" type="String">The event identifier.</param>
        /// <returns type="Boolean">Returns true if the event is defined.</returns>

        Debug.assert(Jx.isObject(target));
        Debug.assert(Jx.isNonEmptyString(type));

        return target._jxevdbg !== undefined && target._jxevdbg.indexOf(type) !== -1;
    },

    dispose: function (/*@dynamic*/target) {
        /// <summary>Dispose debug events info.</summary>
        /// <param name="target">The target object.</param>

        Debug.assert(Jx.isObject(target));

        if (target._jxevdbg) {
            target._jxevdbg = null;
        }
    }
};



;//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Log

/// <reference path="Windows.Foundation.js" />
/// <reference path="DebugConsole.js" />

/*global Jx,msWriteProfilerMark,Debug,Windows,NoShip*/

Jx.Log = /*@constructor*/ function () {
    /// <summary>Constructor</summary>
};

// The log levels are the same as the ETW levels
Jx.LOG_ALWAYS = 0;
Jx.LOG_CRITICAL = 1;
Jx.LOG_ERROR = 2;
Jx.LOG_WARNING = 3;
Jx.LOG_INFORMATIONAL = 4;
Jx.LOG_VERBOSE = 5;

Jx.Log.prototype = {
    // Log enabled/disabled
    enabled: true,
    
    piiEnabledInShip: false,

    // Log level
    level: Jx.LOG_INFORMATIONAL,

    //
    // window.msWriteProfilerMark ETW event info: 
    //
    // http://msdn.microsoft.com/en-us/library/dd433074(VS.85).aspx
    //
    // <provider guid="{9e3b3947-ca5d-4614-91a2-7b624e0e7244}" name="Microsoft-IE" />
    //
    // <event
    //   keywords="mshtml extended pagemark"
    //   opcode="win:Info"
    //   symbol="MSHTML_DOM_CUSTOMSITEEVENT_INFO"
    //   task="Mshtml_DOM_CustomSiteEvent"
    //   template="Mshtml_DOM_CustomSiteEvent_Info"
    //   value="150"
    // />
    //
    // <template tid="Mshtml_DOM_CustomSiteEvent_Info">
    //   <data inType="win:Pointer" name="CWindow"/>
    //   <data inType="win:Pointer" name="Markup"/>
    //   <data inType="win:UnicodeString" name="EventName"/>
    // </template>
    //
    // <keyword mask="0x00100000" name="pagemark" /> // mask decimal = 1048576
    //
    // WlxMon RemSettings.xml entry example:
    // <Provider Name="IE" GUID="{9E3B3947-CA5D-4614-91A2-7B624E0E7244}" Keywords="1048576" Level="5"/>
    //
    // Win7 IE manifest is here: 
    // \\kmcode\source\win7_gdr\inetcore\manifests\microsoft-windows-ie-htmlrendering.man
    //

    _writeMsg: function (msg) {
        /// <summary>Log message using window.msWriteProfilerMark.</summary>
        /// <param name="msg" type="String">Log message.</param>

        msWriteProfilerMark(msg);
    },

    write: function (level, msg) {
        /// <summary>Log a message with the given level.</summary>
        /// <param name="level" type="Number">Log level.</param>
        /// <param name="msg" type="String">Log message.</param>

        if (this.enabled && level <= this.level) {    
            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            if (Debug.console) {
                Debug.console.log(level, msg);
            }
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
            this._writeMsg(msg);
        }
    },

    always: function (msg) {
        /// <summary>Log a message with the "always" level.</summary>
        /// <param name="msg" type="String">Log message.</param>

        this.write(Jx.LOG_ALWAYS, msg);
    },

    critical: function (msg) {
        /// <summary>Log a message with the "critical" level.</summary>
        /// <param name="msg" type="String">Log message.</param>

        this.write(Jx.LOG_CRITICAL, msg);
    },

    error: function (msg) {
        /// <summary>Log a message with the "error" level.</summary>
        /// <param name="msg" type="String">Log message.</param>

        this.write(Jx.LOG_ERROR, msg);
    },

    warning: function (msg) {
        /// <summary>Log a message with the "warning" level.</summary>
        /// <param name="msg" type="String">Log message.</param>

        this.write(Jx.LOG_WARNING, msg);
    },

    info: function (msg) {
        /// <summary>Log a message with the "info" level.</summary>
        /// <param name="msg" type="String">Log message.</param>

        this.write(Jx.LOG_INFORMATIONAL, msg);
    },

    verbose: function (msg) {
        /// <summary>Log a message with the "verbose" level.</summary>
        /// <param name="msg" type="String">Log message.</param>

        this.write(Jx.LOG_VERBOSE, msg);
    },

    perf: function (ev, params) {
        /// <summary>Write an ETW perf event.</summary>
        /// <param name="ev" type="String">ETW event name.</param>
        /// <param name="params" type="Object" optional="true">An optional map of event parameter values</param>

        this.info(ev + (params ? (" " + JSON.stringify(params)) : ""));
    },

    exception: function (msg, /*@dynamic*/ex) {
        ///<summary>Log exceptions in a diagnosable way</summary>
        ///<param name="msg" type="String">An error message like "Failed saving contact"</param>
        ///<param name="ex">The exception</param>

        this.write(Jx.LOG_ERROR,
            msg + "\n" +
            (ex.stack || ex.description || ex.message || ex.toString()) + "\n" +
            "Error Code: " + ex.number
        );
    },

    pii: function (msg) {
        /// <summary>Log a message with PII information.</summary>
        /// <param name="msg" type="String">Log message.</param>
        if (this.piiEnabledInShip) {
            this.info(msg);
        } else {
            NoShip.log(msg);
        }
    }
};

// Create the default log. Apps can overide it in the Application object.
Jx.log = new Jx.Log();


//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Debug.js" />

/*jshint browser:true*/
/*global Debug,Jx,Windows*/

Jx.delayDefine(Jx, ["Res", "res"], function () {

    Jx.Res = /*@constructor*/function () {
        this._formatFns = {};
        this._initResourceLoader();
    };

    Jx.Res.prototype = {
        _resourceLoader: null,

        _initResourceLoader: function () {
            // don't create the resource loader in iframe (the feedback flyout does this)
            if (Jx.isWWA) {
                var RL = Windows.ApplicationModel.Resources.ResourceLoader;
                this._resourceLoader = Jx.isWorker ? RL.getForViewIndependentUse() : RL.getForCurrentView();
            }
        },

        _replaceRemainingEscapes: function (match) {
            /// <summary>
            /// Internal function used by replaceOtherEscapes
            /// Replaces %n %r %t with space (FormatMessage does /n /r /t, but this should work for HTML). Otherwise, replaces % followed by any character with that character.
            /// </summary>

            Debug.assert(match.length === 2, "Unexpected match length");
            Debug.assert(match[0] === "%", "Unexpected match contents");

            var escapedCharacter = match.substring(1);

            if (escapedCharacter === "n" || escapedCharacter === "r" || escapedCharacter === "t") {
                return " ";
            } else {
                return escapedCharacter;
            }
        },
    
        replaceOtherEscapes: function (inputString) {
            /// <summary>
            /// Used by getFormatFunction and People string-replacement code to replace % placeholders other than %1 %2 %3.
            /// Replaces %n %r %t with space (FormatMessage does /n /r /t, but this should work for HTML). Otherwise, replaces % followed by any character with that character (most useful for %%)
            /// </summary>
            /// <param name="inputString">Input string on which to perform un-escape of %</param>

            return inputString.replace(/%./g, this._replaceRemainingEscapes);
        },

        getFormatFunction: function (resourceId, ignoreFirstParam) {
            /// <summary>
            /// Load a resource string, parse the %# placeholders, and return a
            /// function that accepts values for those placeholders.
            /// </summary>
            /// <param name="resourceId" type="String">The resource id for the resource string</param>
            /// <param name="ignoreFirstParam" type="Boolean" optional="true">Whether the resulting function should ignore the first parameter</param>
            /// <returns type="Function">A function accepting values to replace %# placeholders.</returns>

            // This function is publicly used by calendar
            // It is more efficient than using loadCompoundString because it avoids the overhead of function.apply(arguments)

            var str = this.getString(resourceId),
                offset = ignoreFirstParam ? 0 : 1;

            function replaceFormat (match, index) {
                /// <summary>Internal function used by getFormatFunction to help build a function string that will do the actual replacement</summary>

                var numberOfSpecialCharacter = match.lastIndexOf("%") + 1;
                var formattedString = "";
                // Only perform the replacement if we saw an odd number of %, otherwise we only saw a series of %% followed by a number.
                var performReplacement = ((numberOfSpecialCharacter % 2) === 1);

                if (performReplacement) {
                    // Include any extra % picked up by the regex
                    var numberOfDouble = Math.floor(numberOfSpecialCharacter / 2);
                    for (var i = 0; i < numberOfDouble ; i++) {
                        formattedString += "%%";
                    }

                    /// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
                    formattedString += "' + arguments[" + (index - offset) + "] + '";
                    /// <enable>JS3057.AvoidImplicitTypeCoercion</enable>
                } else {
                    // We're not doing any replacements, just return the string.
                    formattedString = match;
                }

                return formattedString;
            }

            // Escape the string, 
            // Then replace the %# placeholders,
            // Then replace other %
            var body = str.replace(/\\/g, "\\\\")
                          .replace(/'/g, "\\'")
                          .replace(/\n/g, "\\n")
                          .replace(/\r/g, "\\r")
                          .replace(/%+([0-9]{1,2})/g, replaceFormat);
            body = this.replaceOtherEscapes(body);

            /*jshint evil:true*/
            return new Function("return '" + body + "'");
        },

        loadCompoundString: /*@varargs*/function (resourceId) {
            /// <summary>
            /// Load a resource string and replace the %# with the values passed in
            /// (this function accepts variable number of parameters, param2-n are the replacement values)
            /// </summary>
            /// <param name="resourceId" type="String">the resource id for the resource string</param>
            /// <returns type="String">The formatted string.</returns>

            var fn = this._formatFns[resourceId];

            if (!fn) {
                fn = this._formatFns[resourceId] = this.getFormatFunction(resourceId, true);
            }

            return fn.apply(null, arguments);
        },

        /*
        The below is WinJS code from Res.js
        */

        _parseSimple: function (str) {
            /// <param name="str" type="String" />
            var objs = [];
            var chunks = str.split(";");

            for (var i = 0, l = chunks.length; i < l; i++) {
                var /*@type(String)*/chunk = chunks[i];

                if (chunk.trim() !== "") {
                    var index = chunk.indexOf(":");

                    Debug.assert(index !== -1, this._getError("InvalidMarkup"));

                    var prop = chunk.substring(0, index);
                    var ref = chunk.substring(index + 1);

                    objs.push({ destination: prop.trim(), source: ref.trim() });
                }
            }
            return objs;
        },

        _getError: /*@varargs*/function (id) {
            /// <param name="id" type="String" />

            /// Interim Hard coded error message until Corsica add itself to the framework where resources.pri exist
            /// <disable>JS2076.CamelCasing</disable>
            var hardCodedErrors = {
                InvalidMarkup: "Invalid markup",
                FailToFindItem: "Fail to find item:{0}",
                UndefinedProperty: "Undefined property name:{0}",
                InvalidValueForProperty: "Invalid value:[{0}] for given property:[{1}]",
                TooDeepLoop: "Nested loop more than {0} is not supported"
            };
            /// <enable>JS2076.CamelCasing</enable>

            var /*@type(String)*/message = hardCodedErrors[id];

            if (message !== undefined) {
                for (var i = 1, l = arguments.length; i < l; i++) {
                    message = message.replace("{" + String(i - 1) + "}", arguments[i]);
                }
            } else {
                message = "unknown error";
            }

            return message;
        },

        _setMember: function (props, root, value) {
            /// <param name="props" type="String" />
            /// <param name="root" type="HTMLElement" />
            /// <param name="value" type="String" />

            var parts = props.split(".");

            var ob = root;
            var prop = parts[0];
            for (var i = 1, len = parts.length; i < len; i++) {

                Debug.assert(ob[parts[i - 1]] !== undefined, this._getError("UndefinedProperty", props));

                ob = ob[parts[i - 1]];
                prop = parts[i];
            }

            /// WLX Change: Use setAttribute() if the attribute doesn't exist as a property of HTMLElement.
            if (prop in HTMLElement.prototype) {
                ob[prop] = value;
            } else {
                ob.setAttribute(prop, value);
            }
        },

        _parse: function (syntax) {
            /// TODO: _parseSimple needs to be updated to better parser that might use Lexer
            var decls = this._parseSimple(syntax);

            /// Exception rule: It fill the array with valid ones even if there is an error in one of markups
            /// if all markup are invalid, decls is empty,whic is acceptable
            return decls;
        },

        getString: function (key) {
            /// <summary>
            /// Search resources through MRT resources
            /// </summary>
            /// <param name="key">
            /// Requested resource id for searching
            /// </param>
            /// <returns type="String">The localized string.</returns>
        
            Debug.assert(Jx.isNonEmptyString(key));
            return this._resourceLoader.getString(key);
        },

        addResourcePath: function () {},

        addIncludePath: function () {},

        _process: function (elements) {
            /// <summary>
            /// Process resources tag that reads its syntax and replace strings
            /// with localized strings
            /// </summary>
            /// <param name="elements" type="Array">
            /// Element to process.
            /// </param>

            for (var i = 0, len = elements.length; i < len; i++) {
                var /*@type(HTMLElement)*/e = elements[i];

                var decls = this._parse(e.getAttribute('data-win-res'));

                for (var k = 0, l = decls.length; k < l; k++) {

                    var resString;

                    resString = this.getString(decls[k].source);

                    if (resString !== undefined) {
                        Debug.assert(decls[k].destination !== "innerHTML", "Localized strings should not contain HTML. To set an element's text, use innerText instead.");
                        this._setMember(decls[k].destination, e, resString);
                    }
                }
            }
        },

        processAll: function (rootElement) {
            /// <summary>
            /// Process resources tag that reads its syntax and replace strings
            /// with localized strings
            /// </summary>
            /// <param name="rootElement" type="HTMLElement" optional="true">
            /// Element to start searching at, if not specified, the entire document is searched.
            /// </param>

            Jx.mark("Jx.Res.processAll,StartTA,Jx,Res");

            rootElement = rootElement || document.body;

    
            var count = 0;
            if (arguments.length > 1) {
                count = arguments[1];
            }

            Debug.assert(count < 4, this._getError("TooDeepLoop", 3));
    

            if (rootElement.getAttribute('data-win-res')) {
                // querySelectorAll returns a NodeList (which is read-only and does not include the 
                // rootElement) so we process the root element seperately.
                this._process([rootElement]);
            }

            var elements = rootElement.querySelectorAll('[data-win-res]');
            this._process(elements);

            Jx.mark("Jx.Res.processAll,StopTA,Jx,Res");
        },
    
    };



// IE overrides
if (!Jx.isWWA) {

    Jx.Res.prototype._initResourceLoader = function () {
        this._resourceLoader = /*@static_cast(Windows.ApplicationModel.Resources.IResourceLoader)*/new Jx.Loc();
    };

    Jx.Res.prototype.getString = function (key) {
        /// <summary>
        /// Makes sure that Jx.res users do not forget to qualify their ids with resource-file names.
        /// It does this by prepending "resources/" to any unqualified ids, since "resources.resx" is the only file that
        /// can be used by Jx.res to serve up unqualified-id strings.
        /// </summary>
        /// <param name="key" type="String">
        /// Requested resource id for searching
        /// </param>
        /// <returns Type="String">The localized string.</returns>

        if (key) {
            if (key.indexOf("/") === -1) {
                key = "resources/" + key;
            } else if (key[0] === "/") {
                key = key.slice(1);
            }
        }

        var string = this._resourceLoader.getString(key);
        if (!string) {
            // We assert here if string was empty, since the WinRT res call will throw in this case.
            Debug.assert(false, "The given item name is not found. (" + key + ")");
        }

        return string;
    };

    Jx.Res.prototype.addResourcePath = function (filepath) {
        /// <summary>
        /// Add a resource collection to the Loc shim, for use when running under IE only.
        /// </summary>
        /// <param name="filepath" type="String"> The RESX filepath to add</param>

        var loc = /*@static_cast(Jx.Loc)*/this._resourceLoader;
        loc.addResourcePath(filepath);
        loc.initResources();
    };

    Jx.Res.prototype.addIncludePath = function (folderpath, /*@optional*/ extension) {
        /// <summary>
        /// Add a resource folder to the Loc shim, for use when running under IE only.
        /// </summary>
        /// <param name="folderpath" type="String">The resource folderpath to add</param>
        /// <param name="extension" type="String">The extension to use when looking for resource files, for example "resx" or "resw"</param>

        var loc = /*@static_cast(Jx.Loc)*/this._resourceLoader;
        loc.addIncludePath(folderpath, extension);
    };
}



    if (Jx.isWWA) {
        Jx.res = new Jx.Res();
    }
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Log.js" />

/*global Debug,Jx,Windows,NoShip*/

Jx.delayDefine(Jx, ["AppData", "appData"], function () {

    // function _info(s) { Jx.mark("Jx.AppData." + s + ",Info,Jx"); }
    function _start(s) { Jx.mark("Jx.AppData." + s + ",StartTA,Jx"); }
    function _stop(s) { Jx.mark("Jx.AppData." + s + ",StopTA,Jx"); }

    function _ensureAppDataCurrent(that) {
        if (!that._ad) {
            _start("current");
            that._ad = Windows.Storage.ApplicationData.current;
            _stop("current");
        }
    }
    
    Jx.AppData = /*@constructor*/function () {
        Debug.assert(this instanceof Jx.AppData, "Use new to create an object");
        this._rs = null;
        this._ls = null;
        this._ad = null;
    };

    Jx.AppData.prototype = {
        dispose: function () {
            /// <summary>Dispose the object.</summary>
            /// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
            this._ad = this._ls = this._rs = null;
        },

        localSettings: function () {
            /// <summary>Get the local settings container.</summary>
            /// <returns type="Jx.AppDataContainer">Returns the local settings container.</returns>

            _ensureAppDataCurrent(this);

            if (!this._ls) {
                _start("localSettings");
                this._ls = new Jx.AppDataContainer(this._ad.localSettings); 
                _stop("localSettings");
            }
            
            return this._ls; 
        },

        roamingSettings: function () {
            /// <summary>Get the roaming settings container.</summary>
            /// <returns type="Jx.AppDataContainer">Returns the roaming settings container.</returns>

            _ensureAppDataCurrent(this);

            if (!this._rs) {
                _start("roamingSettings");
                this._rs = new Jx.AppDataContainer(this._ad.roamingSettings); 
                _stop("roamingSettings");
            }

            return this._rs; 
        },
    };

    //
    // AppDataContainer object
    //

    Jx.AppDataContainer = /*@constructor*/function (adc) {
        /// <summary>Jx.AppDataContainer constructor.</summary>
        /// <param name="adc" type="Windows.Storage.ApplicationDataContainer">The WWA application data container.</param>
        /// <returns type="Jx.AppDataContainer">Returns the new object.</returns>
        Debug.assert(this instanceof Jx.AppDataContainer, "Use new to create an object");
        Debug.assert(Jx.isObject(adc), "Invalid container object");
        Debug.assert(Jx.isInstanceOf(adc, Windows.Storage.ApplicationDataContainer), "Invalid container type");
        this._adc = adc;
        this._values = /*@static_cast(Windows.Foundation.Collections.IObservableMap)*/adc.values;
    };

    Jx.AppDataContainer.prototype = {
        _settingSize: 4095,

        dispose: function () {
            /// <summary>Dispose the object.</summary>
            this._adc = null;
            this._values = null;
        },

        name: function () {
            /// <summary>Get the container's name.</summary>
            /// <returns type="String">Returns the container's name.</returns>
            return this._adc.name;
        },

        isLocal: function () {
            /// <summary>Returns true if it's a local container.</summary>
            /// <returns type="Boolean">Returns true if it's a local container.</returns>
            // TODO: WinLive 423634 Remove this static_cast once JSGen.exe is fixed.
            return this._adc.locality === /*@static_cast(Number)*/Windows.Storage.ApplicationDataLocality.local;
        },

        isRoaming: function () {
            /// <summary>Returns true if it's a roaming container.</summary>
            /// <returns type="Boolean">Returns true if it's a roaming container.</returns>
            // TODO: WinLive 423634 Remove this static_cast once JSGen.exe is fixed.
            return this._adc.locality === /*@static_cast(Number)*/Windows.Storage.ApplicationDataLocality.roaming;
        },

        _getContainer: function (containerName) {
            /// <returns type="Windows.Storage.ApplicationDataContainer" />
            return this._adc.containers[containerName];
        },

        getContainer: function (containerName) {
            /// <summary>Returns an existing container.</summary>
            /// <param name="containerName" type="String">The container's name.</param>
            /// <returns type="Jx.AppDataContainer">Returns the container.</returns>

            Debug.assert(Jx.isNonEmptyString(containerName), "Invalid container name");
            var c = this._getContainer(containerName);
            if (c) {
                return new Jx.AppDataContainer(c);
            }
            return null;
        },

        createContainer: function (containerName) {
            /// <summary>Creates a new container.</summary>
            /// <param name="containerName" type="String">The container's name.</param>
            /// <returns type="Jx.AppDataContainer">Returns the new container.</returns>

            Debug.assert(Jx.isNonEmptyString(containerName), "Invalid container name");
            Jx.log.info("Jx.AppDataContainer.createContainer");
            NoShip.log("container name: " + containerName);
            return new Jx.AppDataContainer(this._adc.createContainer(containerName, Windows.Storage.ApplicationDataCreateDisposition.always));
        },

        container: function (containerName) {
            /// <summary>If the container exists then it returns it, otherwise it creates a new one.</summary>
            /// <param name="containerName" type="String">The container's name.</param>
            /// <returns type="Jx.AppDataContainer">Returns the container.</returns>
            return this.getContainer(containerName) || this.createContainer(containerName);
        },

        deleteContainer: function (containerName) {
            /// <summary>Deletes a container.</summary>
            /// <param name="containerName" type="String">The container's name.</param>
            Debug.assert(Jx.isNonEmptyString(containerName), "Invalid container name");
            Jx.log.info("Jx.AppDataContainer.deleteContainer");
            NoShip.log("container name" + containerName);
            this._adc.deleteContainer(containerName);
        },

        get: /*@dynamic*/function (valueName) {
            /// <summary>Returns a value from the container.</summary>
            /// <param name="valueName" type="String">The value's name.</param>
            /// <returns>Returns the value.</returns>
            Debug.assert(Jx.isNonEmptyString(valueName), "Invalid value name");
            // $TODO assert if name is a built-in property
            return this._values.lookup(valueName);
        },

        set: function (valueName, /*@dynamic*/value) {
            /// <summary>Inserts a value in the container.</summary>
            /// <param name="valueName" type="String">The value's name.</param>
            /// <param name="value">The value.</param>
            /// <returns>Returns true if it succeeded.</returns>
            Debug.assert(Jx.isNonEmptyString(valueName), "Invalid value name");
            Jx.log.info("Jx.AppDataContainer.set");
            NoShip.log("name:" + valueName + " value:" + value);
            // $TODO assert if name is a built-in property
            // $TODO investigate when insert() returns false? Also investigate if it throws.

            return this._values.insert(valueName, value);
        },

        remove: function (valueName) {
            /// <summary>Removes the value identified by valueName.</summary>
            /// <param name="valueName" type="String">The subject value's name.</param>
            /// <returns>Returns true if it succeeded.</returns>
            Debug.assert(Jx.isNonEmptyString(valueName), "Invalid value name");
            Jx.log.info("Jx.AppDataContainer.remove");
            NoShip.log("name:" + valueName);
            // $TODO assert if name is a built-in property
            return this._values.remove(valueName);
        },

        setObject: function (objectName, obj) {
            /// <summary>Inserts an object in the container.</summary>
            /// <param name="objectName" type="String">The object's name.</param>
            /// <param name="obj" type="Object">The object.</param>
            /// <returns>Returns true if it succeeded.</returns>
            Debug.assert(Jx.isNonEmptyString(objectName), "Invalid object name");
            Debug.assert(Jx.isObject(obj), "Invalid object");
            // Calling JSON.stringify makes sure that the object doesn't have circular reference.
            var serialized = JSON.stringify(obj);
            Debug.assert(serialized);
            Jx.log.info("Jx.AppDataContainer.setObject");
            NoShip.log("name:" + objectName + " obj:" + serialized);

            // Make sure to delete the existing container if any.
            this.deleteContainer(objectName);
 
            var objCtn = this.createContainer(objectName);
            function setObjProp(object, container) {
                var ret = true;
                for (var i in object) {
                    var v = object[i];
                    // object property value of null or undefined will be ignored 
                    if (!Jx.isNullOrUndefined(v)) {
                        if (Jx.isObject(v)) {
                            var nc = container.createContainer(i);
                            ret = setObjProp(v, nc);
                        } else if (Jx.isValidNumber(v) || Jx.isString(v) || Jx.isBoolean(v)){
                            ret = container.set(i, v);
                        } else {
                            Debug.assert(false, "Jx.AppDataContainer.setObject: invalid value type " + (typeof v));
                            ret = false;
                        }
                        if (!ret) {
                            break;
                        }
                    }
                }
                return ret;
            }
            if (!setObjProp(obj, objCtn)) {
                this.deleteContainer(objCtn.name());
                return false;
            }
            return true;
        },

        getObject: function (objectName) {
            /// <summary>Returns an object in the container.</summary>
            /// <param name="objectName" type="String">The object's name.</param>
            /// <returns>Returns the object.</returns>
            Debug.assert(Jx.isNonEmptyString(objectName), "Invalid object name");
            var objCtn = this.getContainer(objectName);
            if (!objCtn) {
                return null;
            }
            var obj = {};
            function getObjProps(object, values) {
                /// <param name="values" type="Windows.Foundation.Collections.IMapView" />
                Debug.assert(values);
                if (values.size > 0) {
                    for (var iterator = values.first(); iterator.hasCurrent; iterator.moveNext()) {
                        var current = /*@static_cast(Windows.Foundation.Collections.IKeyValuePair)*/iterator.current;
                        object[current.key] = current.value;
                    }
                }
            }
            function getObjNestedProps(object, nested) {
                /// <param name="nested" type="Windows.Foundation.Collections.IMapView" />
                Debug.assert(nested);
                if (nested.size > 0) {
                    for (var iterator = nested.first(); iterator.hasCurrent; iterator.moveNext()) {
                        var current = /*@static_cast(Windows.Foundation.Collections.IKeyValuePair)*/iterator.current;
                        var nestedObj = object[current.key] = {};
                        getObjPropFromWinCtn(nestedObj, /*@static_cast(Windows.Storage.ApplicationDataContainer)*/current.value);
                    }
                }
            }
            function getObjPropFromWinCtn(object, container) {
                /// <param name="container" type="Windows.Storage.ApplicationDataContainer" />
                Debug.assert(container instanceof Windows.Storage.ApplicationDataContainer);
                getObjProps(object, /*@static_cast(Windows.Foundation.Collections.IMapView)*/container.values);
                getObjNestedProps(object, container.containers);
            }

            function getObjPropFromJxCtn(object, container) {
                /// <param name="container" type="Jx.AppDataContainer" />
                Debug.assert(container instanceof Jx.AppDataContainer);
                getObjProps(object, /*@static_cast(Windows.Foundation.Collections.IMapView)*/container._values);
                getObjNestedProps(object, container._adc.containers);
            }

            getObjPropFromJxCtn(obj, objCtn);
            return obj;
        },

        getValues: function () {
            return this._adc.values;
        },

        _getSegmentContainerName: function (valueName) {
            /// <summary>Gets the nested container name used for setting value of large size.</summary>
            /// <param name="valueName" type="String">The value's name.</param>
            /// <returns>Returns the nested container name.</returns>
            return valueName + "_segment";
        },

        _setLongString: function (valueName, value, unit) {
            /// <summary>Inserts a long string value in the container. 
            ///  It breaks the long string into segments and saves the segments as settings in a nested container.</summary>
            /// <param name="valueName" type="String">The value's name.</param>
            /// <param name="value" type="String">The value.</param>
            /// <param name="unit" type="Number" optional="true">The unit size per setting.</param>
            /// <returns>Returns true if it succeeded.</returns>
            Debug.assert(Jx.isNonEmptyString(valueName), "Invalid value name");
            Debug.assert(Jx.isString(value), "Invalid value type");
            Jx.log.info("Jx.AppDataContainer._setLongString");
            NoShip.log("name:" + valueName + " value:" + value);
            // Make sure to delete the previous value. 
            this.remove(valueName);
            var cn = this._getSegmentContainerName(valueName);
            this.deleteContainer(cn);
            var ret = true;
            if (!unit) {
                unit = this._settingSize;
            }
            var valueLength = value.length;
            if (valueLength > unit) {
                var nested = this.createContainer(cn);
                var i = 0;
                for (i; valueLength > 0 && ret; valueLength -= unit, i++) {
                    var part = value.substr(i * unit, unit);
                    // Save the segment in the nested container using index as the name.
                    ret = nested._values.insert(String(i), /*@static_cast(Object)*/part);
                }
                if (ret) {
                    // Save the number of segments in nested container using "-1" as the name.
                    ret = nested._values.insert("-1", /*@static_cast(Object)*/i);
                }
                if (!ret) {
                    this.deleteContainer(cn);
                }
            } else {
                ret = this._values.insert(valueName, value);
            }
            return ret;
        },

        _getLongString: function (valueName) {
            /// <summary>Returns a value from the container.</summary>
            /// <param name="valueName" type="String">The value's name.</param>
            /// <returns type="String">Returns the string value.</returns>
            Debug.assert(Jx.isNonEmptyString(valueName), "Invalid value name");
            // $TODO assert if name is a built-in property
            // First try to find the value just by looking up the name. If not found try the segments. 
            var value = /*@static_cast(String)*/this._values.lookup(valueName);
            if (!value) {
                var cn = this._getSegmentContainerName(valueName);
                var nested = this.getContainer(cn);
                if (!nested) {
                    return "";
                }
                var parts = /*@static_cast(Number)*/nested.get("-1");
                Debug.assert(Boolean(parts) && Jx.isNumber(parts));
                value = "";
                for (var i = 0; i < parts; i++) {
                    value += nested.get(String(i));
                }
            }
            return value;
        },

        setObjectInSegments: function (objectName, /*@dynamic*/obj) {
            /// <summary>Inserts an object in the container. The object is serialized and saved into multiple settings in 4k segments.</summary>
            /// <param name="objectName" type="String">The object's name.</param>
            /// <param name="obj">The object.</param>
            /// <returns>Returns true if it succeeded.</returns>
            Debug.assert(Jx.isNonEmptyString(objectName), "Invalid object name");
            Debug.assert(Jx.isObject(obj), "Invalid object");
            Jx.log.info("Jx.AppDataContainer.setObjectInSegments");
            NoShip.log("name:" + objectName + " obj:" + JSON.stringify(obj));
            return this._setLongString(objectName, JSON.stringify(obj));
        },

        getObjectInSegments: /*@dynamic*/function (objectName) {
            /// <summary>Returns an object in the container. Must be used in pair with setObjectInSegments.</summary>
            /// <param name="objectName" type="String">The object's name.</param>
            /// <returns>Returns the object.</returns>
            Debug.assert(Jx.isNonEmptyString(objectName), "Invalid object name");
            var value = this._getLongString(objectName);
            if (Jx.isNonEmptyString(value)) {
                try {
                    return JSON.parse(value);
                } catch (err) {
                    Jx.log.exception("Jx.AppDataContainer.getObjectInSegments: JSON failed to parse data", err);
                    Jx.log.pii("Failing data: " + value);
                    return null; 
                }
            } else {
                return null;
            }
        }

    };

    Jx.appData = /*@static_cast(Jx.AppData)*/null;
});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="%_NTTREE%\drop\published\ModernContactPlatform\Microsoft.WindowsLive.Platform.js" />

Jx._platformNamespace = null;

Jx.forceSync = function (platform, scenario) {
    /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client" />
    Jx.sync(platform, true /*force*/, scenario);
};

Jx.startupSync = function (platform, scenario) {
    /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client" />
    Jx.sync(platform, false /*force*/, scenario);
};

Jx.sync = function (platform, force, scenario) {
    /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client" />
    /// <param name="force" type="Boolean" />
    /// <param name="scenario" type="Microsoft.WindowsLive.Platform.ApplicationScenario" />
    Jx.mark("Jx.forceSync,StartTA,Jx");
    Jx.log.info("Jx.forceSync.start");

    var plat = Jx._platformNamespace || Microsoft.WindowsLive.Platform;
    ///<disable>JS3092.DeclarePropertiesBeforeUse</disable>
    Debug.assert(Jx.isInstanceOf(platform, plat.Client));
    Debug.assert(Jx.isBoolean(force));
    var accounts = platform.accountManager.getConnectedAccountsByScenario(scenario, plat.ConnectedFilter.normal, plat.AccountSort.name);

    for (var i = 0, max = accounts.count; i < max; i++) {
        var account = /*@static_cast(Microsoft.WindowsLive.Platform.IAccount)*/ accounts.item(i);
        if (Boolean(force) || (Number(account.syncType) !== plat.SyncType.manual) ) {
            Jx.forceSyncAccount(account, scenario);
        }
    }
    ///<enable>JS3092.DeclarePropertiesBeforeUse</enable>
    accounts.dispose();
    Jx.mark("Jx.forceSync,StopTA,Jx");
};

Jx.forceSyncAccount = function (account, scenario) {
    /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount" />
    /// <param name="scenario" type="Microsoft.WindowsLive.Platform.ApplicationScenario" />
    Jx.mark("Jx.forceSyncAccount,StartTA,Jx");

    var plat = Jx._platformNamespace || Microsoft.WindowsLive.Platform;
    ///<disable>JS3092.DeclarePropertiesBeforeUse</disable>
    Debug.assert(Jx.isInstanceOf(account, plat.Account));
    Jx.mark("Jx.forceSyncAccount - accountId:" + account.objectId + " scenario:" + /*@static_cast(String)*/ scenario + ",Info,Jx");
    var resourceType = plat.ResourceType;
    var applicationScenario = plat.ApplicationScenario;
    var accountResourceType;

    switch (scenario)
    {
    case applicationScenario.mail:
        accountResourceType = resourceType.mail;
        break;
    case applicationScenario.calendar:
        accountResourceType = resourceType.calendar;
        break;
    case applicationScenario.people:
        accountResourceType = resourceType.contacts;
        break;
    default:
        Debug.assert(false);
        break;
    }
    ///<enable>JS3092.DeclarePropertiesBeforeUse</enable>

    var resource = account.getResourceByType(accountResourceType);
    if (Boolean(resource) && resource.canEdit) {
        resource.isSyncNeeded = true;
        try {
            resource.commit();
            account.commit();
        } catch (ex) {
            Jx.log.warning("Unable to force sync account.");
            Jx.log.warning("Name: " + ex.name);
            Jx.log.warning("Message: " + ex.message);
        }
    }
    Jx.mark("Jx.forceSyncAccount,StopTA,Jx");
};
