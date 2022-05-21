
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\common\Common.js" />

/*jshint browser:true*/
/*global Calendar,Debug,Jx,Microsoft,MSApp,Windows,WinJS*/

Jx.delayDefine(Calendar.Views, "Manager", function() {

    function _info(s) { Jx.mark("Calendar.Views.Manager." + s + ",Info,Calendar"); }
    function _start(s) { Jx.mark("Calendar.Views.Manager." + s + ",StartTA,Calendar"); }
    function _stop(s) { Jx.mark("Calendar.Views.Manager." + s + ",StopTA,Calendar"); }

    function _loadEventDetails(fn) {
        Debug.assert(Jx.isFunction(fn), "_loadEventDetailsDep: invalid fn");
        Jx.Dep.load("CalED", fn);
    }

    //
    // Namespaces
    //

    var Views = Calendar.Views;

    // The largest width at which companion should be shown
    var COMPANION_WIDTH = 671;

    //
    // View Manager
    //

    var Manager = Views.Manager = function() {
        this.initComponent();
        this._id = "calViewsMgr";

        // initialize members
        this._view = Manager.Views.agenda;

        this._companion = window.outerWidth <= COMPANION_WIDTH;
        this._editing = false;
        this._replacementEvent = null;

        this._date = new Date();
    };

    Jx.augment(Manager, Jx.Component);

    //
    // Enums
    //

    Manager.Views = {
        month:    0,
        week:     1,
        workweek: 2,
        day:      3,
        agenda:   4
    };

    Manager.prototype.setCurrentView = function (view) {
        /// <summary>
        /// Sets the current view state (representing the view for full screen mode).  
        /// If we're currently editing, the actual view will change once edit is closed.
        /// If in companion view, the view will change if appropriate.
        /// For example, when in agenda companion and switching to month view, it will save month view and switch to day-companion immediately.
        /// </summary>
        /// <param name="view" type="Number">value from Manager.Views</param>

        // only do work if the views are different
        if (this._view !== view) {

            // set the new view
            var previousSavedView = this._view;
            this._view = view;

            // only update our ui if we've created it yet
            if (this._host) {
                // See if we need to immediately apply a view change
                // The view saved in this._view isn't necessarily the one we're actually showing, if we're editing or in companion mode.

                // View changes don't immediately apply while we're editing
                if (!this._editing) {
                    // View changes sometimes don't immediately apply while we're in companion view
                    var previousRenderedView;
                    var nextRenderedView;

                    if (this._companion) {
                        // Some views display other views in companion - for example, month view switches to day for companion
                        previousRenderedView = this._getCompanionView(previousSavedView);
                        nextRenderedView = this._getCompanionView(view);
                    } else {
                        previousRenderedView = previousSavedView;
                        nextRenderedView = view;
                    }
                    
                    if (previousRenderedView != nextRenderedView) {
                        // save the old child and create the new
                        var children = this._updateChild();
                        this._replaceUi(children.prev, children.next);
                    }
                }
            }
        }
    };

    Manager.prototype.getCurrentView = function() {
        return this._view;
    };

    Manager.prototype.isEditing = function() {
        return this._editing;
    };

    Manager.prototype.showDatePicker = function() {
        if (this._child && this._child.showDatePicker) {
            _info("showDatePicker");
            this._child.showDatePicker();
        }
    };

    Manager.prototype.changeBackground = function (useDefault) {
        if (this._child && this._child.changeBackground) {
            _info("changeBackground");
            this._child.changeBackground(useDefault);
        }
    };

    Manager.prototype.allowPeekBarTabVersion = function () {
        if (this._child && this._child.allowPeekBarTabVersion) {
            return this._child.allowPeekBarTabVersion();
        }

        return false;
    };

    Manager.prototype.setFocusedDay = function(day) {
        // create a copy of the day
        var focusedDay = this.getFocusedDay();
        Debug.assert(focusedDay);
        Debug.assert(day);

        if (focusedDay && focusedDay.getTime() !== day.getTime()) {
            this._date = new Date(day);

            if (this._child && this._child.setFocusedDay) {
                this._child.setFocusedDay(this._date);
                _info("setFocusedDay " + this._date);
            }
        }
    };

    Manager.prototype.getFocusedDay = function() {
        if (this._child && this._child.getFocusedDay) {
            this._date = this._child.getFocusedDay();
        }

        return this._date;
    };

    Manager.prototype.getUI = function(ui) {
        // create our child now if we haven't before
        if (!this._child) {
            this._companion = (window.outerWidth <= COMPANION_WIDTH);
            this._updateChild();

            if (this._child.setLoadAnimation) {
                this._child.setLoadAnimation(WinJS.UI.Animation.enterPage);
            }
        }

        // set our html
        ui.html = "<div id='viewManager' class='viewManager'>" + Jx.getUI(this._child).html + "</div>";
    };

    Manager.prototype.activateUI = function(jobset) {
        // cache params
        this._jobset = jobset;

        // cache our host
        this._host = document.getElementById("viewManager");

        // hook events
        this.on("dayChosen",       this._onDayChosen);
        this.on("monthChosen",     this._onMonthChosen);
        this.on("createEvent",     this._onCreateEvent);
        this.on("editEvent",       this._onEditEvent);
        this.on("focusEvent",      this._onFocusEvent);
        this.on("finishedEditing", this._onFinishedEditing);
        this.on("resizeWindow",    this._onResizeWindow);

        this._childJobset = jobset.createChild();
        this._child.activateUI(this._childJobset);
    };

    Manager.prototype.deactivateUI = function() {
        Jx.Component.prototype.deactivateUI.call(this);

        // unhook events
        this.detach("resizeWindow",    this._onResizeWindow);
        this.detach("dayChosen",       this._onDayChosen);
        this.detach("monthChosen",     this._onMonthChosen);
        this.detach("createEvent",     this._onCreateEvent);
        this.detach("editEvent",       this._onEditEvent);
        this.detach("focusEvent",      this._onFocusEvent);
        this.detach("finishedEditing", this._onFinishedEditing);

        this._host = null;

        this._jobset.dispose();
        this._jobset = null;
    };

    Manager.prototype.isCompanion = function () {
        return this._companion;
    };

    Manager.prototype.getShareData = function(request) {
        // this app currently shares content when the user has selected content
        // in the edit details view
        if (this._editing) {
            var eventDetailsCanvasWindow = this._child.getCanvasWindow();

            if (!eventDetailsCanvasWindow.getSelection().isCollapsed) {
                try {
                    request.data = MSApp.createDataPackageFromSelection();
                } catch (ex) {
                    // Due to a WWA bug (Windows 8 Bug 901355), createDataPackageFromSelection can fail if the
                    // first image has not been rendered. As a workaround, explicitly set the HTML data source
                    var selectedContent = eventDetailsCanvasWindow.getSelection().getRangeAt(0).cloneContents();

                    var div = document.createElement("div");
                    div.appendChild(selectedContent);

                    var htmlFormat = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(div.innerHTML);

                    request.data = new Windows.ApplicationModel.DataTransfer.DataPackage();
                    request.data.setHtmlFormat(htmlFormat);
                }

                var title = this._child.getTitle();
                
                if (Jx.isNonEmptyString(title) && Jx.isNonEmptyString(title.trim())) {
                    request.data.properties.title = Jx.res.loadCompoundString("ShareTitle", title.trim());
                } else {
                    request.data.properties.title = Jx.res.getString("ShareEmptyTitle");
                }
            } else {
                request.failWithDisplayText(Jx.res.getString("ShareFail"));
            }
        } else {
            request.failWithDisplayText(Jx.res.getString("ShareFail"));
        }
    };

    //
    // Private
    //

    // Statics

    Manager._viewCreators = [
        function() {
            return new Views.Month();
        },
        function() {
            return new Views.Week();
        },
        function() {
            var week = new Views.Week();
            week.setWorkWeek(true);
            return week;
        },
        function() {
            return new Views.Day();
        },
        function() {
            return new Views.Agenda();
        }
    ];

    // Utils

    Manager.prototype._getCompanionView = function (view) {
        /// <summary>Returns the companion view used to display the given view (for example, month view transitions to day in companion)</summary>
        /// <returns type="Number">Manager.Views enum value representing view</returns>

        if (view === Manager.Views.agenda) {
            return Manager.Views.agenda;
        } else {
            return Manager.Views.day;
        }
    };

    Manager.prototype._updateChild = function() {
        // save the old child so we can return it
        var oldChild = this._child;
        if (oldChild) {
            if (oldChild.getFocusedDay) {
                this._date = oldChild.getFocusedDay();
            }

            this.removeChild(oldChild);
            this._childJobset.cancelAllChildJobs();
        }

        // create the right child depending on whether or not we're companion
        if (this._editing) {
            if (oldChild && oldChild.getState) {
                this._lastViewState = oldChild.getState();
                this._lastWasCompanion = this._companion;
            }

            this._child = new Views.EventDetails();
        } else {
            var viewIndex = this._companion ? this._getCompanionView(this._view) : this._view;
            var createViewFunction = Manager._viewCreators[viewIndex];

            Debug.assert(createViewFunction, "Unable to find view creation function");
            this._child = createViewFunction();
        }

        // set the focused date on it
        if (this._child.setFocusedDay) {
            this._child.setFocusedDay(this._date);
        }

        // put our new child in the tree
        this.appendChild(this._child);
        this.fire("viewUpdated", { companion: this._companion, editing: this._editing });

        Debug.call(function() { Debug.view = this._child; }, this);

        // return the children
        return {
            prev: oldChild,
            next: this._child
        };
    };

    Manager.prototype._replaceUi = function(oldChild, newChild) {
        // shutdown and remove the old view
        oldChild.shutdownUI();

        // add it to our view
        this._host.innerHTML = Jx.getUI(newChild).html;

        // activate it
        newChild.activateUI(this._childJobset);
    };

    Manager.prototype._isValidEvent = function(ev) {
        if (ev && ev.event) {
            // get the platform and calendar manager
            var data = {};
            this.fire("getPlatform", data);

            // load the event now so that we can verify whether it exists
            try {
                ev = data.platform.calendarManager.getEventFromHandle(ev.event.handle);
            } catch (ex) {
                // this is expected, if the event was deleted
                ev = null;
            }

            if (ev) {
                return true;
            }
        }

        return false;
    };

    Manager.prototype._viewSupportsCompanion = function(view) {
        /// <summary>Determines whether a given view supports companion mode or requires a switch to another mode</summary>
        /// <param name="view">The view's ID</param>
        /// <returns>True if the view supports companion mode, false if the view needs to be replaced with a dedicated companion view</returns>
        Debug.assert(Jx.isValidNumber(view), 'Jx.isValidNumber(view)');

        switch (view) {
            case Manager.Views.agenda:
            case Manager.Views.day:
                return true;

            default:
                return false;
        }
    };

    // Events

    Manager.prototype._onResizeWindow = function(ev) {
        _start("_onResizeWindow");

        // Only change the UI on companion mode switch.
        var companion = ev.data.outerWidth <= COMPANION_WIDTH;

        // Resize transitions only occur moving to or from companion mode.
        if (companion !== this._companion &&
            // Don't transition while editing because event details has an onFinishedEditing event.
            !this._editing &&
            // Don't transition if the current view supports companion mode
            !((companion || this._companion) && this._viewSupportsCompanion(this._view))
            ) {

            this._companion = companion;

            var children = this._updateChild();
            this._replaceUi(children.prev, children.next);
        } else {
            this._companion = companion;        
            // This prevents the navbar from being visible in dayview while at companion size.
            this.fire("viewUpdated", { companion: this._companion, editing: this._editing });
        }

        _stop("_onResizeWindow");
    };

    Manager.prototype._onCreateEvent = function(ev) {
        if (!ev.handled && !this._editing) {
            _info("eventDetails_create");
            Jx.ptStart("Calendar-EventDetails-NoData");

            var that = this;

            _loadEventDetails(function () {
                var now = new Date();
                var data = ev.data;

                if (!data) {
                    data = {};

                    // check if today is in the view
                    if (that._child.containsDate(now)) {
                        // use the next 30 minute slot
                        data.startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

                        var minutes = now.getMinutes();
                        if (minutes > 30) {
                            data.startDate.setMinutes(60);
                        } else if (minutes > 0) {
                            data.startDate.setMinutes(30);
                        }
                    } else {
                        // use the focused day at 9am
                        data.startDate = new Date(that._child.getFocusedDay());
                        data.startDate.setHours(9);
                    }
                }

                that._editing = true;
                that._replacementEvent = null;

                var children = that._updateChild();
                children.next.createEvent(data);

                that._replaceUi(children.prev, children.next);
            });

            ev.handled = true;
        }
    };

    Manager.prototype._onEditEvent = function(ev) {
        if (!ev.handled) {
            _info("eventDetails_edit"); // used in perfbench
            Jx.ptStart("Calendar-EventDetails-Data");

            var that = this;
            var event = ev.data.event;
            var dirty = ("dirty" in ev.data) ? ev.data.dirty : false;

            _loadEventDetails(function () {
                if (!that._editing) {
                    that._editing = true;
                    var children = that._updateChild();

                    // if editEvent fails replace UI with previous UI
                    if (!children.next.editEvent(event, dirty)) {
                        that._editing = false;
                        children.prev.shutdownUI();
                        children = that._updateChild();
                    }

                    that._replaceUi(children.prev, children.next);
                } else {
                    // We're already in edit mode, check to see whether we're editing that event
                    var currentEvent = that._child.getEvent();

                    if (!currentEvent || currentEvent.handle !== event.handle) {
                        // Cancel will eventually fire finishedEditing where replacementEvent will be picked up.
                        that._replacementEvent = ev.data;
                        that._child.cancel();
                    }
                }
            });

            ev.handled = true;
        }
    };

    Manager.prototype._onFocusEvent = function (ev) {
        /// <summary>
        /// Handles the "focusEvent" event from app activation, including handling situations where event details is currently showing.
        /// "focusEvent" involves switching views to make sure the given event time frame is visible to the user.
        /// </summary>
        /// <param name="ev">ev.data contains event info: startDate, endDate, and allDayEvent (bool) properties</param>

        if (ev.handled) {
            return;
        }

        // This event originates from app activation, so we should feel free to switch views. 
        
        // In addition to "view specific time frame" not making sense in Agenda view, it's important not to choose agenda here,
        // since Agenda doesn't support focusEvent without an actual event (eventInfo is not an event).

        var newView;
        var eventInfo = ev.data;
        var Helpers = Calendar.Helpers;
        // Choose the view to use based on the time frame in eventInfo
        var timeDifference = eventInfo.endDate.getTime() - eventInfo.startDate.getTime();
            
        if (timeDifference <= (2 * Helpers.dayInMilliseconds)) {
            newView = Manager.Views.day;
        } else if (timeDifference <= (7 * Helpers.dayInMilliseconds)) {
            newView = Manager.Views.week;
        } else {
            newView = Manager.Views.month;
        }

        this.setCurrentView(newView);

        if (!this._editing) {
            this._child.focusEvent(eventInfo);
        } else {
            // While editing, setCurrentView just remembers which view we should be in. The actual view change (and focusEvent) will happen in onFinishedEditing
            this._eventToFocus = eventInfo;
            this._child.cancel();
        }

        ev.handled = true;
    };

    Manager.prototype._onFinishedEditing = function(ev) {
        if (!ev.handled) {
            var children;

            if (this._isValidEvent(this._replacementEvent)) {
                Debug.assert(this._editing);

                var dirty = ("dirty" in this._replacementEvent) ? this._replacementEvent.dirty : false;

                // let children update ui accordingly
                children = this._updateChild();
                children.next.editEvent(this._replacementEvent.event, dirty);
            } else {
                this._editing = false;

                // let children update ui accordingly
                children = this._updateChild();

                // if our companion states are the same, restore our state
                if (this._companion === this._lastWasCompanion) {
                    if (this._lastViewState) {
                        children.next.setState(this._lastViewState);
                    }
                }

                this._lastViewState = null;
                this._lastWasCompanion = null;

                if (this._eventToFocus) {
                    // If we closed the event details page in order to focus an event, focus it
                    children.next.focusEvent(this._eventToFocus);
                    this._eventToFocus = null;
                } else if (ev.data && ev.data.eventType !== Microsoft.WindowsLive.Platform.Calendar.EventType.series) {
                    // if we saved the event and it wasn't a series, focus it in the current view.
                    children.next.focusEvent(ev.data);
                }
            }

            this._replacementEvent = null;

            // update our ui
            this._replaceUi(children.prev, children.next);

            _info(ev.data ? "SaveEnd" : "CancelEnd"); // used in perfbench

            ev.handled = true;
        }
    };

    Manager.prototype._onDayChosen = function(ev) {
        if (ev.data) {
            // This is necessary since the new view (if there is one) will be built based on the previous view's focused day
            this.setFocusedDay(ev.data);
        }

        this.setCurrentView(Manager.Views.day);
    };

    Manager.prototype._onMonthChosen = function(ev) {
        if (ev.data) {
            // This is necessary since the new view (if there is one) will be built based on the previous view's focused day
            this.setFocusedDay(ev.data);
        }

        this.setCurrentView(Manager.Views.month);
    };

});
