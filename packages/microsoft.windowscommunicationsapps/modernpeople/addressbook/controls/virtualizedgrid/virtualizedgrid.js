Jx.delayDefine(People.Grid, ["createGrid", "VirtualizedGrid"], function() {
    "use strict";
    function v() {
        return "VG_id_" + String(c++) + "_"
    }
    function e(n, i) {
        return t.binarySearch(n, i, t.difference)
    }
    function y(n, t) {
        return n - t.gridIndex
    }
    function h() {
        this._cells.length > 0 && (this._placeholder !== null && (this._canvas.removeChild(this._placeholder.getElement()),
        this._placeholder = null),
        this._setFocus(this._getFirstVisibleCell(), {
            maintainOnly: true
        }))
    }
    var u = window.People, i = u.Grid, s = i.Cell, p = i.Reflow, t = u.Sequence, f = u.DeferredCollection, o = u.Priority, r = u.Hydration, n = i.VirtualizedGrid = function(n) {
        this._unloadedGroupCount = 0;
        this._initializeItems(n.items);
        this._pooledCells = n.pooledCells;
        this._layout = n.layout;
        this._jobSet = n.jobSet;
        this._viewport = n.viewport;
        this._cells = [];
        this._groupGridIndices = [];
        this._cumulativeGroupLengths = [];
        this._lastGridIndex = 0;
        this._uniqueGridId = n.uniqueGridId;
        this._focusedCell = null;
        this._placeholder = null;
        this._canvas = null;
        this._keyNavigation = null;
        this._minGridIndexView = 0;
        this._maxGridIndexView = 0;
        this._minVisibleIndex = 0;
        this._maxVisibleIndex = 0;
        this._lastVisibleIndex = -1;
        this._minPoolIndex = 0;
        this._maxPoolIndex = 0;
        this._setAllAriaScheduled = false;
        this._handleChangesScheduled = false;
        this._changesPending = false;
        this._animating = false;
        this._reflow = null;
        this._cellCreator = null;
        this._gridNotifier = null;
        this.notifyVisibleCellsRealized = Jx.fnEmpty
    }
    , c, l, a;
    i.createGrid = function(t) {
        var e = v()
          , h = t.canonicalType || Object.keys(t.factories)[0]
          , u = new i.Layout(t.viewport,t.containerElement,h)
          , f = new i.CellCreator({
            jobSet: t.jobSet,
            layout: u,
            uniqueGridId: e
        })
          , o = new i.PooledCells(f,t.factories)
          , r = new n({
            items: t.items,
            jobSet: t.jobSet,
            layout: u,
            pooledCells: o,
            uniqueGridId: e,
            viewport: t.viewport
        })
          , s = new i.GridNotifier(r);
        return f.initialize(s),
        u.initialize(o, r),
        r.initialize(f, s),
        r
    }
    ;
    n._grids = {};
    c = 0;
    n.prototype._binarySearchGridIndex = function(n) {
        return t.binarySearch(this._cells, n, y)
    }
    ;
    n.prototype._binarySearchGroups = function(n) {
        return e(this._groupGridIndices, n)
    }
    ;
    n.prototype._getCollectionByGridIndex = function(n) {
        var t = Math.min(this._items.length - 1, this._binarySearchGroups(n));
        return this._items.getItem(t).collection
    }
    ;
    n.prototype.dispose = function() {
        this._groupListeners.forEach(Jx.dispose);
        this._cellCreator.getCells().forEach(Jx.dispose);
        this._changesPending = false;
        this._viewport = null
    }
    ;
    n.prototype.onGroupLoaded = function() {
        this._applyChanges(true, []);
        --this._unloadedGroupCount == 0 && this._focusedCell === null && (this._ensureOneKeyboardFocusableCell = h,
        this._ensureOneKeyboardFocusableCell());
        this.notifyVisibleCellsRealized(null)
    }
    ;
    n.prototype.onChangesPending = function() {
        this._changesPending = true;
        this._handleChangesScheduled || this._animating || (this._handleChangesScheduled = true,
        this._jobSet.addUIJob(this, this._handlePendingChanges, [], o.queryUpdate))
    }
    ;
    n.prototype._calculateNewItemOffset = function(n, t) {
        var r = n.groupIndex, u = this._headerOffsets[r], e = n.itemOffset, o = e - u, i, s;
        return o !== -1 ? (i = f.updateIndex(t[n.groupIndex] || [], o),
        i !== f.removed ? i + u : f.removed) : (s = this._items.getItem(r).collection.length === 0,
        s ? f.removed : e)
    }
    ;
    n.prototype._updateItemOffset = function(n, t) {
        var i = this._calculateNewItemOffset(n, t);
        return i !== f.removed && (n.itemOffset = i,
        this._recalculateGridIndex(n)),
        i
    }
    ;
    n.prototype._handlePendingChanges = function() {
        for (var t = this._items, r = Array(t.length), i, n = 0, u = t.length; n < u; ++n)
            i = t.getItem(n).collection,
            r[n] = i.isLoaded ? i.acceptPendingChanges() : [];
        this._changesPending = this._handleChangesScheduled = false;
        this._applyChanges(false, r)
    }
    ;
    n.prototype._addToRemoved = function(n, t) {
        n === this._focusedCell && this._setFocus(null, {
            maintainOnly: true,
            leakCell: true
        });
        t.push(n)
    }
    ;
    n.prototype.resetAnimationTimeout = function() {
        this._reflow.resetAnimationTimeout()
    }
    ;
    l = t.compareBy("gridIndex");
    n.prototype._applyChanges = function(n, i) {
        var o, p, h, w, b, k, v, y, g;
        var nt = this._calculateSize()
          , r = this._cells
          , c = []
          , e = []
          , u = [];
        for (this._updateGroupVisibility(this._minVisibleIndex, this._maxVisibleIndex),
        this._focusedCell !== null && this._isNotInCells(this._focusedCell) && this._updateItemOffset(this._focusedCell, i) === f.removed && this._addToRemoved(this._focusedCell, c),
        o = r.length - 1; o >= 0; o--)
            p = r[o],
            this._updateItemOffset(p, i) === f.removed && (this._addToRemoved(p, c),
            r.splice(o, 1));
        if (r.sort(l),
        h = this._filterOuterCells(r),
        r.length !== 0) {
            w = this._createCellsInRange(this._minGridIndexView, r[0].gridIndex - 1);
            b = this._createCellsInRange(t.last(r).gridIndex + 1, this._maxGridIndexView);
            t.append(e, w);
            t.insert(r, 0, w);
            t.append(u, r);
            k = 0;
            for (var d = u[0], a = 1, tt = u.length; a < tt; d = v,
            a++)
                v = u[a],
                d.gridIndex < v.gridIndex - 1 && (y = this._createCellsInRange(d.gridIndex + 1, v.gridIndex - 1),
                t.append(e, y),
                t.insert(r, a + k, y),
                k += y.length);
            t.append(e, b);
            t.append(r, b)
        } else
            e = this._cells = this._createCellsInRange(this._minGridIndexView, this._maxGridIndexView);
        g = h.indexOf(this._focusedCell);
        g >= 0 && u.push(h.splice(g, 1)[0]);
        this._ensureOneKeyboardFocusableCell();
        e.forEach(s.realize);
        t.removeIf(u, s.didNotMove);
        n ? this._reflow.unanimatedReflow(c, u, e, h) : (this._animating = true,
        Jx.addClass(this._canvas, "animating"),
        this._reflow.reflow(c, u, e, h));
        this._hidePooledCells();
        this._scheduleSetAllAria();
        this._layout.setSize(nt, this._lastGridIndex)
    }
    ;
    n.prototype.onAnimationComplete = function() {
        Jx.removeClass(this._canvas, "animating");
        this._animating = false;
        this._changesPending && this.onChangesPending()
    }
    ;
    n.prototype._scheduleSetAllAria = function() {
        this._setAllAriaScheduled || (this._setAllAriaScheduled = true,
        this._jobSet.addUIJob(this, function() {
            this._scheduleAriaFlowRange(0, this._cells.length);
            this._forEachCell(this._updateAriaIndex, this);
            this._setAllAriaScheduled = false
        }, null, o.accessibility))
    }
    ;
    n.prototype._updateAriaIndex = function(n) {
        var i = this._cumulativeGroupLengths
          , r = n.groupIndex
          , u = n.itemOffset - this._headerOffsets[r]
          , f = i[r] + u + 1
          , e = t.last(i);
        u !== -1 && n.setAriaIndex(f, e)
    }
    ;
    n.prototype._returnUnfocusedToPool = function(n) {
        n !== this._focusedCell && n.returnToPool()
    }
    ;
    n.prototype.hydrate = function(n) {
        var t = r.get(n, "groupIndex", 0)
          , u = r.get(n, "itemOffset", 0)
          , i = t < this._groupGridIndices.length ? this._groupGridIndices[t] + u : 0
          , f = this._layout.getUpperBoundIndex(this._viewport.getViewportExtent()) + i;
        this._updateGroupVisibility(i, f)
    }
    ;
    n.prototype.contentReadyAsync = function() {
        var i = this, n;
        return Jx.addClass(this._canvas, "animating"),
        n = new WinJS.Promise(function(n) {
            i.notifyVisibleCellsRealized = function(i) {
                var f = this._getLastVisibleIndex(), e, r, o, c, s, h;
                if ((!i || i.gridIndex >= f) && (f >= 0 && this._minVisibleIndex <= this._lastGridIndex && this._getCollectionByGridIndex(this._minVisibleIndex).isLoaded && this._getCollectionByGridIndex(Math.max(0, this._maxVisibleIndex)).isLoaded && this._isInCells(this._minVisibleIndex) && this._isInCells(f) || this._unloadedGroupCount === 0)) {
                    if (this.notifyVisibleCellsRealized = Jx.fnEmpty,
                    this._gridNotifier.stopPositionNotification(),
                    e = [],
                    this._cells.length !== 0) {
                        for (r = {},
                        o = this._binarySearchGridIndex(this._minVisibleIndex),
                        c = Math.min(this._cells.length - 1, f); o <= c; ++o)
                            s = this._cells[o],
                            h = s.scrollablePos,
                            (r[h] || (r[h] = [])).push(s.getElement());
                        e = u.Animation.cropStaggeredList(Object.keys(r).map(t.value, r), 3);
                        t.append(e[0], [this._layout.getVisibleBlock()])
                    }
                    n(e)
                }
            }
        }
        ),
        this.notifyVisibleCellsRealized(null),
        n
    }
    ;
    n.prototype.onEnterComplete = function() {
        Jx.removeClass(this._canvas, "animating")
    }
    ;
    n.prototype._getLastVisibleIndex = function() {
        var n = this._lastVisibleIndex;
        if (n < 0) {
            n = Math.min(this._lastGridIndex, Math.max(0, this._maxVisibleIndex));
            var i = this._groupGridIndices
              , t = Math.min(this._items.length - 1, Math.max(0, this._binarySearchGroups(n)))
              , r = n - i[t] - this._headerOffsets[t];
            r === this._items.getItem(t).collection.length && (n = Math.max(0, n - 1));
            this._lastVisibleIndex = n
        }
        return n
    }
    ;
    n.prototype._updateGroupVisibility = function(n, t) {
        for (var r, i = 0; i < this._groupListeners.length; ++i)
            if (r = this._groupListeners[i],
            !r.isLoaded()) {
                var u = this._groupGridIndices[i]
                  , f = this._groupGridIndices[i + 1] - 1
                  , e = u >= n && u <= t || f >= n && f <= t || u < n && f > t;
                r.load(e, this._jobSet)
            }
    }
    ;
    n.prototype.hydratePosition = function(n) {
        var i = r.get(n, "groupIndex", 0), o = r.get(n, "itemOffset", 0), s = r.get(n, "orientation", u.Orientation.horizontal), f = 0, t, e;
        s === this._viewport.getOrientation() && (f = r.get(n, "pixelOffset", 0));
        t = 0;
        i < this._groupGridIndices.length && (e = this._groupGridIndices[i] + o,
        t = this._layout.calculateScrollPos(e) + f,
        this._viewport.setScrollPosition(t));
        this._layout.hydrateScrollPosition(t)
    }
    ;
    n.prototype.dehydrate = function() {
        var t = {}, o = this._viewport.getScrollPosition(), n = this._minVisibleIndex, u = this._layout.calculateScrollPos(n), i = o - u, f, s;
        return i > 0 && i / this._layout.getItemScrollableExtent() > .12 && (n = Math.min(this._maxVisibleIndex, n + this._layout.getRows()),
        u = this._layout.calculateScrollPos(n),
        i = o - u),
        f = e(this._groupGridIndices, n),
        s = n - this._groupGridIndices[f],
        r.set(t, "groupIndex", f),
        r.set(t, "itemOffset", s),
        r.set(t, "pixelOffset", i),
        r.set(t, "orientation", this._viewport.getOrientation()),
        t
    }
    ;
    n.prototype.scrollItemIntoView = function(n, t) {
        var r, i, u;
        r = this._headerOffsets[n] + t;
        i = this._groupGridIndices[n] + r;
        this._viewport.setScrollPosition(this._layout.calculateScrollPos(i));
        u = this._cells[this._binarySearchGridIndex(i)];
        this._setFocus(u, {
            keyboard: true
        })
    }
    ;
    n.prototype.initialize = function(n, t) {
        var r = this;
        this._canvas = this._layout.getCanvas();
        this._canvas.addEventListener("mousedown", this._onMouseDown.bind(this), false);
        this._canvas.addEventListener("zoomOnElement", function(n) {
            r._onMouseDown(n, {
                maintainOnly: true
            })
        }
        .bind(this), false);
        this._cellCreator = n;
        this._gridNotifier = t;
        this._keyNavigation = new i.Navigation(this,this._layout.dir,this._viewport.getOrientation());
        this._keyNavigation.bindToElement(this._canvas);
        this._layout.setSize(this._calculateSize(), 0);
        this._reflow = new i.Reflow(this._layout,this)
    }
    ;
    n.prototype._initializeItems = function(n) {
        var t, u, f;
        this._items = n;
        var r = n.length
          , e = this._groupListeners = Array(r)
          , o = this._headerOffsets = Array(r);
        for (t = 0; t < r; ++t)
            u = n.getItem(t),
            f = u.collection,
            e[t] = new i.GroupListener(t,f,this),
            o[t] = Jx.isObject(u.header) ? 1 : 0,
            f.isLoaded || ++this._unloadedGroupCount;
        this._ensureOneKeyboardFocusableCell = this._unloadedGroupCount !== 0 ? Jx.fnEmpty : h
    }
    ;
    n.prototype._calculateSize = function() {
        for (var i = this._items, r = this._layout.getRows(), a = r === 1 ? -1 : r - 1, n = 0, o = 0, s = [], f, e, t = 0, h = i.length; t < h; ++t) {
            var c = i.getItem(t)
              , u = c.collection.length
              , l = Jx.isObject(c.header);
            n % r === a && l && u > 0 && (this._lastVisibleIndex === n && (this._lastVisibleIndex = n - 1),
            s.push(n),
            ++n);
            this._groupGridIndices[t] = n;
            this._cumulativeGroupLengths[t] = o;
            o += u;
            u !== 0 && (n += (l ? 1 : 0) + u)
        }
        for (this._groupGridIndices[i.length] = n,
        this._cumulativeGroupLengths[i.length] = o,
        f = n - 1,
        (this._lastGridIndex < f && this._lastVisibleIndex === this._lastGridIndex && this._lastVisibleIndex < this._maxVisibleIndex || this._lastGridIndex > f) && (this._lastVisibleIndex = -1),
        this._lastGridIndex = f,
        e = n; e % r != 0; e++)
            s.push(e);
        return this._layout.coverEmptySpaces(s),
        this._layout.calculateSize(n)
    }
    ;
    n.prototype._recalculateGridIndex = function(n) {
        n.setGridIndex(this._groupGridIndices[n.groupIndex] + n.itemOffset)
    }
    ;
    n.prototype._repositionAll = function() {
        this._forEachCell(this._layout.positionCell, this._layout)
    }
    ;
    n.prototype.onRowsChanged = function(n) {
        var r = this._calculateSize();
        this._forEachCell(this._recalculateGridIndex, this);
        var u = this._layout.calculateScrollPosEx(this._minVisibleIndex, n)
          , t = this._viewport.getScrollPosition()
          , f = t - u
          , i = this._layout.calculateScrollPos(this._minVisibleIndex) + f
          , e = t >= 0 && t <= this._layout.getExtent();
        this._setBounds(i);
        this._returnOuterCellsToPools();
        this._hidePooledCells();
        this._layout.setSize(r, this._lastGridIndex);
        e && (this._addFringeCells(),
        this._viewport.setScrollPosition(i));
        this._jobSet.addUIJob(this, this._repositionAll, [], o.realizeItem);
        this._forEachCell(s.markPositionScheduled)
    }
    ;
    n.prototype._forEachCell = function(n, t) {
        this._cells.forEach(n, t);
        this._focusedCell !== null && this._isNotInCells(this._focusedCell) && n.call(t, this._focusedCell)
    }
    ;
    n.prototype._filterLowerBound = function(n, t) {
        var i = t.splice(0, this._binarySearchGridIndex(n - 1) + 1);
        return this._scheduleAriaFlowRange(0, 1),
        i
    }
    ;
    n.prototype._filterUpperBound = function(n, t) {
        var i = 1 + this._binarySearchGridIndex(n)
          , r = t.splice(i, t.length - i);
        return this._scheduleAriaFlowRange(i - 1, i),
        r
    }
    ;
    n.prototype._filterOuterCells = function(n) {
        return t.append(this._filterLowerBound(this._minPoolIndex, n), this._filterUpperBound(this._maxPoolIndex, n))
    }
    ;
    n.prototype._returnToPools = function(n) {
        n.forEach(this._returnUnfocusedToPool, this)
    }
    ;
    n.prototype._returnOuterCellsToPools = function() {
        this._returnToPools(this._filterOuterCells(this._cells))
    }
    ;
    n.prototype._addFringeCells = function() {
        this._addNewCells(-1, this._minGridIndexView, this._maxGridIndexView);
        this._addNewCells(1, this._minGridIndexView, this._maxGridIndexView)
    }
    ;
    n.prototype._isActiveElement = function(n) {
        return n === document.activeElement
    }
    ;
    n.prototype._setFocus = function(n, t) {
        var r, u, i;
        t = t || {};
        r = false;
        this._focusedCell !== null && (u = this._focusedCell.getElement(),
        u.tabIndex = -1,
        !t.leakCell && n !== this._focusedCell && this._isNotInCells(this._focusedCell) && this._focusedCell.returnToPool(),
        r = this._isActiveElement(u));
        Jx.isObject(n) && (i = n.getElement(),
        i.tabIndex = 0,
        (!t.maintainOnly || r) && (n.positionAndRealize(),
        t.keyboard ? i.focus() : i.focus()));
        this._focusedCell = n;
        this._ensureOneKeyboardFocusableCell = n ? Jx.fnEmpty : h
    }
    ;
    n.prototype._findCellByElement = function(n) {
        return t.findIndex(this._cells, i.Cell.cellElementEqual, n)
    }
    ;
    n.prototype._onMouseDown = function(n, t) {
        for (var i = n.target, r; i !== null && i.parentNode !== this._canvas; )
            i = i.parentNode;
        i !== null && (r = this._findCellByElement(i),
        r !== -1 && this._setFocus(this._cells[r], t))
    }
    ;
    n.prototype.jumpTo = function(n) {
        this._setFocusOnGridIndex(n ? 0 : this._lastGridIndex, {
            keyboard: true
        })
    }
    ;
    n.prototype.navigate = function(n, t) {
        var u, r, e;
        if (this._focusedCell !== null) {
            var o = this._focusedCell.gridIndex
              , i = o + this._layout.getRows() * n + t
              , f = this._binarySearchGridIndex(i);
            f >= 0 && f < this._cells.length && (u = this._cells[f],
            r = u.gridIndex,
            r === i ? this._setFocus(u, {
                keyboard: true
            }) : r === i - 1 && i % e == e - 1 && r !== this._lastGridIndex && (e = this._layout.getRows(),
            o !== r ? this._setFocus(u, {
                keyboard: true
            }) : this._setFocus(this._cells[this._binarySearchGridIndex(i + 1)], {
                keyboard: true
            })))
        }
    }
    ;
    n.prototype._setFocusOnGridIndex = function(n, t) {
        var i = e(this._groupGridIndices, n)
          , u = n - this._groupGridIndices[i]
          , r = this._getCellFromIndices(n, i, u);
        r.positionAndRealize();
        this._setFocus(r, t)
    }
    ;
    n.prototype._getCellFromIndices = function(n, t, r) {
        var o;
        if (this._isInCells(n))
            return this._cells[this._binarySearchGridIndex(n)];
        var f = r - this._headerOffsets[t]
          , u = this._items.getItem(t)
          , e = u.collection;
        return e.isLoaded ? (o = f === -1 ? u.header : e.getItem(f),
        this._createCell(o, t, r, n)) : this._headerOffsets[t] !== 0 ? this._createCell(u.header, t, 0, this._groupGridIndices[t]) : (this._placeholder = i.PseudoCell.create(this._layout, n, r, t, this._canvas),
        this._placeholder)
    }
    ;
    n.prototype.setCurrentItem = function(n) {
        if (this._cells.length > 0) {
            var t = Math.min(this._layout.getGridIndexFromPosition(n), this._lastGridIndex);
            this._setFocusOnGridIndex(t, {
                maintainOnly: true
            })
        }
    }
    ;
    n.prototype.getCurrentItem = function(n) {
        return this._cells.length === 0 ? this._getDefaultPosition() : (this._focusedCell === null && this._ensureOneKeyboardFocusableCell(),
        n.itemIndex = this._focusedCell.itemOffset - this._headerOffsets[this._focusedCell.groupIndex],
        n.groupIndex = this._focusedCell.groupIndex,
        this._layout.getPositionFromCell(this._focusedCell))
    }
    ;
    n.prototype.positionItem = function(n) {
        var e, t;
        if (Jx.isNullOrUndefined(n.itemIndex) || (e = this._getNearestActiveItem(n),
        t = e.groupIndex,
        t === -1))
            return this._getDefaultPosition();
        var s = this._headerOffsets[t] + e.itemIndex
          , o = this._groupGridIndices[t]
          , h = o + s
          , r = this._getCellFromIndices(h, t, s);
        r.positionAndRealize();
        this._setFocus(r);
        var f = this._layout
          , c = this._viewport.getOrientation()
          , i = f.getPositionFromCell(r);
        return c === u.Orientation.horizontal && f.calculateColumn(h) > 0 ? (i.scrollPos += f.getCanvasScrollableOffset(),
        i.scrollPos += r.node.getAlignmentOffset()) : c === u.Orientation.vertical && this._headerOffsets[t] > 0 && (i = f.getPositionFromGridIndex(o)),
        i.isFirstGroup = o === 0,
        i
    }
    ;
    n.prototype._getDefaultPosition = function() {
        return {
            scrollPos: 0,
            orthoPos: 0,
            width: 0,
            height: 0
        }
    }
    ;
    n.prototype._getNearestActiveItem = function(n) {
        var i = n.groupIndex, r = this._groupGridIndices[i], t, u;
        return this._items.getItem(i).collection.length > 0 ? n : (t = e(this._groupGridIndices, r),
        u = t === this._groupGridIndices.length - 1 ? e(this._groupGridIndices, r - 1) : t,
        {
            groupIndex: u,
            itemIndex: 0
        })
    }
    ;
    n.prototype._setBounds = function(n) {
        var t = this._viewport.getViewportExtent()
          , i = 3 * t
          , r = n + t
          , u = n - t
          , f = r + t
          , e = Math.min(this._layout.getExtent() - i, u)
          , o = Math.max(i, f);
        this._minGridIndexView = this._layout.getLowerBoundIndex(u);
        this._maxGridIndexView = this._layout.getUpperBoundIndex(f);
        this._minVisibleIndex = this._layout.getLowerBoundIndex(n);
        this._maxVisibleIndex = this._layout.getUpperBoundIndex(r);
        this._minPoolIndex = this._layout.getLowerBoundIndex(e);
        this._maxPoolIndex = this._layout.getUpperBoundIndex(o);
        this._lastVisibleIndex = -1;
        this._layout.adjustBackground(this._minVisibleIndex)
    }
    ;
    n.prototype.onScroll = function(n, t) {
        this._setBounds(n);
        this._unloadedGroupCount > 0 && this._updateGroupVisibility(this._minVisibleIndex, this._maxVisibleIndex);
        this._returnToPools(t > 0 ? this._filterLowerBound(this._minPoolIndex, this._cells) : this._filterUpperBound(this._maxPoolIndex, this._cells));
        this._cells.forEach(this.setJobSetVisibility, this);
        this._addNewCells(t, this._minGridIndexView, this._maxGridIndexView);
        this._hidePooledCells()
    }
    ;
    n.prototype.onResize = function() {
        this._layout.onResize()
    }
    ;
    n.prototype._hidePooledCells = function() {
        this._pooledCells.forEach(s.scheduleHide)
    }
    ;
    n.prototype._createCell = function(n, t, i, r) {
        if (this._focusedCell !== null && this._focusedCell.gridIndex === r)
            return this._focusedCell;
        var u = this._layout.createCell(n.type, r);
        return u.setItemData(n, t, i),
        u
    }
    ;
    n.prototype._createAndRealizeCell = function(n, t, i, r, u) {
        var f = this._createCell(n, t, i, r);
        return f.scheduleRealization(u),
        f
    }
    ;
    a = 1e4;
    n.prototype.prepareCell = function(n, t, i) {
        n.setGridIndex(t);
        this.setJobSetVisibility(n);
        n.jobSet.setOrder(i * a + t)
    }
    ;
    n.prototype._affectsExistingCells = function(n) {
        var t = this._cells
          , i = t.length;
        return i !== 0 && n <= t[i - 1].gridIndex
    }
    ;
    n.prototype._isInCells = function(n) {
        return this._affectsExistingCells(n) && n >= this._cells[0].gridIndex
    }
    ;
    n.prototype._isNotInCells = function(n) {
        return !this._isInCells(n.gridIndex)
    }
    ;
    n.prototype._isInViewBounds = function(n) {
        return n >= this._minGridIndexView && n <= this._maxGridIndexView
    }
    ;
    n.prototype._isVisible = function(n) {
        return n >= this._minVisibleIndex && n <= this._maxVisibleIndex
    }
    ;
    n.prototype._cellsInRange = function(n, t, i) {
        for (var c = [], v = this._items, l = this._groupGridIndices, r = e(l, n), h, f, p, w, u = l[r], y = v.length; u <= t && r < y; u = l[++r])
            if (h = v.getItem(r),
            f = h.collection,
            f.length > 0) {
                p = h.header;
                w = Jx.isObject(h.header);
                n = Math.max(u, n);
                u === n && w && (c.push(i.call(this, p, r, 0, n, o.realizeHeader)),
                ++n);
                var a = this._headerOffsets[r]
                  , s = Math.max(0, n - u - a)
                  , b = Math.min(f.length - 1, t - u - a);
                if (f.isLoaded)
                    for (; s <= b; ++s,
                    ++n)
                        c.push(i.call(this, f.getItem(s), r, s + a, n, o.realizeItem));
                else
                    n += b - s + 1
            }
        return c
    }
    ;
    n.prototype._createCellsInRange = function(n, t) {
        return this._cellsInRange(n, t, this._createCell)
    }
    ;
    n.prototype._createAndRealizeCellsInRange = function(n, t) {
        return this._cellsInRange(n, t, this._createAndRealizeCell)
    }
    ;
    n.prototype.setJobSetVisibility = function(n) {
        n.jobSet.setVisibility(this._isVisible(n.gridIndex))
    }
    ;
    n.prototype._scheduleAriaFlowRange = function(n, t) {
        for (var i = Math.max(0, n); i < Math.min(this._cells.length, t); ++i)
            this._cells[i].scheduleAriaFlow(this._cells[i - 1], this._cells[i + 1])
    }
    ;
    n.prototype._getFirstVisibleCell = function() {
        return this._cells[Math.max(0, this._binarySearchGridIndex(this._minVisibleIndex))]
    }
    ;
    n.prototype._addNewCells = function(n, i, r) {
        var u = this._cells, e = u.length, o = e === 0 || n < 0, f;
        e !== 0 && (o ? r = u[0].gridIndex - 1 : i = u[e - 1].gridIndex + 1);
        f = this._createAndRealizeCellsInRange(i, r);
        f.length !== 0 && (this._cells = o ? t.append(f, u) : t.append(u, f),
        this._scheduleSetAllAria(),
        this._ensureOneKeyboardFocusableCell())
    }
})
