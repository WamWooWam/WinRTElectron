
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/

/// <reference path="..\..\common\common.js" />
/// <reference path="..\Helpers\Helpers.js" />

/*global window,document,Microsoft,WinJS,Debug,Jx,Calendar,People*/

Jx.delayDefine(Calendar.Views, 'Agenda', function () {

    function _start(evt) { Jx.mark('Calendar:Agenda.' + evt + ',StartTA,Calendar'); }
    function _stop(evt) { Jx.mark('Calendar:Agenda.' + evt + ',StopTA,Calendar'); }
    function _startAsync(evt) { Jx.mark('Calendar:Agenda.' + evt + ',StartTM,Calendar'); }
    function _stopAsync(evt) { Jx.mark('Calendar:Agenda.' + evt + ',StopTM,Calendar'); }

    //
    // Namespaces
    //

    var AgendaHelpers = Calendar.Views.AgendaHelpers;
    var ErrorPriority = Microsoft.WindowsLive.Platform.Calendar.ErrorPriority;
    var Helpers = Calendar.Helpers;
    var Templates = Calendar.Templates.Agenda;
    
    var Animation = WinJS.UI.Animation;

    //
    // Agenda View
    //

    var Agenda = Calendar.Views.Agenda = function () {
        /// <summary>Initializes a new Agenda view object</summary>
        _start('ctor');

        this.initComponent();
        this._id = 'calAgenda';

        this._firstRun = true;

        // do some one-time initialization
        if (!Agenda._name) {
            Helpers.ensureFormats();
            AgendaHelpers.ensureInitialized();

            Agenda._name = 'Calendar.Views.Agenda';

            // localization
            Agenda._backgroundError = Jx.res.getString('AgendaBackgroundError');
            Agenda._noEvents = Jx.res.getString('AgendaNoEvents');
            Agenda._seeMoreEvents = Jx.res.getString('AgendaSeeMoreEvents');

            Agenda._accAgendaAllDay = { format: Jx.res.getFormatFunction('AccAgendaAllDay') };
            Agenda._accAgendaAllDaySeeMore = Jx.res.getString('AccAgendaAllDaySeeMore');

            Agenda._allDayMore = { format: Jx.res.getFormatFunction('AllDayMore') };

            Agenda._dateWithDay = new Jx.DTFormatter('dayofweek month day');
            Agenda._dateWithDayAbbr = new Jx.DTFormatter('dayofweek.abbreviated month.abbreviated day');
            Agenda._monthWithYear = new Jx.DTFormatter('month year');
        }

        // The background component
        this._background = new Calendar.Views.AgendaBackground();
        this.append(this._background);

        // Initialize the timestamps
        this._now = Calendar.getMinute();
        this._today = AgendaHelpers.getDayFromDate(this._now);

        // Initialize the state members
        this._state = null;

        this._idsCalendar = null;
        this._upNextHeroItem = null;
        this._layoutType = Agenda.LayoutType.none;
        this._listView = null;
        this._getEventsCompleted = false;

        // Bind event handlers
        this._onAppBarBeforeShow = this._onAppBarBeforeShow.bind(this);

        this._onListItemInserted = this._onListItemInserted.bind(this);
        this._onListItemRemoved = this._onListItemRemoved.bind(this);

        this._onListViewLoadingStateChanged = this._onListViewLoadingStateChanged.bind(this);
        this._onListViewItemInvoked = this._onListViewItemInvoked.bind(this);

        this._onHeroDateInvoked = this._onHeroDateInvoked.bind(this);
        this._onHeroAllDayInvoked = this._onHeroAllDayInvoked.bind(this);

        // Unique identifier counter
        this._uid = 0;

        // Create maps
        this._objectIdMap = {};
        this._handleMap = {};
        this._allDayMap = {};

        _stop('ctor');
    };

    Jx.augment(Agenda, Jx.Component);

    var proto = Agenda.prototype;

    // Action Enums

    // Enumerates the possible click actions for a given item
    Agenda.ItemAction = {
        editEvent: 0,
        createEvent: 1,
        viewDay: 2,
        viewMonth: 3,
    };

    // Enumarates the possible layout types for the view
    Agenda.LayoutType = {
        none: 0,
        horizontal: 1,
        vertical: 2,
    };

    // Helpers

    Agenda._getLayoutType = function (width) {
        /// <summary>Determines the current LayoutType based upon a given width</summary>
        /// <param name="width">The width of the app</param>
        /// <returns>The LayoutType corresponding to the given width</returns>
        Debug.assert(Jx.isValidNumber(width), 'Jx.isValidNumber(width)');

        if (width > 856) {
            return Agenda.LayoutType.horizontal;
        } else {
            return Agenda.LayoutType.vertical;
        }
    };

    // List Helpers

    Agenda._getIndexOfItem = function (list, item) {
        /// <summary>Safely gets the index of an item in the list, even if the item is null or undefined</summary>
        /// <param name="list">The list to search</param>
        /// <param name="item">The item to search for</param>
        /// <returns>The index of the item in the list, if found, otherwise -1</returns>
        Debug.assert(Jx.isObject(list), 'Jx.isObject(list)');
        Debug.assert(Jx.isFunction(list.indexOfKey), 'Jx.isFunction(list.indexOfKey)');

        if (item) {
            Debug.assert(Jx.isObject(item), 'Jx.isObject(item)');
            Debug.assert(Jx.isNonEmptyString(item.listKey), 'Jx.isNonEmptyString(item.listKey)');

            return list.indexOfKey(item.listKey);
        }

        return -1;
    };

    Agenda._getDateKey = function (date) {
        /// <summary>Gets the key representation for a given date</summary>
        /// <param name="date">The Date object used to build the key</param>
        /// <returns>A date-based key string</returns>
        Debug.assert(Jx.isDate(date), 'Jx.isDate(date)');

        var year = String(date.getFullYear());
        var month = String(date.getMonth());
        var day = String(date.getDate());

        return year + (month < 10 ? '0' + month : month) + (day < 10 ? '0' + day : day);
    };

    Agenda._compareItems = function (item1, item2) {
        /// <summary>Compare two wrapped event items</summary>
        /// <param name="item1">The first wrapped event item</param>
        /// <param name="item2">The second wrapped event item</param>
        /// <returns>A value less than zero if item1 is less than item2, zero if the items are equivalent, or a value greater than zero if item1 is greater than item2</returns>
        Debug.assert(Jx.isObject(item1), 'Jx.isObject(item1)');
        Debug.assert(Jx.isObject(item2), 'Jx.isObject(item2)');

        // Start date ascending.
        var startDiff = AgendaHelpers.compareDates(item1.startDate, item2.startDate);
        if (startDiff !== 0) {
            return startDiff;
        }

        // Busy status descending.
        var busyDiff = item2.busyStatus - item1.busyStatus;
        if (busyDiff !== 0) {
            return busyDiff;
        }

        // End date descending.
        var endDiff = AgendaHelpers.compareDates(item2.endDate, item1.endDate);
        if (endDiff !== 0) {
            return endDiff;
        }

        // These must be equal, non-all day events.
        return 0;
    };

    Agenda._allDayCardSorter = function (item1, item2) {
        /// <summary>Compare two wrapped all day card event items</summary>
        /// <param name="item1">The first wrapped event item</param>
        /// <param name="item2">The second wrapped event item</param>
        /// <returns>A value less than zero if item1 is less than item2, zero if the items are equivalent, or a value greater than zero if item1 is greater than item2</returns>
        Debug.assert(Jx.isObject(item1), 'Jx.isObject(item1)');
        Debug.assert(Jx.isObject(item2), 'Jx.isObject(item2)');

        // Place multiday items ahead of all others in the all day card
        Debug.assert(Jx.isBoolean(item1.multiDay), 'Jx.isBoolean(item1.multiDay)');
        Debug.assert(Jx.isBoolean(item2.multiDay), 'Jx.isBoolean(item2.multiDay)');

        var multiDayDiff = item2.multiDay - item1.multiDay;
        if (multiDayDiff !== 0) {
            return multiDayDiff;
        }

        // Start date ascending.
        var startDiff = AgendaHelpers.compareDates(item1.startDate, item2.startDate);
        if (startDiff !== 0) {
            return startDiff;
        }

        // Busy status descending.
        var busyDiff = item2.busyStatus - item1.busyStatus;
        if (busyDiff !== 0) {
            return busyDiff;
        }

        // End date ascending.
        var endDiff = AgendaHelpers.compareDates(item1.endDate, item2.endDate);
        if (endDiff !== 0) {
            return endDiff;
        }

        // These must be equal, non-all day events.
        return 0;
    };

    Agenda._itemSorter = function (item1, item2) {
        /// <summary>Compare two wrapped event items</summary>
        /// <param name="item1">The first wrapped event item</param>
        /// <param name="item2">The second wrapped event item</param>
        /// <returns>A value less than zero if item1 is less than item2, zero if the items are equivalent, or a value greater than zero if item1 is greater than item2</returns>
        Debug.assert(Jx.isObject(item1), 'Jx.isObject(item1)');
        Debug.assert(Jx.isObject(item2), 'Jx.isObject(item2)');

        if (!item1.allDayContainer && !item2.allDayContainer) {
            // Two normal items, use normal comparison
            return Agenda._compareItems(item1, item2);
        } else {
            // At least one of the items is an all day event, sort it special
            var startDiff = AgendaHelpers.compareDates(item1.startDate, item2.startDate);
            if (startDiff !== 0) {
                return startDiff;
            }

            Debug.assert(Jx.isBoolean(item1.allDayContainer), 'Jx.isBoolean(item1.allDayContainer)');
            Debug.assert(Jx.isBoolean(item2.allDayContainer), 'Jx.isBoolean(item2.allDayContainer)');

            var allDayDiff = item2.allDayContainer - item1.allDayContainer;
            if (allDayDiff !== 0) {
                return allDayDiff;
            }

            return 0;
        }
    };

    Agenda._itemFilter = function (item) {
        /// <summary>Determine whether the wrapped event item should be shown in the list</summary>
        /// <param name="item">The wrapped event item</param>
        /// <returns>True if the item should appear in the list, false otherwise</returns>
        Debug.assert(Jx.isObject(item), 'Jx.isObject(item)');

        return !item.isHidden && !item.isPast;
    };

    Agenda._getGroupKeyFromItem = function (item) {
        /// <summary>Determines the group key for a wrapped event item</summary>
        /// <param name="item">The wrapped event item</param>
        /// <returns>The group key string (Format - "YYYYMMDD")</returns>
        Debug.assert(Jx.isObject(item), 'Jx.isObject(item)');
        Debug.assert(Jx.isNonEmptyString(item.groupKey), 'Jx.isNonEmptyString(item.groupKey)');

        return item.groupKey;
    };

    Agenda._groupKeySorter = function (key1, key2) {
        /// <summary>Compare two group key strings</summary>
        /// <param name="key1">The first group key string</param>
        /// <param name="key2">The second group key string</param>
        /// <returns>A value less than zero if key1 is less than key2, zero if the keys are equivalent, or a value greater than zero if key1 is greater than key2</returns>
        Debug.assert(Jx.isNonEmptyString(key1), 'Jx.isNonEmptyString(key1)');
        Debug.assert(Jx.isNonEmptyString(key2), 'Jx.isNonEmptyString(key2)');

        return key1.localeCompare(key2);
    };

    // View Methods

    proto.setFocusedDay = function (day) {
        /// <summary>Places focus on the specified day</summary>
        /// <param name="day">The Date object representing the day to focus</param>
        /// <remarks>These calls are ignored except when the specified day is today (to support the "Today" button)</remarks>
        Debug.assert(Jx.isDate(day), 'Jx.isDate(day)');

        if (this._today && this._listView && Helpers.isSameDate(day, this._today)) {
            this._listView.indexOfFirstVisible = 0;
            this._listView.scrollPosition = 0;
        }
    };

    proto.getFocusedDay = function () {
        /// <summary>Returns the start date of the first visible item</summary>
        /// <returns>A Date object representing the day in which the first item in view occurs</returns>
        if (this._listView) {
            Debug.assert(Jx.isObject(this._groupedList), 'Jx.isObject(this._groupedList)');

            // Try to get the first event in the view
            var firstVisible = this._listView.indexOfFirstVisible;

            if (firstVisible > 0) {
                // The first item in view is not the first item in the list
                var event = this._groupedList.getAt(firstVisible);
                return AgendaHelpers.getDayFromDate(event.startDate);
            }
        }

        // There's no better option, just return today
        Debug.assert(this._today);
        return this._today;
    };

    proto.getState = function () {
        /// <summary>Captures the current state of the view</summary>
        /// <returns>An object containing the current state of the view</returns>
        var listView = this._listView;

        if (listView) {
            // Get the current item and remove the key property
            // The key can change between loads and is not a safe way to try and restore state
            // Removing the property will cause the listview to fall back on index, which is less likely to become invalid
            var currentItem = listView.currentItem;
            delete currentItem.key;

            return {
                currentItem: currentItem,
                indexOfFirstVisible: listView.indexOfFirstVisible,
                scrollPosition: listView.scrollPosition,
            };
        }

        return null;
    };

    proto.setState = function (state) {
        /// <summary>Sets the current state of the view</summary>
        /// <param name="state">An object containing previously captured state</param>
        Debug.assert(state === null || Jx.isObject(state), 'state === null || Jx.isObject(state)');
        Debug.assert(!this._host);

        this._state = state;
    };

    proto.focusEvent = function (event) {
        /// <summary>Places focus on a specific event</summary>
        /// <param name="event">The event to place focus on.</param>

        // Unlike most other calendar views, the agenda view currently requires that it be passed a full event object to focusEvent.
        // (This could be changed, but given the layout of the view it doesn't seem useful to change it.)
        // focusEvent is currently used to let agenda view be re-shown after creating an event, but doesn't support protocol or API activation.
        Debug.assert(Jx.isObject(event), 'Jx.isObject(event)');
        Debug.assert(Jx.isNonEmptyString(event.handle), 'Agenda.focusEvent requires an event handle');

        // Collect the event for later processing
        this._eventToFocus = event;
    };

    proto.containsDate = function (date) {
        /// <summary>Determines whether the Date object is within the visible region</summary>
        /// <param name="date">The Date object to compare</param>
        /// <returns>True if the Date is within the visible range, false otherwise</returns>
        Debug.assert(Jx.isDate(date), 'Jx.isDate(date)');
        Debug.assert(Jx.isObject(this._groupedList), 'Jx.isObject(this._groupedList)');

        var start = this._rangeStart;
        var end = this._rangeEnd;
        var length = this._groupedList.length;

        if (this._listView && length > 1) {
            // Only bother if we have more than one item in view.
            var firstVisible = this._listView.indexOfFirstVisible;
            var lastVisible = this._listView.indexOfLastVisible;

            if (firstVisible > 0) {
                // The first item in view isn't the first item in the list.
                var firstEvent = this._groupedList.getAt(firstVisible);
                start = AgendaHelpers.getDayFromDate(firstEvent.startDate);
            }

            if (lastVisible > 0 && lastVisible < length - 1) {
                // The last item in view isn't the last item in the list.
                var lastEvent = this._groupedList.getAt(lastVisible);
                end = AgendaHelpers.getDayFromDate(lastEvent.startDate, 1);
            }
        }

        return AgendaHelpers.containsDate(start, end, date);
    };

    proto.changeBackground = function (useDefault) {
        if (this._background) {
            _startAsync('changeBackground');

            var that = this,
                command = this._appBar.getCommandById('backgroundCommand');

            command.disabled = true;

            this._backgroundChangePromise = this._background.changeAsync(useDefault);
            this._backgroundChangePromise.then(null, function (err) {
                if (err.name !== "Canceled") {
                    Jx.log.exception('Error occurred while changing the background image', err);
                    
                    // It's possible for this to be called after the page is torn down (but unlikely)
                    var calendarManager = that._getCalendarManager();
                    if (calendarManager) {
                        calendarManager.addCalendarError(Agenda._backgroundError, ErrorPriority.high);
                    }
                }
            }).done(function () {
                that._backgroundChangePromise = null;
                command.disabled = false;

                _stopAsync('changeBackground');
            });
        }
    };

    proto.allowPeekBarTabVersion = function () {
        /// <summary>Determine whether to allow the tab version of the peek bar</summary>
        /// <returns>True if the tab version should be allowed, false otherwise</returns>
        
        // Assume true unless explicitly in vertical mode
        return this._layoutType !== Agenda.LayoutType.vertical;
    };

    // Jx.Component

    proto.getUI = function (ui) {
        /// <summary>Provides the base UI for the view</summary>
        /// <param name="ui">The UI object to fill in</param>
        ui.html = Templates.host({
            id: this._id,
            background: Jx.getUI(this._background)
        });
    };

    proto.activateUI = function (jobSet) {
        /// <summary>Activates the UI elements</summary>
        /// <param name="jobSet">The UI job set</param>
        _start('activateUI');

        this._jobSet = jobSet;

        // Create a child jobset for handling list changes, this allows us to cancel any list-specific work before changing the date
        this._listJobSet = jobSet.createChild();

        // Locate the elements
        this._host = document.getElementById(this._id);
        var heroContainer = this._host.querySelector('.herocontainer');
        this._allDayHero = heroContainer.querySelector('.allday');
        this._timeline = this._host.querySelector('.timeline');

        var dateContainer = this._dateContainer = heroContainer.querySelector('.date');
        dateContainer.addEventListener('click', this._onHeroDateInvoked, false);
        dateContainer.addEventListener('keydown', this._onHeroDateInvoked, false);

        // Listen for day and window changes
        this.on('resizeWindow', this._onWindowResize);
        this.on('viewReady', this._onViewReady);

        // Get the date context
        this._now = Calendar.getMinute();
        this._today = AgendaHelpers.getDayFromDate(this._now);
        Calendar.addListener('minuteChanged', this._onMinuteChanged, this);

        // Initialize the calendar manager and app bar fields
        this._worker = null;
        this._workerId = null;
        this._calendarManager = null;
        this._appBar = null;

        // Get the peek bar
        var data = {};
        this.fire('getPeekBar', data);
        Debug.assert(Jx.isObject(data.peekBar), 'Jx.isObject(data.peekBar)');
        this._peekBar = data.peekBar;

        // If we're already in tab mode, make sure that we apply the correct style
        if (this._peekBar.isTabMode()) {
            this._onPeekBarTab();
        }

        // Holds a reference to today's group key
        this._todayGroupKey = null;
        this._todayAllDayContainer = null;

        // Create the binding list
        var list = this._list = new WinJS.Binding.List();
        var sortedList = this._sortedList = list.createSorted(Agenda._itemSorter);
        var filteredList = this._filteredList = sortedList.createFiltered(Agenda._itemFilter);
        this._groupedList = filteredList.createGrouped(
            Agenda._getGroupKeyFromItem,
            this._getGroupHeader.bind(this),
            Agenda._groupKeySorter);

        list.addEventListener('iteminserted', this._onListItemInserted);
        list.addEventListener('itemremoved', this._onListItemRemoved);

        // Activate the background component
        this._background.activateUI(jobSet.createChild());

        // Add a class to the body to ensure the syncing indicator is visible in agenda view
        document.body.classList.add('darkBg');

        // Listen for peekBar events so we can move our scrollbar
        this.on('peekBarFull', this._onPeekBarFull);
        this.on('peekBarTab', this._onPeekBarTab);

        // Initialize the layout with the current window width
        this._ensureLayout(window.outerWidth);

        // Fade in the date container
        Animation.fadeIn(dateContainer).then(function () {
            dateContainer.style.opacity = '';
        });

        _stop('activateUI');
    };

    proto.deactivateUI = function () {
        /// <summary>Deactivates the UI elements</summary>
        _start('deactivateUI');

        // Remove the class from the body to ensure the syncing indicator will be visible in other views
        document.body.classList.remove('darkBg');

        // Listen for peekBar events so we can move our scrollbar
        this.detach('peekBarFull', this._onPeekBarFull);
        this.detach('peekBarTab', this._onPeekBarTab);

        // Cancel any background changes and shut down the component
        if (this._backgroundChangePromise) {
            this._backgroundChangePromise.cancel();
            this._backgroundChangePromise = null;
        }

        // Shut down the background component
        if (this._background) {
            this._background.shutdownUI();
            this._background = null;
        }

        // Cancel any active worker jobs and detach worker events
        if (this._worker) {
            this._cancelWorker();

            this._worker.removeListener('Agenda/eventsChanged', this._onEventsChanged, this);
            this._worker.removeListener('Agenda/getEvents', this._onGetEvents, this);
            this._worker = null;
        }

        _start('deactivateUI:_listView');

        // Clean up the ListView
        if (this._listView) {
            // Remove the listeners
            this._listView.removeEventListener('loadingstatechanged', this._onListViewLoadingStateChanged);
            this._listView.removeEventListener('iteminvoked', this._onListViewItemInvoked);

            // Disconnect the data sources
            this._listView.itemDataSource = null;
            this._listView.groupDataSource = null;
            
            // Dispose the view
            this._listView.dispose();
            this._listView = null;
        }

        this._listViewGridLayout = null;
        this._listViewListLayout = null;

        _stop('deactivateUI:_listView');

        _start('deactivateUI:_appBar');

        // Hide background command
        if (this._appBar) {
            this._appBar.removeEventListener('beforeshow', this._onAppBarBeforeShow);
            this._appBar.hideCommands(['backgroundCommand']);
            this._appBar = null;
        }

        this._peekBar = null;

        _stop('deactivateUI:_appBar');

        _start('deactivateUI:_list');

        // Clean up the list projections first to detach event handlers
        if (this._groupedList) {
            this._groupedList.dispose();
            this._groupedList = null;
        }

        if (this._filteredList) {
            this._filteredList.dispose();
            this._filteredList = null;
        }
        
        if (this._sortedList) {
            this._sortedList.dispose();
            this._sortedList = null;
        }
        
        // Now clean up the list
        if (this._list) {
            // Remove the listeners
            this._list.removeEventListener('iteminserted', this._onListItemInserted);
            this._list.removeEventListener('itemremoved', this._onListItemRemoved);

            // Clear the list contents
            this._clearList();

            this._list = null;
        }

        // Release the maps
        this._objectIdMap = null;
        this._handleMap = null;
        this._allDayMap = null;

        _stop('deactivateUI:_list');

        // Cancel any outstanding animations
        if (this._heroAnimationPromise) {
            this._heroAnimationPromise.cancel();
            this._heroAnimationPromise = null;
        }

        // Cancel any outstanding jobs and dispose the job set
        if (this._jobSet) {
            this._jobSet.cancelAllChildJobs();
            this._jobSet = null;
        }

        this._listJobSet = null;

        // Cancel any deferred work items
        this._cancelDeferredWork();

        // Detach event listeners
        this.detach('viewReady', this._onViewReady);
        this.detach('resizeWindow', this._onWindowResize);
        
        Calendar.removeListener('minuteChanged', this._onMinuteChanged, this);
        
        this._dateContainer.removeEventListener('click', this._onHeroDateInvoked, false);
        this._dateContainer.removeEventListener('keydown', this._onHeroDateInvoked, false);

        // Release the date objects
        this._today = null;
        this._now = null;
        this._rangeStart = null;
        this._rangeEnd = null;

        this._upNextHeroItem = null;
        this._idsCalendar = null;
        this._todayGroupKey = null;

        // Release the calendar manager
        this._calendarManager = null;

        // Release the state object
        this._state = null;

        // Release the DOM elements
        this._timeline = null;
        this._host = null;
        this._todayAllDayContainer = null;

        _stop('deactivateUI');
    };

    // BICI methods

    proto._getIdsCalendar = function () {
        /// <summary>Gets the Calendar BICI IDs</summary>
        /// <returns>The object containing the BICI datapoint IDs for Calendar</returns>
        if (!this._idsCalendar) {
            this._idsCalendar = Microsoft.WindowsLive.Instrumentation.Ids.Calendar;
        }

        return this._idsCalendar;
    };

    // Initialization helpers

    proto._onViewReady = function (ev) {
        if (this._firstRun && ev.stage === Jx.EventManager.Stages.bubbling) {
            this._firstRun = false;

            var deferredWork = this._deferredWork = this.queryService('deferredWork');
            
            // Ensure that we were able to get the service
            if (deferredWork) {
                Debug.assert(Jx.isObject(deferredWork));

                var idle = People.Priority.launch;

                deferredWork.queue('AgDateRange', 50, idle, this._updateDateRange, this);
                deferredWork.queue('AgListView', 50, idle, this._ensureListView, this);
                deferredWork.queue('AgAppBar', 50, idle, this._ensureAppBar, this);
            }
        }
    };

    proto._cancelDeferredWork = function () {
        /// <summary>Cancel deferred work items</summary>
        var deferredWork = this._deferredWork;

        if (deferredWork) {
            Debug.assert(Jx.isObject(deferredWork));
            
            var idle = People.Priority.launch;

            // There's no way to cancel items, so we schedule replacements.
            // If the items are already in the queue they will be overridden,
            // otherwise we'll just schedule some empty items to be processed.
            deferredWork.queue('AgDateRange', 12, idle, Jx.fnEmpty, null);
            deferredWork.queue('AgListView', 12, idle, Jx.fnEmpty, null);
            deferredWork.queue('AgAppBar', 12, idle, Jx.fnEmpty, null);
        }
        
        this._deferredWork = null;
    };

    proto._ensureWorker = function () {
        /// <summary>Ensure that the worker is initialized</summary>
        if (!this._worker) {
            var data = {};
            this.fire('getPlatformWorker', data);

            this._worker = data.platformWorker;
            this._worker.addListener('Agenda/eventsChanged', this._onEventsChanged, this);
            this._worker.addListener('Agenda/getEvents', this._onGetEvents, this);
        }
    };

    proto._ensureAppBar = function () {
        /// <summary>Ensures that the app bar has been initialized for the view</summary>
        _start('_ensureAppBar');

        // Make sure the app bar hasn't been initialized and that we still have a valid host
        if (!this._appBar && this._host) {
            // Get the app bar object
            var data = {};
            this.fire('getAppBar', data);
            this._appBar = data.appBar;

            if (this._appBar) {
                // Listen for app bar events and show the background command
                this._appBar.addEventListener('beforeshow', this._onAppBarBeforeShow);
                this._appBar.showCommands(['backgroundCommand']);
            }
        }

        _stop('_ensureAppBar');
    };

    proto._ensureLayout = function (width) {
        /// <summary>Ensures that the ListView layout is correct</summary>
        /// <param name="width">The outer width of the window</summary>
        /// <remarks>This method is also used for initialization, switching from "none" to the correct view</remarks>
        Debug.assert(Jx.isValidNumber(width) && width > 0, 'Jx.isValidNumber(width) && width > 0');

        _start('_ensureLayout');
        
        var currentLayout = this._layoutType;
        var layoutType = Agenda._getLayoutType(width);
        var setActiveItem = false;

        if (currentLayout !== layoutType)
        {
            this._layoutType = layoutType;
            setActiveItem = (currentLayout !== Agenda.LayoutType.none);

            this._updateDateHeader(layoutType);
            this._updatePeekBar(layoutType);
        }

        // Always make sure the list view is correct
        this._updateListViewLayout(layoutType, setActiveItem);

        _stop('_ensureLayout');
    };

    proto._ensureListView = function () {
        _start('_ensureListView');

        // Make sure the ListView hasn't been initialized and that we still have a valid host
        if (!this._listView && this._host) {
            Debug.assert(Jx.isObject(this._host), 'Jx.isObject(this._host)');
            Debug.assert(Jx.isFunction(this._host.querySelector), 'Jx.isFunction(this._host.querySelector)');

            // Create the list view, raise the first loading event
            var listView = this._listView = new WinJS.UI.ListView(this._timeline);
            listView.selectionMode = WinJS.UI.SelectionMode.none;
            listView.groupHeaderTapBehavior = WinJS.UI.GroupHeaderTapBehavior.none;

            listView.itemTemplate = this._onListViewItemTemplate.bind(this);
            listView.groupHeaderTemplate = this._onListViewGroupHeaderTemplate.bind(this);

            // Create the possible layouts
            this._listViewGridLayout = new WinJS.UI.GridLayout();
            this._listViewListLayout = new WinJS.UI.ListLayout();

            listView.addEventListener('loadingstatechanged', this._onListViewLoadingStateChanged);
            listView.addEventListener('iteminvoked', this._onListViewItemInvoked);
         
            this._updateListViewLayout(this._layoutType);
        }

        _stop('_ensureListView');
    };

    proto._connectDataSource = function () {
        var listView = this._listView;
        var groupedList = this._groupedList;

        listView.itemDataSource = groupedList.dataSource;
        listView.groupDataSource = groupedList.groups.dataSource;
    };

    proto._getCalendarManager = function () {
        /// <summary>Gets the calendar manager instance (initializing it if necessary)</summary>
        /// <returns>The CalendarManager object instance</returns>
        _start('_getCalendarManager');
        
        // Only try to get the calendar manager if it's not null and we actually have UI still
        if (!this._calendarManager && this.hasUI()) {            
            var data = {};
            this.fire('getPlatform', data);
            this._calendarManager = data.platform.calendarManager;
        }

        _stop('_getCalendarManager');

        return this._calendarManager;
    };

    proto._updateDateHeader = function (layoutType) {
        /// <summary>Update the date header</summary>
        /// <param name="layoutType">The current layout type</param>
        Debug.assert(Jx.isValidNumber(layoutType), 'Jx.isValidNumber(layoutType)');

        _start('_updateDateHeader');

        if (layoutType === Agenda.LayoutType.horizontal) {
            this._dateContainer.textContent = Agenda._dateWithDay.format(this._today);
        } else {
            Debug.assert(layoutType === Agenda.LayoutType.vertical, 'layoutType === Agenda.LayoutType.vertical');

            this._dateContainer.textContent = Agenda._dateWithDayAbbr.format(this._today);
        }

        _stop('_updateDateHeader');
    };

    proto._updatePeekBar = function (layoutType) {
        /// <summary>Update the peek bar layout</summary>
        /// <param name="layoutType">The current layout type</param>
        Debug.assert(Jx.isValidNumber(layoutType), 'Jx.isValidNumber(layoutType)');
        Debug.assert(layoutType === Agenda.LayoutType.horizontal || layoutType === Agenda.LayoutType.vertical, 'layoutType === Agenda.LayoutType.horizontal || layoutType === Agenda.LayoutType.vertical');

        _start('_updatePeekBar');

        if (this._peekBar) {
            this._peekBar.allowTabVersion(layoutType === Agenda.LayoutType.horizontal);
        }

        _stop('_updatePeekBar');
    };

    // ListView methods

    proto._updateListViewLayout = function (layoutType, setActiveItem) {
        /// <summary>Updates the layout of the ListView control</summary>
        /// <param name="layoutType">The current layout type</param>
        /// <param name="setActiveItem" optional="True">Indicates whether to set the active item in the list</param>
        Debug.assert(Jx.isValidNumber(layoutType), 'Jx.isValidNumber(layoutType)');

        _start('_updateListViewLayout');

        if (this._listView) {
            var layout;
        
            // Always make sure the pillar items are correct before applying layout or recalculating positions
            this._updatePillarItems();
            
            if (layoutType === Agenda.LayoutType.horizontal) {
                this._maxAllDayItems = 5;
                layout = this._listViewGridLayout;
            } else {
                Debug.assert(layoutType === Agenda.LayoutType.vertical, 'layoutType === Agenda.LayoutType.vertical');

                this._maxAllDayItems = 4;
                layout = this._listViewListLayout;
            }

            if (this._listViewCurrentLayout !== layout) {
                // The layout changed, update it
                this._listViewCurrentLayout = layout;
                this._listViewSetActiveItem = setActiveItem;

                // Schedule the layout update if necessary
                if (!this._listViewUpdateScheduled) {
                    this._listViewUpdateScheduled = true;
                    
                    // Workaround for WinJS Listview bug 484373. Delay setting indexOfFirstVisible until after the listview is loaded.
                    this._focusListItemReady = false;

                    this._jobSet.addUIJob(this, this._applyListViewLayout, null, People.Priority.perfLowFidelity);
                }
            } else {
                // The listview won't automatically recalculate margin/padding changes, this forces it to
                this._listView.recalculateItemPosition();
            }
        }

        _stop('_updateListViewLayout');
    };

    proto._applyListViewLayout = function () {
        /// <summary>Apply the layout to the list view</summary>
        this._listViewUpdateScheduled = false;
        this._listView.layout = this._listViewCurrentLayout;

        if (this._listViewSetActiveItem) {
            this._setActiveItem();
        }
    };

    // List methods

    proto._updateDateRange = function () {
        /// <summary>Ensure the date range is still correct, otherwise it will create a new query and rebuild the UI</summary>
        _start('_updateDateRange');

        // Ensure we still have a current date
        if (this._today) {
            Debug.assert(Jx.isDate(this._today), 'Jx.isDate(this._today)');

            var rangeStart = this._today;

            if (!this._rangeStart || this._rangeStart - rangeStart !== 0) {
                // Save the new range
                this._rangeStart = rangeStart;
                var rangeEnd = this._rangeEnd = AgendaHelpers.getDayFromDate(rangeStart, 61);

                // Cancel any outstanding list jobs since we're going to clear the list anyway
                this._listJobSet.cancelAllChildJobs();

                // It's time to begin editing the list, notify the data source
                var listViewDataSource = this._groupedList.dataSource;
                listViewDataSource.beginEdits();

                // Clear out the current events and update today's group key
                this._clearList();
                this._todayGroupKey = Agenda._getDateKey(this._today);

                // Create the pillar items
                this._createPillarItems();

                // We've finished our updates, notify the data source
                listViewDataSource.endEdits();

                // Initialize the worker
                this._ensureWorker();

                // Create the worker request
                this._workerId = this._worker.postCommand('Agenda/getEvents', {
                    start: rangeStart.getTime(),
                    end:   rangeEnd.getTime(),

                    isVisible: true,
                });

                // Update the date header
                this._updateDateHeader(this._layoutType);
            }
        }

        _stop('_updateDateRange');
    };

    proto._cancelWorker = function () {
        /// <summary>Cancel the current worker job, if any</summary>
        _start('_cancelWorker');

        if (this._workerId) {
            Debug.assert(Jx.isObject(this._worker), 'Jx.isObject(this._worker)');
            Debug.assert(Jx.isFunction(this._worker.postCommand), 'Jx.isFunction(this._worker.postCommand)');

            this._worker.postCommand('Agenda/cancel', null, this._workerId);
            this._workerId = null;
        }

        _stop('_cancelWorker');
    };

    proto._clearList = function () {
        /// <summary>Clears the items from the list, disposes the event collection, and cleans up maps</summary>
        _start('_clearList');

        // Cancel the current worker job, if any
        this._cancelWorker();
        this._getEventsCompleted = false;

        // Clear the list and release references to items
        var list = this._list;
        list.splice(0, list.length);
        this._noEventsItem = null;
        this._seeMoreEventsItem = null;

        // Clear the item maps
        this._objectIdMap = {};
        this._handleMap = {};
        this._allDayMap = {};

        // Reset the UID counter
        this._uid = 0;

        // Make sure the hero is updated
        this._scheduleAllDayHeroUpdate(true);

        _stop('_clearList');
    };

    proto._notifyMutated = function (item) {
        /// <summary>Notifies the list that the item has been mutated</summary>
        /// <param name="item">The item that has been mutated</param>
        var list = this._list;
        var index = Agenda._getIndexOfItem(list, item);

        Debug.assert(index >= 0, 'index >= 0');

        list.notifyMutated(index);
    };

    proto._setAt = function (listKey, item) {
        /// <summary>Replaces the item at a given key with the provided item</summary>
        /// <param name="listKey">The list key for the item to be replaced</param>
        /// <param name="item">The replacement item</param>
        var list = this._list;
        var index = Agenda._getIndexOfItem(list, item);

        Debug.assert(index >= 0, 'index >= 0');

        list.setAt(index, item);
    };

    proto._addEventToList = function (event) {
        /// <summary>Adds a platform event object to the list</summary>
        /// <param name="event">A WinRT Platform Event object</param>
        Debug.assert(Jx.isObject(event), 'Jx.isObject(event)');

        _start('_addEventToList');

        var items = event.items;

        if (items.length > 0) {
            Debug.assert(Jx.isUndefined(this._objectIdMap[event.objectId]), 'Jx.isUndefined(this._objectIdMap[event.objectId])');
            this._objectIdMap[event.objectId] = event;

            Debug.assert(Jx.isUndefined(this._handleMap[event.handle]), 'Jx.isUndefined(this._handleMap[event.handle])');
            this._handleMap[event.handle] = event;

            // Add the pieces to the list
            items.forEach(this._addListItem, this);
        } else {
            Jx.log.warning('Agenda::_addEventToList - event contained no usable pieces: ' + event.handle);
        }

        _stop('_addEventToList');
    };

    proto._removeEventFromList = function (objectId) {
        /// <summary>Removes an item from the list by event object ID</summary>
        /// <param name="objectId">The object ID of the event to be removed</param>
        Debug.assert(Jx.isNonEmptyString(objectId), 'Jx.isNonEmptyString(objectId)');
        
        _start('_removeEventFromList');

        var oldEvent = this._objectIdMap[objectId];
        if (oldEvent) {
            delete this._objectIdMap[oldEvent.objectId];
            delete this._handleMap[oldEvent.handle];

            oldEvent.items.forEach(this._removeListItem, this);
        } else {
            Jx.log.warning('Agenda::_removeEventFromList - objectId not found: ' + objectId);
        }
        
        _stop('_removeEventFromList');
    };

    proto._replaceEventInList = function (newEvent) {
        /// <summary>Replace an existing list item</summary>
        /// <param name="newEvent">A WinRT Platform event object</param>
        Debug.assert(Jx.isObject(newEvent), 'Jx.isObject(newEvent)');
        Debug.assert(Jx.isNonEmptyString(newEvent.objectId), 'Jx.isNonEmptyString(newEvent.objectId)');

        _start('_replaceEventInList');

        var objectId = newEvent.objectId;
        var oldEvent = this._objectIdMap[objectId];
        if (oldEvent) {
            if (oldEvent.showInAllDayCard ^ newEvent.showInAllDayCard) {
                // The event's all day status changed, remove and re-add it
                this._removeEventFromList(objectId);
                this._addEventToList(newEvent);
            } else {
                // Get the new event's items
                var newItems = newEvent.items;

                if (newItems.length === 0) {
                    // None of the new pieces end up in the list, just remove the event completely
                    this._removeEventFromList(objectId);
                } else {
                    // We need to compare the new and old items to figure out which need to be replaced/removed/added
                    var oldItems = oldEvent.items;

                    var i = 0,
                        j = 0,
                        leni = oldItems.length,
                        lenj = newItems.length;

                    // Find the overlap between the two ranges
                    while (i < leni && j < lenj) {
                        var oldItem = oldItems[i];
                        var newItem = newItems[j];

                        if (Helpers.isSameDate(oldItem.startDate, newItem.startDate)) {
                            // The old and new items overlap, replace the existing item in the list
                            this._replaceListItem(oldItem, newItem);
                            i++;
                            j++;
                        } else if (AgendaHelpers.compareDates(oldItem.startDate, newItem.startDate) < 0) {
                            // This item is no longer relevant, remove it from the list
                            this._removeListItem(oldItem);
                            i++;
                        } else {
                            // This item does not yet exist in the list, add it
                            this._addListItem(newItem);
                            j++;
                        }
                    }

                    // Remove the rest of the old items
                    while (i < leni) {
                        this._removeListItem(oldItems[i]);
                        i++;
                    }

                    // Add the rest of the new items
                    while (j < lenj) {
                        this._addListItem(newItems[j]);
                        j++;
                    }

                    // Update the maps to point to the new event
                    Debug.assert(!Jx.isUndefined(this._objectIdMap[objectId]), '!Jx.isUndefined(this._objectIdMap[objectId])');
                    this._objectIdMap[objectId] = newEvent;

                    Debug.assert(!Jx.isUndefined(this._handleMap[newEvent.handle]), '!Jx.isUndefined(this._handleMap[newEvent.handle])');
                    this._handleMap[newEvent.handle] = newEvent;
                }
            }
        } else {
            Jx.log.warning('Agenda::_replaceEventInList - objectId not found: ' + objectId);
        }

        _stop('_replaceEventInList');
    };

    proto._addListItem = function (item) {
        /// <summary>Adds a wrapped event item to the list</summary>
        /// <param name="item">A wrapped event item</param>
        Debug.assert(Jx.isObject(item), 'Jx.isObject(item)');

        var list = this._list;

        if (!item.showInAllDayCard) {
            // Just push the item into the list
            list.push(item);
        } else {
            // The item will need to go into an all day container
            var groupKey = item.groupKey;
            var allDayContainer = this._allDayMap[groupKey];

            if (!Jx.isObject(allDayContainer)) {
                var start = AgendaHelpers.getDayFromDate(item.startDate);

                allDayContainer = {
                    action: Agenda.ItemAction.viewDay,
                    allDayContainer: true,
                    groupKey: groupKey,
                    isHidden: false,
                    isPast: false,
                    listKey: null,

                    startDate: start,
                    endDate: AgendaHelpers.getDayFromDate(start, 1),
                    label: AgendaHelpers.getDateString(this._today, start),

                    allDayLabelFormat: Agenda._accAgendaAllDay,
                    allDayMoreFormat: Agenda._allDayMore,
                    allDayMoreLabel: Agenda._accAgendaAllDaySeeMore,
                    items: []
                };

                this._allDayMap[groupKey] = allDayContainer;
            }

            var items = allDayContainer.items;
            items.push(item);
            items.sort(Agenda._allDayCardSorter);

            if (items.length > 1) {
                allDayContainer.action = Agenda.ItemAction.viewDay;
                allDayContainer.handle = null;
            } else {
                allDayContainer.action = Agenda.ItemAction.editEvent;
                allDayContainer.handle = items[0].handle;
            }

            if (groupKey === this._todayGroupKey) {
                // This is the today card, don't bother putting it into the list
                this._scheduleAllDayHeroUpdate(true);
            } else if (allDayContainer.listKey) {
                // The card is already in the list, just update it
                this._setAt(allDayContainer.listKey, allDayContainer);
            } else {
                // The card hasn't been pushed into the list yet
                list.push(allDayContainer);
            }
        }
    };

    proto._removeListItem = function (item) {
        /// <summary>Removes an item from the list by event object ID</summary>
        /// <param name="item">The object ID of the event to be removed</param>
        Debug.assert(Jx.isObject(item), 'Jx.isObject(item)');

        var list = this._list;
        var index;

        if (!item.showInAllDayCard) {
            // Normal item, just remove it
            index = Agenda._getIndexOfItem(list, item);
            Debug.assert(index >= 0, 'index >= 0');

            list.splice(index, 1);
        } else {
            // All day item, remove it from the all day container
            Debug.assert(Jx.isNonEmptyString(item.groupKey), 'Jx.isNonEmptyString(item.groupKey)');

            // Find the all day container
            var groupKey = item.groupKey;
            var allDayContainer = this._allDayMap[groupKey];
            Debug.assert(Jx.isObject(allDayContainer), 'Jx.isObject(allDayContainer)');

            // Remove the item
            var items = allDayContainer.items;
            index = items.indexOf(item);
            Debug.assert(index >= 0, 'index >= 0');

            items.splice(index, 1);

            // Update the container data
            if (items.length > 1) {
                allDayContainer.action = Agenda.ItemAction.viewDay;
                allDayContainer.handle = null;
            } else if (items.length > 0) {
                allDayContainer.action = Agenda.ItemAction.editEvent;
                allDayContainer.handle = items[0].handle;
            } else {
                delete this._allDayMap[groupKey];
            }

            // Update the container UI
            if (groupKey === this._todayGroupKey) {
                // This is the today container, just update the UI
                this._scheduleAllDayHeroUpdate(true);
            } else if (items.length > 0) {
                // The container is still needed, force a list update
                this._setAt(allDayContainer.listKey, allDayContainer);
            } else {
                // The container is no longer needed, remove it completely
                index = Agenda._getIndexOfItem(list, allDayContainer);
                Debug.assert(index >= 0, 'index >= 0');

                list.splice(index, 1);
            }
        }
    };

    proto._replaceListItem = function (oldItem, newItem) {
        /// <summary>Replaces a wrapped event item in the list</summary>
        /// <param name="oldItem">The wrapped event item to be replaced</param>
        /// <param name="newItem">The wrapped event item to replace with</param>
        Debug.assert(Jx.isObject(oldItem), 'Jx.isObject(oldItem)');
        Debug.assert(Jx.isObject(newItem), 'Jx.isObject(newItem)');
        Debug.assert(oldItem.showInAllDayCard === newItem.showInAllDayCard, 'oldItem.showInAllDayCard === newItem.showInAllDayCard');

        _start('_replaceListItem');

        if (!oldItem.showInAllDayCard) {
            // Normal item, just copy the key and set the new item in the list
            var listKey = newItem.listKey = oldItem.listKey;
            oldItem.listKey = null;

            // Existing items must be replaced
            this._setAt(listKey, newItem);
        } else {
            // All day item, replace the item in the container
            Debug.assert(Jx.isNonEmptyString(newItem.groupKey), 'Jx.isNonEmptyString(newItem.groupKey)');

            // Find the container's items
            var groupKey = newItem.groupKey;
            var allDayContainer = this._allDayMap[groupKey];
            Debug.assert(Jx.isObject(allDayContainer), 'Jx.isObject(allDayContainer)');

            var items = allDayContainer.items;

            // Find and replace the old item
            var index = items.indexOf(oldItem);
            Debug.assert(index >= 0, 'index >= 0');

            items.splice(index, 1, newItem);

            if (groupKey === this._todayGroupKey) {
                // This is the today card, just update it
                this._scheduleAllDayHeroUpdate(true);
            } else {
                // Force the list to update the container
                this._setAt(allDayContainer.listKey, allDayContainer);
            }
        }

        _stop('_replaceListItem');
    };

    proto._ensurePastItemsHidden = function () {
        /// <summary>Ensure that past items have been hidden from the list</summary>
        Debug.assert(Jx.isObject(this._sortedList), 'Jx.isObject(this._sortedList)');

        _start('_ensurePastItemsHidden');

        var list = this._sortedList;

        for (var i = 0, len = list.length; i < len; i++) {
            var item = list.getAt(i);

            if (AgendaHelpers.compareDates(item.startDate, this._now) >= 0)
            {
                // We've found the first item that is just starting or hasn't yet started, terminate the loop
                break;
            }

            if (item.isPast || AgendaHelpers.compareDates(item.endDate, this._now) <= 0) {
                // The item is in the past, ensure it's hidden
                if (!item.isPast) {
                    // The item is in the past, but not hidden, time to hide it
                    item.isPast = true;

                    this._notifyMutated(item);
                }
            }
        }

        _stop('_ensurePastItemsHidden');
    };

    proto._updateConflicts = function (startDate, endDate) {
        /// <summary>Update the event conflicts</summary>
        /// <param name="startDate" optional="True">The Date object representing the first day of the conflict range (inclusive)</param>
        /// <param name="endDate" optional="True">The Date object representing the last day of the conflict range (inclusive)</param>
        Debug.assert(Jx.isUndefined(startDate) || Jx.isDate(startDate), 'Jx.isUndefined(startDate) || Jx.isDate(startDate)');
        Debug.assert(Jx.isUndefined(endDate) || Jx.isDate(endDate), 'Jx.isUndefined(endDate) || Jx.isDate(endDate)');

        _start('_updateConflicts');        

        var list = this._sortedList,
            startIndex = 0,
            endIndex = list.length;

        if (Jx.isDate(startDate)) {
            var startItem = this._itemByDate(AgendaHelpers.getDayFromDate(startDate));
            var startItemIndex = Agenda._getIndexOfItem(list, startItem);

            if (startItemIndex >= 0) {
                startIndex = startItemIndex;
            }
        }

        if (Jx.isDate(endDate)) {
            var endItem = this._itemByDate(AgendaHelpers.getDayFromDate(endDate, 1));
            var endItemIndex = Agenda._getIndexOfItem(list, endItem);

            if (endItemIndex >= 0) {
                endIndex = endItemIndex;
            }
        }

        if (startIndex < endIndex) {
            var conflictMap = this._findConflicts(startIndex, endIndex);

            for (var i = startIndex; i < endIndex; i++) {
                var item = list.getAt(i),
                    conflict = Boolean(conflictMap[item.uid]);

                if (conflict !== item.conflict) {
                    item.conflict = conflict;

                    list.setAt(i, item);
                }
            }
        }

        _stop('_updateConflicts');
    };

    proto._itemByDate = function (date) {
        /// <summary>Returns the first item starting on or after the given date</summary>
        /// <param name="date">The Date object representing the date we are looking for</param>
        /// <returns>The first item on or after that date, if one exists, otherwise the null is returned</returns>
        Debug.assert(Jx.isDate(date), 'Jx.isDate(date)');
        Debug.assert(Jx.isObject(this._sortedList), 'Jx.isObject(this._sortedList)');

        var list = this._sortedList;

        for (var i = 0, len = list.length; i < len; i++) {
            // Find the first item whose date is either equal to or greater than the base date
            var item = list.getAt(i);
            if (AgendaHelpers.compareDates(date, item.startDate) <= 0) {
                return item;
            }
        }

        // We couldn't find anything in range
        return null;
    };

    proto._findConflicts = function (startIndex, endIndex) {
        /// <summary>Find conflicting events in the given list</summary>
        /// <param name="start">The start index of the search window (inclusive)</param>
        /// <param name="end">The end index of the search window (exclusive)</param>
        /// <returns>A map of unique ID to conflict value (True indicates a conflict, undefined indicates no conflict)</returns>
        Debug.assert(Jx.isValidNumber(startIndex) && startIndex >= 0, 'Jx.isValidNumber(startIndex) && startIndex >= 0');
        Debug.assert(Jx.isValidNumber(endIndex), 'Jx.isValidNumber(endIndex)');

        _start('_findConflicts');

        var list = this._sortedList,
            conflictMap = {},
            lastUid = -1,
            lastEnd = 0;

        for (var i = startIndex; i < endIndex; i++) {
            var item = list.getAt(i);

            if (!item.isPast && !item.allDayContainer && !item.textContainer) {
                var uid = item.uid,
                    end = item.endDate.getTime();

                if (item.startDate.getTime() < lastEnd) {
                    conflictMap[lastUid] = true;
                    conflictMap[uid] = true;
                }

                if (lastEnd < end) {
                    lastUid = uid;
                    lastEnd = end;
                }
            }
        }

        _stop('_findConflicts');

        return conflictMap;
    };

    // Event methods

    proto._createPillarItems = function () {
        /// <summary>Create the pillar items and add them to the list</summary>
        var start = AgendaHelpers.getDayFromDate(this._rangeStart, 0);

        this._noEventsItem = {
            // Event properties
            action: Agenda.ItemAction.createEvent,
            busyStatus: 0,
            endDate: AgendaHelpers.getDayFromDate(start, 1),
            isHidden: true,
            isPast: false,
            multiDay: false,
            startDate: start,

            // UI properties - escaped HTML
            infoHtml: Jx.escapeHtml(Agenda._noEvents),

            // List management properties
            allDayContainer: false,
            textContainer: true,
            showInAllDayCard: false,
            groupKey: Agenda._getDateKey(start),
            listKey: null
        };

        start = AgendaHelpers.getDayFromDate(this._rangeEnd, 0);

        this._seeMoreEventsItem = {
            // Event properties
            action: Agenda.ItemAction.viewMonth,
            busyStatus: 0,
            endDate: AgendaHelpers.getDayFromDate(start, 1),
            isHidden: true,
            isPast: false,
            multiDay: false,
            startDate: start,

            // UI properties - escaped HTML
            infoHtml: Jx.escapeHtml(Agenda._seeMoreEvents),

            // List management properties
            allDayContainer: false,
            textContainer: true,
            showInAllDayCard: false,
            groupKey: Agenda._getDateKey(start),
            listKey: null
        };

        this._addListItem(this._noEventsItem);
        this._addListItem(this._seeMoreEventsItem);
    };

    proto._updatePillarItems = function () {
        /// <summary>Updates the state of the pillar items</summary>
        _start('_updatePillarItems');

        var noEventsItem = this._noEventsItem;
        var seeMoreEventsItem = this._seeMoreEventsItem;

        if (noEventsItem && seeMoreEventsItem) {
            var noEventsItemHidden = noEventsItem.isHidden;
            var seeMoreEventsItemHidden = seeMoreEventsItem.isHidden;
            var groupedListLength = this._groupedList.length;

            if (!noEventsItemHidden) {
                groupedListLength--;
            }

            if (!seeMoreEventsItemHidden) {
                groupedListLength--;
            }

            if (groupedListLength > 0) {
                // We have a hero and/or list items
                noEventsItem.isHidden = true;
                seeMoreEventsItem.isHidden = false;
            } else {
                // The UI would be blank, make sure to show the no events helper
                noEventsItem.isHidden = false;
                seeMoreEventsItem.isHidden = true;
            }

            if (this._isCompanion()) {
                // Hide the see more item in companion view
                seeMoreEventsItem.isHidden = true;
            }

            if (noEventsItemHidden !== noEventsItem.isHidden) {
                this._notifyMutated(noEventsItem);
            }

            if (seeMoreEventsItemHidden !== seeMoreEventsItem.isHidden) {
                this._notifyMutated(seeMoreEventsItem);
            }
        }

        _stop('_updatePillarItems');
    };

    // UI methods

    proto._isCompanion = function () {
        if (this._parent) {
            Debug.assert(Jx.isFunction(this._parent.isCompanion), 'Jx.isFunction(this._parent.isCompanion)');

            return this._parent.isCompanion();
        }

        return false;
    };

    proto._setActiveItem = function () {
        /// <summary>Determine the active item and set it</summary>
        if (!this._getEventsCompleted) {
            // We haven't finished loading the initial set of events yet
            return;
        }

        var index;
        var focused = false;

        // Capture the values and nullify them so we won't apply them on the next call
        var eventToFocus = this._eventToFocus;
        var state = this._state;

        this._eventToFocus = null;
        this._state = null;

        if (eventToFocus) {
            Debug.assert(Jx.isNonEmptyString(eventToFocus.handle), 'Jx.isNonEmptyString(eventToFocus.handle)');
            Debug.assert(Jx.isDate(eventToFocus.startDate), 'Jx.isDate(eventToFocus.startDate)');

            var list = this._groupedList;
            var wrapper = this._handleMap[eventToFocus.handle];
            var item;

            if (Jx.isObject(wrapper)) {
                Debug.assert(wrapper.items.length > 0, 'item.items.length > 0');
                
                item = wrapper.items[0];
                
                if (item.showInAllDayCard) {
                    // The item ended up in an all day card, focus on that instead
                    item = this._allDayMap[item.groupKey];
                }
                
                if (item.allDayContainer && item.groupKey === this._todayGroupKey) {
                    this._focusAllDayHero();
                    focused = true;
                } else {
                    index = Agenda._getIndexOfItem(list, item);

                    if (index >= 0) {
                        this._focusListItem(index, true);
                        focused = true;
                    }
                }
            } else {
                // Assume an index of zero
                index = 0;

                // Get the item that would occur on or after the event
                item = this._itemByDate(eventToFocus.startDate);
                index = Agenda._getIndexOfItem(list, item) - 1;

                // Ensure index is never lower than zero
                if (index < 0) {
                    index = 0;
                }

                this._focusListItem(index, true);
                focused = true;
            }
        } else if (state) {
            this._applyListState(state);
            focused = true;
        }

        if (!focused) {
            this._focusListItem(0, true);
        }
    };

    proto._applyListState = function (state) {
        /// <summary>Applies the captured list state to the list</summary>
        /// <param name="state">An object containing ListView state</param>
        Debug.assert(Jx.isObject(state), 'Jx.isObject(state)');
        Debug.assert(Jx.isObject(state.currentItem), 'Jx.isObject(state.currentItem)');
        Debug.assert(Jx.isValidNumber(state.indexOfFirstVisible), 'Jx.isValidNumber(state.indexOfFirstVisible)');
        Debug.assert(Jx.isValidNumber(state.scrollPosition), 'Jx.isValidNumber(state.scrollPosition)');
        Debug.assert(Jx.isObject(this._listView), 'Jx.isObject(this._listView)');

        var listView = this._listView;
        listView.indexOfFirstVisible = state.indexOfFirstVisible;
        listView.scrollPosition = state.scrollPosition;
        listView.currentItem = state.currentItem;
    };

    proto._focusListItem = function (index, firstVisible) {
        /// <summary>Ensures that the list item is focused</summary>
        /// <param name="index">The item's index in the visible list</param>
        /// <param name="firstVisible" optional="True">Whether to make sure the item is the first in the viewport (false will ensure that the item is visible somewhere in the viewport)</param>
        Debug.assert(Jx.isValidNumber(index) && index >= 0, 'Jx.isValidNumber(index) && index >= 0');
        Debug.assert(Jx.isUndefined(firstVisible) || Jx.isBoolean(firstVisible), 'Jx.isUndefined(firstVisible) || Jx.isBoolean(firstVisible)');
        Debug.assert(Jx.isObject(this._listView), 'Jx.isObject(this._listView)');

        if (this._focusListItemReady) {

            this._pendingFocusListItem = false;
            this._pendingFocusListItemFn = null;

            // The ListView has completed rendering, just set it now
            this._listView.currentItem = {
                index: index,
                hasFocus: true,
            };

            if (firstVisible) {
                this._listView.indexOfFirstVisible = index;
            } else {
                this._listView.ensureVisible(index);
            }
        } else {
            // Workaround for WinJS Listview bug 484373. Delay setting indexOfFirstVisible until after the listview is loaded.
            this._pendingFocusListItem = true;
            this._pendingFocusListItemFn = this._focusListItem.bind(this, index, firstVisible);
        }
    };

    proto._focusAllDayHero = function () {
        if (!this._todayAllDayContainer) {
            this._shouldFocusAllDayHero = true;
        } else {
            this._shouldFocusAllDayHero = false;
            Jx.safeSetActive(this._todayAllDayContainer);
        }
    };

    // Hero methods

    proto._updateAllDayHero = function () {
        /// <summary>Perform an all day container update</summary>
        _startAsync('_updateAllDayHero');

        var forceUpdate = this._allDayHeroUpdateForced;

        this._allDayHeroUpdateForced = false;
        this._allDayHeroUpdateScheduled = false;

        var oldItem = null;
        var item = null;
        var allDayToday = this._allDayMap[this._todayGroupKey];

        if (!allDayToday) {
            // We need to remove the old container, if any.
            oldItem = this._todayAllDayContainer;
            this._todayAllDayContainer = null;
        } else {
            // Ensure the items in the container are up to date
            var needsUpdate = this._updateAllDayItems(allDayToday);

            if (needsUpdate || forceUpdate) {
                // We need an update, make sure it's not hidden first
                oldItem = this._todayAllDayContainer;
                this._todayAllDayContainer = null;

                if (!allDayToday.isHidden) {
                    // If we're not hidden, render the replacement item
                    item = this._todayAllDayContainer = Templates.item({
                        item: allDayToday,
                        maxAllDay: 3,
                    });

                    item.setAttribute('role', 'link');
                    item.tabIndex = 0;
                    AgendaHelpers.registerInteractiveHandlers(item);

                    item.addEventListener('click', this._onHeroAllDayInvoked, 'false');
                    item.addEventListener('keydown', this._onHeroAllDayInvoked, 'false');
                }
            }
        }

        if (oldItem) {
            // Make sure to remove the event listeners from the old event
            oldItem.removeEventListener('click', this._onHeroAllDayInvoked, 'false');
            oldItem.removeEventListener('keydown', this._onHeroAllDayInvoked, 'false');

            AgendaHelpers.unregisterInteractiveHandlers(oldItem);
            oldItem.tabIndex = -1;
        }

        // Cancel any current animation
        if (this._heroAnimationPromise) {
            this._heroAnimationPromise.cancel();
            this._heroAnimationPromise = null;
        }

        if (item) {
            // We have a new item, add it to the DOM and animate it in
            this._allDayHero.appendChild(item);

            if (oldItem) {
                this._heroAnimationPromise = Animation.crossFade(item, oldItem);
            } else {
                this._heroAnimationPromise = Animation.fadeIn(item);
            }
        } else if (oldItem) {
            // There's no new item so it's time to remove the old one
            this._heroAnimationPromise = Animation.fadeOut(oldItem);
        } else {
            // There's not need for an animation, use a wrapper instead
            this._heroAnimationPromise = WinJS.Promise.wrap();
        }
        
        var that = this;
        this._heroAnimationPromise.done(function () {
            // Handle any cleanup tasks, if applicable
            if (item) {
                item.style.opacity = '';
                
                if (that._shouldFocusAllDayHero) {
                    that._focusAllDayHero();
                }
            }

            if (oldItem) {
                that._allDayHero.removeChild(oldItem);
            }

            _stopAsync('_updateAllDayHero');
        });
    };

    proto._scheduleAllDayHeroUpdate = function (forceUpdate) {
        /// <summary>Schedule an all day container update</summary>
        this._allDayHeroUpdateForced = this._allDayHeroUpdateForced || forceUpdate;

        if (!this._allDayHeroUpdateScheduled) {
            this._allDayHeroUpdateScheduled = true;

            this._listJobSet.addUIJob(this, this._updateAllDayHero, null, People.Priority.perfLowFidelity);
        }
    };

    proto._updateHeroItems = function () {
        /// <summary>Update the hero items (now and next)</summary>
        Debug.assert(Jx.isObject(this._sortedList), 'Jx.isObject(this._sortedList)');

        _start('_updateHeroItems');

        var list = this._sortedList;
        var timerFound = false;

        // Capture the current up next hero item and clear it out
        var previousUpNextHeroItem = this._upNextHeroItem;
        this._upNextHeroItem = null;

        if (previousUpNextHeroItem) {
            // Mark the item as a non-hero, it will be marked again during the search if it's still valid
            previousUpNextHeroItem.isHero = false;
        }

        for (var i = 0, len = list.length; i < len; i++) {
            var item = list.getAt(i);

            if (item.textContainer || item.allDayContainer || item.isPast) {
                // Text containers can't be in the hero
                continue;
            }

            var startDate = item.startDate;
            var startInfo = Helpers.getDayInfo(this._now, startDate);
            var timerStart = new Date(startDate.getTime() - 15 * Helpers.minuteInMilliseconds);

            if (AgendaHelpers.compareDates(timerStart, this._now) <= 0) {
                // The event has started or needs a timer
                if (AgendaHelpers.compareDates(startDate, this._now) > 0) {
                    // The event hasn't started
                    timerFound = true;
                }

                this._updateHeroItem(item, true);
            } else if (!timerFound && startInfo.isToday) {
                // There are no timer items and we're still looking at today, update this item and break out
                this._upNextHeroItem = item;
                this._updateHeroItem(item, true);
                break;
            } else {
                // We've found some timer items, break out.
                break;
            }
        }

        if (previousUpNextHeroItem && previousUpNextHeroItem.listKey && !previousUpNextHeroItem.isHero) {
            // Our previous item is still not a hero, clear out the hero status
            this._updateHeroItem(previousUpNextHeroItem, false);
        }

        _stop('_updateHeroItems');
    };

    proto._updateHeroItem = function (item, isHero) {
        /// <summary>Updates a single hero item (or clears the hero state, if needed)</summary>
        /// <param name="item">The event item</param>
        /// <param name="isHero">Indicates whether the item should be treated as a hero, false will reset it back to a standard item</param>
        Debug.assert(Jx.isObject(item), 'Jx.isObject(item)');
        Debug.assert(Jx.isBoolean(isHero), 'Jx.isBoolean(isHero)');

        _start('_updateHeroItem');

        var oldHeroTextHtml = item.heroTextHtml;

        var heroHeader = isHero ? AgendaHelpers.getHeroHeader(this._now, item) : '';
        var heroLabel = AgendaHelpers.getEventLabel(item.event, item, this._now, isHero);

        item.isHero = isHero;
        item.heroTextHtml = Jx.escapeHtml(heroHeader);
        item.label = heroLabel;

        // Only update the list item if the string has changed
        if (oldHeroTextHtml !== item.heroTextHtml) {
            this._setAt(item.listKey, item);
        }

        _stop('_updateHeroItem');
    };

    proto._updateAllDayItems = function (allDayContainer) {
        /// <summary>Updates the visibility of items in the all day container</summary>
        /// <param name="allDayContainer">The all day container item</param>
        /// <returns>True if any items were updated, false otherwise</returns>
        Debug.assert(Jx.isObject(allDayContainer), 'Jx.isObject(allDayContainer)');
        Debug.assert(Jx.isBoolean(allDayContainer.allDayContainer) && allDayContainer.allDayContainer, 'Jx.isBoolean(allDayContainer.allDayContainer) && allDayContainer.allDayContainer');
        Debug.assert(Jx.isArray(allDayContainer.items), 'Jx.isArray(allDayContainer.items)');

        // Iteration flags
        var allDayUpdate = false;
        var visibleAllDayItems = false;

        var items = allDayContainer.items;
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];

            // Look for items that aren't currently hidden
            if (!item.isPast) {
                // Look for items that need to be hidden
                if (item.endDate - this._now <= 0) {
                    // The event has passed, mark it as hidden and signal an update
                    allDayUpdate = true;
                    item.isPast = true;
                } else {
                    // The event is still current, so this all day card needs to be visible
                    visibleAllDayItems = true;
                }
            }
        }

        allDayContainer.isHidden = !visibleAllDayItems;
        return allDayUpdate;
    };

    proto._invokeItem = function (item, element) {
        /// <summary>Invokes the action for the specified item</summary>
        /// <param name="item">The ListView item object; item.data contains the wrapped event object</param>
        Debug.assert(Jx.isObject(item), 'Jx.isObject(item)');
        Debug.assert(Jx.isValidNumber(item.action), 'Jx.isValidNumber(item.action)');

        switch (item.action) {
            case Agenda.ItemAction.editEvent:
                Debug.assert(Jx.isNonEmptyString(item.handle), 'Jx.isNonEmptyString(item.handle)');
                Debug.assert(Jx.isObject(element), 'Jx.isObject(element)');

                Helpers.editEvent(this, item.handle, element);
                break;

            case Agenda.ItemAction.createEvent:
                this.fire('createEvent');
                break;

            case Agenda.ItemAction.viewDay:
                Debug.assert(Jx.isDate(item.startDate), 'Jx.isDate(item.startDate)');

                this.fire('dayChosen', item.startDate);
                break;

            case Agenda.ItemAction.viewMonth:
                Debug.assert(Jx.isDate(item.startDate), 'Jx.isDate(item.startDate)');
                Debug.assert(Jx.isObject(this._groupedList), 'Jx.isObject(this._groupedList)');
                Debug.assert(Jx.isValidNumber(this._groupedList.length), 'Jx.isValidNumber(this._groupedList.length)');

                // BUGBUG(326705): Only do this when not in companion mode
                if (!this._isCompanion()) {
                    // Save the datapoint
                    Jx.bici.addToStream(this._getIdsCalendar().calendarAgendaShowMore, this._groupedList.length);

                    this.fire('monthChosen', item.startDate);
                }

                break;

            default:
                Debug.assert(false, 'Invalid ItemAction value');
        }
    };

    proto._hydrateChangeInfo = function (changeInfo) {
        /// <summary>Hydrates the dates in the event change, they come in as integers</summary>
        /// <param name="changeInfo">The info object associated with the currently processed change</param>
        Debug.assert(Jx.isObject(changeInfo), 'Jx.isObject(changeInfo)');
        Debug.assert(Jx.isValidNumber(changeInfo.startDate), 'Jx.isValidNumber(changeInfo.startDate)');
        Debug.assert(Jx.isValidNumber(changeInfo.endDate), 'Jx.isValidNumber(changeInfo.endDate)');
        Debug.assert(Jx.isNonEmptyString(changeInfo.handle), 'Jx.isNonEmptyString(changeInfo.handle)');
        Debug.assert(Jx.isBoolean(changeInfo.showInAllDayCard), 'Jx.isBoolean(changeInfo.showInAllDayCard)');
        Debug.assert(Jx.isArray(changeInfo.items), 'Jx.isArray(changeInfo.items)');

        _start('_hydrateChangeInfo');

        changeInfo.startDate = new Date(changeInfo.startDate);
        changeInfo.endDate = new Date(changeInfo.endDate);

        var items = changeInfo.items;
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];

            Debug.assert(Jx.isObject(item), 'Jx.isObject(item)');
            Debug.assert(Jx.isValidNumber(item.startDate), 'Jx.isValidNumber(item.startDate)');
            Debug.assert(Jx.isValidNumber(item.endDate), 'Jx.isValidNumber(item.endDate)');

            // Assign the item a unique ID
            item.uid = this._uid++;
            
            // Get a reference to the parent container
            item.event = changeInfo;

            // Create Date objects from the integer timestamps
            item.startDate = new Date(item.startDate);
            item.endDate = new Date(item.endDate);
            
            // Add event item UI metadata
            item.handle = changeInfo.handle;
            item.action = Agenda.ItemAction.editEvent;
            item.conflict = false;
            item.isHero = false;         
            item.heroTextHtml = '';
            
            // Add event item list metadata
            item.groupKey = Agenda._getDateKey(item.startDate);
            item.listKey = null;

            item.showInAllDayCard = changeInfo.showInAllDayCard;
            item.allDayContainer = false;
            item.isHidden = false;
            item.isPast = false;
        }

        _stop('_hydrateChangeInfo');
    };

    // Jx Events

    proto._onEventsChanged = function (data) {
        /// <summary>Handles event changes from the worker</summary>
        /// <param name="data">The data object received from the worker</param>
        Debug.assert(this.hasUI(), 'this.hasUI()');
        Debug.assert(Jx.isObject(data), 'Jx.isObject(data)');
        Debug.assert(Jx.isValidNumber(data.id), 'Jx.isValidNumber(data.id)');
        Debug.assert(Jx.isArray(data.changes), 'Jx.isArray(data.changes)');

        if (this._workerId !== data.id) {
            // This event isn't from our current worker job, ignore it.
            return;
        }

        _start('_onEventsChanged');

        // It's time to begin editing the list, notify the data source
        var listViewDataSource = this._groupedList.dataSource;
        listViewDataSource.beginEdits();

        var changes = data.changes;
        for (var i = 0, len = changes.length; i < len; i++) {
            var change = changes[i];
            var info = change.info;

            switch (change.type) {
                case AgendaHelpers.ChangeType.add:
                    this._hydrateChangeInfo(info);
                    this._addEventToList(info);
                    break;

                case AgendaHelpers.ChangeType.change:
                    this._hydrateChangeInfo(info);
                    this._replaceEventInList(info);
                    break;

                case AgendaHelpers.ChangeType.remove:
                    this._removeEventFromList(info.objectId);
                    break;
            }
        }

        this._ensurePastItemsHidden();
        this._updateHeroItems();
        this._updatePillarItems();

        // We've finished our updates, notify the data source
        listViewDataSource.endEdits();

        // Schedule the job to update the conflicts
        this._listJobSet.addUIJob(this, this._updateConflicts, null, People.Priority.perfHighFidelity);

        _stop('_onEventsChanged');
    };

    proto._onGetEvents = function (data) {
        /// <summary>Handles the completion event of the worker's "getEvents" call</summary>
        /// <param name="data">The data object received from the worker</param>
        Debug.assert(this.hasUI(), 'this.hasUI()');
        Debug.assert(Jx.isObject(data), 'Jx.isObject(data)');
        Debug.assert(Jx.isValidNumber(data.id), 'Jx.isValidNumber(data.id)');

        if (this._workerId !== data.id) {
            // This event isn't from our current worker job, ignore it.
            return;
        }

        _start('_onGetEvents');
        
        // Set the flag to indicate that we have finished the initial load
        this._getEventsCompleted = true;

        // We have finished with the initial set of events, time to apply state and set the correct item active
        this._ensureListView();
        this._connectDataSource();
        this._setActiveItem();

        _stop('_onGetEvents');
    };

    proto._onMinuteChanged = function (minute) {
        /// <summary>Handles minuteChanged events</summary>
        /// <param name="minute">The new Date object representing the current minute</param>
        Debug.assert(Jx.isDate(minute), 'Jx.isDate(minute)');

        _start('_onMinuteChanged');

        // Capture the previous time for comparison
        var prev = this._now;
        this._now = minute;

        if (Helpers.isSameDate(prev, this._now)) {
            // We're still within the same day, just update as usual
            this._ensurePastItemsHidden();
            this._scheduleAllDayHeroUpdate(false);
            this._updateHeroItems();
            this._updatePillarItems();

            // Update the conflicts just for today in case any past item have been removed
            this._listJobSet.addUIJob(this, this._updateConflicts, [this._now, this._now], People.Priority.perfHighFidelity);
        } else {
            // The day changed, time to refresh the interface
            this._today = AgendaHelpers.getDayFromDate(minute);
            this._jobSet.addUIJob(this, this._updateDateRange, null, People.Priority.perfLowFidelity);
        }

        _stop('_onMinuteChanged');
    };

    proto._onWindowResize = function (ev) {
        /// <summary>Handles windows resize events</summary>
        Debug.assert(Jx.isObject(ev), 'Jx.isObject(ev)');
        Debug.assert(Jx.isObject(ev.data), 'Jx.isObject(ev.data)');
        Debug.assert(Jx.isValidNumber(ev.data.outerWidth), 'Jx.isValidNumber(ev.data.outerWidth)');

        this._ensureLayout(ev.data.outerWidth);
    };

    // List Events

    proto._getGroupHeader = function (item) {
        /// <summary>Creates a group header string from a given wrapped event item</summary>
        /// <param name="item">A wrapped event item</param>
        /// <returns>The group header string</returns>
        Debug.assert(Jx.isObject(item), 'Jx.isObject(item)');
        Debug.assert(Jx.isDate(item.startDate), 'Jx.isDate(item.startDate)');

        var date = AgendaHelpers.getDayFromDate(item.startDate);

        var data = {
            date: date,
            text: null
        };

        if (date.getTime() < this._rangeEnd.getTime()) {
            // The date falls within the range
            data.text = AgendaHelpers.getDateString(this._today, date);
        } else {
            data.text = Agenda._monthWithYear.format(date);
        }

        return data;
    };

    proto._onListItemInserted = function (ev) {
        /// <summary>Handles list item insertions</summary>
        /// <param name="ev">The event arguments</param>
        Debug.assert(Jx.isObject(ev), 'Jx.isObject(ev)');

        // Retrieve the wrapped event object
        var item = ev.detail.value;

        // Capture the list key for later use
        item.listKey = ev.detail.key;
    };

    proto._onListItemRemoved = function (ev) {
        /// <summary>Handles list item removals</summary>
        /// <param name="ev">The event arguments</param>
        Debug.assert(Jx.isObject(ev), 'Jx.isObject(ev)');

        // Retrieve the wrapped event object
        var item = ev.detail.value;

        // Clear the list key
        item.listKey = null;
    };

    // ListView Events

    proto._onListViewItemTemplate = function (itemPromise) {
        /// <summary>The ListView item template handler</summary>
        /// <param name="itemPromise">The ListView's item promise object</param>
        Debug.assert(Jx.isObject(itemPromise), 'Jx.isObject(itemPromise)');

        var that = this;
        return itemPromise.then(function (item) {
            /// <summary>Returns the DOM element representation of the wrapped event item</summary>
            /// <param name="item">The ListView item object; item.data contains the wrapped event object</param>
            /// <returns>A single DOM element to be rendered in the list</returns>
            Debug.assert(Jx.isObject(item), 'Jx.isObject(item)');
            Debug.assert(Jx.isObject(item.data), 'Jx.isObject(item.data)');

            return Templates.item({
                item: item.data,
                maxAllDay: that._maxAllDayItems
            });
        });
    };

    proto._onListViewGroupHeaderTemplate = function (groupHeaderPromise) {
        /// <summary>The ListView group header template handler</summary>
        /// <param name="groupHeaderPromise">The ListView's item promise object</param>
        Debug.assert(Jx.isObject(groupHeaderPromise), 'Jx.isObject(groupHeaderPromise)');

        return groupHeaderPromise.then(function (groupHeader) {
            /// <summary>Returns the DOM element representation of the group header</summary>
            /// <param name="item">The ListView group header object; groupHeader.data contains the groupd header data object</param>
            /// <returns>A single DOM element to be rendered as the group header</returns>
            Debug.assert(Jx.isObject(groupHeader), 'Jx.isObject(groupHeader)');
            Debug.assert(Jx.isObject(groupHeader.data), 'Jx.isObject(groupHeader.data)');

            return Templates.groupHeader(groupHeader);
        });
    };

    proto._onListViewLoadingStateChanged = function (ev) {
        /// <summary>Handles ListView loading state changes</summary>
        /// <param name="ev">The event arguments</param>
        Debug.assert(Jx.isObject(ev), 'Jx.isObject(ev)');

        if (this._listView.loadingState === 'complete') {
            Debug.assert(this._listViewLoadingItems, 'this._listViewLoadingItems');

            // Loading items is complete
            this._listViewLoadingItems = false;
            
            _stopAsync('_listViewLoadingItems');

            // Workaround for WinJS Listview bug 484373. Delay setting indexOfFirstVisible until after the listview is loaded.
            this._focusListItemReady = true;
            if (this._pendingFocusListItem) {
                Debug.assert(this._pendingFocusListItemFn);
                this._pendingFocusListItemFn();
            }
        } else if (!this._listViewLoadingItems) {
            // This is the first event since the last complete, we're loading items
            this._listViewLoadingItems = true;
            _startAsync('_listViewLoadingItems');
        }
    };

    proto._onListViewItemInvoked = function (ev) {
        /// <summary>Handles ListView item invocation events</summary>
        /// <param name="ev">The event arguments</param>
        Debug.assert(Jx.isObject(ev), 'Jx.isObject(ev)');
        Debug.assert(Jx.isObject(ev.detail), 'Jx.isObject(ev.detail)');
        Debug.assert(Jx.isObject(ev.detail.itemPromise), 'Jx.isObject(ev.detail.itemPromise)');

        var that = this;
        ev.detail.itemPromise.done(function (item) {
            /// <summary>Invokes the action for the specified item</summary>
            /// <param name="item">The ListView item object; item.data contains the wrapped event object</param>
            Debug.assert(Jx.isObject(item), 'Jx.isObject(item)');
            Debug.assert(Jx.isObject(item.data), 'Jx.isObject(item.data)');

            that._invokeItem(item.data, ev.target);
        });
    };

    // DOM Events

    proto._onAppBarBeforeShow = function (ev) {
        /// <summary>Handles app bar "beforeshow" events</summary>
        /// <param name="ev">The event arguments</param>
        Debug.assert(Jx.isObject(ev), 'Jx.isObject(ev)');

        var command = this._appBar.getCommandById('backgroundCommand');
        Debug.assert(Jx.isObject(command), 'Jx.isObject(command)');

        command.hidden = false;
    };

    proto._onHeroDateInvoked = function (ev) {
        /// <summary>Handles hero invocation events</summary>
        /// <param name="ev">The event arguments</param>
        Debug.assert(Jx.isObject(ev), 'Jx.isObject(ev)');

        // If it doesn't have a keyCode, it must be a mouse/touch event, otherwise make sure the keyCode is acceptable
        if (this._listView && (Jx.isUndefined(ev.keyCode) || ev.keyCode === Jx.KeyCode.space || ev.keyCode === Jx.KeyCode.enter)) {
            this._listView.indexOfFirstVisible = 0;
            this._listView.scrollPosition = 0;
            this._listView.currentItem = {
                index: 0,
                hasFocus: true,
            };
        }
    };

    proto._onHeroAllDayInvoked = function (ev) {
        /// <summary>Handles hero invocation events</summary>
        /// <param name="ev">The event arguments</param>
        Debug.assert(Jx.isObject(ev), 'Jx.isObject(ev)');
        Debug.assert(Jx.isObject(ev.currentTarget), 'Jx.isObject(ev.currentTarget)');

        // If it doesn't have a keyCode, it must be a mouse/touch event, otherwise make sure the keyCode is acceptable
        if (Jx.isUndefined(ev.keyCode) || ev.keyCode === Jx.KeyCode.space || ev.keyCode === Jx.KeyCode.enter) {
            var todayAllDay = this._allDayMap[this._todayGroupKey];
            Debug.assert(Jx.isObject(todayAllDay), 'Jx.isObject(todayAllDay)');

            this._invokeItem(todayAllDay, ev.currentTarget);
        }
    };

    proto._onPeekBarFull = function () {
        /// <summary>Handles peek bar full events</summary>
        Debug.assert(Jx.isObject(this._timeline), 'Jx.isObject(this._timeline)');

        this._timeline.classList.add('peekBarSpace');
    };

    proto._onPeekBarTab = function () {
        /// <summary>Handles peek bar tab events</summary>
        Debug.assert(Jx.isObject(this._timeline), 'Jx.isObject(this._timeline)');

        this._timeline.classList.remove('peekBarSpace');
    };
    
});
