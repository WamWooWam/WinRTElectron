
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Microsoft,Jx,Calendar,Debug,clearTimeout,setTimeout*/

(function() {

    function _info(evt) { Jx.mark('Calendar:AgendaWorker.' + evt + ',Info,Calendar'); }
    function _start(evt) { Jx.mark('Calendar:AgendaWorker.' + evt + ',StartTA,Calendar'); }
    function _stop(evt) { Jx.mark('Calendar:AgendaWorker.' + evt + ',StopTA,Calendar'); }

    var AgendaHelpers = Calendar.Views.AgendaHelpers;
    var CollectionChangeType = Microsoft.WindowsLive.Platform.CollectionChangeType;

    var AgendaWorker = Calendar.Views.AgendaWorker = function(router, scheduler, calendarManager) {
        /// <summary>Initializes a new Agenda Worker object</summary>
        /// <param name="router">The command router object</param>
        /// <param name="scheduler">The scheduler object</param>
        /// <param name="calendarManager">The calendar manager instance</param>
        this._router    = router;
        this._scheduler = scheduler;
        this._manager   = calendarManager;

        // Initialize the request map
        this._requests = {};

        // Register the worker's routes
        this._router.route('Agenda/getEvents', this.getEvents, this);
        this._router.route('Agenda/cancel', this.cancel, this);

        // Perform static initialization
        if (!AgendaWorker._allAgendaMore) {
            AgendaHelpers.ensureInitialized();
        }
    };
    
    var proto = AgendaWorker.prototype;

    // The number of milliseconds to wait for new events before sending the updates to the UI
    AgendaWorker.SEND_WAIT_TIME = 1000;

    // The maximum length of the change queue, attempting to keep messages below 100KB (events run about 600-800 characters each)
    AgendaWorker.MAX_QUEUE_LENGTH = 50;

    proto.getEvents = function(command) {
        /// <summary>Queries the platform for all events within a given range and monitors for changes</summary>
        /// <param name="command">The command object containing the call parameters</param>
        Debug.assert(Jx.isUndefined(this._requests[command.id]), 'Jx.isUndefined(this._requests[command.id])');

        _start('getEvents');

        var id   = command.id;
        var data = command.data;

        // Update the command data
        data.id    = id;
        data.start = new Date(data.start);
        data.end   = new Date(data.end);

        // Initialize the collections
        data.changeQueue = [];
        data.eventMap = {};

        // Query the platform and schedule the processing job
        data.collection = this._manager.getEvents(data.start, data.end);
        data.job        = this._scheduler.schedule(this._processEvents, this, [data], true);

        // Store the new request in the map
        this._requests[id] = data;

        _stop('getEvents');
    };

    proto.cancel = function(command) {
        /// <summary>Cancels an existing "getEvents" request</summary>
        /// <param name="command">The command object containing the call parameters</param>
        _start('cancel');

        var id   = command.id,
            data = this._requests[id];

        if (data) {
            // Cancel any outstanding jobs
            this._scheduler.cancel(data.job);
            data.job = null;

            // Cancel any outstanding send timers
            if (data.changeTimeout) {
                clearTimeout(data.changeTimeout);
                data.changeTimeout = null;
            }

            // Unhook all events
            this._unhookEvents(data);

            // Detach the collection change handler
            if (data.onCollectionChanged) {
                data.collection.removeEventListener('collectionchanged', data.onCollectionChanged);
                data.onCollectionChanged = null;
            }

            // Dispose the collection
            data.collection.dispose();
            data.collection = null;

            // Release the data structures
            data.changeQueue = null;
            data.eventMap = null;

            // Delete the request from the map
            delete this._requests[command.id];
        }

        _stop('cancel');
    };

    proto.dispose = function() {
        Object.keys(this._requests).forEach(function (key) {
            this.cancel({ id: key });
        }, this);

        this._requests = null;

        this._manager   = null;
        this._scheduler = null;
        this._router    = null;
    };

    proto._processEvents = function (data) {
        /// <summary>Process the initial set of events and push them to the UI</summary>
        /// <param name="data">The current data context</param>
        _start('_processEvents');

        var collection = data.collection;
        var count = collection.count;

        for (var i = 0; i < count; i++) {
            var event = collection.item(i);

            if (event) {
                // Process the event
                var wrapper = AgendaHelpers.wrapEvent(data.start, data.end, event);

                // Enqueue the added event
                this._enqueueChange(data, AgendaHelpers.ChangeType.add, wrapper);

                // Hook up the event listeners
                this._hookEvent(data, event);
            }
        }

        _info('_processEvents:count=' + count);

        // Push the changes to the UI immediately
        this._sendChanges(data);

        // Attach the collection change handler
        data.onCollectionChanged = this._onCollectionChanged.bind(this, data);
        collection.addEventListener('collectionchanged', data.onCollectionChanged);
        
        // Unlock the collection so we can start receiving updates
        collection.unlock();

        // Signal that we have completed the initial batch of processing
        this._sendGetEvents(data);

        _stop('_processEvents');
    };

    proto._enqueueChange = function (data, changeType, changeInfo) {
        /// <summary>Enqueue a new event change, scheduling a send if necessary</summary>
        /// <param name="data">The current data context</param>
        /// <param name="changeType">The ChangeType to add to the queue</param>
        /// <param name="changeInfo">The info object related to the change</param>
        _start('_enqueueChange');

        data.changeQueue.push({
            type: changeType,
            info: changeInfo,
        });

        // If there isn't already a timeout scheduled, schedule one now
        if (!data.changeTimeout) {
            data.changeTimeout = setTimeout(this._sendChanges.bind(this, data), AgendaWorker.SEND_WAIT_TIME);
        }

        // If the queue gets too long, force a send now so we don't overload the message channel
        if (data.changeQueue.length >= AgendaWorker.MAX_QUEUE_LENGTH) {
            this._sendChanges(data);
        }

        _stop('_enqueueChange');
    };

    proto._sendChanges = function(data) {
        /// <summary>Send the pending changes to the UI, cancelling any pending change timers</summary>
        /// <param name="data">The current data context</param>
        /// <remarks>Calling this with no pending changes will still send an empty change notification, this is used to signal the first-load of the UI</remarks>
        _start('_sendChanges');

        // If there's already a timeout scheduled, make sure to cancel it now
        if (data.changeTimeout) {
            clearTimeout(data.changeTimeout);
            data.changeTimeout = null;
        }

        _info('_sendChanges:queueLength=' + data.changeQueue.length);

        this._router.postMessage({
            command: 'Agenda/eventsChanged',
            id:      data.id,

            changes: data.changeQueue,
        });

        // Reset the queue
        data.changeQueue = [];

        _stop('_sendChanges');
    };

    proto._sendGetEvents = function (data) {
        /// <summary>Signal to the UI that we have already processed and dispatched the initial batch of changes</summary>
        /// <param name="data">The current data context</param>
        _start('_sendGetEvents');

        this._router.postMessage({
            command: 'Agenda/getEvents',
            id:      data.id
        });

        _stop('_sendGetEvents');
    };

    proto._hookEvent = function (data, event) {
        /// <summary>Hooks up handlers to a single event</summary>
        /// <param name="data">The current data context</param>
        /// <param name="event">The WinRT event object to attach handlers to</param>
        Debug.assert(Jx.isObject(data), 'Jx.isObject(data)');
        Debug.assert(Jx.isObject(data.eventMap), 'Jx.isObject(data.eventMap)');
        Debug.assert(Jx.isObject(event), 'Jx.isObject(event)');
        Debug.assert(Jx.isUndefined(data.eventMap[event.objectId]), 'Jx.isUndefined(data.eventMap[event.objectId])');

        _start('_hookEvent');

        // Bind a change handler, if necessary
        if (!data.onItemChanged) {
            data.onItemChanged = this._onItemChanged.bind(this, data);
        }

        // Attach the event listener and store the event in the map by object ID
        event.addEventListener('changed', data.onItemChanged);
        data.eventMap[event.objectId] = event;

        _stop('_hookEvent');
    };

    proto._unhookEvents = function (data) {
        /// <summary>Unhook the events from all cached event objects</summary>
        /// <param name="data">The current data context</param>
        _start('_unhookEvents');

        // Unhook all event handlers from the events
        Object.keys(data.eventMap).forEach(function(key) {
            this._unhookEvent(data, key);
        }, this);

        // Release the item change handler reference
        data.onItemChanged = null;

        _stop('_unhookEvents');
    };

    proto._unhookEvent = function (data, objectId) {
        /// <summary>Hooks up handlers to a single event</summary>
        /// <param name="data">The current data context</param>
        /// <param name="objectId">The object ID of the event to detach handlers from</param>
        Debug.assert(Jx.isObject(data), 'Jx.isObject(data)');
        Debug.assert(Jx.isNonEmptyString(objectId), 'Jx.isNonEmptyString(objectId)');
        Debug.assert(Jx.isFunction(data.onItemChanged), 'Jx.isFunction(data.onItemChanged)');
        Debug.assert(Jx.isObject(data.eventMap), 'Jx.isObject(data.eventMap)');

        _start('_unhookEvent');

        // Find the event in the map and delete it
        var event = data.eventMap[objectId];
        delete data.eventMap[objectId];

        if (event) {
            Debug.assert(Jx.isObject(event), 'Jx.isObject(event)');
            Debug.assert(Jx.isFunction(event.removeEventListener), 'Jx.isFunction(event.removeEventListener)');

            event.removeEventListener('changed', data.onItemChanged);
        }

        _stop('_unhookEvent');
    };

    // Updates

    proto._onCollectionChanged = function (data, ev) {
        /// <summary>Handles collectionchanged events for the calendar event collection</summary>
        /// <param name="data">The current data context</param>
        /// <param name="ev">The event arguments</param>
        Debug.assert(Jx.isObject(data), 'Jx.isObject(data)');
        Debug.assert(Jx.isObject(ev), 'Jx.isObject(ev)');
        Debug.assert(Jx.isValidNumber(ev.eType), 'Jx.isValidNumber(ev.eType)');

        switch (ev.eType) {
            case CollectionChangeType.itemAdded:
                Debug.assert(Jx.isValidNumber(ev.index), 'Jx.isValidNumber(ev.index)');
                Debug.assert(Jx.isObject(ev.target), 'Jx.isObject(ev.target)');

                var collection = ev.target;
                collection.lock();
                
                var event = collection.item(ev.index);

                if (event) {
                    // Process the event
                    var wrapper = AgendaHelpers.wrapEvent(data.start, data.end, event);

                    // Enqueue the added event
                    this._enqueueChange(data, AgendaHelpers.ChangeType.add, wrapper);

                    // Hook up event handlers
                    this._hookEvent(data, event);
                }

                collection.unlock();
                break;

            case CollectionChangeType.itemRemoved:
                Debug.assert(Jx.isNonEmptyString(ev.objectId), 'Jx.isNonEmptyString(ev.objectId)');

                // Capture the object ID
                var objectId = ev.objectId;

                // Unhook events
                this._unhookEvent(data, objectId);

                // Enqueue the removed event
                this._enqueueChange(data, AgendaHelpers.ChangeType.remove, { objectId: objectId });
                break;
        }
    };

    proto._onItemChanged = function (data, ev) {
        /// <summary>Handles changed events for a calendar event object</summary>
        /// <param name="data">The current data context</param>
        /// <param name="ev">The event arguments</param>
        Debug.assert(Jx.isObject(ev), 'Jx.isObject(ev)');
        Debug.assert(Jx.isArray(ev.detail), 'Jx.isArray(ev.detail)');
        Debug.assert(Jx.isObject(ev.detail[0]), 'Jx.isObject(ev.detail[0])');

        // Get the list of changes from the event details
        var changes = ev.detail[0];
        Debug.assert(Jx.isValidNumber(changes.length) && changes.length > 0, 'Jx.isValidNumber(changes.length) && changes.length > 0');

        for (var i = 0, len = changes.length; i < len; i++) {
            Debug.assert(Jx.isNonEmptyString(changes[i]), 'Jx.isNonEmptyString(changes[i])');

            switch (changes[i]) {
                case 'startDate':
                case 'endDate':
                case 'busyStatus':
                case 'allDayEvent':
                case 'subject':
                case 'location':
                case 'color':
                    // Capture the event object
                    var event = ev.target;

                    // Process the event
                    var wrapper = AgendaHelpers.wrapEvent(data.start, data.end, event);

                    // Enqueue the update
                    this._enqueueChange(data, AgendaHelpers.ChangeType.change, wrapper);

                    // Once we find a single change we recognize, there's no need to look further
                    return;
            }
        }
    };

})();

