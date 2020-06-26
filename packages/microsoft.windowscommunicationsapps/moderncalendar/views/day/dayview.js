Jx.delayDefine(Calendar.Views, "Day", function() {
    function s(n) {
        Jx.mark("Calendar:Day." + n + ",Info,Calendar")
    }
    function r(n) {
        Jx.mark("Calendar:Day." + n + ",StartTA,Calendar")
    }
    function u(n) {
        Jx.mark("Calendar:Day." + n + ",StopTA,Calendar")
    }
    function c(n) {
        return '<div id="' + n.id + '" class="dayview"><div id="aria-flowstart" role="listitem"><\/div><div class="timeline-host"><\/div><div id="aria-flowend" role="listitem"><\/div><div class="dp-anchor"><\/div><\/div>'
    }
    function l(n) {
        return '<div class="day"><div class="header"><div class="dayName"><div class="dateAnchor"><div class="anchorText" id="da-' + n.uid + '" role="heading" tabindex="0">' + Jx.escapeHtml(n.name) + '<\/div><div class="dateChevron" aria-hidden="true"><\/div><\/div><\/div><div class="fullDate"><div class="fullDate-text" id="date-' + n.uid + '" tabindex="0" role="button" aria-label="' + Jx.escapeHtml(n.longDate) + '">' + Jx.escapeHtml(this._getFullDate(n.day, n.isToday, n.isTomorrow, n.isYesterday)) + '<\/div><\/div><\/div><div class="allDay"><div class="events"><div class="container"><\/div><\/div><\/div><div class="allDaySpacer"><div class="events"><\/div><\/div><div class="grid"><div class="hours" id="hours" aria-hidden="true">' + i.getHoursHtml() + '<\/div><div class="events" id="events" role="list"><div class="container"><\/div><\/div><\/div><\/div>'
    }
    function o(n, t) {
        return Array.prototype.slice.call(n.querySelectorAll(t))
    }
    var i = Calendar.Helpers, e = Calendar.Controls.DatePickerAnchor, f = WinJS.UI.Animation, h = new Jx.DTFormatter("longDate"), t = Calendar.Views.Day = function() {
        this.initComponent();
        this._id = "calDay";
        t._name || (i.ensureFormats(),
        t._name = "Calendar.Views.Day",
        t._fourAmOffset = 240,
        t._nineAmOffset = 540,
        t._yesterday = Jx.res.getString("Yesterday"),
        t._today = Jx.res.getString("Today"),
        t._tomorrow = Jx.res.getString("Tomorrow"),
        t._fullDate = new Jx.DTFormatter("month day year"),
        t._fullDateWithDay = new (new Jx.dtf)("dayofweek month day year"),
        t._updateFormatsForLanguage(t._fullDateWithDay.resolvedLanguage.split("-")[0]));
        this._resetUiMembers();
        this._renderer = this._renderer.bind(this);
        this._recycler = this._recycler.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyDownNav = this._onKeyDownNav.bind(this);
        this._onPointerDown = this._onPointerDown.bind(this);
        this._onClick = this._onClick.bind(this);
        this._loadAnimation = WinJS.UI.Animation.enterPage
    }
    , n;
    Jx.augment(t, Jx.Component);
    t._updateFormatsForLanguage = function(n) {
        r("_updateFormatsForLanguage");
        switch (n) {
        case "ta":
            t._fullDateWithDay = new Jx.DTFormatter("dayofweek.abbreviated month day year")
        }
        u("_updateFormatsForLanguage")
    }
    ;
    n = t.prototype;
    n.setFocusedDay = function(n) {
        n = new Date(n.getFullYear(),n.getMonth(),n.getDate());
        n < Calendar.FIRST_DAY ? (s("Day for " + t._name + " is out of bounds (" + n + " < " + Calendar.FIRST_DAY + ")."),
        n = Calendar.FIRST_DAY) : n > Calendar.LAST_DAY && (s("Day for " + t._name + " is out of bounds (" + n + " > " + Calendar.LAST_DAY + ")."),
        n = Calendar.LAST_DAY);
        this._focusedIndex = Math.round((n - this._today) / i.dayInMilliseconds);
        this._timeline && this._timeline.setFocusedIndex(this._focusedIndex)
    }
    ;
    n.getFocusedDay = function() {
        return this.getItem(this._focusedIndex)
    }
    ;
    n.getState = function() {
        var u = null, t, i, n, f, r, e;
        if (this._timeline) {
            for (t = this._timeline.getRealized(),
            i = {},
            n = 0,
            f = t.length; n < f; n++)
                r = t[n].el,
                e = r._day,
                i[e] = r._grid.scrollTop;
            u = {
                width: this._host.offsetWidth,
                positions: i
            }
        }
        return u
    }
    ;
    n.setState = function(n) {
        this._lastWidth = n.width;
        this._positions = n.positions
    }
    ;
    n.focusEvent = function(n) {
        if (this._eventToFocus = n,
        this._host && (this._focusEventDay(),
        this._eventToFocus)) {
            var i = this._timeline.getRealized()
              , t = i[0].el;
            t._grid.scrollTop = this._getScrollTop(t._day, t._grid)
        }
    }
    ;
    n.containsDate = function(n) {
        var t = this.getFocusedDay();
        return i.isSameDate(n, t)
    }
    ;
    n.setLoadAnimation = function(n) {
        this._loadAnimation = n
    }
    ;
    n.showDatePicker = function() {
        this._showDatePicker()
    }
    ;
    n.getUI = function(n) {
        n.html = c.call(this, {
            id: this._id
        })
    }
    ;
    n.activateUI = function(n) {
        var u, t, r, o;
        this._jobset = n;
        this._host = document.getElementById(this._id);
        this._dpAnchor = this._host.querySelector(".dp-anchor");
        this._getWorker();
        this._isTall = 1080 < this._host.offsetHeight;
        this._updateToday(Calendar.getToday());
        Calendar.addListener("dayChanged", this._onDayChanged, this);
        this._focusEventDay();
        u = {};
        this.fire("getSettings", u);
        t = this._timeline = new Calendar.Controls.Timeline(this._host.querySelector(".timeline-host"),this._jobset,this,this._renderer,this._recycler);
        t.setAlwaysShowArrows(u.settings.get("alwaysShowArrows"));
        this.on("showArrows", this._onShowArrows);
        this.on("dateSelected", this._onDateSelected);
        this.on("setScrollable", this._onSetScrollable);
        t.addListener("focusChanged", this._onFocusChanged, this);
        t.addListener("itemRealized", this._onItemRealized, this);
        t.addListener("itemRemoved", this._onItemRemoved, this);
        t.initialize(this._focusedIndex);
        this._host.addEventListener("MSPointerDown", this._onPointerDown, false);
        this._host.addEventListener("click", this._onClick, false);
        this._host.addEventListener("keydown", this._onKeyDown, false);
        this._host.addEventListener("keydown", this._onKeyDownNav, false);
        this.on("resizeWindow", this._onResizeWindow);
        var e = this._timeline.getRealized()
          , f = []
          , i = [];
        for (r = 0,
        o = e.length; r < o; r++) {
            var s = e[r].el
              , c = s._dayName
              , l = s.querySelectorAll(".fullDate, .allDay, .grid");
            f.push(c);
            i.push.apply(i, l)
        }
        var a = f.shift()
          , v = i.splice(0, 3)
          , h = function() {
            this.fire("viewReady")
        }
        .bind(this);
        this._loadAnimation([a, v, f, i]).done(h, h)
    }
    ;
    n.deactivateUI = function() {
        this._jobset.cancelAllChildJobs();
        this._datePicker && (this.removeChild(this._datePicker),
        this._datePicker.shutdownUI(),
        this._datePicker = null);
        this._dpAnchor = null;
        this._timeline.shutdown();
        this._timeline.removeListener("itemRemoved", this._onItemRemoved, this);
        this._timeline.removeListener("itemRealized", this._onItemRealized, this);
        this._timeline.removeListener("focusChanged", this._onFocusChanged, this);
        this._timeline = null;
        this._quickEvent && (this._quickEvent.deactivateUI(),
        this._quickEvent = null);
        this.detach("showArrows", this._onShowArrows);
        this.detach("dateSelected", this._onDateSelected);
        this.detach("resizeWindow", this._onResizeWindow);
        this.detach("setScrollable", this._onSetScrollable);
        this._host.removeEventListener("keydown", this._onKeyDownNav, false);
        this._host.removeEventListener("keydown", this._onKeyDown, false);
        this._host.removeEventListener("click", this._onClick, false);
        this._host.removeEventListener("MSPointerDown", this._onPointerDown, false);
        this._host = null;
        this._worker.removeListener("Day/getEvents", this._onGetEvents, this);
        this._worker.removeListener("Day/eventChanged", this._onEventChanged, this);
        this._worker.removeListener("Day/eventsChanged", this._onEventsChanged, this);
        this._worker.removeListener("Day/expandAllDay", this._onExpandAllDay, this);
        this._worker = null;
        Calendar.removeListener("dayChanged", this._onDayChanged, this);
        this._resetUiMembers()
    }
    ;
    n._onSetScrollable = function(n) {
        this._timeline && this._timeline.setScrollable(n.data)
    }
    ;
    n.left = function() {
        return this._left
    }
    ;
    n.right = function() {
        return this._right
    }
    ;
    n.getItem = function(n) {
        if (n < -this._left)
            throw new Error("Index for " + t._name + " is out of bounds (" + n + " < " + -this._left + ").");
        if (n > this._right)
            throw new Error("Index for " + t._name + " is out of bounds (" + n + " > " + this._right + ").");
        return new Date(this._today.getFullYear(),this._today.getMonth(),this._today.getDate() + n)
    }
    ;
    t._hourHeight = 60;
    n._generateDatePickerConfig = function(n, t) {
        var e, v, o, s, h, a;
        r("_generateDatePickerConfig");
        var c = false
          , l = new Date(n)
          , f = [];
        for (e = 0,
        v = t.length; e < v; e++)
            o = t[e],
            i.isSameDate(o, n) && (c = true),
            c || (s = o.getMonth(),
            f[s] === undefined ? f[s] = {
                count: 1,
                year: o.getFullYear()
            } : ++f[s].count);
        if (c)
            l.setDate(1);
        else {
            var y = n.getMonth()
              , p = n.getFullYear()
              , w = 0;
            for (h in f)
                a = f[h].count,
                a > w && (w = a,
                y = h,
                p = f[h].year);
            l = new Date(p,y,1)
        }
        return u("_generateDatePickerConfig"),
        l
    }
    ;
    n._configureDatePicker = function() {
        r("_configureDatePicker");
        var t = this._datePicker
          , e = this._timeline.getRealized()
          , i = Calendar.getToday()
          , f = i
          , n = []
          , o = this;
        n = e.map(function(n) {
            return o.getItem(n.index)
        });
        n.length > 0 ? f = this._generateDatePickerConfig(i, n) : f.setDate(1);
        t.setToday(i);
        t.setHighlightDates(n);
        t.setFocusDate(f);
        u("_configureDatePicker")
    }
    ;
    n._onFocusChanged = function(n) {
        this._focusedIndex = n.index;
        var t = n.el.querySelector("[tabindex]:not(.anchorText)");
        Jx.safeSetActive(t);
        e.updateDatePickerButton(this._timeline, n);
        this._updateAria()
    }
    ;
    n._onItemRealized = function(n) {
        r("_onItemRealized");
        var i = n.item
          , t = n.el;
        t.jobset = n.jobset;
        t._day = i;
        t._dayName = t.querySelector(".dayName");
        t._fullDate = t.querySelector(".fullDate-text");
        t._allDay = t.querySelector(".allDay > .events").firstElementChild;
        t._grid = t.querySelector(".grid");
        t._events = t._grid.querySelector(".events").firstElementChild;
        t._grid._hours = t._grid.querySelector(".hours").children;
        t._grid.style.msOverflowStyle = "none";
        t._grid.scrollTop = this._getScrollTop(i, t._grid);
        t._grid.style.msOverflowStyle = "-ms-autohiding-scrollbar";
        this._initForDayType(i, t);
        this._getEvents(i, t);
        u("_onItemRealized")
    }
    ;
    n._onItemRemoved = function(n) {
        var t = n.item
          , i = t.workerId;
        t._data.isToday && this._time.deactivateUI();
        this._worker.postCommand("Day/cancel", null, i);
        delete this._workerIds[i]
    }
    ;
    n._onShowArrows = function(n) {
        n.handled || (this._timeline.setAlwaysShowArrows(n.data.value),
        n.handled = true)
    }
    ;
    n._onDateSelected = function(n) {
        n.handled || (n.handled = true,
        this.setFocusedDay(n.data))
    }
    ;
    n._onDayChanged = function(n) {
        var u = this._today, t = this._datePicker, r;
        this._updateToday(n);
        t && (t.hide(),
        t.setToday(n));
        this._focusedIndex && (r = Math.round((n - u) / i.dayInMilliseconds),
        this._focusedIndex -= r);
        this._timeline.initialize(this._focusedIndex)
    }
    ;
    n._getWorker = function() {
        var n = {};
        this.fire("getPlatformWorker", n);
        this._worker = n.platformWorker;
        this._worker.addListener("Day/getEvents", this._onGetEvents, this);
        this._worker.addListener("Day/eventChanged", this._onEventChanged, this);
        this._worker.addListener("Day/eventsChanged", this._onEventsChanged, this);
        this._worker.addListener("Day/expandAllDay", this._onExpandAllDay, this)
    }
    ;
    n._getEvents = function(n, t) {
        var i = n.getFullYear()
          , r = n.getMonth()
          , u = n.getDate()
          , f = new Date(i,r,u)
          , e = new Date(i,r,u + 1);
        n.workerId = this._worker.postCommand("Day/getEvents", {
            start: f.getTime(),
            end: e.getTime(),
            isVisible: t.jobset.isVisible
        });
        this._workerIds[n.workerId] = t
    }
    ;
    n._onGetEvents = function(n) {
        var t = this._workerIds[n.id];
        t && (r("_onGetEvents"),
        t.jobset.addUIJob(this, function() {
            r("_onGetEvents:inner");
            t._allDay.innerHTML = n.allDayHtml;
            t._events.innerHTML = n.eventHtml;
            f.fadeIn([t._allDay, t._events]).done();
            this._updateAria();
            u("_onGetEvents:inner")
        }, null, People.Priority.userTileRender),
        u("_onGetEvents"))
    }
    ;
    n._onEventsChanged = function(n) {
        var t = this._workerIds[n.id];
        t && t.jobset.addUIJob(this, function() {
            r("_onEventsChanged");
            var i = t._allDay
              , f = t._events;
            t._allDay = i.cloneNode(false);
            t._events = f.cloneNode(false);
            t._events.style.opacity = "0";
            t._allDay.style.opacity = "0";
            t._allDay.innerHTML = n.allDayHtml;
            t._events.innerHTML = n.eventHtml;
            i.parentElement.appendChild(t._allDay);
            f.parentElement.appendChild(t._events);
            setImmediate(function() {
                WinJS.UI.executeTransition([t._allDay, t._events], {
                    property: "opacity",
                    delay: 0,
                    duration: 250,
                    timing: "linear",
                    to: 1
                }).done();
                WinJS.UI.executeTransition([i, f], {
                    property: "opacity",
                    delay: 200,
                    duration: 250,
                    timing: "linear",
                    to: 0
                }).done(function() {
                    t.parentNode && (i.outerHTML = "",
                    f.outerHTML = "")
                })
            });
            this._updateAria();
            u("_onEventsChanged")
        }, null, People.Priority.slowData)
    }
    ;
    t._properties = {
        busyStatus: "update",
        color: "update",
        location: "update",
        subject: "update"
    };
    n._onEventChanged = function(n) {
        var e, i, f, h, o, s;
        for (r("_onEventChanged"),
        e = n.properties,
        i = [],
        f = 0,
        h = e.length; f < h; f++)
            o = e[f],
            t._properties[o] && i.push(o);
        i.length && (s = this._workerIds[n.id],
        s && this._updateEventUi(s, n.ev, i));
        u("_onEventChanged")
    }
    ;
    t._updateBusyStatus = function(n, t) {
        var r = n.querySelector(".glyph");
        f.fadeOut(r).done(function() {
            n.setAttribute("data-status", i.busyStatusClasses[t.busyStatus]);
            f.fadeIn(r).done()
        })
    }
    ;
    t._updateColor = function(n, t) {
        var r = i.processEventColor(t.color);
        n.style.color = r;
        n.querySelector(".glyph").style.backgroundColor = r
    }
    ;
    t._updateLocation = function(n, t) {
        var i = n.querySelector(".location"), r;
        i && (r = Jx.hasClass(n, "short") ? "(" + t.location + ")" : t.location,
        f.fadeOut(i).done(function() {
            i.innerText = r;
            f.fadeIn(i).done()
        }))
    }
    ;
    t._updateSubject = function(n, t) {
        var i = n.querySelector(".subject");
        f.fadeOut(i).done(function() {
            i.innerText = t.subject;
            f.fadeIn(i).done()
        })
    }
    ;
    t._updateFns = {
        busyStatus: t._updateBusyStatus,
        color: t._updateColor,
        location: t._updateLocation,
        subject: t._updateSubject
    };
    n._updateEventUi = function(n, i, f) {
        var e, l, o, a, s, h;
        r("_updateEventUi");
        var v = i.handle
          , c = document.querySelectorAll("[data-handle='" + v + "']")
          , y = c.length;
        for (e = 0; e < y; e++)
            for (l = c[e],
            o = 0,
            a = f.length; o < a; o++)
                s = f[o],
                h = t._updateFns[s],
                h && h(l, i, s);
        u("_updateEventUi")
    }
    ;
    n._onExpandAllDay = function(n) {
        var t = this._workerIds[n.id];
        t && (t._allDay.innerHTML = n.html)
    }
    ;
    n._onMoreClick = function(n) {
        var t = this._getItemRoot(n), r = t._day, i;
        t._allDay.innerHTML = "";
        i = t.querySelector("[tabindex]");
        Jx.safeSetActive(i);
        this._worker.postCommand("Day/expandAllDay", null, r.workerId)
    }
    ;
    n._onAllDayClick = function(n, t) {
        var i = this._getItemRoot(n)
          , r = i._day
          , u = new Date(r.getFullYear(),r.getMonth(),r.getDate());
        this._createEvent(t, i._allDay.parentNode, u, true, i._fullDate)
    }
    ;
    n._onGridClick = function(n, i) {
        for (var u = this._getItemRoot(n), f = u._day, o = i.offsetY, e, s, h, r = i.target; r !== n; r = r.parentElement)
            o += r.offsetTop;
        e = Math.floor(Math.max(0, o) / t._hourHeight);
        s = n._hours[e];
        s === this._focused && (h = new Date(f.getFullYear(),f.getMonth(),f.getDate(),e),
        this._createEvent(i, u._events.parentNode, h, false, u._fullDate))
    }
    ;
    n._onDateAnchorClicked = function() {
        this._showDatePicker()
    }
    ;
    n._showDatePicker = function() {
        var n, i, t;
        r("_showDatePicker");
        n = this._datePicker;
        i = Calendar.getToday();
        n || (r("_showDatePicker:!datePicker"),
        t = Calendar.Controls.DatePicker,
        n = this._datePicker = new t(t.PickMode.monthGrid),
        n.setIdSuffix(""),
        n.addCustomClass("dayviewPicker"),
        n.showFreeBusy = false,
        n.setToday(i),
        n.setFocusDate(i),
        n.clientView = t.ClientView.day,
        this.appendChild(n),
        n.activateUI(this._jobset),
        u("_showDatePicker:!datePicker"));
        n.getActive() || (this._configureDatePicker(),
        n.show(this._dpAnchor, "bottom", Jx.isRtl() ? "right" : "left"));
        u("_showDatePicker")
    }
    ;
    n._handleKeyboardAndAcc = function(n) {
        var t;
        if (n.preventDefault(),
        t = n.target,
        Jx.hasClass(t, "more"))
            this._onMoreClick(t);
        else if (Jx.hasClass(t, "event"))
            this._quickEvent && this._quickEvent.isOpen() ? this._quickEvent && this._quickEvent.onDismiss() : i.editEvent(this, t.getAttribute("data-handle"), t);
        else if (Jx.hasClass(t, "fullDate-text")) {
            var r = this._getItemRoot(t)
              , f = new Date
              , u = r._day
              , o = new Date(u.getFullYear(),u.getMonth(),u.getDate(),f.getHours());
            this._createEvent(n, r._events.parentNode, o, false, r._fullDate)
        } else
            e.isActiveDateAnchor(t) && this._showDatePicker()
    }
    ;
    n._getFocusedItem = function(n) {
        var u = null, i = n.target, f, r, e;
        if (n.type !== "MSPointerCancel" && n.type !== "pointercancel" && !i.classList.contains("grid"))
            for (f = n.offsetY; i && i !== this._host; ) {
                if (r = i.classList,
                r.contains("grid")) {
                    e = Math.floor(Math.max(0, f) / t._hourHeight);
                    u = i._hours[e];
                    break
                }
                if (r.contains("event") || r.contains("more") || r.contains("allDay") || r.contains("fullDate") || r.contains("activeAnchor")) {
                    u = i;
                    break
                }
                f += i.offsetTop;
                i = i.parentElement
            }
        return u
    }
    ;
    n._onPointerDown = function(n) {
        var t, i, r;
        if (!this._pressed && n.button === 0 && (t = n.target,
        !t.classList.contains("grid")))
            while (t && t !== this._host) {
                if (i = t.classList,
                r = false,
                i.contains("event") || i.contains("more") ? (this._quickEvent && this._quickEvent.isOpen() || (f.pointerDown(t),
                t.animatedDown = true),
                r = true) : (i.contains("grid") || i.contains("allDay") || i.contains("fullDate") || i.contains("activeAnchor")) && (r = true),
                r) {
                    this._host.addEventListener("MSPointerCancel", this._onClick, false);
                    this._pressed = t;
                    this._focused = this._getFocusedItem(n);
                    this._quickEvent && this._quickEvent.isOpen() ? n.preventDefault() : this._focused.setAttribute("data-state", "pressed");
                    break
                }
                t = t.parentElement
            }
        this._gotPointerDown = true
    }
    ;
    n._onClick = function(n) {
        var t, r;
        if (this._gotPointerDown) {
            if (this._pressed) {
                if (this._pressed.animatedDown && f.pointerUp(this._pressed),
                this._host.removeEventListener("MSPointerCancel", i._onClick, false),
                n.type === "click")
                    for (t = n.target; t; t = t.parentElement) {
                        if (r = t.classList,
                        r.contains("event")) {
                            t === this._pressed && (this._quickEvent && this._quickEvent.isOpen() ? this._quickEvent && this._quickEvent.onDismiss() : i.editEvent(this, t.getAttribute("data-handle"), t));
                            break
                        }
                        if (r.contains("more")) {
                            t === this._pressed && this._onMoreClick(t);
                            break
                        }
                        if (r.contains("grid")) {
                            t === this._pressed && this._onGridClick(t, n);
                            break
                        }
                        if (r.contains("allDay")) {
                            t === this._pressed && this._onAllDayClick(t, n);
                            break
                        }
                        if (r.contains("fullDate")) {
                            if (t === this._pressed) {
                                var u = this._getItemRoot(t)
                                  , o = new Date
                                  , e = u._day
                                  , s = new Date(e.getFullYear(),e.getMonth(),e.getDate(),o.getHours());
                                this._createEvent(n, u._events.parentNode, s, false, u._fullDate)
                            }
                            break
                        }
                        if (r.contains("activeAnchor")) {
                            t === this._pressed && this._onDateAnchorClicked();
                            break
                        }
                    }
                this._pressed = null;
                this._focused.removeAttribute("data-state");
                this._focused = null
            }
        } else
            this._handleKeyboardAndAcc(n);
        this._gotPointerDown = false
    }
    ;
    n._handleLeft = function(n, t) {
        var u = n.indexOf(t), i = n[u - 1], r;
        return i ? (r = i.querySelector("[tabindex]"),
        r.focus(),
        true) : false
    }
    ;
    n._handleRight = function(n, t) {
        var u = n.indexOf(t), i = n[u + 1], r;
        return i ? (r = i.querySelector("[tabindex]"),
        r.focus(),
        true) : false
    }
    ;
    n._handleUp = function(n, t, i) {
        var r = o(t, "[tabindex]")
          , f = r.indexOf(i)
          , u = r[f - 1];
        return u ? (u.focus(),
        true) : false
    }
    ;
    n._handleDown = function(n, t, i) {
        var r = o(t, "[tabindex]")
          , f = r.indexOf(i)
          , u = r[f + 1];
        return u ? (u.focus(),
        true) : false
    }
    ;
    n._handleTab = function(n, t, i, r) {
        var u, h, f, e, s;
        return r ? (u = this._handleUp(n, t, i),
        u || (h = n.indexOf(t),
        f = n[h - 1],
        f && (e = o(f, "[tabindex]"),
        s = e[e.length - 1],
        s && (s.focus(),
        u = true)))) : u = this._handleDown(n, t, i) || this._handleRight(n, t, i),
        u
    }
    ;
    n._onKeyDownNav = function(n) {
        var i = Jx.KeyCode, f = n.keyCode, r, t, u;
        if (i.leftarrow <= f && f <= i.downarrow || f === i.tab) {
            for (n.preventDefault(),
            r = this._timeline.getRealized().map(function(n) {
                return n.el
            }),
            t = this._host.querySelector(":focus"); t && !t.hasAttribute("tabIndex"); )
                t = t.parentElement;
            if (!t) {
                r[0].querySelector(".fullDate-text").focus();
                return
            }
            u = this._getItemRoot(t);
            switch (f) {
            case i.leftarrow:
                this._handleLeft(r, u, t);
                break;
            case i.rightarrow:
                this._handleRight(r, u, t);
                break;
            case i.uparrow:
                this._handleUp(r, u, t);
                break;
            case i.downarrow:
                this._handleDown(r, u, t);
                break;
            case i.tab:
                this._handleTab(r, u, t, n.shiftKey)
            }
        }
    }
    ;
    n._onKeyDown = function(n) {
        switch (n.key) {
        case "Enter":
        case "Spacebar":
            this._handleKeyboardAndAcc(n)
        }
    }
    ;
    n._onResizeWindow = function() {
        !this._host || this._quickEvent && this._quickEvent.isOpen() || (this._isTall = 1080 < this._host.offsetHeight)
    }
    ;
    n._resetUiMembers = function() {
        r("resetUiMembers");
        this._updateToday(Calendar.getToday());
        this._host = null;
        this._jobset = null;
        this._time = null;
        this._focusedIndex = 0;
        this._eventToFocus = null;
        this._lastWidth = null;
        this._positions = {};
        this._workerIds = {};
        this._ariaDirty = false;
        u("resetUiMembers")
    }
    ;
    n._updateToday = function(n) {
        this._today && i.isSameDate(n, this._today) || (this._today = n,
        this._left = Math.round((n - Calendar.FIRST_DAY) / i.dayInMilliseconds),
        this._right = Math.round((Calendar.LAST_DAY - n) / i.dayInMilliseconds))
    }
    ;
    n._getItemRoot = function(n) {
        while (n && !Jx.hasClass(n, "day"))
            n = n.parentNode;
        return n
    }
    ;
    n._getDayName = function(n, r, u, f) {
        return r ? t._today : u ? t._tomorrow : f ? t._yesterday : i.getDay(n.getDay())
    }
    ;
    n._getFullDate = function(n, i, r, u) {
        var f = t._fullDate;
        return (i || r || u) && (f = t._fullDateWithDay),
        f.format(n)
    }
    ;
    n._processDay = function(n) {
        var t = n._data = i.getDayInfo(this._today, n)
          , r = n.getDay()
          , u = r === 6 || Calendar.DAYS_IN_WEEKEND === 2 && r === 0;
        return t.isWeekend = u,
        t.longDate = h.format(n),
        t
    }
    ;
    n._initForDayType = function(n, t) {
        var r = n._data
          , i = "";
        r.isToday && (i += "today",
        this._showTimeIndicator(t._grid.querySelector(".hours")));
        r.isWeekend && (i += " weekend");
        i ? (t.className = "day " + i,
        t._className = i) : t._className && (t.className = "day",
        t._className = "")
    }
    ;
    n._focusEventDay = function() {
        var t, n, i;
        r("focusEventDay");
        this._eventToFocus && (t = this._host.offsetWidth !== this._lastWidth,
        n = this._eventToFocus.startDate,
        t || (i = new Date(n.getFullYear(),n.getMonth(),n.getDate()),
        t = !(i in this._positions)),
        t && this.setFocusedDay(n));
        u("focusEventDay")
    }
    ;
    n._getScrollTop = function(n, f) {
        r("getScrollTop");
        var e;
        return e = n in this._positions ? this._positions[n] : this._isTall ? t._fourAmOffset : t._nineAmOffset,
        this._eventToFocus && !this._eventToFocus.allDayEvent && i.isSameDate(n, this._eventToFocus.startDate) && (e = i.getIdealScrollTop(this._eventToFocus, f, e),
        this._eventToFocus = null),
        u("getScrollTop"),
        e
    }
    ;
    n._showTimeIndicator = function(n) {
        this._time || (this._time = new Calendar.Controls.TimeIndicator);
        this._time.activateUI(n)
    }
    ;
    n._updateAria = function() {
        this._ariaDirty || (this._ariaDirty = true,
        this._jobset.addUIJob(this, this._doUpdateAria, null, People.Priority.accessibility))
    }
    ;
    n._doUpdateAria = function() {
        var r, n, l, f, e, o, s, v, i, h, c;
        if (this._host) {
            for (r = this._timeline.getRealized(),
            n = 0,
            l = r.length; n < l; n++) {
                var y = r[n]
                  , a = r[n + 1]
                  , t = y.el.querySelectorAll("[tabindex]")
                  , u = t[t.length - 1];
                for (n === 0 && (f = document.getElementById("aria-flowstart"),
                e = t[0],
                f.setAttribute("aria-flowto", e.id),
                e.setAttribute("x-ms-aria-flowfrom", f.id)),
                a ? (o = a.el.querySelector("[tabindex]"),
                u.setAttribute("aria-flowto", o.id),
                o.setAttribute("x-ms-aria-flowfrom", u.id)) : (s = document.getElementById("aria-flowend"),
                u.setAttribute("aria-flowto", s.id),
                s.setAttribute("x-ms-aria-flowfrom", u.id)),
                v = t.length - 1,
                i = 0; i < v; ++i)
                    h = t[i],
                    c = t[i + 1],
                    h.setAttribute("aria-flowto", c.id),
                    c.setAttribute("x-ms-aria-flowfrom", h.id)
            }
            this._ariaDirty = false
        }
    }
    ;
    n._renderer = function(n) {
        var t = this._processDay(n);
        return t.uid = "dayview" + Jx.uid(),
        t.name = this._getDayName(n, t.isToday, t.isTomorrow, t.isYesterday),
        l.call(this, t)
    }
    ;
    n._recycler = function(n, i) {
        var f = i.item, r = i.el, u;
        r._day = f;
        r.jobset = i.jobset;
        u = this._processDay(f);
        e.applyHeaderText(r._dayName, this._getDayName(f, u.isToday, u.isTomorrow, u.isYesterday));
        r._fullDate.firstChild.nodeValue = this._getFullDate(f, u.isToday, u.isTomorrow, u.isYesterday);
        r._fullDate.setAttribute("aria-label", u.longDate);
        e.deactivateHeader(r._dayName);
        r._allDay.firstChild && (r._allDay.innerHTML = "");
        r._allDay.style.opacity = 0;
        r._events.firstChild && (r._events.innerHTML = "");
        r._events.style.opacity = 0;
        this._initForDayType(f, r);
        r._grid.style.msOverflowStyle = "none";
        r._grid.scrollTop = this._isTall ? t._fourAmOffset : t._nineAmOffset;
        r._grid.style.msOverflowStyle = "-ms-autohiding-scrollbar";
        this._getEvents(f, r)
    }
    ;
    n._createEvent = function(n, t, i, r, u) {
        n.stopPropagation();
        n.ctrlKey ? this._quickEvent && this._quickEvent.isOpen() ? this._quickEvent && this._quickEvent.onDismiss() : this.fire("createEvent", {
            startDate: i,
            allDayEvent: r
        }) : (this._quickEvent || (this._quickEvent = new Calendar.Controls.QuickEvent(Calendar.Views.Manager.Views.day),
        this.appendChild(this._quickEvent)),
        this._quickEvent.activateUI(t, i, r, null, u))
    }
})
