//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    window.__extends = function(d, b) {
        if (!b)
            throw"Missing <reference> tag for class: " + getNameOfFunction(d.toString()) + ". Make sure any base class is referenced with a <reference path='pathToBaseClass.ts'> tag";
        for (var p in b)
            b.hasOwnProperty(p) && (d[p] = b[p]);
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };
    function getNameOfFunction(functionBody) {
        var indexOfFirstParentheses = functionBody.indexOf("("),
            initialLength = 9;
        return functionBody.substring(initialLength, indexOfFirstParentheses)
    }
})();