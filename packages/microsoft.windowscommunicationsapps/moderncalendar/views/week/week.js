Jx.delayDefine(Calendar.Views, "Week", function() {
    function s(n) {
        Jx.mark("Calendar:Week." + n + ",Info,Calendar")
    }
    function i(n) {
        Jx.mark("Calendar:Week." + n + ",StartTA,Calendar")
    }
    function r(n) {
        Jx.mark("Calendar:Week." + n + ",StopTA,Calendar")
    }
    function a(n) {
        return '<div id="' + n.id + '" class="' + n.className + '"><div id="aria-flowstart" role="listitem"><\/div><div class="timeline-host"><\/div><div id="aria-flowend" role="listitem"><\/div><div class="dp-anchor"><\/div><\/div>'
    }
    function v(n) {
        var t = n.week, r = t.getDate(), u = new Date(t.getFullYear(),t.getMonth(),r), f = "", o = n.context._getHeaderFormatter(t), e = -1, i;
        for (t.isThisWeek && (e = n.context._today.getDate()),
        i = 0; i < 7; i++)
            f += "<div id='date-" + i + n.uid + "' tabIndex='0' data-order='" + i + "' role='button' aria-label='" + Jx.escapeHtml(h.format(u)) + "' class='date",
            r === e && (f += " today"),
            f += "'>" + o.format(u) + "<\/div>",
            u.setDate(r + 1),
            r = u.getDate();
        return f
    }
    function y(n) {
        return '<div class="week"><div class="' + n.headerClass + '"><div class="dateAnchor"><div id="da-' + n.uid + '" class="anchorText" role="heading" tabindex="0">' + Jx.escapeHtml(n.header) + '<\/div><div class="dateChevron" aria-hidden="true">&#xE09D;<\/div><\/div><\/div><div class="days">' + v(n) + '<\/div><div class="allDay"><div class="margin"><\/div><div class="events"><div class="container"><\/div><\/div><div class="events"><div class="container"><\/div><\/div><div class="events"><div class="container"><\/div><\/div><div class="events"><div class="container"><\/div><\/div><div class="events"><div class="container"><\/div><\/div><div class="events"><div class="container"><\/div><\/div><div class="events"><div class="container"><\/div><\/div><\/div><div class="allDaySpacer"><div class="margin"><\/div><div class="events"><\/div><div class="events"><\/div><div class="events"><\/div><div class="events"><\/div><div class="events"><\/div><div class="events"><\/div><div class="events"><\/div><\/div><div class="grid"><div class="hours" aria-hidden="true">' + u.getHoursHtml(n) + '<\/div><div class="events" role="list"><div class="container"><\/div><\/div><div class="events" role="list"><div class="container"><\/div><\/div><div class="events" role="list"><div class="container"><\/div><\/div><div class="events" role="list"><div class="container"><\/div><\/div><div class="events" role="list"><div class="container"><\/div><\/div><div class="events" role="list"><div class="container"><\/div><\/div><div class="events" role="list"><div class="container"><\/div><\/div><\/div><\/div>'
    }
    function c(n) {
        return n.offsetWidth && n.offsetHeight
    }
    function p(n) {
        for (n = n.querySelector(":focus"); n && !n.hasAttribute("data-order") && !n.classList.contains("anchorText"); )
            n = n.parentElement;
        return n
    }
    function o(n) {
        for (var i = n.querySelectorAll("[data-order]:not(.anchorText)"), t = 0, r = i.length; t < r; t++)
            if (n = i[t],
            n.offsetWidth && n.offsetHeight)
                return n;
        return null
    }
    function l(n, t) {
        return Array.prototype.slice.call(n.querySelectorAll(t))
    }
    var u = Calendar.Helpers, e = Calendar.Controls.DatePickerAnchor, f = WinJS.UI.Animation, h = new Jx.DTFormatter("longDate"), t = Calendar.Views.Week = function() {
        if (i("ctor"),
        this.initComponent(),
        this._id = "calWeek",
        !t._name) {
            i("ctor:static");
            u.ensureFormats();
            t._name = "Calendar.Views.Week";
            t._fourAmOffset = 240;
            t._nineAmOffset = 540;
            t._lastWeek = Jx.res.getString("LastWeek");
            t._thisWeek = Jx.res.getString("ThisWeek");
            t._nextWeek = Jx.res.getString("NextWeek");
            t._header = new Jx.DTFormatter("month year");
            t._headerPortrait = new Jx.DTFormatter("month.abbreviated year");
            t._headerRange = Jx.res.getFormatFunction("TimeRange");
            t._dayHeader = new Jx.DTFormatter("{dayofweek.full} {day.integer}");
            t._dayHeaderAlt = new (new Jx.dtf)("dayofweek.abbreviated month.abbreviated day");
            t._updateFormatsForLanguage();
            t._dayHeaderShort = new Jx.DTFormatter("{dayofweek.abbreviated(2)}, " + Jx.res.loadCompoundString("ShortDateFormatter", "{month.integer}", "{day.integer}"));
            var n = t._dayHeader
              , f = t._dayHeaderAlt
              , e = t._dayHeaderShort;
            t._dayHeader = {
                format: function(t) {
                    return Jx.escapeHtml(n.format(t))
                }
            };
            t._dayHeaderAlt = {
                format: function(n) {
                    return Jx.escapeHtml(f.format(n))
                }
            };
            t._dayHeaderShort = {
                format: function(n) {
                    return Jx.escapeHtml(e.format(n))
                }
            };
            r("ctor:static")
        }
        this._resetUiMembers();
        this._renderer = this._renderer.bind(this);
        this._recycler = this._recycler.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyDownNav = this._onKeyDownNav.bind(this);
        this._onPointerDown = this._onPointerDown.bind(this);
        this._onClick = this._onClick.bind(this);
        this._loadAnimation = WinJS.UI.Animation.enterPage;
        r("ctor")
    }
    , n;
    Jx.augment(t, Jx.Component);
    n = t.prototype;
    n.setWorkWeek = function(n) {
        var i, t, u, r, f;
        if (this._isWorkWeek !== n && (this._isWorkWeek = n,
        this._host))
            for (this._host.classList.toggle("workweek"),
            i = this._timeline.getRealized(true),
            t = 0,
            u = i.length; t < u; t++)
                r = i[t].el,
                f = r._week,
                e.applyHeaderText(r._header, this._getHeaderText(f))
    }
    ;
    n.setFocusedDay = function(n) {
        n = new Date(n.getFullYear(),n.getMonth(),n.getDate());
        n < Calendar.FIRST_DAY ? (s("Day for " + t._name + " is out of bounds (" + n + " < " + Calendar.FIRST_DAY + ")."),
        n = Calendar.FIRST_DAY) : n > Calendar.LAST_DAY && (s("Day for " + t._name + " is out of bounds (" + n + " > " + Calendar.LAST_DAY + ")."),
        n = Calendar.LAST_DAY);
        this._focusedDay = n;
        this._focusedIndex = Math.floor(Math.round((n - this._week) / u.dayInMilliseconds) / 7);
        this._timeline && this._timeline.setFocusedIndex(this._focusedIndex)
    }
    ;
    n.getFocusedDay = function() {
        return this._focusedIndex === 0 ? this._today : this._focusedDay
    }
    ;
    n.getState = function() {
        var t = {}, i, n, r;
        return this._timeline && (i = this._timeline.getRealized(),
        n = i[0].el,
        r = n._week,
        t[r] = n._grid.scrollTop),
        t
    }
    ;
    n.setState = function(n) {
        this._positions = n
    }
    ;
    n.focusEvent = function(n) {
        var r = this._focusedIndex, i, t;
        this.setFocusedDay(n.startDate);
        this._host && r === this._focusedIndex ? (i = this._timeline.getRealized(),
        t = i[0].el,
        this._eventToFocus = n,
        t._grid.scrollTop = this._getScrollTop(t._week, t._grid)) : n.allDayEvent || (this._eventToFocus = n)
    }
    ;
    n.containsDate = function(n) {
        var t = this.getItem(this._focusedIndex)
          , i = this.getItem(this._focusedIndex + 1);
        return t <= n && n < i
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
        var t = "weekview";
        this._isWorkWeek && (t += " workweek");
        n.html = a.call(this, {
            id: this._id,
            className: t
        })
    }
    ;
    n.activateUI = function(n) {
        var u, t;
        i("activateUI");
        this._jobset = n;
        this._host = document.getElementById(this._id);
        this._dpAnchor = this._host.querySelector(".dp-anchor");
        this._getWorker();
        this._isNarrow = this._host.offsetWidth < 1024;
        this._isTall = 1080 < this._host.offsetHeight;
        this._updateToday(Calendar.getToday());
        Calendar.addListener("dayChanged", this._onDayChanged, this);
        u = {};
        this.fire("getSettings", u);
        t = this._timeline = new Calendar.Controls.Timeline(this._host.querySelector(".timeline-host"),this._jobset,this,this._renderer,this._recycler);
        t.setAlwaysShowArrows(u.settings.get("alwaysShowArrows"));
        this.on("showArrows", this._onShowArrows);
        this.on("dateSelected", this._onDateSelected);
        t.addListener("focusChanged", this._onFocusChanged, this);
        t.addListener("itemRealized", this._onItemRealized, this);
        t.addListener("itemRemoved", this._onItemRemoved, this);
        t.initialize(this._focusedIndex);
        this._host.addEventListener("MSPointerDown", this._onPointerDown, false);
        this._host.addEventListener("click", this._onClick, false);
        this._host.addEventListener("keydown", this._onKeyDown, false);
        this._host.addEventListener("keydown", this._onKeyDownNav, false);
        this.on("resizeWindow", this._onResizeWindow);
        this.on("setScrollable", this._onSetScrollable);
        var e = this._host.querySelector(".header")
          , o = this._host.querySelector(".days")
          , s = this._host.querySelector(".allDay")
          , h = this._host.querySelector(".grid")
          , f = function() {
            this.fire("viewReady")
        }
        .bind(this);
        this._loadAnimation([e, [o, s, h]]).done(f, f);
        r("activateUI")
    }
    ;
    n.deactivateUI = function() {
        i("deactivateUI");
        this._jobset.cancelAllChildJobs();
        this._datePicker && (this.removeChild(this._datePicker),
        this._datePicker.shutdownUI(),
        this._datePicker = null);
        this._dpAnchor = null;
        this._quickEvent && (this._quickEvent.deactivateUI(),
        this._quickEvent = null);
        this._timeline.shutdown();
        this._timeline.removeListener("itemRemoved", this._onItemRemoved, this);
        this._timeline.removeListener("itemRealized", this._onItemRealized, this);
        this._timeline.removeListener("focusChanged", this._onFocusChanged, this);
        this._timeline = null;
        this.detach("showArrows", this._onShowArrows);
        this.detach("resizeWindow", this._onResizeWindow);
        this.detach("dateSelected", this._onDateSelected);
        this.detach("setScrollable", this._onSetScrollable);
        this._host.removeEventListener("keydown", this._onKeyDownNav, false);
        this._host.removeEventListener("keydown", this._onKeyDown, false);
        this._host.removeEventListener("click", this._onClick, false);
        this._host.removeEventListener("MSPointerDown", this._onPointerDown, false);
        this._host = null;
        this._worker.removeListener("Week/getEvents", this._onGetEvents, this);
        this._worker.removeListener("Week/eventChanged", this._onEventChanged, this);
        this._worker.removeListener("Week/eventsChanged", this._onEventsChanged, this);
        this._worker.removeListener("Week/expandAllDay", this._onExpandAllDay, this);
        this._worker = null;
        Calendar.removeListener("dayChanged", this._onDayChanged, this);
        this._resetUiMembers();
        r("deactivateUI")
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
        return new Date(this._week.getFullYear(),this._week.getMonth(),this._week.getDate() + n * 7)
    }
    ;
    t._hourHeight = 60;
    t._updateFormatsForLanguage = function() {
        var n, u;
        i("_updateFormatsForLanguage");
        n = t._dayHeaderAlt.resolvedLanguage.split("-")[0];
        switch (n) {
        case "ta":
            t._dayHeader = new Jx.DTFormatter("{dayofweek.abbreviated} {day.integer}");
            t._dayHeaderAlt = new Jx.DTFormatter("{dayofweek.abbreviated} " + Jx.res.loadCompoundString("ShortDateFormatter", "{month.integer}", "{day.integer}"));
            break;
        case "ko":
            t._dayHeader = new Jx.DTFormatter("{day.integer}일 {dayofweek.full}");
            break;
        case "ja":
        case "zh":
            t._dayHeader = new Jx.DTFormatter("{day.integer}日 {dayofweek.full}")
        }
        (n === "ja" || n === "ko") && (u = t._dayHeaderAlt.patterns[0].replace("{dayofweek.abbreviated}", "({dayofweek.abbreviated})"),
        t._dayHeaderAlt = new Jx.DTFormatter(u));
        r("_updateFormatsForLanguage")
    }
    ;
    n._onFocusChanged = function(n) {
        var c, t, u, f;
        i("_onFocusChanged");
        var l = this._focusedIndex
          , s = n.index
          , h = this._focusedDay
          , a = (s - l) * 7;
        if (h.setDate(h.getDate() + a),
        this._focusedIndex = s,
        n.item.isThisWeek)
            for (c = n.el._headerDays,
            t = 0; t < 7; t++)
                u = c[t],
                u._isToday && Jx.safeSetActive(u);
        else
            f = o(n.el),
            f && Jx.safeSetActive(f);
        e.updateDatePickerButton(this._timeline, n);
        this._updateAria();
        r("_onFocusChanged")
    }
    ;
    n._onItemRealized = function(n) {
        var e, t, u, f, o;
        i("_onItemRealized");
        e = n.item;
        t = n.el;
        t.jobset = n.jobset;
        u = Array.prototype.slice;
        t._week = e;
        t._header = t.querySelector(".header");
        t._headerDays = u.call(t.querySelector(".days").children);
        t._allDay = t.querySelector(".allDay");
        t._allDayEvents = u.call(t._allDay.querySelectorAll(".events > div"));
        t._grid = t.querySelector(".grid");
        t._gridEvents = u.call(t._grid.querySelectorAll(".events > div"));
        f = t.querySelector(".today");
        f && (f._isToday = true,
        o = t._headerDays.indexOf(f),
        this._showTimeIndicator(t._grid.children[o + 1]));
        this._setupWeekends(t);
        i("_onItemRealized:scrollGrid");
        t._grid.style.msOverflowStyle = "none";
        t._grid.scrollTop = this._getScrollTop(t._week, t._grid);
        t._grid.style.msOverflowStyle = "-ms-autohiding-scrollbar";
        r("_onItemRealized:scrollGrid");
        this._getEvents(e, t);
        r("_onItemRealized")
    }
    ;
    n._onItemRemoved = function(n) {
        i("_onItemRemoved");
        var t = n.item
          , u = t.workerId;
        t.isThisWeek && this._time.deactivateUI();
        this._worker.postCommand("Week/cancel", null, u);
        delete this._workerIds[u];
        r("_onItemRemoved")
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
        var r = this._today, f = this._week, t = this._datePicker, i;
        this._updateToday(n);
        t && (t.hide(),
        t.setToday(n));
        this._focusedIndex && (i = Math.round((this._week - f) / u.dayInMilliseconds / 7),
        this._focusedIndex -= i);
        u.isSameDate(this._focusedDay, r) && (this._focusedDay = n);
        this._timeline.initialize(this._focusedIndex)
    }
    ;
    n._getWorker = function() {
        var n = {};
        this.fire("getPlatformWorker", n);
        this._worker = n.platformWorker;
        this._worker.addListener("Week/getEvents", this._onGetEvents, this);
        this._worker.addListener("Week/eventChanged", this._onEventChanged, this);
        this._worker.addListener("Week/eventsChanged", this._onEventsChanged, this);
        this._worker.addListener("Week/expandAllDay", this._onExpandAllDay, this)
    }
    ;
    n._getEvents = function(n, t) {
        var i = n.getFullYear()
          , r = n.getMonth()
          , u = n.getDate()
          , f = new Date(i,r,u)
          , e = new Date(i,r,u + 7);
        n.workerId = this._worker.postCommand("Week/getEvents", {
            start: f.getTime(),
            end: e.getTime(),
            isVisible: t.jobset.isVisible
        });
        this._workerIds[n.workerId] = t
    }
    ;
    n._setEventHtml = function(n, t) {
        var u, f, e;
        for (i("_setEventHtml"),
        u = 0; u < 7; u++)
            f = t.allDayHtml[u],
            e = t.eventHtml[u],
            n._allDayEvents[u].innerHTML = f,
            n._gridEvents[u].innerHTML = e;
        r("_setEventHtml")
    }
    ;
    n._onGetEvents = function(n) {
        var t = this._workerIds[n.id];
        t && (i("_onGetEvents"),
        t.jobset.addUIJob(this, function() {
            i("_onGetEvents:inner");
            this._setEventHtml(t, n);
            f.fadeIn([t._allDayEvents].concat(t._gridEvents)).done();
            this._updateAria();
            r("_onGetEvents:inner")
        }, null, People.Priority.userTileRender),
        r("_onGetEvents"))
    }
    ;
    n._onEventsChanged = function(n) {
        var t = this._workerIds[n.id];
        t && t.jobset.addUIJob(this, function() {
            var f, e, u, o, s;
            for (i("_onEventsChanged"),
            f = t._allDayEvents,
            e = t._gridEvents,
            t._allDayEvents = [],
            t._gridEvents = [],
            u = 0; u < 7; u++)
                o = t._allDayEvents[u] = f[u].cloneNode(false),
                s = t._gridEvents[u] = e[u].cloneNode(false),
                o.style.opacity = 0,
                s.style.opacity = 0,
                o.innerHTML = n.allDayHtml[u],
                s.innerHTML = n.eventHtml[u],
                f[u].parentElement.appendChild(o),
                e[u].parentElement.appendChild(s);
            setImmediate(function() {
                WinJS.UI.executeTransition([t._allDayEvents, t._gridEvents], {
                    property: "opacity",
                    delay: 0,
                    duration: 250,
                    timing: "linear",
                    to: 1
                }).done();
                WinJS.UI.executeTransition([f, e], {
                    property: "opacity",
                    delay: 200,
                    duration: 250,
                    timing: "linear",
                    to: 0
                }).done(function() {
                    if (t.parentNode)
                        for (var n = 0; n < 7; n++)
                            f[n].outerHTML = "",
                            e[n].outerHTML = ""
                })
            });
            this._updateAria();
            r("_onEventsChanged")
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
        var e, u, f, h, o, s;
        for (i("_onEventChanged"),
        e = n.properties,
        u = [],
        f = 0,
        h = e.length; f < h; f++)
            o = e[f],
            t._properties[o] && u.push(o);
        u.length && (s = this._workerIds[n.id],
        s && this._updateEventUi(s, n.ev, u));
        r("_onEventChanged")
    }
    ;
    t._updateBusyStatus = function(n, t) {
        var i = n.querySelector(".glyph");
        f.fadeOut(i).done(function() {
            n.setAttribute("data-status", u.busyStatusClasses[t.busyStatus]);
            f.fadeIn(i)
        })
    }
    ;
    t._updateColor = function(n, t) {
        var i = u.processEventColor(t.color);
        n.style.color = i;
        n.querySelector(".glyph").style.backgroundColor = i
    }
    ;
    t._updateLocation = function(n, t) {
        var i = n.querySelector(".location"), r;
        i && (r = Jx.hasClass(n, "short") ? "(" + t.location + ")" : t.location,
        f.fadeOut(i).done(function() {
            i.innerText = r;
            f.fadeIn(i)
        }))
    }
    ;
    t._updateSubject = function(n, t) {
        var i = n.querySelector(".subject");
        f.fadeOut(i).done(function() {
            i.innerText = t.subject;
            f.fadeIn(i)
        })
    }
    ;
    t._updateFns = {
        busyStatus: t._updateBusyStatus,
        color: t._updateColor,
        location: t._updateLocation,
        subject: t._updateSubject
    };
    n._updateEventUi = function(n, u, f) {
        var e, l, o, a, s, h;
        i("_updateEventUi");
        var v = u.handle
          , c = document.querySelectorAll("[data-handle='" + v + "']")
          , y = c.length;
        for (e = 0; e < y; e++)
            for (l = c[e],
            o = 0,
            a = f.length; o < a; o++)
                s = f[o],
                h = t._updateFns[s],
                h && h(l, u, s);
        r("_updateEventUi")
    }
    ;
    n._onExpandAllDay = function(n) {
        var t = this._workerIds[n.id], i, r;
        t && (i = n.index,
        r = t._allDayEvents[i],
        r.innerHTML = n.html)
    }
    ;
    n._handleLeft = function(n, t) {
        return this._handleColumnNavigation(n, t, -1)
    }
    ;
    n._handleRight = function(n, t) {
        return this._handleColumnNavigation(n, t, 1)
    }
    ;
    n._handleColumnNavigation = function(n, t, i) {
        var f = parseInt(t.getAttribute("data-order"), 10) + i, r, u = false, e = false;
        do
            r = n.querySelector("[data-order='" + f + "']"),
            f += i,
            r ? c(r) && (r.focus(),
            e = true,
            u = true) : u = true;
        while (!u);return e
    }
    ;
    n._handleUp = function(n, t, i) {
        var e = parseInt(t.getAttribute("data-order"), 10)
          , u = l(n, "[data-order='" + e + "']")
          , o = u.indexOf(t)
          , r = u[o - 1]
          , f = n.querySelector(".anchorText");
        return (i || r || !f || (r = f),
        r) ? (r.focus(),
        true) : false
    }
    ;
    n._handleDown = function(n, t) {
        var r = parseInt(t.getAttribute("data-order"), 10)
          , f = isNaN(r) ? 0 : r
          , u = l(n, "[data-order='" + f + "']")
          , e = u.indexOf(t)
          , i = u[e + 1]
          , s = n.querySelector(".anchorText")
          , h = t === s;
        return (h && (i = o(n)),
        i) ? (i.focus(),
        true) : false
    }
    ;
    n._handleTab = function(n, t, i) {
        var r, e, u, f, o;
        if (i) {
            if (r = this._handleUp(n, t, true),
            !r) {
                e = parseInt(t.getAttribute("data-order"), 10) - 1;
                f = false;
                do
                    u = n.querySelectorAll("[data-order='" + e + "']"),
                    --e,
                    u.length > 0 ? (o = u[u.length - 1],
                    c(o) && (o.focus(),
                    r = true,
                    f = true)) : f = true;
                while (!f);r || (r = this._handleUp(n, t))
            }
        } else
            r = this._handleDown(n, t) || this._handleRight(n, t);
        return r
    }
    ;
    n._onKeyDownNav = function(n) {
        var t = Jx.KeyCode, u = n.keyCode, e, f;
        if (t.leftarrow <= u && u <= t.downarrow || u === t.tab) {
            n.preventDefault();
            e = this._timeline.getRealized();
            var i = e[0].el
              , r = p(i)
              , s = i.querySelector(".anchorText")
              , h = s === r;
            if (!r && !h) {
                f = o(i);
                f && f.focus();
                return
            }
            switch (u) {
            case t.leftarrow:
                this._handleLeft(i, r);
                break;
            case t.rightarrow:
                this._handleRight(i, r);
                break;
            case t.uparrow:
                this._handleUp(i, r);
                break;
            case t.downarrow:
                this._handleDown(i, r);
                break;
            case t.tab:
                this._handleTab(i, r, n.shiftKey)
            }
        }
    }
    ;
    n._onAllDayClick = function(n, t) {
        var r = this._getItemRoot(n), u = r._week, e = r._headerDays, f = r._allDayEvents, i = f.indexOf(t.target), o, s;
        i === -1 && (this._isWorkWeek ? (o = r._allDay.querySelector(".events:not(.weekend) .container"),
        i = f.indexOf(o)) : i = 0,
        u.isThisWeek && (i = e.indexOf(r.querySelector(".today"))));
        s = new Date(u.getFullYear(),u.getMonth(),u.getDate() + i);
        this._createEvent(t, f[i].parentNode, s, true, e[i])
    }
    ;
    n._onGridClick = function(n, i) {
        for (var u = this._getItemRoot(n), e = u._week, s = u._gridEvents, h = u._headerDays, c = u._grid, r = s.indexOf(i.target), l = i.offsetY, o, a, v, y, f = i.target; f !== n; f = f.parentElement)
            l += f.offsetTop;
        if (o = Math.floor(l / t._hourHeight),
        r === -1)
            this._isWorkWeek ? (a = c.querySelector(".events:not(.weekend) .container"),
            r = s.indexOf(a)) : r = 0,
            e.isThisWeek && (r = h.indexOf(u.querySelector(".today")));
        else if (i.target.parentElement !== this._focusArea.day || o !== this._focusArea.hour)
            return;
        v = new Date(e.getFullYear(),e.getMonth(),e.getDate() + r,o);
        y = c.querySelectorAll(".events");
        this._createEvent(i, y[r], v, false, h[r])
    }
    ;
    n._onMoreClick = function(n) {
        var t = n.parentNode, i = this._getItemRoot(t), u = i._week, f = i._allDayEvents.indexOf(t), r;
        t.innerHTML = "";
        r = i.querySelector("[data-order='" + n.getAttribute("data-order") + "']");
        r.setActive();
        this._worker.postCommand("Week/expandAllDay", {
            index: f
        }, u.workerId)
    }
    ;
    n._onDateAnchorClicked = function() {
        this._showDatePicker()
    }
    ;
    n._showDatePicker = function() {
        var n, u, t;
        i("_showDatePicker");
        n = this._datePicker;
        u = Calendar.getToday();
        n || (i("_showDatePicker:!datePicker"),
        t = Calendar.Controls.DatePicker,
        n = this._datePicker = new t(t.PickMode.monthGrid),
        n.setIdSuffix(""),
        n.addCustomClass("weekviewPicker"),
        n.showFreeBusy = false,
        n.setToday(u),
        n.setFocusDate(u),
        n.clientView = this._isWorkWeek ? t.ClientView.workWeek : t.ClientView.week,
        this.appendChild(n),
        n.activateUI(this._jobset),
        r("_showDatePicker:!datePicker"));
        n.getActive() || (this._configureDatePicker(),
        n.show(this._dpAnchor, "bottom", Jx.isRtl() ? "right" : "left"));
        r("_showDatePicker")
    }
    ;
    n._handleKeyboardAndAcc = function(n) {
        var t;
        if (n.preventDefault(),
        t = n.target,
        Jx.hasClass(t, "more"))
            this._onMoreClick(t);
        else if (Jx.hasClass(t, "event"))
            this._quickEvent && this._quickEvent.isOpen() ? this._quickEvent.onDismiss() : u.editEvent(this, t.getAttribute("data-handle"), t);
        else if (Jx.hasClass(t, "date")) {
            var i = this._getItemRoot(t)
              , o = new Date
              , r = i._week
              , f = i._headerDays.indexOf(t)
              , s = i._grid.querySelectorAll(".events")
              , h = new Date(r.getFullYear(),r.getMonth(),r.getDate() + f,o.getHours());
            this._createEvent(n, s[f], h, false, t)
        } else
            e.isActiveDateAnchor(t) && this._showDatePicker()
    }
    ;
    n._getFocusedItem = function(n) {
        var r = null, i = n.target, f, u, e;
        if (n.type !== "MSPointerCancel" && n.type !== "pointercancel" && !i.classList.contains("grid"))
            for (f = n.offsetY; i && i !== this._host; ) {
                if (u = i.classList,
                u.contains("hours")) {
                    r = n.target;
                    break
                }
                if (u.contains("events")) {
                    r = i;
                    i.parentElement.classList.contains("grid") && (e = Math.floor(f / t._hourHeight),
                    r = this._focusArea,
                    r.style.top = e * t._hourHeight - 1 + "px",
                    r.hour = e,
                    r.day = i,
                    i.insertBefore(r, i.firstElementChild));
                    break
                }
                if (u.contains("event") || u.contains("more") || u.contains("allDay") || u.contains("date") || u.contains("activeAnchor")) {
                    r = i;
                    break
                }
                f += i.offsetTop;
                i = i.parentElement
            }
        return r
    }
    ;
    n._onPointerDown = function(n) {
        var t, i, r;
        if (!this._pressed && n.button === 0)
            for (t = n.target; t; t = t.parentElement)
                if (i = t.classList,
                r = false,
                i.contains("event") || i.contains("more") ? (this._quickEvent && this._quickEvent.isOpen() || (f.pointerDown(t),
                t._pointerDown = true),
                r = true) : (i.contains("allDay") || i.contains("events") || i.contains("hours") || i.contains("date") || i.contains("activeAnchor")) && (r = true),
                r) {
                    this._host.addEventListener("MSPointerCancel", this._onClick, false);
                    this._pressed = t;
                    this._focused = this._getFocusedItem(n);
                    this._quickEvent && this._quickEvent.isOpen() ? n.preventDefault() : this._focused.setAttribute("data-state", "pressed");
                    break
                }
        this._gotPointerDown = true
    }
    ;
    n._onClick = function(n) {
        var t, i;
        if (this._gotPointerDown) {
            if (this._pressed) {
                if (this._pressed._pointerDown && f.pointerUp(this._pressed),
                this._host.removeEventListener("MSPointerCancel", this._onClick, false),
                n.type === "click")
                    for (t = n.target; t; t = t.parentElement) {
                        if (i = t.classList,
                        i.contains("event")) {
                            t === this._pressed && (this._quickEvent && this._quickEvent.isOpen() ? this._quickEvent && this._quickEvent.onDismiss() : u.editEvent(this, t.getAttribute("data-handle"), t));
                            break
                        }
                        if (i.contains("more")) {
                            t === this._pressed && this._onMoreClick(t);
                            break
                        }
                        if (i.contains("allDay") || i.contains("events") || i.contains("hours")) {
                            t === this._pressed && (t.parentElement.classList.contains("grid") ? this._onGridClick(t, n) : this._onAllDayClick(t, n));
                            break
                        }
                        if (i.contains("date")) {
                            if (t === this._pressed) {
                                var r = this._getItemRoot(t)
                                  , s = new Date
                                  , e = r._week
                                  , o = r._headerDays.indexOf(t)
                                  , h = r._grid.querySelectorAll(".events")
                                  , c = new Date(e.getFullYear(),e.getMonth(),e.getDate() + o,s.getHours());
                                this._createEvent(n, h[o], c, false, t)
                            }
                            break
                        }
                        if (i.contains("activeAnchor")) {
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
    n._onKeyDown = function(n) {
        switch (n.key) {
        case "Enter":
        case "Spacebar":
            this._handleKeyboardAndAcc(n)
        }
    }
    ;
    n._onResizeWindow = function() {
        var h, u, n, c, l, t, a;
        if (i("_onResizeWindow"),
        this._host) {
            var v = this._isNarrow
              , y = this._isTall
              , p = this._quickEvent && this._quickEvent.isOpen();
            if (this._isNarrow = this._host.offsetWidth < 1024,
            this._isTall = 1080 < this._host.offsetHeight,
            h = v !== this._isNarrow || y !== this._isTall && !p,
            u = this._timeline.getRealized(true),
            h)
                for (n = 0,
                c = u.length; n < c; n++) {
                    var f = u[n].el
                      , o = f._week
                      , s = new Date(o);
                    for (e.applyHeaderText(f._header, this._getHeaderText(o)),
                    l = this._getHeaderFormatter(o),
                    t = 0; t < 7; t++)
                        a = f._headerDays[t],
                        a.innerHTML = l.format(s),
                        s.setDate(s.getDate() + 1)
                }
        }
        r("_onResizeWindow")
    }
    ;
    n._resetUiMembers = function() {
        this._updateToday(Calendar.getToday());
        this._host = null;
        this._jobset = null;
        this._worker = null;
        this._isWorkWeek = false;
        this._focusedDay = new Date(this._today);
        this._focusedIndex = 0;
        this._time = null;
        this._focusArea = document.createElement("div");
        this._focusArea.className = "focusArea";
        this._eventToFocus = null;
        this._positions = {};
        this._workerIds = {};
        this._ariaDirty = false
    }
    ;
    n._updateToday = function(n) {
        if (!this._today || !u.isSameDate(n, this._today)) {
            var t = n.getDay() - u.firstDayOfWeek;
            t < 0 && (t += 7);
            this._today = n;
            this._week = new Date(n.getFullYear(),n.getMonth(),n.getDate() - t);
            this._left = Math.ceil(Math.round((this._week - Calendar.FIRST_DAY) / u.dayInMilliseconds) / 7);
            this._right = Math.floor(Math.round((Calendar.LAST_DAY - this._week) / u.dayInMilliseconds) / 7)
        }
    }
    ;
    n._getItemRoot = function(n) {
        while (n && !Jx.hasClass(n, "week"))
            n = n.parentNode;
        return n
    }
    ;
    n._getHeaderText = function(n) {
        var i = new Date(this._week), o, s;
        if (u.isSameDate(i, n))
            return n.isThisWeek = true,
            t._thisWeek;
        if (i.setDate(i.getDate() + 7),
        u.isSameDate(i, n))
            return n.isNextWeek = true,
            t._nextWeek;
        if (i.setDate(i.getDate() - 14),
        u.isSameDate(i, n))
            return n.isLastWeek = true,
            t._lastWeek;
        var f = n.getFullYear()
          , e = n.getMonth()
          , r = new Date(f,e,n.getDate() + 6);
        return this._isWorkWeek && (u.firstDayOfWeek === 0 ? (n = new Date(f,e,n.getDate() + 1),
        r.setDate(r.getDate() - 1)) : u.firstDayOfWeek === 1 ? r.setDate(r.getDate() - 2) : u.firstDayOfWeek === 6 && (n = new Date(f,e,n.getDate() + 2))),
        n.getMonth() === r.getMonth() ? o = t._header.format(n) : (s = this._isNarrow ? t._headerPortrait : t._header,
        o = t._headerRange(s.format(n), s.format(r))),
        o
    }
    ;
    n._setupWeekends = function(n) {
        i("_setupWeekends");
        var f = 6 - u.firstDayOfWeek
          , t = f + 1;
        u.firstDayOfWeek === 0 && (t = t % 7);
        Jx.addClass(n._headerDays[f], "weekend");
        Jx.addClass(n._allDayEvents[f].parentNode, "weekend");
        Jx.addClass(n._gridEvents[f].parentNode, "weekend");
        Jx.addClass(n._headerDays[t], "weekend");
        Jx.addClass(n._allDayEvents[t].parentNode, "weekend");
        Jx.addClass(n._gridEvents[t].parentNode, "weekend");
        r("_setupWeekends")
    }
    ;
    n._isSameWeek = function(n, t) {
        var i = t - n
          , r = Math.round(i / u.dayInMilliseconds)
          , f = Math.floor(r / 7);
        return f === 0
    }
    ;
    n._getScrollTop = function(n, i) {
        var r = i.scrollTop;
        return n in this._positions ? (r = this._positions[n],
        delete this._positions[n]) : r = this._isTall ? t._fourAmOffset : t._nineAmOffset,
        this._eventToFocus && this._isSameWeek(n, this._eventToFocus.startDate) && (r = u.getIdealScrollTop(this._eventToFocus, i, r),
        this._eventToFocus = null),
        r
    }
    ;
    n._getHeaderFormatter = function(n) {
        return this._isNarrow && !this._isWorkWeek ? t._dayHeaderShort : n.isThisWeek || n.isNextWeek || n.isLastWeek ? t._dayHeaderAlt : t._dayHeader
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
        var y, t, r, o, s, u, h, i, p, l, a, v;
        if (this._host) {
            for (y = this._timeline.getRealized(),
            t = y[0].el,
            this._isWorkWeek ? (r = t.querySelectorAll(".days > .date:not(.weekend)"),
            o = t.querySelectorAll(".allDay > .events:not(.weekend) > .container"),
            s = t.querySelectorAll(".grid   > .events:not(.weekend) > .container")) : (r = t._headerDays,
            o = t._allDayEvents,
            s = t._gridEvents),
            u = t.querySelector(".anchorText"),
            h = document.getElementById("aria-flowstart"),
            h.setAttribute("aria-flowto", u.id),
            u.setAttribute("x-ms-aria-flowfrom", h.id),
            i = 0,
            p = r.length; i < p; i++) {
                var n = r[i]
                  , c = r[i + 1]
                  , f = o[i].querySelectorAll(".event")
                  , e = s[i].querySelectorAll(".event");
                i === 0 && (u.setAttribute("aria-flowto", n.id),
                n.setAttribute("x-ms-aria-flowfrom", u.id));
                f.length && (l = f[0],
                n.setAttribute("aria-flowto", l.id),
                l.setAttribute("x-ms-aria-flowfrom", n.id),
                n = f[f.length - 1]);
                e.length && (a = e[0],
                n.setAttribute("aria-flowto", a.id),
                a.setAttribute("x-ms-aria-flowfrom", n.id),
                n = e[e.length - 1]);
                c ? (n.setAttribute("aria-flowto", c.id),
                c.setAttribute("x-ms-aria-flowfrom", n.id)) : (v = document.getElementById("aria-flowend"),
                n.setAttribute("aria-flowto", v.id),
                v.setAttribute("x-ms-aria-flowfrom", n.id))
            }
            this._ariaDirty = false
        }
    }
    ;
    n._generateDatePickerConfig = function(n, t, f) {
        var s, o, y, p, h, c, w;
        i("_generateDatePickerConfig");
        var l = {
            highlightDates: null,
            focusDate: null
        }
          , b = []
          , a = false
          , v = new Date(n)
          , e = [];
        for (s = 0; s < 7; ++s)
            o = new Date(t.getFullYear(),t.getMonth(),t.getDate() + s),
            y = true,
            f && (p = o.getDay(),
            (p === 0 || p === 6) && (y = false)),
            y && (b.push(o),
            u.isSameDate(o, n) && (a = true),
            a || (h = o.getMonth(),
            e[h] === undefined ? e[h] = {
                count: 1,
                year: o.getFullYear()
            } : ++e[h].count));
        if (l.highlightDates = b,
        a)
            v.setDate(1);
        else {
            var k = n.getMonth()
              , d = n.getFullYear()
              , g = 0;
            for (c in e)
                w = e[c].count,
                w > g && (g = w,
                k = c,
                d = e[c].year);
            v = new Date(d,k,1)
        }
        return l.focusDate = v,
        r("_generateDatePickerConfig"),
        l
    }
    ;
    n._configureDatePicker = function() {
        var f;
        i("_configureDatePicker");
        var n = this._datePicker, e = this._timeline.getRealized()[0], u = Calendar.getToday(), t;
        n.setToday(u);
        f = this.getItem(e.index);
        t = this._generateDatePickerConfig(u, f, this._isWorkWeek);
        n.setHighlightDates(t.highlightDates);
        n.setFocusDate(t.focusDate);
        r("_configureDatePicker")
    }
    ;
    n._renderer = function(n) {
        var t, u;
        return i("_renderer"),
        t = {
            context: this,
            week: n,
            uid: "weekview" + Jx.uid(),
            header: this._getHeaderText(n),
            headerClass: "header"
        },
        n.isThisWeek && (t.headerClass += " thisWeek"),
        u = y(t),
        r("_renderer"),
        u
    }
    ;
    n._recycler = function(n, u) {
        var o, f, s, c, v, y;
        i("_recycler");
        o = u.item;
        f = u.el;
        f._week = o;
        f.jobset = u.jobset;
        e.applyHeaderText(f._header, this._getHeaderText(o));
        e.deactivateHeader(f._header);
        n.isThisWeek && Jx.removeClass(f._header, "thisWeek");
        o.isThisWeek && Jx.addClass(f._header, "thisWeek");
        var l = o.getDate()
          , a = new Date(o.getFullYear(),o.getMonth(),l)
          , w = this._getHeaderFormatter(o)
          , p = -1;
        for (o.isThisWeek && (p = this._today.getDate()),
        s = 0; s < 7; s++)
            c = f._headerDays[s],
            l === p ? (Jx.addClass(c, "today"),
            c._isToday = true,
            this._showTimeIndicator(f._grid.children[s + 1])) : c._isToday && (Jx.removeClass(c, "today"),
            c._isToday = false),
            c.innerHTML = w.format(a),
            c.setAttribute("aria-label", h.format(a)),
            a.setDate(l + 1),
            l = a.getDate();
        for (s = 0; s < 7; s++)
            v = f._allDayEvents[s],
            v.innerHTML = "",
            v.style.opacity = 0,
            y = f._gridEvents[s],
            y.innerHTML = "",
            y.style.opacity = 0;
        i("_recycler:scrollGrid");
        f._grid.style.msOverflowStyle = "none";
        f._grid.scrollTop = this._isTall ? t._fourAmOffset : t._nineAmOffset;
        f._grid.style.msOverflowStyle = "-ms-autohiding-scrollbar";
        r("_recycler:scrollGrid");
        this._getEvents(o, f);
        r("_recycler")
    }
    ;
    n._createEvent = function(n, t, i, r, u) {
        n.stopPropagation();
        n.ctrlKey ? this._quickEvent && this._quickEvent.isOpen() ? this._quickEvent && this._quickEvent.onDismiss() : this.fire("createEvent", {
            startDate: i,
            allDayEvent: r
        }) : (this._quickEvent || (this._quickEvent = new Calendar.Controls.QuickEvent(Calendar.Views.Manager.Views.week),
        this.appendChild(this._quickEvent)),
        this._quickEvent.activateUI(t, i, r, null, u))
    }
})
