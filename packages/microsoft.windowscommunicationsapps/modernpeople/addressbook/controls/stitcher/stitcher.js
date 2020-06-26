Jx.delayDefine(People, "Stitcher", function() {
    var n = window.People;
    n.Stitcher = function() {
        n.Viewport.call(this);
        this._isExtentReady = []
    }
    ;
    Jx.inherit(n.Stitcher, n.Viewport);
    n.Stitcher.prototype.addChild = function(t) {
        var i = new n.OffsetViewport(this.getJobSet().createChild(),t);
        this.appendChild(i);
        this._isExtentReady.push(false)
    }
    ;
    n.Stitcher.prototype.getUI = function(n) {
        this._initializationComplete = true;
        n.html = "<div id='" + this._id + "' class='stitcher'>" + this._children.reduce(function(n, t) {
            return n + Jx.getUI(t).html
        }, "") + "<\/div>"
    }
    ;
    n.Stitcher.prototype.activateUI = function() {
        var f = this.getOrientation() === n.Orientation.horizontal, e = f ? "grid-column" : "grid-row", i = document.getElementById(this._id), r, o, s, t, h, u;
        for (Array.prototype.forEach.call(i.childNodes, function(n, t) {
            n.style.setProperty(e, (t + 1).toString())
        }),
        r = "",
        t = 0; t < i.childNodes.length; t++)
            r += "auto ";
        for (r += "minmax(1fr, 100%)",
        i.style.setProperty(e + "s", r),
        Jx.Component.prototype.activateUI.call(this),
        o = getComputedStyle(i)[f ? "marginLeft" : "marginTop"],
        s = this._margin = parseInt(o),
        t = 0,
        h = this.getChildrenCount(); t < h; ++t)
            u = this.getChild(t),
            u.setOffset(u.getOffset() + s);
        this._zoomSection = i.childNodes.length - 1;
        Array.prototype.forEach.call(i.childNodes, function(n, t) {
            n.addEventListener("focus", this._onFocusChange.bind(this, t), true)
        }, this)
    }
    ;
    n.Stitcher.prototype._onFocusChange = function(n) {
        this._zoomSection = n
    }
    ;
    n.Stitcher.prototype.setCurrentItem = function(n) {
        var r, t, i;
        for (this._zoomSection = 0,
        r = this.getChildrenCount(),
        t = r - 1; t >= 0; --t)
            if (i = this.getChild(t),
            i.getOffset() < n.scrollPos) {
                this._zoomSection = t;
                break
            }
        i.setCurrentItem(n)
    }
    ;
    n.Stitcher.prototype.getCurrentItem = function(n) {
        n.section = this._zoomSection;
        var t = this.getChild(this._zoomSection);
        return t.getCurrentItem(n)
    }
    ;
    n.Stitcher.prototype.positionItem = function(n) {
        var i = this.getChild(n.section)
          , t = i.positionItem(n);
        return t.scrollPos -= this._margin,
        t
    }
    ;
    n.Stitcher.prototype.extentReady = function(n) {
        for (var t = 0, r = this.getChildrenCount(), u = true, f, i, e, t = 0; t < r; ++t)
            if (f = this.getChild(t),
            f === n) {
                this._isExtentReady[t] = true;
                break
            } else
                this._isExtentReady[t] || (u = false);
        if (u) {
            for (this._rendering && this._renderChildren(t + 1),
            i = true,
            t = t + 1; t < r; ++t)
                if (!this._isExtentReady[t]) {
                    i = false;
                    break
                }
            i && (e = this.getParent(),
            e.extentReady(this))
        }
    }
    ;
    n.Stitcher.prototype._renderChildren = function(n) {
        for (var r, t = n, i = this.getChildrenCount(); t < i; ++t)
            if (r = this.getChild(t),
            r.render(),
            !this._isExtentReady[t])
                break;
        t >= i - 1
    }
    ;
    n.Stitcher.prototype.extentChanged = function(n, t, i) {
        for (var s = this.indexOfChild(n), e = [], f, o, r = s + 1, u = this.getChildrenCount(); r < u; ++r)
            f = this.getChild(r),
            e.push(f.suppressScrollEvents()),
            f.setOffset(f.getOffset() + i);
        for (o = this.getParent(),
        o.extentChanged(this, t, i),
        r = 0,
        u = e.length; r < u; ++r)
            e[r].enableScrollEvents()
    }
    ;
    n.Stitcher.prototype.hydrateExtent = function(t) {
        for (var f = n.Hydration.get(t, "sections", {}), r, i = 0, u = this.getChildrenCount(); i < u; ++i)
            r = this.getChild(i),
            r.getJobSet().setOrder(i),
            r.hydrateExtent(n.Hydration.get(f, r.name, {}))
    }
    ;
    n.Stitcher.prototype.hydratePosition = function(t) {
        var f = n.Hydration.get(t, "lastVisibleSection", ""), i, e, r, u, o;
        if (Jx.isNonEmptyString(f))
            for (i = 0,
            e = this.getChildrenCount(); i < e; ++i)
                r = this.getChild(i),
                u = r.name,
                u === f && (o = n.Hydration.get(t, "sections", {}),
                r.hydratePosition(n.Hydration.get(o, u, {})))
    }
    ;
    n.Stitcher.prototype.dehydrate = function(t) {
        var i = 0, e = this.getChildrenCount(), u = {}, f = null, r, o, s;
        if (t) {
            for (o = this.getParent(),
            s = o.getScrollPosition(),
            i = 0; i < e; ++i) {
                if (r = this.getChild(i),
                r.getOffset() > s)
                    break;
                f = r
            }
            f !== null && n.Hydration.set(u, "lastVisibleSection", f.name)
        }
        for (u.sections = {},
        i = 0; i < e; ++i)
            r = this.getChild(i),
            u.sections[r.name] = r.dehydrate(r === f);
        return u
    }
    ;
    n.Stitcher.prototype.render = function() {
        this._rendering = true;
        this._renderChildren(0);
        var n = this._perfJobSet = this.getJobSet().createChild();
        n.setOrder(this.getChildrenCount())
    }
    ;
    n.Stitcher.prototype.scroll = function(n, t) {
        for (var u, i = 0, r = this.getChildrenCount(); i < r; ++i)
            u = this.getChild(i),
            u.scroll(n, t)
    }
    ;
    n.Stitcher.prototype.resize = function() {
        this.forEachChild(function(n) {
            n.resize()
        })
    }
    ;
    n.Stitcher.prototype.shutdownComponent = function() {
        n.Viewport.prototype.shutdownComponent.call(this);
        this._perfJobSet && (this._perfJobSet.dispose(),
        this._perfJobSet = null);
        this.forEachChild(function(n) {
            n.getJobSet().dispose()
        })
    }
    ;
    n.Stitcher.prototype._zoomSection = -1;
    n.Stitcher.prototype._isExtentReady = null;
    n.Stitcher.prototype._rendering = false;
    n.Stitcher.prototype._initializationComplete = false;
    n.Stitcher.prototype._perfJobSet = null
})
