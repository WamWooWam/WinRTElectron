Jx.delayDefine(Calendar.Controls, "Timeline", function() {
    function t(n) {
        Jx.mark("Calendar:Timeline." + n + ",StartTA,Calendar")
    }
    function i(n) {
        Jx.mark("Calendar:Timeline." + n + ",StopTA,Calendar")
    }
    function r(n, t) {
        Jx.mark("Calendar:Timeline." + n + ": " + t)
    }
    function u() {
        return '<input type="button" class="timelineArrow left" value="" tabindex="0" aria-label="' + Jx.escapeHtml(Jx.res.getString("AccBackArrow")) + '"><input type="button" class="timelineArrow right" value="" tabindex="0" aria-label="' + Jx.escapeHtml(Jx.res.getString("AccForwardArrow")) + '">'
    }
    var n = Calendar.Controls.Timeline = function(n, t, i, r, u, f) {
        this._host = n;
        this._arrowHost = n;
        this._rootJobset = t.createChild();
        this._source = i;
        this._renderer = r;
        this._recycler = u;
        this._options = f || {};
        this._realized = [];
        this._removing = [];
        this._removed = [];
        this._itemWidth = 0;
        this._start = 0;
        this._forceScroll = false;
        f = this._options;
        f.fixedWidth ? (this._hasFixedWidth = true,
        this._fixedWidth = f.fixedWidth) : this._hasFixedWidth = false;
        this._jobset = this._rootJobset.createChild();
        this._jobset.setVisibility(false);
        this._isRtl = Jx.isRtl();
        this._scroller = document.createElement("div");
        this._scroller.className = "timelineScroller";
        this._scroller.style.visibility = "hidden";
        this._scroller.setAttribute("role", "list");
        this._host.appendChild(this._scroller);
        this._scrollPos = 0;
        this._canvas = document.createElement("div");
        this._canvas.style.height = "100%";
        this._scroller.appendChild(this._canvas);
        f.arrowHost && (this._arrowHost = f.arrowHost);
        this._onMoveLeft = this._onMoveLeft.bind(this);
        this._onMoveRight = this._onMoveRight.bind(this);
        this._onMouseMoveArrow = this._onMouseMoveArrow.bind(this);
        this._setArrowTimeout = this._setArrowTimeout.bind(this);
        this._hideArrows = this._hideArrows.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyScroll = this._onKeyScroll.bind(this);
        this._onScroll = this._onScroll.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onMouseWheel = this._onMouseWheel.bind(this);
        this._resizeCanvas = this._resizeCanvas.bind(this)
    }
    ;
    Jx.augment(n, Jx.Events);
    n._wheelThresholdFactor = .1;
    n.MAX_WIDTH = 1e6;
    n.MAX_SIDE = n.MAX_WIDTH / 2;
    n.prototype.initialize = function(n) {
        t("initialize");
        this._start = n || 0;
        this._left = -this._source.left();
        this._right = this._source.right();
        this._removeItems();
        this._rootJobset.cancelAllChildJobs();
        this._realized = [this._getElement(this._start, true)];
        this._updateState();
        this._hooked || (this._hookEvents(),
        this._hooked = true);
        this._alwaysShowArrows && this._showArrows();
        i("initialize")
    }
    ;
    n.prototype.uninitialize = function() {
        t("uninitialize");
        this._removeItems();
        this._rootJobset.cancelAllChildJobs();
        this._hooked && (Jx.EventManager.removeListener(Jx.root, "resizeWindow", this._onResizeWindow, this),
        this._scroller.removeEventListener("scroll", this._onScroll, false),
        this._scroller.removeEventListener("keydown", this._onKeyScroll, false),
        this._host.removeEventListener("wheel", this._onMouseWheel, false),
        this._arrowHost.removeEventListener("keydown", this._onKeyDown, false),
        this._arrowHost.removeEventListener("MSPointerMove", this._onPointerMove, false),
        this._hooked = false);
        i("uninitialize")
    }
    ;
    n.prototype.shutdown = function() {
        t("shutdown");
        this.uninitialize();
        this._rootJobset.dispose();
        this._host.innerHTML = "";
        clearTimeout(this._arrowTimeout);
        this._canvas = null;
        this._scroller = null;
        this._host = null;
        this._arrows = null;
        this._options = null;
        this._recycler = null;
        this._renderer = null;
        this._source = null;
        this._jobset = null;
        this._rootJobset = null;
        this._removed = null;
        this._removing = null;
        this._realized = null;
        i("shutdown")
    }
    ;
    n.prototype.setAlwaysShowArrows = function(n) {
        this._alwaysShowArrows = n;
        this._realized.length && (n ? this._showArrows() : this._hideArrows())
    }
    ;
    n.prototype.setFocusedIndex = function(n) {
        var o, f, e, s, u;
        if (r("setFocusedIndex", n),
        n = Math.max(this._left, Math.min(this._right, n)),
        n === this._start)
            for (this._hideRemovedElements(),
            o = this._leftIndex,
            this._setBoundaries(this._itemWidth, n),
            f = this._itemWidth * (o - this._leftIndex),
            this._scrollPos += f,
            t("setFocusedIndex:scrollCanvas"),
            this._scroller.scrollLeft = this._scrollPos,
            i("setFocusedIndex:scrollCanvas"),
            r("scrollCanvas", this._scrollPos),
            e = 0,
            s = this._realized.length; e < s; e++)
                u = this._realized[e].el.style,
                this._isRtl ? u.right = parseInt(u.right, 10) + f + "px" : u.left = parseInt(u.left, 10) + f + "px";
//        else
            // (n < this._leftIndex || n > this._rightIndex - this._realized.length) && this._setBoundaries(this._itemWidth, n),
            // this._scrollPos = this._itemWidth * (n - this._leftIndex),
            // this._scrollPos !== this._scroller.scrollLeft && (t("setFocusedIndex:scrollCanvas"),
            // this._scroller.scrollLeft = this._scrollPos,
            // i("setFocusedIndex:scrollCanvas"),
            // r("scrollCanvas", this._scrollPos));
        this._doScroll()
    }
    ;
    n.prototype.getFocusedIndex = function() {
        return this._start
    }
    ;
    n.prototype.getRealized = function(n) {
        var t = this._realized, i = 0, r = t.length, u;
        return n || (t[i].cached && (i = 1),
        u = r - 1,
        t[u].cached && (r = u)),
        t.slice(i, r)
    }
    ;
    n.prototype.restoreDisplay = function() {
        this._scroller.scrollLeft !== this._scrollPos && (t("restoreDisplay:scrollCanvas"),
        this._scroller.scrollLeft = this._scrollPos,
        i("restoreDisplay:scrollCanvas"))
    }
    ;
    n.prototype.resetArrowHost = function(n) {
        var t = this._arrowHost;
        t && n && t !== n && (this._hideArrows(),
        this._hooked && (t.removeEventListener("MSPointerMove", this._onPointerMove, false),
        n.addEventListener("MSPointerMove", this._onPointerMove, false),
        t.removeEventListener("keydown", this._onKeyDown, false),
        n.addEventListener("keydown", this._onKeyDown, false)),
        this._arrowHost = n,
        this._alwaysShowArrows && this.setAlwaysShowArrows(true))
    }
    ;
    n.prototype._updateState = function() {
        t("_updateState");
        t("_updateState:itemWidth");
        this._itemWidth = this._realized[0].el.offsetWidth;
        i("_updateState:itemWidth");
        this._resizeCanvas();
        this._doScroll();
        this._scroller.style.visibility = "";
        var n = this._realized[0];
        this.raiseEvent("focusChanged", n);
        i("_updateState")
    }
    ;
    n.prototype._hookEvents = function() {
        this._scroller.addEventListener("keydown", this._onKeyScroll, false);
        this._scroller.addEventListener("scroll", this._onScroll, false);
        this._arrowHost.addEventListener("MSPointerMove", this._onPointerMove, false);
        this._arrowHost.addEventListener("keydown", this._onKeyDown, false);
        Jx.EventManager.addListener(Jx.root, "resizeWindow", this._onResizeWindow, this);
        this._options.hookWheel && this._host.addEventListener("wheel", this._onMouseWheel, false)
    }
    ;
    n.prototype._setBoundaries = function(t, i) {
        var r = Math.floor(n.MAX_WIDTH / t)
          , u = Math.floor(n.MAX_SIDE / t);
        this._leftIndex = Math.max(i - u, this._left);
        this._rightIndex = Math.min(this._leftIndex + r, this._right);
        this._leftIndex = Math.max(this._rightIndex - r, this._left)
    }
    ;
    n.prototype._hideRemovedElements = function() {
        for (var n = 0, t = this._removing.length; n < t; n++)
            this._removing[n].el.style.visibility = "hidden";
        for (n = 0,
        t = this._removed.length; n < t; n++)
            this._removed[n].el.style.visibility = "hidden"
    }
    ;
    n.prototype._removeItems = function() {
        for (var n, t = 0, i = this._realized.length; t < i; t++)
            n = this._realized.shift(),
            this._removed.push(n),
            n.cached = false,
            this.raiseEvent("itemRemoved", n),
            n.jobset.dispose()
    }
    ;
    n.prototype._createElement = function(n, r) {
        var u, f, e;
        t("_createElement");
        var o = this._source.getItem(n)
          , h = this._renderer(o)
          , s = this._rootJobset.createChild();
        return s.setVisibility(r),
        t("_createElement:insertHtml"),
        this._canvas.insertAdjacentHTML("beforeend", h),
        i("_createElement:insertHtml"),
        u = this._canvas.lastChild,
        f = (n - this._leftIndex) * this._itemWidth + "px",
        this._isRtl ? u.style.right = f : u.style.left = f,
        e = {
            index: n,
            item: o,
            el: u,
            cached: !r,
            jobset: s
        },
        t("_createElement:itemRealized"),
        this.raiseEvent("itemRealized", e),
        i("_createElement:itemRealized"),
        i("_createElement"),
        e
    }
    ;
    n.prototype._getElement = function(n, r) {
        var u, o;
        if (t("_getElement"),
        u = this._removed.pop(),
        u || (u = this._removing.pop(),
        u && (this.raiseEvent("itemRemoved", u),
        u.jobset.dispose())),
        u) {
            var s = this._source.getItem(n)
              , e = (n - this._leftIndex) * this._itemWidth + "px"
              , f = u.el.style;
            this._isRtl ? f.right = e : f.left = e;
            f.visibility = "";
            o = u.item;
            u.index = n;
            u.item = s;
            u.cached = !r;
            u.jobset = this._rootJobset.createChild();
            u.jobset.setVisibility(r);
            this._options.leaveFocus || u.el.querySelector(":focus") && (this._host.isDisabled || this._host.setActive());
            t("_recycler");
            this._recycler(o, u);
            i("_recycler")
        } else
            u = this._createElement(n, r);
        return this._setHidden(u.el, !r),
        i("_getElement"),
        u
    }
    ;
    n.prototype._setHidden = function(n, t) {
        t ? n.setAttribute("aria-hidden", true) : n.removeAttribute("aria-hidden")
    }
    ;
    n.prototype._onMoveLeft = function(n) {
        var t = this._isRtl ? 1 : -1;
        this.setFocusedIndex(this._start + t);
        this._showArrows();
        n.stopPropagation();
        n.preventDefault();
        Jx.scheduler.prioritizeInvisible()
    }
    ;
    n.prototype._onMoveRight = function(n) {
        var t = this._isRtl ? -1 : 1;
        this.setFocusedIndex(this._start + t);
        this._showArrows();
        n.stopPropagation();
        n.preventDefault();
        Jx.scheduler.prioritizeInvisible()
    }
    ;
    n.prototype._showArrows = function() {
        if (!this._arrows) {
            var n = u();
            this._arrowHost.insertAdjacentHTML("beforeend", n);
            this._arrows = this._arrowHost.querySelectorAll(".timelineArrow");
            this._arrows[0].addEventListener("click", this._onMoveLeft);
            this._arrows[1].addEventListener("click", this._onMoveRight);
            this._arrows[0].addEventListener("mousemove", this._onMouseMoveArrow);
            this._arrows[1].addEventListener("mousemove", this._onMouseMoveArrow);
            this._arrows[0].addEventListener("mouseout", this._setArrowTimeout);
            this._arrows[1].addEventListener("mouseout", this._setArrowTimeout)
        }
        this._updateArrows(this._scrollerWidth, this._scrollWidth, this._scrollPos);
        this._arrows[0].parentNode || (this._arrowHost.appendChild(this._arrows[0]),
        this._arrowHost.appendChild(this._arrows[1]))
    }
    ;
    n.prototype._updateArrows = function(n, t, i) {
        this._arrows[0].style.display = i === 0 ? "none" : "";
        this._arrows[1].style.display = i === t - n ? "none" : ""
    }
    ;
    n.prototype._onMouseMoveArrow = function(n) {
        clearTimeout(this._arrowTimeout);
        n.stopPropagation()
    }
    ;
    n.prototype._setArrowTimeout = function() {
        this._alwaysShowArrows || (clearTimeout(this._arrowTimeout),
        this._arrowTimeout = setTimeout(this._hideArrows, 1e3))
    }
    ;
    n.prototype._hideArrows = function() {
        this._arrows && this._arrowHost.children.length && (this._arrowHost.removeChild(this._arrows[0]),
        this._arrowHost.removeChild(this._arrows[1]))
    }
    ;
    n.prototype._onKeyDown = function(n) {
        var i = Jx.key.mapKeyCode(n.keyCode), t;
        i === Jx.KeyCode.pageup || n.ctrlKey && i === Jx.KeyCode.h ? t = -1 : (i === Jx.KeyCode.pagedown || n.ctrlKey && i === Jx.KeyCode.j) && (t = 1);
        t && (this._isRtl && (t *= -1),
        this.setFocusedIndex(this._start + t),
        n.stopPropagation(),
        n.preventDefault())
    }
    ;
    n.prototype._onKeyScroll = function(n) {
        var t = Jx.key.mapKeyCode(n.keyCode);
        switch (t) {
        case Jx.KeyCode.pageup:
        case Jx.KeyCode.pagedown:
        case Jx.KeyCode.leftarrow:
        case Jx.KeyCode.rightarrow:
        case Jx.KeyCode.uparrow:
        case Jx.KeyCode.downarrow:
            n.preventDefault()
        }
    }
    ;
    n.prototype._applyStrictScrolling = function() {
        if (this._canvas && this._options.strictOrder) {
            var n = this.getRealized()[0];
            n && n.el !== this._canvas.firstElementChild && this._canvas.insertAdjacentElement("afterbegin", n.el)
        }
    }
    ;
    n.prototype._safeGetOffsetWidth = function(n) {
        t("_safeGetOffsetWidth");
        var r = 0;
        return this._hasFixedWidth ? r = this._fixedWidth : n ? this._host && (r = this._host.offsetWidth) : r = this._scrollerWidth,
        i("_safeGetOffsetWidth"),
        r
    }
    ;
    n.prototype._doScroll = function() {
        this._forceScroll = true;
        this._onScroll()
    }
    ;
    n.prototype._onScroll = function() {
        var k, l, d, v, w, b, n, u, o;
        if (t("_onScroll"),
        k = this._forceScroll,
        this._forceScroll = false,
        t("_onScroll:checkHost"),
        l = this._safeGetOffsetWidth(false),
        i("_onScroll:checkHost"),
        l && this._realized) {
            var a = this._scrollPos
              , s = this._scrollPos
              , g = s + this._scrollerWidth
              , h = this._itemWidth;
            if (this._scrollPos = s,
            r("_onScroll", s),
            d = Math.abs(a - this._scrollPos),
            a !== s || k) {
                if (this._jobset.cancelAllChildJobs(),
                a !== s && Jx.scheduler.prioritizeInvisible(),
                l - 50 <= d && (v = this._scrollPos % h,
                v)) {
                    a < this._scrollPos ? this._scrollPos += h - v : this._scrollPos -= v;
                    return
                }
                for (var nt = this._realized[0], c = nt.index, p = this._realized.length, tt = this._realized[p - 1], y = tt.index, f = Math.max(Math.floor((s + h / 2) / h) + this._leftIndex, this._leftIndex), e = Math.min(Math.ceil((g + h / 2) / h) + this._leftIndex, this._rightIndex + 1), it = l + 10; (e - f) * h > it; )
                    --e;
                if (w = Math.max(f - 1, this._leftIndex),
                b = Math.min(e + 1, this._rightIndex + 1),
                f !== this._start || e !== this._end)
                    if (f < this._start || e < this._end) {
                        for (n = y; b <= n && c <= n; n--)
                            u = this._realized.pop(),
                            this._removing.push(u),
                            u.jobset.cancelAllChildJobs();
                        for (; c <= n; n--)
                            o = f <= n && n < e,
                            u = this._realized[n - c],
                            this._setHidden(u.el, !o),
                            u.jobset.setVisibility(o),
                            u.cached = !o;
                        for (n = Math.min(c, e) - 1; f <= n; n--)
                            this._realized.unshift(this._getElement(n, true))
                    } else {
                        for (n = c; n < w && n <= y; n++)
                            u = this._realized.shift(),
                            this._removing.push(u),
                            u.jobset.cancelAllChildJobs();
                        for (c = n; n <= y; n++)
                            o = f <= n && n < e,
                            u = this._realized[n - c],
                            this._setHidden(u.el, !o),
                            u.jobset.setVisibility(o),
                            u.cached = !o;
                        for (n = Math.max(y + 1, f); n < e; n++)
                            this._realized.push(this._getElement(n, true))
                    }
                if (this._applyStrictScrolling(),
                this._jobset.addUIJob(this, this._cacheItems, null, People.Priority.scroll),
                f !== this._start)
                    for (n = 0,
                    p = this._realized.length; n < p; n++)
                        if (u = this._realized[n],
                        u.index === f) {
                            this.raiseEvent("focusChanged", u);
                            break
                        }
                this._start = f;
                this._end = e;
                this._cacheStart = w;
                this._cacheEnd = b;
                this._start === this._leftIndex && this._leftIndex !== this._left || this._end === this._rightIndex + 1 && this._rightIndex !== this._right ? this.setFocusedIndex(this._start) : this._arrows && this._arrows[0].parentNode && this._updateArrows(this._scrollerWidth, this._scrollWidth, s);
                this._wheelAccumulation = 0;
                Jx.EventManager.broadcast("lightDismiss", false)
            }
        } else
            this._jobset && this._jobset.cancelAllChildJobs();
        i("_onScroll")
    }
    ;
    n.prototype._cacheItems = function() {
        function r(n) {
            this._realized.unshift(this._getElement(n, false))
        }
        function u(n) {
            this._realized.push(this._getElement(n, false))
        }
        t("_cacheItems");
        for (var n = this._realized[0].index - 1; this._cacheStart <= n; n--)
            this._jobset.addUIJob(this, r, [n], People.Priority.realizeHeader);
        for (n = this._realized[this._realized.length - 1].index + 1; n < this._cacheEnd; n++)
            this._jobset.addUIJob(this, u, [n], People.Priority.realizeHeader);
        this._jobset.addUIJob(this, this._removeOldItems, null, People.Priority.launch);
        i("_cacheItems")
    }
    ;
    n.prototype._removeOldItems = function() {
        for (var n, t = 0, i = this._removing.length; t < i; t++)
            n = this._removing.pop(),
            this.raiseEvent("itemRemoved", n),
            n.jobset.dispose(),
            this._removed.push(n)
    }
    ;
    n.prototype._onPointerMove = function(n) {
        n.pointerType === "mouse" && (this._showArrows(),
        this._setArrowTimeout())
    }
    ;
    n.prototype._onMouseWheel = function(t) {
        var r, i;
        this._wheelAccumulation += t.deltaY;
        r = this._itemWidth * n._wheelThresholdFactor;
        r < Math.abs(this._wheelAccumulation) && (i = 1,
        this._wheelAccumulation < 0 && (i = -1),
        this.setFocusedIndex(this._start + i),
        this._wheelAccumulation = 0);
        Jx.scheduler.prioritizeInvisible()
    }
    ;
    n.prototype._onResizeWindow = function() {
        var r, n;
        t("_onResizeWindow:_checkHost");
        r = this._safeGetOffsetWidth(true);
        i("_onResizeWindow:_checkHost");
        r && (this._hideRemovedElements(),
        n = document.activeElement,
        t("_onResizeWindow:itemWidth"),
        this._itemWidth = this._realized[0].el.offsetWidth,
        i("_onResizeWindow:itemWidth"),
        this._resizeCanvas(),
        this._doScroll(),
        n && !this._options.noFocusOnResize && Jx.safeSetActive(n))
    }
    ;
    n.prototype._resizeCanvas = function() {
        var n, f, s, u, c, h, l, a, e, v, o, y;
        for (t("_resizeCanvas"),
        n = this._realized[0],
        n.cached && this._realized[1] && (n = this._realized[1]),
        f = n.index,
        this._scroller.style.msScrollSnapPointsX = "snapInterval(0px, " + this._itemWidth + "px)",
        s = 0,
        this._leftIndex && (c = parseInt(this._isRtl ? n.el.style.right : n.el.style.left, 10),
        h = c / (f - this._leftIndex),
        u = this._scrollPos % h,
        s = u / h),
        this._setBoundaries(this._itemWidth, f),
        l = this._rightIndex - this._leftIndex + 1,
        a = this._itemWidth * l,
        this._canvas.style.width = a + "px",
        e = 0,
        v = this._realized.length; e < v; e++)
            o = this._realized[e],
            y = o.index,
            u = this._itemWidth * (y - this._leftIndex) + "px",
            this._isRtl ? o.el.style.right = u : o.el.style.left = u;
        this._scrollPos = (f - this._leftIndex + s) * this._itemWidth;
        t("_resizeCanvas:scrollCanvas");
        this._scroller.scrollLeft = this._scrollPos;
        i("_resizeCanvas:scrollCanvas");
        r("scrollCanvas", this._scrollPos);
        this._scrollerWidth = this._scroller.offsetWidth;
        this._scrollWidth = this._scroller.scrollWidth;
        i("_resizeCanvas")
    }
    ;
    n.prototype.setScrollable = function(n) {
        this._scroller.style["overflow-x"] = n ? "scroll" : "hidden"
    }
})
