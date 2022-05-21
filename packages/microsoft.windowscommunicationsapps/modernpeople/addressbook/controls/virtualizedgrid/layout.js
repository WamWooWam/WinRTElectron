
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../../Shared/WinJS/WinJS.ref.js" />
/// <reference path="../../../Shared/JSUtil/Namespace.js" />
/// <reference path="Pool.js" />
/// <reference path="../Scheduler/JobSet.js" />
/// <reference path="../Scheduler/Scheduler.js" />
/// <reference path="../../UnitTest/MockNode.js" />
/// <reference path="../Viewport/Position.ref.js" />
/// <reference path="../Viewport/Viewport.js" />
/// <reference path="GroupListener.js" />
/// <reference path="GridCell.js" />
/// <reference path="VirtualizedGrid.Init.ref.js" />
/// <reference path="GridNavigation.js" />
/// <reference path="../../../Shared/JSUtil/Callback.js" />
/// <reference path="../Collections/BaseCollection.js" />
/// <reference path="../Viewport/Viewport.js" />

/// <disable>JS2058.DoNotUseIncrementAndDecrementOperators,JS3057.AvoidImplicitTypeCoercion,JS2076.IdentifierIsMiscased</disable>
/// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>
/// <disable>JS3053.IncorrectNumberOfArguments</disable>
/// <disable>JS2031.UseStrictEqualityOperators</disable> nodeTopIsEqual requires (==)

Jx.delayDefine(People.Grid, "Layout", function () {
    
    var P = window.People;
    var G = P.Grid;
    var U = WinJS.Utilities;
    var O = P.Orientation;

    var Layout = G.Layout = /* @constructor */function (viewport, containerElement, canonicalType) {
        /// <summary> Provides column order (horizontal) layout logic for a virtualized grid. </summary>
        /// <param name="viewport" type="P.Viewport">The container element of the grid</param>
        /// <param name="containerElement" type="HTMLElement">The container element of the grid</param>
        /// <param name="canonicalType" type="String">The canonical type used to determine width and height of individual items</param>
        this._viewport = viewport;
        this._containerElement = containerElement;

        this._canonicalType = canonicalType;
        this._rows = 0;
        this.dir = "ltr";

        // Set in initialize
        this._grid = /* @static_cast(G.VirtualizedGrid) */null;
        this._pooledCells = /* @static_cast(G.PooledCells) */null;
        this._itemScrollableExtent = 0;
        this._itemOrthogonalExtent = 0;
        this._containerOrthogonalExtent = 0;
        this._scrollableExtent = 0;
        this._orthogonalExtent = 0;
        this._wrapperSpacer = 0;
        this._canvas = /*@static_cast(HTMLElement)*/null;
        this._wrapper = /*@static_cast(HTMLElement)*/null;
        this._leadingStylerEdge = /*@static_cast(HTMLElement)*/null;
        this._visibleStylerBlock = /*@static_cast(HTMLElement)*/null;
        this._orthogonalAttr = null;
        this._scrollableAttr = null;
        this._dimensions = /*@static_cast(Dimension)*/null;
        this._coverTemplate = /*@static_cast(HTMLElement)*/null;
        this._covers = [];
        this._ariaFlowStart = /*@static_cast(HTMLElement)*/null;
        this._ariaFlowEnd = /*@static_cast(HTMLElement)*/null;
        this._lastBackgroundPosition = 0;

        Debug.only(Object.seal(this));
    };

    // DOM attributes for calculating dimensions as determined by orientation and direction.
    var dimension = G.Layout._dimension = {};
    dimension[O.horizontal] = /*@static_cast(Dimension)*/{
        scrollableOffset: {
            rtl: ["marginRight", "paddingRight"],
            ltr: ["marginLeft", "paddingLeft"]
        },
        orthogonalOffset: "offsetTop",
        scrollableExtentAttr: "width",
        orthogonalExtentAttr: "height",
        getScrollableExtent: U.getTotalWidth,
        getOrthogonalExtent: U.getTotalHeight,
        getOrthogonalContent: U.getContentHeight,
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
    dimension[O.vertical] = /*@static_cast(Dimension)*/{
    scrollableOffset: {
        rtl: ["marginTop", "paddingTop"],
        ltr: ["marginTop", "paddingTop"]
    },
    orthogonalOffset: "offsetLeft",
    scrollableExtentAttr: "height",
    orthogonalExtentAttr: "width",
    getScrollableExtent: U.getTotalHeight,
    getOrthogonalExtent: U.getTotalWidth,
    getOrthogonalContent: U.getContentWidth,
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

    Layout.prototype.initialize = function (pooledCells, grid) {
        /// <summary> Initialize the DOM, and set our pooledCells member</summary>
        /// <param name="pooledCells" type="G.PooledCells"></param>
        this._pooledCells = pooledCells;
        this._grid = grid;
        this._initializeDom();
    };

    Layout.prototype.calculateSize = function (maxGridIndex) {
        /// <summary> Given the maximum gridIndex, return the corresponding size the grid should take up</summary>
        /// <param name="maxGridIndex" type="Number"></param>
        return Math.ceil(maxGridIndex / this._rows) * this._itemScrollableExtent;
    };

    Layout.prototype.getExtent = function () {
        return this._scrollableExtent;
    };

    Layout.prototype.getItemScrollableExtent = function () {
        return this._itemScrollableExtent;
    };

    Layout.prototype.getLowerBoundIndex = function (scrollPos) {
        /// <summary> Takes a position in the scrolling direction and converts it to a gridIndex in the topmost
        /// leftmost (in LTR) portion of the grid </summary>
        /// <param name="scrollPos" type="Number"></param>
        return Math.max(0, Math.floor(scrollPos / this._itemScrollableExtent) * this._rows);
    };

    Layout.prototype.getUpperBoundIndex = function (scrollPos) {
        /// <summary> Takes a position in the scrolling direction and converts it to a gridIndex in the bottom-most
        /// rightmost (in LTR) portion of the grid </summary>
        /// <param name="scrollPos" type="Number"></param>
        return Math.ceil(scrollPos / this._itemScrollableExtent) * this._rows - 1;
    };

    Layout.prototype.getCanvas = function () {
        return this._canvas;
    };

    Layout.prototype.getVisibleBlock = function () {
        return this._visibleStylerBlock;
    };

    Layout.prototype.getDimensions = function () {
        return this._dimensions;
    };

    Layout.prototype.getScrollableAttr = function () {
        return this._scrollableAttr;
    };

    Layout.prototype.getOrthogonalAttr = function () {
        return this._orthogonalAttr;
    };

    Layout.prototype.setSize = function (newExtent, gridIndex) {
        if (newExtent !== this._scrollableExtent) {
            this._containerElement.style[this._dimensions.scrollableExtentAttr] = newExtent + "px";
            var difference = newExtent - this._scrollableExtent;
            this._scrollableExtent = newExtent;
            this._viewport.extentChanged(this, this.calculateScrollPos(gridIndex) + this._itemScrollableExtent, difference);
        }
    };

    Layout.prototype._createElements = function () {
        var ariaFlowStartId = "ariaFlowStart" + Jx.uid();
        var ariaFlowEndId = "ariaFlowEnd" + Jx.uid();

        this._containerElement.innerHTML =
                "<div class='gridWrapper'>" +
                    "<div class='gridStyler'>" +
                        "<div class='leadingEdge'></div><div class='visibleBlock'></div><div class='trailingEdge'></div>" +
                    "</div>" +
                    "<div id='" + ariaFlowStartId + "'></div>" +
                    "<div class='gridCanvas'></div>" +
                    "<div id='" + ariaFlowEndId + "'></div>" +
                "</div>";

        this._wrapper = this._containerElement.querySelector(".gridWrapper");
        this._leadingStylerEdge = this._containerElement.querySelector(".leadingEdge");
        this._visibleStylerBlock = this._containerElement.querySelector(".visibleBlock");
        this._canvas = this._containerElement.querySelector(".gridCanvas");
        this._ariaFlowStart = this._containerElement.querySelector("#" + ariaFlowStartId);
        this._ariaFlowEnd = this._containerElement.querySelector("#" + ariaFlowEndId);
    };

    Layout.prototype._initializeDom = function () {
        /// <summary> Creates the canvas element onto which all cells are placed.  it also calculates the width/height
        /// of individual items by creating a cell of canonicalType. </summary>
        var orientation = this._viewport.getOrientation(),
                dimensions = this._dimensions = /*@static_cast(Dimension)*/dimension[orientation];

        this._createElements();

        var /*@type(G.Cell)*/cell = this._pooledCells.getPool(this._canonicalType).pop(),
                elt = cell.node.getElement(),
                eltStyle = elt.style;

        // Make element hidden so it isn't seen in DOM
        eltStyle.visibility = "hidden";
        cell.show();

        var containerStyle = getComputedStyle(this._containerElement);
        var dir = this.dir = containerStyle.direction;

        this._scrollableAttr = dimensions.scrollableAttr[dir];
        this._orthogonalAttr = dimensions.orthogonalAttr[dir];

        var computedStyle = getComputedStyle(elt);
        this._itemScrollableExtent = dimensions.getScrollableExtent(elt);
        this._itemOrthogonalExtent = dimensions.getOrthogonalExtent(elt);
        this._containerOrthogonalExtent = dimensions.getOrthogonalContent(this._containerElement);
        // The visible block should be wide enough to cover one column before and one column after the on screen area.
        var visibleBlockWidth = this._viewport.getViewportExtent() + this._itemScrollableExtent * 2;
        this._visibleStylerBlock.style[dimensions.scrollableExtentAttr] = visibleBlockWidth + "px";
        Jx.log.info("Grid.Layout, extent: " + this._containerOrthogonalExtent);
        this._rows = this._calculateRows();
        this._setCanvasOrthogonalExtent();

        // Put the item back in the pool
        eltStyle.visibility = "";
        cell.hide();
        cell.returnToPool();
    };

    Layout.prototype.hydrateScrollPosition = function (scrollPos) {
        ///<summary>Hydrate the scroll position</summary>
        ///<param name="scrollPos" type="Number">The scroll position of the layout</param>
        if (scrollPos > 0 && this._visibleStylerBlock.currentStyle.display !== "none") {
            // Leading edge width should be one column smaller than the scroll position so the visible block starts from one column ahead of on screen area.
            var leadingEdgeWidth = scrollPos - this._itemScrollableExtent;
            if (leadingEdgeWidth > 0) {
                this._leadingStylerEdge.style[this._dimensions.scrollableExtentAttr] = leadingEdgeWidth + "px";
            }
        }
    };

    Layout.prototype._setCanvasOrthogonalExtent = function () {
        this._orthogonalExtent = this._rows * this._itemOrthogonalExtent;
        Jx.log.info("Grid.Layout, canvas extent: " + this._orthogonalExtent);
        this._canvas.style[this._dimensions.orthogonalExtentAttr] = this._orthogonalExtent + "px";
    };

    Layout.prototype.getAriaFlowStart = function () {
        return this._ariaFlowStart;
    };

    Layout.prototype.getAriaFlowEnd = function () {
        return this._ariaFlowEnd;
    };

    Layout.prototype.getOrthogonalExtent = function () {
        return this._orthogonalExtent;
    };

    Layout.prototype.getCanvasScrollableOffset = function () {
        var wrapper = this._wrapper,
            style = getComputedStyle(wrapper);

        var wrapperScrollableOffset = this._dimensions.scrollableOffset[this.dir].reduce(function (sum, attr) {
            return sum + U.convertToPixels(wrapper, style[attr]);
        }, 0);

        return wrapperScrollableOffset;
    };

    Layout.prototype.getGridIndexFromPosition = function (position) {
        /// <summary> Returns gridIndex of the cell at the given position. </summary>
        /// <param name="position" type="Position" />
        /// <returns type="Number" />
        position.orthoPos -= this._canvas[this._dimensions.orthogonalOffset];

        return this.getLowerBoundIndex(position.scrollPos) +
                                Math.min(this._rows - 1, Math.max(0, Math.floor(position.orthoPos / this._itemOrthogonalExtent)));
    };

    Layout.prototype.getPositionFromCell = function (cell) {
        /// <summary> Returns a SemanticZoom compatible rectangle given an element </summary>
        /// <param name="cell" type="G.Cell" />
        /// <returns type="Position" />
        return this._getPositionFromCoordinates(cell.scrollablePos, cell.orthogonalPos);
    };

    Layout.prototype.getPositionFromGridIndex = function (gridIndex) {
        /// <summary> Returns a SemanticZoom compatible rectangle given a gridIndex </summary>
        /// <param name="gridIndex" type="Number" />
        /// <returns type="Position" />
        return this._getPositionFromCoordinates(this.calculateScrollPos(gridIndex), this.calculateOrthogonal(this.calculateRow(gridIndex)));
    };

    Layout.prototype._getPositionFromCoordinates = function (scrollablePos, orthogonalPos) {
        /// <summary> Returns a SemanticZoom compatible rectangle given a coordinate </summary>
        /// <param name="scrollablePos" type="Number" />
        /// <param name="orthogonalPos" type="Number" />
        /// <returns type="Position" />
        var position = {
            scrollPos: scrollablePos,
            orthoPos: orthogonalPos
        };

        position[this._dimensions.scrollableExtentAttr] = this._itemScrollableExtent;
        position[this._dimensions.orthogonalExtentAttr] = this._itemOrthogonalExtent;
        return position;
    };

    Layout.prototype.getItemOrthogonalExtent = function () {
        return this._itemOrthogonalExtent;
    };

    Layout.prototype.setOrthogonalPos = function (cell, newPos, elementStyle) {
        /// <summary> Sets the orthogonal position of the cell.  Doesn't do work if cell is already there.  Position is
        /// parameterized to avoid recomputation of the position from gridIndex.  Similary elementStyle is
        /// parameterized to avoid gratuitous access of the style property of the element</summary>
        /// <param name="cell" type="G.Cell" />
        /// <param name="newPos" type="Number">new orthogonal position in pixels</param>
        /// <param name="elementStyle" type="Style">element's style.  Passed in to avoid multiple .style accesses of
        /// the DOM elemnt</param>
        Debug.assert(elementStyle === cell.getElement().style);
        if (cell.orthogonalPos !== newPos) {
            cell.orthogonalPos = newPos;
            elementStyle[this._orthogonalAttr] = newPos + "px";
        }
    };

    Layout.prototype.setScrollablePos = function (cell, newPos, elementStyle) {
        /// <summary> Sets the scrollable position of the cell.  Doesn't do work if cell is already there.  Position is
        /// parameterized to avoid recomputation of the position from gridIndex.  Similary elementStyle is
        /// parameterized to avoid gratuitous access of the style property of the element</summary>
        /// <param name="cell" type="G.Cell" />
        /// <param name="newPos" type="Number">new orthogonal position in pixels</param>
        /// <param name="elementStyle" type="Style">element's style.  Passed in to avoid multiple .style accesses of
        /// the DOM elemnt</param>
        Debug.assert(elementStyle === cell.getElement().style);
        if (cell.scrollablePos !== newPos) {
            cell.scrollablePos = newPos;
            elementStyle[this._scrollableAttr] = newPos + "px";
        }
    };

    Layout.prototype._setOrthogonalPos = function (cell, elementStyle) {
        this.setOrthogonalPos(cell, this.calculateOrthogonal(this.calculateRow(cell.gridIndex)), elementStyle);
    };

    Layout.prototype._setScrollablePos = function (cell, elementStyle) {
        this.setScrollablePos(cell, this.calculateScrollPos(cell.gridIndex), elementStyle);
    };

    Layout.prototype.calculateScrollPosEx = function (gridIndex, rows) {
        return this._calculateColumn(gridIndex, rows) * this._itemScrollableExtent;
    };

    Layout.prototype.calculateScrollPos = function (gridIndex) {
        return this.calculateScrollPosEx(gridIndex, this._rows);
    };

    Layout.prototype.calculateColumn = function (gridIndex) {
        return this._calculateColumn(gridIndex, this._rows);
    };

    Layout.prototype._calculateColumn = function (gridIndex, rows) {
        return Math.floor(gridIndex / rows);
    };

    Layout.prototype.calculateRow = function (gridIndex) {
        return gridIndex % this._rows;
    };

    Layout.prototype.calculateOrthogonal = function (row) {
        return row * this._itemOrthogonalExtent;
    };

    Layout.prototype.positionCell = function (cell) {
        /// <summary> Position cell according to its gridIndex.</summary>
        /// <param name="cell" type="G.Cell"></param>
        var elementStyle = cell.node.getElement().style;
        this._setOrthogonalPos(cell, elementStyle);
        this._setScrollablePos(cell, elementStyle);
    };

    Layout.prototype.prepareCell = function (cell, gridIndex) {
        this._grid.prepareCell(cell, gridIndex, this.calculateRow(gridIndex));
    };

    Layout.prototype.createCell = function (type, gridIndex) {
        var row = this.calculateRow(gridIndex),
                orthogonalPos = this.calculateOrthogonal(row),
                cell = this._pooledCells.getCell(type, orthogonalPos);

        this._grid.prepareCell(cell, gridIndex, row);
        return cell;
    };

    Layout.prototype.getRows = function () {
        return this._rows;
    };

    Layout.prototype._calculateRows = function () {
        var wrapper = this._wrapper,
                style = getComputedStyle(wrapper);

        this._wrapperSpacer = this._dimensions.orthogonalSpacers.reduce(function (sum, attr) {
            return sum + U.convertToPixels(wrapper, style[attr]);
        }, 0);
        return Math.max(1, Math.floor((this._containerOrthogonalExtent - this._wrapperSpacer) / this._itemOrthogonalExtent));
    };

    Layout.prototype.onResize = function () {
        var orthogonalExtent = this._dimensions.getOrthogonalContent(this._containerElement);
        Jx.log.info("Grid.Layout.onResize, extent: " + orthogonalExtent);

        if (orthogonalExtent > 0 && orthogonalExtent !== this._containerOrthogonalExtent) {
            this._containerOrthogonalExtent = orthogonalExtent;
            var rows = this._calculateRows();
            if (rows !== this._rows) {
                var priorRowCount = this._rows;
                this._rows = rows;
                this._setCanvasOrthogonalExtent();
                this._grid.onRowsChanged(priorRowCount);
            }
        }
    };

    Layout.prototype._getCoverTemplate = function () {
        if (!this._coverTemplate) {
            var template = this._coverTemplate = document.createElement("div");
            template.className = "patch";
            template.style.position = "absolute";
            template.style[this._dimensions.scrollableExtentAttr] = this._itemScrollableExtent + "px";
            template.style[this._dimensions.orthogonalExtentAttr] = this._itemOrthogonalExtent + "px";
        }
        return this._coverTemplate;
    };

    Layout.prototype.coverEmptySpaces = function (/*@type(Array)*/holes) {
        var oldCovers = this._covers,
                newCovers = oldCovers.splice(0, holes.length),
                fragment = null,
                template = null;

        oldCovers.forEach(function (cover) {
            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            cover.removeNode(true);
        });

        if (holes.length > newCovers.length) {
            fragment = document.createDocumentFragment();
            template = this._getCoverTemplate();
        }

        this._covers = holes.map(/*@bind(Layout)*/function (gridIndex, i) {
            var /*@type(HTMLElement)*/cover = newCovers[i];
            if (!cover) {
                cover = template.cloneNode(true);
                fragment.appendChild(cover);
            }
            cover.style[this._scrollableAttr] = this.calculateScrollPos(gridIndex) + "px";
            cover.style[this._orthogonalAttr] = this.calculateOrthogonal(this.calculateRow(gridIndex)) + "px";
            return cover;
        }, this);

        if (fragment) {
            this._canvas.appendChild(fragment);
        }
    };

    Layout.prototype.adjustBackground = function (minVisibleIndex) {
        // Keeping the background in line with the current scroll position ensures the background stays aligned with what is currently showing in the grid.
        // Though the background and items in the grid are the same width, there appear to be rounding differences between background tiling and item layout, particularly
        // non-100% zoom (high DPI).
        var backgroundPosition = this.calculateScrollPos(minVisibleIndex);
        if (this.dir === "rtl" && this._viewport.getOrientation() === O.horizontal) {
            backgroundPosition = this._scrollableExtent - backgroundPosition;
        }

        if (Math.abs(backgroundPosition - this._lastBackgroundPosition) > 10000) {  // We only need to adjust every 10000px or so, not on every scroll
            Jx.log.warning("Adjusting background position to " + backgroundPosition);
            this._canvas.style[this._dimensions.scrollableBackgroundPosition] = backgroundPosition + "px"; 
            this._lastBackgroundPosition = backgroundPosition;
        }
    };

});
