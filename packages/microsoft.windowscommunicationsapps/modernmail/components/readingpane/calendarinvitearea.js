
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Mail,Debug,Microsoft,document,WinJS,Event,Windows,Compose*/

Jx.delayDefine(Mail, "CalendarInviteArea", function () {
    "use strict";

    function _start(evt) { Mail.writeProfilerMark("CalendarInviteArea." + evt, Mail.LogEvent.start); }
    function _stop(evt) { Mail.writeProfilerMark("CalendarInviteArea." + evt, Mail.LogEvent.stop); }

    //
    // Enums
    //

    var CalendarMessageType = /*@static_cast(Microsoft.WindowsLive.Platform.CalendarMessageType)*/null,
        MailFolderType = /*@static_cast(Microsoft.WindowsLive.Platform.MailFolderType)*/null,
        BusyStatus = /*@static_cast(Microsoft.WindowsLive.Platform.Calendar.BusyStatus)*/null,
        ResponseType = /*@static_cast(Microsoft.WindowsLive.Platform.Calendar.ResponseType)*/null;

    // HRESULTS
    var UnexpectedErrorCode = -2147418113,  // E_UNEXPECTED
        MailSendAddressErrorCode = -100,         // These next ones are made up
        NoResponseMailErrorCode = -200;

    // Map for MeetingMessageType to ResId
    var resIdForMeetingMessageType = {};

    //
    // CalendarInviteArea
    //

    var CalendarInviteArea = Mail.CalendarInviteArea = function (selection) {
        _start("ctor");

        if (!CalendarMessageType) {
            var Plat = Microsoft.WindowsLive.Platform,
                Cal = Plat.Calendar,
                MMT = Cal.MeetingMessageType;

            CalendarMessageType = Plat.CalendarMessageType;
            MailFolderType = Plat.MailFolderType;
            BusyStatus = Cal.BusyStatus;
            ResponseType = Cal.ResponseType;

            resIdForMeetingMessageType[MMT.informationalUpdate] = "mailInviteStatusInformational";
            resIdForMeetingMessageType[MMT.outdated] = "mailInviteStatusOutdated";
            resIdForMeetingMessageType[MMT.delegatorCopy] = "mailInviteStatusDelegator";
            resIdForMeetingMessageType[MMT.delegateCopy] = "mailInviteStatusDelegate";
        }

        this._selection = selection;

        _stop("ctor");
    };

    //
    // Public
    //

    CalendarInviteArea.prototype.initialize = function (host, keySources) {
        /// <param name="host" type="HTMLElement" />
        /// <param name="keySources" type="Array" />
        Debug.assert(!this._host);
        Debug.assert(Jx.isHTMLElement(host));
        Debug.assert(Jx.isArray(keySources));

        _start("initialize");

        this._host = host;
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        this._host.innerHTML = Mail.Templates.calendarInviteArea();
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>

        this._keySources = keySources;

        _stop("initialize");
    };

    CalendarInviteArea.prototype.shutdown = function () {
        Debug.assert(this._host);

        _start("shutdown");

        if (this._eventsHooked) {
            // remove our keydown listeners.  our response button listeners will
            // be cleaned up when our ui is destroyed below.
            var that = this;

            this._keySources.forEach(function (keySource) {
                /// <param name="keySource" type="HTMLElement" />
                Debug.assert(Jx.isObject(keySource));
                keySource.removeEventListener("keydown", that._onKeyDown, false);
            });

            this._keySources = [];
            this._eventsHooked = false;
        }

        // destroy our ui
        this._host.innerHTML = "";

        // release references
        this._host = null;
        this._message = null;

        _stop("shutdown");
    };

    CalendarInviteArea.prototype.setMessage = function (message) {
        /// <param name="message" type="Mail.UIDataModel.MailMessage" />
        Debug.assert(message === null || Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));

        _start("setMessage");

        // hide a menu if we have one up
        this._hideMenu();

        // save the message.  we'll need it for responses.
        this._message = message;

        // We need to update our ui if these conditions are true:
        //   1.  the message is a calendar invite.
        //   2.  the message actually has a calendar event object.
        // We'll only show some of the UI if the following is true:
        //   a.  the message is junk or in the outgoing folder (drafts/sent items/outbox)
        if (Boolean(message) && message.calendarMessageType !== CalendarMessageType.none && message.calendarEvent) {
            Debug.Mail.log("CalendarInviteArea:setMessage for invitation with objectId " + this._message.objectId);

            // get the event
            var ev = /*@static_cast(Microsoft.WindowsLive.Platform.Calendar.Event)*/this._message.calendarEvent;

            //reset the flag to indicate the calendar has not been viewed for this event
            this._calendarViewed = false;

            var account = this._message.account.platformObject;

            // set our where and when text
            var when = this._host.querySelector(".calendarInviteWhenContent"),
                where = this._host.querySelector(".calendarInviteWhereContent");
            when.innerHTML = Jx.escapeHtml(Mail.Utilities.getCalendarEventTimeRange(account, ev));
            where.innerText = ev.location;

            // show or hide our recurrence icon appropriately
            this._setSelectorVisibility(".calendarInviteRecurrence", Boolean(ev.recurring));

            // in the junk and outbound folders, we don't want to show any buttons or status
            if (this._message.isJunk || this._message.isOutboundFolder) {
                this._setSelectorVisibility(".calendarInviteButtons,.calendarInviteStatus", false);
            } else {
                this._setSelectorVisibility(".calendarInviteButtons", true);

                // hook up our response buttons if they haven't been yet
                this._ensureButtonsHooked();

                // figure out which buttons to show
                var showRespondButtons = false,
                    showRemoveButton = false,
                    showInviteStatus = false;

                // if the event is canceled and we have it on our calendar, we need to show the remove button
                if (this._message.calendarMessageType === CalendarMessageType.cancelled) {
                    // always show the remove button for cancellations (like outlook)
                    showRemoveButton = true;
                } else if (this._message.calendarMessageType === CalendarMessageType.request) {

                    // Determine what status message to show (if any), and whether to
                    // display the respond buttons
                    var inviteStatusResId = resIdForMeetingMessageType[ev.meetingMessageType];

                    if (!inviteStatusResId) {
                        showRespondButtons = true;

                        if (!ev.responseRequested) {
                            inviteStatusResId = "mailInviteStatusNoResponse";
                        }
                    }

                    if (Jx.isNonEmptyString(inviteStatusResId)) {
                        var status = this._host.querySelector(".calendarInviteStatus");
                        var inviteStatusString = Jx.res.getString(inviteStatusResId);

                        if (Jx.isNonEmptyString(inviteStatusString)) {
                            status.innerText = inviteStatusString;
                            showInviteStatus = true;
                        }
                    }
                }

                // show the right buttons
                this._setSelectorVisibility(".calendarInviteAccept,.calendarInviteTentative,.calendarInviteDecline,.calendarInviteRespond", showRespondButtons);
                this._setSelectorVisibility(".calendarInviteRemove", showRemoveButton);
                this._setSelectorVisibility(".calendarInviteStatus", showInviteStatus);

                // adjust the appearance appropriately
                this._setSelectorClass(".calendarInviteButtons", "viewCalendarOnly", !(showRespondButtons || showRemoveButton));
            }

            this._host.classList.remove("hidden");
        }

        _stop("setMessage");
    };

    //
    // Private
    //

    CalendarInviteArea.prototype._getIdsCalendar = function () {
        if (!this._idsCalendar) {
            this._idsCalendar = Microsoft.WindowsLive.Instrumentation.Ids.Calendar;
        }

        return this._idsCalendar;
    };

    CalendarInviteArea.BiciResponseType = {
        Edit: 0,
        Send: 1,
        NoSend: 2
    };

    CalendarInviteArea.BiciResponse = {
        3: 0, //ResponseType.Accepted
        2: 1, //ResponseType.Tentative
        4: 2  //ResponseType.Declined
    };

    CalendarInviteArea.prototype._getRealEvent = function (account, ev) {
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount" />
        /// <param name="ev" type="Microsoft.WindowsLive.Platform.Calendar.Event" />
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));
        Debug.assert(Jx.isInstanceOf(ev, Microsoft.WindowsLive.Platform.Calendar.Event));

        // disallow lookups when the server hasn't told us the event type, since we can't guarantee that
        // we will do the right thing, and this is better than accidentally deleting something
        if (!ev.isEventTypeValid) {
            return null;
        }

        // try get the real event
        var platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/Mail.Globals.platform,
            realEv = platform.calendarManager.getEventFromUID(account, ev.uid);

        // if we have one, we might need to get a particular instance
        if (realEv) {
            var EventType = Microsoft.WindowsLive.Platform.Calendar.EventType,
                eventType = ev.eventType;

            // some servers have been observed to send event type single for deleting an instance of a
            // recurring event if the instance is not on the calendar.  So if the server indicates single,
            // check the type of the real event for compatibility.  Rather than assuming it meant instance,
            // we do nothing, to avoid potentially returning the wrong thing for deletion
            if (eventType === EventType.single && realEv.eventType !== EventType.single) {
                realEv = null;
            } else if (eventType === EventType.instanceOfSeries || eventType === EventType.exceptionToSeries) {
                // if the event is an instance or an exception, we need to get the occurrence
                try {
                    realEv = realEv.getOccurrence(ev.startDate);
                } catch (ex) {
                    // getOccurrence throws if the event doesn't exist.  it's
                    // not guaranteed to exist, since any sort of sync could
                    // have happened before this.
                    realEv = null;
                }
            }
        }

        return realEv;
    };

    CalendarInviteArea.prototype._ensureButtonsHooked = function () {
        if (!this._eventsHooked) {
            var accept = this._host.querySelector(".calendarInviteAccept"),
                tentative = this._host.querySelector(".calendarInviteTentative"),
                decline = this._host.querySelector(".calendarInviteDecline"),
                respond = this._host.querySelector(".calendarInviteRespond"),
                remove = this._host.querySelector(".calendarInviteRemove"),
                viewCalendar = this._host.querySelector(".calendarInviteViewCalendar");

            // create our invite-related callbacks
            this._onAccept = this._onAccept.bind(this);
            this._onTentative = this._onTentative.bind(this);
            this._onDecline = this._onDecline.bind(this);
            this._onRespond = this._onRespond.bind(this);
            this._onRemove = this._onRemove.bind(this);
            this._onViewCalendar = this._onViewCalendar.bind(this);

            // add those callbacks
            accept.addEventListener("click", this._onAccept, false);
            tentative.addEventListener("click", this._onTentative, false);
            decline.addEventListener("click", this._onDecline, false);
            respond.addEventListener("click", this._onRespond, false);
            remove.addEventListener("click", this._onRemove, false);
            viewCalendar.addEventListener("click", this._onViewCalendar, false);

            // bind our shortcut key handlers
            var that = this;
            this._onKeyDown = this._onKeyDown.bind(this);

            this._keySources.forEach(function (keySource) {
                /// <param name="keySource" type="HTMLElement" />
                Debug.assert(Jx.isObject(keySource));
                keySource.addEventListener("keydown", that._onKeyDown, false);
            });

            this._eventsHooked = true;
        }
    };

    CalendarInviteArea.prototype._setSelectorVisibility = function (selector, setVisible) {
        /// <param name="selector" type="String" />
        /// <param name="setVisible" type="Boolean" />
        Debug.assert(Jx.isString(selector));
        Debug.assert(Jx.isBoolean(setVisible));

        this._setSelectorClass(selector, "hidden", !setVisible);
    };

    CalendarInviteArea.prototype._setSelectorClass = function (selector, cls, fAdd) {
        /// <param name="selector" type="String" />
        /// <param name="cls" type="String" />
        /// <param name="fAdd" type="Boolean" />
        Debug.assert(Jx.isString(selector));
        Debug.assert(Jx.isString(cls));
        Debug.assert(Jx.isBoolean(fAdd));

        var els = this._host.querySelectorAll(selector);
        var length = els.length;

        for (var i = 0; i < length; i++) {
            Jx.setClass(els[i], cls, fAdd);
        }
    };

    CalendarInviteArea.prototype._hideMenu = function () {
        if (this._menu) {
            this._menu.hide();
            this._menu = null;
        }
    };

    CalendarInviteArea.prototype._showMenu = function (anchor, commands, label) {
        /// <param name="anchor" type="HTMLElement" />
        /// <param name="commands" type="Array" />
        Debug.assert(Jx.isHTMLElement(anchor));
        Debug.assert(Jx.isArray(commands));

        // hide any old menu we might have up
        this._hideMenu();

        // create the menu's host
        var host = document.createElement("div");
        host.id = "inviteResponseFlyout";
        host.setAttribute("aria-label", label);

        // create the host itself and make sure we clean up when it's hidden
        this._menu = new WinJS.UI.Menu(host, { commands: commands });
        this._menu.addEventListener("afterhide", function () {
            host.outerHTML = "";
            host = null;
        }, false);

        // add the host to the body and show the menu
        document.body.appendChild(host);
        this._menu.show(anchor, "auto", "center");
    };

    CalendarInviteArea.prototype._showResponseFlyout = function (anchor, response) {
        /// <param name="anchor" type="HTMLElement" />
        /// <param name="response" type="Microsoft.WindowsLive.Platform.Calendar.ResponseType" />
        Debug.assert(Jx.isHTMLElement(anchor));
        Debug.assert(Jx.isNumber(response) &&
             Object.keys(Microsoft.WindowsLive.Platform.Calendar.ResponseType).map(
             function (key) {
                 return Microsoft.WindowsLive.Platform.Calendar.ResponseType[key];
             }).indexOf(response) !== -1);

        this._showMenu(anchor,
            [{
                label: Jx.res.getString("EventEditBeforeSend"),
                onclick: this._editResponseBeforeSend.bind(this, response),
                id: "inviteEditResponseBeforeSendButton"
            },
            {
                label: Jx.res.getString("EventSendNow"),
                onclick: this._respondToInvite.bind(this, response, true),
                id: "inviteResponseSendButton"
            },
            {
                label: Jx.res.getString("EventDontSend"),
                onclick: this._respondToInvite.bind(this, response, false),
                id: "inviteResponseDontSendButton"
            }],
            Jx.res.getString("EventResponseOptions")
        );
    };

    CalendarInviteArea.prototype._onAccept = function (ev) {
        /// <param name="ev" type="Event"/>
        Debug.assert(ev instanceof Event);

        if (this._message.calendarEvent.responseRequested) {
            this._showResponseFlyout(ev.target, ResponseType.accepted);
        } else {
            this._respondToInvite(ResponseType.accepted, false);
        }
    };

    CalendarInviteArea.prototype._onTentative = function (ev) {
        /// <param name="ev" type="Event"/>
        Debug.assert(ev instanceof Event);

        if (this._message.calendarEvent.responseRequested) {
            this._showResponseFlyout(ev.target, ResponseType.tentative);
        } else {
            this._respondToInvite(ResponseType.tentative, false);
        }
    };

    CalendarInviteArea.prototype._onDecline = function (ev) {
        /// <param name="ev" type="Event"/>
        Debug.assert(ev instanceof Event);

        if (this._message.calendarEvent.responseRequested) {
            this._showResponseFlyout(ev.target, ResponseType.declined);
        } else {
            this._respondToInvite(ResponseType.declined, false);
        }
    };

    CalendarInviteArea.prototype._onRespond = function (ev) {
        /// <param name="ev" type="Event" />
        Debug.assert(ev instanceof Event);

        var anchor = ev.target;

        this._showMenu(anchor,
            [{
                label: Jx.res.getString("EventAccept"),
                onclick: this._onAccept.bind(this, ev)
            },
            {
                label: Jx.res.getString("EventTentative"),
                onclick: this._onTentative.bind(this, ev)
            },
            {
                label: Jx.res.getString("EventDecline"),
                onclick: this._onDecline.bind(this, ev)
            }],
            Jx.res.getString("EventRespond")
        );
    };

    CalendarInviteArea.prototype._onRemove = function () {
        _start("_onRemove");

        var account = this._message.account.platformObject;

        // delete the event
        var ev = /*@static_cast(Microsoft.WindowsLive.Platform.Calendar.Event)*/this._message.calendarEvent,
            realEv = this._getRealEvent(account, ev);

        // the event might have already been deleted
        if (realEv) {
            realEv.deleteObject();
        }

        // hide the remove button
        this._setSelectorVisibility(".calendarInviteRemove", false);

        this._selection.deleteItems([this._message]);

        _stop("_onRemove");
    };

    CalendarInviteArea.prototype._launchUri = function (uri) {
        /// <param name="uri" type="Windows.Foundation.Uri" />
        Debug.assert(Jx.isInstanceOf(uri, Windows.Foundation.Uri));
        Windows.System.Launcher.launchUriAsync(uri);
    };

    CalendarInviteArea.prototype._onViewCalendar = function () {
        _start("_onViewCalendar");

        var ev = /*@static_cast(Microsoft.WindowsLive.Platform.Calendar.Event)*/this._message.calendarEvent;
        Debug.assert(ev);

        var platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/Mail.Globals.platform,
            account = this._message.account.platformObject,
            manager = platform.calendarManager;

        this._calendarViewed = true;

        // if it's a recurring series, try to get a future event
        if (ev.eventType === Microsoft.WindowsLive.Platform.Calendar.EventType.series) {
            try {
                var realEv = manager.getEventFromUID(account, ev.uid),
                    nextEv = manager.getNextEvent(realEv.id);

                if (nextEv) {
                    ev = nextEv;
                }
            } catch (ex) {
                // this will fail if there's no event on our calendar.  this can
                // happen with certain providers for events that have not yet
                // been accepted.
            }
        }

        var uri = new Windows.Foundation.Uri("wlcalendar://focusEvent/?start=" + ev.startDate.getTime().toString() + "&end=" + ev.endDate.getTime().toString() + "&allDay=" + ev.allDayEvent.toString());
        this._launchUri(uri);

        _stop("_onViewCalendar");
    };


    CalendarInviteArea.prototype._editResponseBeforeSend = function (response) {
        /// <param name="response" type="Microsoft.WindowsLive.Platform.Calendar.ResponseType" />
        Debug.assert(Jx.isNumber(response) &&
            Object.keys(Microsoft.WindowsLive.Platform.Calendar.ResponseType).map(
            function (key) {
                return Microsoft.WindowsLive.Platform.Calendar.ResponseType[key];
            }).indexOf(response) !== -1, "Unexpected response type");

        Jx.bici.addToStream(this._getIdsCalendar().showCalendar, this._calendarViewed ? 1 : 0);
        Jx.bici.addToStream(
            this._getIdsCalendar().inviteResponse, 
            CalendarInviteArea.BiciResponse[response], 
            CalendarInviteArea.BiciResponseType.Edit, 
            0 /* EntryPointApp.Mail */
        );

        if (!this._message) {
            Jx.log.info("CalendarInviteArea._editResponseBeforeSend: Unable to respond to invite without message object");
            return;
        }

        Debug.Mail.log("_editResponseBeforeSend:Responding to invitation object ID: " + this._message.objectId);

        var ev = /*@static_cast(Microsoft.WindowsLive.Platform.Calendar.Event)*/this._message.calendarEvent,
            account = this._message.account.platformObject;

        if (!account) {
            var accountError = {
                message: "Unexpected lack of account when responding to invitation",
                number: UnexpectedErrorCode
            };
            Debug.assert(false, accountError.message);
            Jx.fault("CalendarInviteArea.js", "_editResponseBeforeSend", accountError);
        } else {
            var realEv = this._getRealEvent(account, ev);

            // ensure that the CalendarUtil library is available
            Mail.Utilities.ComposeHelper.ensureComposeFiles();

            // For accept and tentative, send meeting response, update event status, launch compose note, and delete orignial message afterwards.
            Compose.CalendarUtil.PreEditResponseActionsEx(ev, realEv, this._message.platformMailMessage, response, account);

            // Create compose note
            var composeUtil = Compose.util;
            var calendarAction = composeUtil.convertCalendarResponseToCalendarActionType(response);
            var composeAction = composeUtil.convertToComposeAction(calendarAction);
            var args = /*@static_cast(Compose.ActionParameters)*/{
                factorySpec: {
                    originalMessage: this._message.platformMailMessage,
                    originalEvent: realEv || ev,
                    calendarAction: calendarAction
                }
            };
            Mail.Utilities.ComposeHelper.launchCompose(composeAction, args, { startDirty: true, moveToDrafts: true });

            if (response !== ResponseType.declined) {
                // Move invite message to Deleted.
                Compose.CalendarUtil.MoveMessageToDeleted(this._message);
            }
        }

    };

    CalendarInviteArea.prototype._respondToInvite = function (response, sendResponse) {
        /// <param name="response" type="Microsoft.WindowsLive.Platform.Calendar.ResponseType" />
        /// <param name="sendResponse" type="Boolean">Indicates whether the user selected to send a response</param>
        Debug.assert(Jx.isNumber(response) &&
            Object.keys(Microsoft.WindowsLive.Platform.Calendar.ResponseType).map(
            function (key) {
                return Microsoft.WindowsLive.Platform.Calendar.ResponseType[key];
            }).indexOf(response) !== -1, "Unexpected response type");
        Debug.assert(Jx.isBoolean(sendResponse));

        Jx.bici.addToStream(this._getIdsCalendar().showCalendar, this._calendarViewed ? 1 : 0);
        Jx.bici.addToStream(
            this._getIdsCalendar().inviteResponse, 
            CalendarInviteArea.BiciResponse[response], 
            sendResponse ? CalendarInviteArea.BiciResponseType.Send : CalendarInviteArea.BiciResponseType.NoSend, 
            0 /* EntryPointApp.Mail */
        );

        if (!this._message) {
            Jx.log.info("CalendarInviteArea._respondToInvite: Unable to respond to invite without message object");
            return;
        }

        _start("_respondToInvite");

        Debug.Mail.log("CalendarInviteArea:Responding to invitation object ID: " + this._message.objectId);


        var ev = /*@static_cast(Microsoft.WindowsLive.Platform.Calendar.Event)*/this._message.calendarEvent,
            platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/Mail.Globals.platform,
            account = this._message.account.platformObject,
            message = /*@static_cast(Microsoft.WindowsLive.Platform.IMailMessage)*/null;

        if (!account) {
            var accountError = {
                message: "Unexpected lack of account when responding to invitation",
                number: UnexpectedErrorCode
            };
            Debug.assert(false, accountError.message);
            Jx.fault("CalendarInviteArea.js", "_respondToInvite", accountError);
        } else {

            // send the MeetingResponse first
            platform.invitesManager.sendMeetingResponse(ev, this._message.platformMailMessage, response, account);

            // if we have a real event, we can update it
            var realEv = this._getRealEvent(account, ev);

            if (realEv) {
                // delete the event if we declined
                if (response === ResponseType.declined) {
                    realEv.deleteObject();
                } else {
                    realEv.responseType = response;

                    // set the appropriate busy status for our response type
                    if (response === ResponseType.accepted) {
                        realEv.busyStatus = realEv.allDayEvent ? BusyStatus.free : BusyStatus.busy;
                    } else {
                        realEv.busyStatus = BusyStatus.tentative;
                    }

                    realEv.commit();
                }
            }

            var sendMailError = null;

            // if we need to send response email, do that
            if (sendResponse) {

                // Even if the user wanted to send a response, the organizer may not have requested one - so the message may be null.
                message = platform.invitesManager.createResponseMail(ev, this._message.platformMailMessage, response, account);

                if (message) {
                    if (Jx.isNonEmptyString(message.to)) {
                        message.moveToOutbox();
                        message.commit();
                    } else {
                        sendMailError = {
                            message: "Unable to send response mail since we did not have an email address",
                            number: MailSendAddressErrorCode
                        };
                    }
                } else if (ev.responseRequested) {
                    sendMailError = {
                        message: "Failed to get mail from platform even though a response was requested",
                        number: NoResponseMailErrorCode
                    };
                }
            }

            if (sendMailError) {
                Debug.assert(false, sendMailError.message);
                Jx.fault("CalendarInviteArea.js", "_respondToInvite", sendMailError);
            } else {
                // ensure that the CalendarUtil library is available
                Mail.Utilities.ComposeHelper.ensureComposeFiles();

                // Only delete the invite if we didn't have a problem sending the response, even though we don't have any user-visible error message
                Compose.CalendarUtil.MoveMessageToDeleted(this._message);
            }
        }

        _stop("_respondToInvite");
    };

    CalendarInviteArea.prototype._onKeyDown = function (ev) {
        /// <param name="ev" type="Event" />
        Debug.assert(!Jx.isNullOrUndefined(ev));

        _start("_onKeyDown");

        // most key presses will not involve the alt key
        if (ev.altKey && !ev.shiftKey && !ev.ctrlKey) {
            // the second cheapest check is whether or not we're in the reading pane
            var guiState = /*@static_cast(Mail.GUIState)*/Mail.guiState;

            if (guiState.isReadingPaneVisible) {
                // lastly ensure the type of message we're viewing is a calendar message
                if (Boolean(this._message) && this._message.calendarMessageType !== CalendarMessageType.none && this._message.calendarEvent) {
                    var anchorSelector = null,
                        response = null;

                    if (this._message.calendarMessageType === CalendarMessageType.request) {
                        // "alt+c" is accept
                        if (ev.key === "c") {
                            anchorSelector = ".calendarInviteAccept";
                            response = ResponseType.accepted;
                            // "alt+t" is tentative
                        } else if (ev.key === "t") {
                            anchorSelector = ".calendarInviteTentative";
                            response = ResponseType.tentative;
                            // "alt+d" is decline
                        } else if (ev.key === "d") {
                            anchorSelector = ".calendarInviteDecline";
                            response = ResponseType.declined;
                        }
                    }

                    //"ctrl+v" is view calendar. It can be accessed from any Calendar message type.
                    if (ev.key === "v") {
                        this._onViewCalendar();
                    }

                    // if we have a response type, we can show a flyout
                    if (response !== null) {
                        // if we're in narrow one pane mode, we have a different anchor
                        if (guiState.isOnePane && !guiState.isNavPaneWide) {
                            anchorSelector = ".calendarInviteRespond";
                        }

                        // get the anchor and show the flyout
                        var anchor = this._host.querySelector(anchorSelector);
                        this._showResponseFlyout(anchor, response);
                    }
                }
            }
        }

        _stop("_onKeyDown");
    };

    //
    // Members
    //

    CalendarInviteArea.prototype._host = /*@static_cast(HTMLElement)*/ null;
    CalendarInviteArea.prototype._menu = /*@static_cast(WinJS.UI.Menu)*/null;
    CalendarInviteArea.prototype._keySources = [];
    CalendarInviteArea.prototype._eventsHooked = false;
    CalendarInviteArea.prototype._message = /*@static_cast(Mail.UIDataModel.MailMessage)*/null;
    CalendarInviteArea.prototype._idsCalendar = null;

    //flag to indicate whether the calendar was viewed for the current event
    CalendarInviteArea.prototype._calendarViewed = false;

});