
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail, Jx, Debug, Windows, Microsoft, People, WinJS, requestAnimationFrame, MenuArrowKeyHandler*/

Jx.delayDefine(Mail, "HeaderControl", function () {
    "use strict";

    function createIC(person, selection) {
        /// <param name="person" type="Microsoft.WindowsLive.Platform.IRecipient" />
        Debug.assert(Jx.isInstanceOf(person, Microsoft.WindowsLive.Platform.Recipient));
        Debug.assert(Jx.isObject(selection), 'Jx.isObject(selection)');

        Debug.Mail.writeProfilerMark("HeaderControl.createIC", Mail.LogEvent.start);
        var ic = new People.IdentityControl(person, null, {
            getTooltip: function (recipient, defaultTooltip) {
                /// <param name="recipient" type="Microsoft.WindowsLive.Platform.IRecipient" />
                /// <param name="defaultTooltip" type="String" />
                Debug.assert(Jx.isInstanceOf(recipient, Microsoft.WindowsLive.Platform.Recipient));
                Debug.assert(Jx.isNonEmptyString(defaultTooltip));

                if (Jx.isNonEmptyString(recipient.emailAddress) && (defaultTooltip.indexOf(recipient.emailAddress) === -1)) {
                    return defaultTooltip + "\n" + recipient.emailAddress;
                }

                return defaultTooltip;
            },
            onClick: function (recipient, node) {
                Debug.assert(Jx.isObject(People), "The shared People code should have been loaded by the hosting app.");
                Debug.assert(Jx.isObject(People.ContactCard));
                
                People.ContactCard.show(recipient.person, node, selection.account);
            },
            role: "option"
        });
        Debug.Mail.writeProfilerMark("HeaderControl.createIC", Mail.LogEvent.stop);
        return ic;
    }


    Mail.HeaderControl = function (selection) {
        this._selection = selection;
        this._host = null;
        this._addedUIListeners = false;
        this._onHeaderResize = this._onHeaderResize.bind(this);
        this._toggleExpandHeaders = this._toggleExpandHeaders.bind(this);
        this._jobSet = Jx.scheduler.createJobSet();
        this._addICJobSet = Jx.scheduler.createJobSet(this._jobSet);
        this._cleanupICJobSet = Jx.scheduler.createJobSet(this._jobSet);
        this._identityControls = [];
        this._arrowKeyHandlers = [];

        this._preventHeaderCollapse = false;
        this._headersExpanded = false;
        this._isOverflowDetected = false;
        this._detectOverflowAnimationFrameId = null;
        this._removeICTabStopsAnimationId = null;
        this._irmFlyout = null;
        this._detectOverflowSync = this._detectOverflowSync.bind(this);
        this._removeHiddenICTabStopsSync = this._removeHiddenICTabStopsSync.bind(this);
        this._onIrmClick = this._onIrmClick.bind(this);
        this._onIrmKeyDown = this._onIrmKeyDown.bind(this);

        this._isArm = Windows.ApplicationModel.Package.current.id.architecture === Windows.System.ProcessorArchitecture.arm;
    };

    Mail.HeaderControl.prototype.initialize = function (host) {
        /// <param name="host" type="HTMLElement" />
        Debug.assert(this._host === null, "Why are we initializing HeaderControl twice?");

        this._host = host;
        this._host.innerHTML = Mail.Templates.readingPaneHeader();

        // Create and initialize the arrow key handlers
        var headerMappings = Mail.HeaderControl.expandableHeaderElements;
        for (var ii = 0, iiMax = headerMappings.length; ii < iiMax; ii++) {
            var arrowKeyHandler = new MenuArrowKeyHandler(this._host.querySelector(headerMappings[ii].content),
                { querySelector: "span", firstOnFocus: true, enableUp: false, enableDown: false });
            arrowKeyHandler.activateUI();
            this._arrowKeyHandlers[ii] = arrowKeyHandler;
        }

        // Insert "on behalf of" alternative from UX
        var calendarFromHtml = Jx.res.loadCompoundString("mailReadingPaneOnBehalf", '<span class="mailReadingPaneBehalfSender"></span>', '<span class="mailReadingPaneBehalfFrom"></span>');
        this._host.querySelector(".mailReadingPaneBehalfArea").innerHTML = calendarFromHtml;
    };

    Mail.HeaderControl.prototype.dispose = function () {
        Mail.writeProfilerMark("HeaderControl.dispose", Mail.LogEvent.start);

        // Any pending overflow animation frame needs to be canceled to prevent
        // it from referencing this._host after it has been nulled
        if (Jx.isNumber(this._detectOverflowAnimationFrameId)) {
            window.cancelAnimationFrame(this._detectOverflowAnimationFrameId);
            this._detectOverflowAnimationFrameId = null;
        }

        if (this._addedUIListeners) {
            this._host.querySelector(".mailReadingPaneHeaderDetails").removeEventListener("mselementresize", this._onHeaderResize, false);
            this._host.querySelector(".mailReadingPaneExpandHeadersButton").removeEventListener("click", this._toggleExpandHeaders, false);
        }

        // Dispose the arrow key handlers
        var headerMappings = Mail.HeaderControl.expandableHeaderElements;
        for (var ii = 0, iiMax = headerMappings.length; ii < iiMax; ii++) {
            var arrowKeyHandler = this._arrowKeyHandlers[ii];
            if (arrowKeyHandler) {
                arrowKeyHandler.dispose();
            }
            this._arrowKeyHandlers[ii] = null;
        }

        this._cleanupICJobSet.runSynchronous();
        Jx.dispose(this._jobSet);
        this._jobSet = null;

        this._identityControls.forEach(function (value) {
            /// <param name="value" type="People.IdentityControl" />
            Debug.assert(Jx.isInstanceOf(value, People.IdentityControl));
            value.shutdownUI();
        });
        this._identityControls = null;
        this._cancelPendingRemoveICTabStops();

        if (!Jx.isNullOrUndefined(this._irmFlyout)) {
            this._host.querySelector(".mailReadingPaneIrmInfo").removeEventListener("click", this._onIrmClick, false);
            this._host.querySelector(".mailReadingPaneIrmInfo").removeEventListener("keydown", this._onIrmKeyDown, false);
            this._irmFlyout.hide();
            this._irmFlyout = null;
        }
        this._host = null;
        Mail.writeProfilerMark("HeaderControl.dispose", Mail.LogEvent.stop);
    };

    Mail.HeaderControl.prototype.isExpanded = function () {
        return this._headersExpanded;
    };

    Mail.HeaderControl.prototype._ensureUIListeners = function () {
        if (!this._addedUIListeners) {
            this._host.querySelector(".mailReadingPaneHeaderDetails").addEventListener("mselementresize", this._onHeaderResize, false);
            this._host.querySelector(".mailReadingPaneExpandHeadersButton").addEventListener("click", this._toggleExpandHeaders, false);

            this._addedUIListeners = true;
        }
    };

    Mail.HeaderControl.prototype._onHeaderResize = function () {
        Mail.writeProfilerMark("HeaderControl._onSizeChange", Mail.LogEvent.start);

        this._isOverflowDetected = false;   // reset whether we've detected overflow
        this._detectOverflow();
        this._removeHiddenICTabStops();  // When resizing, it's likely that more headers have become hidden, so we'll need to update the tab stops.

        Mail.writeProfilerMark("HeaderControl._onSizeChange", Mail.LogEvent.stop);
    };

    var maxICsLoadedSynchronously = null;
    Mail.HeaderControl.prototype._updateHeaderICField = function (wrapperElementSelector, contentElementSelector, people, userTileElementSelector) {
        /// <param name="wrapperElementSelector" type="String" mayBeNull="true">Selector of the wrapper element for the whole area</param>
        /// <param name="contentElementSelector" type="String">Selector of the content element that directly contains the ICs</param>
        /// <param name="people" type="Array">array of IRecipient</param>
        /// <param name="userTileElementSelector" type="String" optional="true">Selector for the user tile</param>

        Mail.writeProfilerMark("HeaderControl._updateHeaderICField", Mail.LogEvent.start);
        Debug.assert(wrapperElementSelector === null || Jx.isNonEmptyString(wrapperElementSelector));
        Debug.assert(Jx.isNonEmptyString(contentElementSelector));
        Debug.assert(Jx.isArray(people));
        Debug.assert(Jx.isNullOrUndefined(userTileElementSelector) || Jx.isNonEmptyString(userTileElementSelector));

        if (people.length === 0) {
            if (Jx.isNonEmptyString(wrapperElementSelector)) {
                this._hideElement(wrapperElementSelector);
            }
            this._hideElement(contentElementSelector).innerHTML = "";
        } else {
            if (Jx.isNonEmptyString(wrapperElementSelector)) {
                this._showElement(wrapperElementSelector);
            }

            Mail.writeProfilerMark("HeaderControl._updateHeaderICField - createIC", Mail.LogEvent.start);
            // make a list of ICs for every person
            var icList = people.map(function (person) {
                return createIC(person, this._selection);
            }, this);
            Mail.writeProfilerMark("HeaderControl._updateHeaderICField - createIC", Mail.LogEvent.stop);

            if (Jx.isNonEmptyString(userTileElementSelector) && (icList.length === 1)) {
                Mail.writeProfilerMark("HeaderControl._updateHeaderICField - set user tile element", Mail.LogEvent.start);
                var userTileElement = this._showElement(userTileElementSelector),
                    userTileIC = icList[0];
                Debug.assert(Jx.isInstanceOf(userTileIC, People.IdentityControl));

                userTileElement.innerHTML = userTileIC.getUI(People.IdentityElements.Tile, {
                    collapse: true, /* collapse the usertile area if there is no image to display*/
                    size: 80,
                    statusIndicator: null,
                    tabIndex: -1,
                    className: "mailReadingPaneUserTileIC"
                });
                Mail.writeProfilerMark("HeaderControl._updateHeaderICField - set user tile element", Mail.LogEvent.stop);
            }

            Mail.writeProfilerMark("HeaderControl._updateHeaderICField - IC getUI", Mail.LogEvent.start);
            // add the ICs html to the content element (and separate with "; ")
            this._showElement(contentElementSelector).innerHTML = icList.map(function (ic) {
                /// <param name="ic" type="People.IdentityControl" />
                Debug.assert(Jx.isInstanceOf(ic, People.IdentityControl));
                return ic.getUI(People.IdentityElements.Name, { className: "mailReadingPaneHeaderIC" });
            }).join("; ");
            Mail.writeProfilerMark("HeaderControl._updateHeaderICField - IC getUI", Mail.LogEvent.stop);

            Mail.writeProfilerMark("HeaderControl._updateHeaderICField - IC activateUI", Mail.LogEvent.start);
            if (!Jx.isValidNumber(maxICsLoadedSynchronously)) {
                maxICsLoadedSynchronously = this._isArm ? 2 : 10;
            }
            Debug.assert(Jx.isValidNumber(maxICsLoadedSynchronously));

            for (var ii = 0, iiMax = Math.min(icList.length, maxICsLoadedSynchronously); ii < iiMax; ii++) {
                this._activateNextIC(icList);
            }

            // If we still have remaining ICs left to activate
            if (icList.length > 0) {
                Jx.scheduler.addJob(this._addICJobSet,
                    Mail.Priority.addOverflowReadingPaneICs,
                    "add overflow reading pane ICs",
                    this._activateNextIC,
                    this,
                    [icList]
                );
            }
            Mail.writeProfilerMark("HeaderControl._updateHeaderICField - IC activateUI", Mail.LogEvent.stop);
        }
        Mail.writeProfilerMark("HeaderControl._updateHeaderICField", Mail.LogEvent.stop);
    };

    Mail.HeaderControl.prototype._activateNextIC = function (icArray) {
        /// <param name="icArray" type="Array" />
        Debug.assert(Jx.isArray(icArray));
        Debug.assert(icArray.length > 0);
        Mail.writeProfilerMark("HeaderControl._activateNextIC", Mail.LogEvent.start);
        var ic =  icArray.shift();
        ic.activateUI();
        this._identityControls.push(ic);
        var remaining = icArray.length;
        // Every once in a while, we should detect overflow just in case there wasn't overflow before but there is now.
        if (remaining % (maxICsLoadedSynchronously * 2) === 0) {
            this._detectOverflow();
        }
        Mail.writeProfilerMark("HeaderControl._activateNextIC", Mail.LogEvent.stop);
        return Jx.Scheduler.repeat(remaining !== 0);   // hasMoreWork
    };

    Mail.HeaderControl.prototype.updateHeader = function (to, cc, bcc, from, noRecipientsString, autoExpand, preventCollapse, isSent, sender) {
        /// <param name="to" type="Array">array of IRecipient</param>
        /// <param name="cc" type="Array">array of IRecipient</param>
        /// <param name="bcc" type="Array">array of IRecipient</param>
        /// <param name="from" type="Array">array of IRecipient</param>
        /// <param name="noRecipientsString" type="String">string to display when there is nobody on the from line</param>
        /// <param name="autoExpand" type="Boolean">whether this message should automatically expand truncated header lines or not</param>
        /// <param name="preventCollapse" type="Boolean">whether this message should allow the user to collapse expanded header lines</param>
        /// <param name="isSent" type="Boolean">whether this represents a sent message or not</param>
        /// <param name="sender" type="Microsoft.WindowsLive.Platform.IRecipient" optional="true">the actual sender in a "sent on behalf of" scenario</param>
        Mail.log("ReadingPane_updateHeader", Mail.LogEvent.start);

        this._preventHeaderCollapse = preventCollapse;

        // Now that we have actual content, make sure the listeners are set up
        this._ensureUIListeners();

        if (this._identityControls.length > 0) {
            // If we're still making ICs, stop.
            this._addICJobSet.cancelJobs();
            // And then queue a job to remove the ones we've got.
            Jx.scheduler.addJob(this._cleanupICJobSet,
                Mail.Priority.cleanupOldReadingPaneICs,
                "clean up reading pane ICs",
                function (controls) {
                    /// <param name="controls" type="Array" />
                    Debug.assert(Jx.isArray(controls));
                    Debug.assert(controls.length > 0);
                    Debug.Mail.log("ReadingPane_updateHeader.shutdownICs", Mail.LogEvent.start);
                    var ic = controls.shift();
                    ic.shutdownUI();
                    Debug.Mail.log("ReadingPane_updateHeader.shutdownICs", Mail.LogEvent.stop);
                    return Jx.Scheduler.repeat(controls.length !== 0);   // hasMoreWork
                },
                this,
                [this._identityControls]
            );
            this._identityControls = [];
        }

        Mail.writeProfilerMark("ReadingPane_updateHeader.headerRecipients", Mail.LogEvent.start);
        if (from.length < 1) {
            var fromElement = this._showElement(".mailReadingPaneSingleFrom");
            fromElement.innerText = noRecipientsString;
            this._hideElement(".mailReadingPaneUserTile");
        } else {
            // Check to see whether the mail had a "sender" field indicating that the "from" field wasn't the actual sender
            // In the sent items folder we perform additional checks before displaying "on behalf of"
            // This is a work around for a "by-design" Exchange behavior where it is populating "from" and "sender" values on sent mail (Windows Blue Bugs - 141866)
            var displayBehalfArea = Jx.isObject(sender);
            if (displayBehalfArea && isSent) {
                // Check the From and Sender fields to see if they're both associated with the current account.  
                // If so, the current account sent the mail and we don't need to display "on behalf of".

                /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
                var account = Mail.Globals.appState.selectedAccount,
                /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
                    accountEmailList = account ? account.allEmailAddresses : [],
                    fromEmail = from.length > 0 ? from[0].emailAddress.toUpperCase() : "",
                    senderEmail = sender.emailAddress.toUpperCase(),
                    fromEmailIsThisAccount = false,
                    senderEmailIsThisAccount = false;

                for (var i = 0, len = accountEmailList.length; (i < len) && (!fromEmailIsThisAccount || !senderEmailIsThisAccount) ; i++) {
                    var accountEmail = accountEmailList[i].toUpperCase();
                    fromEmailIsThisAccount = fromEmailIsThisAccount || (fromEmail === accountEmail);
                    senderEmailIsThisAccount = senderEmailIsThisAccount || (senderEmail === accountEmail);
                }

                // Display "on behalf of" if at least one email is not associated with this account
                displayBehalfArea = !fromEmailIsThisAccount || !senderEmailIsThisAccount;
            }

            if (displayBehalfArea) {
                // Replace the single from IC with the "on behalf of" UI
                this._hideElement(".mailReadingPaneSingleFrom");
                this._showElement(".mailReadingPaneBehalfArea");
                // first param hides/shows the field, we've already taken care of that.
                this._updateHeaderICField(null, ".mailReadingPaneBehalfFrom", from, ".mailReadingPaneUserTile");
                this._updateHeaderICField(null, ".mailReadingPaneBehalfSender", [sender]);
            } else {
                this._updateHeaderICField(null, ".mailReadingPaneSingleFrom", from, ".mailReadingPaneUserTile");
            }
        }
        Mail.writeProfilerMark("ReadingPane_updateHeader.headerRecipients", Mail.LogEvent.stop);

        Mail.writeProfilerMark("ReadingPane_updateHeader.ICFields", Mail.LogEvent.start);
                
        // Check to see if there are any recipients. If not show the "to" field with an indicator rather than hiding everything
        this._getElementAndSetVisibility(".mailReadingPaneNoRecipients", (to.length + cc.length + bcc.length === 0));
        this._updateHeaderICField(".mailReadingPaneTo", ".mailReadingPaneToContent", to);
        this._updateHeaderICField(".mailReadingPaneCC", ".mailReadingPaneCCContent", cc);
        this._updateHeaderICField(".mailReadingPaneBcc", ".mailReadingPaneBccContent", bcc);

        Mail.writeProfilerMark("ReadingPane_updateHeader.ICFields", Mail.LogEvent.stop);

        // We typically automatically collapse for inbound messages and expand for outbound messages.
        this._expandHeaders(autoExpand);
        this._setOverflowDetected(false);
        this._detectOverflow();

        Mail.log("ReadingPane_updateHeader", Mail.LogEvent.stop);
    };

    Mail.HeaderControl.prototype.updateDateTime = function (dateString, timeString) {
        /// <param name="dateString" type="String">a string describing the current date</param>
        /// <param name="timeString" type="String" optional="true">a string describing the current time</param>
        Mail.writeProfilerMark("ReadingPane_updateHeader.simpleContent", Mail.LogEvent.start);
        Debug.assert(Jx.isNonEmptyString(dateString));
        this._showElement(".mailReadingPaneDateContent").innerText = dateString;
        if (Jx.isNonEmptyString(timeString)) {
            this._showElement(".mailReadingPaneTimeContent").innerText = timeString;
        } else {
            Debug.assert(Jx.isNullOrUndefined(timeString));
            this._hideElement(".mailReadingPaneTimeContent");
        }
        Mail.writeProfilerMark("ReadingPane_updateHeader.simpleContent", Mail.LogEvent.stop);
    };

    Mail.HeaderControl.prototype.updateIrmInfo = function (hasTemplate, templateName, templateDescription) {
        /// <param name="hasTemplate" type="Boolean">whether or not the represented message has an irm template</param>
        /// <param name="templateName" type="String" optional="true">the name of the represented message's irm template, if appropriate</param>
        /// <param name="templateDescription" type="String" optional="true">a description of the represented message's selected irm template</param>
        if (hasTemplate) {
            if (Jx.isNullOrUndefined(this._irmFlyout)) {
                this._irmFlyout = new WinJS.UI.Flyout(this._getElementAndSetVisibility(".mailReadingPaneIrmFlyout", true));
                this._host.querySelector(".mailReadingPaneIrmInfo").addEventListener("click", this._onIrmClick, false);
                this._host.querySelector(".mailReadingPaneIrmInfo").addEventListener("keydown", this._onIrmKeyDown, false);
            }

            this._showElement(".mailReadingPaneIrmInfo").innerText = templateName;
            this._host.querySelector(".mailReadingPaneIrmDescription").innerText = templateDescription;
            this._host.querySelector(".mailReadingPaneIrmFlyout").setAttribute("aria-label", templateDescription);
        } else {
            this._hideElement(".mailReadingPaneIrmInfo");
        }
    };

    Mail.HeaderControl.prototype._onIrmClick = function () {
        Debug.assert(!Jx.isNullOrUndefined(this._irmFlyout));
        this._irmFlyout.show(this._host.querySelector(".mailReadingPaneIrmInfo")/*anchor*/, "bottom", "left");
    };

    Mail.HeaderControl.prototype._onIrmKeyDown = function (ev) {
        /// <param name="ev" type="Event"/>
        if (ev.keyCode === Jx.KeyCode.enter || ev.keyCode === Jx.KeyCode.space) {
            this._onIrmClick();
        }
    };

    Mail.HeaderControl.prototype._cancelPendingRemoveICTabStops = function () {
        if (Jx.isNumber(this._removeICTabStopsAnimationId)) {
            window.cancelAnimationFrame(this._removeICTabStopsAnimationId);
            this._removeICTabStopsAnimationId = null;
        }
    };

    Mail.HeaderControl.prototype._removeHiddenICTabStops = function () {
        this._cancelPendingRemoveICTabStops();
        this._removeICTabStopsAnimationId = requestAnimationFrame(this._removeHiddenICTabStopsSync);
    };

    Mail.HeaderControl.expandableHeaderElements = [
        { root: ".mailReadingPaneTo", content: ".mailReadingPaneToContent" },
        { root: ".mailReadingPaneCC", content: ".mailReadingPaneCCContent" },
        { root: ".mailReadingPaneBcc", content: ".mailReadingPaneBccContent" }
    ];

    Mail.HeaderControl.prototype._removeHiddenICTabStopsSync = function () {
        Mail.writeProfilerMark("HeaderControl._removeHiddenICTabStopsSync", Mail.LogEvent.start);
        Debug.assert(Jx.isNumber(this._removeICTabStopsAnimationId));
        this._removeICTabStopsAnimationId = null;
        var removeHiddenTabStops = function (element, arrowKeyHandler) {
            /// <param name="element" type="HTMLElement" />
            /// <param name="arrowKeyHandler" type="MenuArrowKeyHandler" />
            Debug.assert(Jx.isHTMLElement(element));
            Debug.assert(!Jx.isNullOrUndefined(arrowKeyHandler));
            var elementList = element.querySelectorAll("span");
            for (var i = 0, iMax = elementList.length; i < iMax; i++) {
                var identityControl = elementList[i];
                if (identityControl.offsetWidth === 0) {
                    // Any elements that are hidden due to overflow have 0 width.
                    identityControl.tabIndex = -1;
                } else {
                    arrowKeyHandler.pushElement(identityControl);
                    if (i === 0) {
                        // We want the first IC to be accessible with tab so set tabIndex to 0
                        identityControl.tabIndex = 0;
                    }
                }
            }
        };

        var headerMappings = Mail.HeaderControl.expandableHeaderElements;
        for (var ii = 0, iiMax = headerMappings.length; ii < iiMax; ii++) {
            this._arrowKeyHandlers[ii].reset();
            removeHiddenTabStops(this._host.querySelector(headerMappings[ii].content), this._arrowKeyHandlers[ii]);
        }
        Mail.writeProfilerMark("HeaderControl._removeHiddenICTabStopsSync", Mail.LogEvent.stop);
    };

    Mail.HeaderControl.prototype._detectOverflow = function () {
        Mail.writeProfilerMark("HeaderControl._detectOverflow", Mail.LogEvent.start);
        if (Jx.isNumber(this._detectOverflowAnimationFrameId)) {
            window.cancelAnimationFrame(this._detectOverflowAnimationFrameId);
        }
        this._detectOverflowAnimationFrameId = window.requestAnimationFrame(this._detectOverflowSync);
        Mail.writeProfilerMark("HeaderControl._detectOverflow", Mail.LogEvent.stop);
    };

    Mail.HeaderControl.prototype._detectOverflowSync = function () {
        Mail.log("ReadingPane_computeHeaderOverflows", Mail.LogEvent.start);

        this._detectOverflowAnimationFrameId = null;

        Debug.assert(Jx.isBoolean(this._preventHeaderCollapse));
        Debug.assert(Jx.isBoolean(this._headersExpanded));

        var overflowDetected = this._isOverflowDetected;

        // For outbound messages, we always display everything, so we don't need to do anything here but hide the button
        if (this._preventHeaderCollapse) {
            overflowDetected = false;
        } else if (this._headersExpanded) {
            // If the headers are already expanded, we can't detect overflow properly.  But we shouldn't have to, there must have been overflow and the user choose to expand it.
            overflowDetected = true;
        } else if (!overflowDetected) { // Only if we haven't already detected overflow
            var headerMappings = Mail.HeaderControl.expandableHeaderElements,
                lastOverflowingLine = 0; // We need to determine which of the lines is the lowest
                                         // overflowing line so we can position the overflow button next to it
            // Compute whether we need to hide the headers or not.
            for (var ii = 0, iiMax = headerMappings.length; ii < iiMax; ++ii) {
                var headerMapping = headerMappings[ii],
                /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
                   rootSelector = headerMapping.root,
                   contentSelector = headerMapping.content;
                /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>

                var contentElement = this._host.querySelector(contentSelector),
                    numChildNodes = contentElement.childNodes.length;
                if (numChildNodes > 1) { // Prevent a single long email address from causing overflow.
                    var rootElement = this._host.querySelector(rootSelector);

                    if (rootElement.scrollWidth > rootElement.offsetWidth) { // Does this element overflow?
                        overflowDetected = true;
                        lastOverflowingLine = ii + 1; // We want this variable one-indexed
                    }
                }
            }

            // The overflow button needs to be positioned next to the last overflowing line
            if (overflowDetected) {
                var expandHeadersButton = this._host.querySelector(".mailReadingPaneExpandHeadersButton");
                expandHeadersButton.style.msGridRowSpan = String(lastOverflowingLine); // The glyph is bottom-aligned, so just span to the last overflowing line and stop there
            }
        }

        this._setOverflowDetected(overflowDetected);
        Mail.log("ReadingPane_computeHeaderOverflows", Mail.LogEvent.stop);
    };

    Mail.HeaderControl.prototype._setOverflowDetected = function (overflowDetected) {
        /// <param name="overflowDetected" type="Boolean" />
        Debug.assert(Jx.isBoolean(overflowDetected));

        this._getElementAndSetVisibility(".mailReadingPaneExpandHeadersButton", overflowDetected);

        if (overflowDetected !== this._isOverflowDetected) {
            Debug.Mail.writeProfilerMark("HeaderControl._setOverflowDetected - using: " + overflowDetected.toString());
            this._isOverflowDetected = overflowDetected;

            if (overflowDetected) {
                this._removeHiddenICTabStops();
            }
        }
    };

    Mail.HeaderControl.prototype._toggleExpandHeaders = function () {
        this._expandHeaders(!this._headersExpanded);
    };

    Mail.HeaderControl.prototype._expandHeaders = function (expanded) {
        /// <param name="expanded" type="Boolean">true for expanded, false for collapsed</param>
        Debug.assert(Jx.isBoolean(expanded));
        Mail.writeProfilerMark("HeaderControl._expandHeaders", Mail.LogEvent.start);

        this._headersExpanded = expanded;
        // E098 and E099 are Down/Up Chevrons.
        this._host.querySelector(".mailReadingPaneExpandHeadersButtonLabel").innerHTML = "&nbsp;" + (expanded ? "&#xE098;" : "&#xE099;");

        // update the ariaLabel
        var ariaLabel = (expanded) ? Jx.res.getString("mailReadingPaneHideRecipientsAriaLabel") : Jx.res.getString("mailReadingPaneShowAllRecipientsAriaLabel"),
            expandButton = this._host.querySelector(".mailReadingPaneExpandHeadersButton");
        Debug.assert(Jx.isNonEmptyString(ariaLabel));
        Mail.setAttribute(expandButton, "aria-label", ariaLabel);
        Mail.setAttribute(expandButton, "aria-expanded", expanded.toString());

        var expandedHeaderStyle = "mailReadingPaneExpandedHeader";

        var headerMappings = Mail.HeaderControl.expandableHeaderElements;
        for (var ii = 0, iiMax = headerMappings.length; ii < iiMax; ++ii) {
            var element = this._host.querySelector(headerMappings[ii].root);

            if (expanded) {
                element.classList.add(expandedHeaderStyle);
            } else {
                element.classList.remove(expandedHeaderStyle);
            }
        }

        this._removeHiddenICTabStops();

        Mail.writeProfilerMark("HeaderControl._expandHeaders", Mail.LogEvent.stop);
    };

    Mail.HeaderControl.prototype._showElement = function (selector) {
        return this._getElementAndSetVisibility(selector, true);
    };

    Mail.HeaderControl.prototype._hideElement = function (selector) {
        return this._getElementAndSetVisibility(selector, false);
    };

    Mail.HeaderControl.prototype._getElementAndSetVisibility = function (selector, fShow) {
        var element = this._host.querySelector(selector);
        Debug.assert(this._host.querySelectorAll(selector).length === 1);
        Jx.setClass(element, "hidden", !fShow);
        return element;
    };
});
