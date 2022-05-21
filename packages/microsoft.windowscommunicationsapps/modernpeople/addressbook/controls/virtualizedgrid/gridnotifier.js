
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="VirtualizedGrid.js" />
/// <reference path="GridCell.js" />

/// <disable>JS2076.IdentifierIsMiscased</disable>
Jx.delayDefine(People.Grid, "GridNotifier", function () {

    "use strict";
    var P = window.People;
    var G = P.Grid;
    var Cell = G.Cell;

    // NotifyingCell augments Cell's position function with a call into grid notifier, which forwards along which cell
    // just got positioned to the grid.  If the grid has a pending promise, it'll check to see if this was the last
    // visible cell positioned, and complete the promise if so.  Since the check isn't free, we make a cell "class" on a
    // per grid basis and remove the notification functionality once we know we're done notifying.
    // (See PerGridCell in GridNotifier's ctor)
    var NotifyingCell = function (node, jobSet, pool, layout, /*@type(GridNotifier)*/gridNotifier) { 
        Cell.call(this, node, jobSet, pool, layout);
        this._gridNotifier = gridNotifier;
    };
    Jx.inherit(NotifyingCell, Cell);
    NotifyingCell.prototype.position = function () {
        this._position();
        this._gridNotifier.notify(this);
    };

    var GridNotifier = G.GridNotifier = /*@constructor*/function (/*@type(G.VirtualizedGrid)*/grid) {
        this._grid = grid;
        // We derive a different Cell type for each virtualized grid, so that we can quickly turn off notification logic
        // in order to avoid additional function call costs every time we position a cell.
        this._stoppableCell = function PerGridCell(node, jobSet, pool, layout, gridNotifier) { NotifyingCell.apply(this, arguments); };
        Jx.inherit(this._stoppableCell, NotifyingCell);

        Debug.only(Object.seal(this));
    };

    GridNotifier.prototype.createCell =  function (node, jobSet, pool, layout) {
         /// <summary> Cell factory</summary>
         /// <param name="node" type="P.MockNode" />
         /// <param name="jobSet" type="P.JobSet" />
         /// <param name="pool" type="G.Pool" />
         /// <param name="layout" type="G.Layout" />
         return new this._stoppableCell(node, jobSet, pool, layout, this);
     };

    GridNotifier.prototype.stopPositionNotification = function () {
        // Stop notification of all cells associated with the grid.
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>        
        this._grid = /*@static_cast(G.VirtualizedGrid)*/ null;
        
        // Stop already created cells from calling into notify, and only create "normal" cells now on.
        this._stoppableCell.prototype.position = Cell.prototype._position;
        this._stoppableCell = Cell;
    };

    GridNotifier.prototype.notify = function (cell) {
        /// <param name="cell" type="G.Cell" optional="true" />
        Debug.assert(Jx.isObject(this._grid));
        this._grid.notifyVisibleCellsRealized(cell);
    };

});
