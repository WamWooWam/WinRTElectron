
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\common\Common.js" />
/// <reference path="..\timeline\timeline.js" />
/// <reference path="..\grid\MonthGrid.js" />
/// <reference path="..\grid\YearGrid.js" />

/*global Calendar,Jx,document,WinJS,Debug,Microsoft*/

Jx.delayDefine(Calendar.Controls, "DatePicker", function () {

    function _start(evt) { Jx.mark("Calendar:DatePicker." + evt + ",StartTA,Calendar"); }
    function _stop(evt)  { Jx.mark("Calendar:DatePicker." + evt + ",StopTA,Calendar"); }
    function _info(evt)  { Jx.mark("Calendar:DatePicker." + evt + ",Info,Calendar"); }

    var Helpers   = Calendar.Helpers,
        Templates = {},
        loc = Calendar.Loc;

    var DatePicker = Calendar.Controls.DatePicker = function(pickMode) {
        _start("ctor");

        // call the jx component initialization code
        this.initComponent();

        this._pager          = null;  // for calculating how much time is governed on a page
        this._index          = 0;
        this._idSuffix       = null;
        this._pendingFocus   = null;
        this._highlightDates = [];
        this._datesWereSet   = false;
        this._dateSelected   = false;
        this._isVisible      = false;  // whether visible, as determined by flyout event life cycle
        this._isReady        = false;  // whether timeline has gotten a chance to initialize yet
        this._isActive       = false;  // whether currently responding to a show call (prevent multiple shows)
        this._focusDate      = new Date();  // the date we should focus
        this._addClasses     = [];

        // bind callbacks
        this._renderer    = this._renderer.bind(this);
        this._recycler    = this._recycler.bind(this);
        this._onKeyDown   = this._onKeyDown.bind(this);
        this._onClick     = this._onClick.bind(this);
        this._finishShow  = this._finishShow.bind(this);
        this._prepareHide = this._prepareHide.bind(this);
        this._finishHide  = this._finishHide.bind(this);

        // public fields
        this.pickMode        = pickMode || DatePicker.PickMode.monthGrid;
        this.showJumpTargets = true;
        this.showFreeBusy    = true;
        this.clientView      = DatePicker.ClientView.unknown;

        // make sure we have selected and configured a valid pager.  see the documentation for
        // _ensurePager for more about the date picker pager interface
        this._ensurePager();

        // calculations that depend on a pager
        this._updateToday(Calendar.getToday());
        this._focusDate = new Date(this._today);  // now that _today has been set, set _focusDate

        _stop("ctor");
    };

    Jx.augment(DatePicker, Jx.Component);

    var proto = DatePicker.prototype;

    // when this is changed, also update the mock version in TestHelpers.js
    DatePicker.PickMode = {
        monthGrid: 0,
        yearGrid: 1,
    };

    // when this is changed, also update the mock version in TestHelpers.js
    DatePicker.ClientView = {
        unknown: 0,
        day: 1,
        workWeek: 2,
        week: 3,
        month: 4,
        eventDetails: 5,
    };

    // DatePicker timeline interface impls and callbacks

    proto.getItem = function(index)
    {
        /// <summary>gets the date relative to a timeline index offset in units appropriate 
        ///     to the object.  in the initially supported mode (day picker/month grid), this 
        ///     will be in units of months.</summary>
        /// <param name="index" type="Number" integer="true">timeline offset index</param>
        /// <returns type="Date">date representing the requested timeline index</returns>
    
        return this._pager.getItem(this._today, index);
    };

    proto.left = function() {
        /// <summary>gets the lowest available timeline index</summary>
        /// <returns type="Number" integer="true">lowest available timeline index</returns>
        // _left is set in _updateToday
        return this._left;
    };

    proto.right = function() {
        /// <summary>gets the highest available timeline index</summary>
        /// <returns type="Number" integer="true">highest available timeline index</returns>
    
        // _right is set in _updateToday
        return this._right;
    };

    proto._renderer = function(item) {
        /// <summary>generates an HTML string representing a view of the date displayed by 
        ///     this view.  the default date picker control uses the month grid view</summary>
        /// <param name="item" type="Date">date for which to render a view.  we also dynamically attach a
        ///     grid instance to the date</param>
        /// <returns type="String">string containing HTML of the rendered view</returns>

        _start("_renderer");
    
        var day  = this._calculateFocusedDay(item),
            grid = null;

        if (this.pickMode === DatePicker.PickMode.monthGrid) {
            grid = new Calendar.Controls.MonthGrid();
            grid.splitSelectFocus = true;
        } else if (this.pickMode === DatePicker.PickMode.yearGrid) {
            grid = new Calendar.Controls.YearGrid();
            grid.splitSelectFocus = true;
        } else {
            Debug.fail("unsupported pickmode: " + this.pickMode);
        }

        Debug.assert(grid, "Failed to allocated grid for pickMode: " + this.pickMode);

        // configure the grid
        item._grid = grid;
        grid.setToday(this._today);
        grid.setFocusedDay(day);
        grid.showFreeBusy = this.showFreeBusy;
        grid.autoUpdate = false;
        grid.setHighlightDates(this._highlightDates);

        this.appendChild(item._grid);

        var html = Templates.grid({
            grid:   Jx.getUI(item._grid).html
        });

        _stop("_renderer");

        return html;
    };

    proto._recycler = function(old, data) {
        /// <summary>resets data for a previously realized view to be reused for a new date</summary>
        /// <param name="old" type="Date">date of the item being recycled.  often ignored</param>
        /// <param name="data" type="Object">contains data about the realized view to use for recycling.  it
        ///     contains the following fields:
        ///     index - index used to generate this item
        ///     item - Date object containing the value to update the view for
        ///     el - root of the DOMElement previously rendered by a _renderer call
        ///     jobset - jobset to use for this view.  generally a child of the main control jobset</param>

        _start("_recycler");

        var item = data.item,
            el     = data.el,
            jobset = data.jobset,
            day    = this._calculateFocusedDay(item);

        el._grid.setToday(Calendar.getToday());
        el._grid.setFocusedDay(day);
        el._grid.setHighlightDates(this._highlightDates);
        el._grid.resume(jobset);

        _stop("_recycler");
    };

    // Helpers

    proto._calculateFocusedDay = function(item) {
        /// <summary>calculates the day in the supplied date that should be focused</summary>
        /// <param name="item" type="Date"></param>
        /// <returns type="Date"></returns>

        _start("_calculateFocusedDay");

        var day = this._pager.mergeDates(item, this._focusDate);

        _stop("_calculateFocusedDay");

        return day;
    };

    proto._updateToday = function(today) {
        /// <summary>used when today's date (not the focused date, the actual date) changes.  we update
        ///     the extents of the left and right indices available</summary>
        /// <param name="today" type="Date">the date to use for today</param>

        _start("_updateToday");

        if (!this._today || !Helpers.isSameDate(today, this._today)) {
            this._today = today;

            // timeline data source values
            var oldLeft = this._left;
            this._left  = this._pager.getLeft(today);
            this._right = this._pager.getRight(today);

            if (this._timeline && oldLeft !== this._left) {
                // re-initialize the timeline
                this._timeline.initialize(this._index);
            }
        }

        _stop("_updateToday");
    };

    proto._updateHighlightedDays = function() {
        _start("_updateHighlightedDays");

        // if we have ui, we'll immediately update it
        if (this._host && this._datesWereSet) {
            this._datesWereSet = false;

            // update all our children
            for (var i = 0, len = this._children.length; i < len; ++i) {
                this._children[i].setHighlightDates(this._highlightDates);
            }
        }

        _stop("_updateHighlightedDays");
    };

    proto._getIdsCalendar = function () {
        if (!this._idsCalendar) {
            this._idsCalendar = Microsoft.WindowsLive.Instrumentation.Ids.Calendar;
        }

        return this._idsCalendar;
    };

    //
    // Templates
    //

    Templates.grid = function(data) {
        return '<div class="grid">' +
            data.grid +
        '</div>';
    };

    Templates.dphost = function(data) {
        var html =
        '<div class="dp-flyout '+ data.pickClass + '" style="position:absolute;visibility:hidden;" ' + 
            'aria-label="' + Jx.escapeHtml(loc.getString("DatePickerSelectDate")) + '">' + 
            '<div id="' + data.id + '" class="dp-host"></div>' +
            '<div id="dp-focusEater-' + data.id + '" class="dp-focusEater" aria-hidden="true" tabindex="0"></div>' +
        '</div>';

        return html;
    };

    // Public

    proto.setFocusedDay = function(day, force) {
        _start("setFocusedDay");

        var oldIndex = this._index;

        this._index = this._pager.getIndex(this._today, day);
        this._focusDate = new Date(day);

        // if we have ui, we'll immediately update it
        if (this._host) {
            // try update all our children
            for (var i = 0, len = this._children.length; i < len; ++i) {
                var child  = this._children[i],
                    oldDay = child.getFocusedDay(),
                    newDay = this._calculateFocusedDay(oldDay);
                child.setFocusedDay(newDay);
            }

            // if the day is in a different month, update the timeline
            if (this._index !== oldIndex || force === true) {
                this._timeline.setFocusedIndex(this._index);
            }
        }

        _stop("setFocusedDay");
    };

    proto.show = function(el, vertical, horizontal) {
        /// <summary>shows the date picker flyout</summary>
        /// <param name="el" type="DOMElement">element to which to attach the flyout</param>
        /// <param name="vertical" type="String">vertical alignment relative to el: "top" or "bottom"</param>
        /// <param name="horizontal" type="String">horizontal alignment relative to el: "left" or "right"</param>

        _start("show");

        if (this._isReady && !this._isActive) {
            // prevent further shows
            this._isActive = true;

            this._biciLaunched(this.clientView);

            // haven't selected a date yet
            this._dateSelected = false;

            // make sure the flyout is allocated
            this._ensureFlyout();

            // update displayed content in the datepicker (focus, highlights)
            // note: today is immediately updated on a day change
            this._updateHighlightedDays();

            this._flyoutHost.show(el, vertical, horizontal);
        }

        _stop("show");
    };

    proto._ensureFlyout = function() {
        _start("_ensureFlyout");

        // make a simple div to serve as the flyout
        if (!this._flyoutHost) {
            var host = this._dpHidden;

            // graft in today if needed
            if (this.showJumpTargets) {
                host.insertAdjacentHTML("beforeend", "<div class='dp-jump'><span class='dp-today' role='button' tabindex='0'>" +
                    Jx.escapeHtml(loc.getString("TodayCommand")) + "</span></div>");
                this._todayButton = host.querySelector(".dp-today");
            }

            // override the id so that the winjs events will be knowable if needed
            host.id = this._makeWinJsId();

            // convert the div to a flyout
            this._flyoutHost = new WinJS.UI.Flyout(host);

            // update the arrow host
            this._timeline.resetArrowHost(host);

            //// register for visibility lifetime events
            this._flyoutHost.addEventListener("aftershow",  this._finishShow);
            this._flyoutHost.addEventListener("beforehide", this._prepareHide);
            this._flyoutHost.addEventListener("afterhide",  this._finishHide);
        }

        _stop("_ensureFlyout");
    };

    proto._ensurePager = function() {
        /// <summary>ensures that the date picker is configured with a valid pager, used to navigate
        ///     around the grids (and hence, differs for month and year grid since they navigate by
        ///     months or years.
        /// 
        ///     in addition to requiring a grid renderer (month/year) to display in its client area, the
        ///     date picker must also know how to move around by the appropriate time increments and perform
        ///     certain time-based comparisons correctly for that view.  however, there is no single, 
        ///     authoritative grid instance within the date picker, and some of these calculations must be done
        ///     before the first grid is created (in _renderer).  the methods providing the customized
        ///     behaviors are implemented as class methods on the related grid (this is not required, but is
        ///     convenient for organization).  None of the methods rely on state between uses, and all
        ///     required data for a calculation is passed in.
        ///
        ///     the methods comprising the pager interface include:
        ///     getItem(date:Date, index:int):Date - calculates a Date offset from the date param by index units.
        ///         index units are simply the units by which the grid would shift in response to a pan, such as
        ///         months for the monthgrid and years for the year grid
        ///     getIndex(refDate:Date, indexDate:Date):int - calculates the offset in index units between the two
        ///         dates.  if indexDate is further in the future, the result will be positive.  if indexDate is
        ///         further in the past, it will be negative.
        ///     getLeft(day:Date):int - gets the leftmost index in index units relative to a supplied day, typically
        ///         involving Calendar.FIRST_DAY
        ///     getRight(day:Date):int - gets the rightmost index in index units relative to a supplied day,
        ///         typically involving Calendar.LAST_DAY
        ///     mergeDates(baseDate:Date, newDate:Date):Date - uses part of the information from the new date to 
        ///         create a new date based on the baseDate.  date picker maintains several grid instances and tracks
        ///         a focus simultaneously in each.  baseDate will be the currently focused day in a child view, while
        ///         newDate will be a new date we wish to focus on.  the merge operation will take as much as should
        ///         not change from baseDate (e.g. for yeargrid, just the year), while taking the remaining date fields
        ///         (e.g. the month ordinal) from newDate, providing a date representing the equivalent cell in a
        ///         different grid.
        /// </summary>

        _start("_ensurePager");

        if (this.pickMode === DatePicker.PickMode.monthGrid) {
            this._pager = Calendar.Controls.MonthGrid;
        } else if (this.pickMode === DatePicker.PickMode.yearGrid) {
            this._pager = Calendar.Controls.YearGrid;
        } else {
            Debug.fail("unsupported pickmode: " + this.pickMode);
        }
        Debug.assert(this._pager, "unable to find pager interface: " + this.pickMode);

        _stop("_ensurePager");
    };

    proto.hide = function() {
        _start("hide");

        if (this._flyoutHost) {
            this._flyoutHost.hide();
        }

        _stop("hide");
    };

    proto._finishShow = function() {
        _start("_finishShow");

        if (!this._isVisible) {
            this._isVisible = true;
            this.fire("visibilityChanged");
        }

        _stop("_finishShow");
    };

    proto._prepareHide = function() {
        _start("_prepareHide");

        // don't double handle
        if (this._isVisible) {
            // mark us as not showing
            this._isVisible = false;
        }

        _stop("_prepareHide");
    };

    proto._biciClosed = function(dateSelected) {
        /// <summary>perform BICI logging for the flyout being closed</summary>
        /// <param name="dateSelected" type="Boolean">true if a date was selected, otherwise false</param>

        if (Jx.bici) {
            Jx.bici.addToStream(this._getIdsCalendar().calendarDatePickerClosed, dateSelected ? 1 : 0);
        }
        Debug.only(_info("IdsCalendar.CalendarDatePickerClosed - DatePickerDateSelected: " + dateSelected));
    };

    proto._biciLaunched = function(clientView) {
        /// <summary>perform BICI logging for the flyout being launched</summary>
        /// <param name="clientView" type="Number" integer="true">one of the following values:
        ///     Unknown: 0, Day: 1, WorkWeek: 2, Week: 3, Month: 4, EventDetails: 5
        /// </param>

        if (Jx.bici) {
            Jx.bici.addToStream(this._getIdsCalendar().calendarDatePickerLaunch, clientView);
        }
        Debug.only(_info("IdsCalendar.CalendarDatePickerLaunch - Views: " + clientView));
    };

    proto._finishHide = function() {
        _start("_finishHide");

        if (this._isActive) {
            // allow picker to be shown again
            this._isActive = false;

            this._biciClosed(this._dateSelected);

            // dispatch events
            if (this._dateSelected) {
                this.fire("dateSelected", this._focusDate);
            }

            this.fire("visibilityChanged");
        }

        _stop("_finishHide");
    };

    proto._makeWinJsId = function() {
        /// <summary>constructs an id that can be used to guarantee knowing the logging name that winjs will use
        ///     for its flyout events.  if no programmer action is taken, it is guaranteed to be unique by making
        ///     use of the Jx id, but if a particular suffix (or no suffix) is desired, that can be used instead.
        ///     it must first be set using the setIdSuffix method</summary>
        /// <returns type="String">the id to use for winjs logging</returns>

        _start("_makeWinJsId");

        var suffix,
            winjsId = "dp-flyout";

        if (this._idSuffix === null || this._idSuffix === undefined) {
            // use the Jx id
            suffix = this._id;
        } else {
            suffix = this._idSuffix;
        }

        // only append if non-empty suffix
        if (suffix.length > 0) {
            winjsId += "-" + suffix;
        }

        _stop("_makeWinJsId");

        return winjsId;
    };

    proto._getFixedWidth = function() {
        var width = 0;

        if (this.pickMode === DatePicker.PickMode.yearGrid) {
            // keep this in sync with the styled date picker width in datepicker.css
            // this is the same as the @hostMonthWidth calculated value
            width = 316;
        } else {
            // keep this in sync with the styled date picker width in datepicker.css
            // this is the same as the @hostWidth calculated value
            width = 313;
        }

        return width;
    };

    proto.setIdSuffix = function(suffix) {
        /// <summary>sets the string to use to differentiate the control from others on the page.
        ///     If not set, the control will just use the Jx id to guarantee uniqueness, so this 
        ///     method does not need to be called unless a specific log entry is desired</summary>
        /// <param name="suffix" type="String">value to append to the id root (dp-flyout), separated
        ///     by a '-'.  if the empty string is supplied, then no '-' will be appended.</param>

        this._idSuffix = suffix;
    };

    proto.getIdSuffix = function() {
        return this._idSuffix;
    };

    proto.getToday = function() {
        return new Date(this._today);
    };

    proto.setToday = function(today) {
        _start("setToday");
        this._updateToday(new Date(today));

        // update all our children if they have been created
        if (this._children) {
            for (var i = 0, len = this._children.length; i < len; ++i) {
                this._children[i].setToday(new Date(today));
            }
        }

        _stop("setToday");
    };

    proto.getFocusDate = function() {
        return new Date(this._focusDate);
    };

    proto.setFocusDate = function(focusDate) {
        _start("setFocusDate");
        this.setFocusedDay(focusDate);
        _stop("setFocusDate");
    };

    proto.setHighlightDates = function(highlightDates) {
        _start("setHighlightDates");

        this._datesWereSet = true;

        this._highlightDates = [].concat(highlightDates);
        _stop("setHighlightDates");
    };

    proto.getVisible = function() {
        return this._isVisible;
    };

    proto.getActive = function() {
        return this._isActive;
    };

    proto.addCustomClass = function (className) {
        /// <summary>adds a custom class to the date picker control which can be helpful for providing
        ///     contextual stlying based on the view it is displayed in.  This method can be called
        ///     before or after activating the control.</summary>
        /// <param name="className" type="String">the class name to add to the date picker</param>

        if (this._dpHidden) {
            // already activated, so apply directly to the class
            this._dpHidden.classList.add(className);
        } else {
            // not activated, so queue up
            var addClasses = this._addClasses;
            if (addClasses.indexOf(className) === -1) {
                addClasses.push(className);
            }
        }
    };

    proto.removeCustomClass = function (className) {
        /// <summary>removes a custom class from the date picker control which can be helpful for providing
        ///     contextual stlying based on the view it is displayed in.  This method can be called
        ///     before or after activating the control.</summary>
        /// <param name="className" type="String">the class name to remove from the date picker</param>

        if (this._dpHidden) {
            // already activated, so apply directly to the class
            this._dpHidden.classList.remove(className);
        } else {
            // not activated, work with queue
            var addClasses = this._addClasses,
                index      = addClasses.indexOf(className);
            if (index !== -1) {
                addClasses.splice(index, 1);
            }
        }
    };

    // Jx Events

    proto._onFocusChanged = function(data) {
        /// <summary>updates the currently active grid in response to focus changes</summary>
        /// <param name="data" type="Object">information about the newly focused view.  has the same
        ///     properties as the data item used for recycling</param>

        _start("_onFocusChanged");

        this._index = data.index;

        var el = data.el;

        if (this._grid) {
            this._grid.setActive(false);
        }

        this._grid = el._grid;

        this._grid.setActive(true);

        _stop("_onFocusChanged");
    };

    proto._onItemRealized = function(data) {
        _start("_onItemRealized");

        var item   = data.item,
            el     = data.el,
            jobset = data.jobset;

        el._grid   = item._grid;

        el._grid.activateUI(jobset);

        _stop("_onItemRealized");
    };

    proto._onItemRemoved = function(data) {
        _start("_onItemRemoved");

        var el = data.el;

        el._grid.pause();

        _stop("_onItemRemoved");
    };

    proto._onDaySelected = function(ev) {
        /// <summary>handles event that a day was selected (mouse click or enter key)</summary>

        _start("_onDaySelected");

        if (!ev.handled) {
            ev.handled = true;
            this._prepareToSelectDate(ev.data);
        }

        _stop("_onDaySelected");
    };

    proto._prepareToSelectDate = function(date) {
        /// <summary>marks that we have a selected date and starts closing the flyout.  the
        ///     host gets notified of the selection during the close</summary>
        /// <param name="date" type="Date">the date to report as selected</param>

        _start("_prepareToSelectDate");

        if (!this._dateSelected) {
            this._dateSelected = true;

            this._focusDate = date;
            this.hide();
        }

        _stop("_prepareToSelectDate");
    };

    proto._onDayFocused = function(ev) {
        _start("_onDayFocused");

        if (!ev.handled) {
            this.setFocusedDay(ev.data);
            ev.handled = true;
        }

        _start("_onDayFocused");
    };

    proto._onShowArrows = function(ev) {
        // always update our show state regardless of whether another view has consumed 
        // the event.  likewise, don't mark it handled so that any other view can have it
        this._timeline.setAlwaysShowArrows(ev.data.value);
    };

    // DOM Events

    proto._onClick = function(ev) {
        _start("_onClick");

        if (!ev.handled) {
            for (var el = ev.target; el !== ev.currentTarget; el = el.parentNode) {
                if (el.classList.contains("dp-today")) {
                    ev.preventDefault();
                    this._prepareToSelectDate(this._today);
                    break;
                }
            }
        }

        _stop("_onClick");
    };

    proto._onKeyDown = function(ev) {
        _start("_onKeyDown");

        if (ev.keyCode === Jx.KeyCode.tab) {
            // find the thing with focus
            var focused = null,
                grid = this._grid;

            if (grid) {
                focused = grid.getFocusedElement();
            }

            // if the active thing is in the grid, or we have no grid, switch to the today button
            if (!grid || focused && this._todayButton) {
                this._todayButton.focus();
            } else {
                if (grid) {
                    var eater = this._dpFocusEater;
                    eater.style.display = "";
                    eater.focus();
                    eater.style.display = "none";

                    grid.focus();
                }
            }
            ev.preventDefault();
        } else if (ev.keyCode === Jx.KeyCode.enter || ev.keyCode === Jx.KeyCode.space) {
            // if the active thing is the today button, then do it
            if (this._todayButton && document.activeElement === this._todayButton) {
                this._prepareToSelectDate(this._today);
            }
            ev.preventDefault();
        }

        _stop("_onKeyDown");
    };

    // Jx.Component

    proto.getUI = function(ui) {
        ui.html = Templates.dphost({
            id: this._id, 
            pickClass: "dp-pick-" + this.pickMode,
        });
    };

    proto.activateUI = function(jobset) {
        /// <summary>this is NOT the normal Jx activate UI.  it must be called explicitly with the
        ///     additional parameters</summary>
        /// <param name="jobset" type="JobSet">jobset for background management</param>

        _start("activateUI");

        Jx.Component.prototype.activateUI.call(this);

        // get the ui and stash it in an off-screen element
        document.body.insertAdjacentHTML("beforeend", Jx.getUI(this).html);
        this._dpHidden = document.body.lastElementChild;

        // apply, then clear any custom classes
        var i, len,
            addClasses = this._addClasses;
        for (i = 0, len = addClasses.length; i < len; ++i) {
            this.addCustomClass(addClasses[i]);
        }
        this._addClasses = [];

        this._jobset = jobset;
        this._host   = document.getElementById(this._id);
        this._dpFocusEater = document.getElementById("dp-focusEater-" + this._id);

        // hook jx events
        this.on("daySelected", this._onDaySelected);
        this.on("dayFocused",  this._onDayFocused);

        // get our ui settings
        var data = {};
        this.fire("getSettings", data);

        // create timeline options.  since the datepicker shows and hides itself, in order to
        // have focus operate correctly we need the timeline to make sure that the currently
        // viewed instance is always the first thing in the scroll region so that the focus
        // handler is happy
        var fixedWidth = this._getFixedWidth();
        var options = {
            hookWheel: true,
            strictOrder: true,
            noFocusOnResize: true,
            fixedWidth: fixedWidth,
        };

        // querying offsetWidth can trigger a layout, so for date picker, which we know to be of 
        // fixed width, we explicitly pass a width into the timeline to avoid future offsetWidth
        // queries.  but the passed width needs to be in agreement with the styles, so in debug
        // builds, validate that the fixed width that we use matches the offsetWidth that would
        // be set by the style sheets.
        Debug.assert(fixedWidth === this._host.offsetWidth, "calculated datepicker width doesn't match applied style");

        // create our timeline control
        var timeline = this._timeline = new Calendar.Controls.Timeline(this._host, this._jobset, this, this._renderer, this._recycler, options);
        timeline.setAlwaysShowArrows(data.settings.get("alwaysShowArrows"));

        // listen for arrow setting changes
        this.on("showArrows", this._onShowArrows);

        // hook events
        timeline.addListener("focusChanged", this._onFocusChanged, this);
        timeline.addListener("itemRealized", this._onItemRealized, this);
        timeline.addListener("itemRemoved",  this._onItemRemoved,  this);

        // now initialize the timeline
        timeline.initialize(this._index);

        // hook dom events
        this._dpHidden.addEventListener("keydown", this._onKeyDown, false);
        this._dpHidden.addEventListener("click",   this._onClick,   false);

        this._isReady = true;

        _stop("activateUI");
    };

    proto.deactivateUI = function() {
        _start("deactivateUI");

        // clean up flyout
        if (this._flyoutHost)
        {
            this._flyoutHost.removeEventListener("aftershow",  this._finishShow);
            this._flyoutHost.removeEventListener("beforehide", this._prepareHide);
            this._flyoutHost.removeEventListener("afterhide",  this._finishHide);

            this._flyoutHost.hide();
            this._flyoutHost = null;
        }

        this._dpHidden.removeEventListener("keydown", this._onKeyDown, false);
        this._dpHidden.removeEventListener("click",   this._onClick,   false);

        // clean up the initial renderer block
        this._dpHidden.parentNode.removeChild(this._dpHidden);
        this._dpHidden = null;

        this._timeline.shutdown();

        this._timeline.removeListener("itemRemoved",  this._onItemRemoved,  this);
        this._timeline.removeListener("itemRealized", this._onItemRealized, this);
        this._timeline.removeListener("focusChanged", this._onFocusChanged, this);

        this.detach("daySelected", this._onDaySelected);
        this.detach("dayFocused",  this._onDayFocused);
        this.detach("showArrows",  this._onShowArrows);

        this._timeline = null;
        this._host     = null;

        Jx.Component.prototype.deactivateUI.call(this);

        _stop("deactivateUI");
    };
});