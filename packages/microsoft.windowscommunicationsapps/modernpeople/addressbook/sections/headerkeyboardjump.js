
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../Controls/VirtualizedGrid/VirtualizedGrid.js"/>

/// <disable>JS3092.DeclarePropertiesBeforeUse</disable>

Jx.delayDefine(People, "HeaderKeyboardJump", function () {

    var P = window.People;

    P.HeaderKeyboardJump = /*@constructor*/function (element, grid, collection) {
        ///<param name="element" type="HTMLElement"/>
        ///<param name="grid" type="P.Grid.VirtualizedGrid"/>
        ///<param name="collection" type="P.Collection"/>
        this._element = element;
        this._grid = grid;
        this._collection = collection;
        this._onKeyDown = this._onKeyDown.bind(this);
        window.addEventListener("keydown", this._onKeyDown, false);
    };

    P.HeaderKeyboardJump.prototype.dispose = function () {
        window.removeEventListener("keydown", this._onKeyDown, false);
    };

    P.HeaderKeyboardJump.prototype._onKeyDown = function (/*@type(KeyboardEvent)*/ev) {
        if (isAncestor(this._element, ev.srcElement) || isAncestor(ev.srcElement, this._element)) {
            var letter = ev.char.toLocaleUpperCase();
            for (var i = 0, len = this._collection.length; i < len; i++) {
                var item = this._collection.getItem(i);
                var data = item.header.data;
                if (data && data.label && letter.localeCompare(data.label) === 0 && item.collection.length > 0) {
                    this._grid.scrollItemIntoView(i, 0);
                    break;
                }
            }
        }
    };

    function isAncestor (ancestor, candidate) {
        while (candidate !== ancestor && candidate !== null) {
            candidate = candidate.parentNode;
        }
        return candidate === ancestor;
    }

});
