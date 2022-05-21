
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Namespace.js" />
/// <reference path="Pool.js" />
/// <reference path="../Scheduler/JobSet.js" />
/// <reference path="../Scheduler/Scheduler.js" />
/// <reference path="../../UnitTest/MockNode.js" />
/// <reference path="../Viewport/Viewport.js" />
/// <reference path="GroupListener.js" />
/// <reference path="GridCell.js" />
/// <reference path="../Viewport/Viewport.js" />
/// <reference path="GridAnimations.js" />
/// <reference path="../../../Shared/JSUtil/PeopleAnimation.js" />
/// <reference path="VirtualizedGrid.Anim.ref.js"/>

Jx.delayDefine(People.Grid, "Reflow", function () {

     /// <disable>JS2076.IdentifierIsMiscased</disable>
     var P = window.People;
     var G = P.Grid;
     var Cell = G.Cell;
     var U = WinJS.Utilities;
     var UI = WinJS.UI;
     var A = G.Animations;
     var Animation = People.Animation;
     var Promise = WinJS.Promise;

     var Reflow = G.Reflow = /* @constructor */ function (layout, grid) {
         /// <summary>Reflow handles the reflow animation for both the grid view and list view (one-column grid).  It
         /// also degrades to unanimated reflow when animations fail (as they do currently in IE platform preview).
         /// </summary>
         /// <param name="layout" type="G.Layout" />
         /// <param name="grid" type="G.VirtualizedGrid" />
         this._grid = grid;
         this._layout = layout;
         this._canvas = layout.getCanvas();
         this._scrollableAttr = layout.getScrollableAttr();
         this._orthogonalAttr = layout.getOrthogonalAttr();
         if (Animation.disabled) {
             this.reflow = this._unanimatedReflow;
         }
         this._animating = false;
         this._timeoutId = -1;
         this._boundTimeoutComplete = this._onTimeoutComplete.bind(this);
     };

     function revertOpacity (elt) {
         /// <param name="elt" type="HTMLElement" />
         elt.style.opacity = "";
     }

     function animateReposition(moves) {
         /// <summary> Animates the repositioning of elements </summary>
         /// <returns type="WinJS.Promise"></returns>
         /// <param name="moves" type="Array">
         /// An array of elements of the form: { element: ~, offset: {left: ~, top: ~} }
         /// </param>
         moves.sort(function (a,b) {
             /// <param name="a" type="ElementOffset" />
             /// <param name="b" type="ElementOffset" />
             var aTop = a.offset.top,
                 bTop = b.offset.top;
             return (aTop === bTop) ? a.offset.left - b.offset.left : aTop - bTop;
         });
         var offset = /*@static_cast(ClientRect)*/moves[0].offset,
             aggregate = { elements: [], offset: offset },
             groupedMoves = [aggregate];

         moves.forEach(function (move) {
             /// <param name="move" type="ElementOffset" />
             var moveOffset = move.offset;
             if (offset.top === moveOffset.top && offset.left === moveOffset.left) {
                 aggregate.elements.push(move.element);
             } else {
                 offset = moveOffset;
                 aggregate = { elements: [move.element], offset: moveOffset };
                 groupedMoves.push(aggregate);
             }
         });
         Debug.assert(/*@static_cast(Number)*/groupedMoves.reduce(function (sum, /*@dynamic*/aggregates) { return sum + aggregates.elements.length; }, 0) === moves.length,
                     "groupedMoves does not have same # of elements as moves");

         return A.executeElementsAnimation(groupedMoves.map(function (groupedMove) {
            /// <param name="groupedMove" type="AggregateOffset" />
             return {
                 elements: groupedMove.elements,
                 animations: A.createOffsetAnimationArray(groupedMove.offset)
             };
         }));
     }

     function cloneElement(original) {
         /// <param name="original" type="HTMLElement" />
         var clone = original.cloneNode(true);
         clone.id = "";
         return clone;
     };

     function removeCell (cell) {
         /// <param name="cell" type="G.Cell" />
         if (cell.getElement()) {
             cell.hide();
             cell.returnToPool();
         }
     }

     Reflow.prototype.unanimatedReflow = function (removed, moved, inserted, outerCells) {
         /// <param name="removed" type="Array" />
         /// <param name="moved" type="Array" />
         /// <param name="inserted" type="Array" />
         NoShip.People.etw("abTailoredGridAnimation_run");
         removed.forEach(removeCell);
         outerCells.forEach(removeCell);
         moved.forEach(Cell.position);
         inserted.forEach(Cell.position);
     };

     Reflow.prototype._unanimatedReflow = function (removed, moved, inserted, outerCells) {
         this.unanimatedReflow(removed, moved, inserted, outerCells);
         this._completeAnimation();
     };

     Reflow.prototype._onRemoveErr = function (removed, moved, inserted, outerCells) {
         // We set the removed cells opacity to 0, before animating,
         // so that on animation completion, they'd remain "invisble".
         // Revert opacity back for re-use.
         /// <param name="removed" type="Array" />
         removed.forEach(function (cell) {
             /// <param name="cell" type="G.Cell" />
             revertOpacity(cell.getElement());
         });
         this.reflow = this._unanimatedReflow;
         this.reflow(removed, moved, inserted, outerCells);
     };

     Reflow.prototype._onMoveErr = function (moved, inserted, outerCells) {
         this.reflow = this._unanimatedReflow;
         this.reflow([], moved, inserted, outerCells);
     };

     Reflow.prototype._onAddErr = function (inserted, outerCells) {
         this.reflow = this._unanimatedReflow;
         this.reflow([], [], inserted, outerCells);
     };

     var normalize = {};
     normalize["left"] = "left";
     normalize["right"] = "left";
     normalize["top"] = "top";
     Debug.call(Object.defineProperty, null, normalize, "bottom", {
         get: function () { Debug.assert(false, "position should never be based off the 'botttom' attribute"); }
     });

     function setOffset(offset, attr, delta) {
         var normalizedAttr = normalize[attr];
         offset[normalize[attr]] = normalizedAttr === attr ? delta : -delta;
     }

     Reflow.prototype._addGridOffset = function (cell, elt, scrollPos, orthogonalPos, moveData) {
         /// <summary> Helper function handles the case when an item moves to a new column.  Pushes appropriate cells to
         /// the provided arrays.</summary>
         /// <param name="cell" type="G.Cell" />
         /// <param name="elt" type="HTMLElement" />
         /// <param name="scrollPos" type="Number" />
         /// <param name="orthogonalPos" type="Number" />
         /// <param name="moveData" type="MoveData" />
         var priorGridIndex = cell.priorGridIndex,
             priorColumn,
             newColumn;
         if (priorGridIndex !== -1 &&
             (priorColumn = this._layout.calculateColumn(priorGridIndex)) !==
             (newColumn = this._layout.calculateColumn(cell.gridIndex))) {
             var orthogonalExtent = this._layout.getOrthogonalExtent(), 
                 offset = {},
                 actualStart;

             if (priorColumn > newColumn) {
                 actualStart = orthogonalExtent + orthogonalPos;
             } else {
                 actualStart = orthogonalPos - orthogonalExtent;
             }
             setOffset(offset, this._scrollableAttr, 0);
             setOffset(offset, this._orthogonalAttr, actualStart - orthogonalPos);
             moveData.moves.push({element: elt, offset: offset });
             return { priorColumn: priorColumn, newColumn: newColumn };
         }
         // If we're staying int the same colum, this is equivalent to a list move animation.
         this._addListOffset(cell, elt, scrollPos, orthogonalPos, moveData);
         return null;
     };

     Reflow.prototype._addSnakingOffset = function (/*@type(G.Cell)*/cell, priorColumn, newColumn, offset) {
         var orthogonalExtent = this._layout.getOrthogonalExtent();
         var cloneEnd = priorColumn > newColumn ? 
                        cell.orthogonalPos - orthogonalExtent : orthogonalExtent + cell.orthogonalPos;
         setOffset(offset, this._scrollableAttr, 0);
         setOffset(offset, this._orthogonalAttr, cell.orthogonalPos - cloneEnd);
         return cloneEnd;
     };

     Reflow.prototype._addUnclonedOffset = function (/*@type(G.Cell)*/cell, elt, scrollPos, orthogonalPos, /*@type(MoveData)*/moveData) {
         var priorGridIndex = cell.priorGridIndex, priorColumn, newColumn;
         if (priorGridIndex !== -1 &&
             (priorColumn = this._layout.calculateColumn(priorGridIndex)) !==
             (newColumn = this._layout.calculateColumn(cell.gridIndex))) {
             var offset = {};
             this._addSnakingOffset(cell, priorColumn, newColumn, offset);
             moveData.moves.push({ element: elt, offset: offset });
         }
     };

     Reflow.prototype._addClonedOffset = function (cell, elt, scrollPos, orthogonalPos, moveData) {
         /// <summary> Performs the same work as _addGridOffset, but also performs the clone snaking</summary>
         var columnData = this._addGridOffset(cell, elt, scrollPos, orthogonalPos, moveData);
         if (columnData !== null) {
             var orthogonalExtent = this._layout.getOrthogonalExtent(), 
                 cloneNode = cloneElement(elt),
                 cloneStyle = cloneNode.style,
                 offset = {},
                 cloneEnd = this._addSnakingOffset(cell, columnData.priorColumn, columnData.newColumn, offset);

             this._canvas.appendChild(cloneNode);
             cloneStyle[this._scrollableAttr] = cell.scrollablePos.toString() + "px";
             cloneStyle[this._orthogonalAttr] = cloneEnd.toString() + "px";
             moveData.clones.push(cloneNode);
             moveData.moves.push({element: cloneNode, offset: offset });
         }
     };

     Reflow.prototype._addListOffset = function (/*@type(Cell)*/cell, elt, scrollPos, orthogonalPos, moveData) {
         /// <param name="moveData" type="MoveData" />
         var offset = {};
         setOffset(offset, this._scrollableAttr, cell.scrollablePos - scrollPos);
         setOffset(offset, this._orthogonalAttr, cell.orthogonalPos - orthogonalPos);
         moveData.moves.push({ element: elt, offset: offset });
         validateMove(moveData.moves[moveData.moves.length - 1]);
     };

     Reflow.prototype.reflow = function (removed, moved, inserted, outerCells) {
         this._animatedReflow(removed, moved, inserted, outerCells);
     };

     function validateMove (move) {
         /// <param name="move" type="ElementOffset" />
         var offset = move.offset;
         Debug.assert(offset.top !== 0 || offset.left !== 0);
     }

     var MoveProcessor = function (reflow, addOffset, layout, moveData, cells) {
         this._reflow = /*@static_cast(Reflow)*/reflow;
         this._addOffset = /*@static_cast(Function)*/addOffset;
         this._layout = /*@static_cast(G.Layout)*/layout;
         this._moveData = moveData;
         this._gridIndices = cells.map(Cell.getGridIndex);
         this._cells = cells;
     };

     MoveProcessor.prototype._processMove = function (/*@type(G.Cell)*/cell, index) {
         var /*@type(G.Layout)*/layout = this._layout;
         // We could have scrolled by the time the remove animation completes, so make sure we're dealing with
         // valid (on-screen/unmoved) nodes.
         if (cell.gridIndex === this._gridIndices[index]) {
             var elt = cell.getElement();
             if (elt) {
                 var eltStyle = elt.style,
                     gridIndex = cell.gridIndex,
                     priorGridIndex = cell.priorGridIndex,
                     scrollPos =  layout.calculateScrollPos(gridIndex),
                     orthogonalPos =  layout.calculateOrthogonal(layout.calculateRow(gridIndex));

                 this._addOffset.call(this._reflow, cell, elt, scrollPos, orthogonalPos, this._moveData);
                 layout.setOrthogonalPos(cell, orthogonalPos, eltStyle);
                 layout.setScrollablePos(cell, scrollPos, eltStyle);
             }
         }
     };

     MoveProcessor.prototype.processMoves = function () {
         this._cells.forEach(this._processMove, this);
     };

     Reflow.prototype._animatedReflow = function (removed, moved, inserted, outerCells) {
         /// <summary> Animates the reflows as needed by the grid.  Performs logic to check if we should elide "column
         /// calculations" when we're a list (grid of one column)</summary>
         /// <param name="moved" type="Array">moved cells</param>
         /// <param name="inserted" type="Array">inserted cells</param>
         /// <param name="removed" type="Array">removed cells</param>
         /// <param name="outerCells" type="Array">Cells that moved outside the grid's view bounds</param>
         NoShip.People.etw("abTailoredGridAnimation_run");
         Debug.assert(!this._animating);
         this._animating = true;
         var movedHandler = (this._layout.getRows() === 1) ? this._addListOffset : this._addClonedOffset,
             outerMoveHandler = (this._layout.getRows() === 1) ? this._addListOffset : this._addUnclonedOffset,
             removedElems = /*@static_cast(Array)*/removed.map(Cell.getElement),
             layout = this._layout,
             that = this,
             scrollableAttr = this._scrollableAttr,
             orthogonalAttr = this._orthogonalAttr,
             moveData = { clones: [], moves: [] },
             movedProcessor = new MoveProcessor(this, movedHandler, layout, moveData, moved),
             outerProcessor = new MoveProcessor(this, outerMoveHandler, layout, moveData, outerCells),
             outerGridIndices = outerCells.map(Cell.getGridIndex),
             insertedGridIndices = inserted.map(Cell.getGridIndex);

         removedElems.forEach(function (/*@type(HTMLElement)*/elt) { elt.style.opacity = "0"; });
         var animateRemove = (removed.length > 0 ? A.deleteFromList(removedElems) : Promise.wrap());

         animateRemove.done(function () {
             removed.forEach(removeCell);
             removedElems.forEach(revertOpacity);
             movedProcessor.processMoves();
             outerProcessor.processMoves();

             Debug.call(moveData.moves.forEach, moveData.moves, validateMove);

             var repositionAnimation = (moveData.moves.length > 0) ? animateReposition(moveData.moves) : Promise.wrap();
             var canvas = layout.getCanvas();

             repositionAnimation.done(function () {
                 for (var i = 0; i < moveData.clones.length; i++) {
                     try {
                         canvas.removeChild(moveData.clones[i]);
                     } catch (e) {
                         // removeChild will throw a NotFoundError exception if the element is not a child at the time of the remove call. This can
                         // happen here when doing a search on the all contacts page with a connected GAL account.
                         // In that case we may perform a search which returns enough results to trigger a reflow. If a GAL Search Button was present then
                         // it would be reflowed. However, if during the reflow (prior to .done being called) we trigger another search then the GAL Search
                         // Button may be removed from the canvas. When .done is finally called we'd attempt to remove the GAL Search Button stored in the
                         // clones list but, since it is no longer a child of the canvas, it will result in the NotFoundError exception being thrown.
                         if (e.name !== "NotFoundError") {
                             throw e;
                         }
                     }
                 }

                 outerCells.forEach(removeCell);
                 var insertedElements = [];
                 inserted.forEach(function (/*@type(G.Cell)*/cell, i) {
                     // We could have scrolled by the time the remove animation complets, so make sure we're dealing
                     // with valid (on-screen/unmoved) nodes.
                     var elt;
                     if (cell.gridIndex === insertedGridIndices[i] && !Jx.isNullOrUndefined(elt = cell.getElement())) {
                         insertedElements.push(elt);
                         cell.position();
                     }
                 });
                 if (insertedElements.length > 0) {
                     A.addToList(insertedElements).done(function () {
                     that._completeAnimation();
                     }, function (err) {
                         Jx.log.info("add animation failed.  Switching to unanimatedReflow");
                         that._onAddErr(inserted, outerCells);
                     });
                 } else {
                     that._completeAnimation();
                 }
             }, function (err) {
                 Jx.log.info("move animation failed.  Switching to unanimatedReflow");
                 moveData.clones.forEach(canvas.removeChild, canvas);
                 that._onMoveErr(moved, inserted, outerCells);
             });
         }, function (err) {
             Jx.log.info("removal animation failed.  Switching to unanimatedReflow");
             that._onRemoveErr(removed, moved, inserted, outerCells);
         });
     };

     Reflow.prototype._onTimeoutComplete = function () {
         this._animating = false;
         this._timeoutId = -1;
         this._grid.onAnimationComplete();
     };

     Reflow.prototype._completeAnimation = function () {
         /// <summary> We want to prevent reflow animations from running more frequently than 4 seconds. This timeout
         /// ensures that the grid won't call another reflow animation until that time has passed</summary>
         this._timeoutId = setTimeout(this._boundTimeoutComplete, 4000);
     };

     Reflow.prototype.resetAnimationTimeout = function () {
         if (this._timeoutId !== -1) {
             clearTimeout(this._timeoutId);
             this._onTimeoutComplete();
         } else if (this._animating) {
             // We're in the middle of a reflow animation. Make our first animation completion callback ignore the
             // timeout, and afterwards revert to abiding by the timeout
             var priorCompleteAnimation = this._completeAnimation;
             this._completeAnimation = function () {
                 this._completeAnimation = priorCompleteAnimation;
                 this._onTimeoutComplete();
             };
         }
     };

});
