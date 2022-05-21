
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Microsoft,Calendar,WinJS,Jx,Debug,AddressWell,setImmediate*/

Jx.delayDefine(Calendar.Views, "FreeBusy", function() {

    function _start(ev) { Jx.mark("Calendar:FreeBusy." + ev + ",StartTA,Calendar"); }
    function _stop(ev)  { Jx.mark("Calendar:FreeBusy." + ev + ",StopTA,Calendar");  }

    var Helpers = Calendar.Helpers;
    var Templates = {};
    var Animation = WinJS.UI.Animation;

    var _shortTime = new Jx.DTFormatter("shortTime");

    var FreeBusy = Calendar.Views.FreeBusy = function() {
        _start("ctor");
        this.initComponent();

        // do some one-time initialization
        if (!FreeBusy._title) {
            Helpers.ensureFormats();
            var res = Jx.res;

            FreeBusy._title   = res.getString("FreeBusyTitle");
            FreeBusy._me      = res.getString("FreeBusyMe");
            FreeBusy._unknown = res.getString("FreeBusyUnknown");

            FreeBusy._yesterday = res.getString("Yesterday");
            FreeBusy._today     = res.getString("Today");
            FreeBusy._tomorrow  = res.getString("Tomorrow");

            FreeBusy._clearRoom  = res.getString("FreeBusyClearRoom");
            FreeBusy._clearRooms = res.getString("FreeBusyClearRooms");

            FreeBusy._startLabel = res.getString("EventStartLabel");
            FreeBusy._endLabel   = res.getString("EventEndLabel");

            FreeBusy._dateFormatter  = new Jx.DTFormatter("dayofweek.abbreviated month.abbreviated day");
            FreeBusy._rangeFormatter = res.getFormatFunction("DateRange");

            FreeBusy._loadingLabel          = res.getString("FreeBusyUpdating");
            FreeBusy._loadingCompletedLabel = res.getString("FreeBusyCompleted");
        }

        // init members
        this._anchor = Calendar.getToday();
        this._start = this._anchor;
        this._end   = this._anchor;

        this._resetUiMembers();

        // bind callbacks
        this._doUpdateState = this._doUpdateState.bind(this);

        this._onRoomFinder      = this._onRoomFinder.bind(this);
        this._onAfterShowFlyout = this._onAfterShowFlyout.bind(this);
        this._onAfterHideFlyout = this._onAfterHideFlyout.bind(this);

        this._onClearRooms      = this._onClearRooms.bind(this);
        this._onToggleWorkHours = this._onToggleWorkHours.bind(this);
        this._onRefresh         = this._onRefresh.bind(this);

        this._onBack       = this._onBack.bind(this);
        this._onFocusIn    = this._onFocusIn.bind(this);
        this._onArrowClick = this._onArrowClick.bind(this);
        this._onScroll     = this._onScroll.bind(this);

        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp   = this._onPointerUp.bind(this);
        this._onAttrModifed = this._onAttrModified.bind(this);

        this._onKeyDown = this._onKeyDown.bind(this);

        _stop("ctor");
    };

    Jx.augment(FreeBusy, Jx.Component);
    Jx.augment(FreeBusy, Jx.Events);

    Debug.Events.define(FreeBusy.prototype, "back");

    //
    // Public
    //

    FreeBusy.prototype.setRange = function(start, end) {
        _start("setRange");

        if (start.getTime() !== this._start.getTime() || end.getTime() !== this._end.getTime()) {
            this._start = new Date(start);
            this._end   = new Date(end);

            var oldAnchor = this._anchor;
            this._calculateAnchor();

            // if our ui is already created, we have a bit more work to do
            if (this._host) {
                // if we've moved our anchor, we need to reset some of our ui
                if (!Helpers.isSameDate(oldAnchor, this._anchor)) {
                    // offset our stale free/busy data
                    var offset     = Math.round((this._anchor - oldAnchor) / Helpers.dayInMilliseconds) * this._dayWidth,
                        containers = this._schedules.querySelectorAll(".schedule:not(.me) > .container");

                    for (var i = 0, len = containers.length; i < len; i++) {
                        var container = containers[i],
                            style     = container.style,
                            left      = parseFloat(this._getLeft(style)) || 0;

                        left -= offset;
                        this._setLeft(style, left + "px");

                        container.parentNode.classList.add("fetching");
                    }

                    // make sure we fetch new data
                    this._updateWorkerVisible();
                    this._meSchedule.style.opacity = "0";
                }

                // set our scroll position to the start
                this._updateSlider();
                this._updateAria();
                this._setScrollPos();
                this._updateDateHeaders(true /* force */);
            }
        }

        _stop("setRange");
    };

    FreeBusy.prototype.setCalendar = function(calendar) {
        _start("setCalendar");

        if (calendar.id !== this._calendarId) {
            this._calendarId = calendar.id;
            this._color      = Helpers.processEventColor(calendar.color);

            var oldAccountId = this._accountId;
            this._accountId = calendar.account.objectId;

            // if we're not activated, we're done
            if (this._host) {
                this._updateWorkerCalendar();

                // update our ui's colors to match the calendar
                this._style.innerHTML = Templates.style.call(this);

                // we'll get a new me schedule and should re-focus the selected time
                this._meSchedule.style.opacity = "0";
                this._setScrollPos();

                // our attendees' schedules depend on the account
                if (this._accountId !== oldAccountId) {
                    this._resetScheduleUi();
                }
            }
        }

        _stop("setCalendar");
    };

    FreeBusy.prototype.setAttendees = function(attendees) {
        _start("setAttendees");

        // save our new values
        this._attendees      = [];
        this._attendeeEmails = [];

        // we'll need escaped values and just emails in multiple places
        var unique = {};

        for (var i = 0, len = attendees.length; i < len; i++) {
            var attendee = attendees[i];

            if (!attendee.isJsRecipient) {
                var email      = attendee.emailAddress,
                    emailLower = email.toLowerCase();

                if (!unique[emailLower]) {
                    this._attendeeEmails.push(email);
                    this._attendees.push({
                        emailHtml: Jx.escapeHtml(email),
                        nameHtml:  Jx.escapeHtml(attendee.calculatedUIName)
                    });

                    unique[emailLower] = true;
                }
            }
        }

        // if we're already hosted, we've rendered our attendees previously.
        // considering that, we need to figure out the diff.
        if (this._host) {
            // update our worker request
            this._worker.postCommand("FreeBusy/setAttendees", {
                attendees: this._getCombinedAttendeeEmails()
            }, this._id);

            // update our ui
            this._updateAttendeeUi();
            this._updateArrows();

            // if we're currently fetching any data, show our progress bar
            this._updateProgress();
        }

        _stop("setAttendees");
    };

    FreeBusy.prototype.setResource = function(resource) {
        // what we do depends on whether we were passed a resource
        if (resource) {
            this._setNewResource(resource);
        } else {
            this._clearResource();
        }
    };

    FreeBusy.prototype.getState = function() {
        _start("getState");

        // force an update now
        this._doUpdateState();

        var state = {
            start: new Date(this._start.getTime()),
            end:   new Date(this._end.getTime()),

            resource: this._resource
        };

        _stop("getState");
        return state;
    };

    //
    // Jx.Component
    //

    function qsa(el, query) {
        return Array.prototype.slice.call(el.querySelectorAll(query));
    }

    FreeBusy.prototype.getUI = function(ui) {
        _start("getUI");

        var BusyStatus  = Microsoft.WindowsLive.Platform.Calendar.BusyStatus,
            statusNames = Helpers.accEventStatuses;

        ui.html = Templates.main.call(this, {
            idHtml:    this._id,
            workHours: this._workHours,

            titleHtml: Jx.escapeHtml(FreeBusy._title),
            meHtml:    Jx.escapeHtml(FreeBusy._me),

            attendees: this._attendees,
            rooms:     this._rooms,

            statusBusyHtml:      Jx.escapeHtml(statusNames[BusyStatus.busy]),
            statusTentativeHtml: Jx.escapeHtml(statusNames[BusyStatus.tentative]),
            statusOofHtml:       Jx.escapeHtml(statusNames[BusyStatus.outOfOffice]),
            statusUnknownHtml:   Jx.escapeHtml(FreeBusy._unknown)
        });

        _stop("getUI");
    };

    FreeBusy.prototype.activateUI = function() {
        _start("activateUI");

        this._host = document.getElementById(this._id);
        this._initWorker();

        // we need to know whether or not we're RTL
        this._isRtl = Jx.isRtl();

        // cache important children
        this._style    = this._host.querySelector("style");
        this._back     = this._host.querySelector(".win-backbutton");
        this._date     = this._host.querySelector(".date");
        this._dayNames = this._host.querySelectorAll(".day .name");
    
        this._progress     = this._host.querySelector(".fetch-progress");
        this._progressText = this._host.querySelector(".fetch-progress-text");

        this._arrowUp   = this._host.querySelector(".arrow.up");
        this._arrowDown = this._host.querySelector(".arrow.down");

        this._scroller = this._host.querySelector(".scroller");
        this._surface  = this._scroller.querySelector(".surface");

        this._slider      = this._scroller.querySelector(".slider");
        this._sliderFocus = this._slider.querySelector(".focus-region");

        this._grabberTouchLeft  = this._slider.querySelector(".left.grabberTouch");
        this._grabberTouchRight = this._slider.querySelector(".right.grabberTouch");

        this._grabberLeft  = this._grabberTouchLeft.firstElementChild;
        this._grabberRight = this._grabberTouchRight.firstElementChild;

        this._attendeesEl    = this._host.querySelector(".attendees");
        this._meAttendee     = this._attendeesEl.querySelector(".me");
        this._otherAttendees = this._attendeesEl.querySelector(".other");
        this._roomAttendees  = this._attendeesEl.querySelector(".rooms");

        this._schedules      = this._host.querySelector(".schedules");
        this._meSchedule     = this._schedules.querySelector(".me > .container");
        this._otherSchedules = this._schedules.querySelector(".other");
        this._roomSchedules  = this._schedules.querySelector(".rooms");

        // set the pointer handlers
        this._surface._onPointerDown = this._onSurfacePointerDown;
        this._surface._onPointerUp   = this._onSurfacePointerUp;

        this._grabberTouchLeft._onPointerDown = this._onGrabberTouchPointerDown;
        this._grabberTouchLeft._onPointerMove = this._onGrabberPointerMoveLeft;
        this._grabberTouchLeft._onPointerUp   = this._onGrabberPointerUpLeft;

        this._grabberTouchRight._onPointerDown = this._onGrabberTouchPointerDown;
        this._grabberTouchRight._onPointerMove = this._onGrabberPointerMoveRight;
        this._grabberTouchRight._onPointerUp   = this._onGrabberPointerUpRight;

        this._grabberLeft._onPointerMove = this._onGrabberPointerMoveLeft;
        this._grabberLeft._onPointerUp   = this._onGrabberPointerUpLeft;

        this._grabberRight._onPointerMove = this._onGrabberPointerMoveRight;
        this._grabberRight._onPointerUp   = this._onGrabberPointerUpRight;

        // set some initial state
        this._initAppbar();
        this._updateSlider();
        this._updateAria();
        this._setScrollPos();
        this._postProcessRoomUi();
        this._updateArrows();

        // force our scroll handler to run at least once
        this._onScroll();

        // activate includes an implicit resume
        this.resume();

        _stop("activateUI");
    };

    FreeBusy.prototype.resume = function() {
        _start("resume");

        if (this._paused) {
            this._host.disabled = false;
            this._sliderFocus.setActive();

            this._hookEvents();
            this._worker.postCommand("FreeBusy/resume", null, this._id);
            this._updateProgress();

            if (this._roomFinderWell) {
                this._roomFinderWell.setDisabled(false);
            }

            this._paused = false;
        }

        _stop("resume");
    };

    FreeBusy.prototype.pause = function() {
        _start("pause");

        if (!this._paused) {
            if (this._roomFinderWell) {
                this._roomFinderWell.setDisabled(true);
            }

            this._worker.postCommand("FreeBusy/pause", null, this._id);
            this._unhookEvents();

            this._host.disabled = true;
            this._paused = true;
        }

        _stop("pause");
    };

    FreeBusy.prototype.deactivateUI = function() {
        _start("deactivateUI");

        this.pause();

        this._worker.postCommand("FreeBusy/cancel", null, this._id);
        this._worker.removeListener("FreeBusy/getEvents",     this._onGetEvents,       this);
        this._worker.removeListener("FreeBusy/eventsChanged", this._onEventsChanged,   this);
        this._worker.removeListener("FreeBusy/meAria",        this._onGetMeAria,       this);
        this._worker.removeListener("FreeBusy/schedules",     this._onGetSchedules,    this);
        this._worker.removeListener("FreeBusy/attendeeAria",  this._onGetAttendeeAria, this);

        if (this._roomFinderWell) {
            this._roomFinderWell.removeListener(AddressWell.Events.recipientsAdded,       this._onRoomsAdded,       this);
            this._roomFinderWell.removeListener(AddressWell.Events.beforeRecipientsAdded, this._onBeforeRoomsAdded, this);
            this._roomFinderWell.shutdownUI();

            this._flyoutHost.outerHTML = "";
        }

        this._commandWorkHours.removeEventListener("DOMAttrModified", this._onToggleWorkHours, false);

        this._resetUiMembers();

        _stop("deactivateUI");
    };

    //
    // Private
    //

    FreeBusy._hourWidth    = 160;
    FreeBusy._halfWidth    = FreeBusy._hourWidth / 2;
    FreeBusy._quarterWidth = FreeBusy._halfWidth / 2;
    FreeBusy._minuteWidth  = FreeBusy._hourWidth / 60;
    FreeBusy._dayWidth     = FreeBusy._hourWidth * 24;

    FreeBusy._numberOfDays = 35;
    FreeBusy._scrollWidth  = FreeBusy._dayWidth * FreeBusy._numberOfDays;

    FreeBusy._workStart = 8;
    FreeBusy._workEnd   = 19;
    FreeBusy._workHours = FreeBusy._workEnd - FreeBusy._workStart;

    FreeBusy._dayWidthForWork    = FreeBusy._hourWidth        * FreeBusy._workHours;
    FreeBusy._scrollWidthForWork = FreeBusy._dayWidthForWork  * FreeBusy._numberOfDays;

    // Templates

    Templates.style = function() {
        var style = "#" + this._id + " .schedules .status {" +
                    "    background-color: " + this._color + ";" +
                    "}" +
                    "#" + this._id + " .fetch-progress {" +
                    "    color: " + this._color + ";" +
                    "}";

        return style;
    };

    Templates.hours = function() {
        var date    = new Date(2000, 1, 1),
            dayHtml = "",
            html    = "";

        dayHtml += "<div class='day'><div class='name'></div>";

        for (var i = 0; i < 24; i++) {
            var classes = "hour";

            if (FreeBusy._workStart <= i && i < FreeBusy._workEnd) {
                classes += " work";
            }

            dayHtml += "<div class='" + classes + "'>" + Jx.escapeHtml(Helpers.simpleTime.format(date)) + "</div>";
            date.setHours(date.getHours() + 1);
        }

        dayHtml += "</div>";

        for (var j = 0, days = FreeBusy._numberOfDays; j < days; j++) {
            html += dayHtml;
        }

        return html;
    };

    Templates.attendees = function(data) {
        var attendees = data.attendees,
            html      = "";

        for (var i = 0, len = attendees.length; i < len; i++) {
            html += Templates.attendee(attendees[i]);
        }

        return html;
    };

    Templates.roomAttendees = function(data) {
        var rooms = data.rooms,
            html  = "";

        for (var i = 0, len = rooms.length; i < len; i++) {
            html += Templates.roomAttendee(rooms[i]);
        }

        return html;
    };

    Templates.schedules = function(data) {
        var attendees = data.attendees,
            html      = "";

        for (var i = 0, len = attendees.length; i < len; i++) {
            html += Templates.schedule(attendees[i]);
        }

        return html;
    };

    Templates.roomSchedules = function(data) {
        var rooms = data.rooms,
            html  = "";

        for (var i = 0, len = rooms.length; i < len; i++) {
            html += Templates.roomSchedule(rooms[i]);
        }

        return html;
    };

    Templates.main = function (data) {
        var s = 
            '<div id="' + data.idHtml + '" class="freebusy ' + (data.workHours ? 'workHours' : '') + '">' + 
                '<style>' + Templates.style.call(this, data) + '</style>' + 
                '<div role="alert" aria-live="polite" aria-hidden="true">' + 
                    '<progress class="fetch-progress" aria-hidden="true"></progress>' + 
                    '<span class="fetch-progress-text"></span>' + 
                '</div>' + 
                Templates.header.call(this, data) + 
                Templates.grid.call(this, data) + 
            '</div>';
        return s;
    };

    Templates.header = function (data) {
        var s = 
            '<div class="header">' + 
                '<button type="button" class="win-backbutton" aria-label="' + Jx.escapeHtml(Jx.res.getString('AccBackArrow')) + '"></button>' + 
                '<div class="text">' + data.titleHtml + '</div>' + 
            '</div>';
        return s;
    };

    Templates.grid = function (data) {
        var s = 
            '<div class="grid">' + 
                '<input type="button" class="arrow up" value="\ue09c" tabindex="0">' + 
                '<input type="button" class="arrow down" value="\ue09d" tabindex="0">' + 
                '<div class="date"></div>' + 
                '<div class="scrollContainer">' + 
                    '<div class="scroller">' + 
                        '<div class="surface">' + 
                            '<div class="times" aria-hidden="true">' + 
                                Templates.hours.call(this, data) + 
                            '</div>' + 
                            '<div class="schedules" aria-hidden="true">' + 
                                '<div class="me schedule">' + 
                                    '<div class="container"></div>' + 
                                '</div>' + 
                                '<div class="other">' + 
                                    Templates.schedules.call(this, data) + 
                                '</div>' + 
                                '<div class="rooms">' + 
                                    Templates.roomSchedules.call(this, data) + 
                                '</div>' + 
                            '</div>' + 
                            '<div class="slider">' + 
                                '<div class="left line"></div>' + 
                                '<div class="right line"></div>' + 
                                '<div class="focus-region" tabindex="0" role="slider" aria-live="assertive" aria-valuemin="0" aria-valuemax="10" aria-valuenow="5"></div>' + 
                                '<div class="left grabberTouch" role="slider" aria-live="assertive" tabindex="0" aria-valuemin="0" aria-valuemax="10" aria-valuenow="5">' + 
                                    '<div class="grabber"></div>' + 
                                '</div>' + 
                                '<div class="right grabberTouch" role="slider" aria-live="assertive" tabindex="0" aria-valuemin="0" aria-valuemax="10" aria-valuenow="5">' + 
                                    '<div class="grabber"></div>' + 
                                '</div>' + 
                            '</div>' + 
                        '</div>' + 
                    '</div>' + 
                '</div>' + 
                '<div class="attendeeContainer">' + 
                    '<div class="attendees">' + 
                        '<div class="attendee me" tabindex="0" aria-live="polite">' + data.meHtml + '</div>' + 
                        '<div class="other">' + 
                            Templates.attendees.call(this, data) + 
                        '</div>' + 
                        '<div class="rooms">' + 
                            Templates.roomAttendees.call(this, data) + 
                        '</div>' + 
                    '</div>' + 
                '</div>' + 
            '</div>';
        return s;
    };

    Templates.attendee = function (data) {
        var s = 
            '<div class="attendee" data-attendee="' + data.emailHtml + '" tabindex="0" aria-live="polite">' + 
                data.nameHtml + 
            '</div>';
        return s;
    };

    Templates.roomAttendee = function (data) {
        var roomId = "room" + Jx.uid();
        var s =
            '<div class="room">' + 
                '<input type="radio" id="' + roomId + '" class="room-radio" data-attendee="' + data.emailHtml + '" tabindex="0" aria-live="polite"';
                    if (data.checked) { 
                        s += ' checked="true"'; 
                    }
                    s += '>' + 
                '<label data-for="' + data.roomId + '" class="name">' + 
                    data.nameHtml + 
                '</label>' + 
            '</div>';
        return s;
    };

    Templates.schedule = function (data) {
        var s = 
            '<div class="schedule fetching" data-attendee="' + data.emailHtml + '">' + 
                '<div class="container"></div>' + 
            '</div>';
        return s;
    };

    Templates.roomSchedule = function (data) {
        var s = 
            '<div class="schedule fetching" data-attendee="' + data.emailHtml + '">' + 
                '<div class="container"></div>' + 
            '</div>';
        return s;
    };

    // Utils

    FreeBusy.prototype._resetUiMembers = function() {
        this._host   = null;
        this._worker = null;

        this._dayOffset = -1;

        this._updateTimeout = null;
        this._setWorkHours(true);

        this._calendarId = null;
        this._accountId  = null;
        this._color      = null;

        this._attendees      = [];
        this._attendeeEmails = [];

        this._rooms      = [];
        this._roomEmails = [];
        this._resource   = null;

        this._paused = true;

        this._appbar            = null;
        this._commandClearRooms = null;
        this._commandWorkHours  = null;

        this._flyoutHost     = null;
        this._flyout         = null;
        this._roomFinderWell = null;

        this._style = null;
        this._back  = null;
        this._date  = null;
    
        this._progress     = null;
        this._progressText = null;

        this._arrowUp   = null;
        this._arrowDown = null;

        this._scroller = null;
        this._surface  = null;

        this._slider      = null;
        this._sliderFocus = null;

        this._grabberTouchLeft  = null;
        this._grabberTouchRight = null;

        this._grabberLeft  = null;
        this._grabberRight = null;

        this._attendeesEl    = null;
        this._meAttendee     = null;
        this._otherAttendees = null;
        this._roomAttendees  = null;

        this._schedules      = null;
        this._meSchedule     = null;
        this._otherSchedules = null;
        this._roomSchedules  = null;

        this._pointerTarget = null;
        this._pointerId     = null;

        this._scrollLeft   = 0;
        this._scrollHeight = 0;
        this._offsetHeight = 0;
        this._translateY   = 0;

        this._initialSurfaceX = 0;
    };

    FreeBusy.prototype._initAppbar = function() {
        // get the app bar
        var data = {};
        this.fire("getAppBar", data);
        this._appbar = data.appBar;

        /* Remove room finder entry points for M1.

        // create our room finder flyout and host
        this._flyoutHost = document.createElement("div");
        this._flyoutHost.className = "freebusy-roomfinder";

        // put the host in the app's body
        this._flyout = new WinJS.UI.Flyout(this._flyoutHost);
        this._flyout.addEventListener("aftershow", this._onAfterShowFlyout);
        this._flyout.addEventListener("afterhide", this._onAfterHideFlyout);
        document.body.appendChild(this._flyoutHost);

        */

        // set our appbar commands
        var res = Jx.res;
        this._appbar.commands = [
            // Left
            /* Remove room finder entry points for M1.

            {
                icon:  "\uE0B6",
                id:    "roomFinderCommand",
                label: res.getString("FreeBusyRoomFinder"),

                section: "selection",
                type:    "flyout",
                flyout:  this._flyout,

                onclick: this._onRoomFinder
            },
            {
                icon:  "\uE0B8",
                id:    "clearRoomsCommand",
                label: FreeBusy._clearRoom,

                section: "selection",
                type:    "button",
                hidden:  !this._resource,

                onclick: this._onClearRooms
            },

            */

            // Right
            {
                id:    "refreshCommand",
                icon:  "\uE117",
                label: res.getString("FreeBusyRefresh"),

                section: "global",
                type:    "button",

                onclick: this._onRefresh
            },
            {
                icon:  "\uE16E",
                id:    "workHoursCommand",
                label: res.getString("FreeBusyWorkHours"),

                section:  "global",
                type:     "toggle",
                selected: this._workHours
            }
        ];

        // get some commands we'll update over time
        /* Remove room finder entry points for M1.
        this._commandClearRooms = this._appbar.getCommandById("clearRoomsCommand");
        */
        this._commandWorkHours  = this._appbar.getCommandById("workHoursCommand");
        this._commandWorkHours.addEventListener("DOMAttrModified", this._onToggleWorkHours, false);
    };

    FreeBusy.prototype._getLeft = function(style) {
        return this._isRtl ? style.right : style.left;
    };

    FreeBusy.prototype._getRight = function(style) {
        return this._isRtl ? style.left : style.right;
    };

    FreeBusy.prototype._setLeft = function(style, value) {
        if (this._isRtl) {
            style.right = value;
        } else {
            style.left = value;
        }
    };

    FreeBusy.prototype._setRight = function(style, value) {
        if (this._isRtl) {
            style.left = value;
        } else {
            style.right = value;
        }
    };

    FreeBusy.prototype._setWorkHours = function(enabled) {
        if (enabled !== this._workHours) {
            var classFn;

            // set some members based on our state
            if (enabled) {
                this._workHours   = true;
                this._hourOffset  = FreeBusy._workStart;
                this._hoursPerDay = FreeBusy._workHours;
                this._dayWidth    = FreeBusy._dayWidthForWork;
                this._scrollWidth = FreeBusy._scrollWidthForWork;

                classFn = "add";

                // adjust our slider to fit work hours
                var startHours = this._start.getHours(),
                    endHours   = this._end.getHours(),
                    offset;

                if (startHours < FreeBusy._workStart) {
                    offset = FreeBusy._workStart - startHours;
                    this._start.setHours(FreeBusy._workStart);

                    endHours += offset;
                    this._end.setHours(endHours);
                } else if (FreeBusy._workEnd <= startHours) {
                    offset = startHours - FreeBusy._workEnd + 1;
                    var startMinutes = this._start.getMinutes();

                    this._start.setHours(startHours - offset);
                    this._start.setMinutes(0);

                    endHours -= offset;
                    this._end.setHours(endHours);
                    this._end.setMinutes(this._end.getMinutes() - startMinutes);
                }

                if (endHours < FreeBusy._workStart) {
                    this._end.setHours(FreeBusy._workStart);
                } else if (FreeBusy._workEnd <= endHours) {
                    this._end.setHours(FreeBusy._workEnd);
                    this._end.setMinutes(0);
                }
            } else {
                this._workHours   = false;
                this._hourOffset  = 0;
                this._hoursPerDay = 24;
                this._dayWidth    = FreeBusy._dayWidth;
                this._scrollWidth = FreeBusy._scrollWidth;

                classFn = "remove";
            }

            // if we're hosted, we need to update our existing ui
            if (this._host) {
                this._host.classList[classFn]("workHours");

                // clear out our existing schedules
                var schedules = this._schedules.querySelectorAll(".schedule .container");

                for (var i = 0, len = schedules.length; i < len; i++) {
                    schedules[i].innerHTML = "";
                }

                // ask for new schedules
                this._worker.postCommand("FreeBusy/setWorkHours", {
                    workHours: enabled
                }, this._id);

                // update the slider and scroll position
                this._updateSlider();
                this._setScrollPos();

                // ensure the appbar button is toggled correctly
                this._commandWorkHours.selected = enabled;
            }
         }
    };

    FreeBusy.prototype._setNewResource = function(resource) {
        var email = resource.email;

        // only do more work if we don't have a resource or if it's different
        if (!this._resource || this._resource.email !== email) {
            var emailLower = email.toLowerCase(),
                uiName     = resource.name;

            // save the resource specially
            this._resource = {
                email: emailLower,
                name:  uiName,

                emailHtml: Jx.escapeHtml(emailLower),
                nameHtml:  Jx.escapeHtml(uiName),

                checked: true
            };

            // set the resource as our only room
            this._roomEmails = [emailLower];
            this._rooms      = [this._resource];

            // update our ui if we're hosted
            if (this._host) {
                // insert the new rooms
                this._roomAttendees.innerHTML = Templates.roomAttendees({ rooms: this._rooms });
                this._roomSchedules.innerHTML = Templates.roomSchedules({ rooms: this._rooms });

                // ensure all the radio buttons belong to one group
                this._postProcessRoomUi();
                this._updateArrows();

                // update our worker request
                this._worker.postCommand("FreeBusy/setAttendees", {
                    attendees: this._getCombinedAttendeeEmails()
                }, this._id);
            }
        }
    };

    FreeBusy.prototype._clearResource = function() {
        if (this._resource) {
            // clear out our existing resource
            this._resource = null;

            // update our ui, if it exists
            if (this._host) {
                // ensure none of the rooms are checked
                var rooms = qsa(this._roomAttendees, "input");

                for (var i = 0, len = rooms.length; i < len; i++) {
                    rooms[i].checked = false;
                }

                // update our worker request
                this._worker.postCommand("FreeBusy/setAttendees", {
                    attendees: this._getCombinedAttendeeEmails()
                }, this._id);
            }
        }
    };

    FreeBusy.prototype._calculateAnchor = function() {
        // get some values we'll need
        var year  = this._start.getFullYear(),
            month = this._start.getMonth(),
            date  = this._start.getDate(),
            today = Calendar.getToday();

        // if we're in work hours, we might need to snap out
        if (this._workHours) {
            var hours = this._start.getHours();

            if (hours < FreeBusy._workStart || FreeBusy._workEnd <= hours) {
                this._setWorkHours(false);
            } else {
                hours = this._end.getHours();

                if (hours < FreeBusy._workStart || FreeBusy._workEnd <= hours) {
                    this._setWorkHours(false);
                }
            }
        }

        // if the start is before today, anchor to the start
        if (this._start < today) {
            this._anchor = new Date(year, month, date);
        } else {
            var nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);

            // the start is after today.  if it's within a week, start from today.
            if (this._start < nextWeek) {
                this._anchor = today;
            } else {
                // the start is after a week from today.  start from the first
                // day of the week for the start.
                var offset = this._start.getDay() - Helpers.firstDayOfWeek;

                if (offset < 0) {
                    offset += 7;
                }

                this._anchor = new Date(year, month, date - offset);
            }
        }
    };

    FreeBusy.prototype._getFocusedDate = function() {
        var date = new Date(this._anchor);
        date.setDate(date.getDate() + this._dayOffset);

        return date;
    };

    FreeBusy.prototype._getDateName = function(date) {
        var info = Helpers.getDayInfo(Calendar.getToday(), date);

        if (info.isToday) {
            return FreeBusy._today;
        } else if (info.isTomorrow) {
            return FreeBusy._tomorrow;
        } else if (info.isYesterday) {
            return FreeBusy._yesterday;
        }

        return FreeBusy._dateFormatter.format(date);
    };

    FreeBusy.prototype._updateDateHeaders = function(force) {
        var dayOffset = Math.floor(this._scrollLeft / this._dayWidth);

        if (force || dayOffset !== this._dayOffset) {
            _start("_updateDateHeaders");

            this._dayOffset = dayOffset;

            // get the focused date and its name
            var date = this._getFocusedDate(),
                text = this._getDateName(date);

            this._date.innerText = text;
            this._dayNames[dayOffset].innerText = text;

            var nextDayName = this._dayNames[dayOffset + 1];

            if (nextDayName) {
                date.setDate(date.getDate() + 1);
                text = this._getDateName(date);

                nextDayName.innerText = text;
            }

            _stop("_updateDateHeaders");
        }
    };

    FreeBusy.prototype._updateSlider = function() {
        // our slider position and size calculations all involve calculating the
        // day offset from our anchor day, as well as the hour of the times.  we
        // can't rely purely on hour math, unfortunately, because we'll lose
        // accuracy around dst switches.
        var startDay     = Math.floor((this._start - this._anchor) / Helpers.dayInMilliseconds),
            startMinutes = (this._start.getHours() - this._hourOffset) * 60 + this._start.getMinutes();

        var endDay     = Math.floor((this._end - this._anchor) / Helpers.dayInMilliseconds),
            endMinutes = (this._end.getHours() - this._hourOffset) * 60 + this._end.getMinutes();

        var left  = ((startDay * this._hoursPerDay) * FreeBusy._hourWidth) + (startMinutes * FreeBusy._minuteWidth),
            right = ((endDay   * this._hoursPerDay) * FreeBusy._hourWidth) + (endMinutes   * FreeBusy._minuteWidth);

        var style = this._slider.style;
        this._setLeft(style,  left + "px");
        this._setRight(style, (this._scrollWidth - right) + "px");
    };

    FreeBusy.prototype._setScrollPos = function() {
        // calculate our scroll position, relative to our anchor day.
        var startDay   = Math.floor((this._start - this._anchor) / Helpers.dayInMilliseconds),
            hours      = (this._start.getHours() - this._hourOffset),
            hourOffset = (startDay * this._hoursPerDay) + hours;

        // set our position to an hour before the selected time, but don't do that
        // if setting that position will "leak" the previous day into view.
        if (hours) {
            hourOffset -= 1;
        }

        this._scrollLeft = hourOffset * FreeBusy._hourWidth;
        this._scroller.scrollLeft = this._scrollLeft;
    };

    FreeBusy.prototype._swapPointerListener = function(newTarget) {
        var pointerId = this._pointerId;

        this._unhookPointerEvents();
        this._hookPointerEvents(newTarget, pointerId);
    };

    FreeBusy.prototype._getCombinedAttendeeEmails = function() {
        return this._attendeeEmails.concat(this._roomEmails);
    };

    FreeBusy.prototype._updateAttendeeUi = function() {
        // remove our old elements
        var elCache = {};

        while (this._otherAttendees.firstElementChild) {
            var attendeeEl = this._otherAttendees.firstElementChild,
                scheduleEl = this._otherSchedules.firstElementChild,
                emailHtml  = attendeeEl.getAttribute("data-attendee");

            elCache[emailHtml] = {
                attendee: attendeeEl,
                schedule: scheduleEl
            };

            this._otherAttendees.removeChild(attendeeEl);
            this._otherSchedules.removeChild(scheduleEl);
        }

        // now insert our new elements, reusing our old ones where possible
        for (var i = 0, len = this._attendees.length; i < len; i++) {
            var attendee = this._attendees[i],
                cached   = elCache[attendee.emailHtml];

            if (cached) {
                this._otherAttendees.appendChild(cached.attendee);
                this._otherSchedules.appendChild(cached.schedule);
            } else {
                this._otherAttendees.insertAdjacentHTML("beforeend", Templates.attendee(attendee));
                this._otherSchedules.insertAdjacentHTML("beforeend", Templates.schedule(attendee));
            }
        }
    };

    FreeBusy.prototype._resetScheduleUi = function() {
        var schedules = this._schedules.querySelectorAll(".schedule");

        for (var i = 0, len = schedules.length; i < len; i++) {
            var schedule = schedules[i],
                classes  = schedule.classList;

            Animation.fadeOut(schedule.firstElementChild).done();

            if (!classes.contains("me")) {
                classes.add("fetching");
            }
        }

        this._updateProgress();
    };

    FreeBusy.prototype._updateProgress = function() {
        var isFetching = this._schedules.querySelector(".fetching");

        this._progress.style.display = isFetching ? "block" : "none";
        this._progressText.innerText = isFetching ? FreeBusy._loadingLabel : FreeBusy._loadingCompletedLabel;
    };

    FreeBusy.prototype._updateArrows = function(/*@optional*/ offset) {
        var minTranslate = 0,
            translateY   = 0;

        // get our scroller's height and its content's height
        this._offsetHeight = this._scroller.offsetHeight;
        this._scrollHeight = this._scroller.scrollHeight;

        // if the content is taller than the viewport, we'll need to show arrows
        if (this._offsetHeight < this._scrollHeight) {
            offset = offset || 0;
            minTranslate = this._offsetHeight - this._scrollHeight;
            translateY   = Math.min(Math.max(this._translateY + offset, minTranslate), 0);
        }

        // show or hide our arrows based on whether they're needed
        if (minTranslate) {
            this._arrowUp.style.display   = translateY ? "block" : "";
            this._arrowDown.style.display = minTranslate < translateY ? "block" : "";
        } else {
            this._arrowUp.style.display   = "";
            this._arrowDown.style.display = "";
        }

        // if our translation has changed, update our ui
        if (translateY !== this._translateY) {
            var transform = "translateY(" + translateY + "px)";

            this._attendeesEl.style.transform = transform;
            this._schedules.style.transform   = transform;

            this._translateY = translateY;
        }
    };

    FreeBusy.prototype._updateState = function() {
        // our can change very often, so we want to rate limit these updates.
        clearTimeout(this._updateTimeout);
        this._updateTimeout = setTimeout(this._doUpdateState, 250);
    };

    FreeBusy.prototype._doUpdateState = function() {
        clearTimeout(this._updateTimeout);
        this._updateTimeout = null;

        // calculate our current selected start and end times
        var style = this._slider.style,
            left  = parseInt(this._getLeft(style), 10),
            right = this._scrollWidth - parseInt(this._getRight(style), 10);

        var startDay     = Math.floor(left / this._dayWidth),
            startMinutes = (left % this._dayWidth) / FreeBusy._minuteWidth;

        var endDay     = Math.floor(right / this._dayWidth),
            endMinutes = (right % this._dayWidth) / FreeBusy._minuteWidth;

        // for non-zero duration events, we need to check if the end falls on a day
        // boundary.  if it does, we want to move it to the previous day.  this
        // matters when the hours don't line up across days (e.g. work days - the
        // end a day is 7pm, but the start is 8am);
        if (left < right) {
            if (!endMinutes) {
                endDay -= 1;
                endMinutes = this._dayWidth / FreeBusy._minuteWidth;
            }
        }

        var year  = this._anchor.getFullYear(),
            month = this._anchor.getMonth(),
            date  = this._anchor.getDate();

        var start = new Date(year, month, date + startDay, this._hourOffset, Math.round(startMinutes)),
            end   = new Date(year, month, date + endDay,   this._hourOffset, Math.round(endMinutes));

        // if they're changed, save them and update our aria info
        if (start.getTime() !== this._start.getTime() || end.getTime() !== this._end.getTime()) {
            this._start = start;
            this._end   = end;
            this._updateAria();
        }

        // get our potential rooms, and see if any of them are selected
        this._resource = null;
        var rooms = qsa(this._roomAttendees, "input");

        for (var i = 0, len = rooms.length; i < len; i++) {
            var room = rooms[i];

            if (room.checked) {
                this._resource = this._rooms[rooms.indexOf(room)];
                break;
            }
        }
    };

    FreeBusy.prototype._postProcessRoomUi = function() {
        var inputs = this._roomAttendees.querySelectorAll("input"),
            i, len;

        for (i = 0, len = inputs.length; i < len; i++) {
            inputs[i].name = "freebusy-room";
        }

        var labels = this._roomAttendees.querySelectorAll(".name[data-for]");

        for (i = 0, len = labels.length; i < len; i++) {
            var label = labels[i];

            label.setAttribute("for", label.getAttribute("data-for"));
            label.removeAttribute("data-for");
        }
    };

    // ARIA

    FreeBusy.prototype._updateAria = function() {
        // we synchronously update our slider aria
        var start      = this._start,
            end        = this._end,
            isSameDate = Helpers.isSameDate(start, end),
            from       = Helpers.dateAndTime.format(start),
            to         = isSameDate ? _shortTime.format(end) : Helpers.dateAndTime.format(end),
            range      = FreeBusy._rangeFormatter(from, to);

        this._sliderFocus.setAttribute("aria-label",     range);
        this._sliderFocus.setAttribute("aria-valuetext", range);

        var startText = FreeBusy._startLabel + ", " + range;
        this._grabberTouchLeft.setAttribute("aria-label",     startText);
        this._grabberTouchLeft.setAttribute("aria-valuetext", startText);

        var endText = FreeBusy._endLabel + ", " + range;
        this._grabberTouchRight.setAttribute("aria-label",     endText);
        this._grabberTouchRight.setAttribute("aria-valuetext", endText);

        // our worker will call us back with updated attendee aria
        this._updateWorkerSelected();
    };

    // Appbar Events

    FreeBusy.prototype._onRoomFinder = function() {
        // initialize the ui if we haven't already
        if (!this._roomFinderWell) {
            // the address well needs the platform
            var data = {};
            this.fire("getPlatform", data);
            var platform = data.platform;

            var hintText = Jx.res.getString("FreeBusyRoomFinderHint");

            // create the control
            this._roomFinderWell = new AddressWell.Controller(
                "roomFinder",                               // id
                null,                                       // recipients
                platform,                                   // platform
                false,                                      // show suggestions
                hintText,                                   // hint text
                AddressWell.ContactSelectionMode.roomContacts
            );

            // listen for new recipients
            this._roomFinderWell.addListener(AddressWell.Events.beforeRecipientsAdded, this._onBeforeRoomsAdded, this);
            this._roomFinderWell.addListener(AddressWell.Events.recipientsAdded,       this._onRoomsAdded,       this);

            // put the room finder address well in the ui
            this.appendChild(this._roomFinderWell);
            this._flyoutHost.innerHTML = Jx.getUI(this._roomFinderWell).html;
            this._roomFinderWell.activateUI();

            // Set up accessible label
            this._roomFinderWell.setAriaLabel(hintText);

            // get our account
            var account = platform.accountManager.loadAccount(this._accountId);
            this._roomFinderWell.setContextualAccount(account);
        }
    };

    FreeBusy.prototype._onAfterShowFlyout = function() {
        this._roomFinderWell.focusInput();
    };

    FreeBusy.prototype._onAfterHideFlyout = function() {
        this._roomFinderWell.clear();
    };

    FreeBusy.prototype._onClearRooms = function() {
        // empty out our ui
        this._roomAttendees.innerHTML = "";
        this._roomSchedules.innerHTML = "";
        this._updateArrows();

        // reset our data
        this._rooms      = [];
        this._roomEmails = [];
        this._resource   = null;

        // update our worker request
        this._worker.postCommand("FreeBusy/setAttendees", {
            attendees: this._getCombinedAttendeeEmails()
        }, this._id);

        // we might no longer have any requests in progress
        this._updateProgress();

        // the button should now be hidden
        /* Remove room finder entry points for M1.
        this._appbar.hideCommands([this._commandClearRooms]);
        */
        this._appbar.hide();
    };

    FreeBusy.prototype._onToggleWorkHours = function(ev) {
        if (ev.attrName === "aria-checked") {
            var checked = (ev.newValue === "true");

            this._setWorkHours(checked);
            this._appbar.hide();
        }
    };

    FreeBusy.prototype._onRefresh = function() {
        // update all our schedule ui to show as fetching
        this._resetScheduleUi();

        // tell our worker to re-fetch data
        this._worker.postCommand("FreeBusy/refresh", null, this._id);
        this._appbar.hide();
    };

    // DOM Events

    FreeBusy.prototype._hookEvents = function() {
        this._back.addEventListener("click",      this._onBack,   false);
        this._scroller.addEventListener("scroll", this._onScroll, false);

        this._attendeesEl.addEventListener("focusin", this._onFocusIn, false);

        this._arrowUp.addEventListener("click",   this._onArrowClick, false);
        this._arrowDown.addEventListener("click", this._onArrowClick, false);

        this._surface.addEventListener("MSPointerDown", this._onPointerDown, false);

        this._sliderFocus.addEventListener("DOMAttrModified", this._onAttrModifed, false);

        this._grabberTouchLeft.addEventListener("MSPointerDown",  this._onPointerDown, false);
        this._grabberTouchRight.addEventListener("MSPointerDown", this._onPointerDown, false);

        this._grabberLeft.addEventListener("MSPointerDown",  this._onPointerDown, false);
        this._grabberRight.addEventListener("MSPointerDown", this._onPointerDown, false);

        this._grabberTouchLeft.addEventListener("DOMAttrModified",  this._onAttrModifed, false);
        this._grabberTouchRight.addEventListener("DOMAttrModified", this._onAttrModifed, false);

        window.addEventListener("keydown", this._onKeyDown, false);
        this.on("resizeWindow", this._onResizeWindow);
    };

    FreeBusy.prototype._onBack = function() {
        _start("_onBack");

        this.raiseEvent("back", this.getState());

        _stop("_onBack");
    };

    FreeBusy.prototype._onFocusIn = function(ev) {
        var target   = ev.target,
            offset   = target.offsetTop,
            relative = offset + this._translateY;

        if (relative < 0) {
            this._updateArrows(-relative);
        } else {
            var height = this._offsetHeight - this._attendeesEl.offsetTop;
            relative += target.offsetHeight;

            if (height < relative) {
                this._updateArrows(height - relative);
            }
        }
    };

    FreeBusy.prototype._onArrowClick = function(ev) {
        _start("_onArrowClick");

        var translateSize = this._offsetHeight - this._attendeesEl.offsetTop - this._meSchedule.offsetHeight;

        if (ev.target === this._arrowUp) {
            this._updateArrows(translateSize);
        } else {
            this._updateArrows(-translateSize);
        }

        _stop("_onArrowClick");
    };

    FreeBusy.prototype._onScroll = function() {
        _start("_onScroll");

        // cache our scroll position
        this._scrollLeft = this._scroller.scrollLeft;

        // update our date header
        this._updateDateHeaders(false /* force */);

        _stop("_onScroll");
    };

    FreeBusy.prototype._onPointerDown = function(ev) {
        if (!this._pointerTarget && ev.button === 0) {
            var target = ev.currentTarget;

            // if the target has a pointerdown handler,
            // it can block hooking the events.
            if (!target._onPointerDown || target._onPointerDown.call(this, ev)) {
                this._hookPointerEvents(target, ev.pointerId);
            }
        }
    };

    FreeBusy.prototype._onPointerMove = function(ev) {
        var target = this._pointerTarget;

        if (target && ev.pointerId === this._pointerId) {
            if (target._onPointerMove) {
                target._onPointerMove.call(this, ev);
            }
        }
    };

    FreeBusy.prototype._hookPointerEvents = function(target, pointerId) {
        target.addEventListener("MSPointerMove",        this._onPointerMove, false);
        target.addEventListener("MSPointerUp",          this._onPointerUp,   false);
        target.addEventListener("MSPointerCancel",      this._onPointerUp,   false);
        target.addEventListener("MSLostPointerCapture", this._onPointerUp,   false);
        target.msSetPointerCapture(pointerId);

        // store some important info
        this._pointerTarget = target;
        this._pointerId     = pointerId;
    };

    FreeBusy.prototype._unhookPointerEvents = function() {
        var target = this._pointerTarget;

        if (target) {
            target.msReleasePointerCapture(this._pointerId);
            target.removeEventListener("MSLostPointerCapture", this._onPointerUp,   false);
            target.removeEventListener("MSPointerCancel",      this._onPointerUp,   false);
            target.removeEventListener("MSPointerUp",          this._onPointerUp,   false);
            target.removeEventListener("MSPointerMove",        this._onPointerMove, false);

            // release members
            this._pointerId     = null;
            this._pointerTarget = null;
        }
    };

    FreeBusy.prototype._onPointerUp = function(ev) {
        var target = this._pointerTarget;

        if (target && ev.pointerId === this._pointerId) {
            if (target._onPointerUp) {
                target._onPointerUp.call(this, ev);
            }

            this._unhookPointerEvents();
        }
    };

    FreeBusy.prototype._calculateOffsetX = function(ev) {
        var source  = ev.target,
            current = ev.currentTarget,
            x       = ev.offsetX;

        while (source !== current) {
            x += source.offsetLeft;
            source = source.parentNode;
        }

        if (this._isRtl) {
            x += FreeBusy._halfWidth;
        }

        x -= x % FreeBusy._halfWidth;
        return x;
    };

    FreeBusy.prototype._onSurfacePointerDown = function(ev) {
        // save our initial position
        this._initialSurfaceX = this._calculateOffsetX(ev);
        return true;
    };

    FreeBusy.prototype._onSurfacePointerUp = function(ev) {
        // only do work if it wasn't a cancel
        if (ev.type !== "MSPointerCancel" && ev.type !== "pointercancel") {
            // verify we're still over the current target
            var y = ev.offsetY;

            if (0 <= y && y <= this._pointerTarget.offsetHeight) {
                var x = this._calculateOffsetX(ev);

                if (x === this._initialSurfaceX) {
                    if (this._isRtl) {
                        x = this._scrollWidth - x;
                    }

                    var style  = this._slider.style,
                        left   = parseFloat(this._getLeft(style)),
                        right  = parseFloat(this._getRight(style)),
                        offset = x - left;

                    left   = x;
                    right -= offset;

                    // ensure we don't go off the right edge
                    if (right < 0) {
                        left += right;
                        right = 0;
                    }

                    this._setLeft(style,  left  + "px");
                    this._setRight(style, right + "px");

                    this._updateState();
                }
            }
        }
    };

    FreeBusy.prototype._onGrabberTouchPointerDown = function(ev) {
        return (ev.pointerType === "touch");
    };

    FreeBusy.prototype._onGrabberPointerMoveLeft = function(ev) {
        _start("_onGrabberPointerMoveLeft");

        // get our current info along with offsets
        var offset = ev.offsetX;

        if (this._isRtl) {
            offset *= -1;
        }

        var style  = this._slider.style,
            left   = parseInt(this._getLeft(style), 10) + offset,
            right  = this._scrollWidth - parseInt(this._getRight(style), 10);

        // we're moving the left grabber.  don't let it go past our left edge.
        if (left < this._scrollLeft) {
            left = this._scrollLeft;
        }

        // if the grabbers "pass", switch our focus to the other one.
        if (right - left < 0) {
            this._swapPointerListener(this._grabberRight);
            left = right;
        }

        this._setLeft(style, left + "px");

        _stop("_onGrabberPointerMoveLeft");
    };

    FreeBusy.prototype._onGrabberPointerMoveRight = function(ev) {
        _start("_onGrabberPointerMoveRight");

        var offset = ev.offsetX;

        if (this._isRtl) {
            offset *= -1;
        }

        var style  = this._slider.style,
            left   = parseInt(this._getLeft(style),  10),
            right  = parseInt(this._getRight(style), 10) - offset,
            width  = this._scrollWidth - right - left;

        // we're moving the right grabber.  if the grabbers "pass", switch our focus
        // to the other one.
        if (width < 0) {
            this._swapPointerListener(this._grabberLeft);
            right = this._scrollWidth - left;
        }

        this._setRight(style, right + "px");

        _stop("_onGrabberPointerMoveRight");
    };

    FreeBusy.prototype._onGrabberPointerUpLeft = function() {
        _start("_onGrabberPointerUpLeft");

        var style = this._slider.style,
            left  = parseInt(this._getLeft(style),  10),
            right = this._scrollWidth - parseInt(this._getRight(style), 10);

        // we lifted focus from the left grabber.  move to the nearest half hour.
        left += FreeBusy._quarterWidth;
        left -= left % FreeBusy._halfWidth;

        if (right < left) {
            left -= FreeBusy._halfWidth;
        }

        this._setLeft(style, left + "px");
        this._updateState();

        _stop("_onGrabberPointerUpLeft");
    };

    FreeBusy.prototype._onGrabberPointerUpRight = function() {
        _start("_onGrabberPointerUpRight");

        var style = this._slider.style,
            left  = parseInt(this._getLeft(style), 10),
            right = this._scrollWidth - parseInt(this._getRight(style), 10);

        // we lifted focus from the right grabber.  move to the nearest half hour.
        right += FreeBusy._quarterWidth;
        right -= right % FreeBusy._halfWidth;

        if (right < left) {
            right += FreeBusy._halfWidth;
        }

        this._setRight(style, this._scrollWidth - right + "px");
        this._updateState();

        _stop("_onGrabberPointerUpRight");
    };

    FreeBusy.prototype._onResizeWindow = function(ev) {
        _start("_onResizeWindow");

        if (ev.data.outerWidth <= 499) {
            this._onBack();
        } else {
            // if the resize is the result of a dpi switch, trident moves our scroll
            // position, so we have to reset it.
            this._scroller.scrollLeft = this._scrollLeft;
        }

        _stop("_onResizeWindow");
    };

    FreeBusy.prototype._handleDecrement = function(target) {
        _start("_handleDecrement");

        var style = this._slider.style,
            left  = parseInt(this._getLeft(style), 10),
            right = this._scrollWidth - parseInt(this._getRight(style), 10),
            offset;

        if (target === this._sliderFocus) {
            // ensure we can move the slider left
            if (left) {
                // move it to the nearest half hour or by a half hour
                offset = left % FreeBusy._halfWidth || FreeBusy._halfWidth;
                left  -= offset;
                right -= offset;

                // ensure the left side stays visible
                if (left < this._scrollLeft) {
                    this._scroller.scrollLeft = left;
                }
            }
        } else if (target === this._grabberTouchLeft) {
            // ensure we can move the grabber left
            if (left) {
                // move it to the nearest half hour or by a half hour
                offset = left % FreeBusy._halfWidth || FreeBusy._halfWidth;
                left  -= offset;

                // ensure the left side stays visible
                if (left < this._scrollLeft) {
                    this._scroller.scrollLeft = left;
                }
            }
        } else if (target === this._grabberTouchRight) {
            // move it to the nearest half hour or by a half hour
            offset = right % FreeBusy._halfWidth || FreeBusy._halfWidth;
            right -= offset;

            // if our width is less than half an hour, we'll need to move the left
            // side too.
            if ((right - left) < FreeBusy._halfWidth) {
                left -= 1;
                left -= left % FreeBusy._halfWidth;

                if (left <= 0) {
                    left  = 0;
                    right = FreeBusy._halfWidth;
                }

                if (left < this._scrollLeft) {
                    this._scroller.scrollLeft = left;
                }
            } else {
                // ensure the right side stays visible
                if (right <= this._scrollLeft) {
                    this._scroller.scrollLeft = right - FreeBusy._halfWidth;
                }
            }
        }

        this._setLeft(style,  left + "px");
        this._setRight(style, this._scrollWidth - right + "px");
        this._updateState();

        _stop("_handleDecrement");
    };

    FreeBusy.prototype._handleIncrement = function(target) {
        _start("_handleIncrement");

        var style = this._slider.style,
            left  = parseInt(this._getLeft(style), 10),
            right = this._scrollWidth - parseInt(this._getRight(style), 10),
            next;

        var scrollRight = this._scrollLeft + this._scroller.offsetWidth,
            maxRight    = this._scroller.scrollWidth;

        if (target === this._sliderFocus) {
            next  = left + FreeBusy._halfWidth;
            next -= next % FreeBusy._halfWidth;

            right += next - left;
            left   = next;

            // ensure we don't go off the right edge
            if (maxRight < right) {
                left -= right - maxRight;
                right = maxRight;
            }

            // ensure the right side stays visible
            if (scrollRight < right) {
                this._scroller.scrollLeft += right - scrollRight;
            }
        } else if (target === this._grabberTouchLeft) {
            next  = left + FreeBusy._halfWidth;
            next -= next % FreeBusy._halfWidth;

            left  = next;
            right = Math.max(right, left + FreeBusy._halfWidth);

            // ensure we don't go off the right edge
            if (maxRight < right) {
                left -= right - maxRight;
                right = maxRight;
            }

            // ensure the left side stays visible
            var boundary = left + FreeBusy._halfWidth;
            if (scrollRight < boundary) {
                this._scroller.scrollLeft = boundary - this._scroller.offsetWidth;
            }
        } else if (target === this._grabberTouchRight) {
            right += FreeBusy._halfWidth;
            right -= right % FreeBusy._halfWidth;

            // ensure we don't go off the right edge
            if (maxRight < right) {
                right = maxRight;
            }

            // ensure the right side stays visible
            if (scrollRight < right) {
                this._scroller.scrollLeft += right - scrollRight;
            }
        }

        this._setLeft(style,  left + "px");
        this._setRight(style, this._scrollWidth - right + "px");
        this._updateState();

        _stop("_handleIncrement");
    };

    FreeBusy.prototype._onKeyDown = function(ev) {
        var key = ev.key;

        if (key === "Esc") {
            this._onBack();
        } else {
            var target = ev.target;

            if (target === this._sliderFocus || target === this._grabberTouchLeft || target === this._grabberTouchRight) {
                if (key === "Left") {
                    if (this._isRtl) {
                        this._handleIncrement(target);
                    } else {
                        this._handleDecrement(target);
                    }

                    ev.preventDefault();
                } else if (key === "Right") {
                    if (this._isRtl) {
                        this._handleDecrement(target);
                    } else {
                        this._handleIncrement(target);
                    }

                    ev.preventDefault();
                }
            }
        }
    };

    FreeBusy.prototype._onAttrModified = function(ev) {
        // we use this mutation event to know when narrator changes aria properties
        if (ev.attrName === "aria-valuenow") {
            var target = ev.target,
                value  = parseInt(ev.newValue, 10);

            // by default, we set the value to 5.  this is our "middle of the road"
            // reserved value.  narrator will either increase or decrease it.
            if (value !== 5) {
                target.setAttribute("aria-valuenow", 5);

                if (value < 5) {
                    this._handleDecrement(target);
                } else {
                    this._handleIncrement(target);
                }

                this._doUpdateState();
            }
        }
    };

    FreeBusy.prototype._unhookEvents = function() {
        this._unhookPointerEvents();

        this.detach("resizeWindow", this._onResizeWindow);
        window.removeEventListener("keydown", this._onKeyDown, false);

        this._grabberTouchRight.removeEventListener("DOMAttrModified", this._onAttrModifed, false);
        this._grabberTouchLeft.removeEventListener("DOMAttrModified",  this._onAttrModifed, false);

        this._grabberRight.removeEventListener("MSPointerDown", this._onPointerDown, false);
        this._grabberLeft.removeEventListener("MSPointerDown",  this._onPointerDown, false);

        this._grabberTouchRight.removeEventListener("MSPointerDown", this._onPointerDown, false);
        this._grabberTouchLeft.removeEventListener("MSPointerDown",  this._onPointerDown, false);

        this._surface.removeEventListener("MSPointerDown", this._onPointerDown, false);

        this._arrowDown.removeEventListener("click", this._onArrowClick, false);
        this._arrowUp.removeEventListener("click",   this._onArrowClick, false);

        this._attendeesEl.removeEventListener("focusin", this._onFocusIn, false);

        this._scroller.removeEventListener("scroll", this._onScroll, false);
        this._back.removeEventListener("click",      this._onBack,   false);
    };

    // Jx Events

    FreeBusy.prototype._onBeforeRoomsAdded = function(ev) {
        // get the rooms and cancel the event. we don't want them in the well.
        var recipients = ev.recipients;
        ev.cancelled = true;

        // only insert the rooms if we actually added some
        if (recipients.length) {
            var rooms = [];

            // ensure we're adding unique rooms
            for (var i = 0, len = recipients.length; i < len; i++) {
                var recipient = recipients[i];

                // we only care about resolved recipients
                if (!recipient.isJsRecipient) {
                    var email      = recipient.emailAddress,
                        emailLower = email.toLowerCase();

                    if (this._roomEmails.indexOf(emailLower) === -1) {
                        var room = {
                            email: emailLower,
                            name:  recipient.calculatedUIName,

                            emailHtml: Jx.escapeHtml(emailLower),
                            nameHtml:  Jx.escapeHtml(recipient.calculatedUIName),

                            checked: false
                        };

                        this._roomEmails.push(emailLower);
                        this._rooms.push(room);
                        rooms.push(room);
                    }
                }
            }

            // only do more work if we got valid rooms
            if (rooms.length) {
                // if this is the only room, select it by default
                if (this._rooms.length === 1) {
                    this._rooms[0].checked = true;
                }

                // insert the new rooms
                this._roomAttendees.insertAdjacentHTML("beforeend", Templates.roomAttendees({ rooms: rooms }));
                this._roomSchedules.insertAdjacentHTML("beforeend", Templates.roomSchedules({ rooms: rooms }));

                // ensure all the radio buttons belong to one group
                this._postProcessRoomUi();

                // ensure we're scrolled all the way down, so the room shows
                this._updateArrows(-this._scroller.scrollHeight);

                // update our worker request
                this._worker.postCommand("FreeBusy/setAttendees", {
                    attendees: this._getCombinedAttendeeEmails()
                }, this._id);

                // we have new requests in progress
                this._updateProgress();

                // ensure the appbar button is toggled correctly
                /* Remove room finder entry points for M1.
                this._commandClearRooms.label = (this._rooms.length === 1) ? FreeBusy._clearRoom : FreeBusy._clearRooms;
                this._appbar.showCommands([this._commandClearRooms]);
                */
            }
        }

        this._appbar.hide();
    };

    FreeBusy.prototype._onRoomsAdded = function() {
        this._roomFinderWell.clearInput();
    };

    // Schedules

    FreeBusy.prototype._initWorker = function() {
        Debug.assert(!this._worker);

        var data = {};
        this.fire("getPlatformWorker", data);

        // save the worker and hook events on it
        this._worker = data.platformWorker;
        this._worker.addListener("FreeBusy/getEvents",     this._onGetEvents,       this);
        this._worker.addListener("FreeBusy/eventsChanged", this._onEventsChanged,   this);
        this._worker.addListener("FreeBusy/meAria",        this._onGetMeAria,       this);
        this._worker.addListener("FreeBusy/schedules",     this._onGetSchedules,    this);
        this._worker.addListener("FreeBusy/attendeeAria",  this._onGetAttendeeAria, this);

        // initialize it with our current state
        var start = this._anchor,
            year  = start.getFullYear(),
            month = start.getMonth(),
            date  = start.getDate(),
            end   = new Date(year, month, date + FreeBusy._numberOfDays);

        this._worker.postCommand("FreeBusy/initialize", {
            visible: {
                start: start.getTime(),
                end:   end.getTime()
            },

            selected: {
                start: this._start.getTime(),
                end:   this._end.getTime()
            },

            workHours: this._workHours,
            attendees: this._getCombinedAttendeeEmails(),

            calendarId: this._calendarId,
            accountId:  this._accountId
        }, this._id);
    };

    FreeBusy.prototype._updateWorkerVisible = function() {
        var start = this._anchor,
            year  = start.getFullYear(),
            month = start.getMonth(),
            date  = start.getDate(),
            end   = new Date(year, month, date + FreeBusy._numberOfDays);

        this._worker.postCommand("FreeBusy/setVisible", {
            start: start.getTime(),
            end:   end.getTime()
        }, this._id);
    };

    FreeBusy.prototype._updateWorkerSelected = function() {
        this._worker.postCommand("FreeBusy/setSelected", {
            start: this._start.getTime(),
            end:   this._end.getTime()
        }, this._id);
    };

    FreeBusy.prototype._updateWorkerCalendar = function() {
        this._worker.postCommand("FreeBusy/setCalendar", {
            calendarId: this._calendarId,
            accountId:  this._accountId
        }, this._id);
    };

    FreeBusy.prototype._onGetEvents = function(data) {
        _start("_onGetEvents");

        this._meSchedule.innerHTML = data.html;
        Animation.fadeIn(this._meSchedule).done();

        _stop("_onGetEvents");
    };

    FreeBusy.prototype._onEventsChanged = function(data) {
        _start("_onEventsChanged");

        var oldMeSchedule = this._meSchedule;
        this._meSchedule = oldMeSchedule.cloneNode(false);
        this._meSchedule.style.opacity = "0";
        this._meSchedule.innerHTML     = data.html;
        oldMeSchedule.parentElement.appendChild(this._meSchedule);

        setImmediate(function() {
            WinJS.UI.executeTransition(this._meSchedule, {
                property: "opacity",
                delay: 0,
                duration: 250,
                timing: "linear",
                to: 1
            }).done();

            WinJS.UI.executeTransition(oldMeSchedule, {
                property: "opacity",
                delay: 200,
                duration: 250,
                timing: "linear",
                to: 0
            }).done(function() {
                if (oldMeSchedule.parentNode) {
                    oldMeSchedule.outerHTML = "";
                }
            });
        }.bind(this));

        _stop("_onEventsChanged");
    };

    FreeBusy.prototype._onGetMeAria = function(data) {
        _start("_onGetMeAria");

        this._meAttendee.setAttribute("aria-label", FreeBusy._me + ": " + data.label);

        _stop("_onGetMeAria");
    };

    FreeBusy.prototype._onGetSchedules = function(data) {
        _start("_onGetSchedules");

        function removeContainer(container) {
            if (container.parentNode) {
                container.outerHTML = "";
            }
        }

        for (var email in data.html) {
            var el = this._schedules.querySelector("[data-attendee='" + Jx.escapeHtml(email) + "']");

            if (el) {
                var html = data.html[email];

                el.classList.remove("fetching");
                el.insertAdjacentHTML("beforeend", "<div class='container'>" + html + "</div>");

                var newContainer = el.lastElementChild,
                    oldContainer = el.firstElementChild;

                Animation.fadeIn(newContainer).done();
                Animation.fadeOut(oldContainer).done(removeContainer.bind(null, oldContainer));
            }
        }

        // check if we're still fetching any data
        this._updateProgress();

        _stop("_onGetSchedules");
    };

    FreeBusy.prototype._onGetAttendeeAria = function(data) {
        _start("_onGetAttendeeAria");

        for (var email in data.labels) {
            var el = this._attendeesEl.querySelector("[data-attendee='" + Jx.escapeHtml(email) + "']");

            if (el) {
                var label = data.labels[email],
                    uiName;

                // if this is a room, we have to work to get its name from another element
                if (el.nodeName === "INPUT") {
                    uiName = el.parentNode.querySelector(".name").innerText;
                } else {
                    uiName = el.innerText;
                }

                el.setAttribute("aria-label", uiName + ": " + label);
            }
        }

        _stop("_onGetAttendeeAria");
    };

});
