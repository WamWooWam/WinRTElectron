
// Copyright (C) Microsoft Corporation.  All rights reserved.

(function () {
    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    /// <summary>
    /// This 'class' is for helper methods when creating Unit Tests
    /// </summary>
    window.UnitTestUtils = {

        implements: function (obj, iface) {
            /// <Summary>
            /// Simple method to validate that the passed obj parameter implements the 'interface'
            /// as defined by the iface object. If the obj parameter does not implement all of the 
            /// properties as identified by the iface object then this return false otherwise true.
            /// </Summary>
            /// <param name="obj" type="Object" optional="false">
            /// The object to be validated
            /// </param>
            /// <param name="iface" type="Object" optional="false">
            /// An object which provides the template (interface) that the passed 'obj' parameter
            /// should also implement.
            /// </param>
            /// <returns type="Boolean">
            /// True if the passed 'obj' object implements all of the properties defined by the 
            /// 'iface' object as the same type.
            /// </returns>

            if (typeof obj !== typeof iface) {
                return false;
            }
            for (var name in iface) {
                if (typeof iface[name] !== typeof obj[name]) {
                    if (obj[name] !== null) {
                        return false;
                    }
                }
            }

            return true;
        },

        _objToString: function (obj) {
            if (typeof obj !== 'object') {
                return (typeof obj);
            }

            var message = '{\n';
            for (var name in obj) {
                var arg = obj[name];
                if (typeof arg === 'function') {
                    message += '  ' + name + ' : function(';
                    for (var lp = 0, l = obj[name].length; lp < l; lp++) {
                        if (lp !== 0) {
                            message += ', ';
                        }
                        message += 'arg' + lp;
                    }
                    message += ')\n';
                } else {
                    message += '  ' + name + ' : ' + (typeof arg) + '\n';
                }
            }
            message += '}';

            return message;
        },

        assertImplements: function (tc, obj, iface) {
            /// <Summary>
            /// Simple method to validate that the passed obj parameter implements the 'interface'
            /// as defined by the iface object. If the obj parameter does not implement all of the 
            /// properties as identified by the iface object then this will cause a Tx.fail
            /// to occur, complete with a descriptive message logged as a comment.
            /// </Summary>
            /// <param name="obj" type="Object" optional="false">
            /// The object to be validated
            /// </param>
            /// <param name="iface" type="Object" optional="false">
            /// An object which provides the template (interface) that the passed 'obj' parameter
            /// should also implement.
            /// </param>

            if (this.implements(obj, iface)) {
                return;
            }

            var message = '';
            if (typeof obj !== typeof iface) {
                message = 'Object types do not match, expected:[' + typeof iface + '] actual:[' + typeof obj + ']\n';
            } else {
                message = 'The passed obj does not implement all of the operations of the passed.\niface: ' +
                        this._objToString(iface) + '\n--------------------\n';
                for (var name in iface) {
                    var match = true;
                    if (typeof iface[name] != typeof obj[name]) {
                        if (obj[name] === null || typeof obj[name] === 'undefined') {
                            message += '- Missing [' + name + ': ' + typeof iface[name];
                            if (typeof iface[name] === 'function') {
                                message += '(';
                                for (var lp = 0, l = iface[name].length; lp < l; lp++) {
                                    if (lp !== 0) {
                                        message += ', ';
                                    }
                                    message += 'arg' + lp;
                                }
                                message += ')';
                            }
                            message += ']\n';
                        } else if (obj[name] !== null) {
                            message += '- Different Type expected:[' + typeof iface[name] + '] actual:[' + typeof obj[name] + ']\n';
                        }
                    } else if (typeof iface[name] === 'function' && iface[name].length !== obj[name].length) {
                        message += '- (Warning) Different Number of expected parameters for function [' + name + '] expected:[' + iface[name].length + '] actual:[' + obj[name].length + ']\n';
                    }
                }
            }
            message += '--------------------\nobj: ' + this._objToString(obj) + '\n';
            tc.log(message);
            tc.fail(message);
        },

        capturePerfEvents: function (tc) {
            this._perfEvents = [];
            var me = this;

            NoShip.People.etw = function (message, params) {
                me._perfEvents.push([message, params]);
            };


            this.resetEvents = function () {
                this._perfEvents = [];
            };

            this.checkActionEvents = function (actionPrefix, expectedEvents, context) {
                function getAction(value) {
                    /// <returns type="String" />
                    if (value === undefined || value === null) {
                        return "";
                    }

                    if (value.toString) {
                        // just in case it's not a string :(
                        return value.toString();
                    }

                    return String(value);
                }

                function isMatch(type, event, expEvent) {
                    var message = event[0];
                    var params = event[1];

                    var prefix = actionPrefix;
                    if (expEvent.actionPrefix) {
                        prefix = expEvent.actionPrefix;
                    }
                    if ((prefix + type) == message) {
                        if (!expEvent.action) {
                            return true;
                        }
                        for (var key in params) {
                            if (key === "action") {
                                if (expEvent.action === getAction(params[key])) {
                                    return true;
                                }
                                break;
                            }
                        }
                    }
                    return false;
                }

                function formatOccurredEvents(perfEvents) {
                    var message = "";
                    for (var eLp = 0; eLp < perfEvents.length; eLp++) {
                        var prfEvent = perfEvents[eLp];
                        var evMessage = prfEvent[0];
                        var params = prfEvent[1];

                        //if (evMessage.indexOf(actionPrefix) != -1) {
                        message += "{message:" + evMessage;
                        for (var key in params) {
                            message += "; " + key + ":" + getAction(params[key]);


                        }
                        message += "}\n";
                        //}
                    }

                    return message;
                }

                for (var expIndex = 0, countEvents = expectedEvents.length; expIndex < countEvents; ++expIndex) {
                    var startCount = 0;
                    var endCount = 0;
                    var expEvent = expectedEvents[expIndex];

                    for (var perfEvent in this._perfEvents) {
                        var event = this._perfEvents[perfEvent];
                        if (isMatch("start", event, expEvent)) {
                            startCount++;
                        }
                        if (isMatch("end", event, expEvent)) {
                            endCount++;
                        }
                    }
                    var prefix = "Not all of the expected start perf event(s) are present.";
                    if (context) {
                        prefix += "\ncontext:" + context + ";";
                    }
                    prefix += "\naction:";
                    tc.areEqual(expEvent.count, startCount, prefix + expEvent.action + ";\nevents:" + formatOccurredEvents(this._perfEvents));
                    tc.areEqual(expEvent.count, endCount, prefix + expEvent.action + ";\nevents:" + formatOccurredEvents(this._perfEvents));
                };
            };
        }
    };
} ());
