/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../common/js/tracing.js' />
/// <reference path='../../common/js/errors.js' />
(function () {
    "use strict";

    /// <summary>
    /// Identifier that is used to indicate that relayed event is global.
    /// </summary>
    var appGlobalSource = "Win8App";

    /// <summary>
    /// Regular expressions that are used to check if target origin corresponds to supported domain.
    /// </summary>
    var allowedDomainsForTargetOrigin = /^(.+\.)?(bing|bing-int|staging-bing-int|working-bing-int|dev[147]-bing-int|prodmirror1-bing-int)\.com\/?$/i;

    /// <summary>
    /// Events handled by relay.
    /// </summary>
    var events = Object.freeze({
        /// <summary>
        /// This event can be used to add iframe listener for specific event. Event arguments 
        /// must be represented by an object in the following format:
        ///     {
        ///         eventName: /*Required. Name of the event to listen to*/
        ///         source: /*Optional. Object which corresponds to the source of the event; 
        ///                     if specified then subscriber will be notified about 
        ///                     the event only if event source matches this object. 
        ///                     Note that global events do not have a source and this 
        ///                     option is ignored for listeners registered for such 
        ///                     events.*/
        ///     }
        /// Event source must be set to the id that uniquely identifies the registered iframe. 
        /// Event source is required to be set; without it subscription will fail with error.
        /// </summary>
        subscribe: "eventrelay:subscribe",
        /// <summary>
        /// This event can be used to remove listener for specific event. Event arguments and 
        /// event source must be defined in exactly the same manner as for 'subscribe' event.
        /// </summary>
        unsubscribe: "eventrelay:unsubscribe",
    });

    function constructor() {
        /// <summary>
        /// Allocates a new instance of the BingApp.Classes.EventRelay class. 
        /// </summary>
        /// <returns type="BingApp.Classes.EventRelay">
        /// EventRelay instance.
        /// </returns>
        /// <remarks>
        /// EventRelay serves as a hub for raising and handling events. Events can originate from 
        /// web or app compartment via window.postMessage or EventRelay.fireEvent route respectively.
        /// In order to handle event the subscriber has to specify either a callback (if handling
        /// is done inside app compartment) or iframe (if handling is done inside web compartment).
        /// </remarks>
        if (!(this instanceof BingApp.Classes.EventRelay)) {
            BingApp.traceWarning("EventRelay.ctor: Attempted using EventRelay ctor as function; redirecting to use 'new EventRelay()'.");
            return new BingApp.Classes.EventRelay();
        }

        Object.defineProperties(this, {
            // This property contains object which maps all registered events to the array 
            // of listeners.
            eventRegistry: { value: {}, writable: false, enumerable: false, configurable: false },
            // This property contains object with all registered iframes.
            iframeRegistry: { value: {}, writable: false, enumerable: false, configurable: false },
        });
    }

    function registerIframe(id, iframe, targetOrigin) {
        /// <summary>
        /// Registers iframe that can use EventRelay to raise and/or listen to events.
        /// </summary>
        /// <param name="id" type="String">
        /// String representing iframe id. It has to be passed as value for event source 
        /// when raising an event. 
        /// </param>
        /// <param name="iframe">
        /// Iframe element that will be registered with EventRelay.
        /// </param>
        /// <param name="targetOrigin" type="String" optional="true">
        /// Indicates the target origin of the content displayed inside iframe; if not 
        /// specified then it is presumed that iframe's target origin corresponds to the 
        /// current host defined in app environment.
        /// </param>
        if (!iframe) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("iframe");
        }

        // Ensure that target origin is from allowed domains
        if (targetOrigin) {
            // Exclude query and fragment from analyzed origin because it does not matter 
            // for origin validation based on documentation for postMessage:
            // https://developer.mozilla.org/en/DOM/window.postMessage
            var targetOriginForValidation = targetOrigin;
            var indexQueryStart = targetOrigin.indexOf("?");
            if (indexQueryStart !== -1) {
                targetOriginForValidation = targetOrigin.substring(0, indexQueryStart);
            } else {
                var indexFragmentStart = targetOrigin.indexOf("#");
                if (indexFragmentStart !== -1) {
                    targetOriginForValidation = targetOrigin.substring(0, indexFragmentStart);
                }
            }

            // First, validate against host defined in BingApp.locator.env and app host
            if (!BingApp.Utilities.areEqualIgnoreCase(targetOriginForValidation, BingApp.locator.env.getHostUrl()) &&
                !BingApp.Utilities.areEqualIgnoreCase(targetOriginForValidation, window.location.protocol + "//" + window.location.host)) {
                // If we got here then origin has to come from whitelisted domains
                var host = new Windows.Foundation.Uri(targetOriginForValidation).host;
                if (!allowedDomainsForTargetOrigin.test(host)) {
                    throw new BingApp.Classes.ErrorArgument(
                        "targetOrigin",
                        BingApp.Utilities.format("Given targetOrigin '{0}' is not allowed for security reasons.", targetOrigin));
                }
            }
        }

        var iframeInfo = this.getRegisteredIframeInfo(id);
        if (iframeInfo) {
            if (iframeInfo.iframe !== iframe) {
                throw new BingApp.Classes.ErrorArgument("id", BingApp.Utilities.format("Cannot override existing registered provider '{0}'", id));
            } else {
                iframeInfo.targetOrigin = targetOrigin;

                BingApp.traceInfo("EventRelay.registerIframe: updated targetOrigin to '{0}' for registered subscriber '{1}'", targetOrigin, id);
            }
        } else {
            this.iframeRegistry[id] = {
                iframe: iframe,
                targetOrigin: targetOrigin,
            };

            BingApp.traceInfo("EventRelay.registerIframe: registered subscriber '{0}'", id);
        }
    }

    function unregisterIframe(id) {
        /// <summary>
        /// Unregisters iframe so it cannot longer raise and/or listen to events using this 
        /// instance of EventRelay.
        /// </summary>
        /// <param name="id" type="String">
        /// String representing iframe id. 
        /// </param>
        /// <remarks>
        /// This method will remove all events that iframe is subscribed to.
        /// </remarks>
        var iframeInfo = this.getRegisteredIframeInfo(id);
        if (iframeInfo) {
            // Remove registration information
            delete this.iframeRegistry[id];

            // Remove all subscriptions to events
            var registry = this.eventRegistry;
            Object.keys(registry).forEach(function (eventName) {
                var listeners = registry[eventName];
                for (var indexListener = listeners.length - 1; indexListener >= 0; indexListener--) {
                    var listener = listeners[indexListener];
                    if (listener.iframeId === id) {
                        listeners.splice(indexListener, 1);
                    }
                }
            });

            BingApp.traceInfo("EventRelay.unregisterIframe: unregistered iframe '{0}' and removed all its subscriptions to events.", id);
        } else {
            BingApp.traceError("EventRelay.unregisterIframe: there is no registered iframe '{0}'.", id);
        }
    }

    function getRegisteredIframeInfo(id) {
        /// <summary>
        /// Gets iframe information object associated with given id.
        /// </summary>
        /// <param name="id" type="String">
        /// String representing iframe id.
        /// </param>
        /// <returns>
        /// Object in the following format:
        ///     {
        ///         iframe: /*Iframe element that is associated with the subscription.*/
        ///         targetOrigin: /*Indicates the target origin of the content displayed 
        ///                         inside iframe; if not specified then it is presumed 
        ///                         that iframe's target origin corresponds to the current 
        ///                         host defined in app environment.*/
        ///     }
        /// Undefined is returned if there is no registered iframe with given id.
        /// </returns>
        if (!id) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("id");
        }

        return this.iframeRegistry[id];
    }

    function fireEvent(eventName, args, source) {
        /// <summary>
        /// Raises given event by notifying registered listeners.
        /// </summary>
        /// <param name="eventName" type="String">
        /// Name of the event to raise.
        /// </param>
        /// <param name="args" optional="true">
        /// Optional event-related data passed to the listeners.
        /// </param>
        /// <param name="source" optional="true">
        /// Object representing the source of the event. If omitted then event is global.
        /// </param>
        if (BingApp.Utilities.isNullOrUndefined(eventName)) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("eventName");
        }

        var listeners = this.eventRegistry[eventName];
        if (listeners && listeners.length > 0) {
            // IMPORTANT:   Create a copy of all listeners before calling them. This is to 
            //              account for possible case when listener unsubscribes from event
            //              after handling it. When we have copy we can guarantee that all 
            //              listeners will be called.
            var listenersCopy = [].concat(listeners);

            // The following section defines variables that are used in passing event as message
            // that is sent to iframe via window.postMessage API. These are used only if there is
            // at least one iframe listener.
            var defaultTargetOrigin = BingApp.locator.env.getHostUrl();
            var messageName = eventName;
            // Specifying original source of the event only if it is represented by a string;
            // otherwise, use global app identificator as message source.
            var messageSource = typeof source === "string" ? source : appGlobalSource;
            var messageValue = args;
            var message;
            var that = this;
            listenersCopy.forEach(function (listener) {
                // Check if listener wants to be notified about events coming from specific source
                if (BingApp.Utilities.isNullOrUndefined(listener.source) || source === listener.source) {
                    // Check if there is listener from app compartment
                    if (listener.callback) {
                        listener.callback(args, source);
                    }

                    // Check if there is listener from web compartment
                    var id = listener.iframeId;
                    if (!BingApp.Utilities.isNullOrUndefined(id)) {
                        var iframeInfo = that.getRegisteredIframeInfo(id);
                        if (!iframeInfo) {
                            BingApp.traceError("EventRelay.fireEvent: ignoring iframe listener with '{0}' id. There is no registration information with that id.", id);
                        } else {
                            // Initialize message only once
                            if (!message) {
                                try {
                                    message = JSON.stringify({ name: messageName, value: messageValue, from: messageSource });
                                } catch (error) {
                                    BingApp.traceError(
                                        "EventRelay.fireEvent: error while trying to stringify event '{0}'; replacing args with error information. Error name: '{1}'. Error message: '{2}'.",
                                        eventName,
                                        error.name,
                                        error.message);
                                    message = JSON.stringify({ name: messageName, error: { name: error.name, message: error.message }, from: messageSource });
                                }
                            }

                            var messageTargetOrigin = iframeInfo.targetOrigin || defaultTargetOrigin;

                            BingApp.traceInfo(
                                "EventRelay.fireEvent: relaying from app to web: '{0}'. Target origin is: '{1}'",
                                message,
                                messageTargetOrigin);

                            var iframe = iframeInfo.iframe;
                            if (iframe.contentWindow) {
                                iframe.contentWindow.postMessage(message, messageTargetOrigin);
                            } else {
                                BingApp.traceError("EventRelay.fireEvent: listener iframe '{0}' has a null or undefined contentWindow.", id);
                            }
                        }
                    }
                }
            });
        }
    }

    function addEventListener(eventName, listener) {
        /// <summary>
        /// Adds listener to be notified when given event is raised.
        /// </summary>
        /// <param name="eventName" type="String">
        /// Name of the event to register listener for.
        /// </param>
        /// <param name="listener">
        /// Object that will be notified when event is raised. This object can have the 
        /// following members defined:
        ///     {
        ///         source: /*object which corresponds to the source of the event; 
        ///                     if specified then listener will be notified about 
        ///                     the event only if event source matches this object. 
        ///                     Note that global events do not have a source and this 
        ///                     option is ignored for listeners registered for such 
        ///                     events.*/
        ///         callback: /*function to be called when event is raised; 
        ///                     event args will be passed as callback parameter.*/
        ///         iframeId: /*id of the registered iframe.*/
        ///     }
        /// </param>
        /// <remarks>
        /// This method allows for specifying callback function or iframe id instead 
        /// of listener object. The implementation checks the passed object and if it 
        /// determines that passed listener is a function then it creates a listener 
        /// object which sets its 'callback' property value to the passed function. 
        /// Similarly, if passed object represents iframe id then it is automatically 
        /// converted to a listener object which sets its 'iframeId' property value 
        /// to the passed iframe id.
        /// </remarks>
        if (BingApp.Utilities.isNullOrUndefined(eventName)) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("eventName");
        }

        listener = normalizeEventListener(listener);

        if (typeof listener.callback !== "function" && BingApp.Utilities.isNullOrUndefined(listener.iframeId)) {
            throw new BingApp.Classes.ErrorArgument("listener", WinJS.Resources.getString("error_event_listener_must_have_callback_or_iframe_id").value);
        }

        var listeners = this.eventRegistry[eventName];
        if (!listeners) {
            listeners = [];
            this.eventRegistry[eventName] = listeners;
        }

        listeners.push(listener);
    }

    function removeEventListener(eventName, listener) {
        /// <summary>
        /// Removes listener for the given event.
        /// </summary>
        /// <param name="eventName" type="String">
        /// Name of the event to remove listener for.
        /// </param>
        /// <param name="listener">
        /// Object that is notified when event is raised.
        /// </param>
        if (BingApp.Utilities.isNullOrUndefined(eventName)) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("eventName");
        }

        listener = normalizeEventListener(listener);

        var listeners = this.eventRegistry[eventName];
        if (listeners) {
            for (var indexListener = 0; indexListener < listeners.length; indexListener++) {
                var existingListener = listeners[indexListener];
                if (areEqualEventListeners(listener, existingListener)) {
                    listeners.splice(indexListener, 1);
                    return;
                }
            }
        }

        BingApp.traceWarning("EventRelay.removeEventListener: handler was not found for '{0}' event.", eventName);
    }

    function isRegisteredEventListener(eventName, listener) {
        /// <summary>
        /// Gets a value indicating whether given listener is registered for given event.
        /// </summary>
        /// <param name="eventName" type="String">
        /// Name of the event to check for.
        /// </param>
        /// <param name="listener">
        /// Listener object to check for.
        /// </param>
        /// <returns>
        /// True to indicate that given listener is registered to handle given event; otherwise, false.
        /// </returns>
        if (listener) {
            var listeners = this.eventRegistry[eventName];
            if (listeners) {
                listener = normalizeEventListener(listener);
                for (var indexListener = 0; indexListener < listeners.length; indexListener++) {
                    var existingListener = listeners[indexListener];
                    if (areEqualEventListeners(listener, existingListener)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    function normalizeEventListener(listener) {
        /// <summary>
        /// Converts given listener to the object properly formatted for EventRelay operations.
        /// </summary>
        /// <param name="listener">
        /// Listener object.
        /// </param>
        /// <returns>
        /// Normalized listener object.
        /// </returns>
        /// <remarks>
        /// This handles the case when listener is specified as a callback function or iframe element.
        /// </remarks>
        if (!listener) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("listener");
        }

        if (typeof listener === "function") {
            listener = {
                callback: listener
            };
        } else if (typeof listener === "string") {
            listener = {
                iframeId: listener
            };
        }

        return listener;
    }

    function areEqualEventListeners(listener1, listener2) {
        /// <summary>
        /// Gets a value indicating whether given listeners are equal.
        /// </summary>
        /// <param name="listener1">
        /// First listener to compare.
        /// </param>
        /// <param name="listener2">
        /// Second listener to compare.
        /// </param>
        /// <returns>
        /// True to indicate that given listeners are equal; otherwise, false.
        /// </returns>
        return (listener1 === listener2 ||
            (listener1 && 
            listener2 &&
            listener1.source === listener2.source &&
            listener1.callback === listener2.callback &&
            listener1.iframeId === listener2.iframeId));
    }

    var instanceMembers = {
        fireEvent: fireEvent,
        addEventListener: addEventListener,
        removeEventListener: removeEventListener,
        isRegisteredEventListener: isRegisteredEventListener,
        registerIframe: registerIframe,
        unregisterIframe: unregisterIframe,
        getRegisteredIframeInfo: getRegisteredIframeInfo,
    };

    var staticMembers = {
        normalizeEventListener: normalizeEventListener,
        areEqualEventListeners: areEqualEventListeners,
        events: events,
    };

    WinJS.Namespace.define("BingApp.Classes", {
        EventRelay: WinJS.Class.define(constructor, instanceMembers, staticMembers)
    });
})();