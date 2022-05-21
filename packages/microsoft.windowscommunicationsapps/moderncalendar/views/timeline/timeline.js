
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Timeline.ref.js"/>

/*jshint browser:true*/
/*global Calendar,Jx,People,Debug*/

Jx.delayDefine(Calendar.Controls, "Timeline", function() {

    function _start(ev)     { Jx.mark("Calendar:Timeline." + ev + ",StartTA,Calendar"); }
    function _stop(ev)      { Jx.mark("Calendar:Timeline." + ev + ",StopTA,Calendar");  }
    function _log(ev, data) { Jx.mark("Calendar:Timeline." + ev + ": " + data);         }

    function tmplArrows() {
        var s = 
            '<input type="button" class="timelineArrow left" value="\ue09e" tabindex="0" aria-label="' + Jx.escapeHtml(Jx.res.getString("AccBackArrow")) + '">' +
            '<input type="button" class="timelineArrow right" value="\ue09f" tabindex="0" aria-label="' + Jx.escapeHtml(Jx.res.getString("AccForwardArrow")) + '">';
        return s;
    }

    var Timeline = Calendar.Controls.Timeline = function(host, jobset, source, renderer, recycler, options) {
        /// <summary>Virtualized list control</summary>
        /// <param name="host"     type="HTMLElement">Host element for the control</param>
        /// <param name="source"   type="DataSource">Data source for the control</param>
        /// <param name="renderer" type="Function">Function that can render individual data items</param>
        /// <param name="recycler" type="Function">Function that can recycle elements between data items</param>
        /// <param name="options"  type="Object" optional="true">Options defining the behavior of the Timeline
        ///     strictOrder:Boolean     - if set, ensures that the first visible item is also the first child of 
        ///                               the scroller
        ///     hookWheel:Boolean       - if set, captures the mouse wheel for input
        ///     leaveFocus:Boolean      - if set, leaves focus on instances while being recycled rather than clearing it
        ///     arrowHost:DOMElement    - override the host in which to render the arrows.  if not set, defaults to
        ///                               the same host into which the control itself renders.  useful if embedding into
        ///                               an element with overflow hidden, but we need to push the arrows beyond the
        ///                               client area</param>
        ///     noFocusOnResize:Boolean - if set, prevents re-activation of the last activated UI element when there is
        ///                               a resize.  this is currently used to prevent the date picker from causing the
        ///                               on-screen keyboard from dismissing when focus is given to the canvas in
        ///                               event details.  date picker will always be hidden on a resize, so it doesn't
        ///                               need to reset the focus. (BLUE:328126)
        ///     fixedWidth:Number       - if set, prevents calls to offsetWidth.  instead, the timeline will assume that
        ///                               it has a constant width and will never make a DOM query to get the width of
        ///                               the host

        // store our params
        this._host       = host;
        this._arrowHost  = host;
        this._rootJobset = jobset.createChild();
        this._source     = source;
        this._renderer   = renderer;
        this._recycler   = recycler;
        this._options    = options || {};

        this._realized = [];
        this._removing = [];
        this._removed  = [];

        this._itemWidth = 0;
        this._start = 0;
        this._forceScroll = false;  // set true before calling _onScroll to handle scroll, even if at the same position

        // check whether to use a fixed width
        options = this._options;
        if (options.fixedWidth) {
            this._hasFixedWidth = true;
            this._fixedWidth = options.fixedWidth;
        } else {
            this._hasFixedWidth = false;
        }

        this._jobset = this._rootJobset.createChild();
        this._jobset.setVisibility(false);

        // we need to know whether or not we're RTL
        this._isRtl = Jx.isRtl();

        // create our scroller
        this._scroller = document.createElement("div");
        this._scroller.className = "timelineScroller";
        this._scroller.style.visibility = "hidden";
        this._scroller.setAttribute("role", "list");

        this._host.appendChild(this._scroller);
        this._scrollPos = 0;

        // prepare the canvas, which will hold our realized elements
        this._canvas = document.createElement("div");
        this._canvas.style.height = "100%";
        this._scroller.appendChild(this._canvas);

        // check whether to override the arrow host
        if (options.arrowHost) {
            this._arrowHost = options.arrowHost;
        }

        // bind our callbacks
        this._onMoveLeft  = this._onMoveLeft.bind(this);
        this._onMoveRight = this._onMoveRight.bind(this);

        this._onMouseMoveArrow = this._onMouseMoveArrow.bind(this);
        this._setArrowTimeout  = this._setArrowTimeout.bind(this);
        this._hideArrows       = this._hideArrows.bind(this);

        this._onKeyDown    = this._onKeyDown.bind(this);
        this._onKeyScroll  = this._onKeyScroll.bind(this);

        this._onScroll      = this._onScroll.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onMouseWheel  = this._onMouseWheel.bind(this);

        this._resizeCanvas   = this._resizeCanvas.bind(this);
    };

    Jx.augment(Timeline, Jx.Events);

    Debug.Events.define(Timeline.prototype, "focusChanged", "itemRealized", "itemRemoved");

    //
    // Constants
    //

    Timeline._wheelThresholdFactor = 0.1;

    // trident supports a max of 21474836.47 pixels.  his might vary across
    // machines, so we limit it to something reasonable and do some tricks to
    // prevent the user from hitting it.
    Timeline.MAX_WIDTH = 10000;
    Timeline.MAX_SIDE  = Timeline.MAX_WIDTH / 2;

    //
    // Public
    //

    Timeline.prototype.initialize = function(index) {
        /// <summary>Prepares the Timeline control and creates the initial UI</summary>
        /// <param name="index" type="Number" optional="true">
        ///     The index to focus when the control is instantiated.
        ///     0 is used if none is provided.
        /// </param>
        _start("initialize");

        // initialize to the provided index
        this._start = index || 0;

        // cache the max left and right the data source supports.
        this._left  = -this._source.left();
        this._right =  this._source.right();

        // clean up any old items
        this._removeItems();
        this._rootJobset.cancelAllChildJobs();

        // create our first item
        this._realized = [this._getElement(this._start, true)];

        // set up our initial state
        this._updateState();

        // hook our events if we haven't already
        if (!this._hooked) {
            this._hookEvents();
            this._hooked = true;
        }

        // show our arrows if we need to
        if (this._alwaysShowArrows) {
            this._showArrows();
        }

        _stop("initialize");
    };

    Timeline.prototype.uninitialize = function() {
        _start("uninitialize");

        this._removeItems();
        this._rootJobset.cancelAllChildJobs();

        if (this._hooked) {
            // remove event hooks
            Jx.EventManager.removeListener(Jx.root, "resizeWindow", this._onResizeWindow, this);

            this._scroller.removeEventListener("scroll",  this._onScroll,    false);
            this._scroller.removeEventListener("keydown", this._onKeyScroll, false);

            this._host.removeEventListener("wheel",   this._onMouseWheel,  false);

            this._arrowHost.removeEventListener("keydown",       this._onKeyDown,     false);
            this._arrowHost.removeEventListener("MSPointerMove", this._onPointerMove, false);
            
            this._hooked = false;
        }

        _stop("uninitialize");
    };

    Timeline.prototype.shutdown = function() {
        _start("shutdown");

        this.uninitialize();
        this._rootJobset.dispose();

        // clean up ui
        this._host.innerHTML = "";
        clearTimeout(this._arrowTimeout);

        // release references
        this._canvas   = null;
        this._scroller = null;
        this._host     = null;
        this._arrows   = null;

        this._options  = null;
        this._recycler = null;
        this._renderer = null;
        this._source   = null;

        this._jobset     = null;
        this._rootJobset = null;

        this._removed  = null;
        this._removing = null;
        this._realized = null;

        _stop("shutdown");
    };

    Timeline.prototype.setAlwaysShowArrows = function(alwaysShowArrows) {
        this._alwaysShowArrows = alwaysShowArrows;

        if (this._realized.length) {
            if (alwaysShowArrows) {
                this._showArrows();
            } else {
                this._hideArrows();
            }
        }
    };

    Timeline.prototype.setFocusedIndex = function(index) {
        /// <summary>Focuses a specific item.</summary>
        /// <param name="index" type="Number">
        ///     The index to of the time to focus.
        /// </param>
        _log("setFocusedIndex", index);

        // ensure the index is a valid value
        index = Math.max(this._left, Math.min(this._right, index));

        // if we have the same index, don't force focus
        if (index === this._start) {
            // hide any elements that are no longer needed
            this._hideRemovedElements();

            // calculate our new left and right indices
            var oldLeftIndex = this._leftIndex;
            this._setBoundaries(this._itemWidth, index);

            // figure out how much our canvas moves
            var offset = this._itemWidth * (oldLeftIndex - this._leftIndex);
            this._scrollPos += offset;

            _start("setFocusedIndex:scrollCanvas");
            this._scroller.scrollLeft = this._scrollPos;
            _stop("setFocusedIndex:scrollCanvas");
            _log("scrollCanvas", this._scrollPos);

            // adjust all our items based on how many new ones we added
            for (var i = 0, len = this._realized.length; i < len; i++) {
                var style = this._realized[i].el.style;

                if (this._isRtl) {
                    style.right = parseInt(style.right, 10) + offset + "px";
                } else {
                    style.left  = parseInt(style.left, 10)  + offset + "px";
                }
            }
        } else {
            if (index < this._leftIndex || index > this._rightIndex - this._realized.length) {
                // calculate our new left and right indices
                this._setBoundaries(this._itemWidth, index);
            }

            this._scrollPos = this._itemWidth * (index - this._leftIndex);

            if (this._scrollPos !== this._scroller.scrollLeft) {
                _start("setFocusedIndex:scrollCanvas");
                this._scroller.scrollLeft = this._scrollPos;
                _stop("setFocusedIndex:scrollCanvas");
                _log("scrollCanvas", this._scrollPos);
            }
        }

        // force us to handle the position change immediately
        this._doScroll();
    };

    Timeline.prototype.getFocusedIndex = function() {
        return this._start;
    };

    Timeline.prototype.getRealized = function(includeCached) {
        /// <param name="includeCached" type="Boolean" optional="true">Whether or not to return cached items</param>
        var realized = this._realized,
            start    = 0,
            end      = realized.length;

        if (!includeCached) {
            if (realized[start].cached) {
                start = 1;
            }

            var last = end-1;

            if (realized[last].cached) {
                end = last;
            }
        }

        return realized.slice(start, end);
    };

    Timeline.prototype.restoreDisplay = function () {
        /// <summary>restores the scroll position of the managed content which can be lost
        ///     if the element containing the timeline is set to display none, such as if
        ///     a timeline instance is hosted in a flyout</summary>

        if (this._scroller.scrollLeft !== this._scrollPos) {
            _start("restoreDisplay:scrollCanvas");
            this._scroller.scrollLeft = this._scrollPos;
            _stop("restoreDisplay:scrollCanvas");
        }
    };

    Timeline.prototype.resetArrowHost = function (host) {
        /// <summary>hides the arrows from any prior arrow host, then updates the arrow host
        ///     to be a new element.  This allows the arrows to be placed as children of a 
        ///     different element than the one hosting the timeline itself.  this can be
        ///     useful for breaking out of an overflow:hidden region that is intentionally
        ///     obscuring parts of the timeline, but which should not obscure the arrows.  mouse
        ///     pointer event registration is also redone if needed since that is where we want
        ///     to listen for motion to show the arrows</summary>
        /// <param name="host" type="DOMElement">the new host into which to render the arrows</param>

        var oldArrowHost = this._arrowHost;
        if (oldArrowHost && host && oldArrowHost !== host)
        {
            this._hideArrows();
            
            if (this._hooked) {
                oldArrowHost.removeEventListener("MSPointerMove", this._onPointerMove, false);
                host.addEventListener("MSPointerMove", this._onPointerMove, false);
                oldArrowHost.removeEventListener("keydown", this._onKeyDown, false);
                host.addEventListener("keydown", this._onKeyDown, false);
            }

            this._arrowHost = host;

            if (this._alwaysShowArrows) {
                // will add the arrows back in to the new host only if already realized
                this.setAlwaysShowArrows(true);
            }
        }
    };

    //
    // Private
    //

    // Helpers

    Timeline.prototype._updateState = function() {
        _start("_updateState");

        _start("_updateState:itemWidth");
        this._itemWidth = this._realized[0].el.offsetWidth;
        _stop("_updateState:itemWidth");

        this._resizeCanvas();
        this._doScroll();
        this._scroller.style.visibility = "";

        // technically our focus has changed
        var data = this._realized[0];
        this.raiseEvent("focusChanged", data);

        _stop("_updateState");
    };

    Timeline.prototype._hookEvents = function() {
        // add event hooks
        this._scroller.addEventListener("keydown", this._onKeyScroll, false);
        this._scroller.addEventListener("scroll",  this._onScroll,    false);

        this._arrowHost.addEventListener("MSPointerMove", this._onPointerMove, false);
        this._arrowHost.addEventListener("keydown",       this._onKeyDown,     false);

        Jx.EventManager.addListener(Jx.root, "resizeWindow", this._onResizeWindow, this);

        if (this._options.hookWheel) {
            this._host.addEventListener("wheel", this._onMouseWheel, false);
        }
    };

    Timeline.prototype._setBoundaries = function(itemWidth, index) {
        // calculate the total number of *virtual* items we allow at a time
        var maxItems        = Math.floor(Timeline.MAX_WIDTH / itemWidth),
            maxItemsPerSide = Math.floor(Timeline.MAX_SIDE  / itemWidth);

        this._leftIndex  = Math.max(index            - maxItemsPerSide, this._left);
        this._rightIndex = Math.min(this._leftIndex  + maxItems,        this._right);
        this._leftIndex  = Math.max(this._rightIndex - maxItems,        this._left);
    };

    Timeline.prototype._hideRemovedElements = function() {
        var i, len;

        // hide any potentially visible, removed elements
        for (i = 0, len = this._removing.length; i < len; i++) {
            this._removing[i].el.style.visibility = "hidden";
        }
        for (i = 0, len = this._removed.length; i < len; i++) {
            this._removed[i].el.style.visibility = "hidden";
        }
    };

    Timeline.prototype._removeItems = function() {
        // remove all of our realized items
        for (var i = 0, len = this._realized.length; i < len; i++) {
            var data = this._realized.shift();

            this._removed.push(data);
            data.cached = false;

            // notify that the item was removed
            this.raiseEvent("itemRemoved", data);
            data.jobset.dispose();
        }
    };

    Timeline.prototype._createElement = function(index, isVisible) {
        _start("_createElement");

        var item   = this._source.getItem(index),
            html   = this._renderer(item),
            jobset = this._rootJobset.createChild();
        jobset.setVisibility(isVisible);

        // append the item to the canvas
        _start("_createElement:insertHtml");
        this._canvas.insertAdjacentHTML("beforeend", html);
        _stop("_createElement:insertHtml");

        // set some data on the element
        var el     = this._canvas.lastChild,
            offset = (index - this._leftIndex) * this._itemWidth + "px";

        if (this._isRtl) {
            el.style.right = offset;
        } else {
            el.style.left  = offset;
        }

        var data = {
            index: index,
            item:  item,

            el:     el,
            cached: !isVisible,

            jobset: jobset
        };

        // notify that the item was created
        _start("_createElement:itemRealized");
        this.raiseEvent("itemRealized", data);
        _stop("_createElement:itemRealized");

        _stop("_createElement");
        return data;
    };

    Timeline.prototype._getElement = function(index, isVisible) {
        _start("_getElement");

        var data = this._removed.pop();

        // if we don't have an item that's already been completed removed, try
        // actually removing one.
        if (!data) {
            data = this._removing.pop();

            if (data) {
                this.raiseEvent("itemRemoved", data);
                data.jobset.dispose();
            }
        }

        if (data) {
            var item   = this._source.getItem(index),
                offset = (index - this._leftIndex) * this._itemWidth + "px",
                style  = data.el.style;

            // set its new position
            if (this._isRtl) {
                style.right = offset;
            } else {
                style.left  = offset;
            }

            // show it
            style.visibility = "";

            // save some data about which item it's showing
            var oldItem = data.item;
            data.index  = index;
            data.item   = item;
            data.cached = !isVisible;

            data.jobset = this._rootJobset.createChild();
            data.jobset.setVisibility(isVisible);

            // if it has focus, remove it
            if (!this._options.leaveFocus) {
                if (data.el.querySelector(":focus")) {
                    if (!this._host.isDisabled) {
                        this._host.setActive();
                    }
                }
            }

            // recycle it
            _start("_recycler");
            this._recycler(oldItem, data);
            _stop("_recycler");
        } else {
            data = this._createElement(index, isVisible);
        }

        this._setHidden(data.el, !isVisible);

        _stop("_getElement");
        return data;
    };

    Timeline.prototype._setHidden = function (element, isHidden) {
        /// <summary>Sets (or unsets) aria-hidden on the given element</summary>

        if (isHidden) {
            element.setAttribute("aria-hidden", true);
        } else {
            // Need to do things this way becuase if aria-hidden is present and false, 
            // the item will be added to the accessibility tree even if it wouldn't otherwise be there.
            element.removeAttribute("aria-hidden");
        }
    };

    Timeline.prototype._onMoveLeft = function(ev) {
        var change = this._isRtl ? 1 : -1;
        this.setFocusedIndex(this._start + change);
        this._showArrows();

        ev.stopPropagation();
        ev.preventDefault();

        Jx.scheduler.prioritizeInvisible();
    };

    Timeline.prototype._onMoveRight = function(ev) {
        var change = this._isRtl ? -1 : 1;
        this.setFocusedIndex(this._start + change);
        this._showArrows();

        ev.stopPropagation();
        ev.preventDefault();

        Jx.scheduler.prioritizeInvisible();
    };

    Timeline.prototype._showArrows = function() {
        if (!this._arrows) {
            // we don't have the arrows so create them
            var html = tmplArrows();

            this._arrowHost.insertAdjacentHTML("beforeend", html);
            this._arrows = this._arrowHost.querySelectorAll(".timelineArrow");

            // hook events
            this._arrows[0].addEventListener("click", this._onMoveLeft);
            this._arrows[1].addEventListener("click", this._onMoveRight);

            this._arrows[0].addEventListener("mousemove", this._onMouseMoveArrow);
            this._arrows[1].addEventListener("mousemove", this._onMouseMoveArrow);

            this._arrows[0].addEventListener("mouseout", this._setArrowTimeout);
            this._arrows[1].addEventListener("mouseout", this._setArrowTimeout);
        }

        // show or don't show the proper arrows
        this._updateArrows(this._scrollerWidth, this._scrollWidth, this._scrollPos);

        // make sure the arrows are in the dom
        if (!this._arrows[0].parentNode) {
            this._arrowHost.appendChild(this._arrows[0]);
            this._arrowHost.appendChild(this._arrows[1]);
        }
    };

    Timeline.prototype._updateArrows = function(offsetWidth, scrollWidth, scrollLeft) {
        // hide either or both if we can't scroll further
        if (scrollLeft === 0) {
            this._arrows[0].style.display = "none";
        } else {
            this._arrows[0].style.display = "";
        }

        if (scrollLeft === scrollWidth - offsetWidth) {
            this._arrows[1].style.display = "none";
        } else {
            this._arrows[1].style.display = "";
        }
    };

    Timeline.prototype._onMouseMoveArrow = function(ev) {
        clearTimeout(this._arrowTimeout);
        ev.stopPropagation();
    };

    Timeline.prototype._setArrowTimeout = function() {
        if (!this._alwaysShowArrows) {
            clearTimeout(this._arrowTimeout);
            this._arrowTimeout = setTimeout(this._hideArrows, 1000);
        }
    };

    Timeline.prototype._hideArrows = function() {
        if (this._arrows && this._arrowHost.children.length) {
            this._arrowHost.removeChild(this._arrows[0]);
            this._arrowHost.removeChild(this._arrows[1]);
        }
    };

    // Events

    Timeline.prototype._onKeyDown = function(ev) {
        var key = Jx.key.mapKeyCode(ev.keyCode),
            change;

        if (key === Jx.KeyCode.pageup ||
            (ev.ctrlKey && key === Jx.KeyCode.h)) {
            change = -1;
        } else if (key === Jx.KeyCode.pagedown ||
                   (ev.ctrlKey && key === Jx.KeyCode.j)) {
            change = 1;
        }

        if (change) {
            if (this._isRtl) {
                change *= -1;
            }

            this.setFocusedIndex(this._start + change);

            ev.stopPropagation();
            ev.preventDefault();
        }
    };

    Timeline.prototype._onKeyScroll = function(ev) {
        var key = Jx.key.mapKeyCode(ev.keyCode);

        switch (key) {
        case Jx.KeyCode.pageup:
        case Jx.KeyCode.pagedown:
        case Jx.KeyCode.leftarrow:
        case Jx.KeyCode.rightarrow:
        case Jx.KeyCode.uparrow:
        case Jx.KeyCode.downarrow:
            ev.preventDefault();
            break;
        }
    };

    Timeline.prototype._applyStrictScrolling = function() {
        /// <summary>if strict ordering is enabled, this will force the primary realized
        ///     instance to be ordered first among its siblings in the DOM.  this is to
        ///     make it be the first focus in the timeline so that when it is shown after
        ///     having been display none, the renderer logic will not jump away from the
        ///     explicitly set scroll offset due to finding an earlier focused element</summary>

        if (this._canvas && this._options.strictOrder) {
            // make sure that whatever is in realized[0] is the first child, since otherwise
            // bad focus conditions can come up on hide/show
            var data = this.getRealized()[0];
            if (data && data.el !== this._canvas.firstElementChild) {
                this._canvas.insertAdjacentElement("afterbegin", data.el);
            }
        }
    };

    Timeline.prototype._safeGetOffsetWidth = function(getLive) {
        /// <summary>returns the fixed width for the timeline host if available, otherwise 
        ///     get the live or cached host width as requested</summary>
        /// <param name="getLive" type="Boolean">true gets the live value (if available), otherwise the cached
        ///     value is returned</param>
        /// <returns type="Number">effective offset width of the host</returns>

        _start("_safeGetOffsetWidth");

        var width = 0;

        if (this._hasFixedWidth) {
            width = this._fixedWidth;
        } else {
            if (getLive) {
                if (this._host) {
                    width = this._host.offsetWidth;
                }
            } else {
                width = this._scrollerWidth;
            }
        }

        _stop("_safeGetOffsetWidth");

        return width;
    };

    Timeline.prototype._doScroll = function() {
        /// <summary>internal non-event-handler method to call _onScroll, forcing scrolling to occur.
        ///     since _onScroll is an event handler for the scroll event, it only takes an event as
        ///     a parameter, so a flag is used to control some of its behavior.  if we want the scroll
        ///     logic to fire even for small scrolls (such as an explicitly set scroll), then we can
        ///     set _forceScroll.  this method handles this so we don't forget.</summary>

        this._forceScroll = true;
        this._onScroll();
    };

    Timeline.prototype._onScroll = function() {  // ev
        /// <summary>handles recalculating the instances visible in the current scroll conditions.</summary>

        _start("_onScroll");

        var forceScroll = this._forceScroll;
        this._forceScroll = false;

        // ensure we have a valid host
        _start("_onScroll:checkHost");
        var hostWidth = this._safeGetOffsetWidth(false);  // fixed or cached
        _stop("_onScroll:checkHost");

        // there seem to be cases in which we get scroll events after the timeline has been shutdown, so
        // we make sure that we don't run code that might be dependent on fields that have been nulled out
        
        // _realized is a proxy for whether we have been shutdown
        if (hostWidth && this._realized) {  
            // initialize some variables we'd need regardless of scroll direction
            var oldScrollPos = this._scrollPos;
            var scrollLeft = this._scroller.scrollLeft;
            var scrollRight = scrollLeft + this._scrollerWidth;
            var itemWidth = this._itemWidth;

            this._scrollPos = scrollLeft;
            _log("_onScroll", scrollLeft);

            var scrollDelta = Math.abs(oldScrollPos - this._scrollPos);

            if (oldScrollPos !== scrollLeft || forceScroll) {

                // cancel any outstanding jobs now that we know we are scrolling
                this._jobset.cancelAllChildJobs();

                if (oldScrollPos !== scrollLeft) {
                    Jx.scheduler.prioritizeInvisible();
                }

                // page left/right, which narrator does when it pans horizontally, moves
                // the width of the scrolling region - (2 * (average width of a default
                // system font character)).  this comes out to 12 in most cases, but we
                // use 50 to safely account for other locales and high dpi.
                //
                // in addition, with smooth panning, no single legitimate pan should go
                // within 50 pixels of our scrolling region's full width.  if it does,
                // jumping the extra <50 pixels won't be noticed.
                if ((hostWidth - 50) <= scrollDelta) {
                    var offset = this._scroller.scrollLeft % itemWidth;

                    if (offset) {
                        if (oldScrollPos < this._scrollPos) {
                            this._scroller.scrollLeft += (itemWidth - offset);
                        } else {
                            this._scroller.scrollLeft -= offset;
                        }

                        return;
                    }
                }

                var first      = this._realized[0],
                    firstIndex = first.index;

                var len       = this._realized.length,
                    last      = this._realized[len - 1],
                    lastIndex = last.index;

                // calculate the valid range of items
                var start = Math.max(Math.floor((scrollLeft + itemWidth / 2) / itemWidth) + this._leftIndex, this._leftIndex),
                    end   = Math.min(Math.ceil((scrollRight + itemWidth / 2) / itemWidth) + this._leftIndex, this._rightIndex + 1);

                // small differences in the width can make the ceil be one too large, so try to detect when that happens
                // by looking for the width to render exceeding the viewport by some significant margin
                var OVERFLOW_MARGIN = 10;
                var adjustedWidth = hostWidth + OVERFLOW_MARGIN;
                while ((end - start) * itemWidth > adjustedWidth) {
                    --end;
                }

                var cacheStart = Math.max(start - 1, this._leftIndex),
                    cacheEnd   = Math.min(end   + 1, this._rightIndex + 1);

                var i, data, isVisible;

                if (start !== this._start || end !== this._end) {
                    if (start < this._start || end < this._end) {
                        // we moved backwards
                        for (i = lastIndex; cacheEnd <= i && firstIndex <= i; i--) {
                            data = this._realized.pop();
                            this._removing.push(data);
                            data.jobset.cancelAllChildJobs();
                        }

                        for (; firstIndex <= i; i--) {
                            isVisible = (start <= i && i < end);
                            data = this._realized[i - firstIndex];

                            this._setHidden(data.el, !isVisible);
                            data.jobset.setVisibility(isVisible);
                            data.cached = !isVisible;
                        }

                        // add the first part of the range
                        for (i = Math.min(firstIndex, end) - 1; start <= i; i--) {
                            this._realized.unshift(this._getElement(i, true));
                        }
                    } else {
                        // we moved forwards
                        for (i = firstIndex; i < cacheStart && i <= lastIndex; i++) {
                            data = this._realized.shift();
                            this._removing.push(data);
                            data.jobset.cancelAllChildJobs();
                        }

                        for (firstIndex = i; i <= lastIndex; i++) {
                            isVisible = (start <= i && i < end);
                            data = this._realized[i - firstIndex];

                            this._setHidden(data.el, !isVisible);
                            data.jobset.setVisibility(isVisible);
                            data.cached = !isVisible;
                        }

                        // add the last part of the range
                        for (i = Math.max(lastIndex + 1, start); i < end; i++) {
                            this._realized.push(this._getElement(i, true));
                        }
                    }
                }

                this._applyStrictScrolling();

                this._jobset.addUIJob(this, this._cacheItems, null, People.Priority.scroll);

                // check if our focus has changed
                if (start !== this._start) {
                    for (i = 0, len = this._realized.length; i < len; i++) {
                        data = this._realized[i];

                        if (data.index === start) {
                            this.raiseEvent("focusChanged", data);
                            break;
                        }
                    }
                }

                this._start = start;
                this._end   = end;

                this._cacheStart = cacheStart;
                this._cacheEnd   = cacheEnd;

                // if we've reached the end of our range, try to adjust to center
                if ((this._start === this._leftIndex      && this._leftIndex  !== this._left) ||
                    (this._end   === this._rightIndex + 1 && this._rightIndex !== this._right)) {
                    this.setFocusedIndex(this._start);
                } else {
                    // if our arrows are in the dom, make sure the right ones are shown
                    if (this._arrows && this._arrows[0].parentNode) {
                        this._updateArrows(this._scrollerWidth, this._scrollWidth, scrollLeft);
                    }
                }

                // reset mouse-wheel accumulation
                this._wheelAccumulation = 0;
                // Light dismiss when the user scrolls
                Jx.EventManager.broadcast("lightDismiss", false);
            }
        } else if (this._jobset) {
            // always cancel jobs if not visible (but only if our jobset is still valid)
            this._jobset.cancelAllChildJobs();
        }

        _stop("_onScroll");
    };

    Timeline.prototype._cacheItems = function() {
        _start("_cacheItems");

        function unshift(index) {
            this._realized.unshift(this._getElement(index, false));
        }

        function push(index) {
            this._realized.push(this._getElement(index, false));
        }

        var i;

        for (i = this._realized[0].index - 1; this._cacheStart <= i; i--) {
            this._jobset.addUIJob(this, unshift, [i], People.Priority.realizeHeader);
        }

        for (i = this._realized[this._realized.length - 1].index + 1; i < this._cacheEnd; i++) {
            this._jobset.addUIJob(this, push, [i], People.Priority.realizeHeader);
        }

        // schedule removing old items
        this._jobset.addUIJob(this, this._removeOldItems, null, People.Priority.launch);
        _stop("_cacheItems");
    };

    Timeline.prototype._removeOldItems = function() {
        // notify of removed items
        for (var i = 0, len = this._removing.length; i < len; i++) {
            var data = this._removing.pop();

            this.raiseEvent("itemRemoved", data);
            data.jobset.dispose();

            this._removed.push(data);
        }
    };

    Timeline.prototype._onPointerMove = function(ev) {
        // we only care about mouse movement
        if (ev.pointerType === "mouse") {
            this._showArrows();
            this._setArrowTimeout();
        }
    };

    Timeline.prototype._onMouseWheel = function(ev) {
        // accumulate the scroll and calculate our threshold for switching focus
        this._wheelAccumulation += ev.deltaY;
        var threshold = this._itemWidth * Timeline._wheelThresholdFactor;

        // if we've met the threshold, change our focus
        if (threshold < Math.abs(this._wheelAccumulation)) {
            var change = 1;

            // which way we move depends on the scroll direction
            if (this._wheelAccumulation < 0) {
                change = -1;
            }

            // set the new focused item and reset our accumulated scrolls
            this.setFocusedIndex(this._start + change);
            this._wheelAccumulation = 0;
        }

        Jx.scheduler.prioritizeInvisible();
    };

    Timeline.prototype._onResizeWindow = function() {
        var offsetWidth;

        _start("_onResizeWindow:_checkHost");
        offsetWidth = this._safeGetOffsetWidth(true);  // fixed or live
        _stop("_onResizeWindow:_checkHost");

        if (offsetWidth) {
            // hide any elements that are no longer needed
            this._hideRemovedElements();

            var activeElement = document.activeElement;

            _start("_onResizeWindow:itemWidth");
            this._itemWidth = this._realized[0].el.offsetWidth;
            _stop("_onResizeWindow:itemWidth");
            this._resizeCanvas();

            // explicitly handle the scroll here rather than waiting for the scroll event (we don't
            // get a scroll event when going all the way from to snap to full screen).  this won't result
            // in double scroll handling, since this call happens before a regular scroll event.  
            // when the later scroll event occurs at the same position, it will be ignored
            this._doScroll();

            if (activeElement && !this._options.noFocusOnResize) {
                Jx.safeSetActive(activeElement);
            }
        }
    };

    Timeline.prototype._resizeCanvas = function() {
        _start("_resizeCanvas");

        // get some basic info about our current state
        var first = this._realized[0];

        if (first.cached && this._realized[1]) {
            first = this._realized[1];
        }

        var firstIndex = first.index;

        // set our snap points based on our item widths
        this._scroller.style.msScrollSnapPointsX = "snapInterval(0px, " + this._itemWidth + "px)";

        // figure out if our focused item is offset
        var percent = 0,
            offset;

        if (this._leftIndex) {
            var oldLeft  = parseInt(this._isRtl ? first.el.style.right : first.el.style.left, 10),
                oldWidth = oldLeft / (firstIndex - this._leftIndex);

            offset  = this._scrollPos % oldWidth;
            percent = offset / oldWidth;
        }

        // calculate our new left and right indices
        this._setBoundaries(this._itemWidth, firstIndex);

        // calculate our total size
        var count       = this._rightIndex - this._leftIndex + 1,
            canvasWidth = this._itemWidth * count;
        this._canvas.style.width = canvasWidth + "px";

        // make sure everything is in the right places, before we scroll
        for (var i = 0, len = this._realized.length; i < len; i++) {
            var data  = this._realized[i],
                index = data.index;
            offset = this._itemWidth * (index - this._leftIndex) + "px";

            if (this._isRtl) {
                data.el.style.right = offset;
            } else {
                data.el.style.left  = offset;
            }
        }

        // update our scroll position
        this._scrollPos = (firstIndex - this._leftIndex + percent) * this._itemWidth;

        _start("_resizeCanvas:scrollCanvas");
        this._scroller.scrollLeft = this._scrollPos;
        _stop("_resizeCanvas:scrollCanvas");
        _log("scrollCanvas", this._scrollPos);

        // setting scrollLeft will have just forced a layout.  now we should be able
        // to get and cache the scroller's width and scroll area.
        this._scrollerWidth = this._scroller.offsetWidth;
        this._scrollWidth   = this._scroller.scrollWidth;

        _stop("_resizeCanvas");
    };

    Timeline.prototype.setScrollable = function(isScrollable) {
        this._scroller.style["overflow-x"] = (isScrollable ? "scroll" : "hidden");
    };

});