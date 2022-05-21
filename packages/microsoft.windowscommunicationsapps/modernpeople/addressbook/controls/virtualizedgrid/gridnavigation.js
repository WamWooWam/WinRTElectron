
//
// Copyright (C) Microsoft. All rights reserved.
//

Jx.delayDefine(People.Grid, "Navigation", function () {

"use strict";
/// <disable>JS2076.IdentifierIsMiscased</disable>
var G = window.People.Grid;
var O = window.People.Orientation;

// keyDownNavigationArgs are used as the args to Grid.Navigate.  Given orientation and
// direction, it maps keydown events to the appropriate scrollableDelta and orthogonalDelta.
var keyDownNavigationArgs = { };
keyDownNavigationArgs[O.horizontal] = {
    ltr: { Left: [-1, 0], Up: [ 0, -1], Right: [ 1, 0], Down: [ 0, 1] },
    rtl: { Left: [ 1, 0], Up: [ 0, -1], Right: [-1, 0], Down: [ 0, 1] }
};
keyDownNavigationArgs[O.vertical] = {
    ltr: { Left: [ 0,-1], Up: [-1,  0], Right: [ 0, 1], Down: [ 1, 0] },
    rtl: { Left: [ 0, 1], Up: [-1,  0], Right: [ 0,-1], Down: [ 1, 0] }
};

var jumpMap = {
    Home: true, // Go to beginning
    End:  false
};

var Navigation = G.Navigation = /*@constructor*/function (grid, dir, orientation) {
    /// <summary> GridNavigation is a helper object for handling keyboard navigation in the VirtualizedGrid. </summary>
    /// <param name="grid" type="G.VirtualizedGrid"></param>
    /// <param name="dir" type="String">"ltr" or "rtl"</param>
    /// <param name="orientation" type="Number">A member of the enum: People.Orientation</param>
    Debug.assert(/ltr|rtl/.test(dir));
    Debug.assert(orientation === People.Orientation.horizontal || orientation === People.Orientation.vertical);

    this._navigationArgs = keyDownNavigationArgs[orientation][dir];
    this._grid = grid;
    this._listener = null;

    Debug.only(Object.seal(this));
};
/// <enable>JS2076.IdentifierIsMiscased</enable>

Navigation.prototype.bindToElement = function (elt) {
    /// <param name="elt" type="HTMLElement"></param>
    this._listener = /*@bind(Navigation)*/ function onKeyDown (ev) {
        /// <param name="ev" type="Event" />
        var args = this._navigationArgs[ev.key];
        if (args !== undefined) {
            this._grid.navigate.apply(this._grid, args);
            // Prevent the DOM from scrolling when moving to an adjacent element in the grid.
            ev.preventDefault();
        } else {
            var jumpToStart = jumpMap[ev.key];
            if (jumpToStart !== undefined) {
                this._grid.jumpTo(jumpToStart);
                ev.preventDefault();
            }
        }
    }.bind(this);

    elt.addEventListener("keydown", this._listener, false);
};

Navigation.prototype.unbindFromElement = function (elt) {
    /// <param name="elt" type="HTMLElement"></param>
    elt.removeEventListener("keydown", this._listener, false);
    this._listener = null;
};

});
