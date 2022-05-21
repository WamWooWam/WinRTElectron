
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global $,Calendar,Debug,Jx,Windows,WinJS*/

/// <reference path="..\..\common\Common.js" />

(function () {

    //
    // Namespaces
    //

    var Helpers = Calendar.Helpers;

    //
    // Popups
    //

    Helpers._isVisible = false;

    Helpers.isPopupVisible = function () {
        /// <summary>Indicates whether one of the light-dismiss popups created by Helpers is currently showing</summary>

        // relies on the assumption that only one dialog can be visible at a time, which seems to be accurate.
        return Helpers._isVisible;
    };

    Helpers.showPopup = function(popup, anchor, host) {
        Debug.assert(Jx.isObject(popup), "Helpers.showPopup: invalid popup");
        Debug.assert(Jx.isHTMLElement(anchor), "Helpers.showPopup: invalid anchor");
        Debug.assert(Jx.isHTMLElement(host), "Helpers.showPopup: invalid host");
        
        host.addEventListener("click", function(ev) {
            // Hide the flyout when a button is clicked
            if (popup && ev.target instanceof HTMLButtonElement) {
                popup.hide();
            }
        }, false);

        popup.addEventListener("beforeshow", function () {
            Helpers._isVisible = true;
        }, false);

        popup.addEventListener("afterhide", function() {  
            // Remove the flyout (html and JS object)
            host.outerHTML = "";
            popup = host = null;
            Helpers._isVisible = false;
        }, false);

        document.body.appendChild(host);

        // Show the flyout
        popup.show(anchor);
    };

    Helpers.showFlyout = function (data) {
        var commands = data.commands, 
            commandsLen = commands.length,
            host = document.createElement("div"),
            s, i, buttons, buttonsLen;

        // Create the flyout content

        s = '<div><div class="cal-flyout-msg">' + Jx.escapeHtml(data.message) + '</div><div class="cal-flyout-buttons">';

        for (i = 0; i < commandsLen; i++) {
            s += '<button class="cal-flyout-button" tabindex="' + (i + 1) + '">' + Jx.escapeHtml(commands[i].label) + '</button>';
        }
        
        s += '</div></div>';

        host.setAttribute("aria-label", data.message);
        host.innerHTML = s;

        // Add the button handlers

        buttons = host.querySelectorAll("button");
        buttonsLen = buttons.length;
        Debug.assert(buttonsLen === commandsLen, "EventDetails.showFlyout: invalid number of buttons " + buttonsLen + " expected " + commandsLen);

        for (i = 0; i < buttonsLen; i++) {
            buttons[i].addEventListener("click", commands[i].onclick, false);
        }

        // Create and show the flyout object
        var flyout = new WinJS.UI.Flyout(host);
        Helpers.showPopup(flyout, data.anchor, host);
    };

    Helpers.showCantOpenEvent = function (anchor) {
        /// <summary>
        /// Shows the "can't open event" flyout
        /// </summary>
        /// <param name="anchor" type="HTMLElement">Anchor for the flyout</param>

        Helpers.showFlyout({
            anchor: anchor,
            message: Jx.res.getString("CantOpenEvent"),
            commands: []
        });
    };

    Helpers.showMenu = function (data) {
        var host = document.createElement("div");
        host.setAttribute("aria-label", data.message);

        var menu = new WinJS.UI.Menu(host, {commands: data.commands});
        Helpers.showPopup(menu, data.anchor, host);
    };

    // 
    // Mail integration
    //

    Helpers.launchMail = function (action, mailEvent) {
        /// <summary>
        /// Launches mail to perform the given action on the given event
        /// </summary>
        /// <param name="action" type="Calendar.MailAction">action to take on the event</param>
        /// <param name="mailEvent">event on which the action should be performed</param>

        // Put together the mail link
        var handle    = mailEvent.handle,
            uriString = "ms-mail:?action=calendar&calendaraction=" + encodeURIComponent(action) + "&eventhandle=" + handle;

        Helpers._launchUriAsync(new Windows.Foundation.Uri(uriString));
    };

    Helpers._launchUriAsync = function (uri) {
        /// <summary>Calls launchUriAsync</summary>
        /// <param name="uri" type="Windows.Foundation.Uri">uri to launch</param>
        /// <returns type="WinJS.Promise" />

        // Separate this into its own function for unit-testability
        return Windows.System.Launcher.launchUriAsync(uri);
    };

    //
    // Views
    //

    Helpers.getHoursHtml = function() {
        var Globalization = Windows.Globalization,
            shortTime     = new Jx.DTFormatter("shortTime"),
            twelveHour    = Globalization.ClockIdentifiers.twelveHour;

        var hours        = "",
            isTwelveHour = (shortTime.clock === twelveHour);

        for (var i = 0, len = 24; i < len; i++) {
            var hour;

            if (isTwelveHour) {
                hour = i % 12;

                if (hour === 0) {
                    hour = Jx.escapeHtml(Helpers.simpleTime.format(new Date(2000, 0, 1, i)));
                }
            } else {
                hour = i;
            }

            hours += "<div class='hour'><div class='trim'>" + hour + "</div></div>";
        }

        return hours;
    };

    Helpers.getIdealScrollTop = function(ev, el, scrollTop) {
        var startDate = ev.startDate;
        var endDate   = ev.endDate;
        var top       = el.scrollHeight * (startDate.getHours() + startDate.getMinutes() / 60) / 24;
        var bottom    = el.scrollHeight * (endDate.getHours() + endDate.getMinutes() / 60) / 24;

        // if it starts before the default top, go there
        if (top <= scrollTop) {
            scrollTop = top;
        // if the end goes past today, just put the top in view
        } else if (!Helpers.isSameDate(startDate, endDate)) {
            scrollTop = top;
        // if it ends after the default bottom, scroll the whole event into view
        } else if (bottom > scrollTop + el.offsetHeight) {
            scrollTop = Math.min(top, bottom - el.offsetHeight);
        }

        return scrollTop;
    };

    Helpers.editEvent = function(context, handle, anchor) {
        Debug.assert(handle);
        // get the platform and calendar manager
        var platformContainer = {};
        context.fire("getPlatform", platformContainer);
        var manager = platformContainer.platform.calendarManager;

        // Load the event now so that we can verify whether it exists
        var targetEvent = manager.getEventFromHandle(handle);

        // if the event exists, we have more to verify
        if (targetEvent) {
            if (!targetEvent.recurring || targetEvent.calendar.readOnly) {
                // We only have the one event, go ahead and show the edit page
                context.fire("editEvent", {event: targetEvent});
            } else {
                // Need to choose between instance and series
                Helpers.showFlyout({
                    anchor: anchor,
                    message: Jx.res.getString("EventRecurringChoice"),
                    commands: [
                        {
                            label: Jx.res.getString("EventRecurringChangeOne"),
                            onclick: function _editInstance() {
                                // Check again to see whether the event exists - the event details page doesn't handle it well otherwise
                                targetEvent = manager.getEventFromHandle(handle);

                                if (targetEvent) {
                                    context.fire("editEvent", {event: targetEvent});
                                } else {
                                    Helpers.showCantOpenEvent(anchor);
                                }
                            }
                        },
                        {
                            label: Jx.res.getString("EventRecurringChangeAll"),
                            onclick: function _editSeries() {
                                try {
                                    targetEvent = targetEvent.getSeries();
                                } catch (ex) {
                                    // getSeries throws if the series has been deleted
                                    targetEvent = null;
                                }

                                if (targetEvent) {
                                    context.fire("editEvent", {event: targetEvent});
                                } else {
                                    Helpers.showCantOpenEvent(anchor);
                                }
                            }
                        }
                    ]
                });
            }
        } else {
            // Event doesn't exist
            Helpers.showCantOpenEvent(anchor);
        }
    };

    function _hideFocus(ev) {
        var element = ev.target;
        
        if (element.hideFocusOnNext) {
            $(element).attr("hidefocus", "true");
            element.hideFocusOnNext = false;
        } else {
            $(element).removeAttr("hidefocus");
            element.removeEventListener("onfocus", _hideFocus, false);  
        }
    }

    Helpers.hideFocusRectangleOnNextFocusOnly = function (element) {
        if (element && !element.hideFocusOnNext) {
            element.hideFocusOnNext = true;
            element.addEventListener("onfocus", _hideFocus, false);  
        }
    };

    // set up localized day names

    // 7 days per week
    var _days = new Array(7);
    var _shortDays = new Array(7);

    var _ensureDays = function () {
        var formatter = new Jx.DTFormatter("{dayofweek.full}");
        for (var i = 0; i < 7; i++) {
            var d = new Date(2011, 8, 18 + i); // September 18th 2011 is a Sunday
            _days[i] = formatter.format(d);
        }
        _ensureDays = Jx.fnEmpty;
    };

    var _ensureShortDays = function () {
        var formatter = new Jx.DTFormatter("{dayofweek.abbreviated(3)}");
        for (var i = 0; i < 7; i++) {
            var d = new Date(2011, 8, 18 + i); // September 18th 2011 is a Sunday
            _shortDays[i] = formatter.format(d);
        }
        _ensureShortDays = Jx.fnEmpty;
    };

    Helpers.getDay = function (i) {
        _ensureDays();
        return _days[i];
    };

    Helpers.getShortDay = function (i) {
        _ensureShortDays();
        return _shortDays[i];
    };

    Helpers.formatEmailAddress = function (attendeeName, attendeeEmail) {
        /// <summary>
        /// Given a name and email address, formats them in a way suitable for putting in the to/cc field of an email.  
        /// Caller will need to make sure they are semicolon-delimited.
        /// </summary>
        if (attendeeName === attendeeEmail) {
            return attendeeEmail;
        } else {
            return '"' + attendeeName.replace(/\"/g, '\\"') + '" <' + attendeeEmail + ">";
        }
    };

})();
