﻿/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='utilities.js' />
/// <reference path='errors.js' />
(function () {
    "use strict";

    var categories = {
        /// <summary>
        /// Categories of tracing messages.
        /// </summary>
        error: "Error",         // indicates trace message describing critical application event
        warning: "Warning",     // indicates trace message describing important application event
        perf: "Performance",    // indicates performance marker
        info: "Information",    // indicates trace message that serves informational purpose
        verbose: "Verbose"      // indicates trace message that provides detailed information
    };

    /// <summary>
    /// The filter object which determines which categories of traces will be sent to output.
    /// </summary>
    var filter = {};

    /// <summary>
    /// Array of trace listeners.
    /// </summary>
    var registeredListeners = [];

    var trace = function (category, formatText) {
        /// <summary>
        /// Outputs trace message of the given category.
        /// </summary>
        /// <param name="category" type="String">
        /// The classification of the trace message.
        /// </param>
        /// <param name="formatText" type="String">
        /// The format string for trace message. The  trace message will be generated by replacing 
        /// placeholders inside format string with values of arguments passed as function parameters.
        /// </param>
        if (BingApp.Utilities.isNullOrUndefined(category)) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("category");
        }

        // Skip the message which category does not meet current filter
        if (!filter[category]) {
            return;
        }

        // Create arguments that will be passed to .format() function. Note the use of
        // .call() method - this is required because "arguments" is not array.
        var formatArgs = Array.prototype.slice.call(arguments, 1);
        var traceMessage = BingApp.Utilities.format.apply(null, formatArgs);

        // Go through all listeners and output traces into them
        var countListeners = registeredListeners.length;
        for (var indexListener = 0; indexListener < countListeners; indexListener++) {
            var listener = registeredListeners[indexListener];
            listener.log(category, traceMessage);
        }
    };

    var traceError = function (formatText) {
        /// <summary>
        /// Outputs trace message of the error category.
        /// </summary>
        /// <param name="formatText" type="String">
        /// The format string for trace message. The  trace message will be generated by replacing
        /// placeholders inside format string with values of arguments passed as function parameters.
        /// </param>
        var traceArgs = Array.prototype.slice.call(arguments, 0);
        traceArgs.unshift(categories.error);
        trace.apply(null, traceArgs);
    };

    var traceWarning = function (formatText) {
        /// <summary>
        /// Outputs trace message of the warning category.
        /// </summary>
        /// <param name="formatText" type="String">
        /// The format string for trace message. The  trace message will be generated by replacing
        /// placeholders inside format string with values of arguments passed as function parameters.
        /// </param>
        var traceArgs = Array.prototype.slice.call(arguments, 0);
        traceArgs.unshift(categories.warning);
        trace.apply(null, traceArgs);
    };

    var tracePerf = function (formatText) {
        /// <summary>
        /// Outputs trace message of the performance category.
        /// </summary>
        /// <param name="formatText" type="String">
        /// The format string for trace message. The  trace message will be generated by replacing
        /// placeholders inside format string with values of arguments passed as function parameters.
        /// </param>
        var traceArgs = Array.prototype.slice.call(arguments, 0);
        traceArgs.unshift(categories.perf);
        trace.apply(null, traceArgs);
    };

    var traceInfo = function (formatText) {
        /// <summary>
        /// Outputs trace message of the information category.
        /// </summary>
        /// <param name="formatText" type="String">
        /// The format string for trace message. The  trace message will be generated by replacing
        /// placeholders inside format string with values of arguments passed as function parameters.
        /// </param>
        var traceArgs = Array.prototype.slice.call(arguments, 0);
        traceArgs.unshift(categories.info);
        trace.apply(null, traceArgs);
    };

    var traceVerbose = function (formatText) {
        /// <summary>
        /// Outputs trace message of the verbose category.
        /// </summary>
        /// <param name="formatText" type="String">
        /// The format string for trace message. The  trace message will be generated by replacing
        /// placeholders inside format string with values of arguments passed as function parameters.
        /// </param>
        var traceArgs = Array.prototype.slice.call(arguments, 0);
        traceArgs.unshift(categories.verbose);
        trace.apply(null, traceArgs);
    };

    // Expose tracing functions via application namespace
    WinJS.Namespace.define("BingApp", {
        TraceCategories: categories,
        trace: trace,
        traceError: traceError,
        traceWarning: traceWarning,
        tracePerf: tracePerf,
        traceInfo: traceInfo,
        traceVerbose: traceVerbose,
        setTraceFilter: function (traceFilter) {
            /// <summary>
            /// Sets current trace filter which determines the categories of trace messages that
            /// will be output.
            /// </summary>
            /// <param name="traceFilter">
            /// Object which contains properties indicating whether trace messages of specific 
            /// category will be sent to output.
            /// </param>
            if (!traceFilter) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("traceFilter");
            }

            filter = traceFilter;
        },
        getTraceFilter: function () {
            /// <summary>
            /// Gets current filter applied to trace messages.
            /// </summary>
            /// <returns>
            /// Object which contains properties indicating whether trace messages of specific
            /// category will be sent to output.
            /// </returns>
            return filter;
        },
        addTraceListener: function (listener) {
            /// <summary>
            /// Adds given object as target of trace output.
            /// </summary>
            /// <param name="listener" type="BingApp.Classes.BaseTraceListener">
            /// Object that serves as output target for trace messages.
            /// </param>
            if (!listener) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("listener");
            }

            registeredListeners.push(listener);
        },
        removeTraceListener: function (listener) {
            /// <summary>
            /// Removes given object as target of trace output.
            /// </summary>
            /// <param name="listener" type="BingApp.Classes.BaseTraceListener">
            /// Object that serves as output target for trace messages.
            /// </param>
            if (!listener) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("listener");
            }

            for (var indexListener = registeredListeners.length - 1; indexListener >= 0; indexListener--) {
                if (registeredListeners[indexListener] === listener) {
                    registeredListeners.splice(indexListener, 1);
                }
            }
        }
    });

    /// <summary>
    /// Defines base class that serves as target for outputting trace messages.
    /// </summary>
    WinJS.Namespace.define("BingApp.Classes", {
        BaseTraceListener: WinJS.Class.define(
            function () { },
            {
                log: function (category, message) {
                    /// <summary>
                    /// Outputs given trace message of given category.
                    /// </summary>
                    /// <param name="category" type="String">
                    /// The classification of the trace message. This information can be used
                    /// to direct the message output.
                    /// </param>
                    /// <param name="message" type="String">
                    /// The trace message to be output.
                    /// </param>
                    var methodName = "BaseTraceListener.log";
                    throw new BingApp.Classes.ErrorInvalidOperation(
                        methodName,
                        BingApp.Utilities.format(WinJS.Resources.getString("error_must_override").value, methodName));
                }
            })
    });

    /// <summary>
    /// Defines class that outputs trace messages as ETW traces.
    /// </summary>
    WinJS.Namespace.define("BingApp.Classes", {
        EtwTraceListener: WinJS.Class.derive(
            BingApp.Classes.BaseTraceListener,
            function () {
                /// <summary>
                /// Initializes a new instance of BingApp.Classes.EtwTraceListener class.
                /// </summary>
                if (!(this instanceof BingApp.Classes.EtwTraceListener)) {
                    BingApp.traceWarning("EtwTraceListener.ctor: Attempted using EtwTraceListener ctor as function; redirecting to use 'new EtwTraceListener()'.");
                    return new BingApp.Classes.EtwTraceListener();
                }
            },
            {
                log: function (category, message) {
                    /// <summary>
                    /// Outputs given trace message of given category.
                    /// </summary>
                    /// <param name="category" type="String">
                    /// The classification of the trace message. This information can be used
                    /// to direct the message output.
                    /// </param>
                    /// <param name="message" type="String">
                    /// The trace message to be output.
                    /// </param>

                    // Prepend message with trace category
                    message = BingApp.Utilities.format("{0}: {1}", category, message);
                    window.msWriteProfilerMark(message);
                }
            })
    });

    /// <summary>
    /// Defines class that outputs trace messages into console.
    /// </summary>
    WinJS.Namespace.define("BingApp.Classes", {
        ConsoleTraceListener: WinJS.Class.derive(
            BingApp.Classes.BaseTraceListener,
            function () {
                /// <summary>
                /// Initializes a new instance of BingApp.Classes.ConsoleTraceListener class.
                /// </summary>
                if (!(this instanceof BingApp.Classes.ConsoleTraceListener)) {
                    BingApp.traceWarning("ConsoleTraceListener.ctor: Attempted using ConsoleTraceListener ctor as function; redirecting to use 'new ConsoleTraceListener()'.");
                    return new BingApp.Classes.ConsoleTraceListener();
                }
            },
            {
                log: function (category, message) {
                    /// <summary>
                    /// Outputs given trace message of given category.
                    /// </summary>
                    /// <param name="category" type="String">
                    /// The classification of the trace message. This information can be used
                    /// to direct the message output.
                    /// </param>
                    /// <param name="message" type="String">
                    /// The trace message to be output.
                    /// </param>
                    console.log(message);
                }
            })
    });
})();
