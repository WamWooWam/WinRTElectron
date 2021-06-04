/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='tracing.js' />
/// <reference path='utilities.js' />
/// <reference path='errors.js' />
/// <reference path='../../shell/js/eventrelay.js' />
/// <reference path='../../shell/js/servicelocator.js' />
(function () {
    "use strict";

    /// <summary>
    /// Defines class that implements common pattern for exposing events to external subscribers.
    /// </summary>
    var EventSource = WinJS.Class.define(
        function () {
            /// <summary>
            /// Creates an EventSource object.
            /// </summary>
            /// <returns type="BingApp.Classes.EventSource">
            /// EventSource instance.
            /// </returns>
            if (!(this instanceof BingApp.Classes.EventSource)) {
                BingApp.traceWarning("EventSource.ctor: Attempted using EventSource ctor as function; redirecting to use 'new EventSource()'.");
                return new BingApp.Classes.EventSource();
            }

            // Private properties defined on object level
            Object.defineProperties(this, {
                eventRelay: { value: new BingApp.Classes.EventRelay(), writable: false, enumerable: false, configurable: false }
            });
        },
        {
            registerIframe: function (id, iframe, targetOrigin) {
                /// <summary>
                /// Registers iframe that can listen to events raised by this instance.
                /// </summary>
                /// <param name="id" type="String">
                /// String representing iframe id.
                /// </param>
                /// <param name="iframe">
                /// Iframe element that will be registered with this instance.
                /// </param>
                /// <param name="targetOrigin" type="String" optional="true">
                /// Indicates the target origin of the content displayed inside iframe; if not 
                /// specified then it is presumed that iframe's target origin corresponds to the 
                /// current host defined in app environment.
                /// </param>
                this.eventRelay.registerIframe(id, iframe, targetOrigin);
            },
            unregisterIframe: function (id) {
                /// <summary>
                /// Unregisters iframe so it cannot longer listen to events raised by this instance.
                /// </summary>
                /// <param name="id" type="String">
                /// String representing iframe id. 
                /// </param>
                /// <remarks>
                /// This method will remove all events that iframe is subscribed to.
                /// </remarks>
                this.eventRelay.unregisterIframe(id);
            },
            getRegisteredIframeInfo: function (id) {
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
                return this.eventRelay.getRegisteredIframeInfo(id);
            },
            fireEvent: function (eventName, args) {
                /// <summary>
                /// Raises given event by notifying registered listeners and passes given arguments 
                /// as callback parameter.
                /// </summary>
                /// <param name="eventName" type="String">
                /// Name of the event to raise.
                /// </param>
                /// <param name="args" optional="true">
                /// Optional event-related data passed to the registered listeners.
                /// </param>
                this.eventRelay.fireEvent(eventName, args, this);
            },
            addEventListener: function (eventName, listener) {
                /// <summary>
                /// Adds listener to be notified when given event is raised by this object.
                /// </summary>
                /// <param name="eventName" type="String">
                /// Name of the event to register listener for.
                /// </param>
                /// <param name="listener">
                /// Object that will be notified when event is raised. This object can have 
                /// the following members defined:
                ///     {
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
                var extendedListener = this._createExtendedListener(listener);
                this.eventRelay.addEventListener(eventName, extendedListener);
            },
            removeEventListener: function (eventName, listener) {
                /// <summary>
                /// Removes listener for the given event.
                /// </summary>
                /// <param name="eventName" type="String">
                /// Name of the event to remove listener for.
                /// </param>
                /// <param name="listener">
                /// Object that is notified when event is raised.
                /// </param>
                var extendedListener = this._createExtendedListener(listener);
                this.eventRelay.removeEventListener(eventName, extendedListener);
            },
            isRegisteredEventListener: function (eventName, listener) {
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
                var extendedListener = this._createExtendedListener(listener);
                return this.eventRelay.isRegisteredEventListener(eventName, extendedListener);
            },
            _createExtendedListener: function (listener) {
                /// <summary>
                /// Extends given listener by appending source member that points to this instance.
                /// </summary>
                /// <param name="listener">
                /// Listener object that will be extended.
                /// </param>
                /// <returns>
                /// Listener object containing source member referencing this object.
                /// </returns>
                if (BingApp.Utilities.isNullOrUndefined(listener)) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("listener");
                }

                if (!BingApp.Utilities.isNullOrUndefined(listener.source)) {
                    throw new BingApp.Classes.ErrorArgument("listener", WinJS.Resources.getString("error_listener_must_not_have_explicit_source").value);
                }

                listener = BingApp.Classes.EventRelay.normalizeEventListener(listener);

                var extendedListener = Object.create(listener);
                Object.defineProperty(extendedListener, "source", { value: this });

                return extendedListener;
            }
        });

    // Expose EventSource class via application namespace
    WinJS.Namespace.define("BingApp.Classes", {
        EventSource: EventSource
    });
})();
