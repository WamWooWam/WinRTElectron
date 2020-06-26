Jx.delayDefine(People.Grid, "Layout", function() {
    var u = window.People
      , f = u.Grid
      , t = WinJS.Utilities
      , i = u.Orientation
      , n = f.Layout = function(n, t, i) {
        this._viewport = n;
        this._containerElement = t;
        this._canonicalType = i;
        this._rows = 0;
        this.dir = "ltr";
        this._grid = null;
        this._pooledCells = null;
        this._itemScrollableExtent = 0;
        this._itemOrthogonalExtent = 0;
        this._containerOrthogonalExtent = 0;
        this._scrollableExtent = 0;
        this._orthogonalExtent = 0;
        this._wrapperSpacer = 0;
        this._canvas = null;
        this._wrapper = null;
        this._leadingStylerEdge = null;
        this._visibleStylerBlock = null;
        this._orthogonalAttr = null;
        this._scrollableAttr = null;
        this._dimensions = null;
        this._coverTemplate = null;
        this._covers = [];
        this._ariaFlowStart = null;
        this._ariaFlowEnd = null;
        this._lastBackgroundPosition = 0
    }
      , r = f.Layout._dimension = {};
    r[i.horizontal] = {
        scrollableOffset: {
            rtl: ["marginRight", "paddingRight"],
            ltr: ["marginLeft", "paddingLeft"]
        },
        orthogonalOffset: "offsetTop",
        scrollableExtentAttr: "width",
        orthogonalExtentAttr: "height",
        getScrollableExtent: t.getTotalWidth,
        getOrthogonalExtent: t.getTotalHeight,
        getOrthogonalContent: t.getContentHeight,
        orthogonalSpacers: ["paddingTop", "paddingBottom", "marginTop", "marginBottom"],
        orthogonalAttr: {
            rtl: "top",
            ltr: "top"
        },
        scrollableAttr: {
            rtl: "right",
            ltr: "left"
        },
        scrollableBackgroundPosition: "backgroundPositionX"
    };
    r[i.vertical] = {
        scrollableOffset: {
            rtl: ["marginTop", "paddingTop"],
            ltr: ["marginTop", "paddingTop"]
        },
        orthogonalOffset: "offsetLeft",
        scrollableExtentAttr: "height",
        orthogonalExtentAttr: "width",
        getScrollableExtent: t.getTotalHeight,
        getOrthogonalExtent: t.getTotalWidth,
        getOrthogonalContent: t.getContentWidth,
        orthogonalSpacers: ["paddingLeft", "paddingRight", "marginLeft", "marginRight"],
        orthogonalAttr: {
            rtl: "right",
            ltr: "left"
        },
        scrollableAttr: {
            rtl: "top",
            ltr: "top"
        },
        scrollableBackgroundPosition: "backgroundPositionY"
    };
    n.prototype.initialize = function(n, t) {
        this._pooledCells = n;
        this._grid = t;
        this._initializeDom()
    }
    ;
    n.prototype.calculateSize = function(n) {
        return Math.ceil(n / this._rows) * this._itemScrollableExtent
    }
    ;
    n.prototype.getExtent = function() {
        return this._scrollableExtent
    }
    ;
    n.prototype.getItemScrollableExtent = function() {
        return this._itemScrollableExtent
    }
    ;
    n.prototype.getLowerBoundIndex = function(n) {
        return Math.max(0, Math.floor(n / this._itemScrollableExtent) * this._rows)
    }
    ;
    n.prototype.getUpperBoundIndex = function(n) {
        return Math.ceil(n / this._itemScrollableExtent) * this._rows - 1
    }
    ;
    n.prototype.getCanvas = function() {
        return this._canvas
    }
    ;
    n.prototype.getVisibleBlock = function() {
        return this._visibleStylerBlock
    }
    ;
    n.prototype.getDimensions = function() {
        return this._dimensions
    }
    ;
    n.prototype.getScrollableAttr = function() {
        return this._scrollableAttr
    }
    ;
    n.prototype.getOrthogonalAttr = function() {
        return this._orthogonalAttr
    }
    ;
    n.prototype.setSize = function(n, t) {
        if (n !== this._scrollableExtent) {
            this._containerElement.style[this._dimensions.scrollableExtentAttr] = n + "px";
            var i = n - this._scrollableExtent;
            this._scrollableExtent = n;
            this._viewport.extentChanged(this, this.calculateScrollPos(t) + this._itemScrollableExtent, i)
        }
    }
    ;
    n.prototype._createElements = function() {
        var n = "ariaFlowStart" + Jx.uid()
          , t = "ariaFlowEnd" + Jx.uid();
        this._containerElement.innerHTML = "<div class='gridWrapper'><div class='gridStyler'><div class='leadingEdge'><\/div><div class='visibleBlock'><\/div><div class='trailingEdge'><\/div><\/div><div id='" + n + "'><\/div><div class='gridCanvas'><\/div><div id='" + t + "'><\/div><\/div>";
        this._wrapper = this._containerElement.querySelector(".gridWrapper");
        this._leadingStylerEdge = this._containerElement.querySelector(".leadingEdge");
        this._visibleStylerBlock = this._containerElement.querySelector(".visibleBlock");
        this._canvas = this._containerElement.querySelector(".gridCanvas");
        this._ariaFlowStart = this._containerElement.querySelector("#" + n);
        this._ariaFlowEnd = this._containerElement.querySelector("#" + t)
    }
    ;
    n.prototype._initializeDom = function() {
        var s = this._viewport.getOrientation(), n = this._dimensions = r[s], e, u, h, o;
        this._createElements();
        var t = this._pooledCells.getPool(this._canonicalType).pop()
          , i = t.node.getElement()
          , f = i.style;
        f.visibility = "hidden";
        t.show();
        e = getComputedStyle(this._containerElement);
        u = this.dir = e.direction;
        this._scrollableAttr = n.scrollableAttr[u];
        this._orthogonalAttr = n.orthogonalAttr[u];
        h = getComputedStyle(i);
        this._itemScrollableExtent = n.getScrollableExtent(i);
        this._itemOrthogonalExtent = n.getOrthogonalExtent(i);
        this._containerOrthogonalExtent = n.getOrthogonalContent(this._containerElement);
        o = this._viewport.getViewportExtent() + this._itemScrollableExtent * 2;
        this._visibleStylerBlock.style[n.scrollableExtentAttr] = o + "px";
        Jx.log.info("Grid.Layout, extent: " + this._containerOrthogonalExtent);
        this._rows = this._calculateRows();
        this._setCanvasOrthogonalExtent();
        f.visibility = "";
        t.hide();
        t.returnToPool()
    }
    ;
    n.prototype.hydrateScrollPosition = function(n) {
        if (n > 0 && this._visibleStylerBlock.getComputedStyle().display !== "none") {
            var t = n - this._itemScrollableExtent;
            t > 0 && (this._leadingStylerEdge.style[this._dimensions.scrollableExtentAttr] = t + "px")
        }
    }
    ;
    n.prototype._setCanvasOrthogonalExtent = function() {
        this._orthogonalExtent = this._rows * this._itemOrthogonalExtent;
        Jx.log.info("Grid.Layout, canvas extent: " + this._orthogonalExtent);
        this._canvas.style[this._dimensions.orthogonalExtentAttr] = this._orthogonalExtent + "px"
    }
    ;
    n.prototype.getAriaFlowStart = function() {
        return this._ariaFlowStart
    }
    ;
    n.prototype.getAriaFlowEnd = function() {
        return this._ariaFlowEnd
    }
    ;
    n.prototype.getOrthogonalExtent = function() {
        return this._orthogonalExtent
    }
    ;
    n.prototype.getCanvasScrollableOffset = function() {
        var n = this._wrapper
          , i = getComputedStyle(n);
        return this._dimensions.scrollableOffset[this.dir].reduce(function(r, u) {
            return r + t.convertToPixels(n, i[u])
        }, 0)
    }
    ;
    n.prototype.getGridIndexFromPosition = function(n) {
        return n.orthoPos -= this._canvas[this._dimensions.orthogonalOffset],
        this.getLowerBoundIndex(n.scrollPos) + Math.min(this._rows - 1, Math.max(0, Math.floor(n.orthoPos / this._itemOrthogonalExtent)))
    }
    ;
    n.prototype.getPositionFromCell = function(n) {
        return this._getPositionFromCoordinates(n.scrollablePos, n.orthogonalPos)
    }
    ;
    n.prototype.getPositionFromGridIndex = function(n) {
        return this._getPositionFromCoordinates(this.calculateScrollPos(n), this.calculateOrthogonal(this.calculateRow(n)))
    }
    ;
    n.prototype._getPositionFromCoordinates = function(n, t) {
        var i = {
            scrollPos: n,
            orthoPos: t
        };
        return i[this._dimensions.scrollableExtentAttr] = this._itemScrollableExtent,
        i[this._dimensions.orthogonalExtentAttr] = this._itemOrthogonalExtent,
        i
    }
    ;
    n.prototype.getItemOrthogonalExtent = function() {
        return this._itemOrthogonalExtent
    }
    ;
    n.prototype.setOrthogonalPos = function(n, t, i) {
        n.orthogonalPos !== t && (n.orthogonalPos = t,
        i[this._orthogonalAttr] = t + "px")
    }
    ;
    n.prototype.setScrollablePos = function(n, t, i) {
        n.scrollablePos !== t && (n.scrollablePos = t,
        i[this._scrollableAttr] = t + "px")
    }
    ;
    n.prototype._setOrthogonalPos = function(n, t) {
        this.setOrthogonalPos(n, this.calculateOrthogonal(this.calculateRow(n.gridIndex)), t)
    }
    ;
    n.prototype._setScrollablePos = function(n, t) {
        this.setScrollablePos(n, this.calculateScrollPos(n.gridIndex), t)
    }
    ;
    n.prototype.calculateScrollPosEx = function(n, t) {
        return this._calculateColumn(n, t) * this._itemScrollableExtent
    }
    ;
    n.prototype.calculateScrollPos = function(n) {
        return this.calculateScrollPosEx(n, this._rows)
    }
    ;
    n.prototype.calculateColumn = function(n) {
        return this._calculateColumn(n, this._rows)
    }
    ;
    n.prototype._calculateColumn = function(n, t) {
        return Math.floor(n / t)
    }
    ;
    n.prototype.calculateRow = function(n) {
        return n % this._rows
    }
    ;
    n.prototype.calculateOrthogonal = function(n) {
        return n * this._itemOrthogonalExtent
    }
    ;
    n.prototype.positionCell = function(n) {
        var t = n.node.getElement().style;
        this._setOrthogonalPos(n, t);
        this._setScrollablePos(n, t)
    }
    ;
    n.prototype.prepareCell = function(n, t) {
        this._grid.prepareCell(n, t, this.calculateRow(t))
    }
    ;
    n.prototype.createCell = function(n, t) {
        var i = this.calculateRow(t)
          , u = this.calculateOrthogonal(i)
          , r = this._pooledCells.getCell(n, u);
        return this._grid.prepareCell(r, t, i),
        r
    }
    ;
    n.prototype.getRows = function() {
        return this._rows
    }
    ;
    n.prototype._calculateRows = function() {
        var n = this._wrapper
          , i = getComputedStyle(n);
        return this._wrapperSpacer = this._dimensions.orthogonalSpacers.reduce(function(r, u) {
            return r + t.convertToPixels(n, i[u])
        }, 0),
        Math.max(1, Math.floor((this._containerOrthogonalExtent - this._wrapperSpacer) / this._itemOrthogonalExtent))
    }
    ;
    n.prototype.onResize = function() {
        var n = this._dimensions.getOrthogonalContent(this._containerElement), t, i;
        if (Jx.log.info("Grid.Layout.onResize, extent: " + n),
        n > 0 && n !== this._containerOrthogonalExtent && (this._containerOrthogonalExtent = n,
        t = this._calculateRows(),
        t !== this._rows)) {
            i = this._rows;
            this._rows = t;
            this._setCanvasOrthogonalExtent();
            this._grid.onRowsChanged(i)
        }
    }
    ;
    n.prototype._getCoverTemplate = function() {
        if (!this._coverTemplate) {
            var n = this._coverTemplate = document.createElement("div");
            n.className = "patch";
            n.style.position = "absolute";
            n.style[this._dimensions.scrollableExtentAttr] = this._itemScrollableExtent + "px";
            n.style[this._dimensions.orthogonalExtentAttr] = this._itemOrthogonalExtent + "px"
        }
        return this._coverTemplate
    }
    ;
    n.prototype.coverEmptySpaces = function(n) {
        var i = this._covers
          , r = i.splice(0, n.length)
          , t = null
          , u = null;
        i.forEach(function(n) {
            n.remove()
        });
        n.length > r.length && (t = document.createDocumentFragment(),
        u = this._getCoverTemplate());
        this._covers = n.map(function(n, i) {
            var f = r[i];
            return f || (f = u.cloneNode(true),
            t.appendChild(f)),
            f.style[this._scrollableAttr] = this.calculateScrollPos(n) + "px",
            f.style[this._orthogonalAttr] = this.calculateOrthogonal(this.calculateRow(n)) + "px",
            f
        }, this);
        t && this._canvas.appendChild(t)
    }
    ;
    n.prototype.adjustBackground = function(n) {
        var t = this.calculateScrollPos(n);
        this.dir === "rtl" && this._viewport.getOrientation() === i.horizontal && (t = this._scrollableExtent - t);
        Math.abs(t - this._lastBackgroundPosition) > 1e4 && (Jx.log.warning("Adjusting background position to " + t),
        this._canvas.style[this._dimensions.scrollableBackgroundPosition] = t + "px",
        this._lastBackgroundPosition = t)
    }
})
