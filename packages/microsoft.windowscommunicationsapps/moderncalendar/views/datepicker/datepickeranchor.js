
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\common\Common.js" />

/*global Calendar,Jx*/

Jx.delayDefine(Calendar.Controls, "DatePickerAnchor", function () {

    //
    // Namespaces
    //

    var DatePickerAnchor = Calendar.Controls.DatePickerAnchor = {};

    //
    // functions to help with date picker anchors on day, week, and month views since
    // they wound up being able to be made the same in those 3 views
    //
    // these methods expect there to be a header element with structure similar to the following
    //  <div class='dateAnchor'>
    //      <div class='anchorText' role='heading'>View Title</div>
    //      <div class='dateChevron' aria-hidden='true'>&#xE099;</div>
    //  </div>
    //
    // when the anchor is active, it will have the activeAnchor class additionally applied to the
    // dateAnchor element.
    // click and interaction behaviors are up to the individual view to add, since they still vary,
    // but using the following methods can help keep the style rules consistent across them

    function _start(evt) { Jx.mark("Calendar:DatePickerAnchor." + evt + ",StartTA,Calendar"); }
    function _stop(evt) { Jx.mark("Calendar:DatePickerAnchor." + evt + ",StopTA,Calendar"); }

    DatePickerAnchor.applyHeaderText = function(headerEl, headerText) {
        /// <summary>sets the correct field in the header to the supplied text</summary>
        /// <param name="headerEl" type="DOMElement">element corresponding to the root of the 
        ///        item header (at least the dateAnchor element)</param>
        /// <param name="headerText" type="String">text to use for the display name, safely assigned 
        ///        using textContent</param>

        var itemName = headerEl.querySelector(".anchorText");
        itemName.firstChild.textContent = headerText;
    };

    DatePickerAnchor.isActiveDateAnchor = function (el) {
        /// <summary>determines whether the supplied element belongs in the currently active date anchor</summary>
        /// <param name="el" type="DOMElement">element assumed to be in a date anchor context</param>
        /// <returns type="Boolean">true if this is in an active date anchor, otherwise false</returns>

        var done   = false,
            active = false;

        while (!done && el) {
            if (el.classList.contains("activeAnchor")) {
                done = true;
                active = true;
            } else if (el.classList.contains("dateAnchor")) {
                done = true;
            }

            if (!done) {
                el = el.parentElement;
            }
        }

        return active;
    };

    DatePickerAnchor.updateDatePickerButton = function (timeline, data) {
        /// <summary>set the date picker chevron to be active for the current item, but inactive for other items</summary>
        /// <param name="timeline" type="Timeline">the timeline that controls item instantiation for
        ///        the view being updated</param>
        /// <param name="data" type="DOMElement">the currently focused item (as built from the html 
        ///        from _renderer of a timeline provider)</param>

        _start("updateDatePickerButton");

        var realized = timeline.getRealized(true);  // include cached items to catch ones that have scrolled off screen

        for (var i = 0, len = realized.length; i < len; ++i) {
            var item   = realized[i],
                anchor = item.el.querySelector(".anchorText"),
                da     = item.el.querySelector(".dateAnchor");

            if (anchor && da) {
                if (item === data) {
                    anchor.setAttribute("role", "button");
                    da.classList.add("activeAnchor");

                    // register event handlers for hover and active state
                    DatePickerAnchor._registerInteractiveHandlers(da);
                } else {
                    anchor.setAttribute("role", "heading");
                    da.classList.remove("activeAnchor");

                    // remove any registered event handlers for hover and active state
                    DatePickerAnchor._unregisterInteractiveHandlers(da);
                }
            }
        }

        _stop("updateDatePickerButton");
    };

    DatePickerAnchor.deactivateHeader = function (el) {
        /// <summary>configures a particular header to act as a simple header rather than an active button</summary>
        /// <param name="el" type="DOMElement">header element to change.  it should at least be at the level of the 
        ///        dateAnchor element, but can be higher if convenient</param>

        var itemName     = el.querySelector(".anchorText"),
            activeAnchor = el.querySelector(".activeAnchor"),
            da           = el.querySelector(".dateAnchor");

        itemName.setAttribute("role", "heading");
        if (activeAnchor) {
            activeAnchor.classList.remove("activeAnchor");

            // remove any registered event handlers for hover and active state
            DatePickerAnchor._unregisterInteractiveHandlers(da);
        }
    };

    DatePickerAnchor._registerInteractiveHandlers = function (el) {
        /// <summary>adds handlers to the element for hover and active states if needed</summary>
        /// <param name="el" type="DOMElement">header element to register on</param>

        // does it already have handlers?
        var anchorHandlers = el._anchorHandlers,
            anchorEl        = el;

        if (!anchorHandlers) {
            anchorHandlers = {};
            anchorEl._anchorHandlers = anchorHandlers;

            anchorHandlers.onMouseOver = function (ev) {
                _start("onMouseOver");
                if (anchorEl) {
                    anchorEl.classList.add("hover");
                }
                ev.stopPropagation();
                ev.preventDefault();
                _stop("onMouseOver");
            };

            anchorHandlers.onMouseOut = function (ev) {
                _start("onMouseOut");
                if (anchorEl) {
                    var cl = anchorEl.classList;
                    cl.remove("hover");
                    cl.remove("active");
                }
                ev.stopPropagation();
                ev.preventDefault();
                _stop("onMouseOut");
            };

            anchorHandlers.onMouseDown = function (ev) {
                _start("onMouseDown");
                if (anchorEl) {
                    anchorEl.classList.add("active");
                }
                ev.stopPropagation();
                ev.preventDefault();
                _stop("onMouseDown");
            };

            anchorHandlers.onMouseUp = function (ev) {
                _start("onMouseUp");
                if (anchorEl) {
                    anchorEl.classList.remove("active");
                }
                ev.stopPropagation();
                ev.preventDefault();
                _stop("onMouseUp");
            };

            anchorHandlers.onMouseClick = function () {
                _start("onMouseClick");
                if (anchorEl) {
                    var cl = anchorEl.classList;
                    cl.remove("active");
                    cl.remove("hover");
                }
                _stop("onMouseClick");

                // allow propagation to the centralized handler on each view
            };

            anchorEl.addEventListener("mouseover", anchorHandlers.onMouseOver);
            anchorEl.addEventListener("mouseout", anchorHandlers.onMouseOut);
            anchorEl.addEventListener("mousedown", anchorHandlers.onMouseDown);
            anchorEl.addEventListener("mouseup", anchorHandlers.onMouseUp);
            anchorEl.addEventListener("click", anchorHandlers.onMouseClick);
        }
    };

    DatePickerAnchor._unregisterInteractiveHandlers = function (el) {
        /// <summary>removes handlers from the element for hover and active states if present</summary>
        /// <param name="el" type="DOMElement">header element to remove from</param>

        // does it have handlers?
        var anchorHandlers = el._anchorHandlers,
            anchorEl = el;

        if (anchorHandlers) {
            anchorEl._anchorHandlers = null;

            anchorEl.removeEventListener("mouseover", anchorHandlers.onMouseOver);
            anchorEl.removeEventListener("mouseout", anchorHandlers.onMouseOut);
            anchorEl.removeEventListener("mousedown", anchorHandlers.onMouseDown);
            anchorEl.removeEventListener("mouseup", anchorHandlers.onMouseUp);
            anchorEl.removeEventListener("click", anchorHandlers.onMouseClick);
        }
    };

});

