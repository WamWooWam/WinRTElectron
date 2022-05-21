
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\common\common.js" />
/// <reference path="..\Helpers\Helpers.js" />

/*jshint browser:true*/
/*global Calendar,Windows,Jx*/

Jx.delayDefine(Calendar.Controls, "TimeIndicator", function() {
    "use strict";

    function _start(s) { Jx.mark("Calendar.TimeIndicator." + s + ",StartTA,Calendar"); }
    function _stop(s) { Jx.mark("Calendar.TimeIndicator." + s + ",StopTA,Calendar"); }

    var Helpers = Calendar.Helpers;

    function tmpl() {
        var html = 
            '<div class="timeIndicator" aria-hidden="true">' + 
                '<div class="line"></div>' + 
                '<div class="clock">' + 
                    '<span class="text"></span>' + 
                '</div>' + 
            '</div>';
        return html;
    }

    var TimeIndicator = Calendar.Controls.TimeIndicator = function() {
        this._resetUiMembers();

        // bind callbacks
        this._onVisibilityChange = this._onVisibilityChange.bind(this);
        this._update             = this._update.bind(this);

        if (!TimeIndicator._formatter) {
            var languages = Windows.Globalization.ApplicationLanguages.languages,
                language  = languages[0].toLowerCase();
            TimeIndicator._formatter = (language.substring(0, 3) === "en-") ? Helpers.simpleTimeWithMinutes : Helpers.simpleTimeWithMinutesNoPeriod;
        }
    };

    TimeIndicator.prototype.activateUI = function(el) {
        _start("activateUI");

        this._host         = el;
        this._minuteHeight = el.offsetHeight / 24 / 60;

        // make sure the element exists
        if (!this._el) {
            this._host.insertAdjacentHTML("beforeend", tmpl());

            this._el    = this._host.lastElementChild;
            this._clock = this._el.querySelector(".clock");
            this._text  = this._clock.querySelector(".text");
        } else {
            this._host.appendChild(this._el);
        }

        // set the time itself
        this._update();

        // listen for visibility changes
        document.addEventListener("visibilitychange", this._onVisibilityChange, false);

        _stop("activateUI");
    };

    TimeIndicator.prototype.deactivateUI = function() {
        _start("deactivateUI");

        if (this._host) {
            this._pause();
            this._el.parentNode.removeChild(this._el);

            document.removeEventListener("visibilitychange", this._onVisibilityChange, false);
            this._host = null;
        }

        _stop("deactivateUI");
    };

    TimeIndicator.prototype._resetUiMembers = function() {
        this._text  = null;
        this._clock = null;
        this._el    = null;

        this._timeout = null;

        this._host         = null;
        this._minuteHeight = 0;
        this._clockOffset  = 0;
    };

    TimeIndicator.prototype._onVisibilityChange = function() {
        if (document.msHidden) {
            this._pause();
        } else {
            this._update();
        }
    };

    TimeIndicator.prototype._update = function() {
        _start("_update");

        var now     = new Date(),
            hours   = now.getHours(),
            minutes = now.getMinutes(),
            pos     = (hours * 60 + minutes) * this._minuteHeight,
            style   = this._el.style;

        // set our overall position and ensure we're visible
        style.top     = pos + "px";
        style.opacity = "1";

        // set our time
        this._text.innerText = TimeIndicator._formatter.format(now);

        // get our clock's height.  it can change per minute in certain locales.
        var clockHeight = this._clock.offsetHeight,
            offset      = clockHeight / 2;

        // if the time is at the edge of a day, we need to adjust the line
        if (hours === 0) {
            var required = minutes * this._minuteHeight;

            if (required < offset) {
                offset = required;
            }
        } else if (hours === 23) {
            var space = (60 - minutes) * this._minuteHeight;

            if (space < offset) {
                offset += (offset - space);
            }
        }

        // only set the offset if it's different
        if (offset !== this._clockOffset) {
            this._clock.style.top = "-" + offset + "px";
            this._clockOffset = offset;
        }

        // schedule this work again at the next minute
        now.setSeconds(0);
        now.setMinutes(minutes + 1);
        this._timeout = setTimeout(this._update, now - Date.now());

        _stop("_update");
    };

    TimeIndicator.prototype._pause = function() {
        this._el.style.opacity = "0";
        clearTimeout(this._timeout);
    };
});
