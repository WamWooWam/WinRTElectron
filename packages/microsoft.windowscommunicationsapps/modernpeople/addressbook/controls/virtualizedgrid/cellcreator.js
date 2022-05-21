
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <disable>JS2027.PunctuateCommentsCorrectly,JS2029.MinimizeVerticalSpaceInComments,JS2026.CapitalizeComments</disable> comments
/// <disable>JS2058.DoNotUseIncrementAndDecrementOperators,JS2076.IdentifierIsMiscased</disable>
/// <dictionary>elt</dictionary>
/// <reference path="../../../Shared/JSUtil/Namespace.js" />
/// <reference path="../../../Shared/JSUtil/Callback.js" />
/// <reference path="Pool.js" />
/// <reference path="Layout.js" />
/// <reference path="GridCell.js" />
/// <reference path="GridNotifier.js" />
/// <reference path="VirtualizedGrid.Init.ref.js" />
/// <reference path="../../UnitTest/MockNode.js" />

Jx.delayDefine(People.Grid, "CellCreator", function () {

     var P = window.People;
     var G = P.Grid;

     var CellCreator = G.CellCreator = /* @constructor */ function (init) {
         /// <param name="init" type="P.Init" />
         this._uniqueGridId = init.uniqueGridId;
         this._uniqueCellId = 0;
         this._layout = /* @static_cast(P.Grid.Layout) */init.layout;
         this._jobSet = /* @static_cast(P.JobSet) */init.jobSet;
         this._cells = [];
         this._gridNotifier = /*@static_cast(G.GridNotifier)*/null;
     };  

     CellCreator.prototype.initialize = function (gridNotifier) {
         /// <param name="gridNotifier" type="G.GridNotifier" />
         this._gridNotifier = gridNotifier;
     };

     CellCreator.prototype.createCell = function (nodeFactory, pool) {
         /// <summary> Given a cell factory, create a cell pool </summary>
         /// <param name="nodeFactory" type="P.Callback">The cell factory</param>
         /// <param name="pool" type="G.Pool">The pool to which this cell belongs</param>
         var jobSet = this._jobSet.createChild(),
             node = /* @static_cast(P.MockNode) */ nodeFactory.fn.call(nodeFactory.self, jobSet),
             elt = node.getElement(),
             elementStyle = elt.style;

         elementStyle.position = "absolute";
         elementStyle.zIndex = "1";

         // Elements must have unique IDs in order for accessibility to work.  If the cell handler isn't setting this
         // DOM property, we will.
         if (elt.id === "") {
             elt.id = this._getUniqueCellId();
         }

         elt.tabIndex = -1;
         this._layout.getCanvas().appendChild(elt);
         var /*@type(G.Cell)*/cell = this._gridNotifier.createCell(node, jobSet, pool, this._layout);
         cell.hide();
         this._cells.push(cell);
         return cell;
     };

     CellCreator.prototype._getUniqueCellId = function () {
         return this._uniqueGridId + String(this._uniqueCellId++);
     };

     CellCreator.prototype.getCells = function () {
         /// <summary> Retrieves all created cells. </summary>
         return this._cells;
     };
});
