/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../common/js/tracing.js' />
/// <reference path='../../common/js/errors.js' />
/// <reference path='eventrelay.js' />
(function () {
    "use strict";

    /// <summary>
    /// Events handled by global relay.
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

    function handleIframeSubscribe(args, source) {
        /// <summary>
        /// Handles subscribe event which is raised by iframe that wants to add
        /// itself as listener for specific event.
        /// </summary>
        /// <param name="args">
        /// Subscription-related data, must be an object in the following format:
        ///     {
        ///         eventName: /*Required. Name of the event to listen to*/
        ///         source: /*Optional. Object which corresponds to the source of the event; 
        ///                     if specified then subscriber will be notified about 
        ///                     the event only if event source matches this object. 
        ///                     Note that global events do not have a source and this 
        ///                     option is ignored for listeners registered for such 
        ///                     events.*/
        ///     }
        /// </param>
        /// <param name="source">
        /// Object representing the event source. For this event it has to be the iframe registration id. 
        /// </param>
        if (!args) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("args");
        }

        var eventName = args.eventName;
        if (BingApp.Utilities.isNullOrUndefined(eventName)) {
            throw new BingApp.Classes.ErrorArgument("args", "Event arguments object must have 'eventName' property.");
        }

        if (BingApp.Utilities.isNullOrUndefined(source)) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("source");
        }

        this.addEventListener(eventName, {
            iframeId: source,
            source: args.source
        });
    }

    function handleIframeUnsubscribe(args, source) {
        /// <summary>
        /// Handles unsubscribe event which is raised by iframe that wants to remove
        /// itself as listener for specific event.
        /// </summary>
        /// <param name="args">
        /// Subscription-related data, must be an object in the following format:
        ///     {
        ///         eventName: /*Required. Name of the event to listen to*/
        ///         source: /*Optional. Object which corresponds to the source of the event; 
        ///                     if specified then subscriber will be notified about 
        ///                     the event only if event source matches this object. 
        ///                     Note that global events do not have a source and this 
        ///                     option is ignored for listeners registered for such 
        ///                     events.*/
        ///     }
        /// </param>
        /// <param name="source">
        /// Object representing the event source. For this event it has to be the iframe registration id. 
        /// </param>
        if (!args) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("args");
        }

        var eventName = args.eventName;
        if (BingApp.Utilities.isNullOrUndefined(eventName)) {
            throw new BingApp.Classes.ErrorArgument("args", "Event arguments object must have 'eventName' property.");
        }

        if (BingApp.Utilities.isNullOrUndefined(source)) {
            throw new BingApp.Classes.ErrorArgumentNullOrUndefined("source");
        }

        this.removeEventListener(eventName, {
            iframeId: source,
            source: args.source
        });
    }

    /// <summary>
    /// Defines global event relay that can handle messages posted from web compartment.
    /// </summary>
    var GlobalEventRelay = WinJS.Class.derive(
        BingApp.Classes.EventRelay,
        function constructor(window) {
            /// <summary>
            /// Allocates a new instance of the BingApp.Classes.GlobalEventRelay class. 
            /// </summary>
            /// <param name="window">
            /// The window object which messages will be handled by relay.
            /// </param>
            /// <returns type="BingApp.Classes.GlobalEventRelay">
            /// GlobalEventRelay instance.
            /// </returns>
            /// <remarks>
            if (!(this instanceof BingApp.Classes.GlobalEventRelay)) {
                BingApp.traceWarning("GlobalEventRelay.ctor: Attempted using GlobalEventRelay ctor as function; redirecting to use 'new GlobalEventRelay()'.");
                return new BingApp.Classes.GlobalEventRelay(window);
            }

            if (!window) {
                throw new BingApp.Classes.ErrorArgumentNullOrUndefined("window");
            }

            BingApp.Classes.EventRelay.call(this);

            // Listen to events posted by web compartment. Event is posted via message object which
            // has the following properties:
            //      var message = {
            //          name: /*Required. Specifies event name.*/
            //          value: /*Optional. Specifies event arguments.*/
            //          from: /*Optional. Specifies event source.*/
            //      };
            var that = this;
            window.addEventListener("message", function (event) {
                var message;
                try {
                    message = JSON.parse(event.data);
                } catch (error) {
                    BingApp.traceError(
                        "GlobalEventRelay.onwindowmessage: error while parsing message data: '{0}'. Error message: '{1}'.",
                        event.data,
                        error.message);
                    return;
                }

                if (!message)
                {
                    BingApp.traceError("GlobalEventRelay.onwindowmessage: message was parsed into null object.");
                } else if (BingApp.Utilities.isNullOrUndefined(message.name)) {
                    BingApp.traceError("GlobalEventRelay.onwindowmessage: message does not have 'name' member: '{0}'.", event.data);
                } else {
                    BingApp.traceInfo("GlobalEventRelay.onwindowmessage: relayed from web to app: '{0}'.", event.data);
                    that.fireEvent(message.name, message.value, message.from);
                }
            }, false);

            // Listen to subscribe/unsubscribe events that can be used by web compartment to add/remove
            // iframe as event listener
            this.addEventListener(events.subscribe, function (args, source) {
                handleIframeSubscribe.call(that, args, source);
            });
            this.addEventListener(events.unsubscribe, function (args, source) {
                handleIframeUnsubscribe.call(that, args, source);
            });
        },
        {
        },
        {
            events: events,
        });

    // Expose GlobalEventRelay class via application namespace
    WinJS.Namespace.define("BingApp.Classes", {
        GlobalEventRelay: GlobalEventRelay
    });
})();