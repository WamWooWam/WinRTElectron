
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Namespace.js" />
/// <reference path="Pool.js" />
/// <reference path="../Scheduler/JobSet.js" />
/// <reference path="../Scheduler/Scheduler.js" />
/// <reference path="../../UnitTest/MockNode.js" />
/// <reference path="../Viewport/Position.ref.js" />
/// <reference path="../Viewport/Viewport.js" />
/// <reference path="GroupListener.js" />
/// <reference path="PooledCells.js" />
/// <reference path="Layout.js" />
/// <reference path="GridCell.js" />
/// <reference path="Reflow.js" />
/// <reference path="PseudoCell.js" />
/// <reference path="VirtualizedGrid.Init.ref.js" />
/// <reference path="../Collections/CollectionItem.ref.js" />
/// <reference path="GridNavigation.js" />
/// <reference path="GridNotifier.js" />
/// <reference path="../../../Shared/JSUtil/Callback.js" />
/// <reference path="../../../Shared/JSUtil/Hydration.js"/>
/// <reference path="../../../Shared/Sequence/Sequence.js" />
/// <reference path="../Collections/BaseCollection.js" />
/// <reference path="../Collections/DeferredCollection.js" />

/// <disable>JS3057.AvoidImplicitTypeCoercion,JS2076.IdentifierIsMiscased</disable>
/// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>
/// <disable>JS3053.IncorrectNumberOfArguments</disable>

Jx.delayDefine(People.Grid, ["createGrid", "VirtualizedGrid"], function () {

    "use strict";
    var P = window.People;
    var G = P.Grid;
    var C = G.Cell;
    var R = G.Reflow;
    var S = P.Sequence;
    var D = P.DeferredCollection;
    var Priority = P.Priority;
    var Hydration = P.Hydration;

    var VirtualizedGrid = G.VirtualizedGrid = /* @constructor */function (init) {
        /// <param name="init" type="P.Init" />
        this._unloadedGroupCount = 0;
        this._initializeItems(init.items);
        this._pooledCells = /*@static_cast(G.PooledCells)*/init.pooledCells;
        this._layout = /*@static_cast(G.Layout)*/init.layout;

        this._jobSet = /*@static_cast(P.JobSet)*/init.jobSet;
        this._viewport = /*@static_cast(P.MockViewport)*/init.viewport;
        this._cells = [];
        this._groupGridIndices = []; // maps items collections (groups) to 'gridIndices'
        this._cumulativeGroupLengths = []; // stores the number of items (not headers) prior to each group
        this._lastGridIndex = 0;
        this._uniqueGridId = init.uniqueGridId;
        this._focusedCell = null;
        this._placeholder = /*@static_cast(G.Cell)*/null;
        this._canvas = /*@static_cast(HTMLElement)*/null;
        this._keyNavigation = /* @static_cast(G.Navigation)*/null;

        this._minGridIndexView = 0;
        this._maxGridIndexView = 0;
        this._minVisibleIndex = 0;
        this._maxVisibleIndex = 0;
        this._lastVisibleIndex = -1; // -1 denotes 'unset'
        this._minPoolIndex = 0;
        this._maxPoolIndex = 0;
        this._setAllAriaScheduled = false;
        this._handleChangesScheduled = false;
        this._changesPending = false;
        this._animating = false;
        this._reflow = /*@static_cast(G.Reflow)*/null;
        this._cellCreator = /*@static_cast(G.CellCreator)*/null;
        this._gridNotifier = /*@static_cast(G.GridNotifier)*/null;

        this.notifyVisibleCellsRealized = Jx.fnEmpty;

        Debug.only(this._isValidateDomScheduled = false);
        Debug.only(this._validateElements = this._validateElements);

        // Convenient global access for debugging.
        Debug.call(this._registerGrid, this);

        Debug.only(Object.seal(this));
    };


    G.createGrid = function (init) {
        /// <summary>
        /// Create a virtualized grid component.  init should be an object of the form:
        /// {
        ///     items,            // collection of groups (collection of collections)
        ///     factories,        // Mapping item types to cell factories.  Factories should be functions.
        ///     canonicalType,    // optional string representing the canonical type to use for dimensions
        ///                       // calculations.  Should be one of the keys in the factories map
        ///     jobSet,           // JobSet object.  Grid passes child JobSets to cells' handlers for
        ///                       // prioritizing UI changes and alters order/visibility of child JobSets
        ///                       // to affect prioritization
        ///     viewport,         // viewport object.  Grid listens for scrolling changes and viewport
        ///                       // listens for Grid's extent changes
        ///     containerElement, // DOM element for VirtualizedGrid
        /// }
        /// </summary>
        /// <param name="init" type="P.Init">The property to access</param>
        var uniqueGridId = getUniqueGridId(),
             canonicalType = init.canonicalType || Object.keys(init.factories)[0],
             layout = new G.Layout(init.viewport, init.containerElement, canonicalType),
             cellCreator = new G.CellCreator({
                 jobSet: init.jobSet,
                 layout: layout,
                 uniqueGridId: uniqueGridId
             }),
             pooledCells = new G.PooledCells(cellCreator, init.factories),
             virtualizedGrid = new VirtualizedGrid({
                 items: init.items,
                 jobSet: init.jobSet,
                 layout: layout,
                 pooledCells: pooledCells,
                 uniqueGridId: uniqueGridId,
                 viewport: init.viewport
             });
        var gridNotifier = new G.GridNotifier(virtualizedGrid);
        cellCreator.initialize(gridNotifier);
        layout.initialize(pooledCells, virtualizedGrid);
        virtualizedGrid.initialize(cellCreator, gridNotifier);
        return virtualizedGrid;
    };

    VirtualizedGrid._grids = {};

    var gridId = 0;

    function getUniqueGridId() {
        return "VG_id_" + String(gridId++) + "_";
    };

    function binarySearch(array, target) {
        /// <summary> Simple helper for binary searching for a number in an array of numbers.
        /// allows caller to elide S.difference</summary>
        return S.binarySearch(array, target, S.difference);
    }

    VirtualizedGrid.prototype._binarySearchGridIndex = function (gridIndex) {
        /// <returns type="Number" />
        return S.binarySearch(this._cells, gridIndex, compareGridIndex);
    };

    VirtualizedGrid.prototype._binarySearchGroups = function (gridIndex) {
        /// <returns type="Number" />
        return binarySearch(this._groupGridIndices, gridIndex);
    };

    VirtualizedGrid.prototype._getCollectionByGridIndex = function (gridIndex) {
        Debug.assert(gridIndex >= 0);
        Debug.assert(this._items.length > 0);

        // If we were passed the _lastGridIndex and it was -1, just get the first group.
        var groupIndex = Math.min(this._items.length - 1, this._binarySearchGroups(gridIndex));
        return this._items.getItem(groupIndex).collection;
    };

    
    VirtualizedGrid.prototype._validateCellData = function (cell) {
        /// <param name="cell" type="G.Cell" />
        var groupIndex = cell.groupIndex,
            itemOffset = cell.gridIndex - this._groupGridIndices[groupIndex],
            itemIndex = itemOffset - this._headerOffsets[groupIndex],
            group = this._items.getItem(groupIndex);

        Debug.assert(cell.groupIndex === this._binarySearchGroups(cell.gridIndex),
                      "Invalid gridIndex for associated group");
        Debug.assert(cell.itemOffset === itemOffset, "Invalid itemOffset");
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        Debug.assert((itemIndex === -1 && isDataEqual(group.header.data, cell.item.data, true)) || // Represents a header
                      isDataEqual(group.collection.getItem(itemIndex).data, cell.item.data, true), "Invalid cell data");
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
    };

    function isDataEqual(/* @dynamic*/dataA, /* @dynamic*/dataB, treatUndefinedAsEqual) {
        ///<summary>Compares two data objects for equality</summary>
        ///<param name="treatUndefinedAsEqual" type="Boolean"/>
        if (dataA === undefined || dataB === undefined) {
            return treatUndefinedAsEqual;
        }

        return dataA === dataB || (dataA.objectId === dataB.objectId && dataA.objectId !== undefined);
    }

    VirtualizedGrid.prototype._scheduleDomValidation = function () {
        if (!this._isValidateDomScheduled) {
            this._jobSet.addUIJob(this, this._validateDom, [], Priority.debug);
            this._isValidateDomScheduled = true;
        }
    };

    VirtualizedGrid.prototype._validateDom = function () {
        var cells = this._cells;
        var layout = this._layout;
        this._isValidateDomScheduled = false;

        if (cells.length !== 0) {
            // Ensure aria-flowto and x-ms-aria-flowfrom are set correctly
            Debug.assert(cells.every(function (/*@type(G.Cell)*/cell, index) {
                var /*@type(HTMLElement)*/flowFrom = index > 0 ? cells[index - 1].getElement() : layout.getAriaFlowStart();
                var /*@type(HTMLElement)*/flowTo = index + 1 < cells.length ? cells[index + 1].getElement() : layout.getAriaFlowEnd();
                return cell.getElement().getAttribute("x-ms-aria-flowfrom") === flowFrom.id &&
                       cell.getElement().getAttribute("aria-flowto") === flowTo.id;
            }));
        }

        if (this._placeholder !== null) {
            Debug.assert(this._canvas.children.length === 1, "placeholder cell should be transient");
            Debug.assert(this._focusedCell === this._placeholder, "focusedCell should be placeholder");
        }
        this._validateElements();
    };

    var forEach = Array.prototype.forEach;
    VirtualizedGrid.prototype._validateElements = function () {
        if (!this._animating) {
            // Ensure all DOM elements within the container element are either
            // a) in our cells array
            // b) in our pools
            // c) the focused cell
            forEach.call(this._canvas.children, /* @bind(VirtualizedGrid) */function (element) {
                var inCells = this._findCellByElement(element) !== -1;
                var inPools = this._pooledCells.elementIsInPools(element);
                var isFocusedCell = this._focusedCell !== null && this._focusedCell.getElement() === element;
                var isPatch = element.className === "patch";
                var isPlaceholder = this._placeholder !== null && this._placeholder.getElement() === element;
                Debug.assert(inCells || inPools || isFocusedCell || isPatch || isPlaceholder, "cell membership error");
                Debug.assert(!inCells || !inPools, "pools should be mutually exclusive with cells");
            }, this);

            this._cells.forEach(C.validatePosition);
        }
    };

    VirtualizedGrid.prototype._validateFocusedCell = function () {
        // Ensure at least one cell has focus if we have cells.
        Debug.assert(Jx.isObject(this._focusedCell) || this._cells.length === 0 || this._unloadedGroupCount !== 0,
                     "no focused cell");

        // Ensure the focused cell does what it claims.
        Debug.assert(!Jx.isObject(this._focusedCell) || this._focusedCell.getElement().tabIndex === 0,
                      "focused cell does not have tabIndex of 0");

        Debug.assert(this._focusedCell === null ||
                      !this._focusedCell.pool.containsItem(this._focusedCell), "Focused cell is pooled");
    };

    VirtualizedGrid.prototype.validate = function () {
        /// <summary> DEBUG validatation of the VirtualizedGrid</summary>
        var cells = this._cells;

        // Ensure no neutered cells remain in the array
        Debug.assert(cells.every(function (cell) {
            /// <param name="cell" type="G.Cell" />
            return Jx.isObject(cell.item);
        }), "undefined item");

        if (cells.length !== 0) {
            cells.reduce(function (prev, next) {
                /// <param name="prev" type="G.Cell" />
                /// <param name="next" type="G.Cell" />
                Debug.assert((prev.itemOffset + 1) === next.itemOffset ||
                              (prev.groupIndex !== next.groupIndex && next.itemOffset === 0), "out of order itemOffsets");
                return next;
            });
        }

        // Ensure this._cells remains mutually exclusive with the cells in the pools
        cells.forEach(function (/*@type(G.Cell)*/cell) {
            cell.pool.forEach(function assertNotEqual(/*@type(G.Cell)*/candidate) {
                Debug.assert(candidate !== this, "pools are not mutually exclusive with cells array");
            }, cell);
        });

        // Ensure our underlying data maps to the corresponding view
        cells.forEach(this._validateCellData, this);
        this._validateFocusedCell();
    };

    VirtualizedGrid.prototype._registerGrid = function () {
        VirtualizedGrid._grids[this._uniqueGridId] = this;
    };

    VirtualizedGrid.prototype._unregisterGrid = function () {
        delete VirtualizedGrid._grids[this._uniqueGridId];
    };
    

    VirtualizedGrid.prototype.dispose = function () {
        Debug.call(this._unregisterGrid, this);
        this._groupListeners.forEach(Jx.dispose);
        this._cellCreator.getCells().forEach(Jx.dispose);
        this._changesPending = false;
        Debug.only(this._validateElements = Jx.fnEmpty);
        this._viewport = null;
    };

    VirtualizedGrid.prototype.onGroupLoaded = function (groupIndex, collection, len) {
        ///<summary>Called when a group (collection) is loaded</summary>
        ///<param name="groupIndex" type="Number">Index into this._items</param>
        ///<param name="collection" type="P.Collection">The collection that changed</param>
        ///<param name="len" type="Number">length of the group</param>
        Debug.assert(this._unloadedGroupCount > 0, "unloaded group count should be greater than zero");

        this._applyChanges(true, []);

        // Set focus after applying changes so that the newly added cells are in contention for
        // initial focus
        if (--this._unloadedGroupCount === 0 && this._focusedCell === null) {
            this._ensureOneKeyboardFocusableCell = ensureOneKeyboardFocusableCell;
            this._ensureOneKeyboardFocusableCell();
        }

        this.notifyVisibleCellsRealized(null);
    };

    VirtualizedGrid.prototype.onChangesPending = function () {
        /// <summary> When a group has pending changes or it has recently been loaded, schedule its processing and
        /// ensure only one job exists for such processing</summary>
        this._changesPending = true;
        if (!this._handleChangesScheduled && !this._animating) {
            this._handleChangesScheduled = true;
            this._jobSet.addUIJob(this, this._handlePendingChanges, [], Priority.queryUpdate);
        }
    };

    VirtualizedGrid.prototype._calculateNewItemOffset = function (cell, groupChanges) {
        /// <summary> Returns the re-calculated itemOffset for a given cell in a group.</summary>
        /// <returns> Returns DeferredCollection.removed (-1) if the item was removed.  Returns the new valid
        /// itemOffset otherwise.</returns>
        /// <param name="cell" type="G.Cell"></param>
        /// <param name="groupChanges" type="Array"></param>
        var groupIndex = cell.groupIndex,
            headerOffset = this._headerOffsets[groupIndex],
            itemOffset = cell.itemOffset,
            itemIndex = itemOffset - headerOffset;

        if (itemIndex !== -1) {
            // non-header
            var newItemIndex = D.updateIndex(groupChanges[cell.groupIndex] || [], itemIndex);
            return (newItemIndex !== D.removed) ? newItemIndex + headerOffset : D.removed;
        } else {
            // header
            var emptyGroup = this._items.getItem(groupIndex).collection.length === 0;
            return emptyGroup ? D.removed : itemOffset;
        }
    };

    VirtualizedGrid.prototype._updateItemOffset = function (cell, groupChanges) {
        /// <summary> Update the cell's itemOffset, given a set of groupChanges</summary>
        /// <param name="cell" type="G.Cell"></param>
        /// <param name="groupChanges" type="Array"></param>
        /// <returns type="Number">Returns the new itemOffset.  A value of D.removed (-1) represents removal</returns>
        var itemOffset = this._calculateNewItemOffset(cell, groupChanges);
        if (itemOffset !== D.removed) {
            cell.itemOffset = itemOffset;
            this._recalculateGridIndex(cell);
        }
        return itemOffset;
    };

    VirtualizedGrid.prototype._handlePendingChanges = function () {
        var items = this._items,
            groupChanges = Array(items.length);
        for (var groupIndex = 0, len = items.length; groupIndex < len; ++groupIndex) {
            var group = /*@static_cast(P.Collection)*/items.getItem(groupIndex).collection;
            groupChanges[groupIndex] = group.isLoaded ? group.acceptPendingChanges() : [];
        }

        this._changesPending = this._handleChangesScheduled = false;
        this._applyChanges(false, groupChanges);
    };

    VirtualizedGrid.prototype._addToRemoved = function (cell, removedCells) {
        if (cell === this._focusedCell) {
            this._setFocus(null, { maintainOnly: true, leakCell: true });
        }
        removedCells.push(cell);
    };

    VirtualizedGrid.prototype.resetAnimationTimeout = function () {
        this._reflow.resetAnimationTimeout();
    };

    var compareByGridIndex = S.compareBy("gridIndex");
    VirtualizedGrid.prototype._applyChanges = function (isLoading, groupChanges) {
        /// <summary> Applies the aggregate changes that were pending.</summary>
        /// <param name="isLoading" type="Boolean"></param>
        /// <param name="groupChanges" type="Array"></param>
        Debug.assert(isLoading || groupChanges.length !== 0);
        var newSize = this._calculateSize(),
            cells = this._cells,
            removedCells = [],
            addedCells = [],
            movedCells = [];

        this._updateGroupVisibility(this._minVisibleIndex, this._maxVisibleIndex);

        Debug.call(this._validateFocusedCell, this);
        if (this._focusedCell !== null && this._isNotInCells(this._focusedCell) &&
            this._updateItemOffset(this._focusedCell, groupChanges) === D.removed) {
            this._addToRemoved(this._focusedCell, removedCells);
        }

        // Recalculate itemOffsets for all cells
        for (var i = cells.length - 1; i >= 0; i--) {
            var cell = cells[i];
            if (this._updateItemOffset(cell, groupChanges) === D.removed) {
                this._addToRemoved(cell, removedCells);
                cells.splice(i, 1);
            }
        }

        // Fix any reorderings that may have been caused by the changes.
        cells.sort(compareByGridIndex);

        // Filter out cells that moved out of our view-range
        var outerCells = this._filterOuterCells(cells);

        if (cells.length !== 0) {
            // Find new cells added on the fringe
            var prefixedCells = this._createCellsInRange(this._minGridIndexView, cells[0].gridIndex - 1),
                appendedCells = this._createCellsInRange(S.last(cells).gridIndex + 1, this._maxGridIndexView);

            S.append(addedCells, prefixedCells);
            S.insert(cells, 0, prefixedCells);

            // Create cells to fill the gaps in the cells array.
            S.append(movedCells, cells);
            var spliceOffset = 0;
            for (var prev = /*@static_cast(G.Cell)*/movedCells[0], index = 1, len = movedCells.length; index < len; prev = next, index++) {
                var next = /*@static_cast(G.Cell)*/movedCells[index];
                if (prev.gridIndex < (next.gridIndex - 1)) {
                    var newCells = this._createCellsInRange(prev.gridIndex + 1, next.gridIndex - 1);
                    S.append(addedCells, newCells);
                    S.insert(cells, index + spliceOffset, newCells);
                    spliceOffset += newCells.length;
                }
            }

            S.append(addedCells, appendedCells);
            S.append(cells, appendedCells);
        } else {
            addedCells = this._cells = this._createCellsInRange(this._minGridIndexView, this._maxGridIndexView);
        }

        var outerFocusedCellIndex = outerCells.indexOf(this._focusedCell);
        if (outerFocusedCellIndex >= 0) {
            // We don't remove the focused cell if it moved out of bounds as we want to remember the user's previous
            // focused item.  We have to catch this case and add the focused cell to the "moved" array since it is no
            // longer in the _cells array and won't get added in the block above.
            movedCells.push(outerCells.splice(outerFocusedCellIndex, 1)[0]);
        }

        this._ensureOneKeyboardFocusableCell();
        Debug.validate(this);
        addedCells.forEach(C.realize);
        S.removeIf(movedCells, C.didNotMove);

        // If we're loading, we schedule DOM operations for UI responsiveness and avoid animations.  If not loading we
        // have to synchronously handle UI operations since we don't want overlapping animations, UI, etc.
        if (isLoading) {
            Debug.assert(!this._animating);
            this._reflow.unanimatedReflow(removedCells, movedCells, addedCells, outerCells);
            Debug.call(this._validateElements, this);
        } else {
            this._animating = true;
            Jx.addClass(this._canvas, "animating");
            this._reflow.reflow(removedCells, movedCells, addedCells, outerCells);
        }

        this._hidePooledCells();
        this._scheduleSetAllAria();
        this._layout.setSize(newSize, this._lastGridIndex);
    };

    VirtualizedGrid.prototype.onAnimationComplete = function () {
        NoShip.People.etw("abTailoredGridAnimation_stop");
        Jx.removeClass(this._canvas, "animating");
        this._animating = false;
        Debug.call(this._validateElements, this);
        if (this._changesPending) {
            this.onChangesPending();
        }
    };

    VirtualizedGrid.prototype._scheduleSetAllAria = function () {
        if (!this._setAllAriaScheduled) {
            this._setAllAriaScheduled = true;
            this._jobSet.addUIJob(this, /*@bind(VirtualizedGrid)*/function () {
                this._scheduleAriaFlowRange(0, this._cells.length);
                this._forEachCell(this._updateAriaIndex, this);
                this._setAllAriaScheduled = false;
            }, null, Priority.accessibility);
        }
    };

    VirtualizedGrid.prototype._updateAriaIndex = function (cell) {
        /// <param name="cell" type="G.Cell"/>
        var cumulativeGroupLengths = this._cumulativeGroupLengths,
            groupIndex = cell.groupIndex,
            itemIndex = cell.itemOffset - this._headerOffsets[groupIndex],
            posInSet = cumulativeGroupLengths[groupIndex] + itemIndex + 1,
            setSize = S.last(cumulativeGroupLengths);
        if (itemIndex !== -1) { // headers don't get positions set
            cell.setAriaIndex(posInSet, setSize);
        }
    };

    VirtualizedGrid.prototype._returnUnfocusedToPool = function (cell) {
        if (cell !== this._focusedCell) {
            cell.returnToPool();
        }
    };

    VirtualizedGrid.prototype.hydrate = function (data) {
        /// <summary> Hydrate the grid - Load unloaded queries</summary>
        /// <param name="data" type="Object">The object with the values we dehydrated</param>
        var group = Hydration.get(data, "groupIndex", 0),
            item = Hydration.get(data, "itemOffset", 0),
            minVisibleIndex = group < this._groupGridIndices.length ? this._groupGridIndices[group] + item : 0,
            maxVisibleIndex = this._layout.getUpperBoundIndex(this._viewport.getViewportExtent()) + minVisibleIndex;

        // Load the collections in the order they appear, setting visibility as appropriate.
        this._updateGroupVisibility(minVisibleIndex, maxVisibleIndex);
    };

    VirtualizedGrid.prototype.contentReadyAsync = function () {
        /// <summary> The grid returns a promise that notifies when its visible realization items are done (if
        /// they're going to show up on the screen initially).  It currently doesn't pass any elements in its array,
        /// since we only want to animate entire sections </summary>
        // Schedule a "visible" jobset that will run after all our on-screen items.
        var that = this;
        Jx.addClass(this._canvas, "animating");
        var promise = new WinJS.Promise(function (c, e, p) {
            that.notifyVisibleCellsRealized = function (positionedCell) {
                ///<summary>
                /// Logic is as follows:
                /// a) Do we have all the visible cells that we can make?
                /// b) Do we have all the cells possible, but they just don't fill up the all the "visible" section?
                /// c) Can we deduce that we're not making any cells any time soon
                /// if (a || b || c)
                ///     { invoke the completion handler }
                /// else
                ///     { wait for next call to _applyChanges }
                ///</summary>
                /// <param name="positionedCell" type="G.Cell" optional="true" />

                // If we were passed in a cell, we're getting called from a cell's 'position' function. We know that the
                // last visible cell is going to come in last, so we do an early check here to ensure this check is fast.
                var lastVisibleIndex = this._getLastVisibleIndex();
                if (!positionedCell || positionedCell.gridIndex >= lastVisibleIndex) {
                    if ((lastVisibleIndex >= 0 &&
                         this._minVisibleIndex <= this._lastGridIndex &&
                         this._getCollectionByGridIndex(this._minVisibleIndex).isLoaded &&
                         this._getCollectionByGridIndex(Math.max(0, this._maxVisibleIndex)).isLoaded &&
                         this._isInCells(this._minVisibleIndex) && this._isInCells(lastVisibleIndex)) ||
                        this._unloadedGroupCount === 0) {
                        this.notifyVisibleCellsRealized = Jx.fnEmpty;
                        this._gridNotifier.stopPositionNotification();

                        var groupedElements = [];
                        if (this._cells.length !== 0) {
                            var groups = {};
                            for (var i = this._binarySearchGridIndex(this._minVisibleIndex),
                                     end = Math.min(this._cells.length - 1, lastVisibleIndex); i <= end; ++i) {
                                var cell = /*@static_cast(G.Cell)*/this._cells[i],
                                    scrollPos = cell.scrollablePos;
                                (groups[scrollPos] || (groups[scrollPos] = [])).push(cell.getElement());
                            }
                            // Turn map of element arrays into an array of element arrays, and crop the list at 3 groups.
                            groupedElements = P.Animation.cropStaggeredList(Object.keys(groups).map(S.value, groups), 3);
                            Debug.assert(groupedElements.length > 0);

                            // We want the styler (white background) to animate with us.
                            S.append(groupedElements[0], [this._layout.getVisibleBlock()]);
                        }
                        c(groupedElements);
                    }
                }
            };
        });

        // If this was called when we already have all visible cells ready, make sure we're not waiting around for a cell
        // to get positioned.
        this.notifyVisibleCellsRealized(null);
        return promise;
    };

    VirtualizedGrid.prototype.onEnterComplete = function () {
        Jx.removeClass(this._canvas, "animating");
    };

    VirtualizedGrid.prototype._getLastVisibleIndex = function () {
        var lastVisibleIndex = this._lastVisibleIndex;
        if (lastVisibleIndex < 0) {

            // Calculate lastVisibleIndex, accounting for orphaning.
            lastVisibleIndex = Math.min(this._lastGridIndex, Math.max(0, this._maxVisibleIndex));
            var groupGridIndices = this._groupGridIndices,
                lastGroup = Math.min(this._items.length - 1, Math.max(0, this._binarySearchGroups(lastVisibleIndex))),
                itemIndex = lastVisibleIndex - groupGridIndices[lastGroup] - this._headerOffsets[lastGroup];

            // If our lastVisibleIndex is an orphan position where no cell will go, decrement lastVisibleIndex.
            if (itemIndex === this._items.getItem(lastGroup).collection.length) {
                lastVisibleIndex = Math.max(0, lastVisibleIndex - 1);
            }
            this._lastVisibleIndex = lastVisibleIndex;
        }
        return lastVisibleIndex;
    };

    VirtualizedGrid.prototype._updateGroupVisibility = function (minVisibleIndex, maxVisibleIndex) {
        ///<summary>Computes each group's visibility and informs the listener</summary>
        ///<param name="minVisibleIndex" type="Number"/>
        ///<param name="maxVisibleIndex" type="Number"/>
        ///<param name="fn" type="Function"/>
        Debug.assert(this._groupGridIndices.length === this._groupListeners.length + 1);
        for (var i = 0; i < this._groupListeners.length; ++i) {
            var groupListener = /*@static_cast(G.GroupListener)*/this._groupListeners[i];
            if (!groupListener.isLoaded()) {
                var groupStart = this._groupGridIndices[i],
                    groupEnd = this._groupGridIndices[i + 1] - 1,
                    isVisible = (groupStart >= minVisibleIndex && groupStart <= maxVisibleIndex) ||
                                (groupEnd >= minVisibleIndex && groupEnd <= maxVisibleIndex) ||
                                (groupStart < minVisibleIndex && groupEnd > maxVisibleIndex);

                groupListener.load(isVisible, this._jobSet);
            }
        }
    };

    VirtualizedGrid.prototype.hydratePosition = function (data) {
        ///<summary>Hydrate the scroll position</summary>
        ///<param name="data" type="Object">The object with the values we dehydrated</param>
        var groupIndex = Hydration.get(data, "groupIndex", 0),
            itemOffset = Hydration.get(data, "itemOffset", 0),
            orientation = Hydration.get(data, "orientation", P.Orientation.horizontal),
            pixel = 0;
        if (orientation === this._viewport.getOrientation()) { // pixel offsets are not retained across orientation changes
            pixel = Hydration.get(data, "pixelOffset", 0);
        }
        
        var layoutScrollPos = 0;
        if (groupIndex < this._groupGridIndices.length) {
            var gridIndex = this._groupGridIndices[groupIndex] + itemOffset;
            layoutScrollPos = this._layout.calculateScrollPos(gridIndex) + pixel;
            this._viewport.setScrollPosition(layoutScrollPos);
        }
        
        this._layout.hydrateScrollPosition(layoutScrollPos);
    };

    VirtualizedGrid.prototype.dehydrate = function () {
        ///<summary>Dehydrates the scroll position</summary>
        ///<returns type="Object">The value to pass to hydrate</returns>
        var data = {},
            scrollPos = this._viewport.getScrollPosition(),
            minVisibleIndex = this._minVisibleIndex,
            itemScrollPos = this._layout.calculateScrollPos(minVisibleIndex),
            pixelOffset = scrollPos - itemScrollPos;

        // If the item is clipped more than 12%, move to the next column
        if (pixelOffset > 0 && (pixelOffset / this._layout.getItemScrollableExtent()) > 0.12) {
            minVisibleIndex = Math.min(this._maxVisibleIndex, minVisibleIndex + this._layout.getRows());
            itemScrollPos = this._layout.calculateScrollPos(minVisibleIndex);
            pixelOffset = scrollPos - itemScrollPos;
        }

        var groupIndex = binarySearch(this._groupGridIndices, minVisibleIndex),
            itemOffset = minVisibleIndex - this._groupGridIndices[groupIndex];

        Hydration.set(data, "groupIndex", groupIndex);
        Hydration.set(data, "itemOffset", itemOffset);
        Hydration.set(data, "pixelOffset", pixelOffset);
        Hydration.set(data, "orientation", this._viewport.getOrientation());
        return data;
    };

    VirtualizedGrid.prototype.scrollItemIntoView = function (groupIndex, itemIndex) {
        ///<summary>Scroll to a particular item in the grid</summary>
        ///<param name="groupIndex" type="Number" />
        ///<param name="itemIndex" type="Number" />
        Debug.assert(groupIndex < this._items.length, "groupIndex exceeds group collection length");
        Debug.assert(Jx.isNumber(itemIndex));
        Debug.assert(itemIndex < this._items.getItem(groupIndex).collection.length, "itemIndex exceeds group length");

        var itemOffset = this._headerOffsets[groupIndex] + itemIndex,
            gridIndex = this._groupGridIndices[groupIndex] + itemOffset;

        this._viewport.setScrollPosition(this._layout.calculateScrollPos(gridIndex));
        Debug.assert(this._isInCells(gridIndex), "gridIndex not in cells");
        var cell = this._cells[this._binarySearchGridIndex(gridIndex)];

        this._setFocus(cell, { keyboard: true });
    };

    VirtualizedGrid.prototype.initialize = function (cellCreator, gridNotifier) {
        // Handle mouse clicks
        var that = this;
        this._canvas = this._layout.getCanvas();
        this._canvas.addEventListener("mousedown", this._onMouseDown.bind(this), false);        
        this._canvas.addEventListener("zoomOnElement", function (ev) { that._onMouseDown(ev, { maintainOnly: true }); }.bind(this), false);
        this._cellCreator = cellCreator;
        this._gridNotifier = gridNotifier;

        // Hook up key navigation
        this._keyNavigation = new G.Navigation(this, this._layout.dir, this._viewport.getOrientation());
        this._keyNavigation.bindToElement(this._canvas);

        this._layout.setSize(this._calculateSize(), 0);
        this._reflow = new G.Reflow(this._layout, this);
    };

    VirtualizedGrid.prototype._initializeItems = function (items) {
        /// <summary> Set internal referenece to items and listen to item collection</summary>
        /// <param name="items" type="P.Collection">The group collection (collection of collections)</param>
        this._items = items;

        var len = items.length,
            groupListeners = this._groupListeners = Array(len),
            headerOffsets = this._headerOffsets = Array(len);

        for (var index = 0; index < len; ++index) {
            var group = items.getItem(index),
                collection = group.collection;
            groupListeners[index] = new G.GroupListener(index, collection, this);
            headerOffsets[index] = Jx.isObject(group.header) ? 1 : 0;

            if (!collection.isLoaded) {
                ++this._unloadedGroupCount;
            }
        }

        // Don't set focus until all groups are loaded
        this._ensureOneKeyboardFocusableCell = this._unloadedGroupCount !== 0 ? Jx.fnEmpty : ensureOneKeyboardFocusableCell;
    };

    VirtualizedGrid.prototype._calculateSize = function () {
        /// <summary>Calculates the total extent of the grid</summary>
        var items = this._items,
            rows = this._layout.getRows(),
        // By doing this math up front, we can elide a separate check for whether we have a row count of 1 within the loop
        // to prevent false orphaning prevention
            lastRow = rows === 1 ? -1 : rows - 1,
            gridIndex = 0,
            cumulativeGroupLengths = 0,
            holes = [];

        for (var index = 0, len = items.length; index < len; ++index) {
            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            var /* @type(P.CollectionItem) */group = items.getItem(index),
                 collectionCount = group.collection.length,
                 hasHeader = Jx.isObject(group.header);
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>

            if (gridIndex % rows === lastRow && hasHeader && collectionCount > 0) {
                // If our lastVisibleIndex was this newly orphaned index, update it as well.
                if (this._lastVisibleIndex === gridIndex) {
                    this._lastVisibleIndex = gridIndex - 1;
                }
                holes.push(gridIndex);
                ++gridIndex;
            }
            this._groupGridIndices[index] = gridIndex;
            this._cumulativeGroupLengths[index] = cumulativeGroupLengths;
            cumulativeGroupLengths += collectionCount;

            if (collectionCount !== 0) {
                gridIndex += (hasHeader ? 1 : 0) + collectionCount;
            }
        }

        // Adding an extra sentinel to our array simplifies groupIndex logic (We don't have to test
        // for length, among other things)
        this._groupGridIndices[items.length] = gridIndex;
        this._cumulativeGroupLengths[items.length] = cumulativeGroupLengths;

        // Is our lastVisibleIndex bounded by the lastGridIndex which is now increasing, or is it greater than the new
        // lastGridIndex?  If so, recalculate it.
        var newLastGridIndex = gridIndex - 1;
        if ((this._lastGridIndex < newLastGridIndex &&
             this._lastVisibleIndex === this._lastGridIndex &&
             this._lastVisibleIndex < this._maxVisibleIndex) ||
            this._lastGridIndex > newLastGridIndex) {
            this._lastVisibleIndex = -1;
        }
        this._lastGridIndex = newLastGridIndex;

        for (var gridHole = gridIndex; gridHole % rows !== 0; gridHole++) {
            holes.push(gridHole);
        }
        this._layout.coverEmptySpaces(holes);
        return this._layout.calculateSize(gridIndex);
    };

    VirtualizedGrid.prototype._recalculateGridIndex = function (cell) {
        cell.setGridIndex(this._groupGridIndices[cell.groupIndex] + cell.itemOffset);
    };

    VirtualizedGrid.prototype._repositionAll = function () {
        this._forEachCell(this._layout.positionCell, this._layout);
    };

    VirtualizedGrid.prototype.onRowsChanged = function (priorRowCount) {
        /// <summary>Called by Layout to notify the grid that the number of rows the grid can fit have changed (due to
        /// a resize of the container in the direction orthogonal to scroll) </summary>
        /// <param name="priorRowCount" type="Number"></param>
        var newSize = this._calculateSize();

        // Recalculate the grid indices for all cells
        this._forEachCell(this._recalculateGridIndex, this);

        var oldLowerBound = this._layout.calculateScrollPosEx(this._minVisibleIndex, priorRowCount),
            scrollPos = this._viewport.getScrollPosition(),
            scrollOffset = scrollPos - oldLowerBound,
            newLowerBound = this._layout.calculateScrollPos(this._minVisibleIndex) + scrollOffset,
            isScrollPosWithinGrid = scrollPos >= 0 && scrollPos <= this._layout.getExtent();

        this._setBounds(newLowerBound);
        this._returnOuterCellsToPools();
        this._hidePooledCells();

        // Notify viewport of new size.
        this._layout.setSize(newSize, this._lastGridIndex);

        // If the grid resides on the left side of the viewport, update the viewport's scroll position.
        if (isScrollPosWithinGrid) {
            // We may potentially need more fringe nodes on either side.  Just do this ahead of time.
            this._addFringeCells();
            this._viewport.setScrollPosition(newLowerBound);
        }

        // Reposition existing cells
        this._jobSet.addUIJob(this, this._repositionAll, [], Priority.realizeItem);
        this._forEachCell(C.markPositionScheduled);
    };

    VirtualizedGrid.prototype._forEachCell = function (onCell, context) {
        /// <param name="onCell" type="Function" />
        this._cells.forEach(onCell, context);
        if (this._focusedCell !== null && this._isNotInCells(this._focusedCell)) {
            onCell.call(context, this._focusedCell);
        }
    };

    function compareGridIndex(gridIndex, cell) {
        /// <summary>filters cells based on gridIndex </summary>
        /// <param name="gridIndex" type="Number"></param>
        /// <param name="cell" type="G.Cell"></param>
        return gridIndex - cell.gridIndex;
    };

    VirtualizedGrid.prototype._filterLowerBound = function (minGridIndex, cells) {
        var spliced = cells.splice(0, this._binarySearchGridIndex(minGridIndex - 1) + 1);

        this._scheduleAriaFlowRange(0, 1); // Fix the first cell's 'x-ms-aria-flowfrom'
        return spliced;
    };

    VirtualizedGrid.prototype._filterUpperBound = function (maxGridIndex, cells) {
        var index = 1 + this._binarySearchGridIndex(maxGridIndex),
            spliced = cells.splice(index, cells.length - index);

        this._scheduleAriaFlowRange(index - 1, index); // Fix the last cell's 'aria-flowto'
        return spliced;
    };

    VirtualizedGrid.prototype._filterOuterCells = function (cells) {
        return S.append(this._filterLowerBound(this._minPoolIndex, cells),
                         this._filterUpperBound(this._maxPoolIndex, cells));
    };

    VirtualizedGrid.prototype._returnToPools = function (cells) {
        cells.forEach(this._returnUnfocusedToPool, this);
    };

    VirtualizedGrid.prototype._returnOuterCellsToPools = function () {
        this._returnToPools(this._filterOuterCells(this._cells));
    };

    VirtualizedGrid.prototype._addFringeCells = function () {
        this._addNewCells(-1, this._minGridIndexView, this._maxGridIndexView); // prefix
        this._addNewCells(1, this._minGridIndexView, this._maxGridIndexView);  // affix
    };

    VirtualizedGrid.prototype._isActiveElement = function (element) {
        return element === document.activeElement;
    };

    VirtualizedGrid.prototype._setFocus = function (cellToFocus, /*@dynamic*/options) {
        /// <summary> Helper function for setting focus on a child cell </summary>
        /// <param name="cellToFocus" type="G.Cell"></param>
        /// <param name="options">The options for the focused element
        ///     maintainOnly - only takes focus if another cell already had it
        ///     leakCell - prevents the current focused cell from being returned to the pool
        ///                 (caller must assume responsibility for the currently focused cell)
        ///     keyboard - causes the keyboard focus indicator (dotted rectangle) to be displayed</param>
        /// <param name="returnToPool" type="Boolean" />
        options = options || {};
        var hadPriorFocus = false;

        if (this._focusedCell !== null) {
            var priorFocusedElement = this._focusedCell.getElement();
            priorFocusedElement.tabIndex = -1;

            if (!options.leakCell && cellToFocus !== this._focusedCell && this._isNotInCells(this._focusedCell)) {
                this._focusedCell.returnToPool();
            }
            hadPriorFocus = this._isActiveElement(priorFocusedElement);
        }

        if (Jx.isObject(cellToFocus)) {
            var elementToFocus = cellToFocus.getElement();
            elementToFocus.tabIndex = 0;

            if (!options.maintainOnly || hadPriorFocus) {
                cellToFocus.positionAndRealize();
                if (options.keyboard) {
                    elementToFocus.focus();
                } else {
                    ///<disable>JS3092.DeclarePropertiesBeforeUse</disable>
                    elementToFocus.setActive();
                    ///<enable>JS3092.DeclarePropertiesBeforeUse</enable>
                }
            }
        }
        this._focusedCell = cellToFocus;
        this._ensureOneKeyboardFocusableCell = cellToFocus ? Jx.fnEmpty : ensureOneKeyboardFocusableCell;
    };

    VirtualizedGrid.prototype._findCellByElement = function (element) {
        return S.findIndex(this._cells, G.Cell.cellElementEqual, element);
    };

    VirtualizedGrid.prototype._onMouseDown = function (ev, /*@dynamic*/option) {
        /// <param name="ev" type="Event" />
        // Walk up until we find the child of the grid
        var element = ev.target;
        while (element !== null && element.parentNode !== this._canvas) {
            element = element.parentNode;
        }
        if (element !== null) {
            var cellIndex = this._findCellByElement(element);
            if (cellIndex !== -1) {
                this._setFocus(this._cells[cellIndex], option);
            }
        }
    };

    VirtualizedGrid.prototype.jumpTo = function (jumpToBeginning) {
        /// <summary> Jumps to the beginning or end of the collection </summary>
        /// <param name="jumpToBeginning" type="Boolean" />
        this._setFocusOnGridIndex(jumpToBeginning ? 0 : this._lastGridIndex, { keyboard: true });
    };

    VirtualizedGrid.prototype.navigate = function (scrollableDelta, orthogonalDelta) {
        /// <summary> Handle arrow key navigation </summary>
        /// <param name="scrollableDelta" type="Number">'delta' in the scrollable direction</param>
        /// <param name="orthogonalDelta" type="Number">'delta' in the direction orthogonal to scrolling</param>
        if (this._focusedCell !== null) {
            var curGridIndex = this._focusedCell.gridIndex,
                nextGridIndex = curGridIndex + (this._layout.getRows() * scrollableDelta) + orthogonalDelta,
                nextCellIndex = this._binarySearchGridIndex(nextGridIndex);

            if (nextCellIndex >= 0 && nextCellIndex < this._cells.length) {
                var /* @type(G.Cell) */cell = this._cells[nextCellIndex],
                    candidateIndex = cell.gridIndex;

                if (candidateIndex === nextGridIndex) {
                    this._setFocus(cell, { keyboard: true });
                } else if (candidateIndex === nextGridIndex - 1 &&
                           nextGridIndex % rows === rows - 1 &&
                           candidateIndex !== this._lastGridIndex) {
                    // We landed on an empty spot due to orphaning prevention.
                    var rows = this._layout.getRows();
                    if (curGridIndex !== candidateIndex) {
                        // We found the next best cell, one gridIndex below (above in horizontal orientation).
                        this._setFocus(cell, { keyboard: true });
                    } else {
                        // This should only occur when attempting to navigate "down" in horizontal orientation and we
                        // hit a blank cell on the bottom row caused by orphaning logic
                        Debug.assert(orthogonalDelta > 0);
                        this._setFocus(this._cells[this._binarySearchGridIndex(nextGridIndex + 1)], { keyboard: true });
                    }
                }
            }
        }
    };

    VirtualizedGrid.prototype._setFocusOnGridIndex = function (gridIndex, /*@dynamic*/focusOptions) {
        /// <summary> Get cell from gridIndex</summary>
        /// <param name="gridIndex" type="Number" />
        /// <param name="focusOptions">(see _setFocus)</param>
        Debug.assert(gridIndex >= 0 && gridIndex <= this._lastGridIndex, "VirtualizedGrid._setFocusOnGridIndex: Invalid gridIndex");
        var groupIndex = binarySearch(this._groupGridIndices, gridIndex),
            itemOffset = gridIndex - this._groupGridIndices[groupIndex],
            cell = this._getCellFromIndices(gridIndex, groupIndex, itemOffset);
        cell.positionAndRealize();
        this._setFocus(cell, focusOptions);
    };

    VirtualizedGrid.prototype._getCellFromIndices = function (gridIndex, groupIndex, itemOffset) {
        /// <summary> Handles grabbing an item and creating a cell from indices alone.</summary>
        /// <param name="gridIndex" type="Number" />
        /// <param name="groupIndex" type="Number" />
        /// <param name="itemOffset" type="Number" />
        if (this._isInCells(gridIndex)) {
            return this._cells[this._binarySearchGridIndex(gridIndex)];
        } else {
            var itemIndex = itemOffset - this._headerOffsets[groupIndex],
                group = /* @static_cast(P.CollectionItem) */this._items.getItem(groupIndex),
                collection = /* @static_cast(P.Collection) */group.collection;

            // If the collection is loaded, just make the cell.  Otherwise, if there's an applicable header, make that cell.
            // If neither of these is possible, make a placeholder cell (empty div, no data)
            if (collection.isLoaded) {
                var item = itemIndex === -1 ? group.header : collection.getItem(itemIndex);
                return this._createCell(item, groupIndex, itemOffset, gridIndex);
            } else if (this._headerOffsets[groupIndex] !== 0) {
                return this._createCell(group.header, groupIndex, 0, this._groupGridIndices[groupIndex]);
            } else {
                this._placeholder = G.PseudoCell.create(this._layout, gridIndex, itemOffset, groupIndex, this._canvas);
                return this._placeholder;
            }
        }
    };

    VirtualizedGrid.prototype.setCurrentItem = function (position) {
        /// <summary> Given position coordinates in the grid, sets focus on the appropriate cell in the grid to prepare
        /// for a later call to getCurrentItem</summary>
        /// <param name="position" type="Position" />
        if (this._cells.length > 0) {
            var gridIndex = Math.min(this._layout.getGridIndexFromPosition(position), this._lastGridIndex);
            this._setFocusOnGridIndex(gridIndex, { maintainOnly: true });
        }
    };

    VirtualizedGrid.prototype.getCurrentItem = function (item) {
        /// <summary> Sets the grid-specific data on the existing item, the itemIndex and groupIndex of the focused
        /// cell.  It returns the viewport-centric position of the focused cell. </summary>
        /// <param name="item" />
        /// <returns type="Position"> viewport-centric position </returns>
        if (this._cells.length === 0) {
            return this._getDefaultPosition();
        } else {
            if (this._focusedCell === null) {
                this._ensureOneKeyboardFocusableCell();
            }
            Debug.assert(this._focusedCell !== null);
            item.itemIndex = this._focusedCell.itemOffset - this._headerOffsets[this._focusedCell.groupIndex];
            item.groupIndex = this._focusedCell.groupIndex;

            return this._layout.getPositionFromCell(this._focusedCell);
        }
    };

    VirtualizedGrid.prototype.positionItem = function (/*@dynamic*/item) {
        /// <summary> Semantic Zoom control (at the top of the stack) calls this function.  Between the zoomable view and
        /// the grid, OffsetViewport translates the position for us. </summary>
        /// <param name="item" type="Object">format: { itemIndex: _, groupIndex: _, isFirstGroup: _ }</param>
        /// <returns type="Position"> viewport-centric position </returns>
        // Returns a dummy position if there are no contacts at all
        if (Jx.isNullOrUndefined(item.itemIndex)) {
            return this._getDefaultPosition();
        }

        // Find the nearest non-empty group
        var activeItem = this._getNearestActiveItem(item);
        var itemGroupIndex = activeItem.groupIndex;
        if (itemGroupIndex === -1) {
            // If all groups are empty (no contacts)
            return this._getDefaultPosition();
        }

        // Set focus on the selected cell
        var itemOffset = this._headerOffsets[itemGroupIndex] + activeItem.itemIndex,
            headerGridIndex = this._groupGridIndices[itemGroupIndex],
            gridIndex = headerGridIndex + itemOffset,
            cell = this._getCellFromIndices(gridIndex, itemGroupIndex, itemOffset);

        cell.positionAndRealize();
        this._setFocus(cell);

        // Get the position that we want to align with
        var layout = this._layout;
        var orientation = this._viewport.getOrientation();
        var position = layout.getPositionFromCell(cell);

        if (orientation === P.Orientation.horizontal && layout.calculateColumn(gridIndex) > 0) {
            // In horizontal view if the group is not in the first column of the section, 
            // we want to align by IC tile picture instead of section header. 
            position.scrollPos += layout.getCanvasScrollableOffset();
            position.scrollPos += cell.node.getAlignmentOffset();
        } else if (orientation === P.Orientation.vertical && this._headerOffsets[itemGroupIndex] > 0) {
            // In vertical view if the group has header, return the position of the header instead of cell
            // to ensure that the header will be shown.
            position = layout.getPositionFromGridIndex(headerGridIndex);
        }

        position.isFirstGroup = (headerGridIndex === 0);
        return position;
    };

    VirtualizedGrid.prototype._getDefaultPosition = function () {
        return { scrollPos: 0, orthoPos: 0, width: 0, height: 0 };
    };

    VirtualizedGrid.prototype._getNearestActiveItem = function (/*@dynamic*/item) {
        /// <summary> Find the nearest item that has a non-empty corresponding letter collection
        /// so that if user zooms in from a disabled zoomed out tile, it will zoom in to the nearest non-empty letter section. </summary>
        /// <param name="item" type="Object"> format: { itemIndex: _, groupIndex: _ } </param>
        var groupIndex = item.groupIndex;
        var gridIndex = this._groupGridIndices[groupIndex];

        if (this._items.getItem(groupIndex).collection.length > 0) {
            return item;
        }

        // Find the next non-empty collection that's alphabetically larger than the given item's collection
        var largestGroupIndex = binarySearch(this._groupGridIndices, gridIndex);

        // If none of the larger collections are non-emtpy, look for non-empty smaller collections,
        // else return the found group index.
        var activeGroupIndex = (largestGroupIndex === this._groupGridIndices.length - 1) ?
                                binarySearch(this._groupGridIndices, gridIndex - 1) : largestGroupIndex;

        return { groupIndex: activeGroupIndex, itemIndex: 0 };
    };

    VirtualizedGrid.prototype._setBounds = function (scrollPos) {
        /// <summary> Set the appropriate bounds given a scrollPosition </summary>
        /// <param name="scrollPos" type="Number">The pixels of the left side of the viewport relative to the
        /// left side of this._canvas.  In RTL, this is the right side of the viewport and right side of the
        /// grid</param>
        var pageExtent = this._viewport.getViewportExtent(),
            totalGridBounds = 3 * pageExtent,
            maxVisiblePos = scrollPos + pageExtent,
            lowerBound = scrollPos - pageExtent,
            upperBound = maxVisiblePos + pageExtent,
            poolLowerBound = Math.min(this._layout.getExtent() - totalGridBounds, lowerBound),
            poolUpperBound = Math.max(totalGridBounds, upperBound);

        this._minGridIndexView = this._layout.getLowerBoundIndex(lowerBound);
        this._maxGridIndexView = this._layout.getUpperBoundIndex(upperBound);
        this._minVisibleIndex = this._layout.getLowerBoundIndex(scrollPos);
        this._maxVisibleIndex = this._layout.getUpperBoundIndex(maxVisiblePos);
        this._minPoolIndex = this._layout.getLowerBoundIndex(poolLowerBound);
        this._maxPoolIndex = this._layout.getUpperBoundIndex(poolUpperBound);
        this._lastVisibleIndex = -1; // Mark as 'unset'.  Make calculation as needed (in notifyVisibleCellsRealized).
        this._layout.adjustBackground(this._minVisibleIndex);
    };

    VirtualizedGrid.prototype.onScroll = function (scrollPos, scrollDelta) {
        /// <summary> The viewport calls this function during a scroll with the pixels relative to this._containerElement
        /// </summary>
        /// <param name="scrollPos" type="Number">The pixels of the left side of the viewport  to the
        /// left side of this._containerElement (in RTL) this is the right side of the viewport and right side of the
        /// grid</param>
        /// <param name="isScrollingForward" type="Boolean">Represents whether we are scrolling right in LTR or left in
        /// RTL.</param>
        this._setBounds(scrollPos);
        if (this._unloadedGroupCount > 0) {
            this._updateGroupVisibility(this._minVisibleIndex, this._maxVisibleIndex);
        }

        // Filter cells on the side opposite the direction to which the viewport is scrolling.
        this._returnToPools((scrollDelta > 0) ? this._filterLowerBound(this._minPoolIndex, this._cells) :
                                                this._filterUpperBound(this._maxPoolIndex, this._cells));

        // Adjust visibility of existing jobSets
        this._cells.forEach(this.setJobSetVisibility, this);

        // Determine if any new cells should be popped from the pool(s) and added to the DOM
        this._addNewCells(scrollDelta, this._minGridIndexView, this._maxGridIndexView);
        this._hidePooledCells();
    };

    VirtualizedGrid.prototype.onResize = function () {
        this._layout.onResize();
    };

    VirtualizedGrid.prototype._hidePooledCells = function (pool) {
        this._pooledCells.forEach(C.scheduleHide);
    };

    VirtualizedGrid.prototype._createCell = function (item, groupIndex, itemOffset, gridIndex) {
        /// <param name="item" type="P.SubItem" />
        Debug.assert(Jx.isObject(item));
        if (this._focusedCell !== null && this._focusedCell.gridIndex === gridIndex) {
            Debug.assert(isDataEqual(item.data, this._focusedCell.item.data, true) &&
                          groupIndex === this._focusedCell.groupIndex &&
                          itemOffset === this._focusedCell.itemOffset);
            return this._focusedCell;
        } else {
            var newCell = this._layout.createCell(item.type, gridIndex);
            newCell.setItemData(item, groupIndex, itemOffset);
            return newCell;
        }
    };

    VirtualizedGrid.prototype._createAndRealizeCell = function (item, groupIndex, itemOffset, gridIndex, priority) {
        var newCell = this._createCell(item, groupIndex, itemOffset, gridIndex);
        newCell.scheduleRealization(priority);
        return newCell;
    };

    // An offset to ensure we value items in row-order
    var ROW_OFFSET = 10000;

    VirtualizedGrid.prototype.prepareCell = function (cell, gridIndex, row) {
        /// <summary> Sets the gridIndex of the cell and the visibility and order of the jobSet</summary>
        /// <param name="cell" type="G.Cell" />
        /// <param name="gridIndex" type="Number" />
        cell.setGridIndex(gridIndex);
        this.setJobSetVisibility(cell);
        cell.jobSet.setOrder(row * ROW_OFFSET + gridIndex);
    };

    VirtualizedGrid.prototype._affectsExistingCells = function (gridIndex) {
        var cells = this._cells,
            len = cells.length;
        return len !== 0 && gridIndex <= cells[len - 1].gridIndex;
    };

    VirtualizedGrid.prototype._isInCells = function (gridIndex) {
        return this._affectsExistingCells(gridIndex) && gridIndex >= this._cells[0].gridIndex;
    };

    VirtualizedGrid.prototype._isNotInCells = function (cell) {
        /// <param name="cell" type="G.Cell" />
        var isNotInCells = !this._isInCells(cell.gridIndex);
        Debug.assert(isNotInCells === (this._cells.indexOf(cell) === -1), "isNotInCells shows an invalid gridIndex");
        return isNotInCells;
    };

    VirtualizedGrid.prototype._isInViewBounds = function (gridIndex) {
        return gridIndex >= this._minGridIndexView && gridIndex <= this._maxGridIndexView;
    };

    VirtualizedGrid.prototype._isVisible = function (gridIndex) {
        return gridIndex >= this._minVisibleIndex && gridIndex <= this._maxVisibleIndex;
    };

    VirtualizedGrid.prototype._cellsInRange = function (gridIndex, maxGridIndex, cellFn) {
        /// <summary> Add and realize new cells within the inclusive range of [gridIndex, maxGridIndex]</summary>
        /// <returns type="Array"> new cells created</returns>
        /// <param type="Number" name="gridIndex" />
        /// <param type="Number" name="maxGridIndex" />
        /// <param type="Function" name="cellFn" />
        var cells = [],
            items = this._items,
            groupGridIndices = this._groupGridIndices,
            groupIndex = binarySearch(groupGridIndices, gridIndex);

        for (var groupStartingIndex = groupGridIndices[groupIndex], lenGroups = items.length;
             groupStartingIndex <= maxGridIndex && groupIndex < lenGroups;
             groupStartingIndex = groupGridIndices[++groupIndex]) {

            var group = items.getItem(groupIndex),
                collection = /*@static_cast(P.Collection)*/group.collection;

            if (collection.length > 0) {
                var header = group.header,
                    hasHeader = Jx.isObject(group.header);

                // If we're trying to place a header on the bottom row, jump to the next gridIndex
                gridIndex = Math.max(groupStartingIndex, gridIndex);

                if (groupStartingIndex === gridIndex && hasHeader) {
                    cells.push(cellFn.call(this, header, groupIndex, 0, gridIndex, Priority.realizeHeader));
                    ++gridIndex;
                }

                var headerOffset = this._headerOffsets[groupIndex],
                    itemIndex = Math.max(0, gridIndex - groupStartingIndex - headerOffset),
                    maxItemIndex = Math.min(collection.length - 1, maxGridIndex - groupStartingIndex - headerOffset);

                if (collection.isLoaded) {
                    for (; itemIndex <= maxItemIndex; ++itemIndex, ++gridIndex) {
                        cells.push(cellFn.call(this, collection.getItem(itemIndex), groupIndex,
                                               itemIndex + headerOffset, gridIndex, Priority.realizeItem));
                    }
                } else {
                    gridIndex += (maxItemIndex - itemIndex + 1);
                }
            }
        }
        return cells;
    };

    VirtualizedGrid.prototype._createCellsInRange = function (gridIndex, maxGridIndex) {
        return this._cellsInRange(gridIndex, maxGridIndex, this._createCell);
    };

    VirtualizedGrid.prototype._createAndRealizeCellsInRange = function (gridIndex, maxGridIndex) {
        return this._cellsInRange(gridIndex, maxGridIndex, this._createAndRealizeCell);
    };

    VirtualizedGrid.prototype.setJobSetVisibility = function (cell) {
        /// <param name="cell" type="G.Cell" />
        cell.jobSet.setVisibility(this._isVisible(cell.gridIndex));
    };

    VirtualizedGrid.prototype._scheduleAriaFlowRange = function (start, end) {
        for (var i = Math.max(0, start); i < Math.min(this._cells.length, end); ++i) {
            this._cells[i].scheduleAriaFlow(this._cells[i - 1], this._cells[i + 1]);
        }
        Debug.call(this._scheduleDomValidation, this);
    };

    VirtualizedGrid.prototype._getFirstVisibleCell = function () {
        ///<returns type="G.Cell" />
        return this._cells[Math.max(0, this._binarySearchGridIndex(this._minVisibleIndex))];
    };

    function /* @bind(VirtualizedGrid) */ensureOneKeyboardFocusableCell() {
        Debug.assert(this._focusedCell === null || this._focusedCell === this._placeholder);
        if (this._cells.length > 0) {
            if (this._placeholder !== null) {
                this._canvas.removeChild(this._placeholder.getElement());
                this._placeholder = null;
            }
            this._setFocus(this._getFirstVisibleCell(), { maintainOnly: true });
        }
    };

    VirtualizedGrid.prototype._addNewCells = function (scrollDelta, minGridIndex, maxGridIndex) {
        /// <summary> Add and realize new cells within the inclusive range of [minGridIndex,maxGridIndex].  Mostly
        /// wraps a call to _createAndRealizeItem with logic to further limit the bounds imposed by
        /// minGridIndex/maxGridIndex based on what cells we already have in our array.</summary>
        /// <param type="Number" name="minGridIndex" />
        /// <param type="Number" name="maxGridIndex" />
        var existingCells = this._cells,
            cellCount = existingCells.length,
            isPrefixing = cellCount === 0 || scrollDelta < 0;

        if (cellCount !== 0) {
            if (isPrefixing) {
                // We are adding cells before existing cells
                maxGridIndex = existingCells[0].gridIndex - 1;
            } else {
                // We are adding cells after existing cells.
                minGridIndex = existingCells[cellCount - 1].gridIndex + 1;
            }
        }

        var newCells = this._createAndRealizeCellsInRange(minGridIndex, maxGridIndex);

        if (newCells.length !== 0) {
            this._cells = isPrefixing ? S.append(newCells, existingCells) : S.append(existingCells, newCells);
            this._scheduleSetAllAria();

            // Give one cell a tabIndex of 0 (make it keyboard-focusable) if we haven't yet done so.
            this._ensureOneKeyboardFocusableCell();
            Debug.validate(this);
        }
    };

    // VirtualizedGrid is called by G.createGrid, and is inaccessible to the instrumenter.  Adding leak tracking instrumentation manually.
    Debug.call(function () {
        VirtualizedGrid = G.VirtualizedGrid = Debug.leaks.createInstrumentedConstructor(/*@static_cast(LeakInstrumentedConstructor)*/VirtualizedGrid, "People.Grid.VirtualizedGrid");
    });
});
