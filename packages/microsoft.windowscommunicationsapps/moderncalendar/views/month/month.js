Jx.delayDefine(Calendar.Views, "Month", function() {
    function o(n) {
        Jx.mark("Calendar:Month." + n + ",Info,Calendar")
    }
    function t(n) {
        Jx.mark("Calendar:Month." + n + ",StartTA,Calendar")
    }
    function i(n) {
        Jx.mark("Calendar:Month." + n + ",StopTA,Calendar")
    }
    var r = Calendar.Helpers, u = WinJS.UI.Animation, f = Calendar.Controls.DatePickerAnchor, s = new Jx.DTFormatter("month year"), h = new Jx.DTFormatter("longDate"), n = Calendar.Views.Month = function() {
        t("ctor");
        this.initComponent();
        this._id = "calMonth";
        this._recycler = this._recycler.bind(this);
        this._renderer = this._renderer.bind(this);
        this._onClick = this._onClick.bind(this);
        this._onGridResize = this._onGridResize.bind(this);
        this._onKeyDownNav = this._onKeyDownNav.bind(this);
        this._onPointerDown = this._onPointerDown.bind(this);
        this._first = Calendar.FIRST_DAY;
        this._last = Calendar.LAST_DAY;
        this._updateToday(Calendar.getToday());
        this._focusedDate = this._today.getDate();
        this._focusedIndex = 0;
        this._workerIds = {};
        this._loadAnimation = u.enterPage;
        r.ensureFormats();
        i("ctor")
    }
    , e;
    n.prototype.setFocusedDay = function(t) {
        t = new Date(t.getFullYear(),t.getMonth(),t.getDate());
        t < this._first ? (o("Day for " + n.NAME + " is out of bounds (" + t + " < " + this._first + ")."),
        t = this._first) : t > this._last && (o("Day for " + n.NAME + " is out of bounds (" + t + " > " + this._last + ")."),
        t = this._last);
        this._focusedDate = t.getDate();
        this._focusedIndex = r.getMonthsBetween(this._today, t);
        this._timeline && this._timeline.setFocusedIndex(this._focusedIndex)
    }
    ;
    n.prototype.getFocusedDay = function() {
        if (this._focusedDate) {
            var n = new Date(this._today.getFullYear(),this._today.getMonth() + this._focusedIndex)
              , t = n.getMonth();
            return n.setDate(this._focusedDate),
            n.getMonth() !== t && n.setDate(0),
            n
        }
        return this._focusedIndex === 0 ? this._today : new Date(this._today.getFullYear(),this._today.getMonth() + this._focusedIndex,1)
    }
    ;
    n.prototype.focusEvent = function(n) {
        this.setFocusedDay(n.startDate)
    }
    ;
    n.prototype.containsDate = function(n) {
        var t = new Date(this._today.getFullYear(),this._today.getMonth() + this._focusedIndex)
          , i = new Date(t.getFullYear(),t.getMonth() + 1);
        return n >= t && n < i
    }
    ;
    n.prototype.setLoadAnimation = function(n) {
        this._loadAnimation = n
    }
    ;
    n.prototype.showDatePicker = function() {
        this._showDatePicker()
    }
    ;
    n.NAME = "Calendar.Views.Month";
    e = Calendar.Loc;
    n.OVERFLOW_EVENTS = e.getFormatFunction("OverflowEvents");
    n.ACC_DAY = e.getFormatFunction("AccMonthDay");
    n.ACC_OVERFLOW = e.getFormatFunction("AccMonthOverflow");
    Jx.augment(n, Jx.Component);
    n.prototype.getUI = function(n) {
        n.html = "<div id='" + this._id + "' class='monthview'><div class='dp-anchor'><\/div><\/div>"
    }
    ;
    n.prototype.activateUI = function(n) {
        var u, f, r;
        t("activateUI");
        this._jobset = n;
        this._host = document.getElementById(this._id);
        this._dpAnchor = this._host.querySelector(".dp-anchor");
        this._getWorker();
        this._updateToday(Calendar.getToday());
        Calendar.addListener("dayChanged", this._onDayChanged, this);
        u = {};
        this.fire("getSettings", u);
        f = {
            hookWheel: true
        };
        r = this._timeline = new Calendar.Controls.Timeline(this._host,this._jobset,this,this._renderer,this._recycler,f);
        r.setAlwaysShowArrows(u.settings.get("alwaysShowArrows"));
        this.on("showArrows", this._onShowArrows);
        this.on("dateSelected", this._onDatePickerDateSelected);
        this.on("setScrollable", this._onSetScrollable);
        r.addListener("focusChanged", this._onFocusChanged, this);
        r.addListener("itemRealized", this.onItemRealized, this);
        r.addListener("itemRemoved", this.onItemRemoved, this);
        r.initialize(this._focusedIndex);
        this.on("resizeWindow", this._onResizeWindow);
        this._host.addEventListener("keydown", this._onKeyDownNav, false);
        this._host.addEventListener("MSPointerDown", this._onPointerDown, false);
        this._host.addEventListener("click", this._onClick, false);
        var o = this._host.querySelector(".header")
          , s = this._host.querySelector(".dayHeaders")
          , h = this._host.querySelector(".grid")
          , e = function() {
            this.fire("viewReady")
        }
        .bind(this);
        this._loadAnimation([o, [s, h]]).done(e, e);
        i("activateUI")
    }
    ;
    n.prototype.deactivateUI = function() {
        t("deactivateUI");
        this._quickEvent && (this._quickEvent.deactivateUI(),
        this._quickEvent = null);
        this._datePicker && (this.removeChild(this._datePicker),
        this._datePicker.shutdownUI(),
        this._datePicker = null);
        this._dpAnchor = null;
        this._timeline && (this._timeline.shutdown(),
        this._timeline.removeListener("itemRemoved", this.onItemRemoved, this),
        this._timeline.removeListener("itemRealized", this.onItemRealized, this),
        this._timeline.removeListener("focusChanged", this._onFocusChanged, this),
        this._timeline = null);
        this.detach("showArrows", this._onShowArrows);
        this.detach("dateSelected", this._onDatePickerDateSelected);
        this.detach("setScrollable", this._onSetScrollable);
        this._host.removeEventListener("keydown", this._onKeyDownNav, false);
        this._host.removeEventListener("MSPointerDown", this._onPointerDown, false);
        this._host.removeEventListener("click", this._onClick, false);
        this._host = null;
        this._worker.removeListener("Month/getEvents", this._onGetEvents, this);
        this._worker.removeListener("Month/eventChanged", this._onEventChanged, this);
        this._worker.removeListener("Month/eventsChanged", this._onEventsChanged, this);
        this._worker = null;
        Calendar.removeListener("dayChanged", this._onDayChanged, this);
        this.detach("resizeWindow", this._onResizeWindow);
        i("deactivateUI")
    }
    ;
    n.prototype._onSetScrollable = function(n) {
        this._timeline && this._timeline.setScrollable(n.data)
    }
    ;
    n.prototype.left = function() {
        return this._left
    }
    ;
    n.prototype.right = function() {
        return this._right
    }
    ;
    n.prototype.getItem = function(r) {
        if (t("getItem"),
        r < -this._left)
            throw new Error("Index for " + n.NAME + " is out of bounds (" + String(r) + " < " + String(-this._left) + ").");
        if (r > this._right)
            throw new Error("Index for " + n.NAME + " is out of bounds (" + String(r) + " > " + String(this._right) + ").");
        var u = new Date(this._today.getFullYear(),this._today.getMonth() + r)
          , f = this._getFirstDayOffset(u.getFullYear(), u.getMonth())
          , e = new Date(u.getFullYear(),u.getMonth() + 1,0).getDate()
          , o = Math.ceil((e + f) / 7)
          , s = o < 6 ? 40 : 30
          , h = {
            date: u,
            firstDayOffset: f,
            numDays: e,
            numWeeks: o,
            targetEventHeight: s
        };
        return i("getItem"),
        h
    }
    ;
    n.prototype.onItemRealized = function(n) {
        t("onItemRealized");
        var u = n.item
          , r = n.el;
        r.jobset = n.jobset;
        r._events = r.querySelector(".events");
        r._header = r.querySelector(".header");
        r._grid = r.querySelector(".grid");
        r._days = r.querySelector(".days").childNodes;
        r._days._today = null;
        this._gridHeight || (t("onItemRealized:gridHeight"),
        this._gridHeight = r._grid.offsetHeight,
        i("onItemRealized:gridHeight"));
        u.gridHeight = this._gridHeight;
        u.dayHeight = Math.floor(this._gridHeight / u.numWeeks - 3);
        this._getEvents(u, r);
        r._onResize = this._refreshUI.bind(this, u, r);
        r.jobset.addUIJob(this, this._updateRecycled, [u, r], People.Priority.realizeItem);
        i("onItemRealized")
    }
    ;
    n.prototype.onItemRemoved = function(n) {
        t("onItemRemoved");
        var u = n.item
          , r = n.el;
        this._worker.postCommand("Month/cancel", null, u.workerId);
        delete this._workerIds[u.workerId];
        r._eventAnimation && (r._eventAnimation.cancel(),
        r._eventAnimation = null);
        r._events.style.opacity = 0;
        r.removeEventListener("keydown", r._onKeyDown, false);
        i("onItemRemoved")
    }
    ;
    n.prototype._onShowArrows = function(n) {
        n.handled || (this._timeline.setAlwaysShowArrows(n.data.value),
        n.handled = true)
    }
    ;
    n.prototype._onDatePickerDateSelected = function(n) {
        n.handled || (n.handled = true,
        this.setFocusedDay(n.data))
    }
    ;
    n.prototype._onDayChanged = function(n) {
        var i = this._today, t = this._datePicker, u;
        this._updateToday(n);
        t && (t.hide(),
        t.setToday(n));
        this._focusedIndex ? (u = r.getMonthsBetween(i, n),
        this._focusedIndex -= u) : i.getDate() === this._focusedDate && (this._focusedDate = n.getDate());
        this._timeline.initialize(this._focusedIndex)
    }
    ;
    n.prototype._updateToday = function(n) {
        this._today && r.isSameDate(n, this._today) || (this._today = n,
        this._left = r.getMonthsBetween(this._first, n),
        this._right = r.getMonthsBetween(n, this._last))
    }
    ;
    n.prototype._renderer = function(n) {
        t("_renderer");
        var r = '<div class="month recycling"><div class="container"><div class="header"><div class="dateAnchor"><div class="anchorText" role="heading" tabindex="0">' + Jx.escapeHtml(this._getHeaderText(n)) + '<\/div><div class="dateChevron" aria-hidden="true">&#xE09D;<\/div><\/div><\/div><div class="dayHeaders">' + this._getDayHeadersHtml() + '<\/div><div class="grid"><div class="events" role="list"><\/div><div class="days" role="list">' + this._getDaysHtml() + "<\/div><\/div><\/div><\/div>";
        return i("_renderer"),
        r
    }
    ;
    n.prototype._recycler = function(n, r) {
        t("_recycler");
        var e = r.item
          , u = r.el;
        f.applyHeaderText(u._header, this._getHeaderText(e));
        f.deactivateHeader(u._header);
        u.classList.add("recycling");
        e.gridHeight = this._gridHeight;
        e.dayHeight = Math.floor(this._gridHeight / e.numWeeks - 3);
        u.jobset = r.jobset;
        this._getEvents(e, u);
        u._onResize = this._refreshUI.bind(this, e, u);
        u.jobset.addUIJob(this, this._updateRecycled, [e, u], People.Priority.realizeItem);
        i("_recycler")
    }
    ;
    n.prototype._updateRecycled = function(n, r) {
        t("_updateRecycled");
        this._configureGrid(n, r);
        r.classList.remove("recycling");
        r._onEventsClicked = this._onEventsClicked.bind(this, n, r);
        r._onKeyDown = this._onKeyDown.bind(this, n, r);
        r._handleKeyboardAndAcc = this._handleKeyboardAndAcc.bind(this, n);
        r.addEventListener("keydown", r._onKeyDown, false);
        i("_updateRecycled")
    }
    ;
    n.prototype._getDayAccLabel = function(n) {
        return h.format(n)
    }
    ;
    n.prototype._configureGrid = function(n, r) {
        t("_configureGrid");
        var u = 0
          , c = n.date
          , f = null
          , o = r._days
          , l = n.firstDayOffset
          , e = new Date(n.date);
        o._today && (o._today.className = "day thisMonth",
        o._today = null);
        var a = new Date(c.getFullYear(),c.getMonth(),0).getDate()
          , h = a - 22
          , s = h - l;
        for (e.setDate(0),
        e.setDate(23 + s),
        u = 0; u < 9; u++)
            f = o[u],
            u >= s && u < h ? (f.classList.remove("hidden"),
            f.setAttribute("aria-label", this._getDayAccLabel(e)),
            e.setDate(e.getDate() + 1)) : (f.classList.add("hidden"),
            f.removeAttribute("aria-label"));
        for (e = new Date(n.date),
        u = 9; u < 36; u++)
            f = o[u],
            f.setAttribute("aria-label", this._getDayAccLabel(e)),
            e.setDate(e.getDate() + 1);
        for (s = 36,
        h = s + n.numDays - 27,
        u = 36; u < 40; u++)
            f = o[u],
            u >= s && u < h ? (f.classList.remove("hidden"),
            f.setAttribute("aria-label", this._getDayAccLabel(e)),
            e.setDate(e.getDate() + 1)) : (f.classList.add("hidden"),
            f.removeAttribute("aria-label"));
        for (s = 40,
        h = s + (n.numWeeks * 7 - l - n.numDays),
        u = 40; u < o.length; u++)
            f = o[u],
            u >= s && u < h ? (f.classList.remove("hidden"),
            f.setAttribute("aria-label", this._getDayAccLabel(e)),
            e.setDate(e.getDate() + 1)) : (f.classList.add("hidden"),
            f.removeAttribute("aria-label"));
        c.getMonth() === this._today.getMonth() && c.getFullYear() === this._today.getFullYear() ? (f = o[8 + this._today.getDate()],
        f.className = "day thisMonth today",
        o._today = f,
        Jx.addClass(r._header, "todayHeader")) : Jx.removeClass(r._header, "todayHeader");
        i("_configureGrid")
    }
    ;
    n.prototype._getDayHeadersHtml = function() {
        var n;
        if (t("_getDayHeadersHtml"),
        !this._dayHeadersHtml) {
            var u = ""
              , f = this._host.offsetWidth < 1024
              , e = f ? r.getShortDay : r.getDay;
            for (n = 0; n < 7; n++)
                u += "<div class='dayHeader'><div class='dayText'>" + Jx.escapeHtml(e((n + r.firstDayOfWeek) % 7)) + "<\/div><\/div>";
            this._dayHeadersHtml = u
        }
        return i("_getDayHeadersHtml"),
        this._dayHeadersHtml
    }
    ;
    n.prototype._getDaysHtml = function() {
        t("_getDaysHtml");
        return i("_getDaysHtml"),
        "<div class='day lastMonth hidden' tabIndex='1' role='button'><div class='date'>23<\/div><\/div><div class='day lastMonth hidden' tabIndex='1' role='button'><div class='date'>24<\/div><\/div><div class='day lastMonth hidden' tabIndex='1' role='button'><div class='date'>25<\/div><\/div><div class='day lastMonth hidden' tabIndex='1' role='button'><div class='date'>26<\/div><\/div><div class='day lastMonth hidden' tabIndex='1' role='button'><div class='date'>27<\/div><\/div><div class='day lastMonth hidden' tabIndex='1' role='button'><div class='date'>28<\/div><\/div><div class='day lastMonth hidden' tabIndex='1' role='button'><div class='date'>29<\/div><\/div><div class='day lastMonth hidden' tabIndex='1' role='button'><div class='date'>30<\/div><\/div><div class='day lastMonth hidden' tabIndex='1' role='button'><div class='date'>31<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>1<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>2<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>3<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>4<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>5<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>6<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>7<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>8<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>9<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>10<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>11<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>12<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>13<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>14<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>15<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>16<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>17<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>18<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>19<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>20<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>21<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>22<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>23<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>24<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>25<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>26<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>27<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>28<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>29<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>30<\/div><\/div><div class='day thisMonth' tabIndex='1' role='button'><div class='date'>31<\/div><\/div><div class='day nextMonth' tabIndex='1' role='button'><div class='date'>1<\/div><\/div><div class='day nextMonth' tabIndex='1' role='button'><div class='date'>2<\/div><\/div><div class='day nextMonth' tabIndex='1' role='button'><div class='date'>3<\/div><\/div><div class='day nextMonth' tabIndex='1' role='button'><div class='date'>4<\/div><\/div><div class='day nextMonth hidden' tabIndex='1' role='button'><div class='date'>5<\/div><\/div><div class='day nextMonth hidden' tabIndex='1' role='button'><div class='date'>6<\/div><\/div><div class='day nextMonth hidden' tabIndex='1' role='button'><div class='date'>7<\/div><\/div>"
    }
    ;
    n.prototype._getHeaderText = function(n) {
        var t = n.date;
        return s.format(t)
    }
    ;
    n.prototype._getGridRange = function(n) {
        var t = n.getMonth()
          , i = n.getFullYear()
          , s = new Date(i,t)
          , u = s.getDay() - r.firstDayOfWeek
          , e = u >= 0 ? u : u + 7
          , h = new Date(i,t,1 - e)
          , c = new Date(i,t + 1)
          , f = r.firstDayOfWeek - c.getDay()
          , o = f >= 0 ? f : f + 7
          , l = new Date(i,t + 1,1 + o);
        return {
            start: h,
            end: l,
            startOffset: e,
            endOffset: o
        }
    }
    ;
    n.prototype._getWorker = function() {
        var n = {};
        this.fire("getPlatformWorker", n);
        this._worker = n.platformWorker;
        this._worker.addListener("Month/getEvents", this._onGetEvents, this);
        this._worker.addListener("Month/eventChanged", this._onEventChanged, this);
        this._worker.addListener("Month/eventsChanged", this._onEventsChanged, this)
    }
    ;
    n.prototype._onGetEvents = function(n) {
        var r = this._workerIds[n.id];
        r && (t("_onGetEvents"),
        r.jobset.addUIJob(this, function() {
            t("_onGetEvents:inner");
            r._events.innerHTML = n.html;
            r._eventAnimation = WinJS.UI.executeAnimation(r._events, {
                property: "opacity",
                delay: 0,
                duration: 250,
                timing: "linear",
                keyframe: "fadeInHack"
            });
            r._eventAnimation.done();
            r._events.style.opacity = 1;
            i("_onGetEvents:inner")
        }, null, People.Priority.userTileRender),
        i("_onGetEvents"))
    }
    ;
    n.prototype._onEventsChanged = function(n) {
        var r = this._workerIds[n.id];
        r && r.jobset.addUIJob(this, function() {
            t("_onEventsChanged");
            var u = r._events;
            r._events = u.cloneNode(false);
            r._events.innerHTML = n.html;
            r._events.style.opacity = "0";
            r._grid.appendChild(r._events);
            setImmediate(function() {
                WinJS.UI.executeTransition(r._events, {
                    property: "opacity",
                    delay: 0,
                    duration: 250,
                    timing: "linear",
                    to: 1
                }).done(function() {
                    r._events.style.transition = ""
                });
                WinJS.UI.executeTransition(u, {
                    property: "opacity",
                    delay: 200,
                    duration: 250,
                    timing: "linear",
                    to: 0
                }).done(function() {
                    r.parentNode && (u.outerHTML = "")
                })
            });
            i("_onEventsChanged")
        }, null, People.Priority.slowData)
    }
    ;
    n.prototype._getEvents = function(n, r) {
        t("_getEvents");
        var u = this._getGridRange(n.date)
          , f = n.gridStart = u.start
          , e = n.gridEnd = u.end;
        n.gridStartOffset = u.startOffset;
        n.gridEndOffset = u.endOffset;
        n.eventsPerDay = this._getEventsPerDay(n);
        n.eventHeight = this._getEventHeight(n);
        n.eventTopMargin = this._getEventTopMargin(n);
        n.workerId = this._worker.postCommand("Month/getEvents", {
            item: n,
            start: f.getTime(),
            end: e.getTime(),
            isVisible: r.jobset.isVisible
        });
        this._workerIds[n.workerId] = r;
        i("_getEvents")
    }
    ;
    n.prototype._getEventHeight = function(n) {
        return parseInt((n.dayHeight - 42) / n.eventsPerDay, 10)
    }
    ;
    n.prototype._getEventsPerDay = function(n) {
        var t = Math.floor((n.dayHeight - 37) / n.targetEventHeight);
        return t < 0 ? 0 : t
    }
    ;
    n.prototype._getEventTopMargin = function(n) {
        return ((n.eventHeight - 22) / 2).toFixed(0)
    }
    ;
    n.prototype._getFirstDayOffset = function(n, t) {
        var u = new Date(n,t,1).getDay()
          , i = u - r.firstDayOfWeek;
        return i < 0 && (i = i + 7),
        i
    }
    ;
    n.prototype._refreshDayHeaders = function(n) {
        var u, r;
        t("_refreshDayHeaders");
        u = n._isPortrait;
        n._isPortrait = this._host.offsetWidth < 1024;
        n._isPortrait !== u && (r = n.querySelector(".dayHeaders"),
        r && (r.innerHTML = this._getDayHeadersHtml()));
        i("_refreshDayHeaders")
    }
    ;
    n.prototype._refreshUI = function(n, r) {
        t("_refreshUI");
        n.gridHeight = this._gridHeight;
        n.dayHeight = Math.floor(this._gridHeight / n.numWeeks - 3);
        this._getEvents(n, r);
        this._refreshDayHeaders(r);
        i("_refreshUI")
    }
    ;
    n._properties = {
        busyStatus: "update",
        color: "update",
        location: "update",
        subject: "update"
    };
    n.prototype._onEventChanged = function(r) {
        var e, u, f, h, o, s;
        for (t("_onEventChanged"),
        e = r.properties,
        u = [],
        f = 0,
        h = e.length; f < h; f++)
            o = e[f],
            n._properties[o] === "update" && u.push(o);
        u.length && (s = this._workerIds[r.id],
        s && this._updateEventUi(s, r.ev, u));
        i("_onEventChanged")
    }
    ;
    n.prototype._onDateSelected = function(n, t, i, r) {
        var e = parseInt(i.lastChild.nodeValue, 10), u = n.date.getMonth(), f;
        Jx.hasClass(t, "lastMonth") ? u -= 1 : Jx.hasClass(t, "nextMonth") && (u += 1);
        f = new Date(n.date.getFullYear(),u,e,9);
        r ? this._startQuickEvent(t, f) : this._quickEvent && this._quickEvent.isOpen() ? this._quickEvent.onDismiss() : this.fire("createEvent", {
            startDate: f,
            allDayEvent: true
        })
    }
    ;
    n.prototype._onOverflowSelected = function(n, t) {
        var i = new Date(n.date.getFullYear(),n.date.getMonth(),n.date.getDate() + parseInt(t.id, 10));
        this._focusedIndex = r.getMonthsBetween(this._today, i);
        this._focusedDate = i.getDate();
        this.fire("dayChosen", i)
    }
    ;
    n.prototype._onClick = function(n) {
        var i, t, r;
        this._gotPointerDown ? this._pressed && (this._host.removeEventListener("MSPointerCancel", this._onClick, false),
        i = this._timeline.getRealized(),
        t = i[0].el,
        t.classList.contains("recycling") || (r = t._onEventsClicked(n),
        r && (n.preventDefault(),
        n.stopPropagation())),
        this._pressed.removeAttribute("data-state"),
        this._pressed = null) : (i = this._timeline.getRealized(),
        t = i[0].el,
        t.classList.contains("recycling") || t._handleKeyboardAndAcc(n));
        this._gotPointerDown = false
    }
    ;
    n.prototype._onEventsClicked = function(n, t, i) {
        var o = false, f, c;
        if (this._pressed && (this._pressed.animatedDown && u.pointerUp(this._pressed),
        i.type === "click")) {
            if (this._quickEvent && this._quickEvent.isOpen())
                return this._quickEvent.onDismiss(),
                true;
            for (f = i.target; f !== i.currentTarget; f = f.parentElement) {
                if (Jx.hasClass(f, "event") && f === this._pressed) {
                    r.editEvent(this, f.id, f);
                    o = true;
                    break
                }
                if ((Jx.hasClass(f, "overflow") || Jx.hasClass(f, "overflowToday")) && f === this._pressed) {
                    this._onOverflowSelected(n, f);
                    o = true;
                    break
                }
                if (Jx.hasClass(f, "activeAnchor")) {
                    f === this._pressed && (this._onDateAnchorClicked(f, i),
                    o = true);
                    break
                }
            }
            if (!o) {
                c = t._events.style.display;
                t._events.style.display = "none";
                var l = i.pageX
                  , a = i.pageY
                  , e = document.elementFromPoint(l, a)
                  , s = null
                  , h = null;
                e && !Jx.hasClass(e, "days") && (Jx.hasClass(e, "date") ? (s = e,
                h = s.parentElement) : (s = e.querySelector(".date"),
                h = e),
                s && e && this._pressed === h && (this._onDateSelected(n, h, s, !i.ctrlKey),
                o = true));
                t._events.style.display = c
            }
        }
        return o
    }
    ;
    n.prototype._onDateAnchorClicked = function() {
        this._showDatePicker()
    }
    ;
    n.prototype._showDatePicker = function() {
        var n, u, r;
        t("_showDatePicker");
        n = this._datePicker;
        u = Calendar.getToday();
        n || (t("_showDatePicker:!datePicker"),
        r = Calendar.Controls.DatePicker,
        n = this._datePicker = new r(r.PickMode.yearGrid),
        n.setIdSuffix(""),
        n.addCustomClass("monthviewPicker"),
        n.showFreeBusy = false,
        n.setToday(u),
        n.setFocusDate(u),
        n.clientView = r.ClientView.month,
        this.appendChild(n),
        n.activateUI(this._jobset),
        i("_showDatePicker:!datePicker"));
        n.getActive() || (this._configureDatePicker(),
        n.show(this._dpAnchor, "bottom", Jx.isRtl() ? "right" : "left"));
        i("_showDatePicker")
    }
    ;
    n.prototype._configureDatePicker = function() {
        var e;
        t("_configureDatePicker");
        var n = this._datePicker, u = [], o = Calendar.getToday(), r, f;
        n.setToday(o);
        e = this._timeline.getRealized();
        r = this.getItem(e[0].index).date;
        u.push(r);
        n.setHighlightDates(u);
        f = new Date(r.getFullYear(),0,1);
        n.setFocusDate(f);
        i("_configureDatePicker")
    }
    ;
    n.prototype._handleKeyboardAndAcc = function(n, t) {
        var i, u;
        t.preventDefault();
        i = t.target;
        Jx.hasClass(i, "event") ? r.editEvent(this, i.id, i) : i.parentElement && Jx.hasClass(i.parentElement, "days") ? (u = i.querySelector(".date"),
        u && (this._onDateSelected(n, i, u, !t.ctrlKey),
        t.stopPropagation())) : Jx.hasClass(i, "overflow") || Jx.hasClass(i, "overflowToday") ? this._onOverflowSelected(n, i) : f.isActiveDateAnchor(i) && this._showDatePicker()
    }
    ;
    n.prototype._onKeyDown = function(n, t, i) {
        var r = i.keyCode;
        (r === Jx.KeyCode.enter || r === Jx.KeyCode.space) && t._handleKeyboardAndAcc(i)
    }
    ;
    n.prototype._onKeyDownNav = function(n) {
        var t = n.keyCode;
        Jx.KeyCode.leftarrow <= t && t <= Jx.KeyCode.downarrow ? this._onArrowKey(n) : t === Jx.KeyCode.tab && this._onTabKey(n)
    }
    ;
    n.prototype._onArrowKey = function(n) {
        var s, e, o, t, r, i, f, u;
        if (n.preventDefault(),
        s = this._timeline.getRealized(),
        e = s[0].el,
        !e.classList.contains("recycling")) {
            for (o = e.querySelector("[tabIndex]"),
            t = Array.prototype.slice.call(e.querySelectorAll(".days [tabIndex]:not(.hidden)")),
            r = this._host.querySelector(":focus"); r && !r.hasAttribute("tabIndex"); )
                r = r.parentElement;
            if (i = t.indexOf(r),
            f = o === r,
            i < 0 && !f) {
                t[0].focus();
                return
            }
            u = f ? o : t[i];
            switch (n.keyCode) {
            case Jx.KeyCode.leftarrow:
                i > 0 && !f && (u = t[i - 1]);
                break;
            case Jx.KeyCode.uparrow:
                u = i >= 7 ? t[i - 7] : o;
                break;
            case Jx.KeyCode.rightarrow:
                !f && i < t.length - 1 && (u = t[i + 1]);
                break;
            case Jx.KeyCode.downarrow:
                f ? u = t[0] : i < t.length - 7 && (u = t[i + 7])
            }
            u.focus()
        }
    }
    ;
    n.prototype._onTabKey = function(n) {
        var o, u, e, t, i, s, r, f;
        if ((n.preventDefault(),
        o = this._timeline.getRealized(),
        u = o[0].el,
        !u.classList.contains("recycling")) && (e = u.querySelector("[tabIndex]"),
        t = Array.prototype.slice.call(u.querySelectorAll(".events [tabIndex]")),
        t.length)) {
            for (i = this._host.querySelector(":focus"); i && !i.hasAttribute("tabIndex"); )
                i = i.parentElement;
            if (s = e === i,
            r = t.indexOf(i),
            r < 0) {
                (!n.shiftKey || s) && n.shiftKey || t[0].focus();
                return
            }
            f = t[r];
            n.shiftKey ? f = r > 0 ? t[r - 1] : e : r < t.length - 1 && (f = t[r + 1]);
            f.focus()
        }
    }
    ;
    n.prototype._getHoveredItem = function(n) {
        var e = null, t, i, u, f, o;
        if (this._hasUI) {
            for (i = n.target; i !== n.currentTarget; i = i.parentElement)
                if (t = i.classList,
                t.contains("event") || t.contains("overflow") || t.contains("overflowToday") || t.contains("activeAnchor"))
                    return i;
            u = this._timeline.getRealized();
            u = u[0].el;
            f = u.querySelector(".events");
            o = f.style.display;
            f.style.display = "none";
            var s = n.pageX
              , h = n.pageY
              , r = document.elementFromPoint(s, h);
            !r || r.querySelector(".grid") || Jx.hasClass(r, "days") || (t = r.classList,
            t.contains("date") ? e = r.parentElement : (t.contains("thisMonth") || t.contains("lastMonth") || t.contains("nextMonth") || t.contains("today")) && (e = r));
            f.style.display = o
        }
        return e
    }
    ;
    n.prototype._onPointerDown = function(n) {
        if (!this._pressed && n.button === 0) {
            var t = this._getHoveredItem(n);
            t && (!Jx.hasClass(t, "event") || this._quickEvent && this._quickEvent.isOpen() || (u.pointerDown(t),
            t.animatedDown = true),
            this._pressed = t,
            this._quickEvent && this._quickEvent.isOpen() ? n.preventDefault() : this._pressed.setAttribute("data-state", "pressed"),
            this._host.addEventListener("MSPointerCancel", this._onClick, false))
        }
        this._gotPointerDown = true
    }
    ;
    n.prototype._onResizeWindow = function() {
        t("_onResizeWindow");
        requestAnimationFrame(this._onGridResize);
        i("_onResizeWindow")
    }
    ;
    n.prototype._onGridResize = function() {
        var o, f, r, n, u, s, e;
        if (this._host) {
            if (t("_onGridResize"),
            o = this._gridHeight,
            f = document.querySelector(".monthview .grid"),
            f && (t("_onGridResize:gridHeight"),
            this._gridHeight = f.offsetHeight,
            i("_onGridResize:gridHeight")),
            this._timeline)
                if (r = this._timeline.getRealized(true),
                this._dayHeadersHtml = null,
                this._gridHeight !== o) {
                    for (s in this._workerIds)
                        this._worker.postCommand("Month/cancel", null, s);
                    for (n = 0,
                    u = r.length; n < u; n++)
                        e = r[n].el,
                        e._events.innerHTML = "",
                        e._onResize()
                } else
                    for (n = 0,
                    u = r.length; n < u; n++)
                        this._refreshDayHeaders(r[n].el);
            else
                Jx.fault("Calendar.MonthView", "NullTimeline");
            i("_onGridResize")
        }
    }
    ;
    n.prototype._onFocusChanged = function(n) {
        var r, u, e;
        t("_onFocusChanged");
        r = n.index;
        this._focusedIndex !== r && (this._focusedIndex = r,
        this._focusedDate = 0);
        u = n.el.querySelectorAll(".thisMonth");
        e = r === 0 ? u[this._today.getDate() - 1] : u[0];
        Jx.safeSetActive(e);
        f.updateDatePickerButton(this._timeline, n);
        i("_onFocusChanged")
    }
    ;
    n._updateBusyStatus = function(n, t) {
        var i = n.querySelector(".glyph");
        u.fadeOut(i).done(function() {
            n.setAttribute("data-status", r.busyStatusClasses[t.busyStatus]);
            u.fadeIn(i).done()
        })
    }
    ;
    n._updateColor = function(n, t) {
        var i = r.processEventColor(t.color);
        n.style.color = i;
        n.querySelector(".glyph").style["background-color"] = i
    }
    ;
    n._updateProperty = function(n, t, i) {
        var r = n.querySelector("." + i);
        r && u.fadeOut(r).done(function() {
            r.innerText = t[i];
            u.fadeIn(r).done()
        })
    }
    ;
    n._updateFns = {
        busyStatus: n._updateBusyStatus,
        color: n._updateColor,
        location: n._updateProperty,
        subject: n._updateProperty
    };
    n.prototype._updateEventUi = function(r, u, f) {
        var s, l, e, a, o, v, h, c;
        for (t("_updateEventUi"),
        s = r.querySelectorAll("[id='" + u.handle + "']"),
        l = s.length,
        e = 0; e < l; e++)
            for (a = s[e],
            o = 0,
            v = f.length; o < v; o++)
                h = f[o],
                c = n._updateFns[h],
                c && c(a, u, h);
        i("_updateEventUi")
    }
    ;
    n.prototype._startQuickEvent = function(n, t) {
        var i, r, u;
        this._quickEvent || (this._quickEvent = new Calendar.Controls.QuickEvent(Calendar.Views.Manager.Views.month,true),
        this.appendChild(this._quickEvent));
        i = this.getItem(this._focusedIndex);
        i.gridHeight = this._gridHeight;
        i.dayHeight = Math.floor(this._gridHeight / i.numWeeks - 3);
        i.eventsPerDay = this._getEventsPerDay(i);
        r = this._getEventHeight(i);
        u = ((i.eventsPerDay - 1) * r).toFixed(2);
        this._quickEvent.activateUI(n, t, true, {
            height: r,
            bottom: u
        }, n)
    }
})
