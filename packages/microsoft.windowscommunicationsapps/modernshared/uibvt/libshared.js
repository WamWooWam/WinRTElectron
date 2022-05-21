
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

Jx.delayDefine(BVT, ["Marks", "marks", "Test", "isVisible"], function () {

    // Marks is a class for listening and handling ETW events that get fired via msWriteProfilerMark.
    BVT.Marks = function () {
        this._callbacks = {};
        this._oldWPM = window.msWriteProfilerMark;

        var that = this;

        window.msWriteProfilerMark = function (msg) {
            if (msg in that._callbacks) {
                var fns = that._callbacks[msg];
                for (var i = fns.length - 1; i >= 0; i--) {
                    if (Tx.isUndefined(fns[i].many)) {
                        // No many set, so just fire the callback.
                        fns[i].fn(msg);
                    }
                    else {
                        if (fns[i].many === 1) {
                            // If many === 1, this means that we have observed the required number
                            // of events, so fire the callback.
                            fns[i].fn(msg);
                        }
                        fns[i].many--;
                        if (fns[i].many === 0) {
                            fns.splice(i, 1);
                        }
                    }
                }
            }

            that._oldWPM.call(window, msg);
        };
    };

    BVT.Marks.prototype = {
        _on: function (type, fn, count) {
            Tx.chkStrNE(type);
            Tx.chkFn(fn);

            var events = this._callbacks;

            // get or create the callbacks array
            var callbacks = (events[type] = events[type] || []);

            // add the callback
            callbacks.push({ fn: fn, many: count });
        },

        on: function (type, fn) {
            this._on(type, fn);
        },

        once: function (type, fn) {
            this._on(type, fn, 1);
        },

        off: function (type, fn) {
            Tx.chkStrNE(type);
            Tx.chkFn(fn);

            // TODO: assert if it's called from dispachEvent 

            // get the callbacks array
            var callbacks = this._txev[type];
            if (callbacks) {
                // find the callback
                var i = callbacks.indexOf(fn);
                if (i >= 0) {
                    // remove the callback
                    callbacks.splice(i, 1);
                }
            }
        },

        many: function (type, fn, count) {
            this._on(type, fn, count);
        },
    };

    // Function for defining tests. This allows us to set options that Tx sets for us by default and do
    // common setup.
    BVT.Test = function (name, options, fn) {
        
        // Set a default timeout for UI BVTs to be at least 30 seconds. Tests can override this by passing
        // in the corresponding parameter in the options object.
        Tx.config.timeoutMs = 30000;

        Tx.config.autoClose = true;

        // Log to the VS console (and to a file for WlxMon)
        Tx.config.useConsole = true;


        // Make sure the test debug console exists.
        var bvtConsole = $("#bvtConsole");
        if (!bvtConsole || bvtConsole.length === 0) {
            MSApp.execUnsafeLocalFunction(function () {
                // We need to leave space on right side of bvt console for the scrollbar and on the bottom for the app bar.
                document.body.insertAdjacentHTML("beforeend", "<div id='bvtConsole' onmouseover='this.style.opacity=1.0' onmouseout='this.style.opacity=0.5' style='opacity:0.5;font-size:10px;position:absolute;top:calc(100% - 210px);left:calc(100% - 320px);background-color:teal;z-index:100'><div id='bvtTestResults'>Results</div><textarea id='bvtText' style='font-size:10px;' rows='9' cols='11'></textarea></div>");                
            });
        }
        
        // Look for valid options
        if (!Tx.isFunction(fn)) {
            fn = options;
            // Create an options object and at minimum set a name property.
            options = {"name" : name};
        } else {
            Tx.chkObj(options);
            // Add the name property to each options group if present.
            // This makes it easier to do filtering.
            options.name = options.name || name;
        }

        if (options.disabled !== true) {
            if (options.data) {
                for (var i = 0, len = options.data.length; i < len; i++) {
                    // Data-driven test. TODO: Add more error handling.
                    var testName = name + "_" + options.data[i].iterationName;
                    Tx.asyncTest(testName, options, fn.bind(options.data[i]));
                }
            } else {
                Tx.asyncTest(name, options, fn);
            }
        }
    };

    self.TestApplication = self.TestApplication || {};

    // Toggle the state of the app bar. No state information is known/returned.
    TestApplication.ToggleAppBar = function () {
        WinJS.UI.AppBar._toggleAppBarEdgy(false);
    };

    // Check if a UI element appears onscreen
    BVT.isVisible = function (element) {
        if (element && element.style && element.style.visibility !== "hidden" && element.style.display !== "none") {

            // if the element isn't styled to be hidden, check if it isn't covered up by another div
            var rect = element.getBoundingClientRect(),
            x = (rect.left + rect.right) / 2,
            y = (rect.top + rect.bottom) / 2,
            onscreen = document.elementFromPoint(x, y);

            // The onscreen element could land inside the one we're looking for, so check its ancestors
            while(onscreen) {
                if (onscreen === element) {
                    return true;
                }
                else {
                    onscreen = onscreen.parentElement;
                }
            }
        }
        return false;
    };

    // MessageBar class.
    self.MessageBar = self.MessageBar || {};

    MessageBar = {
        get message() { return $(".mb-message")[0].innerText; },
        get messageHtml() { return $(".mb-message")[0].innerHTML; },
        get buttons() { return $(".mb-buttonsParent")[0].children; },
        get button1() { return $("#mb-button1"); },
        get button2() { return $("#mb-button2"); },
    };

    // Waits until the message bar appears.
    // Will time out after the specified number of milliseconds.
    MessageBar.waitUntilShown = function (timeout) {

        // If no timeout was specified, default to 3 seconds.
        if (!timeout) {
            timeout = 3000;
        }

        return new WinJS.Promise(function (complete, error) {
            var handle = setTimeout(function () {
                error("timeout waiting for MessageBar");
            }, timeout);

            BVT.marks.once("MessageBar.animation complete", function () {
                if (handle) {
                    // Cancel the timeout or we'll potentially call error() above.
                    clearTimeout(handle);
                }
                complete();
            });
        });
    };

    // Close all message bars. Don't stop until all are closed.
    MessageBar.closeAll = function () {
        // If the message bar isn't up, nothing to do.
        if (BVT.isVisible($(".messageBar")[0])) {
            return new WinJS.Promise(function (complete) {
                // Click the 'Close' button.
                $(".mb-button2")[0].click();
                setTimeout(function () {
                    complete();
                }, 1000);
            }).then(function () {
                MessageBar.closeAll();
            });
        }
    };

    // This is the default timeoutValue (ms) for usage in test-cleanup.
    // You can customize this in the Console window if you would like
    // your tests to wait longer between runs
    BVT.delayFinish = 100;

    BVT.marks = new BVT.Marks();
});

