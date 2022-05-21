
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
            // debugger;

            console.error(msg);
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

/// <reference path="Debug.js" />
/// <reference path="dom.ref.js" />

(function () {
    /*globals document window HTMLElement DocumentFragment Event Debug*/

    var _fragmentRE = /^\s*<(\w+)[^>]*>/,
        _idSelectorRE = /^#([\w\-]+)$/,
        _msPrefixRE = /^-ms-/,
        _dashAlphaRE = /-([a-z]|[0-9])/ig,
        _readyRE = /complete|loaded/,
        _emptyArray = [],
        _document = document,
        _window = window,
        _forEach = _emptyArray.forEach,
        _div = _document.createElement("div"),
        _undef;

    function _isDef(/*@dynamic*/v) {
        return v !== _undef;
    }

    function _isUndef(/*@dynamic*/v) {
        return v === _undef;
    }

    function _isString(/*@dynamic*/v) {
        return typeof v === "string";
    }

    function _isObject(/*@dynamic*/v) {
        /// <summary>Check if the given argument is an object type.</summary>
        /// <param name="v">Argument to check.</param>
        /// <returns type="Boolean">Returns true if it's an object type.</returns>
        return v instanceof Object;
    }

    function _isNonEmptyString(/*@dynamic*/v) {
        return typeof v === "string" && !!v;
    }

    function _isFunction(/*@dynamic*/v) {
        /// <summary>Determine if the argument passed is a Javascript function object.</summary>
        /// <param name="v">Object to test whether or not it is a function.</param>
        /// <returns type="Boolean">Returns a Boolean indicating whether the object is a JavaScript function.</returns>
        return typeof v === "function";
    }

    function _isHTMLElement(/*@dynamic*/v) {
        return v instanceof HTMLElement;
    }

    function _isArrayLike(/*@dynamic*/v) { 
        return typeof v.length === "number"; 
    }

    function _copyArrayLike(/*@dynamic*/dest, /*@dynamic*/src) {
        var i = 0, j = 0, len = src.length, destlen = dest.length, s;

        for (; i < len; i++) {
            s = src[i];
            // skip null and undefined using != (only one equal) to null - see ut TestQxCore.testIsNullOrUndefined
            /*jshint eqnull:true */
            /// <disable>JS2031.UseStrictEqualityOperators</disable>
            if (s != null) {
                dest[j++] = s;
            }
        }

        dest.length = j;

        // cleanup old items
        while (j < destlen) {
            dest[j++] = _undef;
        }
        
        return dest;
    }

    function _classRE(/*@type(String)*/cls) {
        return new RegExp("(^|\\s)" + cls + "(\\s|$)");
    }

    function _hasClass(/*@type(HTMLElement)*/e, /*@type(String)*/cls) {
        return _classRE(cls).test(e.className);
    }

    function _addClass(/*@type(HTMLElement)*/e, /*@type(String)*/cls) {
        var oldClass = e.className;
        e.className = oldClass + (oldClass ? " " : "") + cls;
    }

    function _removeClass(/*@type(HTMLElement)*/e, /*@type(String)*/cls) {
        e.className = e.className.replace(_classRE(cls), " ").trim();
    }

    function _qsa(/*@dynamic*/obj, /*@type(String)*/selector) { 
        if (obj === _document) {
            // there is only one body and document.body is faster than querySelectorAll
            if (selector === "body") {
                return [_document.body];
            } 
            // getElementById is faster than querySelectorAll
            if (_idSelectorRE.test(selector)) {
                var el = _document.getElementById(RegExp.$1);
                return el ? [el] : [];
            }
        }
        // $TODO implement a special case for class selector?
        // $TODO implement a special case for tag selector?
        return obj.querySelectorAll(selector);
    }

    function _camelCaseReplaceFn(all, /*@type(String)*/ch) { 
        return (ch + "").toUpperCase();
    }

    function _camelCase(/*@type(String)*/str) { 
        return str.replace(_msPrefixRE, "ms-").replace(_dashAlphaRE, _camelCaseReplaceFn);
    }

    //
    // Events
    //

    function _forEachEvent(/*@dynamic*/events, handler, fn) {
        if (_isObject(events)) {
            // events map - i.e. { click: onclick, mouseover:onmouseover }
            // call fn(event, handler) for each event in the event map
            Debug.assert(_isUndef(handler), "Qx._forEachEvent: invalid arg");
            for (var i in events) {
                fn(i, events[i]);
            }
        } else {
            // space-separated events - i.e. "click mouseover" - all share the same handler
            Debug.assert(_isDef(handler), "Qx._forEachEvent: invalid arg");
            events.split(" ").forEach(function (ev) { 
                fn(ev, handler); 
            });
        }
    }

    function _addEvent(/*@type(HTMLElement)*/e, events, handler) {
        // call the function for each event in events (space-separated or events map)
        _forEachEvent(events || "", handler, function (eventName, eventHandler) {
            e.addEventListener(eventName, eventHandler, false);
        });
    }

    function _removeEvent(/*@type(HTMLElement)*/e, events, handler) { 
        // call the function for each event in events (space-separated or events map)
        _forEachEvent(events || "", handler, function (eventName, eventHandler) {
            e.removeEventListener(eventName, eventHandler, false);
        });
    }

    //
    // Qx constructor
    //

    function $(/*@dynamic*/selector, /*@dynamic*/context) {
        /// <summary>Qx constructor.</summary>
        /// <param name="selector" optional="true">A string containing a selector expression, DOM element, document, window, documentFragment, Qx object, array-like object, plain object or ready function.</param>
        /// <param name="context" optional="true">The query context. It can be any expression accepted as selector.</param>
        return new $.fn.init(selector, context);
    }

    $.fn = $.prototype = {
        /// <disable>JS3054.NotAllCodePathsReturnValue</disable>
        init: function (/*@dynamic,@optional*/selector, /*@dynamic,@optional*/context) {
            if (selector) {
                // we have selector
                if (_isHTMLElement(selector) || selector === _document || selector === _window || selector instanceof DocumentFragment) {
                    // the selector is an element, document, documentFragment or window - store it on the Qx object
                    this[0] = selector;
                    this.length = 1;
                } else if (_isDef(context)) {
                    // we have context - $(selector,context) is equivalent to $(context).find(selector)
                    return $(context).find(selector);
                } else if (_isString(selector)) {
                    // the selector is a string
                    if (_fragmentRE.test(selector)) {
                        // html fragment, parse into the container
                        _div.innerHTML = selector;
                        // move the nodes from div to 'this'
                        var e = _div.firstChild;
                        while (e) {
                            this.push(e);
                            _div.removeChild(e);
                            e = _div.firstChild;
                        }
                    } else if (selector !== "") {
                        _copyArrayLike(this, _qsa(_document, selector));
                        this.selector = selector;
                    }
                } else if (_isFunction(selector)) {
                    // ready callback function
                    return $(_document).ready(selector);
                } else if (_isArrayLike(selector)) {
                    // the selector looks like an array (Array, NodeList, Qx, ...) - copy it to the Qx object
                    _copyArrayLike(this, selector);
                    if (_isDef(selector.selector)) {
                        // it's a Qx object with selector - copy the selector
                        this.selector = selector.selector;
                    }
                } else if (_isObject(selector)) {
                    // keep the object check at the end to do more specific checks first
                    // the selector is a plain object - store it to the Qx object
                    this[0] = selector;
                    this.length = 1;
                }
            }
        },
        /// <enable>JS3054.NotAllCodePathsReturnValue</enable>

        /// <field>The current selector.</field> 
        selector: "",

        /// <field>The number of elements in the Qx object.</field> 
        length: 0,

        size: function () { 
            /// <summary>
            /// Returns the number of elements in the Qx object.
            /// Qx.size() is functionally equivalent to the Qx.length property (which is faster).
            /// </summary>
            /// <returns type="Number">The number of elements in the Qx object.</returns>
            return this.length;
        },

        get: function (i) { 
            /// <summary>Retrieve the DOM elements matched by the Qx object.</summary>
            /// <param name="i" type="Number" optional="true">A zero-based integer indicating which element to retrieve. If missing then it returns the Qx object.</param>
            /// <returns>A DOM element or the Qx object.</returns>
            return _isUndef(i) ? this : this[i];
        },

        push: function (/*@dynamic*/obj) {
            /// <summary>Adds an object (DOM element, window) to the Qx object.</summary>
            /// <param name="obj">A DOM element or the window object.</param>
            /// <returns>The Qx object.</returns>
            Debug.assert(_isHTMLElement(obj) || obj === _window, "Qx.push: invalid arg");
            this[this.length++] = obj;
            return this;
        },

        each: function (fn) {
            /// <summary>Iterate over a Qx object, executing a function for each element.</summary>
            /// <param name="fn" type="Function">A function fn(index, element) to execute for each element. In the function, this refers to the element.</param>
            /// <returns>The Qx object.</returns>
            _forEach.call(this, function (e, i) { 
                fn.call(e, i, e); 
            });
            return this;
        },
        
        find: function (selector) {
            /// <summary>Get the descendants of each element in the current set of matched elements, filtered by a selector.</summary>
            /// <param name="selector" type="String">A string containing a selector expression to match elements against.</param>
            /// <returns>A new Qx object containing the matching elements.</returns>
            if (this.length === 1) {
                return _copyArrayLike(this, _qsa(this[0], selector));
            }
            Debug.assert(false, "Qx.find: multiple elements not supported");
            return $();
        },

        eq: function (i) {
            /// <summary>Reduce the set of matched elements to the one at the specified index.</summary>
            /// <param name="i" type="Number">An integer indicating the 0-based position of the element.</param>
            /// <returns>A new Qx object containing the specified element.</returns>
            Debug.assert(i >= 0, "Qx.eq: negative index is not supported");
            return $(this[i]);
        },

        first: function () { 
            /// <summary>Reduce the set of matched elements to the first in the set.</summary>
            /// <returns>A new Qx object containing the first element.</returns>
            return $(this[0]);
        },
        
        last: function () { 
            /// <summary>Reduce the set of matched elements to the last in the set.</summary>
            /// <returns>A new Qx object containing the last element.</returns>
            return $(this[this.length - 1]);
        },

        empty: function () { 
            /// <summary>Remove all child nodes of the set of matched elements from the DOM.</summary>
            /// <returns>The Qx object.</returns>
            return this.each(/*@bind(HTMLElement)*/function () {
                this.innerHTML = ""; // $TODO we might need: while ( e.firstChild ) { e.removeChild( e.firstChild ); }
            });
        },

        remove: function () { 
            /// <summary>Remove the set of matched elements from the DOM.</summary>
            /// <returns>The Qx object.</returns>
            Debug.assert(arguments.length === 0, "Qx.remove: arguments not supported");
            return this.each(/*@bind(HTMLElement)*/function () {
                var pn = this.parentNode;
                if (pn) {
                    pn.removeChild(this);
                }
            });
        },

        //
        // Loading
        //

        ready: function (handler){
            /// <summary>Specify a function to execute when the DOM is fully loaded.</summary>
            /// <param name="handler" type="Function">A function to execute after the DOM is ready.</param>
            /// <returns>The Qx object.</returns>
            // $TODO investigate the correct readyState values to check
            if (_readyRE.test(_document.readyState)) { 
                handler();
            } else { 
                _document.addEventListener("DOMContentLoaded", handler, false);
            }
            return this;
        },

        //
        // Class manipulation
        //
        
        hasClass: function (cls) {
            /// <summary>Determine if the first element in the Qx object has the given class.</summary>
            /// <param name="cls" type="String">Class name.</param>
            /// <returns type="Boolean">Returns true if it has the class.</returns>    
            if (this.length < 1) {
                return false;
            }
            return _classRE(cls).test(this[0].className);
        },

        addClass: function (cls) {
            /// <summary>Adds the specified class to each of the set of matched elements.</summary>
            /// <param name="cls" type="String">Class name.</param>
            /// <returns>The Qx object.</returns>
            Debug.assert(_isNonEmptyString(cls), "Qx.addClass: invalid arg");
            return this.each(/*@bind(HTMLElement)*/function () { 
                if (!_hasClass(this, cls)) {
                    _addClass(this, cls);
                }
            });
        },

        removeClass: function (cls) {
            /// <summary>Remove a single class from each element in the set of matched elements.</summary>
            /// <param name="cls" type="String">Class name.</param>
            /// <returns>The Qx object.</returns>    
            Debug.assert(_isNonEmptyString(cls), "Qx.removeClass: invalid arg");
            return this.each(/*@bind(HTMLElement)*/function () { 
                _removeClass(this, cls);
            });
        },

        toggleClass: function (cls, when) {
            /// <summary>Add or remove one class from each element in the set of matched elements, depending on either the class's presence or the value of the switch argument.</summary>
            /// <param name="cls" type="String">One class name to be toggled for each element in the matched set.</param>
            /// <param name="when" type="Boolean" optional="true">A boolean value to determine whether the class should be added or removed.</param>
            /// <returns>The Qx object.</returns>    
            Debug.assert(_isNonEmptyString(cls), "Qx.toggleClass: invalid arg");
            if (_isUndef(when) || when) {
                this.each(/*@bind(HTMLElement)*/function () { 
                    // $TODO create the regex once
                    if (_hasClass(this, cls)) {
                        _removeClass(this, cls); 
                    } else {
                        _addClass(this, cls);
                    }
                });
            }
            return this;
        },

        //
        // Attributes manipulation
        //

        val: function (value) {
            /// <summary>Get the current value of the first element in the set of matched elements or set the value of each element in the set of matched elements.</summary>
            /// <param name="value" optional="true">A value to set.</param>
            /// <returns>The current value or the Qx object.</returns>    
            if (_isUndef(value)) {
                return this.length > 0 ? this[0].value : _undef;
            }
            return this.each(/*@bind(HTMLElement)*/function () {
                this.value = value;
            });
        },

        prop: function (prop, value) {
            /// <summary>Get the value of the property for the first element in the set of matched elements or set a property for each element in the set of matched elements.</summary>
            /// <param name="prop" type="String">The name of property to get or set.</param>
            /// <param name="value" optional="true">A value to set on each matched element.</param>
            /// <returns>The value property or the Qx object.</returns>    
            Debug.assert(_isNonEmptyString(prop), "Qx.prop: _isNonEmptyString(prop)");
            if (_isUndef(value)) {
                return this.length > 0 ? this[0][prop] : _undef;
            }
            return this.each(/*@bind(HTMLElement)*/function () {
                this[prop] = value;
            });
        },

        attr: function (attr, value) {
            /// <summary>Get the value of an attribute for the first element in the set of matched elements or set an attribute for each element in the set of matched elements.</summary>
            /// <param name="attr" type="String">The name of the attribute to get or set.</param>
            /// <param name="value" optional="true">A value to set for the attribute.</param>
            /// <returns>The attribute property or the Qx object.</returns>    
            Debug.assert(_isNonEmptyString(attr), "Qx.attr: _isNonEmptyString(attr)");
            if (_isUndef(value)) {
                return this.length > 0 ? this[0].getAttribute(attr) : _undef;
            }
            return this.each(/*@bind(HTMLElement)*/function () {
                this.setAttribute(attr, value);
            });
        },

        removeAttr: function (attr) {
            /// <summary>Remove an attribute from each element in the set of matched elements.</summary>
            /// <param name="attr" type="String">The name of attribute to remove.</param>
            /// <returns>The Qx object.</returns>    
            Debug.assert(_isNonEmptyString(attr), "Qx.removeAttr: _isNonEmptyString(attr)");
            return this.each(/*@bind(HTMLElement)*/function () {
                this.removeAttribute(attr);
            });
        },

        //
        // HTML manipulation
        //

        html: function (html) {
            /// <summary>Get the HTML contents of the first element in the set of matched elements or set the HTML contents of each element in the set of matched elements.</summary>
            /// <param name="html" type="String" optional="true">A string of HTML to set as the content of each matched element.</param>
            /// <returns>The HTML contents string or the Qx object.</returns>    
            if (_isUndef(html)) {
                return this[0].innerHTML;
            }
            return this.each(/*@bind(HTMLElement)*/function () { 
                this.innerHTML = html;
            });
        },

        text: function (text) {
            /// <summary>Get the text contents of the first element in the set of matched elements or set the text contents of each element in the set of matched elements.</summary>
            /// <param name="text" type="String" optional="true">A string of text to set as the content of each matched element.</param>
            /// <returns>The contents string or the Qx object.</returns>    
            if (_isUndef(text)) {
                return this[0].innerText;
            }
            return this.each(/*@bind(HTMLElement)*/function () { 
                this.innerText = text;
            });
        },

        insertHTML: function (position, html) {
            /// <summary>Insert content using insertAdjacentHTML to each element in the set of matched elements.</summary>
            /// <param name="position" type="String">String that specifies where to insert the HTML text, using one of the following values: beforeBegin, afterBegin, beforeEnd, afterEnd.</param>
            /// <param name="html" type="String">String that specifies the HTML text to insert. The string can be a combination of text and HTML tags. This must be well-formed, valid HTML or this method will fail.</param>
            /// <returns>The Qx object.</returns>    
            return this.each(/*@bind(HTMLElement)*/function () {
                this.insertAdjacentHTML(position, html); 
            });
        },

        before : function (html) {
            /// <summary>Insert content using insertAdjacentHTML("beforeBegin") to each element in the set of matched elements.</summary>
            /// <param name="html" type="String">String that specifies the HTML text to insert. The string can be a combination of text and HTML tags. This must be well-formed, valid HTML or this method will fail.</param>
            /// <returns>The Qx object.</returns>    
            return this.insertHTML("beforeBegin", html);
        },

        prepend : function (html) {
            /// <summary>Insert content using insertAdjacentHTML("afterBegin") to each element in the set of matched elements.</summary>
            /// <param name="html" type="String">String that specifies the HTML text to insert. The string can be a combination of text and HTML tags. This must be well-formed, valid HTML or this method will fail.</param>
            /// <returns>The Qx object.</returns>    
            return this.insertHTML("afterBegin", html);
        },

        append : function (html) {
            /// <summary>Insert content using insertAdjacentHTML("beforeEnd") to each element in the set of matched elements.</summary>
            /// <param name="html" type="String">String that specifies the HTML text to insert. The string can be a combination of text and HTML tags. This must be well-formed, valid HTML or this method will fail.</param>
            /// <returns>The Qx object.</returns>    
            return this.insertHTML("beforeEnd", html);
        },

        after : function (html) {
            /// <summary>Insert content using insertAdjacentHTML("afterEnd") to each element in the set of matched elements.</summary>
            /// <param name="html" type="String">String that specifies the HTML text to insert. The string can be a combination of text and HTML tags. This must be well-formed, valid HTML or this method will fail.</param>
            /// <returns>The Qx object.</returns>    
            return this.insertHTML("afterEnd", html);
        },

        //
        // CSS manipulation
        //

        css : function (/*@dynamic*/prop, /*@dynamic*/value) {
            /// <summary>Get the value of a style property for the first element in the set of matched elements or set one or more CSS properties for the set of matched elements.</summary>
            /// <param name="prop">A CSS property or a map of property-value pairs to set.</param>
            /// <param name="value" optional="true">A value to set for the property.</param>
            /// <returns>The Qx object.</returns>    
            var key, cssText = "";

            if (_isUndef(value) && _isString(prop)) {
                /// <disable>JS3092.DeclarePropertiesBeforeUse</disable> $TODO getPropertyValue is not defined
                return this[0].style[_camelCase(prop)] || _window.getComputedStyle(this[0], "").getPropertyValue(prop);
                /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
            }

            if (_isString(prop)) {
                cssText = prop + ":" + value;
            } else {
                for (key in prop) { 
                    cssText += key + ":" + prop[key] + ";";
                }
            }

            return this.each(/*@bind(HTMLElement)*/function () { 
                this.style.cssText += ";" + cssText;
            });
        },

        //
        // Events
        //

        on: function (/*@dynamic*/events, /*@dynamic*/selector, /*@dynamic*/data, /*@dynamic*/handler) {
            /// <summary>Attach an event handler function for one or more events to the selected elements.</summary>
            /// <param name="events">One or more space-separated event types or a map in which the string keys represent one or more space-separated event types, and the values represent a handler function to be called for the event(s).</param>
            /// <param name="selector" optional="true">A selector string to filter the descendants of the selected elements that trigger the event. If the selector is null or omitted, the event is always triggered when it reaches the selected element.</param>
            /// <param name="data" optional="true">Data to be passed to the handler in event.data when an event occurs.</param>
            /// <param name="handler" optional="true">A function to execute when the event is triggered. The value false is also allowed as a shorthand for a function that simply does return false.</param>
            /// <returns>The Qx object.</returns> 

            
                // $TODO implement selector and data
                var len = arguments.length;
                Debug.assert(len === 1 || len === 2, "Qx.on: needs 1 or 2 arguments");
                if (len === 1) {
                    Debug.assert(_isObject(events), "Qx.on: invalid events argument");
                } else {
                    Debug.assert(_isString(events), "Qx.on: invalid events argument");
                    Debug.assert(_isFunction(selector), "Qx.on: selector and data arguments not supported, the second argument should be a handler");
                }
            

            return this.each(/*@bind(HTMLElement)*/function () {
                _addEvent(this, events, selector); // selector is actually the handler
            });
        },

        off: function (/*@dynamic*/events, /*@dynamic*/selector, /*@dynamic*/handler) {
            /// <summary>Remove an event handler.</summary>
            /// <param name="events">One or more space-separated event types or a map where the string keys represent one or more space-separated event types, and the values represent handler functions previously attached for the event(s).</param>
            /// <param name="selector" optional="true">/*@dynamic*/handler</param>
            /// <param name="handler" optional="true">A handler function previously attached for the event(s), or the special value false.</param>
            /// <returns>The Qx object.</returns> 

            
                var len = arguments.length;
                Debug.assert(len === 1 || len === 2, "Qx.on: needs 1 or 2 arguments");
                if (len === 1) {
                    Debug.assert(_isObject(events), "Qx.on: invalid events argument");
                } else {
                    Debug.assert(_isString(events), "Qx.on: invalid events argument");
                    Debug.assert(_isFunction(selector), "Qx.on: selector and data arguments not supported, the second argument should be a handler");
                }
            

            return this.each(/*@bind(HTMLElement)*/function () {
                _removeEvent(this, events, selector); // selector is actually the handler
            });
        },

        trigger: function (/*@dynamic*/ev, /*@dynamic*/data) {
            /// <summary>Execute all handlers attached to the matched elements for the given event type.</summary>
            /// <param name="ev">A string containing a JavaScript event type, such as "click" or an Event object.</param>
            /// <param name="data" optional="true">Additional parameters to pass along to the event handler.</param>
            /// <returns>The Qx object.</returns> 
            Debug.assert(_isNonEmptyString(ev) || ev instanceof Event, "Qx.trigger: invalid event argument");
            if (_isString(ev)) {
                ev = $.Event(ev, data);
            } else if (data) {
                ev.data = data;
            }
            return this.each(/*@bind(HTMLElement)*/function () {
                this.dispatchEvent(ev);
            });
        }
    };

    // Give the init function the $ prototype for later instantiation
    $.fn.init.prototype = $.fn;

    //
    // Utilities
    //

    $.extend = function (/*@dynamic*/dest, /*@dynamic*/src) {
        /// <summary>Merge the contents of the src object into the dest object.</summary>
        /// <param name="dest">An object that will receive the new properties.</param>
        /// <param name="src">An object containing additional properties to merge in.</param>
        /// <returns>The merged object.</returns>
        Debug.assert(arguments.length === 2, "Qx.extend: only supports two arguments");
        for (var i in src) {
            if (src.hasOwnProperty(i)) {
                dest[i] = src[i];
            }
        }
        return dest;
    };

    $.isArray = function (/*@dynamic*/value) {
        /// <summary>Determine whether the argument is an array.</summary>
        /// <param name="value">Value to test whether or not it is an array.</param>
        /// <returns type="Boolean">Returns a Boolean indicating whether the object is a JavaScript array (not an array-like object, such as a Qx object).</returns>
        return value instanceof Array;
    };

    $.isObject = _isObject;

    $.isFunction = _isFunction;

    $.noop = function () {
        /// <summary>An empty function.</summary>
    };

    //
    // DOM
    //

    $.id = function (id) {
        /// <summary>Returns a reference to the first object with the specified value of the ID attribute.</summary>
        /// <param type="String" name="id">A String that specifies the ID value. Case-sensitive.</param>
        /// <returns type="HTMLElement">Returns a reference to the first object with the specified value of the ID attribute or null if not found.</returns>
        Debug.assert(_isNonEmptyString(id), "Qx.id: invalid id argument");
        return _document.getElementById(id);
    };
    
    //
    // Events
    //

    $.Event = function (eventName, /*@dynamic*/props) {
        /// <summary>Helper to create a standard DOM Event.</summary>
        /// <param name="eventName" type="String">A string containing a JavaScript event type, such as "click".</param>
        /// <param name="props" optional="true">Optional properties to set on the event object. The "bubbles" property is used to initialize the event.</param>
        /// <returns type="Event">The event object.</returns>
        var ev = _document.createEvent("Event"), 
            bubbles = true;
        if (props) {
            for (var i in props) {
                if (i === "bubbles") {
                    bubbles = !!props[i];
                } else {
                    ev[i] = props[i];
                }
            }
        }
        ev.initEvent(eventName, bubbles, /*cancelable*/true);
        return ev;
    };

    // Add well known events to $
    "focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select keydown keypress keyup error contextmenu".split(" ").forEach(function (eventName) {
        $.fn[eventName] = /*@bind($)*/function (/*@dynamic*/eventData, /*@dynamic*/handler) {
            /// <summary>Bind an event handler to an event or trigger that event.</summary>
            /// <param name="eventData" optional="true">A map of data that will be passed to the event handler.</param>
            /// <param name="handler" optional="true">A function to execute each time the event is triggered.</param>
            /// <returns>The Qx object.</returns>
            Debug.assert(arguments.length < 2, "Qx." + eventName + ": too many arguments"); // eventData not supported yet so now eventData is actually the handler
            return _isUndef(eventData) ? this.trigger(eventName) : this.on(eventName, eventData);
        };
    });



    //
    // Private functions exposed for UTs    
    //

    $._camelCase = _camelCase;
    $._copyArrayLike = _copyArrayLike;



    //
    // Exports
    //

    _window.Qx = $;
    
    /*jshint expr:true */
    /// <disable>JS3057.AvoidImplicitTypeCoercion</disable> 

    // Don't override existing $ 
    "$" in _window || (_window.$ = $);

    /// <enable>JS3057.AvoidImplicitTypeCoercion</enable> 
    /*jshint expr:false */



    // We need to use window.$ so JSCop can see it as a global property
    if ($ !== $) {
        _window.$ = $;
    }



})();


//
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

/*jshint browser:true*/
/*global Debug,Jx,Range,WinJS*/

Jx.isHTMLElement = function (/*@dynamic*/e) {
    /// <summary>Check if the given argument is a an HTMLElement.</summary>
    /// <param name="e">Argument to check.</param>
    /// <returns type="Boolean">Returns true if it's an HTMLElement.</returns>
    Debug.assert(Node.ELEMENT_NODE === 1);
    return Boolean(e && e.nodeType === 1);
};

Jx.isRtl = function () {
    /// <summary>True if the document is rendered in RTL direction.</summary>
    /// <returns type="Boolean">Returns true if the document is rendered in RTL direction.</returns>
    Debug.assert(Jx.isHTMLElement(document.body), "Jx.isRtl - invalid document.body type");
    return (document.body.currentStyle.direction === "rtl");
};

Jx.addStyle = function (css) {
    /// <summary>Adds a style element to the document containing the 'css' string fragment</summary>
    /// <param name="css" type="String">CSS to add.</param>

    if (Jx.isNonEmptyString(css)) {
        var e = document.createElement("style");
        e.type = "text/css";
        e.innerText = css;
        document.head.appendChild(e);
    }
};

Jx.addStyleToDocument = function (css, doc) {
    /// <summary>Adds a style element containing the 'css' string fragment to a supplied document</summary>
    /// <param name="css" type="String">CSS to add.</param>
    /// <param name="doc" type="Document">Document into which to insert the CSS.</param>
    /// <returns type="HTMLElement">The style node inserted into the document.</param>
    
    Debug.assert(Jx.isObject(doc));
    Debug.assert(Jx.isObject(doc.head));
    
    var el;

    if (Jx.isNonEmptyString(css)) {
        el = doc.createElement("style");
        el.type = "text/css";
        el.innerText = css;
        doc.head.appendChild(el);
    }
    
    return el;
};

Jx.loadCss = function (href) {
    /// <summary>Adds the href stylesheet to the document </summary>
    /// <param name="href" type="String">CSS file to add.</param>
    Debug.assert(Jx.isNonEmptyString(href), "Jx.loadCss - invalid href");

    Jx.mark("Jx.loadCss:" + href + ",StartTA,Jx");
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
    Jx.mark("Jx.loadCss:" + href + ",StopTA,Jx");
};

Jx.hasClass = function (el, cls) {
    /// <summary>Check if 'el' has the class 'cls'</summary>
    /// <param name="el" type="HTMLElement">The HTML element</param>
    /// <param name="cls" type="String">Class name</param>
    /// <returns type="Boolean">Returns true if 'el' has the class 'cls'</returns>

    Debug.assert(Jx.isHTMLElement(el), "Jx.hasClass - invalid element passed");
    Debug.assert(Jx.isNonEmptyString(cls), "Jx.hasClass - invalid class name passed");

    return Boolean(el.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)')));
};

Jx.addClass = function (el, cls) {
    /// <summary>Adds the class 'cls' to 'el'</summary>
    /// <param name="el" type="HTMLElement">The HTML element</param>
    /// <param name="cls" type="String">Class name</param>
    /// <returns type="Boolean">True if the class was added; false if already present</returns>

    if (!this.hasClass(el, cls)) {
        el.className += " " + cls;
        return true;
    }
    return false;
};

Jx.removeClass = function (el, cls) {
    /// <summary>Removes the class 'cls' from 'el'</summary>
    /// <param name="el" type="HTMLElement">The HTML element</param>
    /// <param name="cls" type="String">Class name</param>
    /// <returns type="Boolean">True if the class was removed; false if it wasn't present</returns>

    if (this.hasClass(el, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        el.className = el.className.replace(reg, ' ');
        return true;
    }
    return false;
};

Jx.setClass = function (el, cls, fAdd) {
    /// <summary>Toggles the class 'cls' on 'el'</summary>
    /// <param name="el" type="HTMLElement">The HTML element</param>
    /// <param name="cls" type="String">Class name</param>
    /// <param name="fAdd" type="Boolean">Add if true, remove if false</param>
    if (fAdd) {
        this.addClass(el, cls);
    } else {
        this.removeClass(el, cls);
    }
};

Jx.parseHash = function (hash) {
    /// <summary>Parse the URL hash.</summary>
    /// <param name="hash" type="String">Hash format (the hash is after the #): base_url#key1=value1&amp;key2,....</param>
    /// <returns type="Object">Returns an object containing the hash keys and values.</returns>

    // XML comments need & to be escaped - the hash format is actually: base_url#key1=value1&key2,....

    Debug.assert(Jx.isString(hash), "Jx.parseHash - invalid hash param: " + hash);

    var values = {}, tokens = hash.split("&");

    for (var i = 0, len = tokens.length; i < len; i++) {
        var /*@type(Array)*/kv = tokens[i].split("=");

        Debug.assert(kv.length <= 2, "Jx.parseHash - too many = on token " + String(i));

        if (kv[0] !== "") {
            values[kv[0]] = kv[1]; // 'kv[1]' is undefined for missing values, i.e. "key="
        }
    }

    return values;
};

Jx.safeSetActive = function (el) {
    /// <summary>A non-throwing version of setActive().</summary>
    /// <param name="el" type="HTMLElement">The element to call setActive() on</param>
    /// <returns type="Boolean">Returns false is the operation fails.</returns>
    Debug.assert(Jx.isHTMLElement(el), "Jx.safeSetActive - invalid element passed");

    try {
        el.setActive();
    } catch (ex) {
        Jx.log.exception("setActive() failed for element with Id = " + el.id, ex);
        return false;
    }

    return true;
};

Jx.observeMutation = function (target, options, callback, context) {
    /// <summary>Creates a MutationObserver with the specified options</summary>
    Debug.assert(Jx.isHTMLElement(target));
    Debug.assert(Jx.isObject(options));
    Debug.assert(Jx.isFunction(callback));
    Debug.assert(Jx.isNullOrUndefined(context) || Jx.isObject(context));

    var observer = new MutationObserver(callback.bind(context));
    observer.observe(target, options);
    return observer;
};

Jx.observeAttribute = function (target, attributeName, callback, context) {
    /// <summary>
    ///     Whenever target's attribute value changes, the handler is called in the given context.
    ///     Call disconnect() on the return value when you no longer need to observe the mutation.
    /// </summary>
    /// <param name="target" type="HTMLElement">The element where the attribute change is observed</param>
    /// <param name="attributeName" type="String">The name of the attribute where change is observed</param>
    /// <param name="handler" type="Function">The callback when the attribute changes</param>
    /// <param name="context" type="Object" optional="True">The context under which the callback is invoked</param>
    Debug.assert(Jx.isHTMLElement(target));
    Debug.assert(Jx.isNonEmptyString(attributeName));
    Debug.assert(Jx.isFunction(callback));
    Debug.assert(Jx.isNullOrUndefined(context) || Jx.isObject(context));

    return Jx.observeMutation(target, {
        attributes: true,
        attributeFilter: [ attributeName ]
    }, callback, context);
};

Jx.intersectsNode = function (range, node, nonInclusive) {
    /// <summary>Determines if the given node is partially or completely within the range.</summary>
    /// <param name="range" type="Range">The range to check.</param>
    /// <param name="node" type="Node">The node to check.</param>
    /// <param name="nonInclusive" type="Boolean" optional="true">true if the range check is non-inclusive.</param>
    /// <returns type="Boolean">true if the node is partially or completely within the range, and false otherwise.</returns>

    Debug.assert(Jx.isObject(range), "Expected range to be a valid Range");
    Debug.assert(Jx.isObject(node), "Expected node to be a valid Node");
    Debug.assert(range.commonAncestorContainer.ownerDocument === node.ownerDocument, "Node expected to be inside the same document as the range.");

    var doc = node.ownerDocument,
        testRange = doc.createRange();

    testRange.selectNodeContents(node);

    var startToEnd = testRange.compareBoundaryPoints(Range.START_TO_END, range),
        endToStart = testRange.compareBoundaryPoints(Range.END_TO_START, range);

    return nonInclusive ? (startToEnd > 0 && endToStart < 0) : (startToEnd >= 0 && endToStart <= 0);
};

Jx.loadScript = function (src) {
    /// <summary>Creates a promise that completes when a script is loaded</summary>
    /// <param name="src" type="String">The path of the script to load</param>
    Debug.assert(Jx.isNonEmptyString(src));
    return new WinJS.Promise(function (complete, error) {
        var script = document.createElement("script");
        script.addEventListener("load", function () { complete(src); });
        script.addEventListener("error", error);
        script.src = src;
        document.head.appendChild(script);
    });
};

Jx.loadScripts = function (scripts) {
    /// <summary>Creates a promise that completes when all of the scripts are loaded</summary>
    /// <param name="scripts" type="Array">The scripts to load</param>
    Debug.assert(Jx.isArray(scripts));
    return WinJS.Promise.join(scripts.map(Jx.loadScript));
};

//
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

// Base object

/// <reference path="Debug.js" />

/*global Jx,Debug*/

Jx.Base = {

    // Flags used for lifetime management
    _initBase: false,
    _shutdownBase: false,

    initBase: function () {
        /// <summary>Initialize the base object</summary>
        Debug.assert(!this._initBase);
        this._initBase = true;
    },

    shutdownBase: function () {
        /// <summary>Shuts down the base object</summary>
        Debug.assert(this._initBase);
        Debug.assert(!this._shutdownBase);
        this._shutdownBase = true;
    },

    isInit: function () {
        /// <summary>Check if the object is initialized</summary>
        /// <returns type="Boolean">Returns true if the object is initialized</returns>    
        return this._initBase;
    },

    isShutdown: function () {
        /// <summary>Returns true if the object is shut down</summary>
        /// <returns type="Boolean">Returns true if the object is shut down</returns>    
        return this._shutdownBase;
    }
};


//
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

/*jshint browser:true*/
/*global Jx,Debug,WinJS*/

Jx.delayDefine(Jx, "Dep", function () {
    "use strict";

    var _jsRegEx = /\.js$/i; // .js file extension regex
    var _cssRegEx = /\.css$/i; // .css file extension regex
    var _cssRelRegEx = /.+\/\/[^\/]+(\/.+)/; // regex to match the css relative path
    var _head = null; // document.head
    var _depNames = {}; // store dependency names
    var _loaded = {}; // mark loaded files - null means fully loaded, {e:e, fns:[fn1,fn2,...]} means in progress

    function _info(s) { Jx.mark("Jx.Dep." + s + ",Info,Jx"); }
    function _start(s) { Jx.mark("Jx.Dep." + s + ",StartTA,Jx"); }
    function _stop(s) { Jx.mark("Jx.Dep." + s + ",StopTA,Jx"); }
    function _startAsync(s) { Jx.mark("Jx.Dep." + s + ",StartTM,Jx"); }
    function _stopAsync(s) { Jx.mark("Jx.Dep." + s + ",StopTM,Jx"); }

    // returns the relative path for stylesheet elements
    function _cssRelPath(e) {
        var href = e.href; // e.href returns the absolute path, null for inline styles
        if (href) {
            href = href.match(_cssRelRegEx)[1].toLowerCase();
            Debug.assert(Jx.isNonEmptyString(href), "Jx.Dep._cssRelPath: invalid href");
            return href; // we want to store the relative path
        }
        return "";
    }

    // Returns true if the file is already loaded
    function depIsLoaded(path) {
        Debug.assert(Jx.isNonEmptyString(path), "Jx.Dep.isLoaded: invalid path");

        path = path.toLowerCase();
        return (path in _loaded) && (_loaded[path] === null); // null: loading is done, !null: in progress
    }

    // onload handler for script and css
    function _onload(ev) {
        var e = ev.target;
        var file = ("src" in e) ? e.getAttribute("src") : _cssRelPath(e);

        Debug.only(_info("_onload: file=" + file));

        // <link> does not fire onerror, check for empty stylesheets in onload
        Debug.assert(!e.sheet || e.sheet.cssRules.length > 0, "Jx.Dep._onload: empty stylesheet: " + file);

        // call all load handlers
        var fns = _loaded[file].fns;
        for (var i = 0, len = fns.length; i < len; i++) {
            fns[i]();
        }

        e.onload = null; // remove the handler

        _loaded[file] = null; // mark as loaded

        _stopAsync("load:" + file); // make sure it matches the _startAsync in _loadFile
    }

    // Appends <script> or <link> to document.head
    function _loadFile(file, fn) {
        Debug.assert(Jx.isNonEmptyString(file), "Jx.Dep._loadFile: invalid file");
        Debug.assert(Jx.isFunction(fn), "Jx.Dep._loadFile: invalid fn");

        Debug.assert(!depIsLoaded(file), "Jx.Dep._loadFile: file already loaded");
        
        if (_loaded[file]) {
            // loading in progress, add another load handler to the existing element
            _loaded[file].fns.push(fn);
        } else { 
            _startAsync("load:" + file); // make sure it matches the stopAsync in _onload

            var isJS = _jsRegEx.test(file);
            var e = document.createElement(isJS ? "script" : "link");

            // add the element to the loaded map, we'll use it later to add more onload handlers
            _loaded[file] = { e:e, fns:[fn] };

            if (isJS) {
                // e.async = false; // TODO: investigate if we need async=false for preserving execution ordering. By default async=true.
                e.src = file;
            } else {
                Debug.assert(_cssRegEx.test(file), "Jx.Dep._loadFile: invalid extension: " + file);
                e.type = "text/css";
                e.rel = "stylesheet";
                e.href = file;
            }

            e.onload = _onload;
        
            // hook up the error handler in debug        
            Debug.only(e.addEventListener("error", function () {
                Debug.assert(false, "Script loading error: " + file);
            }));

            // If an element is created then add it to the DOM. That will trigger the file loading
            _head.appendChild(e);
        }
    }

    // Resolve all named dependencies to files. It does not remove duplicate files - depLoad takes care of that.
    function _resolve(names, deps, files) {
        Debug.assert(Jx.isObject(names), "Jx.Dep.resolve: invalid names");
        Debug.assert(Jx.isObject(deps), "Jx.Dep.resolve: invalid deps");
        Debug.assert(Jx.isArray(files), "Jx.Dep.resolve: invalid files");

        for (var i = 0, len = names.length; i < len; i++) {
            var name = names[i];

            // If the current dependency name is in the dependency map then resolve it, otherwise add it to the array
            if (name in deps) {
                _resolve(deps[name], deps, files);
            } else {
                files.push(name);
            }
        }
    }

    // Collect loaded scripts and stylesheets and store them into "_loaded"
    function depCollect() {
        _start("depCollect");

        // Read existing script tags and populate the loaded map
        var scripts = document.scripts;
        for (var i = 0, len = scripts.length; i < len; i++) {
            // Use getAttribute to get the original value - e.src returns the absolute (resolved) URL.
            var src = scripts[i].getAttribute("src");

            // src is null for inline scripts - skip it
            if (src) {
                src = src.toLowerCase();
                Debug.assert(!(src in _loaded), "Jx.Dep.collect: duplicate script " + src);
                _loaded[src] = null; // mark as fully loaded
            }
        }

        // Read existing link tags and populate the loaded map
        var styleSheets = document.styleSheets;
        for (i = 0, len = styleSheets.length; i < len; i++) {
            var href = _cssRelPath(styleSheets[i]);

            // href is empty for inline styles - skip it
            if (href) {
                Debug.assert(!(href in _loaded), "Jx.Dep.collect: duplicate stylesheet " + href);
                _loaded[href] = null; // mark as loaded
            }
        }
    
        _stop("depCollect");
    }

    // lower case an array in place
    function _lowerCaseArray(arr) {
        Debug.assert(Jx.isArray(arr), "Jx.Dep._lowerCaseArray: invalid arr");

        for (var i = 0, len = arr.length; i < len; i++) {
            arr[i] = arr[i].toLowerCase();
        }
        return arr;
    }

    // Define a dependency name
    function depName(name, paths) {
        Debug.assert(Jx.isNonEmptyString(name), "Jx.Dep.name: invalid name");
        Debug.assert(Jx.isArray(paths), "Jx.Dep.name: invalid paths");

        // lower case all names and files
        _depNames[name.toLowerCase()] = _lowerCaseArray(paths);
    }
    
    // Load dependencies and calls fn when done.
    function depLoad(names, fn) {
        Debug.assert(Jx.isNonEmptyString(names) || Jx.isArray(names), "Jx.Dep.load: invalid names");
        Debug.assert(Jx.isFunction(fn), "Jx.Dep.load: invalid fn");

        _startAsync("depLoad");

        if (Jx.isString(names)) {
            names = [names];
        }

        Debug.only(_info("depLoad: " + JSON.stringify(names)));

        if (!_head) {
            _head = document.head;
            Debug.assert(Jx.isHTMLElement(_head), "Jx.Dep.load: invalid head");
        }

        // Resolve dependencies to files
        var files = [];
        _resolve(_lowerCaseArray(names), _depNames, files);

        // Prepare file loading
        var len = files.length;
        var toLoad = len;

        // Call fn when all files are loaded
        function onDepLoad() {
            Debug.assert(toLoad > 0, "Jx.Dep.checkDone: invalid toLoad");
            if (--toLoad === 0) {
                _stopAsync("depLoad");
                fn(); 
            }
        }

        // Enumerate all files and load them if needed
        for (var i = 0; i < len; i++) {
            var file = files[i];
            if (_loaded[file] === null) {
                Debug.only(_info("load: already loaded " + file));
                onDepLoad();
            } else {
                _loadFile(file, onDepLoad);
            }
        }
    }

    // WinJS promise wrapper for Jx.Dep.load
    function depLoadAsync(names) {
        Debug.assert(Jx.isNonEmptyString(names) || Jx.isArray(names), "Jx.Dep.depLoadAsync: invalid names");

        return new WinJS.Promise(function (completed) {
            depLoad(names, completed);
        });
    }

    // public
    Jx.Dep = {
        collect: depCollect,
        name: depName,
        load: depLoad,
        isLoaded: depIsLoaded,
        loadAsync: depLoadAsync,
    };

    // UTs only
    Debug.call(function() {
        Jx.Dep._getLoaded = function () { return _loaded; };
        Jx.Dep._setLoaded = function (v) { _loaded = v; };
        Jx.Dep._getDepNames = function () { return _depNames; };
        Jx.Dep._setDepNames = function (v) { _depNames = v; };
        Jx.Dep._resolve = _resolve;
        Jx.Dep._loadFile = _loadFile;
    });

    Debug.only(Object.seal(Jx.Dep));
});

//
// Copyright (C) Microsoft. All rights reserved.
//
// BICI API wrapper encapsulating access to BICI client instrumentation WinRT objects implemented in bici.dll,
// such as Microsoft.WindowsLive.Instrumentation.BICI and Microsoft.WindowsLive.Instrumentation.DatapointValueList.
//
// Please, see wiki: http://windows/live/5/WikiModern/EP_WLI_Home.aspx for more details and onboarding steps.
//
// Our overall approach: this is an instrumentation layer API and should be safe and easy to call without checks
// or try/catch from anywhere in the code.
//

/// <reference path="Jx.js" />

/*global Jx,Microsoft,Debug*/

Jx.delayDefine(Jx, ["Bici", "bici"], function () {

    Jx.Bici = /*@constructor*/function () {
        /// <summary>Constructor.</summary>

        Jx.mark("Jx.Bici(),StartTA,Jx,Bici");

        if (Jx.isWWA) {
            try {
                this._bici = new Microsoft.WindowsLive.Instrumentation.Bici();
            }
            catch (e) {
                // Report the failure and be sure to check the _bici variable before using it
                this._reportError("Failed to create Microsoft.WindowsLive.Instrumentation.Bici, error message = " +
                    e.message + ", error code = " + e.number);
            }
        }

        Jx.mark("Jx.Bici(),StopTA,Jx,Bici");
    };

    var proto = Jx.Bici.prototype;

    // Reference to the Microsoft.WindowsLive.Instrumentation.Bici object
    proto._bici = null;

    proto.dispose = function () {
        /// <summary>Dispose the BICI instrumentation object.</summary>

        this._bici = null;
    };

    proto._safeCall = function (
        /*@dynamic*/object,
        method,
        /*@dynamic*/param1,
        /*@dynamic*/param2,
        /*@dynamic*/param3,
        /*@dynamic*/param4,
        /*@dynamic*/param5,
        /*@dynamic*/param6,
        /*@dynamic*/param7,
        /*@dynamic*/param8,
        /*@dynamic*/param9) {
        /// <summary>
        /// Helper method to unify BICI WinRT object invocations and the related exception handling
        /// Returns false on failure, otherwise returns the result or undefined if there was no result.
        /// </summary>
        /// <param name="param1" optional="true" />
        /// <param name="param2" optional="true" />
        /// <param name="param3" optional="true" />
        /// <param name="param4" optional="true" />
        /// <param name="param5" optional="true" />
        /// <param name="param6" optional="true" />
        /// <param name="param7" optional="true" />
        /// <param name="param8" optional="true" />
        /// <param name="param9" optional="true" />

        var result;
        if (object !== null && object !== undefined) {
            try {
                if (param1 === undefined) {
                    result = object[method]();
                } else if (param2 === undefined) {
                    result = object[method](param1);
                } else if (param3 === undefined) {
                    result = object[method](param1, param2);
                } else if (param4 === undefined) {
                    result = object[method](param1, param2, param3);
                } else if (param5 === undefined) {
                    result = object[method](param1, param2, param3, param4);
                } else if (param6 === undefined) {
                    result = object[method](param1, param2, param3, param4, param5);
                } else if (param7 === undefined) {
                    result = object[method](param1, param2, param3, param4, param5, param6);
                } else if (param8 === undefined) {
                    result = object[method](param1, param2, param3, param4, param5, param6, param7);
                } else if (param9 === undefined) {
                    result = object[method](param1, param2, param3, param4, param5, param6, param7, param8);
                } else {
                    result = object[method](param1, param2, param3, param4, param5, param6, param7, param8, param9);
                }
            }
            catch (e) {
                this._reportError("Failed to invoke method " + method + " , error message = " +
                e.message + ", error code = " + e.number);
                result = false;
            }
        } else {
            result = false;
        }

        return result;
    };

    proto._reportError = function (errorMessage) {
        /// <summary>
        /// Helper error reporting method.
        /// </summary>
        /// <param name="errorMessage" type="String">Error message</param>

        Jx.log.error(errorMessage);
    };


    proto._createValueList = /*@varargs*/function () {
        // Create a parameter list
        var valueList;
        try {
            valueList = new Microsoft.WindowsLive.Instrumentation.DatapointValueList();
        }
        catch (e) {
            this._reportError("Failed to create Microsoft.WindowsLive.Instrumentation.DatapointValueList, error message = " +
                e.message + ", error code = " + e.number);
            return null;
        }

        // Add all the arguments to the list
        for (var i = 0, len = arguments.length; i < len; i++) {
            var value = arguments[i];
            switch (typeof (value)) {
                case "number":
                    if (this._safeCall(valueList, "add", value) === false) {
                        return;
                    }
                    break;
                case "string":
                    if (this._safeCall(valueList, "addString", value) === false) {
                        return;
                    }
                    break;
                default:
                    if (value === null) {
                        if (this._safeCall(valueList, "addString", null) === false) {
                            return;
                        }
                    } else {
                        this._reportError("Invalid input: parameter #" + String(i) + " type is " + typeof (value));
                    }
                    break;
            }
        }
        return valueList;
    };

    // Life-time management

    proto.startExperience = function () {
        /// <summary>
        /// Marks the start of user work with this suite application.
        /// </summary>
        /// <remarks>
        /// Application should call this method soon after it is started. If any other BICI API is called
        /// before that call StartExperience() would be invoked automatically. Multiple calls are OK.
        /// </remarks>

        this._safeCall(this._bici, "startExperience");
    };

    proto.endExperience = function () {
        /// <summary>
        /// Marks the end of user work with this suite application.
        /// </summary>
        /// <remarks>
        /// Application should call this method before exiting the application process. It may also be called
        /// if the application is staying in the background invisible to the user (as good as closed); please
        /// discuss this scenario with BICI team before doing so. Datapoints reported to BICI
        /// after that call are dismissed. If you intend to start another experience after that within the same
        /// process you must call StartExperience() manually (and make sure no datapoints are missed in the gap).
        /// Multiple calls are OK.
        /// </remarks>

        this._safeCall(this._bici, "endExperience");
    };

    proto.pauseExperience = function () {
        /// <summary>
        /// Signals BICI that this suite application is going to be suspended/dehydrated.
        /// </summary>
        /// <remarks>
        /// Application should call this method should when it is notified by PLM (Process Lifetime Manager)
        /// that it's going to be dehydrated. Multiple calls are OK. Datapoints recorded between the first call
        /// to PauseExperience() and the subsequent call to ContinueExperience() might be lost in case where
        /// PLM kills the dehydrated application to free some system resources.
        /// </remarks>

        this._safeCall(this._bici, "pauseExperience");
    };

    proto.continueExperience = function () {
        /// <summary>
        /// Signals BICI that this suite application is no longer or not going to be suspended/dehydrated.
        /// </summary>
        /// <remarks>
        /// Application should call this method when it is notified by PLM that it was rehydrated or that the
        /// dehydration was cancelled. Multiple calls are OK.
        /// </remarks>

        this._safeCall(this._bici, "continueExperience");
    };

    proto.transferExperienceToWeb = function (inputUrl) {
        /// <summary>
        /// Updates the provided URL to include experience Id and referring application Id as query string values.
        /// </summary>
        /// <remarks>
        /// The API also validates that the URL host name ends with .live.com (.live-int.com in non-production build).
        /// In case of validation error the output Url is the set to the value of the input Url.
        /// </remarks>
        /// <param name="inputUrl" type="String">URL to which experience
        /// and application id parameters should be appended.</param>

        return this._safeCall(this._bici, "transferExperienceToWeb", inputUrl);
    };

    // Simple datapoints

    proto.set = function (datapointId, datapointValue) {
        /// <summary>
        /// Sets a DWORD datapoint in the current experience.
        /// </summary>
        /// <remarks>
        /// Application should use the datapoint ID values defined BiciDatapoints.h file (see \ref Ids "Ids definitions").
        ///
        /// When this function is called the first time for a datapoint ID, the value of the datapoint is
        /// initialized to the value passed. If the datapoint already has a value, this function will overwrite it.
        ///
        /// If the datapoind ID was used before for recording a datapoint with a type different than DWORD,
        /// this set operation will fail.
        ///
        /// A DWORD datapoint can also be set using any other DWORD-setting functions. For example a DWORD datapoint
        /// can be initialized to 50 using Set(), then incremented by 10 using Increment() and then averaged with 100
        /// using AddToAverage(). The end value of the datapoint will be ((50 + 10) + 100) / 2 = 80. It is up to the
        /// application to use the DWORD-setting functions in a meaningful way.
        /// </remarks>
        /// <param name="datapointId" type="Number">Datapoint ID</param>
        /// <param name="datapointValue" type="Number">Datapoint value</param>

        this._safeCall(this._bici, "set", datapointId, datapointValue);
        Debug.only(this._logDatapoint("set", datapointId, datapointValue));
    };

    proto.setString = function (datapointId, datapointValue) {
        /// <summary>
        /// Sets a string datapoint in the current experience.
        /// </summary>
        /// <remarks>
        /// Application should use the datapoint ID values defined BiciDatapoints.h file (see \ref Ids "Ids definitions").
        ///
        /// The maximum allowed length for the string is 128 characters, excluding the NULL terminator. If the length
        /// of the string is 128 characters, the string is truncated.
        ///
        /// When this function is called the first time for a datapoint ID, the value of the datapoint is
        /// initialized to the value passed. If the datapoint already has a value, this function will overwrite it.
        ///
        /// If the datapoind ID was used before for recording a datapoint with a type different than string,
        /// this set operation will fail.
        /// </remarks>
        /// <returns>Status code.</returns>
        /// <param name="datapointId" type="Number">Datapoint ID</param>
        /// <param name="datapointValue" type="String">Datapoint value</param>

        this._safeCall(this._bici, "setString", datapointId, datapointValue);
        Debug.only(this._logDatapoint("setString", datapointId, datapointValue));
    };

    // Simple datapoint - Arithmetic

    proto.increment = function (datapointId, increment) {
        /// <summary>
        /// Increments the specified datapoint ID in the current experience session by the specified amount.
        /// </summary>
        /// <remarks>
        /// Application should use the datapoint ID values defined BiciDatapoints.h file (see \ref Ids "Ids definitions").
        ///
        /// When this function is called the first time for a datapoint ID, the value of the datapoint is initialized
        /// to the value incremented.
        ///
        /// If the datapoind ID was used before for recording a datapoint with a type different than DWORD,
        /// this set operation will fail.
        ///
        /// An incrementing datapoint can also be set using any other DWORD-setting functions. For example a DWORD datapoint
        /// can be initialized to 50 using Set(), then incremented by 10 using Increment() and then averaged with 100
        /// using AddToAverage(). The end value of the datapoint will be ((50 + 10) + 100) / 2 = 80. It is up to the
        /// application to use the DWORD-setting functions in a meaningful way.
        /// </remarks>
        /// <param name="datapointId" type="Number">Datapoint ID</param>
        /// <param name="increment" type="Number">Datapoint increment value</param>

        this._safeCall(this._bici, "increment", datapointId, increment);
        Debug.only(this._logDatapoint("increment", datapointId, increment));
    };

    // Stream datapoints

    proto.addToStream = /*@varargs*/function (datapointId, /*@dynamic*/datapointValue) {
        /// <summary>
        /// Adds a single stream row entry to a stream datapoint.
        /// </summary>
        /// <remarks>
        /// Application should use the datapoint ID values defined BiciDatapoints.h file (see \ref Ids "Ids definitions").
        ///
        /// Once the stream is initialized by adding a row entry to it, the number of columns in the row is set and cannot
        /// be changed: all subsequent rows must have the same number of columns. Similarly, the data types of columns are
        /// set and cannot be changed: if row 0 has types DWORD String DWORD, all subsequent rows must have the same types,
        /// in this exact order.
        /// </remarks>
        /// <param name="datapointId" type="Number">Datapoint ID</param>
        /// <param name="datapointValue" parameterArray="true">One or more stream datapoint values</param>

        if (datapointId === undefined) {
            // Not enough arguments - it's an error
            this._reportError("Invalid input: parameter datapointId is undefined");
            return;
        }

        if (datapointValue === undefined) {
            // Not enough arguments - it's an error
            this._reportError("Invalid input: parameter datapointValue is undefined");
            return;
        }

        var datapointValues = Array.prototype.slice.call(arguments, 1),
            valueList = this._createValueList.apply(this, datapointValues);
        this._safeCall(this._bici, "addToStream", datapointId, valueList);
        Debug.only(this._logDatapoint.apply(this, ["addToStream", datapointId].concat(datapointValues)));
    };

    // Common datapoints, etc.

    proto.getExperienceId = function () {
        /// <summary>
        /// Returns the current Experience Id.
        /// </summary>
        /// <remarks>
        /// Experience is the period of user's (defined as Windows account) interaction with the suite.
        /// Experience starts when the user launches/invokes/activates any of the modern WL suite UI application.
        /// Experience ends when all such UI applications have exited. Tracking the boundaries of the experience
        /// is the responsibility between the suite applications and BICI library. There are 4 APIs used to manage
        /// the experience boundaries - StartExperience(), EndExperience(), PauseExperience() and ContinueExperience(),
        /// each application has to invoke these to signal its own lifetime events and BICI will take care of
        /// aggregating these calls and managing the experience boundaries suite-wide.
        /// </remarks>

        var result = this._safeCall(this._bici, "getExperienceId");
        if (result === false) {
            return null;
        }

        return result;
    };

    proto.getApplicationId = function () {
        /// <summary>
        /// Returns the current Application Id.
        /// </summary>
        /// <remarks>
        /// Application Id is an integer assigned to the current application based on it identity value
        /// The value is automatically detected when the experience is started. It could be overwritten if
        /// the detection logic does not work for this application (which is the case for WLCOMM process)
        /// </remarks>

        var result = null;
        if (this._bici !== null && this._bici !== undefined) {
            try {
                result = this._bici.applicationId;
            }
            catch (e) {
                this._reportError("Failed to get applicationId, error message = " +
                e.message + ", error code = " + e.number);
                result = null;
            }
        }

        return result;
    };

    // QoS instrumentation

    proto.recordDependentApiQos = /*@varargs*/function (scenario, api, target, durationInMillisecond, requestSizeInBytes, returnCode, returnType, transactionID) {
        /// <summary>
        /// Records the QoS of the dependent API
        /// </summary>
        /// <remarks>
        /// This API uses SQM V3 Stream to write the provided input parameters. The number of custom datapaoints provided
        /// in datapointValue must be same for a particular scenario. This API uses the ScenarioId as the datapoint Id
        /// to log the stream row in the SQM file.
        /// </remarks>
        /// <param name="scenario">Id of the Scenario being executed</param>
        /// <param name="api">Id of the Api being executed</param>
        /// <param name="target"> Id of the Dependent property exposing the API</param>
        /// <param name="durationInMillisecond">Duration in millisecond to execute the API</param>
        /// <param name="requestSizeInBytes">Size of the request in bytes</param>
        /// <param name="returnCode">API return code</param>
        /// <param name="returnType">Categorization of the return code as returned by the API</param>
        /// <param name="transactionID">TransactionId associated with this API call</param>
        /// <param name="datapointValue" parameterArray="true">Custom context to be logged with this API</param>
        Debug.assert(Jx.isNumber(scenario) && Jx.isNumber(api) && Jx.isNumber(target) && Jx.isNumber(durationInMillisecond) && Jx.isNumber(requestSizeInBytes) && Jx.isNumber(returnCode) && Jx.isNumber(returnType));

        var valueList = this._createValueList.apply(this, Array.prototype.slice.call(arguments, 8));
        this._safeCall(this._bici, "recordDependentApiQos", scenario, api, target, durationInMillisecond, requestSizeInBytes, returnCode, returnType, transactionID, valueList);
        Debug.only(this._logQoS("recordDependentApiQos", scenario, Array.prototype.slice.call(arguments, 1)));
    };

    proto.recordIncomingApiQos = /*@varargs*/function (scenario, api, callerProperty, durationInMillisecond, requestSizeInBytes, returnCode, returnType, transactionID) {
        /// <summary>
        /// Records the QoS of the Incoming API (API exposed by the application for invocation by external property)
        /// </summary>
        /// <remarks>
        /// This API uses SQM V3 Stream to write the provided input parameters. The number of custom datapaoints provided
        /// in datapointValue must be same for a particular scenario. This API uses the ScenarioId as the datapoint Id
        /// to log the stream row in the SQM file.
        /// </remarks>
        /// <param name="scenario">Id of the Scenario being executed</param>
        /// <param name="api">Id of the Api being executed</param>
        /// <param name="callerProperty">Id of the Property which invoked the API (i.e., the caller property)</param>
        /// <param name="durationInMillisecond">Duration in millisecond to execute the API</param>
        /// <param name="requestSizeInBytes">Size of the request in bytes</param>
        /// <param name="returnCode">API return code</param>
        /// <param name="returnType">Categorization of the return code as returned by the API</param>
        /// <param name="transactionID">TransactionId associated with this API call</param>
        /// <param name="datapointValue" parameterArray="true">Custom context to be logged with this API</param>
        Debug.assert(Jx.isNumber(scenario) && Jx.isNumber(api) && Jx.isNumber(callerProperty) && Jx.isNumber(durationInMillisecond) && Jx.isNumber(requestSizeInBytes) && Jx.isNumber(returnCode) && Jx.isNumber(returnType));

        var valueList = this._createValueList.apply(this, Array.prototype.slice.call(arguments, 8));
        this._safeCall(this._bici, "recordIncomingApiQos", scenario, api, callerProperty, durationInMillisecond, requestSizeInBytes, returnCode, returnType, transactionID, valueList);
        Debug.only(this._logQoS("recordIncomingApiQos", scenario, Array.prototype.slice.call(arguments, 1)));
    };

    proto.recordInternalApiQos = /*@varargs*/function (scenario, api, durationInMillisecond, requestSizeInBytes, returnCode, returnType, transactionID) {
        /// <summary>
        /// Records the QoS of Internal API. In contrast to RecordIncomingApiQos, use this API to instrument the QoS of
        /// the API that is invoked by the instrumented application internally as part of instrumented scenario.
        /// </summary>
        /// <remarks>
        /// This API uses SQM V3 Stream to write the provided input parameters. The number of custom datapaoints provided
        /// in datapointValue must be same for a particular scenario. This API uses the ScenarioId as the datapoint Id
        /// to log the stream row in the SQM file.
        /// </remarks>
        /// <param name="scenario">Id of the Scenario being executed</param>
        /// <param name="api">Id of the Api being executed</param>
        /// <param name="durationInMillisecond">Duration in millisecond to execute the API</param>
        /// <param name="requestSizeInBytes">Size of the request in bytes</param>
        /// <param name="returnCode">API return code</param>
        /// <param name="returnType">Categorization of the return code as returned by the API</param>
        /// <param name="transactionID">TransactionId associated with this API call</param>
        /// <param name="datapointValue" parameterArray="true">Custom context to be logged with this API</param>

        Debug.assert(Jx.isNumber(scenario) && Jx.isNumber(api) && Jx.isNumber(durationInMillisecond) && Jx.isNumber(requestSizeInBytes) && Jx.isNumber(returnCode) && Jx.isNumber(returnType));

        var valueList = this._createValueList.apply(this, Array.prototype.slice.call(arguments, 7));
        this._safeCall(this._bici, "recordInternalApiQos", scenario, api, durationInMillisecond, requestSizeInBytes, returnCode, returnType, transactionID, valueList);
        Debug.only(this._logQoS("recordInternalApiQos", scenario, Array.prototype.slice.call(arguments, 1)));
    };

    proto.recordScenarioQos = /*@varargs*/function (scenario, durationInMillisecond, requestSizeInBytes, returnCode, returnType, transactionID) {
        /// <summary>
        /// Records the QoS of the Scenario. A single scenario may involve invocation of multiple incoming/internal/dependent APIs.
        /// Invocation of this API marks the completion of the scenario.
        /// </summary>
        /// <remarks>
        /// This API uses SQM V3 Stream to write the provided input parameters. The number of custom datapaoints provided
        /// in datapointValue must be same for a particular scenario. This API uses the ScenarioId as the datapoint Id
        /// to log the stream row in the SQM file.
        /// </remarks>
        /// <param name="scenario">Id of the Scenario being executed</param>
        /// <param name="durationInMillisecond">Duration in millisecond to execute the API</param>
        /// <param name="requestSizeInBytes">Size of the request in bytes</param>
        /// <param name="returnCode">API return code</param>
        /// <param name="returnType">Categorization of the return code as returned by the API</param>
        /// <param name="transactionID">TransactionId associated with this API call</param>
        /// <param name="datapointValue" parameterArray="true">Custom context to be logged with this API</param>

        // TODO: fix the returnType assert
        Debug.assert(Jx.isNumber(scenario) && Jx.isNumber(durationInMillisecond) && Jx.isNumber(requestSizeInBytes) && Jx.isNumber(returnCode) /*&& Jx.isNumber(returnType)*/);

        var valueList = this._createValueList.apply(this, Array.prototype.slice.call(arguments, 6));
        this._safeCall(this._bici, "recordScenarioQos", scenario, durationInMillisecond, requestSizeInBytes, returnCode, returnType, transactionID, valueList);
        Debug.only(this._logQoS("recordScenarioQos", scenario, Array.prototype.slice.call(arguments, 1)));
    };

    

    // Test Helpers

    Jx.Bici._cachedDatapointNames = { };
    Jx.Bici._cachedScenarioNames = { };

    proto._datapointIdToString = function (datapointId) {
        var datapointIdString = String(datapointId), // Workaround WinBlue 265130 - Accessing the object with a numeric key crashes JScript9
            datapointName = Jx.Bici._cachedDatapointNames[datapointIdString],
            InstrumentationIds = Microsoft.WindowsLive.Instrumentation.Ids;
        if (!datapointName) {
            for (var type in InstrumentationIds) {
                for (var datapoint in InstrumentationIds[type]) {
                    if (InstrumentationIds[type][datapoint] === datapointId) {
                        datapointName = type + "." + datapoint;
                        break;
                    }
                }
            }

            Debug.assert(Jx.isNonEmptyString(datapointName), "Unknown data point value");
            Jx.Bici._cachedDatapointNames[datapointIdString] = datapointName;
        }

        return datapointName;
    };

    proto._scenarioIdToString = function (scenarioId) {
        var scenarioIdString = String(scenarioId), // Workaround WinBlue 265130 - Accessing the object with a numeric key crashes JScript9
            scenarioName = Jx.Bici._cachedScenarioNames[scenarioIdString],
            ScenarioIds = Microsoft.WindowsLive.Instrumentation.ScenarioId;
        if (!scenarioName) {
            for (scenarioName in ScenarioIds) {
                if (ScenarioIds[scenarioName] === scenarioId) {
                    break;
                }
            }

            Debug.assert(Jx.isNonEmptyString(scenarioName), "Unknown scenario value");
            Jx.Bici._cachedScenarioNames[scenarioIdString] = scenarioName;
        }

        return scenarioName;
    };

    proto._logDatapoint = function (method, datapointId, /*@dynamic*/value) {
        Debug.assert(Jx.isNonEmptyString(method));
        Debug.assert(Jx.isValidNumber(datapointId));

        var formattedString = method + "," + this._datapointIdToString(datapointId);
        if (arguments.length === 3) {
            formattedString += "," + String(value);
        } else if (arguments.length > 3) {
            formattedString += ",[" + Array.prototype.slice.call(arguments, 2).join(",") +"]";
        }

        Jx.mark(formattedString + ",Info,Jx,Bici");
    };

    proto._logQoS = function (method, scenarioId) {
        Debug.assert(Jx.isNonEmptyString(method));
        Debug.assert(Jx.isValidNumber(scenarioId));

        var formattedString = method + "," + this._scenarioIdToString(scenarioId);
        if (arguments.length >= 3) {
            formattedString += "," + Array.prototype.slice.call(arguments, 2).join(",");
        }

        Jx.mark(formattedString + ",Info,Jx,Bici");
    };

    proto.reloadConfig = function () {
        /// <summary>
        /// Forces Bici to reload its configuration from bici.xml and LocalSettings.
        /// </summary>
        /// <remarks>
        /// Calling this API does not affect the ongoing uploads.
        /// The call competes with other consumers or configuration and would be blocked until the configuration is released by them.
        /// E.g. retry/cleanup thread would take a reader lock on config which would block this call until the lock is released.
        /// </remarks>

        Jx.Bici._cachedDatapointNames = { };
        Jx.Bici._cachedScenarioNames = { };

        this._safeCall(this._bici, "reloadConfig");
    };

    proto.getErrorsFound = function () {
        /// <summary>
        /// Returns flag which is set to true if preventable errors were found since the last check.
        /// Preventable errors are errors which are within our control and should be looked into.
        /// E.g. datapoint validation errors or invalid arguments passed in.
        /// The property is read/write to allow callers reset it between test runs.
        /// </summary>

        var object = this._bici;
        if (object) {
            return object.errorsFound;
        }
        return false;
    };

    proto.setErrorsFound = function (value) {
        /// <summary>
        /// Assigns a new value to the flag which is set to true if preventable errors were found since the last check.
        /// Preventable errors are errors which are within our control and should be looked into.
        /// E.g. datapoint validation errors or invalid arguments passed in.
        /// The property is read/write to allow callers reset it between test runs.
        /// </summary>
        /// <param name="value" type="Boolean">New value to apply.</param>

        var object = this._bici;
        if (object) {
            object.errorsFound = value;
        }
    };

    // Debugging API
    proto.clearLog = function () {
        this._safeCall(this._bici, "clearLog");
    };

    proto.getLog = function () {
        return this._safeCall(this._bici, "getLog");
    };

    proto.testLinking = function () {
        return "OK";
    };

    proto.testLoading = function () {
        var text;

        try {
            var bici = new Microsoft.WindowsLive.Instrumentation.Bici();
            text = bici.testLoading();
        }
        catch (e) {

            var obj = e;
            text = "";

            for (var propName in obj) {

                var propVal = "";
                try {
                    propVal = obj[propName];
                } catch (e2) {
                    propVal = "Error: " + e2;
                }

                text += (propName + "=" + propVal + "; ");
            }
        }

        return text;
    };
    


    // The BICI instrumentation object, the default is Jx.Bici
    Jx.bici = /*@static_cast(Jx.Bici)*/null;

});
//
// Copyright (C) Microsoft. All rights reserved.
//
//
// Bidi.js is a convenient way to provide help in determining direction of text. 
//

/*global Jx, Debug*/
Jx.delayDefine(Jx, "Bidi", function () {
    var bidiTable = Jx._Biditable;

    var CharIterator = function (string) {
        /// <summary>
        /// Iterator that will go through each character of a string
        /// and return the charcode. Handles surrogates correctly, but
        /// will return values above 0xFFFF.
        /// </summary>
        /// <param name="string" type="String">string to parse</param>
        this._str = string;
        this._index = 0;
        this._length = string.length;
    };

    CharIterator.prototype.nextCharCode = function () {
        /// <summary>
        /// Returns null if no other character is found.
        /// Otherwise, returns the numeric value of the charcode of the next
        /// character. Handles surrogate pairs automatically, but does return values over uFFFF
        /// </summary>
        /// <returns type="Number">Charcode or null</returns>

        if (this._index >= this._length) {
            return null;
        }

        var charCode = this._str[this._index++];

        // Do some pre-filtering on character codes that are useless. This reduces
        // table lookups
        while (/\s\d/.test(charCode)) {
            if (this._index >= this._length) {
                return null;
            }
            // Ignore spaces and numbers
            charCode = this._str[this._index++];
        }

        if (/[\uD800-\uDFFF]/.test(charCode)) {
            // This range represents the special range for high surrogates
            // That means we need another character to form the complete letter
            if (this._index >= this._length) {
                return null;
            }
            var lc = this._str[this._index++];
            // charCode is the high code and lc is the low code
            charCode = charCode.charCodeAt(0);
            lc = lc.charCodeAt(0);
            charCode = this._combineSurrogatePair(charCode, lc);
        } else {
            charCode = charCode.charCodeAt(0);
        }

        return charCode;
    };

    CharIterator.prototype._combineSurrogatePair = function (high, low) {
        return 0x10000 + ((high - 0xD800) * 0x400) + (low - 0xDC00);
    };

    function checkInRange(charCode, values) {
        /// <summary>
        /// Recursively checks if charCode is in the set of values
        /// </summary>
        /// <param name="charCode" type="Number">CharCode to be checked</param>
        /// <param name="values" type="Array">Array of values, pulled from the unicode_json_table</param>
        /// <returns type="String">LTR|RTL|Null</returns>
        for (var i = 0, length = values.length; i < length; i++) {
            var numRange = values[i];
            if (numRange.start <= charCode && numRange.end >= charCode) {
                if (numRange.direction) {
                    return numRange.direction;
                } else {
                    return checkInRange(charCode, numRange.values);
                }
            }
        }

        return null;
    }

    var Bidi = Jx.Bidi = {
        getTextDirection: function (text) {
            /// <summary>
            /// Analyzes the given test for a first strong character. Uses the unicode bidi table to check.
            /// </summary>
            /// <param name="text" type="String">Text to be analyzed </param>
            /// <returns type="String">LTR|RTL|None</returns>
            Debug.assert(Jx.isString(text));

            var iter = new CharIterator(text),
                curr,
                result;

            curr = iter.nextCharCode();
            while (curr) {
                result = checkInRange(curr, bidiTable);
                if (result !== null) {
                    return result;
                }
                curr = iter.nextCharCode();
            }

            // Return None of no value was found
            return Bidi.Values.none;
        },
        getDocumentDirection: function (doc) {
            /// <summary> 
            /// This checks the document and body element for direction,
            /// returns an empty string if it is not found.
            /// </summary>
            /// <param name="doc" type="HTMLDocument"></param>
            /// <returns type="String">LTR|RTL|''</returns>
            Debug.assert(Jx.isObject(doc));

            return Bidi.getElementDirection(doc.documentElement) || Bidi.getElementDirection(doc.body);
        },
        getElementDirection: function (element) {
            /// <summary>
            /// Checks if an element has a direction specified in the inline style
            /// or as a dir attribute and returns it.
            /// </summary>
            /// <param name="doc" type="HTMLElement"></param>
            /// <returns type="String">LTR|RTL|''</returns>
            Debug.assert(Jx.isHTMLElement(element));
            return element.dir || element.style.direction;
        },
        Values: {
            ltr: "ltr",
            rtl: "rtl",
            none: "none"
        }
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// 
// This file was autogenerated by inbox\build\tools\GenerateBiDiTable.cmd.
//

/*global Jx*/

Jx.delayDefine(Jx, "_Biditable", function () {
    Jx._Biditable = 
        [
            {
                "start": 65,
                "end": 2307,
                "values": [
                    {
                        "start": 65,
                        "end": 660,
                        "values": [
                            {
                                "start": 65,
                                "end": 90,
                                "direction": "ltr"
                            },
                            {
                                "start": 97,
                                "end": 122,
                                "direction": "ltr"
                            },
                            {
                                "start": 170,
                                "end": 170,
                                "direction": "ltr"
                            },
                            {
                                "start": 181,
                                "end": 181,
                                "direction": "ltr"
                            },
                            {
                                "start": 186,
                                "end": 186,
                                "direction": "ltr"
                            },
                            {
                                "start": 192,
                                "end": 214,
                                "direction": "ltr"
                            },
                            {
                                "start": 216,
                                "end": 246,
                                "direction": "ltr"
                            },
                            {
                                "start": 248,
                                "end": 442,
                                "direction": "ltr"
                            },
                            {
                                "start": 443,
                                "end": 443,
                                "direction": "ltr"
                            },
                            {
                                "start": 444,
                                "end": 447,
                                "direction": "ltr"
                            },
                            {
                                "start": 448,
                                "end": 451,
                                "direction": "ltr"
                            },
                            {
                                "start": 452,
                                "end": 659,
                                "direction": "ltr"
                            },
                            {
                                "start": 660,
                                "end": 660,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 661,
                        "end": 908,
                        "values": [
                            {
                                "start": 661,
                                "end": 687,
                                "direction": "ltr"
                            },
                            {
                                "start": 688,
                                "end": 696,
                                "direction": "ltr"
                            },
                            {
                                "start": 699,
                                "end": 705,
                                "direction": "ltr"
                            },
                            {
                                "start": 720,
                                "end": 721,
                                "direction": "ltr"
                            },
                            {
                                "start": 736,
                                "end": 740,
                                "direction": "ltr"
                            },
                            {
                                "start": 750,
                                "end": 750,
                                "direction": "ltr"
                            },
                            {
                                "start": 880,
                                "end": 883,
                                "direction": "ltr"
                            },
                            {
                                "start": 886,
                                "end": 887,
                                "direction": "ltr"
                            },
                            {
                                "start": 890,
                                "end": 890,
                                "direction": "ltr"
                            },
                            {
                                "start": 891,
                                "end": 893,
                                "direction": "ltr"
                            },
                            {
                                "start": 902,
                                "end": 902,
                                "direction": "ltr"
                            },
                            {
                                "start": 904,
                                "end": 906,
                                "direction": "ltr"
                            },
                            {
                                "start": 908,
                                "end": 908,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 910,
                        "end": 1470,
                        "values": [
                            {
                                "start": 910,
                                "end": 929,
                                "direction": "ltr"
                            },
                            {
                                "start": 931,
                                "end": 1013,
                                "direction": "ltr"
                            },
                            {
                                "start": 1015,
                                "end": 1153,
                                "direction": "ltr"
                            },
                            {
                                "start": 1154,
                                "end": 1154,
                                "direction": "ltr"
                            },
                            {
                                "start": 1162,
                                "end": 1319,
                                "direction": "ltr"
                            },
                            {
                                "start": 1329,
                                "end": 1366,
                                "direction": "ltr"
                            },
                            {
                                "start": 1369,
                                "end": 1369,
                                "direction": "ltr"
                            },
                            {
                                "start": 1370,
                                "end": 1375,
                                "direction": "ltr"
                            },
                            {
                                "start": 1377,
                                "end": 1415,
                                "direction": "ltr"
                            },
                            {
                                "start": 1417,
                                "end": 1417,
                                "direction": "ltr"
                            },
                            {
                                "start": 1424,
                                "end": 1424,
                                "direction": "rtl"
                            },
                            {
                                "start": 1470,
                                "end": 1470,
                                "direction": "rtl"
                            }
                        ]
                    },
                    {
                        "start": 1472,
                        "end": 1547,
                        "values": [
                            {
                                "start": 1472,
                                "end": 1472,
                                "direction": "rtl"
                            },
                            {
                                "start": 1475,
                                "end": 1475,
                                "direction": "rtl"
                            },
                            {
                                "start": 1478,
                                "end": 1478,
                                "direction": "rtl"
                            },
                            {
                                "start": 1480,
                                "end": 1487,
                                "direction": "rtl"
                            },
                            {
                                "start": 1488,
                                "end": 1514,
                                "direction": "rtl"
                            },
                            {
                                "start": 1515,
                                "end": 1519,
                                "direction": "rtl"
                            },
                            {
                                "start": 1520,
                                "end": 1522,
                                "direction": "rtl"
                            },
                            {
                                "start": 1523,
                                "end": 1524,
                                "direction": "rtl"
                            },
                            {
                                "start": 1525,
                                "end": 1535,
                                "direction": "rtl"
                            },
                            {
                                "start": 1541,
                                "end": 1541,
                                "direction": "rtl"
                            },
                            {
                                "start": 1544,
                                "end": 1544,
                                "direction": "rtl"
                            },
                            {
                                "start": 1547,
                                "end": 1547,
                                "direction": "rtl"
                            }
                        ]
                    },
                    {
                        "start": 1549,
                        "end": 1749,
                        "values": [
                            {
                                "start": 1549,
                                "end": 1549,
                                "direction": "rtl"
                            },
                            {
                                "start": 1563,
                                "end": 1563,
                                "direction": "rtl"
                            },
                            {
                                "start": 1564,
                                "end": 1565,
                                "direction": "rtl"
                            },
                            {
                                "start": 1566,
                                "end": 1567,
                                "direction": "rtl"
                            },
                            {
                                "start": 1568,
                                "end": 1599,
                                "direction": "rtl"
                            },
                            {
                                "start": 1600,
                                "end": 1600,
                                "direction": "rtl"
                            },
                            {
                                "start": 1601,
                                "end": 1610,
                                "direction": "rtl"
                            },
                            {
                                "start": 1645,
                                "end": 1645,
                                "direction": "rtl"
                            },
                            {
                                "start": 1646,
                                "end": 1647,
                                "direction": "rtl"
                            },
                            {
                                "start": 1649,
                                "end": 1747,
                                "direction": "rtl"
                            },
                            {
                                "start": 1748,
                                "end": 1748,
                                "direction": "rtl"
                            },
                            {
                                "start": 1749,
                                "end": 1749,
                                "direction": "rtl"
                            }
                        ]
                    },
                    {
                        "start": 1765,
                        "end": 1957,
                        "values": [
                            {
                                "start": 1765,
                                "end": 1766,
                                "direction": "rtl"
                            },
                            {
                                "start": 1774,
                                "end": 1775,
                                "direction": "rtl"
                            },
                            {
                                "start": 1786,
                                "end": 1788,
                                "direction": "rtl"
                            },
                            {
                                "start": 1789,
                                "end": 1790,
                                "direction": "rtl"
                            },
                            {
                                "start": 1791,
                                "end": 1791,
                                "direction": "rtl"
                            },
                            {
                                "start": 1792,
                                "end": 1805,
                                "direction": "rtl"
                            },
                            {
                                "start": 1806,
                                "end": 1806,
                                "direction": "rtl"
                            },
                            {
                                "start": 1807,
                                "end": 1807,
                                "direction": "rtl"
                            },
                            {
                                "start": 1808,
                                "end": 1808,
                                "direction": "rtl"
                            },
                            {
                                "start": 1810,
                                "end": 1839,
                                "direction": "rtl"
                            },
                            {
                                "start": 1867,
                                "end": 1868,
                                "direction": "rtl"
                            },
                            {
                                "start": 1869,
                                "end": 1957,
                                "direction": "rtl"
                            }
                        ]
                    },
                    {
                        "start": 1969,
                        "end": 2095,
                        "values": [
                            {
                                "start": 1969,
                                "end": 1969,
                                "direction": "rtl"
                            },
                            {
                                "start": 1970,
                                "end": 1983,
                                "direction": "rtl"
                            },
                            {
                                "start": 1984,
                                "end": 1993,
                                "direction": "rtl"
                            },
                            {
                                "start": 1994,
                                "end": 2026,
                                "direction": "rtl"
                            },
                            {
                                "start": 2036,
                                "end": 2037,
                                "direction": "rtl"
                            },
                            {
                                "start": 2042,
                                "end": 2042,
                                "direction": "rtl"
                            },
                            {
                                "start": 2043,
                                "end": 2047,
                                "direction": "rtl"
                            },
                            {
                                "start": 2048,
                                "end": 2069,
                                "direction": "rtl"
                            },
                            {
                                "start": 2074,
                                "end": 2074,
                                "direction": "rtl"
                            },
                            {
                                "start": 2084,
                                "end": 2084,
                                "direction": "rtl"
                            },
                            {
                                "start": 2088,
                                "end": 2088,
                                "direction": "rtl"
                            },
                            {
                                "start": 2094,
                                "end": 2095,
                                "direction": "rtl"
                            }
                        ]
                    },
                    {
                        "start": 2096,
                        "end": 2307,
                        "values": [
                            {
                                "start": 2096,
                                "end": 2110,
                                "direction": "rtl"
                            },
                            {
                                "start": 2111,
                                "end": 2111,
                                "direction": "rtl"
                            },
                            {
                                "start": 2112,
                                "end": 2136,
                                "direction": "rtl"
                            },
                            {
                                "start": 2140,
                                "end": 2141,
                                "direction": "rtl"
                            },
                            {
                                "start": 2142,
                                "end": 2142,
                                "direction": "rtl"
                            },
                            {
                                "start": 2143,
                                "end": 2207,
                                "direction": "rtl"
                            },
                            {
                                "start": 2208,
                                "end": 2208,
                                "direction": "rtl"
                            },
                            {
                                "start": 2209,
                                "end": 2209,
                                "direction": "rtl"
                            },
                            {
                                "start": 2210,
                                "end": 2220,
                                "direction": "rtl"
                            },
                            {
                                "start": 2221,
                                "end": 2275,
                                "direction": "rtl"
                            },
                            {
                                "start": 2303,
                                "end": 2303,
                                "direction": "rtl"
                            },
                            {
                                "start": 2307,
                                "end": 2307,
                                "direction": "ltr"
                            }
                        ]
                    }
                ]
            },
            {
                "start": 2308,
                "end": 3058,
                "values": [
                    {
                        "start": 2308,
                        "end": 2423,
                        "values": [
                            {
                                "start": 2308,
                                "end": 2361,
                                "direction": "ltr"
                            },
                            {
                                "start": 2363,
                                "end": 2363,
                                "direction": "ltr"
                            },
                            {
                                "start": 2365,
                                "end": 2365,
                                "direction": "ltr"
                            },
                            {
                                "start": 2366,
                                "end": 2368,
                                "direction": "ltr"
                            },
                            {
                                "start": 2377,
                                "end": 2380,
                                "direction": "ltr"
                            },
                            {
                                "start": 2382,
                                "end": 2383,
                                "direction": "ltr"
                            },
                            {
                                "start": 2384,
                                "end": 2384,
                                "direction": "ltr"
                            },
                            {
                                "start": 2392,
                                "end": 2401,
                                "direction": "ltr"
                            },
                            {
                                "start": 2404,
                                "end": 2405,
                                "direction": "ltr"
                            },
                            {
                                "start": 2406,
                                "end": 2415,
                                "direction": "ltr"
                            },
                            {
                                "start": 2416,
                                "end": 2416,
                                "direction": "ltr"
                            },
                            {
                                "start": 2417,
                                "end": 2417,
                                "direction": "ltr"
                            },
                            {
                                "start": 2418,
                                "end": 2423,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 2425,
                        "end": 2510,
                        "values": [
                            {
                                "start": 2425,
                                "end": 2431,
                                "direction": "ltr"
                            },
                            {
                                "start": 2434,
                                "end": 2435,
                                "direction": "ltr"
                            },
                            {
                                "start": 2437,
                                "end": 2444,
                                "direction": "ltr"
                            },
                            {
                                "start": 2447,
                                "end": 2448,
                                "direction": "ltr"
                            },
                            {
                                "start": 2451,
                                "end": 2472,
                                "direction": "ltr"
                            },
                            {
                                "start": 2474,
                                "end": 2480,
                                "direction": "ltr"
                            },
                            {
                                "start": 2482,
                                "end": 2482,
                                "direction": "ltr"
                            },
                            {
                                "start": 2486,
                                "end": 2489,
                                "direction": "ltr"
                            },
                            {
                                "start": 2493,
                                "end": 2493,
                                "direction": "ltr"
                            },
                            {
                                "start": 2494,
                                "end": 2496,
                                "direction": "ltr"
                            },
                            {
                                "start": 2503,
                                "end": 2504,
                                "direction": "ltr"
                            },
                            {
                                "start": 2507,
                                "end": 2508,
                                "direction": "ltr"
                            },
                            {
                                "start": 2510,
                                "end": 2510,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 2519,
                        "end": 2608,
                        "values": [
                            {
                                "start": 2519,
                                "end": 2519,
                                "direction": "ltr"
                            },
                            {
                                "start": 2524,
                                "end": 2525,
                                "direction": "ltr"
                            },
                            {
                                "start": 2527,
                                "end": 2529,
                                "direction": "ltr"
                            },
                            {
                                "start": 2534,
                                "end": 2543,
                                "direction": "ltr"
                            },
                            {
                                "start": 2544,
                                "end": 2545,
                                "direction": "ltr"
                            },
                            {
                                "start": 2548,
                                "end": 2553,
                                "direction": "ltr"
                            },
                            {
                                "start": 2554,
                                "end": 2554,
                                "direction": "ltr"
                            },
                            {
                                "start": 2563,
                                "end": 2563,
                                "direction": "ltr"
                            },
                            {
                                "start": 2565,
                                "end": 2570,
                                "direction": "ltr"
                            },
                            {
                                "start": 2575,
                                "end": 2576,
                                "direction": "ltr"
                            },
                            {
                                "start": 2579,
                                "end": 2600,
                                "direction": "ltr"
                            },
                            {
                                "start": 2602,
                                "end": 2608,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 2610,
                        "end": 2728,
                        "values": [
                            {
                                "start": 2610,
                                "end": 2611,
                                "direction": "ltr"
                            },
                            {
                                "start": 2613,
                                "end": 2614,
                                "direction": "ltr"
                            },
                            {
                                "start": 2616,
                                "end": 2617,
                                "direction": "ltr"
                            },
                            {
                                "start": 2622,
                                "end": 2624,
                                "direction": "ltr"
                            },
                            {
                                "start": 2649,
                                "end": 2652,
                                "direction": "ltr"
                            },
                            {
                                "start": 2654,
                                "end": 2654,
                                "direction": "ltr"
                            },
                            {
                                "start": 2662,
                                "end": 2671,
                                "direction": "ltr"
                            },
                            {
                                "start": 2674,
                                "end": 2676,
                                "direction": "ltr"
                            },
                            {
                                "start": 2691,
                                "end": 2691,
                                "direction": "ltr"
                            },
                            {
                                "start": 2693,
                                "end": 2701,
                                "direction": "ltr"
                            },
                            {
                                "start": 2703,
                                "end": 2705,
                                "direction": "ltr"
                            },
                            {
                                "start": 2707,
                                "end": 2728,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 2730,
                        "end": 2819,
                        "values": [
                            {
                                "start": 2730,
                                "end": 2736,
                                "direction": "ltr"
                            },
                            {
                                "start": 2738,
                                "end": 2739,
                                "direction": "ltr"
                            },
                            {
                                "start": 2741,
                                "end": 2745,
                                "direction": "ltr"
                            },
                            {
                                "start": 2749,
                                "end": 2749,
                                "direction": "ltr"
                            },
                            {
                                "start": 2750,
                                "end": 2752,
                                "direction": "ltr"
                            },
                            {
                                "start": 2761,
                                "end": 2761,
                                "direction": "ltr"
                            },
                            {
                                "start": 2763,
                                "end": 2764,
                                "direction": "ltr"
                            },
                            {
                                "start": 2768,
                                "end": 2768,
                                "direction": "ltr"
                            },
                            {
                                "start": 2784,
                                "end": 2785,
                                "direction": "ltr"
                            },
                            {
                                "start": 2790,
                                "end": 2799,
                                "direction": "ltr"
                            },
                            {
                                "start": 2800,
                                "end": 2800,
                                "direction": "ltr"
                            },
                            {
                                "start": 2818,
                                "end": 2819,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 2821,
                        "end": 2903,
                        "values": [
                            {
                                "start": 2821,
                                "end": 2828,
                                "direction": "ltr"
                            },
                            {
                                "start": 2831,
                                "end": 2832,
                                "direction": "ltr"
                            },
                            {
                                "start": 2835,
                                "end": 2856,
                                "direction": "ltr"
                            },
                            {
                                "start": 2858,
                                "end": 2864,
                                "direction": "ltr"
                            },
                            {
                                "start": 2866,
                                "end": 2867,
                                "direction": "ltr"
                            },
                            {
                                "start": 2869,
                                "end": 2873,
                                "direction": "ltr"
                            },
                            {
                                "start": 2877,
                                "end": 2877,
                                "direction": "ltr"
                            },
                            {
                                "start": 2878,
                                "end": 2878,
                                "direction": "ltr"
                            },
                            {
                                "start": 2880,
                                "end": 2880,
                                "direction": "ltr"
                            },
                            {
                                "start": 2887,
                                "end": 2888,
                                "direction": "ltr"
                            },
                            {
                                "start": 2891,
                                "end": 2892,
                                "direction": "ltr"
                            },
                            {
                                "start": 2903,
                                "end": 2903,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 2908,
                        "end": 2972,
                        "values": [
                            {
                                "start": 2908,
                                "end": 2909,
                                "direction": "ltr"
                            },
                            {
                                "start": 2911,
                                "end": 2913,
                                "direction": "ltr"
                            },
                            {
                                "start": 2918,
                                "end": 2927,
                                "direction": "ltr"
                            },
                            {
                                "start": 2928,
                                "end": 2928,
                                "direction": "ltr"
                            },
                            {
                                "start": 2929,
                                "end": 2929,
                                "direction": "ltr"
                            },
                            {
                                "start": 2930,
                                "end": 2935,
                                "direction": "ltr"
                            },
                            {
                                "start": 2947,
                                "end": 2947,
                                "direction": "ltr"
                            },
                            {
                                "start": 2949,
                                "end": 2954,
                                "direction": "ltr"
                            },
                            {
                                "start": 2958,
                                "end": 2960,
                                "direction": "ltr"
                            },
                            {
                                "start": 2962,
                                "end": 2965,
                                "direction": "ltr"
                            },
                            {
                                "start": 2969,
                                "end": 2970,
                                "direction": "ltr"
                            },
                            {
                                "start": 2972,
                                "end": 2972,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 2974,
                        "end": 3058,
                        "values": [
                            {
                                "start": 2974,
                                "end": 2975,
                                "direction": "ltr"
                            },
                            {
                                "start": 2979,
                                "end": 2980,
                                "direction": "ltr"
                            },
                            {
                                "start": 2984,
                                "end": 2986,
                                "direction": "ltr"
                            },
                            {
                                "start": 2990,
                                "end": 3001,
                                "direction": "ltr"
                            },
                            {
                                "start": 3006,
                                "end": 3007,
                                "direction": "ltr"
                            },
                            {
                                "start": 3009,
                                "end": 3010,
                                "direction": "ltr"
                            },
                            {
                                "start": 3014,
                                "end": 3016,
                                "direction": "ltr"
                            },
                            {
                                "start": 3018,
                                "end": 3020,
                                "direction": "ltr"
                            },
                            {
                                "start": 3024,
                                "end": 3024,
                                "direction": "ltr"
                            },
                            {
                                "start": 3031,
                                "end": 3031,
                                "direction": "ltr"
                            },
                            {
                                "start": 3046,
                                "end": 3055,
                                "direction": "ltr"
                            },
                            {
                                "start": 3056,
                                "end": 3058,
                                "direction": "ltr"
                            }
                        ]
                    }
                ]
            },
            {
                "start": 3073,
                "end": 3980,
                "values": [
                    {
                        "start": 3073,
                        "end": 3203,
                        "values": [
                            {
                                "start": 3073,
                                "end": 3075,
                                "direction": "ltr"
                            },
                            {
                                "start": 3077,
                                "end": 3084,
                                "direction": "ltr"
                            },
                            {
                                "start": 3086,
                                "end": 3088,
                                "direction": "ltr"
                            },
                            {
                                "start": 3090,
                                "end": 3112,
                                "direction": "ltr"
                            },
                            {
                                "start": 3114,
                                "end": 3123,
                                "direction": "ltr"
                            },
                            {
                                "start": 3125,
                                "end": 3129,
                                "direction": "ltr"
                            },
                            {
                                "start": 3133,
                                "end": 3133,
                                "direction": "ltr"
                            },
                            {
                                "start": 3137,
                                "end": 3140,
                                "direction": "ltr"
                            },
                            {
                                "start": 3160,
                                "end": 3161,
                                "direction": "ltr"
                            },
                            {
                                "start": 3168,
                                "end": 3169,
                                "direction": "ltr"
                            },
                            {
                                "start": 3174,
                                "end": 3183,
                                "direction": "ltr"
                            },
                            {
                                "start": 3199,
                                "end": 3199,
                                "direction": "ltr"
                            },
                            {
                                "start": 3202,
                                "end": 3203,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 3205,
                        "end": 3286,
                        "values": [
                            {
                                "start": 3205,
                                "end": 3212,
                                "direction": "ltr"
                            },
                            {
                                "start": 3214,
                                "end": 3216,
                                "direction": "ltr"
                            },
                            {
                                "start": 3218,
                                "end": 3240,
                                "direction": "ltr"
                            },
                            {
                                "start": 3242,
                                "end": 3251,
                                "direction": "ltr"
                            },
                            {
                                "start": 3253,
                                "end": 3257,
                                "direction": "ltr"
                            },
                            {
                                "start": 3261,
                                "end": 3261,
                                "direction": "ltr"
                            },
                            {
                                "start": 3262,
                                "end": 3262,
                                "direction": "ltr"
                            },
                            {
                                "start": 3263,
                                "end": 3263,
                                "direction": "ltr"
                            },
                            {
                                "start": 3264,
                                "end": 3268,
                                "direction": "ltr"
                            },
                            {
                                "start": 3270,
                                "end": 3270,
                                "direction": "ltr"
                            },
                            {
                                "start": 3271,
                                "end": 3272,
                                "direction": "ltr"
                            },
                            {
                                "start": 3274,
                                "end": 3275,
                                "direction": "ltr"
                            },
                            {
                                "start": 3285,
                                "end": 3286,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 3294,
                        "end": 3404,
                        "values": [
                            {
                                "start": 3294,
                                "end": 3294,
                                "direction": "ltr"
                            },
                            {
                                "start": 3296,
                                "end": 3297,
                                "direction": "ltr"
                            },
                            {
                                "start": 3302,
                                "end": 3311,
                                "direction": "ltr"
                            },
                            {
                                "start": 3313,
                                "end": 3314,
                                "direction": "ltr"
                            },
                            {
                                "start": 3330,
                                "end": 3331,
                                "direction": "ltr"
                            },
                            {
                                "start": 3333,
                                "end": 3340,
                                "direction": "ltr"
                            },
                            {
                                "start": 3342,
                                "end": 3344,
                                "direction": "ltr"
                            },
                            {
                                "start": 3346,
                                "end": 3386,
                                "direction": "ltr"
                            },
                            {
                                "start": 3389,
                                "end": 3389,
                                "direction": "ltr"
                            },
                            {
                                "start": 3390,
                                "end": 3392,
                                "direction": "ltr"
                            },
                            {
                                "start": 3398,
                                "end": 3400,
                                "direction": "ltr"
                            },
                            {
                                "start": 3402,
                                "end": 3404,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 3406,
                        "end": 3517,
                        "values": [
                            {
                                "start": 3406,
                                "end": 3406,
                                "direction": "ltr"
                            },
                            {
                                "start": 3415,
                                "end": 3415,
                                "direction": "ltr"
                            },
                            {
                                "start": 3424,
                                "end": 3425,
                                "direction": "ltr"
                            },
                            {
                                "start": 3430,
                                "end": 3439,
                                "direction": "ltr"
                            },
                            {
                                "start": 3440,
                                "end": 3445,
                                "direction": "ltr"
                            },
                            {
                                "start": 3449,
                                "end": 3449,
                                "direction": "ltr"
                            },
                            {
                                "start": 3450,
                                "end": 3455,
                                "direction": "ltr"
                            },
                            {
                                "start": 3458,
                                "end": 3459,
                                "direction": "ltr"
                            },
                            {
                                "start": 3461,
                                "end": 3478,
                                "direction": "ltr"
                            },
                            {
                                "start": 3482,
                                "end": 3505,
                                "direction": "ltr"
                            },
                            {
                                "start": 3507,
                                "end": 3515,
                                "direction": "ltr"
                            },
                            {
                                "start": 3517,
                                "end": 3517,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 3520,
                        "end": 3675,
                        "values": [
                            {
                                "start": 3520,
                                "end": 3526,
                                "direction": "ltr"
                            },
                            {
                                "start": 3535,
                                "end": 3537,
                                "direction": "ltr"
                            },
                            {
                                "start": 3544,
                                "end": 3551,
                                "direction": "ltr"
                            },
                            {
                                "start": 3570,
                                "end": 3571,
                                "direction": "ltr"
                            },
                            {
                                "start": 3572,
                                "end": 3572,
                                "direction": "ltr"
                            },
                            {
                                "start": 3585,
                                "end": 3632,
                                "direction": "ltr"
                            },
                            {
                                "start": 3634,
                                "end": 3635,
                                "direction": "ltr"
                            },
                            {
                                "start": 3648,
                                "end": 3653,
                                "direction": "ltr"
                            },
                            {
                                "start": 3654,
                                "end": 3654,
                                "direction": "ltr"
                            },
                            {
                                "start": 3663,
                                "end": 3663,
                                "direction": "ltr"
                            },
                            {
                                "start": 3664,
                                "end": 3673,
                                "direction": "ltr"
                            },
                            {
                                "start": 3674,
                                "end": 3675,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 3713,
                        "end": 3760,
                        "values": [
                            {
                                "start": 3713,
                                "end": 3714,
                                "direction": "ltr"
                            },
                            {
                                "start": 3716,
                                "end": 3716,
                                "direction": "ltr"
                            },
                            {
                                "start": 3719,
                                "end": 3720,
                                "direction": "ltr"
                            },
                            {
                                "start": 3722,
                                "end": 3722,
                                "direction": "ltr"
                            },
                            {
                                "start": 3725,
                                "end": 3725,
                                "direction": "ltr"
                            },
                            {
                                "start": 3732,
                                "end": 3735,
                                "direction": "ltr"
                            },
                            {
                                "start": 3737,
                                "end": 3743,
                                "direction": "ltr"
                            },
                            {
                                "start": 3745,
                                "end": 3747,
                                "direction": "ltr"
                            },
                            {
                                "start": 3749,
                                "end": 3749,
                                "direction": "ltr"
                            },
                            {
                                "start": 3751,
                                "end": 3751,
                                "direction": "ltr"
                            },
                            {
                                "start": 3754,
                                "end": 3755,
                                "direction": "ltr"
                            },
                            {
                                "start": 3757,
                                "end": 3760,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 3762,
                        "end": 3863,
                        "values": [
                            {
                                "start": 3762,
                                "end": 3763,
                                "direction": "ltr"
                            },
                            {
                                "start": 3773,
                                "end": 3773,
                                "direction": "ltr"
                            },
                            {
                                "start": 3776,
                                "end": 3780,
                                "direction": "ltr"
                            },
                            {
                                "start": 3782,
                                "end": 3782,
                                "direction": "ltr"
                            },
                            {
                                "start": 3792,
                                "end": 3801,
                                "direction": "ltr"
                            },
                            {
                                "start": 3804,
                                "end": 3807,
                                "direction": "ltr"
                            },
                            {
                                "start": 3840,
                                "end": 3840,
                                "direction": "ltr"
                            },
                            {
                                "start": 3841,
                                "end": 3843,
                                "direction": "ltr"
                            },
                            {
                                "start": 3844,
                                "end": 3858,
                                "direction": "ltr"
                            },
                            {
                                "start": 3859,
                                "end": 3859,
                                "direction": "ltr"
                            },
                            {
                                "start": 3860,
                                "end": 3860,
                                "direction": "ltr"
                            },
                            {
                                "start": 3861,
                                "end": 3863,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 3866,
                        "end": 3980,
                        "values": [
                            {
                                "start": 3866,
                                "end": 3871,
                                "direction": "ltr"
                            },
                            {
                                "start": 3872,
                                "end": 3881,
                                "direction": "ltr"
                            },
                            {
                                "start": 3882,
                                "end": 3891,
                                "direction": "ltr"
                            },
                            {
                                "start": 3892,
                                "end": 3892,
                                "direction": "ltr"
                            },
                            {
                                "start": 3894,
                                "end": 3894,
                                "direction": "ltr"
                            },
                            {
                                "start": 3896,
                                "end": 3896,
                                "direction": "ltr"
                            },
                            {
                                "start": 3902,
                                "end": 3903,
                                "direction": "ltr"
                            },
                            {
                                "start": 3904,
                                "end": 3911,
                                "direction": "ltr"
                            },
                            {
                                "start": 3913,
                                "end": 3948,
                                "direction": "ltr"
                            },
                            {
                                "start": 3967,
                                "end": 3967,
                                "direction": "ltr"
                            },
                            {
                                "start": 3973,
                                "end": 3973,
                                "direction": "ltr"
                            },
                            {
                                "start": 3976,
                                "end": 3980,
                                "direction": "ltr"
                            }
                        ]
                    }
                ]
            },
            {
                "start": 4030,
                "end": 6601,
                "values": [
                    {
                        "start": 4030,
                        "end": 4169,
                        "values": [
                            {
                                "start": 4030,
                                "end": 4037,
                                "direction": "ltr"
                            },
                            {
                                "start": 4039,
                                "end": 4044,
                                "direction": "ltr"
                            },
                            {
                                "start": 4046,
                                "end": 4047,
                                "direction": "ltr"
                            },
                            {
                                "start": 4048,
                                "end": 4052,
                                "direction": "ltr"
                            },
                            {
                                "start": 4053,
                                "end": 4056,
                                "direction": "ltr"
                            },
                            {
                                "start": 4057,
                                "end": 4058,
                                "direction": "ltr"
                            },
                            {
                                "start": 4096,
                                "end": 4138,
                                "direction": "ltr"
                            },
                            {
                                "start": 4139,
                                "end": 4140,
                                "direction": "ltr"
                            },
                            {
                                "start": 4145,
                                "end": 4145,
                                "direction": "ltr"
                            },
                            {
                                "start": 4152,
                                "end": 4152,
                                "direction": "ltr"
                            },
                            {
                                "start": 4155,
                                "end": 4156,
                                "direction": "ltr"
                            },
                            {
                                "start": 4159,
                                "end": 4159,
                                "direction": "ltr"
                            },
                            {
                                "start": 4160,
                                "end": 4169,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 4170,
                        "end": 4238,
                        "values": [
                            {
                                "start": 4170,
                                "end": 4175,
                                "direction": "ltr"
                            },
                            {
                                "start": 4176,
                                "end": 4181,
                                "direction": "ltr"
                            },
                            {
                                "start": 4182,
                                "end": 4183,
                                "direction": "ltr"
                            },
                            {
                                "start": 4186,
                                "end": 4189,
                                "direction": "ltr"
                            },
                            {
                                "start": 4193,
                                "end": 4193,
                                "direction": "ltr"
                            },
                            {
                                "start": 4194,
                                "end": 4196,
                                "direction": "ltr"
                            },
                            {
                                "start": 4197,
                                "end": 4198,
                                "direction": "ltr"
                            },
                            {
                                "start": 4199,
                                "end": 4205,
                                "direction": "ltr"
                            },
                            {
                                "start": 4206,
                                "end": 4208,
                                "direction": "ltr"
                            },
                            {
                                "start": 4213,
                                "end": 4225,
                                "direction": "ltr"
                            },
                            {
                                "start": 4227,
                                "end": 4228,
                                "direction": "ltr"
                            },
                            {
                                "start": 4231,
                                "end": 4236,
                                "direction": "ltr"
                            },
                            {
                                "start": 4238,
                                "end": 4238,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 4239,
                        "end": 4685,
                        "values": [
                            {
                                "start": 4239,
                                "end": 4239,
                                "direction": "ltr"
                            },
                            {
                                "start": 4240,
                                "end": 4249,
                                "direction": "ltr"
                            },
                            {
                                "start": 4250,
                                "end": 4252,
                                "direction": "ltr"
                            },
                            {
                                "start": 4254,
                                "end": 4255,
                                "direction": "ltr"
                            },
                            {
                                "start": 4256,
                                "end": 4293,
                                "direction": "ltr"
                            },
                            {
                                "start": 4295,
                                "end": 4295,
                                "direction": "ltr"
                            },
                            {
                                "start": 4301,
                                "end": 4301,
                                "direction": "ltr"
                            },
                            {
                                "start": 4304,
                                "end": 4346,
                                "direction": "ltr"
                            },
                            {
                                "start": 4347,
                                "end": 4347,
                                "direction": "ltr"
                            },
                            {
                                "start": 4348,
                                "end": 4348,
                                "direction": "ltr"
                            },
                            {
                                "start": 4349,
                                "end": 4680,
                                "direction": "ltr"
                            },
                            {
                                "start": 4682,
                                "end": 4685,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 4688,
                        "end": 4880,
                        "values": [
                            {
                                "start": 4688,
                                "end": 4694,
                                "direction": "ltr"
                            },
                            {
                                "start": 4696,
                                "end": 4696,
                                "direction": "ltr"
                            },
                            {
                                "start": 4698,
                                "end": 4701,
                                "direction": "ltr"
                            },
                            {
                                "start": 4704,
                                "end": 4744,
                                "direction": "ltr"
                            },
                            {
                                "start": 4746,
                                "end": 4749,
                                "direction": "ltr"
                            },
                            {
                                "start": 4752,
                                "end": 4784,
                                "direction": "ltr"
                            },
                            {
                                "start": 4786,
                                "end": 4789,
                                "direction": "ltr"
                            },
                            {
                                "start": 4792,
                                "end": 4798,
                                "direction": "ltr"
                            },
                            {
                                "start": 4800,
                                "end": 4800,
                                "direction": "ltr"
                            },
                            {
                                "start": 4802,
                                "end": 4805,
                                "direction": "ltr"
                            },
                            {
                                "start": 4808,
                                "end": 4822,
                                "direction": "ltr"
                            },
                            {
                                "start": 4824,
                                "end": 4880,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 4882,
                        "end": 5869,
                        "values": [
                            {
                                "start": 4882,
                                "end": 4885,
                                "direction": "ltr"
                            },
                            {
                                "start": 4888,
                                "end": 4954,
                                "direction": "ltr"
                            },
                            {
                                "start": 4960,
                                "end": 4968,
                                "direction": "ltr"
                            },
                            {
                                "start": 4969,
                                "end": 4988,
                                "direction": "ltr"
                            },
                            {
                                "start": 4992,
                                "end": 5007,
                                "direction": "ltr"
                            },
                            {
                                "start": 5024,
                                "end": 5108,
                                "direction": "ltr"
                            },
                            {
                                "start": 5121,
                                "end": 5740,
                                "direction": "ltr"
                            },
                            {
                                "start": 5741,
                                "end": 5742,
                                "direction": "ltr"
                            },
                            {
                                "start": 5743,
                                "end": 5759,
                                "direction": "ltr"
                            },
                            {
                                "start": 5761,
                                "end": 5786,
                                "direction": "ltr"
                            },
                            {
                                "start": 5792,
                                "end": 5866,
                                "direction": "ltr"
                            },
                            {
                                "start": 5867,
                                "end": 5869,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 5870,
                        "end": 6088,
                        "values": [
                            {
                                "start": 5870,
                                "end": 5872,
                                "direction": "ltr"
                            },
                            {
                                "start": 5888,
                                "end": 5900,
                                "direction": "ltr"
                            },
                            {
                                "start": 5902,
                                "end": 5905,
                                "direction": "ltr"
                            },
                            {
                                "start": 5920,
                                "end": 5937,
                                "direction": "ltr"
                            },
                            {
                                "start": 5941,
                                "end": 5942,
                                "direction": "ltr"
                            },
                            {
                                "start": 5952,
                                "end": 5969,
                                "direction": "ltr"
                            },
                            {
                                "start": 5984,
                                "end": 5996,
                                "direction": "ltr"
                            },
                            {
                                "start": 5998,
                                "end": 6000,
                                "direction": "ltr"
                            },
                            {
                                "start": 6016,
                                "end": 6067,
                                "direction": "ltr"
                            },
                            {
                                "start": 6070,
                                "end": 6070,
                                "direction": "ltr"
                            },
                            {
                                "start": 6078,
                                "end": 6085,
                                "direction": "ltr"
                            },
                            {
                                "start": 6087,
                                "end": 6088,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 6100,
                        "end": 6389,
                        "values": [
                            {
                                "start": 6100,
                                "end": 6102,
                                "direction": "ltr"
                            },
                            {
                                "start": 6103,
                                "end": 6103,
                                "direction": "ltr"
                            },
                            {
                                "start": 6104,
                                "end": 6106,
                                "direction": "ltr"
                            },
                            {
                                "start": 6108,
                                "end": 6108,
                                "direction": "ltr"
                            },
                            {
                                "start": 6112,
                                "end": 6121,
                                "direction": "ltr"
                            },
                            {
                                "start": 6160,
                                "end": 6169,
                                "direction": "ltr"
                            },
                            {
                                "start": 6176,
                                "end": 6210,
                                "direction": "ltr"
                            },
                            {
                                "start": 6211,
                                "end": 6211,
                                "direction": "ltr"
                            },
                            {
                                "start": 6212,
                                "end": 6263,
                                "direction": "ltr"
                            },
                            {
                                "start": 6272,
                                "end": 6312,
                                "direction": "ltr"
                            },
                            {
                                "start": 6314,
                                "end": 6314,
                                "direction": "ltr"
                            },
                            {
                                "start": 6320,
                                "end": 6389,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 6400,
                        "end": 6601,
                        "values": [
                            {
                                "start": 6400,
                                "end": 6428,
                                "direction": "ltr"
                            },
                            {
                                "start": 6435,
                                "end": 6438,
                                "direction": "ltr"
                            },
                            {
                                "start": 6441,
                                "end": 6443,
                                "direction": "ltr"
                            },
                            {
                                "start": 6448,
                                "end": 6449,
                                "direction": "ltr"
                            },
                            {
                                "start": 6451,
                                "end": 6456,
                                "direction": "ltr"
                            },
                            {
                                "start": 6470,
                                "end": 6479,
                                "direction": "ltr"
                            },
                            {
                                "start": 6480,
                                "end": 6509,
                                "direction": "ltr"
                            },
                            {
                                "start": 6512,
                                "end": 6516,
                                "direction": "ltr"
                            },
                            {
                                "start": 6528,
                                "end": 6571,
                                "direction": "ltr"
                            },
                            {
                                "start": 6576,
                                "end": 6592,
                                "direction": "ltr"
                            },
                            {
                                "start": 6593,
                                "end": 6599,
                                "direction": "ltr"
                            },
                            {
                                "start": 6600,
                                "end": 6601,
                                "direction": "ltr"
                            }
                        ]
                    }
                ]
            },
            {
                "start": 6608,
                "end": 8484,
                "values": [
                    {
                        "start": 6608,
                        "end": 6809,
                        "values": [
                            {
                                "start": 6608,
                                "end": 6617,
                                "direction": "ltr"
                            },
                            {
                                "start": 6618,
                                "end": 6618,
                                "direction": "ltr"
                            },
                            {
                                "start": 6656,
                                "end": 6678,
                                "direction": "ltr"
                            },
                            {
                                "start": 6681,
                                "end": 6683,
                                "direction": "ltr"
                            },
                            {
                                "start": 6686,
                                "end": 6687,
                                "direction": "ltr"
                            },
                            {
                                "start": 6688,
                                "end": 6740,
                                "direction": "ltr"
                            },
                            {
                                "start": 6741,
                                "end": 6741,
                                "direction": "ltr"
                            },
                            {
                                "start": 6743,
                                "end": 6743,
                                "direction": "ltr"
                            },
                            {
                                "start": 6753,
                                "end": 6753,
                                "direction": "ltr"
                            },
                            {
                                "start": 6755,
                                "end": 6756,
                                "direction": "ltr"
                            },
                            {
                                "start": 6765,
                                "end": 6770,
                                "direction": "ltr"
                            },
                            {
                                "start": 6784,
                                "end": 6793,
                                "direction": "ltr"
                            },
                            {
                                "start": 6800,
                                "end": 6809,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 6816,
                        "end": 7018,
                        "values": [
                            {
                                "start": 6816,
                                "end": 6822,
                                "direction": "ltr"
                            },
                            {
                                "start": 6823,
                                "end": 6823,
                                "direction": "ltr"
                            },
                            {
                                "start": 6824,
                                "end": 6829,
                                "direction": "ltr"
                            },
                            {
                                "start": 6916,
                                "end": 6916,
                                "direction": "ltr"
                            },
                            {
                                "start": 6917,
                                "end": 6963,
                                "direction": "ltr"
                            },
                            {
                                "start": 6965,
                                "end": 6965,
                                "direction": "ltr"
                            },
                            {
                                "start": 6971,
                                "end": 6971,
                                "direction": "ltr"
                            },
                            {
                                "start": 6973,
                                "end": 6977,
                                "direction": "ltr"
                            },
                            {
                                "start": 6979,
                                "end": 6980,
                                "direction": "ltr"
                            },
                            {
                                "start": 6981,
                                "end": 6987,
                                "direction": "ltr"
                            },
                            {
                                "start": 6992,
                                "end": 7001,
                                "direction": "ltr"
                            },
                            {
                                "start": 7002,
                                "end": 7008,
                                "direction": "ltr"
                            },
                            {
                                "start": 7009,
                                "end": 7018,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 7028,
                        "end": 7148,
                        "values": [
                            {
                                "start": 7028,
                                "end": 7036,
                                "direction": "ltr"
                            },
                            {
                                "start": 7042,
                                "end": 7042,
                                "direction": "ltr"
                            },
                            {
                                "start": 7043,
                                "end": 7072,
                                "direction": "ltr"
                            },
                            {
                                "start": 7073,
                                "end": 7073,
                                "direction": "ltr"
                            },
                            {
                                "start": 7078,
                                "end": 7079,
                                "direction": "ltr"
                            },
                            {
                                "start": 7082,
                                "end": 7082,
                                "direction": "ltr"
                            },
                            {
                                "start": 7084,
                                "end": 7085,
                                "direction": "ltr"
                            },
                            {
                                "start": 7086,
                                "end": 7087,
                                "direction": "ltr"
                            },
                            {
                                "start": 7088,
                                "end": 7097,
                                "direction": "ltr"
                            },
                            {
                                "start": 7098,
                                "end": 7141,
                                "direction": "ltr"
                            },
                            {
                                "start": 7143,
                                "end": 7143,
                                "direction": "ltr"
                            },
                            {
                                "start": 7146,
                                "end": 7148,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 7150,
                        "end": 7293,
                        "values": [
                            {
                                "start": 7150,
                                "end": 7150,
                                "direction": "ltr"
                            },
                            {
                                "start": 7154,
                                "end": 7155,
                                "direction": "ltr"
                            },
                            {
                                "start": 7164,
                                "end": 7167,
                                "direction": "ltr"
                            },
                            {
                                "start": 7168,
                                "end": 7203,
                                "direction": "ltr"
                            },
                            {
                                "start": 7204,
                                "end": 7211,
                                "direction": "ltr"
                            },
                            {
                                "start": 7220,
                                "end": 7221,
                                "direction": "ltr"
                            },
                            {
                                "start": 7227,
                                "end": 7231,
                                "direction": "ltr"
                            },
                            {
                                "start": 7232,
                                "end": 7241,
                                "direction": "ltr"
                            },
                            {
                                "start": 7245,
                                "end": 7247,
                                "direction": "ltr"
                            },
                            {
                                "start": 7248,
                                "end": 7257,
                                "direction": "ltr"
                            },
                            {
                                "start": 7258,
                                "end": 7287,
                                "direction": "ltr"
                            },
                            {
                                "start": 7288,
                                "end": 7293,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 7294,
                        "end": 7544,
                        "values": [
                            {
                                "start": 7294,
                                "end": 7295,
                                "direction": "ltr"
                            },
                            {
                                "start": 7360,
                                "end": 7367,
                                "direction": "ltr"
                            },
                            {
                                "start": 7379,
                                "end": 7379,
                                "direction": "ltr"
                            },
                            {
                                "start": 7393,
                                "end": 7393,
                                "direction": "ltr"
                            },
                            {
                                "start": 7401,
                                "end": 7404,
                                "direction": "ltr"
                            },
                            {
                                "start": 7406,
                                "end": 7409,
                                "direction": "ltr"
                            },
                            {
                                "start": 7410,
                                "end": 7411,
                                "direction": "ltr"
                            },
                            {
                                "start": 7413,
                                "end": 7414,
                                "direction": "ltr"
                            },
                            {
                                "start": 7424,
                                "end": 7467,
                                "direction": "ltr"
                            },
                            {
                                "start": 7468,
                                "end": 7530,
                                "direction": "ltr"
                            },
                            {
                                "start": 7531,
                                "end": 7543,
                                "direction": "ltr"
                            },
                            {
                                "start": 7544,
                                "end": 7544,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 7545,
                        "end": 8116,
                        "values": [
                            {
                                "start": 7545,
                                "end": 7578,
                                "direction": "ltr"
                            },
                            {
                                "start": 7579,
                                "end": 7615,
                                "direction": "ltr"
                            },
                            {
                                "start": 7680,
                                "end": 7957,
                                "direction": "ltr"
                            },
                            {
                                "start": 7960,
                                "end": 7965,
                                "direction": "ltr"
                            },
                            {
                                "start": 7968,
                                "end": 8005,
                                "direction": "ltr"
                            },
                            {
                                "start": 8008,
                                "end": 8013,
                                "direction": "ltr"
                            },
                            {
                                "start": 8016,
                                "end": 8023,
                                "direction": "ltr"
                            },
                            {
                                "start": 8025,
                                "end": 8025,
                                "direction": "ltr"
                            },
                            {
                                "start": 8027,
                                "end": 8027,
                                "direction": "ltr"
                            },
                            {
                                "start": 8029,
                                "end": 8029,
                                "direction": "ltr"
                            },
                            {
                                "start": 8031,
                                "end": 8061,
                                "direction": "ltr"
                            },
                            {
                                "start": 8064,
                                "end": 8116,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 8118,
                        "end": 8234,
                        "values": [
                            {
                                "start": 8118,
                                "end": 8124,
                                "direction": "ltr"
                            },
                            {
                                "start": 8126,
                                "end": 8126,
                                "direction": "ltr"
                            },
                            {
                                "start": 8130,
                                "end": 8132,
                                "direction": "ltr"
                            },
                            {
                                "start": 8134,
                                "end": 8140,
                                "direction": "ltr"
                            },
                            {
                                "start": 8144,
                                "end": 8147,
                                "direction": "ltr"
                            },
                            {
                                "start": 8150,
                                "end": 8155,
                                "direction": "ltr"
                            },
                            {
                                "start": 8160,
                                "end": 8172,
                                "direction": "ltr"
                            },
                            {
                                "start": 8178,
                                "end": 8180,
                                "direction": "ltr"
                            },
                            {
                                "start": 8182,
                                "end": 8188,
                                "direction": "ltr"
                            },
                            {
                                "start": 8206,
                                "end": 8206,
                                "direction": "ltr"
                            },
                            {
                                "start": 8207,
                                "end": 8207,
                                "direction": "rtl"
                            },
                            {
                                "start": 8234,
                                "end": 8234,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 8235,
                        "end": 8484,
                        "values": [
                            {
                                "start": 8235,
                                "end": 8235,
                                "direction": "rtl"
                            },
                            {
                                "start": 8237,
                                "end": 8237,
                                "direction": "ltr"
                            },
                            {
                                "start": 8238,
                                "end": 8238,
                                "direction": "rtl"
                            },
                            {
                                "start": 8305,
                                "end": 8305,
                                "direction": "ltr"
                            },
                            {
                                "start": 8319,
                                "end": 8319,
                                "direction": "ltr"
                            },
                            {
                                "start": 8336,
                                "end": 8348,
                                "direction": "ltr"
                            },
                            {
                                "start": 8450,
                                "end": 8450,
                                "direction": "ltr"
                            },
                            {
                                "start": 8455,
                                "end": 8455,
                                "direction": "ltr"
                            },
                            {
                                "start": 8458,
                                "end": 8467,
                                "direction": "ltr"
                            },
                            {
                                "start": 8469,
                                "end": 8469,
                                "direction": "ltr"
                            },
                            {
                                "start": 8473,
                                "end": 8477,
                                "direction": "ltr"
                            },
                            {
                                "start": 8484,
                                "end": 8484,
                                "direction": "ltr"
                            }
                        ]
                    }
                ]
            },
            {
                "start": 8486,
                "end": 42890,
                "values": [
                    {
                        "start": 8486,
                        "end": 8584,
                        "values": [
                            {
                                "start": 8486,
                                "end": 8486,
                                "direction": "ltr"
                            },
                            {
                                "start": 8488,
                                "end": 8488,
                                "direction": "ltr"
                            },
                            {
                                "start": 8490,
                                "end": 8493,
                                "direction": "ltr"
                            },
                            {
                                "start": 8495,
                                "end": 8500,
                                "direction": "ltr"
                            },
                            {
                                "start": 8501,
                                "end": 8504,
                                "direction": "ltr"
                            },
                            {
                                "start": 8505,
                                "end": 8505,
                                "direction": "ltr"
                            },
                            {
                                "start": 8508,
                                "end": 8511,
                                "direction": "ltr"
                            },
                            {
                                "start": 8517,
                                "end": 8521,
                                "direction": "ltr"
                            },
                            {
                                "start": 8526,
                                "end": 8526,
                                "direction": "ltr"
                            },
                            {
                                "start": 8527,
                                "end": 8527,
                                "direction": "ltr"
                            },
                            {
                                "start": 8544,
                                "end": 8578,
                                "direction": "ltr"
                            },
                            {
                                "start": 8579,
                                "end": 8580,
                                "direction": "ltr"
                            },
                            {
                                "start": 8581,
                                "end": 8584,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 9014,
                        "end": 11557,
                        "values": [
                            {
                                "start": 9014,
                                "end": 9082,
                                "direction": "ltr"
                            },
                            {
                                "start": 9109,
                                "end": 9109,
                                "direction": "ltr"
                            },
                            {
                                "start": 9372,
                                "end": 9449,
                                "direction": "ltr"
                            },
                            {
                                "start": 9900,
                                "end": 9900,
                                "direction": "ltr"
                            },
                            {
                                "start": 10240,
                                "end": 10495,
                                "direction": "ltr"
                            },
                            {
                                "start": 11264,
                                "end": 11310,
                                "direction": "ltr"
                            },
                            {
                                "start": 11312,
                                "end": 11358,
                                "direction": "ltr"
                            },
                            {
                                "start": 11360,
                                "end": 11387,
                                "direction": "ltr"
                            },
                            {
                                "start": 11388,
                                "end": 11389,
                                "direction": "ltr"
                            },
                            {
                                "start": 11390,
                                "end": 11492,
                                "direction": "ltr"
                            },
                            {
                                "start": 11499,
                                "end": 11502,
                                "direction": "ltr"
                            },
                            {
                                "start": 11506,
                                "end": 11507,
                                "direction": "ltr"
                            },
                            {
                                "start": 11520,
                                "end": 11557,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 11559,
                        "end": 11726,
                        "values": [
                            {
                                "start": 11559,
                                "end": 11559,
                                "direction": "ltr"
                            },
                            {
                                "start": 11565,
                                "end": 11565,
                                "direction": "ltr"
                            },
                            {
                                "start": 11568,
                                "end": 11623,
                                "direction": "ltr"
                            },
                            {
                                "start": 11631,
                                "end": 11631,
                                "direction": "ltr"
                            },
                            {
                                "start": 11632,
                                "end": 11632,
                                "direction": "ltr"
                            },
                            {
                                "start": 11648,
                                "end": 11670,
                                "direction": "ltr"
                            },
                            {
                                "start": 11680,
                                "end": 11686,
                                "direction": "ltr"
                            },
                            {
                                "start": 11688,
                                "end": 11694,
                                "direction": "ltr"
                            },
                            {
                                "start": 11696,
                                "end": 11702,
                                "direction": "ltr"
                            },
                            {
                                "start": 11704,
                                "end": 11710,
                                "direction": "ltr"
                            },
                            {
                                "start": 11712,
                                "end": 11718,
                                "direction": "ltr"
                            },
                            {
                                "start": 11720,
                                "end": 11726,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 11728,
                        "end": 12438,
                        "values": [
                            {
                                "start": 11728,
                                "end": 11734,
                                "direction": "ltr"
                            },
                            {
                                "start": 11736,
                                "end": 11742,
                                "direction": "ltr"
                            },
                            {
                                "start": 12293,
                                "end": 12293,
                                "direction": "ltr"
                            },
                            {
                                "start": 12294,
                                "end": 12294,
                                "direction": "ltr"
                            },
                            {
                                "start": 12295,
                                "end": 12295,
                                "direction": "ltr"
                            },
                            {
                                "start": 12321,
                                "end": 12329,
                                "direction": "ltr"
                            },
                            {
                                "start": 12334,
                                "end": 12335,
                                "direction": "ltr"
                            },
                            {
                                "start": 12337,
                                "end": 12341,
                                "direction": "ltr"
                            },
                            {
                                "start": 12344,
                                "end": 12346,
                                "direction": "ltr"
                            },
                            {
                                "start": 12347,
                                "end": 12347,
                                "direction": "ltr"
                            },
                            {
                                "start": 12348,
                                "end": 12348,
                                "direction": "ltr"
                            },
                            {
                                "start": 12353,
                                "end": 12438,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 12445,
                        "end": 12799,
                        "values": [
                            {
                                "start": 12445,
                                "end": 12446,
                                "direction": "ltr"
                            },
                            {
                                "start": 12447,
                                "end": 12447,
                                "direction": "ltr"
                            },
                            {
                                "start": 12449,
                                "end": 12538,
                                "direction": "ltr"
                            },
                            {
                                "start": 12540,
                                "end": 12542,
                                "direction": "ltr"
                            },
                            {
                                "start": 12543,
                                "end": 12543,
                                "direction": "ltr"
                            },
                            {
                                "start": 12549,
                                "end": 12589,
                                "direction": "ltr"
                            },
                            {
                                "start": 12593,
                                "end": 12686,
                                "direction": "ltr"
                            },
                            {
                                "start": 12688,
                                "end": 12689,
                                "direction": "ltr"
                            },
                            {
                                "start": 12690,
                                "end": 12693,
                                "direction": "ltr"
                            },
                            {
                                "start": 12694,
                                "end": 12703,
                                "direction": "ltr"
                            },
                            {
                                "start": 12704,
                                "end": 12730,
                                "direction": "ltr"
                            },
                            {
                                "start": 12784,
                                "end": 12799,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 12800,
                        "end": 13277,
                        "values": [
                            {
                                "start": 12800,
                                "end": 12828,
                                "direction": "ltr"
                            },
                            {
                                "start": 12832,
                                "end": 12841,
                                "direction": "ltr"
                            },
                            {
                                "start": 12842,
                                "end": 12871,
                                "direction": "ltr"
                            },
                            {
                                "start": 12872,
                                "end": 12879,
                                "direction": "ltr"
                            },
                            {
                                "start": 12896,
                                "end": 12923,
                                "direction": "ltr"
                            },
                            {
                                "start": 12927,
                                "end": 12927,
                                "direction": "ltr"
                            },
                            {
                                "start": 12928,
                                "end": 12937,
                                "direction": "ltr"
                            },
                            {
                                "start": 12938,
                                "end": 12976,
                                "direction": "ltr"
                            },
                            {
                                "start": 12992,
                                "end": 13003,
                                "direction": "ltr"
                            },
                            {
                                "start": 13008,
                                "end": 13054,
                                "direction": "ltr"
                            },
                            {
                                "start": 13056,
                                "end": 13174,
                                "direction": "ltr"
                            },
                            {
                                "start": 13179,
                                "end": 13277,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 13280,
                        "end": 42527,
                        "values": [
                            {
                                "start": 13280,
                                "end": 13310,
                                "direction": "ltr"
                            },
                            {
                                "start": 13312,
                                "end": 19893,
                                "direction": "ltr"
                            },
                            {
                                "start": 19968,
                                "end": 40908,
                                "direction": "ltr"
                            },
                            {
                                "start": 40960,
                                "end": 40980,
                                "direction": "ltr"
                            },
                            {
                                "start": 40981,
                                "end": 40981,
                                "direction": "ltr"
                            },
                            {
                                "start": 40982,
                                "end": 42124,
                                "direction": "ltr"
                            },
                            {
                                "start": 42192,
                                "end": 42231,
                                "direction": "ltr"
                            },
                            {
                                "start": 42232,
                                "end": 42237,
                                "direction": "ltr"
                            },
                            {
                                "start": 42238,
                                "end": 42239,
                                "direction": "ltr"
                            },
                            {
                                "start": 42240,
                                "end": 42507,
                                "direction": "ltr"
                            },
                            {
                                "start": 42508,
                                "end": 42508,
                                "direction": "ltr"
                            },
                            {
                                "start": 42512,
                                "end": 42527,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 42528,
                        "end": 42890,
                        "values": [
                            {
                                "start": 42528,
                                "end": 42537,
                                "direction": "ltr"
                            },
                            {
                                "start": 42538,
                                "end": 42539,
                                "direction": "ltr"
                            },
                            {
                                "start": 42560,
                                "end": 42605,
                                "direction": "ltr"
                            },
                            {
                                "start": 42606,
                                "end": 42606,
                                "direction": "ltr"
                            },
                            {
                                "start": 42624,
                                "end": 42647,
                                "direction": "ltr"
                            },
                            {
                                "start": 42656,
                                "end": 42725,
                                "direction": "ltr"
                            },
                            {
                                "start": 42726,
                                "end": 42735,
                                "direction": "ltr"
                            },
                            {
                                "start": 42738,
                                "end": 42743,
                                "direction": "ltr"
                            },
                            {
                                "start": 42786,
                                "end": 42863,
                                "direction": "ltr"
                            },
                            {
                                "start": 42864,
                                "end": 42864,
                                "direction": "ltr"
                            },
                            {
                                "start": 42865,
                                "end": 42887,
                                "direction": "ltr"
                            },
                            {
                                "start": 42889,
                                "end": 42890,
                                "direction": "ltr"
                            }
                        ]
                    }
                ]
            },
            {
                "start": 42891,
                "end": 64322,
                "values": [
                    {
                        "start": 42891,
                        "end": 43063,
                        "values": [
                            {
                                "start": 42891,
                                "end": 42894,
                                "direction": "ltr"
                            },
                            {
                                "start": 42896,
                                "end": 42899,
                                "direction": "ltr"
                            },
                            {
                                "start": 42912,
                                "end": 42922,
                                "direction": "ltr"
                            },
                            {
                                "start": 43000,
                                "end": 43001,
                                "direction": "ltr"
                            },
                            {
                                "start": 43002,
                                "end": 43002,
                                "direction": "ltr"
                            },
                            {
                                "start": 43003,
                                "end": 43009,
                                "direction": "ltr"
                            },
                            {
                                "start": 43011,
                                "end": 43013,
                                "direction": "ltr"
                            },
                            {
                                "start": 43015,
                                "end": 43018,
                                "direction": "ltr"
                            },
                            {
                                "start": 43020,
                                "end": 43042,
                                "direction": "ltr"
                            },
                            {
                                "start": 43043,
                                "end": 43044,
                                "direction": "ltr"
                            },
                            {
                                "start": 43047,
                                "end": 43047,
                                "direction": "ltr"
                            },
                            {
                                "start": 43056,
                                "end": 43061,
                                "direction": "ltr"
                            },
                            {
                                "start": 43062,
                                "end": 43063,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 43072,
                        "end": 43334,
                        "values": [
                            {
                                "start": 43072,
                                "end": 43123,
                                "direction": "ltr"
                            },
                            {
                                "start": 43136,
                                "end": 43137,
                                "direction": "ltr"
                            },
                            {
                                "start": 43138,
                                "end": 43187,
                                "direction": "ltr"
                            },
                            {
                                "start": 43188,
                                "end": 43203,
                                "direction": "ltr"
                            },
                            {
                                "start": 43214,
                                "end": 43215,
                                "direction": "ltr"
                            },
                            {
                                "start": 43216,
                                "end": 43225,
                                "direction": "ltr"
                            },
                            {
                                "start": 43250,
                                "end": 43255,
                                "direction": "ltr"
                            },
                            {
                                "start": 43256,
                                "end": 43258,
                                "direction": "ltr"
                            },
                            {
                                "start": 43259,
                                "end": 43259,
                                "direction": "ltr"
                            },
                            {
                                "start": 43264,
                                "end": 43273,
                                "direction": "ltr"
                            },
                            {
                                "start": 43274,
                                "end": 43301,
                                "direction": "ltr"
                            },
                            {
                                "start": 43310,
                                "end": 43311,
                                "direction": "ltr"
                            },
                            {
                                "start": 43312,
                                "end": 43334,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 43346,
                        "end": 43487,
                        "values": [
                            {
                                "start": 43346,
                                "end": 43347,
                                "direction": "ltr"
                            },
                            {
                                "start": 43359,
                                "end": 43359,
                                "direction": "ltr"
                            },
                            {
                                "start": 43360,
                                "end": 43388,
                                "direction": "ltr"
                            },
                            {
                                "start": 43395,
                                "end": 43395,
                                "direction": "ltr"
                            },
                            {
                                "start": 43396,
                                "end": 43442,
                                "direction": "ltr"
                            },
                            {
                                "start": 43444,
                                "end": 43445,
                                "direction": "ltr"
                            },
                            {
                                "start": 43450,
                                "end": 43451,
                                "direction": "ltr"
                            },
                            {
                                "start": 43453,
                                "end": 43456,
                                "direction": "ltr"
                            },
                            {
                                "start": 43457,
                                "end": 43469,
                                "direction": "ltr"
                            },
                            {
                                "start": 43471,
                                "end": 43471,
                                "direction": "ltr"
                            },
                            {
                                "start": 43472,
                                "end": 43481,
                                "direction": "ltr"
                            },
                            {
                                "start": 43486,
                                "end": 43487,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 43520,
                        "end": 43641,
                        "values": [
                            {
                                "start": 43520,
                                "end": 43560,
                                "direction": "ltr"
                            },
                            {
                                "start": 43567,
                                "end": 43568,
                                "direction": "ltr"
                            },
                            {
                                "start": 43571,
                                "end": 43572,
                                "direction": "ltr"
                            },
                            {
                                "start": 43584,
                                "end": 43586,
                                "direction": "ltr"
                            },
                            {
                                "start": 43588,
                                "end": 43595,
                                "direction": "ltr"
                            },
                            {
                                "start": 43597,
                                "end": 43597,
                                "direction": "ltr"
                            },
                            {
                                "start": 43600,
                                "end": 43609,
                                "direction": "ltr"
                            },
                            {
                                "start": 43612,
                                "end": 43615,
                                "direction": "ltr"
                            },
                            {
                                "start": 43616,
                                "end": 43631,
                                "direction": "ltr"
                            },
                            {
                                "start": 43632,
                                "end": 43632,
                                "direction": "ltr"
                            },
                            {
                                "start": 43633,
                                "end": 43638,
                                "direction": "ltr"
                            },
                            {
                                "start": 43639,
                                "end": 43641,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 43642,
                        "end": 43754,
                        "values": [
                            {
                                "start": 43642,
                                "end": 43642,
                                "direction": "ltr"
                            },
                            {
                                "start": 43643,
                                "end": 43643,
                                "direction": "ltr"
                            },
                            {
                                "start": 43648,
                                "end": 43695,
                                "direction": "ltr"
                            },
                            {
                                "start": 43697,
                                "end": 43697,
                                "direction": "ltr"
                            },
                            {
                                "start": 43701,
                                "end": 43702,
                                "direction": "ltr"
                            },
                            {
                                "start": 43705,
                                "end": 43709,
                                "direction": "ltr"
                            },
                            {
                                "start": 43712,
                                "end": 43712,
                                "direction": "ltr"
                            },
                            {
                                "start": 43714,
                                "end": 43714,
                                "direction": "ltr"
                            },
                            {
                                "start": 43739,
                                "end": 43740,
                                "direction": "ltr"
                            },
                            {
                                "start": 43741,
                                "end": 43741,
                                "direction": "ltr"
                            },
                            {
                                "start": 43742,
                                "end": 43743,
                                "direction": "ltr"
                            },
                            {
                                "start": 43744,
                                "end": 43754,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 43755,
                        "end": 44002,
                        "values": [
                            {
                                "start": 43755,
                                "end": 43755,
                                "direction": "ltr"
                            },
                            {
                                "start": 43758,
                                "end": 43759,
                                "direction": "ltr"
                            },
                            {
                                "start": 43760,
                                "end": 43761,
                                "direction": "ltr"
                            },
                            {
                                "start": 43762,
                                "end": 43762,
                                "direction": "ltr"
                            },
                            {
                                "start": 43763,
                                "end": 43764,
                                "direction": "ltr"
                            },
                            {
                                "start": 43765,
                                "end": 43765,
                                "direction": "ltr"
                            },
                            {
                                "start": 43777,
                                "end": 43782,
                                "direction": "ltr"
                            },
                            {
                                "start": 43785,
                                "end": 43790,
                                "direction": "ltr"
                            },
                            {
                                "start": 43793,
                                "end": 43798,
                                "direction": "ltr"
                            },
                            {
                                "start": 43808,
                                "end": 43814,
                                "direction": "ltr"
                            },
                            {
                                "start": 43816,
                                "end": 43822,
                                "direction": "ltr"
                            },
                            {
                                "start": 43968,
                                "end": 44002,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 44003,
                        "end": 64217,
                        "values": [
                            {
                                "start": 44003,
                                "end": 44004,
                                "direction": "ltr"
                            },
                            {
                                "start": 44006,
                                "end": 44007,
                                "direction": "ltr"
                            },
                            {
                                "start": 44009,
                                "end": 44010,
                                "direction": "ltr"
                            },
                            {
                                "start": 44011,
                                "end": 44011,
                                "direction": "ltr"
                            },
                            {
                                "start": 44012,
                                "end": 44012,
                                "direction": "ltr"
                            },
                            {
                                "start": 44016,
                                "end": 44025,
                                "direction": "ltr"
                            },
                            {
                                "start": 44032,
                                "end": 55203,
                                "direction": "ltr"
                            },
                            {
                                "start": 55216,
                                "end": 55238,
                                "direction": "ltr"
                            },
                            {
                                "start": 55243,
                                "end": 55291,
                                "direction": "ltr"
                            },
                            {
                                "start": 57344,
                                "end": 63743,
                                "direction": "ltr"
                            },
                            {
                                "start": 63744,
                                "end": 64109,
                                "direction": "ltr"
                            },
                            {
                                "start": 64112,
                                "end": 64217,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 64256,
                        "end": 64322,
                        "values": [
                            {
                                "start": 64256,
                                "end": 64262,
                                "direction": "ltr"
                            },
                            {
                                "start": 64275,
                                "end": 64279,
                                "direction": "ltr"
                            },
                            {
                                "start": 64285,
                                "end": 64285,
                                "direction": "rtl"
                            },
                            {
                                "start": 64287,
                                "end": 64296,
                                "direction": "rtl"
                            },
                            {
                                "start": 64298,
                                "end": 64310,
                                "direction": "rtl"
                            },
                            {
                                "start": 64311,
                                "end": 64311,
                                "direction": "rtl"
                            },
                            {
                                "start": 64312,
                                "end": 64316,
                                "direction": "rtl"
                            },
                            {
                                "start": 64317,
                                "end": 64317,
                                "direction": "rtl"
                            },
                            {
                                "start": 64318,
                                "end": 64318,
                                "direction": "rtl"
                            },
                            {
                                "start": 64319,
                                "end": 64319,
                                "direction": "rtl"
                            },
                            {
                                "start": 64320,
                                "end": 64321,
                                "direction": "rtl"
                            },
                            {
                                "start": 64322,
                                "end": 64322,
                                "direction": "rtl"
                            }
                        ]
                    }
                ]
            },
            {
                "start": 64323,
                "end": 68184,
                "values": [
                    {
                        "start": 64323,
                        "end": 65019,
                        "values": [
                            {
                                "start": 64323,
                                "end": 64324,
                                "direction": "rtl"
                            },
                            {
                                "start": 64325,
                                "end": 64325,
                                "direction": "rtl"
                            },
                            {
                                "start": 64326,
                                "end": 64335,
                                "direction": "rtl"
                            },
                            {
                                "start": 64336,
                                "end": 64433,
                                "direction": "rtl"
                            },
                            {
                                "start": 64434,
                                "end": 64449,
                                "direction": "rtl"
                            },
                            {
                                "start": 64450,
                                "end": 64466,
                                "direction": "rtl"
                            },
                            {
                                "start": 64467,
                                "end": 64829,
                                "direction": "rtl"
                            },
                            {
                                "start": 64832,
                                "end": 64847,
                                "direction": "rtl"
                            },
                            {
                                "start": 64848,
                                "end": 64911,
                                "direction": "rtl"
                            },
                            {
                                "start": 64912,
                                "end": 64913,
                                "direction": "rtl"
                            },
                            {
                                "start": 64914,
                                "end": 64967,
                                "direction": "rtl"
                            },
                            {
                                "start": 64968,
                                "end": 64975,
                                "direction": "rtl"
                            },
                            {
                                "start": 65008,
                                "end": 65019,
                                "direction": "rtl"
                            }
                        ]
                    },
                    {
                        "start": 65020,
                        "end": 65470,
                        "values": [
                            {
                                "start": 65020,
                                "end": 65020,
                                "direction": "rtl"
                            },
                            {
                                "start": 65022,
                                "end": 65023,
                                "direction": "rtl"
                            },
                            {
                                "start": 65136,
                                "end": 65140,
                                "direction": "rtl"
                            },
                            {
                                "start": 65141,
                                "end": 65141,
                                "direction": "rtl"
                            },
                            {
                                "start": 65142,
                                "end": 65276,
                                "direction": "rtl"
                            },
                            {
                                "start": 65277,
                                "end": 65278,
                                "direction": "rtl"
                            },
                            {
                                "start": 65313,
                                "end": 65338,
                                "direction": "ltr"
                            },
                            {
                                "start": 65345,
                                "end": 65370,
                                "direction": "ltr"
                            },
                            {
                                "start": 65382,
                                "end": 65391,
                                "direction": "ltr"
                            },
                            {
                                "start": 65392,
                                "end": 65392,
                                "direction": "ltr"
                            },
                            {
                                "start": 65393,
                                "end": 65437,
                                "direction": "ltr"
                            },
                            {
                                "start": 65438,
                                "end": 65439,
                                "direction": "ltr"
                            },
                            {
                                "start": 65440,
                                "end": 65470,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 65474,
                        "end": 65792,
                        "values": [
                            {
                                "start": 65474,
                                "end": 65479,
                                "direction": "ltr"
                            },
                            {
                                "start": 65482,
                                "end": 65487,
                                "direction": "ltr"
                            },
                            {
                                "start": 65490,
                                "end": 65495,
                                "direction": "ltr"
                            },
                            {
                                "start": 65498,
                                "end": 65500,
                                "direction": "ltr"
                            },
                            {
                                "start": 65536,
                                "end": 65547,
                                "direction": "ltr"
                            },
                            {
                                "start": 65549,
                                "end": 65574,
                                "direction": "ltr"
                            },
                            {
                                "start": 65576,
                                "end": 65594,
                                "direction": "ltr"
                            },
                            {
                                "start": 65596,
                                "end": 65597,
                                "direction": "ltr"
                            },
                            {
                                "start": 65599,
                                "end": 65613,
                                "direction": "ltr"
                            },
                            {
                                "start": 65616,
                                "end": 65629,
                                "direction": "ltr"
                            },
                            {
                                "start": 65664,
                                "end": 65786,
                                "direction": "ltr"
                            },
                            {
                                "start": 65792,
                                "end": 65792,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 65794,
                        "end": 66378,
                        "values": [
                            {
                                "start": 65794,
                                "end": 65794,
                                "direction": "ltr"
                            },
                            {
                                "start": 65799,
                                "end": 65843,
                                "direction": "ltr"
                            },
                            {
                                "start": 65847,
                                "end": 65855,
                                "direction": "ltr"
                            },
                            {
                                "start": 66000,
                                "end": 66044,
                                "direction": "ltr"
                            },
                            {
                                "start": 66176,
                                "end": 66204,
                                "direction": "ltr"
                            },
                            {
                                "start": 66208,
                                "end": 66256,
                                "direction": "ltr"
                            },
                            {
                                "start": 66304,
                                "end": 66334,
                                "direction": "ltr"
                            },
                            {
                                "start": 66336,
                                "end": 66339,
                                "direction": "ltr"
                            },
                            {
                                "start": 66352,
                                "end": 66368,
                                "direction": "ltr"
                            },
                            {
                                "start": 66369,
                                "end": 66369,
                                "direction": "ltr"
                            },
                            {
                                "start": 66370,
                                "end": 66377,
                                "direction": "ltr"
                            },
                            {
                                "start": 66378,
                                "end": 66378,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 66432,
                        "end": 67592,
                        "values": [
                            {
                                "start": 66432,
                                "end": 66461,
                                "direction": "ltr"
                            },
                            {
                                "start": 66463,
                                "end": 66463,
                                "direction": "ltr"
                            },
                            {
                                "start": 66464,
                                "end": 66499,
                                "direction": "ltr"
                            },
                            {
                                "start": 66504,
                                "end": 66511,
                                "direction": "ltr"
                            },
                            {
                                "start": 66512,
                                "end": 66512,
                                "direction": "ltr"
                            },
                            {
                                "start": 66513,
                                "end": 66517,
                                "direction": "ltr"
                            },
                            {
                                "start": 66560,
                                "end": 66639,
                                "direction": "ltr"
                            },
                            {
                                "start": 66640,
                                "end": 66717,
                                "direction": "ltr"
                            },
                            {
                                "start": 66720,
                                "end": 66729,
                                "direction": "ltr"
                            },
                            {
                                "start": 67584,
                                "end": 67589,
                                "direction": "rtl"
                            },
                            {
                                "start": 67590,
                                "end": 67591,
                                "direction": "rtl"
                            },
                            {
                                "start": 67592,
                                "end": 67592,
                                "direction": "rtl"
                            }
                        ]
                    },
                    {
                        "start": 67593,
                        "end": 67839,
                        "values": [
                            {
                                "start": 67593,
                                "end": 67593,
                                "direction": "rtl"
                            },
                            {
                                "start": 67594,
                                "end": 67637,
                                "direction": "rtl"
                            },
                            {
                                "start": 67638,
                                "end": 67638,
                                "direction": "rtl"
                            },
                            {
                                "start": 67639,
                                "end": 67640,
                                "direction": "rtl"
                            },
                            {
                                "start": 67641,
                                "end": 67643,
                                "direction": "rtl"
                            },
                            {
                                "start": 67644,
                                "end": 67644,
                                "direction": "rtl"
                            },
                            {
                                "start": 67645,
                                "end": 67646,
                                "direction": "rtl"
                            },
                            {
                                "start": 67647,
                                "end": 67669,
                                "direction": "rtl"
                            },
                            {
                                "start": 67670,
                                "end": 67670,
                                "direction": "rtl"
                            },
                            {
                                "start": 67671,
                                "end": 67671,
                                "direction": "rtl"
                            },
                            {
                                "start": 67672,
                                "end": 67679,
                                "direction": "rtl"
                            },
                            {
                                "start": 67680,
                                "end": 67839,
                                "direction": "rtl"
                            }
                        ]
                    },
                    {
                        "start": 67840,
                        "end": 68096,
                        "values": [
                            {
                                "start": 67840,
                                "end": 67861,
                                "direction": "rtl"
                            },
                            {
                                "start": 67862,
                                "end": 67867,
                                "direction": "rtl"
                            },
                            {
                                "start": 67868,
                                "end": 67870,
                                "direction": "rtl"
                            },
                            {
                                "start": 67872,
                                "end": 67897,
                                "direction": "rtl"
                            },
                            {
                                "start": 67898,
                                "end": 67902,
                                "direction": "rtl"
                            },
                            {
                                "start": 67903,
                                "end": 67903,
                                "direction": "rtl"
                            },
                            {
                                "start": 67904,
                                "end": 67967,
                                "direction": "rtl"
                            },
                            {
                                "start": 67968,
                                "end": 68023,
                                "direction": "rtl"
                            },
                            {
                                "start": 68024,
                                "end": 68029,
                                "direction": "rtl"
                            },
                            {
                                "start": 68030,
                                "end": 68031,
                                "direction": "rtl"
                            },
                            {
                                "start": 68032,
                                "end": 68095,
                                "direction": "rtl"
                            },
                            {
                                "start": 68096,
                                "end": 68096,
                                "direction": "rtl"
                            }
                        ]
                    },
                    {
                        "start": 68100,
                        "end": 68184,
                        "values": [
                            {
                                "start": 68100,
                                "end": 68100,
                                "direction": "rtl"
                            },
                            {
                                "start": 68103,
                                "end": 68107,
                                "direction": "rtl"
                            },
                            {
                                "start": 68112,
                                "end": 68115,
                                "direction": "rtl"
                            },
                            {
                                "start": 68116,
                                "end": 68116,
                                "direction": "rtl"
                            },
                            {
                                "start": 68117,
                                "end": 68119,
                                "direction": "rtl"
                            },
                            {
                                "start": 68120,
                                "end": 68120,
                                "direction": "rtl"
                            },
                            {
                                "start": 68121,
                                "end": 68147,
                                "direction": "rtl"
                            },
                            {
                                "start": 68148,
                                "end": 68151,
                                "direction": "rtl"
                            },
                            {
                                "start": 68155,
                                "end": 68158,
                                "direction": "rtl"
                            },
                            {
                                "start": 68160,
                                "end": 68167,
                                "direction": "rtl"
                            },
                            {
                                "start": 68168,
                                "end": 68175,
                                "direction": "rtl"
                            },
                            {
                                "start": 68176,
                                "end": 68184,
                                "direction": "rtl"
                            }
                        ]
                    }
                ]
            },
            {
                "start": 68185,
                "end": 120687,
                "values": [
                    {
                        "start": 68185,
                        "end": 68479,
                        "values": [
                            {
                                "start": 68185,
                                "end": 68191,
                                "direction": "rtl"
                            },
                            {
                                "start": 68192,
                                "end": 68220,
                                "direction": "rtl"
                            },
                            {
                                "start": 68221,
                                "end": 68222,
                                "direction": "rtl"
                            },
                            {
                                "start": 68223,
                                "end": 68223,
                                "direction": "rtl"
                            },
                            {
                                "start": 68224,
                                "end": 68351,
                                "direction": "rtl"
                            },
                            {
                                "start": 68352,
                                "end": 68405,
                                "direction": "rtl"
                            },
                            {
                                "start": 68406,
                                "end": 68408,
                                "direction": "rtl"
                            },
                            {
                                "start": 68416,
                                "end": 68437,
                                "direction": "rtl"
                            },
                            {
                                "start": 68438,
                                "end": 68439,
                                "direction": "rtl"
                            },
                            {
                                "start": 68440,
                                "end": 68447,
                                "direction": "rtl"
                            },
                            {
                                "start": 68448,
                                "end": 68466,
                                "direction": "rtl"
                            },
                            {
                                "start": 68467,
                                "end": 68471,
                                "direction": "rtl"
                            },
                            {
                                "start": 68472,
                                "end": 68479,
                                "direction": "rtl"
                            }
                        ]
                    },
                    {
                        "start": 68480,
                        "end": 69810,
                        "values": [
                            {
                                "start": 68480,
                                "end": 68607,
                                "direction": "rtl"
                            },
                            {
                                "start": 68608,
                                "end": 68680,
                                "direction": "rtl"
                            },
                            {
                                "start": 68681,
                                "end": 69215,
                                "direction": "rtl"
                            },
                            {
                                "start": 69247,
                                "end": 69631,
                                "direction": "rtl"
                            },
                            {
                                "start": 69632,
                                "end": 69632,
                                "direction": "ltr"
                            },
                            {
                                "start": 69634,
                                "end": 69634,
                                "direction": "ltr"
                            },
                            {
                                "start": 69635,
                                "end": 69687,
                                "direction": "ltr"
                            },
                            {
                                "start": 69703,
                                "end": 69709,
                                "direction": "ltr"
                            },
                            {
                                "start": 69734,
                                "end": 69743,
                                "direction": "ltr"
                            },
                            {
                                "start": 69762,
                                "end": 69762,
                                "direction": "ltr"
                            },
                            {
                                "start": 69763,
                                "end": 69807,
                                "direction": "ltr"
                            },
                            {
                                "start": 69808,
                                "end": 69810,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 69815,
                        "end": 70066,
                        "values": [
                            {
                                "start": 69815,
                                "end": 69816,
                                "direction": "ltr"
                            },
                            {
                                "start": 69819,
                                "end": 69820,
                                "direction": "ltr"
                            },
                            {
                                "start": 69821,
                                "end": 69821,
                                "direction": "ltr"
                            },
                            {
                                "start": 69822,
                                "end": 69825,
                                "direction": "ltr"
                            },
                            {
                                "start": 69840,
                                "end": 69864,
                                "direction": "ltr"
                            },
                            {
                                "start": 69872,
                                "end": 69881,
                                "direction": "ltr"
                            },
                            {
                                "start": 69891,
                                "end": 69926,
                                "direction": "ltr"
                            },
                            {
                                "start": 69932,
                                "end": 69932,
                                "direction": "ltr"
                            },
                            {
                                "start": 69942,
                                "end": 69951,
                                "direction": "ltr"
                            },
                            {
                                "start": 69952,
                                "end": 69955,
                                "direction": "ltr"
                            },
                            {
                                "start": 70018,
                                "end": 70018,
                                "direction": "ltr"
                            },
                            {
                                "start": 70019,
                                "end": 70066,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 70067,
                        "end": 74850,
                        "values": [
                            {
                                "start": 70067,
                                "end": 70069,
                                "direction": "ltr"
                            },
                            {
                                "start": 70079,
                                "end": 70080,
                                "direction": "ltr"
                            },
                            {
                                "start": 70081,
                                "end": 70084,
                                "direction": "ltr"
                            },
                            {
                                "start": 70085,
                                "end": 70088,
                                "direction": "ltr"
                            },
                            {
                                "start": 70096,
                                "end": 70105,
                                "direction": "ltr"
                            },
                            {
                                "start": 71296,
                                "end": 71338,
                                "direction": "ltr"
                            },
                            {
                                "start": 71340,
                                "end": 71340,
                                "direction": "ltr"
                            },
                            {
                                "start": 71342,
                                "end": 71343,
                                "direction": "ltr"
                            },
                            {
                                "start": 71350,
                                "end": 71350,
                                "direction": "ltr"
                            },
                            {
                                "start": 71360,
                                "end": 71369,
                                "direction": "ltr"
                            },
                            {
                                "start": 73728,
                                "end": 74606,
                                "direction": "ltr"
                            },
                            {
                                "start": 74752,
                                "end": 74850,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 74864,
                        "end": 119142,
                        "values": [
                            {
                                "start": 74864,
                                "end": 74867,
                                "direction": "ltr"
                            },
                            {
                                "start": 77824,
                                "end": 78894,
                                "direction": "ltr"
                            },
                            {
                                "start": 92160,
                                "end": 92728,
                                "direction": "ltr"
                            },
                            {
                                "start": 93952,
                                "end": 94020,
                                "direction": "ltr"
                            },
                            {
                                "start": 94032,
                                "end": 94032,
                                "direction": "ltr"
                            },
                            {
                                "start": 94033,
                                "end": 94078,
                                "direction": "ltr"
                            },
                            {
                                "start": 94099,
                                "end": 94111,
                                "direction": "ltr"
                            },
                            {
                                "start": 110592,
                                "end": 110593,
                                "direction": "ltr"
                            },
                            {
                                "start": 118784,
                                "end": 119029,
                                "direction": "ltr"
                            },
                            {
                                "start": 119040,
                                "end": 119078,
                                "direction": "ltr"
                            },
                            {
                                "start": 119081,
                                "end": 119140,
                                "direction": "ltr"
                            },
                            {
                                "start": 119141,
                                "end": 119142,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 119146,
                        "end": 119980,
                        "values": [
                            {
                                "start": 119146,
                                "end": 119148,
                                "direction": "ltr"
                            },
                            {
                                "start": 119149,
                                "end": 119154,
                                "direction": "ltr"
                            },
                            {
                                "start": 119171,
                                "end": 119172,
                                "direction": "ltr"
                            },
                            {
                                "start": 119180,
                                "end": 119209,
                                "direction": "ltr"
                            },
                            {
                                "start": 119214,
                                "end": 119261,
                                "direction": "ltr"
                            },
                            {
                                "start": 119648,
                                "end": 119665,
                                "direction": "ltr"
                            },
                            {
                                "start": 119808,
                                "end": 119892,
                                "direction": "ltr"
                            },
                            {
                                "start": 119894,
                                "end": 119964,
                                "direction": "ltr"
                            },
                            {
                                "start": 119966,
                                "end": 119967,
                                "direction": "ltr"
                            },
                            {
                                "start": 119970,
                                "end": 119970,
                                "direction": "ltr"
                            },
                            {
                                "start": 119973,
                                "end": 119974,
                                "direction": "ltr"
                            },
                            {
                                "start": 119977,
                                "end": 119980,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 119982,
                        "end": 120144,
                        "values": [
                            {
                                "start": 119982,
                                "end": 119993,
                                "direction": "ltr"
                            },
                            {
                                "start": 119995,
                                "end": 119995,
                                "direction": "ltr"
                            },
                            {
                                "start": 119997,
                                "end": 120003,
                                "direction": "ltr"
                            },
                            {
                                "start": 120005,
                                "end": 120069,
                                "direction": "ltr"
                            },
                            {
                                "start": 120071,
                                "end": 120074,
                                "direction": "ltr"
                            },
                            {
                                "start": 120077,
                                "end": 120084,
                                "direction": "ltr"
                            },
                            {
                                "start": 120086,
                                "end": 120092,
                                "direction": "ltr"
                            },
                            {
                                "start": 120094,
                                "end": 120121,
                                "direction": "ltr"
                            },
                            {
                                "start": 120123,
                                "end": 120126,
                                "direction": "ltr"
                            },
                            {
                                "start": 120128,
                                "end": 120132,
                                "direction": "ltr"
                            },
                            {
                                "start": 120134,
                                "end": 120134,
                                "direction": "ltr"
                            },
                            {
                                "start": 120138,
                                "end": 120144,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 120146,
                        "end": 120687,
                        "values": [
                            {
                                "start": 120146,
                                "end": 120485,
                                "direction": "ltr"
                            },
                            {
                                "start": 120488,
                                "end": 120512,
                                "direction": "ltr"
                            },
                            {
                                "start": 120513,
                                "end": 120513,
                                "direction": "ltr"
                            },
                            {
                                "start": 120514,
                                "end": 120538,
                                "direction": "ltr"
                            },
                            {
                                "start": 120540,
                                "end": 120570,
                                "direction": "ltr"
                            },
                            {
                                "start": 120571,
                                "end": 120571,
                                "direction": "ltr"
                            },
                            {
                                "start": 120572,
                                "end": 120596,
                                "direction": "ltr"
                            },
                            {
                                "start": 120598,
                                "end": 120628,
                                "direction": "ltr"
                            },
                            {
                                "start": 120629,
                                "end": 120629,
                                "direction": "ltr"
                            },
                            {
                                "start": 120630,
                                "end": 120654,
                                "direction": "ltr"
                            },
                            {
                                "start": 120656,
                                "end": 120686,
                                "direction": "ltr"
                            },
                            {
                                "start": 120687,
                                "end": 120687,
                                "direction": "ltr"
                            }
                        ]
                    }
                ]
            },
            {
                "start": 120688,
                "end": 1114109,
                "values": [
                    {
                        "start": 120688,
                        "end": 126499,
                        "values": [
                            {
                                "start": 120688,
                                "end": 120712,
                                "direction": "ltr"
                            },
                            {
                                "start": 120714,
                                "end": 120744,
                                "direction": "ltr"
                            },
                            {
                                "start": 120745,
                                "end": 120745,
                                "direction": "ltr"
                            },
                            {
                                "start": 120746,
                                "end": 120770,
                                "direction": "ltr"
                            },
                            {
                                "start": 120772,
                                "end": 120779,
                                "direction": "ltr"
                            },
                            {
                                "start": 124928,
                                "end": 126463,
                                "direction": "rtl"
                            },
                            {
                                "start": 126464,
                                "end": 126467,
                                "direction": "rtl"
                            },
                            {
                                "start": 126468,
                                "end": 126468,
                                "direction": "rtl"
                            },
                            {
                                "start": 126469,
                                "end": 126495,
                                "direction": "rtl"
                            },
                            {
                                "start": 126496,
                                "end": 126496,
                                "direction": "rtl"
                            },
                            {
                                "start": 126497,
                                "end": 126498,
                                "direction": "rtl"
                            },
                            {
                                "start": 126499,
                                "end": 126499,
                                "direction": "rtl"
                            }
                        ]
                    },
                    {
                        "start": 126500,
                        "end": 126529,
                        "values": [
                            {
                                "start": 126500,
                                "end": 126500,
                                "direction": "rtl"
                            },
                            {
                                "start": 126501,
                                "end": 126502,
                                "direction": "rtl"
                            },
                            {
                                "start": 126503,
                                "end": 126503,
                                "direction": "rtl"
                            },
                            {
                                "start": 126504,
                                "end": 126504,
                                "direction": "rtl"
                            },
                            {
                                "start": 126505,
                                "end": 126514,
                                "direction": "rtl"
                            },
                            {
                                "start": 126515,
                                "end": 126515,
                                "direction": "rtl"
                            },
                            {
                                "start": 126516,
                                "end": 126519,
                                "direction": "rtl"
                            },
                            {
                                "start": 126520,
                                "end": 126520,
                                "direction": "rtl"
                            },
                            {
                                "start": 126521,
                                "end": 126521,
                                "direction": "rtl"
                            },
                            {
                                "start": 126522,
                                "end": 126522,
                                "direction": "rtl"
                            },
                            {
                                "start": 126523,
                                "end": 126523,
                                "direction": "rtl"
                            },
                            {
                                "start": 126524,
                                "end": 126529,
                                "direction": "rtl"
                            }
                        ]
                    },
                    {
                        "start": 126530,
                        "end": 126547,
                        "values": [
                            {
                                "start": 126530,
                                "end": 126530,
                                "direction": "rtl"
                            },
                            {
                                "start": 126531,
                                "end": 126534,
                                "direction": "rtl"
                            },
                            {
                                "start": 126535,
                                "end": 126535,
                                "direction": "rtl"
                            },
                            {
                                "start": 126536,
                                "end": 126536,
                                "direction": "rtl"
                            },
                            {
                                "start": 126537,
                                "end": 126537,
                                "direction": "rtl"
                            },
                            {
                                "start": 126538,
                                "end": 126538,
                                "direction": "rtl"
                            },
                            {
                                "start": 126539,
                                "end": 126539,
                                "direction": "rtl"
                            },
                            {
                                "start": 126540,
                                "end": 126540,
                                "direction": "rtl"
                            },
                            {
                                "start": 126541,
                                "end": 126543,
                                "direction": "rtl"
                            },
                            {
                                "start": 126544,
                                "end": 126544,
                                "direction": "rtl"
                            },
                            {
                                "start": 126545,
                                "end": 126546,
                                "direction": "rtl"
                            },
                            {
                                "start": 126547,
                                "end": 126547,
                                "direction": "rtl"
                            }
                        ]
                    },
                    {
                        "start": 126548,
                        "end": 126560,
                        "values": [
                            {
                                "start": 126548,
                                "end": 126548,
                                "direction": "rtl"
                            },
                            {
                                "start": 126549,
                                "end": 126550,
                                "direction": "rtl"
                            },
                            {
                                "start": 126551,
                                "end": 126551,
                                "direction": "rtl"
                            },
                            {
                                "start": 126552,
                                "end": 126552,
                                "direction": "rtl"
                            },
                            {
                                "start": 126553,
                                "end": 126553,
                                "direction": "rtl"
                            },
                            {
                                "start": 126554,
                                "end": 126554,
                                "direction": "rtl"
                            },
                            {
                                "start": 126555,
                                "end": 126555,
                                "direction": "rtl"
                            },
                            {
                                "start": 126556,
                                "end": 126556,
                                "direction": "rtl"
                            },
                            {
                                "start": 126557,
                                "end": 126557,
                                "direction": "rtl"
                            },
                            {
                                "start": 126558,
                                "end": 126558,
                                "direction": "rtl"
                            },
                            {
                                "start": 126559,
                                "end": 126559,
                                "direction": "rtl"
                            },
                            {
                                "start": 126560,
                                "end": 126560,
                                "direction": "rtl"
                            }
                        ]
                    },
                    {
                        "start": 126561,
                        "end": 126589,
                        "values": [
                            {
                                "start": 126561,
                                "end": 126562,
                                "direction": "rtl"
                            },
                            {
                                "start": 126563,
                                "end": 126563,
                                "direction": "rtl"
                            },
                            {
                                "start": 126564,
                                "end": 126564,
                                "direction": "rtl"
                            },
                            {
                                "start": 126565,
                                "end": 126566,
                                "direction": "rtl"
                            },
                            {
                                "start": 126567,
                                "end": 126570,
                                "direction": "rtl"
                            },
                            {
                                "start": 126571,
                                "end": 126571,
                                "direction": "rtl"
                            },
                            {
                                "start": 126572,
                                "end": 126578,
                                "direction": "rtl"
                            },
                            {
                                "start": 126579,
                                "end": 126579,
                                "direction": "rtl"
                            },
                            {
                                "start": 126580,
                                "end": 126583,
                                "direction": "rtl"
                            },
                            {
                                "start": 126584,
                                "end": 126584,
                                "direction": "rtl"
                            },
                            {
                                "start": 126585,
                                "end": 126588,
                                "direction": "rtl"
                            },
                            {
                                "start": 126589,
                                "end": 126589,
                                "direction": "rtl"
                            }
                        ]
                    },
                    {
                        "start": 126590,
                        "end": 126703,
                        "values": [
                            {
                                "start": 126590,
                                "end": 126590,
                                "direction": "rtl"
                            },
                            {
                                "start": 126591,
                                "end": 126591,
                                "direction": "rtl"
                            },
                            {
                                "start": 126592,
                                "end": 126601,
                                "direction": "rtl"
                            },
                            {
                                "start": 126602,
                                "end": 126602,
                                "direction": "rtl"
                            },
                            {
                                "start": 126603,
                                "end": 126619,
                                "direction": "rtl"
                            },
                            {
                                "start": 126620,
                                "end": 126624,
                                "direction": "rtl"
                            },
                            {
                                "start": 126625,
                                "end": 126627,
                                "direction": "rtl"
                            },
                            {
                                "start": 126628,
                                "end": 126628,
                                "direction": "rtl"
                            },
                            {
                                "start": 126629,
                                "end": 126633,
                                "direction": "rtl"
                            },
                            {
                                "start": 126634,
                                "end": 126634,
                                "direction": "rtl"
                            },
                            {
                                "start": 126635,
                                "end": 126651,
                                "direction": "rtl"
                            },
                            {
                                "start": 126652,
                                "end": 126703,
                                "direction": "rtl"
                            }
                        ]
                    },
                    {
                        "start": 126706,
                        "end": 178205,
                        "values": [
                            {
                                "start": 126706,
                                "end": 126719,
                                "direction": "rtl"
                            },
                            {
                                "start": 126720,
                                "end": 126975,
                                "direction": "rtl"
                            },
                            {
                                "start": 127248,
                                "end": 127278,
                                "direction": "ltr"
                            },
                            {
                                "start": 127280,
                                "end": 127337,
                                "direction": "ltr"
                            },
                            {
                                "start": 127344,
                                "end": 127386,
                                "direction": "ltr"
                            },
                            {
                                "start": 127462,
                                "end": 127490,
                                "direction": "ltr"
                            },
                            {
                                "start": 127504,
                                "end": 127546,
                                "direction": "ltr"
                            },
                            {
                                "start": 127552,
                                "end": 127560,
                                "direction": "ltr"
                            },
                            {
                                "start": 127568,
                                "end": 127569,
                                "direction": "ltr"
                            },
                            {
                                "start": 131072,
                                "end": 173782,
                                "direction": "ltr"
                            },
                            {
                                "start": 173824,
                                "end": 177972,
                                "direction": "ltr"
                            },
                            {
                                "start": 177984,
                                "end": 178205,
                                "direction": "ltr"
                            }
                        ]
                    },
                    {
                        "start": 194560,
                        "end": 1114109,
                        "values": [
                            {
                                "start": 194560,
                                "end": 195101,
                                "direction": "ltr"
                            },
                            {
                                "start": 983040,
                                "end": 1048573,
                                "direction": "ltr"
                            },
                            {
                                "start": 1048576,
                                "end": 1114109,
                                "direction": "ltr"
                            }
                        ]
                    }
                ]
            }
        ];
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// TreeNode object

/// <reference path="Debug.js" />

/*global Debug,Jx*/

Jx.TreeNode = /*@constructor*/function () { 
};

Jx.TreeNode.Error = {
    /// <summary>Jx.TreeNode errors.</summary>
    invalidChild: "Invalid child",
    unexpectedParent: "Unexpected parent"
};

// Private members
Jx.TreeNode.prototype = {
    _parent: /*@static_cast(Jx.TreeNode)*/null,
    _children: /*@static_cast(Array)*/null,

    getParent: function () {
        /// <summary>Get the parent node.</summary>
        /// <returns type="Jx.TreeNode">Returns the parent node, null if it's the root.</returns>    

        return this._parent;
    },

    _setParent: function (parentNode) {
        /// <summary>
        /// Set the parent node.
        /// It's an internal function, external callers should update the children.
        /// </summary>
        /// <param name="parent" type="Jx.TreeNode">Parent node to set.</param>

        this._parent = parentNode;
    },

    isRoot: function () {
        /// <summary>Check if this node is the tree root.</summary>
        /// <returns type="Boolean">Returns true if the node is the root (has no parent).</returns>    

        return this._parent === null;
    },

    // This method intentionally returns undefined in the default case.
    /// <disable>JS3054.NotAllCodePathsReturnValue</disable>
    getChild: function (index) {
        /// <summary>Returns the child with the given index.</summary>
        /// <param name="index" type="Number">Index of the child.</param>
        /// <returns type="Jx.TreeNode">Returns the child node or undefined if the child is invalid.</returns>    

        if (this._children !== null) {
            return this._children[index];
        }
    },
    /// <enable>JS3054.NotAllCodePathsReturnValue</enable>

    getChildrenCount: function () {
        /// <summary>Get the number of children.</summary>
        /// <returns type="Number">Returns the number of children.</returns>    

        if (this._children === null) {
            return 0;
        }
        return this._children.length;
    },

    hasChildren: function () {
        /// <summary>Check if the node has children.</summary>
        /// <returns type="Boolean">Returns true if the node has children.</returns>    

        return this.getChildrenCount() !== 0;
    },

    insertChild: function (child, index) {
        /// <summary>Inserts a node to the children array at the specified position.</summary>
        /// <param name="child" type="Jx.TreeNode">Child node to insert.</param>
        /// <param name="index" type="Number">Position to insert.</param>

        if (child === null || child === undefined || child === this || !child.getParent) {
            throw Jx.TreeNode.Error.invalidChild;
        }

        if (child.getParent() !== null) {
            throw Jx.TreeNode.Error.unexpectedParent;
        }

        // Allocate the children array if needed
        if (this._children === null) {
            this._children = [];
        }

        this._children.splice(index, 0, child);

        child._setParent(this);
    },

    appendChild: function (child) {
        /// <summary>Appends a node to the children array.</summary>
        /// <param name="child" type="Jx.TreeNode">Child node to append.</param>
        this.insertChild(child, this._children ? this._children.length : 0);
    },

    append: /*@varargs*/function () {
        /// <summary>Appends multiple nodes to the children array.</summary>

        for (var i = 0, len = arguments.length; i < len; i++) {
            this.appendChild(arguments[i]);
        }
    },

    removeChildAt: function (index) {
        /// <summary>Removes the child at the given index.</summary>
        /// <param name="index" type="Number">Index of the child to remove.</param>

        Debug.assert(Jx.isValidNumber(index));
        Debug.assert(index >= 0 && index < this._children.length);

        var child;
        var children = this._children;
        if (children !== null) {
            child = children.splice(index, 1)[0];
            child._setParent(null);
        }
        return child;
    },

    removeChild: function (child) {
        /// <summary>Removes the given child node.</summary>
        /// <param name="child" type="Jx.TreeNode">Child node to remove.</param>

        if (this._children !== null) {
            var children = this._children;
            var index = children.indexOf(child);
            if (index !== -1) {
                children[index]._setParent(null);
                children.splice(index, 1);
            }
        }
    },

    removeChildren: function () {
        /// <summary>Removes all children.</summary>

        var children = this._children;
        if (children !== null) {
            for (var i = 0, len = children.length; i < len; i++) {
                children[i]._setParent(null);
            }
            this._children = null;
        }
    },

    forEachChild: function (fn, /*@dynamic*/obj) {
        /// <summary>Calls obj.fn() for each child</summary>
        /// <param name="fn" type="Function">Callback function. $TODO describe fn args</param>
        /// <param name="obj" optional="true">"this" object for the callback function.</param>

        if (this._children !== null) {
            this._children.forEach(fn, obj);
        }
    },

    indexOfChild: function (child) {
        ///<summary>Returns the index of a given child</summary>
        ///<param name="child" type="Jx.TreeNode">The child to locate</param>
        ///<returns type="Number">The index of the child, or -1 if not found</returns>

        if (this._children === null) {
            return -1;
        }
        return this._children.indexOf(child);
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

// EventManager object

/// <reference path="Jx.js" />
/// <reference path="Jx.ref.js" />
/// <reference path="TreeNode.js" />
/// <reference path="Component.js" />

/*global Debug,Jx*/

Jx.EventManager = {

    // $TODO add a shutdown method and ensure that all listeners are removed

    Stages: {
        /// <summary>Event stages.</summary>
        routing:    1,
        direct:     2,
        bubbling:   3,
        broadcast:  4
    },

    addListener: function (/*@dynamic*/target, type, fn, /*@dynamic*/context) {
        /// <summary>Adds a listener on a target.</summary>
        /// <param name="target">Event target object.</param>
        /// <param name="type" type="String">Event type.</param>
        /// <param name="fn" type="Function">Listener.</param>
        /// <param name="context" optional="true">"this" object in listener.</param>

        Debug.assert(Jx.isFunction(fn));

        // If we have an invalid target then use the global EventManager object
        if (!target) {
            target = this;
        }

        // Get or create the events map for this event type
        var events = target._jxEvents || (target._jxEvents = {});

        // Get or create the target's listeners of this event type
        var /*@type(Array)*/listeners = events[type] || (events[type] = []);

        // Add the handler info to the listeners. We don't check for duplicates.
        listeners.push({ fn: fn, context: context });
    },

    removeListener: function (/*@dynamic*/target, type, fn, /*@dynamic*/context) {
        /// <summary>Removes a listener from a target.</summary>
        /// <param name="target">Event target object.</param>
        /// <param name="type" type="String">Event type.</param>
        /// <param name="fn" type="Function">Listener.</param>
        /// <param name="context" optional="true">"this" object in listener.</param>

        Debug.assert(Jx.isFunction(fn));

        // If we have an invalid target then use the global EventManager object
        if (!target) {
            target = this;
        }

        var events = target._jxEvents;

        // Only do work if we have events on this target
        if (events) {
            var /*@type(Array)*/listeners = events[type];

            if (listeners) {
                // Loop through the listeners, trying to find a match
                for (var i = 0; i < listeners.length; i++) {
                    var /*@type(JxEventListener)*/listener = listeners[i];

                    if (listener.fn === fn && listener.context === context) {
                        // Remove the match and return. This means that if the same context and fn were added N times 
                        // then they have to be removed N times.
                        listeners.splice(i, 1);
                        return;
                    }
                }
            }
        }
    },

    // $TODO add a public method fire(event)

    fire: function (/*@dynamic*/source, type, /*@dynamic*/data, options) {
        /// <summary>Fires an event on the source</summary>
        /// <param name="source">Event source object.</param>
        /// <param name="type" type="String">Event type.</param>
        /// <param name="data" optional="true">Custom data in the event.</param>
        /// <param name="options" type="JxEventOptions" optional="true">Event options.</param>

        Debug.assert(Jx.isObjectType(source)); // 'null' is ok

        var chain = null;
        var ev = {
            source: source,
            type: type,
            data: data,

            routes: options && "routes" in options ? options.routes : true,
            bubbles: options && "bubbles" in options ? options.bubbles : true,
            stage: null,

            handled: false,
            cancel: false
        };

        // We want the event to be fired with a null or undefined source if
        // that's what was passed in. However, we need a valid source in order
        // to find the event's listeners.
        if (!source) {
            source = this;
        }

        // Build the ancestor chain for routing and bubbling
        if (ev.routes || ev.bubbles) {
            chain = this._buildEventChain(source, type);
        }

        // Do routing if we need to
        if (ev.routes) {
            ev.stage = this.Stages.routing;

            for (var i = chain.length - 1; i >= 0; i--) {
                this._fire(ev, chain[i]);

                if (ev.cancel) {
                    return;
                }
            }
        }

        // Now do direct
        var events = source._jxEvents;

        if (events) {
            var listeners = events[type];

            if (listeners) {
                ev.stage = this.Stages.direct;

                this._fire(ev, listeners);

                if (ev.cancel) {
                    return;
                }
            }
        }

        // Finish up with bubbling
        if (ev.bubbles) {
            ev.stage = this.Stages.bubbling;

            for (var j = 0; j < chain.length; j++) {
                this._fire(ev, chain[j]);

                if (ev.cancel) {
                    return;
                }
            }
        }
    },

    fireDirect: function (/*@dynamic*/source, type, /*@dynamic*/data) {
        /// <summary>Fires a direct event (no routing, no bubbling) on a source.</summary>
        /// <param name="source">Event source object.</param>
        /// <param name="type" type="String">Event type.</param>
        /// <param name="data" optional="true">Custom data in the event.</param>

        Debug.assert(Jx.isObjectType(source)); // 'null' is ok

        this.fire(source, type, data, { bubbles: false, routes: false });
    },

    broadcast: function (type, /*@dynamic*/data, root) {
        /// <summary>Broadcasts an event starting from the root.</summary>
        /// <param name="type" type="String">Event type.</param>
        /// <param name="data" optional="true">Custom data in the event.</param>
        /// <param name="root" type="Jx.TreeNode" optional="true">Start node for broadcast.</param>

        if (!root) {
            root = /*@static_cast(Jx.TreeNode)*/Jx.root;
        }

        if (root) {
            var ev = {
                source: root,
                type: type,
                data: data,

                routes: false,
                bubbles: false,
                stage: Jx.EventManager.Stages.broadcast,

                cancel: false
            };

            Jx.EventManager._broadcast(/*@static_cast(JxEvent)*/ev, root);
        }
    },

    _buildEventChain: function (/*@dynamic*/source, type) {
        /// <summary>Returns an array with all ancestors that have listeners for "type".</summary>
        /// <param name="source">Event source object.</param>
        /// <param name="type" type="String">Event type.</param>

        var chain = [];

        if (source.getParent) {
            var /*@dynamic*/ancestor;
            for (ancestor = source.getParent(); ancestor; ancestor = ancestor.getParent()) {
                var events = ancestor._jxEvents;

                if (events) {
                    var listeners = events[type];

                    if (listeners) {
                        chain.push(listeners);
                    }
                }
            }
        }

        return chain;
    },

    _fire: function (ev, listeners) {
        /// <summary>Invokes the listeners with the given event.</summary>
        /// <param name="ev" type="JxEvent">Event object.</param>
        /// <param name="listeners" type="Array">Array of listeners.</param>

        for (var i = 0; i < listeners.length && !ev.cancel; i++) {
            var /*@type(JxEventListener)*/listener = listeners[i];
            listener.fn.call(listener.context, ev);
        }
    },

    _broadcast: function (ev, /*@dynamic*/target) {
        /// <summary>Broadcasts an event starting from the target.</summary>
        /// <param name="ev" type="JxEvent">Event object.</param>
        /// <param name="target" type="Jx.TreeNode">Event target object.</param>

        var events = target._jxEvents;

        if (events) {
            var listeners = events[ev.type];

            if (listeners) {
                this._fire(ev, listeners);
            }
        }

        if (!ev.cancel && target.getChild) {
            var count = target.getChildrenCount();

            for (var i = 0; i < count; i++) {
                this._broadcast(ev, target.getChild(i));
            }
        }
    }
};

// $TODO add dumpTargets in debug


;//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// EventTarget object

/// <reference path="EventManager.js" />
/// <reference path="Jx.ref.js" />

Jx.EventTarget = {};

Jx.EventTarget.on = function (type, fn, /*@dynamic*/context) {
    /// <summary>Adds an event listener.</summary>
    /// <param name="type" type="String">Event type.</param>
    /// <param name="fn" type="Function">Listener.</param>
    /// <param name="context" type="Object" optional="true">"this" object in listener.</param>

    Jx.EventManager.addListener(this, type, fn, context || this);
};

Jx.EventTarget.detach = function (type, fn, /*@dynamic*/context) {
    /// <summary>Removes an event listener</summary>
    /// <param name="type" type="String">Event type.</param>
    /// <param name="fn" type="Function">Listener.</param>
    /// <param name="context" optional="true">"this" object in listener.</param>

    Jx.EventManager.removeListener(this, type, fn, context || this);
};

Jx.EventTarget.fire = function (type, /*@dynamic*/data, /*@optional*/options) {
    /// <summary>Fires an event</summary>
    /// <param name="type" type="String">Event type.</param>
    /// <param name="data" optional="true">Custom data in the event.</param>
    /// <param name="options" type="JxEventOptions" optional="true">Event options.</param>

    Jx.EventManager.fire(this, type, data, options);
};

Jx.EventTarget.fireDirect = function (type, /*@dynamic*/data) {
    /// <summary>Fires a direct event</summary>
    /// <param name="type" type="String">Event type.</param>
    /// <param name="data" optional="true">Custom data in the event.</param>

    Jx.EventManager.fireDirect(this, type, data);
};


//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Hash2 object - 2 level hash table

/// <reference path="Jx.js" />

/*global Jx,Debug*/

Jx.Hash2 = /*@constructor*/ function () {
    /// <summary>Constructor</summary>
    
    Debug.assert(this instanceof Jx.Hash2);
    this._data = {};
};

Jx.Hash2.prototype = {
    // Private storage object
    _data: null,

    set: function (key1, key2, /*@dynamic*/value) {
        /// <summary>Sets value to _data[key1][key2].</summary>
        /// <param name="key1" type="String">key1</param>
        /// <param name="key2" type="String">key2</param>
        /// <param name="value">Value to set.</param>

        Debug.assert(Jx.isNonEmptyString(key1));
        Debug.assert(Jx.isNonEmptyString(key2));

        var d = this._data;
        d[key1] = d[key1] || {};
        d[key1][key2] = value;
    },

    setAll: function (key1, obj) {
        /// <summary>Copy all properties from obj to _data[key1].</summary>
        /// <param name="key1" type="String">key1</param>
        /// <param name="obj" type="Object">Source object.</param>

        Debug.assert(Jx.isNonEmptyString(key1));
        Debug.assert(Jx.isObject(obj));

        var key2;
        for (key2 in obj) {
            if (obj.hasOwnProperty(key2)) {
                this.set(key1, key2, obj[key2]);
            }
        }
    },

    get: /*@dynamic*/function (key1, key2) {
        /// <summary>Returns _data[key1][key2].</summary>
        /// <param name="key1" type="String">key1</param>
        /// <param name="key2" type="String">key2</param>
        /// <returns>Returns _data[key1][key2].</returns>

        Debug.assert(Jx.isNonEmptyString(key1));
        Debug.assert(Jx.isNonEmptyString(key2));

        var d = this._data;
        return (d[key1] && key2 in d[key1]) ? d[key1][key2] : undefined;
    },

    has: function (key1, key2) {
        /// <summary>Checks if _data[key1][key2] exists. key2 is optional.</summary>
        /// <param name="key1" type="String">key1</param>
        /// <param name="key2" type="String" optional="true">key2</param>
        /// <returns type="Boolean">Returns true if _data[key1][key2] exists.</returns>
        
        Debug.assert(Jx.isNonEmptyString(key1));
        Debug.assert(key2 === undefined || Jx.isNonEmptyString(key2));

        var d = this._data;

        if (d[key1]) {
            if (key2 === undefined) {
                return true;
            } else {
                return key2 in d[key1];
            }
        }

        return false;
    },

    remove: function (key1, key2) {
        /// <summary>Removes key2 from _data[key1].</summary>
        /// <param name="key1" type="String">key1</param>
        /// <param name="key2" type="String">key2</param>

        Debug.assert(Jx.isNonEmptyString(key1));
        Debug.assert(Jx.isNonEmptyString(key2));

        var d = this._data;
        if (d[key1] && (key2 in d[key1])) {
            delete d[key1][key2];
        }
    },

    removeAll: function (key1) {
        /// <summary>Removes _data[key1].</summary>
        /// <param name="key1" type="String">key1</param>

        Debug.assert(Jx.isNonEmptyString(key1));
        delete this._data[key1];
    },

    reset: function () {
        /// <summary>Removes all keys.</summary>
        this._data = {};
    },

    forEachKey1: function (fn, /*@dynamic*/obj) {
        /// <summary>Calls obj.fn(key1) for each key1.</summary>
        /// <param name="fn" type="Function">Callback function. $TODO describe fn args</param>
        /// <param name="obj" optional="true">"this" object for the callback function.</param>
        Object.keys(this._data).forEach(fn, obj);
    }
};


//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Attr object

/// <reference path="EventManager.js" />
/// <reference path="Hash2.js" />
/// <reference path="Jx.ref.js" />

/*global Debug,Jx*/

Jx.isAttrObject = function (/*@dynamic*/obj) {
    /// <summary>Check if the given argument is a valid Jx.Attr object.</summary>
    /// <param name="obj">Argument to check.</param>
    /// <returns type="Boolean">Returns true if it's a valid Jx.Attr object.</returns>    
    return Boolean(Jx.isObject(obj) && obj.attr);
};

// Jx ATTR constants
Jx.ATTR_VALUE = "value";
Jx.ATTR_SET = "set";
Jx.ATTR_GET = "get";
Jx.ATTR_VALID = "valid";
Jx.ATTR_CHANGED = "changed";
Jx.ATTR_BIND_SRC = "bindSrc";
Jx.ATTR_BIND_DEST = "bindDest";
Jx.ATTR_EVENT_CHANGED = "Changed";
Jx.ATTR_INVALID_VALUE = {};

Jx.Attr = /*@constructor*/function () { 
};

Jx.Attr.prototype = {
    _attr: /*@static_cast(Jx.Hash2)*/null,

    initAttr: function () {
        /// <summary>Initialize the Attr object.</summary>

        this._attr = new Jx.Hash2();
    },

    isAttrInit: function () {
        /// <summary>Checks if Attr is initialized.</summary>
        /// <returns type="Boolean">Returns true if Attr is initialized.</returns>    

        return this._attr !== null;
    },

    shutdownAttr: function () {
        /// <summary>Shuts down Attr.</summary>

        // $TODO remove all bindings

        this._attr = null;
    },

    resetAttr: function () {
        /// <summary>Undefine (remove) all attributes.</summary>

        if (this._attr) {
            this._attr.reset();
        }
    },

    attr: function (attributeName, desc) {
        /// <summary>Define an attribute or update the attribute's description.</summary>
        /// <param name="attributeName" type="String">Attribute name.</param>
        /// <param name="desc" type="Object" optional="true">Attribute description. If it's null or undefined then the description is set to { value: undefined }.</param>

        Debug.assert(Jx.isNonEmptyString(attributeName));
        Debug.assert(desc === undefined || typeof desc === "object"); // 'null' is an object
        Debug.assert(this._attr !== null);

        // $TODO add a debug check for invalid desc properties

        this._attr.setAll(attributeName, desc || { value: undefined });

        // Fixup the attr
        this._fixupAttr(attributeName);
    },

    isAttr: function (attributeName) {
        /// <summary>Checks if 'attributeName' is an attribute.</summary>
        /// <param name="attributeName" type="String">Attribute name.</param>
        /// <returns type="Boolean">Returns true if it's an attribute.</returns>    

        Debug.assert(Jx.isNonEmptyString(attributeName));
        Debug.assert(this._attr !== null);

        return this._attr.has(attributeName);
    },

    removeAttr: function (attributeName) {
        /// <summary>Undefine (remove) an attribute.</summary>
        /// <param name="attributeName" type="String">Attribute name.</param>

        Debug.assert(Jx.isNonEmptyString(attributeName));
        Debug.assert(this._attr !== null);

        this._attr.removeAll(attributeName);
    },

    getAttr: /*@dynamic*/function (attributeName) {
        /// <summary>Returns the value of attribute 'attributeName'.</summary>
        /// <param name="attributeName" type="String">Attribute name.</param>
        /// <returns>Returns the value of attribute 'attributeName'</returns>

        Debug.assert(Jx.isNonEmptyString(attributeName));
        Debug.assert(this._attr !== null);

        var getter = /*@static_cast(Function)*/this._attr.get(attributeName, Jx.ATTR_GET);
        return getter ? getter.call(this, attributeName) : this._attr.get(attributeName, Jx.ATTR_VALUE);
    },

    setAttr: function (attributeName, /*@dynamic*/value) {
        /// <summary>Sets the value of attribute 'attributeName'.</summary>
        /// <param name="attributeName" type="String">Attribute name.</param>
        /// <param name="value">Value to set.</param>
        /// <returns type="Boolean">Returns true if the value is successfully set.</returns>

        return this._setAttr(attributeName, value, true);
    },

    setAttrs: function (/*@dynamic*/values) {
        /// <summary>Create attributes from the values object.</summary>
        /// <param name="values">Values to set.</param>

        Debug.assert(Jx.isObject(values));

        for (var key in values) {
            if (values.hasOwnProperty(key)) {
                this.attr(key, { value: values[key] });
            }
        }
    },

    _setAttr: function (attributeName, /*@dynamic*/value, checkValueChange) {
        /// <summary>Sets the value of attribute 'attributeName' with the option to optimize for the case where the value didn't change.</summary>
        /// <param name="attributeName" type="String">Attribute name.</param>
        /// <param name="value">Value to set.</param>
        /// <param name="checkValueChange" type="Boolean">Flag used to check if the attribute value is actually changed.</param>
        /// <returns type="Boolean">Returns true if the value is successfully set.</returns>

        Debug.assert(Jx.isNonEmptyString(attributeName));
        Debug.assert(this._attr !== null);

        var oldValue = this.getAttr(attributeName);
        if (checkValueChange && oldValue === value) {
            return true; // No change
        }

        // Does it have a validator?
        var validator = /*@static_cast(Function)*/this._attr.get(attributeName, Jx.ATTR_VALID);
        if (Boolean(validator) && !validator.call(this, value, attributeName)) {
            // $TODO log this
            return false; // Invalid value
        }

        // Does it have a setter? 
        var setter = /*@static_cast(Function)*/this._attr.get(attributeName, Jx.ATTR_SET);
        if (setter) {
            value = setter.call(this, value, attributeName);
            Debug.assert(value !== undefined); // The setter should return the value to set

            // The setter can return an invalid value
            if (value === Jx.ATTR_INVALID_VALUE) {
                // $TODO log this
                return false;
            }
        }

        this._attr.set(attributeName, Jx.ATTR_VALUE, value);

        // Update bindings
        var bindDest = /*@static_cast(Array)*/this._attr.get(attributeName, Jx.ATTR_BIND_DEST);
        if (bindDest) {
            var len = bindDest.length;
            for (var i = 0; i < len; i++) {
                var /*@type(JxAttrBinding)*/bind = bindDest[i];
                
                bind.obj.setAttr(bind.attr, value);
            }
            Debug.assert(bindDest.length === len); // Reentrancies not supported
        }

        // Invoke change notification handler
        var changed = /*@static_cast(Function)*/this._attr.get(attributeName, Jx.ATTR_CHANGED);
        if (changed) {
            changed.call(this, attributeName, value, oldValue);
        }

        // Fire the attr change event
        Jx.EventManager.fireDirect(this, attributeName + Jx.ATTR_EVENT_CHANGED, { name: attributeName, oldValue: oldValue, newValue: value });

        return true;
    },

    _fixupAttr: function (attributeName) {
        /// <summary>Ensure that the attr internals are correct.</summary>
        /// <param name="attributeName" type="String">Attribute name.</param>

        this._setAttr(attributeName, this.getAttr(attributeName), false);
    },

    _bindAdd: function (srcAttr, key, destObj, destAttr) {
        /// <summary>Binds "this.srcAttr" to "dest.destAttr".</summary>
        /// <param name="srcAttr" type="String">Source attribute name.</param>
        /// <param name="key" type="String">Bind direction: ATTR_BIND_DEST or ATTR_BIND_SRC.</param>
        /// <param name="destObj" type="Jx.Attr">Destination object.</param>
        /// <param name="destAttr" type="String">Destination attribute name.</param>

        var srcObj = this;

        var arr = /*@static_cast(Array)*/srcObj._attr.get(srcAttr, key);
        if (!arr) {
            // First bind
            arr = [];
            srcObj._attr.set(srcAttr, key, arr);
        } else {
            // Check for dups
            for (var i = 0, l = arr.length; i < l; i++) {
                var /*@type(JxAttrBinding)*/item = arr[i];
                if (item.obj === destObj && item.attr === destAttr) {
                    // Found a dup - $TODO log it
                    return;
                }
            }
        }

        // Add the destination object and attribute to the array
        arr.push({ obj: destObj, attr: destAttr });
    },

    _bindRemove: function (srcAttr, key, destObj, destAttr) {
        /// <summary>Unbinds "this.srcAttr" from "dest.destAttr".</summary>
        /// <param name="srcAttr" type="String">Source attribute name.</param>
        /// <param name="key" type="String">Bind direction: ATTR_BIND_DEST or ATTR_BIND_SRC.</param>
        /// <param name="destObj" type="Jx.Attr">Destination object.</param>
        /// <param name="destAttr" type="String">Destination attribute name.</param>

        var srcObj = this;

        var arr = /*@static_cast(Array)*/srcObj._attr.get(srcAttr, key);
        if (arr) {
            // Find the binding
            for (var i = 0, l = arr.length; i < l; i++) {
                var /*@type(JxAttrBinding)*/item = arr[i];
                if (item.obj === destObj && item.attr === destAttr) {
                    // Found it - remove it
                    arr.splice(i, 1);
                    return;
                }
            }
        }
    },

    bindAttr: function (srcAttr, destObj, destAttr) {
        /// <summary>Binds 1 way this.srcAttr and destObj.destAttr.</summary>
        /// <param name="srcAttr" type="String">Source attribute name.</param>
        /// <param name="destObj" type="Jx.Attr">Destination object.</param>
        /// <param name="destAttr" type="String">Destination attribute name.</param>

        Debug.assert(Jx.isObject(destObj) && Boolean(destObj.isAttr));

        var srcObj = this;

        // Don't bind to itself
        if (srcObj !== destObj) {

            if (!srcObj.isAttr(srcAttr)) {
                srcObj.attr(srcAttr);
            }

            if (!destObj.isAttr(destAttr)) {
                destObj.attr(destAttr);
            }

            srcObj._bindAdd(srcAttr, Jx.ATTR_BIND_DEST, destObj, destAttr);
            destObj._bindAdd(destAttr, Jx.ATTR_BIND_SRC, srcObj, srcAttr);

            // Update the destObj
            destObj.setAttr(destAttr, srcObj.getAttr(srcAttr));
        }
    },

    bindAttr2Way: function (srcAttr, destObj, destAttr) {
        /// <summary>Binds 2 way this.srcAttr and destObj.destAttr.</summary>
        /// <param name="srcAttr" type="String">Source attribute name.</param>
        /// <param name="destObj" type="Jx.Attr">Destination object.</param>
        /// <param name="destAttr" type="String">Destination attribute name.</param>

        Debug.assert(Jx.isObject(destObj));

        this.bindAttr(srcAttr, destObj, destAttr);
        destObj.bindAttr(destAttr, this, srcAttr);
    },

    unbindAttr: function (srcAttr, destObj, destAttr) {
        /// <summary>Unbinds 1 way this.srcAttr and destObj.destAttr.</summary>
        /// <param name="srcAttr" type="String">Source attribute name.</param>
        /// <param name="destObj" type="Jx.Attr">Destination object.</param>
        /// <param name="destAttr" type="String">Destination attribute name.</param>

        Debug.assert(Jx.isObject(destObj) && Boolean(destObj.isAttr));

        if (this.isAttr(srcAttr) && destObj.isAttr(destAttr)) {
            this._bindRemove(srcAttr, Jx.ATTR_BIND_DEST, destObj, destAttr);
            destObj._bindRemove(destAttr, Jx.ATTR_BIND_SRC, this, srcAttr);
        }
    },

    unbindAttr2Way: function (srcAttr, destObj, destAttr) {
        /// <summary>Unbinds 2 way this.srcAttr and destObj.destAttr.</summary>
        /// <param name="srcAttr" type="String">Source attribute name.</param>
        /// <param name="destObj" type="Jx.Attr">Destination object.</param>
        /// <param name="destAttr" type="String">Destination attribute name.</param>

        Debug.assert(Jx.isObject(destObj) && Boolean(destObj.isAttr));

        if (this.isAttr(srcAttr) && destObj.isAttr(destAttr)) {
            this._bindRemove(srcAttr, Jx.ATTR_BIND_DEST, destObj, destAttr);
            destObj._bindRemove(destAttr, Jx.ATTR_BIND_SRC, this, srcAttr);

            this._bindRemove(srcAttr, Jx.ATTR_BIND_SRC, destObj, destAttr);
            destObj._bindRemove(destAttr, Jx.ATTR_BIND_DEST, this, srcAttr);
        }
    },

    getAttrValues: function () {
        /// <summary>Returns an object containing the attributes and the values are regular object properties.</summary>
        /// <returns type="Object">The object containing attributes and values.</returns>

        Debug.assert(this._attr !== null);

        var values = {};

        this._attr.forEachKey1(/*@bind(Jx.Attr)*/function (key) {
            values[key] = this.getAttr(key);
        }, this);

        return values;
    }
};


// Definition needed here due to issues with cross-dependencies between compiled and reference files.
/*@constructor*/function JxAttrBinding() { }
JxAttrBinding.prototype = {
    attr: "",
    /*@type(Jx.Attr)*/obj: null
};



;//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Events.js" />

/*global Debug,Windows,Jx*/

Jx.delayDefine(Jx, ["Activation", "activation"], function () {

    function _info(s) { Jx.mark("Jx.Activation." + s + ",Info,Jx"); }
    function _start(s) { Jx.mark("Jx.Activation." + s + ",StartTA,Jx"); }
    function _stop(s) { Jx.mark("Jx.Activation." + s + ",StopTA,Jx"); }

    Jx.Activation = /*@constructor*/function () {
        Debug.assert(this instanceof Jx.Activation, "Jx.Activation - use new");

        this.lastKind = Jx.Activation.neverActivated;
        this._activated = this._activated.bind(this);
        this._suspending = this._suspending.bind(this);
        this._resuming = this._resuming.bind(this);
        this._navigated = this._navigated.bind(this);

        var fn = Windows.UI.WebUI.WebUIApplication.addEventListener;
        fn("activated", this._activated);
        fn("suspending", this._suspending);
        fn("resuming", this._resuming);
        fn("navigated", this._navigated);

        Debug.Events.define(this,
            this.accountPictureProvider,
            this.activated,
            this.appointmentsProvider,
            this.autoPlayDevice, 
            this.autoPlayFile, 
            this.cachedFileUpdater, 
            this.contact,
            this.contactPicker,
            this.fileOpenPicker, 
            this.fileSavePicker, 
            this.navigated,
            this.protocol, 
            this.resuming, 
            this.search, 
            this.share, 
            this.suspending,
            this.tile);
    };

    Jx.Activation.neverActivated = -1;

    Jx.Activation.prototype = {
        accountPictureProvider: "accountPictureProvider",
        activated: "activated",
        appointmentsProvider: "appointmentsProvider",
        autoPlayDevice: "autoPlayDevice",
        autoPlayFile: "autoPlayFile",
        cachedFileUpdater: "cachedFileUpdater",
        contact: "contact",
        contactPicker: "contactPicker",
        fileOpenPicker: "fileOpenPicker",
        fileSavePicker: "fileSavePicker",
        navigated: "navigated",
        protocol: "protocol",
        resuming: "resuming",
        search: "search",
        share: "share",
        suspending: "suspending",
        tile: "tile",

        dispose: function () {
            var fn = Windows.UI.WebUI.WebUIApplication.removeEventListener;
            fn("activated", this._activated);
            fn("suspending", this._suspending);
            fn("resuming", this._resuming);
            fn("navigated", this._navigated);
        },

        _activated: function (ev) {
            /// <summary>Activated event handler.</summary>
            /// <param name="ev" type="Windows.ApplicationModel.Activation.IActivatedEventArgs">Activated event object.</param>

            Debug.assert(Jx.isObject(ev), "Jx.Activation._activated - invalid param ev: " + String(ev));

            if (ev.prelaunchActivated) {
                _info("_activated:prelaunched");
            }

            var mark = "_activated:kind=" + String(ev.kind);
            _start(mark);

            // store the last activation kind, it's used by PerfTrack APIs
            this.lastKind = ev.kind;

            this.raiseEvent(this.activated, ev);

            var k = Windows.ApplicationModel.Activation.ActivationKind;
            switch (ev.kind) {
                case k.appointmentsProvider:
                    this.raiseEvent(this.appointmentsProvider, ev);
                    break;

                case k.cachedFileUpdater:
                    this.raiseEvent(this.cachedFileUpdater, ev);
                    break;

                case k.contact:
                    this.raiseEvent(this.contact, ev);
                    break;

                case k.contactPicker:
                    this.raiseEvent(this.contactPicker, ev);
                    break;

                case k.device:
                    this.raiseEvent(this.autoPlayDevice, ev);
                    break;

                case k.file:
                    this.raiseEvent(this.autoPlayFile, ev);
                    break;

                case k.fileOpenPicker:
                    this.raiseEvent(this.fileOpenPicker, ev);
                    break;

                case k.fileSavePicker:
                    this.raiseEvent(this.fileSavePicker, ev);
                    break;

                case k.launch:
                    this.raiseEvent(this.tile, ev);
                    break;

                case k.protocol:
                    this.raiseEvent(this.protocol, ev);
                    break;

                case k.search:
                    this.raiseEvent(this.search, ev);
                    break;

                case k.shareTarget:
                    this.raiseEvent(this.share, ev);
                    break;

                default:
                    // TODO: handle contracts as needed
                    _info("_onActivated:contractId not supported");
                    Debug.assert(false, "Jx.Activation._onActivated not implemented kind:" + String(ev.kind));
                    break;
            }

            _stop(mark);

            // Return false to prevent navigation to a new page.
            return false;
        },

        _suspending: function (ev) {
            /// <summary>Suspending event handler.</summary>
            /// <param name="ev" type="Object">Suspending event object.</param>

            Debug.assert(Jx.isObject(ev), "Jx.Activation._suspending - invalid param ev: " + String(ev));

            _start("_suspending");
            this.raiseEvent(this.suspending, ev);
            _stop("_suspending");
        },

        _resuming: function (ev) {
            /// <summary>Resuming event handler.</summary>
            /// <param name="ev" type="Object">Resuming event object.</param>

            Debug.assert(Jx.isObject(ev), "Jx.Activation._resuming - invalid param ev: " + String(ev));

            _start("_resuming");
            this.raiseEvent(this.resuming, ev);
            _stop("_resuming");
        },

        _navigated: function (ev) {
            /// <summary>Navigated event handler.</summary>
            /// <param name="ev" type="Object">Navigated event object.</param>

            Debug.assert(Jx.isObject(ev), "Jx.Activation._navigated - invalid param ev: " + String(ev));

            _start("_navigated");
            this.raiseEvent(this.navigated, ev);
            _stop("_navigated");
        },
    };

    Jx.augment(Jx.Activation, Jx.Events);

    // The activation object, the default is Jx.Activation
    Jx.activation = /*@static_cast(Jx.Activation)*/null;
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

/// <reference path="..\..\WinJS\WinJS.ref.js" />
/// <reference path="..\core\Jx.js" />

/*global document,Windows,WinJS,Jx*/

Jx.delayDefine(Jx, "SettingsFlyout", function () {

    //
    // Templates
    //

    function tmplBase(title) {
        return '' + 
        '<div class="win-header">' + 
            '<button type="button" class="win-backbutton"></button>' + 
            '<div class="win-label">' + title + '</div>' +
            '<div class="icon"></div>' +
        '</div>' +
        '<div class="win-content" role="menuitem"></div>';
    }

    function tmplAbout(data) {
        return '' +
        '<div class="win-settings-section about">' + 
            '<h3>' + data.name + '</h3>' +
            '<p>' + data.publisher + '<br>' + data.version + '</p>' +
            '<p>' + data.servicesAgreement + '</p>' +
            '<p>' + data.licenseAgreement + '</p>' +
            '<p>' + data.privacyStatement + '</p>' +
            '<p>' + data.copyright + '</p>' +
        '</div>';
    }

    //
    // SettingsFlyout
    //

    var cssLoaded = false;

    function ensureCSSLoaded() {
        if (!cssLoaded) {
            Jx.loadCss("/Jx/SettingsFlyout.css");
            cssLoaded = true;
        }
    }

    var SettingsFlyout = Jx.SettingsFlyout = /*@constructor*/ function (title) {
        ensureCSSLoaded();

        // init members
        this._oldActiveElement = null;

        // create our div and flyout
        this._host   = document.createElement("div");
        this._flyout = new WinJS.UI.SettingsFlyout(this._host);

        // set the base template to the host
        this._host.classList.add("jx-settingsflyout");
        this._host.innerHTML = tmplBase(title);
        this._content = this._host.querySelector(".win-content");

        // hook the back button
        this._back = this._host.querySelector(".win-backbutton");
        this._back.addEventListener("click", this._onBack.bind(this), false);

        // hook the flyout itself
        this._flyout.addEventListener("afterhide", this._onAfterHide.bind(this), false);
    };

    //
    // Static
    //

    SettingsFlyout.showAbout = function (appName) {
        ensureCSSLoaded();

        // create the our content
        var res       = Jx.res,
            title     = res.getString("/Jx/About"),
            publisher = res.getString("/Jx/Publisher"),
            version   = Windows.ApplicationModel.Package.current.id.version;

        var servicesAgreementLink = "<a href='http://go.microsoft.com/fwlink/?LinkID=246338'>" + res.getString("/Jx/AboutServicesAgreement") + "</a>",
            licenseAgreementLink  = "<a href='http://go.microsoft.com/fwlink/?LinkID=252923'>" + res.getString("/Jx/AboutLicenseAgreement") + "</a>",
            privacyStatementLink  = "<a href='http://go.microsoft.com/fwlink/?LinkID=286959'>" + res.getString("/Jx/AboutPrivacyStatement") + "</a>";

        var content = tmplAbout({
                name:      appName,
                publisher: res.loadCompoundString("/Jx/AboutPublisher", publisher),
                version:   res.loadCompoundString("/Jx/AboutVersion",   version.major + "." + version.minor + "." + version.build + "." + version.revision),

                servicesAgreement: res.loadCompoundString("/Jx/AboutServicesAgreementText", servicesAgreementLink),
                licenseAgreement:  res.loadCompoundString("/Jx/AboutLicenseAgreementText",  licenseAgreementLink),
                privacyStatement:  privacyStatementLink,

                copyright: res.loadCompoundString("/Jx/AboutCopyright", res.getString("/Jx/PublishDate"), publisher)
            });

        // create and show the flyout
        var flyout = new SettingsFlyout(title);
        flyout.getContentElement().innerHTML = content;
        flyout.show();
    };

    //
    // Instance
    //

    SettingsFlyout.prototype.getContentElement = function () {
        return this._content;
    };

    SettingsFlyout.prototype.show = function () {
        if (!this._host.parentElement) {
            // save the old active element so we can focus it later
            this._oldActiveElement = document.activeElement;

            // append our host and show the flyout
            document.body.appendChild(this._host);
            this._flyout.show();

            // set focus to the back button if we can
            if (!this._back.isDisabled) {
                this._back.setActive();
            }
        }
    };

    //
    // Private
    //

    SettingsFlyout.prototype._onBack = function () {
        this._flyout.hide();
        Windows.UI.ApplicationSettings.SettingsPane.show();
    };

    SettingsFlyout.prototype._onAfterHide = function () {
        document.body.removeChild(this._host);

        // set focus to the previous active element if we can
        if (Jx.isHTMLElement(this._oldActiveElement) && Jx.isHTMLElement(this._oldActiveElement.parentElement)) {
            Jx.safeSetActive(this._oldActiveElement);
        }
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Storage object

/// <reference path="Attr.js" />

/*global document,unescape,escape,Debug,Jx*/

(function () {

    Jx.Storage = /*@constructor*/function () {
        /// <summary>Storage Constructor.</summary>
    
        Debug.assert(this instanceof Jx.Storage);

        Jx.mark("Jx.Storage(),Info,Jx,Storage");
        
        this.initAttr();
    };

    Jx.augment(Jx.Storage, Jx.Attr);

    var proto = Jx.Storage.prototype;

    proto._isInit = function () {
        /// <summary>Checks if the object is initialized.</summary>
        /// <returns type="Boolean">Returns true is the object is initialized.</returns>
    
        return this.isAttrInit();
    };

    proto.shutdown = function () {
        /// <summary>Shut down the storage.</summary>
    
        this.shutdownAttr();

        Jx.mark("Jx.Storage.shutdown,Info,Jx,Storage");
    };

    proto.reset = function () {
        /// <summary>Reset (empty) the storage.</summary>
    
        Jx.mark("Jx.Storage.reset,Info,Jx,Storage");
        
        this.resetAttr();
    };

    proto.setItems = function (data) {
        /// <summary>Populate the storage from the given data object.</summary>
        /// <param name="data" type="Object">Data object.</param>

        Jx.mark("Jx.Storage.setItems,StartTA,Jx,Storage");

        Debug.assert(this._isInit());

        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                this.attr(key, { value: data[key] });
            }
        }

        Jx.mark("Jx.Storage.setItems,StopTA,Jx,Storage");
    };

    proto._getData = function () {
        /// <summary>Get the storage data as string.</summary>
        /// <returns type="String">Returns the storage data as string.</returns>

        return unescape(Jx.appData.localSettings().container("Jx").get("Storage") || "");
    };

    proto.load = function () {
        /// <summary>Loads the persisted storage data into memory.</summary>
    
        Jx.mark("Jx.Storage.load,StartTA,Jx,Storage");

        Debug.assert(this._isInit());

        // Load the data and parse it to an object
        var data;
        try {
            data = JSON.parse(this._getData());
        } catch (e) {
            data = {};
        }
        
        // Create attrs
        Object.keys(data).forEach(/*@bind(Jx.Storage)*/function (value) {
            this.attr(value, { value: data[value] });
        }, this);

        Jx.mark("Jx.Storage.load,StopTA,Jx,Storage");
    };

    proto.save = function () {
        /// <summary>Persists the storage data.</summary>
    
        Jx.mark("Jx.Storage.save,StartTA,Jx,Storage");

        // We need to JSON stringify and escape the data
        var values = this.getAttrValues();
        var data = escape(JSON.stringify(values));

        // Save the data
        Jx.appData.localSettings().container("Jx").set("Storage", data);

        Jx.mark("Jx.Storage.save,StopTA,Jx,Storage");
    };

    proto.remove = function () {
        /// <summary>Remove the storage data.</summary>
    
        Jx.mark("Jx.Storage.remove,StartTA,Jx,Storage");

        // Remove the data
        Jx.appData.localSettings().container("Jx").remove("Storage");

        Jx.mark("Jx.Storage.remove,StopTA,Jx,Storage");
    };

    // The storage object, the default is Jx.Storage
    Jx.storage = /*@static_cast(Jx.Storage)*/null;

})();

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

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Events.js" />

/*jshint browser:true*/
/*global Debug,Jx*/

Jx.delayDefine(Jx, "UrlHash", function () {

    Jx.UrlHash = /*@constructor*/function () {
        /// <summary>UrlHash constructor.</summary>
    
        Jx.log.info("Jx.UrlHash.start");
    
        Debug.assert(this instanceof Jx.UrlHash, "Jx.UrlHash - use new");
        Debug.assert(arguments.length === 0, "Jx.UrlHash - invalid number of params");

        Debug.Events.define(this, this.hashChange);

        // 'this._onhashchange' is called directly from this object and as an event handler.
        // 'bind' returns a new function, replace the instance function so we can remove the listener later.
        this._onhashchange = this._onhashchange.bind(this);

        // Add the hashchange listener
        window.addEventListener("hashchange", this._onhashchange, false);

        Jx.log.info("Jx.UrlHash.end");
    };

    Jx.UrlHash.prototype = {
        // Events
        hashChange: "hashChange",

        dispose: function () {
            /// <summary>Dispose this object.</summary>

            Jx.log.info("Jx.UrlHash.dispose");

            window.removeEventListener("hashchange", this._onhashchange, false);

            this.disposeEvents();
        },

        getHash: function () {
            /// <summary>Get the browser's hash.</summary>
            /// <returns type="String">Returns the hash string.</returns>

            Jx.log.info("Jx.UrlHash.getHash");

            var hash = window.location.hash;

            // Remove the leading "#" if present
            if (hash[0] === "#") {
                hash = hash.substr(1);
            }

            return hash;
        },

        clear: function () {
            /// <summary>Clears the browser's hash (sets it to "").</summary>

            window.location.hash = "";
        },

        _onhashchange: function (ev) {
            /// <summary>hashchange event handler.</summary>
            /// <param name="ev" type="Event">Event object.</param>

            var target = /*@static_cast(Window)*/ev.target;
            var hash = target.location.hash;

            // Remove the leading "#" if present
            if (hash[0] === "#") {
                hash = hash.substr(1);
            }

            Jx.log.info("Jx.UrlHash fire hashchange start " + hash);
            this.raiseEvent(this.hashChange, hash);
            Jx.log.info("Jx.UrlHash fire hashchange end");
        }
    };

    Jx.augment(Jx.UrlHash, Jx.Events);
});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Events.js" />

/*global Jx,Debug,NoShip*/

Jx.delayDefine(Jx, "Nav", function () {

    Jx.Nav = /*@constructor*/function () {
        /// <summary>Jx.Nav constructor.</summary>
    
        Jx.log.info("Jx.Nav.start");
    
        Debug.assert(this instanceof Jx.Nav, "Jx.Nav - use new Jx.Nav()");
        Debug.assert(arguments.length === 0, "Jx.Nav - invalid number of params");
    
        Debug.Events.define(this, this.beforeNavigate, this.navigate);
    
        this.backStack = [];
        this.forwardStack = [];
    
        Jx.log.info("Jx.Nav.end");
    };

    Jx.Nav.prototype = {
        _location: null,
        backStack: /*@static_cast(Array)*/null,
        forwardStack: /*@static_cast(Array)*/null,

        // Events
        beforeNavigate: "beforeNavigate",
        navigate: "navigate",

        maxStack: 20,

        dispose: function () { 
            /// <summary>Dispose this object.</summary>
        
            this._location = this.backStack = this.forwardStack = null;
            this.disposeEvents();
        },

        getLocation: function () { 
            /// <summary>Get the current location.</summary>
            /// <returns type="Object">Returns the current location object. It can be null.</returns>

            return this._location; 
        },

        canGoForward: function () {
            /// <summary>Query the navigation service if it can navigate forward.</summary>
            /// <returns type="Boolean">Returns true if it can navigate forward.</returns>

            Debug.assert(Jx.isArray(this.forwardStack), "Jx.Nav.canGoForward - invalid this.backStack");

            return this.forwardStack.length > 0;
        },

        canGoBack: function () {
            /// <summary>Query the navigation service if it can navigate back.</summary>
            /// <returns type="Boolean">Returns true if it can navigate forward.</returns>

            Debug.assert(Jx.isArray(this.backStack), "Jx.Nav.canGoBack - invalid this.backStack");

            return this.backStack.length > 0;
        },

        forward: function (distance) {
            /// <summary>Navigate forward.</summary>
            /// <param name="distance" type="Number" optional="true">Integer that specifies the number of locations to go forward. If no value is provided, it navigates to the next location.</param>
            /// <returns type="Boolean">Returns true if the navigation happened.</returns>

            Debug.assert(Jx.isUndefined(distance) || Jx.isValidNumber(distance), "Jx.Nav.forward - invalid distance " + String(distance));

            return this._go(distance || 1, this.forwardStack, this.backStack);
        },

        back: function (distance) {
            /// <summary>Navigate back.</summary>
            /// <param name="distance" type="Number" optional="true">Integer that specifies the number of locations to go back. If no value is provided, it navigates to the previous location.</param>
            /// <returns type="Boolean">Returns true if the navigation happened.</returns>

            Debug.assert(Jx.isUndefined(distance) || Jx.isValidNumber(distance), "Jx.Nav.back - invalid distance " + String(distance));

            return this._go(distance || 1, this.backStack, this.forwardStack);
        },

        go: function (loc) {
            /// <summary>Navigate to a specific location.</summary>
            /// <param name="loc" type="Object">Location object.</param>

            Debug.assert(Jx.isObject(loc), "Jx.Nav.go - invalid param loc " + String(loc));

            Jx.log.info("Jx.Nav.go.start");
            NoShip.log("location=" + JSON.stringify(loc));

            // Validate stack lengths
            Debug.assert(this.backStack.length <= this.maxStack, "Jx.Nav.go - invalid back stack length"); 
            Debug.assert(this.forwardStack.length <= this.maxStack, "Jx.Nav.go - invalid forward stack length");  

            // Fire beforeNavigate - can be cancelled
            var ev = { location: loc, cancel: false };
        
            this._raiseEvent(this.beforeNavigate, ev);
        
            if (!ev.cancel) {
            
                Debug.assert(Jx.isObject(ev.location), "Jx.Nav.go - invalid ev.location " + String(ev.location)); 
            
                if (this._location) {
                    var backStack = this.backStack;

                    // There is a previous location, save it to the back stack
                    backStack.push(this._location);

                    // If the back stack is too big then remove the oldest entry
                    if (backStack.length > this.maxStack) {
                        backStack.shift(); 
                    }
                }

                this.forwardStack = [];
                this._location = ev.location;

                // Fire navigate - $TODO handle errors?
                this._raiseEvent(this.navigate, { location: this._location });
            }

            Jx.log.info("Jx.Nav.go.end");
            NoShip.log("location=" + JSON.stringify(this._location)); 
        },

        _raiseEvent: function (ev, context) {
            var s = JSON.stringify(context);
            Jx.log.info("Jx.Nav._raiseEvent.start");
            NoShip.log("ev=" + ev + " context=" + s); 
            this.raiseEvent(ev, context);
            Jx.log.info("Jx.Nav._raiseEvent.end");
            NoShip.log("ev=" + ev + " context=" + s);
        },

        _go: function (distance, fromStack, toStack) {
            /// <param name="distance" type="Number">Distance to move.</param>
            /// <param name="fromStack" type="Array">The stack to move away from.</param>
            /// <param name="toStack" type="Array">The stack to move into.</param>

            Jx.log.info("Jx.Nav.go.start distance=" + String(distance));
            distance = Math.min(distance, fromStack.length);
            if (distance > 0) { 

                // Fire beforeNavigate - can be cancelled
                var ev = { distance: distance, location: fromStack[fromStack.length - distance], cancel: false };
                this._raiseEvent(this.beforeNavigate, ev);
                if (!ev.cancel) {
                    /// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>

                    toStack.push(this._location);
                    while (--distance) {
                        toStack.push(fromStack.pop());
                    }

                    // Use the location from event - it can be updated by the caller 
                    this._location = ev.location;
                    fromStack.pop();
                
                    // Fire navigate - $TODO handle errors?
                    this._raiseEvent(this.navigate, { location: this._location });

                    return true;
                }
            }
            return false;
        }
    };

    Jx.augment(Jx.Nav, Jx.Events);
});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="UrlHash.js" />
/// <reference path="Nav.js" />

/*jshint browser:true*/
/*global Debug,Jx*/

Jx.delayDefine(Jx, "HashToNav", function () {

    Jx.HashToNav = /*@constructor*/function (urlHash, nav) {
        /// <summary>Jx.HashToNav constructor.</summary>
        /// <param name="urlHash" type="Jx.UrlHash">UrlHash object.</param>
        /// <param name="nav" type="Jx.Nav">Nav object.</param>
    
        Debug.assert(this instanceof Jx.HashToNav, "Jx.HashToNav - use new");

        Debug.assert(Jx.isObject(urlHash) && Boolean(urlHash.hashChange), "Jx.HashToNav - invalid urlHash param");
        Debug.assert(Jx.isObject(nav) && Boolean(nav.go), "Jx.HashToNav - invalid nav param");
        Debug.assert(arguments.length === 2, "Jx.HashToNav - invalid number of params");

        this._urlHash = urlHash;
        urlHash.addListener(urlHash.hashChange, this._onHashChange, this);
    
        this._nav = nav;
    };

    Jx.HashToNav.prototype = {
        _urlHash: /*@static_cast(Jx.UrlHash)*/null,
        _nav: /*@static_cast(Jx.Nav)*/null,
        _hashReset: false,

        dispose: function () {
            /// <summary>Dispose this object.</summary>

            this._urlHash.removeListener(this._urlHash.hashChange, this._onHashChange, this);
            this._urlHash = null;

            this._nav = null;
        },

        _onHashChange: function (hash) {
            /// <summary>hashchange event handler.</summary>
            /// <param name="hash" type="String">The hash string.</param>

            Jx.log.info("Jx.HashToNav._onhashchange.start " + hash + " _hashReset:" + String(this._hashReset));

            if (this._hashReset) {
                // ignore hash resets
                Jx.log.info("Jx.HashToNav._onhashchange ignore hash reset");
                Debug.assert(hash === "", "Jx.HashToNav._onhashchange invalid hash reset");
                this._hashReset = false;
            } else {
                this._nav.go(Jx.parseHash(hash));
                this._hashReset = true;
                this._urlHash.clear();
            }

            Jx.log.info("Jx.HashToNav._onhashchange.end");
        }
    };
});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Debug.js" />
/// <reference path="JxBase.js" />
/// <reference path="Attr.js" />
/// <reference path="TreeNode.js" />
/// <reference path="EventTarget.js" />
/// <reference path="Jx.ref.js" />

/*global document,Debug,Jx*/

(function () {

    Jx.Component = /*@constructor*/function () {
    };

    Jx.augment(Jx.Component, Jx.Base);
    Jx.augment(Jx.Component, Jx.Attr);
    Jx.augment(Jx.Component, Jx.TreeNode);
    Jx.augment(Jx.Component, Jx.EventTarget);

    var proto = Jx.Component.prototype;

    proto.initComponent = function () {
        /// <summary>Initialize the Component object.</summary>

        // DOM IDs must start with a letter.
        this._id = "jxc" + Jx.uid();
        this.initBase();
        this.initAttr();
        this._hasUI = false;
    };

    proto.shutdownComponent = function () {
        /// <summary>Shut down the Component object.</summary>
        this.forEachChild(function (child) {
            /// <param name="child" type="Jx.Component" />
            child.shutdownComponent();
        });
        this.shutdownBase();
    };

    proto.hasUI = function () {
        /// <summary>Check if the component has UI.</summary>
        /// <returns type="Boolean">Returns true if the component has UI.</returns>

        return this._hasUI;
    };

    proto.initUI = function (container) {
        /// <summary>Initialize the UI.</summary>
        /// <param name="container" type="HTMLElement">The container element where the UI will be inserted.</param>

        Debug.assert(Jx.isHTMLElement(container));

        // Collect the UI strings
        var ui = Jx.getUI(this);
        Jx.addStyle(ui.css);

        container.innerHTML = ui.html;

        this.activateUI();
    };

    proto.shutdownUI = function () {
        /// <summary>Removes the UI from the DOM.</summary>

        if (this._hasUI) {
            this.deactivateUI();
            var e = document.getElementById(this._id);
            if (e) {
                e.outerText = "";
            }

            this._clearHasUI();
        }
    };

    proto.activateUI = function () {
        /// <summary>Default implementation for the activateUI. It's normally used to interact with the DOM after it was built.</summary>

        this.onActivateUI();

        if (this._hasUI) {
            this.forEachChild(function (child) {
                /// <param name="child" type="Jx.Component" />
                if (child.hasUI()) {
                    child.activateUI();
                }
            });
        }
    };

    proto.onActivateUI = Jx.fnEmpty;

    proto.deactivateUI = function () {
        /// <summary>Default implementation for the deactivateUI. It's normally used to cleanup DOM event handlers.</summary>

        this.forEachChild(function (child) {
            /// <param name="child" type="Jx.Component" />
            child.deactivateUI();
        });

        this.onDeactivateUI();
    };

    proto.onDeactivateUI = Jx.fnEmpty;

    proto.queryService = function (serviceName) {
        Debug.assert(Jx.isNonEmptyString(serviceName), "Jx.Component.queryService: invalid serviceName");
        var service = this.onQueryService(serviceName);
        if (!service) {
            var parent = this.getParent();
            if (parent) {
                service = parent.queryService(serviceName);
            }
        }
        return service;
    };

    proto.onQueryService = function (serviceName) {
        Debug.assert(Jx.isNonEmptyString(serviceName), "Jx.Component.onQueryService: invalid serviceName");
        return null;
    };

    proto._clearHasUI = function () {
        /// <summary>Clears the _hasUI flag on this component and all subcomponents.</summary>

        if (this._hasUI) {
            this._hasUI = false;

            this.forEachChild(function (child) {
                /// <param name="child" type="Jx.Component" />
                child._clearHasUI();
            });
        }
    };

    // TODO: WinLive 392427 Remove this after all the code has been migrated to using proto.
    Jx.mix(Jx.Component, proto);

    Jx.getUI = function (comp) {
        /// <summary>Helper used to get the UI from a component. It makes it easier to handle default values.</summary>
        /// <param name="comp" type="Jx.Component">Component object.</param>
        /// <returns type="JxUI">Returns the UI object.</returns>

        var ui = { css: "", html: "" };
        if (Boolean(comp) && Boolean(comp.getUI)) {
            comp.getUI(ui);
            comp._hasUI = true;
        }
        return ui;
    };

    // The component root object
    Jx.root = /*@static_cast(Jx.Component)*/null;

})();

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

/// <reference path="Settings.js" />
/// <reference path="Component.js" />

/*global Debug,NoShip,Jx*/

Jx.delayDefine(Jx, ["Application", "app"], function () {

    Jx.Application = function (applicationId, skipDeferredLaunchTasks) {
        /// <summary>Constructor.</summary>
        /// <param name="applicationId" type="Number" optional="true">Application ID. Optional. Values are found in Launch.js</param>
        /// <param name="skipDeferredLaunchTasks" type="Boolean" optional="true">Whether to skip deferred launch tasks</param>

        Debug.assert(this instanceof Jx.Application, "Jx.Application: use new");

        Jx.mark("Jx.Application(),StartTA,Jx,Application");
    
        NoShip.only(Jx.etw("JxAppInitStart"));

        this.initLog();

        // Launch needs a Jx.app reference
        Jx.app = Jx.app || this;

        // Set the appId (default to -1, not set)
        Jx.appId = Jx.isNumber(applicationId) ? applicationId : -1;

        Jx.ensurePromiseErrorHandling();

        Jx.init(/*@static_cast(JxInitOptions)*/{
            appId: applicationId, 
            launchSkipDeferredTasks: skipDeferredLaunchTasks
        });

        NoShip.only(Jx.etw("JxAppInitStop"));

        Jx.mark("Jx.Application(),StopTA,Jx,Application");
    };

    Jx.Application.prototype = {
        _env: "",
        _rootElem: null,

        shutdown: function () {
            /// <summary>Shuts down the Application object.</summary>

            Jx.mark("Jx.Application.shutdown,StartTA,Jx,Application");

            // Shutdown the component tree
            if (Jx.root) {
                Jx.root.shutdownComponent();
                Jx.root = null;
            }

            Jx._rootElem = null;

            Jx.shutdown();

            this.shutdownLog();
        
            Jx.mark("Jx.Application.shutdown,StopTA,Jx,Application");
        },

        initLog: function () {
            /// <summary>Initialize the logging service.</summary>

            Jx.mark("Jx.Application.initLog,StartTA,Jx,Application");

            if (!Jx.log) {
                var log = new Jx.Log();
                log.enabled = true;
                log.level = Jx.LOG_VERBOSE;
                Jx.log = log;
            }

            Jx.mark("Jx.Application.initLog,StopTA,Jx,Application");
        },

        initUI: function (containerElement) {
            /// <summary>Builds the UI from the component tree.</summary>
            /// <param name="containerElement" type="HTMLElement">HTML element container for the UI.</param>

            Jx.mark("Jx.Application.initUI,StartTA,Jx,Application");

            if (Jx.root) {
                Jx.root.initUI(containerElement);
                this._rootElem = containerElement;
            }

            Jx.mark("Jx.Application.initUI,StopTA,Jx,Application");
        },

        setRoot: function (root, containerElement) {
            /// <summary>Replaces the root Jx component with a new one</summary>
            /// <param name="root" type="Jx.Component">Component to replace the root with.</param>
            /// <param name="containerElement" type="HTMLElement">HTML element container for the UI.</param>

            Jx.mark("Jx.Application.setRoot,StartTA,Jx,Application");

            // Shutdown the existing root
            if (Jx.root) {
                Jx.root.shutdownUI();
            }

            Jx.root = root;

            if (containerElement) {
                this.initUI(containerElement);
            }

            Jx.mark("Jx.Application.setRoot,StopTA,Jx,Application");
        },

        shutdownUI: function () {
            /// <summary>Shuts down the application UI.</summary>

            Jx.mark("Jx.Application.shutdownUI,StartTA,Jx,Application");

            if (Jx.root) {
                Jx.root.shutdownUI();
            }
            Jx._rootElem = null;

            Jx.mark("Jx.Application.shutdownUI,StopTA,Jx,Application");
        },

        shutdownLog: function () {
            /// <summary>Shuts down the application Log.</summary>

            Jx.mark("Jx.Application.shutdownLog,StartTA,Jx,Application");

            Jx.flushSession();
        
            Jx.mark("Jx.Application.shutdownLog,StopTA,Jx,Application");
        },

        // $TODO move getEnvironment to Jx namespace
        getEnvironment: function () {
            /// <summary>Determines the environment setting, or returns the cached value if it has already been determined.
            /// NOTE: You are STRONGLY encouraged to use config for anything and everything that requires environment switching.
            /// See Modern cookbook for details.</summary>
            /// <returns type="String">Returns the environment settings. Defaults to PROD if in a WWA.</returns>

            Jx.mark("Jx.Application.getEnvironment,Info,Jx,Application");
        
            // $TODO: Skip all this and return "PROD" if we are in a ship flavor build.
            if (Jx.isWWA) {
                if (!this._env) {
                    this._env = Jx.appData.localSettings().get("Environment");
                    // If we're still null after getting it, default to PROD
                    if (!this._env) {
                        this._env = "PROD";
                    }
                }
                return this._env;
            }
            return "INT";
        }
    };

    // The application object, usually derived from Jx.Application
    Jx.app = /*@static_cast(Jx.Application)*/null;
});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Application

/// <reference path="%OBJECT_ROOT%\JavaScript\References\%BUILDTYPE%\%BUILDTARGET%\Microsoft.WindowsLive.Jx.js" />
/// <reference path="Settings.js" />
/// <reference path="UrlHash.js" />
/// <reference path="Activation.js" />
/// <reference path="Bici.js" />
/// <reference path="Launch.js" />

/*global Debug,Jx*/

Jx.init = function (options) {
    /// <summary>Initialize Jx.</summary>
    /// <param name="options" type="JxInitOptions">Jx options.</param>

    /// <disable>JS2034.DoNotCompareToTrueOrFalse</disable>

    Debug.assert(arguments.length <= 1, "Jx.init: arguments.length <= 1");
    Debug.assert(Jx.isUndefined(options) || Jx.isObject(options), "Jx.init: Jx.isUndefined(options) || Jx.isObject(options)");

    Jx.mark("Jx.init,StartTA,Jx");

    // Activation

    Jx.mark("Jx.init:activation,StartTA,Jx");

    Debug.assert(Jx.isNullOrUndefined(Jx.activation), "Jx.init: Jx.isNullOrUndefined(Jx.activation)");

    if ("activation" in options) {
        Debug.assert(options.activation === false || Jx.isObject(options.activation), "Jx.init: invalid options.activation");
        if (options.activation) {
            Jx.activation = options.activation;
        }
    } else {
        Jx.activation = new Jx.Activation();
    }

    Jx.mark("Jx.init:activation,StopTA,Jx");
    
    // AppData

    Jx.mark("Jx.init:appData,StartTA,Jx");

    Debug.assert(Jx.isNullOrUndefined(Jx.appData), "Jx.init: Jx.isNullOrUndefined(Jx.appData)");
    
    if ("appData" in options) {
        Debug.assert(options.appData === false || Jx.isObject(options.appData), "Jx.init: invalid options.appData");
        if (options.appData) {
            Jx.appData = options.appData;
        }
    } else {
        Jx.appData = new Jx.AppData();
    }

    Jx.mark("Jx.init:appData,StopTA,Jx");



    // Loc
    
    Jx.mark("Jx.init:loc,StartTA,Jx");

    Debug.assert(Jx.isNullOrUndefined(Jx.loc), "Jx.init: Jx.isNullOrUndefined(Jx.loc)");

    if ("loc" in options) {
        Debug.assert(options.loc === false, "Jx.init: invalid options.loc");
        // Jx.loc is deprecated, passing an object is not supported.
    } else {
        Jx.loc = new Jx.Loc(); 
    }

    Jx.mark("Jx.init:loc,StopTA,Jx");



    // Bici

    Jx.mark("Jx.init:bici,StartTA,Jx");

    Debug.assert(Jx.isNullOrUndefined(Jx.bici), "Jx.init: Jx.isNullOrUndefined(Jx.bici)");

    if ("bici" in options) {
        Debug.assert(options.bici === false || Jx.isObject(options.bici), "Jx.init: invalid options.bici");
        if (options.bici) {
            Jx.bici = options.bici;
        }
    } else {
        Jx.bici = new Jx.Bici();
    }

    Jx.mark("Jx.init:bici,StopTA,Jx");

    Jx.mark("Jx.init:bici.startExperience,StartTA,Jx");
    
    if (Jx.bici) {
        Jx.bici.startExperience();
    }

    Jx.mark("Jx.init:bici.startExperience,StopTA,Jx");

    // Launch

    Jx.mark("Jx.init:launch,StartTA,Jx");

    Debug.assert(Jx.isNullOrUndefined(Jx.launch), "Jx.init: Jx.isNullOrUndefined(Jx.launch)");
    
    if ("launch" in options) {
        Debug.assert(options.launch === false, "Jx.init: invalid options.launch");
        // Jx.launch can be disabled but not replaced.
    } else {
        if ("appId" in options && Jx.isNumber(options.appId)) {
            Jx.launch = new Jx.Launch(options.appId);

            Jx.launch.getApplicationStatus(options.launchSkipDeferredTasks);

            Debug.assert(Jx.isObject(Jx.activation), "Jx.init: Jx.launch needs Jx.activation");
            Jx.activation.addListener(Jx.activation.resuming, function () {
                Jx.launch.getApplicationStatus(options.launchSkipDeferredTasks);
            });
        }
    }

    Jx.mark("Jx.init:launch,StopTA,Jx");
    
    Jx.mark("Jx.init,StopTA,Jx");
};

Jx.shutdown = function () {
    /// <summary>Shutdown Jx.</summary>

    Jx.mark("Jx.shutdown,StartTA,Jx");

    // $TODO remove the resuming listener
    Jx.dispose(Jx.launch);
    Jx.launch = null;

    if (Jx.bici) {
        Jx.bici.endExperience();
        Jx.bici.dispose();
        Jx.bici = null;
    }

    Jx.loc = null;

    Jx.dispose(Jx.appData);
    Jx.dispose(Jx.activation);

    Jx.activation = null;
    Jx.appData = null;

    Jx.mark("Jx.shutdown,StopTA,Jx");
};

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true */
/*global Jx,Debug,requestAnimationFrame,cancelAnimationFrame,setImmediate,clearImmediate */

Jx.delayDefine(Jx, ["Timer", "AnimationFrame"], function () {
    "use strict";

    var AsyncBase = function (func, context, args) {
        _markStart("ctor");
        Debug.assert(Jx.isFunction(func), "Invalid parameter: func");
        Debug.assert(Jx.isNullOrUndefined(context) || Jx.isObject(context), "Invalid parameter: context");
        Debug.assert(Jx.isNullOrUndefined(args) || Jx.isArray(args), "Invalid parameter: args");

        this._function = func;
        this._context = context;
        this._args = args;

        this._asyncId = this._enqueue(this._runAsync.bind(this));
        Debug.assert(Jx.isNumber(this._asyncId) && this._asyncId !== 0);
        _markAsyncStart("waiting-id: " + this._asyncId);

        Debug.only(Object.seal(this));
        _markStop("ctor");
    };

    AsyncBase.prototype = {
        dispose: function () {
            this._cancel();
            this._function = this._context = this._args = null;
        },
        runNow: function () {
            if (this._asyncId === 0) {
                _mark("runNow: already ran");
                return;
            }

            _markStart("runNow");
            this._cancel();
            this._execute();
            _markStop("runNow");
        },
        _runAsync: function () {
            Debug.assert(this._asyncId !== 0);
            _mark("_runAsync");
            _markAsyncStop("waiting-id: " + this._asyncId);
            this._asyncId = 0;
            this._execute();
        },
        _execute: function () {
            Debug.assert(this._asyncId === 0);
            _markStart("_execute");

            var func = this._function;
            var context = this._context;
            var args = this._args;

            this._function = this._context = this._args = null;

            Debug.assert(func, "Failure here indicates an attempt to double-execute the function or execute after dispose");
            Debug.assert(Jx.isNullOrUndefined(args) || Jx.isArray(args));
            func.apply(context, args);
            _markStop("_execute");
        },
        _cancel: function () {
            var asyncId = this._asyncId;
            if (asyncId !== 0) {
                _mark("_cancel");
                _markAsyncStop("waiting-id: " + asyncId);
                this._asyncId = 0;
                this._dequeue(asyncId);
            }
        }
    };

    var Timer = Jx.Timer = function (duration, func, context, args) {
        // Don't use setTimer for <= 11ms.  It will load the high frequency timer DLL.
        Debug.assert(Jx.isValidNumber(duration) && duration > 11, "Invalid parameter: duration");

        this._duration = duration;
        AsyncBase.call(this, func, context, args);
        _mark("Timer: id=" + this._asyncId + " duration=" + duration);
    };
    Timer.prototype = {
        _enqueue: function (func) {
            return setTimeout(func, this._duration);
        },
        _dequeue: function (id) {
            clearTimeout(id);
        }
    };
    Jx.augment(Timer, AsyncBase);

    var AnimationFrame = Jx.AnimationFrame = function (func, context, args) {
        AsyncBase.call(this, func, context, args);
        _mark("AnimationFrame: " + this._asyncId);
    };
    AnimationFrame.prototype = {
        _enqueue: function (func) {
            return requestAnimationFrame(func);
        },
        _dequeue: function (id) {
            cancelAnimationFrame(id);
        }
    };
    Jx.augment(AnimationFrame, AsyncBase);

    var Immediate = Jx.Immediate = function (func, context, args) {
        AsyncBase.call(this, func, context, args);
        _mark("Immediate: " + this._asyncId);
    };

    Immediate.prototype = {
        _enqueue: function (func) {
            return setImmediate(func);
        },
        _dequeue: function (id) {
            clearImmediate(id);
        }
    };
    Jx.augment(Immediate, AsyncBase);

    function _mark(s) { Jx.mark("AsyncBase:" + s); }
    function _markStart(s) { Jx.mark("AsyncBase." + s + ",StartTA,Jx,AsyncBase"); }
    function _markStop(s) { Jx.mark("AsyncBase." + s + ",StopTA,Jx,AsyncBase"); }
    function _markAsyncStart(s) { Jx.mark("AsyncBase:" + s + ",StartTM,Jx,AsyncBase"); }
    function _markAsyncStop(s) { Jx.mark("AsyncBase:" + s + ",StopTM,Jx,AsyncBase"); }
    
});

//
// Copyright (C) Microsoft. All rights reserved.
//
// Wrapper APIs to wrap access to TransactionId/TransactionContext APIs (implemented in bici.dll).
// Example: Microsoft.WindowsLive.Instrumentation.TransactionId and Microsoft.WindowsLive.Instrumentation.TransactionContext
//
// Overall approach: TransactionId/Context implementation is majorily to assist debugging and
// correlation between client and server logs. Hence all calls to the library are enclosed in
// try/catch block to avoid propogating exceptions in event of failure. If required, failures can be 
// explicitly checked by checking the return type of the invoked functions.
//

/// <reference path="Jx.js" />

/*global Jx,Debug,Microsoft*/

Jx.delayDefine(Jx, "TransactionContext", function () {

    Jx.TransactionContext = /*@constructor*/function (scenarioId, marketLcid, experienceId, requestId, transactionId) {
        /// <summary>Constructor</summary>
        /// <param name="scenarioId" type="Number" optional="true">Id of the currently executing scenario</param>
        /// <param name="marketLcid" type="Number" optional="true">LCID of the current market</param>
        /// <param name="experienceId" type="Number" optional="true">ID of the current (BICI context) experience </param>
        /// <param name="requestId" type="String" optional="true">ID associated with the current request (BICI context) </param>
        /// <param name="transactionId" type="Microsoft.WindowsLive.Instrumentation.TransactionId" optional="true">TransactionId to used inorder to initialize the transaction context </param>
        /// <returns type="Microsoft.WindowsLive.Instrumentation.TransactionContext"> Constructed TransactionContext object Or NULL on exception </returns>

        Debug.assert(this instanceof Jx.TransactionContext, "Use new to create an object");
        Debug.assert(arguments.length === 0 || arguments.length === 2 || arguments.length === 4 || arguments.length === 5);
        Debug.assert(Jx.isUndefined(scenarioId) || Jx.isNumber(scenarioId));
        Debug.assert(Jx.isUndefined(marketLcid) || Jx.isNumber(marketLcid));
        Debug.assert(Jx.isUndefined(experienceId) || Jx.isNumber(experienceId));
        Debug.assert(Jx.isUndefined(requestId) || Jx.isString(requestId));
        Debug.assert(Jx.isUndefined(transactionId) || Jx.isObject(transactionId));

        try {
            if (Boolean(experienceId) && Boolean(requestId) && Boolean(transactionId)) {
                this._txContext = new Microsoft.WindowsLive.Instrumentation.TransactionContext(scenarioId, marketLcid, experienceId, requestId, transactionId);
            } else if (Boolean(experienceId) && Boolean(requestId)) {
                this._txContext = new Microsoft.WindowsLive.Instrumentation.TransactionContext(scenarioId, marketLcid, experienceId, requestId);
            } else if (Boolean(scenarioId) && Boolean(marketLcid)){
                this._txContext = new Microsoft.WindowsLive.Instrumentation.TransactionContext(scenarioId, marketLcid);
            }
        } catch (e) {
            Jx.log.error("Jx.TransactionContext: Failed to create TransactionContext object, error message = " +
                e.message + ", error code = " + e.number);        
        }
    };

    Jx.TransactionContext.prototype = {
        _txContext: /*@static_cast(Microsoft.WindowsLive.Instrumentation.TransactionContext)*/null,
        
        dispose: function () {
            /// <summary>Dispose the object.</summary>
            this._txContext = null;
        },

        _tryCall: function (func, isProperty) {
            /// <summary> Wraps call to methods of _txContext which don't accept any arguments</summary>
            /// <param name="func" optional="false">Name of the method of this._txContext object to invoke</param>
            /// <param name="isProperty" optional="false">Is func a method OR property of this._txContext</param>
            /// <returns> return value of invoked method OR NULL</returns>
            Debug.assert(Jx.isObject(this._txContext) || Jx.isNonEmptyString(func) || Jx.isBoolean(isProperty));
            try {
                return isProperty ? this._txContext[func] : this._txContext[func]();
            } catch (e) {
                Jx.log.error("Jx.TransactionContext: Failed to invoke method " + func + " , error message = " +
                        e.message + ", error code = " + e.number);
                return null;
            }
        },

        getNextTransactionContext: function (propertyId) {
            /// <summary>Returns the next transaction context for next call to given property</summary>
            /// <param name="propertyId">PropertyId to which next API call is made</param>
            /// <returns type="Jx.TransactionContext"> Next constructed transaction context </returns>
            Debug.assert(Jx.isNumber(propertyId), "parameter propertyId is undefined");
            if (this._txContext) {
                try {
                    var jxTxContext = new Jx.TransactionContext();
                    jxTxContext._txContext = /*@static_cast(Microsoft.WindowsLive.Instrumentation.TransactionContext)*/this._txContext.getNextTransactionContext(propertyId);
                    return jxTxContext;
                }
                catch (e) {
                    Jx.log.error("Jx.TransactionContext: Failed to invoke method getNextTransactionContext, error message = " +
                        e.message + ", error code = " + e.number);
                }
            }
            return null;
        },

        toBase64String: function () {
            /// <summary> Serializes the TransactionContext to a Byte array </summary>
            /// <returns type="String"> Base64 encoded serialized transaction context string </returns>
            return this._tryCall("toBase64String", false);
        },

        getScenarioId: function () {
            /// <summary>Gets the scenario Id from transaction context</summary>
            /// <returns type="Number">scenario id</returns>
            return this._tryCall("scenarioId", true);
        },

        getTransactionId: function () {
            ///<summary>Gets the transaction Id from transaction context</summary>
            ///<returns type="Microsoft.WindowsLive.Instrumentation.TransactionId">transaction id</returns>
            return this._tryCall("transactionId", true);
        }
    };
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Launch object - Handles startup functionality for all Windows Live Modern apps

/// <reference path="Res.js" />

/*jshint browser:true*/
/*global Jx,Debug,Microsoft,NoShip,Windows*/

Jx.delayDefine(Jx, ["Launch", "AppId"], function () {

    Jx.Launch = /*@constructor*/function (applicationId) {
        /// <summary>Constructor</summary>
        /// <param name="applicationId" type="Number">Application ID.</param>
        Jx.mark("Jx.Launch.ctor,StartTA,Jx,Launch");

        Debug.assert(this instanceof Jx.Launch);

        this._logger = new Jx.Log();
        this._logger.level = Jx.LOG_VERBOSE;

        Debug.assert(this._isValidAppId(applicationId));

        this._appId = applicationId;
        this._appStatus = Jx.Launch.AppStatus.unknown;
        Jx.mark("Jx.Launch.ctor,StopTA,Jx,Launch");
    };

    Jx.launch = /*@static_cast(Jx.Launch)*/null;

    (function () {
        /// <summary>
        /// All Windows Live Applications, used to indicate which application is calling Launch.
        /// </summary>

        // $TODO use an IE mock
        if (!Jx.isWWA || !window.Microsoft || !Microsoft.WindowsLive || !Microsoft.WindowsLive.Config) {
            Jx.AppId = {
                min: 0,
                chat: 0,
                call: 1,
                mail: 2,
                calendar: 3,
                people: 4, 
                photo: 5,
                skydrive: 6,
                
                testapp1: 7,
                testapp2: 8,
                testapp3: 9,
                
                livecomm: 10,
                max: 11
            };
        } else {
            var appId = Microsoft.WindowsLive.Config.Shared.ApplicationId;
            /// This enum must be kept in sync with launch\idl\suiteupdate.xsd
            Jx.AppId = {
                min: 0,
                chat: appId.chat,
                call: appId.call,
                mail: appId.mail,
                calendar: appId.calendar,
                people: appId.people,
                photo: appId.photo,
                skydrive: appId.skydrive,
                
                testapp1: appId.testapp1,
                testapp2: appId.testapp2,
                testapp3: appId.testapp3,
                
                livecomm: appId.livecomm,
                max: appId.max
            };       
        }
    })();

    /// <summary>
    /// Application status enum.
    /// </summary>
    Jx.Launch.AppStatus = {
        unknown: 0,
        ok: 1,
        optionalUpdate: 2,
        mandatoryUpdate: 3
    };

    /// <summary>
    /// Application status enum for BiCi
    /// </summary>
    Jx.Launch.prototype._launchStatus = {
        notBlocked: 0,
        willBlock: 1,
        blocked: 2,
        unblocked: 3
    };

    /// <summary>
    /// Identity of the calling application
    /// </summary>
    Jx.Launch.prototype._appId = null;

    /// <summary>
    /// Variable used to interact with State Manager
    /// </summary>
    Jx.Launch.prototype._localSettings = null;

    /// <summary>
    /// Variable used to interact with Suite Update Config
    /// </summary>
    Jx.Launch.prototype._suiteUpdate = /*@static_cast(Microsoft.WindowsLive.Config.Shared.ISuiteUpdate)*/null;

    /// <summary>
    /// Variable used to hold our own platform object
    /// </summary>
    Jx.Launch.prototype._ownPlatform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/null;

    /// <summary>
    /// Function used to as the Suite Update changed event callback
    /// </summary>
    Jx.Launch.prototype._listener = /*@static_cast(Function)*/null;

    /// <summary>
    /// ETW logger
    /// </summary>
    Jx.Launch.prototype._logger = /*@static_cast(Jx.Log)*/null;

    Jx.Launch.prototype._log = function (eventName) {
        /// <summary>
        ///     Log ETW event
        /// </summary>
        /// <param name="eventName" type="String">ETW event name</param>

        if (Jx.isWWA) {
            NoShip.only(this._logger.perf(eventName));
        }
    };

    Jx.Launch.prototype.dispose = function () {
        /// <summary>Safe object dispose call.</summary>

        if (Boolean(this._listener) && Boolean(this._suiteUpdate)) {
            this._suiteUpdate.removeEventListener('changed', this._listener);
        }
        Jx.dispose(this._suiteUpdate);
        this._suiteUpdate = null;
        Jx.dispose(this._ownPlatform);
        this._ownPlatform = null;
        this._localSettings = null;
        this._logger = null;
    };

    Jx.Launch.prototype._initSettings = function () {
        /// <summary>
        /// Initializes local storage variables on demand
        /// </summary>
        if (!this._localSettings) {
            this._localSettings = Jx.appData.localSettings().createContainer("Launch");
            // Need to clear the cached values because of Win8 bug 682326
            var currentVer = this._getPackageVersion();
            var cachedVer = this._localSettings.get("PackageVersion");
            if (currentVer !== cachedVer) {
                Jx.appData.localSettings().deleteContainer("Launch");
                this._localSettings = Jx.appData.localSettings().createContainer("Launch");
                this._localSettings.set("PackageVersion", currentVer);
            }

        }
    };

    Jx.Launch.prototype.startDeferredTasks = function (platform) {
        /// <summary>
        ///     Gets the application's current status.
        /// </summary>
        /// <param name="platform" optional="true" type="Microsoft.WindowsLive.Platform.Client">Contacts platform instance</param>
        /// <returns type="Number">The application's status. Up-to-date, optional update, mandatory update.</returns>

        if (!Jx.isWWA) {
            return Jx.Launch.AppStatus.ok;
        }

        this._log("Deferred_Launch_Tasks_begin");

        if (!platform) {
            try {
                if (!this._ownPlatform) {
                    // TODO: WinLive 412662 Remove once ABI reference files support projecting activation factories as constructor signatures.
                    /// <disable>JS3053.IncorrectNumberOfArguments</disable>
                    this._ownPlatform = new Microsoft.WindowsLive.Platform.Client("launch");
                    /// <enable>JS3053.IncorrectNumberOfArguments</enable>

                    var activation = Jx.activation;
                    activation.addListener(activation.suspending, this._onSuspending, this);
                    activation.addListener(activation.resuming, this._onResuming, this);
                }
                platform = this._ownPlatform;
            } catch (ex) {
                this._logger.info("Launch: Platform failed to initialize, bailing with status = ok");
                return Jx.Launch.AppStatus.ok;
            }
        }

        // If the platform object passed into Launch is not valid, log a msg and return status.ok. Otherwise, the call
        // into configs later will throw an unhandled exception.
        if (!(platform instanceof Microsoft.WindowsLive.Platform.Client)) {
            this._logger.info("Launch: Platform object is not valid, bailing with status = ok");
            return Jx.Launch.AppStatus.ok;
        }

        // Initialize local storage vars if they haven't been already.
        this._initSettings();

        // Corresponding end event is Dynamic_Configs_Callback_begin
        this._log("Dynamic_Configs_Init_begin");

        if (!this._suiteUpdate) {
            var that = this;
            var promise = Microsoft.WindowsLive.Config.Shared.SuiteUpdate.loadAsync(platform);
            promise.then(
                function (suiteupdate) { that.updateApplicationStatus(suiteupdate); },
                function (err) { that._logger.error("Launch = Failed to load SuiteUpdate config: " + err); });
        }

        this._log("Deferred_Launch_Tasks_end");
        return Jx.Launch.AppStatus.ok;
    };

    Jx.Launch.prototype.updateApplicationStatus = function (suiteupdate) {
        /// <summary>
        ///     Handles (a)sync load completion and update callback
        /// </summary>
        /// <param name="suiteupdate" type="Microsoft.WindowsLive.Config.Shared.ISuiteUpdate">Config data instance</param>

        this._log("Dynamic_Configs_Callback_begin");
        var that = this;
        that._suiteUpdate = suiteupdate;
        if (!this._listener) {
            this._listener =
                function (ev) {
                    /// <param name="ev" type="ABIEvent" />
                    var suiteUpdate = ev.target;
                    that.updateApplicationStatus(suiteUpdate);
                }.bind(this);
            this._suiteUpdate.addEventListener('changed', this._listener);
        }

        var data = /*@static_cast(Microsoft.WindowsLive.Config.Shared.IApp)*/suiteupdate.app.lookup(this._appId);
        var appMinVer = data.minVersion;
        var appCurrentVer = data.currentVersion;
        var url = data.moreInfoUrl;
        if (this._isSideLoaded()) {
            url = Jx.appData.localSettings().get("LiveDogUri");
        }
        this._localSettings.set("AppMinVersion" + String(this._appId), String(appMinVer));
        this._localSettings.set("AppCurrentVersion" + String(this._appId), String(appCurrentVer));
        this._localSettings.set("AppMoreInfoUrl" + String(this._appId), String(url));
        this._logger.info("Launch = minVersion retrieved is " + String(appMinVer));
        this._logger.info("Launch = currentVersion retrieved is " + String(appCurrentVer));
        this._logger.info("Launch = moreInfoUrl retrieved is " + String(url));

        var pkgStatus = this._getPkgVersionStatus();
        var launchState = this._launchStatus.notBlocked;
        if (pkgStatus === Jx.Launch.AppStatus.mandatoryUpdate) {
            launchState = this._launchStatus.willBlock;
        }

        // If the current status is mandatoryUpdate, and after this config change it's not, then crash this app.
        if (this.getCurrentAppStatus() === Jx.Launch.AppStatus.mandatoryUpdate || Jx.root instanceof Jx.UpgradePage) {

            launchState = this._launchStatus.blocked;

            if (pkgStatus !== Jx.Launch.AppStatus.mandatoryUpdate) {

                if (Jx.bici) {
                    // Reset the launch status change point
                    launchState = this._launchStatus.unblocked;
                    Jx.bici.startExperience();
                    Jx.bici.set(Microsoft.WindowsLive.Instrumentation.Ids.Package.launchstatuschange, launchState);
                    Jx.bici.endExperience();
                }

                this._logger.info("No longer in mandatoryUpdate state.");
            
                // Update BVTs bypass the config publish process and directly set values in local settings.
                // When they retrieve the newest config, which says no blocking, they trigger this message.
                // Log the message but don't crash the app if testHookNoCrash is set so tests can pass.
                
                if (!this._localSettings.get("testHookNoCrash")) {
                
                    window.msSetImmediate(function () { throw new Error("No longer in mandatoryUpdate state."); });
                
                }
                
            }
        }

        if (Jx.bici) {
            // Set the launch status change point
            Jx.bici.set(Microsoft.WindowsLive.Instrumentation.Ids.Package.launchstatuschange, launchState);
        }

        this._log("Dynamic_Configs_Callback_end");
    };

    Jx.Launch.prototype.getApplicationStatus = function (skipDeferredTasks, platform) {
        /// <summary>
        ///     Gets the application's current status.
        /// </summary>
        /// <param name="skipDeferredTasks" type="Boolean" optional="true">Whether to skip deferred tasks</param>
        /// <param name="platform" optional="true" type="Microsoft.WindowsLive.Platform.Client">Contacts platform instance</param>
        /// <returns>The application's cached status. Up-to-date, optional update, mandatory update.</returns>
        Jx.mark("Jx.Launch.getApplicationStatus,StartTA,Jx,Launch");

        if (!Jx.isWWA) {
            return Jx.Launch.AppStatus.ok;
        }
        this._log("Retrieve_App_Status_begin");

        // Initialize local storage vars if they haven't been already.
        this._initSettings();
        var ls = this._localSettings;

        
        if (ls.get("offlineHook")) {
            this._appStatus = Jx.Launch.AppStatus.ok;
            return this._appStatus;
        }
        
   
        if (!skipDeferredTasks) {
            this.startDeferredTasks(platform); // Ignoring the return value of startDeferredTasks
        }

        var appStatus = this._getPkgVersionStatus();

        // if we're in the mandatory state and we have a different state value than before block
        if (appStatus === Jx.Launch.AppStatus.mandatoryUpdate && this._appStatus !== appStatus) {
            Jx.mark("Jx.Launch.getApplicationStatus:onLine,StartTA,Jx,Launch");
            try {
                // If we detect no Internet access, return status OK and don't block, since users will have no way to update through the store.
                if (!navigator.onLine) {
                    this._appStatus = Jx.Launch.AppStatus.ok;
                    return this._appStatus;
                }
            } catch (e) {
                // If an error occurred and we can't get network information, log the error and check the status as normal.
                this._logger.error("Launch - error getting NetworkInformation: " + e);
            }
            Jx.mark("Jx.Launch.getApplicationStatus:onLine,StopTA,Jx,Launch");

            // If, for whatever reason, Jx.app is not defined, we do nothing other than return the appStatus value
            if (Jx.app) {
                var url = ls.get("AppMoreInfoUrl" + String(this._appId));
            
                // Restart the config load with our own platform so that later if config is updated we'll hear the notifications.
                this._closeExistingListeners();
                this.startDeferredTasks(null);

                if (Jx.bici) {
                    // Set the launch status change point
                    Jx.bici.set(Microsoft.WindowsLive.Instrumentation.Ids.Package.launchstatuschange, this._launchStatus.blocked);
                    // Increment BICI value for displaying the mandatory update page
                    Jx.bici.increment(Microsoft.WindowsLive.Instrumentation.Ids.Package.mandatoryUpdateShownCount, 1 /* number of times Update dialog is shown */);

                    // Call bici.endExperience to make sure existing data points are properly logged/uploaded, in case of a forced app shutdown on upgrade.
                    // Apps are not running anymore at this point, so there shouldn't be any new data point after this call.
                    this._logger.info("Launch - Calling BICI endExperience.");
                    Jx.bici.endExperience();
                }
            
                Jx.app.setRoot(new Jx.UpgradePage(url), document.body);
            }
        }

        this._log("Retrieve_App_Status_end");
        Jx.mark("Jx.Launch.getApplicationStatus,StopTA,Jx,Launch");
        this._appStatus = appStatus;
        return appStatus;
    };

    Jx.Launch.prototype._closeExistingListeners = function () {
        /// <summary>
        ///     If we're not managing our own instance of the platform dispose all data loaded from that platform.
        /// </summary>
        if (!this._ownPlatform) {
            if (Boolean(this._listener) && Boolean(this._suiteUpdate)) {
                this._suiteUpdate.removeEventListener('changed', this._listener);
                this._listener = null;
                Jx.dispose(this._suiteUpdate);
                this._suiteUpdate = null;
            }
        }
    };

    Jx.Launch.prototype._getPkgVersionStatus = function () {
        var appStatus = Jx.Launch.AppStatus.ok;
        var pkgVer = this._getPackageVersion();
        var appMinVer = pkgVer;
        var appCurrentVer = appMinVer;
        // Initialize local storage vars if they haven't been already.
        this._initSettings();

        var ls = this._localSettings;
        // If properties don't exist in State Manager, that's fine - just set to the suite version, so version check will return OK status.
        appMinVer = ls.get("AppMinVersion" + String(this._appId));
        if (!appMinVer) {
            appMinVer = pkgVer;
        }
        appCurrentVer = ls.get("AppCurrentVersion" + String(this._appId));
        if (!appCurrentVer) {
            appCurrentVer = pkgVer;
        }

        if (this._isVersionGreater(appMinVer, pkgVer)) {
            appStatus = Jx.Launch.AppStatus.mandatoryUpdate;
        } else if (this._isVersionGreater(appCurrentVer, pkgVer)) {
            appStatus = Jx.Launch.AppStatus.optionalUpdate;
        }

        return appStatus;
    };

    Jx.Launch.prototype._onSuspending = function () {
        /// <summary>
        ///     sends the suspend event to the platform if we created our own
        /// </summary>
    
        if (this._ownPlatform) {
            this._logger.info("Launch - suspending handler");
            // Win8 bug 637158
            try {
                this._ownPlatform.suspend();
            } catch (e) {
                this._logger.error("Launch - error suspending: " + e);
            }
        }
    };

    Jx.Launch.prototype._onResuming = function () {
        /// <summary>
        ///     sends the resume event to the platform if we created our own
        /// </summary>

        if (this._ownPlatform) {
            this._logger.info("Launch - resuming handler");
            this._ownPlatform.resume();
        }
    };

    Jx.Launch.prototype._isSideLoaded = function () {
        /// <summary>
        ///     Return whether the package is sideloaded via WlxAppXManager
        /// </summary>
        /// <returns>Whether the package is sideloaded via WlxAppXManager</returns>
        var locSet = Jx.appData.localSettings();
        var sideLoad = locSet.get("SideLoaded");
        this._logger.info("Launch - Sideload = " + sideLoad);
        return sideLoad;
    };

    Jx.Launch.prototype.getCurrentAppStatus = function () {
        /// <summary>
        ///     Get the Jx.Launch app status
        /// </summary>
        return this._appStatus;
    };

    Jx.Launch.prototype._isValidAppId = function (applicationId) {
        /// <summary>
        ///     Checks to see if the given input is a valid Windows Live Application enum
        /// </summary>
        /// <param name="applicationId" type="Number" Integer="true">Enum value for a Windows Live App</param>
        /// <returns>Whether the given enum value is valid</returns>

        if (Jx.isNumber(applicationId)) {
            if (applicationId >= Jx.AppId.min &&
                applicationId < Jx.AppId.max) {
                return true;
            }
        }

        return false;
    };

    Jx.Launch.prototype._getPackageVersion = function () {
        /// <summary>
        ///     Gets the suite version.
        /// </summary>
        var v = Windows.ApplicationModel.Package.current.id.version;
        return v.major + "." + v.minor + "." + v.build + "." + v.revision;
    };

    Jx.Launch.prototype._isVersionGreater = function (v1, v2) {
        /// <summary>
        /// Compares versions
        /// </summary>
        /// <param name="v1" type="String">First version to compare, in w.x.y.z format.</param>
        /// <param name="v2" type="String">Second version to compare, in w.x.y.z format.</param>
        var a1 = v1.split(".");
        var a2 = v2.split(".");
        var i = 0;
        Debug.assert(a1.length === a2.length);
        while (i < a1.length && i < a2.length) {
            var n1 = parseInt(a1[i], 10);
            var n2 = parseInt(a2[i], 10);
            if (n1 > n2) {
                return true;
            } else if (n2 > n1) {
                return false;
            }
            i++;
        }
        return false;
    };
});

// TODO: move it to a separate file
Jx.delayDefine(Jx, "UpgradePage", function () {

    Jx.UpgradePage = /*@constructor*/function (url) {
        /// <summary>Constructor</summary>
        /// <param name="url" type="String">Url to take the user to the Windows Store.</param>
        this._url = url;
        this.initComponent();
        this._id = "upgradepage";
    };

    Jx.augment(Jx.UpgradePage, Jx.Component);

    Jx.UpgradePage.prototype.getUI = function (ui) {
        /// <summary>Returns the UI for this mandatory upgrade page.</summary>
        /// <param name="ui" type="JxUI">Object to fill with CSS/HTML.</param>

        ui.html = "<div id='upgradeFlyout'><div id='centerBox'><h1>" + Jx.res.getString("/launch/launchMandatoryUpdateTitle") + "</h1>" + 
                  "<span>" + Jx.res.loadCompoundString("/launch/launchMandatoryUpdateText", "<a href='" + this._url + "'>", "</a>") + "</span></div></div>";
    
        // Some apps gave body an ID and were styling based on that ID. Rename to remove old styles.
        document.body.id = "upgradePage";
    
        // Load in the Launch CSS
        Jx.loadCss("/ModernLaunch/Launch/resources/css/Launch.css");
    };
});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Jx.js" />

/*global Jx,Debug*/

Jx.delayDefine(Jx, ["Key", "key", "KeyCode"], function () {

    var keyCodeMap = {
        21: 18,   // Right Alt -> Left Alt
        25: 17,   // Right Ctrl -> Left Ctrl
        92: 91,   // Right Windows -> Left Windows
        96: 48,   // Numpad 0 -> 0
        97: 49,   // Numpad 1 -> 1
        98: 50,   // Numpad 2 -> 2
        99: 51,   // Numpad 3 -> 3
        100: 52,  // Numpad 4 -> 4
        101: 53,  // Numpad 5 -> 5
        102: 54,  // Numpad 6 -> 6
        103: 55,  // Numpad 7 -> 7
        104: 56,  // Numpad 8 -> 8
        105: 57,  // Numpad 9 -> 9
        106: 56,  // Numpad * -> *
        107: 187, // Numpad + -> +
        109: 189, // Numpad - -> -
        110: 190, // Numpad . -> .
        111: 191  // Numpad / -> /
    };

    Jx.Key = /*@constructor*/function () {
        Debug.assert(this instanceof Jx.Key, "Jx.Key - use new");
    };

    Jx.Key.prototype = {
        getLabel: function (shortcut) {
            /// <summary>Helper function to load localized keyboard shortcut strings. Use only if you need to display the string.</summary>
            /// <param name="shortcut" type="String">Shortcut to localize, such as "Enter", "Ctrl + Enter", and "Ctrl + Alt + Enter" - see Jx.KeyCode for allowable keys.</param>
            /// <returns type="String">The localized label.</returns>

            // Make lower case and remove whitespace
            var tokens = shortcut.toLowerCase().replace(/\s/g, "").split("+");
            Debug.assert(tokens.length > 0, "Jx.Key.getLabel - Invalid parameter syntax.");

            // Collect the localized labels.
            var labels = [];

            var len = tokens.length;
            for (var i = 0; i < len; i++) {
                var key = tokens[i];

                Debug.assert(Jx.KeyCode[key], "Jx.Key.getLabel - " + key + " is not a valid key in Jx.KeyCode.");

                var keyLabel = Jx.res.getString("/keylabel/residKeyLabel_" + key);
                labels.push(keyLabel);
            }

            var shortcutLabel;
            if (labels.length === 1) {
                shortcutLabel = labels[0];
            } else {
                var args = ["/keylabel/residShortcutLabelFormat_" + labels.length.toString()].concat(labels);
                shortcutLabel = Jx.res.loadCompoundString.apply(Jx.res, args);
            }

            Debug.assert(Jx.isNonEmptyString(shortcutLabel), "Jx.Key.getLabel - Could not localize shortcut.");
            return shortcutLabel;
        },

        mapKeyCode: function (keyCode) {
            /// <summary>Map redundant keycodes that don't have unique display strings - for example converts the keycode for numpad 0 to regular 0
            /// Meant to be used in keyboard handlers: 
            /// if (Jx.key.mapKeyCode(e.keyCode) === Jx.KeyCode["0"]) { handleNumpadZeroOrNormalZero(); }
            /// </summary>
            /// <param name="keyCode" type="Number">Keycode to map</param>
            /// <returns type="Number">The mapped keycode.</returns>

            return keyCodeMap[keyCode] || keyCode;
        }
    };

    /// <disable>DoNotQuoteObjectLiteralPropertyNames</disable>
    Jx.KeyCode = {
        backspace: 8,
        tab: 9,
        enter: 13,
        shift: 16,
        ctrl: 17,
        alt: 18,
        pause: 19,
        "break": 19,
        capslock: 20,
        escape: 27,
        space: 32,
        pageup: 33,
        pagedown: 34,
        end: 35,
        home: 36,
        leftarrow: 37,
        uparrow: 38,
        rightarrow: 39,
        downarrow: 40,
        insert: 45,
        "delete": 46,
        0: 48,
        1: 49,
        2: 50,
        3: 51,
        4: 52,
        5: 53,
        6: 54,
        7: 55,
        8: 56,
        9: 57,
        ")": 48,
        "!": 49,
        "@": 50,
        "#": 51,
        "$": 52,
        "%": 53,
        "^": 54,
        "&": 55,
        "*": 56,
        "(": 57,
        a: 65,
        b: 66,
        c: 67,
        d: 68,
        e: 69,
        f: 70,
        g: 71,
        h: 72,
        i: 73,
        j: 74,
        k: 75,
        l: 76,
        m: 77,
        n: 78,
        o: 79,
        p: 80,
        q: 81,
        r: 82,
        s: 83,
        t: 84,
        u: 85,
        v: 86,
        w: 87,
        x: 88,
        y: 89,
        z: 90,
        windows: 91,
        select: 93,
        /*
         Numperpad key codes are left out because they are redundant and do not have unique display strings.
         Use mapKeyCode to translate from numpad keys to the regular number keys, which do have unique strings.
        */
        f1: 112,
        f2: 113,
        f3: 114,
        f4: 115,
        f5: 116,
        f6: 117,
        f7: 118,
        f8: 119,
        f9: 120,
        f10: 121,
        f11: 122,
        f12: 123,
        numlock: 144,
        scrolllock: 145,
        browserback: 166,
        ";": 186,
        "semicolon": 186, // Shortcut manager tokenizes on ';', so add 'semicolon' to simplify
        ":": 186,
        "=": 187,
        "plus": 187, // We tokenize on '+', so use 'plus' to simplify
        ",": 188,
        "<": 188,
        "-": 189,
        "_": 189,
        "period": 190, // MakePRI will error with the actual character in the resource ID
        ">": 190,
        "forwardslash": 191, // MakePRI will error with the actual character in the resource ID
        "?": 191,
        "`": 192,
        "~": 192,
        "[": 219,
        "{": 219,
        "backslash": 220, // MakePRI will error with the actual character in the resource ID
        "|": 220,
        "]": 221,
        "}": 221,
        "'": 222,
        "\"": 222
    };
    /// <enable>DoNotQuoteObjectLiteralPropertyNames</enable>

    Jx.key = new Jx.Key();
});

//
// Copyright (C) Microsoft. All rights reserved.
//

/*jshint browser:true*/
/*global Jx,Debug,WinJS,self*/

Jx.delayDefine(Jx, ["scheduler", "Scheduler", "ScheduledQueue"], function () {
    "use strict";

    var Scheduler = Jx.Scheduler = /*@constructor*/function () {
        ///<summary>The Scheduler provides a facility for queueing, prioritizing and sequencing asynchronous
        /// workitems. Prioritized Job objects are queued into the Scheduler through a tree of JobSets
        /// which each feed visibility and sequencing information.</summary>

        this._basePriorities = Array(BasePriority.count);
        for (var i = 0, len = BasePriority.count; i < len; ++i) {
            this._basePriorities[i] = { definitions: [], minValue: 0, maxValue: -1 };
        }

        this._topPriority = 0;
        this._buckets = [];

        //  The scheduler tries to avoid spending time re-sorting and recalculating every time the user makes a request. It
        // tries to focus on the critical jobs at hand. So it supports a lazy validation. Each bucket has a validity level
        // to indicate whether it is properly sorted, which is cleared whenever a job is queued to the bucket. That lets
        // low priority buckets wallow in an unsorted, chaotic mess until it's actually their turn to run.
        //  Changes to jobset order and visibility can also cause the sort of a bucket to become invalid. To this end,
        // the scheduler tracks a "currentValidity" level. When that is incremented, all buckets with a previous validity
        // become invalid.
        //   And changes to visibility are also lazily evaluated, as scrolling and navigation activity can change a large
        // number of jobsets at once. So a validity level for jobset visibility is similarly tracked.
        this._currentValidityToken = this._visibilityValidityToken = 0;

        this._hasVisibleJobs = false;
        this._prioritizingInvisible = 0;

        this._winjsScheduleFunction = null;
        this._schedulePriorityRevert = self.setTimeout.bind(self, this._stopPrioritizingInvisible.bind(this), 200);
        this._clearTimeout = self.clearTimeout.bind(self);
        this._getTime = Date.now.bind(Date);
        this._winjsJob = null;
        this._inWinJSCallback = false;
        this._timeSlice = null;    // use defaultTimeSlice
        this._isPaused = false;
        this._shouldYield = false;

        this._jobCounter = 0;

        var rootJobSet = this._rootJobSet = new JobSet(this, null /* parent */, 0);
        Debug.setObjectName(rootJobSet, "root");

        Debug.only(Object.seal(this));

        _mark("created");
    };

    var BasePriority = Scheduler.BasePriority = {
            aboveHigh: 0,
            high: 1,
            aboveNormal: 2,
            normal: 3,
            belowNormal: 4,
            idle: 5,
            count: 6
        },
        canceledJobState = { isCanceled: true },
        defaultTimeSlice = 12,
        WinJSPriorityMapping = {},
        visibilityThreshold = BasePriority.belowNormal;

    var repeatToken = {};
    Scheduler.repeat = function (shouldRepeat) {
        /// <summary>This function can be used to create a return value for jobs that should repeat multiple times.
        /// Usage:
        ///    var i = 0;
        ///    Jx.scheduler.addJob(null, pri, "Repeating job", function () {
        ///        ++i;
        ///        Jx.log.info("Iteration: " + i);
        //         return Jx.Scheduler.repeat(i < 10);
        ///    });
        /// </summary>
        Debug.assert(Jx.isBoolean(shouldRepeat));
        return shouldRepeat ? repeatToken : null;
    };

    Scheduler._initWinJS = function () {
        _markStart("_initWinJS");
        Scheduler._initWinJS = Jx.fnEmpty;
        var WinJSScheduler = WinJS.Utilities.Scheduler,
            WinJSPriority = WinJSScheduler.Priority;
        defaultTimeSlice = WinJSScheduler._TIME_SLICE / 3;
        Debug.assert(Jx.isValidNumber(defaultTimeSlice));
        Debug.assert(WinJSPriority.high > WinJSPriority.aboveNormal);   // make sure WinJS priorities descend
        WinJSPriorityMapping[BasePriority.aboveHigh] = WinJSPriority.high + 1;
        WinJSPriorityMapping[BasePriority.high] = WinJSPriority.high;
        WinJSPriorityMapping[BasePriority.aboveNormal] = WinJSPriority.aboveNormal;
        WinJSPriorityMapping[BasePriority.normal] = WinJSPriority.normal;
        WinJSPriorityMapping[BasePriority.belowNormal] = WinJSPriority.belowNormal;
        WinJSPriorityMapping[BasePriority.idle] = WinJSPriority.idle;
        Debug.assert(Object.keys(WinJSPriorityMapping).length === BasePriority.count);
        _markStop("_initWinJS");
    };

    Scheduler.prototype = {
        //    Priority definition
        //       Priorities are, at their core, numbers.  0 is the highest priority and larger numbers are lower priority.  Each priority falls into a range of priorities, referred to
        //    as a "base priority":   idle, normal, high, etc.  However, consumer experience priorities as object literals.  They are never aware of the exact values, which may change
        //    as additional priorities are defined.
        //       Consumers define their priorities using the definePriorities method.  They pass in a map of descriptors, and receive a parallel map of priority objects that they can pass to
        //    addJob, etc.  Each property descriptor references a base priority, which will expand its range as needed to encompass the newly defined items.
        //       The map passed in must be defined in order from highest to lowest priority, and the priorities returned will match that order.  Because there will be multiple different callers
        //    of definePriorities for various components, this function guarantees that the priority values are the same no matter what order those calls come in.
        definePriorities: function (descriptors) {
            ///<param name="descriptors">This is a map of priority descriptors.  Each priority must specify a base priority range to which it belongs, and may specify a string description to be
            ///used for logging.  For example:  var myPriorities = definePriorities({
            ///    importantThing:     { base: Jx.Scheduler.BasePriority.aboveNormal, description: "My component's most important thing" },
            ///    alsoImportantThing: { base: Jx.Scheduler.BasePriority.aboveNormal, description: "Some other very important thing, slightly less important than the previous" },
            ///    unimportantThing:   { base: Jx.Scheduler.BasePriority.idle }
            ///}</param>
            ///<returns>A map with the same keys as the input, containing actual priority definitions, suitable for use with addJob</returns>
            _markStart("definePriorities");

            // Priorities are listed from highest to lowest.  This array tracks the number of priorities defined in this
            // call so that, for each base priority, each value defined is one worse than the last.
            var offsets = Array(BasePriority.count);
            for (var i = 0, len = BasePriority.count; i < len; ++i) {
                offsets[i] = 0;
            }

            var result = {};
            var definitionValueInc = function (definition) { ++definition._value; };
            for (var name in descriptors) {
                var descriptor = descriptors[name];
                Debug.assert(Jx.isObject(descriptor), "Expected descriptor: " + name);
                Debug.assert(Jx.isNumber(descriptor.base) && descriptor.base >= 0 && descriptor.base < BasePriority.count, "Invalid base priority: " + name);
                Debug.assert(Jx.isNonEmptyString(descriptor.description) || Jx.isNullOrUndefined(descriptor.description), "Invalid description: " + name);

                var basePriority = this._basePriorities[descriptor.base];
                var value = basePriority.minValue + offsets[descriptor.base]++;

                if (value > basePriority.maxValue) {
                    // We need to expand the range for this basePriority
                    ++basePriority.maxValue;

                    // Define a new bucket for this priority value
                    var bucket = [];
                    bucket.validityToken = this._currentValidityToken;
                    this._buckets.splice(value, 0, bucket);

                    // And adjust all subsequent ranges/values accordingly
                    for (var j = descriptor.base + 1, jLen = BasePriority.count; j < jLen; ++j) {
                        var subsequentPriority = this._basePriorities[j];
                        ++subsequentPriority.minValue;
                        ++subsequentPriority.maxValue;
                        subsequentPriority.definitions.forEach(definitionValueInc);
                    }
                }

                var definition = result[name] = {
                    _value: value,
                    _description: descriptor.description || name,
                    _base: descriptor.base
                };
                basePriority.definitions.push(definition);
            }
            this._computeTopPriority();
            _markStop("definePriorities");
            return result;
        },

        //    Job management
        //
        //       A job is a single action, queued to the scheduler for later execution. Jobs can be large or small,
        //    however large jobs will block the UI thread. Each job has a priority, and jobs with a higher priority execute
        //    before jobs with a lower priority.
        //
        addTimerJob: function (jobSet, pri, description, duration, func, context, args) {
            ///<summary>Queues a job to this scheduler</summary>
            ///<param name="jobSet" type="JobSet"/>
            ///<param name="pri">The priority of this job</param>
            ///<param name="duration">The time in milliseconds to delay starting this job</param>
            ///<param name="func" type="Function">The function that will be called</param>
            ///<param name="context" optional="true">The this context for the callback</param>
            ///<param name="args" type="Array" optional="true">The arguments that will be passed to that function call</param>
            Debug.assert(Jx.isNullOrUndefined(jobSet) || this.isValidJobSet(jobSet), "Invalid parameter: jobSet");
            Debug.assert(this.isValidPriority(pri), "Invalid parameter: pri");
            Debug.assert(Jx.isNullOrUndefined(description) || Jx.isString(description), "Invalid parameter: description");
            Debug.assert(Jx.isFunction(func), "Invalid parameter: func");
            Debug.assert(Jx.isNullOrUndefined(context) || Jx.isObject(context), "Invalid parameter: context");
            Debug.assert(Jx.isNullOrUndefined(args) || Jx.isArray(args), "Invalid parameter: args");
            Debug.assert(Jx.isValidNumber(duration) && duration > 11, "Invalid parameter: duration");

            jobSet = jobSet || this._rootJobSet;

            var job = {
                _context: context,
                _function: func,
                _arguments: args,
                _jobSet: jobSet,
                _cancel: jobSet._cancel,
                _pri: pri,
                _description: description || pri._description,
                _counter: ++this._jobCounter,
                dispose: function () {
                    if (!this._cancel.isCanceled) {
                        this._cancel = canceledJobState;
                    }
                    Jx.dispose(this._timer);
                    Jx.dispose(this._internalJob);
                },
                runIteration: function () {
                    var result = true;
                    if (!this._cancel.isCanceled) {
                        var loggedString = "_runTimerJob:counter=" + this._counter + " job=" + this._description;
                        _markStart(loggedString);
                        this._timer.runNow();
                        Debug.assert(this._internalJob);
                        result = this._internalJob.runIteration();
                        _markStop(loggedString);
                    }
                    return result;
                },
                run: runJobCompletely,
                _internalJob: null,
                _timer: null,
            };
            job._timer = new Jx.Timer(duration, function (currentJob) {
                jobSet.completeTimer(currentJob._timer);
                if (!currentJob._cancel.isCanceled) {
                    currentJob._internalJob = this.addJob(jobSet, pri, description, func, context, args);
                    currentJob.runIteration = function() { return this._internalJob.runIteration() };
                }
            }, this, [job]);
            jobSet.addTimer(job._timer);

            Debug.only(Object.seal(job));

            return job;
        },
        addJob: function (jobSet, pri, description, func, /*@dynamic*/context, args) {
            ///<summary>Queues a job to this scheduler</summary>
            ///<param name="jobSet" type="JobSet"/>
            ///<param name="pri">The priority of this job</param>
            ///<param name="func" type="Function">The function that will be called</param>
            ///<param name="context" optional="true">The this context for the callback</param>
            ///<param name="args" type="Array" optional="true">The arguments that will be passed to that function call</param>
            Debug.assert(Jx.isNullOrUndefined(jobSet) || this.isValidJobSet(jobSet), "Invalid parameter: jobSet");
            Debug.assert(this.isValidPriority(pri), "Invalid parameter: pri");
            Debug.assert(Jx.isNullOrUndefined(description) || Jx.isString(description), "Invalid parameter: description");
            Debug.assert(Jx.isFunction(func), "Invalid parameter: func");
            Debug.assert(Jx.isNullOrUndefined(context) || Jx.isObject(context), "Invalid parameter: context");
            Debug.assert(Jx.isNullOrUndefined(args) || Jx.isArray(args), "Invalid parameter: args");

            Scheduler._initWinJS();

            jobSet = jobSet || this._rootJobSet;

            var job = {
                _context: context,
                _function: func,
                _arguments: args,
                _jobSet: jobSet,
                _cancel: jobSet._cancel,
                _pri: pri,
                _description: description || pri._description,
                _counter: ++this._jobCounter,
                dispose: disposeJob,
                runIteration: runJobIteration,
                run: runJobCompletely
            };
            Debug.only(Object.seal(job));

            ++jobSet._pendingJobs;

            // Add the job to the right priority bucket and invalidate it
            var bucket = this._buckets[pri._value];
            bucket.push(job);
            bucket.validityToken = -1;

            // Track whether we have any visible jobs to run
            if (!this._hasVisibleJobs && jobSet.visible) {
                this._hasVisibleJobs = true;
                this._validatePendingPriority();
            }

            // If this job is at or better than the top priority, we'll need to switch priorities.
            // This is an optimization to avoid having to scan for the best priority each time the scheduler executes.
            if (this._topPriority > pri._value) {
                _mark("addJob:_topPriority=" + this._topPriority);
                this._topPriority = pri._value;
                this._validatePendingPriority();
            }

            // Make sure the scheduler is running
            if (!this._winjsJob && !this._inWinJSCallback && !this._isPaused) {
                Debug.assert(this.testGetJobCount() === 1);
                _markAsyncStart("pending");
                this._schedule();
            }

            _mark("addJob:counter=" + job._counter + " job=" + job._description);
            return job;
        },

        //    JobSet management
        //
        //        A jobset represents a group of jobs. They are useful for managing batches of jobs, so most commonly a component
        //    can queue all of its jobs to jobset, and dispose it when shutdown. Jobsets can be children of other jobsets, which
        //    can be useful for recursive cancellation.
        //
        //        JobSets can also have an order. The order will be used as a tiebreaker when jobs are queued at the same priority
        //    to different jobsets. This can be useful for avoiding haphazard UI updates (popcorn), and for re-ordering async activity
        //    in response to layout changes. Order is evaluated top down: differences near the top of the tree dominate differences lower
        //    in the tree.
        //        Example: in the Address Book, the jobsets associated with sections of the view (Upsell, Social, Favorites, All) are ordered
        //    by position: 1,2,3,4. The Favorites and All sections have many child jobsets for individual grid elements, ordered by our preference
        //    for grid population (top to bottom, left to right). The Favorites and All sections are free to use whatever values they like for
        //    ordering their child jobsets, as those differences are only meaningful for comparing jobs within those sections. When comparing across
        //    sections, the order of those section jobsets that will override any lower-level differences.
        //
        //        And JobSets can have a visibility, which is a representation of whether the jobs queued to a jobset represent on-screen UI or
        //    off-screen UI. Of course not all jobs manage UI, in which case visibility is uninteresting. But invisible jobs above BasePriority.belowNormal are
        //    treated as if they run at BasePriority.belowNormal (their relative priority and order still work as normal).  This values creating a complete UI
        //    over building partial off-screen UI.  When the user is actively scrolling, this may be the wrong choice, and that behavior can be temporarily
        //    overridden (see Scheduler management below).
        //        Example: using the same example as above, we know that the section are ordered by their position. However, if the Favorites section is
        //    scrolled out of view, its jobset's visibility will be set to false and all of its jobs will run after the All section, whose jobset's visibility is
        //    set to true. Within the All section, individual child jobsets for off-screen items have their visibility set to false, so the currently viewed items
        //    are rendered first.
        //
        createJobSet: function (parentJobSet, order) {
            ///<summary>Creates a jobset for running operations</summary>
            ///<param name="parentJobSet" type="JobSet" optional="true"/>
            ///<param name="order" type="Number" optional="true"/>
            ///<returns type="JobSet"/>
            Debug.assert(Jx.isNullOrUndefined(parentJobSet) || this.isValidJobSet(parentJobSet), "Invalid parameter: parentJobSet");
            return new JobSet(this, parentJobSet || this._rootJobSet, order);
        },

        //    Scheduler management
        //
        //       In most cases, the point of doing work async is to avoid blocking Trident's main thread from doing layout and painting, which
        //    would create an unresponsive UI when events are handled in Javascript, and visual glitches when using DManip to scroll or zoom past
        //    the boundaries of the pre-rendered area. However, in some cases this is pointless: when the UI is hidden behind a splash screen or
        //    about to undergo a transition animation, there is no possibility of user interaction. In these cases, timeslicing work and letting
        //    Trident layout and paint is a detriment to performance. The scheduler can be told to run synchronously in these cases, and will drain
        //    all current and newly queued jobs until all jobs at or above the specified priority have been executed.
        //
        //       In this mode, the behavior of prioritizing high priority invisible jobs over visible ones makes little sense. The goal of that
        //    sequence is to improve responsiveness, which is a non-goal in this case: the goal is to present a responsive UI as quickly as possible
        //    (and often to begin an animation which can run simultaneously to the invisible off-screen work). So when running synchronously, invisible
        //    jobs are not run at all.
        //
        //       Running synchronously may not be possible in all cases. And when starting an app, or transitioning to a new view, we may want to present
        //    an incomplete UI: a low-fidelity version. However, it may still be desirable to prevent off-screen work until a higher fidelity initial view
        //    can be presented. Applications are able to define points at which they value low-priority visible work over high-priority invisible work by
        //    putting the scheduler into a mode where it will only run visible jobs. As with running synchronously, this mode expires when all visible jobs
        //    at or above the specified priority are completed.
        //
        setTimeSlice: function (timeSlice) {
            /// <summary>Adjusts the default timeslice: the amount of time the scheduler will run before yielding</summary>
            Debug.assert(Jx.isNullOrUndefined(timeSlice) || (Jx.isValidNumber(timeSlice) && timeSlice >= 0), "Invalid parameter: timeSlice");
            this._timeSlice = timeSlice;
            _mark("setTimeSlice - set to " + this._timeSlice);
        },

        yield: function () {
            /// <summary>Causes the scheduler to reschedule after completing the current job, yielding the remainder of its timeslice.
            /// This will also break out of a call to runSynchronous.</summary>
            Debug.assert(this._inWinJSCallback);
            this._shouldYield = true;
            _mark("yield");
        },

        pause: function () {
            /// <summary>Prevents the scheduler from executing further jobs until resume is called.</summary>
            if (!this._isPaused) {
                this._isPaused = true;
                _markAsyncStart("paused");
            }
        },

        resume: function () {
            /// <summary>Resumes normal execution after a call to pause</summary>
            if (this._isPaused) {
                _markAsyncStop("paused");
                this._isPaused = false;
                if (this._hasJobs() && !this._winjsJob && !this._inWinJSCallback) {
                    this._schedule();
                }
            }
        },

        runSynchronous: function (pri, time) {
            ///<summary>Immediately and synchronously runs all jobs in the scheduler.  It stops when it has consumed all jobs above the specified priority and the
            /// specified amount of time has elapsed.  It can be halted prematurely by calling yield.</summary>
            Debug.assert(Jx.isNullOrUndefined(pri) || this.isValidPriority(pri), "Invalid parameter: pri");
            Debug.assert(Jx.isNullOrUndefined(time) || Jx.isNumber(time), "Invalid parameter: time");
            _markStart("runSynchronous");

            if (this._hasJobs()) {
                var wasInWinJSCallback = this._inWinJSCallback;
                this._inWinJSCallback = true;   // Pretend that we're in a WinJS callback
                this._runJobs(pri ? pri._value : -1, time || 0);
                this._inWinJSCallback = wasInWinJSCallback;
            }
            this._postSynchronousCleanup();
            _markStop("runSynchronous");
        },

        prioritizeInvisible: function () {
            if (this._prioritizingInvisible) {
                this._clearTimeout(this._prioritizingInvisible);
            } else {
                _markAsyncStart("prioritizeInvisible");
                this._computeTopPriority();
            }
            this._prioritizingInvisible = this._schedulePriorityRevert();
        },

        dispose: function () {
            /// <summary>Disposes the scheduler, preventing it from running any further jobs.</summary>
            Jx.dispose(this._rootJobSet);
        },

        
        testClear: function () {
            this._rootJobSet.cancelJobs();
        },

        testFlush: function () {
            ///<summary>Immediately and synchronously runs all pending jobs queued to the scheduler, for
            ///basic timing control in unit tests.</summary>
            Debug.assert(!this._inWinJSCallback);
            if (this._hasJobs()) {
                this._inWinJSCallback = true;   // Pretend that we're in a WinJS callback
                this._runJobs(this._buckets.length, 0 /* no timeslice */);
                this._inWinJSCallback = false;
            }
            this._postSynchronousCleanup();
        },

        testOverrideTiming: function (timing) {
            ///<summary>Overrides WinJS.Scheduler, setTimeout and Date.now for advanced timing control in unit tests.</summary>
            this._winjsScheduleFunction = timing.winjsSchedule;
            this._schedulePriorityRevert = timing.setTimeout.bind(timing, this._stopPrioritizingInvisible.bind(this), 200);
            this._clearTimeout = timing.clearTimeout.bind(timing);
            this._getTime = timing.getTime.bind(timing);
        },
        

        
        isValidPriority: function (pri) {
            return this._basePriorities.some(function (basePriority) {
                return basePriority.definitions.indexOf(pri) !== -1;
            });
        },

        isValidJobSet: function (jobSet, /*@optional*/parent) {
            parent = parent || this._rootJobSet;

            if (jobSet === parent) {
                return true;
            }

            return parent._childJobSets.some(function (child) {
                return this.isValidJobSet(jobSet, child);
            }, this);
        },
        

        _schedule: function () {
            ///<summary>Schedules the execution of _scheduledCallback</summary>
            if (!this._winjsJob && !this._isPaused) {
                Debug.assert(this._hasJobs());
                var winjsPriority = this._getTopWinJSPriority();
                if (Jx.isValidNumber(winjsPriority)) {
                    _mark("winjsPriority=" + winjsPriority);

                    var winjsScheduleFunction = this._winjsScheduleFunction;
                    if (!winjsScheduleFunction) {
                        winjsScheduleFunction = this._winjsScheduleFunction = WinJS.Utilities.Scheduler.schedule;
                    }
                    _markAsyncStart("waitingForWinJSCallback");
                    this._winjsJob = winjsScheduleFunction(this._scheduledCallback, winjsPriority, this, "Jx.scheduler callback");
                }
            }
        },

        _computeTopPriority: function () {
            var buckets = this._buckets;
            for (var i = 0, len = buckets.length; i < len; ++i) {
                // It is possible this is wrong because everything in the bucket could be invisible
                // and/or cancelled. But the worst case is that we queue a job at too high a priority.
                if (buckets[i].length > 0) {
                    _mark("_computeTopPriority: " + i);
                    this._topPriority = i;
                    return;
                }
            }
            _mark("_computeTopPriority-len: " + len);
            this._topPriority = len;
        },

        _getTopWinJSPriority: function () {
            this._computeTopPriority();
            var basePriorities = this._basePriorities,
                topPriority = this._topPriority;
            for (var ii = 0, iiMax = basePriorities.length; ii < iiMax; ii++) {
                if (topPriority <= basePriorities[ii].maxValue) {
                    if (this._hasVisibleJobs || this._prioritizingInvisible) {
                        return WinJSPriorityMapping[ii];
                    }
                    return WinJSPriorityMapping[Math.max(ii, visibilityThreshold)];
                }
            }
            return null;
        },

        _invalidate: function () {
            ///<summary>Invalidates all buckets in the scheduler, based on an order or visibility change</summary>
            this._currentValidityToken++;
        },

        _validateBucket: function (bucket) {
            ///<summary>Prunes canceled jobs from the given bucket, and sorts it according to order and visibility</summary>
            ///<param name="bucket" type="Array"/>
            Debug.assert(Array.isArray(bucket), "Invalid argument: bucket");

            // Swap all of the canceled jobs to the end of the array
            var len = bucket.length;
            var lastGood = len - 1;
            for (var i = 0; i <= lastGood; ++i) {
                var temp = bucket[i];
                if (temp._cancel.isCanceled) {
                    bucket[i] = bucket[lastGood];
                    bucket[lastGood] = temp;
                    i--;
                    lastGood--;
                }
            }
            // And then splice all the canceled jobs off
            if (lastGood + 1 < len) {
                bucket.splice(lastGood + 1, len - lastGood - 1);
            }

            // Recalculate jobset visibility, if it has become invalid
            this._validateVisibility();

            // Sort the remaining jobs by visibility and order
            bucket.sort(compareJobs);

            bucket.validityToken = this._currentValidityToken;
        },

        _validateVisibility: function () {
            if (this._visibilityValidityToken !== this._currentValidityToken) {
                this._computeVisibility(this._rootJobSet, true);
                this._visibilityValidityToken = this._currentValidityToken;
            }
        },

        _computeVisibility: function (jobSet, parentVisibility) {
            /// <summary>Recurses the jobset tree, updating the isVisible property</summary>
            /// <param name="jobSet" type="JobSet"/>
            /// <param name="parentVisibility" type="Boolean"/>
            var wasVisible = jobSet._isVisible;
            var isVisible = jobSet._isVisible = parentVisibility && jobSet._localVisibility;

            if (isVisible && !wasVisible && jobSet._pendingJobs !== 0 && !this._hasVisibleJobs) {
                // We are currently running invisible jobs.  But this jobset became visible and has jobs in the scheduler, we may need
                // to run them instead.
                this._hasVisibleJobs = true;
                if (!this._prioritizingInvisible) {
                    this._computeTopPriority();
                }
            }

            var childJobSets = jobSet._childJobSets;
            for (var i = 0, len = childJobSets.length; i < len; ++i) {
                this._computeVisibility(childJobSets[i], isVisible);
            }
        },

        _scheduledCallback: function (jobInfo) {
            ///<summary>This is the scheduler's timeslice. It will run jobs and re-queue itself as needed.</summary>
            _markAsyncStop("waitingForWinJSCallback");
            Debug.assert(this._winjsJob);
            Debug.assert(this._winjsJob === jobInfo.job);
            this._winjsJob = null;

            Debug.assert(!this._inWinJSCallback);
            this._inWinJSCallback = true;
            if (!this._isPaused) {
                var reschedule = true;
                try {
                    reschedule = this._runJobs(-1 /*async*/, this._timeSlice || defaultTimeSlice);
                } finally {
                    Debug.assert(reschedule === this._hasJobs());
                    if (reschedule) {
                        this._schedule();
                    } else {
                        _markAsyncStop("pending");
                    }
                }
            }
            Debug.assert(this._inWinJSCallback);
            this._inWinJSCallback = false;
        },

        _runJobs: function (synchronousPriority, timeSlice) {
            ///<summary>The core job execution function</summary>
            ///<returns type="Boolean">True if there are more jobs left to run</returns>
            if (!this._hasJobs()) {
                Debug.assert(this.testGetJobCount() === 0);
                return false;
            }

            _markStart("_runJobs");
            _mark("_runJobs:synchronousPriority=" + synchronousPriority + " timeSlice=" + timeSlice);
            this._shouldYield = false;
            var start = this._getTime();
            var buckets = this._buckets;
            var runningPriority = this._topPriority;
            var bucket = buckets[runningPriority];
            do {
                Debug.assert(bucket === buckets[runningPriority]);

                // Make sure the current bucket is valid (sorted)
                var currentValidityToken = this._currentValidityToken;
                if (bucket.validityToken !== currentValidityToken) {
                    this._validateBucket(bucket);
                }

                // Grab and execute the best item in the bucket
                var job = bucket.pop();
                if (job && !job._jobSet._isVisible && this._hasVisibleJobs && !this._prioritizingInvisible) {
                    // This job is invisible, and we have visible jobs.  Put it back and move on for now.
                    bucket.push(job);
                    job = null;
                }
                if (job) {
                    if (!job._cancel.isCanceled) {

                        var finished = job.runIteration();
                        Debug.assert(Jx.isBoolean(finished));

                        if (!finished) {
                            bucket.push(job);
                            bucket.validityToken = Math.min(bucket.validityToken, currentValidityToken);
                            this._topPriority = Math.min(this._topPriority, runningPriority);
                            _mark("_runJobs:!finished _topPriority=" + this._topPriority);
                            this._hasVisibleJobs |= job._jobSet.visible;
                        }

                        // A job might have been queued at a higher priority. Check.
                        var topPriority = this._topPriority;
                        if (topPriority !== runningPriority) {
                            // The last job might have called runSynchronous and run all our jobs.
                            if (!this._hasJobs()) {
                                _markStop("_runJobs");
                                return false;
                            }
                            runningPriority = topPriority;
                            bucket = buckets[topPriority];
                        }
                    }
                } else {
                    // We are out of jobs in this bucket. Move down to the next bucket.
                    this._topPriority = ++runningPriority;
                    Debug.only(_mark("_runJobs:!job _topPriority=" + this._topPriority));
                    if (runningPriority >= this._basePriorities[visibilityThreshold].minValue && this._hasVisibleJobs) {
                        // We have drained the visible jobs, and should move on to invisible ones
                        this._hasVisibleJobs = false;
                        if (!this._prioritizingInvisible) {
                            this._computeTopPriority();
                            runningPriority = this._topPriority;
                        }
                    }
                    if (runningPriority === this._buckets.length) {
                        // The queue is cleared, and we are idle.
                        _markStop("_runJobs");
                        Debug.assert(!this._hasJobs());
                        return false;
                    }
                    bucket = buckets[runningPriority];
                }
            } while (((runningPriority <= synchronousPriority) || // Keep running jobs if they should be run synchronously
                     (this._getTime() - start < timeSlice)) && // Or if we have not yet exhausted our time-slice
                     !this._shouldYield && !this._isPaused); // And we haven't been asked to yield or pause.
            _markStop("_runJobs");
            Debug.assert(this._hasJobs());
            return true;
        },

        _runJobSetSynchronously: function (jobSet) {
            var found,
                buckets = this._buckets;
            do {
                found = false;
                for (var i = 0, len = buckets.length; i < len && !found; i++) {
                    var bucket = buckets[i];
                    for (var j = 0, jLen = bucket.length; j < jLen && !found; j++) {
                        var job = bucket[j];
                        if (job._jobSet === jobSet) {
                            bucket.splice(j, 1);
                            while (!job.runIteration()) {}
                            found = true;
                        }
                    }
                }
            } while (found);
            this._postSynchronousCleanup();
        },

        _validatePendingPriority: function () {
            if (this._winjsJob) {
                var topWinJSPriority = this._getTopWinJSPriority();
                if (topWinJSPriority !== this._winjsJob.priority) {
                    this._cancelPendingJob();
                    if (topWinJSPriority !== null) {
                        this._schedule();
                    }
                }
            }
        },

        _cancelPendingJob: function () {
            _markAsyncStop("waitingForWinJSCallback");
            this._winjsJob.cancel();
            this._winjsJob = null;
        },

        _postSynchronousCleanup: function () {
            if (this._winjsJob) {
                if (!this._hasJobs()) {
                    Debug.assert(this.testGetJobCount() === 0);
                    this._cancelPendingJob();
                    _markAsyncStop("pending");
                } else {
                    this._validatePendingPriority();
                }
            }
        },

        _stopPrioritizingInvisible: function () {
            Debug.assert(this._prioritizingInvisible);
            _markAsyncStop("prioritizeInvisible");
            this._prioritizingInvisible = 0;
        },

        /*jshint laxcomma:true*/
        _hasJobs: function() {
            return this._topPriority !== this._buckets.length;
        }

        
        , testGetJobCount: function () {
            var count = 0;
            for (var i = 0, len = this._buckets.length; i < len; i++) {
                count += this._buckets[i].length;
            }
            return count;
        },
        /*jshint laxcomma:false*/
        testHasAnyRealWork: function () {
            for (var i = 0, len = this._buckets.length; i < len; i++) {
                var bucket = this._buckets[i];
                for (var j = 0, jLen = bucket.length; j < jLen; j++) {
                    var job = bucket[j];
                    if (!job._cancel.isCanceled) {
                        return true;
                    }
                }
            }
            return false;
        },
        get _priorityMapping() {
            return WinJSPriorityMapping;
        }
        
    };

    function JobSet(scheduler, parentJobSet, order) {
        ///<param name="scheduler" type="Scheduler"/>
        ///<param name="parentJobSet" type="JobSet" optional="true"/>
        ///<param name="order" type="Number" optional="true"/>
        this._scheduler = scheduler;
        this._parentJobSet = parentJobSet;
        this._childJobSets = [];
        this._cancel = { isCanceled: false };
        this._order = order || 0;
        this._localVisibility = true;
        this._isVisible = true;
        this._pendingJobs = 0;
        this._timers = [];
        if (parentJobSet) {
            this._depth = parentJobSet._depth + 1;
            parentJobSet._childJobSets.push(this);
        } else {
            this._depth = 0;
        }
        Debug.setObjectName(this, "");
        Debug.only(Object.seal(this));
    }
    JobSet.prototype = {
        cancelJobs: function () {
            ///<summary>Cancels all outstanding jobs in this JobSet and its children</summary>
            if (this._pendingJobs) {
                this._pendingJobs = 0;
                if (!this._cancel.isCanceled) {
                    this._cancel.isCanceled = true; // Existing jobs have a reference to this JobState
                    this._cancel = { isCanceled: false }; // New jobs will get a reference to this one
                }
            }
            if (this._childJobSets.length) {
                this._childJobSets.forEach(function (child) { child.cancelJobs(); });
            }
            if (this._timers.length) {
                // clone the timer list because completeTimer changes the array
                var timers = this._timers.slice(0);
                timers.forEach(this.completeTimer, this);
            }
        },
        dispose: function () {
            /// <summary>Disposes a jobset. All jobs in a disposed jobset and its children are cancelled, and can have
            /// no new jobs queued.</summary>
            var parentJobSet = this._parentJobSet;
            if (parentJobSet) {
                var siblings = parentJobSet._childJobSets;
                var index = siblings.indexOf(this);
                Debug.assert(index !== -1, "Jobset not found among its parent's children");
                if (index !== -1) {
                    siblings.splice(index, 1);
                }
            }

            this._disposeInternal();
        },
        runSynchronous: function () {
            Debug.assert(this._childJobSets.length === 0, "This doesn't run child jobset jobs.");
            _markStart("JobSet.runSynchronous");
            this._scheduler._runJobSetSynchronously(this);
            _markStop("JobSet.runSynchronous");
        },
        addTimer: function (timer) {
            Debug.assert(Jx.isInstanceOf(timer, Jx.Timer));
            this._timers.push(timer);
        },
        completeTimer: function (timer) {
            Debug.assert(Jx.isInstanceOf(timer, Jx.Timer));
            var timers = this._timers;
            var index = timers.indexOf(timer);
            Debug.assert(index !== -1, "Timer not found among its Job set's timer");
            timers.splice(index, 1);
            Jx.dispose(timer);
        },
        set order(order) {
            ///<summary>Sets an order on this JobSet. That number will be compared to this jobset's siblings to inform
            /// prioritization. Lower values are scheduled before higher values.</summary>
            ///<param name="order" type="Number"/>
            Debug.assert(Jx.isValidNumber(order) && order >= 0, "Invalid parameter: order");
            Debug.assert(this._scheduler, "Method called on disposed jobset " + Debug.getObjectName(this));

            if (this._order !== order) {
                this._order = order;
                if (this._pendingJobs || this._childJobSets.length) {
                    this._scheduler._invalidate();
                }
            }
        },
        set visible(isVisible) {
            ///<summary>Notes whether the jobs queued to this JobSet are for UX items that are currently visible.
            /// This visibility information will be used to inform prioritization.</summary>
            ///<param name="isVisible" type="Boolean">Specifies the desired value</param>
            Debug.assert(Jx.isBoolean(isVisible), "Invalid parameter: isVisible");
            Debug.assert(this._scheduler, "Method called on disposed jobset " + Debug.getObjectName(this));

            if (this._localVisibility !== isVisible) {
                this._localVisibility = isVisible;
                if (this._parentJobSet._isVisible) { // If our parent isn't visible, the child's visibility doesn't matter.
                    this._isVisible = isVisible;
                    if (this._pendingJobs || this._childJobSets.length) {
                        // If we have jobs, the need to be resorted. And if we have children, they need their visibility
                        // updated. It's common for many nodes to change visibility at once based on scrolling / navigation.
                        // So we don't want to thrash re-computing, instead we'll just mark the whole world invalid, and correct
                        // it lazily.
                        this._scheduler._invalidate();
                    }
                }
            }
        },
        get visible() {
            ///<summary>Returns the computed visibility of a jobset.</summary>
            ///<returns type="Boolean">True if this jobset and all of its parents are visible.</returns>
            Debug.assert(this._scheduler, "Method called on disposed jobset " + Debug.getObjectName(this));
            this._scheduler._validateVisibility();
            return this._isVisible;
        },
        _disposeInternal: function () {
            /// <summary>The public dispose method must remove the disposed jobset from its parent. This internal method
            /// is for tearing down full sub-trees, which can be done more simply</summary>
            /// <param name="jobSet" type="JobSet"/>
            this._scheduler = null;
            this._parentJobSet = null;
            this._cancel.isCanceled = true;
            this._childJobSets.forEach(function (child) { child._disposeInternal(); });
            if (this._timers.length) {
                // clone the timer list because completeTimer changes the array
                var timers = this._timers.slice(0);
                timers.forEach(this.completeTimer, this);
            }
        }
    };

    function disposeJob() {
        ///<summary>Cancels an individual job</summary>
        if (!this._cancel.isCanceled) {
            this._cancel = canceledJobState;
            --this._jobSet._pendingJobs;
        }
    }

    function runJobIteration() {
        var finished = true;
        if (!this._cancel.isCanceled) {
            var loggedString = "_runJob:counter=" + this._counter + " job=" + this._description;
            _markStart(loggedString);
            var result = this._function.apply(this._context, this._arguments);
            _markStop(loggedString);
            // Even if a job says it wants to repeat, if it has been cancelled, it is finished.
            finished = (result !== repeatToken) || this._cancel.isCanceled;
        }
        if (finished) {
            this.dispose();
        }
        return finished; // returns whether we finished/disposed the job
    }

    function runJobCompletely() {
        while (!this.runIteration()) {}
    }

    function compareJobs(jobA, jobB) {
        ///<summary>Compares two jobs, to determine which should run first.</summary>
        ///<param name="jobA" type="Job"/>
        ///<param name="jobB" type="Job"/>
        ///<returns type="Number">A positive number if jobA should run before jobB</returns>
        var jobSetA = jobA._jobSet;
        var jobSetB = jobB._jobSet;

        var isAVisible = jobSetA._isVisible;
        var isBVisible = jobSetB._isVisible;
        if (isAVisible !== isBVisible) {
            return isAVisible ? 1 : -1;
        }

        while (jobSetA._parentJobSet !== jobSetB._parentJobSet) {
            if (jobSetA._depth === jobSetB._depth) {
                jobSetA = jobSetA._parentJobSet;
                jobSetB = jobSetB._parentJobSet;
            } else if (jobSetA._depth > jobSetB._depth) {
                jobSetA = jobSetA._parentJobSet;
            } else {
                jobSetB = jobSetB._parentJobSet;
            }
        }

        return (jobSetB._order - jobSetA._order) ||
               (jobB._counter - jobA._counter);
    }

    Jx.ScheduledQueue = /*@constructor*/ function (parentJobSet, pri, description, functions, context) {
        ///<param name="parentJobSet" type="JobSet"/>
        ///<param name="pri" type="Number">The priority of all jobs in the queue</param>
        ///<param name="description" type="String"/>
        ///<param name="functions" type="Array">Array of functions that make up the work to be done</param>
        ///<param name="context" optional="true">The 'this' context for the callback</param>
        Debug.assert(Jx.scheduler.isValidPriority(pri));
        Debug.assert(Jx.isArray(functions));
        Debug.assert(Jx.isNullOrUndefined(context) || Jx.isObject(context), "Invalid parameter: context");
        Debug.assert(Jx.isNullOrUndefined(description) || Jx.isString(description), "Invalid parameter: description");

        description = description || ("ScheduledQueue for " + pri._description);
        this._jobSet = Jx.scheduler.createJobSet(parentJobSet);
        for (var i = 0; i < functions.length; i++) {
            Debug.assert(Jx.isFunction(functions[i]));
            Jx.scheduler.addJob(this._jobSet, pri, (description + " - stage: " + i), functions[i], context);
        }
    };

    Jx.ScheduledQueue.prototype = {
        runSynchronous: function () {
            this._jobSet.runSynchronous();
            this.dispose();
        },
        dispose: function () {
            Jx.dispose(this._jobSet);
        },
        get jobSet() {
            return this._jobSet;
        }
    };


    function _mark(s) { Jx.mark("Jx.Scheduler." + s); }
    function _markStart(s) { Jx.mark("Jx.Scheduler." + s + ",StartTA,Jx,Scheduler"); }
    function _markStop(s) { Jx.mark("Jx.Scheduler." + s + ",StopTA,Jx,Scheduler"); }
    function _markAsyncStart(s) { Jx.mark("Jx.Scheduler:" + s + ",StartTM,Jx,Scheduler"); }
    function _markAsyncStop(s) { Jx.mark("Jx.Scheduler:" + s + ",StopTM,Jx,Scheduler"); }

    Jx.scheduler = new Jx.Scheduler();
});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,MSApp,Debug */
Jx.delayDefine(Jx, ["GlomManager", "initGlomManager"], function () {
    // Global glomManager.  Will be a Jx.ParentGlomManager in the main window, and Jx.ChildGlomManager in all other windows.
    Jx.glomManager = null;

    // initializes Jx.glomManager
    Jx.initGlomManager = function () {
        if (MSApp.getViewOpener()) {
            Jx.glomManager = new Jx.ChildGlomManager();
        } else {
            Jx.glomManager = new Jx.ParentGlomManager();
        }
        Jx.initGlomManager = function () { Debug.assert(false, "Why are you calling Jx.initGlomManager twice?"); };
    };

    // Types and values common to both parentGlomManager and childGlomManagers.
    Jx.GlomManager = {
        // GlomID of the main window Glom.
        ParentGlomId: "parentGlom",
        Events: {
            // Parent GlomManager Events
            glomClosed: "glomClosed",
            glomCreated: "glomCreated",
            glomShowing: "glomShowing",

            // Child GlomManager Events
            resetGlom: "resetGlom",
            glomConsolidated: "glomConsolidated",
            startingContext: "startingContext"
        },
        InternalEvents: {
            // Internal GlomManager Events
            createOrShowGlom: "createOrShowGlom",
            glomConsolidated: "glomConsolidated",
            glomUnloaded: "glomUnloaded",
            glomIdChanged: "glomIdChanged"
        },
        ShowType: {
            // Attempt to share the screen with the current Glom (50/50)
            shareScreen: "shareScreen",

            // Show the new Glom in place of the current Glom
            // And close the current Glom. (DOES NOT go to backstack)
            showAndCloseThis: "showAndCloseThis",

            // Change focus to the target glom.  This may or may not cause
            // the current glom to go to back stack depending if the target glom
            // is already visible.
            switchTo: "switchTo",

            // Do not show new Glom.  Glom will enter "Done" state
            // without being shown on screen.  Gloms created in this way
            // can never "fall" off the backstack, and therefore will never
            // automatically be cleaned up.  User must specifically close
            // this Glom as needed.
            doNotShow: "doNotShow"
        }
    };


});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Debug,Jx,Windows,window,MSApp*/

Jx.delayDefine(Jx, "ParentGlomManager", function () {
    function _markStart(s) { Jx.mark("Jx.ParentGlomManager." + s + ",StartTA,Jx,ParentGlomManager"); }
    function _markStop(s) { Jx.mark("Jx.ParentGlomManager." + s + ",StopTA,Jx,ParentGlomManager"); }
    function _markInfo(s) { Jx.mark("Jx.ParentGlomManager." + s + ",Info,Jx,ParentGlomManager"); }

    var GlomManager = Jx.GlomManager;
    var Events = Jx.GlomManager.Events;
    var InternalEvents = Jx.GlomManager.InternalEvents;

    /// Constructor for ParentGlomManager.  Should only be called by Jx.initGlomManager() and unit tests.
    var ParentGlomManager = Jx.ParentGlomManager = function () {
        this._childGloms = {}; // Map of open gloms.
        this._resettingGloms = {}; // Map of gloms that are resetting
        this._readyGloms = []; // Stack of gloms ready for reuse.
        this._view = Windows.UI.ViewManagement.ApplicationView.getForCurrentView(); // This glom's view object.
        this._postMessageListener = this._postMessageListener.bind(this); // handler for window message event
        window.addEventListener("message", this._postMessageListener);
        this._cacheSettings = null; // Settings object for enableGlomCache
        this._checkForEmptyCache = this._checkForEmptyCache.bind(this);
        this._cacheCheckJob = null; // Jx.Scheduler job
        this._cacheJobPriority = Jx.scheduler.definePriorities({ parentGlomManagerCheckCache: { base: Jx.Scheduler.BasePriority.idle } });

        this._msgHandlers = {};
        this._msgHandlers[InternalEvents.createOrShowGlom] = this._handleCreateOrShowGlom.bind(this);
        this._msgHandlers[InternalEvents.glomUnloaded] = this._handleGlomUnloaded.bind(this);
        this._msgHandlers[Events.resetGlom] = this._handleResetGlom.bind(this);
        this._msgHandlers[InternalEvents.glomConsolidated] = this._handleGlomConsolidated.bind(this);
        this._msgHandlers[InternalEvents.glomIdChanged] = this._handleGlomIdChanged.bind(this);
    };

    Jx.mix(ParentGlomManager.prototype, Jx.Events);
    Debug.Events.define.apply(Debug.Events, [Jx.ParentGlomManager.prototype].concat(Object.keys(Jx.GlomManager.Events)));
    Debug.Events.define.apply(Debug.Events, [Jx.ParentGlomManager.prototype].concat(Object.keys(Jx.GlomManager.InternalEvents)));

    var proto = ParentGlomManager.prototype;
    proto.dispose = function () {
        // Disposing the parentGlomManager closes all child gloms.
        if (this._cacheCheckJob) {
            this._cacheCheckJob.dispose();
        }
        var glom;
        for (glom in this._childGloms) {
            var glomToClose = this._childGloms[glom];
            this._glomClosed(glomToClose);
            glomToClose.dispose();
            delete this._childGloms[glom];
        }
        for (glom in this._resettingGloms) {
            this._resettingGloms[glom].dispose();
            delete this._resettingGloms[glom];
        }
        for (glom in this._readyGloms) {
            this._readyGloms[glom].dispose();
        }
        this._readyGloms = [];
        window.removeEventListener("message", this._postMessageListener);
    };
    proto.getGlomId = function () {
        // The parent glom always has the same Id, and it can not change.
        return GlomManager.ParentGlomId;
    };
    proto.isGlomOpen = function (glomId) {
        Debug.assert(Jx.isNonEmptyString(glomId));
        // checks if a given glomId is currently open.  (Either on screen or in the backstack, or created without ever being shown)
        return !Jx.isNullOrUndefined(this._childGloms[glomId]);
    };
    proto.enableGlomCache = function (glomHRef, /*optional*/maxCacheSize) {
        Debug.assert(Jx.isNonEmptyString(glomHRef));
        Debug.assert(Jx.isNullOrUndefined(maxCacheSize) || (Jx.isNumber(maxCacheSize) && maxCacheSize > 0));
        // Configures
        Debug.assert(!this._cacheSettings, "Support for multiple caches not supported");
        this._cacheSettings = { URL: glomHRef, maxSize: maxCacheSize };

        if (!this._cacheCheckJob) {
            this._cacheCheckJob = Jx.scheduler.addJob(null, this._cacheJobPriority.parentGlomManagerCheckCache, "Jx.ParentGlomManager._checkForEmptyCache", this._checkForEmptyCache);
        }
    };
    proto.createGlom = function (glomId, /*@dynamic*/ startingContext, /*@type(String)*/ childGlomHRef) {
        Debug.assert(Jx.isNonEmptyString(glomId));
        Debug.assert(glomId !== GlomManager.ParentGlomId);
        Debug.assert(Jx.isNullOrUndefined(startingContext) || Jx.isNonEmptyString(JSON.stringify(startingContext)));
        Debug.assert(Jx.isNullOrUndefined(childGlomHRef) || Jx.isNonEmptyString(childGlomHRef));
        _markStart("createGlom");
        // Create a new glom object.
        // Use the cache if it isn't empty and it's the right URL.
        // Otherwise create from scratch.
        _markInfo("createGlom(" + glomId + " - " + (childGlomHRef ? childGlomHRef : "usingCache") + ")");
        Debug.only(_markInfo("createGlom starting context: " + JSON.stringify(startingContext)));
        Debug.assert(!this.isGlomOpen(glomId));
        var newGlom = null;
        Debug.assert(this._readyGloms.length === 0 || this._cacheSettings);
        if (this._readyGloms.length === 0 || (childGlomHRef && (childGlomHRef != this._cacheSettings.URL))) {
            if (!childGlomHRef) {
                Debug.assert(this._cacheSettings && Jx.isNonEmptyString(this._cacheSettings.URL));
                childGlomHRef = this._cacheSettings.URL;
            }
            _markStart("createGlom::CreateNewView");
            var newView = MSApp.createNewView(childGlomHRef);
            _markStop("createGlom::CreateNewView");
            newGlom = this._childGloms[glomId] = new Jx.Glom(newView, glomId, this.getGlomId, this._view.id, startingContext);
            _markInfo("New glom created " + glomId + " View ID:" + newGlom.getViewId());
        } else {
            newGlom = Jx.Glom.duplicateAndDispose(this._readyGloms.pop(), glomId, startingContext);
            this._childGloms[glomId] = newGlom;
            _markInfo("Glom popped off stack " + glomId + " View ID:" + newGlom.getViewId());
            if (this._readyGloms.length === 0) {
                if (!this._cacheCheckJob) {
                    this._cacheCheckJob = Jx.scheduler.addJob(null, this._cacheJobPriority.parentGlomManagerCheckCache, "Jx.ParentGlomManager._checkForEmptyCache", this._checkForEmptyCache);
                }
            }
        }
        newGlom.postMessage(Events.startingContext, startingContext);
        this.raiseEvent(Events.glomCreated, { glom: newGlom });
        _markStop("createGlom");
        return newGlom;
    };
    // Separating Debug.assert for unknown showEnum so it can be overwritten in unit test.
    proto._assertUnknownShowEnum = function (showEnum) {
        Debug.assert(false, "Jx.GlomManager Unrecognized showEnum:" + showEnum);
    };
    proto.showGlom = function (glomId, showEnum, /*optional*/anchorGlom) {
        Debug.assert(Jx.isNonEmptyString(glomId));
        Debug.assert(Jx.isNonEmptyString(showEnum));
        Debug.assert(Jx.isNullOrUndefined(anchorGlom) || Jx.isInstanceOf(anchorGlom, Jx.Glom));
        // Show the glom on screen, see Jx.GlomManager for description of different show choices.
        _markInfo("showGlom(" + glomId + ", " + showEnum + ", " + (anchorGlom ? anchorGlom.getGlomId() : "ParentGlom") + ")");
        var showingChildGlom = true;
        var targetViewId = null;
        if (glomId === GlomManager.ParentGlomId) {
            targetViewId = this._view.id;
            showingChildGlom = false;
        } else {
            Debug.assert(this._childGloms[glomId]);
            targetViewId = this._childGloms[glomId].getViewId();
        }
        var anchorViewId = anchorGlom ? anchorGlom.getViewId() : this._view.id;
        var viewManagement = Windows.UI.ViewManagement;
        var ShowType = GlomManager.ShowType;
        switch (showEnum) {
            case ShowType.shareScreen:
                _markStart("calling tryShowAsStandaloneAsync");
                var viewSizePreference = viewManagement.ViewSizePreference.default;
                viewManagement.ApplicationViewSwitcher.tryShowAsStandaloneAsync(targetViewId, viewSizePreference, anchorViewId, viewSizePreference).done(
                    function (viewShown) {
                        _markInfo("glomId: " + glomId + ", " + (viewShown ? "View Shown: " : "View NOT Shown: ") + "targetViewId:" + targetViewId);
                    },
                    function (error) {
                        if (!Jx.isNullOrUndefined(error) && Jx.isFunction(error.toString)) {
                            _markInfo(error.toString());
                        }
                        _markInfo("tryShowAsStandaloneAsync(shareScreen) Error.  glomId: " + glomId + ", targetViewId:" + targetViewId);
                    }
                 );
                _markStop("calling tryShowAsStandaloneAsync");
                break;
            case ShowType.showAndCloseThis:
                _markStart("calling switchAsync (consolidateViews)");
                viewManagement.ApplicationViewSwitcher.switchAsync(targetViewId, anchorViewId, viewManagement.ApplicationViewSwitchingOptions.consolidateViews).done(
                    function (worked) {
                        _markInfo(" showAndCloseThis: " + worked);
                    },
                    function (error) {
                        if (!Jx.isNullOrUndefined(error) && Jx.isFunction(error.toString)) {
                            _markInfo(error.toString());
                        }
                        _markInfo("switchAsync Error. glomId: " + glomId + ", targetViewId:" + targetViewId);
                    }
                );
                _markStop("calling switchAsync (consolidateViews)");
                break;
            case ShowType.switchTo:
                _markStart("calling switchAsync (default)");
                viewManagement.ApplicationViewSwitcher.switchAsync(targetViewId, anchorViewId, viewManagement.ApplicationViewSwitchingOptions.default).done(
                    function (worked) {
                        _markInfo(" switchTo: " + worked);
                    },
                    function (error) {
                        if (!Jx.isNullOrUndefined(error) && Jx.isFunction(error.toString)) {
                            _markInfo(error.toString());
                        }
                        _markInfo("switchAsync(switchTo) Error.  glomId: " + glomId + ", targetViewId:" + targetViewId);
                    }
                );
                _markStop("calling switchAsync (default)");
                break;
            case ShowType.doNotShow:
                _markInfo("Not showing glom");
                showingChildGlom = false;
                break;
            default:
                this._assertUnknownShowEnum(showEnum);
        }

        if (showingChildGlom) {
            this.raiseEvent(Events.glomShowing, { glom: this._childGloms[glomId] });
        }
    };
    proto.createOrShowGlom = function (glomId, startingContext, showEnum, /*optional*/ childGlomHRef, /*optional*/anchorGlom) {
        Debug.assert(Jx.isNonEmptyString(glomId));
        Debug.assert(Jx.isObject(startingContext));
        Debug.assert(Jx.isNonEmptyString(showEnum));
        Debug.assert(Jx.isNullOrUndefined(childGlomHRef) || Jx.isNonEmptyString(childGlomHRef));
        Debug.assert(Jx.isNullOrUndefined(anchorGlom) || Jx.isInstanceOf(anchorGlom, Jx.Glom));
        // If the glom doesn't exist, create it.
        // Then show it.
        if (!this.isGlomOpen(glomId) && glomId !== GlomManager.ParentGlomId) {
            this.createGlom(glomId, startingContext, childGlomHRef);
        }
        this.showGlom(glomId, showEnum, anchorGlom);
    };
    proto.getIsChild = function () {
        return false;
    };
    proto.getIsParent = function () {
        return true;
    };
    proto.connectToGlom = function (glomId) {
        Debug.assert(Jx.isNonEmptyString(glomId));
        return this._childGloms[glomId];
    };
    proto._checkForEmptyCache = function () {
        // If the cache is empty, populate it with at least one glom.
        // Even though this method is only queued when the cache is empty, a glom may have reset in between
        // so check again.
        this._cacheCheckJob = null;
        if (this._cacheSettings && this._cacheSettings.maxSize > 0 && this._readyGloms.length === 0) {
            _markStart("_checkForEmptyCache::CreateNewView");
            var newView = MSApp.createNewView(this._cacheSettings.URL);
            _markStop("_checkForEmptyCache::CreateNewView");
            this._readyGloms.push(new Jx.Glom(newView, "cachedGlom", this.getGlomId, this._view.id));
        }
    };
    proto._glomClosed = function (glom) {
        Debug.assert(Jx.isInstanceOf(glom, Jx.Glom));
        glom.raiseEvent(Jx.Glom.Events.closed);
        this.raiseEvent(Events.glomClosed, { glom: glom });
    };
    proto._handleCreateOrShowGlom = function (event) {
        Debug.assert(Jx.isObject(event));
        Debug.assert(Jx.isObject(event.data));
        var data = event.data;
        Debug.assert(Jx.isObject(data.message));
        Debug.assert(Jx.isNonEmptyString(data.fromGlomId));
        var fromGlomId = data.fromGlomId;
        if (this.isGlomOpen(fromGlomId)) {
            // Only open gloms can request createOrShow.  App termination can confuse this state.
            // A child glom is requesting a glom be created or shown on its behalf.
            _markInfo("Received CreateOrShowGlom from " + fromGlomId);
            var message = data.message;
            this.createOrShowGlom(message.glomId, message.startingContext, message.showEnum, message.childGlomHRef, this._childGloms[fromGlomId]);
        }
    };
    proto._handleGlomUnloaded = function (event) {
        Debug.assert(Jx.isObject(event));
        Debug.assert(Jx.isObject(event.data));
        var data = event.data;
        Debug.assert(Jx.isObject(data.message));
        Debug.assert(Jx.isNonEmptyString(data.fromGlomId));
        var fromGlomId = data.fromGlomId;
        // A child glom has unloaded.
        _markInfo("Received GlomUnloaded from " + fromGlomId);
        var glom = this._childGloms[fromGlomId];
        if (glom) {
            // If the glom was open, then process the close before disposing.
            this._glomClosed(glom);
            glom.dispose();
            delete this._childGloms[fromGlomId];
        } else if (this._resettingGloms[fromGlomId]) {
            delete this._resettingGloms[fromGlomId];
        } else {
            for (var i = 0, iMax = this._readyGloms.length; i < this._readyGloms; ++i) {
                if (this._readyGloms[i].getGlomId() === fromGlomId) {
                    this._readyGloms.splice(i, 1);
                    break;
                }
            }
            if (i === iMax) {
                // Beforeunload, child windows are told to close.
                // It is possible to receive the close messages after the main window has reloaded
                _markInfo("Received unload event from unknown glom");
            }
        }
    };
    proto._handleResetGlom = function (event) {
        Debug.assert(Jx.isObject(event));
        Debug.assert(Jx.isObject(event.data));
        var data = event.data;
        Debug.assert(Jx.isObject(data.message));
        Debug.assert(Jx.isNonEmptyString(data.fromGlomId));
        var fromGlomId = data.fromGlomId;
        Debug.assert(!this.isGlomOpen(fromGlomId));
        // A child glom was told to reset, and it sent this message as an acknowledgement.
        // It can now be reused.
        _markInfo("Received ResetGlom from " + fromGlomId);
        var glom = this._resettingGloms[fromGlomId];
        Debug.assert(glom, " Only resetting gloms should be sending ResetGlom event to the parent");
        this._readyGloms.push(glom);
        delete this._resettingGloms[fromGlomId];
    };
    proto._handleGlomConsolidated = function (event) {
        Debug.assert(Jx.isObject(event));
        Debug.assert(Jx.isObject(event.data));
        var data = event.data;
        Debug.assert(Jx.isObject(data.message));
        Debug.assert(Jx.isNonEmptyString(data.fromGlomId));
        var fromGlomId = data.fromGlomId;
        Debug.assert(this.isGlomOpen(fromGlomId));
        // A child glom has fallen off the backstack and is otherwise no longer available to the user.
        // attempt to reset the glom for reuse if our cache is not already full.
        _markInfo("Received GlomConsolidated from " + fromGlomId);
        var glom = this._childGloms[fromGlomId];
        Debug.assert(glom, " Jx.GlomManager it should not be possible for a glom to consolidate without being a child");
        this._glomClosed(glom);
        if (this._cacheSettings && this._cacheSettings.maxSize > this._readyGloms.length) {
            glom.postMessage(Events.resetGlom);
            _markInfo("Moving " + fromGlomId + " to resetting glom array ");
            this._resettingGloms[fromGlomId] = this._childGloms[fromGlomId];
            delete this._childGloms[fromGlomId];
        } else {
            glom.dispose();
        }
    };
    proto._handleGlomIdChanged = function (event) {
        Debug.assert(Jx.isObject(event));
        Debug.assert(Jx.isObject(event.data));
        var data = event.data;
        Debug.assert(Jx.isObject(data.message));
        var message = data.message;
        Debug.assert(Jx.isNonEmptyString(data.fromGlomId));
        var fromGlomId = data.fromGlomId;
        Debug.assert(this.isGlomOpen(fromGlomId));
        // A child glom has changed its Id.  It is effectively a new glom, so close the previous one and create a new one.
        // if the glomId it is changing to already exists, then last-in-wins and close the previous one.
        _markInfo("Received glomIdChanged from " + fromGlomId + " newId:" + data.newGlomId);
        Debug.assert(message.oldGlomId === fromGlomId, "Glom tried to change the ID of another glom");
        var glom = this._childGloms[fromGlomId];
        this._glomClosed(glom);
        delete this._childGloms[fromGlomId];
        var preExistingGlom = this._childGloms[message.newGlomId];
        if (preExistingGlom) {
            this._glomClosed(preExistingGlom);
            preExistingGlom.dispose();
        }
        var newGlom = Jx.Glom.duplicateAndDispose(glom, message.newGlomId, glom.getStartingContext());
        this._childGloms[message.newGlomId] = newGlom;
        this.raiseEvent(Events.glomCreated, { glom: newGlom });
    };
    proto._validViewId = function(glomId, viewId) {
        Debug.assert(Jx.isNonEmptyString(glomId));
        Debug.assert(Jx.isNumber(viewId));
        var returnValue = false;

        if (this._childGloms[glomId]) {
            returnValue = this._childGloms[glomId].getViewId() === viewId;
        } else if (this._resettingGloms[glomId]) {
            returnValue = this._resettingGloms[glomId].getViewId() === viewId;
        }
        if (!returnValue) {
            _markInfo("Received message from viewId:" + viewId + " and glomId:" + glomId + " but no matching glom found.");
        }
        return returnValue;
    };
    proto._postMessageListener = function (event) {
        Debug.assert(Jx.isObject(event));
        Debug.assert(Jx.isObject(event.data));
        var data = event.data;
        // window.onmessage handler.
        if (data.purpose === "Jx.GlomManager" && this._validViewId(data.fromGlomId, data.fromViewId)) {
            event.preventDefault();
            event.stopPropagation();
            Debug.assert(Jx.isNonEmptyString(data.messageType));
            var messageType = data.messageType;
            var handler = this._msgHandlers[messageType];
            if (handler) {
                handler(event);
            } else {
                Debug.assert(Jx.isNonEmptyString(data.fromGlomId));
                var fromGlomId = data.fromGlomId;
                _markInfo("Received CustomMsg " + messageType + " from " + fromGlomId);
                if (this.isGlomOpen(fromGlomId)) {
                    // If not a system message, assume the user is expecting it as a custom message type.
                    var glom = this._childGloms[fromGlomId];
                    glom.raiseEvent(messageType, data);
                } else {
                    // Custom messages are only accepted from open child gloms.
                    // Child gloms may have sent messages when they did not know they were closed.  But the
                    // Parent glom has already been notified of the child glom closing and will not be expecting the message
                    // So it can be dropped.
                    _markInfo("JxGlomManager Dropping message type:" + messageType + " from closed Glom:" + fromGlomId);
                }
            }
        }
    };

});


//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,MSApp,Debug,window,Windows,*/

Jx.delayDefine(Jx, "ChildGlomManager", function () {
    "use strict";

    function _markStart(s) { Jx.mark("Jx.ChildGlomManager." + s + ",StartTA,Jx,ChildGlomManager"); }
    function _markStop(s) { Jx.mark("Jx.ChildGlomManager." + s + ",StopTA,Jx,ChildGlomManager"); }
    function _markInfo(s) { Jx.mark("Jx.ChildGlomManager." + s + ",Info,Jx,ChildGlomManager"); }

    var GlomManager = Jx.GlomManager;
    var Events = GlomManager.Events;
    var InternalEvents = GlomManager.InternalEvents;
    /// Constructor for ChildGlomManager.  Should only be called by Jx.initGlomManager() and unit tests.
    var ChildGlomManager = Jx.ChildGlomManager = function () {
        _markStart("calling getViewOpener");
        this._opener = MSApp.getViewOpener();
        _markStop("calling getViewOpener");
        Debug.assert(this._opener);
        this._glomId = null;
        this._postMessageListener = this._postMessageListener.bind(this);
        window.addEventListener("message", this._postMessageListener, false);
        _markStart("calling getForCurrentView");
        this._view = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
        _markStop("calling getForCurrentView");
        this._parentGlom = new Jx.Glom(this._opener, GlomManager.ParentGlomId, this.getGlomId.bind(this), this._view.id);
        window.addEventListener("beforeunload", this._onBeforeUnload.bind(this), false);
        this._view.addEventListener("consolidated", this._onConsolidated.bind(this), false);
        this._isConsolidating = false;
        this._paused = false;
        this._pendingMessages = [];
    };
    Jx.mix(Jx.ChildGlomManager.prototype, Jx.Events);
    Debug.Events.define.apply(Debug.Events, [Jx.ChildGlomManager.prototype].concat(Object.keys(Jx.GlomManager.Events)));
    Debug.Events.define.apply(Debug.Events, [Jx.ChildGlomManager.prototype].concat(Object.keys(Jx.GlomManager.InternalEvents)));

    var proto = ChildGlomManager.prototype;
    proto.dispose = function () {
        _markInfo("disposed");
        window.close();
    };
    proto.getGlomId = function () {
        return this._glomId;
    };
    proto.getParentGlom = function () {
        return this._parentGlom;
    };
    proto.changeGlomId = function (newGlomId) {
        if (this._isConsolidating || !this._glomId) {
            _markInfo("changeGlomId skipped, glom is closing or is closed");
            return;
        }
        Debug.assert(Jx.isNonEmptyString(newGlomId));
        // Notify parentGlomManager of the id change and start behaving as the new glom.
        Debug.assert(this._glomId);
        this._parentGlom.postMessage(InternalEvents.glomIdChanged, { oldGlomId: this._glomId, newGlomId: newGlomId });
        _markInfo("Changing GlomID from: " + this._glomId + " to:" + newGlomId);
        this._glomId = newGlomId;
        Jx.setMarkPrefix(this._glomId+":");
    };
    proto.createOrShowGlom = function (glomId, startingContext, showEnum, /*optional*/ childGlomHRef) {
        Debug.assert(Jx.isNonEmptyString(glomId));
        Debug.assert(Jx.isObject(startingContext));
        Debug.assert(Jx.isNonEmptyString(showEnum));
        Debug.assert(Jx.isNullOrUndefined(childGlomHRef) || Jx.isNonEmptyString(childGlomHRef));
        // MSApp.CreateNewView can only be called by the main window.  Request parentGlomManager create or show new glom
        var msg = {
            glomId: glomId,
            startingContext: startingContext,
            showEnum: showEnum,
            childGlomHRef: childGlomHRef
        };
        this._parentGlom.postMessage(InternalEvents.createOrShowGlom, msg);
    };
    proto.getIsChild = function () {
        return true;
    };
    proto.getIsParent = function () {
        return false;
    };
    proto.changeGlomTitle = function (newTitle) {
        if (this._isConsolidating || !this._glomId) {
            _markInfo("changeGlomTitle skipped, glom is closing or is closed");
            return;
        }
        this._view.title = newTitle;
    };
    proto.consolidateComplete = function () {
        _markInfo("Consolidate complete");
        Debug.assert(this._isConsolidating);
        this._parentGlom.postMessage(InternalEvents.glomConsolidated);
    };
    proto._handleResetGlom = function () {
        // Parent glom has requested this glom reset for reuse.
        // If there is a reset handler, then comply.  
        // Otherwise close.
        _markInfo("Received ResetGlom");
        if (this.hasListener(Events.resetGlom)) {
            _markInfo("Glom reset called.  Calling Reset handlers");
            this.raiseEvent(Events.resetGlom);
            this._parentGlom.postMessage(Events.resetGlom);
            this._glomId = null;
            this._isConsolidating = false;
        } else {
            _markInfo("Glom reset called without a handler.  Closing window.");
            window.close();
        }
    };
    proto._handleStartingContext = function (data) {
        Debug.assert(Jx.isObject(data));
        Debug.assert(Jx.isNonEmptyString(data.targetGlomId));
        // Initial starting message received.  Handling of the starting context message is required
        // so assert and close if its dropped.
        _markInfo("Received StartingContext");
        this._glomId = data.targetGlomId;
        Jx.setMarkPrefix(this._glomId + ":");
        if (this.hasListener(Events.startingContext)) {
            _markInfo("Glom starting context called.  Calling context handlers");
            this.raiseEvent(Events.startingContext, data);
        } else {
            _markInfo("Child window may not have initialized completely before Dom loaded.  May be orphaned");
        }
        Debug.only(
            window.addEventListener("DOMContentLoaded", function () {
                Debug.assert(false, "Starting context arrived before DOMContentLoaded");
            }));
    };
    proto._postMessageListener = function (event) {
        Debug.assert(Jx.isObject(event));
        Debug.assert(Jx.isObject(event.data));
        var data = event.data;
        // window.onmessage handler.
        if (data.purpose === "Jx.GlomManager") {
            Debug.assert(data.fromGlomId === GlomManager.ParentGlomId, "Receiving messages from other than parent not supported");
            event.preventDefault();
            event.stopPropagation();
            this._handleMessage(data);
        }
    };
    proto._handleMessage = function (data) {
        Debug.assert(Jx.isObject(data));
        var messageType = data.messageType;
        if (this._paused) {
            _markInfo("_handleMessage: Message held for later: " + messageType);
            this._pendingMessages.push(data);
        } else {
            Debug.assert(Jx.isNonEmptyString(data.messageType));
            switch (messageType) {
                case Events.resetGlom:
                    this._handleResetGlom();
                    break;
                case Events.startingContext:
                    this._handleStartingContext(data);
                    break;
                default:
                    _markInfo("_handleMessage: Received Custom Msg " + messageType);
                    this._parentGlom.raiseEvent(messageType, data);
                    break;
            }
        }
    };
    proto.pauseMessages = function () {
        _markInfo("pauseMessages");
        Debug.assert(!this._paused);
        this._paused = true;
    };
    proto.resumeMessages = function () {
        _markStart("resumeMessages");
        Debug.assert(this._paused);
        this._paused = false;
        while (this._pendingMessages.length > 0 && !this._paused) {
            this._handleMessage(this._pendingMessages.shift())
        }
        _markStop("resumeMessages");
    };
    proto._onBeforeUnload = function () {
        // Window is being unloaded. Usually this means the window is closed.
        _markInfo("glom is unloading");
        this._parentGlom.postMessage(InternalEvents.glomUnloaded);
    };
    proto._onConsolidated = function () {
        // Glom has been consolidated, notify parentGlomManager.
        _markInfo("glom is consolidated");
        if (!this._isConsolidating) {
            this._isConsolidating = true;
            this.raiseEvent(Events.glomConsolidated);
        } else {
            // If two or more triggers to consolidate race, the consolidated event can be fired multiple times.
            // We should only attempt to handle one of them until we have been reset by the parent glom. 
            _markInfo("glom is already consolidating.  Skipping event.")
        }
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Debug */
Jx.delayDefine(Jx, "Glom", function () {
    function _markInfo(s) { Jx.mark("Jx.Glom." + s + ",Info,Jx,Glom"); }

    var Glom = Jx.Glom = function (postQueue, targetGlomId, getGlomIdFunction, fromViewId, /* optional */ startingContext) {
        Debug.assert(!Jx.isNullOrUndefined(postQueue));
        Debug.assert(Jx.isNonEmptyString(targetGlomId));
        Debug.assert(Jx.isFunction(getGlomIdFunction));
        Debug.assert(Jx.isNumber(fromViewId));
        this._postQueue = postQueue;
        this._targetViewId = this._postQueue.viewId;
        this._targetGlomId = targetGlomId;
        this._getGlomIdFunction = getGlomIdFunction;
        this._fromViewId = fromViewId;
        this._startingContext = startingContext || {};
    };

    Jx.mix(Jx.Glom.prototype, Jx.Events);

    Jx.Glom.Events = {
        closed: "closed"
    };
    Debug.Events.define.apply(Debug.Events, [Jx.Glom.prototype].concat(Object.keys(Jx.Glom.Events)));

    var proto = Glom.prototype;
    proto.dispose = function () {
        if (this._targetGlomId === Jx.GlomManager.ParentGlomId) {
            Jx.glomManager.dispose();
        } else {
            if (this._postQueue) {
                try {
                    this._postQueue.close();
                } catch (errorToIgnore) {
                    // close can throw (it shouldn't #236282), but we don't care because we are closing it.
                }
                this._postQueue = null;
            }
        }
        // Intentionally preserving this._targetViewId after dispose to allow glomUnloaded message to be handled when
        // the glom finishes closing.
    };

    proto.postMessage = function (messageType, /*optional*/message) {
        Debug.assert(Jx.isNonEmptyString(messageType));
        Debug.assert(Jx.isNullOrUndefined(message) || Jx.isNonEmptyString(JSON.stringify(message)));
        var msgObj = {
            fromGlomId: this._getGlomIdFunction(),
            targetGlomId: this._targetGlomId,
            message: message || {},
            messageType: messageType,
            purpose: "Jx.GlomManager",
            fromViewId: this._fromViewId
        };
        if (Jx.isNonEmptyString(msgObj.fromGlomId)) {
            _markInfo("Sending Messsage " + messageType + " from " + msgObj.fromGlomId + " to " + this._targetGlomId);
            // it is possible for messages to try to be sent after a glom has reset.
            // these should not be sent as there is nothing registered on the other end for them.
            if (this._postQueue) {
                this._postQueue.postMessage(msgObj, "*");
            }
        } else {
            _markInfo("Skipping Messsage " + messageType + " from " + this.getGlomId() + " to " + this._targetGlomId + " because no fromGlomId");
        }
    };

    proto.getGlomId = function () {
        return this._targetGlomId;
    };

    proto.getViewId = function () {
        // There was a WWAHost bug where the viewId could disapear (#225323).  This asssert will catch if that happens agian.
        Debug.assert(!this._postQueue || this._postQueue.viewId);
        return this._targetViewId;
    };

    proto.getStartingContext = function () {
        return this._startingContext;
    };

    // For internal use by Jx.GlomManager.
    // Permits reuse of an underlying glom object while safely breaking
    // any previous event listeners or external references by disposing of the old glom object.
    Glom.duplicateAndDispose = function (oldGlom, newGlomId, /* optional */ startingContext) {
        Debug.assert(Jx.isInstanceOf(oldGlom, Jx.Glom));
        Debug.assert(Jx.isNonEmptyString(newGlomId));
        var newGlom = new Jx.Glom(oldGlom._postQueue, newGlomId, oldGlom._getGlomIdFunction, oldGlom._fromViewId, startingContext);
        oldGlom._postQueue = null;
        oldGlom.dispose();
        return newGlom;
    };

});

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Debug */
/*jshint browser:true*/

Jx.ApplicationView = {
    State: {
        wide: 0,     // >= 1920px
        full: 1,     //  < 1920px && >= 1366px
        large: 2,    //  < 1366px && >= 1025px
        more: 3,     //  < 1025px && >=  844px
        portrait: 4, //  <  844px && >=  768px
        split: 5,    //  <  768px && >=  672px
        less: 6,     //  <  672px && >=  502px
        minimum: 7,  //  <  502px && >   320px
        snap: 8      // <=  320px
    },
    getStateFromWidth: function (width) {
        Debug.assert(Jx.isValidNumber(width));
        Debug.assert(width > 0, "Invalid width");
        var bounds = [1920, 1366, 1025, 844, 768, 672, 502, 321];
        for (var i = 0, l = bounds.length; i < l; i++) {
            if (bounds[i] <= width) {
                return i;
            }
        }
        return Jx.ApplicationView.State.snap;
    },
    getState: function () {
        var width = window.innerWidth;
        return Jx.ApplicationView.getStateFromWidth(width);
    }
};

//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true,sub:true*/
/*global Windows,Debug,Jx*/

// This module calculates the font list from the configured input languages at application start, allowing a
// Chinese font to come ahead of the Japanese font if that is how the user's languages are configured, whereas
// before using this module, the font lists were statically fixed at build time.  We add Jx.DynamicFont to handle
// calculating the font list, making the resulting information available to the apps in a variety of ways to
// handle all the places we were setting the font family information.

// Typical methods of use include calling the addPrimaryAndAuthoringClasses to create class rules for use on
// page elements, calling get[Primary|Authoring]FontFamily and using that to dynamically generate your own
// style rules, or including the shared_dynamic_styles.js file which will set up the primary and authoring
// classes, as well as setting a default style rule on the body element.

Jx.delayDefine(Jx, "DynamicFont", function () {
    function _start(s) { Jx.mark("Jx.DynamicFont." + s + ",StartTA,Jx,DynamicFont"); }
    function _stop(s) { Jx.mark("Jx.DynamicFont." + s + ",StopTA,Jx,DynamicFont"); }
    
    _start("Load");

    var DF = Jx.DynamicFont = {};

    DF._primaryFontFamily = [];
    DF._authoringFontFamily = [];
    DF._headStyleEl = null;

    DF._shared = {
        "und": {
            primaryFontFamily: ["Segoe UI"],
            primaryFontFamilyFallback: ["Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
            authoringFontFamily: ["Calibri"],
            authoringFontFamilyFallback: ["Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "sans-serif"],
        },
        "und-arab": {
            primaryFontFamily: ["Segoe UI"],
            primaryFontFamilyFallback: ["Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
            authoringFontFamily: ["Arial"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "und-guru": {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Raavi"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
    };

    var _sharedUnd = DF._shared["und"];
    var _sharedUndArab = DF._shared["und-arab"];
    var _sharedUndCyrl = _sharedUnd;
    var _sharedUndGuru = DF._shared["und-guru"];

    DF._EMOJI_FONT = "Color Emoji";
    
    // IE only supports up to the first 8 entries in a font family specifier, so we'll only store up to this many fonts in our lookup lists
    DF._MAX_FONT_COUNT = 8;

    // any language not set here will receive _sharedUnd when queried.
    // if maintenance overhead becomes a problem (currently no worse than when this was stored in separate css files), 
    // consider using Windows.Globalization.Language to get script information about the available languages and 
    // organize this according to script instead
    DF._languageSettings = {
        "am": {
            primaryFontFamily: ["Ebrima"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Khmer UI"],
            authoringFontFamily: ["Ebrima"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "am-et": { alias: "am" },
        "ar": _sharedUndArab,
        "ar-sa": _sharedUndArab,
        "as": {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Shonar Bangla"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "as-in": { alias: "as" },
        "be": _sharedUndCyrl,
        "be-by": _sharedUndCyrl,
        "bg": _sharedUndCyrl,
        "bg-bg": _sharedUndCyrl,
        "bn": {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Shonar Bangla"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "bn-bd": { alias: "bn" },
        "bn-in": { alias: "bn" },
        "chr-cher": {
            primaryFontFamily: ["Gadugi"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Gadugi"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic"],
        },
        "chr-cher-us": { alias: "chr-cher" },
        "fa": _sharedUndArab,
        "fa-ir": _sharedUndArab,
        "gu": {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Shruti"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "gu-in": { alias: "gu" },
        "he": {
            primaryFontFamily: _sharedUnd.primaryFontFamily,
            primaryFontFamilyFallback: _sharedUnd.primaryFontFamilyFallback,
            authoringFontFamily: ["Arial"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "he-il": { alias: "he" },
        "hi": {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Utsaah"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "hi-in": { alias: "hi" },
        "ja": {
            primaryFontFamily: ["Meiryo UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
            authoringFontFamily: ["Meiryo"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "sans-serif"],
        },
        "ja-jp": { alias: "ja" },
        "kk": _sharedUndCyrl,
        "kk-kz": _sharedUndCyrl,
        "km": {
            primaryFontFamily: ["Khmer UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["DaunPenh"],
            nonUiAuthoringFontFamily: ["Leelawadee UI"],  // use this if in the language list, but not the first (UI) language
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "km-kh": { alias: "km" },
        "kn": {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Tunga"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "kn-in": { alias: "kn" },
        "kok": {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Utsaah"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "kok-in": { alias: "kok" },
        "ko": {
            primaryFontFamily: ["Malgun Gothic"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Ebrima", "Khmer UI"],
            authoringFontFamily: ["Malgun Gothic"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "ko-kr": { alias: "ko" },
        "ku-arab": _sharedUndArab,
        "ku-arab-iq": _sharedUndArab,
        "ky": _sharedUndCyrl,
        "ky-kg": _sharedUndCyrl,
        "ml": {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Kartika"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "ml-in": { alias: "ml" },
        "mn": _sharedUndCyrl,
        "mn-mn": _sharedUndCyrl,
        "mr": {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Utsaah"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "mr-in": { alias: "mr" },
        "ne": {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Utsaah"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "ne-np": { alias: "ne" },
        "or": {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Kalinga"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "or-in": { alias: "or" },
        "pa-arab": _sharedUndArab,
        "pa-arab-pk": _sharedUndArab,
        "pa-in": _sharedUndGuru,
        "prs": _sharedUndArab,
        "prs-af": _sharedUndArab,
        "qps-plocm": {
            primaryFontFamily: ["Segoe UI"],
            primaryFontFamilyFallback: ["Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
            authoringFontFamily: ["Tahoma"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "ru": _sharedUndCyrl,
        "ru-ru": _sharedUndCyrl,
        "sd-arab": _sharedUndArab,
        "sd-arab-pk": _sharedUndArab,
        "si": {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Iskoola Pota"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "si-lk": { alias: "si" },
        "sr-cyrl": _sharedUndCyrl,
        "sr-cyrl-ba": _sharedUndCyrl,
        "sr-cyrl-rs": _sharedUndCyrl,
        "ta": {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Vijaya"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "ta-in": { alias: "ta" },
        "te": {
            primaryFontFamily: ["Nirmala UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Vani"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "te-in": { alias: "te" },
        "tg-cyrl": _sharedUndCyrl,
        "tg-cyrl-tj": _sharedUndCyrl,
        "th": {
            primaryFontFamily: ["Leelawadee"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima"],
            authoringFontFamily: ["Browallia New"],
            nonUiAuthoringFontFamily: ["Leelawadee UI"],  // use this if in the language list, but not the first (UI) language
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "th-th": { alias: "th" },
        "ti": {
            primaryFontFamily: ["Ebrima"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Microsoft JhengHei UI", "Malgun Gothic", "Khmer UI"],
            authoringFontFamily: ["Ebrima"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "ti-et": { alias: "ti" },
        "tt": _sharedUndCyrl,
        "tt-ru": _sharedUndCyrl,
        "ug":  {
            primaryFontFamily: _sharedUnd.primaryFontFamily,
            primaryFontFamilyFallback: _sharedUnd.primaryFontFamilyFallback,
            authoringFontFamily: ["Tahoma"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Microsoft JhengHei UI", "sans-serif"],
        },
        "ug-arab": { alias: "ug" },
        "ug-arab-cn": { alias: "ug" },
        "ug-cn": { alias: "ug" },
        "uk": _sharedUndCyrl,
        "uk-ua": _sharedUndCyrl,
        "ur": _sharedUndArab,
        "ur-pk": _sharedUndArab,
        "vi": _sharedUnd,  // styles override only margins
        "vi-vn": _sharedUnd,  // styles override only margins
        "zh-cn": { alias: "zh-hans" },
        "zh-hans": {
            primaryFontFamily: ["Microsoft YaHei UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft JhengHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
            authoringFontFamily: ["Microsoft YaHei UI"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft JhengHei UI", "Malgun Gothic", "sans-serif"],
        },
        "zh-hans-cn": { alias: "zh-hans" },
        "zh-hant":  {
            primaryFontFamily: ["Microsoft JhengHei UI"],
            primaryFontFamilyFallback: ["Segoe UI", "Meiryo UI", "Microsoft YaHei UI", "Malgun Gothic", "Ebrima", "Khmer UI"],
            authoringFontFamily: ["Microsoft JhengHei UI"],
            authoringFontFamilyFallback: ["Calibri", "Segoe UI", "Meiryo", "Microsoft YaHei UI", "Malgun Gothic", "sans-serif"],
        },
        "zh-hant-hk": { alias: "zh-hant" },
        "zh-hant-tw": { alias: "zh-hant" },
        "zh-hk": { alias: "zh-hant" },
        "zh-tw": { alias: "zh-hant" },
    };

    DF._getApplicationLanguages = function () {
        /// <summary>Gets the intersection of languages supported by the app and installed on the system.  This wrapper mainly
        ///     exists for the purpose of injecting unit test scenarios.
        /// </summary>
        /// <returns type="Array" elementType="String">array of BCP-47 language tags both installed on the system and supported by the app</returns>

        _start("_getApplicationLanguages");
        var languages = Windows.Globalization.ApplicationLanguages.languages;
        _stop("_getApplicationLanguages");

        // TODO: consider using Windows.Globalization.Language to get script information about the available languages to reduce maintenance overhead
        
        return languages;
    };

    DF._calculateFonts = function () {
        /// <summary>Calculates the primary and authoring font family lists, caching them for future calls.  We construct the
        ///     lists by determining the languages installed on the system that are supported by the language, then looking up
        ///     the font to use for each language in the order they are installed.  This will only happen once when the application 
        ///     starts.  Users must restart the app to update the font lists.
        /// </summary>
    
        // we need to calculate the primary font face, and the authoring font face (if we haven't already)
        // the lists may have up to _MAX_FONT_COUNT entries
        // we store these for later programmatic access

        _start("_calculateFonts");

        var primary = DF._primaryFontFamily;
        var authoring = DF._authoringFontFamily;
        var emoji = DF._EMOJI_FONT;
        var maxFontCount = DF._MAX_FONT_COUNT;
        var languages;
        var settings;
        var primaryFallback;
        var authoringFallback;
        var lang;
        var addedPrimary = {};
        var addedAuthoring = {};

        if (primary.length === 0) {

            // calculate the fonts
            // all font lists begin with emoji
            primary.push(emoji);
            authoring.push(emoji);

            // get the languages we support that the user has configured for input (in order)
            languages = DF._getApplicationLanguages();

            // the first is the primary language, so get its settings, including the fallback list
            Debug.assert(languages.length > 0, "no input languages configured");
            lang = languages[0];
            settings = DF._lookupLanguageSetting(lang);
            DF._uniqueConcatInPlace(primary, settings.primaryFontFamily, addedPrimary, maxFontCount);
            DF._uniqueConcatInPlace(authoring, settings.authoringFontFamily, addedAuthoring, maxFontCount);

            primaryFallback = settings.primaryFontFamilyFallback;
            authoringFallback = settings.authoringFontFamilyFallback;

            // add fonts while we have languages to process and there is still room in at least 1 of the lists.
            // start iteration at 1, since we already processed position 0
            for (var i = 1, len = languages.length; i < len && (primary.length < maxFontCount || authoring.length < maxFontCount); ++i)
            {
                lang = languages[i];
                settings = DF._lookupLanguageSetting(lang);
                
                var langPrimary = settings.primaryFontFamily;
                
                // these are all non-ui languages, so if there is a non-ui authoring font, use it instead.
                // some authoring fonts only look good when size adjustments are made to accommodate them.  we don't
                // currently dynamically set the font size, so we should only use such fonts when we know their size
                // rules will be correct, that is, when they are the UI language.  An example of this is the DaunPenh
                // font used for Khmer authoring, which is only readable at a large font size.  If the Khmer font sizes
                // are not applied (when Khmer is not the UI language), it will not be legible, so we use Leelawadee
                // UI instead.
                
                var langAuthoring = settings.nonUiAuthoringFontFamily || settings.authoringFontFamily;

                // add any fonts that aren't already in the lists
                DF._uniqueConcatInPlace(primary, langPrimary, addedPrimary, maxFontCount);
                DF._uniqueConcatInPlace(authoring, langAuthoring, addedAuthoring, maxFontCount);
            }

            // put in any fallback from the main language
            DF._uniqueConcatInPlace(primary, primaryFallback, addedPrimary, maxFontCount);
            DF._uniqueConcatInPlace(authoring, authoringFallback, addedAuthoring, maxFontCount);

            Debug.assert(primary.length <= maxFontCount, "primary font list length exceeded max length (max: " + 
                maxFontCount + ", actual: " + primary.length + ")");
            Debug.assert(authoring.length <= maxFontCount, "authoring font list length exceeded max length (max: " + 
                maxFontCount + ", actual: " + authoring.length + ")");
        }

        _stop("_calculateFonts");
    };

    DF._uniquePush = function (target, element, cache) {
        /// <summary>Pushes an element into a list if it is not there already.  An external lookup table is used 
        ///     to track the contents rather than iterating over the list.
        /// </summary>
        /// <param name="target" type="Array" elementType="String">List to push into</param>
        /// <param name="element" type="String">New item to push into the list</param>
        /// <param name="cache" type="Object">Object passed to successive calls to track the items already in the list</param>
        /// <returns>true if it performed the push, otherwise false</returns>

        var pushed = false;

        if (! cache.hasOwnProperty(element)) {
            target.push(element);
            cache[element] = true;
            pushed = true;
        }

        return pushed;
    };

    DF._uniqueConcatInPlace = function (target, source, cache) {
        /// <summary>Concatenates two list uniquely in place (appended to target), not exceeding _MAX_FONT_COUNT entries</summary>
        /// <param name="target" type="Array" elementType="String">List to concatenate into</param>
        /// <param name="source" type="Array" elementType="String">List to concatenate from</param>
        /// <param name="cache" type="Object">Object passed to successive calls to track the items already in the target list</param>

        var len = source.length;
        var maxPush = len;
        var maxLen = DF._MAX_FONT_COUNT;

        // possibly cap the number we read if we would exceed the max
        var targetLen = target.length;
        if (len + targetLen > maxLen) {
            maxPush = maxLen - targetLen;
        }

        for (var i = 0; i < len && maxPush > 0; ++i) {            
            if (DF._uniquePush(target, source[i], cache)) {
                --maxPush;
            }
        }
    };

    DF._lookupLanguageSetting = function (lang) {
        /// <summary>Gets the best matching language setting.</summary>
        /// <param name="lang" type="String">language string; e.g. en-US</param>
        /// <returns type="Object">object containing information about the primary and authoring fonts and fallbacks</returns>

        // lowercase
        lang = lang.toLowerCase();

        // replace _ with -
        lang = lang.replace("_", "-");

        // lookup
        return DF._lookupLanguageSettingInternal(lang);
    };

    DF._lookupLanguageSettingInternal = function (lang) {
        /// <summary>The same as _lookupLanguageSetting, but assumes that the input has already been scrubbed.</summary>
        /// <param name="lang" type="String">language string; e.g. en-US</param>
        /// <returns type="Object">object containing information about the primary and authoring fonts and fallbacks</returns>

        var settings;
        var query = lang;
        var hyphenPos;

        while (! settings) {
            // lookup the supplied language
            settings = DF._languageSettings[query];

            if (settings)
            {
                // is this an alias record
                var alias = settings.alias;
                if (alias)
                {
                    // get the result of looking up the alias, and cache the result
                    settings = DF._lookupLanguageSettingInternal(alias);
                    DF._languageSettings[lang] = settings;
                }
            } else {
                // if there are - chars in the query, start removing suffixes and look up again
                // otherwise, we can't find anything and should use the default

                hyphenPos = query.lastIndexOf("-");
                if (hyphenPos > 0) {
                    // intentionally check for index > 0 since we can't have a language that starts with -
                    // substring gets up to, but not including, the end pos
                    query = query.substring(0, hyphenPos);
                } else {
                    settings = _sharedUnd;
                    DF._languageSettings[lang] = settings;
                }
            }
        }

        return settings;
    };

    DF.resetPrimaryAndAuthoringFonts = function () {
        /// <summary>Clears the calculated lists so they can be re-calculated.</summary>
        DF._primaryFontFamily = [];
        DF._authoringFontFamily = [];
    };

    DF.addPrimaryAndAuthoringClasses = function () {
        /// <summary>Adds class style rules to the current document that can be applied to elements to get the
        ///     proper primary or authoring fonts.
        ///     .primaryFontFamilyClass will select the primary fonts
        ///     .authoringFontFamilyClass will select the authoring fonts
        /// </summary>

        _start("addPrimaryAndAuthoringClasses");

        // build a string to hold the fonts we found
        var primaryFontFamilyStr = DF.getPrimaryFontFamilyQuoted('"');
        var authoringFontFamilyStr = DF.getAuthoringFontFamilyQuoted('"');

        var rules =
            '.primaryFontFamilyClass {' +
                'font-family: ' + primaryFontFamilyStr + ';' +
            '} ' +
            '.authoringFontFamilyClass {' +
                'font-family: ' + authoringFontFamilyStr + ';' +
            '}';
        
        var style = DF._headStyleEl;
        if (! style) {
            style = DF._headStyleEl = Jx.addStyleToDocument(rules, document);
        } else {
            style.textContent = rules;
        }

        _stop("addPrimaryAndAuthoringClasses");
    };

    DF._getListQuoted = function (list, quoteChar) {
        /// <summary>Creates a quoted comma separated string representation of the supplied list using the supplied quote character,
        ///     allowing, for instance "a", "list", "like", "this" or 'a', 'list', 'like', 'this' depending on the context in which it
        ///     will be used.  This is primarily intended for creating a string that can either be inserted into a style rule in a
        ///     style sheet, or as an attribute on an element.
        /// </summary>
        /// <param name="list" type="Array" elementType="String">List to quote and stringify</param>
        /// <param name="quoteChar" type="String">Character to use for quoting each element in the list</param>
        /// <returns type="String">String containing the quoted, comma separated contents of the list</returns>
    
        if (! quoteChar) {
            quoteChar = '"';
        }

        var str = quoteChar + list.join(quoteChar + ', ' + quoteChar) + quoteChar;

        return str;
    };

    DF.getPrimaryFontFamily = function () {
        /// <summary>Retrieves a list of the primary fonts</summary>
        /// <returns type="String">list of primary fonts</returns>

        _start("getPrimaryFontFamily");

        DF._calculateFonts();
        var fonts = DF._primaryFontFamily;

        _stop("getPrimaryFontFamily");

        return fonts;
    };

    DF.getPrimaryFontFamilyQuoted = function (quoteChar) {
        /// <summary>Retrieves a quoted, comma-delimited list of the primary fonts, suitable for inserting into style rules or attributes</summary>
        /// <param name="quoteChar" type="String">Character to use as the quote character (defaults to ")</param>
        /// <returns type="String">List of primary fonts as text</returns>

        _start("getPrimaryFontFamilyQuoted");

        DF._calculateFonts();
        var fontStr = DF._getListQuoted(DF._primaryFontFamily, quoteChar);

        _stop("getPrimaryFontFamilyQuoted");

        return fontStr;
    };

    DF.getAuthoringFontFamily = function () {
        /// <summary>Retrieves a list of the authoring fonts</summary>
        /// <returns type="String">List of authoring fonts</returns>

        _start("getAuthoringFontFamily");

        DF._calculateFonts();
        var fonts = DF._authoringFontFamily;

        _stop("getAuthoringFontFamily");

        return fonts;
    };

    DF.getAuthoringFontFamilyQuoted = function (quoteChar) {
        /// <summary>Retrieves a quoted, comma-delimited list of the authoring fonts, suitable for inserting into style rules or attributes</summary>
        /// <param name="quoteChar" type="String">Character to use as the quote character (defaults to ")</param>
        /// <returns type="String">List of authoring fonts as text</returns>

        _start("getAuthoringFontFamilyQuoted");

        DF._calculateFonts();
        var fontStr = DF._getListQuoted(DF._authoringFontFamily, quoteChar);

        _stop("getAuthoringFontFamilyQuoted");

        return fontStr;
    };

    DF._insertFontFamilyNode = function (fontFamilyStr, styleSelector, docProvider) {
        /// <summary>Inserts a style rule setting font-family to the primary font family</summary>
        /// <param name="fontFamilyStr" type="String">String to use as the font family list in the style rule</param>
        /// <param name="styleSelector" type="String">CSS selector to use on the rule</param>
        /// <param name="docProvider" type="Document">Document into which to insert the style node.
        ///     Optional and defaults to the current document.
        /// </param>
        /// <returns>The inserted style node, which the caller can use for making modifications</returns>

        docProvider = docProvider || document;

        var rules =
            styleSelector + ' { ' +
                'font-family: ' + fontFamilyStr + ';' +
            '}';

        var style = Jx.addStyleToDocument(rules, docProvider);

        return style;
    };

    DF.insertPrimaryFontFamilyRule = function (styleSelector, docProvider) {
        /// <summary>Inserts a style rule setting font-family to the primary font family</summary>
        /// <param name="styleSelector" type="String">CSS selector to use on the rule</param>
        /// <param name="docProvider" type="Document">Document into which to insert the style node.
        ///     Optional and defaults to the current document.
        /// </param>
        /// <returns>The inserted style node, which the caller can use for making modifications</returns>

        _start("insertPrimaryFontFamilyRule");

        // build a string to hold the fonts we found
        var fontFamilyStr = DF.getPrimaryFontFamilyQuoted();
        var node = DF._insertFontFamilyNode(fontFamilyStr, styleSelector, docProvider);

        _stop("insertPrimaryFontFamilyRule");

        return node;
    };

    DF.insertAuthoringFontFamilyRule = function (styleSelector, docProvider) {
        /// <summary>Inserts a style rule setting font-family to the authroing font family</summary>
        /// <param name="styleSelector" type="String">CSS selector to use on the rule</param>
        /// <param name="docProvider" type="Document">Document into which to insert the style node.
        ///     Optional and defaults to the current document.
        /// </param>
        /// <returns>The inserted style node, which the caller can use for making modifications</returns>

        _start("insertAuthoringFontFamilyRule");

        // build a string to hold the fonts we found
        var fontFamilyStr = DF.getAuthoringFontFamilyQuoted();
        var node = DF._insertFontFamilyNode(fontFamilyStr, styleSelector, docProvider);

        _stop("insertAuthoringFontFamilyRule");

        return node;
    };

    _stop("Load");

});
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// Localization Service - this is a temporary localization library for Windows Live Mosh app development

/// <reference path="Jx.js" />
/// <reference path="Jx.ref.js" />
/// <reference path="MSXML.js" />

(function () {

    Jx.Loc = /*@constructor*/function () {
        // Resource files map of the form { 'collection' : 'path' :}
        this._files = {};
        this._folders = {};

        // Resource memory maps, a two dimentional array of resources[collection][resid] and
        //                       a two dimentional array of resources[collection][elemresid].
        this._resources = {};
        this._elemresources = {};
    };

    /*@type(Object)*/Jx.Loc.prototype.files = null;
    /*@type(Object)*/Jx.Loc.prototype.resources = null;
    /*@type(Object)*/Jx.Loc.prototype.elemresources = null;
    Jx.Loc.prototype._pendingCallbacks = /* @static_cast(Array)*/null;
    Jx.Loc.prototype._isLoaded = false;

    Jx.Loc.prototype._parseRESX = function (xml, collection) {
        /// <summary>
        /// Loop through each &lt;data&gt; tag in the RESX and fetch the data into "this"'s "collection" resource memory
        /// </summary>
        /// <param name="xml" type="IXMLDOMDocument">The XML to be parsed</param>
        /// <param name="collection" type="String">The name of the collection</param>
        collection = collection.toLowerCase();
        this._resources[collection] = this._resources[collection] || {};
        this._elemresources[collection] = this._elemresources[collection] || {};

        var items = xml.getElementsByTagName('data');
        for (var i = 0; i < items.length; i++) {
            var /*@type(HTMLElement)*/e = items[i].getElementsByTagName('value')[0];
            var localizedValue = e.childNodes[0].nodeValue;

            var /*@type(String)*/nameAttribute = items[i].getAttribute('name');
            if (nameAttribute) {
                // Some attributes e.g. 'aria-label' contains dashes
                var matches = nameAttribute.match(/([\w-]+)\.([\w-]+)/);
                if (Boolean(matches) && (matches.length === 3)) {
                    // This is an element.attr resource.
                    this._elemresources[collection][matches[1]] = this._elemresources[collection][matches[1]] || {};
                    this._elemresources[collection][matches[1]][matches[2]] = localizedValue;
                } else if (nameAttribute.length > 0) {
                    // This is a normal resource.
                    Debug.assert(!this._resources[collection].hasOwnProperty(nameAttribute), "Duplicate resource ID in two resource files with the same name! id = " + collection + "/" + nameAttribute);
                    this._resources[collection][nameAttribute] = { value: localizedValue };
                } else {
                    Jx.log.error("Jx.Loc invalid resource " + nameAttribute + " in file " + collection);
                }
            }
        }
    };

    Jx.Loc.prototype.addIncludePath = function (folderpath, /*@optional*/extension) {
        /// <summary>
        /// Add a path which may contain resource files.  If a collection is not yet loaded when getString is called,
        /// this directory can be probed for resource files matching this collection name.
        /// </summary>
        /// <param name="folderpath" type="String">The resource folderpath to add</param>
        /// <param name="extension" type="String">The extension to use when looking for resource files, for example "resx" or "resw"</param>

        this._folders[folderpath] = extension;
    };

    Jx.Loc.prototype._findCollectionInFolders = function (collection) {
        /// <summary>
        /// Searches the _folders for a resource file named after the collection.
        /// </summary>
        /// <param name="collection" type="String">The collection for which to search.</param>
        /// <returns>True if a resource file matching the collection name was found, false otherwise.</returns>

        var found = false;
        collection = collection.toLowerCase();

        if (!Jx.isWWA) {
            Debug.assert(!this._resources[collection]);

            // Try loading files with the collection name into an XMLDOM object
            var xml = /*@static_cast(IXMLDOMDocument)*/new ActiveXObject("Microsoft.XMLDOM");
            xml.preserveWhiteSpace = "False";
            xml.async = 0;

            for (var folder in this._folders) {
                var extension = this._folders[folder];
                if (extension) {
                    // The extension was specified
                    xml.load(folder + "/" + collection + "." + extension);
                } else {
                    // Try once with resx extension, another with resw extension
                    xml.load(folder + "/" + collection + ".resx");
                    if (xml.parseError.errorCode !== 0) {
                        xml.load(folder + "/" + collection + ".resw");
                    }
                }

                if (xml.parseError.errorCode === 0) {
                    // We've found a matching file
                    this._parseRESX(xml, collection);

                    // Since there may be more than one resource file with this name, but in different directories,
                    // don't return yet, but continue looping.
                    found = true;
                    this._isLoaded = true;
                }
            }
        }

        return found;
    };

    Jx.Loc.prototype.addResourcePath = function (filepath) {
        /// <summary>
        /// Add a resource collection
        /// </summary>
        /// <param name="filepath" type="String"> The RESX filepath to add</param>

        // Get the collection name from the filepath
        var collection = filepath;
        var matches = filepath.match(/([^\/]*)\.[^\.]+$/);
        if (Boolean(matches) && (matches.length === 2)) {
            collection = matches[1];
        }
        if (this._files[filepath] !== collection) {
            this._files[filepath] = collection;
            this._isLoaded = false;
        }
    };

    Jx.Loc.prototype._getFilesIFrame = function (callback) {
        /// <summary>
        /// Retrieve all resource files through IFrame and once the resources are loaded into memory, callback the callback function
        /// </summary>
        /// <param name="callback" type="Function"></param>

        var resourceCount = 0;
        // Figure out how many resource files we have in the collection
        var filepath;
        for (filepath in this._files) {
            if (!this._resources[this._files[filepath]]) {
                resourceCount++;
            }
        }

        // Call getCollectionInFrame for each collection
        for (filepath in this._files) {
            var collection = this._files[filepath];
            if (!this._resources[collection]) {
                this._getCollectionInIFrame(filepath, function () {
                    resourceCount--;
                    if (resourceCount === 0) {
                        // We are done getting all the resources, call the callback now
                        callback();
                    }
                });
            }
        }
    };

    Jx.Loc.prototype._getCollectionInIFrame = function (filepath, callback) {
        /// <summary>
        /// Loads a RESX file using an iframe.
        /// </summary>
        /// <param name="filepath" type="String">what collection name to fetch</param>
        /// <param name="callback" type="Function">callback after the collection is loaded</param>

        var iframe = document.createElement('iframe');
        iframe.src = filepath;
        iframe.style.display = 'none';
        var that = this;
        var collection = this._files[filepath];

        // Callback for when the resources are loaded into the iFrame
        iframe.onload = function () {
            // Parse the RESX file content and store the resources into memory
            try {
                that._parseRESX(/*@static_cast(IXMLDOMDocument)*/iframe.contentDocument, collection);
            } catch (ex) {
            } finally {
                // Now the resource is in memory, remove the iframe
                document.body.removeChild(iframe);
            }

            // Call the callback (usually to signal the resource is ready)
            callback();
        };

        // If the body doesn't exist, wait for the DOMContentLoaded event
        if (document.body) {
            document.body.appendChild(iframe);
        } else {
            document.addEventListener("DOMContentLoaded", function onDomContentLoaded() {
                document.body.appendChild(iframe);
                document.removeEventListener("DOMContentLoaded", onDomContentLoaded, false);
            }, false);
        }
    };

    Jx.Loc.prototype._getFilesXMLDOM = function (callback) {
        /// <summary>
        /// Gets the resource files with XMLDOM, works when you have a local server (i.e through IE), doesn't work in the WWA Host. In WWA Host use getCollectionInIframe
        /// </summary>
        /// <param name="callback" type="Function">Callback function after the XMLDOM comes back and the resource loaded</param>

        // Actually doesn't use XHR since it doesn't seem to work.  Instead uses XML activeX.
        var xml = /*@static_cast(IXMLDOMDocument)*/new ActiveXObject("Microsoft.XMLDOM");
        xml.preserveWhiteSpace = "False";
        xml.async = 0;

        for (var filepath in this._files) {
            var collection = this._files[filepath];
            if (!this._resources[collection]) {
                xml.load(filepath);
                if (xml.parseError.errorCode === 0) {
                    this._parseRESX(xml, collection);
                }
            }
        }
        callback();
    };

    Jx.Loc.prototype.initResources = function (/*@optional*/callback) {
        /// <summary>
        /// Prepare the resource file by getting the localized resources into memory by using either IFrame or XMLDOM.
        /// </summary>
        /// <param name="callback" type="Function">Callback function </param>
        if (!callback) {
            callback = function () { }; // noop
        }

        if (this._isLoaded) {
            // Already loaded, just invoke the callback directly
            callback();
        } else if (this._pendingCallbacks !== null) {
            // Loading in progress, add the callback to the list
            this._pendingCallbacks.push(callback);
        } else {
            // Start loading
            var that = this;
            this._pendingCallbacks = [callback];
            var resourcesLoaded = function () {
                that._isLoaded = true;
                that._pendingCallbacks.forEach(function (pendingCallback) { pendingCallback(); });
                that._pendingCallbacks = null;
            };

            if (Jx.isWWA) {
                this._getFilesIFrame(resourcesLoaded);
            } else {
                this._getFilesXMLDOM(resourcesLoaded);
            }
        }
    };

    Jx.Loc.prototype.isLoaded = function () {
        /// <summary>
        /// Returns whether all the resources are loaded
        /// </summary>

        return this._isLoaded;
    };

    function applyMappingToElement(mapping, element) {
        /// <summary>
        /// For each corresponding values in the mapping, map it to the element
        /// </summary>
        /// <param name="mapping" type="Object">The object containing the name/value pairs that we want to map onto the element</param>
        /// <param name="element" type="HTMLElement">The HTML element to map onto</param>

        for (var mappingName in mapping) {
            /// For attributes like aria properties, we have to call setAttribute explicity
            if (mappingName in HTMLElement.prototype) {
                element[mappingName] = mapping[mappingName];
            } else {
                element.setAttribute(mappingName, mapping[mappingName]);
            }
        }
    };

    Jx.Loc.prototype.localize = function (element, show) {
        /// <summary>
        /// Localizes the given element
        /// </summary>
        /// <param name="element" type="HTMLElement">the element and its children to localize</param>
        /// <param name="show" type="Boolean">whether the element should set to display: block after replacing the elements</param>

        // Find all elements under "elem" that has data-ms-resid attributes
        var items = element.querySelectorAll("[data-ms-resid]");
        for (var i = 0; i < items.length; i++) {
            var /*@type(HTMLElement)*/item = items[i];

            // Find the element resource key @{key}
            var matchedResKey = item.getAttribute("data-ms-resid").match(/@{(.*)}/);
            if (Boolean(matchedResKey) && (matchedResKey.length > 0)) {
                // See if it's in the form of @{collection/name}
                var /*@type(String)*/key = matchedResKey[1];
                var parts = key.split('/');

                // Verify collection
                var mapping;
                if (parts[0] && parts[1] && this._elemresources[parts[0]]) {
                    mapping = this._elemresources[parts[0]][parts[1]];
                    if (mapping) {
                        applyMappingToElement(mapping, item);
                    }
                } else {
                    // Find the right collection that has the resource id
                    for (var collection in this._elemresources) {
                        mapping = this._elemresources[collection][key];
                        if (mapping) {
                            applyMappingToElement(mapping, item);
                            break;
                        }
                    }
                }
            }
        }

        if (show) {
            document.body.style.display = 'block';
        };
    };

    Jx.Loc.prototype.localizeApp = function (callback) {
        /// <summary>
        ///     Localize the current app (document.body).
        /// </summary>
        /// <param name="callback" type="Function" optional="true">
        ///     The function to callback after we have finished intializing the resources (loaded into memory) and localized the app
        /// </param>

        var that = this;
        this.initResources(function () {
            that.localize(document.body, true);
            if (callback) {
                callback();
            }
        });
    };

    Jx.Loc.prototype._getStringFromCollection = function (resourceName, collection) {
        /// <summary>Gets the localized string from a specific collection.</summary>
        /// <param name="resourceName" type="String">The name of resource</param>
        /// <param name="collection" type="String">The name of the collection.</param>
        /// <returns type="String">The string. Can be null if the string is not found.</returns>
        collection = collection.toLowerCase();
        var /*@type(String)*/result = null;
        // First check if it's a normal RESX resource
        var collectionDict = this._resources[collection];
        if (!collectionDict && !Jx.isWWA) {
            // This collection is not available.  Is it perhaps waiting in a directory passed in to addIncludePath?
            // TODO: (WL #418877) What if the collection was loaded earlier, but new include paths have been added since then?  It might mean
            // another resource file with the same name in a different folder actually contains the string resource ID we are looking for.
            // In that case we would want to call _findCollectionInFolders again.  TODO: Need Bug #.
            if (this._findCollectionInFolders(collection)) {
                collectionDict = this._resources[collection];
            }
        }

        if (collectionDict) {
            var /*@type(JxResourceEntry)*/item = collectionDict[resourceName];
            if (item) {
                result = item.value;
            }
        }
        return result;
    };

    Jx.Loc.prototype.getString = function (resourceId) {
        /// <summary>Gets the localized string from collection(s)</summary>
        /// <param name="resourceId" type="String">str is of the form "collectionId/strId" where collectionId is optional</param>
        /// <returns type="String" />

        // See if it has a separation of collection and name
        var parts = resourceId.split("/");
        var result = null;

        if (parts[0] && parts[1]) {
            result = this._getStringFromCollection(parts[1].trim(), parts[0].trim());
        } else {
            // Search the collection for a match
            for (var filepath in this._files) {
                result = this._getStringFromCollection(resourceId, this._files[filepath]);
                if (result) {
                    break;
                }
            }
        }

        return result;
    };


    Jx.Loc.prototype.getElementString = function (resourceId, collection) {
        /// <summary> Gets the localized elem string from a collection. </summary>
        /// <param name="resourceId" type="String">The resource id</param>
        /// <param name="collection" type="String" optional="true"></param>

        var parts = resourceId.split('.');
        var result = null;
        if ((parts[0]) && (parts[1])) {
            if (collection) {
                // A collection is specified
                result = this._elemresources[collection][parts[0]][parts[1]];
            } else {
                // See if it's in any collection
                for (var filepath in this._files) {
                    result = this._elemresources[this._files[filepath]][parts[0]][parts[1]];
                    if (result) {
                        break;
                    }
                }
            }
        }
        return result;
    };

    // The localization object, the default is Jx.Loc
    Jx.loc = /*@static_cast(Jx.Loc)*/null;

})();


//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Jx.js"/>
/// <reference path="dom.ref.js"/>

/// <disable>JS2008.DoNotUseCookies</disable>


(function () {

    /* @constructor*/function DebugConsole() {

        this._registers = [];
        this._createUI();
        this._catchErrors();
        this._loadCommandHistory();
        this._eval = eval; // calling eval indirectly (through a reference) will cause it to execute in the global scope

        var that = this;
        function interceptKey(/*@dynamic*/ev) {
            if (that._isVisible() && !ev.key.match("F\\d")) {
                ev.stopPropagation();
                ev.stopImmediatePropagation();
                return true;
            }
            return false;
        }
        window.addEventListener("keydown", function (/* @dynamic*/ev) {
            // Handles the ~ keypress that will toggle the console's visibility.
            if (ev.keyCode === 192 && (ev.shiftKey || ev.altKey) && !ev.ctrlKey) {
                ev.preventDefault();
                that._toggleLayerVisibility();
            } else if (interceptKey(ev)) {
                // If the console is open and the user starts typing, put focus in the text
                // input.  But don't mess with keyboard navigation, copy-paste, etc.
                var controlKeys = [ "Up", "Down", "PageUp", "PageDown", "Home", "End" ];
                if (controlKeys.indexOf(ev.key) === -1 &&
                    !ev.ctrlKey && !ev.altKey) {
                    that._textInputElement.focus();
                }

                // Because we block keydown handlers, we need to manually call our text input handler.
                if (document.activeElement === that._textInputElement) {
                    that._onTextInput(ev);
                }
            }
        }, true);
        window.addEventListener("keyup", interceptKey, true);
        window.addEventListener("keypress", interceptKey, true);

        // If the user clicks on the > next to the input area, switch to multi-line input.
        this._textInputFlipElement.addEventListener("click", function () {
            if (that._isSingleLineMode()) {
                this.innerText = "<";
                that._textInputElement.className = "debugConsoleMultiLine";
            } else {
                this.innerText = ">";
                that._textInputElement.className = "debugConsoleSingleLine";
            }
            that._setCommand(that._textInputElement.value);
            that._textInputElement.focus();
        }, false);
    };
    DebugConsole.prototype._onTextInput = function (/* @dynamic*/ev) {
        this._textInputElement.scrollIntoView();
        if (ev.key === "Enter" && (ev.ctrlKey || this._isSingleLineMode())) {
            // Enter (Ctrl+Enter in multi-line mode) runs the command
            ev.preventDefault();
            var command = this._textInputElement.value.trim();
            this._textInputElement.value = "";
            if (command !== "") {

                // Dump the command to the output
                this._appendText("", "> " + toSingleLine(command));

                // Update the command history
                var index = -1;
                this._commandHistory.forEach(function (previousCommand, i) {
                    if (toSingleLine(command) === toSingleLine(previousCommand)) {
                        index = i;
                    }
                });
                if (index !== -1) {
                    var other = this._commandHistory.splice(index, 1)[0];
                    if (this._isSingleLineMode()) {
                        command = other;
                    }
                }
                this._commandHistory.unshift(command);
                this._commandHistory.length = Math.min(this._commandHistory.length, 20);
                this._commandHistoryPosition = -1;
                this._saveCommandHistory();

                // Execute the command
                this._eval(
                    "with (Debug.console._getCommands()) {\n" +
                    (this._safety ? "    try {\n" : "") +
                    "        dump(stash(eval(" + JSON.stringify(command) + ")));\n" +
                    (this._safety ? "    } catch (ex) {\n" : "") +
                    (this._safety ? "        err(ex);\n" : "") +
                    (this._safety ? "    }\n" : "") +
                    "}"
                );
                this._textInputElement.scrollIntoView();
            }
        } else if (ev.key === "Up" && (ev.ctrlKey || this._isSingleLineMode())) {
            ev.preventDefault();
            if (this._commandHistoryPosition < this._commandHistory.length - 1) {
                this._setCommand(this._commandHistory[++this._commandHistoryPosition]);
            }
        } else if (ev.key === "Down" && (ev.ctrlKey || this._isSingleLineMode())) {
            ev.preventDefault();
            if (this._commandHistoryPosition > 0) {
                this._setCommand(this._commandHistory[--this._commandHistoryPosition]);
            } else {
                this._commandHistoryPosition = -1;
                this._setCommand("");
            }
        } else if (ev.key === "Esc") {
            this._textInputElement.value = "";
        } else if (ev.key === "Tab") {
            ev.preventDefault();
            this._tabComplete();
        }
    };
    function nub (sequence) {
        /// <summary>nub (meaning "essence") removes duplicates elements from a list.</summary>
        var members = {};
        sequence.forEach(function (item) { this[item] = null; }, members);
        return Object.keys(members);
    }
    DebugConsole.prototype._tabComplete = function () {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        var cursorPosition = this._textInputElement.selectionStart,
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
            /*@type(String)*/ fullText = this._textInputElement.value,
            /*@type(String)*/ preCursorText = fullText.slice(0, cursorPosition),
            /*@type(String)*/ postCursorText = fullText.slice(cursorPosition);

        // Tab completion does not include this set of unsavory characters.  It starts immediately after them.
        // This allows us to properly tab complete something like var x = document.b<TAB>, or the inner block of a
        // while loop.
        var /* @dynamic*/match = preCursorText.match(/[^=\s\(\){}\+\-\*\/,;&|!"']+$/);
        if (match !== null && match.length === 1 && match[0] !== ".") {
            var /* @type(String)*/candidate = match[0].trim();

            // Now we are looking for realPart.queryPart<TAB>
            var lastDot = candidate.lastIndexOf(".");
            var isGlobal = false;
            var realPart = "";
            var queryPart = "";
            if (lastDot === -1) {
                isGlobal = true;
                realPart = "window";
                queryPart = candidate;
            } else {
                isGlobal = false;
                realPart = candidate.substr(0, lastDot);
                queryPart = candidate.substr(lastDot + 1);
            }

            // Evaluate the part of the expression before the dot
            var realValue = this._eval(
                "var __tabCompleteResult = null;" +
                "with (Debug.console._getCommands()) {" +
                "    try {" +
                "        __tabCompleteResult = eval(" + JSON.stringify(realPart) + ");" +
                "    } catch (ex) { }" +
                "}" +
                "__tabCompleteResult;"
            );

            // Collect all of the field names into an object literal
            var matchingFields = {};
            for (var field in realValue) {
                if (field.substr(0, queryPart.length).toLowerCase() === queryPart.toLowerCase()) {
                    matchingFields[field] = null;
                }
            }

            var matchingFieldsArray = /*@static_cast(Array)*/Object.keys(matchingFields);
            var newQueryPart = null;

            if (matchingFieldsArray.length === 1) {
                // If we had only one match, drop it into the text input
                newQueryPart = matchingFieldsArray[0];
            } else if (matchingFieldsArray.length > 1) {
                // Otherwise, dump the set of matches
                matchingFields.toString = function () { return matchingFieldsArray.length.toString() + " matches"; };
                var commonPrefix = /*@static_cast(String)*/matchingFieldsArray.reduce(function (/*@type(String)*/prev, /*@type(String)*/next) {
                    var i = 0;
                    for (var len = Math.min(prev.length, next.length); i < len; i++) {
                        if (prev[i].toLowerCase() !== next[i].toLowerCase()) {
                            break;
                        }
                    }
                    return next.substring(0, i);
                });
                var differentQuery = this._lastRealPart !== realPart || this._lastQuery.toLowerCase() !== queryPart.toLowerCase();
                if (differentQuery) {
                    this._appendTreeView(/*@static_cast(TreeView)*/new DataTreeView(candidate + "*", realValue, matchingFields, ["toString"]), true);
                } else if (commonPrefix.length === queryPart.length) {
                    // Cycle through possible matches.
                    var trimmedFields = nub(matchingFieldsArray.map(function (/*@type(String)*/s) { return s.slice(0, queryPart.length); }));
                    newQueryPart = trimmedFields[(trimmedFields.indexOf(queryPart) + 1) % trimmedFields.length];
                }
                if (commonPrefix.length > queryPart.length) {
                    var distance = function (/*@type(String)*/s) {
                        return Array.prototype.reduce.call(queryPart, function (total, c, i) {
                            return (c === s[i] ? 0 : 1) + total;
                        }, 0);
                    };
                    newQueryPart = matchingFieldsArray.sort(function (a,b) { return distance(a) - distance(b); })[0].slice(0, commonPrefix.length);
                }
            }
            if (newQueryPart !== null) {
                var newPreCursorText = preCursorText.substr(0, match.index) + (isGlobal ? "" : (realPart + ".")) + newQueryPart;
                this._textInputElement.value = newPreCursorText + postCursorText;
                /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
                this._textInputElement.setSelectionRange(newPreCursorText.length, newPreCursorText.length);
                /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
            }
            this._lastQuery = newQueryPart !== null ? newQueryPart : queryPart;
            this._lastRealPart = realPart;
        }
    };
    DebugConsole.prototype._createUI = function () {
        ///<summary>Creates all of the UI elements for the console, but does not add them to the view</summary>
        this._styleElement = document.createElement("style");
        this._styleElement.id = "debugConsoleStyles";
        this._styleElement.type = "text/css";
        this._styleElement.innerText =
            ".debugConsoleRoot {" +
                "width:0;" +
                "height:0;" +
                "direction: ltr;" +
                "-ms-user-select: element;" +
                "cursor: text; " +
            "}" +
            "#debugConsoleBackground {" +
                "text-overflow:clip;" +
                "position:fixed;" +
                "top:0;" +
                "left:0;" +
                "width:100%;" +
                "height:100%;" +
                "z-index:2000;" +
                "background-color:rgba(0,0,0,0.8);" +
                "overflow:hidden;" +
            "}" +
            "#debugConsoleLayer {" +
                "width:98%;" +
                "height:100%;" +
                "padding:0 1%;" +
                "color:white;" +
                "font-family:'Segoe UI', 'Segoe UI Symbol';" +
                "font-size:10pt;" +
                "overflow-x:hidden;" +
                "overflow-y:scroll;" +
            "}" +
            "#debugConsoleOutput {" +
                "width:100%;" +
                "overflow-x: hidden;" +
                "white-space: nowrap;" +
            "}" +
            "#debugConsole div {" +
                "width:100%;" +
                "overflow:hidden;" +
            "}" +
            ".debugConsoleVerticalOverlay {" +
                "background-color:blue;" +
                "position:absolute;" +
                "z-index:100000;" +
            "}" +
            ".debugConsoleHorizontalOverlay {" +
                "background-color:blue;" +
                "position:absolute;" +
                "z-index:100000;" +
            "}" +
            ".debugConsoleLogText {" +
                "color:lightgreen;" +
                "font-style:italic;" +
            "}" +
            ".debugConsoleExceptionText {" +
                "color:red;" +
                "font-weight:bold;" +
            "}" +
            ".debugConsoleOutputText {" +
                "color:rgba(200,200,200,1);" +
            "}" +
            ".debugConsoleErrorText {" +
                "color:red;" +
            "}" +
            ".debugConsoleWarningText {" +
                "color:yellow;" +
            "}" +
            ".debugConsolePropertyExpander { " +
                "cursor:pointer;" +
                "margin-right:5px;" +
                "font-family:Consolas;" +
            "}" +
            ".debugConsolePropertyName {" +
                "color:rgba(200,100,200,1);" +
            "}" +
            ".debugConsoleObjectProperties {" +
                "margin-left:15px;" +
            "}" +
            "#debugConsoleInput {" +
                "font-family:inherit;" +
                "font-size:inherit;" +
                "border:none;" +
                "width:95%;" +
                "color:inherit;" +
                "padding:0px;" +
                "margin:0px;" +
            "}" +
            "#debugConsoleInput.debugConsoleSingleLine {" +
                "height: 1.5em;" +
                "overflow: hidden;" +
                "background:none;" +
            "}" +
            "#debugConsoleInput.debugConsoleMultiLine {" +
                "height: 10em;" +
                "overflow: auto;" +
                "background-color: rgba(0,0,0,0.4);" +
            "}" +
            "#debugConsoleInputFlip { " +
                "vertical-align:top;" +
                "cursor:pointer;" +
            "}" +
            ".debugConsoleRegister {" +
                "margin-left:5px;" +
                "color:cyan;" +
                "text-decoration:none;" +
            "}" +
            ".debugConsoleHtmlComment {" +
                "color:#d0d090;" +
                "font-style:italic;" +
            "}" +
            ".debugConsoleHtmlAttrName {" +
                "color:#b0d0f0;" +
            "}" +
            ".debugConsoleHtmlAttrValue {" +
                "color:#80c0e0;" +
            "}" +
            ".debugConsoleHtmlBracket {" +
                "color:#f0c0f0;" +
            "}" +
            ".debugConsoleHtmlText {" +
                "color:#d0d0d0;" +
                "font-style:italic;" +
            "}" +
            ".debugConsoleCssOverriden {" +
                "color:red;" +
                "text-decoration:line-through;" +
            "}" +
            "@media screen and (max-width:340px) {" +
                "#debugConsoleLayer {" +
                    "font-size: 8pt" +
                "}" +
            "}";

        this._rootElement = document.createElement("div");
        this._rootElement.className = "debugConsoleRoot";
        this._rootElement.innerHTML =
                "<div id=debugConsoleBackground>" +
                    "<div id=debugConsoleLayer>" +
                        "<div id=debugConsoleOutput></div>" +
                        "<div>" +
                            "<span id=debugConsoleInputFlip title='Click here to switch between single and multi-line input'>&gt;</span> " +
                            "<textarea id=debugConsoleInput class=debugConsoleSingleLine></textarea>" +
                        "</div>" +
                    "</div>" +
                "</div>";
        this._layerElement = /* @static_cast(HTMLElement)*/this._rootElement.querySelector("#debugConsoleLayer");
        this._outputElement = /* @static_cast(HTMLElement)*/this._rootElement.querySelector("#debugConsoleOutput");
        this._textInputElement = /* @static_cast(HTMLInputElement)*/this._rootElement.querySelector("#debugConsoleInput");
        this._textInputElement.spellcheck = false;
        this._lastQuery = "";
        this._lastRealPart = "";
        this._textInputFlipElement = /* @static_cast(HTMLElement)*/this._rootElement.querySelector("#debugConsoleInputFlip");
    };
    DebugConsole.prototype.writeHTML = function (html) {
        ///<summary>Appends the provided HTML to the console output</summary>
        ///<param name="html" type="String"/>
        var div = document.createElement("div");
        div.innerHTML = html;
        this._appendOutput(div);
    };
    DebugConsole.outputBufferLimit = 1000;
    DebugConsole.prototype._appendOutput = function (div, parentElement) {
        ///<summary>Appends an element to the console</summary>
        ///<param name="div" type="HTMLElement">The element to append</param>
        ///<param name="parentElement" type="HTMLElement" optional="true">The parent element to append to</param>
        if (parentElement !== this._outputElement && parentElement !== undefined) {
            parentElement.appendChild(div);
        } else {
            parentElement = this._outputElement;

            var maintainScrollPosition = false;
            var stuckToBottom = false;
            if (this._rootElement.parentNode !== null) {
                maintainScrollPosition = true;
                var scrollTop = this._layerElement.scrollTop;
                var scrollHeight = this._layerElement.scrollHeight;
                var clientHeight = this._layerElement.clientHeight;
                stuckToBottom = (scrollHeight - scrollTop <= clientHeight + 10);
            }

            parentElement.appendChild(div);

            if (maintainScrollPosition && !stuckToBottom) {
                var newHeight = this._layerElement.scrollHeight;
            }

            while (parentElement.childNodes.length > DebugConsole.outputBufferLimit) {
                parentElement.removeChild(parentElement.childNodes[0]);
            }

            if (stuckToBottom) {
                this._layerElement.scrollTop = this._layerElement.scrollHeight - this._layerElement.clientHeight;
            } else if (maintainScrollPosition) {
                this._layerElement.scrollTop = scrollTop - (newHeight - this._layerElement.scrollHeight);
            }
        }
    };
    DebugConsole.prototype._clearOutput = function () {
        ///<summary>Clears the output area</summary>
        this._outputElement.innerHTML = "";
    };
    DebugConsole.prototype._appendText = function (className, text, parentElement) {
        ///<summary>Appends plaintext output with a specified class</summary>
        ///<param name="className" type="String"/>
        ///<param name="text" type="String"/>
        ///<param name="parentElement" type="HTMLElement" optional="true"/>
        this._appendOutput(createElement("div", className, text), parentElement);
    };
    DebugConsole.prototype._appendData = function (label, /* @dynamic*/data, shouldExpand) {
        ///<summary>Appends some JavaScript data to the output: could be a string/number/object/function/etc.</summary>
        ///<param name="label" type="String">A label for the data being appended</param>
        ///<param name="data">The object containing the data to append</param>
        ///<param name="shouldExpand" type="Boolean">Indicates whether child nodes should be shown by default</param>
        this._appendTreeView(/* @static_cast(TreeView)*/new DataTreeView(label, data, data, []), shouldExpand);
    };
    DebugConsole.prototype._appendHTML = function (node, shouldExpand) {
        ///<summary>Appends an HTML tree to the output.</summary>
        ///<param name="node" type="Node">The HTML node to append</param>
        ///<param name="shouldExpand" type="Boolean">Indicates whether child nodes should be shown by default</param>
        this._appendTreeView(/* @static_cast(TreeView)*/new HtmlTreeView(node), shouldExpand);
    };
    DebugConsole.prototype._appendCSS = function (element) {
        ///<summary>Finds the matching CSS rules for a specific element.</summary>
        ///<param name="element" type="HTMLElement">The html element to trace</param>
        this._appendTreeView(/* @static_cast(TreeView)*/new CssTraceTreeView(element), true);
    };
    DebugConsole.prototype._appendSheet = function (sheet, shouldExpand) {
        ///<summary>Appends a style sheet to the output.</summary>
        ///<param name="style" type="CSSStyleSheet">The sheet to append</param>
        ///<param name="shouldExpand" type="Boolean">Indicates whether child nodes should be shown by default</param>
        this._appendTreeView(/* @static_cast(TreeView)*/new CssTreeView(sheet), shouldExpand);
    };
    DebugConsole.prototype._appendRule = function (rule, shouldExpand) {
        ///<summary>Appends a CSS rule to the output.</summary>
        ///<param name="style" type="CSSSRule">The rule to append</param>
        ///<param name="shouldExpand" type="Boolean">Indicates whether child nodes should be shown by default</param>
        this._appendTreeView(/* @static_cast(TreeView)*/new CssRuleTreeView(rule, null), shouldExpand);
    };
    DebugConsole.prototype._appendStyle = function (style, shouldExpand) {
        ///<summary>Appends a specific CSS style to the output.</summary>
        ///<param name="style" type="Style">The style to append</param>
        ///<param name="shouldExpand" type="Boolean">Indicates whether child nodes should be shown by default</param>
        this._appendTreeView(/* @static_cast(TreeView)*/new CssStyleTreeView(style, null), shouldExpand);
    };
    DebugConsole.prototype._appendTreeView = function (treeView, shouldExpand, parentElement) {
        ///<summary>Appends a tree of data to the output</summary>
        ///<param name="treeView" type="TreeView">The output tree to append</param>
        ///<param name="shouldExpand" type="Boolean">Whether or not to expand the members the view. This function will make the final determination</param>
        ///<param name="parentElement" type="HTMLElement" optional="true">The container in which to append the tree</param>
        var canExpand = treeView.length > 0;
        if (treeView.isExpanded === undefined) {
            treeView.isExpanded = canExpand && shouldExpand && treeView.length <= 20;
        }

        var div = createElement("div", "debugConsoleOutputText", null);
        var expanderRegion = createElement("span", "debugConsolePropertyName", null, div);
        var expanderElement = createElement("span", "debugConsolePropertyExpander debugConsoleOutputText", "+", expanderRegion);
        if (Jx.isNonEmptyString(treeView.label)) {
            createElement("span", null, treeView.label + ": ", expanderRegion);
        }

        var valueElement = createElement("span", null, treeView.value, div);
        if (Jx.isObject(treeView.html)) {
            valueElement.innerHTML = treeView.html.outerHTML;
        } else if (Jx.isNonEmptyString(treeView.className)) {
            valueElement.className = treeView.className;
        }

        var that = this;
        var register = createElement("span", "debugConsoleRegister",
            (treeView.label !== "prototype") ? this._getRegisterName(treeView.register) : null, valueElement);
        valueElement.addEventListener("click", function (ev) {
            that._toggleRegister(treeView.register);
        }, false);
        register.onRegisterChange = function (registerValue, registerName) {
            if (registerValue === treeView.register && treeView.label !== "prototype") {
                this.innerText = registerName;
            }
        };

        var detailsElement = createElement("div", "debugConsoleObjectProperties", null, div);
        if (canExpand) {
            expanderRegion.addEventListener("click", function (ev) {
                if (detailsElement.innerHTML !== "") {
                    detailsElement.innerHTML = "";
                    expanderElement.innerText = "+";
                    treeView.isExpanded = false;
                } else {
                    expanderElement.innerText = "-";
                    that._expandTreeView(treeView, detailsElement);
                }
            }, false);
            if (treeView.isExpanded) {
                expanderElement.innerText = "-";
                that._expandTreeView(treeView, detailsElement);
            }
        } else {
            expanderElement.style.visibility = "hidden";
        }

        this._appendOutput(div, parentElement);
    };
    DebugConsole.prototype._expandTreeView = function (treeView, detailsElement) {
        ///<summary>Expands display of a tree view's children</summary>
        ///<param name="treeView" type="TreeView">The tree view whose children are being expanded</param>
        ///<param name="detailsElement" type="HTMLElement">The element that will contain members of this rule</param>
        if (treeView.children === undefined) {
            treeView.children = [];
            for (var i = 0, len = treeView.length; i < len; i++) {
                treeView.children.push(treeView.createChild(i));
            }
        }
        treeView.isExpanded = true;
        treeView.children.forEach(/* @bind(DebugConsole)*/function (child) {
            this._appendTreeView(child, false, detailsElement);
        }, this);
    };

    function TreeView() { };
    TreeView.prototype.label = "";
    TreeView.prototype.value = "";
    TreeView.prototype.className = "";
    TreeView.prototype.html = /*@static_cast(HTMLElement)*/null;
    TreeView.prototype.register = null;
    TreeView.prototype.length = 0;
    TreeView.prototype.isExpanded = false;
    TreeView.prototype.children = [];
    TreeView.prototype.createChild = function (index) { return null; };

    function DataTreeView(label, /* @dynamic*/data, /* @dynamic*/proto, excluded) {
        ///<summary>Appends some JavaScript data to the output: could be a string/number/object/function/etc.</summary>
        ///<param name="label" type="String">A label for the data being appended</param>
        ///<param name="data">The object containing the data to append</param>
        ///<param name="proto">The object in the prototype chain of data whose members should be displayed</param>
        ///<param name="excluded" type="Array">An array of property names that should not be displayed, either because they have already been displayed or are otherwise unsavory</param>
        this.label = label;
        this._data = this.register = data;

        // Truncate the value
        this.value = valueToString(proto);
        if (Jx.isNonEmptyString(this.value)) {
            var maxLength = 1000;
            if (Jx.isNonEmptyString(label)) {
                this.value = this.value.replace(/\s+/g, " ");
                maxLength = 100;
            }
            if (this.value.length > maxLength) {
                this.value = this.value.substr(0, maxLength) + "...";
            }
        }

        this._fields = getProperties(proto, true, excluded).sort(function (/* @type(String)*/a, /* @type(String)*/b) {
            // Functions go at the end
            if ((typeof data[a] === "function") !== (typeof data[b] === "function")) {
                return (typeof data[a] === "function") ? 1 : -1;
            }
            // When we dump arrays (or types like arrays), we want to avoid sorting numerical values using a string comparison
            var aAsNumber = Number(a);
            var bAsNumber = Number(b);
            var aIsNumber = aAsNumber !== null && !isNaN(aAsNumber);
            var bIsNumber = bAsNumber !== null && !isNaN(bAsNumber);
            if (aIsNumber && bIsNumber) {
                return aAsNumber - bAsNumber;
            }
            if (aIsNumber !== bIsNumber) {
                return aIsNumber ? 1 : -1;
            }
            // Privates after publics
            if ((a[0] === "_") !== (b[0] === "_")) {
                return (a[0] === "_") ? 1 : -1;
            }
            // Otherwise, sort alphabetically
            return a.localeCompare(b);
        });

        if (typeof data === "function" && !isEmpty(data.prototype, [])) {
            this._prototype = { data: data.prototype, proto: data.prototype, excluded: [] };
            this._fields.splice(0, 0, this._prototype);
        } else if (!isEmpty(proto, excluded)) {
            var nextPrototype = Object.getPrototypeOf(proto);
            var nextExcluded = excluded.concat(this._fields);
            if (!isEmpty(nextPrototype, nextExcluded)) {
                this._prototype = { data: data, proto: nextPrototype, excluded: nextExcluded };
                this._fields.splice(0, 0, this._prototype);
            }
        }

        this.length = this._fields.length;
    };
    DataTreeView.prototype.createChild = function (index) {
        if (this._prototype !== undefined && index === 0) {
            return new DataTreeView("prototype", this._prototype.data, this._prototype.proto, this._prototype.excluded);
        } else {
            var field = this._fields[index], value, className;
            try {
                value = this._data[field];
                className = "debugConsoleOutputText";
            } catch (ex) {
                value = ex;
                className = "debugConsoleErrorText";
            }
            var treeView = new DataTreeView(field, value, value, []);
            treeView.className = className;
            return treeView;
        }
    };

    function HtmlTreeView(node) {
        this._element = this.register = node;

        if (node instanceof HTMLStyleElement) {
            var style = /*@static_cast(HTMLStyleElement)*/node;
            this._displayable = /*@static_cast(Array)*/style.styleSheet.cssRules;
        } else if (node instanceof HTMLLinkElement && node.type === "text/css") {
            var link = /*@static_cast(HTMLLinkElement)*/node;
            this._displayable = /*@static_cast(Array)*/link.styleSheet.cssRules;
        } else {
            this._displayable = [];
            for (var i = 0, len = node.childNodes.length; i < len; i++) {
                if (isDisplayableHtmlNode(node.childNodes[i])) {
                    this._displayable.push(node.childNodes[i]);
                }
            }
        }
        this.length = this._displayable.length;

        if (node.nodeType === Node.TEXT_NODE) {
            // Simple text node
            this.className = "debugConsoleHtmlText";
            var textNode = /* @static_cast(TextNode)*/node;
            this.value = toSingleLine(textNode.textContent.trim());
        } else if (node.nodeType === Node.COMMENT_NODE) {
            this.className = "debugConsoleHtmlComment";
            this.value = toSingleLine(node.text);
        } else {
            var htmlNode = /*@static_cast(HTMLElement)*/node;
            this.html = createElement("span", null, null);
            createElement("span", "debugConsoleHtmlBracket", "<", this.html);
            createElement("span", "debugConsolePropertyName", htmlNode.nodeName.toLowerCase(), this.html);

            // Attributes - id first, then class, everything else last
            if (Jx.isNonEmptyString(htmlNode.id)) {
                this._appendHtmlAttribute("id", htmlNode.id);
            }
            if (Jx.isNonEmptyString(htmlNode.className)) {
                this._appendHtmlAttribute("class", htmlNode.className);
            }
            for (i = 0, len = htmlNode.attributes.length; i < len; i++) {
                var attribute = /* @static_cast(Attr)*/htmlNode.attributes[i];
                if (attribute.name !== "id" && attribute.name !== "class") {
                    this._appendHtmlAttribute(attribute.name, attribute.value);
                }
            }

            createElement("span", "debugConsoleHtmlBracket", ">", this.html);
        }
    };
    HtmlTreeView.prototype.createChild = function (index) {
        var child = this._displayable[index];
        if (child instanceof CSSRule) {
            return new CssRuleTreeView(this._displayable[index]);
        } else {
            return new HtmlTreeView(this._displayable[index]);
        }
    };
    HtmlTreeView.prototype._appendHtmlAttribute = function (attrName, attrValue) {
        ///<summary>Displays an attribute node when expanding a tree of html elements</summary>
        ///<param name="attrName" type="String">The name of the attribute</param>
        ///<param name="attrValue" type="String">The value of the attribute</param>
        createElement("span", null, " ", this.html);
        createElement("span", "debugConsoleHtmlAttrName", attrName, this.html);
        createElement("span", null, "=\"", this.html);
        createElement("span", "debugConsoleHtmlAttrValue", attrValue, this.html);
        createElement("span", null, "\"", this.html);
    };

    function CssTraceTreeView(element) {
        ///<summary>Appends CSS rules that match the element to the outptut.</summary>
        ///<param name="element" type="HTMLElement">The HTML element to match</param>
        this._element = element;
        this._matches = [];

        // Include inline styles by creating an object that looks like a CSS rule
        if (element.style.length > 0) {
            this._matches.push(new CssStyleTreeView(element.style, "<inline-styles>", element));
        }

        var parentElement = Jx.isObject(element.parentNode) ? element.parentNode : element;
        var sheets = document.styleSheets;
        for (var i = 0, iLen = sheets.length; i < iLen; i++) {
            var rules = /* @static_cast(Array)*/sheets[i].cssRules;
            for (var j = 0, jLen = rules.length; j < jLen; j++) {
                var rule = /* @static_cast(CSSRule)*/rules[j],
                    elements = parentElement.querySelectorAll(rule.selectorText);
                for (var k = 0, kLen = elements.length; k < kLen; k++) {
                    if (elements[k] === element) {
                        this._matches.push(new CssRuleTreeView(rule, element));
                        break;
                    }
                }
            }
        }

        this.label = "trace";
        this.value = this.register = element;
        this.length = this._matches.length;
    };
    CssTraceTreeView.prototype.createChild = function (index) {
        return this._matches[index];
    };

    function CssTreeView(sheet) {
        ///<summary>Builds a tree of CSS rules from a style sheet</summary>
        ///<param name="sheet" type="CSSStyleSheet">The sheet to consider</param>
        if (Jx.isNonEmptyString(sheet.href)) {
            this.value = sheet.href;
        } else if (Jx.isNonEmptyString(sheet.id)) {
            this.value = sheet.id;
        } else if (Jx.isNonEmptyString(sheet.title)) {
            this.value = sheet.title;
        }

        this.register = this._sheet = sheet;
        this.label = "css";
        this.length = sheet.cssRules.length;
    };
    CssTreeView.prototype.createChild = function (index) {
        return new CssRuleTreeView(this._sheet.cssRules[index]);
    };

    function CssRuleTreeView(rule, match) {
        ///<summary>Builds a tree of CSS styles from a rule</summary>
        ///<param name="rule" type="CSSRule">The rule to consider</param>
        ///<param name="match" type="HTMLElement" optional="true">An element that matches this rule</param>
        if (rule.type === rule.STYLE_RULE) {
            Jx.mix(this, new CssStyleTreeView(rule.style, rule.selectorText, match));
            this.createChild = CssStyleTreeView.prototype.createChild;
            this.label = Jx.isObject(match) ? "match" : "rule";
        } else if (rule.type === rule.IMPORT_RULE) {
            this.label = "@import";
            this.value = rule.href;
            this.length = rule.styleSheet.cssRules.length;
        } else {
            this.label = "rule";
            this.value = rule.cssText;
            this.length = 0;
        }

        this._rule = this.register = rule;
        this._match = match;
    };
    CssRuleTreeView.prototype.createChild = function (index) {
        var rule = this._rule;
        if (rule.type === rule.IMPORT_RULE) {
            return new CssRuleTreeView(rule.styleSheet.cssRules[index], this._match);
        }
        return null;
    };

    function CssStyleTreeView(style, value, match) {
        /// <summary>Builds a tree of CSS properties from a style</summary>
        /// <param name="style" type="Style">The style to consider</param>
        /// <param name="value" type="String">The value to display</param>
        /// <param name="match" type="HTMLElement" optional="true">An element that matches this style</param>
        this._style = this.register = style;
        this._match = match;
        this.label = "style";
        this.value = value;

        this._children = [];
        for (var i = 0, len = style.length; i < len; i++) {
            if (this.cssIgnoreName[style[i]] === undefined) {
                var parts = /* @static_cast(Array)*/style[i].split("-");
                if (/^-ms-/.test(style[i])) {
                    parts.splice(0, 3, "-ms-" + parts[2]);
                }
                this._insertChild(parts);
            }
        }

        this.length = this._children.length;
    };
    CssStyleTreeView.prototype._insertChild = function (parts) {
        for (var i = 0, len = this._children.length; i < len; i++) {
            if (this._children[i].insert(parts)) {
                return;
            }
        }
        this._children.push(new CssPropertyTreeView(this._style, null, parts, this._match));
    };
    CssStyleTreeView.prototype.createChild = function (index) {
        return this._children[index].getLeaf();
    };
    // CSS property names that just don't exist in JS
    CssStyleTreeView.prototype.cssIgnoreName = {};
    CssStyleTreeView.prototype.cssIgnoreName["-ms-text-size-adjust"] = true;

    /*@constructor*/function CssPropertyTreeView(style, base, remaining, match) {
        /// <param name="style" type="Style">The style to consider</param>
        /// <param name="remaining" type="Array" />
        /// <param name="match" type="HTMLElement" optional="true">An element that matches this style</param>

        this._style = style;
        this._match = match;

        this.part = remaining.splice(0, 1)[0];
        this.label = Jx.isNonEmptyString(base) ? base + "-" + this.part : this.part;

        this._children = [];
        if (remaining.length > 0) {
            this._children.push(new CssPropertyTreeView(style, this.label, remaining, match));
        }

        this.value = this._style[this.cssFixedName[this.label]];
        if (this.value === undefined) {
            // Standard conversion, e.g. padding-left=>paddingLeft, -ms-flex-box=>msFlexBox
            var indexer = this.label.replace(/^-ms/, "ms");
            indexer = indexer.replace(/-\w/g, function (m) { return m[1].toUpperCase(); });
            this.value = this._style[indexer];

            if (this.value === undefined) {
                // Some -ms-* properties don't use the 'ms' prefix in their JS field name
                indexer = indexer.replace(/^ms\w/, function (m) { return m[2].toLowerCase(); });
                this.value = this._style[indexer];
            }
        }

        if (this.value !== undefined) {
            this.register = this.value;
            if (Jx.isObject(this._match) && !areCssValuesEqual(this.value, this._match.currentStyle[indexer])) {
                // Show a red strike through properties that don't match
                this.html = createElement("span", "debugConsoleCssOverriden", null);
                createElement("span", "debugConsoleOutputText", this.value, this.html);
            }
        }
    };
    CssPropertyTreeView.prototype.createChild = function (index) {
        return this._children[index].getLeaf();
    };
    Object.defineProperty(CssPropertyTreeView.prototype, "length", { get: function () {
        return this._children.length;
    }});
    CssPropertyTreeView.prototype.insert = function (/*@type(Array)*/parts) {
        if (this.part === parts[0]) {
            parts.splice(0, 1);
            if (parts.length > 0) {
                for (var i = 0, len = this._children.length; i < len; i++) {
                    if (this._children[i].insert(parts)) {
                        return true;
                    }
                }
                this._children.push(new CssPropertyTreeView(this._style, this.label, parts, this._match));
            }
            return true;
        } else {
            return false;
        }
    };
    CssPropertyTreeView.prototype.getLeaf = function () {
        if (this._children.length === 1) {
            return this._children[0].getLeaf();
        } else {
            return this;
        }
    };
    CssPropertyTreeView.prototype.cssFixedName = {
        "-ms-scrollbar-3dlight-color": "scrollbar3dLightColor",
        "scrollbar-3dlight-color": "scrollbar3dLightColor",
        "-ms-scrollbar-darkshadow-color": "scrollbarDarkShadowColor",
        "scrollbar-darkshadow-color": "scrollbarDarkShadowColor",
        "-ms-transform-origin-x": "msTransformOrigin",
        "-ms-transform-origin-y": "msTransformOrigin"
    };

    function ElementEvents(callback, /*@dynamic*/context) {
        /// <param name="callback" type="Function" />
        /// <param name="context" />

        var domEvents = {}, body = document.body, selection = body, border = 2,
            root = createElement("div", "debugConsoleRoot", null, body),
            overlayLeft = createElement("div", "debugConsoleVerticalOverlay", null, root).style,
            overlayRight = createElement("div", "debugConsoleVerticalOverlay", null, root).style,
            overlayTop = createElement("div", "debugConsoleHorizontalOverlay", null, root).style,
            overlayBottom = createElement("div", "debugConsoleHorizontalOverlay", null, root).style;
        overlayLeft.width = overlayRight.width = overlayTop.height = overlayBottom.height = String(border) + "px";

        function restoreConsole() {
            for (var evName in domEvents) {
                document.removeEventListener(evName, domEvents[evName], true);
            }
            body.removeChild(root);
            callback.call(context, selection);
        }

        function positionOverlay() {
            var rect = selection.getBoundingClientRect(),
                offsetLeft = rect.left + body.scrollLeft - body.clientLeft,
                offsetTop = rect.top + body.scrollTop - body.clientTop,
                selectionWidth = selection.offsetWidth,
                selectionHeight = selection.offsetHeight;

            overlayLeft.left = overlayTop.left = overlayBottom.left = String(offsetLeft) + "px";
            overlayRight.left = String(offsetLeft + selectionWidth - border) + "px";
            overlayLeft.top = overlayRight.top = overlayTop.top = String(offsetTop) + "px";
            overlayBottom.top = String(offsetTop + selectionHeight - border) + "px";
            overlayLeft.height = overlayRight.height = String(selectionHeight) + "px";
            overlayTop.width = overlayBottom.width = String(selectionWidth) + "px";
        };

        domEvents.mousemove = function (/*@dynamic*/ev) {
            var target = document.elementFromPoint(ev.clientX, ev.clientY);
            if (/^debugConsole/.test(target.className)) {
                return;
            }
            if (target !== selection) {
                selection = target;
                positionOverlay();
            }
        };
        domEvents.click = function (/*@dynamic*/ev) {
            ev.preventDefault();
            ev.stopPropagation();
            restoreConsole();
        };
        domEvents.keydown = function (/*@dynamic*/ev) {
            if (ev.keyCode === 192 && ev.shiftKey) {
                // tilde key - stop selection before the console goes away
                restoreConsole();
            }
            if (ev.key === "Esc") {
                ev.preventDefault();
                ev.stopPropagation();
                selection = null;
                restoreConsole();
            }
        };

        for (var eventName in domEvents) {
            document.addEventListener(eventName, domEvents[eventName], true);
        }

        // Initial position on the body
        positionOverlay();
    }
    DebugConsole.prototype.stashHtml = function (element) {
        ///<summary>Called with the resulting element of a _selectHtml call</summary>
        ///<param name="element" type="HTMLElement">The element to stash in a register</param>
        this._rootElement.style.display = "";
        if (Jx.isObject(element)) {
            this._toggleRegister(element);
            this._appendHTML(/*@static_cast(Node)*/element, true);
        }
        this._textInputElement.focus();
    };
    DebugConsole.prototype._selectHtml = function () {
        ///<summary>Called by Jx.log, appends timetamped output</summary>
        this._rootElement.style.display = "none";
        new ElementEvents(this.stashHtml, this);
    };
    DebugConsole.prototype.log = function (level, text) {
        ///<summary>Called by Jx.log, appends timetamped output</summary>
        ///<param name="level">Unused</param>
        ///<param name="text" type="String"/>
        var secondsSinceStart = (Date.now() - this._startTime) / 1000;
        var messageStyle;
        switch (level) {
            case Jx.LOG_ALWAYS:
            case Jx.LOG_CRITICAL: messageStyle = "debugConsoleExceptionText";
                break;
            case Jx.LOG_ERROR: messageStyle = "debugConsoleErrorText";
                break;
            case Jx.LOG_WARNING: messageStyle = "debugConsoleWarningText";
                break;
            default: messageStyle = "debugConsoleLogText";
                break;
        }
        this._appendText(messageStyle, "Log@" + secondsSinceStart.toFixed(3) + ": " + text);
    };
    DebugConsole.prototype._isVisible = function () {
        ///<summary>Checks whether the console is currently visible</summary>
        ///<returns type="Boolean"/>
        return (this._rootElement.parentNode !== null);
    };
    DebugConsole.prototype._toggleLayerVisibility = function () {
        ///<summary>Shows/hides the console.  Actually tears the elements out of the tree so that the console is invisible to debuggers and other code until called upon</summary>
        if (!this._isVisible()) {
            if (this._styleElement.parentNode === null) {
                document.getElementsByTagName("head")[0].appendChild(this._styleElement);
            }
            document.body.appendChild(this._rootElement);
            this._textInputElement.focus();
        } else {
            //// Breaks media queries:  document.getElementsByTagName("head")[0].removeChild(this._styleElement);
            document.body.removeChild(this._rootElement);
        }
    };
    DebugConsole.prototype._catchErrors = function () {
        ///<summary>Hooks window.onerror to output exception information</summary>
        var that = this;
        window["onerror"] = function (msg, file, line) {
            that._appendText("debugConsoleExceptionText", "Unhandled exception: " + msg + "\n  file: " + file + "\n  line: " + line);
            return false;
        };
    };
    DebugConsole.prototype._loadCommandHistory = function () {
        ///<summary>Loads stored command history from a cookie</summary>
        this._commandHistory = Debug.getCookie("consoleCommandHistory", []);
    };
    DebugConsole.prototype._saveCommandHistory = function () {
        ///<summary>Saves command history to the cookie</summary>
        Debug.setCookie("consoleCommandHistory", this._commandHistory);
    };
    DebugConsole.prototype._setCommand = function (value) {
        ///<summary>Sets a value into the text input.  Handles single-line/multi-line cases</summary>
        ///<param name="value" type="String"/>
        if (this._isSingleLineMode()) {
            value = toSingleLine(value);
        } else if (this._commandHistoryPosition >= 0 && this._commandHistoryPosition < this._commandHistory.length &&
                   toSingleLine(this._textInputElement.value) === toSingleLine(this._commandHistory[this._commandHistoryPosition])) {
            value = this._commandHistory[this._commandHistoryPosition];
        }
        this._textInputElement.value = value;
    };
    DebugConsole.prototype._isSingleLineMode = function () {
        ///<summary>Checks whether the input element is in single-line or multi-line input mode</summary>
        ///<returns type="Boolean"/>
        return (this._textInputElement.className.split(" ").indexOf("debugConsoleSingleLine") !== -1);
    };
    DebugConsole.prototype._setSafety = function (enableSafety) {
        ///<summary>Enables or disables the "safety": the try/catch around evaluation of command line input</summary>
        ///<param name="enableSafety" type="Boolean"/>
        this._safety = enableSafety;
        this._appendText("debugConsoleOutputText", "Safety " + (enableSafety ? "enabled" : "disabled"));
    };
    DebugConsole.prototype._stash = function (/* @dynamic*/value) {
        ///<summary>Stores a value into the stash register:  $</summary>
        ///<param name="value"/>
        this._registers[0] = value;
    };
    DebugConsole.prototype._toggleRegister = function (/* @dynamic*/value) {
        ///<summary>Stores the specified value into a register, or clears it from one if it is already stored</summary>
        ///<param name="value">The value to save or clear</param>

        // If this value is already in a register, clear it
        for (var i = 1, len = this._registers.length; i < len; i++) {
            if (this._registers[i] === value) {
                delete this._registers[i];
                this._updateRegisterElements(value, "");
                return;
            }
        }

        // Otherwise, set it to the first available register
        for (i = 1, len = this._registers.length; i < len; i++) {
            if (this._registers[i] === undefined) {
                break;
            }
        }
        this._registers[i] = value;
        this._updateRegisterElements(value, "$" + i.toString());
    };
    DebugConsole.prototype._getRegisterName = function (/* @dynamic*/value) {
        ///<summary>Returns the name of a register that contains this value, or an empty string</summary>
        ///<param name="value">The value to find</param>
        var registerName = "";
        if (value !== undefined) {
            var registerIndex = this._registers.indexOf(value, 1);
            if (registerIndex !== -1) {
                registerName = "$" + registerIndex.toString();
            }
        }
        return registerName;
    };
    DebugConsole.prototype._updateRegisterElements = function (value, registerName) {
        ///<summary>Updates all of the register elements based on a register change</summary>
        ///<param name="value">The value that has been stored or cleared</param>
        ///<param name="registerName" type="String">The name of the register containing this value, or empty string if none</param>
        var registerElements = document.querySelectorAll(".debugConsoleRegister");
        for (var i = 0, len = registerElements.length; i < len; i++) {
            registerElements[i].onRegisterChange(value, registerName);
        }
    };
    DebugConsole.prototype._loadScriptFile = function (path) {
        var scriptElement = document.createElement("script");
        var that = this;
        scriptElement.onload = function () {
            that._appendText("debugConsoleOutputText", "Script file loaded: " + path);
        };
        scriptElement.onerror = function () {
            that._appendText("debugConsoleErrorText", "Error loading script file: " + path);
        };
        scriptElement.type = "text/javascript";
        scriptElement.src = path;
        document.getElementsByTagName("head")[0].appendChild(scriptElement);
    };
    DebugConsole.prototype._getCommands = function () {
        ///<returns type="ConsoleCommands">A ConsoleCommands object to be used as a context for command-line evaluation</returns>
        return new ConsoleCommands(this, this._registers);
    };
    DebugConsole.prototype._startTime = Date.now();
    DebugConsole.prototype._styleElement = /* @static_cast(HTMLElement)*/null;
    DebugConsole.prototype._rootElement = /* @static_cast(HTMLElement)*/null;
    DebugConsole.prototype._layerElement = /* @static_cast(HTMLElement)*/null;
    DebugConsole.prototype._outputElement = /* @static_cast(HTMLElement)*/null;
    DebugConsole.prototype._textInputElement = /* @static_cast(HTMLElement)*/null;
    DebugConsole.prototype._textInputFlipElement = /* @static_cast(HTMLElement)*/null;
    DebugConsole.prototype._commandHistory = /* @static_cast(Array)*/null;
    DebugConsole.prototype._commandHistoryPosition = -1;
    DebugConsole.prototype._safety = true;

    /*@constructor*/function ConsoleCommands(debugConsole, registers) {
        /// <summary>
        /// These commands are exposed to the console using a "with" statement.
        /// This enables them to be run without any context, and without polluting the window
        /// object.
        /// </summary>
        /// <param name="debugConsole" type="DebugConsole" />
        /// <param name="registers" type="Array" />

        this._console = debugConsole;
        for (var i = 0, len = registers.length; i < len; i++) {
            Object.defineProperty(/* @static_cast(Object)*/this, "$" + i.toString(), { value: registers[i] });
        }
    };
    ConsoleCommands.prototype.clip = function (text) {
        window.clipboardData.setData("Text", text);
    };
    ConsoleCommands.prototype.dump = function (data, label) {
        if (data !== undefined || label !== undefined) {
            this._console._appendData(label, data, true);
        }
    };
    ConsoleCommands.prototype.log = function (data) {
        if (data !== undefined) {
            this._console._appendData(null, data, true);
        }
    };
    ConsoleCommands.prototype.html = function (data) {
        if (data === undefined) {
            data = document.documentElement;
        }
        if (data instanceof Node) {
            this._console._appendHTML(/* @static_cast(Node)*/data, true);
        } else {
            this.err("Not an HTML node");
        }
    };
    ConsoleCommands.prototype.css = function (/* @dynamic*/data) {
        if (data instanceof HTMLElement) {
            this._console._appendCSS(data);
        } else if (data instanceof CSSStyleDeclaration) {
            this._console._appendStyle(data, true);
        } else if (data instanceof CSSRule) {
            this._console._appendRule(data, true);
        } else if (data instanceof CSSStyleSheet) {
            this._console._appendSheet(data, true);
        } else if (data === undefined) {
            var sheets = document.styleSheets;
            for (var i = 0, len = sheets.length; i < len; i++) {
                var sheet = /* @static_cast(CSSStyleSheet)*/sheets[i];
                if (sheet.id !== "debugConsoleStyles") {
                    this._console._appendSheet(sheet, false);
                }
            }
        } else {
            this.err("Not a valid object type");
        }
    };
    ConsoleCommands.prototype.err = function (msg) {
        this._console._appendText("debugConsoleErrorText", msg);
    };
    ConsoleCommands.prototype.load = function (path) {
        this._console._loadScriptFile(path);
    };
    ConsoleCommands.prototype.hook = function (/* @dynamic*/source, eventName) {
        var that = this;
        function listener() {
            that.dump({source: source, eventName: eventName, args: arguments }, "Event fired");
        }
        if (Jx.isObject(source)) {
            if (source.addEventListener !== undefined) {
                source.addEventListener(eventName, listener, false);
            } else if (source.addListener !== undefined) {
                source.addListener(eventName, listener);
            } else if (source.on !== undefined) {
                source.on(eventName, listener);
            }
        }
    };
    ConsoleCommands.prototype.promise = function (p) {
        /// <param name="p" type="WinJS.Promise" />
        var that = this;
        p.then(
            function () { that.dump({ promise: p, args: arguments }, "Promise complete"); },
            function () { that.dump({ promise: p, args: arguments }, "Promise error"); },
            function () { that.dump({ promise: p, args: arguments }, "Promise progress"); }
        );
    };
    ConsoleCommands.prototype.safety = function (enableSafety) {
        this._console._setSafety(enableSafety);
    };
    Object.defineProperty(ConsoleCommands.prototype, "cls", { get: function () {
        this._console._clearOutput();
    }});
    Object.defineProperty(ConsoleCommands.prototype, "select", { get: function () {
        this._console._selectHtml();
    }});
    Object.defineProperty(ConsoleCommands.prototype, "help", { get: function () {
        this._console._appendText(
           "debugConsoleOutputText",
            "The debugging console displays output from Jx.log, and shows uncaught exceptions when the Javascript engine is not running in debug mode.\n" +
            "The console command-line accepts any javascript code and dumps the result.\n" +
            "Built-in commands:\n" +
            "    cls - clears the output area\n" +
            "    log(string) - outputs a string\n" +
            "    clip(string) - copies the string to the clipboard\n" +
            "    dump(obj [, label]) - dumps an object with an optional label\n" +
            "    html([node]) - dumps the HTML tree, optionally rooted to a specific node\n" +
            "    select - stash an HTML element by selecting it in the actual UI\n" +
            "    css([element|sheet|rule|style]) - dumps CSS, optionally matching a provided object\n" +
            "    hook(obj, event) - hooks an event on an object and dumps when it fires\n" +
            "    promise(p) - listens to the complete/error/progress events on a promise\n" +
            "    load(string) - loads the specified javascript file\n" +
            "    safety(bool) - enables/disables catching errors thrown from console evaluation\n" +
            "\n" +
            "You can click the > next to the input area to toggle between single-line and multi-line input modes. The console supports a persistent command history, use the arrow keys (or Ctrl+arrow keys in multi-line mode) to repeat past commands.\n" +
            "\n" +
            "The result of the last evaluation is stored in a stash register.  You can access with the $0 symbol. Clicking on any value in the output will store that value into a numbered register, like $1 or $2. All of these registers can be used anywhere in an expression.  Note that a register is a value, not an alias to a property.  If the property that the register was created from changes, the register will not.\n" +
            "\n" +
            "More usage instructions can be found in the Jx.DebugConsole section of the Modern Cookbook."
       );
    }});
    ConsoleCommands.prototype.stash = function (value) {
        this._console._stash(value);
        return value;
    };

    function getProperties(/* @dynamic*/data, own, excluded) {
        ///<param name="data">The object whose properties to enumerate</param>
        ///<param name="own" type="Boolean">Controls whether only the properties of this object are returned, or properties from the entire prototype chain</param>
        ///<param name="excluded" type="Array">Names of properties that should not be returned</param>
        var props = [];
        if (data) {

            var hasProps = false;
            if (typeof data === "function") {
                hasProps = true;
                Array.prototype.push.apply(excluded, Object.getOwnPropertyNames(/* @static_cast(Object)*/Function));
            } else if (typeof data === "object") {
                hasProps = true;
            }

            if (hasProps) {
                var /* @dynamic*/proto = data;
                do {
                    if (proto === Object.prototype || proto === Array.prototype || proto === Function.prototype) {
                        break;
                    }
                    var prototypeProperties;
                    try {
                        prototypeProperties = /* @static_cast(Array)*/Object.getOwnPropertyNames(proto);
                    } catch (ex) {
                        break; // XSS on iframes can prevent enumeration
                    }
                    for (var i = 0, len = prototypeProperties.length; i < len; i++) {
                        var propertyName = prototypeProperties[i];
                        if (props.indexOf(propertyName) === -1 &&
                            excluded.indexOf(propertyName) === -1 &&
                            propertyName !== "constructor") {
                            props.push(propertyName);
                        }
                    }
                    proto = Object.getPrototypeOf(proto);
                } while (!own && proto);
            }
        }
        return props;
    }

    function isEmpty(/* @dynamic*/data, excluded) {
        ///<summary>Returns whether any properties would be shown when expanding this object</summary>
        ///<param name="data">The object to examine</param>
        ///<param name="excluded" type="Array">A set of property names that should not be output</param>
        var empty = getProperties(data, false, excluded).length === 0;
        if (typeof data === "function") {
            empty = empty && isEmpty(data.prototype, []);
        }
        return empty;
    }

    function getConstructorName(constructorFunction) {
        ///<summary>Tries to determine the name of a given constructor function.  Used to identify object types.</summary>
        ///<param name="constructorFunction" type="Function"/>

        // Look for the constructor by searching the namespaces
        /// <disable>JS3054.NotAllCodePathsReturnValue</disable>
        var /*@type(String)*/constructorName = Debug.scanTypes(function (testConstructorFunction, testConstructorName) {
            if (testConstructorFunction === constructorFunction) {
                return testConstructorName;
            }
        });
        /// <enable>JS3054.NotAllCodePathsReturnValue</enable>

        // Otherwise, see if the constructor function has a name
        if (!constructorName) {
            var code = constructorFunction.toString();
            if (code.substr(0, 9) === "function ") {
                var parenthesisIndex = code.indexOf("(");
                if (parenthesisIndex !== -1) {
                    var possibleName = code.substr(9, parenthesisIndex - 9).trim();
                    if (possibleName.match(/^[\w$]+$/) !== null) {
                        constructorName = possibleName;
                    }
                }
            }
        }
        return constructorName;
    }

    function toSingleLine(value) {
        ///<summary>Converts the given string to a single line</summary>
        ///<param name="value" type="String"/>
        ///<returns type="String"/>
        return value.replace(/(\/\/[^\r\n]*)|(\/\*(.|[\r\n])*\*\/)/g, "$2").replace(/\s*[\r\n]\s*/g, " ");
    }

    function valueToString(/* @dynamic*/data, isRecursive) {
        ///<summary>Converts the provided value (object/function/array/string/number/etc) to a string representation</summary>
        ///<param name="data">The object to convert to a string</param>
        ///<param name="isRecursive" type="Boolean" optional="true">The function will recurse when printing an array, but should only do so once</param>
        ///<returns type="String"/>
        var string = "{...}";
        try {
            switch (typeof data) {
                case "undefined":
                case "string":
                    string = JSON.stringify(data);
                    break;
                case "number":
                case "boolean":
                    string = data.toString();
                    break;
                default:
                    if (data === null) {
                        string = "null";
                    } else {
                        if (Array.isArray(data)) {
                            string = "length=" + data.length.toString();
                            if (data.length < 20 && !isRecursive) {
                                string += " [" + data.map(function (item) { return valueToString(item, true); }).join(", ") + "]";
                            }
                        } else {
                            if (data.toString) {
                                string = data.toString();
                            } else {
                                string = "" + data;
                            }
                        }

                        if (string === "[object Object]") {
                           var constructorName = getConstructorName(data.constructor);
                           if (constructorName) {
                               string = "[object " + constructorName + "]";
                           }
                        }

                        // Decorate the string with unique identifiers
                        if (data.name) {
                            string = string + " " + data.name;
                        }
                        if (data._debugObjectName) {
                            string = string + " " + data._debugObjectName;
                        }
                        if (data.id) {
                            string = string + " #" + data.id;
                        }
                        if (data.className) {
                            string = string + " " + data.className.trim().split(/\s+/).map(function (className) { return "." + className; }).join(" ");
                        }
                        if (data.objectId) {
                            string = string + " " + data.objectId;
                        }
                    }
                    break;
            }
        } catch (ex) { }
        return string;
    }

    function isDisplayableHtmlNode(node) {
        ///<summary>Determines if a specific HTML element should displayed when dumping the tree</summary>
        ///<param name="node" type="Node">The element to test</param>
        switch (node.nodeType) {
            case Node.TEXT_NODE:
            case Node.COMMENT_NODE:
                var textNode = /* @static_cast(TextNode)*/node;
                return textNode.textContent.trim().length > 0;
        }
        return true;
    }

    function createElement(nodeType, className, innerText, parentElement) {
        ///<summary>Creates an element of the specified type, setting the inner text and class name and optionally appends
        ///it to the provided parent element.</summary>
        ///<param name="nodeType" type="String">The type of HTML element to create</param>
        ///<param name="className" type="String">The class name value to set</param>
        ///<param name="innerText" type="String">The text value to set</param>
        ///<param name="parentElement" type="HTMLElement" optional="true">The parent element to append to</param>
        var element = document.createElement(nodeType);
        if (Jx.isNonEmptyString(className)) {
            element.className = className;
        }
        // ConsoleCommands.err calls this with an exception that we want to be sure to display
        if (Jx.isNonEmptyString(innerText) || Jx.isObject(innerText)) {
            element.innerText = innerText;
        }
        if (Jx.isObject(parentElement)) {
            parentElement.appendChild(element);
        }
        return element;
    }

    function areCssValuesEqual(valueA, valueB) {
        ///<param name="valueA" type="String"/>
        ///<param name="valueB" type="String"/>

        // basic string compare
        if ((valueA + "").trim() === (valueB + "").trim()) {
            return true;
        }

        // try comparing as numbers, for floating point canonicalization
        var aAsNumber = Number(valueA);
        var bAsNumber = Number(valueB);
        return aAsNumber !== null && !isNaN(aAsNumber) && aAsNumber === bAsNumber;
    }

    Debug.getCookie = function (valueName, /*@dynamic*/defaultValue) {
        /// <param name="valueName" type="String" />
        /// <param name="defaultValue" optional="true" />
        var result = defaultValue;
        try {
            document.cookie.split(";").forEach(function (cookie) {
                /// <param name="cookie" type="String" />
                var split = cookie.split("=");
                var cookieName = split[0].trim();
                if (cookieName === valueName) {
                    result = JSON.parse(unescape(split[1]));
                }
            });
        } catch (ex) { }
        return result;
    };
    Debug.setCookie = function (valueName, /*@dynamic*/value) {
        /// <param name="valueName" type="String" />
        var date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        document.cookie = valueName + "=" + escape(JSON.stringify(value)) + "; expires=" + date.toUTCString();
    };
    Debug.scanTypes = /*@dynamic*/function (fn, namespace, namespaceName, alreadyChecked, depth) {
        ///<summary>Searches the namespace hierarchy recursively, looking for constructors</summary>
        ///<param name="fn" type="Function">The function that will "visit" each constructor.  If this function returns a value, the search will terminate and return that value.  Signature is:
        ///   function (constructorFunction, constructorName, parentNamespace, fieldName)</param>
        ///<param name="namespace" type="Object" optional="true">The namespace to search</param>
        ///<param name="namespaceName" type="String" optional="true">The name of that namespace</param>
        ///<param name="alreadyChecked" type="Array" optional="true">A set of namespaces that have already been examined, used as a guard against infinite recursion or wastefulness</param>
        ///<param name="depth" type="Number" optional="true">The recursion depth, used to avoid excessive cost in fruitless lookups</param>
        Debug.scanningTypes++;
        try {
            namespace = namespace || /*@static_cast(Object)*/window;
            namespaceName = namespaceName || "";
            alreadyChecked = alreadyChecked || [ window.Windows, window.Microsoft ]; // don't bother searching these namespaces
            depth = depth || 0;

            if (depth < 10 && alreadyChecked.length < 1000) {
                for (var field in namespace) {
                    if ((field[0] >= 'A' && field[0] <= 'Z') || field[0] === '$') { // namespaces and constructors start with a capital letter
                        try {
                            var /* @dynamic*/objectToCheck = namespace[field];
                            var isNamespace = typeof objectToCheck === "object" && objectToCheck !== null && objectToCheck.constructor === Object;
                            var isFunction = typeof objectToCheck === "function" && objectToCheck !== Function;
                            if ((isNamespace || isFunction) && alreadyChecked.indexOf(objectToCheck) === -1) {
                                alreadyChecked.push(objectToCheck);

                                var objectName = (namespaceName ? namespaceName + "." : "") + field;
                                var result;

                                if (isFunction) {
                                    // Pass this constructor to the visitor function
                                    result = fn(objectToCheck, objectName, namespace, field);
                                }
                                if (!result) {
                                    // Recurse into this namespace or constructor
                                    result = Debug.scanTypes(fn, objectToCheck, objectName, alreadyChecked, depth + 1);
                                }

                                if (result) {
                                    return result;
                                }
                            }
                        } catch (ex) {
                            // Sometimes we run into bad things (property get functions that throw) while walking the namespace.  Keep walking.
                        }
                    }
                }
            }
        } finally {
            Debug.scanningTypes--;
        }
    };

    Debug.console = new DebugConsole();

})();



;//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Jx.ref.js" />
/// <reference path="WindowsLive.ref.js" />



Debug = window.Debug || {};

Debug.scanningTypes = 0;

Debug.Leaks = function () {
    ///<summary>Constructor for the Leaks object.  This object is disabled by default, and only enabled by the presence of
    ///a cookie set by a call to Debug.leaks.enable();</summary>
    if (Debug.getCookie("leakTrack")) {
        this.enable();
    }
};

Debug.Leaks.prototype.enable = function () {
    ///<summary>Enables leak tracking (persisted via cookie)</summary>
    if (!this._isEnabled) {
        this._isEnabled = true;
        Debug.setCookie("leakTrack", true);

        if (Jx.isWWA) {
            // It doesn't actually matter what object we use here, we just need a WinRT object that we can
            // stick weak references onto using msSetWeakWinRTProperty.
            this._weakReferences = new Windows.Foundation.Uri("http://leaks");
            this._nextMoniker = 1;
        }

        // Leak tracking works by instrumenting constructors.  We'll do an initial scan to find them now, and set ourselves
        // up to re-scan when new script files are loaded.
        this.scanForTypesToTrack();

        var that = this;
        var scanWhenReady = function (script) {
            /// <param name="script" type="HTMLElement" />
            script.addEventListener("readystatechange", function listener() {
                if (script.readyState === "complete") {
                    that.scanForTypesToTrack();
                    script.removeEventListener("readystatechange", scanWhenReady, true);
                }
            }, true);
        };

        // Watch for new script nodes being added to the head, and scan again when they are loaded.
        var /*@type(HTMLElement)*/head = document.getElementsByTagName("head")[0];
        head.addEventListener("DOMNodeInserted", function (evt) {
            /// <param name="evt" type="Event" />
            var element = evt.target;
            if (element.tagName === "SCRIPT") {
                if (element.readyState === "complete") {
                    that.scanForTypesToTrack();
                } else {
                    scanWhenReady(element);
                }
            }
        }, true);

        // There may already be scripts in the document that are not yet loaded. Hook them as well.
        var scripts = document.scripts;
        Array.prototype.forEach.call(scripts, function (script) {
            /// <param name="script" type="HTMLElement" />
            if (script.readyState !== "complete") {
                scanWhenReady(script);
            }
        }, this);
    }
};

Debug.Leaks.prototype.disable = function () {
    ///<summary>Disables leak tracking.</summary>
    this._isEnabled = false;
    Debug.setCookie("leakTrack", false);
    this._weakReferences = null;
    // We won't go remove all of the existing hooks, but they should no-op, and they won't be installed on the
    // next restart.
};

Debug.Leaks.prototype.scanForTypesToTrack = function (namespace, namespaceName) {
    ///<summary>Scans the namespace hierarchy looking for constructors and instrumenting them</summary>
    ///<param name="namespace" type="Object" optional="true">The namespace to search recursively</param>
    ///<param name="namespaceName" type="String" optional="true">The name of the given namespace</param>
    if (this._isEnabled) {
        var that = this;
        Debug.scanTypes(function (constructor, constructorName, parentNamespace, fieldName) {
            if (!that.isInstrumented(constructor)) {
                parentNamespace[fieldName] = that.createInstrumentedConstructor(constructor, constructorName);
            }
        });
    }
};

Debug.Leaks.prototype.isInstrumented = function (/*@dynamic*/constructor) {
    ///<summary>Checks whether the given constructor is already instrumented for leak tracking</summary>
    ///<param name="constructor" />
    ///<returns type="Boolean"/>
    if (!this._isEnabled || !constructor._debugTrackedForLeaks) {
        return false;
    }

    // If we found the _debugTrackedForLeaks member, we are tracking this object.
    //
    //   But before we return true, check that there is no drift between the prototype on the original constructor
    // and the prototype on the leak tracking constructor.  This can happen in some narrow conditions where the 
    // constructor is overridden, and then the code does a Jx.inherit on the original constructor (cached in a member or
    // temporarilly stored on the stack).  When that happens, you can get a split prototype where the original constructor
    // has the inherited methods and the overriden constructor may have some methods as well.  We'll patch up the prototype
    // back to a unified state as best we can.
    //   This is rare, but can happen when scripts are loaded recursively.
    var instrumentedConstructor = /*@static_cast(LeakInstrumentedConstructor)*/constructor;
    var oldConstructor = instrumentedConstructor._debugTrackedForLeaks.original;
    if (oldConstructor.prototype !== instrumentedConstructor.prototype) {
        Jx.log.warning("Split prototype detected on " + instrumentedConstructor._debugTrackedForLeaks.type);
        Object.getOwnPropertyNames(instrumentedConstructor.prototype).forEach(function (field) {
            if (field !== "constructor") {
                Debug.assert(!oldConstructor.prototype.hasOwnProperty(field), "Split prototype with field collision: " + field);
                Object.defineProperty(oldConstructor.prototype, field, Object.getOwnPropertyDescriptor(instrumentedConstructor.prototype, field));
            }
        });
        instrumentedConstructor.prototype = oldConstructor.prototype;
        if (oldConstructor.prototype.constructor === /*@static_cast(Function)*/oldConstructor) {
            /// <disable>JS3083.DoNotOverrideBuiltInFunctions</disable>
            instrumentedConstructor.prototype.constructor = instrumentedConstructor;
        }
    }

    return true;
};

Debug.Leaks.prototype.createInstrumentedConstructor = function (/*@dynamic*/constructor, typeName) {
    ///<summary>Creates a replacement constructor for this type that is instrumented to track leaks</summary>
    ///<param name="constructor">Constructor for the type</param>
    ///<param name="typeName" type="String">Type name to be reported in any leak dumps</param>
    ///<returns type="Function">The instrumented constructor</returns>
    if (!this._isEnabled) {
        return constructor;
    }

    var newConstructor = function () {
        if (this instanceof newConstructor) { // If this isn't true, we might not actually be a constructor.
                                              // Perhaps a mis-called constructor, or just a miscapitalized function.  
                                              // Let's avoid tracking "window" or whatever else "this" might be.
            Debug.assert(newConstructor.prototype === constructor.prototype);
            Debug.leaks.trackObject(this, typeName);
        }

        return constructor.apply(this, arguments);
    };

    // Copy all statics from the original constructor to the new one
    Object.getOwnPropertyNames(constructor).forEach(function (field) {
        if (Object.getOwnPropertyNames(Function).indexOf(field) === -1) {
            Object.defineProperty(newConstructor, field, Object.getOwnPropertyDescriptor(constructor,field));
        }
    });

    // Give the new constructor the same prototype as the original.  This should be resilient to monkey patching
    // as we are using the same prototype object.
    newConstructor.prototype = constructor.prototype;
    if (constructor.prototype.constructor === /*@static_cast(Function)*/constructor) {
        newConstructor.prototype.constructor = newConstructor;
    } 

    // Mark the constructor as tracked
    newConstructor._debugTrackedForLeaks = { type: typeName, original: constructor };
    return newConstructor;
};

Debug.Leaks.prototype.trackObject = function (/*@dynamic*/object, type) {
    ///<summary>Track an object's lifetime by allocating a WinRT object</summary>
    ///<param name="object">The object to be tracked.  Can be an object (either created by a constructor or a literal), or a 
    ///a bound function (created via closure/bind).</param>
    ///<param name="type" type="String">The type name to be dumped in the leak report.  Additional instance specific
    ///tracking info can be added by calling Debug.setObjectName(object, "...")</param>
    if (this._isEnabled) {
        if (!object._debugLeakRecord) {
            var record = object._debugLeakRecord = /*@static_cast(LeakTrackerRecord)*/{ type: type, moniker: String(this._nextMoniker++) };
            if (Jx.isWWA) {
                msSetWeakWinRTProperty(this._weakReferences, record.moniker, object);
            }
        }
    }
};

Debug.Leaks.prototype.snapshot = function () {
    ///<summary>Stores and returns a list of all currently allocated objects</summary>
    ///<returns type="Array"/>
    if (!this._isEnabled) {
        throw new Error("Leak tracking is not enabled");
    }

    ///<disable>JS2064.SpecifyNewWhenCallingConstructor,JS3058.DeclareVariablesBeforeUse</disable>
    CollectGarbage();
    ///<enable>JS2064.SpecifyNewWhenCallingConstructor,JS3058.DeclareVariablesBeforeUse</enable>
    
    var snapshot = this._lastSnapshot = [];
    for (var i = 0; i < this._nextMoniker; i++) {
        var trackedObject = /*@static_cast(LeakTrackedObject)*/msGetWeakWinRTProperty(this._weakReferences, String(i));
        if (trackedObject) {
            snapshot.push(trackedObject._debugLeakRecord);
        }
    }

    return snapshot;
};

Debug.Leaks.prototype.delta = function (before, after) {
    ///<summary>Compares two snapshots and dumps the results to the debug console.</summary>
    ///<param name="before" type="Array" optional="true"/>
    ///<param name="after" type="Array" optional="true"/>
    before = before || this._lastSnapshot || [];
    after = after || this.snapshot();

    var deletedObjects = [];
    var /*@type(Array)*/newObjects = Array.prototype.slice.call(after);
    Array.prototype.forEach.call(before, function (/*@type(LeakTrackerRecord)*/record) {
        var index = newObjects.indexOf(record);
        if (index === -1) {
            deletedObjects.push(record);
        } else {
            newObjects.splice(index, 1);
        }
    });

    var list = {};
    function incrementCounter(/*@type(String)*/field) {
        return function (/*@type(LeakTrackerRecord)*/record) {
            list[record.type] = list[record.type] || { current:0, deleted:0, created:0};
            list[record.type][field]++;
        };
    }
    Array.prototype.forEach.call(after, incrementCounter("current"));
    deletedObjects.forEach(incrementCounter("deleted"));
    newObjects.forEach(incrementCounter("created"));

    var str = "<table>";
    Object.keys(list).sort().forEach(function (/*@type(String)*/typeName) {
        str += "<tr><td>" + typeName + "</td><td>" + list[typeName].current + "</td><td>";
        if (list[typeName].deleted) {
            str += "-" + list[typeName].deleted;
        }
        str += "</td><td>";
        if (list[typeName].created) {
            str += "+" + list[typeName].created;
        }
        str += "</td></tr>";
    });
    str += "</table>";
    Debug.console.writeHTML(str);
};

Debug.Leaks.prototype.outstanding = function (type) {
    /// Returns an array of outstanding objects of a given type, sorted by creation time
    /// <param name="type">Can be a string type name, or a constructor</param>
    /// <returns type="Array"/>
    if (Jx.isFunction(type)) {
        var ctor = /*@static_cast(LeakInstrumentedConstructor)*/type;
        var tracked = ctor._debugTrackedForLeaks;
        if (!tracked) {
            throw new Error("Provided type is not a tracked constructor");
        }
        type = tracked.type;
    } else if (!Jx.isNonEmptyString(type)) {
        throw new Error("No type filter provided (constructor or string)");
    }

    Jx.log.warning("The returned array holds a reference to these objects.  To resume normal leak tracking functionality, you will need to remove all references to this array and the objects it contains.  Use 'cls' if you dump objects to the console, and be sure to clear any registers you might set.");
    var weakReferences = this._weakReferences;
    return this.snapshot().filter(function (/*@type(LeakTrackerRecord)*/record) {
        return record.type === type;
    }).map(function (/*@type(LeakTrackerRecord)*/record) {
        return msGetWeakWinRTProperty(weakReferences, record.moniker);
    });
};

Debug.Leaks.prototype._isEnabled = false;
Debug.Leaks.prototype._lastSnapshot = /*@type(Array)*/null;

Debug.leaks = new Debug.Leaks();



