
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\views\datepicker\DatePickerAnchor.js" />

/*jshint browser:true*/
/*global Tx,Calendar,runSync*/

(function() {
    var host;

    var DatePickerAnchor = Calendar.Controls.DatePickerAnchor;

    function setup() {
        host = document.getElementById("host");
    }
 
    function cleanup() {
        host.innerText = "";
        host = null;
    }

    function makeUniqueHeaderHtml(id) {
        var html =
            "<div id='" + id + "'><div class='dateAnchor'>" +
                "<div class='anchorText' role='heading'>View Title</div>" +
                "<div class='dateChevron' aria-hidden='true'>&#xE099;</div>" +
            "</div></div>";

        return html;
    }

    function makeUniqueHeader(id) {
        var headerHtml = makeUniqueHeaderHtml(id);
        host.insertAdjacentHTML("beforeend", headerHtml);
        var anchor = host.lastElementChild;

        return anchor;
    }

    /*
        Tests
    */
    Tx.test("DatePickerTests.testDatePickerAnchorApplyText",  { owner: "anselr" }, function(tc) {
        /// <summary>tests applying anchor text to the header</summary>

        tc.cleanup = cleanup;
        setup();

        var anchor = makeUniqueHeader("anchor");

        var itemName = anchor.querySelector(".anchorText");
        var text = "text";

        tc.areEqual(itemName.innerText, "View Title");
        DatePickerAnchor.applyHeaderText(anchor, text, "header contents not correctly updated");
        tc.areEqual(itemName.innerText, text);
    });

    Tx.test("DatePickerTests.testDatePickerAnchorMakeActive",  { owner: "anselr" }, function(tc) {
        /// <summary>tests making this header the active header</summary>

        tc.cleanup = cleanup;
        setup();

        var anchor = makeUniqueHeader("anchor");

        var anchorText = anchor.querySelector(".anchorText");
        var dateAnchor = anchor.querySelector(".dateAnchor");

        // mock out something like a timeline
        var data = { el: anchor };
        var timeline = {
            getRealized: function() {
                return [ data ];
            },
        };

        // initially, not a button, and not activeAnchor
        var ariaRole = anchorText.getAttribute("role");
        tc.areEqual(ariaRole, "heading", "header role must start as heading");
        var classList = dateAnchor.classList;
        tc.isFalse(classList.contains("activeAnchor"), "header must not start as active");

        // the anchor should not be considered active
        tc.isFalse(DatePickerAnchor.isActiveDateAnchor(anchorText), "before update must not be active");        

        DatePickerAnchor.updateDatePickerButton(timeline, data);
        ariaRole = anchorText.getAttribute("role");
        tc.areEqual(ariaRole, "button", "header role must be button");
        tc.isTrue(classList.contains("activeAnchor"), "header must be active");

        // the anchor should be considered active now, and should have events
        tc.isTrue(DatePickerAnchor.isActiveDateAnchor(anchorText), "after update must be active");
        tc.isFalse(dateAnchor._anchorHandlers === null || dateAnchor._anchorHandlers === undefined, "events must be registered");
        
        // manually deactivate
        DatePickerAnchor.deactivateHeader(anchor);
        tc.isFalse(DatePickerAnchor.isActiveDateAnchor(anchorText), "after deactivation must not be active");
        tc.isTrue(dateAnchor._anchorHandlers === null, "events must not be registered");
    });

    Tx.test("DatePickerTests.testDatePickerAnchorMakeInactive",  { owner: "anselr" }, function(tc) {
        /// <summary>tests making a header inactive as a result of activating another</summary>

        tc.cleanup = cleanup;
        setup();

        var inactive = makeUniqueHeader("inactive");  // will start as inactive
        var active = makeUniqueHeader("active");

        // make active an active anchor
        var anchorText = active.querySelector(".anchorText");
        var dateAnchor = active.querySelector(".dateAnchor");
        anchorText.setAttribute("role", "button");
        dateAnchor.classList.add("activeAnchor");

        // mock out something like a timeline
        var dataActive = { el: active };
        var dataInactive = { el: inactive };
        var timeline = {
            getRealized: function() {
                return [ dataActive, dataInactive ];
            },
        };

        // initially, not a button, and not activeAnchor
        DatePickerAnchor.updateDatePickerButton(timeline, dataInactive);

        // now the roles should have swapped, active should no longer be active
        var ariaRole = anchorText.getAttribute("role");
        tc.areEqual(ariaRole, "heading", "deactivated anchor must be a heading");
        var classList = dateAnchor.classList;
        tc.isFalse(classList.contains("activeAnchor"), "deactivated anchor must not be activeAnchor");
        tc.isTrue(dateAnchor._anchorHandlers === undefined, "events were never set, so still undefined");

        anchorText = inactive.querySelector(".anchorText");
        dateAnchor = inactive.querySelector(".dateAnchor");
        ariaRole = anchorText.getAttribute("role");
        tc.areEqual(ariaRole, "button", "activated anchor must be a button");
        classList = dateAnchor.classList;
        tc.isTrue(classList.contains("activeAnchor"), "activated anchor must be activeAnchor");
    });

    Tx.test("DatePickerTests.testDatePickerAnchorMouseEvents",  { owner: "anselr" }, function(tc) {
        /// <summary>tests the effects of the various registered mouse events on an active header</summary>

        tc.cleanup = cleanup;
        setup();

        var anchor = makeUniqueHeader("anchor");

        var dateAnchor = anchor.querySelector(".dateAnchor");

        // mock out something like a timeline
        var data = { el: anchor };
        var timeline = {
            getRealized: function() {
                return [ data ];
            },
        };

        // activate the header
        DatePickerAnchor.updateDatePickerButton(timeline, data);

        // initially must be neither hover nor active
        var classList = dateAnchor.classList;
        tc.isFalse(classList.contains("hover"), "initially activated header must not have hover");
        tc.isFalse(classList.contains("active"), "initially activated header must not have hover");

        // send it mouse events and check the result
        var mouseover = document.createEvent("Event");
        
        mouseover.initEvent("mouseover", true, true);
        runSync(function() {
            dateAnchor.dispatchEvent(mouseover);
        });
        tc.isTrue(classList.contains("hover"), "mouseover sets hover");
        tc.isFalse(classList.contains("active"), "mouseover does not set active");

        var mousedown = document.createEvent("Event");
        mousedown.initEvent("mousedown", true, true);
        runSync(function() {
            dateAnchor.dispatchEvent(mousedown);
        });
        tc.isTrue(classList.contains("hover"), "mousedown leaves hover");
        tc.isTrue(classList.contains("active"), "mousedown sets active");

        var click = document.createEvent("Event");
        click.initEvent("click", true, true);
        runSync(function() {
            dateAnchor.dispatchEvent(click);
        });
        tc.isFalse(classList.contains("hover"), "click removes hover");
        tc.isFalse(classList.contains("active"), "click removes active");

        classList.add("hover");
        classList.add("active");
        var mouseup = document.createEvent("Event");
        mouseup.initEvent("mouseup", true, true);
        runSync(function() {
            dateAnchor.dispatchEvent(mouseup);
        });
        tc.isTrue(classList.contains("hover"), "mouseup leaves hover");
        tc.isFalse(classList.contains("active"), "mouseup removes active");

        classList.add("active");
        var mouseout = document.createEvent("Event");
        mouseout.initEvent("mouseout", true, true);
        runSync(function() {
            dateAnchor.dispatchEvent(mouseout);
        });
        tc.isFalse(classList.contains("hover"), "mouseout removes hover");
        tc.isFalse(classList.contains("active"), "mouseout removes active");
    });
})();