
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

var DOMxImpl = function (doc) {
    this._document = doc || document;
    this._window = this._document.defaultView;
    this._domEvents = [];
    this._eventLog = [];
    this._immediateQueue = [];
    this._sessionId = 0;
    this._listenerWrapperMap = {};

    var that = this;

    this._window.originalSetImmediate = this._window.setImmediate;
    this._window.setImmediate = function (callback, args) {
        that._immediateQueue.push({ callback: callback, args: args });
    };

    // Establish namespace in all prototype locations
    var elementPrototype = this._window.Element.prototype,
        originalAddEventListener = elementPrototype.addEventListener,
        originalRemoveEventListener = elementPrototype.removeEventListener;
    elementPrototype.addEventListener = function (type, listener, useCapture) {
        /// <summary>Wraps the default addEventListener.</summary>
        /// <param name="type" type="String" optional="false">The type of event to listen for.</param>
        /// <param name="listener" type="Function" optional="false">The function to execute when the event is fired.</param>
        /// <param name="useCapture" type="Boolean" optional="false">True if the event should be captured, false if it should be bubbled.</param>
        // Log the event
        that._eventLog.push({
            arguments: arguments,
            functionName: "addEventListener",
            target: this
        });

        // Add a wrapped version of the listener to the DOM
        originalAddEventListener.call(this, type, that._getEventListenerWrapper(listener), useCapture);
    };
    elementPrototype.removeEventListener = function (type, listener, useCapture) {
        /// <summary>Wraps the default removeEventListener.</summary>
        /// <param name="type" type="String" optional="false">The type of event to listen for.</param>
        /// <param name="listener" type="Function" optional="false">The function to execute when the event is fired.</param>
        /// <param name="useCapture" type="Boolean" optional="false">True if the event should be captured, false if it should be bubbled.</param>
        // Log the event
        that._eventLog.push({
            arguments: arguments,
            functionName: "removeEventListener",
            target: this
        });

        // Remove the wrapped version of the listener from the DOM
        originalRemoveEventListener.call(this, type, that._listenerWrapperMap[listener], useCapture);
    };

    var eventPrototype = this._window.Event.prototype,
        originalPreventDefault = eventPrototype.preventDefault;
    eventPrototype.DOMx = {};
    eventPrototype.preventDefault = function () {
        /// <summary>Replaces the preventDefault of events.</param>
        // Mark the event as cancelled so we stop its propogation
        this.DOMx.defaultPrevented = true;

        // Attempt to call the actual prevent default as well
        originalPreventDefault.call(this);
    };
};

DOMxImpl.prototype.clearEventLogs = function () {
    this._domEvents = [];
    this._eventLog = [];
};

DOMxImpl.prototype.dispatchEvent = function (target, event) {
    /// <summary>Fires a fake event on the given target - only needed if faking events that wouldn't be trusted.</summary>
    /// <param name="target" type="HTMLElement">The element to dispatch the event on.</param>
    /// <param name="event" type="Event">The event to dispatch</param>
    /// <returns type="Boolean">True to say default action is permitted.  False if the caller should prevent the default action.</returns>
    event.DOMx.defaultPrevented = false;
    event.DOMx.domxEvent = true;
    return (target.dispatchEvent(event) && !event.defaultPrevented && !event.DOMx.defaultPrevented);
};

DOMxImpl.prototype.endSession = function () {
    /// <summary>Marks the end of a session.</summary>

    // Increment the session id
    this._sessionId++;

    // Clear event logs
    this.clearEventLogs();
};

DOMxImpl.prototype.fireKeyEvent = function (eventType, target, options) {
    /// <summary>Fires a key event.</summary>
    /// <param name="eventType" type="String">The name of the key event to fire.</param>
    /// <param name="target" type="HTMLElement">The element to fire the event at.</param>
    /// <param name="options" type="Object">Collection of options for the key stroke.</param>
    /// <returns type="Boolean">True to say default action is permitted.  False if the caller should prevent the default action.</returns>

    // Build the events as UI events, as we can't modify all the properties of keyboard events
    var e = this._document.createEvent("UIEvent");
    e.initUIEvent(eventType, true, true, this._window, 0);

    // Assign appropriate keycode if available, or 231 for the IHM if not
    var key = options.key || "",
        keyCode = options.keyCode || Jx.KeyCode[key.toLowerCase()] || 231;

    // Assign all the expected properties
    e.altKey = options.alt || false;
    e.char = key;
    e.charCode = 0;
    e.ctrlKey = options.ctrl || false;
    e.DOM_KEY_LOCATION_JOYSTICK = 5;
    e.DOM_KEY_LOCATION_LEFT = 1;
    e.DOM_KEY_LOCATION_MOBILE = 4;
    e.DOM_KEY_LOCATION_NUMPAD = 3;
    e.DOM_KEY_LOCATION_RIGHT = 2;
    e.DOM_KEY_LOCATION_STANDARD = 0;
    e.key = key;
    e.keyCode = keyCode;
    e.locale = "en-US"
    e.location = 0;
    e.metaKey = false;
    e.shiftKey = options.shift || false;
    e.which = keyCode;

    // Fire the actual event
    return this.dispatchEvent(target, e);
};

DOMxImpl.prototype.flushImmediateQueue = function () {
    /// <summary>Flushes any functions queued in a setImmediate call.</summary>
    var queueElement;
    while (this._immediateQueue.length > 0) {
        queueElement = this._immediateQueue.shift();
        queueElement.callback.apply(this._window, queueElement.args);
    }
};

DOMxImpl.prototype.simulateKeyStroke = function (options) {
    /// <summary>Simulates firing keystrokes in the DOM.  Events will be fired assuming the focus and selection are normalized.</summary>
    /// <param name="options" type="Object">Collection of options for the key stroke.</param>
    /// <returns type="Boolean">True to say default action is permitted.  False if the caller should prevent the default action.</returns>
    // Get the current target
    var target = this._document.activeElement,
        defaultPrevented = true;
    // Fire a keyDown event
    if (this.fireKeyEvent("keydown", target, options)) {
        // If it was not cancelled, fire a keyPress event
        if (this.fireKeyEvent("keypress", target, options)) {
            // If it was not cancelled attempt to execute the keystroke
            defaultPrevented = false;
            var selObj = this._document.getSelection();
            if (selObj.rangeCount > 0) {
                var selectionRange = selObj.getRangeAt(0),
                    key = options.key || "";
                if (key.toLowerCase() === "backspace") {
                    if (selectionRange.collapsed) {
                        // There was collapsed selection, so we need to try to delete the previous character
                        // TODO: Add support for simulating a backspace key on an empty selection
                    } else {
                        // There was a non-collapsed selection, so all we need to is delete it
                        selectionRange.deleteContents();
                    }
                } else if (!options.alt && !options.ctrl && key.length < 3) {
                    // Assume we are typing a character (or 2 for special IHM cases)
                    // First delete the existing contents
                    selectionRange.deleteContents();
                    // Now attempt to insert the character
                    selectionRange.insertNode(this._document.createTextNode(options.shift ? key.toUpperCase() : key));
                    selectionRange.collapse(false);
                    selObj.removeAllRanges();
                    selObj.addRange(selectionRange);
                }
            }
        }
    }
    // Fire any events that have been queued with setImmediate
    this.flushImmediateQueue();
    // Finally fire a keyUp event
    this.fireKeyEvent("keyup", target, options);
    // And return if the keystroke was blocked
    return !defaultPrevented;
};

DOMxImpl.prototype.simulateKeyStrokes = function (stringToType) {
    /// <summary>Attempts to simulate typing all keystrokes needed to simulate the given string.</summary>
    /// <param name="stringToType" type="String">The string to simulate.</param>
    var char;
    for (var m = 0, len = stringToType.length; m < len; m++) {
        char = stringToType[m];
        this.simulateKeyStroke({ key: char, shift: char === char.toUpperCase() });
    }
};

DOMxImpl.prototype._getEventListenerWrapper = function (listener) {
    /// <summary>Generates a wrapper for an event listener</summary>
    /// <param name="listener" type="Function" optional="false">The function to execute when the event is fired.</param>
    var currentSession = this._sessionId,
        that = this;

    var wrappedFunction = function (e) {
        if (currentSession === that._sessionId) {
            e.isTrusted = true;
            // Log the event
            that._domEvents.push({
                blocked: false,
                event: e,
                listener: listener
            });
            // And fire the listener
            listener(e);
        } else {
            // Log that we blocked the event
            that._domEvents.push({
                blocked: true,
                event: e
            });
        }
    };
    this._listenerWrapperMap[listener] = wrappedFunction;
    return wrappedFunction;
};

DOMx = new DOMxImpl();