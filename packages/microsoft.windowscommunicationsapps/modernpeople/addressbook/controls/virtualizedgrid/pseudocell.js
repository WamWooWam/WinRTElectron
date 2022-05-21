
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="Pool.js" />
/// <reference path="../Scheduler/Scheduler.js" />
/// <reference path="../../UnitTest/MockNode.js" />
/// <reference path="GridCell.js" />

/// <disable>JS2076.IdentifierIsMiscased</disable>
/// <disable>JS3092.DeclarePropertiesBeforeUse</disable>

Jx.delayDefine(People.Grid, "PseudoCell", function () {
    
     "use strict";
     var P = window.People,
         G = P.Grid;

     var PseudoCell = G.PseudoCell = /* @constructor */ function (layout) {
         /// <summary> Pseudo Cell - a defunct placeholder cell. </summary>
         /// <summary> It's purpose is to allow the Tailored Grid's layout to determine an item's expected position, when an item isn't available from the collections. </summary>
         /// <summary> All it does is expose the underlying DOM element for manipulation by Layout. </summary>
         /// <param name="layout" type="G.Layout" />
         G.Cell.call(this, null /*node*/, null /*jobSet*/, null /*pool*/, layout);
         var elt = this._element = document.createElement("div");
         elt.tabIndex = -1;

         Debug.only(Object.seal(this));
     };
     Jx.inherit(PseudoCell, G.Cell);

     PseudoCell.create = function (layout, gridIndex, itemOffset, groupIndex, canvas) {
         /// <summary> Pseudo Cell - a placeholder cell. </summary>
         /// <param name="layout" type="G.Layout" />
         /// <param name="gridIndex" type="Number" />
         /// <param name="itemOffset" type="Number" />
         /// <param name="groupIndex" type="Number" />
         /// <param name="canvas" type="HTMLElement" />
         var cell = new PseudoCell(layout);
         cell.itemOffset = itemOffset;
         cell.groupIndex = groupIndex;
         cell.gridIndex = gridIndex;
         canvas.appendChild(cell.getElement());
         cell.position();
         return cell;
     };

     function noScheduling() { Debug.assert(false, "PseudoCell does not support scheduling"); }
     PseudoCell.prototype.realize             = Jx.fnEmpty;
     PseudoCell.prototype.dispose             = Jx.fnEmpty;
     PseudoCell.prototype.scheduleHide        = noScheduling;
     PseudoCell.prototype.scheduleRealization = noScheduling;
     PseudoCell.prototype.schedulePosition    = noScheduling;

     PseudoCell.prototype.getElement = function () { 
         return this._element; 
     };
     PseudoCell.prototype.returnToPool = function () { 
         Debug.assert(false, "PseudoCell has no pool to return to"); 
     };

});
