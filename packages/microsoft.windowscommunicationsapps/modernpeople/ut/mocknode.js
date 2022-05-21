
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../Shared/JSUtil/Namespace.js"/>

(function () {
    var P = People;

    var MockNode = P.MockNode = /*@constructor*/function (handler, element) {
        this._handler = handler;
        this._element = element;
    };

    MockNode.prototype._handler = /* @static_cast(P.Handler) */null;
    MockNode.prototype._element = /* @static_cast(HTMLElement) */null;

    MockNode.prototype.getHandler = function () {
        return this._handler;
    };

    MockNode.prototype.getElement = function () {
        /// <summary> Returns the element associated with this node</summary>
        /// <returns type="HTMLElement"></returns>
        return this._element;
    };

    MockNode.prototype.getAlignmentOffset = function () {
        return 0;
    };

    MockNode.prototype.dispose = function () { };

    Object.defineProperty(MockNode.prototype, "id", { get: function () { return this._element.id; }, enumerable: true });
})();
