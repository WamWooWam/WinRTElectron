
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Calendar,Jx*/

Jx.delayDefine(Calendar.Views, "TimeSlider", function() {

    function _start(ev) { Jx.mark("Calendar:TimeSlider." + ev + ",StartTA,Calendar"); }
    function _stop(ev)  { Jx.mark("Calendar:TimeSlider." + ev + ",StopTA,Calendar");  }

    var Helpers = Calendar.Helpers;

    var _shortTime = new Jx.DTFormatter("shortTime");

    var TimeSlider = Calendar.Views.TimeSlider = function(hourLengthInPixels, isHorizontal) {
        _start("ctor");
        this.initComponent();
        this._hasUI = true;

        this._resetUiMembers();

        this._isHorizontal = isHorizontal;

        this._hourLengthInPixels    = hourLengthInPixels;
        this._halfLengthInPixels    = hourLengthInPixels / 2;
        this._quarterLengthInPixels = hourLengthInPixels / 4;
        this._minuteLengthInPixels  = hourLengthInPixels / 60;
        this._dayLengthInPixels     = hourLengthInPixels * 24;

        this._hourOffset   = 0;
        this._hoursPerDay  = 24;
        this._scrollLengthInPixels   = this._dayLengthInPixels;
        this._minEventLengthInPixels = this._hourLengthInPixels;
        this._allowStartStopSwap     = true;
        this._allowSliderJump        = true;
        this._eventsHooked           = false;
        this._enableSliderFocus      = false;

        // init members
        this._anchor = Calendar.getToday();
        this._start  = this._anchor;
        this._end    = this._anchor;

        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp   = this._onPointerUp.bind(this);
        this._onAttrModifed = this._onAttrModified.bind(this);
        this._onClickSlider = this._onClickSlider.bind(this);

        this._onKeyDown = this._onKeyDown.bind(this);

        this._rangeFormatter = Jx.res.getFormatFunction("DateRange");
        this._startLabel     = Jx.res.getString("EventStartLabel");
        this._endLabel       = Jx.res.getString("EventEndLabel");

        _stop("ctor");
    };
    Jx.augment(TimeSlider, Jx.Component);
    Jx.augment(TimeSlider, Jx.Events);

    TimeSlider.prototype.getUI = function(ui) {
        _start("getUI");

        ui.html = this._templateTimeSlider();

        _stop("getUI");
    };

    TimeSlider.prototype._templateTimeSlider = function () {
        var directionStart    = (this._isHorizontal ? "left" : "top"),
            directionStop     = (this._isHorizontal ? "right" : "bottom"),
            direction         = (this._isHorizontal ? "horizontal" : "vertical"),
            sliderFocus       = (this._enableSliderFocus ? ' tabindex="0" role="slider" aria-live="assertive" aria-valuemin="0" aria-valuemax="10" aria-valuenow="5"' : ""),
            extraSrollContent = (this._extraSrollContent ? this._extraSrollContent : "");

        var s = 
            '<div id="' + this._id + '" class="scroller timeSlider">' + 
                '<div class="surface ' + direction + '">' + 
                    extraSrollContent +
                    '<div class="slider">' + 
                        '<div class="' + directionStart + ' start line"></div>' + 
                        '<div class="' + directionStop + ' stop line"></div>' + 
                        '<div class="focus-region"' + sliderFocus + '></div>' + 
                        '<div class="' + directionStart + ' start grabberTouch" id="startgrabberTouch" role="slider" aria-live="assertive" tabindex="0" aria-valuemin="0" aria-valuemax="10" aria-valuenow="5">' + 
                            '<div class="grabber"></div>' + 
                        '</div>' + 
                        '<div class="' + directionStop + ' stop grabberTouch" id="stopgrabberTouch" role="slider" aria-live="assertive" tabindex="0" aria-valuemin="0" aria-valuemax="10" aria-valuenow="5">' + 
                            '<div class="grabber"></div>' + 
                        '</div>' + 
                    '</div>' +
                '</div>' + 
            '</div>';

        return s;
    };

    TimeSlider.prototype.activateUI = function(element) {
        _start("activateUI");

        // we need to know whether or not we're RTL
        this._isRtl = Jx.isRtl();

        this._element = element || document.getElementById(this._id);
        this._surface = this._element.querySelector(".surface");

        this._slider      = this._element.querySelector(".slider");
        this._sliderFocus = this._slider.querySelector(".focus-region");
        
        // set the pointer handlers
        this._surface._onPointerDown = this._onSurfacePointerDown;
        this._surface._onPointerUp   = this._onSurfacePointerUp;

        // grabbers
        this._grabberTouchStart  = this._slider.querySelector(".start.grabberTouch");
        this._grabberTouchStop = this._slider.querySelector(".stop.grabberTouch");

        this._grabberStart  = this._grabberTouchStart.firstElementChild;
        this._grabberStop = this._grabberTouchStop.firstElementChild;

        this._grabberTouchStart._onPointerDown = this._onGrabberTouchPointerDown;
        this._grabberTouchStart._onPointerMove = this._onGrabberPointerMoveStart;
        this._grabberTouchStart._onPointerUp   = this._onGrabberPointerUpStart;

        this._grabberTouchStop._onPointerDown = this._onGrabberTouchPointerDown;
        this._grabberTouchStop._onPointerMove = this._onGrabberPointerMoveStop;
        this._grabberTouchStop._onPointerUp   = this._onGrabberPointerUpStop;

        this._grabberStart._onPointerMove = this._onGrabberPointerMoveStart;
        this._grabberStart._onPointerUp   = this._onGrabberPointerUpStart;

        this._grabberStop._onPointerMove = this._onGrabberPointerMoveStop;
        this._grabberStop._onPointerUp   = this._onGrabberPointerUpStop;

        this._hookEvents();

        _stop("activateUI");
    };

    TimeSlider.prototype.deactivateUI = function() {
        _start("deactivateUI");
        
        if (this._element) {
            this.unhookEvents();
            this._resetUiMembers();

            if (this._element.parentNode) {
                this._element.parentNode.removeChild(this._element);
            }
            this._element = null;
        }

        _stop("deactivateUI");
    };

    TimeSlider.prototype._hookEvents = function() {
        // _hookPointerEvents is called as needed
        this._eventsHooked = true;

        if (this._allowSliderJump) {
            this._surface.addEventListener("MSPointerDown", this._onPointerDown, false);
        }
        this._sliderFocus.addEventListener("DOMAttrModified", this._onAttrModifed, false);

        window.addEventListener("keydown", this._onKeyDown, false);

        this._grabberTouchStart.addEventListener("MSPointerDown",  this._onPointerDown, false);
        this._grabberTouchStop.addEventListener("MSPointerDown", this._onPointerDown, false);

        this._grabberStart.addEventListener("MSPointerDown",  this._onPointerDown, false);
        this._grabberStop.addEventListener("MSPointerDown", this._onPointerDown, false);

        this._grabberTouchStart.addEventListener("DOMAttrModified",  this._onAttrModifed, false);
        this._grabberTouchStop.addEventListener("DOMAttrModified", this._onAttrModifed, false);

        // Prevent clicks from bubbling out of the slider control.
        this._slider.addEventListener("click", this._onClickSlider, false);
    };

    TimeSlider.prototype.unhookEvents = function() {
        if (!this._eventsHooked) {
            return;
        }

        this._eventsHooked = false;

        this._unhookPointerEvents();

        if (this._allowSliderJump) {
            this._surface.removeEventListener("MSPointerDown", this._onPointerDown, false);
        }
        this._sliderFocus.removeEventListener("DOMAttrModified", this._onAttrModifed, false);

        window.removeEventListener("keydown", this._onKeyDown, false);

        this._grabberTouchStop.removeEventListener("DOMAttrModified", this._onAttrModifed, false);
        this._grabberTouchStart.removeEventListener("DOMAttrModified",  this._onAttrModifed, false);

        this._grabberStop.removeEventListener("MSPointerDown", this._onPointerDown, false);
        this._grabberStart.removeEventListener("MSPointerDown",  this._onPointerDown, false);

        this._grabberTouchStop.removeEventListener("MSPointerDown", this._onPointerDown, false);
        this._grabberTouchStart.removeEventListener("MSPointerDown",  this._onPointerDown, false);

        this._slider.removeEventListener("click", this._onClickSlider, false);
    };

    TimeSlider.prototype._resetUiMembers = function() {
        this._isRtl = null;

        this._surface  = null;

        this._slider      = null;
        this._sliderFocus = null;

        this._grabberTouchStart = null;
        this._grabberTouchStop  = null;

        this._grabberStart = null;
        this._grabberStop  = null;

        this._start = null;
        this._end   = null;

        this._lastActive = null;

        this._eventStartAtStartOfMove = null;
        this._eventStopAtStartOfMove  = null;
    };

    TimeSlider.prototype.getState = function() {
        _start("getState");

        // force an update now
        this._updateState();

        var state = {
            start: new Date(this._start),
            end:   new Date(this._end),
        };

        _stop("getState");
        return state;
    };

    TimeSlider.prototype.setAllowStartStopSwap = function(allowStartStopSwap) {
        this._allowStartStopSwap = allowStartStopSwap;
    };

    TimeSlider.prototype.setAllowSliderJump = function(allowSliderJump) {
        this._allowSliderJump = allowSliderJump;
    };

    TimeSlider.prototype.setMinEventLengthInPixels = function(minEventLengthInPixels) {
        this._minEventLengthInPixels = minEventLengthInPixels;
    };

    TimeSlider.prototype.setScrollLengthInPixels = function(scrollLengthInPixels) {
        this._scrollLengthInPixels = scrollLengthInPixels;
    };

    TimeSlider.prototype.getScrollLengthInPixels = function() {
        return this._scrollLengthInPixels;
    };

    TimeSlider.prototype.setExtraSrollContent = function(extraSrollContent) {
        /// <summary>Sets the internal content of the scrollable region.  Should be called before getUI.</summary>
        return this._extraSrollContent = extraSrollContent;
    };

    TimeSlider.prototype.setEnableSliderFocus = function(enableSliderFocus) {
        /// <summary>If enabled, the contents of the slider can be selected and clicking outside of its contents but still in the slider container, will move both the start and end time.  Should be called before getUI.</summary>
        return this._enableSliderFocus = enableSliderFocus;
    };

    TimeSlider.prototype.setRange = function(anchor, start, end) {
        /// <summary>Sets the time sliders current spanned time period and past time limit.</summary>
        /// <param name="anchor" type="Date">A date that the time slider can not scroll before.</param>
        /// <param name="start" type="Date">The time to move the start slider to.</param>
        /// <param name="stop" type="Date">The time to move the stop slider to.</param>
        _start("setRange");

        this._anchor = anchor;

        if (!this._start || !this._stop || start.getTime() !== this._start.getTime() || end.getTime() !== this._end.getTime()) {
            this._start = start;
            this._end   = end;

            this.fire("rangeChange");

            // if our ui is already created, we have a bit more work to do
            if (this._element) {
                // set our scroll position to the start
                this._updateSlider();
                this._setScrollPos();
            }
        }

        this._updateAria();

        _stop("setRange");
    };

    TimeSlider.prototype.getTouchTargets = function() {
        return [this._grabberTouchStart, this._grabberTouchStop];
    };

    TimeSlider.prototype.getElement = function() {
        return this._element;
    };

    TimeSlider.prototype.getContentRegion = function() {
        /// <summary>The content region is the div stretched between the two time sliders.  
        ///     Insert DOM into this element if you want it to be inside of the time slider.</summary>
        return this._sliderFocus;
    };

    TimeSlider.prototype._onClickSlider = function(ev) {
        // Capture is used to prevent MSPointerUp from firing click events outside of this time slider control.
        ev.target.releaseCapture();
        // Stop events from leaving the time slider control.
        ev.stopPropagation();
        ev.preventDefault();
    };

    TimeSlider.prototype._swapPointerListener = function(newTarget) {
        var pointerId = this._pointerId;

        this._unhookPointerEvents();
        this._hookPointerEvents(newTarget, pointerId);
    };

    TimeSlider.prototype._onGrabberTouchPointerDown = function(ev) {
        /// <summary>This handler prevents the user from scrolling the page when they try to move a time slider grabber.</summary>
        return (ev.pointerType === "touch");
    };

    TimeSlider.prototype._onGrabberPointerMoveStart = function(ev) {
        _start("_onGrabberPointerMoveStart");

        // get our current info along with offsets
        var offset = (this._isHorizontal ? ev.offsetX : ev.offsetY);

        if (this._isHorizontal && this._isRtl) {
            offset *= -1;
        }

        var style = this._slider.style,
            start = this._getStart(style) + offset,
            stop  = this._getStop(style);

        // we're moving the start grabber.  don't let it go past our start edge.
        if (start < this._scrollStart) {
            start = this._scrollStart;
        } else if (start > this._scrollLengthInPixels - this._minEventLengthInPixels) {
            start = this._scrollLengthInPixels - this._minEventLengthInPixels;
        }

        if (this._allowStartStopSwap) {
            // if the grabbers "pass", switch our focus to the other one.
            if (start > stop) {
                this._swapPointerListener(this._grabberStop);
                start = stop;
            }
        } else if (start > stop - this._minEventLengthInPixels) {
            stop = start + this._minEventLengthInPixels;
            this._setStop(style, stop);
        } else if (stop > this._eventStopAtStartOfMove) {
            stop = Math.max(start + this._minEventLengthInPixels, this._eventStopAtStartOfMove);
            this._setStop(style, stop);
        }

        this._setStart(style, start);

        _stop("_onGrabberPointerMoveStart");
    };

    TimeSlider.prototype._onGrabberPointerMoveStop = function(ev) {
        _start("_onGrabberPointerMoveStop");

        var offset = (this._isHorizontal ? ev.offsetX : ev.offsetY);

        if (this._isHorizontal && this._isRtl) {
            offset *= -1;
        }

        var style = this._slider.style,
            start = this._getStart(style),
            stop  = this._getStop(style) + offset;

        if (stop > this._scrollLengthInPixels) {
            stop = this._scrollLengthInPixels;
        } else if (stop < this._scrollStart + this._minEventLengthInPixels) {
            stop = this._scrollStart + this._minEventLengthInPixels;
        }

        if (this._allowStartStopSwap) {
            // if the grabbers "pass", switch our focus to the other one.
            if (stop < start) {
                this._swapPointerListener(this._grabberStart);
                stop = start;
            }
        } else if (stop < start + this._minEventLengthInPixels) {
            start = stop - this._minEventLengthInPixels;
            this._setStart(style, start);
        } else if (start < this._eventStartAtStartOfMove) {
            start = Math.min(stop - this._minEventLengthInPixels, this._eventStartAtStartOfMove);
            this._setStart(style, start);
        }

        this._setStop(style, stop);

        _stop("_onGrabberPointerMoveStop");
    };

    TimeSlider.prototype._onGrabberPointerUpStart = function(ev) {
        _start("_onGrabberPointerUpStart");

        // Capture is used to prevent MSPointerUp from firing click events outside of this time slider control.
        ev.target.setCapture();

        var style = this._slider.style,
            start = this._getStart(style),
            stop  = this._getStop(style);

        // we lifted focus from the start grabber.  move to the nearest half hour.
        start += (this._minEventLengthInPixels / 2);
        start -= start % this._minEventLengthInPixels;
        stop += (this._minEventLengthInPixels / 2);
        stop -= stop % this._minEventLengthInPixels;

        if (this._allowStartStopSwap) {
            if (stop < start) {
                start -= this._minEventLengthInPixels;
            }
        } else if (start > stop - this._minEventLengthInPixels) {
            stop = start + this._minEventLengthInPixels;
        }

        this._setStart(style, start);
        this._setStop(style, stop);
        this._updateState();

        _stop("_onGrabberPointerUpStart");
    };

    TimeSlider.prototype._onGrabberPointerUpStop = function(ev) {
        _start("_onGrabberPointerUpStop");

        // Capture is used to prevent MSPointerUp from firing click events outside of this time slider control.
        ev.target.setCapture();

        var style = this._slider.style,
            start = this._getStart(style),
            stop  = this._getStop(style);

        // we lifted focus from the stop grabber.  move to the nearest half hour.
        start += (this._minEventLengthInPixels / 2);
        start -= start % this._minEventLengthInPixels;
        stop += (this._minEventLengthInPixels / 2);
        stop -= stop % this._minEventLengthInPixels;

        if (this._allowStartStopSwap) {
            if (stop < start) {
                stop += this._minEventLengthInPixels;
            }
        } else if (stop < start + this._minEventLengthInPixels) {
            stop = start + this._minEventLengthInPixels;
        }

        this._setStart(style, start);
        this._setStop(style, stop);
        this._updateState();

        _stop("_onGrabberPointerUpStop");
    };

    TimeSlider.prototype._getStart = function(style) {
        var start;

        if (this._isHorizontal) {
            start = this._isRtl ? style.right : style.left;
        } else {
            start = style.top;
        }

        return parseInt(start, 10);
    };

    TimeSlider.prototype._getStop = function(style) {
        var stop;

        if (this._isHorizontal) {
            stop = this._isRtl ? style.left : style.right;
        } else {
            stop = style.bottom;
        }

        return -parseInt(stop, 10);
    };

    TimeSlider.prototype._setStart = function(style, start) {
        var value = start + "px";

        if (this._isHorizontal) {
            if (this._isRtl) {
                style.right = value;
            } else {
                style.left = value;
            }
        } else {
            style.top = value;            
        }
    };

    TimeSlider.prototype._setStop = function(style, stop) {
        var value = -stop + "px";

        if (this._isHorizontal) {
            if (this._isRtl) {
                style.left = value;
            } else {
                style.right = value;
            }
        } else {
            style.bottom = value;            
        }
    };


    TimeSlider.prototype._handleDecrement = function(target) {
        _start("_handleDecrement");

        var style = this._slider.style,
            start = this._getStart(style),
            stop  = this._getStop(style),
            offset;

        if (target === this._sliderFocus) {
            // ensure we can move the slider start
            if (start) {
                // move it to the nearest half hour or by a half hour
                offset = start % this._minEventLengthInPixels || this._minEventLengthInPixels;
                start -= offset;
                stop  -= offset;

                // ensure the start side stays visible
                if (start < this._scrollStart) {
                    this._setScrollStart(start);
                }
            }
        } else if (target === this._grabberTouchStart) {
            // ensure we can move the grabber start
            if (start) {
                // move it to the nearest half hour or by a half hour
                offset = start % this._minEventLengthInPixels || this._minEventLengthInPixels;
                start -= offset;

                // ensure the start side stays visible
                if (start < this._scrollStart) {
                    this._setScrollStart(start);
                }
            }
        } else if (target === this._grabberTouchStop) {
            // move it to the nearest half hour or by a half hour
            offset = stop % this._minEventLengthInPixels || this._minEventLengthInPixels;
            stop  -= offset;

            // if our LengthInPixels is less than half an hour, we'll need to move the start
            // side too.
            if ((stop - start) < this._minEventLengthInPixels) {
                start -= 1;
                start -= start % this._minEventLengthInPixels;

                if (start <= 0) {
                    start = 0;
                    stop  = this._minEventLengthInPixels;
                }

                if (start < this._scrollStart) {
                    this._setScrollStart(start);
                }
            } else {
                // ensure the stop side stays visible
                if (stop <= this._scrollStart) {
                    this._setScrollStart(stop - this._minEventLengthInPixels);
                }
            }
        }

        this._setStart(style,  start);
        this._setStop(style, stop);
        this._updateState();

        _stop("_handleDecrement");
    };

    TimeSlider.prototype._handleIncrement = function(target) {
        _start("_handleIncrement");

        var style = this._slider.style,
            start = this._getStart(style),
            stop  = this._getStop(style),
            next;

        var scrollStop = this._scrollStart + this._element.offsetLengthInPixels,
            maxStop    = this._element.scrollLengthInPixels;

        if (target === this._sliderFocus) {
            next  = start + this._minEventLengthInPixels;
            next -= next % this._minEventLengthInPixels;

            stop += next - start;
            start = next;

            // ensure we don't go off the stop edge
            if (maxStop < stop) {
                start -= stop - maxStop;
                stop   = maxStop;
            }

            // ensure the stop side stays visible
            if (scrollStop < stop) {
                this._setScrollStart(this._scrollStart + stop - scrollStop);
            }
        } else if (target === this._grabberTouchStart) {
            next  = start + this._minEventLengthInPixels;
            next -= next % this._minEventLengthInPixels;

            start = next;
            stop = Math.max(stop, start + this._minEventLengthInPixels);

            // ensure we don't go off the stop edge
            if (maxStop < stop) {
                start -= stop - maxStop;
                stop = maxStop;
            }

            // ensure the start side stays visible
            var boundary = start + this._minEventLengthInPixels;
            if (scrollStop < boundary) {
                this._setScrollStart(boundary - (this._isHorizontal ? this._element.offsetHeight : this._element.offsetWidth));
            }
        } else if (target === this._grabberTouchStop) {
            stop += this._minEventLengthInPixels;
            stop -= stop % this._minEventLengthInPixels;

            // ensure we don't go off the stop edge
            if (maxStop < stop) {
                stop = maxStop;
            }

            // ensure the stop side stays visible
            if (scrollStop < stop) {
                this._setScrollStart(this._scrollStart + stop - scrollStop);
            }
        }

        this._setStart(style, start);
        this._setStop(style, stop);
        this._updateState();

        _stop("_handleIncrement");
    };

    TimeSlider.prototype._onKeyDown = function(ev) {
        var key = ev.key;
        var target = ev.target;

        if (target === this._sliderFocus || target === this._grabberTouchStart || target === this._grabberTouchStop) {
            if (this._isHorizontal) {
                if (key === "Left") {
                    if (this._isRtl) {
                        this._handleIncrement(target);
                    } else {
                        this._handleDecrement(target);
                    }

                    ev.preventDefault();
                } else if (key === "Right") {
                    if (this._isRtl) {
                        this._handleDecrement(target);
                    } else {
                        this._handleIncrement(target);
                    }

                    ev.preventDefault();
                }
            } else {
                if (key === "Up") {
                    this._handleDecrement(target);

                    ev.preventDefault();
                } else if (key === "Down") {
                    this._handleIncrement(target);

                    ev.preventDefault();
                }            
            }
        }
    };

    TimeSlider.prototype._updateSlider = function() {
        // our slider position and size calculations all involve calculating the
        // day offset from our anchor day, as well as the hour of the times.  we
        // can't rely purely on hour math, unfortunately, because we'll lose
        // accuracy around dst switches.
        var startDay     = Math.floor((this._start - this._anchor) / Helpers.dayInMilliseconds),
            startMinutes = (this._start.getHours() - this._hourOffset) * 60 + this._start.getMinutes();

        var endDay     = Math.floor((this._end - this._anchor) / Helpers.dayInMilliseconds),
            endMinutes = (this._end.getHours() - this._hourOffset) * 60 + this._end.getMinutes();

        var start = ((startDay * this._hoursPerDay) * this._hourLengthInPixels) + (startMinutes * this._minuteLengthInPixels),
            stop  = ((endDay   * this._hoursPerDay) * this._hourLengthInPixels) + (endMinutes   * this._minuteLengthInPixels);

        var style = this._slider.style;
        this._setStart(style, start);
        this._setStop(style, stop);
    };

    TimeSlider.prototype._onPointerDown = function(ev) {
        this._lastActive = document.activeElement;
        // Don't move focus during a drag.
        ev.preventDefault();
        ev.stopPropagation();

        if (!this._pointerTarget && ev.button === 0) {

            // notify that the slider action is starting
            this.fire("timeSliderBegin");

            var target = ev.currentTarget;

            var style = this._slider.style,
                start = this._getStart(style),
                stop  = this._getStop(style);

            this._eventStartAtStartOfMove = start;
            this._eventStopAtStartOfMove = stop;

            // if the target has a pointerdown handler,
            // it can block hooking the events.
            if (!target._onPointerDown || target._onPointerDown.call(this, ev)) {
                this._hookPointerEvents(target, ev.pointerId);
            }
        }
    };

    TimeSlider.prototype._onPointerMove = function(ev) {
        var target = this._pointerTarget;

        if (target && ev.pointerId === this._pointerId) {
            if (target._onPointerMove) {
                target._onPointerMove.call(this, ev);
            }
        }
    };

    TimeSlider.prototype._hookPointerEvents = function(target, pointerId) {
        target.addEventListener("MSPointerMove",        this._onPointerMove, false);
        target.addEventListener("MSPointerUp",          this._onPointerUp,   false);
        target.addEventListener("MSPointerCancel",      this._onPointerUp,   false);
        target.addEventListener("MSLostPointerCapture", this._onPointerUp,   false);
        target.msSetPointerCapture(pointerId);

        // store some important info
        this._pointerTarget = target;
        this._pointerId     = pointerId;
    };

    TimeSlider.prototype._unhookPointerEvents = function() {
        var target = this._pointerTarget;

        if (target) {
            target.msReleasePointerCapture(this._pointerId);
            target.removeEventListener("MSLostPointerCapture", this._onPointerUp,   false);
            target.removeEventListener("MSPointerCancel",      this._onPointerUp,   false);
            target.removeEventListener("MSPointerUp",          this._onPointerUp,   false);
            target.removeEventListener("MSPointerMove",        this._onPointerMove, false);

            // release members
            this._pointerId     = null;
            this._pointerTarget = null;
        }
    };

    TimeSlider.prototype._onPointerUp = function(ev) {
        // Don't move focus during a drag.
        ev.preventDefault();
        ev.stopPropagation();

        var target = this._pointerTarget;

        if (target && ev.pointerId === this._pointerId) {
            if (target._onPointerUp) {
                target._onPointerUp.call(this, ev);
            }

            this._unhookPointerEvents();

            // notify that the slider action is ending
            this.fire("timeSliderEnd");
        }
    };

    TimeSlider.prototype._calculateOffset = function(ev) {
        var source  = ev.target,
            current = ev.currentTarget,
            offset  = (this._isHorizontal ? ev.offsetX : ev.offsetY);

        while (source !== current) {
            offset += (this._isHorizontal ? source.offsetLeft : source.offsetTop);
            source = source.parentNode;
        }

        if (this._isHorizontal && this._isRtl) {
            offset += this._minEventLengthInPixels;
        }

        offset -= offset % this._minEventLengthInPixels;
        return offset;
    };

    TimeSlider.prototype._onSurfacePointerDown = function(ev) {
        // save our initial position
        this._initialSurface = this._calculateOffset(ev);
        return true;
    };

    TimeSlider.prototype._onSurfacePointerUp = function(ev) {
        // only do work if it wasn't a cancel
        if (ev.type !== "MSPointerCancel" && ev.type !== "pointercancel") {
            // verify we're still over the current target
            var y = (this._isHorizontal ? ev.offsetY : ev.offsetX);

            if (0 <= y && y <= (this._isHorizontal ? this._pointerTarget.offsetHeight : this._pointerTarget.offsetWidth)) {
                var x = this._calculateOffset(ev);

                if (x === this._initialSurface) {
                    if (this._isRtl) {
                        x = this.getScrollLengthInPixels() - x;
                    }

                    var style  = this._slider.style,
                        start  = this._getStart(style),
                        stop   = this._getStop(style),
                        offset = x - start;

                    start = x;
                    stop -= offset;

                    // ensure we don't go off the stop edge
                    if (stop < 0) {
                        start += stop;
                        stop   = 0;
                    }

                    this._setStart(style, start);
                    this._setStop(style, stop);

                    this._updateState();
                }
            }
        }
    };

    TimeSlider.prototype._updateState = function() {
        // calculate our current selected start and end times
        var style    = this._slider.style,
            startPos = this._getStart(style),
            stopPos  = this._getStop(style);

        var startDay     = Math.floor(startPos / this._dayLengthInPixels),
            startMinutes = (startPos % this._dayLengthInPixels) / this._minuteLengthInPixels;

        var endDay     = Math.floor(stopPos / this._dayLengthInPixels),
            endMinutes = (stopPos % this._dayLengthInPixels) / this._minuteLengthInPixels;

        // for non-zero duration events, we need to check if the end falls on a day
        // boundary.  if it does, we want to move it to the previous day.  this
        // matters when the hours don't line up across days (e.g. work days - the
        // end of a day is 7pm, but the start is 8am);
        if (startPos < stopPos) {
            if (!endMinutes) {
                endDay -= 1;
                endMinutes = this._dayLengthInPixels / this._minuteLengthInPixels;
            }
        }

        var year  = this._anchor.getFullYear(),
            month = this._anchor.getMonth(),
            date  = this._anchor.getDate();

        var start = new Date(year, month, date + startDay, this._hourOffset, Math.round(startMinutes)),
            end   = new Date(year, month, date + endDay,   this._hourOffset, Math.round(endMinutes));

        // if they're changed, save them and update our aria info
        if (start.getTime() !== this._start.getTime() || end.getTime() !== this._end.getTime()) {
            this._start = start;
            this._end   = end;
        }

        this._updateAria();        
    };

    TimeSlider.prototype._setScrollStart = function(start) {
        if (this._isHorizontal) {
            this._element.scrollLeft = start;
        } else {
            this._element.scrollTop = start;
        }
    };

    TimeSlider.prototype._setScrollPos = function() {
        // calculate our scroll position, relative to our anchor day.
        var startDay   = Math.floor((this._start - this._anchor) / Helpers.dayInMilliseconds),
            hours      = (this._anchor.getHours() - this._hourOffset),
            hourOffset = (startDay * this._hoursPerDay) + hours;

        // set our position to an hour before the selected time, but don't do that
        // if setting that position will "leak" the previous day into view.
        if (hours) {
            hourOffset -= 1;
        }

        this._scrollStart = hourOffset * this._hourLengthInPixels;
        this._setScrollStart(this._scrollStart);
    };

    TimeSlider.prototype._onAttrModified = function(ev) {
        // we use this mutation event to know when narrator changes aria properties
        if (ev.attrName === "aria-valuenow") {
            var target = ev.target,
                value  = parseInt(ev.newValue, 10);

            // by default, we set the value to 5.  this is our "middle of the road"
            // reserved value.  narrator will either increase or decrease it.
            if (value !== 5) {
                target.setAttribute("aria-valuenow", 5);

                if (value < 5) {
                    this._handleDecrement(target);
                } else {
                    this._handleIncrement(target);
                }

                this._updateState();
            }
        }
    };

    TimeSlider.prototype._updateAria = function() {
        // we synchronously update our slider aria
        var start      = this._start;
        var end        = this._end;
        var isSameDate = Helpers.isSameDate(start, end);
        var from       = Helpers.dateAndTime.format(start);
        var to         = isSameDate ? _shortTime.format(end) : Helpers.dateAndTime.format(end);
        var range      = this._rangeFormatter(from, to);

        if (this._enableSliderFocus) {
            this._sliderFocus.setAttribute("aria-label",     range);
            this._sliderFocus.setAttribute("aria-valuetext", range);
        }

        this._grabberTouchStart.setAttribute("aria-label",     this._startLabel);
        this._grabberTouchStart.setAttribute("aria-valuetext", range);

        this._grabberTouchStop.setAttribute("aria-label",     this._endLabel);
        this._grabberTouchStop.setAttribute("aria-valuetext", range);
    };    
});