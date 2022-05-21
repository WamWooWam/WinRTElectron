
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="Pool.js" />
/// <reference path="Layout.js" />
/// <reference path="../Scheduler/Scheduler.js" />
/// <reference path="../../UnitTest/MockNode.js" />
/// <reference path="../Collections/CollectionItem.ref.js" />
/// <reference path="../../../../Shared/Jx/Core/Debug.js" />
/// <reference path="../../../../Shared/Jx/Core/Leaks.js" />

/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People.Grid, "Cell", function () {

    "use strict";
    var P = window.People,
        G = P.Grid;

    // Cell represents a node (as created by the node factory) augmented with the associated information such as
    // jobSet, gridIndex, current top position, etc.
    var Cell = G.Cell = /* @constructor */function (node, jobSet, pool, layout) {
        /// <param name="node" type="P.MockNode"></param>
        /// <param name="jobSet" type="P.JobSet"></param>
        /// <param name="pool" type="G.Pool"></param>
        /// <param name="layout" type="G.Layout"></param>
        this.node = node;
        this.jobSet = jobSet;
        this.pool = pool;
        this._layout = layout;
        this.orthogonalPos = -1;
        this.scrollablePos = -1;
        this.priorGridIndex = this.gridIndex = Cell.inPool;
        this.setItemData(null, -1, -1);
        this.item = /*@static_cast(P.CollectionItem)*/null;

        this._flowToId = "";
        this._flowFromId = "";
        this._isRealized = false;
        this._isDisplaying = true;
        this._isPositionScheduled = false;
        this._isAriaScheduled = false;
    };

    var proto = Cell.prototype;

    Cell.prototype.dispose = function () {
        /// <summary> Cleans up cell data </summary>
        this.jobSet.dispose();
        this.node.dispose();
    };

    Cell.inPool = -1; // sentinel for gridIndex/priorGridIndex representing a pooled/uninitialized element

    // gridIndex is a pseudo-index representing the UI index as if we had a matrix in column-first order.  For instance
    // if we were scrolled to the middle of the A-Z list (of ~3,000 contacts) and we were looking at someone in row
    // 4 (of 8) (index 3) and column 101 (index 100), index would be (100 * 8 + 3) = 803.
    // Note: order is reversed in RTL.
    // -----------------------------------------------------------------------
    // Example LTR grid indices with an   Example RTL grid indices with an  
    // orphaned header in the 2nd column  orphaned header in the 2nd column 
    // [0] [4] [8]                        [8]  [4]  [0]                     
    // [1] [5] [9]                        [9]  [5]  [1]                     
    // [2] [6] [10]                       [10] [6]  [2]                     
    // [3]     [11]                       [11]      [3]                     
    Cell.prototype.gridIndex = Cell.inPool;

    Cell.prototype.setItemData = function (item, groupIndex, itemOffset) {
        /// <summary> set all members related to the item: the item itself, groupIndex to which the item belongs, and
        /// the itemOffset of the item within the group.</summary>
        /// <param name="item" />
        /// <param name="groupIndex" type="Number" />
        /// <param name="itemOffset" type="Number" />
        this.item = item;
        this.groupIndex = groupIndex;
        this.itemOffset = itemOffset;
    };

    Cell.prototype.getElement = function () {
        /// <summary> Convenient function for when the caller doesn't use node, but would like to get the underlying
        /// element</summary>
        return this.node.getElement();
    };

    Cell.prototype.hide = function () {
        if (this._isDisplaying) {
            this.getElement().style.display = "none";
            this._isDisplaying = false;
        }
    };

    Cell.prototype.scheduleHide = function () {
        if (this._isDisplaying) {
            this.jobSet.addUIJob(this, this.hide, [], P.Priority.accessibility);
        }
    };

    Cell.prototype._position = function () {
        this._layout.positionCell(this);
        this.show();
        this._isPositionScheduled = false;
    };

    // Overriden by child classes (see GridNotifier)
    Cell.prototype.position = Cell.prototype._position;

    Cell.prototype.show = function () {
        if (!this._isDisplaying) {
            this.getElement().style.display = "";
            this._isDisplaying = true;
        }
    };

    Cell.prototype.returnToPool = function () {
        this.pool.push(this);
        this.jobSet.cancelJobs();
        this._isPositionScheduled = this._isRealized = false;
        this.gridIndex = this.priorGridIndex = Cell.inPool;
        this.setItemData(null, -1, -1);
        this.node.getHandler().nullify();
    };

    Cell.prototype.realize = function () {
        if (!this._isRealized) {
            this._isRealized = true;
            this.node.getHandler().setDataContext(this.item.data);
        }
    };

    Cell.prototype.positionAndRealize = function () {
        this.realize();
        this.position();
    };

    Cell.prototype.scheduleRealization = function (priority) {
        /// <summary> scheduleRealization is expected to be called on a fresh cell (i.e. one just popped from a pool).
        /// Thus its jobSet should be empty, and no positions should be scheduled on it.</summary>
        /// <param name="priority" type="Number"></param>
        if (!this._isPositionScheduled) {
            Debug.assert(Jx.isObject(this.item));
            this.jobSet.addUIJob(this, this.positionAndRealize, [], priority);
            this._isPositionScheduled = true;
        }
    };

    Cell.prototype._setAriaFlow = function () {
        if (!this._flowFromId) {
            var ariaFlowStart = /*@static_cast(HTMLElement)*/this._layout.getAriaFlowStart();
            ariaFlowStart.setAttribute("aria-flowto", this.node.id);
            this._flowFromId = ariaFlowStart.id;
        }
        if (!this._flowToId) {
            var ariaFlowEnd = /*@static_cast(HTMLElement)*/this._layout.getAriaFlowEnd();
            ariaFlowEnd.setAttribute("x-ms-aria-flowfrom", this.node.id);
            this._flowToId = ariaFlowEnd.id;
        }

        this.getElement().setAttribute("aria-flowto", this._flowToId);
        this.getElement().setAttribute("x-ms-aria-flowfrom", this._flowFromId);
        this._isAriaScheduled = false;
    };

    Cell.prototype.scheduleAriaFlow = function (flowFromCell, flowToCell) {
        /// <param name="flowFromCell" type="Cell"/>
        /// <param name="flowToCell" type="Cell"/>
        this._flowFromId = flowFromCell ? flowFromCell.node.id : "";
        this._flowToId = flowToCell ? flowToCell.node.id : "";
        if (!this._isAriaScheduled) {
            this.jobSet.addUIJob(this, this._setAriaFlow, [], P.Priority.accessibility);
        }
    };

    Cell.prototype.setAriaIndex = function (posInSet, setSize) {
        /// <param name="posInSet" type="Number">Value for aria-posinset.  "Item ??? of 200"</param>
        /// <param name="setSize" type="Number">Value for aria-setsize.  "Item 112 of ???"</param>
        Debug.assert(Jx.isNumber(posInSet));
        Debug.assert(Jx.isNumber(setSize));

        var element = this.getElement();
        element.setAttribute("aria-posinset", posInSet.toString());
        element.setAttribute("aria-setsize", setSize.toString());
    };

    Cell.prototype.setGridIndex = function (gridIndex) {
        this.priorGridIndex = this.gridIndex;
        this.gridIndex = gridIndex;
    };

    Cell.bucket = function (cell) {
        /// <param name="cell" type="G.Cell" />
        return cell.orthogonalPos;
    };

    Cell.cellElementEqual = function (cell) {
        /// <param name="cell" type="G.Cell"></param>
        return cell.getElement() === this;
    };

    Cell.didNotMove = function (cell) {
        /// <summary>Used in grid repositioning logic to determine if the cell actually moved.</summary>
        /// <param name="cell" type="Cell" />
        Debug.assert(cell.gridIndex !== Cell.inPool);
        // A cell with a priorGridIndex of Cell.inPool was either freshly created, or pulled from a pool.  This does not
        // represent a move.
        return cell.priorGridIndex === cell.gridIndex || cell.priorGridIndex === Cell.inPool;
    };

    // Static helpers (for loops)
    Cell.getElement = function (cell) {
        /// <param name="cell" type="Cell" />
        return cell.getElement();
    };
    Cell.position = function (cell) {
        /// <param name="cell" type="Cell" />
        return cell.position();
    };
    Cell.realize = function (cell) {
        /// <param name="cell" type="Cell" />
        return cell.realize();
    };
    Cell.getGridIndex = function (cell) {
        /// <param name="cell" type="Cell" />
        return cell.gridIndex;
    };
    Cell.scheduleHide = function (cell) {
        /// <param name="cell" type="Cell" />
        return cell.scheduleHide();
    };
    Cell.markPositionScheduled = function (cell) {
        /// <param name="cell" type="Cell" />
        cell._isPositionScheduled = true;
    };

    
    Cell.prototype._validatePosition = function () {
        /// <summary> Validates that the cell's element is placed either at it's current position, or that a position
        /// job is scheduled and it's still at it's former position. </summary>
        var scrollPos = this._layout.calculateScrollPos(this.gridIndex),
             orthogPos = this._layout.calculateOrthogonal(this._layout.calculateRow(this.gridIndex)),
             elt = this.getElement(),
             eltScrollPos = parseInt(elt.style[this._layout.getScrollableAttr()]),
             eltOrthogPos = parseInt(elt.style[this._layout.getOrthogonalAttr()]);
        Debug.assert(scrollPos === eltScrollPos || this._isPositionScheduled &&
                      (eltScrollPos === this.scrollablePos || this.scrollablePos === -1),
                      "invalid scroll position");
        Debug.assert(orthogPos === eltOrthogPos || this._isPositionScheduled &&
                      (eltOrthogPos === this.orthogonalPos || this.orthogonalPos === -1),
                      "invalid orthogonal position");
    };

    Cell.validatePosition = function (cell) {
        /// <param name="cell" type="Cell" />
        cell._validatePosition();
    };
    

    Object.freeze(Cell);

});
